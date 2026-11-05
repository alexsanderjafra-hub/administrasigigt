import { FinancialRecord, DebtRecord } from "../types";
import { idbStorage } from "./indexedDbStorage";
import { isSeedFinancialRecord } from "./seedData";

const FINANCIAL_OVERRIDES_KEY = "workflow_pro_financial_overrides";
const DELETED_FINANCIAL_IDS_KEY = "workflow_pro_deleted_financial_ids";
const DEBT_OVERRIDES_KEY = "workflow_pro_debt_overrides";

// In-memory cache for instant synchronous retrieval
let inMemoryOverrides: Record<string, Partial<FinancialRecord>> = {};
let inMemoryDebtOverrides: Record<string, Partial<DebtRecord>> = {};
let isInitializedFromDisk = false;

/**
 * Clean legacy dirty keys from previous sessions to prevent balance distortion
 */
function cleanLegacyDirtyKeys(): void {
  try {
    if (typeof window === "undefined") return;
    const legacyKeys = [
      "workflow_pro_active_user_transactions_v2",
      "workflow_pro_active_user_transactions_v3",
      "workflow_pro_active_user_transactions_v4",
      "workflow_pro_active_user_transactions_v5",
      "workflow_pro_active_user_transactions_v6",
      "workflow_pro_active_user_records_v2",
      "workflow_pro_active_user_records_v3",
      "workflow_pro_active_user_records_v4",
      "workflow_pro_active_user_records_v5",
      "workflow_pro_active_user_records_v6",
      "workflow_pro_live_post_baseline_ids_v2",
      "workflow_pro_live_post_baseline_ids_v3",
      "workflow_pro_live_post_baseline_ids_v4",
      "workflow_pro_live_post_baseline_ids_v5",
      "workflow_pro_live_post_baseline_ids_v6",
      "workflow_pro_post_lock_transaction_ids",
    ];
    legacyKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
        idbStorage.delete("snapshots", k).catch(() => {});
      } catch (_) {}
    });
  } catch (_) {}
}

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
 * Initialize financial & debt storage from localStorage and IndexedDB.
 * Call on application mount to ensure 100% persistence across reloads and tab closures.
 */
