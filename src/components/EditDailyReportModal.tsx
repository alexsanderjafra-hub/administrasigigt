import React, { useState, useMemo } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  Users,
  Wrench,
  Package,
  Activity,
  Clock,
  Camera,
  FileText,
  CloudUpload,
  AlertTriangle,
  Download,
  Calendar,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import { DailyReport, Project } from "../types";
import { dbService } from "../services/db";
import { compressImage, extractCleanAddress, readAndCompressActivityPhotos } from "../lib/utils";
import { generateDailyReportPDF } from "../utils/dailyReportPdf";
import { HistoryAutocompleteInput } from "./HistoryAutocompleteInput";
import {
  buildCombinedFieldHistory,
  saveDailyReportToHistory,
  saveInputHistoryValue,
  removeLocalInputHistoryValue,
  ReportHistoryField,
} from "../utils/inputHistory";

interface EditDailyReportModalProps {
  report: DailyReport;
  projects: Project[];
  dailyReports?: DailyReport[];
  currentUser: any;
  onClose: () => void;
  onSaved: (updatedReport: DailyReport) => void;
}

const normalizeStringList = (val: string | string[] | undefined): string[] => {
  if (Array.isArray(val)) {
    const cleaned = val.map((item) => (typeof item === "string" ? item : String(item || "")));
    return cleaned.length > 0 ? cleaned : [""];
  }
  if (typeof val === "string" && val.trim().length > 0) {
    return [val];
  }
  return [""];
};

const normalizeToolsList = (tools: any[] | undefined): string[] => {
  if (!Array.isArray(tools) || tools.length === 0) return [""];
  return tools.map((t) => (typeof t === "string" ? t : t?.name || String(t || "")));
};

const normalizeMaterialsList = (materials: any[] | undefined): { jenis: string; volume?: string; volumeKumulatif?: string }[] => {
  if (!Array.isArray(materials) || materials.length === 0) return [{ jenis: "" }];
  return materials.map((m) =>
    typeof m === "string"
      ? { jenis: m }
      : {
          jenis: m?.jenis || m?.name || "",
          ...(m?.volume !== undefined ? { volume: m.volume } : {}),
          ...(m?.volumeKumulatif !== undefined ? { volumeKumulatif: m.volumeKumulatif } : {}),
        }
  );
};

const normalizeWeatherArray = (weather: any[] | undefined) => {
  const defaultType =
    (Array.isArray(weather) ? weather.find((w: any) => w?.hour === 12)?.type || weather[0]?.type : null) ||
    "Cerah";
  return Array(24)
    .fill(null)
    .map((_, i) => ({
      hour: i + 1,
      type: (defaultType === "Hujan" || defaultType === "Mendung" ? defaultType : "Cerah") as
        | "Cerah"
        | "Hujan"
        | "Mendung",
    }));
};

