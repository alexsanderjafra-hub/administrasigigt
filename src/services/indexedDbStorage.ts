/**
 * IndexedDB Storage Engine for Workflow Pro
 * Provides persistent, quota-unlimited storage for financial overrides, backups,
 * and system state to ensure user edits are NEVER lost on refresh or browser restart,
 * even when localStorage limits (5MB) are reached.
 */

const DB_NAME = "WorkflowPro_PersistentDB";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(new Error("IndexedDB not available"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("overrides")) {
          db.createObjectStore("overrides");
        }
        if (!db.objectStoreNames.contains("backups")) {
          db.createObjectStore("backups");
        }
        if (!db.objectStoreNames.contains("snapshots")) {
          db.createObjectStore("snapshots");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export const idbStorage = {
  async get<T>(storeName: "overrides" | "backups" | "snapshots", key: string): Promise<T | null> {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
      });
    } catch (_) {
      return null;
    }
  },

  async set<T>(storeName: "overrides" | "backups" | "snapshots", key: string, value: T): Promise<boolean> {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (_) {
      return false;
    }
  },

  async delete(storeName: "overrides" | "backups" | "snapshots", key: string): Promise<boolean> {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (_) {
      return false;
    }
  },

  async getAll<T>(storeName: "overrides" | "backups" | "snapshots"): Promise<Record<string, T>> {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const result: Record<string, T> = {};
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            result[String(cursor.key)] = cursor.value;
            cursor.continue();
          } else {
            resolve(result);
          }
        };
        req.onerror = () => resolve({});
      });
    } catch (_) {
      return {};
    }
  },
};
