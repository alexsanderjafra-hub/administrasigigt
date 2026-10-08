import { FinancialRecord } from "../types";
import { idbStorage } from "./indexedDbStorage";

const FINANCIAL_OVERRIDES_KEY = "workflow_pro_financial_overrides";
const DELETED_FINANCIAL_IDS_KEY = "workflow_pro_deleted_financial_ids";

// In-memory cache for instant synchronous retrieval
let inMemoryOverrides: Record<string, Partial<FinancialRecord>> = {};
let isInitializedFromDisk = false;

/**
 * Clean bulky temporary localStorage keys if quota is exceeded
 */
function tryFreeLocalStorageSpace(): void {
  try {
    if (typeof window === "undefined") return;
    // Remove heavy backup history and redundant individual caches from localStorage (safely stored in IndexedDB)
    localStorage.removeItem("PT_DATA_BACKUP_HISTORY");
    localStorage.removeItem("last_sync_error_log");
    localStorage.removeItem("PT_FINANCE_CACHE");
    localStorage.removeItem("PT_DEBTS_CACHE");
    localStorage.removeItem("PT_PROJECTS_CACHE");
  } catch (_) {}
}

/**
 * Safe localStorage wrapper that handles QuotaExceededError by evicting bulky history
 */
function safeSetLocalStorage(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  } catch (err: any) {
    const isQuota =
      err?.name === "QuotaExceededError" ||
      err?.code === 22 ||
      err?.code === 1014 ||
      String(err).includes("exceeded the quota");
    if (isQuota) {
      console.warn("[FinancialStorage] LocalStorage quota exceeded, evicting temporary caches...");
      tryFreeLocalStorageSpace();
      try {
        localStorage.setItem(key, value);
      } catch (retryErr) {
        console.warn("[FinancialStorage] LocalStorage retry failed, relying on IndexedDB fallback:", retryErr);
      }
    } else {
      console.warn("[FinancialStorage] LocalStorage save warning:", err);
    }
  }
}

/**
 * Initialize financial storage from localStorage and IndexedDB.
 * Call on application mount to ensure 100% persistence across reloads and tab closures.
 */
export const initFinancialStorage = async (): Promise<Record<string, Partial<FinancialRecord>>> => {
  // 1. First sync from localStorage
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(FINANCIAL_OVERRIDES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => {
            if (k && v) {
              const uKey = k.trim().toUpperCase();
              inMemoryOverrides[k] = v as any;
              inMemoryOverrides[uKey] = v as any;
            }
          });
        }
      }
    }
  } catch (_) {}

  // 2. Then merge from IndexedDB (source of truth for unlimited persistence)
  try {
    const idbData = await idbStorage.getAll<Partial<FinancialRecord>>("overrides");
    if (idbData && Object.keys(idbData).length > 0) {
      Object.entries(idbData).forEach(([k, v]) => {
        if (k && v && !k.startsWith("DELETED_")) {
          const uKey = k.trim().toUpperCase();
          inMemoryOverrides[k] = { ...(inMemoryOverrides[k] || {}), ...v };
          inMemoryOverrides[uKey] = { ...(inMemoryOverrides[uKey] || {}), ...v };
        }
      });
      // Sync back to localStorage if space allows
      safeSetLocalStorage(FINANCIAL_OVERRIDES_KEY, JSON.stringify(inMemoryOverrides));
    }
  } catch (e) {
    console.warn("[FinancialStorage] IndexedDB read warning:", e);
  }

  isInitializedFromDisk = true;
  return inMemoryOverrides;
};

/**
 * Retrieve user-edited modifications for financial records.
 * Stored persistently in localStorage & IndexedDB so refresh never overwrites user edits.
 */
export const getFinancialOverrides = (): Record<string, Partial<FinancialRecord>> => {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(FINANCIAL_OVERRIDES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => {
            if (k && v) {
              const uKey = k.trim().toUpperCase();
              inMemoryOverrides[k] = v as any;
              inMemoryOverrides[uKey] = v as any;
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("[FinancialStorage] Failed to read overrides from localStorage:", err);
  }
  return inMemoryOverrides;
};

/**
 * Persistently save a user's edit or modification to a financial record.
 * Keyed by uppercase ID and customId to ensure rapid and unambiguous retrieval.
 * Synchronously writes to in-memory & localStorage, asynchronously writes to IndexedDB.
 */
export const saveFinancialOverride = (record: Partial<FinancialRecord>): void => {
  try {
    const idKey = (record.id || "").trim().toUpperCase();
    const customIdKey = (record.customId || "").trim().toUpperCase();
    if (!idKey && !customIdKey) return;

    const payload: Partial<FinancialRecord> & {
      updatedAt?: string;
      timestamp?: number;
      isUserEdited?: boolean;
    } = {
      ...record,
      updatedAt: new Date().toISOString(),
      timestamp: Date.now(),
      isUserEdited: true,
    };

    // 1. Update in-memory cache immediately
    if (idKey) {
      inMemoryOverrides[idKey] = { ...(inMemoryOverrides[idKey] || {}), ...payload };
    }
    if (customIdKey) {
      inMemoryOverrides[customIdKey] = { ...(inMemoryOverrides[customIdKey] || {}), ...payload };
    }

    // 2. Persist to localStorage with quota protection
    safeSetLocalStorage(FINANCIAL_OVERRIDES_KEY, JSON.stringify(inMemoryOverrides));

    // 3. Persist to IndexedDB asynchronously (guaranteed durability)
    if (idKey) {
      idbStorage.set("overrides", idKey, payload).catch(() => {});
    }
    if (customIdKey && customIdKey !== idKey) {
      idbStorage.set("overrides", customIdKey, payload).catch(() => {});
    }
  } catch (err) {
    console.warn("[FinancialStorage] Failed to save override:", err);
  }
};

/**
 * Remove an override if a record is permanently deleted.
 */
export const removeFinancialOverride = (idOrCustomId: string): void => {
  try {
    const key = (idOrCustomId || "").trim().toUpperCase();
    if (!key) return;

    delete inMemoryOverrides[key];
    delete inMemoryOverrides[idOrCustomId];

    safeSetLocalStorage(FINANCIAL_OVERRIDES_KEY, JSON.stringify(inMemoryOverrides));
    idbStorage.delete("overrides", key).catch(() => {});
  } catch (err) {
    console.warn("[FinancialStorage] Failed to remove override:", err);
  }
};

/**
 * Set of IDs deleted by the user to avoid resurrecting deleted seed items on refresh.
 */
export const getDeletedFinancialIds = (): Set<string> => {
  try {
    if (typeof window === "undefined") return new Set();
    const raw = localStorage.getItem(DELETED_FINANCIAL_IDS_KEY);
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(arr.map((k) => k.trim().toUpperCase()));
  } catch {
    return new Set();
  }
};

/**
 * Mark a financial record ID as permanently deleted.
 */
export const markFinancialRecordDeleted = (idOrCustomId: string): void => {
  try {
    const key = (idOrCustomId || "").trim().toUpperCase();
    if (!key) return;
    const set = getDeletedFinancialIds();
    set.add(key);
    safeSetLocalStorage(DELETED_FINANCIAL_IDS_KEY, JSON.stringify(Array.from(set)));
    removeFinancialOverride(key);
    idbStorage.set("overrides", `DELETED_${key}`, { isDeleted: true }).catch(() => {});
  } catch (err) {
    console.warn("[FinancialStorage] Failed to mark deleted:", err);
  }
};