const toLocalDateInput = (ts: number | string | undefined): string => {
  const d = new Date(ts || Date.now());
  if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toLocalTimeInput = (ts: number | string | undefined): string => {
  const d = new Date(ts || Date.now());
  if (isNaN(d.getTime())) return "08:00";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const EditDailyReportModal: React.FC<EditDailyReportModalProps> = ({
  report,
  projects,
  dailyReports = [],
  currentUser,
  onClose,
  onSaved,
}) => {
  const baseTs = report.timestamp || report.date || Date.now();
  const [reportDateStr, setReportDateStr] = useState<string>(() => toLocalDateInput(baseTs));
  const [reportTimeStr, setReportTimeStr] = useState<string>(() => toLocalTimeInput(baseTs));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [formError, setFormError] = useState("");
  const [historyVersion, setHistoryVersion] = useState(0);
  const isAdminUser =
    ["admin", "owner", "direktur"].includes(String(currentUser?.role || "").toLowerCase()) ||
    Boolean(currentUser?.isAdmin);

  const historyByField = useMemo(() => {
    const fields: ReportHistoryField[] = [
      "contractor",
      "clientName",
      "location",
      "workType",
      "staff_jabatan",
      "tools",
      "materials",
      "activities",
      "obstacles",
      "nextPlan",
      "notes",
    ];
    const map: Record<string, string[]> = {};
    fields.forEach((f) => {
      map[f] = buildCombinedFieldHistory(f, dailyReports, []);
    });
    return map;
  }, [dailyReports, historyVersion]);

  const handleSaveFieldHistory = (field: ReportHistoryField, val: string) => {
    saveInputHistoryValue(field, val);
    setHistoryVersion((v) => v + 1);
  };

  const handleRemoveFieldHistory = (field: ReportHistoryField, val: string) => {
    removeLocalInputHistoryValue(field, val);
    setHistoryVersion((v) => v + 1);
  };

  const [draft, setDraft] = useState<{
    projectId: string;
    projectName: string;
    clientName: string;
    location: string;
    workType: string;
    contractor: string;
    contractorLogo: string;
    clientLogo: string;
    submittedByName: string;
    submittedByRole: string;
    staff: { jabatan: string; jumlah: number }[];
    tools: string[];
    materials: { jenis: string; volume?: string; volumeKumulatif?: string }[];
    activities: string[];
    workHours: number[];
    weather: { hour: number; type: "Cerah" | "Hujan" | "Mendung" }[];
    overtime: number;
    obstacles: string[];
    nextPlan: string[];
    notes: string[];
    photos: string[];
  }>(() => ({
    projectId: report.projectId || "",
    projectName: report.projectName || "",
    clientName: report.clientName || "",
    location: report.location || "",
    workType: report.workType || "Konstruksi & Sipil",
    contractor: report.contractor || "",
    contractorLogo: report.contractorLogo || "",
    clientLogo: report.clientLogo || "",
    submittedByName: report.submittedByName || "",
    submittedByRole: report.submittedByRole || "Karyawan",
    staff:
      Array.isArray(report.staff) && report.staff.length > 0
        ? report.staff.map((s) => ({
            jabatan: s?.jabatan || "",
            jumlah: Number(s?.jumlah) || 0,
          }))
        : [{ jabatan: "", jumlah: 0 }],
    tools: normalizeToolsList(report.tools),
    materials: normalizeMaterialsList(report.materials),
    activities:
      Array.isArray(report.activities) && report.activities.length > 0
        ? [...report.activities]
        : [""],
    workHours:
      Array.isArray(report.workHours) && report.workHours.length >= 2
        ? [Number(report.workHours[0]) ?? 8, Number(report.workHours[1]) ?? 17]
        : [8, 17],
    weather: normalizeWeatherArray(report.weather),
    overtime: Number(report.overtime) || 0,
    obstacles: normalizeStringList(report.obstacles),
    nextPlan: normalizeStringList(report.nextPlan),
    notes: normalizeStringList(report.notes),
    photos: Array.isArray(report.photos) ? [...report.photos] : [],
  }));

  const buildTimestamp = (): number => {
    const [y, m, d] = reportDateStr.split("-").map(Number);
    const [hh, mm] = (reportTimeStr || "08:00").split(":").map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      const dt = new Date(y, m - 1, d, isNaN(hh) ? 8 : hh, isNaN(mm) ? 0 : mm, 0);
      if (!isNaN(dt.getTime())) return dt.getTime();
    }
    return report.timestamp || report.date || Date.now();
  };

  const buildReportObject = (): DailyReport => {
    const nextTimestamp = buildTimestamp();
    return {
      ...report,
      projectId: draft.projectId,
      projectName: draft.projectName.trim() || report.projectName || "PROJEK",
      clientName: draft.clientName.trim(),
      location: draft.location.trim(),
      workType: draft.workType.trim() || "Konstruksi & Sipil",
      contractor: draft.contractor.trim(),
      contractorLogo: draft.contractorLogo || "",
      clientLogo: draft.clientLogo || "",
      submittedByName: draft.submittedByName.trim() || report.submittedByName || "Karyawan",
      submittedByRole: draft.submittedByRole.trim() || report.submittedByRole || "Karyawan",
      staff: draft.staff
        .map((s) => ({ jabatan: s.jabatan.trim(), jumlah: Number(s.jumlah) || 0 }))
        .filter((s) => s.jabatan || s.jumlah > 0),
      tools: draft.tools.map((t) => t.trim()).filter(Boolean),
      materials: draft.materials
        .map((m) => ({ ...m, jenis: m.jenis.trim() }))
        .filter((m) => m.jenis),
      activities: draft.activities.map((a) => a.trim()).filter(Boolean),
      workHours: draft.workHours,
      weather: draft.weather,
      overtime: Math.max(0, Number(draft.overtime) || 0),
      obstacles: draft.obstacles.map((o) => o.trim()).filter(Boolean),
      nextPlan: draft.nextPlan.map((p) => p.trim()).filter(Boolean),
      notes: draft.notes.map((n) => n.trim()).filter(Boolean),
      photos: draft.photos,
      date: nextTimestamp,
      timestamp: nextTimestamp,
      editedBy: currentUser?.uid || currentUser?.id || (isAdminUser ? "admin" : "karyawan"),
      editedByName:
        currentUser?.name ||
        currentUser?.displayName ||
        currentUser?.username ||
        (isAdminUser ? "Admin" : "Karyawan"),
      editedAt: Date.now(),
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.projectName.trim()) {
      setFormError("Nama Projek tidak boleh kosong.");
      return;
    }
    if (!draft.location.trim()) {
      setFormError("Lokasi Pekerjaan / Alamat wajib diisi.");
      return;
    }

    setFormError("");
    setIsSaving(true);
    try {
      const updated = buildReportObject();

      // Guard against Firestore 1MB document limit
      let payloadBytes = new Blob([JSON.stringify(updated)]).size;
      if (payloadBytes > 880_000) {
        if (updated.contractorLogo) {
          try {
            updated.contractorLogo = await compressImage(updated.contractorLogo, 280, 280, 0.72);
          } catch {}
        }
        if (updated.clientLogo) {
          try {
            updated.clientLogo = await compressImage(updated.clientLogo, 280, 280, 0.72);
          } catch {}
        }
        if (Array.isArray(updated.photos) && updated.photos.length > 0) {
          updated.photos = await Promise.all(
            updated.photos.map(async (ph: string) => {
              try {
                return await compressImage(ph, 680, 680, 0.6);
              } catch {
                return ph;
              }
            }),
          );
        }
        payloadBytes = new Blob([JSON.stringify(updated)]).size;
        if (payloadBytes > 930_000 && Array.isArray(updated.photos) && updated.photos.length > 0) {
          updated.photos = await Promise.all(
            updated.photos.map(async (ph: string) => {
              try {
                return await compressImage(ph, 520, 520, 0.48);
              } catch {
                return ph;
              }
            }),
          );
        }
      }

      await dbService.updateDocument("dailyReports", report.id, updated);
      saveDailyReportToHistory(updated);

      try {
        await dbService.createDocument("auditLogs", {
          userId: currentUser?.uid || currentUser?.id || (isAdminUser ? "admin" : "karyawan"),
          userName:
            currentUser?.name ||
            currentUser?.displayName ||
            currentUser?.username ||
            (isAdminUser ? "Admin" : "Karyawan"),
          action: "UPDATE",
          module: "DAILY_REPORT",
          details: `${isAdminUser ? "Admin" : "Karyawan"} mengedit laporan harian projek ${updated.projectName} (Pelapor: ${updated.submittedByName})`,
          timestamp: Date.now(),
        });
      } catch {
        // Non-blocking audit log error
      }

      onSaved(updated);
    } catch (err: any) {
      console.error("Gagal menyimpan perubahan laporan harian:", err);
      setFormError("Gagal menyimpan perubahan: " + (err?.message || "Kesalahan jaringan/database"));
    } finally {
      setIsSaving(false);
    }
  };

  const currentWeatherType = draft.weather.find((w) => w.hour === 12)?.type || "Cerah";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-50 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <ClipboardCheck size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  Edit Laporan Harian Projek
                </h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                    isAdminUser
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isAdminUser ? "Mode Admin" : "Edit Karyawan"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                {draft.projectName || "Laporan Projek"} • Pelapor: {draft.submittedByName || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => generateDailyReportPDF(buildReportObject())}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Preview PDF dengan data hasil edit saat ini"
            >
              <Download size={14} />
              <span>Preview PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 0. Tanggal Laporan, Identitas Projek, Kontraktor & Logo */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar size={15} className="text-indigo-600" /> Tanggal & Informasi Umum Laporan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div>
                <label className="text-[10px] font-black text-indigo-800 uppercase tracking-wider block mb-1.5">
                  Tanggal Laporan
                </label>
                <input
                  type="date"
                  className="input-field text-xs font-bold w-full bg-white"
                  value={reportDateStr}
                  onChange={(e) => setReportDateStr(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-indigo-800 uppercase tracking-wider block mb-1.5">
                  Jam Laporan
                </label>
                <input
                  type="time"
                  className="input-field text-xs font-bold w-full bg-white"
                  value={reportTimeStr}
                  onChange={(e) => setReportTimeStr(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Kategori Pekerjaan
                </label>
                <HistoryAutocompleteInput
                  className="input-field text-xs font-bold w-full bg-white"
                  value={draft.workType}
                  onChange={(val) => setDraft({ ...draft, workType: val })}
                  suggestions={historyByField.workType || []}
                  onSaveHistory={(val) => handleSaveFieldHistory("workType", val)}
                  onRemoveSuggestion={(val) => handleRemoveFieldHistory("workType", val)}
                  placeholder="Konstruksi & Sipil"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Pilih Projek Terdaftar
                </label>
                <select
                  className="input-field text-xs font-bold w-full"
                  value={draft.projectId}
                  onChange={(e) => {
                    const p = projects.find((x) => x.id === e.target.value);
                    if (p) {
                      setDraft((prev) => ({
                        ...prev,
                        projectId: p.id,
                        projectName: p.name,
                        clientName: prev.clientName || p.client || "",
                        location: prev.location || extractCleanAddress(p.location) || "",
                        workType: prev.workType || p.category || "Konstruksi & Sipil",
                      }));
                    } else {
                      setDraft((prev) => ({ ...prev, projectId: e.target.value }));
                    }
                  }}
                >
                  <option value="">-- Custom / Manual --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.client ? `(${p.client})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Nama Projek (Judul PDF) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field text-xs font-bold w-full"
                  value={draft.projectName}
                  onChange={(e) => setDraft({ ...draft, projectName: e.target.value })}
                  placeholder="Nama Proyek"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Perusahaan / Kontraktor
                </label>
                <HistoryAutocompleteInput
                  className="input-field text-xs font-bold w-full"
                  value={draft.contractor}
                  onChange={(val) => setDraft({ ...draft, contractor: val })}
                  suggestions={historyByField.contractor || []}
                  onSaveHistory={(val) => handleSaveFieldHistory("contractor", val)}
                  onRemoveSuggestion={(val) => handleRemoveFieldHistory("contractor", val)}
                  placeholder="Nama Perusahaan / Kontraktor"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Klien / Pemilik Proyek
                </label>
                <HistoryAutocompleteInput
                  className="input-field text-xs font-bold w-full"
                  value={draft.clientName}
                  onChange={(val) => setDraft({ ...draft, clientName: val })}
                  suggestions={historyByField.clientName || []}
                  onSaveHistory={(val) => handleSaveFieldHistory("clientName", val)}
                  onRemoveSuggestion={(val) => handleRemoveFieldHistory("clientName", val)}
                  placeholder="Nama Klien"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Lokasi Pekerjaan / Alamat <span className="text-rose-500">*</span>
                </label>
                <HistoryAutocompleteInput
                  className="input-field text-xs font-bold w-full"
                  value={draft.location}
                  onChange={(val) => setDraft({ ...draft, location: val })}
                  suggestions={historyByField.location || []}
                  onSaveHistory={(val) => handleSaveFieldHistory("location", val)}
                  onRemoveSuggestion={(val) => handleRemoveFieldHistory("location", val)}
                  placeholder="Alamat / Lokasi Pengerjaan"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Nama Pelapor
                </label>
                <input
                  type="text"
                  className="input-field text-xs font-bold w-full"
                  value={draft.submittedByName}
                  onChange={(e) => setDraft({ ...draft, submittedByName: e.target.value })}
                  placeholder="Nama Pelapor"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Jabatan / Role Pelapor
                </label>
                <input
                  type="text"
                  className="input-field text-xs font-bold w-full"
                  value={draft.submittedByRole}
                  onChange={(e) => setDraft({ ...draft, submittedByRole: e.target.value })}
                  placeholder="Mandor / Supervisor / Karyawan"
                />
              </div>
            </div>

            {/* Dual Logos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-dashed border-indigo-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {draft.contractorLogo ? (
                    <img src={draft.contractorLogo} alt="Logo Kontraktor" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-[8px] font-black text-indigo-400 text-center px-1">KONTRAKTOR</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-slate-800 truncate">Logo Kontraktor</span>
                    {draft.contractorLogo && (
                      <button
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, contractorLogo: "" }))}
                        className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer">
                    <CloudUpload size={11} />
                    <span>{draft.contractorLogo ? "Ganti Logo" : "Pilih dari Galeri"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            let base64 = reader.result as string;
                            try {
                              base64 = await compressImage(base64, 500, 500, 0.85);
                            } catch {
                              // keep original
                            }
                            setDraft((prev) => ({ ...prev, contractorLogo: base64 }));
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-dashed border-emerald-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {draft.clientLogo ? (
                    <img src={draft.clientLogo} alt="Logo Client" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-[8px] font-black text-emerald-500 text-center px-1">CLIENT</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-slate-800 truncate">Logo Client</span>
                    {draft.clientLogo && (
                      <button
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, clientLogo: "" }))}
                        className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer">
                    <CloudUpload size={11} />
                    <span>{draft.clientLogo ? "Ganti Logo" : "Pilih dari Galeri"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            let base64 = reader.result as string;
                            try {
                              base64 = await compressImage(base64, 500, 500, 0.85);
                            } catch {
                              // keep original
                            }
                            setDraft((prev) => ({ ...prev, clientLogo: base64 }));
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Tenaga Kerja */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Users size={15} className="text-indigo-600" /> I. Tenaga Kerja (Man Power)
              </h4>
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    staff: [...prev.staff, { jabatan: "", jumlah: 0 }],
                  }))
                }
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Tambah Posisi
              </button>
            </div>
            <div className="space-y-2">
              {draft.staff.map((s, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <HistoryAutocompleteInput
                    placeholder="Jabatan / Keahlian"
                    className="input-field text-xs flex-1"
                    value={s.jabatan}
                    suggestions={historyByField.staff_jabatan || []}
                    onSaveHistory={(val) => handleSaveFieldHistory("staff_jabatan", val)}
                    onRemoveSuggestion={(val) => handleRemoveFieldHistory("staff_jabatan", val)}
                    onChange={(val) => {
                      const next = [...draft.staff];
                      next[idx] = { ...next[idx], jabatan: val };
                      setDraft({ ...draft, staff: next });
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Jml"
                    className="input-field text-xs w-24 text-center font-bold"
                    value={s.jumlah || ""}
                    onChange={(e) => {
                      const next = [...draft.staff];
                      next[idx] = { ...next[idx], jumlah: Math.max(0, Number(e.target.value)) };
                      setDraft({ ...draft, staff: next });
                    }}
                  />
                  {draft.staff.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...draft.staff];
                        next.splice(idx, 1);
                        setDraft({ ...draft, staff: next });
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Alat & Bahan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Wrench size={15} className="text-indigo-600" /> II. Alat Kerja
                </h4>
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, tools: [...prev.tools, ""] }))}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Tambah
                </button>
              </div>
              <div className="space-y-2">
                {draft.tools.map((tool, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <HistoryAutocompleteInput
                      placeholder="Nama Alat Kerja"
                      className="input-field text-xs flex-1"
                      value={tool}
                      suggestions={historyByField.tools || []}
                      onSaveHistory={(val) => handleSaveFieldHistory("tools", val)}
                      onRemoveSuggestion={(val) => handleRemoveFieldHistory("tools", val)}
                      onChange={(val) => {
                        const next = [...draft.tools];
                        next[idx] = val;
                        setDraft({ ...draft, tools: next });
                      }}
                    />
                    {draft.tools.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...draft.tools];
                          next.splice(idx, 1);
                          setDraft({ ...draft, tools: next });
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Package size={15} className="text-indigo-600" /> III. Bahan / Material
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      materials: [...prev.materials, { jenis: "" }],
                    }))
                  }
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Tambah
                </button>
              </div>
              <div className="space-y-2">
                {draft.materials.map((mat, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <HistoryAutocompleteInput
                      placeholder="Nama / Jenis Bahan"
                      className="input-field text-xs flex-1"
                      value={mat.jenis}
                      suggestions={historyByField.materials || []}
                      onSaveHistory={(val) => handleSaveFieldHistory("materials", val)}
                      onRemoveSuggestion={(val) => handleRemoveFieldHistory("materials", val)}
                      onChange={(val) => {
                        const next = [...draft.materials];
                        next[idx] = { ...next[idx], jenis: val };
                        setDraft({ ...draft, materials: next });
                      }}
                    />
                    {draft.materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...draft.materials];
                          next.splice(idx, 1);
                          setDraft({ ...draft, materials: next });
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Uraian Pekerjaan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Activity size={15} className="text-indigo-600" /> IV. Pekerjaan Harian (Activity)
              </h4>
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, activities: [...prev.activities, ""] }))
                }
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Tambah Aktivitas
              </button>
            </div>
            <div className="space-y-2">
              {draft.activities.map((act, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                  <HistoryAutocompleteInput
                    placeholder="Uraian kegiatan / progres"
                    className="input-field text-xs flex-1"
                    value={act}
                    suggestions={historyByField.activities || []}
                    onSaveHistory={(val) => handleSaveFieldHistory("activities", val)}
                    onRemoveSuggestion={(val) => handleRemoveFieldHistory("activities", val)}
                    onChange={(val) => {
                      const next = [...draft.activities];
                      next[idx] = val;
                      setDraft({ ...draft, activities: next });
                    }}
                  />
                  {draft.activities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...draft.activities];
                        next.splice(idx, 1);
                        setDraft({ ...draft, activities: next });
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Cuaca, Jam Kerja & Lembur */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Clock size={15} className="text-indigo-600" /> V. Cuaca, Jam Kerja & Lembur
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Kondisi Cuaca
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Cerah", "Hujan", "Mendung"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          weather: prev.weather.map((w) => ({ ...w, type })),
                        }))
                      }
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        currentWeatherType === type
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>{type === "Cerah" ? "☀️" : type === "Hujan" ? "🌧️" : "☁️"}</span>
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Jam Mulai
                  </label>
                  <select
                    className="input-field text-xs font-bold w-full"
                    value={draft.workHours[0] ?? 8}
                    onChange={(e) =>
                      setDraft({ ...draft, workHours: [Number(e.target.value), draft.workHours[1] ?? 17] })
                    }
                  >
                    {Array(24)
                      .fill(null)
                      .map((_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, "0")}:00
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Jam Selesai
                  </label>
                  <select
                    className="input-field text-xs font-bold w-full"
                    value={draft.workHours[1] ?? 17}
                    onChange={(e) =>
                      setDraft({ ...draft, workHours: [draft.workHours[0] ?? 8, Number(e.target.value)] })
                    }
                  >
                    {Array(24)
                      .fill(null)
                      .map((_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, "0")}:00
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Lembur (Jam)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field text-xs font-bold w-full text-center"
                    value={draft.overtime}
                    onChange={(e) =>
                      setDraft({ ...draft, overtime: Math.max(0, Number(e.target.value)) })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 6. Dokumentasi Foto */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Camera size={15} className="text-indigo-600" /> VI. Dokumentasi Foto ({draft.photos.length}/16)
              </h4>
              {draft.photos.length < 16 && (
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold cursor-pointer">
                  {isUploadingPhotos ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                  <span>{isUploadingPhotos ? "Memproses Foto..." : "Tambah Banyak Foto (Galeri)"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const inputEl = e.currentTarget;
                      const fileList = inputEl.files;
                      if (!fileList || fileList.length === 0) return;
                      setIsUploadingPhotos(true);
                      try {
                        const batch = await readAndCompressActivityPhotos(fileList, 800, 0.72);
                        if (batch.length > 0) {
                          setDraft((prev) => ({
                            ...prev,
                            photos: [...prev.photos, ...batch].slice(0, 16),
                          }));
                        }
                      } finally {
                        setIsUploadingPhotos(false);
                        inputEl.value = "";
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {draft.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {draft.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                  >
                    <img src={photo} alt={`Foto #${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...draft.photos];
                        next.splice(idx, 1);
                        setDraft({ ...draft, photos: next });
                      }}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-rose-500 text-white rounded-lg shadow cursor-pointer"
                      title="Hapus foto"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada foto terlampir.</p>
            )}
          </div>

          {/* 7. Kendala, Rencana Besok, Catatan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText size={15} className="text-indigo-600" /> VII. Kendala, Rencana Besok & Catatan
            </h4>

            {/* Kendala */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Kendala Lapangan
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, obstacles: [...prev.obstacles, ""] }))
                  }
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Tambah
                </button>
              </div>
              {draft.obstacles.map((obs, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                  <HistoryAutocompleteInput
                    className="input-field text-xs flex-1"
                    placeholder="Kendala lapangan..."
                    value={obs}
                    suggestions={historyByField.obstacles || []}
                    onSaveHistory={(val) => handleSaveFieldHistory("obstacles", val)}
                    onRemoveSuggestion={(val) => handleRemoveFieldHistory("obstacles", val)}
                    onChange={(val) => {
                      const next = [...draft.obstacles];
                      next[idx] = val;
                      setDraft({ ...draft, obstacles: next });
                    }}
                  />
                  {draft.obstacles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...draft.obstacles];
                        next.splice(idx, 1);
                        setDraft({ ...draft, obstacles: next });
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Rencana Besok */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Rencana Pekerjaan Besok
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, nextPlan: [...prev.nextPlan, ""] }))
                  }
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Tambah
                </button>
              </div>
              {draft.nextPlan.map((plan, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                  <HistoryAutocompleteInput
                    className="input-field text-xs flex-1"
                    placeholder="Rencana pekerjaan besok..."
                    value={plan}
                    suggestions={historyByField.nextPlan || []}
                    onSaveHistory={(val) => handleSaveFieldHistory("nextPlan", val)}
                    onRemoveSuggestion={(val) => handleRemoveFieldHistory("nextPlan", val)}
                    onChange={(val) => {
                      const next = [...draft.nextPlan];
                      next[idx] = val;
                      setDraft({ ...draft, nextPlan: next });
                    }}
                  />
                  {draft.nextPlan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...draft.nextPlan];
                        next.splice(idx, 1);
                        setDraft({ ...draft, nextPlan: next });
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Catatan */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Catatan Khusus Lapangan
                </span>
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, notes: [...prev.notes, ""] }))}
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Tambah
                </button>
              </div>
              {draft.notes.map((note, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                  <HistoryAutocompleteInput
                    className="input-field text-xs flex-1"
                    placeholder="Catatan khusus lapangan..."
                    value={note}
                    suggestions={historyByField.notes || []}
                    onSaveHistory={(val) => handleSaveFieldHistory("notes", val)}
                    onRemoveSuggestion={(val) => handleRemoveFieldHistory("notes", val)}
                    onChange={(val) => {
                      const next = [...draft.notes];
                      next[idx] = val;
                      setDraft({ ...draft, notes: next });
                    }}
                  />
                  {draft.notes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...draft.notes];
                        next.splice(idx, 1);
                        setDraft({ ...draft, notes: next });
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => generateDailyReportPDF(buildReportObject())}
              className="sm:hidden px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>PDF</span>
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
