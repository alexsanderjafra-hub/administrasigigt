import React, { useState, useMemo } from "react";
import {
  ClipboardList,
  FileDown,
  FolderKanban,
  Plus,
  Search,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Download,
  Eye,
  Trash2,
  Building2,
  User,
  Clock,
  SunMedium,
  Layers,
  HardHat,
  FileText,
  CheckSquare,
  Square,
  Image as ImageIcon,
  UploadCloud,
  Briefcase,
  Wrench,
  Package,
  X,
  Sparkles,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { DailyReport, Project, ScreenId, RoleConfig, CompanyProfile } from "../types";
import { dbService } from "../services/db";
import {
  generateDailyReportPDF,
  generateBatchDailyReportsPDF,
  formatIndonesianDateUpper,
  formatIndonesianDateShort,
} from "../utils/dailyReportPdf";

interface AdminDailyReportsScreenProps {
  projects: Project[];
  dailyReports: DailyReport[];
  setDailyReports?: (reports: DailyReport[]) => void;
  currentUser: any;
  roles: RoleConfig[];
  onNavigate: (s: ScreenId) => void;
  companyProfile?: CompanyProfile;
  onOpenCreateReport?: (projectId?: string) => void;
}

export function AdminDailyReportsScreen({
  projects,
  dailyReports,
  setDailyReports,
  currentUser,
  roles,
  onNavigate,
  companyProfile,
  onOpenCreateReport,
}: AdminDailyReportsScreenProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());
  const [previewReport, setPreviewReport] = useState<DailyReport | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "all-reports">("projects");

  // Group daily reports by project ID or project name
  const reportsByProject = useMemo(() => {
    const map = new Map<string, DailyReport[]>();
    // Group existing reports
    dailyReports.forEach((report) => {
      // Find matching project
      const matchProject = projects.find(
        (p) =>
          p.id === report.projectId ||
          p.name.toLowerCase().trim() === (report.projectName || "").toLowerCase().trim()
      );
      const key = matchProject ? matchProject.id : report.projectId || report.projectName || "other";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(report);
    });

    // Ensure all registered projects have an entry in the map
    projects.forEach((p) => {
      if (!map.has(p.id)) {
        map.set(p.id, []);
      }
    });

    return map;
  }, [dailyReports, projects]);

  // Selected project object if any
  const currentProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  // Reports for the selected project
  const currentProjectReports = useMemo(() => {
    if (!selectedProjectId) return [];
    const list = reportsByProject.get(selectedProjectId) || [];
    // Sort chronologically descending for display (latest on top)
    return [...list].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.date || 0).getTime();
      const timeB = new Date(b.timestamp || b.date || 0).getTime();
      return timeB - timeA;
    });
  }, [selectedProjectId, reportsByProject]);

  // Filtered reports for the selected project
  const filteredProjectReports = useMemo(() => {
    return currentProjectReports.filter((r) => {
      const search = searchQuery.toLowerCase().trim();
      const matchSearch =
        !search ||
        (r.projectName && r.projectName.toLowerCase().includes(search)) ||
        (r.submittedByName && r.submittedByName.toLowerCase().includes(search)) ||
        (r.location && r.location.toLowerCase().includes(search)) ||
        (r.activities && r.activities.some((a) => a.toLowerCase().includes(search)));

      const matchDate =
        !dateFilter ||
        (r.date && r.date.includes(dateFilter)) ||
        (r.timestamp &&
          new Date(r.timestamp).toISOString().split("T")[0].includes(dateFilter));

      return matchSearch && matchDate;
    });
  }, [currentProjectReports, searchQuery, dateFilter]);

  // Handle Select All toggle
  const handleToggleSelectAll = () => {
    if (selectedReportIds.size === filteredProjectReports.length && filteredProjectReports.length > 0) {
      setSelectedReportIds(new Set());
    } else {
      const allIds = new Set(filteredProjectReports.map((r) => r.id));
      setSelectedReportIds(allIds);
    }
  };

  // Toggle single report checkbox
  const handleToggleSelectReport = (id: string) => {
    const next = new Set(selectedReportIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedReportIds(next);
  };

  // Handle batch download for selected reports or all project reports
  const handleBatchDownload = (targetReports?: DailyReport[]) => {
    const listToDownload =
      targetReports ||
      (selectedReportIds.size > 0
        ? currentProjectReports.filter((r) => selectedReportIds.has(r.id))
        : currentProjectReports);

    if (listToDownload.length === 0) {
      alert("Pilih minimal 1 laporan harian untuk di-download.");
      return;
    }

    setIsBatchGenerating(true);
    try {
      generateBatchDailyReportsPDF(
        listToDownload,
        currentProject?.name || listToDownload[0]?.projectName || "PROJEK"
      );
    } catch (err) {
      console.error("Error generating batch daily reports PDF:", err);
      alert("Gagal membuat PDF kompilasi. Silakan periksa format data.");
    } finally {
      setIsBatchGenerating(false);
    }
  };

  // Handle delete daily report
  const handleDeleteReport = async (reportId: string, projectName: string) => {
    if (
      !window.confirm(
        `Hapus laporan harian projek ${projectName}? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    try {
      await dbService.deleteDocument("dailyReports", reportId);
      if (setDailyReports) {
        setDailyReports(dailyReports.filter((r) => r.id !== reportId));
      }
      setSelectedReportIds((prev) => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
      if (previewReport?.id === reportId) {
        setPreviewReport(null);
      }
    } catch (err) {
      console.error("Delete report error:", err);
      alert("Gagal menghapus laporan harian.");
    }
  };

  // Stats calculation
  const totalReportsCount = dailyReports.length;
  const totalProjectsWithReports = Array.from(reportsByProject.entries()).filter(
    ([_, list]) => list.length > 0
  ).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
            <ClipboardList size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Laporan Harian Proyek
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {totalReportsCount} Laporan Tersimpan
              </span>
            </div>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              Kompilasi & unduh laporan harian proyek per hari maupun gabungan PDF multi-hari.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenCreateReport ? (
            <button
              onClick={() => onOpenCreateReport(selectedProjectId || undefined)}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={18} />
              <span>Buat Laporan Harian</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate("laporan-lapangan")}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={18} />
              <span>Buat Laporan Harian</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Laporan</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalReportsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FolderKanban size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proyek Berjalan</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{projects.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proyek Berlaporan</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalProjectsWithReports}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileDown size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fitur Kompilasi</p>
            <h3 className="text-sm font-black text-amber-700 mt-0.5">Gabung 1 PDF (60+ Lembar)</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedProjectId ? (
        /* ================= VIEW 1: DAFTAR SEMUA PROYEK ================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("projects")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "projects"
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Pilih Berdasarkan Proyek ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab("all-reports")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "all-reports"
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Semua Laporan Terbaru ({dailyReports.length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama projek, klien..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {activeTab === "projects" ? (
            /* GRID DAFTAR PROYEK */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects
                .filter((p) => {
                  const s = searchQuery.toLowerCase().trim();
                  return (
                    !s ||
                    p.name.toLowerCase().includes(s) ||
                    (p.client && p.client.toLowerCase().includes(s)) ||
                    (p.location && p.location.toLowerCase().includes(s))
                  );
                })
                .map((project) => {
                  const projectReports = reportsByProject.get(project.id) || [];
                  const count = projectReports.length;
                  const latestReport = projectReports.length > 0
                    ? [...projectReports].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0]
                    : null;

                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Badge & Count */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-bold ${
                              count > 0
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {count} Laporan Harian
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              project.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : project.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {project.status || "Aktif"}
                          </span>
                        </div>

                        {/* Project Info */}
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                          {project.name}
                        </h3>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">
                              Klien: <strong className="text-slate-700">{project.client || "-"}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{project.location || "Lokasi Lapangan"}</span>
                          </div>
                          {latestReport && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar size={14} className="text-slate-400 shrink-0" />
                              <span>
                                Laporan Terakhir:{" "}
                                <strong>
                                  {formatIndonesianDateShort(
                                    latestReport.timestamp || latestReport.date
                                  )}
                                </strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                        <button
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setSelectedReportIds(new Set());
                          }}
                          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <span>Buka Laporan Projek</span>
                          <ChevronRight size={16} />
                        </button>

                        {count > 0 && (
                          <button
                            onClick={() => handleBatchDownload(projectReports)}
                            disabled={isBatchGenerating}
                            className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                            title="Unduh seluruh laporan projek ini menjadi 1 PDF gabungan"
                          >
                            <FileDown size={15} />
                            <span>Download Semua ({count} PDF Digabung)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            /* TAB: SEMUA LAPORAN TERBARU */
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  Daftar Seluruh Laporan Harian Proyek
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Menampilkan {dailyReports.length} laporan
                </span>
              </div>

              {dailyReports.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardList size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-600">Belum Ada Laporan Harian</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Silakan buat laporan harian baru menggunakan tombol di atas.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {dailyReports.map((report) => {
                    const titleUpper = `DAILY REPORT ${(
                      report.projectName || "PROJEK"
                    ).toUpperCase()} ${formatIndonesianDateUpper(
                      report.timestamp || report.date
                    )}`;

                    return (
                      <div
                        key={report.id}
                        className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                              {titleUpper}
                            </span>
                            {report.workType && (
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {report.workType}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
                            <span className="flex items-center gap-1">
                              <User size={13} className="text-slate-400" />
                              {report.submittedByName || "Mandor/Supervisor"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <HardHat size={13} className="text-slate-400" />
                              {report.staff?.reduce((a, b) => a + (b.jumlah || 0), 0) || 1} Pekerja
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <ImageIcon size={13} className="text-slate-400" />
                              {report.photos?.length || 0} Foto
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => setPreviewReport(report)}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                            title="Lihat Detail Laporan"
                          >
                            <Eye size={15} />
                            <span className="hidden md:inline">Detail</span>
                          </button>
                          <button
                            onClick={() => generateDailyReportPDF(report)}
                            className="py-2.5 px-3.5 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            title="Download PDF Laporan Ini"
                          >
                            <Download size={15} />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ================= VIEW 2: DETAIL LAPORAN PER PROJEK ================= */
        <div className="space-y-6">
          {/* Breadcrumb & Project Header */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <button
              onClick={() => {
                setSelectedProjectId(null);
                setSelectedReportIds(new Set());
                setSearchQuery("");
                setDateFilter("");
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider mb-4 transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Kembali ke Daftar Semua Proyek</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900">
                    {currentProject?.name || "Laporan Projek"}
                  </h2>
                  <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-bold">
                    {currentProjectReports.length} Laporan Tersedia
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={15} className="text-slate-400" />
                    <span>
                      Klien: <strong className="text-slate-700">{currentProject?.client || "-"}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-slate-400" />
                    <span>{currentProject?.location || "Lokasi Proyek"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={15} className="text-slate-400" />
                    <span>Kategori: {currentProject?.category || "WWTP / STP / Konstruksi"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for this Project */}
              <div className="flex flex-wrap items-center gap-3">
                {currentProjectReports.length > 0 && (
                  <button
                    onClick={() => handleBatchDownload()}
                    disabled={isBatchGenerating}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    title="Download seluruh atau laporan terpilih menjadi 1 PDF gabungan"
                  >
                    <FileDown size={18} />
                    <span>
                      {selectedReportIds.size > 0
                        ? `Download Kompilasi (${selectedReportIds.size} Laporan Jadi 1 PDF)`
                        : `Download Semua (${currentProjectReports.length} Laporan Jadi 1 PDF)`}
                    </span>
                  </button>
                )}

                {onOpenCreateReport ? (
                  <button
                    onClick={() => onOpenCreateReport(currentProject?.id)}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs transition-all"
                  >
                    <Plus size={16} />
                    <span>+ Laporan Harian Baru</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate("laporan-lapangan")}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs transition-all"
                  >
                    <Plus size={16} />
                    <span>+ Laporan Harian Baru</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter & Selection Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                {selectedReportIds.size === filteredProjectReports.length &&
                filteredProjectReports.length > 0 ? (
                  <CheckSquare size={16} className="text-primary" />
                ) : (
                  <Square size={16} className="text-slate-400" />
                )}
                <span>
                  {selectedReportIds.size === filteredProjectReports.length &&
                  filteredProjectReports.length > 0
                    ? "Batal Pilih Semua"
                    : "Pilih Semua"}
                </span>
              </button>

              {selectedReportIds.size > 0 && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl">
                  {selectedReportIds.size} dipilih
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Calendar
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="relative w-full sm:w-60">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari aktivitas/kendala..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* List of Reports for this Project */}
          {filteredProjectReports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
              <ClipboardList size={48} className="mx-auto text-slate-300 mb-3" />
              <h4 className="text-base font-bold text-slate-800">
                Belum Ada Laporan Harian Untuk Proyek Ini
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Silakan buat laporan harian baru untuk proyek ini agar dapat dipantau dan di-download secara kompilasi.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjectReports.map((report) => {
                const isSelected = selectedReportIds.has(report.id);
                const titleUpper = `DAILY REPORT ${(
                  report.projectName ||
                  currentProject?.name ||
                  "PROJEK"
                ).toUpperCase()} ${formatIndonesianDateUpper(
                  report.timestamp || report.date
                )}`;

                return (
                  <div
                    key={report.id}
                    className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/10 shadow-md bg-blue-50/20"
                        : "border-slate-100 hover:border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Checkbox + Title & Metadata */}
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleSelectReport(report.id)}
                          className="mt-1 text-slate-400 hover:text-primary transition-colors shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare size={22} className="text-primary" />
                          ) : (
                            <Square size={22} />
                          )}
                        </button>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-mono text-sm sm:text-base font-black text-slate-900 tracking-tight">
                              {titleUpper}
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                              {report.workType || "Konstruksi & Sipil"}
                            </span>
                          </div>

                          {/* Quick Badges */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <User size={13} className="text-slate-400" />
                              Pelapor: <strong>{report.submittedByName || "Mandor"}</strong>
                            </span>

                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <HardHat size={13} className="text-slate-400" />
                              Tenaga Kerja:{" "}
                              <strong>
                                {report.staff?.reduce((a, b) => a + (b.jumlah || 0), 0) || 1} Orang
                              </strong>
                            </span>

                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <SunMedium size={13} className="text-amber-500" />
                              Cuaca: <strong>{report.weather?.[0]?.type || "Cerah"}</strong>
                            </span>

                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <Clock size={13} className="text-blue-500" />
                              Lembur: <strong>{report.overtime || 0} Jam</strong>
                            </span>

                            {report.photos && report.photos.length > 0 && (
                              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 font-bold">
                                <ImageIcon size={13} />
                                {report.photos.length} Foto Lapangan
                              </span>
                            )}
                          </div>

                          {/* Activities Snapshot */}
                          {report.activities && report.activities.length > 0 && (
                            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="font-bold text-slate-800">Uraian Pekerjaan: </span>
                              <span>{report.activities.slice(0, 2).join(" • ")}</span>
                              {report.activities.length > 2 && (
                                <span className="text-slate-400"> (+{report.activities.length - 2} lainnya)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                        <button
                          onClick={() => setPreviewReport(report)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                          title="Lihat rincian lengkap laporan"
                        >
                          <Eye size={15} />
                          <span>Rincian</span>
                        </button>

                        <button
                          onClick={() => generateDailyReportPDF(report)}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 transition-all"
                          title="Download 1 file PDF (2 lembar)"
                        >
                          <Download size={15} />
                          <span>Download PDF</span>
                        </button>

                        {currentUser?.role === "admin" && (
                          <button
                            onClick={() =>
                              handleDeleteReport(
                                report.id,
                                report.projectName || currentProject?.name || "Proyek"
                              )
                            }
                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                            title="Hapus Laporan Harian"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= DETAIL MODAL ================= */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Pratinjau Laporan Harian
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  DAILY REPORT {(previewReport.projectName || "PROJEK").toUpperCase()}{" "}
                  {formatIndonesianDateUpper(previewReport.timestamp || previewReport.date)}
                </h3>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
              {/* Dual Logo Header Preview */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                    {previewReport.contractorLogo || localStorage.getItem("custom_contractor_logo") ? (
                      <img
                        src={previewReport.contractorLogo || localStorage.getItem("custom_contractor_logo") || ""}
                        alt="Vendor Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Building2 size={20} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Kontraktor</span>
                    <p className="font-bold text-slate-900 text-xs">
                      {previewReport.contractor || "PT. GARDA INOVASI GLOBALTECH"}
                    </p>
                  </div>
                </div>

                <div className="text-center hidden sm:block">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Format Kop Surat 2 Logo
                  </span>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Klien / Pemilik</span>
                    <p className="font-bold text-slate-900 text-xs">
                      {previewReport.clientName || "Klien Terdaftar"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                    {previewReport.clientLogo ||
                    (previewReport.projectId &&
                      localStorage.getItem(`custom_client_logo_${previewReport.projectId}`)) ? (
                      <img
                        src={
                          previewReport.clientLogo ||
                          (previewReport.projectId &&
                            localStorage.getItem(`custom_client_logo_${previewReport.projectId}`)) ||
                          ""
                        }
                        alt="Client Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Building2 size={20} className="text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* 1. Man Power */}
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2">
                  1. Tenaga Kerja (Man Power)
                </h4>
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-blue-600 text-white font-bold">
                      <tr>
                        <th className="py-2 px-3 text-left w-12">No</th>
                        <th className="py-2 px-3 text-left">Jabatan / Keahlian</th>
                        <th className="py-2 px-3 text-right w-28">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {(previewReport.staff || []).map((s, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3 text-slate-800">{s.jabatan || "-"}</td>
                          <td className="py-2 px-3 text-right text-slate-800">{s.jumlah || 0} Orang</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Tools & Materials */}
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2">
                  2. Alat Kerja & Bahan Digunakan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-xs text-slate-500 uppercase">Alat Kerja</span>
                    <ul className="mt-1 space-y-1 text-xs">
                      {(previewReport.tools || []).map((t, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>{typeof t === "string" ? t : (t as any).name || "-"}</span>
                        </li>
                      ))}
                      {(!previewReport.tools || previewReport.tools.length === 0) && (
                        <li className="text-slate-400 italic">Tidak ada data</li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-xs text-slate-500 uppercase">Bahan / Material</span>
                    <ul className="mt-1 space-y-1 text-xs">
                      {(previewReport.materials || []).map((m, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>{typeof m === "string" ? m : m.jenis || (m as any).name || "-"}</span>
                        </li>
                      ))}
                      {(!previewReport.materials || previewReport.materials.length === 0) && (
                        <li className="text-slate-400 italic">Tidak ada data</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3. Activities */}
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2">
                  3. Uraian Pekerjaan (Activity)
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  {(previewReport.activities || []).map((act, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="font-bold text-blue-600 shrink-0">{idx + 1}.</span>
                      <span className="text-slate-800">{act}</span>
                    </div>
                  ))}
                  {(!previewReport.activities || previewReport.activities.length === 0) && (
                    <p className="text-xs text-slate-400 italic">Tidak ada uraian pekerjaan</p>
                  )}
                </div>
              </div>

              {/* 4. Kendala & Rencana Besok */}
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2">
                  4. Kendala & Rencana Besok
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <span className="font-bold text-rose-800 uppercase">Kendala Lapangan:</span>
                    <div className="mt-1 space-y-1 text-rose-950 font-medium">
                      {Array.isArray(previewReport.obstacles) ? (
                        previewReport.obstacles.map((obs, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="font-bold">{i + 1}.</span>
                            <span>{obs}</span>
                          </div>
                        ))
                      ) : (
                        <p>{previewReport.obstacles || "Tidak Ada Kendala"}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-800 uppercase">Rencana Pekerjaan Besok:</span>
                    <div className="mt-1 space-y-1 text-blue-950 font-medium">
                      {Array.isArray(previewReport.nextPlan) ? (
                        previewReport.nextPlan.map((plan, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="font-bold">{i + 1}.</span>
                            <span>{plan}</span>
                          </div>
                        ))
                      ) : (
                        <p>{previewReport.nextPlan || "-"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Photos */}
              {previewReport.photos && previewReport.photos.length > 0 && (
                <div>
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2">
                    5. Dokumentasi Foto Lapangan ({previewReport.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previewReport.photos.map((photo, i) => (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group relative aspect-video"
                      >
                        <img
                          src={photo}
                          alt={`Dokumentasi #${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          #{i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Tutup
              </button>
              <button
                onClick={() => generateDailyReportPDF(previewReport)}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Download size={16} />
                <span>Download PDF Laporan Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
