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
const PROJECTS_CACHE_KEY = "PT_PROJECTS_CACHE";
const DEBTS_CACHE_KEY = "PT_DEBTS_CACHE";
const FINANCE_CACHE_KEY = "PT_FINANCE_CACHE";
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
      (!debtRecords || debtRecords.length === 0) &&
      (!projects || projects.length === 0)
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

        // Guard: Don't let an empty array overwrite existing populated cache
        let finalProjects = Array.isArray(projects) ? projects : [];
        let finalDebts = Array.isArray(debtRecords) ? debtRecords : [];
        let finalFin = Array.isArray(financialRecords) ? financialRecords : [];

        try {
          const existing = autoBackupService.getPersistentData();
          if (finalProjects.length === 0 && existing && Array.isArray(existing.projects) && existing.projects.length > 0) {
            finalProjects = existing.projects;
          }
          if (finalDebts.length === 0 && existing && Array.isArray(existing.debtRecords) && existing.debtRecords.length > 0) {
            finalDebts = existing.debtRecords;
          }
          if (finalFin.length === 0 && existing && Array.isArray(existing.financialRecords) && existing.financialRecords.length > 0) {
            finalFin = existing.financialRecords;
          }
        } catch (_) {}

        // 1. Primary Persistent Cache in LocalStorage
        const payload: PersistentDataPayload = {
          financialRecords: finalFin,
          debtRecords: finalDebts,
          projects: finalProjects,
          updatedAt: dateStr,
          timestamp: now,
          version: 2,
        };

        localStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(payload));

        // Dedicated per-entity fallback storage
        try {
          if (finalProjects.length > 0) localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(finalProjects));
          if (finalDebts.length > 0) localStorage.setItem(DEBTS_CACHE_KEY, JSON.stringify(finalDebts));
          if (finalFin.length > 0) localStorage.setItem(FINANCE_CACHE_KEY, JSON.stringify(finalFin));
        } catch (_) {}

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
              financialRecordsCount: finalFin.length,
              debtRecordsCount: finalDebts.length,
              projectsCount: finalProjects.length,
              data: {
                financialRecords: finalFin,
                debtRecords: finalDebts,
                projects: finalProjects,
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
        try {
          await dbService.setDocument("systemBackups", "latest_synced_data", {
            updatedAt: dateStr,
            timestamp: now,
            trigger: triggerReason,
            financialRecordsCount: finalFin.length,
            debtRecordsCount: finalDebts.length,
            projectsCount: finalProjects.length,
            financialRecords: finalFin,
            debtRecords: finalDebts,
            projects: finalProjects,
          });
        } catch (cloudErr) {
          console.warn("[AutoBackup] Cloud sync Firestore skipped, data tetap aman di LocalStorage:", cloudErr);
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
   * Get persistent data from local storage with automatic fallback to dedicated cache keys or history
   */
  getPersistentData: (): PersistentDataPayload | null => {
    try {
      const raw = localStorage.getItem(PERSISTENT_CACHE_KEY);
      let parsed = raw ? JSON.parse(raw) : null;

      // Fallback check to individual dedicated caches
      let projFallback: any[] = [];
      let debtFallback: any[] = [];
      let finFallback: any[] = [];

      try {
        const rawProj = localStorage.getItem(PROJECTS_CACHE_KEY);
        if (rawProj) projFallback = JSON.parse(rawProj) || [];
      } catch (_) {}
      try {
        const rawDebt = localStorage.getItem(DEBTS_CACHE_KEY);
        if (rawDebt) debtFallback = JSON.parse(rawDebt) || [];
      } catch (_) {}
      try {
        const rawFin = localStorage.getItem(FINANCE_CACHE_KEY);
        if (rawFin) finFallback = JSON.parse(rawFin) || [];
      } catch (_) {}

      // If persistent cache is empty or incomplete, try to merge from history
      if (!parsed || (!parsed.projects?.length && !parsed.debtRecords?.length && !parsed.financialRecords?.length)) {
        const history = autoBackupService.getAvailableBackups();
        if (history.length > 0) {
          const best = history[0];
          if (best && best.data) {
            parsed = {
              financialRecords: best.data.financialRecords || [],
              debtRecords: best.data.debtRecords || [],
              projects: best.data.projects || [],
              updatedAt: new Date(best.timestamp).toISOString(),
              timestamp: best.timestamp,
              version: 2,
            };
          }
        }
      }

      if (parsed) {
        if ((!parsed.projects || parsed.projects.length === 0) && projFallback.length > 0) {
          parsed.projects = projFallback;
        }
        if ((!parsed.debtRecords || parsed.debtRecords.length === 0) && debtFallback.length > 0) {
          parsed.debtRecords = debtFallback;
        }
        if ((!parsed.financialRecords || parsed.financialRecords.length === 0) && finFallback.length > 0) {
          parsed.financialRecords = finFallback;
        }

        if (
          Array.isArray(parsed.financialRecords) ||
          Array.isArray(parsed.debtRecords) ||
          Array.isArray(parsed.projects)
        ) {
          return parsed as PersistentDataPayload;
        }
      }

      // If parsed was still null but dedicated fallbacks exist
      if (projFallback.length > 0 || debtFallback.length > 0 || finFallback.length > 0) {
        return {
          financialRecords: finFallback,
          debtRecords: debtFallback,
          projects: projFallback,
          updatedAt: new Date().toISOString(),
          timestamp: Date.now(),
          version: 2,
        };
      }

      return null;
    } catch (e) {
      console.error("[AutoBackup] Error reading persistent data:", e);
      return null;
    }
  },

  /**
   * Find the most complete backup snapshot available in history
   */
  recoverBestAvailableSnapshot: (): PersistentDataPayload | null => {
    try {
      const history = autoBackupService.getAvailableBackups();
      if (!history || history.length === 0) {
        return autoBackupService.getPersistentData();
      }

      // Find the backup with the maximum total data count or latest rich data
      let best = history[0];
      let maxScore = (best.financialRecordsCount || 0) + (best.debtRecordsCount || 0) + (best.projectsCount || 0);

      for (const item of history) {
        const score = (item.financialRecordsCount || 0) + (item.debtRecordsCount || 0) + (item.projectsCount || 0);
        if (score > maxScore) {
          maxScore = score;
          best = item;
        }
      }

      if (best && best.data) {
        return {
          financialRecords: best.data.financialRecords || [],
          debtRecords: best.data.debtRecords || [],
          projects: best.data.projects || [],
          updatedAt: new Date(best.timestamp).toISOString(),
          timestamp: best.timestamp,
          version: 2,
        };
      }
      return autoBackupService.getPersistentData();
    } catch (e) {
      console.warn("[AutoBackup] Error finding best available snapshot:", e);
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

      // Broadcast individual items directly to their respective Firestore collections
      // so real-time onCollectionSnapshot listeners trigger across all instances immediately
      const writeTasks: Promise<any>[] = [];

      if (Array.isArray(projects)) {
        for (const p of projects) {
          if (p && p.id) {
            writeTasks.push(dbService.setDocument("projects", p.id, p));
          }
        }
      }

      if (Array.isArray(debtRecords)) {
        for (const d of debtRecords) {
          const docId = d.id || d.customId;
          if (docId) {
            writeTasks.push(dbService.setDocument("debtRecords", docId, d));
          }
        }
      }

      if (Array.isArray(financialRecords)) {
        // Broadcast financial records
        for (const f of financialRecords) {
          const docId = f.id || f.customId;
          if (docId) {
            writeTasks.push(dbService.setDocument("financialRecords", docId, f));
          }
        }
      }

      await Promise.allSettled(writeTasks);

      return {
        success: true,
        message: `Berhasil menyinkronkan ${financialRecords.length} transaksi, ${debtRecords.length} catatan hutang, dan ${(projects || []).length} proyek ke cloud database secara real-time.`,
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