export const initFinancialStorage = async (): Promise<Record<string, Partial<FinancialRecord>>> => {
  // 1. Clean legacy dirty keys from old test runs
  cleanLegacyDirtyKeys();

  // 2. First sync from localStorage
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

      const rawDebts = localStorage.getItem(DEBT_OVERRIDES_KEY);
      if (rawDebts) {
        const parsedDebts = JSON.parse(rawDebts);
        if (parsedDebts && typeof parsedDebts === "object") {
          Object.entries(parsedDebts).forEach(([k, v]) => {
            if (k && v) {
              const uKey = k.trim().toUpperCase();
              inMemoryDebtOverrides[k] = v as any;
              inMemoryDebtOverrides[uKey] = v as any;
            }
          });
        }
      }
    }
  } catch (_) {}

  // 3. Then merge from IndexedDB (source of truth for unlimited persistence)
  try {
    // Delete legacy snapshots in IndexedDB
    try {
      idbStorage.delete("snapshots", "workflow_pro_live_post_baseline_ids_v4").catch(() => {});
      idbStorage.delete("snapshots", "workflow_pro_live_post_baseline_ids_v3").catch(() => {});
      idbStorage.delete("snapshots", "workflow_pro_active_user_records_v3").catch(() => {});
    } catch (_) {}

    const idbData = await idbStorage.getAll<Partial<FinancialRecord>>("overrides");
    if (idbData && Object.keys(idbData).length > 0) {
      Object.entries(idbData).forEach(([k, v]) => {
        if (k && v && !k.startsWith("DELETED_")) {
          if (k.startsWith("DEBT_")) {
            const cleanKey = k.replace(/^DEBT_/, "").trim().toUpperCase();
            inMemoryDebtOverrides[cleanKey] = { ...(inMemoryDebtOverrides[cleanKey] || {}), ...(v as any) };
          } else {
            const uKey = k.trim().toUpperCase();
            inMemoryOverrides[k] = { ...(inMemoryOverrides[k] || {}), ...v };
            inMemoryOverrides[uKey] = { ...(inMemoryOverrides[uKey] || {}), ...v };
          }
        }
      });
      // Sync back to localStorage if space allows
      safeSetLocalStorage(FINANCIAL_OVERRIDES_KEY, JSON.stringify(inMemoryOverrides));
      safeSetLocalStorage(DEBT_OVERRIDES_KEY, JSON.stringify(inMemoryDebtOverrides));
    }

    try {
      const idbBaseline = await idbStorage.get<string[]>("snapshots", LIVE_POST_BASELINE_IDS_KEY);
      if (Array.isArray(idbBaseline) && idbBaseline.length > 0) {
        const set = getLivePostBaselineIds();
        idbBaseline.forEach((id) => set.add(String(id).trim().toUpperCase()));
        safeSetLocalStorage(LIVE_POST_BASELINE_IDS_KEY, JSON.stringify(Array.from(set)));
      }
    } catch (_) {}
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
export const saveFinancialOverride = (record: Partial<FinancialRecord>, aliasKey?: string): void => {
  try {
    const idKey = (record.id || "").trim().toUpperCase();
    const customIdKey = (record.customId || "").trim().toUpperCase();
    if (!idKey && !customIdKey && !aliasKey) return;

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
    if (aliasKey) {
      const aKey = aliasKey.trim().toUpperCase();
      inMemoryOverrides[aKey] = { ...(inMemoryOverrides[aKey] || {}), ...payload };
      idbStorage.set("overrides", aKey, payload).catch(() => {});
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

/**
 * Retrieve user-edited modifications for debt records (Hutang / Piutang).
 * Stored persistently in localStorage & IndexedDB so changing due date or details
 * NEVER loses data upon browser refresh.
 */
export const getDebtOverrides = (): Record<string, Partial<DebtRecord>> => {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(DEBT_OVERRIDES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => {
            if (k && v) {
              const uKey = k.trim().toUpperCase();
              inMemoryDebtOverrides[k] = v as any;
              inMemoryDebtOverrides[uKey] = v as any;
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("[FinancialStorage] Failed to read debt overrides from localStorage:", err);
  }
  return inMemoryDebtOverrides;
};

/**
 * Persistently save a user's edit or modification to a debt record (dueDate, amount, contactName, etc.).
 */
export const saveDebtOverride = (record: Partial<DebtRecord>, aliasKey?: string): void => {
  try {
    const idKey = (record.id || "").trim().toUpperCase();
    const customIdKey = (record.customId || "").trim().toUpperCase();
    if (!idKey && !customIdKey && !aliasKey) return;

    const payload: Partial<DebtRecord> & {
      updatedAt?: string;
      timestamp?: number;
      isUserEdited?: boolean;
    } = {
      ...record,
      updatedAt: new Date().toISOString(),
      timestamp: Date.now(),
      isUserEdited: true,
    };

    if (idKey) {
      inMemoryDebtOverrides[idKey] = { ...(inMemoryDebtOverrides[idKey] || {}), ...payload };
    }
    if (customIdKey) {
      inMemoryDebtOverrides[customIdKey] = { ...(inMemoryDebtOverrides[customIdKey] || {}), ...payload };
    }
    if (aliasKey) {
      const aKey = aliasKey.trim().toUpperCase();
      inMemoryDebtOverrides[aKey] = { ...(inMemoryDebtOverrides[aKey] || {}), ...payload };
      idbStorage.set("overrides", `DEBT_${aKey}`, payload).catch(() => {});
    }

    safeSetLocalStorage(DEBT_OVERRIDES_KEY, JSON.stringify(inMemoryDebtOverrides));
    if (idKey) {
      idbStorage.set("overrides", `DEBT_${idKey}`, payload).catch(() => {});
    }
    if (customIdKey && customIdKey !== idKey) {
      idbStorage.set("overrides", `DEBT_${customIdKey}`, payload).catch(() => {});
    }
  } catch (err) {
    console.warn("[FinancialStorage] Failed to save debt override:", err);
  }
};

/**
 * Remove a debt override if permanently deleted.
 */
export const removeDebtOverride = (idOrCustomId: string): void => {
  try {
    const key = (idOrCustomId || "").trim().toUpperCase();
    if (!key) return;

    delete inMemoryDebtOverrides[key];
    delete inMemoryDebtOverrides[idOrCustomId];

    safeSetLocalStorage(DEBT_OVERRIDES_KEY, JSON.stringify(inMemoryDebtOverrides));
    idbStorage.delete("overrides", `DEBT_${key}`).catch(() => {});
  } catch (err) {
    console.warn("[FinancialStorage] Failed to remove debt override:", err);
  }
};

const POST_LOCK_TRANSACTIONS_KEY = "workflow_pro_post_lock_transaction_ids";
let inMemoryPostLockIds: Set<string> | null = null;

export const getPostLockTransactionIds = (): Set<string> => {
  if (inMemoryPostLockIds) return inMemoryPostLockIds;
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(POST_LOCK_TRANSACTIONS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          inMemoryPostLockIds = new Set(arr.map((k) => String(k).trim().toUpperCase()));
          return inMemoryPostLockIds;
        }
      }
    }
  } catch (_) {}
  inMemoryPostLockIds = new Set();
  return inMemoryPostLockIds;
};

export const recordPostLockTransactionId = (idOrCustomId: string): void => {
  if (!idOrCustomId) return;
  const key = String(idOrCustomId).trim().toUpperCase();
  if (!key) return;
  try {
    const set = getPostLockTransactionIds();
    set.add(key);
    safeSetLocalStorage(POST_LOCK_TRANSACTIONS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn("[FinancialStorage] Failed to record post-lock transaction ID:", err);
  }
};

const ACTIVE_USER_TRANSACTIONS_KEY = "workflow_pro_active_user_transactions_v7";
const ACTIVE_USER_RECORDS_KEY = "workflow_pro_active_user_records_v7";

let inMemoryActiveUserTrxIds: Set<string> | null = null;

export const getActiveUserTransactionIds = (): Set<string> => {
  if (inMemoryActiveUserTrxIds) return inMemoryActiveUserTrxIds;
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(ACTIVE_USER_TRANSACTIONS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          inMemoryActiveUserTrxIds = new Set(arr.map((k) => String(k).trim().toUpperCase()));
          return inMemoryActiveUserTrxIds;
        }
      }
    }
  } catch (_) {}
  inMemoryActiveUserTrxIds = new Set();
  return inMemoryActiveUserTrxIds;
};

export const recordActiveUserTransaction = (record: any): void => {
  if (!record) return;
  // Never record historical seed records or pre-baseline records as new active transactions
  if (isSeedFinancialRecord(record)) return;
  const rDate = String(record.date || "").trim();
  if (rDate && rDate <= BASELINE_LOCK_DATE) return;

  const k1 = (record.customId || "").trim().toUpperCase();
  const k2 = (record.id || "").trim().toUpperCase();
  if (!k1 && !k2) return;

  try {
    const set = getActiveUserTransactionIds();
    if (k1) set.add(k1);
    if (k2) set.add(k2);
    safeSetLocalStorage(ACTIVE_USER_TRANSACTIONS_KEY, JSON.stringify(Array.from(set)));

    // Store record in persistent list
    const rawList = localStorage.getItem(ACTIVE_USER_RECORDS_KEY);
    let list: any[] = rawList ? JSON.parse(rawList) : [];
    if (!Array.isArray(list)) list = [];
    const exIdx = list.findIndex((r: any) => 
      (k2 && r.id === k2) || (k1 && r.customId === k1)
    );
    const markedRecord = { ...record, isManualUserCreated: true, isLiveNewTransaction: true };
    if (exIdx >= 0) {
      list[exIdx] = markedRecord;
    } else {
      list.push(markedRecord);
    }
    safeSetLocalStorage(ACTIVE_USER_RECORDS_KEY, JSON.stringify(list));
    idbStorage.set("snapshots", ACTIVE_USER_RECORDS_KEY, list).catch(() => {});
  } catch (err) {
    console.warn("[FinancialStorage] Failed to record active user transaction:", err);
  }
};

export const getActiveUserRecords = (): FinancialRecord[] => {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(ACTIVE_USER_RECORDS_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          return list.filter((r: any) => {
            if (!r) return false;
            if (isSeedFinancialRecord(r)) return false;
            const rDate = String(r.date || "").trim();
            if (rDate && rDate <= BASELINE_LOCK_DATE) return false;
            return true;
          });
        }
      }
    }
  } catch (_) {}
  return [];
};

