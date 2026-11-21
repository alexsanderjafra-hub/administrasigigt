import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  deleteField,
  query, 
  where, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { idbStorage } from './indexedDbStorage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Firestore write quota check with persistent session & local storage circuit breaker.
let isFirestoreWriteQuotaExhausted = false;
let quotaExhaustedUntil = 0;

try {
  if (typeof window !== "undefined") {
    // Clear any legacy 12-hour lockout
    window.localStorage?.removeItem("firestore_write_quota_exhausted_until");
    window.sessionStorage?.removeItem("firestore_write_quota_exhausted_until");
  }
} catch (e) {}

export function markQuotaExhausted(durationMs: number = 60 * 1000) {
  isFirestoreWriteQuotaExhausted = true;
  quotaExhaustedUntil = Date.now() + durationMs;
  try {
    if (typeof window !== "undefined") {
      window.localStorage?.setItem("firestore_write_quota_exhausted_until", String(quotaExhaustedUntil));
      window.sessionStorage?.setItem("firestore_write_quota_exhausted_until", String(quotaExhaustedUntil));
    }
  } catch (e) {}
  console.warn(`[Firestore Circuit-Breaker Active] Batas kuota tulis Firestore tercapai. Circuit-breaker aktif selama ${Math.round(durationMs / 1000)} detik; seluruh perubahan data tetap diproses dan tersimpan aman di LocalStorage.`);
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
const PENDING_WRITE_COL_PREFIX = "wf_pending_write_col_";
const PENDING_DELETE_COL_PREFIX = "wf_pending_del_col_";
const CLOUD_DELETED_REGISTRY_KEY = "wf_cloud_deleted_registry";

const inMemoryLocalStores = new Map<string, Map<string, any>>();
const inMemoryDeletedIds = new Map<string, Set<string>>();
const inMemoryPendingWriteIds = new Map<string, Set<string>>();
const inMemoryPendingDeleteIds = new Map<string, Set<string>>();
const pendingStoreSaveTimers = new Map<string, any>();
const pendingDeletedSaveTimers = new Map<string, any>();
const pendingWriteSaveTimers = new Map<string, any>();
const pendingDelStateSaveTimers = new Map<string, any>();
const dirtyStoreCollections = new Set<string>();
const dirtyDeletedCollections = new Set<string>();
const dirtyPendingWriteCollections = new Set<string>();
const dirtyPendingDeleteCollections = new Set<string>();

// Shared Cloud Deleted Registry (synced via Firestore systemBackups/deleted_registry)
type CloudDeletionType = "financial" | "debt" | "project";
interface CloudDeletedRegistryState {
  financial: Map<string, number>;
  debt: Map<string, number>;
  project: Map<string, number>;
}
let cloudDeletedState: CloudDeletedRegistryState | null = null;
const pendingCloudDeleteQueue: Record<CloudDeletionType, Map<string, number>> = {
  financial: new Map(),
  debt: new Map(),
  project: new Map(),
};
const pendingCloudClearQueue: Record<CloudDeletionType, Set<string>> = {
  financial: new Set(),
  debt: new Set(),
  project: new Set(),
};
let cloudRegistryFlushTimer: any = null;

function encodeRegistryKey(raw: string): string {
  return raw.replace(/%/g, "%25").replace(/\./g, "%2E").replace(/\//g, "%2F");
}

function decodeRegistryKey(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded.replace(/%2F/g, "/").replace(/%2E/g, ".").replace(/%25/g, "%");
  }
}

function ensureCloudDeletedState(): CloudDeletedRegistryState {
  if (cloudDeletedState) return cloudDeletedState;
  const state: CloudDeletedRegistryState = {
    financial: new Map(),
    debt: new Map(),
    project: new Map(),
  };
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(CLOUD_DELETED_REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.financial && typeof parsed.financial === "object") {
          Object.entries(parsed.financial).forEach(([k, v]) => {
            if (typeof v === "number") state.financial.set(k.toUpperCase(), v);
          });
        }
        if (parsed?.debt && typeof parsed.debt === "object") {
          Object.entries(parsed.debt).forEach(([k, v]) => {
            if (typeof v === "number") state.debt.set(k.toLowerCase(), v);
          });
        }
        if (parsed?.project && typeof parsed.project === "object") {
          Object.entries(parsed.project).forEach(([k, v]) => {
            if (typeof v === "number") state.project.set(k.toUpperCase(), v);
          });
        }
      }
    }
  } catch (_) {}
  cloudDeletedState = state;
  return state;
}

