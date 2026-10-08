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

// Firestore write quota check with persistent session & local storage circuit breaker.
let isFirestoreWriteQuotaExhausted = true;
let quotaExhaustedUntil = Date.now() + 12 * 60 * 60 * 1000;

try {
  if (typeof window !== "undefined") {
    const stored = window.localStorage?.getItem("firestore_write_quota_exhausted_until") ||
      window.sessionStorage?.getItem("firestore_write_quota_exhausted_until");
    if (stored) {
      const until = Number(stored);
      if (Date.now() < until) {
        quotaExhaustedUntil = until;
      }
    } else {
      // First boot on quota exceeded: record 12-hour circuit breaker
      window.localStorage?.setItem("firestore_write_quota_exhausted_until", String(quotaExhaustedUntil));
      window.sessionStorage?.setItem("firestore_write_quota_exhausted_until", String(quotaExhaustedUntil));
    }
  }
} catch (e) {}

export function markQuotaExhausted(durationMs: number = 12 * 60 * 60 * 1000) {
  isFirestoreWriteQuotaExhausted = true;
  quotaExhaustedUntil = Date.now() + durationMs;
  try {
    if (typeof window !== "undefined") {
      window.localStorage?.setItem("firestore_write_quota_exhausted_until", String(quotaExhaustedUntil));
      window.sessionStorage?.setItem("firestore_write_quota_exhausted_until", String(quotaExhaustedUntil));
    }
  } catch (e) {}
  console.warn(`[Firestore Circuit-Breaker Active] Batas kuota tulis Firestore tercapai. Circuit-breaker aktif selama ${Math.round(durationMs / 3600000)} jam; seluruh perubahan data tetap diproses dan tersimpan aman di LocalStorage.`);
}

export function isQuotaExhausted(): boolean {
  if (isFirestoreWriteQuotaExhausted) {
    if (quotaExhaustedUntil > 0 && Date.now() > quotaExhaustedUntil) {
      isFirestoreWriteQuotaExhausted = false;
      quotaExhaustedUntil = 0;
      try {
        window.localStorage?.removeItem("firestore_write_quota_exhausted_until");
        window.sessionStorage?.removeItem("firestore_write_quota_exhausted_until");
      } catch (e) {}
      return false;
    }
    return true;
  }
  return false;
}

// Global listener to immediately activate circuit breaker if Firebase logs or throws quota exhausted
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = String(event?.reason || "");
    if (
      reason.includes("resource-exhausted") ||
      reason.includes("Quota limit exceeded") ||
      reason.includes("quota metric 'Free daily write units")
    ) {
      markQuotaExhausted();
      event.preventDefault();
    }
  });
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
    errMessage.toLowerCase().includes("free daily write units") ||
    errMessage.toLowerCase().includes("maximum backoff delay");

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

const LOCAL_COL_PREFIX = "wf_local_col_";
const DELETED_COL_PREFIX = "wf_deleted_col_";

function getLocalCollectionStore<T>(collectionPath: string): Map<string, T> {
  const map = new Map<string, T>();
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(LOCAL_COL_PREFIX + collectionPath);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((item) => {
            const key = (item?.id || item?.customId || "").trim();
            if (key) map.set(key, item);
          });
        }
      }
    }
  } catch (_) {}
  return map;
}

function saveLocalCollectionStore<T>(collectionPath: string, map: Map<string, T>): void {
  try {
    if (typeof window !== "undefined") {
      const arr = Array.from(map.values());
      localStorage.setItem(LOCAL_COL_PREFIX + collectionPath, JSON.stringify(arr));
    }
  } catch (e) {
    console.warn(`[LocalStore] Failed to save collection ${collectionPath}:`, e);
  }
}

function getDeletedCollectionIds(collectionPath: string): Set<string> {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(DELETED_COL_PREFIX + collectionPath);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr.map((x: string) => String(x).trim()));
        }
      }
    }
  } catch (_) {}
  return new Set();
}

function addDeletedCollectionId(collectionPath: string, docId: string): void {
  try {
    if (typeof window !== "undefined" && docId) {
      const set = getDeletedCollectionIds(collectionPath);
      set.add(String(docId).trim());
      localStorage.setItem(DELETED_COL_PREFIX + collectionPath, JSON.stringify(Array.from(set)));
    }
  } catch (_) {}
}