export const removeActiveUserTransaction = (idOrCustomId: string): void => {
  if (!idOrCustomId) return;
  const key = String(idOrCustomId).trim().toUpperCase();
  try {
    const set = getActiveUserTransactionIds();
    set.delete(key);
    safeSetLocalStorage(ACTIVE_USER_TRANSACTIONS_KEY, JSON.stringify(Array.from(set)));

    const rawList = localStorage.getItem(ACTIVE_USER_RECORDS_KEY);
    if (rawList) {
      let list = JSON.parse(rawList);
      if (Array.isArray(list)) {
        list = list.filter((r: any) => 
          (r.id || "").trim().toUpperCase() !== key && 
          (r.customId || "").trim().toUpperCase() !== key
        );
        safeSetLocalStorage(ACTIVE_USER_RECORDS_KEY, JSON.stringify(list));
      }
    }
  } catch (_) {}
};

const LIVE_POST_BASELINE_IDS_KEY = "workflow_pro_live_post_baseline_ids_v7";
let inMemoryLivePostBaselineIds: Set<string> | null = null;

export const getLivePostBaselineIds = (): Set<string> => {
  if (inMemoryLivePostBaselineIds) return inMemoryLivePostBaselineIds;
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(LIVE_POST_BASELINE_IDS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          inMemoryLivePostBaselineIds = new Set(arr.map((k) => String(k).trim().toUpperCase()));
          return inMemoryLivePostBaselineIds;
        }
      }
    }
  } catch (_) {}
  inMemoryLivePostBaselineIds = new Set();
  return inMemoryLivePostBaselineIds;
};