function persistCloudDeletedStateToDisk(): void {
  try {
    if (typeof window === "undefined" || !cloudDeletedState) return;
    const obj = {
      financial: Object.fromEntries(cloudDeletedState.financial.entries()),
      debt: Object.fromEntries(cloudDeletedState.debt.entries()),
      project: Object.fromEntries(cloudDeletedState.project.entries()),
    };
    localStorage.setItem(CLOUD_DELETED_REGISTRY_KEY, JSON.stringify(obj));
  } catch (_) {}
}

function normalizeRegistryId(type: CloudDeletionType, id: string): string {
  const trimmed = String(id || "").trim();
  if (!trimmed) return "";
  return type === "debt" ? trimmed.toLowerCase() : trimmed.toUpperCase();
}

export function getCloudDeletedMap(type: CloudDeletionType): Map<string, number> {
  return ensureCloudDeletedState()[type];
}

export function getRecordTimestampMs(rec: any): number {
  if (!rec) return 0;
  const candidates = [rec.createdAt, rec.timestamp, rec.updatedAt];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c?.toMillis === "function") return c.toMillis();
    if (typeof c?.seconds === "number") return c.seconds * 1000;
    if (typeof c === "string") {
      const parsed = Date.parse(c);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

export function isDeletedByCloudRegistry(type: CloudDeletionType, item: any): boolean {
  if (!item) return false;
  const map = getCloudDeletedMap(type);
  if (map.size === 0) return false;

  const keysToCheck: string[] = [];
  if (item.id) keysToCheck.push(normalizeRegistryId(type, item.id));
  if (item.customId) keysToCheck.push(normalizeRegistryId(type, item.customId));
  if (type === "debt") {
    if (item.originFinancialRecordId) keysToCheck.push(normalizeRegistryId(type, item.originFinancialRecordId));
    if (item.originCustomId) keysToCheck.push(normalizeRegistryId(type, item.originCustomId));
  }

  let latestDelAt = 0;
  for (const k of keysToCheck) {
    if (!k) continue;
    const ts = map.get(k);
    if (ts && ts > latestDelAt) latestDelAt = ts;
  }
  if (!latestDelAt) return false;

  // If the item is a freshly recreated live document whose createdAt/timestamp is strictly newer than deletion, keep it alive
  const itemTs = getRecordTimestampMs(item);
  if (itemTs > 0 && itemTs > latestDelAt + 1000 && (item.isUserCreated || item.isManualUserCreated || item.isLiveNewTransaction)) {
    return false;
  }
  return true;
}

async function flushCloudRegistryQueues(): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;
  const hasDeletes =
    pendingCloudDeleteQueue.financial.size > 0 ||
    pendingCloudDeleteQueue.debt.size > 0 ||
    pendingCloudDeleteQueue.project.size > 0;
  const hasClears =
    pendingCloudClearQueue.financial.size > 0 ||
    pendingCloudClearQueue.debt.size > 0 ||
    pendingCloudClearQueue.project.size > 0;
  if (!hasDeletes && !hasClears) return;

  const payload: Record<string, any> = { updatedAt: Timestamp.now() };
  const types: CloudDeletionType[] = ["financial", "debt", "project"];
  const fieldMap: Record<CloudDeletionType, string> = {
    financial: "financialDeletedAt",
    debt: "debtDeletedAt",
    project: "projectDeletedAt",
  };

  types.forEach((t) => {
    const fieldName = fieldMap[t];
    const sub: Record<string, any> = {};
    pendingCloudDeleteQueue[t].forEach((ts, k) => {
      sub[encodeRegistryKey(k)] = ts;
    });
    pendingCloudClearQueue[t].forEach((k) => {
      if (!pendingCloudDeleteQueue[t].has(k)) {
        sub[encodeRegistryKey(k)] = deleteField();
      }
    });
    if (Object.keys(sub).length > 0) {
      payload[fieldName] = sub;
    }
    pendingCloudDeleteQueue[t].clear();
    pendingCloudClearQueue[t].clear();
  });

  try {
    await setDoc(doc(db, "systemBackups", "deleted_registry"), payload, { merge: true });
  } catch (err) {
    console.warn("[CloudDeletedRegistry] Sync warning:", err);
  }
}

function scheduleCloudRegistryFlush(): void {
  if (cloudRegistryFlushTimer) clearTimeout(cloudRegistryFlushTimer);
  cloudRegistryFlushTimer = setTimeout(() => {
    cloudRegistryFlushTimer = null;
    flushCloudRegistryQueues();
  }, 180);
}

