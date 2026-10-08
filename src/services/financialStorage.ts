import { FinancialRecord } from "../types";

const FINANCIAL_OVERRIDES_KEY = "workflow_pro_financial_overrides";
const DELETED_FINANCIAL_IDS_KEY = "workflow_pro_deleted_financial_ids";

/**
 * Retrieve user-edited modifications for financial records.
 * Stored persistently in localStorage so refresh never overwrites user edits.
 */
export const getFinancialOverrides = (): Record<string, Partial<FinancialRecord>> => {
  try {
    const raw = localStorage.getItem(FINANCIAL_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const normalized: Record<string, Partial<FinancialRecord>> = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (k) {
        normalized[k] = v as any;
        normalized[k.trim().toUpperCase()] = v as any;
      }
    });
    return normalized;
  } catch (err) {
    console.warn("[FinancialStorage] Failed to read overrides:", err);
    return {};
  }
};

/**
 * Persistently save a user's edit or modification to a financial record.
 * Keyed by uppercase ID and customId to ensure rapid and unambiguous retrieval.
 */
export const saveFinancialOverride = (record: Partial<FinancialRecord>): void => {
  try {
    const current = getFinancialOverrides();
    const idKey = (record.id || "").trim().toUpperCase();
    const customIdKey = (record.customId || "").trim().toUpperCase();

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

    if (idKey) {
      current[idKey] = { ...(current[idKey] || {}), ...payload };
    }
    if (customIdKey) {
      current[customIdKey] = { ...(current[customIdKey] || {}), ...payload };
    }

    localStorage.setItem(FINANCIAL_OVERRIDES_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn("[FinancialStorage] Failed to save override:", err);
  }
};

/**
 * Remove an override if a record is permanently deleted.
 */
export const removeFinancialOverride = (idOrCustomId: string): void => {
  try {
    const current = getFinancialOverrides();
    const key = (idOrCustomId || "").trim().toUpperCase();
    let changed = false;
    if (key && current[key]) {
      delete current[key];
      changed = true;
    }
    if (changed) {
      localStorage.setItem(FINANCIAL_OVERRIDES_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.warn("[FinancialStorage] Failed to remove override:", err);
  }
};

/**
 * Set of IDs deleted by the user to avoid resurrecting deleted seed items on refresh.
 */
export const getDeletedFinancialIds = (): Set<string> => {
  try {
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
    localStorage.setItem(DELETED_FINANCIAL_IDS_KEY, JSON.stringify(Array.from(set)));
    removeFinancialOverride(key);
  } catch (err) {
    console.warn("[FinancialStorage] Failed to mark deleted:", err);
  }
};
