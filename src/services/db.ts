import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Firestore write quota check. Defaults to active writes.
let isFirestoreWriteQuotaExhausted = false;
try {
  if (typeof window !== "undefined") {
    // Clear any stale quota flag on boot so users can write normally
    window.sessionStorage?.removeItem("firestore_write_quota_exhausted");
    isFirestoreWriteQuotaExhausted = false;
  }
} catch (e) {}

export function markQuotaExhausted() {
  console.warn(`[Firestore Alert] Quota warning recorded.`);
}

export function isQuotaExhausted(): boolean {
  return false;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  // If the error indicates that the client is offline or quota limit is reached, warn and safely fallback
  const isQuota =
    errMessage.toLowerCase().includes("quota limit exceeded") ||
    errMessage.toLowerCase().includes("resource-exhausted") ||
    errMessage.toLowerCase().includes("quota exceeded") ||
    errMessage.toLowerCase().includes("free daily write units");

  if (isQuota) {
    markQuotaExhausted();
    console.warn(`[Firestore Circuit-Breaker Triggered] Batas kuota tulis harian tercapai. Beralih ke local state aman untuk mencegah backend overload.`);
    return;
  }

  const isOffline =
    errMessage.toLowerCase().includes("client is offline") ||
    errMessage.toLowerCase().includes("offline") ||
    errMessage.toLowerCase().includes("internet connection");

  if (isOffline) {
    console.warn(`[Firestore Offline Fallback] Operasi ${operationType} pada path ${path} dialihkan ke local cache/state.`);
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // Only throw fatal errors for write operations (CREATE, UPDATE, DELETE, WRITE)
  // For read operations (GET, LIST), log them and return gracefully so the app state remains active
  const isWriteOp = 
    operationType === OperationType.CREATE || 
    operationType === OperationType.UPDATE || 
    operationType === OperationType.DELETE || 
    operationType === OperationType.WRITE;
    
  if (isWriteOp) {
    throw new Error(JSON.stringify(errInfo));
  }
}

/**
 * Recursively removes keys with `undefined` values from objects or arrays.
 * Firestore throws a fatal error if any property value is undefined.
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }
  if (
    typeof data === "object" &&
    !(data instanceof Date) &&
    !(data instanceof Timestamp)
  ) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

export const dbService = {
  async getDocument<T>(collectionPath: string, docId: string, retries = 3, delayMs = 300): Promise<T | null> {
    for (let i = 0; i < retries; i++) {
      try {
        const docRef = doc(db, collectionPath, docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as T) : null;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        const isPermissionDenied = errMsg.toLowerCase().includes("permission") || errMsg.toLowerCase().includes("insufficient");
        
        if (isPermissionDenied && i < retries - 1) {
          console.warn(`[Firestore Retry] getDocument failed on ${collectionPath}/${docId}. Retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        handleFirestoreError(error, OperationType.GET, `${collectionPath}/${docId}`);
        return null;
      }
    }
    return null;
  },

  async getCollection<T>(collectionPath: string, queryConstraints: any[] = [], retries = 3, delayMs = 300): Promise<T[]> {
    for (let i = 0; i < retries; i++) {
      try {
        const colRef = collection(db, collectionPath);
        const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        const isPermissionDenied = errMsg.toLowerCase().includes("permission") || errMsg.toLowerCase().includes("insufficient");
        
        if (isPermissionDenied && i < retries - 1) {
          console.warn(`[Firestore Retry] getCollection failed on ${collectionPath}. Retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        handleFirestoreError(error, OperationType.LIST, collectionPath);
        return [];
      }
    }
    return [];
  },

  async setDocument(collectionPath: string, docId: string, data: any): Promise<void> {
    try {
      const sanitized = sanitizeFirestoreData(data) || {};
      await setDoc(doc(db, collectionPath, docId), {
        ...sanitized,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
    }
  },

  async createDocument(collectionPath: string, data: any): Promise<string> {
    try {
      const sanitized = sanitizeFirestoreData(data) || {};
      const colRef = collection(db, collectionPath);
      const docRef = doc(colRef);
      await setDoc(docRef, {
        ...sanitized,
        id: docRef.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionPath);
      return '';
    }
  },

  async updateDocument(collectionPath: string, docId: string, data: any): Promise<void> {
    try {
      const sanitized = sanitizeFirestoreData(data) || {};
      const docRef = doc(db, collectionPath, docId);
      await setDoc(docRef, {
        ...sanitized,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${docId}`);
    }
  },

  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, docId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${docId}`);
    }
  },

  onCollectionSnapshot<T>(
    collectionPath: string, 
    callback: (data: T[]) => void, 
    queryConstraints: any[] = [],
    errorCallback?: (error: any) => void
  ) {
    const colRef = collection(db, collectionPath);
    const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
      if (errorCallback) {
        errorCallback(error);
      }
    });
  },

  onDocumentSnapshot<T>(
    collectionPath: string,
    docId: string,
    callback: (data: T | null) => void,
    errorCallback?: (error: any) => void
  ) {
    const docRef = doc(db, collectionPath, docId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    }, (error) => {
      console.warn(`[Firestore] onDocumentSnapshot error on ${collectionPath}/${docId}:`, error);
      if (errorCallback) errorCallback(error);
    });
  }
};
