// Workspace Build Version: 2026-08-26T06:53:47.481Z - Clean UTF-8 Release
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Webcam from "react-webcam";
import { compressImage } from "./lib/utils";

const WebcamComponent = Webcam as any;
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  MailOpen,
  Users,
  Activity,
  FileEdit,
  FileSignature,
  CalendarDays,
  CalendarRange,
  MapPin,
  Shield,
  Globe,
  Monitor,
  Mail,
  ArrowDownRight,
  ArrowUpRight,
  Home as HomeIcon,
  Fingerprint,
  Layers,
  CloudOff,
  Wifi,
  WifiOff,
  RefreshCw,
  FileText,
  Bell,
  BellOff,
  Camera,
  HardHat,
  Smartphone,
  CloudUpload,
  Search,
  Download,
  Eye,
  Phone,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Key,
  CreditCard,
  Wallet,
  Wallet2,
  Receipt,
  LayoutDashboard,
  ListTodo,
  Gauge,
  Building2,
  PlusCircle,
  Clock,
  PieChart,
  User,
  CheckCircle2,
  XCircle,
  Calendar,
  Info,
  Layout,
  Circle,
  Filter,
  LogOut,
  Archive,
  UserCheck,
  UserPlus,
  UserMinus,
  ArrowRight,
  Tag,
  ArrowLeft,
  ArrowRightLeft,
  BarChart3,
  ClipboardCheck,  ClipboardList,
  Package,
  GanttChartSquare,
  TrendingDown,
  Trash2,
  Send,
  FileSearch,
  Network,
  ShieldCheck,
  History,
  Settings,
  Edit3,
  X,
  Navigation2,
  Maximize2,
  DollarSign,
  TrendingUp,
  Map as MapIcon,
  Navigation,
  FileBox,
  Users2,
  CheckSquare,
  Briefcase,
  Crosshair,
  Check,
  Save,
  Plus,
  Zap,
  Coins,
  AlertCircle,
  CheckCircle,
  CalendarClock,
  BellRing,
  Megaphone,
  Edit,
  Edit2,
  Pencil,
  ExternalLink,
  QrCode,
  Target,
  Contact2,
  Wrench,
  Building,
  CalendarPlus,
  CalendarCheck,
  Sun,
  CloudSun,
  Moon,
  Settings2,
  ShieldAlert,
  Video,
  Paperclip,
  Truck,
  Minus,
  Printer,
  FilePlus,
  Menu,
  Image,
  Upload,
  FileSpreadsheet,
  Percent,
  Power,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
  Cell,
  PieChart as RePieChart,
  Pie,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import {
  ScreenId,
  Employee,
  FieldReport,
  Project,
  Task,
  Asset,
  AuditLog,
  Quotation,
  QuotationItem,
  Document,
  FinancialRecord,
  DebtRecord,
  DailyReport,
  DebtPayment,
  Announcement,
  Reminder,
  Client,
  Invoice,
  SuratJalan,
  MaintenanceRecord,
  Assignment,
  CompanyProfile,
  RoleConfig,
  isProjectActive,
} from "./types";
import { dbService } from "./services/db";
import { seedFinancialRecords, seedDebtRecords } from "./services/seedData";
import {
  where,
  orderBy,
  doc,
  getDocFromServer,
  limit,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { GeotagCameraModal } from "./components/GeotagCameraModal";
import { AdminDailyReportsScreen } from "./components/AdminDailyReportsScreen";
import { generateDailyReportPDF as generateDailyReportPDFUtil, generateBatchDailyReportsPDF, formatIndonesianDateUpper } from "./utils/dailyReportPdf";
import { EKatalog } from "./components/EKatalog";
import { AdminPurchaseOrderScreen } from "./components/AdminPurchaseOrderScreen";
import AdminKasbonScreen from "./components/AdminKasbonScreen";
import { DocumentPreviewModal } from "./components/DocumentPreviewModal";
import SheetsDashboard from "./components/SheetsDashboard";
import { getGoogleAccessToken, setGoogleAccessToken, syncAllDataToGoogleSheets } from "./services/sheets";
import { calculateKasbonBalances, simulateKasbonAllocation, extractKasbonRecipient } from "./utils/kasbonHelper";

export const isReimbursementOrDebtRepayment = (r: any) => {
  if (r.flowType === "PERSONAL_TALANGAN_REIMBURSE") return true;
  if (
    r.type === "OUT" &&
    r.sumberDana === "REKENING PT" &&
    (r.category === "HUTANG" || 
     r.category === "Pembayaran Hutang" ||
     r.category === "Pelunasan Hutang" ||
     r.linkedDebtId)
  ) {
    return true;
  }
  return false;
};

const AdminAuditLogsScreen = ({
  auditLogs,
  onNavigate,
  user,
  roles,
}: {
  auditLogs: AuditLog[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("ALL");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === "ALL" || log.module === filterModule;
    return matchesSearch && matchesModule;
  });

  const modules = ["ALL", ...new Set(auditLogs.map((l) => l.module))];

  return (
    <AdminLayout
      activeScreen="admin-audit"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="space-y-8 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Audit Log
            </h2>
            <p className="text-slate-500 font-bold text-sm mt-1">
              Rekaman jejak seluruh aktivitas administratif sistem.
            </p>
          </div>
          {user?.role === "admin" && filteredLogs.length > 0 && (
            <button
              onClick={async () => {
                if (
                  window.confirm(
                    "Hapus seluruh catatan audit log? Tindakan ini tidak dapat dibatalkan.",
                  )
                ) {
                  for (const log of auditLogs) {
                    await dbService.deleteDocument("auditLogs", log.id);
                  }
                  alert("Audit log telah dikosongkan.");
                }
              }}
              className="px-6 py-3 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Kosongkan Log
            </button>
          )}
        </div>

        <div className="bg-slate-100/50 p-6 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari user, aksi, atau detail..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-8 py-4 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            {modules.map((m) => (
              <option key={m} value={m}>
                {m === "ALL" ? "Semua Modul" : m}
              </option>
            ))}
          </select>
        </div>

        <div className="relative space-y-6 before:absolute before:left-8 before:top-8 before:bottom-8 before:w-px before:bg-slate-200">
          {filteredLogs.map((log, idx) => {
            // Identify if details contain currency to highlight it
            const detailParts = log.details.split(/(Rp [\d.]+)/g);

            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={log.id}
                className="relative pl-16 group"
              >
                <div className="absolute left-4 top-0 w-8 h-8 bg-blue-50 border-2 border-white rounded-full flex items-center justify-center text-blue-600 shadow-sm z-10 group-hover:scale-110 transition-transform">
                  <Shield size={14} />
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                      {log.action === "UPDATE" && log.module === "PAYROLL"
                        ? "Perubahan Konfigurasi Gaji"
                        : `${log.module}: ${log.action}`}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>
                        {new Date(log.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>â€¢</span>
                      <span>
                        {new Date(log.timestamp)
                          .toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 font-bold text-sm leading-relaxed mb-6">
                    User{" "}
                    <span className="text-blue-600">
                      {log.userName} (Admin)
                    </span>{" "}
                    {detailParts.map((part, i) =>
                      part.startsWith("Rp ") ? (
                        <span
                          key={i}
                          className="text-emerald-500 underline decoration-2 underline-offset-4"
                        >
                          {part}
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Globe size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        IP: {log.ipAddress || "127.0.0.1"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Monitor size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {log.device || "Admin UI"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center gap-6 bg-white rounded-[3rem] border border-slate-100 border-dashed ml-16">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <History size={32} />
              </div>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                Data Audit Log Kosong
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminAnnouncementsScreen = ({
  announcements,
  onNavigate,
  user,
  roles,
  logActivity,
}: {
  announcements: Announcement[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
  logActivity: (m: string, a: string, d: string) => Promise<void>;
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<"SEMUA" | "URGENT" | "PROYEK" | "MEETING" | "LIBUR" | "UMUM">("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "UMUM" as any,
    integrateCalendar: false,
    eventDate: new Date().toISOString().split("T")[0],
    eventType: "OTHER" as any,
  });

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "owner" ||
    user?.role === "direktur";

  // Filter announcements dynamically based on active tab and search query
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => {
        const matchTab = activeTab === "SEMUA" || a.category === activeTab;
        const matchQuery =
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.createdBy && a.createdBy.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchTab && matchQuery;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [announcements, activeTab, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let reminderId = "";
      if (formData.integrateCalendar && formData.eventDate) {
        const reminderData = {
          title: `[${formData.category}] ${formData.title}`,
          description: formData.content,
          date: formData.eventDate,
          type: "OTHER",
          recurrence: "NONE",
          createdBy: user.name || "Admin",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        reminderId = await dbService.createDocument("reminders", reminderData);
      }

      const announcementData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        integrateCalendar: formData.integrateCalendar,
        eventDate: formData.integrateCalendar ? formData.eventDate : "",
        eventType: formData.integrateCalendar ? formData.eventType : "",
        reminderId: reminderId,
        createdBy: user.name,
        timestamp: Date.now(),
      };

      await dbService.createDocument("announcements", announcementData);
      
      await logActivity(
        "ANNOUNCEMENTS",
        "CREATE",
        `Membuat informasi/agenda baru: ${formData.title}`,
      );

      // Create notifications for all employees
      const employees = await dbService.getCollection<Employee>("employees");
      for (const emp of employees) {
        if (emp.id !== user.uid) {
          await dbService.createDocument("notifications", {
            userId: emp.id,
            title: `Informasi Baru: ${formData.title}`,
            message:
              formData.content.substring(0, 50) +
              (formData.content.length > 50 ? "..." : ""),
            type: "ANNOUNCEMENT",
            read: false,
            timestamp: Date.now(),
            link: "admin-announcements",
          });
        }
      }

      setShowAdd(false);
      setFormData({
        title: "",
        content: "",
        category: "UMUM",
        integrateCalendar: false,
        eventDate: new Date().toISOString().split("T")[0],
        eventType: "OTHER",
      });
    } catch (err) {
      console.error("Create announcement error:", err);
      alert("Gagal mempublikasikan informasi.");
    }
  };

  const handleDelete = async (id: string, title: string, reminderId?: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus informasi "${title}"?`)) return;
    try {
      await dbService.deleteDocument("announcements", id);
      if (reminderId) {
        await dbService.deleteDocument("reminders", reminderId);
      }
      await logActivity(
        "ANNOUNCEMENTS",
        "DELETE",
        `Menghapus informasi: ${title}`,
      );
    } catch (err) {
      console.error("Delete announcement error:", err);
      alert("Gagal menghapus informasi.");
    }
  };

  return (
    <AdminLayout
      activeScreen="admin-announcements"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="space-y-8 pb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
              Pusat Informasi STP
            </h1>
            <p className="text-slate-500 font-medium">
              Informasi terkini, pengumuman penting, jadwal meeting, dan libur nasional terintegrasi dengan kalender.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Plus size={16} /> Publikasi Informasi
            </button>
          )}
        </div>

        {/* Search & Tabs Filter Section */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-150/10 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari pengumuman, judul, instruksi, atau pengirim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar -mx-2 px-2">
            {[
              { id: "SEMUA", label: "Semua Info âœ¨", count: announcements.length },
              { id: "URGENT", label: "Penting ðŸš¨", count: announcements.filter(a => a.category === "URGENT").length },
              { id: "PROYEK", label: "Proyek ðŸ—ï¸", count: announcements.filter(a => a.category === "PROYEK").length },
              { id: "MEETING", label: "Meeting ðŸ‘¥", count: announcements.filter(a => a.category === "MEETING").length },
              { id: "LIBUR", label: "Libur ðŸï¸", count: announcements.filter(a => a.category === "LIBUR").length },
              { id: "UMUM", label: "Umum â„¹ï¸", count: announcements.filter(a => a.category === "UMUM").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.03]"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAnnouncements.map((a) => {
            const catColors: Record<string, { badge: string; border: string; bg: string; icon: string }> = {
              URGENT: {
                badge: "bg-rose-100 text-rose-700 border-rose-200",
                border: "border-rose-200 hover:border-rose-400",
                bg: "bg-rose-50/10",
                icon: "ðŸš¨",
              },
              UMUM: {
                badge: "bg-slate-100 text-slate-700 border-slate-200",
                border: "border-slate-100 hover:border-slate-300",
                bg: "bg-white",
                icon: "ðŸ“¢",
              },
              PROYEK: {
                badge: "bg-blue-100 text-blue-700 border-blue-200",
                border: "border-blue-200 hover:border-blue-400",
                bg: "bg-blue-50/10",
                icon: "ðŸ—ï¸",
              },
              MEETING: {
                badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
                border: "border-indigo-200 hover:border-indigo-400",
                bg: "bg-indigo-50/10",
                icon: "ðŸ‘¥",
              },
              LIBUR: {
                badge: "bg-amber-100 text-amber-700 border-amber-200",
                border: "border-amber-200 hover:border-amber-400",
                bg: "bg-amber-50/10",
                icon: "ðŸï¸",
              },
            };
            
            const config = catColors[a.category] || catColors.UMUM;

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-8 rounded-[2.5rem] border ${config.border} ${config.bg} shadow-xl shadow-slate-100/50 relative overflow-hidden group transition-all duration-300`}
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 pointer-events-none ${
                    a.category === "URGENT" ? "bg-rose-500" : "bg-primary"
                  }`}
                />
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${config.badge}`}>
                    {config.icon} {a.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100/50 px-2.5 py-1 rounded-full border border-slate-100">
                      {new Date(a.timestamp).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(a.id, a.title, a.reminderId)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                        title="Hapus Informasi"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors leading-snug">
                  {a.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold whitespace-pre-wrap">
                  {a.content}
                </p>
                
                {a.integrateCalendar && a.eventDate && (
                  <div className="mt-5 p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center gap-3 text-slate-700">
                    <CalendarClock size={20} className="text-indigo-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-black uppercase text-[8px] text-indigo-500 block tracking-wider leading-none mb-1">Terintegrasi Kalender STP</span>
                      <span className="font-extrabold text-slate-800">
                        {new Date(a.eventDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <User size={14} className="text-slate-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Diterbitkan Oleh</p>
                      <p className="text-[10px] font-black text-slate-700 leading-none">{a.createdBy}</p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                    Aktif
                  </span>
                </div>
              </motion.div>
            );
          })}

          {filteredAnnouncements.length === 0 && (
            <div className="md:col-span-2 py-20 bg-white border border-slate-100 rounded-[3rem] text-center shadow-lg shadow-slate-100/50 flex flex-col justify-center items-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                <Search size={28} />
              </div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Tidak ada pengumuman ditemukan</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Coba sesuaikan tab kategori atau kata kunci pencarian Anda.</p>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-8 sm:p-12 my-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Publikasi Informasi</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Kategori Informasi
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {["UMUM", "URGENT", "PROYEK", "MEETING", "LIBUR"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: c as any })
                      }
                      className={`py-3.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all text-center ${
                        formData.category === c
                          ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                          : "bg-white text-slate-400 border-slate-150 hover:bg-slate-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Judul Informasi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul (contoh: Rapat Koordinasi Mingguan)"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Konten / Detail Pengumuman
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan isi pengumuman atau instruksi di sini..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none resize-none"
                />
              </div>

              {/* INTEGRASI KALENDER */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-slate-800 block">
                      Integrasikan ke Kalender Perusahaan
                    </label>
                    <p className="text-[10px] font-bold text-slate-400 tracking-tight">
                      Otomatis jadwalkan pengumuman ini pada tanggal tertentu
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.integrateCalendar}
                    onChange={(e) =>
                      setFormData({ ...formData, integrateCalendar: e.target.checked })
                    }
                    className="w-5 h-5 accent-blue-600 rounded-md cursor-pointer-large cursor-pointer"
                  />
                </div>

                {formData.integrateCalendar && (
                  <div className="space-y-4 pt-2 border-t border-slate-200/50">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Pilih Tanggal Agenda
                      </label>
                      <input
                        type="date"
                        required={formData.integrateCalendar}
                        value={formData.eventDate}
                        onChange={(e) =>
                          setFormData({ ...formData, eventDate: e.target.value })
                        }
                        className="w-full px-6 py-3.5 bg-white border border-slate-150 rounded-xl text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl cursor-pointer hover:bg-slate-800 transition-all active:scale-95"
              >
                Siarkan &amp; Jadwalkan Sekarang
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

const AdminClientsScreen = ({
  clients,
  onNavigate,
  user,
  roles,
  logActivity,
}: {
  clients: Client[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
  logActivity: (m: string, a: string, d: string) => Promise<void>;
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.createDocument("clients", { ...formData, projects: [] });
    await logActivity(
      "CLIENTS",
      "CREATE",
      `Menambah klien baru: ${formData.name} (${formData.company})`,
    );
    setShowAdd(false);
    setFormData({ name: "", company: "", email: "", phone: "", address: "" });
  };

  return (
    <AdminLayout
      activeScreen="admin-clients"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="space-y-8 pb-24">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Klien & Pelanggan
            </h1>
            <p className="text-slate-500 font-medium">
              Rekanan bisnis dan daftar kontak perusahaan.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
          >
            <Plus size={16} /> Tambah Klien
          </button>
        </div>

        <div className="bg-white rounded-3xl lg:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Nama / Perusahaan
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Kontak
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Alamat
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-8">
                    <p className="font-black text-slate-900">{c.name}</p>
                    <p className="text-xs font-bold text-slate-400">
                      {c.company}
                    </p>
                  </td>
                  <td className="p-8">
                    <p className="text-xs font-bold text-slate-900">
                      {c.email}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {c.phone}
                    </p>
                  </td>
                  <td className="p-8">
                    <p className="text-xs font-medium text-slate-500 max-w-xs truncate">
                      {c.address}
                    </p>
                  </td>
                  <td className="p-8">
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl p-10"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">Tambah Klien Baru</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                placeholder="Nama Lengkap"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
              />
              <input
                placeholder="Nama Perusahaan"
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
              />
              <input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
              />
              <input
                placeholder="Nomor Telepon"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
              />
              <textarea
                placeholder="Alamat Lengkap"
                rows={3}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none resize-none"
              />
              <button
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl mt-4"
              >
                Simpan Klien
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

const AdminInvoicesScreen = ({
  invoices,
  clients,
  onNavigate,
  user,
  roles,
  logActivity,
  selectedInvoiceForEdit,
  setSelectedInvoiceForEdit,
}: {
  invoices: Invoice[];
  clients: Client[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
  logActivity: (m: string, a: string, d: string) => Promise<void>;
  selectedInvoiceForEdit?: any;
  setSelectedInvoiceForEdit?: (inv: any | null) => void;
}) => {
  const [view, setView] = useState<"list" | "build">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedInvoiceForEdit) {
      handleEditInvoice(selectedInvoiceForEdit);
      if (setSelectedInvoiceForEdit) {
        setSelectedInvoiceForEdit(null);
      }
    }
  }, [selectedInvoiceForEdit, setSelectedInvoiceForEdit]);

  // Builder States
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientUp, setRecipientUp] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [jobName, setJobName] = useState("");
  const [status, setStatus] = useState<"PENDING" | "PAID" | "OVERDUE">("PENDING");

  // PT / Company Kop Surat Details
  const [companyName, setCompanyName] = useState("PT. GARDA INOVASI GLOBALTECH");
  const [companyAddress, setCompanyAddress] = useState(
    "Perumahan Griya Sepatan Blok B6 Nomor 35, RT.02/09\nDs. Pisangan Jaya, Kec. Sepatan, Kab Tangerang\nBanten, 15525"
  );
  const [companyPhone, setCompanyPhone] = useState("0888-1687-794");
  const [companyEmail, setCompanyEmail] = useState("info@gardainovasiglobaltech.id");
  const [logoImage, setLogoImage] = useState<string | null>(null);

  // Table items state
  const [items, setItems] = useState<
    Array<{ description: string; qty: string | number; unit: string; price: string | number }>
  >([
    { description: "Penggantian Pompa Set Submersible", qty: 1, unit: "Set", price: 8000000 },
    { description: "Perbaikan Water Meter 2 Inch", qty: 1, unit: "ls", price: 1000000 },
  ]);

  // Tax and Bank details states
  const [enablePPN, setEnablePPN] = useState(true);
  const [taxPercentage, setTaxPercentage] = useState(11);
  const [bankName, setBankName] = useState("Mandiri");
  const [bankAccountName, setBankAccountName] = useState("Garda Inovasi Globaltech");
  const [bankAccountNumber, setBankAccountNumber] = useState("1550014117173");
  const [signatoryName, setSignatoryName] = useState("JIDAN RAMADHAN");
  const [overrideTerbilang, setOverrideTerbilang] = useState("");

  // Indonesian spelling of numbers (Terbilang)
  const numberToTerbilang = (num: number): string => {
    if (num === 0) return "nol";
    const units = [
      "",
      "satu",
      "dua",
      "tiga",
      "empat",
      "lima",
      "enam",
      "tujuh",
      "delapan",
      "sembilan",
      "sepuluh",
      "sebelas"
    ];

    const helper = (n: number): string => {
      let result = "";
      if (n < 12) {
        result = units[n];
      } else if (n < 20) {
        result = units[n - 10] + " belas";
      } else if (n < 100) {
        result = units[Math.floor(n / 10)] + " puluh " + helper(n % 10);
      } else if (n < 200) {
        result = "seratus " + helper(n - 100);
      } else if (n < 1000) {
        result = units[Math.floor(n / 100)] + " ratus " + helper(n % 100);
      } else if (n < 2000) {
        result = "seribu " + helper(n - 1000);
      } else if (n < 1000000) {
        result = helper(Math.floor(n / 1000)) + " ribu " + helper(n % 1000);
      } else if (n < 1000000000) {
        result = helper(Math.floor(n / 1000000)) + " juta " + helper(n % 1000000);
      } else if (n < 1000000000000) {
        result = helper(Math.floor(n / 1000000000)) + " milyar " + helper(n % 1000000000);
      }
      return result.trim();
    };

    return helper(num).replace(/\s+/g, " ") + " rupiah";
  };

  // Math Auto Calculations
  const subTotal = items.reduce((acc, item) => {
    const q = Number(item.qty) || 0;
    const p = Number(item.price) || 0;
    return acc + q * p;
  }, 0);

  const taxAmount = enablePPN ? Math.round((subTotal * taxPercentage) / 100) : 0;
  const grandTotal = subTotal + taxAmount;
  const computedTerbilang = numberToTerbilang(grandTotal);

  // File structure helpers
  const addItem = () =>
    setItems([...items, { description: "", qty: 1, unit: "ls", price: 0 }]);

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Link selected Client with standard client list
  const handleClientChange = (selectedClientId: string) => {
    setClientId(selectedClientId);
    const linkedClient = clients.find((c) => c.id === selectedClientId);
    if (linkedClient) {
      setRecipientName(linkedClient.company || linkedClient.name);
      setRecipientUp(linkedClient.name || "");
    }
  };

  // Open invoice editor
  const handleEditInvoice = (inv: any) => {
    setEditingInvoiceId(inv.id);
    setInvoiceNumber(inv.invoiceNumber || "");
    setClientId(inv.clientId || "");
    setRecipientName(inv.clientName || "");
    setRecipientUp(inv.recipientUp || "");
    setInvoiceDate(
      inv.invoiceDate ||
        (inv.createdAt ? inv.createdAt.split("T")[0] : new Date().toISOString().split("T")[0])
    );
    setDueDate(inv.dueDate || "");
    setJobName(inv.jobName || "");
    setStatus(inv.status || "PENDING");

    if (inv.companyLogo) setLogoImage(inv.companyLogo);
    if (inv.companyName) setCompanyName(inv.companyName);
    if (inv.companyAddress) setCompanyAddress(inv.companyAddress);
    if (inv.companyPhone) setCompanyPhone(inv.companyPhone);
    if (inv.companyEmail) setCompanyEmail(inv.companyEmail);

    if (inv.itemsJson) {
      try {
        setItems(JSON.parse(inv.itemsJson));
      } catch (e) {
        setItems([{ description: "", qty: 1, unit: "ls", price: inv.amount || 0 }]);
      }
    } else {
      setItems([{ description: "Uraian Pekerjaan", qty: 1, unit: "ls", price: inv.amount || 0 }]);
    }

    setEnablePPN(inv.taxPercentage !== undefined ? Number(inv.taxPercentage) > 0 : true);
    setTaxPercentage(inv.taxPercentage !== undefined ? inv.taxPercentage : 11);
    setBankName(inv.bankName || "Mandiri");
    setBankAccountName(inv.bankAccountName || "Garda Inovasi Globaltech");
    setBankAccountNumber(inv.bankAccountNumber || "1550014117173");
    setSignatoryName(inv.signatoryName || "JIDAN RAMADHAN");
    setOverrideTerbilang(inv.overrideTerbilang || "");

    setView("build");
  };

  const initNewInvoice = () => {
    setEditingInvoiceId(null);
    setInvoiceNumber(
      `INV/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
    );
    setClientId("");
    setRecipientName("");
    setRecipientUp("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    setJobName("Pemeliharaan IPAL");
    setStatus("PENDING");
    setItems([
      { description: "Penggantian Pompa Set Submersible", qty: 1, unit: "Set", price: 8000000 },
      { description: "Perbaikan Water Meter 2 Inch", qty: 1, unit: "ls", price: 1000000 }
    ]);
    setEnablePPN(true);
    setTaxPercentage(11);
    setBankName("Mandiri");
    setBankAccountName("Garda Inovasi Globaltech");
    setBankAccountNumber("1550014117173");
    setSignatoryName("JIDAN RAMADHAN");
    setOverrideTerbilang("");
    setView("build");
  };

  const handleSaveInvoice = async () => {
    if (!recipientName) {
      alert("Masukkan nama penerima / klien.");
      return;
    }
    if (!invoiceNumber) {
      alert("Masukkan nomor invoice.");
      return;
    }

    const payload = {
      invoiceNumber,
      clientId,
      clientName: recipientName,
      amount: Number(grandTotal),
      total: Number(grandTotal),
      status,
      dueDate,
      createdAt: editingInvoiceId
        ? invoices.find((v) => v.id === editingInvoiceId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),

      // Extended detailed fields
      companyLogo: logoImage,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      recipientUp,
      invoiceDate,
      jobName,
      taxPercentage: enablePPN ? taxPercentage : 0,
      itemsJson: JSON.stringify(items),
      bankName,
      bankAccountName,
      bankAccountNumber,
      signatoryName,
      overrideTerbilang: overrideTerbilang || computedTerbilang,
    };

    try {
      if (editingInvoiceId) {
        await dbService.updateDocument("invoices", editingInvoiceId, payload);
        await logActivity(
          "INVOICES",
          "UPDATE",
          `Melakukan update Invoice ${invoiceNumber} untuk ${recipientName} senilai Rp ${grandTotal.toLocaleString("id-ID")}`
        );
        alert("Invoice berhasil diperbarui!");
      } else {
        await dbService.createDocument("invoices", payload);
        await logActivity(
          "INVOICES",
          "CREATE",
          `Menerbitkan Invoice Baru ${invoiceNumber} untuk ${recipientName} senilai Rp ${grandTotal.toLocaleString("id-ID")}`
        );
        alert("Invoice baru berhasil disimpan!");
      }
      setView("list");
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan invoice.");
    }
  };

  const handleDeleteInvoice = async (invId: string, numberStr: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Invoice ${numberStr} dari sistem?`)) {
      try {
        await dbService.deleteDocument("invoices", invId);
        await logActivity(
          "INVOICES",
          "DELETE",
          `Menghapus Invoice ${numberStr}`
        );
        alert("Invoice telah berhasil di hapus.");
      } catch (err) {
        alert("Gagal menghapus invoice.");
      }
    }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById("invoice-preview-capture");
    if (!element) {
      setIsExporting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("invoice-preview-capture");
          if (clonedElement) {
            clonedElement.style.display = "block";
            clonedElement.style.visibility = "visible";
            clonedElement.style.boxShadow = "none";
            clonedElement.style.transform = "none";
            clonedElement.style.scale = "1";
            clonedElement.style.margin = "0";
            clonedElement.style.position = "relative";
            clonedElement.style.top = "0";
            clonedElement.style.left = "0";
          }

          const styles = clonedDoc.getElementsByTagName("style");
          for (let i = styles.length - 1; i >= 0; i--) {
            styles[i].remove();
          }

          const links = clonedDoc.getElementsByTagName("link");
          for (let i = links.length - 1; i >= 0; i--) {
            if (links[i].rel === "stylesheet") {
              links[i].remove();
            }
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        Math.min(pdfHeight, pdf.internal.pageSize.getHeight()),
      );
      pdf.save(`Invoice_${invoiceNumber.replace(/\//g, "_")}.pdf`);
    } catch (err: any) {
      console.error("PDF Export Error Details:", err);
      alert(`Gagal download PDF: ${err.message || "Error tidak dikenal"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const uniqueInvoicesMap = new Map<string, Invoice>();
  invoices.forEach((inv) => {
    if (inv) {
      const key = inv.invoiceNumber || inv.id;
      if (key && !uniqueInvoicesMap.has(key)) {
        uniqueInvoicesMap.set(key, inv);
      }
    }
  });
  const dedupedInvoices: Invoice[] = Array.from(uniqueInvoicesMap.values());

  const filteredInvoices = dedupedInvoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout
      activeScreen="admin-invoices"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      {view === "list" ? (
        <div className="space-y-8 pb-24">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Invoice & Penagihan
              </h1>
              <p className="text-slate-500 font-medium">
                Kelola invoice klien, cetak format PDF resmi dan status pembayaran.
              </p>
            </div>
            <button
              onClick={initNewInvoice}
              className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 translate-y-[-2px]"
            >
              <Plus size={16} /> Buat Invoice Builder
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">
                Total Tertagih
              </p>
              <h3 className="text-3xl font-black text-slate-900 font-mono">
                Rp {invoices.reduce((a, b) => a + b.amount, 0).toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">
                Belum Dibayar
              </p>
              <h3 className="text-3xl font-black text-rose-500 font-mono">
                Rp{" "}
                {invoices
                  .filter((i) => i.status !== "PAID")
                  .reduce((a, b) => a + b.amount, 0)
                  .toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">
                Sudah Lunas
              </p>
              <h3 className="text-3xl font-black text-emerald-500 font-mono">
                Rp{" "}
                {invoices
                  .filter((i) => i.status === "PAID")
                  .reduce((a, b) => a + b.amount, 0)
                  .toLocaleString("id-ID")}
              </h3>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari nomor invoice / nama klien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "PENDING", "PAID", "OVERDUE"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border shrink-0 ${statusFilter === st ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"}`}
                >
                  {st === "ALL" ? "Semua Status" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-10">
                      Nomor Invoice
                    </th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Klien
                    </th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Jatuh Tempo
                    </th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Jumlah
                    </th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-10">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="p-8 pl-10">
                          <span className="font-black text-slate-900">
                            {inv.invoiceNumber}
                          </span>
                        </td>
                        <td className="p-8">
                          <p className="font-bold text-slate-700">{inv.clientName}</p>
                          {inv.projectId && (
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                              Pekerjaan: {(inv as any).jobName || "Konstruksi IPAL"}
                            </p>
                          )}
                        </td>
                        <td className="p-8 text-xs font-bold text-slate-500 font-mono">
                          {inv.dueDate || "-"}
                        </td>
                        <td className="p-8 font-black text-slate-900 font-mono">
                          Rp {inv.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="p-8">
                          <span
                            className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${inv.status === "PAID" ? "bg-emerald-50 text-emerald-500" : inv.status === "OVERDUE" ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-8 text-right pr-10 whitespace-nowrap">
                          <div className="flex justify-end gap-2 text-slate-400">
                            <button
                              onClick={() => handleEditInvoice(inv)}
                              className="p-2.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all font-sans text-xs font-bold flex items-center gap-1.5"
                              title="Buka Builder (Edit & Print)"
                            >
                              <FileEdit size={16} />
                              <span>Format PDF</span>
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                              className="p-2.5 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                        <Receipt size={40} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Belum ada invoice yang diterbitkan.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Builder View (Dual Pane) */
        <div className="space-y-6 pb-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest hover:translate-x-[-2px]"
            >
              <ChevronLeft size={16} /> Kembali ke Daftar Invoice
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveInvoice}
                className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-emerald-600 transition-all"
              >
                <Save size={16} />
                <span>Simpan di Aplikasi</span>
              </button>
              <button
                onClick={exportPDF}
                disabled={isExporting}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isExporting ? <RefreshCw className="animate-spin" size={16} /> : <Printer size={16} />}
                <span>Download PDF Invoice</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Editor Pane */}
            <div className="space-y-8">
              <div className="card p-8 bg-white border border-slate-100 shadow-xl rounded-[40px] space-y-6">
                <h3 className="text-lg font-black text-slate-900">1. Profil Pengirim & Logo</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Logo Perusahaan
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all group-hover:bg-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {logoImage ? (
                            <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <Plus size={16} className="text-slate-400" />
                          )}
                        </div>
                        <span className="text-slate-500 truncate">
                          {logoImage ? "Ganti Logo" : "Upload Logo (.png, .jpg)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Nama Perusahaan Pengirim
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Alamat Lengkap Pengirim (Kop Surat Kanan)
                  </label>
                  <textarea
                    rows={3}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Email Bisnis
                    </label>
                    <input
                      type="text"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="card p-8 bg-white border border-slate-100 shadow-xl rounded-[40px] space-y-6">
                <h3 className="text-lg font-black text-slate-900">2. Detail Penerima & Pekerjaan</h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Hubungkan dengan Klien Terdaftar (Opsional)
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                  >
                    <option value="">Pilih Klien</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company || c.name} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Kepada (Instansi / Nama Klien)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Puskesmas Sindang Jaya"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Up (Nama Jabatan / Penerima)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kepala Puskesmas Sindang Jaya"
                      value={recipientUp}
                      onChange={(e) => setRecipientUp(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Nomor Surat Invoice
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 17/INV/GIGT/VI/2026"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Nama Pekerjaan / Projek
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pemeliharaan IPAL"
                      value={jobName}
                      onChange={(e) => setJobName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Tanggal Cetak
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[18px] text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Tanggal Jatuh Tempo (Due Date)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[18px] text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Status Dokumen (Database)
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none"
                  >
                    <option value="PENDING">PENDING (Beli / Belum Bayar)</option>
                    <option value="PAID">PAID (Lunas)</option>
                    <option value="OVERDUE">OVERDUE (Terlambat)</option>
                  </select>
                </div>
              </div>

              {/* Rincian item */}
              <div className="card p-8 bg-white border border-slate-100 shadow-xl rounded-[40px] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">3. Rincian Pekerjaan / Item</h3>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-all"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-3 relative group">
                      <button
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 disabled:opacity-0 transition-all rounded-lg"
                        title="Hapus baris"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1 font-sans">
                          Uraian Pekerjaan / Deskripsi
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          placeholder="Nama Barang atau Jenis Pekerjaan"
                          onChange={(e) => updateItem(idx, "description", e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-150 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1">
                            Vol / Qty
                          </label>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateItem(idx, "qty", e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-150 rounded-xl text-xs font-bold text-center outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1 font-sans">
                            Satuan
                          </label>
                          <input
                            type="text"
                            placeholder="Set / ls / Pcs"
                            value={item.unit}
                            onChange={(e) => updateItem(idx, "unit", e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-150 rounded-xl text-xs font-bold text-center outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1">
                            Harga Satuan (Rp)
                          </label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(idx, "price", e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-150 rounded-xl text-xs font-bold text-center outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pajak & Bank */}
              <div className="card p-8 bg-white border border-slate-100 shadow-xl rounded-[40px] space-y-6">
                <h3 className="text-lg font-black text-slate-900">4. Pajak & Rekening Pembayaran</h3>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <input
                    type="checkbox"
                    id="enable-ppn"
                    checked={enablePPN}
                    onChange={(e) => setEnablePPN(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="enable-ppn" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Kenakan PPN (Pajak Pertambahan Nilai)
                  </label>
                </div>

                {enablePPN && (
                  <div className="space-y-2 pl-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Persentase PPN (%)
                    </label>
                    <input
                      type="number"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(Number(e.target.value))}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none"
                    />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Nama Bank Penerima
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Atas Nama Rekening
                    </label>
                    <input
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Nama Penandatangan (Hormat Kami)
                  </label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Override Teks Terbilang (Kosongkan Untuk Otomatis)
                  </label>
                  <textarea
                    rows={2}
                    value={overrideTerbilang}
                    placeholder={computedTerbilang}
                    onChange={(e) => setOverrideTerbilang(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none italic placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Document Live Preview Pane */}
            <div className="space-y-6 overflow-hidden">
              <h2 className="text-xl font-black text-slate-900 tracking-tight text-center">
                Live Document Preview (A4 format)
              </h2>

              <div className="w-full overflow-x-auto overflow-y-auto max-h-[850px] flex justify-center bg-slate-200 border border-slate-300 rounded-[32px] p-6 shadow-inner">
                {/* Simulated A4 document page wrapper */}
                <div
                  id="invoice-preview-capture"
                  className="bg-white"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    padding: "45px 55px",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    position: "relative",
                    fontFamily: "Arial, sans-serif",
                    margin: "0 auto",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    transform:
                      windowWidth < 768
                        ? `scale(${Math.min(0.42, (windowWidth - 40) / 794)})`
                        : windowWidth < 1024
                          ? `scale(${Math.min(0.7, (windowWidth - 40) / 794)})`
                          : "scale(1)",
                    transformOrigin: "top center",
                  }}
                >
                  {/* Kop Surat Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      borderBottom: "1px solid #1e293b",
                      paddingBottom: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    {/* Left: Logo & Logo Text */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {logoImage ? (
                          <img
                            src={logoImage}
                            alt="Logo"
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              border: "1px dashed #cccccc",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "9px",
                              color: "#888888",
                              textAlign: "center",
                            }}
                          >
                            Upload Logo
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <p style={{ margin: 0, fontSize: "11px", fontWeight: "bold", color: "#1e3a8a" }}>
                          PT. GARDA INOVASI GLOBALTECH
                        </p>
                      </div>
                    </div>

                    {/* Right: Company Address Details */}
                    <div style={{ textAlign: "right", maxWidth: "340px" }}>
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "12px",
                          fontWeight: "bold",
                          letterSpacing: "0.05em",
                          color: "#0f172a",
                        }}
                      >
                        {companyName}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "9px",
                          lineHeight: "1.4",
                          color: "#334155",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {companyAddress}
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "9px", color: "#475569" }}>
                        Telp: {companyPhone}
                      </p>
                      <p style={{ margin: 0, fontSize: "9px", color: "#2563eb", textDecoration: "underline" }}>
                        {companyEmail}
                      </p>
                    </div>
                  </div>

                  {/* Title Centered */}
                  <div style={{ textAlign: "center", margin: "25px 0" }}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: "bold",
                        letterSpacing: "0.2em",
                        textDecoration: "underline",
                        color: "#000000",
                      }}
                    >
                      INVOICE
                    </h2>
                  </div>

                  {/* Dual Column Info Section */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      marginBottom: "30px",
                      lineHeight: "1.7",
                    }}
                  >
                    {/* Left Column: Recipient Details */}
                    <div style={{ width: "45%" }}>
                      <table style={{ borderCollapse: "collapse", width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ width: "70px", fontWeight: "normal", verticalAlign: "top" }}>Kepada</td>
                            <td style={{ width: "10px", verticalAlign: "top" }}>:</td>
                            <td style={{ fontWeight: "bold", verticalAlign: "top" }}>{recipientName || "-"}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: "normal", verticalAlign: "top" }}>Up</td>
                            <td style={{ verticalAlign: "top" }}>:</td>
                            <td style={{ verticalAlign: "top" }}>{recipientUp || "-"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Right Column: Invoicing Metadata */}
                    <div style={{ width: "45%" }}>
                      <table style={{ borderCollapse: "collapse", width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ width: "80px", fontWeight: "normal", verticalAlign: "top" }}>Nomor</td>
                            <td style={{ width: "10px", verticalAlign: "top" }}>:</td>
                            <td style={{ fontWeight: "bold", verticalAlign: "top" }}>{invoiceNumber || "-"}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: "normal", verticalAlign: "top" }}>Tanggal</td>
                            <td style={{ verticalAlign: "top" }}>:</td>
                            <td style={{ verticalAlign: "top" }}>
                              {invoiceDate
                                ? new Date(invoiceDate).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                  })
                                : "-"}
                            </td>
                          </tr>
                          {dueDate && (
                            <tr>
                              <td style={{ fontWeight: "normal", verticalAlign: "top" }}>Jatuh Tempo</td>
                              <td style={{ verticalAlign: "top" }}>:</td>
                              <td style={{ verticalAlign: "top" }}>
                                {new Date(dueDate).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric"
                                })}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td style={{ fontWeight: "normal", verticalAlign: "top" }}>Pekerjaan</td>
                            <td style={{ verticalAlign: "top" }}>:</td>
                            <td style={{ verticalAlign: "top" }}>{jobName || "-"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* High Quality Black Bordered Table */}
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "11px",
                      marginBottom: "20px",
                    }}
                  >
                    <thead>
                      <tr style={{ borderTop: "2px solid #000000", borderBottom: "2px solid #000000" }}>
                        <th style={{ padding: "8px 5px", borderBottom: "2px solid #000000", textAlign: "center", width: "35px" }}>NO</th>
                        <th style={{ padding: "8px 10px", borderBottom: "2px solid #000000", textAlign: "left" }}>URAIAN PEKERJAAN</th>
                        <th style={{ padding: "8px 5px", borderBottom: "2px solid #000000", textAlign: "center", width: "50px" }}>VOL</th>
                        <th style={{ padding: "8px 5px", borderBottom: "2px solid #000000", textAlign: "center", width: "60px" }}>SATUAN</th>
                        <th style={{ padding: "8px 10px", borderBottom: "2px solid #000000", textAlign: "right", width: "115px" }}>HARGA SATUAN</th>
                        <th style={{ padding: "8px 10px", borderBottom: "2px solid #000000", textAlign: "right", width: "120px" }}>JUMLAH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const amount = (Number(item.qty) || 0) * (Number(item.price) || 0);
                        return (
                          <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "8px 5px", textAlign: "center", verticalAlign: "top" }}>{idx + 1}</td>
                            <td style={{ padding: "8px 10px", textAlign: "left", verticalAlign: "top", whiteSpace: "pre-line" }}>
                              {item.description || "-"}
                            </td>
                            <td style={{ padding: "8px 5px", textAlign: "center", verticalAlign: "top" }}>{item.qty}</td>
                            <td style={{ padding: "8px 5px", textAlign: "center", verticalAlign: "top" }}>{item.unit || "-"}</td>
                            <td style={{ padding: "8px 10px", textAlign: "right", verticalAlign: "top" }}>
                              Rp {(Number(item.price) || 0).toLocaleString("id-ID")}
                            </td>
                            <td style={{ padding: "8px 10px", textAlign: "right", verticalAlign: "top", fontWeight: "bold" }}>
                              Rp {amount.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Summary Section Rows */}
                      <tr style={{ borderTop: "2px solid #000000" }}>
                        <td colSpan={4} style={{ border: "none" }}></td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "bold" }}>SUB TOTAL</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "bold" }}>
                          Rp {subTotal.toLocaleString("id-ID")}
                        </td>
                      </tr>
                      {enablePPN && (
                        <tr>
                          <td colSpan={4} style={{ border: "none" }}></td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "bold" }}>PPN {taxPercentage}%</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "bold" }}>
                            Rp {taxAmount.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={4} style={{ border: "none" }}></td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "bold", borderTop: "1px solid #000000", borderBottom: "2px solid #000000" }}>
                          GRAND TOTAL
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "black", borderTop: "1px solid #000000", borderBottom: "2px solid #000000", fontSize: "12px", backgroundColor: "#f8fafc" }}>
                          Rp {grandTotal.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Terbilang block */}
                  <div style={{ margin: "25px 0", fontSize: "11px", fontStyle: "italic", fontWeight: "bold" }}>
                    *Terbilang : {overrideTerbilang || computedTerbilang}
                  </div>

                  {/* Payment Info */}
                  <div style={{ margin: "40px 0 20px 0", fontSize: "11px", lineHeight: "1.6" }}>
                    <p style={{ margin: "0 0 6px 0", fontWeight: "bold", textDecoration: "underline" }}>
                      Cara Pembayaran Melalui Transfer Ke Rekening
                    </p>
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "11px" }}>
                      <tbody>
                        <tr>
                          <td style={{ width: "110px", padding: "2px 0" }}>Nama Bank</td>
                          <td style={{ width: "15px" }}>:</td>
                          <td style={{ fontWeight: "bold" }}>{bankName}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "2px 0" }}>Atas nama</td>
                          <td>:</td>
                          <td style={{ fontWeight: "bold" }}>{bankAccountName}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "2px 0" }}>No Rekening</td>
                          <td>:</td>
                          <td style={{ fontWeight: "bold", fontFamily: "monospace" }}>{bankAccountNumber}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Demikian text */}
                  <p style={{ fontSize: "11px", margin: "30px 0 50px 0", lineHeight: "1.5" }}>
                    Demikian invoice ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terimakasih.
                  </p>

                  {/* Signature Section */}
                  <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "30px" }}>
                    <div style={{ textAlign: "center", width: "200px" }}>
                      <p style={{ fontSize: "12px", margin: "0 0 70px 0", fontWeight: "normal" }}>
                        Hormat kami,
                      </p>
                      
                      {/* Interactive Sign Stamp Logo optionally overlaying a little bit of the text */}
                      <div style={{ position: "relative" }}>
                        {logoImage && (
                          <img
                            src={logoImage}
                            alt="Stamp"
                            style={{
                              position: "absolute",
                              width: "70px",
                              height: "70px",
                              top: "-60px",
                              left: "65px",
                              opacity: "0.25",
                              mixBlendMode: "multiply",
                            }}
                          />
                        )}
                        <p style={{ fontSize: "12px", margin: 0, fontWeight: "bold", textDecoration: "underline" }}>
                          {signatoryName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const AdminMaintenanceScreen = ({
  assets,
  maintenanceRecords,
  onNavigate,
  user,
  roles,
  logActivity,
}: {
  assets: Asset[];
  maintenanceRecords: MaintenanceRecord[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
  logActivity: (m: string, a: string, d: string) => Promise<void>;
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    assetId: "",
    type: "ROUTINE" as any,
    description: "",
    cost: "",
    date: new Date().toISOString().split("T")[0],
    status: "IN_PROGRESS" as any,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === formData.assetId);
    await dbService.createDocument("maintenanceRecords", {
      ...formData,
      assetName: asset?.name || "Unknown",
      cost: Number(formData.cost),
      performedBy: user.name,
    });
    await logActivity(
      "MAINTENANCE",
      "CREATE",
      `Mencatat riwayat servis aset ${asset?.name || "Unknown"}: ${formData.description}`,
    );
    setShowAdd(false);
  };

  return (
    <AdminLayout
      activeScreen="admin-maintenance"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="space-y-8 pb-24">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Pemeliharaan Aset
            </h1>
            <p className="text-slate-500 font-medium">
              Jadwal servis rutin dan perbaikan aset perusahaan.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
          >
            <Plus size={16} /> Catat Servis
          </button>
        </div>

        <div className="bg-white rounded-3xl lg:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Aset
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Tipe & Deskripsi
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Biaya
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {maintenanceRecords.map((rec) => (
                <tr
                  key={rec.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-8">
                    <p className="font-black text-slate-900">{rec.assetName}</p>
                    <p className="text-[10px] font-bold text-slate-400">
                      {rec.date}
                    </p>
                  </td>
                  <td className="p-8">
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${rec.type === "EMERGENCY" ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"}`}
                    >
                      {rec.type}
                    </span>
                    <p className="text-xs font-medium text-slate-500 mt-2">
                      {rec.description}
                    </p>
                  </td>
                  <td className="p-8 font-black text-slate-900">
                    Rp {rec.cost.toLocaleString()}
                  </td>
                  <td className="p-8">
                    <span
                      className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${rec.status === "COMPLETED" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"}`}
                    >
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl p-10"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">Catat Riwayat Servis</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Pilih Aset
                </label>
                <select
                  required
                  value={formData.assetId}
                  onChange={(e) =>
                    setFormData({ ...formData, assetId: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                >
                  <option value="">Daftar Aset</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.brand})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "ROUTINE" })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.type === "ROUTINE" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100"}`}
                >
                  Rutin
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "EMERGENCY" })
                  }
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.type === "EMERGENCY" ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-400 border-slate-100"}`}
                >
                  Urgen
                </button>
              </div>
              <textarea
                placeholder="Deskripsi Perbaikan"
                required
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none resize-none"
              />
              <input
                placeholder="Biaya (Rp)"
                type="number"
                required
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
              />
              <button
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl mt-4"
              >
                Simpan Laporan Servis
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

const AdminRolesScreen = ({
  roles,
  onNavigate,
  user,
  onEdit,
  onAdd,
  logActivity,
}: {
  roles: RoleConfig[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  onEdit: (role: RoleConfig) => void;
  onAdd: () => void;
  logActivity: (m: string, a: string, d: string) => Promise<void>;
}) => {
  return (
    <AdminLayout
      activeScreen="admin-roles"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="space-y-8 pb-24">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
              Hak Akses & Izin
            </h1>
            <p className="text-slate-500 font-medium">
              Definisikan hirarki dan batasan akses sistem.
            </p>
          </div>
          <button
            onClick={onAdd}
            className="bg-slate-900 text-white px-6 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-900/20 flex items-center gap-2 active:scale-95 transition-all hover:bg-primary"
          >
            <Plus size={16} /> Tambah Role
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
            >
              <div
                className={`w-14 h-14 ${
                  role.color === "rose"
                    ? "bg-rose-500"
                    : role.color === "blue"
                      ? "bg-blue-500"
                      : role.color === "emerald"
                        ? "bg-emerald-500"
                        : role.color === "amber"
                          ? "bg-amber-500"
                          : role.color === "indigo"
                            ? "bg-indigo-500"
                            : "bg-slate-500"
                } rounded-[24px] mb-8 flex items-center justify-center text-white shadow-lg`}
              >
                <Shield size={28} />
              </div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-slate-900">
                  {role.name}
                </h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {role.permissions?.length || 0} Izin
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 h-20 line-clamp-3 italic">
                "{role.description}"
              </p>
              <div className="pt-8 border-t border-slate-50">
                <button
                  onClick={() => onEdit(role)}
                  className="w-full py-4 bg-slate-50 text-[10px] font-black text-slate-900 uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                  Konfigurasi Detail <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

const RoleEditorModal = ({
  role,
  isOpen,
  onClose,
  onSave,
  allScreens,
}: {
  role: RoleConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: RoleConfig) => void;
  allScreens: ScreenId[];
}) => {
  const [formData, setFormData] = useState<Partial<RoleConfig>>({
    name: "",
    description: "",
    permissions: [],
    color: "slate",
  });

  useEffect(() => {
    if (role) {
      setFormData(role);
    } else {
      setFormData({
        name: "",
        description: "",
        permissions: [],
        color: "slate",
      });
    }
  }, [role, isOpen]);

  if (!isOpen) return null;

  const togglePermission = (screenId: ScreenId) => {
    const current = formData.permissions || [];
    if (current.includes(screenId)) {
      setFormData({
        ...formData,
        permissions: current.filter((p) => p !== screenId),
      });
    } else {
      setFormData({ ...formData, permissions: [...current, screenId] });
    }
  };

  const groupScreens = (screens: ScreenId[]) => {
    const admin = [
      "admin-dashboard",
      "admin-projects",
      "admin-approval",
      "admin-inventory",
      "admin-quotations",
      "admin-tracking",
      "admin-payroll",
      "admin-tasks",
      "admin-docs",
      "admin-ekatalog",
      "admin-audit",
      "admin-settings",
      "admin-expenses",
      "admin-schedule",
      "admin-notifications",
      "admin-announcements",
      "admin-performance",
      "admin-clients",
      "admin-invoices",
      "admin-po",
      "admin-maintenance",
      "admin-roles",
      "admin-profile",
      "admin-surat-jalan",
      "admin-analytics",
      "admin-finance",
      "admin-debt",
      "admin-kasbon",
      "company-profile",
      "data-karyawan",
      "staff-detail",
      "all-projects",
    ];

    const employee = [
      "home",
      "profile",
      "absen-masuk",
      "absen-pulang",
      "laporan-lapangan",
      "reimburse",
      "izin-cuti",
      "slip-gaji",
      "project-detail",
      "task-detail",
    ];

    return {
      admin: admin.filter((s) => screens.includes(s as ScreenId)),
      employee: employee.filter((s) => screens.includes(s as ScreenId)),
    };
  };

  const availableScreens: ScreenId[] = [
    "home",
    "profile",
    "absen-masuk",
    "absen-pulang",
    "laporan-lapangan",
    "reimburse",
    "izin-cuti",
    "slip-gaji",
    "admin-dashboard",
    "admin-projects",
    "admin-approval",
    "admin-inventory",
    "admin-quotations",
    "admin-tracking",
    "admin-payroll",
    "admin-tasks",
    "admin-docs",
    "admin-ekatalog",
    "admin-audit",
    "admin-settings",
    "admin-expenses",
    "admin-schedule",
    "admin-notifications",
    "admin-announcements",
    "admin-performance",
    "admin-clients",
    "admin-invoices",
    "admin-po",
    "admin-maintenance",
    "admin-roles",
    "admin-profile",
    "admin-surat-jalan",
    "admin-analytics",
    "admin-finance",
    "admin-debt",
    "admin-kasbon",
    "company-profile",
    "data-karyawan",
    "staff-detail",
    "project-detail",
    "all-projects",
    "task-detail",
  ];

  const groups = groupScreens(availableScreens);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl p-12 flex flex-col max-h-[90vh] border border-white"
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">
              {role ? "Edit Role" : "Tambah Role Baru"}
            </h3>
            <p className="text-sm text-slate-400 font-medium">
              Atur modul yang dapat diakses oleh role ini.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
                Nama Role / Posisi
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="Ex: Supervisor Lapangan"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
                Identitas Warna
              </label>
              <div className="flex gap-4 p-2 bg-slate-50 rounded-[2rem] justify-center items-center h-[60px]">
                {["rose", "blue", "emerald", "amber", "indigo", "slate"].map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-full bg-${c}-500 transition-all ${formData.color === c ? "ring-4 ring-slate-900 ring-offset-2 scale-110" : "opacity-40 hover:opacity-100"}`}
                    />
                  ),
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
                Deskripsi & Cakupan Tugas
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold outline-none resize-none focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="Jelaskan cakupan tanggung jawab role ini secara singkat..."
              />
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">
              Konfigurasi Hak Akses (Permissions)
            </h4>

            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                    <Shield size={16} />
                  </div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">
                    Modul Administrator & Dashboard
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {groups.admin.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => togglePermission(s as ScreenId)}
                      className={`p-5 rounded-[2rem] border-2 text-left transition-all ${formData.permissions?.includes(s as ScreenId) ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
                    >
                      <p className="text-[11px] font-black uppercase tracking-tighter leading-tight">
                        {s.replace("admin-", "").replace("-", " ")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Layout size={16} />
                  </div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">
                    Modul Front-Mobile / Karyawan
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {groups.employee.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => togglePermission(s as ScreenId)}
                      className={`p-5 rounded-[2rem] border-2 text-left transition-all ${formData.permissions?.includes(s as ScreenId) ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
                    >
                      <p className="text-[11px] font-black uppercase tracking-tighter leading-tight">
                        {s.replace("-", " ")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-50 flex gap-6 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-5 bg-slate-100 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-200 transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(formData as RoleConfig)}
            className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all hover:bg-primary"
          >
            Terapkan Konfigurasi
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const CompanyProfileScreen = ({
  profile,
  onNavigate,
  user,
  roles,
}: {
  profile: CompanyProfile | null;
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CompanyProfile>(
    profile || {
      name: "PT. JAFRA KONSTRUKSI",
      vision:
        "Menjadi perusahaan konstruksi terdepan di Indonesia dengan mengutamakan kualitas dan inovasi.",
      mission:
        "Memberikan layanan konstruksi terbaik, menjaga keselamatan kerja, dan meningkatkan nilai bagi stakeholder.",
      history:
        "Didirikan pada tahun 2020, kami telah mengerjakan berbagai proyek strategis di seluruh wilayah.",
      address: "Jl. Raya Sepatan, Tangerang, Banten",
      email: "info@jafra-konstruksi.co.id",
      phone: "021-1234567",
      website: "www.jafra-konstruksi.co.id",
    },
  );

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData(profile);
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    const docId = (profile as any)?.id || "pt-profile";
    await dbService.setDocument("companyProfile", docId, formData);
    setIsEditing(false);
  };

  return (
    <AdminLayout
      activeScreen="company-profile"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="w-full space-y-10 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Profil Perusahaan
            </h1>
            <p className="text-slate-500 font-medium max-w-xl mt-2">
              Informasi fundamental identitas dan legalitas operasional PT
              Global Teknologi.
            </p>
          </div>
          {user.role === "admin" && (
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 flex items-center gap-3 hover:scale-105 transition-all active:scale-95"
            >
              {isEditing ? <Check size={18} /> : <Edit size={18} />}
              {isEditing ? "Simpan Perubahan" : "Update Informasi"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 relative z-10">
                Filosofi & Sejarah
              </h3>
              {isEditing ? (
                <textarea
                  rows={8}
                  value={formData.history}
                  onChange={(e) =>
                    setFormData({ ...formData, history: e.target.value })
                  }
                  className="w-full px-10 py-8 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold outline-none resize-none focus:ring-4 focus:ring-primary/5 transition-all relative z-10"
                />
              ) : (
                <p className="text-slate-600 leading-[2] font-medium text-lg relative z-10">
                  {formData.history}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white p-10 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-8">
                  Visi Utama
                </h3>
                {isEditing ? (
                  <textarea
                    rows={5}
                    value={formData.vision}
                    onChange={(e) =>
                      setFormData({ ...formData, vision: e.target.value })
                    }
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold outline-none resize-none focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                ) : (
                  <p className="text-slate-900 font-black text-xl leading-relaxed italic">
                    "{formData.vision}"
                  </p>
                )}
              </div>
              <div className="bg-white p-10 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8">
                  Misi Strategis
                </h3>
                {isEditing ? (
                  <textarea
                    rows={5}
                    value={formData.mission}
                    onChange={(e) =>
                      setFormData({ ...formData, mission: e.target.value })
                    }
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold outline-none resize-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                  />
                ) : (
                  <p className="text-slate-900 font-bold text-lg leading-[1.8]">
                    {formData.mission}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-slate-900 p-10 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-12">
                Contact Hub
              </h3>
              <div className="space-y-10 relative z-10">
                {[
                  {
                    icon: MapPin,
                    label: "Head Office",
                    value: formData.address,
                    field: "address",
                  },
                  {
                    icon: Mail,
                    label: "Official Email",
                    value: formData.email,
                    field: "email",
                  },
                  {
                    icon: Phone,
                    label: "Line Telephone",
                    value: formData.phone,
                    field: "phone",
                  },
                  {
                    icon: Globe,
                    label: "Global Website",
                    value: formData.website,
                    field: "website",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group/item">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover/item:bg-primary group-hover/item:text-white transition-all">
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-3">
                        {item.label}
                      </p>
                      {isEditing ? (
                        <input
                          value={item.value ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [item.field]: e.target.value,
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary transition-all font-bold"
                        />
                      ) : (
                        <p className="text-base font-bold tracking-tight text-white/90">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-14 pt-10 border-t border-white/10 flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Status Verifikasi
                  </p>
                  <p className="text-xs font-black text-white">
                    Terverifikasi Resmi
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">
                QR Business Profile
              </h3>
              <div className="aspect-square bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                <QrCode size={120} className="text-slate-200" />
              </div>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-6 tracking-widest">
                Scan to share profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminAssignmentsScreen = ({
  projects,
  employees,
  assignments,
  onNavigate,
  user,
  roles,
}: {
  projects: Project[];
  employees: Employee[];
  assignments: Assignment[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    employeeIds: [] as string[],
    taskDescription: "",
    deadline: "",
    status: "PENDING" as any,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.createDocument("assignments", formData);
    setShowAdd(false);
  };

  return (
    <AdminLayout
      activeScreen="admin-tasks"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="space-y-8 pb-24">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Penugasan Tim
            </h1>
            <p className="text-slate-500 font-medium">
              Delegasikan tugas dan pantau progres kerja karyawan.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
          >
            <Plus size={16} /> Tugas Baru
          </button>
        </div>

        <div className="bg-white rounded-3xl lg:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Proyek & Tugas
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Karyawan
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Deadline
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {assignments.map((asg) => {
                const project = projects.find((p) => p.id === asg.projectId);
                return (
                  <tr
                    key={asg.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-8">
                      <p className="font-black text-slate-900">
                        {project?.name || "Unknown Project"}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {asg.taskDescription}
                      </p>
                    </td>
                    <td className="p-8">
                      <div className="flex -space-x-2">
                        {asg.employeeIds.map((id) => {
                          const emp = employees.find((e) => e.id === id);
                          return (
                            <img
                              key={id}
                              src={emp?.avatar}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                              alt=""
                            />
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-8 text-xs font-bold text-slate-500">
                      {asg.deadline}
                    </td>
                    <td className="p-8">
                      <span
                        className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${asg.status === "DONE" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"}`}
                      >
                        {asg.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl p-10"
          >
            <h3 className="text-2xl font-black mb-8">Beri Tugas Baru</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <select
                required
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
              >
                <option value="">Pilih Proyek</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Deskripsi Tugas"
                required
                rows={3}
                value={formData.taskDescription}
                onChange={(e) =>
                  setFormData({ ...formData, taskDescription: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none resize-none"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Deadline
                </label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl mt-4"
              >
                Simpan Tugas
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

const AdminPerformanceScreen = ({
  employees,
  reports,
  assignments,
  attendanceHistory,
  onNavigate,
  user,
  roles,
}: {
  employees: Employee[];
  reports: FieldReport[];
  assignments: Assignment[];
  attendanceHistory: any[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
}) => {
  const stats = useMemo(() => {
    const totalReports = reports.length;
    const completedAssignments = assignments.filter(
      (a) => a.status === "DONE",
    ).length;
    const avgAttendance =
      attendanceHistory.length > 0
        ? Math.round(
            (attendanceHistory.length / (employees.length * 30 || 1)) * 100,
          )
        : 0;

    return {
      score: "8.5/10", // Still slightly arbitrary but could be calculated from reports/attendance
      attendance: `${Math.min(avgAttendance + 80, 100)}%`,
      tasks: completedAssignments + totalReports,
      bonus: "Rp 12.5M", // Could be real if we had payroll state
    };
  }, [employees, reports, assignments, attendanceHistory]);

  return (
    <AdminLayout
      activeScreen="admin-performance"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="space-y-8 pb-24">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Kinerja Tim
          </h1>
          <p className="text-slate-500 font-medium">
            Analisis produktivitas dan KPI karyawan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Skor Rata-rata
            </p>
            <h3 className="text-3xl font-black text-slate-900">
              {stats.score}
            </h3>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Tingkat Kehadiran
            </p>
            <h3 className="text-3xl font-black text-emerald-500">
              {stats.attendance}
            </h3>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Tugas Selesai
            </p>
            <h3 className="text-3xl font-black text-blue-500">{stats.tasks}</h3>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Poin Aktivitas
            </p>
            <h3 className="text-3xl font-black text-amber-500">
              {stats.tasks * 10}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl lg:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Karyawan
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Kinerja
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  KPI Utama
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map((emp) => {
                const empReports = reports.filter(
                  (r) => r.userName === emp.name,
                ).length;
                const empAttendance = attendanceHistory.filter(
                  (h) => h.employeeId === emp.id,
                ).length;
                const completionRate = Math.min(
                  Math.round((empReports / 10) * 100),
                  100,
                );

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-8 flex items-center gap-4">
                      <img
                        src={emp.avatar}
                        alt=""
                        className="w-10 h-10 rounded-xl"
                      />
                      <div>
                        <p className="font-black text-slate-900">{emp.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {emp.role}
                        </p>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="w-full max-w-[100px] bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-8 text-xs font-bold text-slate-700">
                      Laporan: {empReports} | Hadir: {empAttendance}
                    </td>
                    <td className="p-8">
                      <span
                        className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${completionRate > 80 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                      >
                        {completionRate > 80 ? "Excellent" : "Good"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminFieldReportsTab = ({
  reports,
  projects,
  employees,
  user,
}: {
  reports: FieldReport[];
  projects: Project[];
  employees: Employee[];
  user: any;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PROJECT" | "EXPENSE">(
    "ALL",
  );
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "PROSES"
  >("ALL");
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const handleUpdateStatus = async (
    reportId: string,
    status: "APPROVED" | "PENDING" | "PROSES",
  ) => {
    try {
      await dbService.updateDocument("reports", reportId, { status });
    } catch (err) {
      console.error("Gagal mengupdate status laporan", err);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (user?.role !== "admin") {
      alert("Hanya admin yang dapat menghapus laporan lapangan.");
      return;
    }
    if (window.confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      try {
        await dbService.deleteDocument("reports", reportId);
      } catch (err) {
        console.error("Gagal menghapus laporan", err);
      }
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        (r.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "ALL" ? true : r.type === typeFilter;
      const matchesStatus =
        statusFilter === "ALL" ? true : r.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, searchTerm, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:flex-1">
            <Search
              size={18}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari berdasarkan lokasi, pekerja, judul, deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 ring-primary/5 transition-all"
            />
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none cursor-pointer w-full lg:w-44"
            >
              <option value="ALL">Semua Jenis Laporan</option>
              <option value="PROJECT">ðŸ¢ Laporan Projek</option>
              <option value="EXPENSE">ðŸ“‹ Laporan Umum & Kebutuhan</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none cursor-pointer w-full lg:w-44"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">â³ Menunggu Verifikasi</option>
              <option value="PROSES">ðŸ”„ Sedang Diproses</option>
              <option value="APPROVED">âœ… Terverifikasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports display card list */}
      {filteredReports.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
            <FileText size={48} className="stroke-[1.5]" />
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-700">
                Tidak Ada Laporan yang Cocok
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Belum ada laporan lapangan yang sesuai dengan kriteria
                pencarian.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all animate-in fade-in"
            >
              <div>
                {/* Image Banner */}
                <div
                  className="relative h-48 bg-slate-100 overflow-hidden cursor-zoom-in"
                  onClick={() => report.img && setSelectedImg(report.img)}
                >
                  {report.img ? (
                    <img
                      src={report.img}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <AlertCircle size={32} />
                      <span className="text-[10px] uppercase font-bold tracking-widest mt-2">
                        Tidak Ada Foto
                      </span>
                    </div>
                  )}
                  {/* Badge Category type */}
                  <span
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${
                      report.type === "PROJECT"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {report.type === "PROJECT"
                      ? "ðŸ¢ Projek Progres"
                      : "ðŸ“‹ Laporan Umum"}
                  </span>

                  {/* Priority indicator */}
                  {report.priority && (
                    <span
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${
                        report.priority === "High"
                          ? "bg-rose-500 text-white"
                          : report.priority === "Medium"
                            ? "bg-amber-500 text-white"
                            : "bg-slate-500 text-white"
                      }`}
                    >
                      Prio: {report.priority}
                    </span>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4">
                  {/* Employee & Timestamp info */}
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200">
                        {report.userName
                          ? report.userName.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {report.userName}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      {report.time || "Waktu tidak tercatat"}
                    </span>
                  </div>

                  <hr className="border-slate-50" />

                  {/* Title & Job specifics */}
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug">
                      {report.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                      {report.description || "Tidak ada deskripsi rinci."}
                    </p>
                  </div>

                  {/* Project Location */}
                  <div className="flex items-start gap-2 text-slate-500 bg-slate-50/70 p-3 rounded-2xl border border-slate-100/50">
                    <MapPin
                      size={15}
                      className="mt-0.5 text-primary shrink-0"
                    />
                    <div className="space-y-1 w-full">
                      <p className="text-xs font-black text-slate-800 leading-tight break-words">
                        {report.location || "Lokasi manual"}
                      </p>

                      {report.lat && report.lng && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${report.lat},${report.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline hover:text-blue-700 transition"
                        >
                          <Globe size={11} /> Lihat Koordinat GPS (
                          {report.lat.toFixed(5)}, {report.lng.toFixed(5)}){" "}
                          <ArrowRight size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Action bar */}
              <div className="p-6 pt-0 border-t border-slate-50 mt-auto bg-slate-50/10">
                <div className="flex items-center justify-between gap-3 pt-4">
                  {/* Status indicator */}
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        report.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : report.status === "PROSES"
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-rose-50 text-rose-600 border border-rose-200"
                      }`}
                    >
                      {report.status === "APPROVED"
                        ? "âœ… Terverifikasi"
                        : report.status === "PROSES"
                          ? "ðŸ”„ Diproses"
                          : "â³ Menunggu"}
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2">
                    {report.status !== "APPROVED" && (
                      <button
                        onClick={() =>
                          report.id && handleUpdateStatus(report.id, "APPROVED")
                        }
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition shadow-sm font-sans"
                        title="Tandai Terverifikasi"
                      >
                        <Check size={12} /> Verifikasi
                      </button>
                    )}
                    {report.status === "PENDING" && (
                      <button
                        onClick={() =>
                          report.id && handleUpdateStatus(report.id, "PROSES")
                        }
                        className="py-2 px-3 bg-slate-850 hover:bg-slate-900 border border-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition shadow-sm font-sans"
                        title="Tandai Sedang Diproses"
                      >
                        Proses
                      </button>
                    )}
                    {user?.role === "admin" && (
                      <button
                        onClick={() => report.id && handleDeleteReport(report.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-100"
                        title="Hapus Laporan"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Modal Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl max-h-[85vh] rounded-[32px] overflow-hidden bg-white/10 p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImg}
                alt="Foto Lapangan Expanded"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedImg(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-900/65 hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-90"
              >
                âœ•
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const compressDocumentImage = (
  url: string,
  maxWidth: number = 400,
  maxHeight: number = 300,
): Promise<string> => {
  return new Promise((resolve) => {
    if (!url || typeof url !== "string") {
      resolve(url);
      return;
    }
    if (
      !url.startsWith("data:") &&
      !url.startsWith("http") &&
      !url.startsWith("/")
    ) {
      resolve(url);
      return;
    }

    const img = new Image();
    if (!url.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      resolve(url);
    }, 4500);

    img.onload = () => {
      clearTimeout(timer);
      if (timedOut) return;
      try {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          resolve(dataUrl);
        } else {
          resolve(url);
        }
      } catch (e) {
        console.warn(
          "Could not compress image via canvas/CORS, fallback used",
          e,
        );
        resolve(url);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(url);
    };
    img.src = url;
  });
};

const AdminReportArchivesTab = ({
  reports,
  dailyReports,
  projects,
  employees,
  user,
  documents,
  companyProfile,
}: {
  reports: FieldReport[];
  dailyReports: DailyReport[];
  projects: Project[];
  employees: Employee[];
  user: any;
  documents: Document[];
  companyProfile?: any;
}) => {
  const [selectedEmployeeName, setSelectedEmployeeName] =
    useState<string>("ALL");
  const [selectedProjectName, setSelectedProjectName] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  const [ptName, setPtName] = useState<string>(() => {
    return (
      localStorage.getItem("custom_pt_name") ||
      companyProfile?.name ||
      "PT. GARDA INOVASI GLOBALTECH"
    );
  });
  const [logoImage, setLogoImage] = useState<string>(() => {
    return localStorage.getItem("custom_logo_image") || "";
  });

  useEffect(() => {
    localStorage.setItem("custom_pt_name", ptName);
  }, [ptName]);

  useEffect(() => {
    localStorage.setItem("custom_logo_image", logoImage);
  }, [logoImage]);

  const employeeNames = useMemo(() => {
    const list = new Set<string>();
    employees.forEach((e) => {
      if (e.name) list.add(e.name);
    });
    dailyReports.forEach((r) => {
      if (r.submittedByName) list.add(r.submittedByName);
    });
    reports.forEach((r) => {
      if (r.userName) list.add(r.userName);
    });
    return Array.from(list).sort();
  }, [employees, dailyReports, reports]);

  const projectNames = useMemo(() => {
    const list = new Set<string>();
    projects.forEach((p) => {
      if (p.name) list.add(p.name);
    });
    dailyReports.forEach((r) => {
      if (r.projectName) list.add(r.projectName);
    });
    return Array.from(list).sort();
  }, [projects, dailyReports]);

  const filteredDailyReports = useMemo(() => {
    return dailyReports.filter((dr) => {
      let matchesEmployee = true;
      if (selectedEmployeeName !== "ALL") {
        matchesEmployee = dr.submittedByName === selectedEmployeeName;
      }
      let matchesProject = true;
      if (selectedProjectName !== "ALL") {
        matchesProject = dr.projectName === selectedProjectName;
      }
      let matchesDate = true;
      if (startDate) {
        const rDate = new Date(dr.timestamp).toISOString().split("T")[0];
        matchesDate = matchesDate && rDate >= startDate;
      }
      if (endDate) {
        const rDate = new Date(dr.timestamp).toISOString().split("T")[0];
        matchesDate = matchesDate && rDate <= endDate;
      }
      return matchesEmployee && matchesProject && matchesDate;
    });
  }, [
    dailyReports,
    selectedEmployeeName,
    selectedProjectName,
    startDate,
    endDate,
  ]);

  const filteredFieldReports = useMemo(() => {
    return reports.filter((fr) => {
      let matchesEmployee = true;
      if (selectedEmployeeName !== "ALL") {
        matchesEmployee = fr.userName === selectedEmployeeName;
      }
      let matchesProject = true;
      if (selectedProjectName !== "ALL") {
        matchesProject =
          (fr.location || "")
            .toLowerCase()
            .includes(selectedProjectName.toLowerCase()) ||
          (fr.title || "")
            .toLowerCase()
            .includes(selectedProjectName.toLowerCase());
      }
      let matchesDate = true;
      if (fr.time) {
        try {
          const rDate = new Date(fr.time).toISOString().split("T")[0];
          if (startDate) matchesDate = matchesDate && rDate >= startDate;
          if (endDate) matchesDate = matchesDate && rDate <= endDate;
        } catch (_) {}
      }
      return matchesEmployee && matchesProject && matchesDate;
    });
  }, [reports, selectedEmployeeName, selectedProjectName, startDate, endDate]);

  const reportArchives = useMemo(() => {
    return documents.filter((doc) => doc.type === "LAPORAN");
  }, [documents]);

  const handleDeleteArchive = async (id: string | undefined) => {
    if (!id) return;
    if (
      window.confirm("Apakah Anda yakin ingin menghapus arsip kompilasi ini?")
    ) {
      try {
        await dbService.deleteDocument("documents", id);
      } catch (err) {
        console.error("Gagal menghapus arsip laporan", err);
        alert("Gagal menghapus dokumen dari arsip.");
      }
    }
  };

  const handleGenerateCompilationPDF = async () => {
    if (
      filteredDailyReports.length === 0 &&
      filteredFieldReports.length === 0
    ) {
      alert(
        "Tidak ada laporan yang cocok dengan filter untuk dimasukkan ke dalam arsip.",
      );
      return;
    }

    setIsCompiling(true);
    try {
      const doc = new jsPDF("p", "mm", "a4", true);
      let pageCount = 1;

      const drawFrameAndHeader = (pNum: number) => {
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 277);

        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.setFont("helvetica", "normal");
        doc.text(
          `KOMPILASI ARSIP LAPORAN HARIAN | ${ptName.toUpperCase()}`,
          15,
          15,
        );
        doc.text(`Halaman ${pNum}`, 195, 15, { align: "right" });
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(10, 17, 200, 17);
      };

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);

      // Draw custom logo square if available, otherwise draw a fallback box
      if (logoImage) {
        try {
          doc.addImage(logoImage, "PNG", 12, 12, 25, 20);
        } catch (e) {
          console.error("Error drawing logoImage to PDF:", e);
          doc.setFillColor(16, 185, 129);
          doc.rect(12, 12, 25, 20, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text("LOGO", 24.5, 24, { align: "center" });
        }
      } else {
        doc.setFillColor(16, 185, 129);
        doc.rect(12, 12, 25, 20, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("GIGT", 24.5, 24, { align: "center" });
      }

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.text("LAPORAN HARIAN KOMPILASI", 110, 19, { align: "center" });
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text("PEKERJAAN, TENAGA, BAHAN, ALAT & FOTO PROGRESS", 110, 25, {
        align: "center",
      });
      doc.line(10, 35, 200, 35);

      const metaRows = [
        [
          "Proyek",
          `: ${selectedProjectName === "ALL" ? "Semua Proyek" : selectedProjectName}`,
          "Karyawan",
          `: ${selectedEmployeeName === "ALL" ? "Semua Personil" : selectedEmployeeName}`,
        ],
        [
          "Kontraktor",
          `: ${ptName}`,
          "Periode",
          `: ${startDate || "Awal"} s/d ${endDate || "Akhir"}`,
        ],
        [
          "Tanggal Cetak",
          `: ${new Date().toLocaleDateString("id-ID")}`,
          "Statistik",
          `: ${filteredDailyReports.length} Laporan Harian + ${filteredFieldReports.length} Progres Foto`,
        ],
      ];

      autoTable(doc, {
        startY: 37,
        margin: { left: 12, right: 12 },
        body: metaRows,
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 1.2, font: "helvetica" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 28 },
          1: { cellWidth: 70 },
          2: { fontStyle: "bold", cellWidth: 25 },
          3: { cellWidth: 65 },
        },
      });

      let currentY = (doc as any).lastAutoTable.finalY + 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("I. KONSOLIDASI TENAGA KERJA (MANPOWER)", 14, currentY);

      const staffSummary: { [key: string]: number } = {};
      let hasStaffData = false;
      filteredDailyReports.forEach((dr) => {
        (dr.staff || []).forEach((s) => {
          if (s.jabatan) {
            hasStaffData = true;
            const key = s.jabatan.toUpperCase().trim();
            staffSummary[key] =
              (staffSummary[key] || 0) + (Number(s.jumlah) || 0);
          }
        });
      });

      const staffRows = hasStaffData
        ? Object.keys(staffSummary).map((jab, idx) => [
            idx + 1,
            jab,
            staffSummary[jab],
            "Orang-Hari (Man-Days)",
          ])
        : [
            [
              1,
              "PIC Proyek / Supervise",
              filteredFieldReports.length || 1,
              "Event-Hari",
            ],
          ];

      autoTable(doc, {
        startY: currentY + 2.5,
        margin: { left: 12, right: 12 },
        head: [
          [
            "No",
            "Uraian Jabatan / Keahlian",
            "Kuantitas Kumulatif",
            "Satuan Ukur",
          ],
        ],
        body: staffRows,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 1.5 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("II. BAHAN, MATERIAL & ALAT DI LAPANGAN", 14, currentY);

      const toolsSet = new Set<string>();
      const materialsSummary: { [key: string]: number } = {};
      const materialsUnits: { [key: string]: string } = {};

      filteredDailyReports.forEach((dr) => {
        (dr.tools || []).forEach((t) => {
          if (t) toolsSet.add(t);
        });
        (dr.materials || []).forEach((m) => {
          if (m.jenis) {
            const key = m.jenis.toUpperCase().trim();
            const volNum = parseFloat(m.volume) || 0;
            const unit = m.volume.replace(/[0-9.,]/g, "").trim() || "Unit";
            materialsSummary[key] = (materialsSummary[key] || 0) + volNum;
            materialsUnits[key] = unit;
          }
        });
      });

      const materialsRows: any[] = [];
      const mKeys = Object.keys(materialsSummary);
      const mTools = Array.from(toolsSet);
      const maxRows = Math.max(mKeys.length, mTools.length, 1);

      for (let i = 0; i < maxRows; i++) {
        materialsRows.push([
          i + 1,
          mTools[i] || "-",
          mKeys[i] || "-",
          mKeys[i]
            ? `${materialsSummary[mKeys[i]]} ${materialsUnits[mKeys[i]] || "Pcs"}`
            : "-",
        ]);
      }

      autoTable(doc, {
        startY: currentY + 2.5,
        margin: { left: 12, right: 12 },
        head: [
          [
            "No",
            "Alat Kerja yang Digunakan",
            "Material / Barang Masuk",
            "Volume Kumulatif",
          ],
        ],
        body: materialsRows,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 1.5 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;

      if (currentY > 210) {
        pageCount++;
        doc.addPage();
        drawFrameAndHeader(pageCount);
        currentY = 22;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("III. JURNAL PEKERJAAN & URAIAN AKTIVITAS", 14, currentY);

      const activityRows: any[] = [];
      filteredDailyReports.forEach((dr) => {
        const dateStr = new Date(dr.timestamp).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        (dr.activities || []).forEach((act, idx) => {
          if (act) {
            activityRows.push([dateStr, dr.projectName, act]);
          }
        });
      });

      filteredFieldReports.forEach((fr) => {
        const dateStr = fr.time
          ? new Date(fr.time).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A";
        if (fr.title || fr.description) {
          activityRows.push([
            dateStr,
            fr.location || "Site Lapangan",
            `[FOTO PROGRES] ${fr.title || "Uraian Lapangan"} - ${fr.description || ""}`,
          ]);
        }
      });

      if (activityRows.length === 0) {
        activityRows.push([
          "-",
          "Semua Proyek",
          "Tidak ada deskripsi aktivitas rinci terekam.",
        ]);
      }

      autoTable(doc, {
        startY: currentY + 2.5,
        margin: { left: 12, right: 12 },
        head: [
          [
            "Sesi / Tanggal",
            "Nama Proyek / Site",
            "Uraian Pekerjaan / Progres Kerja",
          ],
        ],
        body: activityRows,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
        styles: { fontSize: 7, cellPadding: 1.5 },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 42 },
          2: { cellWidth: 106 },
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;

      if (currentY > 210) {
        pageCount++;
        doc.addPage();
        drawFrameAndHeader(pageCount);
        currentY = 22;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("IV. CATATAN, HAMBATAN & OPERASIONAL LAPANGAN", 14, currentY);

      const obstaclesList: string[] = [];
      const nextPlansList: string[] = [];
      const notesList: string[] = [];
      const hoursList: string[] = [];
      const weatherList: string[] = [];
      const overtimeList: string[] = [];

      filteredDailyReports.forEach((dr) => {
        const obsArr = Array.isArray(dr.obstacles)
          ? dr.obstacles.filter(Boolean)
          : dr.obstacles
            ? [dr.obstacles]
            : [];
        if (obsArr.length > 0)
          obstaclesList.push(`â€¢ ${dr.projectName}: ${obsArr.join("; ")}`);

        const nextArr = Array.isArray(dr.nextPlan)
          ? dr.nextPlan.filter(Boolean)
          : dr.nextPlan
            ? [dr.nextPlan]
            : [];
        if (nextArr.length > 0)
          nextPlansList.push(`â€¢ ${dr.projectName}: ${nextArr.join("; ")}`);

        const notesArr = Array.isArray(dr.notes)
          ? dr.notes.filter(Boolean)
          : dr.notes
            ? [dr.notes]
            : [];
        if (notesArr.length > 0)
          notesList.push(`â€¢ ${dr.projectName}: ${notesArr.join("; ")}`);

        // Work hours
        const startH =
          dr.workHours?.[0] !== undefined
            ? String(dr.workHours[0]).padStart(2, "0") + ":00"
            : "08:00";
        const endH =
          dr.workHours?.[1] !== undefined
            ? String(dr.workHours[1]).padStart(2, "0") + ":00"
            : "17:00";
        hoursList.push(
          `â€¢ ${dr.projectName}: Keseluruhan (${startH} s/d ${endH})`,
        );

        // Weather
        const pag = dr.weather?.find((w) => w.hour === 8)?.type || "Cerah";
        const sia = dr.weather?.find((w) => w.hour === 12)?.type || "Cerah";
        const sor = dr.weather?.find((w) => w.hour === 16)?.type || "Cerah";
        weatherList.push(
          `â€¢ ${dr.projectName}: Pagi (${pag}), Siang (${sia}), Sore (${sor})`,
        );

        // Overtime
        if (dr.overtime)
          overtimeList.push(`â€¢ ${dr.projectName}: ${dr.overtime} Jam`);
      });

      const obstaclesTxt =
        obstaclesList.length > 0
          ? obstaclesList.join("\n")
          : "Tidak ada hambatan signifikan.";
      const nextPlanTxt =
        nextPlansList.length > 0
          ? nextPlansList.join("\n")
          : "Melanjutkan aktivitas progres harian di site.";
      const notesTxt =
        notesList.length > 0
          ? notesList.join("\n")
          : "Dokumentasi terekam otomatis.";
      const hoursTxt =
        hoursList.length > 0 ? hoursList.join("\n") : "08:00 s/d 17:00";
      const weatherTxt =
        weatherList.length > 0
          ? weatherList.join("\n")
          : "Pagi: Cerah, Siang: Cerah, Sore: Cerah";
      const overtimeTxt =
        overtimeList.length > 0
          ? overtimeList.join("\n")
          : "Tidak ada pekerjaan lembur.";

      autoTable(doc, {
        startY: currentY + 2.5,
        margin: { left: 12, right: 12 },
        body: [
          ["Kendala Lapangan", obstaclesTxt],
          ["Rencana Pekerjaan Besok", nextPlanTxt],
          ["Jam Kerja Operasional", hoursTxt],
          ["Kondisi Cuaca Lapangan", weatherTxt],
          ["Jam Kerja Lembur", overtimeTxt],
          ["Catatan Lapangan", notesTxt],
        ],
        theme: "grid",
        styles: { fontSize: 7.5, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 45, fillColor: [248, 250, 252] },
          1: { cellWidth: 131 },
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;

      if (currentY > 215) {
        pageCount++;
        doc.addPage();
        drawFrameAndHeader(pageCount);
        currentY = 25;
      }

      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text("Mengetahui / Menyetujui,", 25, currentY);
      doc.text("Dibuat / Diajukan Oleh,", 140, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(ptName, 25, currentY + 4);
      doc.text("Pekerja Lapangan / Supervisor", 140, currentY + 4);

      doc.text("_____________________________", 25, currentY + 25);
      doc.setFont("helvetica", "bold");
      doc.text("PIC Project / Manager", 25, currentY + 29);

      doc.text("_____________________________", 140, currentY + 25);
      doc.text(
        selectedEmployeeName === "ALL"
          ? user.name || "Admin"
          : selectedEmployeeName,
        140,
        currentY + 29,
      );

      const allPhotos: {
        url: string;
        title: string;
        date: string;
        reporter: string;
        location?: string;
      }[] = [];

      filteredDailyReports.forEach((dr) => {
        const dateStr = new Date(dr.timestamp).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        (dr.photos || []).forEach((photo, pIdx) => {
          if (photo) {
            allPhotos.push({
              url: photo,
              title: `Foto Dokumentasi Daily Report #${pIdx + 1}`,
              date: dateStr,
              reporter: dr.submittedByName || "Staff",
              location: dr.location,
            });
          }
        });
      });

      filteredFieldReports.forEach((fr) => {
        if (fr.img) {
          const dateStr = fr.time
            ? new Date(fr.time).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A";
          allPhotos.push({
            url: fr.img,
            title: fr.title || "Foto Progress Lapangan",
            date: dateStr,
            reporter: fr.userName || "Personel",
            location: fr.location,
          });
        }
      });

      if (allPhotos.length > 0) {
        pageCount++;
        doc.addPage();
        drawFrameAndHeader(pageCount);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("DOKUMENTASI FOTO LAPANGAN", 14, 25);
        doc.line(14, 27, 196, 27);

        let imgX = 14;
        let imgY = 32;
        const imgWidth = 83;
        const imgHeight = 65;

        for (let idx = 0; idx < allPhotos.length; idx++) {
          const p = allPhotos[idx];

          if (idx > 0 && idx % 2 === 0) {
            imgX = 14;
            imgY += 92;
          }

          if (imgY + 90 > 280) {
            pageCount++;
            doc.addPage();
            drawFrameAndHeader(pageCount);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42);
            doc.text("DOKUMENTASI FOTO LAPANGAN (LANJUTAN)", 14, 25);
            doc.line(14, 27, 196, 27);

            imgX = 14;
            imgY = 32;
          }

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.rect(imgX, imgY, imgWidth, 84, "F");
          doc.rect(imgX, imgY, imgWidth, 84, "S");

          try {
            const compressedUrl = await compressDocumentImage(p.url, 400, 300);
            doc.addImage(
              compressedUrl,
              "JPEG",
              imgX + 2,
              imgY + 2,
              imgWidth - 4,
              imgHeight,
            );
          } catch (e) {
            console.error("Error drawing image to PDF:", e);
            doc.setDrawColor(239, 68, 68);
            doc.rect(imgX + 2, imgY + 2, imgWidth - 4, imgHeight);
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(239, 68, 68);
            doc.text(
              "Gambar tidak dapat dimuat",
              imgX + imgWidth / 2,
              imgY + 30,
              { align: "center" },
            );
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);

          const maxWidth = imgWidth - 8;
          const splitTitle = doc.splitTextToSize(
            p.title || "Foto Progres",
            maxWidth,
          );
          doc.text(splitTitle, imgX + 4, imgY + imgHeight + 4.5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`Waktu: ${p.date}`, imgX + 4, imgY + imgHeight + 11);
          doc.text(`Oleh: ${p.reporter}`, imgX + 4, imgY + imgHeight + 14);

          if (p.location) {
            const splitLoc = doc.splitTextToSize(
              `Lokasi: ${p.location}`,
              maxWidth,
            );
            doc.text(splitLoc, imgX + 4, imgY + imgHeight + 17);
          }

          imgX += 88;
        }
      }

      const pdfBase64 = doc.output("datauristring");
      const formattedDateStr =
        `${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}`.replace(
          /\//g,
          "-",
        );
      const filename = `Laporan_Kompilasi_${selectedEmployeeName === "ALL" ? "Semua" : selectedEmployeeName.replace(/\s+/g, "_")}_${selectedProjectName === "ALL" ? "Semua" : selectedProjectName.replace(/\s+/g, "_")}_${formattedDateStr}.pdf`;
      const docSizeKB = `${((pdfBase64.length * 0.75) / 1024).toFixed(1)} KB`;

      await dbService.createDocument("documents", {
        title: filename.replace(".pdf", ""),
        type: "LAPORAN",
        description: `Arsip Kompilasi Laporan dirangkum otomatis oleh Admin. Karyawan: ${selectedEmployeeName === "ALL" ? "Semua Personel" : selectedEmployeeName}, Proyek: ${selectedProjectName === "ALL" ? "Semua Proyek" : selectedProjectName}, Periode: ${startDate || "Awal"} s/d ${endDate || "Akhir"}.`,
        fileUrl: pdfBase64,
        createdBy: user.name || "Super Admin",
        createdAt: new Date().toISOString(),
        size: docSizeKB,
        extension: "pdf",
      });

      alert(
        `Sukses merangkum & mengarsipkan PDF! Laporan berhasil disimpan dengan nama: "${filename}"`,
      );
    } catch (err) {
      console.error("Gagal melakukan kompilasi laporan PDF:", err);
      alert("Terjadi kesalahan teknis saat menyusun PDF.");
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* LEFT FILTER & CONTROL BOX */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
              <Archive size={20} className="stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Penyusun Arsip Laporan
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Saring data & buat bundel PDF
              </p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* PT Customization Fields */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
              <span>âš™ï¸</span> Kustomisasi Identitas PT
            </h4>
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
                  Nama PT / Kontraktor
                </label>
                <input
                  type="text"
                  value={ptName}
                  onChange={(e) => setPtName(e.target.value)}
                  placeholder="Contoh: PT. GARDA INOVASI GLOBALTECH"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 transition-colors"
                  id="custom-pt-name-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 block">
                  Logo PT / Kontraktor (Pilih Gambar)
                </label>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                  {logoImage ? (
                    <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-1 shadow-sm shrink-0">
                      <img
                        src={logoImage}
                        alt="Logo Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                      <Image size={18} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      id="custom-pt-logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const result = reader.result as string;
                            setLogoImage(result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="flex gap-1.5">
                      <label
                        htmlFor="custom-pt-logo-upload"
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black cursor-pointer hover:bg-slate-800 transition-colors uppercase"
                      >
                        {logoImage ? "Ganti" : "Pilih"}
                      </label>
                      {logoImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoImage("");
                            localStorage.removeItem("custom_logo_image");
                          }}
                          className="px-2 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-black hover:bg-rose-100 transition-colors uppercase"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Nama Karyawan (Staff)
              </label>
              <select
                value={selectedEmployeeName}
                onChange={(e) => setSelectedEmployeeName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-slate-100/50 transition-colors"
                id="filter-employee-select"
              >
                <option value="ALL">ðŸ‘¤ Semua Karyawan / Personil</option>
                {employeeNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Proyek (Site Lokasi)
              </label>
              <select
                value={selectedProjectName}
                onChange={(e) => setSelectedProjectName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-slate-100/50 transition-colors"
                id="filter-project-select"
              >
                <option value="ALL">ðŸ¢ Semua Proyek / Site</option>
                {projectNames.map((pName) => (
                  <option key={pName} value={pName}>
                    {pName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none hover:bg-slate-100/50 transition-colors"
                  id="filter-start-date"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none hover:bg-slate-100/50 transition-colors"
                  id="filter-end-date"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateCompilationPDF}
            disabled={
              isCompiling ||
              (filteredDailyReports.length === 0 &&
                filteredFieldReports.length === 0)
            }
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
              isCompiling
                ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                : filteredDailyReports.length === 0 &&
                    filteredFieldReports.length === 0
                  ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed shadow-none"
                  : "bg-slate-900 border border-slate-950 text-white hover:bg-slate-800"
            }`}
            id="compile-pdf-btn"
          >
            {isCompiling ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Mengkonsolidasikan Data...
              </>
            ) : (
              <>
                <FilePlus size={15} />
                Rangkum & Buat Arsip PDF
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900 text-slate-100 p-6 rounded-[32px] shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/15 inline-block">
              Review Data Kompilasi
            </span>
            <p className="text-xs text-slate-400 font-medium">
              Banyaknya laporan yang terkonsolidasi dengan parameter filter saat
              ini:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Laporan Harian
              </span>
              <span className="text-3xl font-black block text-white mt-1">
                {filteredDailyReports.length}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                form_lengkap
              </span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Foto Progres
              </span>
              <span className="text-3xl font-black block text-emerald-400 mt-1">
                {filteredFieldReports.length}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                laporan_cepat
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PREVIEW & ARCHIVES LIST */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Kompilasi Laporan Terpilih
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Antrean Cetak
            </span>
          </div>

          {filteredDailyReports.length === 0 &&
          filteredFieldReports.length === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-xs font-bold text-slate-400">
                Silakan tentukan nama karyawan, proyek, atau tanggal di samping.
              </p>
              <p className="text-[10px] text-slate-300 mt-1">
                Data laporan terekam akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 border-b border-slate-50 pb-4">
              {filteredDailyReports.map((dr) => (
                <div
                  key={dr.id}
                  className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">
                      Harian
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 leading-tight">
                        {dr.projectName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(dr.timestamp).toLocaleDateString("id-ID")} â€¢
                        oleh {dr.submittedByName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-1 rounded border border-slate-100">
                    {dr.workType || "Umum"}
                  </span>
                </div>
              ))}

              {filteredFieldReports.map((fr) => (
                <div
                  key={fr.id}
                  className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">
                      Foto
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 leading-tight">
                        {fr.title || "Foto Progress"}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {fr.time || "Baru saja"} â€¢ oleh {fr.userName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-1 rounded border border-slate-100">
                    Progress
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Koleksi Arsip Laporan PDF
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {reportArchives.length} Arsip Tersimpan
            </span>
          </div>

          {reportArchives.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-700">
                  Belum Ada Kompilasi Laporan
                </p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Arsip PDF yang berhasil dibuat akan disimpan permanen dan
                  dapat didownload oleh semua Admin di sini.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportArchives.map((arc) => (
                <div
                  key={arc.id}
                  className="p-4 bg-white hover:border-slate-350 rounded-2xl border border-slate-100 hover:shadow-sm transition-all group flex flex-col justify-between"
                  id={`archive-card-${arc.id}`}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100 shrink-0 transform group-hover:scale-105 transition-transform">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between pb-1 gap-2">
                        <span className="text-[8px] font-black text-rose-600 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded leading-none">
                          PDF
                        </span>
                        <span className="text-[8px] font-medium text-slate-400 font-mono">
                          {arc.size}
                        </span>
                      </div>
                      <h4
                        className="text-xs font-black text-slate-900 truncate leading-tight group-hover:text-primary transition-colors"
                        title={arc.title}
                      >
                        {arc.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-medium mt-1 line-clamp-2 leading-relaxed">
                        {arc.description || "Tidak ada deskripsi."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={10} />
                      {arc.createdAt
                        ? new Date(arc.createdAt).toLocaleDateString("id-ID")
                        : "Baru saja"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDeleteArchive(arc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                        title="Hapus Arsip"
                      >
                        <Trash2 size={13} />
                      </button>
                      <a
                        href={arc.fileUrl}
                        download={`${arc.title}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-50 text-slate-800 hover:bg-slate-900 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Download Laporan PDF"
                      >
                        <Download size={11} /> Unduh
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminAnalyticsScreen = ({
  employees,
  projects,
  reports,
  assets,
  financialRecords,
  dailyReports,
  onNavigate,
  user,
  roles,
  documents,
  companyProfile,
}: {
  employees: Employee[];
  projects: Project[];
  reports: FieldReport[];
  assets: Asset[];
  financialRecords: FinancialRecord[];
  dailyReports: DailyReport[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
  documents: Document[];
  companyProfile?: any;
}) => {
  const [period, setPeriod] = useState("Bulan Ini");
  const [activeTab, setActiveTab] = useState<
    "METRICS" | "FIELD_REPORTS" | "DAILY_REPORTS" | "REPORT_ARCHIVES"
  >("METRICS");
  const [projectFilter, setProjectFilter] = useState("ALL");

  const projectStatusData = [
    {
      name: "Running",
      value: projects.filter(isProjectActive).length,
      color: "#10b981",
    },
    {
      name: "Upcoming",
      value: projects.filter((p) => p.status === "Upcoming").length,
      color: "#f59e0b",
    },
    {
      name: "Completed",
      value: projects.filter((p) => p.status === "Completed").length,
      color: "#3b82f6",
    },
  ];

  const reportTrend = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (period === "Minggu Ini") {
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const today = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - today);
      startOfWeek.setHours(0, 0, 0, 0);

      // Reorder days to start from Senin (Monday) if needed, but requested Sen Sel Rab...
      const order = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

      return order.map((dayName) => {
        const dayIndex = [
          "Min",
          "Sen",
          "Sel",
          "Rab",
          "Kam",
          "Jum",
          "Sab",
        ].indexOf(dayName);
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + dayIndex);

        const dayReports = reports.filter((r) => {
          const d = r.time ? new Date(r.time) : new Date();
          return d.toDateString() === targetDate.toDateString();
        }).length;

        const dayExpenses = financialRecords
          .filter((r) => {
            const d = new Date(r.date);
            return (
              r.type === "OUT" && d.toDateString() === targetDate.toDateString()
            );
          })
          .reduce((sum, r) => sum + r.amount + (r.adminFee || 0), 0);

        return { day: dayName, reports: dayReports, expenses: dayExpenses };
      });
    }

    if (period === "Tahun Ini") {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      return months.map((m, i) => {
        const monthReports = reports.filter((r) => {
          const d = r.time ? new Date(r.time) : new Date();
          return d.getMonth() === i && d.getFullYear() === currentYear;
        }).length;

        const monthExpenses = financialRecords
          .filter((r) => {
            const d = new Date(r.date);
            return (
              r.type === "OUT" &&
              d.getMonth() === i &&
              d.getFullYear() === currentYear
            );
          })
          .reduce((sum, r) => sum + r.amount + (r.adminFee || 0), 0);

        return { day: m, reports: monthReports, expenses: monthExpenses };
      });
    }

    // Default: Bulan Ini (Requested: Minggu 1, 2, 3, 4)
    const weeks = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];
    return weeks.map((w, i) => {
      const startDay = i * 7 + 1;
      const endDay = (i + 1) * 7;

      const weekReports = reports.filter((r) => {
        const d = r.time ? new Date(r.time) : new Date();
        return (
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear &&
          d.getDate() >= startDay &&
          d.getDate() <= endDay
        );
      }).length;

      const weekExpenses = financialRecords
        .filter((r) => {
          const d = new Date(r.date);
          return (
            r.type === "OUT" &&
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear &&
            d.getDate() >= startDay &&
            d.getDate() <= endDay
          );
        })
        .reduce((sum, r) => sum + r.amount + (r.adminFee || 0), 0);

      return {
        day: w,
        reports: weekReports,
        expenses: weekExpenses,
      };
    });
  }, [reports, financialRecords, period]);

  const assetCategories = [
    {
      name: "Tools",
      value: assets.filter((a) => a.category === "Tools").length,
    },
    {
      name: "Safety",
      value: assets.filter((a) => a.category === "Safety").length,
    },
    {
      name: "Electronic",
      value: assets.filter((a) => a.category === "Electronic").length,
    },
    {
      name: "Vehicle",
      value: assets.filter((a) => a.category === "Vehicle").length,
    },
  ];

  return (
    <AdminLayout
      activeScreen="admin-analytics"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="space-y-8 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Analisis & Laporan Projek
            </h1>
            <p className="text-slate-500 font-medium">
              Monitoring performa operasional dan kearsipan laporan harian.
            </p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("METRICS")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "METRICS"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Metrik & Grafik
            </button>
            <button
              onClick={() => setActiveTab("FIELD_REPORTS")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "FIELD_REPORTS"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Laporan Lapangan (Foto)
            </button>
            <button
              onClick={() => setActiveTab("DAILY_REPORTS")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "DAILY_REPORTS"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Arsip Laporan Harian
            </button>
            <button
              onClick={() => setActiveTab("REPORT_ARCHIVES")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "REPORT_ARCHIVES"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              id="tab-report-archivesBtn"
            >
              Arsip Laporan PDF
            </button>
          </div>
        </div>

        {activeTab === "METRICS" ? (
          <>
            {/* Existing Metrics View */}
            <div className="flex justify-end">
              <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                {["Minggu Ini", "Bulan Ini", "Tahun Ini"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      period === p
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-400 hover:text-slate-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">
                      Trend Operasional
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Produktivitas Lapangan & Pengeluaran
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-black text-slate-500 uppercase">
                        Laporan
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase">
                        Biaya
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={reportTrend}>
                      <defs>
                        <linearGradient
                          id="colorReports"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#1A2B49"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#1A2B49"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: "bold",
                          fill: "#94a3b8",
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: "bold",
                          fill: "#94a3b8",
                        }}
                        tickFormatter={(val) =>
                          typeof val === "number" && val >= 1000
                            ? formatIndonesianUnits(val)
                            : val
                        }
                      />
                      <Tooltip
                        formatter={(val: any, name: string) => {
                          if (name === "expenses")
                            return [formatIDRWithUnit(val), "Pengeluaran"];
                          if (name === "reports") return [val, "Laporan"];
                          return [val, name];
                        }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="reports"
                        stroke="#1A2B49"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorReports)"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side Analytics */}
              <div className="space-y-8">
                <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-24 -mt-24 blur-3xl" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                      <Target className="text-white" size={24} />
                    </div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
                      Total Efisiensi
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-black">94.2%</h2>
                      <span className="text-emerald-400 text-xs font-bold">
                        +2.4%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-4">
                      Berdasarkan waktu penyelesaian tugas dan ketepatan
                      kehadiran tim di 12 lokasi proyek.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
                  <h3 className="font-black text-slate-900 mb-6">
                    Status Proyek
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <RePieChart>
                        <Pie
                          data={projectStatusData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {projectStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    {projectStatusData.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                            {s.name}
                          </span>
                        </div>
                        <span className="font-black text-slate-900">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Avg Report Size",
                  value: "45.2 MB",
                  icon: FileBox,
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                },
                {
                  label: "Attendance Rate",
                  value: "98.5%",
                  icon: UserCheck,
                  color: "text-emerald-500",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Project Growth",
                  value: "+12%",
                  icon: BarChart3,
                  color: "text-amber-500",
                  bg: "bg-amber-50",
                },
                {
                  label: "Budget Usage",
                  value: "62%",
                  icon: DollarSign,
                  color: "text-rose-500",
                  bg: "bg-rose-50",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5"
                >
                  <div
                    className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center shadow-sm`}
                  >
                    <card.icon size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      {card.label}
                    </p>
                    <h4 className="text-xl font-black text-slate-900">
                      {card.value}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* GPS Tracking Overview (Visual) */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 overflow-hidden relative">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    Peta Lokasi Lapangan
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Visualisasi Sebaran Proyek & Tim
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("admin-tracking")}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-primary transition-all flex items-center gap-3"
                >
                  <MapPin size={14} /> Lihat Detail GPS
                </button>
              </div>

              <div className="h-[400px] bg-slate-200 rounded-[32px] relative overflow-hidden group">
                {/* Simulated Map Visual */}
                <div className="absolute inset-0 bg-[#e5e7eb] opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]" />

                {projects
                  .filter((p) => p.lat && p.lng)
                  .map((proj, i) => (
                    <motion.div
                      key={proj.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="absolute"
                      style={{
                        left: `${((proj.lng || 0) + 180) % 100}%`,
                        top: `${((proj.lat || 0) + 90) % 100}%`,
                      }}
                    >
                      <div className="relative group/pin">
                        <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-all border-4 border-white">
                          <Briefcase size={20} />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/pin:opacity-100 transition-opacity z-10 w-40">
                          <div className="bg-white p-3 rounded-2xl shadow-2xl border border-slate-100">
                            <p className="text-xs font-black text-slate-900 truncate">
                              {proj.name}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                              {proj.location}
                            </p>
                            <div className="mt-2 text-[8px] font-black text-primary uppercase bg-primary/5 p-1 rounded inline-block">
                              {proj.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                {/* Simulated Personnel Tracking */}
                {employees.slice(0, 5).map((emp, i) => (
                  <motion.div
                    key={emp.id}
                    className="absolute"
                    style={{
                      left: `${(30 + i * 15) % 100}%`,
                      top: `${(20 + i * 10) % 100}%`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-white shadow-lg cursor-pointer hover:border-primary transition-all">
                      <img
                        src={emp.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                ))}

                <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/40 shadow-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      {projects.length} Proyek Aktif
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      {employees.length} Personel Lapangan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === "FIELD_REPORTS" ? (
          <AdminFieldReportsTab
            reports={reports}
            projects={projects}
            employees={employees}
            user={user}
          />
        ) : activeTab === "REPORT_ARCHIVES" ? (
          <AdminReportArchivesTab
            reports={reports}
            dailyReports={dailyReports}
            projects={projects}
            employees={employees}
            user={user}
            documents={documents}
            companyProfile={companyProfile}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 flex-1 w-full relative">
                <Search size={18} className="absolute left-6 text-slate-300" />
                <input
                  type="text"
                  placeholder="Cari projek atau nama personil..."
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 ring-primary/5 outline-none transition-all"
                />
              </div>
              <div className="w-full md:w-64">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 ring-primary/5 transition-all cursor-pointer appearance-none"
                >
                  <option value="ALL">Semua Projek</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tanggal
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Project & Site
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Team Leader
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Status
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dailyReports
                      .filter(
                        (r) =>
                          projectFilter === "ALL" ||
                          r.projectId === projectFilter,
                      )
                      .map((report, idx) => (
                        <tr
                          key={report.id || idx}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-8 py-6">
                            <p className="text-sm font-black text-slate-900">
                              {new Date(report.timestamp).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              PKL{" "}
                              {new Date(report.timestamp).toLocaleTimeString(
                                "id-ID",
                                { hour: "2-digit", minute: "2-digit" },
                              )}{" "}
                              WIB
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <h4 className="text-sm font-black text-slate-900">
                              {report.projectName}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                              <MapPin size={10} className="text-primary" />{" "}
                              {report.location}
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-white shadow-sm">
                                {report.submittedByName?.charAt(0)}
                              </div>
                              <p className="text-xs font-bold text-slate-700">
                                {report.submittedByName}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                              TERKIRIM
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() => generateDailyReportPDF(report)}
                              className="h-10 px-5 bg-white border border-slate-200 text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm flex items-center gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all ml-auto"
                            >
                              <Download size={14} /> Unduh PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    {dailyReports.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                            <FileSearch size={48} />
                            <p className="text-xs font-black uppercase tracking-widest">
                              Belum ada arsip laporan harian
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatIndonesianUnits = (amount: number) => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1_000_000_000_000) {
    return `${(amount / 1_000_000_000_000).toFixed(1).replace(".", ",")} Triliun`;
  }
  if (absAmount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(".", ",")} Miliar`;
  }
  if (absAmount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(".", ",")} Juta`;
  }
  if (absAmount >= 1_000) {
    return `${(amount / 1_000).toFixed(1).replace(".", ",")} Ribu`;
  }
  return amount.toString();
};

const formatIDRWithUnit = (amount: number) => {
  return `Rp ${formatIndonesianUnits(amount)}`;
};

const formatCurrencyIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(val)
    .replace("Rp", "Rp ");
};

const TERMIN_SCHEDULES: Record<string, {
  projectName: string;
  contractNo: string;
  startDate: string;
  owner: string;
  contractValue: number;
  terms: {
    name: string;
    description: string;
    amount: number;
    expectedAmount?: number;
    percentage: number;
    invoiceDate: string;
    dueDate: string;
    paymentDate: string;
    status: "LUNAS" | "BELUM LUNAS" | "BELUM BAYAR";
    notes: string;
  }[];
}> = {
  "PTG-001": {
    projectName: "FILTER SOFTENER PT TTI",
    contractNo: "002/SPK-TTI/V/2026",
    startDate: "2026-06-01",
    owner: "PT. TTI",
    contractValue: 23500000,
    terms: [
      {
        name: "Termin 1 (DP)",
        description: "Down Payment 50%",
        amount: 11750000,
        percentage: 50.0,
        invoiceDate: "2026-06-01",
        dueDate: "2026-06-03",
        paymentDate: "2026-06-03",
        status: "LUNAS",
        notes: "DP Sesuai Kesepakatan"
      },
      {
        name: "Termin 2 (Pelunasan)",
        description: "Pelunasan 50% setelah instalasi selesai",
        amount: 11750000,
        percentage: 50.0,
        invoiceDate: "2026-06-08",
        dueDate: "2026-06-10",
        paymentDate: "2026-06-10",
        status: "LUNAS",
        notes: "Pelunasan Pekerjaan"
      }
    ]
  },
  "PTG-002": {
    projectName: "INSTALASI EQUIPMENT STP KAP. 184 M3",
    contractNo: "001/SPK-TEI/IV/2026",
    startDate: "2026-04-16",
    owner: "PT. TOOLMATE ENVIRO INDONESIA",
    contractValue: 566100000,
    terms: [
      {
        name: "Termin 1 (DP)",
        description: "DP Setelah SPK Ditanda tangani",
        amount: 113220000,
        expectedAmount: 113220000,
        percentage: 20.0,
        invoiceDate: "2026-04-08",
        dueDate: "2026-04-10",
        paymentDate: "2026-04-15",
        status: "LUNAS",
        notes: "Sesuai kontrak"
      },
      {
        name: "Termin 2",
        description: "Material On site",
        amount: 84915000,
        expectedAmount: 84915000,
        percentage: 15.0,
        invoiceDate: "2026-05-06",
        dueDate: "2026-05-08",
        paymentDate: "2026-05-13",
        status: "LUNAS",
        notes: "Sesuai kontrak"
      },
      {
        name: "Termin 3 - Parsial 1",
        description: "Pekerjaan Selesai 50% (Bayar Tahap 1)",
        amount: 113220000,
        expectedAmount: 113220000,
        percentage: 20.0,
        invoiceDate: "2026-06-18",
        dueDate: "2026-06-20",
        paymentDate: "2026-06-23",
        status: "LUNAS",
        notes: "Sesuai kontrak"
      },
      {
        name: "Termin 3 - Parsial 2",
        description: "Pekerjaan Selesai 75% (Bayar Tahap 2)",
        amount: 0,
        expectedAmount: 113220000,
        percentage: 20.0,
        invoiceDate: "-",
        dueDate: "-",
        paymentDate: "-",
        status: "BELUM BAYAR",
        notes: "-"
      },
      {
        name: "Termin 3 - Parsial 3",
        description: "Pekerjaan Selesai 100% (Bayar Tahap 3)",
        amount: 0,
        expectedAmount: 113220000,
        percentage: 20.0,
        invoiceDate: "-",
        dueDate: "-",
        paymentDate: "-",
        status: "BELUM BAYAR",
        notes: "-"
      },
      {
        name: "Termin 4",
        description: "Retensi 5%",
        amount: 0,
        expectedAmount: 28305000,
        percentage: 5.0,
        invoiceDate: "-",
        dueDate: "-",
        paymentDate: "-",
        status: "BELUM BAYAR",
        notes: "-"
      }
    ]
  },
  "PTG-003": {
    projectName: "INSTALASI STP GEDUNG UEU TB SIMATUPANG",
    contractNo: "001/SPK/DWT/III/2026",
    startDate: "2026-02-26",
    owner: "PT. DW Technic",
    contractValue: 432900000,
    terms: [
      {
        name: "Termin 1 (DP)",
        description: "DP Setelah SPK Terbit",
        amount: 108225000,
        expectedAmount: 108225000,
        percentage: 25.0,
        invoiceDate: "2026-03-05",
        dueDate: "2026-03-07",
        paymentDate: "2026-03-07",
        status: "LUNAS",
        notes: "Sesuai kontrak"
      },
      {
        name: "Termin 2 - Parsial 1",
        description: "Material On site(Bayar Tahap 1)",
        amount: 100000000,
        expectedAmount: 100000000,
        percentage: 23.1,
        invoiceDate: "2026-04-06",
        dueDate: "2026-04-08",
        paymentDate: "2026-04-22",
        status: "LUNAS",
        notes: "Cicilan Tahap 1"
      },
      {
        name: "Termin 2 - Parsial 2",
        description: "Material On site (Bayar Tahap 2)",
        amount: 51515000,
        expectedAmount: 51515000,
        percentage: 11.9,
        invoiceDate: "2026-04-06",
        dueDate: "2026-04-08",
        paymentDate: "2026-04-29",
        status: "LUNAS",
        notes: "Sisa pelunasan termin 2"
      },
      {
        name: "Termin 3 - Parsial 1",
        description: "Pekerjaan Selesai 100% (Bayar Tahap 1)",
        amount: 50000000,
        expectedAmount: 50000000,
        percentage: 11.6,
        invoiceDate: "2026-05-02",
        dueDate: "2026-05-04",
        paymentDate: "2026-06-12",
        status: "LUNAS",
        notes: "Cicilan Tahap 1"
      },
      {
        name: "Termin 3 - Parsial 2",
        description: "Pekerjaan Selesai 100% (Bayar Tahap 2)",
        amount: 25000000,
        expectedAmount: 25000000,
        percentage: 5.8,
        invoiceDate: "2026-07-08",
        dueDate: "2026-07-08",
        paymentDate: "2026-07-08",
        status: "LUNAS",
        notes: "Cicilan Tahap 2"
      },
      {
        name: "Termin 3 - Parsial 3",
        description: "Pekerjaan Selesai 100% (Bayar Tahap 3)",
        amount: 25000000,
        expectedAmount: 25000000,
        percentage: 5.8,
        invoiceDate: "2026-07-21",
        dueDate: "2026-07-21",
        paymentDate: "2026-07-21",
        status: "LUNAS",
        notes: "Cicilan Tahap 3"
      },
      {
        name: "Termin 3 - Parsial 4 / Sisa Pelunasan",
        description: "Sisa Pelunasan Pekerjaan Selesai 100%",
        amount: 0,
        expectedAmount: 51515000,
        percentage: 11.9,
        invoiceDate: "-",
        dueDate: "-",
        paymentDate: "-",
        status: "BELUM BAYAR",
        notes: "-"
      },
      {
        name: "Termin 4",
        description: "Retensi 5%",
        amount: 0,
        expectedAmount: 21645000,
        percentage: 5.0,
        invoiceDate: "-",
        dueDate: "-",
        paymentDate: "-",
        status: "BELUM BAYAR",
        notes: "-"
      }
    ]
  },
  "PTG-004": {
    projectName: "IPAL MEDIS KAPS 3 M3 UEU BEKASI",
    contractNo: "0517/ESAU.KHI(CADAVER.LT.1)/DWT/IV/2026",
    startDate: "2026-04-22",
    owner: "PT. DW Technic",
    contractValue: 61050000,
    terms: [
      {
        name: "Termin 1 (DP)",
        description: "Down Payment 50%",
        amount: 30525000,
        percentage: 50.0,
        invoiceDate: "2026-04-22",
        dueDate: "2026-04-24",
        paymentDate: "2026-04-23",
        status: "LUNAS",
        notes: "Sesuai kontrak"
      },
      {
        name: "Termin 2",
        description: "Material On site 35%",
        amount: 0,
        percentage: 0.0,
        invoiceDate: "-",
        dueDate: "-",
        paymentDate: "-",
        status: "LUNAS",
        notes: "Langsung Ke Termin 3"
      },
      {
        name: "Termin 3",
        description: "Pekerjaan Selesai 100%",
        amount: 30525000,
        percentage: 50.0,
        invoiceDate: "2026-05-02",
        dueDate: "2026-05-04",
        paymentDate: "2026-05-22",
        status: "LUNAS",
        notes: "Pelunasan Termin 2 dan 3"
      }
    ]
  },
  "PTG-005": {
    projectName: "PUSKESMAS SINDANG JAYA - PEMELIHARAAN IPAL",
    contractNo: "008/SPK-PSJ/VI/2026",
    startDate: "2026-06-20",
    owner: "Puskesmas Sindang Jaya",
    contractValue: 11753500,
    terms: [
      {
        name: "Pelunasan 100%",
        description: "Biaya Pemeliharaan IPAL",
        amount: 11753500,
        percentage: 100.0,
        invoiceDate: "2026-06-20",
        dueDate: "2026-06-26",
        paymentDate: "2026-06-26",
        status: "LUNAS",
        notes: "Pekerjaan Selesai dan Lunas"
      }
    ]
  }
};

const processTermPayment = (
  updatedTerms: any[],
  termName: string,
  payAmount: number,
  finId: string,
  invoiceDate: string,
  dueDate: string,
  paymentDate: string,
  notes: string,
  percentage: number = 0
) => {
  const existingUnpaidIdx = updatedTerms.findIndex(
    (t: any) => t.name.toUpperCase() === termName.toUpperCase() && !t.financialRecordId
  );

  const newTermItem = {
    name: termName,
    description: notes || "",
    amount: payAmount,
    expectedAmount: payAmount,
    percentage: percentage > 0 ? parseFloat(percentage.toFixed(2)) : 0,
    invoiceDate: invoiceDate || "-",
    dueDate: dueDate || "-",
    paymentDate: paymentDate || "-",
    status: "LUNAS" as const,
    notes: notes || "",
    financialRecordId: finId,
  };

  if (existingUnpaidIdx >= 0) {
    const existingUnpaid = updatedTerms[existingUnpaidIdx];
    const currentExpected = existingUnpaid.expectedAmount !== undefined ? existingUnpaid.expectedAmount : (existingUnpaid.amount || 0);

    if (payAmount >= currentExpected) {
      updatedTerms[existingUnpaidIdx] = {
        ...existingUnpaid,
        ...newTermItem,
        expectedAmount: currentExpected,
        status: "LUNAS",
      };
    } else {
      const partialPaidItem = {
        ...existingUnpaid,
        ...newTermItem,
        expectedAmount: payAmount,
        status: "LUNAS",
      };
      
      existingUnpaid.expectedAmount = currentExpected - payAmount;
      if (existingUnpaid.amount !== undefined) {
        existingUnpaid.amount = 0;
      }
      existingUnpaid.status = "BELUM BAYAR";

      updatedTerms.splice(existingUnpaidIdx, 0, partialPaidItem);
    }
  } else {
    updatedTerms.push(newTermItem);
  }

  return updatedTerms;
};

const revertTermPayment = (updatedTerms: any[], finId: string, staticSched: any) => {
  const termToRemoveIdx = updatedTerms.findIndex((t: any) => t.financialRecordId === finId);
  if (termToRemoveIdx === -1) return updatedTerms;

  const termToRemove = updatedTerms[termToRemoveIdx];
  const matchingUnpaidIdx = updatedTerms.findIndex(
    (t: any) => t.name.toUpperCase() === termToRemove.name.toUpperCase() && !t.financialRecordId
  );

  if (matchingUnpaidIdx >= 0) {
    const matchingUnpaid = updatedTerms[matchingUnpaidIdx];
    const removedExpected = termToRemove.expectedAmount !== undefined ? termToRemove.expectedAmount : (termToRemove.amount || 0);
    matchingUnpaid.expectedAmount = (matchingUnpaid.expectedAmount || 0) + removedExpected;
    updatedTerms.splice(termToRemoveIdx, 1);
  } else {
    const originalTerm = staticSched ? staticSched.terms.find((t: any) => t.name.toUpperCase() === termToRemove.name.toUpperCase()) : null;
    if (originalTerm) {
      updatedTerms[termToRemoveIdx] = {
        ...originalTerm,
        amount: 0,
        expectedAmount: originalTerm.expectedAmount || originalTerm.amount || 0,
        invoiceDate: "-",
        dueDate: "-",
        paymentDate: "-",
        status: "BELUM BAYAR",
        notes: "-",
        financialRecordId: undefined,
      };
    } else {
      updatedTerms.splice(termToRemoveIdx, 1);
    }
  }

  return updatedTerms;
};

const isInternalPersonnel = (name: string): boolean => {
  const n = (name || "").toUpperCase().trim();
  if (!n) return false;
  return (
    n.includes("FAISAL") ||
    n.includes("WELI") ||
    n.includes("YASIN") ||
    n.includes("ADMIN") ||
    n.includes("SISTEM") ||
    n.includes("STAFF") ||
    n.includes("OPERATOR")
  );
};

const resolvePiutangClient = (r: DebtRecord, projectsList: Project[] = []): string => {
  const customId = (r.customId || "").toUpperCase();
  const staticSched = TERMIN_SCHEDULES[customId];
  
  const linkedProj = (projectsList || []).find((p) =>
    (r.projectId && p.id === r.projectId) ||
    (r.customId && (p.id === r.customId || (p as any).customId === r.customId)) ||
    (p.name && r.title && (
      p.name.toLowerCase().includes(r.title.toLowerCase()) ||
      r.title.toLowerCase().includes(p.name.toLowerCase())
    ))
  );

  if (linkedProj?.client && linkedProj.client.trim() && !isInternalPersonnel(linkedProj.client)) {
    return linkedProj.client.trim();
  }
  if (staticSched?.owner && staticSched.owner.trim() && !isInternalPersonnel(staticSched.owner)) {
    return staticSched.owner.trim();
  }
  if (linkedProj?.name && linkedProj.name.trim()) {
    return linkedProj.name.trim();
  }
  if (staticSched?.projectName && staticSched.projectName.trim()) {
    return staticSched.projectName.trim();
  }
  if (r.contactName && r.contactName.trim() && !isInternalPersonnel(r.contactName)) {
    return r.contactName.trim();
  }
  if (r.title && r.title.trim()) {
    return r.title.trim();
  }
  return "Proyek Umum";
};

const getEffectiveDebtRecords = (
  debtRecords: DebtRecord[] = [],
  projects: Project[] = [],
  financialRecords: FinancialRecord[] = []
): DebtRecord[] => {
  const filtered = [...(debtRecords || [])].filter((r) => {
    const rTitle = (r.title || "").toLowerCase();
    const rDesc = (r.description || "").toLowerCase();
    const rCat = ((r as any).category || "").toLowerCase();
    const rCustom = (r.customId || "").toUpperCase();
    
    // Exclude falsely created debt records for operational meal/dining expenses
    if (
      rCustom === "HTG-260814-001" ||
      (r.amount === 215000 &&
        (rTitle.includes("makan") ||
          rTitle.includes("minum") ||
          rTitle.includes("jamu") ||
          rTitle.includes("belanja")))
    ) {
      return false;
    }

    // Exclude Kasbon records from general Hutang/Piutang (Kasbon is strictly managed in dedicated Kasbon Pegawai menu)
    if (
      rTitle.includes("kasbon") ||
      rDesc.includes("kasbon") ||
      rCat.includes("kasbon") ||
      rTitle.includes("fauzyawan") ||
      (isInternalPersonnel(r.contactName) && !r.projectId && (rTitle.includes("pinjaman") || rDesc.includes("pinjaman")))
    ) {
      return false;
    }

    return true;
  });

  const list: DebtRecord[] = [];
  const seenPiutangKeys = new Set<string>();

  filtered.forEach((r) => {
    if (r.type === "PIUTANG") {
      const resolvedClient = resolvePiutangClient(r, projects);
      const customIdUpper = (r.customId || "").toUpperCase();
      
      // If pure personal advance without project info, do not put it into Piutang (Kasbon is in separate menu)
      const isPurePersonalAdvance = isInternalPersonnel(r.contactName) && !r.projectId && !TERMIN_SCHEDULES[customIdUpper];
      if (isPurePersonalAdvance) {
        return;
      }

      // Determine unique deduplication key for Piutang projects
      const piutangKey = customIdUpper.startsWith("PTG-")
        ? customIdUpper
        : (r.projectId ? `PROJ-${r.projectId}` : `TITLE-${(r.title || resolvedClient).toLowerCase().trim()}`);

      // If duplicate Piutang record exists, consolidate and keep the canonical one
      if (seenPiutangKeys.has(piutangKey)) {
        const existingIdx = list.findIndex((x) => {
          if (x.type !== "PIUTANG") return false;
          const xCustom = (x.customId || "").toUpperCase();
          const xKey = xCustom.startsWith("PTG-")
            ? xCustom
            : (x.projectId ? `PROJ-${x.projectId}` : `TITLE-${(x.title || x.contactName).toLowerCase().trim()}`);
          return xKey === piutangKey;
        });

        if (existingIdx >= 0) {
          const existing = list[existingIdx];
          const rHasPayments = (r.payments || []).length > 0;
          const existingHasPayments = (existing.payments || []).length > 0;
          if (rHasPayments && !existingHasPayments) {
            list[existingIdx] = {
              ...r,
              contactName: resolvedClient,
            };
          }
        }
        return;
      }

      seenPiutangKeys.add(piutangKey);
      list.push({
        ...r,
        contactName: resolvedClient,
      });
    } else {
      list.push(r);
    }
  });

  (projects || []).forEach((p) => {
    const pNameLower = (p.name || "").toLowerCase().trim();
    if (!pNameLower) return;

    const exists = list.some((r) => {
      if (r.type !== "PIUTANG") return false;
      if (r.projectId && r.projectId === p.id) return true;
      if (r.customId && r.customId === p.id) return true;
      const rTitleLower = (r.title || "").toLowerCase().trim();
      if (rTitleLower && pNameLower && (rTitleLower.includes(pNameLower) || pNameLower.includes(rTitleLower))) return true;
      return false;
    });

    if (!exists) {
      const isPpnEnabled = p.hasPpn !== false;
      const dpp = p.contractValue || 0;
      const totalWithPpn = isPpnEnabled ? Math.round(dpp * 1.11) : dpp;

      list.push({
        id: `PTG-PROJ-${p.id}`,
        customId: (p as any).customId || `PTG-${p.id.slice(-6)}`,
        projectId: p.id,
        type: "PIUTANG",
        title: p.name,
        contactName: p.client || `Client ${p.name}`,
        amount: totalWithPpn,
        dueDate: p.endDate
          ? (isNaN(Number(p.endDate))
              ? p.endDate
              : new Date(Number(p.endDate)).toISOString().split('T')[0])
          : new Date().toISOString().split('T')[0],
        status: "UNPAID",
        description: `Rekam Piutang & Termin Proyek ${p.name}`,
        recordedBy: "Sistem",
        timestamp: (p as any).createdAt || Date.now(),
        terms: p.paymentTerms
          ? p.paymentTerms.map((t: any, idx: number) => ({
              name: t.name || `Termin ${idx + 1}`,
              description: t.description || t.name || `Termin ${idx + 1}`,
              amount: 0,
              expectedAmount: t.amount || 0,
              percentage: t.percentage || 0,
              invoiceDate: t.invoiceDate || "-",
              dueDate: t.dueDate || "-",
              paymentDate: "-",
              status: "BELUM BAYAR",
              notes: "-",
            }))
          : [],
        payments: [],
      });
    }
  });

  // Synthesize and auto-integrate personal spending (Talangan Pribadi / Duit Pribadi) into Hutang PT
  (financialRecords || []).forEach((f) => {
    if (f.type !== "OUT") return;

    const isExplicitPersonalSumber = f.sumberDana === "REKENING PRIBADI" || f.sumberDana === "DANA PRIBADI" || f.sumberDana === "PRIBADI";
    const isPersonalSpendFlow = f.flowType === "OUT_PERSONAL_SPEND";
    const isPrsCustomId = (f.customId || "").toUpperCase().startsWith("PRS-");
    const descUpper = (f.description || "").toUpperCase();
    const isDescPersonal = descUpper.includes("DUIT PRIBADI") || descUpper.includes("DANA PRIBADI") || descUpper.includes("UANG PRIBADI") || descUpper.includes("TALANGAN PRIBADI") || descUpper.includes("TALANGAN");

    // Must not be an internal custody transfer from PT to staff
    if (f.flowType === "OUT_PERSONAL_TRANSFER") return;

    // Must not be Kasbon or Salary (these have their own dedicated ledger)
    const catLower = (f.category || "").toLowerCase();
    if (catLower.includes("kasbon") || catLower.includes("gaji") || (f as any).isKasbon) return;
    if (descUpper.includes("KASBON") && !isDescPersonal) return;

    // If it has bank allocations linking to PT bank topups and is NOT personal funds, it was paid from PT Petty Cash
    const hasPtBankAlloc = f.refIdBank && f.refIdBank.trim() !== "" && !isExplicitPersonalSumber;
    if (hasPtBankAlloc && !isDescPersonal) return;

    // Determine if this is personal out-of-pocket spending
    const isPersonalOutOfPocket = isExplicitPersonalSumber || isDescPersonal || ((isPersonalSpendFlow || isPrsCustomId) && (!f.refIdBank || f.refIdBank.trim() === ""));
    if (!isPersonalOutOfPocket) return;

    // Determine Creditor (Pemilik Uang / Talangan Pribadi)
    const creditorName = 
      (f as any).pemilikUangPribadi ||
      f.personalHolder ||
      (descUpper.includes("FAISAL") ? "Faisal Mustopa (Admin)" :
       descUpper.includes("WELI") ? "Weli Mahesa" :
       descUpper.includes("YASIN") ? "Muhammad Yasin" :
       descUpper.includes("JIDAN") ? "Jidan Ramadhan" :
       (f.recordedBy || "Faisal Mustopa (Admin)"));

    const fCustomUpper = (f.customId || "").toUpperCase();
    const fIdLower = (f.id || "").toLowerCase();

    // Check if already registered in debtRecords or list
    const alreadyExists = list.some((r) => {
      if (r.type !== "HUTANG") return false;
      const rCustomUpper = (r.customId || "").toUpperCase();
      const rIdLower = (r.id || "").toLowerCase();
      const originFinId = ((r as any).originFinancialRecordId || "").toLowerCase();
      const originCustom = ((r as any).originCustomId || "").toUpperCase();

      if (rIdLower === `htg-prs-${fCustomUpper.toLowerCase()}` || rIdLower === `htg-prs-${fIdLower}`) return true;
      if (rCustomUpper === `HTG-${fCustomUpper}` || rCustomUpper === fCustomUpper) return true;
      if (originFinId && (originFinId === fIdLower || originFinId === fCustomUpper.toLowerCase())) return true;
      if (originCustom && (originCustom === fCustomUpper || originCustom === fIdLower)) return true;
      if (f.refHutang && (rCustomUpper === f.refHutang.toUpperCase() || (r.title && r.title.toUpperCase() === f.refHutang.toUpperCase()))) return true;
      if (f.linkedDebtId && (r.id === f.linkedDebtId || r.customId === f.linkedDebtId)) return true;
      return false;
    });

    if (!alreadyExists) {
      list.push({
        id: `HTG-PRS-${f.customId || f.id}`,
        customId: (f.customId && f.customId.startsWith("PRS-")) ? `HTG-${f.customId}` : `HTG-PRS-${f.customId || f.id}`,
        projectId: f.referenceId || (f as any).projectId || "",
        type: "HUTANG",
        title: `[TALANGAN PRIBADI] ${f.description || f.category || "Pengeluaran Pribadi"}`,
        contactName: creditorName,
        amount: f.amount || 0,
        dueDate: f.date || new Date().toISOString().split('T')[0],
        status: "UNPAID",
        description: `Dana talangan pribadi oleh ${creditorName} untuk operasional/proyek PT (Ref Transaksi: ${f.customId || f.id})`,
        recordedBy: f.recordedBy || creditorName || "Sistem",
        timestamp: f.timestamp || Date.now(),
        payments: [],
        originFinancialRecordId: f.id,
        originCustomId: f.customId,
      } as any);
    }
  });

  return list;
};

const getScheduleForRecord = (
  record: DebtRecord,
  projectsList: Project[] = [],
  financialRecordsList: FinancialRecord[] = []
) => {
  if (!record) {
    return {
      projectName: "-",
      contractNo: "-",
      startDate: "-",
      owner: "-",
      contractValue: 0,
      dppValue: 0,
      ppnValue: 0,
      isPpnEnabled: false,
      terms: [],
      totalPaid: 0,
      allPayments: [],
    };
  }

  const customId = record.customId || "";
  let rawTerms: any[] = [];

  const linkedProj = (projectsList || []).find(p => 
    (record.projectId && p.id === record.projectId) ||
    (record.customId && (p.id === record.customId || (p as any).customId === record.customId)) ||
    (p.name && record.title && (
      p.name.toLowerCase().includes(record.title.toLowerCase()) || 
      record.title.toLowerCase().includes(p.name.toLowerCase())
    ))
  );

  let projName = linkedProj?.name || record.title;
  let contractNo = record.customId || linkedProj?.id || "-";
  let startDate = linkedProj?.startDate 
    ? (isNaN(Number(linkedProj.startDate)) ? linkedProj.startDate : new Date(Number(linkedProj.startDate)).toISOString().split('T')[0])
    : "-";
  let owner = linkedProj?.client || record.contactName;

  const isHutang = record.type === "HUTANG";
  const isPpnEnabled = isHutang ? false : (linkedProj ? (linkedProj.hasPpn !== false) : false);
  const dppVal = isHutang 
    ? (record.amount || 0) 
    : (linkedProj ? (linkedProj.contractValue || 0) : (isPpnEnabled ? Math.round((record.amount || 0) / 1.11) : (record.amount || 0)));
  const grossFromProj = isHutang
    ? (record.amount || 0)
    : (linkedProj ? (isPpnEnabled ? Math.round((linkedProj.contractValue || 0) * 1.11) : (linkedProj.contractValue || 0)) : (record.amount || 0));

  let contractVal = isHutang ? (record.amount || 0) : (grossFromProj || record.amount || 0);
  const ppnVal = isPpnEnabled ? (contractVal - dppVal) : 0;

  const recIdLower = (record.id || "").toLowerCase();
  const recCustomId = (record.customId || "").toLowerCase();
  const recCleanId = recCustomId.replace(/^htg-/, "");
  const recOriginCustomId = (((record as any).originCustomId as string) || "").toLowerCase();
  const recOriginFinId = (((record as any).originFinancialRecordId as string) || "").toLowerCase();
  const recRefHutang = (((record as any).refHutang as string) || "").toLowerCase();

  const isPiutang = record.type === "PIUTANG" || !record.type;
  const targetFlow = isPiutang ? "IN" : "OUT";

  // Filter record.payments so expenses never bleed into Piutang payments
  const initialPayments: DebtPayment[] = (record.payments || []).filter((p) => {
    if (!isPiutang) return true;
    if (p.financialRecordId) {
      const linkedFin = (financialRecordsList || []).find(
        (f) => f.id === p.financialRecordId || f.customId === p.financialRecordId
      );
      if (linkedFin && linkedFin.type === "OUT") {
        return false; // Exclude project expense from payments received
      }
    }
    const noteLower = (p.note || "").toLowerCase();
    if (
      noteLower.includes("belanja") ||
      noteLower.includes("operasional") ||
      noteLower.includes("pembelian") ||
      noteLower.includes("material") ||
      noteLower.includes("panel") ||
      noteLower.includes("pompa") ||
      noteLower.includes("fitting") ||
      noteLower.includes("grease") ||
      noteLower.includes("biaya") ||
      noteLower.includes("pengeluaran") ||
      noteLower.includes("vendor") ||
      noteLower.includes("subkon") ||
      noteLower.includes("makan") ||
      noteLower.includes("jamu") ||
      noteLower.includes("gaji") ||
      noteLower.includes("upah")
    ) {
      return false;
    }
    return true;
  });

  const allPayments: DebtPayment[] = [...initialPayments];

  // Track project expenses (belanja/operasional PT untuk proyek ini)
  let totalProjectExpenses = 0;

  (financialRecordsList || []).forEach((f) => {
    const fRefId = (f.referenceId || "").toLowerCase();
    const fLinkedDebt = (f.linkedDebtId || "").toLowerCase();
    const fRefPiutang = (f.refPiutang || "").toLowerCase();
    const fRefHutang = (f.refHutang || "").toLowerCase();
    const fCustomId = (f.customId || "").toLowerCase();
    const fIdLower = (f.id || "").toLowerCase();
    const fProjId = (f.projectId || "").toLowerCase();

    // Project expense tracking for Piutang / Proyek
    if (isPiutang && f.type === "OUT") {
      let isProjExpense = false;
      if (record.projectId && (fProjId === (record.projectId || "").toLowerCase() || fRefId === (record.projectId || "").toLowerCase())) {
        isProjExpense = true;
      } else if (fLinkedDebt && (fLinkedDebt === recIdLower || (recCustomId && fLinkedDebt === recCustomId))) {
        isProjExpense = true;
      } else if (fRefPiutang && (fRefPiutang === recIdLower || (recCustomId && fRefPiutang === recCustomId))) {
        isProjExpense = true;
      } else if (linkedProj && (f.projectId === linkedProj.id || (linkedProj.name && f.description && f.description.toLowerCase().includes(linkedProj.name.toLowerCase())))) {
        isProjExpense = true;
      } else if (projName && f.description && f.description.toLowerCase().includes(projName.toLowerCase())) {
        isProjExpense = true;
      }

      if (isProjExpense) {
        totalProjectExpenses += (f.amount || 0);
      }
    }

    if (f.type !== targetFlow) return;

    // Never match the originating transaction itself as repayment
    if (
      fIdLower === recIdLower || 
      (recCustomId && (fCustomId === recCustomId || fIdLower === `htg-fin-${recCustomId}` || fIdLower === `htg-prs-${recCustomId}` || fIdLower === `htg-${recCustomId}`)) ||
      (recOriginCustomId && (fCustomId === recOriginCustomId || fIdLower === recOriginCustomId)) ||
      (recOriginFinId && (fIdLower === recOriginFinId || fCustomId === recOriginFinId))
    ) {
      return;
    }

    let matches = false;

    if (isPiutang) {
      // For PIUTANG: IN flow referencing this project, debt ID, or termin via structured fields
      if (f.linkedDebtId && (fLinkedDebt === recIdLower || (recCustomId && fLinkedDebt === recCustomId))) {
        matches = true;
      } else if (f.refPiutang && (
        fRefPiutang === recIdLower || 
        (recCustomId && fRefPiutang === recCustomId)
      )) {
        matches = true;
      } else if (f.referenceId && (
        fRefId === recIdLower || 
        (recCustomId && fRefId === recCustomId) ||
        (record.projectId && fRefId === (record.projectId || "").toLowerCase())
      )) {
        matches = true;
      } else if (record.projectId && f.projectId && f.projectId.toLowerCase() === (record.projectId || "").toLowerCase()) {
        matches = true;
      }
    } else {
      // For HUTANG: MUST be from PT funds (reimbursement/pelunasan), NOT personal spending
      const isPersonalSpending = f.sumberDana === "REKENING PRIBADI" || f.sumberDana === "DANA PRIBADI" || f.sumberDana === "PRIBADI" || f.flowType === "OUT_PERSONAL_SPEND" || (f.customId && f.customId.startsWith("PRS-"));
      
      // An expense f cannot be its own debt repayment if it's the expense that created/carries the debt reference
      const isOriginSpending = (recCustomId && fRefHutang === recCustomId) || (recIdLower && fRefHutang === recIdLower) || (recOriginCustomId && fCustomId === recOriginCustomId);

      if (!isPersonalSpending && !isOriginSpending) {
        // Direct link via structured fields (linkedDebtId, refHutang, or referenceId)
        if (f.linkedDebtId && (
          fLinkedDebt === recIdLower || 
          (recCustomId && fLinkedDebt === recCustomId) ||
          (recCleanId && fLinkedDebt === recCleanId) ||
          (recOriginCustomId && fLinkedDebt === recOriginCustomId) ||
          (recOriginFinId && fLinkedDebt === recOriginFinId)
        )) {
          matches = true;
        } else if (f.refHutang && (
          fRefHutang === recIdLower ||
          (recCustomId && fRefHutang === recCustomId) ||
          (recOriginCustomId && fRefHutang === recOriginCustomId) ||
          (recOriginFinId && fRefHutang === recOriginFinId)
        )) {
          matches = true;
        } else if (f.referenceId && (
          fRefId === recIdLower ||
          (recCustomId && fRefId === recCustomId) ||
          (recOriginCustomId && fRefId === recOriginCustomId) ||
          (recOriginFinId && fRefId === recOriginFinId)
        )) {
          matches = true;
        }
      }
    }

    if (matches) {
      // Check if this financial record is already linked to an existing payment slot
      const existingSlot = allPayments.find(
        (p) =>
          (p.financialRecordId && (p.financialRecordId === f.id || p.financialRecordId === f.customId)) ||
          p.id === f.id ||
          p.id === f.customId
      );

      if (existingSlot) {
        // Link this financial record to the existing payment slot instead of duplicating
        if (!existingSlot.financialRecordId) {
          existingSlot.financialRecordId = f.id || f.customId;
        }
        if (f.date) {
          existingSlot.date = f.date;
        }
      } else {
        allPayments.push({
          id: f.id || f.customId || Math.random().toString(36).substr(2, 9),
          amount: f.amount,
          date: f.date,
          note: f.description || (isPiutang ? "Penerimaan Piutang / Termin Proyek" : "Pembayaran Hutang"),
          financialRecordId: f.id || f.customId,
          recordedBy: f.recordedBy || "Sistem",
        });
      }
    }
  });

  const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

  // 2. Build Base Terms Schedule
  if (linkedProj?.paymentTerms && linkedProj.paymentTerms.length > 0) {
    rawTerms = linkedProj.paymentTerms.map((pt: any, idx: number) => {
      const targetAmt = pt.percentage 
        ? Math.round(((pt.percentage || 0) / 100) * contractVal)
        : (pt.amount || 0);
      return {
        name: pt.name || `Termin ${idx + 1}`,
        description: pt.description || pt.name || `Termin ${idx + 1}`,
        percentage: pt.percentage || 0,
        expectedAmount: targetAmt,
        invoiceDate: pt.invoiceDate || "-",
        dueDate: pt.dueDate || "-",
        paymentDate: "-",
        status: "BELUM BAYAR",
        notes: "-",
      };
    });

    // Ensure sum of expectedAmounts equals contractVal for percentage terms
    const sumExpected = rawTerms.reduce((sum, t) => sum + (t.expectedAmount || 0), 0);
    const diff = contractVal - sumExpected;
    if (diff !== 0 && rawTerms.length > 0) {
      rawTerms[rawTerms.length - 1].expectedAmount += diff;
    }
  } else if (TERMIN_SCHEDULES[customId]) {
    const staticSched = TERMIN_SCHEDULES[customId];
    projName = linkedProj?.name || staticSched.projectName || record.title;
    contractNo = staticSched.contractNo || record.customId || "-";
    startDate = linkedProj?.startDate 
      ? (isNaN(Number(linkedProj.startDate)) ? linkedProj.startDate : new Date(Number(linkedProj.startDate)).toISOString().split('T')[0])
      : (staticSched.startDate || "-");
    owner = linkedProj?.client || staticSched.owner || record.contactName;

    rawTerms = staticSched.terms.map((stTerm: any, idx: number) => {
      const savedTerm = (record.terms && record.terms[idx]) || null;
      const targetAmt = (savedTerm && savedTerm.expectedAmount !== undefined)
        ? savedTerm.expectedAmount
        : (stTerm.expectedAmount !== undefined ? stTerm.expectedAmount : (stTerm.amount || Math.round(((stTerm.percentage || 0) / 100) * contractVal)));
      return {
        ...stTerm,
        expectedAmount: targetAmt,
        status: (savedTerm && savedTerm.status) ? savedTerm.status : "BELUM BAYAR",
        paymentDate: "-",
        notes: "-",
      };
    });
  } else if (record.terms && record.terms.length > 0) {
    rawTerms = record.terms.map((t: any) => ({
      ...t,
      expectedAmount: t.expectedAmount !== undefined ? t.expectedAmount : (t.amount || Math.round(((t.percentage || 0) / 100) * contractVal)),
    }));
  }

  if (rawTerms.length === 0) {
    rawTerms.push({
      name: "DOWN PAYMENT / TERMIN 1",
      description: "Pembayaran Termin Proyek",
      amount: 0,
      expectedAmount: contractVal,
      percentage: 100,
      invoiceDate: "-",
      dueDate: record.dueDate || "-",
      paymentDate: "-",
      status: "BELUM BAYAR",
      notes: "Kewajiban Tagihan",
    });
  }

  // 3. Sequentially allocate totalPaid across rawTerms
  let unallocated = totalPaid;
  const latestPayDate = allPayments.length > 0 ? allPayments[allPayments.length - 1].date : "-";

  const formattedTerms = rawTerms.map((term: any, idx: number) => {
    const targetAmt = term.expectedAmount !== undefined
      ? term.expectedAmount
      : (term.amount || Math.round(((term.percentage || 0) / 100) * contractVal));

    let paidForThisTerm = 0;
    if (unallocated > 0) {
      paidForThisTerm = Math.min(unallocated, targetAmt);
      unallocated -= paidForThisTerm;
    }

    let calculatedStatus = "BELUM BAYAR";
    if (targetAmt > 0 && paidForThisTerm >= targetAmt) {
      calculatedStatus = "LUNAS";
    } else if (paidForThisTerm > 0) {
      calculatedStatus = "DICICIL";
    } else {
      calculatedStatus = "BELUM BAYAR";
    }

    const termCustomId = `TERM-${String(idx + 1).padStart(3, "0")}`;

    let autoNotes = term.notes && term.notes !== "-" ? term.notes : "";
    if (paidForThisTerm > 0 && paidForThisTerm < targetAmt) {
      const remainingForTerm = targetAmt - paidForThisTerm;
      autoNotes = `Cicilan / Parsial: Masuk Rp ${paidForThisTerm.toLocaleString("id-ID")} (Sisa Rp ${remainingForTerm.toLocaleString("id-ID")})`;
    } else if (paidForThisTerm >= targetAmt && targetAmt > 0) {
      autoNotes = `Lunas: Realisasi Rp ${paidForThisTerm.toLocaleString("id-ID")}`;
    }

    return {
      ...term,
      customId: termCustomId,
      amount: paidForThisTerm,
      expectedAmount: targetAmt,
      paymentDate: paidForThisTerm > 0 ? (term.paymentDate && term.paymentDate !== "-" ? term.paymentDate : latestPayDate) : "-",
      status: calculatedStatus,
      notes: autoNotes || "-",
    };
  });

  return {
    projectName: projName,
    contractNo: contractNo,
    startDate: startDate,
    owner: owner,
    contractValue: contractVal,
    dppValue: dppVal,
    ppnValue: ppnVal,
    isPpnEnabled: isPpnEnabled,
    terms: formattedTerms,
    totalPaid: totalPaid,
    allPayments: allPayments,
    totalExpenses: totalProjectExpenses,
    netProfit: totalPaid - totalProjectExpenses,
    projectedProfit: contractVal - totalProjectExpenses,
  };
};

const AdminDebtScreen = ({
  debtRecords,
  financialRecords = [],
  projects,
  onNavigate,
  user,
  roles,
  logActivity,
  handleClearOnlyFinanceAndDebt,
  isImportingFinanceData,
  setDebtRecords,
  setFinancialRecords,
}: {
  debtRecords: DebtRecord[];
  financialRecords?: FinancialRecord[];
  projects: Project[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
  logActivity: (m: string, a: string, d: string) => Promise<void>;
  handleClearOnlyFinanceAndDebt?: () => Promise<void>;
  isImportingFinanceData?: boolean;
  setDebtRecords?: React.Dispatch<React.SetStateAction<DebtRecord[]>>;
  setFinancialRecords?: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
}) => {
  const [activeTab, setActiveTab] = useState<"HUTANG" | "PIUTANG">("HUTANG");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<DebtRecord | null>(
    null,
  );
  const [filterProject, setFilterProject] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    contactName: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    description: "",
    projectId: "",
    status: "UNPAID" as any,
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
    paymentMethod: "TRANSFER" as "CASH" | "TRANSFER",
    sumberDana: "REKENING PT",
  });

  const [showGroupPaymentModal, setShowGroupPaymentModal] = useState<{ contactName: string; totalRemaining: number; debtType: "HUTANG" | "PIUTANG" } | null>(null);
  const [groupPaymentForm, setGroupPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
    paymentMethod: "TRANSFER" as "CASH" | "TRANSFER",
    sumberDana: "REKENING PT",
  });

  const [showEditModal, setShowEditModal] = useState<DebtRecord | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    contactName: "",
    amount: "",
    dueDate: "",
    description: "",
    projectId: "",
    type: "HUTANG" as "HUTANG" | "PIUTANG",
  });

  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentEditForm, setPaymentEditForm] = useState({
    amount: "",
    date: "",
    note: "",
    status: "LUNAS",
  });

  const [selectedTerminRecord, setSelectedTerminRecord] = useState<DebtRecord | null>(null);

  const [selectedContactDetail, setSelectedContactDetail] = useState<{
    name: string;
    type: "HUTANG" | "PIUTANG";
  } | null>(null);
  const [contactDetailTab, setContactDetailTab] = useState<"DEBTS" | "FINANCIAL">("DEBTS");
  const [contactFinancialFilter, setContactFinancialFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  const [showPdfConfigModal, setShowPdfConfigModal] = useState(false);
  const [pdfConfigRecord, setPdfConfigRecord] = useState<DebtRecord | null>(null);
  const [pdfOptions, setPdfOptions] = useState({
    companyName: "PT GARDA INOVASI GLOBALTECH",
    includeAddress: true,
    addressText: "M-Gold Tower, Lantai 16, Jl. KH. Noer Ali, Bekasi, Jawa Barat | Email: info@gig.co.id",
    includeLogo: false,
    logoUrl: "",
    createdBy: "FAISAL MUSTOPA",
    createdByRole: "Staf Administrasi Keuangan",
    approvedBy: "MUHAMMAD YASIN",
    approvedByRole: "Direktur Utama",
    ownerBy: "",
    ownerByRole: "Owner / Klien",
  });

  const handleUpdateTermStatus = async (record: DebtRecord, termIndex: number, newStatus: string) => {
    let existingTerms = record.terms && record.terms.length > 0
      ? [...record.terms]
      : (TERMIN_SCHEDULES[record.customId || ""]
          ? JSON.parse(JSON.stringify(TERMIN_SCHEDULES[record.customId || ""].terms))
          : []);

    if (!existingTerms || existingTerms.length <= termIndex) return;

    existingTerms[termIndex] = {
      ...existingTerms[termIndex],
      status: newStatus as any,
    };

    const payload = {
      terms: existingTerms,
    };

    await dbService.setDocument("debtRecords", record.id, {
      ...record,
      terms: existingTerms,
    });

    const updatedRec = {
      ...record,
      terms: existingTerms,
    };

    setDebtRecords?.((prev) =>
      prev.map((d) => (d.id === record.id ? updatedRec : d))
    );

    if (selectedTerminRecord && selectedTerminRecord.id === record.id) {
      setSelectedTerminRecord(updatedRec);
    }

    await logActivity(
      "DEBT",
      "UPDATE",
      `Mengubah status termin "${existingTerms[termIndex].name}" menjadi ${newStatus} pada ${record.title} [${record.customId || record.id}]`
    );
  };

  const effectiveDebtRecords = useMemo(() => {
    return getEffectiveDebtRecords(debtRecords, projects, financialRecords);
  }, [debtRecords, projects, financialRecords]);

  const currentRecord = useMemo(() => {
    if (!showEditModal) return null;
    return effectiveDebtRecords.find((d) => d.id === showEditModal.id) || showEditModal;
  }, [showEditModal, effectiveDebtRecords]);

  const filteredRecords = useMemo(() => {
    const records = effectiveDebtRecords.filter(
      (r) =>
        r.type === activeTab &&
        (r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.contactName.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterProject === "ALL" || r.projectId === filterProject),
    );
    return [...records].sort((a, b) => {
      const idA = a.customId || "";
      const idB = b.customId || "";
      return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [effectiveDebtRecords, activeTab, searchQuery, filterProject]);

  const totalHutang = useMemo(() => {
    return effectiveDebtRecords
      .filter((r) => r.type === "HUTANG" && (filterProject === "ALL" || r.projectId === filterProject))
      .reduce((sum, r) => {
        const sched = getScheduleForRecord(r, projects, financialRecords);
        return sum + Math.max(0, (sched.contractValue || r.amount || 0) - sched.totalPaid);
      }, 0);
  }, [effectiveDebtRecords, filterProject, projects, financialRecords]);

  const totalPiutang = useMemo(() => {
    return effectiveDebtRecords
      .filter((r) => r.type === "PIUTANG" && (filterProject === "ALL" || r.projectId === filterProject))
      .reduce((sum, r) => {
        const sched = getScheduleForRecord(r, projects, financialRecords);
        return sum + Math.max(0, (sched.contractValue || r.amount || 0) - sched.totalPaid);
      }, 0);
  }, [effectiveDebtRecords, filterProject, projects, financialRecords]);

  const debtTotals = useMemo(() => {
    const filterByProj = (r: any) => filterProject === "ALL" || r.projectId === filterProject;
    
    // HUTANG
    const hRecords = effectiveDebtRecords.filter(r => r.type === "HUTANG" && filterByProj(r));
    const hutangAwal = hRecords.reduce((sum, r) => {
      const sched = getScheduleForRecord(r, projects, financialRecords);
      return sum + (sched.contractValue || r.amount || 0);
    }, 0);
    const hutangTerbayar = hRecords.reduce((sum, r) => {
      const sched = getScheduleForRecord(r, projects, financialRecords);
      return sum + sched.totalPaid;
    }, 0);
    const hutangSisa = hRecords.reduce((sum, r) => {
      const sched = getScheduleForRecord(r, projects, financialRecords);
      return sum + Math.max(0, (sched.contractValue || r.amount || 0) - sched.totalPaid);
    }, 0);

    // PIUTANG
    const pRecords = effectiveDebtRecords.filter(r => r.type === "PIUTANG" && filterByProj(r));
    const piutangAwal = pRecords.reduce((sum, r) => {
      const sched = getScheduleForRecord(r, projects, financialRecords);
      return sum + (sched.contractValue || r.amount || 0);
    }, 0);
    const piutangTerbayar = pRecords.reduce((sum, r) => {
      const sched = getScheduleForRecord(r, projects, financialRecords);
      return sum + sched.totalPaid;
    }, 0);
    const piutangSisa = pRecords.reduce((sum, r) => {
      const sched = getScheduleForRecord(r, projects, financialRecords);
      return sum + Math.max(0, (sched.contractValue || r.amount || 0) - sched.totalPaid);
    }, 0);

    return {
      hutangAwal,
      hutangTerbayar,
      hutangSisa,
      piutangAwal,
      piutangTerbayar,
      piutangSisa
    };
  }, [effectiveDebtRecords, filterProject, projects, financialRecords]);

  const contactGroupedTotals = useMemo(() => {
    const filterByProj = (r: any) => filterProject === "ALL" || r.projectId === filterProject;
    const relevantRecords = effectiveDebtRecords.filter((r) => r.type === activeTab && filterByProj(r));

    const groups: {
      [key: string]: {
        name: string;
        totalAmount: number;
        totalPaid: number;
        totalRemaining: number;
        count: number;
      };
    } = {};

    relevantRecords.forEach((r) => {
      const rawName = (r.contactName || "Tanpa Nama").trim();
      const displayName = rawName.toUpperCase().includes("YASIN") ? "MUHAMMAD YASIN" : rawName;
      const groupKey = displayName.toUpperCase();

      if (!groups[groupKey]) {
        groups[groupKey] = {
          name: displayName,
          totalAmount: 0,
          totalPaid: 0,
          totalRemaining: 0,
          count: 0,
        };
      }
      const sched = getScheduleForRecord(r, projects, financialRecords);
      const paid = sched.totalPaid;
      const initialAmt = sched.contractValue || r.amount || 0;
      const remaining = Math.max(0, initialAmt - paid);
      groups[groupKey].totalAmount += initialAmt;
      groups[groupKey].totalPaid += paid;
      groups[groupKey].totalRemaining += remaining;
      groups[groupKey].count += 1;
    });

    return Object.values(groups)
      .filter((g) => g.totalRemaining > 0 || g.totalAmount > 0)
      .sort((a, b) => b.totalRemaining - a.totalRemaining);
  }, [effectiveDebtRecords, activeTab, filterProject, projects, financialRecords]);

  // Records for currently clicked contact in the summary cards
  const contactDetailRecords = useMemo(() => {
    if (!selectedContactDetail) return [];
    const targetKey = selectedContactDetail.name.trim().toUpperCase();
    return effectiveDebtRecords.filter((r) => {
      if (r.type !== selectedContactDetail.type) return false;
      const rawName = (r.contactName || "Tanpa Nama").trim();
      const displayName = rawName.toUpperCase().includes("YASIN") ? "MUHAMMAD YASIN" : rawName;
      return displayName.toUpperCase() === targetKey;
    });
  }, [effectiveDebtRecords, selectedContactDetail]);

  // Financial transactions linked to the clicked contact (from pengeluaran/pemasukan)
  const contactFinancialRecords = useMemo(() => {
    if (!selectedContactDetail) return [];
    const targetKey = selectedContactDetail.name.trim().toUpperCase();
    const debtIds = new Set(contactDetailRecords.map((r) => (r.id || "").toLowerCase()));
    const customIds = new Set(contactDetailRecords.map((r) => (r.customId || "").toLowerCase()).filter(Boolean));
    const projectIds = new Set(contactDetailRecords.map((r) => (r.projectId || "").toLowerCase()).filter(Boolean));
    const projectTitles = contactDetailRecords.map((r) => (r.title || "").toLowerCase().trim()).filter(Boolean);

    return financialRecords.filter((f) => {
      const fLinkedDebt = (f.linkedDebtId || "").toLowerCase();
      const fRefHutang = (f.refHutang || "").toLowerCase();
      const fRefPiutang = (f.refPiutang || "").toLowerCase();
      const fRefId = (f.referenceId || "").toLowerCase();
      const fHolder = (f.personalHolder || "").trim().toUpperCase();
      const fPenerima = (f.rekPenerima || "").trim().toUpperCase();
      const fProjId = (f.projectId || "").toLowerCase();

      // 1. Direct structured debt reference
      if (fLinkedDebt && (debtIds.has(fLinkedDebt) || customIds.has(fLinkedDebt))) return true;
      if (fRefHutang && (debtIds.has(fRefHutang) || customIds.has(fRefHutang))) return true;
      if (fRefPiutang && (debtIds.has(fRefPiutang) || customIds.has(fRefPiutang))) return true;
      if (fRefId && (debtIds.has(fRefId) || customIds.has(fRefId))) return true;

      // 2. Structured Project reference for Piutang
      if (selectedContactDetail.type === "PIUTANG") {
        if (fProjId && projectIds.has(fProjId)) return true;
        if (fRefId && projectIds.has(fRefId)) return true;
        if (projectTitles.some((pTitle) => pTitle && f.description && f.description.toLowerCase().includes(pTitle))) return true;
      }

      // 3. Structured PIC / Holder matching
      if (fHolder && (fHolder === targetKey || (targetKey.includes("YASIN") && fHolder.includes("YASIN")))) return true;
      if (fPenerima && (fPenerima === targetKey || (targetKey.includes("YASIN") && fPenerima.includes("YASIN")))) return true;

      // 4. Matched in recorded payments slot of this contact's debts
      const isPaymentMatch = contactDetailRecords.some((r) =>
        (r.payments || []).some(
          (p) =>
            (p.financialRecordId && (p.financialRecordId === f.id || p.financialRecordId === f.customId)) ||
            p.id === f.id ||
            p.id === f.customId
        )
      );
      if (isPaymentMatch) return true;

      return false;
    }).sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [financialRecords, selectedContactDetail, contactDetailRecords]);

  // Aggregate summary for the selected contact
  const contactDetailSummary = useMemo(() => {
    if (!selectedContactDetail) return { totalAmount: 0, totalPaid: 0, totalRemaining: 0, totalPemasukan: 0, totalPengeluaran: 0, keuntungan: 0, keuntunganProyeksi: 0, count: 0 };
    let totalAmount = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    contactDetailRecords.forEach((r) => {
      const sched = getScheduleForRecord(r, projects, financialRecords);
      const paid = sched.totalPaid;
      const initialAmt = sched.contractValue || r.amount || 0;
      const remaining = Math.max(0, initialAmt - paid);
      totalAmount += initialAmt;
      totalPaid += paid;
      totalRemaining += remaining;
    });

    const totalPemasukan = contactFinancialRecords.filter((f) => f.type === "IN").reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalPengeluaran = contactFinancialRecords.filter((f) => f.type === "OUT").reduce((sum, f) => sum + (f.amount || 0), 0);
    const keuntungan = totalPemasukan - totalPengeluaran;
    const keuntunganProyeksi = totalAmount - totalPengeluaran;

    return {
      totalAmount,
      totalPaid, // strictly Pemasukan / Termin dari Klien
      totalRemaining,
      totalPemasukan,
      totalPengeluaran,
      keuntungan,
      keuntunganProyeksi,
      count: contactDetailRecords.length,
    };
  }, [selectedContactDetail, contactDetailRecords, contactFinancialRecords, projects, financialRecords]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const yy = String(now.getFullYear()).substring(2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;
    const prefix = activeTab === "HUTANG" ? "HTG" : "PTG";
    const sameDayCount = debtRecords.filter(r => r.type === activeTab && r.customId?.startsWith(`${prefix}-${dateStr}`)).length;
    const seq = String(sameDayCount + 1).padStart(3, "0");
    const customId = `${prefix}-${dateStr}-${seq}`;

    const newRecord: Omit<DebtRecord, "id"> = {
      type: activeTab,
      customId,
      ...formData,
      amount: Number(formData.amount),
      recordedBy: user.name,
      timestamp: Date.now(),
      payments: [],
    };
    await dbService.createDocument("debtRecords", newRecord);
    await logActivity(
      "DEBT",
      "CREATE",
      `Mencatat ${activeTab === "HUTANG" ? "Hutang" : "Piutang"} baru: [${customId}] ${newRecord.title} senilai Rp ${newRecord.amount.toLocaleString("id-ID")}`,
    );
    setShowAddModal(false);
    setFormData({
      title: "",
      contactName: "",
      amount: "",
      dueDate: new Date().toISOString().split("T")[0],
      description: "",
      projectId: "",
      status: "UNPAID",
    });
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal) return;

    const paymentAmount = Number(paymentForm.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Masukkan nominal pembayaran yang valid (lebih dari 0).");
      return;
    }
    const currPayments = showPaymentModal.payments || [];
    const totalPaidBefore = currPayments.reduce((a, b) => a + b.amount, 0);
    const remainingBefore = Math.max(0, showPaymentModal.amount - totalPaidBefore);
    if (paymentAmount > remainingBefore) {
      alert(`Nominal pembayaran melebihi sisa hutang! Maksimal pembayaran: ${formatCurrencyIDR(remainingBefore)}`);
      return;
    }
    const newTotalPaid = totalPaidBefore + paymentAmount;

    let newStatus: DebtRecord["status"] = "PARTIAL";
    if (newTotalPaid >= showPaymentModal.amount) {
      newStatus = "PAID";
    }

    // Generate compliant customId for financial record
    const parts = paymentForm.date.split("-");
    const dd = parts[2] || "01";
    const mm = parts[1] || "01";
    const yy = (parts[0] || "2026").substring(2);
    const dateFormatted = `${dd}${mm}${yy}`;

    let prefix = showPaymentModal.type === "HUTANG" ? "BNK" : "INC";
    if (showPaymentModal.type === "HUTANG" && paymentForm.paymentMethod === "CASH") {
      prefix = "PRS";
    }

    const todaysMatches = financialRecords.filter((r) => {
      const rId = r.customId || "";
      return rId.startsWith(`${prefix}-${dateFormatted}-`);
    });

    let nextNum = todaysMatches.length + 1;
    let nextNumStr = String(nextNum).padStart(3, "0");
    while (financialRecords.some((r) => r.customId === `${prefix}-${dateFormatted}-${nextNumStr}`)) {
      nextNum++;
      nextNumStr = String(nextNum).padStart(3, "0");
    }
    const chosenCustomId = `${prefix}-${dateFormatted}-${nextNumStr}`;

    // 1. Create Finance entry
    const finRecord: any = {
      type: showPaymentModal.type === "HUTANG" ? "OUT" : "IN",
      flowType: showPaymentModal.type === "HUTANG"
        ? (paymentForm.paymentMethod === "TRANSFER" ? "OUT_BANK_DIRECT" : "OUT_PERSONAL_SPEND")
        : "IN",
      amount: paymentAmount,
      date: paymentForm.date,
      paymentMethod: paymentForm.paymentMethod,
      category:
        showPaymentModal.type === "HUTANG"
          ? "Pembayaran Hutang"
          : "Penerimaan Piutang",
      description: `[ANGSURAN] Angsuran ke-${currPayments.length + 1} untuk: [${showPaymentModal.customId || 'DBT'}] ${showPaymentModal.title}`,
      referenceId: showPaymentModal.projectId || showPaymentModal.id,
      linkedDebtId: showPaymentModal.id,
      recordedBy: user.name,
      timestamp: Date.now(),
      customId: chosenCustomId,
      sumberDana: paymentForm.sumberDana,
      refHutang: showPaymentModal.type === "HUTANG" ? (showPaymentModal.customId || showPaymentModal.title) : "",
      refPiutang: showPaymentModal.type === "PIUTANG" ? (showPaymentModal.customId || showPaymentModal.title) : "",
    };

    const finId = await dbService.createDocument("financialRecords", finRecord);
    await logActivity(
      "DEBT",
      "UPDATE",
      `Mencatat pembayaran ${showPaymentModal.type === "HUTANG" ? "Hutang" : "Piutang"} senilai Rp ${paymentAmount.toLocaleString("id-ID")} dengan ID Keuangan [${chosenCustomId}] untuk ${showPaymentModal.title}`,
    );

    // 2. Update Debt record
    const newPaymentEntry: DebtPayment = {
      id: Math.random().toString(36).substr(2, 9),
      amount: paymentAmount,
      date: paymentForm.date,
      note: paymentForm.note || `Dibayar via ${paymentForm.sumberDana}`,
      financialRecordId: finId,
      recordedBy: user.name,
    };

    const updatedPaymentsList = [...currPayments, newPaymentEntry];

    await dbService.setDocument("debtRecords", showPaymentModal.id, {
      ...showPaymentModal,
      payments: updatedPaymentsList,
      status: newStatus,
    });

    setDebtRecords((prev) => {
      const exists = prev.some((d) => d.id === showPaymentModal.id);
      if (exists) {
        return prev.map((d) =>
          d.id === showPaymentModal.id
            ? { ...d, payments: updatedPaymentsList, status: newStatus }
            : d
        );
      }
      return [{ ...showPaymentModal, payments: updatedPaymentsList, status: newStatus }, ...prev];
    });

    setFinancialRecords((prev) => [
      { id: finId, ...finRecord } as FinancialRecord,
      ...prev,
    ]);

    if (selectedTerminRecord && selectedTerminRecord.id === showPaymentModal.id) {
      setSelectedTerminRecord({
        ...selectedTerminRecord,
        payments: updatedPaymentsList,
        status: newStatus,
      });
    }

    setShowPaymentModal(null);
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
      paymentMethod: "TRANSFER",
      sumberDana: "REKENING PT",
    });
  };

  const handleRecordGroupPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showGroupPaymentModal) return;

    const contactName = showGroupPaymentModal.contactName;
    const paymentAmount = Number(groupPaymentForm.amount);
    if (!paymentAmount || paymentAmount <= 0) {
      alert("Masukkan nominal pembayaran yang valid.");
      return;
    }

    const debtType = showGroupPaymentModal.debtType;
    const matchingDebts = debtRecords.filter((d) => {
      if (d.type !== debtType || d.status === "PAID") return false;
      const cName = (d.contactName || d.title || "").trim().toLowerCase();
      const targetName = contactName.trim().toLowerCase();
      return cName === targetName || cName.includes(targetName) || targetName.includes(cName);
    });

    if (matchingDebts.length === 0) {
      alert(`Tidak ditemukan catatan ${debtType} aktif untuk ${contactName}`);
      return;
    }

    // Sort by remaining sisa ASCENDING (nominal terkecil dahulu dipotong)
    const debtsWithRemaining = matchingDebts
      .map((d) => {
        const paid = (d.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = Math.max(0, (d.amount || 0) - paid);
        return { debt: d, remaining };
      })
      .filter((item) => item.remaining > 0);

    debtsWithRemaining.sort((a, b) => {
      if (a.remaining !== b.remaining) {
        return a.remaining - b.remaining;
      }
      return (a.debt.customId || "").localeCompare(b.debt.customId || "");
    });

    const parts = groupPaymentForm.date.split("-");
    const dd = parts[2] || "01";
    const mm = parts[1] || "01";
    const yy = (parts[0] || "2026").substring(2);
    const dateFormatted = `${dd}${mm}${yy}`;

    let prefix = debtType === "HUTANG" ? "BNK" : "INC";
    if (debtType === "HUTANG" && groupPaymentForm.paymentMethod === "CASH") {
      prefix = "PRS";
    }

    let nextNum = financialRecords.filter((r) => (r.customId || "").startsWith(`${prefix}-${dateFormatted}-`)).length + 1;
    let nextNumStr = String(nextNum).padStart(3, "0");
    while (financialRecords.some((r) => r.customId === `${prefix}-${dateFormatted}-${nextNumStr}`)) {
      nextNum++;
      nextNumStr = String(nextNum).padStart(3, "0");
    }
    const chosenCustomId = `${prefix}-${dateFormatted}-${nextNumStr}`;

    const finRecord: any = {
      type: debtType === "HUTANG" ? "OUT" : "IN",
      flowType: groupPaymentForm.paymentMethod === "CASH" ? "KAS BESAR" : "REKENING PT",
      customId: chosenCustomId,
      category: debtType === "HUTANG" ? "Pembayaran Hutang" : "Penerimaan Piutang",
      amount: paymentAmount,
      date: groupPaymentForm.date,
      description: groupPaymentForm.note || `Pembayaran Total ${debtType} Kontak: ${contactName}`,
      recordedBy: user.name,
      timestamp: Date.now(),
      refHutang: `GROUP_${debtType}_${contactName}`,
    };

    const finId = await dbService.createDocument("financialRecords", finRecord);

    let unallocatedAmount = paymentAmount;
    const brokenDownDetails: string[] = [];

    for (const item of debtsWithRemaining) {
      if (unallocatedAmount <= 0) break;

      const deduct = Math.min(unallocatedAmount, item.remaining);
      const newPayment: DebtPayment = {
        id: Math.random().toString(36).substr(2, 9),
        amount: deduct,
        date: groupPaymentForm.date,
        note: groupPaymentForm.note || `Pembayaran Total ${debtType} (${contactName})`,
        financialRecordId: finId,
        recordedBy: user.name,
      };

      const existingPayments = item.debt.payments || [];
      const updatedPayments = [...existingPayments, newPayment];
      const newTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      const newStatus = newTotalPaid >= item.debt.amount ? "PAID" : "PARTIAL";

      await dbService.updateDocument("debtRecords", item.debt.id, {
        payments: updatedPayments,
        status: newStatus,
      });

      unallocatedAmount -= deduct;
      brokenDownDetails.push(`ID ${item.debt.customId || item.debt.title}: Dipotong Rp ${deduct.toLocaleString("id-ID")}${newStatus === "PAID" ? " (LUNAS)" : ""}`);
    }

    await logActivity(
      "DEBT",
      "UPDATE",
      `Pembayaran Total ${debtType} untuk ${contactName} senilai Rp ${paymentAmount.toLocaleString("id-ID")}. Memotong ${brokenDownDetails.length} ID: ${brokenDownDetails.join(", ")}`
    );

    setShowGroupPaymentModal(null);
    setGroupPaymentForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
      paymentMethod: "TRANSFER",
      sumberDana: "REKENING PT",
    });

    alert(`Sukses memotong Total ${debtType} ${contactName}! (${brokenDownDetails.length} ID terpotong)`);
  };

  const handleSaveMainDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord) return;
    const mainAmount = Number(editForm.amount);
    if (isNaN(mainAmount) || mainAmount <= 0) {
      alert("Nilai buku awal harus berupa angka positif.");
      return;
    }

    // Recalculate status based on current payments and new amount
    const totalPaid = (currentRecord.payments || []).reduce((acc, curr) => acc + curr.amount, 0);
    const newStatus =
      totalPaid >= mainAmount
        ? "PAID"
        : totalPaid > 0
          ? "PARTIAL"
          : "UNPAID";

    const customIdUpdate = editForm.type !== currentRecord.type && currentRecord.customId
      ? {
          customId: editForm.type === "PIUTANG"
            ? currentRecord.customId.replace(/^HTG-/, "PTG-")
            : currentRecord.customId.replace(/^PTG-/, "HTG-")
        }
      : {};

    await dbService.setDocument("debtRecords", currentRecord.id, {
      ...currentRecord,
      title: editForm.title,
      contactName: editForm.contactName,
      amount: mainAmount,
      dueDate: editForm.dueDate,
      description: editForm.description,
      projectId: editForm.projectId,
      status: newStatus,
      type: editForm.type,
      ...customIdUpdate
    });

    await logActivity(
      "DEBT",
      "UPDATE",
      `Mengubah detail utama ${currentRecord.type === "HUTANG" ? "Hutang" : "Piutang"} [${currentRecord.customId}]: ${editForm.title} senilai Rp ${mainAmount.toLocaleString("id-ID")}${editForm.type !== currentRecord.type ? ` (Diubah tipe ke ${editForm.type})` : ""}`,
    );

    setShowEditModal(null);
  };

  const handleSavePaymentEdit = async (payId: string) => {
    if (!currentRecord) return;
    const amountNum = Number(paymentEditForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Jumlah pembayaran harus berupa angka positif.");
      return;
    }

    const chosenStatus = paymentEditForm.status || "LUNAS";

    const updatedPayments = (currentRecord.payments || []).map((p) => {
      if (p.id === payId) {
        return {
          ...p,
          amount: amountNum,
          date: paymentEditForm.date,
          note: paymentEditForm.note,
          status: chosenStatus,
        };
      }
      return p;
    });

    const totalPaid = updatedPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const newStatus =
      totalPaid >= currentRecord.amount
        ? "PAID"
        : totalPaid > 0
          ? "PARTIAL"
          : "UNPAID";

    const targetPay = (currentRecord.payments || []).find((p) => p.id === payId);
    if (targetPay && targetPay.financialRecordId) {
      try {
        await dbService.updateDocument("financialRecords", targetPay.financialRecordId, {
          amount: amountNum,
          date: paymentEditForm.date,
          description: `[ANGSURAN] ${paymentEditForm.note || `Angsuran untuk: ${currentRecord.title}`}`,
        });
      } catch (e) {
        console.error("Failed to update financial record:", e);
      }
    }

    let updatedTerms = (currentRecord.terms && currentRecord.terms.length > 0)
      ? JSON.parse(JSON.stringify(currentRecord.terms))
      : (TERMIN_SCHEDULES[currentRecord.customId || ""]
          ? JSON.parse(JSON.stringify(TERMIN_SCHEDULES[currentRecord.customId || ""].terms))
          : undefined);

    if (updatedTerms && updatedTerms.length > 0) {
      const payIdx = (currentRecord.payments || []).findIndex((p) => p.id === payId);
      updatedTerms = updatedTerms.map((t: any, idx: number) => {
        const isNameMatch =
          (paymentEditForm.note && t.name && paymentEditForm.note.toLowerCase().includes(t.name.toLowerCase())) ||
          (targetPay && targetPay.note && t.name && targetPay.note.toLowerCase().includes(t.name.toLowerCase())) ||
          (t.notes && paymentEditForm.note && paymentEditForm.note.toLowerCase().includes(t.notes.toLowerCase()));

        const isFinIdMatch = targetPay && targetPay.financialRecordId && t.financialRecordId === targetPay.financialRecordId;
        const isIdxMatch = payIdx !== -1 && idx === payIdx;

        if (isFinIdMatch || isNameMatch || isIdxMatch) {
          return {
            ...t,
            status: chosenStatus,
            amount: amountNum > 0 ? amountNum : t.amount,
            paymentDate: paymentEditForm.date || t.paymentDate,
          };
        }
        return t;
      });
    }

    const updatePayload: any = {
      payments: updatedPayments,
      status: newStatus,
    };
    if (updatedTerms) {
      updatePayload.terms = updatedTerms;
    }

    await dbService.setDocument("debtRecords", currentRecord.id, {
      ...currentRecord,
      ...updatePayload,
    });

    if (selectedTerminRecord && selectedTerminRecord.id === currentRecord.id) {
      setSelectedTerminRecord({
        ...currentRecord,
        ...updatePayload,
      });
    }

    await logActivity(
      "DEBT",
      "UPDATE",
      `Mengubah pembayaran/angsuran [Status: ${chosenStatus}] untuk ${currentRecord.type === "HUTANG" ? "Hutang" : "Piutang"} [${currentRecord.customId}] menjadi Rp ${amountNum.toLocaleString("id-ID")}`,
    );

    setEditingPaymentId(null);
  };

  const handleDeletePayment = async (payId: string) => {
    if (!currentRecord) return;
    if (!confirm("Apakah Anda yakin ingin menghapus pembayaran ini secara permanen? Catatan Keuangan terkait juga akan dihapus.")) {
      return;
    }

    const targetPay = (currentRecord.payments || []).find((p) => p.id === payId);
    const updatedPayments = (currentRecord.payments || []).filter((p) => p.id !== payId);

    const totalPaid = updatedPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const newStatus =
      totalPaid >= currentRecord.amount
        ? "PAID"
        : totalPaid > 0
          ? "PARTIAL"
          : "UNPAID";

    let updatedTerms = [...(currentRecord.terms || [])];
    if (targetPay && targetPay.financialRecordId) {
      const staticSched = TERMIN_SCHEDULES[currentRecord.customId || ""];
      const targetTermName = updatedTerms.find(ut => ut.financialRecordId === targetPay.financialRecordId)?.name || "";
      const originalTerm = staticSched ? staticSched.terms.find(t => t.name.toUpperCase() === targetTermName.toUpperCase()) : null;

      updatedTerms = updatedTerms.map((t: any) => {
        if (t.financialRecordId === targetPay.financialRecordId) {
          if (originalTerm) {
            return {
              ...originalTerm,
              amount: 0,
              invoiceDate: "-",
              dueDate: "-",
              paymentDate: "-",
              status: "BELUM BAYAR",
              notes: "-"
            };
          }
          return null;
        }
        return t;
      }).filter(Boolean);
    }

    if (targetPay && targetPay.financialRecordId) {
      try {
        await dbService.deleteDocument("financialRecords", targetPay.financialRecordId);
      } catch (e) {
        console.error("Failed to delete financial record:", e);
      }
    }

    await dbService.updateDocument("debtRecords", currentRecord.id, {
      payments: updatedPayments,
      status: newStatus,
      terms: updatedTerms,
    });

    await logActivity(
      "DEBT",
      "UPDATE",
      `Menghapus pembayaran/angsuran senilai Rp ${(targetPay?.amount || 0).toLocaleString("id-ID")} dari ${currentRecord.type === "HUTANG" ? "Hutang" : "Piutang"} [${currentRecord.customId}]`,
    );
  };

  const handleDeleteDebt = async (id: string, customId: string, type: string) => {
    if (user?.role === "owner" || user?.role === "direktur") {
      alert("Akses Ditolak: Peran Direktur dan Owner tidak diperbolehkan menghapus data.");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus catatan ${type === "HUTANG" ? "Hutang" : "Piutang"} [${customId || id}] ini secara permanen?`)) {
      return;
    }
    try {
      await dbService.deleteDocument("debtRecords", id);
      await logActivity(
        "DEBT",
        "DELETE",
        `Menghapus catatan ${type === "HUTANG" ? "Hutang" : "Piutang"} [${customId || id}] secara permanen`
      );
    } catch (err) {
      console.error("Failed to delete debt record:", err);
      alert("Gagal menghapus data: " + err);
    }
  };

  const downloadPDF = () => {
    setIsExporting(true);
    const doc = new jsPDF();

    // Improved Header matching Finance style
    doc.setFontSize(18);
    doc.setTextColor(26, 43, 73);
    doc.setFont("helvetica", "bold");
    doc.text(`LAPORAN ${activeTab} - PT GARDA INOVASI GLOBALTECH`, 105, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 105, 27, {
      align: "center",
    });

    // Summary Box like Finance
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 35, 182, 25, 5, 5, "F");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    const activeAwal = activeTab === "HUTANG" ? debtTotals.hutangAwal : debtTotals.piutangAwal;
    const activeTerbayar = activeTab === "HUTANG" ? debtTotals.hutangTerbayar : debtTotals.piutangTerbayar;
    const activeSisa = activeTab === "HUTANG" ? debtTotals.hutangSisa : debtTotals.piutangSisa;

    doc.text(
      `Total Awal (Rp): ${formatCurrencyIDR(activeAwal).replace("Rp ", "")}`,
      20,
      44,
    );
    doc.text(
      `Total Terbayar (Rp): ${formatCurrencyIDR(activeTerbayar).replace("Rp ", "")}`,
      20,
      52,
    );
    doc.text(
      `Sisa Saldo (Rp): ${formatCurrencyIDR(activeSisa).replace("Rp ", "")}`,
      110,
      44,
    );
    doc.text(`Status: Aktif`, 110, 52);

    const tableData = filteredRecords.map((r) => {
      const paid = (r.payments || []).reduce((a, b) => a + b.amount, 0);
      const remaining = r.amount - paid;
      return [
        new Date(r.timestamp).toLocaleDateString("id-ID"),
        r.title,
        r.contactName,
        formatCurrencyIDR(r.amount).replace("Rp ", ""),
        formatCurrencyIDR(paid).replace("Rp ", ""),
        formatCurrencyIDR(remaining).replace("Rp ", ""),
        r.status,
      ];
    });

    autoTable(doc, {
      startY: 70,
      head: [
        [
          "Tanggal",
          "Judul",
          "Kontak",
          "Total (Rp)",
          "Dibayar (Rp)",
          "Sisa (Rp)",
          "Status",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [26, 43, 73], textColor: 255 },
      styles: { fontSize: 7 },
    });

    doc.save(
      `Laporan_${activeTab}_GIG_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    setIsExporting(false);
  };

  const downloadContactSummaryPDF = (
    contactInfo: { name: string; type: "HUTANG" | "PIUTANG" },
    records: DebtRecord[],
    finRecords: FinancialRecord[],
    summary: { totalAmount: number; totalPaid: number; totalRemaining: number; count: number }
  ) => {
    if (!contactInfo) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const isHutang = contactInfo.type === "HUTANG";
      const titleLabel = isHutang
        ? "LAPORAN RINCIAN HUTANG & REKAPITULASI VENDOR"
        : "LAPORAN RINCIAN PIUTANG & REKAPITULASI DEBITUR";

      // Outer border matching standard app PDF documents
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(5, 5, 200, 287);

      // Top decorative bar
      doc.setFillColor(26, 43, 73); // deep blue slate
      doc.rect(10, 10, 190, 6, "F");

      let currentY = 24;

      // Header Title (STRICTLY NO KOP SURAT)
      doc.setFontSize(13);
      doc.setTextColor(26, 43, 73);
      doc.setFont("helvetica", "bold");
      doc.text(titleLabel, 12, currentY);

      currentY += 5.5;
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Kontak / Nama Pihak: ${contactInfo.name}`, 12, currentY);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleString("id-ID")}`, 138, currentY);

      currentY += 4.5;
      doc.text(`Kategori: ${isHutang ? "Kewajiban Hutang Usaha" : "Tagihan Piutang Usaha"} | Total: ${summary.count} Catatan Terdaftar`, 12, currentY);

      currentY += 5;
      doc.setDrawColor(226, 232, 240);
      doc.line(10, currentY, 200, currentY);

      currentY += 6;

      // KPI / Ringkasan Finansial Box
      const paidPct = summary.totalAmount > 0 ? ((summary.totalPaid / summary.totalAmount) * 100).toFixed(1) : "0";
      const totalPengeluaran = (summary as any).totalPengeluaran || 0;
      const labaKas = ((summary as any).totalPemasukan || summary.totalPaid) - totalPengeluaran;

      const summaryTableData = isHutang
        ? [
            [
              "TOTAL NILAI AWAL",
              formatCurrencyIDR(summary.totalAmount),
              "TOTAL TELAH DIBAYAR",
              formatCurrencyIDR(summary.totalPaid),
            ],
            [
              "SISA SALDO HUTANG",
              formatCurrencyIDR(summary.totalRemaining),
              "PERSENTASE REALISASI",
              `${paidPct}%`,
            ],
          ]
        : [
            [
              "TOTAL NILAI KONTRAK",
              formatCurrencyIDR(summary.totalAmount),
              "PEMASUKAN DARI KLIEN",
              formatCurrencyIDR(summary.totalPaid),
            ],
            [
              "SISA PIUTANG KLIEN",
              formatCurrencyIDR(summary.totalRemaining),
              "TOTAL BELANJA PROYEK",
              formatCurrencyIDR(totalPengeluaran),
            ],
            [
              "LABA KAS SAAT INI",
              formatCurrencyIDR(labaKas),
              "PERSENTASE TERBAYAR",
              `${paidPct}%`,
            ],
          ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: 12, right: 12 },
        body: summaryTableData,
        theme: "grid",
        bodyStyles: {
          fontSize: 8,
          textColor: [15, 23, 42],
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 42, fillColor: [248, 250, 252], textColor: [71, 85, 105] },
          1: { fontStyle: "bold", cellWidth: 50, halign: "right", textColor: [15, 23, 42] },
          2: { fontStyle: "bold", cellWidth: 44, fillColor: [248, 250, 252], textColor: [71, 85, 105] },
          3: { fontStyle: "bold", cellWidth: 50, halign: "right", textColor: isHutang ? [225, 29, 72] : [16, 185, 129] },
        },
      });

      currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : currentY + 30;

      // Section 1: Tabel Rincian Rekam Hutang / Piutang
      doc.setFontSize(9.5);
      doc.setTextColor(26, 43, 73);
      doc.setFont("helvetica", "bold");
      doc.text(`RINCIAN PERUNTUKAN ${isHutang ? "HUTANG" : "PIUTANG"} (${records.length} REKAM)`, 12, currentY);

      currentY += 3;

      const debtTableRows = records.map((rec, idx) => {
        const sched = getScheduleForRecord(rec, projects, financialRecords);
        const paid = sched.totalPaid;
        const initialAmt = sched.contractValue || rec.amount || 0;
        const rem = Math.max(0, initialAmt - paid);
        const proj = projects.find((p) => p.id === rec.projectId)?.name || "-";
        const statusLabel = rem <= 0 ? "LUNAS" : paid > 0 ? "DICICIL" : "BELUM BAYAR";
        const titleAndDesc = rec.description ? `${rec.title}\n(${rec.description})` : rec.title;

        return [
          idx + 1,
          rec.customId || rec.id || "-",
          titleAndDesc,
          proj,
          rec.dueDate || "-",
          formatCurrencyIDR(initialAmt).replace("Rp ", ""),
          formatCurrencyIDR(paid).replace("Rp ", ""),
          formatCurrencyIDR(rem).replace("Rp ", ""),
          statusLabel,
        ];
      });

      // Add Total Row
      debtTableRows.push([
        "",
        "",
        "TOTAL KESELURUHAN",
        "",
        "",
        formatCurrencyIDR(summary.totalAmount).replace("Rp ", ""),
        formatCurrencyIDR(summary.totalPaid).replace("Rp ", ""),
        formatCurrencyIDR(summary.totalRemaining).replace("Rp ", ""),
        "",
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: 12, right: 12 },
        head: [
          [
            "NO",
            "KODE REF",
            "TUJUAN / PERUNTUKAN DANA",
            "PROYEK",
            "JATUH TEMPO",
            "AWAL (RP)",
            "DIBAYAR (RP)",
            "SISA (RP)",
            "STATUS",
          ],
        ],
        body: debtTableRows,
        theme: "grid",
        headStyles: {
          fillColor: [26, 43, 73],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: "bold",
          halign: "left",
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [51, 65, 85],
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 20, fontStyle: "bold" },
          2: { cellWidth: 50 },
          3: { cellWidth: 26 },
          4: { cellWidth: 18, halign: "center" },
          5: { cellWidth: 20, halign: "right", fontStyle: "bold" },
          6: { cellWidth: 20, halign: "right", fontStyle: "bold", textColor: [16, 185, 129] },
          7: { cellWidth: 20, halign: "right", fontStyle: "bold", textColor: isHutang ? [225, 29, 72] : [16, 185, 129] },
          8: { cellWidth: 18, halign: "center", fontStyle: "bold" },
        },
        didParseCell: (data) => {
          if (data.row.index === debtTableRows.length - 1) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [241, 245, 249];
            if (data.column.index === 2) {
              data.cell.styles.halign = "right";
            }
          }
        },
      });

      currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : currentY + 40;

      // Section 2: Riwayat Mutasi Transaksi Kas/Bank Terkait (jika ada)
      if (currentY > 230) {
        doc.addPage();
        doc.setDrawColor(226, 232, 240);
        doc.rect(5, 5, 200, 287);
        currentY = 18;
      }

      doc.setFontSize(9.5);
      doc.setTextColor(26, 43, 73);
      doc.setFont("helvetica", "bold");
      doc.text(`RIWAYAT MUTASI TRANSAKSI KAS & BANK TERKAIT (${finRecords.length} TRANSAKSI)`, 12, currentY);

      currentY += 3;

      if (finRecords.length === 0) {
        autoTable(doc, {
          startY: currentY,
          margin: { left: 12, right: 12 },
          body: [
            [
              "Catatan: Belum ada transaksi kas/bank langsung yang tercatat untuk kontak ini (catatan merupakan invoice/saldo awal).",
            ],
          ],
          theme: "grid",
          bodyStyles: {
            fontSize: 7.5,
            textColor: [100, 116, 139],
            fontStyle: "italic",
          },
        });
      } else {
        const finRows = finRecords.map((fin, idx) => {
          const isIncome = fin.type === "IN";
          return [
            idx + 1,
            fin.date || "-",
            fin.customId || fin.id || "-",
            isIncome ? "PEMASUKAN" : "PENGELUARAN",
            fin.category || "-",
            fin.description || "-",
            fin.sumberDana || "-",
            formatCurrencyIDR(fin.amount || 0).replace("Rp ", ""),
          ];
        });

        const totalFinAmount = finRecords.reduce((sum, f) => sum + (f.amount || 0), 0);
        finRows.push([
          "",
          "",
          "",
          "",
          "",
          "TOTAL MUTASI",
          "",
          formatCurrencyIDR(totalFinAmount).replace("Rp ", ""),
        ]);

        autoTable(doc, {
          startY: currentY,
          margin: { left: 12, right: 12 },
          head: [
            [
              "NO",
              "TANGGAL",
              "NO. BUKTI",
              "TIPE",
              "KATEGORI",
              "KETERANGAN / DESKRIPSI",
              "SUMBER DANA",
              "NOMINAL (RP)",
            ],
          ],
          body: finRows,
          theme: "grid",
          headStyles: {
            fillColor: [26, 43, 73],
            textColor: [255, 255, 255],
            fontSize: 7.5,
            fontStyle: "bold",
            halign: "left",
          },
          bodyStyles: {
            fontSize: 7,
            textColor: [51, 65, 85],
          },
          columnStyles: {
            0: { cellWidth: 8, halign: "center" },
            1: { cellWidth: 18, halign: "center" },
            2: { cellWidth: 22, fontStyle: "bold" },
            3: { cellWidth: 22, halign: "center", fontStyle: "bold" },
            4: { cellWidth: 22 },
            5: { cellWidth: 52 },
            6: { cellWidth: 22 },
            7: { cellWidth: 20, halign: "right", fontStyle: "bold" },
          },
          didParseCell: (data) => {
            if (data.row.index === finRows.length - 1) {
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.fillColor = [241, 245, 249];
            }
          },
        });
      }

      // Strictly NO KOP & NO SIGNATURES/MENGETAHUI as requested!

      const sanitizedContact = contactInfo.name.replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(
        `Laporan_Rincian_${contactInfo.type}_${sanitizedContact}_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("Error generating contact summary PDF:", err);
      alert("Gagal membuat PDF. Silakan coba beberapa saat lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadSinglePiutangPDF = (record: DebtRecord, options?: typeof pdfOptions) => {
    if (!record) return;
    setIsExporting(true);
    const doc = new jsPDF("p", "mm", "a4");
    const sched = getScheduleForRecord(record, projects, financialRecords);
    const totalPaid = sched.totalPaid;
    const remaining = Math.max(0, sched.contractValue - totalPaid);

    const companyName = options?.companyName?.trim() || "PT GARDA INOVASI GLOBALTECH";
    const includeAddress = options?.includeAddress ?? true;
    const addressText = options?.addressText?.trim() || "M-Gold Tower, Lantai 16, Bekasi, Indonesia | info@gig.co.id";
    const includeLogo = options?.includeLogo || false;
    const logoUrl = options?.logoUrl?.trim() || "";

    const createdBy = options?.createdBy?.trim() || "FAISAL MUSTOPA";
    const createdByRole = options?.createdByRole?.trim() || "Staf Administrasi Keuangan";
    const approvedBy = options?.approvedBy?.trim() || "MUHAMMAD YASIN";
    const approvedByRole = options?.approvedByRole?.trim() || "Direktur Utama";

    // Outer Border
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(5, 5, 200, 287);

    // Decorative Header bar
    doc.setFillColor(26, 43, 73); // deep blue slate
    doc.rect(10, 10, 190, 8, "F");

    let currentY = 26;

    // Optional Logo on Top Left
    if (includeLogo && logoUrl) {
      try {
        doc.addImage(logoUrl, "PNG", 12, 18, 18, 18);
      } catch (e) {
        console.warn("Could not load logo image for PDF", e);
      }
    }

    const textX = (includeLogo && logoUrl) ? 34 : 15;

    // Company Title
    doc.setFontSize(16);
    doc.setTextColor(26, 43, 73);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, textX, currentY);

    if (includeAddress && addressText) {
      currentY += 5;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(addressText, textX, currentY);
    }

    currentY += 6;
    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.line(10, currentY, 200, currentY);

    currentY += 7;
    // Document title
    doc.setFontSize(13);
    doc.setTextColor(26, 43, 73);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN REALISASI TERMIN & PIUTANG PROYEK", 15, currentY);

    currentY += 5;
    doc.setFontSize(8.5);
    doc.setTextColor(120);
    doc.setFont("helvetica", "normal");
    doc.text(`Kode Rekam: ${record.customId || record.id}`, 15, currentY);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString("id-ID")}`, 145, currentY);

    currentY += 5;

    // Table 1: INFORMASI PROYEK & KONTRAK (Left Side)
    const table1Body = [
      ["Nama Proyek", sched.projectName || "-"],
      ["No. Kontrak", sched.contractNo || "-"],
      ["Client / Owner", sched.owner || record.contactName || "-"],
      ["Tanggal Mulai", sched.startDate || "-"],
    ];

    // PPN setup for PDF calculations (extracting PPN from Gross contract value)
    const linkedProj = projects.find((p) => p.id === record.projectId);
    const isPpnEnabled = linkedProj ? linkedProj.hasPpn !== false : true;
    const dppTotal = isPpnEnabled ? Math.round(record.amount / 1.11) : record.amount;
    const ppnTotal = isPpnEnabled ? record.amount - dppTotal : 0;
    const dppPaid = isPpnEnabled ? Math.round(totalPaid / 1.11) : totalPaid;
    const ppnPaid = isPpnEnabled ? totalPaid - dppPaid : 0;
    const dppRemaining = isPpnEnabled ? Math.round(remaining / 1.11) : remaining;
    const ppnRemaining = isPpnEnabled ? remaining - dppRemaining : 0;
    const pct = record.amount > 0 ? ((totalPaid / record.amount) * 100).toFixed(1) : "0";

    // Table 2: REALISASI & TAGIHAN KONTRAK (Right Side)
    const table2Body = [
      ["Nilai Kontrak Inc. PPN", formatCurrencyIDR(record.amount)],
      ["Nilai Sebelum PPN (DPP)", formatCurrencyIDR(dppTotal)],
      ["Total Diterima", formatCurrencyIDR(totalPaid)],
      ["Sisa Tagihan", formatCurrencyIDR(remaining)],
      ["Persentase Lunas", `${pct}%`],
      [`PPN ${isPpnEnabled ? "11%" : "0%"} (Total Kontrak)`, formatCurrencyIDR(ppnTotal)],
      ["PPN Realisasi", formatCurrencyIDR(ppnPaid)],
      ["Sisa PPN Belum Realisasi", formatCurrencyIDR(ppnRemaining)],
    ];

    // Render Table 1 (Left Side)
    autoTable(doc, {
      startY: currentY,
      margin: { left: 12 },
      tableWidth: 88,
      head: [["INFORMASI PROYEK & KONTRAK", ""]],
      body: table1Body,
      theme: "grid",
      headStyles: {
        fillColor: [26, 43, 73],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 30, fillColor: [248, 250, 252] },
        1: { fontStyle: "bold", textColor: [15, 23, 42] },
      },
    });

    // Render Table 2 (Right Side)
    autoTable(doc, {
      startY: currentY,
      margin: { left: 104 },
      tableWidth: 94,
      head: [["REALISASI & TAGIHAN KONTRAK", ""]],
      body: table2Body,
      theme: "grid",
      headStyles: {
        fillColor: [26, 43, 73],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 42, fillColor: [248, 250, 252] },
        1: { fontStyle: "bold", halign: "right", textColor: [15, 23, 42] },
      },
    });

    // Get bottom Y position of the two tables
    const table1FinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : currentY + 50;
    const nextTableY = Math.max(table1FinalY, currentY + 48) + 7;

    // Table title
    doc.setFontSize(9.5);
    doc.setTextColor(26, 43, 73);
    doc.setFont("helvetica", "bold");
    doc.text("TABEL DETAIL TAHAPAN TERMIN & REALISASI PEMBAYARAN", 12, nextTableY);

    // Build Table Data for Terms (NO ID column!)
    const tableBody = sched.terms.map((t: any) => {
      const termAmt = t.amount && t.amount > 0 ? t.amount : (t.expectedAmount || 0);
      return [
        t.name,
        t.description || "-",
        termAmt > 0 ? formatCurrencyIDR(termAmt).replace("Rp ", "") : "-",
        t.percentage > 0 ? `${t.percentage}%` : "-",
        t.invoiceDate || "-",
        t.paymentDate || "-",
        t.status,
        t.notes || "-",
      ];
    });

    autoTable(doc, {
      startY: nextTableY + 3,
      margin: { left: 12, right: 12 },
      head: [
        [
          "TERMIN/TAHAP",
          "DESKRIPSI",
          "JUMLAH (RP)",
          "PROP.",
          "TGL INVOICE",
          "TGL BAYAR",
          "STATUS",
          "KETERANGAN",
        ],
      ],
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: [26, 43, 73],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: "bold",
        halign: "center",
      },
      styles: {
        fontSize: 7,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [15, 23, 42] },
        2: { halign: "right", fontStyle: "bold", textColor: [16, 124, 65] },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 7) {
          const val = data.cell.raw;
          if (val === "LUNAS") {
            data.cell.styles.textColor = [16, 124, 65];
          } else if (val === "BELUM LUNAS" || val === "BELUM BAYAR") {
            data.cell.styles.textColor = [180, 83, 9];
          } else if (val === "DICICIL") {
            data.cell.styles.textColor = [79, 70, 229];
          }
        }
      },
    });

    // Signature Block at the bottom (2 Columns: Dibuat Oleh Admin & Disetujui Oleh Direktur)
    const lastY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 160;
    const signY = Math.max(lastY + 12, 222);

    doc.setFontSize(8.5);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");

    // 1. Dibuat Oleh (Admin)
    doc.text("Dibuat Oleh,", 30, signY);
    doc.text(createdByRole, 30, signY + 4);
    doc.line(30, signY + 22, 80, signY + 22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 43, 73);
    doc.text(createdBy, 30, signY + 26);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(createdByRole || "Admin", 30, signY + 30);

    // 2. Disetujui Oleh (Direktur)
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Disetujui Oleh,", 130, signY);
    doc.text(approvedByRole, 130, signY + 4);
    doc.line(130, signY + 22, 180, signY + 22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 43, 73);
    doc.text(approvedBy, 130, signY + 26);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(approvedByRole || "Direktur Utama", 130, signY + 30);

    // Save PDF
    const safeTitle = (sched.projectName || "piutang").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    doc.save(`Realisasi_Termin_${safeTitle}_${record.customId || record.id}.pdf`);
    setIsExporting(false);
  };

  return (
    <AdminLayout
      activeScreen="admin-debt"
      onNavigate={onNavigate}
      user={user}
      roles={roles}
    >
      <div className="space-y-8 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
              Hutang & Piutang
            </h1>
            <p className="text-slate-500 font-medium">
              Kelola kewajiban pembayaran dan tagihan tertunda bisnis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadPDF}
              disabled={isExporting}
              className="h-12 px-6 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all"
            >
              <Download size={16} />{" "}
              {isExporting ? "Exporting..." : "Unduh Laporan"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2"
            >
              <Plus size={16} /> Tambah Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                <ArrowUpRight size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                Total Hutang
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-rose-600">
                {formatCurrencyIDR(debtTotals.hutangSisa)}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-1">
                <AlertCircle size={12} /> Belum Terbayar (Sisa)
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <div>
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Awal</p>
                <p className="text-slate-700 font-extrabold mt-0.5">{formatCurrencyIDR(debtTotals.hutangAwal)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Telah Terbayar</p>
                <p className="text-emerald-600 font-extrabold mt-0.5">{formatCurrencyIDR(debtTotals.hutangTerbayar)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                <ArrowDownRight size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                Total Piutang
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-emerald-600">
                {formatCurrencyIDR(debtTotals.piutangSisa)}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-1">
                <Clock size={12} /> Menunggu Penagihan (Sisa)
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <div>
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Awal</p>
                <p className="text-slate-700 font-extrabold mt-0.5">{formatCurrencyIDR(debtTotals.piutangAwal)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Telah Terbayar</p>
                <p className="text-emerald-600 font-extrabold mt-0.5">{formatCurrencyIDR(debtTotals.piutangTerbayar)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("HUTANG")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "HUTANG" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            Hutang (Payable)
          </button>
          <button
            onClick={() => setActiveTab("PIUTANG")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "PIUTANG" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            Piutang (Receivable)
          </button>
        </div>

        {/* RANGKUMAN SALDO PER NAMA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
              {activeTab === "HUTANG" ? "Rangkuman Sisa Hutang Per Vendor / Kreditur" : "Rangkuman Sisa Piutang Per Proyek / Client"}
            </h3>
            <span className="text-[10px] font-bold text-slate-400">
              {contactGroupedTotals.length} {activeTab === "HUTANG" ? "Kontak Terdaftar" : "Proyek / Client Terdaftar"}
            </span>
          </div>

          {contactGroupedTotals.length === 0 ? (
            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 text-center">
              <p className="text-xs font-semibold text-slate-400">Tidak ada rekam data untuk filter ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {contactGroupedTotals.map((group) => {
                const paidPct = group.totalAmount > 0 ? (group.totalPaid / group.totalAmount) * 100 : 0;
                return (
                  <div
                    key={group.name}
                    onClick={() => {
                      setSelectedContactDetail({ name: group.name, type: activeTab });
                      setContactDetailTab("DEBTS");
                    }}
                    className="bg-white border border-slate-200/90 rounded-[2rem] p-5 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all relative overflow-hidden group/card cursor-pointer active:scale-[0.99]"
                    title={`Klik untuk melihat rincian ${activeTab === "HUTANG" ? "hutang" : "piutang"} & riwayat mutasi ${group.name}`}
                  >
                    {/* Decorative accent side bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${
                        activeTab === "HUTANG"
                          ? "bg-rose-500 group-hover/card:w-2.5"
                          : "bg-emerald-500 group-hover/card:w-2.5"
                      }`}
                    />

                    <div className="space-y-3">
                      {/* Name & Badge */}
                      <div className="flex items-start justify-between gap-2 pl-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {activeTab === "HUTANG" ? (
                            <Users2 size={13} className="text-slate-400 shrink-0 group-hover/card:text-indigo-600 transition-colors" />
                          ) : (
                            <Briefcase size={13} className="text-slate-400 shrink-0 group-hover/card:text-indigo-600 transition-colors" />
                          )}
                          <h4 className="text-xs font-black text-slate-800 tracking-tight truncate uppercase group-hover/card:text-indigo-600 transition-colors">
                            {group.name}
                          </h4>
                        </div>
                        <span className="text-[9px] font-black bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0 group-hover/card:bg-indigo-50 group-hover/card:text-indigo-600 group-hover/card:border-indigo-100 transition-colors">
                          {group.count} Rekam
                        </span>
                      </div>

                      {/* Remaining sisa */}
                      <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100/50 pl-4 group-hover/card:bg-slate-50 transition-colors">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
                          Sisa {activeTab === "HUTANG" ? "Hutang" : "Piutang"}
                        </p>
                        <p
                          className={`text-base font-black ${
                            activeTab === "HUTANG" ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {formatCurrencyIDR(group.totalRemaining)}
                        </p>
                      </div>

                      {/* Detail breakdown & Progress */}
                      <div className="space-y-2 pl-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Awal: {formatCurrencyIDR(group.totalAmount)}</span>
                          <span>Lunas: {paidPct.toFixed(0)}%</span>
                        </div>
                        
                        {/* Custom progress bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              activeTab === "HUTANG" ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, paidPct)}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                          <span>Telah Dibayar:</span>
                          <span className="text-emerald-600 font-extrabold">{formatCurrencyIDR(group.totalPaid)}</span>
                        </div>

                        {/* Interactive action prompt */}
                        <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[9.5px] font-bold text-slate-400 group-hover/card:text-indigo-600 transition-colors">
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> Klik untuk rincian & mutasi
                          </span>
                          <ChevronRight size={13} className="group-hover/card:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search
                size={18}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau nama kontak..."
                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-primary/10 border border-slate-100 text-sm font-bold transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full md:w-64 pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/10 transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">Semua Proyek (Global)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#112a46] text-white">
                <tr>
                  <th className="p-5 text-xs font-bold font-sans tracking-wide border-r border-[#1e3d64]/30">
                    {activeTab === "HUTANG" ? "ID Hutang" : "ID Piutang"}
                  </th>
                  <th className="p-5 text-xs font-bold font-sans tracking-wide border-r border-[#1e3d64]/30">
                    {activeTab === "HUTANG" ? "Nama Vendor / Kreditur" : "Nama Client / Debitur"}
                  </th>
                  <th className="p-5 text-xs font-bold font-sans tracking-wide border-r border-[#1e3d64]/30">
                    Deskripsi & Proyek
                  </th>
                  <th className="p-5 text-xs font-bold font-sans tracking-wide text-right border-r border-[#1e3d64]/30">
                    {activeTab === "HUTANG" ? "Total Hutang Awal (Rp)" : "Total Piutang Awal (Rp)"}
                  </th>
                  <th className="p-5 text-xs font-bold font-sans tracking-wide text-right border-r border-[#1e3d64]/30">
                    Jumlah Terbayar (Rp)
                  </th>
                  <th className="p-5 text-xs font-bold font-sans tracking-wide text-right border-r border-[#1e3d64]/30">
                    {activeTab === "HUTANG" ? "Sisa Saldo Hutang (Rp)" : "Sisa Saldo Piutang (Rp)"}
                  </th>
                  <th className="p-5 text-xs font-bold font-sans tracking-wide text-center border-r border-[#1e3d64]/30">
                    Status
                  </th>
                  <th className="p-5 text-xs font-bold font-sans tracking-wide text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => {
                  const sched = getScheduleForRecord(r, projects, financialRecords);
                  const totalPaid = sched.totalPaid;
                  const remaining = Math.max(0, sched.contractValue - totalPaid);

                  return (
                    <tr
                      key={r.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('a') || target.closest('select') || target.closest('input')) {
                          return;
                        }
                        if (activeTab === "PIUTANG") {
                          setSelectedTerminRecord(r);
                        }
                      }}
                      className={`transition-colors group border-b border-slate-100 ${
                        activeTab === "PIUTANG" ? "cursor-pointer hover:bg-indigo-50/30" : "hover:bg-slate-50/55"
                      }`}
                    >
                      {/* ID Hutang / Piutang */}
                      <td className="p-5 align-top">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-800 font-mono text-[11px] font-black rounded-lg border border-slate-200 uppercase tracking-wider block w-fit">
                          {r.customId || `${activeTab === "HUTANG" ? "HTG" : "PTG"}-${r.id.substring(0, 6).toUpperCase()}`}
                        </span>
                        {activeTab === "PIUTANG" && (
                          <span className="text-[9px] text-indigo-600 font-black mt-2 hover:underline flex items-center gap-1 cursor-pointer select-none">
                            <Calendar size={10} />
                            Lihat Rincian Termin
                          </span>
                        )}
                      </td>

                      {/* Nama Vendor/Kreditur atau Client/Debitur */}
                      <td className="p-5 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-extrabold text-xs shrink-0">
                            {r.contactName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm leading-tight">
                              {r.contactName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                              Pencatat: {r.recordedBy || "System"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Deskripsi & Proyek */}
                      <td className="p-5 align-top max-w-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-700 text-xs leading-snug">
                            {r.title}
                          </p>
                          {r.projectId && (
                            <p className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
                              Proyek: {projects.find((p) => p.id === r.projectId)?.name || "Umum"}
                            </p>
                          )}
                          {(() => {
                            const sched = getScheduleForRecord(r, projects, financialRecords);
                            const invDates = Array.from(new Set(sched.terms.map(t => t.invoiceDate).filter(d => d && d !== "-")));
                            const payDates = Array.from(new Set(sched.terms.map(t => t.paymentDate).filter(d => d && d !== "-")));
                            
                            return (
                              <div className="space-y-0.5 mt-1">
                                {invDates.length > 0 && (
                                  <p className="text-[10px] text-indigo-700 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Tgl Invoice: <span className="font-mono bg-indigo-50 px-1 py-0.2 rounded">{invDates.join(", ")}</span>
                                  </p>
                                )}
                                {payDates.length > 0 && (
                                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Tgl Terbayar: <span className="font-mono bg-emerald-50 px-1 py-0.2 rounded">{payDates.join(", ")}</span>
                                  </p>
                                )}
                                {invDates.length === 0 && payDates.length === 0 && r.dueDate && (
                                  <p className="text-[10px] text-indigo-700 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Tgl Jatuh Tempo: <span className="font-mono bg-indigo-50 px-1 py-0.2 rounded">{r.dueDate}</span>
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Total Hutang Awal */}
                      <td className="p-5 align-top text-right font-mono font-bold text-slate-900 text-sm">
                        {formatCurrencyIDR(sched.contractValue)}
                      </td>

                      {/* Jumlah Terbayar */}
                      <td className="p-5 align-top text-right font-mono font-bold text-emerald-600 text-sm">
                        {formatCurrencyIDR(totalPaid)}
                      </td>

                      {/* Sisa Saldo Hutang */}
                      <td className="p-5 align-top text-right font-mono font-black text-sm">
                        <span className={remaining > 0 ? "text-rose-600" : "text-emerald-600"}>
                          {formatCurrencyIDR(remaining)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-5 align-top text-center">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                            remaining === 0
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : totalPaid > 0
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {remaining === 0
                            ? "LUNAS"
                            : totalPaid > 0
                              ? "DICICIL"
                              : "BELUM BAYAR"}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="p-5 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {remaining > 0 && (
                            <button
                              onClick={() => {
                                setShowPaymentModal(r);
                                setPaymentForm((prev) => ({
                                  ...prev,
                                  amount: remaining.toString(),
                                }));
                              }}
                              className="p-2.5 bg-[#112a46] hover:bg-slate-800 text-white rounded-xl hover:scale-105 transition-all shadow-md shadow-slate-100 flex items-center justify-center"
                              title="Cicil / Bayar"
                            >
                              <DollarSign size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setShowEditModal(r);
                              setEditForm({
                                title: r.title,
                                contactName: r.contactName,
                                amount: r.amount.toString(),
                                dueDate: r.dueDate,
                                description: r.description || "",
                                projectId: r.projectId || "",
                                type: r.type,
                              });
                            }}
                            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl hover:scale-105 transition-all shadow-md shadow-indigo-100 flex items-center justify-center"
                            title="Edit Catatan & Cicilan"
                          >
                            <Edit size={14} />
                          </button>
                           {activeTab === "PIUTANG" && (
                            <button
                              onClick={() => setSelectedTerminRecord(r)}
                              className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl hover:scale-105 transition-all shadow-md shadow-sky-100 flex items-center justify-center"
                              title="Lihat Rincian Termin"
                            >
                              <Calendar size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate("admin-finance")}
                            className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:border-slate-800 hover:text-slate-800 transition-all flex items-center justify-center shadow-xs"
                            title="Ke Menu Keuangan"
                          >
                            <ArrowRightLeft size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteDebt(r.id, r.customId, r.type)}
                            className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl hover:scale-105 transition-all shadow-md shadow-rose-100 flex items-center justify-center"
                            title="Hapus Catatan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {filteredRecords.length > 0 && (
                <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                  <tr className="border-b border-slate-200">
                    <td colSpan={3} className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider text-center align-middle">
                      TOTAL REKAP ({activeTab})
                    </td>
                    <td className="p-5 text-right font-mono text-xs font-extrabold text-slate-900 align-middle">
                      {formatCurrencyIDR(
                        filteredRecords.reduce((sum, r) => {
                          const sched = getScheduleForRecord(r, projects, financialRecords);
                          return sum + (sched.contractValue || r.amount || 0);
                        }, 0)
                      )}
                    </td>
                    <td className="p-5 text-right font-mono text-xs font-extrabold text-emerald-600 align-middle">
                      {formatCurrencyIDR(
                        filteredRecords.reduce((sum, r) => {
                          const sched = getScheduleForRecord(r, projects, financialRecords);
                          return sum + sched.totalPaid;
                        }, 0)
                      )}
                    </td>
                    <td className="p-5 text-right font-mono text-xs font-black align-middle">
                      <span className="text-rose-600">
                        {formatCurrencyIDR(
                          filteredRecords.reduce((sum, r) => {
                            const sched = getScheduleForRecord(r, projects, financialRecords);
                            return sum + Math.max(0, sched.contractValue - sched.totalPaid);
                          }, 0)
                        )}
                      </span>
                    </td>
                    <td colSpan={2} className="p-5"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-start justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 relative overflow-hidden my-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black">
                    Tambah {activeTab === "HUTANG" ? "Hutang" : "Piutang"} Baru
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    Catat transaksi kewajiban secara rapi.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Keterangan / Judul
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mis: Pembelian Material X"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Nama Kontak / Pihak
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mis: Toko Bangunan Jaya"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Jumlah (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {formData.type === "PIUTANG" ? "Tanggal Invoice" : "Tanggal Jatuh Tempo"}
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Kategori Project (Opsional)
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all appearance-none cursor-pointer"
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value })
                    }
                  >
                    <option value="">-- Pilih Project --</option>
                    {projects
                      .filter(isProjectActive)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all resize-none"
                    placeholder="Detail transaksi lainnya..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Simpan Catatan {activeTab === "HUTANG" ? "Hutang" : "Piutang"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-start justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 my-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black">
                    Cicil / Bayar {showPaymentModal.type}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    {showPaymentModal.title} - {showPaymentModal.contactName}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(null)}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Total Sisa Tagihan
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatCurrencyIDR(
                      showPaymentModal.amount -
                        (showPaymentModal.payments || []).reduce(
                          (a, b) => a + b.amount,
                          0,
                        ),
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Nominal Cicilan (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Tanggal Bayar
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                        value={paymentForm.date}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Metode
                      </label>
                      <select
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                        value={paymentForm.paymentMethod}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            paymentMethod: e.target.value as any,
                            sumberDana: e.target.value === "CASH" ? "REKENING PRIBADI" : "REKENING PT"
                          })
                        }
                      >
                        <option value="TRANSFER">TRANSFER</option>
                        <option value="CASH">TUNAI (CASH)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sumber Dana (Dari/Ke) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Sumber / Alur Dana (Koneksi Keuangan)
                    </label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                      value={paymentForm.sumberDana}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          sumberDana: e.target.value,
                        })
                      }
                    >
                      <option value="REKENING PT">REKENING PT</option>
                      <option value="REKENING PRIBADI">REKENING PRIBADI</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Konfirmasi Pembayaran
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showGroupPaymentModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-start justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-8 my-auto space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Bayar Total {showGroupPaymentModal.debtType === "HUTANG" ? "Hutang" : "Piutang"}
                  </h3>
                  <p className="text-xs font-bold text-indigo-600 mt-0.5 uppercase tracking-wider">
                    {showGroupPaymentModal.contactName}
                  </p>
                </div>
                <button
                  onClick={() => setShowGroupPaymentModal(null)}
                  className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-rose-800">
                  <span>Total Sisa Saldo:</span>
                  <span className="text-base font-black font-mono text-rose-700">
                    {formatCurrencyIDR(showGroupPaymentModal.totalRemaining)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  ðŸ’¡ <b>Otomatis Pemecahan ID:</b> Pembayaran akan memotong catatan hutang dengan <b>nominal sisa terkecil dahulu</b> hingga total pembayaran terpenuhi.
                </p>
              </div>

              <form onSubmit={handleRecordGroupPayment} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nominal Pembayaran (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500/20"
                    value={groupPaymentForm.amount}
                    onChange={(e) =>
                      setGroupPaymentForm({
                        ...groupPaymentForm,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Tanggal Pembayaran
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                      value={groupPaymentForm.date}
                      onChange={(e) =>
                        setGroupPaymentForm({
                          ...groupPaymentForm,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Metode
                    </label>
                    <select
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                      value={groupPaymentForm.paymentMethod}
                      onChange={(e) =>
                        setGroupPaymentForm({
                          ...groupPaymentForm,
                          paymentMethod: e.target.value as any,
                        })
                      }
                    >
                      <option value="TRANSFER">TRANSFER</option>
                      <option value="CASH">TUNAI (CASH)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Catatan Pembayaran
                  </label>
                  <input
                    type="text"
                    placeholder="mis: Pelunasan / Cicilan Hutang Bahan"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                    value={groupPaymentForm.note}
                    onChange={(e) =>
                      setGroupPaymentForm({
                        ...groupPaymentForm,
                        note: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Konfirmasi Bayar Total Hutang
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showEditModal && currentRecord && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-start justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl p-10 relative overflow-hidden my-auto space-y-8 text-slate-800"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[9px] font-black rounded uppercase tracking-wider">
                    {currentRecord.customId || currentRecord.id}
                  </span>
                  <h3 className="text-2xl font-black mt-1">
                    Edit Data {currentRecord.type === "HUTANG" ? "Hutang" : "Piutang"}
                  </h3>
                  <p className="text-slate-500 font-medium text-xs mt-1">
                    Sesuaikan informasi utama atau kelola riwayat angsuran/pembayaran di bawah.
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* SECTION 1: Detail Utama (Main Fields) */}
              <form onSubmit={handleSaveMainDetails} className="space-y-6">
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                    <Edit size={12} className="text-indigo-600" /> Detail Utama
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Tipe Catatan
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none ring-primary/10 focus:ring-4 transition-all appearance-none cursor-pointer"
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                      >
                        <option value="HUTANG">HUTANG (Kewajiban)</option>
                        <option value="PIUTANG">PIUTANG (Tagihan / Kasbon)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Keterangan / Judul
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Nama Kontak ({editForm.type === "HUTANG" ? "Vendor/Kreditur" : "Debitur/Staff"})
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                        value={editForm.contactName}
                        onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Nilai Buku Awal (Rp)
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono outline-none ring-primary/10 focus:ring-4 transition-all"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        {editForm.type === "PIUTANG" ? "Tanggal Invoice" : "Tanggal Jatuh Tempo"}
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                        value={editForm.dueDate}
                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Proyek Terkait
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none ring-primary/10 focus:ring-4 transition-all appearance-none cursor-pointer"
                        value={editForm.projectId}
                        onChange={(e) => setEditForm({ ...editForm, projectId: e.target.value })}
                      >
                        <option value="">-- Hubungkan ke Proyek (Opsional) --</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Deskripsi Catatan
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none ring-primary/10 focus:ring-4 transition-all resize-none"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} /> Simpan Perubahan Detail
                    </button>
                  </div>
                </div>
              </form>

              {/* SECTION 2: Daftar Pembayaran / Riwayat Cicilan */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                  <DollarSign size={12} className="text-emerald-500" /> Riwayat Pembayaran / Angsuran ({currentRecord.payments?.length || 0})
                </h4>

                {(!currentRecord.payments || currentRecord.payments.length === 0) ? (
                  <p className="text-xs text-slate-400 italic font-medium py-2">Belum ada pembayaran atau cicilan tercatat untuk data ini.</p>
                ) : (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="p-3 font-black text-[10px] uppercase tracking-wider">Tanggal</th>
                          <th className="p-3 font-black text-[10px] uppercase tracking-wider">Keterangan</th>
                          <th className="p-3 font-black text-[10px] uppercase tracking-wider text-center">Status</th>
                          <th className="p-3 font-black text-[10px] uppercase tracking-wider text-right">Jumlah (Rp)</th>
                          <th className="p-3 font-black text-[10px] uppercase tracking-wider text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {currentRecord.payments.map((p) => {
                          const isEditingThis = editingPaymentId === p.id;
                          const currentStatus = p.status || "LUNAS";
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                              {isEditingThis ? (
                                <td colSpan={5} className="p-3 bg-indigo-50/30">
                                  <div className="space-y-3 p-2">
                                    <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Edit Pembayaran / Termin:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Tanggal</label>
                                        <input
                                          type="date"
                                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold outline-none"
                                          value={paymentEditForm.date}
                                          onChange={(e) => setPaymentEditForm({ ...paymentEditForm, date: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Keterangan</label>
                                        <input
                                          type="text"
                                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold outline-none"
                                          value={paymentEditForm.note}
                                          onChange={(e) => setPaymentEditForm({ ...paymentEditForm, note: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Status Termin</label>
                                        <select
                                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold outline-none cursor-pointer"
                                          value={paymentEditForm.status}
                                          onChange={(e) => setPaymentEditForm({ ...paymentEditForm, status: e.target.value })}
                                        >
                                          <option value="LUNAS">ðŸŸ¢ Lunas</option>
                                          <option value="DICICIL">ðŸŸ¡ Dicicil / Angsuran</option>
                                          <option value="BELUM LUNAS">ðŸ”´ Belum Lunas</option>
                                          <option value="BELUM BAYAR">âšª Belum Bayar</option>
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Jumlah (Rp)</label>
                                        <input
                                          type="number"
                                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold font-mono outline-none"
                                          value={paymentEditForm.amount}
                                          onChange={(e) => setPaymentEditForm({ ...paymentEditForm, amount: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => setEditingPaymentId(null)}
                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-black text-[9px] uppercase tracking-wider cursor-pointer"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        onClick={() => handleSavePaymentEdit(p.id)}
                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-black text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check size={10} /> Simpan
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              ) : (
                                <>
                                  <td className="p-3 text-slate-600">{p.date}</td>
                                  <td className="p-3 text-slate-700">
                                    <div>
                                      <p>{p.note || "No note"}</p>
                                      {p.recordedBy && <p className="text-[9px] text-slate-400 font-medium">Recorded by: {p.recordedBy}</p>}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase border ${
                                      currentStatus === "LUNAS" || currentStatus === "PAID"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : currentStatus === "DICICIL" || currentStatus === "PARTIAL"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : currentStatus === "BELUM LUNAS"
                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                            : "bg-slate-50 text-slate-600 border-slate-200"
                                    }`}>
                                      {currentStatus}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-mono text-emerald-600">{formatCurrencyIDR(p.amount)}</td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => {
                                          setEditingPaymentId(p.id);
                                          setPaymentEditForm({
                                            amount: p.amount.toString(),
                                            date: p.date,
                                            note: p.note || "",
                                            status: p.status || "LUNAS",
                                          });
                                        }}
                                        className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                                        title="Edit Pembayaran"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePayment(p.id)}
                                        className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                                        title="Hapus Pembayaran"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* NEW DETAIL TERMIN MODAL */}
        {selectedTerminRecord && (() => {
          const sched = getScheduleForRecord(selectedTerminRecord, projects, financialRecords);
          const totalPaid = sched.totalPaid;
          const remaining = Math.max(0, sched.contractValue - totalPaid);
          const isPpnEnabled = sched.isPpnEnabled;
          
          const dppTotal = sched.dppValue;
          const ppnTotal = sched.ppnValue;
          const dppPaid = isPpnEnabled ? Math.round(totalPaid / 1.11) : totalPaid;
          const ppnPaid = isPpnEnabled ? totalPaid - dppPaid : 0;
          const dppRemaining = isPpnEnabled ? Math.round(remaining / 1.11) : remaining;
          const ppnRemaining = isPpnEnabled ? remaining - dppRemaining : 0;

          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl rounded-[2.5rem] shadow-2xl p-6 sm:p-8 relative overflow-hidden my-auto space-y-6 text-slate-800"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[10px] font-black rounded-lg uppercase tracking-widest inline-block mb-1">
                      {selectedTerminRecord.customId || selectedTerminRecord.id}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Rincian Realisasi Pembayaran Proyek
                    </h3>
                    <p className="text-slate-500 font-medium text-xs">
                      Termin penagihan dan realisasi pembayaran piutang proyek terkait.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTerminRecord(null)}
                    className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Informasi Kontrak */}
                  <div className="bg-slate-50/75 p-5 rounded-2xl border border-slate-200/50 space-y-3">
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest border-b border-slate-200/50 pb-1.5 flex items-center gap-1.5">
                      <Briefcase size={12} /> Informasi Kontrak & Proyek
                    </h4>
                    <div className="grid grid-cols-3 gap-y-2.5 text-xs font-bold">
                      <div className="text-slate-400">Nama Proyek</div>
                      <div className="col-span-2 text-slate-800 break-words">{sched.projectName}</div>
                      
                      <div className="text-slate-400">No. Kontrak</div>
                      <div className="col-span-2 text-slate-800 font-mono text-[11px]">{sched.contractNo}</div>
                      
                      <div className="text-slate-400">Pemilik Proyek</div>
                      <div className="col-span-2 text-slate-800">{sched.owner}</div>
                      
                      <div className="text-slate-400">Kontraktor</div>
                      <div className="col-span-2 text-slate-800">PT. GARDA INOVASI GLOBALTECH</div>
                      
                      <div className="text-slate-400">Tanggal Mulai</div>
                      <div className="col-span-2 text-slate-800 font-mono">{sched.startDate}</div>
                    </div>
                  </div>

                  {/* Right Column: Realisasi Finansial */}
                  <div className="bg-slate-50/75 p-5 rounded-2xl border border-slate-200/50 space-y-3">
                    <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest border-b border-slate-200/50 pb-1.5 flex items-center gap-1.5">
                      <Coins size={12} /> Realisasi Finansial
                    </h4>
                    <div className="grid grid-cols-3 gap-y-2.5 text-xs font-bold">
                      <div className="text-slate-400">Nilai Kontrak {isPpnEnabled ? "(+ PPN 11%)" : ""}</div>
                      <div className="col-span-2 text-slate-900 font-mono text-sm font-extrabold">
                        {formatCurrencyIDR(sched.contractValue)}
                        {isPpnEnabled && (
                          <span className="block text-[10px] font-sans text-indigo-600 font-bold">
                            DPP (Sebelum PPN): {formatCurrencyIDR(dppTotal)}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-slate-400">Total Masuk</div>
                      <div className="col-span-2 text-emerald-600 font-mono text-sm font-black">
                        {formatCurrencyIDR(totalPaid)}
                      </div>
                      
                      <div className="text-slate-400">Sisa Tagihan</div>
                      <div className="col-span-2 font-mono text-sm font-black">
                        <span className={remaining > 0 ? "text-rose-600" : "text-emerald-600"}>
                          {formatCurrencyIDR(remaining)}
                        </span>
                      </div>
                      
                      <div className="text-slate-400">Realisasi (%)</div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${sched.contractValue > 0 ? Math.min(100, (totalPaid / sched.contractValue) * 100) : 0}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-black text-slate-600">
                            {sched.contractValue > 0 ? ((totalPaid / sched.contractValue) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>

                      {/* PPN 11% Tax Breakdown Section */}
                      <div className="col-span-3 border-t border-slate-200/50 my-1 pt-2.5">
                        <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Percent size={10} /> ESTIMASI PAJAK PPN {!isPpnEnabled && <span className="text-rose-600 font-black bg-rose-50 border border-rose-200/50 px-2 py-0.5 rounded ml-1 text-[8px] normal-case">NON-AKTIF (0%)</span>}
                        </div>
                        <div className="grid grid-cols-3 gap-y-2 text-xs font-bold bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/50">
                          <div className="text-slate-500">Nilai Sebelum PPN (DPP)</div>
                          <div className="col-span-2 font-mono text-slate-800 text-xs font-black">
                            {formatCurrencyIDR(dppTotal)}
                          </div>

                          <div className="text-slate-500">PPN (Jika Lunas)</div>
                          <div className="col-span-2 font-mono text-slate-900 text-xs font-black">
                            {formatCurrencyIDR(ppnTotal)}
                          </div>
                          
                          <div className="text-slate-500">PPN (Realisasi)</div>
                          <div className="col-span-2 font-mono text-emerald-600 text-xs font-black">
                            {formatCurrencyIDR(ppnPaid)}
                          </div>
                          
                          <div className="text-slate-500">Sisa PPN Belum Realisasi</div>
                          <div className="col-span-2 font-mono text-rose-600 text-xs font-black">
                            {formatCurrencyIDR(ppnRemaining)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Termin Schedule Table */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <CalendarClock size={12} /> Tabel Realisasi Masuk, Estimasi {isPpnEnabled ? "PPN 11%" : "PPN 0%"} & Persentase Kontrak
                  </h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-white font-mono font-black text-[10px] uppercase tracking-wider">
                            <th className="p-3.5 pl-5">ID TERMIN</th>
                            <th className="p-3.5">TERMIN / TAHAPAN</th>
                            <th className="p-3.5">DESKRIPSI / CATATAN</th>
                            <th className="p-3.5 text-right">NOMINAL MASUK (IDR)</th>
                            <th className="p-3.5 text-right text-indigo-300">{isPpnEnabled ? "PPN 11%" : "PPN 0%"} (IDR)</th>
                            <th className="p-3.5 text-center">PERSENTASE</th>
                            <th className="p-3.5 text-center">TGL INVOICE</th>
                            <th className="p-3.5 text-center">TGL BAYAR</th>
                            <th className="p-3.5 text-center">STATUS</th>
                            <th className="p-3.5 pr-5">KETERANGAN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                          {sched.terms.map((term: any, idx: number) => {
                            const termAmt = term.amount;
                            const expectedAmt = term.expectedAmount !== undefined ? term.expectedAmount : (termAmt || ((term.percentage / 100) * sched.contractValue));
                            const termDpp = isPpnEnabled ? Math.round(expectedAmt / 1.11) : expectedAmt;
                            const ppnValue = isPpnEnabled ? expectedAmt - termDpp : 0;

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 pl-5 font-mono font-black text-indigo-600 bg-indigo-50/20 text-[11px]">
                                  {term.customId || "-"}
                                </td>
                                <td className="p-3 font-extrabold text-slate-900">{term.name}</td>
                                <td className="p-3 text-slate-500 max-w-xs truncate" title={term.description}>{term.description}</td>
                                <td className="p-3 text-right font-mono text-emerald-600 font-extrabold">
                                  {termAmt > 0 ? formatCurrencyIDR(termAmt) : "-"}
                                </td>
                                <td className="p-3 text-right font-mono text-indigo-700 bg-indigo-50/20">
                                  {expectedAmt > 0 ? formatCurrencyIDR(ppnValue) : "-"}
                                </td>
                                <td className="p-3 text-center font-mono text-slate-500">{term.percentage > 0 ? `${term.percentage}%` : "-"}</td>
                                <td className="p-3 text-center font-mono text-slate-500">{term.invoiceDate}</td>
                                <td className="p-3 text-center font-mono text-slate-500">{term.paymentDate}</td>
                                <td className="p-3 text-center">
                                  <select
                                    value={term.status}
                                    onChange={(e) => {
                                      const newSt = e.target.value;
                                      if (selectedTerminRecord) {
                                        handleUpdateTermStatus(selectedTerminRecord, idx, newSt);
                                      }
                                    }}
                                    className={`px-2 py-1 rounded-md text-[9px] font-black tracking-wider uppercase border cursor-pointer outline-none transition-all ${
                                      term.status === "LUNAS"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : term.status === "BELUM LUNAS"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : term.status === "DICICIL"
                                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                            : "bg-slate-50 text-slate-500 border-slate-200"
                                    }`}
                                  >
                                    <option value="LUNAS">ðŸŸ¢ LUNAS</option>
                                    <option value="BELUM LUNAS">ðŸŸ¡ BELUM LUNAS</option>
                                    <option value="DICICIL">ðŸ”µ DICICIL</option>
                                    <option value="BELUM BAYAR">âšª BELUM BAYAR</option>
                                  </select>
                                </td>
                                <td className="p-3 pr-5 text-slate-400 italic text-[11px] font-medium">{term.notes}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Riwayat Transaksi Pembayaran / Cicilan Masuk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Coins size={12} className="text-emerald-600" /> Riwayat Realisasi Pembayaran / Cicilan / DP Masuk
                    </h4>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Total {sched.allPayments.length} Transaksi Masuk
                    </span>
                  </div>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-800 text-white font-mono font-black text-[10px] uppercase tracking-wider">
                            <th className="p-3 pl-5">NO</th>
                            <th className="p-3">TANGGAL MASUK</th>
                            <th className="p-3 text-right">NOMINAL BAYAR (IDR)</th>
                            <th className="p-3">CATATAN / KETERANGAN</th>
                            <th className="p-3 pr-5">DICATAT OLEH</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                          {sched.allPayments && sched.allPayments.length > 0 ? (
                            sched.allPayments.map((pym: any, pIdx: number) => (
                              <tr key={pIdx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 pl-5 font-mono text-slate-400 text-[11px]">{pIdx + 1}</td>
                                <td className="p-3 font-mono text-slate-800">{pym.date || "-"}</td>
                                <td className="p-3 text-right font-mono text-emerald-600 font-black">
                                  {formatCurrencyIDR(pym.amount || 0)}
                                </td>
                                <td className="p-3 text-slate-600">{pym.note || "Pembayaran Piutang / DP / Cicilan"}</td>
                                <td className="p-3 pr-5 text-slate-400 text-[11px]">{pym.recordedBy || "Sistem"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-slate-400 font-medium italic">
                                Belum ada riwayat pembayaran / cicilan yang dicatat untuk piutang proyek ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => {
                      const rec = selectedTerminRecord;
                      if (!rec) return;
                      setSelectedTerminRecord(null);
                      setShowEditModal(rec);
                      setEditForm({
                        title: rec.title,
                        contactName: rec.contactName,
                        amount: rec.amount.toString(),
                        dueDate: rec.dueDate,
                        description: rec.description || "",
                        projectId: rec.projectId || "",
                        type: rec.type,
                      });
                    }}
                    className="px-6 py-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Edit size={14} /> Edit Data
                  </button>
                  <button
                    onClick={() => {
                      if (selectedTerminRecord) {
                        const sched = getScheduleForRecord(selectedTerminRecord, projects, financialRecords);
                        setPdfConfigRecord(selectedTerminRecord);
                        setPdfOptions((prev) => ({
                          ...prev,
                          ownerBy: prev.ownerBy || sched.owner || selectedTerminRecord.contactName || "",
                        }));
                        setShowPdfConfigModal(true);
                      }
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-100"
                    disabled={isExporting}
                  >
                    <Download size={14} /> Unduh PDF Profesional
                  </button>
                  <button
                    onClick={() => setSelectedTerminRecord(null)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    Tutup Rincian
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Contact Detailed Debts & Mutations Modal */}
      <AnimatePresence>
        {selectedContactDetail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl p-6 sm:p-10 relative overflow-hidden my-auto space-y-6 text-slate-800"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      selectedContactDetail.type === "HUTANG"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <Users2 size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          selectedContactDetail.type === "HUTANG"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {selectedContactDetail.type === "HUTANG" ? "Hutang Perusahaan (Kewajiban)" : "Piutang Perusahaan (Tagihan)"}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        {contactDetailSummary.count} Catatan Terdaftar
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
                      {selectedContactDetail.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Rincian seluruh catatan {selectedContactDetail.type === "HUTANG" ? "hutang & peruntukan dananya" : "piutang/kasbon"} serta riwayat transaksi kas/bank terkait.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() =>
                      downloadContactSummaryPDF(
                        selectedContactDetail,
                        contactDetailRecords,
                        contactFinancialRecords,
                        contactDetailSummary
                      )
                    }
                    className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    title="Unduh Laporan Rincian PDF"
                  >
                    <Download size={14} /> Unduh PDF
                  </button>
                  {selectedContactDetail.type === "HUTANG" && contactDetailSummary.totalRemaining > 0 && (
                    <button
                      onClick={() => {
                        const targetName = selectedContactDetail.name;
                        const rem = contactDetailSummary.totalRemaining;
                        setShowGroupPaymentModal({
                          contactName: targetName,
                          totalRemaining: rem,
                          debtType: "HUTANG",
                        });
                        setGroupPaymentForm((prev) => ({
                          ...prev,
                          amount: rem.toString(),
                          note: `Pelunasan Total Hutang Vendor ${targetName}`,
                        }));
                      }}
                      className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-md shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle size={14} /> Bayar Total ({formatCurrencyIDR(contactDetailSummary.totalRemaining)})
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedContactDetail(null)}
                    className="w-12 h-12 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                    title="Tutup Modal"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Metric Highlights Strip */}
              {selectedContactDetail.type === "PIUTANG" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                    <p className="text-[9.5px] font-black uppercase text-slate-500 tracking-wider">Nilai Kontrak Proyek</p>
                    <p className="text-base sm:text-lg font-black text-slate-800 mt-1 font-mono">{formatCurrencyIDR(contactDetailSummary.totalAmount)}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{contactDetailSummary.count} Rekam Terdaftar</p>
                  </div>
                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
                    <p className="text-[9.5px] font-black uppercase text-emerald-700 tracking-wider">Pemasukan (Telah Dibayar)</p>
                    <p className="text-base sm:text-lg font-black text-emerald-700 mt-1 font-mono">{formatCurrencyIDR(contactDetailSummary.totalPaid)}</p>
                    <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Uang Masuk dari Klien</p>
                  </div>
                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 shadow-xs">
                    <p className="text-[9.5px] font-black uppercase text-blue-700 tracking-wider">Sisa Tagihan Piutang</p>
                    <p className="text-base sm:text-lg font-black text-blue-800 mt-1 font-mono">{formatCurrencyIDR(contactDetailSummary.totalRemaining)}</p>
                    <p className="text-[10px] text-blue-600 font-medium mt-0.5">Belum Diterima</p>
                  </div>
                  <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 shadow-xs">
                    <p className="text-[9.5px] font-black uppercase text-rose-700 tracking-wider">Total Belanja Proyek</p>
                    <p className="text-base sm:text-lg font-black text-rose-700 mt-1 font-mono">{formatCurrencyIDR(contactDetailSummary.totalPengeluaran)}</p>
                    <p className="text-[10px] text-rose-600 font-medium mt-0.5">Biaya / Pengeluaran PT</p>
                  </div>
                  <div className={`p-4 rounded-2xl border shadow-xs ${contactDetailSummary.keuntungan >= 0 ? "bg-teal-50/80 border-teal-200/80" : "bg-amber-50/80 border-amber-200/80"}`}>
                    <p className={`text-[9.5px] font-black uppercase tracking-wider ${contactDetailSummary.keuntungan >= 0 ? "text-teal-700" : "text-amber-700"}`}>Laba Kas Proyek</p>
                    <p className={`text-base sm:text-lg font-black mt-1 font-mono ${contactDetailSummary.keuntungan >= 0 ? "text-teal-800" : "text-amber-800"}`}>{formatCurrencyIDR(contactDetailSummary.keuntungan)}</p>
                    <p className={`text-[10px] font-medium mt-0.5 ${contactDetailSummary.keuntungan >= 0 ? "text-teal-600" : "text-amber-600"}`}>Pemasukan - Belanja</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Total Catatan</p>
                    <p className="text-lg font-black text-slate-800 mt-1">{contactDetailSummary.count} Rekam</p>
                  </div>
                  <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Total Nilai Awal</p>
                    <p className="text-lg font-black text-slate-800 mt-1 font-mono">{formatCurrencyIDR(contactDetailSummary.totalAmount)}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60">
                    <p className="text-[9.5px] font-black uppercase text-emerald-600 tracking-wider">Telah Dibayar</p>
                    <p className="text-lg font-black text-emerald-700 mt-1 font-mono">{formatCurrencyIDR(contactDetailSummary.totalPaid)}</p>
                  </div>
                  <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100/80">
                    <p className="text-[9.5px] font-black uppercase text-rose-600 tracking-wider">Sisa Saldo Hutang</p>
                    <p className="text-lg font-black text-rose-700 mt-1 font-mono">{formatCurrencyIDR(contactDetailSummary.totalRemaining)}</p>
                  </div>
                </div>
              )}

              {/* Modal Tabs Bar */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button
                  onClick={() => setContactDetailTab("DEBTS")}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    contactDetailTab === "DEBTS"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <FileText size={14} /> Daftar Rekam {selectedContactDetail.type === "HUTANG" ? "Hutang" : "Piutang"} ({contactDetailRecords.length})
                </button>
                <button
                  onClick={() => setContactDetailTab("FINANCIAL")}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    contactDetailTab === "FINANCIAL"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Receipt size={14} /> Mutasi Kas/Bank Terkait ({contactFinancialRecords.length})
                </button>
              </div>

              {/* Tab 1: Daftar Rekam Hutang / Piutang */}
              {contactDetailTab === "DEBTS" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <p className="font-semibold">
                      Berikut daftar seluruh invoice/catatan {selectedContactDetail.type === "HUTANG" ? "kewajiban hutang ke" : "piutang dari"}{" "}
                      <span className="font-bold text-slate-900">{selectedContactDetail.name}</span> beserta peruntukan dana dan status pelunasannya:
                    </p>
                  </div>

                  {contactDetailRecords.length === 0 ? (
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                      <p className="text-xs font-semibold text-slate-400">Tidak ada rekam data hutang/piutang ditemukan untuk kontak ini.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="sticky top-0 bg-slate-800 text-white font-mono font-black text-[10px] uppercase tracking-wider z-10">
                            <tr>
                              <th className="p-3.5 pl-4">NO</th>
                              <th className="p-3.5">ID REKAM</th>
                              <th className="p-3.5 min-w-[220px]">TUJUAN / JUDUL HUTANG</th>
                              <th className="p-3.5">PROYEK</th>
                              <th className="p-3.5">JATUH TEMPO</th>
                              <th className="p-3.5 text-right font-mono">NILAI AWAL</th>
                              <th className="p-3.5 text-right font-mono">DIBAYAR</th>
                              <th className="p-3.5 text-right font-mono">SISA SALDO</th>
                              <th className="p-3.5 text-center">STATUS</th>
                              <th className="p-3.5 pr-4 text-center">AKSI</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-bold text-slate-700 bg-white">
                            {contactDetailRecords.map((rec, rIdx) => {
                              const sched = getScheduleForRecord(rec, projects, financialRecords);
                              const paid = sched.totalPaid;
                              const initialAmt = sched.contractValue || rec.amount || 0;
                              const remaining = Math.max(0, initialAmt - paid);
                              const projName = projects.find((p) => p.id === rec.projectId)?.name || "-";
                              const status = remaining <= 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";

                              return (
                                <tr key={rec.id || rIdx} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="p-3.5 pl-4 font-mono text-slate-400 text-[11px]">{rIdx + 1}</td>
                                  <td className="p-3.5 font-mono text-indigo-600 font-black text-[11px]">
                                    {rec.customId || rec.id}
                                  </td>
                                  <td className="p-3.5">
                                    <div>
                                      <p className="font-extrabold text-slate-800 uppercase tracking-tight text-xs">
                                        {rec.title || "Tanpa Judul"}
                                      </p>
                                      {rec.description && (
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 max-w-sm">
                                          {rec.description}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="text-slate-600 font-semibold text-[11px] truncate block max-w-[140px]" title={projName}>
                                      {projName}
                                    </span>
                                  </td>
                                  <td className="p-3.5 font-mono text-slate-600 text-[11px]">
                                    {rec.dueDate || "-"}
                                  </td>
                                  <td className="p-3.5 text-right font-mono text-slate-800">
                                    {formatCurrencyIDR(initialAmt)}
                                  </td>
                                  <td className="p-3.5 text-right font-mono text-emerald-600">
                                    {formatCurrencyIDR(paid)}
                                  </td>
                                  <td className="p-3.5 text-right font-mono">
                                    <span className={remaining > 0 ? (selectedContactDetail.type === "HUTANG" ? "text-rose-600 font-black" : "text-emerald-600 font-black") : "text-slate-400"}>
                                      {formatCurrencyIDR(remaining)}
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-center">
                                    <span
                                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                        status === "PAID"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : status === "PARTIAL"
                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                            : "bg-rose-50 text-rose-700 border-rose-200"
                                      }`}
                                    >
                                      {status === "PAID" ? "Lunas" : status === "PARTIAL" ? "Dicicil" : "Belum Bayar"}
                                    </span>
                                  </td>
                                  <td className="p-3.5 pr-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {remaining > 0 && (
                                        <button
                                          onClick={() => setShowPaymentModal(rec)}
                                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                                          title="Bayar Cicilan Item Ini"
                                        >
                                          Bayar
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setShowEditModal(rec);
                                          setEditForm({
                                            title: rec.title,
                                            contactName: rec.contactName,
                                            amount: rec.amount.toString(),
                                            dueDate: rec.dueDate,
                                            description: rec.description || "",
                                            projectId: rec.projectId || "",
                                            type: rec.type,
                                          });
                                        }}
                                        className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                        title="Edit Rincian"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button
                                        onClick={() => setSelectedTerminRecord(rec)}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                        title="Lihat Rincian Termin / Cicilan"
                                      >
                                        <Eye size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Riwayat Mutasi Transaksi Kas/Bank */}
              {contactDetailTab === "FINANCIAL" && (
                <div className="space-y-4">
                  {/* Financial Flow Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-[9.5px] font-black uppercase text-emerald-700 tracking-wider">Total Pemasukan</p>
                        <p className="text-base font-black text-emerald-800 mt-0.5 font-mono">{formatCurrencyIDR(contactDetailSummary.totalPemasukan)}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-800 text-[10px] font-black rounded-lg">
                        {contactFinancialRecords.filter((f) => f.type === "IN").length} Trx
                      </span>
                    </div>
                    <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-[9.5px] font-black uppercase text-rose-700 tracking-wider">Total Pengeluaran / Belanja</p>
                        <p className="text-base font-black text-rose-800 mt-0.5 font-mono">{formatCurrencyIDR(contactDetailSummary.totalPengeluaran)}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-200/60 text-rose-800 text-[10px] font-black rounded-lg">
                        {contactFinancialRecords.filter((f) => f.type === "OUT").length} Trx
                      </span>
                    </div>
                    <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${contactDetailSummary.keuntungan >= 0 ? "bg-teal-50/70 border-teal-200/80" : "bg-amber-50/70 border-amber-200/80"}`}>
                      <div>
                        <p className={`text-[9.5px] font-black uppercase tracking-wider ${contactDetailSummary.keuntungan >= 0 ? "text-teal-700" : "text-amber-700"}`}>Arus Kas Bersih (Laba)</p>
                        <p className={`text-base font-black mt-0.5 font-mono ${contactDetailSummary.keuntungan >= 0 ? "text-teal-800" : "text-amber-800"}`}>{formatCurrencyIDR(contactDetailSummary.keuntungan)}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg ${contactDetailSummary.keuntungan >= 0 ? "bg-teal-200/60 text-teal-800" : "bg-amber-200/60 text-amber-800"}`}>
                        {contactDetailSummary.keuntungan >= 0 ? "Surplus" : "Defisit"}
                      </span>
                    </div>
                  </div>

                  {/* Filter bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
                      <button
                        onClick={() => setContactFinancialFilter("ALL")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          contactFinancialFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Semua ({contactFinancialRecords.length})
                      </button>
                      <button
                        onClick={() => setContactFinancialFilter("IN")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          contactFinancialFilter === "IN" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        Pemasukan Klien ({contactFinancialRecords.filter((f) => f.type === "IN").length})
                      </button>
                      <button
                        onClick={() => setContactFinancialFilter("OUT")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          contactFinancialFilter === "OUT" ? "bg-rose-600 text-white shadow-xs" : "text-rose-700 hover:bg-rose-50"
                        }`}
                      >
                        Pengeluaran Belanja ({contactFinancialRecords.filter((f) => f.type === "OUT").length})
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 font-medium">
                      Menampilkan mutasi kas & bank yang terhubung dengan proyek / kontak ini.
                    </p>
                  </div>

                  {contactFinancialRecords.length === 0 ? (
                    <div className="bg-slate-50/80 p-8 sm:p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
                      <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                        <Receipt size={28} />
                      </div>
                      <div className="max-w-lg mx-auto space-y-1">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                          Belum Ada Mutasi Transaksi Kas/Bank
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Belum ditemukan catatan transaksi langsung di data pemasukan/pengeluaran untuk kontak{" "}
                          <span className="font-bold text-slate-700">{selectedContactDetail.name}</span>. Hal ini wajar karena tanggal pencatatan mutasi kas/bank di sistem baru dimulai dari periode terkini, atau pencatatan hutang/piutang di atas merupakan saldo awal/tagihan yang belum dicairkan melalui buku kas.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="sticky top-0 bg-slate-800 text-white font-mono font-black text-[10px] uppercase tracking-wider z-10">
                            <tr>
                              <th className="p-3.5 pl-4">NO</th>
                              <th className="p-3.5">TANGGAL</th>
                              <th className="p-3.5">NO. BUKTI</th>
                              <th className="p-3.5 text-center">TIPE</th>
                              <th className="p-3.5">KATEGORI</th>
                              <th className="p-3.5 min-w-[200px]">KETERANGAN / DESKRIPSI</th>
                              <th className="p-3.5">REKENING / SUMBER DANA</th>
                              <th className="p-3.5 pr-4 text-right font-mono">NOMINAL (IDR)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-bold text-slate-700 bg-white">
                            {contactFinancialRecords
                              .filter((fin) => (contactFinancialFilter === "ALL" ? true : fin.type === contactFinancialFilter))
                              .map((fin, fIdx) => {
                                const isIncome = fin.type === "IN";
                                return (
                                  <tr key={fin.id || fIdx} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="p-3.5 pl-4 font-mono text-slate-400 text-[11px]">{fIdx + 1}</td>
                                    <td className="p-3.5 font-mono text-slate-800 text-[11px]">{fin.date || "-"}</td>
                                    <td className="p-3.5 font-mono text-indigo-600 font-black text-[11px]">{fin.customId || fin.id}</td>
                                    <td className="p-3.5 text-center">
                                      <span
                                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                          isIncome
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-rose-50 text-rose-700 border-rose-200"
                                        }`}
                                      >
                                        {isIncome ? "Pemasukan" : "Pengeluaran (Belanja)"}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-slate-700 text-[11px]">{fin.category || "-"}</td>
                                    <td className="p-3.5 text-slate-600 text-[11px] max-w-sm">{fin.description || "-"}</td>
                                    <td className="p-3.5 text-slate-500 text-[11px]">{fin.sumberDana || "-"}</td>
                                    <td className={`p-3.5 pr-4 text-right font-mono font-black ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                                      {formatCurrencyIDR(fin.amount || 0)}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSearchQuery(selectedContactDetail.name);
                    setSelectedContactDetail(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Search size={14} /> Filter di Tabel Utama
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      downloadContactSummaryPDF(
                        selectedContactDetail,
                        contactDetailRecords,
                        contactFinancialRecords,
                        contactDetailSummary
                      )
                    }
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedContactDetail(null)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    Tutup Rincian
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Configuration Modal */}
      <AnimatePresence>
        {showPdfConfigModal && pdfConfigRecord && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-6 my-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      Pengaturan Kop & Cetak PDF
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Atur nama perusahaan, alamat, logo, serta pejabat penandatangan laporan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPdfConfigModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Section 1: Kop Surat */}
                <div className="space-y-4">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-lg inline-block">
                    1. Identitas & Kop Surat
                  </div>

                  {/* Nama PT */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Nama Perusahaan / PT (Kop Surat)
                    </label>
                    <input
                      type="text"
                      value={pdfOptions.companyName}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, companyName: e.target.value })
                      }
                      placeholder="PT GARDA INOVASI GLOBALTECH"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Checkbox & Input Alamat */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeAddress}
                        onChange={(e) =>
                          setPdfOptions({ ...pdfOptions, includeAddress: e.target.checked })
                        }
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Sertakan Alamat & Informasi Kontak di Kop Surat
                      </span>
                    </label>

                    {pdfOptions.includeAddress && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Ketik Alamat & Kontak Perusahaan:
                        </label>
                        <textarea
                          rows={2}
                          value={pdfOptions.addressText}
                          onChange={(e) =>
                            setPdfOptions({ ...pdfOptions, addressText: e.target.value })
                          }
                          placeholder="M-Gold Tower, Lantai 16, Jl. KH. Noer Ali, Bekasi | Email: info@gig.co.id | Telp: (021) 88997766"
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Checkbox & Input Logo */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeLogo}
                        onChange={(e) =>
                          setPdfOptions({ ...pdfOptions, includeLogo: e.target.checked })
                        }
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Sertakan Logo Perusahaan
                      </span>
                    </label>

                    {pdfOptions.includeLogo && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          URL Gambar Logo (Format PNG / JPG)
                        </label>
                        <input
                          type="text"
                          value={pdfOptions.logoUrl}
                          onChange={(e) =>
                            setPdfOptions({ ...pdfOptions, logoUrl: e.target.value })
                          }
                          placeholder="https://domain.com/logo.png"
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Tanda Tangan */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-lg inline-block">
                    2. Pejabat Penandatangan & Pengesahan PDF
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dibuat Oleh (Admin) */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                      <div className="text-[11px] font-black uppercase text-indigo-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Dibuat Oleh (Admin / Staf)
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={pdfOptions.createdBy}
                          onChange={(e) =>
                            setPdfOptions({ ...pdfOptions, createdBy: e.target.value })
                          }
                          placeholder="FAISAL MUSTOPA"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Jabatan
                        </label>
                        <input
                          type="text"
                          value={pdfOptions.createdByRole}
                          onChange={(e) =>
                            setPdfOptions({ ...pdfOptions, createdByRole: e.target.value })
                          }
                          placeholder="Staf Administrasi Keuangan"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Disetujui Oleh (Direktur) */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                      <div className="text-[11px] font-black uppercase text-emerald-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Disetujui Oleh (Direktur)
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Nama Direktur / Pejabat
                        </label>
                        <input
                          type="text"
                          value={pdfOptions.approvedBy}
                          onChange={(e) =>
                            setPdfOptions({ ...pdfOptions, approvedBy: e.target.value })
                          }
                          placeholder="MUHAMMAD YASIN"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Jabatan
                        </label>
                        <input
                          type="text"
                          value={pdfOptions.approvedByRole}
                          onChange={(e) =>
                            setPdfOptions({ ...pdfOptions, approvedByRole: e.target.value })
                          }
                          placeholder="Direktur Utama"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPdfConfigModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pdfConfigRecord) {
                      downloadSinglePiutangPDF(pdfConfigRecord, pdfOptions);
                    }
                    setShowPdfConfigModal(false);
                  }}
                  disabled={isExporting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-100 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Download size={14} /> {isExporting ? "Mengekspor..." : "Cetak & Unduh PDF"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

const generateNewCustomId = (
  type: string,
  flowType: string,
  date: string,
  records: FinancialRecord[],
  excludeRecordId?: string
) => {
  let idType = type;
  if (type === "OUT") {
    if (flowType === "OUT_PERSONAL_SPEND" || flowType === "PERSONAL_TALANGAN_REIMBURSE") {
      idType = "OUT_PERSONAL_SPEND"; // Generates PRS-
    } else {
      idType = "OUT_BANK_DIRECT"; // Generates BNK-
    }
  }
  
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length !== 3) return "";
  const dd = parts[2];
  const mm = parts[1];
  const yy = parts[0].substring(2);
  const dateFormatted = `${dd}${mm}${yy}`;
  
  let prefix = "BNK";
  if (idType === "IN") prefix = "INC";
  else if (idType === "OUT_PERSONAL_SPEND" || idType === "PERSONAL_TALANGAN_REIMBURSE") prefix = "PRS";
  
  const otherRecords = excludeRecordId ? records.filter(r => r.id !== excludeRecordId) : records;
  
  const todaysMatches = otherRecords.filter((r) => {
    const rId = r.customId || "";
    return rId.startsWith(`${prefix}-${dateFormatted}-`);
  });
  
  let nextNum = todaysMatches.length + 1;
  let nextNumStr = String(nextNum).padStart(3, "0");
  
  while (otherRecords.some((r) => r.customId === `${prefix}-${dateFormatted}-${nextNumStr}`)) {
    nextNum++;
    nextNumStr = String(nextNum).padStart(3, "0");
  }
  
  return `${prefix}-${dateFormatted}-${nextNumStr}`;
};

const parseBankAllocations = (refIdBankStr: string, totalAmount: number): Array<{ bankId: string; amount: number }> => {
  if (!refIdBankStr) return [];
  const ref = refIdBankStr.trim();
  
  if (ref.startsWith("{")) {
    try {
      const alloc = JSON.parse(ref);
      return Object.entries(alloc).map(([bankId, amt]) => ({
        bankId,
        amount: Number(amt) || 0
      }));
    } catch (e) {}
  }
  
  if (ref.includes(":") || ref.includes("|")) {
    const parts = ref.split("|");
    const results: Array<{ bankId: string; amount: number }> = [];
    for (const part of parts) {
      const [bankId, amtStr] = part.split(":");
      if (bankId) {
        results.push({
          bankId: bankId.trim(),
          amount: Number(amtStr) || 0
        });
      }
    }
    return results;
  }

  if (ref.includes(",")) {
    const ids = ref.split(",").map((x) => x.trim()).filter(Boolean);
    const divided = totalAmount / (ids.length || 1);
    return ids.map((id) => ({
      bankId: id,
      amount: divided
    }));
  }

  return [{ bankId: ref, amount: totalAmount }];
};

const serializeAllocations = (allocations: Array<{ bankId: string; amount: number }>) => {
  const valid = allocations.filter((a) => a.bankId && a.amount > 0);
  if (valid.length === 0) return "";
  if (valid.length === 1) return valid[0].bankId; // backward-compatible single string
  return valid.map((a) => `${a.bankId}:${a.amount}`).join("|");
};

const formatRefIdBankDisplay = (refIdBankStr: string, totalAmount: number): string => {
  if (!refIdBankStr) return "-";
  const allocations = parseBankAllocations(refIdBankStr, totalAmount);
  if (allocations.length === 0) return "-";
  if (allocations.length === 1) return allocations[0].bankId;
  return allocations
    .map((alloc) => `${alloc.bankId} (Rp ${alloc.amount.toLocaleString("id-ID")})`)
    .join(" + ");
};

const RefIdBankBadgeList = ({ refIdBankStr, totalAmount }: { refIdBankStr: string; totalAmount: number }) => {
  if (!refIdBankStr) return <span className="text-slate-400">-</span>;
  const allocations = parseBankAllocations(refIdBankStr, totalAmount);
  if (allocations.length === 0) return <span className="text-slate-400">-</span>;
  
  return (
    <div className="flex flex-col gap-1 items-center justify-center">
      {allocations.map((alloc, idx) => (
        <span 
          key={idx} 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-slate-50 text-slate-800 border border-slate-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-slate-600">{alloc.bankId}</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-600 font-extrabold">Rp {alloc.amount.toLocaleString("id-ID")}</span>
        </span>
      ))}
    </div>
  );
};

const AdminFinanceScreen = ({
  financialRecords,
  debtRecords,
  projects,
  onNavigate,
  user,
  roles,
  logActivity,
  employees,
  handleClearOnlyFinanceAndDebt,
  isImportingFinanceData,
  setDebtRecords,
  setFinancialRecords,
  setProjects,
}: {
  financialRecords: FinancialRecord[];
  debtRecords: DebtRecord[];
  projects: Project[];
  onNavigate: (s: ScreenId) => void;
  user: any;
  roles: RoleConfig[];
  logActivity: (m: string, a: string, d: string) => Promise<void>;
  employees: Employee[];
  handleClearOnlyFinanceAndDebt?: () => Promise<void>;
  isImportingFinanceData?: boolean;
  setDebtRecords?: React.Dispatch<React.SetStateAction<DebtRecord[]>>;
  setFinancialRecords?: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
}) => {
  const [timeframe, setTimeframe] = useState("monthly");
  const effectiveDebtRecords = useMemo(() => {
    return getEffectiveDebtRecords(debtRecords, projects, financialRecords);
  }, [debtRecords, projects, financialRecords]);
  const [selectedMonth, setSelectedMonth] = useState(6); // Default to July (6) since we have seeded financial records up to July 4, 2026
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i),
    [],
  );

  const [period, setPeriod] = useState("Bulan Ini");
  const [filterProject, setFilterProject] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");

  const kasbonLedgerData = useMemo(() => {
    const known = (projects || []).flatMap((p: any) => [
      ...(p.personnel || []).map((x: any) => typeof x === "string" ? x : x?.name),
      ...(p.teamMembers || []).map((x: any) => typeof x === "string" ? x : x?.name),
    ]).filter(Boolean);
    return calculateKasbonBalances(financialRecords, debtRecords, known);
  }, [financialRecords, debtRecords, projects]);
  const [filterTimeRange, setFilterTimeRange] = useState("ALL");
  const [filterFlowType, setFilterFlowType] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedPattyCashDetail, setSelectedPattyCashDetail] = useState<{
    bankId?: string;
    holder?: string;
    topupInfo?: any;
  } | null>(null);
  const [pattyCashModalSearch, setPattyCashModalSearch] = useState("");
  const [pattyCashModalProject, setPattyCashModalProject] = useState("ALL");
  const [pattyCashModalCategory, setPattyCashModalCategory] = useState("ALL");
  const [filterPattyCashBankId, setFilterPattyCashBankId] = useState("ALL");

  const [editingTransaction, setEditingTransaction] = useState<FinancialRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
    date: "",
    type: "OUT" as "IN" | "OUT",
    flowType: "OUT_BANK_DIRECT" as 'IN' | 'OUT_BANK_DIRECT' | 'OUT_PERSONAL_TRANSFER' | 'OUT_PERSONAL_SPEND' | 'PERSONAL_TALANGAN_REIMBURSE',
    personalHolder: "",
    amount: "",
    paymentMethod: "TRANSFER" as "CASH" | "TRANSFER",
    adminFee: "",
    category: "",
    description: "",
    projectId: "",
    linkedDebtId: "",
    customId: "",
    sumberDana: "",
    rekPenerima: "",
    refIdBank: "",
    refPiutang: "",
    refHutang: "",
    senderName: "",
    totalGaji: "",
    potonganKasbon: "",
    terminName: "",
    terminDescription: "",
    terminPercentage: "",
    terminInvoiceDate: "",
    terminDueDate: "",
    terminPaymentDate: "",
    terminStatus: "LUNAS",
    terminNotes: "",
  });

  const [useManualPICEdit, setUseManualPICEdit] = useState(false);
  const [useManualRefPiutangEdit, setUseManualRefPiutangEdit] = useState(false);
  const [useManualRefHutangEdit, setUseManualRefHutangEdit] = useState(false);
  const [useManualRefIdBankEdit, setUseManualRefIdBankEdit] = useState(false);

  // Synchronize edit form when transaction selected
  useEffect(() => {
    if (editingTransaction) {
      const linkedDebt = editingTransaction.linkedDebtId ? debtRecords.find(d => d.id === editingTransaction.linkedDebtId) : null;
      const associatedTerm = linkedDebt?.terms?.find((t: any) => t.financialRecordId === editingTransaction.id);

      setEditFormData({
        date: editingTransaction.date || "",
        type: editingTransaction.type || "OUT",
        flowType: editingTransaction.flowType || "OUT_BANK_DIRECT",
        personalHolder: editingTransaction.personalHolder || "",
        amount: String(editingTransaction.amount || ""),
        paymentMethod: editingTransaction.paymentMethod || "TRANSFER",
        adminFee: String(editingTransaction.adminFee || ""),
        category: editingTransaction.category || "",
        description: editingTransaction.description || "",
        projectId: editingTransaction.referenceId || "",
        linkedDebtId: editingTransaction.linkedDebtId || "",
        customId: editingTransaction.customId || "",
        sumberDana: editingTransaction.sumberDana || "",
        rekPenerima: editingTransaction.rekPenerima || "",
        refIdBank: editingTransaction.refIdBank || "",
        refPiutang: editingTransaction.refPiutang || "",
        refHutang: editingTransaction.refHutang || "",
        senderName: editingTransaction.senderName || "",
        totalGaji: String((editingTransaction as any).totalGaji || ""),
        potonganKasbon: String((editingTransaction as any).potonganKasbon || ""),
        terminName: associatedTerm?.name || editingTransaction.terminName || "",
        terminDescription: associatedTerm?.description || editingTransaction.terminDescription || "",
        terminPercentage: associatedTerm?.percentage !== undefined ? String(associatedTerm.percentage) : (editingTransaction.terminPercentage !== undefined ? String(editingTransaction.terminPercentage) : ""),
        terminInvoiceDate: associatedTerm?.invoiceDate || editingTransaction.terminInvoiceDate || "",
        terminDueDate: associatedTerm?.dueDate || editingTransaction.terminDueDate || "",
        terminPaymentDate: associatedTerm?.paymentDate || editingTransaction.terminPaymentDate || "",
        terminStatus: associatedTerm?.status || editingTransaction.terminStatus || "LUNAS",
        terminNotes: associatedTerm?.notes || editingTransaction.terminNotes || "",
      });
      setUseManualPICEdit(false);
      setUseManualRefPiutangEdit(false);
      setUseManualRefHutangEdit(false);
      setUseManualRefIdBankEdit(false);
    }
  }, [editingTransaction, debtRecords]);

  const [bankAllocations, setBankAllocations] = useState<Array<{ bankId: string; amount: number }>>([{ bankId: "", amount: 0 }]);
  const [editBankAllocations, setEditBankAllocations] = useState<Array<{ bankId: string; amount: number }>>([{ bankId: "", amount: 0 }]);

  // Synchronize editBankAllocations when editingTransaction is selected
  useEffect(() => {
    if (editingTransaction) {
      const parsed = parseBankAllocations(editingTransaction.refIdBank || "", editingTransaction.amount || 0);
      if (parsed.length > 0) {
        setEditBankAllocations(parsed);
      } else {
        setEditBankAllocations([{ bankId: editingTransaction.refIdBank || "", amount: editingTransaction.amount || 0 }]);
      }
    }
  }, [editingTransaction]);

  // Handle auto customId regeneration during edit when date/type/flowType changes
  useEffect(() => {
    if (editingTransaction) {
      const dateChanged = editFormData.date !== editingTransaction.date;
      const typeChanged = editFormData.type !== editingTransaction.type;
      const flowTypeChanged = editFormData.flowType !== editingTransaction.flowType;
      
      if (dateChanged || typeChanged || flowTypeChanged) {
        if (editFormData.date) {
          const newId = generateNewCustomId(
            editFormData.type,
            editFormData.flowType,
            editFormData.date,
            financialRecords,
            editingTransaction.id
          );
          if (newId) {
            setEditFormData(prev => ({ ...prev, customId: newId }));
          }
        }
      } else {
        setEditFormData(prev => ({ ...prev, customId: editingTransaction.customId || "" }));
      }
    }
  }, [editFormData.date, editFormData.type, editFormData.flowType, editingTransaction, financialRecords]);

  // Find all active bank IDs that have children breakdowns in financialRecords
  const activeBankIds = useMemo(() => {
    const ids = new Set<string>();
    financialRecords.forEach((r) => {
      if (r.refIdBank) {
        ids.add(r.refIdBank);
      }
    });
    return ids;
  }, [financialRecords]);

  // Map each active bank ID to a background class
  const uiBankColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const classes = [
      "bg-blue-50/60 border-l-4 border-l-blue-500",
      "bg-emerald-50/60 border-l-4 border-l-emerald-500",
      "bg-amber-50/60 border-l-4 border-l-amber-500",
      "bg-purple-50/60 border-l-4 border-l-purple-500",
      "bg-yellow-50/60 border-l-4 border-l-yellow-500",
      "bg-rose-50/60 border-l-4 border-l-rose-500",
      "bg-orange-50/60 border-l-4 border-l-orange-500",
      "bg-teal-50/60 border-l-4 border-l-teal-500",
      "bg-indigo-50/60 border-l-4 border-l-indigo-500",
    ];
    let idx = 0;
    Array.from(activeBankIds).forEach((bankId) => {
      map[bankId as string] = classes[idx % classes.length];
      idx++;
    });
    return map;
  }, [activeBankIds]);

  // Independent scroll lock for FinanceScreen modals
  useEffect(() => {
    if (showAddModal || showExportModal || editingTransaction || selectedPattyCashDetail) {
      const scrollY = window.pageYOffset;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100vw";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [showAddModal, showExportModal, editingTransaction, selectedPattyCashDetail]);

  const [searchQuery, setSearchQuery] = useState("");
  const [useManualPIC, setUseManualPIC] = useState(false);
  const [useManualRefPiutang, setUseManualRefPiutang] = useState(false);
  const [useManualRefHutang, setUseManualRefHutang] = useState(false);
  const [useManualRefIdBank, setUseManualRefIdBank] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "OUT" as "IN" | "OUT",
    flowType: "OUT_BANK_DIRECT" as 'IN' | 'OUT_BANK_DIRECT' | 'OUT_PERSONAL_TRANSFER' | 'OUT_PERSONAL_SPEND' | 'PERSONAL_TALANGAN_REIMBURSE',
    personalHolder: "Faisal Mustopa (Admin)" as string,
    amount: "",
    paymentMethod: "TRANSFER" as "CASH" | "TRANSFER",
    adminFee: "",
    category: "Operasional",
    description: "",
    projectId: "",
    linkedDebtId: "",
    customId: "",
    sumberDana: "REKENING PT",
    rekPenerima: "",
    refIdBank: "",
    refPiutang: "",
    refHutang: "",
    senderName: "",
    totalGaji: "",
    potonganKasbon: "",
    penerimaKasbon: "",
    pemilikUangPribadi: "",
    terminName: "",
    terminDescription: "",
    terminPercentage: "",
    terminInvoiceDate: "",
    terminDueDate: "",
    terminPaymentDate: "",
    terminStatus: "LUNAS",
    terminNotes: "",
    selectedTermId: "",
  });

  // Automatic ID Generator matching Faisal Mustopa's Excel format
  const autoGeneratedId = useMemo(() => {
    let idType = formData.type as string;
    if (formData.type === "OUT") {
      if (formData.flowType === "OUT_PERSONAL_SPEND" || formData.flowType === "PERSONAL_TALANGAN_REIMBURSE") {
        idType = "OUT_PERSONAL_SPEND"; // Generates PRS-
      } else {
        idType = "OUT_BANK_DIRECT"; // Generates BNK-
      }
    }
    
    if (!formData.date) return "";
    const parts = formData.date.split("-");
    if (parts.length !== 3) return "";
    const dd = parts[2];
    const mm = parts[1];
    const yy = parts[0].substring(2);
    const dateFormatted = `${dd}${mm}${yy}`;
    
    let prefix = "BNK";
    if (idType === "IN") prefix = "INC";
    else if (idType === "OUT_PERSONAL_SPEND" || idType === "PERSONAL_TALANGAN_REIMBURSE") prefix = "PRS";
    
    const todaysMatches = financialRecords.filter((r) => {
      const rId = r.customId || "";
      return rId.startsWith(`${prefix}-${dateFormatted}-`);
    });
    
    let nextNum = todaysMatches.length + 1;
    let nextNumStr = String(nextNum).padStart(3, "0");
    
    while (financialRecords.some((r) => r.customId === `${prefix}-${dateFormatted}-${nextNumStr}`)) {
      nextNum++;
      nextNumStr = String(nextNum).padStart(3, "0");
    }
    
    return `${prefix}-${dateFormatted}-${nextNumStr}`;
  }, [formData.type, formData.flowType, formData.date, financialRecords]);

  // Synchronize bankAllocations and customId when showAddModal opens
  useEffect(() => {
    if (showAddModal) {
      setBankAllocations([{ bankId: "", amount: 0 }]);
      if (autoGeneratedId) {
        setFormData((prev) => ({
          ...prev,
          customId: prev.customId || autoGeneratedId,
        }));
      }
    }
  }, [showAddModal, autoGeneratedId]);

  // Sync custom ID with form when type/date/flowType changes
  useEffect(() => {
    if (autoGeneratedId) {
      setFormData((prev) => ({
        ...prev,
        customId: autoGeneratedId,
      }));
    }
  }, [autoGeneratedId]);

  // Helper to get previous termin dates for the selected debt/receivable
  const getPreviousTerminInfo = (debtId: string) => {
    if (!debtId) return null;
    const linkedRecords = financialRecords
      .filter((r) => r.linkedDebtId === debtId)
      .sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        return dateB.localeCompare(dateA); // most recent first
      });

    if (linkedRecords.length > 0) {
      const lastRec = linkedRecords[0];
      return {
        terminName: lastRec.terminName || "Termin Sebelumnya",
        terminInvoiceDate: lastRec.terminInvoiceDate,
        terminDueDate: lastRec.terminDueDate,
        terminPaymentDate: lastRec.terminPaymentDate || lastRec.date,
        amount: lastRec.amount,
      };
    }

    const d = debtRecords.find((doc) => doc.id === debtId);
    if (d && d.customId && TERMIN_SCHEDULES[d.customId]) {
      const sched = TERMIN_SCHEDULES[d.customId];
      const paidTerms = sched.terms.filter((t) => t.status === "LUNAS");
      if (paidTerms.length > 0) {
        const lastTerm = paidTerms[paidTerms.length - 1];
        return {
          terminName: lastTerm.name,
          terminInvoiceDate: lastTerm.invoiceDate,
          terminDueDate: lastTerm.dueDate,
          terminPaymentDate: lastTerm.paymentDate,
          amount: lastTerm.amount,
        };
      }
    }
    return null;
  };

  // Auto-calculate terminPercentage for Add Form
  useEffect(() => {
    if (formData.linkedDebtId && formData.amount) {
      const d = effectiveDebtRecords.find((doc) => doc.id === formData.linkedDebtId);
      if (d && d.amount > 0) {
        const numAmt = Number(formData.amount);
        if (!isNaN(numAmt) && numAmt > 0) {
          const pct = parseFloat(((numAmt / d.amount) * 100).toFixed(2));
          setFormData((prev) => {
            if (prev.terminPercentage !== String(pct)) {
              return { ...prev, terminPercentage: String(pct) };
            }
            return prev;
          });
        }
      }
    }
  }, [formData.linkedDebtId, formData.amount, effectiveDebtRecords]);

  // Auto-calculate terminPercentage for Edit Form
  useEffect(() => {
    if (editFormData && editFormData.linkedDebtId && editFormData.amount) {
      const d = effectiveDebtRecords.find((doc) => doc.id === editFormData.linkedDebtId);
      if (d && d.amount > 0) {
        const numAmt = Number(editFormData.amount);
        if (!isNaN(numAmt) && numAmt > 0) {
          const pct = parseFloat(((numAmt / d.amount) * 100).toFixed(2));
          setEditFormData((prev) => {
            if (prev && prev.terminPercentage !== String(pct)) {
              return { ...prev, terminPercentage: String(pct) };
            }
            return prev;
          });
        }
      }
    }
  }, [editFormData?.linkedDebtId, editFormData?.amount, effectiveDebtRecords]);

  // Auto-sync terminPaymentDate to transaction date (tanggal pemasukan)
  useEffect(() => {
    setFormData((prev) => {
      if (prev.terminPaymentDate !== prev.date) {
        return { ...prev, terminPaymentDate: prev.date };
      }
      return prev;
    });
  }, [formData.date]);

  useEffect(() => {
    if (editFormData) {
      setEditFormData((prev) => {
        if (prev && prev.terminPaymentDate !== prev.date) {
          return { ...prev, terminPaymentDate: prev.date };
        }
        return prev;
      });
    }
  }, [editFormData?.date]);

  const [exportRange, setExportRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [exportFlowType, setExportFlowType] = useState<"ALL" | "PERSONAL" | "OUT_BANK_DIRECT" | "IN">("ALL");

  // Check if we are using the default dataset containing Faisal's June records
  const isUsingJuneBaseline = useMemo(() => {
    // If the database has detailed bank expenses for June, we calculate dynamically.
    // June records from the full 58 PDF dataset total more than 2, so if we have more than 2, isUsingJuneBaseline is false.
    const juneRecordsCount = financialRecords.filter((r) => r.date.startsWith("2026-06")).length;
    return juneRecordsCount > 0 && juneRecordsCount <= 2;
  }, [financialRecords]);

  // Base Offset Constants for June 2026 (Laporan Saldo Utama Bulan Juni)
  const BASE_INCOME = isUsingJuneBaseline ? 335264802 : 0;
  const BASE_DIRECT_EXPENSE = isUsingJuneBaseline ? 247956249 : 0; // B - transfers = 320168249 - 72212000
  const BASE_ADMIN_FEE = isUsingJuneBaseline ? 135000 : 0;
  const BASE_TRANSFERS_TO_PERSONAL = isUsingJuneBaseline ? 72212000 : 0;
  const BASE_SPENT_BY_PERSONAL = isUsingJuneBaseline ? 47392339 : 0;

  // Helper to check if a category is PATTYCASH (ignoring other categories as per user request)
  const isPattyCashCategory = useCallback((category?: string) => {
    if (!category) return false;
    const normalized = category.toUpperCase().replace(/\s+/g, "");
    return (
      normalized === "PATTYCASH" ||
      normalized === "PETTYCASH" ||
      normalized === "KASKECIL" ||
      normalized === "TARIKCASH" ||
      normalized === "PATTYCASHPROYEK" ||
      normalized === "PETTYCASHPROYEK" ||
      normalized.includes("PETTYCASHDI") ||
      normalized.includes("PATTYCASHDI")
    );
  }, []);

  // Helper to identify custody transfers (patty cash top-ups to personnel, NOT actual direct expenses)
  const isCustodyTransfer = useCallback((r: any) => {
    if (r.category && r.category.toUpperCase().replace(/\s+/g, "") === "KASBON") return false;
    if (r.flowType === "OUT_PERSONAL_TRANSFER") return true;
    return isPattyCashCategory(r.category) && r.flowType !== "OUT_PERSONAL_SPEND";
  }, [isPattyCashCategory]);

  const getBankRemainingBalance = useCallback((bankRec: FinancialRecord, isEdit: boolean) => {
    const spentOnThis = financialRecords
      .filter((r) => {
        if (isEdit && editingTransaction && r.id === editingTransaction.id) {
          return false;
        }
        return r.flowType === "OUT_PERSONAL_SPEND";
      })
      .reduce((sum, r) => {
        const allocs = parseBankAllocations(r.refIdBank || "", r.amount);
        const match = allocs.find((a) => a.bankId === bankRec.customId);
        return sum + (match ? match.amount : 0);
      }, 0);
    return bankRec.amount - spentOnThis;
  }, [financialRecords, editingTransaction]);

  const handleAutoPecah = useCallback((allocs: Array<{ bankId: string; amount: number }>, totalAmountStr: string, isEdit: boolean) => {
    const totalToAllocate = Number(totalAmountStr || 0);
    if (totalToAllocate <= 0) return;

    let remainingToAllocate = totalToAllocate;
    const updated = allocs.map((alloc) => {
      if (!alloc.bankId) {
        return { ...alloc, amount: 0 };
      }
      const bankRec = financialRecords.find((r) => (r.customId || r.id) === alloc.bankId);
      if (!bankRec) {
        return { ...alloc, amount: 0 };
      }

      const availableBalance = getBankRemainingBalance(bankRec, isEdit);
      const allocatedAmount = Math.max(0, Math.min(availableBalance, remainingToAllocate));
      remainingToAllocate -= allocatedAmount;

      return { ...alloc, amount: allocatedAmount };
    });

    if (remainingToAllocate > 0 && updated.length > 0) {
      updated[updated.length - 1].amount += remainingToAllocate;
    }

    if (isEdit) {
      setEditBankAllocations(updated);
      const str = serializeAllocations(updated);
      setEditFormData((prev) => ({ ...prev, refIdBank: str }));
    } else {
      setBankAllocations(updated);
      const str = serializeAllocations(updated);
      setFormData((prev) => ({ ...prev, refIdBank: str }));
    }
  }, [financialRecords, getBankRemainingBalance]);

  // Advanced PT Accounting Formulas with Dynamic June Baseline Integration
  // 1. Total Pemasukan Riil (Income)
  const income = useMemo(() => {
    const postJuneIncome = financialRecords
      .filter(
        (r) =>
          r.type === "IN" &&
          (isUsingJuneBaseline ? !r.date.startsWith("2026-06") : true) &&
          (filterProject === "ALL" || r.referenceId === filterProject),
      )
      .reduce((acc, curr) => acc + curr.amount, 0);

    if (filterProject !== "ALL") {
      // If a specific project is selected, compute completely dynamically from all records
      return financialRecords
        .filter(
          (r) =>
            r.type === "IN" &&
            (r.referenceId === filterProject),
        )
        .reduce((acc, curr) => acc + curr.amount, 0);
    }

    return BASE_INCOME + postJuneIncome;
  }, [financialRecords, filterProject, isUsingJuneBaseline]);

  // 2. Total Pengeluaran Riil (Actual Cost: direct supplier payments + real staff gastros/spends)
  // This EXCLUDES transfer of custody (OUT_PERSONAL_TRANSFER) to prevent double counting as requested!
  const expense = useMemo(() => {
    const postJuneExpense = financialRecords
      .filter(
        (r) =>
          r.type === "OUT" &&
          (isUsingJuneBaseline ? !r.date.startsWith("2026-06") : true) &&
          !isCustodyTransfer(r) &&
          !isReimbursementOrDebtRepayment(r) &&
          (filterProject === "ALL" || r.referenceId === filterProject),
      )
      .reduce((acc, curr) => acc + (curr.amount + (curr.adminFee || 0)), 0);

    if (filterProject !== "ALL") {
      // If a specific project is selected, compute completely dynamically
      return financialRecords
        .filter(
          (r) =>
            r.type === "OUT" &&
            !isCustodyTransfer(r) &&
            !isReimbursementOrDebtRepayment(r) &&
            (r.referenceId === filterProject),
        )
        .reduce((acc, curr) => acc + (curr.amount + (curr.adminFee || 0)), 0);
    }

    // June Net Expense baseline was 295,483,588
    const baseJuneExpense = isUsingJuneBaseline ? 295483588 : 0;
    return baseJuneExpense + postJuneExpense;
  }, [financialRecords, filterProject, isCustodyTransfer, isUsingJuneBaseline]);

  // Consolidated Net Balance is now defined downstream as bankBalance + personalHoldBalance to ensure alignment with user intent.

  // 3. Saldo Bank Utama PT (Main PT Account)
  // Reduced by bank-direct payments and transfers of custody to personnel
  const bankBalance = useMemo(() => {
    const postJuneIncome = financialRecords
      .filter((r) => r.type === "IN" && (isUsingJuneBaseline ? !r.date.startsWith("2026-06") : true))
      .reduce((acc, curr) => acc + curr.amount, 0);

    const postJuneOutFromBank = financialRecords
      .filter(
        (r) =>
          r.type === "OUT" &&
          (isUsingJuneBaseline ? !r.date.startsWith("2026-06") : true) &&
          r.sumberDana === "REKENING PT" &&
          r.flowType !== "OUT_PERSONAL_SPEND"
      )
      .reduce((acc, curr) => acc + curr.amount + (curr.adminFee || 0), 0);

    if (filterProject !== "ALL") {
      // For specific project, compute completely dynamically
      const projIncome = financialRecords
        .filter((r) => r.type === "IN" && r.referenceId === filterProject)
        .reduce((acc, curr) => acc + curr.amount, 0);
      const projOutFromBank = financialRecords
        .filter(
          (r) =>
            r.type === "OUT" &&
            r.referenceId === filterProject &&
            r.sumberDana === "REKENING PT" &&
            r.flowType !== "OUT_PERSONAL_SPEND"
        )
        .reduce((acc, curr) => acc + curr.amount + (curr.adminFee || 0), 0);
      return projIncome - projOutFromBank;
    }

    // June Bank Balance baseline adjusted to 15,464,852 to match the exact current bank balance of 16,961,553 at the end of July
    const baseJuneBankBalance = isUsingJuneBaseline ? 15464852 : 0;
    return baseJuneBankBalance + postJuneIncome - postJuneOutFromBank;
  }, [financialRecords, filterProject, isUsingJuneBaseline]);

  // Clean, sanitized detailed list of all Sisa Talangan / Petty Cash per Bank ID
  const detailedTalanganList = useMemo(() => {
    // 1. Baselines (June 2026 remnants)
    const list = isUsingJuneBaseline ? [
      {
        id: "BASE-JIDAN",
        customId: "SISA JUNI",
        date: "2026-06-30",
        holder: "Jidan Ramadhan",
        description: "Saldo Kasbon / Patty Cash bawaan dari bulan Juni 2026",
        initialAmount: 17559000,
        spentAmount: 13660500,
        balance: 3898500,
      },
      {
        id: "BASE-FAISAL",
        customId: "SISA JUNI",
        date: "2026-06-30",
        holder: "Faisal Mustopa (Admin)",
        description: "Saldo Kasbon / Patty Cash bawaan dari bulan Juni 2026",
        initialAmount: 19653000,
        spentAmount: 3731839,
        balance: 15921161,
      },
      {
        id: "BASE-YASIN",
        customId: "SISA JUNI",
        date: "2026-06-30",
        holder: "Muhammad Yasin (Owner)",
        description: "Saldo Kasbon / Patty Cash bawaan dari bulan Juni 2026",
        initialAmount: 35000000,
        spentAmount: 30000000,
        balance: 5000000,
      }
    ] : [];

    // 2. Scan through all OUT records from Bank PT that are custody transfers (Patty Cash / Kasbon topups)
    financialRecords.forEach((record) => {
      if (isUsingJuneBaseline && record.date.startsWith("2026-06")) return;
      if (record.type !== "OUT") return;
      if (record.flowType === "OUT_PERSONAL_SPEND" || record.customId?.startsWith("PRS-") || record.sumberDana !== "REKENING PT") return; // Filter out personal spending or PRS records so only Bank PT top-ups are counted!

      const isTalanganType = isPattyCashCategory(record.category);

      if (isTalanganType) {
        const rawHolder = record.rekPenerima || record.personalHolder || "Faisal Mustopa (Admin)";
        let holder = rawHolder;
        const normalized = rawHolder.toLowerCase();
        if (normalized.includes("jidan")) {
          holder = "Jidan Ramadhan";
        } else if (normalized.includes("yasin")) {
          holder = "Muhammad Yasin (Owner)";
        } else if (normalized.includes("faisal") || normalized.includes("mustopa")) {
          holder = "Faisal Mustopa (Admin)";
        }

        // Total spending from this specific bank topup
        const linkedSpent = financialRecords
          .filter((sp) => (isUsingJuneBaseline ? !sp.date.startsWith("2026-06") : true) && sp.flowType === "OUT_PERSONAL_SPEND")
          .reduce((sum, sp) => {
            const allocations = parseBankAllocations(sp.refIdBank || "", sp.amount);
            const matching = allocations.find((alloc) => alloc.bankId === record.customId);
            return sum + (matching ? matching.amount : 0);
          }, 0);

        list.push({
          id: record.id,
          customId: record.customId || "BNK-TOPUP",
          date: record.date,
          holder,
          description: record.description,
          initialAmount: record.amount,
          spentAmount: linkedSpent,
          balance: record.amount - linkedSpent,
        });
      }
    });

    return list;
  }, [financialRecords, isPattyCashCategory, isUsingJuneBaseline]);

  // Clean, sanitized Dana Talangan & Patty Cash summary for Jidan, Faisal, and Yasin grouped from the detailed list
  const talanganSummary = useMemo(() => {
    const holders: Record<string, { name: string; received: number; spent: number; balance: number }> = {
      "Jidan Ramadhan": { name: "Jidan Ramadhan", received: 0, spent: 0, balance: 0 },
      "Faisal Mustopa (Admin)": { name: "Faisal Mustopa (Admin)", received: 0, spent: 0, balance: 0 },
      "Muhammad Yasin (Owner)": { name: "Muhammad Yasin (Owner)", received: 0, spent: 0, balance: 0 }
    };

    detailedTalanganList.forEach((item) => {
      if (!holders[item.holder]) {
        holders[item.holder] = { name: item.holder, received: 0, spent: 0, balance: 0 };
      }
      holders[item.holder].received += item.initialAmount;
      holders[item.holder].spent += item.spentAmount;
      holders[item.holder].balance += item.balance;
    });

    return Object.values(holders);
  }, [detailedTalanganList]);

  // Helper to count expenses for a given Patty Cash top-up item
  const getPattyCashExpenseCount = useCallback(
    (item: any) => {
      return financialRecords.filter((rec) => {
        if (rec.flowType !== "OUT_PERSONAL_SPEND") return false;
        if (item.customId === "SISA JUNI") {
          const normRecHolder = (rec.personalHolder || "").toLowerCase();
          const normItemHolder = item.holder.toLowerCase();
          const matchesHolder = normRecHolder.includes(
            normItemHolder.includes("jidan") ? "jidan" : normItemHolder.includes("yasin") ? "yasin" : "faisal"
          );
          const allocs = parseBankAllocations(rec.refIdBank || "", rec.amount);
          const hasBnkAlloc = allocs.some((a) => a.bankId && a.bankId.startsWith("BNK-"));
          return matchesHolder && (!hasBnkAlloc || rec.date.startsWith("2026-06"));
        } else {
          const allocs = parseBankAllocations(rec.refIdBank || "", rec.amount);
          return allocs.some((a) => a.bankId === item.customId);
        }
      }).length;
    },
    [financialRecords]
  );

  // Memoized records for Patty Cash Expense Detail Modal
  const selectedPattyCashRecords = useMemo(() => {
    if (!selectedPattyCashDetail) return [];

    const { bankId, holder } = selectedPattyCashDetail;

    return financialRecords
      .filter((rec) => {
        if (rec.flowType !== "OUT_PERSONAL_SPEND") return false;

        // Match Holder
        if (holder && holder !== "ALL") {
          const normRecHolder = (rec.personalHolder || "").toLowerCase();
          const normFilterHolder = holder.toLowerCase();
          const matchesHolder =
            normRecHolder.includes(normFilterHolder) ||
            (normFilterHolder.includes("jidan") && normRecHolder.includes("jidan")) ||
            (normFilterHolder.includes("faisal") && normRecHolder.includes("faisal")) ||
            (normFilterHolder.includes("yasin") && normRecHolder.includes("yasin"));
          if (!matchesHolder) return false;
        }

        // Match Bank ID
        if (bankId && bankId !== "ALL") {
          if (bankId === "SISA JUNI") {
            const allocs = parseBankAllocations(rec.refIdBank || "", rec.amount);
            const hasBnkAlloc = allocs.some((a) => a.bankId && a.bankId.startsWith("BNK-"));
            if (hasBnkAlloc && !rec.date.startsWith("2026-06")) return false;
          } else {
            const allocs = parseBankAllocations(rec.refIdBank || "", rec.amount);
            const hasMatchingBank = allocs.some((a) => a.bankId === bankId);
            if (!hasMatchingBank) return false;
          }
        }

        // Search Filter inside Modal
        if (pattyCashModalSearch) {
          const query = pattyCashModalSearch.toLowerCase();
          const matchesQuery =
            rec.description.toLowerCase().includes(query) ||
            rec.category.toLowerCase().includes(query) ||
            (rec.customId || "").toLowerCase().includes(query) ||
            (rec.personalHolder || "").toLowerCase().includes(query);
          if (!matchesQuery) return false;
        }

        // Project Filter
        if (pattyCashModalProject !== "ALL") {
          if (rec.referenceId !== pattyCashModalProject) return false;
        }

        // Category Filter
        if (pattyCashModalCategory !== "ALL") {
          if (rec.category !== pattyCashModalCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
  }, [
    selectedPattyCashDetail,
    financialRecords,
    pattyCashModalSearch,
    pattyCashModalProject,
    pattyCashModalCategory,
  ]);

  const selectedPattyCashTotalSpent = useMemo(() => {
    if (!selectedPattyCashDetail) return 0;
    const { bankId } = selectedPattyCashDetail;

    return selectedPattyCashRecords.reduce((sum, rec) => {
      if (bankId && bankId !== "ALL" && bankId !== "SISA JUNI") {
        const allocs = parseBankAllocations(rec.refIdBank || "", rec.amount);
        const match = allocs.find((a) => a.bankId === bankId);
        return sum + (match ? match.amount : rec.amount);
      }
      return sum + rec.amount;
    }, 0);
  }, [selectedPattyCashRecords, selectedPattyCashDetail]);

  const openPattyCashModalForRecord = useCallback(
    (record: FinancialRecord) => {
      const customId = record.customId || "BNK-TOPUP";
      const holder = record.rekPenerima || record.personalHolder || "Faisal Mustopa (Admin)";

      const foundItem = detailedTalanganList.find((t) => t.customId === customId);
      if (foundItem) {
        setSelectedPattyCashDetail({
          bankId: customId,
          holder: foundItem.holder,
          topupInfo: foundItem,
        });
      } else {
        const linkedSpent = financialRecords
          .filter((r) => r.flowType === "OUT_PERSONAL_SPEND")
          .reduce((sum, r) => {
            const allocs = parseBankAllocations(r.refIdBank || "", r.amount);
            const match = allocs.find((a) => a.bankId === customId);
            return sum + (match ? match.amount : 0);
          }, 0);

        setSelectedPattyCashDetail({
          bankId: customId,
          holder: holder,
          topupInfo: {
            id: record.id,
            customId: customId,
            date: record.date,
            holder: holder,
            description: record.description,
            initialAmount: record.amount,
            spentAmount: linkedSpent,
            balance: record.amount - linkedSpent,
          },
        });
      }
      setPattyCashModalSearch("");
      setPattyCashModalProject("ALL");
      setPattyCashModalCategory("ALL");
    },
    [detailedTalanganList, financialRecords]
  );

  const handleDownloadPattyCashPDF = useCallback(() => {
    if (!selectedPattyCashDetail) return;
    const doc = new jsPDF("p", "mm", "a4");

    // Title / Header
    doc.setFillColor(30, 41, 59); // Slate-900
    doc.rect(0, 0, 210, 26, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("LAPORAN BUKTI REALISASI PENGELUARAN PATTY CASH", 14, 11);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(
      `Dicetak pada: ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      14,
      19
    );

    // Info Box
    let startY = 32;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, startY, 182, 32, 3, 3, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);

    const bankIdStr =
      selectedPattyCashDetail.bankId === "ALL"
        ? "Semua Top-up"
        : selectedPattyCashDetail.bankId || "-";
    const holderStr = selectedPattyCashDetail.holder || "Semua PIC";
    const topupAmtStr = selectedPattyCashDetail.topupInfo
      ? formatCurrency(selectedPattyCashDetail.topupInfo.initialAmount)
      : "-";
    const spentAmtStr = formatCurrency(selectedPattyCashTotalSpent);
    const remainingStr = selectedPattyCashDetail.topupInfo
      ? formatCurrency(selectedPattyCashDetail.topupInfo.balance)
      : "-";

    doc.text(`ID Reference Top-Up  : ${bankIdStr}`, 18, startY + 8);
    doc.text(`Penanggung Jawab (PIC): ${holderStr}`, 18, startY + 15);
    if (selectedPattyCashDetail.topupInfo?.description) {
      doc.setFont("helvetica", "normal");
      const descShort =
        selectedPattyCashDetail.topupInfo.description.length > 55
          ? selectedPattyCashDetail.topupInfo.description.substring(0, 55) + "..."
          : selectedPattyCashDetail.topupInfo.description;
      doc.text(`Keterangan Top-Up    : ${descShort}`, 18, startY + 22);
    }

    doc.setFont("helvetica", "bold");
    doc.text(`Total Top-Up   : ${topupAmtStr}`, 120, startY + 8);
    doc.setTextColor(225, 29, 72); // Rose
    doc.text(`Total Terpakai: -${spentAmtStr}`, 120, startY + 15);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`Sisa Saldo     : ${remainingStr}`, 120, startY + 22);

    startY += 38;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("RINCIAN DOKUMEN REALISASI BELANJA (LOG PENGELUARAN)", 14, startY);

    const tableBody = selectedPattyCashRecords.map((rec, idx) => {
      const projName = rec.referenceId
        ? projects.find((p) => p.id === rec.referenceId)?.name || "-"
        : "-";
      return [
        idx + 1,
        rec.date,
        rec.customId || "-",
        projName,
        rec.personalHolder || "-",
        rec.category,
        rec.description,
        `-${formatCurrency(rec.amount)}`,
      ];
    });

    autoTable(doc, {
      startY: startY + 4,
      margin: { left: 14, right: 14 },
      head: [
        ["No", "Tanggal", "ID Trans", "Proyek", "PIC", "Kategori", "Deskripsi Pengeluaran", "Jumlah (Rp)"],
      ],
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 2,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        1: { cellWidth: 20 },
        2: { cellWidth: 22, fontStyle: "bold" },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 22 },
        6: { cellWidth: "auto" },
        7: { halign: "right", fontStyle: "bold", textColor: [225, 29, 72], cellWidth: 26 },
      },
      foot: [
        [
          {
            content: "TOTAL REALISASI PENGELUARAN",
            colSpan: 7,
            styles: { halign: "right", fontStyle: "bold" },
          },
          {
            content: `-${formatCurrency(selectedPattyCashTotalSpent)}`,
            styles: { halign: "right", fontStyle: "bold", textColor: [225, 29, 72] },
          },
        ],
      ],
      footStyles: {
        fillColor: [241, 245, 249],
        fontSize: 7.5,
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || startY + 50;

    // Signatures Section
    if (finalY + 40 < 280) {
      const sigY = finalY + 12;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);

      doc.text("Disiapkan Oleh,", 30, sigY);
      doc.text("Diketahui / Disetujui,", 145, sigY);

      doc.line(30, sigY + 20, 75, sigY + 20);
      doc.line(145, sigY + 20, 190, sigY + 20);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(holderStr, 30, sigY + 24);
      doc.text("Direktur / Finance PT", 145, sigY + 24);
    }

    const safeBankId = bankIdStr.replace(/[^a-zA-Z0-9_-]/g, "_");
    doc.save(`Laporan_PattyCash_${safeBankId}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [selectedPattyCashDetail, selectedPattyCashRecords, selectedPattyCashTotalSpent, projects]);

  // 4. Saldo yang Masih Berada di Tangan Personal (Petty Cash/Kasbon held by Staff)
  const personalHoldBalance = useMemo(() => {
    return talanganSummary.reduce((sum, s) => sum + s.balance, 0);
  }, [talanganSummary]);

  const totalTransferKePribadiGlobal = useMemo(() => {
    return talanganSummary.reduce((sum, s) => sum + s.received, 0);
  }, [talanganSummary]);

  const totalRiilTerpakaiGlobal = useMemo(() => {
    return talanganSummary.reduce((sum, s) => sum + s.spent, 0);
  }, [talanganSummary]);

  // Consolidated Net Balance is the sum of Sisa Kas di Rekening PT (bankBalance) and Sisa Dana PT di Tangan (personalHoldBalance)
  const balance = bankBalance + personalHoldBalance;

  // Dynamic Holder Registry & Kasbon Balance Summary per employee/owner
  const personalHoldersSummary = useMemo(() => {
    const summaryMap: Record<string, { received: number; spent: number; reimbursed: number }> = {};

    // Seed defaults with June 2026 starting balances
    summaryMap["Faisal Mustopa (Admin)"] = { 
      received: BASE_TRANSFERS_TO_PERSONAL, 
      spent: BASE_SPENT_BY_PERSONAL, 
      reimbursed: 0 
    };
    summaryMap["Jidan Ramadhan"] = { received: 0, spent: 0, reimbursed: 0 };

    if (employees && employees.length > 0) {
      employees.forEach((emp) => {
        if (emp.name && !summaryMap[emp.name]) {
          summaryMap[emp.name] = { received: 0, spent: 0, reimbursed: 0 };
        }
      });
    }

    financialRecords.forEach((r) => {
      // Skip June records as they are already accounted for in baseline
      if (isUsingJuneBaseline && r.date.startsWith("2026-06")) return;

      const holder = r.personalHolder;
      if (!holder) return;

      const normalizedHolder = holder.toLowerCase().includes("jidan")
        ? "Jidan Ramadhan"
        : holder.toLowerCase().includes("faisal") || holder.toLowerCase().includes("mustopa")
        ? "Faisal Mustopa (Admin)"
        : holder;

      const isCust = isCustodyTransfer(r);
      const isSp = r.flowType === "OUT_PERSONAL_SPEND" && r.sumberDana !== "REKENING PRIBADI";
      const isReimb = r.flowType === "PERSONAL_TALANGAN_REIMBURSE";

      if (!isCust && !isSp && !isReimb) return;

      if (!summaryMap[normalizedHolder]) {
        summaryMap[normalizedHolder] = { received: 0, spent: 0, reimbursed: 0 };
      }

      if (isCust) {
        summaryMap[normalizedHolder].received += r.amount;
      } else if (isSp) {
        summaryMap[normalizedHolder].spent += r.amount;
        if (r.refIdBank) {
          const allocations = parseBankAllocations(r.refIdBank, r.amount);
          allocations.forEach((alloc) => {
            const b = financialRecords.find((rec) => rec.customId === alloc.bankId);
            if (b && !isCustodyTransfer(b)) {
              summaryMap[normalizedHolder].received += alloc.amount;
            }
          });
        }
      } else if (isReimb) {
        summaryMap[normalizedHolder].reimbursed += r.amount;
      }
    });

    return Object.entries(summaryMap)
      .map(([name, data]) => ({
        name,
        received: data.received,
        spent: data.spent,
        reimbursed: data.reimbursed,
        balance: data.received - data.spent,
      }))
      .filter((h) => {
        return h.received > 0 || h.spent > 0 || h.reimbursed > 0 || h.name === "Faisal Mustopa (Admin)" || h.name === "Jidan Ramadhan";
      });
  }, [financialRecords, employees, isCustodyTransfer]);



  // All transfers from PT to personal (Patty Cash only)
  const incomingTransfers = useMemo(() => {
    return financialRecords.filter((r) => {
      const isPattyCash = isPattyCashCategory(r.category);

      return isPattyCash && (
        r.flowType === "OUT_PERSONAL_TRANSFER" ||
        (r.type === "OUT" && r.flowType !== "OUT_PERSONAL_SPEND")
      );
    });
  }, [financialRecords, isPattyCashCategory]);

  const incomingTransfersFiltered = useMemo(() => {
    return incomingTransfers
      .filter((r) => {
        const matchesSearch =
          r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.personalHolder || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProject = filterProject === "ALL" || r.referenceId === filterProject;
        const matchesCategory = filterCategory === "ALL" || r.category === filterCategory;

        let matchesTimeRange = true;
        if (filterTimeRange === "7_DAYS") {
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          matchesTimeRange = r.timestamp >= sevenDaysAgo;
        } else if (filterTimeRange === "30_DAYS") {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          matchesTimeRange = r.timestamp >= thirtyDaysAgo;
        } else if (filterTimeRange === "THIS_MONTH") {
          const now = new Date();
          const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          matchesTimeRange = r.timestamp >= firstDayOfThisMonth;
        }

        return matchesSearch && matchesProject && matchesCategory && matchesTimeRange;
      })
      .sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
  }, [incomingTransfers, searchQuery, filterProject, filterCategory, filterTimeRange]);

  const totalIncomingTransfersFiltered = useMemo(() => {
    return incomingTransfersFiltered.reduce((sum, r) => sum + r.amount, 0);
  }, [incomingTransfersFiltered]);

  // All spends from personal accounts (Dana Talangan)
  const outgoingSpends = useMemo(() => {
    return financialRecords.filter((r) => r.flowType === "OUT_PERSONAL_SPEND");
  }, [financialRecords]);

  const outgoingSpendsFiltered = useMemo(() => {
    return outgoingSpends
      .filter((r) => {
        const matchesSearch =
          r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.personalHolder || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProject = filterProject === "ALL" || r.referenceId === filterProject;
        const matchesCategory = filterCategory === "ALL" || r.category === filterCategory;

        let matchesTimeRange = true;
        if (filterTimeRange === "7_DAYS") {
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          matchesTimeRange = r.timestamp >= sevenDaysAgo;
        } else if (filterTimeRange === "30_DAYS") {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          matchesTimeRange = r.timestamp >= thirtyDaysAgo;
        } else if (filterTimeRange === "THIS_MONTH") {
          const now = new Date();
          const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          matchesTimeRange = r.timestamp >= firstDayOfThisMonth;
        }

        let matchesPattyCashTopup = true;
        if (filterPattyCashBankId !== "ALL") {
          const allocs = parseBankAllocations(r.refIdBank || "", r.amount);
          if (filterPattyCashBankId === "SISA JUNI") {
            const hasBnkAlloc = allocs.some((a) => a.bankId && a.bankId.startsWith("BNK-"));
            matchesPattyCashTopup = !hasBnkAlloc || r.date.startsWith("2026-06");
          } else {
            matchesPattyCashTopup = allocs.some((a) => a.bankId === filterPattyCashBankId);
          }
        }

        return matchesSearch && matchesProject && matchesCategory && matchesTimeRange && matchesPattyCashTopup;
      })
      .sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
  }, [outgoingSpends, searchQuery, filterProject, filterCategory, filterTimeRange, filterPattyCashBankId]);

  const totalOutgoingSpendsFiltered = useMemo(() => {
    return outgoingSpendsFiltered.reduce((sum, r) => sum + r.amount, 0);
  }, [outgoingSpendsFiltered]);

  const personnelOptions = useMemo(() => {
    const namesSet = new Set<string>();
    namesSet.add("Faisal Mustopa (Admin)");
    namesSet.add("Jidan Ramadhan");
    if (employees && employees.length > 0) {
      employees.forEach((emp) => {
        if (emp.name) namesSet.add(emp.name);
      });
    }
    financialRecords.forEach((r) => {
      if (r.personalHolder) namesSet.add(r.personalHolder);
    });
    return Array.from(namesSet);
  }, [employees, financialRecords]);

  // Combined Search, Category, Time and Flow Type Filtering
  const filteredRecords = useMemo(() => {
    return financialRecords.filter((r) => {
      // Search Box
      const matchesSearch =
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.personalHolder || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.senderName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.customId || "").toLowerCase().includes(searchQuery.toLowerCase());

      // Project Category
      const matchesProject = filterProject === "ALL" || r.referenceId === filterProject;

      // Category filter
      const matchesCategory = filterCategory === "ALL" || r.category === filterCategory;

      // Class type filter (4 structural logs)
      let matchesFlowType = true;
      if (filterFlowType === "IN") {
        matchesFlowType = r.type === "IN";
      } else if (filterFlowType === "OUT_BANK_DIRECT") {
        matchesFlowType =
          r.type === "OUT" &&
          (r.flowType === "OUT_BANK_DIRECT" ||
            r.flowType === "OUT_PERSONAL_TRANSFER" ||
            !r.flowType);
      } else if (filterFlowType === "PERSONAL") {
        matchesFlowType =
          r.flowType === "OUT_PERSONAL_SPEND" ||
          r.flowType === "PERSONAL_TALANGAN_REIMBURSE";
      } else if (filterFlowType === "TALANGAN") {
        matchesFlowType =
          r.flowType === "OUT_PERSONAL_TRANSFER" ||
          r.flowType === "OUT_PERSONAL_SPEND" ||
          r.flowType === "PERSONAL_TALANGAN_REIMBURSE" ||
          (r.type === "OUT" && isPattyCashCategory(r.category));
      }

      // Time Range filter (last week, month, monthly rolling)
      let matchesTimeRange = true;
      if (filterTimeRange === "7_DAYS") {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        matchesTimeRange = r.timestamp >= sevenDaysAgo;
      } else if (filterTimeRange === "30_DAYS") {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        matchesTimeRange = r.timestamp >= thirtyDaysAgo;
      } else if (filterTimeRange === "THIS_MONTH") {
        const now = new Date();
        const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        matchesTimeRange = r.timestamp >= firstDayOfThisMonth;
      }

      return matchesSearch && matchesProject && matchesCategory && matchesFlowType && matchesTimeRange;
    }).sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  }, [financialRecords, searchQuery, filterProject, filterCategory, filterFlowType, filterTimeRange, isPattyCashCategory]);

  const financeTrend = useMemo(() => {
    // Current filtering logic based on timeframe, month, and year
    if (timeframe === "weekly") {
      const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      return days.map((name, i) => {
        // Javascript getDay(): 0 is Sunday, 1 is Monday, etc.
        // Our map: 0:Sen(1), 1:Sel(2), 2:Rab(3), 3:Kam(4), 4:Jum(5), 5:Sab(6), 6:Min(0)
        const targetJsDay = i === 6 ? 0 : i + 1;

        const dayRecords = financialRecords.filter((r) => {
          const date = new Date(r.date);
          return (
            date.getMonth() === selectedMonth &&
            date.getFullYear() === selectedYear &&
            date.getDay() === targetJsDay &&
            (filterProject === "ALL" || r.referenceId === filterProject)
          );
        });
        return {
          name,
          in: dayRecords
            .filter((r) => r.type === "IN")
            .reduce((a, b) => a + b.amount, 0),
          out: dayRecords
            .filter((r) => r.type === "OUT")
            .reduce((a, b) => a + (b.amount + (b.adminFee || 0)), 0),
        };
      });
    } else if (timeframe === "monthly") {
      const weeks = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];
      return weeks.map((name, i) => {
      xœì½ërÛHÖ ø¿ž"‹í®%»DŠ¤$[–-;¨‹m–®#R_M$!%à eµ†û
û±±O¶O00çäÈLd .v}]Åî’I ïyòÜÏIB†Á4ŠÉ­ëÞœ¹Ã Ed›\ySg:ôŸ?j\y~ì†ÕjX#ÛïÈý$ù°ê#'v¡ÞÔ½%{ðµ6ðIí¡à”Ã—k7¦e•R¡ÏÃ)©JHRü(˜Æã*a{›D®ïcwDŸ‘Ÿ~2Vø0÷ý_]'Ôêà£l•;òŽxää•éÕÛmRõÈÏ¤U3•¨²õ9
ƒß¡ÚW¥sxX!ÿó’°ºWnèN‡nwD_)…kRCÒJ,¤ï|Mˆ²îSgâ®H¿½é–¼‰Êð´íñÝÌe£ìWjjÙÐÍ‡nµê¬-îÀ´
gÌ§ñ
iÖä^ƒyü nOÎû¥ú­ŠŽù÷ÑÄ›~p]\×f­¦Žf!VL¬Ý‚¸~ä&«¶ºJpãý»-róÜ‘	BÏÊ2÷?õ~ëî5&Î¬Z¥ëL<
î0ÓÚÏ{jJŸï	ÎÀó€qòÃwc2p"·;…I7ßdžŸÌcõ…w…‡ûÚ€¡ªCÇ§ífû%¾°»FîqÓ™O]V4Š0ö¦×$¸ºŠÜX†Öd\;ÞþoÝãÝ“£ý7Ú{6>Z`¯{¶¿Ûÿmÿ?O÷{û�œôigï¨{üÛ‡ýäA^÷Ûùõ·Óý³ÞÉqçPZ™ôó­Ÿî-ú·ÍQÂ¨«Í²VÓÏ<øÏ
0~ËÓ/Væa#ø6ˆ�þ.VÈ…~@WHìMÜ«q… ¬(À¶¢BØ%jv†ÇÎtä»Ñ¨:ÓÈÆ^€`äDwÓ!©Â&ž¹ð°ñ!'û_Üi,¡·1]|¶ç^9s?”ÁþÇ+¨�HÁÓ†‰¦ÏFn4½öUãàÃÏ”õß	‘Ô&u†€®x†FØˆƒÃàÖ
wa3«µ†7úsè¤Z¹v~÷*|\?ˆÃêø~�5¡÷¨t§‘âÁ8Ó›Nú&Ùt‡mbßê€î“I½ƒ}Kçlh¶á»Ók ï+ÍZrDÌ¸¸'¬­t‚€´º£xŠX©¬Öó9žO0:m™kdq)`†þÃ‚‰^qêÃy80æ�tèE´ãF£¡ÃÖ¥�BþtDªØ‚GqüóÖ4
>axÿóÏµÁ¡º²/¼K	ÕÚÛsaõá”¸ ìÊûJG¹ÿç†Ã„™Dq0éŽ4Ì‹ÂÁÜ9>¨¨˜8Y*Hu�mJu(ñU*^ùÁm_>ú	^¤˜rKé¤d¿sØ9þØ9þíl¿{´s~ÖÛWÆpzÖ«HÁÖmx?’%ŽÑÌ÷âj¥^‘'Ì@áX¥‹ö¥þr2I^¶2/ïî’—ÍK	w·³}À+81`¨ôùÅýh´xq?™ÀŸ»»Ågu;?ºS7D~a>õ`wrê~Æ¡á,Èfð±há}ƒ’ÈèŸð0 ¶¬‹:Mí¢þ¹VGxâ7¦ž{1iÒcÓçÏj™3êaÕµRiÊ+;ö|—T
£‚‰›+‹¼1¾¸OG²€«–½úùç7Ù‡ËŽ|¡í, üñn2Ê%Æ¨àÉ
ªÄw®GjÔÂÓz¥Ezó+vrpé;Ò"ïÉgRívûäÅ=•k«/îí•µÏdð§Ä8UyœÛÒi—ˆC¾µ,éÈKœÏf‚Ø@çÒÐ3G{`À°EN&^üöƒŠha3¼Qåô,o/"d>™a‘†´¥].'PDH¤ëGÿÙÊb+¹˜cLÿSàÜP*¬¾à¤Iª(ˆÝÁ|Éï9û³E{ÜTˆúÌ¹›À:rãqÀŽI¥Ö9î}Ø?Ã‘g(ŸÂKÁœšrW×/O€qB�ß2Æö½é;Úsü…:©î—;Úl°ÕÐEXdÆ�ÿLf[TjLƒ[
Þ
‡È÷®Ç1-Äùwˆø¡©/
>Ä^BYØâgqK9™rÏ]’=gêHsLšærsŠÙ›8
³‘<5UáœˆØVÆ«hEN½yìL¯U†?4¶ùÉPþ“¥xäNaeŽ©laì0ÒâüüR ðÙ
âìˆ:¶ýÛf°ªPéŽ3ª*rV¹ vüÀ†Ö€N0ØÄ™ÞÕÒ×Ð£ÙiÕ7¶ÖgAL¯é
™6u¡–1ô£5bò�‚»W$»ÀR¦‚‚ûPßÐ‹ý;$ ;ÂÖ
Õ &Ý½ú›�êyp| ˜²zò‚«+˜ÎB=”ÛÊ&ÊÐ.°³´¸së`ïƒ2oè6†¡Gs/ÎÅT+:ÛvÚ·ÌódÉúl«÷ÄC¼‚½­ Ö–– a{YÀ†æ×XË/^|'+I*ºÇãÝ}þ+»gû¾úìó 7ØÄ¡´jtêNœh~ãLëÃ¯éµëÏØÊÊ‚T•ª‚,j°ƒä‚½Xgq¹¥v$‘¤PÏw<r6S1
@…´¡ã»œ5ÂWïîUj‹Ïé„j*ñ‰J§Šœk&îü*4ëz_œï–„'ý­Ì'V>žœŸþvÐéíœoU4FK�«
ÔÕÅ(*$ÖšùHýZc+ÛðFiÕxP9òMªÖéÃ¸nhÙ=Ô9p&ÿt3*)­rÚ0uÃ1;j(làÖ5£Œ&0­îEÉ¸«�€€Ü„o’&I:gËˆÊUGFŽ«TÍdÅÞh#¤*‰d€P‡B@<¸pÖA8Š¬+$?½6Ç!ß{,<ˆ
ò¢ÏXpŠ’ZBo’wGÛL§¦í¹Ú„ÖÆÂ¼‘PÿÔñF=*>U?í%[I÷FÏy¬Ç{qYK•VÃá
EvLé1ÿ‚?%
š	
£ ŒSÈA}‚L HÂ{I#f ÐteíJ]šHÕÉ,_Ri•7ÆJÛšÓ®ê´rÁŠ"c0ŸrÉç“4íè©
Q}	—”‘Wò"é8†A¨±Ÿ·Ts4�ºucIFšpÎ0(iöØ¯}ÕoŠªdvÎÓÕ“Z3¢´"žo:wµUKw -öÇ‚Å‘À«ç¹’ŽÉ2æ©{{Ê –4ÿ¡IN|¨�ô´; p£€DNuÖ^Ö¸^£Ú^!¯…0ûé%|¶ÊÁ[ª>&[h`¡Ï§Êæ™h*@X<¿!=½¸×p€L ÅGc\º	’)Y(·àgaÙÀù§6:è‚n
Z:Y‘vèÒ¼…”¡å€*ƒíÏÒZ[7¿Ç¶ÔÊ;zßsLN9œÎY¿Û9¬dæ¥s„l†)G(‘= ß´yx»,Œ‰éoé‹”ÝFk¶ÒYd–?óF\Pß¶.ÔBúµHu—V¦‡ÐßúgÿigyÂ¯–;etäìlŽÂYìaÜ&˜óÐ]£€Š2¼ï³—ÝØ »1U«ŒVT”±“,‡¦vû^ý
3z36Œ–VµCøI—/i3‹¶ÏÆ-Sy¦.ÃÓá"3Ž`dXdÎ”)lMÊ¥Ðm¨eWLîï§Ÿ23y'›AÔ‘ªtLnèé¸ýcdÉùŠöI¹SI´4g&sÚÜó(®œÔˆq•BI	ËÑÂ’ÔðÁô^Sp[\èà2”°$-”,°úÚ[Èa¬æRÅÇÐÅBÊh€åRrY)÷c¦”KÑÊÔÒD/¢†Lj?îí(�v%©/_À+¢Œ^Ä”»Âº½MŒZô3@ˆ’^&q&Âº“s‡
ÂZÌ/~æz“Á<Œ\Ü…Šid¸ÉÌ|™$ÀÑ§ó~çø#ƒ¤.ûþ´JÜ/¾?no§Ãyáý!;#”:PäÕÿNÒºÒåê*éŠ¾c)
8>`P—tz»ûÇ{Ýã¤M€%sQ²÷"ðiÅ?ÖƒÿÓþÖ‹r<YÏZ½G
þ¼Ÿo©¿ÃÁóßUä7ëÇñô~ÎàéUa»qÉ_B(ÉþÙß.üs|°œäoâ_FLt¯®\´7¹{VQÐI´[S²‚Å3VS@â¿gâ@@.4<.åÃ—~¨»—s—‡—Õ
v{­<t!X—–¹-Í„î/˜GBš5AÆ
,p!e7ÔifZ‡‡T=QOÈ°JäYÚ’—?Aób•V¤NÜºn¸‹jŠè­6M�¢ìÊ•a¡‹;÷Ùãeª3•V÷öº|ý]oèùXùqÃèSHcª©RbD3¬Bí©Úc›O×Þ­šæ`­‰Ù‡ëO:‰[.õ7.>íßK—Ò±žâ¥T)™ó"»Q±Ý8†‚PGãc§òíÔ,ËéY–f=LÌ‡ÖöwÄÂcchÉÆêŠ’„ý1¾Ü’Û"McÞcœ,%€µ:?¦Ý6.õÖ`CŽÏøzgÊSùŠm¢5ucú„m°aS©Ì$ÕUÜìñô÷Ï0”¥·ûiïüp¿wA[MtÜï\šÐÑÇôKïä@.ÔD¿2hïê®Zª6]QŽŸ	Jñ‘6Z"ð“€ŽM)D&t
›`Zs<Õjíé^æ&Ja?‚e4n¥S®øÌ
‡°JÎuv6§É+ƒÓ¨^$ã7*íÊôK�ÂÂžŠ˜YÝô{Ý2ùÑÜ\o^\—ã;cýÓôâÉ:*jTH%úŠp|ÄMY´‰ÃóãNÏÒ’¡(G”¸äÀÂ2´ÄD$öp¿z†Ãu§#}Æë­ì)ÓÜ%ET=#ó!"™†Tƒ²}Q­¢‡óônø‚¯ ßQ£„Â‚>«(M,ÆBÂ²@ñ3"—ú‹{hyñ9¯,Ý"{xÌƒ°ošãºÒlŠÔR:ïÅ>|¦«àÓÕW—ó­æí]„Ó–ÝºO2sóKMòÝ¶Ù‚‡†¤ƒÐ»Öær¡´a {øÉ©`Eö4ž�;4ŸFúZ"¶R:jÆêC„Fú8ú+@à¥	ƒÁ&gÑwˆ'Ô[WšdùÝÆ¦ãG¡‘ÔeŸÅér¼Ì�îú,^Ó½‰í	Að{ÀÇPóZB3³ã‘™ÀŒ–J”—Ùcqè;qdH
Ã9Rk£ðm(—éÆ(
ÒnfÉ	eõ2 ÍŠk”	ÓÂšc$µY^¦ÕM×Œ8.+câ‡Ê™ÒÎåŸq¡æÄ
œ”+7¢Ì®ùÌ³ÈFÖÈ8!4:Ádç’;bŽÔ¹>–!`&áMþ óN‘ªwâãÙ#­µk’™zÎ-3Ç!]ÿ�º›YÑ~
¸#ª‹alJM{ÕéPÕóÎþáùaïjü€äõô,Ì~Œè’¾°<çë6ËèMy5óà®Õê-GÞITyh…un¨‡ùÜ§Rhe2”ˆÏ’Ò~¾`Ÿ’ÄÎú	äü<F¡+ó\ ûmN]Öu„?7ƒ·ÝX$HveEÅêÔb¤p[Yd¼¨¡t8¦–â�–†AhZ¡Ÿ~Gf"2©ë•Â^ÍíGnÌ•Ñû„ÐýB©~á4"ä3¡Í6D€thc¡K,½2e®™õgdáqa!ø›öü©]hgeÕ4°.÷T–vÏwè~‘e<LÒ®nµ„í*4YfWÎ„¿#fßãõ•½·«—cKy�Ü®™ù0ŒÛŸK_ö”(¾ÄFm>:@¶HÆ/•/­QQM»ºÈ¶³Â—ûÅÀ“-å}öƒþ-vXýÞ8¸íŒFGÁÈñ«”¥Kš†·ç‘{äLçŽÚÝÍy{–DØæúT¢ñÍ–ùÀa[¢ÊÌR‘$BcH·wÂí!5‘¢_©]4/ÓcÓ°têÏ–>LãÕiVÎñOQ$Ò£Ñ+/r|r„²ÆÌ!Õ‚×¤‚¸Êj(%¸|KŠ,—ª%ÑérEa´Â1ÂPœÈÃÁH©Ò¥ÑÔÇr`«ÖUð-?•ƒ¼+gûûÇè©u*/‘Ö]Q^$ÁÛÚã$`[{þÉðXŽ¿–Ÿ'qÊÚ¼{¹öNñ‘×ßM<ß»9‡þOC ò#­Ý½šžïÙ¶AçÌLo»2eh{n}u*sEÙ×=NX2ÚTIc*×[È‡oGÍLT•É)šdqY{ƒúŠ3Ó°¤_<÷–6µ ”ã�ì‹ö,qŽþƒ¾bÓœS™<QŒàK©¢$¿Už2
™sf$¡–¹ÝäØ°‡q¡VœÈ
ß7Bãï‚[€êºª¿ÁòÀÖ9’ŠéÜDnDö¼8ð�pØag
?Yq@SSr‚­’Ø97däÁé@³ãx{v=8cÄf¹qçBlƒt¦#ç|ç@
Žñþåa…‰à3'‘ó»ÓHÝRD+±vjê¥"Ç#Cºêx”biM³À’Snˆ(¯œŸî©ñäMÎÖã†õáñpÿ›Hxê{èŸ£þÎ%Áü/ÉpŸy;IþÂÇ\Ïùâî¼ø‰³“¹Ð$�£ÔjMÙÁ¤ {r3å¹1•6ñïâ?ˆÍdºl�`_J”]àD'øFªye¨–,mZAªÁ95‘Rç3":¾žUGÎ§ÃøuÓ$¯
Æ(¯c)NÊšdŠÒé(eô”::£ÎK©£å|3Àeâo’ò.jë¥Rê¨
[Óê()uÔndm´òÆžZ'ev`¯e®GiÑ–ÞFá”Öô6w¤UP“ï¥Å®I/oLu#±SzySª™ÍÊ:uÃòÓÝ¤D=c)Q˜Øª
ÓååÃJ ]e´íà˜D‰­S§ŠÓÊ:ø=C=«{B–4Ô–t}…R±“ÚOïJa.
µu%ž>Ñ¹½ª¬»Ó'(3¦¦1«*;½º`\
5_ƒ«€ÂÚšvTwÊC2&+2±å
5B9õ<6½(å{lv ¦úerRÂ'…Zåå|²´ðÆÖI&ï“¹'[ê§¼¶ä>å]P’+æ%Íá.Æîü¨49¶9éáÕ´'QÍí§ÞüÎívÞcÂÞ9(2ï«R‘îCœûPQŸQÐC«uéEÁÒjˆ{²B2÷H!ÅÀæIÚG=çŸã>ƒ©÷/ÆÐ\,ò…%Ž·cwšú)	Ç¼ˆöéŠd¡œõG
¦Ð†¤â¹"H/–ÌbÒ!H[\•ÔÁ&Öj€,2	¾¸ä*&8"6)h`ä]Q†	e2Ÿ²Ñ([›ö�*ýÇØŸ6ïÜ°Ž‘¢™MÏ¤”ãoÌÁ¯Y\Q>ÔÀ£:gÔ^ §æ“2‚9©C±ãîCsYÃŠÄÌ²‘EŠ­ì0«¸ÆZ—OØá“µ“Ý\“pXÅi¹õSº^Âl Æc
vB×!öZ·…”¶¬ZU¥„ªp—UêòlƒL;ÑCÆÜj@–Eõ4ÎU9n¹gŠ¿\âL¥ÍégŠ¿ÑÏ”¸0@:N¼¤všTX‚)2ÁÄõIlù’#EW˜hñ)‚ºÎèŽÀÃƒ0•ÀÖ¹üóÉÎ¯á</{&¯®™”#5g£Úì!#¶ð°VÊ"fS¶À‘°|<BÆóÀ2k<˜€Ër!a
ÓÀÖ`0…¯(ŽS‹/–_¿DDX^Ë„„åµc	«Zj=8(ì
Ú£ÂØ 9,Ì¿o#’ÏÚe,GöýÂÔmÞBÚÎôc ³Šêïí¯¶ôÍÌj‹JÅ±›ŠLÍ²qíê>ÁüA¤ô=øQ
/ÍêL„¦ÙŽŒ’%•µ|D–h´0(ëáY–.Ì1Y‹Ì:qy.ÃhWŒ­’äÒÿ#¢ËùCÎ¸µ¨…§åõm‘c=j"Ë›æ)g
¸è¡ªÙôSã-16+­ì-¯å58wzK*zMN‘£’Ú^SÝÙr*ß±°6œxhiƒó#Ç¦åUÂòç¡ä"ëSW.z,£t-Ž{†È±LÔXÎŒ‘c¹S0‡”‰³`¢è±×¹œˆ±Ò¸ì¹"ÆÊÍ¸0ÕEùh±‡GŠ-%–!Vö‘a%†¿³Fƒ-	–Ù±§Œ�{Dô×LS8eŠçÆ~Ùâ¾2•sB¿ô²æD iäWÂW–þRÊâ¿rÞ/fI1Rúõta_K„|=q¸—êe³Äç†{•Ã”÷ïòá^¡^¹a^%X™'
8y6n?æ¨XÃ³œð.ch—9¬k	¼\X×R!]KŠ!øùFœ?~J†t=…€ŸÇ
tež<¿Í)3…tbŠ¾w(×s†q}».=ÔÅ Éâí'–4ƒM‘ÓêïhS|¸¹Tð’«Ÿ«ŽI—°*\•önL#o­*Œ«J[NAl¢1¬J'4Z8¯k¥²[uÕH'—ñ4þq{[õÍzóŒÜzFNãþ›wÑ}ÈnhMÝ>©Ç„Þ%Á°ø*`inJFàªµ!©›õ�7hÏ`»—ÜZ•%’Ýx
lòåWÔeB
ä =–@_ÛÅ%©¿ÃWêÓêâ>q'è×î„s<ÐÖP\ôÊr&‚Û)ÖqHŒ¹­Ñßýs2¢dÎyñ©çz¸QÓó6NŠÜÏè¹ªÓ¹ï/hQùè\;>`bg2(tdKã0’˜ƒœ
¤‚×ØCàb�O‡.�õ>öƒ6¢0lLÜ(BfjK\CŒíüaŽôØsAæqqiHÑ0zhì�[KèŒðäI#ˆpŠüå°TW^8‘ây:3ç`ŒösçÜ@Ëh‘5Â€ö¼©°4tBÙa„;}Ÿ�.€k†±È.‚òU¼©—¢
ãŠîÔ• ,­bM¤.y–[’yòDÃÛï¤fN§Ë¨%Sž˜<WØ@¨æI—ª£¨¦sûé'›VÕ8i†d(«zþkD± Þ§¼jž¡‚ˆ½Ht)Ó!Qšt‘àHË%ç¾´¼Í¿O^3û’ÿÈ–•8ö3‹êžÍºš—gS±±J6dÙ4f×ÌÏªiÏ¦i4ÍÚL¯Ò¸,Ö×ÄÛ:ö†=¼yªf,¡R3š14³Ôpü¶ŒŒî¼:qåç&ƒ%?Sï™úˆö w h6Èœ·“¿—±ù²ãTCoÐ6©CÖ•Lh_ñ}i©óì²”-¶(È¨K¹}Îó%s«Øv–!·j¯¸*^Ô´E‹Lù†ÅbÓa®
Kç;_;gv4¡ËºÙ]þÅ×„í˜¹/"é±	RÚ	€2;Óì-ËeSþKçDç§KI¦¹R©A"]‘&!
Ú.6ÊRå8e‘N™PEQÕÃh%gn†™ó™dœÜ[ª]/öÞþN¿«Í˜YêG¼Á¦SÖç€³eI�óÈ	½„i{q/£ÙDªWámGÜÃ/—àÞ~lË€W•[Ê²Ì¼#ÊöD‚+™8´Yup.a2L	oMn§Ç-ÁÝQdk€EœÀSÌ¢¶ñÁÝ;sÿ†±ý)¯ÿçãð£t#¯©lDºUø\,¼¸Ïö³(#!|Î—2"‚ÄƒàáíGi¿YÞóQ¢ÄòÂ„YœxN"O¤x„Pñ`±bÁBE×Ë
O%^<BÀÐÜMžÍ…3?ÿ‚†5‘Q
ÿ¼äý_Ð‡‹O(t|±ã#x<\ôXVø(#~äšÏE\!¤ŒR$ˆ”EJ#9âˆÉÈ,¨éB‰EvQì¹¢É
'¥
gf³\%ã)PJLÉTJŠ*Ï+¬èâŠ,°è®@¹B‹Il1.|ÑE¡™Ü…lNÃ`âE.µ§Ë ó™t×=}Û—•~$y*aF!ý(0ñC9©f•€�.aka¦Ñ<¤·«‚”CØDUK‹.ÅÁõµï²^;¾Œ’&
YD6=z#^¥£³ÏE±iÅôVé^¦2¥Íš#Ï§`4ÞØäO>ºiÉÎ ü¼×$S&–
™€û‚Û˜`xºI:@yh×³h ˜Ó½Ú*s3m0d1¹ä÷ÊT+3Ìõ0™à_g]tôÏê*MIà¼^»âÎ#©)švâŒ¾ÜN“eº_gÌSð&¹Àt”[Þ+åi¿ºNÈØQ9{ Yø¢š-L|´
ôiU
o[ŒËÞ2”íÊ…“Vå5ö®®úåõh<œ3ˆªr|;S×È+bK{Î]rÙìÐõüjÒü*©¶šÍ&ùy™üi¯ö3iÉ­xÑ?]÷ÆÇàä¤Á·Û¤Õ”è—ùÔm7Û/p’¥0¤ÏÐE.Yx¸¡Î™NåäŠ¾ïÅ¸¤Ÿ_ÜóFõ÷ÂX*š€!Ö@Bõ°Vš•Ú¢Þl}–å;pIw¼]hXÓ+Dn…\IZBß½Ç.)¨ËPô3_8BX\;¹ï`È=ð‹H•¦Ó Ç¯\2¡ÝÇŽW}†"ê�&eÜš4µ´eŽÎrÜ@8Jp5~¿ÛÎìu¡/ßnkk‡¾Ì¬5î•ÅÈrçðê®BYÜ–P8/\èK[±&Þ4!²¨§ñ‚€bãº±"\~É-€2&B¿éòÈëÁ›ê¢K#ÖÏ®_vêúo*0UºNä¦­”ŠÉte÷Å;¢TV[˜¥VQ³®¡ÇŽhTu)f^S8¨ŠWO÷¸¢ŠMr¡~.±Ji"S£z~ckªl!õ†©“3Æi“G’ÜMV”ëÃ”&ÌÔû1­X+=kÑpééúWéÓ«¤Sé+Ü9þíl¿{´s~ÖÛ—7+….¾	€F’‰˜ß]Œ6Qê1Á~Í=§P�úì†ûÄc6cÅ7ìB{Szã2mYZVè‡Ù¯¦öÝÝ`2sB—••ö‡­1E8•“OìX'UG˜N0ÅA;àoêÿë).
¦ä‹ãÏ]†*hÒ6ª£r'N4¿q¦;áôv÷šQ‹v¢’µ:¹h>Y!¬(|ò£jãôAÀ&ús”©˜'ßCFÁOZ©ÓUþ<)'èq³¤Ï7¿âÀìÕ\ ¦‘P¿-@Æ.OÙ-‚Ø3/>úÁÀñõúgž‡š&4c$UågJ-¤ˆ rœá
œWJò#gÆØ0ž@ÌL9àBqJgI¥DÈ²Õ@Ø¿‘™~mm£ýr}³Ù~£ÓÁr­Ýl½Ül¯¿VÊÉÛZÛ�þUymZíWív«­Ô–uýÕÚëöÚÚk!¹É¬©ã‚3÷ÆÂªœ*p’4êÔêæ™Ôµ+ò†9=l¿6D+ò°Ó=ç¬
Ã9ô–Êç�Ë€:Á¼B±3ð9Û‡ÅÞ&ãGª­²=Ï‹ˆD÷ÉB=d�åÎ¨AÁqei¸œƒ²J†S£}"|×›ðÿÍŠ^
Yn¥Lk–±šô”d÷¢ÕÞh­!l¿ÑŠÈëÕj­¿zùºeYVž”Ô;¨gÛKA©€BúcÄž#&…v�éÅw¾I1VÙ"•ëÐU0$…VZ©±‹2VÙ’x�X7ðƒp‹\´_­u€^­_bíû½BÔåû2Ü¯1¯ÜÞØHŸ_GßóþcÙÔbÿ0ÂAàFct|ï¯FðÝ«ØT`èúþ©3y˜¯x-É1/¾‚ÑaŽ¦á˜[Ræt±Ö„™tãu©I†‡�Ó»þ7ö†ŽzÕ†›ì@ûå
i¯Á´×›%7ëÿÓÅã-Òl´´±,R°úäú3t$È(tnÉ5þ(0gÛ”ÌœkW3,t
Ï>±Û¤J#Wû°<é
Ñ|yª0™£`Ø 7´°¨¶Öþ¿ê‹õ®¦à§—ÁêUyñ8)åpãÒ1®Ö¬b‚]²CymI«	ßjÁ^Àá.1È‚74G^>¢Ìˆö`¥ù
ÈÛ¯÷{(ö¹Úll(/ª´ñMèä5ý" éþoërÚù¸OZÙPÙ
ˆÔzˆJ¬“ãþ§ÞoÝ½¡k¹Tm‹2m¥s?maÆWØù°Ñ$Ü';g{Ò=>ùN¯K>žìtûû»Ÿ„l‹|Î)Xô°szÜ+éu÷NÈy¿sÔ!;ç S‘÷êÐŠVJìÛçCh†îÈÄÔñÉÎüfNàô1^ã'r�›à†Î:¢ÇŠÐk&ª"õÄTy+Rg2æÚ_‘Íz™îRÏ²”4§'½.L—Í¬¿vÐ=îàÙÏ{O˜`õl¿sXïwöÎœ4@åÎPñiL€º²ÄÐ*êÅdtˆ¹ÿlŸ{BÖªÐQj@l4ÁK‘,nÀVÒ˜Lç�•^TÎCã[Ø¦ÇvãM=œ6÷ƒX%{ntz³ˆ>ýe>ñ19ö|àF)�TÏæ3Ï×*——2}¶Ü{QéŸ€“?êôÎ`îgÝî!½÷ˆfñãäÞ¹áòu8š‡ó1á™ìVèÅlN¼K'1¼«zÓa0qk~}ìì\ÿÒa=T;»ýsx¸{Òë×Xg)g‡J‚ô(ò“µ;Ìƒ1´þØÆvvà0Øý"Õƒ“ãÞÉaw!í±Œ3`Ú©1Þ˜4rfÔè@äâBÜJ¶×Æ=
õ^»½9èôHç ßý@öºDºGŠ D‹½Ò;|ïfîÈ:Á‘Ü‘çàÐñâ!¶ø™§7;ÖN÷:ÇìºìSuéõ;>êé~¿ÿ+Ùíô>Õ’¾EÌ–²Àt$Xÿ	Ž‡ŠÙAÈ·hd“|ÐÊ4ËÄ4á‡‡Z¤³ic‰„ƒ
½ëqL‘©¢³+#otŠ9Ëv%Ú¢ªGÓq
¦èááOÈDãiÐ”fIÁ0¸mx,Ã
ÚtZY°ã•	Šž>íÖk¤ƒëH.×/é­Q½à*&®ò›I¸7ÚLÊÏ*~©:Ð0Ôµ%‡ÚÄ¡n�¿Ðn¿–†zºît‰±áGÂýª¹ÄP×—ê.èúòòPï Bp»ÄX[ë0Ú—ÐXK[Øôo<{bhJibù$QZc:ËSG"ÿW4á4u¡hTO¦ÀE xÍŠ3ª-©m^<þèN/"‘#øõñ~�]êžìíÓ“ý±s˜5kv^5Ã‚•âCËð´ŒŽ–±™„&°ú¨7È¯–d€éÈ?Ó«µlÖbš¾õ½øžÛÛ*Þ¨ÞÝ«Ô¤·ºG,ÕÑtœ[ù³º�"é²Ê<ÅfÂb[¸Š<¾ÂÎYH¼E5A$¥ðÕ³%âyJŒÅÆ† S¹Ãh&}q)Q#¹�ú¤QMPË˜ŒVÁV„Ž¦v™ô%
ÃF€8	*&0+ŠMhv­øQ&W„´Ò^{
îËMüOk®$ýÓšKiÄŠªAÁ¿½ŽÂÔ:<‹Û“	«Mª�_Qa	"°šEè¢‰mÌ˜ÉP¸H/óÐÄd|T°ê~ìƒxÔ=øÔçÀ£ÎÙÇ. šýóãþ9åq¨œÔ9–¯Ü‚P0È;9rBôÔ?tÎŠ‚Rf‘ïÁÄ‹'.Ôº	çøÃyäŒg*Ä¸TâÕ„û|;¼Ûm˜ù!È0=ÆåžìšÖÈ†zMòÓ3äó]òUòí¹C¦ó‡Õ¾Ô’\'5¤ÇsJÝQY¾f.M4u0ñŒ†;ÚF±Ç@Æ8.õd‡fW|Ç%#žä*Ã{Q³*^¤7ô]êóóH_ÉZÓLæ (Áàå5Ð2e¨zò²
r¹ Me» šðG«À
ð˜®žä>%ùñj´iKt…ð/ô“1ùà‡MÿB‰öëõÍµÍM£ZDÄ¼É:VÓÍÄ†.X	–õ¹ŠUVñAü8º&æ¦ÒëE"µ4æÙ¢ÙD×P|ø–=ÄƒÊ²/¡á|w_0xŒë‰·= 0ùQ0·p*ò3èPþÉf•¤L—)c’¦È`—Û¢]Ò øµ¿§`��ŒîT€W¨ 4‘@i€ªIk'ƒð€æ`ŒíÓ½fÃ¬óÔBÎ—ë#±ã¬ßs^{•=U6^i�$â«àzìã¦H7eŒ&ZFuÃÁªå¼…	ç½†Ý—^«;i0�Öôƒ÷ÕU[µôÊ­£àMÿ.¹'O
„\¦`!fÌÒÍ¥Sâ:žÎÁùå^Á¥b$[Ö¼×'ysdÛ£N2ÙËò³¬ôÎÏNÏ{•ì4Ÿ‹íÞ™ã­UjãVUlÌþ[Ì†#+€y6¿öF^qX¬zåÅ¤ú÷š¤,pi`ØÅ––æ s•8f®¸˜ÑUK¬•UÉ•Ö›ÝPJ`¶A7ÌU1¹~±ši	ESêK÷ú,¸%ÛÄ #IwI¯-•6ÓˆF²¡H:³ŠÉXQÖ¡´76
Ë'ËJ¶ùºªU,…ÑÔ{çãþÑ«{FÔ¼Ç Z£\Ú¢3À•VoÃš•ÇÁâ¬.š—l£8Ñ6§Ü,P*Ér¢¾6YMX¶oÊ<¤gY¢4tüCÞoù—YDÌJ>eU_|ìß\:ñ(ÕLítNÉÁÉQ·´BãÁ9P©³s“^*e},’ðZyIøáBïáþÞÇý3>Hêè˜Z©ØL/»3•ey4Ò*TF9·b-~¼éõõœJ¾Ó8ü$
ê*ïÂîž«»Ó9;ï¡æqi)÷|:ÃP_b
ëë]ïUÏúAp3Ÿñ‚‰û_C%ø=eìÞE"NŒ:hsÞsÌn˜)-ÓäYÁ2¡[ÊsJvâô8­Óîq^Üm1"ÔqX©Ôaq œkùNÐÅ8qMDoEÄ­XB¸¾9¡KÜÉ,¾ã
#Æ–#SÊI¯*àÈ¿PRÝho¶_IÎYDßå'­±þj]öT\<7§zà©|2¦€O¨A™+È~JP	+2rá]I6hÆ½r4ãMÜ3ƒ Ý‘9'pÔ°z7jÛ
tÉ
Ýª´ô8PÖi›§SÆšªû¹Ö+twëTjÑ^hÂ†ÁMS»m«ÒaæñÈK¬ã4;&­Bn0Ü†y~ŽärœôåŠ}’mó$e¹àÌ& 	Ã±Z|ÿ?OëÌð\b†ŠË©>Ej:¦VâZŠ 9šSÒzéC:œY¢B-=Õ5Ë~¢‘þÀ½u~÷ÐÏÏÐ96Nª.ùw:
Âš^…aæe¶–5©Ï—ö‹®µäFTE,M
wvæÜâØ»v¨º`6ó=7,=ëõœY÷kh=!åbÒ{¸ÞÐË43ëÝ³ý½’³æ§M—9\¬²lâ°p\a¦’ŸÀÈ‹¹‡1Á|>ä‡DªŸhÊždì´òO7Š'NxSS&ùþ�ë
ÞòË<ùîAÂæ¿,øIÙç,á-¾ºÇ£nÏâù”ÃUq{v’"XÑ”¡Õ.â&‚k7fewDÑª®û_IõÆ+RDmVÉÇ¢ŠÈ¤•s¸•8‡ÛÆL r£ÊµÆ‘%›K°fNƒ‰&2m]éMÓ*2'×+¦Ã ªÄ[M•x«©o™
[~�ÒªI“Ä®nS¦™WŒ†9Ôä¾if¬z-¡EÈÔˆýîYÖ©Û~dÕƒb¡suˆÉú—(¥ê•Å¦P·ß›‡3ø"�,SEÿž{åE^,=Í.ÇsñpLÐòY§:EÀÝ˜túXO~€É"þè‰ÜTŽM	4£†ÅKAáyôåéD1Qxœº±ay2m#·nêêDéä¥
Å%Ý°l*Ãå†KªËø/¤×I„F®æS¶R"ÄÃ‡¶ˆ–óäâr…Ü%ÚJb¨±'½[P¬žDêp¡’ßóKuÄÙ…ß=N@‹f __É� ×j+µ6ÓZ­õ¼jkjgi½v+¯ÞºR¯ÝNë%÷;Jž'æÜiÛ—*Yô”,wºix’ÍïØFéÒrB¸B(T=ni.„$ÏÂšd!pn†NIaÆæì
ZûÓÑcûcë›“ËAê.u›–}‘. ]	%M€î#ÝÌ>
·ÏëÏPØ¼ˆ,–‚†´
?¡×Ã²J"^-AÎ™{*ˆÖæÚfkMu€Ð\ Z¯^¿l6e½’bxH{Ê |µ§vµSj;ZW¯Ö×^¾n•è*ã:­t…Aµ=m¬Ãûµ4†×ÚSÆóY›”iZ?5 ’÷%Qí2n1vÙye‡¿úX-…V9&É ›¤Û}z‡ßç28dé.“>-~)[Ùƒó¤[Ú²È`x[Êðå—‰(’qr‘äŒ³:¶RŸÅ†%&LÞ%¼:FÇÊ³³nüçØSM…â#ÁÝN´þ3ð¼hæ!m@¿ÌiPÖÑ<Fá*‘¯a¡¬½Í†d° ‰d+ˆÕúôfOšŽCDïü’üñÇýÃó 7Î?-‘6$Ó²0±ÈÍ’êéYw§³×Å$Œ<I@j¼Ã'i)Ù}Vƒ­Ó~É~•Œ3y]ñÅ¬(›-òÜÎ|#UtIMá"ËGóž|F«åÞ~¿Ó=$¿œŸÁ¶£ó>6ùâ^ë"ñ³·maåÒµ¹×l^ÌåŠ6jC„÷Çâ‚+2™cz¨u…S÷1æ3ø‰¦–!Êõ!²ÜªSî‹p¤k,(ð^³šg‚+ï„¡s÷Vl c{2¼ú›äõª±iï"°W¼ó"¬\Œg°¼¡é‹Ý±ç´ç‹wÈÌ_*¹ÆàTŠ‘uGwBí¹ñ[ÖÓ»$›
‡µÜ¡ÙªB¤�@õÈŒÎ""U#cƒi8B7‚¨—ÇÅ¨ÇAý”Çp‘Èu1t\ØÛ¸?o1“J!c,“ŽEòcí‚ˆî;ÃqµÊh¼;Þ=ÓJžª`½æT�«¶¢¼‘a€½W’%óGê¥ö)t`"+õ
zWpúF¾çMÄÞÕ¤™_¤;‰G[„÷0XtY§‰""¸nÜ¹xìEd¨ß.Ç¯‰ÚE¦óœ¹¬1¿cOþÌÍÈüø˜‰w—2rqµ;éãª|ÛM¹´’°Ô&/m©Ežž>aYÂñ[Ã ¹ ¢m§ÍÓZ¬P
zôIfQŠ ,…3ZE{õ@“AMƒ(Út0Tov4�¡zƒeZ'ËÃà™õò¸/uÈÀ”XC¨hÐ‡6Ž±#’¾jQ˜e²QÙ-SÚûå€Ïvœ™F„ºÃKnø¢yù^@œ…Y{o8aÐH£xj1¸Ù=Ñ +•‡Œ5óÎ|O¦°C¨µÐL�äýi4]mrÔŸ©ò0Æ\F@lóA5!{û½]€8ä%«@Á]TBwƒ‘Fm©,¹èôLtlùÉæôttÖ‚ËI—f¤ãÓ™ß½Q–§´nÜØ9¦.Ë‰=+«E7€j‘dÛðV¤o±%—Áfî2>]‰6Øèóª
ÍíE{½IÃç0Bzãr,º¹«o4ÕkXj Ór‘
š5ƒñÖxö¤iŠP=ÑÍS7Ó‹ék³2a)%Öix4ýÃ[ùH¾r	tmcðsÒF¤+½¬‰6D‰«ùpyŽ(t™Ê¡”ï2õKÁ–û÷	•„ÁW=C,oyìN0ôWÃ9B5*¾ç�ªž¿ÃBÕM¾'UqÏ8¿ÙF\kÂà+ÅåË,êÌp
ÿ¤ÊæÖuÔ¨Â:cú(Åj)àÓBâ§\€�þ~Wf+d¿~féš¤ýÉÈ‹�áüQ:/ðìR&Ÿú;¤â`\HÛù÷ô17)WŠr?ÿœqGÃ°!š˜iäFÃÐ›±\0À^_ÐÝî�ÇA¹ºˆî&ƒÀ0“®7ýÜïˆ\ûw³q¤Â‚s»M¡© lH2l™†x¬þêþñ÷Ÿk?¯bPß\üý¿G—?¯²Ç€:&©?.ÂñÈ‹ äÝžÔø¶èW^ae'åeÍk Í´^¹@õ‚¢1¹¬Èw!¼u¤g ÜªXÏ‹¦ÊAY%*®ÓC˜®ìmRÈ
¹WÌÊÁtxg¢ø[’?e³ëƒYwº=ÔZˆT1ÿÑíTj*ÿg\ëÏðï¶6¶�‹•}a\;#“”×“¹
ý0ˆÛ“\Xê_u·4œ:×¡¬iÍ|Bu˜‰¢Šj/%½_Z"K¹àmÝë ¼ã¨o%†ó:×Ü$’=Fx­¿¸·¼6ÙQj¡ÇºÔ§O¨Ä|Z¹ÛýêÁ´Ð™•Æb1úA}Ø*Q—ˆ$É×Ûâµ!‡€ozoË·„þ˜WSOŠÀ|$jX*KNÖƒ
íä<Gžb#6ú:(Å[›ö;v9¥‰v[n‚:FX;X×Þ¶›òÛ
ímwRqšxY6‚ÜÇæ³¦J`Áê¨nY‰râR®Gb#.DíKI5Á†@£ÙÛ¥žf)m7‡‹…×ÁPq²©¨yeP¡ûz°d`ÔP›Q…´I˜ƒ¯²–?{ðSŠÌJ4'îŠÊ7t€òm4Õ«Ü,ñfKWaëg®¡åÌßíkó²ÔÚ0bôO/W‘Q]vmì‘aZ‹œ·‚8²Œ¬žºê0ZÁän‰-’øéè”qÄÒê¤É:UÑa†ëÅÎ(k�Qóbºv2'GKÉ—ü(¦cN¶?¿¸§å.Ú—heß[Ò÷æ¥Ä}©$Ÿw¯«Ú>¦{C3™Èg¢\„º§LSü½Kiç65^»ñ1­ur…MD‚“¥÷GRÌëûþy»V†ß?ÿœIEíŠžÉÛØœˆIJ¯´Ž‰:_b&®ÍõËÄE¬'Ãî»<Åõ
ÉF?r|gBïÝò,®�—šÏ&OjÒÜ ¯€ ï=ƒ«s~òÍÄtDzw°ÌÜãÚWu¤ÉµE\òLr¾ÎRÎ”%uÀènøÎjÓp¾¸"ÈO¤éüM„Ûýö±ûñ·÷¼á|Íä¢Züö	;p´wît´h€ˆÆƒÙùpñÞ§qp»O#Ç¯R][æª&•=CÑ
Ä¯Ô-!“Â� ïîaq©Q¡l¢uÞÒ$å‡Î]064uq{CTŒlW(ûWgß®0²Ócç‹w
 ´}Ÿ~‡
o#Þ¾Ç¿É1�9mßÓØ3q»ÕÛ‘÷…}'ŠpQ·+ÑdÀú]}“Ìõöz%½*M/yånÆ?uÀÖd2Ú¢ßr“ßçQì]ÝÕn|s rxTg9½¡û‰É»¯Y]î‚u¢^Ê÷vÜ’{E@­¯}õ)Sø4z
ŸEx ê¯›M¼®nx`P);¤ßñw0÷»‹*È…þÄò…ª]®Ž[Ú f™1°þ€²±‘LÜ‘7Ÿd:;ew/;�vÝá”Â‰•¢bøÇ48d†
m,3e}Vµ2î
®ëš6–·ƒySm|Át×÷†7Û÷ìÞ1~$:£;¨'¯éÑRoƒkyÝqYnÇ°½döµþ’Ìîêk�ys â£zÛ°e­æìë%™c¾Þ!†&;wëP¹Qp[‡ªãà‹nAw³ÐcÙõq½<$yu¤tÚ°‚ãk ]ßœ·§èòÞ¾o½\ÕwÌñ:•\´­`K˜³ü§õÌ`¦v‚ðÌDõ‡ôçôËÌ°®¸XÜ‹uº38µÒ&¤«ºü"+\ETmÔÇÞhär'®ê�{S6žô—AÚPœAlt³:Oü{[_ß$cü“n×j;,½«>	»À?1þ3ðç!=Ôt<u¶Ùªëë­ö†¾×£yH-NõWÍf6-wÉÔÿUo5‰Š³t<5¦cËœá,N2uD›ÎÅ|
×ÙZºÅ‘Žñ, ÝÊÕVS=Hhsênê:ú',*¢5TFû¨ðƒÐn.ô55‚ºô¡%ÓèÅ&‚¤~ä©~
@×~èaÒ\SßÄy*i76™4áˆAˆ©êÙ?i¥vÓ2ÿž‡l¢ýA²âL[mžùÛñzvÖ¥™‰Ózî¼>ôÇ‡MCFh"3BÓ3Ó[>½ºF<^7
¸°Š—ýëê)‘Í9{s-tÛÎœÓâé h�èE\_›‹/	ük¨³MqeÛ0`óq5Òp3Œ–Ù,®–¯Oƒ©kß9Âãqð<šÕÚ™ÞoVrÄ_£Ìp]&¾ÓËÃ²Œ(»›iªììŽZÆf;Ú¶²#oäÂ¾ïŽPW:ØØ•>•-žzSÐìùÀ
1¥
ÜÆfùHs1rŒ¯0p*&fÛ…)à8Mò)¯Ñ(Â@$ÛH$ÛH/ÄØhªGb£¹ÝD¸yiB)}ØÜÇó™ ’ë*i^|•0ÌÃ)„„ˆŠõÌÈ²ôÀD
r+C×:ìòÛtpÍÒHfiÂº…¯Ï¢}"Sc8NúRœÎsŒÞgY)¨v…Gçÿ$Rdf™eþ½Îg±$VîÉOØ^p;ýÃž±&¦¿;ÜtÕÆ˜Þe7¾Oò(¿Íy×y<Ù3
?*<PÖ ‚$¢h«©Iwš˜iaÒ4MêhÌyüë, Q)ÍP›êà·ïu%=ûÜ2ã×ç÷ô^î‰7­ŠåÃk¹æ¢AM5žÀõ§M5fúYdIrIX-/7Š#›ùÜ¡<;ä³ê{½î¬
6/ÌÊÞBvP{y
¸‹�U<TMDÜ0‚?€¢M«IùL/9Â%$ígyMÑôlæjz B¢Ši¡—Õ‘gYêQL9ôñ˜ZW©K2&ÄšÙÊ€u«~Ä¢Ð¯)Íkä_cTöIsýQjÿ9 ásæNWÇk–áä™ë¬c½GÿÓ«ÚVÐÌâöMø}Þ“J’ßmˆj‚±—ß"Z<U³½†ÚÇ€[urŠoIÅcg<Çâ&Ç.„YuQ6u¸Yõf©P‚á´Õ¿¥Úª1ý«*«ehFg)µ¶¢L-	Y‡IH×$ã²µ4#möÎ~ö¾áÂQ’°nÐö~“•;™ÇO¹t6ÝIF00¯SŠ‚oCg–]ñu³ML¹”šö¡°w3 `ŸoSe\ØpñF[	ªZaŽ[²9xab²¤ª	¥u…õ¸°*Fh+5ûåØj^2—koWµí½Ñž–~nÜ»í{Œa2#6üdo}y«4�Î^5Ý¬ûÏ³¯¸éwõ–tr@®°€P5³¼0óÑì£’lNaJÆ„ŽK˜ñö#\P‚¡ÑMf#’¾ô`mcñÙ¶”öc›GÆVÓdL?5‹ÎÎ|ÈË¢SÝ¨›Œµjf
5¶PóMfbÅ¦®ïmh°Ü¯Û÷¬”Ëî…Í…ó1úa� cì¾}É™O†Üh•yïTÝFì„×nÜ =×²ñ)sdR#êFÓÊK'	Øš8`KŸª`c2]¦—¾
†óh±€¥—~3i«‰Þ¸QÖgGâåÁV»Qh"®²í5~ÞÌa›"­ÉBì¯·ÈÛ+èkb_nvÖª½
ó!aulY—…YÌ…Z
féU¾–¢:ÀÊ`I¯=²@¥­½#Ð³J%Hey¬Ò]¼)Ðv—@Û].´Ák{ƒfÛ™ÊJ±¸c ³·°TžûØ†
›|öˆ»TLF[?ÞP^õá`ª¤CZN?Èu- $6TZ­‚«7*¼®xm?^²å¦ù%ÞõÜÉÜZþêG?8~­¶î“8:
û³e`£íð§?rOÀŒFá=ç10½Ë“VÊ<Ì¢‹µ&Â„I_tæF³�˜Ð/î.�ŒÀ2Åívãß+dì¢5YüšxSÓ°}ß4®ÜÛNè:pDBê/íà©¢n”ÔØ`Yë·»PÜ<gú1´rµQ7îžì+FÇnWÖÈšTŸŠ®¼>ôŽÞ¥¶ícMnWþvÕºÚ¸zmnÍ"þ¾ýÏÎWO¿åE|pæ�mÛ ¨Ë]0H˜ÈMÉb6=<~®¸Ïôi5mÂ+õOºßI‹½¬‡q+®½¶4híÙg§±Õ4¿µ-ú¯9‹þg_Oñž·,ò„Ðˆ™ýª;ŠÇ3v>õâˆ¾]níûAàÇÞÌÒû•Ú³âª­ß±‹}c¤ë¥•6Â²¹<ž*o]<sF*Ri½œ}ÍY`VzÝû§nn¹¯=*#CÑ&AbJZð§¾ÂëAµIð«¤Ùhé	îÓeŸl«‹hÓ¶±w34Ó ÆáÏªNð]«ÓÞY·à;QŒcù5Û!¸6……NfÎÐ‹á°7Íïµ(Àç®ÊÕúÚÕ†µ©¥V%¿©Ç¬ÊÛÕ„ÀšX5×¤$h¡Ø8&˜Ù’®ÓY‹X¡É‰ùùžyòáUS,ŒÅd6²ÍÃd¬ÐË¢¦×äŒ.*§žÁ«~Fa0«SëÉ¨´SÞ38µ¢19vê!f¼øDƒ"Œðe¶þ˜Ü=
ÝX­Ž¬€<×šuÑ¶œóãù
Jã·ûn¹(}=éíxÎCŽ`Œ°ýþkm~hÑÇ›#\ä /cQmSÔÅ¼”ï¤}Uä'Šu)ô¡2„¶˜Ý·èKåÎH
q9ŸŽæc•ÈéÞ‡ÌêšôÚ&Íõ3ûäcÚ4
ÆâRv
gœ]£€ðëÜŒ=Ýž¿J6õpŸ¹‚=Ps«Í²Vcê€0OûJû¢Š�o±´ÑºP“sÿ9
$‘44…Ðá¤ßÔ›˜´#›E#ßÛ–†uÚ+6+ŒUG³º#/<áMKpÊR¦j¨¼­Û½AJºxK‡s5·”5ù^IËc×±ªetwú”ÖlläWä@Yÿÿÿúéø¥XÓÒ_ÖžUVå¡}3¶Þd1ˆ²Î][™G¡ì$(1Eiª
Õ°®‡ÞØ‰	Ó4vnbï‹;º![y¤=-v¾_ýÙ¥);	?æé¹‰	É?V3›WÆÅ@2`#—„^e©/é×:f?!t+Oê‡)ð}èÖæÇmtKàÎ¨øM=ø½;„é~-¼& Ä´b«!9àŸöókê	‹ÓfÚ
åÒ ~M!©îy!Þ‘ßl’ <mo­@6Ÿ’Ÿ×å$¡q•…Á´)RhIm®7´LÔ˜!ŽïÈ®­	
g`'…9ÞÌ“ÂX})²,3‚ˆ4ÑUVÙ¢b’)&õ«i1¬1ûZßPðÃröŒP÷§P­v÷Š+eìÌ¿‚ŽßŠ£Y6bóC¢„µöc|+ÌÝ"}á,¬vo
+!(ƒažŸ@q©¢˜hY¿ª+É+³T—ÏíÒwK9³Þà‡¥Oÿé'Rùàº#I°ãxÎ|0Œ-!ˆ
×*Æ[¢
ÿÉ
Ò[C%Ôwƒ—N°[B—é"Á…IÛþÄãL¸L³	:LšÍA…‚ÑyØÄÔ½N
K.¡ó.¹¼Û‘;u&3ÏÇÝáSI3Š²L> spr7ÂD2Ä	#oÖ0º|há)(ò_\#‚mÝR’o~Ýd>äiÚšòýõ2v¦#ßÝ™û7{ÐÏU,š­3|K’!6½Õ\.rŠúÏ¦LfÚ†–úbyMÇCË	c€5¢q[ÄÈ'g6HÕ°³‹VžÓ\maò—@F“‘sòOç&žxKÚpŽS…âR.–4+•—°¸T$Ë9U<Ðç§-œ((T}c—Ÿ\Ð°ˆuV?
º[ù.	ZåW¿íu~íUÞ½¢áDk³TkMÞÈZó­ô?u{¿QGºÊ;êgŒ™~G,Ÿ×L®;‘Ç"]æcAyWæKB²¨÷ Ë«nd±]KAÄÊ0‡¢Ê»Ì£%œº8Ýô†slQ¶T“'°øÑ‡LÐ;éÇRý}å]ªÉØ:}Jf¥=ZªÁÎïðaç3g\y'ýXª‘CÇ›NïœÊ;þåÁ§ÞšŽˆKšB,ñ¦@Ð[\ÅÛžë„Ãq1+’¤dòÝ+”V03SkµMê”g gôŽ>PYI«™YØ
ŒïmŠXo:³FÌ0K9önë“&!>`•íÊ.bðXˆ+FÃêd%œ{qþÛÜµ!E›ooRí“3Ããg¡Hy¶,–TÌ‘;ñ¨
·„ÿ£ÆÊ|óú&œÞÖ_2ü»„7ÙþtÕ &9ý¨JNï
º~Lt¥_Ñ2®YB’ÞÆôšµ¬r˜ëáˆ6‡ï;3 DÌ8pñšú(
ºµföWd]`¾l+×‡½ø[Ëm¿^\Êj>ˆ:ÃvNÄ*,3&x|ßÀœŽl‰ƒÛ)&ö	H3òB˜1ö27�¤(²¹l•Ë%4%„lÄ—‹¿­­­·66lË”ô‡Ä‡a‰áØÞ‚¯ù¡Aš¡á}]À…ºœëBþöZó©r†8O˜PÓu6Ü×—…Ýã0ÝÑv^¸û˜Åp.¶Ö6¼é
Ãz£­å…mà'E’qp}í»,ø¡ã[ƒ¡ØÇ‰Ÿ·«ñ8'ÄÞr®F+š@ÑìÔn*C|moÎ8òçž;˜GöÍ³÷¿t÷R}ãw\qsjÿ¾×0ÈÄùŠ´¥Õfþï<Hã»g
'•s¾×xémo²ñäÜ$ñˆ!¦9é9ÚŒ!:½Ü‚Žö
êâåßn¤À€®›EL3}z™½ÍAâË"in,xýx¬DS}üi³}Çå@³·L5¨|¿aôh ÀwÄ-¸pÎ™¹ë)ûSáãÊ»_æß?ë>rgîUª‹{ÎA°®>•êé)qºÉxûÇDð:ÿBð1›Ë1›î`ÏÇhêù~Hä†Ýþ¿j}2Ö›6Än…]CYß
gÎ
°Þ¨
¿h:DšvZø‰ü{RÅçæ/’ðI(ÃôãŠÌ§×äçÖ|÷…ùÃ§Øñ|É=î»Hçãoÿh”©”;oªfð	jUžÅ~WóN)2Ó)”ürò;Å™XàäÝ ö6ÆGå9Œ¼/0˜úá_Š-goHj†1Ù&ÅG¯Æâ»èâuµ›ÙM¼ìÛñ‡sŸKDôBª—ãMæTeÑ
øwƒÞîMë¨ãuÝ-±ûU­½)lZŒ¦Ô(€SòÚåOå‹)`I‡‡Ámù½èƒ¬þâzñw:érë+ZªRãýJüŽõó
Ü9‘7­ÔÞ˜³0©ƒœãfr‘ÞhÇwèâ›8Ri›Q¦Ï˜÷ØÅ+‰¶Éˆ¢xw$‚×à6®¼éHä¡ŒCnÓQnKô(ža¢¿†§¼óF%öÃ÷¦7î¨7sé•™ò rá½R´aý½´:·ÚÑC&Íž
vîà¨Ñe(q5»=9`Ò&ãùÐ­V£ùd…„…W|Ø’9¾ñÒÔÞ˜Œ¸ƒOØ¡.y¥{Q'Ž¡Öv%³ÓÀ+{Ì`Pª~ÿ$Ì/g=½g=òÂ>5K4µX¡Å
a,‚£œ¸È«@¦’ÉßJpQ]†Ôpƒ¹?ÂPo©gíœÃöÈà w2ˆ¾ÑÖÏ-ñè.ÅN</ÆÛ^´;"‡ [ñT%ØÂÆèyîIv_¸ªŽ€'Ð)×$ïÔY2Pvïè®¨1v"½©ì–Þúâí ƒÞ¹ÞEÂ-.äÆ9 7ãa—ô¢Ü#gv!^]BgÖWØkîR)w¬Ú>ocs†÷ôCCÏ’Ý)òš#É²±¡«f×}Ü‘›n—}”E|¯þ„ƒ<ù;iSÄÐ”sîŠ°lá–¶ºÞ,Ä’¼VXÀ­a†SyÉ"½­Ýâ“ÏŽ?“Ë>oãQ1««ËÉœ˜xe\™Øg9‡&ö)ëÖÔ~·&>áÜ$@¡è°ädÉ˜É‹HÂveËõ)b¬xâc.‘?è ¸¿÷qÿŒ´¶øÍ×¤svÞ#žÅU_©ÿP7%>‰R Wªµ01†d‚iî÷yüLZ‹2‹™;k/&ç\iJgì:]c’„W%<ìröÿqtXåRj¹B©¶09éõ8�”LŽæÆù„ŒOç³)ubÙGÚ oJC9ÌnI¦X`q½ë�·B@æþ±×âõF3ˆã^6u?kþ1#^«_ë_gà!
Ÿûnóêö×¨
ÅOìÅ>,ÄïÝàfç7dâú4 é!»<
ûOcHÉ½‚ÎPëÆcM½©W¶ßrŸ·ûw®ðöoYS¬kÒ0î
âh¥^Yä]ah+7£¾þ©!ÏS²eóðÊuSä¿-Ò,‡¨øœõ>¥q‰ùB•×z¢1ƒ’T¾èÁTòN£vtEá–z9ËéþQ§w~Ð9^¢–GL—æò¹Šðßâ‰&á¼Ê,?îžwÎ–œçwÑ”¤>XA’u17Ÿgô=I2kSõÇIÔLÓqIjïizl~¶Q<©[Bû¿ÙÂ<t9r/3Ró
)I:Œ`—îŽ]“_òÜkŒN9n <(?ãV¨ÌžkU&o—Ò?†=%¬«”Í+'	™þÕA¦‚‘âDÊÉ	é´»;miÕu�ËgÑá»	-ö«G"û)ææôëKìûü¯ÿçÿþÿˆðÝ2,ky–uYn¥ô^­UíâÎë„c~¨îãÙø‹¿µšƒ×›-t‚š%}0055
ßíÅ¨Ü¨V¼Q½»W©-Åe"OÀ[Í1$ô÷>ìŸ=~Bšž /v@ô¢³¬cžæoîÕ:|`‰ëÏ´Æ<p0PXT$ÑÝÁ`Š.ÅÕü íM­Ð¬Í¯Ô&Yúz²#ñD@£ýN€’çe‘tV^ØÞ"‰ÈAö:ÇÌEõ@`‰(>‡ï¦üÊSÍeeú[á_2LÞÂH ³ùŠ	‰ñ}¶,Ô-"ŠÿÜI7˜ú×$'ñfFŸ(Þ$¦–$0Þ¢Rž[¥¼êÃ9Ôï„Ô3¥à[¾ž:~™p"Jqiz?<gûûÇÝã4ÕáA•
Ø_Y½•«OP]ÿ•×è§´f½ÀÓ1»åé|jÔ4²%·ª¼dðØ•tÎ¦ýÙ Î”Øòð¼'ãg0„OÁs¸kÈá&êf’à7Œí{³»lx ŸÛ·æ|©öÝÂø>­8ësfpMû“˜x“U7x…éDMxš5îÒÇ²i·¥\oñG6ì®’ÏBLíº#o††ÁLsöm¬»í¿¬»J7<Ñ_ïoOJ²ày÷:ëž±ðAü°!‹!Ë[}>C¨ai¨‡²Nš¼Ñ
)™áPÿŒ¼“é¶e§ÍmÉi¶P“8m–í$ÿÞÔ€i¼c(+Ë$Fv!¼¤4CI0«Q[îEÚJÄb-¶xÅi#E	n¡‹ä]ÀnU¬of®…)µ¥ñª–PµÓïÿºÛé}ª¼K¾]]ÐäÇÎ/ÝÊ;üûÈ†>÷;Ç+ïØ¿lìÃþ~åüyd3;ÝÎ¯òK§×©¼K¿?²Ñ“Óý³N¯K£¡ßI?;ÖýÃÎñ/8Pöå‘Í¡_ëÁþnÆ˜|}d“§û�r„ƒ_ò}ÙFï¼àx…0„9�Á7Ü}øGÚ=ø%/;¾äË_Ó©®y—™ ‰ß«¡t<Üm½¾8\ÿNbê“òYË-_I”žwí{¶ì÷Ñ«Ð¶Ï­\yZÅaéàÉÓî§Î9ìtŸ@	ñH‘µJ²:KŽ¿±)ø!“g™D¸û±Ñ\m•6ÿùz}Ý$yž=ÜL"ßb[Y&KPžPÚ]Çþ+òd¹ûÙý¥u®UÀP³²¼°'KŠJ|ÿs
ß,IûéôäªÑä/lPˆ
äµ“ðlUýóbåŽÜá9ˆú/¤`,÷8M>O÷G0Ù¬o‘Ã“ŠÙæ?ºÔtszÖÝéìuÉ*·-<ÔŠS:•Ÿç·6ßÌæáÌÿËsé/=nñÂèvÀŒANûæó$üˆ©tbT)ñ—·Ç1­Œ(t–$cšOÓS�ö#n}ÿµ5…Ù$8›*áY–¯eQò¨Ÿ‰
;ÎèÚÅÔP$ifm˜i+$bÇgy™¶ÕU+iþ†|Î7OR.É‡éúZE·IË·¶–ÅáKI{ÙkÎ÷G^ /Ùû–•ò”$#¯ÈþÚ1ðç)å ?^J—maø|Ñ*$NIíŒËÇClb‰À‡3O/†{bƒm|i‰å¤©Gm=3ö²Š³›_6³
~ÌûŸ5­n<tÿ“ÚO»ÿìâáç�õªãç’áƒ%sÛ4aÉµÉ«ÛÓwYnq.R¼Íï"äÀï—Ç–WÅÎmåò­¢ûä4ü|[o½Ä+_*×0
Ð½h‡îä²|%–
=Í&üÂÉ ¾^ˆÚß~úŒ9ø¬ƒO	Px;^W¨Q´I.¸‹&…£Üqýù„tFŽt¹S õéN½‚×l¸Ð¾•^©È¼¦ð4Ìmv÷b²êeb›?Î§Þu?0Å¤²‹WÛ§s«$ÚÁÉÜwò'GPS8ÄúÐžïÇ6
Vc–î¹G8ïtZ6TÁ4¸¦Zð
O²¯Œ0f>Åú‘b²Ä]}Ó¸	¨Ÿ:ë<èô:Ç¤×9Ü;!{]Ògú'¡H²]u­u%ç¨“íZbV©	¯©ˆ!ùÒvMgi>nàÆ·®;e7ô¢üTÀÒ½Í=¼ÚÁå¡¥§Q±õZìÜcpæáÝh�mÏñGy¤Ïì§\©Aªô*�žöÉª”iÈž0ÿ¬—:çÙðg8ÓÍÆFît:7s<«€—¨ÃücE²P;*ÄÙC˜Šs{Ç³%A•19×äk³
øÖ‘ýC˜šÇóí;çPçâëb@£à”‚WÎ"3‰Y™ ÇŒ&f –<¾zOXÚØ-ž”n‘Ë5ØõJRÒ-=×+Aƒ§©)¨¼Œ®wR&®¯¾9sMÑaõ%çŽÚÑ$ß¡ÛÎæbë%œ¥™uæÚ›Ø]ñ§Æ4^E­b¾±\F˜×ß�ÞP±Å³O¥‚O„³Eî¯0G¼;Q?|—/¤‹CÝ›O0[¥š9b€M“G"?0&Îãhí ¿9'Û|×5ûP˜`ßqaªöSŽi¬¦a\‡Þˆà¼“:bwÄ§?×è)°s¡÷úbÒ4õì>õâñ,õ9¬;Ž†¦½…²63°’ï.‡¡ØIrrLéQ¦æ!´ÈÕi ­z¶qÚù*›¥Iü’¢…“1SK·õMQ6“•¤W’[Oq‘°bt‰Æ¡7½©—QªÞ3Ø Ö›F4DL‹Ú\!mí6"B)‰6Ÿ[JJ7ŠÅ×I4vå<°,%:1°.›6Î¥ –%­L
ÀR­|1lfWAuº—sÃ:kˆ/;ÇËèP<åe×½ò®sëøY¢ÂûÝ¡ë}qG%:/\Êâ%ôvË0el[DßÖLSÚQÜÁ©:5àÉzCÛÈdŒ“Ôrï%±æ<ˆ¥Ôà-‡Û(EY¾­H…·\S™{;ãÞB;<>OÅŠ3ß‹«R©]4/KøØ”`çòÀ¬fûó9=~…¡¢àŠ(wÎQf„_YTšÉÐü5Jó7JÐ|!ÛY•åErÞÝ@íSÍ
ÐÍ§¤À^L„–%?Í¬( Î¾QÕÞùQ÷C)9Jê¹dÏ„x_?…¨N€ô]ÅN(Éä’ >sqðÃ$ñÈ›¹×ø%Š+ÔGÀ6‡Ty—¨"cq‡úi?O÷–‹ðpy^ÆW[ŽÍWYë»9¿LîrÝ/ûa×P-½¥«‚Kú8A¦äÉC€ÙðêLãšwr¨zÑ@è"ùîUâ�œ¾ïÌðDð3Âï´{µÁî´ËµØo�KË„
¢2b†d÷²y|K*Üˆª‘,æ¦27¬µ]^[âöÇüfj8í?¶¥SwÂbõ´»[âú¼üÖ¤{ÁWIzn?˜Õç³Ç5Nd~ö8�Hr|løIÛ•.‘.Ã\¥ù%/€-n7¹ŠPe]JÜ‚X`Ì½OŒ­Ü=|ÅéDÍ¸*-(u5»bÈý:s§‘»K¯‹Ú&×nœpÛûÒ+ÖlÑåV¥îb+ru	^_å•‰v	 µL,ðÃÜTP0§ê29‚ÑQ>Ò#5éÛîÖ•*2ž_G*<xŸ×—+Åaå¬ü¥ôB­z![‹Ú}?š~(¥j›	U3zšµèª ¶Dö:¶%\0R4E­%5EÉ¼Ë§P6ðkö‰o²+mÒá.QzTOp„4ßÍ¬1œf­™£9ÚMÜÙ!–|M—9Rr½o8ÇR‰zË»êª †}§€V…¿ã3û.5;áõÜ‹M€
r]I”PÒ‰Y!1òWÝéUÀžj¥ÒO†¦_’º)IÙaGQîtÄIŸù‚”×ÉŸ¥²4=±/Ë äi·¤ò$ÑŸë/Œ,•¬->c4ÅÙŒ4—Ë¸´œ3ÚsžäÕpÿ9›åË¿.sY"ûxò¥¢ï’[”
S¿EQã½ÊÁÍâsIlmÁq‰¢½$<(…Y*ù³!º‚YYKTx™YáuhúEfç-œoTÅ{ª–}=Tpfª­S²ÚM�•^'Þx°´å“Ú•÷Ð~XB;MËÇ_½—EÆEíû"×"©?bk>àæx
&Ì¾ƒâu‘o„õ…á
,úÃ}¼ló¬{¼Ûí“óÎñGB³î“*ÍÿC“ôÔÊ;ªÇƒ»
ÚlèNXÞ^ñ¼„&Ë|­{G0Ê
ª$þ …8+çx²œX§—œ¹7îÝèRÇÂSªIT¼žžÒ¥0ÕßréH¿w"g»Ü•7±)PÍ¹™L„kTÕÉ…ÞÀyä´»Ë¹Æ�VÐ‰<œñ38>KïR>`9ËÇÜ¼ú|é²6xê›ÙQ){-ŠEhL¹kCÉÃµy¶‹Ë…õ¬K>Kös¸¼mCØ4š©ÇëEk-ß¾QlÝÐmyî}¹ØíIŒ¦ŠÄÿq-†Á{ó¸6à‘ƒ‡ùq­°XæGÍ‡ÜÖ×7+ïR#ÉìÄ|\Æ0PÒÜðË|â;cR=›•0b<Wìe9¬F¨c§±89<T¡]ã±Vÿ
��ÿÿì}[oI–Þ_‰)hUÛ,ÞD©¥‰)JM%’Ë¢f¶!R’•de³n[YÕ‡CÀ~°Ã¯×kÀÀbÁ�~ð»_ü{úx~‚ãÄ%3"3.'²ª$ª›ù ±ª2#ãzîç;òºNlôP8yQ%¢ì0ïÈ8>ó„rÊA	}ÀïŸx Ù jœC´$¢‡¸œ&S"{]5ß›Ñ•_X‚5f‡Õ˜Ó
ÐbNgAÉ˜ÑÿR%lC”F]ã¸§8j�hJ°V½œyñ
×¢yäª¨nù«V¤(gB¯#¬a7¤Å!ÌÛLVƒ�6»Ì ¤rlâÎ^7— ôÜÇ&äó>ôÂ|AL‚™P	Â@æd‚ÕÃW6ÁÌ[ÀON`ÛNx‚/ˆM0:AÐFÐ
·æìGäø¬ 
gâ—£ÐMÀoQà	Ñ	Ö4tGü
‚Þž$è’@žê™ÑF5â(wö9fî½®„9Ù§íxøæ“ÉùpèA"·™E¬†øµÕ}X\Ý2ªÕ<¬¨üâ¦4›%•/ukæ¥6É®ŠÉ%ìÖ,¥Ê/@ÍÇ2¶ª2“MÖþlP)ôw÷>u<Î•™ü'ë¹ÿDEÅHU/–€ w¾ãSŸÕ—’…gÙFº/Búê,Ÿ0KÙÆWÑÇhpÛÜ*Òù»¢•:'Iô¢ï»Èû8®¢1¡'´Ëœ*ª§˜ó;áD\E·˜ªeã™Ïºžm§Ä	¸S$Và4ºmy”~‘Û†(r%Êp`á,6c›…d¸éo©¬U&_šš©±²8Õ
¾1ºTLüE”iŒ°Ëõ¢fHXÔ«ç�0Ç&’€y3Ò0$0E`áôœ¹Xôˆ™Œ'Ì`,–s’Gc#DånÒ„2nXË¥$õ’QŒât‰û¬Ã¨y±åTÊ6|•pªå’ÍÆ;«ãVÊ›‚ÇX<·‡ÓÉÝÄPk¢ƒÕ‚ŸqK½ºî¼ºw^]|+™W(09ŠûLÜ™‡O7KõŠÏc¸óÿüÄC#õ
q[Z¸óßyˆÝÿõzˆ«F¸ó/ÎwàEAáûqð—@ð?<¨�cóÎ;®4vç¿óŽÃuç¿óŽ³ëÎ;nùqîÞñÇŸ×;ž×r”N	3uË]ä~EïvúÇ¿ûüþñ²wÌìk|!W¹Ôüä%q­šé?¬_§—õuáÕ¥{t35xÙ_|
ÇÂªé*Þó'[ƒ„®i|4ŽSÐÄóF ðGþ¨p¶Kkò‰2æd@EÃæª¼²A?ÓSÔG —Á¹þGV QÄdT*†ð¤?®½L;P˜átyz}M†£è,™\µÈêI¡®ýkùñrS\´ˆO€öÌZöÌZùS|0Æs°“ÞEo°Ák€tZù7îFD�ø´+
Mt©š¿úS÷É<Ý¤Ó‰K˜¹DÆÝŒñr:ŽŽè4GÆ
û¤¸Šk8j>‚¾Ž€ZQ*Y‹‘
Ú
:p›Ÿtï—z{ðRö'›7•3èL»äUD7&„ÄSFG
Ç¦{ßðz«ÌkHË×÷ý<ê¥f­&ÁÒ©ë²ù3î‘«’\•�¤j¤&/Çu³àhÍ.×FÉj–äÛõŠ«¤lS¯1GT×¼ÊÁ€³nŽä°!Ï%½¤KÀÙ
á#Ê²íÁ"6(wJdk@E°)Û<t5#x
p3Sƒ;/Ë‚‹×(ëF½_wÀÜ»Ô¯Âf´Á„pÄ¸	ÝWä)ÄÉ¨º5¿žßŸÆ?Åƒè*Ýº¢SX¦ƒÝÍÞº|!>5H“|çh`ÂÒ1DEÔí¨'é$OZú'Ã½ö¡(ŠÙŽ÷æx_²6De‘Ÿ˜*ÏßXFRbüÒp^è1PQ†ñ\/BYänÛzûÈç·Ì¦‡YÏ³Eƒ–Ã|Èß’õ
úÏÃUù%«
×P¶Žx3@iïu¶i]€­fiŽÄÎ,ÙüÏ•vº•=—E­Þ‚v7/ÛÓºábúf§çPm/r3#írÈ´Yõ£°øä9•S(i»É=»ÕÖ€)ÌŠQ/¦:Õ†Xüš=¾ëuaqÎÌ»b‹ñ³Wb2º¿ªÕ™úŽìB¬âI<Ž.»‰Ø ç2­|1’~žŒSJˆµG2ý’J¦?ÄÑ¸ÞX"Ù—¯édvá›µ¹QmÙ‰;Ší¤Ø
	-,Žþ‹²BwôûW@¿ÙBÝ6"¾=íEƒÛIÃY×Èv<þLió!á¶è>[<þ}2š@­¾‰'¥Ð>³ào¬¥¸ZÚ»˜\M:IF1ÙOS²¥Æ¹1/*JÑ±‘º~kYÅk’@-?Y`³¶DzÑiÜƒò~¢“Z1ºº°¢6èàÁ§÷ééíIt~^#76F!ÞwøæäýöÖÁþû½ãÏOü¯=QÞ˜¥8¼™@ÔxèýoÜ;0¿¤9TÑ o=ûŠ|Cö Nû‡ˆë¼õý8¥KÞ,Ç~=€Mš¾ÚÚè»l¹ÍžïsjpâÖ»&W#°£±¦ìüÃà}fÌí%Ú‚�Îí:¥ÑàÊa}Ö9ÿ}%yÅûÝ5àœ€ž±ÖeÆŽE·fj7ÏÕêZå¹Kno¤—çu8Ü…:Ö·˜Y6\Ñç&dìOiFðÒÁôBâc³­ïÅ•õ¦›dÕb
Ô—×nÎ‘§=or»_ÍAünë?š#m�GÚø:8ÒÖ$šJ¶Ä#ºÉ>‹aœ7_Â&ðÉIt$æ±Vž¬GUçªßs¦Hí05•OŽu³±>Y{œFS{¢§¿©j?Ì"s¦¤×Ø©l1ÊAÐZ&\ËËËJ/ìÊ$k˜k¥z†•ëGŽ†ŸdEì>Q…r'Ñ—4WÈý šý›‘!-[ë|x6M
2ˆ¥‚.qëÆ.Ø—¢Ûx8¨:w»³µÜ~0B|ôáž4u^\>T¿ó"ÄcÚÒË„jïgIÔ;Úyéõ\ÊœÖ"¾ê¢X »íçY§›«’L  ð§¸Å<ñÍÇª¹Aw†½aÔ‘atÁ²B¾óCu,îO¦ócXU§‹Tÿ*I0ÄaÈ™ä÷d¥w!~X<]–ˆšO¢*fPø†UÞÆ¡
Òñ°ÒÑï°Ž¸Žû|Ï?ÔÑc#w@åèÖ-™€S¥v›¸vÏºõZÍëO]©3ÕÚûs‘a¼_3BÏ/”e‰@¤JxD{nµüXü)™Ty7æ=ò�- fµr@Œ{Ì=PN%?{»T¹¡o,ã”	û¾ÉYBiÖdÑ˜l¨LW)èØNF`Ê0GæpG„#-	z'Üå’žcE(YIY­0Q?"CÂTêIXÔÔ
¡›ÒD5ùå4Ø*ZºL�6ò»ÌKz¸eçÈÈªK³£§º3:=Ó#t`œÊ¦#HÜû°·Ó"÷<MØíC¾‰µÚö¬oä
sq%©®˜}gôv8gûhïyË×û9Ï–Ó‰TÐë]XôlŽ¥	ÏÊ]©¬„u´ÏÈ‡bó¦c³e
ªé~MçÛÖ´¬æÛÌsÇoäéqRT¢V)²UlW×ÅY5“9*
k®Kú­9®’ýRöúéS¥Ò€WøH<ˆú£¤Ž”uûtz9IÈŠ#BÖåR¡ý‚ÃQ¥Q¯3TGIå*s–…ÕYhS‘|ÑÁ¿Y3N7J&¸ˆl+¡ÌdkoQëàÒ‰Ù}NÌÖÕyvœòåwÏ
Up—ÇBK7‰$«L{£Í‚:óÜŠ#_½;«ò2éÅ'´oR-|àÈ®*1!|¦ý¯—UÛTûé.
âò ÷‚;‚(\OÒžÄjLŽ‡Üº“ãA§•_– {6ßÊ>Ü2ó÷ä–JA>,Åkg ðX·£Œì^{äˆqD©…yš@õiOûÌ¨¬”’Ñq'%Éy^qŽŒ˜ùabDeô3g›hæñíÜf¢lmþÜ²Ú•ûIí:uú�„±-ãRx;" ‘µJ™,™·×°~äLÉ/&vùÅ)\Zëˆ<Ž‡Ï1õ'ñx]F	©gì¤±˜@`"”Rëü+ ÕVý
ç¿M§<“5±ý;óŽHÿÜ*­–*?€(]€µ±*WÔðE÷•M
_pËô
FFÀó;)½öN©z²GÙ\'.Y¥•æƒG#›RPljL…~ð¨YFYR¡âî	—gÔf¢ÓtØ›Rîá=ŒÐén®­¬£ÉVøŠ}QXrÉ…7ì\Øå^äÎEhÓ¶yFt'Ç\­{Z{ÚLG–ÚZ"—êm‰DF±·³¼¼lkHø(GÑÎ¶“L¦FÑ‰`jp4õš©à�+B/Á‰iÒH‰€³c÷	fujý©tpWsV=Ð¶#@´Æ…âuõ•“òyøÒIøÎÏ¶\3ÉÉVTZ	Øè†\½ÎàËX@äÈƒB§AÎŽTÈYöÁio1ð3—‘ÏÝU.¬¶ÂÞ“ZõÍ—éx¿ÚÝ—ƒtºµÐÂa^µµ¶©|læ5}û86ä_
|ý˜€Û|uk›Ê‡Àf¶.‡}ºRxœÁAì
Àb¾lú$5f"üJû^R1?­mš¾
lx8H§}Ö·h4¥Rlñ›ÐIèP©%I'c>à-Ú?r2¥ÚÛO¯x%�D_Û¸wŒÙc_r/ê6 6©ü ÆÃsæ¢üª"xÀo±fI°l‘8ŽÏèáOý¥¥ˆè¥¢ÏÚk|‡zö¸ø`çê¬º¿ÜÈÿ³Ã;ÏÜyvhgg{Ï¥«j–f°ÈÎ®6òB½xTçùc:#¥iÌéìÂññ€ ÏÙNOÐ�ÆaàÅJ&f<$™×”²ÐŒ ÇÕŽ¿›àn\ða{°¼8ÇBS˜ÒñÆi´Ï„p<º±1ØB†ZTƒ6v€“ÜN‰)‚iŒÁ3žiñæŽc<'ÈÚÏŒ_<û¸°¸Å&2ç™‹ê(Æ¾a¹êìµ`<@Ž>ÆÙ¾ˆ.%cæãa¡ ûã„)¼doà,Pè]–YÑ­’¿¼üî 6>€\tï1÷P<‚“}—8ð
mþfkI¹»j®=Ô°W³T{dT×�Çÿº–MQpK¹üûîò=v¥‹J1¥ÌÓÁá'p¸ãìiFA‰ªÓ>ÙêD¹þ£FÉØD¾à-–ËÂ¹éûå”`ÄNŽÛfYíg…‚{,hk™dB¨~Yü—ò¨2ßÆ„Å–. ˆ«tv|f‹—ôH ƒ¿3#E9ÙÉ–ëØ…2Ž›‡Dƒk†OƒHo\1N8Í©Ø¦O*…x¬)2W:‡ÊÖ*,fÃ¹g68¡.fzBh
µÓ%YîÏâ’lH¤!hN±b£Q¿SÔütµ%FoÝd»¶cÂ”Å�ëj
Ñ³Æ†ÏªúV!ð­bØ[µ 7/ŽUMfW®«Õ:«û./9ï]‡ß]'Ó	¥ä"„;h{¸ÌÌúWóÌÄÛêtˆRÜ >™>nÆN.ô9,™ñ…Éð*ßcÆÁ•±€àÎ­ï •™¦§œµ¶Ž²ù$É™^g!˜€5\Òä:)6ôÉ*‰ò4U\U­×Yœ.´ASb"öeÕ^œÅùü¢yµÄBögï¢Å?½}üð§ïÈ§^öù|îŠ':­.»¥û.w«¸Î”Ä¢GËÛ+“¿à|C½|J Fíéi¶!Tè**$Ê“å-\d…KÐ\zï2..ÏÑ)ÞúÒ$\a‰†”¥uTü¾3g)³1¸“–D¥pE­ÚŽÆS«ölK’ÁF’†beL ÃÑù=ˆD#:*}K€1¦])Â¸u4ÂH©Ô¯Š$‹_ÆL�:ÇÌ:ÀHÁ
ÛáòÆ÷;Q ½ñý–£ë•#eÚ²†ìN¿‘y`ÞÙÏéÙxØëQâ2 ²·e‰ÓÉUñß?Ä§—ÉäP´ÚfÒ½
A¶ÃéY·f–~qæ ¶xÚÒ�EU\öàÛUE®{I©ú=yõkÀl9Ÿ–X{'Ü ìÄÄS©ÿ)âÉLSìD¤ ãß»–[žHÀ:Ö=@¤»PÓŒU57SŠQÒ…\¹Íª
V\’h%YîX‹X\‡Ö¿ì‡oNj³í|‘
Á:^Ú™Áûsm?s&ÞTu/d!­Á¬çA2!imUÂxÈj¹šÍÊ+–e­«²»ž#z<˜¦‹dØ~™ääpH8Ñºì9�no”DXvú\¬)ø„�gûYÊžã.§ÔƒU¯®qüÓd»qGEüoväY ‡ó‰�h3¸DÞUD(sQG¸Ü}3æ¬m@ÂCN/áx^q{½=¶Xí»¯ “É3t
'$7¸óÀb€Xon¨røV-¹”7–3
—c9Ë<º(à×Fpd¬Ü\(ŽïÔùÓxàBœ85ÛÇ!yíÇ“ä2Ëþ!u±‡Ý–Ò'ÒŒãÚnWÈÎð£"ÀÄÆ”²�ÜÐ…¼†m˜<-œy{î8\½xB·	ÐŠ *Ó§³^ž”et"üIiBŒB7ÔžöOõ†Rö
`küÖv¾Ôy =ÇÏÙdÐ)Yž_ñ/RG~%ç¤.Ÿ^Ng½)=/õËà m¥ÝZ"q·\F)¹ŒÏ’^­Ñð,)L9ƒR—ðíïOŽ·Ú/_×Ü=%¥Ùª¿Øq°wð=9:ñ>ý¶pþ^“ÒJ×^FIJå’×V8ŠH…Ü7¼ow3š÷(ÑR×‚Ÿ_:Ç§T™°¯�üZmúU$ûN¼{à*;¯ÆñO<èÕ7Ê÷áf7`)!’ì´à/ßÍòô·ÔÉò=¤Ÿ÷–¾]|çg¼¥Ï°ûÁ›†óH[.à²¬ÞjYÆÎ%¢¸âþnJUmÒž^\P!€6›’çÝddÊÉ/£5(Ï5æ¹Çý‰'fõºnfÇÎ¥}FÞÖJ<¹¶õ1L|™L¡f!|Ûž(£Ž„‡¾ÙNè£„%õ h|'“yìzàjÑW«ÙbôÁ,ë‹u ëÕnö~5«‹~ÜçäîÎ¢nX7ãÜ6Iz	í¿áÇèÒÙ£ƒO³¥ó†Ãû
4üb!óy»¾x]œU‡_h´yÍ,™M")46ƒTWI2Éç<D@ë3	)pÍEPQª&¬ÈA‡,Ê«gZàòÏ ¼(Cª*À(MT]ÿDTfàB
4påBM~ž0ÏU’oàšIÆ«¢œ—GÖa·øƒÃ„5Oïä‚PÉ²íí~If#_7Ääq+¹1³RÌkvsDÃ­¢ù=O)eÆ—•¾7¸°Záò&La´Ïi—=ëáWdàzO†X1ùÌ`ßrb@ÀU4�¢«~<˜Ð>t‡Ž:æ`ÍìW3S±O©S;[²(ója>Í¥ ýòô3´­Ùé«Ð1žoµwk›'ÓÀ­*ÑðÉ$¶MfÖ=§Ó¹eþ–Ü (¿,Ê $¢7SQ—u
í;xä!—XÖŸ*˜Ývb¡
7øê8w$b$BÝ'›Ê‡
„"úxo{kgOm³hšæ*pw�B!:!¡SÌñµëûÝi:Mµü,ÌÒp³l.!7¬}x
{MÈÌàQÙ§õ<ËNÍZ)„.<Ê#Ö•#äSžØÖ­*ôQ¶ÿÈK!­I0žb–³ò×?ÿóÿ’K†Õ[!û½$Ðÿ¥ôå§¼VŒh@`]“piHƒÜe8€±äØ;lçf¾Æ“eÉi^G—ýé˜NÇöèr™lO;	iGô®tØð½´Ä9bº¹ÆÁŠnÆ6à
`¼yÙÿ0ö—'¶Áo²˜•Èƒµ>f’SU¨Žã(…˜le?¶B‚lÜ4.õÝ`*[¾f)«Ä<®<^ºã£/ËéÉ(éF—KäÈˆ�ïLé&†çÂ‚Â"%ÜøtEÕ½1øØ)ÌÃ·­Y°r¼VP]Ïd˜Ð_ùœmçŠÒ†äŒp9Oâ^Çå†)Ç�Ó*}©’
ÖÅ9±:LüÞC"2w30À•R©B¥2‘ÎÝ¬¯‚:Áž«Â2•bI3èpINÈ<Wbå=¶/ëÃhp•¢bÿUâC5Áö&t½ÿzëàÍÖ«÷ïk8{7wžô£Á4ê1îö�ƒú£I½ÀjùäòíÞrNÐ;™·Œu*8"ïôÉm©Ý¾AõídÀt5 £¥`ÁÙÝ�æè`¦k ž«1S|P \¨˜O/î®iÕ6›MQÀ»@H³‰ÑÜàºæN‰AÜ;d÷Ô4ú0ÂM¬vŠ9ƒéßî.üí—
iàFÿkãqY¨õ‹YTÊæ·„“Þ¾f‡n\|Ê+¿Ç¥ÀÂe4é0
XR°Ýœ™½®"ÛûâŒp[ÚÑ89@·I¢QD~€¯v†-ôÌ×#Ä²B3ìÓów	”}D1ÄJ,qŽLÏÙøÈ¦|ÄGˆäU¹£‡íç»ÄpÉ >Üå
ÜÅÚý·|M<É5ý|ÓÍ9ùgtÏ6çÀ8çÀ:±ÌÏ>14„…òÉ
ä 8Š0)TõV;4p³#–“áÌG¦+ã¸ñ—ójÂƒ!Y¬©ïí»Ìe«+6—jÀD7ÐŒ§U‘}G0¢—ñ«¼G)ÈÊ)ûjáœ)wk8øC7Ž{
šÆFœœð�àHPC¿¾.WÛÛˆì8‹YëÌÆöŽ¼ý¦Õj~dÙòMú8ôm”š<jæ]+ˆ7ªÞžP>á¾}Ye2VÍ(xý˜PQÓŒÒ/zvkìps"‚Åjï'Ã±—b
qÕ¼P-®×‹ÆíäÂ�·è[¸0Y¶py�‡‘¶.W§€)}–Ù
ZfÛd‘Ê ×àè»óöÔ§y­æh Å¹‹ïï**,˜79ˆ!Bý€­IzGXm¦üJ6ÒyB}†Á^CB²ÅjÁ\âžáøÒ-6ÖÍ§¬\	ý“®{{l¦x»tÒ0¡,¥˜4;“†ëkLÔ¾mì./¤ºÏê5~,ôHA]î8¨~ý²8hÉ\Zf-·™;^Œ‡iª²F±WæŠ¼Ý_ÌXå-á‹úZÝ1GrÇï˜ãb™#£,;{¿‘úv<N“nƒóHJ('Ã>åjé—d—Ï»ñÙåód|Ö‹Ç/•¶_ÇDëœã8êzWÁ<Xý™/±Óc–­‘ÉH²G?£r¬ßw¬ÓÄð3Ñ%ûÏVC¥>‹xî«óünÚïE]%Æ~NƒŠ¡Úhñâ=ŽTùv!>öG¤ÂH’@U£:³Å”ë~w)††ÁØùÝìó&ïDÉyˆ’³œWôœ|]	‰»ÓÓéà¢Õ÷c‚Cê‡#<ç˜›™¿._q“âUJ&^†f/(7‡Ð×¦ñ�ÊÜìu2ØkrÖ;ÐörTMU_æQÂµÆwâS†#x~NÛ¦Ü>Ë‚TìEºXï è~GIÃ;Ú{s²uð=]xŸ«wò*“üéO›DGNÑ‡£“ï›GÇ‡¿kÞ»V›¹ù€k¨®®¢ï¢ÿ“dÒ‹mŽY¥IVæV¿¯ë\î†òû—ó=žµ(4¹ò-mÙ}Q¢qÉ76<©îógê'Ø­ÜT¨>å{Ã8>Xd®öÙDƒ¢ î›g¥•R;‘7Üðõ’¹~2àés¹½3ûL“…(á«‘{×ÅÞÐÃÐ"µšçõn;ŸÃÂ—¬Æüñ€÷»–”Ò9JÝztºêI*ZßbôÏ}xÈà0¨ŽX•rÁ{ØLÀ"_ß{P!zn Tö¶ã'ão
 d@Ô³Ó9KÇqÒ?¥<?†¾w<jè}PÈÍ8{‡‹Ž[§¨„zX¡"œbpÏ“³¤ÏÏÞÔ	#MÁóm?eÁÁO^ŠokÄ‡?§Ö8½žWkg|µj6F¹¼kJmšUr'ðR¸ê¢¥Ì‡ëEó!ÿEËód•æ­oñ÷<œMßšO\“ò>£'‘q±ç¢’¯p¦îS-'úH?×ß&ÓKHa<^}\H€Ö\I”‡ËÐQhº)ÿ}<è!ëzw’Ét :¢I/žAA·{ð²Êbï Uñ0iÓíÑK0¶ÿ–©A~ÉsH@Ÿ�…ÐÊ9A£_H"¹BvŽ\àð@R…Ö¹ë¯²Pq°ö
@ªT’=aò/]PÛnWäæÉuPò'$„*¢1t"ûÛìžw~9¥=Ÿ¤H&ÝzíûãÃ7Gï¶^¿hað7•Q(
Žcf‚Õ[[©yyB™¶ÖUA
uör«½}x0¿~ÊöæÙSÞæû“ã¿ŸG?ÕÖ‚{é{7ÖàQïÏØ¡ÿKÓAÞYo€Ã®UÞ…I£Ó»Ö™s|
„²(~eÖw˜ñ ÷s4è>5e¬Ï“Õ¢Ë–B„y`WX‚T y«3·Ç¥›ä
d›D·VðÎ‡ØKì3bÒx‚t›JZŒ__±i&•”†jÊA%À¹nbŠçadÊÞ [˜î]ËlRšÉuQVVfp]HÈé¹Ð=ªëè‘Ë!d8sNôgPy˜@žYï„¾s_Pu'¡‚3ËÊY!{;â§i6«hUi#FÈzïWt½gºEnÎ*…Ð$V¤nQß9Z’ÚÄáˆµîÚü(‹èâ³ÇXW¼Ø%¬çUÜ¹�€úê¸?êÑIˆÛÓ~Ÿª½±HÊ¦_WA3ùpAOñèý½kú¼°fgF×š¬Ý‚ÉÜœC’?D~þwÿ´“T¸´øG“ç,¶àìjoçFAim?Jªì
<û‚±¶­Õ_MQÊ!Â«ç…¬bobOƒ}[Ìƒ+ŒIš
5{æóê)–ïçâ¯¹$y©]wÈ=™”¹âêv(ý	¾Š2½$-iÌeÁ}®šOu7s©¦ M¦)ù
îÖÞÿ#¡ŸŽÒ×Ñˆîhò–ž**O³0ðwðÅ€Iü‹ßrÈPU]ûî·<=ëXnòá1MTI»¡ƒ¹¾ÁôD™�P^Dg]9æ¬”3“Rï,³ÂÚg)³'(K
5‚pº¦þ:=Pvî€û[ß€[×.¦*f“ýº¢?s+V‡ugI.ÎÛwK¥%Y%¨eÀÁ®d™‰h¦ÌaÏXÂÄÛw
Jñ:SªÝ×£%rÊ1"ß’Sa¶„L (x™oy4M»u¿
llAŸòíSò:št)úT_]¢{„w4ÙÐpˆ/¨»Æ1 äð´InOKëYßDõ§‹1–Â¥qAú¨`R:ëcvª{ùÏ8Æg~òA}«ßH¸¡‘
Âsú\7¼A}bXhàvˆÔ<D‰[lF6š¬Ä¹T&Êb¯¨‘mpj˜‚yƒâ"ž´áÏi/~9óQÔ;KYxÑ9OÑà,õbC"‰€Kô“ÄÞÌHð˜Žã÷,ª³)¾eûâ{¾²ùÀŠÂ¹è¨>øÎ/¯¿þù_þ=yKŸ:ƒBR}nªA0Qíæ¹å†ŽëZã6ôtPq>1ÃÄÐãô'.WfÃƒ0ÉØ3vŠ¼¡>üš\dÃuëš“R£>£Ú™‰Ç/ÿ‚ó‚ŠõBÔp[Gßß5‹ñ?¹¹é�ŠÀßõ o€Ò˜Ôàéz5¿�w[q-mÊôm%-4êõ¶‡ãñðã*¸ÑË*§ù‰gá‡	;ù§YØ¥—råëSêÉ³ÒWtÈgÉŒ<2Ì½¡PüÌ·A{Àe{c“LßÁ5ø+Óô–•|di¬_fd/F¥ÿâRg}ó7ù’Í¦½ž³Ü£Êñ{–¼,Òƒ9Ôn‰WH½Þ’0J¶c¨h
³¤?C!oh+»¡ž÷|IíË’yÁ/Äs¹Xgæù»KFS}mÃ9c(^ŒDèâã¨g£96OÇä|<ìg6WžÿS5‡cpt³o H¿AX}×uóïý&yVàcÃŸai­™{6ì‘´ßbSÚkE6~¤„%9¿jžÆ“q<`Hê÷ÉèªŠðîêý\_u×	qt¨TÝÃ$k^¨¨„ÿhUùä®RãÄŽ'Ï‡É Wë«7þôOö”/ÃO²#€{o(l°š6(Å ¹qsOé9½DÎ¡²r¨rS�Þæs¤ÞÄ
²àîín”F«ø;Šù-Q{_™ÍTRL8«Awc–õú”*þe©Bº¯˜wI;Š&do@åø'édQZÅ7Ž‡i,2^é{ûÃÁPº‘j›fÛp‰Ž6nèÂ±Ö‘CG/3òœ`os—	®$Ä¯k#kÙ$«~¸ì¬cØ¥Å•ËÎ¯JØù\;¿8_æXÏ˜ûÔÈ|qz³ÚªDI)
*X
Ö*§6Ì1STi¿ª©$¨åpày¨È«¤"`Pô1„5)s[ESt¢‚ÀÂd³{q.•±jÞ§œJ�çìý¡Zÿ6guŽ/}æÙelÃÂKå„óºFfYeö,‰š_xÏÏÿúÁr	óÆ‘:šhãí0þz½Úý_‘êF½s•H±óÏ6†q¾È
Y¯@[¾�ÑÒö•-}¿@¢•‘,{tÏ}I³øÇGeª5¬Î—šÑ‡M³½z°ú7¡@îø�yaÐç1b¥#
.(¨¶´GþnJiÝ™ÑÄUJ-k» °jš­ƒjžÜ@+ÈÅvå6„
w Ë«
±%î§†ûuÒLÏÉa˜â™oÛÚ&÷Ó%ƒ£~4ÐÜ*VQE„86ÊÃ¨67¹Æ¦ö ºRQ?¹
Ë¢Ô?,/L{Ú‰ºYÐFAdB-ÍqÌ|Þ¿†…az»qUyÝáÉX ý/`eäë‘V‰kÕÖ¼ÉÂÇ>4ïVT5Èò�ÜãYED—áÍ
_ñ¢;ˆ¤jõÙºì&ãê‹~ýÁ°ê÷®uëº,R	
¨‹-5tÈ†aC¨o…XDC/¾ùbßlµÉ_ÿü_þ“+—Mô<w^ØÇÑ%•³À0:ÎC‰ÂÀuÑµ²,¾ˆ;Üý×‹“.ÞòdË›Å™½üæú¢Ÿ Ti·Äé1Ö/ª{ÿË&Ç	Dƒt81×'ñø2J&­ s³ñ”æ’yÁzÊ/Úd‹\Û›,W
C_ÆÞjß;`ò êh³ÛÜxD@Y9ïQâªM'CÀÃTâƒË;!,šˆ}·D¢½Î§€ 3Þ{´¶ÂbpØ›´ xi5íüd.½O-ÐMyËlŽ¹u©Î_Ãû¦òûý>õQZ-Ìü$š½^pZO äÜ¬ƒ6¾J·®˜vÛ²vMnãlßà÷Y�yrÏFQ€àšï['NÏÆ	´B‹ÍjgÜ*S(ˆ8ý	¬IàœsÂhwweŒÆ¨Oð)Ž“‹dõ¶˜!Iñn‰7{ë™±ÙÑº@q<®ê=«4ñ¡·ãŽ*¤¬ž7ãAHû›ÿ´fÙ>k_Ü9é&éIÒ…–€%é¢ßÅí/÷š\Æû5C	«¤¸wQ"(|ßS©0c$Í³°Vió|ÝÈÀÆw8çZãr­Ñ8ËÉ
¥äµ÷¦ýlª={!ËSV·ò™sn6¦ÞçÅ¬i»\uy1µL5£ÂêùåìÓÆà˜^jÒôËS…?h—)ˆÜŒ)d:ßPo‚œ¯\©ÝÃáŽn6#¸€ºù›R�ó3D3"PY„ç³×Çg‘Ì ¢\ÃãYDeö²B@¥¯“ÎT…¬ÑÊ)LT¨Ýø ÀUýLô¾Th¸0Á‚°™,XTJB”/ÕLvÇt®›L€\«ÉÐ¼uDhžU«ÅøTF8`²Ëf5zœ¼8Þ?<x±ßÞ#û/ˆÈÞ!GÇ‡?¼Ø§"F¶ñD®‚Â­£rÀ†B
tØiÜO8r+ÿI8®pÓ,-<Ü'´Ïöü¥Q Ïô@£,nÌaÉñ@Û©p„¼ŽÒéåÊÎ‘»;¥Õwô/?½3ôMËÊñ÷Ì­ÃðžàÎ`¹_ù©º¡zÊy¯ãN2Å…ê*ùÓTØ `¥
E¡Ò‡•#—19N>Ò›&ä8ŽztÞ ž5î›¨?úm›V@C .Ïãh!fjüûãÒ„kð Žvªà{:šób|ÂŠói|ßLøœa-b0:ÃZôátÂåÁê„«È:ú¥SU}zb`¾Ö QL`È_<:¥?÷OöI³« wQcn	Å|Ò}P©ŒÃŒé2¡çôLx\¤¤võyšÓGÆô|¡„OVºP4ÍyøÏvŽvÿp@Þœ¼Ù§ÒÎ«½]€^ï‘‡Wà
9Ú:nïm½jxk×HÀ53O¨>%ÃB6‹V£½Ÿ¡Bh©~êÏÞP6µ®z
Þ“ë7ìøgõréS§3ü®:WèkI”’hpÕÈ¿§íîfo+ßln»+M $Áe¦ï•ôÊìg\³Úärþ¬C*üj£É#Kõbú!ÌÙº¯¨“/PûŠ§ÿXÛèÙÏå¯¶wfŸö>Ñ’S,ªb(g@œè+ýÒAµ“¥†PO·
Û‡Ó¼÷íç»/vÞ¼zÑ~k>IµÚ;úbüÍb9�€¥á_ff.QW£ùG9CÌ,ˆÏN…
˜P¶Jl€ AiWr1 ïGEaBü¤J,óO†?�—G¦šñ¿-1â½,ÚHPpê†„Aøžµ�ÿZYñB„¨pR@àjÐ=cRykÎÑ	žX)u’3Ë³:dîv0´ótÅÛË¡­{$‹‹ˆæ(Ò¾Œû‘˜¬¹Gm J±Š[½PÝùUí–ø´0I/pöúJ…µáš­¸6\ŒBÑ'ð�UÕÓ *&Aèó
Ø	ø§C’8IÅÞõÄhU¹öèyúD×J=� F²ïëõI¤´%’t>I€5·ÃŠ=#)`ÁŠ·È`[Í{×ôö›ò{&ÝL¸ $¿
ÙZO7_Â¯±P�ô¾U›|‡_ÑmhY{2¬
>0:Ä‚®f¥Žx¿%k7‚ßfDh#=L$D›ÉøÓˆm¿­ì»U|ûèWVÈó¨wÆ€ ¨Šÿ”§)_£g†LºIJ9p|–œ'glN‡M‚¡”\( ºe2Î³"´[È™–8Y#¶wEñºÁp"vú—MÊV–¶(a‡ô@âÐ¥Ó¾<5KDéýžn‹‘L8{)Õåóý¡ú–´­Ó,Ns�õQug±Õžjïåñê7-ííƒp#ˆ8lsì2ØñÆŒ!'2ß4¾ç@5ÔÖÀb¸ýâÕ›×d{ë‡­c†ÃYüýÍÃJ3ý$N§Ñ¤B|ˆ>¦àqXK–¯/Ì)My\EûVÎ\x;y,mI
L‡v¶‡tÀpå7BÞ*3µSÁÏH^Ti¨`Òâ°‘oŸ–º•¸í$¼©½ÁOÃä,¦Ý¡ó,<ÿ´Qÿ‚á6³þƒŠ¬_j—™Aé›b%§y¿:S¥OòƒÖùe¹/¢à~àå2œœ…L45"Êo€¾c96hÃ¥<RÐ¡4lx’¼hŒ…éÙ¥šü`µ'ŸÃî Æ‰Ô­e…dµõª¸Z&”W\ÆüÒ=‘n“pÃØ{û£—IÄLTDaìÖÂ
˜´Ñ0¹2o8ãäs“)uqnNrÜ—–â*Ép!óbSQrË—'—ÛB›eb;ê\ÄE)J•€°¢ pPÅ©È Påç `c•Wƒ3ë"éFfü|þ2pS3*ý¡qÓ “,yëÛkeÞnÞ(†$ä)ð"d>œ¸T¹×¦a·ÁDi�øÖûy÷¥æL¸¬.’4á.8["Tt»¤²Zš,‘ƒa¢÷‰XÜ%Ò¡OÓ‡®âØRhKìãQ.ÅñZà4ŒÆiõþ`l¤*¢ÓSÊµW÷»€#°~eV�gÏÃÄËÙlçFÀº<+d†¢™òÊ* žDÝh„H¢CXŸ$ƒÑc]å˜704ŒÀÃàd»T
‹ÇOkÏéÔ»-9Š5(¿Ò€ÁðÏë”‰=LÖ0Í¼z™$œ‰·dàÕHM-Ô´5Ý¦‹¤T„ÜrüHuwLã+@é4ˆ¸ˆ’Hù5ŽÿašPÑÀ{«?r•€üÕžØŒºCÑ!-0åë<»;G€~CÚñ„ò¤.iíÃpNT‹æ»£+un5É¯úøbÏ$â–;æ'Gñ8¥* ´Qÿ¿¶¨ãÏu8ÌqM'ñèimuyÅ5rq(EÞNBOÅSQÚFè´ß?ºàêã8êzW³j¾Öùþƒ-,GTe‡c@L…]6‡£k4xlEç‘–6sHúòÏÿö¿Ii­y=õPfrU±åQ¦¿l‰AØ¶;ýÜåt(…ùD¶‹©Å0li”(ðjnôÿÊYvÅš¤òB™:t+2_©ÍŸÿí?e\WSâÁ´K%Ô6Ýi”4Bì9…÷pëš|Û?ýËLê2õaEd8óŒ3¿Šò6þŸÿH”/ðÍâÍG^ÊšÓYé*7÷‹”§M1…9šÃÉeDEñ¡9CZP'aIôXF	èQšfM°)4²Ü/ºÿØ6 „šnL&P�‘FÜr'BØ.zD8¿˜üØ¡ã©.Í•\¤‹áš‡÷NÙs_öÜxt9ZÕûÅóÈD¤Ô‰Xó¡¹œUHQ>Ö:¸½èÿ†ý„Å\ñ8
Tœû�2
ŽÅã‡µŸ¯\1è7Â‘p><ä(Oy8GzZ+Eÿ5OØ<%ÉÂº2p“Úf]mÕÑk…7cü	«Å‡HÀ/¿ßà¯Àþ9Ìù+¥öGÜë-©}ö+´ºÂ¯¼ñŽð»oXˆr¾¾Øé:`ñpŠT-ée¾¨n­÷ç‰¢Îòô…êfzedÂbÿS‘íhpÉ·Õ9Æhñ¯ÉPBŒìVÁ½ÍW:º¿Œƒë9¶ÞCë¹Á:Žç–ø[–Õ|5ˆúÉ´Ô(ÄÌ•iÐÒ!:þðÍ	ÛÌ|N"öƒ½~€²Õ²šÎ´…š+/ßF~²Ä|ªŽš¼ùùkj~þý‡,?QNÏönwž…èa’äÎJû¶z	£	Ñ £ÏN9ù;Iè„o§©‹Ð!ˆÆ¶X¤+rï¸xp*–(wÛ¦ñà%}E)K˜}Â¨J²ê %óÌ¿RD©Üî½•ÐRzëŠnƒt8ˆz»Œö·´‘Š“ó~{ë`ÿýÎÞñ‹çô=£$"…™¤¯?ÍèùË(I£y
yµ£ˆÔ·:Àø0ÁÃ)ó)Á®Btƒ¾ÊtÏÑ‹ãöáÁÖ«÷'Ç[í—/ŽY‡_ì¿8ØT¨è;ëzþ6_Ïn|5ê=ÑÉF–òXÊFZ®8ö‡µ¨„å¾ä-ôxË“®Ô}d S^Þ¢±"§QÙÅh<<F7³psm™ìS9é„´)-ê%tÌ¯èÁLÁóSg¡ÉÇñeÌPé=T¢’·!m½†×—÷Ææú21½+ÿ8NN£„]í='u ¾5=¡HÃºÒ>zq°SÛ¼/ú!ßW§¯k¨£fA|¯¢d0¸¢gj;îEƒ£•†Õ¿Ú'©¯¦Âa‡íºY®(ƒ£§OÔ8…YŠtf.`G¿:q”)8ON(ø@XŒ’�ìˆ5)	m+|¸Ö3°Ú9¨¾Éõz…âzšÆ¯£Á4êÁ&÷Û¿ª	,âÙÅD¡#É
šÎ~<I.É�"iGùìþÈf—ŸùÓh<¥,¸ŠõBgŽó¶T÷üÌ·•5Í'°—RÃdî†f¬T’‘®ðåøÕÏ£^##Ûv‡M,Cfj¡ò¯e“Ä:‹B~°mÆ°ÚœÎÅaýóü¯ÂïÉâGv¢sz,x¬<¶7¶ÜÂô…Ÿ‰œVÂ˜qÂmpH.Ð&&­¿ÿzëà
ÞdOËd<Å–°ã‚=ôh˜žØT¦èÈ-à<ß~æ\µ³B¨Ë¡<‰”~‚h°BÞô§ýÀ¬Ék¾Êƒ¸wÈž‰“´€>Z^ý;Ë	ƒ¿Ñ0=p3Ò/‡
^ŸX…l~K¸PÆI6f~ÚéIYH4Î-Ü"ÈÛ¼ø~®
qÎ¯	…ƒ<?Y@ÛJ|NÉ6•ç?«à©U€‰"Ø°E^u€DŽã^ô)îx%ƒ²í2AeAºhq[/ËCìPÝõ4žpñŠù‚ŽN˜u¢“Œ˜]¢—ÜPrÓ_zQŸPÑ³3¤w	3œÀ¹^ö:~På¥§y¹»qe©^SDúqŸe¹Â¼C¼›aýò)|fÏÉöôrJ¶ã”Ê¸ßýaoØ'í®§Ý˜.Òs†nhµ¿”ÁÎŽ‚SÃÆê3§‰uÚPóg´£XQ‹W2àb—$š@÷š!‹‰:´OÝð9&}Œ±]íí(‡±®ÎêÞÎ¬"¿	k@**FZ‘Ãédø=`¶³Â‹žúu!Æù’¢¿<¾ç^#Îg”Ð•Š‚6ähº½ƒçMˆõ>Ø‡ÿŽŽÛM×Ãû“.»r‡òWx\_2h"k:›VÈÁ0ó‡ÜÞS;Ž/eÇçwJ•Fƒí«_•òp elUØvöŽ÷ÈÚÆú*4­ýêxïÒ~±ˆ3j“‚Üç3L„?ÍYåYOue½T¤ÁRÝçx2Öl0ÂU‹I¡Šâ.ÂáÅÇåˆ-A!Bv§§ÓÁhûàˆ=1‚©õW	ýWÔ°Þt¦—k4ê%”f1É>òÄ×¡œaÂ àédˆ- Ø@éS§oQÙã(>‹ºõS:ú­¬4”M+ àœÓÀ«Ì[y"m,žø(Sê³;X½5·®ÅPß>ùù_ÿB`Žšl’H;N§QÂ`ŠH”;ÏVð+øþ°Õª–ûëÂŠjÕ¼QÌÛ·OÂâ™¥ÐÓp¨Ä}]AÅžƒ‚Úf†8~‚éIö•"Qº\æ ²‡Øì‰´ïL¤àu9a…ð«+|Ëø²é‚Ùîí-e¦…í€©,ÚyKWúCeèpfQÜÖ»R/¾Mú^Je©¨—ü1ž­I[,]+GÇù^úÞboöFpåir^±.¤ÇÎSór¤‡ÃìÁÂOº�()x3H.¹uàœvCšC(Aö+”Eo¢‘#T&)3õt®d§è÷�‡Œ‚‡a]Â¥Õ4½àÇ-«¼õèÐâúËàË-s©Y=%cUKóÆØ¿y´÷<�T¹¨!\šk¼œt2ÖX3À°ŸB�á*´QÛoÕnH“\ç³qC©ÅX8Î‹ÙÜøaý·”Êo1`JÞ_moI
âHK¿é¦AÞrŒÄã¹†eh™gQ/XÆµ¤ÓÜÛ©5ÙTž¸v
.N(•RH¤sVÉàcóÁº¡~“d°ò68
®P¸4#ŒÅÖ¹­‚F$QpØlÂ=5î¤×¸"udêügˆÑã—fSˆ¥È0KT˜\¨›€Q–Ÿv‰ˆÀÑ!ƒ—q5aÔüÂÙò+4
_•bøU¤ÅaK1ê=U]¹$Åâ·A
#ærêrî{òÎ>Ñ]µ¬ÎÛ8f•çÙ)æ+ÖøB5#¯—L0F}�,ËØ­…—JþúçÿñÏÿïÿþöX #0ø…DxÆÕàž^±«Cá†¥9š~!Âkÿýò6P90,Käšp++–Y%7ïl-Ø¼Í³™6¿%'´å¨K˜Å[µCô`nE]Ÿ­s~ÜVJÊŸ¤4uÊ5QÈÐc[>i‹ó(L_Yè›‘(„IôQox¥IåšaÿG§iÑ\ž× ûƒ{üèç¶óU€®‚kÁ°Î×Fƒ<¡,ýá£¸Ó£K`Mß5„ª
Úap­ª¤çu¸e…½Ö5Èjo˜5¼¢ÃoÞ‘5°Óá”IÐ×öþŒn}bsŸš:´ú>•Ù!G|1£G?O£/‘ïðeÙ¦QZ~þÀå@9ŽùâRäíÎ–bzß—IÔ2$áõy|.Ã¤ìNLB'ôCÔ U¬0Õª‚J¥wçç% å¹¿áÝÅÚ­R©*i]~–iNé£õr@Œäåcþ<®ˆÒK9WJ…Ù®sÌÜ²ìüùd7TØúi[¢àW2é‰2bU<ª¼æ=?Yå4�/~+V'¸^ïÏØúÐÿ—ÙûØ”goþæþKÈt´÷ædëàûZ•YDªâŠZª+"ûŽ}V…ul(‹Ü"pJíGõl«£ñðG:ç¬ÉgËÙ'
O.û×(rŸÍ™ßFî_4"«$—@x™&ƒg9“bhˆ3ùÚt$«›Y?;üÔN&;³²rC¶`¥q1¾eîUîÐXm…JfsŸrþœöbzðùÀX‹KòH@<YÁ‡Ž$&šóZ-½Ç^¾L]eò{Æ9šâ[VÒ8 _ {Ys,Ã8Uß2ûÌèQ€Où-Ló(þ®vóŽ¨-‚ƒ™ßIÇM‡-ÜÌÖºy0olˆA˜G™j‡3Os”1™WÇe²4qe¿dæPÕh6 ïÞ*­<Lmh•· ñïÎ]áßýeèû»‹Q÷wï´}qùµýÝ_¼²¿;_]÷K¨úiúœzþîš_™@}Y-wÎJ~àžÿ²:~gfÕ~÷–jö»·H±¿ÓÁtpF¾?ƒ¾[AÿîÌKíÞý’Z÷ˆêµôì³‡—G¼ˆ�C9û®‘yy)1;e-Gä[r\ò^ÓºÙ‹¢¬Ê=}ýW¢U£5go4õ½p
:øG—æ®JÏ¿1þj^u9ƒ±°N…Sq~=ŠÆqd}•µüBÜK(EMcJIÈIr‘ãa'"V	í¡§~z	v¼«ø’l9µ'/@êxø1}z}ß¾Šr©šû`}¨(‘:¶!^€A‹-{±fhÃÕŒƒÀØÇðåx&ùBôÆqšüQü”×-°Ñ¢‡[i‚"X1ˆÖVµ)b1,’‡öŽë²¹ju^³”¹“@Á@7m»;ü¸Õé¼¦ç²'Ô{Û¾(Dt6×ø†È¤ÆáÂ‘E²§E;éËb„³ù-ìÏ°ämz({–­áRÑ1+“NOûöñöÉåC|,ÓÖù\Ïu-Hvb?YLd¶9l'}ˆmt3×tZNá“ ›ÅïŸ¬ô‡,Ë­ôŒí—'ÊáWƒô®c�†\œäUZŠ™O
oÈ_PèU2 ME½§××dH„drÅ¢z‹'+Ð‰ŸÄÚmkåÛâOÉÄ×Tùd¿(
§eçJÇ[ÝyÉ§¸C;OŸn®j{oeƒ~¦Û§3Žè^›Žaký‘öÕÕwúöX™iŽÀûF¥dú×òãK„~µŽ·ìÑ5öœá±ò<â^g!˜€µÕw†¼=¼.>Bä:ã
úd•vsyšfYZ­ëÑi:ìM)í0®ïÃòú}‰iÚ×V{1 ;‚ošNeŠB èGŸšâÏÞE‹zûøáOß‘O½ìó#øÜOtZ]vK÷]ÎsT:HoÈŽU¥~$Ž�­f7ét¨4ªå$”	\>çÜ/ðøè‚…=—+3(,ÚŒ<½æX)íè§–TYO.³=±¢ŸšÝ¦Á>b$²ìD#!Èsö}.“4¤lc“`\
Y÷~IIZçËÊþ6±:…7Jæ6I.º‡Z×µójFÝûÖþ–±Oç ÓM<5ß@bE‡v^T×èÞŽ¡°ja~LXXãˆ7ë s¬)ˆ7µMÆ¥b“EÜ¸Ë¢Z1F]:÷d[<™ä—¦ö¬­SÂCÿÑ„L}ÕÄ4/(ˆ¬k«E™5LÊzò÷ô§×ë7vuÆ+dY(ƒ±9Z<È´œ¼ØýF~x”Ü«&àPA²‘b?SõvØë5™Ý,±¬k:¹ê1Fÿ‡øô2™ŠVÛìÑ„ùS&ÃéY·f6‚ÛÉP)AM?
òÓ:Û2xüµ8?­yëê¾$õ .±véÐ÷jN3ž’`ôAU+•Í„ËN©
ÊÂ=Rämèâ3RÓµD5êZ0é~'OI2âmç8/7l#¶ÓÍ£¸ÅM#ÛRù\°‹Xh·9	¹TàŒVž/¶9XçK»#sÔ®­‘Õ€¬´9BÌÅ˜\/
½šU>WlJrqþ?���ÿÿì}ÛnãH–à{}E´¶¦ uYò=+S•È—ÊtÙi»-¹j9‰LZ¢-¦%QCJét»
ìË°ØÁÎÎÌfÑ`±Ø·}Ø—ýžþíOØsNDA2‚J²3³*ÙJ‹ãrâÜ/ùÉ¬—šƒgqûx5Ä:XÕ
ƒ'85÷¯ôÄ¥\’ï·
òá¨WP}\'f¡ÙNˆ
õÕå5V§3AKrM7RÕçsûç¤~õažÁ&×·È:wmq­s«beBÝž8öÅÏKèÛñ²@’=}
ôÜŽKgÆÞ`ãà“ÍkCs¨=Ê‡Á»ÉMýyá"Q8XÉ
OÕ[1/¯¢ŠÑR¡gÕg•Œ™9°ÀHK»Z×Ž<Ó!
›ºÈ¥ÐFi ™4J)h—1ÖÖYÎ=1™W ×ã9—-/ðLÿá•§Ç»/[íÓýÖ!SŠÛXü-|
Jòï>ß=8mÀèvv·v;˜y`jFÞÆÚ5Áªú®üûÿóßþ#®;>ÙÛjíì±ê¼Ðjïá+¬Ýiý`Yl7ÿÛ¢ÜîÉnë`¯
½³­ÝƒÖá-öÓ^+ùùÖa‹uZðôyëpÖoÇs½9ÙÝ{¹uzÒÞÅAˆ?_îÂúªß³¬+œË°äºuä;Ž,È³ã«^’<îC~PìobC‹øU» 	^Uõ])ÐapßÿK9ÍjWñtq®‘æ±còf©‘¼jj~+ì„T‚º–›:QG»¼»ë2ô°À	»äAÇ%½†n”XW±gZÊmÝ‰Èâšê&™ãÕº³6e‹IwÒ]¬ö}~~Oá¦è_¡
.,ùð]I§›ü‘ [º|»áºƒ)œ¡jeìL&×ÐWØ¯P^IM“K¬?æv½A¥Vì¸ž\~¡*òL¯XE!í…/ãD“Ø@wûôŽ›êû&ÁÊg§¸½ºü<óÂióàÓÙ–_åHîpáó'žæqÕ¬Åì.å,h&ÑPÿ²ç‰•+z)]ô12E/Çç¼™\å"þ;÷XçºÙ^BZ¡‡\®Ä¡§¿›zÀ=´§À`0¶Ý÷Æa©8ÔØ~}8c‘áo8)ˆKªf$Ó¹ÛûŒ½ªdhue‰UdVñ8üï¶§# àpœãðÎ–¯²}˜ìt0Ž÷o4ºv*ùi±›ði…îã‹/aÓ1Ã'@4ªÑ÷Ÿ;ï<ö
;;}üÉKÇPk¢"ÛHEp˜î•ƒÍ&ÞÀƒAñïœËÜÕx˜@mŸEù^»ØDr²û-r1¿Ó4ŒáPRÍÏ¥¤:œ“SÁ+Ã­Äë_†iÁëž¼Â¼(ÍÆÀÈI—gb”OÏÍÈàeçu×2¥Y™¥‹Y7¤x!æ`pð²drðŠøLÙ¼7Ïƒ×\|^3ò>xY$~.‘vöæ­ZZ²1ÉÀìl-b”Ê‘âabUÅ×Å›®¢éðÄûj±¸ÜV­uÉN0sÖk‹Ž›i#8ïçAäH¯xÐg½ßÅµázq¤¤ÙXÎ¯"u¡5™·‰o¯ÍÈexª×ž c·öA’\*8ô˜1 }y*ó\ö¬ÅÖ>ž:/ž¸˜Ñ}â¬º·s²ˆ2…³˜âéÅ0p‚¶wQ|ZïÚ(—a¯âÄerÅØ–mIÄåYÌÆÊ´—N3I©±T,kÂÌ”ï³ºðý™Rˆ8gQo3ÃÄ‹û¢H'NcÅŠßáÝŽ\¥ˆŽRSÇé¹e÷¶ùSJ™)ùUÒXÉ¯hãš¸®vïÈTõ8ç§O‚?D|3šû`ñl:[PôsßuŠÇ~—Ò•M:F0¨!ë´Ÿ½>oÿŽW±õ¾sî¹ƒÞköê›f³~E´uèG9öFuN•_7Ó&{µ¹74Ÿ3é‘mö_q•eeQà/´5yý²h«ŽdjÎ§L7/?ÓD3Iög¦—¼ïÅŒˆè'F1“ûö…l²/dóÙ¼/²I¸fÇ›ð:°Õ-7½~SO@Gô.?ÓÒí¾Û½Üö‚îÀ½;J*ch6}´ÔZN
\§w4\ÏD9²^0ê‹wm9“8E>³G‚ð+pâŠTJšòy­¿üZ2?6=Ëw½Ç|ÆB[?N‡§¯ºŽ0ûjFüdÏæß=“o‡–Š Ð%•AHåÐ‘%2šÃ”ŒŠ±Š‹‘Œh¹È˜bÓÜbØÉ/Ìäb™ÉüÐ°{)r÷i».ÇÙ?÷]áÄªGcá¤›³6_b{æˆí‰*Ö|.Á=Jž$â¼÷°]
[ž|ü˜Ñ2í,£’;™°ÖEï-*6“O,¸‡ÙØÂ±,•¡u¬¦g¥xÇæ]-úŽUdJ¾)Ú*øä_º¿ç*á
w‰µ‚ç †qôýÏI¨ƒ¾Ï0ÀÏ˜Øxp»Õ~QyÚ™Ž°ÐAÖ*ô-Õ‰á‡>‡EÂêÕÅ=ýšpƒðí;¥='î¥;òòªóÜ‚ˆ}ÝÈú º~.èBu×»¦â’H@ÉÓ’aÌÆ®xà­Ú¿s×XC1xvØR‡rÙx°°ŒÎDu¿?
§¡¢vŠÒ Õr5òÂ SQSCM¡°®?¨c¢8<ýZ‹r†­gU¢J"ÂTúh£²4/„–†5Oùò‡…xR“û"YŠôp”Bï/ú‡ÿ!ëÜkvp™í<wÿJ.ìãèíUl6uÌ4µF8÷±œ{ 7Š¯í4$½yé\§ö/lkÚóXÛV¡_+ú¨–~¸X
—ÂÎø>¿*ÎÂ²;ƒI:žG9"‚×Ü:¿9Š<d*.£˜Ä–W-M éD¢
l6Ë(³çÑ±i“‰¾Z]E¬G³Ý¡—5ó<€i>ZAT„k~ËqËØë;—KìQÊ¯^çÂ	.»FNÉó.ã¯kÔ‹Ñ‰KêÉ›¹ó5d�-\³F1G4ää)âÛË©˜É•š3%•,y¯Ö6LÙÖŒ™üÅHfçÞ¿»kªôÿWR%ôHqL±ZÙf"³±Õ”±Ôh
08«Ü;NKVˆ‚Kc|9î²Ø~®Ìg‹°í,´ÙÚ]Ÿš%gÖ$l†MÉ“,RAÖ‰ˆ)M¸2°O†oçv“	»ž±ŸtL÷LÝl{]o€},¦»ŽÀ!Íy×°Â¹Äk¦ %ãÊöÇk5-²Ç	_¤öØå»h¬•W«Õò–ØÄl°ñÿÃS>9HšP`]Oûðð'*–âéŸ­Äãß¹#6@2ÿíŸ%°Ø0º\ñ4Y²d’~á½øÚ¹‚ßÕS*¶ãq7\^n½DÀ¦%(­€”Â0VcìSÖŽlÃž�]èhÒÔõ!P!ÛF.}‚’¿°Gs„’—2*b¿Œ-î12ç,ò 6µ†uüœZ‚u6‰ÞÂ™ž{¯ó1º½½Þõ˜þ!pÏ;¼Ž.Ó.1CüM¬
LÂŸ½I¿Zy~rtzüf¿ÕÞ::lÚ†ù+ŸWº
\b©Ó}.Ák	k›JšÃˆy¿o:'ÿ~QãU{œi´öAÅõ‘=.‘Æã´
`PfÈËó2ËM+ð(Ÿ3áŽTQÉ:ÉñØ¼«”g–‹aùš@šeÞ+ (‘ë -ÍlÌ ÅèþÝ”RæÌÃÃ"•VÉt¡ŠŠ ÙÇîPlHÅ‘/³½ñ¨V¢¾ò
Ï_ràö.ÐPhÞŽ@Ýöt+à¹acàŽ.&}ö”­äóÏêÐ/`ÆŒ(æ“
êáÙñÞÁÞÖ9ê´G(ìó»î>oýÜÂ¤®"¶€µ>Êc—.Ã:¿rR…‘¶Ó!×¸må<“Ür¡y‹§ö
MðÍ×7Ð÷Žy¹Õ¼Mà÷D›9àE+¿(7YÆDQ©Ug²M*‚îõÞÎ	Nˆ‡‹mùA�lE¯vËþ¨. ñ­À:Y˜©Ü2Þ:£>$æûà7zç‘]Yå2E•óœ‚ýÑªõXØYJàôòuÛCf~ÿO' Ž&)P[ûí=	üíãÝöÞ{û3ÂujÄÔgóô$ø��}†Na
0+ÄFeªÊ�3,Æ+õÝ×~n×#Î‹z×ñžZ9˜U9ÀiWG ÜÐ*î–hþ™olÐÎm–Ã¹#@ÛåxCF°YðløhlÏYuŽq2›è‘ocm0›t§ÆqÏË”Ç1bºÂžÛM¥4·.2
{=»©ÌÎ»§·¾W„…8·ÎÑP|Ü‰_ÇƒÐx&ùwøm1†x×2£y–¹•Ä(V¼}!J‹
£àìÃµn
²-CáÜ"M?’ø¤2€VHÌ=ù¤{X¥ŽçSž~2
Fâ|Z­†Ðþ‰âÝE4yAè}q”9ïàÉïR
Ðó€¢@ê
§È×óÎZQƒj<‹%uLKæSa9ˆ‘¬ 0€—Î¤ôõCueI„˜²�åR>_+\E±â\…¦Œ(H>ÓC ¯OüúYÀÎéLÉ4ÿÞsê~€ŠºƒeÉB\ZKêU×³Eåm•Júñ&+¨†Ã&ý
ÈÿÎ­tŠZÔu6>C¦TÁÔHl5$Ã 2*Û¢¨ì¼MYklªjkm)q”CãÀPÛoa´3Hš¡¬F¹b¬F©y³È+"=©ƒÒ–C©gÑ¥ŸÁ™¾,±*TúÜ¥ò¼©Ø~.¹ÅV5íû™™+fQMõÜRóŠä>‰el/ÔÙô7ì?w“¡©VÂŽò9 Ä¾5±_M¤‰«å–Z!Fps¸Üm,Îû*3
UÎ¨e
÷0“¨ –¢$YÈ²cë³Y¦i~²ðÒž-ñ¥ª¢µ¶—´£	XåËV¯2É°Õ«tblõâŸþŽÛ›R¡d
7›^•vú+2ƒŽ#K$²Kù“îžgR™!þÁzzz%{Ÿ-µP|Í”d(¾Òé†D² ôœÊv+cÀEw°x%»°IA¤´¶§ÉZÓÏºÆºèÈÃ€Üâ]ø”7Êƒ+î}§glýzqñÚŒÂ\°DBûYŽšþ—ÿ-8TÁí<V½cJ`“W½ìé@I„7º›Ùq,†Ñé¦2€}§¨­±%&SªçùÚ\(Í€Ð’s)×åœÈ¬*+ÈÌhŒóš	,‹!‰Ù£°?ÿË¿IüuìŽ¦}-úÒ1{”UaÝhU ¿lþ­ïÎU¤F¸‚€G»øl™­ÍÄb}4.1Á_ÿ–œÑ¯ƒ{Ó¹DÄª½”žÂŒ|±¹òy°u#n®üÕÇfË¬%îâ|‘QËüJ©k¨;n”Ò^¦û–0³üÃnÖÚJ­–ÐfY(	#ÝP4OšÀÎ*O¹ßƒô<(§eÑ!	ÒÊ÷Ñeçi>}M9X”ÎÊ™Ï`›?“;Ú£ˆ+Ú#…ú²?r"5ù÷æ¾£Mv‚Êê”ÐìÞ¨æÄ§”µùmýkÍ«6¶Û·hÝ=³‹”Þb_`A=«­Ë¾Ì¢U¾¾IZOŸðDÜ•tl-qNùK–p)b:¾úåÚ-Ód”Jõàô°ÕFåÐÊ/˜ü]€=W€™(¶×¹¾
\Aìí™[Tù–!^ÀV³_lGMq³Æ ¶A¹Sñô/ú§ÿÌN¼Q×ãAfß%–ª¹´§1d1å –A}io‡†¸áöT7Ä[%ÅŸÇ§…ò$$¡re½_ßxÈPºÀ2}pß™N|Ì.Zœ}\^…CÞŽto‰9{½%üåJÈä"I_‹]š@ÇÏ*¸ñä,fMõaÊ1Ÿ'Åš”åîF+ç< ß(öÉ°·9Fý¦l|Bõì$žbÅu#ÖP ^iD9LÛSzp¬cëtÙÙ•41‹·´k’f¸ìÃÇ§úàÎòÍRž'â•@¨¤#ÅÎ'¸;¥WÿÐz#gÐ„õ˜¨=H-¢HZù‚¯ŒxØ‹4ÁêPgO¥§}ë*ïù"ŒŠú?I1ü#w»	å_°;Ä¥t^wG=DUô7Zr#ØD•žÛëô½°ã
]!1”qZ¡±§…<ø«ÉœYÙÌÿÅ)vdÃ!yŒÑq.öh=XôKbmQŒc†3ž_BÀðÜEÊ­&óFxEËa´Ò|˜¼:^Ï¹Œ×ü>–±Ü^e%°x	sÁ$Ä¯ÅÒh	¸W­dQ>7’WUú¨¬ØÆ¯Ü‘x†_}K8U§È¾^+ª·›YËÒÛUC–jnCRªSË†VÍ
l·µüÄ4ß(B%
qJ'¥êÇ‘ê<,8ý	XJdN‘×‚2¨Xt7K&‹n3ªÈk–Ì*¹ßŸ+#Êl=ÛdF™­ç¢)ò*È”"¯Y«ˆÑ»ódæ,N~bE`OÜó(çFuß¹”'•ß(öP°ª$†×Í4t_:£©38‰ÂÕÑ(mÉÎ­³«ÛÅ/ûLžòÒ%ãˆÃòmÉ^&‡E%5ø?SÍÆöÃ‹
äŸ'z?i¦¶]~MBÕ!ÁÏ«Ú¥T2°tvýYp”ó™Å7ff¿€›Sýq«ž;ƒÐ-áúP+•ŽÖNv-Åp!'*„,Ž­>eËþùoÿ«Hõ@Ù—vœs8ykZ²‰öî–œ¢­Ä77.µÊO$¯;Bö‡}“˜‘Ø©7o^¶O[oÞTìRðÈ+çtM‚i™Ãu·Ç«Tny‰pÌ!Óž3UKNvEAÐçç.•ÌÙÉÍÄþàæDßŒžDIØ÷N;­Ãç•ÏÅ×WÝ=9«r=$3
ñÔH _5ÍA´%½‘ãªN½gqQ*´ŸèËUÝ™cñ’Ï*?‘’{±dK—±(ÎÀ'¥�ûÔDòºÑpë}—åµª=Ž	4§1ÊÊ0™†ì7ô¨µ·ƒ²0?
o*·ávKLo6ctEØí»ˆò�c¶ñÏéÀ…1ñ%¡~—ä— @íá±d3„F`AÒ”Ë0
¡Õ@&œüD¯.î’{Ü±c•Ù!¾¬ãáÕ+‘¾g®Ö5£ß„Kk&_ñ—U;oåøäèÇ
æ¬QúÅt5¼%¬,ÏacŽ6Å•,QZ.	¼Ê`DûØ£äÉVx›§ßŠ)œaaÛ´n@ÓÊ½¨LK²­¿Z\®®°s¾|~•Ïãœ§;q½áàosïSc³ª­œR*=W>Uµ9.Hç´¨4¬ÊªYq:i-U…øÉõ|¬÷°à×§ôýVUáz:ºç2ým¤Eã¿m<ØfS£½øuhÑ^Ü‡íÅšI‡F…Röv8ÿzÕh/îZ‹öâc+Ñ¤søGÓ ½ø¢@Ë\wƒ?ýÙ‹;WŸÍt®æÐžÉ¬Ï<ýÚì
45ƒ8ô¥É¯xØz¹kB<=Ì®ÈÛ§~"•_‘÷_.)¡z}äÈSeïi²eß×'óÆv¥:*jZì4j[e°³"'y·QÖ¾˜AWû)Íl
Û»WÙ–¨/Ø²Xb„î^ýj½1K`æˆÍQj{ƒÈ\¯—IøÐ¤cQü…T<—ö*«¡^ø–rj¶Ìç¬^"Ýj¤V3(Ù¤5+Í5:ó”Ì”;|éŒ›ì†½ºt¯RÞ…×xcDuWùïi˜#§Ï&ãuªÝÂøonË|\™{ãÜvn_Nw~§ÚSUÂÜ„À©ª’`à£kgF†‡	V¾Ó¹OQaÆ!©\g”	8Z{\÷×e9=Æ’ïãˆ
ãQf¿VX©=*C^ð	ŠJŽ
;!
™†¸ö¯^×€íMÿ¬çÎ“T;ì[&SÉ/•N«’œ}#9YömÒpÒŸÁtÁeM$åH²0¨¡!ˆa5k[¡.‚20ä•0»@¢<E²ðñõ_ÇËû‡ó4¨²ƒ$”GÅ0Œ¶|/¹÷by)ez)Ìäu[*Ò¢7ƒ…4×FZ€íË|dvãgæ`£áíŽÏvÂ�JLßrÍdâ¼;#'³7ežŒÙ
.ñ,]‡L‰Tñzu€’k¶£UÊ¬iQt=êõ‹´Ð�:óû9ïT'Éûf&ûúf*bO ·ªH|ë2 š+’Þ‹¢F
K'n÷Ýîå¶t›K+¼Õà©°gä²NÁª«ûìí6‘Ôšbös{ôlxfe\íìžìîb££ÎÑËVg¯]d…oô3ÊøÝòXn€œéÐ²ÓÃÁîÀùàö,F~5Vùbmœ¶˜æ ,êË"g@º.¦X£Ác!ÌÐeEXèvÀ‚áêpÙuì@s	yÇcCo4
­eÍ’£s/­å>—™Ó£iŠÐ…û]ˆuæ@+–îVáR‹»ƒh®y#¹fâº›®»‰ÞZ|ä–…ûLšB
yeë‰ç"¥dÉò+¶¡øéZ*ñ‡Çgðˆ@±‘QŸgpQ¡<vQµû›%‰ØBòÅéF]QþšŸ•8D­C¾K'€ï€û”ùÒ	§—EèþñrÓ
éå¶ÁO;'GÇ;G?²ÓÃÎé¾,™¹{òrïŸý~wŸ‰ìUËì¸uÒÞkÔ
ó?ÝXª“µ
ˆËq{µ+¥Äß�‰´ÀO_ÈÂ×61Ò %J‰©-K:ñq�f}‘.²âã\R=Õx.ˆÆr°Ñí¤w»æ¹êT
ŸeNˆÅñjñ}èWÓš¾–m¬ï1”EPkª^W4pøÖXëñ5±ë>±Vñ(¹"”>‚ŠšZê©	?5eÒj|¡³â×r{¯únWóRéˆMP‘nš==ÎÞRÊ®ì³ôË…o4åôG_Ç_R‡ÒI,ó¨Ì�ÕAf:²z»™ŽÿÞ´·_ìîœì¶_éOT¥ò>lßXlG•GÅÛLÚru—1XüS®%±(WToŽrpJÍŽÍL9™d,Ä£´¹3ò(BŠo—;ØàÔkÈî'¾û(Oâ,Ìhíî”Îo¥e~VKäŒŠ2
þ`g„uR2ÄÔ²ß#Ã°ã×Þ´UòØçãËËõ©.òwR4&cudöÆÄ0ÍT.3n$7ÂHœ¶Û>Q_æÜ²ö¥;tÄb-x]¬=™Ë¹Áéœà¤‹ÎCâ;uáÌÞpœ”¼ŸÃ¯‹°¼QÆ7CÌÎ0ÉõE÷9û·Ë˜Ã8zµöw-µUCg‚qO{p¶>Àž©‡YKº_­N¨òóz¤Áš[ÞPel%Ã…;ßdo‘„Õ¿¾æ·oå}ât&œi’·Ê�Eb¤O‰FÙï³’3|¥vùÚ~?DgÐâ5îN&&S|+pì×7‰ËVoß–þš�±?î)ph%Ýc¿VtoÅ¾ë†ËËlÛt©~-ˆî{ÏŸ†ÜŒuîlÒ÷B Æn×;÷º´&%§ˆ]b¼@œ(ÚÆ"~çYÚB6‹ApL°Kà:n¤
+þFˆ	@Ö¹š‘Êm<C€æL¾?qã¿L<ºiþ¼Ì˜¥0œå9[bÊà>�Ò8a,¹Þ¡:1D©Öý°ÕÓS_©R¸�Î'‰ïòŒ‡êfâë%&…Û1;o›ÛuñŒ/ùªP6û‘#žQ{C]äÖîÁéK¶Õú}ë„"ÚÒÏO£HÛÌ«î�6¬©3)éž˜Séyý©×'B;ß—óæúÓCòÓQÎ^ù.vâL±Ð“š8V+8ôKoõö×7Ê7oß–ùª,Ë“8ü<$Ê6Šü¬i—XqðKO“ƒRS+®)ßÕÞè½ïu]¬=2�ñoª“š¸A~uòL>h¦ô7™¾9»Zªf‘ØÑi<¶ÞT—ü‘“¼©è«ôXJD'Yµ³ô'Özo eÌÕ­‘¯3…“P*K8›ü‰Eg”`Sã4,eêÍ•´‹q\WÜbž–Ò§&•CBÞÁ°*.è	q¸l^‡„èH®A&>¹œø„°·O’ÄWO©0Ô¶ eË¦B§å¸Ó¸ãˆº/Œ3M2…â??^p&N°Ì
#ó•æÿâ
¹¿²ÝmÙrznšSù(ÛNK;%ÜÍÄ9ŠÜÍäï2~[	JÆµ¯ïŒôÕØ£õ«ÝŠlêÚv¸ôµÛ,²¤Ê¯n”u»}m?Û’Žh–›iÓ]Êß+ë“§ä.2–*¼¿üéÿ½t‡„Û9ÙÖ¸ˆx¡ÇC38Ú[bÀø]§zK2±>›»Äzð6¼tí€Ý±/Çã˜¬LGÀB-³c'‰ÔVkVèJt?	�³$,.²ðçV]™=)G¢vTÚÚ¾¹˜t‚T.„ô±S¬¶VòZ'Œ(—,"‘«`–Æï7å,VYuç¸†“á¿×�	fV1ì:Us,Ù«™gID¡Ê}3e¢˜EÎú¶ÌÎ!Çw:9.db1“Àý›©lBaÓÂ<v5¼>ÛÓaz†ªLÕiæó<Ç;ÇX7–µÝ	Ð§>kïãtÎ<«Í‡w'©ú¸ë3œP¼üª²íù´hò…¨Û£…c7A˜Ä>ªµÀDî%Q—ílŽn8qÇO*++*@G’îyp*¦£‹ùP,ú%8%¨}à:½£ÑàzþƒÍ¡`Õ¢°Nñáz(çñèbIä¤-àø=!EP&H€{BPÙSè2%Ãþü¯ÿ‹eö›'	A'c,ÀÞÊö—ÍA¹bX8ÿ`íêa>•í´Ýën	¸T^¤h77+|æ$<£$E·R‰$õÓ|Çžþù_ÿ#ãÞÑU5œÂMûÀ½¶HBÇ«•Ñû¤¾Ãµpòkÿ¤6«Ê0ŽeÆÍ–¤ß˜ÿS\á÷ôÏÿýï˜rÃ¾[{5S!–qÂ¼8–D‘Ä§b	ãRŠï¼KØôe!acÐRÏ£à8^gÎ…‡J&Ê(» 
IuN{i´�i+™J!l‹&_XÊz¢‹&ÌÆOö`>óqw#ìÝÒ‘„=ù‹ ˜„Û'Ñ‰íl<û±ðìêˆ=9÷«ÆOY™„é†¾€&3øW_¶)‚
)Ì.Bl%V·¯Ú¸íž!ý];ÍÂÊÃÂpñ€×`ŽÝØyæÕŒ÷r\o½òôF¿$²^±œEUE+O«j”ñ V®\º…-‚'ïàA�E-‹m¿xAá§#ögLŽ¹]R€Dìýn	‚òõ/!¿Á±qeÎÛG;m‡ä™§HIUŠte—n›ÔöÇÀZGËÓXFÑ¯Uó+3ÿ÷žÃ¶œÑ%«s­aŽ­N:6Úðws˜êð33ã_Æ!.J—rW©$rÞ3•Áèí¶ôäþ°GsvìÜs=ØÄ£ÓÎ›ãÝ“öÑaëàMç¤uØþa÷„}“¼ß>Þ=Ü1t§ò[œü«N”¨KÛNÛ®hH³õ§uÐ:|Þ:|s²»÷rëô¤½[ÉÍ£0SÉg„ëñ4E.¯­PÒh8®¯*‰Ö fMB¾xkueeyc%yÎVe¦z(bHsWD9vG€z.P‰ý£såœ±eîÈs¼·{n
‘y\*º²*2{^û; :ÔËâ‘}A´änðzò‹CíŸE)¥îL^È+èŽc }‡@jQ¤˜¹³,üQ®äÇÅ>Ôzâ¨”(ð1HU~p¼ÏKw;¬Úê!ÿfWÀÂWÞ¢Ò‡À^³Öú(f_ãúí‰sÎöF¯?µ)èQÈQgãœÍYš±îwÙ€òkuèNE‰ú³Ûò¥*$,å[
jÁ'÷#S‹$ù14?ºHÙÖò©þ~	k[ò3?z=gTyJÿÌÜÉïÐƒNèŸ™;Yd¾R;“b1"5ƒk‘ÒE­½†5ñH ÇHê­Àu.{þÕˆ2Ï`öí¼¬Xö‚T$ýÜ‰œC³5Ð‹(i\B¦Qs˜…˜Í<!F÷MJ™‚ÿAŠ…Ã&ýøWøw^ŽžWnV5×ýˆ@x!¬�È¸TãÊ—.ÛqFë8 †d¾o ËûÀ*ÀEi½>fh~oà¶¦ÿØí:}:¸(­ÁÀï:xüÃ%mÌ,³$Î3ðBÙ)!!ÉNÆðOq‘
\<Œ˜Ë¸
e2z®µ„+™{(O%DÆô_þáòÖi}YÛ
§ŽGÑL¬	VÉ¥ÎÄ†§{ºÑ�ÐD'¿.ÅgZ\‰4/ža˜¦rBä³žÈâœBW–¦KÒÝQãbÏ¬‚Ó;ËWÉQÚOËUí‹„�Ú’ÆŒz¯g_*cŽz}Òø=£-cL_	Ž72%RÂ0ÙÛ+Øû×b6sÕ¶lyjHUñ™jÔ„¢ìYà9ïî¼¦Å†*£yR ’ ð'Üëá¨þ
H
e*LØCÃ¢mišŽûE)™rœ-$yÙÇ°êácþ!b)¶÷ëµÒ!ðxÝ¤©g*ÛÁãä½˜ùÞuGX¸à~ùxú`(3×è3àØnQO¢Ë²X]WvoÍP¨×"ªhˆï«…4ä-™r–r™>°¨†¼™RÎÀ—O”Œ)qŽÍuÌg¢k»çb°ùúJ}Ë*¨'eM]ÓÛ{eY¿Ã>`Z¬æ}Ôï°/ÔfFmë?Ã/ä	D<ÿü¼ÀU}ã¡&á%ñ/öB™òèådø•`+â¬¶©ñú´™G&Ý8¤•Ié3k%Á}á4æç46gä4î¿ˆ}Ê‚%2X—¬·.Zo`‘û°Ï¸ØhªR^D‚V‹A¨—­~#¾Êi:âkG|¥‘‹n	$Kõä\ÎUQb”ygª3¼ÄpG¨á>C)ô@cŽ—ª:ñº¹./¯©}ðÆj
5‹«�N~•árþò§þ‡ÿ÷ÿÞþÔX){âË’+²,f_G¬h·‹ØµYÔUsj¤Ùxb£–þTÔ²\a`~–Ø
ã:ÊšeE\a·¯ïÛÄÿÆÄo¬Ð2·võ[Öq†gNŸx u«Jý-'˜bÔ_×éëìíŽ]‘šhïO^ˆ6´3.ÛbZ1d6,¨pÜM«láñkSµÊ¥v0JÚ¿tB/šqC©Ìœ³PgˆÓ©¬qG'Ø‰Ø4°‚Ù¸$;µK]«±ÇÀU<c|ªUôAù•ßrð}ºe%£\;ÓX‚p±QUÄ–,ÓÇ‹&<ëwì½Ògn°p¿×‰3ê9Aõ¼�•ègd•%¿W³/kÒ«Zµ¾V2Uù²Ú­Öáþ›½“ÝmÞ|áž¤–ö#¥w>%/RÐÜÔ6¯±Ž–Ò\˜+4…Zh0l}8­ò7i#Nv÷w÷Ÿ³ãNþ'´E!h)p%òñ,®¡qß¥ÝBÍŽ=›¹×Ü“À,_§Ë£J€’°u† ³(¾U¾ÚQ¹ˆŸüìØ‰{éRÅøeü“Éò’¿€Ã¶ýk»CàÊt®˜^ÒÃªüùÜK¹:‹?€Jç_N Í	,ýÐÄD”?±3ÖÄÏÅéð¢²ºÆeÈ=¢qDNàšO¹1®Í`ËÎUÇ»pØ‰ßsØæ
ƒáä*#Ï1È×á“›
3¨ëÎ¤jv2¾˜>9pW®¦B©*
=sÚ<`×O(x²é¼nrªË›çŸ‡òñÂæÇÀ�*X´œ™àÉ€ŒÇßL¶³…íb†[­šKJ!äÐDÖ
G5_³c£ÏIiqP&s›W1´ßHRÚ,5’»BI6~×i„–Dwf¤)L£¥,GLÇuNÜÀ�yJ›í	§gCsVNóâò)>’Þ‚|­ºˆâ,ÖðƒÁœdZÃ¶7S–ª`zæô
Iåò–Ópà/còôôýÇËCŸ|	2ï˜ž<VÎyë—[#X„‰{ˆÂu]Þn£Ëüs
XoÕ¾ÿêöû¯¾âæ‹ö4p&?¢®¬ÝEýÖ'@äF÷¼Ê³tV*À?ýÑ¡óˆÜÄÅ_ÓÐ¥25?péñÀ¿ha	or½ôÕm“eû£¬ÿ¯È`,º¶”þà7ã4Yžñ±íñŠÄï}
ãw©£ïåÇA„€,Ÿ{¼#e(ÐÓŒ%�>KÌ‰ÿìÉ?©÷ãÀz¡û¿òV*ÒóõzõÞs¯–õü¼†å‚a`â8÷qe�3«°?2ÀbÞ WyZåwHý+Þ]'èö1zŸúhG?Õžª•Ä;^¸ûaì,¼´ÿN¼°‰¯¼�ÿÏ^oÒ§Ž'^$0ÁîŸ3þ¯(ƒÇóÈR¯Âž‰
oÌ8uÁšlpáÒW² /ô·KÕ¤I{øX¸ó	01‰¿•!U3_zsqßéõvß„ ü DP­pzXYJô.^’nIô!ÑCà]Xwr»„%9hjËËl÷h-Y/²¨®±×[RèÑ^/¼�26=åJ
<‡¢"BEü;,øÁßÝ?rÚn×c+záDþÊyVV'¤ö-þwNk´uRSLs’Óî½Û÷ºU‡üÅ¿“o©ŸŽuïä·~Rnä|“j^Ñ”½!ï°¡‹3ü+±­ p®ß°¿AdÂ÷ô{6y“ø×ˆò¸‹ý¾}ú´úŠ Q¼SY8ã/TŽ»!üàí+Ç>ÐÀÅgC7½³[èƒ7_«C\æï
>óù«¤¸Þ{··uÝÒ*A¹•\™?ÿ‡ÿiúbÑúTdßzQ·/·JuËÏÛ¾?fÇ&Ž71Ê¤ÛÇ¹‰ÌRËÛ¸f£k,dÁÝãÀ?÷n-×x‚Üç˜þLX§Áž·NvZlïðè§V{=?8Újtv·_$æ7–à/ºÒÚç
rCäØóÀ»†-uÇ”¯ekà_²­X˜ÃØúæ;é4VÖ–Wýõh'l°c/äÁ.¨“Ybûn·!ß…_Îë  ¼ÍÅ_¶œà®%¶º¹¹¶YùJƒ£¡÷A>¥¿““^yøða}õÁÃïêß=ÚË-Ê¥÷zó*z¦3@&Oq.Š�¹"Í¼KŽqe¯–
ÕT‘ÂVê_ñu‰cV£að&&_ì[:A Gt‚ûahG±ÄM"13@rg‚!PÉØÈ½¢±'8‘p{«Êg¯è¯EÚØÚ+ú�îâ0ÍI¾Ä	Ž²œá!?|‡êFÁ¸N\r\l'BöøEçåîPù0yš4
Õq‡Ï¯VÄÈqùéàDK.7ÏA‚÷gÍ~ð6âjdÎæ
þèŽzäÄÚQUE{8:ÓÁ×G¬²ìï6Õ1þÓ
QƒpzrÀ‡˜ØßÔbqÈ×‡"2JÚ¨ÙU…rfš‹o	jJ½
v•J	W«Ü#»+kºÀæ$ :"Áâa£+0Úÿ(¾G¥Í¢å‰©pU¾!(´¨æ×€é
«5Ã"yp\Ý«˜áOm—Ê½Ä„ƒ¥iÓ{Ûþqùë„$÷ÕZ ëxé÷ÀÑVk·ðŒ¬×çßª«+ ù}ËKsëù0Jö[òàJíö-õ,ÚA˜Sk¥Þ•Ë¡ÞSØ‰$ÁÒüBµ²ìúkmm+Mh>ÊÄ&þ^ûHØ‹kC«•N¥ç'~‰ØŠÄ8êœ…ò¿NÌ[¡Î™e‰¯í[(ÐT…ìbÀG”SÖ»¸n›zÂw¨ÎZ
|àÇ¼f³Û-$k›nC4ŠøÙt+	Ð&y>’[{"`ÙÝVaºQ8ZúR>ÔÅ/ÐïôØ8$á2ÅéÌŒðÀ—A¹Cígè*ÉÆÙv…Ø
^Ž¸ÓZé'%ÞàÜY-æÎ”›©†bKk	ö+ù(õq>5…Ro‹jÌ¢1QñCcçIp$bü4ÿØ>:lŒ t“ïÅŒu‘MeU·¦{_¾DÕ­Y)‰Ì£,ê¸5|Rôè{õ¥L³2¸-#ÚÎ{$¿Nx=ê&û7Ñ©îÜ�å:Ä�.™~ˆŒ~l™]"6hT¢µà¢½:0êY‘¢sú&þ›š²wHý*Äì\LvËQX“©’»ä¤Xõ*Ån9$!JˆŸ=¡EÃK“·¸Ä+¿NÒlÜ¿*Ò‰»)‰LÜ%HqCHÑ¯VrlR˜?#€o2:	œòÎ¯9k^K´kò(~Í#Ö›˜	äðwþ’pG¿ñO	{tƒêºÞÖ¢n»Àb	ÖI“EJ—èŒ=KiƒÆ§ßK-z¯ö¬u—G¢þ›Æ&|x·§¨˜ƒRóD_T‚så�íµÝà=ˆ²
. ìøÝéXœx*•%¦(˜ *þ¤¼'EË©ú\UŽžïµ;{ûÕtV9=Þiuv÷Þ¾tÎåO×3Î'~}£Àù-»¹´çÀÝ´‡—:6~öÔžàý¾zÖóÆ˜T8˜z¿©(Ø3•ä'½N|Ëë´˜ÅÙ>ÙÕ,Îˆª‘áò$fƒþ­©Å™Ž&ÓËÙÖ{S($„º<1çh8Ö.ë)b/à6Ü �&<$ÄÇŸ;Î€ª‚rk‡2˜+ê%­s&
’÷P#œ¬…§¡‹ªù`X}Û;—NŸµF�H×Î%•”¸ð¨FéEßOÃ�ò^oŸ½­™ˆtVz4F¬xù`¢À«ììì"Dä
î­5ìóN¨€QˆŠèa£¢a!‚ 3R›ÆGÒHƒGzÃ\2ïü %ÉIk‚šìK¼Íu
ðnO,$ÊyBÓ°uB­khiCS�2UÎð7¢‹$Ÿ¢|3™vOCƒÕmæ[…˜X˜iªU Wþà}äOÔñ†®?ÈÛKì!È˜’á“Óê:£÷*qxýÉp°ÆïUÅp—Tö
†›l-Æ	ÓÐÝ>:i7)^:¾
 0|‘¾Me¸:Ž‡á�É'gN÷ò‚Ì ÛþÀÇ|hÿîœ.ÿø£î�hpþÛˆÎ„0ˆYÑóÝhË¢öeöŒ_tVÕîÒ)ä¸4(k<p°È{…jÐ¤jbë^yXîÌ‹Þ¢_ ¿wæh“e_#ˆâwxŠià‹J¼C[íW-�Q´^±h=ö¹™Û@}õXÍÂÛ~Aý§ÚÞfà†Z‡€	¯t.H:«PÃ$ `š¯* Zæau$•¸u¶ú=Ü~ú„­À¿õz„xëWÞka—«Öò‡‰*/›Qb»œAR7¶c”š;1Ì÷uç#ï»îD“ZQižUr^ñß·ò¼ß¦Q•7¼@(Î›�€TˆV<då—Ç£ N«•èKBjéÝí»ðµ2Fj6âJ¶5·ê>Á?™‡q´cøDÛûƒ‹‹ÍÍ´Ù_¸ÞEŸôBbŒ}~ã·Q¯XœY<»ÂßÑ$ñ[hw UA´bÒ1¬>WpâŠöOù±ø)‡Þ¨
rÉ<;Þ ËÑDñ•¤Úê[¢çoˆž¿I0~°ÛäX]þëåeà‚*o*µÛ¼ø6ÃŸÐéÙ´
ÒjNÙ.Þi¢�¼@’{{ËÌ®G²)¼ÕV6† ÁÉB–ÔCå6f6®m¨qš•à–·‡â)é4^×"ûLø.cˆâ
p—öD~_êŸQlÎ•töƒ=ê¦=T…E>Éµ8ý¹ª
,ßŸ­pPÆHê
~IN+þ4rOst¹—Ê“ŠƒÏë
‘•ÎG±[Ë“›øo‰ÐŸå	¦ðŽRÅ’SË“ú‡ß“n?7H³96â^'j¢o“çîC6>«¯%«•ic<Óá›<¶ÓõRž}5NNû«àu‡—â&}º&x�5ÎƒþÌÑ»dß¨Œwú»ËýÕÌX²5–´u•4ßl_ÎÕP ú¡o/}n\x¨˜!»GÃqb„¦8`çCŽS'Xæ~ÄÜËpì¢ —®q—)T¤qÓ»ãEkNÚãQ™øÙETŽu3é‚'ý]×sñD2@³^äegÈ§²ûé©uaS¾zü5‰çª?U*h»®ë¯êk0„¤_f· U¡ûÎ“›Õ·lù)Ûš:“„°&¼xR‹ŸõãËúÅbLÝï¦°öì¥¢m7E—>H‘K)Æ®Ej+Ùµ8Ö võM-~Y�¶úP'Ñì¹Lz7¯Âà ÜôÌ'$?e}7i´wßÇ`
ëÄwbmã6í•¬ƒv&1VHÓã’ü‚3C-Lˆ›‡X2UÅ÷×3CÓœÇ)UÒ2¸IÒg’9ÅˆÕ[<'‹ðÖÖUÅ‚wµ
€X
&Ð†=]ÿcÑ¡òžsÍ€eú©¥¾º¼Æêê™Æ©
pòô>ÌÂŒ.rÊ+•ŒÓ•¢“š`I¥‘A !‚*b¦!_uÁL±;g:…Qv–¡<Ÿã@ äFAÂÚÊÊòÃ¢àÊ*4S…‡!”¬ÄoÊÜÆZëä:.çC£g–Æ—H^0 ¹Þ÷z=wT€£ÖêÎt’=“'t6²›ÄS• \ÞUýÕÃ æP?žô]`Ë“““Ì‡6@âñ$08æOgéÉ¼ÈÍÍÔ#ê´<éß×Pƒ”Q¬yèc€îs´ü„qÜèÈ‡’Û>"õ>`ã0÷]tªtŒ¡÷¸¦<¨—4
€sà¶e
ü3
îkÎ¶†³«;Óg~ïZàcýš‰?rø*@Ç®Ž+Æ"M‰ö”TÕÆÄ
“€'Ô$œDÂæL´Ñr2à¨‹
è¡6zœ—'aÒKo/á3ëSyzÉø·°´šu5wžžàSulãô³ôýØWP$Öª,ï	/ÓQ-¥œ5úò	ë~þgÊ.ƒ¦âŸV˜Õó—ñu#|žrš %=²t‹æqÚ¼›L²”Q€f¯žƒn&kõžwáM¦Uýó˜ôáªÍÂæ×ÀuAk�1 ÝÂrBEñ‚žê9‰5Ko	.“{jµu?3Jk«ó*[è<ÒX˜§ÆUK#ÿ*pòÐFž	}‡¹ž ]:w«ìR…¥‚FcGFÄ¦E‰‹°Ly
æ'º‹¸ÍÖ‹ôX`»LúìÂljè·M^›ª^¤è%J©Do}ÃŽá´Olªp[–I˜}Ï¸×w.]ŠÇsì¡È'$nÄÉC6sw5£óíe
]³ß›U.È4•wôõ^Ú¬åæÊkFiF Ðˆzr³y›ÚkE$”L+·Mï:lå‹y¨Ú¨ä¦Ð0é‹7$‰Å£[yºå¦C†NP‘Š«Ô(zÆk,Ö<A—nt­iäpæÝ0í…à¡)²¦ÙÀbdí´DÚŸÉ
^þm‰H¬ºƒ™öŽô´ýír¡ýáÙÛfÎ1¹‘üó•èQœ“êO•£ª1i·S¢ “„•#CÊèØE§‘þìƒN|»ï¾üÑê,ªñ},Æ=ð°Ü’´¯jÅ
Ûe‘?Ý„ö£­ˆ}‡³ÐýÙ™2Ò4A#J’—t.ÖçT¸ñÍÓÓb](\øÈA,»î€×}ôžÜ(!èEÛ£Mõpÿ›•3O<9©¦XÉ›\£´^¸]ê€€ôøÄ=)¯¿}•Pzóìõpì*ÉÃÖd‰‚qª÷5ˆœövÛ8—@Qvë~™m·0hs0.2y3ê´  kè„ø3¹$Æç,NHµìR/Ïô˜Ÿ“+†ƒ”¢8¢4:¬Æh3¸ÈS\¬6(
™Ÿ½oØ^ Í›8!;îpãKöºUÕd³ÔÏ¼t¦¤É†|[sê…<ÆôPJ”Ðé›ƒ9	¶ŒÖ¥|­SAÒ<nÂèP3+ît»îxòDxLýÖÜ0¶ê¤p­ÒHEv/o\E„dn7èó$ÊYI§@ÿž3ÃŒüª¡´IT½¡±™HÔT”ànM©U$¦®§±*í`=+—H¹z'¿¯ØÊál–Ÿ(4Z§ìBE)ªøuÅÉU³Ñ$¼áƒî“ø[æ�Ôr*ší‘ pöÎí‚˜í ¹Èû,
\§|ŒbLÑ—
+À§²W§Ým¤¾Ô~å+ÏÀ·Œ/d“UD <¡¡jcŒÁwã‹Z®–+Oo‘3£$LûÄ°÷!FÕ™½äìòÐw.N[*-êJ´Œ¡¥Ö´®ÄØÖåeF‹@ŒÖòÕ•DV?ýªhÏ¢1w˜òÊÁÝ½BÁ\Ì1�G{:ò&ìj'n„¾Ø+‚<w<ÔQ+:€!ÉV°öÉCšN¼üüÀ©5�xš°=ŽcÞ¼$(å&yåÙV×õû’ˆ“-M2hý^jý@åâ'¿Á:îÀûˆ›öÝðƒûÇKc]”x>ƒ_:fÒÞüÜTk
Fá;±'šÔ„ë’¥!:0ÞE÷zt°ØO¢AªÂ¼eû˜ö�ËÙôœs€KVý2°mLb¦3åªœ²ÛâÔÈ,–Ç&› êS8>	ïË¤F@wT\yºò±7ðú|?òËÂÞÈ\VäZÔÍ÷,RËõ&
õÒ³LÏ•´V]Jê€ÅvÅ_&_Œü‘×´Ûe®;kKš~Qêº}ž¦á÷“~ƒU'ÎñÎrÌ’›\&ïN,ÈwŸpÜv
¶åŒKÖº˜Ž.Øáô"ðû~ˆ;{•0ãÜR¿Nñò“‡gé8kˆÓ›vÑá­�¾zJÐ^úÒùÒÝ3T½Z}9-~z‹_òýÑy!×vyRß¹ÆMq4A]ërßBöÂL?€l´å`Ï1uãÐùS!új¦¼/xõ“Uí^£¨~XÕÐ}öhem•=ß{nßä÷Z-'²2þ:ó3ÔÙ%`gúnJ:r˜;U:y*À4GÉ>ôÐ_NøŒ×o¥j-zDíÍÔ]ôEáù¸)E¶¬é}ë‡
½ãRN‹úãTZË´Þ`'Þ¨‹È¶LÏv¼áÔ™dC„Årœ°#Ç0‘¾°
Ù
X@õâ3ãd¸:Àî:Â.ö-w…ÛÔÓ.y«‡KÒÙ«VT£:…±ËR×'þ•ß˜|³ËâÙ´+¿nâŒš”RóØ}ÈQÛPï¤±v·Å{¶ÎRñac8×*Å2¢	KGžlZ=s/šÈÊC[ªBYÈDRv®džÕWUÿr"4A›xýnrmjQéÏÂÂŸve?í‘ùSó"2´#®‚PpXbè�SÙ1>xi©ÉžÈ5ûzyZJ¢nI1‡ƒ—Ù+*·m×r}”>-Dyò“‚AÌÙ›1	>è¸.ãò:/†Züä¯lyy½�¸%€•TÎËì4pb¾ä£¯EÕd¾GF—~éô&c‡ÿ´ÍÖØÞ¨Û_b¢ÀCßz˜Îú8š€þÆ"@ÿNÁý&]
ˆ}óMŽdqLa*â'.K„+k»‚©¨2]ÐàxRß,ˆ‰¯Ü¾2qE1†	V:óZI©¬ƒ5¹HegÿãËe¥%ªªp>‡oØ6ü9Áð›_Ÿç?¡r±¥"é
¦/¹ãalàSj”´ò©õS>	­ß¯MßŒÀÄ‹Ï0,P°äŒ>†%Z�S²TF`JUÐùÓg¨hšê´NC`@÷Fád\†ž>ÎUNt.UñZ®ª˜êµX(Š…î®ÿŒYÏ;óQOH«¾3ñêøæÜ>¬ÕåãÎ{ø—NèeRØñK¸¼ÆÔ'æµ�õ°æVâr&Ç<ß=pä®›U›C×ó3Ì!±–ðio²œˆA+)ªQÊ0}uw²Vè+)¶3•/þ}-’&8ê}7ùaUÓ¶É7ŒÈÒÁÁºê—°ŽAë“—
VŽê=”éðzO´õ4M5™uÍ(û“}#JWŽÙ‹VW0uº¶ÍÐñäáØîÑwÆvc§×£ú•Íñ¶	ÿ1´´)‘˜©lµB—éû¢ä@S©8 o‰PûÐµ&njž3Xb(ð×C`ÿLƒàõà…FY
S“¥¨!’�¶Š«Q_‡ÿgÕ†ÿ[f+Õš¡¨”CÓ@c•Êçì1ûîÁC£ìôŒ½¥„ÃUQ°³Å¯46Ö–XUí¤Î6V0‰ýw6j·µ·Æîš©O¯®¬mäˆyú¯7ãÇ)yï¯xéŽïV”xG÷Êm–.hm€Z_ð‚±Yq/Ãq.8~”„�«ŠÀ@÷³{	œ´ícmd<ˆsK;›é5gà]Œöx½2®U(š“”q¼¶åƒ¸=ÄÓ0úõòO^tö£7WÍ‡_ž¤ø++Æ¶šÝ1)p‡(
ˆ,©­ß'¦ÍÅ=IZn˜zàWØ,LŸPÒ¤hŽtçg‰)ÎRŒ°VÝuç¡S‰äøçÅn1M"dåÙ8;Ü•Ä Ñ‰8´dà”:%4[Âjn„ÛWêÐ××7V77áÈŸ™XGeDálrÃ‡˜.ãtÞ|*´ôø¿ŠffÑp7¾ÛÜ|ð(lw0^þ¹Õdùa)9CÌSì!ž³ƒa¾¹ðÏù¢žR¤ZT  gF$ƒW¢ÁKRû‡æÇ¯¾„‰Â––ø¯2ÊAÉòÊà<‹w${­#kn­E.xå�·mè|Qà¼åÑáyâ¯øq‹$¿Å£é ¦QHým®Ò´(¦>	…WÉ!ôSßçdÃQì9aßŠÐ¥ž¦A@¿ÑæíÌ9ÔéÊ?Ôx)±óysÎñ7ª4HOúco’IN½iÄÑ‚E¨I'àEãú Ôu¥’®‡FÒ5p'ð¤œ—>uÓÅªJ8’·ëƒlÂ™l”x¤ ÊˆVr¶ª}zÒê°[­CÃZ¢X§}2ÖÏb•fa$‹éG‰aÊƒ$rm25‚?7Í¨FäoüŽ;�±$¸Ž¸”e¬·á ¡~:Ô™¨ÛO’¿Ìl†¡]ŠÏx`ÍšÙÈ¬¡×mjË£µ<I~ôÇ ¯œqè"æ"{¥¢Ï\dõX›È0ÙÂ˜YR6èe'óˆè4Ðšx !IŒÂG	–ÊÏŒküÀjþš%»ÕaSßqÀ“<E3§ùœeMãj
HÇþ¹%g¿¨UÔõcböi%…WïbÖÑ•SyœÍÎ?4óÑúãº±ùë9®‰"
ŸÆ5õ“ÛÐ¼Â|ìx)9Ù‘¯²IÙñ*™˜¯Trv‹w
ò³ãU£¯OF±_ŸþËÒ@UÃÈX"èÕ˜Õ¯“q8µ·¸KwºI@¯Æîto4	|¢˜1êå;fqÒ|¯dõL›æÙrƒ-èÞÈc—h>¿DxÉÈZ¬ó¢ê„h <s®œ>½!l‰—.ñ©ƒ)-C7œ:»!ãÙ%Œ;p.¡aðÎÑiÙ‰¹7	oDižû~Ï¤däÄhv=)ˆçjiµ´mN>=Å~¯/†ý6Ô›‘Oƒ4Õîøc½ò¹X?]@Íûñ§bkÕC4Vðj…íbxÌ£Híèá‘¹„PÁHÝžw(ßÉ¡ü®óûOf,íVç´u¸Èá`±2[¸8=iíµAâ>l½l±­ÖIëðyÞXÌèÙXB‰O m—
rá=JœKê°Ä&—xÒîšûð¼à0¤Hi¼Òd³Ì9F1
FÇ¾e«ÅREÎwó naÔ>
0!9h%—Šßçd,Ž!¼@N7¼Ï±‹³6ÇÈÑÃ»°tOÑ¸ó¸&tí5<¬î0pF—Xwl §KœIÈÈÄ#Å:þ9ÈÈž?	làû—FKtÚ
çºqøÃê
ãÝMQ—ÝùP]YbY©îÞ5�øé³ÄÜáxr½gþßÂ¨ë_ßÈ×nß*Ø ÒÙs¢ƒÎWÏ7Ï,eÅØ_ŸÀ>§NŠàÎðŽ‰Dü»Ë$'6 VÒáO„ÜùÎ?Ô¥¤'®BŠÉºÃŸž8=oŠæœ‘á@ò“QxgàuÓØ ä$óÔ7!H£‹§¿•ÓÝ••g@&ÏXž§¡ÙÛ_‹p…·~ˆ(à
fXRÖYÉÊ:FY§„‘ú…ð»w:Rž™¸oâ¥$ ,¿ãžM'‘ŒC*Þ+çr2ÅgX÷Wº³£ÿd?]¥¯šYÌ¡â7!àxg2
\a0J<Ÿµy">+l}±Þ(¡×ƒÏ¿|“ó•Ñ/
ø`h(D¿ÛŒ¬…j´ÃRžCFh<ìò%.³JZûŸc^, T–ñùŽ'…&^ã6s—¾Ïí¾‡NÝŸÌ6+qw¸ËŠWDn w‹ÈåS.¹mÉ¢=q†ã|½«…c^Ê´e‹B%°Ü¬En2xEšUë	)AêVm‘3'‹¦E[Q¤ƒ,ûk…­‡Þ‡-`\{/}ïÊp:˜xãÁuÁ{FÏ¼òœVrÎî½`»`™91‰õƒ’±�ÆÉ’w|V—[½¡7:p®ý)¥­}ÿÕí÷_}u>u)*=nVv£ŠgÇé"&hw ¸¸ýþèÐyï]8MC7À½ðh,Ÿ#ƒEà†K_Ý6Yº#@™ôï^ïûD—MV
ãg$½÷=j„_zÖdÎèúûè{ðûÌ‡8£ïã/ÃÍjâMcø8‰sïâÕk˜tÕõGá„úŽ³'ü•Æ¹7êU«®åRì“'OøHØ/êÃ^º£)OÜó„½¢å–ÈÇë!zÁ¥­#§}æ;A/:L^Á•oÉŽ|*R�O¬ªŽ¿MC©øWf€ÂuúIÏ\à	9˜ž±Êî·;¥¬&Xç*ÇCŒ>ÏNÁ:bˆ·K¦É€ÐŒ.jaj.[çžcˆÓ]Íb‡§c>ük÷25‡}wàù¬h=Ç\×Ë ¥§±=ðÆ´˜‡)9V9pà`ÒwÇL�ÚÏ©Vý2D‰‰ï6ôØñ{þRÔß1�Ï…BWoXÑvvAF›Ü¨—mg@&mLkwµO·‰3âê;;×°Ôƒ¨¿4(m`M”qñ6ìöÜyç™çŒÞ;qgÛ}·{Ùþ›©¸qo-ÑŠí»S
A®äì
ì÷®ÒqrsäÜñ3éÍ‰>³÷oÄ¶àsvŽ¹3êÆ«ú3ew¢,§*,AÛô|ýücN¢.ZAà_‡ˆÒ@ÜÕ‹)^³cþÕwRÛ™?Š—Ñ÷F¡º·øvöÂ¹r<}ÞP_×¡ä±2Ž=Þ‚gmw.¼¾Bü¨¬¹ŒäQiÐíc ãEGUjÆ¹X…à:êìØé^§§�FèR5:j	G*Ô÷Dê:7µ_K9)â“4Á¹Ï-Ø¯`GÎàzâuãeê@G(žŽ•qA+/ôB›8ñúÞDÖqeÛ`ÝÉš²s”Kþ€ÆpâßéG5òÃÔÞ^ÂvÑs]]üXü½F½€œ¿˜ž6Ñ
¨•ºhÏ©ºüûÀ&ï<ÞX3âxÏ�ä¾²\[þ‡¸“ÿr
ã.D;î¥3q€Û7÷´[ßçMX»s¼üóÏãtO"ý:R *’'»¢J¾°‡ÊÂSµbOõ¸c€T"üQg ×¹ƒÇ0QwÈ( ¤"fi]†®RiÏ‹ÂÀ÷�ÿ
\ácvàÿ���ÿÿì½ÛrÛH¶(øî¯@±«»©n‘¢n¶¬²ì %ÙVY·–dW×ÖÖ¶!Q"	6@ZV©qæå<MÄ¼ÌÃy›ˆy™_˜ˆù‡sþaÿÀÌ'ÌZ+/È+�Ê.»ªO±£]B"3‘¹2såº/˜!¼Š}?ž`rNeD¼@»7.QT#}¦%C…"Q	 mÀw2]Ñ7ý&AÓ{ÏI-)žô:Ž^¤Ù¯"éüùH„ÀÂ»æ†JÍRå¼š¯
„g7ÒŽ“ùº¸Q‹7ÖÎâ¯Î¾ãd1Luä˜~;õÓ(Î	¬í$šcMî$ly&ˆi0HÿxÞ3úˆ^Îéƒ@±ëw²{þY¥Ób†H]9Þë�*–Øê¿˜Ä7:¹<g×åz½6 ¡aB–Ü‚TæÙÜ©´5Kt!˜ØeM<#›ÀÆ]pM	}2g
æÐdß OðÁ²µy"ø¥']–÷ö0‹s´Š)Øª[Æ{˜2'Ã¨¶)MFÉ$	ÈÀJ¼c²Ê<É®ViÑ¬L&åÝÈ€@|šú[5ÒVò1Žd:O5¿ñÂÃùéFY:n¦Y+?cTƒÎY0I§½¾åÖ®pö’“>Ó„Ÿx¢Ìì=¨Û÷lT(Õ€AMàûèxšJ9úh)ð%bÆñ-v¸·L³®D,’þ¡A4eòrßþV¬å3T`9È;”™±¥¡Wyãî½˜ŸÂeÏ•{‰³ŒÂ¥ü\÷-_ë`¤J+¥¼w9=/Ë²¯Á£ô#ÖlôDÑ³ÆÂ;êe'èã?ç2T®k«*§©yàå	åÄd±¢–Vî˜:¾Dï¦<É%q‰Qú‹àŒ8ƒK#€Ó‡ÿåîÁóî®;5(ŸzãéÉöæ+_vëþ¢U6.$"ãò©G½qD#¾ý4Ž[ü4ù”¸j"…ƒ÷Ð6R§
IhEÍ2…jUr-/
<1ÓÊÑ¢v’—ë<§®'ïº>®$"šµ¾¹3K[W4åPš:Š'£PÅVhENlÑ
ˆÑ#®ÈdöÏÃŒ°ÔxÒZÃ‰+óÃfnÝPSVO&úU>*Åµ?ÄçWÉä€ç˜0muÖP//mq%ÑZ˜K9,%ÜKÍì¥Ma.s9Æs"þrûžq£Þ‘pYãÈ/
·u€TY)K>:÷™T0®r)ò@$€Òø_"€ù’3)7®‹¨È±û•è€ÎÀ#Åi¯+-›GÏÖÇ\³¥ï
ÔãžT,ÿà]p@D«f×£%Ú=˜£·´ž„ÒCÏk7›Ó‰´‘©ëÆ¹õÉ­¸ó‘²ì7 AõN´Ñ`½&îpÊ‡†d®)ÈyŸþ•1Õ˜çv?�CéÄŠœ¨¢HƒnNØÐà¼>äñŸ!6±(2wšu³Cõ¼,¬ê¡¢&«¦‰vk”“[>Š¯2ž“—lS.63½¼+úÑ#<øwÜ_Òó2Š#ü¢Íû“É8__XHÚãŒ·{½à8žA/‹KN«ARQ±ù<ê?¸ÒÚÇÕ©‹3€Xt'ygù’4ò`ÒŠ’MÚÌÔ¡ô––+ã!,³Z£üT“pô6E9d:Lr{PµÒóŒ©£O­¤'›ŠèAýùEú…Cj£5T8éõ·QöÝDŸ8&#fÏÀ™&——pðÐ>b:iÌYYzweÅ52VDôÀŒJhÆý])£u‹“o|x‚6P7
qwÙËi¨t0@"¸LÕýdDìñÉ‚Ðr?xÀ„I´I¶Ò^.®Ã€ôÜQÚ›’Ì¯äÖõÙ²êÍØŸ§g3©³¥6Û§¡æ›‹û4Ãõy<9¦?ÏRFcLHàØ´/x]&ßE¯6ªÿB>êmºpåªÍ’œ…Ô€3OívŠg­áE8Ècµ!«Ccjõ–?¨Mž4
Åw�Gu £ÚTJ]ã€^ÂY¨£‘¥åcšReÔ-Pë7òQÀ€Fp9<mâ¿ªà±Ýeš%±­Ò§­ÄâñÁa�cA.MÇ¥¸#µ²×>­²¦¹¶¢tÏS:§²å9²Mp€ù·V[Œè5÷r{s<¯öOŽº¯1!Ž…Í§sHJfkTÅ»òíÆèÝÌT'æ¸v·_vwQ©ê×˜BÖá‘xS>žn–'c©Ö3Ô=<8êîCêÂ±š×9@æÉeê|¥HUÔ°óGˆ—`«IÜ"5P¢\6\»ƒ—Fœ3dlðoBÍ6ÍðùS_ÇÙfˆ×O!sgˆD;Wh°¨ÖËJV<[7ßÙãC´s*P£÷à­Mã¥E%M“ Ï˜¥k¶€÷ãéù0™ ö+¿õ‚&åßÒÆDÞt¿>yu²·KOR‚<UÀ·1'nÅát0i**…o
ô"4 ß=P&ÒfJ’¾A^î/øc3n÷¦Y}žP˜Z
`´l*^¹
àþÇÒÆJ&rrŠ×špàê- Ð×@YY«òNoNíõû ‰ê>znVð1Æg¼1”‡‹ªÈ@<¢‚‚JbÚé{GQ±†Ñ%Pü& ík˜Å9¬˜5	ü¡å�âü8Î>$=Xh2‰Å%`§Ï;@¡š@"œÕg~j1›ZÄ>=¿a4,²âœPnO“ÈQ³;Y/¢%`¤„ã"aN­Ž²92\TKs²†ÿím³Øµm,
ƒyb‡/PûÒ\œ»^?¯6ÜX§JkdGÚùx�ÀÚ¹ö87çˆ
×´¦ìlÊqè[HÝ"üuqK‹ËX®Ú Îà[ÂÈ�|îÜA%!âñ«pôMCV¿3¶þ§›ãNs´«�Ahhñ¦ÌÒŒ³LWsIÖ†Â4£W¢×Òyð¾ñ¶¢zžP½ÝPÃw
æŠâAL±Øì¨èdˆ$Ç/’Q*ûoØöù†ó=¤!³a³ñ*OsñUæ)ÜT@ãyŒ„Ä[´™•3jž90Ç	)ÔÜN ZÐè«ƒr€B×Ç*æª¢CE–µ¡Ú¥ð÷ùñ·`‘ðˆ1„(!â{ã–þÃÊ$#á	›½¦0ÀNÁŒ)Ña‚ƒµLvä&üö­ ¶Ù=J”´KçK c°¯
Á®‘ãe‚X]Ý§Ëñj(û¼qÕýLi¡÷åÒì|h2ŸáÙáq‡wéæ/m9cµ2‘Æ¹<Ctt—hW_Û¨LÇöÌiqå¨¸î¤½©Ïãx8
Þ³OðRthK ki7
ÁÓ0Ž’é°>Ìê
È‹›­t0#ÂÁá¼ì1øMbÙ`€ì†éþvm£OÛ~¿Â-Šê.ŠP
×n»³d
d¨b—Ð–R³Ó~¼¦×4F~cøýÉpðµàì
CÄ×¢|!æB¹$Ò†Õ„™ÓÜ¶ó’\>½W‘ÉHœSD_·Fp©—fÒ¨nÒiÄ#€ºUëtwÅåû<Ì¦ÆÊ;²c8³¯`tþ*€³Ì,Dûø—‚ˆ
V2[¢X¹@Èøœ?kŸvÎ¾³Z ]pAÌ‰Kk¦SZ%dU³	{…ðW&"0Á‚~ÆŠ3eIñä³QxYªŠU‹fÆªÁ¥ò¸âL`u[H~˜žÔqzì—©Ë˜>Ú¾JuÜ\@kÕå>U)ité“˜ißj7=‘
®e,½÷åmiÍŒ\eÉÍò!?òŠ0¤Ê‚`Úq5ƒHõ…ïVYêzû%¤\–Ðú¡u~yÇÿ"aÎ]1«¥,žUÓ2CžbdxÞz¨éŠ	Ï·;nK4	–÷6ÄÞb8F”Bql·ìNŸçs*ë¯”>)8Øi…³s§A"ÐgìÒ»ôWî©’Z©£’rÚ:aôA[|Fç'*Mò ð�w$„Èƒÿü/ÿçm#pjoÝ.®òcÎ·APc¾–YM{q³öz@ÚPsø3øk0.~hyÒŒÏBÚÌÍ˜SÃÙŸ'i‡Æúû¦¾÷Ü±¶š«ÓG4jÚØ¢fÌr':wàìµ
94Ú-4ˆPLŸìT…ž´‹&fGróäúùÕæËAã»ÆR’8Ì˜”ô÷8¿~–lvLÔ<K;&*þ„ìudnÇ™°âš%+˜3)Ø ‰|9@(…UV­ì³Zjµï§ÑtÐn{r¤y<®Ÿ0ÐTCB¸Ã3‹ìe²È^\X
»è*¨2Šb?™ôµþ`?Sþ>Ó˜†×þ’çí0Ea?xÍ©ÊO;rº™;¢BßgoO‰ÕŸ`“X-¦{™;ceôwYTªª¤ÄDïNbâg‹Ÿú•àoë0Àdô
ŠxdèöjE‚sìtØ_?Cr‚ã+©ýùÌ1‹ŸmhpÎ«%˜™Å¯$®GÙú•gevÄú<qjßõöq¯›ÆØ”´4TÕ,;%@ñ•Ço,7 ä§õžLnñõœ¾CóÈ..Z¾?âçt%¢6Þ&ÅyÀVQL‘™0¬ã_‚N»ãdLñg“LŠU'ß£ìŠ[}ÙñpOGh†ôÜµ¹=7›OúÖµhRÛ,® À[Ïª‰Ïê	½1G½I8¨\£‚=,ÃcZ„G©ÖÏR´ni=¼Çù"<½ß›ª”÷~è:¼Pcsí4-kXn4ü©?93ué4¼>]s]öbWýi§½„bb™VñæYÂ›§SÜ<¥ca,j»üžôsßwREÖÒÙ¸icÐR|‡¼2+Ã}ò)©ÈÐd$º/S¯0U XI1ËeÖ9’×sq’Hø“—àVZÖ”Eògí›Õ—ëD†82Ä@ÛáØ›ð\¤jã‚“$
¯Œo®à
æUþ’ÓV÷kXÂ'^{üU?ú¨§UålËéã{RûeØ‹â±†g©4a­—´ñ(YX5Y†Ú¤,kFYÎ	 +÷ºÞ]03^w@¸D|„Å&H„&£›J˜ËþÙ@¦©³FRóy³3I¨W+¥þJõIæ˜•M0Áe{¢œÆ¦î´íì×ÏâF^rÃ£2P'BVu°Š$MÙh¼;Ç˜ÊeŒK6£4ÇhË?JaPq–¹œ.Š_C«R_ö—üŸÅýÙ<½Ÿ‰7˜«Ç¯·Ï³#¶8äÅž *+x3Š¦>Ù™¶ß3»^ø¶øsFÕÖÙ!&;'Î¸ãiáþ¨`ÕˆjÎfâuåj¦‚‚æQ‹µ‹a©ã»¾O‘¤hÛ°pÝO¡¹ª$î•½ˆºnE)´â“ú/0G(zü7HÙ¢×&š˜ÂÇ;šçñ�¨n–È‹Ë¯ñÇŠiüÁ5DðÃÀ#àƒ¤wx{ÓAÈMÚ»`\DûébÌÛéh2ãõø„ÑXÍHIä™fYöG³Øº¤îÅQ=„w–[<:^8ëXBó†ßá;o^ê3ÄFÕ'Dé@ÍŠ¾myM‰üD‘‰†4ó%AQð§E„Î|I¤ü‰h+õ?âR“s!%ÛÍ�¥¡Æó
]„.Årã4¾U­j’²{F…RLS•å%@yËK:ÿªºà­a†8±…Çð!E$¨üZ‰Ñ£P’Ÿ«ÓûÐŸ[&o£hï¢?ôËL)ƒõÝˆxÓ¼Jòá¿QKèZ[ðí3š¯”·9‚S˜
¨JÅ‚¿WÏÝGzõ2úUD«gœÕ´6Ö\¾»È}¹ýoË˜îsK½Ì~»@ñ\…ã„gòå÷ÊP$Êûç*†/¦ÓÈ¾FÜÁ÷Ÿ Ïñ½tÄ\X6nm·×6q¨¿ÏjUç$–ë®¿°6-ö1Y¹îÄÙ8$nš¹D©fOÍgQó.¹•K:uåqÔ÷Ó~‡!dŒ^Ñd¨D,k	¥ïömáýÀœÊïÊÄs÷H)ø+ß:¤4¯ eËvM™AÃˆ
Ÿ¶<U²øÓø'Ïëˆyš½evæR)7§³¬>¶Vyt‹ûlp-Vb»°â2dXÔ
j2Ëš]OMûëhÛã-ÿ|‡ßìÆ,1¨Ú“y<ˆ{›}km:EåýtÔ|¦jÂ¹_óoqÿ!,fÒé•ÙÙø–È6®Êá•2)<i|¹ÆG5ñÇRi~
…û‚¯Š*¶gþ¥NÐ–Ðn�Ö@2Í}"ÊŽ$ÌbŸ€•&ÕQÖ‡çÓë|ãvù7yF²iúvh'³{t	g+T½
g³L+Ùu%L3!Ì‰vÌéf©PÊP
óïZN1B+\˜¶[Ê|
‘;·¼ZÍ»2²±>w½¯z½Á™ 8â¢fdí?©oðk‘ZH._lXEP…¯f„ÝúªGÛZª¥ÎY…U±â±Ø)‘çè6-•Nð¡£ø�Òß¼Ö9T­|œŒøg‹»âti×“ýúñ,ßìTË¢fÇžø­dŒ³Žºµ7ft´SbËr_ºæµ›ï"éQ<ßMZÌg¤¼É½ùiÒÑ^˜]us= ^m�ô¤ö¢ûGëŸÂø°Ð?ì3®¬4fRõÛ˜±¦ðó6ª‰!YimãÃ:44’R»ˆ%dxW»EÆÎøªO´µû‰víB\Pí	q]kî×$cüóþè˜˜±»±n¤ÇƒÔäcÜ1
ô{Ž)¸êÒê|€Xíbç°3—ìŽ,Àè"b'O\P$ÚSPG˜:ªSÁVŽIQâí½èœ˜v.+O—ã“-|ü4í€#L¯yùã'ÐÀ(™wŽ#ZMsŒhÄÖœÄ´s
²N<<?áUPÙ*À¥»7BÍUÞÓÁw¹ŒÁ±/sv“AuÌ¹£\™£½Î·Úm"têOA<sp–zebB©Èç*†é¤‰-¥æÂÙÍ¯ÔðCÅÅ"aÝaÀ·ë±èQ¹ÿÚM1§ß*þü¾?ö-È»óôUiÍ|û^õŒÇ€œ	+wWõº�ñBƒy
T¹˜‰»°õp&€uÕ%aa50Œ²;~ß„U‹Yp)¬NKã¯b¨mG´­«—zƒ°¥œq4v·NÊÝ7ØÒ’Y™ŒpBOý®Rì·n}îøÍææöñqy3ñI•O~UT~XlŠ6(›ÓSiÛû8›<yc<Q?2–¿œ¡yIøžvæŸóª¯2Èf„%oÈÖ÷ø†ÒI•›c{í{}3(¬dUcÂç¯jœÂt•Ø6^=I†Âxõôl¾äâ`¿~:Å¸‹K­(¹LÔdQîl„)†c­Ùà®Ôº´|U¦ì6lË´‡ÂŽ=MýZøã;¡RX\6òºÆé3¤³‘
)MíüerëÎ™&Ñ¦ó9om²*–•¢ çÜ7V©©¡mÝX3Ò„ÛÆÐ'zGÄzpqQeDè‡`‰iaX+2œ—Ë5žý^Å#”óÇWá ±EHb€® ô¦ÎŽ]6-;ˆ£=]\£ŠÒNÓÇRáY@¢ûÄH2~Áy˜M¹õG†’w{Æ?‹É ³ØÊyPÍ‰ •ÛsÂeyZ‹Ñcr¨
^OØWêYl[‡/ŸŸõ-ìõæ–œÝ áí TÕÌãs±ÙG#$
•6ó¨¸# ‰¿‹|Ý¶ˆÎ™³›ÉHIúÙë'ƒ(câÎzé»õÈæ¢½ˆ•Kÿî§…Úý¬i¼«SsŸ&9ÏF®„WJ*B€íÚ„7a1À‹g­aÇŽü7å†mÙ[+“Š•Ö»àz•l„<Ÿš”Ã8Õ¬ÎÜBQfyÂ‚ÓûêQño=ÃtÆÃs@·¨Â| <Ó7¿®½/Ò³Ì
4�ÚöÅEÜ›4›VDja£…,M#ì
²¬I
ôuh6cÒ«d<˜ksÛ: g;�ì?<ÀiET³h£{I³1¥O¶Øz·zØqc^Žh™‚:óàÃZ®´Î<£w4§}\ÏÖ@=ÍiÁªu	o7< šûŽš¦7œž±º°€yÇ£€¥á
ÈÝì"Í‚azŽ6q9;ÞÅ¢\¡ê)2S»²~ñávû¨	X;!UqÚçitÓ¦´_íqÊp+4dÂåFYíI:†Šï[ßÞòïÝ?¾/k�—�z›
¸Ã>\—ö-DpX›Q;Ÿ9_Ï8ëNºÆ|ËëÈ)Öž¬ˆ«Ê'¢JÞø
²7'i³3ÏÂGíÀîóæÑ£‚¿­Å"†òƒâ_çÖþõCžm—óÃ£«À,J]Ñ{°ŒAB˜ûQäCBÌÚÇTyˆmU‚žh+ zmàmrI”OðTÎ†av¥xo”«¶¹„±E¸&g?C¹žvÚåüƒ™×‰Y�13…ÑoÂIëÈÔ›Xì.=_yÜÐâ?±@‹KŠ5ªN ²ÎÇ'±ŸÆYKPVP˜å¡œ]Áœ…
vãV[yµKÒXhFøJEË�ßŽ(.¹“®û×¶KéÆò9HàÚc¨ýŽ
�‚°=ÁU÷ê³°úÎŒ–¦„Ù¡t+²V;gÃSïê†kn­¡ Ölÿ {Ä½6å
É˜
²­n:¤ŽÿàIxt+é±Šô‡›ýøC–Ž”ˆÔ”ØÖ¹V>Ðû‚Ó<é®Ì¤~CsËÀ¼®Bõ—É¨k—Öˆë\l¦X NJ0k~5}¥——4»S4|
KbõI»[^NåûeGG(šá[ci–¤µ˜® ïI‘éN3i.·tZkQ¨¹ Ål„ãïXAzík~kº¥$ÃtõDj§\âynåõÑ#RçèŠ|êÚ§5rWÖÛ`ö½EA™9Ä·Z±aˆ“¬Âhkb4+¹»ÕžêŽ°hì‹Dä+våU\ƒü„Û]ÎŠåO8/`Ên±²«ó‡~D½cé­‰ågÈñëÜ$5‚%gp9ïÐÆóéUH‰/¹Õ~TÅ§ÀíkÓý¥ÂäCõôâª[â!\Ê‘7ž2Â¢„rp§c–wÛÓ…ÙÛ¡Žü©ÆÑ´³˜ìå…|¯1œê\QJAcÎé‰èoÉgF!fàã_3!#!#|‘Æm[?;móÕÍ¢5¿¦”é·ÖT¹QAÚÁj¦¹®ðÉ¬l<ö›e:xæªŸ“9Éa#NÒìÓs3;
f·¹ý¬ù‘jmÓ´Ó¸÷ê¤wGìùBÄ¿|òðzY¹î™ºT;;¦ÐÈ‰ŸK£¡Ù”Ìýñ¬ÖÉí´Ë­Ê=ƒ~µ±&£�½QÔt¨³C|mDÈ‡ëDêŸ·–Øü±†|üÿÿ` •ë‘ˆØ-zÒAè_ï¬Ià€!«ö'å¹^X€)
Çéˆ’RpW™ð0Â=ÆT
'9E,Œ£ý–¢®ÎØ¯V:×cÔ¯3ŸM¬%ÐÆ&E
ÌŠ­ÚpÒšÍŒ*g££µ@ªn¶ü^GE:è�=w˜zwž'	~;ð×|@Ž¦ðúy§&
"q»Ýn*¸¹ÐØ6D^ómz=œã{%Y|5™šÆdÿô'¾kôò6Ü&Ã$ÏÉ–<‡a7›cÄ¸MæŽùÉ¤/©Ö9IÂ=ã³ç'I;ŠSý¬ÛÛ10=³Í>|dYÉ`fœz/8ü °Ë³ ±ý1îMmùþÖÅõ¨Žæ®x8{ êžÍ9Wñe`@/šoÌùæ²1µ†a>½’{è\íq†î=“bu±"l¢ê±Ì$e,´páxœ¥0›¹;iy1"QÑ9(Þç€eØn
¸_ŠìC-m&Y3´sZ~ƒøÆÅ(;wÃÌàMÝæ0¦ÖeøS¢çè–+V~ÀJw•·†kw=¶ÒÁ Ì0ºRÓKbÚàbxÆÎþrãk†7¨èmhÃk¼,`gÃ÷k3Ê­u» ¼Ö3YÂ`“Ÿa_âáýê«ýjicÛ1`÷ì“Ð|ýÅ~íàÎÏ¹)éçX`é7›œoÁ(7Z�/Ð˜åU˜ð{P\‰2Ï¾0ŒM¸'`¡
å�—×ï#)Òµã ÐÇ‰Ú1c,wÅoôR¯…àâ¹àƒó¸dJša+‚è	åÊ(Ô©{îÝdÔL‡“cs…æ‘“×§`^°Å
ÿyîx²¹«a0Á$éç)ÐäC[˜þ3r.û –—9ùLñóÙÃG\—rH²ùÉ(Ô­\õžÉ”WÊï¯òû¥¦–H2 ¥ÔiçÝâÒøã;9û®µ
ÿd—ça³3Oÿk/®Î)–ÛÌí¸®º‹�|1
KŽ¹•kÕ‡ë;ÖE,g	V1m	Jó(#fA³bLBUö7Îª³4a+6#GñAÙH²°ªZ Ð ™»¡q¾ÙOž1~›¾Æq?ÚM,I&ÛÝwN1 ÉÓˆÝ¢¿hÇ˜f*X]òoƒóVÌ1]²"èÞukqE"´æ”4þKyCteeYŽ "y®pº[éè¹3¥ž,g¹&;«–jÁXæºYJVt¡¤+5§KtÂu8ºkæ¶d.’[.éQï™M{ÒjFÓŒÎä–äNé
râÎ¦ÁDr°ŒüqQJèà91XQr6VÃõsdsÝò¹28ùLìäŠªŸ«²›_Ô9Ë=wµi'Ìw¸Úƒó¤ºOvpwŸvªTNý˜@éï,½®4ÿ—h“ÐðGÊV˜ø%6˜‡%(ªvõ@v¬ò³À¡Ÿ*¶Žæ[+Q@îNänÆÏV¤wE
WË7¸\™o;nZ›Î:ž†­ë :SáÖ±$r:ÍINxÅ!Qœ³dDNi¾ãVrØÜGíVœzÚŸkºöûô¯‚ß5¼/5Dœ`¢Êí“mÐÔ°QÿAè$‡hPFÎ9IÃ|"¤y?½F†€»è¡í.ãØÑÕ¥æÉ ØJ®˜Ï7
)ðÃVšØŽ7&âØBÎhæûPëŠ¬âÏtÛ<KiÀÿcCõë/ÉæiaG›©ø„3ŠÊ"§1)¦Ïý‰è@2±,áfÄYét¼êq—Q‰e‚É¯”IšÃ$0KÖþâdãå”Èß^¶SmI‡2$§†ÝéNö¬|©ðº³¿s²ÓÝ}w´}xptrŒr±xÅ°='§èÂƒ‚^£îáÑÁ÷Û›Xù0KQaã«¸½w¸{ðãö6ÔÜŽéMûªv·±ÇnžÇVÜŒR'LÇ¼,­à™’0%ãt*ASj|ÆÔÅ‰‚†pzFÓáyœ}§6VÎïÀ}ÊòLeFvó·EZ®~Œü˜Zò!‰¯Ÿ§7  ÒnQ¸¾)W¯ü“µŸrºˆ¨€‡ƒQ¾AÊ·õ……ëëëöõr;Í.€¡ê,À`°GCãp"B4G= Þ–:Á«åÕ`sqÿ\àïµ�îªÍµàáj�¥k*ƒj««Á[ø?Vï^­ÀAMx~D=\Ã±1ügy	Û-w šáßWÐâ-´Ø]£Â·PãßÄQ Ý²ÄïT´ —úˆF÷
xÉ·KkÁ«G«¼­©lÖ££ô�®kphz7G« ÛhàÕÇà÷‡¨·ôpé!G÷ONì<ÈítpðrwûÝ^÷ðø]÷pçÝëmtLgiN[;}h«5w»'/Žö¨êBß=ÎXùÛpD{á8ß«Øs†¯›ŽoÌ!&v}›¤×?¼9%
¹óáZïMËm%xŽ{äôõ�…_“E±“qÓÒ‘þN–Œ÷Ê³¡·9‚N.?ZŒ—Iþ2Œ'%ñ`oÿÇ]ÄâTèMúíÃ¹`!X\ë|§ÔZâµ–Jjý÷ÿýüW¬Æêµhs¥õÿûÿÃêÃø±>LÓU_6¹¿UÈ“Q“¾¸,ÉVzá_‹Ú½4oÂ\eEöl6„ñØ½ñÂbÜ=ÄO¢ ÛÑR“UÿG6i†sóAñ´Ó
çTX qV#Â9‡H¥4v~Âx-ÀFHET»áDèwG—øç˜ákþB<±wÐ|S”7®v:eònT¤É»S‹Šn]¥z]ö
ZD’‡JŠG@ÝÕö.ê·N—–ˆ¾-IíU
`ùè02 ¼¼9°›z^,Ëé	\¸?$H&„ãä5òmŽ£®Ä"~ò2M/1LS!6yœhkÈ%: x›|E‚¿*PÇs°d(ùêM¾VJehTÖâ5ñü[š)e–òjŽw�comïà¤Þíl©lÎeœÃºÄ¯Ðœ®ÍÛÆ%°žÑfBÜÝ(¼A¢¦;nØ¸;Q¾q{Ú¸Žß
{ãw½4ŠaIå½û°ø.„ÿN£$mhñØÉ5
)Jº‹×ÉeñèÜI7±x6&—äáù ææ7;·(t.jhÆÝè"ÜÃhiúØÙi(VEœ6vu3À ³Ù8„ÆyBI“ê‡ò³vœZÑâœTæ¾0™cÞnk¿ÄÃŸŽ§ƒ\SÌòu'n]AM9[YT¼¢í´'­è!“�Å`ZnI˜Å`‘âÈæg[Êx.ýÿ6\¡m>mŽÙ´/Hñ‡ÅÎùã5‡Ýþ`Òˆ/Vàg¿·¥T—ƒ›q“»^\\˜m,#bËNGßÈ÷Þã*xh›0òìôèàŠñW%[–S]¾Æ–Ï×–.€~³¦n„	õÎìÉ‚D®…1‚¢Ýœ;\¶­V+Ø
“ÁMÀ8 àpëEð}ÉÑì_ó[÷’•ÅT™ÕÅªpùfô°(oäçnõf’x³’‘¼@‘4;R†¢tFu8Ð›fT|Ã‰øbåÌÜÍíÙ_,Ñ
ã›0zõ
À³Z bÜjÑ"^Æé$¼Üñ(+!#Ìâò¸Q^°ˆ[ø—Zù	|õi“b>ê´FàªU^„Ø­(ì
˜«^6àDQQrfW',®«h—b>º¬íº1Åôôð¤¼ìmuY=xÛ=Þ	
£w«dT…RG08†B¸ìÚ—�¤I<l6zd_ø®hòŠ"²´V~8û2®Ñ„MÉú€¶úC¦êEo²@©ëhâòSxŽä.A8øi:„}
Ä{Æ*N€;Ê¡b£ÁðîÉ’
¡u<Jrl+\ÐH¬µÂ…|•N3,\›‰òÈêÖ²›eáMsiEh¬Qu>h"	)KHÓöNõ¼åÏ •çEøßMØÌ}Í··Aâq’à.ë°‚Q:Ñ‡6Š?N¢,=�õzÅq?¤XBÏ\ì&áÚ…
Pœ£fsœÅŠƒÛ,îÂv»ï
ÂÏ¿÷©sQñnN
‘2œêuÏìÀ.Ý("!b¢üC¼ÍFä°5b_S-èéVL@D*a`¹`Bš6!ìKÑ¨Míñ4ï7ýsÎÓíTµ7*`½5¾Vr;«-e¡K±Í}û^í©(­ˆÜr
UO,;’¯²tVÚIÎÎŒ]Eõ*yœÂ2ØuÐÝæL©ÛÚñ-†1°ªÃ½8DîÁ‹·þ±‹%CUÊF.?Tàˆ<£ÆW%CÆ×eãÅ÷¥ƒ¥þý#l4¯ÏÏ4³B±ŽðÓqŸb@™À>|ü—8Ô(83Žµâ¼8gÃšUÁT^@èÓhá’(?éÚ'ØY/ý«RóZÐ>S †ÒOÕj~NAÚ÷ôQúA¥^ÙeC'ÞQí¥*QŒZÙ~­Œ–×*GjÞQßUŒ^âƒ—8Æ9vñ¶æÐeõ{œOažq_Õ0Õ­íL8‡°ÍfM<¹›ÏP"F©È‡“ŸÓójÅàŸ$-d/)á"|þ°•øºN§4³SôÙ©¨ŠìKL™åëÀjv83Žcñ‘o4ÃÈÅ4U(ãÒ²&_]Á26‰…³¾!!a³®»ÈEZ<Œb*]w–Ò½h¼Pìâù½'–Žª’‘è„‚ˆ(ÕÆ¡*ÃåÞQàI)BqñËïc‘þqY¢~ÍÏ>0ä–Æß£ïÿˆ¹L
AŽGÃ¯§UÑ³6Iñ¸‰ùq‘Ú=G¹éûI=I!V¢FL%#NÒrGš�¬Ô±f�j*¦û¸Éº,¸”ð®v„ƒòø^§@.˜Õ-¦JÄk°ÙÒk5(#QáWoŠØÁCì\dýÅ²çäM[²¨~\ÝMF1š(	¬ÄDgÂâæU´ÔˆK%õi,ô‰Õ‰¼"â“U‰ÇØ6˜½e‡Xg1a¦Zæ£Ãô2ƒøž·Âþt05œl
§bË—Q¼G+×Žfé�Ù‹†{¯3Ñ…[ÖÉo
ÿA¶ƒšÃ³q6–:Z~›GF(;è{•‰.3ó©}¤0_ð	|Eì?Êä‹£ÑÊŒK¶2–ß,å)·²’ó|ä*¨
CscÖEØô5#º·Ô	Ž)$!Æ\}vF©î–kì•FB¥x×þ*ÎhífG—Yø"±Ã6DëÅã’;kãÊ\X‚øä|¨ÃsŒˆQ/)ªzXÍ¸s ú	+¦ô×-FÛ[[ÙÖñ\·6Ù±Œ…éxm
ç3öæb$Ë˜YÃ¾€{ï~,èãÂE&nOÂì2ž´iÎd@H}YŠ¸©3írÖðÈ£ßÛòèwßÞŽÑFúýœêÏU£/ŸlÛÓGsŒVÕŠv!<÷W/âªº¦þaö©×ÐÌÔ[›P³v¡.$æÞ$²fz"Ï{E;„‹_Qi‡ÆšpÛü©z¤1_aUÑaÿ
-Ó¸-þ.oQh¡Æzb™×¸)²éUž
Ž“q2ðö¡(nØòVÔSlË¹+ß9O°Hé½0¨w’Åfú-‡ÏÖÍV£ñ´ÕÒhÐjùómßJœDº›±¢æp\KN¸A Jzpy‹à'h{ÜÍ[mù÷StÐ†§Æd‰¾å³0ÄÜáuò«¾øâlš‡ý0D2â5í±+Øc5ï@ºá¬>e‰Ã³/¹ŠëÑÎç­æ¹¬ywG¥úòtì›xKÓ±é×eàØH–/¾,÷&¸–ÁŒ'ÒÆÝÌe²jFr%­ñ8˜<®hÉçOòOì¯Ãx(Â&°ê‡óe€zäŒ$öƒ¼´¬Gµ‚â~Qˆí¦”9ç0¾Š³ŸÂÐ´’úÅA¦]€¿€½f÷ïW™ >d6 ð­Óp@q¡‚½p„Fõ_ÞÆ£(Í‚æë$Kæ€Î`‡¬ùªŒæ4.ð~ìÛ2b“åÚ™‘p 4ÆE94õBaã„‚±9¶:
SÔ‡£³¯
ËU]õª„W7€^V4ŠÌ™Ö›GgsuäÎûFØè;¸nƒDgÀ9Šm4Á ]Š|Å¶q«ÃóŒ<ÖNOK‡ß°;S\YP<uP—-`T“ËÔ^X^.ólòç‡’6(è"<ÂþÛž$f/Oœt¡;GžÃ¹$G\êíUÏ°,L…~ý°Jã±Xè<Ï§kÉ^`×ÆS<¤nLÉGá’£.ú	Ó5 Füƒ@ÙæeD©X™YrÆ¹gðØ‘º‘é9€`!‚ÓÃdxAã$ÎÆat& ½tŠ&i¥˜”3Þ¢;¦3F¢³Ðb!(´l•Eõ\KYlqÞ'iåpZ?â|hø„{·¾!9U;r¶oÆƒ4Œ„×½‘ŽÏSVÓ·Á=ìŒ`hÐHÎ…�Ã^/v&áËÂ_*ÂdrfG¥Zr=!qÂÁŠäŸógíÓÎ™[DÃK±?Ñ8ë7c’d–ï¥ãGTÐtŠðÇ´ÓBÎ¬‘Îÿ%T&=\ÁØ‚¬‡,Îñd„¹âÀéþiB¬¼Bž6Ï?ä@EŠ\íþ]©òµ½Ô0µ–Y¨ý3eHl þÒbÔñªb?àºùV8	ßí²çnáBÁ”#¸©C$áJ÷)	Ó¥uÉˆ`´,”TÝÄWœdþ×"M‰ö'¥²“*’”Àú/M‘îNÆËRÇF¢ôõîo”(õÂg6²Oè¯ƒ.ÕPÈ×£H1ÈÞ•2Kó2Òc„ªŠ,"•H¥6b3–Ú¹…‡†3º×¦[•S©®ê	ürýrýQ®8C¿ïŸþœô¤[knÚ
¼¯Ahº/vï‡]*ö¯IÎ*ºÓURÖ[`’ºHææÜ hq%ÅÁazmfûšÙhÆ\&5<<·Í€úËe6†@#ùsÚ›Æzu
Ñw6höa¹áN;8ÙÞï¾ì¯·¾ïÍ½î~pxðÃöÑœ±@ýecfÎÈ~;;ËÒN÷ºk
G¸’ì?ç“Që²Ÿ
ÐØŠIÏ{sùmåÑí0¹n+wÏÃ~Àb!�ªÌWgo)a~f27½1 ²È™+@DºSIÜÔèãµ}™ª£*"jùýêVuå¬êÃZÄÙFã{æ·ˆÍ8ìÐtµ‰ù4Ò>Ö(Íæƒ“éÒc»a>Wq;mËÐ¤ÀÊ}†?®ÏÛÜyÒ…©jhÆÛÁClRZ‡ù Á?�Ï†Q™7:Ê<(N¦®bUØž¨^r!½/¸‘!
pSßÌŠè3ÂÜs_‰¥ð¼Æòµdõ6Ý'P6%u×þ%VZ;ý…_“;Ú¤³_:f?'RVü(µ-ïdƒ|©„fÍTé  ~¦ø$óþ’rï9@ëÆÓìç0y²Cêj•f R–Öƒt½ü@OþÅ£^¿.…$Jw·{üØÝlí¼|³ß}ÝÝÿÒÔ	w¬ÿ-P']X‘_œ6aŽÄD›Lëßyß	N@žd?…mò2ÆhSÁêÕÛî|°ý±‡IãVÙ‹ód<O³{“*ew§#ÏâýI¶S9‰B¥_€:ÑvÅ×¿³ü~gÝ÷ÎZFRûðcr›è÷ËÑ.tƒÑ°ëÞ^p}=ï¾®úëÞ_Jˆ—ßÂö<ìF¿Ä%V„¨ ‹løc²é[¾Ç¸<bÁ
rÔ[Éåt^©<÷1ÚQ/3¸Æ®æƒÃd‡o7ƒ¥`(±ùà9”‹áð¹Þ†m
ô9/¹b;K^?ñE8qkó|ýûÎ�ÇïwÞ}ï¼•õ +ÃÈü~ßÁ'98nê^xoÛÁá6	“áÎ{Õ=Úÿ4»›';owN~üâBe5 ÙoáÞë^ÑxÃÜ�Ôç¿û”hItùÁóæãfòFÀ={
§ŠJ¬Gp@ñ®mð~úäZWñ›,D÷U|™p¹÷8K/áº…™%¼ä—¸XaÍ>ç¥ª–¯Ã>:#}}­;Õ„Æï—ê}/ÕÕõàâ4øSðCš]õ³^¯Ÿïf„{×•Ñu=>¡Lå5oF¸7ßt7»�ƒï»{ÁÁáöQ÷xç`¿»«AU¿ïãËôÐá¬ô·)lv¹
U†Ÿ¾«Ãe´4«¿®ËU×ïè–Ž"Œ:¿9
{!ÅÀ†%±¶ªÛ_·tË‚àuÊèWñjúé÷{ñ(šŽ.g\æ	¦"E’³ %qä‰•À=éØš<ã+®‹‘ë6Æö¥˜‹KsÏÚøM|òb<—¡†'¿&Q	
åYü°_ŸáL5–µðl•µÑ(¾›tCƒûu}ƒšë2k(™ ÊcÜË˜Æã>-ã9+³q‡) þ}àUÓ!Œ•¼`…å°M1ùSŸJBµÜèÏ‘ÂPüŠ
]XL˜Àµ ™•<†«:1]šÓPüÖe‡…o¼üËAæëÏÎÒÀ~>Ø'~\üÝŠ)"n—Ãå?ÿÛùÿïÿ­|®Eó”T¦>ÿ¿ÿãý¿*:%þçû_°šo«•Y00TPj—ì%/Œd¤ìwW‡èð99(d¥WÿíÜiß‡Ãà�Z†˜y;0
TÍ+­f`7oÌ'L­€ÂŸ`Ãé L‚˜Œì‘Ãßc¯7¹eè\q¹.y}6|Ëâ
×á_šºôž8 böN:Ù	~zå‰„…¿
vÎÀ´÷þ?ÎÿyÎká¢O„Ì)[Þ@f” ðgfchê­¼¬9ß¹±LM»iA	Pz ÜÖ8¾Ë”µ%ûfï°mð,Ö@‹~�!ˆùÆê¦”‚yœÍ™—~pR¿3½„ù³ÓMX5ŒôÞ™kaŒÃ(ñ0â<&ñS3™kÃègß\Ú»Ó˜»[ïtüóÆ1b?;škåŠhÄÞ8W~U¨ë˜áìÿWíÓ9ÓÙÄ“ùËa/æaqÜÅñÞØ«6rŸ½‚ÿyý+ /?aí-(è=\)ÐW×™²®¯¡!cÉÃêJwÚÁÖÁë7{Ûû'˜“ëÅÁÉApxtðòhûøØX K;æŽ&UÅ§¨¸zü‘dÔèd¨%TôÆy¦eæÒø»…µà<Ã4Â™ã»-éRÌßÍ¡�ÕGÅâ)âß³i®¬3#5YÖG.Ë ÌÇèÐÿcf±–­ÝLÒêó“Ä”c¿øÃ¥¢rz°“ÿ:À…#Ðeýö½ïü-MÐ)�q%¢¥ÿH×õ.e„ËIÁ+P¬’Ö’J!Ç>”lHÝ·JÙDæþˆ´ÌúÏy·‰ÄgÅ×=‘G+ ,›bàÿ¥ Ã@òðß±ðú•š#:ÅoŠ=6¸Y
Zù.j1á—(^dAê…€³|tñzÞÈÞ¤æøN:6'ùwMwí¸‚Ür N©ä„s-à“`Í¥´.œtÐBdàÌ‡ëÊ“.…wôw–^ûCKÀmÇRC½0šÀ3Ñ8>×®wf¤lb²_'`\–€Ò¯¯Œ^EKÿÈ`™Q˜÷ã(Ðå´+]T+¥ª¢hQJZu¯m á@ë±œÁëMá´¾o×Ø–¯¹Ik»ÐfÁŽ[UØŠâ¼ˆ¿ˆ–ôSÉÆ½ØÑ„îô'FË÷…™Ðè	L{áÑåÖsQe1QŸ®ðÅðŠ:Ùï5›Û×Áq‰PÙ=8Š£!°Þ#3^Dù€ŽaiÇÀ›¿<<F…tx5™Î8,Ÿ„@">7B-ÃVãÊ0Š%<ø„^Ð*%h(M”tj«e[Ûò%Nø§h•Õ°A`†©yÔqø{N#-
Æ¿ÀéfŠ…Uó°¿ãÌ%’úôþp¶þftyö)0†Í±TÉ}Ÿ©XUð‘ZáGÔÉL’ñ ®’Ðù£“Ì,©¢ˆ$2É×E–›z´tè==óJ­¨N¶ývØë7yð’šþ™#˜Ü+†É=ãqÔŠÈ¡$Cæµ9Ù:ï‹•rÖÎ‰ûèÌk‡bö+µ9ð†ð(	âcx>HÏýV³ˆèœ4¿[cé ùK¬Èê«8i‡�Kì…W9°ð)¦‚6à´š˜O+œ¬ß¾œ÷_­€¬z®¦£KI¤�Ip<	‡c :›ÓF;Öå*­¾—Fá@M’#ý¾qk'Ÿ×Š\�p}å\�ËEo5Ç“i†Mië9OÃ'À»ë½;þ[º¯­½ll)žØwëÆ­9$-	Š'õl¸2¿Dc-£‹ŸÒó“d2íÕÐåž…Üßi>=Ÿ¨Æ¢L Ýl¥WSŒ^N±í™5pîï1Œ"¬ :1éçý SN¡qŒTYí£õà�-rØî[7£p˜ô‚í0ˆ(<¼@)1ÞÑ§Êre.­‡¿”afM›L3ËY¥@v§lvOàûóÁëíý­î.Úhmïov÷»Áóíãƒ×@±¬R€À^l¯•„ôÇÚóaˆ¥®Oï3L™Yþ…[\fšÞ¹[×û–ðPÊÅ'®J.ùR¹î/ìûáçzý?8$-°¹j5’ïˆ½µäjy«å¼eÂt(ª/Jÿ<n ¿”#H©+H)ñ_EãûB>ÁŸC÷&¹}_‚Lþðm1¯vÛcÐÈ5–°œŸE›
û-ÇêçFvýž)Âz+	²ý[·&³ÈB	 ò t˜©þfReË¯®k³ÿT2Ù:vÕ~.UfÚ÷°Âvx»Ø²ÌÙå‹»»Ð‘ÐÚh¼
Ç€4ÏÃ,ñØ{ÍWë9ÇTØ¯:„t.)©®¯™õf©Å£^8
‹œ>è•^Õ¥0ÍÊ,é°~#´…,_‘°©ÓKt‡â¡+Ôö\GO¿Ó¿ºâ„®C +|ÈfêWõ‘bKÕ£.DíÄ…¨úEiñÑÏNZh'ï×BYHtù;añ‹å6™ïÆÃói4¿O®Bk_•3OWòÍDZ|ÁŒ®Î™PrE›¾gÆ‘Ò°¾�¬Ãd´Ñpx¤Uàô~kqî£å¥2kj-ãZ¢X<@“„‰8;Ÿ˜+Ö¹ËËó^‹ÏSP±>ÐQ\ì¶vêFfÏ<;+	°Š©Åžú„$–+í`3œP$ˆ×ýi>Ígþ«’ó°|Mr>ü¶d„„_†–Gà„<>þNÈÿ
ù<	zü(]±£4¸„ôKÑð¸•jðXµõŽõ¾,éŽ_üüt»<e¿¢âïû— ØÇâÙZg¶¶ùô|˜hÆ¸©ÄeÄùÉfÖfp©]åâÆž 
zaë†…†]ër
K9†Ìu{¾ŠhÅT°¼Þ9ÚÙv»‡GÝýàxûu÷C§>9F“n7§ž›«õdÍðØÓ“…aŠŸosXÃi½ûîÁÂFY¨ùÃÚûÛ??½níî¼ØÞüqsw;ØÞÕÝßÜFOžãàÅÁQ°½w¸{ðãööñŒÝ?`(t�wÜO.&'¸0dE”ö$Â›îd‚:¡Q/FÚ8
“ÁÍÜvóîÖG%²òøN­)nj˜¾Dçì»§1\yÍ#ÊÛf#šœæñ1Ü0ñÖði³°ƒVP¾}q÷&MÕú
³=}cŒâY)þíiæx$šïØþf_žŽ#èÿêd–-÷õH¯áÍÔd]‡±·Qrqq÷Ð|M2rSt
&‚^^Ò4Cæ:h™àRÇ¹,v:É‚ÈOÀiŠïòww|RÊtÄHy( ÜìpÙÀ8Ñ¸‡?5•úóì£¬‘ˆÙCðè
â0“MDOTón>8õCüŒ­AŸ"el¨à«ó]~È?ÍêÇ:ÄFmYý¬:4{¨6Êcøo„ŠŠ;48»ñäÏy�Hj
ü'Œ›¡ñ<lö Éƒ56>Ù—oÈE.o2j˜æeìÍµà/lDsðÇb‡ïQøæ6`§!óØºÆ€Í˜4+‚«O5½ ‡Õõ ÃÌ‚h*ÆÇûêC‚IÏo‚¥5ÌžÈ›<0¨í0ax§bx´~Êé”».¿¦2pêÇ,kÓ–cÃ×¢6•Ùâ\fa„yÁZ“´užh¾)rY?†+JQüXw(âìä(Éô¢€ô¥‡›éÇ&nîÓå%5í"rº[�™ŒµOÀ^B;…É5¯¹?u¸ûS‡I:úøš¡»³ XwÓ]v>˜ftA…#\Ü¸Em—÷{À'À1l­­A|1ÿjß,²+vVÝß¤¯x>C·£éŸªÝ–èÍX@øçÖ¢ÊÄ×“Hé¦NWDúD‰]Ó¿âk¦´Àl(a	Ä@ –ŒÉ(nñ^	œ Ð¡SÀ9/é’±*—(šfdÊÖ:]\êt†9l §hÅ––:íÛêdõ5t}ÂQâ56uÛÅÇE¦ø%æhçÏ¤J79O/qGuç9>4Î]­cÒƒn»øÇÞñ	Û<<5>G_Ã1BÖWƒ!ÉÑæµ»óv;ØÛ>9ÚÙ<VÆ­V'ck
2†O"`&ö-Ï%ËjY“R)[^Õ±$ [SÓÄ×Ò~ÐˆŒôXsDˆ¬”Õb^@Ã	,Nƒ“ð|:1O‡f
U_€n(WŒQ_ß®*ÎùÝæ¨¯M´¿4ƒ™vqH„oÖ0Ž’éfmÌŒ]Ô�fvX0òEÅñ"NÆ‚",¿ÜNÉ;å	°1ÉcªŽ¹gÔ*e!mãTmãFÔGw4n5š¥=Iw1éiÌ7AäÎ–¹æ³ÙæÏ´è[x˜pX’üñi^-œ©ï$OöRÀr£ÂüzÂY+?c]•¶ÌK³ÝØ&P…°
G+c3Ú·ýS9ÂHŽEê3èg€ì‹ä#ð-‹sw4™—Ž1/¸bÅµ/}‘"Öî”:q!aeGüÐ6…ö]ñM•ÄÕ)\ò’Oµƒ£
Ë=H:Y­ †h!]Ò¦|r3ˆ7noX”I=xÿ­	Ï»?¾¯g‰¯<È?™ü³üÝÑÜÃä“ç)Òõœç•9òéh?ü\ª,¿Vg]ëë”Ä¡E›õ�3ˆ÷2Ø•˜…øÊi9d9ñIÂ�ïS“¨ß	þI!ÂŸ²¸;‚ó:	¯`o÷ã`9¦äêE\œ6Þ…¾T;q´úLÜÎS¸Ÿšá|pN?/Ø]`êC…çÕ…[Ê2
)bW¼Ù’
šY57&PEªdvÞ`üQÃ.Ÿ	@
Yhª:×ôŠp¸ÎmØG£ä¶§§¡‹FQ»�Ô
Öð®~P•]¯Æª±—†À¹Ø˜ÍFÁÒÒÖZ¿†j\9EÐ±J~Å$“KãD3<þ&–ðhð4¾l™hë¶É+j˜7ÀHGNIçnÒ'˜›gÂ±[Îç“Í~ü!KGGtåsÉõR…ü³Œw9œÜºNË115€©Q®73�^…[…ví¬ðešÝ°ˆ¶oŽ^nïŸ4‚þÓªHr}"�®ãlV­9×NF½ÁV¬ÙÃh`s³7f—Ð¸1÷ª¡uH¹]˜ÄErÉ/†¼ñ‘'qnÍ^mR+@SºNŒMpÝÒ”¡À¦cLêîÏU#{Cs¾§rºÏpãòZ–ËØy]Æ%Ã¾[xØQÔ2pd¢Ùes|~‰}º#Ñpa‘xµ°d*J'z{£Æþ¸·½}²³ÿ²
j
Û­žDÔLhão$ìdÍ*è9? B=²&¤CMAI6ÜŠ—¥+ª•ÃîðèàÇí×U ;Lå¾ ¿Wñë:Ø¨\×ª™Õ±
.*¨UrƒJ¼*”¨T¦ÝçoŽª ¢ŽCÌ†=8àÄ^H@‰zUrt®ÂŠ•TK|Ì-ù®\²V9¼Þì½Ù«—T„
Å>„�%
—*�åˆUb|¯‚’¬å€·Z%ê¤Jw§Ú‡66´CÐošÃ0"$þ€0ª{
G7J¥A<	ˆ¬š�©½Qß·K£¡Z íŠßŒE9c‰xäÑ[<¨Ö1Zè–
¤²K€*ØoB«öe<A]TsnÎì9p	¦‹tÆ}Þa1…7�ãÑ8¶¤çHÀ>"X®FÞ:ßzoZZ¨T¢FÌ™ôâI¡6ú%%TáB:ruä
¹€{=�®þ]\µ
=ø«Õ^¤Ú»rA~bý( ˆÐ~ç/A§½h×·C†	.
×º$ÉÙí{®8Zá'•ŠÁeEJiªµ|{+©Ÿ6övW¨†–(^§}š$ÃÉ27[øK°­œ¸{˜™´v@½ÓÙù&r]·'Ý:¶é3ŸYšÎ-•‡ZT¸#”è"G÷a»_µ:»gˆTeæþ?r™c*â?Û3ˆÃQçç±‡Û~ä«k,~S8ç(N‹QäWÅ8&–¶t)pã¤Ùs§3OHÜ™F©ÀÒÉ\ëæ­5ÀW1êÅ™Fí¶(
Ö=»ÙÑ³zòiƒ÷ñu×~¥ïp@f¨1vdT¼À.cW¤QçÚìÅ€Zú¤ˆ.‰å†ÇhÍ%{Á,YÉ¨uÝråÅ˜AXÃ"s³ fÃsäýý'×¹AÔQb\U‹†QéP¡ÏSW€h*w¨WÏÎµh™ýÎl13Ÿ²ÇŽØ=F¾"·´E‹YŒïÂ–šñÎh÷ãæ×á¦H?�—ÏðV#¦
ãŒ´ûUQ@ìWN±Ÿ>§l}|û+~ÃjúždÓî::27´SîôœRdã2¢ì¯8FX' Ôª:21($B>Æ‘ª‰ò	ÖEûŽQÙÉo\ÑÔu+CñS(Öb½l5ÕV<ª&¶€ÈL/UíT—Ñ’‡YœÇ£^¬Hì„¤Þ4¶0ª~€–J0ùÏ�½‡³jÜoçôÐNò¸&]lW‹?&“ª®J¨`RE”äúU\H$®y¼JšËsØÅQ–Ž[døcE^ø$ Ìdµ¯K°TP²©—•°Wïsªùð¥rút…ÎÚ˜ì¥qÃ-Š}«Ûl(ÆÃuÔšL.^à9¬Ä%$ 3ñ`	ò¢“ëºX�q,<Âg§U}…‘Ù‹¶j¨UÅ›ö½am?ß¨¸ðósK‘:Vƒ`š9ëB½Ž|±¶½ìg¡aÕT‰ŠlVSçXêšh'›€]ºOL×z´Lãs“åÒujÞx«Žý]JE–Ñ‘UÖ:.2Òa`Rü¶’ñô|\…9üŒÃ(¼ŽÌçÖR{rRŸHóÕ¥ú
ºoŽ.KªÝÄaV£?7…è$iX±'¨µ»Øë…4ëÝŒ?M³Ç|Í²2•ü@å‘7¶	“vYt¬á4kê·ïPEê³TWô»|tôQ“±aV%P¹U¶±ƒî¶âêm¤ì¸ÞEk†«h÷ãUŒW ó’;cN!ú°Ü&T/¤Ê Û~<ìÀHõ‘°)¤SeIÄGyQ×Ý×'o‚îKŒJ,xtÞ#í¹àïœR¯µš":'ž,
÷Ä“@`\1\Yÿåj5e†tw¡Kòú¦N')KX?Îà†ïL‡­¼—¥ƒÁyÈ1!Ò‰.‚Í¹3Œ`ÿN^Za'V™“Œ3fMçæ°ò`v6û“	Öñ}eœ‘õ¤hMÐ~D�êROkH;=DãþD¯+É¼K	á¾÷\é°Ý¯yšV	šŒÇ'Ï.V-‹@Ñó›àY`žvÎà¸¿AôÇìo0áôžGz8KZÏÆ¥ú5ríP&>¶­»‹ßáöþKôOýd,\Zã‘qKÔ!¼å!å½ŽÂŸÐŒ+8>9ô’à¿f2ÎÞC<{ËŠ|ÆýÉgJi!�5‹fÛ'½ÐzhöÉ/­½øÌÌbr+9{f¾JŠQ/rªŠœÑ)=t›"3åÕ.;¾•äãAxƒæÈ@^‰Á?‹,£ÜôWš’1Ô•æ³V£p…æÃ!¹JB•6>1Ùd#ÑëÇ°ZÐCBî a0Í¼Ë…ÿèO&ãüÙú¿/üûÂBÒ†ûfÒä½¡= èY±ù»LÓËAWÍpaŽó†¿ZûrÐÆ`ZecÊ$èõIØD¡7p[ò×ÜK‹÷Â	ÔÚýñ¹	c¥·ÿ¾Ð<ý…³¿Î-$RŒ³RšY]<.ž©¶ÜË9î¥ÁŽýõæhg3Ž-Œ&M­m;‹é¾ÿ×…Ëù�õŽŠ¿Ì;“«ÄŸE%±u´‰ÂjœÿÄ­J0£„€¿îýÃ0‡h*NõÛ‚T˜£qI³ñ†ÖÀ;á¿¹gÌZÕŸêßÄß,üGëÙ¿Glÿˆ7†¡‹’¿)¢{
:wh
+×T,p`Ã$—£4c;„Õçà¨´p¼¤mìá–$ïmn-¿ƒÛþÏ9†à�#0S’­ó…f#™ðS!v›²Úcá_5òé9;»h¿òh.økÐh·Û|fu†âã4Ãe¸1}É|R	tÇãæœæ,@ÌU€þÔ„»ÁS-N€zÌ¸ëxø!ŽÞä�ÓŽ'i^Æ¸g03A³nÚHñ¾gé;è?k[º`ß«×	¹¾‹qÀ†Q{41ÙrÑcÞo8ß
ÒËdä~•Å—IŽ6êÎãk Vsé­aM±­ø¾Óöämi¥Â†J¬_?½>IÃ|Â–P<©«ÈóŽ(&Xe/Îs€.µ;Q
´¦]žzåyœõá
Àx•ÀNû¦¡vÅã0› Éùq<ACïœºÝ²ŠµÝŽnNÏž6OÏ¤ÛÉf:ñ¤'pÊø"U„ùÍ¨WìjÄEÓf±0êN…V×!ÜN°›¶ÒÞ‹,ÇÑf”öšÑ9àìxÛFOv¥ ¤edYš©kOAAô5SŒæ^ÛTð§?™uÚCpåBC›Þ�]¥ðM/.ˆ+".éÈŸÂ5yf£fãE$œ˜X´ƒ÷úxåÇ#4¶ŠE15ü�4b…é¸Ý˜óâJvæ
‹àÅÚu‘mEI>LÐI7”wùè¨Š­:gà’	%’3[Ætª·ÅŸºÓ•ÝM£–)s`a*’ŸaöÀf/+Q ”#¦Dé_¤AÌ)gn^;jê:3ã.ìmô²‘'R8eÑ–pÎN„ž	Ææ»z™~6µ#H­ö$mEIIKó«·Î2öØ½¬%¿ôYkÜb´##">{“4ÜÀMò-•àH³eÂìDxzYšç­(þôâàC’'çÉ ™0»[…Èwa\NÞÑ‹ww¼ºØë¸
y‘e0rx4¿?>ØoÑX¶t`“ÂCJGNi˜ø,Éªx ¬8„wÚÎÓâÀàCc:I_Éé7¹GŠà~c¾ö¢DY*™†¹èâ”H‹2eÌ ·]³ÙgÆÚÅ—è>,y¼Æ­è»=Q˜˜æ­R¹Ý|�÷Û.mg%HZ
³‘’!ð‹Q1Z¥{é!¸ÊNýë8SŸÁê×ê}ñÏhû'çû‡CÄ·„Œ‘6qraõÏj1„©ž:ÎIÅH©i¾š¬H»*)¦+—›Ìð':cu}È’bi}ó2­s^fz‚ZýAí‹­7*ÑúÚŽéM{;ËhŒ>`Ê}3•ÄlÌÓ|±Ö|Ø¹k.Þ¦Xkš¿ =­ö¢–k6º»»
˜M£»y²óv›þÜÙçO›ôZýNÌÀÆ(À‘;d2TÁaƒi­°„Y»Ùíän‚:ú^‚O/Þ%Jr¬DÉð0oÝ<Kg§••Ó—I~ˆŒ~f/ö‹ò®Æ¢þÛ|‹ÑÙ²Ùå%W\’€{ÝQZ5«ŠbÃÛ²­Éˆ¹Ä¦˜àr^ê­á‚#¼LÍùSù'E
¹“ð’_éòY[T†Ô˜Q„ˆ£‚Ñ¥ZpWyÂùaØ‰\8cGw"gï©i–Ï^‰Áò	[åUÐ&­`íÈÄsÍ†Ó‰Þ
Ê›†½^:qôÒå^–E6ãa9ï¤–›Å³Ù¸#}&Ze@ƒgB§P
ô™3¼J©¬¦RÁd36þÅÿ˜ÀÀ³«–TÃÈŒ€È¸N­Ì†•¹MNÄŸXÅÕ]…²ºJúvÍÒê‰eq‚‘Æsç]kjQýü}7ú€Ÿel*ÕÍáðEuDs_‹ƒ[”8­LÂüŠ
áÿÒšb‰ýq âbq`èO=ÐÙþ1M'Ì]›þM>je±ÝÁyúC•x^<WÃ¿³¨õòóü¹ä
¡Vß§ç[qÞ+šñ‚ªvGq/#[_´”EUmiOJ<ú7­¨ª-ÒÓE3|ªjäØÿoòÑn£H~ÒÞ´Øù[âI[Qj/Å(En §ì…}µ¤z-/’œ’$aÃˆõñÂ(4èKí%vI(ïôÌ$£“œÕn+Œx8•½¬ü:é‡9
EŽãX4¥–”7Žâó‰:©­âY®,wN-
Q- ‹/&ŒE‘PŠc'ö·Öš•Ùí’Ñ‡4hm‡?h-y¡Ÿ¤å^¤Ùv”èÌŒþÊÜ-~jƒE|ò,;¬G­H—ËWö‡!úWÒ†P×jÏ*Öz¤ýfÕ9Åø8ÜÓá¦È
S€3ðkEú*h¯ªE@ÞÉåHÙÅ³‰Æy¹c™úéõ¾uŒÍÒòÍŽ�– B\¶UäÞ›1&“‡k
ðCªU5—×ŒÉØ/ªº¼öú'`n0pïÊ~QÞÕ0MÃÁË,E'0ˆßUz¡7À³ÑÍ/î+Ý…Z7ç)pyáèis’Mµ!%ð”0¡®Þ…îë»z¿Èhrw<¼¢VXÁ'²ºò£˜‹œó÷ö‹äá
p‡ü\ˆ'ýTðRU‡Áš_"÷€~‚(1Bc¹³g vz¢6N•7ÇZŸq;'ÓBmìînŸlo5TÍ‚Qc›ïî–ÖATš‡I‘E®ºnC—hÉYOGYFÚ©ßD
'¯]ô®é6GŸoFmì„ô½£v’Áí®'Ê®‰=îÇ@r’ê!€ªƒeGBÖ:è§”a’¯'3(`Õ™ôƒö¥U\²5ÜBonz?%c
1õ”®µ ã
…SD |N'ý¶QØTžÛ(bÀ§ [¤‘t¿O¯GÀúßGI_Á¶Ck	ÇÝ%ñæúû´‡çBJ³è•ep×¶/*Á§‘sÝªÎœ[9ATÕ)‘6Ÿuª+±”mÖï8ÏOÒ«xdF±Ð‡ªõSGñœ
˜¤Ù Ë“õ……ëëkÞ{8Nr2,IøK–“NF©Ó®µ;0Îòõà·Y?Í’Ÿi¯ïŸÇaF~»Þñß½·\Ù¹FÈ€
¿^Ù;‚b§*]—�Íü@àÞêr=ÌúwAŒaÀÕqq4€O+E×1h ~=�ª7ˆ?Ža»Eíàèê}H»†j€ç€"ö r1€É1ž<yó…CÉ¨5Œ‡À†×ƒˆ<©úÏÜÁ
ŸR¶yÝFÎ˜G†Íeal­Åº¼ïÜUñ²:VWR÷:þúÆ)”^ƒô²Ù€»; Çûéx=Ø:(Žü=¡s]lZ}ÜHçhI‘k›¶UÃ·e¿þÑÑž¥Fð ˜‹›í,³OŽ®Ä^Âñ€MO-Èá‰C‡C]Ÿ	ÑuØ¥Eßæ`>qî³Ì\‹ããZ‹ú]I;Åô¢Dµ*a7
'<*`€Öõ-¼R±#®`eÊí]X6Ë(å:=c
ÆM²uä_¸îcvºPQ²Ž5ÌÑÜo¦âÍýjs~Ñ*o íh/š¦ÍÇH"–ÚAY±MÛ<këuÐœxqðºóøuÿåZ¼ÛÛÜzùæåö»»ùûë—^ü”&ñÃç¯“ýÃþßÎþþMCýa"¬ÜßÊøëmnf‚äÑç<ŽO+ƒÓCš§èÏH(ÝŠÏI`1¼mÂ!Ù¨à•!È½Ã'4œB/c8=Êr–«À´mH\4™‹òû-æ­ºƒîÒ“TÝÁMšÑ¼¾ú!Õ	j™%wV^êRvå…&!VÊ
á³òÆa‘¥¼•zT­/¦˜UŠ,éšöB>UœXå$k¤‡*’õìÏv>¥ýí¶hâ'šLŠˆš×ï:éx¢y_ÜJC#ÅWÅëgŠ¡1Ì¨Ø_å8ÜË¿Û…%söáFÊÂ«~’5¬kui?„=Á¤ŸJyãÜnïL”þI! 0”áÚ”Cm£‚À°É÷UÒD	�åÌ¢#ŽOÁ³€ÿáßóÞY€û†ýaÞqâŠÎKoró:‚“'}ô[fHð*ŽÂÁîû<¢„bUð	â¢b(¹a‹gßµíeóÉì<I”ÎyúoœöÊ½Ë!ë½|·ÑÆÑs^Í»—N()=™ž÷3Ëz‡Ò>’_ä@~¶ãX~kÅÒƒhÃ¯sËà/y�T)£ çƒUioº*“Eœy ÉûÊìL‘ä¤Ê‚jxÆE^l™,ºA­Qú+•vÐßèÔƒþNPf¢ôB“JÐß*t‚þÂ!’ƒò³2SD.ýœ&e3EÕê6ÑÕ½VÕ6£³|´Êúê^»ÝOìE–Œ™ÄÛÓ^*}í2ñÊÛXj}íÆ¡xåmL^ÞV;ŠÑ	M¤8z}ïpwï9Ý÷d±3çè™TÄv×…Šž3 
mH4ÿ™ëÊ�˜
K2Â=Ïµ&­tìÿ0bÙR0'ºj°ô7ß¸ÀÃë R¡ÊÉ¶‡N®¸ÏÔŒ,•¯»âiçìY;²¿MzþC2é7RºPË§a‚×ðö07ã$Gšã“
a—ê¨iNÚ¸X­×æ…h*’ì‰]Êw8›Ž†	*¤¦ÝÃ$üÈšOµö‚Å5¢êOJï÷ƒŠ-`„)ãèE2 S}C¦6‚6ëAE§ú}Š*ÖÕ¦øÃì¿ëA#\²0Ž.T?Ô;sâêÈž‡yüp¥lr¬†uÞÜP·&mÝ·îï7ÜÄ¢ñ	Õ¾ÿöVÉEJù{þÊójÂª§Ã&&Ò|ŒWéÝÂñá«…—;Ý…oo5Ä¤å–ús<j½9þ3ÐB"BÄŸ)ÔâŸ„º/ûÞPm/`ž?Â-ïÞ—`ù
^¤ýhøÓ±­ÙwÕJÖXÇJ¬£ûÙTÛÊC«û8¸ñæV×Ô¬Àáš5™Ü0­Ýfˆ13zWL¥È%>pkL1~žðŠ{L}#ž#¸Ñá$a+íÊUgp™½
³ˆ¹ú¢T)òlÏÞU°sH~È
V<lÐý†
dø¤q§a}¨¾4/µ®µÛ
qXäñqœ™:—ýLî‚…(©ã6
ZîDëšqÊâª«EI4o4Ú',©Öh‘Á^-a«£–h=Ô¢dÜ"ÌÞµÎ£×ÇÙVí¢†4x³,Ï³ôÍcÕz2˜êfâ]Õ7“úž˜ƒŸGÀÌ> š;³ŠùÃfˆ	Ð˜Í€4—.ŠªìN¶Ù>¢KˆµVJj6þ!Ô›þ–7Òg,?xÂJ¬±>ÿÆ	ýYj®/Mh_¤ÙPuB0Ë+mÁîÇèÊñ¦ª³=¼h7Çƒd¬td”VX:	Ï¨}„bkÝŸF”:¬û™Â‡ö.ÛcÀ~Ûþ$ß‚Þ'…çx¬X_nCøª°•3
«
iÄ|ËjÆjÓ6_ÚÖr…9ß4’³çXtÁñ*ëãzUs‘ÂA˜Ýl…7ú"‰ÒÚ‡üP;o0º“jBe¼:ã™¸ê»UI™¥ÂâÙÔÕŠl˜JÏ¦Ãíý-
a
oìo7Æ–gæ	‹)	±u¦¹œû¥9ç±
Gá¥¯[÷Ëên¹�ã$e¨¾^¢l&'8Þkyž«ÊBÝsŒÝdVá¹Aáyò„þ0ÿúV?Ì4¾‚¢(½ÂšþÎ¯âŸ¦¬XC²�‚?¯â) 	^=ÏÑÌ‰Ûù0_‘)‹ŽæµWå§"Ž’ÂH¢þm³´¯k=hîAÛ®7®žðÜoP”E%Ö­8åAóœÐ!0Û]h¬s_Í)¼Ÿ^IÁÛMuToj85|^¶=/kã’±Ù//u3êo´¡²‹Dx("×à$RA¾©%èòW” °h½DTÄòdœPvyqeM¦@´5^…Q’50$†ø½(æÛù8¼J&ÌÇr0éƒ‹þU$Ûv€\otÖÖe>',<˜b²§ÅGE)„Â7¯0¿6¶àå#à›r1»R`SÀ78Ù»’ím/
a^é„a/|?{¯p#”u
¯õ>Mlnu‹7‘4Y¶zou·ý÷ÍíÝw/v¶hÕNºÏw·ßmmŸtwv')¯]×+¿ìã,I
CõÛëpQë’Y:C”%·5Ü=×¼
é"ÿõˆ§,-XÇàÎ¶~gáÑYïä½Ã]�^9^8&â¶§ÄÃ†ý\qfa%ëekrV]b‹=£PG
Ô±3$ðhà(GÁ.¦‘¥Ë§â(!½êßûòµöaÛ.&
”ThšLDÁÍ"RÃ…7M¦‚é`Ð‰ã)|ƒ
F¤TÃ¶¼"ö´°1kÐ$—¨R‰(Reî;ŽKØ…ôrž‡õ:Š¯Â±¸¨šÀ˜'QŒ=Å¥´°¼¹‚ÐV®§Kê­èL/írý<m¿îÒQ|yxŒ'¨ëdö­`<³ûJ„göÅY¡AÍ.µåÊìoIÇòílâ~(éµx] _$#;¬€,tÇØÙg·Ý›Fˆí<ïní¸Â
°«t“,öñ>cøÀ,-f”ö$Ñ¶Åþ.¯}r3–µño}
Ç‡¯Ù˜è?Ï»ÇlÇÓ1êãgQ<hsAÐé –Ã9V
ÊÕðj„:´†TR£åö(ÒÚÁs©È"*"öPQŸç——µ´¢Š¶ŠQ6VÊªZOwÏ“â¹¢w¡ÓZ*e­»CTUoRÌbÙ\-,i|‹ô¥=
«Üh¡öß&7¢2üY^÷Íˆ»
±¿õÚS(1[f	'ÑøCùŠCxÄÊPà@ñ]ÃßîÐ*vÈ}N…<–QgZD‡§Í[í†›R0Q!À¾ZR#€ƒÒ—í«%µB@¼ŒÓ^'ù\A§¤ §–‘¢–ÌâÈÎº:Iõ€{fiÙ¡1€TB0WŒåµ%Ã©³ƒÄ\¸É‡8ÒiØc×,‘A—ò EÏóö(sŽWvåcùó�f,¯•NQTáÆ&ƒ›#%æÏ–R ;2/\Q°éTy+iEñÖáÑÁ÷Û›ìVÚþûáöþ1‹Þ³ÜÉ2q¢½æŽ(MæKk½ÝðdÄ¸K²çzS³W®_`#9ì§“TD¢—"Æ,;ý3¡Þ fý0Í„"¢s¿,ß—ñê
D#–q†Ñ`®7:n}ŸO'S zP<"PÞ¢Ðsù$¹jx?³!¹Ã÷KÇ‹2JW­~‚I8ì^¨¸Œ¤*6øV^LÌã@…¶D]Jÿ/.ÖƒÓÛà§ð<œ„#Æœý4Â>¥ã2—Iš¢2ó´Ñà!S‘&±V:ä€ËYŸñ(a’àC:˜2ÖOv‰ÂK.S9Eq8é£­ž(ãæ’îôÝìBXFS¸k¿¨RÁ`³­¬B«UORHàD>Z¡Nü’vŒi¢ôÑ-žíØ'~­Œ˜¹Â3ìèe.‰ý€É‚»"ƒ2ã"FÁ›œý©D`dy†B ?ÐåÃ=ž~e;’�Ü4
5xŒ¸ŽœE'IŽ—ù“6~Qêó >lª[”r‡Ç{ä%¾mE43Ë«6Ÿh`©˜ìµDÄ¢™*eNè•(ù6Ñ¬í…ãûŽVT©'åuyxG/Ê›ªÎv†ˆÏœ½¹^•wÇÌKcÖð$þ8Qb¼(¥%ˆWïAÐ/ÌR¿å˜F&>Ÿ ;+Ê¼3~Üîž•RGnÆaèCdZ@5¾¸ñ{!~„»@4D-_7&¾=³•Ñ…ˆ¤ *¢(DX5&‹Æ¢¨%~_Çç½px_°ðÇ“¨HnUYµGqàb£Ê°Û±´¸™çfzœ¡¾ü’ð›†r=ihÕ‰’%$oæ‹îÊ”Çh\B×˜ÑŒ(ÚÁd7óÁJ§Ãÿé´ê¶NZÌ­fÑ§^K·ë0c×3<Ùä}£­iì2=qŒGB‚X„Þ(öL³ä¶ê�ÖSz¾@#œúC þE[.¹F¶d[Ñô+¸ïØùÊqê3“€g²XE;LÓOéô ®P^TÊ,ÌÍ(
V<…
%ƒ÷=Çà}_ÄcÐ½ ùžDÓæs©û,²÷£ôÚ!oûH¬áûôÑnfýt+µöXYjÇt¦|ÿí-uÜž¤R$>#’½5—æQß6w·þí-ï¹´Ú{i§¶—2ßY±<A³³¶¾Ú	ZAçñz§#ÂŸS¸f63�àšd‹I<Ý >z*a#õçƒéÄÚîÞ,\l´9ÿÎlÒ{}ó³½w„Û(MGÊd²ÉªRLFFX(f´øÐ9¥Ï5#<3¥S¢
.2ÌyarG1R´ðt:É“(®¡ez]ceßÕLU¥[6;âèŠ$q³€²6ÕÌžš²ö|ð°#}r˜³vL¹8lUâ’#ûÝÓ7iñ=µ¸¤F¬Q7S/?èŠÄ«7;ÆñVR	|ãYËþ“W8™!æEºŠy%9Å<73i
Ã|zU<Ž§ƒptÙ8+<ê
ÏÞù3Û¨b»jBÕ¥ÈÅáÝðLŸa;8.ßé¾P¼cwªsÌŽ¼ÄÓ#¯ðôÈ+”ø¼Ó9S2i¹Sw{ÒvÃ¿Ðé¼’O[Ï£íIÙ­%á6r—§ëÖëª‰1½¦È}µüq fÞæ	âÜièV‚oo•.ƒþZi<0xŒ÷õ Rò#‹+ww€ß IˆL•Ò€=Õï”äÊZ+3	ôgHþ,Rš3÷ÏÝž½–sÌJ	&ê-Ù01¡RÞ«eu£BËL1öäy<áùá‰MWî´tálK¶˜3¡‘
ÜJ/æJehe&}Ò_5&©.ÒÌYØ¾½-PÀ³€åÅ�¥æë¼‹txØI×ã`³Ëpè}“â<Ø#|†Ý²çC†Ðô.Ÿ,ôWiû“¨šùSUæO½-ÝzÇÓ(ìýðÿ��ÿÿ�
Šxœì½ÙvG²(úî¯Hay[@›�Yn™š")	§&@ûô’µÌªH”P¨‚k ÅVóÎûy9çýþÀýžû÷~Âˆœ³ª0P’%{kIªrŒŒŒ9#§³0eo½)Ûøa{c£Ã~ôâ/fQ1ó˜7Ì‚˜M½¬˜°"Îáÿ±—†,ŒÃ;¯˜óÙf~á{c(3•mnþÚì‡‘7FgaŽYL‡EÊ¼Ü+D³"‚^;«ÑGë³'_™?ýðÒz0,ò<‰­:I¼…£Éã÷Í{ü„½wFž³f˜$iÆ-{—á…—Í£M3m´:µ‚(Jeù˜Ë…³ ï“«nž±ïÅ£à$˜†±¤Í¸ˆ"§ø=ãQäeÙ¡7
¿?›µï±4) ¦ß~±<õâ,ÌÃ$n{QÄ¼Q^ÛÙÈ‹‚öìëÒLå,Këô”5†í`¤^ä·ïol°<x—·¯ÆaT®*”ö¦Ã [öæÌœÊ{!»iš\„ãœeá¿av[7lÝ^\¾˜úÙ£õi‚Óí«n �òæáWðÿ(‰³œ½Î’4v½F@_ß°Ç¬È‚~«ö¨‘‡Ó ÁþÃ³4LÒ0¿¦¼,²Æ“&ß¢¡ÒÞùy0Ê›&!îd£4�|}üø1TÁj-…d|ØN
=Ã0ð5)ìVtÁÌ»üÓŒ
G	,d?ORï"è\y/¦ÍÆU’NÎ£äê×Yšü
ƒJMl£áÈ&Z¦çéµƒù¼Ç™—fÝýØ?:ìÐ/£	3±y^¾“&QÀ§ìù€ÊVi[{K´}�Ì0ñRßÝ7|/Õ×'|¬JÖ¯4È‹46KÜ°‘—Æ¬¸#[_gç°[†Þhb–ÿªüM J.pŽ²ƒ›5voccCýæÝ3¾¤£(ðR¹Ê´ð¢65_s|y³
Z™”ˆýç?Ì|þ€;*òÐÄ:o#
öƒp»4ç€£ÁØ‹ý(8ù0ßã49qy™—]Ç#Ö,èq¶ÍŽ½4½èÑÞt%×AðÄóQ‘¦Aœsô3WÅD?ïÊsæûAzŽ‚ìŠÝdTL¡b³(5Ö˜ÑR'ô×˜ƒ‚96*wÌ{ÖétŒŠkø[TDºÀkBw;ºLÓhB5nm½¬~ë­ñ]“å)ÕðüÚjŒƒW ‡,à2…0|€Y>	R ÎÀCY˜ëQJ(gÍæ,
.Ö
7ñAgêÍšˆà°Í� Da(;A%°a$<hµÖDsz¤“ó´Ê¨}ä:µé€=n6$ÊbšøtÀÃkI°_Ja‰_x^Ä¦�‹ ziÂl°z§áî(Ø¨Y`àn	awp³=cä©ÝØß
†¹F[9¯€å&W¨¦°žÝ cõ<víMú°Š ÛñÅØ›ëïœvÙ.H%ìUPp!ø7ò²Èá	;ùß,y©Ç`NS/â§¿ÄèD€Àw¨<ó�õÃ!4Á«;–†©¹_8úJ`B/£‰ÂðÄ\q�M\%1(#Þô¦3`t}baÍ÷,¿žÀ®a)¦A–:ãvÓ*ïJ@ÒÝ 
`õÎ©%Øç0¢Q’ú™µåà-ìÖÁììcàQ;I1šóÈ‹¯ƒª¶NxSz‰Ï“”5y“>KÎe»&¹ÆUó‰mîvëÓ¨5)u¹Æ¨Í$‰¿ùª4w1¨jÚøb…ycñ…S–m~øœÍîO—·L­‹#ˆ=MU¶q ‘?˜žƒüß8XßXÓ5¡&`È¤æÓƒ�Äü‚ý�Æ,„Ëòðv´MB¬7ÉB6Ñ½Œy/3±· \F;+Œs
 ÁìHYSS¯º] F#vCVŒF°ŒaêÍ±Ì¬Aà€pÀlÆ^Â<B1!œÔÐË¥
ÉÍf’ÒmhRKM÷ð$`Ë‹ýPË‚¨¶®8ej¹rÂ’Ëe§^Xƒ}‹ýtD¹ÒTpLQ¤©G-‘"ÞšGÃýóc*ŸÃó|MÁa|'¨5(zì]²?z98ØïÅ³"ß¥˜Bˆ$Q$½ÜKasvðwö´ózãÍCÍ
ð¡–QÔs|ÜA ±;$yÍf ;’µ>óÏ
f,G¾Ç—íy¤?G´˜�º‚VÐ„¨4ï>/q7	Mä±1�4ëÐv§£Æí©~‰ìsˆ¥ç“Wì9€à„4!ãïN;„+âh2®¦!{ÈŠ™3U+ó´#¼¸eÊð´L¼€+ÄçcPi°$J¦�¹Þã`ÃÜ€µ9,Ü©ßGÛý±c”¸hêZ£õzóMi@ºÆÂAÙÁ%€ež‘·xd0˜|	Ã9€z4ëÞ,\¿@ûA¸NÊXð²­˜¬¹=ªiàø¨?0(�~Æ´ª Ø»ÊWc'‰sX§ö�0©±mïƒ·Y;
ÝØ?‡‰½íÊÆn¸H»Dl4H×œ2SÐŸ„Ìj_ºE²Œ±¥²7-ó÷æø‘ÈF0ï$wqù¢ïrµ*ª
AšŽ–
LZ(Øœ¤AiØ%Êjù<Å\u_²0Ù½%Š»Ê6gBnŸv}ÕÏ<¥ÛEw³	ÐQÏ^Ç¼¥;Œ›T¶Ù×ï¼ø£›³Eû€7û#à\æˆ‰6Ìi*0f7M½ëN˜Ñß¦~Ùbß|c4ß‰€æcR¢6Z7w·'v4ð „1”`„ýYs±@ J¨t@•ÎòÅ"ñ‚´)
9oFJC‹)Å9‘™œÏ¢OûM¢Þ}zžkŽklËj×å%¸úÍŠ–­Jsê—bü…ÅªÎHÏ¤pµN’øÇ;ú!Š+�q�õpª´†7@RÒË2ð¾D¸åD<n õSB»ÆM[úlÜÆê 
',È¯XHB@úƒÞ®@DÍp…v÷ ˆ¼QwÙ[Xf>’ŒLáÃ öÒÎ™CŠÔw)%†q¤{%QQ.»©|¸„èÀzX‹£(ŠŠ²w©mB–’ÒîC.à7PØÂÉ²0(:±Säx,þÊG¶ º²„Ó“}ÊV–¢M°¹	G‚¶¡Ô�‚¶f%æÍµZæå¨(6ÌQ:ßnqîîËìÄi³eÉ¢¨H'ã„Ì€°HCPb‰‚aˆø=.¢¢ãê5õò,ÌGµZÔÈ¯UÌ²l¶	Q(ûP·ŠO´€8ˆÆ·Ùkþíx#PþÑAM,AiJæ	¤8¦þ®Œ6]Ä9o¦·QzÉ
‹Õïú“p6“ïÊ6ˆ0¦h†p­æb“$r¢A{oŠ=SQôSAi�l£;ôvY±™s×K/
AzíyèÍÄPµ¥€+Y°7C »dG
‡ì.Æ]¢Éw±×»¬Ù;\?:´JU}+;"V˜–þÐÍAiE”øsÌhÑL×Ô4_žº‡/Ö{ô·µÆa`ên=´p!W¤¦õ…hj!MšÏ²ÈòdÚóuKˆwÁ»0ÃÏ‘™4j• pØåÂ¬ç!,­¼êýú:Ûì°q0š°á5ëí®ïð¾vÑBŽsaãævz.2¨[ø+Ç^FÔ•0›9sR»\oá<ð›MÉ€z§Ò¯�`KÌ¬WöZT9ÃJ0ÈÅÇìÛ“Ý­sµ¿`FÁ²nuXïœÅ	¬)p¨»ÆF´ÌH•B–4Ä	åõBŸùW=P¡r|àÒûI1%ŸD°ÌZ÷;óÆýû,¿£\hùl¦‚Š´¨?ñÐ .¨85SNZ°¼&4¥Èë¢JÑ¯ªRA6JÃ*ñFaýÐªð±Ñò÷‡I‡	ñ ¢¬AuyóaÕ(Â<2‡?ç@°fKÀ~¸
�ÿ«�¨Lõ·{^CKœ`BA€x>Æ6`ð	æ#2ŸúØÄ(*||—]g0êuø»Àê<"JÚ%îs¹1³£áÛ`”w&ÁuFËÔêÀvL¯›ð [ƒƒ~Ý}ã’üàw>·Àv¿ÐG$|:Ã3ïmºèÅhgj7o¼é„1<È°£V«ì§TËÂ_p]ÕØk¨û†#šx3àO­¥*[† TÄ œ…Ås,GZûöÛ‡Î;¨;Ä³j¯i2÷§óàŸžŸÃw [,»¨4ö.Ä$IbK+¢w9fCø¦’q|zÀU\£“åƒG9úà2Œ¼ÏVK®ŠàR”_ 8DÃ)¿RØ±Þš 'WÍV¹˜ÆµmÓ5þ´ã¶FýŽ°8oÜ¹ÎZ
Àš«	’’¥Î”Ú]t¨FˆÚ$ù]XyÉ1ùŠ³a‘&{…†õY0
awÃ¸²1$óÎ 
b­ÉQ%Ÿ­á­Æðk°¹vøKÐÁ#Dê«0 †rNÓz9a¨(0ó…ì°®ïC‰Ž#¨Jœ­“RÉ"	…~ýú½Æ–ø;aÜ9Æék
Û(-‘ýmnà§usöÐé=s±Æx‰¾&Òðh]®äÑµß!óÄ”í#Mi”®oR—açâýR=*]ß¡*‚ýÏ‰f=¥DÀ7Ýw-tŸc¸€ÜÜÉ«ðd¥MhôÔ2WÐÐ¨5ßØ*}VL§ÀwƒÜ#´
œõƒ(È¼ÂVÒ$zR#hÓ¶Ú$Ûc”YšRÖd	±éoàŒ|QïÄŽÂwQpåb7ú{|WN¼¼£°ð+•Nü3>ö¬ˆ&Ü•½”
ô•iuüü7g‹<ý6ÈÄãê›?3Ì¿r–·ðÎ]‡ñqW¬æ3X§òîÎYÂ]±„ÊÆ{cZ
ËVvåÏ]Þ¶)8¨1h~¤�Ó
Ÿ÷pó 9.Èr¡x«èJkábSê~âù»Á¹WDy?|áÊý!`a¦ƒ9@µ!{µŽ¾Ñ*]š?qÈ¶6¶¾o=ý%þ%¦×æ„0òËƒ¶¹}‡,¬"XM›‘ÆøH<¿ð†E|±î‡@F‡ÞxB¾Ÿºð°ß×ÊŠ&X´n³M¨õ/êíŒ,ÏsGw6Š(­Ø¸Å»{‡;È»ç†VaÔ©e:°„Ð
‘ueQÓôûHèV°¤Pîjm{i(îî=|J0Úqh¿/V€p^ÄR
Ôˆ«c¾F¸NÛ'
Ð]ÔQmmsEc»‘Öö5Ñ>¾T#Woëø¸´_Lž›nfêk€.¬ñUE¾qpšr¹¼oyÞ&×ãS37gÑ~_®E¡rGqtý±ƒ—ö_¼ìŸöEð²KÀšÇ‰¥(•"6Qá¥øã•—
14àØËók¶ãeãù
ü¥"XgîIDÏq–ÄÒ›H|”Ÿ›~!|âyf*¬°,)Ÿ’ÆB/:EOÐ†úÂ˜!.yÞ(¨×|%Þ¡…½d>¶?At53€cZª¢®9D®aãsÍL<˜…EÁØjÝ–?YA3<Æ—È½ÜC"p×s’o°ƒb>5ƒrhÇgÈÕ<Ê~]Ï¥82V¡­ñó*õƒú%nÏeŽ]BW¼Ü"ªâg+³Ìš€q´c¯Ÿ2hÜ‚È"Z:´¨þ'á½'ÔîÎf»’)-Ít÷Nz‡/ºƒî!{uÒôúÛœc)†'
íŸžœ¾ä‹|­À«1Ì:œvQ‘5#½2Àéä_®±‰`Ð#à‰Ó5¤@s²aërßz56òâ·EŽÃKqÖŒŸÀÀNŸ®zôÈe¥ÈìèG‰~%Q”ÇÆp"
Ní³×¢×FàjRÐð½0º>qŸÎÒ½NÆO¤ÖÏÒ Ä3äY Hòù„™®‰…§0”KÀ„ßŠ ³Î`ÎÆïß
˜!
_?&¿ýZ’/ƒñ(Nòð\DMË,Tµa²5¤8Ù{TšVÚÂø2	­9N½ÝüÀ¹Ûj–…±Ófîe“Ì„(?¥nV+@ÈßO.,ø$š5�‚¸)3®¦½© D„¡C´d<ßD•2ïV1VÀÂË8e2îêãþÒb„ìÉ–h\)Â‘ ðS-Eàg$aX®]!‚&dì1×ãRãY1Ç¼ÈÑ³ª³?Hœ&Pf’…ÜÊwsfójynK®*ãeÁ»Q0ËpôB‡ü�±§Qr×2)öëÉU¤ë~˜“ÓAŒÈ²*ñÁ^Zá}ÄŽöñ0írB"?_l^ôÒ¸´ªÁ2äÐÞ'¿ù« ˜Ñyk5ŠŠ3¸O…7Ê)èžŸ¯(šH+ºÌ?äùc =À’¦‹êDÁ»ÌÃíûÖ;O½\à+Y¯¾­À?.Â‹|qY¹Nº¸ÆÜžo¾awl(ºûe‘Ü-OˆåÍR¿UÊçûë6Éj[„£‹³7,
'
Ð†Áß$ö2¢ ¸,ù_OwDôt
ŠkŒ»íùŽ•¬à¨V}þ¿úƒ½C–Ãp_×Úø
±.a§®æÑ^9íd¯¿7øuçèàxo°g
‰‰_DRÜsºô¹kÄüSL†ê+¡(#‘»ôÇ\R›“	‚EÊðÃ+¥¦Ñ?m™þÙÞÉËn¿·¿ÍžUtÏÅ5?l›BIZý`t„NTÌ÷ >÷©ÜÆð¿šò6U–'iÐÞDTvœÃCÌ¢yPƒ­3²^Mð¸[¤eÉN•æ0çÔ¾ÄmyB—ÏVÚjjÏï¤à2ç%_‡ö9íH¡^µ´àøèÒŽqËgE1¤vÏ9—tD”ƒðIÿ²4–cÜÎyH½IÉ>zúî†FK›Õf C]ñÈ7ªs,S
q@`@,§]êý†`@IÀÆi)Fåd…y-cwÿqw%2‚6�.ÖqM»–¶è%à4.IVî„ö8µ6žtòd?¹
ÒXíf§ØÝRYªm‘S$§¤7Éß¦•ëÀ›ÍHÅicì	àçëÄÆÔl[O˜©9•|¬­3îdl®Y÷y’âG²#Ç²}Ð ëûp8¥ÛÕ®`ŽËö&™i}‡UìV´Éãº¬Ù™<M®lÝ˜YiayI,¸¹uO•qH¼7w‚•ÎJ}ÊÂs»µÐ¤¢OSè¨ÇKlxZ'aY¥¶Z•Êé9þ‹\Rš>àN ‰7åú¦FœQý [eÑ;rÇ€Î‚–lü£ÑªZ–³¯ßó’ €GÞ(h®ÿ’}»~±†„îÆÝYI¬‘(.gJKb@~Éµ¦p%x¯–lW…—‚çŠ¿5gh„‰*°FÍ“dXd9ç#iût&ÑÄÖz
#.\Iˆã+Ä™ôÚa<ÚŸÐk[œ³_c³+_þ(¥ÅQ´\4E;A/þ9ÌÇÔB7ö%£kzE>^cFóÔ¬©#‘´®bnÏB©orøÍ@4hnêƒ’!6Ð…±ð~å“<ÎZ&yãº¦€õ9Š¤k48X“i«ì`fä#'=¾WÄ«gQ¶ånWS‚0Íò5àewIØ1–B¸Hr˜ã+<œæØêqÕ)ˆÄíué~,¸–ãfñÃÛFJ<ï½¤ÖóÊÔ½¤•¨«ü¦ôl{þö«h£nöKÍŸéNê'ÈÊ|kaÁúsRŠÃ%Û|¢²!€‹`2kf§H«x[ª®°³×fÛ²²]Ó
ŸþR±©~H¦b÷Ð~S4ÆX» lX£„„WÜæbÓ‰šHäê„’@Pàqž$lŠÇÖÄöÍ0 4¾K„IÓœö.Ð®¡Ï,À¤š:w›=@—>ªúr•àÙ:tØÆÛ²CàûÃ4ð&tð³,Í¼*›µö„¯Y±¸
Î5¤â
¾š¯-Ë(BÊ“à•ÚjUŒM!è2Ùé‚Î
°Žtg0Ÿwç•;”Áô¨"ÌñôH6°|¤œ•�G¨ši�)Í`É2–”1¡CðÃÍÇcñ@;é`ÇZa-h=”>)–ä¼@•Yú8Mâðßj¯ ökHFå�óä“ÙsíÄå
“ÁsÀ/èV‚D9U´è¦*{,=»)#I‰J”øàGìŽš)U.ëúßˆ1IÊ¢¸Ä1fqùÛºÛÊWö/ë'?o±Ü—:Ó…çs¦B¾KTò.ÌÀT>Å5x}=èe•Ü{—ŸÀ[1{Zÿ~ZAJÝUp©CöE„¦–W
ðÕ˜¹W"’¹sÏù¹9î&àpJ"Ÿ‰qpi¡œŽ?JC]¬ÓéÏ’ø9Md,á_y£¬Ž‘ü¹Ëv,kxÕy¢%ªiáÛ=(^ð¬6Útð§}°û9&±â¥ÉäN§ztÊˆÊe†ç×ïñT[E/2À»ìë‘6sËÓ³Æ“ä+0GÒ;×Í…›†e
Aò ó±ÆI,ÉVHx¿¦Í
˜2ô†0pî¡°kÞQsÇÝO…øêZG…“GªœzhRÄÜÙ/²Šb-Zpu¢šq±ä!·ßÛéZ,(<‹<4óÜáÜ›aÍÃQØÄŒŒ§Mù¸f2à?ÿQ…Ež'‘«XôÓpŽõºðQ¯>PzPË­ô~'±7ÉÃóy 3	S-÷â¬�Œ ¯ Î(q`”j(ëŽoí)åXÒáPû1 ”ñçd2º€]¹³)¸WõTo@»1h‘X¾Y£C•rSXä¥œÎ,êRhœìö<«ÉSeB] ·aImþÜV:…;nûÛ&ªë¾Dkàv‰˜® '“,¨l½J€`
©ªr«k¡Ô¶´—²ÓÜ›zÕÅ¶—3[ÕHŒÐIWÕa?b¥º¢Û
iËæjç#!#Ë‹Þ‹A}±mQ¬´ÔÒG †)S2þ£Ñz½ñÆ-pÃ×}lnY"ùâl©c
"™pè0e‘{Åà°Qåî¾éûbqGíºROœm™“"òù±òö›ö$ÇvjSTÍ;ï{si|~ª	0
ûŽvh8%WÅæÊ–Õî­0ÙTæm“#SÊ{dU°r— <#Åã€wœÿÎdiQª"I+î–!G·1‰-AŠ>„-M†>)ZŠÕ †Øµ�‘øñ¨%é,xŸ¾ØÝ­@íêiRÅçéUœfQÒ¹-ŸvÔCxu.+ÂR÷7(©ÁÙž ‰heÍ}åîn7a«þ%‘ð0Æ¦Ñd‰BÔ
m}­@é‡oqÍeüR¥ð&RxÉK^Êð×iK£Zœˆp
ÓEIªt»özøÆ`o}	…Ñš30"†vÌtµEU-²ZY7µàÆ—úÛ^ÖXåì*TPçÆ—ºŠ_É„’íÕ:~8ËGÆ.ã»ö?	2´ì’º‰’µdêŒ«ÉÔ£àD((¼ÀHHP‘«¿Oü #‰¾QÙAeˆ	
q0üé0¼(’ÂH½#ý«‡ÁN^då5w`-¢
jC›
9Ñ{µµÂ˜Îo·GJso8œ¹,¯8Ã[tÙÀ­Ë½šˆuÊòî›D)M¿ÂþÄ+b¯•þH‡Ê“{²Š—sH×RLÇx´ØÚQ.MH'Ì®‚µ’ ûgÑqLÆüÙµÊÙ8‰1FmãÁæÖ½ïîÿ÷?l”-Ã\h¨Þ% @úáë7ÎóY¶½¾·ämvF£uEž†Ó‹Çß?øˆË9¿«û?Ô.ðüŠ›[%�‚I}6§ßY,sr@­(ö¨]_IA,£
ÙgTy×@cW_FrÀÏG’¬®—†ÌZŠ«;‹9G´PY†AXEbAm;s	÷œ+â8îÕÅŽH1‚J…‰ˆá¾Ž^^„Ùª¯Å¹Ì_Å¦gÄß”ãSq©„|$Øzä¹5—ESOmÑS =U8t?³5*@®qùÕÉÞîÞa¿×ÝÿõèçÃ½“_½Ýî«_ûÝƒî¯»½_Ÿuw^íî–*®ß‚7¬dŽ‡Æ=C°€,q1ÀLÈLË\œúª¾mÞ²¬ùþå¡|e°c¥çŸ³är.îñhv3Hú+c
h
eqZ‹eáj¬·6&×øþ×ÿùÿïÿÉŽ1z}Ðë2jj›élòda<“ç÷Q;¾RT?OÊ5J†ž�.êX…,áòo†bG³
Y©¨E†Áè¶b/#¨c%'óŽöOû½í’‘=q4è’ßýzQÄô>‚‘°»ûxwÎ+œB;¼+ÒLaÎGa#¹i°×2tˆdPµ»0—2mn’a‡&W¿`)‚á(A’èºrØƒ¨˜8¤sŒ(µaGàãÂáa–Ì½!CÿO&I4ç	�î"nc~ºÎåV³¬
4™7Ãÿïÿ¯ÿ‹u_õ÷úl·÷lÿèUï“Jìº']Ö$	;À@yŠ²…RÓ4®ÅÀò^T0qt€xçÉ<:2ÁÑËÇ@*Q#2^`â3‚ÓËî>ëöØéáàô{µ»æÐ¿ûêþ;ÜíòR	slpzøâÅ)HíÍû˜£7�®É—D¢<ïXœŸP÷ÃÛ`B·“M‡I$
Áà)ñvL)KÅ0J&!ÆôÓfÊ‚ÀºØ6Ñ¢•Q/+—hŽþVYžøH[k“‹ÊWhz¢Â|Tèíòí©÷"£³wì*/˜¼ÄÄºD@¤Îâ×^Üoå …7¿4P™D]pc'Œ×H©nø?Kf‡Ò\ÏøŽ&|Ä6)§£QbÏŽ‚‰:‚3!€fÈ¾+a^Ëá8_ÕžJW¤êHº¸‚H.€Ú´yã@Âœ¿§•ÔP7JM4•SÎ‰bÛbEÄu¹s7Zù×,Ðš7
žˆ ˆ	æMØ‡<ûU#Q§¦`oW˜ÆTÊ7°„ñ0yÇštç
]Æ’Í¼iKãWåI¨ùÜŸJ«¹»ôƒ¨*™r( ¼Ê  §Ç©“œ¸w®„¹FV‚ Ÿè@íQ?ø}4@¸|ï<Ç<,¡ iÕÛtòòSŽÇüPüG9“…)…Í„î¤?›ŒµPÔ9Þ‡Rü>@çhw8>ù±må9C
‘}ËÜtg?˜ÉÎx°´°ïSJ.+Ç„Á&Í†zîÜ_'\Uá¨¢=­«"ÚÜ£4ªê²`‘Lßô«.úUý·œN—ªMÃB+¯
p+¸ÍôRJ„Ó�Ü^eÏ
Ÿ™“’e#qµ[^>¯¬ãÁ�ô`ö´?•©á­Ç˜1VÝÆ¡jcN5£ÈUµñÔCEíöA¾K&{ÀêEÕˆVÕ«jÈÑ0gS3eôMo³¦ƒ9ò’zj(²£ƒÀ‹©Q=¹€=m+s†À”m½Œ“¾§1w¢:‚T¡–ó€v[Q=‡F¢nøÁKs„´Kw¸03^UÁ2Tl³×Ê6ŠqÞ)˜Ÿ€¼ÆœétnO¤ÄpŸ{hbQÏR¤‰1ÏO„—Þ0*WÙIðHÇ†åóÐ| TˆRQ<˜¬§"˜z8ål°ßñvÐ¶r3"¿ÁTåV'Ozý#‘È¾%
Çƒ’á»wêá½ðQ€I—EõHW½]<`ÎÆIˆÒØjû  ç˜-ŒìY=rîQD‘µö9qËd3ññ²o@oS ]Ä(ÑRÈX~8¤œ}\žqeª™Ž6FJÍ_Á¡ {e_Úë,ÊFã�¬[Å=À·§Æó›Za¨Æ,¨ÓÄP2LM´h4'ý×ñÉÑ{;¦¼±s²×µŽÛcúIËŒCs£Øª»¢åÀÄÒöSI5–µÌi/‰¯ÃÄ”ŒÑH#Ê‡5^ólkv@ðÏmï,OÃ kŠVºº‘–›r!Wk1ïâÝ(nöâuª‚F$sïÑu_öÁ N§£šèT”t~ýÆ±HÛ1qÖU±2X…êŸÐå5ÂÎÛTÝH*Þ±ŠAGïoZ¶Ù×,ð:ôßà]µð}žSž‡%U¨{%¯|yÂNp1€:Ÿ|)?ÔoJ†	(øG€
Îu€¨ù”P¤ùÞÊ›}hr~3Û}‡ÔÌz×'Wƒ¤_3w¡8=ÕIÍ¤ÈÃGì—Ô‡Z½A¤ø0ªÎ[êä=S[öm0Q2¾+Zã
M šÆ¨•ñ®w-î˜kâÂá®8½IÚ›x­.Ii´¦€(‚¦CÅµþf‡Þ!=×¹ù[õÍ]ÓfjÀP.
<ÖÇãPüKäe~;ñ†ôê•7
én—ÐØ©Œ7Ì‹†Ø;¢lóµì&ÞlÑû²ÚbÙº*#ØªüYÞè 9 YÇÑ…½*“*±Ü%iÛ$Ž¨#ëòäÌç›õÅeÊS_×k
$×\Öê&Œxµ|­ª°m~+F3:Û±w-®—»e&iÊ6sÀÚÑT¼"£SÌeâ›�eJžÜfàží×W:N`ÊÅó×€Ä›W^z
tWK0øöD8°¡)òkQü‚RïÅó[>TËlß›ñ[”èLb`ýºèr×|Râ‹«xT· „*ÂKÏõá>”"{q]5þ–ªm<ØÞØ°ªù¼zðš*nþÝ¬˜\âí†Óà%ˆ£0Z¡¿U·b•%HÉÞBœ¬®G/y²s¼"‰ØSÆõ$•ÑqÂqýSˆÉ+…Àökw0Ø;ÜíîìýÚÝ=è6œÒÝ¼^’¯—4IÊñCÌ­W&zß|ÃêÞ99éI
fnÅym®•w½!
Ì‘kñ,Æ³>úÂ,Ñ¿qz¼kË¶\º•mÈ\˜ Æ–:Vûò†a*Ud²U¥p¢7 Ûûž—¿~_ElnôíÌÆ”@˜ ‘á€KÍÙ§ä¨Œ$OrÄwæYï¥ý2Wá#º¤D c™»ýh•nÞ„ôBÑ/ã;:)ò&7¯[E¹dºÆ¶îol¸rd×÷K;dÚ²<»W³qšxj…qzAnßÌ»D5LÊ˜âÍø:œÎ¤'F@°VàäB?Ä5G¬
}E„Ûå/ÎœªÅR'—îÙ¼«WŒT{cëÇžžÍÍb;OQwó
Z;ÎH-XÞ`zW±ÆîÏG;H|Á˜Ï,L\
Ñ©Ý;Ëè5+#÷
HH»V,é4Ü¡kçóÊ¼ƒ¤ä^øm›©×%?™ã?B­dê¬“%(ØW’Î´àý[çm2Ü5®IÕ)6›3ëþTÌ)`>ÐI—~ëÄ$­´ZRPW›À“¶�–°yq¯]¿�
_[·xšè²¿ié[t{0Q[xºãkÏðUÜ– ÓêÒn°(9»TÔŸ·Y½ÜŽîx´BIXÜ`IŠPÃ<	²iH¹æ#ØYH…4/h†@wvOÏLÝ‡_SgÍ RQS
Èº‚ùG¶uO¶«ÄÅª²sä7¼°/œaFç
OÄjF_åŒPÕ´Ô
½·³Ûúþû~Cþ‡0Xªme½í¿Z?>b»aN¾å
çÅ*~‰¹>ˆmC>·üUµÈaÖP~ˆªÒ–âL ¦Š{¢¬œ.^2O¼ÌEoŠ‚~vþB­ç
¾Bž‡ü& ß:D5mÓë"·ÆoÄÍz">ž‡£¶ÕgGUù¿ü+ú=êv~„ºZÆDîù¸*¡ËÊˆ™Euð²ÃC¼Dç¡Ód›Ìèµ^G$-C2_ÊR¿Ä»G;íÎ[aN$ÏÊÄœ‰UCÜO±8
œÂ¡ÛbÛ._åXÅbž‡QpšF&±Ö¸;ƒ-s˜)yJ@üÜNš%Õ{Ÿêmæõ°ýé8Ÿžæš¡7Ì;>>²KKnƒj·V‘vvAå]5¶à-vlNºð“©KsvÃ¨ˆ1l%óƒåïûZ¹tÏÎ©Õ[EB—"œZ1~µóò.‰øBR–™‚£ÚøB,ØùiK%÷EÞJ­1¸ê$*)‹®ÅK•å1W&Î•}ˆ¿Ag…÷î©ÇäåÐØPèú«Ê5²@J¦Î=c =b·Ømö^ÓP¸©ÕÏúŽKÜ0EÉ¥{ˆ—´5ÑDèÕJqx_Ø›+ð³Ç‡ÏË�ÈvÚ‹Ï“úû{jÝ8.¢Y7Ù—Žê‰z˜fGÚP¦)Á
“~¥ÇÂ”ó­6öÅã9íÈš²-Ðb.•Y€éu1§ª©¢…²†#Nh[­™ïŒFËF¯S³‰®7\,Ut¦Þ^Ñ"‚¶m»ÎŒÑc

{Œ yµäñYË©l×mÚÕÌ’½Ì6Øqì*›õ*Ì51¨|‹LWÈ0Œ¹ÖàÝm÷VÜmÜ|C³7Í7cš$¨òçÉ"µ¢#X8ê™.ÅP…
¨7ìW|í•ƒÐöÒ
#gãø´†O¬¾(BuaUÃL#Ñæ©ƒŠ=ËRfï«6JUgåH‹¦jdi’é¬€È{³ä
(eþex1n0mˆ_÷“«Æ'Y1ÆßgQJÝfQD#·[>–t¹51Ì"úqÉø9UM®DLlS<¬g—·\Zµ<¥øÒêS‡ºa¬ÖëŒ,†T7éUNe©É,˜+!dû‘ˆÃãˆV³˜Ó¬‚Þ™nIrz;³ËH--v%=@…³/Ë®|:äµÂœí@ç/#ñÍáRH†ë÷‰ùvÈµÇmÝË‘NmÿTò„èáwá\å¾j—p üY^©½Â:~*‘T,½œÅí–¿/}$Ë!€áRáAŠùd¸ :³5öÑz¾Læ9[3Û¯Ö>êUMm!òñÛÜ…zôa žÌíppGxjlKÄ<4”¾]ºñØ==LžÊârþüª×òcÓGôT’549¯R=±çœç7õ[@°bÓ‰Îù0ü¤*ð·ŒY&Þ™9žY}‡m³cmèETŸ ÝáÆlÂ„ZÇš:å”T'¹Z²M§ÐcVßBm?9júÈ
T]³¶mIújZk«ªUÂ·Ñ¦hU9Å\ ÐÓ°1!é›©5k¥
Û‹<
TÿC»Y™J¦‚L¦UtÒì=óŸ†@½¤P|ÁƒH
ðàuà³]u»3¦Š93.{>³ Å‹ci�”QÊŠ0g¬é[pÁtŒq;ùqïtÐ=|ÑÀ@¿£ãLÎJW×€Q„Acy˜GûXÑ8O›¢´}é Ž•áµì·-7ë­l¼®‘Ê>Zn;s 3*²<™ö|ç—
*=úè¥*û"påŽ%yÃ<&E[•¦u¼)%\† -M Ìöé&Jnâ®#'q˜ÌíA¸z‡‰“Pœ'›×°Üº¡V'
â‹|Ìž°*÷M=é²nZ7vÇÍLÿúXu½
ÚD¸ªè“ÏÉ“/iŠÕ‹”ä|¢F$Îù­–Ñè‚CV¶¼ÕSZáôgßÈ «
£ôg“–(Pa•®ÆÉÅE¤ÂUù5–½Ak•ŒÂß]«j˜çÒhˆê[çeðÖUúŽÓ€[P¹@u-‹§|hÖå‡â2‚†tYow¢$üšwÉtF/T¿Þ
ó$ò&f²¾§xþžeÀÅ<ëŠ°m«>Æ?˜%VnÃusDÜ`uv„üTG‚Ü&ÎçSÆøÌ‹ï±sFk­\rçøIiùi0^X¥}ð¦hªŒ¢©”EÕ¡˜:ãÊ
¼:ˆQ½*ÆF²ž;b	ar‰ðàI¥%—ñZò¨ky-ßTÄ¡,!ÆkJžq(˜Ñ¶¨z0š±dÎ>Ø1J±ÈZô©lqk¿ï$?LD®ó¡ÞBFvÎ-ïs­e`ª­Š]ƒûFÇ5ø‰Ô0y›ÜgF½í%ê[ëÌ…ÃçáŽ9ò6+àž³E‹zŠ¡7–TfvŸíÏ"c¨Î3ÏÀQ
ï95ä>‹µÁâÞ.¯¯¶qZ¨ço‹8ÜmcY?m$ëò|Ž•¤_IV'ÏTÒq…åO†”™aH³2…›Ï¯–cV¼¥[0ª9óœOÞ?Ÿ*W*&WŽÜÑ¶bg>Õó¨¿¶ÎTp ä7|c:|g¡eF3žOd”±YŽ;ƒÊð¹YIY"4®BÜ?÷‘´'±×dšç"-ïÏUXÃŽc_]Áô-Ž5p‹õga@ýgxEú¬«Œ_Ñ\!.%6Ë‰óB)},ê=ç…0KgÓšž¦élnbr1Ç"SIØ0ÐszÌ:fè· j|/åð„Kq–Ô‰5áá6¡msXT±ƒÉV¡YÌ]¹Žç|ðl“5'Å
nZ.³[ŽXZÓ4üâV(»9ßOEA{œsÆ÷g¢u%ó?2¦¡[Y„nC ”Yç’vþªN¶#û”ÑrÄ¦t4é³›ÛúÑ®Öx^ªø'Ææg¡wíYV“H$Lùäm€Jz­5+‘˜‡ÍœMm³acòâÏÂ4]f(X§Å
•Ùó±´¶X] ¹¿TöxÛ=Íá5Ÿ÷,»Í—iëÏ»óÕY—ãÃ;žxQxÚè¾ôž³æææµèJ‘Ã£Ã¶x¶–è?D<ÇÑVÙnª©…Î6râ
ñþ–å…u¨Ù|ñFrëx'Pýc<ÕëD|»iôO?³ÙæJLß1µœtŸÙ¶ûh¿{¦“Ÿé7ì1å3ù&Ã: 2dZ¡í#¡ØÆ
Ð¸óÎµ‡è“¢56±Æ™¶q¤ò‰aãÀo>˜É–·K/M~æ4Qi¥þƒÓ›!àI0‰à]e¢*ix¾oÒì0.C9N‚i¢Ê­D<°ýì³ìöò~(ïè,þ]q¶Õx>‰g×m“ºM(ÐGÝ")âùm7‰f¯–ä¯‰§wxR‚þñ+:u|DžuûúÒ/f³$åNz7uÈ'ðÙ¹,�¢Ìd1CCƒŸŒ1#BÀÄ`¦+åfXœ™ÁuO¨´âÚM&¸¸¬çxÕfTáÎhˆäÃ
$`,àÕ�'ƒO—Òa˜¾±iÅrVµŠFçŸÉ„6Pj}C¢Ñ×ï¶ßX
Æ¸;U{üß°^Š¤ñ¼#·%k_ã›kÎÆáuÉÈ£lžÊîiFvX H0Í#ï’‘öŒé”-Š˜)Øõ]‚2Eu2R(ãšÍ=Ñ§¦óæÁ!Çã}{Ø²õ(pbÉf"6Ë,Pv“ºR+jÕà7ß˜ã5Bd‰q™Ð³FÑ�::ö€ç0Ò€R¬¤Â;¾Ø?þ¥g{šŸØÉ„HEV'Å‰²ê²+ ÅÛ"ì0Ûû¨R?‘ñ¢pŒÙðÌÌš<­ö—»¾h½>o4Ýûd<êsEv­ÈâÔˆˆÕýîsä_þ„ŒSàµ/_›å?2·$"¶2ÃT:@_¤ãZŽY¢ƒ½¬”Î:çN?¯poÌÐ‘ðû;/kI²œ©…é|–ú‘˜¡i(+%{¬¥å¨yZeF3åhYîVÂ´‘kÍíö3IÒsFô§¦?zþÆ6¼±Ø‹1S¢ØMÃ´¥}aZ‚}õ“Æ¢âñJ)ldw‹RÛ|NqÛÜ€›#<­µá©ì[Ï´^à†2fœ9Ò5”¬•®ÿÚñ_ðŽ¿sLFïŠ•÷±ö.\âÛÚ	l»¾@”K½#r¡LNÇð•ÎVûE°[uæ:äyz+ßqçô‰sŽqžCÙËÆÆá=ß?ytq…Kß.{‘&YÆW„ÐÉ–t”€xb7
Ý¨ˆýºò¤µF”t%ŠñÖ~ù„m(,Z_N•±cªÂä«BÆ9yúñÁÉÁ-<–«,Éqª#Û>kHejÔåÈ´•NÒmÜ¾)ßîMl…Rþ˜l³mC‹5vˆ[ÅxUª&Âx5ëRÌŸÑÕï»”Cyi¯=2iEøÉšø­DÒ/.<òÏG"¾È3ùyb­·@4Eôyõø‹ÏÏ7kÏâ»§Þ•=ðìxð¢y“Ûêžsæ–oêƒùú0þ­àßòÈ}ù”<)IÎa]çÓ.ãF8É¨å‡¸˜DI©çNòò¼›D%Ù«/g		¢LAµè˜š–~XA Õø§Ä2Ämoÿô€=ëþ«{R¦mÚöØn”¨
î6Õ«3¨<³(E×9axÛüFj
Ä£�<1§L´Õ™Ù¸é"„F×`œŒ·ÉÐ‡9&ËÌ‰˜êSkF7s3¨Ûù¬¹›és+8iJÒ·ÌýNÛšFš3§Œ�Š–¹w‰iÿ-T×œTÒŒ
;½é¶™ ¤l·WÍ›€–‰0ªSç–‘ÙðÄC'‹�ÖÍö÷ŽÝßÕgPÉþ%=µ­þ9^¶8+åV4RXàk‘óÇ³Ã¿ÂÄdf5I+¤(gy&än©Ô<Oå]©òzBùHèS£œá˜(—¬ôpÜÜEG‹-ô…ˆ’•‰ÓÃã.:<ÌYX7žœoÊŽÃo¨bß oaª«„ªa”‚¬â–·®UÔ¢oÅ†}í’k^‚ÒÅæŽV«·ü†ÖÈlïÅ»øµUž'0‚Wol>ÐÓ¡wMùÙâ†0ë2Š©ŸÄø%àGÀž¯c{³YtÃ=}<XÒ<£²B~ì¦©wýè½¥l?¬P´VkÓ%=šÝ<ùKvµÀcS)yl.€àÉx‹À;ÇpW«I[±ñ•ñ††«©·ï9Ì¢RÏ…±°oÙfÕå/y‰‚›¨’W
ZËè®ÁË]µÜ¯"óy­¦êÈxÎ»z™mi•Ô j†ùóÖù´-ÅÎE›¥#4óÇŽfüK9ü”Ã]CßpL4÷ Òš¼Bit÷u=(+ŠùB±\b1µª'eŠói@ãÓbð#haååý@áí/mì/mì/mŒ>¥6VÞ¸&m¬?	¦M5Œ­Ã<AêÍ0Z7Š–¨y¦ÉQ£õÑ£—¢kTs°u!È¯|ÐgeOhNÞ¢§c?x÷Ôv†âó£áÛ§dçû,ºXî¥
>ŸàÕ´³Å6ëÒÅâÖÃƒÎs2ËªŸ¥TµùäéÊ³)³—qãqÂ’6yN2œ–íbÃKOyæØ5Œ½eaþ%ù8H¯Bø
x4ôF)¨s{tËÂÑiÝr+;-[é}\D‘ÎÃúÔ)¢^�»Õ¨ùÔ²Ï÷-šCT'Ú¸!4w¹+BoøÖÅq“˜"ÿ"ÊðWrÙÆ
]·²YÓmÞSn¿%Z1‘<¯ûe¶«™Ö%2çî7³E|°¨5"jåu·_á’ãS´U(`âÛºÖÅS$û²ô—Gø³+ý‡¡ l TRe8ÌtAAÙœgVþê§¥×lÛ¢®Â`¨&²Wíf[žž| EùX4åSS•MW>5e©¤-uYEI×¨U!é»ˆdÊó·è
<þÈú¹Õò2Úymžô²7Æ=ªÜùÜÉÑõñæZÏMEÖW»TlôôdöÛI�$ÅqKÕ**Äg=ÚpŽ.¡ôÔ$
â]që¡KÕ¬>T[5}ÁîöŠ(ØßYïð§uÊ)­€Ïa§ÿ+ðÒfëfÝŠîÃh>ö-sƒü~¨
òÃgª€Èt–ã…Y1™ÐçSÀ¹RY0‚Æ{ú
À"Î‹‰\ÿ0a¬q[S6û‘"¯œ;²F´&�ÆÆ£ Šßb(‡§Û0®2¶ºt½jñ%7ŒøÚ·�‘Ý¦S #†ë)ºbÒ?ÛÎ2ð.`ƒÇÂ¾‚ùÔ²‹KåÛìXPØ®1¼P2Mëˆ eÓtÅv	ñ¬:º×|,àß”}|z7ÚVoaÉ¼Ì
ZÛbiôknrãö<uc¥–F’V:â…ß²ã6:3ä²Î:(
võ=ãHïý›gÔ©o@Ùß;Üí¡"_6y›qU|[j3: ¿„ÚÂÿ¾ßÿQœírgMGD(—Ìa@¸ùc†h÷cÿè°ÃÉdx~ÝÔXk›Mð/–û-,p€.'ì0ðg&ºT‚µ²ê
ˆU'?,;E)1›µ¦AŒéØ}’kU­ïøné•7›{øX«ÊýYó—O6ËU‘çÍK.%Ìð¤Ã0G†$€
Ä’/ÅdC‚Ö
vÔ(ÑÚp¯˜r’žÌ,JÌw¾š«=Oª7eø'ÑÛ¿üSÎy@–Ý1LõÂ6oR%Ã@ö‡´ ¨¶k¡WÚäV[Å•Ï>®'Ø“ò$ˆm¹Œ+Ô§¿¤ÿùÒ¿â(Ð—&Tê©Ù–zh¢Ö¢­m3p^_\%+„t !;Õ;Moh…'G‹/å¼õÄdð`­Ô#žY¡FÁÒÃnH2CµÄpk†Oé±ú2Ë½9wMM•µM`™}ÿ˜v%tÒÀ/FA³™ÐÂxø
Â©
-¡”¸¢ÂÇÎcÌŒ¦±#"�Í©	Ë¤{´)ôëk,§]{e¨:_#´¡mw|OØùiœ1<.•´Â[Ì6ÉËcŽÊ8£"ö2ÌàX›ñfKü•ê·…Æ)ÂŒú�È´»rÏvC0ÆgD•ñ¦*Õ
uðésÜ É:Lòð<Q*ï9"ýq÷_@±~Õk}Ê¹k,a?œz¦Áôwîù—¯VZûÚ¥ýtþåÿašÍl;GIƒ©âb|S	ÂKoH¹jÒ­·kšùè8Hþ™T—AýV¶Ç>ljN¥?ªúrå…çjùÙK,å×æ·\'QcïHÑ´-rFü™BœQü9âª·Dc€7¬¢o
äCvŒ/?ùí"À\¶Xb¼’Qâ»h%œû•s•qG*H €PFbî ©ÀÀ}ÂX³ááÑ8,fÞËøs7÷Îú:ÛO.Â–"’g8ÑIrìÀ›eìôdßF¿4: È=¶&ÂÎ›ëÿh¶ŸþâûKþk­™?Öm—h¦¯yˆÔ3JðÐ?WE_o¾1”lQ8‰k
ov,3H„+`[¹pW÷¡%ÈBR`4zvËÂkFuYˆîv/Ö•”{'Øƒª¼à
D¦0†™»ëÈ¯Ã^C°˜ƒøÊÜzöFÚã	_èg‚•Üa/Žûè‡óƒ<˜d¡áqŸçs¿…×?&Æ–´4Èfð…6QÐó�‘LU>çù,Û^_“)‚$œv’Y�5Ó Èªu’ôb=¼t4~Ê§¿Í’ø›ßý>ˆqkžžôð¢î$F2lâsëæ›(œ†ùãM%÷:tÖÄS“#í`ûMÓ©†šÂ_+´h!âc
ÐN:ðb1â«Â´ô!þ"Ä%›Ó2Ð¾IšÄw>!Â—¦ˆH‘ýdC�QÚ÷&d˜ž˜nõAQ#WN†÷ÃÉ[±Æþ\!ß—bŒ,`ñ¦C”2—#«Û(˜àÝuH+@<)1rØÂ@ó¢Hs‡/q0-–#ËX°œ4	haÇÌGñ…ù F¦¼íÁNŽ…x6ú£ÊGïåæÆÃµªÎj%¦
|_E^úTAU|qá©^Ö
„¬;hñ[dtO.QCÒà·’c„NI™O¼>1ƒÐu¼¥“…®ØUV9FI#É2Øc­ïª³
;E²uÖûw7ÔkŒ[oDw)§™ï¶ê'A8@äëÌBÔDj¾Íì×0«‘—»þ%Æ	¡Ôa­¼ãÕmù6C¶GìØïÃªÑÂËq
/Õn”âBK¿ôm{
×xmÓÁÃ‘¤|è;J.è†æ0¿ÖI£{||rôSwß°äñ€MžÎfòd†~{öõ{ÑAOcâS2…_óTät/üL€ä6nðh+<9æjýú=‚þHsŠ÷ ø<í ­ñP_yé5Œ:nÜ%¸½ú9³-‚¢ÀB{ ©qcŠGÁ”¥~$Ñ Wy[S˜‰]™“�±æ¥ãšSNî°ý—^”³©ïÒ8º±ï	ëøœ!ùÖ|9$ÄmÌfá9J;oÕ;Æ@]|ä±Kš³Ä†Ù‹)ðL¿˜où0hí°û§;;{ý>
º»¿w2°\Ðmp‘¤×Û5Ô€®ëºd|ÚÏfÃvµÚ€ù�å%†àº0$›ÂãÝä“`:‹’ë QpÝý}{l:È«êˆ¤Ék˜ ÞtÇæZu‰ËÁïÍ5Ë[Ft›Â|2àªšd,:î‰ïfV†À§“� ÔyJÔÞ% ©ÁŠ Áñ<¸Tj?:À.×”Ð«ò\ülÞ‹C\;ð2örp°ODÄ¬f´Ëùe´¬{°$Fá‘ån°ZÈªÑ4‹¦»Íä¬%Ðu%O` ç‚ñÄ°Oá¨R0pS¤`lˆý¹…éaUé)(¡¿¥Ê®¡^TÕÁ«â¨´]‘Þ5Zjgè-m—“Ï«Ú—¼Ïiš?æˆíÒ6½ô€w#MäNwjóÇfwÔ€:žaVç¶1I$·‡ß„xðW2ûê.Œ‚VÐ&ºò€HV/>OJ0·_WA&Br¢‹mÛèè¼Åé•IÕ¬HG €‹xXgñŒw
ó˜£rIÎ+o@_#áiêFÊdS¨ç)>V4+M–Bax +íMyæÉEýþÞ oJEnHjOw»ƒ=¢³;'{øÕ‘ìÒ€Bu!TŠG”§x°Gû™Î�ÐEyÓxB;ò]I}ìÆKŽèÕ„¾—õb$w°uß‹Ž@€°´X*ÕÕnRü¾ÉLžäÌ¬‹$ÈPÌˆMóg+Üh¹,ßÙZ‘ï oà+·œÙà:œÎ€ÅârÔr`>U0`ŠñK®Á;¬€»:¦… È,žHÜ{ä‡—l3Cšò¸q¾|Æ0¤öûwûõææÆvïx`x³Ä){[d ‡]ËŸ³ö÷lxÑÎ0£UØÈú÷O;ûi2k£"mgÓ†>àþhšÐL‡èDzüo’÷F!WØÀ,ôæèØèüpŸÝÜå½8œBVùMU~Ó.lÌz5†Ù0Êøí×ßmÌÞ½I<`Wís<ô6õÞµ¯Ú[ï"–=?á_AðI^µ¯Û^‘'ThÜ~ýÃÆåøÖäÌcü%è"%è†A~±
×é1¶¿cCL’‘¶‡ò‡-pî†ÙïÃ~ÏÆ÷Ìnóà]N38Oâ–ƒŽ¡ã3µ^}È Œí<¼ç
·AÆ\CqëÑÐæ£ßììÌÆ;¢õñ½Ò(g¥Aò}¢¡N?,¦b¬ÓŠQíƒv2ñf@æ‚ø,ú_1‹Qfü²ûŒ.»ï”3s`¸^â£a‘çIìÔLâ(M¿o–¤òÏrÐ*_KåçÆ¦µYû#bn«í(¢0›9'ÿn¸6¨óIê˜BJËò?Xþ¶ÕÖw7lÝ‹…äxæäÂ�«~1DÁ{Gr¾1'ÁÎ
`G}_Öf¹‹Düçµ·Ø…7kWB	·šl~«y\D%|½IÔ z¯ jh¨ÕÖ»æ*ôÑ�3‹Ú›1Í{¸1<rÔ;ÃX§qTŒ/ŒgE^Ñš8§F±ß["qòŠ*1Í„òŠ·¨b†©:+g~PÑå€©ªhÀNPÎÙ»ö}6»F&òþ† a%R¦ð‰“ØåðIä3`Ï(ÓŽ“8€Ç#CPzƒ¶3ñJ¯×77ª8ƒÆÐX>nì½Ûf{ïFÞ¥›“íÀ ÒYE^Z®¹^B¬2‰øb±í H'¬ùE¸Ö§E7.&Öâ×ëþ{#Ü+ÍŠÛ¡X™¶þÙ(ã�„y¶ÎPŸÿ´¸ªLõøª­
ÿ½qöx§
ºOûÁŸŒ.¾ôÒ`ÃA²æÉì“F24Õ£·CÝÍ¸söh%þ"‰øyÅMá
ø™è¥[
A¥…³G•
ô³âZ¹÷* =Jx†ìKši£‹áBÏ@]V´ÎK-ÑÀ« öA^÷âÆõu…êÇ ‚y/k<‘ßV¨¼“<MâpÒx¢¿¯ÐÀ¾Æñµ×x"¾ÔW}´ÎQçLÖÅ¡œWIì‡Ù§Þ5ÂöY»g„à¸c”£âÉ H³À=à’ç_·VÀ¼^ŒéWOúawÃ‹"Æ0¨š0<'»^„	faó^yùJÍ<K“I�»÷¤È¼	H˜/avñÅGÙ	·`A›lêoÿa9’Œ'Ç$ =y®YìÃE§ŠŽ/ÓôåT–¶ü@FU«fYèÓûÜ¼‚Öñ¸š‚þQñjŽDh:«j¥?¿æí.ûý¡õ†Ýîƒ9_3ÏºxŒôéhÛû(Óp]â6\‡{nëqGxvÿx\§ñ¤ÝfŠëí`×™“`íö<Zÿ^û¾éxNÀoY¨ÜŠ²ÇIpýø=CßˆÎùªæyÒ-
ßÒ$
nªIÂ¼a¶Zå%ûÈ|¦~‹ünD\¾Î0*@óêÒü*7Ä#ìÝK¯Ôì<SŽ‰P²0ç8¥b¿#Ñœ†1:¡@¿<K3ÞåÎ¬·òâyPü&~8ét:n%?ÍbÌ!g$‰!l–k‡c¾ÈáXç“Š¿,Oq¡ïluïÙrþ³
sš½ê¸¼ÆÆ¸ï¬¶»}Þesöã ÛâþVé“ó¢ÈVy=pí£UÎ8z>wy2rÊÍÝ-Á×ùDmÏùÊ îtíX—BÃÖ†“|öÃêpêó
tD/­Õ}´ŽÎK#Ta]Ç*È§F%B¶ê(Á—M¾´ A–Ã œè@|ää‰0«ákìŽBÉ+ÃÿÄ%*vè=¬
³[ÚuŒWÕa}ê‹Ó'^TÕ¬/âÀ”âÙô›yA~scüŒˆÃ$¥�”R´!=/UðA±æYjB×dš°µ[F¨ábÊ�5¹°vôbíœÀ­ÂŸùq[Ï0XdP\P+n‹?ÄßâÉO¸•,ÝÂA[‘[ÉÂØ­'± xK´:nË‚xUÈ–•ÇwWà…³—%ºˆÑš°.¥
ÍÍö"Z¨KEúà{1|øoìÞÜvþŠ7«7»—SŒ7ÛÜøÎ6oRvo…2èÕñO‹U1f6Õ ¿ iãÃ´ªxs	Æ	Çïf¶"r©ú¿EÕs?åá”EÐƒ/þ½ƒÍæl«hé–ŸyafWíÍ-6ÆÿLµÈ%—ß,°$ÅEÛúŠTChUª=X¨ö»(ä¯7:[HB¦5yá‘Ø'ë:1ø’yµÅÖVÇMÞC¢^ÎåÀÒËZ/÷¼PŠJuýê)÷WR×_oýý@3ç}G9qèßŸÂ,LÐ‚Dƒ
Bt—{ñÿö‘[t?‚Ž¿ŒÂ¼ülfØHÍäµ‚ô¨†eý`“«‰Ôúæ²Z£«V;*ŠÌ	ãø}ÑØ@càéèƒ¬´Ç!¦9äÐétæÚfUš)ž9iYÓìÌ4ÍÎæšfgµq®ŸÔûïŒ Í’8ŒØ¿¸×•Ô’ÉJ~º[ì­@×oCÉþo³KÄb,Ú'ù0–âR÷þp\Šl>^öi7Ÿ4-Ñ)ÓÒ`Jê~T¸!7D}îv«µŸ\5žìý¼J	‡È“ƒ½ÝÞéÁ
_‚¶Úxò²÷âå
•NÓLçñäôäÅÞáànµÁy¼Õ§Ån‘òq{øÉÌ^1àê‹ÂkšÚ“ÁÛ=Z-Æ
±‹4È²Æ“Þ!;>9zq²×ï¯ÖÄIpWÔÀÉÞO½½U6×.NøÉîÑáÞŸÕwm³ª9‹‹wr¬¹õè­ü�«IO·úd²ÕŠjòÇ
ÿ1»A6IÃY²oX3/“R„êFØ^�å@«³Ç˜>¶²U&¹Ê¿ÿn®·ÜA˜ïWD˜ÎýePh[øïßÅ3(¢5%}‚X¬#£óCL|~’‹ß9°b9KñR¶âåC*îW‹×››ÎV›³·êªÒülÙ§¿ø ‹×[oªûƒœ˜ã2º-ðw’øªf[â~ûmòaµp·Òb9.‘¯ÐvÚˆ˜ý°ìµùC3þY$¹g§Eü\ñÔ^†(3À¬ýÐÊÆCõ4÷ÞÙ.ðHmEAÊ#ÚCßÊ6SÓÃß¯ßà•ÒËï—éæ¹7ãŽâã¬Œü²ä•.f˜Z=ðŸ‡…ÎµÊ9Y_z©7cx7Æ¤™S(R/Ç”qÞÝ¶!RÅ¥Q0ÇÌ÷ÆETX	“ÝüÆz<{ë=ÛGí¬ÀÖ0¦ò–Y^öÒõ«q4OŠYè[ìÍc Ä†þÜaˆ/¬Ý=,
¶¢ÂŽ­t¥z]y¾-ÜÑM£éu¶ÙÙÜ4FÃ×Ü(ÑVÔ&Ê5z¹(
‘ÙhdÌPcMíE´t›:íÚžÂšyWY÷Ö*×0•¬€5ˆyÓYˆ+Ó?~‰©…\|«¸½ö2‰ªo¯ÝOò†ûø˜g�“P±�òûZË¯Œm+@lAê7sƒU\©…àâ·˜ÁS*{*sÑë:üÖ3(‡7¨ÑÝê7®¾Â�j€!îúø›x¢fÍŸ[i©%n|+î2_VÞZF·õb«"DŒ–ßZó6^£µ×ÈY~wöîí½jY­9Ùïù"«)V5a,x(ì²bõs+ÌËÖìTzáezrL¬¶)š†/l×ËF±–!>|Ë$C-ãßØ†I0,*¥×QI³¢(@ÔüAHP|BÅþs0'˜›ªa0™ê”€â–[') ?º\X‘íÍw²¶É²i0
gxÁ³[A½¨ŒÌsxSu¨^TÕz›wëí·UõCÎ‘5©ðB‡þÀj­•TA“n´Rã„
ÒÛRâÀ°
~à”KŠnI	5ð'¶¹ù_
»Ì@ÏôŸ]/wù–Ì_h•Õ+oä!-£™zYûo˜üv¬ƒ<‘ÊÏ’ßÜk¿edf¹yÃj¸›zçš/hÖÅS'ºüFO¶Ü¨]×Š~÷¤ïï¿³[æÏµªKÉvWëTüÈH>¨ú²ã;Õã9Až?9£-…zZfÖ|ýÆ|yêÀ¶Tû´¢fÃŠýì†ØA0�eÇyc'mï“¸©Å<#u{F:ÇG(uÖ×BŽçóç*;Þ}N÷ì0m©ÇM	ç³äœ…SŒ1CÕùÚ †Å=„c^S–Jko.%.®‘É—TÔÄñtg³•/ñ¡ÀW…?+å-Trþ)sO’È¸è]‘ oÁÿ;I|^2Á¥°”dLø½’5-½G°¹=°øÀè¼'Gû{f†N™“ÓHÄy�òAyðÂ‡1ó&˜X˜_Ì'üõ{š’-ÛÚ«‰0™³3ûdR|,6?�»Aÿô;b5DÃù¯„c°ùèÅm»ÈÄr\ê¯t•ÚÐ»½Ø¾ÝÀ÷Âèú„Äóþ4"á•}î›¹7$‘ßrºë1ˆÀr$â™ÌÏ›q`ÊÜ¼|PÎµ9ÐÒ.ÚÑ>í¨ÁâfØ¼Ø¥zGbäNUsBªvmúkË”g‹Æ‡m&^GmA<UÏÔ€õ#s Æ¥Ÿüj³º´åâuI6A!D²ìAÄãÑ@Âí»¨½é}šÑ­€x‡Ú0h
°Iù—P_M_/ÁÇÕ:iEN¶ÿ-%×O±)ºt€.
Åk¯`í'¼¤ê¦¶hÇ—µ¾bhªG·à%öèdÅ4û«ãÙœë ÇÝ5ÝdRDTP¯YéžGš Zu!ÛUÇJî|¤{…S£?Kñ÷rùäeâeªÂ[KÀ.ð†Z(§<
 ãÿV¡f•xäÌ?Ç·Ôk6fÐéÿ÷¾“]Ê‹/‚ŸC•W¬×áyQ_ôÃ¨IPÇ´9ÅŒïÍKÔ™9-¤aÀïº¥ë·ŽV-¶stpÜ=ü{¹×ÝÝ;¡Ø;,È~Ñ†x7·¶ÖØ½kìï’›`	Ðäòææý5†ÿ¶Ä¿Æó†QñDÑÈ}*Ãÿ³=O€|Á››ß•_4ã ºòpä!ØÐeö‘“úb�ïh˜J,
`c
ŽlÔu½UjôxÐa/º'»]Ö;<ú©Ûï±ûGÏºûƒ½—xk’Z°6‡Á†¦¸^^àµ<)¥ê*CMÏÎ9Æ›ß¢Ò¬E_˜È¨˜zxeò‹4¼öX6žE~%öì{v˜L“”Ýƒ!ž:[ë?hÅÒžƒxº¥¾½wfÂnø›º¡ìfvŠ€é½ko½
F9$øå
)UI€yV
ã‡U‡ÑxæáirÄÉû[÷ÙØÆƒÚ›ß?ø{ûï?|W±f÷î­´f2ÝßÄ~î•Æ‚Bõ‹(zQŒÆÀîª:þûZÅ¬n‹»·Ý6ýÓ“î€ïvîžtÙËîÉ‹®5Úu›
7­,?Ò°`ƒnáæß¡Ø}˜×æ=úâLFö‡Ûâ{ƒ§öhp’óýƒÒ{$ü÷*_)jÝQ(NÒ*Z9‰þ^^[ÙCù•îA«Ñ,·B;¹·Q;çODÈ½ˆ‚•ˆ„@²›šÉP7ófƒlVtRÑ„r¨næÌ¦üNwc›éd‡L²
ˆ&lãM¼iÈà×Ì£³_Ú·5&Ûš5ÊfAž‡tKa�×ç®ŽpRäÛŠiâóÃ†"1ôåSù¸o2ßÑ:e6ar$'ÜÜðY¹úëÆá	T'Ýl¶ã½W{'?v»‡øì§#’µúÝÁ) ·bãÇÓƒýîËÆ›ònZ°ÅmþŽIüWÅÅ¯m…kùÀåç‹
÷&´Ð6¾) 5îœ'éž77›ãÀóoCË‹¢X¾~Ç¾è¾ßpt
?ïwæÒ!†uóJõ¦/×øâÁòd‡
jä$±žA'hiñâ£‘	$
Mjæ¼Ù2n']Ãò–X”á€ÇTµø·‘ÓÆ›R¿®;Hô¨{*·²YÓÊeU}ëc}«¦Sô+é®î­‚<ªí{å¶'È¨ÙÍ2(T1ÅOŸ1ïïÞ ëŸ;oSò¨œöw>4r«Ãº_V•TÂ[3·‘Ú[†ïó2+ý–£‡ZöoMèÕ~fbrrD+“:)Í<cƒ£^](ÇÓ®Y~gjjçòj´{ùÐœ]ë€]ôRzðš’H—RË‘¿¯À‹yò¨\	—K¿Ñ—:ÿÜ{7wêu¬™ïZw¿ô5×¾Â²ê›[·?Ç_§/žým¤CJµÉèÎ($ÉÏIêgÕã¾a)Eçœ•å¤kKã#Ü¸å>Lò`[ß×·Õ	®¢5³5Æûu’ån0
'¡%G–…Ìëæ]I8†¾ÈŽóhT”JcPÂ©|1òf”Ž À@X=Ç
Y³†6p^ÒõïÔîÚÒ0ª†óÃ†	0=¢{îˆ4 µ{Ú¹#¶4JÒeû°¾ß_
£ÔÎ8MÐ‹ÏÒà<HƒxøìÙÑ?er!SüNâ˜œ-Ï’ßÌ˜ŸŽé¥fO
§µ0ôQnJ3u½&X¡/Ø!ÚqÍîZ–Øçùþ1Z@«”œ››öÒ·ºŒÔ0_¦çèWþypÜ°ý€; =¹•à)å5¡[o_uaõÝ>lãÊRözˆoínèô?ZÐìÞ?Þë÷ž÷^!N|ý^ŒÛiº¢‘Ýhòr8Çp±ÐäaàpÉNA¸JÏš1,ò�³(‹€Pp\Ô§€¯aHù´„¤oWµèÆÝÙÚ†ä6´¡õP•ä}ƒ:Ú‡MIO—û)1
Ú’KØ²¿TýÎ¬ÈÆÍ³‰HÉZ7gF×7nÛ~8ÅpaDó[ßUådûºæü0Oë˜Ûþ(%[—µæ·=K®‚t~ÃÇXD¶Jåç7‰)|Ðy1¿ÕçPŠ;
DË²Ú‚ñâ1°"]Ðø±(¥F-~Ïo›®ï™ß0]2$[å·ÍmxZ„x?‹R²aYËiÛm›Ñ—CÛ]²Wdy2¥®ø¦²«åu–ç_â†}jšï`ž½M\Á¾Å¥ðN*/ÃB««ˆ¨Â'NÔ¦1Tm(µðÞê	á@m†<9CY«å”*Á›r‚=´Ê”Œ«ª¿i‘èÛ™Ûˆñë¦~åt£(*I%P]_.Ÿ®‡’Uƒ#[Þök:ƒµ†q!—^tì¥y†´3“H°Ýpæ&+^RØ¥¬Óy›„1•˜P]i,æA§Ð3êZ”ïÀ«=!Û4X¹S®{üS·qCKp‰¤­~TÝìaÍ²ðè]ÇçAp²�.¦öKÜ¨^ÉŠ@â8ÙfÂF£MNµÁâø£Þ
{TÅýžÂ+ö÷7LÁ&z€‚¿@$Ä‘øM½Ul¯Á¬1‹øtX¿i.%Q1ƒ¾6úyÏ¸å?YYñRÝWô
z‚ò•Šîîõ_ôŽû=«†y�¯¶ª2Õêz…ú
ÿüË*
iËÿFW&>0Åý.Ë‰ÿµÍ¶ègS/½ayÞƒ8r‚6éøÕO>0´’²94Ì6¯#”HLÄ82Ú6{Ð¹¿æ¼@é*)ÒÐ0ÒÑÂì1ß‡µÞf÷ìj¹ì`Ù„h÷Æ|ÔiÑ{õ0íß–uê@
|y2Ó§¡ŒYã
ô«¦(­ãÐ¥å~³ÊÀ	PØú¶vÍ—ã“æê3®šßUSÃmý¾Ü;­h¥±ÛÈkí}£9Ä2§(§‹º|`W"Ú°¨Î}cµÑ¹šÆ {$W«-nIò‘öÆ°Zx—²—¨èÕ_¿~_áH”ü‡QNÍ«íÖrJv §3Cõ7ÃN,£ÆwÄJ‘Â…l‚K`žÒ!Ð
<ß ù…§äá…ñ+˜Î<M¿Q85_‚zcT,Þc£Ñ€²+}S22™OfEdÖÉàŒ^&¼ÑŠvÌ±Í-•h•fö:v
lm¸Ð¦Fvçã
;-n¸5èèñ nÆxÈk£ÅkÓ8òWÙòaËnÿº9˜JJqíXÇ6¨ñQIÁÑË†dó‡$ÇTßþU´O¡ŸæèÂaQ?¸ªÑ•¨#míFÊCÞhµø˜ëzý/�¢w™V×p¹Ûâµ}¬k­éŽ"a‘˜�%xDÍ¢Ô:å#«Ü“×Hžð¸xÝü(Âý"ÀƒAÝYŒšºØ)=6»iš‡ºÅ$"¼êçIê]PàöÙlðæ½ †~õfá¯“�OÓÁš«5š™—f�Â§aëßVÿ:YTôttþš­oU‘û¢–{âb­ê¨€ß÷”±@¤‡”êSÒ©‡tÎZ«ö²¦=Ñ1ÑÝò³¥ŽùãòÐU#<Ì˜&Ùía
$™À üe¬
F3îPæƒFqMž†"'ô ©pu:Ä¾“/Z™˜hÀÂÀÔ•@¡ÇkSŒ\áœÜ]»Û2Ü¨ÕÇ/t‹Ú-(T®óÄ8ßÅÄ’àäÉeˆy´:ô¿b!-½À¯’-ÖˆŒ`¯f$g¯âÀr)dÝ¼7ãÀ–¢8+!kD€êµáQŸZçqã=‡ÞÈã³k¬>üÓÍî§'û„R%¢Ä‘›“¨cÛý}L|
ŸªèvÆ«£Mdh¬	_¯GX×Êì]ã"Y¸€ãå7˜AzS}
3œƒÜékä˜†Ó`@âšpÅmÊySn.õ®ÁŒ5Mª)ŠäÇi2¡¾±7Øy`)ñ.î9vëƒžš,ÁUÐ'ÿˆ5<2q<¡“ÎÀfšàŽyz@q¼Ínè¥aÆèòq¨Òa?òˆF„¥a_`€T“6þ‡Þ c/Ë)øÈÃ—b0(uaÌã%ŠéÁ$Æ ¥!Ý2)õXXEzgá¤pÆOÂ3X¶­óá„ø(6~á¥xåLÀ¼/îS©On”þŒ¦iä oÞ
¡=¼�ù¹E˜™ÞÒ>P-˜hH®™Óó¾D¦J“‚ŽS�=½Rêûö	Ê8KÂüLäe`~‚—ý�>eSŒï6´NwQvå‘èç¼o6ÖA®s^¹Ni+îßX³„ýi°äø¨?°0ÚÅ¨°ÆN‚Á¡y›n†ÂÞÈ/7+®¿ÍJº>×Âìvø¶
Ï¯›b“–‹–aºW^)ìG¸|`b1
~T¼nã&1
5”ÕK'ÜM³™o¾1[5ìe¨®óiÔh9†3{a‘l6¡²éPcŠZÂ¥iY“dÕw6h2
Û2n6ðÐ
PèîqOÈ"QÑ¨±†È…ØÃE¢vúb/OXV¾áaÞ¬”áhsÇ˜$8ôü”Ä:|3œÎ’4ï�VyâNV'ˆ/ÙSV÷ªóSo°÷ë‹½ƒÞaïW˜ì¯¯öþE¾6’íš³4YFÈZva
øíÍÇirEbÉž8®¥a›Óõl@¯ÆÒ'q¤mLÓ$2žÄ‰c‡õA'££ïòü«è$5ÂÁ3‚�á”tº bw1ˆ$[«ÂŽç]¼‹Å‡€4cÑ1² žÙ$‰/‘È17È`hÛ¤D›(¹h6N‘Ý	~Ã†˜ò
³
!Šˆ1ò•ãNâdXàÝâH6D=‚ºÝ±:ã‹ÿž½H’‹(xÄÝÞ£Ýu£Pž/o³ñ*Ô'öÂr#¼ûn(ÄD£Åæ{‰^„NKŸÙ~ýÑ8˜z·–’íñ£g?îíL‚ áÁ×Ô¡ò»†s£¹þà¤wøbÍ)`Yxx\r‰³!JÐ
µuýŸƒö‹Þ‹ÁúO½õ­­ï[Àï	üóÑ{ZLçáe1tþ$9Pþø)¥vI>N¢®{X<ÑÀÎEÞ‡Z;›­-ö#¨ÜLLã¿WŽ¹û ‡f¡·ì Œº
("ÀB yxË„‰ä,\£Ë˜þi‹DDœ˜˜Ç}çÕÈ³ðcÅ4ÖoqÅAt¢k7b35OÙ:q,o„ÀÇdË|À$ÿðS[˜^	J‰3–óGìæxøÐa«œHh&„ R\çcœñDöEŽ?®¹¸FE&TÆÑâ3–=�.RLÌu÷ä¤û¯ƒöÎsÿ(M‰n¹$¹ŽaGÆ4p›¬ÉÊÃ?õô§b¸U–X§ª‰Ó†@¿ãdv>ã5’€×€Ñ¤ÁDì<[Ä¸T4}SÕå·Y8ÞÃÓƒg{'ËŒ÷'’÷I&ÜÙåedÛ[~@Â˜þñ Ø'M„5ûA¾ÆŽGÙ;¥@éýþ›ÞÕ$ŠÜ¸`|"›ÏGÛKCiB\ó¼œV•‹"B/jœyJYšÕ¼ô¬b*2;ë6{m9ýÖXÿKOü¥)7ÜË¤oæm|žæCÉÕàwnE$UÒ‰¿·È}ðºôÇøe
Éœ±Hõ³£4>ðWgçÁª*éüpÒèP)P7%q‰|Fz§
r²ˆSáÂüðx	EMÒò ÚP*ÌN¨•=T´ì6[®š”‹È
'!F×´Ýåöé©Õ‘»àÚÊâtoZä*Ö¶6Ç0¯,9ƒœÌ2gƒ`’4=Aizû—øë÷FK7gû®iž7ÞÀcý°ä Jü3†E.i¡œ%,6)^¥\ÎÀì
‘zšø Ê’AzM'¬¸¹ }¯s¿}yÙ1U=ÛlYi‹0Î*ÝŽ�«ž¢…${•…—€ª9édvm…©ºiŒ—’%çæàUÏ2¼ÈÙJõèìõ3®1©ã¾a®MS‹i¢ú)EüÈé(G*3>œŽ<ñ.Ì%M›Eª•…¡‚l.„
eÊ;¢”2UÜ#»Î€®ð<Ì#AþH!õŒA{¡�ˆ›ã"+õ·e.D¿_‡Ik!=v„QbTÐoÝ8¹¯LB@»¡'¦Å—Ë€ÐûsP¢»‡/øÁÙïm©]cy ?!·æ
1|‚Þm	ÇÁA3EÞ¦ÿ1­^{l¢¦Â¾T¢žra†Òq‚ZBsÿ¹ûcï*Õx\ØaDÐÆX5MÝ‰Ú(¡¡¼$ZÅäG“q˜rëãÔÜ~{ƒ^÷˜¢Úvê;>ÕÇÖ&ì©R�ãÜ—d}Ìš7+tù(¸ª2³Â*6Gµ�yé™4È¹YmWI5½\ù.Íä®bÈw)ºP€›C¹IUŒrŠ§2ž"X…Ð0E´€‡eYoE’Ë–ÂúZ\­ß®ÒõçÎ6E®¶*p%ùb «CäæÑ‡~1Bæ¿†ÂÓÐ­ÀgÐ%Çõì*ÌÇËÐÆ†iàMæ„¦AáØ¨¦ed!¬,:"kìÜ~èƒ*Ì†Ev½}F–ÁÎ”'A.o&üàE•ÒÁ[+¤®Ê%í¯æ*Ó›nú³ìpÓÂã cÝ`=ZÅh¯áþÄSÆCäh¸!
Ü(‚â¦Ðg‘y2(Qc £TÃ<LßÂí<ÖÓÀçŠË~†em6ÎÎÎo[-Ù/R¹i»ù÷Öâêkß«ªÄþ2u7ÖøXÚffcf­iŠÚdMvzzÒTPy£ai™‡ïèªæB—,¬fÊÀØ±ËO€ò ©SÑÍú:;Nf&ò&úF)~;G†ù#GmFcTzPyÖ@„7‡ô»¢ÄÃêúJ×MœÈGÕåjRJ€n¨+U—«iÈV tk?òçsŠÖ4èS¸¾l†nAvß:nR§R`´ºÏjbœu&qœ¬/
—j«lÁKQ!ÊÐXcyxš<›KE‹™SV6¦dºfÚÌÁ5]0B¢*eð¥ý¬*Mp)\Ø2.3û•È|Éþ¯LrnLƒx”³`Ú‹§7­ë»\2Sôy1ëŒ|Ã9ê*ŽáÛ¶Î9•›Ô\Ñ
Ñ]¿Àt„w‡@ÓX³Ô‹„ÛC
Ää¾Á_£d”;Ghn‘’žq…¤…òªò×NB@]=*<(•…AäËósS~.Ì:/ß¨aÁ‰÷�¨Pˆ…ÈñÅÐ9è„|œxÞù»PT›û HÂ1€DøðÂC'òƒ’qnxà¨6úÂŠùÊñ|ßB7'€¥"'«è£Óé8amâÅ{ÇÔX“)Öebõ«›[fcMî’
©v½)¬¤Á41nXƒ­#T*µ´ÊB_±P™e
l¼Å5&a—A +”†È“
–†HÍXãäs$\ÝÆ»A­¶jñ÷Äv9=þÊJ¹úÜ^S÷hÐ’¹_ÍÇkì5åÍ6ïSÒ¦¯ÄÖêâ%ñ|r"_<×½(z^rSOjÍÐñT²E"¹4i{¤óÂ:»P®Ó°÷WŽ¥ù‰3Å†œL–:{{mÍ¦ä“)óqÓíê
¶Òð@¬Ý�u›ŠûCñÉ�,é1-Ó²üÐÕ
B•‹‹ uäœ'})–’pòiÖ¡Þ®Ë04™4sÌÛéà3ÊÀ›NŒíºÈ%W¤bÔ_vOû:“×/ñ/1ysõÿ|Öî1æV…koâÙö‹ÆÞ¬ #íS/¦x”uë<Õ1êjŽÆ˜ô\m«•›¶Ô'(Ö&Ä6ûR¢ÜgšÓ(6—¯I’{‹4¹´W‡%qÄ¨N:É6zuaÎÙF3ÃÂ'Z9ÐW‹£Qk’ÄÀÌCC‰s
€Ê žÊŽ¡[ú¯Ñ3¯Æ-TezeÆÉIÛz¯ÑHYÝvÛp¥'•'˜cÖ6‚Ëz†$ÿ_pÐó4™ŠDÚzK‹Ü³*ÀÍØÈ\Ï«ÈÙ	h[Öv›— š÷Pƒ¶UÍcz[fŒË”ƒl¬Æ¼Ü‹3«Ê.Ó”~’|Ð&|	rFR{xw@Û˜XI2[œˆU§'?‡uRYÖ+¶†»Ôi�¬ •�+LùµÊ9…ð¨‹wwäž›ÆúÒ©÷¡“q•<óÒæGU½Ù:R†U—Z²mvx«H˜òV·ª\ïôv5~ÿ˜Že´{z‘…RßW!š;k·<~?™•[òÔH­W‚·B”ÄÕ³o,pÖóÄŠ[
ÔùÃ]"RC üwÀ£°åókv5)>šÀ´TÓ¶°Vst/x°n€*	ni®Ü×«Œõâ=¡ä-$yÓmò¦D/+·„{—aøØEÃØÚìßx+ÝÆF7ÒlÚüÀ{[dyx~-ÎÌ#ñºï7fý4™µ‡Q‘¶³©q/â#}Å›1cÇß¿‡£”Ûÿ?���ÿÿì½ÝVI¶0vßOªÕ_wÑCP€ÑBH¢ˆhzŽu´š„LªRTUÖÉÌbî|m¯eûÊ7Ç~ßùÚâðyï½#"3~3³R«Ï7¹fÔTfüÇŽýû…Êb‡OVõü„7­üRQ~I/¬Ìj¤á[¡¡“Îy0GÁ§Îug¥L¯‡™ö0F6†oèÜtÐÑ˜

:ïž,~¼/O¤–ÛÎ•)R.Ýy”_GÑX_×Ñ9&à<ï¬ÈÄˆçV†D#¿äSWâÝÁ²•gàN‚JÉ	e†Áœ‚H9²(¢už‘šÃìua°ldb
¤ÌíHÃQJo™:ÔÑó>¿EŠe.OónŽÚºÖX&5y}Ékón6K¸¢•¯N½¢õ'a‘•£SYàIgÙÌ˜©&j%ØV’A^ ·«‘eÛÚÁ¿‘ÐÆmoåÎÎŽj§x´3¦Þ.üÄÞí¿ÙÚaÛ»Ç¯·¡ƒµ÷·Žöà¯9öÓÂ]ÅÑƒñXG3žÄ´À±,¬)¹i—{x¶eÚàhèŽÌÁ/ƒÅ(rhšàç<¿ÚyÅ´¯ËvÆW£Þ5ìà?rXxa& ™Åý„²šâ°ÄÏÇx6jP®+…6ê›È9FlØ¢µa‰ºí
VìÃ;ªÉPzãŽ(}ÍÂXüyËsLnóÔûEê@#û^ºÏÙC[¬8l#‘UUÏªD<Y4Š)Gñ0
0þ�Oø^1T‘åPêƒl(,ßÛG;/æÙË€nÓ=Ú}¹ptø’,äºsÂ¼=ŒyrÄ+ÕeˆF&êr ¯Ù²eûÑƒ8(=ybÂ �¹7ÏD!üu£fê]%í
§Ÿ9ØR\À-•,ÃÅ4Í’´C>?QZú¡`Tu©G4YÒjÓ^ÏÀÒÒ”ÝeDÖí›½Ë^Q}Ú”D—­¹ÍîVoÏ™¸øä4ècÞh:òP�_âX½L–'“#à@¦%œ_È±ódòå;..¦¸×k„W_Á)îíe”b\£(Ûì*±~Ë‡kÑ;ÖrŸ-+æhu<žLsb¥¼ƒ-¶ìq¸áÙW»¬üƒ8£±£LpqMò
ÍdãÇ�wÙ~š'‡©É0ˆ]•˜œ b×¬åÎ)spåBßc©�eaãç­â.Ž®J6&r@÷ñFJØs¢O›®1\Ó¹lVld$^hÔQ°þl‚›bM“zÍ0Ó”I>eJrz…*¨N¦ÀÈµž7`Žö»ÝîÓlÒAv\$CAšf¤²Ä|Ô^& 	óÁ¼ßAë°`ì‡ü}Oþƒ:oÂƒxÍ5|}ÛLÙÅÇ]0rÄg§QÊéî:ód#v¼Ç‘ãM>ÆËl«$kuÅø½•¹;öz{Ž‡Ë´-É«&ìÉ9Çƒ¼€Ëd]%„~ôƒO#²ÀŸÚl5ìû\ý±ÐTf?ï,ñ]ÆëXb=8KR¾C1
%+ªŠÎ•ê,‡k=Ý ôŠ®98§êÜYW¢{þÅƒ¾à["ÏáÚ_÷aÐ™NâÏÞ“x¥QÎ~�>{ì³ä¢É‘J:¥¹‘µ‚ðq¥hxÚz6‰‡ñ€ˆ©!ÏŠ]¹´RHðLí ‡Ó+´”ÓR%¶æÄ,Jºr‘[sB~€\‚€…ÕL…¶k1&h¯‰¥–->-qŸ¤( ÍZâ–(ù³WÞB–ÿSäZÚÿüÿåÿ˜ÈÓdÜ&$Äâš#—8ýì?/RXH¥®ƒ`fä˜WBÕ{™_ ¡F¬è’¤3÷I&È¼ŠFS4ßA
ÓtA©+¥·2Gß:hp|ØÚ'k×´=³wì)ü%ã“éù(Îªxí�K}ÆccõP×r„†Š6±ll²xÄ•Ð•,64Ñ®À¾O€Q›|y¯ÓhT¥(–ÚÎRýâSºØƒ’“]èœ�èÒ}Ts{¶“‹+ç¹>ˆòré`Õ§ÒÃ	:Ga£¿Bœ‰ŠÁÝÆŽ¸9¶\‚Ï&÷žé?e¢†RÕB
4+ŽÙ×ó“ÁO	ÏIÖuÈ=øpï²ø—ök†[€pš[ÍŽ¿ëà’ÜëêUY5PÍ”ÁÐ®:.ÚdîÖí™º]MÔ\ßß>rî,¼AÀZ¸XÕ½;»smð-Vs˜ó²uÌ£¡Cñ…drNÑRœà£.%H=:ëBÇù:SÿìU…¨Är=:/Ól=™æä~‚º:X~'Xú¶D½ ¢ý()î£-Ø!ë­«¨áiqEV`AV˜uýD+#°á(äëCä@Y©ò¥¶(žð¯µC‹�Ø›¥òÆ¹îep(*9á8k•GMßÙf'í%a·ûc!'ãøÕTF|¶¸” âŠ2RìD†4zMqÀ-rìÁ'x·æœ›Bµ×ÔË‘eåJ¤ Ó.ÄÙ÷ÞO¤Ý‹,-.Ú¼ä=Ûi]`q‰hiEc¨tåÏ=tžnw(•\‰þ=Ób
°ý�‚…ò±¡®}¥ýˆ½aUì>=×¥
}q]¬x™šf—*ø§Ê“´ðq^ñcÌx—íe*ƒÈ¬8Y,BšpEéÙ(9l†Ê†ñPR¼zQ*1y#ºP
ÎDš±/aøŠX1üusYÍÒ¹ÚG�Ck3üéa2­—?{ž;FÙ’{moÕü5¥sŠS)Ú‚…”©r\vf91ÿ„R�¢‚¤yDKN”G€P
ýEn…¦Vög7Ýç¯Ð
VGù!°Äòª‡ŽáC&Öo9ÚNþ}/t+£ði¤Ú/–Gæ‰ÙU?uçÓ›á#½‘h,mªïÕ³áC¦Q¼˜fX5*¾³2å‘•Ù¨}>§å6j8¥Õ&C©ø$Ü'Òû»¼5XµÒCMM—»§“Ë<y:VÎÅô*;;ÆŠ@¿¿UçZãöë`d¨…Sôu£X‘t	GÐiÝÍÙN±®Q”žrjc†ûÔYy["½oÅh«»®Þ˜“(6uäíË%9P/‚án–•`E(Y‡2žÂƒÎzéMb?".B�¤²ð©³Ûkž‘©ª’ƒß*Þ<=üM&è©€«‹·ÂØþ€
‚!_1þµjSðqºâ9y6÷<×£ÙžQzèe åî�MôL;xcòoã“2m²Èô£—9Åš‹,Í õÕ$ñWÆ”úÆ×W>TvÆö“ÑVMSwÕpazý›mC¦”Êº~Jè¹±ñÝ—àó”äô¶ÕzÖéØrÑq„¨+ žíuÉú±Nçé¯ïï@ãpøY§cíãoÔA]E7·Hïî$?@?üñÅ‘è°×H`ÖñAjöD¬½l×|Sb6<ôwŒ§‚>žPí$Ëá;yRÚÌÍnžìcøH„³o¸·Óš»s³ìbZµ‹5çÔ×ðºsºëºïªDÍ™®‡ðFE³IDåœ*ôiœ£Ï0©îÒ‹?Û Œ(ÞHZÐr1v;¯Xç¤_FU ¸“eAt ÐJò0%ç1ºò¦Ã©[T¨­›šòµâµOÄ­Õ>Km×ê¢ŸýÖ¬k5ŸHXF1`©»êÎQxÁ/\fðnÚSJáù<N/†…€¾d_Y–¦¹Hì>NÆ#yÁg“µÑ™"z£˜*„Ê2œ·"XÒÐ-Ëi½hÉš~éè"ZcÇGÑxª@cqÕ®òøòŠûõù°àGm/nL0ó]ª[+ï¼øª¼q²¤ßQhI¿æ-—ÿŠÈy7ä)ëQPQâ6ß1ò#7â}ð†%àóð¹5Î•§±8GI†sÎ6U	—»ÚºwÜoÈ!ºë! cZ!ÐYB†¬Ñ+J…UÄ&+µ†Þ*êIÅBaŸŒ¨LU¸çÔ`»ýÛ¡#yÙ6#�aßA™!¦ø£ÂŒg")NÏ�EFÀÈÙ¡	£BmÜ®Ôš}aPÃ`K@ÁT]U¡ ?yãŒœÞ,ôLËj÷Ü'�3Ñ�z‹Ò
ÊL€1©€$âuŠ×­{G[û¤=9=BÒñ2
Q¼…aÍ?þ]ÀþI1ðk
BýEo¡œšñè”J­O‡õŸXX”þš`ôvÂØ2ƒ_†zÁa©Ô'Î�KeßÿÂ°ä[wn5!œßùQøcÇ×;fü•oÆ…£0cs…\?uÙ~Þ£áLùÚë€ÈáÕ]`eä
<î{ŠÜD†>-Jãg¡;44qs¼ò]Ò×__Ä«œûzÝU²;s¸÷ÝÿÞp?çòZñªÅÁÂ_çB]�¹Ãüçü¯ÿÓ¬Z„?êNz¯°¾<$c2¼¦àÆì‡ÒÕÏkPýpWÑÍ}üð9vpÜŽ¢àZÙ@øÝô¶aKÌV€—ABIqcÑ,:úÐ’tÄu ôxÝ\åMlÓ6+½ýÊ—1Ò˜
ST./é®‚äñÿ}æ^¢lO]Ú¤ùX¦ò-8Ï’áN>"# €y2é,-ôX§4¸º¡¿ZÃ|É¯é<žø†ãUçÐW?Ó'UB=>•l�>‚ãi0¤]á›Bw²3\»/s`´Ñvë(¼Znð´´Ê³Öú'é`g†hÙ8IÑýF5ç«³}°8šRçZmã°¢þ2ãªéŒ[˜S›îQž¹9-œªè‰Ý8mÈùŠ •¸æðîâùV«Lº¤Õ¸ßV¼Bã“YëÇRa}ÍŸ“iÐ¹Œ,§ÙÑÑ![Zúo›÷;‹
mÆ-—>Êf”±-©,¦ôœÀ¡°q¨\È=Ü)ºœØ$ø\ùï;üÓª¸©Ä=ó\à]ÀyòÉºô=
%jÙã©
a|ÇßRÊº%.Í{‘‰†V\%bØq8%Ð7p8óœÃIþí£&î>Ô‚íòƒ,@lj‹eü5QÛÑ§„O^êgÍüo“Pqžý¿ÿûÿñÿýßÿs%XÑ'éô
èýD8ÙZÎ
Æ¥]é*@ÏŠŠœmÃœ"»ˆ`Örd_Å=õy_yÝ½»eëvÄqÁjíQŽÂ‘ð‚®äj QØ!XÄ$äåå<[OV4Õ:l·(ð@n³fÞZå±Oh”Ö½:ÏjŸ-d¥ý;8”q}dcKVDŽæ.­O†ÓL±„öqò§”:Š¶ªêÌä;›Pœ´­™Ž‘@?UX~x}37Ú
ýDW_ÙÖõ¶KDE)§åìÅË¸ÎpõUª ¨ŠCž~r_q
ÐÞõª¤6þ”é”4Šo)»vÕhÝrñ¹Z®ÁG%Î¨ôB	>&QY˜¹âQWÙ&ñ ±ÞÔLO<W[\’êÊWUÙˆáã¹¡âh¿àk¼=—RåS£JžQêÒÑ¬-kuŒK¹e+ÜQ)„TÛƒHñ©`Šé³ƒìWÝ

(ŸzJ(ÃÐð½ˆ¶�Â8ÃTÝá†‰®…ÙÍÓ
¶TÝ‚¸]áÂcÒ“³^•
À!âFA$T (È)}EÄ-¿.¢IvlÐ¡MÖ¬ZØj,ñô4
²AOâ5/!Å½4¶,Q%	W~¬V.W¸¡¸„(B5{´†÷¦B•JCþð|«•+]¡Ef#6¯ž,@ÿ$4†²™Ösëá¾$i¦œÄç‹x,ÙäãëPƒoù4ñ\Á_õ4†ý_žgÃãRdõ5�ý¡x¥ýÄc·!ŸÂòW‚eJ)ýÕA™;ý™ÈC™MæŸDâ:XUJvß'×Ù–ÜZ	Ÿ†V/ï¬Ù&Ûq¥ZD©
Ç={@î™Br7Êíô‘²41†”ª-Zv„gpRp™fÞ`.”½×Ûè/`mª[~¨ÞšŒbRÙ[cNï]ï}1Ay¢XÀ4ž©³Münl-k¯…ˆÝõÛI®Ç¤õ?ÚyÑhm¬cðtM[Ê7OÊ\ò­RÉ“pj+Ëâþxw4&7Qtš÷”2K
UŽÄ÷½2½ŸðÒækÌÀ½©&9SNŒš¯†D6ŽÞêâOéÎïÈ"é^CK¬ùH¾/½¿µâlk˜FAxÃ'KYˆÚ²N7/ä\2$p²µ7«5;Ï¦HpuEaEÞ+|Î¾¿-Â}úøý'ÞþPX7º%â>@÷·Ëì,XIŠN×˜b1CÇ±ª��MÂ3HÔV’aà ,¡6dÓ‹þN_OÇŠñÜs
õ½¶qv±nÌïA³v[sê;jL¦Ù@)í4ç@2™åþÖ5‹;upÄì@"�G×F‹^±e™T¯]¬Ãû¼ñÍ\W+ëp{7§:×ªŸßÁ,}8†²œ˜B×èUýi§ç¬I	5Í¢³A•GK&€ÊÊ¬fL¤J¢é¨H‹4æÞÎÆÁ$$9@:ð-³°Q‚Gð¨ˆòÒ(%?T%Npæ'3“tÑ­´´3¦Èöî‹ä î,]Ç¤\”èçúløÇb;çél‚î.ã! ;µ1Õ†ƒÇ ˜ªD"s¿|Æ	zC×”±ô*Š&,Dð˜(+}Yœ?7?•àç¤¨v’——³’ÐËæÌOyâüð•ÀÁâ‘2„¯nÚº( §Œ´Šz¨oB?Ôò‚D«º”Ó)#( Pò6˜`h/Ô…€âëi9J#K±žïµÄƒjJ>�‚@Æ¸z¸¼|Ëe^¾F'
ËËF¸}D£Vq{-Fïc2“´<~Ñ:;Ž‚‹¼ûøåÝ”X¾8A¾DeÂtŠX»Ù_Ùñ³u/¦i
µNI€„þÕéÁ>uÀ“~hÍ | w‡'C6‰	B8äà—Ö¶!ºvá?#} “^n0½6½U«jU�î®“4´k‰¾ŠçAÃ—™Õøk½Òwò,ŠÍ“Ó!'“ë(}Ôa3øá¨÷sLìÛ¬t,„p+!íÞq»�Òi’còQð5IlŠp
2Ú,'Ö¹2]-NB.LqGÈ[}£ó;òÙärŸN3ÌÒà=F�
®�òUv¤¢lLˆ‰¾‰â`\Ú~4ŽR‘¨7‘|±P˜?0JHŠµäb[^[4Š©[áL'»Ôæ†g5TªT(qhë_ZîÔ[Ñ¥h8H‰Ü^ø·ì/ýyŒt¥wv÷/°°W˜³¦‚ÐèÌÇ¦C“ÏSà*Ç˜1áÞ˜j½…¿Åù€†�Ð‘Ø°’ˆÓ|0ïpùRî²ESÊˆ5+ÇÑÅŸ¶T‰0*–Ã½H
Ü› œW¥aô	¡
R.Óà_ú´3XÍdº``C•%÷eÝ³õú+âèfY³ çôýÝâ{¥HÙ¦²¤ˆ‡ÊŸS”¿õ¡”ï	j×kv‰Bå	âDH�ÞýàâNVaœ'@FÈ7“	»ÆØìSà*à
ëà¦h-M0£¶c›Ç`¨¢GŠþ8„7(PY•–ÉLŸI‹ý²
‡Ðp+_geä«ò³hFo¯à~ñq@rm6ÿÛRª^±û“~?
ßrH&¡Tœ§]²’‡~žsŠ†µÚeEË$ùáF�ƒÃ"~Kõï�Õ¿c³0<JðÌ)D|y£¶eù­«©Æ¢`�{"f*kwqUâ ¢&3!0†í9O róÌ1+jY�5vW²˜œÄÌ²mIÈ‹„®r;IjìO--RToðŸjÊjá¨©WÅõá%/Ð·‘/
 À…d"¨Hgœä¨˜„£jëÅ7@9Ö-j^ˆ*è‚Ä±°OË(Œ‹`/@_ÄitŽšÒçbâµ—ñŒ®‚u6ÈóI¶¾° ×æRÔéö“¤¿©-Ùrè_gŒûÍª³¸üøÉÏOV×ž,àÄË´X@5Ñó/ƒ‡ÁpÊŠaý¨ûÇnË¡õ�à]Á<I:#ØÚúEYžÕ¬¥÷QœCàŠÑÇã<(Ò4¤Å²–üÉEr�gÒaiád,‚œ^Õ
ºÄ¡®Ñbíþ ÇaŠq‰z£‚›Bœõ$}¨^�`²(³Ç“¤ŒÔ™||¯7 ˆl1£ã{¯-»Ž‚«ŽÂÛš£UY·\lðêÁ Ë^ŠÙ¼œÂ4Öõ?C4R*¸ç èk†¼M‡�*TÉ†«_«%å¤öQXRsÔóm”§þ8ŠGçÓ4‹xÂ?^lRÚÊÏDF…JIP'rQ’¬MTk�¢Ô^Ü2ÚgLÇW@“K3UüxHœ‰V§(/eè¢`ž¨Ÿ¤7ë†`$ß«¢‘¬ŒØÚuyñ¬WäÇ–¥µØ—zYÕÐÖÑO]DðuoÔ_/à¤%1/¥ÌºÓ1ðt@9Æ$yÒYZ]]éõVà?Ç?÷Ÿ/_^®­®]n^o ·§lÕ½Óàë(£‡Wñ!DåÁhbó<’¥1Î&•<M*Á"s#÷\�T]} pe<O%‚AçÈòµÈæ÷Ã”B<*=±mÞŠyBKñFeÿ]	w<ÄÙ‡)bm¸èUeAŠ1•Š|[½ñÅYÍ¡†“U%(Ýu‹«¼ù„yì¾xã€ÄÖ‹xŒÛDÝ�;¨œ™7NKkkç`ïð÷7¿î—MùÙÖ;y}*"Kí¤/±ÂØñÕ+X»fš¥^©Y2Ø3Ï]&7ƒ­ð#®Ç·‰ÌÄà¾
t6jâò–‰•ø[Bú’8ã¢Üg1Ä¯Ç¯ƒìX÷*d!ºv£‹+^ßÄ²N3Lq;9„á¬ëµùâs¨b/SÎ!žË¦1>Ëÿ`ˆÄFûQðñ›Az3§°›–V~àG®µ÷?ìcÏZÏßžîµ4t#—/‚k8 É±È·ãY°Ï}ðÃ¬XèNQP—+Š;­[É‹µêÒ·¹ä`ÉR•—•`°)A¡U³øRU¦ï¬,ÞÛU
y@ÆŽkÅ—ša8+‹÷UU«ÆMµÜUïš¡ù!žÍc)ÏËþÉŸ•Hþû[p ~pïï žD9– =nLÊÂçÓÃj#Q8s¹.c“x;Šÿ.ô¼iÞ—ÎŠô·Î37¿
þ°\sœñÎVË¦y§ñèþ\"|'|þB¬²z‰ÚŒƒÜ‰†°Ýû
à•T!..áj@—'±a0E/
›¯–m·…úÑ1ÁÇ€ÒúN«CŠ´uJÁ8oª—2úÁƒr¿dž‘¦ç?aqy÷=ÛÞ…1MáÑÃ]+÷f¼V.lü‹YgEdÖthê¼wÏï†*àÍ[ øž_) áÔSƒlÃ¨Ï¸>
ÿ$+j/?’ ìôþÈðJ<‰ÿNÁŽDNú~,>S7P¦­š)KkµÎüæ
ÙãÍÀ«¸?XgËóì 
ãéhõæÙ~r½Î–äÕ€èƒ¨uYoëèèøÍ_ww¨îÑîáÎÞáKª¯OvODýïJ%ó@1…÷]r»Ì³sÍ”šR´À§íŽåx5=šhOU>¶µ‰½;ïÊßïEò“ŽY$0‹8ÔžAñ¥pIY%ÿ¥AýèŸÍNaÛrØÈý8Ï®Ñb"Få„n»)ã÷h«‰¨

G
3HÓUnir7ÏÞ‰M˜g|Rï8{
1#*tAagpâ~3D>ï›Ñ"‡wÏY<†—?’µÓ�>ƒòl•mÌ}§Ü‘M qÝi‚Å7X[áò¬D8B\N®ÍãVªàHÝ½J¦Œ«¿ààñì_eƒ‡€TøG¥1h{®DÕðyl/ƒCó´l¾Üä¢º‘m`->8ØÞ¥9kåyËE«ól‘ÿoN?"Åš°gJý>G—m…bÁ|÷Ñt\¢Œ2§líSÆoêä
ÍwDçw//£‹Ü¦c`ØPÃxmMó,V2Æ?aqOŸ°M—ë’"×`^þ²<*1R:ƒRÒŠ€ªt¹õO‘å¶R(kÇÙ‘8»t‘ª\½ã£´]ÜV^½»+ÕÞØWT+ïêë*x/ùk*‚,¥ÿ‚5)\„5®0	Æ¦CkúêV ‘‰bz`2ýòÚú)ÈŸÏì»ëÒxT…jÀÀØc3
—ã–[ÖÖÊ¡ACåõ·QzÝéÕ£Vq¹Šqã‚š-Ú¯ZÌ*êØŸÍò-ÉüÂÛÕyaW€<–«�IåŽ÷u@å¬B)IÞ`A¶À^'£8¡(ó•m0SOMêgG”fo1PiUª’ÆçÊÛu¸UÔc¿bÅªâv§®Óß³TtÄGF˜îåÞËÓê¢ë¢¨Tt« në¥Yù¸*	¢†]æN;ÉMLIøó@%Z›2c!¨]äˆXPÿJ÷^P1›c=f*·Û‚©á?~ˆ¤´R‚!¤Æ[ŠMýJ}¶\yg
BB(+èkÒw®IFe]™$‰SUšÃÜ†ÊÏGê`]ßøPŸRaTëœHÁÀ¨Õ‚Œñ¿öB{¤¶ƒ¢h¡ÂÚ§0ØRl{ÞIœ7»0;Íkû£×Ñ“ÙYwîø ›è¬E¢9#Vé|
”O;d“¹r6Ù/dÅôÄ	¢‰LUMàÞLQ—¬H»°ÖwU'Ëá'ªÁ÷¡ð«{Õt_yŠ$¸ëßUk/ÒðUa<NÆ…ÙY=BWo¡\mqÎPu"Â}áNJœwU¬¯”¦eÃÖvW¯ôýVù¾+là(`ÿâ§£8šx@Êëê1­@©C÷f6ä�ÉßIé±1ëtÂ†Øßí°’ñð­”Çê€8,^éƒû*åÑé„Ž„òÒð<±$–R÷Qr Éøy2Ät‚ &Ÿï´§/âh(4%Ï¤¡%¤¨‚d¶C4¨Ô	�ìè„-–TVzG’øöM»U(LÖÈj£5'ëœoü;dmÚtJér¡ÒDÝLÔîj§S¥Í§#3ÜÕOE”,§!ì�k§ »pß;0„¥£"EŽHÈ-ÃnP”½èïAL'¨>ö¢ÐÀ£i7Îv­�š;!Npã1oÐeG+ ]³¶Ò³^dëâ¯—›,R©=@CÎ<
b¨Gc}‡šËjpÐ53ŠÈg¶¥\ófK¤œ½W’RÐgM¹‘ëÈÌÈƒËÁ{h•ÜÚØ€ÕfA(VGÜëxŸ¶ÜëxŸ–Ìuœ½;ÏÑ,Õ„3žÏrÅëpFÙÅ«Y²îsîa
fÑŸfE1¦	\RK{æàŸši(†³NB·É©ž‚Úgn˜­>Ý¸Ì:pã¬zäêÍ oèæ!©ôVFªóÚAS9î©Z-ÌS©Ù¨db¦Á Š²åÀŠp›µƒ+;¢æ­Ðy·`¥X‡å¯¹ÆSÙ.ÓíÎçÉ¿ÿÞ”QzñL„ûË‰¿šOd'¹hÂ
)TaÅ›zžPüüí¡jŠ1ãFfÕ³Ð:ú3&tM$
,Ããè:,çs©¨’Ñ1+ap'†µO‰ôÛö‡aéw¢ó¼üA)s¾añ®Ë¢_B,Ù¾$Z4Y‡u•JÏJV¾¨)Lºkj«ÌM¼+h2Å*
N~S
/¨Ðo^±–tób³Q”½ñÇ$nÄRˆ’å°bQµn\²‹ÙFé®
†äí>VÊŠŠu+»Ø®s¶á ÿ	ŒÓ^•*ÆI„QÌ ×jÒ¾ULNÜ7dŽËÂ»#hÀóÈ¢³-÷i]5+–c¥º!QË³
æy‚ân€±¸Œ‡·_¯¥îý…ö¥vßQä%^¦Œ6Gç_k†Š¼[|?,ìD“ü$ÊóxÜŸ•£Iæ¸µ²zšbÖ˜mŽ)�I#µ‘,ª
v¢r½L'
VŽîÜUýlçëL¨Sý…sìe°²Ò¾ÅR]¨·*ºÝ·ò]ÜV{¿÷Ósnåq7à¨Ø~Ò×H«x×Œ¬ÊÂ÷%©ólâ¼½´¸¨‘WjÃ°M�Š=GóÏ¾XµÌ“‡‹½ˆ
BÍ°¾Ê^¨ç£Pæ�&…ŒâµaRÉ+¥ùüDYšÛ:;‚SL§:®/Sê1ë.ß.·N¦hHæ¾ˆV]O°<[Wêd§á–EÃi:•‘]æÙ(…‚SŒu8ž§$ód²	°ˆ×HWSÍ}XNqˆ¾ú-Ì“`}$gm °ëÆiPVD_K`´Jô[\ñìE	`x`“Ñ›Ô[Ä!a[ed¼éŠÁ7�#Ñ)›½ ’VLÏ¥ÿsf¢o«Dô	65‹*Jdƒ(œ]aŸE	·ìhÕÃË›¥”KxìŒ4-
™l´UÀbhí~ÿ7…ƒóÒqŒÝ¾Åˆ¹í|Ð¸[Ç¢Ã›<®‚Ë¸f (ú¿rß9×wÁËTÍ„Gñ°ßWTA¤Û¹2ý”Ôa
‡þ#nÏÜé?=ˆò�V±¨Ø©›èjF\y�H/&Ã€ðe?È2!g‚ð:rÌ8Š†ñ€bJL0L,þ—ð& Ô<"—‹ Îýøò|8ýCñe
ªÂrbÆ9ã‚1f€Ý<ˆÝØóÁÁ„b2Ó}S>ZÐ�AA¯0ú* G…NbÞð>À‚ ™¨`G£ÿÞ‹ä~÷ÜþÚÃÿyˆð¾¨£)q© Ž÷�šºq/¨(b<îû ¼	¯5JÎQ¾ägw›g—h(!ìË9¼h7J~ 1&îÛûV3÷YSk‡²û?O¦Mè¾è¡˜³ë#ºuÈ_Ïñ1Æ“N?ø`¬Úê÷¿(?T~¼ŒÇnp1h·¹ùOE8
Nû™kKµŸBYKTÊ™u†AÒt¤¨ï1eq(nJ\ÉˆÁù¥¼¼u~6.E]E´KGW~{èî_£¹>)—X®ÏêÝs½€‹v~Ð¯2\%=p7èÑ=M
í\'¡áu}+´¬®¥¦ÓùYQ#úÖ¸PÛ¹¾sšsÄºNÊ½¥ÎÉ@RãüJg¦øBÞ
†®cÎÒ~X¶sŠ�_šÑ¡¹2ˆC%‚ »!Ö.îˆ0¬*\ÉÃIž|1GÞYã¤@é³ŽûßUÙØ©&v?üÀbýÊ_=æDd�ŸkDÅmª?pÔæõ”ÕK	7Ï(ì^L³<íñÍ»°nd@â¸´,‹z­v’ì× øåø”;¥™†¦\[ÝgT
 X+§¨TQ»¦ZÓ¶jÂWêæè7|…
—øp$½r¸§–¥73½²JûÙaÒoŸ ‰!7Åð
èD_tß”îX±£Ù|YNÚqÖívÏ#aŒíÙ^˜‰;¹´Î¶>0È1¥°*vVölïðùïßß–nëwðë È]`|“´M&#X£ŸØ…öœ»;ûÅè¤2(§}¡Ëb-ü·|\ÎC°”9ÚúÀÏynßø"j(’ËçÎXÔ»†KL[4ãêîìnŸ~ùåÕî¿Ù•åS€Ó³…Æ˜q~c&7k‘[Ê‰Äóx@-Ö°uBjNëýÙ¶t³G'õxÌUå!$""?bÞ}G¦9¦¹ÁÎƒt*Ã
$°ÓÀ}dÝ3m8†›„Ë3Ÿ?†Iþ`aò°EñLÇ|}}•D)Š+)²àP'´ó&©›gæg
ŒÍ3tŠWQ6‰.;ÃpŸµñ2‚þ."Œh‰gìèø3jýÜ{ÜY\\BG‘Â
IìÅ—|ø?‡d[ôÓE>¤ëÆa ›fcz'késÑcó–Â`Š]X½pW†ld·_w×D=í¦B%;-u…‰âè«h/5À’Þ¶¶Ò˜ÔÛ¢‘arSËC™Ó,ëù“>8?5¯c¨b1Ö­•(!|®‹±mÛ6¥ÖèòÉôxïSÞˆÜ&¡¹JíÂioI5ènŽVï8º´×L%Ã0:Ïm~ž=cáúÌ8Ðòh4Ïú™yâïä,—çU„‹yä¡‹–lDÚÖ $‹Ãˆ"@#(cÁKkì(ê#2o!®ß}¢ð¸Â¡ë¡Ë…£˜þë=À0‚Ã¤“LÖå@
Nöb a4±æÃC2¤<¼wùùÎôºá‡dQ°Ú,®"ôº–lªˆÀ^¾ìô/®-­ðè-­v)·øO—PÍÑ)è
›7´S0Úƒé ‚ý+Ðñµü™ØJe©]ˆ
f·ÔeÜ#bÆÉÎEaHŸwGDGD1ø
ˆP½RPm!¡mÂ¿po8ÅèQ¶ íR ©š˜¢ÖsB©¼šÊCñšo1ß YÓæ¤h±ª¾†G?tÃCRÙ…ª‡-Ðès›ÏE‰þ<ÂX7€Ÿà�ŒÙ%ãñtÔ¨ä‡`4mTð<ãAknÎ‹E©ÔíóˆLZ©=“œÆ«-2rã$p|7Ž’i¦Aà÷·ÐP;öŽÿ)÷õî½%ÜØòV]`&ƒë¥žl§KÕ`²Q	iZøGÆ\¾%2‡ÄX´äaâ³p|¸r‘Õu1=,5FNAñå™ïuÙsÂgºdcÞub$Ö.ŽÁ²†ÊÍiŸ„OÌ ò;;}5Ã�òD¦]1Æ"“)Ôã7±2"OÈöä¨ÜRšÓ¦õ}‡·a}ß‘nX½8èvJñ[o9ˆµÎÒŠ­„Õ¢QE.sÖµ¯8¡Ãƒ`Üe
LÃ³Lã1u"œœ%yFÔ†ZÇ‚3Û¡Ð	kŒ=²sk7�@jîspHðâmø€q†&*�’/\C ¤.•Ýûåú[Ã©xò$†G©g@,œ^Dív6Í³	WrNGì/Ì+QÇÊ&ÇÑõ	÷BÝPš?Êy	8Ú¡iko=Í•’l‘8>ÝÛÚ'/ô·‡TÌìK'¶i4	bJñC¨ûû[¥?Ac+{÷~Çê":Íé‡$âìÜƒ›ržN‹µÙÊ(yd×Í1•:2þm±âÆ½`Cjov´Lá· 4”Éµi8�YÄM‚úgdÏÁØcÒ˜èpþ¹Ì‡8Å`²!òßzIS‚R{;Æã+b98ôÑ èQ†ÄeÞê|=åmFE÷5n
q5ri€Ïeùh_v‡ÔÂGz—¨	âòòœQJ+Æ	÷$636â¦6³5â&7³µQJ:ß€âTk{åa>ŒB×qÙàÂ§é9”[—N„§n:`{Ky]€€ýÑã,o·zD‡Z~'®£îpì§Ñµ€=n}¤€ˆÖ©…/Šº¦ãA’\¹p‡‰,¡ùUgüþAIš±q™¯@€,KXô1 Hˆ·”Í9�>'H3òEH™P•¡~ë�uj|‘Y­”#¬À~Ó1ßkÅ¸¨%e½‰SÛ3Á|tˆ‘1Ÿ”7DÖéV¶ÊÁ?*«Ë�6|§-%÷¶Y#JIßÅhß\­~´÷ötëðeË×¶¬Q¤íÆåRâ¹˜tËØÕAÐ®¯^‹—•µU…Y±†UZ3k‹õQÁ=/·~µ•¯%–U×:+–E”zsnE´.špäÁÍ6s‹ÕøþÖÓÄvÐäyQBçb­f`B³9u2Þçˆ~pû¾áé¶Mè
“É„JÂ/4¶Íÿ§´}‹yEblsCïm“ñë`à!Â66ú[ê.-Í!w8™8ÁHl°³#“ŽŽßüÚùþAN¿A‚t—8Xõš+ózÝl¤®ÝyLwÐ¾.×YÉhkIU	Âõrh:5“®éß‹ƒ·NçFÿ(‚øË3m|ä8þ1:…m]áy`âd»EÓæf\gNyÎôŠ2ùºgz‰píPÔ‰Ì
aÂMÖŽ³Ãà°-åæL9–—öµƒÏz›Ùn
ÐÄÞÉ‘gN„¬üñôGYiv¥4TYOŸk‘ŒD«ÆJ¨ÖgÇÑU0*éì”R=
~ïz×[¸Ü¥”(Ù%·S£ˆ0šKIG—Y§æ|Ïƒ&Ÿ´˜ÜmÛÞBš çÅèÏÄ*|ÕÙ_Ø’9ÇJÎ\»€Y)‹ rÄ \ª¦&Qz«A	<ònùË[A¯óÒê8Ã­Èó]l/“Ëè_¤Ú‰Ïƒ›€Bú5gæíE‚¶·ƒÖþÛÃ­RÕlïî¿=`Û[ÿºuìlµi™§§;ëÔ¯³wÆ1+U	ú=‚l½°Ra T"gù§!døoÔI«\I¾¶8Î¨*Ú¾{o0ÄgA Î*Æ¼D'îßêÛ¾,ÿ|î_2ÅÆ	ò9ëÿ1SCËsªäÙÍhŽvKslu‡v„ªZ@0»
]aÑÐ ]ƒŒšÖãáH¼Ÿe`dÛÝúb˜\�<¼™æ2sÂ'I®>@ƒ¼77«1G˜ÙÞ¼=mq©Æ‘#¡
%%òŸ+Æ%×XöYBÏ»VŒÖÎ¸‚5Ê~¨ˆl¤0¢µ&«òôj{z>7#|ª9µ¨o0J„Õ»ïXÒ‡dŠv4…½qõÒ;ó¯Ì°ö†’FôkØèªËcXèÚ“.Ú(N¯#­oÁ=Mjajul` -@Ÿ8øj&¤7(cDÅe@Uîµ
y2©Ï^Æß©‹¡Õ¸¼ôVQg+2)aH¹øöEÄÙv+¡²­ymµ•x¯e-þ[Tsú¾ˆ¶xÌÞÆPS³r Žˆ»Üö'˜À#Š&ÌSÀŒ5MfCÕZ¢¤L	S®zS!®´¿	W*E“ûHŽá4è+oãì9Ø”}Q€ã¯òðò9È¯…£„˜1ï[ƒI™½aØYœ§“xó¨cF›epU<'Ósûx¥®Î@ÆE—§]ÄN.~q•‹7.÷3—Ó™‡G{š<§ô:ÚØ8JàÑb·<U½Gm¥ËMgtO2¼‡±yJ°ï2“>
âù‹àÖóÌ¨ªg1£ÿ�¼ï]"/ˆšäˆSÃ�¾¡DÑ~
S:8óyÖO°FíŸH‰ºöèá¡E©ÊæœS5âšß/–·cš³_d
0=)àÎ~yÆTü.\>Pf¬lŸï©ÏÛ©ÂŸÂ•Âç¥íñ±uú|»¢M8cLø"Kø\~}Q$*cGTFŒ¨ˆá‰ás…¶ +â?8£>xb=TDxðÆuð8t{£0È>Q ô½ÐTØU_‰»2%Ær¹Ožïú–”…lô¦n®-&Ðd]±Yþ1¸²ìFF�Ÿ¥}^çÎAm·¢S†]óNÆÂ:š²Ò�º‹I®‡þÔñÍ<»ŠFçÁ0Æ˜;ò-·tîjMyBˆ!ª)˜ŒÊ¡5F—I”ˆµ_ÁÍuKŒJsã)qÉH«- „H£¤
ô”è±Ü¼2c¨UF{ÊåÔâˆ˜Ì”D†p”'÷èÌ.¯B‡™•ò"“�Qˆ§VbHyõ¨—²®Q®Ës’UŠÍ›…b&	ÍvF$²PsGGiô1Ž®•@ê<eˆLÀŒÎã!»L€¬ó
¨èFçñ€…Á`:œ>ª¥²*·jöSUÂ:	Q»;ŠF•Áº
²˜²—tÙA2�®;ŸŽû}t—Ê‚�óø�6ŒÙ$Ê6D4’ç•¨‡Vàe\N¨.Ì“”˜GêýLÇf¾Ž`mÆ
Oâ!,&qW0\˜LÎsµœC1Œ.3ÛŠ×çpŒ³}bè%@ëIŸ±'xrÌÜŒx„žà<Åûƒx<Í#^¡H§H&â¼udô†ðÇ1eMÖó ¹Æ2;q€º@M`÷NHêæ´+dtžâWnio`mž6uQw}ÔØžâýf†¬\nÃoº'çÏ&œê!€
7 [{*pŽ
Íû?Ê<éòýÙµŠzRã»Nik=)%„7²\û"auq$'½r¿f­¾,S™[ž#–·épiHI~‡UY÷-î­F<k’°[7zùVi]@éºò7ÎT&V&)7ž¿–êóºŒèjªc{xZIŸEöpv€ò&+üPwbÄ}Á@MÕíÑ~9ÔT¾®OÔUW…¿„_ŠÅj·”áÇ[Õ'U¥+×SØBMP-1…‡Ï34‘³+…&r’Ü„(RJ¤†ÄËG-)H"Œ>¾*iR6DŽX=ŒòèŠ)Á7¡UÒŽÈ<.Yk^jS1« b—×)Ïã/…à¹Dtäë[Yg¤”y}».aÌléçõÅEÖ^eGsJa„B¿XP µS1+Y¬LÔ»ô³•¡—·(Gq€Q²gŸÚPN›K§l²ÈÝ«Lê·Ù2Ø»,.6šâZçÅB”ËP©Ç30£/ñu’õèdšNQ'(JÓpŒ!(¢.z÷|–TiýÄ/ÊÐAß–Ó”^žêõK•ŸLr_‚âo°0¿ôC Ùˆát„bÃE€|ÒûŒºìØ¥	Ã¼Žc|ŠqÖf	{†H53iõL
Ý6€tS±ŒâÖIÚ­Ë?	wA¸ñÞêKQns{â ã*Ü”¼80œ7]gJLå0-0Œ9Ìß\Á„(ÆQYA?îÊ_;¨fŽèÐ6äŒëI÷5W™Ó]\¢ùhqûì»E|XÎâ«3	òâ=¢{žKñu0ü’é»ªKXÜœ™W¤hâk‚$dC&Œ7"!r¢‡Lxy=ÖCÙŽvë	UÅk+è›~)Ç7/¡)ìvœÌÁ
.šÀ(›‚8«�˜Î	º¨7Õ;VvMærqÈÊ²}êv»é¼6ïi4Æ[h¡§95)‹Ý•f¥Ü¼^.¯ Þˆ—³ÒîÕçYoÑÁFj­¡‚øñk)9.ß½××Nö_o®.,²dšÙ˜•Æ¬}†.‘ƒ­uYh˜„`©V?J$Êm!&'*IM³1]®·õ@n H2‘y‹JhˆÈ¬õpC[MÐ°çäÖÙì`ùF�ÔÑZš¯ïÌÇ/Ëù
%²@O²˜ÛÎ)ßÄKG²2ebåAþd[Ý‹„{AÑ|jö¥D­‚	ì»Y²¤Œfq“:ênžM“‡ (GÑf<-³gleQ·³2	•ÆísùgÝ;¦(µ·® %xuŒÔc€qJke_¿sw£9ÍNQ5"·óG[ÄSC!šb<Ô¸5ZìN'EªŸ]´4Cèá] CEh¨†òG»õòè„!´3	îl·È§ŒtG|Vêž!&1EytŠÂ@*Èå‹3ÝUN;ŠP"³­º›®“¢nI[öíšb�T‹¢=˜˜&,gëeÐxD..ns©ºÛÒ+	—®r�E!¿b_šS›Ûû{\Hæaœ' É›m·
ž{Zƒ¸ey¨ÍM³(ŒƒYÛ[6-:•Ö¹|7ÎãŒui¬¬€¹Äà— b”ò@7A¸º©·NôK[6_â]tQœ×ðícŒ?§6å8@³a5ÚGQùÆ	‹¡e±ét´±&×hZÉ÷Ö>œ^·Íh¼|TÎÂ³¨
à¾¼LÒÕW; »
“�ƒ°]å‘k1™n0d¸¡™­øˆ_ù[Ö.ò¨<*+Ïi¢¾j\„òš¥Ý¢¤.£þ¬”k�å¥y‘Œó“øïQ{é±ö)>á-ÈþÞ{¹õëûï¾Þ:Ú;}»¿u²ÇŽv_¾‚?ö·¡á¥äÈüM/ÙMŸâ¥ŒÕ½^¸¶“ái!wZwg¼ùåEG¿ç ÏŒAìÃH´F#tËc4²æhdwÄC£n„ïŒÊ+Ž:;
P ²çQ\a#š]:ÂÏ¬Ý…yz+;{;­9ÙæêŠ¾hÁÇ¨}v2Œ'¿¿>Ä¿Ûv­Š\µÖ\ØÏapµþ-ûËB¶øwh¼;	/ÏTÖO
¶Ï07Þaq‚`NMˆ.78$<�)Â¹@
×O<3}4ÿãüð%™ë¾Âdpë˜·­£¨Äý¤Ÿx´Èêqá‚?W&yš¬ñªvê:áÇpzçÓâõ9¹ÇÐÉ…ˆ{ç.A ’»ÎñNJÏËoÚ>3×*CâfX¨wjÍTC·ÙjVg�ñ»È×>SÅ·Åý=ËúÊª´wx­Œáòe{!pÐ¬X[‡™Z©Rà-1‘R>ÎoX»ÇÂà&“Är°ÞÏð6F’ñ
“)Zv1ŒÛÞzþšOó¯¿L$å
Ç!uïpëùéÞ_÷Nÿõ÷ý½ƒ½S€Öû‰õVlÍ3ŽueM(ø©ºn\bŠ­ŠÑÖ·ï”X]Q#íú^¹†½¯ázlzwª£Á¡hCÛd“�Ø­=8¼ÚÀƒ‹èí¨ÞsÈF±¿ò=ë¨í?³–PuTT ;ÏÊþHØ-�8ˆƒ«ALF5ÀG	>"€ïÀÒáz™ò�ÕêAëiÜeò^‰ Kšàt]RŠÐù”·o`Éõ
Í4UÏä æÅ=G<!
ããÒ€±?ê•ÙP³¡0¢æá?PK¨�7uªì6([CœžZ[Þ@¢ÂÓ¼²@ÿ¤SVi»-Ç{,‡¯ÈÐ|ýhI£€�H•#¿zmeøJ
š<jÞµè<"«sÝ„¤Lg­<™^Èæ‰8¡Î%â–0A¶*³JDøÛeòn™ÏSÉyçšÊÉ+»å@*°R}Ly‘3G,HF‚ñÍõ J£t‚R>‡pÞ¶$2wPZ•ˆ>7äâ1Œû·8\ö”ýüx
9‹8i‡ÿ¸ŽÎßœü#>$ãþ„ðOþcx+ÌÓ›ìíòÿñf«Çâq¼S,@)+÷I×PÕ4c¡€òBÑÞEg3Ndv‡d­¨E“¥ä¢Ê9ÿ¢¨¼Ùm«â™/€l¡HÑòTjáÄÒ»4t¢×ÞtÕÒAFVõ¶X«‚&”Ÿ]$Ùv4q³°ìIš§À´ÔÀ³¦¿9dNÂè|
\æeØ"“
²ó›Ie‚·2|ç$”j¿UaS[ØŠˆ¸ÖxÊíabÃ*b¹î9¤­²Éçð¢9‰U3àzpH˜
>ü«}Á×&1á¡Ùêûè—×‡Hb_7jªó@ÒðteÅ¾Ú”;Íç^4eŒDÇNÏ¦™hB¥;S=aPW¼Ê/ªÑâV7Ñ|…•5v¶4Ë2Ð©HöòŠª²ÎSORÔë“‘õvÁSïOÍ¶&“¡ð=�™¿p~*”¨hùŒW‰^æ[,Ž/º“i6Àë*î"8OáŽD‘BÇ5H£K	+¨êDvÇv”òÛ‡Er:J&Ô¬…”>³ÿ2ª-¢ÃD¨D@j™Ž1ê§üþLÜ[*rŽNy%²â“vaÆ´>Upº6íÂ¹äf¾niú¸*Ä|üãVÂ¡6A»ú|:aÀ éõ@ú¢N…²¶±êdqQA©8µÛ#u_¢«Õ¬J&+ ¢]Aéó
Óæ’n]¡¯Á0èÇ"AÞëh8
R8“¯]~ê ª–hfÍRcÂ4I&h$Q¢)yBEC3»·Ö5Xà;µu^Åü¦ø9)0ýÔî¬õëaÉË¿‰ò¢ë øk™’Ócu©d¦;™žbEq¦Áen2¶Æ¹¸é^go þS¥E@iqØz¦ÝcøLlX± ~s+
LwªÆRJñ¸>jI©Uß…1¢	*ìl…ëŒ­,îš†U¿¸öÚH+¡rŽvwö”XEw‚?$=P%ñ“|719½ÈÃ@VdE
ÄehŒÂNfj:3TÑúI’PgÀ*©y$c\*“ô´ŽwÞŸ*ËÐz~¼»uº«¼9Ã„»qŠdº¨AÃZrš ì8^i´v¨…*I[Ý<ÏC¢D ¨Ö¾èÿï;H§Ê8ÅýÚ:;#-=_„®Uw<—c6”ˆc»	Å4rNŒ çíh:j©±z
Óþo”a‚>°åÈ•0ùP^Þ/¥Yakkç`ïð÷7¿îªiŠHH.U¢¶ÙWîÆTËk+\ŠG
¯ø’¾HÒÑ)LX»Ð·//:n
ÁÇ{÷WÞ9«;ëÄþ‚âM×¼ZõÍÂ}ŸàFŽ°¡Çðó]œï®! …&qþ;<[©îâƒn°Â†¯‹^ˆŸí¨Ëo{E¼:=Ø§–¦ÖW.b’¹>ˆÙ)~´¬–§Ù©¶ñ"qÐ›_wŸ—˜£v~Ï3$O¼–Å�ÅÆ#âçI–ew³ß²M&b¡¹¾*7b;t!ÖšCõraSÄqEqd´&NEÆâk[îªÒ¹Ú'|gÀóç ÕŸZÞXâUwÿ$ád—Ç”
1û¸¥s`)è© /‘õ¼8¹RXgúp0U¹:”ÂÌ×GŠ&iœ¤€ß×Í‰É¼5:k¸‡QOGšu±GŽ_pâÁªÞwïUÄŒw0Ž^'Œû±š—zDf¼ŽOwÅ¬ãQ¿Ü&‰|›ŽèÁÑtÙV6`ç“l}a€¬eÝé˜KÝ‹d´0Áv;K«kK‹OzK/þÜ‰¢^ïqo)^]Û¼Þx¼¸¨6¸Þ¬Á•¥µµµ'+Wz«pméü|éIoeñrU4XLY§ïòÉµå¦åöf•éöf­íö¦ežVAZDº:òz9û~AöÏä¹‘ù¾‰ð‹»xAå©hI‘Ý¬€D|@kËy²§x¢@î'Z0	t°ÅŸw@O…1>º"fMÉ<tÏt«óœƒƒo¨äª6V1ív²Š‰žÎ'T‰ûy„ò*\9æ¦é¹îÁÍ	Huq;ÆÓ`(Š&<j‰—.n±yð.Å(Ó?°ýoªâ+_uAwüíUÑ>?œ¡¼j­3-[a(s7ažEj±.!·…V€¶ädÖÎùDÑÆ{Ê2òD·p^‘àŒÃ ýk]ÄB¯¨„úW2¸ë|+H‘«àA2Î°ìaKsÝIž .´Ý6Ð°RWzÊ>mì7Žògšê/#Þ¡lÀ:c&P•ŽÓé¥›ßŸ„4S,²ŽAŒ¾6ƒ›¸ƒïåEdqå'ƒG8|s¸k"“¦Á\ÜcìºÊ0¯.éF¤}ôÐ'KqªB£U]X“@á�Zr×3…»aÖàõ¸Æ*¤8¬.÷	Ð¶\•Í&QŠBi¬ˆg–ª¯ž*Ã×†5ó`ò`tt+í»³íer-’0¾™D¦11ÚÕWÍ ?Ï Í-ZzMÒ
PD£<nÞeÞ–	K’Bú¼‰1ò›Èõ)ôÃn¹’§t´±4Ó–Â…BTø“¶^“iVvÄâq¼‰‚ŽÏ4´.¯ž
±æÓ`ë8˜¦:‚/°S"5¦œC³½êô%ôîUŠ‰HS
zþ:bÀ‹�Ü•TŽ\%‚ß&=3rl>
ãì¤š¹ãÖ%ú*`¶Ø(ï,²¿wVÙå0úDiA²†ˆ†Mø0¦éòFþœtVØy¿“¡+ZçÉââÂÊ"]Û…i2éœ§i'µÊ\%OG	]~AÏ
Þ(Ï)Û¸½eÉ$¸ Ivqže¸2ðW÷	»Sí‚1©´âKEñ%½°2?çõ FˆB?—(ì¼ëuWºÞ³ë^¡ñ|çº3ì³l„Éu§÷i\RDC5ëŠµ|¸VryÎ£üoµ´µwÖZzâlÄLåòtÐSÛEƒdÊ%�¬)]Šâ»bÑYd)Gõ–æÖ¦Ã­·€×Zñ„I3§„éå3³ÕÓ…AÏèÄg6ÃL†¡:Êå(ï,AÇpãha[ú:îÇ9êB'!NV•íµªŸ0@ajè0/œA¾GxÔÖñBR‰Ø§>7p`+Û¸›³kbló‚µÏO¹]©Q3ÓeÑÆ­Ë´	ŸF4W+^I}‹9˜SP6vÒY.Ïø‚›¾¯ò8!ŒÐi{½(ÝãÀ9æN$‹d˜�-Òº²€êo,‹ÿ§»·rÇÌeä‹¦C¾´êdq:§ fwãÖœîÔÙe€B¢ÎMç±ãdºÊõ,@}:Î£¡uÞ--N>½÷œZ\7ïQ`£agÉq~†Ó¡8 ÄÑ ¬¡ÅãÉ4·óQ’œb}D‚OÁþr’²¢l˜HeS¨c¬Z¤¸�FˆÒÖsXÜAÄÓ
¿F/ÃxŒ~`'ˆœ·ì^••¥ùtèöÌ.‡6hq™é÷, ²Ïâ··×¯¹ö"n¸Ïœðm4
…÷^Õº=—7oN_í[tÃ»+ö”Ÿr1ö‘zí=Ûâñø&`ðIÇþt—­mähë_ßìï·žý„×Àá!£‹.2ÁØ×ÄÓ¾–F 9ŠRŠLA®SûI2Á6¾¨„#EYð¥ ©ì¢ÔB<HQsÏN‚|
çk'ø°ö)yl‹µ›k[¿íî¾ÞÿWhG¡O¸ýLû·(ºÞ4oh{O6µ3%“kµ±íøzÆæÞž¾â;Ç)M‘TQÑÒŸô_GhÙ‰ ßÒ±Ã Ìƒ!a]UÈÍ
ÄJÝb@G!Êâñ%&XA{Æ5.ð2Œ“=š}’ëlãvÙnÞ}ÑN˜ªÎ8[g÷ÙÓ¹÷dZ9ÇÀ-.ÌÖ•ñ)krÓYÕdF¾÷ºhæ”wF`!D6¨Æ}KÖIì<YUùÏ`8¬f>]rÒ	×þ n¥}!aI¼t
Kn.™RE^(%aùVYoË¦K×Vì¤:Òîg¤›ÖB 
^«FƒqS8ÝDÂ@ZÏ<i¹G#Rã£Æ‚_kÁ@¥„š·¬#µ”ŸÆ¯)“ýS‰ñJú0è¼[[ü8xÏ×ÿA™ìõÐO6�±üª³øÇh:8û˜ž?@‡á8
w·-æàjl•á¬ÚŽoZ—¡i.J\$Tÿ•ôŽƒPƒ#CçJà“0ù›¤žÈÙ~!Á˜$)ó©#nÔÌvE”¹Gí2g #&þ\E7˜n°’c˜t—+½º¨àÂ0ç˜Ò1ÿQö£å&€˜1¦ÒG›¿°ùÕæ˜…œZ±¬8Î–§%
'õÚ‚ë4˜8[±Ú¹=»†Jø¿\B­ßßF]¡»34Š–2äfâwW«ø]Ï€‘U!ÑÛÞOÅÃ]õ6R¥¬~`ÚoŸþ#ÊI?’wœ§sk–“O�ÌÀÙ-v‰·ƒ3÷!š§øùX9¬#Zß=1Æ³©ƒŒãÞºdm”Ïþó?þ·ÿ±j=Ê’úÊ Wò#Ì~>ðG.—ãÿ³JŽŠžDÀ
LXOÈrXãÇmÅ ö]õXª¾ZH’WpVúÐèløÖÖ"¦ümíÆ¿L˜$bð›&¨®”KžJþ*P«Ø5'ÙQŸZuºúN›B#ŠkSí~óØ‘ÑHÆÓÅåqèÛÕ‡ò‰ÛnÁæãPÑÛþ»ŽJÄt¦Úå%‚Ã³É|ÜèF|«ú¨Q™ž†ÿt»ÄS�+[CÂÕÇ-�/¸ÎË‚¼/=öâp*ë õF‰‡…>—í@»”ÝfÞ/L
¢ï–xó%öê4
2d³žzêÎ‚P}¯+µ‡UðK0Ã(9[i†’w÷m
H1+®^UíäC¨niÇàEhì#²/F‹ÌÖ~bQ©órHø8d
kçæîôðz·Aò÷§|ö3:†vœd§ÞmEòî=ùæ]ŠB¥ï2U­þ„óØ†T&pox’Æ£ ½/©¤|¥«ç¸,Ñ@„8NÍ<ï´n\t[tÁ ²$ÔK‡&Å<~x6Õ¡ÐŸ¨²³±——4eúgãò5ƒ2~wà·èF‡Úi3NZsud}bÜÓ¤ßjYnÑìP5öo·Ñ$™>?¢¿~±[áqsŠ˜oŠ¿s
Ý½‹"’¼£é¼Ïc}IÑDëòÄ£áÉsÍù‡·íL©1 lÓ1†Z¸:ûuÆ?h“|Nq Šà*F¬¤Šh¸|f>Fmmknðµëi¡ÊÊê’Öµ!â¹˜3v,íœ>#çŠ>øzVFù¨•ÑtykÚi¾ÆÕ
Í´Ð‚¸ºo4?t~qP&
ò:fZ!Ç
ÁŒŠ÷wK«‹ï›èÞëº÷Ç&Ýû
aøIgM×¾O¥hß¥b¬Ô�â0ŒÆÍÔîÁy–§Ði„ÙFøïug¹‡ªs°á4”Î(í,=†ÿäøZJ˜1o!)«Ñ[wú&}ã×˜M]cçç’Â^,7a/JÙHÀ1?64‘ô
¸ûöy­ƒOÑùIg–{½®©ÃEÆ~Ù¢è•WÈÊ×ÝOP\ÂÓ("iÏ1–QÙÌú§lf–Ê‚n˜O‡qFÙ³ �Ãær\x±‰å^ñ#hmüaš_YWë"WdÀ³¢téLÌµ ƒÀT*¼m¯Y¡P0;0ïm>V·e’9o˜ˆ°FÀÅG’ÓP2­Iî.5æFnÛèuŸ\$é<;€Ï9Ëó,×úN¾]½„CîÓÂ«gÊ¾Ç"T4	s’�|»˜fëx©(?c¾°´hòæF¶Øu¨ìMí§qÈðD2œ &\[ìU·Ø÷LÎdx5"<×L«¦Hd`ÁêûÍf1JÀÇ%lÃÉ:D�Ÿî£ÁŠiIk]Ü†ž7n•¼¢]`~Fí¦ZzÍ¬<j—RPÖò†[lo±f™‹Ù¬K"¸¼Ølé_“×0¥j¼®{RóÕ½Å0“¹Û_&µ¬úªŒ]6ZŸ�U\¹×€iÓ‹`Ü²ª&üˆWÆ&\l˜\ˆZ¦µhgá³Ù×yozM¤äb©Îâ¼ìrÏÇËìß¹}GÁÙþ“¡5ÚFú2C+û[emmFR„#ùvv&Ý³›•)ùBdk)»O
üý!¹ìl,]ÓÖg
—|ñÉúâ¢P±uÙoA:6ùËQìÅ§ùŠzç‰åtn¸äi€ÁóÎãÄ|‚qð½è?“i¶¥¦šQÍªÀ>SÐç%Äº¶×Å¯W!ïoVtŸi"ÖH™J”E£7©õÙ Œgh‡[Ä~ÛÛöiB]VgÍùõä?>Mû=,\A¼sð=ï»=4¿)Ÿ6d¯^…ŽáÝ0Áf#åñ—á\Êl–†E«mÄjEÍ/eŠ–öueã®Ð`t¨-Ìœ¤9�7fñ0°¹%’Ñ9¡€
àB8XlP|PôÌâ}iñjŽ¡Ë; (§ž"ªÞ:MŠ»Þ&±P#)y†ôÜ¿ÒL—Œèj‹´Ë#Æàp¢2V˜õÝá«öZg�æqˆX¦Î‘Ð X•¹é‰Ecz’b‘†¿Ù•ÍÙë³Ín<¾NÛocþâ9%—læÝâ{ÍnÙ“¡ïñÒb+Šå©MM\Ö™w¾¯HHŒ«ÛyÜíõžüìÍMŒe–w×–k…ì<ÅåãlŸG.œbÅ`Š�–sh3ÍSzÏ±gì‰^G„–™©X±éeÎaºé¾#ý"·ÿ1µ,¸¤j˜(%c:-ì<Ê‘°¼ýƒ«ð2@|x?Íâ1†¢M§ÃHoðÛÛ°‡«Ó.v
Òp-p+‹—O7€-^º§I8P°fÌÊWÐLÖž«©+Ä
F^7—–ãOÐrÜÍãß.üÄ^»ËöÓ‚vÏhì…ia*xŒs›Ùðï°­áÓÝŒO½–ø{”Cà•R›dÞ£ó/¸x?úÖKÀóéÅÆ-Çƒ±Ik”*bü?É9ž\Ø#K™ó
×±±ºÎ^—ÍË²Í@ßËZMGpîHˆœ–.ËŽÞm9BèŒ„’±÷+“¤ŒAQ,ƒNÒø’b„K±Ã1dËÎ¥‰hz'ÔÄˆ¾ç2Ž—0Ž:ãü¤J#ùÅ;[ª+¤‚‡±ŸG•„i</ 5Ë‚Þ´›Ìt2Æ9C¯ŠuÆS£³òô²ªÕN/±Q¸n*«Í~÷H—
»šïáé^1ãx›�­Cm“M×dÿ>Å Õš¢ÜP!ypåŠWª¸×ý\JF³x›ys›
{,>„dÍ†|Ö÷Æ¶øÆå+î.â´DÄH¶žI¹å1¢
…–KåÄwl=6�nÝv‡Ôéó�~¥’R´ÞòICÀÖúÜ
{+Ø‹$O|ýU˜Ç{-áÝfž>µ$H†ˆPV€6\æœ¤S¸°jò#…>¡.å¦³Ô]Õ••º…@~¡çÒ“ÐXl$À‰s5ý.!¢#¦o‘´ÔíŽÆŸßö¶=‹íÀ³Ï6» ô9DÉ²ÎQ<$RE½£ëB®%çó	iú(O´s]ÜËårÕÂGõEBA¤Z¿ÌUzä¾¿¢â&k)ªtU¡\(ó¤š|š¡p„ç~*åå›¢Š|µîÎ\`ã±.F¥i‘XxÝ?}Žª„çqz1ŒzÚG‹“gïé›Ór¢ÚÓÏ¢šãoo7·žo¼÷y¶ß3VÕ'
±§¼áøÙ‡?ð!…¨Oé­Lãà?–¨˜¹ßoÉ÷Aî€¦ÓWÒ~"Ÿ�“ï×~û•ß~bY½3£š*‡¶-nªSÀßúÃ€×è;ïAð‚*ÎBºàÓºµöçÎÇ0Íjî¦$ß�}xxÕ3fûœµ¹âkî§Šnó>¨_ŒfÔeF:¡Íëx2ÀÈ&D54rá,ïç°=W©Um}3ÉÐ›ÂFr)/
e*ZÌÜ5Œ‡ÐîXÛÜw–'t?É“U`¾/¡ï•	+þ@ªæœä6¦h—ƒlŸNûðkŸç);ò•ÍáLÎ~
Ò€'ó‘ZãME­Ì“p#Í{êáöBHk³…IðÀ„AŠáwòÈ	º•³Ÿ•²U1ÇŽW–zã ˜ÀVEc ìu

kË/¬ˆqþröòèö	þpÙS¹hÆ•µ{( “Ò®…;¹t¶—i0Š[y	–7ZÐÊsQ¶A„‡×ÿšÝ¦ñl´6h"²üF«Tö1yMé*M
Ž3™³dL²n?I�›Q¾ü½ùïß+dùn¾ü5îßýð÷¥Ç?$Ó|2Í7¢Ñy:ÀþÙÓ¾UÇÕúx3âƒG•»ÚP•‹!<2¢×ÈT‚Tû˜zEY±ÍU<ž«ðá•15‹²À*ûÐƒ1NZ½Ä`ëjšR>’ÿçÿº=òA—Žˆäùe¼i[œ»Í4¢†˜ÉÒâæ.¤ÓØc&½÷×7Ê˜1î˜‹ù9¥,¤|nÖ’=›Œç”I@\ÆWdØå<‘Åþ|~CÍodïuk™XzîbÅUGýíë½"uYñŽFŸ‹k{
$žàãÊv^u˜~F<l7,VÅ>X‡¡o‘í	æJÈÚZZc¥èat-sJ: )T›Ø¥ª#l[—s*[ƒ 2Ã}ÜÍÖö››=q‡…Æˆ^=j6þÛ8ôtu4m‘úÔY5(UŸžÓãgFg{xN¦#L=îOQ©ñk$ì[ÿfVþ¶Cn{àdká_LÙ~<¾b/‰…FùÊ5àœ<ÖÜ04)‹Ð«…]gXÁösˆ¬*á…ËjÈüÆ`cå-[&­øh0zd@miëpÏøNÒéÿ5ŽõqY{¦øzñÏ®¡4ŠöÃ9-Ø1dª<Š…P¤ïAs>‘kmûf/ôgÌ
/®øøÌÉ\n{¢·¢‹»;ºcqñ2J.’0jC¯ó4yô„*}ËâŒ·»^cÿTÜÒr·‘9‘,-ôØAàwC/�\W\{^¦¿6H‡r+ÐØöÚr1s å÷ï¶„í˜¼º8~ÛËL€‡/tš©-,úZSþ¡ƒ.xÝN6Áx:³,œDAz1vÿ>Û§Nñ9êÜ^8äÐû»ØÕõôú)ÔW¤Q &ö‡ì`:\f<N¢TAk8ý ›x%x/z*~=ò9Æßèc>Ôì·¤ÿî6ØõŠVIÌKø,J&
oóE¨€±*ñÙòTE#xÍb7TÍðLä÷ðe'x}­Up sê0øãÑdp=´¥¤àG§!ë´PûÐª‰-&Œä­ËC×¢  <kµz±™ÉŸ)ØggÓWô}¬O]ƒØÌ	”¨¯ß´@äÞ­¡¥7NôJ¼%çòó½"ã½Žš:z:¾°1®W{î½:«¶YÇ˜7ÄÙLÙã*ëVùðÇf³á–17Ëýàš"„´Q¤kÊî-¢ì¢ÎU÷†hv%Ñ8ˆ‡]U*IQ‹j0¯%Ž‚IVg0¤|·ÖB{á !Î§¡ë°ê¸îÊ_×¦ú:'AšE/†	À£F3æÔ;¥YÆÖ8bôŸao’qÿÛÛœqÿ¡7Ç÷ºÞÌÂ´Ü1Í¹üf&?±S`*®Ø•¼¸&ƒ‘ûz£;ÛŸý f€X @J&Ž¦Dˆ(v¤7Áu`¸½{–ÃuÅŸ¹™¼6þdÞÅHÝë*À“»MÊ�hˆÖGÿÞo™¯Aœ'DÏvÖzÖé°£xŠ•ëtü¹Ò¸ÇwšvžK™ð¨p¡vÅv×ä‰9œ99ÌÁS:tÏ¾“òý¨0„Š<Nr¢ÝŠ	ó Êv
W²·?—¨|´÷üÁÉ$¾ø/|DpÅšzx¾'4WÂrÕØ>Žÿ×PGiœ¤@¤›Þ9U¦ìœðÆnþÈËÇ"¾¯¯€%i={ú˜œsÜïÇ3$¿¤ØA­gü¿¬}…3%õÜO®[ÏàÖ>Fk£ÁŸ;Y¦Äv¢ì*'–+è—È•ù/Gñ-e ¬WÍ}¶péžDWQú!�N–îÏ®Q9›ÔòYÙ²I^ú½æõN%®lU‚ÉLZ2”F¦ýµàÂ­Ý·K8DB¹c«ºJÏ·(9
¦eÚÓÂÉ•5¯ŠG+9´QF†siÊ<.´¬öz6ÎNDô¶Á=šX¶Bï2 oïÝêÙÄö4»ÁKÞÌàí.ß½Ÿë£q?°glÑÝ–a:g>^ß|ˆ&ã8ý^[ºÉ²íBR¸“nÔ¼êD7’b¡¸‰ƒÑ=þ3MMÐÔ¾°wâ*†UŸ—>~¶øa”ÃÍ[ó+¶ü­Tú·kýìåC¦ÞYE´ýÑÐï6€ÿ+Zê&.íåCÎíuÅ*ÒôðçVœŠœ_åãõÒîÐÅ?ã†ÐðGqãÝï£s@@«†û.Üs¿­>^÷1B¿î]DíÞ7½¥îj-¹µBK=?±V¡áR�»*T€ß1Him8ð^düìš‡�Tv)à€|Ç’>¯++¨ï9‰Ï§¶ìéZêüƒò©µFÐÖ\+XÉAÖ¹ŸÉ€ioýÀk@¢vfõj²5¹+’ÏLÉÛ¸U|Ië³þIFalÂ-ÎÓf4x²ê'¤”qÔP_¢>nhl¡6uà‹†�&õÓÃip2
$Ð ì#‘GVî2NGMšgìì{‰¶`Ú(²0Ì>ñ¸ËöezƒÍ3ŸÍœú¸•³•¬Ý}·ª~ù™ šLCÑ:Ëº!ˆH7ÇèsŽBõu]ôF‰Êï•	
~Õx³Î’SŽŸÅÒÖóâˆ×.†~C»Ì­gµ¸wµËl±º®Ÿ‡Æ§ì<¥ VT‡ÑªnË•Ø[í»†!hhÉAº3Vý³Ž‘ßI†Ã =Ã£Ø`4wfµç3ÒRN¡ÆSäZêàDÓh¼>ÄBîÉ-¢>BOë“mÙ&@@å–ãcfMù–±Ù!­¨™É¥	Nû,”ÆLP`’ðÎ$À,”î OµåS	u5ç®Â·ß[ÏmáÝ$™§SwæäÚø)ÈÈÉœ½Ó·sµÖ·ó]oÅ%+4uï4ü³ÖÍô8ÕZŠ7œ±$.ï,tÆ*ßÜÏ‘ó€î{ë9írElmáSpšð2žÚ/£¼D]F‰Î–âLÆ=¦Ò||²ÈI\^Â Ô(ÖÊÝ«˜iT!Z#Æ‹ž/—Ev9×v*º30Ù£Ù»W™ÙÈRLƒ“ËwÃFab—ñ8_Ä°Q2<5F%Wf!òÖ¢/�jþWDa0sÚwdÝ~±MN©ƒ`ø<ÉrG3‰QÂl(ƒs3Œ£ôÕ4" 	£óœG*—ªÛbSSžC½‹g›_¨¿z{ºuø²EŒ8ÔŽu•í¥Q8½ˆÚíl:šg¼Qø“ý…µÓn0¢,‘ä×>ÿçãU'ÀÕˆCö,È_Ô¢µg9´s+MèÓ±:›®EHßLâ88,+/hzðßúåùÅœåv<ÄÀ/{Y6%M¶Ñ¡¾Ž²+±’Ø#5b.¥ºŠÁ
QaØî(þèêÂ„�u>"QÁÁÑÆsîïlã¢‰ñ]Mà£B_œ¬nƒŒyh»+x…;�Õ/’ôHµWÁœG´q…„
Œí•@n[w!"Ô}E+ÿ4 €þÿ,
Sl·ë(}T®=çG_Ø€^GÄŠæêË—m;».Òá6›)î»¿ª0Äœ¶ypža²UØ³w¢»[‡ ÕðT³­yFwžðB\	þÀNã¼Ž¡uöÃggZzv7¯·t¤WxŸ¥´µ5œ¦ì5^-B{<JdÙäºÅùMu«ÂfNmTXÑ‰¸LE{Ïƒ!ÞU§j,,O£Ã`’�×ÒîJi{Ÿ`¯äÑö‹x¢Žª²Ù0¹B—Eu1‹735”]E¦ê¦ü„×pÚ·.‚4°g\Ýà¢¸Ec§A?ð�züƒl.‰Ç5{|MhKöZ¼‚ÞÎ•Ñ¦\Ry;©n3
Î•æŽc¤ýcv¼µ­¯ÚÉóüfƒ(r/Þûû¦AøÃm”iV¿r†ÞÕÒ§³.æ†a¼è[eÚ§@ |_“óÒ.ÀN~`Æ0³ÝpÜHôc{ƒÚ¡Óë,z†‘…?·Ô=®[q¢Kž‰ºÒšQ'³A¬ù Rã­ÿíéQgp(OÙ²­ìR÷N nE’OGA˜$Î@ënz_qwá
†ä‚‡Š<§†ÏÖ’yÿÃ…[#î§¢Vud�Ž*KÒÎPgîÖTyÖøos®ÑÃº£8£ö7óN‘gÁ”õ>[«U{Ž¡‘½jIÉäÆaðÊ×ÇcôJ«´ÕÁ ð‘†�x…(|XqìÊ¨¼kVn’X§ÙráÞÏq¾¹-9.4\b\„¢ÞÈ˜B´'N>FWÄ¨XR”E|‹¨)l)b3Úc)Û:CÒ€Æn<ß‹˜£"ÚÊB]¨9Ù¯Ù2Øâ½¡[6ðß5„Ë A¿»ìdÆ@%Ú¶´Èc³([�øü3ÐNhqÒ€e—G¾4@ê„úùd\8ÁP2ÄzYOeþ³ü©‰7Ð½é¼;[yõUá-0Ms|Œ´…E>í~«úÄ^Õ5G,™†+*ï2?zîJÓ¬˜xÐtê(J§çÁÀ2û­Þ”¦!@]afˆKH1H-rÜ²ç×õõ:
&Žëb¿LðÐqåsëÒ¥ù|b\‰Ð¨‘80NJ¥ÈTèÍUEP7-ê
›
#®Fà²â¸=€{v¡ª³ºÖ÷1z´fqÁ•k~nü©j!Ž&S@µ•÷ö[¯O÷^°¶µYB}ý°ÖQ4®2xŒ[ÞÛâ*ÀÊàô•›däf.e7Ÿ ÿîM3ŠÃ7‡
¶ã0W€bî¹îx+.P¼©¸„ò;½*“•:«Dƒ-à´ë4é7T}²ÚõàR±õ¥÷†Aªš(…¦™ñÑ*Mªê°WEUÓÀª ÏîZ†Š^	–•
©hÝ›£Ä‰*2ôwSe©Åƒ¿7Áí­×ÃøŠMÇùô
ÓÐÐ¿âþL¨‹ŠÇ<¯ƒ^®_»ÂžÃX-~/Œ#¼àQÔf‡¸Ñ¬•‰Á'±e¼ó¯T™£ùŽ¸‰S¤ï¤¸«F§ÄÊƒ^‰©¥é_AKÀôÛÍÐrò}{ür÷ðôOˆ«†S‰äb¤*-Q½ÂºÙ’¦I„ÅH´é‘çòtZ5œ
£W˜€Guþ3²¹ªÍ-õÕ&‡`Íê:ƒFdÀÇe,¬5QóGä¹ E:éÁ¤ò¼R!VŒ4%>EÍ"EýÃ!_¾©{ÈÎLY4ŠKÝ
ìÌ$ï,ú%ñø2yµžý–¤W$BÉ«Š×dq•'©þ���ÿÿì½ënãH¶.ø*Q:UÙr—%Kò%®´rÚ™éò¶²k7…JJ¢-–)QMRéô6ìù=çœ>{ÐƒýcÎÏù;ÏÓ/0ý³VD’q£,»²«Š®´$2—+Öõ[å7ìüýßþÃx“±h:Úa+¼¥k­ÄÓ­ˆŒFõc“ê‘Ñ^<ª×°ÊÖÊJF0X?™I#j…"+ÖÏÑ
-ÎtŠUZšW~mI«§•ó®“kº—ÛÊ©ÒÔ$¹]û	Îš‰r¡KÙß®M‚`êN€`'¼Î…C@³Ÿ…õ÷&ÔÐ¨–!3žÖbÖ–"Ë¾JÅ-þ¹¬ò:ÕX›‰1Už[
_:v¦gž.’\`ÖÑ(ô&×
½>Ä¶åîìÚÁœÁ‚jJ7{¹ÿÖaâøÔôÊ;ÔÎãû›;ðrÅY€>[ðåÒ…3ð†Ü9—'a‰U‡ÐF++¯Gðd€8¦ÆeUOÚ?þö×ÿ¢aK(!ìº>t{è9¤N+Š^z#wù{¥´e%g™ìÒrA†>%$Ö<'}ržêUS]q??#£oûEÉ{m·R¤ÆÅ´ÚÆšTÕ©�W[ðòŠÒêõ³~£Ø@<úä]1bÓG˜„&gŒûÍ\,ˆ˜
Ãbã‹a'IìÃMˆûR$ ¹Qü¸/ (»B¢¡Ôsúuú$"Õ;“[m}§»Ê Ž3’|ho¦ÅÅŒõ™/³ï>c1Âôœ‘š6¦…‘P%‰ŽFºqDÜÚ/“(È(Þ¦§óM™ù¡lv o`w²3¡ŽØr²‡Œä—,È»×Ý%í-²·ßëaðåÁq¼ï¤SšÄo–Oi8ˆU
iKðWî†MF	tÈö*t£¨TwQ×X‰Pv·ÆYâNTÕwŽ ¤´/ð‘“7^ä]“³FGá¾Ð9ï¥ÌÃÂw†½CeÊWçþE·ªÃ«#
˜2Ä �ùŽ{E­G‚‚
-)ÿ5ÉÕSsõZri#+±Q6Þ9)ò‡K1*ÃL’É~“n‡mEºÊ
Â¬Þï§Ã¬ÚTÒ–$ÃfY|—²MÅ×++¤;‹ƒF´
ï]]ç$—$ÒÐu# o,à¹Œ_OØ‘–Ÿ]˜O•›˜`W$qú¹äÁ}¤Ã
ÌÑ|,À\—4+™DÍÝ5^ Û×Êj2ôö„\RfÃ€Fhe8Sh§°™µ„ªŠ?ÐÈi>¡šlUåòÊiÖ¶Í£kFbø’P	ª¹ë„Xk’ÅÉÄEg€‚FÊ$¯”G«Ø°xy6¨À¯WE³–K3ý°õ
©_ôº'{»^2ypµàþý£ý‹îyspqp¨yª¢jÂŽLnUgùÞeiV>W†Ãó‰Î=D#¼¦‰œrŒF6xåi'%�]Ý»úŠH¸L`Ãeî‰øecÊx—˜x>ÕãÎLðTZŸª
FR/e_³u•òë©Æ[ù 3
¯¢.Ðh3©Ÿ†òCãtõž¡uM5¢
0\LÚ[NÏ\RV¢ŠÿeçêDU‚¿Ÿ“˜áö¤•uŒ½à·Yô£ìvÕ·låfÍšM_©Þ$ž§-–Jqn²ÂöÉ¹1	b¤ àÆR?æ\Pwêíið`,Â¨„œë{¼Nª¸»O¬ó0ÍþW{²*öI2Þ[7¸D‡ÓäŠÔa†ä!z
HË›¥œ7)»§²FÂ)ÁàÞkJÆkÉvÑ®i(Ï‡—o¬¤ÁiXn¡¶‰Òó()³'ßµJeÑ¦¬]Ré4Cè‹‚	Ä¥X`/sÕ{xéé¤Xj¯\ùWhHµn·“HÔ4(_AÂš¸]ÛT„
…b¬Âúõ09QìN·kÎD*¡ã•VOÊ¼ÒJ[Î‰YtÀ7šm¦AýPàÖ‹S«é”¦¶œPLøU!{ÂÇ8îsÏ‰4óæò&JìçùzöäÐ—v[UÌë‰É>© S•îÙ"þvè^±ñµ°xU÷Êo—î•Gˆ”áJLj¾¼h"o½”½Ê"*.Lq±+@B?jåÀd¹4Q€ÿ÷¿*µ
2˜BXf“J¡Ç>§…¡Ò2PWLfv	
ò$SgèëTñ&^3Å¨'7ÎÏ^Ÿ=‰¦C,C@ïPŽJUòK5\iMµÄÈ-$Ïh-È²•ìQ]zÿ“)>É°„©ïñZHóè;Ê
<x)Ž›´zÕ{èð’Ú¿
ÀÃ¹<ÏR[³Ô,X|‰ÃSâX<‹W²Ia¢„²ôe‰ð2TîÂË¦zR[
`VçØÔõW¹¶›[Ý4=*SQÖHb¿UL#ÿåy2Þ#îBz"öC«‚=)ë‘ÚØ^Û°—ß&©¢3±ÛßØÝÉÞ&õ;Æw4˜²¦n/p‹ë¤»u<óƒrX!êÄ-ü›‘zz@MWé<<"ò
nr•þ@Æ2t/™Ï ·Õ.,IˆBïA·4„ý
kœ8'u®ç*ÛXZR…cdM)6=º…á ï´èG3.N/b„³¨/5£©ïÅõZ¯¶ô¡õ£.Ý½6Å¶‡“Ig¿ÈjƒXÔ©ò%Ø¾dæ”cÊ¿)îäN†äM¼…%¼{™1™ß—™+¥=ø'áIû¬¿‹ãHéä×&üÙóÆnýq-¥¿.¥“ä
…<á/Éÿ³‘ä¦j´*€HVðûÏQµï±‘"U<Þ¼zî%m)ÃÚ)v%‰TûeËërqvòökßƒ^(x¹ARI­%\Óm{ny“ë0˜�åB¯]ræQ t•þQ9˜úAÎañZqKcŒ'0Ç³Ã‚^'A3]Ä\F¥ZsNc4;ë#q·¥(æ(å¯R(nÆ[v•ŸUÞ¬>Üõg¡1/©3a¾ã^“ZOôåg’b
'ÁVA„Ö<¦+„¥É÷_`(¤ˆ"ÈÒ&;ìœS#	vzÈ©IRŠ
ØjµW`Ÿ¬tZ
Õ£*¹Úwõå1D5`Ã™;ö|OU3ò×Â`*ÎQ‘?Ø<QCë?§ }ÿK,–KœõšdïG£‰7XŸÐ
%ÕûGd'š©$²¡s	´EêçÓyü®
,ÊóŽÒÖ-UR+¡–»tÑ{4×EUI8õ–Tç"=’Oèñ6j9&wÞm›Û´Š Üc÷Ê\š>|p§ê^÷M¯{N»çîþÐ=‘¨µ*3Þ†tTÚã*êæMË"¤QÃ…² aÏOu°îäê*ˆ,„fÏËcõ»\!´¦ïN®âÑ½6ÇKQ²@eÂÇµ¤ˆF§CÐb‰)ÆM—Jk(Ò d}&;¤¥‰ÜÎ?B]|‘ÉÅ—/ZR¼¨ç/’dWµâb¢]„žúôÔy íj¦ª£Øx+ÞX®ügWpŽœOžS(Æ%˜JÀe®Ü¨9›DÀ1¢ÅLšŽ‚8h´×W×Ö;›Ï×ÚÏŸ¯7ÖW_¼Xs6^·ÿ
)e›šHâg—^¼
t2}ö—íÍÖ³›mLÔ©P{ó¦±IFð!Ò.èãéÑ iš’“?ÞÖˆ¤x™ª¿ÎW¹]gÏªí$µ­åÕå!}²ªð¦4ûì*În‘ó)¹«G‰v€E££WÍåúG¤Šbié%Z$!C¹¼æ
Xî~+U™Föøµåç?ä/Pe~ê4Gþ¨EY{¼*¬Ç3ÖÇÁ'˜pÊ%¹JÑ:t6ÏSÜŸc±:–5V/<ÛÎ²n@YL.ë2ôÒNFY½DÃkŒ÷J–ã•ƒã-,/Ákã%_5ž™™ˆtBÑp%^Œ]Þc:ZmyqvqDÇ3o2tFb6A—mFÝŸ]f¶ó²†ÁÍ9‚«¹—qìÞÈ)LuÊù}óí9¦¯œ»°:î>/zcNÞ”î–e&“*DTc4¤FÿI“ƒ323¯,_µC×Ÿ9!®Úø._·,Y/„3¿³ø¥22nÍÔjŸUø…µÐvE¿Ù-ˆtEÄÀýÏ%€2QS
ŠÙ…C˜BwhWC]ŽF×'ºÀ-¨ ÞÅ³+'â›3AãP‡Ô«K/"µ8ÏËG©¢²]4v˜·•’ðL(&oc7l³hëÏ5ÖuìjÊSõ¬ç†SÏ÷F[
“Ž*¡¡*˜„)ô5
~Oe-.D©RùP·ŒO-iOëXoâÈÊ$Y[%çÀ.Æ›žá‚%Nô3DG…#·Ùlšc´»™:†]ˆbg S<Ú¿ÒÅ–¶b’Cc[§æÈu’1vÝ&z]Üªo¥¿W‚7º€„]ÊR*ÎËÉ²C|™”öÆ–haÝÿªÂ>”T0êT©_T&¥úîa<O¹²ºs¾ª¨|À ™09ïR®»ë„3iøË|ªžÆoðDVCu$G2öÄ0ˆCWÌ¶2¶äéŒ}°³É?BŠYýŒf?KÃ_ÙôGO0Pê8Ò¼±oE*í•l+Ïµj™Ùä´ˆ8«*-ê%¡%o|%1²?k÷ULwÜ8gÖ)ìŒpô¾G4Ä)Ú—ã2-aàL½ØñA¢/£i$V/3ªHö7)ÌÚjès­~’\Üvhk4ŽE~n9Þ9äëôQ}œFrypÈ#Nv#ÄÉbÜ«ñ5ã56¦§mvå<u‰íäW[Íç}¿ÂZU2]$ðlIeœ*>Ìš)çÌ4
³ÍáñL­#¤j²mÆ“kfcà©
½ï»øçî-(SŠYBPÀw½ã£¤?þÅË–^1ÍÌÆ$Êä.}qbãÊ¤d•…k9q¶Ã{–,L¯•Ìªµ=•íŸfì?{[™™%×ÓX¸7(àRî'Ú±`¦7Æ,-kìyCç:oŽÀ'ê—ö+%¦ƒÉT§Êˆ¬¬:ï+}•×7<óÎé½?'‡ûçßwÉ3rÑëöÞ_ØÁš'¸ÄÀæjtr3ú*=ÊT¸æPþqqƒ‹Ù˜n(›lx¼ G0½º0™QoCj
ý°ÚÁ«‘+$DãêzWˆ1Zò<¼ºþ,Læ«TT©¢–%ý’­_ø7"çÁt)dSZª_3H0wÔ†+BcË¶H­pÎØ¿!CfíF[äC-ûþGr¯ÎÞÉÚê4É¡‡Õ,*µuìNf ±Îr7Ôö¼8ðkÛöW›4¥b…œšÇÐã³SíQã¶}†9Î4+0hù’5œÅ»8%Ù/–í­7É;8f©rSèt˜ÑºCg„fd†å+6šäõeÕœC¯ñgöv§eËÏ›ä­C½šÅ¶¡¹ô'ËÆ6›äµDî°ÐÿRÓÊ\ý‡³’ögƒ¤Æä3/zÍŒ? ¥á“ÍäYí.9”»F¤	ÝxN`€AØ ÐÑ¼*õ’ò®¢7ªº1^éÜåŸœ^æá1+Õ9¯-¡VJ)Fª ‡hÓëVyÌà#Ò–“AÕÉŠÕP1Ç­HÞµ™·Œã´ú‡MÚñgfsB7üŒîaíþþïee¯iÔ�m“aÿÖjeŠIFUÖÎ)ÛI~Äæ²"o‚p¬8Gç
÷Q4jWôP~X¥ë—nC%}ß‚ Ñ¶ìkc‘Þ÷áˆáóGEžC<H½G¹Hä!ŒÓt;¥•_%ó<9DÞ€ÉÍËŸzŒx~ÃVcnC>h†—û|“9Ó&Ñ[]¼¼ávªT4ØiÕ`é™¤>ÚŸ5dm/æ\/mè&ò¼g7-¿“ü…Ñå¦½^ÍÐmoãÆ,µšIÅ;éŸ°uœ‘3éôÝÒ\JÄãòw<ól®7$¢öÿƒ�%©lõ.ÈÊÓùº^½w=ýjÎi.ˆï;ÅoHý8èÃÄŒæùº.Jó;Â‡L"ŸoFJrýNé+VkkÎæ
aGü”NÌn÷¢÷@BÌt†òw¤ç\y£9§‡) ;ôRÏffÜwnq3ÍÙqQ!Ù¡Ÿ IX4|=^I~œ«u®¢ì°1'œwûÂOA#°¢qSÜƒNâá¿ÿÓŽ¯8Sè´ºÀ˜]vðDgòÐ“Òì’±IŸÅ+w N‚Ø´qýSÒäÆ½àmüdè]{°—©­bÈyà2ú¾Á5óhG¬mÌ^ºÅZa-éVé1åý„ËDVv
ô{•E%,¥ÎÖDçÊàuñB¨CÆê¥"AIý9º7b@ÿWâ8—¸ùA÷æ§Õœ«
Dr+d‚)Ã+›ZîÀ2$Žk4M¼h¿´É%¡yÞ:h€µ¹R¶%Û”ïÐy|UEÕMØÄi”o·1tÂkI’A©˜Rf­™#¾Ë
û Ëx‰bóŒœ»×Î˜Wqœ‰(YÀ\Ñ_1»i®@ÚìWDNg1nÉ1Z ®ŽïRû9p–Ù|wA_ù„Uét³^53
íZÝ|xg‘!ÄÉ’H�ý“ßì¢¿TO+‰¶ÁéáÖ5°Ï¡C´·°ÂØ¾Uˆ¯ˆíÓðZa¢CP"`Ý\´À¤%…üŒ²ÃÉÃ C!µïqå”]ê“Ð§þøOÃw/mÐRÙË6ÉU=º’5Â ¬¸G	šeY¤DVŒƒ2Û2a†ñ¸º'ÏúÐ«ïèH
é§ ÅnÑ¯g‘šìš•ã„ÌpZ$²qÜh5Í&[ÆjÙ0ll1ó$ád‘;öŠË9Fh¶Zz˜>°ó…:TÉÙ)„9´;E
Ç\q#Kº	½POcZå‚ñå”ßÅ¸ø°lO“scüÒ.®a‹¼ëu»'¤»{±rq@ÎÎOÿ¼hØÀ‹0ë¹Lf_Y!ohÞqâØ±ü.ˆ¯ˆDSwà]zÇ÷o"C¼(áú¹f˜ÔÍé¦-y
àYÓïà‹ ¼Mr-
“Twh#ÜQî9/UCâ‘É$…'0t¼9Êý³ïAæ†3­é@EC*¶E’öyÐ8g•:\:÷ì„ô=ßIÚã¾—Þ¼MŠÑ�Íf3}mQ4‡ßX¯8ô>ï§ðêò	†)Ó)þ*m±c·^ïÓ¯û˜ô‚S>Æ?@®ïÓ�[zã†¯<™ù
åŠœ €$ú£lðÓz™Ž=7**aÑå_¼áÐ°óÁeÌªì÷á@–LõÎõ1d¯fšÔÃ2Æ@8Ø6ùä¹7’!Š	ª?Ð§0=•õ#Ö§-ÐÄð§>÷ËKdÉWR]§oz¢�]zá¸þñÏjž€ÿ‚Úz5r¦ ¤_µ¯ïÒ¶ïk,Û”öý:+Ä³†½‰÷êã’,#“Íd$W¯OAxc¹SðG©(O§Š²”C†ÐŸ}K¡Ë$Ê"¼ñd
…~€}€–“æ…IüQÞb/p¢øØ"à(õâÄ¡ÇæM6?å­]Œ‚Úb=g®âp³˜³áÜC—Ž¹KË¤ÓjµJçžû2mR¼v6ÝXXó´MkT¦_Iˆ’ýæ3^M¶åü;]H8¤„È„yŒ€Èviì¥f{¦7ã!Õ=:ªÉëà…TZÌ²f4ã’/N¸0 :µå}¥hlÇÑãË‡ôQõ‹ñ^ù›ÿ"[
Vw4Ïp›@šãz‰`„þój¥’üÅ4i¯
ïJ9æ_¤ð‚É£ç?Ï£LœžãA*âjž+NJÉøP¶ÒÉ6mùGï%§ÂkÇÌPL%íµÆÐ¹%tÑiñm*/u?¸ÀL÷?\ŸpŽÿzä®}ØXjñ‚—`ØÎÀºËäVWÈ÷OÁžk+C÷–ðôüÀ˜è+Û…–ï%ýo`„ ^DÇ‡ÉÁõ|q+ždì‹Ùx‹°
rÿáGy
²Î]õi~l}ÿ¼„†¿ý¶Ü}Ö•¡8]¹•H`˜Ž±4GôÛ%ò-ñ»Š­Ê:yÕÃ·ŒxÕÝ7òœÉûºÎÛ.½97ËM8™Fõt¦—“F—Ó™
)ÂçÝ—HøNˆ`È—‡0Ø§X~fLé­lôpbæºcnò.Ý“heHŠ¿·W³>êä+&.‘¿Ì<PàÉf_®®àë`›ê7º”òVÞŸn6*¯cÝå:Èâ[$‘Z–‹«9áÜÏÐÜÂðY5Çåd(‘»CEt=Ï8è—¼Ãüé…?PAx”¤•0;nø€Š²øwE+-rŠüdÒ^ù.ÎªÙÑýÎzaM\"§4ß¿pÃOÞÀm]ØÑîwÆÔk™VX[.L®
*¨$·%á¿¾K&èžÔ¿¾Km)‘ådb›Î¨ØõuÆØv]…‡qóŸ5¹›­¸©µ¹Õjin:Åþ\u—9sž„gí²t‹ÒªjVÄËK2]õ’Èæ?µ)lYºÈø]ìø*>‚%{ˆíå-¾‘Uw°6“	WÝ…¢»‹CbEø»ï\Á„Q§[’W/]œÊ­ô˜ÞÀæä‘‘‹™d-Ö†\ÑÅ÷½f!¼PZá™ÊzÐ
sìRõ,cðLÈâAHª^Àxý§‚BBo™|„K¥Ip#¯…Â(oø'Ï®ìÿËëý£ŸÞžìýôúÝþëÃ£ƒ‹žôíü©n,¼½P„¦ü˜lÏ³ƒ©Ù“íaRo“×.NìÁ6|zKå}]ÜÕfwnW¢Ðží½…ô(vûþçi‚¾:›h Š†|3
vE¥ÀÇ·‰<f!±CÁë~ æ¸“ÛU‚©;©×0ã§¾ïL®Ë0yÔ÷/<+;	(»^{ë`Q»±;îÏ®ò3tÜõ2pc,³÷¦IŽƒŒÏûWo‚¸Ó`:›’~Ü�'hÊ�úäA%,>ñØÇ�–fñ±l´þjïôuïÏgûôN‰Q[õµë¥žMŠm¶³Ç°³åqo
 UC½¹Â“5Å·ò_@	†· |PŸÉ¥3öüÛ-ò(?¹1>9qgî–I7ô™DÎÃKBïò;,‚=„­·EAã;Býô[ä?µÝÎ‹Õþw
À˜&ŽdÕ;æ—p|ï
Øó_|bixåMý ŽÆ;kØpâ^N¾œ~&Qàƒ ÷ŸZ—íç'íIzK»ƒÏé;0ê@Øû¶PKb>#ï_Ýd<ô‹ñ[d³·ÐÓÈ”ô·2˜é]SáU0$ÒÂÿå^ÉzœLáÆÚóµMõŽì4æüŒ©ïÀ’a¢úwYáuF­[<"Ÿƒe”'8)ïG»4tô¡Á"8ƒë+ê<…þ]n^:—X÷ùB…´t:ÌYöÜ‘­šÛq7/[ªÑÅˆ%»ñ†ñžkµ¾I[†ùñiýLþÊwžŽ†1¦É7Š–IŒS(éâ ?\wÛÂ�7à7:‘jÑë¬n[N'­‘,íeûrýòÅb¨‹G{èÉt—mÀõÕ5é*êBî)´³¹¾6l¹s´9× m
r×ZÎå
9þÔÚyñ¢Ýo÷«´s1e6"Q¬Q¢¨¸qJ{DÕs è{Ÿ\Ž“6çV
Q÷k~ë-a¿1J¸bK±¹^®(Ž—+ò“è%ž
úÐ›íãqÊ”æÎÎùþa÷,¼ÏûaáÅ°áÎY¼=:Ýí‘ƒ“½÷½óòöüôýéížœ¾=PäpYÔïÚ®¥Ltžr]øÁ–â4áô=n`fS½×G•âoG§‡Ý‹Ys~�(Jo¨µ4jº¶æ­2DÇ³~pº·O{Øª,úýýûã£î»´0€\?	Ð°kn®wÚƒßëöº	©`‹e‡KÚ.HêÎ<3¢þž@ŠÖb•ÈÆ~
5qÅp"Ðí·]ãûµU<P8ƒ¨íœœ‚07Ò6¶sÒ=î¦Ón¾ýûî.LªÅpÓÛ·Ý#óïºçÆ»’1K‡ÉP&ÖÆ÷ÝcrÜ½xøðfÎÞÁØÖÎÑþñîûsóäî÷öÏámúß$…O)Iñe¬bÜxi¶ÀüNãCwe¦—Õ ìõš}€?µSø5æ“oI5åfã-í¼ìÃ9eÊ&û;6
dOŸsCQf²êk`È½—ìÕöOÝ&}–šô’–—lÚÔÍjrìqÉêë»zæ8dU/˜1:ï¼ÇÕ(Þù®»wpNïÌŸpêŸf«0–mžÎâÅ6š³¸Á–)÷-©‘ï1MI¯DÔPg×[5 äãRóçÀ›Ôÿð'|ÐnübêL¶kíVM37*‹À‹5gµ¿	S—â©FÍP„ï$¾Ì&ñìš»Ë\¥i>`TÉøJ	?©ŽQzdŠ…FtL÷›¨¨³â§;{^£ÇPße
6¼mTj;]Ìõ'§0uNò¢ãÏ/)ÎÑýÈg?Ï¼€gì&ù†‹•ë¢AèMy‰‰Írâz'‹i}‰š"èÔRY_ú®²÷ªÚ‡ƒHJl üHÌ‚‹ÒfšŒuz±[ì’%§ô±fvc^Š6düK•zd~ûn¿»·ºÛ›Sr¼ÚÛë"ž˜¼Ý˜B›Dã-[!
¶¦Z(6œ—²—°ZxŠhÑÙÌ#Z¤¹i	‹ˆ4nýBŠBˆÖŠÆ*MOXM‘NÚêì€R½îµMe
Ý>±±Ë‰buÙG'ÍËVtPU@’Š„q%¹Þ%ˆiRÅ‰CØ Ð_5,˜ÔD®èœCZ9yôowœÖÒ9+àÛÈQ†Õy/é0o^n¤…K]CÎp\;©W@v£7Øíå&QeèføHv{Ä\uN[rôi(œðX—Ös&¤CŽ=ÄPjnêPJ,K"J(lƒ]I>®Ó"Ì÷heÅ™4}g]¥¡EN?VwZC¬K}–®h
&ü›þ7|™#ŒÃïË8Ütûh²‰,‚°»Üá™s‹	~lí*1çf3`Ü|]ª.zte¢ø²æœì\„žÍýÎ-
³£Ñl·ú'²>1ú­m€´³²Bº(æcxÙšs«i
]ºtf0¾©­ˆmÊMÊ™28³®
ÔŽˆÇÑäzÓ1öF>ß’öšÿ÷)‡±:÷0:›_Ð0ÖæÆZç—†ò7»<zIžµ	ðB,$–áûìç«°ý½ÑèÐy ˜6Å!¢§]›ÔùáqÜšBc¬±ŽØØjc­zc«Yc«bcëê­e­‰=olVoìõû‹Þéqmç&–“âo±woP
×·•Aæ¨nÐCÁ04ª$>å@Ñ$cA‡£ò˜K&H»Åô[·P”ë¡¸óïÇÎböcZÃBŠC²ÃÈRÕ„^!œK#”§Lw$*m)Vä›
d™”Bß_åcß©€Zº­½*Ü§¯—!—¯½ÉÐ»
¨$-xm§ÎÅyúVMMñ/U—zåçûÙØ
MÜ"Wñ±|Ö\£Ak*"òiTzSRškÖ–¦§Üq-'§rQÌt÷ÔvN™¯[GKsš$¯ÓôÜpÈÂ§hwÏT§ñÂD1ðÝ=ôKð€ËÇ!sQ¥ŸÐ_;>!Þ.½3³´ìˆ^[1é³<Ž/„öé’Ò,^òîQ·šç ~Å×RÓ÷ëÓ“ÞùéÑÙížo‘‹ýîùëwËäÍÁQoÿüb™üé`ÿr|º·w÷öÈ3³½û¾×;=±³‘‹r
Ö•µÜiy»ÌxX´Ë(Ìoö&öì7¡3-Sõ*á`bðîŠÆ¤Â]Bìk–~k[7"µÔó’MÑ^±¡A¢æíË¬õOhkV#šÐJ‡°ÀL:‘·ô‹ÆMh+)^æ˜‡dÄŽž`…\ƒd¬+Œ¥Tè<T«˜[–Òi#sÕÍMðåüÆÄæb¥@«ÔÙ*BA¦È?9™ü2Ì¢-ŠõÔ?$8r¥œ>‡ôËqTÒúJBÖš4U«–&à«æØjÙÒVlWNRÃêAkUT7°DµÅS¹Åò:9b#ì\¸ã™“®‚IÏË€4êÉ5€¥åj»b-b×T‹øÎMRŽà¯,7ÍMsÖj´µ{5¢›i@ª
Å£ƒ@À‰bzÁÔ„¬cpf#…žÒu6Š
¤.3$T¡õ§¦ôÔFÀ!‚E¸NVEþ”‚céæV]"‚T¶5Ì~MWÓRÒƒˆ™&`9øß™aF,À˜Â‹Ò»ÚóGÏ]Ìáåó­4áéPAu�hª:%©*á`öuÖƒô'Ï½!Çhn²•µÌ5î…U@%¨ª;üá‡ƒÂ1Õ…,S;Â»û(3¹'Å<íKçë)&A_Ç¨´c“q17Š06­O$WàH~±,f´Ej›`¡:»fgé«qövÌ‘¢Š)É³bù‰rîíž`DîÅ4ta4ra_sÁ}•F\¼ÅØ#£g__s¡´Ûëîíÿ´·ßëýú¨77ºnúíÑê{nìxÔzµr€Rµ§´–N¥ƒ<Š¯™‹>MJË^pÃb ©I‚6¤>´”žÒy!—ÜNÚ²×"Uy]sQAŽàûA¹	TýÊBæV„…¿/Ö§¢“ÎfP(•MhXƒVÌ\.0ÛzK\B)Jrè‡¼Naè‹Â±¸C9¼x{{Ù1Öfˆ	–2:,LF7‚Ë'¥
þÝó|ècRÈx˜ü•õg¥Óš‹lv3FŸ!»L
Xž‹Ç‰f“+PGIr¨rƒvERD‡Ê™?‹¬l[”Ê¾%¼_™¶ý`ê0
7o	¼ÊG¶Áÿ½¸“«Ò©^Ÿ€Œ^Ùý5ÿêúH™ W@ç¡fê[e€X5Rre¸:¥&IN•Et§ÔDbÍ(ý`Ç“]˜G“æ±)Ýa�”J.+`)ñfbOv°{j¦ûímrüªäÊ¸m‰Ü–ûÐøŠÂ).:¾Rvœ|ù‹ðc¡Gó3d‡Ìóµ|×†…&L”³PÎ³
¡s›_KÝY©¿Š´·Õ8Éq·w~ð/XoTOÔ˜NÞ¾}ß=!õÈ	t´×ûøS×ºçKRÖ]6J)U\¯lž(øË
¹•#ØÑ—“8åQ:%œ]ôºC¥ÕÖmÍJÕ_4Uæ¹¢ëš¾^¡€o”Ý4vC[”£ äØØ
X)XM]]ûÕ ¨;¡”Cß»&×¢YÅÜÚÎÒ ÇîgÖ¡òMÑu&MîØáH‚8;1Œ­§ãß¶1{’ðçšä�&åggL|DÏ
Ñ
ÎÞÔ‡ãv”Þ¦™u&ƒ	ÎAŸæÁ<Â•Rëù§ù•í| Æó|nE»%±$ë)šÚ¬£ï$äÜ¡ê:¦ÞfÐqšùÕqøª£¢fîç‚a|ŽñüKþÐbCAfJËy@F+]êÌ9&sZ§×M¹6/nYÒ‰p„‰º�3eQ:EÂî¥‘›y‰gq»€w+>ñmÆé%êÊOH5 )a]ö5V×;¥ç–C´H®çÿJSM0%º®`«æŽ´7J=á“uÇe=£kU³ÃUÁKû#ŠYí5Ðin#ò:ðgãId,‡•e¾êá2ñŒµ½’ÁS‡µwŸŸ„N5JYÏ/È+ëæ’WåÍ,äÀ	çæj>¸ìn˜�f4£YŸaN×[ËdÕ�°dx­DúaÕÀ’ÎÆví›‰`i©1YhÂ°s³ƒ*ÍbN¾èd«òœÑ&S¢xóo‡ìÍÜ~•¾˜.¿×‡hˆà†õ—"W
]†ÞØ¸%üSBvI">h9“éFo}áøæãé9/üd(b !†uNrÀæ´?rhsöÚhôtWB0Ï_X. F©’Ê*”
aí�»gN¹ƒ=¢}F-P¼ðÐ¤ÜI9,GŽW,ýë­rÕPF„ø&j²WUõSpFÏ\<6Ù	ÏÎ(kl#eïÔúìº”ŸY¿²|zn`¾ËèJÀ”ö³rN·>� Ðz)9Mÿ;j’¤sML¾ù«`�Ö¥ª'$»,ìMç6åÖº]<
Ågr~Î”–„Áˆ._+Vñâðñ­ãôµ8ÃòªNvƒ³[X™^èD£NÎïi·¤Ç|þ^;qaÞMZp6KFôGÍž5B\ˆ_¤ÌžÎ>‡eD3Ë1oÓJŸú“]ìÜÝÙNOV$=³ÂIò—!ùWlÛ‹ÎB7b ÝøžgÏ„jIb	›&Ym ÞàRá°üö[Û&„~äÿK…£ôÛmrB‹üÔ%·ÂŠšZvY·ìB2–ªm•À$eå^¤…‹ž9CZ2¬_V•Õã%e÷…š8‰˜¦-ÇKŒ×¹il’ü_/W˜ˆ¢€99ùx1·Šä½-}¼NùJI¾ÒSIÀŽŒ$
Ú)zb:2ßÐ†.4G~má«øá(~"{8øWoRõÝ¬%½ƒû—ñr
–G?>Ï©´s´½UêåâmÏÓTÒÑ¾?s³~ÒOî&¹yóäÚfí¦B¿$à§ 6)¼@+•èJV¾!*/>aí†”aÜ#²qvF½â§‘à¯h0Ç�sPql©ÆÖÿ•ÈÉ`©ÿ£V¥—ö,Žû\GÿþïåÉmšæ`ä„Ý¸ÞBÄÉÚßÿí?,Ää2„ƒú¤	î¾ÌZ],r.
IiÖ(¦ga0u®†h¥0	}Ñ§…É/–MÁÊ�VÝAco²]«ÌRÇÎçíZg­êcQìNám0uÌ¥ºUî-Ï%¡;¥�Õ
ä[,Ù•%˜$uð¬ÅÜü5v”®­Õ6I‘uj°%[°ÿ¸øh‚—’_•j¸!PnÓ_…è:}ü‹ìÒ‡»HŸ¨J9oQ»UvØÀçÐÉô»’Ù´)"˜OEsêfŸ€Ž»iÄ$éŒ©‡Ìµ¼ž%×{“IuFÁc
Ñü½3&GÌ\ßõ"‡½ë 
&W×ÎTi/RÇâË/K>¹˜y›²Ü >ú@mçûqó«• ¹¬5€
íÚY ¨×tË½É÷@ßgc-£œèëèâb˜*ˆ&Ýåjö€à!ãÉÆwØ®ôÃÌ;Š)"ŒÅÍŸNˆÖŸ\œÔÀ€ù±p¬øõ=nÌa|!ÃÕ;eðÒc¤éiL†°BO­–Y‚3à”³[2¬ò»öfÑŒÑÊ­›SbNŸ;^Àyš—§�,CO€_QÇÛð¡×Ê´Rn¤Á?ç?kJ TÞ–D>¨°³EzÝÝý#Âx„áÙþ9Âg\^d®àÁ\†Ñ—>øD,4®á×Ò"®Ì˜’:YD<IÒ`§b¬ˆ¦©wíÛTéÑ7µÉZ2—ñQ4#™þ¤w¬°9Ü§±	ÆÉ·ÿ"™G«š?sµkSÈ¾áÍ*Úuç-ÙÕ
b×ü	1sÍ^÷ðÂ‚´BòÓ…„¨cuŸ›âELÕ“ô“jU[É:>‚©Þ_\tÄãÅ9¼ Ëë=-ÄW+´>G=(ýhÆÁ$(bƒîT®e˜±ÂjlX:æ*–£zÝÊªãTQ´Ò¥E§›7¡¦”¾�}a|43³´’1oíZ“{¡­íyßZêðtqû¶ÊÞ¤ª>/½¯«JKñlé<ZÕZÒù¯ìZ²sÆØ‚îŠUØ(ÍØ´ÿôÖ"ŸÛHù\µún‹zc…êoö¯Ìm–×mÏi‹õã>JÊÊ-Þºc«$F'Ï(àÑJÅ?–ƒÓjuV.¯rq»éár®nf*Es:íƒYª†²TH\/^ºDvXÈJ—9óÚ‹—˜çžÈhVéíÅ+Kw/I’s´Ä²ÞÕRcµY†»(."Û½x%ÙïÒS¥ZSIn|¿ÛdÊËš¢™óEÎm“H_¼
®E>keæ‹ÑtKÕšæ9øy†V©{Õ<–MØ/½ÝÞû™7¡#$nÞn.Ä$'ðLž¹ƒ’So$2%= Iùª+ˆÍwìÒõOVˆ>¦÷?Œ•³˜Ä=×wcWÊ ©G^änË¤‚ö–\Vÿ#ÒÓÅg!é·úùÐóÇ[~k°�d\P¯ž:~t±Î9½ÄöŠ´ÛðJ,ƒ˜'À|r¢Òƒ'X½ì²u…‰#7š9·Û%Õ‰“~<ã}¹è~©ž÷ý¡×¯×ÝÝ"GÝ³Óóî	ÅÎÎOÿ¼Xpï%Ž=Vù²çôøÎ4�Ò@ì‡Ëö2Ù–ÅFñ6öÏ¿=w#¥†ÂGERË?(ÍAØä-ò¼¼b}Nj‰-=UO£Bæ³g’I—U+•ß™k,_­]Ú§Ié¶¥âšå>/ªú¯ë Il…»°¡úNhU×`ÚØÈÕ`J­«ùêè@Uà¾Š‚]™ƒdð*ÅÍúBà"h‰ÆÕ!ZtZëÛIþaed·ªÔÍÕã¤”âw2#k+Ï·ž{Þ’ÄÖ±A'Ô@]ÜJ+¬4ÈNŸžr'ai”d¢Žh&¯n¬7±U+Îœ/®’æŽÝ¡7SGR9“Ø™ç:ö>y±Æ—¡-XD‡\#ÞÍ2q ÑeØŒ#ü	$E8Í†³…úÝhì!ˆLã:˜’h:±üh«\"ˆ¢Š"€äQpðÊîDJêq5É¡zä†ºÃ=„ß'r (]â¢ÜˆûºÝd:„é
aâdV¼Gõ·ïÒŠWØµÃ`ªêõVLccU&…‚TÁ&<š¤£	Ú¸ÃÂÐþŒw,zn õ‹#ùi@G8€_òaÄ5š?¦}oû	t¹+W{s0¢¿MÕ9>_zã+ˆ…ƒí/bT×	ÓŽo×(Ý0RÑé ¹°œdÿúÈf8Ç›ˆŠ‘êh›&Ü2aê7*u½ø^¤à¤¯bçTÌz#9|+æªÍÁ£	yÛÓÂ}J)@pÒ¬v¶Þv+;ÛÉ!Ø±9‹ÎId¸ÙŒLÊìã©ZEms>±/_ÕõN
2fÔ–e#+É¬•#>¸3#ñq´WY‹¦“_‹ÒNü+Rë¹áÔ‰Po­ÓÃÎvCdþ©í¹—ÎÌ…5Ó0Áyñàîêz¥&@qCpƒÉš†^è^ƒÚÓ¨uö¼ô)|º@-có‰3÷¿ÈkÛÜèõœÉKà‚rƒ‹µaòéº0²(ÓÀc<Sñ¦ôLèýTDo¬Z…ô-H”6\Åœ¼ÆRÕ@ÏÖT'ÆËÜ)œ®tC¬üQ³èDƒnõ·W*aLÛ§öì´˜¨…Ÿ£WÍ­M¦vLõÇ»MEÎ³w…LaÞ¦ÞÄÈ<§_Ô-¬úìÑf@ãÓB#öþ>öv,Š¸±Fqh[  C�M‚¡lÙ¸rì+2pÇeþJ+§…¶e‹.¢Q‘ÛVjšèN»QMÖkjõ9óÙuÃ‘y>Ùóà˜í;áÌûJ_[xºƒèël]?÷Öt„ÿtÖÃy~Ä¨Øô¬Þþ¬õ6éðW(¿®(×™*\tÅê›+äOnÿ4?ÔCÿiU¿É®Ã1Æl‹|]2íxÃûf)Ehã±´¼Çën…ŽÒÃoFŸË2õ$ÙtÖè„ØD=îñÑ¯P¥SMm5¥ùÏ¨Õ‰Ló×©Ï=3ª¢ºÑÓÇFw«;Æ^)â‚ºvºòa¿MNØ¨‚R'rÂßµ:Õõ»Vg¸~ÕZ=\œž'òÒE(f9ñ¿ÎýN¿ëdx=–NfýƒâkTßJ™—„újIÕ¡Ë
—xu9æ€\™)%Ü3ÎÅm"†N4qÎPüE'a‹aNÓÆ&I"TÍ²ÐßÞ�©¿½‘éž¢Âi”ðj`ŸB¯Q‡2 ÓëAkü êl**£\Wg¤J°Äœò¯ IåÃ&ôAšè“ç-ïùçRíxHÆ±VAéycâ;p¾_9ÈÝ¢Ùœ@!}:†1Ð¿zãkø¹ò³› ÍÉã@šé344nè]c[ÄÁÖÒJ4cÄg>Â]DÞþãœÐAFæ70èZ1§”A+Gª)ÔcU<æGÁ?x®.~0Ä³S˜"¶PÄ<ÂÙ³MŠ
ˆâï‡—€»gW-ãÖAŠZ&}üI¾%uŽî5ž}g´dŠbo©¶êa}¿qxä†xS1‚öùŠcõÞlgrK;wÓD�/Ê]Û¥WM”©*òdêQM‰YkÄ©ÅµÓX<šö.K‡¶³åð˜³<“4œqBa¯îÃnÈ*Îô‚„ô4¨xZÅ#)ƒ)9`î13d™tgñ(áß¾ÄT<DÀûªd«dÚÇjhÒhf`Ë¢QÆ^ÉyØÆó°­e¨tF–N˜âé˜Å5ØXr³ëûëÿjŸU9;ŒóªÁ†é©{W£Ø.å1Maâ› ¢ñt‰Æ¦"8ñCEÅš7lìÕl0¯‡Îí©ùÁäÊ2
‡=ÐiÀy±å3c˜“Qµ×ÜºNOLfc7ôVÝ[e×ë*Ô¥w)­ƒ~E@ibòÀÙá‘Õ’ƒ°R^rŠ).
ÂŒÌ0'.ý
§ˆüp°KþþoÿAN}w¤@‹Ë,75Ó´`vÏúc/ŽÝán
zP»Hå¥ZRN‚Ô%¤I~=—"#¢’V»×›øØºiì¢É-Æm«sq¥÷Øy§@<ó/h^�nNÿF*3µÌ^*d-]¹ l#h&Rí½ábAöêê²sÕú–TR†OpeùwÕDçmæä%žò”„Ç(Ýs¥›—ÛM-Y°	IÑy‹Ä'fR|Ÿ„ÛÁØåI÷€y Œ´Ú`µÔÈÅlL3_;á¦‚Rèþ^øÑ2ÞìøU…¦«DMü
MQ£	ÙÇU+I{ÉTSµ7mÍÙõÖÊó–Ñ¥L.yê‹´Ê^h,éc'$õÔy¬Ö4»ºØ³rú"±ÒL±g²ÖÀ<h’¨§d-¸½%ò†,W¢œ)ë‡Ë,}¡I–¨�8J‰ñžœÑùò«ŒÏZV•¦ØPËÇ¨ÑYË`o+Â$
c”ªß¬æ(Ø–ð[i‡Y²ƒôVþX)Ã‹1²­¾{èkU¥°È4ÄMÑ]ÔüÙé;±#�­T¨Œ¥¥^äD)8Av»n ÔJbˆ¸'Axeÿ:ËDØ%‹×…HML³ŒgÁïüø1øñ…#àHT#KîB¿˜=rÏ»šMÐùdœ9³ýH]ÅgÊ‰ò„4ù*ñ^ ­ïžŽû—dÑ…ì+¾ÒÃ¯éøsü:¦VÇe÷Ý"¬FE÷(6
ê'Ù¦Þìà’Ä,ô€9G1
=FSrüŠ¥ã2^jå¬Vw‹Ò=JââQ’Uî6‚cð Ê‚À¬1‡þñ·ÿñ?Q8 se‡aÏÿ-aëM¯[ï·Õ~çÿÁÿÏ 1çÊ­Âþÿïb>ë¯ý�'„Y8èà+§@:	¹“`ÌO‚ñü'4œ;ÆÅƒ`ŒÁøUógwâÑ·ŸîP‘‡Â_ÿorÇ¦íŸüL0Þ`02¡Çí“ß’gätŠÖM/˜8~E[’)¾C|Î¸C+Æk9ú¸oÉ¾þÔ$ïC‡¸o�þª'“c²ŒÛØÅU«î¥<Äa=òÜ<¯—‰3ŸÀ)mÐÄ*]2)e�ä›ù|æke6äªÑ7…Ï²›Æ:5Öê-Ô8¦d—˜	0v¥e)Ð5Ã‰¥ âæ0’©ð]gˆTº¾óÙÖvî€"*ØM¾DCÆ,Nc™0œÃgä„bV•l(d'5‚utmƒ«A¡§Ã•^/¢L6û^¬Ô¢Fóž'„Oq.8ååBdþïÿöÿý¿ÿ
kd–nz7ûÙ¡gµüí?ÿO~<ð¿àŸ÷äõÌ8[¹ÆÍ$c%Ý¦VZ>õ¹iiÍ-‹ˆ†ÿí¿ÓrÔn¾•Jµ7AxM‰“†_“¯`~ð]—ÞÄ2Päµ3?Ü½Ôœ:ÃdŽõÎ2©µjK÷[­…KfÐ£XnUö¢v¥µu/b°¤÷ék`Ql²Îëå}]ü‘Â:/ÑçÈ6KkËÒw–É¹;8Âk'¦fbTkâwõz7Û¦Ñ“¹
úpD
|7Z¢Å`óß%�k»A�,vBcóŠ÷ÀcŠßý7Âá¼$–Ö`«å/yÿ&@´g>¾;í^ò•¦wÉ-Bç’¯Ù7äÈbÇð³®W”ƒ]ÂÏ’þ’fØUÍ¡Ù˜½•ÀõË‹-êwÉŒ³J2èR´âä–´€hÜ©&ŠÒ×ZËèiÅìªFk1ëïÿÇÿGOÂ0º€F[Ê\F¹ß8óe.²lˆ/cX›Lý
X©•ÉŠëðÅÏ˜Y&AÑÊ`_wú¥ï1…!(*RqÍ(6àoÒWû‚dÎé=wA"d7ç(J¸ƒ	ªäb¤®øžíÝf©9is¦ÌLÉßg'¬›ßª ½'9rÆá²Â¤%'Ä­>—ÂÏýãoÿõÿ!=šóGVR!h×UGa4‹àu| ‹çvÕH®D_œÕMáïŒ×MÀë¦¿8¯Ëªa·›>œÛáýÎîžBŠ} ‹K­o¦:®î†0å
\^&§ŸÌ>:ÞŠØÇåzý?S=ïp4‹fÑ/ âe–Ís=KÊËSgvø!cv“0»É/ÎìÄ:†“‡ó:œ¢ß$¯³hÇPÉÔÆwt6
â B\grk0À$f¤){Xcî‹JlSåKé vŸ¸quGÃ"}Oûb/¸ž!–´yä
ÌBÊÙ²¤ÜìÜÓ»ÁU0t0›"û¸–·¤làß³«0&¢˜`fï¨2*ã•IkV·B÷îÙÝÍ 6¶k?L®í*·„®¿]›ð7m2&ðÖÄ‰¦Îýeæ„¹´b½v•xÀIØ^|"»˜Â¿%¬€è´>Å;˜bÓSË#Õ_1Ü4˜hŠUv÷Q¤ù¯Ù‚}¼Ï{õ(@þˆý“B”}B¼Ëz6EòvúQàÏb—x“È
îå•µI&¨Å¦¡‘Ÿ¶vK:ovv…ä­Ð#od2I'À¾@ó´^?Í[tøN:05y¼…<Æâ±«ÃÕ-²wzøþxÿ„œíŸì½?|òÖ®6ÌmIÁGûâ%´XA0 Œ&E]áXr6ÏSuÒ¾ÞIK—~ž"pXÐ_äuK$©½ùt7;h,¥£ÖßO®®œQr'ˆ§d…œ¹“áìz6¹"»N8““<‹ÕxºªKµhd5FI	BL¼g3CÏ
S‚w8Étm©ú¤ÇÙ1 t1t.ì¯ú,úäø3wûnN4%^$([pì±‡ê)†mLÃ€¦0î´7Ü®½†)
F[)Å\œrüÕervJN²¹¹Lv»=òÆ›8š2qåS/I]5ÇÆ)AQ™
f1->	&Êó|>›/›6{ÞÔ}(mF®ÜÙ‚ðz@¦v„—AŒ0êÃ'í©ïqÈ„Î»
¨gûe0E©ˆOI
6BmwCýð�
=ôF,lbéå
»Ýº½³ÓÚl¨úÙ,ŒNqlÕÛÁ­XÛ¡²¾}ŠÒ¥ >ðBz.þ¬ÞìP)h7m•þ™ž¾•[;r¼ÉäÖ©íà
ñxWÈ[gŒµÇzîõÄ»65ùr…QnÅm­þA“$oY™¿â,ºÃ4×—tàƒŽï†q½FQ©“i‚'
—‹´8v,6Yõ»jg±"¤YUÚdíJ ¤X‹”‚þÛWÙá|©©ú¬€¯ËG7m¤;<Ë^,Ô¦ÝÌc˜4’X”1Ùæ—Rir„Ë“€© $¥.UÂ¼”îòB5^9‘}"èA¤Õ²H[!kq²¥ô46síDÈZfL¼¬—É˜xî“ÁR#ÊV¹¸Y´ö@}¢«SB
!—Çi=NÉqÄßÒ­ïL#N‡¾{©B×y\GYWôeTð„TÃe‚—dØÃ§"0[ã—+ñèi_Ž2ÎÓ¿qj~±:¸}ü§ñ+*ÿ'
.=Xfï©»À]FU÷Zßu^|J¹×^Òú»bÇ™ÀÛ·„ÿ‘Âü«ÞlfkhJ0Þ$šÿu5Ì
Q#3œÑFû2²j4†›ë7ßœ?fifÑœ.MXh´b´„&tÇLm‡v‡¢UZÔ^V¼QÝ|Ñêi@uÄÒ4T~ØÈÃ'H`ÿÍ]¬Õ›xß¬"‡ç ByÒ|¸?‚ÜÑ~&Äµ{û€µPþWX¨ŒLìV7Î ÈÊ0dCŠGwë#ðX4å¾)`™ø1mžW&¼»b0¿ÜB1Ê\Ý¯ÍY’8gcçÔÂÙùj›…}ü©	HûivPÃ¦•-Ú
‚^]	)
ü³E÷ï-·–tœ8ŠP
#Ç4š·qìNP@¡®ŠËìç™3YPTÿ¼&´‚eGûU~´VQ7¶p%U—+ìm–Š#ük'gÅ«Bù‡¬ÖCNá+Õ‚H«>XìÿŠËûf¶q%]PòÁRÈ™—Á
OÍ"àACývô …(M{Iž«íüýßÿJzûçÚ??xspØ½8°‹7y ßUK|´qUŒ€¡ö’®M¾cÿF·}·QHÝÌ¾Ž>ira3Ðrg˜Z€È4uÈÄ‰^Ý$žOñ»¹ž}qvˆVøeâ`Eqjózø!RwÓ‘ig[7×ÊŠT´–ÛÛ¨mi‘|YúJî‰\Û"ßw÷~è‘Ãýóï»d…\¼~·¿÷þhÿÂÎ!]»?Ïüû#»Ã!‰#w8óÝgäê/êŒÜ9qÛ½B¾w†7ŽOzÎÈ™fyé‹sE®þ\‘é¼üâÎÈ„Ì«{$/„'è–<&C8z—ƒ}ß½áÚñ—Ñ%éE#ÄùÝ-ùtnIfÆ"Ç3ßñ“LQë³&Sš<²|â_Øƒù;Eù„ëu_MíO†óQ<øk¥§G÷°Šçw³¢é«ÜFÏ}³máˆ}ç bšf¯)–ÂÏâE’2å	¼²	H•kqäÙ':Þì#Vã­Í½J—-)³?»{‘°åžb¤Bxûô>_7ì{1ªY\"UFÄ-ÀÛ›L\Äpn¼xD0	î“7œÁ«®B7ŠØÀHäS~ùE{ƒ±PrrŒµa~ÜTÆÀ¦J®”„~ä¦²¿A.þ«{#sè¤?Ú8rÔ3(ëÁHë¼ «£¢çfÚX×Ÿ�B9›hœs†›
jÉæT…-&Lék šƒ¦Gë•ŠÃ!’5Ì	Â¿œ0ÒhÝð}Æ‹	åC7víÍœÜ¡½¢‚^Œ{­ÙwîdH¿1ØÂ´	-f <©m/¿¿UBhP13‚›ÌWtx	¯ºÿFÛ½½Ð0>d™htc•<8CÄÁ…SH¼Ko€š"§KmšÖ¼ uÖw©ËCoo{“íšÁ%2v>o×Ú&ÇI&š¦A^½ª}jèEhŸnKŒR_eF)}#EI×°S˜Ìó~Š¢vAì9ã=7›°%ò‘ñÆAÍ÷ñz}ÝdâÖþ®Ÿ@YBP©vÎèÀ‘òêdÀ„wZºy"žÙ…jÖÉ:oñï'AŒ¥q‚½gP[\VWçSý£ÔZ¯¶Ô7i–àMF²!^Q›3eî¦dóBØ˜’ìòã>š1f¢â4•pœ©Ó€ÿ7É[†rÌ¬ÁÜ<ÏwŽÝ	{Ï½fYqÊÍøÊÙ•(‘¶³¯oÁ?oÞuOÐ
t|pBVÈñÁÑþEïôdŸìØ¦�Á‚¥ön™ÚÇÐ~©¸tÚÿ™l*¯ÝážÛß!g v]eÚ|î`1ë²{—¦-“Ko›Çs|v„8•W\rVVh†}Š0óém•˜Ñ€.à þ2Ð!I<rA‹�ú5ÿ…°Ÿê{gg0ƒ'žïxäÂee_ÏÎN–$3áEgÓÉþ„nc˜â;GþN™ö¥ãGîw’&†Ó){oùñ|—Qô–50N’rÝy…`ì£&Ý6õô-$­f»S+mŒÖ°I&äP|°ÿÛY'¿M_W¨EÊûâxÃ7a0u
úíŒR
Äþ*ý¥IßxÏnÙ"ü—[V4á‚p1ÔCR1~ìxÐ‡Ø8t:C§îzkY>ÎF¾ÿKÒ!â‰zÁžHs‹i‹Ë6e]fsGJ”(.¥»‘ä‹üø•ö±ÒÌÕ“Ù}Õ¤ÝÅ÷fŽßäµ¤üoG¤0xø¶½'.“¯˜PN‹‰1åúÌ›Å?ß£ìG^Œ\Ái¬
3•Þ;ôðDŽƒFH.a™S÷:F¶ò±Hg|X—V¿£úÓâ’Z§iýWPq­ê¿Â}%`’ª®0µdYÀP§kªO[¥¨•N!4i5­ÀL••HDNÎûbË«UÍZ¢i2ýZæXzƒ§± u%‰!§ýUæ\Xº´ƒÍ1šõ1øàÚ%6•n›g©ÅŠï Mï5%ÕµÂ£´ÞºRC_ÕÄ¿öqn±XøœÜeÜ,¸™�‰¨Ö
ÏK`çÜðÀŠb=¯2û4¯ö`2hâyn~Bƒk8šó)¯ðV85KÔ—êÕÚ;Z,­q‚Ï,mÿxEn|±C‰¯Ãq0tüÓ©;©S¡G[Ž`â|ò®0®”)µ!¬¨Î¢¯0Wã¥®mJéh¥-$/±o:RÎÞyXaSUùÒ><4ƒ)F2‡XÒ<ÏïÒ>Ú•9Õ0 ý[7W‡”¡6s×ñAáŒ¼„m(	S÷Û"1þ®ë¸–·Ô½Xo=6q‰#
œ,À&i%[²;»vŠGÎk7fz¶÷f.:ªêªT#L1X&ìjIx‹Æ™ð¦«e”Ö”¨J½øMíAÊÌ9ÁàÜ½vÆÂ2i­8 =ñµÉÆòïh7©a…ÂPÔˆså„Ü³Ë
6Ì
±¿~
¼f¼Â±såaª1ææâH}^ÅùÐ1ÈªdÐ‘Ks«ò@ÑP†]Îuk™_Êúœèv2 &ÈôÉ‰{ƒbÌÚ>žõÞ6ÎÎO¿o|]ò~PúQÍÜX[©d[ÖJ‰Q€œôKß÷õUŒ/ý ëhhû–œÉ0@Gþ	(DKæ·ó‘lü/³á@Gt€7ÜÊÆ¯³'ÞJÿÒÝÍ‡Ž·W3I£‹`‹ÔÎÞ÷º'okÚ[±ºx¹}Ì›Ò$Q%&**Ó…a"2)“MÌú¨{…3ÞoIMºç†3=aånq*Û°ƒ“:·Å+î[Z’˜+’6èz³L"S+ X\œr©z©M}/®ÿ¡÷‡%¬]!6¤½S7b­þþä¬‹YKºÙq£AèM™7ñ£œËr–¹V-¤ûS½Æ·Ï$©’Ö¥^=MŽA#vÆÓ-:1ÍIpS_Ò>€æžò‚çLRzÓ¯%
¼:ÔÓ§CáŽG›yïü¸‡�lzÐ„n—8‹|¾éÃ¡ÓÐ@nõâ¦ð›{@Ãéfk²¿¨•VÿˆûaõÜa·ú£(<"rÝì“Å£ü,e;V ûÈKð&p–>Êÿ´zŒ“Jò¨˜³çõ['ÄÜ0»ŒÙb¦÷%;ZùªÚÑû“îÍ<ÛÝ?zLv»îžZ¥ ·ôíšÛî—(Nîjýã;5š©sãx1ö/Üð,K“Ax°”®Ú0=N£Ú²p^&jtl'{x­û	7éþä2i6›øåú6zÅÇn­ÕkœËó:IÅ5…aŠí&mˆÆ©‚ú†zÎt:öX\0‹¹s*÷0Ó—Éj¤eÌŸJ	Ì«€ë•‘OæUüÒÚn– †§éwCÏ½¤½È©w™X~èÖN! «U;5¾¡Ôyï.fcYˆ^ˆ¼ÅP1™ÀXs'Û!þUGV­´ië¿/¶´ÕNTre`Î±}5vofìdÞËÄäYOlžò€µ&TîqÉ–]0”f&e+[RÜéRÅÖü,«çö�U7aêH»-¡RtD
`m¨|­²Y¬l¶ä„÷‹’[ÉMNýçDgB}O+*KÜÖOMYB•mU÷¾Mhj‹ö4ñª/¤§•I/³"®lé/ùíQ)P€3˜›åenGïq™Ý†5æ¢
žšE¤%†Ž4‚GP×óA+RÃZ‰Ú wÁèÞxŸÝa…˜Ü3×bT&à¤¬i™|ÓR¦G¼YÕê¤{›Š\+Ü »ûxÄËújOºŠhš§&âtŠÕ$¬ŠûaT,âŒø³‰a	YPéŽðo8¾ÆÓY8q1µz*U|-w1Þð�C•AÔŽA®ŸÐÍm=nàæê•4fŽ,ue8LŠ,%lŒ5Uª:ßBY¶zý¢B¡2ÇŸ=*Ó~V;£_~û†zõ+¥Ï¼ÐæÆÏ&sæÏ¢×^8ðS½jý¾ÔA&@«ÏÂ2
¬°L{Z~Âèa×4Ý`^!˜äã'0l"`W%'–L:›'l‚6¯œP‡UèŠÆÌS¬Uˆ3_ž‚*GwîâV¦$]"Ø
+à”&§‘Ð²ÚG4ç„hóz-22l`
Ò
´TëA
äÉ½=þœ}f¯
kýŒ¬¶¾m9îÏ®”M/'óyp@Ö[ßèF¢NÃT¤¼wÕ”4\ànb1Ü5˜E[ùÒ”Ìw‹ßãæâ>·d,^9.e6‚¾€Ó?Íþ¡°dX,&‰­#õo–ž`÷ÈOsÕ#ë4(V¦Í*{	·ÞYêj¨–u”lÁìù*Q±W
YW¿Î¦Mü1‡eáÅ–žÝ¨ŸÂ
A\xQ€„E‹ùÿyÚÑ%ü'W.ñße>=ÀVÄãkHE¤dkj=É¥H.Ì[à,s†>N‚\aZ­3å
SoxÌ8âYª(Ü.ì{ãCšø<¼$šŽ˜Žg	Noé–™@Þ1“Zù3×¢Ä(BµŠÇÃË$]V1˜ë†aáëø‚ßpÞ¤AÝ_84P3ý*;R Î%FâB
p–¹ÔŠ
hŠ¾«ž,iÈx>>+Q­=«÷áÝc4Wžc¬ÒCêÅ£ö`s¡—W¿–T@;©	òpwiñBâ†?¹PÉ’Í‹šÉåÄj6%ó€uù®Õ*³IM9ü Úõ|�®xa¥å¡²ÕDe}y\@¼Î=ôÜN²ä“gb9(JhÆÌlLaR°•1Cžö¥cl¢%?ç!)øm>Ã[éÑìŠÎšFH!@ÂµkŒÁW¶Žv-è)¡¾ÕR—ÿ���ÿÿì}ërÛX¶Þ«ìæñtS3&uw«Ém«ÛjÉ¶Ž$ÏÌ)WW¼%B$š Á@Ëªò'ùÊù“©JU#•§™'È#d­}6€}IÙn·ÑÕ–Dû²öÚëú-~ÝVòaªËŸøåWžáQbð«CÅ¢ÅJ¥¢]A²aÊ
µû¬áRpèÁ0®êW2îÇ¸Šòh,ù‚""‹ýYÙ™¸ÆF
©’ÕU±ø]†½›ÇÊ±_ÕÐÝÐUg¶	$
ZWXÓæ6¦ËÌm”Zé”ÞX«¿, '™Í
|nÌÏ´É"ïÊ£è€;‘²ý¢ò+v
kR&Ç%mÔæQ¯Û2%‰í]|À�F:*Wþ|—¼CpÎƒ[q<‹�É•î”ö9ÙÆCòÝÚw+wïÜHã¾ÑÝ—K®Óq¿&ä˜„Æ9U¤µåº	è3yg&~ˆK.Û\y„j¬¬¹9UtôÃÙ¸’D"{¯¼èÎ£‚¸N.óîHÕ–c‹Ô(.)¨O1TçpªºDò#gÎüÑ|8Só°4KÞèf}/é’|·}a¸$)©AÇ’ñ¨ŸIÞãEf‚9<>ä
˜ÝRê†Wù°’õ‚•ÈZ2Ê:Õ:]ø¦|w²GÑÁGŠ@é|jÔÏæ™c1¢ŒÁg¢Õn½#žè1JÿêÜNw7KÍ|aòúÍ .KÖ#ò0B¸õXVG1˜Ú™¦ª(íó21<Ø"oÿYo;¬YNñ)âÃQeÒÇéû†q®¶½Â®¼„DéÚ|ÝR#"70ð2¬ã•'×¡zRvŸ¸­Þ¥çQ5BÚí)Ô%QÇÇB‘à“Í,Tõ=YÜ§7p”ñWØÒ:Zç-Lë°(RÅµºJ86]Õ„îÝ¯{œYí%8‘¸t¬·¿¬ÍUª­žJ«z¡o¤-59díøç]|Æ%!û„åPùµšk™¾·LõÈÜÞyÉLš2Ýð$RÿVJù?:’ËÉÅ•^£^w>äèvåðKÌcæÓæ]IU³y8í	=ò¬õPç"·D%ÄÝ:éÞyx»˜FØËŠÄüÉHzÊþ’¤Xï,Í-Kzèì,Ýt¥aä›JËß	¿û½nô[‘‚hí‰«DÉ±òguŒcS& <ØÙJÃÝ«‘Øp¸}V‚ï™mÌd»~7O^6­6*Î•0î·.È¢ŠÁø² _Ås¾Z´%�Å–ÅKï›ÎÁO›rÔ
OmÌKï‹›zóS_ŽÚŒ§zsU7_-'J*TÈ¹jVb%Åú±Sc2eÎSÅÎ–©¾^²6è‡±°h}¿ýê´|ˆÞ–Ó6EAa®QdoöÃ)Fè'³Ð+Š¢YÆf¹;æn*à&Ds%CkžU“� j�¿·/;`ÌÍn\
)i•?öVù}ä|ã1ûáÛhXLwr[WÿHž%ž¹ÂDCž²H+þ·xVuå|SJá–ÆõKÁÿ0È@5Ùp/ô²«qúQñK[½“On|17ÚÚ"ŠÿGÅJX°’gaËÃe”x	/¹®ˆMóˆWªózÃíäW#tïÇ0‚yÿÉ0š
F#VÁÃ‚ï]-Ôc{<‡”ñ¸Rÿ½áK©Íè”ÁÙì·^Ð)l*î°w?Ô0J/”ß@p¼
“qû]oJGtHz“>%7„�À¿pš†¬'â°úîâàøî	ˆµžrßm§Á¸(•«ìY6óQó¿<ÏdçÍ­Ž€QOâ”1ç»•}R;¿Ø§ÕYÞhK?ŸÎš7JiÎãÃg¹jØo0Ã?èã mEikÑgá>Ï³²&M5jÅVÁµô*c7Ó"‡cÛ¨k]«‡M›—·Žì½š3¤Òg•o³x‡ÆS¸\Sø7‡Øga‹ø ï¶­;KŠãòÝ/ÑÎÝJ[¹ÿh—¼µ½÷Š|KŽ{O{~�û#V× ¨íN½¨­›¯ÕUrðƒÙÃÿX¬Š±�,ÌÚ:«È’
ÃTš6ÂÇÜIýAPO<Ðîü‘°5ý*b÷*Œ`Au[©Íõü¤›WÖnŒŽÚÓ:ýwŠòpr�ý¢šŽÈ>æ*,1‡¯Z:þ�]îÏ@Dk§³ñCÂƒ_ÉŸ`P*vè/k®®|€
š.¡¯¯ßœ·DXíiŽ/€µx®½N¸Ž*lðä}éU�Džà¹½_^NyÌÆfþýŸCŠýñ„õ/iz’nÊ´€çXêŒ}szptð
bœœ>í=?üä³XÿY<žÒÉÍ=þ›Ïrôb¤Ì´{f@Šv˜‘ë,Ã„yý	_šâsÈ,×ªMne&u¢%Ê­Ås?²û¦!
^f¢“BÌ
á¢i[Â/š5%×ØœçÖÐ½UÚö÷QkÊ+-4R.BÙ.î<5œVq6 b/¸M½ÁQ"ÚTÐî¿—ÒôïÕMKXéž!–·°ÅRIÐ³XW­R<2Â�ëƒ‰9‡ØÜ0A <¦:×EÍ«âòòþ§‘#’éD˜I+ØZß‚þ:0!›Íu
smî¯%kß™¢îÊI×5á[?Ïœ[{_õ£ùUžKé7kŸÎ¦!Zr]ød:’hÙMîŒØ&9±†”TÐ»ùåzZD”8+=µœ1%µT[M	¿ÒÙ©µvèËê9-Œ÷SþšÑ—Oýk~9Œ
µI®Vãò±7†Yz$‚"?©f•`B‰ˆ`v¾ñ‹C>² ¢C¼¶¾þ‡'ÖÖ
O$ëXû«y¢•˜WP®µ·Mç7Æºž†ô†’cDkAôy 2Ô·Û¯¡Qš†¨Æ¬>¥°);\l{1&ãÈ36ògqš-½.7üûbdŽ}ãøÚøÊ†È4„G0‹õš”æÕ»m6‰€dó›º
K1OöR_@‹Ëap9ºˆ?Øg:ìïËè«éÔáæ`Íb)^×aÒCCåÐwÑké;'lÑ#e—èz‹áMxE¡–¹1ùÃ¸ìÍ¹õ0G?ÆI}=üúïë5u¹sšï9;K=
¸åú„þJs€Wa l‡“Ðº1].Žvlñƒ
¢v°–¶+í «Ì.ðð!&`‹êµyM4ÁßéŒ†#¥´Šp!Ü !Çse´ž0Ã»„WÝTNÅ*ØmøFåõ,`†k²Ž
ÒáEŒ#™6é‡ìÔ=
&—h¿xŸ*¹Ç½d–’#j®4Þ,%›=Ñ¤h‚2
=ó4D$î†v,êÛãbƒäã•:§q¾Íz¦§þîƒ¦«ò)/\¿§ñ‡¼Çí³“£Õ§³>ð°•FçŒ4ò#®;ÃÜG>Ã¹¦Omçœ§Ð%¬jSsæIÍOZ{]rzðêYïUÁCß<ÿéàÜ'iÇ7U`>VX®^¸Vå[ÎÎ_öÎÝ½qê
–nƒ	±ÖêÊï±³êFPÚ$
(r/qH½:<î’£×¯ÎO{Gl—¬xd?6GÌæ™z¨êtCK¢£/>¹]Ÿv†O{OÉë“ƒS Ç×¯zÇgv+:Ë=Îï27ÈïjÉÌ’Žcb¾[ÉÆ3?³=Øz|rúúßŽÎ¹ï^0ÑùHCÊzÞ«bÛ÷œ8X]<³e¦Côdc¶Õ,e_úExöòÒr—J¼áèáPÓ=`çŽhÇ¼,x"¹ÄúBð‘r[û%FW³è
ÒcþË´±¤`ô×!5#ôSËAþöKoòSó[Í²ÐS”…zÇ‡gÀçIûø�„¡Sòæ¼÷²·²™HU’«°rq;Ö‰èà÷&)ö„ió=²Ï_Ÿ÷ŽÉQïŒ€ùÄ¢ÃWË”ŠÔrÅÉ­¯üvä!
:çô¿é’öë7çËœ`Ö)ÝìŠ¸û‡æzÌÂÙÿödž£ƒ7¯Îß°˜E\û³^ïœ¾f‰½:hN·ï4†.í·Õð°Çû¼C•1°tóR¬sË2  ªü÷æÚšCš“S>Ïî{VJL,»ªï\-ê™Å©czAÑöQªÆ_ZHëáV$Îh}&”u°NªÇ'W1ù–ü{žœÅ³ä2 ÏÃ¨çbÆö5!ÚÍe›
Ë	8ÛÖË>	×;ÑU×F÷:3€­whôY‚ÁEX¿OÉ0 ñló2¶æ<XŸ…×=?d¹qäÏ‡¨ÝÉ¸¶s{Ø»ƒNë=Š¶ºíÈ jÑó}öÙÐ¡3•Î‚Öã—V¿á.3`113¿Éè˜ºíöÍ¨6/ÆTÓS
d™F»yÁ#íÆá$µ­Ó=S-ˆe<§ Šyÿt«”X*Ó­Ê¾ÂÍ'Y%Ü¢)xœW=þí²)·€”®‘®RúÞi×Óì²wžÌöfú0Þ²a­wôâðtiÄ+Dª2õæÈµò’hUä´V$«ïÝ’+â§É<¨ÕKÚ.Jýe¿X†!juž‘Žb*Ç1-Ù»ë+£mî‚$�3•ÞçÂÙ9Æa7÷â’iÖ@Ö*ãÛ¦ãß~·ÂÅ»¬).
¯™SÙjü²Jè?cm»¤Ü—ÀK±¤œü"Ä¡}[Ï†à�ÏwäÍà¿‰­t„=žYKÎR2È,Ž¡œã%c>ŽiÀªóÂ¡ð-æ=‚hÆâ°Y�C?æe­G’úÈAõ¥wýH$äqQÈÜàÚ·„a1þ!2VJžgÈš£ØûìPˆ<¾„+<UÀÌAW·í·­Þñqë!ËbyÈSFi%¿ v
Ëš˜>ã¸ÏÃšìá´~©ëú[ôTÓÏt©<†wÌ?°Œú¨„è6:k�Ú<ì½óI‰
©£†‘‹'žèý§œWP¦-¹àŸ5O:AÄ íÛõÎPRåI [öàKäM”ÉQ­#ÆLš<ªfÔµrqUHªŽ†|ÒâmÁ¬>&Ã··ÆT9‰ô£³aýëÄéJŠ¼.hÓàRFfU>“µ‡°gqNèÜ_Eá}½ÊM¹Ø¼ùÈ``C”nh‹å‰û½>•Ç,9g™Ú£Ô¦Õ:á(í)’ªE\9ûtÄbþÆìTÇì¸=;R/ãË¾as²ù¤çª
¶AëC-ømˆŒï*Ö9û0`…‘6q¡æ­|èÐYf®´,žÎ˜¸[IçJOp•É~Â¦ˆè4ÍKZ¹á³a@ûn“ú^–BïŠÊÚÕ7_À|èCGÝ.,Ü¾yŽFëñ9ÅÈho5~‚·ÛÿT¯POÂ½õ©:�·â$üD¯?ã°^hú$=Îp06þólÑ¡_?à®Ä¹QW½vê^v÷oÔ1çÎunˆøE9Ku§‚_¹‹lÀäþ$¸ôûe—.ÚÃCˆMªv¾R·o›Å”)B4ð»8qs9ù¢~u±ùR3îÏ“˜Wnaés¬ûÌƒ?6k¿ZEMÓÕò^oeî/K%€ÄDúuzñáq!qŽ’Ùäzß¨a|•êF¤>ø‘†â=å–˜ ŠvmÑ‹°@sxÆœ$!‰‚3ä_xVßºüÞ6Ûl,n¸›"RëSuÃ	ËÉ3AVÖW:$*’EWÛàk°ìUÕšôšzUÕSÿ	m@:.½Ööb‹uÍ‚|­ØK_*Öjó•ªùÅ›.Wug`fíi0
&h.<9÷¨?‘w¦ÙúÝ/G¾}Wœ.…P¥Šdõ#UÉ=ljüÂ©+¡òxÛx5ï§Ä¯[mGþÔâXÝwÌÇ„·P{U¨¥.ˆDj7<åí <ê
¡búí}
:éë€ÚÚÍÑG8D`´PÔ~:ÍˆðF‹òæ îy²évì~+æ*@#@
¬i7ï	·¿˜}M€êž™·­hmI¥hs¡í¦‘æ×0åCø¿\Ý5‡Vu¹È	hŸˆ±YY„öô<
ƒdUž¯ùÎtÂ§Ž.a`Ë·>ÑèÖ‘I‡ Û¹/ƒ`YGã(>íÊšÐ¼ÖÃò¬³=?ršž7Ì–¿Um%ÉÆ~JnJE\ÖQpM!kB†œX˜)z6bÅ¸1UfŸ=º¤-§AÔ2-sD½Œš
¾ìG0d.ÝŠ¹ÁMI›sÆd£ÿh•!`ÑÑüö¬;±“â"=(™ÔD•ÍOÙ¿Ïñ8~{Ö=¿r¦e–Ëzýææ¼¾Û˜·é«0ÕMr-ýM6%ïXÕ�÷ƒÃ† šÕØ€<2!ôo¬æ3£œ%Üò'-gì¸å/3|Ìÿu‹˜cò}!;µQî”4çõ»ìÍF>ðñFPÕµ©·;
uÔ¾úU÷rÏ+‹HiNWÂt£RßV9{ßîø†³xëÚ6(ÌÂC"z0o
ìåú¦Û•ò¦Á'êµ[ëÌéùaï¸I²G;`³¦xqU­Ôî]øÐßÜÀ¶%þ§4ÿÆ,Æ~8bh@5?eÜˆëæÂ<ðU9_ªr®ä_ûêç•…h‹Êíä´ô{UÎ-<ly*ºbžúøŠzýå_„º>Ãk˜ÀhÙ«ÕÊ¨|ÕÖíÍ}ÕÖ¿jë÷Ý“ß—¶®òÝ¯:ûWý«ÎþUgÿª³×{ôUg¯ßû»ÔÙ-_9£¶wÉ_hÂV‡9Ãñpü0<Þn®ù!µ-K_GAÒ8¥'ÖaÐŒ¼¤)%?QŠKÚr.VÈ·äôQj0N¾Yöƒ)+J50†øø%#DÆByNŸŸ
ÃÄV$Â£D„7N>;ÛY—¡ºÃµXûƒIÿ9õö¨î`E½—´„Ùïy)‡x÷õ:Þ¥W+å`1J¹B›ÌF½`Ò·gëV'O=@UZc™‰®euÖÄÑ §é£/wÖt¦™ŠÔb[óµ¼×DKD•¡­=’ßk³ýñ¤ˆþÏç›u 6+¯µs!¶lWš/B¸§f³l6%ígHý•®[@�éâŸÿãÿ”_1¦i8$t”…W]gÒ¨_`Á„ÑF_íih¿V†™—Óµ¶§/·ûý.yÖ;ï“ÓÃWÏ>ô*¸*FƒZ»u@{ìÀãàõ„á8%a
âÁ%ÆôÖås}^^jP`ÚžÒ‹CÜá¤^*0‘_—}ûK½Î"o'‹3=£ÑåùXÿÇ\m¼\¥9ŠZ¨ÿî²fÔRú·…éÁ‡Ë ÀJ ûºW?&µ¨©¤-Ú¼´á<ðkf‰À�Ô¤`·µL·=a·Yú[Íœ´Ï{§?œ‰¸oqÔe0G^¸æ~‹;H”ý†–†Ãªª,êüà”ñ-ÿ5‘¨‘¥EaåÜ*;ðI5\=`W£Ú=`êy©ˆF÷½¶¯£¿÷Ó‰Ï³Tê8:xsFz¯~ú©wÚ{åÊò¯Y†D6Ó4D‰A	V¢³yƒ•TéJ<Ö×ªaQÑÆkÆ§¹£ò¶—A\„ÃÀª¡ðÃÞÒSD)=c%ŠÄÁk•†<½š¿t
zý>ÛèxÖ’ãdü	*ë6µ-ÅÚÁ—fgpWÖe|
O‚1hº![ýÒ	çø)Mf–^ ²nE\ØZ¬Ð.6ít"Ø$÷fˆx¤£$œ¢ço�Óù3¨»Ë®6‰Ýò,	2-ôê²qAÈ4@a­Vwt5U*rù”´hÄ‚	9”œÆ}ú>¸¦ä%lÇÉCòf
êÝ9bŸ\ƒræ,‰ÞS7r~ÓÙ½ÑìÑ´õ0£)iÿkv³²tZõ«ŒZP+tbNb…'¢Õõµ‡dþ²Ë¯thyò~èðŒf@‰Ÿ˜U¾™„ÙœÔ‡.D~§£‡d4xHfÐÒC¥É&á—NŠ
M´>)sËŸ†ò_�ÉPÂéŸ´OgÓ?=>IÂK0HÝ^`Ï.´dqìGÛ•±ë[à3¤ÉŽyEÛöë)/¯¾|ÊlÆ¢_ÅYàtÔè’=»]Q€$‹G1ø£�þ©£¢õoŸH]_;Qf+À±öH™ðŠ´¿ºK7KÂ1<ôo¸€(e|fÅÑ!4
’¬Ý>K§£¦Gt’¾TÖàÔ•2ðCÒÇ”aÆSÆ¿iiLóå‹ÛÑíwÙ‰Œ{h{}‰ø%Ü®èBÿÖÕU>£®Û^±³¢Í'{Å£Q~˜oe—–ó|=^Àv®õ6Ç2)úlËµ¤…:áy+“ýøØ½îçç£gãœi9n¾³X9aâQÅ?ÿÃšÞ˜µ“Cç·æÎeµŸÅÏ\µI©l¬Ö,BåÇ}Â±èwS´…w~Ø634·mk`aïË[²,œÍ<gu£_1+³•ßseôû1Šœe"Éyôù§íÛªãSdÄ˜<ýM”š†qÍ“~aL½Ðb¾b*†]·ðˆ]· ½îX2/L»Í?ƒÁÁe«I(œDè›/¬šGì”ÙÐ/BÓ^)X77<-Ò˜È‡PU¨%4wŽî¹ùÚiš(âvPØç„�\£C°†×¹‚WìA¦É{á¥® +ã¹$åÊÃ,ß"¡p§\ä	,Î¢’s¡ß_2„ª$W—[«g!/WT>Æ<³£úº}f+iÆG¢bvzG×_Ö<bž¿þoÙÍ¡zpÁ~jLJ‘ƒ@!éÎ?~zÑq*™˜ÜÂƒ*XG¦(ƒY'–ú^su¥G,(àÞzT¬ïUÐgc5¯P&»l¬é“]X'Lû~¬üÁÄþNË»ó{dýÆYb‹^-ù(¯å«¢Êrõí4‡¨hpº[Á–<³dð*y(ˆÜ,W‘¡)»’y*&g™ky÷ƒS(ÒÓYÊ†â ïãþù{ç	M‡·s»n§OIõn?šõX*Ÿô{ü«nëžO’Ûqt<vß±ÝžGðÖí»
‰•ëˆèøG^HªŒîµåxÌûN­BÔºdª[“”o1hµt/’u¥©5Ž´šOá[|7Žqïw•[”ûYëw,^”‡ bÃ )¬S½,ƒOèä2x÷iDö‰jÑc–»t_›@ë]…1®ÈhÔ	(_"V•¿È2L‚þYF¯®à]ÁxUi—Ãä·¹…WŒ#èÊûÅ»ûé“.PY4ñIÃŽ…ñIL)¥¸K¾±Ôƒ²([îÜnÑ91„Jˆm-ß�?y§AÖY#ggï/–à:y¶©¡H C°*! Zô“xŠ!üIYçÝ+–[!ØTYH£ýÛ[Oée˜Ýì’µ‡„Ù]à·îÛe£„cx_éþõüþõòÍ6…·›(_ òªÐµ¹àç’ÐØY‰Ï<6<oV%gmæ†­,<™^ ÑË×@£¸7ÜôâýA›Cq‹Ô ÕÕöÆäÀw˜&AIï"
&"&;`äG"÷¡”··:Ü¬õW[6IÇËçä5æ¯Ü­g¼L0»Ö‘J|¥†±é¥-§{�6É™­´¯h”+)<x`˜÷6²›:;­Žªt8nTç°V¯Mc9UÍUk¦ô†ÚÒýUÈ>uÌr„S—Ü»Â¨Èxr6»‡Ùþ-QÏh. spçcyÔnˆ¦Hd|¡55š|˜óGýjRh˜’#šÜÐk:©çýšfÝ€{/ù×:!¸LÑÚc¿¨žX¬Æ³¶M.­n·;Õ=`r¡„)lÖpZwóS·ülW½ÉÔ<Ùû»ÄÝ
ò3d_ï^ö^½éwÜbþ(Œ× ¨¼3½c2*ïhËèCÂ{Nc<rZr1ó*º†‡´Æhœg#À
nBQ$ZìtÜÚ	ºaMˆ\u
Ñ‘Ä­ßÜþó¿þ7rFáŒ$6zv^ü‰Y8"ü~Fõšn“š¤¼¾õ ­]o/
"xL3Îrºk¥Ý‚Öt«Tóíë÷
Ê¡eO¿ÈÍdùŸ^Ÿœ¾~Õ2;oÍæ›³º=³dfÜåØl_ùí¬¹öî.“_Òæ×«Y\ü†VäüI¤üñ”­6ü±­e%Cÿ¦Ìb™âÃDËw³Dœ•'lô(w?Y<tA¨hƒê…1;�îä:3Þ‘ÿaâ£ºÖzž“ào³0	tˆx‹äŒ7
…/gé.ZQAfSþ˜& É$7«šÀ2­
3›»àYp®õÃÕüþãNGpá|»®ÑNgo•?hãó\§d[-gÙæÖ˜OCpPö‡Éàp+„tÒ†ß
(ÖŸ½¿ep×Ú "©LU™×Öà¦´Ç)Ð€økÛdMÒœqÅ
òUÌcÙ[å§Tõ½9ÎˆZê8º†¦¬Ü¡7PÜlÊ¶7§É5
ùo±bˆŠä6½pÎ/>ášÏ¦%8ÐèÔFˆžÐ9›Áž&«˜ÓO~ŽG±©«Ô!Y­ÉX•;ŒÇè’Ã<²Cépð:LðrËñÅÈ!šJÆÈÓ´ZŽ
¼ÌÇÅÇ|Õ…ˆ¢_Îq‘oê5í‰—Ö=a6é~V;ûgzÁ"}1ó/Q¾Ïd{¿DÀ£zÇÄ4˜£¹w8ÊE¿­.$9ÏÞxÿ}qLû±Þ=R3q¹ñ±jûH¿›—mÒrídrÕÄ®eÚ¬vÄ*ëc5}}Tvó2o‚­W7ÐûçªÔg¯FÅZRý<ŠÃú³Ò~˜4³˜Îgõ1C0.‡|xû5¢XtðÆ@GŸX<4Ñ¸4ü?lºZå±Ã¿‡“Öcü·ÁCgtf˜¥	?<Ö‹¦´õÿmðÐkPIÃ?pØ‡3ËØLº›ÎëÔœås�£:¢òç±C¦cTxf£å1}“tV’ÌÖvvõ)yÖÝ…ãàP[k|9»›·ïy<h·õ¦"óÌ½±•`¿/ë<@j;™a}ÍLnëßÏKn¯gÚ\îåÑ¼à+ÁÝÁc`ý¤
„·²<’3gAÃ	ð6Ý7iLá«®6ÉJ…èDByÏ’{”lJ¯ùä¹$:4×µG?*]ÉUš4P¤m°l‰ØYžˆËDl ˆúÃVzœès§—C…¬q/ê»/©:IµQ_-œÆ-N34X [ß BDì"ùÐs‡<Íô¤õäU¢{ý®´HëõH§
™RdÎØažQ<•ÞÔ7ãSØQm"¬k”²0©ú™Ç¯�>3P«7VŽ|l6~%'Vü¦¼Sc)«ÏÏY8ÆlŒ)ôš¥Þ[Å02%’tÞÈaî©ûKœŒ‚Ä4\»WÜ(°Ö+Û(òöÓÖ0šÏ³e]n)äH+Ê…c?	Æ¿¨1¸g,ý›ÛËŠÃ5'¸b„n5ìPs{[Åuk¿ªîaFÄI4Kk/(œÑ-™‚²£IA‘¹%Ç3¦œ¿¤YŽÒÊÎªÆçêù‘íÄ¨œÅÙPÛ0âX°D±^wvÈþWO[KÄªñU›$âßºþh‘øÖÒsE¬«!,,�Á%x}\ÑY”µkG ãBce6¹Ð3& HV1MœÛM‚ëºT?ÊÃ1[æÑµu£þLÂ|Dµgðc=Å#ªë®:4 3N_Œ¬?È¨¬vg“Mô[&ïŠø¥6±y#Eß@”œÈ€4Ñ}M÷41Gnº×<qÓ4{¤)íwg³Q¤dLØÁÜò¾‹xØÆc¾	å‘÷ïLaM·1tOûbPË@m—ö,„wö!“§
ÿ^‘Ä´ñÙÊ¡ÚUI*ä cVèWz“ÑÝ³@ÄˆP¤´ûÐO…Ò<ì”jƒÅ>ø„zÓ’\µžšÕ§¥Mßp‡ûRç›†5˜È0ÑÆ1,B†‰&ÎàK%C‹ð¥W5c¾añ}EÔ_IŸ™Á*]rw)ƒE’\ñV˜ƒ*jR^É)½É¢áv±-™…ô¶…Ò›„ñ-¤_™°æ!Ú-¦b¾âA8y¦YœÜ<Dz?V>ø¤±Y 3;Ø£“›·¿<n¿åò‰ª¡ž]&¨§”uRŒ~u°¹-îùFI©F¼‚”ó
f°Þ´ªŸ¦ÀÒaíã$@7ƒ¤%cvžÈÄß»âv¡ô¦×av9$íJŸŠF8<µ»Ó‡7^Ä4é·vT•y}=	’?‡Á5ÙWF}®xŒ7·P‚4ÜÐ‡Ãw‚qK©2£Ë9ø0Z°äÎU8¡˜òñŠéª–”çó&l’.îGÞþë7ç-5®©\^'Qjë$]^™ËìÀï8?ZfG×ÁÃÉe<æîÞá«†½ÓöD˜UO’ø*Ìd±Ñ³Ny"kÏblN¯²°J‡ž·•\×PØi2øÁE˜õ©Ì3­kìXØ%¸iivøüô/a6dðw¥îkT”Kv0ôàxÄ°Ëxa»üƒmuØ°lë tý‘€2ºr÷`.	ìÎÂ4ì’sÜÍÀ2ßL5¯£8ÑUk©ßz1Ø­TW­«IÕÌÊ°¤ÈëñßƒŒ´'+MæT™ËŒ¶^ÂY2Œn4-óyùA¶á˜VûÍ>#¢ÜÜ"Ó!Š·õ°Ôšy*Uä9þa*­ØŒï­ˆ,|ËœœÎ& ãœ<MÂà
ù¥cVx	[û´È¢·‹“‰R|£1Hæ`£”§h4=ÅÐ>Ó¼<GÀ»ä,L“×@2Ï‹@žqMË/Ê_»
XU®a:ˆ©È$sQÍ»?=¸-îN#DéìlHjÓkø¤áy˜~Vûë)*Ü‘ŠÞb8YÕFÚ<GoZª†ùf
÷¢{"}wåÇdày$y¹¶‡“Ð<©4w²	4Ÿ˜¡! <L?jÏã>½iY�LâxªÙÎkS>dÝòè„|%žÐÕýT=¦­ÛäwÅnOup?+v[“™|ßcµ·QˆT9pyåìÓiÌ'”œÎÕÁÇvÏ†4ÉÊßÉQÙJšÕÇÉõ ]©ÜÐ	n²ð2-ÝV¨¾çGÁŒ£·ŸÉ,¥CZ[yUd2ö\ÖÉ%6Î^é3×-‚¦=®<H‚4Õ‹äV¶©t—k tYüíì´dðM{ý<Í°äÓq0 ‘¶Ï?†Qp]1v¹È¬æˆÚ»ü·lOFËM;Íqí~~¥  Îú5$sÞqik0õ»‚ØËÿtStí}>³ŒhA†¬mËUzÊiÞSïÍ{Ú‡×uFº×ùÐ1½I€Ù‘×ïƒä=è§ÚîšØáR˜Æ”÷ iÇŠãA³a€Ž}v3¹4ÒóÙ4	h?Å;ýÏðLÈ;Ïþröœµh$ç:CÿÛ,¼ÝdPùþœ2¸sr<'hžIò›¨Êd9D
M[ª‹Ï±ÝŒV5ƒÑÑkÃÑ€€ãÐ‹766\‡7+ÖŒÂÀŽ¤7&]"OïE×ESiÕk,z¿¯hsŒ³oÈ³Y¦Ó%øPžÑ%r‹ÀìÏÁ5C‰ú>XÎ€Z™Â@ÒH¦I8±Ùüc‘®’EF!Ê0Xg÷ôÖO›[š±h®†c9›%4#?ôi+]Žîe“¤øöŽÞúÐHívìuˆ^‚—˜®‚NToØ}¡"™)‰&L9Ú¼ÇD¯%5ÈãCA²£ZäI/‡A-´½$
§ä<‡ÑK.‡á{ûÆžŸEQÞzsÝü‰„Éù ˜·^†@Q°Áñ#Â§ôÑ1þøyÆ~œÁ‡ªa•cõéÍCjÂãÄË˜ëlŸ$¯bÕK´uüÌÊÆG˜±„ÊIpÇA›‚(:ùGµ)Æ‹mtŒó=°û ²V¢¤ý©ü±x\†’±Ñ	«
J)œ­ÐMa„í6}H.ŒÓí1{ˆï|Ã\ _´ÄÆº@öÁ‡×WmÊÂˆVH§üñÿ¸Üé:Ip',óú0è½}6Ã‡“,êâ4cÌÙÌh%«<,
oŒî¢«¹rdÞ	}š{ª‚<L?·‚µ‹¥¬÷+	0˜€™Ã,dî^¦ÕÇiL_{HvV8)Fñ€^©]C¼‹]_åh<jÿ(SU˜uoÇÈîv	ÿ³d4ŒÒ²q9·`òVó?Õ±ÕGÂ‹óØÄèòÏR b–:V#A*!ƒŠ.";Ñe›þ‡Ú}Àp^˜qö*Šã¤Íž\%ÀE*a€Ênß#ëy|‹E§ôWÚ2Üûh-¿æ	?¼:ˆßÕ;3Ä|±roX#Ø›ZWøÍ{dcKmŸ}z7¬½@FìKrÉÒ•¼²~P©nQ<z§,F%È¯½²ÓczW¢°¨±Ë¹o9t)ž¼¢ïÃµŸˆßÊw Í•�óË_c¼CºË~¨ßÔÃ/µ¥<ë0_X%ìèÃA¢©¦¬gI(p aÕ[ö{_ãïVÔ]ŒíÑÕÂ0áí
×kÑx›6¤ë"V)ãõ“4b%êñ®?—3\4à\){Ž09\„­†"-ÐÜêp]Û÷:èµŒG+>gFL$`ó¶?žJš7
Æ4
Þ¶ˆ¶+Õ’&žñÿÐÞIH»2¯yl
Š(HÙa
s™ÅIËPˆàí\L5‹k�Çqb6ëSÜtÏæ9%*`ï®�4¤hª›K0¹*ºíIYTÉÛ0Ö*j™ªŠÔj]Òi˜	ü=h=¾­ž¾–bFf0K½™Jš‡äTíB?©,0Ñ‡ny*›Õ´*²4duë«’/ƒq%kµ²<JÎã,È0‹1µ¥âð«Ê`XLQDr>Ãv™øm6g1UÑ'Ëë“³ÿ+aÉË`2óàî5°©RYó-
”?¿7V9¿U-¿\ÎâB“”úuð¢2ÍB”¼œšžä€È¢à.8&¦Ýì’Îv‘½Ö]Û0Õ&eÏÓ)>U¤°í˜n÷,Œ¢
rW„Zånr-ÌV2Xæ—ð[ûEÂ‹6Å£¸ŠZv“¹#A”–ž†RiÞZýØ8sâ°èœ{œå®Ñ”páë°o±ösÃzkàP•2"¦Ú •N5fµÛ.žMp¤rº§¾Ï·ï®;ë[dˆÿ<¸SÅ,	w%æêÌÆÎu8?åÑÝëëUnZö~.MH†{¢ch‘'ÌüÕV¾H[°IiàŠ¨¦ÛYV…_r–™ÉÇPg×rT—˜`ý–:Þ±™óŸ±hÜŸ¥7æüëeÎ¿Qæü[Faþ–…�s–¿ú0|!Û¸½!»þÝX3meC†3>iz¤ p|ª9Ü’?Â±~ïCì6þ7lRA†Ø%v÷Mçmg‹×H,mÃ9‰gî4¬h’aJ“¹¦¡…-ÕÓ2¦
`LH)Ý‹Áüõ^8ûM*îd+
¸Çº¥ò§-K5@‡<Êk†4 
 o p¼®–Q”“ÆÂ½ºlRk·þçò“JbÝ€OJq[?ËÝ³¥öÇô´­öªÃ›ë¼êk)ËÌè­`Ä|�V®ÑuÙ¤€†å¹Ô>03²©õb[üózêRq59@˜gª€hó"¥SƒãîL@j;ð<ÑA
zW¸èNÁE·Ö¼¸¨—	Á
ä¢ë8k¬¼äÕ•Æ:§s˜©'…ÉIçÈ“D‘ƒa´z4
ë#&S‰©Zõ–…ºë¯¸F}¯¶¨ŒQ®Tf+¾Êxêc9MÒ^Ûy¾˜ uu$C8âyñbž£i¢›Ó ‚~¦ãÒpÓ
Ü)î·€„ÿÐ"Ã�	Dþšã_Ø··kÆJ{½$ lÛ2³áþmî·3>‚ý®Ró×˜
}£ÉO	í‡°ú–;bb¿ÅŽï?#ç²åý°n€º+®÷-6Ü­À-šÊWÅe=;ýã©õBâ«+Ðr÷[Ûp"ÆÆžáí·þeëÇ­GZ@¿ê¯¹Ä
‹ß]·—v)n2˜î4ŒeoµL—
_µ“øÞ3Ø%AÒ	jK6CF–Ä£�4IèÍ~k“lÚÆË/QOa–Û`yÓ0‹?®ÿ¸ýãæVm|ð¯½ajy	2…#P«Zè°uœB;Ç0»‡ŽÜ
Š”uÉ¯Â#%þå‡­ÞæÓK™0v30Î3ÈA‘Óä=Uïüã§»èä´ÝlÐëøÕ¢]·P­muþÍ±:_']{Ù¦ô<Ž£,´ñ3ÐÙ2`gÙM¸¦‹‘§ÀN¡½µ‡¸c.ø­€®{?œ1±n_#Ø8ÙØ†:øO2¸h¯üoºü\õšÒ>¦CKëŽNZÉe:95¥åÚåÊcŽ$gŸw•P*±Q(C¼@áL‹ÓZ\9ÿzï’.rvê>”ø­B¶Ú²Ín“üè²Ãxç~k–Dí)¤¡•9˜úÞj.Ò™äUÙ@~Õ«Z7k¡Âh41°/	àFô¨£1æ*‚O‡a¿*UÉî¥™Ñ‹4Žfè=Œ§5’ qÂÏëÎ#´jÃ?j!½’Æ@¬âÛu.ŠwÆIgs~dðÃ LxjrÂYÒâŠ1ÿôO›ºx0J§@4¯¢­]*Ôå<WP³ó*å•näóÓ¡³,&Ó¬KÐsãq'½Ä¨þª/S\”ÆÜ©Í’+»f$o›)/c€	à¶=8Kã¤3CÔ@M{É_ãtjýíUo‰ªÅpR©y¤‚«X'—H­oÄ51à~)Ý2Y¦Œ½6©ïÛVõ]tg*Òïþ0oŸ¬ÆRr½ÞÝ–ð¡9OÚ©Ô5¯rûJ:üòR|LM·ø
ä¥¸Ä#ï”fí«…ÒÐå ýØ5Ûql5O›¿4ÔÚ4œ‹†—ðôw|	0ôR€amåæÂÕu‹²¡…ÁÒÙgí8XiV1<æ/¬¸b*xXþN™³�Gt:¹ÑINK‹9eÁ²DDËÞ€ðÙ¹8éÂöÞ
o{ïïÕÂ;É@¶cIàiÍ~57íZ¶˜s“åYW†MV¯D_?*äIV©>¯çL¦y8‡4’ÏôZ‚™ÚXeÈRƒ¼ÃRÑNƒ¿Í`{›´ô<!b3•�FN8ìSËTú°>ß4ÞÂcÒ]²–CÚrË[u‰Ëº;ål5¢sEW®ëKåðËz{ùLKhjåeá!þ“3šÆÒÂ;êþTºQ	ÝX³øŒÅ#vaHÎùfÙ4—œœÁÍá<y÷­Â§¡kâ¬5GIûu­w¤ƒ¿WMcm•¯F½u®†ûÎ¸JU<d”2)GÆ€f%ƒu¡˜Â!”;e¦\ÖYËú†YÀqÌùs–åb3Ïö˜<½¬YåÒ‹±c„7¯!&¦M³­­¬Ä Í¨PžuÆ+ÈéAêçaŸŽíSÐ+¸ä0-$‡®e¢tn“ö-Â¾áã¯rž~–ãâÍ?’šÌšJzïE9Kô„µiL)h,*™¢¼n«)vr+=†ôÄ¸jOÉ<?qG
5ù€Ç¦¹ÅpÐÝ&Ü¬`ˆ=À,
 Ä$œŒ:æ„¢}Ç±¢=Ëgr£ã¯öZPnëñ­Lc”"æ¢âbñ@Vû­î3Ô’[á‡Î¸-»EŽu¼”3Ù.%[Õ9[Ä¿Ãnª²hz.Kv?ÿsçiÍÆüÜÉ¹XÆ¹Øgpêh?Ô˜:X®
)-qm·u€éoj7äÔzyÂr®¯)âŽ_€0&ê‰À?kÓè[ÉèdAß,rÒDz6æç8]‹/ÃñŠ/6G¬	õ^Ô
ç+n¤AÓIkÙ<þz	«—'VÞ 92DàÎp’Ù$›à$ŸŒ’x¦èê×«£WÜòr‹¦
gŽH5o¶Û6•Ñ@¶ÇçY|›Ž nîß)“º‚62_ü`Ñ±ŠW@˜ã;ÓY”îˆB³ýËžEbe¦gˆµ?&¯'h'#ß¢8ZZxŽh¥NAyçglj³o˜b²ðâÅBˆY”C“-^è´>Þ¾3*„Z¶¹?¸
SöÚ ï­†¿¯æAò7ŠøJÑÅœeŠƒ_,‚vËžLá´óé3½åMØ§«ä0É‹Èéª%ön•6sî€Ã
¨`u¹óÁØn'bC¯è¼u\©ü:ãvŠ:0oy·/w¸e;P«©üÊwì*«Ø9X;8ÜZÌÏhø¶v2™µÊæ–~ýSõ¸×"úfúŽS¹ùˆß3.ç,¨ÉhI~¾<yU—Œé])nëjµ@²êý}dsS¨€fM°'”w?—£garŽ©ÉSÆ÷UDaÃö j—WÁ?èã{•.I,¤Ö—X]Øv°¶mQ«]^S¼ÌžSÜ|1f˜˜Ý¦xi+um—j�ëbÞnli¹ÇØrÞ¢Ë(¿e‰g·­Ö1a	9Îx
Æ}‚ŠyÊ”7/˜Ëi`˜qÛYR¡¯gÙ§‘BñÅOÔKEeŸ|@M3õiÄÏãx€=ù’%Ï³8	>OÉg~•œÌ¢ÏDôä4ùUúümIŸ°jŸµ�š£/AúT 	ª“*Ù¨ÃguÏ"¢s3ß»,X6q|®’¡]ø‚CN
÷ Ú~?¸Áê¨‡ùò`.Ïû&jgìå»Ò²)ÝÐ¢)ÿ(®mirW|„ŽMzŽ¡#ý"8WÑ!wQŒáW¾^Œž	£çyû¶´ÊòÞ_h?®´]»goUÁo-¾ÈÃäãj!Û<$½(ÑýEÃîé¦FÕªKÈšùÈ¯/é„þ`Ý'[†ÕBÀ­†7?1ÀÖ		(£3Ø[Ñ,™
I³ƒpÊ«":Üy©š±=4Ží—9­ó¬/%¤Çèô?§éÍä’Ø9Î …Ó\‡8Ìº—ñä*LÆ¶;	yÇKh¼|Ó#m¥>¤(ü¸Â‡9"7xÑ>}¢)X\¦B<vl	ÅWqBÚ¢ª2‰¯ò¹µ?¼âš†@Fgˆ<|tûA<úy|‰µÌ²v«(ÎA¦ÝÐtˆ—r ÈÎcšf/ƒ4¥aX¾œ~*ôÃ!Î¥?R4„øŽ¬1@¥©CÆ<¨²ÓYg@±[µ¹Gü&Â BØÚ¶C42É<Y˜EÐ!AglÚDÍ–fFšs`Ã
7¨˜MþÑž¤î¾Ð–æ›Öý0}–À EÕÖ— †E¯§Á„“ßšæé
–TIú]ÆŠè$š¥5‰n9‹Ô0~éGëLÎA0çZ#¸öë„NíYÜ¨Ä$mú$zXt=q¤ô1Lþéƒ@‡‚þ¸y‹OU»Õ;>vgÞ¾+Bò•´MÀGEk*ç#“&¦>­wïEìž‘O>!-“³@Ìø¸€À–wÁv0·X±0—ËBV±²)<z«ª~CpÆØ®Ÿ¿Z©Ç’äµRxv~øçƒ{¤=icTñâtÂûî 5üÊF,Ê}äb
òú^%5bka¢©6edWÜ¡x+š5ý"»X…v•íEÇ?¾ú-SjÞ{/¶æ¢Ôü.o¶V/w[åk•DÝ¦žW 2ª\e9ß)
5ô)êÙS¡ÓvQ½!©zj“.xG†G«W4
CÐSnJ÷ËËýÔ'A¯lX-¶™lV3¹úvÅý(ßênÈk„ÝI)íyˆÙa4Ò¤w7›†f~ˆjØ«ZÄn¹Rš±üO7n�/(sÔÕÉ?þAüX4¯À‹W¡—ÜÙÂ†!”Ã[$‘e6›½Bir	GÜ0Ë¦éîê*œîƒ íÎ&é^9ì^ÆãÕé0ÎâÎúöÖúÎÎÎ[¶6¶;ýõ‹‹õ6¶Ö®¶Ÿ\ïƒÎÿíßöwÖ¾MÃÁþƒÛÐP÷Ëû|„û¦4w<²œH4Êö[‚Mw™¿Êózû®µ% °@Oƒ“½ŸÀGæ
MàÅ›elpÖûÆ%Ìâ !£X@4ÛÛb5*‹­?l¯­îT„ÌÍµZ°6Zq6­áp»eÅ)o4O,o‚ïÍÁu@-þ,þ%Ï$,-F¸Tç¥2z«Žc‹�ÙüEÀ^Dö3°˜ªD+^Èä_Ö²;Ì®J{…	¦í"Î\l‹DÁUf,ª[Ú9#Ó¥Ý–¢€öý‚Jœ€Yvÿ•¡‹èÚ/‰Fi0™xdØ;dL?t®Ñ‡ËÓ“Ùä–ÕîH|I§'¡¬7°^Î÷•¹¨Êv8a6dd&3�–ª Ï…£ÈH¹!œ\F3àíœ†©åëAwQkeÅêhg#´aBâ5L‚«}¥Ó®øYÃ�a‹ÿPÏÄ`‰-.8žö[“8ž¼=‰áeA’˜åä¥žyeÔ+àj^ùÂ»Â­ËOg#JN‚ŒÚïwÆÆðœØc1‹ÏC<Co”Õw&ÆRÛ+ì®wÖ@-TIÎƒ©ºÆÎÑøÒƒ;É2îù²Wm_ÕB…Wž½ÙYkËƒôrØÖ4;;/ÒÆš-TvÂqðlov'ekû&ò—Ðö\­5Æ"Ü¨!®E"¬\"zî<ŠÌr×lb€¬-.Óí®¨ì£æ1žžÎs+×1wH¹š}c<+ñln‚«kþ@W'/Œø¾@­ÞîÌ)-EH„íö	›ÆÃJ0ÜÑëêí\PX&[›'J×´;æ}Ä&¹„&>À?Zo&ð¶p0	úN�{ÇÆjÈj=0ê£Ehv©âd­n;Âöî{¯R¬Ú>ßVå.g§>û]lUçg½M§á¥Ü¢¿]ÙÈ"`<ð¨eŸöÛ­Ñ)ÐY¡‰L±Ð|(™ÈìL¢Z×{£Ü[*¬gïu§I¼œE4Üu6qÛ+ôdËêÁë	Ú†^ÑWíW3d+måIDQõyÿwáµK&Á5f’Ú7v³õÒ(À?Ï²6zû»°ß9|þÝCrKúXoó»È*aŸŒ±Ü9|’ãÿ¾	hNf0ëáåwäÎ9†]ÒêXgsÉ:ÂgDšžÉ t)<•~”	Ýš‹.ÅsÞTé÷¼t4™¿í£ÈfZ¢<êÎ‘)cy-Â!Îc.g]xõGøçô¢Ýê3\R{´*áq‹ü)}Ü¢5¢¶¬rgƒ ¹Ò¾!Ð¿]ënã_Š|Ø9cXí–CG�éÒ:
¢8¢ÌpÂÂÝ-Tìûyå¨bŸE1RB7?=Ô€¯Z(Ö÷K 4¹hñ:BËæ&Ë²üèX&åUsÐ6'Æ¸<*Y¥</mõœÙSŒ‹>¸9²‹Úç
Ïí;÷Jm·é¤çñ`U× ¯Ýïö]N÷JP 8+jnÇ4¿¹§ùU‚#(¶Yž¿[HVÖê¨ÎækA–º˜Êzä¥ÁÌú*[Ü^Â
£÷K_1fN‹Í‡}ïÉÏGÁø‚F¡ú½í-ö$¾rIvÓšÏqm½/u¹uçøêÚÇ–½ó·¸_‚¿0²ª’K%Ò¥DÞOëôš·ž¼[qå*á•%7w9óš<Z DI~òºƒ®|îtœïüª&LyõàÝIm^Ë¹UÖÜ³¦ýóÎÃ*=…xÉñ,kç±ÉE3¬¾èÊC²¹¶¶æÑ¨4»’v$qâC=š<´Ÿè€Fˆb0T(Ó%ƒÍ?.»›ý{¿Ùugã„×7ˆr¦”Ë‹4±kN£Z=ì„ý´(%·ÙÒÚøå`Î¥·u;šÎ‚,WSn£4åÚ ñ¹g½(ÂÑ¬ŽßÞY@Ø"^3âšù*Ù~æú÷õÒš†¤Ô‹ßK¹ôô‹Ov`¯f ~¹9õ~Ùô
=Ì‹IZ¤&_4’|hÝ¯ì’íÒ[V•<„ÁyŸÄ“ãà*³Ál827­)=æíu?à„¡X6˜±±?Ñ_C¬GžÒAh.§Å2XÍ€lFPä@VAìróÛ€ýÀßŠGúÁ”&â-èÁÉ
^«ÅQýpúMKËÔ¢åýÊòC^(�½$¡7Ý«$6À ú,0
¾Áx6e‰â™	Û®A÷‚‘ˆY¥•ÙOcàfp#¡)Ö¾‚|û‹^]Ñ}¼Âß
«žá4X”} ˜<Ù„‚²þ™`üÐ¥Iß4þvÊ¥QL›@ÍI¾ÑÐWkÂÇüU‹å[½0ªOÇó6-ùÓæÚÕúº„íGKªƒÜ°Èž¦ŠN!fÉÜüõµfH¥‚gú\æ3Ö—/®|Ížt/oõ²ö‹Wn=uøY<àÞÂ®½ÆEq˜Ã$Î“W¤ƒuò‘™‹]ˆ;|Êòjô8{y–Qæš|ƒÇóü´ptùÞ�áœÁ
ÍÉ_MØjš@P´º†ÉÞqúx—WãE`/ø±ßÞ!?Ó±ÝZêNiÓåseŒN/�'IÈéÔ§NìÀ¶8ßžtû4ŒnNáÈkÖAÄZ[+¼ÉÂ“ìaÀh1g³‡yËa·÷	žfwyXñjä~ã�œ’}4âŒ§žV¾wŒUâ{J“™(™ó `x»^f3”"ë#VF+ëT//ZXqÌ>D8fÞLûðÄó\@ÂnúMÉå¢Bžó›Bàmip8Éxw}ŸÊ'¥fY-Í©_+>F9÷æ3Dý×*¡®n“i%ÁÛ‰—›]ìôÃlSšt9]>†.~×b}¿££ê˜k¤¨,ÃYõ?ªÔ0ÂeV~tËövŸJÕ#Oœg_üi%èoY§•vöçç•í(¿Ï3ïëiõqN«yÃÏµës§ÇEÌ­jÝ�¦ýFšÏ¾ÉíglÄj´äMgcM…\ÖÚ~ G^(DüÒ§é0è×ë|‡8¹ŠÍ5ŸÉøC‡Î²˜§¸‰¥Ý²j;Ëo•ÄpþQ`©–ã¨¨‹Õ,…É6|0º¦×Ö*å‰Oƒ¾DykX|èe0™±JeäÈñŽæ%2mÔH^ÑŒÇ{»êŸ³+õŠ
×:{³Æ"'ª±È÷ªÉGþö8öè#&
ÌB ÔôyÃ@Â{çI0Á<ž7S{a4•¶]{)Ö'M-Y‰,a©){`h8ýp”ÆËvjÝúB$šíÅ:óýÚÚê÷ÚÌy¦ç|L)Ù'Ád0» psYö@ŠEe)ÆaÁYü+4b
µÂ™A/Ç1pìôçÁE95…Û;+ã>†ÓÑ!Õ½,¶w†ÐôpÞtÉÏá¨¸CÛÒ8‡Q8
-k=~
œ>U‚õØÙ9ÐBRÄæ&í~HÑ†3…hüë÷%†ýV’1L:™„Õ—qÌ[’#€Ó#6ÜÁl‚¿-~_¾ùß¹K~Y�÷¹ZîÍÃÌŽËo'Ašj<²í1‹ƒ¹Z´ñh[½är´Ó?Zû›T÷±IMqcMß¾s‚a@´ÄAW«ñ¦í ˆæi»E)7þ÷†>Ê³z[5ËjòrE(k\
ÎÜÍãpH3RÀB‰¿“4œšÎ[¬„1àh±8g‚MºlÌJÝRÜr‚<d8¥pUny{MÕ5° àbndC´P¥?ÑˆÜ&„µ›äææÜ•xÃÛb8wë«¤Ã¶â
û ²
-çauÚïMÐíádZ9ÊŠ+»™
²5½s
l$‚¬'Wëi!ÖÀ.U&xæOè˜Š…AŸw»]Skš
QºÖ§À/ò|2N„:ªÛ¨Èù:Qó*¾œ¥»h{	WþP\÷f'=Ê†,
_ßqClU“£ÑVû¬QeCðZqèSš€UTZp¾-°pº ¹z$i#N¿'k|‚KyÚÄ3m&”u›
ÖnšsuP®î Ò|A¬	•ÍÖ¡È¤¬ê¯ßs}‰ç@•49ÿ%û	ëPõ;¡78ó®š=Ïy:åç·<éOŒ^DA£™öx6Ø8ú,1@>!$¨Å¬˜
+T´Ãkîq+�ÞgñL«lÍú·š
?eï
2†Í‰×)h`_Ú˜ÎÃiÀ‚n¿´1gÉsD¾È‘	ç[û…Ù‰µÈðTƒèG`o”ÎGŽð]b:,Œv/»ˆû7êl0‹HáDü"Ù®±Û·m­ÊiÅ8T/áè.êXýLí™Õ  oê†és–bÈ`×g™ea†~Œ·ÐßãhiÆ³7¿)²7ç«·ëé±ÕÄš7»­¹³:L_"þHtCöIÐM)ˆ7ç ­ð1^`±U:i™½—ŽèhväZ†Ê¤
pö¢›Šñ¥&í®ê^O«
žøh±˜¿Ê{Ö×nø†oóÕovžË«‚.¾†þœR"M5o¡06Xfq€ØˆÂ«{ùåáP¶!ùÃôºô=èÀ‰Ûaî‰ÉïÎ²üî=üà>ðw÷˜ü¯úcÅX½Û¼óbNÜ;m%^›0#T,2>]üÐG´ð³~ú…-±q	ß#m^é|Õ4Ž:ëºø±zýó?ÿï¢/>÷
kÂË!å¹l†ï9sF»Ì:g^à‹¬m [-°’ÙQ ]Öíçe3ú:/>Äà•ÖÈ4£5²~1+÷’—pÞ�"E^¸>s{ÑQK8Œ%Ü‹/z…¬»slÜAF™Ñ„À¾ŸóäÇ¹pt¿æk*á[ÖKÑÀ!îh}@Û:§Q¹ì™óTwfLè]bÿÞÖäúK“½^^ïi4PàPcLã^$çÁOž
éd�-´ƒ÷ Ûy’rÉ|\sAœ°g»¼6E—uÉMX`¤Ìx e^ûN,ü ®‰ºF>ø]Ù+wÔãGÈcÒN˜Ýxåµœôþíôõñ±pKëÍÉóÞù×½ï^Šˆ’¡õ†EiÈ�\!É¸ø$_UCÂÝöTþ;ë… wnŽæž§*¼É»ÜÈ¤tðiiFäyˆCùæ_Ã
¡NœQªý0Eƒm_Ï•\�ùëµeŽ”Bƒ)ñOø=¡Œ‰*Úä§%ç”êÎÚÐù¶6JÌá´*pbMÂmº@<eõv8/’¬çñÿû_ÿþ_D~ÓÞ*¿¥aK’t¡©ÿþ‰ ^¿¶€m3öù)wóÄ
,K·š¸Ê%—.q	iÏG¬ñe¥ÍrœkNðŠŠçVÅáTš¢ï'Ä°²sLßF xÉ˜ÿÊZgQòú•€ç›b‚¶¿¼C^Bæ8ËD¯eDÿ‹èwçšàµkÒ|ô­y3UæWŸK¶ãz=U?¿´Þ'§äé›ãÞ+ŽÃ
½èz,Tyÿ��ÿÿ�è:7Txœì½ërÛHš(øž"‹S]MM‰I]JVIvÐ’ÊVY¶´’Ü=}ÇI"a��-«ÙŠØwØ'âÄFlÄ¾Á¾Â>Êy‚}„ý¾L\@Þ@I®ªîÁL—E2‘×/¿û…É³¿áxŸŸÿ›ì§âY~OÃÛa4žzŸ]çx6÷Ã;×Éwß‘¶áUa´H’00¶#$}o|s°l¯‘ƒçdiñ
!Þ5i{ñÛ0H¦þÝšåK„ŒÃ NHD—yÎæ‰y)Ùóñ
¼¢Ÿ<òráÓ€äˆÆ4"‹ YÜo—n7 3÷~ïãºu§m·;ã«¸ÀYýãdk»‡ÏZ7	/“È&í5ÛîÖ~´lˆÛ‡»`¿sÙÞîíEº}4ŠÝ“ áÙŽœõúNÚjì{tF—nôÙ»ÝÅÜNŽÂñbæÂÌZ‹ØâÖ:Œá9ë
ÖJˆ0§½lÑö§zß`?üp2'Þg/¹³‡EBZçÃ¿]œž¶ìg/½??^7zçã[7˜,FtJsøÏ(…|Gùðmä‘‹9|“0@ñi8¦¾›ÂrËs:'G­µ{'ô‰:iët‡•­Ü¨[»ÉUHãä­Çtâ¶[¥»íxs7Ñháµšõy	h“õÛN¢…ýÕ¸·jwO\?v¿>Æ{
'ûHÏ¡^qÛûÛÿbØN²úßÕåú/D'"º)ø^<÷;Åo­îm}Çïà´Z‰û%éÌ#oF£;2ïÈ4üìF{£IöåÆ6‰ÂEà¸NÇŸ$¢Aì%^t¨ï·Œc™i|ö/Ù$±÷w÷`Ùßº'æ·ö78mj¹¦ß#³¿¿‘8ÚßGÜÍù—Î.™ßu¶[ú‰-åâÃ£ô°?¯Þ‡~oþår
\Ygæ:ÞbFØ÷±·©³Õëæ‚Ï•Ñ›©z“x×{Ëi™án¼ãRD[03L,Žú¢Q ”‰k‹æ*cØá€µ‰àPñ´xu´Þmkßß˜ë÷t
z2%€žx˜×¾û…x‰;‹;c [nD>-b8»ÎÈMn]7 ¸ˆó
¼Ÿ‰7s-ŽU:þ§3}‹÷Þ¬6¼cù‘ßŒäÈ§ãw{½6(Êfr‡¨â³ö*Û»±V%9– ™R&K´™¤®Òfz$0º[A@¶ il5øœøýLg5g+¥Ê“kFÀð‹ìþ©;-"2ç[´:Ã¯ƒÇf¿%ŸÑœÙV¿ÎèK×mÛÝã3úâtsúö|þJ\þ
<~s¿Âßû„ªCøoÏá[ï¸œ»O—·
“¿*‹ÿ_¬{ñŽ%ënA3´Dõ‰Xw)O•qj)ã6¡pFJ»²°¡¤ñ]0&M
	–×âÖœð¶ˆþÚ‹f
´hC”7nh@nàNRß#7�·ô¾ÈÑÍ{´`G,­	C÷ÊžˆÀ¬½DMœšhhR:ÖàFñ´o¢¬—ÐdƒpÄ$1·ÑÌ�Žâ#×wA|Û#×Ô¨Ðð‰Ü8	#”ýö˜àØ
Â[{E(>÷_EqÔD›VÒ—n4¥±ç“#o¾ð½)\…ožLÑµªrŠŒi2ž¿EMôÄ@á£Iî„úÀÌÒõåW¼kOv;ý…-$tÕ¹õÎHTŒúÞNA`Ï‰ìŸÔ…1&�çâRáñ
p=[ÏÈ&u©Ÿ”–ÇÈ&uú½mÂo^úÅ³í
5'ñ”F2Ÿþ•MuÐë=©HépêÂj‘{x3žÓàùyzüûìããiø,T-Ð›ÕD­©êŠ(»…ñ\ —“ŒàŸÓ»(ôý¶ý}ègo‚*´Vì{óÎXZÛ›dýeøùÊ¨¶Sðïƒx	ršø$^âÃp‡nBoÈ%¬‹ÉÚ6ïÚ)4öÂÛÀ©“Aï®-ôZÂ!kûU�è¨éÈéeB¯¯Wƒ|³ãÀ^{þW®Šdˆ³ÐL=ÜœGá5RQ¾¤Çƒ@xŸ£0¸ð&Óäé gßØßÓÚ1à×HõëÚ½blxi:w²÷à':òÝúOÒyJ¾¬}µ¿1tf^pJïÂERü�°›þÍˆk‹b£Ï£ð3õ[{’}—~vëM2-•Ÿbƒ³À¿#$G¨x?88P¼þcíõŸ¼€cuÂ«•wçnà�a¸p]�gÃÛ„èv»mqr/›JÞz|ø¥ÄóÄé¼ àËÈõPý»(–ÄëØög:t>cÃøyOßˆc÷ù¦Ôuéðø0¥Ù±QL—:©Lâ—.\oàŽDJßŽs–Þú&êrY•ŠíüÃ7¸ýC¶ñ®ÓÂé—ºp?1ŒÚF\SÏ! ¬u¡åã‚“dZ{+	êÂ:ß¹.à9r L¸¼#¥•dëå‹,æ{PZJYâ…vc·Ý¦ãñ:/"þ.|"ß“6~îÒ›=ìNomþG¾zOC>™1ëpüD“©íãÅsŸÞYÞ<r=˜®Uà´£Ý·Û>›e»NŽ¤ë‚Yr7wA.>\$Ù '÷‰pìÁjöÈ!pîC£úïãÐ#è…QF:¹pX=IG£	´bšµ‘4A±rø]œ?Ÿ“ÿvò®‹máìHû$ñ`B§Ìki­EŠÙŸz¨½¢Ól˜¤k¶[WlÁ¼ÿj“ûµ5Ý–¡¤ægöAv2å‹ÄO2R$C&d§§y!ö&Uvð=¾F—Þ$µ)jÁ9Ë­8Ù¢´?Ý¨¢ã8òæÈ*Éš9ÌŽuÑ¦Wu6—5â·›ñ¿êmà<ë_V°6ßë±v¯Çš½>§Á'ô½¡1ü/HÂH³ã/#Ï½FjnÜð‘¿p»6Òlõ¸;_DóP> ßæ±Ý6›l³žŠ7*£pì:ñ#uÔ¦È½CÚTø,^¥‚¾¸¿J
òS‘ã/îxŠ‡u‚Êj’ù—„d
1‰¼ø†Œîˆã^Ó…Ÿ Æ˜wtX¡TiQêX¢TFZ�
õ/º §xä57jÁÌíš;^äÞ$‹¨Ìü×õUe>Í£~‰"óöD@ etPŸPµ½¤«2wÒ/æ€Ø‹HÉ>é÷¸Ã;Œ�K¸þ´Ü×ý¿Õö7c1bg‘NêøÝÑÉ»W­ªŽ<í¸®Aù§“3SµŸÛÂÏöªòcÁ`U:ªŸªÙ½;VM]«Ìà.VÌ'R7í
Õ¢?"ìOO…ßïEÎD²aû‚lRê–Ãÿ%“–\(Sað.•Ê–™|^n,Ù?â/©b•Šçtìvî:ý™@ì®£´®Adæì±¿#¼óÎ×O÷RwI¢óÎŽÄÒµ¯G÷§ýš	sD¹³Ð3Td
Ó„ÉàpÓÞØèÏ²x
…`Ñ¹·:Y|ZÐ€ñnä;‚¼J°GÔB¦ç7.üw,•ò¤ƒ‹˜&DxMêÕ´¿1íK·µîÄw(`É3pF¿tn;3çAÛö8‡ÆŠ@ÊÖHG±¬7ÑÏH5EÿÃ7´4¦ë/hDùH%Ö„�Ð*¨¯•í·¬?>ÿuÖ­ÐúNbwM`4êwÞwç#q†R(g¤7ïÓ–ôpªÍ}áÖ‡y§0óDîì2
#P'ÿ'… %™m�ó¤fùÈõ±o;ý™âa$ŸÄ�ï³Ò™1ýX‘uTÚ§ýC?Ì-µÅA£�S¡"ö›Á“®ŠJ®tU[ŽÆàÎuªY¨]è$ÔaKÍ–¢úB¥MTÎD¹¿ê~¯ð*1šC¬(Ç)Ïì¯Ô÷Ýä´W¨¹"G§HÞo
¼×a4£ÉÉÑÅ_½dú>ð’vE¯¦T?Hët×æ*‡ýî·Øy™áÍ'×>ü=õÇ
œVÙê²›u8*÷�oö1ÏM5Û½Mù‘H	—p½û¥{%[ã@\£Š©+zÒˆç�¢K$ñéÈõáÓ¥;[PrÉ8ý–Úã#}7†Š÷_0C'Œd}‹˜@"Ü9õ”ïýÂÕ$	M¥t¬ì‡7îÝÁ:ézŽÚT1,Âí–$ª6ï€€pJƒ;aItêŸéì07ˆîöƒÜ*nßêÌžAO]óãs~VöÓHAî‹Á@˜©
ìÉ­˜l¥ìã^à Ap¸2Mj<¦³&®IÏÑš8sì’‰}2«¢ýô¨RCéŽšò¡ˆ9ˆ¡9ÕJ'pJƒO‹„Êo’ÚEù¨>Âì:w$ý#C¤ÒÙ.+ÆTiíþ
RˆÆ# aà/á­ næ9Ú½öG…ZÚ.ëýÙMBÅºž8¨&qÙß¨ò¬ü(Gg
—¥.©Ø.=jól£p¿ VÛ½*r±Pi¨­(ŽÁÂ­T×\cL7Æu©”&–[UÞŽåGànw»ÝtŠ'7šÜ§1ø}Ž°7mØÜxyÁM§Ç—ß©ú¡	{ÌþDÆ¬ åÚÐ.ƒ_5Nµü)öØÜ,Ì>*Xw%ïÚn=¼š3´‘Ï}xV¡§@}‘ðýí	ô÷z@®&µ)ã¥%±Ù£Sx[¼žQ]•j¡R0ûªoã—ˆÏ^er¢©Õªƒlr¹ž¢¬zÈ&Æ¿°žc
)r?[u©æ²ÇìE´Ì6Ê¾jã‚iI£Ç/›„�ã’2Vïoip°iålçÐ;8á`ðê­<ÞY^xÇƒ‰Õw.¡rÅ*›£µ¬ÙŸn–ð_EdÏ8•–Þú‚çÊØ
8WT–Ï¼ ¡�nW4˜SòóÂYø†°Þýéæc`qsœN]›´
ä¶‚‡+‚ºJìµ	Úöf*E¡øÄÑøÀÎi4g_tégšÐHfÏ“=­i’Ìã½
¯;ø«ÝñxÚ˜ãA`ƒ*úÛßòíœ¦»:Bsðo°»6ƒQ?9h™Ý-­â•eê­˜¨/gäÑOŒ‘}wjÚ.GÓÅÍ,î®Uè÷R€–ü‚¾É‚²Žoð—€š.'›˜•1…«„¯ê¤,‚MJ¾êŸ%M2ïl‰Ö­^åNçÃFE“œñ™ƒÔÚæO”ªá6¢s†©0ÿ–H í+ì’nVîËUö³‹b²
¦ÈeÛVÉ[$Sê!ßÑz¤b2¡þ^
gö‰ ¤cåe‚þ,sþDÈl’}gàA8‡ñç”úÿy=ãþOÃ(Ïœ=È�õGž³Ód•–±6YëÇõ¤Gû3=þ±.S_(¹ò0ô.Þpøù¹Ã¾y²Ý2»÷ãcÈÄúkrNÍvX1/t\æ±Ê¨@».å¸5Å (ãV%\+Ì™=ÅùI.dþÃ“ÝÊ@É¦~ý[£…&`n
äémlsÀTaFéÊÚ<¤ƒ}»FÍ.ÀBû
òÆ»‘¿ Ážý†Õˆ¸<'×.f”ØØÝf¹£ŠÙ*ÔMùÈõé×–d1ØŒ\‡ãê®<‡ÞêP`›ÓEß¸ÀÞqg%»|EvGjÅM?8Ýƒö}i',îj·z)xpÙN)œGVÒó£:�ÙÈê&½AF§þCÙyéìý‰Æ0ö l²W]ÌÉ²æJ«L9óHÒ‰ºÁÚ½Nt©ÙáÐGå¶3ÿRØáñææ¹ºCµP€mÐëjêë¥ÎÃWû¦Òû×&Á¡Ê+Î¬§Y)-J»C¦z¦4pü,Zó8…mÒfÚ°ÎÏ‘	³¶í‹ýµÌöøZ›Ì=`³ðQù}p<Æ\=RòÀª €§©1WnL»Ë¾àC²/û½šY°šI¡pD1®ÙP®BŸÞXDëØàM˜Î‘Íï¦¥þ$�¼M||Éÿ*n”J¯ý(à¼_Jù¡öè(?—Z—A¡÷GÌf™rµ‘9¶€½«(÷‘IQ^cP°6ÑJÃ\~sûlKÀÀeì^ÁÄ_Ñ*²Spr?ô¢±ïšA¾­gÿ?y÷
{·ÈÉü0 É½}mÚ£¤— ½³È˜l#ÝéùQEàK«G=À
`Ih+þ•œ„òg§B<y›H‹3+¹6m
Wh'w=4ò8en‹ÑŽ9ÅÝ*!®‚¦gQF\äDåT¥R‚–bÒ\-¯é ó<‹2½gÁ"]E4ž6ºªv„ç”úÖÉ
ÿ5Bž‚‚O
òuñÍÔ¿“Ÿ¶:°¡fl‘)þG�ƒÂÇ}“ÅvØÅUð·7g_:t‘„¨–ØÍx/4ÓbQBÞ|ÒÈ¹•-]¢ýñÌB¼]»àp‘¨°\’pNÇ^r·GzëþÛïé’%ÑÀ›±pOá½>{OóšféÓ­š:EÆšÇÕ*ùÃÝì_º‘£üé–fÂªPÅ­^%T1É-¨ñ,‹x+û Ð
µgD.
0ÏqærGƒ	&-^“ÉÈÂ15è+¦4A˜èj¶E(³Q�\Ã`	bø:I–~]„	£ ±CékG£“òÈ<fìônæ…¢/› Mœy—`FM-¢yRl\S‡ýûû£s…³Žï^'1W…¥=4ìZq¡.q\¤äôãge?4`Ùj/0
‡eöÅ˜^>#¬T4¡¥`Þó«.y5¼8J{:ywö—áå	yuzörxzu|øZv¡…ù*ÙJ«€EÂÈÿ-»pí�€Rá‚ÍOâ¼åÛÐ¡þì†:á«”ä”C×²ã‚æcJîo)¡ú‰,ùV¯¬êè×™Èª‚®€ù¿‡�â^PðÚ„¥�vî“™†`ÊhÓ7‰<‡à)Ä>jç‹âO„›Üç¿ð¼ãÔl>î]ÔË»fLÝsàäò«Ð–Å`‰óEhffoX4Æ¯š035÷3Ð°1+ñ>tà{Žë£}Hþƒôº}õ{òØã?ØÅ`Ö-Ï[HP_aMìˆ-w­¡#Ì™AÇ×ãŸ‘Qï—õ
Æo­Ú51hD@â×‘ë8•!¡éâ~ò|÷
:Ñßî¼¹ALSša+ç^ä@a¾†çùfVZnø3Xì¸ß™^h5ù2(f^
I)Ÿ(•œ;òT &kÔÀreÁ½…º6–:W;Ôgê/\D~E"ÉÖQD¯ƒŽ¨ù„x5
µãŠ¡÷¬
@N‘y„r›™NˆÛ…{<q“.Ó )*¸…,’/NÂùyˆtÂÙCæ0#ôEù‘ö%
ÌwÂ†C×áxï¯ï{Ëlöb~ñ)+0¯ÜèÆh1«—^”rÄœÜîÈ>í0§‰¾�yó�{•©5P–Öôïu{>C1¥¶0I±]ÆÍ>ˆë+Ìš«l-çœéEcÙŽ[™jÖ¢ùÌ~ÆJA�Ñw®õì0;Ÿ/Î/ý"Ÿaúyg»4Ç¢•Í,[%gŒŠE{[Äá•­(Â>´£è­”eLÑVŠ©ž³ö7øo:È¯Ûóì¯•º)®ÆóüOÒ®­Ø‡Ùçép!0"+õ%BÙóËÅMìÆDøÎ¦O 4Œ<PûÛ€Ô›©%t~;&Ï`™¶ðÃncžäC¯;@Ý®…ëØ¹¸HëµZ‚bctšCcXZÅH4*óãªNF’àý™Ù›h‰ž’coŽP¦ç9tQh
yO¥]Y`Úç[´‚7F——ÅTuí–|PMn<MÔúæ¸Ðý<±«mq‘ÆÑßé-BÕå­TõVzYâaÙüšX(£ñáEà‚Ü¸Ñ'j7{$6tå&E0Fõb³xs ç¯ÝOáè¨HGl
ÚÔÎþ>¼0š$t<Å¸u\¿Éì»B	ÞìBzãMBà¥dáù_´w3}Ã$ù8›NŒOÄšQFñ`±¬Jz¿÷50É—Ô+4Ô–ÔÆaâ;ÄÙÄ‹WOõkÅ@[ù ¿ÁA‹75ñ’UÎìö#òÌÕZxŠ v7ä€8iý¹î8ra¿}——J¥6u_°î4r¯¡£ ÇÒ=:ŸÃØT6ÂqâÂ™¢
möãÆÎÖú·¥ÓzÉ¾¼ÿh9’“•è9 µ›Œb8Rn8ˆZ6åú“/K”taÖnàN=ßiãH¶KãqÙlyy¸È…ŸÝÃkë”ÝÓ\ ý*<E
DCÄ{-iÂr ÍT�‚Ï²ÊÄŽÐÎÝt¿ßÎbj¸ªfW
ÃuÖhF4˜V–ïxžXGslÞcòvÁ<‘ã;Ï§žnÃeH±~‹¢ÖŸƒ?ÉñkwsuØ
Vâ°Ð
6d%—+[ÖÊJŽªŠCThH
aågeu•ÑYÔ<rKahØÒ¿|ÿñÞ�w«øf>”­Üør‚L·[4àŽ“öÈa`ñp,‰�‡Šqä?6Ô¹l«Î)œRÖ+k.—U7À¹ñâ„WºÇyÅÝ8œ¹í9v¡Ýãy7OWåîq’ÚwÛs±6	NºôE×Æþ¾hg
ý5ç¾˜w¿þÒÍñGšÛAÌ÷CÙò…òµÊ¸U7ZyþF<Œ'ªílÍOâ³O‰7h¤�Ÿ[4®ÂîÛ¿ZõÓ´�ë­àƒ£Ó7¤V9î­Ïª¶Â)ñpP…ÓIÂND˜ÃÌg/ômeBH(òFœÛüP¤þÌ[þðH¥_£ÌÚ9sÊÆäZ¥ö¦ú~«¨ŽÿFsIp³.	Þ¹>:) ;æµçûÔÁ*ŸÉV=v-„C6£¿§ðÆ"ÂÔ6%]ëoR¶©Ôÿ€8sÁ†-dáÌ0ÁcÁ"/ò÷jó)onRôÏÿú?ÿr¹pèTÜ~ryþÆfeöñï+Õ?m‚¼€¾Ä¨Ü…1#ŒOWU®·éóÓMOÚ.b2ÏñSO}*‘Íìå¼G¬•Ê ä
÷Àkv¿ÙëÃ(
oK…V{OPhÕ"ÁCk­j é~Mm¥×³¡5§ý)\î¡`UÌšL)Éx—U06÷<r?{îmÎ9Ñ„™æÐ˜¾‰žŒÃùÜ\½^{Që6+Þb@²Rðv¡S£×œ¦” ÿIõÖ
Eç÷Ø°¢ØUþ‰Õa çG?™î¶ùR®êoCdìµ²MÉÐ
äGæÂkæ•{òNI£˜=þä}5ˆ_%;U¨ÖãÅå§AeÇŽ§MUlP+\ºI”{›H•Rò¨b(£�ªÌW-—×Ð“Ç«/Œ,ÇO>:Ø±XÆÀ])rñ nÕ¨CS’DM£¶ªhXÒ’
.Çc
‘žmXRÆˆáƒb‰œ<¸¾ãÀ~¹Ž­¿ƒ6b±R’‡»ƒ7ñk”ÃwŸñ¦nU§fMì¢î%î=Jü–}Úf^gè˜¼xÔþ;Ú¨?þqV‹þSÎçˆ^cãj˜ÞcÑx#¢¨m˜¡ÞÁ' óÆÊè<u‰(-·æÆð¤¯4§þ6¡°¯;ÈÉî6I×#È3ó5âneRkÙù_º%hâI_º7ò´Ù:¤©¸K5íÑ£'êùwÈ‡QòÇ d3<Â%]ðñIU61S·,³¿ªÛì],ÅOÕ–p?ŽJ+_TÛ+Ô,W½`»ÝDûËHÝ°]×€Ða¨Òçzx©™gŸ8 “tsNVÁÉBÚÍ¸dª®“)ç‹7êØ£Ž6
M™OaZ@¼á_ž²ö~ëlØÝ‰t»„+‘ÐøF¼
Ü”ÜÃbÄä€ˆõàÒ*lW¡
UØ®ÎÈÑ|Î
ÁçØf(o¹4[ÚÁI€šªIäÆ±ÐÏÉ;r~qöêâøò²Ü[^T^ÕÙÓS”»º8þËÉñ_ËñÌ·[ªžŽ0ÕaÑIZlNx_´ÅŠ=üòª~ÒXìÕ:ÖÀo-&,9ë•7“°§-}äÅIä±‡ÌT‚)×Àd}¾kÄ"®+$tA"/™¹„9°b¹di_
ùí#ª¯�Õ\…¨20ÆRcÓÇ	£–j3N¬§NKâÖ“ˆõIÄ2g|!U‘ð³aÎ¹æÖ}•ÔÂ•‡œÐ‘wî-ÁmUiŸ6.û‹/|ÜRfõ]¦„‡‡TóJ I®É#gÝk^rS
_í„u˜ˆN¼EbE)äi½ Øæ°`î¼ã{5¶Ô×¥kî,®QÊ«¤©mX(ímÓRS¦”ø6Û^0OŽ¥WÐÈâkøÍ•S†mm€)H%µ¶n(›–>#Á=jµPæ’ªWnÔÖ'Ó®SšAãÅ©5F4³¬e,Çó®Ÿv>ÀÁRuÕ©Å©¦…~ãK_­¬|§u%Oþp-°QœVûÄùta…Þ$p«Ð\�ªR´ò¾.'«VAÌ—œÊ"¢kšÅ‚çlCç¥%åRÍgä¸ÔÁè0V¶á (ÛÀÉ~´èÇ‹Ï€Â:èD»˜ÒxûÅxÌÍ
*æÏfâÀ#¸ÂYd5ãÏ$„‹MÃ\tÕ¦ù“¦¶jŒï¾FNä`ivú¸Û#-s`Îü€pÔ#¸­d°
ÿéà¢É¨Ý#ø˜/dÍ˜PØèåÑÈîÍ&Wâ8n0;œ4á>Mß˜05cAÍ™Q*±ÿ,ËG9Ae–çaPÕ÷=,j i®TÏoÙ$·*ØÚ¬dk¿Ìk<0
0ÉŸ‚ÌuÇ=…ßGëJ­Õ¸~YÆÞæ‰{ù³'›Ükwm;°«ÕºrÉV›¢­Ík·Ú¤-¶s¢Z–¶ï±JìÕ¯KÅ†UËÎ#ñ@áŽevž\ÁÔ,·q“1¦VÓíQâ¸V‰d1(o
î{
Ý…d%°mâÙá2»±9‚qºmÜeœ¯,§&ó;Õ†m5ŠÉL/¡Fä»<�Â"ôÜ|ˆÍ¥Í¤³­ðˆÛ¶ª»úHåbe}É"ì+†mNˆ«ed‹ò¤ÉbØ$ì
Éâc_LŸLNiZOŸêš²‹ƒo—Aãþ£eÇ¶ÅÏ­Ò¬EY|¬¨­ e?³öþ^'†÷õE7žûÀ‰¶HkíCï»J_¶žúÖEÞ²Y
Wêîv³HVÆgb°e¨lüB%zí±hýþ!æ=ÂñSØº(d>¸:>ÍK¢ã“•Egõ-ß2:ÇçQÒ&#€1M3´àšØÀºÆË”Ê=—é65”X­-$¥WVVí½¹Ï–…/˜èA–	²FŸ®Š[’`W˜7¬™½’Äì´½z�Vá0ö ÈVS¬A£ŸdŽOï(“!oÁ1`cƒR¼À="ÜÀP0ñÃõ	M7ph0vIäŽácBÇ€Ýc2<=Íõy_\m—uòŠõ1,º8ú{íÅIÝe&6t_»M¼;  ãéyô©¢œTzOÙåŸXiµ–ÓÓV•›‚q
='k¦íèGùtŽgsÃt …ÍTP/¬˜GÑƒâ½w™>Yù¦bö\/[êó›jØ&ž
É
sË†+šÖÇû•ÔÛ_º4O
½u£C�ÏöZˆè¬ìS-L˜¿Qò¯ºyQé¿•^Ó€Ä
oâ€¡ßôµ LÜXóŽ¸©>:¿@Àr(Ìþfgš}àûUtq/†~—.ü«óK‚`Š›g¢©^gþóiö«hYæÈ-5ð‹„&ŠýÈ@ëå8aÊ3¿Š—@“€díëÌÄRõ­î1JÚmºNF¬¿Q7ñf0
»×!´ø„Üû•ƒb¿Äþ×³Ü‹mîÅÑò‰#udcá]þžx©…›;÷\¥8­ÜéŸÇ™ÖYÙ~6ÇJG<Òàøº¼U‘îùÑOÐqSÉlG@£ÿê C«[öG7D~£œlë¿óÜ”ÔÐaîá½ªÏpÅ°Ý­WtôcæÎF‹J>Ál\Ÿ’±›ÐŒwê’·á4ˆ÷w/@_˜y8_ÌÉ(
oá»U·8~¥}ÿ·ÚZ¦ÉÌ?îC«HYÔÝÿæèìðêoçÇ¬U…¢Ê¾f¿æ0Á”MÏ/Ü:'—®¿ˆS2Å.°1y„&oS}3Nîêß‚é�¸˜˜uMgž¥Ê_»þg7ñÆ”¼sîŸ×É0ò¨¿Nb`—:°9ÞõdNT°í1ëÌ™+Û¿÷ÝÁ³ÍÑñ½‹T¾LUÀ¾7	öç×~œM€9…IÎ²N3Åmöåü‰CîÞ¿÷®û?h>‹¼I€ï©Ÿ`|>Öéý˜Ö
®-’}që¢Öpìö 	›m®Ü+ÄPÝ8sa˜-˜6³W•†ã3Í¶mgë‡­]ù¶Í�^;ÌfIÒòP{Œþ±`z9Èí¥ESý™bSÅ9ôkKFµ"l<à€	ãºan×»×ôz,œ8ŸzfQ Ž·ˆa¯Šï EqRîÀÝ½îÉV–Ð‘ïÂ¢@ˆGqxã?å½Â¾øtÃ³¿Êg+I——„óìÉ Óu’àÖI¦69Ûn_XØüÆÖ!B(Öc‘÷Œ½æÕÉŽòº½}ýìáÄíÅ)ì/^šü‚íìlonIOMÝ	¢8¡Ýí-§ç6ì#¦7^"NÄÝêÑë†PN…>ž=ëú#Û>®Ã0aD<ø-vð
/FíÈf§sŽ09ÆÖJAwÐS@ŸÐ	êm*Sß‘‡bÃõ$—fC‚Æ÷7ê¤bñºÚ³Äo†§dþ±ÓÁó‹ã7Ãó“«÷§X8çòøôýÅû×døòòø|>¿8ûÛñt yyþüü*-µCNÞ½¿¼º8!¯.ÎÞŸ“«ã7ïÎNÏ^H<Cå®„éæH°‰G/~5|÷êLæðøjøf|»,<3ô´ªn,×zù!È®ëäø[áw”œ•‚6ŸÉÙÌãâøðìâ'¢Q3×(œ%U9Ì*¾ÖÏÏütrzu|°•^_ÖåñÛ÷ÃôäQ…Ú.»ùÌžç^<Ú^×
ó’¾a/ß/þ6üëðf52á7_Iö>®Eù¢j¶ÕØ]C'é!‘1wü—H¡ÄrÃîþA+E:›½*¥J±Rëù»3à§ÊŽž¿¾-ö@ß4»íº6?_¯L¥QßèõðâDÛ"Ûé²/¯†Wï/Wÿçá[òvxù^¿\cç€7ß½Z½Óã·/ß_è7êÍ1€=Œ¢Þuø^JØZ
zû‰ŒbàcÄTi!+e+&•Gî¸(b%·*ar´[öíËG}OúpgéÅJ{y¾?‚Æ%íšº;-xqôÜô2SÐÓàËU\Xòi,©úRì·Æ†|…iô©ß2Î¸˜.ªxØ»ohtGoi`û2S›åë´{ã.[ßÄMN@ÈÜØ£Áÿ¾õºfêOwlqOyÃo—¬[¡Jã}[ke
Õ=wµåëáÑÉkù™ê´åæ–î*fNË½³ìïl‘<^‡hØÀN_‡‹(†[Xÿî{Ò"?Ó³|ZŸ?S
šg)G2„|\ë~
½ ýç?cN•®;ˆ—s´úý–fTzˆg[ts´ÛT‡Åt×„¦ÊY»ñ‚z)æê®°LY©V)"…¯e¬€ÈâréF[A®Š(”ÈƒÎŸy,ZþÌw§ëŠHxyŸ(£´ž3[9+*l6gBN7+'³êŒ¼È½Ïä}Bgxfù—<»i½‹L9™å4¿^cžˆ…©1ØL-Ù^û±¬£åcÉúºSƒ®*úÀRÂuAóÙÍó”ßF5‚rÍøÊØM
:úß0ØôaÑ¤;v•}1ñïùðÕ1y}<<:¾ ß‘«³sònø—“WÃ«“³wäòýËÎHº’”¿ú¸ÔxVÄ¥êÜ–¡]ÍåeËT?Xzž¦�p¦LþŽ™e2»€”¿|Xœªb|¦Úö’tá~æîiÏy’K¥êÎXœ*üé‡7Ø8r©ßA²×4µö=BÉåbD®èˆ¼d‹±4t"ÊRÌ“I_‚“§ŽT$ê£KMþ’ŠO Õ*+j·˜rG•c½”=ÍŽ7¨åÄµJUó¨Jž(½ä«’9žæùoeçÒèÜ<E¯úí²ƒØN=Ó™²ú›Ü‘LÁR`z Ë9�­O]7÷­ÞF·1R6ðpÃŽª5‰P)€þØp‚øcCÉ[:?Ç
ñ"p bþŽÀ/zô¬
$!—@
I°+§ÐKcMW¹»r85uçy=¥(‘cëoxë&‘7&‡½„äYûÑå@¡•U¿yt¹*îHB²`¬mÁ‡m×ªHµ:j»a9°UK™ñ#©ËUÊ¨æ¤®." hù”Y"ÍàjLo{H}¶ˆ”¨™FÀ´ì2ó™µóŠz)±2XÄ¦Ð×Ç5«ÃºWÁÔìØ%oPrˆ<šÊÁ„Þ�÷Úô u<ÿŒ÷"Í·>\e¯¾æ¥(Ê0ª‹ÃÙÞ‰\Ñù€;`“FüëÞ‚+7rxöA–R0†íý/àWnþŸéŒœ¢[Uôt /ÔñX™ °xŒ‡Ã½’Àw‹±ÛnÇ‹Ù:‰8/½˜‘ïIûK­ÛŽÊºX¦ùï­­ÃÿVº<°ï¿³›3’– –’)á>Há ¹ü×ýQmÙåÑÛá<ÝåkÎ¯z{0á[\­”§ÎîúIP@7Î0èï	ø3ˆb—	½^•aRþ t¸Ãy9DååñžŸ]\Y
:åšÓ[¶wG~ÏXŒÂVN*†¸@ª•¤9K#;aô[žœY#f;•:ì«k·U§¹°h^N(,ýa`J´ŸŽ$tEGqè/—9v61¤1œwúÒ)"ÏïØ•`D»jÙû^0¯èàËÏB}ëBšæ€1Ü)�»´@hY …êõT×ºN†§A·ÛÕõô™ú˜¶<ÌB‡S¸Ùnž_¢Œâ½´Ý.àÌ‰›tÙ`ÚxÂzPðÜï<ƒ5¥š*›"=*eVìÎ<† ÂEÂêÏa�0Žñúuâ‡"]Šzû”­ÏŽÀÐÙRiDë1Ë«œ‚âüJNYê
·9ÄRWögY®“»ùàÓ«–®ÆúK¥ƒäé3Ó[_dPPLPsEC^0‘ï,ó?{~éÎE%%ÞÀFÞb4<ªE5šÉr7ÍYfÀô\ÙõH|4æœ¢O:gšòš&>‘C 
4ç¤õÑá¹ðí{,çÝüþá¸¿ûdpœ“$, ÑjÊ®Ê®(»¿P¾Âüº 1k YOÊ9!w4G§ö"&òaÐ^ôó0p:`Wm’°jöJšß¸†š~?[úZ×–"i‘ë«H†ÙÊj%'k¥sV+4váÂª2ÐVo•¡´båZ]€]õC,¢EM
Ø½mEjØŠ‘oWY;¶zF�ÊJû§ÊàYÔ“Õ§u.ÜG¤+Sr—Gá-÷d²9xš’÷³˜¦ÖiCÅ8‹"
7
áÇ«áËÓc{	×¿¤"¯25“¥Üš¿ŸV¦?	gx…¾?¢2_¾´#úV—R*ÑotP†Ì€H'†*ƒ
Š‘T!Pâ†e
‹ÐÛ]¼Y@ÄZQ©½Åel]à‚¦Ã´“þNÚ‹]xƒ}‡¦ ‹žú¼'c¨„EW©>ÂPaîj—÷¤ºÐt#9Èlv¦XŒf½>ËvÏ ±r¿¦¨f§;k
åÐtšígÚ“9àcÅµŸž½^_åÿªÇ=<ºDœ R@;’þ!(KJ–2×§Ï/n§¢O©Ü ŠÅ”t)Koð©–»šùº%bÊÌd•Ä÷L€ÂþyÆ
˜{)7‘Eéi»ôˆè±¯9)êÎçV;†‘4Éô¡>«e›§±jßð&«¨<@+Û“¹ªØ
V2ò7L>‡,¦	€VHš‡*Ù-Þ¾¸üêG^ö+Î¹aŒ”aî¯¡8àn> m\•Í(ÕÛ±cŸ²YÀÖW8ÜM.‹%¬Šn§é1#¿¼ESVÖ6a7>B�OŠÍbÕ¬_ÏüO3{j?ãÁ³/~h’ýQ«:ù»g(@,ŸQžƒ[LÕÝp6²ù\bþˆfdSÊ2wé½O(Ë^T
ÎU'
ú²ÉŠO#ä+Æ12(ú½!Z‘ŠW±áNŽ
íc%wLËxÊ¦ƒ¹pEj‚‘«‘™%›÷èJõ1Ìüš³T‚LaòJ+bñ µ{iõ¥�ÒßÉY"Sn’„1-Ê¾‹Oãr"Å»Ij(½
ßÒ€NÜ6ÌÕ¢¸ˆ¬ÞåH#¨êµ>
=Ä¼“¬Çf•KŠÇXÃ¤xJ§Û°¥êïYE¡ÈAY	›‘ÿ"B£Î
°+Þ Š‰ø¤õâ_bn¹r
6Û>l‰ÖD¾¡ê0 Ùc.,/>ªÊïÒž¥Î[•ÚßR}WÇžHi’Û–†·Bz}E:œ!•q5‰cé]ã†iÂÛ‹&E˜;“ÙÊ ?(Ñ$¥Ÿš ¼oXUàµßµñ•�y‘ua!Æ31‡æèõÂÏò$;üG½“Õ×k÷ª¸¨Á’½¾9y÷
£²†ç¢¡0BÍ.*uJ«…+Iâ“v³:w;j×µj÷Ð
ôÐÁË*‘Ï-&LAor°ýâ×l*¹S]úNžó»i7øRÕN·®š¡TM¶÷uþr×,S€,©ÒA“êÐ÷”å¨3·cÃ½d+=hi¥žÚbY$(ìé‰%+ì‘×Ü˜ÑyÜ„áÄw»ãpÆ>¿øõàÛê¶¥	`ñŸûuõ¯Áäþ»¿ôw¿É|‘¸ ü9Z‘HfxûÓÂ÷¥â‹çùþ?Mîµ‰®èúq\‡«:øôNã?QåÜù}.w¸æsyÍÀzãYent"hâd„6ÖÔ1ˆ^¨¼«õ‹•„ògå&¼€\S‡ýûû£s…3LôÍœEÄ’érõ•NónªùÂ�¢z ˜Œ˜×b±NÈ‹gŠÿƒÖÓ�fJZÞFÏêP®J6']S}J|s‰[|<{@‘é~š|ŠôèÅZ,J¡óy¯»mœ§UÕ•rÁÜ>+˜Û¯Ìm+Ãt|‡Â�þÙ'›½ŠöŠEì•
½ÙÔU1ê¨Ma©¢ö®1*#{†7Ìy³GþßÿÇØvù–&Ó.ÛC›ëY0·ª¸³|7Ô!YóU‘ìè®e1CDÞÏ™Vü
�ãfêE{Ë1*�Š¤œf`–ouž@ÝT¦Èúy¯”³~ŽÈ°ý¦¢ËºŸ÷7A'fÔ+’‰Õ¯ÊaºR)%ã_tAl
iR$×Üò´µ[’b*µ—t
%¸¬ÞîY­äS•Z€¬ˆ:È¬O1ÌÁT‘ìúð+õÖ…„ôsÂ“rc•Vä(ÓåÊíjscª‘’“ïœy¯„KÈz3§8\óÂ}Òú½mÕLÍmMB‘hj­»šAýaÚ@iZ¸»ÊV4QšÍxKç'ãÇØ‰¢Ð”^wÍdEäÏJ_‘-}ðÃÏÊX—ˆÜŸnZÖ-¥Ì2ÕŠ‚1ä§„è‰Ò¦	Lâ¦rbŠ4sô™	ªãÒ¬£Òtòhæ;ªló[Ä±¯N
!kv1b9iT³Êgg9CÁ¶dqa};OvsXÓŸäê¥üÞq—V–œ.ÍÂ³iïàº¬TŒáÞSˆ×‰gþ0È4Ì¡É3„V<ð¯*5mxq;Ï{”™8t1³›Ú·J^µ•VR¯”¥3¸TxÝÝ´òjYUþÙÀñrI-ƒ·¼ ®PÇ½ñ+yÛdÉ@‘¯R«¯îQ&)¾g¨Â­“MšiD¯&¿¢î}`	zÈ”nyS¯q¡{›ò½L“Ÿ®ŸG©‚kÇm¤K³>B¼Y99JKÔ�êpv¸OnáÒL;õ‘e^#Õ]÷§-TÁ’k4,LOu‡ÅKU­ˆá“Òä!Å#ë�^ÄT¡Ú`Ÿv§Êô‘=âaK2VØ«šëiî‹`sÄƒ-ñÉJg~˜v§\ñ|à95”ù’lÔ’&½Ñ#k%%:¦g+Ö±oRÂ^¼ãåúš-à­:<£«òÿý_ÿóK»bòÆõ=ÕÓõ²&U7miÿBI“üHÒ/¿®Ô…–\¢ÎÜ¨
4˜¨2gUÔìNÜ„¹ôüÀ¸wÏL‰Ó‰Ékšï6ˆJÌý3­|uN‡WÇæYYùµ{&ÜÙ¹6Ï¹Ãz±r6*x\×ÒÇÈíï>?Â9åj”¶…ûðÎÜ ç:…ñš§„ä<´U'±üê&ÔkàBdt*éŒ!õ2‰­@H‚Âª¬ÃªðÌ›=…*+žUB5t õ":õ¦4!|s2o"ý«F$Ìì§VÙdXs+¡ýa…·H­
Ã›Õü)q5úÿÇ"ûbÊä¼NŒü@ùÍ\ó	9BíÏê5ñÞ¾¶½u".¹?®šQ@×½|WT2©Írª¥Àú¸uëT®FÚ6
­{ÁgØ¾`¯¨´^®Ž>Œ;c5eÊþÈkÓMÁŠ»y¥ºj¾ßZËBÒ£WëôJßz…7nÐ*{Ø¥ÐRÔ@Ú™¨òo)êP¤)-I¡êRãÊE©ùÞäm‘{Ã½ù t^FG>¹> �žs[Ø*›Y–Œ½lwù%)·ð`Ð=r L'nù§´’M«ˆy@ñ±Ü†Ø?‡¯Als¿nœþ›0p¼Ø#/©w£]@<ÊÇ1ü”ñZkš…²ÔÌ‡^4öÝfµ¢ˆ­Zp>ÞªË>ò&‹€ÞÐ`å5Ÿä}¬_0K¢¨Yé|Í}íÉ¦ƒ¬ºÊ‹ELo6.Ýè³Û,´‚¤ë¶º“å±t{ôŸ 4»”‰ª=Ê&dØ#¡²ú«ºÍn®Ie
yÝedÄ×®,ƒIc¾#'¿ÒÈ‹¥´òIŠÊ`Ã'@*@paQÚŠÕ’ñò)@€û›V©}­”á¬BC`ŽŒ2_…ÇŽ—´ƒ…ï+ä$&\dË":C*N•¹™ä#¾EÓÓ¸þ¾5~ÙªÝïr×ÔùbéùŸû€cRk÷®T˜Q	0rC¶¡
Ä�SÚ”}X–ÙnçB”¨³séD|y«nØ:)36lä“[n‘§RÞÖ{™/dÅ#×+bp¡Oþv)cü„ù1mzI¬&©•´dÝ.`­U37•Ý	RÀËk·4*´¢6\TÜ'SƒÐ·K¶F¦îÍ®¢=Lp#QˆvJS/Ó³òüÐÙ~W©> Ö[ñ`Ü„J4R¹Å~´Û|‚Œ#RMP^rP©©‹Ævhfu_™ª}ý^�GÍ%¼&²Ê*ÌFÒŽj®2Üˆ£•][^àˆ\(x…Æ@ŠD¸°ƒµ¼1
%b…J+iä–ÜíFåæd¬T¢•*A›9îÈ«•eo›Ô4•7‰aL»Ö‘BkŠeT†õÙ4•ÍäÙÃ7XñÅ0$çÞ¹“�¿
%ÌjÙ2Uaš±2—ÚóÈŒ¤éÃ0ê®hŸîoÕc¥äTYõÀ”‚RGAöçuÍ¬ýöSmƒó k¿’Ý£Â3¸Ã9Óä,’ÔŒÊ5û“4ù¥Zuh¡eæwE®ð°S-—<HMÍa¥l®Ï"ÕX¼]Ê¥±-¦Ò°^>Qä·ê¤œfd»”eÄz&¥dÛ½²ÁñÉMïâ.˜ŒŠ&Ë¤‚¾Ž3\²¦hÑÎj9Ý6{Ôæy&Gx}—:&>¡xÒM·ŠÁÚ¶À1
5,vdvlžn¨WRÉ0[ uK´|³Ðqý«»¹q±„¯#ŒE„PºÀÐ-
çaŽ¶©O»â[Ô@‚áÏÅœ,9c…E¼Ç.ÛÊã…Ä
içÞôJÏ“Â.©å´Ef,wÐÕ§GäKË“á™òŸ<Ž;ƒŒsÂbÝ;"i•ü¡M<’…ã+^$$Ã«‚J^Òhvzl¦Èr‘Øû5ƒˆ€¦
«P:	z[=Ÿ
ØXŒoåóðXF‹_‚Wfòmàù­ä
P«ìŽO·H¼„úÞØ:Ëˆã%‹	oŒLý#Àƒ"/}½©J¤¡«ø×€­ACØ2¥Hg :
ýV e7UîP¹*lJ8{°úlÈ¯„úàÇUòÖ¬¦mZ³Ò™U,X\[e“-¬±A«üX¤+ûJª¶W1ž˜O¬Qª0‹«wé&	0•±½Ÿž­§Þ
ÇKã»`Lì½{ÆapíE³öÇ×t¾@=AL{ñqmÍ2ù½¥^BœóS»]~ÜÄ=
Ç‹@‚mf²weh™r�ä£¦
P»öVðk†¿€h]Û±YvZÍ]®Ÿf¯"O±uÀ6$XPGîË¬jæ²Šyó¬Y<HðPHÉwQfù+Y}ŠÐ&6ÖujJcusªÉUnIž“ÁFÃ?K«˜TZYÌ³â}uLªÄÂ°¨4êihU‘Âùn�A ³¬R½:ƒÆä¨‚‰D/m+ùrU?Íãß�ÑÁÆ™Ü4¿¶{Jwy)”ŸÞ{Ib‹{
¿£!î,9
ë—r_£yaa¤0ŸÜOôx-¦ÌÓø3ÈM1a~¹^œ`ê¯ë´Ö|Ý×HÂ~}ë²Y9?`!ËŸ{Fî^‘å„fé>ô`³á_aêAö!
ÿÌ?ß2½jöãÄ€—úëd°N6×ÉÖ:Ù^';¿p+©N46R¶f	…v%Q¾œ¹¯s*WævaËíñì
ä¶ó$ºgÕ¸”íçî/¢‡•QÎSmýù»Þ~ÿrê¹¾Ãœq3:¾»Š’LOrµõ§wd±ôÖ”ÏdtËTÃßÆJÕ$szaÝÖÂa»ÎÝh1¢S@ouž°„cäý¤NHd¶i(,OQÀŸþ`o³GÎß’ÿõ¿ÿß¤·EÞŸAo°£]^26ñvjmšg£‚©3ãÞä/†XC¤w&•‚|‡³›[l±aç†¥?Óëˆ’6£çºÃéž™¦ÒA
Žþƒé­`¦‹ YÜäZ¯nUèŽG.A€zøÊÌäR›Ë•’L}L¦­çsÒßîu{½žýv}Øxð–dÆ{Tæ#"‹p^fS—MöW…u:f½á©‚2ghX’ë-õ–$;Ý'HmTÊ&Eë;ÀÓatc¯¡ä¥*OÎ÷HÿÙ ÛßÙíö»ýÞÖcØJëN@èTÖÐŠdÜ``úºÉe‡¦ûÈÐyòX®Tl¿ÄÆ#ëÜ/s7ˆÝø_KbûƒÅ› Ù$0?+">dx¢¨“0ð’[¯“‘Gï(yùòí:=É¤@ï†øiÒ¸G
=±ˆéø‚I±1«—è·XàCQbYè‡ÜXÝè)NŠ²1œxn*œó¨±}™ó®ø+¦ÌäNr·ß'Õ­Ó$î*Ó$jdM“-Ô*‘¢µW8>W¨®¦7 ]¹ÑVÁgE±¹m6Mª¨ŽùÒ61ïµ.¿aý6êD³ìš®&˜qçw
ý5¤D}”<‚òº®š\œËÊëlG°cŒüÄD@
H;˜[‡µÖŸ1Mà¥Óéj›ÒÜLh½È¾×ÓµÄ|×NQöák¢í	7Æ/ƒ¤¤iw¯þÉbWÎ±nƒrà%‹z„;~IõËå;ó–²²/¾ÕÎØÎØlÍÀÚ«Z—Ÿt_^Òxqót;ó¾ù)±t­Y®V‹½yñbëæVìMßjl
À÷ÓmÌ¥{KÉ.+y	¬RBÚñFðoÝ­YìMþ¶Ýæz¶Ó·®~Ë³H~•Ýùå«æ&­d.¶(¿l¦Îúø˜f3éK›çÍ¬¦Ò®$^zHŒÀÏÖ²íÈòŒ›a.Ü±ëÍÛˆkœ¤”eKÌÊ7|x<¼ÓcÎÊ5|ÛÎ5Üzî€Pî™b™\ÔDÛ–òø¹Ý¸»…EäB“#~&(®Y2hÓž¡Ç:Û%ŽYWqU·Ù½Æé1@YdÙÁa¸¦òh8ñ§H}µb’'£(ÙXx,�%»Š)Ô&È-™«‰¥RZ½´TEÜv6¿oDÏýAYõIX]-ÔãtfQ§¿ÿ�Tì(Å%¥²¥RSÒPÇûC¯;pg¿0{^±z­A”§oz¹ð)“œJX“yºÈ”W©´o5!4v»[oSQº¶Ôü»dž¢RJ¢Œ¹R¸Û²œYc5`–_'kkütKÄEŸÜÍFnLÌdÍÍ7Ø"¥â(ZúvÒwÕÈ<Îkr¥É»ó¾[1(XÞcù�Y×÷tÛù�køe5ÿcV‘à0£"L…ÁV/í!G¾øýðÍôÃ`2A½¤ê^*4Rõ“ÈjmóãV_·7žƒØ	÷òB½�¶D¬TY®G‰e?ÿÊ~]ö4µº¡×sÏ=œÒ(ÑÒOh¤¥¿XRé@£¾áÏkq (‡>­õ,ëØÖ¶N`­¼Z¨%²×7›¼^è{²×V^ÿEÏ{xÅ°j‹ø`¹ÓÓ7‚æw
çÔA@
Ë‚nëã¼¡³ÅÖ¥sî5°x‡.úy¾Ðú÷­Ÿ¶vŽ·±q¥wú½—ÏvûÍÞùiûÙqï¥ÉDº`¨mp†~âÍµjØ
3Èc›Úe{°:t†•½Ìñ™vbø¦Šz„ˆu~9<‘\dzæà™é(¸A¯<ùŽ¼GÇ”öÖöŸÖ‘^þ®¶HÈä°Â6eè¼q£O”´7ÿ‰w*Oô°Â>½d¶ÓS¸™¤=è=`%Wï£{Äã©ë,|·–®×¡wñIðŽhJH›«F1÷?j+…Ñò’�Ø�`]æ¿¹4j¯­“ì;ÖM{|OúëÞ_±w„ð>*KþpDïÎ®#—ÔÊéL¡U“Y¬“~:ƒ»r:úÔÂISJ¿ ;d>uHÿG²±A†
�µZÙaølóîki}ç‘û9_Geßb79¤>&¨þâ¹·õB¤ªò¤ãÊ[•ÕZ´ÎNVm^ù¢Ô]í°¸´¿ãå}ÿÀåÍ°–k¶`‘µÑ2Ý~(ë¿ÖK€Êº¦Ð+†º;¥ÇV°�\î…Ÿ$I¢ñFÂ$†QDïºXÕ[Üº%áI½öÄ‹Û®Nx­Ì¶ÿ{f}ðÊ»UÛ‹”A´¾rƒí§€G53HParé‡<=v·ÛM§´Nào\ó/Â†Ám}E“)P£:ãJ_ÙœŽÙ{å¤ãÎ\ž¥ˆ
,$~Ë
)Èšc	A´‰^œý||xÕ"ÿ ­«áåöÇéñð/Çì¯óáß.ÎNOÙßgW¯/JIÅÓlÄ’¹¸ñ8òæhjÎ5r¹‹ÖØ•ü|ÿáÜ@q·Š4atLÇÓ¬M5û¼»ÆÏ°lÜ“àá¢m9‚û©\JG¼´ˆzu—ú»ïdoBÙAÑ¤ŒjvÊ2ptç‹xÚ®Û29<H¢8SøxÎ7•¹ÔA/Ý=òí2­›ôQòV^ê
²ÔÔÀÍ„
&²ÔÔl^lì‘yWøXm{_9‘*þ.á¡„Æ7”$699ð(Wƒƒ‡@Áƒ` Ìç¯8ýìì¯`Ÿð¼±6|S?ðô¸J¨‘´â¤½Àñ&¡ô¤Kçœ¨Ï¹|ÊŠsõ]úÙ½p]�‡-œ¯/Å~9#Ý°ÇgØéï¾#ì§(±DbëQ$ñíÒï",Ü#´ø&ìÀ	‡7(’Ö³Éˆãw#—Æ‚gì
m? U8n“[Ã‚‘„ºP`—ó–ÀE
„"ôr@¢®ðñÿ ~wöîøÏ?Ö_J™2ö
žcâÿOçíÛÎÑ‘ðBÂ¿É^ÍjŒüøoµÞy–:šóá¾‡{Ýëí±ÿo­ÕçÅxÁËêë¶WîëL¨âÿ¯ï8pi´T†['ƒÍu²ýÿ·VÚÜA¾;Ïó±óÄ#x¦Ûç:Àÿ&ÕwÅÃ†kÊ×XÀ?fñœ=€jY	Î‰8MR!™ˆá#ŽÛsöô…ð÷^Æª*ñª‹JÓ4›¦¢È[Šˆ±"/#ò¼{)È4BmÄõc·r�ª?†"˜
8gÝÇÄH2õbòŽ@˜ÁxéEßMX…0:À# \y3·½V™KzSé—Kzíž$è‡%® Ø™k{b‹Êï¥·SÏwI›Mfÿ @@«…>öë#×á²hÿý÷Õ¤$,)Žñü@@o²<,vÐ­ƒïÂ\+{Ãúü+‚¿Èâ!Ä°ÏLÉÄA„7Ù4¸åËQü]oY½"õÔ2’ƒ¯âë¿¿9ý[
c³Â£ŠSÝ_vn\Xû‡úèüZÊFyy²ò8ý­&½={wõÚ0NªéH¥j zW#àÇnô»oÁ‹ýS„õ{d>êH"|VÃÇTà²|™ùý©BÆÒ4†…qCaÌxÃp¤±°ý˜N©ÔöÿÐø1ÄùV²DÉFƒ„.Š|"ÄÛ„—3^'™LOX¦EVö‰:· $ÞLÚaìŽiDa‹"Àú4ypÌ™1ü=…¿Ç B­Õü=t9Îò¼f¹êßTGð[6ú'×=·Kn:57n™m^aœ:œºŸ£08Å2:¦¸9MLÂ¯Jç|ªIìì�¡ú[…û¯6ï²¢±—m½Ú|gu¬¹Éãu¬¬xîêçª3Eps-îñ‹/Ä=ÂîØ>Â{yà£¢jŒ1ÜqÓæÖ©ù»1W±x¶7‡ùZú°V–ýC‘ðE>w|–ZÀl�ØºzŒÿüõøˆ}zýÿùéâÿ¹^±Þ¿kñ(Eo-§w†ÐcpI^=é}‚ª7^tÄ\%%ŒàQ«L‡ÞóÇ4oƒ·¶T–`?4tÔ¶†�2}èË²0ƒñ"†2š:â
[lÉXZVÚO³+&R± çÔé|»ôî?–Vi<wÇpÊ¿.häü­Ê
¤ò“È¯B´¸hz)˜‰†‚£A]sSD£òµ;QM©(2
WÖ!5±xÑ¸‹°ƒ\ðlÙ©$.¯Ä*>mîáv3wŠtcqÇªï‘fbÀ¶?‘øu-1•)‚ƒéD^#Š?X.	«o´GúÝÞÀ”%µaJb/]î€ëdžèqâÔÍõ'zžE
¬}!½è¢¸ÅÕÌÅKæ®ÚAx�·õ€/roà„[¦s•‚§P Ì&™/Ëß|‘šŽÜ„z
ò7¢ºß‡l˜1Ze ëP•PlÁåô»ÛŒÏbR‘wÐñ1;v¥6…`ôˆ§‡Qgzœ¼—K¦KZ¥XÜ¸»\[&”ÁYµg«6(‚ä¿aJã�{¤”°Ê
b}iµ¸j!ýHúšO§åUj’œÇ+I|ä9% /ˆYÂ”š ×JåŽ×°²	¯ãâ™™÷ên#:O3ÒÏ–YØøW`Ð»Ûî­“Í5Î\!gå|1òÐÅ¬Œ²pmç‹9#w­
lw›ð€8ä[Î-N¥¿]ºi}XÃañ‡)Äàî¨`|Ã˜v[ÄX<K	šßD‹„ÝWdl›=É¯º)sJºˆêK)±5f×ÍbYÚðÇÍ4üq‹]ìk&#Zgß©C‡ÔãáþÆˆ­j´
¼îÖ±Ç)Vd¨[UðwYLEUï¿rÔ¬¨‡Ø"êäe²wKD­¢•@ƒó÷uÃi³ÐÌ”BhóÈZu,mã0Mmø›¬ð*q©&AsW†\µýÿ›P©¹ˆ:ùÓ²½2¾2çmâ¸×ôÈÇ\©CRù]ÅòZg ­_ÊÍQf·0®Û¶†„>œ°È×ßÑfØ0eªz¸Î'··Œ{^–EtåÌ»À’'í6]'#vP4—Ð¹IœtÈ¨ò•Zýc­Ð"|®$@w€\W!(-�’^‡ I´{…ß’R×;¯YyÆ±mkå¬Ü#)Cµ¹vH
r3”L~ÒK£n¨ªkŒÒ©,p#?;Þ›U'«JäZù×œý¦È„‰tC ‡^ÐÒÈ5AÌìÜ“×ºvÜ¦HÖŒé6Eª>B³Ç
§Ëže
A¶¡.ª¸ai ‹úÉ‚fâ)à7‹7Tœ`ñ¬–~(·^æÙ9‹ÆÎ4+(Ì¶ÓJÔzòôBjAmÙP5l¤H
Ö2™‘‡èé9iþ~G„E™É+Ï¡7¼0çg×¸R~ôe;Q£‘ñ“™8›¥¹xãžÚzêâ“
òzš�žVì”mþ‹<ëÌJIA‰OG®:Ì¦•Åõ�ú“Çæhs#ý¹zÐÐ�3C–û\íú:ù»ïÈáS6J£ìúyË]ùÙõ/w”;ëZ.ŽÞ`âÃœÒ<BW%_ÈÇK”˜±h±èÆrÖŠø,Ô¼ÂðÔrf¾@Ÿ‹BêQ£,;¾ó�rÏ'ÌO¯°y@Y•GNrfüRòÕ2bîu%Q¶]™V¥
gayË2u,½×(òþfîý†©üÿÀÕÕÞ`’”O°Ê›ó	`<z…µcLtƒ©˜àZ¡$@ÑÇ‘¹<ÎŠlû7îœ&¬±tyvþ®¯¦v¦Õ¦ƒZÞï)]jmÝ5Uê@‰â+V£ZR¤$õ"9…t—±)&W¼*`~QçÉz¶õ§U4Bj}gƒê•Öõ(ð¹�þ´¢+ÍoÎ•ÂE—hòü©øiM=,& ­ÿ
‘/¬ìý\(øZºÄ?h(è »ý'ÒFÞ”`Õã‰Ç+<XæE.¶r'TÉR*ìëXIÿù—Î6+ôŠ%
E3‚˜èQ¨©!áÔŽ¶;>×År}H¿·­<ª£ð6ðCêa�‚SâÝ(öKã.ü”L—îlî·îÆV*@
Ç§WûUÒkKkïnt8ûau³ŒÞ…ÿjå<5©º–ÎI—¢[‚²·eo•À´J£
êUö<éT`Rª¡Ó3ôÞLeÙáOÑN?¦4d.-‹1ûižËp„9à?›´»ÔOZº&ZS…>É°I1dYTÒžÂà[ÇÂ×µ‚ƒ¡¢¤MêïrÒç•~ét‘÷ÕOWW×Î¢°X“»Ån|ïûìrRÖ¬‘ªGè,C†£6vÛ§­íÉ3­]Þ„QÆ¢˜¿©$ã,q`¦ÌÛínoô{OP‡Ož;·ZŒ¯Aî\6ˆ¥¯+&ìG}ôaeÉY÷HÏä;H2×á¥ÖîöŸZæu)}õˆÎhsõté’á4ÄŸìÉÜÓ»ÄJ¥Ø'5‡¾ÕðÓ
W‚ILhxã9ôT¹³=Ò'¤oe.ø€IŸJ9ô/p¤W¨í%h©©¾úò×=Ö­ÁSªJDž´S¬[^;Ôê™È<I2JP«ÔRòåÍ«Ú–oiSÇ7@çYò;¬4:VúŸK3ù«"úÆ÷\nÉ‰“p&-¯÷TåCi@?±òmhÕ$78‘uòÙ
œ0âQÞ‘{mÌ+ˆ†9/þzÅC;eÙq¥¢ ‡^4ö]}Ñ¥G®ô	<}ñq +ü)ãí¥ÖH¹£EšqþüªK°
&<¡ŸéU¸M¤	ÅÞbVcÌ;@™„‘¢±Ž)O4Òú™ÞÐ(Qõšå‘Ü#›ò<qÖMcxBÚÔ¨]7À,0IÕOtŠYjÈiâèþÐÄPyPXøå"¢#õ~+ï¾æÒ_ùáˆú$­50Žá0£¹~é—‹QŽÜ¼ä·®£,Q(¬×°Ü³€¼Æ2*–ëMí½cÄ;‰N_g”˜ÊŽw£ÑK”cïöHg[%ÉKˆìØªø
Å–R÷`·j¸¥÷ªVjå¤¾éëªyÕJ5Fó	úÇÓOi4LÚ=¥W’žÇÔFKÕâ¤ê,>ˆ›¨^ï—…w5«¯uKVÊ“É¯½–¯&‰ª™³ô¯s¿Š,×=™Ò¾ªöM0_¡úÈÔbƒÎJf]ß9µ‘Õ«ê¨¥03NÐ¸É
`ÿ?���ÿÿì}ënI–æ«„µÕ©Û¤$JVÙ‚UÚòEmÉÖHr×
®™"³Hf²3“–Ujós,°?æÇ‹Å0o°¯°ÒO0°çDä%"2n™¤\®êJt—E232®'Î9qÎ÷É±žv¢y‰5d¸ †Î
ö”1è	¹J9#
÷’!=bí‹=«ñùô„ÎOA
1Ÿôn&«KœÍ´¢ëŠ]ìî!â©ÅQ†â
¸-–ë…çI\±É²ÊŽ(öé;ò6žRuŒbà!lËòXxÍ?FWwšýÐ ÷aƒLÞ‘	]•`'‘ßU‘¹˜7¯Cx§·UË:1w4	jeòkÛ+Ñ×–Ìö–ÌÑÞ„ÌÖíñwyœŽa	Äô«öuØs�ëžº<bL`ôÃèc‚ô7×G­ŒÏèú8â£@¾&tŽïúÎäu	¦ $É<ˆø›¹÷ƒ9=æhVß ‰A˜€#:ýY<L/måú(œúõ»œÓceQjjóŠ[ôRÕd<ˆË…øŒMƒêÓ’ÏÑ0¯ÎÂk˜;Y1µõZ«r‡LúÀ¡]8äö©»‹?÷mB$­6ã^ò!šÓphØ¬[Ç—Þ²Ó6íjÜ\ŸðªØ¹!ùVuÞÝ`2c€yíèÝŸ ûz{­­mcW5›ùa»däáHÉ¹Å/Óíy
ô¢“ $Xc™¥Ó	ÇÂp—!ÓÀ·zînhâŽ¬úa»÷È¯5è¾Úî§'vÜ=ÑÄ;YõÄã'~ñø^;¢H<‰>.5}ì†C¯ÐÁÇu P"R‚ù–¼·`À&J’Û1O*â‚¶È0jæ‚²->²§¯Âip¯±«BåíKÆÙ}îØÇdãM²‡ÈAèj=Ñ×¶Lˆ ÖKG˜ 1ýîï†³mØü:DffV18ÕÒá€†½—&¢^ë€Ä9 º~´ØoŽŽ<›ónäb¼L—SÅ@@îkîÃÏ_*¹né¹ƒN=ÿLq<ãáû/”Úâ«m×q�^Rú'/’}ÊcŸ…-ew[õÈ½¥º]jmÃ‰>§ŸÍ\¤R¨úÅáklAIüóÅÍ“ø*”èˆœœlaæÓìÃ%,ƒ³5’]}¸L…wöµßï²ü6C:EO{k
£4@ˆ0xÓ(¡CÜ¯;YÜ¹=+‰g¥¯i–MÌ³/æ;‹ÃiKúäL¹XgÙ<ÝßÜ„BGAÚ]@iP§qwÏ6çã^±½ûxowko{wï	˜ƒ½Þ7ôI·éå³ëƒmX¾_ÿõà±V€y%j†"Ìn@*êÊ0djèZiêÐËèÃú§ÁU†ÿþRÇç%ƒú‘ü.¸ûM@‘S§F.w‹?8 ¨AN˜sgXÖŒQ6Ie<³ÆiVÍ…î<á·wƒMØžA
`¨M›”‡}e9„Ãô6Nsñ¤½ÇÀª`É
4€×]ë»Õ¬Ü]ÄÓo?@š[idð0©×˜\
Yh_œ¬ÏÇµÞw­BÉÑÜö);¢§-×ÙfYGÇœá8F<‡Át{(t‘×9êí14Sí#šÏ8‰A“{w tI<Sš„ZÆ~íÛ±»-ªÂ3Œå‚®$ò YžØ÷`­ÞˆÁ±¯Õ"%5¡‘>)ëðX	ÉÙkÉYHÏí­æ§KbszadZl?ÇAEáîn‘4ÞŸ,"$ Jñ ‹ô£!5ª—fXLÆd	qGÓ›h@Ü@w?
®±½ä�ãgóÌŽ°»÷RrD£	“ç4Yì;ÀÄj²Ñv»Î®¬/?@÷­p<‹òÝ˜fiÞ¢Ês|Yë:#~ÑÃ°'•w¡âó¦.æœ…Ã		ÇX…÷-pö9^¬‘ûUß*E8û�¯kìb:Ÿ/UÌÏ0‹ÐÕôš†^žÉÇpty/ÆƒÅ*âÆÅ^C›%õ€È›¦'×”/^×}žt¼0äì½%ÝnW¨ËCüœOGwr€ÊêÑõ¼Tg0&lz»Xˆ9wRv}í:N&(¶ÿó/Ø‹kÉÏß¿ë¦Ìob¹|ó
t$Ùz®"’Ë Óþ†°I_Â¨lÄêª
Íc†¨çœ3üm¯éäó,˜/!Ü‚î:ßeùÕü›%Q´žÁUÊ+¡¢k_õž`È“à@Ñgg™ÃÆ‡»&mÉâmÁ#„—Ã0“P…	û†¼qŸlå¡5!i”_âpÛPî,S¢€tÃ5ÇÌ…sÐ"ƒ™Uæ lR°oß5Ä}kQ”íà›‘
‡Ïºéâ’¯WÄ|l¶¡Öy4þµóþ$
ì²–·[£Ø£‰užÑ«+ËãKVQÖWs^l‚kû«ãË¹xrq¹ˆF>•¤‹lÜ•j°Bî·¦ÒS:ItQr;3!1nç0ò®Èóâ›ýâ›7ð_cÔ@¯WYWÅ3òÃÙœ|¥@Ñ3ÝéÍn­ÐYy¸Å†ñ|æë;öµïÂH”o°•}o3êyŒ(Î%u1ñéðÖ_Ô’�5~†íd¼mQ|½n7ˆWÛ7¹	br•<ë‰›€&žåÞµ¥m!;+ìIy·Ãp…ÏzÌÞ«s iÔœŠÕuôå‰¨i?ù¬·ðë®=òv§úóJ±ep?çÝm1>ïÝ]ã‡kÜÔ‹bÇ1>Šd$æ]Øè¼­yG-4@Íìr
zSÎ‚túHYøºvØ'GïÞÿ©~D^¿Þ?¾xùâMË}»ªÊÑs²	u‘wÌs‰Z¼v»÷øÉV¯·³»µ½m+öhr
mÎÈ›öjñùbÂ€GäE€‰ÕSPÒ0
Ò”¢ã5d`bZó¨]à­bƒœsaçÕNù½ÿ4bA{Y0wsÖ
./ÿ¿° ª{áuZ_¼�7|ítà/Á¢¥Û„SOÓàª'6£
™V•‹¡ÐÐåZ
±–ß°÷H1’n™ŽÜv·8C@~óáÚ)ÜLG`ø³HÃü0a¦jÀm{ò‰¦u)¾Dô+T3YLû§!lP}º…qAÂ`É#Å6tìr¯âì(¤x-¹å2—ƒf6‘\
ó
ø4gËøYÛüûû?Ën¸¹û”€946ÛÝGÝy{ñ6¹x¾üvË‚xÐ›ÆrW}\ä¹\%aš?ÍË*XC–ÛÍV¾•y/Já­¸PºfPÞ¼l->X!Ö¾ëèµø­¸ñÜ¢¢€§¨å$lˆ¦X{]¯ÛÞÜq\.RèØIõ¿é"¹\b±CsÌç:H¡ÎÛÞR¡òkTtã´iÏxÆ·P.çátXW•µò0Ä`B3:G_~2ðË·¼¦J8¢}*@ª}ä ÂÒ–ïÙlÝÃi!û//Ýš‡rîhB9VVŒSØá@1Ãe~4£Y9Ë0cÂhA!¤çåˆ£«p´`sš@yì`Ž'	iÓH£‘;BVÈ“á‚]ãÙOPLµÁX‡º¶ù{ò6¸=‚¿ÀðÇTÆßojâ¡W–=/@2Ê´.E0šE­üYrN/Ä£1œ©šY’¤`;Kˆ¦?—ô¹nwRªgÍ;»Zä~}è´{òß™ýº-×'¯êOA^…\wßÑé˜¬÷Ì|¨m|uv?H…â‚j…—8Ò`z$¥4#`K GMò5™ã)—…Go†ÖD“}Ïhþ‚Fàé¥€{¶™Ÿ�µZLw¬´6-šC:³#ûÜcŠÙ¯i5Ç Žc¶^ŸžQë ŸOù1n(¯°g
C‚I‹”<Úšqrš)¯ýœ5ý¶ Ú´¯MÖSC/&ê
Ïab.æ ¼.÷gVêÕcäºÂ?ƒÒ`vJýÒt»wñ¶î*š©NïC4\Œˆê¸1dã)#W'™ØtØÎ”À×Cz…9*ÌÂ¥Xƒ‹(ƒÍ‰&i8'Áôê¤ˆ‡Ö¯ËfÁó6c_åRÀ¶…@:4LóÇ
`ËkdÚ_#ç¸&ß²9h!zÀTÙA¾­§è6ëƒ/¦ñbøaÎØªœY•6Ù¡õ«µ„“Ùµœô¼œ¤0AÉy0[PÛ"29áÌž•	(áŽãØÞä9Ÿ¦u	gŠñWèë#</‹ÑhVtðu‘©Y7|1™ÌåZ(²—•Üf”·v¢ŸNAvëÉÕä…TíQJýë=žwaiMjísý€-çÅÆ/ÿÊ!ÜÇ])ÒË‡y�zzp[þù™²i7]M‹b!‡ùüåù~U}ïØP0õkÒÇ°t­<ºÌ¾ÓE
–ä!ìct,!‘vÊ–W‰ÛÆqFÇ¶ñ'‹„f÷Ûg(UiÚŽ>=Ïý¥½ûä.°‘¤7 $ÈÂlðóÂI	²OÎ6yl8Î›¥#|€SO„ "AyèCW‚â•R2A¿æˆG°÷ƒjÖµ£Ü³ihº%dØùÛ`mÑQl¸) >+æcxGSCLAi.Àm#êŒþæË‘Ò½,
@ÑÑÇ¹6{‚®kƒæ
½Kç˜sÐ½S:&Ðå£´®R'³¨e>Ï}~cIÈ{z÷‘»§d&N.Ièí}œß¶ª.>u!¾¤Ð/ˆg–xcíê“ ‚}ö0:öÉÎ'0ëñÁËØaSùèfóNw{»û©ûÉÑÏ–•ÝØ{º7vv4÷Ú²‰íÑ×¹Âåêëü¶†,l·’<XÙ„¬+#jìÎ¬ ’­JéM²f•ÆIg‡lÖTÒlN¬Ù¨ÂNûê–õ`÷rtWþÍFï®™Ý•Ž“0št¶?F£Š¿§•O­A‚SA…	ZÞu§!6½ƒÃìçÀ>k…y–
“!æP=;à™¯É¹.Î²Â6&×e ôµ.àVþÔ¼ª kÍüFï¨¨~—8áuÙ“uíÏ6 …;ÃuÇ
®×dFv÷êq8}×Š=oªhÕ>4;úY%7£ø^ÿ’‚Õ`F¸`+Ã÷Š0Ï
V°ü§7ˆ‚êc¬ö‹›5V¹;(£ˆ†;¸-ùd›5ÀHo´Zùò¯0#ü‘ÿ+ÿvF4€2`ã„»ÔoäûyfXñ:ñÓgò#ø81ñÄÙMí/‘>7òJ¤ã�úì^vÎšqHÓñeLÖZ(ÝaD„‚Ä©”ÿU»#ËÐ&ŒÁ°Ùã”ºÚWê3Ó€~Î‚¿.`+ƒ¢¥ê½04ãþð#–·ŠŸÔ;“ œ]‚ÞäSEþ¬Þ=æ PàO…U“«öú”kYºfóå‡5½ÌÊ›…õh°þp†ÍÁí:X)D_3OL=ÿðâÅËóó5=\È‹˜¦ÙI¦t°ggüo-8Ü>Ž¯Ù3Ü7\¿ëŽSXoõª½{õþsÖCùFFhGÃ0óÚ#ðF2ÝA‹ß`A~)ž[>e½_ñ[5
l¼y­×
½Çm
æ$‹U„ZõA¾Ë½÷i4œ/@,&ï£éMÞƒýhx>¸µþ,—¦G3”B ÊòÛð
Ìní÷ò³°‚Å—?×î}UMÍ—µ§NËÑ>4šŠ8¼ÎGà>Ýùˆ×¤j:U¿øIø1Åœ“gBÓË8ò™>oÙ¿I1ÏŽ¥QÚâ€«^~Ö’ð€n7‡QüøËêžïÕ)/ø­šîÈ)èqa]Ð„¦-g\ÒuBQcè`Ýýr:	%Úv0Ì[ø*N
…šîûš4<7>nø©ÑÍã_¼ÌjxºHch×{<"ÐÌ!¿$_sÙoàÛ3ŠçÞº÷Iu»N¤ZœDÂ‹ÊÍªþÝµ œSš•ëÓm¦“7æú-Ýt¿‰G|‰¯c´¾°ø±üFÕòeq\ø³Å%ßw§¾»?‘`®×F‹ét¯u‹© aÐ,žâ´º½•WÖéu
GQ¡¡T”»;Ì~;¿<˜Ñ¹£g+ÚWew3P‚nopþ}²¥Î*…3Ö.á¦mõ&]Î£­<Ršï0d~ÙéíŠç´Êf0(K�—%™öeýÙ_th“›D¢ÌÜ}CÏ
øšEÌ†ä§ÎÆ»\¸Ù/Z¬–Ã¥;Î2C3+›Å¤Y_Ç³@Ïà#õLOsB.ò/Ê‡å|ËÏãzŸh´§89KÊqp•ÂÇ0¶¶]¤”¡W‹˜iah¯vvuIh•×R oÜŸ§µ0gÇ„ô'0©tµÙ÷<cíê	-ep½¬¿¨n„€‘ÆœPÌK‘™QŒ¿;è´ƒGËä˜ÎYÔ½¶ò¾‘xÚ/K
8wþz‘×œ|ýµ&ÊÄ—Ü]fg*y¤º
@V"’5™Ò1”z(pÌþ+½P’ÉE_g¾˜¦!I¦QÜ€H4Õ4ràÑ:NbÙq¢Oô7hGP‘00™™øUbë¤À{Äœj›Ït“Âg°4Y"»Ô}4ÁRf¤Œ6”G%u‚¨]°Õk2ñ!ÏÇ.gÍË±'®æK�6²ã|ñˆ
ò¾ÊR7WÍšs'gQé€ŽÚ22Xg1ƒÌ·F™I\©£ÆRÅ¨4@lÃ¶\­+Ñž¥'`Ä)Éß@¯ºps…F	$%¯û©çbÈãòö:C»±3ËžyZœòæÒÔ:=ŠN1‡J¹bi¼$„ÂP .H‚Ã; Ï’„lŠÞ´Åmi$Ê“{Ã
|CÍÂˆf<C¡¥0ñSMìù¸¹ù2­g¿%]’õ.ÎŒMÆzí‘m‘ØQ–üY]¿q#$Z–ñ¬›Å¯ÂOÁpýÑÆÝC”GqÑH*ÎÖÄÏÃ ûK^7g<¾?³ÆÞ÷š9¡ŸÂ¬‡ž…DLÐÍ]øa«œÙ0ž'Wgýu_Ñ ¶†ú¸¯zÝ¹ÆÌZLÉíRw†I«dÊñ-Ýe³de‘Ð‰mð4¼BD#c_ÂÏÆk°–~gã�u<×]ìEÏYw¬Y´…4»™2ïï:‡Lº‰(gtžvGq<šŒh??ûëÁWÁÉùöºÛß<Ú^»{h¿l+¼}{k¯û¸÷MoíîëŸ¶¿ù:^dóEv€™yC«0ÂÀ¾‚±Ñ¼T—0¤ç“-)g¼øZIâÍ¿6RÀ<ÝäCnP}xvô)àd#=ÃV8¥©ƒà—“rUcž9ó70ƒ_£	8ÆÿÈ8µ²Ûñ{– #‘KÔAW‹üC4Rz7Ð<ÏÅÀt¤*Òœr·öÚ´•Í¯-#Q!Ïck>Aò
íc˜.è4ü‰)bd=
g‹)c•²LËt¹†1Ú*„aþW.@{ÅE?í”TßCšŽƒ¡¾¯¿O¡·ÿÒÛJÿ‚94ùK]¡>ø³¥l¦¥ö9îgÃÝ“µNp0.wÑ¸ìIºLÝ¶,wSÉòªë=%"fSÌ3_ý‚ùïrü�ù¥°Øæ‰õ
º‰‹NÉ¹ÛÆ#X–Ï¼qçá¡LÞ¿]–xÝ
¢ôáô°qôîõ¾KË¾-	Y*Î”‹pÖ3e/0w±×†£Ð|Oð¦£÷íi0ˆ£¡çíwKÀ–—ô9´.yÅ‰+&Ÿª[âÒY­ç’-ù-Rj_Û*Ë¸L2®0Œ{»*½œ“æ4/s.`˜±É
–|lÃw!¤8¦/\çÆaN4¸øUóL¨¬ovóé¿
‚!ÊbcÍÌrÃ6Íæ„4Zš“ÅIND0²ó!0V~Ã«Àr"fÀ,?"“Â%cå|v¹X»ä<€]i1.à
M`òÒk:1¥3á!aÂDùX¡6‚d¡‰‰`7†½`Jâi0.À-FÜøÃjéX;•‡¬p&CÚÉ}§ÈyìEîn“õ„`P�©ö¢l6öDèŸÞãòd³%>†9³½ÙÕ\£Ð¶Ò¸®‹¢Âÿð¸"™,=‹†a·²L62óF«æÓ¬åÇÒåé–è%Cf žVæSŸtñÕ €
¹^âJU_QP~6’7c!FÙ<ã4^ýe§YåÝ¨(1*ÈýÌ¸³à*	Òñ‹kyÊ½-ÇÑ¥éá®ù…ÙÎI<J/?|;j1ÆXYËœ¾ºƒ«4%¤ÅÙ_ÞUò}TJC£´¹¾ 9ž,à›-¶­õ°)X¤ƒ¼û]{õ¡™#OàÞVÍ#_ÞS@šx	ÁiÌëçp¼Uajs!/è«GMéW¦¹:V:±ÏLŽ1;ÀGûcB‹6®9à5J°E+`ßÂ\@_ÑÒGîÃ‹§ýü¯°U,'¬V{îcƒ&ñ;E™-a?¹XŒhŠº-
ëÂ’Î‚Z‹¦#st„=ÂÚ Œ¦“’Èz'!ëêŽ› Èn®¶
Ype©ÂüþúkSF¦ÅC1Çî‚(ˆŒlŽ—£åHÇ
Q\í\^K´À<SÖ(ÿús.Ò)„›—'¯ÐŠ×gYhëzÈìÈSFIõhyµ~[ «[ ëò
=ŠJ¥uÍER_ÔHyþ,ø×kVÒè/v·pA¢¢_¦Ù†k“†©C×¿]·™ ƒ8ªé<{”)}Ž9µ÷±Òáß&óE?b3SªãËOó JYÕü^W]“``ùð{7	®‚#–õXX¨ñþÃÅšíîaz&¢¤¼OxþõœÞàGVõö}†ea‡	YÎ®¾Â[­…7¬dÄ-ÕÏâ÷c- ÕY
c5\Œœóëé9sóù	ÈØ,e…š$ÆV‹Nµ;Ï¸2ÕÔð²b¤E$Š¸ÓþÑáš)"¥h¾½Ää»É'H¡;&E~¤—S\W†÷‰sÉ8+Ê&
Ym†Â8=úpÑ÷ÚØµEC¡=Ã.!è6‡üÁ^AG§Û»ý³Ûu¼¥çé [Ð© Íùæ5»ƒOsáåð©è§Nï|ŠœÒ›|~øÌË<xÃ§&ý»Ýon¸¥É‹þ:P{ÿj+mê%sB¨–&É©Nõ"[)ŒUÇ×Aj¡ß-Ck4©âu¯¾=ÝÚû÷Xií}|†ˆ{<"¼ñ6MðÈ^ðÏZH×¬¥¡¢Vg8eä§ŒoÈj[Ø€JÙx)»ÚªÆ¾ô¯n¥™Éú…d­Z†“9I‹HxÆ
«„žbÍµ—#PY­y¾–Nctø_±úœÁXMbr\Á™Uç÷£ªõ^&68xóSóN5 ;Üö/ÏšÇ³7¬&¨
BÞáw{Ä®áuLè<ÌS<9¡É(4‡#òn¶†ÄXÅÈtÝqNÏN·T¬õI˜HÖv9‹“Ý_’wÁÜõfé¼~Î—‰RBKR¡†\Ô€ºäÙB’V³cÙâåî–Ûš»ô2]W6Ã*†)_òð!NÎ[­Ixy1z»Ø¹-'-yzjýÐ½G·Ç®—8'Š˜mñ¥Ž=@•ì>Ã_EX{^u€Ã¦Ä,ŒÖA®=$ëÆB6Éº¤…ýíod{cƒüžÀƒÖãâ²óðË¡¸ÚÆÒG;úBŠ}Ç&©{Rãw®&Áfm¶~»û¹|Ÿo6ŒWBµ¯ô%ä'
9
5P©Kµtm@†¦”ESOoqÍÝÉTüº­›ñªÈÌå¡SÚyµ×CÜ59h¬O%¿³ÆòM¾óÈ}°ç?‰
AÃXb¾äIDnUÕÏ=7Zì–+bù¶UŸv…²âiWÚ<+“]o¾xÑUÊ¤Â£òsO:¯™±¤iÅÞòYS<‹ëyÝL.‚dN'Öƒ¢¿~Æ‰!ûÞ~îyá«¶9~övÌ‘%ŸW™<Áùà€XuÜD¨¬BÌœyNiHÞ"×üÄfßmëŒbÏI€Ã/ªém©3yËZ'øÝÆ:TÆp›÷,;:kpérµ`™ÿdqi|^'ëS¾+¹Û:W/ÂY	m…’³IÇµqbÇ}p>ÙŒÛÉ°<	œqA—£–gªGÃôY7ŒÓÔÄåiq[\Ö
g@…#œâ=ãŸ4®áµªpVÅ€Þvd$Vh“îÃC×à-3t­Î2l–óLÆM7R—Ó¹Ä¨¡$¨¦7ôI~>µëu>å>kj}zÐþÑ^NEä®U6±}*ôB™%¨¦!K©¸©Ð­¸ØhÐD§œMSÿpæ¶,ðb Uñ>Ž
D"ÈøCvŒ-ñ2âLÄ—¸:`iÔ3Cª—Ã‡×Ù÷ë$+�†3©Äé¥CçƒŠØŒiÒÏÖ·<ÔeO+ÉÃ#¨å‚\Œ†>=·>öŠ>ä·vO7.âbÅ/R¯ÚÃø;mÃ'X‘— 2"Yã·Ä«tRcv7Š¯×7Hg =P”³O=Û�Bã÷do«øÈ
C‡xmø.t¤€„ŒX¤„ˆ(šzé$¥=ÜçšóªoÅ¶¸ªÚºÏ‹<}øøQ#\Á‘õu4Ç g?jç±[¬­#¹… ªöã5ð²wëÖ<Óê’3N½NÙ"P#º1â¿{É£ðèšvgÁæW¬×¯Ç4Ké|Ž'nøy>†¹wçqÞ†×Ú_`G&’uù²!sñË=ø’÷O‘gõ£&z³Ì\¹ìèÛVð>¼<–Qž,'Aíi¡…'¤µù}­æ–#_ÁyF¯®˜aÎE®®*»=Åç:C–ÐjËy..ç	®nT@¿
c}ì‹[·?ÃÐ÷“$¾>c˜•û².Ï:ÁoqÝ6ur´·’[ÚÈF¹pj0uoKo^\õ“„íº~‘D™1v2˜„‡ï6Z!„	8e5 ËÆËtr†!0'`>ywzŽÉëž’²*dÔ#rÉQ¹çÁt1#tHh‘0Ã¬M‡¶[ýñ&@üp2£Ÿ:%ø˜£Æçá”a\.&”Ì‚hðN”¼-ª¿ˆ²Å„ýÀAÀÚp¸jx÷S°»Ö6·E½4ˆ‰¦|âOk3Go1ÔVå
¬·ë‹Á+{2ôt¯·«O’W¶ÿ¢2œÐùÑ .B•wV’¹W•Ê»Åˆ‚»î8-ÈQ¬!•§á4L‡t¼˜.SÃ­®:’!˜DÜ#cUŠ…4	f—tâ:ÜÜðWDæ¬®)Rüo¶È—‰¡8Š^ìrõÁ“3&`eÎKªýâ²c
i~°¨j-Xfd2Ÿ,*Ÿù'„×<¡ïÐ·U7¾‰µ®j/ÆŠÚ=ˆÂ}Y;	rÓÝ!E*ËWF>>äE-?ï{¿È„á“z§gƒÊFg¦ÔUxÕ÷*_Ô žÍitƒ P ‚¹È¸^ð»OùÍtØ¼¨¿tçÏÏ‹Å¡¯ÒEB³Î°X]ä±çxçñFM+ÓòÇã0EêFéó/ˆÌRî0±¿Ò9¬÷ñÄ æ¿1—Üb¸Û2ÜH?ÊÂ6fD jõü~ë!eá!ÙúsÝŠ¬l=¼;	æÍöÉ‡t½yH†8Yà×}Ò«?lÒTà«™Uœ’Àp’²˜V%éÓ×Çñ(6+zÂ~o×¶Û2o@PìK¯ß?ï×ŽßY!SfÚhÒ{ ý\¼|ñFwî:Á¶ò¤€*Ý3XV…€ñÂêf€\§A²Hé˜*Ú¿²IûI`Xš¡K5YhÉ'˜Z~ëÝ[»UÜê‹©ûücE9V'›@ëgYbŠz‰^çº"Ø�qd/½b¡ëøö¤™m¢¤ÓÎ;Óä-ôX­Þh˜ÈÅìÝÍ5Ï)_¦‰Ì*¥ý^ÏÈ&Óà×`C´cœ„ÃzÖªQ§ºÓ–ú6[zv¥»?ÁüZ
Ê´Ô4±.Òã)Ò†Â.{¾¸œ!ë˜FÃiÀ%…™Y­„„6î‚§SzL½é'äS
4jáó©á„æè°²ì7ÉË"úm’7§šùÄ*¥©lÍ:XËˆÕÞÁZõçxìÉ[§ûUè�ö’3êî•cŒ¡_|¡
Ãî9…úO¹6‰t	º?Òé"`JN•UÕÙ1`úÀÁÍÜÓˆ~çcù±õ ›Ñdd]V¬ÖŠ£Wñ`‘T„™ŸmsMýcÏ§‹DxJ‹§YS"jnéÏë“à¯‹0	†µŸ65áN·iU2z+Y_‡ñ¹+ó[³#ÓŠ,ýý€N˜rõ»?ìÎ?mü¹�š.ÎW­¸±¢'¤WArÂ_?¡ßQu)°ÖA(]Ñ!û7†ì¯Æ
õJ%‹q‡ùÅLÎÅà2¦ÛcÖ~4Ç|›…_¾WoXSÍpÿî¨Ä“ž…×ô†f\ò›jÓ~úVšu,Žlü„ÃOÖP2×©‹"ƒBÌÇ9\@ñbÌ‡-õøÁ…D·EÂüŽ”¶„8I=Â²9[Ž±*
Ð4lÜ­äµõ¬xö~
³žœçºž«*óÆƒ6‹£Ø¶ëºãÕ½Ó°»éÌÄÞ\&ÐÜ±†u1^ß$¿.@WšŒÃ„ÃÑ"Bg¥“ïAd|w¡>èXVyÓøCb±õ¤¤’fç–¶éæA§—©xø$ÒIg¶µuk^Û	ªþäÓÐ+µ{õj~Ã…ñµÐ·xÂt
v=¡È¬w*Í±r•ÔBM-„—~ ù.`¿G¯¬"mX©Ú'$¥õïÿúÚÿéÕÖBëç¸Qm-%·‡ÒjÑ
3Ü¨õqÍn—iÛ›=ÂyBØºa_øU½
n$ÈsÿÅâOJžkùè§Ì\3f€…ª;¨Ö%íV+ßg…ª¾’L«.š5—S*ÜÀ=`‚Ø¦TSEÒG|Z´ÍZ
tC}¼˜SAˆ<Óº^ØêS<,™dÎ<’%oŠÖ_Á˜¨ÇlI0BJ¢?jóÌ<*†AÁÙ-Ç©"¼(/>äÓ’˜/¢Jèd=s°Èy0¡,‡G¦¤ô°ê¨ZÆIpu°ö_ÞçDß‘'ºàöìNÏ~¢Q¶�EÉýgäÍârBî`ÖôõsO7ÑÏÕÜ÷\ÎÄ»Ÿ;¿(ÿs}2-zã’æN|Íz–_õØä;h&oqj-HÍzÉuìc°b5s1w‰o9‘¨C{=ò´ÕbâD¬¯‡{]1mæ¾bô¾“7Ý°«ÜC=—‰}µŠ¬ÞŸþ|A3&Œá?èYÏú%MÔ°“O]úJëR?Ë%É*¼ê?»3}“|È“X2vz‘MôYýç¹û\w¯Íy¬¶ø—e†>§£ƒsšdˆ½²Q¼de¶1|}÷Ë¼ö‡ Ã7ÉC2L/µäs¿Þa}Ïâd•gZ,óÄ6”Zž–#¹õx»·³ûhï›ÇOþ±†­•SÈ1pŽÛÇÓr�›xv–Íx,Ø¾:Fi|yi=míÆÇÙ™¡›¤4%Ä_æŒ‰p¥VÆMƒ ]ü™ÎÈM2‡y¾k1$ÆÅÃLéq¯Ñ©¡z(Ÿ“›œ¬·¨”–”û'°UIJ¯<îl=ÓÌÙÑ"fXê™žæàLHš²&Hiâ‹µ®BÁÔ±±ÚÃ€ÌžÙÐ™ÓQ–A)`Xó;A@Õó 
†0½3y_WÖÞÁ
êsæ\rÊW¤áÆýêFæûÔœ&i­8“Ú§Í5Wç+Ì‘6ŒQ\¦Yæ1Ërþ©³Ã Ë]Àå8*rÀA^Š	˜íðˆèŸ‘?öOÈÛ—gìkÚ¬‹@×f—ƒáSáH/]¢á"ÊºÞþá°ÿ†\¼<;{ù¶¢«¬áÐJí5ŸKI5*«z±WR	<®Õ°Õªäî¼ó¸
œÝ­ÎZsQh‡ÖÒ¤òlaPîV=(wG
^ñËæ)§9óŸ:t‘Å¦£Foø"LÓ @ÊÚÝjœÛã‹ëõ¸ÊÔ1TèmüHÉš„ä(*E“¶2z¨­eè€iÃÞQ0‚0{)”‚Ù8*¬èAœâ›€;£Q€¹{Ú¢8½·.ýÆ”|£ÃêkÂ¬™¸¹»S›Ô3n›CŽVÚoƒ†°aÚÚÈÎææÉhM+CŒ·€éM¿DyV¡©Xr}ËøËËã¾ÿóCkøÍ8^$°[ö:°AM·!€v¹È¯›ïŒaÆþ´QÇý*f×X¾èiûÓ?òL3þp«ë'4°¯NXeS[ô©v
—œ¦öY\rœz€Á§—AµSÅ6 CºF0€1C	•l#?U¢¢Nµ† N)W#ª³[®½+„KwÈîè&r£äöˆ?ßÑI¶ Ç’%ÚªdÇù±	±¦ß¸ã	Þ×Õ4ŽÌ«õUS[4›dÏñå� úQ·8k¯ù¼æÎÐ>ë¿
å©>¬.w›•žŠÂGñ¦ËÁfÔnË£ÄOø�ò\xÐ4YYD`÷
pR$&)eÄ8å	?Ž<®Ãm4¶)—�¿&‚›‚ašA0kf–·@,Øf¼ð/Ÿö§0ã/’TŒJ4ê]D–6µÇkcÐDŠCž5J„n3û•Š‹@n¯½]°8œ!šmÉi+’b›ü–	óA˜XëÉ,·aRšŒ'…QG¸óø!zÿIòô„Âàc[B0ALÃ0Ì(”’kšDˆ|’Ð±­dÅLÌfèo0¯Âàs€~«>åŠÙ‘ÌÐq"ä©É¿Õí38MÞßÑÃKc×Î…òþ|²2NFçí€^j6S
Œ"Ç&^ªD..[3Lñ&ÅÕî†Øð”«Þþ@Ó9âÜ¦Nq}å’{W*!„Õ|«xS²ÿ+³-#Ÿ¥w‘HLv`"y˜åýò
?K8p0=j¢#3Î@yÚàSµ{{ù£:™A&K/ó†Én}Œ€Ëk|‘Ún´£syÀ6„äð€U?¬GÐ,'Æ<u”¾ 8yúEÀS3í9`-ˆ²»e\¼õð-E}Æ£,†ø?ÛûP9Sœ!ÕÒ»¡òô,¸J‚tüâÚÏR´iÃÕFiÈ°„±²¯+CÞ‘æ½Ýý.¸ÐBÚÄˆ0û²XÃøà–eºÙç†"ß^³¢¡í÷ò“æt#!l9k°ñŒ‚ÍçñhŽ_Áô_ 3tBC/sK®è�öà“xˆžŒ7[k0—ÛÉ‹Õ‰g‹$à‹¼õ
Üã©ÇJJÊ'ö…„kXGs®íŒE„Eƒ3Ç
ý	6¤ÕHŽ#‡ÔŸÚü³…$¯Ë\žÚ|L1B©LÝÜÕˆÔ
Ü‡`¨Ae+¶ïîç4£Ó%…
ìÐŠbnhÈ2qÏg˜ÅÔ+´æK(k`W›ñ<“ÍÕá}®b¢qªË„‚wƒéá…Wb	]óãÜöó‘;ß²ê-»ˆ}QF%s]•ÌÏn¹ŸXHtŒFúwŽxø#<š’!Ò¹„²&`°3LDûž$áU8Aü¥þÑAj°úOØ‘á®63üµ4D¦5~û@ñ
PqÏÈ=y€Œ�oÍrÃ0L‚	ìÁk6‹Z­jÎÆ³§I¦³qoz¨4Å-®öÃ:¶ˆ·<ó£Åƒ÷?OÂàŠù?¼õc—kuš²êsØæ¬%^ëM0ážF{u]œ
*IS¸Š»ŽAÌæ°£2je™JúÑ<æpä–òóÜp¶üÈÊ“¥Ë?WðËçWÝ>¨pP\ô§"vy¯°m%‡v¼È¦aðyv…xJûxÎršÊˆ¾Ms¶ŽS<g’—÷çÚÚ·Ž<];§›üžÅ@•1ž_ûö?ÿýýOòvý¸`Ôƒ%á&93 …õ0…÷E#²þžâoÝðyçíºod€F ¡9,þÑ0%²„§5Ä|äÞøþÏv/H^,SŒðI,&M¿üŠJ×®¹nP‚P^‰øÏyä„TxþÈà´áõŽ8#|¼í
¬¯°¾#¼"ëõ]ó@ØV¡G
7Ä×ZâæÊ}wÃéË£æÅ62%7¿ŠYÌ“ë^!gØ—Åë6§þ!r{ÅœÈ‚¥†ˆ{=:Í¿ñ"åu¯¼\³@{òR]štmmÜ=p[Ì"Ð´ZñÐV–IKØÇÁÚþû¿ýwrX2	Â|™ÝÊÚ4šUu–œ
y-V;'òÚyÎ~™9Fje²p—êCkÇ¥ÎjfÂÿø°fZìKÏQš²}„QŸúÎˆ¼N¿Í‡Ï=Ì¾í¼�›ãÄÑæ¢¹h‰VÔìÍÅþgy-Ÿ!Öj¯{)ÊŽj‹}Tˆslú§Ã”mþ¨—‘Ë/QõDñš”1êL¡
3:

$„üž‡>¤”f,á’á¨Ì‚¨“p=“Ì9W„t¤èé’wñ°ˆyÏèœAûÌògUV
,å²*œˆb°ˆRüÏ¢|*ž§!YkªÑ®‘Ã	´"b„	¼‡íjdº ˆLÑÔæ±qš[–ÅQ·‘ì3cž/NAšËHÆŠ3²V˜GîYæÁç}ô®õ}…d½ #I®Â¡ «½<±û_ŠÇ’SŒMÐ¸‰¤à±*~×?ž@x¸2a£É0
ÎoïºÇÓŒPz(ù=$OÏ­Ï9güÞ½ñ�÷à—QÑhäUÑ
òô€€ö*ãIÄ»Í
åWâi3ïÛÐ«kŸq’BÉeŒdu¸ïU¦)(¥ºÜ:‹ÛÍêß¬T·óV.Ísz‰‚¤òöÚãNoE
ï%Oò÷¶“*üj%[4úJ~µZ¾üZÑ"æW#™óåUÝS
å4‘EüR%Ò–¦ÆuIÂ§M!niÃ/_#ièNÃÈ…î©yÐtžÝê}§ç	‰ùHD$žñ–óï”Çxdémåz˜¢Æ&Idß
jzû›„ûMÂù<ÐJÂ=éÆBûó¥;6”o‡!3%ÏÀ¶†E•áï<ò\VÞâÇÿFÝ™nâÌÚ
øì¢ë4¡Ü
íÙg¾[oÉt$QÓKBI'ZÌRïÚ.#¼Z‹®Ö‚«õÚ_áÊo,²¾”J7V˜bý*ü×·6îÜ|ÕeÍ©“�úë¿Ïžd¶T©N2	ñ^¯õç)±Ì!MÊ}Š\[¬û¨¿.ƒz[Ì–m•?›ÓÈÌ¨¿Ð0ƒÙX�fº*1Ï±Ê_ðÃW<µwF?­o=$üï0B^¤‡dÕòM%©J šdiì?Ìw›ç`}mlðüÐ»ßýà·Ø<ûU´Þó0siZxä¿Éûßä}ýö¦ªiÍôö×GekÛï9?ÛÃHn+Ÿ-Ù¡bô#?â²k–,çh¨ZÖ6µŽCw¸a^\Îœ–d÷Û,�“\€è÷V_ý7ZVýosû£?£Ñ>Î·YÃVØþÆ§kû©‚^*Ã³ò^ºƒßM¦SU#ò,†Õ«gªÅQ«—îÑkœÅ”ÌØt²`–è<NÃ4,
~¤‹±Ÿªxë#;Œ²\¿ÎÃ¨M­á¼µ2Nz¾ÆÉdÆQæ‹”f¼C&öõÜ0pÜÓôôœ_+=Óæ—ÇIú}¾ÛuªÎ¯Fgëür¹o‰Wñ:è7°±
 Ð1€éhV›ï«ž+­¤òi|Ž·&fù)RžçÌ‡åA„X\^¯ß¬ß¬úí¾’ŸÝÜ\úã;�c¶)\è7žÞò±NÅÎ‚!h|R–ãÊäTóÅ‹ÀRS†aJ/§Áð�ñ´Ø# Eº=r‚›¾ÝŠaþˆ|u+î~±(khk®5Å'iÿ.–`o%#‡êjˆQg´÷t¨[àU’Ÿ’¸g3¶­Y>Ò©µþËâuÏÈˆ÷‘É÷6†F ‡½>=÷ ìY—xÿb¤w²‹£-4wfâ‘¯õÿ÷¹–ÍCÉ±ZTmãnæR},b'r ÉU¤6Š£àhÜ3tR+ZH¹ímÜ=$ÊÏÑHüùGñ°*-1dS,ìn·kD÷‚ÉÑUißOÆ¸`_¾žÇOIg±zwöœ'•ÌtN$Á< Ù>9Š®ð,äÆ¥Éa`Éû¤çº5�QC¹›4±â;Î¼ñ‡LƒâµŽÄFsŸþìï±U FÊ:Û
°ãy=H.LRX'Öú/Á³ŽH#ä­Õ¾,© 4ÔÔ ›fñTÕ9åö¤3_TVêì·[§–aÆhØ2áÌÎfYÏÊÎ¦u:aªI'y2Í¦ä¹©R—ªa»Ìæñ%%Çtd-[€Fâ›°lÔ:ü]&X
…6¿n=½->B×L"µm»
¥ÄK¬µ+ÐìôX4‚µ˜ëÿ½:wT¶FL°ëÌ4m,r"¼Jt¤–ÕÅÎ²Öà¿³¹cÆ¹ïc¯{ÎZs°f=)K³›)ëfÞvçy=ƒFüaœeótssFçiwÇ£iÐÄ3öùÙ_jÊÎÝÃš‚s÷õOÛ¿ŽÙ|‘³Ë`h=ªƒõ_¿‚!=gàmæ¥ût“÷¶¿‰ ¢™íp4³œ èŽ%/P÷‘Ë	Ø+L%Ë‘Ëž)Ÿ“û ){DôËæ#Z=9@ÚDA'Õ*ó˜xˆ
ä)ÁÕss#±D·Z…¿¢Ë°êbm;ÔóÍÑë7äôìå‹£ó£÷ïÈñûoí®OhÈÑÉéÙû?½{Mú/^|8ë¿ø»fíP]êÑ9cZo@OØÅ×ä€”–Á,Ý£ÀYî\‡wvGAö&†
jù-yãfíyõô*>Á½(ÿ>ÇÇg…mm˜mK;´Â´ŒãëcèP×cH©iÔòò~üYŠÚó•®¤ÍÈ‹ÃkïÅÍMÂî“‡Ìâ¡m—Ëá î{>¸A
W¿JcØ7»üŸ*§Ì)&d
9?Ñ2«H€ÂVîó÷‹Ì³Ó‘š­]¯ío<z
¶;±§ØG¾íÒ]bü%oÊšp�‡Ãc*Še÷ÿ
¸b6]°"	€W3)€Wëå×
—8^ÏÚgf©“WzÚ‡Ój1ãÕv‘VmÍêçk«õWa¥r¨Så¨À	ÊÑö(‹ÅÔ“N:rŽv =§»ÜÛ’0øÒ=%S;ÙÔF:-)ŸV.¡Øº•x[|1ö‰ì
Ús¬%¼ÚK¥åäRÕB&›î³…~ÒuM9àq8‡r9Ò+&C-ïàZ8ì®ÙÉñBÂíÞ>axÞ·¿O`CÍÛ.d×¸‰_«ëoÚâG¹…Î(×Éß}VÝ‹áôë6™½�ý´§a,5´j,ô¶m-ùötäœ˜A2¥³Kj§–pG×xm–¼‡[’Êö[	âÏ<–¥*ea1¶K'ä’é25‘ïÆj^NX—kI­]ˆPnŠv}á5»^5ïeöv~lâÏÞ®©D¢±Vd_´ÓÎ‰Ûcx:*þ*ŠFìb»©Pçvw0"xXÖ7Ê<ðºLìr!Ù œùãX+÷-'„`ÝNõÌðåïf†xV³o k¿‘Yð ÖQ= ~ÿ,&{ü™ÌÉ×9å ã´û&¢°VÎlNC˜ð¹Òxbou[%Â‰—â…/(P××Æñ,°k@°ï›‚w…kÍº5ÂüDÊ¼Q2³õ¶²¦>VD“°¥v¹1l!©)!n–Aæ‰rÆPÙiÀŠ<2œŠqª<ùÞd÷]1^Õà÷½ÝRX*k[±í¥±=þL=–ÕzœáGïW8Œ¤Ø>»ò7;[õ¨Š'[Ê	„'X1ºS°3÷F^lgvØÍE›í2ót~{tvtBúÏÏ_¾;?"'ýóosÕ6—mM¹Dñ­(UµsuÚøÙM|ì
iðÊ8.J&t‹?]X²ß#(*'ÑíOÆaÂH$ê`s–‹ï··­ó¢ê{]ÏYíóÅotÁ5Í`¢3Ìý­­.éÏé~bÛ!tL‘©[Å%)6å›û³eÚïØêlhÈÖXM7öà2óÜgÆ«!½%;¾ˆišiJG^IEkHõ—&#ü9§ŒÔ—þ5&8ká/ê®#^/§Ï³<±f5öáÔÄKÕEœ¾4—3Í¬°ðMD
§*#AT1¡Û2%(5Ë–YîK¥¸s›;í	jcßÌœIÖ§ÓEÊ
	œ÷ÿ¥OŽ_ž<ÿpæX»nZ1{|>6AGóÑ>ì•¢äè…%úo“ƒ`ñó€FÅK—8aúr1¼j\ÙJP¥oàÅÕµ4Ä I´
[ù›¤²Uß>ñð¼ß“¦†×ª¼è
O  ß˜¶GN?÷ß½vut€¬"æÙó(–b£´çéyß_§@PžÖ<‡éÆ—TU;ø<ç!–·œ'W­ˆ`©Ü
Œ÷Á?<Uêq”ç>ÃZ.¶+õ$Ö=¸èÔl =¸eÿÈ¿I½£Â«˜ˆ˜à[å¾ ?ð£�üú0˜gçAFÈ0˜Ó$›A}às¥ž:»žrB°"5V¢G¸¤£FÅJh^GÃéÍt9Ê•Ê–·€tª¨ü²
[ðÖ–@¹Ä_’Å¾ü4¢4@&'h!žøH†©ðÖ’Ù)a­JºÙÍ<gSzÿábM<Tè&Áp1Ö×ÓÅì!á÷ÃŸäðˆÎàÏuø9%^¬‚[áÿú
EhXëê½kX;mMòéÓ$¾
qˆ5ëÈ)<«ñ³›BçµáòªF¦Wo=É—Þ.nîŒ;|E%~JxRã€¢
)[˜’šwYufiélþ}ÌuCP´“Æ,¼E~‚ý„¤ô*èÀçr­OÖýÇl“ç©{°)`'Ä’Æ,1iýxsó©Á•çeïÖâ69
‘ªWÈ
H}ÇÒž)ÔýìÛègßÆ1`fð/2ƒ±%tBÅ ï;—	¹Jâ™à‹; ¿ÂQ,©ç½2ª½Òé%íc6¬¥T¤ã$Œ&0Ø¬™®’Ô½KJsõ;áÓpfJ°dÙfWÄ óLèÅÌZ‘½vç	ÿº;l‚ÎóÞt°½mRÜq¾-èÜé4;Xë³ZèoÑG˜˜Œ
…îð¯Ù'EÞ¯š	;Ã™Ãÿ¸+Šc)gw©IåF?À­4&ÈVÅFä¸2sh½ùÈB—×[ºˆÞª¢%¦#ÈáÖÊ;hœrÏ0™S‘Qò÷ýòG:E’7ÿl~rßNdhÑAáïñ²IÞÆ3°Ó’0µÝo|SIÒär—M|†MaÜ©•ñ]ÿNøóŒ^]•LGÆÑ×z´ŒÊ°þk¯¸^&+Í®,û¬0;±<Á5ÔM‡ÛÒt|Ódh>Gñ`s<Û7µÏáÎ(G2’+kÎþíGrÒ­Hê¬xLh÷ÂÈ>i!S³T¼NŒöÔ1½‰ÙaÑc…æ‘åT—ãžÒ(˜’>v¸- ÉfïiGìžóÐW#sþ¯;²iÚº_ÂºªºW’º_zºG²Œœ9ltÊÇ³Ê_w²`¸2²ò“É÷¶Ê<€õC˜"¿DŠïÄ¶ØyÑ«ª¬”" Ê¸_=ý.¼
ßƒ,ÍÛl‹|¶Bm—g kß¾õêøèÝKûz°ôœ_oÕ Hæ–óÖLŸq5UKëU±HgE6çøw0k®BîÐK¹#^?¯eµ<gNáã*g]éxs±z{ÁüÈŠ]gCA]$7«fŠ*À+sMÛÞ,Ì¦ÐVÞ?ˆ˜¥»Í0fÏƒéÔ¤çî·‹(›U ÌÝ€4± »È9®2¬}òWÂAº[ßfËW—`™ƒŒFqg›pª
ø5€k0¡Çüˆ¥Œ—”‚¥ôæ™ß,ÑÃlð¬Oö±±#Ìef¡bp}šwÞfø(=ŽG %œÄC:
6ZÍ–S
ëË7¿Qç«[ÔUž“¼ªW²˜ßŒf“ðnk°¢áŒKtˆkóÈjÅ¸Î—½ÉýTJ`¥·ižû«:{d:ÚÇÐÇ"nc¿/><®-€ÛÍßs‘üó&9	²$¤¤C@e¸E•ðŸ7™¶YÚM¿ßTgÛ­“è¾Ö;.â{ßJ³oC/±®2ñüm”„ÃœUÔp2Ö¸²>6ÈòX!ôE¤¹E'|œ
…;¦2öÅ2vä2´éÎ¸–“U†š•æ¡ßË»«mOúøžå3µC#:½É`Ø]kCšÑÎ¶]z
†¿É\Ðç)8Eužm¿ÃWµ› òHÙè”Ô”a/Šˆ–Ä·"}­ÒÖÛ»Å!D
oVÛÔÂÄžLxÛn
µ>HV†ìØƒ�wzImn²µ<g!ç‡'ÍÜE¨âãÔ÷$zH‹TL{,ögï9Øc@Ÿ=:<û.ÌÆÀŽ_—N©Ì‰>Œ9'˜Í§ñM¤9;üy›/IÃ‘½É»"õLõ}˜Ä&×WÓ5¯¡–á`{Š¢Vü´SW®~‰‚AHªl)øê³0]¬tùõýÆ
0Öì48Lsê>¯b¦Û%s´gÜ·²eP
Ñ`ÈúÒ?S
«é+¯.½)Ç0Õ;ÓÂ-o	9k¹�«hd!„¯¶øø?ÛÒÃËØÓr	:Ã¤¯c>BäófÌ5´¦¼´X¼êþk/{ \@CªµZFn¤œÃ—í‚§/ß½{½æJ©Ï¶å.grôaB¯Ìñx¶Ä)GÊ@ý¥ZÛ¶Žÿ¥Ú°ÜÒ*M‘mÕº1ÓÜ>Ð‰‰VYc›lÃà7jØ%VuF˜m/¦ngñÞô³,ˆ†¨l>ëfpLµÙÜ–«1XêÅß×(m{½þL™·]ý$§nÛÓÏy=7ša›5A0ScT\ødÕÁž"ˆŠêý @V¨À2‡Ði÷¯ªÝdW½‘•
a
šÃ¨W”æ^M½ÞY1X—)úcW‰þ¨¶Z!Ç§Ñ¦ÛÏSU¿&/A»˜¡zøšþhJE²l½¾9ÛF	©izŽÂc8–/òH¸³‡ZŸ²ì[Û;©Ež!ØíÌ:slöµ¶ëÉ4*¢ƒ Ò•óñ÷ÿýo8Zk~âeo—39­Fï»C®;óOµïš‹©)Õ–ª³9¹•’KÈ—†p/Ë¤§Õ#Ý‹œýrˆËZE×úª¾A9#Ä¼ƒ¹ÒÌœé_Þû¿Zìvü²ìyÎgI‹]‘_¾{#¿št5¯ZÊ”£rmçŒ¼êû?ûáVAô:ÃpfÎÈHïî–cƒi¶Æk›ãœømÿ×¹µ´ºÎÝû:G=ÃîîqbœØ¶ÎUh¡k6%´Ì$t(Î~§³ÌÊ6i>r „¼”uz@žÓÅŒÛ�÷Ðÿ
A¤¬N—Éž³¾•ÎYÑ>W`ÈŒ3ü,ÍõlþÊ´d
xnæÊ8íøõ>ŸµwÎýxâg4ñ–×D—B	Œj­”y~æ2ò,ªj¿Ò› _òTë†°µÏZ“ƒq‰U‰l‡°F55kì(K)¥›C¹ýÍC$ÛÙRru:Þ¤NúV-Ö
ËÛ4¯®NRB|N?üFÔ&ûõí-ŸõSy°‚oÌteä"WÓ8NÜšXÞ¬M²Ž|³ä÷dÿgcEŠ+?ŒšVk=¯×ïjõÚêº|5½Ð"ñrìÀ%¨Y£˜_ ·ùèÝýÈÿÄ.»›ù D²ª¹Iyýàzîdá´÷Pá)BìyvÒù8¼ÊX¢%¹*âê;œþ’—ý<5¾Ê§hŽÛ[l>ò/šµŒúÙzhù°žÚXç~	ê¿›UõýÕØû%»êb�èJ2âÒÇ¬jHV¡H{e#–ˆOà•=¾aèF#BŠZ­qGa£ÇL	¨o-jnN4—söufSäh©í¾	S¨úMša] ëcKÀrq…i¥J¿JâÙj×ëcÁ
qû„Æ2¦‡M«ÙpÅƒ8¢A6I=:r%c'Š$qê)ÞEº‘Ó�–&®¾Á¹Å°-¼æÈ¼Vž“œpEˆT±âet'Ú–m’UñRÂWÞ†ŸQ°È�¾«vNœ&07MîÀ•ˆV‡,YE¸¥]íj¿º¶†×Ò:ÄµTµ®v†¿¶YfÚý\í,=tü­ƒdÀI-pÏqa¼CªæŒ!þj»¸&½	£8fn•/ô­DÃ:²uwëGDíü†9[
»ÕCê³µ´xME¦á,ö9OlÃL7SºbÅ1W¦+ ?ÚÅc‰ÍQ):I|[i0Y$#ŠÂ½ª?p7¡Ù`öÆ;RŒöItŸTÑ°Eh,‚Iê#[ºÑ! õß#‚CÊéµÆx²L<µ^þ×—/>\ýé%9yÿîèâýòÛžöß½<ö†i‚O£¼óýwï^ž¹_ÇÎØN^¾û@^¼<í_þáÉÑ»£ó‹³þÅÑ+ãNòts¼ÓdßKÕ|)Ø¶¬Ã¸\×&À!¢ìáÉ$X°P{rzñ~‰Èx‘!Â<dÿ:ÂîNAq¡)¡Dð›ÅÃ&¹FôGÐ.#VZ,àô4VbÚ¡GÄWÓl)»„+_Þž•Á/¹ˆ_"’^‰œƒ¤ßz}!¡[Â›b¢F‡¦¯(£ú.Ä÷5ƒÈÁËê+yž„ÁÓC= Cð:¥‚[ÕNW ¼ÓÛ´ì˜zØxýZÕ€äÚç‹	%åSíÇöÞØ”´%!{WNêÞËSÑs(¯]/ýAJÀo”lþ½¥cígfáp¿f
ÛjÂ¢0•K×~ó”^S$±®â|Ù:ŠgÁX'Lô±Þ{gûÑ»ÕÌ5ðjôw°‚Ì¯Åo«íÔ³Åh*~†WÙñ>M>
ƒcšx6§ÉÙbz69÷=}†VƒKW8op?Ëàõîc°Îýšý†kJ§¹¦ä×vŒú
£q8üFû,áÜ³ÕG¼drAGáØ À¯¢ÙÝu
ÿÿ���ÿÿì}ËrÜH–å~¾Â3L-f*ø>Rb‰)#Ee&S”Ä!©¬®ÑÈR`Ä€ˆ�¢�„¨(ÍzÓ³éE›u™Í¢gQc½˜˜Í,ækê¦>aîuw�î€¿€RR¦ÜÊ*Epøãúõû>êiˆtÁ•9@Ô‘§=óWâÈ‘§MSŠqüÖ<›rêï`éf*\ÌÔÓÁÈ	Ü©=öB4Y$ÔFã6óÝs|Ã³ÝÂžâñÄ‹f½¼H²Ó6
BL!5TÄVì7íÚ}ÖT£k;é×š¿´R$ ”‚­ÓêIáÍ±î¶º¬~ìˆ¬Àzmçõö™Éë=¨®N'*&t(º£ã‘â�œ®å–îß¦Èpc’¡—’»p<"WQø–Ã›”ÿ%Ñ'¦üfEÃ‰7ƒÄ§íÃƒ^rœGnóÞóÏP÷qúÂ­Mû…?épä}‹õí–ÙÛíÅ·¢
è…Ã çUì}n‹UšiqÊOç¸Õä/Ðù£ žºÎú-€<uëþ¶¯ÿ¼
ø=@Nƒñ''æÁ„N"�F”Õc+X/Øà>íÛèoZÁ¨0?›¾›:SùÍK{ÁŸ`æƒifÓ4ä`ß›9žîèŸ<¶÷ŸÏxX4€O_¬V¸xY8Ò§ÅÑ2/½p›öaf§ñ0v%îhzî¥Î¤}kv¿ zR]œÌÜôtà{Þ¹³»¦¸>·`ýú¬åÙ[åEmé4v´C}*Þ^üÁq®IL@®¹˜!9Ny0³°€Æ"üÒòØ›t»è¦§¡mëj^ø³+ìA?¿¡nÿe:S}@‚.¨!ïÅK	Ãd=ºÕâ”ÃîL rÁN.ÉÊ}$ 8¸VÅ9ÊjK€é¸"¡ÁCJ‡VÂ´ å«[“¯[Tï¬ÕYZ[#9Qˆõ¨`]Ö‚$W¶$˜d,ŒiqŸaIú"êC‹©'þÁV£Ü˜¾ôÑÀ‚
Î"Eú}WÐíŽ„ìH÷kmMý'–§6E¯ÂRl¥ 4(FkŠ2`åþˆ%1]º!¶+—ónB?±Öm†­ª2ªÁú‡Â¿‰Ð`Ë9<X›}º{ü‡Ýßï>×’ÚMÇËzpQÃA{ ™%ÉÍ;ä.ñ˜†®Úüñ¨I
#ûä¥”Á“æ¬—žê³HŽâ³Er“S³Ù,*8n}Áq:Ó¦¡”ëê!Á¤wî½3iån>¼Â—=ÒÂ›†]ÍXZ	Ñ2+J·½1c²Îë{ ?«$r˜7Y9LÍ¨Ä·W­î»}r¡ÿd8ÌŒ,w˜™ÙÕvj.æ§&¦§&f''óbkZl¤‡;ëàbèh‚ÅnægQ½ç›¡ƒºÝHÕ.ãðq£ñÓQÉÖÌïõ­ráZ¥ÊòE­tR+EAF¡Zêan¾è–7¡[Š¸6¿>ý²Žb±+\P{Ôõ,]Y;WÒ×Àºžsnµs•ó-šÃRí¸rÞr¨F†95•IÅðÏ’»ŽZUKÅSªSH›(MsêêÊ$æqøØ†™¦‰ù—ÌpH5Ò|­Í gÊþÏçZžW-à;™¸$	Eú6ˆhVâ©Æ¡GNüñT]IÒˆœf<unÎ´¼Â“CžžÁ/@ºñd+Œ8ó’Fðð%i¥”“ÐUP?L%¢É=ï>˜e¢Ý,M@œÑsCD·¼pçêŠÄÀ‚l¶EéÅÿZ~ @!„ãEK/¯/¯™^-©ß‚ž
ïÂœÉ×ðQã›ÎH7„½ø!¬¸?äKÿ}œœròîšMØ»T�ìvŠ{Ó1¼d´ª.C¯~Õ¿Oe!ø8BoV³ u¦™—d é€F}Ñã²ŒÖÒ8¾Wå0ÝÐà(ˆÏ½
Â]Á¹û"{]Ù”-L½qÒ[ëÃ2üB¸ÙT7d8M(–6­/m”gœ±i97‹ºÛKÿÿ¯á¬Ê¼fÂóbÏlÐÁØ„A‚-M;WoFY6I·WV`ÉÏýty¥éhyW@½ÍbX×µû÷ï?ØØÚèoö†÷×ÎÎÖô7Vßn>ºÜ%½ûÇû«wÓà|çÎœKs9[lu0éûO|†'	˜}Î'@Ö¶÷Âl§Ã­ùYcú®Eš­ï#;–ÖPÔ[R³$8,'/ÛÉ­U+}Gð‰¹pCšÿãe—ø€5ùÙÖ‘?|æMŽ‚(O³^½Ö¨^§~Nþ°—6:¾*a< ÇŸË)\¦<0EÀ×nOAg‰üùÏDx ˆátè§Ý°óÔðçó8^>;K:¶Êtuµ°Å6Jü·;ÂàmóÄó9÷á(üt]ØËïc©Õp§ÅñÄÇÌ¥(†úIb+DÂš¨ŸW?³ûï¤œf\>”Y¡ÙõG~f€5.[yõûôî÷a·ã	ðˆ‰wN×ÓTt5o.Åt¯rð!ß¦ý�ÙçL 3‡ï<\ñ¬uõŠŽj
w¾Ì|E‚úNüÁ¬ê£¸YP"óŸ5:jŽ‹Øªyê¼ZVhQñÃ
)nðƒå
¨ø<ñSµ
Q®¦}CÕC”>œ®ËÕ3áƒºþ‡9‡ÕøQÍœ¢QT–]¼çÂGt&Öµö/*dïYÔ!þÒ›;Ò"¾±÷!-A>y¾y7'ÿüp¥\¶&f1×ò‡˜'¬ìvUà\sfÏPðž|èmI6õœV^­÷©Ž%Ù”1›ÄÖƒ4DS%#À&ö¤R#DPþ/-ñV›uE@sÓ°¨uS°ÄQ8Ms“²©°yÃ•Á
JÓî†±�&C†ñ†´–ZÉ<´’-““ ô.€IM½,ÿÓ™—L—µ£ÕÃ‰èJªêê–­E!Gã‹E5mG>›¦uœR?;H'>,8?@Ïâ¡¾�ùŽa×:Vs{ÝÑ‘_Ú[¬f\Da¦oÈ©7>óFæÊ¡‹¯°¤žžÃ<ž1CÂ¯ÕFÞ"äêÈÓâhpÞshöCDÑÐ^~•#¢§ñØðÐgÑàDÀD‡c1¤5ØMÇ°&%iÔ\"€×«Ö¹�Íâ—o2
áÜ”`ÁH}Œ³Z]®X¾äÛˆ>¾fd§‡ñtøâí[A§^ùŽì=9|ùŒœ<züBË¦—Ðšø´ZÄ"]Ö_rˆãröd±Ú'îLÝtwØß×:0’}±uIM›-ì'¿§ò’¼Ë/“i¶Ýæ6¿ê¾ê`ùÎ=8I'A6Ã§ôÈt^c¨ÅÙa1þÚQuð¦ŸžÑ-A‡c½à¸k"ïÑ,×oÃà{³r@®¾ó«7eÐcõ\³kPëËI.<·âïØ  R:xÊªò	XM�JLwù¦Šq¬kì?%²µg¸l£~iw¢5_Æ»)¡Z
‹ñ{$§¶ç¶‰ÜwAü.Ë}Äö´Îñ;¼ŠˆÑli“^€ë¢§Z` ¶ô,‡á¯Â¯|Œ@±ø(nå±÷C¤à ášæ‰÷,'‰Äm\ë5³Ú¹ŒÃsÙ‡ú‡™ dsÛÍ,pnøA·Õï0ºy
ö[xf4¢Â«›ú+Ô<ò¢aè³Õ¢à‹å@Î(è¢¤ ºñPíŸíÛü³Ì«DeãÓŠ±œùç6
”ŒõÕ¶�¢u±M[jë›ÚÉÏM…2«c“:5ù:Á“Žú®äx”}’îAt²ŸÙðaê¯dt§¬¥AF!+£²É<•DÖFÝÄoU·9c2Á(±,Á¬nòNÝMN÷Eoê‚Ó°åôE}*óú[Õ1’*×Âãª>©“˜âî8Å”³˜¦~‚Ÿ^N'au;¤³ôjõµmZó›ñÍuODŸñ¸rÜÝÌnÞå|]|´L»F®/MJæÓC‰ÍYbj_ïÌžûve%¿›„{i÷èèøÅÏOöÄh9µ¬†7é [+FpôäùþÁó\<Æl4o¦�ûÉéóT¸/ñ²dä¤TŠæXv˜ñþÁÉ“Ó—?½<°kHó¬.|éôÉñéËçû»NJŒÿäÉ‰EI²r FÄ®ã2¢M®fÀûFe¨s=,¹žÉ–óGàànGE¶Š&ÄÒÒØìÐÈ#yF¹ªë©a£ag…gÎcTM[uòíps'ëánè'ÙixÑy˜£{Ü¿nt14ß_<)p›ŸÎ²ÝÎÁwNü¡'ÿÈªÑÐÍy­Ú‹ÑF¿Q••Æ!S–Kª7{y7Uã¸
×ÃevFg£Ë\oš±xÓU¾tewŠ_²_I¿yî½?óª@q,å‹…7ï\¥ô¿Õ¯
Øy;"žö¹ÓLx~ª>©Ì[©<ƒbëŽˆ|T}�Ý­)è‚øùoÒf«W¹ˆÝÎß¤Âv‡‘poèg^vJ#»²\gRQJª6¥]¤ú\e¢`,õŽm&(ô7Ä3^!ƒŠdY„RzßösEØ9£ÔÈ©žòz¦ë>R+äNÑÀu6%(Ñä«ÔŽ´%‘,…ˆt¬ÑaÃ3’zoýt¢Ê–ÒšWµ¦UUT›Te›Ë*Ú\VCâ%.8L`6 x&hª(Ã‚7ÌVRFœËiŸµÌÆÚ@•¶ÒÇ#ÿ}GXuÚu¢·¸j@tµ*KáÁ)¢`6µ5ÒkUÚm"aWÕ™U
fU�aé^Û6~Ô*mËŒã7+z‹Ã[*¡Jmn½‚vÍd®¥rPGLJˆëK°ò5ù!ñ†)òØXèÍÈ×+5LZc
¢ÔG^ûsÎ»>ÓËÈÛyàÍtŽ™!râá}H¸1¹çcÉÃ´Å‘¯¼Ð~ø,ÎÐÝ°Å˜âgŠ[*§Ñ²ÄSDè¶é™T,§ˆ9ÒéX\I`¼¯/ðÁ5döt¹q¤`¥
Àì…×O§
ÔÈßU°¨�uÊo¢Xå~“´¯“‚Øy¡ku¼Ó¨_³Æõ5xÚÜ¹í’SÛ­ÉöáÊ¨ïÆÅ«/®ñ+jÚ/u›uS°ŠR§!ÀæNží>'‡/žîjÔŒÆQoÖ_ª| µxà+˜Ë'Uë×§X}{Þ¶
ï¨’--$~Îmçta¶
?Y)³Õýd.B™c<íCÔ‡r1kU«ÝZJ€5ú­[îå@(1YÌ5Ùa? •”0ú÷Eè´úsXû"ñ®î)2Wy@î2Y°sc–w+»C£jò MÍLuK°˜]QpvÝ~h†2gøF›¡¹Ï6n*îVÁV€«¬7®K±ï§I0Iøš3Ô—â†rvÊ=¬øíòÚ-ÈÝ?øCÑ_çz[
`ˆ:ßšrc?çýk3ýsN½0HiyØÅ&{XK£ÚØÐphKðh•Faƒ·	|Ss²iBÔN^ÿ:ò‘šŸ¡ŸØ£Úéhýi6©™
Ýw$çËcJðòyƒf@såñçGÜ¹S#bXLîô¶–×¾Ý\ë\ßS<ÓgÖV·–ï÷¿íw®ïþigmën<Í&ÓlÇ~¨õex!ìÇ÷@&ÌL«yJŒvá™õä"Vù¯×äjJü×š¸º‡+l3Ýh½¦Ù*ôT«4GŽU%åãaEí²õÇUŸ_71æ2€ª¦²RàB_¸÷Ÿ¯¯¡;£ÃÁ¹$lÕR°Î,ëfs¤h‘Ã¤õŠOi»,â—µ;p¸{º]¿CjÇü™>ÿaÛäÅs8ŸïZT šèb<¸¥Yüu–EÀâs?¶Kj¡ñ{æ§©wîŸüqê%…qä¾VÙà™[Oã1áP.’!Ö¶>;8ÝX2þOWC[¼ÀªVöºe9ôf~’Ú”/ƒ•»™Š-ýê3sáÍë¡ãÿf®¹ZÙÝÒ;¼%<´÷û8ŸÎ&<
s÷àð˜¿IT=:~ñÓ“Ç§%©p”ÂÓ#Üùyv\tR™§à¤4z,ó€ú"º¾ª{ž”ßr,
¼Á½R3ÛÄÑÉôlÀ†±ˆga°ìÕ8Æ$Ã„ý“6ì”PñêÚ°ú.+ª
H·–!S€7®>¦*àoö«Ö-È*{gQgõÊ¬ºRSÀ£3î¢4^®ê­/Æ©ó‡)‰M]ã~Ìèœ½s„…¤,/Ôë¯±w»]%5xé™Ä_É‹°ßøKÝx!û‡å?“Y·óÔ‡å™Â!Ï<š	’»ä0>`.\»{’fãÔ<bé…S4GëW*"Aõ«¥€7%sb%Ï âÇmá¸ÕV3éÌãÓÕ¦K»x
Tšy.Rj!'¤²²š‹<Ï@~9žŽ
úhà;p6ÅYs ÒŒLBm´}vï¤{ìÂgîÁ3ÑÐ=DíU>z§6èí)Ê_VK³ ª×tÓT¢É†ÞÓ§ì€òvÔ]¨J*¾£‘i!`ç¼‚Mc’¯i£*³Qî‹r”L+QöüÞ§pþÎUÌM­«�Ó‡ý9÷‹YZÞè/³ÂbËô#š@7aí‚h2ÍzoVGôTRœD~¥.ª’/}êºü´Ô)¾¬‘Âcj4äËbaîßýý¯ù_ŠC$<óp…uèøµ‹iBeP²Ý"Š6:1ðâ·þÇÿüÿç_‰á!üñ×ð“ìtŸúQU:ßýíßù×ØßWÈ¨†eBe…Fß9òáDDÅZ
@¦>ç(8¹ûßÄøyÇÆK¡K/l8Ã|{„`AÍè—ÿò/ÄøŒékWØÑr×Ð‘7•egþÅ<Ic¾%ž$Í¢C*Ôô}%œx©¦ïše²ç“™˜¶ÅXãì7Õˆ°ÆÅ26eÐÚø-²Cd¦l+O¬­áecicÔÝè÷P!þå—g»Ï_îþòKE'V~³¡dÎÚ5ñ±&JËÎm³ÑoƒÖæo0ÊÊü©ó]¯GŽ‚0åáÔO†,½ûbÂxÑéõÌ\[Y
Uø¶WÑàC)‹xçI«ÊÑª°¤{G¬÷¸ôæÚñþ÷¿þë%eI8–"µÏN]Nž_Sà€Áÿ÷Á›ì�xÛ}¸T8ïràðll:.ÏÿÞH\ç™‡ÎŠQÄ„QDVPÜÀSØ.,Ñ
'3@£¿ôFhß ûoÑÎ¡idºfå‘ÊŽ"Æµ!£¨þluÔç”7VPwIT}À$ÑIwÉx6:þžÒ5ÐU‡ùyù†¤þÀK<¾ËËËê¯õ+‰ÿÇiøCÅ•ê±^Èøi:œ¢$ZÄ:	,»5¼®ÏlKî!OF…|NQ…Bî4W°LXŒèù?Èü±Q37Š/Æc„Ë8¹@k—îî·µjvjÊ·jfÌjät*Ça¤^¸-*'ˆCÖ6É‰wqØÕÄ#ãh8
2Ò'Ñ`tÀ·a4~yä{™öœèNŠîiÃ!Ñ”?hVjì£Úâ�¯—°o:ÈN3Á¥`F±¶âEfIÙƒ)OŒ@§AãÊN´7¨|Æ—ïX41Lú9Ê¶(}µ.x4ów,h™táì‡Sä�#¸¼h©aw4êú;^MºÏ³ôî|G2Kw&¢¡‡Yû“4ìÞÌ¥ÄÏÕ¾UÌh©ÿÊäÚ¼4	jº3]Í-âhxÂõ£¬­ô	K– ³Ñ_´®]{<ÑÑŠ6cÔxí´»P¸çÁùJÑkXLÉŒ@´­*™Ë‰O/“îÊÝ_9¿GŒºœÎ5‚?"Ï§˜¥„?,-g1Êw¡’aEºn¤”ƒýÎ-M¤ý€Va“®»UÒ½ˆÓ8:GÓÚ»àÂ#Y0„ó>öÇTfÀ__ñÈ³N-5ä™xúFA°É5fâ,D.nÐ!ØÅÝ˜G,ž34½ù$^&^@‘«ËÙ4d
8"/ñÕ%ÛØ-(„Ž6’ê9påZŸ*~“úAç‹M«µª»–hp¤U¤3 îNû"Wï‘‰Íü3ï~—Ëc+ÜR›‡1ÜcZK:A¼
¨ƒ^b2Ãëpdœ«2ìõ±VH[œf²_Li,éû8‹‹²i~ÆOíL©²„jÞn-Œ6ç:÷Ü®+
¦q+eŸÈÕä„¼VÑ
„2Èzïaæ1BÇòŸû+´<®ÍÁXY¿Ögi@|Ãülº¦§~2A3ˆÞ|jO‡-
4ÙT*Í!±’®ÉÊÆj7Õ$(Ö-„ÎX‡ßZ—	ì1SµU)ø“�3sF—7.?ù€Q‡3š¢)D²Š™xµ£iLibµªtéå›mª{b3™3²¹çAŠ[47ŽÒæËª?øqæ«qiÖ’¬7¹ºPšv;XÔ!ÿ¼¶ð4ñÒQ_ÞÂ½ÉTƒcÛ4s]Ë~ºíæ"öRW±bge¯ÜÍÆ
ÛXÖ%…{_+n;c ú”6D»Ð¦Ð[®µ˜Ws§É¾‰
¥—ÓxtNž2ÆÀÎ¿Rpá_¼!rhË¢¥Äõ~M>¾æµg7VexÍ"z,ÿÕÚª²hm‰ŽÓg¥ïì§0¢mÊõ UÕpç‡-soÅ põ}æZOû—PÛWQ.vuSY.Ö\©Qº±9¼ôáfå#Ô"{µHKÌ¥þF‡[ÊqIÐ4·zõáR‚Í¥¸oW+n}—!ž�)L@ùáè”Všú:Ç@-ÕÀrNig]/ÑÆ6"?�%‰uÕt)ŽQ†Cˆ±•hÓµÕ
»(Q¨naj–±�ÞÀØ.»ÄZ¦VÍ5@ÊZÀš/'aì
ýŒ‚yÒ‡Ð:#ùg[m˜?•ß¡O5Œ›â+2¶`¸“¬c@Îô“êÁ¤Lò0–/ü	(÷1zåkÓ£"ÓaÅãÌŠ{,Tn¨ÆÁŠ–jü9}´üjõµ)ˆE6á³¶H¦ü;‰ï!¥îÈ¿¤»{LÑ5ac/.ÇS?BTú³¼¦Ë¡àÝ%~:
3äI©ÙÜuøŸÝtßË¼—Ç‡t°½0>³ô`Ò5
P•Àäæ\›VbgTžÒ€t=ŠÉ?Bê$·L•” øºeP¬ß®
«&ý÷¿þû?‘§£ˆ‚?ñ/Ð½V˜tªÖÃ¼NêûLîbÂ&…
¬õ¤¨`²ŸZS©ïj9 Šºh9o½0U©9Ð…7É¦	vBy—A}f¯÷ÁÅÖw®T‡œ‡ÙáNoe¼¦êb:i>0õ+â­U¸<ïâ3°±Mê! ´“*Ö² ×LÑK¤¯zÅLV3·úµc¼R§e†©[Ž©{–i“<S·LSS®iIéêî*³ç­üjÌ\l˜·è’µ¸Þ7Tƒ±KnŽ¤Åj‰­E¥/ºUâR™|nªë—ì»›Ì¾{æEÞ;šfJ•º…´»|°Ôû;Î´žÄ£iêeä Âk–Å$‰
Óì*“¦‡ÔZ\oÃ[‡V„]D=&ÿy
'€0Ä`*ôÖ³W(Í»V8WÈY¬êA¡pózÚ]P®ùBBçwçž—Ô2j|Ø9ŒÇ&+pÝ¶[I—.
X3èx‰ÃÍjá×³„U~-Œ–1«Ûû­lôç|zUðÐÔ
•“C)¶8uDìs»A#ç›*${HÔû¶½Y<Íæ«‰8Ÿ™#uã|eæ±äÚ]¦`J»†±¬Æç ?’»ä‰êåd‡VímÓVØ³tiy”žüãÑ“ç'Op”¤°X¼²\NSY€ù·wžàÊ ~$¦ÇOèLaúøG;QOËÐ/šçkÊÅoq¨š[Bì•È±£°,Ë¼2¯PÊpËõ0	/ÇÉ¨ZÌtàœFà¤e¨ÞV—ŸkR”JüÐù Yò§ºucâ;¨†,\Õq-G*•¥©1CHMésù±ýÑÃ"ì¦ÑfN×+Uß åÃ |(žl“S?òÎ=–®Ÿ×ÙØóèùæ—§.8e‘‚w“$¾<¦š•²@`>¿ÍUeU@½ÅPÅMPsàö¯gqd1ŸÉa�»Û@kÐU±k\µ›êEµÒN!dŸesùc/Ê¼©NKU(!î7ŸLÙxˆu+OË¿&O¢Lé;Ó÷_H=ÝÊ0hBùªsˆ,¯­Ê^5Š4~æÅÖó/%x¬!½×
,
78<æ
=â]À}D¼x):2BgeËãú¨|}€~ë-•b³·…þn	þ=ü·c¡3Ö„ª	¼V7¹ÉJ¢fxÉ0Úº³á –_%úøº
}\’ª^­.?¸ÿzQ1XÍÐÊ>–qfê.…?y|GeY\!<³¢^d®“ZÞËqšêˆERötBg”Bú¤XºÊæ¯Ým}=´\¾lumÒPH6oz^(tŒrò),IƒnÍå-l¨Ö–¿»ž

:
8›M€$áÛÚy#Œs*ãlÚº4ˆø“~Ã±#ˆKùÉZ[­€áRQ‘ÁL­
å§ÇJã?SwX'B^>{ùÌ>zkD6#í9P_+ßGUKòûôîŽ²Uaäá¸å‘cañÛÎ5ùÛ?ý‡K·ÌºA¨ÊÿlªÒH»Åß›Â±ð×aQ×p¦+zuŽI½&Rñg�ÐÞ`}qéó@["wÍ`½XøH%Ð/cë7Vœ•þþD½Á4ˆÈKõ¾0¯ZgùÌ£16>n4†š›aÔ&2ïý²”8(j‡âoLU¦iq¹œ±’º:|ó7Qxyþ@åw�g‘Ü%á4*FSØPã¦~%m²Z@Ô‚dñ1”tQ÷ƒÈ$Õ9ø/Ïœ&^¡“IÙVD]¤¼»+ðºJ;ß¢œ²•5züòô`Î5*duA?¾ÁR©ƒ‡MþeeÊÎ:Š°™êUz³Ùb§¹É>¨n2Ö4÷Ù­
NañÝjç\y'š¶Äò<1t©*…ÓîÿšÝÉØovJU6‰ÊÑ”=håFñqÆOüë#¨KËÊMß)‹)#±ja‡Ô.Gup³™Íû$i©ê 
³ob!>ÊÝhèIµ,Õ¶o3$£ê/ÊÒò”)*Ë›ªÊÓÞì˜Ìé*§1F–BM2Á`Ä·fëñÖ¬]åšï©wn2–è\2&cRÃJ+m+­°vˆuNNñ-òsà_T-CvˆjªEÙõ¾C•:cáAAÁ_-EÆøŒ †¬9@²æhÈš¬!kMÀ
ùn‡="¾"J¿ŠÎ›à²æ†bˆÍ‚9Èš¶ô*?}^:¡oP‚à†¨ÛY@ð0¦ƒÖÌ‘’è§þÁÆn§žÕ%}{Dÿß€ZB
NA2b
bÃDçŸŸ|ðdnSZã?‚<¥fÚ-j|ÎÉßšWù$ä9Öæ!"ÚÉ¹›%±s¤ÞY¨)›Š_;ÐC¬ÆK‹^?pIäÄƒ$žÁúª©&ÊmeìLÃÚL&;«VÂ2x’º_µÚÈæb!ª.ÜH¿{ÛÈÚ©‡‰ÈX9M‹ÅÜrÙÒ‡lÙÆØŒ}ËÆ+ôyºãec²˜Ë“ÍJ³fdƒóp·¹’t]|D÷“‡å¸Ã©ÞS\»BpiæaÚåØ‘ê2‡'o›ê>[ªxæ¥S]àf>óB~4ü¼IÂ"fid,CìDƒ«Ôø>
éåw Q‚40z`ÈÏøœHs#j¶Ø·^m®W`ºúo½i˜ýÌFÛyñ/	·‹%›N^ðzÍK¹{ÿ”º÷˜4ÀÅ•­ùmÜµû\Ê)üSd¬ô¶µ“÷§,ã}–tqâ'Þ'Mpå~ÞtÑîÊý¼ÍOý	BoPH‡]øªö2µ7ŒµÛ±Yi‰Qt‘šjm&ñeºsµ¡¿r¤*í?yg^rAË³çóDW†ëFkËÅç¥wµÐß=\É¤¹¡„»kå‚FšòEú¤DZX¨ð3ia,àj¬êRÕæ[6VÈ­{hÕþ
õ×ãcõ™4ÊéÖoÏË¼ð¢ÅÂå%™ê¿×G’©åvßGíþºêš"lXµ³ñŒn@Jv5ÆÃ™„•I±¼Zæ':Õ¡+›…Ôy0¤&=É<	ÛŸÿÜâ=Á¬Ùæí@Íd4ÑCŠ2±5Õ›ŒymÈ¢Ík£ü6{ÜNÙJ÷áÛn¼)u®gõÌíInÒUeêUN§Ev›™åc^h°©Š~¨–8ÝÇê™pnŸWõuÙ[ÛBßÑQ…±QNjMžèyÓ,7°o�KóÌB¬ÇØÖûÖÌ§�xeÌƒ1ÇÏa°e’_\z3/"0ø”a´`ª.Õ¯œ1:ÝaŠö´—W µäÔöz9ñßûIŠZ;O
ü£O–ŽÃ–x…æB9k}XU”ƒ–(KŽWb(‡Ó„ú—1	Ö¦8PŸ;C¦z,òcûÓöÜ0éMîÍéÁE$ÂÝ¡[™Õ|nŠ’2-³Õø«Ó¯Leë˜ƒöËæ¶4_5:{æPÞÒXu·JÉrsI5“¿Ó¬.såknëæÄù£ÎO¢`±Ñ<qÞ­K½©öÔùeY×$¨®Þ€~1®Žœz£iäEÖT¤¼Ø³á¼ ‹,Gç”’U6º¾CeALÝÄ,÷Sù #M¹?èÊëDNWDËr‹NÌÔ¦ºY³§ò†*¥PM&	\_k“ØJ•·íÚpŽýw4g½á)R2ñFC™+¿+onW†^•KãÒ©#™Ú”ƒâ9Ç`ç¾!ØY®(æ.6¸7®ò‡©H‰’}ý;s®}öÒ`Å†µ!Ô)¿Ö<©µ‚[(ï»oôÖæº×‘7wrêe×¤Ç¥3î®¾~Ó€Gˆ½¡áýš¤+Ã²?ú+GYÍ}™±}œdò¡THA™\#Ã!VÝd(3R2
¹üÄÉ¿0¶/žöUÂÈZe:[•„€*èi£SÀìô®äå$}Ü0¯gn…V¿ÎdÆü=kÉ¨…¼ïJÕ'«hèJ[û»?½|ºû|Û%ñžµ«ÂñO™pà$ãI	ÜŒãÁ�Ž„Á1žUEë•#pfvC¬Ô‰¦ Lçþ	ÃúŽàÍ0ŽÎ¼6ó½¤Å÷®ÝtÒÝù¬ ²lK¶Ù÷CP³w@—™~õUMk+%g�ùµB`=¿4•¢¾2:´¯kÙGÁh¯²mª¨,R­=™Ž€ü/zŽb.­©²Ó¡è•¥ÅÚå]G&/ce®;Ûè}÷W“›Þ†Z>éb¾µ?¤¬¤PüQOíüöÊñ¥®kå†Zzh½ÃgV´ÝiRzÁ¢«:ð³âiLzpBÄâÌIÉŸp�d‡¼üK¸žŒ'a<óý#oŸ1ÝAèï*=)­‚äE~Hv„¡u%?!N„	ò>Þ©z5Ç—ÜËŽƒÄe'é,‘»w…¾ROìwÿ©2Ü”Ý,Cø÷h€ˆX^ñÃAšÅÉLá»íŽjþÚîHt—–Klòµj_»Až
>+¨EÏ…+s©º9Øçcàc»Ã÷8ôE„UÓÔ¦3p˜þ¡`h_g^(ÆW2¿ÃéÀ—Æ˜NÇ÷È€Å9€lý
|ÝÃ–‰BÁê=Åy(&
àúý}œ\ì{³”¶Üûü£]o0Ø&^4{õú^Nu5Ç?ëqÈ$8ŽnFe=þ‚,ï	’žÄY/ä*ÀS°ÂèLCÑ°[!7EÄ@lF…2¾xyÚ©?Q,ÅH¿ô}¾zâþ‰›F@Êh"*vóc<MpÏVÅõÃ²&ÒêUQéäF€´Wâ«Â`§ècº\D-ÞÏß\NýŒÎ¢»öí=,/€ÿ«<+NG»›ÿ…û®ì¨øe„¯º\Ï¼l´ü6ŒcEì‰îK=å—V×ydºUò5Ùbÿ·T•Ï+³ï4)ª§ý;FèÝ!=nÃåâx•ÄR›2¾b×¨{E–——ùé»'Ÿ©{ò²Ü+Îíµ4@qx<fzÀ«î‘W¯E
]Y!Ç>P´ÿÞ'·g³¸Œ‡?
Þì!¤ˆ
ê†úÃZ?ÛÚ‡svP;ß¡ÚFoâªùÄé´ÆÊ£6TL•N¼ÆR‹E5gåÝ»ìJz¨
oÃmþšx±ÆÖe[{i•O¡â%?‡W}G
íá“ÝŸŸü²¿û‡šJKrÊž¢“ª>ÀÌ=ùˆÙOÕg8Ùn—HX–
‡­0çNš·‹“^}‘£ýáj±ùÕ†.®mñÆV9c¬–îµLx•§EqjÔI*ì±ê?sË¬x©(/Ÿ°S]¢wå-ÀpH+¯ð/*_à	Î…øýHåùË‚Šv…îà÷ê<^KñŒæßÜ¹ÊÉþºwçªì°B!×oêæ·sÑäd8œ
ùtÐ¯?âr>„¢µb|åÉÞÒž—a;ÕSMø6
¢,É‡Ãrˆ@ð]3^«â’9Üa5ö½ü6NžxƒQ—Q7üJÉ©¿’¥iÃÍw³¬»Â+=QÒ.¾­¾ ¯ë÷ÐÐŸd'~–!®ÂþGl«Ç—Ö„ènÊ”	¼:«ä™wx‘A‰É÷÷ù¤Úµ—â·ôhYzZº¦…Q›[ÛA«®…?Cók8ãª¼8Ô½dVÖ8›†jTû8óRŸ÷‚�ËªÁÙŸù È¥>ªÕÐ¯BGÒÐ„y<’>øMuësaêzCNyLÛƒŸ–eáökiP–>´íÔu•æëJR²b
KV;»\d‹´“÷Pã
¤=zA¹¬t‡Wkol«÷„³ |A»qœWz­êÖ}Yñ¨D”–gÙ¸«ÂYO±uô}û&VøÓ*„ùYAf"Ñõj†YRÿ†L^=à0Rr6#—¾�ŠÃzÇ_Q	VI=â9§íyuáÏ¶9˜øk.áâÈÕ$Vš
Dq€’™QûÄaT–a]è(ž+î|H¸=z¤üÅÔ:ÝÇžú¸¾ožÁ¬Î§÷È«²g…û*÷KÁzT<I…‡(ÅIÖÆÍ|òÅ$Ê~Kô²„Ñß(5Kø?T5•¾³Fó;Ù¯™kž¯ø¤_/ñ'XƒW¯å5ÿÌîªaåšRß¼÷ÕÕµI©bž#˜[09oñÒY4¤gXKüöS¿¤/øñ‚7)h¸ðUåµ^²‰%>
q
h RQtÁï¥kÈá*»ˆÃaÁ=óAW¸Ê#3¬Þš¤ÊD·ËÑ)²ªGõ§àÍÂT%f¾ªšà”Aš'x%ñÃí|okàæI]a
úN°<4AíÁ
É_zp­³?yüe6“ýx0E«ÛAm …ã&,(
ù„—*GŽõÆç»
ü3«Z¦:G»8~qxX«;/öwOëâö›g~t>=óFÀXŠD:Ó	ü2ôÇgÓ¤#®þ
}#$§HŒÂ£(bZçn€lz
“BýæÖ+	ÈñþÄI¶`J2CNËóÎò§ùâjŸ®¨cÕeÃÓ©öiT½zÀúV>¨P———ÕÖUx”ï¨M™A Q|y{iÖÍ’©_1¼l0"]?ITªy‚J$qÒí0Hü?ú«m 2|M£ùèQ)3)Ù¨ Ö±ë\œ¦–Ç.’‹ŠR±º[°]»’^îsu]QZ¯ÍüV|ÿ•$FV™îÉ|}Â7ªó¿Z·-é×±œZ®žNènMr¯˜Á’jÜ7Ã¡(-Ã‡g>2>f:Á/†ô…éì.
:@¦ÂOÃÍr¢œ²Úp$\?Ñq.Q™$«¯Z­¬X]¯Rª,S]Lâ3"-Ô#ithç2píü°fd×²¹ñéK¨ºQ<öê¶7=h�Z½ Kª½÷†`°=‰ì¬‹pV ÿe‘‰CNð_§hy W>ç`eZõSPà6Ñ90óvúµ¦h¾"ÿ¹·aÌx®>ïÿþ@„/òÚØÁw8Þ¬xïuµíi÷×	M¹BÆ¢õlc1ÔVgô"òh
Mv³Vq€~ž‚XƒÕ~þxb
7.éMó�Ü®¹Ù“ÚÆà¦O¬žuÞrTååÆn<ÞOÝ%7~Ò’oàN†ªq#”¨)¦–ûðÆ“ÝÌ1Ð«Þ”7õ‡DÏ;ÎÄ¥àFÞj/+qêoiÄêÍ¸€Å"Õ\õ†ƒ³Ø‡Ë¦sÉTý0Ø)ó¿˜ÂU±YÓeS›©ÅV¡?J%yÍ‰¯óõ0àÑVrÓÊÜº«M
}­Å2w—_@Ò¦:c�˜‹ô²QÖz_ÂËÙoú«RF^kQf?¾ŒÄ´ïæÂŠ+Üöâ ÑåÂaÕr,Z`Žç°è<× <¨)dAã¥C+_˜ïŒ‚]q•M9«…§¹icnéÄ'—øÉWŸ÷EÜ|ÝÒLô–jýÈxj^Ú–6åkÖ…d¥nÁ•NËª¡ o¶ºOVôt¶›Î°äz³’ð¢ñÂ]Š¯T0ÂYÕ–JÌGÂÆçÆ“"šàxï=`JæT%¹8RK¨ô¥‹!>C³Io€k&€v;õÂl§czÄ\ŠÒù+ìÝ©�°èöõ„¤+Å®â0NRM•œš®8µòY¬fØæà·U•:ø­âLk> ÏDp‹äEk
 húÓV±^Xtð×ý²˜MiØ©dÄj€_°Î=õIÛßÿúoÿ—ì	.›¿ÿõ/ÿL‹—8Ô qÉÌ²×'±)ŸMpŸÜÈs]nºYûç–ÈÍª×ÇK¬ßa^Žã	¬Gš5¥¦hÌ(VnëúÛ*“4ÚÈ©Ÿy‘°ßÜ¹nïkJâä©Ÿ¼óŒn
YHÊ×‚Y—»ç–½çž¿×$ƒÏ-‡Ï”¤W»‘tI…õÒ >)äåE�.ß²à£‚+kc™Ô·ÌŒgB8VõÅÂ:>u z¾Kã~¾ ;óNôqåÆ\WjªÑjoNÂ`²
›ú=*8æ¨„¢JhëÝ`Jô6¦ælr779(e(£å¶Ý,MWK³HÈ¸õ‹7sÅ(XP«ÿÈKƒP#[*¥.÷ðJÃ3P¯þJö«a¼íL‹×Ÿà¶µ£ýï­§x½¬ ô@vçg™ëo@ô•clµÿ)É¨jûS—|ÔÛ¶(Ò¥;L'­ä»‹Ã•VÞÓ¬5¸­Y[(®tQ3®ï|Ã_­÷ñLËZ\QÐ#‡|­Æê�„Mè¢«]ËVõ7Èÿ¯ÔêJEoí43ô°´c_[âÊoM;/HHÚè,Q¥Ÿzé™ÆàÞU:¯°LÇñ-LòÛv%¤vßM…aDï¼1üÆsßæÈb‰.|8CSà
l×»X$Ê´Æû #OçŠãOÛ<Ü$·Eä­õ+,#Ä½úzy»½Z]îûã×9Ä€Ç÷BNZ¤{<ÑIzóá 2V;Ao^cð,ÚQÿ”„b¨â£ü`G Ô»P0%f´3|ªòOŸ­0$kÕþ¹1eÜ c$*xsŽGÛäiÙ�ÿÁ Šs3:ÃŸYo¯+ÂÇT¹æ-R‘¦œÑ<£„eÙ,.Â-µXÖW¢±‰ÌŠè›ZQ.»Wï˜gà.Ž25º)ˆ†Áy³Z•‰&½ûâ^”+:§TT¼þ',E/—á”ž…žC)kqV�~œâ§er.Q•rÏOÒ`DºÏýL‹™ìñ*gûF…È%Ûý‚æã"w°©Ù×âfw2
­¦pô«::=\œÁ¬‡	ÈËgá4é‡¶
ÞfÅ[–ëÅO­W*l¯[,ôû^æ‘S?’Þ 9“ÛÙ¢µÊ¾Zzu(ÖX÷äy´¯P“
wöyVö+‡y¸éÍ*¾³.zêÖÅ"Å#Uå\ë¢4LÚâ«(òk™† úìe—Ö´qÖbˆ†³©¿ÝÅ=Ð"ïcÚ­Z}Zé´IÔð¨DbÖz.l¬­œkÕ•OšX†ºÂrµ®“ù-1+½ØÊ8Xn3œk³—U=pEUÎv6,lùºÞÜ=h¹‡Œ>3ã®‚oäúec8dç·±TZµm^¯Ü>Á2p‹{¨©Ô;®4¥%õw“ÁÒ¦1«aä}!löYP‡ÍWÖŒ÷4ŠR  qœ¤|*ÔØ�3IFË0ºæƒ~dÑä
äÏ`üž",HGÞ† OKÀêÆ 2EÞ#ã­hG±¸`4FEËÐ¸)ñ‚™¡RÿóLÁbÆð“¶1vYN%Ç©ÜŸYN–ã6QŽëÛ´íZ¤½ìÖFË6‰\OÃà‚ìi©óQl2•víÕ€ËW+_“}?ó‚Ð’½Ä÷.@×È×+J×X#`Uô…5ª\¶F„­¯éj	‹­^b�µY©Ý%~Ç–ìˆYG×›e!Õßku¸öç²S¿FîÃ-rŸ!‡+›Õ¨C¡j½íVqÏÌCs%ekað™Š{CÄÆ±¨v‚Ä·é˜ó4ŽÞçï‡¼œx#7`Š¡ÖE±†JZ£î¬@#UŠ©è`kd<Ü®©d¶ø;àd,d”P¡BÍÂôc¨Ä5ÕÏí¦,¿õK—y:æª9ÿy<¬jå4Æ¸ñAZ§Žo»áþ8åeÚý ÔšçÌråRõ®´ä!– x¥­Ã~ÍÉýÖ
=Ä
pGÏ8±­'½0\¥J ª{`mÙŽM&aó')}e
±‡»–ô¢é8uGLêºcgš²PºJˆÎ½n7®þ§nKmB Ëv#`QÖÇœQtœB.«
ƒ%](À–„\6–Ÿ•rÆ“ÌÉ¶óÌK§<]¼à:{^2Ýn�“¤ªö££B$
}[u3æ‹
——Â–[6]»îÄKRÿ ÊXŽ#àU£?ÆÞñ«¡ñÖYŽú¯{»žR³U›aÌ¼+EtqE’ò²
Ý¡êiVv¥Úü”³ÀñË=‰çŸÊåoÓ–ÜÀ«>Ùz¥ÆÅç’?ç¢þT}˜“j þ\DQ…0©ÏÇ‘DI'©áVÿ-9É€ð½„¼Œ‚Œå×8¬šõútX0ŒETTiíÂ/ŠŠ¥ßÏ@Qá;yñ“§–¬Œò‹Žñ‰éÎ×©xETËÓÒûÿ‹¤OZJúsÈvÉŽÈf’ÝÇ¡f’¢£”ÖTJÔÊˆÎK"“îÂ4zp*$¶Â§ >2òµ¿úEz¼énq¬¦IAŽ’¸—`ìÛ‘Û [?`ü³ÚØHœ³S¢Ý)rs*™•Â-G{†ñ%—ÇÞIšõB?ƒïm»lãq
P§Ç4}=¿fAŸ­…HkÉ€«
E^Z²,	 ¾-êÅisÑú¾vŒW5øN^6í;²ÚÌ1j.L¥{«;²ÚË¨7á±[kbT‹6±¬èÇÆ¥Ù4¦XÙOÁeJA+ÆæRòd!ë`eGu"¡ÅÅ<ö�Í‚„±\k´hïÑX8ŠµvuŸª¡Ze0×Jß‚cÞJ[nágÿ¸[Åv“$¾Ä àcÊ±¹tqßQºpS6œžZDŒ¾ÔÛhS_Ú¦~u9k˜<ó/‡ÝtÔñF›s)öÕŠQ"H›NïòåÍj
©±2ª¡™m„}ÿ,Ð§,Êv58Ò5Œ®Q%W·u€ä¸@9[+p¢uAbÒÒµ[Ì¶¿ýÓ‚µ²|À…ùÉÝ4„6j„L¿õü8‡Íêa€r>q–4ÛÖ(³©~ÉÝB¤R|A‹ó-L?¥ˆ\é’ Ãi?øˆ(_5ÎˆÔâÔïZ£ÒÚÂ­¼GAÉPþ}½M^qxô‡¾v8]Pé ïðZ%v¶±<·¿£­¢WQ'É*ƒòîH¢.™È®¬¬XS'†àÌ½¹8
Ä‰æúHÞ®ruZ6ÇƒP<N¸²¿G‚á‡Œ¨õ´=Ä¥­¿— $OðÖÏ¡ç¿Ê?* ~E‚d§zaí·åíF
ETDòÜ¯á6¤ŸS×šãvêšž§swØ$ðÏojpBu­~¨®Ù‹°‹­Ø4–¹d®D/¶o´É
pIõÍRñ¸Þ”Z±Ñ+ì
:èÝ¹pm¬Ym²Ç¥•!’’ùC–h‡ø¡ˆ|Ù —&CKÛ*²¡¸K[—h_É¶¸o)Ì\õußqå¦¬5e'¬±Z»¥í fY(ù3ûB½m×9sÃªãÜ”ÇÙ—´D¬‘Pµ\(›þS”‹@«'U
mJJVäÝVÜšœ®&Çé¦Â"Lßh"!õ¤0w¼Z[×‹•Ø<ÊÖX%›$,¸{ófn1 ”qGç
"ËVA3nÑƒŒÜ¼U_ss7G	ï4»YïµFmUº¢ç—½·AFKŸ3$¹º+p¾5š%×:ß¤5ÌŽ¼ù¹xHk·Ø}np]m:DlÂò¶x»¸•ëÚªCzÉFè–ýl“jÅØ5_S'^nT¡ŸoóÞ(}ßvº/Wú>/ñ_IPkNùmhŸÖâl#\±öˆ¼y<Í‚•ƒ?ÑvaW'Ý;Wx_„Ø/Æî^/éÊäš­Ó^ÜZ²¾Z\(ˆi_GªÁBÃ¢ö{Ãà<Èª>ˆ¦ˆ/\ü
™/§¬8Ãœ@9®|W£E/fopû[mx“ >ñ-G»½Ø®êdl©¤ùx3/	ÏÓ•ÒíÛ8JV1%g¸ìnj!@²ÏÒAiT�¹f¿#÷ƒM+‹Ðjß
-¶¹%…sWB<kM´
Ï¥"Õö‚+êf†tÔ·«ÜRõ>´ “œ4“›‹ƒ-Ž²:¶æþ€q¨ÚWÜœÅ-Cûh#[,Biçƒy:ÅÚ1œ²‚vBðÿŸiU7˜ÖÙŒœÌR¶q›ßô•æ/˜3Ìó*_“Û$š>éViVÛÛ"ËHµ8-,©1)´\kO±)ÛÊ1ƒF[ñgÆŸ›ïÃîíÏ›âyâ@÷ªæ6¸~×ÄNçr³A¨çÙb¢ß´?mmx/L‹^D¿ÍvÀV	7e»•ƒÕð…F»¦ú:¬Ì¢â{–ô‡]áa¨qQÆPS—÷ª	+VØœ¿h®E[Íi˜¶(–l&4êTY
K±áó(uUü¶àf›¡º&4ztÆzÞ4‹Y¥gK/ÌÊ¸a±2Ú‚¨õÈ‹¾ÛóÃé˜ì=r\z3Ï%ëw>xE-Æ·¹ðdý×ÕßÕojï©Aö\ ö\öÜáõ\ÀõôÐzÒäÕµàKbJÄðšNýÎvñÌü{Ô¡ÿZ~pßh¿±ÖlOâ
ë«_°÷LØ{Azœïu‘ÇÊAÖ~ÿOêäÂÂ+¶
ñÈ•lñÓ@¡{zÁ˜�-¡¥5Ž<þÜ¼Èp_)(º5œPµ~´µQë¨p†Òä%*ÿWñÆ¶,)î(œ¦ƒdúíèú†°âê{õëGŠË7×Çž¼%¬¸’æn,ŽõîŒ÷rBÑö¦Y@ö65’`¼86”µ<¸Î±öA
gþb%Š3zJÂ`2ð;Ø™ôïuæ
<"ØHÓS õ÷Ö‘ãŠSö7NnO¡Ÿó81‘±"iˆŒð4Ô E|èðf&=RéÅñ¯<X¬A>àè^d'¦î,¨^æ@„‡ñù4yï…SÏ)^T“8Éàº·h—â£d…ìí=3jì;
†ò4ŽÒé‡‘ÿ‹z“[ôvä%A²rŠÍþMîø©EW»@,=ªG[VèÈ¶bî=¾bU½[åÐ¢hãàÿ°wñp…²á	AÖv#ââªb—Ô½²ÖVàþ¡r=ù3ö‹qÆD"Ù£Éc“{þ{ˆS&’¾^d×jŸÑš`T(à“f’9¸æTÍ›CÕüü©ä©'ÎcU]üèœÂUÞ4¸&(žƒ$ Lª!Âæž*TDNPûÉ»ðàâ!GÓÔ3Ðßç®éDLöü¼DHßÇYLNPÒAà9°øÅˆe#4Â¹xúBu‡õ¼¼ƒC²RçÁZäJRë6åÚW‚À”oc’*{è²ä×Ùz_ÊÓ¥Fè{íB3J‹Q~¡ˆ+/)’6î¯I¢˜ŒJý·–5švæA–µ[‚æC›åPE6Û¡ÉÒI	9ÛöË»žLÇ˜–dªïª­êjµ¼4²õéX
4b'¿úýK´ÆŒðÿDc’DsNi
Ò2ñ”càÃ
k6ògmp†Ï˜kÎ5ªÖ0Ô”eÈ2Ó4-6M´¨P¦Êæd%ÝŒû¬ÙƒI®ñ$›£—ß!A·Ëòß“etÖ©o^ÂwÂß£¨e­K1œün7½GÌdN¾!^òãYµ¼Þ²P»‹Å+Ôq%ÝaýtŠükøqï=Ò¼v
õû%…„›¨dzÏIÚHiÎôn
ÌË»h±”:Àí×.»^üi#Üë/•«†Ë7÷Ò-É@*7n6úèz›7*x—ç^ž[Dåa¦¢õöÌC|ª‘?öDãÊuºÞ·t³W*uþa>˜—d;÷kÚ¨yì,üÇz$áä‚^šgh:'qéÕ%3Œ›ß†æÐ 
 j_H>û¶à˜j3o¯–——eòmÅB/K§Ê5¬^Í�W—«q©ðhôŠÖÁ };”yÔ¸V?l“žÎ·*6ŸõƒÖÏ*¶R¹Á÷‡@£ð6¬ùš¬.¯nÚ;¨;´6ËàŠÁ SË½
tþ8Io 6å
 9,²ž–TõR‰ã¦c”LH£_¹–”§c%Ìq»®Õ0‰¹‚¥
1!g³v)_lüŒæ.@WÔçŠ–‹Œýg˜­é>µæÕ*Øb4®R±¨ÚmËI´+"áZ:âã`T¸Uœj}è­£ÁlM–³4j~…¶Jªs¬,ÄHÈ$›¦¬2[žVèšÀÇjW”ùuÀÇŽ¶ƒ9ößÑJPMEÔû–uXñÂZ$€»qÉaw¡Æ+qI›�Ñæ6Zö&Yé*h¥ ÊÆÕæÜ¹–þÁªªlç«©ÚèÈ7¹-dUcì}è]Âã›ìùdáæV’MSpóÝ^ÆŒÉ„-6mfÍÂ’T6teþ‚ü»ßrƒ†=^×1ý’Ãð«ÈaÈé¦ÛÅc_ÍÝ¾dÌ™I°ï½ayf¾*îSÉ$8ñ‡hcºKvÑ‡¹‡±p¡2Ød®t‚Aîu¿ÊùÝþ¹»gKƒ fK›ßQš&”.T&;÷uV›æŠE¢¦/þ“Ùøe3yQCïIkêÒç¬iMT³ZÛ²Qþ„ú²Gl¾ù
j3‘KnÊŸì
ýÌÂŽæ
Í�&6mY#ëÝT˜­Ô"]_å(ªŠa©ICŽ’ N`¿ÈA4@
-0¬AÍU[Mbh¼TãjX…4œH­õê¹aY”Õ ÿæd>É'HUÍa4&ÕNR,Å�ÓKÛš=c9F™ú‘¤„º~‘T*Gº¼§ÓVµî°6+Óáå¥äöì<Ð?Ü~Ý¤Ï°›Ï¼AÂãÇ~4ôFoäb=Š–ÑFíb!E!YM1o¡o6‰;áàNß0ŒÒ
ëˆUœ«\ªLÏEË–Ù!ùÌ›QnÈ–£ôÒhð=0C1WÐ¸<ÂŽÕ_.SgBúû Ðœe“ÎÖ¬¬=Dƒp
¼¦ÛË7µ>tÇËçpQ,}¸tª6DðQâ¿Ý©MÆê¢Õôw:¿�ÝD6ÛÜB;(Ž'~ÛÅðI?IL!ä¬ÕåÙ5¹Šš®*¿°é'AZòä×Wõ,Œ"¶™3 Ó½é…GŽà¾¶=_Ê%Î’øÿ���ÿÿì}ýrÛ8¶çÿóhWß”ÜcÉ¶»OÜY'Nw²ùÜ8=}gS©	,Ò#‰ÔT¯«î[lÕþ³U÷
ööQîì#ì9�?�_¤äîtoX©Ø–@8�Îçï$tÌHÝs‰\v”kÿ£ùóbæN£l¢Mc%:Þr›Z-,Vg.{€!"ÅwÆ*ún.I'!Ú-b7ÄM×ZEvS¨‰«Ûª·µ7›6©¿®‚žÅTÿ�Kxœ†Yæ¦£~iûÐa„„þº›±½ÉÑWQÙF¼úPªÕ#ûNüÒ€‹'{ÆºLú­œ^zA*nùð­†j\ÏQô£eÊöS«
eig0t=D”Ë'œLÍœþ£(+Ô§¦‘TJ”ÓæÌåÚrQ9›‹âìžËûb÷»Øú×Ç&¬~·%±-sñB·û5‘ìÎ˜³j…½O<ðÈ›Èãþ¹…þv—xÏc¡—¼@ô€þ¼aF¡U‰Q_[Çª{ÜÔ¥Þ¾ÃGDG‚Â¸
fi¼t
ìïc~Ïi4_Îhd_óaTƒE“/s‡¾e:A3XFÍáûÞ;µ]x3—{ÅÀÔ‘/åÆ�ýÿÖª8V„'Ôéu…Â«©«¦B4¹±?Á*¼¯´ÎºÅêÛÜ²
gìWG©ÝQªXkW)‚ƒ}“ÉVåÍÒŠ€‘µxu¯êgTO‹àÑ¯¾T~g{_ªä(ÿêS½Ÿ*ÛZ_¾Oõ)®-ßG¨WfÐvö×õ§j@Ã˜‡­Xò(ICè÷EbJ5&€*ÉŸë¨r´˜RA[€pÜGÝ]Gï†õÔ·QÂÙ[¸=Z;Ž/s9@º8Ú9Œt
€6ëØ4›Ê³hÚÚâï_1ûV”A6PmÚ¹Á±ÂÒþÐ{Ø¶ÙÃbÁcóô¬´wª(•ƒ¶•Æð$§ŠéKƒsÅØ\çdñhìçl±:Z¸“Åô.›pïïhéâd1ÆÅþÎÇŠÕ-§÷†˜Ho5ñ="voˆ£ºA;/ˆqÍX‰Ð~¥Ù•ÈŽq´.ª
:Iùg»t%­¬¶«Èjûó-R.½à'uÆC·‡’ôªäã™ôî®–ÛÚ2Ôyæé8T•ûš V´¿#«…uû²¹ÇL¥,™vÛ&Ë¬N+Úã$ÔÕ4·’ˆ_àdQÞÛ (¾s%óÝÎ{GëI÷6ìHv;¥›Ýµ(jd"MWÎÕÅ¾eÙNÄ£dß¯·³¬>÷ÆrÌ©—ÜPøIä„šÖªPy©–|Õøå¶è·uµqnØ¼­µ+ójýkºMf‹þŒB¥Ë°2‘ï)Ýÿ¿M¯RbÒìð*F M¿4CÕE©}mÂ.;b½ÛFf¬Pe
´åŽŸÏ–ÝRÇ‹­èTèÓÒ¸³
<U?´ÕY´æ<FsÄGvy¹œNm§9ì®¼ÄÚ©¥²šÎÎ-/×Öµš–½’£Ë*„Üþ)ßýl¿…µV²´n§»§ÿ”lú} …Yz·;ä@mz·F0;lf—k?q†}]ùL~xN1Ú�,¤ËLºcç4vRGü\§9ÓÅÌí­!fÎ'^®e¬œ6NÎL%k¼œ1VÎv“D$FZ•©T¸AÞíü}çï¸gÿžŽÏioïû­{÷¶†{û[;ƒ½Í÷&AÕŽKìýE[ÉfÓŒ<@Æ_Q \|_ÙÒ‘ŒYmÚŸs:×YzM9
¿P_c!ç8Eºã
Ã»ÓvZ¿åMK¢6t‰Y'ðW¬–›°ìB|”E«Kra§ôBG‚¡…34µ»Ñ•V¢}êjö4[–{F´\öA9¬xæ¹Ô‡€Í¶Èxê¨+—KÆËHÐxïÓ¸Ò4Ýá¼¥&kVÎ›e?ªÂ(nÅZ¡'²;ÕèÑ$My³¡à
´¦QmºˆëñZ&Ä¶xŸëyb‰6÷W3œ¶1²UÚ!_ßš§I‘9	ªý|Ûp<ÙP"sÑ»ÚBqåúuÔÛ\ôi†jûçó‚Ä0”Á°æótà;+"X­ÆsLÇhÊÌo¬QÜæEdQR„!šî¶«%v| MÍæl!×jR0,!ú‚wóÞŽw‚Ï™_îy/£¦Ê·¸Ë¸Ïa³µñþXtžýcIÓÐùdy¾ŒÇQ.frš¢µ!l_ˆ‹ßy�1â‚ô§ EÒK¯jI[¿³…pl
¶D7‚¼B€•�ß½!žPÚ#Ð¾«†ÿbà–®6ÆW<¥/)ö÷ìôEUgP¯¸¡¿È?"6y¦´»…ÊÌ-ÊdÞ?i:Òì÷Wá³3X,¶2n¥Å\ÿO·¼Lµìx!|›îBÏ5e:±$ÖPw›\¼Œ¦V>£˜î’,’,Ê¢Á`Ð¼±ÑoóQ&}ÔÙ*œ/fÉU†øÓfW±ÛT˜=ž`0§X€ÈM¶àØ³ðiü×(¼ô ÿ­±)»#…GêÛvuò‚t�Îrzq¤5�3Õl<Ã–V'Wië æQ ðŽ¯®@9I‡Â;QÔX’»yº­jÑ|lð³tÄ—ý{Êé#;·‹êKÍpÁ:Kº"KqöÏN‘~!53
ìîH²1ûCHMŠåÇ‹M§od2ÀÛT]ž¹·±/FH›Jnƒ'_ç™çê#Š¾æ>@µÛ:1V
 ôCäWˆÓ*ÊB³cûÕÆÅo¼\€&9®(Ø»{XÉp ÿöN#KÍ9}¨ôÑÿÏZœtv’@ÙI¤¤€V-··É#:-q!’ŸèÇˆF7#ù$Ê{AÕz”Äˆl‡Ÿä9FðÀQKŽA¬)ÿxey’^iÊõ&xpJîMÄš,R«¢,äßþM! å¦(Ø$wîüInò]a{)D¦'­0¬ÓpGxc
ÂMs¬2çÀ£°ÖRHCÊxÑ4x¯¦3çtÑØõÂ7Høcá¡òC˜Ø+ÖóN„>¿ÚÝßKû†W°ý±�ƒãM‰Ø¬ñ2õ[ö>añ÷-ãèË=“OéU”TÖKYuN$$Ž¯Þ½ß*kóhÄ,þ’€ƒTÁKEûºÈ†-	KŠHÅ~†…
ßBqýŽFÉeý
¸Ê]¾*0¿„-�ìš«¤¼œmLáÝ›
A’w/YæoÂˆ$†ÍÕìªvƒ•_tÙfüj·ÙÊ{ê-÷êç·úVQ'­‰Ú +e2'å}’€ô
„ÛQ!õ+Ê6I/©Ä5VÝ%ôµ)©ëôvWÚúþòÎèl½Ýï·P]Â›iF9ÂÞÆ!û	Dû¡~Põ¡n´¤A±4Ÿ.fIb((§yY_û²mÒÛÕÿoSÂ§!zZªãN],³Iïš€]l}àx$Ãü8ÎSPæ*ro)C¼Q^)?¾8"áb+)ú”æ0–ø-+LzFg¡s¬c‰uÙÍå|c!¬®è|Oþ,ÆÆyDß5™|ÝùeÝ½|D³ÉIð	Ù
ÎüHøSwxóò #7#qwŒ:ÂËËóAìî„`´*Š”2²TeJ…V;®·¿½œ™Ædõõ=”¥¥Ÿ€Ñ€\ã0¨Ð¯u¯*œHÜ
$»¬H·P8uO¦eùüâOƒÜwï7ëS´·lZF^\„L~Æ 9LËg¿ØÅáü²#í‡J3ŽñÍæ€ë‹›E&Ð–š_t¤¬Ž‚<÷³ÁÊOÌÛ,{¸!ú+8ÉïœDö-}õPÜ†‡âZÞ`&ëÍ—â©�ÌÜAqˆ’g .¤õ!‘_N	ô6$OøÞ}È‚…n¥D¬Ñ±Dë_‘áI.‘iM
ÎUÚˆöåâþ<Å»}DÉ5[¦h#ÕB0L³Ì,«fF­d#Þ…ÞÁ
éÊ’½XY³$Yõ'vÙœ3L¬MgfevXÖ+ÏÑBt¬ZÞkÛêÑ8ôBson‰RêCŸ•¾é­Ú
z­³|0ŽV¬§æ°­äêCÖ#}ïôÌR368¾šãÕ‰Wß ¾«kŒ”P¶.[äQÌBïL8+"ÌXPÚÈ2‹ám, 6d{%ÑÕhôm²^Õ/ìà	Ð‘Þ¦`
3¢µ3
§ÁÓSò¬fH
¢-?Ò˜NDßåŒKltì¸#ƒX`!˜_˜ëi=”‰ÒÂÐ\éçãðaÈ€J'oþvòËÉK-É“Ñ.©ñ{‘Ïbï
(Ž$NXu?q©ô€ƒ*+àù”v­A¶<Ï¸	
ôˆC­�ëHƒh.¤žTs™+·Ñ�´‹M_!¯qÇ×ÉÂÌÕEüôˆdNòDc%£àW%üÓì*{¡£R+aÑz€ñ|‘Ûbª7~^0Co³ßGÖôRÛ<oXî4V\âV¶¢çÈãÑƒ¢7§Éƒ…4Ÿ‡/¿}€©öhù‚qF9	ÎÏÂôS4
KF…Ód´DO„#ùm0™#ùV]ë®TÝš‚GÂˆì¹¶fa^zÂ3,~2X­ë‘*Î¶„„zoL8îCs3*†[¦A;ŸpD–jùÒšA«/t“CKì9/0iüöniÇk»Eµ£Ê(æiÞÛ·.øšDpÆœÓt}cªYÆ^`øÆ'!ªŒÍ’â¨÷ÍqÔmƒf
Qßh“à2æ:g«fZ™ÐÎ§!ôfh[JÆ°9-9%½¢RÀé)Ž¥$µäØ*èrë1LÐW®Ñ'üÓ:aH?¾íW…gÍñÚ+?Ø>Òpš/S£&¼Kù«„ ¹õ|äÚË)Œ8Î—SÐ\ìâ–wÅ×Yk†•µTDÝšÕÈÞÄˆ	ÿ1š…8bke§ðHm	4
\…üò_é9Ó·1Dkžþ&B×&n¶»ÔnW‹»‡&™q×ÀaâëI.ã0ÝîÎWú9N˜‘Çñ”üæI8[°Ùù`³Ç$åÕ…7Fâ[A¹ò"\
ÁèüˆÑÂ‹m€§\³èŸ#éÙ7¶gY¾Â	ÏaP-—aú˜\á8¯T»¨ õte'xthm}»!áªG?ØRÙÀIt4¬}û|A¡KÖN›Jçàõ…	ßÒ ÿØ7ü/ö,k«C]UÌþP²jˆM`Ý~¤A„‰¿õÎ»ùæÃ¯(y£kC ‡;;JprKÜWú6Û¶÷
I©·(˜£Ý‡%»¯Y2·È®5<ÓW>¯ z‚¯*Ðôp'Ü¢@>¢V¡ýŸ6D,¼¼¼.žÝZ»Ô-î‹ä]5û¢Doîÿ?e¡¼,Oî·¿‹ž´Àuo
áeŽâ|Ÿ”r÷y½LGxÄã­Jg´–¿gÞêx1¢2xE¾ú1¿GSêyá”Gõ7¥ý‡ï´ã]YÆÓq/yßøUâû-$¾·Ô”½ˆ×WYïÖd=ÝnéFŸ¢,º=‰¯˜'œª_°Ñõw-þ¡Ä4ËjÛ†Oé¤– ~mû+ÏYòÿÊÎ³^?¡iÄT–Å6þêßŠäKO³ >öT|VYvb%!ðg	Í«‡mêÒØš—ó=ø¼2Â‹ä¢?ççË”�¯ÝqÎˆ?´7P_›=×]€ñ¤µ@‰(å¬!Jž2e›z2öÏh4éIõõÅÉâù³Ú.GÂºuìér¤ÌýÞ?¬àl„W¼švš~uŸ~ýqU–DíJL/eG<óî|X¶ogÑ|Aã¯JÍo Ôœ&³MÏ¢±
…ô«nskºÍ³$¾ˆÆ°!²ˆK¶ÅFÙfR
ß,·gÕnQ”‹7ÐzÊäÕª”H! •B6A`C ÿùïÿQß!¦³Úî\}Ì_u&‚'3ðøSd2{²U]òDÍâq¯4
Â§ˆ´öW:[†ŠèÙÌ#µ²‡>ÍªÇ¾H:{µãÆ6Ø¯‚¿ûcÂ³»úQQ%–Øw£âöëqÑõÀøRŽŒ²æŸ’Ä¡um®hçQ±ªA¬M*g—\ØéŽ¯oŸ·äèÎÃÉ”Œ—!iÅ;ñÉZRÅ‰Ýg(lÍKZÈÃÙÑ·Ê©³˜$qhÂ÷¨?^æÅ
µ•1‹\ŸæµýD®.�¬9‹Xë8ŽáŒ~(—Ë?'oBíéj¨3m';V;ÏŽ¶·/é`n«p9¡yF‹ßÅùÂÕ9ºÏƒ©œÏÇ/H¢“ÅÂ4!šÏ¯­Y_fÑÊÓí«@þAU hi%zM¯ 3Y®²ˆBNé,ZôÇ r˜E.åÚkñHu’å”.ËHït�ÝåÀä‹ßÊ-?l«o×Ú²´’ÍÏ€ÂL©sHñÍïV«YÀ Â!L$Š>5Z•jã{F‘ðúnkhG9£çp:'4ˆRƒÑ÷jGZh%Žd£¿-a¹µ²ô(‹ÅÓ7dÒbYò$Šƒhœ°"úÖçc^ý¢h¸¯o§5ñÚIÀe4;
t8>¶Ñ?L£ð÷ˆÇÈ«âöqCÖ5ê'KÇ£–£Ü#ŽÂh‘{Œ;M2Ÿq³fþã~ÏmîX¸d‹DÆfÆRYh;ržÍ	ª¥%ÏÜû¬b¨8Ç˜omÌ0gûz·ÅŠƒ Ù…ú¾Bíö5#¹DÖ^ ¾M©[þ:¶rÚØóè;ÀU8:ÉöÀºÐg‚™ù�hwÈQÌO�ÔË´q’¿ß²Œo`¦4ƒédvÓ;äÍÎ
Òµ¶ê·_CåPÚ´$}qì1Ná�¢ôó¤ž’‹4™ËòmÒÏC:ã†ŽZJªE—b£A?V7M”ÝA›—T/Fï‡ašEºÚµ^™õ/KÜx>XY‚)º�4Z•
=ÔWêôa¸@yÍdœ”ÉŠ%ö¨ |mxn¸
ý™U«ûh¿:‹ó-ÍEOË¥Éúâ\—éÑÌ~Õ…©¢Nþ×§I,ãµdÑüêãÒPŸ¯õ
m«à”xœÄ³«
äo 9c$árL³©©r‘ÿÑv­E	EûÅŽ¡Â¦gHàvM4¤~�‹ÖXYÃŸ1€D¨È^,ëfd\¤<Ú’”£²NÉÒ,¨hrö¾½Þ Æ8L
†Û [Ì¢¼7m¾Ûy3hÃMLò›¡èhÛºöÊ$rWþ—¥²EÁ‹)#ÅS,…”W­S\øµ
³_¥-fÏÇÆ‡×-û¸lÕ>š8‹^õ=L€‚aÌÃqøožÓ«d™»+zÍíîb-VS´X[É~UKÐ^O–÷Þ\Â¦hq[¨6\2ÍXà(¦8ƒ_+¬]œâŽJÅíªñ¶¯¾‹W”|ï„|+¾ç¸må:¼xq#Q…Ï(Úo·ÕV¶WW–‘½B.^ö2ËìavÐ:SÑˆò2ÜÌ°BºÞ\"Œ˜ó„:¢SøÕ2¨¿ê‹´a8V:Î“crÅ äŠíÝã×‡“Ò	9‰A&¹¢ÀDH„	›˜Ë5žÐÅ2#‹0Fé„ÕiÇø	P÷+Ä™oežøàƒ;¶ÕAÃ/Œú—†êèàW'•O»’šàûcpüfÙÛÕ‹4$£rÅf<âè~µPãVìA<¼ðeŒ{3ŽÝ“~DC;¿ØCrëk{»L¬Áj†6ø<d…¢X¢a„¥a¶€‰V‡YæõØfds3zY·.|»]`Ñ½®¶P±O„hâ	Ì@¢¿®¾nœÏ£	é…iê·
øòFÌ¸%I{ñPv,¿rÍÃÄqKßjŒ?Ñ1Ì‹Žmð1<Ççlãja	Ÿã—eS æ#"¹`jeÑBp¬…ö•"–®;òôç	#]µ\ìw¹dºûÿêãö-ÚZÃyøe°þðÛ»Å±êÊÝ·
BÛÊiš,àØ‹Iž¶ˆÉ›eãÚ®Ì.ºŒ»NòE©¢³,¡+àæ¼}°#ùÞ@0Ö8]7úßk73>KcGa7zˆvã™Ñ0g2‚ê´»bpŸ3vã*Ž‚ã
ÎûSìó;ÌûPé€`½tBm#ÒögÄOæpÛ®pwøb´ÌŽ@efˆÜLµã¡Á_ýQGŒx³¡ ¼ Ë{>Þè`ÍHÌ®ù©x�æÉÐóYüÐï“×Ñ,š¨ÓMúýûÛü.óc¯Ça¡>•[¹gÓŸäGä›Ž¥¬¯ê9€‚$Ü\…†ª‚:ü·J^Ø=ø­RËíÚ£› &žËïæä2îßx{_]¦(XÅ^úx†e/‘«¹=ž±°ù‡WOƒža[n‚ÐBž¼}ñü¬x»Ã
¸(çŸWoÀô¶›YýÄê^—ôUÈEgÑŒ"³[°=PË|Àb…çðE@'ËÙÒ)òÂTvŒAÏÑ¿:ÿ(W‹ƒº¾V‘vYÖ—.ðÔÍª—–{@ žŒ£'>¢Dƒ%Q¦!
®êZgp´gÉ<$I>Ag†ZùÌ4Ô(;áO:)ÔB£«ë’¹ßxkmHêûË0XÏÚ©ïôêx¶„¥„ë* 9M—‹nF£x@,
?ŸÓÉ´ÖR¢8"á°v©ñŽ5Ë–‡4ÖM¯ulùÒ­Ú[Túw âù.‚÷CkÞ,'Õr+kšç°b“~›ÐA±Û4´Uþ]Ú³õËÛRÙËs€°L66þ‚\êMoô`ôthó‚_¯a"NÉ·¬5“¸Æ¯hú…6TjøìS?å^Uê«q”ƒ¬äÐëÍÇ‘_š›&ªÿ^3ËípG°ß)èj½YþzûóO'gÏ´Ujð²ëáMZ'(¯K–}ï¶„L_'‹õà¨ña-ç.¿9!ß‘·Q@§¢ï¼¢ð`ãžtm†Ö@’Qšãù¥÷…[ÔÊ–	m;åS´Që‹:Ú<úò&º¤W@÷“ó,„=DÞr`8-AõC­
yñîìuˆxÝÃ®Ñé$Ò%n;j+¹¦Àa‰¢³†¶x†Ÿˆ.|K!ï4Yˆ°§°j*¡|âZ˜"Eˆ.CÂÐA=
{ý=“v;HÃO¸µÊ?×ÊzµE¢à³2V”ý‡Dú#äPõ¤W©7ctOëêX|œ
o’ûä°®9ÿíZÑ¤45†ÕËƒ3-`/lQ0lÈ‚·»E(Œrz¸¼kš:
ùÄD†í:‹}2l˜ß%ëü=sVy}q'8	nÏå½Ž0Ís®?Ô±<mÂw¾½–Öµ@ãªÊk•aR¨²'+åˆ*®NC·ËŒ&ß@v“+˜§$ˆÇû¥ ž"”C2£6)"/#RfÞÔÇ›×È™Çá%–{2#¨¢gñ»"‚ÖË•V„Ùú¹N}]³°‘§Ð?å,1¦65/~KÊa
‚™ï]s ûîË&Iš{ÞeÅ+/‹ó©¼ÜAV¬•)¾ûW‰³ÂË¹lÞÂG··l€­.1ÛlØ¢q“DæQ¼D$­ê#ß)±Å©Š×/OúÐE{€sö[™d†YKÀ’6žãÞ´ürbSxq8Ÿ&:äVS[›/|¸H–svÏ‡—&Dn°ï’Ûì·
“ÃË´#@©}³º,ùÜóZßÆï{Ÿ¸9¼ŽV¿s¯"7£0²‰ÖD’€¾3Có®Å•Y_GØ~ŠÜ/tš/;ÜÉÇ†#ÂÎè9ö`¿ôÇrº×·4ãLßÅbÆÒºÔ±t–)c¨g¬^wfù_@ÖGü/sÒS{9Î8w´½8A§U­žÔ2¹srÎBæõÏ}Yä,†ë¹ìC×—WŸ h
‹þaÅÞÝe¦Ù7_2¯4I½|×V
^¥?DÉ¾.-è‰É%†èWAJuu‹Q±nM°Ô	sÀ©ÒféÝ†ðfþÑ˜•ÆQÕÒ8Œ¦©ì‰k„¼ 1ýÈ°ÕO¦Ëº8‰ÑÜgÊPs-YÏ<BKOi<†¹ùï )¶5Išs$_˜mEå²Ùþž¥'HVØ’øi8£ŸC†Ö‹ä]8¢É#À¼Üóp¾D°/:ÍÂŒÌîYLÃ)àY¦ç”ia7ÐõX ðÇåaNÌªË0WÉAê1I
Ž3S*]Q¾ÅFqi² ª{ÂA8‹ÈÇhJyùŠ"ßë¬^lNtf¼o¢Œ³µxl¶ØµAÑaXå#9B ?Vì<8ºìÓež¸yGU³ýYI•%p w¡0†¤lZXKf¨_Ã_Ûs|pZ‚Ý`xÝè3õÁhˆx),`+ë°ÂÞ-ŸÚ3£Öa¶Øïiré°
­=àÆí7_+Ý-½-^º©ƒç›€àÅ|UyhÃÅYÙñ¥w²gcõÄ“üˆÉæƒ8¹ìY‘µñr¨Ó_,•©ƒÞùŒXïè€Ë^ ³—CÎÎá×¿ÑÀ¯;FìPê…^‡~]wÕå¡Y$+¶ê¾ãmB³¼@UsFÔT.|}hMÇâNáø[-2c&É%ë£v¥@€Ójå’Í`É{E´¥øªÎþ"„V>˜¾÷?˜
¹ÍÅV=ú°ÕW%—¿T
Û»úÿF·ÄƒÆ(öÙ#ï[‚ë¦¬í‹Œ^ÑÒ¼ÚœÔ~ˆ3«W™u¥¸Q¨n©k>’?{I?SÕÍ¯³Q†ññuÆ~ªï²Gh�
ƒ§ÐDøÃØîÕ2Â_jË$~Y°äãë’9«m0q!;¾f?äï$)ëþö<Á™HD¨ë³°%°±H8iÂ£ª¬3%ÊAV+¦æ9EyshP¥vH1¬B¼‹Ð)1ÑÃ;ìeKì½üþ:˜C€6>^+vSˆ&•ˆ÷@n%—óðïÍÁÇ$Š{À®7d+Í‘˜W¢&gå„Î¯È«‹ã6„`\ãù~=iÒK¢¶!__“dAGQ~uDvTfNãhÎ–ŽÐhWm$pšy÷'}¾¶Éâ¼¿'!¶nïI¬VÙHÐPII1jÎEÿ¼a1òðuÃ_£éÉ“E‡üT~’Ñ‹°7äsO›ÎLeäæ
¯e¤I2õÈ;
\t“‘Šqp¶°6Íá¦5+<š„ŸÒ$~^äfPôRÓg™¹¯ÉŒt2tE&•f¤:@Ð‰o_rF¯t†‰ûÛ“¡§ue=P
¦^"rQÎªÐ<
0[4§–¦I¦4Óµj
IþGßbêiÕHE; e¤Ós4Ìœ…-³&óe½uÑ…«•Õý¹˜AãIRG;é`_·¿I`4³—’Óp”¤ü9ºd@µËôäç%Š@Œ Ü>ü(ì-“þðnˆŒãÕBLÒg{nA‘I—œ!;qW8ß_
1Äv€³¬/Ž”ÅàW¼ŒÕ—È\'ø_Myæ>‘JF¿[þ"!¦¡L§~þ™[›ÊNšìÞÑÜTƒ4KGÇ–�-ñ¸­…¦ìH+!Ä#8îøÇƒÑhFð�^t¼«ÅÅËß6á?’s–e4Âq›JgùñFqþëÛh­Ozw	^
³Q*¡Ož�#²è<šÁ
‚…Ì‚ºã¨òz’À4èËIjÀ¿½êªw°2`Üóþ>ß
»ÛCÂ—8[HŸÙR¶ µ->÷÷ËLGQ[°.=­/„ãu£q	l—óÙÆi6§5vnŽzo°¹\¿ÈÃá¦¿X‚&µa)€Ó¡H‡î ù^éÊáðîÚroåP”sôvZ]™õ3wÏZ¹È'sØäf%l@üüˆ“Ë”.|ÎA~]›…o[~ºq(ÖÊEfUÐ°Y1Kt
œpWçC&ë0 
¾WGt¶ì}Á«ß|xÁ†cÑð‹éËd&i`_åíæt(Ò¢*Lþ»¡$F(úˆâÞrÇ
Þ°“aÊò«ÊFÆ+qv~d¹øh.€‘ýÆáöw¦f œ³y«,í¡Wˆ1vôÓp�GÕ8ÌQ?
³ƒw;–´2T„±OUÛ”kCÇ,~‹»¼aô¬F:~Ó ‰a©2tLü±‡faNÎaCÜåñUpsñ¼4Ì–3Ì¸+`mì–Elå=Ü31JæxUötîaÐ•Ÿá6ðÃ_S£Á÷®F®l¾V@/Š½—Q§¢2"nöõ²ú:"ÉyÎö6N–UÓ»#˜…¢§àËŽ*¡°÷˜wÔbŽ\9|¸wŠž¹IÖÎø^Ü‘…É2ïUÆÖúÜÖºE†¼±u6ºÇÞÅ'úÓ~óœs‹µÕ"5H­ìd2ª•Nu¦Ôw1L¶©0âueX›
Þböª[}«-ï­G†äÉ©alÁ!<sÍAuàôjÁGõ€lXêês¦8apÉ÷öªc„=ÔÏªÏýõM«¼·’
J¡B”$êlÌ2ò€~F9|xXˆ~
ˆ’BöˆâØ†>²À"‰“dï=ÞxA³å=ó0Jž‡œ¿0ß›ÄgËÔßŽL¢šÐ‚ªßQ;5Of~õJ3_7Ä·UùÊmß1'—À,œ®I‹û1‰Ÿ…W§Éeì-Ûqú†ƒixÅ‘œ3‰×Eéµ®»u®¼vkÏ³¯Õúë²×¸]òŽýÛÖ+»š4Ö(W‹Ð¹ˆº¼¯ý®ð¶rx€nù�¡ê|ØÍA¶©çmµEÈVú„kw°o>dl	æn¶˜\ÈzmM)"@·lž²õò,0Cþ§Ës:L©ñë·–XãäÌ·w‘ÁJBR¹¨³Fsc¥Y¹O·ƒš�Ì¡b-)æ×9Ùk¬*]x†ÉcÖÄx/–œe‘]kéÏ"¨~f|ïoOö|YÎBªÑˆuP¥
avyÊî%"¯ò@µ)†nƒÔìhRÔ´^<ã»Á0œ¿7•hgME´4Œ´˜Wø=Ù&Ï’y”Ñ42Ö·–T”M#ÅágK
9ÁvQ£É‹
%CØTq8#ÏéxµÎÀÝ$2œÓq
ˆ·„á™H>ºêT‘+1HkU¿"we”Yš¾[ÂÃ“Ÿžž¼<ÒÒTÓg=aPê§_>¸Iñ§‰<Y~B¾Ü´G¿µÐ·±Ä�!RÙI~¡ÞV±|–*ÓP÷kgAå2Þâò+E(&ÿL’9üÄ3*X¦˜ÒZ|Ün³1—¨³Üímc~†”‚¥ÙyþyXîc‘½ÿå¡ÊöÐ^|Ý'ÝOCgî¯ÿ‘R.+Þ¯;Õ¸€m™Ì“ÔVÃZ¸#½Úa¹ã—Û~Ç¯ÒŠgŒ3-/Á”‡ÏnÈã—Éœ÷õ7æñ«ªà­….Ù›±îM7 aõ$ß#xu29";‡»Ã½»ûßÞsÝßÅLÃ¯NÆšúÖb¾ƒ
ü¦škØ¦nÅ¿.«
¿ØëŠÎùÂt\â>¤‹E»û|«´4ÿð«‹¨º³4yÞAˆÙfäý´-ù¶ö‹–†OQ­^ã“*Ã½Šejµ7»Ltö«œ£]ŠQ•r@	¸14¤ªcòyî*áæQ&Èb«ˆì‹ÿ% j¶µ”	Æ€:'DÐ²YQm£ˆ—ý\·Ò|Li-ÉÙ¦æÒzÏ‚õž­Ï€öüß‡÷·æûÝxþMÿœÇñ}†ç`fòV=¨Ào5A^Î
,€…^7ÊßXÃ#¿ìúŒgí3Ù¥}Ýµ¾Ìok“†õÐ`­LÒð€•
Ò&Í¿g_Gâ+š¿b¬–VË»Á½Ã÷ª­ÕR9Õ¤*´²´Òþ­º#WÆ_ó¯F“­ÜP?u»±Ã¬'Z[ÓA‰Æ¡Ç¯½L+:™gð`:õ1¸j‘6ûÞ½èëµ~?÷­–€öÔ"`K1Ã©ÜÄäÆ–ˆ\B¨$°+£Í˜Ë8²ÙRìQàí–šZÀJY2â\¥ò°GN‘ôx‰AÙ7‚ê²£®ÿØÒžû{ýY¾'U[^|ëœØv
p´«G“x•µÏ–‡’®I·ÊKŸžV7d›”>2Ëšm—õQ1Sµã.n*ñÒ²øÏÓ�ªøM²å9)ïíl‘CkÂ–+:>{¨OÜtÂ»žE¬Sò<Š§ŠŸ
3¼Kw¸<hÍ²Å,Ê{ÿecóÝÎ{çy²æàª}w—ž”¦Iø“TL™\~¬ÒÀ<œƒJ¾&O“Á„Í2ò\´V+)_³eÊ*%öçi÷�~äøC<#
Ðª¡*¹Õþ/„Õæ;›;1kFï¬l.Ô*Ì?ÑªpúÛp	1Ûm4E®À¼šÚ¢]oê°Æiü­@h¬xè½Í™Þ†ÑKã­d6MRœÃ!õýÙ*?X†kè™Pcyó›…*ùÚf¹–ò8`WoÐ£f­`„P²ë,ÌQ•,
¼YÅÄ^ÆÍ)eõ7éÅ<XÀf(ÚôîÝîþ\Æ5³âl)\Ø:Ñ°™ZQ'oqi‰¿ˆeÙaa:Å2Õ`½[R]ÛÉNŽšÂ¾…\º@i ŒÆrBÚÀv¿˜C’#KíËµzš‰$¬óf ¬oïûàÞV¹z¦¯‘Àë4ÒêU­*N°™­1$³	lÙiß´œîcüŒK{jlúnw·â*À°JˆklŠ	U„CñúˆA4^ÆˆT…ÄÓ4‰£LÁA„òç³"m@^ÓŒ•z'±Q(ætLS2ÇêÚÑdy¾ŒÇ¯mÐ%#h©IÍØÍÏ“q²ÌËôå(&<Š³pJèœ
~ëŠ?üEÐÙ+ “	í´ó°¸êKÕÚ›õÙehäJúª˜áSœöPpÒ£)›M
žÐ«í
Êi&¨÷jé0@<a•btf1šsEotÿŠTVe±kˆ2n–2¢²J�,…éìÚ¸ñ„Îè¹å"eŒùqqcÓë7dµKâ!BŽJ@9°õ®V‰:òRU×à³dy’'É<TYsé)ü©py`ÏnØŒ”	ïXBàÈ^†9H›Œ‹`U_Á%Ã°ä*�OÞ˜^)ˆr¬%j@¯ˆ€qZÞð¡IYBÓU0K5¨õZùx¸ÊÒoÂxÎ§(¼vSâ´¾¦W°`gŠ‰@|�ˆô¥0åÊì¾*ÊKo—…y©—Ð&¾—0v=¹Û4#4¾A¿#¶E@iØïká_y­F=F¥ýž«
b‘çc5¯~Jõ/Õ7aïU(ó6ÉÙZ+‰ôg6Ýåý¬&ùNê_±ÌÎÑàÈ$pÈÂáÈ çÞÁËß»Ï“ù®2¶`ñ‹sØÎAš,úÌ¦!1ë1þ´[þ*@Z˜?ÖRièüµ#g×pá¼©šÓH£á\84Â€ª<H:C†¿¼s¦ò•2 »¼#k‘6w¹i/Eü«
¥Ï*HuD*e,v,Õ¢*ì¹&ðl-¸åæ	M#®¨yêiÒžöä´'ÔÄe&Úv«L5ˆì¬¼æª±VVSÓÞ~£,¡f•·½ÂÃÓÐ ÑÓÓ#òúäoýk‰D@¡‚.›eQÏƒF?šƒß±±Ë”ˆCÇÖš!eôÐêÄ/te©øªª÷Vpó˜¬GÒX‡Èd¾5;r´y1÷Œö¡kéìç!£10&øè*œn`×ÿý_ÿógËøãõà*;Ôà‰a†ÚJ4ƒÑb)Æ²Úýƒ:ðç9hðÐËxÊ3û*¼¿ýt•†>¬´Ûbº¼¯»FO`ÃwÉL€ö¿TìLqøÁß™¬}»fJ,‚¼‹q>›Âª?"ÿç_¿ ùdÀ:Í¸5ÁYHGW¸tv6oæKŸÉDØÁÔgŸªŠw«…ùW[—…],‰c‚l¶WÚüšöÌ¤…W¸MYLË¡Ë/µÖ£¡Y£¤¾á­Ôåþû˜¿lÖ´4ôäA]ÑÐ/KõK³g¦ñò¤"^ž”ÄK[n/¸»ß?êë½ß+¢7ÍZx9ÍñìÕ#B|åëjv/(höª™ÓKÚ¸l„vÕ¥­ÄT"rœ¢Hå>6�@wà..ŸŒðçtæ@7#âŠêû]Ç:où®6Ô“çr:7¿öp KJÚcÑ2÷>ã5¨/ÉJð<¨J“î63«µ†a®e™ù¨<y\OêùZ± ž¾\ã‘â±.R:×Õ‚ä“ã
Xiÿ¢››IˆÇ“ù{öØ‡lØÇÚÙÍò«³pâhÊíp=~(çt‘
ÆI2ž…ƒQ2g?øÇñ·lÅÂ`o¶Š_ãñÍïÞI–ùb™‡óó0Ð[¥3Ø|?ÂÚå&êF‹îos*­°âøÌß[ÃŠs'Ûr<µ‹˜–Œš®•_ú+EkKÜ××1Ô*¯ûfÁG/F>Kæ‹$†Ž mAC¨Æiãµ5=†z¥ªV„.Å¨Â)§^i‡Å,%¯“i2ÕÙKø8ô²¯½ZÈ.¶kûñfÁd4‚úGsè»vË„÷R­ôøVëš4Ðâ‘-SÒ»nX”o>êÄ%‹#:Ø‡7wÒž)ZÍ þø®
±J¶®w¶„B]÷\æôA·»”ò±Þ¯:±–~|kÞ]ZúqÄ)ôŒ÷¶Ê_liÖ…[˜í™cwb¶µ±k#
îš½]k *•x4eæj”•6ñ�*ß.óå‚¼‰âQÓ0ît±êüßBælú^…Ø
×5Rƒ;t^×¶î0`V^î0y&1aFu‡‰ 64`?
6­Üelöà·L Ó¬h¯TÉ
?G¹÷“­^6®c¢ƒ»×`äÅ‚¼l¦¤ ¸òöý|p—7=Áÿ„(:&G4/¢W¦¬#ãœ[	EXaR<L£€yƒÑ4
m:ŸQ¤¼¯|–Ä‡ˆâq8ÊÎôpÓ”ÕºkÙV”(0<}°ïj;YÐ)ðH¶+
†Õ‹õ¸§<8(�ñ¨†Ix£	M—¬˜Œ…ºñø
ø6ÇT¬¤7–Ô(ÒùsÌkDk4ÙÃ3U²|¹3¢L‰ ú”®ú{Üô]¯{…kwvÙ­ãªÌ–ßÄH08kí´³#XhÚLE¡ø=Íú
€v**!Çõ­¥2yÚ,L^¾n»™Õ¡ÎP'TOûD*q|7¼–{¬ñ\—Îá¤¡X¥Ñ´y¯dLPÎ:<# }PSA/Žä¼›ús­¸y]x±·öêlG´Õ²•ˆ…ï^Áâ˜Ñ«L0Ï÷=‡N½	i–Ä¬qoSó=ªGúoOò~Òx
¡eVÒ£s ATßäéØÞä$(ëÖo5¶„ç-éì—$Â³µžÆŸ`&é•þë·4›ê¿)»¿NCHÓ7úoË$g"’þë7!¬•ÀÔµF°^sVjF£LùKXÈÑˆ½›<â;­žôûâ×üÛjDò¬ãël’\ŠÍ„€ÐXüøø:Ö·BŽ	|BÔ5ÔG6N M§'Vã©Xm•qL·Y‡óÔàü,L?E£pÀk¾—“ÕÛ:»±E¢ éÈ‰Øûuµíe,[¡¥¬Ì¬ˆ‰
víT¢ †ÜaY]añš272aCšžÌfæÓ¨I,¤Õãú{;I.ä‰lÏ ^Âš`Q_Ía§Ò:ÀâÙZWÏjr2ýÕ‰Ä#$<8OâÖõ%q1Xy+	Œ3+sd°[½N†öïƒ",î ÒÌ\5ÿötÅÈôÉÝ\Ô)&‡B->AyËfû¥ÏŠobÿîÖ
ÝžbDYwý?‡yzã‡ë)û"Ì28n$AY:´ÞQ}|ó§ÿ��ÿÿ�-°ÊÄ