export function recordCloudDeletion(type: CloudDeletionType, ids: (string | undefined)[]): void {
  const state = ensureCloudDeletedState();
  const now = Date.now();
  let changed = false;
  ids.forEach((raw) => {
    if (!raw) return;
    const norm = normalizeRegistryId(type, raw);
    if (!norm) return;
    state[type].set(norm, now);
    pendingCloudDeleteQueue[type].set(norm, now);
    pendingCloudClearQueue[type].delete(norm);
    changed = true;
  });
  if (changed) {
    persistCloudDeletedStateToDisk();
    scheduleCloudRegistryFlush();
  }
}

export function clearCloudDeletion(type: CloudDeletionType, ids: (string | undefined)[]): void {
  const state = ensureCloudDeletedState();
  let changed = false;
  ids.forEach((raw) => {
    if (!raw) return;
    const norm = normalizeRegistryId(type, raw);
    if (!norm) return;
    if (state[type].has(norm)) {
      state[type].delete(norm);
      pendingCloudDeleteQueue[type].delete(norm);
      pendingCloudClearQueue[type].add(norm);
      changed = true;
    }
  });
  if (changed) {
    persistCloudDeletedStateToDisk();
    scheduleCloudRegistryFlush();
  }
}

export function applyCloudDeletedRegistry(docData: any): {
  financial: string[];
  debt: string[];
  project: string[];
} {
  const state = ensureCloudDeletedState();
  const added = {
    financial: [] as string[],
    debt: [] as string[],
    project: [] as string[],
  };
  if (!docData || typeof docData !== "object") return added;

  const mergeField = (type: CloudDeletionType, rawObj: any) => {
    if (!rawObj || typeof rawObj !== "object") return;
    Object.entries(rawObj).forEach(([encKey, val]) => {
      const decoded = normalizeRegistryId(type, decodeRegistryKey(encKey));
      if (!decoded || typeof val !== "number") return;
      const prevTs = state[type].get(decoded) || 0;
      if (val > prevTs) {
        state[type].set(decoded, val);
        added[type].push(decoded);
      }
    });
  };

  mergeField("financial", docData.financialDeletedAt);
  mergeField("debt", docData.debtDeletedAt);
  mergeField("project", docData.projectDeletedAt);

  if (added.financial.length > 0 || added.debt.length > 0 || added.project.length > 0) {
    persistCloudDeletedStateToDisk();
  }
  return added;
}

function flushCollectionStoreToDisk(collectionPath: string): void {
  try {
    if (typeof window === "undefined") return;
    const map = inMemoryLocalStores.get(collectionPath);
    if (!map) return;
    const arr = Array.from(map.values());
    try {
      localStorage.setItem(LOCAL_COL_PREFIX + collectionPath, JSON.stringify(arr));
    } catch (err: any) {
      const isQuota =
        err?.name === "QuotaExceededError" ||
        err?.code === 22 ||
        String(err).includes("quota");
      if (isQuota) {
        try {
          localStorage.removeItem("PT_DATA_BACKUP_HISTORY");
          localStorage.removeItem("last_sync_error_log");
          localStorage.removeItem("PT_FINANCE_CACHE");
          localStorage.removeItem("PT_DEBTS_CACHE");
          localStorage.removeItem("PT_PROJECTS_CACHE");
          localStorage.setItem(LOCAL_COL_PREFIX + collectionPath, JSON.stringify(arr));
        } catch (_) {}
      }
    }
    idbStorage.set("snapshots", LOCAL_COL_PREFIX + collectionPath, arr).catch(() => {});
  } catch (e) {
    console.warn(`[LocalStore] Failed to save collection ${collectionPath}:`, e);
  }
}

function flushSetToDisk(cacheMap: Map<string, Set<string>>, prefix: string, collectionPath: string): void {
  try {
    if (typeof window === "undefined") return;
    const set = cacheMap.get(collectionPath);
    if (!set) return;
    localStorage.setItem(prefix + collectionPath, JSON.stringify(Array.from(set)));
  } catch (_) {}
}

function flushDeletedIdsToDisk(collectionPath: string): void {
  flushSetToDisk(inMemoryDeletedIds, DELETED_COL_PREFIX, collectionPath);
}

