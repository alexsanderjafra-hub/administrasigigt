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
  ClipboardCheck,
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
        <button
          onClick={() => onNavigate("admin-dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Kembali ke Menu Utama</span>
        </button>

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
                      <span>‚Ä¢</span>
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
              { id: "SEMUA", label: "Semua Info ‚ú®", count: announcements.length },
              { id: "URGENT", label: "Penting üö®", count: announcements.filter(a => a.category === "URGENT").length },
              { id: "PROYEK", label: "Proyek üèóÔ∏è", count: announcements.filter(a => a.category === "PROYEK").length },
              { id: "MEETING", label: "Meeting üë•", count: announcements.filter(a => a.category === "MEETING").length },
              { id: "LIBUR", label: "Libur üèùÔ∏è", count: announcements.filter(a => a.category === "LIBUR").length },
              { id: "UMUM", label: "Umum ‚ÑπÔ∏è", count: announcements.filter(a => a.category === "UMUM").length },
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
                icon: "üö®",
              },
              UMUM: {
                badge: "bg-slate-100 text-slate-700 border-slate-200",
                border: "border-slate-100 hover:border-slate-300",
                bg: "bg-white",
                icon: "üì¢",
              },
              PROYEK: {
                badge: "bg-blue-100 text-blue-700 border-blue-200",
                border: "border-blue-200 hover:border-blue-400",
                bg: "bg-blue-50/10",
                icon: "üèóÔ∏è",
              },
              MEETING: {
                badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
                border: "border-indigo-200 hover:border-indigo-400",
                bg: "bg-indigo-50/10",
                icon: "üë•",
              },
              LIBUR: {
                badge: "bg-amber-100 text-amber-700 border-amber-200",
                border: "border-amber-200 hover:border-amber-400",
                bg: "bg-amber-50/10",
                icon: "üèùÔ∏è",
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
              <option value="PROJECT">üè¢ Laporan Projek</option>
              <option value="EXPENSE">üí≥ Laporan Belanja</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none cursor-pointer w-full lg:w-44"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">‚è≥ Menunggu Verifikasi</option>
              <option value="PROSES">üîÑ Sedang Diproses</option>
              <option value="APPROVED">‚úÖ Terverifikasi</option>
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
                      ? "üè¢ Projek Progres"
                      : "üí≥ Belanja Material"}
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
                        ? "‚úÖ Terverifikasi"
                        : report.status === "PROSES"
                          ? "üîÑ Diproses"
                          : "‚è≥ Menunggu"}
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
                ‚úï
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
        if (dr.obstacles)
          obstaclesList.push(`‚Ä¢ ${dr.projectName}: ${dr.obstacles}`);
        if (dr.nextPlan)
          nextPlansList.push(`‚Ä¢ ${dr.projectName}: ${dr.nextPlan}`);
        if (dr.notes) notesList.push(`‚Ä¢ ${dr.projectName}: ${dr.notes}`);

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
          `‚Ä¢ ${dr.projectName}: Keseluruhan (${startH} s/d ${endH})`,
        );

        // Weather
        const pag = dr.weather?.find((w) => w.hour === 8)?.type || "Cerah";
        const sia = dr.weather?.find((w) => w.hour === 12)?.type || "Cerah";
        const sor = dr.weather?.find((w) => w.hour === 16)?.type || "Cerah";
        weatherList.push(
          `‚Ä¢ ${dr.projectName}: Pagi (${pag}), Siang (${sia}), Sore (${sor})`,
        );

        // Overtime
        if (dr.overtime)
          overtimeList.push(`‚Ä¢ ${dr.projectName}: ${dr.overtime} Jam`);
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
              <span>‚öôÔ∏è</span> Kustomisasi Identitas PT
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
                <option value="ALL">üë§ Semua Karyawan / Personil</option>
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
                <option value="ALL">üè¢ Semua Proyek / Site</option>
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
                        {new Date(dr.timestamp).toLocaleDateString("id-ID")} ‚Ä¢
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
                        {fr.time || "Baru saja"} ‚Ä¢ oleh {fr.userName}
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
                  üí° <b>Otomatis Pemecahan ID:</b> Pembayaran akan memotong catatan hutang dengan <b>nominal sisa terkecil dahulu</b> hingga total pembayaran terpenuhi.
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
                                          <option value="LUNAS">üü¢ Lunas</option>
                                          <option value="DICICIL">üü° Dicicil / Angsuran</option>
                                          <option value="BELUM LUNAS">üî¥ Belum Lunas</option>
                                          <option value="BELUM BAYAR">‚ö™ Belum Bayar</option>
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
                                    <option value="LUNAS">üü¢ LUNAS</option>
                                    <option value="BELUM LUNAS">üü° BELUM LUNAS</option>
                                    <option value="DICICIL">üîµ DICICIL</option>
                                    <option value="BELUM BAYAR">‚ö™ BELUM BAYAR</option>
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
        const weekRecords = financialRecords.filter((r) => {
          const date = new Date(r.date);
          const day = date.getDate();
          return (
            date.getMonth() === selectedMonth &&
            date.getFullYear() === selectedYear &&
            day > i * 7 &&
            day <= (i + 1) * 7 &&
            (filterProject === "ALL" || r.referenceId === filterProject)
          );
        });
        returnxúÏΩÎr€H≤0¯û¢ö„È%èEä§$[ñ-;®ãm∂Æ+RgNá>m$!-ê‡†eç>FÏ+Ïlƒ∆>Ÿ>¡>¬f÷®*T†.vüÈÊLÀ$P˜  {fë˚øë‰3u&ÓäÙ€õnë[◊Ω9sáA8ä§7Ñ4Æ<?v√j5¨ëÌ˜$lƒw3ólooìJ˜∏RSÀÜÓh>t´UgÖhqáº$ÉÜ3	Ê”xÖ4krØ¡<~P∑'Á˝R˝VE«¸˚h‚M?∫.˘üˇRSG≥xÀø.jÏ€Ç∏~‰±j´´‰W◊	˝ª-rÛ‹ëI0ç«¸}Ë∆ÛpJéNé˚ü{øu˜gV≠“u&Q∫˛√`≈¨6ü9Ÿ&Wﬁ‘ô=«Áè¥˘Àª«Íèú÷ÉL›[≤_´aü‘ﬁJ˘†™ Za©∆µaˇ’]Rè¸¸≥±–«πÔ„ºyπ»ı›aÏéë^• |øC∂Sù√√
.wtÂÜÓtËvGÙïRXﬁLi∏…ﬂç…¿â‹Ó&›|õy~2è’ﬁ©z¥Ø™:t|⁄n∂_·À∞k‰7˝ó˘‘eE£ÿ	cozMÇ´´»çehM∆µ”ÈÌˇ÷=ﬁ=9⁄´Ωg„£ˆ∫g˚ª˝ﬂˆˇÎtˇ∏∑¿Iüvˆé∫«ø}‹OÙ‡uˇ∑ù_;›?Îùw•ïI◊ÖÔ±~∫∑ËﬂF4Dq£Æ6W»ZM?Û|‡/`¸ûß_¨Ã√F}¸]¨ê˝ÄÆêÿõ∏W!=‚∫Ë°ZQÄmEÖ∞K‘ÏèùÈ»w;£Q?t¶ë3åΩ ¡»âÓ¶CRÖM<s·a„cNˆø∫”XBnc∫¯lœΩrÊ~\Â√E∞ˇÈ
* Rpƒ¥a¢È≥ëCoÜ}’8¯s∆ÂE=«w¬;DJ¢Œ¡u œ¿Ëqp‹∫·.lfµ÷¶CùT+◊ŒÔ^ÖèÎo‚∞:æ@MË=Í›i‰Üx0ŒÙ¶ìæI6›aõÿ¿˜Ä:†˚dRÔaﬂ“9öm¯ÓÙ:SXi÷í#b¿≈=a}l•§’Ì¿S\¿JeÖ∞û∑»Ò|2Ä—iÀ\#ãK3ÙüLÙäSŒC¿Å1†C/¢7∂.Ú†#R≈<ä„‡üw¶i	√˚ó/kÇC+ te+^xó™¥∑Á¬Í√)q	@Ÿï˜çé rˇ˜9Ü	3â‚`“)hòÖÉπs|PQ1q≤T*˛êÍ ⁄îÍP‚´TºÚÉ€æ|ÙºH1Â%4ñ“I…~Á∞s¸©s¸€Ÿ~˜hÁ¸¨∑Øå·Ù¨WëÇ≠€~$J£ôÔ≈’JΩ",NòÅ¬±JÌK˝Âdíºle^ﬁ›%/õóÓng˚Ä! Vpb¿2PÈÀã˚—hÒ‚~2Å?wwã/Ív~rßnà¸¬|Í¡Ó‰‘˝åC√YêÕ‡c—¬á%ë—?=‡+`@lYuö<⁄E˝K≠&éÊK“zkÍπë&=6}˛¨÷ò9£vQ][!ï¶ºÚ∑cœwI’0⁄(ò∏Ÿ±R∞»„ã˚t$∞J`Ÿ´ó/ﬂf.;ÚÖ∂≥Ä«ª…(ó£~Ä$O(®ﬂ∏>©	POÎïÈÕØÿ9»¡•ÔIã| _HµwzÿÌì˜Ó·bı≈ΩΩ“¢ˆÖl˛‘Åß*ès[:Ìëb»∑÷Ä%ù yâÉÛŸLË\zÊËb∂»…ƒãﬂ}T-lÜ7™ºáûÂÌEÑÃ«!3,“ê∂Ù±ÀÂÍëâÇÙ`˝Ë?[Yl%7såÇ©„¸ëJÖ’ú4Ië¢"ò/˘=g∂cèõ
Qü9w8BGn<ÿ1©Ùœ:«Ωè˚g8ÚÂSx)òSSÓJ‚˙Â	0N‡[∆ÿæ7ΩqG{ÓÄøP'“˝rG; ÄÕ∂∫ãÃ‡ü…lãäCçipK¡√[¡„˘ﬁı8¶Ö8ˇN‚ ?4ıU¡áÿK([¸,n)'SÓ9¢K≤ÁLiéÈC”\nN!{Ga6íß¶*ú€ x≠»©7èùÈµ ¡á∆6? ∂è‹)¨Ã1ï-¨ÄùFZúü_ä>[A¸ÄAﬁ‰€øm©
ïÓ8£™"gï€b«ˇlhÿÈ ÉMúÈ]-}=ÍêùV}kk}ƒ¡Ù⁄ô8— ôiSjC?Z#F! ∏{E‚±,e*(∏ﬂ ıΩÿøA∫#l≠ Qb“›[°ø	†˛ë«ä)´'/∏∫ÇÈ,‘Cπ≠líq†Ì;Kã;∑ˆ>Ë¡!ÛÜnc∫p4˜Ç·QLµ¢≥Ω¿aß}À<Oñ¨œÊ—∏zO<ƒ+ÿ€
bmi˘∏∂ó’	lh~p›Åµ¸Í≈w≤í§Ú±{‹9ﬁ›W‡ø≤{∂ﬂÈ´œærÉMåÅJ´ñA˜ßÓƒâÊ7Œ±>¸ö^ª˛‹Å≠¨,HU©*(¡¢;H.ÿ;Åuó[jGIZ‡ı|«#g3µ£ TH:æÀY |ıÓ^•∂¯íN®¶Úü©tJ°»πva‚ŒØB≥Æ˜’¯nIx“ﬂ |bÂ”Ÿ…˘ÈoùﬁŒ…ÒVEc¥@±⁄¿A]]Qå¢B"`≠ôÔÄ‘Ø5∂"±oïVçï#ﬂ‰†jùæ5åÎÜñ›CùÁ`ÚO7£í“*ßMS7≥£Ü¬ûa]8 h”Í^îåª
 H¡M¯&ôaí§s∂LÄò°\ud‰∏J’LVPå·≠6B™íHu(ƒÛàgÑC°»∫r@Ú”[`sÚΩá¡¬É∞† /˙åß(©%Ù&yw¥Õtj⁄û´Mhm,Ã	ıOo‘£‚S”^≤ïtˇ`Ùú«äpºóµTi5ÆPd«î√!/¯S“†ô†0
¬8Ö‘'»¿Ç$ºó4bf 
›IQ∂–Æ‘•âTùÃÚ%ïvPyc¨4∞≠9Ì™N+¨(2Û)ó,p>ÈA”éû⁄’ópIâap%/íécÑ˚yG5G†[7òd§	ÁÉífè˝⁄WÕÒ¶®JfÁ<]=©5”!J+≤q·)¶sW[µTqq“bÏ!X9Ò∏º∫qû+Èò,cû∫∑ßj@Ûö‰ƒá
@Oª7
ÿI‰TgÌUçÎ5™ÌÚFQ≥èê^“¡gÀ†º•Íc≤Ö¶˙r 0°lûâ¶Ñ≈Û¬—”ã{»R|4∆•õp!ôíÖr~ñúœpj£SÅ.ÿ·¶†•„êiá.Õ[HZ®2ÿæî÷⁄∫˘=é∞•Vﬁ´–˚Åcr ·tŒ˙›Œa%3/ù#d3L9BâÏ˘¶Õ{¿€eaLLK_§Ï0Z≥ïŒ"≥¸ò7‚Ç˙∂u°“ØE™ª¥2=åÄ˛÷?˚/;À~À∞‹)£#7`gsŒb'√‡6¡úáÓËTî·}üΩÏ∆ÓŸçÈ®Ze¥b†jÃË†åùd94µ€Íoò…–õy∞a¥¥™¬O∫|IõY¥˝x6naò Û0uûôq#√"s¶LakR.ÖnC-ªbr?ˇúô…{Ÿ¢éT•crCO«≠òË#KŒ7¥O ùöH¢•93ô”ÊûG·pÂ§Få´Ù:¯HJXéñ§Ü¶áöÇ€‚“@ó°Ñ%i°dÅ’◊ﬁBs`5ó*>Ü.RF,ó"êÀíHπ3•\äVñ†ñ&zπx5dR˚qÁhø@∞+I}˘* ÷XeÙ"¶Ï‹÷Ìmb‘‚†üBîÙ21à3÷ùú;TË÷b~Ò3◊õÊa‰‚.TL#√MfÊÀÏ é>ü˜;«ü$uŸ˜ßU*‡~Ò¯i{;ŒsÔëÿ°‘Å"Ø˛í÷ï.WWIƒPÙKi‡¿ÒÉ∫§”€›?ﬁÎ"’h,ôãíΩ9ÄO√(˛©f¸üFÔ∞^î„…z÷Í=RÁ˝¸{K˝ûˇÆ"øY?éß˜KOØ
ÎÿçõH˛B˘Kˆˇ3»˛v·ü„ÉÂ$ˇ2b†{uÂ¢Ω…›≥äÇﬁH¢m‹öíÙ(û±öˇ=r°·q)æÙC›Ωúª<º¨V∞€kÂ°¡∫¥Ãmi&tøz¡<“¨È–2n`Å)ª°N3˚–:<§ÍâzBÄU≤ œ¬–ñº¸	ö´¥"ub‡÷-p√]TSDoµieWÆ{]‹π7»/Sù©t∞∫ó∞◊ÂÎÔzCœ« èFüzDÎTMï#ö˘`ÕÿjO’sÿ|∫ˆÜl’4k’HÃ>\“I‹r©øqÒiˇQ∫îéı/•J…úŸçäÌ∆1åÄ:€8ïÔßfYNœ≤4Îab>¥∂ ñCK6V«Pî$ÏèÒÂñ‹iÀ&„d)¨’˘1Ì∆∞q©∑É0rÏx~ƒ◊;Sû Wl+≠©{”'lÉõJe&©Æ‚fèá†øÜ°,Ω›œ˚{Áá˚Ω⁄j¢„¶xÁ“Ñà>¶_z'« r!†&˙ï˘C{Ww’R}∞ôËär¸dH†‡Päè¥—Åü¨pÙhJ± 2†chÿ”ö„©VkO˜⁄07Q
˚Ù(£q+ùr≈gn8ÑUrÆ≥≥9M^úFı"øQiW¶_ˆTƒÃË¶ÔË‹Îñ…èÊÊ˙{Û‚∫ﬂÎü¶ÔO÷QQ£B*—WÑ„#n ¢MûwzñfêEY8¢ƒ%ñ°%&"¡∞á˚Õã0Æ;πË3^oeOôÊ.)¢¢Ë˘ô…4¨†îïËãj=úßw+¿|˘éB%ÙYEi`1ñeX ä_π‘_‹CÀã/yeÈŸ˚√céÑ}”◊ïfS†ñ“y/ˆ1‡3]üÆæ∫úÔ4oÔ"ú∂Ïv–xíôõÁXjíÔ∑Õ<¸0$Ñﬁµ6ó•Ÿ√ON+≤ßÒÿ°˘4“◊—∞ï“Q3∂ÿP"4“«i‘_/M69ãæC|8°ﬁ∫“$ÀÔ.06?
çà§.˚,Nó„e∆( p◊gÒöÓMdhO(Çﬂ˚ n<Üö◊™òôèÃˆ`Ã∞»P¢ºÃûãCﬂâ#CRŒëZÖoCπL7FQêv3KN(c¯®ómVX£Lò÷#©]»Ú2≠njºfƒqY?TŒîv.ˇå5'V‡Ï§\π°@evÕgûE6≤F>¬	°—	&;ó‹πs§ŒıÒ∞3	o⁄ùwäT∏œÅl≠]ìÃ‘„pnô9~—Ë˙–›ÃäéS¿Q]cãPj⁄Û®Ná™ûwˆœè{W„$ØßgaÓcDóÙÖÂ9_∑YFo ´ôw≠V∑h9ÚN2† C+¨sC=Ãó>eê“@+ì°D|ñîvÛ¸î$~t÷O á‡Á1≤]ôÁŸÔsÍ≤Æ#¸πºÌ∆"A≤++*Vß#Ö;ÿ "„Eµ†√1µ@∞‹0BÀ–2˝d;2{ëI]Øˆjn?rcÆtà>4Ä ÑÓWJß! ò	m∆∞!⁄ §C]bÈï)sÕ¨8#èÅƒﬂ¥ÁOÌzD;+´¶Åuπß˙∞¥{æ∞@˜ã,„aívu´%lW°…2ªr&¸1˚ØØÏΩ]Ωƒ[ À x∞‡vÕt»áa‹˛DX2¯B∞è†D	Ù%~0jÛ)–… ≤E2~©|içäj⁄’E∂ùv∏‹Øûl)Ô≥øÈﬂhá’ÔçÉ€ŒhtåøJY∫§ix{πGŒtÓ¯ß››ú∑gIÑm~°œ% ∞ﬂlôè∂%™Ã,IÚ'4Üt{'‹RŸ)˙ï⁄EÛ2=F1Kß˛lÈ√4^ùf’ÿÈER!=ΩÚ—Ò"«'G(kÃRÌ` xM™!à´¨ÜRÇÀ∑§»r©Zù.WF+#≈â<åT@—ë*]
M},∂j]%ﬂÚS9»ªr∂∞åûZßÚ)a›ÂEº≠=N∂µÁüèÂ¯k˘yß¨Õ[±ókÔy˝›ƒÛΩõsËˇ4*?“⁄M—´È˘ûmtŒÃÙ∂+ÛXÜ∂Á÷Wß2Wî}›„Ñ%£Mï4¶rΩÖ|¯v‘ÃDU)Qêú®Ióµ∑®Ø8s1Ω K∫Ò’soiSB9¿æhœÁX·?Ë+÷1Õ9ï…≈æî*JÚ[Â)£ê9gFjô€Mé{(j≈â‹C#Ñ0˛.∏∏†Æ´˙å øl]ë”(π!†òŒM‰Fdœãﬂ áv¶ì45%'ÿ*âΩësCFúﬁ4;æÅ7∞g◊ÛÅ3FlÊêwÓ ƒ6Hg:rpŒw°‡ËÔ_Vò8 >s9ø;ç‘-Ed±kß¶^*r<2Ñ°´éG)ˆë÷4,91ÂÜàÚ ˘ÈûOé—‰l=nX˜øâÑßæá˛˘0Íﬂ·\ÃˇígÒÖ∑ì‰/|<¿ıúØÓ˛»ãü8;ôM0J≠÷îL
	∫'ß1SûSôaˇÓ ˛7±ôLó ÏKIÉ≤úËﬂJ5Ø’í•M+H58ß&RÍúbFD«◊≥Í»˘tü¢nö‰U¡Âu,Â¡IYìLC:•åûRGg`î¬y)u¥úo∏L¸MRﬁEmΩTJµakZ%•é⁄ç¨çVﬁÿSÎ§Ãé‚µÃı(-⁄“€(<êR√öﬁF‚é¥
jÚΩ¥x¬5ÈÂç©n$vJ/oJu#≥Yπ@ßnX~∫õîÄ®gL#%
[µa∫º|X	¥´å∂ìÉ(±uÍ¥SqZY'øg®guO»ÚÉÜ⁄íÆ£P*∂”bR˚È])Ã•°∂Æƒ”':∑Wïuw˙e∆‘4fUeßWå´°¶‚+`pPX[”éÍnB˘aH∆dE&∂º°F(ßû«¶•|èÕƒTü°LNJ¯§P´ºúOñﬁ⁄:…‰}2˜dK˝î◊ñ‹ßºJr≈º§9‹≈√ùï&«6'=ºöˆ$™Y¢˝‘¡[Éﬂπ›Œ{Lÿ;EÊ}U*“}`às*Í3
zhµ.Ω(XZqOVHf‡)§ÿ<I˚®Áº¬‡3`‹«a0ı˛Â¬ÿ£ öãEæ∞ƒ±ÛvÏNS!%·ò—>]ë,î3†˛H¡⁄êT|!WÈ≈íYL:iÎÄ´í2ÿ¿ƒZêE&¡Wó\Ö¡Gƒ&åº+ 0!£LÊS6ek” A•?ê‚˚”Êù÷1R4≥I„ôîr¸ç9¯5Îè+ gÇxTÁå⁄Ù¥¬|RF∞1'u(v‹}hŒ"kXëòY6≤Hq£ïf◊XÎÚ	;|≤v≤õk´∏1-∑~J◊KòƒxL¡NË:ƒ^Î∂ê“ñïB´ä¡B¢îPÓ≤J]>ÇmêiG#z»ò[»≤®û∆π*«-˜LÒóKú©¥9˝LÒ7˙ôH«âó‘Nì
K0E#ò∏>âÕ!_Ar§®Ò
-ﬁ"EC◊›xc¶≤ ¯—:ó>Ÿ˘5ÉÁeœ‰’ï#ìr§ÊlTõ=dƒñ√JôCƒåb ÿ"ñèG»xXFcçpY.$Ï°aöÿ¶≈Ò`jÒÂ¬ÚÎóàÀk`ôê∞ºv¨1aUK≠Ö=∞A{Tÿ4áÖ„˜çaDÚYªÃ¢Äe‚»~\ò∫Õ[®@€ô~ÏdVQ˝É˝’ñæôYmQ©8v≥@ë©Y6Æ]}†3ê¬'ò?(Éî~?™·‡•˘Qùâê¬¥"€ëQB≤ƒ r¢≤ñè»çe=< À“Ö9&këY'.œe≠‡ä±Uí\˙øDt9ˇñ3n-j·iy}[‰òEèöÉ»r#«¶y Y.z®j6˝î¿xKDåÕJ+{ÀkyŒùﬁíä^ìS‰®§∂◊Tw∂ú 7C,¨'öE⁄‡¸»±iyï∞¸y(π»˙‘ïãÀ(]ã£«û!r,5ñ3$c‰XÓÃa e"«,X†(z¨¿u.'b¨4.{Æà±r3.LuQ>ZÏ·ëbÀGâÂDàGá=CdX	ƒü·Ô¨—`ÀEÇevÏ)#¿˝5”N¡_ô‚π±_∂∏ØLÂú–/Ω¨9H˘ïï%ÉøîÚÜ¯Øú˜ÀÜÄYRåÑ~=]ÿ◊!_OÓ•ÖzŸ,Òπ·^Â0•≈˝ª|∏WA®WnòW	VÊâNûç√è9*÷,'ºÀ⁄eÎZÇ/÷µTH◊íb~æÁèüí!]O!$‡Á1Ç]ôÁœÔs L!]Üò¢ ıúa\ﬂ/ÑKu1h≤x;«â%Õ`S‰¥˙⁄n.|Ü‰Í¿Á™c“%¨JW•Ω”»€c´
„™“ñS`õh´“	çN≈Î⁄B©ÏV]ıﬂø•ìÀxˇ¥Ω≠˙çfΩyFÓ=#ßqˇÕªË>d7¥¶nü‘cBÔ»`X|∞47%#’á⁄ê‘ÕzÄ¥g∞›Kn≠ …ãnº6˘ÚÄ+Í2!rPÅK†ØÌ‚í‘ﬂ„ã+ıÈ
uqü∏Ùkw¬9hk(.ze9ìG¡ÌÎ8$∆‹÷ËÔ˛%Q2Áåº¯‘Û=‹®iâyõF'≈	ÓgÙ\’È‹˜ó¥®|rÆü0±3:≤•qIÃANR¡kÏ°p1ÄàßCÄz˚AQ6&n!3µ%Æ!∆ˆ˛0GzÏπ Û∏∆8è4§Ë=4vÄ≠%Ù
FxÚ§D8E˛Ú'X™+/úHÒ<ùôs0F˚πsn†e¥É»Éa¿G
{ﬁ‘X:°ÉÏ0¬ù~H ó	¿5√XdA˘*Ñèﬁ‘åKQÖqEwÍJPâV±&Ró<À≠ …<y¢·Ì˜“	3ß”e‘í)OLû+l TÛ$çK’QT”π˝¸≥ÇM´jú4C2îU=ˇ5¢XPÔs^5œPAƒ^$:ãîÈê(M∫¿Hp§ÂŒHÉs_ZﬁÊﬂ'Øô}…bKé ú˚ôEuœf]ÕÀ≥©ÿX•	≤l≥kÊg’¥g”4öfm¶Wi\Îk‚m{√ﬁº U3ñP©ÕöŸ
j8~[FFw^ù«∏Úsì¡íü©L}D{–;¥dŒ€…¿?»øÿ|Yèq™°7hõ‘!ÎJ&¥Ø¯æ¥‘yvY [d‘•‹>gç˘íπUl;Àê[µW\/j⁄ç¢E¶«|√b±È0◊»•ÛùŒØù3ªçö–e›Ï.ˇ‚k¬vÃ\àëÙXã)Ì@ôùiˆñÂ≤)ˇ•s¢Û”•$”\©‘ ëÆHìêmÂ©rú≤éâHßL(É¢®Ía¥í37√åÃ˘L2HNÓ-’Æóø {oß_é’fÃŒ,ı£Éﬁ`”)Îs¿Ÿ≤$Äy‰Ñ^¬¥Ω∏ó—l"’â+é∂#Ó·áóKpoø∂e¿´ -eYf^á«e{"¡ïLZÅ¨∫G8ó0
¶Ñ∑&∑”„ñ‡Ó(≤5¿"N‡)fQ€xä‡Óùπ√ÿ˛î◊ˇÛq¯Q∫ä◊T6"›*|)ñ^‹g˚Yîëæ‰KA‚Aˆ£¥ﬂ,Ô˘(Qbya¬,N<ß@ë'R<B®x∞X±å`°¢ÎeÖãß/!`hÓ&œÊ¬ôüŒ	A√ö»ø(Ö^Ú~ã/Ë√Eé':æÉÿÒá<.z,+|î?rÕÁÖ"HÆRF)D à"•Öëqƒ‰Fd‘t°ƒ"ª(ˆ\—‰	Öì“Ü≥≥YÆàíÒ(%¶‰*%EïÁVtqEXtW†\°≈$∂òó?æË¢–ŒLÓB∂ßa0Ò"É⁄”eê˘L∫ÎûæÌÀJ?í<ï0£èêà~íGò¯Ö°úT≥JH@ ó∞µ0S»h“€UA !l¢™•Eä‚‡˙⁄wYØﬂGFIìÜ,¢õûΩØ“—ŸÁ¢ÿø¥bz´t/Sô“fÕëgÅS0olÚ'	›¥dg~>hí)KÖL
¿}¡mÃ0<›$†<¥kåŸ4ê ÃÈﬁGmïπô6≤ò\Ú{e™ïÊzòLØ≥.:˙guï¶ø$p^Ø]qÁë‘M;qF_nß…2›o≥Ä?fâ)xì‹	`: ≠ÔïÚ¥Ö_]'dlç(Üú=–,|QÕñ?
¶>Z˙¥™èÜ∑-∆eoJàvÂ¬I´Ú{WW}èÚz4ŒDUπæÉù©kdèïN±•=Á.πlvËz~5i~ïT[Õfì¸yï¸iØˆí¥‰VºËüÆ{„cpr“‡ªm“j Ö∆NÙÀ|Í∂õÌW8…“ “gË"ó,<‹PÁLßrrEﬂ˜b\“//Óy#ã˙ã{a,M¿k !çzXÉ+ÕJmQo∂æ»ÉÚù∏§;ﬁÆ4¨È"∑à¬Æ$-°Ôﬁ„óTáe(˙ÖØ°è,Æ»¿‹w0‰ûG¯E§J”i–ÖcÅW.ô–Ó„ «´>Cı
 ì2nMöZ⁄2Gg9n 	%∏éøﬂogvè:Ç–óÔ∂µµC_f÷˜ bdπsxHuW°,nK(úÆ	Ù•-èXoöY‘”x¡@±q›X.ø‰@!àﬂty‰ı‡Mu—•ÎgWÉØÇF;u˝ç7ò*]ßr”VJ≈d∫2á˚‚Q*´-ÃR´®Y◊–cG4™∫3Ø)‘G≈´ß{\Q≈&πâP?óX•4ë©Q=ø±µU∂êz√‘…„¥…#IÓ&´ ıaJìfÍ˝îV¨ïûµh∏Ùt˝´ÙÅÈU“©tÅÓˇv∂ﬂ=⁄9?ÎÌÀõï¬ﬂ@£FIÜDÃÔ.Fõ(ıÖò`øÊûS( }v√}‚1õ±ã‚v°Ω©Ωqô∂Ç,-+Ù√ÏW”˚Ón0ô9°À J˚√ãVçà"ú …å'v¨ì™£?L'ò‚†pé7uÅˇıáóSÚ’ÒÁ.C4i’Qπ'öﬂ8”ùpHz;ã{Õ®E;Q…⁄
ù\4ü¨Væ˘Qµq˙ `˝9 TÃìÔ!£‡'≠‘È*ûîÙ∏Y“åÁèõ_Ò `ˆj.P”H®ﬂ „óßÏAÏôü¸`‡¯z˝3œCMö1í™Ú3•RD9ŒŒ+%H˘ë3clO f¶p°ã8
•≥§R"dŸÍ HÏ_ä»Ã@ø∂∂—~µæŸløUãÈ`π÷n∂^m∂◊ﬂ(Â‰çm≠m ˇ™º6≠ˆÎvª’÷jÀ∫˛zÌM{mÌçê‹d÷‘ÒG¡ô{„NaUŒ8IujuÛLÍ⁄¿y√ãú∂_¢yÿÈûsVÖ·zKÂsÄe@ù`^°ÿ¯úÌC»boìÒ#’VŸûÁED¢˚d°2ÄrgTå†‡∏≤4\ŒAY%√©—>æÎM¯ˇfE/Ö,∑R¶µNÀXMzJ≤{—jo¥÷∂ﬂjE‰ıjµ÷_øz”2Ç,+OJÍ‘≥Ì•†‘G@!˝±bœç»BªÄNãÙ‚;ﬂç§Ü´lë uËç*íB+≠‘ÿE´lI< ¨çø¯A∏E.⁄ØW»:@Ø◊/±ˆã˝^!ÍøÚ}Ó∑òWnol§œØÄ£ÔyˇÇ±lj±· #Ñ1:æwçW#¯ÓUl*0t}ˇ‘ç<ÃWºñ‰ò_¡ËŒ0G”pÃ-)s∫Xk¬ÇÄL∫Ò¶‘Ç$√àåCÄiç]ˇ´{CGΩj√Mv†˝jÖ¥◊`⁄ÎÕíõÄıˇÈç‚Òi6Z⁄X)X}v˝:d:∑dà
ò≥mJfŒµ+É:ÖgüYâmR•ë´}XûÙÖh>»<UòÃQ0l–ZÿT[Î	ˇ∆_ı≈zWS”À`ı™ºxÇîr∏qÈWHkV1¡.Ÿ°º±è§’Ñçoµ`/‡póåd¡Ü#Ø—FfD{∞“|‰Ì◊˚=˚\m66îóU⁄¯&tÚÜ~
–tˇ∑ı9Ì|⁄'≠Ï	
®léDj=D%÷…qˇsÔ∑ÓﬁÖ–µ\™∂Eô∂“πü∂0„´@Ï|ÿhÓìOù≥ΩÈü¸gß◊%üOv:á˝˝›œ¬∂Eæ‰î,zÿ9=ÓïÙ:á{'‰ºﬂ9Íêùsê©»ã{uËE+%ˆÖéÌÀ°4Cw
dbÍ¯dg~3'p˙ØÒ39ÄMCÁ@—cEË5Uëzb™ºÉ©3ô sÌ«Ø»fΩJw©ÁYJö”ì^¶Àf÷ﬂ?;Ëw	ÏÁΩŒÁL∞z∂ﬂ9¨˜ªG˚ågNö †rg®¯4&@]Ybhıb≤:ƒ‹_€«Áûêµ*tîçÜFR$ã∞ï4&”9@•ïÛ–¡¯∂i¿±›xSßÕ˝ V…û›Ñﬁ,¢OôO|gLé=∏Q
 ’≥˘Ãs∆µ Â•L_†Ì˜^T˙' √√‰è:ΩÛò˚Y∑{HÔ=¢Y¸8πwn∏¸CéÊ·|Lx&ªz1õÔ“IÔ™ﬁtL‹öÑﬂE;˚ ◊øtX’ŒnˇÓûÙ˙5÷Y ôÑ¿°í Ωä¸lÌÛ`L#≠?∂±áù8L $v?√ÑHı‡‰∏wrÿ›ÉCH{Ï„Lòvjå7&çú5˙π∏êw¿áíÌuÄqOCΩ◊nØC:=“9Ëw?íΩ.ëÓë"(—bØÙNﬂªô{#ráNDpd#w‰98tºxà-~¶√ÈÕéµ”ΩŒq˚Ä.˚TCz˝Œ«è§z∫ﬂÔˇJv;Ωœµ§o≥•,0… ÷Ç„°¢AvÚ-ô¡$_Ü¥2Õ21M¯a‡°Èl⁄X"·†BÔz”Ad™ËÏ »ùbŒ≤]`â∂®*«—4E\√É)zx¯2—x4•YR0nÀpÉˆ›≈ÉñA¨¡x•F¬á¢ßOªıÈ‡:íÀıKzkT/∏ä… Ñ´¸fÓç6ìÚ≥äﬂC™4um…°6q®¿/¥€o§°^áÆ;]b¨@¯ëpøn.1‘ı%á∫Å∫æÜ<Ç<‘;®‹.1÷÷:åˆ4÷“ˆo˙7ûŒ=14•4±|í®≠1ÅÂ©#ëˇ+öpö∫P¥F™'S‡"PºÊ≈’ñ‘∂ /Ùßë»¸˙t?Ä.uOˆˆÈ…˛‘9Ãàö5;Øöa¡JÒ°exZFGÀçÿLBì@X}‘õ‰WK2¿t‰_Ë’Z6k1M_É˙^|œÌmoTÔÓUj“[›#ñÍh:Œ≠¸E]
 ëtYeûb3a±-\E_aÁ,$ﬁ¢èö íR¯ÍŸåíÒ<%∆‚cCê©‹a4ìæ∏î®ëŒ\ }“(à¶F®eHLF´`+BGSªL˙íÜa#@úòEÜ¶@¥	ª÷¸(ì+BZiØΩ˜’&˛ß5Wí˛iÕ•4bEUÜ†‡ﬂ^Gajû≈mâèIÅÑ’&’èÄØ®∞XÕ"t—ƒ6fÃ‰åF(\§óyh‚F2>*Xu?ıA<Í|ÓÉs‡QÁÏSÕ˛˘qˇúÚ8TNÍÀWÓ	A®‰ùà9!zÍ:gEA)≥»˜É`‚≈j›Ñs
¸·<r∆é3b\*ÒjBèÇ}æﬁÌ6Ã¸dò„rœŒ?uMkdCΩ&˘ÖiÅÉÚ˘.˘Ö*˘ˆ‹!”˘√j
_jIÆ∆ì“„9•Ó®é,_3ó&ö:òxF√m£ÿc cóçz≤C≥Ç+æ„íOrïaéΩ®Y/Rá˙.ı˘y§ØÅd≠i&sî`Úhô2T=yYπ‹–¶≤]PM¯£U‡xÃ?WOrüí¸x
5⁄¥%∫B¯˙…ò|√&à°D˚Õ∆˙Ê⁄∆Ê¶—-¢bﬁd´Èf‚	C¨À˙\≈*´¯†F˛8∫&Ê¶“ÎE"µ4ÊŸ¢ŸD◊P|¯é=ƒÉ ≤/°·|w_0xåÎâ∑= 0˘Q0è∑p*Ú3ËP˛…fïç§Ló)cí¶»`ó€¢]“ ¯µøß`  åÓTÄW®†4ë@iÄ™Ik'ÉÄÊ`åÌ”Ωf√¨Û‘BŒ◊Î#±„¨ﬂs^{ï=U6^i $‚´‡zÏ„¶Hêç7eå&ZFuç√¡™ÂºÖ	ÁΩÜ›ó^´;i0 ÷Ù£˜ÕU[µÙ ≠£‡Mˇ!π'O
Ñ\¶`!fÃ“Õ•S‚:ûŒ¡˘êÂ^¡•b$[÷º◊'ysd€£N2ŸÀÚ≥¨ÙŒœNœ{ïÏ4üãÌﬁô„≠Uj„VUlÃ˛[ÃÜ#+Äy6øˆF^qX¨zÂ≈§˙èö§,pi`ÿ≈ññÊ†sï8fÆ∏ò—UK¨ïU…ï÷õ›PJ`∂A7ÃU1π~±öi	ESÍK˜˙,∏%€ƒ†#IwIØ-ï6”àF≤°H:≥ä…XQ÷°¥76
À'ÀJ∂˘∫™U,Ö—‘{Á„˛—´{F‘º«†Z£\⁄¢3¿ïVo√öï«¡‚¨.öól£8—6ß‹,P*…r¢æ6YMX∂o <§gY¢4t¸∑ºﬂÚ/≥àòï| ™æ¯ÿøªt‚Q™ô:€?ËúíÉì£nˇhÖ∆És†RgÁ&ΩT ˙X$·µÚí√Öﬁ√˝ΩO˚g|ê ’—0µS±ô$^v	f*ÀÚh§U©årnƒZ*¸y”ÎÎ9ï|ßq¯I‘UﬁÖ›;=9Vw¶svﬁCÕ„“RÓ˘tÜ°æ4ƒ÷◊∫ﬁW™ûıÉ‡f>„˜9æÜJ{ ÿΩãDúu–Ê"ΩÁò›0S(Z¶»≥ÇeC∑îÁîÏƒÈ=pZß›?‚º∏€bD®„"∞R©√‚@8◊Úù†ãq‚öàﬁäà[±Ñp}sBó∏ìY|«Få-G¶îì^U¿ë°§∫—ﬁløñú≥àæ% OZc˝ı∫Ï©∏xnNı8¿S¯dLüPÉ2Wê˝ú†Vd‰¬∫íl–å{Â6h∆õ∏1fAª#sN‡®`7Ùn"‘∂Ëí∫UiÈq†¨”7Oßå5U˜!s≠WËÔ÷©‘¢Ω–ÑÉõ¶v€V•√Ã„ëóX«ivLZÖ‹`∏Û¸$…7‰8ÈÀ˚$€ÊI r¡ôM@Ücµ¯˛ù÷ô·πƒóS}ä‘tL≠ƒ7¥A#r4ß§%Ù“Üt8≥DÖZz™kñ˝D#˝Å{Î¸Ó°9ûü°slúT\ÚüÓtÑ5Ω2
√ÃÀl-kRü/Ì]k…ç ©4äXöÓÏÃ;∏≈±wÌPu¡lÊ{nXz÷Î9≥Ó;◊–zB ≈§˜pΩ†óif÷ªg˚{%gÕ5Nõ/s∏XeŸƒa‡∏¬L%?ÅëscÇ˘|»âT?”î=…ÿi+‰ünOú¶¶.LÚ˝÷.ºÂ	ñyÚ›ÉÑÕ˛Xì≤œY¬[|uè;G›û≈Û)á´‚ˆÏ$E∞¢)C´]ƒM◊nÃ Óà¢U]˜øíÍçW§à⁄¨íè5DëI*Áp+q∑çô@‰Fï!kç)"K6ó`ÕúMd2⁄∫“õ¶UdNÆWLáAUâ∑ö*ÒVS%ﬁ2∂¸ 0§Uì&-à]›¶L3Øs®…}”Ã YıZ:Cãë©˚›è≤¨S∑˝»™≈BÁÍìı/QJ’7*;ãL°nø7g>E4 >X¶ä˛=˜ ãºXzö]éÁ‚·ò†‰≥NuäÄª1ÈÙ∞*û¸ ìD¸—π®öhFãóÇ¬ÛËÀ”âb¢8uc)¬Úd⁄Fn›‘’â“…KäK∫aŸTÜÀ)óTñÒ_H#Æì!ç]Õßl•Dàám-Á…≈Â
πJ¥ïƒ0PcOz∑†X=â‘·B%#æÁóÍà	≤;æ{úÄÕ @øæñ@Ø’Vjm¶µZÎy’÷‘Œ6“zÌV^Ωu•^ªù÷KÓwî<OÃπ“∂/U≤Ë)YÓt”$õﬂ!±ç“•ÂÑpÖP®6z‹“\IûÖ;5…B2‡‹úí¬åÕŸ¥˜ß£«ˆ«÷7'óÉ‘]Í6-˚"]@∫Jö 1‹G∫7ò}nü◊ü°∞yY,ˇd~BØáeïDºZÇú3˜T*≠ÕµÕ÷öÍ °π@¥^øy’l z%≈êˆîA˘jOÌjß‘v¥Æ^ØØΩz”*—U∆uZÈ
Éjz⁄Xá˜kiØµßåÁ≥6)-"“¥~j@$ÔK¢<⁄1d‹bÏ≤Û Ù±Z
7¨rLíA6I∑˚Ùø/ep»“]&}Z¸R∂2≤ÁI∑¥eë¿∂î·À/Q$„‰"…g*tl•>=ä#KLòºKxu åé-îgg	‹¯3Œ±ßö
≈=FÇªùh˝%ºhÊ!m@øÃiP÷—<F·*ëØa°¨ΩÕÜd∞ âd+à’˙ÙfOöéCDÔ¸í¸Òß˝√Û†7Œ?-ë6$”≤0±»ÕíÍÈYwß≥◊≈$å<I@jº√'i)Ÿ}VÉ≠ê”~…~ïå3y]Ò≈¨(õ-Úç‹Œ|+UtIM·"ÀGÛÅ|A´Âﬁ~ø”=$øúü¡∂ê£Û>6˘‚^Î"Ò≥∑maÂ“µπ◊l^ÃÂä6jCÑ˜«‚Ç+2ôcz®uÖS˜)Ê3¯â¶ñ! ı!≤‹™SÓãp§k,(^≥ögÇ+ÔÑ°s˜Nl c{2º˙€‰ı™±iÔ"∞WºÛ"¨\åg∞º°Èã›±Áè¥Áã˜»Ã_*π∆‡TäëuGwBÌπÒ;÷”˚$õáµ‹°Ÿ™B§ @ı»åŒ""U#cÉi8B7Ç®ó«≈®«A˝î«pë»u1t\ÿ€∏?o1ìJ!c,ìéEÚcÌÇàÓ;√qµ hº;ﬁ=”Jû™`êΩÊT ´∂¢ºëaÄΩWí%ÛGÍ•ˆ)t`"+ızWp˙FæÁMƒﬁ’§ô_§;âG[Ñ˜0XtYßâ""∏n‹πxÏEd®ﬂ.«Øâ⁄E¶Ûúπ¨1øcO˛ÃÕ»¸¯òâçwó2rqµ;È„™|€Mπ¥í∞‘&/m©Eûû>aY¬Ò[√ π ¢mßÕ”Z¨P
zÙIfQä†,Ö3ZE{ı@ìAMÉ(⁄t0Tov4 °zÉeZ'À√‡ôÅıÚ∏/u»¿îXC®h–á6é±#íæjQòe≤èQŸ-S⁄˚ÂÄœvúôFÑ∫√Kn¯¢y˘A@úêÖY{o8a–H£xj1∏Ÿ=—†+ïáå5ÛŒ|O¶∞C®µ–L ‰˝i4]mr‘ü©Ú0∆\F@lÛA5!{˚Ω]Ä8‰%´@¡]TBwÉëFm©,πËÙLtl˘…ÊÙtt÷ÇèÀIóf§„”ôﬂΩUñß¥nè‹ÿ9¶.Àâ=+´E7ÄjëÅd€N§o±%ó¡fÓ2>]â6ÿËÛ™
ÕÌE{ΩI√Á0Bz„rÅ,∫π´o4’kXjù†Å”rëö5ÉÒ÷xˆ§iäP=—ÕS7”ãÈk≥2a)%÷ix4˝√[˘Hær	tmcs“F§+Ω¨â6Dâ´˘pyé(tô °îùÔ2ıK¡ñ˚˜	ïÑ¡W=C,oyÏN0ùÙ7√9B5*æÁ ™ûùø√B’M~ Uqœ8øŸF\k¬‡+≈ÂÀ,ÍÃpˇ§ Ê÷u‘®¬:c˙(≈j)‡”B‚ß\Ä ˛~Wf+dø~fÈö§˝…»ã ·¸I:/ÏR&ü˙;§ù‚`\H€˘èÙ17)Wär/_f‹—0là&fπ—0Ùf,∞¡Wt∑ª¿qPÓÄ.¢ª… #Ã§ÎMø˜;"◊˛›l©∞‡‹ÓASh*R£[¶!´ˇ[ıDˇÒèóµó´Ä‘7ˇ¯—ÂÀUˆP«$ı«E8yîº€ìﬂ˝ +¨Ï§º¨y§ô÷+®^P4&ó˘.Ñ¢éÙÑ{C5Îy—T9(´D%ê¬uz”ïΩM
Y°3˜äY9òÔLﬂc+Pí„ßcv}0ÎN∑áZë*Ê?ªùJMÂˇåk˝^‡›÷∆`±“°/åkgdíÚz2∑°qc{RÇk`ÎQ˝´ÓvÄÜ≥Cg‡˙"î5-†ôO®3QTQÌ•§˜K´Qd)∑º≠{Ñwı≠‰¿p^ÁöõD≤«Øı˜ñ◊&;Jm!ÙXó„ÒÙ	ïòO+w{†_=ò:≥“X,F?®Ô[%Íë$Y‚z[º6‰p‚çCÔ-`˘ñ–ˇÛjÍIòèÉDKe……z∞°ùúÁ»SlƒF_•xk”ûb«Ó ß4—nÀMP«kÎ⁄€vS~ª°Ω≠‡N*NØ Ê@ê˚ÿ|÷î@	,X’≠"+QN\ ıHlƒÖ®})©&ÿha4{ª‘”,•ÌÊp±z *N∂35Ø*t_ñÉj3j†ê6	sU÷Úg~JëYâÅÊƒ]Q9p‚ÜPæç¶zïõ%ﬁlâ‡*l˝Ã5¥¸7Ûw˚⁄º*µ6ÃÜ˝”ã«UdTó]{dÿÉ÷"'ƒ≠ é,#´ßÆ:åV0π€G‚Gã$~::e±¥:i≤NUtò·z±3ä≈@‘ºòÆùÃ…—RÚ%?äÈòìÌ//Óiπãˆ%⁄EŸ˜ñÙΩy)q_*…Á›Î™∂èAÄÈﬁ–Lá∆A&rFƒÇ(°Ó)ì≈ÔR⁄πMÕÅ◊n|Lkù\aë‡dÈ˝ë‘Û˙æÖﬁmßï·˜ÀóôDQ‘ÆËôºçÕâò§ÙJÎò®Ûf‚⁄\Ø±L\4Q¿zr0ÏæÀS‹QﬂêlÙÀg«w&Ùﬁ-o¡‚
p©˘hÚ§&Õ˙∏íÒﬁ3∏:Á'ﬂLLG§wÀÃ=û°}UGö\[ƒ%œ$Ë·,ÂLYRåÓÜÔ¨6]Á´+Ç¸DöŒﬂD∏›oü∫ü~{qœ^¿◊L.™≈oü±G{ÁNGãàh<òùÔ}∑˚¥‡Q0r¸*’µeÆjRŸ3≠@¸J›Ÿ2) JÒÓﬁó &ZÁMR~Ë‹sa√AS˜W∑7D≈»vÖ≤uÊÌ
#{0=væz◊ B€˜Èwq®6‚Ì{¸õ≥ ê”ˆ=˝á=∑[Ωy_…–w¢uªÕ@¨ﬂ’7…lPoØW“´“ÙíW>‡f¸SlM&£-˙(7˘}≈ﬁ’]}‡∆∑0*áGuñ” ±üòº˚⁄ô’Â.X'Í•|Ô∆-πW‘˙⁄7üÚ8ıÅO£◊YÑ™˛¶ŸƒÎÍÜ7 ıò≤C˙G søª°Ç\Ëœ,_®⁄ÂÍ∏•bñÎ(…ƒyÛI¶≥Sv˜≤É`7–›N)úX)*Ü_qLÉCfË±—–∆2S÷gU[ „Æ‡∫Æicy7ò«q0’∆Lw}ox≥}œÓ„G¢3±ÛÄzÚö-ı6∏ñ◊óÂv€KfﬂÍØ»ÏÆæê7">™∑[v—jŒæ]í9ÊÎbHa≤s∑ﬁïÀ—ÿ∑u®:æ∫·t7=ñ]◊ÀCíWG:@ßÕ ã!8æ –ıÕywä˛Á ÔÌ˚÷´Y}œØS…E€
∂Ñ9˚¡Zœfj'¯œLTo·qHÆ—Aø Îäã≈ΩXß9ÉS+mB∫z°À/≤¬UD’F}ÏçF.w"@·™∞7e„IÈ§≈D¿¶AGq0´√`¥¡ø∑ııM2∆?Èv≠∂”¡“;±Íì∞¸„?“CM«Sgõ°∫æﬁjoË{=öá‘‚T›lV`”rôL˝_ıVì®8K«Sc:∂ÃŒ‚$SG¥È\Ã7–pù≠•[Èˇ¿“≠\m5’ÉîÅv—1ßÓ¶n†£¬Ú°"ZCe¥è
?ÌÊB_S#®K/Z2ç^l"HÍGûÍ‡◊ tÌá&Õ5ıMú7†ívcëI˛QÄhÑò™û˝ìVj7-ÛÔy»∂ ⁄d!õ!Œƒ∞’ÊôøØggÕPöô8≠ÁŒ‡C?q|ÿ4dÑ&≤·1#4=3ΩÂ”°´ëaƒ„u”Ä€ô´xŸÿøÆûŸú≥7◊B∑ÌÃÈ1-ûÚÄÄ^ƒıu±ô±¯í¿øÜ:€W∂6W#7√hôÕ‚j˘˙4ò∫ˆù#<ˇ»£Y≠ùÈçf%G¸- ◊e‚;∞<,Àà≤ªô¶ ŒÓ®el∂°m+;ÚF.Ï«Óu•É˝Ä]ÈSŸ‚©7Õû‹S⁄«må·añè‘8#Á¡¯
◊°bb∂]òé≥ —$üÚç"åD≤çD≤çÙBÅç¶z$6öÀ—MÑõW&î“á≠¡}<ü	*πn†íÊ≈7P	¿<úBËAà®Xœå,KL‘ W∞2t≠√.øÕ@◊,]0Ådñ&¨[¯˙,⁄∑ 25Ü„§/u¡È<«Ë}ñïÇjWxt˛œ"≈@fñYˆ·ﬂÎúqKbÂû¸ÑÌ∑”?Ï€ab˙ª√MWùaåÈ]v·˚$èÚ˚ú7qù«ì8££¬eΩ"H"ä∂öötßâô&Õ@”§é∆ú«øŒï“µ©~˚^W“≥œ-3~}yqOÔÂûx”™X>ºñõa.‘T„	LQ⁄TS`¶üEñ$óÑ’Úr£82±ôœ} ≥C>´˛˜7ÎŒ⁄`Û“»¨ú·˝'dµóg–†Å˚∞P≈C’Dƒ#¯√(⁄¥öîœtÒèí#\ÇA“~ñ◊Ù¯◊MœfÆ¶*$™ò6zYyñ•≈îCè©uï∫$cB¨ô≠¸ X∑ÍG,
çÒö“ºI˛u1Feü4◊•ˆ?ì>gÓtuºféAûy∞>¿:÷{Ù?Ω
©mM¡,nﬂÑŸÁ©$˘˝—Ü8°&{˘-¢u¿S5€k®}∏U'ß¯ñT<v∆s,nqÏBòUeSáõUoñ
%N[˝[™≠”ø™≤*QÜftñRkÀ  ‘ë ëuòÑtM2.[K3“fÔÏgÔ;.%	ÎmÔwYπìy¸îKg”ùdÛ:•(¯6tfŸ_7Î—ƒîKi†i
{7
&Ò˘6U∆Ögo¥ï†™Ê∏∞%õÉ&&K™*êPZWXè´bÑ∂R≥œQé≠Ê%sπfÒvU€ﬁÌiÈÁ∆Ω€æ«&3b√O÷¯÷ò∑J‡ÏU”Õ∫ˇ2˚Üõ~WoI'‰
À»a U3À3Õ>*â¿¡Ê¶Ù!aLË∏Ñ/a?Ú»%›d6"È·+@÷6_lKi?ˆ∞y`l5MÊ¿ÙS≥ËÏÃáº,:’ç∫…X´f¶ Yc5Ø—d&VlÍ˙Ó–ÜˆÀ˝∫}œJπÏ^ÿ\8£ :∆Ó€óú˘d»çVô˜N’mƒNxÌ∆⁄s-kÒü2G&5¢n4≠å±tí‡Ä≠â∂Ù©
Ê1&”ezÈ´`8è∂–XzÈá0ì∂öËça}xî!^lµÖ&‚:!€^„Á]¿∂)“ö,ƒ˛zãºΩÇæ&ˆÂF`g≠⁄€0Vó¡ñÂpYò≈\®’`ñ^Âk)™¨ñÙ⁄#T⁄⁄˚7=´TÇTñ«*›¿õmw	¥›ÂBº∂7X i∂ùI°¨ã;:{;@Âi±èmÿ∞…7`è∏K≈d¥5É·ÂU¶J:§e‡Ù£\Qá–r *@bC•’*∏Jp£¬Î˙˜Å◊ˆ„‡U¿ [nö_‚}œùÃ°ÂØ~ÚÉÅ„◊ä`Î>â££∞?[ˆ1⁄.˙#˜Ãhﬁs”ª<i•Ã√Ã!∫Xk"LòÙEgn4Ä	˝ÍÓ¿8 !S‹nW 1˛£B∆.Zì≈Øâ7•1€˜M„ ΩÎÑÆG$§˛“û*ÍFIçñµ~∑≈›»s¶üB+W≈ap„Ó9¿æbtÏveç¨ŸH5©Ë ÎCÔË]j€>÷‰vÂÔW≠´ç´7Ê÷,‚ÔªˇÍ|ÛÙ[^ƒg~ –VA‡±“Å˙á∞‹ÉÑâ‹î,f”√„Áä˚LoëV”&º±Rˇ§˚ùÑ±ÿÀz∑R·⁄kkAÉ÷û}Fp[MÛ[€¢ˇö≥Ëˆıƒ‰yÀB OËçàëŸØ∫”†x<cÁS/éË€Â÷æ~ÏÕ,Ω_©=+Æ⁄˙ªÿ7F∫^Zi#,õÀ„©Ú6Å—≈3g‰©"ï÷´Ÿ∑úf•∑–ΩÍÊñ˚÷£22m$¶§µÍk'ºTõˇ∑Jöçñû‡>˝Xˆ…∂∫à6m{7CSa0bxŒÒ¨z‡ﬂµ:Ìùuæ≈8ñ_≥ÌÇkaSXËdÊΩ{≥—‹¯Qã|N·™\≠Ø]mXõZjUÚõzÃ™º[M¨âE0PÛÁqMJÇäçcÇô-È:ùµàöúòüÔôá!Ø^5≈¬XLf#€<L∆
Ω,jzM˛¡ËR†rÍIºÍg≥:ı∑ûåJ;Â=ÉS+ìcßb∆ãœ4(¬_fÎè…›£–ç’Í»
»s≠iQ◊›hÀ9?˛∑ﬂ†4~ªÔÜëã“◊ìÓ—éÁ‹9‰∆€Ô/±÷Êá}º9¬E˙2π’6E-QÃK˘N⁄WU@~¢XóB*ChãI–}áæT~‡å‘óÛÈh>XâúÓ}Ã¨ÆIØm“\?≥ÔA>¶M£`,.eßp∆Ÿ5
øŒÕÿ”Ì˘À†dS˜ô+ÿ# 5∑⁄\!k5¶Û¥Ø¥/™K≠59˜_“@ICS]—N˙MΩâI;≤Y4ÚΩmiXßÕQ∞b≥¬Xu4ª°;Úb»ﬁ¥ß,e™∆Ä €∫›§§ã∑p8GPsKYìÔï¥<v˝∑´ZF˜pß/@iÕ∆F˛pEî˘ˇèˇõé_ä5-=eÌ·YeU⁄7cÎMÉ(Î‹µïy NÇSî¶⁄PÎzËçùò0McÁ&ˆæz±£+r1∞ıAëG⁄”bÁ˚’ˇ ª4e'··«<=701!˘è’ÃÊïq1êÿ»%°WYÍK˙≠éŸOù√ ”Ä∫@¿a
|∫µ˘q›∏s *~Sœ ~Ôa∫_ãÉ Ø	1≠ÿjH¯ß˝¸öz¬‚¥ôvCπ4à_SH™{^à˜G‰7õ$(O€[k êÕß‰Áƒu9Ih\eapmäZRõÎ-5fgà„;≤ÎDcck¬ü¬ÿIaé7Û§pV_ä,ã«å "MtïU∂®òdäI˝jZkÃæ’7¸∞ú=#‘˝)TkÖ›Ω‚J;ÛØ†„∑‚hFñçÅÿ¸É(a≠˝ﬂ
3E∑H_8´GÖ›õ¬J `òáÁ'P\™(&Z÷Ø*√Jr∆ ,’ÂsªÙ∆›RŒ¨˜¯aÈ”˛ôT>∫ÓHÏ8û3cK»bCá¡µäÒñhC«rÉÙ÷P	ı›‡•Ïñ–e∫Hpa“∂@Ä?Û¯ﬂ.”lÇìfsP°E£`t61uoD√íKËºK.Ôv‰Nù…ÃÛqw¯T“å¢,ì»ú‹ç0ëq¬»õ5åÉ.Zx
ä¸◊à‡ﬂF[∑î‰õÑG7ôyOövß¶|ΩÑÑåùÈ»wwÊ˛Õt`Ásãf´≈ﬂí‰càMo5óãú¢˛≥)ìô∂°•æX^”¿Ò–r¬`çh‹V1ÚŸôÕ#R5l∆¬Ï¢ïÁ4W[ò¸%ê—d‰ú¸”πâÁﬁí6ú„T°∏T†ã%Õ
dÂ%,.I≈rNÙ˘i'

UﬂŸÂ'4,bù’èÇÓVæKÇV˘ıo{ù_{ï˜Ø©F8—⁄,’∆Zì7≤÷|D+˝œ›ﬁo‘ëÆÚû˙cÊÖﬂÀÁ5ìÎN$¡±Hó˘XPﬁÇ˘íê,Í˝»Ú™[Yl◊R$±2Ã°®Ú>Ûh…ß.N7Ω·[‘ü-’‰	,>FÙ!Ù^˙±T#B_yüjÚ∂NüìYièñjìÛª|ÿ˘ÃWﬁK?ñj‰–Ò¶”;ßÚûy©∑¶#‚í¶Kº)t«WÒÆÁ:·p\Ãä$)ô|˜
•ÃÃ‘Zmì:ÂËΩ£TV“jfv„{õ"÷õŒ¨3ÃRéΩ€˙§I»«ÅXeª≤ã<‚J£—∞:Y	Á^\ßˇuÓ⁄ê¢Õ∑7©ˆ è…ôè·Ò≥P§<[K*
Ê»ùxTÖ[¬ˇQceæy}NoÎØ˛]¬õÏ∫jPìú~R%ß]?&∫“Øh◊,!IÔbzÕZV9ÃåıpHDõ√¿˜ù"f∏xC}›Z3˚+≤.0_∂ïkéCçÄ^¸ΩÂ∂ﬂ¨.e5ƒ@ùa;'bñ<~h`NG∂ƒ¡Ì{Ç§øy°Ã{ô RîŸ\∂∆∆ ÂöB6‚À≈ﬂ◊÷÷[∂eJz»√‚√∞ƒpÏo¡∑¸– ÕPãæ.‡B]Œu!	{≠˘T9Cú'L®È:ÓõÀ¬ÓqòÓh;/\ä}Ãb8[kﬁÙÜaΩ—Ç÷Ú¬6ì"…8∏æˆ]¸–Ò≠¡PÏcçŒƒœª’xú
bo9W£ïÕ†hvj7ï!æå∂7Á@˘sœÃ#˚ÊŸ˚‹ ∫{©æÒ.É∏π µ?jd‚|C⁄“j3ˇw§Ò√á≥∆Üì 9?j<åÙ∂7Ÿxrníxƒ”útèm∆	ù^nAG{uÒrãÔ7R`@◊MÉ¢	¶ô>ΩÃÄﬁÂ Òeë47<é~<V¢©>˛¥àŸàã~‡r†Ÿ€&åT~‹0z4P‡á‚èéñ\8ÁÃ‹ıÑ˝©qÂ˝/ÛâÔåãu9à3˜*’≈=Á XWüKıÙî8›dº˝c"x
ù!¯øòÕÂòÕw0èÁc4ı¸8$rCÑnˇﬂµ>ÎMb∑¬Æ°é¨ÔÜ3ÁXÔ?‘ Ö_4"M;-¸D˛=)É‚sÛI¯ã$îa˙qEÊ”kÚãsÎ~¯¬¸aâSÏxæ‰˜√§Û«Ò∑4 T ù7U3¯µ*œÖb®yßôÈJ~9˘ù‚L,pÚ∆nP{„Ö£ÚFﬁWL˝é/≈ñ3ã7$5√òlì‚£WcÒ]Ù«
Ò∫⁄ÕÏ¶^ˆÌ¯√πOÉ%"z	!’ÀÒ&s™≤ãËÜN|éªAo˜¶u‘äÒ∫ÓÄñÿÖ˝™÷ﬁ∂≠FSj¿)y
ÌÚßÚ≈0Ü§√√‡∂|á^Ù—V»?	ÒFΩ¯;Çtπı-U©Ò˛%~«˙yÓú»õVjoÕYò‘A	Œåq3πHo4è„;tÒM©¥Õ(”gÃ{Ï‚ïD€dDQº;¡kpWﬁt$ÚP∆ç!∑Èé(∑%zœ0—_√Sﬁy£˚·{”w‘õπÙ LyPπãA)⁄à∞~á^Zù[mãË!ìÖfœ;wp‘Ë2î∏ö›û0iéÒ|ËV´—|≤B¬¬É+>l…ﬂÜxiÍoL∆‹¡'ÏPóº“Ω®èâ«–ÎãªíŸi‡ï=f0(’øÊéå≥û>∞˘@aüö%öZ¨–bÖ0¡QN\‰U ”IÑ‰o%∏àè®.Cj	∏é∆¡‹a®∑‘≥vŒa{dê;DﬂhÎÁñxtãb'û„m/⁄ëãCê≠¯	™ílacÙéº˜é$ªØ \U«¿hèîkíwéÍ,(ªwtáW‘;ëﬁTvKo}â@Òv–AÔ\Ô"·r„êõÒ∞KzQÓë3ªØ.°3Î+Ï5w©î;Vmüw±9√{˙°°g…ÓyM»ëdŸÿ–’≥Î>Ó»M∑À> "~P¬ÅAÑ¸É¥)bh 9wEX∂pK[]ob…^+,‡Vé0√©ºbëﬁ÷ànÒ…g«üá…eüwÒ®ò’’ÂädÇNLºã2ÆLÏ≥úC˚îukj?è[Ñpn†PtÿGr≤dÃã‰E$aª2çÂ˙±àV<Ò1ó»t–?‹ﬂ˚¥FZ[¸Êk“9;ÔëÉNœ‚™Ø‘®õüD)ê+’ZòC2¡4»˜{ä<^í÷¢ÃbÊ≈⁄ã…9A WöR‡ªN¡ò$·u…#ª\Ü˝VπîZÆP™-LANz˝£N¿%ì£πq>!„”˘lJùXˆë6»õ“PsÑ[í)X\Ô:¿≠êêπÏµxΩ—L#‚¯£WM›œöø@Ãà◊«Íó«˙◊xH√ÁæEÅ€<§∫˝-*áBÒ{±q‡{7∏Ÿ˘ô∏>Õhz»nO√˛”RrGØ†s'‘∫1¬XSoÍïÌ∑D„Á›˛ù+º˝[÷+∆öÙå{É8Z©Wyd⁄ Õ®Øj»ÛîlŸ<ºr›î˘Ôã4À!*>g=ÉOi\bæPÂçûhÃ†$Ü/z0ï|AÜ”®]Q∏•^Œr∫‘ÈùtéóÅ®e ‰”•Åπ|Æ"¸∑x¢I8Ø2À„O˚áÁù≥%Á˘ÉA4%©èVêd]ÃÕÁ¬˝@íÃ⁄T˝1C5”t\RÖ⁄öõümOÍñ–˛Ô∂0]é‹Àå‘|CJí#ÿ•ªc◊‰ó<$˜£Sé( œ∏*≥ß≈Zï…€•ÙèaO	Î*eÛ IB¶Duê©`§8ërrB:ÌÓN[Gcu¿ÚY4C¯n¬@Ñ˝˙ë»~äπ9˝˙ª¿>ˇﬂˇı˛?Dxènñµ<À∫,∑RzØøÇ÷ç™vqÁM¬1?T˜Òl¸≈ﬂ[Õ¡õÕ:AÕí>òòööÜéÔˆbTnT+ﬁ®ﬁ›´‘ñ‚2ë'‡≠Ê˙@Å{˜œ?!MOPé; z—Y÷ø3OÛw˜j>∞ƒıgZ„?∏?®,*íËÓ`0≈Gó‚j~	êˆ¶VhH÷ÊWjì,}=Ÿëx" á—˛ @…Û≤H:+ØloëD‰ {ù„Ê¢z†∞Dü√S~Â©Ê≤2˝ø≠Ç/&oa$êŸ|≈Ñƒ¯>[Íë≈Ó§L˝kíì«x3£OoSKíoQ)œ≠R^ı·ÍBÍäôR-?
œ?ø G8•∏4Ωû∆≥˝É˝„ÓÒ'öÍø° ¿ÏØ≠¿ﬁ ’'®ÆÅÇ økÙSZ	≥^‡Èò›Út>5jHŸí[U^2¯ÏJ:g”˛lPgJlyxﬁìÒ3¬Áå‡â9‹5‰pu3I∆ˆ=ÇŸ]6<êœÌ{sæT˚na|ü÷úı93∏¶˝ILº…™õº¬t¢&<ÕwÈcŸ¥€RÆ∑¯#vW…Äg!¶v›ë7√√‡¶9˚>÷›ˆ_÷]•õ?ûÖË/â˜è∑'%Yº{ùıœX¯ ~ÿê≈êÂ≠>ü!‘∞¥‘CY'MﬁhÖîÃp®F^Ñ…ÙF€≤”Ê∂‰¥	[®øIú6ÀvíÔNj¿4ﬁ1îïe#ª^Rö°$ò’(Å-˜"m%b±[º‚4àë¢∑–EÚ.`∑*÷73◊¬îZå“xUK®⁄È˜›ÌÙ>Wﬁ'_ã.Ü.hÚSÁónÂ=˛}dCüœ˚ù„Oï˜ÏﬂG6ˆqøÚ˛<≤ôùnÁ◊˘•”ÎTﬁßﬂŸË…È˛Yß◊•—–Ô•èÎ˛aÁ¯(˚Ú»Ê–Øı`∑cLæ>≤…”} 9¬¡/˘æl£˜?]HpºB¬øÄ‡Ó>¸#Ì¸íó_ÚÂÇØÈTWà<»ÀLÜ¿ƒ‘P:Ó∂åç^_úÆØ?1ıI˘¨ÂñØ$Jœªˆ=[ˆ«ËUh€ÁVÆ<≠‚∞t‰i˜sÁÄv∫«O†Ñx§ÇH»Z%Yù%«ﬂŸ¸ê…≥L"‹Éè˝ÿhÆ∂Jçˇ|Ωæní<œn&ëÔ
±≠,ì%(O(máÆ„ˇy≤‹˝Ï˛“:◊*`®YY^ÿ∆ì%E%>âÖˇ9ÖÔ?ñ§˝tzr’hÚ6(ƒÚ⁄I¯@∂™˛y1ÇrGÓÉpÇD˝R0ñ{úÅ&üß˚#òl÷∑»·…'≈lÛü›Nj∫9=ÎÓtˆ∫dïà€j≈)ù ãœÛ{õofÛpÊˇÂπÙó∑xaÙª`∆ ß}w»yá~DÑÇT:1™äîø¯À€„øôVF:Kí1ÕßÈ) ˚ë7áæˇﬁöá¬lúMï,À◊≤(y‘œDÖgtÌbj(í¥≥Œ6Ã¥ï±„≥ºL€Í™ï4G>Áªß)ó‰√t}≠"â€§Â[[À‚•§ΩÏ5Á˚#/êóÏ}ÀJyJíë◊dˇÌ¯Ûîr–Ø§À∂0|æh'é§v∆Â„!6±D‡√ôß√=±Aç6æ¥øƒr“‘£∂û{Ÿ≈ŸÕ/õY?Ê˝œöV7∫ˇIÌß›vÒsÄz’ÒÛÄ@…¡íπm
ö∞‰⁄‰’ÌÈª,∑8)ﬁÂwHr‡˜ÄÀcÀ´bÁ∂r˘V—}r~æ≠∑^·ïáØîkË^¥CwrYæKÖûf~·dP_/DÌÔ>}∆åú|÷ä¡ß(ºØ+T»(⁄$‹Eì¬QÓ∏˛|B:#G∫\â)–˙ŒÄtß^¡à«Î6\hﬂJØTd^”ÇxÊ6ª{1Yı2±ÕüÊSÔ∫ÅòbRŸ≈´Ì”πUÌ‡dÓ;˘ì#®)b}hœwÅ„
´1À˜‹#úw:-™`\S-xÖŒ'ŸWF3üb˝H1Y‚Ææi‹‘Oùuè?tzùc“ÎÓùêΩ.È3˝ìP$ŸÆ∫÷∫ís‘…«v≠ç 1´ø“Ñ◊TƒÉ|eª¶≥47p„[◊ù≤zQ~*`ÈﬁÂ^Ì‡ÚÉ–“”ä®áÿz-vÓ18Ûn¥Ä∂Á¯£Äå<“gˆáSÆ‘ Uz O˚dU 4dOò÷KùÛl¯3úÈfc#w:ùõ9ûU¿KTäa˛±"Y(å‚Ï!L≈πÅΩ„Ÿí† òÄúÎ rÉ5àY|Î»˛!LÕ„˘ˆÉùs®sÒu1†QpJ¡+gäôƒ¨L–„	F3K_Ω',mÏOJ∑»ÂÏz%)ÈñûàÎµ†?å¡”‘T^F◊;)◊7ﬂúπã¶Ë∞˙ísGÌhíÔ–mg
s±ıŒ“Ã:sHÌMÏÆ¯ScØ"çV1ﬂX.#Ãõ«o o®ÿ‚ŸßáR¡'	¬Ÿ"˜WòŒ#ﬁùá®æÀ“≈°ÓÕ'ò≠RÕŒ1¿¶…ä#ëÁq¥v–ŒﬂäúìmæÎö}(L∞oä∏0U˚)«4VSåé0ÆCoDﬁI±;‚”ükÙÿπ–{}1iözvü˙
Òxñ˙÷GC”ﬁBŸÖFõX…wó√PÏ$99¶Ù(SÑs»ZéF‰Í4–V=€8Ì|ïÕ“$~I—¬Ç…»ò©•€˙&»(õ…J“+…≠ß∏HX1∫D„–õﬁ‘À(UÔlPÎM#ö"¶EmÆê∂võ@ëN°îDõœ-%•∆≈‚Œõç$ªÚ^û∆XñçùXóMÁRê@ÀåÉíãV¶à`©Væ6≥´†:›ÀπÖaù5ƒŒóù„eÙ@(ûÚ≤Î^yﬂπu¸,Q·}áÓ–ıæ∫£ù.eqÅzªeò26á-"Åok¶)Ì(Ó‡TùdΩáŒ°md2∆Ij9â˜íÿsƒRjñé√mî¢,ﬂV§¬[.ç©ÃΩùqo°üßb≈ôÔ≈’
©‘.öó%|lJ∞sy`V≥ä˝˘»øBÑPQpEî;Á(3¬Ø,*Õãdh˛•˘%hæ»Ì¨ Ú"9Ôn†ˆã©ÊËÊSR`/&BÀíüáfVPgﬂ®jÔ¸®˚±îúN%ı\≤gBºoûBT'@˙Æb'îdrIPüπ8¯aíŒx‰Õ‹k¸≈Œ
Í#`õC™ºKTë±∏C˝¥üß{ÀE¯∏</„´-«ÊÎ¨ı›ú_&wπÓçó˝∞k®Ñ^ã“«U¡%}ú SÚ‰!¿lxu¶qÕ;9TΩh†@të|˜*q Nﬂwfx"¯·w⁄Ωﬁ`w⁄Â⁄Ï7Ä•eBQ1C≤{Ÿ<æ%nD’HsSô÷⁄å.Ø-q˚c~35úˆ€“©;a±z⁄›-q}^~k“Ω‡´$ΩN∑ÃÍÛŸ„'2?{ $9>6¸§ÌJó»
ó·GÆâ“¸í¿∑õ\E®≤.%nA,∞Êﬁ¿'∆VÓæ‚t¢f\Hï»
î∫öã]1‰~õπ”»›•◊Emìk7N∏Ì}Èk∂Ër´R˜±ïπ∫ØØÚFä DªP»Z&¯aÓG*(òSuô¡Ë(ÈëöÙmwÎJœØÇ#ºœÎÀï‚∞rV˛Rz°V	Ωê≠EÌæM?îRµÕÑ™ΩÕZtUP["{€.)ö¢÷íö¢dﬁÂS(¯5˚ƒ7Ÿï6Èpó
å(=™'8BöÔf÷N≥÷Ã—Ì&nÑÏKæ¶À)πﬁwúc©DΩÂ›@uU√æS@´¬ﬂÒô˝?óöùpÇ˙NnÅ≈&@πÆ$J(Èƒ¨ê˘´ÓÙ*`œµRÈ'C”à/I›î§Ï∞£(w:‚ä§âœ|A kä‰œRYöûÿóåePÚ¥[RyíË/ıFHñJ÷_0ö‚lFöÀe\ZŒÌ9œÚåj∏ˇíÕÚÂ_óπ,ë}<˘R—˜…≠à Ü©ﬂ¢®Ò^Â‡fÒ•$∂∂‡∏D—^û?î¬,ï¸Ÿ]AÑ¨¨%*ºÃ¨:4˝"3âÛŒ7™‚=UÀ>
Å*83’÷)YÌ&ÄJØo<X⁄ÚIÌ {h?,°è¶Â„ØﬁÀ"„¢ˆcëkëTéü±5psºìfﬂAÒ∫»7¬˙¬˝ŒŒ·>^∂y÷=ﬁÌvé…yÁ¯°Y˜IïÊˇ°IzjÂù’„¡›m∂
t',oØx^Bìøeæ÷Ω¿#ÂUêçBúïs<ŸGN¨”çKŒ‹wänt©c·)’$*^OOÈRòÍoπt§ﬂ;ë3á]Ó õÿ®ÅÇÊ‹L&¬5™Í‰Bo‡å<r⁄›Â\c +ËDŒ¯ü%Éw)∞úÂcn^}ætY<ıÕÏNá®îΩ≈¢è4¶‹µ«°‰·⁄<€EÅÂ¬z÷%ü%˚9\ﬁ∂!lÕ‘„ı¢µñoﬂ(∂nË∂ç<˜æ«\Ïˆ$∆äSE‚Åˇ∏ñN√‡ŒΩy\»¡√¸∏VX,Û£ÊCnÎÎõï˜©ë‰¿vb>.c(in¯e>Òù1©ûÕJ1û+ˆ≤ú	V£‘±S
HäXú™–ÆÒTVç{œÜπë∑‘QˆF®u$táÆúbR‹@äÌä≤Ñó#Z—ó1?,a|0©iwÊ, ˇ?   ˇˇÏ}[oIñﬁ_â)hU€,ﬁti©F¢@äRìCâ‰≤»ômÇîd%YŸ¨€VVµƒ·∞l¿¬Îı0∞Xc0Ä¸Óˇû˛ûü‡8q…å»åÀâ¨*âÍf>H¨™Ã»∏û˚˘Œ¨oFW~a}B÷òVcNC4@gà9ù%cFˇKï∞Quçk‡û‚®†)A¿XırÊ≈+\ãÊëG0®¢∫ÂØZí¢ú	Ωé∞Ü}‹êá80o3YÿÏ2Éí ±â?8{›ltV\Çj–sõêœ˚»K1	fB%ôSê	VC_Aÿ3o>A8Åm8·	æ 6¡lËAAG(X‹Vò≥/ëC‚≥Ç6úâ_^åB4øEÅ'x\D'X”–	Ò7z{út¢Ky™gF’à[†‹ŸÁòπ˜B@∏Ê<fcú∂„·õO'Á√°â‹fy∏‚g‘V˜QquÀ®VÛ∞¢Úãõ“lñTæ‘≠ôó⁄${∏*&ó∞[≥î*ø 5[`»ÿ™ ltN6X˚≥A•–ﬂ›˚‘at8WfÚü¨Á˛T? uVΩXÇﬁ˘RåO}V_J^úeÈæÈw®≥|¬,-d/_E£¡ms´HÁÔäVÍlú$=“ãFºÔ"Ô„4∫ä∆Ñû–.s™®ûbŒÔÑip›r`l®ñçg:<Îz∂ù'‡NëpXAÇ”Ë∂ÂQ˙-Dn¢»ï(w¬ÅÖ≥ÿå-í·¶ø•≤VTô|ej¶Tƒ ‚T+¯∆ËR1ÒkQv¶1~¿.w‘ãö!aQØû¿H‰d§aH`ä¿8¬È'8s±Ë3Oò¡X,Á$è∆Fà ›§	e‹∞ñKIÍ%¢≈È˜YáQÛbÀ©îm¯*·TÀ%õåwV«≠î7è±xn¶ì∫â/†÷D#™-?„ñzuﬁyuÔº∫¯V2Ø.P`r˜ô∏3ünñÍü∆pÁ'˛%¯âáFÍ‚$∂¥pÁ!æÛª;ˇÎıW+åpÁ;^úÔ8¿äÇ¬˜„‡/Ä‡ˇxP∆Êùw\iÏŒ;~ÁáÎŒ;~Ág◊ùw‹Ú„‹Ω„O>Øw<ØÂ(ùfÍñª»˝äﬁÌÙè˜˘˝„eÔòŸ÷¯BÆr)®¯…K‚Z5”+~XøN/9ÍÎ¬´K˜Ëfj≤ø¸4é'ÑU”UºÁO7	]”¯pß†âÁç@‡è¸)˛P·ló÷‰eÃ…ÄäÜÕUxÂ˝LOQg<Å\6Á˙YÅDìQ©¬”˛∏ˆ2Ì@aZÑ”ÂŸı5é¢≥dr’"´K$Ö∫jÙØÂ'…Mq—">⁄3kŸ3kÂLÒ¬œ¡Nzyº¡^§” øap7"  ¿ßuXih¢K’¸’ü∫ÔHÊAË&ùN\¬t»%2Ófåó”…ptHß9∫àò0Vÿ'≈mT\√QÛ1Ùu–äR…˙[ål–V–Å€¸¥{ø‘€Éó≤?Ÿ|∏©¸…†3Ìí◊›òNO5õÓ}√Î≠2Ø!-_ﬂˇıÛ®óö]¥öKßÆÀÊœP∏GÆ6JrUr <í™ëö¸Ω◊ÕÇ£MD4;∏\%´Yío◊+Æí≤MΩ∆Q]Ûn(s Œ∫9í√Ü<sòÙí.g7Ñg|å(»∂ãÿ†‹)êÕ¡¶lÛ–’å‡5¿ÕLnø*b,^£¸≠ı~›sÔRø
õ—¬„&tw^ëgd$€t¢Í÷¸z~ˇ∂£´tÛbàzL}`ôv7{ÎÚÖ¯‘ MÚù£Å	?HGQ∑£û§ìh<iÈ/úw€¢(fC:ﬁèô„}…⁄ïEZ|b™<cIâK√y°«@EƒsΩeëªm/ËÌ#;LúO‹2õf=œ˛Y?Ú K÷–≠ (˘Xm∏ÊÄ≤uƒõ¬H{Ø≥MÎ≤ lç0Ks$vf…ÊÆ<¥´–≠Ïπú(jı$∞ªyŸ>ò÷”7;=ájk|ëõióC¶Õ™ø®ıXÄ≈ß/®úBI€ÿMÓŸ≠é∞La6Påz1’a®6ƒ‚áË–ÏÒ]oã3pfﬁ[åüΩì—˝U≠Œ‘wdbè„qtŸMÃËƒñ =óiÂãëÙÛdúRB¨=íËWT2˝!é∆ı∆…æ|C'≥ﬂ¨ÕçjÀN‹Ql'≈VHhaqÙ_î∫£ﬂø˙ÕÍ∂Ò≠i/‹NŒ∫F∂‚Òè`Jõ	∑E˜Ÿ‚ÒÔì—jïM<)Öˆôc-≈’™–Óÿ≈‰j“q2ä…ÊxöíΩ(5ŒçyQQäéΩà‘ı[À*^ìj˘…õµ%“ãN„î˜ù‘ä—’ÖµAo>ΩOO/hO¢ÛÛπ±1
ÒæÉì„˜[õ˚{Ô∑wè^æ8ˆøˆXycñ‚p2Å®=–˚ﬂ∏ªo~Ir®¢Aﬁzˆ˘ÜÏ@ùˆ7◊yÎ{qJ;> ñºYè˝f:õ4}µµ—wÿrõ=ﬂÁ>‘‡ƒ≠wMÆF`GcMŸ˘á¡˚Ãò€+:;«¥ú€!tJ£¡ï√˙¨s˛˚JÚ:ä˜ªk¿9=c≠Àåãn;Õ‘nû´’µ só‹ﬁH/;ŒÎp∏u$¨o1≥l∏¢œM»ÿü“å‡•ÉÈÖƒ«f[ﬂã+ÎM7…™≈®/Ø›ú#O{ﬁ‰vøöÉ¯›÷4Gz È¡◊¡ë6'—T≤%—MˆX„º˘6ÅON¢#1èm¥Úd=Æ:W˝û3Ejõ©©|r¨õçı…⁄„d0ö⁄ù8˝ÖHU˚aô3%Ω∆Neã	PjÑ÷2·Z^^VzaW&Y√\+’3¨\è8rt0¸$+b˜â*î#8âæ§πBÓ—ÏﬂåiŸZÁ√≥iZPòêA,tâ[4v¿æ›∆√A’π€}4ò≠ÂÓ`êÉ‚£˜§©Û‚Ú°˙ùòÒ ”ñ^%T{?K¢ﬁ·ˆ+ØÁR÷‡|`-‚´.ä≤€~ûÖpä±π∞*…
ä[Ãﬂ|Ú∞öt{¯q–FF˜,+‰{1?T«‚˛d:?ÜUu∫HıØÚòCÜ¸òI~OWJq‚à’»”eâ®˘$™bÖoòQÂMa⁄Pp!èä!˝ÈxàÈ∏œ˜¸#}=6rT˛Än›í	8Ujg±âk«—¯¨[Ø’¸∑Ú‘ï:S≠˝∑øY∆˚5#Ù¸BYñD™ÑG¥∞ÁVÀè≈üíIï◊y„a“#_ ‡–bV+ƒÿ∏«‹e‡TÚ≥∑Cï˙∆2˛Hô∞?‰õ¸±%îfMç…Ü tïÇéÌd¶úsdwD8¢–í†p¬mQ.È‡9VÑíïî’
ı#2$L•ûÑEM≠∫)!MTì_NÉ≠¢•À`#øÀº§á;P6péå¨∫4;z
°;£””y0]1B∆©Ëa:ÇƒΩª€-rœ”Ñ›>‰õX´mœ˙FŸ0◊WíÍäŸwFoás∂w_¥|ΩüÛl9ùHÂ ΩﬁÖ%@œÊXö¨Ï–ï JÿXG˚ú|(÷8o:6[÷†öÓŸtæ›iÌ@À˙hæÕ<w¸Fû◊(E%jï"1¿!˚X≈Fqu]úU3ô£¢∞ÊJ±§ﬂö„*Ÿ/eØü9U*8qÖèƒÉ®?Jz‡IY∑OßóìÑ¨8“(d]Ó!⁄/8Uı:CuîTÆ2gYXùÖ6U…¸õ5„t£dÇã»∂ L∂ˆµ.ùò›Áƒl]-¡ëg«)_~Á–¯¨Pwây,¥tìH≤ ¥7:–,®3œ≠8Ù’ª≥J!Øí^|L˚&’¬áéÏ™s¬g⁄oÒzYµµüÓ¢ .œ r/∏#à¬ı$ÌI¨∆‰x»≠;9tjQ˘e	Í±«aÛ≠Ï√-3oqO^a©‰£RºvFÅu; »Óµ«é(GîZòß	Tüˆ¥œåj¿J)wRíúÁÁ»àô&FTF?s∂âfﬂŒ}a& ÿÊœ-´]πü‘ÆÛXßﬂ	@€2.Å∑#Y´î…≤êy{Î«Œî¸bbó_ú¬’®µé»„x¯SèG—eîêz∆NãY&B)µŒøZm’Øp˛€t 3Y;Ò◊∞3Ôàƒœm°“j©Úà“àQ´r’I_t_Ÿ‘∑¸@ﬂ`d<øì“´aÔî™'ªîÕu‚íUZi>ÿx4≤)≈¶∆TËˇÄöeÙë%⁄!ÓûryFm&:MáΩ)Âﬁ√ùÓÊ⁄ :·0ölÖØÿÖ%ó\¯Åùª‹ã‹πm⁄6œàÓ‰ò´uœj/@õÈ»R[K‰R@Ω-ë¬(v∑óóóm	Â» ⁄Ÿví	¬‘("Lé¶^Û	 bEË%81M˙)–cvÏ>¡¨N≠?ï.„jŒ™⁄v§à÷∏pBºÆærR>_:	ﬂ˘Ÿñk&9ŸäJ+›ê´◊|àyPË4»Ÿë
9À>8Ì≠#~Ê2Úπªj√Öu#¬Vÿ{RC´æ˘2ÔWª˚rêN˜¢Z8»´∂÷6îÅÕº°o'–Ü¸+∞ÅÔ£põè¢nmC˘ÿÃÊÂ∞O˜C
è3¯ à]XL√◊ÅMÇ§∆LÑﬂ@iﬂK*Êßµ”∑ÅÔÈ¥œ˙∂ç¶Tä-~:	*µ$ÈdÃºI˚GéßT°a˚)Ø£ÄËk‚˜„.Ç1{ÏKÓE›‰—&ïˇ‘xx.√Rî_ıÅpÁõC,ÇY,[$é‚3z¯S?di©¿"z©Ë≥ˆ¬°û} .>XÁπÅ:´Ó/7ÚˇÏŒÛwû⁄ŸŸ¬ÓÈ™ö•,≤≥´çºP/’y˛òŒHDgiÛC:ªp|< »ÛÅ@∂”4ÄqxÒ„íâIÊ√5•@Ä,4#»quÄ„Ôf 8∆Ä|ÿ^ ,/Œ±–Êát<áqÌ¡3!œÄnl∂ê°’†ç`∆$∑SbäÅÖ`cågZºπ„œ	≤ˆ3„œ>.,n±âÃyÊ¢:ä±oXnÄ:{-ê£Ñqv ∆Å/¢ÖK	¬ò˘xX(»ﬁ8a
/Ÿ8zóeV¥E´‰//ø;àç ›{Ã=è‡dﬂ%|Cõ?¡ÇŸZRÓÆökè4Ï’,’ô√’5¿ÒøÆeS‹RA.ˇæª|è]È¢R`L)≥ƒtp¯	Ó8;BöQP¢™∆¥O6;QÆˇ®Q2vë/xã•¡≤pn˙~9%±ì„ﬂv`ÜYV˚Y°‡⁄öÄA&ô™Cˇ•<™Ã∑1a±•‚*ùüŸ‚=»‡ÔÃHQNv2§Â:v°å„Ê¡·—‡ö·” “WåNs*∂)‰ìJ!käÃïŒ°≤µ
ãŸ∆0AÓôN(áãô^†öBcÌtIñ˚≥∏$igöS¨ÿ¬h‘Ô5?›Fmâ—[7ŸÆ-Ñ¿ò0eÒ¿∫öBÙÏÇÒÇ·≥™ÜæU|´ˆV-ËÕãcUìŸïÎjµŒ'ÍæÀã@Œ{◊·w◊ÒtB)π·⁄.3≥˛’<3Ò6;¢7ÖO¶èõ±ì}ÀCf|a2º ˜òqpÂ@, ∏3√@Î;he¶È)g≠≠cßl>Ir¶◊Yg&`ó4πŒEä˙dïŒDyö*Æ™÷Î,NóZÜ†)1˚≤j/Œ‚|˛—ºZb!˚≥w—‚üﬁ>yÙ”«w‰S/˚¸>w≈ùVó›“}óªèU‹?gJb—á£ÂÌï…_pæ°â^>%–@#áÉˆÙ¥€ê*tÂ…Ú.≤Bä• h.=äâwóÁËo}iÆ∞DC “∫*~ﬂô≥îŸ‹IK¢R∏¢VmE„©U{∂%…`#IC±2&êá·Ë¸.D¢ëïæ%¿”Æa‹:ö
a§ŒTÍWEí≈/c& ùcf`§`éÇ
àÌpy„˚ù(êﬁ¯~À—ı ë2mYCvßﬂ»è=0ÔÏÁÙl<Ïı(qPŸ€≤ƒÈ‰™«¯Ô‚”Àdr Zm≥GÈﬁÜ €·Ù¨[3Kø8s[<miÄè¢*.{Ì™"◊Ω¢T}õûº˙5`∂úãOK¨=éHnê vb‚©‘ˇ–Òd¶)v"RêÒÔ]ÀŒ-O$`Î “]®i∆™öõ©≈(ÈBÆ‹fU+.I¥í,w¨E,Æ√Î_ˆÉì„⁄¨@;_dC∞éóvDf˛\€¡œ√úâwU›YHk0´E¿π«EáLHZ[U†0±ZÆf≥Ú cáeŸGÎ™ÏnÜÁ¬àgÅÈ"∂_&99N¥.{Ä€%ñù>kJ >!¿Ÿ~ñ≤Á∏ÀÈı`ï¡Ö¡+Ékˇ√4«n‹QˇõyË·|" ⁄.QÑw \‘.wﬂå˘k ·ßóp<Ø∏Ωﬁ[¨∆ˆ›Wê…‰:Öí‹y`1@¨7®r¯V-πî7ñ3óc9À<∫(‡◊Fpd¨‹\(éÔ‘˘”x‡Bú85€«!yÌ≈ì‰2À˛!u±á›ñ“'“å„⁄nW»Œ£"¿ƒ∆î≤ ‹–ÖºÜmò<+úy{Ó8\ΩxB∑	–ä†*”ß≥^ûîet"¸IiBåB7‘ûˆOıÜRˆ`k¸÷væ‘y†=è«/ÿd–)Yû_Û/RG~%Á§.ü^NgΩ)=/ıÀ‡†m•›Z"q∑\F)πåœí^≠—,)L9ÉRóÌÔèè6˜€Ø^’‹=%•Ÿ™Ω‹{πøªˇ=9<ˆ>˝ç∂p˛^ì“J◊^EIJÂí7V8äHùÖ‹7ºow3ö˜(—R◊Çü_:«ßTô∞Ø ¸Zm˙U$˚Nº{‡*;Øè∆ÒO<Ë’7 ˜·f7`)!íÏ¥‡/ﬂÕÚÙ∑‘…Ú=§ü˜ñæ]|Ágº•œ∞˚¡õÜÛH[Å.‡≤¨ﬁjY∆Œ%¢∏‚˛nJUm“û^\P!Ä6õí›dd …/£5(œ5Êπ«˝â'fı∫nf«Œ•}Nﬁ÷J<π∂ı1L|ôL°f!|€û(£éÑáæŸJË£Ñ%ı†h|'ìyÏz‡j—W´ŸbÙ¡,Îãu Î’Nˆ~5´ã~‹„‰ÓŒ¢nX7„è‹6Iz	Ìø·«Ë“Ÿ£èÉO≥•ÛÜ√˚4¸b!Ûyªæx]úUá_h¥yÕ,çôM")46ÉTWI2…Á<D@ÅÎ3	)pÕEPQ™&¨»Aá, ´gZ‡Úèœ º(C™*¿(MT]ˇDTf‡B
4pÂBM~û0œUío‡öI∆Å´¢úóG÷a∑¯É√Ñ5OÔ‰ÇP…≤ÌÌ~If#_7ƒ‰q+π1≥RÃûhvsD√≠¢˘=O)e∆óùïæ7∏∞Z·Ú&La¥œió=Î·Wd‡zOÜùX1˘Ã`ﬂrb@¿U4 ç¢´~<ò–>táé:ÅÊ`ÕÏW3S±O©S;[≤(Ûja>Õ•†˝ÚÙ3¥≠ŸÈ´–1^l∂wj«”¿≠Å*—Å…$∂f÷=ß”πe˛ñ‹ (ø,  $¢»©®À:Öˆº ÚêK,ÎOÃn;±PÖ|uú;1°ÓìÂCBë?}¥ªµπΩ´∂«øY4Õ s∏€á°ùê–)Ê¯⁄ıΩÓ4ù¶Z~ñfi8åY6óê÷æ@ºŒÜΩ&df®ÖÏ”zûeßf≠BÁëÎèÀëÚ)OÏÎV˙(€Ï•ê÷$O1ÀY˘Îüˇ˘…å%√Í≠êΩ^ËˇR˙rç”G^+F4†Ç∞ÆI∏4§AÓ2¿ÿGrÏ∂s3_„Ò≤‰4o¢À˛tLßcktπL∂¶ùÑ¥#zW:l¯^Z‚1›\„}âç‡E7cp∞ﬁºÏ˚ÄÀ€‡7YÃ¿J‰¡Zü3…©«*‘G«qîBL∂≤[!A6Ó óz»n0ï-_≥áUbWû¨›Ò—óøÂÙdît£À%r	dDÄw&Ét√saAaëÓ
|∫¢Íﬁ|ÏÊ·€÷,X9^+®Æg2LËØ¸Œ∂}EiCrF∏èÄú'qØ„r√îcÄiïæ‘…Î‚úX&~Ôôª‡J©T°RôHÁãn÷WAù`œUaôJ±§t
∏$'dû+±Ú[éóıa¥∏J—±ˇ*Ò
Ñ°å‡{∫ﬁø≥π≤˘˙˝˚ŒﬁÕù'˝h0çzåª=¿†˛hR/∞Z>π|ª∑\ÖÙNÊ-cù
é»;}r[j∑oP=B;0]Ëh)Xpv7@Ä9:òÈ®ÇÁjÃ*Ê”ã˚£kZµçfS.–“lb47∏ÆπSb˜ÿ˝5ç>åp´ùbŒ`˙wÜª˚•B⁄∏—ˇ‰x\jΩ√bÇ≤Ò-·$Aß∑oÿ!§€◊üÚ Ôq)∞pM:åñl7gfØ´»ˆæ8„#‹ñv8NN#–míhë‡´ÌÑa=˜ı√±¨–ƒ˚Ù¸]B'eQ±Kú#Sƒ≥E6>2Ö)Ò"ycUÓËa;≈˘Æ¿#1\2àOwπ∑D±vˇ-_œDrM?ﬂtsNæ√ù¡≥Õ90Œ9∞N,Ûƒ≥Oa°|r9(éá"L
UΩ’‹ÏàÂd8ÛëÖÈ 8n¸ÂºZÑ`HÎDÍª€G.s∆ÍäÕ•0—«M'4„©«@UdﬂåËUº¿ƒ*ÔQ
≤r ˛ÜZ8g ›˛–ç„ûÇ¶q∆Ä'«º 8R‘–ØØÀ’ˆ6¢á;Œb÷:≥±Ω#oøiµöY∂|ì>}%É&èöy◊ ‚ç™∑'îO∏o_DVÜåU3
^D?&T‘4£Ùãû›;‹úà†DÁc±⁄{√…pÏ•ÖXC\5/CãÎı¢q;π¿-:√.Lñ-\¿a§É-ÑK¿¬)‡BJüe∂¬ÄñŸ6Y§2»58˙Ó¿º=ıi^´9hqÓ‚;≈¿ªä
ÊMbàPﬂgkRáﬁ—V§)øíÕ£tûPüa∞◊êêl±Z0ó∏g8ætãçu„+WBˇ§Îﬁû õ©ﬁ.ù4Lc(K)fÕŒ§·˙µoªÜÀ©ÓsÜzÑ_'=îGPó;™_ø,Z2óñYÀmÊé„aö™¨QgÏïπ"o∑¿3VyK¯¢æVwÃë‹1«;Ê∏XÊ»(À6√ﬁÔG§æè”§€‡<íäÉ…∞OπZ˙%ŸÂãn|v˘"üı‚≈ÒK%ÜÌ◊∆1—:Á8é:ÉﬁU0EÊKÏÙòekd2íÏ—O„®Î˜´¡41¸Lt…˛≥’Pg©œ"û˚Í¸øõˆ{QWâ±üá”†b®6Z¿_ºxè#Uæ]àè=«©0Ö$P’®Œl1Â∫ﬂ]ä°a0v~7˚|Ñ…;Qr¢‰,Á='_WB‚ŒÙt:∏ÄhıΩXÄ‡ê˙¡H œ9ÊfÊƒƒØÀ„W‹§¯@ïíâÉó°Ÿ Õ∆!Ùuái<Ä27ªù@£Üˆöúu„¥¿£ΩUS’óyîp≠ÒÌ¯î·ûü”∂)wÜœ≤ {ëá.÷;(∫ﬂQ“wOé7˜øá†ÔsıNæ@•qí?˝	aìË»)˙px¸}ÛË‡wÕ{◊j37p’’ı@Ù]ÙíLz±Õ1´4… ‹Í˜5pÉÀ›P˛Bc‡ræ«≥£ÖF Wæ•-ªÔ1J4.˘∆Ü'’}˛\˝€¢ïõ
’ß|o«ÁãÃ’>õhP‘}Ûº¥Rj'ÚÜæ>P2◊O<}.∑wf_Çi≤‚%|5rÔ∫ÿzZ§VÛºﬁmÁsX¯Úí’ò?æê·~◊íR:á@©[èNW=IEÎõå˛πœ°µ`¡´R.x˚Ä	X‰+‚{*DœÉ ﬁv¸d¸M¡‘@Äàzv:gi‚(N˙ßîÁ«“7√„éGΩ
πgÔp—qÎïP+¥QÑSn‚ErñÙ‡˘Ÿõ:f§)xæÌß,8¯…¡KÒmç¯Á‘ß◊ÛjÌåØVÕF√(ówM©MS¢JÓ˛Q
W]4#∞TÄ˘pΩh>‰øhyû¨r√ºı-˛ûG≥È[Ûâ´sRﬁÁÙ$2.ˆBTÚŒ‘=™ÂDÈÁ˙…`2ΩÑÊ¡„’∑¡µ‡ÅhÕïDy∏Ö¶õ≤pÒﬂ«ÉŒ≤Æ˜∆q'ôL« ¢#öÙ‚¥tK∞/´,ˆZì6›Ωc˚oôZ‰óºÄÙ	 Y≠ú4˙Ö$í+d˚–ø Ù Uhùª˛*kØ §J%Ÿc&ˇ“ı∏›·vEnnë\%"@B®"C'≤ø˝¿ÓyÁóS⁄ÛI˙ád“≠◊æ?:89|øø˘ÊeÉø©åBip3¨ﬁ⁄HÕÀ ¥}∞Æ
j®≥ó{õÌ≠É˝˘ıS∂7œûÚ6ﬂ˝˝<˙©∂‹Kﬂª±èzgx∆Œ˝_öÚŒzv≠Ú.LùﬁµŒú{‰S îEÒ+≥æ√åΩü£°@◊¯Û©	00(c}Æòú®]∂"Ã;¬:§Õ[Âòπ=.›4 o €$∫µÇw>ƒ^büì∆§€T“b¸˙äM3©§4TS™(ŒuS<#Sˆ›¬tÔZ˛∞`ì“LÆã≤≤2ÉÎBÍDNœÖÓ©P]Gè]È √ôs¢?É √ÚÃz'Ùù√¯Ç™;	úYVŒ
Ÿ›?5H≥YE[®J1ÍD÷{ø¢ÉË=”-rs¶P)Ñ&±"uã˙ˆ·í‘&ñ'@¨u◊ÊGYDü=∆∫‚≈.·`=Ø„Œ d–W«˝QèNB‹ûˆ˚TÌçER6˝∫
ö…ázäGÔÔ]”ÁÖ5;3∫~–Ñ`ÌLÊ6‡í¸!ÚÛø˚Ô§ù§¿•≈Á8öº`±gWª€G0
Jk˚Q¬Peo¯„ŸåÕ@∞m≠˛z:àR^Ä^=/d{x{Ïÿb\aL“ÏP®Aÿ3üWL±|?GxÕç …KÌ∫C&àË…º†ÃW∑CÈOÙUîÈ%iI`.Ós’|™;ôKï0m2M…oÿp7w∑q¯Y˝tîæâFtGì∑ÙTQyöÖÅøÉ/L‡_¸ñCÜ™Í˙€wøÂÈYGrì∑èi¢J⁄Ãı¶' Ä
2:Î 1á`•ú	òîzgô÷>õHôE8AYRÄ¨Ñ”5ı7–ÈÅ≤s˚‹ﬂzfHl]∏ò™òM8Lˆ;<Ëä˛Ã≠X÷ù%π8oﬂ-ïñdï†ñªíe&F†ô2á=Z`	oﬂ5(≈ÎL©v_èñ»)[ƒà|KNEÑŸ2Å¢8‡e6æÂ—4Ì÷˝*∞±}Z»∑œ»õh“•ËS}uâÓﬁA“dC√!æ†Ó«TÄêÉS–&π=-≠g}’ü.∆Xó∆È£ÇIÈ¨èŸ©ÓÂ?„\ú˘…ı≠~#:‡ÜF6œÈs›ıâa°APÄ€!ROA&Rl±Ÿh≤ÁRô(ãΩ¢RD∂=¬©a
Ê:àãx“Ü?ßΩ¯’pÃGQÔ,e·EK‰<DÉ≥÷ã1à$B .—O{3#¡c:éﬂ≥®Œ¶¯ñÌãCÏ˘ Êw*
Á¢£˙‡;8ºº˛˙Á˘˜‰-}Í
Iıπe®¡Dµõw‰Z0î:Ækç€–”±O≈˘ƒx0Cè”ü∏\ôL¬$cœPÿ)ÚÜ˙k.pëW‘≠PhNJç˙åjGd&ø¸Œ*÷Q√m~o|◊,∆ˇ¸ÂÊ¶gt(. ◊ÉºBHcRÉßÎ’¸¸‹m≈µ¥]*3–∑ï¥–®◊€é«√èªL®‡Fw.´úÊ'ûÖ&Ï‰üfaó^ ïØO©'œK_—!ü%#0ÏÛ»0˜ÜBÒ3ﬂAÏóÌçM2}◊‡ØL”[VÚ˝ë•Y∞~9òëMºï˛ãKùıÃﬂ‰chH63òˆzŒrè:(«ÔYÚ≤Hv‰Pª%^!yÙzCJ¬(Ÿ>ä°¢)xÃí˛Öº°ÕÏÜzﬁÛ%µ/KÊGº|ÃÂbùôÁÔR,MıµÁå°x1E†ã_å£úçÊdÿ<ìÛÒ∞üŸ\x˛OI‘é¡—ÕæÅ< ˝aı]◊Õø˜Kò‰YÅè˛KkÕ‹≥aè§˝˚õ“¯[+≤Ò#%,…˘UÛ4û|å„CRøOFßPUÑwÔTÔÁ˙™ªNà£C•Í~$YÛB@Ö@%¸G´ 'Áp˝ìZ¿'v<}1L©»∏Z_ΩÒß≤ß|~Í@ê‹{CaÉ’¨∞A)…çõ{JœÈ%rï˝‡êCïõÜ0ü#ı&Vêwo˜Ai¥äø£òﬂÚµ˘ïŸL%≈¿Ñ≥ tÃ≤^üR≈_£,UH˜Û.iG—ÑÏ®ˇ4ùå!J´¯∆Ò0çE∆+}o8J7Rm√l.——∆]8÷:rËËeFûÏmÓ2·¡ïÑ¯umd-d’óùuª¥∏rŸ˘R	;øÇkbÁÁ√‡À‹ÎSbüô/NoV[ï()EAEK¡ZÂ‘Ü9fä*-W5ıÅµú"Ø` yÅTä>Ü∞&en´häNTPXòlv/é¿¬•2ˆOÕ˚î≥C	‡úΩ?RÎﬂÊ¨Œ¿Ò•œ<#ªåmXxb©úp^◊»,´¨—ûÖ"QÛo‡˘˘_ˇ"X.aﬁ8RGmº∆_ØWªˇÎ R›®wÆ)v˛Ÿ∆0ŒY!ÎhÀ Z⁄¿æR¢•è·H¥2íeèÓπ/iˇ¯∏L’†„√’˘R3˙¢iñ†WWˇf!» /˙<F¨ÙcD¡’ˆw…ﬂM)Õ¢;3ö∏J©em÷BM≥uPÕÛè–
r±]π°¬ËÚ™Blâ;√©·~ù4”sr¶xÊ€∂∂¡˝tá…‡«®¥∑äUT!éÕ£Ú0™ÕMÆqá©=®ÆT‘On√≤(ıÀ”ûv¢nñ ¥ÄÖQôPKs3ü˜Øaaòﬁn\A^∑y2hˇX˘z§U‚Zµ5o∞±Õ{ÜU≤< ˜hDV—ex≥¬WºË"©Z}6/ª…∏˙¢_0¨˙Ωk›∫.É ãTÇEÍbK≤aÿÍ[!—–ãoæÅXƒì˝Õ6˘ÎüˇÀrÂ≤)ÉûÁn¡[„8∫§rF«y(1B∏.∫Vñ≈qáªˇzÒ‡b“≈[ûly≥8≥óﬂ\_Ùî*Ìñ8∞√ =∆⁄„EuÔ˘œ‰(ÅhêÅÇ'Ê˙8_F…§dn6û“\2/XO˘ÒEõlëk{ìÂ‚JaËÀÿ[Ì{LTmvõPVŒ{Tß∏jF”…0«0ï¯‡ÚNã&bﬂ-ëh∑Û) Ëå˜≠≠∞ˆ&-à^ZM˚?ôKÔStSﬁ2õcn]™ÑÛW„æ©¸~øÉG}îVã3?âfØúV≈97Î†çØ“≠+¶›∂,Å]ì€8€7¯˝¬F@û‹≥Q ∏¶√˚÷â”≥q¬≠–b≥⁄«7Å 
"Nk8Áú0⁄›]£1Í|JÜ„‰"DΩMfHRº["∆Õﬁzflv¥.Pè™zœ*M|ËÌ∏£
)´ÁÕx–Rƒ˛Êø≠Y∂¡⁄wéªIzúÙc°%`I∫Ëwq˚À√Ω¶ÉóÒ~ÕP¬*)Ó]î
ﬂ∑¡TA*Ã∆IÛl ¨U⁄<d72∞ÒŒπñ«∏Ä\kD`4ŒrF≤E)ym≈Ωi?õÍEœ^»Úî’≠|ÊúõçiÑ˜ƒy1kc⁄.W]^L-S«≈ËÇÄ∞z~9˚¡¥1xÁ¶óö4˝Ú„T·ö«¿e
¢Å7c
ôŒ7î¡õ Á+Wj˜p∏£õÕ.†n˛¶¿¸¡åT·˘ÏuGÒôC$3à(◊8BQôΩ¨PÈÎ§3U!k¥r ¬*F7>,pU?Ω/.L∞ l&K ïí%¡K5Sß›1ùÎ& ◊j24oög’j1>ïQ òÏÚ„Yç«/èˆˆ_Óµw…ﬁK"≤w»·—¡/˜®àëm<ëÎÅ A£pÎ®∞°êv˜A†á\¡ é+‹4K˜	Ì±=i»3=–(ãsX2A<–v*!o¢tzπ≤}ËÓNiı˝ÀOÔ}”≤r¸=sÎ0<Ö'∏3XÓW>D™n®ûrﬁÎ∏ìLq°∫J˛46HXiCQËÜÙaÂ»eLéíèÙ¶	9ä£ù7àgÕü˚&Íè~õ¡¶–h£ÀÛ8ZàôZ G‡˛xÅ4·ö<®£ù*¯ûéÊºüpÖ‚|ﬂ7>gXãåŒ∞}8ùpy∞:·*≤éæDÈT’FüûòÔÄ5hÚèNÈœ˝SÑ}“Ï*Ë]‘ò[G1üvV*„0£E∫LË9=û)©]˝òAûÊÙë1=_(·”ïÓCMsﬁ˛≥Ì£É√ÌÉ?Ïìì˝„ì=*Ìºﬁ›	ËÕÓæyàpÆê√Õ£ˆÓÊÎÜ◊πvçQ3ÛÑÍcQ2|!d≥h5⁄˚*ÑñÍß˛ÏeS˚·™◊‡›9π~√éVﬂ!ó>5p:√Ô™sÖæñD)âWç¸{⁄Æ·nˆ∂ÚÕÊ∂∏“J\÷i˙ûQIØÃ~∆5´ÕQA.Á/`¿˙0§¬Ø6ö<≤T_ ¶Ú«ú≠˚ä*0˘µØx˙?PÅµçû˝\˛JÒg{gˆyÒaÔ-9≈¢*Ür$»±ﬁ±“O!T;Yjıt´∞}8Õ{ﬂ~±Ûr˚‰ıÀˆ[ÛI™’ﬁ—„oÀ ,ˇ23sâ∫ ‡Õ? bfA|v*\h¿Ñ≤U‚îv%C ˙~\&ƒO™4¡2ˇd¯pydö°ˇ€„ ﬁ˚ƒ¡¢âßnHÑ_‡YØeëˇ(DÅ
'Æ˝±–3&ï∑Êù‡âïR'9≥<0´CÊnC;OQºΩz—∫G≤∏ËÄhé“∏!ÌÀ∏â…ö{‘¢´∏’’ù_E–nâOcêÙgØØTXÆŸäk√≈(}PU=¢bÑ>ØÄùÄ:$YÅìTÏ˝XOåVïkóûßOt≠‘ b$˚æ^ü¥@J["IÁìX„q;¨®—s2ë¨xã| ∂’ºwMoø˘ øg“ÕÑJÚ´êÕ†ıtÉÒ%¸@·[µ…w¯ıç—&Äñµ'c¿⁄‡£C¸ ËjVÍà˜¯[≤vÛ!¯`FÑˆ8“√DBÑ±ôå?çÿˆ€Ãæ[≈∑èæqeÖºàzgÇ™ÒO…pör5zf»§õ§î«g…yr∆Ê$pà–$JÈ¡ÖÅ¢[&„</BªÖúiâì5b{WØ'R`ßŸ§leiãvH$]:ÌÀS≥DîÓ–ÔÈ∂i¿tÅ≥óR]>ﬂ™oI€:Õ‚4PUw[Ìôˆ^Ô°~”“ﬁ0( 7Çà√6«.É/`Ãr"ÛM„{TCm,Ü[/_üº![õ?l1Œ‚Ô'˚+ÕÙìL8ùFìZÒ!˙òÇ«a-5Zææ0§4=‰qÌ[9s·MlÁ±p¥%54N0zÿŸ“√ïwﬁ|y´ÃT‘N?"yQ˝•°ÇIã√<Dæ}ZÍV‚∂ì¶v?ì≥òváŒ;∞¸3–F˝Üÿd`Ã˙*≤~©].d•oäïúÊ˝ÍLï>…Z‰óÂæàvÇ˚ÅóÀpr2—‘à(ˇ ÙkÃ±A.ÂëÇ•a√€ê‰Ec,ºHœ.’4‡á´E8˘v1N§Æh-À($´m®W≈’2°º‚Í4Êó¶Ë±àtõÑ¶¿ﬁ€cΩL"f“†"
c∑V¿§çÜ…ïy√'üõL©ãssí„æ¥WIÜô/õäí[æ<π‹⁄,„[QÁ".JQ™Ñm4µÄÉ*NEÖ*?´ºúYI72£‡ÁÛóÅõö—PÈçõùd…[ﬂ^+ÛvÛ. @1Ñ¯ !OÅ!Û·<¿• Ω¶0ª. J¿∑˛€_»õ∏œ(5g¬≈`çxpë§	Øp¡âÿ°¢€%ï’“dâÏ˚ΩOƒ‚.ë}ö>t˜®¿ñB[bèr)é◊2 ßa4Nì®◊s`#•PùûÍTŒ®∏ÇºﬂÅ5+´∞»Ä<{&^Œf;7÷ÂY!3ÕîWVÒ8ÍF#D⁄¿˙4å¶Î*«ºÅ°a'€•RX<~V{Aßfÿm…Q¨A˘ïÜ^ßÑHÏa≤ÜiºhÊ’À$·Lº%Ø¶@jj°¶≠È6]$•™ ‰ñ„G™À∏#`_JßAƒEîD Øq¸”Ñäﬁ[˝ë´®‰Øˆƒf‘äiÅ)_ÁŸ›>Ù“é'î'uI˚pÜsö†Z4ÿm›X±®s´ôH~’«{&∑‹1o<)8å«)U°ç˙ﬂ¯5∞EÆ√aék:âGœj´À´(n¨ëã)Úvz*¶òä“6Ú@ß¸˛—E W«QÁ`–ªö˝PÛ∞Ü»ˇÛla9¢*;[ b*Ï≤9]k§¡{,:è4`∞,∞ôC“ó˛∑ˇMJkÕÎ©Ñ2ì´*à-èä0˝eK¬∂≠ÿÈÁ./†C)Ã'≤]ÙH-ÜaK£DÅWs£ˇWŒ≤+÷$ï ‘°[ë˘Jm¸¸oˇÅ(„∫öÇ¶]*°∂È∆H£§bœ)ºá[◊‰€˛Èˇ»XfRó©+"√ô◊`ú˘U‹ê∑ÒÛˇ¸G¢|Åoo>ÚR÷úÃJWππ_§<mà)Ã—~L.#*äØÕ“Ç:	Kr†«Í4∫H¿xDè“4kÇ-H°ÅîÂ~—˝«∂%‘t`2Åà4‚ñ;2¿˛s—#¬…¯≈‰«OuiÆ‰"]Ô–<ºw û˚≤Á∆£À—™ﬁ/ûG~("•é≈zúÕÂ¨BäÚ±÷¡ÌEˇ7Ï',Êä«	P†‚‹êQp,?¨Ì¯x›‡äAÔ∏éÑÛ·Gy √¿9“”Z)˙ó®y¬Ê)ë∏H÷ïÅõ‘6Íj¨é^#(º„O‡X->D~˘˝øxE ˆœ±`Œ_)µ?‰^oIÌ≥_°’≈~ÂçwÑﬂ}√ÇD¥êÛı≈N◊>ãáS4†˙ôH/ÛEukΩ?Ou˛êß/ƒPo4”+#˚üíàlEÉKæ≠Œ1@ãMÜbd∑
Ó5hæ“—˝e\œ±ıZœ÷yt<◊∞ƒﬂ≤¨Ê´A‘OŒ†•C!fÆLÉñ—Ò'«l3Û9âÿˆ˙ VÀj:”jÆº|˘yƒÛ©z8j>ˆÊÁØ©˘˘˜±¸|D9=€ª›9x¢áIí4+Ì€Ï%å&DÉå>T8Â‰Ô8°æ9û¶.Bá r€bëÆ»Ω„>‚¡©X¢‹mwò∆ÉWÙ•L,aJÙ	£*…™ÉîÃ3¸J•npª?ˆVN@KÈ≠ˇ)∫“· ÍÌ0⁄ﬂ“F*NŒ˚≠Õ˝Ω˜€ªG/_–SÙúílàfíæ˛4£ÁØ¢$çz‰‰’é"RﬂÏ „√ßÃßª
—˙*”=á/è⁄˚õØﬂmÓ∑_Ω<b>zπ˜rP°é°Ô¨Î˘€|=ªÒ’®˜D'Y #`)iπ‚ÿv÷¢ñ˚í∑–„-O∫R˜ëÅLyyã∆äúFe£Ò›ÃZ\¿çµe≤GÂ§c“¶¥®ó–1ø¶3œOùÖ&≈ó1CU§˜PâJﬁÜ¥ı^_ﬁÎÀƒÙÆ¸„89ç:vq∏˚Ç‘9Ä˙
‘ÙÑ"sËJ˚Â˛vm„æËá|_ùæÆ°éöÒΩéí¡‡äû©≠∏~åV2TO¸6jü§ºö
á∂[Ëfπ¢éû>Q„f)–ôπÄE¸˝ÍTƒ@R¶‡<9°t‚au26JF ∞#‘§$¥≠<Ù·Zœ¿jÁ†f¯&◊#Ë!äÎiøâ”®õ‹oˇ™&∞àgeÑé$+h:{Ò$π$à§Â≥˚#õ]~ÊO£Òî≤‡*÷ù9Œ€RQd‹Û3S‹V÷4ü¿^JìπZò±RIF∫¬' Ò´üGΩ4FF∂ÏõXÜÃ‘BÂ_! &âuÖ¸`€åaµ9%úã√˙Áˇ¯_Öﬂì≈èlGÁÙXXyl)nlπ=ÑÈ+>9≠Ñ1‚Ñ€‡ê>\†MLZˇ˛ÕÊ˛	ÅﬁdOÀd<≈ñ∞„Ç=ÙhêòûÿêT¶Ë»-‡<ﬂ~Ê\µ≥B®À°<éî~Çh∞BN˙”~`÷‰5_ÂA‹;`œàƒI⁄@@	-/å˛ùÂÑ¡ﬂhò∏Èó√èâØO¨B6æ%\(„$õN3?ÌÙ§,$Áñãn‰m^|?◊Ü8Á◊ÑÅ¬Aûü,†m%>ßdã ÛüU‘*¿D<∞Eê^uÄDé„^Ù)Óx%É≤Ì2ùAeA∫hq[/ÀCÏP›ı4ûpÒä˘Çèôu¢ìåò]¢ó‹Pr”_zQüP—≥3§wê	3ú¿π^ˆ:~PùÂ•ßyπªqeù©^SD˙qüeπ¬ºCºõa˝Ú)|fœ…÷ÙrJ∂‚î ∏ﬂêΩaoÿ'ÌÆß›ò.“Ünhµøî¡çŒéÇS√∆Í3ßâu⁄PÛg¥£XQãW1‡bó$çö@˜ö!ãâ:¥O›9&}å±]Ìn+á±ÆŒÍÓˆ¨"ø	k@**FZë√Èd¯=`∂≥¬ãû˙u!∆˘í¢êø<û¿åsÑØÁ3JËJE¡r4›Ó˛ã&ƒzÔÔ¡áGÌ¶Îaá˝«Ió›πäC˘+<ÆØ¥ë5
HùâM+dò˘CnÔ©«ó≤„Û;•J£¡ˆ’ØJy8ê26à*l€ªGªdÌ¡˙*ù4≠˝Íh˜“~πà3jìÇ‹Á3LÑ?ÕYÂYOueΩT§¡R›Áx2÷l0¬UãI°ä‚.¬·≈«Âà-A!Bv¶ß”¡h{‡à=1Ç©ı◊	˝W‘∞ﬁt¶óêk4Í%îf1…>Úƒ◊°úa¬ ‡Èdà- ÿ@ÈSßoRŸ„0>ã∫ıS:˙Õ¨4îM+†‡ú”¿´Ã[y"m,û¯8SÍ≥;XΩ5∑Æ≈Pﬂ>˘˘_ˇB`éölíH;NßQ¬`äHî;œV+¯˛∞’™ñ˚Î¬äj’ºQÃ€∑O¬‚ô•–”p®ƒ}]A≈ûÉÇ⁄fÜ8~ÇÈIˆï"Q∫\Ê†≤áÿÏâ¥ÔL§‡u9aÖ´+|À¯≤ÈÇŸÓÌ-e¶ÖÌÄ©,⁄yKW˙ùCeËpfQ‹“ªR/æM˙^Je©®ó¸1û≠I[,]+G«˘n˙ﬁboˆFpÂir^±.§ç«ŒSÛr§á√Ï¡¬O∫ ()8$ó‹:pNª!Õà° î ˚Jà¢7QÜâ»*ìîôz:W≤SÙ˚ ÄCF¡√∞.·“jö^„ñ’ﬁäzthq}åeÂñπ‘Œ¿¨ûë±™%Åycläﬂ<‹} ™\‘.ÕÅ5^N:ôk¨`ÿO! áp⁄®Ìµk7§IÆÛŸ∏°‘b¨Á≈lÓ¸∞˛[JÂ∑0%ÔØ6»∑§Ò@§•ﬂt” o9F‚—à\√ä2¥Ã≥®,„Z“iÓn◊ààl™O\;'àèàJ©É$“9´d±˘p›P?ÜI2XyúW(\öàë∆bÎà‹VA#í(∏˚l6
·ç¿ö
wRák\ë:2u˛3ƒËÒK≥)	ƒRdò%*Ã.‘M@Å(ÀOªDD‡ËêAâÀ8»öø0j~·Ï˘Ö¿ØJ±¸*“ç‚∞•ıû™Æ\íbÒ€†∆Üàs9ı9˜ã=˘güËÆZVÁm≥ ÛÏÛøk|°öë◊K&£> ñeÏ÷¬K%˝Ûˇ¯Áˇ˜ˇ	{,ê¸B"<„jpœØÿ’°p√“Møê·µˇ~y®Åñ%rM∏ïÉïÀ
ä¨íõw6álﬁÖÄÊŸLõﬂíc⁄r‘%Ã‚≠⁄¿!z	0∑Œ¢Æœ÷ç9?n+%ÂåøORö:Âö(dË±à-è¥≈y¶/á,ÙÕ»1BÇ$˙®7ºå“§åÉrÕ∞ˇ£”¥h.œk–˝¡=~tÇs€˘*@◊¡µ`XgÇk£AûRñ˛úQ\åÈQÇ%∞¶ÔÇBUÌ0∏áVU“Û:	‹≤¬^Îdµ7ÃöG^—·7Ô»ÿÈp $hÉk{F∑æ
±9ãOMZ}è Ïè#æò—£üßé—ó»w¯2»lSà(-?‡ãr Å«|q)ÚvÁK1ΩÔÀ$jí˙<>ó·Rv'&°˙!jê*VòjUA•RÉªÛÛêÚÖ‹_»nÑ‚ÅÌV©Tï¥.?À4ßtâ—z9 FÚÚ1◊DÈ•ú+•¬l◊9fnYv˛|≤*l˝¿¥-Q+ôÙD±*UﬁÛ«ûü«¨rÄ
ø´\ØwÜgl}ËˇÀÏ}l ≥7Ûˇ%d:‹=9ﬁ‹ˇæVeë™xÖ¢ñÍä»æcüUa[ "w†úR˚QΩ€Íh<¸ëŒ9kÚ˘rˆI√ìÀæ≈5ä‹gs&√∑ë˚çH‰*…%^fÑâ∆‡YŒ√∆§‚Læ6IƒÍf÷œ?µÜì…Œ¨¨«ê-Xi\åoô{ï;¥GV[aÖíŸ‹ß‹Ü?ßΩò|>0÷‚í<OV°#ââÊºVKÔ±ó/”üAWô¸ûqé¶¯ñï4(≈Ë^÷À0N’∑Ã>3z‡S~À”< áGø´›º#jã‡`Êw“q”a7≥µnÃ[„bÊ∆Q&Ñ⁄·Ã”‹eLÊ’ÒDôÄ,MúCŸ/ô9TuöË∆;∑JÎS'DZÂﬂ)h¸;sW¯w~˙˛Œb‘˝ù;m_\~mÁØÏÔÃW◊ﬂ˘™~Fö>ßûøsßÊW&P_VÀﬂô≥í∏Áø¨éﬂôYµﬂπ•ö˝Œ-RÏÔt úëÔœ†ÄÔT–ø;ÛRªwæ§÷=¢z-=˚Ï·Â/"¿PŒﬂækd^^JÃNYÀ˘ñúóº◊¥nˆ¢(´rO_ˇïh’hÕŸM}ßA/\É˛—•yá´“3‰ƒ?ò5Ø∫ú¡XXß¬©8?ÖE„8≤æ Z~!Ó%î¢¶1•$‰8πà»—∞ëá´Ñvá–S?Ω;ﬁU|I6ù⁄ì u<¸ò>ªæoﬂEπTÕ}∞>TîH€/¿†≈ñéΩX≥¥·j∆A`Ï„F
¯r<ì|° z„8M˛(~ ÎXÜh—√≠4¡N¨Dk´⁄±H…C{GáuŸ\µÄ:ØY ‹∆åI†`†õ∂›~‹Ïtﬁ–sŸÍΩm_":õk|CdRcÅpaÑ»"Ÿ”â¢ùÙe1¬Ÿ¸vÉgÿNÚ=î=À÷p©ËòïIßß}{âx˚‰Ú!>ëiÎ|ÆÁ:â$;1áü,&2€∂ì>ƒ6∫ôék:-ßÈ
êÕ‚˜OW˙CñÂVz∆ˆÀSÂ´Az◊1 √.éÛ*-≈LàßÖ7‰/(Ù*–¶¢ﬁ≥Îk2§B2πbQΩ≈ìËƒObÌ∂µÚmÒßd‚k™|≤_ñÜSá≤s•„≠Óº‰S‹°ùßO7WµΩ∑ÚÄ~¶€ß3éË^õéak˝ëˆ’’w˙ˆXôié¿˚F•d˙◊ÚìáKÑ~µéù∑Ï—5ˆú·±Ú<‚^gù!òÄµ’wÜº=º.>B‰:„
Ù…*ÌÊÚ4Õ≤¥Z◊£”tÿõR⁄a\ﬂGÂı-˚”¥Ø≠ˆb@wﬂ4ù. Ö@—è>5≈üΩãˇÙˆ…£ü>æ#üzŸÁ«π+ûË¥∫ÏñÓªúÁ®têﬁê	Vï˙Eê8¥@tö›§”°“®ñìP&p˘úsSdº¿„átv¢ˆ\ÆÃh†X@∞n8h3^Ïöc•¥£übXRe=M<∏Ã"Ùƒä~2hvõ˚àë»:∞çxÑ œŸ˜πL“ê≤çMÇq)d›˚%%iù/+˚€ƒÍﬁ(ô€$πËNjLt^◊Œ´uÔ[˚[∆>ùÉN7Ò‘<ÅƒäÌº®&Æ—›mCa’¬¸ò∞2∞∆o÷AÊXSojå)J≈&ã"∏qóEµbå∫tÓ»∂x2…/MÌY[ßÑá˛£	ô˙2™âi^PY◊Vã2kòîıÙÔ	Ë;œÆ◊‹ÿ’Øêe°∆Ê4jÒ0”rÚbsÙ˘·qNpØöÄCI…Dä˝L’€aØ◊dv≥ƒ≤ÆÈ‰™«˝‚”Àdr Zm≥GÊOôßg›öŸn'C•5˝4(»OÎplÀ‡Ò◊‚¸¥Ê≠´˚í‘É∏ƒ⁄•Cﬂ›Ø9ÕxJÇ—U≠0Tz4.;•*(˜tJë[¥°ãœIM◊’®k¡§˚ù<%…à∑ù„º‹|∞çÿN7„>7çlKÂs¡.b°›Ê$‰`PÅ3ZyæÿÊ`ù/ÌéÃQˇπ∂FV≤“Ê1crΩ4ÙjV˘\±)·¿¨W€ì´É}πb«P’
í'=í"¸´8p©ó∏É‡^P˝p–ÒT7©Y‡ˆ°ßâ™ˇ  ˇˇÏ}€n„Hñ‡{}E¥∂¶ uYÚ=+”ï»ó tŸi´-πj9âLZ¢-¶%QCJÈtªÏÀ∞ÿ¡ŒŒÃf—`±ÿ∑}ÿó˝û˛ÅÌOÿsNDêA2ÇJ≤3≥*ŸçJã„r‚‹/ı’Â5Vß3AKrM7R’Ás˚Á§~ıaû¡&◊∑»:wmq≠s´beB›û8ˆ≈œKË€Ò≤@í=}Ù‹éKg∆ﬁ`„‡ìÕèkCs®= á¡ª…M˝y·"Q8X…
O’[1/Ø¢ä—R°g’gïåô9∞¿HKªZ◊é<”!õ∫»•–Fi ô4J)hó1÷÷YŒ=1ôW ◊„9ó-/Lˇ·ïß≠ΩóÕˆÈAÛà)Eâm,˛æâÖ%y[{Gœ˜Oõ'0∫›ΩÌΩfﬁáòöë∑±vM∞™æ+ˇ¬˛ˇ¸∑ˇà+¬Z'˚€Õ›}V=ÜöÌ}|Öµ;Õ,ãÌÊ[î€=ŸkÓ∑°w∂Ωwÿ<˙±…~⁄o&?ø€<j≤Nû>oÕ˙ÌxŒ¢£7'{˚/∑OO⁄{8ÒÁÀΩ#X_ı{ñuÖsñ\∑é|«ëyv|a’Kí«Ë„¬ä˝Mlàbøj4a¡´™æ+:Ó˚)ßYÌ*û.Œ5“<÷"oñ…´¶Ê«∞¬NH%®kπ©uÙ∞Àªª.Cú πKt\“kx‡Fâ’x{¶•‹÷ùà,Æ©ní9^≠;kS∂òtg!›≈j`ﬂÁÁ˜nä˛˙ÿ‡¬¿Úêﬂït∫…	∫•À∑ﬁ®;ò¬™V∆Œdr}Ö˝
Âï‘4πƒ˙cn◊Tj≈éÎ…Â7™"_¿ÙäU“^¯2NÙ7â¥q∑OÔ∏©æoa¨|vä;–´{¡œ3/úV1Ô >ùm˘Ué‰>‚iWÕ˙WÃÓRN¿Çfm·_ˆ<±≤`E/•ã>&@¶ËÂ¯úo%WπàˇŒ=÷πnˆüóêVË!ó+ÒcËÈÔ¶pÌÈ≈0òåÌÙΩqX*5∂__ŒXd¯N
‚RÅ™…tÓˆ>cØ*Z]YbôU<ø«ªÌÈ8‹#Á8º≥Ì¡´Ï &;LÄÑ„ΩC«çÆùJ~ZÏ-¯¥B˜Ò≈ó∞Èò·ì ’ãË˚œùw˚Üùéù>˛‰•c®5Që§"8L˜ ¡fo‡¡†xÉwŒeÓàj<L å∂œ¢|Ø]l"9Ÿ«˝πòﬂi∆Öp(©éÊÁRRŒ…©‡ï·V‚ı/√¥‡uOå^a^îéfc`‰§À31 ßÁfd≤àÛ∫kÜFô“¨Lç“≈¨Rºs08xY29x≈åN|¶lﬁõâÁ¡k.æØyº,?óH;{ÛV--Ÿòd`v∂Œ±NÇ?JeéHÒ0±™‚Î‚M◊
—tx‚}µX\n´÷∫d'òπG	ÎµE«[i#8ÔÁA‰HØx–gΩﬂ≈µ·zq§§ŸXŒØ"u°5ô∑âoØÕ»ex™◊û†c∑ˆAí\*8Ùò1 }y*Û\ˆ¨≈÷>û:/û∏ò—‚¨∫ø{≤à2Ö≥ò‚È≈]0pÇ∂wQ|ZÔ⁄(èóçaØ‚ƒer≈ÿñmIƒÂYÃ∆ ¥èóN3I©±T,k¬ÃîÔÅ≥∫˝ôRà8gQo3√ƒã˚¢H'Nc≈äﬂ·›é\•àéêRS«Èπe˜∂˘SJô)˘U“X…Øh„∂p]Ìﬁë©ÍqŒOü0,:à¯f4˜¡‚Ÿt∂†0˛ËÁæÎè˝.•+õt8å`PC÷i?{}ﬁ˛ØbÎ;}Á‹sΩ◊Ï’7[[ı+Ú†≠CG8 ±7™s™¸z+m≤Wõ{£QAÛ9ìŸfaˇ≈WYˆW˛B[ì◊/ã∂ÍH¶Ü‡| tÛ"√0M4ìdfz…˚NQÃàà~b3πo_»&˚B6øêÕ˚"õÑkvΩ	Ø[›vÉ–Î◊8ı‘q<Òá@ÔÚÛ0›1!›Èª›À/Ë‹ª£§2ÜfÛ◊GK≠Â‘¿uz«£¡ıL‘ô#Î£æx◊ñ3âS‰3{$ø'ÆH•§)ü◊˙ÀØ· Ûc”≥|w—{Ãgº ¥ı„t8p˙™Îx≥oÅ°fƒOˆl˛›3˘vh©
mPRÑTY"£Ÿ1L…®´∏…àñãå)6Õ-Üù¸¬L.ñôÃªó"wü∂Îrú˝Û¿~A¨z<N∫9kÛ%∂géÿû®bÕÁ‹£î·I"Œ{Î—•∞Â…«[|åñ˘kodï‹	»Ñµ^(zoR±ô|b¡=Ã∆ée©≠c5=+˝∞»¿;nå0Ôj—w¨"SÚM—V¡'ø¨¯“ù¯=W	o∏KD®E<1å£Ô>HBÙ}Ü~nƒƒñxî¿É;Õˆã ”Œt‰ÄÑÖ≤V°o©Nî?9,VØ.ÓÈ◊ÑÑoﬂ)’Ë9q/›ëóWùÁéDÏÎF÷’ÕsA™ªﬁ=0_êDJûñc6v≈o’˛¯ùª∆ä¡Û∞√ñ:îÀ∆ÉÖet&™˝i8µSî©ñ®ëô àöj
Öu˝A≈Ò‡ŸË◊Zî3l=´U¶“Gï•y!¥4¨y ó?,ƒìö‹o…R§á£z˘”?¸YÁ^≥ÉÀÏ`‡π#¯WraGghØb≥©c¶©®5¬πèÂ‹{ΩQ|mß!ÈÕKÁr80∞|Ÿ`€”û«⁄¥
˝Z—GµÙ√≈"P∏v∆˜˘Uqñ›L“Ò< ºÊ÷˘ÕAP‰![Pq≈$∂ºjiI'U`s´å2{õ6ôË´’Uƒz4Î–zY3œòÊ£ƒAE∏Ê∑∑åΩæsπƒ.•,ÒÍuﬁ(ú‡¬∞k‰‰Ppë<Ô2˛∫0@Ωù»±§òºπë;_C–¬≈0ksDCNû"æΩëäiëë\©©!1SÚX…í˜jm√î›aÕò…_ådvÓ˝ªª¶Jˇ¯%U‚Aè«¥´ïm&2[MKç÷ É≥˙¡Ω„¥dÖ(∏4∆ó„.ãÌÁ |∂€ŒBÀê≠›µÒ©YrfM¬fÿî<…"dùàò“Ñ+˚d¯vn7ô∞Î˚I«tœ‘Õé◊ıÿ«b∫Î∏“úw+úKºf
Z2é†lºV”"{úEZ`è]æã∆ZyµZ-oâM‹¡O?<ÂìÉ§	÷ı¥¢b)û˛i—J<˛ù;b$ﬂ˛Y2ã£À%œ‡@ì%K&Èﬁ—ÄØù+¯]=•¬aªw√ÂÂv—+∞@‹≤ƒ!•êRf¬jå} ⁄ëmÿ‡±M∂t}T»vêKü†‰/Ï—°‰•åäÿ/cã{áÃ9KÖ<®M≠a?ßñ`ùM¢∑p¶ÁﬁÎ|ånoø7ÉG=¶‹ÛØ£√¥KÃkÉìgo“ØVûüü∂ﬁ4€€«G[∂a˛ ÁïnóXÍtüK0ƒZcƒ⁄&áÑí¶¿0bﬁÔõŒ…ø_‘x’g≠}Eq}dèK§Ò8≠îÚÚ¬ºÃÚñxîœôpG™®dù‰x	lﬁU 3À≈∞|M Õ2ÔPî»uêñf6fêbtˇnJ)sÊ·aëJ´d∫P≈	EêÏñ{€“Eq‰ÀlW<™ï®Ø|√Ûó∫Ω4îöwá„–D∑=¬
xnÿ∏£ãIü=e+˘¸≥:ÙÿÅ1#ä˘§Çzx÷⁄?‹¡:«ùÊ!„Öµ0øÎﬁÛÊœMLÍ*bXs‡√†<vÈ2¨Û+'U`;rùÅ€VŒ3…Õ ö∑xjﬂ–ﬂ|}qÔò∑ë[Õ€~O4±ô^¥bÒãrìeLïZu&;§"Ë^ÔÔû‡Ñx∏ÿ∂¿VÙj∑ÏèÍﬂ
‹°„ëÖô -„≠3ÍC‚`æˇ∑ ~£wŒ–ŸïU.ST9œ)(—≠zQèÖùe°N/_∑}dÊÒˇÙw‚»·híµy–ﬁó¿ﬂnÌµ˜ÿ?òÆS#&†>õ§'¡ Ë3t
SÄY!˛¯0*SUòa1^©Ôæf+pªﬁŸp^‘ªé˜‘ ¡¨ N∏≤8zÂÜVp7EÛœxcÉvn≥Œ⁄.«2“Ä»Çg√Gc{Œ™såÉêπÖY6÷≥Iwj˜ºLy<Û'¿†+Ïπ›TJsÎ"£∞◊≥õ Ïº{z+·{EXàsÎ≈«ù¯u0çgíáﬂcàw-3ögô[Iåb≈€2°¥ÿ0
Œ>\Î÷ Àa–2Œ-“Ù#âO*hÖƒ‹ìOä∞áUJ·x>5‡È'”`$Œß’j» Ìü(ﬁ]DìÑﬁGôÛæû¸.’ =q1(
§ﬁpä|=Ô¨5®∆≥XR«¥d>ñÉπ¿˙≤xÈL˙@_?TWñHà)P.ÂÛµ¬U+n¡Uh àÇ‰s8=Ú˙ƒØüÏ<áëŒîLÛÔ=ßÓ®x°;Pñl ƒ•µ§^u=[TﬁV©§o≤Çj8‹¢øY‡ﬂπïNQã∫Œ∆gË√î*òÈÄ≠ÜdTFe[ïù∑)kçMUm≠-%érhj˚-åvI3î’(Wå’(5oyE§'UbP⁄r®"·,∫Ù38”ó%VÖÍ†R@üªTû!€œ%∑ÿ™¶}#3s≈,™©û[j^ë‹'±åM‡Ö:õ˛Ü˝Án24’JÿQ>g Ñÿ∑&ˆ´â‘"qµ‹R+#ƒnóªç≈y_e¶° U£l†·fƒRîÑ#ôAvl}6À4ÕO^⁄≥%æ¥@U¥÷ˆív4´|ŸÍU&∂zïNå≠^ú°‡”ﬂu{S*î¨·f”b£“NEf“qdâDBv)“›ÛåB*3ƒ?XOOØdÔ≥•äØôí≈W:›êHîûSŸne∏ËØd6)àî÷ˆ4"Yk˙ÚY◊Xyê[ºü„Fyp≈ΩÔÙåç¢_/.^õQòñËCh ÀQ”ˇÚøáÄ*∏˝ë«™wL	l≤Ò™ó=(âfCws ;é%–P£":ù¿T∞Ôµ!∂ƒdJı<Rõ•Zr.Â∫úôïAe%ôçq^3Å≈b1‰„#1{ˆÁ˘7âøZÓh⁄◊¢/›≥GYe÷çVÚÀÊﬂ˙Œ‡\EjÑ+x¥ãœñŸ⁄L,÷G„‡¸Eo…˝:∏7ùKD¨⁄KI·)Ãà¡õ+ü['0‚Ê _}l∂ÃZ‚.ŒµÃØî∫Ü∫”¯ÁF)Ìe∫o	3À1Ïf=°≠‘Å—j	mñÖí0“≈AÛ§	å·¨Úî˚=HœÉrZ˝í ≠|]vûÊ”◊îÉEô·Ã°ú˘∂IÒ3π£=ä∏¢=Rx†/˚#˜'RìÔroÓ;⁄$`'®¨N	ÕÓçjN|JYõﬂ÷ø÷l±jcª}ã÷›ì1[±HÈ-Ê‘≥⁄ºÏ{¡|P JP%¡‡Îõ§ıÙ	Oƒ]I«÷RÁîød	ó"¶”Ë´_Æ›2›H@F©TOèömT˝ß¸—â…ﬂ¯ÿsòâb;pùK‡´–»ƒﬁûπEAïo‚l5˚≈v‘¥7k*hî;OˇÚß˙œÏƒu=d&Ò]b©∂Åˆ4Ü,¶ƒ2®/ÌÌ–7‹ûÍÜx´§·Û¯¥PûÑ$îB@Æ¨˜ÎJX¶Ó;”âèŸEã≥èÀ´pa»€ëÓ-1gø˜°Ñﬂ£úA	yÉ\$Èk±K·¯·Y7ûú≈,∞©>Ï@9ÊÛ§Xì≤‹›àcÂú‰≈>ˆ6«®ﬂÙÅçO®ûùƒS¨∏n`Ñ¡
‘+ç(Åi{JNÇulù.;ªí&fÒñvM“åó}¯¯T‹YæY ÛDºíït§ÿô·wßÙÍ˘Co‰∂`=&j“_ã(íVæ‡+„ﬁˆ"ÕB∞:‘ŸSÈiﬂº ˚Dæ#ÅÉ¢˛OBˇ»›nB˘Ï1F)ù◊›QQ˝Õüñ‹¡6Q•Áˆ:}/ÏxCWHeúVhÏÈC!˛j2gV6Ûqäù¡EŸpHûct‹Äã=Z˝íX[£≈ò·åÁó0|'w—£r´…º@Ö^—rG≠4&Øé◊s.„5øèe,∑WY	,^¬\#	ÒkqÜÙZÓU+YEîœç‰UïÄ>*+∂Ò+w$$û·WﬂN’È≤Ø◊äÍÌf÷≤Ùvïƒê•ö€ƒêîÍ‘≤°U≥[∆m-?1M¡7äPIÅBú“I©˙q§:NAñôS‰µ†*›ÕíI≈¢€¬å*Úö%≥JÓ˜Á à2[œ6ôQfÎπ(Cäº
2•»k÷*bÙÓ<ô9ãìüXÿ˜< πQ=G.ÂIÂ7ä=¨*â·u3›óŒhÍN¢pu4J[≤ÜsÎ∆ÏÍvÒÀ>ìßºt…8‚∞|[≤óI∆aQ…F˛œT≥±˝b˘ÁâﬁOö©mó_ìPuH∞∆Û™v)ï,ù]ñÂ¸cfÒçôŸ/‡ÊT‹™ÁŒ tK∏>î¡J•ÑcÖµSÖÖ]K1\«	Ñ  !ã„B´OŸ2É˛€ˇ*R=Pˆ•]ÁNûƒöñl¢ΩªÉ%ßh+ÒÕçK≠Ú…ÎéP£˝a†@ﬂ$f$vÍÕõóÕ£”Ê·õ7ª<Ú 9]ì`ZÊp›ÌÒ*ï€G^"s»¥'¡L’íì]QÙ˘πK%svsÛÒÑ?∏9—˜Å£'Qˆ÷˛ißyÙºÚπ¯˙™ª'gUÆádF!û	‰´-smIo‰∏™SÔY\î
Ì'˙rUwÊX|ád„≥ O§‰ﬁ_,Ÿ“e,ä3I)¿>5ëºnt‹zﬂey≠jècÕi'Aå≤2L¶!˚=jÓÔ¢,ÃOE„É ÌÉC∏›”õÕ]v˚.¢<¿òm¸s:paL|I®ﬂ%y‡¬%(–A{¯@,Ÿ°Xê4Â2LCh`ı ê	'?≈´ãª‰◊r¨2;ƒóu<ºz%“◊‡Ã’∫fÙõaiÕ‰+˛≤jÁ≠¥Né¨`Œ•_LW√[¬J¿B6ÊhS\…r•Âí–»´F¥è=JûlÖ∑y˙≠(ê¬∂CÎ4≠‹ÿã ¥$€⁄Ò´≈ÂÍ
˚1ÁÀÁW˘<Œy∏◊û˛v1˜>56´⁄ )•ŸsÂSU;ë„‡ÇtNãJ√™¨ößì÷RUàü‹Qœ«z~}`A/—oaU~°ß£{.”ﬂFZ4˛€∆Ém65⁄ã_áÌ≈}(—^|—°ôthT(eWÄÛØWçˆ‚Æµh/>∂M:á4⁄ã/
¥Ãu7XÒ”—üΩ∏sıŸLÁjÌôÃ˙Ã”ØÕÆ@S3àC_ö¸äGÕó{÷)ƒ”√Ïäº}Í'R˘yˇÂí™◊Gé<Uˆû&[ˆ}}2oÃ`W™£í°¶Â¡N£∂U;K rqíweÌãtµü–Ã¶∞Ω{ïmIÄ˙¢Å-´Å%FËÓ’Ø÷Û±f~Åÿ•∂7àÃızôÑ[‘a,äøêäÁ¡^e5‘_¿RNÕñ˘ú’K§[ç‘Ía%õ¥Ê/b•πFg>Éíô“bá/ùÒªaØ.›k Üîw·5ﬁQ›U~„{FÊ»ÈsãÒ:Ü@’na¸7∑e>ÆÃΩqÓ{N∑/ß;øSÌ©*anB‡‘U…á0—µ3#√√ø+ﬂÈä‹¿ß®0„êTÆ3 ≠=Æ˚Î≤úc…˜qƒÜqé(≥_+¨‘ï!/xâ≈%«ÜùÖLC\˚WØk¿Äˆ¶¿VÅsÁI™ˆ-ì©‰óJßUIŒæëú,˚6i8Èâœ`∫‡≤&ír$YTéœ–ƒÉ∞çµ∆≠PAôÚJò]†Qû"Y¯Ç¯˙Ø„«Â˝√yTŸA £bF[æó‹ã{±ºî2ΩfÚé∫-i—õ¡Bök#-¿ˆe>2ªÒ3s∞—v«g;a •&éoπŒf2qﬁùëìŸõ2O∆ÏÅxñÆC¶D™xΩ:@…É5€—*e÷¥(∫ı˙≈ Zh ù˘˝úw™ì‰}3ì}}3±ß–[U$æuPÕÉIÔEQ#Ö•w˙n˜r«∫¿Õ•ﬁjTÿá3rYß`’’ä}ˆvõHjM1˚π=˙6<≥2ÆvˆNéèˆ∞ä—qÁ¯e≥≥ﬂ.≤¬ä7˙e¸ny,7@ŒthŸÈ·‡w‡|p{#ø«´¸±6N€ LsPıeë3 ]S¨—‡±fËã≤",tªN‡ ¡pı	∏ÇÏ:v†9ÜŒÑçºÅ„±°7öÜVÜ≤≠í£s/≠Â>óô”£iä–Ö˚]àuÊ@+ñÓV·RãªÉhÆy#πfç‚∫õÆªâﬁZ|‰ñÖ˚LöByeÎâÁ"•d…Ú+∂°¯ÈZ*Òá«gà@±ëQügpQ°<vQµè˚õ%âÿBÚ≈ÈÅF]Q˛öüï8D≠CæK'ÄÔÄ˚î˘“	ßóEË˛Òr”
ÈÂ∂¡Oª'«≠›„üèÿÈQÁÙ@ñÃ‹;yπƒZ'«øﬂ;`"{’2k5O⁄˚Õ√Za˛ßKı`≤Vqc9nØv•î¯ ë¯ÈπS¯⁄&∆@¥D)1ı±eI'>¿¨Ô` “EV|úÎA
°ßœQ¿X6∫ùÙn◊<WùJ·≥Ã	±8^-æ˝jZ”◊≤çı}#Ü≤jM’Îäﬂk=û£&v›'÷*%WÑ“GP±CSK=5·Á±¶LZç/tˆA¸ZnÔµBﬂÌ‚j^™"±	*“M≥ß«Ÿ[Jπ—¬ï}ñ~πç-πƒ˝—◊Òó‘°tíÀ<*3@uêôé¨ﬁﬁJÅ«o⁄;/ˆvO˜⁄ØÙ'™Ry∂o,∂cïG≈€L⁄ruó1X¸SÆ%±(WToérpJÕéÕL9ôd,ƒ£¥π3Ú(Bäoó;ÿ‡‘k»Ó'æ˚(O‚,ÃhÌÓîŒo•e~VK‰åä2
˛ù`gÑuR2ƒ‘≤ﬂ#√∞Î◊æe´‰±œ«óóÎS]‰Ô§hL∆Í»Ïçâaõ©\f‹HnÑë8m∑}¢æÃ∏eÌKwËà≈Z∫X{2ósÉ”9¡IúáƒvÍ¬ôΩ·8)y?á_a)x£å!oáò9úaíÎãÓsˆoó1áqÙjÌÔZj´ÜŒ„ûˆ·l}Ä=S≤ñtøZùP‰%Êı>HÉ5∑º°:ÀÿJÜw~ãΩEVˇ˙öﬂæï˜â”ôp¶Iﬁ*âë>%eøœB0HŒï⁄Âk˚˝ùAà◊∏;ôòLÒ≠¿±_ﬂ$F¸-[Ω}[˙hƒ˛∏ßdd¿°ït?å	¸ö—Ω˚˛≠./≥g–•˙µ v∏Ô=r3÷π∞IﬂÅª]Ô‹Î“öîú"vâÒvp q¢hã¯ùgiŸ,¡1¡.ÅÎ∏ë
(¨¯!& YÁjF*∑Òö3˘˛ƒçˇ2ÒË
0§˘Û2cñ¿p:îÁlâ)Ä˚ H„ÑE∞‰zá^Ëƒ•Z˜¿VOoL	|•J·8ü$æÀ3™w∂_/1),ÿéŸy€‹ÆãgDòx…WÖÚ∞ŸèÒå⁄Í"∑˜O_≤ÌÊÔõ'—ñ~~zE⁄f^u∞a¿`MùIIƒúJœ£ ËOΩ>⁄˘æúœ0◊üëüérˆ w±gäÖû‘ƒ±Ç\¡°'Xz´®∑øæQæy˚∂ÃWeYûƒÈ‡Á!Q∂Q‰gMªƒäÉ_zöî∂T∞‚⁄òÚ]Ìèﬁ˚^◊Ö·¿⁄#ˇ¶:©â‰gQ'_¿‰É≠î˛&”7gWK’,;:ç«÷õ*„í?cí7ı„}ïKâË$´vñ˛ƒZo‚î†åπ∫5Úu¶pJe	aì?±ËåljúÜ•LΩπív1éÎä[Ã”R˙‘§rH»¿ªV≈=!óÕÎê…5»ƒ'óüˆ»Cí¯j‚)Ü⁄¥lŸTË¥wwQ˜Öq¶I¶pA‹‡Á«Œƒ	ñYadæ“¸_º°1˜W∂[¢-€NÔ¬MÛb*e€iiß≥Ñªô8Gëªô¸]∆o+AÈ—∏v·ıùëæ{¥~µ[ëM]€óæv[ÉEñT˘’ç≤n∑ØÌg[“Õr3Ìb∫K˘{e˝cÚÙÄ‹E∆RÖ˜ó?˝„ø±óÓêp;'€/ÙxhG{KøK‡ÙBoI&÷gbsóXﬁÜóÆ›∞{!ˆ%‡xÛÄ’√ÈX®e÷rÇêH≠aµfÖÆD˜ì–∏@0K¬‚"n’ïŸìr$jG•≠ÌõãI«!HÂ2@Hﬂ;≈*ak%Øu¬àr…"π
v`i¸˛ñú≈*´Ó∂j8˛{ëÄaf√ÆS5«ÚòΩöyñD™‹7S&äX‰¨oÀÏrqßcê„B&3	‹øôz¿&6-Ã3aW√Î≥=Ω¶g® Tùf>œsº€¬∫±¨ÌNÄ>ıYªuÄ”9Û¨z4ﬁ›§Í„ÆœpBÒÚ´> ∂Á”¢…¢nèZnÇ0â}TˇjÅâ‹K¢.€Ÿ›p‚éüTV+VT:Å:é%+‹Û‡TLGÛ°
X:ÙKp.JP˚¿uz«£¡ı¸õC¡™Eaù‚√-ÙP Œ„—≈í»)H[¿Ò5zB<ä†Lê ˜Ñ†≤ß–eJÜ˝˘_ˇÀÏ7O"4ÇN,∆XÄΩï7Ï/õÉs≈∞p˛¡⁄’√|*€iª◊›p©ºH—nnV¯ÃIx:FIän•IÍß˘é=˝Ûø˛G∆Ω£´j8Ö;öˆÅ{mêÑéW+£˜I}ák·‰◊˛˛ˇHlVïaÀåõ-Iø1ˇß∏¬ÔÈüˇ˚ﬂ1ÂÜ}∑ˆj¶B,„Ñyq,7$à"âO≈∆•ﬂyó∞ÈÀB¬∆†•ûG¡pºŒúïLî5PvAíÍ úˆ“h “ (V2ïBÿMæ∞î%ÙD&LòçüÏ¡|Ê„Ó2Fÿª•#	{ÚA0ˇ*;∂O¢€Ÿx.ˆñÏÍà=9˜´∆OYôÑÈÜæÄ&3¯W_∂)Ç
)Ã.Bl%V∑Ø⁄ç∏Ìû!˝];[ÖïáÖ·‚Ø¡ª±Û:Ã´ÔÂ∏ﬁzÂÈç~IdΩb9ã™äVûV’(„A≠\πt[Oﬁ¡É äZ€~ÒÇ¬OGÏœò¥∏ù]RÄDÏ˝n	ÇÚı/!ø¡±qeŒ€G;mG‰ôßHIUäteónõ‘ˆ«¿ZùGÀ”XF—ØUÛ+3ˇ˜û√∂ù—%´s≠aé≠N:6⁄wsòÍ33„_∆!.JórW©$rﬁ3ï¡ËÌ∂Ù‰˛∞GsvÏ‹s=ÿƒ„”Œõ÷ﬁI˚¯®y¯¶s“<jˇ∞w¬æIﬁo∑ˆévç›©¸Áˇ™%Í“ˆüì¬∂+“l˝ƒ√i6èû7èﬁúÏÌø‹>=iÔUrÛ(ÃTÚ·z<∆DëÀk+îtéÎ´JbÖıàYìê/ﬁZ]YYﬁX…Aû≥UEô©ä“‹QZÓPœ*±tÆú3∂ÃyZ˚;πÁ¶ô«•B†+´"!≥Áµø¢°CÌ∞Ã!ŸDKÓØ'ø±8‘˛YîIPÍŒt‡ÖºÇÓ8“w§E@äô;À¬ÂJ~ÃPÏC≠G éJâ3ÄTÂ«Åºƒp˜±√™ÕÚov’	,|Â-*}Ï5k≠èbˆ5ÆÔ—û8Ál4Ò
˘SõÇÖEq6Œ9–ú•ÎNpó(/∞VáÓTî®œ1À±∞-œQ™B¬"Pæ’†|r?2Â∞Hís@Û£ãîmÕÄ üÍÔó∞∂%?Û£◊sFïßÙœÃù¸ﬁ	=ËÑ˛ôπìEÊ+µ3)#R3∏)]P‘⁄ﬂeXèzå§ﬁ\Á≤Á_ç(ÛfﬂŒÀäe/HE“œù»94[Ωàí∆%d5á©QàŸÃbtﬂ§î)¯®X8‹¢øˇ
ˇŒÀ—¬Û Õ™Ê∫/Ñ ój\‚“eªŒ»ag ƒêÃ˜ÌÒ dôñ¨‹Xî÷ÎSaFÅÊ˜ns:Ò[n◊È”1¿Ei~◊¡„.icfô%qûÅ N		Iv2ÜäãT‡‚aƒ\∆m(ì°–s≠%‘X…‹C	x*!¬X0¶ˇÚoó∑NÎÀ⁄n8u<äfbmL∞∫H.u&6¥8›”ç(xÄ&:˘u)>”‡JD†—x)√4Ìê"üıDÁ∫≤4]íÓéà«˚fúvÿYæJé“ﬁxZÆj_$–ñ4Œ`‘˚=˚Rs‘Îì∆ÔÈmYc˙Jpº)ê)ëÜ…ﬁ^¡ﬁø≥ô´∂ù`ÀSC™äœÃP£&eœœxpÁÌ4-6T—ÕìëÅ?©∏‡~Á@ıo@R(Sa¬m+H”t¥ÿ/J…î„\h!)»À>ÜUÛK±}tPØïÅ«Î&H=SŸ'ÔÖƒÃ˜Æ;¬¬˜ÀË¿”CôπFá®ò«võzX∂ë≈Í∫≤{kÜBΩQEC|_-§!o…¸ê≥î”»ÙÅE5‰ÕîrŒ∏|¢dLâslÆc>]ãÿ=ÉÕ◊WjÏ[VA=)€“5Ω≠±Wñı;Ï¶≈jﬁG˝˚Bmˆa‘∂˛3¸Bû@ƒÛœœ\’7j^ˇbœ!î)è^>@Ü_	∂"ŒJaõ˙ØOõπpd“ç#Zôî>≥V2‹Nc~NcsFN„˛ãÿß,X"ÛÅu…zÎ¢ı÷	I±˚åãç÷®  ÂE$hµ∏ÑzŸÍ7‚´ú¶#æf–yƒWπËñ@≤To@ŒÂ\%∂Aôw¶:√ã@wÑÓ9îB	1Ê8!p©™ØõÎÚÚJë⁄o¨¶PC±∏0∞
‡‰W.Á/˙Á¯ˇ˜ÔÌOçï≤'æ,π"ÀÚ`ˆuƒävªà]õE]5ßFöç'6jÈOE-k¿Êgâ›0Æ#°¨…QVƒv˚˙æM¸ﬂiL¸∆
-skWøegxÊÙŸ°R∑™‘ﬂvÇ)F˝uù~±ŒﬁÓÿ©IÅˆ˛‰ÖhC;„≤-¶Cf√Ç
ß¡›¥ ø6U€®\j£§˝K'Ù≤°7î Ã9uÅ8ù¿wtÇùàM+òçK≤”Y€±‘µ{\≈3∆ßz¿QEˇî_˘-ﬂß[VÚ7 µ3ç’(UEl…2}ºh¬≥~«ﬁ+}Ê˜{ù8£ûÙXœPâ~FVYÚ{5˚≤&Ω™UÎk%Sï/k†›nºŸ›?Ÿ€·ÕÓI¯ai?RzÁSÚ"•Õm@mÛÎh)ÕÖπBS®Ö√÷á”*ì62‡dÔ`ÔhˇË9kuÚ?°-
AKÅ+ëågqç˚.ÌjvÏŸ$»ΩÊûf˘:]UîÑ≠3ùE©≠Ú’Êà E¸‰gw¿N‹Kó*∆/„üLñó¸∂ùüX€W˛£sÌ¿ÙíVÂœ_‡^ ’Y¸T:ˇrmN`Èá&&¢¸âùÈ¥. ~.Náï’5.CÓ}å#r◊| çqmÓ ãXÜtÆ:ﬁÖ√N¸û√6W'WYxéAæü‹lòA]w&U≥ìÒ≈ÙyÃÅªr5JUQËô”Êª~ä@¡ìMÁuìS]ﬁ<ˇ<¸êè6?^ P¡¢Â‘»O¸`<˛f≤ù-l3‹j’\R
!á˛ ™∞n8™˘ö}NJã#Ä2ô€ºä°˝F¬ê“fÅ¨ë‹ÌJ≤ÒªN#¥$∫3#µHa-e9Ç`:Æ€p‚(»S≤ÿlO8=ö≥röóOÒëÙ‰kΩ–Eg…∞ÜÊ$”∂Ω·ò≤T”3ßoH*ó∑úÜ˜xìßßÔ?^˙‰Kêy«Ù‰±rŒ#Xº‹¡"L‹ 
w‘uy∏ç.ÛáŒ5`ºU˚˛´€Ôø˙äõ/⁄”¿ô¸à∫≤vı?Xü ë{›?ÙB*œ“xX© ˇÙGGŒ{ rMCó ‘˛¿•«ˇ¢âu$º…ı“W∑[,€e˝Ec—-∞•Ùø`ãU·€>ØH¸ﬁ˜®–1~ó:˙^~I¯»Úπw¡;RÜ=…X‡≥ƒú¯œû¸ìzo˛–›«¯ïß∞RëæòØ◊´˜û{µÑ®Á'¯„5,«πè+òYÖ˝ëÛΩ ”*øCÍ_ÒvË:A∑è—˚‘G;˙©ˆT≠$ﬁÒ¬Ωc?ò–`·•˝¯w‚≠8ÄMºxÂç ¯ˆzì>Ω¯s¸;Ò"Å	pˇúÒwxE<ûÁ@ñzˆL<hx#`∆©∂≈V.}%ÚB{TM:ë¥áèÖ˚8üCì¯[R5Û°7˜ù^oÔ=@¬J’
ßáï•DÔ‚%ÈñD=Ó–Öu'∑KXíÉ¶∂ºÃ∂qOÅ–íÖÒ"ãÍ˚Ω%ÖÌ˜ê¡¡ i”SN°T†¿≥q$*b Tƒøs¿ÇÒ›Ò#ß}‡vΩ1∂¢N‰Øú7`≈auBjﬂ‰Á¥F['5≈4'9Ìﬁª}Ø;pQu»œQ¸;˘VH˝t¨{∑5êﬂ˙IπëÛM™yE/PˆÜº√Üf,~ÃØƒ66É¿π~|√˛ë	ﬂ”ÔŸt‰M‚_# „.ˆ˚ˆÈ”Í+ÇFÒNe‡åøPiuC¯¡€WZ>–¿≈gC7Ω≥Å[ËÉ7_´C\ÊÔù>ÛC˘´§∏ﬁ{∑∑}›“*Aπï\ô?ˇáˇi˙b—˙T‰¿zQ∑/∑JuÀœ€Å?f≠H«Ñò
e“Ì„‹Df©Â\≥—5≤‡äÓq‡ü{∑èk<AnÑ∆”¢?S ÷i∞ÁÕì›&€?:˛©Ÿﬁgœè∑õáùΩùâ˘ç%¯ãÆtáÅˆπÇ√9ˆ<ÆaK›1ÂkŸ¯ól˚Ê∂æπƒN:çïµÂïG=⁄¨ÂÖ<ÿu2KÏ¿Ì6‰ªÀ9c‘Ä∑π¯Î—∂3‹µƒV77◊6+_	cp4‘V‰1P˙;9Èïá÷W<¸Æ˛›£±‹¢\zØá0Ø¢g:dÚÁ¢ê+“‹…ª‰WˆÍaŸPM)a•˛_ó8f5obÚ¡æ•rD∑Ò(∏ÜvK‹$3$w&ïåç‹+ãpÇ£	∑∑™|ˆä>Z§ç≠Ω¢‡(Û—ú‰Kú‡(õ¡©Ú”Ò¿w®nåÎƒ)ß¡≈v"dè_t^R‡ﬁ ïìßôA„°P˜Òw¯¨ÒjEåóüN¥‰rÛ$xOp÷Ïi#ﬁ®FÊlﬁ†·èpÄÓ®AN¨PUU¥á£3Lp}ƒ*À˛nS„?Õ5ß'á|àâ˝M-ßÅ|mp(≤ £§çö]U(g¶π¯ñp†¶dÅ–´`W©îpµ =≤ª≤V∞°\`ﬁA™#,6∫£˝Òè‚{T⁄,Zûò
WÂÇBãj~òﬁ∞Z3,í«ı»Ωä˛‘v©‹KL8Xä!ë6Ω∑ÌóøæA»@r_≠5 ≤~Äó~mµvœ»z}>˝†∫∫íﬂ∑º4‡∞û£døe Æ‘nﬂRèÒ«¢Ñ9µVÍ]πÍ=ÖùH≤,Õ/T+€¿¡Æo∞Êˆé“ÑÊ£Ll‚Ô∑èÖΩ∏÷1±ZÈTjp~‚óà≠HåC†ŒY(ˇÎƒºÍlAëYñ¯⁄æÖMU».|D9ehΩãÎ∂i†'|◊àÍ¨•¿qÃ+`6ªÌ–B≤∂È61@£àüM∑íPmíÁ#π≈∏'“ñ›m∆†Ö£•/ÂC]¸˝NèçC.SúŒÃ|î;‘~& ÅÆílúmWà›‡Âà;≠%ë~‚Q‚Œù’bÓLπôj(∂¥ñ`øíèRoÁSS∏ ı∂®∆,ˇ1ÙG1vû◊I"∆OÛèÌ„£∆ÿ	B7˘^L¡XŸTVuk∫˜ÂKTÌ—öïí»< Ç°é[√'EèæW_ 4+3Ä€8¢ÌºGÚÎÑ◊£nÇ¿‡∞ù⁄x‡Œ¿‡êQÆC‡íÈá»Ë«ñŸ%bÉF%Z.⁄´£û):ßo‚ø©){áD–ÿØB¸«Œµ`¡d∑Öm1UróºìÀ£^•ÿ-á$D	Ò≥'¥hx©¢qÚóxÂ◊Iöç˚WE:q7%ëâª±)n)˙’LéM
‚g[åNgßºÛkŒö◊Ì∂¯?øÊÎMÃr¯ªI∏£ﬂ¯ßÑ=∫Au]okQ∑]‡±ÎdãEJóËå=KiÉ∆ßﬂK-zØˆ¨uóG¢˛∑åM¯nNQ1•Êâæ® Á :⁄;kª¡{e\@Ÿıª”!±8ÒT*KLQ0	@T¸IyOäñSıπ™?ﬂowˆ*™È¨r⁄⁄mvˆ˜ﬁætŒÂO◊3Œ'~}£¿˘-ªπ¥Á¿›¥áó:6~ˆ‘û‡˝æz÷Û∆òT8òzø©(ÿ3ï‰'ΩN|ÀÎ¥ò≈Ÿ9Ÿ”,Œà™ë·Ú$fÉ˛≠©≈ôé&”ÀŸ÷{S($Ñ∫<1Áh8÷.Î)b/‡6‹  &<$ƒ«ü;ŒÄ™Çrká2ò+Í%≠]ês&
í˜P#úç¨Öß°ã™˘`X}€;óNü5G H◊Œ%ïî∏®FÈEﬂO√ Ú^oüΩ≠ôàtVz4F¨x˘`¢¿´ÏÓÓ!D‰Ó≠5ÏÛN®ÄQàäËa£¢a!Ç Å3Rõ∆G“HÉGz√\2¥v–í‰§5AMˆ%ﬁÊ:x∑'Â<°iÿæF!ç÷µN¥¥é°) ô*g¯—EíOQæôLªß°¡Í6Û≠BL,Ã4’*–+>Ú'ÍxC◊üN‰Ì%ˆdL……iuù—{ï8ºø˛d8X„˜™b∏K*˚Ü√[l-∆	”–›9>ioQºt|@`¯"}õ pu√íOŒúÓÂôAw¸Åè˘–˛›9]
˛ÒG›–‡-8<¯o :¬ fEœ˜¢-ã⁄óŸ3~—YUªKßêK<F‡–†¨Ò¿¡"Ô™Aì™â≠{Â=`π3d,zã~Å\¸ﬁôˇ°Mñ]|ç¸!äﬂ·)¶Å/*Òm=∂_µh<tDa–z≈¢ıÿÁfjl ı‘c5l˚Ùüj{õÅj &æ“π È¨BìÄÇiæ™ÄhôáAp‘ëT‚÷ŸÍ˜p˚È∂ˇ÷Îi‚≠_yØÖ]ÆZÀ&™ºlFâÌrI›ÿéQjÓƒ0‹◊ùèºÔ∫MjE•yvV…y≈ﬂ Û~õFUﬁ†8oBP  R!ZÒêï_è.Ä8≠6V¢/	©•w.t∑ÔB¿ˇ’ ©Ÿpàˇu6*Ÿ÷‹™˚ˇlPd∆—é·mÔ..67”f_|·z}“â1ˆ˘çﬂFΩbqfÒÏ
Gìƒo°›ÅT—ràI«H∞“:zÆ‡ƒÌüÚcÒR8ΩQ5‰íyvºA5ñ7¢â‚+!Hµ’∑Dœﬂ=ì`¸`∑…5∞∫¸◊ÀÀ¿UﬁTj∑xÒmÜ?°;”≥i§’ú<≤=º≥Ö2 IÓÌ-g0ª…¶÷∞"–∞1	N≤§*∑Ò(0≥…`pmCç”¨∑º∏=ØH	ò∏HßÒ∫Ÿg¬wCƒWÄª<∞'Ú˚R¯åbsÆ§≥ÏQw0Ì°*,ÚëH∂®≈ÈœUm`˘~¯lÖ√Ä2FRoÛòHrÚXÒßë{Çú£ÀΩTûT|^Wà¨t>ä›Zû‹ƒK4Ä˛,O0Öwî*ñúZû‹–?¸ût˚πAöÕ±˜:Q}õ<w≤ÒY}-Y≠L„ôﬂ‰±ùÓ®óÚÏ{¨qrz‹_Õx Øk<ºó0È”5¡®q<Ù/`éﬁ%˚Feº”ﬂ]ÓØf∆í≠±§≠´§˘fõ¯rÆÜ—}{È”p„¬C≈‘Ÿ=à#4≈;Çp<ò:¡0˜#Ê^ÜcπtçªL°"çªòﬁ/ÚÄÃXs“è ƒœ.¢r¨õI<ÈÔ∫ûÎå'íöΩ"/;C>ïµÿOO≠õÚ’„áhãxÆ˙#Q•Ç∂Î∫˛™æCH:Òevª5 ©
›wû‹¨>∏eÀOŸˆ‘ô$Ñ5·≈ìZ¸¨_÷/cÍ~7Öµg/]mªÈ(∫ÙAä\J1v-äP€X…F®≈±±´ojiÙÀ˙ ∞’á:yàfœe“ªy∂ ˇì Ö‰¶g>!±Ä¯ô(ÎªI£5∏˚>ÓSX'æk∑iØd¥Î0â±Böól‰«újaÚ@‹<ƒí©*ˆ∏øûöÓ‡ƒ8N©íñ¿Míê>ìÃ)F¨ﬁb‡ë@8YÑ∑^∞Æz(∏„Ä¨U ƒR0Ä6ÏÈb¯ãï˜ú3‡h¶ ¸(É‘7H-ı’Â5VWœ4ﬁHUÄìß˜aftëSÊX©dúÜ®ù‘¸K*çö T3i¸™fä›9”)år∞≥=‡˘!7
B÷VVñ% WVa+uPxB…∫A¸¶Ãm¨ı∏NÆ„r>4qfi|â‰íÎ}Ø◊sG¯0j˝°ÓL'Ÿ3˘xBg#ªI<U	 ’»·]’_=\¡jı„Iﬂ∂<99…|h$OÉc˛$q∂êûÃãÿÃ·–‹Iç0¢~@Àì˛}’8H»™ëWÄ>Ë>GÀﬂ	·@«çé|(π RˇË6Û¿EßJ«˙pèk ÉzI£ Ë1nõ¶¿?”p·æÊÃak8ª∫3}Ê˜Æ’È^Å1÷Øô¯#˜Äﬂ®tÏÍ∏b,“îhOy@ÖPmL¨0	xBMr¿I$lŒD-'é∫®Äj£«yy&ΩÙˆ.1≥>ïß7ëåK´YWsÁ˘¡·	˛0U«6N?KﬂèÕqEb≠ Únê2u—R Y£!ˇê∞ÓÁ¶Ï2h*˛iÖY=_7¬Á)ß	Z“#K∑hßM¡ª…‘)KhˆÍ9Ëf≤VÔyﬁ$aZ’_0èIﬁ¯®⁄,l~\¥Ç–-|!'T/Ë©ûìX≥Ù÷ô‡2πßV[g3£¥∂:Ø≤ÖŒ#çÖqj\µ4ÚØ'mËô–wòÎ	“°s∑ .UX*h4vdDlZî¯'±k¿îßh~¢ªà–`ΩHè∂À§œ.Ã¶Ü~€‰µ©ÍEä^¢îJÙ÷7¨ß}bSÖ€≤L¬Ï{∆Ω∏sÈR¨8ûcE>!q#N≤ôª´)ùo(SËö˝Óÿ¨rA¶©º£ØÁà“f-7W^3J3π¯É6@‘ìõÕ€‘˛ƒXX+"°d⁄Xπ5hz◊a+á\ÃC–F%7ÖÜI_º!I,› ”mw02tÇäTºX•F—3^c±Ê	∫t£kM#á0ÔÜi/4 Më5Õì kß%“˛LnÚo£0HÙ@b’]Ã¥◊r–”ˆ∑ÀÖˆádxXlò9«‰FZœW¢GqN™?Ué™∆§›NAäÇNVéi(£cùF˙≥v:Òùæ˚>Gá®≥H®∆∞˜¿√rK“æR®7lóE˛t⁄è∂"ˆŒB˜gg H”ç(I^“πXüS·v∆7OOãMt°p·#±Ï∫^CÙ—{r£Ñ†mè6’√˝oNTŒ<}‰§∂|¿Jﬁ‰•ı¬ÌR §«'Ó9Hy˝ù´Ñ“õg_®ácoTI∂-ˆò¯(ßz_É»iow‹âs	eW±ÓóŸvCÄ6„‡"ìw1£nA≤Ü~@à?ìK“h|Œ‚ÑTÀ.ÒÚLè˘9πb8H)ä#J£”»jå6Éã<≈≈jÉ¢ê˘Ÿ˚ÜÌ˜ “ºâ≤Vá_≤ﬂ–≠™&õ•n|Ê•3%M6‰€öS/l‰π0¶áR¢ÑNﬂ¨ÃI∞e¥.Âkù
íÊq#FáöYqß€u«ì'¬cÍ∑ÊÜ±U'ÄkïF*≤{y#‡*Í $sªAüˇ#QŒJ:˙ú>`‰W•M¢ÍçÕD¢¶¢wkJµ®"1u=çUiÎY·∏D ’+8˘}≈Vg≥∞¸D°—:e*JQ≈Øõ(N∆®öç&·/XtüƒÔ‹2g †ÜêS—lèÖ≥wnƒXh…EÆÿgQ‡:Â˚`cäæTX÷¯8ïΩ:Ìn#ı•ˆ+_yÓ æe|!∑XE¬™6∆l–x7æ®ÂjπÚÙ93Z@¬¥O{aTùŸÀAŒ.}Á··‚¥•“¢ÆDÀZjMÎJqÅm]^f‘∏±ƒX`-_]Idı”Øäˆ,sáÈ!Ø‹›+‘Ã≈p¥ß#o¬NÒßv‚FËÀÅΩ"»p«Cı∞¢8ílkü<§ÈƒÀœúöÄß	;t±–„8ÊÕKÇRníWûmu]øœ(â8Ÿ2–$É÷Ô†÷ø T.~Ú¨„‹±è∏È ÿ?∏ºD1÷e@âÁ3¯•c&ÌÕœMÖ∞÷`æ{q¢IM∏.Y*¢S‡]tØGã˝‘1 §*Ã[vÄi∞úMœ9∏d’(€¡$f:”Qﬁ° )ª-NçÃ≤`yl≤	¢>Ö„ìæLjtG≈¿ïßã!∑ºÅ◊Á˚ë_ˆFÊ≤"◊¢nægëZÆ7Q®ó~òe:xÆ§µÍRR,∂+˛2˘b‰èº¶›.s›Y[“ÙãR◊4øüÙ¨*8qéwñcñ‹‰2ywb`Aæ˚Ñ„∂€∏h∞mgÏ\≤Ê≈tt¡é¶Åﬂ˜DÃÿŸ´ÑÄÁñ˙uäóü<<K«Yc@Ñúﬁ|∞ão’SÇˆ“ó¥»óÓû°Í’Í√»iÒÛ–[¸¢êÔèÓ»π∂£»ì˙Œ5nä€†	Í≤Xó˚≤ﬁ`˙d£mˇ{é©áŒáúÍ–W3Â}¡´ü$®ÚhÙç@ı#¿™ÜÓ≥G+k´Ï˘˛s;¯&ø◊2h9ëïÒ◊	úü°ŒF(;”wS™–ë√‹©–…S&†9J>Ë°Ñ˛r¬ß‡`‰∏~+uP˚k—#jo¶Ó¢/
œ«M(≤eMÔ[?TËórZ‘ß“Z¶ı;ÒF]¨@∂Ì`íx∂ÎßŒ$",æê„Ñ9ÜâtÖÄU‡»n¿™ü$√’v◊v±oπ+‹¶ûv…[58\íÓÃ^µ¢’)å]ñ∫>ÒØ¥¯∆‰õ]œ¶˝X˘ug‘§îöò«ÓCé⁄Üz'ç¥ª-ﬁ≥uñä√πV)ñMX:Úd”Ëô{—‹@V⁄R B&í≤s%€¨æ™˙ó°±⁄ƒÎwìkÛPãJ˛¥+˚)hèÃüö˘ê°qÑ*Ä√´@òZ»éÒ¡KKM÷DÆŸ◊À”RuKä9ºÃ^QπÖh≥ ∏ñÎ£ÙiÅ  ìübŒﬁ<àIA≠n∏å3»ÎºjÒìøz∞ÂÂı>‡ñ VR9/≥”¿â˘íèºUìU¯]F¯•”õå÷˙iá≠±˝Q∑øƒDÅáæ7Ù˛0ùÙq4 ˝çEÄ˛ùÇ˚M∫˚Êõ»‚ò¬TƒO\ñW÷vSQe∫†¡Ò§æY_π!|e‚ãb4*¨tÊµíRYkrë Œ˛«óÀJKTT-‡$&|ﬂ∞¯sÇ·7ø>œBÂbKE“L_rˇ∆√ÿ¿ß‘<(iÂSÎß|Zø_õæÅâüaX†`…}K¥ ¶d©å2¿î™†Û¶œP?,–4’iùÜ¿ÄÓè¬…4∏=}ú´úË\™‚µ\U1’k±P›]˛≥ûwÊ£û8êV}g‚’Ò?Ã∏}X´À∆ù˜<6/ù–À§∞„ópyç©OÃjÍaÕ≠ƒ=‰LZ<ﬂ=p‰ÆõUõC◊Û3Ã!è±ñÅio≤úàA+)™Q 0}uwè≤VË+)∂3ï/˛}-í&8Í}7˘aU”∂…7å»“¡¡∫Íó∞éAÎìó
VéÍ=îÈêzO¥ı4M5ôuÕ(ù˚ì}#JWéŸãVW0u∫∂Õ–Ò‰·ÿÓ—w∆vcß◊£˙ïçÕÒ∂	ˇ1¥¥)ëò©lµBóÈ˚¢‰¿ñRq@ﬂ°ˆ†kL‹‘<g∞ƒP‡Øá¿˛ô¡Î¿+å≤*¶&K7PC$lW£æˇ	.Œ™+ˇ∑ÃV´5CQ)á-çU*ü≥«Ïªç≤”3ˆñWE¡JÃø“ÿX[bUµì:€X¡$ˆﬂ=⁄®›÷ﬁª€J}zuem#GÃ”˝ª?N…´x≈Kwx|∑∞¢Ñ¿;∫Wn≥tAkõ ‘˙ÇåÕä{xés¡Ò£$XUä∏«ò›K‡§k#„A‰ò[⁄ŸLØ9Ôb¥œÎïq≠ZD—ú§å„µmƒÌ!ûvÄŸ–Ä®óÚ¢≥Ωπj>¸Ú$≈_Y1∂’ÏéI±Ä;Di@dIm˝>1m.ÊËH“r√‘ø¬6`)`˙Ñ:ê&Es§;?K¸H	tñbÑµÍÆ;ù
L$«á8/vãi!+œ∆Ÿ·Æ$˘à∆Hƒ°ç ∑Ä§‘)°ŸVÛp#‹æ⁄ÿPáæææ±∫π	wÄD˛,»ƒ:*#
gì>ƒtßÛÊS°•«ˇU43ãÜªÒ›ÊÊÉG˘cÎ∏ÉÒÚœÕ-ññí3ƒ<≈B‡	1;ÊõÒ,ë/j‚)E™Erf`D2x º$µh>q¸ÍKò(liâøJ £î,ØŒ≥xG≤w–Z0≤Ê÷Z‰ÇWp€ÜŒŒ+P.ê'˛ä∑¯HÚ[<ö˛™aÖ‘ﬂÊ*MãbÍìPxïB?ı}N7≈ûˆ]†]∫‡iÙmﬁŒúC˝êÆ¸Cçó;ü7Á¸£Jc±ÅÙ§?ˆ&ô‰Ù—õF¸-XÑët^4ÆJmQW*Èzh$]wAZ¡yy‡S7]¨™Ñ#Ÿuª>»&ú…Fâ'@
¢åh%g´⁄ß'Õ˚±yÿ<2¨%äu⁄'c˝,ViFB±¯ò~î¶<H"G—-¶FÁ¶5–à¸çﬂu ñ◊ó≤åı6‘√#‘Oá:su˚IÚóôÕ0¥KÒ¨YC3YÇ5‘„∫M@my¥ñ'…è^„8‰’Å3]Bƒ¸OdØTÙôã¨k&[3K ΩÏdùf Z$$â1@¯°Ò(¡R˘ôqçXÕˇ¿V…nuò«‘w$œc—«Ãi>gYc”∏ö“Ò£n…Ÿ/ju˝òò}ZI·’ªòu4dÂTg≥s∆Õ|¥˛∏nl˛zék¢à¬ßq`M˝‰ˆ 4Ø0;^JNˆE$d«´lRvºJ&f«+ïú›‚ùÇ¸Ïx‰h«Î”¿ÄQÏ◊'Öˇ≤¥≈P’02ñ∫A5fıÎdNÌ-Ó“ùn“–´ÒÅÅ;›MüÖ(få∫F˘ƒéGFú4ﬂ+Y=”¶yG∂› D∫7Úÿ%öœ/^ÚÚÄÎ¸ü®:!œú+ßOo[‚•ÑK|Í`JÀ–ßé«∆nà∆xv	„úKhºstZvbÓM¬QöÁæﬂ3)91öÖ]O
‚πZZ-mõìOO±ﬂÎãaøıf‰” Mµ;˛XØ|.÷OPÛ~¸©ÿZıçUºZaªX'Û(R;ztl.!T0A∑Á wr(øÎ¸˛ìKªŸ9m-r8X¨Ã.NOö˚Õ#ê∏èö/õlªy“<zû73z6ñP‚»C€eÉ\xèÅÁí:,±…%û¥ªÊ></8)RØ4Ÿ,sŒÉQLÉ—±oŸj±TëÛ›<à[µèLHZ…•‚˜9ÀÅcà /ê”ÔsÏ‚¨Õ1rÙ.,›S4Ó<Æ	]{M´;ú—%÷»Èg2rÒH±Œ∆Å2≤Áè@¯˛•—íù6É¿πnú˛∞z√∏C˜ñ®ÀÓ|®Æ,±á¨ŒTwÔ ¸ÙøYbÓp<πﬁ∑?ˇoa‘ıØo‰k∑olÈÏ9—Œ¡Á´ÁõÁñ≤bÏÄØœ`üS'Epgx«D"˛›¿eí+ÈßBÓ|géHÍR“W!≈d›·OOúû7EsŒÉ»p ˘Ié(ºâ3∫àÇilHríyÍõ$è—≈”ﬂ ÈÓ… 3 äg,œ”–ÏÌØ≈∏¬;?Dp3,)Î¨deù£¨S¬H˝B¯Fé›¿ª)œL‹Å7ÒRñﬂqœ¶ìH∆!Ôïs9ô‚3¨˚+›Ÿ—≤üÆ“ŒWÕ,ÊPÒõpº3ôÆ∞N%ûœ⁄<üã∂æXoî–Î¡ÁÖ_æ…y» ËâÜ
|0¥N¢ﬂmF÷B5⁄a)œ!#â?4v˘óŸ?%≠˝œ1/P*Àxâ|«ìBØqõπÀﬂÁvﬂCßÓOfõï8Ñ;‹e≈+"7êçªE‰Úâ)óâ‹∂‰N—û8√qæﬁ’¬1/e⁄≤ŒE°Xn÷É"7º"Õ™ıÑî u´∂»ôìE”¢≠(“Añ˝µ¬÷CÔ√60ÆΩó>Çwe8LºÒ‡∫‡=£g^yN+9g˜^0â]∞Ãúòƒ˙A…X „çd…;>´«ÀÕﬁ–:◊˛îRä÷æˇÍˆ˚Øæ:üé∫î
ï∑´ªQ≈≥„t¥ªP\‹~t‰º˜.úâãø¶°‡ø^x<ñœë¡¢áÅ?p√•Øn∑X∫#@ôÙÔ~Ô˚Dó[¨∆œH>zÔ{‘øÙlã9£ÎÔ£Ô¡Ô3>‚åæèø7´â7i@å·‡$ŒΩãWØa“5T◊ÖÍ;~ÃûWÁﬁ®W≠<∏ñK±Oû<·#i`Xº®g0xÈé¶<qœˆäñ["ØáËó∂éúˆôÔΩË0y]Wæ%ªÚ©|H<±™:˛6•‚_aò
◊È'=/pÅ'L‰`z∆*{‹Óî≤ö`ù´D/1˙<;Îà!ﬁ.ô&B3∫®Ö©πlû{é!Nw5ã]ûéπ¯◊ÓejÓ¿8ÚYrÍÿÅwæQÑ·ÀÔÖìéﬂÛóƒXY•ªy·Ñ¿áwºaE€Eÿ°i:p£^vúŸ v0œ@‹’›!NQ´ÔpÏ\√‹Qª®·⁄¿+(„‚mÿ7ÏπÛŒ3Œ√Óºw‚Œv˙n˜≤˝7S'p„ﬁö¢;pß\…Ÿn8iÔ]•„ƒ¶Gs«œ$7^˘Ã˛º€ÃŸ8wŒ®ØÍœp∂‹â≤úb®∞mg–ÛıÛ6â∫hÅE,≤ÁqW/¶	ÕZ˝´Ôƒ®3/£ÔçBuoÒ)ÏÏÖsÂx˙º‡¢ÆC	ce˚ºO£Ó\x}#Ñ¯Q'XÈï”†€«»¬c
W™∂ék∆πX‡:Í¨Ât/ÅıR #t©<µt/‘˜D˙37µ_ÅKI"‚ì4I∂œMsÿØ`GŒ‡z‚u„eÍ@G(°ùéïqA+/ÙB€°3joX(ë\Ÿ6òFw≤¶Ï%wˇ†1ú¯CD@˙Qç| é0µ∑ó∞›ct%W?û{Ña( xC«/¶gÜMtj•.⁄sg™.ˇ-¡;è7qhÌÄ‹Wñb€ˇw≤Î_Na‹Öh«Ωt&∞ﬂÊûˆÍº	kwZÀ?ˇ‹i•{˘–ë$P’:Ÿï÷Ö=TæEM‘:’V« ©Dâ£Œ@–r=éa¢Óêr#§"fi^ÜÆRùiœã¬¿˜ ˇ
\·ct%fmx‰ö0æ;¡jô àƒç›∏@›I¥ÿØ.a®∞*« º∆ An"ÜÉ£_ÔúUç4±·ËàÒØ‹ﬁ~∞+öDå^&öÕ2x7˝Ä£“Ù]Âº¶≈/˚R‚8•«5~íÅ,ÒËı˜‚è¿Ö©é4”ox£Ó`⁄sCZ÷Ü◊´ÒWn£µ=§óòÉI‚˘ˇ  ˇˇÏΩ…r‹X∂ ∏èØ@xÂÃ†;›ùÉ(Ü(EQC§ƒGR≈«ß ›A:Çpá'‡.ä¡§Yı¢k’fΩË^‘ÆÃz”ÎﬁµYÔ˙™˛·˝@◊'Ù9Á∏# 'ä!i¢w8˜ÃÉ…∞–√}®˝Zvœ?´tZÃŸ«s}Åä-∂˙/&Ò•Œø.ÿm˘Ω]––(&ìGn≠TÊéù‹™Ã.´<!∏vÄ≤&ûçog„.X˚¶\}2Á’”ﬁdﬂ†O¡≤Ωy"ò'[¨ÌAÂË¶R»97L0ïOF)J4mSEèAﬁî(•P‹1eW^ıVk‘5Eü‚iy72Cü¶˛TM}ä≤æ¶Zpxi≠CÅ≥É,ù¥ŒíY÷ G¡Oòf†sL”Yh≈ô+¢∂≠A3◊O<	QâıÖ=®õÿ®PÕ Éö¬˜1U˚TÙQ/UF∆Òu;<∞Z÷=WR…ÄÕ`0c;≈SˇQÏÂ3¥(E¡;T*±•ﬁ¬0Ô∆Ìb~äÿ;o∫R∂ÕJhäÔ3=ÿ{ΩÉ©#≠ÔﬁÌÙd¢,+ábds“èX≥1E/„nhÏ4îù`àˇ9ìπk’‰WUEFÌT Øé©H%Kﬁ‘[πeˆ¯Ö†õ
ó¬¬•◊vµÖ3$FFgP˝´Ωwœ∑ˆ‹µ:˘‘Oèw∂_˚ Mª÷ΩIyfô(Ø®ÍMÏ·ÒÕ˝D`qiΩﬁ]-ë√A˙ºMÜ‹©¬Zi¨L-Wï¢…ãÇO≥r¥®ù§‰bÉπıBWÛπï§(≥ˆ˜Øê;Û‘ïu%%S•i4x2UaÂ:î˘Ω∫VÜä>I%¿.†∞fÑ•&”÷:¶,\·òÄπuMØ≤v≤ÚÆÚQ©?˝.:ªåßÔ¯wéËf˛¢Œ*Ò“6W2≠Öˇí√u¡Ω’ÃÅâÒÊ6óc<#‚îõxÊ7Í]ë)óı‰-éÇœ@Ö¨§*/ÈXÚ—πœ§Çq¢»3É J„âå‚=gïl‹=sê˙ït}ŒL Å¥˜ï6çÕ£Ô»3»ìÙ≠€Ípe’„ûc©h±¸Éw≠"Zµ,∑ûæ–Ó¡ΩeÜTx©x^£@.lNS$–F¶.äs„[$∑%Õ« ≤+!ÕÒÓ`≥¡z=à›˘ï9éÜdÆ(Î¯ê˛+ì™I»Ì~¨4•Cj(p¢ä"æe4eCÉÛ∫∆21FljqdÓ∫ÁfáÍyYZ’s7!OVÕÔ÷(g∑|_eÇ%/€¶6≥ﬁª+—#ﬂzÔ∏M∞dxeG¯1Dù:˙Èß”Iæ±¥∑'ª›Ó˜ó@‚xΩlv{N7>≤ÀèQ|ûíÒ]ıÌ„Í4éãXµËNˆŒ8Ú%u›˘ÇI∑F6iWvQáπ–œXXÆåá±ÃjçÚæ,&·Ëw¯*Í!”Qúì2ÿÉ™ïûÁ\ô:ŒJ~≤©®‘ÀØr–/ñü®çÓI·¥?‹A›wÉ‘òéò˝…4æ∏ÄÉá≥ic¡Í»2Ñ+;Æ±±"≈.∞ fö@3ÔJØ[ú|„√SÃ8∞â6±Yà∏«Ü\Œ@£w≥i¡ ‘aÇÀlœOñH≈¿~>YfÁ/æ` $íi?‰0 √Û ÌœH	Ê∑:Îf˘⁄Õÿü'ßsŸó•yŸg2Ê¿≈∆}íGaÜvé<ö—üßYá1I#HÏÇﬁñÈw1Ãå⁄øî?ıw∂Ä‰™Ø≈9Àqgûﬁ€-~k/ûáI©/bˆ8Ùﬁ†∑æÂ?‘Wû4
Kt G5âQPm*w]„Ä^¬ÑL˝Íh‰›Ú1Õ®1⁄ËÌ˜Úß6.ºqx⁄ƒˇ™äGƒviG∂çù@ò≈£wå•\ÙÂñÍbLù õÜÀ$û–å5À•pﬁ§xñÃËú 7œPlÇÃ∏ÂbDoxÿŸ¥Ëò„yÛÓÌÒ·÷cL∏G¬	”9$•‘å5™‚Y˘¿ˆ"7f¶s\{;Ø∂ˆåQ©Ê◊òBÃû·ëxR>û≠,è'“¨ghÎ‡›·÷[cH[pÏÄÁuêy|ë:«#©R5ÏºFƒK j∑HC‹Qà∑Ó —àrÜÇM˛MhŸ¶>£ Á´(€ë¸:wÜHÙßÖı;Äf˝,¶Í¡ÛuÛµ=>D;0ß%1. qRmØ∏[4“,	˙LAhQ∫ˆXÿq?öùç‚)ZøÚÎq?híó,»-m¨¨MÙı…Î„˝=˙ïê‰©≤ÃQc¬Õ—y8K¶M≈§eÅ^Ñ‰Î/î…£∂ô™ñoRÿ˘K˛≥µ˚≥,É>è)o¨∂`¥m∏Tºq ˝«ªç‘L‰•ÆΩ¬Wn˙^Pv÷zOy¶øNÔÎÙ†âÊ>znV1&Lº6åáKs»Òên\k–N«ÿk4{h0]Ú EÔ≥ù©ÿãYî√éYì¿='`!Œé¢Ïc‹áÅW¶ë ‚∞‚Ùy h#TüD\gı∑≤~Ím>6ı˚‰‡˘5„aQÁår{-∑¶E˙L]∞{ÙéÁ,XPõ£né¸ªÍ›ú‹”¯„M≥Ä⁄6ﬁ≥kbá/—˙“Ï.‹oûˇ†æ∏-≥Nï∑QiÁì$Ük7⁄ìt“\ .\≥ö≤≥)«°Éê
"¸qA•1ñªñD|K8 ÇÕMÇA"ø«_6dÛ[åü≠!˝˝·û≤¬Bãî0K3 2›Ã,Yn¶=ΩñŒÉÙUà‘nÑÊy>>@u4ˆvC1ﬂ*òk%bÏhËd L
≤„ÁÒ8&˚/¯|…Ââ>ÚêŸ®ŸxNfπ¯*]i*†Ò<AB‚-fÂåö'DÃqB
3∑s≠’™Ér,ÖnèU¸GEáä.kSıK·œˆ˛‚o!"·c*qáòÔÕ˙á›ìÇÑ'èı∫" ;3¶Fá)jXR‘2›ëGôl»€7ÇŸftî8ió"œW—≈_Ü]c«À±∫πO◊„’0ˆyù˚Ö“¬ÓÀµŸ˘»> Ú√„2È“-_⁄z∆jc"çsyétÂ.’Ææ∑É2€3ß«ï£·Üì˜r4§>è¢—,xœ>≈K—°≠ÅÆe›4O£hœF’Î√ºﬁÄΩ∏é—KKº;Xô6øI,$(nòÒhw∞6˙‘· ˆIÙAÕ]î2»nª”32‘pã–ñ“≤”~ºÆ∑4F
~c¯√È(yâVpF¬Òµ®ÄáπQ.ç¥·5a¶4¡ˆS^R<¬g˜*Jâs*≥⁄Îﬁ.Û“\’Ì$ùxJŒ¬∂jùÓ-A|üáŸÃÿyGπ
g9Ló_µ‡¨T
Ò>˛≠‡
b£ÅU]¬÷(L.∞≤Ê˛ŒüµO:ß_[o _pN¬âÀj¶sZÁ'd5≥{ÖÒW/á`I?c≈ô≤¥xÚ∑iqùe£äöQ]≥ÑTr°¸\qVî∫)4?Ã
øÅ’qÜ–óôÀò=⁄&•:Ó )†µÍäg™‘4∫váI¬¥o7JOlÉkKÈæ§ˆXgÃ(VQm,Ò#_†C´l fWKzT|∑…R∑€˜êsÈ°˜Æ÷Ÿ≈-ˇãî9∑≈¨zY4:≠ÊeFºÊ«Ë¨µ¶Ÿä	œ∑∫›é€M.Àˆä;√∑på®Ö‚ÿnŸ]œŒÂ5\)s|Rp∞”
gÁÆKDKGí±ÀÓ2\π£Ij•éI ÈÎÑÈ mıùüA°híÖgÃ∏%%D¸˚˙?nÅ”‚x„é9ïs>ÇcΩôEÉY?j6√~Xz˛æ
& ¬E/-Oõ&«≥3ãπpˆÁ©¢°â˛æ©Ô?wÏ≠√¶Ê¬ÍÙçõ6@‘L"ÓDÁúΩ^a#áW†u"◊'ªv†ßé‚ZÒäYQ—Ö‹jT≤ˇU¯ b¡„ª∆RR…ÀòîﬁˆD£>Hy9¶jûß¨Sﬂ£ú\Ç¬Ì$^\ÛîÈrVÈ:4ëo†"8ÂG·ïU´¨VÎÏõŸ`ñ¥€û¢eûË'li™WBƒß3èÏeÚ»Ó.ı≈/˙önT9E±KVa≠?ÿ*®g:”÷üÛºƒ„A8ﬁpÆÚ~GNwsGTË˚ÏÕ	â˙ã â≈—“Qa∂óÖSvè˛.KUU%ò¯›©C-P\∂˙I·_i ˛wòå_Aè¨ ‹^≠®8Æ≥ùˇÀ‚24'8æí÷ÁéY\∂C¢!9Øñt`:dWI¢ç≤˝+/ìÏŒPı0âj”z˚∏◊≠+ljZi5T”,;%¿Òï'T,w†‰ßÌûLoè	ùÌú±Cã(.v≠ÿq9CâËÔ+≈y¿∑•J¬<ã	:ÌéS0≈ÀfôØN£åD
P_6U<\∆”ö°=w∑á≤π§o_ãWjbõÓ
*ºıÇùö˙¨û“ã∆õåÉ*5*ÿ√r<fKk,a!Q™Ì≥Ω[Zkw8ˇOD§∑{SUÉﬁø∫é(¥ÿ\9›FÀ^,wö˘‘_-ô∫t:^ü¨ªàΩÿ ©?È¥{®(∂ii)O)Oß†<•ca"jªúN˙úπÔ:©¢åË|“¥1hiæEYô›C8πœD*J&ïÁÀÃ+ÃA8V2Ãr›Öué$y.N)Ú“∏ëû5e){¸eÙÊu∆Â6ë—é…Óh‚≠@ÆRıÒ@≈¿q</L‹O.·	:˛úÃ^˜k5<·'SØ?˛™}‘≥™r±Â‰Òπ˝2ÏE˘XÑ¿”+≠†F˚%}<J6V≠^°æRV∆¢¨∞ïoó∂ºP07^w¨pŸU»ñò =öåo*,ˇg˝ôÆŒKÕÔH Œ4°^´îzï"Í„,Ã±LöÇÀ`¢ú«¶Ó:ÍÏf—9c/π„QŸRÅ$BVõu∞∞ä§MŸl|8√$«eÇK%õçqöN"ÙÂß0®(À\A≈U„–™‹óÅ˝•¸gI∂LÔ‚·Í±#ÍÌa ‚_yƒeÔ«ÉôO7CÆÌw«ÃÆ>Ö-^Œ4◊∫8ƒtÁ$w|Y-‹?(D5‚öD0ÇY	]9ÖöÖ©‡†yaç0Ù:> ‡à}ZCñ~Õˆa·∂ü¬rU…‹+∞à∂n≈(¥‚”˙	œá#=~
R∂Èµô&fÒéÊyî ≤5KÙ≈eåè◊˘c≈t˛‡äbxF·'ê[IÔˆgI»]⁄ª`Rd˚Ÿ¬$¥≥Òt,ÊÎÒ)£1”1∫ë$qÉ‰ôfY9FÛ∂E§ÓêVQ=Ñòñ{<ê9^À ÎœXBÛÜﬂ;oı9rÑå’'D$È@ÀäÇ∂æ¶D¢ËD
Gö≈í§(x)J·ß≥Xíi/ëm•˛G\frÆ§d–´T 4í—8Ça±°ÎÅ∞•Xaú∆∑™MMRwœ“®PÕg ¢≤‹î∑‹”ÂW57hç2ƒâ-<Ükîë†Úk%Nè¬H~¶NÔ'@nùºç¢qº]Íóπ40RÎ£àxíY^•˘S‘æ÷V|˚úÊ+ımé‰¶™íEÒ,¡_´ÁÓ„NΩvù—Óôg5Ω§7óèπÈê;˛∂LË>≥ÃÀÏ⁄éÁ2úƒº¥.ß+#·ê(Èœe_Lgõå∏≥·?Aû„{ÈòÖ∞lﬁÿa-.0qòø÷åÉgΩUÁ$ñ€Æ?≥5-ﬁbı6
›;é≤Iúƒnûπƒ®fO›Á1Ûˆ‹∆%ùªÚÍ˚yøÉ$â'ä¨ËK2T¢ñµÉ2v˚¶à~`AÂ∑eÍπ;‘¯˚ïÉÕ+xŸ2®)sh≥·S¿ñßI˝mÉ¸‰y<`ëfﬂ2øs´îÄõìŒÈﬁüZ´<ª≈] \ÀU†¯.¨∏∫∫#CMaYÛk¿‰©Èp}ªÉ#§ÚœÁp¯Õfâs@LÊQı+ÄckùbÚ˛Rj>S-·<Æ˘∑AõÉ•m˙e~6æ-≤›Ç´äj•LO_nÒNM¸g©6øÜ¡Å}¡◊ãøfÉôﬂ’	z!¨Ä5êMsüàÚ£Ñ#	≥»ß`eáIîı·˘Ù*ﬂºY˛Mûë,Bﬁ£æ⁄1ÊÏ_¿Ÿ
’h√˘<”J†ÆD®b.Ñ9Ò√Óè9V˙öy*î
î¬˝ªVPå∞
ÆÌñ1ﬂDCƒ}ƒØVÀÆåm¨/«Ö¿Ô´Qop&HB…Ñ§®9E;îOÍ;¸Zl£ñíÀóVQTa¿´ôa∑æÇj≈ëƒ∂ñÇ™◊9≠*V" ∫ù}éÓ”R‘	:åŒaAÜ€Wö"á-U+üƒ„@g˛ŸÊÆ8C'ıtø~<ÀÅ›ÅjY÷å£hÄ'˛E<AãYG›Çç9Ìî‹¡ÚæØ~áz¿w˜)üÔ6[ZûÃg¨<…Ωc“Ò~ò]nÂòz@<ﬁ ¯ûHÌU72˜è÷?•Òa©ÿg\ebÃ*1Í∑±ÑLÁm4C≤ÍÃ8∆ámhh4$•uëK»àÆv´åù˘Uüh{˜;…vÌB\QÌIq]kÓü6dc¸Û˛‰òèò±˚e›Iè'©…'1å{M(πjou1@¨v>érÄÃû›ëµ0∫äòÁ…”◊∞(Ì)(é#L’©ÀVéIQ„ÌN›u*NLø@óóß+…V>ﬁ/F;‡àÎ]ﬁ]ˇx5ÛŒqaF´YéçX¡ö„(É˜\É¨ìœœxU%Tˆß
pŸÓçTsït⁄°¯.◊18ˆ„Øe!√n6®é2wp4ì+S`¥7·F£&¬¶˛ƒ3ád©7&!în˘¢S≈0ù\"â•Ù∫pEvÀ+5‚PÒ¢\$¨;L∏‚==*ÙØ›cp∆≠‚Âè˝±© ÔŒ”W•7ÛÕjd<&t‡BXy∏™7å†XÔj∞®Å™3A[ks≈ l®!	K´Å·î›Ì¯cV-9f…e@†euzˇ"é⁄vF€∫ñAX„“h∂ï”"è∆ﬁŒ·qy¯€Zr+ìNË◊ö?Tä]÷ÁéﬁooÔïø&>)≤Ú…Øäï CŸÂÎÙ´Ù›ªõ<ya>Q?2ñ?ü£yI˙û~ÊIÍ´≤Äp•‰5˘˙]S9©rwlØØoÖó¨Í¨Sƒ¸UçS∏ÆÚ€Œ´«ÒH8Øûú.ñv”Ê]ÏµÒE<≠(ãf«3L«ZÛÖ€RÔ““Â´re∑◊∂Ãz(¸ÿÛÒÃÔ†ÖáÑJeqŸ»Î:ßœÈêŒF6q§¥÷ÚÁ)vª`∫Dõ¡Á¸mST±º;Á¶X•ÆÜ∂wcÕLnCüÍÎªÛÛ*'Bˇ
ñ∏÷»%±"”yπB„Ÿı:£ûÔ(∫ìÿV!â∫íH–ì:ªlzvêD{“]ßÜ“O”'R·≈< 1|b,ø‡,Ãf‹˚#√)Èª=„ü«e–y€™yP-â†óù;r¬ÂyZK–cz®
YO(ÿWÍyl†√∑œ/˙
ˆz
sKœnv™j·Ò9¶ÿ¢•JõGxTo∏3 âøã⁄∂äŒYDõÈHI˚Ÿ∆… cÍŒzı¥ıÃÊ‚}ë+ó˛˚6P™›≠´]]+˚$Œyyp%∏rß"¯≈ÆmÄ∏)À^¸÷^Ï∞¸¡{Á¸<ÍOõM+Ÿ≤pøÑ¨!LíÚk±˛âf3¬¸≥J2ˇÖ6wN≠#2_≤xÓŒp0†ñX #'öç}≤≈¶“Íc«çEm8Za WÃÛÍje–Òéêﬁ—ÇˆqΩı¥¿ÛÊ
Ω±6]˛P/8Fw6Õˇv189eﬂZZ
^c81+1P(’yö£Ù˝Ωr∂˜ﬁ›¢:ò*ÑòeKYøﬂ√Ò·OÄ/˘(%lû–àú>Ì≥tp›¶íVÌI º»ßç≤÷”th˝ÒÜÔvÚÈá≤ ¡a$E– ¸¸Ò™¥o°^¬÷‹AXd`ç‡ xÁÎg›I◊òoy9≈⁄≥ìqW˘DT≠ﬂAˆ‰8mvYj§] _1oû)¯K–Í˘Åø(˛ÎÌ_Ôb»Û¢A9?<∫y«‚Bù>´Ü#ïüD≠ôáX_ïY%zk%˚¡àÑÁ@¢/à™ﬂA„lfóJdBπŸñkœZÑlrÊç‹™ÆìNª≥\É76k1ÔÊ¬†–W≠®$ú¥é,+˘áÓVÔ˘ „Üñ€à—w{äß•Œ|±¸ƒG'±KKQ¨ﬂ*∏ßÚ4≈ÆD≈¬º∏y£Ìº⁄%i„5s•°Â\ng>wèNE∑kk‡R
X>ÁÑ†}Ü⁄è·ÿ¿B∂ßu’„[Ü,eº≥Z£©=uîää|’Å«´yÕ-c?µVä4«KÎvÏÀr:õ2s≠BCJucG}VºÓ"`p ˛“>£3÷–ã´âÔß·(¨ ‘:å>fÈX…√LÂ\ÔUÛÆm‚ W=Nø{µÂV]◊å¯Û‘ëµÔ˙ú,ÊPSÆ†÷k÷∑J/.Ù6S[KQs/Pót´PQerà	Ωy†K†º?ŸÔ‹’Õ˝ñ±Z- ∞¥ò)^®Ø1ÌI”2X]◊“¨ßI:y‰“JsÁ¶O}à:GW¬O†÷(ŸXZ$çrˇ|Xpµ`V°¥«5QöU”åºßz¸'˙∏"˘öQ√

……#JF∑á^g]¯}î∏2™äe3?°π≠î†"}Ä“øN ©ë#8B‰&®œgó!ë“œ	jøFÜ„^´®∞%≤.˘/…õ{sﬂÁ#èOqw’m06eåÑÇÁO„Q¬Y∏ãÀEx∫4ˇ{h9~™…BÌ,"/Ú&/‚“Xw°∏K7Ä97£3Ïï œ∫∆Ã¸kfs§e‰¥1*•∏ŒÁÁ|~1ˆ∆≈—h,œoíΩ1¿qÿZ–EiM|i#òzïü+s^2«èKcôY⁄Å∂Íó)és √iö›ø\±”F>øÛƒÕÉñvZzMoGÉ
÷©ÆÌNbÛôäj˛z⁄ı
U›±Zr©¡rBŸÇ+j!ó&≥˘öÜ®Y≠SŸÈ™ZUyìc˘b?å«‡¢iê°.bå±4üè6H8kıÿ¯ce¯˛!˛ùbÓë´çhÿ≠±6k≥®Lså„U‡|bÿ»ôΩ’kûTªü6Çñ;◊Æ'œÆÀ±Øπ9kL)}Ji√ä¢iV¶Küñ{¢öÛ'°Å]oØ∫Ò`ra&Ω-¸ZÍeÂtpÓû¥zOß&”:Y‘Ëù∏\á4–§Ëi⁄]´Tíw  π¡ÚNÄ˘´Õz)M~Vú@Kú∞Í iò†Í`´oËçˆ(©–˝⁄7,`⁄üËíÚ≈KK@9FìtLÂpxê^¯Ò,îÅy¶;JúSÆ‘h∞´ˇäW◊[≈Ôê¢tÆÖ‰©_1bıÃÉÖõíŸ‡+E¨QåoµœÅ°i63jú1∆©Y¡°™U≠Å≥ÿ≈V¢0fê“E^û¸5¸ÿÖø
qá«œ# ◊Aÿ5–€ÌvSaÅÍŸ¿ÕßÈ’X;ﬂ”AúEó”Y—†iLˆœÊ`£ﬂo√Å≈yNQ,9ªŸú–BL⁄‰hùOáR3∞ Â‰g|ˆx5P¶ı0Y›”ó-”Û0€¬GñıálÕå√„]ˇRXÁÛY–ÿ˘ıg∂	Ø!Ö®£π-~ú~!⁄ùú.8wÒKe`@iÃ'Ê¿`9Älç[£0ü]Jz	ÿ5 0∞pZÄ—6 ™Àúã§åÖ6.úL≤Ùcò»· uö–N:Ì_*#ùÉ‚}&·$¯o%<"NˆäIﬁ∂„¨üDãWòl`˙®¯¿æ+œçÄ4Í6á1µ.¬cπe‘´‹±ÚV
Uﬁ.ËzºHì$Ãé‚ï}ÄÈ≈∏ûŸüo|çÉ›p⁄Øäµ≥◊˜óÊ ‰÷%@Ax•◊–Ö¡∆?\‚·˝≈w˚=¥“∆∂&`˜ÏÀ_˝Úõ˝∆ΩÄª?I‰Fª}*¸¸X·∆8g¿ﬁÄ
e@øØq
ƒ«,IaÃÈ† â≤¬>0\øpO¿\Ñ™%(_ Aú∏˜‚ëØÂpP]π)•Åw√/u
©∑¬Âz¡“4g—ÿî4√∑hH∏DÁ»∫~°åBù∫áÓ∆„~26Zé1ÃûGN^üÇ%kK
ˇ04û|Ùnk∏≥1cÊY
,Ô»∂g˛ÑJówŸ‰¨µÃµTπÉ˝¯$
Ë™d…€?á∫†˜LA“Ñ˙x’0°ˆ>ôÜz)O,=ñÒó'ù›ﬁ‰”Lv˝°µ
ˇ….Œ¬fgë˛◊ÓÆ.ú*1#,·»hCTe"Èczéπï˚<ç6Ù]ºœJ;c¡$4ôP-F¨øhe∑Ö¶Ïoú/4g?p`
˚±bÎÀ(3Qó˝C⁄Ê•U’?åÕùçÛÕ.y∆87£éç„ .Ç&VûóA˜≠”÷BF“j—_1¶ú∫¨.µ≠Wæ˜ÀﬁÆY!à_µ∫À®y¶=ßrE/U,“˝E ™ìeªE∏ÔJGØ⁄+#ÉÂ}VÂ∂≥jŸsçmÆ[iE∑¸∏äª4‘Lø 6ì(`Õ™∫l•ã≤∫==ﬂ¶£¶“cOAﬂ¡,#´D∫QﬁÙJÓ:>ÃÚ€»v•!~ga°";J°y¬v¥qÜbÆ€R∂N>w3ª¨´aØ‡Ñ:gUÔëVõ:[·jŒìÍ>=⁄¡5û›ÔT©±‰˙1á•ø≥Ù™2H¢MB√=éî≠=6òáïF´N2 Ÿ±Àœá@:ZTøDπÎtÈEù∫ºuWe¬r*;d‹:Îx˛öÆÉË,¬]«õ”uÍ¥\èKåDqŒ‚1Ö√˙é[…asµypÍôÿØàÏÖ>Sl∑Ü˜•û3L°<zƒ^ö6mÂﬂ*πªÄOrËeŒÆ„4ÃßBò”+xp09Ï1âÉÏÜa'¡ã¯2Ü˘|Ÿê
?|KS€Ò◊üâZBá+ÁNquÉ}®ãÎ È‰Øæ|©‘ ·j®zıíÍãû7Ï<WüpÊoÍr˛ÀÒ˙/â$¯Ú‰ëFÜßN«ÎÇ‰r’@Tb9»Û¡+e“Ê0Lœ:Ç"S9\9ü7F<πNI ÈüD¡ÇÙ‘ ç!∞Óm¿∑:@5 ‘›∑ª«ª[{wﬁ°^,JáÄÁÙÉQ—k¥=8|˜ÕŒ66>»R¥ã˚ÓÏÏΩ˚~gZÓå&IzEæ¶[GG;ÿ„VûGV‹ï]',øÙVL…5•–!∫É÷
¸%B]ä/¬ÈœFgQˆµ˙≤r¶xÓSñdû	’¥ySF(è©w>∆—’ÛÙ”f£t4∫tE–≠BzÂüÏ©öî»G˙iîåÛMÚqÿXZ∫∫∫j_-∑”Ïb	™Œõq44	ß"9¸`≥±‹[Øº^^∂ª´¯Áz Ø@´∂◊Éµ’ ÓÆwË4[]æÖˇcÛo·ŸÎ¯˜¥Ñﬂè®£µu¸/æˇ,˜ΩÂN \3¸˜5ºÒ-º±∑N7øÖˇQö—≠(õ‚í2\Ë#›kê%øÌ≠Ø≠Ú¥WÂk}:JA÷uMˇz≥Òhµdõ$}l˝˛0Ë˜÷zk›?¡ubÁAÇ”ªwØˆv>Ïo}ÿ:ÿ˝f√'Y⁄á”÷é∆€jãÉΩ≠„óÔ˜©∫ú4æ˛Bƒ ÊﬂÜI<ÿ'˘õË:ÿÑœ=g¯∫È¯∆bb◊∑I{˝˝ª˜á‚NCB>êı˛±‹ãœqübrø@Â◊¥+ Å>I«˙Ôp⁄3û+øªÕ!t∫∂¸®-ì˛eM3*ƒû˛˜ˇ‹≈è‚Ùõò€ª¡R–]Ô|≠¥ÍÒVΩíVˇÌˇÔˇõ±v-ö∆Bi˚ˇˆˇ∞ˆ0~l”tµó/Ñ¥	kê«„&}q)Ë…∑Ùõ_≠˚iﬁÑπ ÜÏ∑˘"å«Óçﬂ,∆›G¸$⁄ ≤˜ö¨˘ﬂ≤i3\Xä_]òV∏†ö¿Ú!º‹ß›à«≈Üp…a†r{¿?an$ àI¢äj/ú
{‚ﬁ¯ˇú0|Õà_ÏY<ﬂıç´ùéDôºiÚÓ‘[E∑Æªz[ˆVD“áJ™«¿›’é˝∂Nz=‚oER{ï“èXîåà«cØl‚¶^ëœä}h·«ŸÑpøAπÕq‘ï,ËO^•ÈE¡4fìg®gY^Å]“∏”ó∑…w$¯JYu<=√»á´ﬁ‰{•4∆ƒ´FcÕ_Çè‡?¶Èàäı)èF·d0ˆãù˝w8©ª/T1Á" a_¢◊˘dsÛ¶q¢Á‡Zs¿#Èn&Ôë©ŸöÅÜ wwêoﬁú4.Fì£˛‰C?D∞•ÄÚ>|Ï~·ﬂŸ NZ%
FéíhÒîˇ	CÔâãﬂ∆‰‚<<K"Æ`~øªyÉJÁ¢ÖÊ£µ5¯àwÄ	¸4{@vZ§(•]ßç-ªXu3µ)sç;ÄóÛò µ’O"jAú⁄–íúT·æKf±»ÎÜºƒ/OfI9úT˛xcë†¶ú≠¿,*^— Ì…¶@+z≤6@1¿√4x6·}à∑Ï‰j∂<{€Z∆3ùΩÈJ™uøI8:d”r< uƒ∫ù≥«Î˜Hº`“àŒW‡≤ü€Z™ã‰z2‹Ê¡€ÁÁÁÊ;V†ÜÂ©Úùa\]Ûbç<ê~\2·≤‘a;’Ìk¸a˘lΩw¸õ5u#A±wfOñ$r-ºyÌñ‹Åÿ∂Z≠‡E'◊ìÄÇÉ/ÉWòÈΩªÒ1ß∫Ï^DçY[l
ƒ7£ÅÚƒ`∑iü'.˘1áóöç	FÄåF¯ﬂp•°≤)¶≤øf‚çôıº	VpÏ„ò∏˘*¡ÙrGpk˚"ö¢≈∞ŸËìÀá…Ù∫›4§±´qp‹^mæÿÏ›∑[GªA,”(Äﬁ≈ª#¶≥(˝6¸cK˙1…_∞$',Xè∏?˚—4‰î^ˆ-,”ÏZÕKÅ9bËy—Ë‡Ì+XßÓÍb∞ˇ‡ˇóEÇ8‰”˛0hFz*‡«€Qñ•Y≥±ÉˇÉ,º¬Ï6òbÑÙ`∑z∫ñ˘Zæ‡∫^™¸M_¬íÅt◊ÏÆPÂv≥1åíè—4Óá∏á®]h»6(È7{[ ^oΩ^oÓ¬? AøÛ'“Ì‡Éõ òûã1‡n`∂AÛÛèıûiO”˜Ë@∏ÊQsAÙΩÓÎõuÇΩ&.gØç”2AÕÓ¯<éëdJàà·÷‡h•ñSjP≠2~ÿ{Ò√≥]ºÅ-¿ı¢]c/≈lcŒ˜Œ‹/ù.Íüìƒ¿Õ-—(Nb˜˙ÿ∆3Qñ»˘‚Uö]RI†ä1–±ºƒ@ÁÁ’Sk|˛8_\ÑIpôÀ ìJÚ^¶ÒX≠p4)+âéõ~EóÉ˝ÉR û~ÖòMÔ(ã˚pcœYcÒ’ùÍ<ô;ZÄ	"∞@πH`IfÓÔ7∏J9≈Ï"xª!m›◊å±e›U·
ÉÈ_6$<±{”!p0ÜIJ_
bÙrÏÏúüÅ<˚˝(I EP:¯ÆË∏ñŸh|$^·Îÿëo„É~DYﬂ1ˆqπW¯¢ıj4ÔàÊÙ?´I4EKF@Ü\"4¬`ëÇ6∞d”-±xË&ﬂ_æ*ŒZ∑B·88HØà˚è}}§]Ôº›zµºŸ9¸f+hÓ#Íy˜›Œ·«°b∞™¯	õy~Œè89∫≈l”πH¿ÕÄ>Ü)t˘>µœP÷ï?g£$≤_çw¿Y^–éû“(K·HÆ·WBR©QË±úú4ﬁ¶∏$ﬂ∞· NxÖ√$&ø∏∆74*@Yûéct¿kÖ”<<=US.ÉôY,ú-ÒsGp∆IBº
å`•À€#µz*FWé€´@›òz∞Ûiö‰Hq1WQ¬ﬂÕ´x:∂g£7Ω}ãá%ZòÆJQæπµ∑uÃaÌ˚≠∑ØÇªØﬁø›zP„ÿ:ﬁ⁄∑Ωc√ü ø)é[Zêö”¢¡(¸¥á∆U¶CÅ_1‚õ<Ø¸¢ ›ëËâ?†/°.ºâá5Ün:_√?Ox∑˜W_IÜƒJ{2ÀáMÅÔ‡óúΩsüro<ï£Åœ⁄?F„8Ø”#mT˝ño¯ükØ∞Éw[â≈Ôw˙¯Ë
˜e:ç≈Øî È\æâ≤Cı—s,XwÁU¨9¸A.ªE≤ﬁ˚r‚ÚŸ©F©Ÿ—∂˜ı∑x∆ó·º°ı4û^?–	Üﬂn∫Cß˛jnmÔ~ª{¸ΩÉdH•+ÜN4¯]YC0îîÉùõ ¸lî†(ò˜>c§≤—%üÖÙ’ô¸ab•çE["ƒ˚ÔŒ`˚	Èç8†ÎÌ≠c¯ﬂ€E@Òo_ Æ«ØÏÇÙ¯ÓÌ÷û>~éΩe;%ÒL„∫'°,„PôÓT¨·¬„x^[É0‡Ø~∫(˚:å∆˝p<èÚÙ“ËrrêÑÖD¢Ù∞êÉ»Õ3ö1ÌéÒﬁÈœ√¸÷a{WÄè’ ›ï”MﬂK˙€á®‘ÕÔíLÃóÔ=zè:Ç¥r˘˛ ≈{ë◊µ¯@Ø#)ågµº‡9#ô x0LßiŒ˚“%›CõvC)3£~⁄ÙzáD=8¨woﬁÔÔº=F˝…Àw«ÔPÆuà•+\Ï5ì>±¨0ÀÓÍ◊ÚÓµº´ú
˛\ü.;aÿl“o¿©„AÙIÛ%OQº+≤W∞
ñ…#≠£zé⁄£¡KåÊ´Õ`EﬁæU∫`OW¥˛˚™v(∂÷ˇqÒUd®É¯ƒﬂÏ†.à˜≤(>≤@çˇ/í†:C’;R)≤P5t‚•¢*F˜…^†[åÂ2´@ªòyXVÁ?,&hØWç„4Öâ)6æà)û3øK¢·"¥ÏôàΩhΩ,öÜ√YºHPoÅ}—ÙÉ„¬Œ;ã-Xù_‘r*’GùFÉÁ◊äíáÈ∂‘/T	”Óu9é¬Q∞«‘ô∞w≥Iî}ås‘ıòSX^Æ9ıÓÍ˝Á^hæòÇ’ )uÔò∏Ë?¸1Íä™˙ÉK]w˚°Bµ{Ùé´üDÈˆcV∫Ω=úìIÛéS>¯=πÕöèÙ=èÂ#»YÑ,¶ﬂe—.3WR~¬ƒÅã»h-
BÍˆìAû≥ºË//5#˙h˛¥…Nˇ‹.FæqÍ´¨Aq≥P"˜Ñé≤∏#4Ü {R˚∑a\…&S™ó,Ax~æÅÒÑ\ﬂBüò∂Ö‚ﬂ?Åb4l4¯çÇ#WÔJíıâ2)Îë…íÍﬂRº¬õÚ;8’◊È,√ê˜}$ÓG †G0€≠,ØõΩ?ÑÅLI˙ÚIdq∑^˘ÜK
º‰6àéC‘KÚËG4Â#¢3!› Ó™Xq¡ßw$3®Ï1ëUå©T∏ Œu◊ŒdE¿PÁ,˙X@c≥†;Ìvü≤´.®s—vA5L,'z€SUÖ«“œo‰Ãá«Îˇ–JØr^‹3`’Ä2E[µÇûnƒDB∂,ÁÏCË»DŸXê/qÌ!iN¸0ª‡ÈçÄXÌçiy®∑F√˜VÈÍ´äDZÒæ<ç"©ÄÏ¶P)â9Õqf‰Ö[ÔUe"n≠≠<§“Ó›‰,†p®˘õãL•±ΩíœÓ:Vå5A –èk
h¢|«µO®ö=œ'XìöüP¿C˚é •S⁄’¸bP⁄MÌ§Á{E3ﬂÁÊÇ&Ç£Ì!”rwBt‘TAä°;¨8ÌôùΩT'ø,ˆcòÃ"Ç2"¯á‚Î*/ﬁ:°	úû–†OODS$ˆ4ÆB–jG¯:∞^ªÀ:3FÖWQa5fê›1Î©D4U∏«˝íè/8ù&10 7t8À•ﬂüNßß$«©ïAG//˝ﬂ¥t¯,˘’Á·87sËQO“√N›´Tp™UôijôÎãÄTGNﬂüZÀù œ#lTk$XWJ(d6UóñÚ¸Ø•i“º˘Ê5W5âNIV÷"uÎíÍÌbF≠8ì)  ’⁄á\ç†ª‰¢<Áªåríq.Ã/@˝∞ôÿ¥Në≥Q‰åFÁœñ4I0xU44Ü¥;ûÃPô*CêÍ∆ó·$hG£	~*X	“xº†çx¢Æπ‚fe•ò{BÒY‚¸nﬁ®Ë‡÷~Qbo›®ëG¨ÏUGÜYjxSKVgÏvì”±Ú◊⁄Âﬂ\´NVÌhKq^˜©::√ÃYéù≥|‚$r
∂.Åó“á≤Dc1∆«÷ ËInå`–b$:ÑA°Ì©±ê7#—
ê3}∞ÊTúEf·c¢ õ7Ñæ€Rºtƒq)ﬁºAï≥Ï4#*§@21K™d5Ç&∂(H,˛)¢ˆ4Ã.¢iõ∆µhΩÏ($çTw‚Æo-â∫Î!â9LÓv>UdÌ	Ø¥ì¥'ö0§_™DŒ€°ömV5üì2Ç”ç.∑cÙP‚ΩéØ√ ¸—Œ1ÜW!ÕO§˜ë˚ÀÖî?—À”2ü¡$¯8´∞ﬁ:V€‚MäÎ°Vª·åG”a^.ÕáyŸöÛ≤5#˙Â\„é·ojyß¬íÏ 6O[-â¥ZOñX+&Uû0RILﬁï¯EiO(∑?ÚÙ√êŒ‡”åÓèôÿı…Cls%G„eÄˇADûcNÍ¡FÒ≥ÁÆAPF$±ëµè0<ûÉ.tÎ—Ö (ÓÇÊ.ú˝p<3Ÿ∏ì@`–5í ´OT6±A€ÓŸv§â zRü®Ã!%+¡ÿxëéWãªNgSä∞&"tûˆg˘Ü§·¸'Áî±H˘j«N>!∏p{Ëîm~_â≤MÊ´©x+Z≠=Õ†iÖÍ ô	V#k•H≠@`ö:LßXÄ*Cï7¸oÆug÷˜¸¿M+L˛,PìÔ
ËíÚ= †+‘Ùs :ñ	ÜQõC—6]mÛÙ˝e≠®¸ˆ`Fs1∏äq8ƒ∂u◊âêü5NÑ¯ˇ«˝ﬂ˛Á@ıá®TjÃ$7¸Ìˆµ≤¸≥=rf†/¨]>÷éΩ6ΩÆML?lG›3€—@˜’∂[‹Z_Í≠€=eÖ÷¶≠úiv %9§jºÑ∞üN”0Åy0à√,è'hID$hO˘∂q?„qMåÛãFfUqk∏’âﬁıp™››(ú´Ô);œYﬁ…L?0oc.óU—)Õm*GÍ÷–AkﬁSÚ5óv~‰¶àN^Â∆~óÁ‚RÌ5ã|p¨:°3-st≥á+˘ô•,ß“‡Si&zZHñ¸C[NÖ"bn0VWAÕ3‚"ì 5KÎ5*Æ{Jë≤2Ój$2èóFÖ/|K§ÄY∏á[pO‚d18û]¢ÎÌÛp:[pG-:πıà‹É5(î«.&¡œƒ‰ŒÒz	;^ú∏ÀêWŒπZî/À®“‰f2–≈†¡?ÇûDù∑©<^Æ±‘O˜oƒ˜0Á–≠À˘AàqãÏÄπWY22Á˛L‡”´>ÙLîJ˛<†ßs≥·âÙ-¿åùP`‰√ößa lµn%^ú˛∑ŸêK^K`—4@⁄◊˛ÁÄuç0Tw6±≤ï“Y˜^Èˆ,ªºvËùI,}yÓR|«LB)O∏„ªû∫«Yò{’%|…¶ù9—‘^9∑†lÒùÀ.<[ƒöó’k‰ÿÜÇÒÛ/zQvﬂh`õG‘uw[5éÃï/ê˜(2‘›≥l›W çŒ <Æ9é£qx≤É„™Qm’œ$˜6Ç-òÎ¯Aπ‰ácpë}Æ…Â>9ä¶SË)ØÀÂÓZlZ2òM[]É«ùè•eN+ƒ“NwûﬂWÎ„/l•ç~íQ›è?¡ó∂Éo„3J√∞|É∞Û:ÅÎ‰Vm˙·x’ª∞e™´RˆÇ3éç59o ¸´8oJﬁ;5ÿR{ j°Aı/Oèïâ~fzº˙KèπªÊ?=F|ıêxyCÜt˛ËØúJ]˙Xûj]Ò¨)E,Í√ë`+Jı°√iì·Âá#¬∏‹aπ4:¸"öÜ1O yçz°AúÑó®"RH@M˙§ÔÖ°úg¿}êÑcx?Ë-B£0gﬁUg®√üŒˆÎEwm°›nˇåt˚°®v!‰Ú,ÿ®Gπ'íå+>Ã?#-wzDˇR›úÚ/&eSÇ4“Æ∆T¸É–w&o£«!L<Ãã∞á$˙+Eæãﬂ>—?Äû0x∂&Õˇ∂<ﬂ:ƒ\1K2Cå÷!eã	˛|˚nÔ˝˛NÊ˝˛{ê—w_ﬁÅ0=ú8ä+Ç+à˝Ï∂%ïÃØ ô_©IÊ•w rëÅ∂íÚ[≥¸ÂÒxSçÀ¶ËÔøÃk_-≤ÙÓCHl?¡"^în3iUn{Xl•¯…¸ˆLæ÷›º)Ω8÷Jºú¯€˜ıu™ÈÊƒ.O⁄˜»‹ﬁN¸°ﬂíepπÇâ=äF∫dS`Nã¡Aò«Y∞ç:¶Á»¥æË.ªÅ¸Áµá>ºé	ØR3ñdRG,-ï˚L÷∂SÕe©
‘¯8ø¡©¬bÖ6+yiU>‚rõ´‹+'ˇÏ5ZïüÕÂ_ŸŸdyµ>«Qd}:ÙÿısöèÔk4~∏ì«"ÜìGè˝ügÔ¡œ^ë”Ósú¬Ó?è·»ôD—„∂Òõ8ïvVD◊ıÀOÁÌ_B’°§¯á“tH|	n¿¢8Ò˚*;Œ6ÇÌYÿA§ˇ&Ô`≤!VNæ∑Ú√”˙πùkül'Èlp4ó®@§3<)Aîı–zR÷fmGùX/”wË;ñ≠D"/C|™ÓáÎK>ΩJY0˜…7ÈxÄQùl˘xÄ@la€ÈΩ|¡ñΩRıÕ	œ@¥4^œ~dÈ§˜£Ò`6æhú2Ì—F6z¢xãr±lç?∏*ã”ÿÙIœX®oÛ™àDºjcv$äÈÌˆûµ”·/gg4";¢“[0ö/Râ
à´π®cU¨VYHÿŸäóÃ"`t”J)Â∫Ï4SŒVuRO—\y À"ìÎrÜ˙»LX \aÆÏ∫ı-™Z÷G+pYhv
,ooV¡y±rÕò£Ø∏
P.YaV˙Gã;“¢åVE˝Ní#ärÂ#Ï‡≈äj
APÃö]¥WñctlÄUÉà]>ﬁŒ]`7πrˆÄKDQn ÜT ﬂˇÀ˙ˇ˛Ôˇµ|5î.z*iMù˛èˇ˙ø¸üΩ“*ˇ˚˘ü∞ô,›≈}ÂSz»±EYSøÆ‘ôö¿‡d«¿¨^HÏà¥N€A©Î~;dπ&Ê"ÁÊÿ¥Á•z~]≤o˙nπµÜÑ,ëìkJbú¯>»1&âgˆJ¡ÓD ÏÚ§®”HRälºπAÿ≈eKœ·_‰Q|÷>ÈúRUPDÔ@˛K–Î3Ûex’€x#Xw>´í‡•–≤nHÜ…Æ‹q>b«ﬁ& √·e/O∑ÓÚ∏®Î_ \¢Ó#ﬂX›¥]…~IK∞à≥9ı“w'uwC¸MóSÕ·ò‹çwÊZ.ãX&≤àùY,‰ y@lº–û`N|ò}≥Lq‰ÊçN«ˇ1O≤qôæxÀN}!û‘äÖ˙EQò¸y’>ùsùM<ô?ˆ"t'‹≈Òﬁÿ´6rüΩÇˇ'Ú˙= /?/ÎΩQ¶v[›‡E~F€!ë≠È`Ù"ΩdÖ#Ú8x	pwEZOW§≠Dî0rè_Ø◊¿“H·ﬂü√≥X¯a>ÅΩoÂõÖY§˘ô∞=˛Fñcù‘	Ô]8‡=œ˙õ74m◊iìÈÊÕYÙ1éÆÇ?“¥úB∑´¥7˝ìûañ.ÿãèÆ–dW©W£U•´™•ßí:*~Œ6ÉÅf9$ú∫Q™|EÊˆhô}ıÀâ≈E
Û‚În¸Ìƒﬁ>7´w≥ÍLI§‘ifßóaY…ÖH#€‚†”b
q∑´€Ï¯mzTq9Ÿ¢øä„ø‚tºÚ©jÿíÙ√À}ÂûÎ._9õcÙü∫∫¢uùH%¢"GìÕ+1¡ÚKñ èùı:Ÿ∫8Å›é∆O*jH1j4$ô1LVŒ-?H<Â∂yN‹N•°Bsñ;:êjt√—œ˘ú∫@+'í◊ ÁïkQﬁc2ù°Iÿƒ¯‹™6ØO CÉXK¿µaøM¶ j`iú•ø∏öåf…4û$.o!e=’Ò‡Ÿ:;√¥8Œ\⁄ÁY:*∏vˆÏÔNN=hîZ•îg!c…´YÌÓó1zµ‚ç¶W@`/¥”qí¬$aTŸ:jTê∞/´¶Ñ}…2º-«pãbåYî√ˆ°âÉ1)ß˛ŒJÏ∑+ÅˇlQ≈≈˜á{¥Ï¯≈ÁIzÊ8Í2ÎÑ:•jŸ€u›‘Ò4Rm…˝2á”ë ≠8á•‡Ä	œà’ƒºÔ·t#¯Ê‡’bpˆUUbi'ø∂ºC€—}π¯ﬂX˙gQ‡ÑÛÛ®àº›Ü|‰JÌâ{´Pû1•Ω˛e¢+›w*   08ÓíèÙ«¯2¬AËs”“
 r4U9°-pwÚÅJuõ™ÑÇ˙óJƒ _/\xä5˛:Ä‚òñ?òçß≥KñÌÑΩ¯rÜâß´¿B‘-™ÃÓÑÇ¢Íëøá]ˇÜä∞çŒfY–¸œŸ÷ 4œπˆ‹≈ˆîÂ∑™ÜnØ xùÒCÀÜ≠£ ^√ÍÅ0Ä¨àÂ÷d˛>Å®π˙f8Àg˘Øå:`Êﬁ>‡d ¨öÉ^1˝ ÒB¬á[â∞∏ŸQ´ãv|`≤%∂6Öù%VÅQùá¯6Kô¥pû\ïeFT®–Jå '≈=BPîÊ
avŸÂôÁêïó-«üß§∫ovw˜ÉΩ≠Éwá[oÉ£ù7,ZÒ…≤Ûµ ±<Y¬j Ï◊ì•¢Zﬁ·Uóñ–m£ÊÖ≠ﬂÓ||˜ÓMko˜ÂŒˆ˜€{;¡Œ€◊[o∑w∞ÌQÚ›a∞≥∞˜Ó˚ùù£9ªÁ5˜`©éÜÒ˘Ù∑ÇƒíA¶È ºﬁöNë’˜…Ox@Â·SFG#cæV[
ı'Ãﬂ,◊¡Å»£l‹ak%ŸãOõù™R}_£x¶≠‰ﬁoº./˚Úl2Ä˛è°Mf	j\Ωó^¡ÃßÒ™ê˚ÿ”A|~~ıQ*›ß√ˆ(¸Thå:Ö<Eœì4ÕöMÏ±e.ó:Œ• ˆéL´'?Y,NS|W‘‰ìR¶#´∆2ˇC<Ä`ú–À.ˇ’T⁄/≤èäÚ√ÃOê÷∏À0ìØàûXm™≈‡ƒø‚z}BrπŸTWÇÔ:Ãwyçöµ≈„Ÿ42ZÀÊbÕ·µ5ı%êò“Ò _*ÆuDÅÎΩh˙r<sØÄ—¡`Ad ÿÉ8˘ç∆';õdÈ`˚¸ †πΩÒ∏	À¥(coÆa#ZÄ?∫ùé,™Ω¯hƒTÛW}‚ ‘â°¶Ádç€2,?Ñ¬#¿’G ~É‡Ï:Ë≠Ø£¯∆^ë‰uSw¬lå>•≈hˇî”)°è4vMe‡‘1éY∂^‡U[ø0ÎçïàõY8¿§Ê≠i⁄:À‘ ¥‚Ò æH›v Ã’"RÖôÀßÏ¡ë;†yi 0B›x≤‹^Br()ø†å$Ù÷dÜµT.‡=EZ6Øiº;\„›‚¥‹*ˇÅIÒ	”Y÷Cíƒã©µË£çÇxø◊:KÅFåZÎAK›√ø⁄7#4q%˙Ë™˚õÙœgàöôß5˙àf´bÖ)ˆY°`ïY≠m√ú•˜§óÜÎs≈Ú…âêuÉ3_îkâúí\∞xLAºWZ	ŒBË´S¨rì¬¯hUn—`∆<ˇÄÌu:£ »•*µÜ%Kâˆmu≤˙∫>·∏S«}–Ps‡Ï©UŸêUŒåU&JŒ˝è¢Âz∆â∆&˚Kúy€fË[1>YïNF~¡™ ∑◊5ˆK3> ˆ
r0$ m^{ªﬂÓ˚;«áª€G ∏’Ö’◊Z^ê∆¡– ﬂ8%U€˜X*˘F-k"é‚UdÀ9ùˆ™±â/fËÔ…˜“`∏}µ˝hà¨î›*2'cF≥∞ﬂ4<õ%! ÊŸ(7m‹‹yÇ(îÀÅB4‡‰€’ƒŸ!ßméˆ⁄DÁ*Xí•G‹Ÿi‚ŸàÂÒ—g∆5,3;,fππRe≠	^,9ÖUÒa!%s@ 2`í9´éπg‘*erØ8U‡bPD}táì‡F„YdëΩ¿∆Ω¥ısm˙<L8,…˛xá¥ÑØŒ‘°Ÿì˝∞√$Üí-†Vë¬‹Î™T◊˜Ê£ÿ&PÖ∞ub£MÌü yFr4Ê˙oœ∞≤/„O ∑tnˇdædc^@b≥6—z«‡ Í8∏<B∆ ÆÂ°Öˆ]ÒMï≈’9\råHµÉ£À0πK>E≠ Çh!_ä»|zùPë^ÿ¨Û√Õıº˝”∫Al©µ?πÇ…[„1∏è9Q¶œS‰ÎπÃ*rî“Ò€c|°ä¸Zõ≠Ør})ﬁŸ∞Ç«ïﬁê\˘1ç]@Œ£ãH Bç4mÄ˙^ç˙)s*í◊qx	∞=åÇÂ`îíó§8mº_&^|®v*\y¥ˆÃ≥ùß@üö·bpF?+ƒ]ÍCEåÁÕ…ø$∆e68TR8>(ºN0íß≥ KN√ú™•1;8e~Ÿ ò5?∫‹¸"ΩDp!’’lß‡á¿w“÷öqz∫vÚ u¶¿˝†fiı{XÂPÅz’≥Ø§–3”iÄŸlÑ¨∂¢ÌµNÜjêú5·Q]¨íﬂíyz‡D3<˛VÕ3Ázv5πT&Í∂MYQ√|¸-M„¶„a8≈îH≥é}Ë I8ü¢Rı!ë|ÓÖ’´PÄñ±‡Æ¸¨7ÆS¡“≥é«,gòÈE!Bk∑3Xº>*∑44
ÔZ)DÓ˝·´ù∑«ç‡Ô∑N„i¬Ä´(€Ü]k.¥„q?ô¡é5\âﬂXòˇ’Yv/7æV#“ EíGi&q_p¬ê:">Ú8 ≠√£mz–îÓ"¬&∏a˘ö†¬C'PêOäèÖ&•”¸»Ë>—3\ﬁ  %q.¢íé1á›ZGIÿÜÅû:õhv√ü_∞8OóÛ!WâGK={TÉt™øo¥∏’ÓÔÏÔæ}Uµjäÿ≠ûD¥Eh+«ü»µì-´Vœ˘u˘≠G÷ÑÙUSPíΩn≈√“ï+öïØ›¡·ªÔwﬁT-%p·Û‚…\‡Î˙≤—}πhºU’íY´ÀE7™ãπóJ<*](—®|ôˆvüø?¨Z•¢˛¢:m≠{ J¥´Z)GÁÍZïÀÀà›÷V´àı.[Æ"FÈzΩﬂø_µ\E∫!ÈÙ§-T·ıI%<W´JÎ÷X^µJ≤ïcï¯≥’ÚUíÏe´t{¢8LXÑÀ÷85)ÕAò}DÕ=»ÉÜ„k•QMb´¶¿jÔ`C¥wui4TW<‰]ÒõëhaVâÁaU_pI*ß©ø°ªˆë….Æ‡mﬁj_DS¥E5Ï˙ÛŒÒ·KÛÎ¨™°)äpÊC‡Û≠Á¶k¢ %j…=ùâ6ûÜ`£_äÛ¿Öä∏ëéàèx<Nò†T»‹H◊òæÀˆç‰$Vk›•÷ªq¡~b˚Aî‡¡Çøùv◊no∞“äîÜ{]í=ÈÊn8Z·'ïä‰¬dÅwô;%¯„ç‰~⁄ÿ€maÍë√5Á}ñ$#‚ƒt+AçÕérRÄˆ±˛YÌÄ{ß≥Û1åì,â¨¥æLüπ »€ÚPØ<ØööI
5∫(»‹‰2w∆±JÓ5∑˜Ω[˘ˇ»ÂÀ£®C¸bOÖ¸IÓ3ÓH∫ùoÅ}uç≈õC¬=J\ßª ´bSKI[∫è´3m6Ç∆¬IÁ‘Ô7◊(ïµt
◊∫oTçÂ´uwÆQ;ÉÇ4;zVO>8:–i@\ÈƒcB8†
3™Ü/0bÏ
.sÓÕ~®eHÜhVR;¯√NÈ<wA◊9î5,Ïòa!mÀ¿{ƒuà∫#ïA*¶—°¬ûßÓ ÒTÓË>‰ZºÃÓ€óÔúÈgÊ>eèﬁ¸J!Qø∂E;â$ñCŸ‚KjåÉ†Å__7u¡ÄıÉÂrgNTkì3}ÉP1Œ]®Ø*à]Â|ªÏt<e˚„ûÆX[Ê(›Æ8ëd≥1B
ù ô÷)Áˆ‹Hïç=¯'K√«ÎÑà¨™#ÉB&‰S4P-Q˛1“ö¢jﬂ1*;≥è+T\w3ó¬±˚eõ©X†<xLfz°Zß∂/yêEy4ÓGä∆NhÍÕ8I£°Èx)‡ìˇ´∑÷9≠∆˝vŒB?ÌdèkÚ≈v≥ËS<≠Í™Ñ&SDIQ≈¡Ö-âƒ5èW…ryP<»“IãFFäé•{- b@æ∞W˚Ò*âΩ∫%_ıäˆ¬’˚ú^)Cè2>Y°≥6!)Bú£–“—¿ŸP‹Ök∆ªó'J≈cÒv‚ÇFP∆·`
	 ¢”Î∫D q,< ggé
'5Ú+|’–$™™7m∫aÅüoT\˘˘ê√RtáŒÅ’`ò‹xA0Cò9¢.#eQvÌåJéÈé<,>”\§ôs,sÕºìÕ¿ˆº•IJR§◊„e™cõÁdÀµÎÊ™y”+:‡ªîã,„#´ºu\l§√¡§∏^ƒìŸY_Üyå!ÉìpﬁÄDÊKÆX∞{rR˜‰˘Ír}ﬂó§„ãíf◊Qò’ËœÕ!:Yvª~épóëW\Û“fº4eÃ:ÛuÀÀT ïGﬁô∆€‚cçdˆÛÊ¡p ™»Éaﬁ’˝Æ®}‘‰Dl8ÅU)Tn0v›ÃtÔ•WRw\èD— 'öc+≠È3åW Ûö±ß„∂ì \F’À ¿ÂÜR<Ï¿Hıë∞©§SuI$GyQ◊w[oéﬂ[¿∫ºÿ
ñº
:Ôëvé\»wN≠◊zMùOÜÜ;‚I`0.Æ¨¿Äø;ÑZÕô!ﬂ=Ä.ÿÎÎV8õ¶,ï◊$
ﬂ<òéZy?Kì‰,‰ò˘D√ÊÑ#Ö≥SñŒ£QLpC¢s'ôdÃõŒ-aÏ¡¸bˆΩ÷…ce‚ô⁄j}µ8‡r'hç>aå,Í:rOÎ»;≠!Éqw¶◊L®Ê~◊G˜\È›ØIMØM«„”gªñE∞@ÉÁ◊¡≥¿æy“9Ö„˛—Ûø¡÷˚ÌaÕ*AeÄKÌk ‰⁄yüM|l{w◊¡Œ€W†zo,\ó˝»†uoπG»yÔá„G*µwt|‡e¡Õl úΩ5^ÈÂBÂ€ÏDhµ*ª8ù 5èfªºQaı–¸S\Z=~Ò*òô«‰ã¯,Ï€’¿Á»úÊS2M=£S{ËvEf∆+$⁄¯âq>I¬ktGˆJ‰Q˛^§PÂÆø“-êú	†≠tüm¥Ex(º>Q®$4i„/!˚˘HÙáÏÙS8hÃ≤ÑwπÙo√Ètí?€¯◊•]Zä€@o¶Mﬁ˙äûüøã4ΩH" 5£•Q8…˛fÌã§!ù¶ ¥
Œ∆îK–í≤â≤,!XÚ«<JoÔáShµ)˚·Ô&åïû˛ÎRÛ‰ﬂñNøZXä•&g•º
luÒÎ§{™˙^(Á®ühÌÿ_Ôw∑”—–¬x⁄‘ﬁmg˝ÜÔµt±†›Q—@„óygró¯o—HÄé6Qÿçwg?rØL#%÷_è∆˛€AòÖ#tßˆm∂Çt3GÁíf„omÿﬁ	ˇã{∆Ï≠˙S˝\‚/ó˛≠ıÏ_K~ƒ√—E_íQT˜⁄Í‹¢(Ï\SÒ¿Äâ/∆i∆ ÑµÁ‡∏¥pº"∞ˆ$)zõ{ÀÔ"ÿˇáSF ‰√Ú.Ä¿O◊≤≠ãÖe#ûÚS!†MV^Ìà±Øä˘Ïåù]ÙÇ_y¥|40ÔÅŸú!ÑË”$ÕpŒCÃPv_ßlX[ìIsA†Ä*@jÅ"‹‡©ñ'@=f<t<¸ﬁÁî A°·höf·EÑ0≥åM≥Åa⁄»Ò~òdÈË?k†G]∞Ô’ÎÑç\«b 0jè∆OÃ$›@ÙòŒgIzè›è≤Ë"Œ—ÁCÖ<æj„0ó—Ê—`≈Gµì7•çæ>TbˇÜÈ’qÊS∂Ö‚ó∫ãÕÛ0…#ı•)6ŸèÚVóﬁ;VnhØ6ˆx2∂ÁQ6ò ºå“æl®¢IòM—Â¸(ö¢£wN›æ∞nk–éØONü6ONeÿ…v:Ûºm«p øe™ÛÎqøÄjƒ≈´ÕbcTHÖ∑ÆB†N M/“˛À,E—Ê Ì7gÄ∞,O’ó])©@YñfÍﬁ#‡)(àû£ejäŸ“Û`án¸˘œfõˆà-∏B–0‚¶ü`®—Ù¸ú‰±"˝êéÏpÒS ìWa6n6^∆¿"¿ââƒ{0‡˛I~4Fg´A £(¶ÜÄGÿ`6i7º∏íùycâEÚäbÔ∂@êm‚|cêîw˚Ë®
P]0p…îÁ…ô/c:”ﬂ≈KÖt∫i¥ã¡2•·`!,ME¸ÃƒÏe%Ñrƒî,‚ã4àÂÃ-jGM=@ßÊq‹ÿ∆(y"≈Á°îÔf∆≥`€√(Ã”Ò~:†t#VÜÒfi6bù‘i	≤“öºZ”ö¨ÒÒË˙¨€Ys’8Ô∂™VZTu”fÖUo|h>R≠û>üGwËœ]Úbpã£Æ!hç≤Vw˛ô‚?2?Ü»√∞⁄Q”V8w‘Ô≥ËwRtxPÆ°qnM>ë]Æc®+¬T÷D~z]ﬂ!‚[Ï*P[IîMè≥8#á≈¥ºÀ∂Œ•Pr©‡ı¿k[ﬂ´ÚtŸƒ4(K∞‘Á‘ÉûøÜnµ£GSõ:9ßAˆ(N(AÊtñƒ9˛¬7(aÊTå~—@Y∆ƒÙ6˛q6Ω¥ú◊&∏9&â@@n”ôòjAÅiI/„O÷jÍ…áœ‹ñHË“/∏í∑H”Ã›ÁÍ¡Y√˘yàN˝4[ˆæÅh" p1$â#«^é¢∂ÃhbîåÒ{!/µáÙ∂Eç,°
G-g
¬XQàdn›éÈ˛]ígœôı∑éñ∂~Ò≥yÙI-„D±J≠t≠Æ≥[≤j⁄£,¿5L~µR›|w‚r©åû√…4ÀÀ˘’DµVåU[&CŸÆÛ\ ÁE\ﬁÊÕó≈‚jöö*ã!€
∫;-••| €ÎT,≥úç¨Ñ∞\W[á¬I∞ÖàÓ~z∫™∫1∂Oi¬ÿc'sáå`%káç>+cóè6&@WÓ∆¿’`⁄Ù&U˛Å~DÅ+„@ıú=L´ÏgÈﬁÏ´”AÔæÄ•º,•psÚ≤u˝˘˛…–÷Û<s0¥E§–ØïµµI8Åg∏;”Ω/;ª≈òO@Ì¿÷ŒêüÖ„Òtœ.o.;;û´û‡:.yÁÒFß√˝—⁄¡wa66˘KL03Ñˇég¿!_“◊iUn∏‰Y√Õ≥¯GbæG¬
wO¶Ÿfîjz[’~∂™∞è√‰Ùπk{‹π¯5Ê~SRMH«óßîsÉÑkA„)≤A9÷ò]Ç√-
æ€}ÓvttÛEsìv98vçïÙ']ºèªN€Iß›ãFß
„S¡Ê Ç¥¢€ÎºÅºìMÕ2ònvÊÁ·\äÙ¥,Œ¡À¡ƒπŸÙ›$£˘ÓKaÁ.bÊ—Åù≠áÂ˜ÄF∆Y:∏?π4mÊtN∏Ω»Î êJ}c&"Ëê?†édÜ¢î23˘∆–f¿q˙ö®ŸÄ£—DÊJÒvâçd∂¯ë§◊–â«ÉB_ÃÖÿó—üúç¥çí]
eéËÔ1@≠˝\Ip,VÌ%ÙéYz„4Ç‹èﬂP˜…¥¿WìZZôãh#Ê√ÛÅ6'l|£…≥∂ËˆÄµÿ‰œ
›ıf∞†§w›útN’ï0?á¶ñLnÖ\ûgúú˛,!ëΩ©{0Ô,:Ôè/Ù˚¸s¯Ænk≠›Î=~‰iÉÊÚø›ŒZ{Ωª¶5*TÚ
.ÚÈÏ±‡zÈ]«£¯ _DS*!
ÁÁÈfX}?=ãìháCL 7}"÷ùEÄt4π‰∆!ÿ˛C ƒ@‘Úú"≠Ø‚È0cNe:-¡Y4E¬Ú˛ØhXÖõÄü1kÚŸ,è«òî.õ%ë6÷·ˆ∑iVß)w≠c∏∏ïÚÊìMåÅ :∑ ”≠'¿¨|ÕÙgaÌôöZcÎÒŸò£s Ã¡‰qÁ„‘Õ„cLŒkVíKèº1˜BS˜gûÍ{eÓ{|∫õÒ©÷2∫£I‹ëKf¥≥‰‚]¸PIqNÜ?cì=`ÂMV€≥ÅÜÎ˙Í:{q\±°•’f5_˙ ∏Oö;"g‹Á≤„ÎuKÉå}]?_∞c9Ço£,>ßp!v8Ü\/(‘æÂdJmñt◊…	yòSÌ‡ıLﬂ∂^G´Y¶í¥ÊÙW≈eﬁ]◊q≈gÊ‚-m’∆Îñk≥Ä÷-◊f3;2`¶#Ãµ|GWX˚˝<éÇ?S∆B+L∞B;›’3eız%JÒõ8Êw -uXu/üqºuÄ÷°∂—Í©järCÖ‰¡ï+N\	t®ƒÆ√Ú"óí”,ﬁgâ3oÿç`Ò"$kv‰Û∫3∂≈ã0.[qwg|â;}M -ˇÛÕôUF)∏Íu>ßèjuΩJ%•©;QÖ`{ø«Ò ºƒbÓ"™¸{e—Å>rw>üZíóÉXaa¥+,á3
V2"¿ÎÊ˚dŸÙ{æ8I‡˜]´Y#∆Dÿ∫¢òy¥ÀÇø€}ÓYÏ{˚à◊3∫dmù£xH§äzGw§ô–Åo¢iƒRº^NgŒuq/Wù¯f*ÉPW$|·¢‚35Ÿ¶¶Pñ <°Ñn,√]Q(C¥w‰+‚æ5W*9*M3»bÓ‡ÛòÕ∂πg˝$Íi=A
ﬁòº“ÿ6ØˇyLõ:˛Ü‘x”≤„÷≥ç˜û"o¸áVÎÿSñNÒ«YL!ÍSz+”¯pÑKîEæx#~|ƒh:nív°Rwvøˆ€Ø¸ˆÀÚ˝õ’¯c>É`ãπÍH¯€xpc}ßdMñX6Õ1%√l‹X˚sÎcòÊá5wSí_}xÖhÍ{)âçM¶¯2+ñ,ƒœE!‹≥ª†˛`cÍ2'ù–∆Ê>’∞0GC¨JT£*~ªå√ˆòRÀ˙˙’$Co
…§ºh∞G¡Ä`cFs‹±¶πÔ,è»>I{∫‚ù–˜05∞gæüÖ™9'˘<:s1»ÊÒÏ~—∏óÇ# _˘Œ‰áo¬,º‹ `óZ„gäZ˘/¨Æ¢Rgˇ¨qå–tÀÍ¡ÊpÜú†[:˚y)[sÏ∏e©7ˆ√	lUÙ1éÆ*%ﬁñ?≥"‚M
("´ÙÍ‡ˆ	˛p˘SπhVÂôïı;( ì¬ØSIMú:€Û¨ÓS/*≥ŸÄ^˛‰¢l√Øˇ9u˚ú∆≥Ÿp¯†•‰ÿl æ@ò)]≠I¡ÒDn,Qpc€v|ˆ∑Õ?*d˘v±¯5æ∏˝ÛOõ›µ?ß≥Èd6›åFg—¿ï•Û…[è⁄™„˘¬ÒKR¯’QÂbF£∫ë¯ûJŸ¸R1 ´π(+ˆL¢äµÖ€ädóO˜∆ À„ãZ/˚–É+ﬁÆd¶`Îí
‘mˇÔˇu£îÂ#
˚}x‹ßàŒ¬ÌhÆ’ƒLñwÍB:µ]1Ê“{~ß,<:óãØΩÿ«≥Èl¬M÷í>üåmJ¿çÒ%v;‹êﬂE‹P}ãÏùÏ∞ñã•«+≤∏TZ_ÔTs÷J‚Èp
tá⁄÷ΩÁ3 Òó¡Û0õ∞kπ÷1ÄŸ	Ç5∏a—à·”ﬁ¡™å0Ù-Ú=°¢FÕ≥ä o˙6∫‚=Ih6ï≠Pmb∑*KÆÈ0Œ©lÂ4÷ﬁ.µ«›ÕËÜﬁM∞‹G≥≥zQÛ» uaoÎ®e}ßMöü$·Yî<§ >Iú⁄Ë<‰Äh·UÉ5≤x|ê’œòâˇµY∞,˙€,Œ¢Åı`z=·3≥_r©O≠UÉR’à¯È9#~Êˆ±áÁåh: Ó‰‰*5æâ∏Î_Õó›N»⁄≠_úl%!9˛M√Y∞è/’ƒ5géà57åM åE’BáÆïî∞˝"ÀZx·≤2e∞âIÃñ-óVº4=s†∂¥u∏gl'ÈÙÉewk8¡¯9R±^Ï±k(ï§äñï8-ÿ1d™<äÖ,í$tÁ€IX	–Î›ÅØy∏·≈ó´n›Û^ÔÔÌ"Ú∏],‹—¶wx1Ò*J1'
ÊZ§q∏»£É¯—<elYú≥~`◊+¸ü§ïñÖçÙ(à§ª‘Zƒn¯]” ◊◊ûóÈØÃ•Xj˚^[!fŒº§Ã˛nKÿé…´ã„˜}∞‹ñ1ñ∆Ì¶Ü…ÏD÷;ÉC•É.
ÊLV2Ø√¬Kè‰,G©t‡⁄Ám‘πΩ:8≤Â=BÏ*ùzz5˝Í3“(/í`ñÑ.7'Q*°5å~P˘4	ﬁâÄ</~>rÁ∆_ÈcBº¸∑§ù∏v›¢U‚Û‚1ãÇâBk>O0V%>[û*ÈÕ,v'@’å»Dfá/>ÇÊkÌó=€_Q¬´…`zhgMØNCº”@ÌC√ı¢&π“f[∆CóQMPPúµJΩÿ‹ä‰ZIUÁI»Í¢Ø∫¶OΩò!¶ÍÆJ‘◊ÔZpLI'™hiâ≈©ñÉ^Å∑ƒ\ÕÌdä⁄u‘Ñ^≥qﬂ∆`l∏^Ìπ◊tÊeÀ´Ûö¨y]eè´≠[Â√.'ÔÎ≠^nnâ¨µ\ÏáQß‹5e˜Ω'3Sí≈´$ÖD=ìDÌ$ˆ´BIä˙[TÉy=qL≤¥:á#eÌÏø^∏Hàß≥ÅÀXfÆ2˘Î⁄TøSÁÎƒæLRÄGçf,®6•y∆V;◊Úoao“Ò≈Øos∆Ω9æ€’n¶ÁéÈŒÂw3˘KpL≈ep)˜¿dæ>àQ»ÇÌœ¬ã0 ±@Éå\2]ÒQ¡eò]áW°ˆÓY_VcKz¸}	x,CwÊ÷Xóâ ,dÿ+†#⁄∆˜˛⁄ò˘ƒyB“	eöd|v£Ò¥’
‚$ ïkµû,±FNÖäövûÀˆyú ÷î!‘Yö∞ ÈÜÉ_NgY√Âøoé¬âxÕÎk∆Oï•1<˚V»Ù£ƒ*Ú…Ò~K&Á≈È3…‡Â∑,*Ïn?¯1ôƒ˝ﬂÒ¡´{<™·˘é–\
Àecª'ˇ6ÃPYúf@§Î⁄ú<Ã°ôuv˝Kkà¯:ºæñ§ÒÙu<ºö«∞`ÒÇ*åw˜y9Wˆo–<ä!∞cµﬂﬂKØO·?AÛΩçÜﬁ7›p˜€ ±Q~ô≈+‘bﬁÏö»‡S}ËŒmÉ¸åÜD,Ê=ƒÂ¬ı™∞gÛêÓIte?ÜX˝èËà#+gùÑZ>/[,1$„^ÌC6Ã[uy-9J#”˛Üs·÷Ó€eñ"°¨â¥™´Ù|HU—ô”2ÌåÈ·‰*MW∆£⁄H¶ëa\e“ Nç¥º“<Á¢ M∞|˘ÂƒÚ:…Åºù∫’=¢ãÁ≥ú™§‰é7Ëwyr∫PTiË∏˚2\ÁÃÀÇ—dß?jK!Y∂CHdh1´moò:1åD."1“`d«Ô¶´	∫⁄K'¶bXıEâ‡ÂgãF9\ø7øbÀﬂKi|ªˆ¢?ÇΩ∏»’;/…¢_˙}·ˇäñ∫NH{qQp{U3o®∏∏n¯ŸFÏ©ó7JªEÜˇÄ9B√“‚}—
GgÄÄV:∑-‹cﬂV/o¯°_˜ÆN¢rÔkÅ^∑§ ô“ó+î£ÁÁ!÷K4\Í`W&É*)ΩÕ^C∆#◊¥jŒêÔ0j˚¢Æ¨$†æÎ(>õŸ≤ßkA¸i‘´÷jA[}≠`)Y~&. 
§Ω’Ø â ôU7(±â´⁄V$Æö6#q°W|A*€Fal¬M úßÕh†~U?¯& DÏ®å/Q/∑4ˆ‡µwâÎ6à ìÍÈıkºÕ®—ˆÀ´xå÷
≈⁄yu∫Ç˛(–Le¡`sf?H¬x‹ˆDyÉg?¯¡ó[˘7_¡⁄›u´™ó?pTù	2(⁄Úˆ D§ÎCåπ«@°Íw]ÙFã“ÁS©∏4~’ëxw¸}Ifì•≠:ÊÚàW.Üû~C3ÊV≥Z,∫⁄Â∂X˛Æüá∆´Ï<ï VùTá%Ÿ ,»EãRÏ≠~ªÇ!®È…A∫è^`¨∫≥äëë&Iò¡·Q|0Íß;≥˙Û9i©£P„r-Up¢i4^Ö?∆\Ó©-¢^\OÎìmÉg •[éóY5Â◊åÕﬁ“äöï\Í‡¥{°¥¿U‡A&	ÔL¬k≤πSfUä´Í*Œ]Ilø˜=∑á∑’S›8Q'◊∆NAN¡HÊÏù±ù´ï±ù'Ωó¨P7º≥º0pe∆D%ŒXWtcwÓ»πOˆﬁÍ@NªùÃ≠Õc
éS÷∆ìR˚U4-QY¢ßi0∆π»{L≠Ÿ¯Dì£ix~ÉR≥X+∂W>”®"C¥>FÃΩX,ã¨T;Æ¸(ˇúÅ…æúˇÛ*3YäI98±|áQò¥0Spè√q?ÜçÈ©1+π2ã˛,CåÅ±X ®”oÖ¡TÃ1ÙµÁ»∫}mwõú—¬d;ÕßénR£ÖŸQÁ&â£Ï5V±Ω‡ù¢≥)ÀT.T∑rS3ÇΩ¨çgõ‘_ø?ﬁz˚ä
¢fFj«∫ä˛≤h0ÎGÕf>-¨S¯3¯*hfÌpßùua˛œ∆´zöW√wíŸ≥ _9&®ekœß–œy¨t°oLÀ˙ﬂt-C˙Ó¯c˜·‡l1ˇSÆ‹†È¡ø’ÀÛµ9ÀÁqÇâ_vÛ|Föl„É˙:äOÒïƒ/R'ÊR™´^ÜÌé‚èÆOò†Œá  88ÿ¬cŒ˝ùo\@41ø≤	lTãìWmê1mó`/£¡ÄÍóiv í⁄´`Œ2⁄pêÖ?ÿ-Ä‹L∂ÓB2’}I/îÑ
ÑPBçÊç)∑€Uîmïk.¯—v†∑•"È≤ªÍˆEﬂŒOã]^®7Sñ›ww`¸*√⁄˛M√≥|/¶s~¬?wƒêjdl,dÛÑ‹$¯Á‡8¡Ì:ÿû`˙Ï\∞ˇkî¨vQÔIêV˙⁄JfYMã–ÀYtπÖ!dÒÙ∫ºWÓ3ßv ΩËx^&Ÿﬂvò†≠:Ssay:§ó[®ŒZﬁ·ΩΩåìËµR•Âó—è3uıæ	Wp,∑˙a⁄C+ÔêëFŸŸqxY¶;ˆ@tó∆„äÕ∏åfÄ¨Cµ∑7¸l≈^x¶åÓ8c"≈˚IyüYx¶tw#ëá[œıU;ödQ8»áQ‰^º”ª÷+¯≈3bı
V?s)›’"¯≤*9Üù
\~[ÂÆk◊*†¬\ì≥¬ÄoW)0ìç«˘Œ ∆í‰úRÔÿaõvéÛjoàû··/uª(N¥˚ˇ  ˇˇ G≤øxúÏ}€r€F∂Ë˚˘äO‚PâHâ‘≈≤…EI¥≠ËZ"=ŸSÆ‘$ p –≤F[U˚Œ”~›Ußj⁄|¡˘Ñ≥Vwh ›çE9…dcjbóæÆ^˜°ÌÑ≠·Dû;≠Ó˙zcˇë“ı„dìå=+äŒ≠©≥◊àùœqÎsDÆ?nç<k|KË-÷»Œ˙:ôœfN8∂"áƒ!<v˝õ÷ù˝êkœ˘L‹ÿôF≠±„«pÁ∆öµ:Ì-iø–Û•„è]èDÓ?úΩáŒ∆ciÆoª7AkÜN÷ˆIﬂvcrÏ_·‘ä\r˜Œ-yANÉ[¯-õ€⁄dS:Á—<é_:™¿?Ù‹ÒÌﬁCsÖÏÌì»âè#ÏÊ	˛Íå„wé”m^[^‰¨<J&+ Æ‡&¨‡$¯‰Ñª¬Mò 	Éπo;vÀª·œG7ŸŒëÒ<åÇ∞5\\ÿÜ§S≈ˇ[≤º€è∞Ñ“5bãQ~ˆ„öÌ~í‹Üª‚oB◊&¯ü÷8"òÌ‘ﬁÕ~v)l»AØ–R4≥∆NÎæ’QågçØ%:Î≥œø( vK±#/ﬂ*:#∫∞8ê…á≥F«£´ÎœÊ±¢Â¯~∆/€Iº>YﬁvÕ¿slw8e9∏Q®ùX˛|“t∏Ì?n:Ìÿ
oú∏MõW¿nzÔZ◊sœ#≥œ≠2ªá›®ºõ@ªπ‰qÃÜ «ü=í«%ÅgãÛ
ﬁÊ±Á˙NÀ|ﬁœ£]ﬁ?˘∏{Ï~àª÷dØ®q¿‡L†_'‹kúY—¸ˆ÷Ú≈mï®8&“√ªbÜIœÉY«dçú∫˛-y7ûCŒ¨YÙªÄÏ”`l≈n‡/›Ij?ÑAì]Úì◊&ÉπÌïhHgùX±5'óV≥*¿”œÄ!ù†Ï¡ØÛ(vØÔ[éoS¬–%≥XqTtDöÅ{A>Å•ìÒœ≠MÑ`gHé2à5à /ìü9 !(¥¸»EÿmY Üã“˘ÿaØu_⁄√…¥=g`}rrã|⁄b´˙™º™;…2≤ìYgE£âewÙm∫8wu8q Ssk9,2pß38wóN8Y∞6Ogπ$7W».i_”ù∑ëﬂ9éœßíå%áNIÀ»‘˙‹∫km|ˆå9⁄5˛ßuZ≥Úöw’2¡d£Dª∞©r∫àêíR√ÿΩô»&≈ÆáŒapf˘÷ç”ˆï‹HÚf‹à√xoªüúf°—Ú∫¥-i´ÇEˆ)≈È ‰;S'¥<q˝Zá√zrqHû%O∫%ÏBW(9î∞)¯Ü(Æ-ØIgq(|ˇœıôü±|wä€5õ™m»iªz'√„7§Y⁄, ÿxëˇw“∏t<Î6Ç€ñﬂx\Q-ˆéSﬁèÏÏòm∫N√oóv'£ø”ΩI%QÌ^ú_úl«y‡[∑Äb‹˘	| Ñ¬¥ﬂGN¯∫¿™ÏÌÌëÜeO]øA^ºPo†Ü¶·U`Ì7¿ÈO∂äì…Ÿ√«\4[ËåLÅTô(Å¶Yt¥ª—ÿÚ nëØî„$§
{i>%ÄŸ :a°8í—gz#=ÙWv"ÿÔÆöe◊.m:√YÎ…Ω¥É2Në°∫õ«èÍå›ÿÉÕ3¿ÌçœΩ%s?ûﬂí©„s–G°r∆tQÆÔ6p:˘˜n“◊nùÈ»Ú\Òu’∏4Á¸2∏C H’föCl4´sa"\0∆IÙ
˜T#’ÒòÍ#^ƒ)≥–B7æg'˝s˝A◊bj¶-MS!lõ°eÚ}ı∂>¸¢@¬ê*ëdå‘ 5ZIÖıbK@	K£™MÖ<ás›pM9®¬üb¶T6µπôæ∫»!⁄]âŒ¿à®∏åµı0ª™kPE:’É% s≠BLèårJ¸Óc¢®_≤‡Úœ2‰é¢RçÓA‰L›Lw;3ã[Îj	•àx§∫4YÏˇÑ∑TÑJL'j®6uÅˆ∞ˇœˇ¯Ô ó*áÅ™£}∂√ª∫÷Jÿ8=äàhT€Téå~v„I≥1â„ŸÓ⁄ZcOØÒQı'Æ?ˆÊÄ}õç™µjèÉÈ⁄5W¶ﬂ·Àmk6kCÌØ±¢ï”,%¨OBÁzOπTÉ™$˜Z„+œ!°„Ì5¸ ò9> ¨@wÕyˆﬂı©¢QÕCf8mùi[ä(,ªï≤[¸wYÂ∫ıP[b™Ω∂ºtfÕ.]_¿Kj„"”°Îﬂ∂ÙÚ;ñÛ[ãÿÆ®A’,˙aˇ3ÏÉoyTı ‘…»` ?ÆYKêg∂\∫QS«vÁ”<ùÀã∞≈*"¥ΩŒuD·‹á}Qøj[’ãˆˇ˛Ô˛ZB·¿Ò`ÿ∂≤h®aNk≤^z%w˘æí€2‚≥™Ù“rFÜ~≈ñÑtÿñwàCÛùîı…Y™7äz◊épæ)k,úÁq‡aTi€~U≤^g«≠4©r11aw7•¢éä£ê©M≈(ÔË√⁄wd0µbk{Ù…Ωa¿ˆ›ZÓ;=”¡¯åÈ®µìù(@±3AÛ°ª	‚GÅøx¿^O›(nπj6„ÖöííWn∑Œ˝ﬁC<jªvyìÀ¶êh(≠Qì~I¨àX˛Ω‰Tà*9ÅÈ"∆†¯b#õfg•,â&DiÀ,p¬ˆ<§;@ÈåTµ1+ÃÑ
It6“É√îÇ§Œ©ﬁ'ïh*'Q W¡˘éL˝PV;î·ón€XF„	5ƒ…A~≈ ºáΩ“Ÿ%G˝aÔ¯∏ˇ·ÒYº§K⁄∞ùÿr=â‡)uÒnJ. ù≤˚ë ‹∞#aΩq ∂7°EÖÎ€4∑X»ç%éo/—îø©6ÂkÙ|Ê‰çπ∑‰“πu¬_-©m© x/ed~2Ã*3æ;èﬂ(Ü•"ƒj◊
µß≥OÜË ?±S◊ﬂk(Ç¿®Ï5:*u!wPPMèº~M÷Â‹ÜÌF÷»sÏ=âÚÊ´Ly#ˇ∏‰„†RÃ ™àb‚;wÈqÿ#ÁÛÈxÜÇ˜ÉJ¬¥ﬁÔg6 $'I[%YœµW≈æîm*nØ≠ëﬁ<Zw 
_{¡@º{sòì_ìtIC«O ºaOæY≈€≥ G‰xNd…¸˙rØI3∑∞¿»Æ ÇRò+(ÕG+Âódç~Ês–ÊT,7^íE‘º›∞âfÁ∫°}=A◊ƒ0°	jô«÷⁄¿%lg-°®‚¡ˇ˛Ê⁄Vãa Ìï√¨BôVˆÆô [†f*A4w,8ÀcÓ'S`≠12)Bít)˜V1AÒeÑ]–†là&f-ñfÚ·˙7§9ˆŒè˛∫R≠‰¡›Ç˜˚ß˝AÔòº9ühæ™)ö0í…µÍcc	7+_´
‚˘ÖËﬁﬁ∏µ‚dñÃYMCÌ§ @ôUEÕç”‡Æ±JgT&∆ø®%‚‰ç)‚]aÏ˘L ùß=W®‡)∑>S+å§V æf˚*≈◊3çµÚI4
Ø¢,–Í0Æü∫Ú]„  °6yx≠%Sk<öi>D`&òò¥Øåû9$.0x7…_f¶N%xˇƒ*^O∆P^ßr¸5ÉqîÕÆ˙ñçÃ¨Y≥©‡+ïõDZ†1⁄h°◊& T;ﬂzô™¸ F
Óõ⁄1j„Ø∆p™<ûåe(ïsøΩê√ m◊áÖ˙¬2ìÏs±Á$ô?Èç"∞yÎ◊hpÚoHVHÓ≤†óÄ¥∏Yäy°”q`ó-üâ6®ƒîﬁi(Ø!⁄EΩ¶±˛`éÓÀlÈ_…V>—m®Q.;åà≤C4(-è…Ëwì√∂•8µJaQòî∆ˆRÜ—;™Üû–ˇrùs7˘Éœom#u…ÊúÁ/πˇY4√%VjÿuätŸ x‘Ò$—ﬂØk‹.îP0∏˜«"PSß|k¸vMC
ë9∫P#∑~üJô*|≈ŒlØa˘RØú≥˙)úúxn+§w•»Ñy<Ò†ôF‘ëlΩ<·P.ŸÎæ(-9X≤uı7*«Ø—˙qáÃô{3ß¯ñåD	∞+£»≈Mî–œÀ≠ÏûÑËKá≠8≠_Ïˇf!∏gõ¯ÁÅ{≈¡◊@q˝≥ÚÁÖ{%	ë"\âJ·QÈÉV§C@tò«Å‡‚)wh/.êú!Që0˚∞Ã√v—!]∞gó{H8b˛≥v¢Ò¸Á˝ßRjP¨8}8”s”©N*ôƒé"òõ]WHñ±8œ|√xfáP'O2≥lã‹¶LàÎªmr<ìug˘‰Œ˙’±/QuhÖéEﬂPŒj¶@´™ÈJx#ùƒ¿-$/»ÂÒ°ë$ezÃ¢D|RÈáæú‡ìLõbÿ[“<rCÁ6ûáã»;’¸’#7Lú	èÌﬂ-—·+$’¿”±<èR€£‘P|	√S‡X>äW¢ï`F5ælìç˝V+Ö¨VÎ«5ˆX)≥9”ô‹;é<FØˆµÎélrãï#¯)€b©HÎîò’±LøÍhı´‚‰®.˜˝1-∆j`bs”ƒÒˆ+ñG•Í°ñNz‰ñF˛€„"Dºß‹ÑÙÖ–œÃa‘#’±ö†ó?'°¢21;ﬂO8›…Ÿ&ÕÜwîëi’á|âG\«Â¸dŸwñGŒÊûÂ¢S/íòÖˇ4\œ†È&]ágÃºÇá\%Ä?±ÿŒµ5˜‚ø0`UûƒE!åè`X¿~Mö.Ï¿yìÀπ 6VVTÓYS è´>›EwÇoå£«ÉãAåÈ,ö+ÌhÊπq≥1l¨|XˇEnàVõöl€Sò…A2‚ÂÈ/ÚD‚YuÀ¢*ø˝√Ô9ÂêÚü
;9æ˝D‹ƒ[X—«ÀSuﬂxUc•tú‘g„]FJ®¿ø∂·œ°;uöœ´)˝◊¡R:NÆê¢ê¸%Ò&ú‹¨UoÅ6`Ö∞˚KUû‹	@ôõÂy3E™p<Ù|∫Œ5m)ÀµSJ‚®∂Àñ˜epy¸ˆ°Á¬(∏\ûARÂI≠s%‹‘(máNπ˛m¯ π0¿[á\∫ÛêáJ˛®ÌL˝$„∞Ny≠ ¡RüÑJ
ÃÛŸa ç*É^ÁA;›ƒ5‹F•ÇZCã+®±I6;cíJH”vFÒï3ÜÉµØ]ﬂn⁄(€mé∆èmÊΩVBÍ+Ø€c8†¡Ùÿ∆à◊ZA˘≤Œ˘¿õáïnËxIçÅ∏)08kRÌâÆ=Í‹N??v,¥Ê≥«≈‚˝óË
)fdaì]FÁ‘ôªO%rjêîf\_Ô¨¡9YÎÆw∑Uü™l‰j€’Ô1`VÜ–1\:S◊sÂl˙ørÄ•¥Xréö¯aÃ÷â*ZˇpòÇé˝∞ƒr±ƒÂ∞Mé~vd<Ò›Ò≤Ññ)©'ÿ?#Ú8wQÌòp¿ëŸ÷5¿i^Õ±ª>’±(è;JGóü˙òz∆®ÖP√S∫Ï3ö‚Æ¬;G}$’±HœdzæÉZˆ…]ÙÿÊ≠¬	˜…π{Â.>>™z‘{3Ï]ëìﬁ’_{?˜Œ%b≠Jç∑≠H:*qqÛïNßGf£Ãk∏P$ÏÖ˝‡©÷ÛonÇÿ \hé‹Ã0÷|ÄÒª7æcbÎ˙∫Ì9˛M<y‘∆x)J®£ ò”∏µI≥oLZ∫]*Ä¢c7∆*¬÷<–G≠Kò—ä∆p"ºë•öótÃdü¨k<∑ÛüP_Te‚Éi∞µ¸E“ÑŸUG´Afb¢ôáûözÍ,ê’
Ωo≈ù ÖˇÏä¬1Æëı…B:Öl\íS	∞ÃçµÁ~#ö–úI≥I≠Œ÷∆ÊVwÁÂfÁÂÀ≠÷÷∆´Wõ÷ˆ+€rFØRˆ®ä$~qÌ∆{ '≥ﬂ€Yq∑áÅ:∫ù(Ï∆]káL‡ˇÇß]0BÍ—#hV'Y^ºßaIÒ“dÍ¡K'ò§Ôî›Ót˙¨∆>¨55-+›ﬁ¥mãºK™™
≥œÆ∑÷Ø.w€%W3Ú–åÈ‡
}o_∑?î)Ù/Q€∂\Ôﬂ¢ú™¿1	üÁp-x√µ[«Gçï«µâ™Æ”ôUM^ÎÍhÙ¬‚…y™»Où‰»?≠›LÆYì#÷ß¡'Xpä%πHá(Nà.^ëüâ4}‡R¥y%ﬂÉÀD¶lVdYLÆG‚x@V$ù°Q7ïÔh‰¥‰ •„•âœƒe•ÙE⁄0”‰íÔèÃLX∫ÃQ∏°Ãc˜òŒVì¥6πxF«K◊∑≠	K1õdóiFëª?ª™—ŒèΩ0ÓÆ0π˙©sÁí›Wb
]§§ﬁbgé…+WÏé”ÁÓEo¬` ¡õ¬›™LeRàÜ‘Ÿ“‡‡Ã™wñÔ⁄â„Õ≠wÕºÀ˜m	[6ÅÊwóøUïà[≥¥⁄ovamjª¢›Ïÿ∫#¢„˛ÁRÇ2ëCä—Ö6,°cõ’PcÀGGΩÎY‡ƒ Ô‚˘çÒ√ôd„Pª‘+◊i)°≈y\¶ •e£$nÅƒÎ∂VbûÈÉbF•ÔÜi‘m˝•Fª£ˆ]M—b*ûùpÊzÓdW°“Q4‘M&QÂ˙ö:øNãTYõ¢T©L‘˝SK“Àu¨Wqdeíåµí‰.˙õ^‚Ü%FÙKÃé
$∑›nW˚h'z3µª‡≈ŒízÃê¥%W∂ÎZ1»íüÀ"˙∂Œ™=◊qJïæÎ&ﬁÎjÁVΩ{+}^+≈x•Y @ÿ°)Ö‚<ü,#‚´§tn4∫DÌ˛W5Œ°§ÇQ∑N˝¢iRÍüÜÛî;´£Ûu¯ @eÉj¬Ñﬁ•X˜¿
ÁR˜ó≈D=ç›‡i’û…‹≈ N]±⁄Jﬂí/ßÏÉò˚(¸)~f§Ù´T˚*˛ ™?J¡@®K“ëÊï}kRnØ§˚[{©À™UNÀ≥™”¢ûZrß7u!˚≥ÒXGu«ïs’2Öôéæ˜åä8E˚Re\&%å≠ô[P¥3Fb‘Y•àd˛í¬¡¨£∂Äæ‘ '…≈uá¶:¡ πË≥üŒw˛:˝TÔßë\.˘èSÃì›
q±ˆj}Õpçâ™≈¿hõ]9K]¢ª˛ÿ÷ÍèÛ∂_aØj©.íÙlIeú:6ÃR6ˇRÃY’,™uœßje9RÅ´&{ÃxrŸ¡x>úäﬁ–}œ¡?ÓAò“@Ã
&|7<;=F¯„t∂ÚöIf&*Q∆ ˜h«âé+„íUÆ’ƒÿ˝¨®^k©Ux*Î?´sˇôÎ ™—Y¬p}W≈  áä‰RÏ'Í±`•∑ ,-j∫∂uõWGç·µK{÷ç2ßCï™NY[t®|Øt+/o$˘Ãªª§w˙˛äúÙØ~Íëd0ÏﬂÃ“ö'yâõ´≥ìWß@ﬂ†§Lï◊ú%Ü< d0ü“e- Ω@-$¡¿ÙÍ‹,dJΩm©6Ù√FÆÇEÆMÎÀ]!˙h…„ÍyÛ0YØRQ•öRñÙ&€æoDÆÇ;ÈV»ñ¥‡TøY¡¡<|P+Æı-€%ç¶sˆ·¸Üòö∞d÷N¥K>4≤˚øêGuÙN÷V∑MN VÛ®‘÷ô„œAbùÁ^hπq‡Y∑¶Ìo¥iH≈πº(4èÆ«ó⁄£ ;l˚c¨YV`–∞ìM\ê,ãwqI≤'ÜÌmµ…; ≥T∏)∫úò≥uá÷’»8√.∂€‰Âe’ö√®Ò1ÎÄΩiÿÚÀ6ykQ´f±mh.}dÿÿNõzA‰ÿÖ∂¯MM+øpÒNÃ*p⁄ü+85∆üπ—!S˛ óÜ_∂ì>≥⁄]ÚTÓñ&t‚yË/Aì0U@†°yCTÍ%Â]EkTçÏ∆x•kS…ˇ‰¨–X2ü≥VùÒ⁄j•î|§
|à∂1ΩlU¡èUÿà¥ÂdPtG∞b5T™˝V$}Ì‰µ”8≠Ö˛aác˙ôÈ‹◊ÕJ~˜∞wˇ¸ØˇdeØ©◊ ê6ﬂ›W∏ZUL•äGU:÷.»€Iûl3Yë7A8U–—E›}çZ¿-î6Ë˛•¢"àíˆ∑§ H‘-{Z_§˜# 1|˝(ÀsÇÙá4áãD.¶qöÉlß‘Ú´xû'eë7PeÊÂ_=á?≈QcfCæå®Üó€|ì5”—W*∫xπˆ^*T¥µj±œÙHRÔÌœ2VàcÆóúmË	*Úºe7-øü¸ÖﬁÂ.ÜΩﬁÃ—lob∆,µöq≈˚Èüpt¨â5ÓÙ› BçJÿ„˝Ú=y∂P	´Ωœˇ Ä'I([≥ºÚl±°YÔ˝ÑEOo-∏Ãˆ}øxá4œÇúAåh^lË"7ø/¸»8Ú≈V§ƒ◊Ôón±Z[6/H˚‚ØtazÉ·1ìˆÀ˜»–∫q'.@ˆÈ?§ô≠Ãtd›„aZp‡¢@≤OAì†h∏#^K.‘:QˆŸøŒá=p¶3êå`º ÔA«ÒÁ‚xhM°À~‚ `zA8¡s`=,ˇ©î≤⁄$c>ãWé†˙AÏD-⁄∏˛+ip„Qpã:~bª∑.ú∆U™´∞9\%∂ÁUòfûçƒö˙L·•+Q¨M2¨›z.=Uq¿·2ñÖïù˘^e_Q1K©qÖµ¿?—ô2x]<Ñjê1ÍT(©=G◊#:Ù%ŒsÖ´ti=©Ê\›t@$∑CUi  ññ∞*«5í&^¥Ä_⁄‰ä–<o$¿∆B!€íc OË"∂™¢Ë&‚‘Àã∑€≤≠VdP*¶îikÔr¬»2n"ÿº WŒ≠5%ß¡¡<NàDî(`!ÔØö9ªi¨@:WD.Ê1…%1Z¢ÆˆÔR€9pïŸz˜@^˘ÑUÈt´^7ú3uÌ⁄ÿyzg!ƒ…ñH˙'œÃºøT_+Å∂ıpöö¥œ°Sç¥Ø∞¬ÿûëãØàÌQ˜Za°C"`ﬂ‘¿§%Öº2bç‡Q¡C!¥ ~q‰ê]ì0kﬁOÀsÆm”RŸã6…U=∫ë5B'¨∏GöEÑD÷ÙÉ™÷e¬
#πz$/F0™ËÑÜÙ∆H±ªÙˆ<r¬*Ωfm?°Ítè⁄Ld”∏µﬁÆVŸ2TÀ¶a¢ãYt"	&ãú©[‹å1B˝≥—ûPb˙ƒ1.ÊÍP'fß‡Ê–È%úÍäY–MËﬁÅx”*/ß¯.∆Õám˚217ï7Õ¸v…ªﬁiÔ¨wNzÉ˛˘‡ò\^]¸µbÊÿ¿ã0Ìπåg_[#oh‹±‚ÿÒm,øÏ+Õ@D¢ô3vØ›±Ây˜ ë!â'nî`˝\3åÎÊOziKßnÑx÷Ù;∏Ñ˜I¨Eaëö°UôÓ(˜∞ó™)qœdí¶'0	4ºYcä˝≥˚¿sÕEm:@ëMŸ∂H2√ ÍÁå≥RªKÁ¡IH˚˘A“Ê8òé‹ÙÂ=RÙh∑€i∑E÷û±QüYqË~ÓßÈ’ÂK<•K¸U⁄b;
¶N≥9¢∑GÙÇK>≈?ÄØQ[ÍzÁÑáRf˛B˘A2â˛"õ¸,MΩLÁû[î0ÔÚØ&Æm;>õ8L∆,†¿æÚ=ú»JDΩs<Ùﬁ+§ë¶eGÃaS lõ|rù;…≈ ’üÈWû ∆Ééâ”.HbH∆©Õ˝˙QcrK*k£‡tÁ˙ G`†k7ú6?˛’¢F‡¯/à≠7k¢AÍ¯’¯˙!m˚±¡¢MÈÿo≥2A<jÿı›◊WdÈl&πfsÃãùÇ?JEAx8UîÖ≤˝Ÿ]ö∫L",BèÔ${(t¯Œ˛XMöÒyã√¿ä‚3'ä £4?äCló≠õl}> [LÇ;⁄b3Áé¢G†C¡<Êh8˜—µÂEŒ *ÈÆØØó>Œìû«2l“|Ìlπ±∞Êhõ÷®LoIÄí=sÏWì=9˛N7®ÇYÉ∞N„	 Ÿ+ÕΩ‘,CœÙe$RΩ””Ü,ctHπ≈<ê5£˘∑¥‚Û‚Ç¢K[û—Wä∆é∏=vn”O’„ªÚûˇ.€
Vw4èp€ ö”f	`ÑÒÛj•í¸Ωj—^˙J1Êﬂ•ÈìOØoëO;Ω¿áî≈’|W\ÓîÇ+‡°lßìlŸÚü>J®¬°ÂçÁ»¶íŒfÀ∂Ó	›tZ|õÚK›÷œ ”˛Á±„éÒ'Œ¯÷ÉÉ•f/x	ÜΩ,Yw“Í
˘Q"U`)ÿsmeŸΩ%8=ˇ& &⁄eß–Ú£dºÒ]ÄåîãË¸qòÆ‡∆ΩH…ÿç˘tó∞ 
Ú¯·dy
ºÆ]ÂiÆˇ ˇ¸+ˇ~ˇ}y¯l(∂∏\πï@¿NÁXZ#zwÖ|O\≈©‚D≠≤.ÉºÍ„{Üétu§€w"◊ÚèÿÌ&oª‘snï€@ô&Õt•WìFW”ïµÖâ”Á=ñ@¯(D`ÛÌ!,ÌS,ß3˙*õ=PÃ‹∞`Œm>§G≠Ÿ§¯º≥ëΩQ«_1vâ¸}ÓÇ ?N<ππÅ€ÅáÍc∫î¸÷êæü6 Øc›Â&‚ª$·ZVã´°pŒgh^a˘Y5‰“∑%|w®àÅnÜ"çÉ¡qŒ;ÃS/|@U¿QíV¬å‹	yÒäZZƒ˘)…∏ΩÚ[U3“˝Œ≤›∞!O\,ß0?8·'wÏ¥mN¥sƒç1ÕF&6Vã´JT‚€íÇ_?$ÙHö_?$Ä∂ír2∂MìŒ®8Ù95∆ò]ï3‚Í#æjr3j+é}xi}gw}]Û“≈<F∑ó™∑‰ô3YA¯Ü–!KW±»≠™VıI(∞º%„–Qoâl˝Sù¬Æ°âåø≈»WÒ\(ŸGÏ,ÔÚÉ¨zÉµô,∏Í-d•ÿ[‘+(¬ﬂ#Îå›í∏zÈ˛„RÓ¶dB˙'Õ	ëÅK5» ¨	∏¢âﬂ{ÃCËPZ·ôÚz–
3ÏRÒ,Cå…‚NH™Q¿|˝ßåBoÑKπ?∏ì◊Baêgˇ≈µ`(˝;Ïü˛ÌÌ’Ò—ﬂﬂıONèCiÔ¸´^,Ù^(BS˛LvÜ9¡TÌ…Œ0iv»°ÉKg∞˜Bw•|Æãß∫Zƒ]X¿ï¥óGo`#]öªΩˇyÑ ØŒ˝1uÙA÷êFAØ®dÿÁÿ‡ë˚,$z(ËÓg™NÅ7π^%ò9~≥Å¡yñ[NìGmˇ¬∑2Jhy ŸÕ∆[ã⁄MùÈh~kë_a‡égë±caò£7mrL`~Ó?\ÛFÃÇŸ|FFapò†-K–'w2(Â‚‡´O=tÄaaÀJÎØé.áΩÏ”7%Jm’m«≤•ñMö€lˇàÂŒN@î˚Ωµ VeıÒ«5ˆô¨¡(æó?&∞ÔA¯†6ìkkÍz˜ª‰[‡(?91Ä>9wÊŒ∑´§∫ñ∑J"ÀG˜í–Ω˛ã`€pÙv	f–¯ÅP;˝.˘ﬂß˚jcÙÉ"aLÁºÍ≥KXû{ËèŸ/~ ∂4ºq˝÷(à„ òÒÓ&6úòóìõ≥œ$
<`Ù˛˜˙uÁe◊JGíæ“È‚w˙L∫0÷ﬂ.JIÃf‰˛√IÊCo‹9hàﬂ%;Î
1ıL@N7≥àUı5∫Ç)ëu¸_ÆK6‚d	∑7_nÓ®óp
`ﬂ¢>Á»`Ã<∂’»
Ø3h›Â˘<YFyÅ≥ôÚqtJSGlÇ5æΩ°∆SﬂıŒµu= ÄüoTHKß√öe˜‡çl◊úÆ≥sΩÆö]åπÑ`bwÆO‡ªııo“ña}<k¡8ìøÚÉß≥·SåÉYrG——dïƒ∏Ñí!éGˆñ”&∏œË|D®E´≥∫ul9]¥V≤µ◊ùÎ≠ÎWÀÅ.ÓÌ5°îÈ!;Ä€€[õ“]‘7ÑÿShggk”^wh'≤nÅ€‰lÆ[◊4dy3KhÁ’´Œ®3™”ŒuƒŸà@±IÅ¢Ê¡)ù’»2`Ï!||V`9⁄@Œç¢Ê◊¸∂÷ÖÛ∆ ]¿äÎä√ı„öÇ¸∏&ßD?"m–ªﬁÏ5éSÜ4w˜Ø˙'ΩÀ$·}ﬁwUâ˜/á‰ÌÈ≈AÔîüΩØé…€´ã˜ódÿ?9ø8Ωx{¨à·2®ﬂµ◊HëË"Â∫õ¡ÆÇs˙0”©>ÍΩJÒŸÈ≈Iop,kŒÄEÓ•ñVC◊÷¢UÜË|˙W«G}:ÇDWe0Óüﬁüùˆﬁ•ÖÑ	‰“ıì ª’Õ/Ü∞·GΩa/l±lpI€N›ZdE‘(R¥´X6ˆ4‘¯E†«oØ¡œˇ∆zë†p—ÿ?ø fn¢mlˇºw÷KóΩ˙ıüz∞®/¬KoﬂˆN´_|◊ª:Æ|+ô≥tö,Àƒ”⁄¯©wFŒzÉ˜'OoÊÚ˝)Ã˝iÌúˆœﬁ_U/ﬁIÿøÇﬁÙ;œ Ö_)AÒ«XÖ∏Ò“'ÓÅ!yN˝CgúE¶ó≈†¨{Õ9¿«∂v	ø∆∏qÚ=È†D£<lº•˝GAŒ^ô¢…—æIŸ◊W\Qî©ÜåF¿∞πıíum˛’}2f©J/iy≈§M›™&dèsV_?43√!´z¡î—y[‡#ÓFÒÕwΩ£„+˙fû¬=i||=ò>¨∆:∂y1èó€hN„G¶|Ô{“ ?YSí^&®¢Œl¥j¸@»«ïˆØÅÎ7ø˝›	ütZÅÃ,Ø—Yoh÷F•xµimåv`È2GC§⁄©◊Õù¯íπœoππÃAWöˆ÷@åØDêHE˛EÓë	÷1=o¢<†éäüÌπ£9Ã]}W5π	‰m£à–ÿÔa¨?πÄ•≥"‡-oqNqÅ·GN<ˇuÓ>i<bá0Œ7\._çCw¶àKLtñæXhùL4¶Õ™ä†©¶≤πÚ*]e˝™⁄B$6~$j¡è≈∆i;∆∫›ÿi
z…íäS˙Ÿ#;ã>/E≤"˝KùzdË~˚Æﬂ;Í_ÅÏˆÊÇúıAz;,Êì∑[H¶–!—tWÃ≠êK
∂©IµPl8ó\Zà^¬j·iFãÓN>£EÎêFë0è» £_QQ[—⁄†·	i¶ìé::†TØ{sGYÉBwNLíøò≈ƒF±∫Ï£ï∆e+®*	 	EBøí‹ËíAƒ4(äÊèâC8†0^uZ0©ä\18eiÂ‚—øù)`Zœ¶kV»o#œ2¨é;¯ÒÃö]ÚÊÂF÷q´Às»iNÉ[+µ
(í›Ë$fgFyHT∫Y~$≥3R]uN[rÙÀ@8·æ>≠!f˘§KŒ\Ã†î‹‘PûîXDî@ÿ6+∫í¸‹¢E$∫Ô±ûg“åùï∫¨Q¨¥:±.ÙY∫£i2q¿ﬂÙÔ0∏„€°◊ﬁ/Á·¶«GMdXÑΩÂÿó÷=¯±Ω´Q§:6õ%∆Õ◊	—ÖÍ¢EW6(ö_∂:&;Á°gÚæuO›Ï®7€Ω˛ãÃ•OÙ~ka¿Ì¨≠ë≤˘Ë^6 @≥Ó5M°IóÆ˙7uæMπEπT:g6µNÇ⁄q?ö‹h∫ï£ëØ√˜§≥Yëˇ˜KNcc·itw~G”ÿ\xõ›ﬂj gfqÙí8Î™Ñbπ ±ﬂg/_˝∏ê€_1çùO”°yà(µÎê&''£’5»[Sh¨õ5÷€hm÷ol#klCll´µ]ø±Õ¨±M±±ó≠ù˙çæ/Œ˚'4∞ú1ˇ {Ô≈p}[Y ’˙T0,™	’â$>Âí¢I∆íà£íÃ%§=b˙£[( ı‘ºãü«ÓrŒcZ√ê¶*!Üd'ÜÅ•™	Ω@∏êD(ôÓJD”R,¨»7õ»*)πæøŒ˚æSµÙZgCxO_/CŒ_ªæÌﬁîìŒ6º±ﬂ‰Ï<ÌUSS¸˜*K}·Áß˘‘MÃ"OÒ±|ê:≠πFÇ÷T
ƒÃßQ©ß§64ó¨ªÎöBûr√µú E1”””ÿø`∂n,-®rêtßOh0tBõπŒPÔû®˛å*àÔ°]Ç;\>òã"˝bÄ~hyHCÍΩ]Í3”¨õΩ∆∑b–gqøÿß[J£x©ÀªKÕN®^\ ¯∑•™Ô√ãÛ·’≈ÈÄÙÆv…†ﬂª:|∑Jﬁü˚WÉUÚó„˛œ‰Ï‚®˜éé»Í≥}~8º87”ëã|
÷ï5<iyΩÃ‘.ÍeÍ7s{÷¡]hÕ PΩAx21Ë˚éfcRÂ]¬‹◊,¸÷¥nD™©Á%õ¢)t±≠…DÕ€óiÎi>°¨YçŸÑ÷∫Ñ9f“Öºß7
9~LÍDqÒ˙dé˘îå¬ë¶'X#∑¿Î
c)E ∫ı*Êñπt⁄»Busì¸r^ÎÊÊb•@Î‘Ÿ*¶ÇL3ˇ‰xÚÎ`<èviÆßÆ¯#…#◊UÚÈ0Ÿø<èJZøS	»Zï¶j◊“ |’m[⁄äÈŒIjX=iØä‚ñ®ÆŒ‚©<byôs#ÏúÈ‹Jw°JœÛÄ‘Î…©Hññ´EÏàµàù™ZƒNre±iN≥÷†„h<™3∫UMHU°∏BÈ  p"òxB#5 Î\µíBÈ:EPó)Í¿˙óÜÙTG¿76!ÇM∏MvE˛ïcÈ÷V]"Ç‘Ml[±˙]ALCN?"¶öÄÌ‡gä± cö^îæ’YD9zÂ`/_o•
OóTó m	\U∑ƒU•,¨æé√∫sc‡Ä˛‚:w‰’M¶ºVuç{aP™k:¿·§pNM! ‘> TÓI1OÛ“9≈zEäE–◊1*ùÿd^Ãå"ÃMk…8ù_ãÌíFA'X®ŒÆ9Y˙ÍEΩùÒLQ≈ê‰nãÈ±¸D9ˆvK "g0Àé&úkŒ∏oPèã∑Ë{TiŸ◊¡\*Ï{ß˝øıáΩ„”=ËÕÕÓèøCZ}‡»â-ójÔ±V@™ñJk·”°;»®ÿÕBY%¥wÃí™$hCj™†ÖÙŒ±‰f‹ñπX`© ˚ö#D>ÇüÂ!P@=å+sdÈ0w#,¸›zµU885òt˝3ÖB©$h√öl≈Ã‰´≠◊ƒ%ê¢áûmÛ:YÑe_D/ûãk9–ëÀw ›±ﬁXggX7öeL0‰—ac2∏L>)T{/Û.†œ	!S;˘+œZw}!∞–ÕmÜ‘Ô2U0`y.r
'ö˚7 éíÑ®rÖvMPDÉ •7èåt[ æ'|\ô¥˝dËr,V ‹¢%jìÏ
˚w3‡˙7%™ﬁÙÅGØm˛∆öMΩßLí W»ŒC’‘∂ b5πêí+À´Sj¿Ob™ö`IwJM$⁄å“”t<Ÿ≈Û®í¿‰ΩyLJwT$îJ.£ƒR‚ÀU{≤´êªßQı~í«G˚ö<Ureÿ∂n }™EÅäãÜØ'7|,åhqÑ¨a·y∫·ÿsLPhÇD9
Â8ª¬’aaµÉ‚∂‘úï⁄´HgóPâìúıÜW«ˇÜı∆@ÙDâÈ¯¸Ì€˜Ωs“L9Ååvÿ«øò∏÷ª:^ë¢Ó≤RJ)‚™pxmıD¡^VàÌ®Ì¡é&∏«)Øà“-ô‡D◊Ë¢’≠“UZ≠=—÷®U˝ESeÛ ◊4]”Ó¯vô—M}7¥E9
LéâﬁÄïÇ’È‘’µ_+˝u'¥ãr‚π∑‰6¿lV1◊∂≥0»©„„ Zîü£!∫ñﬂÊÜÌ	Œ$àÉ©√‹F@EÊ¯æÉ—ìÑ◊&«∞(øZS‚aˆ¨Õ‡¨ßê€I˙öf1‘ëUÈÙaÃ"\ª µVwŸ…;bºÃ«Vt÷%öd=DSùCÙ›úªT\«¬‘{,uúf}uæÓ¨®ö˚•†_`>ˇñ'Zl*àÏ/hôÅS¿h≠ÁÕ¨ÁT÷iÑuS¨ÕÀáñt"<√áƒ]H3eP:EüÑΩJ=7vÚœÚNVû>Òc∆·%I‘ï'O5 )a]ˆMV◊;°Áû9C¨ì‹»ˇAC´“îËÜÇ≠V§≥]	úl8ÊQñ02∫W≥º*xi"õ’ŸôÊ>"áÅ7ü˙Qe9¨ºá,≥U€´ƒ≠¨ÌïLû¨›«¸"tÎA V~3Ä_X€™.yU>ÃBú@77ÚŒeví0£ÕG,Áts}ïlT$X™ËV¬˝∞j`IáÛ©Y˚’@∞≤RJ1Yh¢‚‰fÑ*çbNnt≥]y…`ì%S¢˘:?Yœ\ïvÃó˚5IÇC¥âà>¡/Õ\)vpcÎû?™Í≤K‚ÒAÀôdônÙ⁄ûﬂ|:ª‚Öü*JÅT¿ÀuNrâÕÈx‰©ÕŸ#‘—Ë·Æî¡<aπÄπJ ´P4ÑµÃæπ‡ˆâˆEnÅ‚ÖDìb'qÊ∞9\U–Ùo≠ó´Üö "Ão¢{UU?f§˛ÃE≤…(<£Q∆πçî£SWË3RF?≥qeÒÙ\¡¸ê¡ï÷Å)gÌònΩ@°ıír˛/¥äìŒ5Y°ÚÕ_∞Æ(U3ŸU·lj,∑˘+∑◊ù")düÒ˘9UZ‚#ö|ç4X≈ãC¿«w¥é”◊‚
À´:ôMŒl_`gÜ°M∫9ªßŸñVÊÛÔö±ã“Ç±Y¢¯ÄiD—úŸ ‚≈7)”ß≥ﬂa9£ô·ú+_”rüzä….F7CgLˆÍ…*Ä§D0+ÃëUˇämª—eËD,i7ˆÛ‚ÖP-I,¡a“$´ƒ\)ÀÔø7mBGNÒøR •ﬂÔësZ‰ß)yv¥ä–≤Àê‹≤¡X*tDÇ*.+◊ë6]Ñîj‰®…0Ó¨.™«KäÓ5q&1LSèóËØs◊⁄!¯ø÷_Æ∞E& crÚ˛:SÆ…[5÷ı˛:Â+˘Z_%;B0í‘ißhâÈ lC€:◊˘µã¨Ê7ÑgÒ—√Ò?\ønﬂ¨%úΩÖÁó·rö,è˛|ôih{∑4 Ê€^§©d†#oÓd„§øû<LÍs%*!ÛÍ…'¥Õ⁄Mô~â√OÅmRXÅ÷∂k¡ïŒ	¨|%LTû}¬⁄)¬xƒÃ∆çzÕ©ë`Øh1√ 3Pvl•¡ˆˇµòêì•U§ˆèFùQö£P ˜πÅ˛Ûø˛ì$wh⁄„âˆ‚Ê:fúl¸Û?˛€Ä›HÆ
wêä1iú;§ùã+·¡"ÁiHJ≥Fq0ªÉôuc±åÅFì0}Xò¸b—¨`›4u˝ΩFmî:µ>Ô5∫õu?ãbgΩ¡“’¸0ÍV{¥<ñÑûîB™V ﬂ`…Æ,¿$©ÉgÃÊÊØ≈rGÈ⁄ö–YÌë4≥Né‰:ú?Œ>V•óí_µj∏!Pn”_Ô:ΩˇãÏ“ªªHø®9kQgΩl∞Åﬂ°ï…w%µi)•à†>’©;ôÓ÷ôK#˛#	gLµ8¸gÆÂ≠,∏ﬁı˝˙àÇ˚¢˝¯'kJNô˝∏y‡F±›€ 
¸õ[ÀQ⁄ç‘æ¯ÚÀP¶O.EŒºYlü}.@cˇßiıÔ’LKê\∆@çvÕ4T¡[ı cïÌÅˆg¢-g3(—∑–
ƒŸ0ïM˛z»‘™‹ÇÖHÙ'lDËﬂa∫”OSÔ(ñD0∫ Z{rqAR} KÃèÖc≈€èx0?Ú„KôÆﬁ(Éó>Gö∆dV(’ZØÊ‡*Úî≥W≤\Âùù¢c=∑o ú⁄‹Ò úßq˘qöÄ≈vÖÙ+j>ï Ω™⁄)6“‰?Áè5%Pj&ﬁñDﬁ©∞ªKÜΩÉ˛)aÅ@‹√≤ÖÈ3éÑ$Y»y0aÙ{u¸Bé,‘Ø·_’•Et\Yÿ1%Át≤í§¡nM_MSÎ‹¥oR•Gﬂ‘k©∫åè¢…Ú'£cÖ}»Iü˙<≈'ﬂ˛´dçj˛,‘ÆI ÛÜwÍ8Dh˜ù∑dV7à]ãƒ,¥zΩìÅ iô‰/Á¢ˆ’}YÂ/RU=Iø®Fµïå˝#òË˝ªÛéx>?áW¥qyΩß•ÿjÖ÷®•üÕ4Ébn–˝⁄’£*V¨∞€ÜÜπöÂ®æàle4p*(…“¢—Õı©*e‰ _ËÕ‘,ùßDÃõ÷‰Vhc=Cﬁ∂ñ<Y‹º≠≤5©ÆÕKoÎ™”“R,[:ãVΩñtˆ+≥ñÃå1fä†áb6
3&ÌymHœmßxÆ^}∑eıX£˙õyó¢Õ‚∫Õ1m±~‹GIYπÂkwL|ïDÔ§©ı<Z©¯ó≤ì`Z≠Œ»‰U.n∑§9=ùœ’≠LR¥†a—‹ô•Æ+Kç¿ı‚•dáç¨epY0ÆΩxâqÓ	èvlﬁ^º≤p˜'π@K,Í]Õ5÷këE∏ãL·2¢›ãW˝.•*ıöJb„¯›$R^÷çú/bnì@˙‚U0-ÚU+#_Ù¶[©◊4è¡œ#¥Z√´g±|j¿~©wsÎg^Öé)qÛzs¡'9Iœ§I¡≥∞SrjçD§§OhRæj¯
bÛ]≥p˝¬ó5ºèÈ˚OCÂÃ'Ò»Òúÿë"hjë±€*©!Ω%Wç›FèÙtÛôK˙ÛÌ~ﬁı¸˘∂ﬂÿ l∆ Un®ÅUOÅ]ÆqNœ±Ω&ùtâeÛ òNTZ≠óY4¢Æ0q‰DsÀÂzª§:Òü“éW˘^é=Æ4Û∂?¥˙{dcó]úº?ÎüìÀ˛˘—˚ì˜Áo∆Ωƒ¨«Í^≠;∏Eˇ#	Ko^úñ%πc~Ld>£π÷ÆÅïòë+ ©A∂sUÖR”·∆∫∂&ˇ&¡∫ü=y˛:…<v¥…<fûRyè))&∞lt˘…	¥Z∑dç\¡ôﬂb∂1Ã=&&y&çä¢ø]MÕıfk2¢x4o¢ÆÊfç*"∞_®6‘‡öóç/◊ÆÚt“A)á¸Ùj‹	“∆8Áz	˛èÿGÊ	˝Û•	`IÉ…n
1ÉÀ^®vï\^êÛÄÏÏ¨íÉﬁ`Hﬁ∏æ:?¶¥N O+µÒƒT‹&π∑®∑¸ªáÕ°;sû
õfEXÜ ¶fÄ∑K,ˇ^Ä>¸ÚIÂ$ñ &t›M‡DcíÃW$ÄÉ–ÿ«”–ÃC+¶uﬁ¸3&“åDµ´^^4ˆ·@5/Á·xÇ¿pÅs´ﬂ≈∆>=êÕVA[°ENàµÈÌÍ7; (¬Œ§¶‘∑vkßñÎ˚˜VcˇhyL@ÜIèB·≠ÔﬁöWZî?≠«ÈÖ8C›~≈Qt;ÜenÆË*£Zû∆Õ∆ôÕoo-ü¯Hi8_ÙïÆ∏"T=Wù,&ffzá‘ºXö•M>˙_Âh˙“PçY°¢»Á‹NOxñÆ¨†}xíS®¶»Av¯ÂÄƒR¯·ˆ$0eî§–••pWv®À±¥òjÛN£cXô•Uë'´µ<ﬁRJç Õ‹Z¢ñ9c/õ•z˜å=wÏdr—Îƒ”uví¢(rv≥ñü®≠⁄¿∫ûµú˚Í{‰©x\≠´ã oKïzPû[rÛŸTù3&wú≤¿lèıNAœ—9Ú8_æ◊œô¸se	ø|«f6¯◊.l≥˚•á¿MÚÓÕF”ª’@≠f—∫ïô∫îi‘L’hU	ï/ô:ôU7ƒr5„JW≥‘Õ^¶u≠t˛ek∏òïlÆõ2º‰1Ö√·_*µkä>ÙmUÍªbJñJ1Ò2ŸùLÚÂÖ”8.!©RIgkÂ&>6øé≈Hõº»È8‡:∏¬^T∏≈<)FıêI≈aıb4ôûò¸Ä€ˇÆ›:>j¨í¬‚∞Ô—x€à& ú¿]4ÊÔ—òñeØqm¿£e]R'5πÜ Cî	CY∑4\3—Ô™7,Ú…1
Œ_é7s∂
∞p≤‡n≈¥Ò¯—¿ÂA9Oú÷≠è,W h„ﬁ8s|dPÁ(´É‡2ˇunêFÁyœ&'yUGBòÌW˘Ÿπƒò[(•∂Iﬁõ°‡ˇô%%5˘:˘¸ÚÖ\#≤t"∆Á«ª·¸~5õXÛ|\ÚBÄ±Ím0¥,V.ü˙Õ‡AëYZˆ?◊ÿ«4»√˛’_˙W«oéOz&`‚í¯Dº´7¨)ûzcgÖ°3g‰‹.ò/wt÷Àﬂìê¿ä3.ò-πûañd‚DÆnìÅÎY®å‡rˆ‡Úµ´ƒä≠9S¬€.˛àt∆L˝jÎ÷ZYÄTiºT.•
…Õ“-π%rsó¸‘;˙πwJN˙W?ı»æÎΩ?ÌÀp+í—≠ÛÎ‹{≤=Î‹D„âcœ=Á`å‹¯Mçës+&Wé?Ü≠Ä˚…≤Ô,è≠â5}ãzti<¿Ç¶»çSd∫.øπ12Û˙…ÅÂÕíóÅoÈ]Õ÷ÖÙ=Á≥ZZﬁ*ö$›hK¸?f…/hñ‰u/ŒÊûÂ>'òÍJPó¿tÄÂWÉS˙Èom¡¸àÚóÎ~70’˜Ì≈ 
>¸WÖßg∑∞ätáõY—àÙUÓ†ÁÓ¿jbﬂYXíU≥∑÷ÃÖ›öŒ-‚bÃ$	èÚ¨≤	ÄHÖkqÊŸ/:ﬂÏ'NVc≠Õ—^•…ñî—üŸªÿÀ2KjõØé‹≈,Œë*=‚ñ`ÌM.¢Ê^rÁ∆ÇQhü\Kµ‹ÑN±âë»£¯Úwm∫S±
9saZ1f8Kx¸åI+[à¯]íeòÚ˛S{◊ÃQ=ôA'}hb»QÃ
Tå'Z„ù+†0û-7≥VEUÂNñ7.öÊå·: Q≠)Å”∑”◊¢™Ùìˇq≤UÆê<’öèpMÓÇˆúôê&[=‘Ø˜Ü|À46Ï;B/07w	]¥b<íhÕf˜ﬂ¶w*ta "mÏq≈: u{˘Û≠J±ª-T[jŒO´‘Wtz	Æz¸F;˛äi˙˘! <F•KÜÕ"N.êv∆Óµ;FIë√•∂Úí
gv⁄[zHÆNÛ xIjÚ–ÎõM2∏“|≠⁄™ˆxe¨i∫ò!u]m∂°~Œñ≈q|ï)•Ùç9›äì¬xû˜4iÅÌπ‰#ØVaK¯£ o≠~èÁ[-0ËU*nÌs˝ñ9¸Ib)ª2—Áêd‡W˝1œ!jçQ-–lÿŒ([≥¿•*Ídüw˘}?à1l+∏”[u%nµ#’•⁄zµ¶æxHÅî∑Ép€Ω$åËÎl—e+≠€ò0ï˝S©Z1˘ï±ä≥î√±fV˛ﬂ&oÁ>’ŸSm0Wœg5AŸw¯<˚ÙñEeƒA(W„+WW"D.YœæÖ˛ﬁøÎù£ËÏ¯ú¨ë≥„”˛`xqﬁ'«ßß«¶!@∞a©æ[&ˆ±§»î]∫˝Jˆ0ï∑é}‰å‚7A»∞]7ôÙ˜YÒë¶Ï›’iD´‰⁄ı·∏ñ«ãï  bQ˜º‡í˚±∂F#ËWdly„πG	~¥[BFc∫Å„¯/à8@Ü$Òƒ)ËC˛Ñ∞GÕ£ÀKX¡s◊≥\2pF§./œW$+·Fó3øÔ”cúU&K˚úX¯ú"ÌkÀã
Y®Yˆl∆˙-û2+KRn`6Ûìr√yçµ{'mzlöi/ﬂëıvßÉK+måÊ?M‰g|p¸{Ÿ øOª+TH·c±\ã5Å∏6≈¥Ÿ)§Ä˝u˙§M{ºÑÔ
ØÏ˛‰û∫UL8¿\ÿ`HJﬁL-◊yà}Åk˝ÖfßÀÑkJÁŸ èøX’çØ>Gn,Õ=4[RÃÿêŸ‡ﬁ#ﬁ‡Ü=ë.•∑‰ã¯¯µˆ≥“ 5ì’}›¶√≈~≥«;y))ˇ¯KqÚäZ7Êñ∏åOºaL99¥Bõ	◊óÓúaRÙ#OE™¿4&GπH˝⁄.R‰8hÖ‰∂9WÌÒìk	~Óˇ±ïsx»…kLäK* §5v@ƒ5™;Ôï
◊5Ö©Ö ≥
—∫r‚R˜º,azﬁ+d≠[pMJ´ãfŸÉ Z"¡$O˜≈ñ7Í™;¥@”f	`YjÈÆFÉ\)+I9#∑(2'Sà—”HÄ.Ìd‡pLÊ£9≠UN–m*=6/Rç?Aö—´KØÎô«≤î^Ù¶(‘Ö—ÃÂ–√c∏+©Ωùœ¸îîâÕ∞YpÁà®ˆÈ%†sÆx†˚D˛˘ˇÕ∫'qµ«˛∏çÙº∫ˇi ≈´O^†
»ïäzâJïB£PÜuÓPM^„lW9ü’»l9Òqƒàﬂö3ÂbÊ¯M Ùhß¯÷'˜˝JôP€≤aGu}Mjï<û¢∂òn;”≈≠uÑ‡%vß+≈Ï]y†¢“PV®¶@≥dŸa0COÊ∞5µ¯.c^H\ $≤Ô‰RlêSwB}:,Œ»M–Ü0ıq.–˝ÔJæéõyM›+¡ÁÁôÄàs©„dë ?xé √“§9:òﬂZEísËƒÄL/èﬁ,GµÛc(îU>XU&ÿçÛM3Ê≠≤ƒÆé[S 	á†W©+∑ã©;rå¡ïskMÖm“2Zv@JÒµ¡”òVÒRè˜&U¨§)^àucÖ‹≤À6L±
O?Ó#^±“ÉuxÃ'SåÕ≈ôz÷ÿ…â3á©¬…§#á∆V¿‰Å†°tª\àkë_ä˙x´
»‰IﬂπC6këìèó√∑≠À´ãüZ_ó¨_¿î~T#7÷V Ÿñ•RbE4@é˚•˝}˝@„k/¬&*⁄æÁäÀ∑4‰G@ Z©Óùœdó‡ô¢# ÆΩõÕ_ßNΩõ˛•{õO_ØßíF¡.i\ø« ⁄ås4eVπ}åõ“N$cQ%** ”ça,2)ÉÃ˙®Î¬önãw•*›wˆ‹9¢…ã]r
€.†ÉÛ&◊≈+ﬁ[Yë®+í6v≥tãU≠H≥1~;¸≥1Æàiﬂ‘Õ8…“ÿx~Ÿ√®%›Í8—8tgÃö¯QéeyñÖv-§ÁCΩ∆≥èü§ŒÏQ´è&ß [”Ÿ.]ò∂‹5µ©©∫ßº·9ïî^ıƒÊ±ê[_Ö'>Ê9ı?ØŒ ˚`j}Ì“ ´á«%N◊‚#_ÔØ”<¯‰v/n?±π'4ú∂6˚ãjiıü8üg∞öé›´ˇ)2è∞Ú∞	¯YˆÀ‡SNKŸ	á»~Út¡8O?Â}∆A%˘Tè9rG÷ΩblòŸIfôöı˝%'ZŸU„Ù˝yo@#œ˙ßÔœ»AÔØΩ´äVy>RË]Û⁄„ 
Uú™ÂMMÒbAHñ¬ÉWÉ¥Sr5Vzô¸©ëy∞ùÏk¿µŒ'<§¯ó´§›n„Õ_Ùm+äœú(Xk68ñ‰=qí≤k
≈;MZ=û{ïˆPïgG(.ò«‹8ï˚òIå´dc∏•œüJÃãÄ[µ3ü,*¯EÄı€÷∫©h"·)Y˙É–uÆÈ(r‚]∆ñü8ÖΩS0»j—Æfù≤Ãz7òO©g!Z"Ú]≈dvÄäxí o¢ôw#¸‹‘meIr3øˇ*#@¢àODr•cNÖßS›äMf NfΩLTûÕDÁ)wàPKBÂótŸEi¶ÚWé∞∂&ı…ÉŒ-≥¨ûéj-·Pqñét:r*≈@¯A®ijù≈⁄Œ∫~Sp+ô…©˝¸ô‡,√ºfPñò≠ø4dî¨¯>Å©]:“ƒ™æîë÷=°∞Ïv˛ígœ
Åb°€EQ^¶‡Fgqd¯ûŸmÉaŒ´‡K√¢ò)BôCGÍ¡=®õyßé5©bµD‡ª`vo‹œé›d.&èﬂ,¥µòDíÅ/{Ú¨¿õVcZ tXÌ;aπ÷∏B˜‡˘Äóç’tﬁ4_à≥ÇWJV˘˝0(Ûåxsﬂä,ü
Åß¯7êØÈl˙ñ¬ßV•ä€rv˝è—UXÌ¯˙90›\Á0‰
n.^Iù`*≈£páI3KÌà%w7U°Í¸e—Íâ˜ã*ïy±ûƒ¢2°ùTöa{ﬂVÔ~≠ôW⁄ÿ¯‹d.ΩytËÜc/ï´∂K√xîπzÒ<,√¿ã¥∑hJKãòn‰≈›dÇIﬁ›&‚0 tU2b…∏≥E‹&hÛj«	µ[Ööné∆ÅI≤÷Ã‚T1∫:∂|˚)A∫D ±5ñ¨ÄCöFB«fU:ø´é	—∆ıDdò§5HC(PS≠Oj ÓÚÔÃ#{Uπ÷/…∆˙7p,ß£˘≠ï¢È’d=èè…÷˙7∫ô®CÜE7)Ó›®
.`71Üﬁœ£]ﬁ«BÃvã˜Ò?ÑW2Øúó2Awˇ@Áá¶%Ûc¸ñÔtÛõï/pzdƒ≥ä’ÉÚ©ÒÕ(z	èﬁejj®uî¡Ï˚:Qq7*¢Æ˛5ö6ß⁄-/∂ıÏE˝÷¨lHs $(Zåˇœ√é.‡?πrÅˇ.Û)[…óMY§‰hj-…•Oê\Uiﬁä….3cËÛ»ñ’8RÆ∞ÙüUÆüHK5i
ØÁæÚ£ä™yMW«3LNohñë@ﬁ0ìj˘3”ç\d¿`A3<º*Ç§À"3›∞\¯:ºPôﬂp—†AÅ/îLø ˘é†sEó#±,øRÀ\ä>◊^ï>¸Q'èÕ´–4˚Æz±§.„yxﬁ˚´äÇ≈}Ë{äÍ Û`äUzH≥Hjø4∫yÒkEïh« 4AÓÓû1L|‡/ÀÅä|¸…ÖBûl¶ÿdê@PEHæìkÎÈî™'¨ãwïµY”r…	—ÅÎp√CòX,ıYjkMT⁄óÁM(Ç◊ïãñ[?>y!:ôÉ†ÑjÃL∑¡&*Q)3‰a_:dQC˜!jÚsVí&øÕGx+-#ö”A≥≥¶ßò ·÷©Ù¡W∂v‡)Åæ≈ê
Òç∞‘˘;fâÚﬂ0/1∏GÎPQo1åÌE,a‰$ÎFLQªGŒ9˜pát„*>J¸~™WÒCÊçïtêyd—üyó-â´lT*Y‹-¡ßŸehﬂÃWé˛)∫Ó¢◊ú1øTïíµ´Ø÷•±ç—2c-G•—ﬂºpmü§V+∞)TÁå1õÃ‚ÆäTRRøà¯äRaI»‰4'çÍl#‚ıêá$~º≥4¡H]ÂÚ˜w…GL.–˙˙ÅìgÓ π“ûY6ÀF÷]%ﬂÆªÚ¯±:”∏YÜjìÖKπ¿™”©]brTLcçÖú	‹⁄Úf]'Èe3Ÿ`|≥åKU∫π¸E_Y≥DÊÍP—©cªÛi!à$Ω–—cE¬%ºd|ôÒ@ä∫ùßFv%å:∑‘)Heß¢I$%9∆è¶ìƒïZ•i‚F7 gI‰ªeöÜ+%—È8A<‚Ω˜ÅG˚«¨µYJ<"æ T“…PIRKFÿß“†3€îÈI6(∫¿ÒHÊ(ù.çxoë•Q» Ë–$¯îµ⁄-ƒç
§W'ö3@Iı·8Q—,V&≠Q/≈eN{dPÜ3∑€ZQfßD”D≈†}V&Ü9[§≠≥üÂ∂SœöÂèIX|ò#äLr?}”¬0ïª≠Ø∞õ\‹"m±aâÜË)÷ÒJÉÎ(û‰Õ'’ZÔ‹˜(°Ìˆ	Íµ(ÅÛ£ÆHpgn≈	™ÿOÿ÷=ê2÷Ö.¨£1l`XáFê Æµ5¬r”UË∆„ö”œ©÷>IN§O‹2÷á_V∏‰öà≠ÜB´x°m§ôHrà⁄Ò_\w~èJ\zá∆PôµöJô¶Øıà´≠…ïD“‰·Üëö∑íãˇëÅ\
.U·5‚ıhé’¶vÒuåM⁄|,fEí_≈h{Y@OíÚ¨±*≥ë"‚nt¨]‘√ıeY‡˛KAzF%†XlÕZ≠l›l•ÊàíûrK˚ÑøÕ∫ÖÕv$√R}‚b¨ÃQEƒÿî*úl°·ˆµãôÿp∫6-A»ŒBmLy;ªù/´vM6Æ*`‹l_Eeì1EA9ºä¶x5kã'[.}>l∫ >≠ãQ8µ6.}.ljåOM1j=újåU´Òj>PRÄBÜU„*… ÷ù*É)Sú Ovêb˜	jÉq(Gõfõù◊JÕm>lìf…5≤ËM€ù°á~8wçº(ÍElÊáÛƒÿMa™Q]…PgU«hßË dnÌ«À@0µCr«æ„«5ˆ^Ìﬁÿßˇò6ïù™µákﬂë√–AöÀU4‰Äz"hÛÛoESŒWπÓD9">‰¯ùDï≥B/ªßπª§’;Ÿ¬‡¡Ák#≠-"ÿƒ\	O¨‰ôi¿Rw¡_¬HG.+bSC=bÍ‹©yúÃjÑ˛¯∆ı`›?«âMó∫—]0–‡W58GpíbÊWj~6L!µú“t6{çw÷3ÿWT”K/‰ﬂÄqºv√iÛcof›Z“Ûmã‹[  `˛‘¸fBG¬â’∑_éo_[k»ß±”vÂL≥Rπ¢√ûÊ–Q5˚eHì+ﬂ®G¥Z<çzDÃâ9=≠ÙNâ~—ª≈Éô?hKßO√–ä&›úGZ%˘09@’5Ù/®”?»˝ uEiKﬁg_$√}g•<öÌg5j˘Q¡µ÷uLofôÀmüe]kk-l“∏º¢˜bÃê4ë>≠|Sò8|0ù¡ÎdÏÃ‡øiä}Í∂à≤aÎÜ≥$?.”§˚9ÿy\i sÓoÔíì˛{€{Á‰9ÌÙÃÏﬂÚdu5ä⁄Óîã⁄JsÛ„µ∂F˙üY2{¯?´¢( ≥Ä¥N+≤ƒ7J‘
4	6MÑè±ìƒsÏßx Sª≥O“Ñ(È3ˆ∑Ø]6TvîöLŒ€°sÌ`Ì6G©·(}-ìŸ†ÿ$è˝q0Ëgcî$c:†Ls|ﬁê·≤=≠Õß´Ñ}íÔaRbÓ&ê_÷´Ü⁄ˇ4Z¬X/ﬁ‹≠ˆ qß#@Ì“µãê…®\W _>˜îŒ ÚÈˆ^~?Z˘9+õqÿÛø∏zÙ>M÷ø§Â	€ïé∞‘}r’?ÈücAåÀ´„Éﬁ—ÒoæäŸÙÉÈÃÚÔüiˆ_˝.gœgJUª◊nå§®'Ä5‡±Œâõ0´?a
Slmú$J#áµJã[XIkâ|kˆ›˙~Ü4ÖWô»∏uC∏i“ñAΩ¶íÕU6gx4dΩ&∫ΩPf}î™ÚrçêÖõê◊ãWRçJ≠8ùP6…wLß^Éî6ÖÏœ? Dıo4Lç[Èè
_ﬁ\Ç-H€çYµJ˛…BË*21ß)6∫™»O≠œ≠;öEÕ®‚Ú‚˛g^Ö'”%WìrkΩ ˘ıÊÜ2Ÿt≠#Xkıx5Q˚ï!ÍU1È≤&LÎÁ©ckü´~4ªÚkôÿÕöWÛôkM4±.l1+ÇhÈK’±ubb!© w≥´ÍkÓQRYÈ©QÈSR
µïîÀ—N©∂C^VØR√¯<ÂØ)|ô‘øfWÖ≤°¥»≈j\&ö·⁄iñ∂πS$≈'≈®(·ÃïÖoÃ¸êNÏx÷Ñ%^ÎtæYaÈƒöRÊÈ;“¡⁄_ı≠¯ZT9Âj[®÷È¸¡P◊Åk›[‰≥µ`ˆy 2î∑õ–®π(∆¨Xp(ˇ8XlÎiH,¿ô«tÊáA/ç]‰˛s!≤äsSÒX˘ yCD‹"77¿Î’)Õ+7€lûíÕlÈ∫öbû¥S”Ñ„â3æüı+Ì⁄{â˜U»Ak6´0s–f±o1©ôCÂ–3—K·;l>¢
»Œ¡ı&ô¿ˇ%.‡i*
±Ãç ^√|†hÜ≠'Ò‘{ÑÂ˝0gË_ñkÍ2„4;szîz‚0Õı•ı´ï&xÂ
jûÇÌÿwµ≥*áKÖKªå∑x•K—ßÕÚ∞ñvU€w ´ÃGH|àOl^Ω6≠âÇ*¯{'ö[Ó≠PZÖõÓ1!ÀÁ
¬"H=nåoq´∫™úäñ?–Îï¬Î¿°äk“¡Ç—d`≈H*á˘∂K©Óï„èQÒ)bè{·<"'ñ∫“xΩêl˙Eù¢=XJ…\T»ôW.f‚é`jßºæM6/:I6ﬂDÊTÆ∑ZŒ4îﬂMÚ£…™|&ÓﬂA9qspy≤v0∑á≠‘¢3&©ë∑ÅπnmiwôhtM⁄ Èú>Oa≥*ÕY$4?lÏ˜⁄‰™~ÿ;ÔaÚ–˜Go˚Cì†”xTûÛ±ÄrÂÃµ(ﬂÿÔÜ«gΩ¡qıh*ÂÇ[∑Ä¬Ñhku•ÔËQu≠T⁄ƒs,ƒ^úHùüˆé……≈˘™wBO…äAÙc˝åŸ,RÖCôl®âB¨ãIl◊oª¬WΩrqŸøpº8Ôù~ô’-»,œ∏æÀ<@¿øã%3wr2é
˘nÚH:ú˘;;Éç˝À´ãøˆO«ÃvœëËb†ëZﬁãl€K¥.ûZ3”"r∞QÎjñr.MIëA>˚‰íbó4ïxÕŸQì}†N6Œ—ÎÚDäT≈÷gåO¬∑5œ–ª‚îzWêµ_Fµy !Gâ#Bk>»\i~b|´ö:@^®wz< <Oöß}`ÜÆ»˚aÔ¨∑≤ûHíãiÂ*ÿ!X8¢˛üçÙò¶Õîd/ÜΩSr“`"ﬂ[t|æLÆH,7ëQn—yÂè√qo–ó˜§˙æwEöÔáÀ\`:(ŸÍrøçÁgáfz‘èÄŸˇÒxûì˛˚Û·{Í≥à{?ËıÜ‰¯ê%˛:Ô◊áÄáèE„v»◊E˜∞˝=Vä!˛ˇ   ˇˇÏΩ€rY≤(ˆÆØ(!⁄-p	RR´ßõ£À@$%A")ÕÃ∂F!YE¢@∫™ 6G√Wø⁄~qúpÑ˝Óp¯sˆÿü‡Ã\˜K]¿ã‘”ßµc˜´÷}Â ï˜¥πõ∂ŒùV!T…1nMµujäoé˘û›ˆÆHLí]ˆòÎÜ°^59µá(H˚"’“kêj“√òë∏ìiQ∂ÜyR96HO≥‡€‡‹˘`ò-Úì8ÿN
Äû„5n+B¨ó=\2ù@cƒ∂˚¶EÑkÉõÿî◊∆7\u €÷9"†”≠çã0üÊPçÁKÉQ◊]‘WÉÎ∂‰¸uÄ‹ù∞k’õΩ7¿©;£ÈY]ﬁvDPéuÁ’ûæ˙›Eg2ﬁÇŒ”Ω≥ﬂ0ï«PLFÚwe8õÂˆÀA≠L∆‰)*≤ÃÉ]ô®v≥$-j¿V¨Èñ°»2ÊS`õbﬁ>‹j)ñL∏FŸ∑∏rìu¿}≈”ëÜSfgAÊ™ÄüÅ†Ωi»U!•–ıÑîæuÿm)vy< c“áΩõˇ
Ø)XÎøy58º1‡Â$ï	Ω2ÚÖcCnêV ß’¢¨˛ÿLYQ?ˇ WâZ}C◊EÀ°›óöe\ùoÇ5M:e⁄1›∞v∑-çˆp(1∏ Ë©ÙIg#¥√^^ãÃÀ%h-3æm1SÒm·Ô⁄pÒM“î&o9•r≠´ñBçπÌ¶@ÂÓ.≈îÚsáÓg◊Çxæ∂¬˛/≠KQoœÏg¡U–,K∆≥EÃÿ:Ê1eÁÖG·[Ù{<ãß≤√&Ü(À¥÷ìXs}dAıÖv˝w»c§PµqC”ΩΩÜ·Ó±Ç°‰ôálµıçW
ë9–qÖÁZ0Û£´œ›˜ù˛ÓngïºXVôÀ»™r+˘Ä±k»kÇ«Ùôe3k™7ßmÁ∫N°Ø±«¶É∫˚πä.%Ωaÿƒ⁄€ öQ5›•^A'¿Aãê^?ú}cKRF+Ñ!…ìñ—-˛Åπú[Q¶zj
ˇ‹(¡¿U3ßÑA4“Ó–≠o4%’ZÿR√=ƒÀ4ŒQù7ÑLñi™{‘u$π )’Üé⁄∏≈◊≥∂°T|˝\È*'"˝„ÍÍb˝˚»iÀEﬁÁÙ∞B•å» |ìΩèpÀ‰ú0πøÛƒ9˛|ïë ddÛ√Ô"‘Eî^RÀ˜˚Q(ûŸ`Dû⁄ì¢é´©òDCjOÓT’êƒ%FIN»ÊoFØ*f'ÄÌÈI=…N2¯`3∞˘™Ôj]ÿØ’◊ "æ”)†Œq¡Ç5D∫å
UˆÚÀZ∏(´3-Û÷%ëªÆI:cz‚”RÃ.≈4ú2•Usx„ráQ≥H˝qôWòﬁ©Ã⁄∂…[€Ä˘0+é™]»‹~yçŒ”Qà&ê”«ÎÂ¯+å˛–˛◊:F>	Ô÷◊ö T9ÀÚ‰+?daΩPÙUf¿5ú…Ÿ–¯Î≈lé€ÕjÂçuΩ’M}\g—Öæ&¿<0πµãÄˇ°Ω•æW°]∫ê⁄ÄË˛<>iAˆã)Áå¥áFõTüºï∑ÔŸîiD4‡ª,o∆rb†»>lv‘Ñ˝ôê ÕXÊöLƒb›ó-„r˝€Y‘¯3mßøh5*e∏?1R Òçl7ÈÎ/èÁ(_§'0˚è∆6QÀﬁ±‘äÙÜ_h)≠∑º∆&»‚ÆkxEeXmûqEê@¡ÚE€¨mÛ:∞∫_l∑i-Õ·ZÍgNˆ&)˘‰UÖ¥ŒW($,…uOªB)∂ƒ±€´ç°◊Ù6{⁄~Có ù&›È˚záu<]ƒÚ¨Ë«çı∫¸I9zÒeèÀæËY{O‚≈Ö£˘'‰dñ;ø€≈»üè‘Î¢à*ù$süT!$o!ScˇpÎå®<-çmZuﬂ Nâ˝˚Ïù»:,V˜%Èò∞JXüÍF§EZ/xí˝ =⁄dBE¸Ìm
UL≤≠ÍªM}ÑÖ(
S¥R¡Ä∫œìE¿µ—<}gµ˜UºÈ~®◊[ë™ Ö †¶M9&©÷,õ ‘◊Ê™Ihyo7îä6ØN¥Ω¨•˘9l˘˛ﬂÃÓ*C´6©»‡>1∆¶u›!Ã|öƒ˘∫x_Ø•;Ûüö9∫k‹∂±FØ]ôP“-ê∫@´v5…ßõº&<√∂ê<˚dœﬂ7äûTK˛÷Ωô$ó÷S2Q*∆eùƒÁ·O@d•¡òâRafJf¿Ñ©Z`÷´£«&j´Q Z≥-Wà∂jjÒeøÄ Û∆•òò(È·m≤Q¥N∞¬…’ÂY◊úƒàØ3C§∆≥l~Õô˚}è„ﬂO∫◊.ù©ârI†-/ŒãöÖy€2LÆAúe{ëç°≥p?˙bX√t±-®Ö'ÑD€/òÑfñ0…üêú—òxÂOJl÷~∏Îàc‰Ωìz`NJàÛ¢˝—û≥æ‹
ln—Îz˚√å:r_—ÂΩö◊◊ ãHÎŒó¬ÙÅïﬂV{{ﬂˇ–÷ú•5Ø¿Â·âYòIDˆm	9áôﬂÙëïﬁ¥ÖÒâ˛o”ôÃ·h–ﬂ]¶1£
9‡r]±‰™^™Ωu‚√ˆ‚∫ñl˘_S,¸o&a®úGÉ∞ÊáÑçoŒ≈ø3Á7 úk˛◊m˘sÎ ∫<s{∏Ù[eŒkpÿÕ±ËöxÍÀ3ÍÓ‡ø	v}Œ!ÜÂ0QÅ— f)r“®¸Œ≠◊w˜;∑˛;∑~€3˘Ôã[◊ÒÓÔ<˚Ô<˚Ô<˚Ô<˚Ô<ª;£ﬂyv∑Óó<{ÕßF´ÄGõ¡ﬂ¬à≠sä!“>®0OÄ”.Ü«˚áÌ"µ›øéÑdÂñƒòáı,,ÉΩ∞Éó!ô‚]±+¡∑¡´0çêj®‹¸j∫]ò2ï
h	aH€§_#e˜X0˜Ù9‡……8…ÎíD¥H—:N>;◊£ÆäÏÁ¸Ïw“hìz∑»ÓPı^¿vVÒû•rX"ﬁΩõ«°uÍ’Î•r®J5ô6Uı‚4™˜÷µ7O@uX#œƒ¶cmÃâ„âûÊ∑æ¸a√'ö±®ñ `k≠M-?ßÒy‡"ki+¡„@÷≠ì˝±@E¸◊ˇ˛ø≤Àz∆/+ÀµsÃØlOàè®%Â¢\ÃÉÓ÷(Ñh•◊L  uÒ_ˇ€ˇc1ãdÑì29Ì5:ç6ƒ∏¶√ËRü{`ﬂI√Ã“È÷ˆÁO∑˚«Õ`´?ÍèÇ√¡˛÷ „„@a´Ñª¿b,ëk◊hè3‡1¬X˙Ä‚8ÂI‰¡	⁄Ù∫Ù@u~^ñjê«¥=èx√7U`.>ñ}ˇ¡Õ≥»˙)≥2únÖ”ì‚±Ë◊lwnfÈDå¢'Íƒﬂ=ÍFO’È-)v~9âcÃÚƒ7Ù”¿πÅûå@ﬁT†Àß6ºJ¯µjä†"–2	ªk”t◊;Ï.Á˛fE3∫£˛·ÀùQ "Ó◊qÙy0O[≈5ow∏W	Uèã˛çéÜÖU’Q‘hÁêV˚3Q#çC°Ñrﬂ|÷n‡3€\]∞ÎVÌ-¬π˘F#›ˆŸz¥éÌµüçÒyn:Ü ÔÜAˇÂÀ˛aø…Àﬂëqo‚4xäA¨ƒ')j¨ƒÜ+!∏øaK<∏8Dè6Ó{≈÷h{Ò4>N∆I∞ßÜƒç“üÖ•tH)ä¯√[Kµ‘j.˝±IP–è"∫Ë¯÷/≤|ˆ2Î.+[‡åufº19Csf]äÄ¡∂ ûßõ–Èh!ùpèüá˘¢ÊÄØëY◊"æª^¢]Ï˙YCàlàMrkÇàÌ∏ò‰…∏g∞ùØÅÕÿºÈlì8≠ñÈ"Å¶ÖYù,ù≤àëò≈¶vv«¶Æå$ó{¿§M71ÄXú£‰,≥(\ÖÇÛ0ÿÉÎòÆÔÊ¿ﬁç0ˆ…Y”¢WLâ⁄ê/ì7ÚÍ¢≥[ÉŸ7‡÷ì2,ÇÓ_ ãïá’vôQ¥¬$Æ¨–ÚZ∞zc5xˇó'ø√aMÀ€Å√aX$~eT˘.M +B6Ω¯˝3ú¨ì≥’`=≠”b5áyÚ[≈%E¥m\:ØLC|» ˛ÉÓ·bûÑ„ØèáÚ‰§M0Hﬂ]†∂◊∫"9ˆ˜èZd∆˛wøøBòî·Ò¬Àh€};gÈ’o2óC—˚Y7*Í+‡í⁄^.ï`Pfì¸Iå˛√Üå÷ˇ˛@⁄Ùπ1 ¨8∂ﬁR&9∫w9Ô“+Ûdç˛ıØ‡.#≈üÑgV∫
ÇpÁe∑x6úh5=	ÁI	f^]AØ∫B.!ﬂÌxDÛÊ?&GØØUdLC€èDƒ/ÆFh≤.ÙËoõ¶ v¥©⁄>Ω]∂Ÿ+-:E‚át”Hªt⁄wœ∞≈ tsk´5ì∆œvöéT±-´Ì«÷ﬁ™>{[vŒêVCÂÀ: 3&æ∑ÙÛ?n¯ÖY?»Pƒ≤™T.Î9¯jÙÃ∂LJGcf∞fn*?ãã~≥@Y¯⁄èè™Z≥lkcbÔìÑI≤j0[}‡+¶QgaÙ≥Sí¢ë¨¸ñ3£ﬂé†ê˚Ùhå‚<b•›œ∂‚ì{ƒTi˙ó1PZ÷åÎ*ÓïÆﬁòØËäQœ[¥∞]Øâˆ˙CçÁE’mkÔ¡–Äem'$N¶®õWRÕ71‹î≈∏ùÑß?√XW
ûÆ”˜á–Y®ËnÑÍπ´ı≥¨£H≥Ç¢~Å¿3ÍSkÆ…x•ﬁ»¥ÖÛ≈„Ê•XAd∆k¢î≠∆‰o!m(ö].§√ŸYX>˛˚%L®∫⁄‹jøÖ,]ë˘åµÙéä|˜¨.•[â≥≥µU±;ÿÚÛl¯üÀãÀäÏ¡
˝8HJ$ã@"È≤Ω˝Ùu◊©y>†s3™†âÃë´1ú∏—q´≥Àh3"£Ä[õë:#6´8J3›ØP8ª<ÿ;ª–S‚æüj?àÏ_Î¥ûﬂ’5≤Ì÷i†≈V=µa^Õ+Àÿ∑√x¬‚‡|&∂-µÙí¡fí3A‰C3cà0MQËJ¯QË19M¨’zÄëû/
ZíÉmõ∑˜«x< √b¸@ƒÌ|¥D‹Œ6)=Ù⁄Ì`∂≈QµqﬂX©∑m∑ıq'∫Ÿt8ˆI√u{|£>∫¥@ÃÃ#‚√2ëî?º’ïcY8–Ô;◊∏
û?ÍÑX∑e\æ˘¢[úeÛ!’ût£kMÉ[ÕW∂Uﬂfﬁ˝ûVE´OΩ_íΩ(3A≈<áqÆ§S˝≤Ñí0=â˜≤(úO]¢GíªbúùW7@ÈùÖWÑ5j
Ã∑Ue£X&giÀÙ∆ägÛ)@E\ÙXò¸.ìÚuƒ=Qüè=àäg=Ä≤È»':Ê¬'æ•lH^KåhÃ¿$eÕ…m™…Ò%X&∂éø&~.‚rm#¯'ΩΩjåÎƒ€¶õ"AYBÄ¥àÚlé&¸π…Û>V«≠\™2	ßO>≤yxíîõ¡∆j@r¯´˜„#S®¶…∆3ÍﬂóıÔõïÎ"(º¯ Èåº ymFx¿ªƒ9vJÒ)m√e∑:8{=7Í“¬Ûczµåk‡≥Q|<~ÿﬁä˜GØ≈gITùs/–&oæ°õDÙèã8Â6yL#ä∏ÔÉcî˜x}¸–ôØ7míóg	‰=ìfCn∫/)˙c;±Ï+=àÕOm5™‡íÎ–J˜4ú±GJ
w*ˆΩãË∆Eßˆ™å«ÒÅΩáNæ6è‰TWQ¨cÁË˛ŒiünÃrÖ„⁄K>>E´»,.égI˘‰3#Qá°$P’\∂ë<z/ƒ≤!ëÇŸ±W‘X•√º∫’ØÁ!Öé√‡Mò_ÑÁaÍ˙˝U*5´y¶Ωdü}D∞	—ﬁg_eOTÁÅˆ¨›*ïVØ◊õ˚T©Pí.Î"ú‚∂n W◊l€”+Uu$^∂A¥4˜Ç¯—◊—^ˇ]wÌõœËˇ„9*GUc,ÄFeÌTÍê∞ŒaÜONG¶Ã¢[—»+åˆ—yu h≈MPI¢˘M«´ù£∂*"ó!>ê¯‹noˇÎ˙_ÇÉdöå·¡».£ß˜‚¡õ∏L&´OPÔ1·Æbì¸Ü◊ü[¿çWÆ˜∏àß–Ã≥N”›’ÍW¡öÔî›æˇÆ jj˙πo&A‰«∑£¡€˝NµÚxÈ´π¸Â¥Øgô/*ÔüyóªWÌn÷ïÓﬁÆ*Ωdù^‹œf1Új—˘iT˛lNßˇd;ù•e»·È£X"B⁄ QsÚÕ(wÂ≠ÈÆ†éTçé√3d¥Åı¬_$@¡ù8g¬ÚGıÌ∞WÛú«?/í<ˆEƒªéœ¯R¶0P|≤(6Qä
4õˆcû'ì_¨?ñyYådÓg¡ª%≤˘—”µ5éÖÂuQ™—µµ«Î¨aûg<%i8Ír9ã)êZ#&ù«†Ù£J‡ôÈA˛“ @ù?çﬂ©P◊÷-¿àƒ⁄*◊:·¶ºœ)¿ ˇı®Jö‰y„‘	T¯´TØÂÒ:{•Ï/~q\eÏPc‚®öS∫√Í∏Åºrï∑}µõ‹R&|î⁄¢‹πÕOú≥l√hh∂õ5∆ÅµFÅÕ∆Ä^—ÉppßÉuÙÈ^gì¨™ÉZ™C†⁄*	†MwT>£W†ÆB;èC´«ˇ5”Ò™bàe)çJÀè™m≠y*_ısÒÄ≈|ıôàp†øôÁB^ÍÔãÅˇºÍâjëÓØÍføè…“=ˇrç‡˚ï\Ô=xî√ÏòÉÜç”xrÂét—ø◊Áî\ÀæÙ˝˚Õ]0o±_=‚à∏ö„c9˜»õoZ§’tìyî´e‰ZUóµ>bUÌ£úæmXˆÍT}MÏ›æ ÔøV˛√›=äΩ†˙Î (÷êÌ8åí|9âÈ’§>’!o|Xˇ Öòt¢éæ"∞¥‡D_·—†Ò#¸OØf5¸3I;OÒøK4Üì§D/M¯ü%öıßÛ∞ÛˇªD£∑¿í>Öˇ¿cøõ/j÷V≈ª˘¥NÀ£|¿»ç®¸Î∏°Ø√2<ã…Õ!˝*ÍÃ†Ã6~ÿÙª‰’ﬁÓ2ô≈oÆÒõπ›¨ˇñœÉ˜Z?‘hû+_lÕÿÔ∑ı ¥,0øÊ∑˚º*∏Ω]x}πoﬁ`ÄﬂÓ∂ n7ûÍ∫ x+7r’^–≥$‹Ê˚RîÒ>ıºæHµPàöAîWŸ"øE ∆Ê´C‰¡a’{Ì4˝¢p©ú;lò¨Ä»
x¨CÄ¶Ñ;bó“;éÿ n„ZxL˝æ”7Ö‘y+Ëª-™Z⁄§÷AücN”LŒKX†ZøÇ¨0©7i·}eìß+=y5yñuFø3ÈækÈÙ@xÅ(œô˙0œïV<÷l‹À¯n∆‘πÜñµgTêôî{F’Î◊>™pÚçôñèÀ≠_ÛâÂicz$eÓ˛ìzÎ†Ma´]r∞„u4#”,IØj9Ã4uÀÚIú7;u}∂¡K÷6Ÿ .ey˚uk„_–öØeœ>+\√‰@KZÂ¬≥ü«≥∫.⁄˝Ê£õ≤√≠vpE]€Ï–cs{åW•“Í∂¬¸ ¯="¶ã¬@)£;¬Âè
∑Ã5œËræñy2)¨õe€Á˙ÒQ›ãaΩÍmp.j¨Xœ◊~∆ˇ˙k[c±ZÒ’Î$““æı˛˜◊±o5⁄)[◊
≥∞ó¯Lv;>”≤Î<ÅÑÖf⁄n2¢	våá Y©∞ibÿ.çœw»t…} ì%l∂R“Ë÷M√mììé»iÉ≈ZÙîV]óˆ“ Ã|Xˇ≤#¨≤∫]‹M⁄Ë˜D∆üV˘|p6Vv¢Ê§d*“¯Ù=”Ûÿ5√Ωß≈(ãr/.ä,Óì".ÇYú“û¿àﬂ|fsÁˆ2pçgÏ!≥º?™öu›E”=Ô¿¿ñ5⁄5Ó,k¬&ª¿Àcá∑(1Ø}∂V£Ö©ˆeíLÉT,√	˝ﬁ«T©ÓπÜ≈g§º˜∞Ây∏)vá´¸|EæÈÜTµ-9´ØõmÕnãù_÷¨°
sØ√u¿0˜ÿ¸V¡∞Ü¯Ú≥Çû5_ê}ü≤˙38A^VÕ⁄pÕ¡ΩâTNrjTÿ;jí^©ëzI√Î…6I2sÍÌ;§ﬁ8!åØ®¢~Ö√Z“Óz,Ê˚ivñ§Øí¢ÃÚãUÑ˜]≠‡Pcã"Fev¸8L/ﬁx⁄}œËΩ˘ Ç]HNì8W=®2ΩáKo} †q@Æ⁄äíöñ»ÏÍ≥™ﬂF+A“‹!c†ù””¯§4›¨Ø4f0f≠Éé˛ ˛∑Ä£8)ßPîS*1Ñr†ÄÄÂåÄV˚Ñ`uëû@Õ28qú‰YQ¨EÒß‰$>%ErúLÅ”§±ÿ‹≈@OåN{Ä4(‰AÁ¨¸H>“Ó|‰’E¸2$≤yëræ(°;E5[áÿ}=|ªﬂõáyÀñí`∫N¬Údtç8Ä8Q§}„<œÚnÁEòL˘*±ó`™oò
¨∆P˛˜r5 0ëÁUÑübö”({%óﬂM$ål“fßg´0;{Q¢ïdTÔ˘–Äëu@ñæÕc`¢ßF
Ó>y®üú‡ŸäTﬂΩEZåì”∞}¢A˜\¬* 4
 ÛTÏà$∑ŸLß	`¬8R≥’∫/¶¬#fØ¸	aMœ©œ‡—ﬂö}Òa¯)8¸©#¡±P∞-<f˜øj`uÎ»Z é„yñóÏ‚E¬xëƒS^¸ã§OOŸÏOa≈”5∑}Û2£s^&;ñBY´?≤–7z££/¡ïUvñ”"
ÍÜ-®®Z©ã"πºüµÊ”.|k©l åâ^LÎΩËÂFáù˛ÓnV”Èoç›°?˚¸«”.}÷«ëŒB‘ªdRΩõ‰Œ)æ7¯ó—
KÄh;MŒ‹vö†é	KPP—KÂ%V">ˆÌ”"‡}0ÀºÉ÷¡Rö¿’ñv/Óá˙ÆÊ¢˛ ©›øí≈)õ[^Ûƒ%` †ÁÏŸX•M´zKxx[ˆ√híÜüí≥n}/Kw·£Ÿz·ejŒ’âXIêQx∆üt˘€8TÜ‘Å¨›òZô#µÙL/∏lº·2RÖg"‚1CxOùùﬁ
ÁÂ?â…Ú;ÂMªΩÖÃSd‚wÀÜo•Ÿ
ÍõÜ''òKú]¿>ˇ—L∏iqm®Âñ˙m7~jL:≠°˜®íúÅÁrÇa%?2˚àŸä`‡Z÷˛Y†—)TÑDLg°S*üÕ∆ZÖ;¬«N bΩ∆?/‚ÇoœÆ^“ºG%‹±•¯[e¢0£Ã›+L≠Nƒèú‚ÊÆBY]'}˚viÛ¬Ú8AÎêÇêëx÷Ù¢„~Ù	áeliÕÕ·ÚEu Dsüãã´J<ó∂îa1aS·_FS,q".Ü˛4⁄Pë€ËÁEV
`ˇ"çe±€¡qˆÛÅN
<Wøõ˜GèY‡g9<ˇ]ÛÑP´◊Z-õÒÇ¶váÒI2O TKY‘‘ñ`R‚—øEMmëûVÕWSÿIé˝ˇ"∫mT£(;Y(»ﬂøåS•ÓQ§r',ÏÎ%Õgyö§!∆Ìö¬v/¡˙xaZÙ•Òª$î˜˛ÉMF'´‹V≈Kå≤˙Ád˝Eô)◊5•ó‘7é‚„R_‘∂˙mnÆ,˜\Œ4Ö'ÏDCM}Ωƒº™⁄äö&≤è-ˆ∑—öïπÌíÙSñ¥6‡?åñº∞ö§Â^d9ZëÑâ˘…ÜñjjgëáÂÎpëVç"£'ı…ù„,LR∏ä˙YÌ9≈FèoNù˜†‹ŸwÃ5ú^ r6ú]Â-£»<„S3£»bÜi–°~€húó{éiúùÔ;◊xhó÷;vXÇqŸ^4ë{ÔÄô
#x÷†ø§zQSs˘ÃÿÃÅ˚°©+¿À·…˜	òÉh&x˜C}WL$˛2”à@Ø*Èπ*4éàQ˘Oªn7rÓ‡`_ÎF›g¿ÂÖÈS•E‰]!%˚)˜Ñ∫˙´UËæõ·¯EF´‡&˜Ás¡+Ö|"´+EK#ŒﬂªZêá@(¿Ú{!~ô∑Çó ;!õü!˜ÄRpAîX6F¬dHà3XñÔ!j„Tywnx~Œπ[I›:[o˜vwF;€ß∂™Nkgw∑∂¢“"LÑb4LõÎvLâñ\ı"Õ„02n˝rP∏x„°˜-∑õ“˛‹M{ÿ	∆ﬁÖ?ì‚~¥`á4‹˙z2ÀŒ √«1êúæ©TùÆ°ÌqÄ¨u0Œ≤â:œ3™œ™3ÈÏKß∏4¸Bo6¿i¸´`òFúÅiLIßH°'√E9ÓYÖ]Ì7ãéq◊JÏˇûùß¿Vèí<û ÿu”S‚Õ÷d≈ˇÉµúá	¸>∆9 ·ëÙ€üÏ#wù’†√ˆy≠†’ÛÑ‡Úyßf†#ÌCèµ∆;.äQ6âS;&í9U}¬%∞°áq!'L“ÌåÀr^lÆØüüüÛﬁ√yRÙ‡Y]œpÛ¨z∞éútíûf∞ ◊^É–«hÀ˛¡lúÂ…?	ä7É£ÁqòS˛‰ ˘_9ŒŒÆ	Ó ü~/õ¯¬@IH’∫ÆŸ4◊û÷ÍÚ<Ï˙óAÿ’òGÍËªç˚æ9¬•§—†zÉ¯ó9AÙÇ!–!)Í}N`ÁsT{¿~NÉr'Pπ¿‰‰£nË4#ï)ÜítmœÄo∑#∆ƒ6k|J˙ÄÅ¥#|€|éÔŒYl ˜Œ_/)´„TÒ≈8Úü„ØoûBÈ5ÕŒ∫xªÒÄÛr1ﬂ∂Ää#ó8Á
pËÙêé—h≥0Ä¿ M@ƒAˆÎ_„∑‘~sz±ìÁÓÕ[uÊi∑Û2<ÉÎ@O-íIX$|w¯éÕ1Vµ‹—MÄR’∑«ËÎ:k_fÂ˙∫Ωg—æ3’ï¯K)VÕ¥T´rÔaâﬂ-ü≠·kå;k{ƒ¨Ïßˆz3SLT∫Ä†ê–û”L¡∏5éO&bÑÛ1{PQ≤é5,Ç,ß†L≈[T´Õ˘Fß¸iG˜–]h1Gâ∞‘ e≈.mÛ¨g÷AÉÀ˚”7?æø¸!ﬁ=ŸˇqÌÂªó;ˇ«ãøøy˘„€?eI¸˝Û7…˛¡¯/«ˇ|˝Æ£GDÿî+ˇX9ˇºìR(2"7à>ÁÚD˘∞Â!Õ£˙SÑ’Éù›éèIÅ€o≈4úÕhc«ä‹;¿VÃ–ÀS&ë°Q°o&Ùû√t5≥GMÊ£|‡˝Å~%Å≠˙”)BÈ(”!∏K+Z5O√|3§:A/s‰Œ⁄GS Æ}0$ƒZπ%|÷æDÒ˘ßïzT£/¶ò’äÈö1ÄíO©´›dÉÙ„ªäd=˚≥W,æMÑh›h§Î◊àö7ﬂ∫Èx£y_3fNk†5™¯¨_Ô ”!C‰Í*√p/∑G$Ê4√ãîáìqBttäk†I™âÿ¯Ä	&µ∏.Âçk˚ÏòPﬂ )Ü6]órhMb4^≥kœSBF‡õ@ÉÆ8˛
û‹K-¬´&‰L ﬁˆá˝∆âg(:Æ}…ÌÁ ¶H»(ç!¡IÖ”º˜ED	π ùë9^ *6@Õ´.ú˚÷¥óÀ'≥˚$Q:ÁÈç‹¢æwóÔlÂ„ªˇ*Ó´˝ˆÚà∏y^{3+æ/y-€]J˜J~ëyc◊±˛2∂ºäµ—æÜ_Á÷_¡€ºÄ™îQê´¡#Úö@ÚÂlL"*u$B∆t§M!&FP%D®Híì*™·y±crËÛ≥A9òüt⁄¡¸bRÊ7A!ÿ-àF0m*¡¸™—	ÊèH ?‘ò"⁄	ÏW)õ-™÷¡ƒT˜:U{LåN≥é-uØ€Ó'ˆÅÁƒ´l/ïænπ¯TŸXj}›∆°¯TŸuøn;åcÜM“¯úl/ª+Ω2ﬂÚåo+@•3ì¥Øºø±‚ÈôTƒn◊JEœêéè6$öøD„C89¿Ö(`6,Iä0œµ&kY
Ïˇ,ãbãZ∑u.Ä•ÔﬁımØCÒ·Å
’n∂;u≤N¿J2Ø˚îŒ_Ò˝∆ágzBDæÿ1Ë≈ﬂír‹ÌHÈ:ÏZ±|ÆÄ∑ÄπôcH≥Œäos*TG]{—÷√Í|∂D[ë‰.ÏL~√’ò>aR◊Ì°aM1=ëN[∏ãoFÕCZnnZˆc∞@¿Ÿ¶0å£…4§ßô%Sc~QùöÔ)˙%†O¥I˙_Ã—ª0úœß\≤>èNuWáK{·˙ÃûáE¸˝wuãc5ú˚Êﬂug—Œ{Îø„'≠!,T{ÙÕÁΩ∞˜Nß<Œ˜·Õ˛P	ûzÜ~°ˇ¸àOÈÂ˙‡’˙ÀAù\!b2≤Qﬁã”µw√{@^HÀÒfpØ√„t∂ÍæCÔï-òo˙3˙™Ì¨Û?·FØ◊,ﬂÄ¬êt5æ>∂µ˚n:…Áÿàulè÷¶k€xiMø"ﬁuCÕ
©YìÚÇiÌ∂¬È©9¶R‰x5ËN&º"–?	’7‚wóa2-<NÆ“Æ^uèŸ´0èN`∑¢ •bHëü xûLÇ¡Ap
Ráœ:Ùæ-XXÎM√˙P˝I–πˇ„Éﬁ˝ÔË›Ôuƒeë◊«s{Óì˜ÆÏÕÊ.N`lÄ@…`H∑≈P†–crÎzƒEBè∏^îD´V# \ØìZhëÌΩ^¬N«,—yËE…ºE9∞õ|sÃ˙∏:¿™}‘êÔ¡z<œŒ—<VØá§6º…≥πÓf‚]µ7ì˙ûÇ,®0≥taagvG3ÿ
1û
≥êÊ“™®…ÓÑá◊°Gàµ÷JZ6˛[h6˝[XﬂHüπpƒ‘Xb}>∆à˛¨5◊ó&¥Ë™;!ÿÂç∂‡ä˚±∫Ú|iÍlöÈ≈pöÃµé¨“K'·9µQlm˙”àRèu?S¯Ï2~P˝¨∂ÌOämËΩTû‚g√˘rßO·´¬NŒ*l6§ÎUñ’å4ñmt≠Âî9ﬂ4ís◊®∫ÿ&¸°ùèÔSÀC
ßa~±^òá$J[ÚWLÏ⁄Axëg”©nBe}ÇûÔp¨⁄“≠
H <˚N5œ¶æQ‰Ó©Ùl:ÿŸﬂÏø§ø∑ﬂÓÔthèœ&∏LÙÇp∂Œ6óÛ¥W‚ΩVîƒ±¢[ˇ«Ên≠ë∫Øó([ 	é˜«Zé¬cΩCYhzé±óå∂Uxn–èP$’Ñø£lÇœ1˝]L‚ü¨>ô˚¿üìx¡#ê¿è<<Fß3ﬁ≥ëÛ9Ω"ªßüÍØ ¶ïû?œÔÿ•5H‹Ë¡⁄Ò}Òıtáh***à|á§•+ÌæÇÎ8Œ⁄ÃK∫¢›Ê∫∏u“⁄¥≤FÛ>˘"€…Ö˙>∂FUÒ√+Ç"SeØÜûdE§ÈR¥ö^¬”≠Ò·æöSH»QgÂ˝∆áUÒ>QPs£ôã?—eÚüúYÙnr®ƒÄ‹¯Ÿf}à–…<≤≥*§¯∂< /+µ"çvD9è˝»÷qYªôC`O∆˛Ìdﬂj¿€=B≥“„¬= ˘}˘^˝◊uäëéå>m‘Ìtãœé¥Ovz_Mt∂Û˜≠ù›è/€tj£˛Û›ùè€;£˛`qíˆŸ˜ñÚóÌ ŒìÃr/‘ø¯]Ô]Œ|Q†4€fÎãIKQ ,÷Òü∏\G¸baG∏ã‘•kÍ>N¢(NYÔ‰˘<‡ˆ˛Ø<<Òœ˚¬GÈX…˘ÿ∆t\è¶R∏ÅWLD±D¯´ ´Ñƒi5ÏÀœ∆¿ÆLƒ<˚9Œ—≠P¢y¸àtn·EóÈ[60¬ƒpc0¡à4hÿñWƒ^Ç5lÃÙß…jÅÙF\9’a∏?q\¬§ó”Ï8úÍè–a<	Á‚°Í:L¢¯8ÃÂ£¥ê˝Óö†™µÁÈåzSù	⁄‚•[nﬁ«√ù7˝∫ä/ÜxYÅ~Nvﬂ∆≥ªoDxv_¸ê5Ç”Ó“®Qè†ÏŒ·Ú÷t,ø.◊)¬CMØÍs3Ç~ë§nYË 0ÿgØ›ª£∫œ˚€_ˆî≤¯I˚¯û1|`ó÷L3 N$—∂Õ˛ÆØ=∫òÀ⁄¯∑πÑ·¡6Á∑Ù?œ˚C∂Ü·bé
¡8¬U®∆Z–ﬁs1çÂtÜZA]T^çPá—êJZ¥‹I#£¸ÆïO‰3Mû¡~4‘á'É	ˆbd5¥’‘Ö≤±V÷‘z°|;GÍwC+Ó/g¥‘ Z˜g®óﬁZe6ìÕı¬öˆ¿∑H«Ÿ√∞…gjˇ•ºï·œ˙∫ÔRÓx»˛6k/†ƒnqê'úD?‰?ÍGPóêˇ®CÄO ≈˜-Á∫ßÿ#‰y/ÑØåb¯`Ñox⁄˝lº¬R
&*d∞Øó¥à÷†ı¿≈C˚zI´x/„Ï$ãîxI˛n†S≤OPáSKåH—KñÒZg]ç23z≈û]⁄b5V ïÑƒÀC˚ÏlcÍ qnÚ)éLvË˚‚€K$E–?cyP’3∑;å√Ç„ï]˘≥Õ˙all∞ùÑ”ÏLNG5¯,á…Ù‚P≥≠ò^ÀÍÉ/§ñ#ù*_•C£»#À:8|˚zgãΩJ;?ÿŸ≤P=€¿ù¸gßNvËûπ'$ì˝—9oˇ~2b‹'ŸÛ}iŸ+W&∞ôå≥2”√éh≈uóà1ÀgLÌ∑Û¥¥í
]¡ØRüûnÔ??±Ëñå≠¯i1õÜ„M ÿ/π¥†Ã2‘πΩÔtxA»4yIlîb8Ú]ÑXüqö0ﬁ>¯îMåië]¢åçKﬁã¢8,«hR&
Ê∏-≤¬•â…‡)Ñ˝ÀÚ[È~h“`∞ª£¨A¯UGôÙw…üNDéjÅ0Üﬁ–˙Ë´ﬂnàéjÂÅXπFÌÃ2ü`y §ò˝O 6Ë¿Ëﬂ4xW∞?5ÁwFPÊhò'‰ŒSS≤âJ†–sîJH“eÀ*4ˆS±ê&Z}˘8F·øå˘ã“Ípb`[+†ï{≥€¯@ã±ù¿[vyâé&ƒ˝–J∏)öÈ2MQÊ›Ω]‘Z?¢ô™œEçÍ<^óG·Ù¢}iÍl0C|ÊÌÕ˜©æ;f≥Ü£¯óRE¢ï÷–çf‚Â{aóöúoƒt	Òqâåò(´Ïúqín˜¨‹íóqõ%ÓØAëú˛Í¸)‡6⁄JpoÅhàZ~Ótl|{Êä«£S·/ú˝£S¨ì‚ù◊zIıü««'·Ï0>e5‡è«£"	™≤Í	Ö+ãY(%Àºƒı%‚÷à3XÈ0G[q9ípÔ~Ü©!sÉGHH∑»`è7´
B 'îÕÊhAÒ¡òmá(`≤õ’‡ªç˛üçﬁ˜¶Ié™´˙4kôÊñÈOK˚à-ﬁ7öD∆>	œ|‰Nq˚ÇÔ7
Ï≤<9Pù‚Üùh=ü¢≠H˚©ﬂˇEì#yFÆLVSHk∏oË˝‰y MQèMz2)¢&>úe¿£ft{PÀ%™;uÜ–v0«Ìˇâ6†Ú;P˘]Ö0ùı8L¢'‰àπöÆuÏ{öù{$∫‚Îâ5¸ûù„Â ⁄ÕÆ≥_î±VkèÿıP4,—ÁÔËõœ‘qØÃ§0wF$5Í>XEM— ÂÊ7üyœµ’é§9ÿ^∆\<≈Ò›ç6mk¡∆èõ"€9Ef+É¸-á≈"û>	†>:¡i—Õﬂo•~ß∞3?@≤® h+’êŸ•Ô&3ÿ;¬-Õ≤T[Ã˝ÔŸbH…&#®›ˇﬁª§õZﬁô⁄%QÖã,´SX‹aå-åì- "â‚‡ZfÁ-fP7ÆaQ)ΩáŸ]∑¿TY âõ¢SD5≥_]Y{5¯~C∫é0übÑ}¡˜VWNhû#≤—=çâËÃCiÑœ¥Bb˙±ÿäì-K|z7‹Y|'ÓVúÂø˛≈+ºÔÛiXå—çâ<°Òè<>KäÙ∏5ƒ⁄”´üs Ô⁄˘†øég~Ÿ¸7TÆnv.·& .ÔìäÂ3l◊eô¨^e6_{∞L„”rÌª ^®1˛Ô?1Ç˛∆á´fÁÇˇBß´Z.≠VI∫å\K•Í™ ‘ı˘hé´‚â˛2’rÒå
˛Wﬂﬂ|÷∫‘˛•A,ËhπÍd¢YrﬂÕ∑ªIMBd™¥Ï∑U˝ÚH-ÃŒfÙ™Ø˘|Ì˛É`åˇ+–&ÁT1Ü7d≤∂aØºzÌÓÍçNñQÔÅ/±π+ı±ZN7˙n9â|û«”È!ﬁñn·¡wó˙m‡ π∆|ﬁ:fﬁ7ïü'Qõì ÂÒ¯ëµH˝ê*“≤T§¨ ÕgÖû,≠ãñ√∞ÉHÖls∞»‹7≈Aú6;À¿ÏõTæ,:uÀ~≥Ñ’≥À«Î„G÷≤ÁNˆ#'âïŒî¥Øïàzú3ükAo∏à¬q0&§‡ßp∆®ò^ö˛¡t1Y∆©Äps∞HK¯Ôòlƒ\wΩ0ËÙIƒÖ
—ˇrûLì1ÃöÚ)KΩ‡#0tﬂs∂g^Hû‹)©LôﬂïïÄÏ.QÖ4Ö˝#√ÆÀü(ßrKÇ˝´LØÖ»˜°ëü∆L£bfYπ1¥≥fY}ÙÅˇ;?D d„“∆vBñ•”ØY^>ÁB9˙”îî á@\Ÿ<OÄ◊*/òÕ%â<PjBﬂWºOÒ¡àN◊¨X<è'ˆàã¨"˘9˜vÖxﬂ|:¢”°≠ ùùÇ£¯¿N]òêâ›≥˙7ÈÜ>–ÓôπD∞1«YòGˆı®à”§⁄è≥YÏ42~πy˝âW÷ß\à†◊ø„˛•f¿àTEÍØı¥xm|πïàÅ¡K£S≥V:&Bæ\ˇñ¸6˜dQ&:‘1Aï–!uÎf¿˘Ó0ç¶ÒªyƒÏµ)V¨Z∏†‚s”ÂHûJ”Ûß5Ú”/Jø⁄“Ë}dπ|ãœJ≈ç°†ÀøyCï;≤0¢Òwµ.dÁﬁÃ/û´∑jÁy—;[—lg•Èm†#Ó∆0¬æ–l-¡d¥jñûlñ6±†7Á]ûI≠√.@ò'B-ƒÊ^ 
èW§ßìö)ádÙ…„ £	ˆ≤‹ƒkö`OÄÃÇ/SìÌej[·] K-Pf«aæH0≤ 4◊b∏ÒyêQvÄ%	?óW˜”_{cmp2ûøwÇÅÚ°dÃ"Ü\Ñ‹}$ﬂ0ÛÊŸ8ú/ä`∏≥˜ÆO™É7‹‰>àxŒÍ‡’¢ƒ‹x	˚ﬂ">	Û0Ä5Õ¬4Nü˝#¡xD‚ mO ¸çÁ@F	ÍAßÈÆõDø/›·ê‡UeËûì~©}É–›ºï‰v?ç·Ùdòi0Æ|Ö€™¢j±O∂≤)™æ ÁË'v uƒ(’Ï
œÏTÙkÀÖ" bÖ€√F4kÖAú!WÍD=*\á≥v‘óxóçñX∑‚¢z…¢œÎØYÆyπ¨7ÕUVIR:{
¯1jû¸ﬂZPØySvê˘®ÀçºΩ–ê˘"ÙE‘
∫Çq"ÏõàÿpR$¡Dç2f£Ã˘›Çz›¨$-1b"Ãû†5ˆ™∫r6ñﬁJMS]é6´VÒÖ∆aë¿:∂c2B∏(L.π!qŸjB'Yÿî4Våê ˘?[ıl+L⁄.ô©Á|ÿX;ç†s±m…Y
Œi:Uÿ£IÈ ?z:¿√Ã!]apòﬂalMèY∏Ó†ë¡„W£Ω] ¥3•(5O›»Àåzë…BÒwÒ¨«ç∂˘kÄÖñÀ±∏áõ∆C,[aVÙ∆nMë ªÛ8¿/0XiéLÛ¡ˆÁu{¢êº“uZ∏›®su¨Ô†}!‹I‡IzpH]m ¯ªó•÷·âXúåÕiàxEj¬OER1ÜxaZC:&V¡	˙<Êë&ªcv
OB Êûk{≠OÎò¬∏÷"!3Û_Ì¨ºøˇ¡ôêj—8) P"Õs6œ&3á?‚¿
_ΩŒìı3î$Îƒå≠\Æ…Gœâ6ãÀqÜû^oá#+£∫
dm1_î	ÉÏ†uA«
OÚSëŸ©Ÿ/Õü«Yt±i”∆ˆxH€Ñl‘ñ⁄Ò«f¿?çòÂΩ¥´–à:∂µÑ9I#5˝Â üÓxÄçˆ‹sõ
°Q¥Ÿêß"õ†§kq©Hsõ°Ù'ha¬Le‡Gc.áw$LÊ(úIßÍ6≥m¶˘Ú∑ó„‘1›6∏Î] èzÙj4:`=›ïéÄﬂ|ñ˚≈ä.èöÓÎˆ5¿úªÁâÊû”1jM0x~?œ√ã^R–ˇv’«TJ™üzpß'íßsπ˚~£g®+c§`,Çà˝˘"edGÄîêË+]î	íE¸q!<P1u#®°fLqJh¶d´`äk6Íˆ©uÆÚzå~}ÜI]OœF£öˆ!BõXE·?˘T·&=ƒ’v2…“OH8ﬁUÖHÆ¿é√VO ¶ú3ºîí'åñÅÔ^`íi'ıL˜®Ü˘ô‘gÁRV«ò>Ë◊I@Ÿ÷Y∏¿s†ë3úLìIpoo1ìÄ∆ª¸«ÃfRê(¸8N√ºwd°"˘∑†ì4çÛOîMó˘ÜÌ‚§C0¿V*˙àËƒ>jì†µµG±¢]»∑_a&]bêb4v® …îà"ì–¿ˇÈ¯$º;‹%¢li*Zﬂñ∑ãRﬂãÇ6w#Æÿ∫öﬁ=®[´üÊe†»/Ã€º^n·òˆ‡&Œ∫+-zM.@ 8…'$Ê ÄEÇÀ4>Næ«ãÈ¢gÛ5’Ù¨œbÚöRã
˙’˜XVnõ)B‰Ã>¥ıΩ+ÄxÁõ¡{ˆ◊I8+ºÈîÇ>q)”8‚	ƒ8:ˇ.Öê1vΩHK÷-o√˘»ã˛o√I2üãoÆu◊(Ü‡;`K!÷‚¶l¡˛z·åÂ˜Å™®ßÇ⁄qƒbº„W<ÿ∂d3{]?ÖSÙŒ∆eŒ˘Tï§Ä1Yp7¿ª$GúcÄ‡õ∆=¬…˜p‘{Aw∞ø˛ˆ›h≈yPÂ_Æ"bâe©_∞ªex‚	*x•µÚ«®i•´rôØﬁç˙˚/◊Ùø+´l¥I›´ﬁE\p≈±iîRÄñ∆B~±Uíﬂ R=!‹âê√ò	A#W)≥»äzI1àˆëõâﬂ˙zpø«≠üé/Ç¡ˆ:Û%l£ÑúÚƒ07ì”ÛL1(P7‡WÃ›‘• ;∞÷$oπ∫¬=(à∫›\E9ŒÖ4^n ∆ïó{f|2œ¬ßs&†°ãõ€⁄&sX{WÙT˙ÇàÇc}–ßAö¡ô¢∫ùìÈa•ÑRˇ‡ÅûpÊ˘¬(àåıå1))>Ë£lq<ç	VÁ~∑nﬁ_Ê¯-ÊäáªÃ9Y°Òx°Ü]VÙ4kÏ_ŒP÷Wà∆Sã¥.≤˝Ú’“"“™ ™–hp”`˘Â˜Ñ˘?k+Âû∫vTııBﬂ,ír™O÷Ï`≈ïÄ˚p¸c®q¿”bO9ˆ7 ªÆ•π(TÑ/«ÿL~AÑ9ÀÜah:IF[ÃzCey’iOÅp∏KºÁ‚b>	ﬁ£sbo_tL+=≤OÌBÅk[Éì~ﬂI"¥·Ëáôz‚‚Ë˘˛íAÒ«<º ?h¸õ+S˚•nÛ	…luﬁëäCnæmÓÿ{h˚Åˇé+`•∆Qπí!m<ˆHgQ∞jQ«í)RÏ¯ìı§ÚÙ›5•Bf:cÃÜˇ%ßß7∆qß¸X J„fJì(÷9â∏˝È*(—Ω¯ÊÓ¡´bù<Í»Qo’18æ*xÓ$áh:Ó'	˛ÿù‚üÇ5#È3äCJ¸3`±.ï&E0 ´|Æ˙ñ8í:ùj∑¡¡ï&2à> {pÚ‚≈d'/J˛»RÏÙy|í¿ÌF¯!§Oc@
B≠˛¢äw∂‚m’¶_Õï”oÅﬂ"Pü'lb"÷4õ£ñ¶ä3;»^–è"®—≥U≥UT*I$°“«o>+hπ¸h†ˆƒŒ•ÿ”G≤CÕ\™ ^ÄØ4ÃF’s4∫Ê7|<qÆ|ƒ”ïÈÍ.Uù‡I-‹∑Q¢ËÍeO+'úıL˘˚ÿﬂ(¯6sîÙõ¸'ú,u	µëVÙ‘8j¿ó&K_,f3Ë…‚£ëHäãf+yV æM®îi}íÏqòYàRVE~È/·õ∞|ëﬂ¯ç¬o”¯<∆n¯=Ÿ≠úÑeOB·}/ºJ¸#6ó‡˘b:a™ÏV2–7∫‘“Û_5i˙Õ-„≈7™õ?“ƒø‚⁄KxkW◊ÿº=ß˘Œ…=¬Ìö#‹ÊG(eºó∫§–ï≤K}n{Ÿ&?`ØÂÕôòêÆÈ,ò^ÄâIqAíµâW≤JõE©ªYm«ß·bZ„8)äØoñ òXí7QÔ®Õ†—9lR˜ı"MÇæ_yˆèÙîJzB;K≤¸¬ÏúLæCVn,Ç¢Õiò§XƒÀœ¬„Ez∂%ÄFèCLN‘´6˚≤RVŸ¿°â‹›Ü®π>ÌCµú±à1’Ä…;€Œ¬P[>„∆€=ÿﬂ∫Ê€]kvÍ1K¨‘çfp{…∫4©©Î}ƒÓzû§ä≠‹V‹vÎ]‹ﬁy>∫Õm4Ì–æÏJ8Ùlaù≈b‰à˝6_çnG{ö“ˆÑ°n⁄ì}m≤äÊv)§Ì´º¸(g.ø ß„f–·bÇ¯\W3„TÔ¥˜¡òüœÚU≥ÉSòÀ~˚⁄øm‚<n˚q≥ÌÀæZd*áyTn⁄xyogˇÂ´˛¡ª!7^6l	ÇÓALd)R•ÕÒtÊ¯„MX£i¿AXñÊAX!ΩA‘ “Ÿ≤uföD‘Yz&¥âÙé2è±I-∏NºåÛ"FÜé%gÀaF“xB®E'Î	∫Pø≤«êY;ö72Í’?Òo(°£Ñ˜ˆSc0øÎÍ@€]B‡≥∫f;¢Ω∆f¸€\:‘ÓBì1∂ºCW}ü£f„KËûOÓ“BxÎ 7+òF1∑˝@Y∏„Æ5eˇe~Æ~•ÿ&XhÃ√≠1ïÍI˝#]´› áÑ°XΩ¶-ï’èñ~2+∆Q"å£ﬁ¶—∏±#Mo®„‘‘˛Vﬁ^
“üœ∑≈£‘˙—=ÿ9ÏøÏè˙˚¡õ√¡h0‹d/ñ|Ñ€–Óª√wØÿ!_(áå[(L∆BÎ‰8mÉb–ùÜ®ïÅ˜òÁY&¸Å>Å7q∂P(Œ®8^πãØo5;”ü%N/ß(Ã}∂¨Îë˝î‚cG~ŒCxGÄ(≥çaH∫e€?·ImTQP	b=Z®*âgUâJ}´ Ã‘µ™\Ov´JçÏ∏Z«˙P˚˝≥»2ßïg?tßÒáA+J≥29ÂV”Z±˚Ñ >Ù'EN)M)ÜÇΩ¨ib$,j≥V2S!›^UÃaUà1&}Gy–)≠ôJßˆ∑ƒ0∞™†Y™©‡ÉáÇ‚‡>†Ò"T‹∑[⁄Xeßò“nø˚A‘öå#ôçMEX˛ÛS¯ØÅí–$◊6A“Óò≠q©  Ôè∆føG>ﬂDN®3)&eìª<≤#µ˘Ëπ‚T…ç7à9âÁ•fÆsv∆“¯í«+>O'y¬TÀƒÿØSË±u`LÊΩæ„;ZÆ}ƒÅv—ô∂ë»¸ãu¡ã:⁄≠Ï–›9TÜIo˛&éÁ‰/cú∆¬„É˚åk£¨äæhlV‡‘ÄZQu˛,¸è˜¿ì4kj3ç)Bºæ?Ößy¯Á3¸$⁄U7£¯ÛYrV6◊Á§™õ–©˝¿ÀA€√‚ÄÈªhﬂó&∫[xà/‹ÀR}U<π⁄[Ö,l∫"\éÏ<èáC)–4˛&≤óe¯ƒ´`–ˇÀ¶‰1·Hs3r
ËÎˇs8⁄Ÿ”h9ï…/hc'PM≠ô»î⁄9‹Óå>nΩ›;ÿ›ÌËD"œ≠⁄¨!eV’£CùLòÍK¢® íª¯G?R õYj4A√˜4≠î7óßFö4˝Ûù√W˝·`w3xÓûëkQ≤¶MDi„c¿#‰u‡üôFÓA{FÓ5±L∆˚ˇ	p ∏TEôÂqF„VŸy|
ÖEáÂ5[Hz5Aw∑©¢%{>Œ°∆k_¿∂–e´≤öJˇ˝¢ºqÛAw^“u(}ë’è ÍeOÓ£≠?H‚∫æ¢hRªc˘%∆=nÂ¿5EVT>≤€9M£w)ÿ«@Ò‹ÌÃx\o6ÍúYæQõÒõZpà√ò•¬…≠+LaqË†( ZÜKYö{≤6K“"∏˜Á{´A&Ã!»`ÉÚ†-,ﬁZ∫¢s§ÄÛ‘°¨ÏÌ0l≠ïP“Ïsë[ó\≈N]j≠WKeÔàoøçòò·|.¬ñíÌ	¿{◊Èìk0e=IA®ÊùX‡%ù±cæöUüÒMíÔë„-Œ£Ì*jıg˜ÈCmÛ«±Ìh2™jÂÄæÁñ˜…Ï∫å’Èoö8Ÿ™9Œ¡≤öXÒ˛Éá≤ﬁ•
˛È.–;`â‡å)*◊kÄâgLùË®ÜÉlxVEaµ6%X9ı‘ö ˛x,)Ö&≈õ3~SÆ®zí+Ó—”rG€ùª¥ X≤ÛÁŒäÔXéæ˘Ãj>O‚Ó˙?ä?¨ü≠"¢ª¥Ww‰ê5ƒ≈JYñÌ'ˆ0µîkEeÔˆ6T˜S∂Kì¬Ìà‡ZÚ∑¢‚Ö0S‘(§yò/äíΩ#‚ˆŸ\Äâ…ı FX∫í '‘+∏œF~a=çÃ⁄ü¿KÂ∏üüGﬁ¸ˆ¯è[—2“ÂÉÙoI9¶˙i$∫n∏(«´Å÷=u´Ûàö%≠Õòõ´êÏõò~7ÊÍW¿Ô(I1S˚0Ê‡Á:L2;k‰çÒö|Ø)X¯*MŒdF·√Yt0›Úë°ﬁ=v¿ÚÊ£/ ¶∏Ì¿Ò*Lê‰Eπäº©.Kc”∆íY…6Ê‡ù”,ô@5¨ZπΩw ü±ØÆ›,˛c}#&Æ˚.∞u]ù™ètUç?8eõı◊œ”G’Í[≠?PÉT/0pﬂ≠∆ä’5j7ƒ∑%∏)÷+Òƒ|'º¡æGfUqÎ´„
{Ø˜-õ-ÛyÆ/ÂóäÚçFß/¸ßâb ç†0∆∏Æ`çû3ôãâ'*,ë˝Ç √„2ÀÇ∫≠ÒÎ[†Aizèì¬h8~ ÄªÜ1ãòΩ&•”/·?®F‚î†l\√◊ƒÄÓÁq8±vˇµ≈ôÁÆQqÄ¯∫û√Ì∞WC»)Œ·Àıö¥åD§,û”◊ägÊ(
Aï…VxnÿÎ©ñ±·Bw@aLè,Ï9zˇe˜(BÃÈ›p‹U= Öy (πÎBâ	UÇˇÿf≥˘o†t∞Í≈Z‚,Ë<$?…è‰tÅ,3>È„<Kìä]√˝ä”®ex' O∂ò[NÏNîã^ |Qîsöá\* 
TWﬁù≤KH,·:¯‡?~;*ñ‰=÷ıˇÄå…r¶≈#N1äÀ¨€Ω‹1?ô7æ1Gw,È”Ö˛93Œﬂ#,yè<30îÌ‚*|æ8éÈ£èÓΩ«<p¯U,«°‚øüya#’Ì€ó*`oB4ïœπóÄ˜Cf„Ï$˝Êt^0ø9¶&`˚Ñ!±˘<µ‡Üc∆íCmÊÈ‘øñYä:0:Á^îÂ!í9ô€œé!˜˘µh¶ào€Q|¡"∞ö`”√ü¶c˜b≈jì»5ôÕ‚(	…Àê ß8ON/‹£Wõga‡ÌÍzÑÃ‹–Ù¨≤`Å“Ë3ú™Óí"ò%E
AÙ ‚±¶Y	Oí…6Ò~Aó Â8<Üâ3ÖÈ¨yWvŒ45º[
Ω#»kΩ]Xq§‹–CìE î˝<™(⁄—¢W™/–ñ<aÚ{3\ã±œ1	:ãŒ¥∆:,ÜçØH+Ìä‚^RKÄ˝KVÊqûx¨b>N«rÎµ˜G~∫ﬁF‡≠ÌZG(•èí4K√Iôú÷mùéò*∑q'- §’¿9…Ä8)4§t'2nÅ†rjä‡∞˝Päãé«‹9a]\ƒ•u)òVıù∫Ä∏Ì⁄§y`Òeïú*≈•0–ãNØjch\Ïfù‘‰ô°6mXSâ?7%OaOÜ…˛6	Î⁄Q∏È ”%¯dí5XﬁdÄ0ÑîØﬁÚ\(ı-‰•¡ª2úÖ˛jõÌƒV#föêmÇ◊ÿ®™Íf£ ≠ç`Æ¢s6≤ººUW€‰’ú£:>MíÒœùï˜Ï 1l1ﬁ«|-îœ}K-Q—Ñ„Xô)Ûÿ+⁄ªÄ9ÿ¯Ì>Í˚l5`ä⁄u…ûX◊≤gãiƒ∆I€ØÀì,Ÿ©âQ’€aiﬂª≠·˘ôB¿4ÌªJ°a’\öΩ=À€ÎŸx™sÒ∂˛"Û\∆ñ˘,0‡‰>ÒåèmºÌr˛Ö—RRÚ°§•wm–—UDb-P—uQk4t´H®
™@@Ã†´êò{‘F@˙AT|Dò√-ÅÌ™qùd≈Î¯*Ü≥(hÇ∏ñœz≤7‹K¡á–*É§¨Î	îà"XVÌOˆÌ∂∂™_<	3cÏj]:¢íh"iL«8A{ãã ì¬/Y3°√; ^±ZöæNIz,÷‚êõkË2(
R•˙5sP®ÈkìΩr
≠7kb*D›X;j	í™äd50≤Í™!„Ku∂ó’¿ª:je|©jxGt¿ôÏ∞RÒ√û||ÿÖÓπº  ‚%ªƒn"e-ıÄ±Ÿ,$„DmSêxá#"AZÆ∆Ã¸>ã‚Ç(˙éwÄ“"$‡t`˙≥„‰lë-¥–;Bø∫ü„‚yT^˝V…í ÷ÄmX£ÄBñı^e´$%ˇÌµ…πw¨óŸ•W¨È5%‚…mgsí‚Ú]πOL%9}è¸â5ƒQΩ˙HÀìz“˜ ª1§+1¶%<jñv∏µ	Ë∏ÿ¬f∞ñ"t+<é˛0uÆr>ŒR¥Q€¯·˛Éáﬂ=˙˛è?¸∏·VjÛ∏6p®·' Å¸˙Á7.Ày±πæû¿k…˙Ïùú¨)Ú,ôù=˘˛á<Œ˙°˝Xy¿ıÔ?p6X#L™£9}a≤Ãäµ$Ÿ#oΩÉBíœ»˙∂Ä∆lﬁÜr¿7D=C∑&ÜÙVÚU∑≥Ü¥êYAPEdAe?µàª&EÉΩ*€AFP-ô^ûÈxÖSåV}¡˝0~U0ã√¥†˜M*N1ó»GTÄ…Gû±ühiçè¥;#y:ñ»∫^ê-\~s∏≥Ω≥?Ùw?æ˝€˛Œ·«—`ªˇÊ„∞ø◊ˇ∏=¯¯ºøıfg€U™ÿz÷±§9(£ıà p[Äñ8C‡Ä”Å¢=9uß∫o÷≥∂YıÜ˛ÓTÓËL[Èz?K¶!g‰≥f◊ç§Ôhg@g(¢à”Y¥›WÌåòΩµ∂∏Œ˝∑ˇÛˇ˝øˇÁ‡ ≠◊GÉ˛~@]m $õ4EíN ¬Ñˇ>r‚IèÃ◊≤ÍgˆÈÄπN≤„P3 ÁÌÄ,(í cÙoÅd«"Œ»XúG•¢4F7ı¯8Ö¶”x,Èd6€›w√¡¶#d/úÕÜdπ_œ)}ü¬LÇ{ªò;Á.aàﬁ„·f1≥0g≥0Å\ÿ+áe"˚n∆R¶ÀM¥3‹–Ï<ééb/.±DâÆKÖ˝q<]Ã`;ÑrF$€∞≈a*`¬ˆCØYÜ«ÍﬂX0I¬9Oa„Œ“5åÔ@È\Æ¥Jü°I›
ˇøˇ„ø˝_AˇÕpglûÔæ}38ƒ†;˚£˛a?Ëé≤,ÿCC·EπÇíÀ‘“b`˘p∫∏Î&d∏Ö	πL0ä–¡P%<‘åg¯åˆÈU7ÏÇw˚£woÇ7;pkˆ¸˚oﬁ¡ˆ∑˚¨÷^ƒ\0z∑ˇÚÂ;†÷Ó?¬xÉºöÏH»≥ÅπˇÑÃo_„	e'õgS^	&OÅ∑S˙_äRq<Õ&	⁄Ù”e*‚3ÄJÏó®Èd‰GÔ’oﬁ˙Ùé¨)n≤©æá”„ÍAa∞ÕÆß∫ã˘~‹•móq¡D#â ù≈“^\n≈§π6ﬂô®¢Œ_cú'ÃW©ÆÈ?±É≥÷#v£	—“DÂ‰≈ÔÏI<ë.8⁄–ü/‹Ñû0o≈zqÓTz•K‚sIÁ)à∏·Pp¿Mãôwˆƒû≥Ôt[Ë&Ä©	ß2Ã9ëœ¬&?>GeEnÂFs∏±‚ºiÚÑπM0Î¬tí˚—ŸıÕDzM¡›ÇWakKq3∞$ÈqˆK–•ú+îå•òá≥_^O®˙◊ùy•U‰.ΩVEó)äTÜ¥jy;Ö2¬Î]&KAÆUÅvêm@ﬁQ>X>@\QxZbñÑ„4ˇ5≠^ÊÂx¿ú‚oƒ'Crô	Â§„?ª±∞µë’9fé√ÑÄ4 Àhπv°ª√¡·Î5#Œrà¡;‹Ÿèz∞3÷-‹˚úÇÀä9°±I∑#ø¿Å[˘Î∏™*9Ò4£“™&ºœ
£*ìÛ`Í,”ØLÙ+«_±m’ö¶!àV÷ˆôü‡f†éR ú2 `Ú*sUX¶/J‘ùÚ‘v}QÓm¬‘dvµ?°·çbå+≥q»÷SM´¥ÖØ5z=xZp m1òñ|3LËk√ã}-DB4åŸËTŸ#t”õA◊Çë§û˙#LÜœ—^%ãô÷<;É;}KqáîMº4Oﬂw)S¢ƒ ÇTÇñU¿ÜÌ^‰»â®~∞⁄ ÕöZŒ{œ¥Oæ}£õ¡{)E;ÔPÃ_Ω∆⁄ö…;w¿CbÿÂ!äXdYé81eÒ…„‰Sx<uõleË“±°ÌÚi¢H¬©äé…Ù¬‰î+ÇŒá„TéFªk@ﬁé÷åÿå	Å¬/0Gy•WfÉ·[»~EéGé‡á∑⁄a^¯iåAóyÛPWÉmt0∆Ÿ •Û`-ΩƒphI∫¿ëeëïGI÷J'rzMëM‡„?†}c˙öÓ¢á…@% ç%«≥è—ì‹ÆLv”S¬H¡˘À}XP^Ÿ8Ú:Çäìqå.ÎF!œC ÔˆL+ø¨$Ü*ƒÇ*L√T¯GëF5·øﬂæﬁŸ“e‰ù≠√ùæ·nè·'i[Êl«0&1í≠j(:,mñ
¨†lEwH{EÔ:@J¡µp1ºéÊ¨ÒûE#X‡ƒ–oÉkg°zûƒEó˜“Wù¨ÿ!J˘`5ø]l8M≈ƒ^¨çœhD 8æˆ•˚2ÉzΩûÏ¢Á©‡¸˛É%ë6m‚åT±¬XÖ⁄RÚ.ÁÌ aÔ’`†œó+¶ÿWØ>â>`ÆZ¯ªN)œÃí¸ÍÅ£ïwlh®“…;Ò`òSøNÓe¿‡øh∞“"Á„ÄH˜≥7{_˘UÃl˚b3„€púùè2†~ıÿU‚T™Çö	íáÕ8rÿáJæÅá¯‡{‰è[j≈=ìWˆßx"i|õ¥∆M@ö¶1∞ïÈvx¡sÃuÒ`q{º7â{„üeíîŒZG'π—î|Du≈ˇ%≈~∏OÂ*6ˇJuwtô:{0ï≥:Ç—ä˝1ãˇ:èÈ”õpñPnó◊‡ÿ©Nx\.:¸Ó!∞œ˜b|XxwÖæªlZpcÎÀà`◊d?XY÷È(€#Z«‚Ö%ærQ?ná⁄∂'â3Íâ∂,8sÃﬁÕÍÍ"dãŒØ´3î´´øÕF+¥’˜¢u£‚±Ñ<E∏∏-sÅS6k[{
ÅÚ/úd¥™È§£|#M…Ç€¥Ÿ‹£ùΩÉ
‚JE¬âu∫∏˛àºyÊÄwÉ_π∫"Ω±¡èc`Í√¥æÁCﬁ@ˆÏÜsñµ@íŒDVüã™w¡≈ˇ∞ú®¬)º
£D9˜!9H´ö±Ø‘l„áÕç£Ÿ€EY◊>S√˚‘fü0ª·,~‰(ÃñÛo˛^å∫ƒI⁄õìì˛vÙëk—ÁÀÉÒ;••'ÒZ«q≈ı_^…	∂è˝—hgªøøµÛ±øΩ7ÿÔXµ˚e5%_Miï%[œEzﬂ~T}≥b“5Q
zl≈∫>W›[ØQ5t-˙b<¢.Ã ˝;Ô∂M⁄ñQ∑"—ÜàÖ	d¨3∞ºóóÜR≈G÷Wz	¥}
r˘õœ>ds©≤3kKbÇHÜ=F1t;$ü≥“Ç<âﬂ≠ìﬁ5Ö˝“O·Ü7⁄a"h£Sª˝ﬂg£e∏y}ßIøÇ›ËlQvôx›® (”’‡¡£çõéÏGësà¶uÈŸùäã”≈\®·tClﬂ"¸Ñlò†1’é7öÈE2õMﬂ¡JÇìUÃâ´Ü¨J"EÑ…≈/ˆ8˘…R+ñÓQ]Í-‘ûÇ≈‘Ç:Ç±gGµQlÎu;Æ†q„¥–ÇÓS∑*ËlÔ∞¯wtÉ¯ƒÊ|d@b+@ß~Ô∂·kñÓ%ÄêvÏj`Ë9“0‹¢¥ÛÂ_D ﬁQÊ®~ﬁ‰gGO∆Á∏√\®%M]Ùä	[-%È\ﬁ?˜~ é∑µ4©*ƒfwn‰O≈òzÅ
∫Ùs/%jeeEÍÚsRõÕ7ãÀºò÷n∏ _I∑XòhW_É∏Ù'T{º5◊tß°¶;ÚdKauÈ6ÚΩÜ]≤n)o_wY√Ñ‘éˆ|˜3îBâΩ∏ƒöd°¬ßy≥ÑbÕO·r *4†uAw0}T ⁄´{v§Û>,Mù±/£&êk™ÇöÙ#õj$SUbCï´˘ˆ%såËÏ—D,'Ùï ŸLQ≠∞–á∞∫ﬂ¡æﬂˇ¡=h’∑îﬁﬁ¨º∂ìítÀÂ≈2zâZƒ¶Füz_+“AË-§¬W€–Cq–îvOï”Ük ÊIXÿ‡MV\œŒ>»Ûºƒ/Ä»ÀÑe˙πGX”Ω6©5~Óù!léPqsé ^+îæ˙øÎ=ñ‘{T›¸«ŸUôÊ„SXë]·fN’ÇÀ^∞ü`ù7NìÕ‡pNü’9 m1∑dE£Ã[©S™èx˚Ì÷⁄_ÍNò!…#˜—Wb¥‡˘)v¶·•0∂PÃ≠ô≈6ÎWßÛÊi2çﬂÂSœg‹ü√ï˘Î!yúM¸Bj'ı$Ukü™ez˙∏˛‰Œßñ˘Z=Ë=««´¥ƒ5´µ|H⁄∫ﬁ\5&·Õo\NJ¯»§9€…të`òLÊµÈÔçGäπ¥}Á‰È-C°NûKÌ‹^%ëû	Ã2ó˚(à6v;Û∂î˘ê«˝rçÒ˘êë√,⁄/YóŸ\È0ÁÍÜÒÃrÌ!Â©«DrhÏ(±ıá?˚bç4∞"–H◊¡Ÿ>J#vÖ€fﬁ5µóï‹„—–Râk¢(qî¸±ö&'zMÄ^é°‰Œ˚\ﬁÏÅO?åi
üW1†Ì|êûf’˘{*’86†ôÏW=Ó†áavÑ¸iJ\È{5:ùoÙ±Àãk˙-E_*†E,πOÄÆu—ó™∞¢±.á√=¥çŒVıoZßÓÑQ«ÀÁ‘Ì¢ÍK∂∆Çﬁ,ú√':D‡∂M’ô6{AaŒ8Ø·>k(ïÕ∂]≥ô^sPò;]ÆXœ#ÆI—@Â[8dJ Ã0j•¡◊ΩmóºmL|C´◊≈7cZ$∞ÚßYìæZ‚¨úœ‘J[=
|S8®.ÏvˆRA®{)Üë=„XZÒN,»B°!UML#¿ÊôäCù‚≥œæã‚Ãı@jBò≤ì÷(”:˜¶Â	Hf˛Ur6Ó ⁄ˇ‹ÕŒ;∑r(|é_ÊPú¡Ær(ºì´
õKﬁÓL4±à*vÑü3ŸÂíFƒÙlÚ¬ÍÁÚäG+è«±/ı[òZœ®m∆j|æa`—®∫∫GœªîVãiXN‡ §Á˘Ä√Ïà¥ß¶˘•Yº0]Â∂dª@-$v ÕŸ€€≤K ÜÇ€^√ÃŸ4t˛U@§5øö∂2<ø[0<‰´◊ìu∑CùJ0~[Ù·ãº\ÓXïG8‚˙«"û∆¶‘^‚oã$ÂG/Vqµ„
I; –T*¨®ò[É9ò…±_áD"òÁ|UÔﬂœˇ‹Ë˘ñ÷|,õ;gè~E®s5‹‚öSQÜB∑≥MèµŸQÈ~ˆLTÎg©^›b]GÙL†5πib]N;~Á¨ÚÀÍ+¿üb]âŒﬁa¯IM‡]»“·Ó‹“Ã™jd0¥¿lìp˙òÔÍSî;\Í]Ëª÷3ñN1%•'◊äË”™Ù$®Ó°rcÚ∑¨Ï[†æäûc˘¥˘ZUÔ¡ä›ió˜*]x5{S®Ù2&D}si¢fú¥&{ÆÄ≈ø|jóKc…ú£…‹á'ıÒP3;RECÖ¸å1àÿ Ø„(ÿñŸù1TÃëñÏ˘»ÿ)Vk√FiµÛ ËF∆æ`AcLN~0x7ÍÔøÏ†°J‘Sc-ŒW’ÅV%ÄŒ §ú∆v17¢±Jªº∂ôtPŸ ∞VÊ◊;Í≠Ëº™Ô+v?5ªs≤( l6à¨_ÊV)Ë—¿Gï´ã¿ì;Ë„dËmYú¶u÷g\∞Bkç Ù˛)%qW!à∆EÏgµ#»-ˆØa?≥‚r≤I|«≠:ZÈM„Ù¨OÉü˙¶uô÷µG¬q}]øÉ:V’ŒÉõV%~äzäN1Fî\D8Pë»πheEÎ¥¡… §∑R@Àï˛¡∑¬Ë #î˛’…§x§“~blîùùM•π*Kc`»§±ñ#\‡˙˛ÈÖlÜq.µé®Ω·/ÉYcdÌªVvE©U≠¯^<cS3í#ÏÛd°2ænM≥"é*æe≥9%^ﬁN lNÙ`}œ–ˇ 
x≈B#Eÿ¶—ÌÙä*7µÈ⁄1F‹Óá?u¶Ö¸¯-AÆbÁsõ6>uˆ=fÃh•£Gnπü8«OÄˆ¬2Ïﬂo≤¶*»öJÍWd≤©”RV`Ë8Eˆj1÷˙ÌL€ÉGÑé{ËíJG.ÏµÑ´´{ñ<v(-»xÖ…∂˙é(YTı6Í∂d÷
Æ≠%ÑﬂL≤V}JY‹Íó]‰ıH‰*ÍhdÀ∑®ΩŒµÚì}ynﬁa◊a%Ã®£øm‚~iÌ6[¥”Æ÷ëΩ_Áu,Òm3ÓŸ”√°®…†gqéV†ï]Ag˚71‘6Á©p8Ê=ºòaCVÙU§∆ÎmøıU∆6V’Ô[”wU[÷€µdmˇŒÓ©O‚©>ï‰£ ó¸	ì2›©w‰b∏˙˜™›c≈z∫¬CU≥ŒzÙ~{Ôî#\Ò,Œµ‹Q≤bk=˛uTœ_Ig</æ7ÏbZÔN£dF=<∑$î1ü{^Ûππ√,˚ ˜ÊÏÁnà{‚wMÑynx!r˜~.Û4lYÚ’%Dﬂ‹≠ÅI¨ø S ÿé)“Á=8e¸≈<)±^è˚Cp¶Ù	o˜å˚aîŒÆ±(Ù¶È›øè¡≈,âå±°°7∆Ùò˜t”oé’ÿ]*°ÑQq’â≈
Ò0ô–¶>-jÿ√`´–-∆Æ\G?Ùm2÷$üÇÀ˚±ká,çejzq√î]_Ôm·¬$hŒ≥f~ø%\Áàáò?»ÑãÜÆ$∫
ÇíbùOtÛóU≤Ω5Ωå⁄!«5È´†õ´Íè≠Ÿk™÷8w˛Ü°˘y^ÑÜ‘d ¶‹:Dk€5ºñ6åö;>u–Ãû©Õ‡8É9ÖÈWy4Ì«ê?ù∆kOô˘ b<ñÌYÙW˜ØıyºÍùf˚Uˇˆ¥ΩÊm˙˙Ìﬁ|ÈÎr∞ﬂ@∞£«ãÑ”NˇÕh"Ëﬁøˇ?¨PJë˝∑˚kºläZPÙ◊!œq∂>Ÿç[®h#á·1Êoiá(ßf˝√œh…≠ÏùÄıO—´◊≤¯>âÕJƒ—?˚ bõsæ|K‘rÿn ZL◊~€ßˇ>ÛÈ◊‰1ÆO>mì&Å-“hZ‹ç€GD±â†sÎõ-Qû¢2~∆Öíq‰¢Dìq`¡ák„!—Û¶3xkÙS”ÖWJ˝oéo:ÄáIzÇA‹ Óºaànî“£H«8&:0∂¡áÒ,ìérK!Aï}ï€Óﬁ˜.¿`Sxø=æù»∆≥E\ˇπ˛˝ö‹Ë5°@7zErÑÛ´^ıº
Hh˘æf‹úﬁ*±†√É7‰uñ˛Áy8¢?Üã˘<Àôíﬁ]¿„	|ıW6¬}d1~CïBÉy∆Ú—F⁄
æ'⁄c∫TlÜÊ»∂zBÜe‡P•ÌlÇá“SmN=Íå>‹AÛH⁄åÜ∑ˆI{ßùp˙ÉÖL\—N™Êâ±°˛ïDhıì˙MÛåæ˘Ã°˝“`8–∆}‹ªQÓÅøˇﬂÎV(ç≈π*Z˚u<¸¸r’\,n^óùhsΩC©ûVdöÚ ”ÃÚ.;Qö1≤E‚ =ª %(BTg'dl±y»ªbÿ¥nlÁòù`dN[Ù>ç-[≤9∑Õ“+∏jR[CjX≠Í¸ˆ[}æöâ,=\˙Ó≥Ë û{ƒb©çíOâG;ﬁ¨ˇµG{™Ï§Ôà'™ì|âpge≤+@ãüI/0µè2Ù ôpöå1û>Äû°IÉSøæ‹÷E´Û˘†ﬁ≠ΩQÌåû˛   ˇˇÏΩÎv◊∂0¯?O±–»I‰ƒí/`BÜ-∞c¥mìú›lF\ñ R!©J©*éè_°{åÓ˝ÁÎ~ã~û~Å˛°ÁúÎ~©íd.!9—HåTµÓkÆπÊ}~6ç˘BA.|*‰Sœë˘^úÆ˚¯µX˛#ﬂñÑƒñæ0p,¬q-vY¢Ç›g<ˇB«ÔÙè%Óç:˛Ò£ßï(YŒ‘Çt>K˝HÃ–îy¡+Hi9*ÉûVë—L:Zñª1mƒZsª˝É(Èö˝•±¡OQˇ⁄6«#ÃX•hé)AÏ™a “>	1-ó}yOcQ±ªTŸ›º–6$πm¿¿·„@O¥6<ï}ÎôV‹P∆åÇSC]C…JÍ˙Ôˇü¯Î(«‰¬ËS±‘≈›’˙œ≠ìΩ{[+Åm’êryÙÇ‘C®ì”1¥FûouÔÜ|Æß7¯é+ßëOú„∆˝«8e/jáyæé(q@•oó‰YQ¬:Ÿí∂OÏFÄ°ÎÕ∆~ÈiÌQ€\JJâbºµ_ﬁgÎ
 TóSel€ÅêŸÄúa»dÄìá?9z~çÂ›PÉß:≤Â≥U¶FÌ[F∏KTín;À›∑#Â€Ωâ£‡’·èI6€2∏X„Ñ∏UåW^5a˛¿´Yoc˛êRøÔRÂÖEº“ÙD–§ÛìUπ‡◊"Iø8Û»ø∫â¯"}ÚÀÃt≠∑ñhÇW‡ÁÂ=Á˚œ7+}Ò]Øw%<Ìû<ia‹‰ñ °≥ﬂø:uÀ7µcæv∆ø∂˛5]Ó}/yæ§‰í\¬æ÷„.##úº®ÂπòHI	ösH'EzãﬂOaE%⁄´.g	¢L°ZxLMK? H5˛ôSb‰∂wÚ9{ÿ˘WÁ»«mZˆÿjxXOõ	Í· œ,J÷uéﬁ6œHMÜxdÄ«-ÊÙÜâ∂⁄”Y1l∫ °∆’ûÒ∂0˙0«dIÉ9S}jN√Ë¶6Ç∫¿öª>7(¿	‡a»æ%Ów⁄÷8“ú9EP∏ÃÕ%¶ı∑PE§9	‚åÄú^èt€P‚ÀÌUÛÊBÀ@h’©cÀ»ËËÜ1∆–.∆∞÷Õ÷mGÓo–ÍS	®`ˇü⁄Rˇì-NΩÿäF|-b^‡xÒØ0$ëÄÃ¨&qÖ$Â,ÕÑ<≠SöÁÅÃï*” 7ÄBÂ≈Ñ_2®·¯ˆ‰[‘p¨∞π∫Q2®ëxyÿÌ†¬√úÖïÒ‰(E÷Mfò°ä}É∫ÖI¢R	Ö◊(' YF-o•U‘§o‡¿ær—Ç5/Å)1Çy¢’Ó-~†50€g`˛)~eïÁå‡’Î˘éÕßbußÒ‰,∫†¯Ïë!ÃrCF2ıìøƒ˙—b◊Ûÿ—t:æ¿·vÅèT O©¨†;y]‹ª¥òÌªF˚nòõˆ¯hvuˇoVÿÂª&S≤cnÄ∏ì1ã¿{GpW…I[∂ÒA√xÉ√’ÿÄÀ˜úÀ"»Á¬Xÿ˜l#î¸•Ù0∏	*eê–ZÑwu^Èr¨~ø
Õóïú™C„9Ô™i∂ÖYR´‚œk«”∂;l∂dú”Ãü€öÒoÊK`w~√0Å–\Gƒ5eÄitœu5≈r.ãËóòè≠™QÜèq>-h¯1Õg?ÊoÔoscscsc¸Û)π1ˇ‡˛ï∏±„Q<âh™Ij9Ûƒy4≈pjM<(ö¢Êë&ØDçïènΩ4æ@6[Ñ¸“é>KkBK“=<L˚Ò˚∂2üø8{ÛÄ‰|/VF˘ÄÉ¡Gx5Ìh±Õ™p±xÙ–—π&≤¨˙ÈÖ™˝À–w@O?âUúMΩåè«	liì«$√iŸ*6Lz #«Æ¢Ì-K ª,+áq˛.Å_¿Äèœ¢ﬁHÍ\ΩbAãË¥ Ö‹äNÀóÕ{üŒ∆cáıÅSDΩÄÎVÉÊK6^Ø[4á®<⁄∏ ù8wy ¶7¸Ë‚∏âLëˇ"»WÚŸ¬
]è≤Y”mﬁSløZ1Åº¨˙e∂´ ë÷%0óÓ7≥E|0Ø5Bj˛æ€ØpÀÒ) *‘b‚€™÷≈SD˚h≤Ù∑F¯g˙çà_@†§ ÃQòÈÇ% ∞9œ¨¯’º◊l€¬.√`∞&≤W≠f[ü| F˘X8ÂScïèçW>5f	‚ª,√§k–
P˙. ôÙ¸uzé?2nµºw^'›◊∆∏Æ Ì?:8∫voÆ‘‹¢æ“ÿ%c£ß7'≤ﬂ£<ÜÖ$˚1.©ZÜÖ¯C]ŒQe!òûä@Aº+.=t±ö’áj´¢/8›—l\¬Œ∞ø”˝√ü◊("§î
 t>Üì˛Ø8 õ+WkñuZÛ±Ôôk‰˜c»»ŒT7∞"ìiâ	ˇäŸhD	Œ' rßä∏;åy˙f ≥¥úç‰˛'iÇ cç€ö≤Ÿè$yÂ‹ÒjDi@l⁄ã«„∏o1ë√”m©å≠.]≠Z˙ñ∆`˘Z◊X"ª1ß@˙F4◊Sx≈ƒ∂úÂ$¿OÖ|„©mIÂ[¨+∂+/Lg√r§h:Øÿ*!UG˜‚äè•¸k_«ßO£-ı¶%ÙƒÀ\†µ-∂FøÊ"7.œS+Ì∞4≤êî“—]¯=k0.£3M.´§ÉR`W=—Û86\Ç EDÔÌﬂ<¢Nu⁄eÔpwy_‰m⁄UÒc©≈\®Äº µânØÀ?dgªòØièÂÇ16*Ï~:~qÿÊh29øhj®5äø…ŒÃÂüO˜[w∞ÄJO–a¿œNt° k>Íà!œKN·f≥ˆÙyú¢#˝NüºµB˚ª ºEˆ˝√¬jùOpÄï¨‹_5˛∑ÔŸ,wE˙õ{*%åÁgIâíXl@ñ|+Æ‰5$p≠∏éÆm¿ÌïRL“£©Öâ˘…WsµÁi¨Í«˛I¯ˆ/ﬂÀ˘#œ–í¿;Ü®^»ÊM¨d»˛îU√V-Ï{áÅ‘
‚®∏ÙŸ«’$–ı§4	‚X.¢J ˆÈoÍøû˙W7
Ù•ïzj∂•ö†5Ôh€8Ø/R…
¢àÜ…N¯§Èc≠‡hÈ[9o=ëÄ¨z=0∫3lÙL=Ï&D3Ñ)Ük_¯Dëv£§/£‹õs◊ÿTI€îŸ˘∑¯¿¥*°ù«˝Y/n6 ZØ_Å8U¶%WT¯ÿ1`åô—4	@sjB2È∫6%˝Í≠Å”Æ}æ
dù/pµ°mw|˜Ÿ:Èiú1Ïx%-Û≥M“Úò£2ŒÒ,ç
å‡XÒÊ K¸Íè_
ÀåSò√BÊ≥°K˜Òh7¥∆h·å††"ﬁÑB›Pü>∆¢¨√¨LŒìÖÚÆ!Èªù˝	…˙e”˙¯±k,b?ôD¶¿Ù≥˜¸ÀWKÌ}Â÷~:
ˇÉ‚ˇ0}Õl;7é.í«ì»≈t Sâì∑—≈®∑ﬁ™hÊO¿g¸ÈVÚØƒ∫úTe+‡q⁄áCÕ±ÙGe_ @Æ√ºX-øD9†•ÚÇÃ¸ã„$jÏ}!ö√EŒàˇ ” g{Äëhú`ÜU‘≠}»xÒ…'œ."ò”úÄ'q÷À˙.ÿè3~˚˘± ∏"® @("1WU`¿>A¨Ÿä–h3ﬂ/¯7Ênûùµ5vêíñ"ê8—'Y6«Ïy4-ÿÀ£¸ÚÒsZπk"‹‡ºπˆèfÎ¡ø˚ﬂˇªVVÕk∂äK4„€kå#Í)%~‡_™¢Ø6^L∂(ú•Ö79ñi$¬ô\`õπÖÂ:åﬂ	 <Äñ`@IÇ—ËŸ-Øa·≤¬›Ì^Ï+1?ˆI∞L$Sí¬É¬=u§◊áaØ‚≤òÉ¯ <zˆA:H“ﬂËá‚*π¡ûtèQ◊èÀxT$Ü∆ΩNÁ~≠;~Làı∏Å<.¶Öa–ÛÅLU>ñÂ¥ÿ^[K≥	.I2ig”jÊq\Vkg˘`≠à£º7|¿ßwﬁY˙Õo;__∆)ÕóG˚ò®;KõºrıÕ8ô$ÂŒÜ¢{<{©Å…ë∂±˝¶ÈTMM·_À¥h.‡c‡N⁄b>‡´¬¥ı˛<¿&õ”4‡æQû•7>!¿{é)¬R‰ ¡ÄîÓG#LOfnè£F™úÛ√…[∂∆˘\"ﬁó∫=òk¿MŒê DX”XıÿzÒs◊!Æ Ú®ƒ4.µaR,èıç„‹K|ôÊ”ë>,FMXÿ6Û„t`>®†)ØÎÿ…°}£?*}t)söWCùURLx_Ü^˙TFU|s·©ﬁ÷ @V9Z¸6ã ìKÿ–ÑÜ<˛ÕSåêóî˘$ÍqÎ#–8]GÒÚ,t….üÂËe„q‹ìW€—¸ÆÚmx4+∂∆ˆO“ÜzçvÎçqΩïS(Ãw€Fı£8ôúÕ …#‘ôÖ®â‹|[ÿØaVΩ®v˙o—Ne§Œ’ ;^n–÷òØ3d{ƒŒÄÕÒﬁçˆXé[pxπép£⁄˙Ö]¥Ì=\ÂµMﬂÈ{ú(CsR^hä§—Èvè^¸‹90$yº∏&_Nß“3Cø=˝˙RÙ@´ß!Òâ¬/x(r ã?3@πç+tmÇßƒX≠__‚“_jŒ1≤Xümî5J·‚≥(øÄQßç+£ó˜A?ß∂DPò+ƒ!5ÆLÚ»@x¢ü ·.1ËDÉ∑ õô1Ööïÿï1Ÿi!vìí/ÑÁÆ9·Ë€ç3c6ÎË€G'ÌGB:^3§æ5§æ‰6d”d9R;o‘€∆@]x‰∂K˙fI)^/&YDãgä¯≈|}g– aø|ÙhÔ¯ò›9ÿ;:±T–m<»ÚãÌ
l@È˙Œ \
>Ì«Ä≥·∏Zm¿| Û“Ö‡™0%õ¬Ì›‰ìx2gq,¨‡:ˆÿ¥ëW»E“º+.A}Ë∫ÊZvã}é‡sﬂö‚ [Ñtõ¿|
∏U5 òct|(æSXf ûébX•ˆc`¢ˆﬁò◊bL$ËœçK%˜£„ÏrN	µ*è≈œ&¿Ωp¢‡‹AT∞ß'œ®É1›V3à⁄Â¸
⁄÷=ÿ"£–eπs|≤ú…™—4ã¶ªÕ‰¨Â¢k3J¿@ŒÌâ·ú¬3`•`‡&I¡ÿˆÁ¶á°“`B«<Kï]CΩ’∆´¬U⁄ÆHÔ+ÍdË#móìœCÌÀªœiö?ÊË⁄•c˙6Çª„l¨ëÄ<ÈNm˛ÿÏéPÓfu.ìAﬁˆõ ˛ïó}∏√A–2⁄DC ⁄Oœ3oÕÌ◊°ï#:—≈∂mptﬁ‚Ù|T5ùÂ= ¿Ö=¨≥y∆ªÜÈÊ®TíuÂçï≈◊àxö∫mJu„cY≥“d…Ü≤“â—òßé.:>ﬁ;96©"Ωnàj_vw;'{ÑgÌ·WõD≤K?¨Ò§í<¢8ıpGtû…ÄÜ(L»õ∆:ëW®J:¿nº‰ÄFÙ˚≈~äËéŒÛ¨ç_ aq±T™£‹$˚}ÛB0Ô$gfDAcF◊4∂DFÀEÔùÕ%Ôº¯Œ-&6∏H&S∏bq;*o∏˙‰™`¨)⁄/πÔ$∞Ó MóX ≥x"aÔ^?yÀzp0ƒ);çÛ‰}‹gI
Cj≠≥ﬂ[Ø66÷_≥Ûq¸ûÜ∑0JLú≥7≥Ë∞˘s⁄∫ÕŒ≠#Zµ‡YªΩŒ–€πüg”÷Ÿxñ∑äIC;∏ﬂõdDÙCÁì§	*ëv.1ì|‘K–]a£–G£cΩ˝„ª∫2 Gi2Å˛¨Ú™¸Ü]ÿò#Ù›f√(rX‹oΩ∫µ>}ˇ&qáΩkù£”€$zﬂz◊⁄|?f≈0Íg¸+>9‹üÔZ≠hVfThÿzı„˙€·kÕ…ôn¸ﬁÍ‚: •;ãÀwqú⁄Î:9ÉALœZ∑ÿ…»[gÚ_[∏πfº˚	<ﬁ4ª-„˜%Õ‡<KKÿrC«gjøÍêGÄ[e2ñ∑A∆\Cˇ‚—£3xBáè~≥áp2WÓà÷Ü7ΩQNΩAÚ›Ç—P'q?ôMƒX'ÅQ w2ä¶ÄÊ‚ÓY‘øb£<)x≤˚Çí›∑Ω¡Lù5\ÛÒﬁŸ¨,≥‘©ô•è∆Io¥sŸÙR˘g1hïØƒÖÚsÂ.¶±j”÷M6D¿‹V«@DA6sI˙?<p-`Á≥‹Öx€Úü¨H~ácµyÎä≠π≈ó≈ræxÊºÖa≠égg®#∏t(Á+sú‹N‘Ì XõÂ9ê4¯ÁP¥6Ÿ ö∂ny ·VìÕoÄÁ–eÒÿÉ¡WÑ¬gAsÜÇä`m}jﬁ%}¿L«≠ç@GåAÛåàıŒ0÷hÅÒ%ÈtVZ~jd€±siëXtì™§4?" oë≈LrÂ+g~ê—Â™h¨ù¿ú”˜≠-6Ω@&rk]‡0ï)8E‰$NπX¯l‹gp=£°L+Õ“˜ÄAÍ⁄6~L—ƒ+øX€Xp
°±8ﬂiÏΩﬂf{Ô{—€'{É»ß…xÂ~Õ5∞|Ò≈B€Û8±ÊC$·V>-∏q2±ﬁ8_˜ﬂ‡û°©h1ªà˘∏ıØÜOÄògkÏ9ÚÛüVï»†^µT·ø7ÃvµÄ˜i›˘ã·≈ßQ>Äk8'¨y4˝ƒ®ëM’†∆ÂP◊3Æú˝ÛZ†ƒﬂ(?œ∏Ë1Y>ãµtÀ®îpV√®íÅ˛°∞Ê˜Z¥{èê˝ñf⁄Ë†π–C‡ Åó’ﬂÔ≠ÒR4,N˚@ØGi„æ˙∫Dı.ê`—(*˜Â∑%*Ôç„Qôgi2j‹◊ﬂóh‡ J“Ù"j‹_™´ﬁ[„†ÛgFÎ¬)ÁYñˆì‚Sü!˚¨<3B	'<1JQqˇ$Œã∏üDpK∆Qˇbe	»€O1¸J„˛q‹«à∞ª…`ñ¢‘MÇ∆˝›håf·æã •öyòg£NÔ—¨àF@a>ÖŸ•ÉèrÆqm∞I˚O{#I{rr‘S‰ä≈>út
ptô¶.'X⁄“U≠ö>—ß?∂\]AÀ=Æ¢ ö^’PÑ¶≤™í˙ÎWº˝¬iø?5ﬂ∞õ ¡ù†1Á≥xı/v? ∑ÿOÄôŒñ·%ÆsÎpÕm5ÏÕÓüÔ÷i‹oµÿ	Ÿıv`a◊ò0ì`≠VÆø‘∫orœâyñÖ‡Qî=é‚ãùK4ÜæùÛ°ÊyR-
ﬂÚl_ÖQB›0WV¸-˚»˜Lı˘lD$H_ch†Ôjo~¡q{èÚ8Úö≠Âÿñ˛"qéc∞‡˚åHsí§®,ÑZ∞˙˛H,Œxó+≥ﬁ»ƒÛbAÒ[íıìQª›v[Ù4Û!áîëDÜ∞i©éÂ<ÖcïnLﬁP¸•?≈π∫≥ÂµgãÈœ4Ê.hˆÆ„ˆcÀŸm˜¯º/jŒç£†€‰˙V©ìã∆cw±¸3ˆ ¿ïèÜîqÙºv{
R ’ûZêMµ ‚^Áµ5ÁK/ÖPßk≈∫$6◊ı2…g?.øN«‹§—≠ñáuÔ≠°Ú“0UX”∂
Ú©QâÄ-l%x£/ÕHêï0(«:9q"Ãj¯ª#SÚ†˘üH¢bõ^—√êâòÿ“Æcº
õı)◊¶Oº’®Ni‹?ÒÏŸÙõ:#øZ?√‚0À… ≈≥6§Á^Ö>0÷<*@ÖÈö,Pa∂vM5‹Li†&7÷∂ﬁB®≠1‹:QSo∑•·çENfä¢bŸmÒá¯[dê¸‰Ü[Ÿ”-¥eπïÕµ›*qså∑‘íÜÌ∂¨ôlYq|w\8gYÇã≠¡	ÎR™Pm¥—BU(“;∑ÅFDÛ·ÔÿÕ⁄v˛∂7´∂7ªô«¥7€XˇŒ6ÆkRvs	ì2Ë5ÚOì!3k–ø¿i„√∞™ò9–„à„söôÌ&àÄœf	J…˙øA÷c?ï…Ñç#¿É(˝‹∆fu€*ZÖ∫ÂßŒÃÏ]kcìÒè…9k…È7
,Jqﬁ±˛Ç,’pµÇÜjwÊ™}Ü¸’z{Q»§Ç#üıgcqN÷t`9Ú∞ƒ÷f«ÕªáHΩ*ú”ÅﬁÀJ-wù)Eê]øÉ| ÷RÏ˙´M¬ø(Ê‹ròˇÕ·Ò…Ã"∆ -à4ÿIÇÍínîˆﬂcº-:Å«_D·Z^˛abÿ9@ÕdZ¡‘®&>Ñ~∞»’jùπ¨RË™Ÿé@ë3éœ∆,4ûˆ>HJ€M0Ã!ﬂÄvª]+õUa¶x‰§EE≥SS4;≠ÕN+Ì\?©<ˆ>q^di2fˇ‚ZWbKFKÈÈÆqF4]}H&˚øÕ)õ1Ôú¸≠√XËñ∫˘ßª•HÊüˆI—yô>'∆cá£Ãπ Íè>i◊:YŸª∆˝Éø,cE¬W‰˛ÛΩ›˝óœó®¯∏’∆˝ß˚Oû.QÈe>¿p˜_=Ÿ;<˘sõ[Õpnoıi°[ÑºFÿ>…˙Yd/ipıE¡5MÌ˛…∂˚b9+ ƒy\ç˚˚á¨{Ù‚…—ﬁÒÒrM≈oì¯5p¥˜Û˛ﬁ2ák'|˜≈·ﬁ_‘wm±™9ã≥wr§π’‡≠Ù ÀQO◊0˙d¥’ílÚ«2ˇ1ªq1 ìië∞oÿ>F^úç<’4å∞µ JÅV%è1ulæT&{WÏ\ﬁ™’ñ; s{IÄio-2Ä€íﬂ?ãÊd6NêS“ƒbó	ÕX?¡¿á…'1π¯ÃÜãIäí/nR±DØ66ú£Vs∂™Ä*(~∂‰”_ºë≈´Õ◊÷˝QNÃQ]wÒuí¯™ïfõÎ"ø˝6È∞Z?∫Gi˛í9*Ø–V⁄õ˝–◊⁄|f”åŒ≤2≤√"˛Qˆ‘&√ê9¡®˝– ˙]ı¥åﬁ€ËR(HqD˜Q∑≤Õ‘Ù˜´◊òrB™cy~ôNYFΩ!é‡E:F;+#æ,i•gS≠˜'c2ù[Òc≤>çÚh 0M4ƒ†ô#4SòÂQâ!„¢wîmCÑäÀ«ÒY2d˝h8œ¨Ä…n|c=ΩıâûÌΩ;*∞5åâÃ2ÀÀR∏æÆGÛh6M¢·
ª@Ò±Iøv‚ãµ÷ÓÄÓzÉ›O{„Y?Óv≠p•z_yº-<—M£È5∂—ﬁÿ0F√˜‹(—RçT 5zxCd63‘PSôàñ≤…†“Æ)®©KdÂ≠U™'∏TäÏâ îq4ô&∏3«›ßZ»Ö∑@ˆ⁄∑Ÿ8úΩˆ +Ó„.è &W≈
 »Ûµ˙Øåå∂Å%∂VÍ7ÛÄRj·rÒ,f≈§ »XÙ∫œzÂ0ÉÂVwÓp#ıêPì∞"◊«w‚âö5nÖ•ñ∞ÒΩ»;eæf-£lΩÿ™0£Ì∑ˆºÖâa¥ˆ9€ÔŒﬁÕﬁ´∂’öì˝ûo≤öb®	c√Kaóª_∫Pa&[≥CuÍçó·…1∞⁄®hí†Ω\ªQ9£Åbßa‰√è¨Å2‘6~«÷MÑaa)Ω◊ÿÄ¥J2.+≤DŒàuO([¿û‘X¬Â¶jóL8$†»rÎ‰ÆÀ!´¿@¥∑æµMñÕ„^2≈œnı"hXñ&`u®^ÑjΩ…Œv´Ì∑°˙	øë5)ÛBˇ¿n≠z™Vì2Z)àqLÈ≠8∞◊wxÊí¨[rM˜€ÿ¯èÜ∂]åß¿gˆ^,ñ|K∆/¥ Íù7‚ê˙`¶^Ücˇùeøuµë'bŸ¯aˆõõˆ[Zf˙ÕR√›<:◊˜Çæ∫xËD˜æ—ìıµÎ⁄C—Ôı}˚ñ›26ØU]J∂ª¥Yß∫èå‡É™/€æS=Æ1Ú¸Ÿ≠gÍiòEÛ’kÛÂKgmΩ⁄/Ω%j6,€œNÇƒ'¿Ï8oÏ†Ì«Dnj2œ›^œÒ—-JEùµ5Ü+«„˘säuwSæ X;[qQBıYvŒí	⁄ò!kÑÜ|-`√R\=Ñ.Ø©ñ
kon%nÆ…ó6T‘ƒÒt¶”•ì¯ê·´Çü•‚*:ÅêπGŸÿHÙÉ™H‡∑‡Ô£,=OÕc‹RXJ^L¯=x5-|F∞y<haÒÅ≥†u!:è^Ïô:eLN#Ás†f/˘=IY4¬¿¬<u2ü◊ó4%õ∂µw◊§ÊdìH=Óc±zÏ≠¯ß?ÀŒ)£´/.sÿ≈K¨ƒ≠>äºTjg— âR;ªA?J∆GDvò˘/PàÑ)˚‹7µô≤qˇ8.)÷ê¿r$‚ôåœ[≈î±y˘†ú¥9–“.⁄—ç>h´¡‚aÿÿBlØﬁ1rß™9!Uª2¸øud¸ô¿¶ÒaõÅ◊ë[O’35`˝»àëÙìß6´
[.^{¥	!Ú Æ D:$\æã‹õ>ßeƒf(√†)¿!Â_ÆÄ}5y|Ω7vv‘>iFN∂ˇ=◊œ±)J:@IdÒ t¨uüóT›Tm€„≤ˆWMÇBxt1&ô∞G'kÃ†Ÿ_ıOk“A4∫ù6= `RHTPÔôóÁë&®vG%‰bª ≠‰∆G Î(§ò¸Yéøã'//S>ÿJ6¿µPN]HD èˇ[ÄÕÚÓ»iˇ\HﬂPØŸò‚ÇN&¯7∫%ªîâÒ/IôW¨◊Êâà¢q_'ø«»IPG¥9¡àÔÕ∑»3s\H√ÄﬂU[/ˆo•ZÏ—ãÁ›Œ·øÿ”ΩŒÓﬁΩ¿ﬁasÄˆ?BÔÊÊÊ*ªygï˝ o,ú\Ÿ‹ÿZe¯ˇ¶¯øÒ∏aA¯ Q4≤Ee¯ª–„–Ã∞πqÀ—l„Ò€∏Lz.*¢Ã>J¢@üú¿;¶"Ω¨Ø¢Î»zU◊õ^£›ì6{“9⁄Ì∞˝√?wé˜ŸìÉ;'{èûb÷$µa-æÎ„F„dÄiyr
’+XÜäûÔÃùsäôﬂ∆ﬁ¨E_»h6â0eÚì<πàÿ1
ÙE~8ŒFÏ·mvòM≤ú›Ñ!ù¥◊7◊÷‘å•=ÒtS}ªtf¬Æ¯õ™°Ïm÷MÑ¡ÙO—E¥ û≈Ω∂¸äŒ(TIåqVÁ„«eá—x°79¬‰÷Ê˚/∂~ÁŒù÷∆Ì;?¥~¯ÒV`œnﬁ\jœ,`⁄⁄¿~nzcHÄ°˙«`úùE„2Ó·∫u¸√j`V◊Ö›Îõ„óGù÷›;Ï¸“9Í≤ßù£'k¥kZ=XÓ“∞÷’¬Õ†ÿÃk„&}q&£F˚„u·Ω¡C{48 π}«{èàˇfï¬÷m%Ä‚(-– À©Ë·oe˛+›ÉV	§È∑B;ππ^9†Î'"Ë^¡`#" êÏ¶b2‘M›löùöP ’MÕl¸w∫[L';ºc¬êÖhÄ¥(0`sí&lMø¶˘~i›÷êdk˝ò∞Q1çã‰<°,ÖE∑>Wu$£Yπ≠ëF>?Æ+Cˇ"}ä$ˇè[ÊÂ€{áJôò‹yÆÀ€µYoıWç√DPuˆ·∞u˜ûÌ˝‘È‚≥ü_≠u‹9y…»£ÿ¯ÈÂÛÉŒ”∆kˇ4Õ9‚ˆ~«$˛ÑnÒG·^ﬁqÔÛyÖèÊj°l|C¨÷∞}ûÂ{Qoÿl„®èpõXZµ¡Úı{ˆ=¨Ó´‰5GAs´]ãá÷Ÿ·ïÓ*ÏM_.≈ù≈—‘¿Ib=É*M–¬Kƒã„ıÃE2V°I≠√ú7VåÏ§´Xûñe›[≈F8Àc≤Z¸[O.”˙kØ_W$z‘=˘≠lT¥Ú6áæ˘1ÜæY—)ÍïtW7ó’ˆMøÌ∆ﬁ	‘ÏÜø™ê‚é¶œò˜≠◊xı◊Œ€§<Ç”æı·C#µö1¨-oX!™Ñ∑f#u∂›Á0+˝ûÉá⁄ˆÔÕ’5™˝¬ƒ‰‰àñFuíöy»N^ú`ÍB9ûV≈ˆ;SS'óW£”ÀáÊúZgŸE/Å•∑^c©RZq(¬€∏®£GÂN∏◊±‘}©Û/£˜µSØ`≈|ü —∫˚•Ôπ÷~î]ﬂÿú{<∏øx˙›IúüQ®MF9£àê<…~…Ú~˜À…:Á‘ßì.,Nåèp˝ö¯0+„mA|_\óK0(dT∫ä÷pô≠1nUQñªÒ$%Èôm÷)#JI8ÑæHéòrkT§JS`¬©¸¨M)AåÜ∞Hz€Z≥bÌ≈yJÈﬂ©›’Ö◊(ºŒsÊÇÈ›tG§Z´ßù±ﬁ(âOîÌ√∫Ω.æB©G√∏7B->À„Û8è”^‹g_¸S2…Ô,MIŸÚ0˚Õ¥˘iõZjˆ¿PZAˇ“mgRÃÆ∑ÇV(ƒvàr\≥ªãÏã˙˝.J@’U)on.⁄ÀﬂúP2Rk¿‰øLœQØ¸ÀI∑aÎ vÄzr+¡SäkBYoüu∫∞{'ùc8∆¡Rˆ~àå∑v7‰˝èíªw˜é˜Ô?Cò¯˙Rå€i∫¢ë]iÚb X#∏ò+Ú0‡NÿìSê.H‚Y3ÜM>¡( ¬ ‘Z8NÍì¡◊YBÒ¥•o	W5È∆’E⁄9KHmhØ÷]Uí˜\hÔ A!5]∂ÌßÑ4hKn·äe¯•Í∑ß≥bÿ<}$¡1πQÎÍ‘Ë˙ mªüL0.å®æı]UN∂Øk÷˜ÄQxÚÆé⁄ˆüãR≤uY´æÌiˆ.ŒÎÓbŸ*ïØoC¯†Ú¢æ’«Pä+DÀ≤⁄úÒ¢ÿ,ü”xWîR£øÎ€¶Ù=ıSí!Ÿ*œT€$‹yPh‡˝"J…Üe-ßm∑qlF'á∂ªhoVîŸÑ∫‚á Æbî◊Qûˇù6lØi~ÇyÙ6ipÁxÊùT^öÖÜ´´¬˚é’¶1T-Z∏¥z¬u†6nä\†Äle≈)Â≠7≈ªkïÒå√uøiì»âÌ‘mƒ¯uUΩs∫Qc)õá®∞n_nüÆáRÑó£ò∑ºÌW‰Éµäv!o£q7 Àqg!Å`ª·ÃMV|Kfó≤N˚Mñ§TZ@B∏“Ætòy°Ì0ÍZîo√´=†!∂i0øSaÆ{
˜ßn„ä∂‡-¢∂ÍPuãª€¬≠wëCò¬…Zp1µßçNâ”lõ	ç9Uã„ﬂºŒ®≤˚}	_,€ﬂﬂ0õË
˛6$!\‚7ÙT∂Ω∆eçfXtO7·Í7≈%Ωl<õ§pÉæ2˙πd\r?IY1©Ó≥˙>AÈãº¢ª{«œéˆª«˚V”Ø≤™’Íz∏
’˛yÚ/´4¨L√ÿ˛◊∫⁄Y÷á&ô¢ﬂ% Òø∂ŸÊ˝lÂÉ∂Á»ësÿ$∞âƒØÊx aå¶ïÕ°a∂y1FäƒåsA£m≥;Ì≠UÁRWŸ,O!mL<Ü3÷Ô√^o≥õvµRv∞mÇ¥{mæGÏ4Ô=ëzˆo”Ú:ê_ôMµ7î1k‹Å„–•t∫¥¥”Øó8-∂æ-®]ÛÂ∞B§π¸åC„!45<÷ó~Ô¥C¢MTZxc∑Å◊:˚FseNQé	Êuy«ÆD∏a^ù-„åµQπöß@{eÔñ€\èÚëˆ êZDoc%/Q÷´ø~}P$ ˚áQLÕ+´ê≠÷rJ∂°ßSÉı7ÕN,°⁄w§äëƒÖklÇ[`˙iË˙7Ë_˝Y§î…¿¯O¶ë∆ﬂçq21_{cTúΩôçFcäÆhÙOH»d>ôŒ∆fù"Üõ1*ƒÉ◊ö—NŸ=∂±©≠“Ã^•NÅÕu∑  ‘HÓ‹`ºaß≈u∑πn ÏfäN^Î+º6çì·˝*[˛lŸÌ_7S……ÆÎÿ5>*I8cYó◊_˝ê‰ò™€ˇè@˚d˙ié.9õU.4:Ä⁄“÷nƒÚ˙ 
sUØˇa-ÄË]Ü’5‘FÓ±xeªu≠˙ñÓHŒä†ƒ˜®Y§˙Äßºgïªˇ
Ò¿}nØõÔçÒD?â—1®3M‡¢¶.yèÕnö¶S∑òƒØéÀ,èd∏Ö}6º˘_‘–Ø—4˘uc‡ir,†πZ£ôFyÀÄF¯4åÆ˛mıØmêE≈H[ÁØ:÷˙VEaπ/jπ´!Wk}/)bÅDHw)‘ßƒSw…œZ!´+ˆ_$MªØm¢›r_Øc˛ÿ∫jÑõ”$;˚XQ&\–?˛2ˆ«^F”ÓP∆ÉFrM˙	Cë#z–T0äø⁄˘ƒiﬂâ≠DL4`!`jäJ¿–c⁄#V8øæ]˝v≈P£Ü›/tãZ-(XÆÛÃÔbbKpÚ$è2»<⁄zÅ_≤ê6ä^‡Wy-VàF∞W”ís?‡∞Ïô¨õo⁄Õ_9kKVú¡ï5,@ıﬁp´OÕÛ∏ˆûgQ/‚≥k,?¸ßS‡∫ø<: êÚê>lNB†∂mÔ'®c‚{¯@Y∑3˛Xπ6ë†±¬|Ω`])stÅõd¡éóg0Ç¯&ÏÖëŒÅÓÏk‡ò$ì¯Ñ ƒ4¡ä€îÛ∆o.èﬁ!ÇkúTQ»ªy6ô"ø±7ÇµãFp•§=T∏∏~Ï‹÷55E‹É'™`üÙ/@÷pÀƒ·à<ù·Fò2hÇ+z§Ù(Ü‚òÕÓ, ìÇQÚq®“f?qã∆>Kg≥tÄm PçZ¯µA›®(…¯(¬ób0Hu°Õ„[$”„UIäFKgîeCÍ«∞±4"≤Ù.í	P·å{¬3ÿ∂JÁì›£ÿ¯  1ÂLèaÅy_\¶Bü\)˛E”xÉƒ}37Ñ÷h∞»è£Ò#≥√[:™I5Û≤¿∏/„àº©ÚlFÓÄœÄØîÜ˙}ÁÑfúfIä
~&‚2∞~Ü…~ ûä	⁄w\«ªHªrKÙÛﬁ7kpAÆÒªrç&“R∑c’"ˆ'q9Ã˙ %›«'6Fßy÷xî°qhŸ¢Ï—P8ö˙Âb≈µ7Ö«Îs.¸ß„ám~lìÛã¶8dÜ‰b≈›+≠ˆ#T>0±∂˜Ø[xHLAEu¿“ŸD”lÊõoÃVyrßk√r2n¨8Ç3{cm2!_t®!Emé◊•iIìd·úM√±LõtZ›ÈÓ£á,"’ﬁÖ´\=ú$jI?FË„„ÂÀ¸u≥Rr.\G£ò;6∏ÄâÇCÕèG÷—¬7ì…4ÀÀ6@U$rÇ¨¥„Ù-{¿™^µﬁ?Ÿ˚ı…ﬁÛ˝√˝_a≤ø>€˚È⁄à∂kNÛ¨5"kŸÖ0‡C¥7¥ÊŸ;"KˆÑªñ^€í“≥æŒ?	ó∂i<…≥".xDémv<πæK¯g3¿ì‘_p«Ñ¿”≈cˆmç(Å≤µ*<ä˙Ñø≈‚g 4C—1:YPœlî•o…147(`hÌ
Ÿ§õq6h6^‚u'ÓvÜ!Ø0™Çà#ﬂ9Æ$ŒŒfò{C∏DaC‘#∞€m´3æ˘óÏIñ∆Òì8ÌÏØ2:]W
‰˘ˆ6ˇP!¿>iî¯çÓ;â çõóºàÅº•è‚b
ø‚„ﬁ0ûD÷m-)1:„/˛¥˜ËƒDH∞§StÏqE⁄ïﬂúÕüÌ>Yu
XnóÏ›¨Ñà2îBmn≠˝Û§ıdˇ……⁄œ˚kõÎõ∑W‡jÑ{O¿_µß≥ﬁyò,Ü<Ò·ü¨Ã_¬}J°]rX'P◊ï=,h‡Á"Û°VŒfsì˝,7”x¬ì‡ 1Ôß}†Cã$Zt–FƒÉ›$`£g@yD∏ñ)–!E≤JÀ˛iïì#DúòòÓæuc5‚,|‡X1åı‹q ù(Ì&¨ÿ4bÕó]∂F7V‘√≈«`À|¿DˇpØ-Ø•Ñèe˝à›:lÛÕà D“Äk|åS»~V‚èNÆQëïÈ'(ÒJ√û9.BL‘å∫st‘˘◊úAGÁ%–¶D∑úí\C≥#c
∏MVådÊ·üj¸n®¿˚ö8‘;éÄfÁ3^%
x.ö<â≥ }ãx ó@”W°˛(æÕ‹Òæ|˛pÔhëÒ˛LÙ> …à+ª¢Çd{ãH”?ﬁ
'¬ö«qπ ∫ΩbïΩ$CÈÉ˛Lnk2ª'pŒ¯D4üè∏lO¶	a≠?√ú‡¥´ú|Q‡4RÃ“¥b‡ﬁ≥¿Tdt÷mˆ R˙≠≤ ˛C*=Ò/Mπ·&ìæ™;¯<*Ãá¢´G ﬂ•eëXÈå<˛ﬁ‡Ìà◊≈?∆/kHÊåE®òÖÒÅuttPUAw‡áFáåLì´qÂë;à‰‚;ïëì]@xÖÒ√Œ2ää§‰Aµ°ƒé©ï=d¥Ï6W\6©ñé!Cä˙:Œiª€›ßßVGÓÜk)ã”Ω)ëÏm•!è!^Yp%âeNO‚Q‘Ù©ÈÌß__-]ùŒÌª¢yﬁx›˙c!…AñÓœ">õï“IÈ,!±…1ï.‹rdHÍI÷Vˆ$;…/»√äãZ7€[≠ÛqTR’≥ç†ïñà „º°“≠1@u√ÄSîê‰Ç`IPx	®ZOf—R8†™õ∆x)HQvnﬁaı,¡ãú≠dèN_=‰,ì<Ókv¬πij-MT?û≈èúé‚y$3”Ê√iKèw!.i∫–,˙P=∏†,$s!h1oèB Ñnè‚¢ º¬„0˜˙#Ü4¬;`‹sÄ‹Œäô¡^‚£»Ö®˜k3)-§«Æêp<2™	‡∑fxÓ+—ü` PÓC‡â°ÜÅÒÂ4‡¯˛òËŒ·Ó8{»{[r◊XO¬•ygh>BÌ6öÑ„‡†ôYŸ¢øháÅV/"6LêSa∑ î ©Áúò°pú¿ñ–‹È¸¥ˇôjtWÑÎ∞à«–∆P5M›â⁄H°!Ω$Z≈‡G£aísÈ„ƒ<~{'˚ù.Y¥Ï–w|™%éw\õêßJåﬂæDÎc‘ºÈLó«ÔBbVÉX≈Ê® /}!ë¶XrŒDÜÂ™)±¶ﬂ¬≠¸-Õ‰[u!K÷ı \ E™bî#`<ïóUx8	d}@û+îÏK
´kq∂~;ƒÎ◊Œ1EÆé*‹JÚ;Ÿ@áM‰Í√Ò¨á(å~Ö'S¿[qüA[ÿ≥wI9\0vñ«—®∆å–
≈FóëÑ04XTç≠A∞ÛÓ√>∞¬ÏlV\lüíd∞=·ÅGñ7~è¬ ÄÈ‡≠eRí@I˘+-sHÙ¶Ñ˛,9‹dÒ•cù}Äzîä—Y√Ûâ^∆gx£·Å4pΩÏ ÌuE·E%*djòõÈ[∞†ï«z¯ºMñb≈/∞≠Õ∆ÈÈ)¡Ì älÉôùq—vÛáï˘-T◊æ™ß˝EÍÆØÚ'¬∞¥≈Ã∆Ã*“Z”$5¥»ö‰ÙÙ§©VÂÚJØ•%æ°´öÌIXÕê1 ±C˜>ÃÉ:§v†õµ5÷Õ¶3‰M¯çB"∆<;GÅÒ#{1FcTzPmÈk Ã‚C˙(q7\_Ú∫â#˘(\Æ¢!≈ËÜ:ÚQ∏\EC6°[˚â?Ø)Z—`üÃıe3îŸ}Î®IùàÅA‘Í>´∞q÷ëƒq≤}hÿ´≠¢/‡>¢Lî°!±«“yö4wΩ¢≥©SV;S0]≥Fe‰‡è.W"2¯≠˝,&ÿ3∂Ñ≥©˝JD~ÀæÉW&:7¶Å<¸(òˆÊÈCÎ™√Ñ¡.ÁÇÃ}Q
Ë∫ ›pâºä#¯∂•sEÂ5W∏Btw<√pÑ7Å'	\Õí/j5ìê˚ı≤^FÍ¡πHJj^êƒî“´J_;J tı®–o#Uñƒ„æÙ∑®˘97Zh]ºQM.8ƒÇcÔ´B&"∆CÂ†cÚq˙<äŒWŸ@amÆÉRKíaπÄÑO“8±§çs≈£ è+≠/,;ëØl3ê®ﬂ∑¿Õ1`	ƒd}¥€m«¨Mº∏t‰@çUb]Vc`uÛ»¨Ø S≤.ŸÆ◊û¡JO2#√Çl¢R°•UzoƒÇeñe»∞©ÛWôÑÌ/Å¨‡ëÙÜHÕX„‰s$X›∆‹ã¿V[µ¯{∫v9>˛ 
π¸‹^Q˜(–í±_Õ«´ÏçÂı6ÔS‚¶Øƒ—Í`íx>9/ûÛ^}úºÂ¢‘ö!˜TíE"∫4iy§Û¬Ú]Î4ÏÛU"@È˚ƒôå∫ÜúHñ:z{eÕäK…-&CÊ„(æ”ÌÍ∂–pC¨›yõ@˛º¯§ñ‘òz~Zñ:‹ T‚ÿësl0ÈK≤îàÀƒp»®]Háˆw›C£I3∆ºæ†º˘$F€Æw∞rŸªvè?R6ÍO;›ó«:í◊ø”ß§Õ’˛W¯¨3ﬁc»•
—(AﬂˆA¬√h:#óˆIîíΩ“∫pÎ<–6Íjé∆òÙ\m©ï∂¥O´X€$ÏΩ@πıL£lÿ∑|Eê‹kÑ…ù√Ω:Wåp–IŒ∞—´Á∆úmÏcƒaÿ¯låRîF`jqjç≤.Ûƒ`‚\†®≥c∞¡ˇkÙÃ´ÒAVô^ôˆ@r“6ﬂk4‚≥€n.ı§‚s»⁄&CpYœ Ç‰ﬂ9yÄÁŸD“÷GZƒûUn∆AÊ|^ f7†]±é[]ÄjﬁCÿÜö«∂ÃóIŸPçqπgäè.√î~íx–h&¸Ë ¥§é0w@ÀòòGôÕƒ™√ìü√>©(ÎÅ£·nu√UêÀ;LÒµ ÒB∏◊¡‹eå~”#B'ù∫LúàÎ»‰ôIõÔÖz≥y§´Óx-Ÿ2;ÃÍ¶ÃÍäıŒóﬁÆ∆Ûèi[Fªg∏ìhlÅ‘Œe–‹±XßeÁ≤˛ôïç,yj§˜÷ÇÀ %q˜ÏåŒæÒ;1ê’@˘ßÍ ëˆ˘
$ø«‹Z Zæº`ÔÜ@≈gP.-’¥M¨U$Ä¡ÇnÇ+îGd∏•9s_Õ2Vì˜í◊†‰Mµ…k_èÑõÀ0y◊Eí¬ÿZÎÏwÃJ∑˛öQÜCöMã;‹±7≥¢LŒ/‰œ©ô1ì–›^g(òÌÁŸ¥u6ûÂ≠bb‰EºßSº3pºsy	;F!)à9°,vË–¯„ñùü0‚‡fïﬂPÂ7Ï¬∆a†Næ[î"t⁄∫√DÃIÙæıÆuKß◊√L{#√7¥.ZËhLÖÜ≠W?Æøæ÷'“ m )óÓ,.ﬂ≈qjØÎ‰pûµn…ƒàg^ÜD'ø‰ΩP‚›·M/*Œ úïí É%ë
dQDÎ<'5á€Î⁄¶7í©7ù€ëÜ3°îﬁ2uh†ÁÆEJd.OW7Gmmo,”9y´í=ŒÕªπX¬´|}Í´hu˘Òrt<m›t3föâZ	∂çdê=Ùvu≤l{;¯ü‰¥sπyÎ œéÍßxÙ3¶^Æ}«^v^tvŸ√Ω£gÉÈ`ÕÉŒÛÓ>|[aﬂ≠]’8∑m4Sëò(ñµ;Fn⁄õõx∂e⁄‡[––ôÉ_ã°rh∫‡<ø÷y≈¥Ø7˝åØNΩw∞là‰∞4¬LÄ3Ke5≈aâü∑ÒlÃAπ°⁄(o"Á±aÎﬁÜ’$Í¥7ºÂﬁ…ú•Ô‹„†ﬂÒ0ˇº‰9&Ú‘Å*u†ì˝ïÓ+˛–÷Ü∑ˆëç»™jågK"û"û$î£xGÄ'|Ø™»r(eÉQ1ñÔÕÓÓ„Uˆ$"m˙O›Ω'k›√'d!◊^ÊÌ˝Ñ'Gô.Cdò0qQW y-ó-ª=àÉ≤)OL?*Üp›ªÁG¢˛X¡®õz◊Hc{ãﬂü∑9ÿR\¿-µ$CoñYﬁ"üü8◊>B»X¿≠∫±Iw≤º´]{=KKS~tóYX^Ï˜9Ô∑–ßÕHtŸXy–ÓaıÊäãKÅNŒ£ÊÕÄ¶„ä†*q¨]¶(≥iË‡i	ÁœG‰ÿy6˝Ù+≈˜zçQıù‡ﬁû«9∆5äãm#÷Ø˛p)#z«zÓ≥⁄—±féX'ÈtV∫+˘l±·øL˙;˚Íó5ÄòÙ˚q(ızÒ¥‹±L60~PóÉxÌªUròöé£$T qà…	jvÕ[Óí2◊.Ù5ñ: Pˆw~^Ó‚Ë™‰c¢–>ﬁxn—ßﬁÅÀéMïdsÀGF‚Åu;
“øULqSºiRØförÔÉ˜Öëúﬁ∏ÃFß3 ‰˜ü7`éˆ€ÌˆΩ5l2pÌÑÆTÈöë~î%Ê£Æ$!>¯ÇZhç˚ä¸êøØIPÁã– ïãæΩm.ÔRE]0rƒg'qŒÔ›mVëç8Géö|åóŸ¸˙“H÷.äÒ+6o≠\±gWx∏Lﬂíºn¬9ÁÒ√Ò /2Y7/¬jÙÉüÖÆ˛ôõÌqN_ük<4≈?&±_∂6¯.£:ñHNíËg£Ç¬#BAì¢&†ÿT©MrÑ÷3JOIÕ¡)’‡ŒÜ›Û7ò·s†æ%Úﬁπ™fƒ´0ËR'Òá ìxÁq…æ:{
‰≥§¢…ëJ:•ÖëµÅqÂhx⁄∏?M∆…ê.”*Ñº,v íNH&°bjœ„¥?°•Ñòñ…	4%+∞"f)P“(Da,Aˆ
1Vs⁄°≈ò¢º≈ñÆyL∂xµ¡e|ÚFn÷c∑D…*˘-$˘ﬂ«°•˝üˇ„ˇø& <K˜á®‘•ƒÈ7`ˇye!9ñ≤"6Çôë2\ÈõﬁÀ\ÅúBçƒê%IfÓìLê9ä'34ﬂA	”∫†‘ï“[ä£o4ò^DæÙ…€5kœ¸ªGYz<;õ$ePo`)œ∏Ì¨ Z∫x@`®hÀˆâ¿&ãG\	[»‚É¿"“ÿ˜)j”˜¿Ôi0è'uÇb)Ì‘‚ó*°ã?(9ŸuÄŒ)–à!ŸG=µ ÿŸ8ÎçÇÁ˙y\Í•ÉUú 
J08
ΩTÀ ƒô®‹eàõ„Û%¯y¿Ωg¬OY†®±µê M¡‘— ˚z~2¯)·9…⁄æ?‹;á,˛•˝ö„ Ñ‰÷≤„o®§∫Vä¨Õî¡–F≠–›‰Ó÷Â©π]ãàπææº‹XxÁk‡b9∑Ó’ÈUhÉwi±áπJÚqÒË»P™B2ßË	Nc.%põ¿u‹∂ôé)“uÆ¸πR‘GY ñ€§Û“õ€Ÿ¨$˜î’¡Ú¡≤jKLÌáæÈpám¡yO´®ä94-Æ»-Xê[ÃS?— l8ÈÛı°Î¿X)˝–Zîä®^já∞7J„Ip¬À.‘R¬·¨’5{g;iOª]	/∏ÄüŒdƒ'aãK	"Fîëb7.0§—3äÓ]«¯d!⁄mq Õ∏µÔò ëõÜJD›”!ƒπÓΩû0»“ãl¨Ø˚¥‰5Û$>'¿‚—∆-ã†≤Ö?◊êYTt–°‘R%U_1-f €7¿xP(Íöœ„|≥"¨äØP·”)UËMH±RI‘,¶T¡Q™<IÁà$∆€lø0	ÙHf≈)“Ñ;(JœFIÅ`3T∂üÙ‡&E’ãÈPâ…—ÖRP&2–åØÑ·+‚)b¯„≈y5OÊÍ≠Õﬁá‹ê≈d[ˇ‹¨–1 ñ¬k{iÊØ—Œ)A	§hR¶ 	}¨3À/Û˜» ⁄PWZÀ‡ÒâÚ™°o‰VËJeﬂ˚¸Z·¬Í?ñ∏πUqè·áL¨w(ﬁr¸0˚møF·g!—æZô'føo ¯©ª*π~§7ç•Iı+Âl¯!”(^Ã2H¨ﬂYôÚ»Àl‘<[±r-8£’EÜRÛJπO•˜wy[`’¥áö1ö6wO'óyÚt¨ùãÎUvz•Ω»D†__öçs©qÛY4ç

‘¬oÙmßòJ∫Ñ#h5ÆV|ßÿ–(¥ßúŸò„>u™µÂ¿“ãÒ÷å∂æÎ˙ç9éKaSGﬁæúìµç{∏Y^Ç˚C…:åÒ(:Ôaeöˇ#‚"DpU*ü:øΩ≈32’ıB|K√{ÅßÁÅÔ‰`Çû
∏Z=F¿˛Pç˘äÒ∑uõÇü†+^pëósœ},[√SJœ# ]Á "P>Ê>` –Ù¬Œ¥Éìß«:m≤»Ùcó9≈Y<∫9@ÊW[ …HuEaLio¸¸™¬á œX¬æs⁄ö”‘U=\∏^ˇÓ«∑!3Jm›Íõ∞BcS•/¡œ=êS‹∑ç∆˝VÀÁãébD]—lœ4È«Z≠{kº~uÖ√œ:Î*˙∆‘(æÿπƒ˚ÓJ“Ù£∫3ﬁ°8-ˆ/òm|‚\5˚"÷^∂âk˛@b6<ÙWåßÇ>öRÌ¨(·=yR⁄ÃÌ2;¿8±gﬂ 2p∑±r&Ÿ≈¥Ê.÷JP^√ÎrÃÆ÷UâöK©áP£bŸ$¢pŒd˙, ± 0iû“ãK0°x#π∫ÀƒÄÿk=ã`ù≥Åé™@q'uAt†∞JÚ0%g	∫Úg„YòU®·=ÖÕúÚsŸÎ*wÆÙYJª∂÷´…oÀ*qÆ·=±7ëÿhoòsd^Á*7Ì•|î‰Ω±b–7|ï•∂XpÕ5ÄcØ¢d*x°Jy¿ÎLΩëML•Ám0ñÄtctÀ
Z/zºf5w˜"Zc«'q:3†Q)†—®LŒG‹h¿á?Êˆ∆KÎR√R˘†‚´V„‰qøìæ«˝∫ZÆjQP7TQ∂B@Eâ€™éQ5r´‹†ﬁ∏µQ¯<|.AMpÂi,¡Qí·\∞Mì√ÂÆ∂·˜ÿ['ràÕ√V\ )≠ê,!√ŒëèBÖ-ƒ&∑ÊzõhhS
î}2¢2Sh\PÇˆ/Ñ∫RŸ∂$ aﬂQª!¶¯«Ñ!¡/	Díù^äúÄëÀCFÖ⁄πº5◊ºËÉ[ÇÃîU)ô¯…üb$‡¸bm”µ¨œ}
0°∑8ﬂ°Ãì∫W"™˚sT∑Ów;$=>È‚’Ò$Ó£<∏ÉaÕ? ˛R¿˛I13
B˝IêØN-yt¥Pkâ√£„∞˛çÖEÈœ	F/ßlçuê¸4πí.	KZû∏,È0æaX™Zwn5!úÔ˘Q¯„¿€>wÃ¯ôo∆Ö£0c+äØ«ü6oøZ!·ÎGòÚu≥,G•Ïj+3$W‡tPQ‰"é0ÙêhqûÙÇÖÆ–∞à„X‡Qïí~æ˙⁄q ﬁZ»πo≥ΩEvg˜æÎÎ≠—	˜Cî◊ÜW-F\¸Û\®êW`òˇ˘?˛èˇuY)¬•ìﬁW÷óádLÜj
nl¡æ—Æ~ï’OΩ∏è~ûK;8nGQpΩl \7˝–±•b+Beê‹X¥àœ¢¥$]q(=ƒGT7œÖÚEÏ—∂Ï}˚ôo\∆Hb* Ãπ<!]…„ˇWô;T^ ˛‘•MZµ ÀæEgE6û¡…Gd7`ôM[kõ¨•Æ.ËA¿Ø÷1_™ñtM´ÜS)Œ°∑’D~¯X«‘„ßñ¿è†_&Q:ã∆¥+|SH'ªÑ⁄hôÁNÕ∞å¢R ]¡<mlÒ¨µ’ìê3c¥lúÊËé~aöÛÕ≥}(-s≠∑q∏e˛ê<„ñÎå´Ã©]˜®äπ-úÍÓì
t¥!Á+ÇV‚ñ√{àÊ€™3ÈíV„’∂‚züÃπ~,5÷◊¸s<ÎGCt.#Ài÷Ì≤ççˇxpΩ≥∏†Õ∏Áí¬GπÿÕ∆XG
ã)˝ø‡–/∞t ∑\ü{∏S$t9±iÙ&UÎ;™ßU£©≈=ÛÙPpñΩØ]z˜%jŸÁ©a™é5J—u5.ÕW"'l∏E.ƒ∞5‚pJ†_¿·¨‚.yÂ_ﬁXƒ›áZ]~ÉEàM}∂å?∆#Í;˙h¯‰•~∞Ãˇñ1	g‡˛ˇ˚˛_ˇﬂˇÛø’ÇΩíéAO·æü
'[œπ¡Q⁄iW! zû†PT‰dÊŸE±V"˘*Ù‘gQ2™tˇ≠‹-ÄB⁄ëÄÇ’€£ô#·=/P®ÅÖ¬UêÄscÄ8ÅÑ*iπä≠'+özvò¯Hn≥nﬁπ¬„*¶QZCnŒÛ¨Æ≤Ö¨µ« á2Æèll√ã»±∏KÎΩÓxVñ–U‘ Å¸	•é¢≠™;Ky¡.'@ÁmS!”1Ë˚ÀèJﬂ∆Õ@†ˆà~jãØ|Îz_Ç%¢¢Ëi{©$Bg∏áVU™a†®JÄü˛Ò∫Ï†‘ıOÍ∏6˛—ÈªF≈óî]ªn¥aYΩÆÁk#òí`T˙¶?.Q[òÖ‚Q◊Ÿ&Ò@„|S3;Ò‹‹‚6ì4Ø|ù°Qùç~*4TpáˆqÉüGhø‡3dº+îR˙3Gîº$◊e£Yü◊j9Jπõ^∏#ÕÑ‘ªë‚ßÜ(¶◊Åkø˛Ë÷‹ÄÚ3ˇ&î«0Ωâà∂ ˙IÅ©∫˚;.∫f7˜vÿF}v‡t!Ñ?Ñ«§'Á|Q* áà·ë0ÅB]ßÙ∑¸∂à&ŸÚA¿Ü6Y≥naÎ±ƒΩì<*ÜõÚ"æSyã‚ïw¨.Q«	◊æ¨ﬁ¨qC	7 />∏Í¡∏BjxÌ[®Vh»?<ﬂjÌJ◊EëÂ.åWO†í;Ü≤ôŒ-ñ√} ;f1·$~>â«í}|û€‡K>M<Wg=M ∞ˇ””lx\TV_–?≠têUÿm»œﬂ∞¸ô`ôRJvPÊŒE¶ÎAgì˘˚í¯ÉVùêΩÍUHE∂Ñ%∑U¢JB´W∂Ó¯&€ÏJ=ã27˜Úπó
…Ω`PÓ†èî'âqÃ†Li—Õ@xv 'óYÊÓB˘{˝˝ºMÛı[SPL*k‹ÈΩ⁄|≠&(5!ÜÃ¬3|∂‚—ƒÔÖ≠e˝µ±ªæaªŸªî§˛››«≠çwÓ≠°iã~roMÁ2êOçJ	ß:Eë“Ω…tú]ƒÒI&‹Stñ™ã˜˚:=üÚ“ÓcÃ¿˝¿Lrfú3_àlΩ’≈WÈŒud±Ù◊√∞kﬁêœµ˜∑’ARt∆yı/¯d)QS÷iG‚aWŒ•¿ÎNñ·°cˆÊµÊÁŸ	Æ„∏_ì˜
?ß__™Åpü>ÆˇDÌÖu#-˜¬∏ømÊg¡ rt∫∆ã:éïP h6ûA¢∂ëKÅÉ±Ñ÷ê]/˙+{=+∆sœ-∞®Ø≠çÛãµÆ-ö
∂VÃ‘òŒä°Q∫b–ú)dñ˚À–,ÆÃ¡!≥ uà, C-z=¬ñeRΩ¶ZÜ˙ºÙb•mÉu∏ºZ1ùkÕ◊Ø‘D0KéAóSh;Ωö?˝ÙúsRBÕä8«lP˙h…PÖŒj∂∂∆D™§1öéät¿∞H)áfëF”bòï È@∑pÃ¬&¿£" ÀB)ô¯°“8!òüÃM“EZ!
hhfLëÌ9‹´‰†·,]G$\îËèÁ˙`¯«bª‡È\›ù'c@;;51’ÜÉ«@MU"ëïªp¬ §^ê⁄Ä2ñé‚x  aL èâ“π–ó%Â«Å„Ö¡è√C-¯ÖÈ9T;.£ÛÛeØ–ssÓ´2æ¯L‡Ö`q√¬g7k]ê3FZw{ò_‰˛0À$Z◊•úéé†Äf@Ÿ[ÿ`Ç°˝æÕ®∑'zîNñb;;ﬂ3âÕî| ëåqıÒÚÚ›‘y˘:axP9?_∑Oh‘&nüã—òÃ$◊«/ﬁfGq‘+€èÅ^ﬁ{KâÂ’	™Jd°¶Sƒ⁄Ã˛ ãüÕ∏›õÂ9‘:!9^ÙOOûP<Èá’¬Rwx2dìò ÑCæi¨`"°k˛ôÿôQ=∏√Ï⁄Ù‘¨jU∏{óÂ}øñxQUÒ,`¯2∑lW˙JûE±yr:‰dÚ.Œ¡Ìè∞É|£˛dêJLÏªXÈD0·^B⁄˝]¢v§Û¨ƒ‰£‡k(ìÿ®p
2⁄,'“π6]-NB.å“≤€^ﬂË¸ét6π‹Á≥≥ƒ 78f∑@£@ﬁç⁄éLîç	1—7›8óvßq.ıfíé"
ÛÊ±Ü§HKŒÜ¿uÀkãF1u+"úŸtè⁄‹©Xgï4m¸£a·NªU`]T√yLB‰Ê⁄øãÔ◊´È ÓÏÍ∞∞#ÃY”FhrZE¶Cìèr†*SÃ¿ááòpo¶Z∆/·Â/I9§! ‘¶/ëhVWC÷Â.{wäÄX3=é6˛ÙπJÑQ±·E2‡ﬁ] „Ñ*ç„˜ehêrûGˇ–Œ`5óËÇÅ	•7JÓÀv≈÷€[l∞£tÃÇ^“˚WÎØç"∫McIÈüSËﬂˆPÙsÇ⁄Ì9ªD°ø Ò"$ ÔA‘ªÄìÁ	ê“ç—t ﬁalˆPé«ªËBµñgòà—⁄±«`®∫è˘qJ\ CÂU∫If˙LZÏÎ*B˚ùrõÈ»W˙µh∆nO—w´(∏r}2ˇmœ(UØÿ}Ü«Ÿ`˜_rH&¶T\•]≤MéC?è¯çÜµö∫’2q~∏@`‡∞HÑﬂê@˝+@ıØÿ,è<Û"9ø0€r/˘Œhfë( «¿ûàôtÌ6n¢y9ò®…Måa{Œ≤.πUòåóU◊fpá+yDNÊfŸˆ∏	§EB7©ù,wvåßñ)™w¯O3eµp‘¥´‚˙í=Ùm‰Kp-õä[§ïf%
&·Ë˜≠ı‚`ÎÜ5/áó*ÅËöƒ±∞OÀ®ü®`/p>NÚ¯%•èƒƒ&j◊ÒåF—6ñÂ¥ÿ^[ìks.Í¥Y6ÄﬂÄ‘÷oπ˜_k•Éèf’Zøy˚«~ºµ~Á«5ú"cônMÙ¸+†«q4û15¨oÌq€n§^ *W∞Ã≤÷∂∂ÖæEqQsVè“˚¿(Œ†N4¢DÙIZF*MCÆñU”'ΩÏ, dê¿“¬!à¶HXD%=ö7hçCC£'ƒ⁄ÙAé√„˜ç	n∆e¨'Ôá˙ "ã2ãp<I¬H[êy£ä.„ıÜë-at|ØµeÔ‚h‘2h[w¥&ÈVäÌZ=∂Ÿ1"üñ3à∆y˝'È€håFJäjÇﬁH€îI@Ö*˘P‚ıÎµdú‘2Kfézæ≥Â©?äì…Ÿ,/bû„ègõåv†Ú# ëâ)å Dz˙ zÄb@î÷#E-£}∆,¡ù¨ÕTÒÂ!Q&VU^Ú–™`ûxêÂ€c$üõ¨ë¨M2ÿ⁄m©x∂+Úó@cÀ“VÏKª¨ihË'è{1º›ü∂ú4$Ê•ÙÅE{ñM˜"«∏√¨ÃZ[[∑67o¡?≠€?lﬁ>ªy~~gÎŒ˘Éw;ËÌ)GqÔ¨ ¯Í∆)zx©eWTM¶>Õ#Ió†·dí¶ir	~¯âπÁ†Ê’áN«Û4"îIâ$_Él~ﬂÃ(ƒ£—{Ãõöá∏h)ﬁ®Ïø-·„äá8{3CaΩ™„" 1Ü¢Qëoke¸Dq÷üq®°¿§™™•´∂R’†ÊÊ±¯¯E èì4J€D› ;(úYuNK£≥˚|ˇ◊øÓÈ¶™…÷+y´DDûÿ…^bÉ∞„´ßHª≈$KõZ≤‰êg∫L`nÜù˛[\è/ôâ¡}Ël9‘ƒ˘-+Òß!ÑÙ)qFOÔ≥¿‚◊G«œ¢‚H˜:d!∫£ãØÔ‚	Yg1L1äÅú√p∂Ì⁄|Òø8T±_ÁOÉg≥0>Àˇ—âè2‚ËÌÉ,ÏfN`7=!¨|¡è\cˇŸ?¬û5Ω<ŸoXËF0.ü◊p@ìcëO”e∞œu√≤XË PÎEÇù÷MSÁb≠⁄§‚vóú,y¢r]	õz5’õ∫Í0˝`eÒ‹ØÍ÷0vCPoÊ#XY<Ø´\5n™Æzµö„Ÿ<í¸˜™ÏÔ„ ˘Sç‰øæ  ˜ÓÙ8.±‰Ìq>öïV/Ö”–• ◊%uoÉ éíﬂÖ≤«õ‡}ŸË≤HøsV ª˘e–ázÕq∆k8[+õÊ(…ì…ı©DxO¯¸±XeSâ∫πèaª¿”∑B¢î∆m@ ìƒ1ò¢áéÕW√∑€B˘hJ1§¥æ”¿Íê ÖmFôRî∆ÈS)c+ò˝í{F˙4ΩÍñh›˜r{◊Oh
7>ûZysIµ≤≤™^ÃyVDnÕÄ§ÆR˜¸jlﬁ™äØπJÈßÓ9◊6|A@ΩœÂi¯ï¨<®uT~d9@ÿÈ)|)P%û%øS∞#ëSáﬁâ◊‘Õs(”4Õî•µZgyÒÇl»Q34∑ŸÕUˆ<Ó'≥…6€\eŸªm∂!U¢∫≠uΩN∑{Ù‚ÁΩ]™€›;‹›?|Bï·ÒÒﬁ±®ˇïÜP2Sx›∆!7õ—*;≥L©)Eºzx¡Ò£Ø%GÌô¬«¶5±Wgm˘˚µH~“rãDnëÄ∏±bP|)ÇC2V	¡C0_Gˆk∑SÿvÄˆ-CﬂÆ≤wh1ë†ârF⁄.B ®S‡ﬁ M 5U¢ÅÎ—¬“tï[ö\≠≤WbVü‘kgO„1fDÖ.(ÏNú¬oˆëéG}3Z‰Ó9â«P˘É¡!Y3è‡(œ∂XÁ˘ WÜéT5Å∆u'ﬂaMÉ Û·v9{'àh∑“GÍÓi6C`‹∫ãÉ?¬'≤ìR·/ç∆†Ìç™·“,ÿ^áÊûn^o≤jÜ4r¢¨≈€ª±bba´<oYµ∫ ÷˘+ˆQk¬Óı]6çÊ{Ä¶„%`î9c´hü
Æ©[ìöØËûﬂ;?è{e 5ÃR ÿP¬xwfÂ+KÒ!,ÓÈ”oír]^áH5xßó?‘'√ºååŒ†î¥"†*mn˝¿SdÖ≠tÌ§Ëä≥KäTCıé£m•)¨UΩá+Õ’ÿ◊T”∫˙y*ï¸s*/Áˇ¿Œ)›Ñ-\a•ofco˙ÊV†ëâaz‡≠∂æ¸Á}_w≠çGMÿ°Ê ú=v”p¥‹≤∂Uj’ﬂNÈÌ†WèY%‰*∆çÊl—Ò®¡º¢Å˝y†ü_¿ﬁ°Œï]“X°ƒïûœ™`JIÚ≤5ˆ,õ$0EEUŸfZQì˙Ÿ•ŸKTZó™d·sUŸuÿQıÿOX±Æ∏ﬂiËÙ/äYj:‚##L˜dˇ…I}—mQ4*∂U∑ı≤¨|BïÑçé™·óπ≤NÚ"¶$¸ÛëJ¨6e˛∆<FPÎïàXP˛JzØ5®ò§ÓXèÅòä”fS5¸g–√ëîUJÑ‘x√ê†ôo©œF(è††¨ÅIËÀ
ˆöÇkRPŸP&I¢TçÊ0∑°ÒÛÜ9ÿ–;>‘‡´\’'¢≥ZT0˛møÔè‘wP-‘X˚(É-√∂·ùÿy∑∑—ºµ?v;ôùßs«z¡‡eøáµ(Ä5gD*ùÕ‡Êóí…ú…Ós2…/$≈ÏDâKâ™6ö¿Ωò°,Ÿ‡va≠ØÍNV¿O‘ÇÓCQu¨ÆU3|˙Ip∑ﬂõ÷^$ˇ‡)™˙Iö• lá¨@Ñ°m∑†W¡Zá24ùàp_∏ìRè”ÆÜıï—¥lÿ€Ó˙ïæﬁ*_wÖ≈Ã·7~:‘—ƒ¢l+‘„ZÅ8\áÌÕÏí˛æí‹£f1Îl ∆ÿ_ävXY:æ@+Â‘Tà√R…}pﬂC£<:ù–ë0:û'«¢eöÕ“GŸ”	õ|,º”Ó=N‚±êî‹óÑÜ‡¢‘ïŸÏ£A•}¿àN¯[µ§≤“+‚ƒ^4J`
∞FVçq±ÆTçó¨MùÑQZO¢o41o&fwsß£ò“≈ß#3‹Õüä(©ß!Ï ÁNAv~Â¿ñ1,rDÇo©épÉÍaPv’ÍA\'®>ˆ¢–¿çY;)v≈]wÓLHÑ¯Öõ§º¡ê!≠ÄtY,öFœvëNØáÍÂEIK–ê≥Ã£Í—X_°‰≤l…åaÚÅmj˛lâÑ≥◊jC!)q“‰F»9∏é‹¡å¸78ºèV…çù¯k6L±·8^«Î¥^«Î¥‰Æ„Úm\UM-&\Ú|Íüá3tO$….*p_pÁ`ÀiY„ö¿ÕªáÃ“s®ü9”07ñùÑmìS?≥õä	ÑavŒI„≤Ï¿X˝»MÕ`’–›C2g–ùÇDÁsMÂ∏ßjsaûJ-wK™3Jï’S·6ÁNwD\≠–Y[ëR¨≈"˝ke·©<‘ÈvóÑä≥Ï∑_%Få^*&¬˝ÖÂD‘Ø≈'≤õı°jêÖ‚…|öP¸ÙÌ°iä±‰F8fı≥∞:˙3&tãpX0â∆Gq:‘Û9∑_Ãùí”ê3+ap'Üu@âlm˚«!Èw„≥r¯ÉRÓ|˚ÍŸ|‘E?[“IS á{ÚäMŒ√∫F•˚öîoDfcëö«ƒfwØtãL±Ó'ø©/h‹ﬂº‚‹´õ[ÓFŸOﬂf…B$Ö(©áïà™Û∆%ªXn`îÓ˙ßhLﬁÓÀ`•BUú70›≈PùÀÔ9“±¿8ã¡´Q≈9â0Íâ˚r!»ıö¨ﬂ:"'§«∫∞EÓ»†yd—Âñ˚$*FãÈÅïXiﬁê®ÂÂÛ(√@q@Xú'„Ö∑ﬂÆeÓ}œz3wﬂëÂ%ZF«@[°Ûo5CE^≠ø^
v„iyóeíñ%˙Ò4 K‹ZŸ¿¸;≈≠±‹6Q íÖƒF≤®…ÿâ Ûy:Q∞vp§s7Â≥˝§‹fBú
ËØø¬˛K+”ˆ-ûË¬‘™ÿvﬂ∆{°≠Æ|ØÙ”+a·q?YÄb†bŸ¿∫Z≈≥≈ÆUY¯∫WÍ*'ì§ln¨Ø[◊+µQ∞ã {ÑÊü$∞j-8∏'{Ñña}ù/ºœ«}ôò,
ä◊ÜQdH$oîÊÛein€¨ßàNs\^f‘cû.êkó«34$+¢MGÁ,OgÑ°N¶q:b∑"œÚôåÏ≤ &QΩA
^Œ0÷a∫JIÊ…d`’H£ôÂ>,ß8F_˝ÊI^í≥6\∞€ŒiP^DÅ™"√Ëïà¶Ë∑Ö‚Ÿã@¿&£7ieë áÌïëÒ¶k] X‘åƒæŸ¸ı ñ¥f¢x.´_.˙ˆJƒÔaSã∏¶D—∆˝Ÿ8ˆYîÛé˛X+hyw¡‚úr	ß¡H”¢êKF{<Ç÷Ô'´~gPp’Öl„∑Ôë N"n[o,Í6∞h—¯¢LÍ`‡<ô3P‰´ﬂrﬂπ–{AÀ‘ÕÑGÒü◊TA§€π~JÊ∞∆„Í#Óœ\Ÿ?+ÂsX≈†J ß.‚—í∏Ú9 Ωxúç#¬óÉ®à»ÑtïΩâ˙Ô¢1«åìxú)¶ƒ√ƒ‚øÑ7•ñ1π\DIYç/œ∆≥?_Œ¡AuXNÃ∏%g¸ë†Då`∑åí0ˆ¸Ë`B1ôÎæ)?V– qÉé0˙* G„ûƒº·Äqe¢Äç™˜^$˜ªÊˆœ=¸ÜØã:Ω\jn«k Õºq-®P1™ |Zkíù!…=Œ"Ó,∂ Œ—PBÿósx±4J’@lL2˜mÃ\gMq¨- \˝z:√hB◊EjŒ°óËV‘"Ω¿ÀbúL[ÉËçˇ≤n´_ﬂ5~òÙxèΩ®7l6π˘OM8~˜3#÷ñi?Öº&ñ®Â3ÁI”Uø¬î%X@iJB/…à!¯F+oÉØ•h®à•t‡⁄√pÔ\çze(±BØM›PpΩÄäæ∞U°‚>7Ë1<K\'!·ΩSR÷–K-Èæ6ƒàUk¨ƒv°˜\Ü±-ì
Øáñ9U êî¿ﬂ“ôQo»[¡ëu¨x“œvŒ`‡µö+;S"≤bM•#¬∞>(p%ºÚ‰ÉÚŒJ/Xî√Mèò5|Ugcgöÿ}ÛKlï>∫1å
Ã±»  >óà>î6
≈8jW=ÂGu∆R¬Õ3Ó∑{≥¢Ã&˚ºGW÷.‡ê8.◊eQŒa’V!…ÓÜâ¿/«gËîñö°∂∫Œ®@ÒVŒ©¢tÕ¥%mµ$ÑOÕÕ±5| ÜKº8í^9‹SÀìõπ^Y⁄~vúöß
$1‰¶ûÇNÙEØö“S;Z¨ÍrÊ‘Æåãvª}Í	clœ¶¬L‹Ÿπtæıπ®ÄAé)Öï⁄XŸ”˝√Gø~}©›÷Ø‡◊Û®∂ÅÕÚ&}†üM`çæc⁄sÂÍÙÆ”ImPN_°À+¸∑¸Ñúá`(s¥˜ÇüÛ∏ˇ¢*¢Ü YÆúEΩZpâiãñ\››Ωá'ü~y-˝Òª≤|
pz:håôînr≥π•K<è‘#«$ÊÙûü>înˆË§ûLÄ∏™=ÑtâH∆èà˜™£àá≥”«\‡ü≥(ü…pÏ4PE˚‘é„&ÚÃÁ«$ˇ1Ü0yXÑ»ªÒ\«|{}çD)ä”7≤‡–æhW›´nïπvï0∂ ¨k–πß°y”∏á‘Ü˚ƒ®çÁ1Ù◊ã1¢%û±Ó—1f‘˙aÛvk}}Eî^	∞\6Ú·ˇê+€ª?C◊át˝/x!‘‚ﬂŸò"x¡5Ïπÿ±yu£0ı£Î±ﬂà+C6≤üµ÷Ôà6-MÖyÌ4Ã¶«^E©ñÏ∂≠ï∆§ﬁﬁŸœz81c∞<Ùë;M]Ø:ÈC ÒSÛ6ÜRã±Ì≠ÑÜï6∆∂m˙7µu/œz@{òB‰6Èª´‘TûH˚ªxU”àÆVhıé‚sÕÃk∆AÁπ…œs≈X¯Å>u¥<ãçg˚‘=ÒWÂ,ÎÛ*Bá%<ÚPØÑ%õê¥µPR$˝ò"@#»c¡Ck¨ô7◊ŒàÓéﬂSx\·–ıî–ÂZ7°+0å‡0ke”m9E…#¡Æ“èß¿÷¬¸`xËOÜ7Ø¿]~ærΩn¯!«¨∂(£Qå^7¬íÕdÿ”ì'≠Õ€Îw6nÒçÿ‹ÿjØSnÒOóÅ≠–)Ë
õF¥S0⁄Á≥a4ôD}ˆ/∏w“oj˘±ïIRáÃn£Õ∏GƒíìúãÃê=5ÓéàéàbàPΩíQË˚LB”Ö·ﬁpÇ—£0lAﬁ¶@RsbàZè•Új&≈kæƒ|ÉnÕ@ò’bU{è~ËÜá§≤õ™∂¿∫üõ|.FÙÁ	∆∫¸Ï`Ã/ô§≥…B%ﬂDìŸBœ‚qîæâ++°X,6Ken_Àdë“3»)}[èhÈêë'Å‡ª4ŒfÖÅ__B3p{\±W¸´‹◊´◊s„Û[Û39T/ı‰;]öìMåJH”¬/
å9K◊^∆¢•
"naéW.≤π.Æá•E»(^ü˘Õ6{D¯ÃABÁLb,¬ªAåƒöÍ‹¥Å–äuâ˘ƒ"è±≥ÆËk1 OdﬁcTô¨H@`ø©óy∫¿ÅlNÅè*√(eëc∫h˝™√ª`˝™#Ω`uu–˝¶"î ‚∑Õu§ Ó¥6ny—Jÿ\4Í†»õútùãWÇ–QÅ`¬eL√≥L„1"úí—M¸å®≥égæCa÷ª·Á÷^  ©π¬% °óh£
óh¢ ˘¬-î‘•±{°¸c˛∂p*û2+£q7"ÒåH¿ÉıgΩ∏Ÿ,fìU6ÂBŒŸÑ}Ø‡`’à:¶õL„w«‹u«h˛>¸–ÛpÙ ò¶Œ˛.zö%Ÿ:qt≤ﬂ9 /ÙóáTÃÌÀælÛx%î‚áP˜◊óF‚é¨Ï’Îm´ãÓi~»KCúùk‹≈.ügﬂ≈÷¿|aî<≤€Óé∏BˇV≠∏£\∂wª«ªM≈≈ÔAh_&¥¶ d7	fX=#Å¿ì∆Ì¿ÜÛ%F8Ïp¿QÉ]êëÁsöhnÏe:N“ë˙hÙò(á„rµ:üO¯Cc;ÄQëæ&,rT#Á¯úœª>öÁÌ1ıÄ0≈ëﬁ9JÇ8øº‚Ü“Üq¬5/õ%	ﬂ6À5ænñkCs:_9Ä‚T[{UA|8Ö™„|Öœ<§nùûπÈÄÌ=·µˇe «yﬁnÛJ˘É∏é4›·ÿ%N#µÄ?n{§Äà∂©ÖOä∫fÈ0ÀF!‹·"ãèè–™Eg\ˇá†$Õÿ8œß +2øç®D¢∂†GŸú#†s¢º _Ñú	Q ∑û£Lç/2õ'A[ ÷`øY ˜⁄Vµ$Ø7J{¶òœÅ1ÊS≠!ÚN∑ô∞U˛ÜÆ.ÿùˆÑ<ï⁄få(%}£}s±zwˇÂIÁI£™mYC•Ì∆Â2‚πò∂uÏjä Ë◊7’‚ér†∂∂)0SkX'5ÛQ≠èŸÓπﬁ¯’4ﬁj,kÆ=t¶Í"FΩï∞ ⁄Ê]8™¿Õ>qã’ê ¯˙≤¢â+Î†…ÛbÖM≈zÕ8ÄÕF‰‘i∫óFgà~p˚Ü>·È∂]ËìÈîJ¬/4∂-é∆3⁄æı
~Ybls«ÓÌ„Í`†!˙MlÙ;∂—ﬁÿXAÍp:2"Çêÿaß]`ì∫G/~j}}â gkê#≠‡k™©±2Ø◊.∆p’5[∑I]’Â6”Ñ∂ïTï‡†ø≠áfﬂf≤”mıÕ~Øﬁ6ù˚•‚/œ¥Ûíg,‡¯«È∂vÖÁ˝ÅâìÌMõõq1ú9Â!8µ+ ‰?ÊûŸ%˙≥xó†NenÁ*|¿öIq6E!Un≈ÂcyÈ™v≥≠c3˚≠öÿ?~!í„¨àêïﬂû|ã!+›ÆåÜjÎŸsU…H≥Í¨Ñi`}zè¢â:§ﬂ∞Jı(L¯+◊{æ’ÅÔ.ıˇ  ˇˇÏ}Ìv7“Êˇπ
òoﬁÑöòEIé¢ë¢ï-9V,€ZIûÃ¨7g‘"[d[M6”›¥¨(:gÏﬁ¿Ó˛ﬂsˆ:ˆjˆ
ˆ∂
› @£)…Òd“s&I çèB°™Pıîíe&°a@Òjj^zìaiÆ	aÔ≤ ¬©?39äeäAãè
&wªÍo!\êÛ¢˜g|æ∏ÅÍ‰k≤¢èﬂ0ìçk4+tdC¶Çx4¿©Ú≠0”ÃM‡ëwÀO÷
‹yùmêV«∑Zl ÀÔ|	Xô\†Qª–^t\“œèúâı-Ç¥≠/hæ}Ω{BM5O˜ﬂæ"Owˇæ{ll≠iôÂM∑ï]øIﬁi€¨4%®ø®≤ı ä√A®dŒ‚OM…∞ﬂ®‚¨Ü„J»µ≈vFT—ˆÌOö@|fQÍºbÙKt*˝Wﬁ]Ω,øªÙ/ãa„Âà¡˙ø dhyFCNô]Gstÿ-%∞’ÌU@∞j™¡¢=¶ùwmZ≈√ûX¿»’pÎAúÄﬁÃsëπ@íìÑ‘?@éA^ˆõπ’Ë=ÃãÏ?oﬁû∂òVc»ë–ÜíÇ˘/˝s,ﬁYRÀªVÙ∂öqkîÔ°ED#Öme∞≤L/ø·@ÕÁ¶¡ßÍ}ëã⁄:#!¨ﬁ˛I¢%µK∫jGáp0uOΩqÚ1ˇJÉπ◊å4¸ΩöèÆ<=öánu–E≈Ó5`–⁄&‹“§S´rÉ R ˙¯∆ó3!ΩA#,.\π#‰
®‰â§>˚Nû•∆≈Öµä<ZûI)i.æCé8€n%¥lÎ±“É⁄JÏ≠e-ˆôW3∆æ∂foÉ>‘‘tvƒÄ∏À|ÇÙ0§h¬,ÃTa–‘m»Õ°K $òr9ö
yeı7J%Yrâ>ú#È€({F˚b !/¿¯WπyŸƒØE†1{∑Bì"{“
àYú•ìxÛN«hÓî‡™2yŒÊÁ†˜±*R]Œ@‡¢ã›Œ±ìãèÆrÒç)¸Ãt¶‡êboOìg4ΩŒ∂“wgC-VÀ≤PÓ5jKØ‹1¢{X
î⁄‚I`ﬂe&5|<¸9∏ıc¢UU≥ò—Äﬁ.PDÀ	 GTRC ã[PA¢ËøÇ)áé…¸1%X£D˚ßGâ<˜·°êEi ñåC’pÕ√Ú6ìbˆÛLzD"‹9,˜òÃﬂy»Íå5îmã=µ≈`€ê*¨¯vT
[î∂%∆÷ÛmBõ0bLÿê%l!ø6	'vÑ1¬ÅaAá∞ÖBW†¯F‘÷É·¡äÎ`	Ë∂¢0àwå√†Ùß*CìiWﬁ~%Ô $åÂrù,ø´KR™≤7	∏π∂gìu≈
f˘€ Ú5ºI˚¨Œ≠·¥}–sJÛkﬁC|©(ãH:á˘2úúqƒ‚GêKÇæ8
RíG√‡í¥ÄëÇÀVQ7H#£ÈÅ0 FXú”¿∫Esó!ª,¢©H˚L≤√lD,ò|ö¡îÆ«¸–]Ú)ÿ§ì:ÿåë;∞E9≤}ùƒV	±˜ñ…å—˚vDÄ

¡s"3@ÁcâáJÊa X[®âÿé6Qã6USH„É`Ju“¬‚Q…5*.5µ£R}Eë+W’’%°·H≈ÎÖö)-Lï˛j|+ïÙ≤0æà¬£4¸ÖW6?ÀB#r∫ìs`?	Hä¨⁄Œ„<ìa0û«ÛGµÇõ¨ ÈÔ·ä®>x…Y‰VQ»2`ñópQLà”%Øí1(r˘|:a^ò
Xdwy@&@PÛòÛÒzà›_F%Gmwaú‘.~$_	WaÂ‘“V¿ÄˇßÕ,äa2)CΩÑÓ¬`rñ˛Áä!`Q≥ØOeáTG≠Êı¸é|ã˙éûÓeÔoqú¸˚W—Œ5V°»–I£XÎ®;ƒ«1Mƒ≠ûı„‰
ÀÏEöóêu@¬‹´x%`<ª≈ù	ñ ‚)CÁu˜0lFÜãÂﬂÔt°Àíø|¶ÆÏŸÅ]y—Æ≥TbâŒ±°«ˆß#„≠gµVÒÉZ£ºDÿ§ôê-YJxÄªò˚"z±DNsÖxôX˘Jò~È‹|z	DP2~È ∂2˚¢åtEWΩìcåÂmoÖ)âﬂaV6mì£#íenAÜ£up≠ﬂJ≠s*›î˛∆ëä”“ ≈¬≥Ø≈çå~Û¢√Õ»Ÿ7¥Â·‰Y…#Œ“ìWxLì"¥y/BﬁåÂÏÔÉ™¡Úi{ıâ<Î≤˛l◊¨Òób≤⁄-©;⁄ˆñMî∂lÁï\Á∑êsûNa9áÙ∫¨»Í“ô»édüCëfŸÚ<ºlß%≈›ÑﬁGóÂôîÕÅë#W·>ºdáî ‡}Œ*Aèyú>ÍåÆ,xi†ˇã^Ô
Xùr?˛•∞)=åé$`§^cèÒ$†…¨1\˙LVæŸÏıH{ùΩZí^0É!7Y'ê¸R>*Q¨Ã˝ºÚM%È3kQÙ‚Ÿ©ãÃ$¯ÿÜr X:eìE:hiP?Ü(ñ¡⁄e	(N·åÜ∂ntp\dà28⁄âYRoOø
RÍê<õß3îD‰Ú“¥;Z§ë'=åFc6JZiÉ¸ô<Èâˇ ÊCUıóﬁ≤•÷/≠»ùM')˛Ä∏„KﬂBåàÁå”('mê˜¡§KNA\öL:exfÑ…˛;%Ì—Köo|4Ûz˙	›÷àtGr∂co Eﬁwqp„UËCù‹:Á–÷ƒpéÀtˇyú‰≈Üa≤È&ë`V§Õ¥L∆ömæ•B)Xå°≤ƒ~ÃïP:pãGt”z ⁄ç∑˘Ê9Â1FâãnÙH.l”˜+Y|r!A¯rÑÙ*ê•Á<G≥ª∑¸ìÎû0‚ó±˙≠;zç¬ú‡≤Õ1"uê,îAN$£+Ø¬áîÌ(ÈPï]¡TÔ¥EˇãN(∆Çj;F·à“
NzUIãÇMò® úˆ	F=◊Ó+_M=l≈‰Pªä;]∑€M+„>~à¨ÖÇ–&E±€“SôElà)bd'ãrTä´∆c“ÔƒH•5¥˘Ç|√?m)mÍªü‘πÔ/ã˚[†ãƒ´zÇo©±JGµªcÕ<Õ»∂rˇ¨ya©÷(LÀm!'‡;*IußΩ1UØØ⁄ÅÃ@!êd&Raï‘ROÈ Ìgæ©§êúë‹&ŸÄ,øÅu≤ãŒã≈◊∑˙ßﬂó„Âno4®!…"Êé)˝~ƒø4‰øìV˛¿è?—Vwê∞Ä4(öœáäÀ2=+XwΩdy2Í≈ı”Qç$≤,öÿE9
`diô|G÷z™Îû~P)2—Ÿ!”ˆ0bhé
Q{˜ZÇØéÒÙ#Ùç‰ o{Ô“ÌdIq}ï„™)…+á'ÔÜthÚ˛<í°ê8X„âTC?˚Ëºà‘√íjõHá1’†Ô#ÍÌ÷˜G'©ùr'˚Eän¸£;a£í◊O`Q¿öòc†èN¢è·pòJA2E˘bOw•›é*OÓ-z+Ø¶iß»K“Ô6—É Â¢Ëb»á	”Ÿ˙>‰ç©€L´Ó∂‘J<J∞ÏP—êym¨,…Õ¸ö˘0 –‰ı∂äªKÉ}•A\2vØ:r£†i{´∫ì∞‘:”Ô∆¡yî1•Ø
ã–ßX!¸íT¥RÍ¶./Íçë˝“%{\Ú]åz}¨€'i(7eÿ@Õâ–MÇ’≠(˝∆Õ RıœTŸ∆”4πBo]∂∂0˜√˘%H€Ñˆó-Ä,YX&’ÉÓÀÀ$’|µ∫[úàÎßË‹œìF´Sè‚mÇ7º@$¿>b∑¶*±UïïóU_ˆ3/–·∏eÁ}]i∑hû†…ˇ¨ïs ÂP§yûLÛìËó∞ΩÚD˘)?‚-»·¡˘~˜áÚ%9ﬁπ{tp˙ˆp˜‰ÄÌø˛˛¸q∏˚^YCâÃﬁÙJµÈ≥◊x'.‡ﬂ7¥ÍÀ\®ƒù÷Ìk~µgh„á‡Ùô)®}n¨5Boy¥F6çÏOÇ(÷ÍÜ¯ùVyÕ0Agß*t1yÊ¡%6¢Ñ: ˝ƒ4ÄÇG<¥¢aÁ`Øµ$⁄\_S'-¯∂œN‚hˆèÔÉ˜—?æ∏iõfEÃZk©‚g¬ˆÚŒæ^¡ˇÔŒÜg2I´;€'xÈåwXÏåÇb:úè}∑à™74< °¬ôcäµhb‹3#Ù(eÚç(P√ÖπÍÊ1oW∂¢ºìQb±"À€Ö)˛à◊MU‰y>ÆÙW}P~Dh<üç’g«=¢I&:|Âc¶A†ëªäz+¥ègÂÜ◊mõÁ¥À7›œ©ÌN≠F5T7@ø:1ƒ?ìõU3˜Ód9úæ¢*];ºV∆¢	ÑÛHÅT"+Ê÷‡˘XöXK†6Ôñ¥˚d\g‚∞\Æ˜ä•ñx√}8ÿ¬ì9µdG ¿=›}ˆíúœÛØøÃMf«dîzz˜ŸÈ¡_Nˇ˛è√ÉWß@≠}Úg“_´Zû±Øk‹¿¬–D∂u„S∏^‰0–à2ø#£∆™≠ä‘µÆî”±≠πêk—Ïz¿∞‹Ïä“µ2@‹:ÄÕ´¸ |∞á¥Ú=áhﬂW~O:r˚ﬂU¶PUudV†∆cã˛ê˚-Äc‰Ö¡Â8J…e ∏¿Ô “·|ZMÒ‘ÍCÎi‘%‚^âRó˙Íö¥nÛ)o;ﬁ¿:“h>Ù¸ïÉçPÇxÃÔ9¢…ÂSË”¥ıëØÑ®[>âπ_>CîA+°D‹H‘≤ü-P∂Ü<=≠,πáD¶ß«“:¬˘'‚¸ p —ﬂcÓãNXEÇ°öM-
*AM9‚◊¬Æ-u_™AèñÄw-∫Q‘πØá‘òNZy2å°zJsd√¥gîÔ¥∏W{•°2QIàüMQïàZÚ±qN≈‡•’20ò©f—Jò? c,xå”Î´qòÜÀW'o}F·¨)lâ7§Ø†*·Ô‹Cà¶–Ô£!≤-ÚÕìî,ña?§I4¸ı*<sÚkt4N¶!¸·?…◊ß k\Çbû^ˇz∞œ¸ıÕfèºä¶—rBà •Æ@öF8á≤•©ËÕQ¿Ì]å_dáÃ~LΩŒ†:QJ¸¡À¿ÚÛﬁ˘º®º”mÀÍôì∏0	§ËÃ,¨p|j∏S>‚2(ﬂtÂ“AF5™j≠\öê>vÒ»Æ‘Î%@dO“<È§%cÎÅ!˙`P8ÜÁsê2ﬂH]¿âhêú_œÇ,„≤ïé)®T˘,+õ ƒ:@ñ+˝)óásv§j–∂ &ü¡£–xX˘◊ΩSBc*∏#ÿg{¿Ê&—È¡oˆmÁó5,Mp_3k™jS¯¥≥âb]´çî+Õ∆^4•å`«∆`πFgÇ3BÆ˛`êg‹jÁ5πÓ&¸gXöccKM¶ôìé#–ZïÏ1ôzñ¢]ü˙Ì?-dÍ}ê©…ÓlÛp–˘ãx∫¬àäŒˆxïhæ˘‰p˝¢;õgcºÆbQßè)Ç/Rÿ∏∆ix!hMù(Ó`ﬂéRv˚–30ß£dFõ≠0•;æøä°ìhp*ê\¶£ızã›ü…P”ﬁ‹R¢‘s‘ìW0+6h'!Dyß¢I/Åı∏M¶πÈﬂÚHGµ_ıªF`∏ï0òM0î#üœH 4HÌâjn^«a¨ı6ùÙz*¨©ÑìPÌ©˘]ÆV©§ì∞D* î:˛ó0l¶Èf·%Ü∑ƒ¡(‚9_ÜÒ<HaOæ4Öæ»ùrMQcÀí˜¡4KfË$Q≤)±CyCç#¶Î,¯£⁄∫@uvS¸åaå~TÓ¨’ÎÓ…À~„Â˘´KÇ`_ã,ØØK)Ÿ·…¸|IÜ≥a\‰∫–Qµ87›õ‰‘ﬂíZñ[ﬂ)wƒà»äK^ÙΩyX®;ó!¶§R*J.)l£Úw√Ÿ-llÖŸåÂÖ…¯e5É≤”GZB_:⁄Ωw ¡_›r˘ê⁄q‡T‚i8–µxjÍEVd’A^ÜŒ(,ái&g»Cù?q$‘90•lñ\ÊX&gﬁß÷Ò˛—õ„SiZœé˜wO˜•oŒ0ásîFì"?3ZG–±ñM–Ñ)ÿ_·¥ˆZAñ*è∂∫qh¡¨Eql±÷!ˇˆ˛ßA:ó˙…Ô◊6…µ“≥IËjTuÀ“SFC”J1n7£0Y∆ÅQÍy;ôOZ2¸S·⁄ˇ¸ç‘!ÃŸ21†ÏπÙ#~(.Ôä/Ö[akwÔ’¡Îº˘ÒıærTÄkôHT¨^πkC-Ø.q*y^∞)}û§ìS∞ä‰·«€W{Ü[ÉBÒ±ﬁ˝ïwŒÚ ¡<ëØQΩÈÍW´∂QòÔÃÃÙ8yæã„›◊îÙ–§íˇKÄ´Ü¯`d5˜!≈Î¢Á¸c;Ï≤€d/N_“ñπ¶Hô«EVRr◊{Ò;≈+Vy√è•À)%ÌTYyûåÍÕ˚œN%ﬂT‹§≠∂≈$†ïöY±*àtÀvÑuDq[{˜ˇ‹ˆdü!Äq~ ëââƒxj˙b/·zì®Ω¿|Úr
«Ysü•Ë÷9lam<‚÷•^úîW·0öO]Ïè]‚V·∆”w?…¨o†˝Œ0ErÚ	uå5¸t[å:öå ˘ÁKÀ»Ëhå1æ≥-	ü0Ô„<üeõÀÀ—vX÷ùOôlﬁ$ìÂ∂€YY__Î˜◊‡üŒìo˙OŒW/.6÷7.vÆ∂üÙzrkõ~≠≠≠lll|ªˆd≠øﬁn¨úüØ|€_Î]¨ÛãÒ*@}ÍÚH?ô÷[wÑﬁqyBÔ‘∫BÔTºΩú⁄◊/9µûËã§¸=ªF§dß)ø€Êß&-ZûpÊ£U√ô™¥e‹ŒÁ“6fÁmÎŒ#ÓL£ˆ¶Ä*ﬂÓô †‘≥◊qÚŒ]Á©ÎZI´x…´
7ı†uxY€ŸÚ.Y⁄’∫Ô∂ÕpBé{LÁAÃã>0≠ñ<û{Ûı6zÚ≤Éww8)≠¯‹∞„¯-õ2h∏yN]≥Y'ˇ$ò¢ˆ=MæÚ'¡„`è ãüÉÙØQxE©ﬁäÜîø”ÀÏ€Œ7ú˘õ
æJ¶˘Ê˝k≤≤‘ù√¥Áµ˚†jÔìÍähœgºçΩ‡⁄P˛L,Rﬁ„=ö$Yï-8{P)˝“ƒBgæCä% 'Y›≈⁄ªy1_ã˝À÷rVŒ‰Ú'ÌT~˝Êıææ°}1n•˝Ø≠∫ÅJÙ[ìÑŒ≥a∫Y˘¶Ë	ÍdìWMrÈÿmâUœ$yÇT:Ø¬=Àîb40Ω#<‡<…e˝b¶®XEíäQ1W’üÑE˜ïn5Óh˜Á¡Xı4æ-Y€A&Ê‚U2‚7≥PwàÖB˚Í¨Uî†ª9Uô’#´[UAäËX∆\îÙÓQhP◊"ëôòüÆCÉ[èhΩ*óFåq!≈k»™<&≤ı"òÕ≥ÚE$öF;≠%ª{c]∫Aô"%äƒcÈ«ÿ_=˜Vägc[´—XùBÎZ•òü5U®◊sÚ(™xëÅÖCäûÀá‡Áyûi©G∑Ü—2 U"CâtªuÅ˛ˆòD7Ã;=ÚKgΩG.‚#Õñíu9·˝<I˘Z|úu÷»˘®ìa8UÁ€^oy≠GØûÜi2Îú«Û¥ìMZe
ó≠IB/p‡Õﬂ*œ£ ﬁæπ!…,P›±˜òd83W˜[r+ﬂπS–ÑÚP)æR_QK„É~^ç#§(å’áùw˝Ó:P◊O‰™É◊;Ë ﬁπÍƒ#íçÉar’ÈåaÄ+í>&'£©LŒïòûÛ0ø¬õeÓ&Áùçñöœ—3‹lç˚rªËTKªrDsJ/ˆªb“â ûÍ‰s›™¶Ãπ©û√≠∑¿◊	z¢ôFqJ9Ω¯FO¯µµ<ÓW::´Ù3õn&ÒPÓÂÙríwV‡@GvÙ-:}ÅÙcÏua‡;ÀÂ?\Õ`Ñœ0@Öf
Ï0çFÏÛ	nµMºTì`§‰Á6¨≥ç€•ÍdÕ¥e^Æ¨ÛÛç‘j&Sz·±}crœ¡«ÎÃUä;Oﬂb˙§ÖùuVÀ=æÇ‰¶Æ´ÿNH£c<ﬁ,J˜qNY Dgêƒ	úE ´*Dı7íEø¿ÓÓØ›íe}Ÿ§)€êM≠¸ä∏,–:π}SQúnÂ—e¿B¬ŒuÁâagö ı+Ñ∫†ôW∂¬ªïﬁÏ„Oñ]ãÛf›
dwV˚·á˘pÛZ°8⁄âJ◊¢ÈlûWö≤^R=•Ú#™l’ﬂÜLÖ§…b∂u¶≤√M ïZ‘!L∑[œ`>ÿpØBñÖ˘%F ESåe:AÊº[}´4≥t<zT-á~TQÍY	+DT›ãüﬂZødÊò»sùô `[hT
û’∫5∆Ì7ß/ˆè+ÁÜuU™CﬁbAN‰}oÔª√ öNØ≤Ã	ü†1kkôï≠m‰h˜Ô«o[ﬂ˝Ø@¬CA√<Ç©≠â≠e6óˇåDs¶]ÅÜˇ&…7X#~·§#…XP‘Tæ¢¥B‹I—Êæ;	Ú9ÏØN> ÌSÍ’˛îœ›í7m˝∏øˇÚÔ–ˆ·˝NòH˚«0ºåØ˝zz ö⁄õS∑aπ±ß—U√Ê^Ωy}˙ÇuÏáT4Eµ
GKˇÃ§ˇ2DÔD$}OJ«i®oAÎ≤AÆ)KukC :
≥M/úÀ,.Â0IhJ}™™; π ∂oV´Õõ˜!˙ZÇP’ô&” ﬁ˝nkYÃ≈ÇB+ìò◊Äﬁ∫‘ÆeÕÆ;ÎäŒ»÷^UÕå˙ŒƒA\eÉj,>bì™Éùo◊e˘3àc∑i“ìNòıy+]™,Ò/ç íYJE°TRÑóKMX|+Õw≈¯ØZ+ˆ(•6j›œ®mZÅÒ–¨Vç„∫	πìØöê'TR≤Ü‘åèvY´ ZJF	9KpYGX9h⁄ª§ ◊˙√àq#˝a‹y∑—˚0˛âÕ	˛u≤{¥o¿{≤1®ÂóùﬁocÈ`Dnz~Üa7‹ﬁ¥àA™©öõZ;>k[Übπ(y7]¸ûÏÜçTÉ=√ Aêì0'ô•ù>O)⁄y!A\çîÿÃ7kf†S!MË»êßÙ®åâ=ó·ı6fatJ≥Œìr¶◊{è°Ê3]¶¸i=FPnåqÅ>TÂã™ºÍœYh`2ñ5√ﬁ≤¥§§QÄ‰Có‡*f∆V*Ì‹ú]A•1¸_Ã e≠_‹Ñ]JB∑g“(Z P.h$ÔÆª‰]KáQT°™wu=i/ñ±Ê™7°¨e}˘%Q>#¯W®'}E#º,/Øårˆà$ª^ó v∞«£QÇ$D«…?>ë6ÎÑ≥÷wﬂjcôâ‘på„⁄öt•óﬂ˝øˇı?ˇ´k> íÍÃ†TÚSÃæ9+¶ó”Ø@˛´:-zÇ(0#}ÆÀaçØû¢*µo›}q˝Zaí¨Ç·`•?xÌ€¸¡\DFæ≠‹¯óy§8éºÓEi De) ÕªHÕ±j∆cG~jÕÈÚ√%m
Ô«ØM9b;|f¯á·D`¬‚ÙÏÌÚC”¨WC[ı«`¢Ø∆†*9”FµÀKCté˛òŸˇÕı£r Ù∂Ä¸Ø8∑KŒ!8à≤5G∏¸ÿ©ËÁyïÔ+O¨<úñ5ıZâ˚•>ìÔ@€É ßÑ∆ÎÖÈ-‘’‚ﬂ<ƒZù¶AÍ¡Ω,÷ñ•nÜj˚zºV9ÌaÏL√BÅA…¶j4√èwÛm
h1k¶^ŸÏdc®fmGìEhﬂ'‘+ªË-
w†X€ßÕÀ†E‡c–5*sº¥t´Bƒ›¸Vímø{ÏÚÊ{¥á6Ïd£›mM»Ó}Ò¶À
á™Hﬂ◊t™Z˚	ì±5≠åÛ÷,ç&AzÕø§%≈W™yéÈ*ƒQÃ—ùµyc™[œDÉ“î–∑tXoRLÁÖ{SÓ
˝MvUÓe‡%æB3)_q»†Á^`íÕÏPŸm⁄NÛ7G÷Á>MF£XI˛ãÆ`Øe˚v]íÈœèË_©∂¬∞_
‹2…Ü¿æ3n
5Dâ¢jºù¢˚∫-Í„!—ç™÷ÂéG«ìgT5g?¥òßhgNÉÉm>E∏Än≥ﬂ$Ïeêœ(ñQ¢·˝8p˙Ù4ï ‹÷ÇF∞πÎƒt¢  Úî÷µ¡1IÙ¶vIëqFÔ}>ùHn∏ﬂÈ≠i«é›5öhNA,å⁄6GJ,5ª80‚ Ò4t7#XQÊëæ'!Gx$ahﬂrÏ˝Î"ª≤ÿ;¢˛yìAWÛ
U˚$'òﬁY…Ù∏YÆâ≤7xÿ£!µHºAΩ´d ·’äLıyÔÛ‰ä0y,õjƒ«· !†•óã´îLøåÚ¡<
íPÁÉ∞›ŒÊì«Ñïá?…◊P+` i_ÉrŸ•3Ò<§óÂΩ%)	ç÷¡ÉÈ °∏ãuÔ‡u√ﬁ{¬CÇè0ÈbNSˇî=Î®Y©ã—Ü8Ω“¬J⁄)≤Gäß*Ö—[‡M“⁄?èr8Ny¯c’N/—YXEêÏˇÂ„∑”(o+›_™Vd†/4ñEBW´a2yÿ∞l+KK’pÈˆﬂ…´ Ö›qVm<`Ã»i Úºù^è åèä·$LÉxà7√œGP¥7QjΩZËVˇ¬>°ß8ÚfÚKòìˆ¡t©…úJs·ò—w\0¥ÃÊÂGê√º_3)Á–âö°EÓ6å∞»Ó%∞e˚THyáË¶ã2Z∆†ó∫q8Âc«úœß”»xÕ√Ê‰iÖ»/kfÑL8∆‹”¬ ‹ô†ˇ≈EQ˚µ…±–â`.Jyä“¿1!±ÃÀ^«Azç¶5CmÓy·Êè∫i˘I˙¥ŸÄU	ƒç:b˘b≥Z™9˚˙ãõ≤tzkÿÓÙµ›ZûáŸgµøûb∫∞ÿEEwﬁb8Yz#Ej∞LJÇÛvåf¡©ùHﬂ]˘)¯ÀpÄÄ√AB»¡4≤Ojô5È«Î3VC§qgeﬁ•Ái2°©ò⁄„2—üa;{¨çz»÷tÀ£‚ïxBÎ˚I?¶ù€‰_ä›áA‹¡I¸¨ÿmEz§Ú˝Ó@‰Êë9∞:Ébˆ pˇÛÄœG˙é`c;ä¬g„ ’ÚËâQI˚≥pZ∞ok¶mñ©∆É¯:èj¯©ö⁄¬ÿÛó·ú9 £øZåÉ  À"ìµÁîQ›∂pv≠œL∑õˆ∏ÚàÇÆEr'€î:åÀ5í∫Ã?◊vZ0¯¶ΩﬁK.1∆íÜ£ 6ˆ˘yáß–kó˘UW—ÂÚñ‹›ÂüÁI.Õ:Õ¬Kﬂ †Œá
XJŸqŒB≠˝6:‚‘StÂ}>≥å»‡±≤≥Uñ+ıî1“¢ß6ﬁ[ÙtØÎ\ö^ÁC«<_…õå^ªkcá˜¬4f¨M;˛}í†¡ˆdÜ†ccr9+=üÃ–‰îaIkˇs<äŒ”Oµ=ß-Z…π –ûGÉÀí°€¨2ﬂ_PØùœ	Zdí¸&Jõ¨⁄aíÀñ*«‚sl7£U√`LÙ⁄p4 ‡¿8Ã‚çãk„f≈ÜQXÿq√ÅÏŒfióà”˚ÆÎB%•b4—Jg“–ã‰CÂ@[`$4GŸ≥yn“%ÿPÑC¨s û‹0î8>Ñ˜3 ñπ÷Aa i§4	œçE‹ﬁe{¡E§ÑÍ¿&ªß∑~⁄Dÿ2å≈(p5À	¶F&?XÙa+ù.dìd¯ˆéŸ˙–HÌÆŸÎ&]ÇóònÇIToÿ˝*<ß⁄˚ßAJï£’<@ÃZR√Åº§|HÇo‘G‚≈®ÓrÇdÉq8ú«wZé›4ãf‰4öXá±õ∆—˜∆^úE¨ıÊ∫˘ âÑ#êΩkΩähzöìêˇ„?«¡9˛Û2†	˚~ò”N‡KŸ∞ ‹‚á¡ıcYSõ–€U)≥zÂ•œnâÍÇU®±Ñ îÇ}ÉâöJ¥J›7áﬂOóQR◊<ﬁ)RKﬁ
˚ì˙5Ø~CÉ F«≠6l(∑ry5IÜvÌ‡19∑NMÏÖ”Ó9ﬂ.–O∆Nbc]ÙW˙¯Ê¢Pl0ÃO•|}ŒæV;]%	v	Ko}(Ä0√¶;òÊqß±ÜûS£ï9∆cÅÈgV∞vπî’~•!:<qDËà^˜R≠ˆ0	czÔ1ŸXb§'#=18√MDÃQÅ)˜èe◊†÷M,2Iê+‹"∞#~dæôj\ñ ∏±LÒQ[u$l∞8èª£Ø¸1|¶Â<¨ÓN*—≈ÖíWØl≥øT /¿y°∆Ÿã8I“6≠πÃ2™*+è˛—¥¯Ê∑ÂT‘B?'íÔÉñ•Ïì^QÊ	øºùê`îúU;√Ú√)Ω°ç`o*]aÖ∑HMnü~{;Æº@P
r…3grÀ≤Í≠¥Z,#>[JÔ0∏N4‹é@ràÿæa‹WırK¶Ø9†‰ˆçÄñTK ÕmﬂH>ÍœËÔêmﬂ–‰_¸ÇøWÙà?8ÆñˇL^Ä>¶‰œÀgOS|ÇI$ì·&˝;MÆo£˚°BˇC=^Jº¡1^©8Î≠ﬁ-ÏêéVˆ:Ÿ!≠˝è·`NsµÄ˙Äıï√π€Ji(2;ÃéWå}7x=w1R—“—ö≤èûl Åä$}èÕQâtd&‘GcIÇ©ÃîYx√|k69Hdî¡\ÊI⁄2˙^Ú»8Áaõ?∂_DòW4Yk;˚ÿYCˇŸ~w]Òå5ƒ°˜¨˘•˝"å›^˙MØ'bvïpc•áB~Ò∑rX°Õ;FmÃ¢H‡ó∞ı›ç~˙:ñÏ±GéÿÕ_∫¡-ÙCê B}òñG€¨∂UÅU|bZ≈Í™À`]I-ŒtΩÁÑ`èe1N¬É2iI-Î¶3ÍSìÇœ–]∆ødà¨fŒbñ0.g5æïv8˚D#,KiSœ›Gi4$¯‰ÓÃ 0ıÚ„âG“«oË,õB>odÀ/ì≥ò–$§~c‘wnv%è5ìYæ¿«h˝ÎM“Y/ıªΩæ-êÜ÷;fX´Ñÿ∞˜åBQÖYd‚+£
-Ãu∆≤π:8È÷≥∫Ør£™◊$÷*∆RC—öw∆MYS˛dè}*∆©v-»xZ“{DñπQÀz‡PE–ıj√lA◊è*ß
≥Z3«T‡cÜ∂Pë^Y#c¸œ7|™Xpt√‡)Éa∂¨¨Ë‹¥Ïôy.≠Å_ºch±!v˛j=ŒÓ!¬C≤íá≠û_ˆào>jÚi˜]Dxÿòˇí-À¿˘O®7Ó˜»“s˛ïÛ˜UŒøfÊo®0c˘¯ß√∑≤ã€[p\‡ø˝ûm+[¿\∞¶≠JI‡Xk9îé»ü·àXypé¡w[ôƒ…ªDK_wﬁu÷∞)ü‡,|ºPºpLK_∂fe⁄cÍ#cÍcBJÈûèn≈ü¬°ä`1wrE∫n—n…¸©
;"ï∂s(Œ£ºfà2úèôÃ∏Ä√äÀ+&ç∫{uÈeË$÷n}ÁÚéÊÉX5‡≈oKªgπ]`∂‰˛ÿjª\ﬁ¶XØ	kx1a®"8 ÍŒ†l Nn–uÈ„’fXI5}†fd[∆´Œ3ƒ8âMz3UHO¥EÂ‘X•ßÜé≠mj™AçR¡ñ\t£‰¢k=/.ÍH”ºhL]r}•1ÿ~3°Ó‰@·œàû÷®9XFKd'Ø∑œÙ;N3n8X™ˆä+‘◊Ÿjã†c÷«j&°mQ^"¶ÈUêÕ/Î[Ï∆j-ÒÖp√ﬂ£‘…b∫mtsf3–èA#B¥Â ö¬¥w «€- ·oëqà">ÅÊ¯#˝ı¶wk◊nt€R≥·ˆMqog≠Ç˝/2' C}“Ô”`àŸÿ%A0n∑ËÒMa7Ì®¯|\Ÿnı‹EÆÎã|Ï◊∑EV\E\£ßß2sñ $π∏ -wªµ˛ÔÓÆ`Jædˆghªıokœ◊ûÏØ˚‘x√$VX¸Óäƒ˘.?MÛÌ√èÊcŸZVÈ“Ö<‚&Ò≠g∞K¬,
¶®-πyö\Üx9§ipΩ›Z%´ÆÒÇ0öG‘S®•√5X÷4Ã‚ÛïÁÎœøµ∑Í‚É€˝ô ƒÉL·%®U-ºpu<Ävav=:ºlP)Áí_D1zJ¸€∑kª´O7å¯àRa`ú' êÉ"gà{“K˛H˘È&^r∫
;wÜ@¥+™u≠ŒﬂkVÁèI7>Æ)=Mí8è\¸t∂ò√I~áu”¿ƒ»c`'4gjÒöπ`5–[1õÎ ~<°b)ÔlúÙ◊·?¸O::o˜˛oç¶¯\˘ôC1ÜñV˙5ùtí3 tbjîÂ⁄ÄÂ*|ég_tïvMﬁÂ√ê©'…4…»◊ÚSØu“E¡NÎ%VîÀVkÆŸ¬mR]ŒcKn∑Êi‹˛∑RZZÄ©o-"ùM^5»ë‰W≥˙gºf-UÉ&&å—Luá†R©x∆>≤tpû%ÒoìYßGR$N¯˜™Û≠⁄O÷$uaπﬂSÅ@)&Ùª&äw&igµˇ‰èEô‘‰¯u¶¢≈ïc˛Ö¢8€’≈˝ÀlÅôTX(ïq©PóÛT\AÕ.‡hµnxÅŸ⁄¸$ä†ZjÃùπ,π¢kVÚvôrÒ±:ò0–*];òßYívfIÑ®m/˘kúµZøC{ıÑ§f§RπE0†jq>∑Ï~3£n.∆cµLY{mSﬂ◊ùÍ;ÔŒåáﬁ˛˚¢}rKM ıJw]†®<i£ßÌ}çÛ∏W≤ÊB<“ùU”˜‚ëÆxï≥/îY;´kA∫4ß◊°ÊƒatôßÌ?VMáR”/wr/a·ı˛%¿–7àû«ÕÖÀ+&˚¶Ôù≈Çﬂ⁄Ì«™·±x°v£eπøî¡l◊”—e0õ^õ$ß{Û9¶Œ≤Ñ{À^c˛&ãì›Ÿﬁ€˜∂˜˛´Zxß9»v4<Û˘˚ys”Æ›∂fìQWñMF<é
2.E£åô3ŸÊ·09ê¸dn÷\¿±ﬁVY!#ô!Ía7–P4Âf”“ãPÑòŒh¨ å1ÿ'ÑK©\8üØZã0üÙ:Y´F⁄™ó∑™ó”uWIΩ≤ﬁ´ıÆÑ˝π û∞◊ΩÉm	m≠\°,<∆ˇTÚ≤¯‹,´® uŒüR747–~œ	èL´∏Ö!1∏⁄7˚ßKŸ®ïÚπâkO÷}ßiÈ?kÌ^“~§yHˇÆöôéı∂v5Í0∆•Â``^ Dıåµ$ü÷Ê.+˘¬é«∑–YU}cÅåÏa»Œ©©EfwMûY÷‘πÙ›ÿ1á¬¬=gnçù–	I©åR›Z±1=Hù•@ÜËLròïíC◊1—V:wI˚ÕQ◊ˇêÛÃ≥|òå§€¸”0=7°D≥â¥JzÔE:KÃÑµj)h,*ŸººnÙ;±ïæÉç¥c›GïZ" œO‹BçE>`æiı‚ÅA8ËÆfV∞¯`îNøÃòVs+YÇ◊¡˚o4<˛*nØ%Â∂æªaå"Bƒ@T>¥sdu≠?C].π?¨ı€r[‰h«ïò…∂liUsƒP‹ŸáÍMUÓÕÃe…ÊÁÓ<„˘Ñù;À˚N„óSçµ!%¬†√ØÌ¶
0˝HB†Y¡R†@†6ÀéÛpE „∂∂·Á å¡Éf"è⁄t:˙jù‘ÈõÂètdh≥Æ∫˚t-cº,«´={8 )Å2Èä[i–v“:6èø^Ú, IN¨¢+òbå¿ù—4"Ûi>øƒ¥¡ói2ç2º¬õMkk	pC(îLÉÿ∂·Ï©ˆÕvì#¿¶¥#¡nü‚"äoµ∆âõ›Ô®§.°ç,Ê?XvLª‡Ê¯ŒlgaΩG°›˛µ@ûÒú ÷˛Ñºô¢ùå|â‚ hi—Et	+Ï‡¶∫36µŸ7±YxÒ°.ƒq3u`b≤Âk≠è7gVÖùPUõ˚7QF_·Ω∫˚˚ÚzOß≥~È_X∏*Ê,õ¸›<h◊‹¡µv>s§W£∏	˜t)&¸‰âGb∫*ÅΩkä¬fè®±JX]ıÒ`¥F˝%b√[Qg.–5W.Pwh{Nòù‚(Ÿ∑|˝]Æö‘Ïé∏‚)vÏ2Bf”ë≥É¶$gÂØı˜åñ_+'ì]´lnÈ7◊™˙‘-‚IdùÑS´‹¸‚˜ú…9w‘då$øXúäxÙ%£z◊ùî«zÎ™∂Ñ3˘ˆ˜âÎöB4kÇ=!Ω˚Ÿ8\>ã“Aˆk¶¶´)ß/àƒÜ›N’u∑
˛Nﬂx¨¥"±êaT]z`!¡ùmw“∂ju›≠)>ˆõS‹|ù	FòÿØMÒ1fˆ['äù¡·]Õ»=&éÛ¶å’‹t…»/E‡b7wá¡Â¸ú ÇÉ~ü†bSÂÕÎ
¨Ó“¿2„Æ≥§BﬂÃÛﬂF
≈Ô»!ñíJø˘C µÕ‘o#~&#Ï…ÔYÚ<I“Ûî<qÊó…Êaˇ,DOFìHüˇ\“'¨⁄g-Ä®∆˜ }Jê˙§
6Zsgı¿"bÌf~pYP5q|Æí° ]¯Üå@2t¸~pÉ˙®«≈Ú`,ã˚&ÍfÏcª“±)Î°ˇxS˛^\Î¬‰.›÷l“StFÇsÖ1f∞∆+ä	¸…÷ã“3°Ùº®†‡ﬁñNYﬁ˚„◊Z€ï2[À~k˘CÅ&™ÀâlóÙÕ¢¸Ô
vÉÃŒ14™r°zQ3ü‚ıU0ﬁáò˜…au'‡VÀõüŒ)`ÎîÄîsÿ[Ò<ùèIú–Ép∆≤"÷\Á›H’éÌa∏ÿ.q	È•uı%πÙXØ=›œÉÏz: n¿DÜ3Ë‡4<;˜ ô^DÈƒUíê3ñBÎdˇ’€]“ñÚCÚƒèKlòó‰£`ÏíñèÕÉèW@ÒEíí6œ™Líãbn›µÄW\ê—˘	"¬Ó0åÅGÔ%Ãeñ∑[er2ÎFv†C|úêa~öY˛*Ã≤`2u¡s√NÖa4∆π¥„GÚÜﬂë6VPiÎê5JΩt6PÏñEÌRÓ·âJ § Ñı÷kD#õÃìGy‚tFßçÁlif§9F0Ó◊Éäπ‰„IZø”Ô¥•ŸfÜu?»û•!0Hûµı®aÒõY8ed‡∑¶E8dÉ%ïÇ~ÔcE≠tœ≥äDw?ã‘–È9ıu&ß òÒs≠\˚UÃ‹QÃ(˘$≠˙z8t=q§Ã>L˛·É@áú˛òyãMUªµ{xXAxsV∫‰Ka!áMkR„ë…6¶>´vçÌEÏûïOÓêñÌ≤Äœ¯§Ñ¿•`;ÿ[‘,ÃjZH+€¬c∂™ö7cåÌÍ˘kîzA^˜@
œN˛∫ˇÄ‘`&mÙ*æ;ù∞æ◊êäÏ~Â"©úπÿúºæëIFˆÿ∫3—Tõ¬≥Kw(ﬂäfM?œ.ö°]¶Gw“ÒﬂÇN^ˇ3Sj—{/∂VG©E)o∂VMw´Ûµ˛'%—zSœk–)U.”òÔ,àÙ…ÛŸ?“Ë¥]&DoH™û⁄dº#≈£5+öñ!ò)
7e˜+“˝T'¡¨l8-∑ôh÷0πÊvyyîoMäa∑BJ€ã0˙ ä/·›d¿¶Æô„
ˆ™±[¨îa,ˇÇãgöÖz /(s‘’…ØøˇM ∆5xqz©>ö‡é∞·c`™{ã¿"≤£ÃF˚≠Pñ‡àÁ˘,€\^Ü”}f›˘4õ¡+«›A2Yûçì<È¨¨Ø≠lll|ªˆd≠øﬁn¨úüØ|€_Î]¨Ô\mÉŒˇÂœ€Ω/≥h¥˝≈M‰r	®ﬁÀp˚réÑ˚¶¥∏x‚8ëÇ8ﬂnqz¥ï≤~©Ûzs¶@`≠q,–”‡d¶ÖπÇCxÒ™äN{ﬂ8Ç]<‡4dàa{;¨F™ÿ˙ÌzoyC2W{gm¥‚¨:›·6U≈©h¥èT7¡7vÁ:†ˇÍˇRD*KÄ.˙ºh£7»∞Ú8÷òêÎæÿè~£K¥¸ÖT˛•-±√~UÈv°∞¡¥ù'9Çã≠ë8º»›éEUK;cd¶∞[5(É°üSI-`ñ˚˛ “Eº⁄WD£,úDT<≤Ï2	>vÆóÖ=¶ÛÈ ñ’}ë¯*òE"ﬂ¿äÔ+bQ5 ÆπPÑŸûô‘ X~T≤ œÖ£»H*MÒ¯CªßaÊ¯yî$›Q‹ZZr^¥”∫0!Òß·≈∂‘È:ˇY√aãˇ‘3µXbÀéßÌ÷4If!oOxYò¶v`9Ò»gûäz„\@Õ´X¯∫Å0ÎÚ”˘e@é¬<póØıça1±á|˜"<CØ•’Øå\Øp_Ω”*ÆJb¯HÂ5Æç/=‘˚!9∆ΩXÙ™Îßä´–Rgoø¨u≈Az]ÿV4;7/2˙ö››©Ïà·‡πﬁ\îmÏõ@»˚NA€´k≠1aøÇD∏Ú°ˆ‹â–sgÿ‡©Pdªfd]~ôı◊⁄>jÓ„Èy˘aoÂ™≥2ÊQ≥Ÿ7∆≥‚u\UC∫:zU√à
‘Í›∆¢û“BÑDÿn∑i|–≠dÛ«.zÎzªñÕ÷Êâ“5ÎNX±I&°Ò/CÎÌﬁç¶·∞ ‰¡±±≤Zå:ƒh·ö]Ntú¨Âı∑Ωáﬁ´fm_l´≤™˜≥Sû˝KlUÁgΩMg—@l—û]Ÿ»"‡r<»Âüˆ€≠—©≤æBôd°˘®ò»‹LBœÎ›Ø:˜*âı‹ÓΩıaØÊqm÷61€MÙ‰äÍ¡gmCØÉ◊Ì◊sd+m©¶¢HØÔˇ.|6…4º¬HÚ–¯∆nû†^á¯Ò$Oa£∑øäÜùÉΩØì2ƒ|õ_ı; ´D9|3¡tÁM6NR¸|)|úŒa÷£¡W‰∂võ§’qŒÊ=ÎüizÉx–%ø©Ù£LË÷Bt…ÎyS•ﬂ{1—dÒ∂ﬂE6”¢®ÂëpÅH∑ÀkÈqö09€zÖW≠¬*úÁÌ÷ê‚í∫ΩU	Û[dµÃ~ãNè⁄∞ ùÇTˆ›Å˛]Ø€'?ïÒ∞˙∞∫-á5§;§ı2åì8†◊	G‘››A≈p∞ü'AUÏ≥†(JJxÕ«NŸ·´‚äıÕ=Ö\t‹÷∏ñ-Lñ™¸E@VdÕAÿÇ„‚®§1î‚ºtÂs¶µ(Ê}®Á»u‘æ®{6oøvØTvÀ8ò„4ç‚PøÙµ˚›ú¯†JAM¿¢Ê®V1ÕûF◊”ÏQ‡ mVƒÔñí’ì^’°∂˘äì•…ß≤Íyi@0sæ Â˜ÄøÜ1ﬂãªbå
úïõ˚æ+æø'ÁA…øªﬁX£≈%Wa!…Æ÷£Ê3\€⁄ﬁ+]n›˙ æ÷Ìc«ﬁ˘Ñ[‹/¿ä=ËY•≈RÒp)˜”˙B‹ö∑vŒñÍbï…”kèRµqM-"?yïGß+üí5Á;{ÙÄ)ØúUÊUç≠r∆û5ÌüwñRÒíìyﬁ.|ìÀfh~—•«dµ◊Îy4jgê∆§¶ií˙Pè!Ì˚`ƒàb4ñ(≥N[|ÍÏnÓﬂ˝ÔÕÆ:+Ë'º“'“ô¢¶ib6úFïfÿ	˜i°∑π¬⁄ÿS√úï∑7öŒYÆ!›Ü2ÂF'ÒÖgΩL¬—,èﬂ÷I§∞Eºf§n>Àd_ﬁ3WØ¶ﬁ04‘ §ûˇ≠ƒ“◊ò|≤{5π˜SÔMﬂÜ˘.IíÓíìè-öGJ>¥Ókªd]Ÿc˜ï%ap>§…Ù0º»]05ëõŒê˚ˆzB^¢X6ö”±ﬂÔ#ÃGû£»ûŒàepg4Bva3Ç"≤
bóÉúèÿÙs?¸*Ü≥ Õo¡Nnπµ∫;™øNøijôä∑º_⁄BÅaâ´ `7MÉÎÓEöX‡
–
}Zﬂp2ãAõr¯G±»Ñên◊∞{NIƒÆ“ähéß	p3(HÇs_Aæ˚…,Ç.ôæ^boÖUœqJÉ>‡LûlsBAYˇÑ3~Ë“th;c“(ÜM†Ê$ﬁhÈ´3‡cÒ¨≈‚≠^ÅË’g‚y´é¯i{n=ˇÇ)`˚…=ÂAnòdœêEß≥Dl˛JØ§íÃ´@ÔåÕ©√ÀßX≥ùÓ ¯÷nﬁÓQÂ÷”ö{∏∑a◊ù„¢<
ÏÓÁ…À”¡É:Ÿ»Ï….x	ü¥|ñ=µΩ<…z5˘éΩ‚¥®ÈÚÉ¬’:+4'	4a≠hA—Í
&{£ˆé˜û˝jºÏ;ˆ€‰á`‚∂ñ÷;ß4ˆÈÚÒπ≤z'OÓ 'I»ÒÃ'OÏ¿6?ﬂv∫√ äØè·»kV@ƒÍı €d~ìÏa¿h—ÀfÛVç›ﬁ«yöñÚ∞4‚”Ë˙ç=L HqJ∂—à3ôyZ˘Œ(´‡ƒ˜4HÁ<eŒ%√€Ù2õ°Q≥>|eå≤é˛xY†–¬äcˆq\ ¸bÊÌl5ˆ
	ªÈ7U§êãJyŒofÅ∑e·¡4g›ı≠UL(JÕ≤™Ã©_+>Fπ˙ÕgÒ˙ØdB]^'3%¡˚*üzv±µ?åÚUa“yR{e·cËb•ÓÊ–˜/tT2çïe8´˛…è*Ÿç>+?∫c{◊üJ˙ë«œ≥ﬂ˝i≈ÈÔæN+„ÏˇãüWÆ£¸!œº?N´OsZ-Í~n\ü[3.baUÎÜ0Ì◊¬|ˆ®∞ü9∞uo…ÎNø'C.m?ê£H¬ˇŸ8VÛ|Xá0ΩHÏ9ü…‰c'òÁ	q„KªÊ’ÆMCº¶â·¸Ä•:é£2O,f≥‰&kÿp≈%–upÂÃR~û∫»8º&Ñ-Q—&zNÁ4SyYÛéÊ)2Ô⁄hêºŒ„9Û˜ÆÀNj˘ ◊&{≥¡"«≥±à˜ ¡G˛ˆ8Zı	ï9Ê@)˙‹∑ê÷iN1éÁÌÃùX≈Mel◊ùäÑˆ…êKV K8r ÖËD?û•±¥ù∆ks"√ˆ¢ù˘¶◊[˛∆òÉπàtB‡úè°-$˚(úéÊÁú√LVÅ=êaRŸ ˝∞‡,~çÿ≈AKÆpj–+pjv˙^xÃ„ú€‹Ìk3ç„>Ü”—!ÂΩÃ∑wé–Ùpﬁt…—eY¬ÿ“$úDqt9÷˙Óp˙T	⁄„⁄ŒÅí!67i£ /¿pÜ„ÌÇÔ1/Pb4úÒ“c2ÅI'”(Ãiãñƒà8‡Ù%Óh>≈øÓ˛PwÛˇ‚WÚ˜pß´ñªa¶«Âóîì M5ætÌ1«s¥hÎ—Œ=∂v”¡hg∏/¥ˆ£ÃÙµMM©«öæ9´√≤ÄhÒÉÆí„ÕÿAÓ3Ã¬vÀTnÏs_8QΩ≠
Ç•º¨	eçS¡ŸªyçÉúî∞P¸söE3€˘·Úï∞:›Õ°÷¡%]6f•ıR‹˝8x»p(&
·JmyΩ'ÎòPn◊»o!≠?—èÿ&Ñµöÿ‰ÓÊVª+K0ä∂FqÓVñ˚§C∑‚5˝B€ññ∑:„Ô6Ëˆh:”é≤Ú…ØgúlmÔú	« k¿…’zDZä5∞ÀA’R<Ûß¡$ &9ÿÎvª∂÷¢bºZüø(‚…ö®ÆØ…˘&QÛ"Ã≥M¥Ω¿ÑK§´{çŸ¡Iè≤!√7w‹‚[’‰htÂ>kîô¿‚ºVz˙§&†ïÓ8ﬂX8ìì\’ì¥ßﬂé5>Œ•,l‚ı6„ ∫ÀÎ6-∏:(WwPiæ ŒÄ fÎPFRV ıW8øƒPeêûD£©ˇí}èàu®˙◊8ÅãÆö€Øˆt*Œ3fy2ü ypáUéf€„˘t`ÎËÛ‘˘Ñê†≥b>÷®hÉÂ‹cV t}»‰ôNŸöˆo9ˇñΩ∑».k$>«†Å˝ﬁ∆tÕBÍt˚{Ω,ŸCA‰w92~˘÷~aøƒ∫ÀdÉË'‡Óe∂9¬o©ÌTp0⁄≠¸<^À≥A-^ Ö˛á`ª÷nﬂ¥ç*ßu;p®‡Ë.Û8Ôô⁄sßAAÍFŸ1§∞ÎsÅèL£0£);∆[xﬂS”“úEo>*£7À∑YÎ“Õ}´CÅ5oø∂fó’Qˆ
ÒG‚k≤M¬nÄ(q}
⁄
„9&[¶-˚Ìeçw4=rC•“8{ﬁM…¯RëvóMØßUO|¥X,ûÂ=7|Cà∑≈Ú7◊8ûãGCÔ·}éH£«-î∆«,éRQx≠ü@ˆx\(ªê¸Àáb˙á›‡Ë¿i˝Öπ'&}î=á‰Ø/ËqÓÁQ∆vˇj>V¸ÄÂvªÔºG-Óù±áØçõ4ãåOˇÙ-¸¥ü~nKt\¸n®&l^Íº~4â;+¶É:c˘˘øˇÂó}ÒÈ∏Ø[>µRûÀfŸ˘û3gµÀ¨êIÓæH[1:∫U< µ»éÈ≤j?WÕË+,˘ÖWÍIêiVkdı°VÓ{^¬E^àîq·Ê»ÌªéZ¿a‹Û¿Ω¯¢óÀz}åMΩìQn5!–ﬂ<˘q.j∫_πkR-´óKÒ®F‹1ﬁ≠õ.ç‘¥gµßzmdQHÖﬁªBÏ?ÿZÄ\?∞ŸÎ≈Û!àÁ!
í`åa`Ï©ˆ‡I¶œ∆¡t-¥√ €y:í2…|^1Aú–∫]ñõ¢KªTÔMXb§Ãô£eë˚èNL¸"Æâ∫F1¯M—´zØ«[ó«8Q§ù(øˆäk9⁄˝˚Òõ√C/‡ñ÷€£Ω›”}Ø≤gØ∏G…—zCΩ4Ñ.óáÑ_|S,å¨!·n{*˛ÜùıÇS»Y=G´ü'ﬁ‰¨02I|¶„ ãb≤·Pù˘5‹Í§÷Kueh∞nõπR]u 5∑¨ı"•‘`˛	ße¢íˆ#¯i_πúíØ≥˙¶ª≠æ¬,NKÉk‚n[´$3öoáÒ"¡zæ˚ˇÎ¸7ﬂ¥µÃä4lIê.4ıﬂˇ·ƒÎ◊∞m >∆›<∞”“-ßuÈí¨çã+q	iÀG¨Ò™“Ê8Œ'∏¶‚’´‚p*ÕÓ'B∑≤Ωòæ)ç@í	˚ì∂NΩ‰=Ù+œ7ƒmEáºÑÃ8ÀxØÖGˇıËØè5¡g™¬|Ù≠E#UWü€q5ü™üéØ¨˜—˛1y˙ˆp˜5√aÖO/vè< ˘ﬁG®ø1{i˘©õæ—<≈Û∞»ñb∂¸∞»Y8ü≥ÔÉiŒÅ[8Wf˜.∫L‚ÑO€∂Eö·„ÑO‰=síÙ{ÃßO	∑Ò}≥h∂o«6˛-ﬁßL-©Oõb–˛´Í#dãß°∞-ûFBwQ©Å-ûRßéy\:!CÂ√∑i'
|√ÿ â¡ùñÊ3l-›`G5òz<°¥∑á ÃßÁA:Ø≈à÷⁄\ ©?´„-	„,¸ÙèáÏﬂ√ªáp}|˛IπùaÙø-´+:Ù£ì]·ë¸{Âsü)Û(Âík U‹3À¿\…p€,(◊OÀRsÎ0ÈyØ–‹Z€˚oeV∑ÍÀuªøFΩZÙÜÚ‘ÎÀqîzM‚ë‚Ü¡¨©C	ºh∏[gò∆gßLB„π3¥wxÜÆõÚŸ¯D˙cíÂ›ªß$´Oº∏UH`$¯ÿvÓhÚ¥’⁄áTãèáΩ«èq41–†â&¥„K4≈´¬«≥
˚äßÖeK‹:ˆ¯  4Ë≥ÁMÈ[FÓ À‚˛aâS¥∏¿Ô¢«føßú—\ÿøQø*Ë«Ì€‹˝˙rwK˙˛r˛BR˛2~s	_ìÔ%ú„˜U
ˇÌ%|Ô7K˜|xã˘ãä¯àÓeO—›„Ãp™üÚ2O√Ò√E[X	XË†lí.á=x\xn-∑é?ﬂ©‰R*BHv≥„œ¸KÔÉ¡7≈{ÙD?⁄·‘ƒB√œ±UBœå?‚ibÆGc@9‚·MﬁÑ	»x@¬&°yuö’N√,OR‘˝6©‚ÿù&W˛ÜP|n?â·®â5ÕË3õ«—∂¬£3t-júí≤5±√	üÊe^£	_	\‡Ï˛vˆ18÷òªçñ|“úg≤kCèérGI˚∆ﬂVÉyΩ≥‰·„u‘#(M£ÏëEMÍ/yƒóﬂ◊Ω÷€¬ÁajÅ÷º:Í}™.®Ä“]¯◊(Ñ„r$¸#§ﬂˆﬂè∆@rO1‘o#Ÿ“⁄H)u¿÷≈ëŸ√”o=Û‡íú äÍ>u=]‘˜í´iúCﬂú\EEO:§e?	ùP?∂pxíã—÷Ï¯•çœI«ÜÎsOtsî&xä≤!›’\K«?Ô¡(g´∂ΩáΩ«∞«Ã‚õ-ÔÜJ2k∆X†Õ àú_5Bsf≥4˘îpnÚèq|´E ‡“C,fJ√Kñõî¬TØ˛óJıÁ—4òÏHUµ∫3Üy˛<… É⁄Ô§Ëvªmπs;Ñv•(ΩIﬁ˝§à≈¨Ç‹ùÚæL√Õf#…≥«XÊgº;¸Ä≥üÃ-=íﬂ˝Âó‰ë“¥≤xÏ5JÔË[Í^¨4¢u‚'Càt;≠D?JEºÛØø¬Ô‚bﬁ•iZıß„=Â®-ÈçK∂ıyÜ!€hUó<Â„J≠<…É¯åÛuü#€Rá’QF"∆ÀYˆw[ä™Ò¬ÁÉ∞›É«ËﬂÕÍ¬'Ú5i„Án0°ΩáŸÈ-=ÜˇìØ•‰’0wf@<Pg*s7å≤Y\{Ó\r7ô.it™–(ãBèi/€’„I∫™òÂ4¬§ılûGdô¸bìè`4õDd`Ø˛Nc¿Öc¥à Ï:m*Ò‡Ü"®Vní∏õ·ˇÈ‡5çı¿ﬁëˆ	h‚”O4≤DhyÔ#¥äû„9∫ÿWõ¶≥≈BjX˚zë€•%◊6±§ÊkˆŒ¥2ÍFb+ô⁄Ví’0)Ÿ|5èÂ÷å∆∂¢%åë©å≤™•‰lZ¥reÀr∆blu”.®éÉ4¢Q¶bCzèëvÒN∂Ídf*ƒvcUÀ¿zVø‘∏6õÎÅsÆéπ>
¶ÔÉ®Ôeê¡ˇßyí:f¸iÖxö◊N8ùvœ6/‰òÍAw6Ogâ˘Ölö~”<h2ÕÓ≥PﬁQYíÊ¿cìs∂Á›!øSÊﬁ!Ì@˙,o•Ú|	6( ÀÀ‰yíí˝è·`éÜá«ç’D¯ó$d1I£Ïíú_ì!«Fé.kSF7Z(å ñîÒ†ØÖizÓW|•·e>◊Ä™ˆ*UNãÇX9ëŸs"1PïT;§ó7ë¥Æc1'˝≤8Ä≠»G"Ÿ"+=Ê.0K®˝TmÎˆOï˘"Ês∫ºS˚Ø˜^ﬂ“m‰V0îGÿùBò™¸‹ñ~6àW⁄è•Ä•5§)ü∂ﬁÔΩyΩoÎ∫Ù.U¡Y‘,:¢æó7Öf—ø ÌÔJøﬂ í…ßÜæÚÛJèÃŒAÌˆÄv#©ÇÙb…∆iu5jÜwDwÊ(Ìµ˛,7íLaQl1é Û˘{ƒ∫ß“—óe!õ˝`ìÿïGÀ/C¯ÔD*k<ÁYê©ö—´…JÌã5L¡kØÏ–	~”ˆWXÇ!&jû°$I«úg·Ù1âp®O…–˜	Uﬁ∆Û Âê»äË«3(h}+ùoS{¨ˇèi≥RCŒwíÖ(o√D8ÔªñıÒ≈]v`é¯¡K)Õ k˛w˝4ú¯¿27ƒdw%æ- KößŸ(u+ö€≥8)n¨πÃù00Qù'›}·a1[Å≠v:ëÉ[:∫p#õ/l÷ƒÊŸbº°é?zï.1öS¨¨«Y◊Ï« é√¸üûhO—rEˆ"v"Ÿ–?Ò^$È$»ˆéåÚÒ€iî∑5ªö’@~o$˝{ÄœØ˜1˜¿6\“ˆ^©Õ∞©`^ÿDë™°áˇ@¢!‡ªËI‚‡<å·”	M´sB%˝ñ›„É◊ PYüeÒ⁄ãf9Â—UH‰◊ÉtD÷z?13Ip-›F´5˜ázÈFC˚}êv±ªwW—®⁄¨LDLØK≤Sø !ÔK \ã∏;TíâXﬂ⁄SUd]w‘!
ÑîÜìŒIÓcÕ°
QÅ‹ì›bj‹ ⁄Ü–¬¡‡pdîöÏ|Ãuõ∏d\GÔ√ô#irµœ‰è‚R¥≈ó™6«¢0Nbh~jÒ”˜Û‹öŸ«ÊÅrGl¯Fà¡7⁄Â7Zá?ªapy´Ñª¢Ñ◊Ì^D”°çµåèË'HwF–ÕÄ¬óËî⁄èfvfq®÷u¢ø÷°Íj'\¨.2óª%áŸ`·V∂mÓ∏L˜À5M<ßJù
í˚•€'¿NqÂŒG∑¸/jø-ˆ™èò[d<§√ÔË~h“”?Q0+œrghWç_5v≠¸ú{¨ˆk‹,'/lb›OÜwÏÅûh ’ı≠vû¬ÈãØÄI1ÅÎp◊›G¨x\oèÍ‚‘µ˘á≠ó˘ΩƒW+>~â¯ljùìØZΩ zj2’ÙPÅXımUπB" •ìû–¥æ…˚¿£æuOI«˝ŒË∆±∆7MBÄqH‚´â˜∑1Xlz9€ÉkX·ÈË5xyºS\®'”ëWÖÎ0HΩ√ÊäU>>KÎ7;^u%ò-Ú5Õ¡(J™T‹@h“£0ùD”< r;¶≥Ä¸0Œ„ö∞ﬁ≠ÂÒÍ}pÒ˙8ù™5ié[çÎ†Ùµ◊'hª¨º´*Ñ≈Bo∫œ3=≠qûœ≤ÕÂÂ®;KY’Ó`∞m˙∏Ω“˜aïøcƒ{#R|„DèÚ≥ÔÁ#ëƒ·ÿ/¥›Ã¶ÀùYÓ]?†=âZä*í9ë˝K¸e‘mN⁄1øS¶.|‹¶|Èù∂à>ê|˙ü‰±⁄Yìo7ñ◊¨òÏÀö%Y»ô}~€èÓ’pï3 ©0ˇΩê˛*µ}„•àìU¯r©>bûY¸úß›VlCi%Ø	J°4bŸ‡®çÇx≥6µµ◊ªößE¿Á¶êO$dÒ]ç¬$åØ¯Èˇ’c!?|ïçì4áœL<(
¿Èè2gß…(`¯{É4¬π¥?ì˚_÷ÓíÊßÜﬁeÀC∂~·tHøy∞Ÿ™wÔ««/êâ∂◊dùöÕ<àbQ2©ƒ"K`_ YÌ˙VNv¡9(Í∏∫ÜÎ≈9≈SÆÔûaC?<ÿÆT ‘˛ıoÕ%ˆ%r/¯`?Ì ,—kÕÕ‚á`‘lÏBA(øL^Ü≥0çÁ¡t≥AB˝7crm0ÚßóÀÎªA∫T©øÑ”ØÚ;òö˙cË{dQ⁄L√ K¶T™;çÜ¡%	ÜàÕ|–ó!àwÃY…Ø»oIΩ§È;√=8Î◊âë~ ‚Üs™o$ŒZ±”HÁ©óˆ|Ø drÓµì^'†£Ò]≈ycÔ„ë√P;Õ¡]ﬂœ„π©∏“.
zÓ´ùÿ,›∫Tó =˙®\ufâí7¢ºû;Gw®*∞Z]Ã|}„Úu÷¥zˇ˙ ⁄º‚ÍÌ4¡¢¥=íj≤gLá±àBßdÍ˙@Ø6ºÒ9Ñ2Î[æú_O¥∞˚∑⁄4H_¶˛Z◊R»Î,ÄÛ4;Á*.Eˆ0˛Öñ<Lª‘ëJGî⁄1˚ ióG¢wlø&MÃÊÛ†i£?…=oSÄèè≈_Âé≤ŸµÔÖú∑»ªGá˙ú8]•÷ÔÃrµ—ulInWQÊ#√Y^cRæ¢5Üπ¸Ê˜≥-â´‹]„ƒü‘‰g‡d$ˇ,JqÿoF˘æ6ú≠ø±Ê∂ÓÅ…|2")º}} £dî„yÁÅòÏ£›πÂQK‡KN.¢ŒÓp‡y–j˛ïÏegáR<yõêk¶∏6≠jπQ=eU⁄¢g«,¿ŸRWy¶ê·ú%‘≤ú 6ß ˝îí<∞Í)Ücµºf@ùG"v®ÆûáàtöŸ∏—Vı;xÓ¡‡–¯G£où˘‚ø‚B» ((˘˜Ï$_ı_Â˛ùlµÌÅïã˛„‰ºáÖè˚*çÌã´`µWÅ';¡<O–,±!dùh:utãF	E≥Û$Há≤¥≤ÊÍq/œ$¡Ω—uâ—6Roﬂ‹êd¢¸zìÙ¯ÔJœñL£	˜îÍ≠–zéjé°è◊*Êì<ZZ®ds≥¶aˆ»A˘„5Gám°äk=-T1/nP≥IAZi.[˘µÄÇVö=ßySƒ9˛'◊¡tÑ†≈ÛÈh4«D8¶£¡›)¥ïAé4—uLã=Pfπ$∏Ü¡*∆i@ñ~û'9=A2	CÈSG£ìÚ∂,‹gÏÙÜBqßMpèbÖä”‘#öás‡Ä‰"“≥8¢t.“d“â√ãº<Ãmaiwª∂l®|/û‰¡∆œö^|◊ÄeØ~<ùC7ÜE8qczYè0S—(PÇyèNª‰˚›„Ω]cKØﬂ¸u˜‰Ä|¯ÊÈÓ·È˛≥¶›(Ã◊*Vz! ñÄëˇQl∏ˆà“‚Ç≈≤¢‰´dƒo`6ÏÄØ∆#G]„íÂùc˜7~P˜K˚Ñ¿ _Î©¶éï™©ËJöˇ%è¶*ÅW:l$∞£ÑLÇil2†_Lﬂ(çÜˇÉL!Î¨†uæ¸ÿ'ÒH˙∏ |˛K/¡kvöÕŒAz7ıM…]ÖP˜»f˝U*KcH0Çd¯—hV/ﬁ–håüafvÈßÔcí}JÍ¿z√0∆˚q ˘3ÈuWÏıÃ±«O$˘¥ÔÉYΩy^$]RΩF√éÿ_È⁄qéPgó<\çFA}E‘5éﬂ(⁄6kr–àƒ:‰Ø%6b∂qZCB˘‡ûGqx
ç∏wwQºFM≥^√jÎ^b†PﬂÉöÁ˘f∑¥Ï‚ØÊ∆é˘ùπï÷:_Kœıê%˘Ñír¬Ï»£Qå(ßÅÁ»¶sÙ∫Îÿ(tÆÛU,”¸çÑ}DZ{ipë◊ÿ∏‡4ÉÚ Uy®3Ω•Y äôE(∑È’		ª∞èGaﬁ•Ô¨±ï“Çà‰ÀÚdvî#1±†¶Å˙0#ı•≈íÆÑÔ,ÅM" .í¡<€Y?é¶!Ω≥oÛãèj¿<”À®•ﬁº¥£‰»!8≈Ω#˝ÙÑäòÿMÙ(J‘ø`SÎZci≈˛Æô€ã ê⁄R'ÂrB>öÕcP◊Ë53Ÿ+˛   ˇˇ çô@xúÏΩ€rIñ ¯ﬁ_·ÖŒRë]Äó§ò¢4ê»îò"EIeM≠,≠Â ú@Åà»àÄ(ãf˚∏Ô˚∞fkk3fÛÛ˚)˝˚	{é{‹√oê TuEw•¿√/«è?˜CH˛º ≠·§˙kÔt…–«,˚›.âŸóX|⁄ÖO◊˛hÌáé7…Z¥˛Öû}Úk'äiºà»¡¡i˝D«9˝[63ø,f,¬¿-Œ/˘"õaÚywß4«ºïÕ,q†»•1k˜∫Ÿ@‚ã~wGå#>V@ë∂1årˇÒ^Û˚sÌªœ¸ v|è|¶ÓÇ¥Cz∑ûÛûmäﬂup≈¬ô:Û÷ÛÙØ•∫9t"/>-òK˙'Yºzµædw±Ô“v∆ˇ Ø\áyÀ≠∞àeœ/≥àE§ùMüœ6#Ê≤Q¨nÛlsÏ|V˝ú˛®˙~%#óF—;:á	_ªÏKªG¢ÄéX˚∂Ω’“´ïˇ>›.ˆÃ1˜√^Â¿Z/n]:öÒyy,—àë8ÑüØ?t;}6ˇÖÃáÌûf6¯ú3èQ¸Éﬁ–êzZ∏N∑ı”ﬂ*F:ÁßÈ—w'ƒe∞±0·ÿôLc‚:k√˚Û†›7L˚Ó◊N»FNÄX¶;ú0„≠%±@æ—ƒâŸ<jè`\í	Ö©íå¸ ⁄[$Ùﬁòç€˝/nBç D	®îvy’qo⁄{d
ˇK˚≈n'Ìõ)LE⁄?◊˙\?-¢ÿπæM?ñ±» Óg/Cá]s$ãúø±Éªﬁˆ=Ÿ‘A™ÀO—‹Ò⁄7m„|Çá8&7ŒòE±a(BYL»åÖü®ˆÄ‡∫ÉÊSÔu’sﬂ√„.º|(,b∑ªù„‹·ú|Úáá,Ö'õ∫√búΩÈºàüïø√dh”—t(àÎ'OûêµÜ8"GÍ!ãoÛÚÈxcg‚√â‹Ï„°ÏwvHE{6ì7‡p¬+&¸≥§vÿ˝ùS‹X◊	“Û’øØ°I∂§.â¶¿øÃ†c˝!‰]√Ω‰ÈQŒw«U&)≈8„Ã%ª™G1~;√î 6ëh2\ƒ±Ø?çÑƒ∑¨Y45ÒíælÀhvp∑∆÷…¡srg\;˛ÿÄ1	ËÑ‚ÒZ[ˇ¡¯“»˜"~ŸÕ»7äÄÎåB>r~Zk—ñEOÿGg≤kËË„ò∆tü,ÅOe”≈ˆ4ÜéÁ?ÅhÏno|W⁄≠ó¸À˚èñ#ç˝œıÈF´ù‰øˇù¥ÊvÄÉhô˚Àñ=Ù«∑ò5Û∆Ø¶é;^√ëló>¬Ì≤yy∏êÕ˝œ¨¡p˜&î./†2úÿ‹¬eV§Cd
cÜ˚˘WΩîJ>„±K©∞F‚ò>≠\ä[,ƒè^‰‡æ∑GæÎáQN#¥s7ùÔ˜ﬁx15Uq∫V∏8÷’’PZ@ô˝bÎh‚¿ñ∑∞·¿	πÚcÍíwéK+6‹ÜÀêR}∏Û4<y:uŒå≥–8Ìã iˇÊ:Ê+Ëƒ˛â?¢.ªåQ∫^k9„ˆÒaK≥πb)¶€†)+y˜Øﬁ≥¸ùûê/≠‰®™8ä
ç≥Í¢™^…er´q·¢©;ŒŒ?[å‹* ,Q@ÛÚ˝«{ﬁΩö≤—ÏïºÎßºÃÓj≤Çë≠‹¸7råL≈Œg¢èCM⁄'Ø|»nLb7ı≈‰ﬂ6’y∑¶⁄º·‘ò≤ŒYŸ5#€ Ó~'¬π}q‡ÔàyEù»ü≥µ ª–¬8Ëxx„‚™‹=NR˚ÓZ–ö√§K_to‰.‡ É∑òY∏æÆÈ.NÕØ!@.Ù¥~ùæÉ\≥U®7øÔñxvîØ2µêyπ	W†‡¿Õ“äõÒ¬0[>c+æüÊ¸$>KÒî¯LÅª,A¯ˇ∫ íåo_˘	ﬁØ˝j’èë◊¡ß§ú∏^∏ÆYﬂÄ€—å—äb€∏ÀpyåQÖ”é˝vHÆCﬁ˛Ï¯.∞≠\Òãºë‡üämæœæÕ[~ürUB=R∏¢∂í£ä¶ﬁˆ|úåë|F÷,Áµ(,ùzŒQ0X∏3Î´Õ‡ÿˇF3Ip´.	ﬁ2h\{qﬁq›ˆhÜ ≈l&CXıàYá|,~ˇû¿ãpLCI◊jñ‘x, >ÎpÛX∞¶RøÖê™îÉs>Ü4óÖS√Zäó|ëø/∞Îeöî47)˙ÚÁ?˛üˇì\.∆tZ?π<k≥2À]jB∫ñ%^+ê/B<˙ŸÅwHøc‘ú§£ç(åèÈ"fΩMOÏn≤”FUkÅ} )Râø™…fˆrûôûÿQîÙúøeÆÔ“ÜÁõø>CˇÊÇ+Í ‘5uŸ´ñ‰¡JÌ£ï≠˙–`”˝˙ö≤w=Z%Z ànß®+X≥&SgJ2ûÂ¸[``sœCˆŸa7ÁpHcjd‡Ω„(yÛ,`ﬁ ÷‚p¡¥Øij›&`≈[ÙS¡ŸãÏ=ïs˝∆Ï ÜŸπ–^ﬁVŸÄÑ?ÄÆÖ≤°,‹~∫£>¬Z°ËÑh\ú≠≈èÚè~ 9?¸—t∂ÕáRzõπjõK∆^+€ÙZ‚˙˛∞∂:C}^ô#~ˆ¬©?¶.‚ø˘ç˜TâπÓı…ˇc<
Å~ß€µ±GVo≠^∑[csÀXù‚{4◊o`Ïƒ.¨‰hÏƒ∫Üµ¬%ãcÿ†(9}”’c•î¸÷UxádV@’é3ﬁ ôº˛€†^ÍÖî{Èè7)·]ˆÕÉ¢›,¢Ó*§—¥ˇpXgÂw"˝iÓsç¢ÖDM£∂™dX“6^Béá˚≥ülcù∞lÓ‰{˙aõ_ù…~ˆ”?∆ /6∂ıw®{:Ù∑È˙€9◊ùç∑’ÁWuødŒÁ_⁄t˚®àﬂÕqß±[∆≥ó]A◊	*lÔ)QA∑ã˜•N~ª¶ìWŒÓ%ss2õºx‘˛;£Ga¸„\ÃsŒ∆6◊ZÈuLC§ì N(π•ﬁÑ<òÊpL
Em√ı.ô7r<ß£ò∂¬⁄°ß‡÷¸Øå‡0hhÈR∑øí¯ñıüª»…Óeú¨µ˘¥BqzEπ[ô‘Z`oUtWâö∏”ólÜh0QÏÆöh*ŒRMFì¥´}ılsÄZÖzÎ/
ûÅπõ√%Q=ƒ4öE≠˝¨ï–€©\ÃΩàêÖéÔà3ﬁ'≠+Ï∑6àKáÃ≈èg‰>sâøhpŸ2CÓ7Í{(ñOBEÖ~éﬂëÛã≥◊GóóÂﬁÜÓBòôTù]p°¨‹’≈—œ«G)wDëo‡ñiOáæ«
ùûΩ;*ø_4<{¯•`êÿû∂£¥s‚∆øÖ ‹E¸ﬂÚÜ˚ﬁªDUtpó*ç -ÓΩË{¯P˛9Ù]‹ÒäøTP®r;•ûΩ.	ÜmâìêTb ÛÒ>ˇ;Ùooµe¨]	qUŸÆüM{5ÍΩ’¿÷˜)JYP:…O3\.ã	çÄj_9sÈiùˆ§ÛS].;‹ªp©–/m‘∏+∆?t¢8tÜã»¡õ#Ç2Y¿çÚ	.ô!√W¿≈ƒtAB'û3¬ΩıÄîÕî :C„	ıd7éÙæQê"ıdu˝¿=r§Ê G˘HwÈõZ‹5“{¶∞*ıHzÌlÁLW?D?‚*"}Ëıê”x'∑^CrÎVjU·|}ØªScÙÀ˜O˝÷ëb⁄πªHeƒûäEöíW‹ﬂäºc7¡™Ró®n'π6∞J &°3&¯$ ∫∑é˜Ûè}Ú≈-|‹ÊÄŸì ˇ]rÒtÊ4X[îHUº™pex]ÒÎ¨sÌ∏ ~πf-Ê∆E∑Ë≈Kôƒ!√<≠…óg∆nÓ≤éÔ’‘REÂÄ6ÎSQõoÃ7[tæ˝¢KÒ˙Ó„7.L˘”„∆%∞ÔR+V{¢óFe¡‚‰ oÜm4Å…#?ô5Á.˘ö ì/àŸõU&GïÙZrûvywÖ„‘qô7âßó5≠Êµô!e9∂π+Ò¥˝ˆñ™ôli™ú^‡·∑tLaÛ¿ıoíë˛âd√Î≠∂BÂeTx-D≤ÇÛÈ¿
ùâ«∆W>˘˚ﬂço";ó9ΩTﬁóßÙ—j√ƒí#c—«b¡hPZRÚ˛±î\6ò—ò—1Ü¬‚˝t@<∏°OæèùÙGã~úËnÿÒ:—.¶4ﬁ≥|<Ó”ƒMÓÑ?pè(¿Ô'◊gvﬂÂ¬Ò¯‡éœ.√¸ä±låèÀﬁ 'rpg∂pﬂÓìˆ∂nw≈#òé∫§ßïÙw‡?m¸O8Æu	˛ﬂ&ÈvzÎ-SgFìv##ü\â„‰¥¡l]o¬}6ö~ô+Mÿ–ˆnÅÌÏpTe∑»Uz ÏE~ÿ|a6õ@A™÷Hº2Ñ·#BLÃeÒ1FX»Xá*˚!X	8H!w
ﬁ∂·wù±Uô´ê{»n<Œk®ıAüŸÙIü„ÉÃu+‹"ﬂá`òl¸)1óÕrìÅmœ˚≤…Ωy◊∂ÉtrB?íŒ.˝Tùû¯æ¡¸R7‹Dè#zOï:ïŒ˘◊ñ}Î9FÒÿxm‹ï¿gÓ”⁄Y¨r\*
{~n€â[wƒ™õ€Öçù€óP0ŸZ—”•X∏°ò‹íìV”ù!±•S	äb—/·¿_CﬂàT¯ü◊~8∑	⁄‚õÀçdÊp≠Èé †∆
#ûúic&∂†%å◊·çëHÔ2oÔñyyÅyõKõq{G·˛≥c„h`hw,¬â+V<q#∫°3}{Íå«∞®Ç˘l“d1|Œ\Æ˛Ø?Q8:∞ı6$ôúÚ¢C?S¥:≈â¸˘8ç„ ⁄ﬂ‹tÄŒâ◊;£—&⁄ãÉÔÓ*Ç∆˝GÀéÌ‹e^‘SÒè?D‘2`wùX˙·Yê5ﬁ∞πî˝‘⁄’ı.ﬂ1<Ø/:Q‡'⁄"≠ı›_l`gÔñlµ^£⁄F<E6K·7⁄Ÿi∂«˘¨\Lv£Ã ï=Àë_®ÑÍ<‘]ˇÏïÎ√4Ûÿ„û„võ^2≥@1¸P€∞ˆ3Sê∆ZﬁbŒBgdî£“g{2Ö˜¢©∆ño›N≈Û†Hi˛lI≠∑´&™ÆÒ‚t◊&f_;ÒÜ´µÖ§Ù “™ΩkîpP±p|)∫À§Ç¨—Å•"«ñ$ÿÇ›ø∆kfo¿§Ç—]ú‰º9J+ÖÒô´˝$ŸÀ:6?ºW@Bºéõõ‰uGÑ¿ÇâÎ©Kh3oLΩ#!¡FÑéÄ∫GdpríÈ≥æÑ⁄.Ì‰5ÔcêwqPËÔç≈~xõöt÷†˚⁄i›¡2öûáü*J¿I•˜Ñ]˛ë˜'deòc´ M¡8πûì7”vÙÉ|:GÛ¿0ha3‘+Êë˜†xÔ]™OVæ©òΩ–Àñ˙¸CµlìœáÛ∑$√ÂMÎ„˝JÍÌ/GS~áﬁ∞†Á⁄z.—yŸÅ¥0aÒFu øÍ Û¢“∫ÆAâ%ﬁƒ/|∑Èkû≥HÛNâ>:;pÅeXò˛Õ˜4˝ ‡ïwq_ås-¯◊Áóˇ¿|æHªQ=Œ‚ÁìÙ◊¢e•0Ga©Å_$wb±®PΩå&Ly_”‚!Å–d(Y˚:5±TI;p≈kktÉy√NÏÃa&†◊&4ˇÑ‹˚ïç‚Äø√˛7“‹€‹GÀ&é∑#ˇËà˜ä[êX∏ÖsœUBì— ù¸yîZ±`ùÛ9V:n’G_XhïËû˛◊9ï‘vwÙ_§bhu√ˇË¯»o¥Äìm˝;0ˇﬁ¨ΩÊ\ìµ?ﬁ[Øl6p≈ Ó÷k:Å˚cŒÊ√≈åíO0ÊR2b1ùapGáú˙Sﬂ#Œﬂ}a?Xd˙7∞ãùjºúÿá‹ˇ•∂ñi<w_wåq§§,Í>˚√·Ÿ´´øûÒVïUˆ0˚5á	Ælz~¡f4 óÃ]Ñã)#lLé&⁄Tﬂå‚€˙∑Ñ`.@..f]”π„Ç@ß7Ã˝ÃbgD…;∂`⁄ É–°ÓâÄ]jpúÎH@«®`€Á÷ôRW∂Ì±˛”≠·ÒΩÉR~ó®Ä]g‚Ì¡Ø˝ 4#ú s0Ù„ÿüßù¶ä€ÙÀ‡â|ŒﬁøvØ{ﬂ˜i6ã¨IØèÔ©üˆa|1÷>È˛ ÷ç\[:$ˇ‚Ü°÷püÏu°	üm¶‹œ≈P›8Aaòmò6∑WïÜ3M¡∂ª˝˝ˆûls¿◊6˜Åπ#c‰|îŸê˛!gz Ì'È˝ô®≈9ÙjKFµ" h¿Ñs›0∑ÎΩkz=*Ï∏òzjQ†cg¨ÚÔ†EæS¨œˆÆª≤ï≈tË2XÒ(No¸«¨WÄãKÉÊò˛Uû8_I≤ºÿ“o$ÉL7Hå†ìLm4Ô∞^aaª_GC]vÀ{∆^3@µ”≠ºÓ]Ô\?]ìÑΩ∏=¯‚°…ÿÓÓŒ÷∂t◊‘ù â+Ù±∑≥=Ó≤Ü}DtÊƒ≈â∞Ì.Ωnÿ	uZË„È”ﬁ∞7¥Ì„⁄˜cN@äøÕ7æ·¡®ùŸåa˜aŒ!f¯¢†Z	Íˆª
Ï+tÇzõ ‘wäDN`qÅ¬u%áÊŸ¶Ñå?€¨_œêÆ´=kA¸ÊtJÊ;Ì?ø8z;8?æz2∏<&óG'Ô/ﬁø!ÉóóGÔ‡Û˘≈Ÿ_èﬁ¬†}…À¡ÛÛ+Ú˙‰ÏÂ‡Ñø;|yuqL^_úΩ?'WGoﬂùùúΩ>ñxÜJE‘‚t3"ÿƒ£øøº{˝&ÛÍËjvü|wó{fË5hU›X¶ır}ê]7»-∑ÖﬂQrV
⁄b&gW0èã£Wgá8ïàö∫F·,© aVÒµn|±o‰«„ì´£úÄ≠Ù˙Ç¥.èNﬂíùGÍZŸÕ'8xûyÒh{]œÕK˙vXæ\¸uó¡;Õjd¬o∂íÙ}\ãÚE’‰»*˝í_qíbs'~	J∏n¯Ÿ?h%Dg´[Ω©™‘z˛Ó∏¿©≤£ÁÔß9ÙM””ÆkÛ”‡Â‡ ‘Qrıçﬁ.éµ-RHó}y5∏zπ¸˚?N…È‡ÚΩ~π∆.ŒÅnæ{Ω|'Gß/ﬂ_Ëıˆ–FQCæó†∂ñ¢ﬁ≥Xvc‡c§T‰90∑/î*7!ïál¥AúÒ. mÄJ‹«ü∆Zê}w]ì?ìúŸXz∞í^û?B„íˆ
M›Ìº8|nzYºY–”‡ÀUZXÚi,©˙Í∑Œá|ç9√©€2Œ8ü.™x¯ªoixKo®g˚2WõeÎ¥{„6]ﬂÑ≈« d{,r®w(æ_K{]7ıß€∂ÙrOx√ÔÓx∑âü$NóÛæ≠ı≤ÜÍ∑ª⁄ÚÕ‡¯Ç∑|èLu“rÖπ%p@≈Ã±g	;À˛ŒÒ√uàÜÏÙçø#8ÖıÔ˛LZ‰':ÁñOÎ˝Á™AÛ,ÂDÜêèÎùOæ„≠˝ÈO@Ω‘q·2†ﬁA´◊ki‡†“C<›¶[√= ”ï3¶3B«î`n_Be	£çX¥†NBπ:K,≥ŒÒCS)ÎΩ)eä,Æên¸mvTäBâ‘W XCááüπl∫°˚ï˜â2JÎ9∑Âê38F4r|è∫Õô–Ü”Mkg,;„C'd3¯Lﬁ«tﬁàgñ)R9÷ªHïìiÁÎÖ7Y'∏Éˇ»’íkÎ?îu¥b,YøpÔ‘Ñ´ä>∞î]∫†˘ÏdIôoBÑöÇr›¯ »ıëLtÙøa∞Èj—§ª©◊O)˛©ÜqòÂÙ|˙àº9]ê'‰ÍÏúº¸|¸zpu|ˆé\æŸæIWíﬂTóÕÛ∏Tù€2¥´πºlÁi¶»t+∆´*çReÚnñIÌR˛rµ8U≈¯\µÌƒË¬˙,4‹)—DF?• Ê<N˛t˝6u€xÌ5çF≠}èXrπí+:$/y‡b$Õw[≈àrÄ˜d*¶PÂ…Sd%êìKM≤ÜäO’*+ZkqÂé*°t)tí
¨_K jï!¨&?P’wPz…W%s‹.Ãã%(ﬁJ=Œ•—πY>Rı€e±›zZ'e©+π#ôÇ•¿\(ó Ì8ö2ñ˘VÔ†€)xÑaGä’ö¨´c
PÄoOpﬂ6ñú“‡ò±r a~B‡=yV°Üéí\ópíﬁ>·GN°ñ«ö:ÆrvÂpÍ€]$1îíDA≠Á<º·î≈°3"Ø(z	…Sî£À·Ü.FóªìZtπ*ÓHr§¡X;∂Ω<Âì&Kµ›∞ˆ—≤uõDAÖãƒÂ*·TsRóRêP˜µ| <ñ¶´4ÊÚ|E]D∂êgœØçôD¿¥Ï“êôµÛä‚ë2XƒÆ–◊«5´√∫óAHj v)ƒﬂJ°C9ò–pØM7Z»Ûèx.í‰“Ée`ı5E^sN]	ÀˆLdäŒŒÄMŒ‰Ø{
ÆX8©÷x˛¥¿˚O‰Wã#ˇOtNN–≠*|<‘/-X˙B‡Ò´„ΩÚ.ÄÔ#∂∂-Ê$ºÙbN˛L÷ﬁÒ<¢kaYÀ5ˇ›ı¯ﬂRá‡˛;;9#∏“b‘¡R2!‹)$óû».OsÇÛxá'Õ&∑ È¡ÑoQm¥Rû:ª„ì'AY·ﬁ8√‘áø'‰Omp ä]∆ÙzYÜI˘ÉB“‰Â ïóGˇÌ¸Ï‚ R–)ÿ›∂=;ÍÙ{∆Ã˚∂rR>ƒMR≠$ÕYŸ	£ﬂàL¥y0ÖT‚∞Ø.TUùF»`—¢ˆU°äÓáæ)Y–≥d§BWt˘Ó"f‹y∞ΩÖ!ç~–ÓmˆI;è<øÂ_TÇÌJ?sº†¢É/?"Â6ˆ≠i
Äb∞) ;Z 4É,ê`ıF¢k› ú¬SØ”ÈËze«kRøÄå.&Ã˜^M·d≥,Â∑D%zYc†ôw¯`⁄x¬zPp‡∂ü¬öMïMEï2+bsáÛb€ûÔŒ¯£E¥è>dÌ~ÒCû.E>ÂFÎ≥#pr D∂D—‡∫®ÂÆúÇbˇJNYjÄ€lb©+˚Ω,›Zy˜™uz±ÿLi#E˙Ã‰‘Á‘Q_TáêÂ˛gœ/Ÿ|ëóçl‰-ÓA#¢Z¥Q£…ê<wS¿3&˚ ?®G£qÁ}“9”î◊5Òâm∞9ªZüsﬂæïp9ÎÊ˜è«ΩΩG√„tõ,09gEàV3TfETf®Ã~7®|Ö˘uAb÷`≤˛*˘X≥uJdœc"W√ˆºü’–˝Òê]Â≈™Åï>4øq¡(=<[˙¬æñ"iûÎ+OÜŸ jııjuBñ´™t¡`U)j´Ae®„°XπV`W™¿ãhQ@ †∑S —π∂b‰€S ¨Ó†≤“˛©2xÊ≈3ıiùU ï‹ÂaZäﬁBÊiJx!Ûƒ:m(èeQë@!‚&·#¬‚x5xyrd/·⁄—óD‰U¶f≤î[≥˜ìÚ(¿Ù«˛ºçBﬂuáT]¸[ƒH§îJÙõ@î!S$“â° †ÇºE(UT∞∏açWC∆"Ùv/û,∏äÖq!{[»ÿ∫¿MáI'Ω›§ª˚MA=ıDO∆P	ãÆ}Ñ1†¬‹’ûËIu°ÈF≤ëÈÏL±Õz}öBœ†±tø¶®çf'ê5Örh:M·ôÙd¯XrÌ'goó∆ÌWy@gøÍièà.)N
H)èˆ-I˛((KJñ2◊ßœ/nß¢O©‹ ä≈ît)Mo©ñªö˘∫%b Ãdï§˜\Ä¬˛E∆
ò{)7ëEù]ªÙàË±ØF9)èÍŒÁVÅ;Üë4…Ù°>Àeõß±jﬂp<.´®<@+‡I]UÏ+˘&ü√G”H[HöÖ*Ÿ-ﬁæíˆÚ[^ˆ+.Ïs√)√0¬_Ÿ˜¸‚Ä{ŸÄ∂qU6£TO«Æ}.»f[_acr79,ñ∏Zt;MŒ‘ê˘Â≤≤∂	ªÒ)†â§ÿ<VÕ˙ı‘ˇ4µßˆR<˝‚˚&I∞—µ:°„ø9Üj´Úe9∏ã©∫ŒF6üKÃ—¨ìtJiÊÓBzÔ∆J3ÖÁ%R3’IÉælrÖ‚”à¯„9˝ﬁmÒØR√›å⁄«J>ÏòñÒîMÕ	rÓä‘Ñ"W#3?J6Ô—ïÍcô˘5oÃR	2Ö…+)ˇõ«É‘Ó•’óHoWŒ2Â&I†0¶EçÎ‚”∏úH˛D,N•W˛)ıËÑ≠¡\-äã»∫Pé$Ç™ö‘Ãÿ”q$:I{lVπ$å5LÚß¥ªΩ¢∂TÍ:≠hP(rPV¬¶◊°QÁ¯oP≈§¯$≈±_bnπr
6€>l/	, ;£Í0 ŸcSª=TeÆ•=Kù∑*Öé?$˙Æ∂˝%•In[ﬁäPËı…pÜT∆ıj‡Öwç ”Ñ∑ÁMÚ0w.≥ïQø_∫ìî~jÂ“‚P∫÷FƒWB‰•1Óâi?4[Øà®/¸,O≤#~‘;ŸY}Ω~ØäãÍÔã(Ÿã¡´∑«Ô^cT÷‡ºQ4F®Ÿ≈B%Niµp%I|“^ZÁnWÌ∫VÌ∫…jÿoI
«’+lø∏5õJÊTóºìÂ¸.E⁄ıø‘cµ–U3î™ØÌg:πÎñ©A@ûTÈ†ÖIu‰{ s‘ô€Ò·^Úï¥¥“ÖHmqó'(ÏÍ/K^ÿ#´π1ßA‘ô¯˛ƒeùë?Áü_¸z]lIX¸Á~C˝´7πÚ∑Éﬁﬁã¯ÄÅ7÷ä<pe˙7?.\WDˇ´Ì…œ6≈hÍƒØMt≠@◊ècÔ⁄'X’¡•∑ˇâ:*gŒóËsπ+\0wπÀkä÷õOª<s„8Ñ NÜhcMQÉËïwµ~±íP˛¥‹Ñ„ëk:ÊˇFÆ√ˇh_á˛˝A≥Ò"‰…tÖ˙Jßy7’|·Q›PLF,j±X'‰ø¡gäˇ)≠'ê fJZﬁFœÍPéJ:']S}J|sâ[|4_°»äû&ü"ΩzæãíDË|ﬁÌÏÁiUu•\0∑«ÊˆÍs◊DÅé‡:∫Eaù<#[›äˆäGÏó
ΩŸ‘U1Í®Maù©¢ˆÆ1*#}≥ÊºŸ'ˇÔˇ2∂Ω;•Ò¥√ahπÆs´ä;À†°Iòèä¢{ñ5∆‚yp≠¯ ∆lÍÑ˚w-bT ‰I9Õ»,uñ@›Tç&œ˙yØî≥~∂» ~S—e›œœ'A'f‘+í´_ï√6t•RJ∆ø2ËÇ8¯í§>x]À”ˆ^Iä©‘^“E4î≤z∫ÁµíOVj≤"Í ≥>≈0«SE≤Î√Ø‘{XíWTÃâH çUZë£LRî+∑´ÕçâFJ~}gÃ{%ÑXr≠7cp*à#4/¬'≠◊›±PÕ‘‹÷¯$
!MP≠ØuW3®?L î¶i ¿Ωe X—DiÄqJÉ„—C@bâ(4•◊]3Y˘≥∆W$GK<‰”2÷%"üM∑,ÎâñRfôj√çÇ1‰'ÑËâ“¶	L‚ñrbäê4sÙôÜ™„“¨£“tÚhÍ;™lÛ[ƒ±ØN!kv1bŸ’®Bgïœ∫»rV€ñ≈ÖıÏ<ŸÕAbMí´ó≤Cx+\Zyr∫$œñΩÉÎ]•båûBZ∏ACáA¶·Mé!§∞‚ÅU©i#ä„ÿyﬁ£Ã$∞£3ªïì}´‰U€I%ıJY:ÉªAÖ◊}—I*°ÊêWıüØê‘R|À
ÍÍ∏Á2~ÂFﬁ1Y2P‰´‘Í´{îIäÔ™pÎ$Gì¶@—´…Ø®{XÇ.≤•Sﬁ‘kº–ΩM˘^ÆŒ…v◊FáÉœÉT¡5à„6“•YQ<YŸuîî®‘Ïpè‹¿°ô∂Î%"ÀºF¢ª0¬g≠PKÆ—∞0=’u/Uµ"ÜWLJìUäG÷<è/®bµ!¿>ÈNïÈ#}äõ-…XaØjÆßô/ÇÕ?µƒ'-!ú˙a⁄Ìr≈Cp≈}6j(≥%Ÿ®%Mz£÷JJtLOó¨cﬂ§Ñ}ÒåóÎk∂Ä∑jãåº
»ˇ˜?˛Ôˇã\Ç‹ë∑Ãu\TO◊ÀöT›¥•˝Jöd[í¸xô˚u%.¥‰uÊFU†q√ä*≥‚¨Ú:Çù	ãπã0Aœå∞{j™HúLL^”|ØATbÊüiÂ´s2∏:2œ  «¿®›3—Œ¶ƒµyŒﬁãï≥QŒ„2K#÷ﬁ=8˝Ä
5 öÖ˚Œ¬ «∆πÒZ§Ñ<¥U«Q!¯ï≈‘i‡Bdt*Èå!ı2â-'HÖUYáU·ô∑∫
UV4ØÑjÔÅƒãËƒô“ò‡§ﬁD˙WçDò€O≠≤…ÊV˛BœaËﬂ\‡mmﬁ¨OâC®›ˇﬂ÷µè!¶\Œk◊…»îﬂÃ‘1@0ë#‘˛¨ŒÄPÔÌk€['‚í˚„™t˝◊Àwy%∏&µYNµ7∞>n›˙ï´ë∂M£BÎé˜¿ÁÓÂï÷À’—Pg¨¶L˘YÌ`ZªS∞‚n÷_©ÆöÎ∂÷”ê4§Ë’:Ω“∑^Ü˛åy≠≤á]“	-E$-ëâ*ˇpJQá‚·ù“í™.5ÆÃAQîZ¿&kã‹¬ÊC°Û29rÈêπ@DRÃÄ∞U6?Ú,˚)t≈!)∑p`–}r®L'¨¸SR…¶ï«<†¯Xn#6l_lå#÷Plsøaú˛[ﬂ;ëC^Rg¶]@= €1¯7:‚µ÷5Â©ô_9·»e}Õjã"∂j¡ŸxÀ.˚–ô,<:£ﬁ“k>ˆ»˚Hø`ûDQ≥“`ÆvgìAñ]Â≈"¢≥ÕK~v"õÖVít›Vg≤<ñFˇM ÑJ©(°ÇQ:!å
ï’ø≠Í6{µ{M*k»ÎŒ(##æveLÛÑs˙JC'íﬁïèRTc>QÅk'·Á•≠x-'õr ¥øiô⁄◊JŒ*4Ê»oÊ+ˇhÏƒkﬁ¬urÆé”À":C*Nïçπ©‰S0|M\„ö˚˚÷l¯e´vØk»]SÁã•˚ÓçI¨›{RaF%¿»ŸÜ*}L5jSˆ·ÆÃ.;íDùùK'‚ÎÃ[u√÷qô±·#'î‹¢pã<ïÚVø`ΩóπâBV"rΩ"Á˙‰ÔÓdå_a~\õ^´Ib%-ŸGwr\k’ÃMewÇÒ≤⁄-ç
≠®˜…ƒ Ù›_ø¶ÓÕÆE{X¡çD!⁄)MΩ|L« ÛCg˚]¶˙ÄZo% ¡π	ïh§rã˝:i∑≈9G§ö†º‰†R'RçÌ»ÃÚæ2U˚˙Ω ç
$ºÅç&≤ *Ãá“éjÆ2¬à£Bï=[^‡P\»yÖ∆@JDÑ∞Éµº1%RÖJ+i‰ñ‹ÌFÂÊd¨T∫*UÇ∂8q‹ïW+*Àﬁ6©i*o+Ü3ÌZG
≠)ñﬂ2ºÃ¶©l&œæ…àÔ*nCq·ë9	à”P¢‹®ñ-ﬂ*\3∂DÊR{ô_i˙0å∫k ⁄ß{€ıX©ïú*´∏•†‘QêˇyÌásk?Ñgâ∂¡∆yê∑_ ÓQ·ò7Éir…@jFÂö˝Iö¸R≠:¥–2ã≥"Wxÿ©ñKû§¶Ê∞R6◊gëh,ﬁ.Â“ÿ)¶“∞^>Å¢»o’I9Õ»N)ÀàıLJ…<v∫eÉ„£õﬁãP0MñI;}#g8dM…¢ù’r∫cˆ®ÕÚLÒ∫åéM|B˛$@∑ä¡⁄±†1
5\,Ï»Ìÿ"›P7§íQæ8 ÎñhŸ:Á˛òπW∑Åq±+‚WÉåç∆"B(Y‡Ó-Áaé∂©Oª‚[‘@ÇœE@ÓcÖEºGLÑmeÒBbÖ¥soz§É8˜Çãk9mëÀtıÈ≈“≤dx¶¸'„Œ „ú∞X˜nÒjñ¸°M<íÖ„/^THÜWEï¨§9—ÏÙÿ8LëÁ"±˜k:MV°tÚ∂|,>¥±ﬂ gıXFã_ÉófÚm˘‘Ò2®Uv««¿[ºúò∫Œ»:À»ÿâÕåL˝‡É"/yΩ©J§°´¯◊¿≠~C‹2•HfPt˙≠PÀn™¬°rY:ÿ ïp˙4`ı˘ê_âÙ)–O®‰≠YM€¥fK§3´X∞Ñ∂ &[XcÉV˘±H3VˆîTmØRºb>±F©¬,éﬁ%ãc`*#{?=[OΩ%∂óF∑ﬁàÿo2z˜å|Ô⁄	Ákﬂ–`Å˛z1Ì≈«ıuÀ‰wÙÜ:1πü¬àu@¯a1;ÙGã9`Çmf≤ñpehôr d£&
PªˆV¯k∆øP¥ÆÌÿ*;≠f.◊èâ≥W!ç¶˝á«ÿU∞	‘ë˚2kÅöπ¨Rﬁ,kñºRÚ]îY˛JVü<¥iÄe„ö“X∆úhrï …r2ÿh¯ÁIìäC+èyVºØéIïXïF=Õ]ïßp‡æp!–yZ©^ù∆AcrTaÇD¢ó∂ï|π¨ü¶èÒo@Ë pM‹4ø∂{JwY)îùﬂ{Ibã{ø£Bñú¯ı¿KπØ—JûFXiLÁ'ˆâŒÄóq·b =ç?É‹ÓóÎD1¶˛∫NjÕ◊}ç$¸·◊∑.€òï≥.d˘c◊~»ˆÛ,'‚3O7°˜=üç¯
SÙ”I¯gˆ˘ÜÎU”'Zx˜°∑A˙dkÉloêù≤˚ã∞í∫˛Dc#ÂÀ·ñPhW“eÀ	\ùSπ2∑_nWdW 7Ìß —=≠∆•‰d?s)zXÂ<e–6‹?”ª¬?ªú:Ãsg‹Ùﬂ[FI¶ørµıßwe±Ù÷7ü…ËX,S+U˜Òö”Î∂ÉÿuŒ¬≈êNÅHºE÷y¬éë◊Ùì:!ëŸ¶°∞h<F{|z˝˝≠.9?%ˇÒøˇO“›&ßG«§ﬂÌÔjW†óåMºùZ€ü‰Ÿ®PÍ‘∏Ñ'˘ã!÷Ô;ìJA·Ù‰Ê 6@nÄX˙Ω)Y„˜π.«p3”‘@Bö J¡v¬0ΩÃt·≈ãYV°µÒÍñ≈ÓÅ7v»%àÇÄP´Ølåô\js„πR‚)êè…¥ı¸" Ωùnß€Ì⁄ÉÎ‡∆  Iç˜®ÃGB‚ºÃ¶ﬁüÏ
GÖu:fΩ·©B2ÁhXíÎ-ıñ$;›'HmT &EÎ;†”~8≥◊PäRï«Á˚§˜¥ﬂÈÌÓuzù^w˚!l•u' Ù*khã◊∏¡¿Ùu)dá¶p‰däº?~(WÜ∆?™∂ﬂ@bëuÏK¿ºàEˇπ$∂o,ﬁÕ¶ Å—Ë¯YÒ!õ¿#Eù¯û˚Ë4@h∏¿ÿíhÉzK…Àóß<Ù$êùqì§qzb”ÒìbcVØ¢ﬂbN[Eâe°r‚bËFWAtíç…‡ä˚¶¢9Î—ì9Ô⁄àø≈î˘˝Ã	CÓˆ˚h¢∫uöƒ=eöDç¨i≤ÖZ%R¥ˆ
«Á
’’t2—gZüu≈Ê∂Ÿ$©¢F8K€¬º◊∫¸Üı”®Õ“c∫ú`&úﬂ5˜Ø!%ÍÉ‰î◊u’‰‚º˚†ú±Œv–a‰'&  k@⁄¡‹:d†µ˛åh/ù$DW€îŒ·dBÎm ˆ›ÆÆ%Êª∆(pä≤_møxqc¸2HJöv˜Íü,†réu\î/y‘#úÒK™_ÆÄÃ)Âe_\+»Ù9dl@ÛñZ;’@ÎÚì¿Â%ç≥«ÉÃ)|ã]‚ÈZ”\≠∞yÎ{—bÈÊñ√¶gã5@¯˝xÄπd7î‡∞íó¿*≈dÌggˇ˙·Ì∫l≤∑ÌÄ”Ô⁄bN∑ONô‰ÈÅ"øt~˘™πI+ôã- /õog}|L≥åôäÙ•ÕÛfVSiW/≠S‡gkŸvdy∆Õé0lƒú ∂çà±ˆ–Y¬IJY∂ƒ¨|√G‰¿√3˝ 9Ê¨\√wÏ\√≠ÁÂû+ñ≈«EM¥]b)ü€M∏[XD.4Ÿ‚ß≈5OmÇz¨s(	 ∫å´∫Ùßsƒ0 eëesÑ¿·ö £·ƒ#ı’íIûå¢dc·1GîÏ*Bd°6Af…\Nl,ï“Í&•*∫‰¶ΩÖÙ}´_Ù‹ÔóUüÑ◊’B=N{∂{ª`≈ÆR\R*[*5%uº?t;}6ˇÖ€ÛÚ’k¢"}”ÀÖK±Ëò\‡T‚öÃ”E¶ºJ§}´	°ô†ø◊Ÿ>ULEÈ⁄RWÔë ŒEˇ∏îDs+$x∑m9≥∆j¿4'æN÷÷¯Èñ.}r7YDÅLeÕ…7ÿ"•X¥ÙÌˆˇ®Ô™ëy\‘‰Jíwg'|ØbP∞<«Ú“ÆSÓÈ¶˝÷Àr˛á¨"°aFEòäÇ-_⁄CN|Ò∏˛ÕÙo2AΩ§Í\*4RıùHkmãÌV∑ v¬π|°é )V™,◊£ƒ≤ü·øﬁu5µ∫°◊sáΩö“0÷ﬁü–H{ˇbI•ç˙F<wXãE9Ùqhm§Y«∂wtkÂ’\-ëææ’‰ı\ﬂìæwï·ı_Ùºá„¡V\ ´∂àÓvª˙∆>‹†Y„=C„ÄéëT√≤†;˙∆∏oAËlÒuÈú{,ﬁ+Ü>GéÎ¥˛u˚«Ì›£cl\Èù^˜Â”Ω^≥w~‹yz‘}i2ënj\˘æ;ÅVªiFylS;l+´CÁXŸÀüi'Üo©¯†(ÅX·∑ê√+^)ÖûèqœÙ¬†ÉGû<!Ô—1em{ÁèÎx_˛Æ@T»‰∞òRÚFﬁ≤%k[ˇ¿ê =,ßó‹vz'ì¨ıª+¿ËArı>∏WA4ö≤Ò¬eµtΩcz{ß∞ESr@÷Ñjsˇ£∂≤0ZV [` ¨À¸WF√µıí~«ªY['&ΩoáØ¯;Ö1*O˛pHoœÆ#ó‘ …L°UìYlê^2É€r:˙ƒùbú§î~Av…>|jìﬁdsì∆(t ÷Ühe¯àŸf‹◊“˙!˚ú≠£∑à≈Ø®ã	Í√üvS/D™*O:™ºUY≠EÎt7`a’Êï/J›’6ÀÉC˚;^ﬁüW\ﬁ˚¡aÖfY-’}·á≤˛k£Ñ®º+`
]øb®ªe(=∂º–rgT¯Ií$O$LbÜÙ∂ÉUΩã†ª#"©◊~Ò‡ÆU'º^Ê@◊˛=µ>8eh’`ë0à√WN∞˝0„®f1*L.]_§«Ót:…î6¸çk˛• 08≠Øi<Ö[áaTgTÈ+ù”ˇqøút|¸Å{Y§9*~À)»öc	A¥â^ú˝tÙÍ™E˛NZWÉÀ∑¸èì£¡œG¸ØÛ¡_/ŒNN¯ﬂgWoé.JI≈ìlƒíπ∞h:ö§sôp—1…œ˜~A °ï†Ò√#:ö¶5h™πÿÉ@MÏaŸ∏'°√y€r#ˆS9î„‚°E“´;‘Oû»ﬁŒ	Ñ≤ÉºIô‘Ïîe‰Ëãh∫V∑e
|êDq&(ÒÒ\ ï2:F/›}Ú›]R7È£‰≠2æ‘§©©ÅõÒCÍMd©©˘ºr‹ÿ'Aß±⁄ˆæ≤3EF(ˇªDábÕ
X€\»1ÃA@†4^V¡Çïp†ÜÃ˚Øÿ˝tÔØ N∏ﬂX	æ©ox≤›ú$‘Æ¥|ßoÏL|ÈNóˆ9VÔsyó˚Í2˙ô]∞_¿aˆ◊ïR∑úë. ÍÒô;˝‰	·?Ö±%â(∂˛OJ$æªs;à˜à-Æâ:àãCKIÎ˘dä„vBF£!
ú3ì9ım? UåYë√¸*"u~Å]ŒZÊ*J°óv
ˇ˛wÚßwgÔé˛ÙC˝•Ñ)„Ø‡Np&˛Ø¥OO€ááÖ*˛áÙ’¥∆»ˇRÎ]d©+`s6‹ü·\wª˚¸ˇ[Îıyq^≤˙∫ÅÌ’°˚™ƒˇ´∆;Ú∆4Z"√mê˛÷Ÿyäˇ[/¡!(†Û<;$n¡;?ˇWﬂ-n6S±Ω‰ƒb˛q(ã3ﬁ¨ñeë0—úP‹I*"rz$h{∆ûæ(¸Ωü≤™J:§Í¢R∆4…¶©(2√óR§X°éó)Úº˚	 4"mÑπ´Ï†Íè@°fˆGi˜q<Oùà|ÜÌÊ8^z—e1ØVƒNéàWŒú≠≠WÊíúT˙Âí^≥„ù·∞ƒt ê˘°÷πSlQ˘ΩÙ·fÍ∏å¨Ò…<;»I‹’Ö>û’GÆ„eﬁ˛œÆ&%·IYpåÁÚ&À√bá›:¸N1<ße0p∞≤7L®ˇ»ø$˙Y<ƒ∏c˛ô+ôJÉ&ÉAÉ£Q>˘ﬂıñ’#RO-#Ÿ¯*Ω˛À——€ìø÷(6ánUîË˛“}ä@†⁄ﬂ◊G«R6 À„•«Èm7ËÙÏ›’√8â¶#®pQ™™w5~l¶áæ/ˆ÷Îí`ÿñD¯,Üè©¿e1¯2Û˚cÖå%is„Ü¬òÒñ”HÚ∞˝àN©‘ˆøj¸“¸6/Y¢àd£^Ly>ë	“m" oêT¶'<”¢+˚D«7 ƒŒ\⁄aƒF4§ ¢®>çWé9≥s"&è~ÓÔ——_k9]é≥,ØY¶˙7Uƒ)¯-˝ìÎû€%7ùö∑Ã6Ø0NΩö≤œ°Ôù`S‹ú&¶G·W•s>’$vv<¿–ΩÌ‹˝Wõå˜Æ¢±óÅ^mæ≥⁄÷Ã‰Òmm+/ûª¸æÍLë⁄\ã{¸‚‚:∂Åè^¯®®cw‹≤9ı_j˛n‹U,öÔ0_K÷ ≤øœæ»Áéœ›á0¿∂Æﬁ·?9:‰üﬁº«~º8∆.W¸ü˜ÔZ"äD—AÀÈ≠!¥ƒ\íÑó@Ozü†Íâ/:b.ì¶‡Q´LáèﬁÛ«4oÉ∑∂Tñ‡?4t‘∂∆@2}ËÀ]n!D(•4uƒ2∂ÿí≥¥º¥ü*&R± é:nwÁ‹,¨“(`#ÿÂ_4d´≤©¸$r£+-Óö^Ú¶¢a¡—†Æπ)¢Q˘@èZHîGS*äL√ïuHFÃ_4B (ÔÇ-;ëƒÂïXãœöø`ù‘ù",Búc°˙i&fÅlœÊ>^~KJeä‡‡:ë7H‚ÓÓØo¥Ozùnﬂî%µaJbê/ôgÄçSOÙ8◊Õı'EzëEèº}.ÅΩË†∏%‘‹≈KÊ.€Å„∑µBc'd3ÿ·ñi≈ÇB%ËY(PfìÃóÁoæHÃ	á,¶NÉ¸Õ—?Åw„!få÷cô	ãu®J$6ÁrzùŒÁ¿eRëw–èÛ1ªv•6¡,<Ëw9Ú√v‡;‚z/óL3ñ¥J®∏∫B[V(ÉSd’ûÊ¨Z?Oí˝Ü)AåÏìRf¿*+àıM§’‚™ÖPÙ#Èk>úñó©IrlØ$Ò-\œ…˙Ç"K∏RÙZ©‹±r+õ:!ûôy©˛Á&§Aíë~ÛÃ¬Ê¿øúÍD@ﬁŸZwÉl≠Ê
9´Ò#ùœ ÿ(◊1g‰ÆUÅÌÏ∞õ|#∏≈iA©¡Ö≈ÔÓXR÷∞Y‚·
ÒxG8*ﬂ0¶›V1ÊœùÑÃo°E¬ƒ€&ŸQ7eNIñ`BQ})%æ∆Ù∏Y,K˛∏ïÑ?nÛÉÌcÕd$Î¸;uËê∫s¬ß`åÿÆF{Qœô#¥ƒ¶Xë°nUŒﬂid1’≠zˇï£fãzàm¢N^&{∑t©U¥®c(ƒ¸}›p⁄44≥Ñ•⁄,≤VK€8LS˛&´ºL‹@¢I–úïÅPmü‚c*5∑	Q'∫[[ö_öÛ6q‹Îz‚cÆ‘!©¸Æby≠≥è∞≠W ÕQf∑0Æ€∂ÜÑ>ú0œ◊€’fÿ0e™Z]Áì≈€[∆=ﬂïEtÂÃ;¿í«kktÉ˘F—LB&q“&√ Wjıèµ"@KÖí ›2]EAiòÙ∆Ib≠õ˚-)um yÕ SémG”(cÂH™ÕµCj$Pò°dÚì^zxuCU]cîNeÅŸﬁâﬁ¨:YV"◊ øÊÏ7D&L§Î√uËxm∏Ö&àõùªÚZ◊„ÖpÄ)í5c∫Më™P„Ï°¬È“Á.¡ €P’‹∞4–E˝§A3—Ëõ≈*N0ñK?îY/≥Ï«ÇE„	göÊ‡¥µ=ΩêZPªk®6ﬁx¨ß2£—”s8“¸˝èã2ìWŒòŒDa ¡5ŒSÆq©¸ËK .v¢F#„'7q6KsÒ∆=µ5ÙÑ!Ä…&y=MÄN+ eõˇ"À:≥TRP‚“!s1Bá;¿¿¥“∏ Úÿmnƒº?Ê°ı03dπØÇk†]_«s<ÚÑºZ` FiTÄ]?ß¬ïüˇrGô≥ÆÂ‚Ë-&.Ã)…√QË™‰˘pâSÕ"›Xn¿ZüÜöWòëZŒÃËsQH=jîe«wW∏Ó≈Ñ˘ÊÈ6+îUy‡$g∆/%_›Ö‹ΩÆ$ ÆU¶Ui#XX—≤|;ñﬁky?úﬂ0ïˇ7\]Ì-&I˘DÅ™º=?ñ ∆ÉWX;¬D7òä	éJ}πÀ„<œ∂?cçXcÈÚÏ¸ÆØ¶v¶’¶ÉÖªº◊U∫‘⁄∫k™‘Å≈?V¨FµdÒ&©……†{úM1π‚UÛã:O÷”Ì?.£RÎ;TØ¥ÆGÅœßm]ivrÆ.∫DìÁO≈OkÍaqiâ<¯WH|aeÔÉB¡◊Í–%˛AsÉˆ;;)mËL	V=û8¢¬”êg^t·`+!°Jæÿ¶R‡æéëdæ¥wx°W,QX4#=jjH∏µ£m≈é/t±B“ÎÓ(∑Í–øÒ\üé…¿¡)vf
xi‹Ö3ÉÈõ.pÎ,≤Rj8>Ω⁄Øí^[Z{w´Ø£Ÿ´’L3zÁ˛´ï˝‘§Í^-ùì.E∑Ñdo#…ﬁ.°iıé oØ≤ÁIªÇìRùû°wÊ*Àéx¢pÑÜp˙(•!˚siYúŸOÚ\˙CÃ˘ ª¯Ÿ§›•n|–“5—ö*ÙIÜMä!À¢íˆ7> :æÆ%mRóì>/eK¶ãºØ~∫∫∫vÖ≈öú-~‚{xﬁÁ_êì≤fçT=Bg)y4‘µ±€>nmOëiÌrÊá)ãb.¸¶íå”ƒÅ©2oØ≥≥ŸÎ>B>yÓ‹j1æπs˘ ñæÆò®u—áï'g›']ìÔ I];
/µˆv˛ÿ2ø®KÈ´'tÜDõÀßKóÏà∏C‹…æÃ≠19KºYrª§Ê–∑}Z‚Hpâ…Äo\áé*˜o
#}B˙fYÊÇòÙ˜±îCˇ	∂Ù
µΩ-µ’W_˛∫€∫›¨M5\ÜQG$Ì,÷-ØmjuOdû$ÈMP´‘RÚÂÕ™⁄ñoiS' †Û,˘V+˝è•ô¸∆™àæu&,9QÏœ•Âı´|(ıË'^æ≠ödÜŸ üô7ˆCÂ≤¥Ò0Ø ÊúËÎmóe«•äÇær¬ëÀÙEó∏“'Ù˘«æ¨ßå∑óZ#ÂéI∆˘Û´¡"|‘õ,pá~¢∑T·6ë$;≈¨∆òwê2ˆCEc◊Qëh§ıù—0VıöÊë‹'[Ú"q÷M„tB⁄ç‘®]7‡,0I\™üË≥‘êìx¨_¯œ°â°Ú`a·óãê’ÃWﬁÎÕ•øv˝!uIRk`¡fÜÅ~Èóãa∂‹º‰S6Vñ(,¨◊∞‹3èº¡2*ñÎMÏΩ#§;±N_gî∏ Nt£—Kîco˜I{G%…KàÏ⁄™¯r≈ñR∑≤[µ‹“{U+µrRﬂÙæu’ºj•£˘˝åÚÌÈå¶4ƒk]•Wíû«‘FK’‚§Í,>à[®^ÔïÖw5´ØçuKV ì)éΩñØ&â™ô≥ÙØøä4◊ΩxY|“æ™ˆM0oùX°zÀ‘bÉŒJf]ﬂ9±ë’´Í®•03M–∏©`πo†•ú®>¢Èy^P≈Ö<•tz¬ä\ôåìJ1ÓKÑÙâªZ·ÛŸ)ŒÅQ[˙R5ìV%Œ1-]zã›o`>5ﬂcëc–(>@mã’†2tÿ5GñáDzOﬂì∑æKa◊—ãA∏∞≠Z«¬
ˇx1∏Ã‹©÷CKdÄDá4y´\–µ‚ÏT¨ÔZ°	ôWü√J‚ù~∑u¢¥p	ZJ‰óÆ∑Tæ6ïdz›rçˆ&≈lÕz{ï«˘Q°0˝CÎ:Ù1ÄuM»™<|èc∞˚é˜ŸwF,˙ßÍ£÷«WT}ã] O»ù8”GI}ß“∫0à$	ò'F⁄ÆÙP¨æ≈*|ƒbT‘˜®˚õh>8_∫îÍ#Uz»œÔjJèÛR≥PÚ⁄¢√*'cQ∏º‡ü±©`}ñ¨Á®¿´Áp'NQ[é–RñSÈ8§rºê;ms«!≥NΩpªÿ◊æM]àJßMyóº˜ÍåóÉˆÍ¯ΩØÏ|ôu5qnÆ£|Ñ)∂oIÚáñùWD7®ƒXL¿‹:~˜3ÄØø€Óv{  ,¡j6”?¬u…ãácIŒÆxTE∂ÁEßÃ!8eüô“	˜B—Ji`ÜæM‘ë9z˝;8Ï4ÄÉ8mèâ-3$öh'sHÏ=µƒﬁ£"<Ò>ØË5Ë}Ó8c+◊¡Ωz"PLDTqÊ[’W—úõ8(ï‘éIPë ¥iÑQ3d±B∂FGˆÏG«eW0åû öØËg˜µ}»&ñ§w+(;°WÁâ∫∂U\q~Ç:‹ï>Ë¸w{5úÓ¬œ!VfÊ3%ßZŸPÒ£’·“§â®w¡7DGç¸f ‰E ¿(»x.^7$2ªºhßz˛\PIxKsí; BQÛœô√;∫ˇî©MøÍôÃ¯î¬?Eó¸C°?˛ŸÿŸ*©ÏÓrà<ZX°Y•∂¨;—◊‘≥)úã‰^
9\∫∆%JˇvæGAË_;•rƒˇ5-D±Öm¿ß˘ûó0sŒñPˆÍÀY(ƒ¥Ω´0‘~ÿÊÒmäpäæ‘´LÊx√a0“$§cºØ€±ﬂü˙ÛL◊¥«∆—E`âtFRÂí<¯C.Z”8¢˝ÕMËt¬¢ŒzÉ9M;#æL}¢∑Ω∑ª››ÌmÔ>—c¥€ˇû>Ì”qè_‹Ù‡¯>˘ı`OJ¿¨5à[·ƒ∑@e}("5d´TtË√ù£[øÀÆc¸˜o@u°qv©‰`S˜0ìﬂû¢¿ÖPø≤»UQ#!Å€È"!®ÇN®cgx‘åí6ïrîâ»]J≥:A(öwF£M∏ù^¿`´UóîÖ|•Ÿˇ≤ájéÁ	yí∂QTU–D™‡u’˙∂Ñ5Ànó¢ı€.!Õ]ig–é•[úÆ:‹µœ[J˚∏T˚.e(E6∑]C»NQ”ñlÛ∏-´úa0#^NÊé·YŸQÔZD±Ã*å™©˘îHú‹∂¿‘%˛‹âhËH+vàg_üª[√*º@_. %)oöÊç}€ñÚ·K$b0‹k5OIâk§M»:ºñ•‰Ï7O…ôRœ^∑πıb≈‹úV925≤ü¡Pë™ªóÃ†ä––Eﬁò*ŸKuZLSé…,≈çnΩ1'∫yÒ=vÉÎ%Ëá8b}Ü›¥•‰Ñyì»K.ˆ…ƒj¥Q◊\õŒ.õØ0†€Nÿü˚!˘Àî∆— Xb ∂Ùú1~
a∏“…õ≤‚ã•.QÖ√òN8∞∆)¨¿s|¯"˜sÿV∫0¬ ü1Çï∫π◊Á3åA"4ÉﬁP'&„·%?;#÷P<ÙGã9LƒúªÖ2Kdë"Ø∏4yqÕÚ#&bjgYŒBtÜ5{ÔHß”)Ãe?'®c ßHPôø∫ñÙjú˙ÑπópÎÅîÅ9ÁéÅ Æµn¸pÜd˚ﬂ·`˛;B±µA~∫<{◊â∏ﬁ
»r6ÄqÍ≤0^KXD2d·îF«ÿÅKzgÿ˘CµqıVÖ∆£)œ®gƒ1⁄k:˙<gÛt"$Ëéq,ÕØÍﬂ4Å¢ıÆÃ(_q≈(™ˆ´⁄ty*(P‰—Y*∆∞±qW≈-i¥-hB8;q)´0·ﬂàùWﬁìKyFYpMX4™_bPÎ≤‹iP"MÈÜgéãó¿E≤πñÊ`⁄$∂Øø5ä˜÷"Ì€Po¶Ùí3~—âCq^1á‰û&ï∞.kù≈‚/ê;Ã"¶ßµb›∆E¨Àò^_k^_qäeﬁ°Ò4ÉÙlµoéGs
tÒ
‰b∏&6ì§ãx⁄)ÕîÒNw¶•#Í%∫ j;ÛB‘„µùØ@»ª&/”oˆ”oﬁ¿ïA4•Z•=/»«ãÄ|WIEœìË∫∑xµ∞wãu•}Ê£vå}Ècÿâl]ﬂèÜQ/Y8°àK‹Îbf,≠=©Ö9ÅAåÎ‰u€<ˇfMCn0_ÌÚyìõdLNs%ªæ·<rÀhhŸÔ˝2§tŸîùyÓ…ÚmáÓ
_’ÃﬁØ◊@í∞!I)VìÈÀ2£¶ﬁÚY_·Á.5yõC˝≈§¯1x{˜≤9>]]có◊∏©Eü«¯ÿ„)#1ÓBWŒ[w¥®+3ªÉÅ⁄îÕ*Àù_.‰¯›ŸœÉÀcÚ˙‰ÏÂ‡‰ÍË’õ%ÔÌ|*«/…&ÃeBﬁ-0Œ(j:lØø˜¥€Ôomw{=}≤bã%\XsLﬁ¸W´_.∆l∏G^1¨vÅ-àèE9D≈´3äAƒ‘∆Qõ `Õb]ù3ÂŒOßâ∂ˇe¬ùˆb6övîs⁄	ÆNˇgNUèD¬ÎeæyÆ¯⁄®¿_°äñÏ(X=ãŸ1™z¢c1ñ)¶ï«bT –%¥*Öµ$˘˚;Uüe—-ï…mª€@RH»Ø6ÆùCc:¡ü{Ú(Cï3Uí‹∂_∂hjè‚Íx Æ0iådQ›ü
∑Aâ˜i˝Ç
õUﬁ)~°#»≠∫”g!≈g≈+ó´xjñ	”ë‰åòÁâOìj&≠Õˇ¯?˛˚™n¢>% çóÌˆNßO^„]‹#W/Wønπj”xÏ™ÕÇ”8◊¥Vâ%oãæ“™!´›f~ïY'^,π∑‚AÈ®ìÚ&}KÛÉ•§°ıº8GÎ\ãœãœ„dT,‰Sî÷$lòM±6@%u!◊€‹2π\%I°·&ïˇ&Ûdtâ˚œ_ P•t^Ø[Ñ≤Ø©¢áM[˙3æÖ~Èåºt\◊QTU|®ÿ®wCd3S◊ü¸˛ÉÅèﬁäôV bb¥ô …ÔëÉ<óvπÕÊ“éXå˘ÿøΩpk· π%qÂ¸M´bú√åÜ(”å‰‰¨RÉ§B!y]ﬂªv&ûc"†!Ù«s"¨6çe4E»÷…0•]—Oi¢$@µ—TñumÛﬂ»[6t>ÅÄÓ¡_ ¯c(„ømJ¸°,:Hìdda].@)-•œ*GÒ za>ÖMU]%©‰lßq±ì¿sE˝óô·6’T˘¨†Ω-Õ‹/wù6ÔAÚ{#±_vÂ⁄ƒU˝ÃBÁ⁄ô·π˚˝Dßdmp¨Æá∫åÆ¢ûÜ›.•B˙¿¥ú!b@ƒ‹káëà“òÄ,ÕÄè s-f‰		– •©£∑äFC*¢»æ´S}A£‰Èô~@hz\OÄ\-Ü;Ê\õ4õC4◊gˆyƒ≥§”p‚=:Ò˘qx}~˘ª:ÉÂß‘ª•(º¬ù5vY,"≤”ùã‚4Æò}¿5˝Û@,≥æe¢ûj1ëWx	àπÄxb∫‹ﬂòM »WO±÷ˆ¯òµ≤∞ó¶◊Ω©nÎvÖ3’¶”{ÔçSûƒyºÉxfcóX´ìÃÿ.~3Öıò^cå
ópÈŒ‡¬ã·r¢a‰ÑÕÄØSh˘πlÊ<Øˆ´µÑ*…zG:T¯£M†ãk‰‹_#Â∏$ﬁ≤y"—îÙT¶ñ‰=yân5?¯ ı„˜ØVeå™‘—©^m…t2€Kœ—,%ólæ†∫C§R¬©5+6ê¬ù¯êΩ…KÅ¶u
ßÚÒØîØÁ·E_ºåf^æN2%g·VÜ4í9;iÙr%∂πíî∑f—èVêÌzâ‰|ÑÚA Ô® ¸ÎO@òIìR˘\æa´i±∆˛»JørÌÑ*•4¯8q@èÓ≤?øR4Ì¶iiûî√i>ø=“?T æw|+8«˙Ñ–-]Jè%gﬂ˘"IrÜ)Ï}T,a!ÌàØ,o«1ù.¯≈.B?N⁄>eÇ“jŸÇÂíé>ªLÙ•˝«¨]†+íﬁ† AÏƒ.ˆ¬Yñdü\`Ÿ‰©¬ú7è&¯Ç(=· âÊa †∆+¢dÜzÕâé‡Ó÷¨£œrœ—P’ƒ·πÛ{ m—âØh‰å0	>ÔÊ
}x'Æ"&-i^H∑çYg‰çáìríÓUÀ §Ä>I∏ŸST•h!ú+@ó¿9 ØKß@>qÄÎ x‚)˜Z{“ ËÀ[M@ÈÌ3§”ÃL@Œä–Îaú4{(üª‡)¿ÛôyÑﬁhA} <∏˜‡Œ °cül}±_úàé «ÁÄÕ[ù^ØÛ•Û≈ gÜ}≈∑zH˜ßF@≠-GlX'ó	÷I≥ÜU¯Æ-Ú†≠Ó†(»˙`Ö
Úä®¨P,∂Z
o*sÜ∞Që∂ﬂ·˜≥díjqJ!3Âπ”æª„Ï'˜Ÿﬂ|˜Óõ…]—4tºYª´»Ò£™ƒààVÊ|jú“Rò¿Â›¥Ê¶7∆–9˚rü-ïÛ,ŸNC‘Æz˙Ñg∂"ÁÉ‘‚Ã&¨´‰∫J*}©
x)}j2U†µÍ˙JÌ®$Q˝61¶◊Âo÷π?›Ü§Íç◊ù (x^C◊ÒÙÍ’g
¸Æ6˜ºﬁ´b©Eà≠ŸícUyíÔÜ§uvÄ«Hl•¯·Q3ÃÅ$˜≥†⁄´É¥±D*7;e§ﬁpwY˝á≤Ã –”•VÒG˘W¿Ü?äÀø];ıF¿Ã_∞\ú–™˙MπΩàKá+~˙Jz%∆»ü9ªMR˚¿ •œç¥—îÃæ˘‰eó|á4ö}V”Zz◊z——SA"*%’Zƒ1 ÑﬁàΩô›Å©´}U}«eÙ3ª`ø.‡*ÉÆK´mak¶ÉÒgÏö?U[ÜÃôÅoc	™î?W[èY ˛îJÂÄ\µÔ™oôé•È`6?~8”aú5.|®{É∆clÓ÷@JQ‰a¡Ã +ØL$S/ﬂøzutyŸíß+ ˙qÂ”(>eQD'åø;Kì@˚À©√ﬂ∫·z´{¬\8oı©ø˚ÒÏkŒ£ÚM%1¬Ú~qt1vb´;¬ñ…Óö˛*˝Û˜¢π(kï·ÒG—T≤¿∆ë’90ù–Gº¶ 'πØ:à¯@‘ÚÂVÊªJΩ±À^Yœ<˜6Å‡¿¬¢Ó¥?ó{r¢„9R! eI34CÅÿ-˝æ¸.ú†√"ƒÀükm¨Ì¶‰À⁄[ÁŸn>4BED+˚¥ìŸG¨ê™)™˛Óë?äëgF£°ÔŸ†œ[ﬁÚüTÃ∞‘ÛÄ[	÷ÀNZ*º ªãø√çX¸¯mÅF$œ∑ +—Té§ì¥<Ó7Ç&e⁄íäK2 §›
¸Ø˚oHH—\8ÿlú¨G?ƒTH‘dﬂ◊®·•Úu≈Oç∂(øy	òœ|é¶∞Æ34Hp».à∆V\∂€¯Âã9E{Ñ5Ô}ö7óëTçí®0PvY’ø˚](#JÛ~m¿Ü)¬dÙF=øïóná8æ'é¯NA*‡?ÆB4¨Jæ‹èÆxqï€›W«å«©'òiXo·∫1¨ôL±êßf±<ÁyÛ•¥≤F≠´3ÒR%ˇPi’Xaˆ[»˘ôi`NdÛ≤Øï€ŸâÅ	>∏ªKìÛÔìn´®ÁÃ˘∫
çz’F2'ùùn‚)-n€˝Ì¢ù∂rLESq)¡eVL{X7!õ„+∞⁄Ï6I"ëEÓ>Öør„æÊ…"ÊcÚ∑ˆ˙ª\≥64∂Û´≈p…ÃYÍ‘Ã«Õi÷ZSŒ‰|JêÈK,‰≈˙ãecπ∏ÚøﬁßíR+NR%ÂÑ]«
˜1Ù≠]ŒSJ’‘gZQ0¥_≥√\Bö«µ‘ËóH‹üÑµpe«åfÄT≤ŸlN˚ñævıÄñÃπﬁê¨?ùÆá	#ï1°ó
$3¶Ëw¡®€F”29°˜∫óNﬁ÷O˙e∆'
!‡_Øíôì'O$^&∂≈›À’ô≤:RùJÇÇ≤[I°X”ˇ  ˇˇÏ}În‹∆∂Ê´î{í@J‹-©%+≤ ≈#[v¨X≤t$yg6å`áRS›¥∫…ﬁ$€∂¢80¿¸8?pÄÛÛ
Û(Á	Êf≠*^™»™UEvKq.ƒﬁ±§&Ÿu]µÆﬂÁ»ÍÅ/Òˇ*_XÅí…D_w:'æ°H¶QﬁÄL4’4s‡—:é"ŸQ¨/Ù7%hg∞"a`1sÒ[…]¨ìo2s](µ*ûËÖÀd]zÒ Ø“êŸ•ÓÇ(†	ÓPeE™hCYVR◊è⁄ﬂΩfp!Ú¸8úrd]],∏ ò/	ÿà∆˘Ï∏¨R77ç¨πS´®t@Gm»UÃ!Û…#3IÉ≠t‘¯V9+M'€∞-ó;Ü$⁄#F∂AÑôí",¯F’Üõ+e0* )Y[¯G}CûHÑ‘ê∑◊⁄çÔ1≥Ïôó≈âËÆóêÀ#s™î-ó∆IBT@r‘Ep8'ÙE»¶ÏM*oK#Qﬂn‡´ZÑ^**Z
7’ÑÆ«ÕÃ?êi}r˝tI‰]úòõîè⁄#jì–(KÓ¨Æﬂ⁄â≠ Øx“K£¡G∞Ùh˘”Cä ·u·Py’≈˚aê˝=ÔõSQ	ø7!ÛÔzœyÉ	Ïá>A"&ÈÊ6¸∞EÆlòœ#é´≥ÙΩ]˘·•?hıqWÙÓ∫sçô5_íkÖÓã∂R)?¬VutóÕäïe>@+∂¡NpÖàF∆±Ñûév;∞óæ4ã¿ëè:ûÌ.˛EO˘pÏvm!Io∆‹˚%ÜN„!SÓF¢∆üsÇ≈â7Mz√(é}N¥âø?˘ÁÓ¡)¯6{kﬂ>ZÎ|zHﬂ∂ﬁæ∂∫Ÿ€Í€Ô|˙Íó›µoøäfÈtñÓbeﬁÄ`ˆ∆0±/`n¥ÅóÚí¶4ÁÒ|º™‘åÁÆÒf6R¿Ï¨à)7®>¢:˙pvô!=√Qx[S!.+Â™∆<≥÷o4`ˇÄ&‡ˇ£‚‘™n«∑º@F1"ÁhÉÆ¯áh§n†yûâÅÒ∞™H?≤ ›⁄◊Æ£≠l˛⁄|2≤/
B‰ylç@"Hv†Ωíô7~·ä[JÇ…lÃY•à≈B,ó0G´π0Ã~ h?ˇ!ßıÇÍ{‡%#†Î∑	åˆ?˙´…?∞¡ãˇÑWËÖ˜"FÄ2à÷gt∏õÇwSa4÷:¡¡∏‹@„≤ØË2u€≤8MÀ´Æ˜àòM1œ\ıÓøÀ‘/ÖÕ6ç…o–-\tÚ(.»ç6¡‚˝‹w ‰¯’ºƒÎ$à“õì˝ΩÛÉ◊ﬂo€¥Ï€Çê•‰L9&9SF—k˚›A0h‡{ÜA XéŒ∑'˛eoˇDXT]“}h]ÍéìwL∂TWÂ≠≥Xœ%ﬂÚ´¨–æ÷™,„*…xÖa‹ŸUÈ‰ú4óyôkÉƒ¯•õ,G±·≈«æcyò>wùWÑπ8–‡‚ØögRc]´≥∏OˇÖÔP[fñ‘:6õC
“haNÊë&\à`dgS`l|G¿´¿v f¿$ã?±Î‹%Cr>€\¨=vÊ√©4ÂÖÜ]√‚ı>p–â±7ëﬁ8&,î˜%j#H/6ÏFpV¬LX4ˆG9∏≈Pÿ,ΩK„P9»
k1$MÓkå"gπ9∏ªQL÷ÇAxTµU≥±/CˇÙ∑ä»fK|&ÜY´Ω≠’’B£–ˆ“∏ØÛ¢‹ˇ∞UíLûE√¥ì,ìM¶Ã|–VÎi:YXZ¢<ΩÜ-z¡ëÄ9®'…|ÍRn#5(`C.∏RÂ√W(?ÀYÑõÒ%FŸº‚4^˝yóYÈ›®≈*9U.êªYqß˛UÏ'£g‘%˜™òGî¶ÑªÊn;«—0ÊºH"¯v!–båÒwÕ}µ!7ViïLê±øl®‰˚®ƒå˛—Ê˙Ç&<ô√7∂-l &È ?}Ÿ^}hÊ»ì8á◊™Êë+oÑ)!Mæ§‰4Óı≥8ﬁ 45¬\»^Ù3ÈQ´å+EßinIá!èô…1F|¥⁄∏&¿°5
∞üäV¿ˇ
k}EsáÏ¡ãéÖ~ˆœÿ*D‰Ä∑j”6híøìø≥%ÏcÁ≥°ó†nã¬Ö(ÃÈ,®ıh<4gG–ÈdáR/π.¯Ä»;[JQó∞‹ØÏejÎ¡Ä'[÷˜W_9º0·dZ"UasqhDNdD9léñ7D~µsM8m—Û¨≤G≈üÔsìé ‹º=EÉº?ãó∂ﬁ†˚‹é<¡dîDOÄñ5ÎØ∫∏∫§Ó–É∞PZ;6í˙ºEïÁO˝˜Åˇ°CíF∂˚ºÖ˝¢Ãñq\õ$H,∫˛ÌeÇ^F!P˘Lg’{l∑(È≥¨©%∏èø˛m≤^Ù3f03ï6>ˇ8ı√Ñ∑±ZﬂkkkÏ_í+>Ô≈˛ïc&¿º´_Vjø9ÔPw?íS%Â8ı◊SÔÂMo?f¯.0© Ÿ6Vx+9Xx√Bfúh~•8πÔ˝p„X]•0WÉŸ•ës~)ô!gn∂>·ˆ_•¸•&â±⁄bêAÌŒ*ÆL-5|Y> &íE‹…ﬁ¡~«îëíwüÓ'3˘n≤‚áËÜE·ÔΩã1Ó+√˜…k…∏*ä.xk“89xsæ˜˙{c™=H˝Ùº	Çawÿ7t-ÉN˚Î∞7xb‰ΩÀtÊç%iVëoN´€ˇ8ïæ~À«iÅÀ;["'ﬁM∂>\V±^äeÄ$˜aw[viÚ,Çüv´£ˇMµó‘ÄÄz…ùjÜoS‰T∑¸"Í-úU«ØÉWT_˙›.[5ÙFS˙'_wÍ€”}A{ˇ[{ü!„ÄŒGÑo‹ÅÌ≈≤ó¸≥È˘6‘¬‘¬ÚÈ∆<Å¸ÑÛë∂Tj©¿´R1∞°-°jÏKˇ‚VYô"°_*÷™U8ôã¥òÇg\aï–CtÃY˚xYï´-œˆ“IÑˇ+ﬁûSò´ÎàÌ˚WCJÍ¸nTµŒ€ÑÇÉ7?5Ìñ∫.lˇ"x÷<ˇò√b™Å $‰uq∑CÓ^ß˛µ7“Ÿ„ G^<ÃÈàbò…îRÅL◊Ös˙4›RÒb≠O¬D≤∂!XúhI6S€7;êHgÌ≥~ô,%¥$’îã∫ ®nyæëî›lŸ∂xŸáÂˆ»KG=Ô"Y™ÜeSñø‰‡+»Sú¨∑íEx91z€ÿπâHKVûZ∫∑‡Ëv85í◊Dû≥-©Â®JvóÈ/3¨&Ø‡%1	¬%êkŸíqÖ∞∂§haø˛ ÷ñóŸ◊\&√;˘EÑyƒeQÏÌñcÓ–é˛%˘πCßIÍû‘¯ùÀE∞R;Ä§£üv?ﬂÁZ„TPÌ*};«Ö¬NÇYÍ®‘ïV⁄ CWäÉ¢©ß7øNßˆb*q›÷Õ¯™»Ã‰°U⁄9ı◊A‹5	4÷óí[¨±¯&◊udÏπ/¢\–pñòœy±€™ÉÍ∑^-NÀÖ
±Ïÿ™/ª‹
Y≤+lûÖ…ÆóüΩË*dRÓQ˘≠ù” ò”¥‚ﬂrØ%û˘ı4ÄafÁ~<ıÆ…îÉ|º~√Ö°˙ﬁ~Îu·™∂Y>vvLë%[W©∫¿π‡ÄÖ:v"Tﬁ nŒº∆^¿^!◊üwÕ≤àÕ∂›÷1≈éã ß_V”€L˛\1y‚C≠¸”Ú4∆äÕF∂ù7iòpisµ`ôˇH∏4Ó◊…∫É¿w∑b[ÁÍy0)†≠P≤	6i„º6.Ï∏Œ' ∏-êãÿàoÕ√{Ω∞à©í'Ω ºœ†%6?Hãxl~ë)÷Ñ
K:≈1Áü4Æ·µ®t÷äΩf©H,—&Ì¡C€‰Õ3u≠'éò6"û…˘°ÎFÍ¿¸≤:ó8ï º	öÈ}í≈ß6ú‚SˆXSÎËA{¯G˙=%ëªVŸƒ˛U°ä*¡j≤RäõPÑn˘≈g√{ÔÅË‘Ç≥i⁄LÏñ^°|Ωã£ëRÒç±%_FúâËwlÌ˜zf»Íeq‡·µÃ∂›â¿∞ïò "ùtËlRq {ó#/ﬁKóV‘eG+…¡#®ÂÇ\.#∑4r >∑ˆO7À.b≈-SØ⁄√¯+⁄≤K≤¢xÉÃàDÊo…W·§∆Ï^}XZf]|Y0Ì¡C9ª„ÿ_≥Õ’¸? +ÚµÏ∫—-ê
2b^"£hÍ•ìRˆpó{Œ©Ω%€‚¢Zkè9˙",—£F&xG÷’y–@Éû˝®ùÑ∂X[grK=@TÌœ∆k‡údo◊'»:”ÚR+Nù¢l!®ΩÒﬂù‰QxÙ¡ÎM¸ï/¯®yi‚Mßq√ﬂß#X{ü‚mxu˛À84ë¨´ÖÃ%.˚‰+ﬁøä<´áö$ËÕ¢rY
r—Ë€$x^€(´	Vã†6ç¥–“ìV“⁄ÏæVkÀRã .ââ‡,ıÆÆ∏ÅaÆE.Ø≤∫=¡Á∫^–J’<Áó5Ç´[ %–oÉ±>˜˘≠k˜0ı{q}8ÂòÖœ˚º.œ:¡o~›6ur¥∑í[⁄»F9wjpuoUoû_ıH¬Z]ø» ¢Ãò
ÎL¡√∑≠¬$ú≤êecÉe]$:Y”∏0[ºÎ}À‚µ/IU2Íôédi‹S<õ0o‡I–"AäUõá∂]˝q&@¸p6Ò>v1KãœÇ1«:πò]{l‚á3ÑwÚÿ´º˘≥0ù]ÛD'XWç»„æ∆ÏŸÁ∂®ó1—îO|ß∂rÙCmWﬁ¿~k∞ø8º≤#≥@A˜˙˙"yygªo*S$‡»õ\Fy™Ú∆ña'ôGµ“xª©‡Æ[¢ÍôRyåÉQŒ¥±Ôçf„ôaiò†’ı@G*ìå{dlJæëÆ˝…Ö7prnn¯)dSﬁ÷ƒ{¯ﬂtñm√Î<ÙbªûÙ∞bvÊ¥†Í–o.SHÛ°™µ`ôQ…|“∞P|¶V\ÛÑ~@_ï√¯2“B∫‘0Nåµ{Ö˚¢	≤”›!E*ØWF>>‰E-~1ﬁw<K•·∑Íù.úuN(äŒ¨BPW‚iîØÚE]Fì©ﬁ (®`62Æg‚Óq≥6{¥_πÛ∑Á≈–W…,ˆ“Ó;ÿ¨6Úÿ3ºÛºQ”À§¯0Hê∫Q˘˝wDf©ò<^…ˆ˚Ë3bs?òn1<m9n§äE∞çh§÷B;ﬂÆ>d†,<d´?’≠»“÷√ªcÍ{È6;êÆ7Ÿ |∫Õ˙ıáMZC¯*Ff´∆Ä$0ú§*¶´ítÁ˚Û√hôΩ@·üå÷j«mQ7 ©4‰“˜á«O˜k·w˛í17ms4ÈM–~Œü?{©ã˚ÇN∞V˘ã¢Ä*›7X§B¿yaws@Æ?û%ﬁ»´hˇïC⁄M√÷l“®…F{»>¬“r€o¸ﬁ⁄≠ÚQü/=8Á∑* qu±I¥~ƒ´®óËuÆ+ÇG6≥ŸÀ7∫éoOYŸ&J:Ì∫3-ﬁ\è’ÍçÜÖúØﬁçLÛã]`Z»ºQ⁄øÎŸT<„làÇvà´ì	XœZ3ÍTw∫$¿BﬂÊ[èV∫˜Æ±æV¢Ç2m5çF¨ÀÙÿA⁄P8eœfd`y·`ÏÛN)iFÊBVíêê‚.ÿ{˛ÿô~Bçj†yTKÔúéöÉ˝“≤_aœ'àË∑¬^ûh÷oî¶±A8ùÈ`-Cﬁr¯˛ˆz†úcÿSÙN˜©4 ¸K∫öÒ@w'®ó˛∆…ˆ¬A–;Û‡Åÿ˚Øô6ât	∫ﬂ{„ôœïú <(ö™≥c¿ÙÅ%0ÑõÖß˝ŒáÍcK~/ı‚°üˆ¯kµÊPæà.gInAe@òYl[‡hÍ{:û≈“SZ<Õ¸5¢Ê™>^˚ˇú±?®}¥¢Iw∫M 7£∑íèUåœ\ôﬂôô$≤Ù€Ko|â%W_~≥1˝∏¸S4ù«WI‹XŸ“/!9·ß_–ÔXÕu…±÷A(]y˛o2¯]^çÍJÁsÀôú ‡"ß€çcñÕqﬂfÓóÔ◊”%÷T3‹ø=+qAa“”‡Éw„•BÚõZ”~˙VYu<èlÙêÉèd*ô-Íƒ≥»‡%ÊpéP‚5Ê`K=?G@p!—m^0øNÉ√ë≈âCZ∂`À16•A M#¿FΩR^ìq∞¸ŸË¯XÂ‰4˚—ˆ\]Pô0⁄G1uÍ⁄Û’ùÀ∞∑ÏtfÚhŒìhnŸ√∫/ãoR\Á†+]èÇòÇ·,Dg•ïÔAf|ı†=ËXîu”¯Añbwπı¨†íÊqKjπ9–„Èe*üd:"%f[€∑Ê˝H∞∞PT}‰”0*µ{ıj~√çqèZË+å0ùÅÇ]/(2ÎùïÓê\`F%5WSs·•üHq
–˜ËïU§ç+U˚Ñ¢¥˛Áø˛áˆ˙Geµ5¡˙5nT[…Ì†¥£aÖµ>°ŸmpÌom•œO_A7¸n±™W˛çyÓæY‹I…3Ì!õ˝Ñ€ÅS4,T]†ZW¥[Ó|óZıï§Zu—¨Èÿ4òBaÓ©ÑZRMIÒIhõµË¶˙p6ı$!ÚD3Èza´/Ò ôl =ä%o ÷_¿úT√l±?DJ¨µ9VÂ” Õå‰ÏVÛç™"ºú('>ç‰”Õü»íòŒ¬èy◊≥	(XÉ≈Œ¸kè◊h“îÙôDPG’2ä˝´›Œ±x¨}]]Ëíÿq8«…”(Ç\Ó?a/g≥p≥f$<1∑≥Ç~ÆÊæÁb%.ÿ˝‹˝]˘üÎÁìi”∑¥p‚kˆ≥˙U[&ﬂA3yããPkAjˆK¶cÇ´YãôK|’"àdZ:ÎëßEjˇb}∏8‹Îäi3˜Öî[†˜]òºÈÜSÂnÍôL‹Yk»‚˝ÈOg^ Ö1¸=Îë‰Yø‚jZç…ßÆ¸IÎR?Õ$…"ºÍøπ3}ÖΩ…äX2¥=Ø&∫WˇyÊ>◊›K9è´=˛}ô°OΩa¿„ ˚˛‘ãSƒ«^ÿ,^wﬂ€>É±âF€E]˚CPè·/ÒC6H.¥‰s‹i}M¢xë1-^yBM•ñÖßÂLÆn≠ı◊7m~ªı¯œ5m≠úBñâ#<8vOÀ	l‚Ÿôw6‡±‡Á>ÍÖÒÂ§ı¥µ#8gwÇní¬îê?ôr&¬ÖZ7í\t˘g:#C6!ÿ÷˘aHå|ÉôJq≥Q‘∞Çﬂ.Øo2≤ﬁºQZRÓ_¿VeâwÂc∏≥eˆL3gGãúaed˙ö¿ôT4EHiÚãµÆB…‘°b¨têŸÛ†⁄:3`<l¡2®$k>g®zÊ'AŒ¶w&oÀÈ ⁄;¯ãˆs.;;“p„vy#˜}j¢IZkE'Œî˛ikÕ´Î÷H ∆0* ,≥_± r˙±ªŒ°Àm¿Â8+j¬Aˆ0€˛;|≥w ~ÿ;bØûü˛∞ßÈ≥.][]"MÜkNÖ•ºtééÀ(ÎzW¸Ÿõ˝ΩóÏ¸˘ÈÈÛW{G∫∆ÇV’¡®¶„)YÕ ™•^lT[µ∂Z@•‹ùv∑ ƒŸç2÷öâBZKS ≥äIπ´ı§‹u%y≈≠ößXÊ`ÃÏz≥42ÖJ8Ω·≥ æ˚9R÷∆j„⁄W\Ø≠≤R«–†W~¸Œc/Ω8`a!ö¥ç—Cm-®BL£ŒéúúÅŸÎ¡[∞'EÖ5=HP|3P`'^ËcÌûˆUÇﬁ[W~c*æ—aı5a÷,‹Ã›Yõ‘3nõSéç⁄OACPò∂ŸŸ‘º)–¥"u¡xÿ—¿ªŸ+Pgûîh*D≠oëˇÄiyY˛√€üíÈ7£h√iŸÔ¬F5ùB& Ìrñ˙N72¶]«ì¢é˚C¨2°±|÷ÀŒß?ÛJ3~p´'4p¨éxc*˚TªÑNSzß`p∆%‰dP≠ó˘ÇËê> ¿à#•∆J∂ëõ*QRßí)h'„Y"‘à2ˆC’⁄€R∏tAvÀ4ë˘$∑G¸˘—ªNgÏ–G≤D™I4Œ%D‰ñ~kœ'‰x_W„(≤2Ø÷wMm”¨∞MƒóÄÍùns÷æÊK¯öO@@˚™ˇ6îß˙¥∫ÃmVx*r≈SX.ü˛3£v[Ñè<·»s]‚A”be=Ìdeí∏§T„*w(¯ql´∑‹HÿÊ§\z ¸ön
Üi¡¨ôYŒ1gõq¬ø‹Ÿ√ä?èP1J—®wlÍè”¡†5à*yﬁ)∫ÕÏW /! ÖΩˆj∆Ûph∂m±ºV$≈î¸V	$ÛçCòêÌ‰ñ€  )›ıG◊πQ«ÑÛ¯!zˇg!ã≥ÚÑ‹‡a_0A9L√ H=xO¿>xqà»'±72£ï,òâŸ˝ÊÒU‡ﬂËw’ß\2õ!RÉyZ"Béö¸€’^ﬂüP‡4ŸH¸ËΩ.åCoàe„˘ ·Ô8â9ù∑z©AŸL!0Ú#Xxâ>9ø®nòÚMÚ´)‹£îÀﬁ˛Ï%SƒπM\≈ıïIÓç
ÏT!\≠∑jÄ7•∫ø0€2 ¸£ãDb™…√à∂ãJ¸,)‡`z‘DGf\ÅÍ§‡Sµg{Ò°:ôC&+_Êì›˙ó;bìR7“Ë\0Å!<`9K!tÀäÒO$œ<\<˝¬•ôÙcX@Qv£»ã'Éwh)Í+U1$f"∂ˆa%(V›pÜT¢3¥°≤sÍ_≈~2zˆ¡ÕR§¥·Ú£4,iÆË}e®a ∫ßç–˝ãKoÇê6Q"åﬁ≥AÌﬁÚJ7z}`*ÚÌ˛j@˙^iNF‚¬ë≥€ÅÉgËØºõ˙∆–ú∏ﬁÉÈ=CfËÿ8ºÃ-ªÚ.·>äË˘¡|≥NÉµ‹N^,N\z”t˚bì∑ﬁÅõ¢Ù∏RíÚëˇA¡5¨£9◊N∆<√¢AL«≤CÅiqÑä„®äCÍÄOÌ˛ŸBí◊eÆ(m>ßò°àTÆÖÆlhDj	Ó√0’†¥€˜S/ı∆s
;
ÏêD1ßA'≤L‹q3_zπ÷|Ô∫§’fågÚ≤8ºœE,T#nCyôPn∞<°
,°"ú€~˝!rÁ+ﬁºy7±+ ®bÆÀ`£J¿<˜<‡ë˚—∑qPÄÖ‰ç–Hüap7àáÔ‡—Ñº±7aÆk0ÿ9&"}Ê˘qp\#˛“ﬁ¡gAj∞˙èÿë„Æ63¸µ4D¶=~˚†‚)î†‚ûpê{ˆ )8 ^á∏aƒ˛5ú¡ ¢Æ65c„Ÿ‘”Q‹õéï¶∏≈ÂyX«qñgn¥x˝O„¿ø‚˛g˝ÿ&≈ZESámŒ
Q‡µﬁ¯◊¬”H7◊∆©@PIö“UÏmÙC2ÖÕY+Û4“çÊ—¯±Ä#'ﬁü’ÜW`ÀHû,]ï¯Yınï‚‚™€%äç˛T∆.ÔÁ∂≠‚–éfÈ8}±ŒÆOi·º¶©¯%—ß4grû¢)óºb<;ùÔ∫]uπvª;+‚ûØÅ&#b*<ﬂ˘Óˇ˝˚ˇ˙üÏ’,|7„‘É·
;3 Å˝0ÜÔálÈ5<%æuŸÂ;oó\|#óh2/É≈?$lWï^1π7ﬁ˛D{A≤◊r≈üƒ◊¬¢Ÿ+˛ ØJñ,ÆµmÈ}‚ø‡ëì:P‚˘#É”≤”wDÈ·„©ox@~˘¡[™üöª“±
#j∏!˙¢%næ°8wó≠^∞,k^Ó#Q≤SÒâ+_≈1â≥ÓÂrÜˇb°x›f‘?¨ÀnØ∏”Y≠˚b∆ﬁ¿àé≥ø8ëÚ⁄˜^∂U†çºîó¶‹@€˚‹Ê´»4≠ˆzË+Ø§e<¿±€˘ˇ˛oˇùÌLÏ««@ò+≥[—öFÎ†lŒú´!k≈b◊D÷:«ï!.3«HÌù|Ïou°µRg1+·¸X	ìôóüKOQçÛsÑSü∫Æà¨M≠á˚^fﬂvˆJÇ	‚hÛ´ÖHd+jŒÊ¸¸#æV¨≤ŸKN ƒrÂD•r+ƒ9î˛i1eõ?Íd‰äKgT=ÆxMäuÆ–©7.:H˚Z§>$ûóÚDÜé£2Ò'†6^LËôl*∏Z@ $S?AGHèΩ∆åàáyŒ{ÍMŸ ¥œ4{∂ JÅoπ»•ä ¢,¢ˇ3+ûä¶I¿:M5⁄{\C/¸fò¿˜Sççg"”Ö^Byl¨Ê±9Í6Ω2¶Ÿ§ôå‰\°∏"k/£y‰ûÙ`‹Ô˜¡ËíﬂóK÷soË∞»´p(ËjœOhˇK˛∏Ur π	7ëí<∂^ÊÔ∫ÁH_Âç/g∏3·†I1ŒÌÏìÜÁ”çåPy(∫=§.«£œ∫f‹æ{˘vÓ¡Ô£°·–©°ÀlgóÅvz/Êì»5v+% Ø¬”(Wﬁm—!ÙÚ⁄fRû§ÙÊ"G≤Ó;Ω”îîR^vù≈ÓfuÕÄoˆVªÛV}õ„ÚíIÈÌ•ÛN+ﬁíﬁIûdﬂ€N™à´ïl—<Í*aƒ’j˚äkAõX\çdŒÁ◊tG)î=–Dâ´*ëV45∂K>m^bó6‚r5ëÜÓ$mËûö›HÁ˘≠Œw:FHÃ!ôx∆yZŒRPºva»“Ÿ u0Eç]R»æ¥Ùˆ/	˜óÑsy†ïÑ{
“çßˆg[!#vl(ﬂˆnJûÇmõ*{ÖªÛ»q[9ã˜u1›ÿZµ!Ω‡ﬁE◊^Ï	7¥„òπnΩ'„°¢ˆ.@
≈›p6Iú[;èj-∫ZÆ÷{Å;ø±»˙\›@Xaâıã‡£?XZ]˛dÁC(/≤b§‹LËØ˚9{îR%®J+¨dÚΩN˚œQbôSö*˜U‰ÿbΩGy˙uë–_Â∂∞íh[)1q≥9çÃå˙K9òé4 `¶´ƒsú´Ï~˛BîˆNºèK´ô¯9ëÈ![Bµ|EcIV%PM≤4ˆfõªÕs∞øñóE}ËÚÚß/v€lé„*[ÔYöπ≤,úÚø‰˝_Úæ~{S’¥fzªÎ£™µÌˆúõÅÌ`$∑ïœDu®ú˝(B\¥f…ké·ÅÜ™eùaSÎ8¥ßfØÀòìÉÇÏ~ç'`≤s˝ŒÍ´˚AÀõˇ]fÏMºp◊€§·ÿˇsû∆ßÎ˚	EAØº√±ÒN∫É€M¶®™y”Í´1’<‘*Â•;åö`1eù‘øKt%Añ¯ÔºŸ»MUºuä£àÎèåZ·–÷[K„§Ôjú\Oj√tñx©êk:¢ûñ{öFœ≈µ–ò∂∏"Èw˘›∂®∫∏≈÷≈esﬂT$^…Î†?¿∆ Å@˚Ã ¶k†Ym~Æ:Ó¥Ç ßqØ#Wêπ)RéqÓ√r BÃ/'âé◊_÷«_÷G˝vW…œon.˝ÒÇÄ3€‰.ÙGo˛‹F´bG`ü‘ÉÂÿ*9´ı‚yb©©É Ò.∆˛`Ò¥¯#†E⁄í=jÅ	ﬂNbò?b_‹ ßá[.JmÕNS|íˆ¯ÔÚà˘Æ$bdP]ç1ÍÏÅÙ¯(AÌÃ/ã¸*Ö{î±MV˘(Qk˛À^‚u«»àwQ…˜*ÇÑ†á}rÊ@",Mÿìûwy9ÉÔøqQåÙNvy∂•ÓNL‹"ÍµÙˇèp¿Úu®8VÛ¶-öÿ‘Aãÿ¬â‹ Hr•çÚ,X:˜ù‘-§8å6ó?=dïè√°¸Òœñ◊√ÆD¥ƒp8ú±kXr`a˜z=r›	n§@O¨J˚Fx2f¿z˚:Ü)$ûí8J=ƒÍ]ﬂ¥F(JôiNƒ˛‘˜“mv^a,‰∆¶…`É‡õ∑Yﬂv´¢¶k7Ωòƒ!∂ƒúÒáLÉ{·µéƒFsü>ˆ∑EÒØJƒHiw≠vc/`Ÿ˘,ÑE
˚Ñlˇ<Îà4Ú@=ZÈ}@4§Ñ–JS˝^íFSPUßû∞'≠ı¢™RGﬂN.-√ä—∞eX“'∏ùÕ´ûKîù)Ît<ƒRì$äª”(‡öM¡sSñ.[T√vïÕœ¢èzCsjŸ< 4
ﬂqP[Ët≤Ô2¡j(¥≈uÎËmq∫f©5RÏ6 îí/∞÷ÜDC≤ﬁÁŸ¨≈LˇÔ◊π£≤¥Â aÅÂXg¶eC»â‡*÷ëZñèeÔv‡;ø§‹1#C@ˆ˚¯◊=ÂΩŸÌêë≤$ΩÛa}∑∆Î94‚œ£4ù&€++oöÙÜQ4˚ΩÀh¬Úœ›ö≤ÛÈaM¡˘Ù’/ªk[_E≥t:Kw˝…Ö? Cu∞£/`Jœ8xõyÎÓ¨à—v7™hfÎÕlùÄ›±‡Í=≤9˚π©DÑ\6µH˘Ç§ÿIŸ!£_5—zÏ´©  !
:©Vô«¬CLT`;HWÁfFbÅ OZÖø¢Õ∞P⁄Bˆ⁄˘Ú‡˚óÏ‰Ù˘≥É≥É„◊Ï¯Ÿ+⁄ı	98:9=˛€¡ÎÔŸﬁ≥goN˜û˝ù÷¨-™≥M2:gÃSÎË) ¬Ë€e«q“#¯1<¯#‚Œ%¯Œﬁ–O_Fp`C+øcèaﬁ»ëØ>Ç^≈«xeœÒ˘ÀVóÕ∂%ÌÄ0-£Ë√!®Îë§‘4ÎFyy7˛¨ä⁄ÛÖÆ§ÕÃÀ”Kè‚ 
„wÇ…√&—Ä:Â28àª^6AP√’/ã≈8ˆÕÜ¯ß¨)≥ä	ïBN„O$VÛQÿ™c~<K©Ÿ⁄ç˙.[˚÷a§‡∏ìGäˇj¡∑ù{Håüd]ÈH8ú”´xuˇ–â+W”5 +ró x5ìxµﬁﬁx-pã„ı§}eVuÒ*O[‡pZmfº⁄n“≤ØŸFΩøæíüJ;U@ùVBVPé∂°!ˇ¨ëA:rÜê4–û’]ÓlI|Èéí©ùlj#ùÊîOóP|ﬂ*º-.â€LumZˆ^Ì•“|r©Ï!óMwŸC7È⁄©x,Œ"ÜléÙí…PÀ;ÿ	›É˝M>àÆı∑«Û∂∏˝]jﬁv©∫∆N¸Z^øj{àø™=¥f9ÿ"w¨∫√Èèm2;˙iN√!XhhÂòÎmkZÚÌÒ–∫0œ˝xÏM.<öZ¬û]„d¥/pûnE*”∑6ƒ˜<óÖ™Ãen1∂õK+Å‰úi35ëÔÜ4/ñ∆¿ÂZRk"îù¢]ˇÚö]_5ÔUˆv6qgo◊©B¢±VT_¥’Œà€scx<Ã _çÿ≈¥©PÁv∑0"8X‰7™<∫JÏb!Ÿ†Z˘cŸ+Á˜-#Ñ@ßzf¯‚s3C<oŸ∑0¥ﬂ™¨®µ4O"àü¿Øg◊{¸ôÃŸWÂ Á§}a–+g2ıXªìËöÓu[%¬ñâW≈üS†.uF—ƒß5 ÿ˜MŒª"¥f›·~¢ ∫ÅY2≥ı∂≤¶%>VDì†JªlåTJ*fJ»á%!»,3QÃ√;ˆ˘+å	ßrûÍGæ7’}óœW|€ﬂ(ÑeeoWl{eÆdè…Sœe%√nÙ~π√H…Õ´+˚Ê<Éb}µûUÒxµÅpÒk3F◊À ;wodØ£¥ÀÉΩ˛¿¸j≥]f^ŒØNéÿﬁ”≥ÁØœÿ—ﬁŸõW∆µJ≠e*É£)ó(^≤UUÌlIù?ªâèΩBº0éãÇ	ùg°´Qı‡1Ç¢
›ΩÎQs	ã:ÿúÂ‚Ì⁄òóU8Î˙÷füÕ‚†Û?x)úQﬁ&s{uµ«ˆ¶ﬁ5|ƒèCò dcªäÀRl"˜'ÛÙﬂr‘Qh»dÆ¶{pûuÓr„’êﬁí«Äœ#/Iè¸$ÒÜNEE§˙ÀÅ˛ÄùcŒÉÍÀªYä?M˝k\µNuœíØâó’ÁYD¨yã]85Ò™Í"V_öÕôfVXƒ!RMß*2A™bBwd*PjƒëYúKÖ∏≥ÑÕ≠ˆOµ°3këı…xñÉBA‡cg{ﬂcáœèûæ9µÏ];≠ùﬂÑèM“ë¿|§ßΩTî,cPaâ˛ıW5	øÙ¬¸KÁà0}æä^5ÆÏJR•Î‡%‘µƒøå@íh∂‚3Ee+ˇ˙ÿ¡Û~Gö^ãÚ¢7å@¿∏qmèùº9‹{˝Ωm` T1{åÆ£òãçíÆ”sæøNÅPyZÛñ_xUµC¨sëbπ{+xr´ë,µ›[È„}∞∆wOUıŒ(Ãjüa/Á«Uı$÷›ΩïË™7 Ÿ@≤{ÀˇQ?SFGüÑW2q9 é mI° ¸Ûæ?Mœ¸îÌ≤Å?ı‚tÌÅﬂS(ı“Ÿ•DÇÂ•±
=¬Ö7º°‹Õ◊y¡¯ÊÑÌJÔUﬁ3(nÈ*5±Ú…¡´´Âí¯í4JΩÒÛèS?L|drÇ.x·e‡çOA|ƒÉD˙÷ÇŸ)ÊΩä{ÈÕ4cS:~sﬁëÉ
ΩÿÃ.˝••d6y»ƒ˝#˚ûÚ& ¢S¯q	~FNâ>o‡ÍÚC¯øæÅ·%t¨uÛ^7lù∂%YÖÙI]∏ ‰ñu’Åîû’¯ŸM©Û⁄t˘™F¶ÕçØﬁ${í/∫˝√‹u≈éfï¸)È…äê˘⁄ê™Ö©®yıTg^∂ëL∂·ﬂ-°Ç¢uy}√ôÖWŸ/pû∞ƒªÚª{q∆÷Å'Î˛c~»Ü‘M8îs∞bIcñí¥å~º)Œ˘ÿ‡ ≥É≤˜jyõÇÜ®™W®
H˝ƒ“∆Í~ˆ5Ù≥Ø·3¯ó'ô¡‹co@√`Ïª1ªä£â‰ãè∫ øÇa§®Á˝"´Ω‘ÈÌc2®ïT$£8Øa≤y7ªB%©{ó*›’üÑ;¡ƒT`…´ÃÆ:ÖAÁ=ò–1äôN^ΩÙ¶±¯sÔÚrtû'Mªkk&E¡ûÁ€ÇŒ›ßªù=ﬁ
˝-⁄pÑ9¿dT(t¡±gÁuø’Jÿ	Æ·¯«SQûKµ∫´ZTnÙ‹*sÇlU|FéêÅ+5ß÷õC∫∫ﬁ–EˆVÂ=…©0-I∑$Ô†q…=A¿dAuƒﬁ§ﬁƒcˇ˘Øˇ¡~ÆAQÿÀ1?πM:(|Á1ﬁ√Vÿ´hvZ$‘˝∆o*HölŒ„¢ã«`8y	ÃªG2æÎø'˛,ıÆÆ
¶#„Ïk=ZFeXˇgßº^.+ÕÆ,zUòùXé‡’Cáø∂;í—E‰≈sI∆ÉÕd€‘Cå√#úQÜd$W÷ú˝kè‘¢[ô‘Y#00LH{aTü¥T©Y®N—£=uË›D≥t?±‹ÛààÍ
|¡/Ù«lúJH¢Ï=ÌÏÄ›sv˙jhÆˇµ◊Q6-[w+Xw/Uw*Rw+Ow(ñQ+áçN9„|ñıÎV[EVô<±WÊ	¨aÚ˙%ø˚BÛ¢ó¥≤SÚÑ(„yµÛcpÉ,Õ˙Le>ìP€E§Û›ÒãáØü”˚Å9∑—™AêLâ¯
Ô¶Àºöö•ı™“π"õ3¸kX5WÅpË%¬Ø_◊™Zû1'…q•≥ÆpºŸXΩù`~TEà÷ŸPPÁ≈ÕU3•*¿KsM€ﬂ4H«–W1>àò•ªÕ0gO˝Òÿ§ÁÁn∑≥0õUô†g‹›Ä4±†ª®5Æ*¨}rW¬A∫ìﬂF’ŒW∑`QÉåFqwç	™
¯5Ä`BèDà•»óTí•ÙÊô€*—√là7pXóÍc„@ò ÃB≈‡˙4üºÕ6ArAK8äﬁ4ÿp1X-)¨oﬂÏFIû/nSóuNÍÆ^»f~Âsò&Ü≠¡éÜ0/—"ÆÕ3´„:_ˆäSU+ùH”Ã_’›d„·6¶>Êyõ¯˜¸ó≠⁄∏]˘ZËåÏ_f∞»ÿëü∆¡e¬∫TÜÿT±¯xÖh+Ö›ÙıJuµ›ZâÓk£c#æw}†0˚ñıÀ‡*ì„o√8d¨¢Ü»X„∆∫4ÿ [@ cÉ–ëdùÙÎd ˝∫nz«∂¸éuı⁄át1Æ˘dï°eÖyË‚˜rjÍIø¿ìl•vΩ–ﬂ§∞	hDg‡•^˜é]Ô˛&sA_ß`’Yµ˝∫ÿ’RnÇú»£d£SRüHP§ΩTD¥"æ+“óî∂Œﬁ-!í{≥⁄ñ∆t1·mª%‘v˘ Y≤c_˙x xÂ&ÎúcúÖùÌ5s<†ß~$—Cöób“πÿ˜>rp∆Ä>{∞˙cêéﬁÄø§D©ÃÖ>ú9«üL«—çÔ';¸'ˆ*€íÜêΩ…ª ı¨Í˚ 1âMÆØ¶{^C;¨¬¡ˆ+äZ˛—z]π˙=
©®≤•hªè`∫XËˆÀ€˚≠˚î`¨y48H2Í=>_À˘Jß
%3¥gû‹∑∞mP$—`®˙“?S“∆tÕïØnΩ±7ç`©w«π[ûH9kπÀld)ÖØ∂˘ƒøŸ÷√ãHÏiπ≠i“ñà◊°ò!vÑu3Êí%/-v£h∫˚^ƒãNîã}ËHπWãÃçDp¯ÚS‰˘Î˝É◊ﬂwl%ıŸ∆&Ó≤GÔ«ﬁï9è*ú≤î‘øTk€÷Òø™6¨∞¥
Sd≠j›ò¿inËƒD´¨±M∂lõÔNâÖAù!V€À•€i4nˆ“‘®l>È•p,µ…î»äŒ^ñVs∞™ó¯æFe€Kıgä∫ÌÚ#µtõ.?Ì\nÜm÷¡¨ö£b√'+{à UTá
dEXÜ q¯ì.ÉlÑDSiìΩÍç,›òhk¿–,F}EiÓ◊‘ÎıÉuô≤?6*ŸÂQ+’¯4:t˜≤R’Øÿs–.&®~ÔΩ3ï"GØkÕ∂QBj∫û°¬ÚyÈœüËTÎ^}K}ß•¥»1≈ª≠Ugñ√æ÷w=πìí†Jßh!à¥’|¸Áˇ˛7ú ≠5ãx—˝≤ß’Ë}◊ŸáÓÙ£BÌ€±±15°zÏ¿Ru:e∑JBr˘“ÓeûÚ¥z¶{~a¿Ÿ≠Üÿ∫±»ˆ;l∫Ü–Wı ÚcÊÃVff-ˇr>Áƒ’‚¥qÊYüe-NEqπûç‚j–’ºjq(Sñ∆µ]3Z™∑?π·V¡xÙªÉ`§÷»	üHÁ>Õ«”lè◊Œ9Ò◊>ˇ#Ós'jÈÍ>tÁ˚ı⁄›c≈8°éŒEh°J	-*	-äF∑ª›ÌŒ≥≥Möèö(°neKõ∞ß˛x66¿åC)“Ib3Ÿ3÷∑¬9+€Á2£≈ÀFsΩöø4-πûŸÅô2éF`;~Ω˚≥ˆŒÑˇëO¸Ü&ﬁ¸öË<S®ÄQu
ôW‚gŒ#œ2†™ˆ;Ω	ÚıeVj› &«Ã¢5Yóx≥ê»v {T”2π≈ñwUﬁ“KÚ©\˚ˆ!íÌ¨Vju:ﬁîA˙Æ˙Z;X¨Ë” ∏∫:J4
˘Îp˘·ø0£îÏ◊˜∑x÷MÂ¡æå±“ïìã\ç£(∂kbY∑VÿÚÕ≤ØŸ¶¯œÚÇ1˛˛ l⁄¨•¨]_÷⁄µ¨¥u˛f:°E‚e9ÅP≥F'∞∏æa∑ŸÏ}z'~ƒ!˚4qAâ‰M≥ìÚZ∆¡	Ù‹ ¬IèPô·)CÏ9“Ÿ(∏J9X¢%ŸböŒ)ﬁ}ûWÂS6«ÈõC˛y∑ÊQ?[O≠ò÷äuÓ˜†˛€YUèØ>√—/ÿU?@˜&”,Œf≠¶dÂä¥S5baÅ∏$^—≈S7rR‘bÕà£(“=f`J@{ËQss¢πú£˜•»yÖ∂˚2H†È7yjπAñFD¬r~I©Jøà£…9j◊K#…
±˚ÑF*¶•’,€ÚA,Ÿ +¨ûπêπìEíºÙ*ﬁE∫ë∂Ææƒµ≈±	ﬁsf^+OÉINÿ2D \Ò"ªmÀ6≈ŒUÒR¿WKﬁÜﬂP∞® æãvNúƒ∞6MÓ¿Öàﬁ~ã,YD∫%≠vµﬂ][√ikÌ„^*{óßG[”_€l3Ìy^,=t¸≠Öd¿J-p«yaºC©÷å!˛jªÁ∏'|Ω	SqÃÏﬁV˛†_h÷Æ»÷›≠üëÍ‡7¨Ÿj8¨ÇT_≠•≈k +◊a≥OEaV∫ô Kéπ¢4∏Ú£›<4HlÜJ—ç£¯3IÉ…3Qnñ-¯Ñª	%àÇŸ≠+m2⁄'u–}Vf√Ê©±&©œlÈ=jDáÄ‘è$•¶óÃÒ0Tô8j=ˇoœüΩ9?¯€svt¸˙‡¸¯˘mOˆ^??tÜçiÇOS˘Œ„_??µè±=˝Ü={~≤wŒˆˆè^úùüÓùº0û$;+£ı&Á^R≠óÇÛaïú∆˘Ü^2∞ Â‡»Æ˝Oµg'Á·ìêçf)2!L˛Ø%ÌÓ/aﬁ5"¯M¢¡ã\CÔhó![$·Ù4Vb-⁄°C∆W”j)Z¬_ﬁûï¡≠∏H\2í^ÅúÉ§ﬂz}©†[¡õ‚¢Fá¶_QFıCàﬂ◊"/“WÚ4¸+Æá:@Ü‡u‚ÖBN™ù∂Dx´∑iﬁ9u∞˙£N™ˇ»6µOg◊+ûj?∑w∆ÜT){®do®E›õY)zÂµ·§?(¯çäÕﬂK«ÃÇ¡vÕ¶5¡%¢0[óæyÏ]¯c$±Ø¢l€Z^œì∞MXËCﬁ˚â˙–π◊Ã’wÍÙè∞ë¸‘≠«Ø „‘±«h*ﬁCáÀÍxó.ü˛≥ë;vßŸÈl8v9Û=›CØ˛Ö-ùOtx/À‡ıÓC∞Œ›∫˝RhJ'ô¶‰÷wÃ∫áé·˚(∏Ù›f˚‘øÙÉ©cØƒõŸπ7FÄÇ∏Únt◊{YÁ!ôó®Ä: ¥#dı(
e⁄…,·«Wto Æø@§”´p1]O.G>h‡nBÌô7FóEÃ}4n=ﬂ‚ÓíÌÊ¸2öLΩ¶õÉ$;ùa≥`å%§¢ ^≈|ÛWª˜ö[tm;˝ì·ìV&ÇÑR±u]XRxr¨ªçÆ¿è= ïDØmøﬁø0ô¬¬z¶´”éS>Nú›—qKe_ "8	Æ]% =ù!Nï·Œ4C/a_¡ˆ]U·{RÔRˇW‚EüôßUßﬁ n2mnÙ‚≥`∫ı˚©Å∂è”7‹[∑ÔQIc–Gﬁ_j±˘∫gÒv?JÒΩòfÂ7–Û*˛>∑¡*›ÉúÚÛŸ$nòÄŸºˇ®à'ÆΩæBêWnØøÔ„ˇOÉÏ`Á¡‰≥SÛädB' 3JH†zº
ëê6∏w˚æ˙ª6g0+ÃOgÔfŒ´¸ÓµΩ‡Ë˘Â,µYÍ	∞Ô›8ÓÓx?{fﬁ„i`± >µ˛®Òät§œK¢•^rÌ÷Ì√ Iœ£A‰∫∏√Ÿ–KúóˆΩ˘˝Ç=huQ|„fßÉ‹ÛÜŒ|5ÁıπÔ◊ÔZüΩ7U˛§—6—N#G?‘0ÒûF˚'¡ÙöÎ,$«._ﬁXD@c~π7Ò¶KK¶Á©mq5Ø˝õ›[|í~~√√˛=ﬁSsBÇ)©!ãó0¡…z0p√‚T”Ó(R∞ì‡%YŸ“Q™âÉkUû	V[· L&’	¢ZI”ÑñooN?˛‘Ω≥Ü≥¥∂∆8s¢îÎQ·∫¨%IÆl*4…åi%qò\ $}ëıa‰‘ì?∞aîìÂK;b]ZX¡E¶HøÔJ∫›Qò˘|≠≠)„?"<5ïΩF§•ÿ††,Fk∞r~‰•Äò.Ç›Ø[ó˝N±üX±Dõ1CÎPFµ)Xüc‚0ô ¸ßHñâ±ú”É•¥ŸW{ßﬂ˚qÔµq©›uæÏ°5l‘âöY∞‹Ω√æbû∞–çMõ?ï3©afü:î*y“úxÈâπä‰$ä±Z$w95ÎÕ¢í„÷ëgrmPÆná”Ó–{GYÂn1º"ño‰¿õƒ]›XF—“+ænªc≤ˆÎ,?Ü£$tË\Ê≤rËiƒ∑ÌW˜›ﬁπ±ˇ|8Ù,,wËÌäj€5˜S◊S∑ìì{±ıZldá;€‡rÍhå`∑˝≥òﬁÛı–¡‹ndjó˘ x;È¸t4≤˝˚È/´r·V•L ÚóYÈdV äå∆¥4”‹¸e[ﬁÖm)Û⁄¸ÒÏÀ:ã≈ût@=Â°gÂ»⁄ΩU~˝¢Îu&≠vosπ≈kX™/ÆÏ∑ú™QGÅAó¶
≠òû‚^r∑Q´f©ºKMi£≥iM]›òƒ:£å>∂a•i∆É$‚K4í¡å§èµπÙ®ÍˇºØÂ~5ÓàùâCs¶o ¢,ƒ+ç=vÊOfz$Ií9ç‹un+\XyÖ&ß<ΩÄ?^¬“ç&†[a~¿Ö≥$Ñõ?jóVÖ†ÌÑ	˝A3◊à¶Aø˚HÎD%;;≠MAù1KCd∑ºÒÓÌ-ã@>ÈÕ6Ç"ÚÉ~Í=6†0ñÒE+ØØQèñ´üÄùœBüŸ◊•‰ìŒL7åΩ¯cqê˝ã(>œñ˜≈h"ûÂ
‡Rßÿ07‚!¢—:\¡^˝∂ø≈∑e°¯8RoVÅYpu&©ß†ÈÄE}›Õt£ßq.~Ø f*∫ë†…Qêü{îª>ís˜eÒ∫ÚHı0u'qw≠ˇ§¯èFπy§Wnÿ`s.mé/MÍ3NÖÿN¡Õ„£ÌlˇˇSËèWUﬁ0„a1g6Íè`Bqê‡ïƒóª∑?è“tölØ¨¿ê˝§7ì)¥t‘ªå&+`ﬁ¶åÎ∆⁄÷÷÷„çÕç˛£Ó`kÌ‚bÌqcıÍ—ìª0§_˝swkı´$Ó~q˚íÜ≥≈´N&=ˇD∏Û@ëÄﬁÁrtmê∏7Nw;Ÿ∂•Ô%Àw-⁄l}≈∂¥ŒÑoyB0§¶1hp'Ø˙…≠®ï æC¯äπxCöÇˇe∞KYÉıŸ÷ñÔy”ì ÃÀ¨W? ™◊y\$[˛0ó6∫lT∆—%ﬂ˛,ß¸µ«e`ÇÑØK‹ùeˆÎØL∫!/«≥Åü,u@ú'ƒ«√(Í«ùeI[•ª&,l˘≈˛’Æ‘x[?ÒÇ˛}ÿ
ˇÄu^€·˜juº€	£hÍcÂR¡ó˙ql"ólüW?:¸ágRæf\æ(“1|	ØÆ?ÒSÇ÷∏º £ﬂÁgø≥MAFLΩ!O
t5ø\¿tosa6M˚äœiô9|œŒäg‘%Òä’Ó|ò≥Aî‘wÚ/¥©[¥‚nIâËè6jéÉÿjyö¢ZVjQìÛ√J)Nƒ¡ÚVÒ0ˆΩ	Qé¶}BıMT>ÏÆÀ—3ÕıÈÀ9õ’¯qÀ<S$dß®™=∫Dœ•/q∞ôƒ%ôE0ÈL!JΩóde˝¸Ö2à?€ﬂ°Aﬁ˘lÚÓN"?ﬁY)á≠â[Ã˛ÎÑµØ]538◊ÇŸ7®xO?v7üzæVﬁÆ˜πç•¯î±öƒ‘ì4dW•XÄM¸I•†fà†˛_z‚≠>ÎäÇ4…\ ¢÷©dâìÒ,…] ∞=·⁄‰≠kwÉ¿Ã0ﬁÄcy°óÃC/YèùcÔÑ‘≈ÃKÛè.ºx÷3∂÷L'bÇT5·ñW GÚ¡«‡òı¶)éS‚ß…≥ÿáœ6–Q4∆«†ﬂ	ÓZG4'0±◊…åé¸ê0ûb5g‡"ÄôæaÁﬁ‰¬—»°ãGX2Oœ·OÖ#·èÍ#oëru‚O88Ï˜úö˝0K¢hË/øÕ—ìh‚K|Ë7·Âôƒâ€b¿1ÿ©mX”íf.ì»Îu„\êfeáw:√æ)…Çq]Ù1œjµWÒ|©ßø}çß;œ∆—lp|u%Ÿ‘+ﬂ±ßœﬂ±≥É◊ØNèÕπlf≠IL´E."ëxË2˛J@á≥´∆ãı1qÁ’ÕgGÃÒñ1ÄIjˆ≈÷5	tm∂üÏº‡˙í:Ào‚Y∫›Ê4ø]z€A˘ŒCÿq≈AzÉ?'|Àt~¬TŒ≥#r¸ç≠Z∫Ñ'˝8»∞oéıÄÀB˘i•∏~ûÅxzS6»5v~˚sôÙX›◊‚4F¡Ú%7ZÒ_ÿ®†ﬁx.™ÚX] OJNwı§ñä±≠k‚üíŸ˙fï∏l£Hë˛h%wùã¢5!ª˘Bµ4„GP$g∂˚∂ô˙ÓbÒª˜â∏Ÿ3G‰Ô…PDH∑•M{9l ûj¡Åÿ2≤<ˇ!‚ á¡ãﬂ$¨<Ò>bäl$ì¬=qìEñcÃD |\Îµ≥>∏å√úf∫èE»$∂ª;D‚‹‡£i™—aÛ˛CX¯Üt¢ê·’GÊ+´y‰ÖÉ±/Fãêñ√r.HA7òî†$—M˙¯lﬂü±X-≥®hüQçÕÑÓ”@àp`¨Ø∂%≠´˝õË ÿ‘{ﬂÙ·Ã,‹T)≥6yP3'∏”—ﬁUèjL“=âNç3_Ã„ïb›ôokÈê—Ë hläH%S≠Q7ı[˜⁄\0—NF¨»G†ÕÕÏ•Ó.ß-9ö∫†¬4ºÚı≈c*Û∆[ı9íè+◊ç"‚jR>yêòÛÓ8ÂîΩò%~å_›K¶„ ]Í∞ŒÚ€’ül›öﬂçÔh6ò{2˚®_ ¿m+«=ÃÏ]ŒG–%Fk·¥k˙2¯i–•DÔæÿú- aˆu/º¡–∑+˘Ÿ$ùK{''ß«{æÔ§F´•e5æI›Z”ÇìÁØ˜^Ô1M‡u3EƒoN_œï˚í/KeN∫C£héaáÔú=?Û√õªÖ4œË¬7ù??=Ûzœ…HÇˆü=?≥IV	‘h±õ§åÏì´9º—9Í\7Kngä·|	‹m´®~@ŸÖXzõmµ%G\™∫Ó—±W≤ÊÃπç™e+r†N=ÓngÌÏç˝8=è/ésvè≠OçÜÊÛã;NÛa‡º!€Õ|œô?∞p‚‰ﬂ∫j8FsÓG´ıBÜ¬¯wTu•…XÀÂ™ß£åŸk™ŒqØáKÔHg2dnvÕX¢È∫X∫ˆuö?ä?)yÌΩø™Dq¢‰K§7Ôﬁ&¸ﬂÍ∑J‹yª2ëûÒæ„Y*›øUÔ‘÷≠TÓAµuWf>™ﬁÄ·÷lA¸G˝Lôl˝(π€˘ì\ŸÓà%‹¯©å;•ì]CYnr©h%UüÖ÷/RΩIEô(§(ΩSÖ
˝yèWñAE≥,R©F›o˚π!lÀú—Z‰‹O≤îzaÎ>—‰NŸ¿u1%—Ï´∑‘∂¥%ô,•åtƒË∞Ááa Kº+ø/—UK›´F◊*í*Í]™™œe}.´Ö£˘í.¿ƒ–P<cÙ@Uåa)fM+)3Œ’≤œZec≠°Z_È≥ëˇ>éBDù¶≥NÃWâÆ—d)"8%AÙ¶6Fe≠∫võhÿUsfïìYDX¶«∂…/µj€™„¯ùª≈·)ùR•˜F∑Aªe2◊P9ò#î‚z∆¬¨|ÕæèΩA [äÉ{7ÏÎï'≠I0a‚£,Ç˘fØ9”MŸUå¡Ä<qÉW:G¬9ı<dô3πÎ#‰a“£–◊$^ø¯"J1‹∞)Ñ‚f&7uŒ`e…ª21l”•L¨å:Nìsd≤±2#A»ææ$◊LrP¯”1Â∆qkMÄ,»^D˝L÷@m˘ª†æÚõX VΩü“ˆMZp?/ºZüÔ4Í◊ºq}üv‹v©é©MÇ—eª≥2ÍªI±∆Êãk˛ä~Ìó∂Õ:ï¨¢µiàπ≥É£ìΩ◊Ï¯’ﬁ°¡Ãhúıf˝£.ZÀßπÇµ|
˙Xøﬁ≈ÍsY‰m≥àéj≈“BÚÁ‹fŒîf´âìï:[=NÊ¢î9Ê”Ó†=î´Y´FÎ÷÷ È∑ÓπW°‰b1◊bá˝Ä#)aˆÔÒÿÌÁ&¥ˆE·]=RDëWe@2Y	∞sùÑ»ªóŸ·Y5yí¶°ß¶!XÃ¨h$ªi>Mô3}£»Õ0úgwïw´+ U÷„RÏ˚…uLì ~BwÜ˛P‹–ˆN;áï∏]é›Ç“˝£?ê„uÆß5¨¡Kh¢)∂¶ùÿﬂÛ¸5Œô˛[êÃºqêpxò≈&sX+£⁄ÿ0'p°≤lïFi;¡UﬂiÿŸº j∑èiRRG>
@˙˛OyÉv;∆8AíﬁåπõM4ùÃ;RÎÂ±$∏7å"∞x≠<˛˛‰üª_‘1w∫õΩµo≠u>=‘‹˘=k´õΩ≠˛∑˝ŒßØ~Ÿ]€¸*ö•”Y∫ÎÉM?0∆2º1Ã«X&¬Mk∏KŒv…*Î´ V˘ü◊T4•ÏœÜº∫ù1ônkΩfŸjÏT´4Gç7„ÛaeÎ≤ıóÎæ~ùÃe 7(X
%q°ØI\»ﬂüè/Ò:2‡‡	[ı¨O¡:Ìéî=rrö¥Ÿ)}óE˛≤q˜Œ∑ÎgHm˚±_Ÿ·ÎÔ∑©(û√˛\àz◊Åhj Ò»<Õö‰Øã4,~«v)-$è±#?Iº°ˆœôŒë-£±ëUnΩä&úÑC;HDÆmΩw∞ª2˛c¬–ñ∞Ü¶ï¬¿4,áﬁç'6„ãr73±ï?˝ŒBxÛFË≤üEhÆª[FÁÇ+ñ•ˆæà‚…˘Õ4+√‹ﬂ;8¸;÷o2›ß'ß«?<vﬁYVÄ£4ë>h·>Ëœ7ß≈K*˝îÇîdƒ2O®ﬂ-Í°Î£˙‘SÍ[NïÜ/ÖpÆ‘‹6Qx6ªò0a"„Yj¨¯†˙@∆1)x a˛‘ﬂâôíØ>£Ô2¢∆Ñt+ô&º1˙ò¿üé´÷=»:W&¢.Í»¨&®)êQó◊7Yàí<\ÈÆ/&iäáiõ„n~&÷πxÊÅ§,‘Ò◊ƒ≥Kí<t‰Ö` eè‰ ,¶'¥öΩ2C˝*∂Ó#≈?WI‹ØF[DBç )H˙ˇ  ˇˇÏ}ÕnI∂ﬁ˛>E4!≈nVë,äj5GjÅ’#∂§nö§z|-≠dUäïbUVMfñ(á¿lÏçºfÄyÔº è2/‡yüôøYE˝Ù00Ë…Ã»¯=ˇÁ;¡NRc˛±èÈ]ßÍñ2ö±ÜÉÑ”j“ÓmD÷ à=¨0œÀ∫ÀÜkptÑà“wëVD3Y˘ΩçfŒl•º ≥±1.~?uéÏEEdÀl∂Ÿ5|~IìT™/|ï.ï∆ê{¡ÄØ3
Eÿ¡àh∑Æ5¬ÍÖ‡˛:à÷¡SÚZt‡T8$o‰˚dwRƒ}¶W=°≥OJ˜m√
Ò∞%OH§QzdírôÛxí–•û·>ø˛>œ„:hG•√VúM8cßqÖ∂e•	ƒ¯-ÚÄƒ=Y÷£üvalö¯ºl≈ÁDÑ~	ŒØøæÿ˝ÈÂÓÛ_U;Ì7ÉÿKŸÆHåâ˝-;wÕ∆ºF√ï≈≤0•∆Uæı+÷–…nó$„dƒo9é≥!+‹˘yñC/0px»¸≠uˆ1ãü•∫~⁄÷ù>Œz¥.¥≤-6~¯)ÖQ$ù["@⁄Í°ƒˇ¯Îø˝≠Çg$]‚	ÎÁ^0=ö[ﬁZ·‹€˚èø˛èˇˆˇ˛˜øë}†¶Ï|íır√üGIö^òS–]„ΩøŒHÀ¬~E1Û«¬∞±;å≤i;Œbò`ø9ôß≈¸åÃÄŒ'yb®†#$˘˛ynÏ∆"L∏0–”ItçP%!ˇØˇnúv®3P≥A9Ç∂£î±cîW‚[P˝ﬂ˘ŸüËËë˛Ä5(æëú…$ﬁp^gc‡ú#‡Ph´…3éé{ÅÛã ÌÀ„AîE|zΩû~FVF™%ãˇ8O≤x®˘£V ◊ÙÏ5•˙T©”≈+¥‹Øh≠ã ´ùOe¯„4……A|gÔ¢(µ∆"ÓÉlï·≠“úıûî7Â|öù·L„p›˘¿ö˘|´Â¢6IÚhºÍB^DcºX›9K¨òÆ;’kG¥úıqrë√È–àóÍÅ⁄ \S/ñ{cHb˙ºÆ@ˆ◊‚`ZÖv2]¿#v!ÇâqLA°ü⁄Nå‹WñûOœWægëÄNæ.ø…øgqÜÅ/”∞»ÔY¸£˝Uõ4Rf•ï…‰c:ùAÄ-∆ôŸb`<x˜q QÎÂ6vÏÑ8ã ~ ´<mˆ©î⁄%¢‚£·ä9rï}◊Ôëa,K“
e‹®_q}<è„hb‰˚≠òx;.Æ´çc3≤ñlÖ=†ælà5‹ò·tÄæãHUO∆¨–≈˛∞S&'1–~∫M+´{äl¢/!¢Á bËˆ®ª’/≠}M§ÇLÌ3<4Ô≤fV3Ív#ƒƒòM;hòòmBàå√RôL¶„ƒ»€öŸ®ïm•æŸÇFﬂè>’`$mŒ…Ç)o≈B°·*ÕÓº*èÑ$b±f˙⁄pÀÔ[Ï4ú˘Âl<çÜÇ%\L˝D‰Lk–ÑXC±q∑É‚~	<
îøl«ŒUAÃ∞h±◊&Ÿ&√:`ïp—õgz"‚Y‰ÀÇ¨Ì!êÏ@√É6Bf!ƒ¡â&B¸9ÿ{µÒ⁄lCK>g∑Ï±˛Å#b–¿í∆Á¥Î!˝E«j|c/ı¶)L`F∫çT≥¶wÜÒÆÄ_Œ«"+¢Äüû˙|ˇo7G/¬À√Át¬¯˛£ÒÙƒVr»§Ëˇµ∞4Œ7àf≈<ãÌÊáOÕ°å©4ÎGf∫\≥"1‹≥Q^R
]Ô[ê‹<jqæƒC–c®(¥ìJ\
+Ñ+Q∆¿ù–≤ÖèåRˆÄCyÕ§^1w5ÌÅ¬hBáåbø7Z,Ã|@˙ÄáÿÉy_æ@j±Vñ†îÜ≠à%aÑ=`sX∫õŸ‹ÿX%˜…÷Üï˛5≤aΩ“R±Ì»≠^Ôô1?ÃT˙ˇ˛ØÀQ1Í—%1ŒvcıJçÏ)[–dG¸WÛ˜F˙ ®kN=ª∫uÉYÑP@.„’Å„Sﬂà¿∆Gt3ˇ«_ˇÁ_»≥æV°y≈ghüh“F”r‹_G_v„∑⁄87øH7ˇX∑êh7øx7[ƒ[É∏ô–?§´ÍüãPX®√ß|Çß∂§C§Ã|ƒD≥bß‘LøeEQy¸à@71K◊≥Ù"J£w‘önŒu˚(1EÂ`©]ô∫a¿Û<*»~J´í°ﬂ‡ö¢å`“Ùí:s|ÔX“taãØêˇ8á@X·‡jv%XÎT˚Væ¿‰Zë£ãìaeö*ˆ, öÆc}ôäk226!ï®Õ:ÆŸ•[’ıg¸âìåPTÅÒSÚ≠$¢ïtzC*^Jˇ%`![t2V,E’Ω‘BÇu	&ùÏ„ùÇß¢ÈÙÉ≥Õ_œ£ãÈºX,[Øﬁ4
Û∏©áΩê®ii*ÆcìsuÙéÍ u!Wè–™ºπMéΩú·ñö¸mÜÃﬁvf
˜›yÚüû¸tÙd	wG@(ûä< Á˙‘¿/ˇò¬0)„r~IóàG0|≤[˙,÷≥√5z>=M`≠M7:
ÖÎßÓk≈q‹òg,∂ƒˇå
w}ØéBuy¨öÉ˝ˆxäœ≠µ›€˙¨÷ê\7ÛeC;¯∏nÓ¬Äπ¢L’¡≠ªúï;›ÛbRŸ¯utW}÷Úí>ç€…^MŒ·¬1
˘Â}˝÷Ôæ¬†‚ÙÙ,öÌê„8çN#ÚÉ•÷».˚5,GQ∫Ê*˝∫L‹ë›,õûRMIõw\Œo{CÎÜ3[tt‰5éÂ¯bö&≈]!4Ë)D0%«Üó˝E}¿†xhÌ
BˆXXu]OØujkﬂ˘Ú9•jhË´{,Q‚ä<Iã,—é”Ä∂òe4ƒn√Ë0◊îÇÌÀE\)o—$V0íô~ikRX¢ñùı
Íz®Xı=FúU¡0#åfN“$∏™9‡ÿË•/◊7†ñêŸÚ(6W=°∂ÖZ÷Z†™êg˛$kBœ^·5álnﬂ⁄$(„€ºΩ^ar#´TYrµEç∂\Eç$1Í’FÔª{Øˆà…ëc	ÏXî≠Ó√ÚgŸùV+7!Pmî@Yﬂ  E0\™úé˜J7[≥ :Œ‘ °ŒŒòÁ≠‹ﬁmπdõ≤˘õ°æEs=,aQekÍé|ä≤Ÿ"ñ™éQN>Ü%	Ë÷ûÈ„*ñ„¯ªÔ≠pWBg;üMæùùïN¢2Œ∂´KÀq÷†ﬂ–ÀK˜q©ºYõJç**2ÙZ—©>—Ûyç&èu"X´w˜ßw›pñ&¿Ê(|Í<Ä≠‹™¢&ƒ@õ=us®"ˇÀﬂ‹•8¬™4YÑßÚœˆJMaÖúú`é¸µ†J6Ærµe»¶xXøÄÚN≠À3-Øæ“"PU@Ï•>0’S'∑/°˜ü?(˘SívÛ"YbY™uÙ˝™{Ë5î/<ñ‚Œßç•–5å±Â}\„ÅZˆ\¸ç™Ü&˜óG·òÙ!√ˇ`3ãáahﬂ>‹Erõ<Ü€®M3‹B_|·+iìı‚†iœ
≤ß=M7á|§VˆˇÛ˛OûCõ¡Æ“¿NÌÀ´h™ßÌÔÊ˚ÜÓÑ÷™∑,´≤Fè_Ô/∏Fïd.h√◊∏B⁄CÍ·@ì©LŸ;ºFT#üzùñl∑œ8Ÿ'cÕ¿œ>-n˚Ó›vÆ4ëv¢!´‹‹≠j°êö≈MN)¯zÛ~√^Óe⁄∑ª†îM¢‚4%FÒDh|úë∆£∏àSL>Bñ51ÄæsÄøõÉûãá’¢Æw(xj~€aÓ£da¢'¬i0k&Ö‚`£‹MáëÑÆ°∑t€q›u—cQ
§¡≈≤ïó†ΩŸ“±XL∂=%*Âgå”SúC>0àEkŒë–˛ﬁ;Õ¿‡Ä±ôé>Ãkœá¸ﬂ"ø$ÒπE„≤d„Î¶Ze=nı%B¢&§öè1H“˛Z"¶€5{+:kxË¨˘†¢≥ÊáçŒZB:√']L≥Ä•BXtÈWÈi:k~PËÿ¿Â¨Y+ˆyU¨æE	—4∑`:b±ﬁ¯(â~ÜÍAuç;B∂~VÁÙÌ˝Ø•AçW>»ö{ãÌ˜G‰ó'á˚?Ï?Ÿª&ÉöÂè´Wz*ÿbdA˙2B»OàxƒBåì∑R7+w"¿]ÛËdl@m¡∆ŸéÄVÃ ﬁ ”¢ÏòtBé"¯Hf¬È¡f@éÂ∂:R&0π‹ÃÈ-ñ-ùﬁüU(—⁄õ÷.}~Gèø˚± k«Ê∏c!
öªπÉŸ“áÏáí5+†P›8rI‰ !,e1ü'√êèX≥í¡Â∫RL]|áÓ«hBû≈„π∂FÄ∏vü‰¿ÂEî«…ƒÛ‘O~ÏS˜≈ûäQ>7Öiñ3ˇ$á"Ná_ˆëpàY´%∂KÎ√˜Ié^…J§PÎ*;èü«·Û:zúQ≥≈ûìµ˘≤¿6ÁnøçÊ„‚&0∫ÓK|éÁqgµWL˜è~>¢†'˜ÌSﬂæµõh√∫·µÕ∂á°§¸ÑéÑïr[˜Ò˛úeº/Ú\EìYÙYü`π_ˆπh«røl≥∆≥ﬁ£âÛZr#3u7¨òñÿúgâù"Ë"7AR—n¶Á˘ÉK#ÆëÇ^˘ct—z≈g’<—ïaD´ƒf∞èà0ö≥ò⁄b)›˝˝ırA¬%ee5	E∆Äc‹ZÛR˘ôÉ0˚åÌ^c 1∑oY[´lM/ E3UN3÷ú7£˝êi˝EE4>k±pzÄ{@ô^n7˘}ÙÓØÀé-¬Ü!ÏM.Ë‰‰°∆∏C∏ì∞29B˘qfR:c+¢ﬁòö!˜á‘§'ô'A`˚Ûü[º'ò5€ºùËâå!zH[Ì¨n°zì5ãç"©YYTP6õ;nßnµ{ém∑rJìÎY?swJõƒ™CΩ,œiïÀfßcÂò}∏ª˜f⁄êLÃCu‰ªô>÷Ã{Û˚ºÆØÛÓÊ]Ù›%∫06Øí∫dÚ°Õã©∏Å}KÈwa0/¢d¸Û,.K„nıùy^±Ó⁄òkFü«`Îîæ,9è.¢Bàx¿‡SVÎ#PMâ}ı¨1ÍSt'πº©•<mØ{Y¸>Œr‘⁄y"‡ùµyË8\iVÿh& ÙË,—ÉMá∞¡JêÎÚ“‘ ·<£˛eLyuÈßœü S=È±˚Ç{Lqì{Ûzpio∑ËVüFjQê†2xüˇ∞±¬C˚µâk+ˆÿ˝∫˘≠çÁ◊çŒù'T∂˚4d›E“l>âeÚwTÏ†Ø˘≠õ1‰èz?âÇ≈ù4y?Äïf”Ì©˜À4≤.$®ÆŸ‡¸b\9éFÛ4Jù	Ie±Áé˜Ç.LŒ+˚™nt}áZ<K”ƒ¸©~–ÛL˘?ËKÎDJWEÀrãIÃ4fµ9ì® Ü*eRÕf∞/áµIlK»®*€Nc8áÒ;ö°xã¥D<h(•yïÕèe¯–Àzi|:ı<¶.Â†zŒ3ÿπo	vñ·¡¸≈·∆W˛∞Aíh…ó«/{€H{y≤˛áË¨0◊ÛìÍïJkü‘¶t\ò„∑^zkÒµá‰Õ≠ÚÙ≤Ä¨<…~≈›’WohÑÿﬁØHæ>¨˚£øÚî’¸ó9àÏKµ(∫≥µB
 ‰:\^˝œOÜ≤W=¶!óü˘ÒØåÌÀ?˚:adSôŒ]%!@-tòùﬁ˜xyI◊L´A∆ÚÇUaÙ∫ê	7“˜¢%°“øå'ßhË{∂ˆˆw|˘l˜ßüÙ{÷.+«?%j@}ÄíLfÄ•>∆1˛çxåïdÿ›ﬂ[YÛ=Gﬁƒnà»?+ÈÑ©d‡›?!Xﬂº9û¶ßØ]ƒQ÷‚{W~zÈÅ˛t÷Í•ëõ‚èa…6{Ò‘¨ÁÇ;†√L?û˙™!á.≥ˇ»ÄU~≠êÿ∆ØçDµÅ®ØMÖ.#Ìõöﬁ*Y£ΩŒ"t»∂©
GDÖñÃGp¸œ∫ûb.EPy∞Ú4öÕÛ⁄bÌÛÆ'ë?Èi‘/n∂ºmîﬂ}O«¬ÈmŒA˘IÛ≠˚!-†BıGK]ÌV~{mÜ¯j«¿°ë⁄ƒs¯¬∞–ù&•\+∏C>Nf]∏!"∏sR≤Íb8 ÚÄºO‚s‡@O&≥ÒÙ"é¢¯¸”ÑÅ˛NÈ!…)Ü˝Aî∆cÚ@ZGÚ‚Dò ·„+™∑—Ù<æÏ˘0…bPv≤ïUr˚∂¬W˙â˝Ó_î©‡¶ÏVŸLX}-™~xö‰≈4ª–¯n;£Üø∂3›•ı€|≠∆WÄ7»≥¡gµË'ÅeÆ™õÉ}>:∂;|è≥@_Ù@¯Q7ùAc:èŸòJÜñÒ”"ÑÒ©C·w8ƒ“Û˘dçXú»÷ﬂ¿◊£	p¥B
6÷4˜°Zò4ˆ˚áiv∂]‰¸≥ıﬁóÌDÉ¡â“ãWØ◊ S◊p¸≥áLÇ„ı®¨«_êÂ=A“ì»"ÎeÄTh
‚â^N`:Ï(«M1–ÊÜùB˘˛¸Úx•˘Dµ#Û"–˜˘Íâ˚'n˝©†â®ÿÕ”È<√=€◊aM§’S´  å iØƒWÖ¡˛N”«tπqí∂xø|≥ó«ùEgÛ€5Ñ¿ˇ)œä¬—b¡[¸X±ÔÎé™_6ã>™ÀEk|ΩOßöÿ”ó∫⁄/≠kÿyd∫Ú5πÀ˛≥™ Á ÏDû&Eı·¥øÇk«zgHØ€∞W]Ø˙∞4¶åoÅÿ5Í\í^Ø«oﬂö|ß÷‰eY´ÓÌï4@qx<fzjO≠ëWØ≈∫æNc8—Ò˚ëS{6ã˚°¡x¯£°ÕﬁBö®†Œÿ|Yõw€¯pI˜{¨∑—€®j9q:-Å∞Ú®Q•oê‘
£®·¨º}õΩBÑ˘ ®¬€páø&≤#÷ÿ∫ÏôV˝*^Ús∏pÍì8bPhü?Ÿ˝Â…Ø{ªˇ⁄PiÈ@éŸStRÍÃ‹Séò˝§>√èÌNMÅÑeQ(lcÑ%u2º]›tı≈"≈
\-6ø∆–•Àµ#Ú`l cXR∏◊Ú¡S6ûÇ‚4N'}®≤«ÍˇÃ-≥"S—2ü@]ç™w-`ıoïW¯µ/pÇ˜B|è~Dy˛|ÑEm;¬˜‡˜ö4ﬁx‚ŸôsÎ≤<ˆW›[óuá 	πz”4ß¯›ãêõ·q7‰€Awæ˘àœ˝nàq÷öÒ’7CxÀx|nÑÎN®∑õmDYíáÂÅ‡ªie´‚íy∞˘ÓΩùfO¢¡®√N7¸JK©øí•iÁ.ªÈôX∏“=⁄’∑ı˙™…áÜÒ¨8äã´(<¿ü‡äM`ı¯ÔÚÜ›…ô2Å¨Seê'—i•%¶‹ﬂC§Cí,h◊QéoıaOzZb”¬®mèmnÉ†’‘¬_†˘u|¡Uyqy4é≤ã‡d>é0PCÌ„$ cﬁˆ÷~¬˛ÃEÓ‡PöÉ°Z›˝*t$Mò«CÈÉﬂ®[_
T◊Úì«¥=¯©'∑_KõÄ≤¥°ØÆUZÆ+Ωxäê|TkXS∞∆›Â⁄ [§e™P⁄£aî‘ÀJw∏YTxGø'ú·ÀX «YQ•◊˙†n”ó5èJá“Ò,∑∫ úÙT[Gﬂwo¢B◊ò~§¥4.™c&∫n√∞ KÍøß!ìÁpp99π Á±Páıéø¢¨ˆÙà˜ú
¥ó‰’Y|±√ŸøÊ.é\ƒj≥Å(–cf’>qXG™¿2l
’s¡áÓ—%ı/.@≠3}ÏYåÎ˚ÊÃÍtæFn]÷=k‹W•_
÷CÒ$U¢|4Õä ‹Ã'_M¢Ó∑V@ø!w·`ÙÔ‘ö%¸UM≠Ô,Ë„o~'˚5KÕÛüÙÎU"˛kÍµºF‚üØ*lJœy˜’ÂïM©bû#V∞¥`r⁄ÂÈ@íûa-Òo ÿœ1lH¸JíˇÃØº˘6—[¯™ñ≠◊dbïOCú®t'∫¢˜Ú‡Bu”Ò∞¢ûÂ†™ÚPGUÆIT"∫SèNCêu=Í9ûÜ6Sïà˘ÜnÇsV’—>¡KâÓî{€» ∑OÍíS0wÇ›‡•I*G˛<JÄjù≈Ÿ˚d˜ÿLˆ¶É9
Xù‘r∏n¬rÄ“PNxUπr¨∑ÒÙtw@À¸\®ñ©ïÉ›=¸˘˘ÛÜXΩÚÚ`o˜∏)nøyßßÛìhÑE8Ò… |ø«ììy∂"Æ˛}#§<ëÖG—˙h+W¿ä˘t(L
ıõ+XØ,!á3¯?≤Qí	P:Xûw—ê?Õ◊¯¥¢é©ÀÜ∑SÔ”PΩz@˙—>®Q{Ωûæ”¶JèÚu)3XÒg4=?ûFy—)≤y¨ò Q1ëNúe:’|:ï:À¶YgÖ@í·ËØv‡î·k≠¿JGjôIKFµé±sqöFªL**Ju0Du∑`::r%Ω‘ÁÚJQZØÏÙV|ˇï$F™ÑÃÙ‰Ér}ñB7‘yã_m⁄ñÃÎXO≠TOgt∑f•∆WÕ`U7ÓÎ°PÙ,√á/b$.|ÃtÇ^ÈÜ ôÏ.ösÄDÖﬂÜÎ•DÂ…jCëp˝D«π¸Emí¨µZãX›D)’¬T7É¯¨ïöë4¶jßr]⁄≈À.ÿ++¯&ê-\]æ.L7öNb‹ˆ¿¢©óQË¿ëjo.x{Me∞Ω âÏ]§ãpR†Å¶(ˇÀ2áºä}£ÂÅ\∆úÇ’i’œ@˝nb9∞Åy{˝⁄ öØ…Óﬁ±f<´œ˚’rˇN¨Â^Âµ±ãÔqΩxÔ=ZãÂÏ˜◊´v≤r¨†ılc1‘ê¢3F)˘=h!ªŸ@†üß%´´¡?8≥Ö◊ÁÕ p◊“ÏImc¿©&3gΩŒ¶Foy™Úrcè˜”Ùc…ç3@:PÚd¯®^∑µ≈‘rﬁd∂[xz5õ6¶˘êËy«ô¯ nî≠Ò≤6ß˘ñ!@¨Ÿ¨X-R√µ—l88á}∏n&óåÍá¡Nôˇ≈ÆäÕiúÆõﬁL-6Â¸—SRbN|]Æá•˙¨‚ÄêõQÊ6±6}°kcÂr˘$m ∫†3&†Å˘H/wj¨˜M!ºú˝¶ø!e‰µeˆ¶Á©òˆ.¨¯◊^^!t8LÖc˘ÆEÖÒ≤:è¡µ˙≤§„µCë/Ï<£"B\e(eu–T+5¶ñ^trïﬂ|˝}_á‰Îñ¢∑‘0ËáVnhxiG⁄îØYíï∫A÷:-UCAŸ\∏OŒZÈl7ΩãêõÕxÑó]‹|E©ŒP[îòOT<ôúZ&≠hÇΩèÄ(ŸSïdp§>B®Ù%∆0=A≥IwÄk&Ì∞vçã+∂GÏPîÓÍæ2`átß+ÄE∑Ø+$]iv}0O≥‹êGÂ.EMWúZ˘™∂e\µéJ≥ÆX≤ôb>†œDpãî†5UŸg˙”›™¢ze—¡_˜k0õ⁄∞£dƒ
ø Œç;ıI€?˛˙ﬂˇy$∏l˛Ò◊ˇ/ºƒÉƒ'3ÀçO‚R>CÍ>˘Ãu˘8Î^”\/ø√æá3Xèº•Ω¶hÕ(÷nÎ÷€*i¥'ê„∏àf‚¡~sÎR‡ﬁWÙàìgqˆ.≤\We!}*_˚JÃ¶‹=øÏ=ˇ¸Ωê>ø>[í^É#ôIÖı“ >´ ÀÀ(∏¸ë] ü¥∏≤¡1fëI]ÂñôÒLgCT_~4	¸©}›Û˜sSŸôwb∂ òå+◊ÊÍ∏‘ü£¯ÊhúÃv@`”øG«≤™°U%åx7òÜíæùRs6π]ö¥2î…—Ú±›,°´eX$$‹ÊEŒúS,®’Â…ÿ [j•.xi†®W%˚âıeº›Dã„Op€⁄¡ﬁŒ[ºU#}'ªsÑªÃı78Ù 5v⁄ˇ¥«Hµ˝È!M˜∂mÈ⁄¶©'≠•ªÀ´+≠Â”¨pk÷ñZW∫¬ˆ]n¯´≠>ﬁiYã´ = íØj¡XSa[u—^]a´˙w»ˇSjc]—[ªìÕ]ÑvÏ!ÆÂ≠iÁ’Qá#mu÷U•üE˘â¡‡TU∫DX¶„¯&˘m;©›ws¨¬0K“w—˛cÑπ¿Ôsd±Dg1‹°9På≤ù-≥ ¥¡˚ WûÓØ?ÌÚ@pì‹]b9ﬁFø¬2kÑ¯£Ø◊‹Ì’FØO^≥ !Æ®S†¯—ò-“9úô$Ω≈Í†≤2 ;¡l^cÂ'X¥£˘)©à≈«PÚÉ]Å±ŸÖb)SbØvb/ü™˝”ótVX%'jˇ¬5e¸J∆Hß‡1Ãy:⁄!œƒËQú⁄´√∞˙3[¡Âu≈Ú1*’¸àß»£¶/8cxF[ñeªbÑwıbY_wã&∂cVEﬂ4@π‹^\≥wb—™8K,Ó‚)Û8£õítòúNaa6Tôh÷Ω'ÓEΩ¢JE’ÎB(zÜS2hı,ÃJã≈©¯ÒäüîÕπDU Gqñ'#“˘).Ã\Ãfè◊9€Ô(á\“±]•_–|\ÂÜëmÂZ¸ÏN∂°5¥^˝™Yù.N`÷√‰ÂìÒ<ÎNÜ.oª‚-Àı‚ß∂ÑÌ-áÖ~/*"rgp‰ì∑…hŒ‰Èa;[¥QŸ◊´¬BØ`çMØÒ~iêG˚
5ô—Pqoüß≤_eôáÎﬁ¨Í;[¢ßnKÅ¨π£*ÁF•e“œò¢»o“ 4’Á® ∏¥∂çsÇ!ZÓ¶ô˚ã{†EﬁC⁄ª|ZÈ¥MÙÂQâD¨ÕTÿä≠\j’ 'm$Cè∞¨b‡zôﬂ2ª“ã≠éÉÂ1ÀΩ∂{Yı◊ÑQïdÁéÉÏ ]Ú¿√›É>dıôYwdx+’ˇ$[8ÖKv˙1ˆèJ´ÆÕÎ÷€'X>‚öC*ç∆éK¥§ô7Y,m≥FﬁW¬füu∏|ea¥'(^HSç◊I*ßBmÅ5ì‰jV◊¸c–œí‚1öÅºäyƒ3Xøß	2oKêß#‡Í∆ 2•—C+W¥á£8\0£¢ch‹îx∆ÃPy|Üy∂`1k¯I€ò∑,ßì„tÓOá,'Àq€(«ı]⁄ˆc•≥Ï÷FÀ∂â\œ∆…ŸKÚ$’Á£∏d*„⁄Î._ÆMˆ‚"J∆Òê< ‚Ët›î|ΩÆuçVE_Xnp›ÇÑùØô∞Ñ≈÷F/±µYoÄ∫~«]Ÿ≥ÖÆ7«BÍø◊ûu¯ˆÁWdß…FÓπGÑê√ım5ÍP@≠wqüÚôe®s©§‹]Z˘Lﬂk„8T;A‚€ˆ*òÛlöæMNiΩÚrç¸
SÑ8≈*Èå∫sQOå¢Émí…pß°íπ‚ÔÄí±êQBÖ
=	3èAâkjﬁ€mY~Î◊.Û|¬Us˛Ûd®jÂ4∆8¯"-´ßân˚’˝Ò Àt˚A®5œª0À•Í]h…C,A #ä√~Õè˚≠_ıøÇ;f¬â8xOziuïî@Uˇ¿⁄∫⁄L4¬0+ú§ıU‘)ƒÓZ÷MÁì‹øbR«ÁxvfÄÖ2!!z˜∫å˛ßo´mB†Îv-≈¢úèyW—Ò
πTK˙ú Wr›X~VV!‰LfÖ%€ïQ>?;„È‚’yeÛùÄ2I:¥”)ƒCa∆∏’7k∞ÿpyq)\	πu3ÿufQñ«˚i¡˙ÛGç˛{«YC÷9Æ˙o{ª<û“≥©Mé0fﬁï*∫Xë$Ñº¨JwP˝ a∞+jcÂßºéó˜$ﬁ*o‘øıL[Ú+^uˇ…0)∂BîüK˘úè˙£˙0&5î˙ÛE5¬§9G%Ω§ÜcX˝∑‰®ÄÉe‰eö,ø∆c’úÏ”c¡|j,¢¢Úúbﬁ(*é~ø EÖÔ‰lƒèë>XRÂçéÒôÈﬁÏTd*<-Âˇ7í>i)È/ €)íøêaí›ß9aí¢ßî*%eDÔ%ëÖIa=8KíøX·SŸÒuøz#=^ÉÙ\$´9FRêÉl⁄Õ0ˆçÌ»« [?`˝≥ﬁ$Œπ¿îhwö‹%≥R‡Ÿr¥ÁxzŒÂ±∑Iñ›q\¿˜v|∂Ò0I®”cHöœ/,Ë≥µÈÑ∏TJQî–í5$Äq¯Æ®Ø=.EÎ{∆1^6 wrÿ¥Ô…Fòc‘Lez´ù;RÌe‘ùÒÿ≠M1™≈òXVıc	„“çl[”?ú‰ßå‡≤•†UcÛÅ<Y :8…QÛêPp±à˝D@ª aÖãbçÇFÒ≠¿Q¨µ√}RCµÍ`Æıæ£éy+mπÖü˝”lUcÿÕ≤È9RäÕ•ã{û“Öü≤·ı‘2bÙ•ﬁF€fhõ&ÎÚ÷0yÊ_Yv”S«m/§ÿ´àQ‚ë6ùÚÚﬁ∂ä!5—F5ÑŸFŸãOs ¢<a_√ÄÁrÜ—!¯∫≠´HûTíµ™Nîß.h©ò¥zÂ3ÇÌÔ˘©H+À\öü‹OCh£F»Á∑ôÁ±Y]P.'Œíf€eñ!’ØZÉ†[àÙp¶‡|=†ÉYÁ¥"Wæ*»p∆>$⁄W≠3Ñ√jqwèQÈÄ⁄¬≠\£E…P˛}ΩC^ÒÚ,Ë}Ì!9sA•É≤√+ùÿŸ∆Ú‹ûG;EØ
'…)ÉÚÓ$QüLd_RV≠©A¶ﬁÀ\ú q"\)€eyFΩñÕÛ"Tè”A‹¡±_#…CYå(¿z⁄æƒ•´øó dOêÎó•Áø*?* ~E*…Nı¬∆okÓFäU…}rØQ0lêÓ˙ú¶^∑”‘¸ÍyzwáM*˛¶°N®©‘557ªÿ™McôKv$z±UıFCﬁ®Kjnƒ„fÛPj≈FYÿt–Ωu	4‡ ä©6Ÿ„t ∞íR<Ü3Y¢÷≈ óΩÑUÑ∂’dCqó∂)—^…∂∏Á fV}›∑|©)k°‰Ñ5Üµ[€ñÖ ÅP>s«a_h∂ù&eÏAÁ∂<Œæ§%"FÇ:j(õ˛Sî=A†ıìRCHI5ÄAËvöh‰rªBÆ”uÖEÿæ"!ı§1wº⁄‹2ãïﬂÿ<Í¨ãM¸=ãesn1 îY9‚Ò4=à¨õRÕ∏Er˝„tøˆÊoéﬁ	cÇ¨â¸AØÉQ[ï	Ù¸º˚6)(Ù9ìQAík ∞Â€§˘X2÷˘6≈0y¯Ω∏O1ã[Ï>7∏nÑõ∞º-ﬁÆX¢v][uH˘êlÑnŸœQc[tæ¶^*º‹®BøÿÊΩ—˙æ›Áæ^È{‚_IP?˘mŒ>≈‚l#\±ˆêºy</íı˝?%ÈNeW'ù[ó»/∆ÿ/∆Ó^≠ö`rÌç‚¥W\K÷W+ÜÇ5ÌõïÍG∞–∞®˝Ó09M
,Uü§s¨/\˝
â/ß¨8√ú@9Væk–¢ó3ä7∏˝≠6<$àO|À”n/∂ÀÊ1v`>Ê%·y∫R∫}G	ASrÇ€»xSäê=ñJ£»ÌqÒ;rœ3ÿTYÑV˚(,¥ÿÊñµ(ºª‚Y¢Ì¯T©vÆËõΩ§£π]ñÜ’˚–‚òî \L[\e}lÕΩk)∆°k∞‡úó°}¥ë-ñ°¥Û¡<õ#v´NIA;°	Ëˇ/’¶urAé.r∂Éqõ˙J¯ˆÛÂkV`!ƒˆâ∂O˙!Õ{[&åTã€¬“òÇèB+¡¿{äM˘€VfàE4⁄äø0˙æK‡€_ˆâÁâùÀÜ€‡Í]à9úŒÂz/ÇÄÁŸb¢ﬂ¥ømmxä¶E/¢ﬂf;`´Ñõ∫}îã¯B–„æ©æ+≥¨¯ûUÛÂBW¯xlq—∆PSó˜Ü≠V¨)∞π|—éE´Ê4\Ä∂(B6u™ÉB2ˆè!|•.≈œ·
nˆ±Í1°—£3˘–çÊ≈î!=;zaV∆;+£+à⁄\cπ—wè‚Ò|Bvá9LŒ£ã»'Îw±Úä∆ﬂv‡…ÊØ’ﬂ5*ﬂ4ﬁ”ŸÛ)±Á[`œøºûOq=si=iÚz,¯∫
1=+Yú õŒ„ïùÍô≈KÏQá2¸´˜›=œB{¸çÕ†b{Uÿ⁄∏©Ωg´Ωó‰áÂ^W5Úd„˜7µ§N>£Zx’Va=r-Y¸<™–=G…Ñ¿YBKÎ4çtıÁ≠˜ïÊD∑.'†£6ØÉµY.¬PCöº‰™
«ˇUΩÄ±-K©w0ûÁèìl0é€ùÎk™◊‹´ﬂ~•∏rs›•‚ÿì©V\}ÊÆ£XÎ›ªZ‹À≠Üh~V$‰Q“¶AlQ/é% €˘ véÿ9‹˘≥ıtZD–S6NF øÉù…AˇNÒW'— " Çç=Â	Z?zÂ∏Íñ›‘çì€3ËÁtöŸéqV3T ≤ñ/†·†≈(Â˚@áwa”#%Ωx˝´÷1»º∫◊…â≠;GU/{ ¬˝ÈÈ4yçÁ0ûcdT≥iV ªwhó‚£dù<zÙ¬™5≤ÔÂŸ4ÕÁF˘/Ú<öEò‹¢∑É(;K≤ıc<–Ïﬂ‰6ÅüZtµá•Kıh«
ƒ@∂∆ò{èØ8UÔCy%iz„‡ˇpwqùdÀÇ¨Ìwà+V≈ò‘ ≤6◊ÅˇPπáﬁ¸ˆãq¡D"Ÿ£…cìªÒ{às&íZæ^e◊ü1ö`ñY…≤∏ÊMUÕÎ´™˘Âüíg1‹∏à°∫ƒÈ)-Wy›≈5AÒd	%RÅ6≈†B•‰±£≥9òÁëÂ¸}9≈5Ωì;?Ô§¶≈î°§Ç¿O@‚ó#ñç–Á„!ËË[%ºÉæÜ§ÇÛ‡πí‘∫m˚J∞ÿÚmlRÂ„]ñúùmı•<]Z·—Z˙«ç]hØ“bï_h≈ïó¥í6ÓØM¢X®ï˛o◊XX÷j⁄Y§≤¨€¥XµY^™»e;¥Y:…2KŒïΩAx◊£˘”íl¯ÆFTWßÂ%»÷_•chƒ^~˝˚Áhç·DcítÊºi™£e£)áÒ k7Úg]Â˛,ü±cŒ·ÅÜö≤Yfö¶`”dﬂX ·œ‘Ÿú,¢§üqü5w0…e&ﬁd{‘cÔm2Üc–È∞¸˜¨áŒ˙˝!ıÕKıù˜(j9q)ÜÛA‹È‰kd¿LÊ‰2‡êkd√ÒzãíÖ∆]XnΩBU2]÷œ‰œä·«Ω˜xÊçÀh¡ÔÛîñflK†íœ{y§≠'Õ˚º€¬Kx„#h†}‹~„≤õ≈ü6¬Ωô©\.ﬂ¬K∑* È‹<¶Ÿò£(7<ÊyôÁ]¢Û0S—Œ…=À5Ú«ùh¨∞”≠æ–ÕçTÍ¸√|0ØhúêÏ‹kh£ˆ±≥ühëåê3 4O–tN¶µWó\`‹¸n:¥áET ’˚B Ÿ∑-é©ó1Àˆ™◊Î…«ˇµeKeñ^»5ØfÄ´K¡j|≠R±Q⁄∑Ã£¡µ˙aátMæU±¸¨å~V±’ æ?Ñ3
o√jêØ…Foc€›A”°µ]˜–&µ\–´@Áüf˘5`S^C%áe‚iI®ó∫H?£&B˝ 6R&úûHòqªæhòƒé`©´òPíY∑î/6~GK†o’oDÀe∆˛L
Ã÷ÙüZ8Z[å`îäeaS¥Öìh"·ÒijT¯!NHD∫[h0€îÂ,ÉöØú≠˙‘y"±£«§òÁô≠L+ÙM‡cÿu˛G≥`ãgG;ö¡∆Ô(THEE±Í}KæQYãêg7>9Ï>ßÒR\íÂ&@¥a√VÀﬁ¨®]≠J)Ë≤qç9wæ–?à™ q1L’†+¬-dUc}Ëû√„€Ï˘lû"OÛCÖd”‹|/c∆f¬õ1≥fi…:∫6A˛›?sC4w9Æc~ì√õ»a(œMge4ùƒzÍvìI∞`&¡^ÙP,ÀsÎR‡>óLÇ£xà6¶€d}òè0n¨6Y(ù†Eê{Ûà_ñt»mˇ\Ü›≥•A–∞ŒµÕoàUöfÙ\ËLv˛Î¨7ÕUãDM_¸'ªÒÀeÚ¢Ü.ﬁì—‘eŒÿ4ö®Ç≥Z€≤<´¸	¯≤læÂ
3ëkj üÏ„"J∆+Ü7¥öÿå ≥V“ª≠òU∞H∑6xUÕ∞ÙGC≤dö¡~ë˝tòÄ:ÕåÖa-jÆ®⁄+@„ΩC5^√ÍdL√âÙZØô÷†¨˝∑<Ê≥rÇT’|
£±©víb)∞ÿ^⁄1|ÏÀ°∞ ‘%%‘˜ãDAéÙyœ§≠›amV¶√OTîìcÿ≥”ƒ¸p˚uì>√8ü}ÉÑ«„tçﬁ»Âz£;∆Bä98B≤öbﬁBﬂnØv0µñS û~«2JøZGqNa™LœEÀñ›!˘"ö$ii»ñ£ÙÚhg]WaÜjÆ†qE4Ñ3’_ˆ®3!ˇCRå@h.äŸ *bV6K“¡x¥¶≥Ã7w>t:ùˆNÅQ¨Z}∏t™Æä‡£,~˚†1ßcà¢È?X˘ŒMzÊ≤]z∞íNß≥8ÖÌKß…8Àl!‰¨5ÂŸMEÕÑä√˝åVêÇ<9˚R9`eqÕú2}4?ã»k◊Ûµ¸¿™ƒ≈p$¶3êf—)]Íé√H‰≤£\b¯_T<Á;∑ó‰3m'—Òï˚Îë’¬buÊ“)æ;V≠?_·Êët.Dÿ!vC‹¥≠Ud7Öö®∫≠z[∏Ÿ¥π˙À*Ë…∑˙{8¬ßYúÁÓu‘~FHA(`üª˙∂/9∆‚**€àWÔKµzdﬂâ_0ÔŸ36@–Ö`#–oÂÙ“™ÂÕ-Õ™Ωqı£ËGÛåﬁ!™Vqei£◊wu" Â#∂L“ö9˝GIŒ’ß]™ëTJî”ÊÃ‰⁄ÚP9≈Ÿ-ó˜≈Ów±Ù/èLX˝ nKb(qÒB∑˚òHvG‘Yµ¿›'x‰M‰qˇ‹ÓÅøﬁ#ﬁ@≈Û8Ë%-=†/gÃ(¥*1ÍgÎXuèóQÍÌ7Ã¡"Z.(Ãã€0K„•kb;¯∆)Ê˜Ï%ì˘8J¨—‡KfF5X4˘<oË1’	ö¡Ú»æÔ}S√¬õ∏‹+¶é|)/ËÁ¯≥6P≈q"<°N/´(VMÖ\ƒQ&D≥ê+{V·}°s÷.VﬂÊñm8co•vG©b˝≠]•ˆU.[ïWK*F÷v‚≈Ω™tP=¡£7æTˆf∏/Urîﬂ¯TØ≈ßJØ÷ÁÔS›«≥Ö·˚ıJ⁄¡~\™4å˙qËâ%èßY„~;5%Å@ï‰OäuT9ZL©† \˜Q{◊—´~Ωı!äÅA#P({Ä€#ÿi¥„¯òÀ“∆iÊ0“) ⁄¨c”DÆ*œ¢Ènhàø≈Ï[QRÈDµiÁ«
Cd»∫}sÏac⁄fãèÕ”≥ÓTQ*wC*çÈIN”Œ„„:'ã«√~Œ´£Ö9YLﬂ≤	˜˛éñ6Nc\Ï'pÆ¯;V¨n9Ω7ƒ¥ÙVø—#b˜Ü8™ÑyAåg∆∫·'ÕÆD∂å£5PQU––I≤H?√“ï¥≤⁄¶"´mƒóß\z¡O6V‘%ÈU…«3È›]-7ÿ2‘yÊEîFß±™‹◊bEõÒcY÷ÌÛ.ÊSï≤d⁄M>ñIùV¥«I®ßib]"÷z@…í¢≥BVP4|/eJÊ´ç◊éßﬂMì¥≥bGz∞€)›‰.†®ëii⁄RÆ6ˆ-Àu"%˚>ﬁÕ≤˙D‹À±ß^r˜ì»	5¡™PŸTKæj¸r[ÙC$;!Œõó"ËPª2Øñ¶C2[Ù<
ï~,√JEæ€§tˇ{h¸6ΩJâI≥√´ÅZ4„“LUu¶éµ	ªÏàıçÃX† hÀ?œ€•éÛ≠ËTè£18f•5pcx™6~h´≥h…5xû¿MŸÂÂr:e¥É6Ê∞ªÚkßñJjZ;∑º\[ójZˆBé.´r˝\æ=oøÜ≥Ví¥v‹›” 
6„æ+ÖYF∑Ÿg@m-F∑D09á 3ÑÀÖoú·^W>ìÔ‚3å6Äá8	i≥ìÓÿ9çù‘?◊jœt1s[KàôÛâóåï”∆…ôW…/gåï≥Ω$-]çZïWâªA^m¸∫Ò+ﬁŸ_≥”ì®≥ıÌ⁄wﬂ≠ı∑∂◊6z[´ØMÇ™óÿ˚°íaîüÂ‰y2˛Ç·Ú‡˚BdKG2fui_—DgÈ5Â4|$†æ∆A.p?x∫„≈ª”ZÂMG"àÜD≠¯O¨ñõ–ÏBÏ Ç¢’&π∞Uz°#¡–Bö⁄«èhÜJ+—ˆ∫ò=ÕñÂ„¿û-Á›{†Ç‹´hÊπ‘áÅÄÓ∂»∏Á®+ÅÕé%„e$h|w?≠4Mw8$@©Ö…öïÛeŸè™äk±VËŸùjÙxŒXÅ≥æ‡
¥¶Q≠∫◊„≥Tà¯û´?±Dõª√≈ß!F∂J;DˆuÀºMäÃIPçË#∏Üß£%2Ì±ãWÆ_KΩÕµ>ÕPmˇ|^ê˙2÷dhß<-ËŒÇVã—≈Ò ö2”k∑˘Yîaä¶∑ÌjâhUs9‰ZM
Ü%‰O_†@n~∑·]†‡CÓW†ÄyﬁÀ®©Ú+Ó2n>l∂6ﬁÁ/:çè˛8è≤ÿ˘t~2OOì*\Ã‰4EjCÿnà˘øY 1‚Çtœ@ãåŒ£t©PK⁄˙ù¬±5(ÿ‹
V|∑6ÑxBÈé¿√ËÙ]4¸∑tµ1nî>ßÿﬂ£ΩUùAΩ‚˛YÑ˛"a|áHÿ‰ ŒrxÓ*3î…ºGŸ@∞/º_Öœé·∞ÿ ∫ïs˝?›Ò2’≤cuÑk∫o#◊îÈƒíX}›krÒ≤(K∞ÚYDÄËŒ…lö'y“Îıö/6∆mfe“Ø¬ê≠‚…l<ΩàcnXÅmvªMÖ⁄S†É9≈Dn≤• ≈«˚È/I|Ó@˛û∆2§ÙçtÔ`T\¨∂®ì§ì ËtTDoﬂ‚“Äôj2û„ìV'WiÎ Pì(Ùü·´+PNSxÖ äKr;O∑5@-ôú$¸<∞cΩá;eåÙëù€º˙R3\∞ŒíÆñÖÛ˛…ê≠HóKÕt67$Ÿò˛CHMäN4.¨<·óNˇê… oSumxÊﬁ∆jlt!m*πû|ô<œ5F}Õc4Äjá:1 ÙC‰W'( Bscª’≈≈øxπ Mr/ÿªyØí·,@˛·N#KÕ9}®Ù´f-N‚Ü$P âî–Í…ıuÚ8Êx…Ô£w	åjFäQí˙ÅÍÈ¡4Ed;¸›nQ`∞ZÚ ƒöÚáßI^L≥MY¢Œß4·ŒH¨…"ç∑* B˛¸ge-/%√Ur˚ˆø»O£|«ma?	ë)ß¶µœÄÖ0ßa<ã≤´Ã¿œ–(¨µî•)Â¨h|W3òìË4âR◊q·ù ùac/Ë3òw"å°¸ßÕÌh⁄/¸◊08æ4k|L˝+˝ûpéÿ˜ÊiÚ«yL˚√dƒΩË"áïTŒKYuN\»h0ÿ!QzÒÍıZYõG#f±èÈ<HºƒüØãL`ÿí∞§àT¨ì¯T¯+œÔ`–ÿ\:Æ!SπÀOÕ° á&«*)ßS¯ˆjCêd√õŒã√x "â·r5á™Ω`Â⁄\3÷¬.[˘N}Â~~yº¢™Z‘Q¢6ñïÄ2YêÚå>ùÇÙ
∑°>Ñ´_≠lsÈÖ≈«@*ÒåUo	cmJÍ¸|ÇﬁN„JÉﬂ/ﬂÏÅA'—Ÿ¸v’%¸ﬂÍÔöQN|B8⁄ﬁiLˇÌ˚∫£Íó∫Ÿí∆äΩàäQÔÌx:5î”|¨´˝ÿ:ÈlÅ çÍ.˚œ™.ÑO≥*∑T∆õ:õÁ£Œ%ö_}†»íÅ!?Iãîπjπ◊î)^)üîªÁ,æ!>%EÅ“0câﬁ“¬§G—#tËHb]vs>Y√X»©„Åøìo6Ò>‹ìgÙuì»◊ÉøRŒç0 «Q>⁄æG≤Ç;?~‘1oVt‡&$.~GWG¯x…ƒÒË8]+^§î.KU¶Txj√ııü@A/w¶±Y]˝eiÈ˜@h@.NN”xX°_Î>≈ù∏∏HvYën¶PÍéºñeˇºã˝aé,˜’Î’:¡Ì-´ñŸ∆oﬂ∆T>àS–ú@¶Keﬁ/±D8ˇûlH˜·°Ú√¯¶{¿Ù≈Uû	¥¶ÊÌ(ßÉØ À=¡…¨0ÑÚ›!Êmñ#\ñ˙ú‰À'ë}K7äÎP\ ÃdΩ˘\<@CÄ¯ë€(E‰àŸ;}H‰gÇS£ç…Svw—`°ÎF)ÎE"ñh˝+2<…9≠ß\•çh[!ÓN2,∞€Eîl Q„yÜ6R-É¡4KÕ≤
33h%Yˇå˛£,]Y≤+kñKV˝É-vŸ0=°òX\4ùôï⁄aÈ®<</D—±h]xØk´G„–WQÃΩeh∏%ñR˙¨åMol’^–KùÂÉ¬pëûò√∂í´èË0vÙ£”KÕ‹Ä}5Á´ØæB}W+÷WBπ∫Ùê')Ω3·¨à0Cba@È"À$Ü=cA∞!€+âÆF£oH»zUø∞Ö'@∑Ù&0Sò¡≠›i‡˚{‰f«—ñil'¢Ô2¬%6:ÚﬂﬂêA,∞ÄÏ/Ïı]È<îâç“¡–\È˜„ﬁ5¬ê¡*Ì˛ÎÓv“.πq3¬íøÈ,ééCqL”)≠Ó‡'.ïpPe<ü“Æ’ÀÁ'93AÅqO+¿:“ ö©#’G‚ ,d—¥ãïU_!üq«Œ…ÃL’C¸ÙàÈÑ<b!à∆J:F¡[%¸G˘E: ˆBG•Vö¬>¢ı 5‚…¨∞≈TØºúQCos‹;÷ÙR€>ØXﬁ4V\bV6>r§ÒËA—õ”‰…¬öL‚!ù/{ΩáøRÌ—rÉy&û≈Ÿ˚d˜Êtˆ¶É9z"…∑hÉ……∑ÍYw•Í÷+∏#Ã»ûëkõ`•'<«ÇaÒ{É’∫n¯èTq>KH¨˜∆$C«{hÓ†F≈xÕ4ig;§a©ñõ÷Z˝—±nrhâ=ÁÊ!Õﬂ>,Ì|mØ®vTπÅbûùÒÍ√E9hÄ√xÃIîÕìØL5ÀËÒIà*c≥§8Ímsuh–ıç6	 cÆs∂h¶ï–Ì¿a4}€Q2ÜÕióS“+!l=ÖÂ ∂4Õ,π∂ ∫‹z¥√ïkÙ	ˇ¥E“œo˝Æ´¬≥ÜΩv _¨Ô%Y|VÃ3ç£&ºK˘´Ñ êπï?2ÌefúÛ3–\Ï‚ñ∑≈◊Yk˙ïµTD›ü™ë/Ï &t˛C2éüÅ≈÷ N‡ë⁄h∏∏¸ÚctBµ√u—≈ößüDË:§‚fÄÿ•ª:‹$0”—s¨*æÆëÈygk@›ŸI_#G@	sÚ$=ÂˇÚ4œË˘Io5DÑ£íÚ‚¬]Å‚_π≤éáB–u˛Ä—¬9çmÄ^.iÙœé‘˜ï≠/ÀüpbB?™Â<Œë„éÛJµ∞ã
“H{Iæão¡`1Ä÷6∂+èÅ†zåÉï‹D«Éµœ†ÂòﬂF0$Î†M•s∞}f¬∑4…ﬂ∂¿ˇïf˚ñµ’©.*fø)IµFƒ&pnﬂE√Îõwı’õè(y£kC†˚Jpr†@Ó+}õåmÎ€Ü§‘kÃ—ÓCì›ó,ô[d◊ûÈ∑+üWΩ¡Wh:xÆQ D3Z°˝O6D,l^^œa-]ÍoåEÚÆ˚¨DoÊˇÅﬂ£°º4OÓ”àﬂ|$!∏nM!ºÃQ\Éø¡oJπ{çÃ≥rÉÙt≠¬È¡Ú7wÊ-.ÅÛµê¡´Â´ª˘M©'‹)œÍ7nJ5L˙7+ﬁiÁª∞åß£^Ú{ÒF‚˚ﬂqd ^ƒv#Î]õ¨ßª-ùΩ‰}í'◊'ÒÖâyW˝åçÆ_¥¯M!¶iV€:¸6’‘«∂ø≤ú%ÒØ<ı”(K® 2[«:ƒ7û<c…#c…bÍcO≈æBd9∏ây<,¯a<çä™≥U][≥9øÉ˝ïŸ^KnXÙÁÒ‰dû†U†;NË‚√ˇ;÷ﬁ∞˙⁄ÏπˆåÁZ´ -JπkàíßlD˘LΩ˚Œg6öÙ§∫}v≤∏C˛¨ÆÀépn]{≈uŸQˆ¿˛ÓoVp>Ñç)
^è∂⁄÷⁄Ôkø]ï•≈¢∂]L/eG‰y∑9ñÌ€y2ôEÈçRÛ	îöΩÈxeG…©ÖÙF∑π6›ÊŸ4}õú¬Ö»&ŸÚã≤N•vYÆœ™Pîãê√h=eÚjUJÑHºR»*ht
‰Ô˘[˝ÜòŒj{sÒ9ﬂËL:Kf`Ò¶»d⁄≥U]ÚDÕbX‹Ç¶°@∏èHkøD„y¨àûÕ<R[!Ìt?Ø∫}1F„ügq⁄¡ÿÛ*»≈≥	ÃÓ‚¨¢J,±Ó¨‚˙ôÖï]¥eüÀ(k˛	)IZ◊Êäv≤äEb!©<ûCraß;˛|ÌÙ<ê¢;ôì)õ!i≈;Ò…ZR≈â›g(lÕJZø)‚ÒŒ-ÖÎÃF”46·Å{‘/Û‚˙⁄ ¿òEÆOHÛ∫~wE™. ¨9ãXÎ(éÅG¸   ˇˇÏ]Îr€Hv˛øO—´öL—≥&u≥4≤VG∂g∆._#y2ªqπjöD¬ -sX™ [§*Rï7»+‰QÚyÑú”› ∫ÅæÅ¢˜Vã∫ê†/ßOüÎwp*≤`˘Á‰ÃP¶=]u¶Ì”é’Œã”››:ZÑªÌ∏ô—≤†YˆW±Bæ¥RuéÕ◊AãTŒ◊„gú¢ã,3-àÊÛµ5ÎÀ,Zy⁄°]b»?à£
3ZYâﬁ“Ù"VÂ*ã($·î∆Q6úÇ aπ|îk/‚QÍ$´)õêQº”t/2 Å…ãø™-–Wﬂn¥eÖíÕØ`ÜôRÁê‚ªﬂ›≠fÉ<sÑ0eê<(.¯‘hmU?4äÑÎ˜∫≠°eL«p:êùg4àrÉ—˜jßZh%éd£ø-ö`πµ™Ù(ã≈”7d“bUÚ$JÇhö≤"˙÷„)Ø~!È€iMºˆ)‡2ö}t8>∂—?Œ£˜à«»Î‚ˆqãÇ!€ı≥%àÅSèQ+àQÓë_Üì0 JèqÁi·3n÷Ã‹∏Õó‹'ë±Üô±T⁄éúgsçAÇji≈3?∑1⁄8«òomÃ0g˚zø«äÉ·¥Kı}•⁄;Ïk6ÂfY{Å¯>•n˘ÎÂÙ
∞Á—o W·Ë$€€B3Ëú	fÊ/ –æ&?D	?P/”∆I˛ıñeºÑeò”ñìŸMø&/h16H◊⁄™ﬂ~[á‚ÅMK“◊g¿”@òîaô«9πŒ”Ö*ﬂ¶√2§17t4RR#∫àçn˝∏ªi¢Í⁄ºå†2x±˘~ÊE§´aQÎ[´^·e…œ+K2E◊ ÄF´≤°á˙Jù>	î◊LfÄ ¿Iâî¨XÒhè
 k≥¿sÀmË/®Z∞è˛‘)ŒCFöYîÃˇú§…˙‚§KÜÙhfR¬l£N˛5“ßI,„µd—¸Í„“PüØ7ÖˆUp*<Œø≈≥ç´
‰è 9c$·rJãπ©rëˇ—∂÷¢Ñ¢˝bœPa”¿3épª.“0 ¢´™q¯3ê[≤À∫ôâîG[“ÄrT÷9Y·úıúÅúù¡∑Îbå√‘`∏çä,é ‹tÔ˝ﬁá€QnbíﬂEG˚÷µo-"«pÂˇY
)[ºò2"ûb)§|◊:≈¬Ø%Ã~ú8*[Ã°èçØ/Ï„≤U˚Ë‚,z’˜0nHÜ17Œà√ÛíÆ“eÈÆË!ö€›'ƒZ¨F¥ÿZ…~’$hØ'À{o.a#Z|)HT.ôf,pS\¡ø WXø8‚éJ≈˝™ÒˆØæãWTæw¡æ5ﬂs‹vÁ:ºxq#Qçœ®⁄o∑’V∂WWñ»»^!/{ôeˆ0;hù©hDunfX!õﬁ\!åòÛ§:¢S¯’3®øÓã¥û`8Væ∏¿ä…9πâPrF‚c{˜¯ıÀEFÁtF.êIVòâ0asπ¶3ö-íÖ	J' ú¥ùvåÔë u?!Œ|•ÚƒGø∏c[≠4¸¬®e®.Ä~ïpR˘¥´fS|Óéﬂ-[`ªQÄÜdTÆÿäG›Øj¸¬ä=&/G |„ﬁçc˜ú?¢ô;øÿCrõkw∑J¨¡*F|≤BQ,—0¬ˇÚ∞»`!Å’&aQx=∂Ÿ‹ç^÷—Öo∑›€zâ}"Eœ`"˝≠ÄtÕuK‡|ûÃ» Ãsøm¿…1o‡ñ4Ï|èø`∂`'˘U4'Üâq
§ÄèÔ5∆È÷E«6¯òGû„s∂qµ∞ÑœÒKâ≤H∆¬|DL„ÒØ-:Réµ0¿Q´à•Îƒ.£2Ü˛<cSWìã˝.óLwˆ∑ØhkÁ·ó¡˙√oﬂ,éUWÓæW†⁄VûÊi«^B î\0"&óÀ$A⁄ÆÕ.∫åªç‰ã§äçe	]È 0Á›„=≈˜
Ä±∆È∂—–¯ç@ªÖŸY;Ñ›Ë1⁄çc£aŒd’i	v≈‡å3v#G¡˘ÁÇC¡á¸Û>lu@≤^:°∂i˚3‚'s∏mW∏;|1Yß†23Dn¶⁄ÒèPà`_ˇ”Dåx≥° º¶Àòá=üÔl`ÕH3f◊¸$Äy2tá¡w√!y≈—¨Ω‹d8<€ÂwôªûÜB}™∂Ú¿¶?©5é»o7,md}ÖTá»° à)·Ê*4TâŸ·ˇ∏Ur!`‡ØZ-∑kèÓ	5Ò\~7ü.„˛Òç∑˜’eD¡*ˆ“Ôc,{)DR¨Êˆ}Ã¬ÊØû√∂ºByˆÓ’À+Òvá1´÷üú◊oƒùÙ∂õY˝ƒ˙^óÙ%‰¢´(¶»Ï2∂˘èÔ ÷8√ù-„•S‰Ö©ÏÉû£3˛®VKÇ¶æñHªlÎ;/‘{u/-˜Ä@ˇ2ùF>M¯à
ñD|òá4X5µŒ‡h/“EH“rÜŒåvÂ3”P£‚Ç?È¢zPçÆ©KÊ|Á5.⁄P‘˜◊a∞ûıSﬂ—´„≈H	È*†◊%ÕÅWD”(ã¬Oc:õ7ZJîD‰#÷.5ﬁA≥å<î±ﬁÛ¢cÀón’ﬁ¢“øœó>x≠{≥tú‘»≠¨iû√äM˙mB«å}I#@_Âﬂ•=[ø¸R*{uc »dgÁ˜»•.Cx££ˇEá6/˘ı:&2‡î|ÀZ3â˚i¸-M_hCïÜœ>ıSÓ€J}=éjêıÄzΩ˘8ÚKs”Dı?ÏfπùÏiˆ7
˙ﬂÜZoñøﬁ˝Ù„≈’mïºÏz∏Eì÷	 €íÜUﬂª-!”◊â≈b=8j|DÀÖÀoN»7‰]–πÏ;ØÖ(<ÿ∏'F[†5êîñx~È}·µ≤ßAB€Æı)⁄(§Çı¢é6Ü˛õäπånË
Ê˝b\Ñ∞á»;ßùP}ƒPØB^º;áDºb◊Ë|È∑µï\K`èà∞D—YC[<√O‰@æ•êwö¨?D⁄SX5ïPæpΩHLë"Dó!aË∆®ÄûÜÉ·°IªÂ·'‹⁄FÂükÂ]›'QŸ+*~ÇC"ˇ#‰Pı§´ëR»õ1∫ŒßM	u,>N•ˇÔë3r“‘á˚V4)Mç·ˆeçÇ¡ãô∞∂(6d…€›#¶uz∏ºõ9uÚ…âªM8˚‰†c~W¨ÛÕYÂÕ≈ù‡L$¯r.ÔmÑÒhû≥˛•âÂÈæÛ’Z°kiéÎ*ØuÜâò†⁄û‹*G≥‚Í4tª hÚ‰a7πÇy™	Òxø‘#B93jwFT2"UÊMsºyçòyﬁ`I·p†2Ç:zø¥^Æ4fÎÁ:ıuÕ¬FûCˇ`îqjLmÍ^¸ñî√3ﬂª0Ì3∏Øò•yÈyó¨∫,ŒßÍrY±V¶¯Ó?Iú^N≤y}9≤∂∫ƒl≥ÉaM#X$≤àí%"i’˘.â-NUæ~~˛ÿg^¥G/pŒ~•Nô·@÷N`57û„æg?
¯Âƒ¶‚p>Mt»¨¶∂6_¯∞Hñsvœáó&Dnt‰í€ı
ì√À¥#@©}´∫,˘é<Ù¢o„â˜≠O‹^ßwøsSëõQŸDÔIÅ)}'FÛÆ≈ïŸ\ßÿ>EÓg:/óŒÓé‰c√QNagÙ{∞_˙cµ‹¬ı≠¨8”w±ò±Bó:ñŒ2eıå€◊◊q˘{êıˇÀúÙ‘ägú;⁄ﬁ¿ú†”™Óû‘1ô¿tó‰iáÃÍü˚íï,ÜùÎ•ÍC◊óo?A“≤·IÕêﬁ?`¶’7_1Ø4IΩ|ˇ¿V
^•Äí}SZ–ìK—ØÉîöÍ£b›∫öa®ÊÄ©“fÈ›Üf˛—òï$∆Q5“8å¶©ÏâkÑº¢	˝»∞’/ÊÀ¶8â—‹g Ps-Yœ<BKü“d
kÛ/ )ˆ5Iös$ç_òmEŸÏ~À“è+l5˘y”œ°	CÎUÚ.ú—µ‚`^ÓE∏X"ÿùaA‚î{ÛpNGxñÈ9e.ÏÜ∫\ñ4cV]ÜπJñRèIRpúôR˘Ë2à ˚ÏaI#†xîQ”„¬8"£9ÂÂ+bDæ◊YΩÿöËÃxøç
Œ÷í©Ÿb◊EáaVè‰Å˛X±ã‡ÙfHóeÍÊuÕˆf$uñ¿±ﬁÖ¬Rk”-ôu¢||cœÒ¬È	vÉ·uØ@†/$‘£!‚µD¿V÷aÖΩ1Z>µgF-¨√j±øÛÙ∆a⁄z¿ç€o~¨tO¥ÙæxÈ>¶ûoÇkîp™Ú–Ü≈YŸÒ•w≤gcıƒãÚî…Ê£$ΩXëµÒr®”_,ïiÇﬁ˘äXÔÿ ó] ≥WCŒŒ·◊´Å_wåÿ1†’Ω√¶Ó™ÀC/≥HVl’}«ªî•@UsF‘‘.|}hM	«‚NÈ¯ª[d∆2Ã“÷G*Ïùû÷îKÆi…{EÙùÒª:˚E≠z0}Î0	πÕ≈V?˙§’W'ÅW‘˚ª˙ˇHÔÀçQÏ≥Gﬁ˜9÷-Ÿ&s/2zUDWHÛ›÷§ÒC‹1≥˙1pïx”7
’=bÕGÍgØÈß1m;†˘·u5…√09_Ïw˚ΩQÒ†aöHˇ€ΩYñRC¯Ø›2M^ñ|æÆòsª&.ÁkˆK˝Në≤Œv)Æ‹HôÑ¶>#Åù,O·§	wNÎ<H∞…î®BY≠òÜÁàÚÊ–†NÌPbX•x©Sr¢áwÿÀ}π˜Í˚Ë`>	⁄¯\z≠‹M)öTôºGj+)∏úáﬂ}L£d ÏzGµ“ú y%hrVNhº"oÆØAé€ëÇq5éÁ≥f—îóD	lCüØ◊$ÕË$*WßdØÕÃi-ÈHçˆ€ç$N≥àí·l»iõd„·°Çÿ∫{®∞⁄÷FöÅÜ
HIä9nÁ\«ãëáØ˛õÃW§L≥·˘T~R–Îpˇw‰sOõêŒLe‰Ê->ﬁ»H≥tÍëwZp—]F*«¡Ÿ¬⁄4áõ÷¨d~ ”‰ex]öA—w*LüufÊæ&3“ŸÏ¿ôTôëö A/$æ}…]Ègª≥OÎ v†LΩD‰¢íU°y`∂hI,MìŒi°k’í¸è*æ≈⁄ßU'ÌòTëN«Œ˝—1s
3,ZfMÊÀfÎ¢5
©ï’˝πé°Ò,
åNi¢ùt∞ØªﬂÄ$0ôOŸK…”píÊ¸9∫d¿vóÈ‰Á%ä@å ‹>¸ˆñŸ‡Aàå„ê5BL:d{.£»§+Œàêù∏+úÔØçb{¿àY÷G b+^∆ÍdÆ3¸—Ã<sü(%#ƒå?®˛P”P¶kO¸‚3∑6Uù4ŸΩ£Ö©iëOŒ-ZÚqZÕŸëVAàGp‹ÒèGì….å‡ºË|_ãäóø!m∆•cñe4¡qõJ„Ú|Gúˇ˙6ZÎìﬁ]ÇÉ¬ÏîJíg¿¿»?GE4éb†  d‘ùÑ0+og),Éæú§¸€´Æäq' +∆ΩÒ›∞ø{@8â3B˙Ã>PÇ¥%≠-˚<<™2em¡JzZ_«ÎF‚ÿ.Á#™ç”lNÎÏ‹Õﬁ`k/π~ëá·fò-Aì⁄±¿Ÿ†HáÓ ˘VÈ ·ÿro’Pî1z;≠ÆÃÜƒÃ›≥V.Ú…6πY	??íÙ&ßôœ9»ØµY¯∂Âßáb≠\dVò≥Dß¿wu>f≤™‡{u2CGêaÀû1^˝Ê√s6ã˛Ä?tH_&3I˚Ú@›nNßAKZlìøb7ZâÜ}Bqoπcœ",¬dX≤rï°hdº
gÁGñëãO&aåÊoÓ~cj¬9[∑⁄“zÖcA?GpTM√ı”∞x4zøgI+CE€˘TµÕπ6tŒ‚g∞∏À%˚``5“ÒõFi§`»–9Ò«ä√íåaC?‡ÒUp≥x^À3Ó¨ç›≤ËÉÕ”z˜LL“EØ*û/<∫Í3‹~`¯[j¥7˙÷’»ïÕ◊Ë•eÔe≥Sœ2"nˆı≤˙:"…yŒˆ6NQ‘Àª#àC—#¯≤£J(Ï=&¬ùˆX#WÓ—3˜îı3æã;0≤0]ñÉ⁄ÿ⁄<Ç€ZÔì^èÿ:õ›cÔ‚Øã˝È?]æ‰‹bkµHR+;ôåj•Sù©t≈}ìÌ*åx≠£kS‡-fØ∫’∑⁄#ﬁzƒ`Aô˛Äê∆¸¬3◊T' †W’#≤c	®kŒq¬ …â{ı1¬Íg’Á˛˙ÆUﬁÜ[ÀïP!KM6fy@?£~p"DøDâê=¢$±°èdX$qñ∆ﬁÛùW¥XŒ—3C†‰eà¿˘ô˘ﬁ4y/s82âz=@™ˇFÌH÷<ô˘’+Õ|‹ﬂvZwÊÔ|–ˆsrIÃ¬Èö¥∏”‰E∏zöﬁ$ﬁ≤üﬂp4W…È{&Ò∫fz´t∑M ÎG{>ò}ΩËo
‹"∫‰˚∑Ω)ªöthî´,t—&ÔÎø+º≠†[>@®:vwê}Íy[m™ïæ·⁄ôõEÇπõ-¶≤^_Sä–≠ößlΩº
Ãê«ÈrLg£ë)5~˚÷kúúY„ˆ.2XKHm.Í¨—‹°4+˜Ÿ¨¿†& Û†e-HÛ[çáúv®JûaÚòu1ﬁ…Yàl≠ùAE3£‡{∂;;Ùe9ôR£Î†*¬ÏÚT›KD^ÌÅÍS›©π°IQ”z;åÔ˜F·‚É©DÉºjmDK√AãyÉﬂì]Ú"]DÕ#c}k5P°ç≤iúqx≈’ÜB.∞]T¿h ‘¢B`…¬6U∆‰%ÕÄ◊—DKpÓ¶L√òN#P@º}$œDÒ—’ßäZâA°U=EÓ´(≥mh˙Õ_¸¯¸‚ı©nî¶ö>€	Éj˙ón"˛5qÉÁ	ÀO("¬…M{Ù[›xK"µù‰gÍm%ëÀg)°2uøq‘.„√$øJ‘àÚkö.‡7ûQ¡2g¿î÷‚„võçπDùÂnØhÛ3î,ÕŒÛœ√rãÏ˝W–®Ã§*€ˆ‚Î>È~öyqÊ˛˙)AXÒ~›©∆∂˝u∫Hs[ky‡éÙjáÂé_n˚ø*+û1Œ¥∫$Sn<ª!è_&sﬁœ‘ﬂò«Øn®Ç¥j∏bo∆∫7õªfO±=ÅWß≥S≤w≤p¯‡Ë¯€ìáÆ˚71”k#cMs´Xoa∞Åø⁄Ê∂©˚@ÒoÀj√/ˆ˙S—9_òé‹á4À˙›Á[ı†ß˘á_õÅÍ;+SêÁÑòmFﬁè@€íokœ±¯`i¯¥ë’Z‡5>©2Ï—w±L›ÌÕ.ùΩ¡]Œ—MäQUr@∏q`HU«‰Û“U¬Õ£Lê≈>VO≤/˛óÑ®Ÿ◊R&öúIÀfEµçz ^ˆs›nHÛ1•ıúŒ>5ó∂{l˜Ë}ÙÁˇ>ºø7ﬂﬂåÁo—ÙÔ¡yﬂo¿ÃL›™«5¯≠&»ÀπÅ%PËuã†˙K≤Ämbx‰ó}C_Ò¨}&˚ﬂi_oZ_ÊœkìzË0á^&ix¿ù“&ÕøgﬂD‚∑4ˇñ±Z°ñ˜{£á'⁄∂VKÂTì™–Àv–K˚∑Í˛ù\Õø9M∂rC˝‘›Œ≥ûh}MH4=~ÎeÇ\—…ÑºÄ”πè¡¿Uã¥€˜ÕãæÆı˚yhµÙÔ†ê[∫àŸNÂûLn|aâ»ÑJ
ª2J–åπL"õ-≈ﬁè‘⁄¨Z$#o¡ªTˆ»)RØ0(˚FhªÅÏhß€?∂¥ÅÁæ∆^ñÔ	d’óqNl;8⁄’ìYº Éè⁄◊NÀC…¶I_îó>ZC‹ê]R˘»,4€/Î£f¶Ìéª∏©¬K´‚?œd®Ú7Q0*ñcS>ÿªON¨e{f¨Ë¯Ïâ>q”	Ôz@ß‰eîÃ[~6ÃÆ‹·Í†i?YïÉù‹π˜~ÔÉÛ<ŸrpÜ	’~sóûí¶I¯îìTLôù\~¨”¿<úÉ≠|Mû&É	õU‰X∂V∑Ræ‚eŒ*%˘pˇ~ï¯K>#h’A[rk¸_/™Õw6%vb÷åﬁYŸ%‘:Ã?—J8˝m∏ÑòmDÕë+0Ø¶ñ@¥Ù÷÷4èÇ?–
TÄ∆ä'Å>–€úÈmΩ2ﬁZf”$≈9R?“èë≠ÚÉe∏Üû)5ñ7_fv®‰µÕr≠‰q¿2VóËQ≥V0¬îÑÏ∫
KT%EÅ7´ò8(∏9•™˛¶ºòÿE˜º{∑¥ó±A‰¨Ç8[
ˆÖN4$lÊV‘…/Hö"Ò±,7 LßX÷6XÔWG•T◊~≤ì£¶∞o!óM†4	Lå∆rB⁄¿vˇbIé,u§÷Íeh&ä∞ŒõÅ∞æ{‰É{[G‰ÍôæFo“HÎWı™8¡V∂¡ê,f∞eÁC9ùa¸åK{Íl˙~ø‚j¿∞ZàÎlä	UÑCÒ˙àA4]&à¥<
HÊyöDÖÇÉHÂœcå6"oi¡JΩìD	Üä9ù“ú,∞z£ˆÅA4[éó…4‚µ≠ö£‰a-ıöR3vÛÀtö.À*}9Jè‚N	Ç≥¡Ô¢s]ÒáøJøÅy2°ùvc≤’P©÷ﬁ≠œÆB#◊“ÁA3‹Çc
Ç”!
Nz4e≥©¡zµ_A9ÕB¬ÏΩY:/B†RåŒÎ®9WÙF˜ø#ï’@Y¢"vQ¶√ÕÚOFlCÄ’bE:ª1n<£1] ˜·±¸Aƒ†å1?.Èlz˝Ü¨∑c5yàê”û@5∞ıÅVã:*©∂iÖ Yûá‰Y∫[D÷%Ω.ÏŸ-[ë*·K\¡4‰´ßa	“&„"X’Wr…0,π¿ì7¶´¢k…ü–ë0N´~/5©Jh∫
&c©ÜvΩV˛ÓÖ≤Ùexœ˘Ö7¿n*ú÷∑t∑LÚ@§ØÑy,Wf€¢ºÚvUòWz	˝g‚{c7PªMBì˙båÿîahÑˇ÷k5ÍÅ4*Ì˜\Uêªà<´axıSi¨©æ	{okfﬁ•%£µjí~«ñª∫ü’‰ ﬂ(˝d÷‚ÆÅLá,ézÓ=º¸É˚<»wµ±ã_åa;yöôMC	b÷c¸i˛Ó¯y–˙”¬¸±ñ≠Ü^¿_{jqÆ¡õj8ç¬1:ŒÖ#¸ê® ”à§3d¯À;Wmæ2@dówT-“ÊÓ‡17˝•à?ÿP˙¨≤ÅÚ—Ü(@ïå≈Ó RUa«ö<¬´8 ∏ÂÊÕ£\Q˜‘”§=™iO®â; LÙ)Ï÷òÍL≤≥Úö´∆ZUMM{˚mãÑ∫ITﬁˆ
OCgéû?=%o/˛8\+S3$ÊÂ^U‘Û∏”œLs;6vïq‚ÿ¡Z3‰	¢åûò¡Aù¯ÖÆ,_Uı·‹<&ÎáÅ4÷!2ôoÕém^ÃC£}h≠ú˝<d4∆≠¬˘Êq˝ﬂ˛«øìÀ‰„ı‡:;‘‡âaÅ⁄J√h±cUÌ˛Qì@¯”4xhãe<Âô}ﬁ?ˇrUÜ>¨¥€cπºØ˚FO`«w√LÄ3ˆS)v÷rç¯¡ﬂô¨}˚Ê	<Q&P3x„}6™?%ˇÛﬂÎW¥úçXß∑¶8ÈdÖ§≥wÔva∞ÙôLÑò˙ÏKUÛbµ0ˇ…ËRÿ≈“$5&∏¡f{£ÕØÈœLzxÖ˚î≈¥∫¸j◊z44ÎTÄ‘7ºµï∫¸ﬂ˚/Ûó›öñÜû<jj Z‡e©~iˆÃl6ÉxyŒ"^û3âó∂‹^p˜px:‘{øÔàj‹5k1|‡Âºƒ≥TèÒï ¨_G®ŸΩ¢†Ÿ∑Õú^“∆`´ ¥∑]⁄≠òJCDéS©›«&`Ë.‹EÚ)ÿ c¢∏WV?ÿüË:÷yÀ˜µ°û8óœs˜k∫¢§p,ZÊﬁgºı%U	^ui“˝nfµ÷0Ãµ,3UèÎizæ&Í˘Î-)4pù”ÖÆF†úùÔ •˝Énmf!OÊÔŸc≥aüÔhW∑(W1≥…—îÌê©ù4+F”4ù∆·hí.ÿˇè˛ı¸+F±0ÿ€˚‚œdz˚ıØÁ˚'_ßÀ2[ñÁ·b⁄b´4ÜÕ˜–.7QwZ|w∂ÀgÈ«W˛·(Œùlk»Ò‘0/,5ﬂ*øÙWä∂ñ∏ØØc®U^èÃÇè^å|ë.≤4Åé†mA3Qù”∆kkzu•™VÑÆƒ(·∆TSØ¥√bñí∑È<ùÎÏ%|zŸ◊ﬁ-d€µ˝∏ÃòÏÉFPˇh}◊æƒ{©Vz|´m-hÒ¿»ñ9¨;Â€è:q…¢¿»ˆÉ[É;È–≠fP|iCÆí≠Î›Ô,°PÎÅÀúﬁ#0ËÀíRŸ ÷˚U'÷Œﬂöwóv˛∏‚)Ùå;Ómî-^li÷Ö/∞⁄3«ÓƒÏkc◊F<0{6≠Å⁄™ƒ£)3◊†¨Ùâhœ‚ªeπÃ»eîL∫ÜqßãUÁˇñö0∑`◊˜*≈nËºÆQ;∏CÁuÌÎfÂÂSWf⁄Ó0ƒÊöÏ∑¡¶óªå≠¸5ÇÙqöâˆ≠*Y·Á®Ù~≤’À∆uLtr˜å\º‰e3%Ö» ¡ïêw‰ÁÉª¡∏È˛ê¢töòŸºà^ô™éåsm·€P‚a:Ã;å¶kh”˘åz ÂuxÂã4πé8Dè√iÌL7MU≠ªëmeâ√”GGŒ†∂ãåŒÈåG≤≠(t®ÎqœypP ‚!Ã&-<‚çf4_@1u„Ò<mÅ%®XIo,©=jHÁœ1”à÷hràgj[»ÚÂ˛›à2=$ÇÏSZπÈª°˚◊>ÿ€k…nyõ˘ﬂÖÂw1ŒZ˚‹Ÿë,s⁄MEñ°¯=›˙Äv)j°∆ım•2yﬁ-L^Ωn∑õ’—^°çP=ÌŸä„;÷∏·µ‹cãÁ∫rw Â*çÜ§Õác*`ˆ‡¨√£1Ç©D0Ù‚TÕªi>◊äõk‡≈ﬁ:h≤—VÀ(ﬂΩ‚àÈ™êÃ≥‚æó–©Àêi¬ÓiæGıHˇÌEY¬oöLB)¥¨”ÍIrt4àÍõº¢	ù⁄õ\U˝—Ê≠∆ñº%çNÛ9<[€ËyÚ	Ë0ÕW˙Øﬂ—bÆˇ¶*Ï˛61 MﬂËüñi…D$˝◊ó!–J`ÍZ'XØª*£i-˘k ‰Îh¬ﬁMûù÷,˙ô¸5ˇ∂ﬁQÅ<Î|]Ã“πôö»üØ}+‰ò¿'d]£˝»ŒiEÛ˘EÅ’xjVß¢2NáÈvã·pûåØ¬¸S4	GºÊ{µXÉ•≥;˜It9{øÆ∂ΩäÂb+4”*+Û+"C@bÉ];WfCÓ∞,âÆ∞x33∑ÍƒÜ4øàcÛi‘ù,§5‡˙{;IØ’ÖÏœ†^¬ö`Q_Õa◊ûÎ ãg[Ê∫~VÁê˚çÈøç¶xÇ”£Œsrõ˙í∏â,é∫ï$∆YT¿9*ÿ≠^'C˚˜±ã;Æ53WÕøC]12}r7uä…âTãORﬁä8bYÒMÏﬂÉF°;lQ∂]ˇœaûﬁ˘n]‚Ãæ
ãŒÉ[EPVm¡;Íœ`ÅoÛˇ   ˇˇ ŸÊ,®