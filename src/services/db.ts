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

  // If the error indicates that the client is offline, warn instead of throwing a fatal exception to avoid UI crashes
  if (
    errMessage.toLowerCase().includes("client is offline") ||
    errMessage.toLowerCase().includes("offline") ||
    errMessage.toLowerCase().includes("internet connection")
  ) {
    console.warn(`[Firestore Offline Cache Enabled] Gagal melakukan operasi ${operationType} pada path ${path} karena client sedang offline.`);
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
      await setDoc(doc(db, collectionPath, docId), {
        ...data,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
    }
  },

  async createDocument(collectionPath: string, data: any): Promise<string> {
    try {
      const colRef = collection(db, collectionPath);
      const docRef = doc(colRef);
      await setDoc(docRef, {
        ...data,
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
      const docRef = doc(db, collectionPath, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
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
  }
};