if (typeof window !== "undefined" && !(window as any).__hasDbBeforeUnload) {
  (window as any).__hasDbBeforeUnload = true;
  window.addEventListener("beforeunload", () => {
    dirtyStoreCollections.forEach((colPath) => {
      const t = pendingStoreSaveTimers.get(colPath);
      if (t) {
        clearTimeout(t);
        pendingStoreSaveTimers.delete(colPath);
      }
      flushCollectionStoreToDisk(colPath);
    });
    dirtyStoreCollections.clear();

    dirtyDeletedCollections.forEach((colPath) => {
      const t = pendingDeletedSaveTimers.get(colPath);
      if (t) {
        clearTimeout(t);
        pendingDeletedSaveTimers.delete(colPath);
      }
      flushDeletedIdsToDisk(colPath);
    });
    dirtyDeletedCollections.clear();

    dirtyPendingWriteCollections.forEach((colPath) => {
      const t = pendingWriteSaveTimers.get(colPath);
      if (t) {
        clearTimeout(t);
        pendingWriteSaveTimers.delete(colPath);
      }
      flushSetToDisk(inMemoryPendingWriteIds, PENDING_WRITE_COL_PREFIX, colPath);
    });
    dirtyPendingWriteCollections.clear();

    dirtyPendingDeleteCollections.forEach((colPath) => {
      const t = pendingDelStateSaveTimers.get(colPath);
      if (t) {
        clearTimeout(t);
        pendingDelStateSaveTimers.delete(colPath);
      }
      flushSetToDisk(inMemoryPendingDeleteIds, PENDING_DELETE_COL_PREFIX, colPath);
    });
    dirtyPendingDeleteCollections.clear();

    if (cloudRegistryFlushTimer) {
      clearTimeout(cloudRegistryFlushTimer);
      cloudRegistryFlushTimer = null;
      flushCloudRegistryQueues();
    }
  });
}

export function getLocalCollectionStore<T>(collectionPath: string): Map<string, T> {
  const cached = inMemoryLocalStores.get(collectionPath);
  if (cached) {
    return cached as Map<string, T>;
  }
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
  inMemoryLocalStores.set(collectionPath, map);
  return map;
}

function saveLocalCollectionStore<T>(collectionPath: string, map: Map<string, T>): void {
  inMemoryLocalStores.set(collectionPath, map);
  if (typeof window === "undefined") return;
  dirtyStoreCollections.add(collectionPath);
  const existingTimer = pendingStoreSaveTimers.get(collectionPath);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  const timer = setTimeout(() => {
    pendingStoreSaveTimers.delete(collectionPath);
    dirtyStoreCollections.delete(collectionPath);
    flushCollectionStoreToDisk(collectionPath);
  }, 300);
  pendingStoreSaveTimers.set(collectionPath, timer);
}

export function saveLocalCollectionStoreBulk<T>(collectionPath: string, items: T[]): void {
  const map = getLocalCollectionStore<T>(collectionPath);
  const nowIso = new Date().toISOString();
  items.forEach((item: any) => {
    if (!item) return;
    const key = String(item.id || item.customId || "").trim();
    if (!key) return;
    const existing = (map.get(key) || {}) as any;
    map.set(key, { ...existing, ...item, id: key, updatedAt: nowIso });
  });
  saveLocalCollectionStore(collectionPath, map);
}

function loadUpperSet(cacheMap: Map<string, Set<string>>, prefix: string, collectionPath: string): Set<string> {
  const cached = cacheMap.get(collectionPath);
  if (cached) return cached;
  const set = new Set<string>();
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(prefix + collectionPath);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((x: string) => set.add(String(x).trim().toUpperCase()));
        }
      }
    }
  } catch (_) {}
  cacheMap.set(collectionPath, set);
  return set;
}

function scheduleSetFlush(
  cacheMap: Map<string, Set<string>>,
  timersMap: Map<string, any>,
  dirtySet: Set<string>,
  prefix: string,
  collectionPath: string
): void {
  if (typeof window === "undefined") return;
  dirtySet.add(collectionPath);
  const existingTimer = timersMap.get(collectionPath);
  if (existingTimer) clearTimeout(existingTimer);
  const timer = setTimeout(() => {
    timersMap.delete(collectionPath);
    dirtySet.delete(collectionPath);
    flushSetToDisk(cacheMap, prefix, collectionPath);
  }, 200);
  timersMap.set(collectionPath, timer);
}

export function getPendingCollectionIds(collectionPath: string): Set<string> {
  return loadUpperSet(inMemoryPendingWriteIds, PENDING_WRITE_COL_PREFIX, collectionPath);
}

function addPendingWriteId(collectionPath: string, docId: string): void {
  try {
    if (typeof window !== "undefined" && docId) {
      const set = getPendingCollectionIds(collectionPath);
      const upper = String(docId).trim().toUpperCase();
      if (upper && !set.has(upper)) {
        set.add(upper);
        scheduleSetFlush(inMemoryPendingWriteIds, pendingWriteSaveTimers, dirtyPendingWriteCollections, PENDING_WRITE_COL_PREFIX, collectionPath);
      }
    }
  } catch (_) {}
}

function removePendingWriteId(collectionPath: string, docId: string): void {
  try {
    if (typeof window !== "undefined" && docId) {
      const set = getPendingCollectionIds(collectionPath);
      const upper = String(docId).trim().toUpperCase();
      if (upper && set.has(upper)) {
        set.delete(upper);
        scheduleSetFlush(inMemoryPendingWriteIds, pendingWriteSaveTimers, dirtyPendingWriteCollections, PENDING_WRITE_COL_PREFIX, collectionPath);
      }
    }
  } catch (_) {}
}