function removeDeletedCollectionId(collectionPath: string, docId: string): void {
  try {
    if (typeof window !== "undefined" && docId) {
      const set = getDeletedCollectionIds(collectionPath);
      if (set.has(String(docId).trim())) {
        set.delete(String(docId).trim());
        localStorage.setItem(DELETED_COL_PREFIX + collectionPath, JSON.stringify(Array.from(set)));
      }
    }
  } catch (_) {}
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
        const localMap = getLocalCollectionStore<T>(collectionPath);
        return localMap.get(docId) || null;
      }
    }
    const localMap = getLocalCollectionStore<T>(collectionPath);
    return localMap.get(docId) || null;
  },

  async getCollection<T>(collectionPath: string, queryConstraints: any[] = [], retries = 3, delayMs = 300): Promise<T[]> {
    for (let i = 0; i < retries; i++) {
      try {
        const colRef = collection(db, collectionPath);
        const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
        const querySnapshot = await getDocs(q);
        const serverDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        const localMap = getLocalCollectionStore<T>(collectionPath);
        const deletedIds = getDeletedCollectionIds(collectionPath);
        const resultMap = new Map<string, T>();
        serverDocs.forEach((d: any) => {
          const k = (d?.id || d?.customId || "").trim();
          if (k && !deletedIds.has(k)) resultMap.set(k, d);
        });
        Array.from(localMap.entries()).forEach(([k, localDoc]: [string, any]) => {
          if (!deletedIds.has(k)) {
            const ex = resultMap.get(k);
            resultMap.set(k, ex ? { ...ex, ...localDoc } : localDoc);
          }
        });
        return Array.from(resultMap.values());
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        const isPermissionDenied = errMsg.toLowerCase().includes("permission") || errMsg.toLowerCase().includes("insufficient");
        
        if (isPermissionDenied && i < retries - 1) {
          console.warn(`[Firestore Retry] getCollection failed on ${collectionPath}. Retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        handleFirestoreError(error, OperationType.LIST, collectionPath);
        const localMap = getLocalCollectionStore<T>(collectionPath);
        return Array.from(localMap.values());
      }
    }
    const localMap = getLocalCollectionStore<T>(collectionPath);
    return Array.from(localMap.values());
  },

  async setDocument(collectionPath: string, docId: string, data: any): Promise<void> {
    const finalDocId = docId || data?.id || data?.customId;
    if (finalDocId) {
      const map = getLocalCollectionStore(collectionPath);
      const existing = (map.get(String(finalDocId)) || {}) as any;
      map.set(String(finalDocId), { ...existing, ...data, id: finalDocId, updatedAt: new Date().toISOString() });
      saveLocalCollectionStore(collectionPath, map);
      removeDeletedCollectionId(collectionPath, String(finalDocId));
    }
    if (isQuotaExhausted()) {
      return;
    }
    try {
      if (!finalDocId) {
        console.warn(`[dbService] setDocument missing docId on ${collectionPath}`);
        return;
      }
      const sanitized = sanitizeFirestoreData(data) || {};
      await setDoc(doc(db, collectionPath, String(finalDocId)), {
        ...sanitized,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
    }
  },

  async createDocument(collectionPath: string, data: any): Promise<string> {
    const fallbackId = data?.id || data?.customId || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const map = getLocalCollectionStore(collectionPath);
    map.set(String(fallbackId), { ...data, id: fallbackId, createdAt: Date.now(), updatedAt: new Date().toISOString() });
    saveLocalCollectionStore(collectionPath, map);
    removeDeletedCollectionId(collectionPath, String(fallbackId));

    if (isQuotaExhausted()) {
      return fallbackId;
    }
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
      map.delete(String(fallbackId));
      map.set(String(docRef.id), { ...data, id: docRef.id, createdAt: Date.now(), updatedAt: new Date().toISOString() });
      saveLocalCollectionStore(collectionPath, map);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionPath);
      return fallbackId;
    }
  },

  async updateDocument(collectionPath: string, docId: string, data: any): Promise<void> {
    const finalDocId = docId || data?.id || data?.customId;
    if (finalDocId) {
      const map = getLocalCollectionStore(collectionPath);
      const existing = (map.get(String(finalDocId)) || {}) as any;
      map.set(String(finalDocId), { ...existing, ...data, id: finalDocId, updatedAt: new Date().toISOString() });
      saveLocalCollectionStore(collectionPath, map);
      removeDeletedCollectionId(collectionPath, String(finalDocId));
    }
    if (isQuotaExhausted()) {
      return;
    }
    try {
      if (!finalDocId) return;
      const sanitized = sanitizeFirestoreData(data) || {};
      const docRef = doc(db, collectionPath, String(finalDocId));
      await setDoc(docRef, {
        ...sanitized,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${docId}`);
    }
  },

  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    if (docId) {
      const map = getLocalCollectionStore(collectionPath);
      map.delete(String(docId));
      saveLocalCollectionStore(collectionPath, map);
      addDeletedCollectionId(collectionPath, String(docId));
    }
    if (isQuotaExhausted()) {
      return;
    }
    try {
      if (!docId) return;
      const docRef = doc(db, collectionPath, String(docId));
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
    const mergeWithLocal = (serverData: T[]): T[] => {
      const localMap = getLocalCollectionStore<T>(collectionPath);
      const deletedIds = getDeletedCollectionIds(collectionPath);
      const resultMap = new Map<string, T>();

      // 1. Base from server data (filtered by deleted)
      (serverData || []).forEach((item: any) => {
        const idKey = (item?.id || item?.customId || "").trim();
        if (idKey && !deletedIds.has(idKey)) {
          resultMap.set(idKey, item);
        }
      });

      // 2. Overlay local data (local edits and additions always take absolute priority over stale server data)
      Array.from(localMap.entries()).forEach(([key, localItem]: [string, any]) => {
        if (!deletedIds.has(key)) {
          const ex = resultMap.get(key);
          resultMap.set(key, ex ? { ...ex, ...localItem } : localItem);
        }
      });

      return Array.from(resultMap.values());
    };

    const colRef = collection(db, collectionPath);
    const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(mergeWithLocal(data));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
      const localFallback = mergeWithLocal([]);
      if (localFallback.length > 0) {
        callback(localFallback);
      }
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
        const localMap = getLocalCollectionStore<T>(collectionPath);
        callback(localMap.get(docId) || null);
      }
    }, (error) => {
      console.warn(`[Firestore] onDocumentSnapshot error on ${collectionPath}/${docId}:`, error);
      const localMap = getLocalCollectionStore<T>(collectionPath);
      callback(localMap.get(docId) || null);
      if (errorCallback) errorCallback(error);
    });
  }
};
