import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  ShieldCheck,
  X,
  History,
  RotateCcw
} from "lucide-react";
import { autoBackupService, SystemBackup } from "../services/autoBackupService";
import { FinancialRecord, DebtRecord, Project } from "../types";

interface SyncBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialRecords: FinancialRecord[];
  debtRecords: DebtRecord[];
  projects: Project[];
  onRestoreData: (restored: {
    financialRecords: FinancialRecord[];
    debtRecords: DebtRecord[];
    projects: Project[];
  }) => void;
}

export const SyncBackupModal: React.FC<SyncBackupModalProps> = ({
  isOpen,
  onClose,
  financialRecords,
  debtRecords,
  projects,
  onRestoreData,
}) => {
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [selectedTab, setSelectedTab] = useState<"sync" | "history">("sync");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBackups(autoBackupService.getAvailableBackups());
      setSyncStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePullFromCloud = async () => {
    setIsPulling(true);
    setSyncStatus(null);
    try {
      const cloudSnap = await autoBackupService.fetchCloudLatestSnapshot();
      if (!cloudSnap || (!cloudSnap.projects?.length && !cloudSnap.debtRecords?.length && !cloudSnap.financialRecords?.length)) {
        setSyncStatus("Tidak ada data snapshot cadangan di cloud database.");
        return;
      }
      onRestoreData({
        financialRecords: (cloudSnap.financialRecords || []) as FinancialRecord[],
        debtRecords: (cloudSnap.debtRecords || []) as DebtRecord[],
        projects: (cloudSnap.projects || []) as Project[],
      });
      setSyncStatus(`Berhasil menarik data cloud: ${cloudSnap.financialRecords?.length || 0} transaksi, ${cloudSnap.debtRecords?.length || 0} catatan hutang, ${cloudSnap.projects?.length || 0} proyek.`);
      setBackups(autoBackupService.getAvailableBackups());
    } catch (e: any) {
      setSyncStatus(`Gagal menarik data cloud: ${e?.message || e}`);
    } finally {
      setIsPulling(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await autoBackupService.forceSyncToCloud(
        financialRecords,
        debtRecords,
        projects
      );
      setSyncStatus(res.message);
      setBackups(autoBackupService.getAvailableBackups());
    } catch (e: any) {
      setSyncStatus(`Gagal sinkronisasi: ${e?.message || e}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    autoBackupService.exportBackupFile(financialRecords, debtRecords, projects);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Apakah Anda yakin ingin memulihkan data dari file backup ini? Data saat ini akan digabungkan dan diperbarui.")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const parsed = await autoBackupService.parseBackupFile(file);
      onRestoreData({
        financialRecords: parsed.financialRecords as FinancialRecord[],
        debtRecords: parsed.debtRecords as DebtRecord[],
        projects: parsed.projects as Project[],
      });
      alert(`Berhasil memulihkan ${parsed.financialRecords.length} transaksi dan ${parsed.debtRecords.length} catatan hutang!`);
      setBackups(autoBackupService.getAvailableBackups());
      onClose();
    } catch (err: any) {
      alert(`Gagal memulihkan file backup: ${err?.message || err}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRestoreSnapshot = (backup: SystemBackup) => {
    if (
      !confirm(
        `Pulihkan snapshot data dari "${backup.trigger || backup.date}" (${new Date(
          backup.timestamp
        ).toLocaleTimeString("id-ID")})?`
      )
    ) {
      return;
    }

    onRestoreData({
      financialRecords: (backup.data.financialRecords || []) as FinancialRecord[],
      debtRecords: (backup.data.debtRecords || []) as DebtRecord[],
      projects: (backup.data.projects || []) as Project[],
    });

    alert("Data berhasil dipulihkan dari snapshot riwayat!");
    onClose();
  };

  const persistentData = autoBackupService.getPersistentData();

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black tracking-tight text-white">
                  Pusat Sinkronisasi & Backup Otomatis
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Sinkronkan data hasil edit di AI Studio ke Vercel dan cadangkan otomatis setiap ada perubahan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setSelectedTab("sync")}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              selectedTab === "sync"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Cloud size={14} />
            <span>Sinkronisasi Cloud & File Backup</span>
          </button>
          <button
            onClick={() => setSelectedTab("history")}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              selectedTab === "history"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <History size={14} />
            <span>Riwayat Backup Otomatis ({backups.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
          {selectedTab === "sync" ? (
            <>
              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
                <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black text-emerald-950 text-sm">
                    Fitur Auto-Backup Otomatis Aktif!
                  </p>
                  <p className="text-emerald-800 leading-relaxed font-medium">
                    Sistem kini secara otomatis mencadangkan seluruh data transaksi, hutang, dan proyek{" "}
                    <strong>setiap kali Anda menginput, mengedit, atau menghapus data apa pun</strong>. Data Anda terlindungi dari kehilangan saat aplikasi diperbarui atau dideploy ulang.
                  </p>
                  {persistentData && (
                    <p className="text-[11px] font-mono text-emerald-700 pt-1">
                      🕒 Snapshot Terakhir Tersimpan:{" "}
                      <strong>{new Date(persistentData.timestamp).toLocaleString("id-ID")}</strong> ({persistentData.financialRecords.length} transaksi, {persistentData.debtRecords.length} hutang)
                    </p>
                  )}
                </div>
              </div>

              {/* Status Notification after sync */}
              {syncStatus && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 font-bold ${
                    syncStatus.includes("Berhasil")
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  {syncStatus.includes("Berhasil") ? (
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  )}
                  <span>{syncStatus}</span>
                </div>
              )}

              {/* Current Active Data Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Transaksi Keuangan</p>
                  <p className="text-lg md:text-xl font-mono font-black text-slate-800 mt-0.5">{financialRecords.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Catatan Hutang / Piutang</p>
                  <p className="text-lg md:text-xl font-mono font-black text-purple-700 mt-0.5">{debtRecords.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Data Proyek</p>
                  <p className="text-lg md:text-xl font-mono font-black text-blue-700 mt-0.5">{projects.length}</p>
                </div>
              </div>

              {/* Main Actions */}
              <div className="space-y-3 pt-2">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                  Aksi Sinkronisasi & Pemulihan
                </h4>

                {/* Force Cloud Sync (Push) */}
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <Cloud size={14} className="text-indigo-600" />
                      <span>Kirim & Sinkronkan ke Cloud (Push ke Vercel/Website)</span>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Kirim seluruh data lokal (proyek, hutang piutang, keuangan) ke database cloud Firestore agar website yang dideploy langsung ter-update secara real-time.
                    </p>
                  </div>
                  <button
                    onClick={handleForceSync}
                    disabled={isSyncing || isPulling}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                    <span>{isSyncing ? "Menyinkronkan..." : "Kirim ke Cloud"}</span>
                  </button>
                </div>

                {/* Pull from Cloud */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <RotateCcw size={14} className="text-blue-600" />
                      <span>Tarik Data Terbaru dari Cloud (Pull dari Vercel/Website)</span>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Tarik data proyek, hutang piutang, dan transaksi yang diinput di website luar atau sesi lain ke tampilan saat ini.
                    </p>
                  </div>
                  <button
                    onClick={handlePullFromCloud}
                    disabled={isSyncing || isPulling}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                  >
                    <RotateCcw size={14} className={isPulling ? "animate-spin" : ""} />
                    <span>{isPulling ? "Menarik Data..." : "Tarik dari Cloud"}</span>
                  </button>
                </div>

                {/* Download Backup File */}
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <Download size={14} className="text-emerald-600" />
                      <span>Download File Cadangan Lengkap (JSON)</span>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Unduh arsip data lengkap ke komputer Anda. File ini bisa disimpan sebagai backup fisik dan dipulihkan kapan saja.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Download size={14} />
                    <span>Unduh File Backup</span>
                  </button>
                </div>

                {/* Upload & Restore Backup */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <Upload size={14} className="text-slate-700" />
                      <span>Pulihkan dari File Backup (JSON)</span>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Pilih file cadangan JSON yang sebelumnya pernah diunduh untuk mengembalikan data ke website.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Upload size={14} />
                      <span>Upload & Pulihkan</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                    Snapshot Cadangan Otomatis Tersimpan
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Setiap perubahan data yang Anda lakukan otomatis dicadangkan ke daftar titik pemulihan ini.
                  </p>
                </div>
                <button
                  onClick={() => setBackups(autoBackupService.getAvailableBackups())}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-all cursor-pointer"
                  title="Refresh riwayat"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {backups.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="font-bold">Belum ada riwayat snapshot tersimpan.</p>
                  <p className="text-[11px] mt-0.5">Snapshot akan dibuat otomatis saat Anda menginput atau mengubah data.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                  {backups.map((b) => (
                    <div
                      key={b.id || b.timestamp}
                      className="p-3.5 bg-white hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-800 text-xs">
                            {new Date(b.timestamp).toLocaleString("id-ID")}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                            {b.trigger || "Auto-Snapshot"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {b.financialRecordsCount} Transaksi • {b.debtRecordsCount} Hutang • {b.projectsCount} Proyek
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestoreSnapshot(b)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <RotateCcw size={12} />
                        <span>Pulihkan</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400 font-medium">
            PT Kontraktor Enterprise • Proteksi Data Real-Time
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