function getPendingDeleteIds(collectionPath: string): Set<string> {
  return loadUpperSet(inMemoryPendingDeleteIds, PENDING_DELETE_COL_PREFIX, collectionPath);
}

function addPendingDeleteId(collectionPath: string, docId: string): void {
  try {
    if (typeof window !== "undefined" && docId) {
      const set = getPendingDeleteIds(collectionPath);
      const upper = String(docId).trim().toUpperCase();
      if (upper && !set.has(upper)) {
        set.add(upper);
        scheduleSetFlush(inMemoryPendingDeleteIds, pendingDelStateSaveTimers, dirtyPendingDeleteCollections, PENDING_DELETE_COL_PREFIX, collectionPath);
      }
    }
  } catch (_) {}
}

function removePendingDeleteId(collectionPath: string, docId: string): void {
  try {
    if (typeof window !== "undefined" && docId) {
      const set = getPendingDeleteIds(collectionPath);
      const upper = String(docId).trim().toUpperCase();
      if (upper && set.has(upper)) {
        set.delete(upper);
        scheduleSetFlush(inMemoryPendingDeleteIds, pendingDelStateSaveTimers, dirtyPendingDeleteCollections, PENDING_DELETE_COL_PREFIX, collectionPath);
      }
    }
  } catch (_) {}
}

export function getDeletedCollectionIds(collectionPath: string): Set<string> {
  return loadUpperSet(inMemoryDeletedIds, DELETED_COL_PREFIX, collectionPath);
}

function scheduleDeletedIdsFlush(collectionPath: string): void {
  scheduleSetFlush(inMemoryDeletedIds, pendingDeletedSaveTimers, dirtyDeletedCollections, DELETED_COL_PREFIX, collectionPath);
}

export function addDeletedCollectionId(collectionPath: string, docId: string): void {
  try {
    if (typeof window !== "undefined" && docId) {
      const set = getDeletedCollectionIds(collectionPath);
      const upper = String(docId).trim().toUpperCase();
      if (!set.has(upper)) {
        set.add(upper);
        scheduleDeletedIdsFlush(collectionPath);
      }
    }
  } catch (_) {}
}

export function removeDeletedCollectionId(collectionPath: string, docId: string): void {
  try {
    if (typeof window !== "undefined" && docId) {
      const set = getDeletedCollectionIds(collectionPath);
      const upper = String(docId).trim().toUpperCase();
      if (set.has(upper)) {
        set.delete(upper);
        scheduleDeletedIdsFlush(collectionPath);
      }
    }
  } catch (_) {}
}

