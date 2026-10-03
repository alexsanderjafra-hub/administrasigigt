/**
 * Auto Backup & Cloud Sync Service
 * Automatically snapshots financialRecords, debtRecords, and projects
 * upon EVERY input/edit and once per day, persisting securely to localStorage
 * and syncing to Firestore so data remains intact across deployments (e.g. Vercel)
 * and application feature updates.
 */

import { dbService } from "./db";

export interface SystemBackup {
  id?: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  trigger?: string; // Reason or action that triggered this backup
  financialRecordsCount: number;
  debtRecordsCount: number;
  projectsCount: number;
  data: {
    financialRecords: any[];
    debtRecords: any[];
    projects: any[];
  };
}

export interface PersistentDataPayload {
  financialRecords: any[];
  debtRecords: any[];
  projects: any[];
  updatedAt: string;
  timestamp: number;
  version: number;
}

const PERSISTENT_CACHE_KEY = "PT_DATA_PERSISTENT_CACHE";
const BACKUP_HISTORY_KEY = "PT_DATA_BACKUP_HISTORY";
const LAST_DAILY_KEY = "last_auto_daily_backup_date";
const MAX_HISTORY_ITEMS = 20;

let saveTimeout: any = null;

export const autoBackupService = {
  /**
   * Save an instant snapshot of data whenever any input, edit, or delete happens.
   * Debounced slightly (400ms) to prevent thrashing during fast typing.
   */
  saveInstantDataSnapshot: (
    financialRecords: any[],
    debtRecords: any[],
    projects: any[],
    triggerReason = "Perubahan data baru"
  ) => {
    if (
      (!financialRecords || financialRecords.length === 0) &&
      (!debtRecords || debtRecords.length === 0)
    ) {
      return;
    }

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
      try {
        const now = Date.now();
        const dateStr = new Date().toISOString();
        const todayStr = dateStr.split("T")[0];

        // 1. Primary Persistent Cache in LocalStorage
        const payload: PersistentDataPayload = {
          financialRecords,
          debtRecords,
          projects: projects || [],
          updatedAt: dateStr,
          timestamp: now,
          version: 2,
        };

        localStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(payload));

        // 2. Rolling History of Snapshots in LocalStorage
        try {
          const rawHistory = localStorage.getItem(BACKUP_HISTORY_KEY);
          let history: SystemBackup[] = rawHistory ? JSON.parse(rawHistory) : [];

          // Only add a new history item if at least 15 seconds have passed since the previous snapshot
          const lastSnap = history[0];
          if (!lastSnap || now - lastSnap.timestamp > 15000) {
            const newSnap: SystemBackup = {
              id: `snap_${now}`,
              date: todayStr,
              timestamp: now,
              trigger: triggerReason,
              financialRecordsCount: financialRecords.length,
              debtRecordsCount: debtRecords.length,
              projectsCount: (projects || []).length,
              data: {
                financialRecords,
                debtRecords,
                projects: projects || [],
              },
            };

            history.unshift(newSnap);
            if (history.length > MAX_HISTORY_ITEMS) {
              history = history.slice(0, MAX_HISTORY_ITEMS);
            }
            localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history));
          }
        } catch (histErr) {
          console.warn("[AutoBackup] Gagal memperbarui riwayat backup:", histErr);
        }

        // 3. Cloud Master Snapshot in Firestore (syncs data across AI Studio & Vercel)
        // Wrapped in try/catch so it never fails even if Firestore free quota is exceeded
        try {
          await dbService.setDocument("systemBackups", "latest_synced_data", {
            updatedAt: dateStr,
            timestamp: now,
            trigger: triggerReason,
            financialRecordsCount: financialRecords.length,
            debtRecordsCount: debtRecords.length,
            projectsCount: (projects || []).length,
            financialRecords,
            debtRecords,
            projects: projects || [],
          });
          console.log(`[AutoBackup & CloudSync] Snapshot data tersimpan di LocalStorage & Firestore (${financialRecords.length} transaksi, ${debtRecords.length} hutang).`);
        } catch (cloudErr) {
          // LocalStorage fallback already succeeded above
          console.warn("[AutoBackup] Cloud sync Firestore skipped or quota reached, data tetap aman di LocalStorage:", cloudErr);
        }
      } catch (err) {
        console.error("[AutoBackup] Error saving instant snapshot:", err);
      }
    }, 400);
  },

  /**
   * Run daily backup snapshot check.
   */
  performDailyBackup: async (
    financialRecords: any[],
    debtRecords: any[],
    projects: any[]
  ): Promise<boolean> => {
    try {
      if (
        (!financialRecords || financialRecords.length === 0) &&
        (!debtRecords || debtRecords.length === 0)
      ) {
        return false;
      }

      const today = new Date().toISOString().split("T")[0];
      const lastBackupDate = localStorage.getItem(LAST_DAILY_KEY);

      if (lastBackupDate === today) {
        return false;
      }

      autoBackupService.saveInstantDataSnapshot(
        financialRecords,
        debtRecords,
        projects,
        `Pencadangan Harian Otomatis (${today})`
      );

      localStorage.setItem(LAST_DAILY_KEY, today);
      return true;
    } catch (err) {
      console.error("[AutoBackup] Error daily backup:", err);
      return false;
    }
  },

  /**
   * Get persistent data from local storage
   */
  getPersistentData: (): PersistentDataPayload | null => {
    try {
      const raw = localStorage.getItem(PERSISTENT_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        (Array.isArray(parsed.financialRecords) || Array.isArray(parsed.debtRecords))
      ) {
        return parsed as PersistentDataPayload;
      }
      return null;
    } catch (e) {
      console.error("[AutoBackup] Error reading persistent data:", e);
      return null;
    }
  },

  /**
   * Fetch the latest synced snapshot from Firestore systemBackups collection
   */
  fetchCloudLatestSnapshot: async (): Promise<PersistentDataPayload | null> => {
    try {
      const snap = await dbService.getDocument<any>("systemBackups", "latest_synced_data");
      if (snap && (Array.isArray(snap.financialRecords) || Array.isArray(snap.debtRecords))) {
        return snap as PersistentDataPayload;
      }
      return null;
    } catch (err) {
      console.warn("[AutoBackup] Cloud snapshot fetch skipped:", err);
      return null;
    }
  },

  /**
   * Get backup history list
   */
  getAvailableBackups: (): SystemBackup[] => {
    try {
      const raw = localStorage.getItem(BACKUP_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch (err) {
      console.error("[AutoBackup] Error getting backup history:", err);
      return [];
    }
  },

  /**
   * Force sync to Firestore systemBackups collection
   */
  forceSyncToCloud: async (
    financialRecords: any[],
    debtRecords: any[],
    projects: any[]
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const now = Date.now();
      const dateStr = new Date().toISOString();

      // Ensure local cache is updated immediately
      const payload: PersistentDataPayload = {
        financialRecords,
        debtRecords,
        projects: projects || [],
        updatedAt: dateStr,
        timestamp: now,
        version: 2,
      };
      localStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(payload));

      await dbService.setDocument("systemBackups", "latest_synced_data", {
        updatedAt: dateStr,
        timestamp: now,
        trigger: "Manual Force Sync ke Cloud (Vercel)",
        financialRecordsCount: financialRecords.length,
        debtRecordsCount: debtRecords.length,
        projectsCount: (projects || []).length,
        financialRecords,
        debtRecords,
        projects: projects || [],
      });

      return {
        success: true,
        message: `Berhasil menyinkronkan ${financialRecords.length} transaksi, ${debtRecords.length} catatan hutang, dan ${(projects || []).length} proyek ke cloud database (Vercel).`,
      };
    } catch (err: any) {
      const msg = err?.message || String(err);
      return {
        success: false,
        message: `Sinkronisasi cloud gagal (${msg}). Data tetap tersimpan aman di browser LocalStorage.`,
      };
    }
  },

  /**
   * Download complete JSON backup file to user's computer
   */
  exportBackupFile: (
    financialRecords: any[],
    debtRecords: any[],
    projects: any[]
  ) => {
    try {
      const nowStr = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const backupData = {
        appName: "PT Kontraktor Enterprise - Sistem Keuangan",
        exportDate: new Date().toISOString(),
        financialRecordsCount: financialRecords.length,
        debtRecordsCount: debtRecords.length,
        projectsCount: (projects || []).length,
        financialRecords,
        debtRecords,
        projects: projects || [],
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BACKUP_PT_KEUANGAN_${nowStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error("[AutoBackup] Export error:", e);
      return false;
    }
  },

  /**
   * Parse uploaded JSON backup file
   */
  parseBackupFile: (file: File): Promise<{
    financialRecords: any[];
    debtRecords: any[];
    projects: any[];
  }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          const financial = Array.isArray(parsed.financialRecords)
            ? parsed.financialRecords
            : Array.isArray(parsed.data?.financialRecords)
            ? parsed.data.financialRecords
            : [];
          const debt = Array.isArray(parsed.debtRecords)
            ? parsed.debtRecords
            : Array.isArray(parsed.data?.debtRecords)
            ? parsed.data.debtRecords
            : [];
          const proj = Array.isArray(parsed.projects)
            ? parsed.projects
            : Array.isArray(parsed.data?.projects)
            ? parsed.data.projects
            : [];

          if (financial.length === 0 && debt.length === 0 && proj.length === 0) {
            throw new Error("File JSON tidak berisi data transaksi atau hutang yang valid.");
          }

          resolve({
            financialRecords: financial,
            debtRecords: debt,
            projects: proj,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Gagal membaca file."));
      reader.readAsText(file);
    });
  },
};