export const recordLivePostBaselineId = (idOrCustomId: string, recordDate?: string): void => {
  if (!idOrCustomId) return;
  const key = String(idOrCustomId).trim().toUpperCase();
  if (!key) return;
  // Guard against adding seed IDs or pre-baseline records
  if (isSeedFinancialRecord({ customId: key, id: key })) return;
  if (recordDate && recordDate <= BASELINE_LOCK_DATE) return;

  try {
    const set = getLivePostBaselineIds();
    set.add(key);
    safeSetLocalStorage(LIVE_POST_BASELINE_IDS_KEY, JSON.stringify(Array.from(set)));
    idbStorage.set("snapshots", LIVE_POST_BASELINE_IDS_KEY, Array.from(set)).catch(() => {});
  } catch (err) {
    console.warn("[FinancialStorage] Failed to record live post-baseline ID:", err);
  }
};

export const removeLivePostBaselineId = (idOrCustomId: string): void => {
  if (!idOrCustomId) return;
  const key = String(idOrCustomId).trim().toUpperCase();
  try {
    const set = getLivePostBaselineIds();
    set.delete(key);
    safeSetLocalStorage(LIVE_POST_BASELINE_IDS_KEY, JSON.stringify(Array.from(set)));
    idbStorage.set("snapshots", LIVE_POST_BASELINE_IDS_KEY, Array.from(set)).catch(() => {});
  } catch (_) {}
};

export const BASELINE_LOCK_DATE = "2026-10-31";

/**
 * Authoritative check whether a financial transaction is a live user transaction
 * created after the official accounting baseline.
 * Guaranteed:
 * - All historical records up to 31 October 2026 are permanently locked into baseline and DO NOT alter saldo.
 * - Transactions dated after 31 October 2026 (> "2026-10-31") affect saldo live!
 * - Historical records are NEVER deleted, they remain 100% intact in the table.
 */
export const isLivePostBaselineTransaction = (r: any): boolean => {
  if (!r) return false;
  // 1. Any record that belongs to the official baseline seed dataset is permanently locked
  if (isSeedFinancialRecord(r)) return false;

  const rDate = String(r.date || "").trim();
  // 2. Strict baseline lock cutoff: Any transaction dated on or before 31 October 2026 is locked and CANNOT alter baseline saldo
  if (rDate && rDate <= BASELINE_LOCK_DATE) {
    return false;
  }

  // 3. Any transaction dated after 31 October 2026 (November 2026 onward) affects saldo
  if (rDate && rDate > BASELINE_LOCK_DATE) {
    return true;
  }

  // 4. Live new transaction explicitly created by user post-cutoff (and not seed)
  if (r.isLiveNewTransaction === true) {
    const k1 = (r.customId || "").trim().toUpperCase();
    const k2 = (r.id || "").trim().toUpperCase();
    if (isSeedFinancialRecord({ customId: k1, id: k2 })) return false;
    return true;
  }

  return false;
};