export function mergeWithLocalCollection<T>(
  collectionPath: string,
  serverData: T[],
  isLiveServerSnapshot: boolean = false
): T[] {
  const localMap = getLocalCollectionStore<T>(collectionPath);
  const deletedIds = getDeletedCollectionIds(collectionPath);
  const pendingWrites = getPendingCollectionIds(collectionPath);
  const pendingDeletes = getPendingDeleteIds(collectionPath);

  if (isLiveServerSnapshot) {
    // 1. Build key set from live Firestore server documents
    const serverKeySet = new Set<string>();
    (serverData || []).forEach((item: any) => {
      if (!item) return;
      const idKey = (item.id || "").trim().toUpperCase();
      const custKey = (item.customId || "").trim().toUpperCase();
      if (idKey) serverKeySet.add(idKey);
      if (custKey) serverKeySet.add(custKey);
    });

    // 2. Purge stale local items that were deleted on Firestore by another device/browser
    let localMapChanged = false;
    Array.from(localMap.entries()).forEach(([mapKey, localItem]: [string, any]) => {
      const k1 = (localItem?.id || "").trim().toUpperCase();
      const k2 = (localItem?.customId || "").trim().toUpperCase();
      const kRaw = String(mapKey).trim().toUpperCase();
      const inServer = (k1 && serverKeySet.has(k1)) || (k2 && serverKeySet.has(k2)) || (kRaw && serverKeySet.has(kRaw));
      const isPendingWrite = (k1 && pendingWrites.has(k1)) || (k2 && pendingWrites.has(k2)) || (kRaw && pendingWrites.has(kRaw));
      if (!inServer && !isPendingWrite) {
        localMap.delete(mapKey);
        localMapChanged = true;
      }
    });

    // 3. Process authoritative server data (server wins unless THIS device has an unsynced pending local write)
    const resultMap = new Map<string, any>();
    (serverData || []).forEach((item: any) => {
      if (!item) return;
      const idKey = (item.id || "").trim().toUpperCase();
      const custKey = (item.customId || "").trim().toUpperCase();
      const primaryKey = custKey || idKey;
      if (!primaryKey) return;

      // Skip ONLY if THIS device has an in-flight delete that hasn't settled on server yet
      if (
        (idKey && pendingDeletes.has(idKey)) ||
        (custKey && pendingDeletes.has(custKey)) ||
        (primaryKey && pendingDeletes.has(primaryKey))
      ) {
        return;
      }

      // Item exists on Firestore server -> ensure stale local delete marker doesn't block recreated docs
      if (idKey && deletedIds.has(idKey)) removeDeletedCollectionId(collectionPath, idKey);
      if (custKey && deletedIds.has(custKey)) removeDeletedCollectionId(collectionPath, custKey);

      const isPendingWrite =
        (idKey && pendingWrites.has(idKey)) ||
        (custKey && pendingWrites.has(custKey)) ||
        (primaryKey && pendingWrites.has(primaryKey));

      if (isPendingWrite) {
        const localMatch = localMap.get(item.id) || localMap.get(item.customId) || localMap.get(primaryKey);
        const merged = localMatch ? { ...item, ...localMatch } : item;
        resultMap.set(primaryKey, merged);
      } else {
        resultMap.set(primaryKey, item);
        const storeKey = String(item.id || item.customId || primaryKey).trim();
        if (storeKey) {
          localMap.set(storeKey, item);
          localMapChanged = true;
        }
      }
    });

    // 4. Preserve ONLY unsynced local writes that haven't reached Firestore yet (offline/quota)
    localMap.forEach((localItem: any, mapKey) => {
      if (!localItem) return;
      const idKey = (localItem.id || "").trim().toUpperCase();
      const custKey = (localItem.customId || "").trim().toUpperCase();
      const kRaw = String(mapKey).trim().toUpperCase();
      const primaryKey = custKey || idKey || kRaw;
      if (!primaryKey) return;

      const isPendingWrite =
        (idKey && pendingWrites.has(idKey)) ||
        (custKey && pendingWrites.has(custKey)) ||
        (kRaw && pendingWrites.has(kRaw));
      if (!isPendingWrite) return;

      if (
        (idKey && pendingDeletes.has(idKey)) ||
        (custKey && pendingDeletes.has(custKey)) ||
        (primaryKey && pendingDeletes.has(primaryKey))
      ) {
        return;
      }

      const existing = resultMap.get(primaryKey);
      resultMap.set(primaryKey, existing ? { ...existing, ...localItem } : localItem);
    });

    if (localMapChanged) {
      saveLocalCollectionStore(collectionPath, localMap);
    }

    return Array.from(resultMap.values()) as T[];
  }

  // Offline / fallback path: merge available data with local cache
  const localByKey = new Map<string, any>();
  localMap.forEach((localItem: any, k) => {
    const k1 = (localItem?.id || "").trim().toUpperCase();
    const k2 = (localItem?.customId || "").trim().toUpperCase();
    const kRaw = String(k).trim().toUpperCase();
    if (kRaw) localByKey.set(kRaw, localItem);
    if (k1) localByKey.set(k1, localItem);
    if (k2) localByKey.set(k2, localItem);
  });

  const resultMap = new Map<string, any>();

  (serverData || []).forEach((item: any) => {
    if (!item) return;
    const idKey = (item.id || "").trim().toUpperCase();
    const custKey = (item.customId || "").trim().toUpperCase();
    const primaryKey = custKey || idKey;
    if (!primaryKey) return;

    if (
      (idKey && (deletedIds.has(idKey) || pendingDeletes.has(idKey))) ||
      (custKey && (deletedIds.has(custKey) || pendingDeletes.has(custKey))) ||
      (primaryKey && (deletedIds.has(primaryKey) || pendingDeletes.has(primaryKey)))
    ) {
      return;
    }

    const isPending = (idKey && pendingWrites.has(idKey)) || (custKey && pendingWrites.has(custKey));
    const localMatch = localByKey.get(idKey) || localByKey.get(custKey) || localByKey.get(primaryKey);
    const merged = isPending && localMatch ? { ...item, ...localMatch } : item;
    resultMap.set(primaryKey, merged);
  });

  localMap.forEach((localItem: any) => {
    if (!localItem) return;
    const idKey = (localItem.id || "").trim().toUpperCase();
    const custKey = (localItem.customId || "").trim().toUpperCase();
    const primaryKey = custKey || idKey;
    if (!primaryKey) return;

    if (
      (idKey && (deletedIds.has(idKey) || pendingDeletes.has(idKey))) ||
      (custKey && (deletedIds.has(custKey) || pendingDeletes.has(custKey))) ||
      (primaryKey && (deletedIds.has(primaryKey) || pendingDeletes.has(primaryKey)))
    ) {
      return;
    }

    const existing = resultMap.get(primaryKey);
    if (!existing) {
      resultMap.set(primaryKey, localItem);
    }
  });

  return Array.from(resultMap.values()) as T[];
}

function clearDeletionMarkersForWrite(collectionPath: string, data: any, docId: string): void {
  const keys = [docId, data?.id, data?.customId].filter(Boolean).map(String);
  keys.forEach((k) => {
    removeDeletedCollectionId(collectionPath, k);
    removePendingDeleteId(collectionPath, k);
  });
  if (collectionPath === "financialRecords") clearCloudDeletion("financial", keys);
  else if (collectionPath === "debtRecords") clearCloudDeletion("debt", keys);
  else if (collectionPath === "projects") clearCloudDeletion("project", keys);
}

function markPendingWriteKeys(collectionPath: string, data: any, docId: string): void {
  const keys = [docId, data?.id, data?.customId].filter(Boolean).map(String);
  keys.forEach((k) => addPendingWriteId(collectionPath, k));
}

function clearPendingWriteKeys(collectionPath: string, data: any, docId: string): void {
  const keys = [docId, data?.id, data?.customId].filter(Boolean).map(String);
  keys.forEach((k) => removePendingWriteId(collectionPath, k));
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
        return mergeWithLocalCollection<T>(collectionPath, serverDocs, !querySnapshot.metadata.fromCache);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        const isPermissionDenied = errMsg.toLowerCase().includes("permission") || errMsg.toLowerCase().includes("insufficient");
        
        if (isPermissionDenied && i < retries - 1) {
          console.warn(`[Firestore Retry] getCollection failed on ${collectionPath}. Retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        handleFirestoreError(error, OperationType.LIST, collectionPath);
        return mergeWithLocalCollection<T>(collectionPath, [], false);
      }
    }
    return mergeWithLocalCollection<T>(collectionPath, [], false);
  },

  async setDocument(collectionPath: string, docId: string, data: any): Promise<void> {
    const finalDocId = docId || data?.id || data?.customId;
    if (finalDocId) {
      const map = getLocalCollectionStore(collectionPath);
      const existing = (map.get(String(finalDocId)) || {}) as any;
      map.set(String(finalDocId), { ...existing, ...data, id: finalDocId, updatedAt: new Date().toISOString() });
      saveLocalCollectionStore(collectionPath, map);
      clearDeletionMarkersForWrite(collectionPath, data, String(finalDocId));
      markPendingWriteKeys(collectionPath, data, String(finalDocId));
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
      clearPendingWriteKeys(collectionPath, data, String(finalDocId));
    } catch (error) {
      console.warn(`[dbService] setDocument warning on ${collectionPath}/${docId}, preserved locally:`, error);
    }
  },

  async createDocument(collectionPath: string, data: any): Promise<string> {
    const finalDocId = String(data?.customId || data?.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const map = getLocalCollectionStore(collectionPath);
    map.set(finalDocId, { ...data, id: finalDocId, createdAt: Date.now(), updatedAt: new Date().toISOString() });
    saveLocalCollectionStore(collectionPath, map);
    clearDeletionMarkersForWrite(collectionPath, data, finalDocId);
    markPendingWriteKeys(collectionPath, data, finalDocId);

    if (isQuotaExhausted()) {
      return finalDocId;
    }
    try {
      const sanitized = sanitizeFirestoreData({ ...data, id: finalDocId }) || {};
      const docRef = doc(db, collectionPath, finalDocId);
      await setDoc(docRef, {
        ...sanitized,
        id: finalDocId,
        createdAt: sanitized.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      }, { merge: true });
      clearPendingWriteKeys(collectionPath, data, finalDocId);
      return finalDocId;
    } catch (error) {
      console.warn(`[dbService] createDocument warning on ${collectionPath}, preserved locally with ID ${finalDocId}:`, error);
      return finalDocId;
    }
  },

  async createDocumentStrict(collectionPath: string, data: any): Promise<string> {
    const finalDocId = String(data?.customId || data?.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    clearDeletionMarkersForWrite(collectionPath, data, finalDocId);
    markPendingWriteKeys(collectionPath, data, finalDocId);
    const sanitized = sanitizeFirestoreData({ ...data, id: finalDocId }) || {};
    const docRef = doc(db, collectionPath, finalDocId);
    await setDoc(docRef, {
      ...sanitized,
      id: finalDocId,
      createdAt: sanitized.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });

    clearPendingWriteKeys(collectionPath, data, finalDocId);
    const map = getLocalCollectionStore(collectionPath);
    map.set(finalDocId, { ...data, id: finalDocId, createdAt: Date.now(), updatedAt: new Date().toISOString() });
    saveLocalCollectionStore(collectionPath, map);
    return finalDocId;
  },

  async updateDocument(collectionPath: string, docId: string, data: any): Promise<void> {
    const finalDocId = docId || data?.id || data?.customId;
    if (finalDocId) {
      const map = getLocalCollectionStore(collectionPath);
      const existing = (map.get(String(finalDocId)) || {}) as any;
      map.set(String(finalDocId), { ...existing, ...data, id: finalDocId, updatedAt: new Date().toISOString() });
      saveLocalCollectionStore(collectionPath, map);
      clearDeletionMarkersForWrite(collectionPath, data, String(finalDocId));
      markPendingWriteKeys(collectionPath, data, String(finalDocId));
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
      clearPendingWriteKeys(collectionPath, data, String(finalDocId));
    } catch (error) {
      console.warn(`[dbService] updateDocument warning on ${collectionPath}/${docId}, preserved locally:`, error);
    }
  },

  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    const relatedKeys: string[] = docId ? [String(docId)] : [];
    if (docId) {
      const targetUpper = String(docId).trim().toUpperCase();
      const map = getLocalCollectionStore(collectionPath);
      map.delete(String(docId));
      Array.from(map.entries()).forEach(([k, val]: [string, any]) => {
        const kUp = String(k).trim().toUpperCase();
        const vId = String(val?.id || "").trim().toUpperCase();
        const vCust = String(val?.customId || "").trim().toUpperCase();
        if (kUp === targetUpper || vId === targetUpper || vCust === targetUpper) {
          if (val?.id) relatedKeys.push(String(val.id));
          if (val?.customId) relatedKeys.push(String(val.customId));
          map.delete(k);
        }
      });
      saveLocalCollectionStore(collectionPath, map);
      relatedKeys.forEach((k) => {
        removePendingWriteId(collectionPath, k);
        addDeletedCollectionId(collectionPath, k);
        addPendingDeleteId(collectionPath, k);
      });
      if (collectionPath === "financialRecords") recordCloudDeletion("financial", relatedKeys);
      else if (collectionPath === "debtRecords") recordCloudDeletion("debt", relatedKeys);
      else if (collectionPath === "projects") recordCloudDeletion("project", relatedKeys);
    }
    if (isQuotaExhausted()) {
      return;
    }
    try {
      if (!docId) return;
      const docRef = doc(db, collectionPath, String(docId));
      await deleteDoc(docRef);
      relatedKeys.forEach((k) => removePendingDeleteId(collectionPath, k));
    } catch (error) {
      console.warn(`[dbService] deleteDocument warning on ${collectionPath}/${docId}:`, error);
    }
  },

  onCollectionSnapshot<T>(
    collectionPath: string, 
    callback: (data: T[], meta?: { isFromServer: boolean; hasPendingWrites: boolean }) => void, 
    queryConstraints: any[] = [],
    errorCallback?: (error: any) => void
  ) {
    const colRef = collection(db, collectionPath);
    const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      const isFromServer = !snapshot.metadata.fromCache;
      callback(mergeWithLocalCollection<T>(collectionPath, data, isFromServer), {
        isFromServer,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
      const localFallback = mergeWithLocalCollection<T>(collectionPath, [], false);
      if (localFallback.length > 0) {
        callback(localFallback, { isFromServer: false, hasPendingWrites: false });
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
      const isFromCache = docSnap.metadata.fromCache;
      if (docSnap.exists()) {
        const docData = { id: docSnap.id, ...docSnap.data() } as T;
        callback(docData);
      } else {
        const pendingWrites = getPendingCollectionIds(collectionPath);
        const upperId = String(docId || "").trim().toUpperCase();
        if (isFromCache || (upperId && pendingWrites.has(upperId))) {
          const localMap = getLocalCollectionStore<T>(collectionPath);
          callback(localMap.get(docId) || null);
        } else {
          const localMap = getLocalCollectionStore<T>(collectionPath);
          if (localMap.has(docId)) {
            localMap.delete(docId);
            saveLocalCollectionStore(collectionPath, localMap);
          }
          callback(null);
        }
      }
    }, (error) => {
      console.warn(`[Firestore] onDocumentSnapshot error on ${collectionPath}/${docId}:`, error);
      const localMap = getLocalCollectionStore<T>(collectionPath);
      callback(localMap.get(docId) || null);
      if (errorCallback) errorCallback(error);
    });
  }
};
