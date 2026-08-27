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
        returnxúÏΩÎr€H≤0¯û¢ö„È%èEä§$[ñ-;®ãm∂Æ+RgNá>m$!-ê‡†eç>FÏ+Ïlƒ∆>Ÿ>¡>¬f÷®*T†.vüÈÊLÀ$P˜  {frˇ7í|¶Œƒ]ë~{”-rÎ∫7gÓ0GëÙÜê∆ïÁ«nX≠Ü5≤˝ûÑç¯nÊíÌÌmRÈWjjŸ–ÕánµÍ¨ê-Óêód–p&¡|ØêfMÓ5ò«Íˆ‰º_™ﬂ™ËòMºÈG◊%ˇÛ¬@jÍho˘◊Eç}[◊è‹d’VW…ØÆ˙w[‰:Ê32∏#ì`è˘˚–çÁ·îù˜?˜~ÎÓ5&Œ¨Z•ÎL<:¢t˝á¡4äYm>s≤MÆº©3zéœiÛówè’91¨ô∫∑dæV√>©Ωï
ÚAUïµ¬Rçk7>¬˛´5∫§˘˘gc°èsﬂ«yÛrëÎª√ÿ·#ΩJï¯4~á2lß:áá\Ó6Ë ›È–ÌéË+•∞ºô“p+íæìÅπ›)L∫˘6Û¸d´/º+Rıh_0TuË¯¥›lø¬ña◊»=n˙/Û©ÀäF±∆ﬁÙöWWëÀ–öåkß”€ˇ≠{º{r¥ˇV{œ∆GÏuœˆw˚øÌˇ◊È˛qoÄì>ÌÏuè˚∏ü<Ë¡Î˛o;ø˛v∫÷;9ÓJ+ìÆﬂc˝to—øçh>à‚F]mÆêµö~Ê˘¿_*¿¯=OøXôáç‡˚ ¯ªX!˙]!±7qØBzƒt—Cµ¢ €ä
aó®Ÿ;”ëÔvF£~ËL#g{Çë›Má§
õxÊ¬√∆« úÏuß±Ñ
‹∆,tÒŸû{ÂÃ˝∏ áã`ˇ”T §‡ài√D”g#7Üﬁ˚™q·Áå ãzéÔÑwàîDù!‡ÉÎ û·Å—6‚‡0∏u√]ÿÃj≠·Má˛:©VÆùﬂΩ
◊ﬂƒau|?Äö–{‘∫”»Ò`úÈM'}ìl∫√6±ÅÔu@˜…§ﬁ√æ•s64€›Èu<¶∞“¨%Gƒ<Äã{¬˙ÿJ'H´;⁄Åß∏Äï 
a=oë„˘d £”ñπFófË?1,òËß>úáÄc@á^D;n4:l]
 ‰ˇ@G§ä-x«¡?ÔL”‡Ü˜/_÷2áV@Ë Vº.%ThoœÖ’áS‚Ä≤+ÔA‰˛Ôs>f≈¡§;R–0/
sÁ¯†¢b‚d©T¸!’¥)’°ƒW©xÂ∑}˘Ë'xëb =Jh,•ìí˝ŒaÁ¯SÁ¯∑≥˝Ó—Œ˘Yo_√ÈYØ"-[∑‡˝H>î8F3ﬂã´ïzE"Xú0Öcï.⁄ó˙À…$yŸ ººªK^6/%‹›ŒˆC@¨‡ƒÄe†“ó˜£—‚≈˝dÓÓ_‘Ì¸‰N›˘Ö˘‘É=,‹…©˚-áÜ≥ õ¡«¢ÖJ"£z¿W¿Äÿ≤.Í04y¥ã˙óZMÕó§ı÷‘s/"Mzl˙¸Y≠1sF=Ï¢∫∂B*MyÂo«ûÔí™a¥Q0q≥c•`ë7∆˜ÈH0`ï¿≤W/_æÕ>\v‰mg·èwìQ.1F˝ 'HûPP%æ3p}<R†û÷+-“õ_±sêÉKﬂì˘@æêjÔÙ∞€'/Ó=‹√≈Íã{{•EÌŸ¸©1NUÁ∂t⁄%"≈êo≠K:ÚÁ≥ô 6–π4ÙÃ—≈0lëìâø˚®"ZÿoTy=À€ãôèCfX§!mÈcóÀ	‘#È¡˙—∂≤ÿJnÊS«ˇ¯#7î
´/8ií*
"E7D0_Ú{Œ˛l∆7¢>sÓ&pÑé‹x∞cRÈüué{˜œp‰ ßR0ß¶‹ïƒıÀ`ú¿∑å±}oz„éˆ‹°N*§˚Âév@ õl5tô1¿?ìŸá”‡ñÇá∑Ç«!ÚΩÎqLq˛ùƒ"~hÍ´Ç±óP∂¯Y‹RN¶‹sDódœô:“”á¶π‹ú"Bˆ&é¬l$OMU8'"∂ïÒ*ZëSo;”kïÉ·çm~6îˇl)πSXôc*[X;å¥8?ø(|∂Ç¯;Çº…∑€R*›qFUEŒ*∑ƒéˇ	ÿ–∞”	2 õ8”ªZ˙z‘!;≠˙÷÷˙,àÉÈµ3=p¢2”¶.‘2Ü~¥FåB@p˜äƒcX TPpøÍz±ÇtGÿZ¢ƒ§ª∑B@˝#éSVO^pu”Y®ár[Ÿ$„@⁄vñwnÏ}–ÉCÊ›∆0t·hÓ√9¢òjEg{Å√N˚ñyû,YüÕ£qıûxàW∞∑ƒ⁄“Ú/p4l/´ÿ–¸‡∫k˘’ãÔd%IÂc˜∏sºªØ¿e˜lø”Wü}9‰õ!îV-ÉÓO›âÕoú)b}¯5Ωv˝π[YYê™RUPÇEvê\∞wÎ,.∑‘é$í¥¿Í˘éGŒfj!F®ê6t|ó≥&@¯Í›ΩJmÒ%ùPMÂ!>SÈîBësÌ"¬ƒù_Öf]Ô´3›í§øï˘ƒ ß≥ìÛ”ﬂ:Ωùì„≠ä∆h	ÄbµÅÉ∫∫¢EÖD¿Z3ﬂ©_klEbﬁ*≠*Gæ…A’:}k◊-ªá:Œ¡‰ünF%•UNõ¶n8fGÖ<√∫&pî—¶’Ω(w êÇõM2√$IÁlô 1CπÍ»»qï™ô¨†√[mÑT%ëÍPàÁŒ:áBëuÂÄ‰ß∑¿Ê8‰{ÉÖ1`AA^ÙNQRKËMÚÓhõÈ‘¥=Wõ–⁄Xò7Íü:ﬁ®G≈ß*‡ßΩd+È˛¡Ë9è·x/.k©“j8\°»é)=ÜC‡_ß§A3AaÑq
9®OêÅ	Ix/iƒÃ ∫ì¢l°]©K©:ôÂK*Ì†Ú∆Xi`[s⁄UùV.XQdÊS.Y‡|“É¶=µ!™/·í2√‡J^$«05ˆÛéjé@∑n,0…HŒ%Õ˚µØö„MQïÃŒy∫zRk¶CîVd„¬S‡MÁÆ∂j©‚‚§≈˛ÿC∞8r‚qxu„<W“1Y∆<uoO‘2ÄÊ?4…âÄûvn∞ì»©Œ⁄´◊kT€+‰ç¢f!Ω§ÉœñA9xK’«dM,ÙÂî#`BŸ<MãÁ7Ñ£ß˜ê	§¯håK7·B2%Â¸,,8ü·‘Fß]∞√MAK«!+“]ö∑ê2¥Pe∞})≠µuÛ{aK≠ºW°˜«‰î√Èúıªù√Jf^:G»fòrÑŸÚMõ˜Ä∑À¬òò˛ñæHŸ-`¥f+ùEf˘30oƒımÎB-§_ãTwiez˝≠ˆ_vñ'¸ñaπSFGn¿ŒÊ(ú≈NÜ¡mÇ9›—5
®(√˚>{Ÿç›	≤”Qµ h≈@’ò—A;…rhj∑‘ﬂ0ì°7Û`√hiU;Ñüt˘í6≥h˚Òl‹¬0ïÁaÍ2<.2„FÜEÊLô¬÷§\
›ÜZv≈‰˛~˛93ì˜≤D©J«‰Üûé[1—?Fñúohüî;5ëDKsf2ßÕ=è¬· IçWÈ!tëî∞-,IL·5∑≈•Å.C	K“B…´ØΩÖÊ¿j.U|],§åX.E ó%ër?fJπ≠,A-MÙrÒ(j»§ˆ„Œ—~Å`Wí˙ÚU ¨±" ËELŸπ+¨€€ƒ®≈A?Ñ(Èebg"¨;8w®–!¨≈¸‚gÆ7Ã√»≈]®òFÜõÃÃóŸA}>Ôwé?1HÍ≤ÔO´T¿˝‚+”ˆv:úÁﬁ"±3B©E^˝$≠+]ÆÆíà°Ë;ñ“¿Å„uIß∑ªº◊=˛D™—X2%{/r üÜQ¸SÕ0¯?ç‡ﬂaΩ(«ìı¨’{§‡œ˚˘˜ñ˙;<ˇ]E~≥~OÔóû^÷±7ë¸%ÑÚóÏˇgê˝Ì¬?«ÀI˛&˛eƒ$@˜Í E{ìªgΩëD€∏5%+ËQ<c5$˛{&‰B√„R>|Èá∫{9wyxY≠`∑◊ CÇuiô€“LË~ıÇy$§Y”°d‹¿RvCùfˆ°uxH’ıÑ, ´dAûÖ°-y˘4/ViEÍƒ¿≠[‡Üª®¶àﬁj”  Æ\ˆ∫∏soê=^¶:SÈ`u/aØÀ◊ﬂıÜûèï7å>ıà4÷©ö*%F4Û¡ö±!‘û™=Ê∞˘tÌŸ™i÷™ëò}∏˛§ì∏ÂR„‚”˛£t)Î)^Jïí9/≤€çc(u4>∂q*ﬂOÕ≤úûei÷√ƒ|hmˇ@,,16Üñl¨é°(Iÿ„À-π-“4ñ·M0∆…RX´Ûc⁄ça„Roa0‰ÿÒ¸àØw¶<ïØÿV ZS˜8¶Oÿ6ï LR]≈ÕAˇCYzªü˜˜Œ˜{¥’D«MÒŒ•	-}LøÙNé‰B@MÙ+ÛáˆÆÓ™•˙`3—Â¯…ê@¡°i£%?	X·Ë—îbAd"@«–∞	¶5«S≠÷ûÓµan¢ˆ#ËQF„V:Âäœ‹p´‰\ggsöº28çÍE2~£“ÆLø ,Ï©àô5–Mﬂ—π◊-ìÕÕı˜Ê≈u9æ3÷?Mﬂ)û¨£¢FÖT¢Ø«G‹îEõ8<?ÓÙ,Õ ä≤pDâK,,CKLDÇa˜õa8\w:r—gºﬁ û2Õ]RDE—Û12"íiXA5(+—’*z8OÔVÄ/¯ÚÖ0J(,Ë≥ä“$¿b,$,À∞ ø r©ø∏áñ_Ú “-≤˜á«1˚¶9Æ+Õ¶@-•Û^Ïc¿g∫
>]}u9ﬂiﬁﬁE8mŸÌ†;$37œ±‘$ﬂoõ-x¯aH:Ωkm.J≤áüú
VdO„	∞CÛi§Ø%¢a+•£fl±°>Dh§è”®ø^ö0lr}á¯(pBΩu•Iñﬂ]`l:~I]ˆYú.«ÀåQ ‡Æœ‚5›õ»–ûPø˜‹x5Ø%T13;ô	Ï¡òa9ê°Dyô=1áæGÜ§0ú#µ6
ﬂÜrônå¢ ÌfñúP∆Q/⁄¨8∞Fô0-¨9FRªêÂeZ›‘xÕà„≤2&~®ú)Ì\˛jN¨¿ŸIπrCÅ  Ïöœ<ãldç|ÑB£Lv.πs!ÊHùÎ„afﬁ¥·:Ô©p'>û=ŸZª&ô©«·‹2s¸¢—ı†ªô·ßÄ;¢∫∆°‘¥ÁQùU=ÔÏûˆÆ∆H^Oœ¬‹·«à.ÈÀsæn≥åﬁîW3ÓZ≠n—r‰ùd@ïáVXÁÜzò/}  •ÅV&Câ¯,)Ì‡Á;¯)I¸Ë¨ü@¡œcd∫2œ≤ﬂÁ‘e]G¯s3x€çEÇdWVT¨N-F
w∞ïE∆ãjAácj)Ä`πaÑñ°e˙…‡wdˆ("ì∫^)Ï’‹~‰∆\È}h A›Øî‡N#B˛@0⁄åaC¥·Há6∫ƒ“+SÊöY?pFâøiœü⁄ıàvVVMÎrOıai˜|'`ÅÓY∆√$ÌÍVKÿÆBìevÂL¯;bˆ=^_Ÿ{ªzâ1∂îó`¡ÌöÈê√∏˝â∞dÖ`AâËK¸`‘ÊS†ìdãd¸R˘“’¥´ãl;+Ïpπ_<ŸRﬁg”ø%–´ﬂ∑ù—Ë(9~ï≤tI”ˆ<rèúÈ‹ÒOªª9oœí€¸BüKîa!æŸ29lKTôY*í‰OhÈˆN∏=§&≤SÙ+µãÊezåbñN˝Ÿ“áiº:Õ™±”9>‡)ä§Bz4zÂ£„EéOéP÷ò9§⁄¡@öTCWY•óoIëÂRµ$:]Æ(åV8Fäy8©Ä¢#U∫2ö˙Xl’∫JæÂßrêwÂlˇ`ˇ=µNÂ%R¬∫+ ã$x[{úlkœ?ÀÒ◊ÚÛ$NYõ∑b/◊ﬁ)>Ú˙ªâÁ{7Á–ˇiT~§µõ¢W”Û=€6ËúôÈmWÊ±mœ≠ØNeÆ(˚∫«	KFõ*iLÂz˘Ì®ôâ™R¢ 9%Pì,.koQ_qÊbzñt„´Áﬁ“¶ÑrÄ}—û%Œ±¬–W¨cös*ì'ä|)Uî‰∑ SF!sŒå$‘2∑õˆP".‘äπ·áF#`¸]ppA]Wı7A~ÿ∫"ßQrC@1ùõ»ç»ûæ ;ÏL·'+hjJN∞U{#ÁÜå<8Ωhv|o`œÆÁgåÿÃ!7Ó‹AàmêŒt‰‡úÔ(B¡—#ﬁø<¨0q |Ê$r~w©[ä»b%÷NMΩT‰xdCWèRÏ#≠iXrb ÂïÛ”=5û£…Ÿz‹∞><Ó	O}˝Ûa‘ø√π$òˇ%Œ‚o'…_¯xÄÎ9_›˝ë?qv2ö`îZ≠);òtONc¶<7¶2√&˛›A¸ob3ô. ÿóíe8—	æïj^™%KõVêjpNM§‘9≈åàéØg’ëÛÈ0>E›4…´Ç1$ ÎX Éì≤&ô"Üt:J=•éŒ¿(ÖÛRÍh9ﬂpô¯õ§ºã⁄z©î:j√÷¥:JJµY≠º±ß÷IôƒkôÎQZ¥•∑Qx •Ü5Ωçƒi‘‰{iÒÑk“ÀS›HÏî^ﬁîÍFf≥rÅN›∞¸t7)QœòFJ&∂j√ty˘∞hWm;8&QbÎ‘iß‚¥≤N~œPœÍûêÂµ%]F°Tlß≈§ˆ”ªRòKCm]âßOtnØ*ÎÓÙ	 å©iÃ™ NØ.WCM≈W¿‡*†∞∂¶’›ÑÚ√êå…äLlyCçPN=èM/J˘õà©>CôúîI°Vy9ü,-ºµuí…˚dÓ…ñ˙)Ø-πOyî‰äyIs∏ã1Ü;?*MémNzx5ÌIT≥D˚©É∑øsªù˜ò∞wäÃ˚™T§˚¿Á>T‘gÙ–j]zQ∞¥‚û¨êÃ¿=RH1∞yíˆQœyÖ¡g¿∏è√`Í˝ÀÖ±G4ã|aâcÁÌÿù¶>BJ¬1/¢}∫"Y(g@˝ëÇ)¥!©¯BÆ“ã%≥òt“÷W%5d∞Åâµ ãLÇØ.π
É	éàM
yWîaBFôÃßl4 ÷¶= ÇJ ≈1ˆßÕ;7¨c§hfì∆3)Â¯sk÷Wîœ5®ŒµËiÖ˘§å`cNÍPÏ∏˚–úE÷∞"1≥ldë‚F+;Ã*Æ±÷Âv¯dÌd7◊$VqcZn˝îÆó0àÒòÇù–uàΩ÷m!•-+ÖVÉÖD)°*‹eï∫|€ ”éFÙê1∑êeQ=çsUé[Óô‚/ó8Sis˙ô‚oÙ3%.êé/©ù&ñ`äF0q}õCæÇ‰HQ„&ZºEä‡áÆ3∫#0∆ Le£u.ˇ|≤Ûk8œÀû…´+G&ÂHÕŸ®6{»à-<,áï2áàƒî-∞E$,èêÒ<∞å∆&‡≤\HÿC¬4∞5L·+ä„¡‘‚ÀÑÂ◊/ñ◊¿2!ayÌXc¬™ñZ
{`Éˆ®∞6h3∆Ô√à‰≥vôEÀƒë˝∏0uõ∑PÅ∂3˝ÿ#»¨¢˙˚´-}3≥⁄¢RqÏfÅ"S≥l\ª˙@g ÖO0P)˝~T√¡KÛ£:!ÖiE∂#£Ñdâ‰De-ë%- zx@ñ•sL÷"≥N\ûÀ0Z¡c´$πÙâËr˛-g‹Z‘¬”Ú˙∂»1ã5ëÂFéMÛî≥\ÙP’l˙)ÅÒñàõïVˆñ◊Úú;Ω%Ω&ß»QImØ©Ól9ïoÜXXN<4ã¥¡˘ëc”Ú*a˘ÛPrëı©+=ñQ∫Gè=C‰X&j,gH∆»±‹)ò√@ DéY∞@QÙXÅÎ\NƒXi\ˆ\cÂf\òÍ¢|¥ÿ√#≈ñèÀâ+é{Ü»∞à?√ﬂY£¡ñãÀÏÿSFÄ="˙k¶)ú
Çø2≈scølq_ô 9°_zYs"ê4Ú+·+K)ÂÒ_9Ôó≥§)˝z∫∞Ø%Bæû8‹Kı≤Y‚s√Ω aJã˚w˘pØÇPØ‹0Ø¨Ãú<7ÜsT¨·YNxó1¥À÷µ^.¨k©êÆ%≈¸|'Œ?%C∫ûBH¿œc∫2œ	ûﬂÁîôB∫1E?:îÎ9√∏æ_óÍb–dÒvéKö¡¶»iı¥)>‹\*¯…’ÅœU«§KXïÆJ{7¶ë∑«V∆U•-ß¿ 6—V•-úä◊µÖRŸ≠∫ÍøK'óÒ4˛i{[ıÕzÛå‹zFN„˛õw—}»nhM›>©«Ñﬁ%ê¡∞¯*`inJF‡™µ!©õı 7hœ`ªó‹Zï%í›xlÚÂW‘eB
‰†=ñ@_€≈%©ø«WÍ”Í‚>q'Ë◊ÓÑs<–÷P\Ù r&èÇ€)÷qHåπ≠—ﬂ˝K2¢dŒyÒ©Áz∏Q”Û6çNä‹œËπ™”πÔ/hQ˘‰\;>`bg2(tdK„0íòÉú
§Ç◊ÿC‡b Oá. ı>ˆÉ6¢0lL‹(BfjK\CåÌ¸aéÙÿsAÊqçqiH—0zhÏ [KËå‰I#àpä¸ÂO∞TW^8ë‚y:3Á`åˆsÁ‹@Àhë5¬Äèˆº©∞4tBŸaÑ;˝ê .ÄkÜ±».ÇÚUΩ©ó¢
„äÓ‘ï†,≠bM§.yñ[íyÚD√€Ô•fNßÀ®%Sûò<Wÿ@®ÊIó™£®¶s˚˘gõV’8iÜd(´z˛kD±†ﬁÁºjû°ÇàΩHt)”!QötÅë‡HÀù%êÁæ¥ºÕøO^3˚íˇƒñï8ˆ3ãÍûÕ∫öógS±±J6dŸ4f◊Ãœ™iœ¶i4Õ⁄LØ“∏,÷◊ƒ€:ˆÜ=ºy™f,°R3ö14≥‘p¸∂ååÓº:èqÂÁ&É%?Sò˙àˆ†w h6»ú∑ìÅê±˘≤„TCo–6©C÷ïLh_Ò}i©ÛÏ≤î-∂(»®Kπ}ŒÛ%s´ÿvñ!∑jØ∏*^‘¥EãLè˘Ü≈b”aÆêKÁ;ù_;gv4°À∫Ÿ]˛≈◊ÑÌòπ/"È±	R⁄	Ä2;”Ï-ÀeS˛KÁDÁßKI¶πR©A"]ë&!⁄.6 RÂ8eëNôPEQ’√h%gnÜôÛôdêú‹[™]/ˆﬁ˛Nø´ÕòùYÍGº¡¶S÷ÁÄ≥eI Û»	ΩÑi{q/£ŸD™W·mG‹√/ó‡ﬁ~lÀÄWï[ ≤Ãºè# ˆDÇ+ô8¥Yuèp.a2L	oMnß«-¡›QdkÄEú¿SÃ¢∂Ò¡›;sˇÜ±˝)ØˇÁ„£t#Ø©lD∫U¯R,º∏œˆ≥(#!|…ó2"ÇƒÉ‡·ÌGiøYﬁÛQ¢ƒÚ¬ÑYúxNÅ"O§xÑPÒ`±b¡BE◊À
O%^<B¿–‹MûÕÖ3?ùˇÇÜ5ëQ
ˇº‰˝_–áãO(t|±„#x<\ÙXV¯(#~‰öœEê\!§åR$àîEJ#9‚à…ç»,®ÈBâEvQÏπ¢…
'•gf≥\%„)PJL…TJä*œ+¨Ë‚ä,∞ËÆ@πBãIl1.|—E°ùô‹ÖlN√`‚E.µßÀ Ûôt◊=}€óï~$y*aF!˝$è0ÒC9©fïêÄ .aka¶ê—<§∑´ÇîCÿDUKã.≈¡ıµÔ≤^;æèåí&YD6=z#^•£≥œE±i≈ÙVÈ^¶2•Õö#œß`4ﬁÿ‰O>∫i…Œ ¸|–$S&ñ
ôÄ˚Ç€ò`x∫I:@yh◊≥h ò”Ωè⁄*s3m0d1π‰˜ T+3Ãı0ô‡_g]tÙœÍ*MI‡º^ª‚Œ#©)öv‚åæ‹Nìe∫ﬂfÃS&π¿tî[ﬁ+Âiø∫N»ÿQ9{†Y¯¢ö-L|¥
ÙiUo[åÀﬁ2îÌ ÖìVÂ5ˆÆÆ˙Âıh<ú3à™r|;S◊»+ùbK{Œ]rŸÏ–ı¸j“¸*©∂öÕ&˘Ú*˘”^˛Ï%i…≠x—?]˜∆«‡‰§¡w€§’îçùËó˘‘m7€Øpí•0§œ–E.Yx∏°ŒôNÂ‰äæÔ≈∏§_^‹ÛFı˜¬X*öÄ!÷@Bı∞Vöï⁄¢ﬁl}ëÂ;pIwº]hX”+DnÖ\IZBﬂΩ«.)®ÀPÙ_8BY\;êÅπÔ`»=èãHï¶”†«Ø\2°›«éW}Ü"Í &e‹ö4µ¥eéŒr‹@8Jp5~øﬂŒÏu°/ﬂmkkáæÃ¨5Óï≈»rÁêÍÆBY‹ñP8/\ËK[±&ﬁ4!≤®ßÒÇÄb„∫±"\~…-Ä2&BøÈÚ»Î¡õÍ¢K#÷œÆ_çvÍ˙o*0U∫N‰¶≠îä…te˜≈;¢TV[ò•VQ≥Æ°«éhTu)f^S8®èäWO˜∏¢äMr°~.±Ji"S£z~ck™l!ıÜ©ì3∆iìGí‹MVîÎ√î&Ã‘˚)≠X+=k—pÈÈ˙WÈ”´§SÈ+‹9˛Ìlø{¥s~÷€ó7+Ö.æ	ÄFçíâòﬂ]å6QÍ1¡~Õ=ßP ˙ÏÜ˚ƒc6c≈7ÏB{Sz„2mYZVËáŸØ¶ˆ››`2sBóïïˆá≠1E8ïìOÏX'UGòN0≈A;‡oÍˇÎ).¶‰´„œ]Ü*h“6™£r'N4øq¶;·êÙv˜öQãv¢íµ:πh>Y!¨(|Ú£j„ÙA¿&˙sî©ò'ﬂCF¡OZ©”U˛<)'Ëq≥§œ7ø‚¿Ï’\†¶ëPø-@∆.OŸ-Çÿ3/>˘¡¿Òı˙gûáö&4c$UÂgJ-§à rú·úWJêÚ#g∆ÿ0û@ÃL9‡BqJgI•D»≤’@êÿøëôÅ~mm£˝j}≥Ÿ~´”¡r≠›lΩ⁄lØøQ …€Z€ ˛UymZÌ◊Ìv´≠‘ñu˝ı⁄õˆ⁄⁄!π…¨©„èÇ3˜∆ù¬™ú*pí4Í‘ÍÊô‘µÅ+ÚÜ9=lø6D+Ú∞”=Á¨
√9Ùñ Á ÀÄ:¡ºB±39€áê≈ﬁ&„G™≠≤=œãàD˜…B=d ÂŒ®A¡qei∏úÉ≤JÜS£}"|◊õˇÕä^
Yn•Lkùñ±öÙîd˜¢’ﬁh≠!lø’ä»Î’j≠ø~ı¶eYVûî‘;®g€KA©èÄB˙cƒû#&êÖv ùÈ≈wæI1VŸ"ïÎ–U0$ÖVZ©±ã2VŸíx X7Épã\¥_ØêuÄ^Ø_bÌ˚ΩB‘Â˚2‹o1Ø‹ﬁÿHü_GﬂÛ˛cŸ‘bˇ0¬A‡Fct|ÔØF›´ÿT`Ë˙˛©3yòØx-…1/æÇ—ùaé¶·ò[RÊt±÷Ñôt„M©IÜá ”ª˛W7ˆÜéz’ÜõÏ@˚’
iØ¡¥◊õ%7Îˇ”≈„-“l¥¥±,R∞˙Ï˙3t$»(tn…5˛(0g€îÃúkW3,t
œ>≥€§J#W˚∞<È
—|êy™0ô£`ÿ†7¥∞®∂÷˛çøÍãıÆ¶‡ßó¡ÍUyÒ8)Âp„“1Æê÷¨bÇ]≤CycI´	ﬂj¡^¿·.1»Ç74G^>¢çÃàˆ`•˘
»€Ø˜{(ˆπ⁄ll(/™¥ÒMË‰˝"†È˛oÎr⁄˘¥OZŸPŸà‘zàJ¨ì„˛Áﬁo›Ω°kπTmã2m•s?ma∆WÅÿ˘∞—$‹'ü:g{“=>˘œNØK>ûÏt˚˚ªüÖlã|…)XÙ∞sz‹+Èu˜N»yøs‘!;Á Së˜Í–äVJÏ€óChÜÓ»ƒ‘Ò…Œ¸fN‡Ù1^„gr õ‡ÜŒÅ:¢«ä–k&™"ıƒTy+Rg2Ê⁄è_ëÕzïÓRœ≤î4ß'Ω.LóÕ¨øv–=Ó‡Ÿœ{ùœò`ıløsXÔwèˆŒú4@ÂŒPÒiLÄ∫≤ƒ–*Í≈dtàπø∂èœ=!kUË(5 6ç‡•H7`+iL¶sÄJ/*Á°ÉÒ-l”ÄcªÒ¶Nõ˚A¨í=7∫	ΩYDü˛2ü¯Œò{>p£ ™gÛôÁåkïÀKôæ@€	ÓΩ®ÙO@Üá…uzÁ0˜≥n˜êﬁ{D≥¯qrÔ‹p˘á:Õ√˘òLv+Ùb6'ﬁ•ìﬁUΩÈ0ò∏5	øã>vˆÆÈ∞™ù›˛9<‹=Èık¨≥î3	ÅC%Az˘Ÿ⁄Ê¡òFZlc;;pò@HÏ~Ü	ëÍ¡…qÔ‰∞ªáêˆÿ∆ô0Ì‘oL93jÙ rq!ÓÄ%€Î „ûÜzØ›^átz§s–Ô~${]"›#EP¢≈^Èù
æw3˜F‰ùà‡»FÓ»spËxÒ[¸Lá”õkß{ù„ˆ]ˆ©:ÜÙ˙ùèIıtøﬂˇïÏvzükIﬂ"fKY`:í¨ˇ«CEÉÏ ‰[42ÉIæheöebö√¿C-“Ÿ¥±D¬AÖﬁı8¶É»T—Ÿïë7:≈úeª¿mQUé£iä∏ÜSÙ'd¢Ò4hJ≥§`‹6<ñ·Ì∫ã-É,XÉÒJçÑEOüvÎ“¡u$óÎóÙ÷®^pìW˘Õ$‹m&ÂgøáThÍ⁄íCm‚P7Ä_h∑ﬂHCΩ]w∫ƒXÅ#·~›\b®ÎKut}yy®wP!∏]b¨≠uÌ+h¨•-ÏﬂÙo<ù{bhJib˘$QZc:ÀSG"ˇW4·4u°hçTO¶¿E†xÕä3™-©m^<˛ËN/"ë#¯ıÈ~ ]ÍûÏÌ”ì˝©sò5kv^5√Çï‚CÀ¥åéñ±ôÑ&Å∞˙®7»ØñdÄÈ»ø–´µl÷böæıΩ¯û€€*ﬁ®ﬁ›´‘§∑∫G,’—tú[˘ã∫ "È≤ <≈f¬b[∏ä<æ¬ŒYHºE5A$•’≥%‚yJå≈∆Ü Sπ√h&}q)Q#ùπ ˙§QMçPÀêòåV¡VÑé¶vôÙ%√FÄ8	*&0+äMÅhv≠¯Q&WÑ¥“^{Ó´M¸OkÆ$˝”öKiƒä™A¡øΩé¬‘:<ã€ì	´M™_Qa	"∞öEË¢âmÃò…çP∏H/Û–ƒçd|T∞Í~ÍÉx‘=¯‹Á¿£ŒŸß. ö˝Û„˛9Âq®ú‘9ñØ‹ÇP0»;9rBÙ‘?tŒäÇRfëÔ¡ƒã'.‘∫	Á¯√y‰åg*ƒ∏T‚’Ñ˚|?º€mò˘!»0=∆ÂûùÍö÷»ÜzMÚ”3‰Û]ÚUÚÌπC¶Ûá’æ‘í\ç'5§«sJ›QYæf.M4u0ÒåÜ;⁄F±«@∆8.ıdáfW|«%#û‰*√{Q≥*^§7Ù]ÍÛÛH_…Z”LÊ (¡‡Â5–2e®zÚ≤
rπ†Meª†öG´¿
òÆû‰>%˘Òj¥iKtÖ/Ùì1˘‡áMˇBâˆõçıÕµçÕM£ZDƒº…:V”ÕƒÜ.X	ñıπäUVÒAç¸ptMÃM•◊ãDji,Ã≥E≥3àÆ°¯{àïe_B√˘Óæ4`◊o{@`$Ú£`o·T‰g–°¸ìÕ*Iô.S∆$Më¡.∑Eª§@kO¡  ›© Ø&PAi"Å“ Tì÷N0·Õ¡
€;¶{ÕÜYÁ®ÖúØ◊Gb«Y9æÁºˆ*{™lº“ HƒW;¿ıÿ«Më o M¥åÍáÉ+TÀyŒ{ª/ΩVw“` ¨ÈGÔõ;™∂jÈï[$F+¿õ˛CrOû4πL¡BÃò•õKßƒu<ùÉÛ# ÀΩ.ÇK≈:H∂¨yØOÚÊ»∂Gùd≤óÂgYÈùüùû˜*Ÿi>€Ω3«[)™‘∆≠™ÿò˝∑òGV Ûl~Ì)å8º‚∞Xı ãIı5IY(‡“¿∞ã--ÕAÁ*qÃ\q1£´ñX+´
í+≠6ª°î¿lÉnò´b"r˝b5”ä¶‘3ñÓıYpK∂âAGí8Óí^'Z*m¶çdCë
t*fì±¢¨CiolñOñïlÛuU´X2
£©ˆŒ«˝£W˜å®yèAµFπ¥EgÄ+≠ﬁÜ)4+-éÉ≈Y]4/ŸFq¢mNπY†TíÂD}m≤ö∞lﬂî7xHœ≤DiË¯oyøÂ_f1+˘îU}Ò±wÈƒ£T3u∂–9%'G›˛—>
çÁ@•ŒŒMz©îı±H¬kÂ%·áΩá˚{üˆœ¯ A™£3`j5¶b3IºÏÃTñÂ—H´<RÂ‹àµT¯=Ú¶◊◊s*˘N„0ì(®?™ºªwzr¨Ó,LÁÏºáö«••‹ÛÈC}ià5¨Ø;tΩØT=Î¡Õ|∆&Ós|ï‡˜î!∞{â81Í†ÕEzœ1ªa¶P¥L3êgÀ4Ün)œ)Ÿâ”{‡¥Nªƒyq∑≈àP«E`•Rá≈ÅpÆ‰;A„ƒ5Ω∑b	·˙ÊÑ.q'≥¯é7å[éL)'Ω™Ä#ˇBIu£ΩŸ~-9g}Kîü¥∆˙ÎuŸSqÒ‹úÍqÄß…,ò>°eÆ ˚9A%¨»»Ö3t%Ÿ†˜ m–å7=pcÃÇvGÊú¿Q0¿nË›D®m+–%+t´““„@Yß=nûNk™ÓCÊZØ–=ﬁ≠S©E{°	7MÌ∂≠Jáô«#/±é”Ïò¥
π¡pÊ˘I8ío»q“ó+ˆI∂ÕìîÂÇ37öÄ$ «jÒ˝ˇ:≠3√sâ*.ß˙©ÈòZâoh)ÇF‰hNIKË•3Èpfâ
µÙT◊,˚âF˙˜÷˘›Cs<?CÁÿ8©∏‰?›È(kzeÜôóŸZ÷§>_⁄/∫÷íARi±45‹Ÿô7vpãcÔ⁄°ÍÇŸÃ˜‹∞Ù¨◊sf›wÆ°ıÑîãIÔ·z@/”Ã¨wœˆ˜JŒö7jú6^Êp± ≤â√"¿qÖôJ~#/Ê∆Û˘ê©~¶){í±”V»?›(û8·MM]ò‰˚¨7\xÀ,Û‰ª	õˇ¸±‡'eü≥Ñ∑¯Íwé∫=ãÁSW≈ÌŸIä`ESÜVªàõÆ›òï›E´∫Ó%’ØHµY%kà*"ì.TŒ·V‚n3Å»ç*C÷SDñl.¡ö9&ö»d¥u•7M´»,ú\ØòÉ™o5U‚≠¶Jºe6l˘`H´&MZª∫Môf^1ÊPì˚¶ôA≤ÍµtÜ="S#ˆªeYßn˚ëUäÖŒ’!&Î_¢î™oTv/òB›~oŒ|‡ãh |∞L˝{Óïy±Ù4ªœ≈√1A»gùÍwc“È#`U<˘&à¯£'rP9>4%–å/ÖÁ—?ñß≈D·qÍ∆RÑÂ…¥ç‹∫©´•ìó*ót√≤©óS.©.,„øêF\'B=∫öOŸJà⁄"ZŒìãÀrîh+âa†∆ûÙnA±z©√ÖJF|œ/’dv|˜8-öAÄ~}-Ä^´≠‘⁄Lkµ÷Û™≠©ùm§ı⁄≠ºzÎJΩv;≠ó‹Ô(yûòs§m_™d—S≤<‹È¶·I6øCb•KÀ	·
°PmÙ,∏•πí<wjíÖd¿π8%Öõ≥+h=ÓOGèÌè≠oN.©ª‘m"4ZˆE∫Ät%î4b∏èto0˚4‹>Ø?CaÛ"≤X
˛…4¸Ñ^À*âxµ9gÓ©T< Zõkõ≠5’BsÅhΩ~Û™ŸîıJä·!Ì)ÉÚ’û⁄-‘N©Ìh]Ω^_{ı¶U¢´åÎ¥“’Ù¥±Ô◊“^kOœgmRZD§i˝‘ÄHﬁóDy¥c»∏≈ÿeÁï˛2ËcµnXÂò$Élín˜È~_ ‡ê•ªL˙¥¯•ledŒìniÀ"Ä·m)√ó_&¢H∆…Eí?2Œ.TËÿJ}zGñò0yóÍ,@[(œŒ∏ÒgúcO5ä{åv;—˙K‡y—ÃC⁄Ä:~ô”†¨£yå*¬U"_√BY{õ…`A…V´ıÈÕû4áàﬁ˘$˘„O˚áÁ@oúZ"mH¶eabëõ%’”≥ÓNgØãHy"íÄ‘xáN“R≤˚$¨[!ß˝í˝*gÚ∫‚ãYQ6[
‰πù¯V™&"Ëíö¬EñèÊ˘ÇVÀΩ˝~ß{H~9?Ém!GÁ}lÚ≈Ω2÷E‚g/n5⁄¬ •ksØŸºò?6 m‘Ü9Óè≈7Wd2«ÙP#Í2
ßÓSÃgM-CîÍC8d#2∏#Tß‹·H◊XP‡Ωf5œWﬁ	CÁÓùÿ@∆ˆdxı∑…Î+Tc”ﬁE`ØxÁE Xπœ<`yC”ªcœiœÔëôøTrç¡©#Îé"ÓÑ⁄s„w¨ß˜I:60
kπB≥UÖHÄÍëùED™F∆”pÑn%P/èãQèÉ˙)è·"ëÎbË∏∞∑q6ﬁb&ïB∆X&ã‰5∆⁄/‹wÜ„jï=–xwº	z$¶ï<U¡ {Õ© VmEy#√ {Ø$KÊè‘KÌSË¿DVÍÙÆ‡Ùç|œõ
àΩ´I/2øHwè∂Ôa∞Ë≤NˇDDp›∏sÒÿã»Pø]é'^µã6LÁ9sYc~«û ¸ôõë˘1)Ô6.e‰‚jw“«U˘∂?öri%a©M^⁄Rã<;<}¬≤Ñ„∑ÜArAD€NõßµX°ÙËìÃ¢AY
g¥˛äˆÍ!Ä&ÉöQ
¥È`®ﬁÏh 8:BıÀ¥Nñá¡3ÎÂq^ÍêÅ)±Ü*P—†mcG$}’¢0Àd£≤[:¶¥˜ÀüÏ83çuáñ‹EÛÚÉÄ8!≥ˆﬁ>p¬<†ëFÒ‘0bp≥{¢AW*kÊù˘ûL`á2Pk°ô »˚”h∫⁄‰®?RÂaåπåÄÿ2ÊÉjBˆˆ{ª q»KVÅÇª"®ÑÓ#ç⁄RYr—ÈôËÿÚíÕÈÈË¨óì.ÕH«;0&¶3ø{´.,Oi‹π±sL]ñ{VVãn ’"»∂·ùHﬂbK.ÉÕ‹/d|6∫m∞—ÁUö€ãˆzìÜœaÑÙ∆Â
YtsWﬂh™6÷∞‘:+@ßÂ"4k
„≠Ò6ÏI)“°z¢õ
¶n¶”◊fe¬ RJ¨”h˙á∑Ú/ê|ÂË(⁄∆‡Á§åHWzYmàWÛ·8ÚQË2ïC);ﬂeÍó$4Ç-˜Ô*ÉØzÜXﬁÚÿù`:ÈoÜsÑjT|œT=;3~áÖ™õ¸@™‚ûq~≥ç∏÷Ñ'¿WäÀóY‘+ò·˛IïÕ)¨Î®QÖu>∆ÙQä’R¿ßÖƒOπ ? ¸˝ÆÃV»~¸Ã“5I˚ìë¬˘ìt^.‡Ÿ•L>ıwH;≈¡∏ê∂ÛÈcn&RÆ2Â^æÃ∏£aÿMÃ4r£aËÕX.`/ÇØËnwÄ„†‹]DwìA‡GòI◊õ~ÓwDÆ˝ªŸ8Ra¡π›É¶–T6§F∂LC<Vˇ∑Íˇà˛„/k/W1®o.˛Ò?¢Àó´Ï1†éIÍèãp<Ú"(y∑'5æ-˙ïWXŸIyYÛH3≠W.PΩ†hL.+Ú]DÈ˜Üj ÷Û¢©rPVâJ ÖÎÙ¶+{õ≤BgÓ≥r0ﬁô(æ«V†$«O∆Ï˙`÷ùnµ"UÃv;ïö ˇ◊˙º¿ª≠ç-¿b•C_◊Œ»$ÂıdnC?‚∆ˆ§◊¿÷£˙W›Ì gáŒ¿ıE(kZ@3üPf¢®¢⁄KIÔóV£»Rnx[˜:Ô8Í[…Å·ºŒ57âdè^Î/Ó-ØMvî⁄BË±.5∆„È*1üVÓˆ@øz0-tf•±Xå~Pﬂ∂J‘%"I≤ƒı∂xm»!‡ƒáﬁ[¿Ú-°ˇÊ’‘ì"0âñ íìı`C;9œëßÿàçæJÒ÷¶=≈é›ANi¢›ñõ†é÷÷µ∑Ì¶¸vC{[¡ùTú&^ïÕÅ ˜±˘¨)ÅX∞:™[EV¢ú∏îÎëÿàQ˚RRM∞!–¬hˆv©ßYJ€Õ·b·ı@0Túlg*j^TËæ,5‘f‘@!mÊ‡´¨Âœ¸î"≥Õâª¢r‡ƒ†|Mı*7KºŸ¡Uÿ˙ôkh˘oÊÔˆµyUjmò1˙ßè´»®.ª6ˆ»∞≠ENà[AYFVO]u≠`r∑èƒèI¸tt 8biu“dù™Ë0√ıbgã5Ä®y1];ôì£•‰K~”1'€_^‹”rÌK¥ã≤Ô-È{ÛR‚æTíœª◊UmÉ ”Ω°ôçÉL‰åà3Q.B›S&ã)˛ﬁ•¥sõöØ›¯ò÷:π¬&"¡…“˚#©Êı}ˇº€N+√Ôó/3â¢®]—3yõ1IÈï÷1QÁ+Ãƒµπ^cô∏h¢Äı‰`ÿ}óß∏£æ!ŸËóœéÔLËΩ[ﬁÇ≈‡RÛ9–‰IMöÙ5p$„ΩgpuŒOæôòéHÔ.ñô{<C˚™é4π∂àKûI.–¬Y ô≤§›ﬂYm∫ŒWW˘â4ùøâpªﬂ>u?˝ˆ‚û7ºÄØô\Tãﬂ>céˆŒùé—x0;.ﬁ˚4n˜i¡£`‰¯U™kÀ\’§≤g(ZÅ¯ï∫≥%dR î‚›Ω3,.5*îM¥Œ;ö§¸–πÊ¬ÜÉ¶ÓØnoàäëÌ
eˇÍÃ·€Fˆ`zÏ|ıÆÑ∂Ô”Ô‚P·mƒ€˜¯79f ßÌ{˙{&n∑z7Úæí°ÔD.Ív%öÅXø´oíŸ†ﬁ^Ø§W•È%Ø|¿Õ¯ßÿöLF[Ù;PnÚ˚<äΩ´ª˙¿çoaTèÍ,ß7îc?1y˜µ3´À]∞N‘K˘ﬁç[rØ®ıµo>ÂqÍüFØ·≥T˝M≥â◊’o Í1eáÙ;˛é Ê~w1Bπ–üYæPµÀ’qKƒ,3÷P66íâ;ÚÊìLgßÏÓe¿n†ª1úR8±RTø‚òáÃ–c£°çe¶¨œ™∂@∆]¡u]”∆Ún0è„`™ç/òÓ˙ﬁf˚û›;∆èDg4bÁı‰5="ZÍmp-Ø;.ÀÌ∂óÃæ’_ëŸ]} oD|To∂Ï¢’ú}ª$sÃ◊;ƒê¬dÁnΩ*ó£±3
nÎPu|u√-Ënz,ª>Æóá$ØétÄNõCp|î°ÎõÛÓ˝œ#@ﬁ€˜≠W≤˙û9^ßíã∂l	sˆÉˇ¥ûÃ‘Nûô®ﬁ¬„ê˛\£É~ï9÷ã{±NrßV⁄ÑtıBó_dÖ´à™ç˙ÿç\ÓDÄ¬U`o ∆ì˛“!Hä3àÄMÉé‚`Vá¡‡iÉoÎÎõdå“ÌZmßÉ•wb’'!`¯'∆˛<§áöéßŒ6;Bu}Ω’ﬁ–˜z4©≈©˛∫Ÿ¨¿¶Â2ô˙øÍ≠&Qqñéß∆tlô3ú≈I¶éh”πòo†·:[K∑8“1˛Å§[π⁄j™)Ì¢cN›M›@GˇÑÂCE¥Ü h~⁄ÕÖæ¶FPó^ ¥dΩÿDê‘è<’¡ØË⁄=LökÍõ8o@%Ì∆"ì&¸£ — 1U=˚'≠‘nZÊﬂÛêmA¥?» B6Cúâa´Õ37^œŒö°43qZœù7¿á~‚¯∞i»Md√cFhzfzÀß7BW#√à«Î¶∑3VÒ≤±]=%≤9goÆÖn€ô”cZ<‰ ΩàÎÎb3cÒ%Åu∂)Æll>ÆFnÜ—2õ≈’Úıi0uÌ;Gx<.˛ëG≥Z;”#‡ÕJé¯[îÆÀƒw:`yXñew3Mïù›QÀÿl'B€Vv‰ç\ÿè›ÍJ˚ª“ß≤≈So
ö=∏!¶¥·è€√√,©q.FŒÉÒÆC≈ƒlª0gA¢I>Â50EàdâdÈÖ8MıHl4ó£õ7ØL(•[É˚x>Tr›@%Õão†&Äy8Ö–ÉQ±ûYñò®AÆ`eËZá]~õÅÆY∫`…,MX∑ıY¥o·Adj«I_ÍÇ”yé—˚,+’ÆË¸üEäÅÃ,≥Ï√ø◊9„,ñƒ =˘	€nßÿ3∂¬ƒÙwáõÆ:√”ªÏ¬˜IÂ˜9o‚:è';pF·GÖ zDêDm55ÈN3-LöÅ¶Iç9èù4*•jS¸ˆΩÆ§gü[f¸˙Ú‚ûﬁÀ=Ò¶U±|x-7√\4®©∆ò¢˛¥©¶¿L?ã,I.	´ÂÂFqdb3ü˚ îgá|V˝Ôo÷ùµ¡Ê•ëY9√˚O»j/œ†A˜a†äá™âàFáP¥i5)üÈ‚%G∏É§˝,ØÈÒØ3öûÕ\MTHT1m"Ù≤:Ú,K=ä)á>SÎ*uI∆ÑX3[˘∞n’èX„5•yí¸Îbå >iÆ?JÌ&4|Œ‹ÈÍxÕ2É<Û`}Äu¨˜ËzR€
öÇY‹æ	≤œRIÚ˚£qBM0ˆÚ[DÎÄßj∂◊P˚p´NNÒ-©xÏåÁX‹$‚ÿÖ0´. ¶7´ﬁ,J0ú∂˙∑T[5¶UeU¢ÕË,•÷ñAî©""Î0	Èöd\∂ñf§ÕﬁŸœﬁw\8J÷⁄ﬁÔ≤r'Û¯)óŒ¶;…ÊuJQmËÃ≤+æn÷£â)ó“@”>ˆnL‚Ûm™åŒ"ﬁh+AU+ÃqaK6/LLñTU °¥Æ∞V≈m•fü£[ÕKÊrÕ‚Ì™∂Ω7⁄”“œç{∑}è1LfƒÜü¨Ò≠/0oï¿Ÿ´¶õuˇeˆ7˝ÆﬁíN»ñê√ ™fñf>ö}TÅÉÕ)LÈC¬ò–q	3^¬~‰ëJ04∫…lD“√WÄ¨m,æÿñ“~ÏaÛ(¿ÿjöÃÅÈßf—ŸôyYt™uì±VÕL≤∆j^£…L¨ÿ‘ı›°Ìñ˚u˚ûïrŸΩ∞πp>F? tå›∑/9Û…ê≠2Ôù™€àù⁄ç¥ÁZ÷‚!>eéLjD›hZcÈ$¡[lÈSÃcL¶ÀÙ“W¡pm°#∞Ù“a&m5—7
¬˙,(Cº<ÿj7
MƒuB∂Ω∆œªÄ9lS§5Yà˝ıy{}MÏÀç¿ŒZµ∑a>$¨.É-À·≤0ãπP´¡,Ω ◊RTX,ÈµG®¥µ˜ozV©©,èU∫+Ä7⁄ÓhªÀÖ6xmo∞ “l;ìBY)wtˆvÄ ”b€∞aìo¿qóä…hk‡√ ´>LïtHÀ¿ÈGπ¢°Â TÄƒÜJ´Upï‡FÖ◊ıÔØÌ«¡´ÄA∂‹4øƒ˚û;ô;BÀ_˝‰«Ø¡÷}GGa∂Ïc¥]˛ÙGÓ	ò—(ºÁ<¶wy“JôáôCt±÷Dò0ÈãŒ‹h ˙’›Äq B¶∏›Æ b¸GÖå]¥&ã_oJc∂Ôõ∆ï{◊	]éHH˝•<U‘çí,k˝näªëÁL?ÖVÆ6ä√‡∆›sÄ}≈ËÿÌ Y≥ëj‡S—ï◊áﬁ—ª‘∂}¨…Ì ﬂØZWWoÃ≠Yƒﬂwˇ’˘ÊÈ∑ºàŒ¸ †≠Ç¿c§ıaπ	π)YÃ¶á«œ˜ôﬁ"≠¶Mxc•˛I˜;	c±óı0n•¬µ◊÷Ç≠=˚å‡4∂öÊ∑∂Eˇ5g—ˇÏÎâ#˛»ÛñÖ@û–#≥_uß#@Òx∆Œß^—∑À≠}?¸ÿõYzøR{V\µı;v±oåtΩ¥“FX6ó«SÂm£ãgŒ»RE*≠W≥o9ÃJo°{ˇ‘Õ-˜≠Ged(⁄$HLIk˛‘◊‡Ox=®6	˛oï4-=¡}˙±Ïìmum⁄6ˆnÜ¶¬`ƒ8"ú„Yı¿	æku⁄;Î|'äq,øf€#◊¬¶∞–…Ãz1ˆf£πÒ£¯ú¬UπZ_ª⁄∞6µ‘™‰7ıòUy∑öXã`†Êœ„öî-«3[“u:k+491?ﬂ3C^#ºjäÖ±òÃF∂yòåzY‘Ùö¸É—•@Â‘ì"x’œ(fuÍo=ïv {ßV4&«N=ƒåüiPÑæÃ÷ìªG°´’ëêÁZ”¢Æ3∫—ñs~¸oøAi¸vﬂ#•Ø'›£œπs»å∂ﬂ_b≠Õ-˙xsÑãÙer!™mäZ¢òóÚù¥Ø™Ä¸D±.Ö>TÜ–ì†˚}©¸¿©!.Á”—|,∞9›˚òY]ì^€§π~fﬂÉ|LõF¡X\ N·å≥k~ùõ±ß€ÛóA…¶Ó3W∞G jnµπB÷jLÊi_i_T‡-ñ6ZjrÓø§Å$íÜ¶∫¢1úÙõzìvd≥h‰{€“∞Nõ£`≈fÖ±ÍhvCw‰≈ ê' ºi	NY Tçï∑uª7HIo)‡pé†Êñ≤&ﬂ+iyÏ˙o#VµåÓ·N_Ä“öçç¸·ä(Úˇ˛ˇ7økZz‡À⁄√≥ ™<¥o∆÷õ,Q÷πk+Û(îù%¶(Mµ°÷ı–;1aö∆ŒMÏ}ıbGW"‰b`ÎÉ"è¥ß≈Œ˜´ˇAvi N¬√èyzn`bBÚ´ôÕ+„b ∞ëKBØ≤‘óÙ[≥ü:ÜïßuÅÄ√¯>tkÛ„6∫%pÁ T¸¶û¸ﬁ¬tø^bZ±’êO˚˘5ıÑ≈i3ÌÜriø¶êT˜ºÔè»o6IPû∂∑÷  õO…œâÎrí–∏ ¬‡
⁄)¥§6◊Z&jÃŒ«wd◊â∆∆÷Ñ?Ö3∞ì¬o
ÊI·¨æYèADöË*´lQ1…ì˙’¥÷ò}´o(¯a9{F®˚S®÷
ª{≈ï2vÊ_A«o≈—å,±˘!Q¬Z˚1æfänëæpVè
ª7Öïî¡0œO†∏TQL¥¨_UÜï‰åïY™ÀÁvÈçª•úYÔ√“ßˇ¸3©|t›ë$ÿq<g>∆ñêƒÜÉk„-—Üéˇ‰È≠°Íª¡K'ÿ-°Àtë‡¬§mÅ ÊÒø	&\¶Ÿ&ÕÊ†BãF¡Ë<lbÍﬁ$àÜ%ó–yó\ﬁÌ»ù:ìôÁ„Ó©§EY&ê98πa"‚Ñë7k]>¥˘/Æ¡øç∂n)…7?én2Úû4ÌNM˘˛z		;”ëÔÓÃ˝õ=Ë¿ŒÁ*ÕVãæ%…«õﬁj.9E˝gS&3mCK}±º¶Å„°ÂÑ1¿—∏≠b‰≥3õG§jÿåÖŸE+œiÆ∂0˘K £…»9˘ßsœº%m8«©Bq©@Kö» KX\*íäÂú*ËÛ”N™æ≥ÀO.hXƒ:´›≠|ó≠ÚÎﬂˆ:øˆ*Ô_Sçp¢µY™çµ&od≠˘àV˙üªΩﬂ®#]Â=ı3∆Ãø#ñœk&◊ùHÇcë.Û±†º+Û%!Y‘˚êÂU∑≤ÿÆ• HbeòCQÂ}Ê—íN]únz√9∂®?[™…X|åËC&ËΩÙc©FÑ˛æÚ>’‰?lù>'≥“-’‡'Áw¯∞Ûô3Æºó~,’»°„MßwNÂ=ˇÚ‡SoMGƒ%M!ñxS Ëé-Æ‚]œu¬·∏òIR2˘ÓJ+òô©µ⁄&u 3–3zG®¨§’Ã,Ï∆˜6E¨7ùY#fò•{∑ıIìêè∞ ve1x,ƒïF£au≤ŒΩ∏NˇÎ‹µ!EõooRÌì3√„g°Hy∂,ñTÃë;Ò®
∑Ñˇ£∆ |Û˙&úﬁ÷_1¸ªÑ7Ÿ˛t’†&9˝§JN∫~Lt•_—2ÆYBíﬁ≈Ùöµ¨ròÎ·êà6áÅÔ;3 DÃ8pÒÜ˙(
∫µfˆWd]`æl+◊áΩ¯{ÀmøY\ j>àÅ:√vNƒ*,3&x¸–¿úélâÉ€)&ˆ	H3ÚBò1ˆ27 §(≤πlççïÀ%4%ÑlƒóãøØ≠≠∑66lÀîÙêáƒáaâ·ÿﬁÇo˘°Aö°·}]¿Ö∫úÎB˛ˆZÛ©rÜ8OòP”u6‹7óÖ›„0›—v^∏˚ò≈p.∂÷6ºÈ√z£≠ÂÖm‡'Eíqp}Ìª,¯°„[É°ÿ«ùâüw´Ò8'ƒﬁrÆF+ö@—Ï‘n*C|moŒÅ8ÚÁû;òGˆÕ≥˜ˇ∏t˜R}„\qsjˇ~‘0»ƒ˘Ü¥•’f˛Ô<H„ágç'ïs~‘xÈmo≤Ò‰‹$Òà!¶9È9⁄å!:Ω‹Çéˆ
Í‚Âﬂo§¿ÄÆõEL3}zôΩÀA‚À"in,x˝x¨DS}¸i≥˝¿Â@≥∑L5®¸∏aÙh†¿ƒ-∏pŒôπÎ)˚S·„ ˚_Êﬂ?Î>rgÓU™ã{ŒA∞Æ>óÍÈ)q∫…x˚«D:ˇB1õÀ1õÓ`œ«hÍ˘qH‰Ü›˛øj}2÷õ6ƒnÖ]CYﬂgŒ∞ﬁ®
øh:DövZ¯â¸{R≈ÁÊ/íI(√Ù„äÃß◊‰Á÷¸Ö˘√ßÿÒ|…=ÓáHÁè„oˇhî©î;o™f	jUû≈˛PÛN)2”)î¸rÚ;≈ôX‡‰ç›†ˆ.∆GÂ9åºØ0ò˙·_ä-goHjÜ1Ÿ&≈GØ∆‚ªËè‚uµõŸMºÏ€ÒásüKDÙB™ó„MÊTe—ù¯wÉﬁÓMÎ®„u›-±˚U≠Ω-lZå¶‘(ÄSÚ⁄ÂOÂã)`Iáá¡m˘ΩË£¨ê˛‚çzÒw:ÈrÎ+Z™R„˝J¸éıÛ
‹9ë7≠‘ﬁö≥0©Éú„frëﬁh«wË‚õ8RiõQ¶œò˜ÿ≈+â∂…à¢xw$Ç◊‡6ÆºÈH‰°åCn”QnKÙ(ûa¢øÜßºÛF%ˆ√˜¶7Ó®7sÈïôÚ†r·ÉR¥a˝Ω¥:∑⁄—C&ÕûvÓ‡®—e(q5ª=9`“&„˘–≠V£˘dÖÑÖW|ÿí9æÒ“‘ﬁòå∏ÉOÿ°.y•{Q'é°÷v%≥”¿+{Ã`P™~ˇ$Ã/g=}`=ÚÅ¬>5K4µX°≈
a,Ç£ú∏»´@¶í…ﬂJpQ]Ü‘pçÉπ?¬Po©gÌú√ˆ»‡ w2àæ—÷œ-ÒË.≈N</∆€^¥;"á [ÒT%ÿ¬∆ËyÓIv_∏™éÄ'–)◊$Ô‘Y2PvÔËÆ®1v"Ω©Ïñﬁ˙Å‚Ì†ÉﬁπﬁE¬-.‰∆9 7„aóÙ¢‹#gv!^]Bg÷WÿkÓR)w¨⁄>ÔbsÜ˜ÙCCœí›)Úöê#…≤±°´f◊}‹ëõnó}îE¸†˛ÑÉ<˘iSƒ–îsÓä∞l·ñ∂∫ﬁ,ƒíºVX¿≠aÜSy≈"Ω≠›‚ìœé?ìÀ>Ô‚Q1´´À…úòxe\ôÿg9á&ˆ)Î÷‘~∑&>·‹$@°Ë∞è‰d…ò…ãH¬veÀı)b¨x‚c.ë?Ë†∏ø˜iˇå¥∂¯Õ◊§svﬁ#ùû≈U_©ˇP7%>âR W™µ01ÜdÇiêÓ˜yº$≠Eô≈ÃäµìsÇ@Æ4•¿3vù.Ç1I¬ÎíGvπ˚ˇ8:¨r)µ\°T[òÇúÙ˙GúÄJ&Gs„|B∆ßÛŸî:±Ï#mê7•°Ê∑$S,∞∏ﬁuÄ[! sˇÿkÒz£ôFƒÒGØö∫ü5ÅòØè’/èıØ3êÜœ}ã
∑yHu˚[TÖ‚'ˆb‚¿˜np≥Û2q}ö	–Ùê›ûÜ˝ß1§‰é^AÁN®ucÑ±¶ﬁ‘+€o9à∆œª˝;Wx˚∑¨)Vå5È˜q¥RØ,Ú.»0¥ïõQ_ˇ‘êÁ)Ÿ≤yxÂ∫)ÚﬂiñCT|Œzü“∏ƒ|° =—òAI*_Ù`*˘ÇßQ;∫¢pKΩúÂtˇ®”;?Ë/QÀ@»#¶Ks˘\E¯oÒDìp^eñ«üˆœ;gKŒÛÉhJR¨ …∫òõœÖ3˙Å$ôµ©˙cÜ$j¶È∏§
µ4=6?€(û‘-°˝ﬂma∫πó©˘Üî$F∞Kw«Æ…/yHÓ5Fß7Pîüq+TfOãµ*ì∑KÈ√û÷U ÊïìÑLˇàÍ S¡Hq"Â‰Ñt⁄›ù∂4é∆Í:ÄÂ≥hÜ›ÑÅ˚ı#ë˝ss˙ı%vÅ}˛øˇÎˇ¸à›2,kyñuYn•Ù^≠UÌ‚ŒõÑc~®Ó„Ÿ¯ãø∑öÉ7õ-tÇö%}0055ﬂÌ≈®‹®VºQΩªW©-≈e"O¿[Õ1$ÙÅ˜>Óü=~Böû†/v@Ù¢≥¨gûÊÔÓ’:|`âÎœ¥∆<p0PXT$—›¡`äè.≈’¸ ÌM≠–ê¨ÕØ‘&Y˙z≤#ÒD@£˝AÄíÁeëtV^ÿﬁ"â»Aˆ:«ÃEı@`â(>á¶¸ SÕee˙[·_2Lﬁ¬H ≥˘ä	âÒ}∂,‘-"äˇ‹I7ò˙◊$'èÒfFü(ﬁ$¶ñ$0ﬁ¢Rû[•ºÍ√9‘Ñ‘3•‡[~û:~ïèp"Jqiz?<çg˚˚«›„O4’·CïÅÿ_[ÅΩï´OP]ˇï◊Ëß¥fΩ¿”1ªÂÈ|j‘ê4≤%∑™ºdÿïtŒ¶˝Ÿ†ŒîÿÚº'„g0Ñœ¡s∏k»·&Ífí‡7åÌ{≥ªlx ü€˜Ê|©ˆ›¬¯>≠8ÎsfpM˚ìòxìU7xÖÈDMxö5Ó“«≤i∑•\oÒG6ÏÆíœBLÌ∫#oÜÜ¡Lsˆ}¨ªÌø¨ªJ7<—_ÔoOJ≤‡y˜:Îû±A¸∞!ã!À[}>C®ai®á≤Nöº—
)ô·PˇåºìÈç∂eßÕm…i∂Pì8mñÌ$ˇﬁù‘Äiºc(+À$Fv!º§4CI0´Q[ÓE⁄Jƒb-∂x≈i#E	n°ã‰]¿nU¨ofÆÖ)µ•Ò™ñPµ”Ôˇ∫€È}ÆºOæ]]–‰ßŒ/› {¸˚»Ü>ü˜;«ü*ÔŸøèlÏ„˛~Â=¸yd3;›ŒØÚKß◊©ºOø?≤—ì”˝≥NØK£°ﬂK?;÷˝√ŒÒ/8PˆÂëÕ°_Î¡˛n∆ò|}dìß˚ rÑÉ_Ú}ŸFÔ∫ê‡xÖ0Ñ9 ¡7‹}¯G⁄=¯%/;æ‰À_”©Æyêóô Åâ?®°t<‹mΩæ8\ˇ^bÍìÚYÀ-_IîûwÌ{∂Ïè—´–∂œ≠\yZ≈aÈ‡…”ÓÁŒ9Ïtèü@	ÒHëêµJ≤:Kéø≥)¯!ìgôD∏˚±—\mï6ˇ˘z}›$yû=‹L"ﬂb[Y&KPûP⁄]«˛+Údπ˚Ÿ˝•uÆU¿P≥≤º∞ç'KäJ|ˇs
ﬂ,I˚ÈÙ‰™—‰/lPà‰µìÅlU˝ÛbÂé‹·9à˙/§`,˜8M>O˜G0Ÿ¨oë√ìOäŸÊ?ªù‘tsz÷›ÈÏu…*∑-<‘äS:ïüÁ˜6ﬂÃÊ·ÃˇÀsÈ/=nÒ¬Ëv¿åAN˚ÓêÛ$¸à©tbT)Òó∑«3≠å(tñ$cöO”S ˆ#n}ˇΩ5ÖŸ$8õ*·YñØeQÚ®üâ
;ŒË⁄≈‘P$ifùmòi+$b«gyô∂’U+i˛é|ŒwOR.…áÈ˙ZE∑IÀ∑∂ñ≈·KI{ŸkŒ˜G^ /Ÿ˚ñïÚî$#Ø…˛⁄1Á)Â†?^Ióma¯|—*$NIÌåÀ«Clbâ¿á3O/Ü{bÉm|iâÂ§©Gm=3ˆ≤ä≥õ_6≥
~Ã˚ü5≠n<tˇì⁄OªˇÏ‚·Á ı™„ÁÅí·É%s€4a…µ…´€”wYnq.RºÀÔê"‰¿Ôó«ñW≈ŒmÂÚ≠¢˚‰4¸|[oΩ¬+_)◊0
–ΩháÓ‰≤|%ñ
=Õ&¸¬…†æ^à⁄ﬂ}˙å9¯¨ÉO	Px7^W®êQ¥I.∏ã&Ö£‹q˝˘ÑtFétπS†ıùÈNΩÇè◊l∏–æï^©»º¶4Ãmv˜b≤Íebõ?Õßﬁu?0≈§≤ãW€ßs´$⁄¡…‹wÚ'GPS8ƒ˙–ûÔ«6
VcñÓπG8ÔtZ6T¡4∏¶Z
ùO≤Øå0f>≈˙ëb≤ƒ]}”∏	®ü:Î:ËÙ:«§◊9‹;!{]“g˙'°H≤]u≠u%Á®ìèÌZbV•	Ø©à!˘ vMgi>n‡∆∑Æ;e7Ù¢¸T¿“ΩÀ=º⁄¡Â°•ßQ±ıZÏ‹cpÊ·›h mœÒGy§œÏß\©A™Ù* ûˆ…™îi»û0ˇ¨ó:ÁŸg8”Õ∆FÓt:7s<´Äó®√¸cE≤P;*ƒŸCòäs{«≥%Aï19◊‰k≥
¯÷ë˝Còö«ÛÌ;ÁPÁ‚Îb@£‡îÇWŒ"3âYô†«å&f ñ<æzOX⁄ÿ-ûînëÀ5ÿıJR“-=◊kAÉß©)®ºåÆwR&Æoæ9sM—aı%Áé⁄—$ﬂ°€ŒÊbÎ%ú•ôuÊê⁄õÿ]Òß∆4^E≠bæ±\Fò7èﬂ ﬁP±≈≥O•ÇOÑ≥EÓØ0ùGº;Q?|ó/§ãC›õO0[•öù9bÄMìG"?0&Œ„hÌ†ùø9'€|◊5˚Pò`ﬂqa™ˆSéi¨¶a\áﬁà‡ºì:bwƒß?◊Ë)∞s°˜˙b“4ıÏ>ı‚Ò,ı9¨;éÜ¶ΩÖ≤ç63∞íÔ.á°ÿIrrLÈQ¶Êê!¥ç»’i†≠z∂q⁄˘*õ•I¸í¢Öìê1SK∑ıMêQ6ìï§Wí[Oqë∞btâ∆°7Ω©óQ™ﬁ3ÿ†÷õF4DLã⁄\!mÌ6Å"ùB)â6ü[JJç7ä≈ù7I4vÂΩ<ç∞,%:1∞.õ6Œ• Åñ%≠L¿R≠|1lfWAu∫ós√:kàù/;«ÀËÅP<Âe◊ΩÚæsÎ¯Y¢¬˚›°Î}uG%:/\ ‚%ÙvÀ0el[Dﬂ÷LS⁄Q‹¡©:5‡…zùC€»dåì‘rÔ%±Ê<à•‘‡-á€(EYæ≠HÖ∑\Sô{;„ﬁB;<>O≈ä3ﬂã´R©]4/K¯ÿî`ÁÚ¿¨f˚Û9ê=~Ö°¢‡ä(wŒQfÑ_YTö…–¸5JÛ7J–|!ê€YïÂErﬁ›@ÌSÕ–Õß§¿^LÑñ%?Õ¨(†ŒæQ’ﬁ˘Q˜c)9ùJÍπdœÑxﬂ<Ö®NÄÙ]≈N(…‰í†>sq√$ùÒ»õπ◊¯%äù+‘G¿6áTyó®"cqá˙i?O˜ñãpy^∆W[éÕ◊YÎª9øLÓr›/˚a◊P-Ω•è´ÇK˙8A¶‰…CÄŸÍL„öwr®z—@ÅË"˘ÓU‚ úæÔÃD3¬Ô¥{Ω¡Ó¥Àµÿo KÀÑ
¢2bÜd˜≤y|K*‹à™ë,Ê¶27¨µ]^[‚ˆ«¸fj8Ì?∂•Sw¬bı¥ª[‚˙º¸÷§{¡WIzùn?ò’Á≥«5Nd~ˆ8 Hr|l¯I€ï.ë.√è\•˘%/Ä-n7πäPe]J‹ÇX`ÃΩÅOå≠‹=|≈ÈDÕ∏ê*-ê(u5ªb»˝6sßëªKØã⁄&◊núp€˚“+÷l—ÂV•Ób+ru	^_Âçïâv	†êµL,√‹èTP0ßÍ29Ç—Q>“#5È€Ó÷ï*2û_G*<xü◊ó+≈aÂ¨¸•ÙB≠z![ã⁄}?ö~(•jõ	U3zöµË™†∂Dˆ:∂%\0R4E≠%5E…ºÀßP6kˆâo≤+m“·.QzTOpÑ4ﬂÕ¨1úf≠ô£9⁄M‹Ÿ!ñ|Mó9RrΩÔ8«RâzÀªÅÍ™ Ü}ßÄVÖø„3˚.5;·ıù‹ãMÄ
r]IîP“âY!1ÚW›ÈU¿ûj•“OÜ¶_í∫)IŸaGQÓtƒIü˘Çî◊…ü•≤4=±/À†‰i∑§Ú$—_Í/åê,ï¨-æ`4≈Ÿå4óÀ∏¥ú3⁄sû‰’pˇ%õÂÀø.sY"˚xÚ•¢Ôì[îSøEQ„Ω ¡Õ‚KIlm¡qâ¢Ω$<(ÖY*˘≥!∫ÇYYKTxôY·uh˙EfÁ-úoT≈{™ñ}=Tpf™≠S≤⁄M ï^'ﬁx∞¥Âì⁄ï˜–~XB;MÀ«_ΩóE∆EÌ«"◊"©?bk>‡Êx&ÃæÉ‚uëoÑıÖ·,˙ùù√}ºlÛ¨{º€ÌìÛŒÒ'B≥Óì*ÕˇCìÙ‘ ;™«Éª⁄lËNXﬁ^ÒºÑ&À|≠{ÅG0 ™$˛ Ö8+Áx≤èúXßóúπ7Ó›ËR«¬S™ITºûû“•0’ﬂrÈHøw"gª‹ï7±)PÕπôLÑkT’…Öﬁ¿y‰¥ªÀπ∆ V–â<úÒ38>KÔR>`9À«‹º˙|È≤6xÍõŸùQ){-äEiLπkèC…√µy∂ãÀÖı¨K>Kˆs∏ºmCÿ4ö©«ÎEk-ﬂæQl›–myÓ}èπÿÌIå¶äƒˇq-ùÜ¡ù{Û∏6‡ëÉá˘q≠∞XÊGÕá‹÷◊7+ÔS#…ÅÏƒ|\∆0P“‹À|‚;cR=õï0b<WÏe9¨F®cßê±89<T°]„©¨˜ûr#o©+¢ÏçPÎHË\9≈§∏Å*€'6d	1.G¥¢/c~X¬¯`R%“ÓåY@˛   ˇˇÏ}[oIñﬁ_â)hU€,ﬁti©F¢@äRìCâ‰≤»ômÇîd%YŸ¨€VVµƒ·∞l¿¬Îı0∞Xc0Ä¸Óˇû˛ûü‡8q…å»åÀâ¨*âÍf>H¨™Ã»∏û˚˘ŒÃoFW~a}B÷òVcNC4@gà9ù%cFˇKï∞Quçk‡û‚®†)A¿XırÊ≈+\ãÊëG0®¢∫ÂØZí¢ú	Ωé∞Ü}‹êá80o3YÿÏ2Éí ±â?8{›ltV\Çj–sõêœ˚»K1	fB%ôSê	VC_Aÿ3o>A8Åm8·	æ 6¡lËAAG(X‹Vò≥/ëC‚≥Ç6úâ_^åB4øEÅ'x\D'X”–	Ò7z{út¢Ky™gF’à[†‹ŸÁòπ˜B@∏Ê<fcú∂„·õO'Á√°â‹fy∏‚g‘V˜QquÀ®VÛ∞¢Úãõ“lñTæ‘≠ôó⁄${∏*&ó∞[≥î*ø 5[`»ÿ™ ltN6X˚≥A•–ﬂ›˚‘at8WfÚü¨Á˛T? uVΩXÇﬁ˘RåO}V_J^úeÈæÈw®≥|¬,-d/_E£¡ms´HÁÔäVÍlú$=“ãFºÔ"Ô„4∫ä∆Ñû–.s™®ûbŒÔÑip›r`l®ñçg:<Îz∂ù'‡NëpXAÇ”Ë∂ÂQ˙-Dn¢»ï(w¬ÅÖ≥ÿå-í·¶ø•≤VTô|ej¶Tƒ ‚T+¯∆ËR1ÒkQv¶1~¿.w‘ãö!aQØû¿H‰d§aH`ä¿8¬È'8s±Ë3Oò¡X,Á$è∆Fà ›§	e‹∞ñKIÍ%¢≈È˜YáQÛbÀ©îm¯*·TÀ%õåwV«≠î7è±xn¶ì∫â/†÷D#™-?„ñzuﬁyuÔº∫¯V2Ø.P`r˜ô∏3ünñÍü∆pÁ'˛%¯âáFÍ‚$∂¥pÁ!æÛª;ˇÎıW+åpÁ;^úÔ8¿äÇ¬˜„‡/Ä‡ˇxP∆Êùw\iÏŒ;~ÁáÎŒ;~Ág◊ùw‹Ú„‹Ω„O>Øw<ØÂ(ùfÍñª»˝äﬁÌÙè˜˘˝„eÔòŸ÷¯BÆr)®¯…K‚Z5”+~XøN/9ÍÎ¬´K˜Ëfj≤ø¸4é'ÑU”UºÁO7	]”¯pß†âÁç@‡è¸)˛P·ló÷‰eÃ…ÄäÜÕUxÂ˝LOQg<Å\6Á˙YÅDìQ©¬”˛∏ˆ2Ì@aZÑ”ÂŸı5é¢≥dr’"´K$Ö∫jÙØÂ'…Mq—">⁄3kŸ3kÂLÒ¬œ¡Nzyº¡^§” øap7"  ¿ßuXih¢K’¸’ü∫ÔHÊAË&ùN\¬t»%2Ófåó”…ptHß9∫àò0Vÿ'≈mT\√QÛ1Ùu–äR…˙[ål–V–Å€¸¥{ø‘€Éó≤?Ÿ|∏©¸…†3Ìí◊›òNO5õÓ}√Î≠2Ø!-_ﬂˇıÛ®óö]¥öKßÆÀÊœP∏GÆ6JrUr <í™ëö¸Ω◊ÕÇ£MD4;∏\%´Yío◊+Æí≤MΩ∆Q]Ûn(s Œ∫9í√Ü<sòÙí.g7Ñg|å(»∂ãÿ†‹)êÕ¡¶lÛ–’å‡5¿ÕLnø*b,^£¸≠ı~›sÔRø
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
í'=í"¸´8p©ó∏É‡^P˝p–ÒT7©Y‡ˆ°ßi2¸ˇ   ˇˇÏ}€n„Hñ‡{}E¥∂¶ uYÚ=+”ï»ó tŸi´-πj9âLZ¢-¶%QCJÈtªÏÀ∞ÿ¡ŒŒÃf—`±ÿ∑}ÿó˝û˛ÅÌOÿsNDêA2ÇJ≤3≥*ŸçJã„r‚‹/∞oÀk¨NgÇñ‰ön§™œÁˆœI˝Í√<ÉMÆoëuÓ⁄‚ZÁV≈ Ñ∫=qÏãûó–∑„eÅ${˙ËπóŒå0º¡∆¡'õ7÷ÜÊ$P{îÉwìõ˙Û¬E¢p∞íû™∑b^^3D£•Bœ™œ*3s`ÅëñvµÆy0¶C6uëK°ç“(@2iîR–<.c¨≠≥úˇz.b2Ø@Æ«s.[^‡-ò4˛√+O[{/õÌ”ÉÊSä€X¸-|
JÚ∂ˆéûÔû6O`tª{€{Ãº05#ocÌö`U}W˛Ö˝ˇ˘oˇWÑµNˆ∑õª˚¨z/4€˚¯
kwö?X€Õˇ∂(∑{≤◊<‹oCÔl{Ô∞yÙcì˝¥ﬂL~~∑y‘dù&<}ﬁ<öı€ÒúEGoNˆˆ_nüû¥˜p‚œó{G∞æÍ˜,Î
Á2,πn˘é#ÚÏ¯¬™ó$è–«Ö˚õÿ≈"~’.h¬ÇWU}W
t‹˜ˇRN≥⁄U<]úk§y¨Eﬁ,5íWMÕèaÖùêJP◊rS'ÍËaóww]Ü8ró<Ë∏§◊¿ç´Ò*ˆLKπ≠;Y\S›$sºZw÷¶l1ÈŒB∫ã’¿æœœÔ)‹˝+Ù±¡ÖÅÂ!æ+Ètì?tKóo7ºQw0Ö3T≠åù…‰˙
˚ +©irâı«‹Æ7®‘ä◊ìÀo TEæÄÈ´(§ΩeúËoh„nüﬁqS}ﬂ¬$X˘Ïw†W˜Çüg^8≠bﬁ|:€Ú´….|˛ƒ”<ÆöıØò›•úÄÕ$⁄¬øÏybe¡ä^J}LÄL—ÀÒ9ﬂJÆrˇù{¨s›Ï?/!≠–C.W‚«–”ﬂM=‡⁄”ã`0€È{„∞Tjløæ
ú±»7úƒ•U3íÈ‹Ì}∆^U2¥∫≤ƒ*2´x~èw€”p∏GŒqxg€ÉWŸLv:ò 	«{áé7];ï¸¥ÿ[iÖÓ„ã/a”1√'@4™—˜ü;Ô<ˆ;;}¸…K«Pk¢";HEpòÓïÉÕ&ﬁ¿ÉAÒÔúÀ‹’xò@müE˘^ªÿDr≤è˚-r1ø”4å·PRÕœ•§:úìS¡+√≠ƒÎ_Üi¡Îûº¬º(Õ∆¿»IógbîOœÕ»‡eÁu◊ç2•Yô•ãY7§x!Ê`p≤dräù¯LŸº7œÉ◊\|^3Ú>xY$~.ëvˆÊ≠ZZ≤1…¿Ïlù-bùî ë‚abU≈◊≈õÆ¢Èƒ˚j±∏‹V≠u…N0sè÷kãé∑“FpﬁœÉ»ë^Ò†œzøã;j√ı‚HI≥±ú_EÍBk2oﬂ^õ3êÀTØ=A«nÌÉ$πTpË0c@˙ÚTÊπ
ÏYã≠}<u^<q11¢˛ƒXu˜de
g1≈”ãª˛`‡mÔ¢¯¥ﬁµQ/√<^≈â? ‰ä±-€íàÀ≥òçïi/ùfíRc®X÷Ñô)ﬂgu·˚3•8qŒ¢ﬁfÜâ˜EëNú∆äø√ªπJ!•¶é”sÀÓmÛßî2SÚ´§±í_—∆m·∫⁄Ω#S’„úü>aXt
˛ÒÕhÓÉ≈≥ÈlA	`¸—œ}◊(˚]JW6Èp¡†Ü¨”~ˆ˙º˝;^≈÷w˙ŒπÁzØŸ´o∂∂ÍW‰A[áépîcoTÁT˘ıV⁄dØ6˜F£ÇÊs&=≤Õ¬˛ã#Æ≤ÏØ,
¸Ö∂&Ø_m’ëL¡˘îÈÊE‡áaöh&…˛ÃÙí˜ù¢ò˝ƒ(frﬂæêMˆÖl~!õ˜E6	◊Ïz^∂∫Ì°◊ØqÍ	®„x‚ÅﬁÂÁa∫cB∫”wªó;^–∏wGIeÕÊØèñZÀ©ÅÎÙéGÉÎô®3G÷F}ÒÆ-gß»gˆH~N\ëJIS>Øıó_¬AÊ«¶g˘Ó¢˜òœxAhÎ«Èp‡ÙU◊ÒfﬂCÕàüÏŸ¸ªgÚÌ–R⁄†§2©:≤DF≥còíQ1Vq1í-Slö[;˘Öô\,3ôv/EÓ>m◊Â8˚ÁÅ+¸ÇXıx,úts÷ÊKlœ±=Q≈öœ%∏G)√ìDú˜÷£KaÀìè∑¯-Û◊ﬁ»2*πê	kΩPÙﬁ§b3˘ƒÇ{òç-ÀRZ«jzV˙aëÅw‹aﬁ’¢ÔXE¶‰õ¢≠ÇO~XÒ•;Ò{ÆﬁpóàPã xbGﬂˇ|êÑ:Ë˚¸‹àâ-Ò(ÅwöÌïßùÈ»	d≠BﬂRù(~8‡sX$¨^]‹”Ø	7ﬂæS™—s‚^∫#/Ø:œ!àÿ◊ç¨™õ·ÁÇ.TwΩ{`*æ âî<-∆lÏäﬁ™˝Ò;wç50ÉÁaá-u(óçÀËLT˙”p*jß(R-'P#/2ï55‘
Î˙É:&ä„¡≥—Øµ(gÿzV%™$"L•è6*KÛBhiXÛî/Xà'5πﬂ(í•HG)Ù˛Úß¯≤ŒΩfóŸ¡¿sGØ‰¬>éŒ–^≈fS«LSQkÑsÀπ˜z£¯⁄NC“õóŒÂp``ˇ¯≤¡∂ß=èµh˙µ¢èjÈáãE†p)ÏåÔÛ´‚,,ª3ò§„yî#"xÕ≠ÛõÉ†»C∂†‚2äIly’“íN$™¿ÊVeˆ<:6m2—W´´àıh÷°;Ù≤fû0ÕG+àÉäpÕo9n{}Árâ]"JY‚’ÎºQ8¡Öa◊»…°‡"yﬁe¸u"`Äz1:ëcI=0ys#wæÜ†Öãa÷(ÊàÜú<E|{9"”"#πRSCb¶‰±í%Ô’⁄Ü)ª√ö1ìø…Ï‹˚wwMï˛ÒˇJ™ƒÉ)éi!V+€Ld6∂ö2ñ≠gıÉ{«i…
Qpiå/«]€œï˘l∂ùÖñ![ªk·„S≥‰ÃöÑÕ∞)yíE*»:1•	Wˆ…Ì‹n2a◊3ˆìéÈû©õØÎ∞è≈t◊q8§9ÔV8óxÕ¥dAŸ˛x≠¶Eˆ8·ã¥¿ª|çµÚjµZﬁõ∏É6û‡x 'I
¨Îi˛D≈R<˝”¢ïx¸;wƒH&‡ø˝≥dFóK"û¡Å&KñL“/º£ _;WªzJÖ√v=ÓÜÀÀÌ¢W`Å∏eâCJ+ •0ÃÑ’˚îµ#€∞'¿c:ölÈ˙®êÌ ó>A…_ÿ£9B…K±_∆˜ôsñ
yPõZ√:~N-¡:õDo·LœΩ◊˘›ﬁ~oèzLˇ∏Á^GÜióò!˛&÷&·œﬁ§_≠<?9>mΩ9h∂∑èè∂l√¸ïœ+›.±‘È>ó`àµ∆àµM	%MÅaƒºﬂ7ùìø®Ò™=Œ4Z˚ ä‚˙»óH„qZ0(3‰ÂÖyôÂ-+(ü3·éTQ…:…Òÿº´îgñãa˘ö@öeﬁ+†(ëÎ -ÕlÃ ≈Ë˛›îRÊÃ√√"ïV…t°ää Ÿ-˜(∂§ã‚»óŸ˛ÆxT+Q_˘ÜÁ/9t{h(4Ô«†ân{:Ñ‹∞1pGì>{ VÚ˘guË∞cFÛIı¨µ∏ˇÇué;ÕC∆
ka~◊ΩÁÕüõò‘Uƒ∞Ê¿áAyÏ“eXÁWN™02¿v:‰:∑≠úgíõA.4oÒ‘æ°	æ˘˙:‚ﬁ1o#∑ö∑	¸ûhb3ºh≈‚Â&Àò(*µÍLvHE–Ωﬁﬂ=¡	Òp±m?Ä≠Ë’nŸ’4æ∏C«#3ï[∆[g‘áƒ¡|ˇo¸FÔú°3≤+´\¶®rûSP¢?Zı¢;ÀB	ú^æn˚»Ã/‚ˇÈÔƒ#ê√—$jÛ†Ω/Åø›⁄kÔˇ∞0#\ßFL@}6HOÇ –gË¶ ≥B¸ÒaT¶™0√bºRﬂ}Õ‡W‡vΩ1≤·º®wÔ©ïÉYïúpeqÙ ≠"‡näÊü9∆Ì‹f9ú;¥]é7d§êœÜè∆ˆúUÁ!s=≤‡m¨fìÓ‘8ÓyôÚx"ÊO,ÄAWÿsª©îÊ÷EFaØg7ïŸy˜ÙV¬˜ä∞Á÷9äè;ÒÎ8`œ$ˇø-∆ÔZf4œ2∑í≈ä∑/dBi±aú}∏÷≠Añ√†e(ú[§ÈGüT–
âπ'üa´î¬Ò|j¿”O¶¡HúO´’ê⁄?Qºªà&/Ω/é2Á}<˘]™z‚bPHΩ·˘zﬁY3jPçg±§éi…|*,1rÅıd“ôÙÅæ~®Æ,)êS†\ ÁkÖ´(V‹Ç´–î…Á"pz‰ıâ_?ÿy‡#ù)ôÊﬂ{N›PÒBw0†,Ÿ@àKkIΩÍz∂®º≠RI?ﬁd’p∏E≤¿øs+ù¢uùçœ–á)U05“[…0®å ∂(*;oS÷õ™⁄Z[JÂ–80‘ˆ[Ìíf(´QÆ´Qjﬁ,ÚäHO™ƒ†¥ÂPE*¬YtÈgp¶/K¨
’A§Ä>w©</B*∂üKn±UM˚˛FfÊäYTS=∑‘º"πObõ¿u6˝˚œ›dh™ï∞£|Œ ±oMÏW©E‚jπ•VFà‹.wãÛæ LCï3™FŸ@√=Ã$*à•(	G2ÉÏÿ˙lñiöü,º¥gK|iÅ™h≠Ì%ÌhV˘≤’´L2lı*ù[Ω8C¡ßøÎˆ¶T(Y√Õ¶ƒF•ù˛äÃ §„»âÑÏR˛§ªÁÖTfà∞ûû^…ﬁgK-_3%äØt∫!ë,(=ß≤› p—,^….lR)≠ÌiD≤÷Ù‰≥Æ±.:Ú0 ∑x>%∆çÚ‡ä{ﬂÈEø^\º6£0,—á–˛@ñ£¶ˇÂUp˚#èUÔòÿd„U/{:P·ÕÜÓÊ@vK†°FEt:Å©`ﬂ)j+Blâ…îÍy>§6J3 ¥‰\ u9'2+É J 23„ºfã≈b»«Gbˆ(ÏœˇÚoµ‹—¥ØE_∫#fè≤ "¨≠
‰óÕøıù¡πä‘Whü-≥µôX¨è∆¡%&¯ã‡ﬂí3˙upo:óàXµóí¬SòÉ/6W>∂N`ƒÕïø˙ÿlôµƒ]ú/2jô_)uußÒœçR⁄ÀtﬂfñbÿÕzB[©£’⁄,%a§äÉÊI√YÂ)˜{êûÂ¥,˙!$AZ˘>∫Ï<ÕßØ)ã2√ôC9Ûlì‚grG{1pE{§@_ˆGÓO§&ﬂÂﬁ‹w¥I¿NPYùö›’ú¯î≤6ø≠≠Ÿb’∆v˚≠ª'c∂bë“[Ã·,®gµyŸ˜Ç˘†@î†JÇ¡◊7IÎÈûàªíé≠•"Œ)….ELß—Wø\ªe∫ëÄåR©û5€®˙O˘%¢ìø±Á
0≈v‡:ó¿W°ë+àΩ=sãÇ*ﬂ2ƒÿjˆãÌ®i#n÷T"–6(w*û˛ÂOˇÙüŸâ7Íz<»L‚ªƒRm-ÌiYL9àeP_⁄€°!n∏=’ÒVI1¬ÁÒi°<	I(ÖÄ\YÔ◊72î.∞L‹w¶≥ãgóW·¬ê∑#›[bŒ~ÔC	øG9ÉÚπH“◊bó&¬Ò√≥
n<9ãY`S}ÿÅrÃÁI±&eπª« 9»7ä}2ÏméQøÈüP=;âßXq›¿É5®WQ”ˆîúÎÿ:]vv%MÃ‚-Ìö§.˚Ò©>∏≥|≥îÁâx%*ÈH±3√	ÓNÈ’?Úáﬁ»l¡zL‘§øQ$≠|¡W∆ºÏEöÖ`u®≥ß“”æyï˜â|FE˝ü$Ñ˛ëª›ÑÚ/ÿbåR:Øª£¢*˙õ?-πÉl¢JœÌu˙^ÿÒÜÆê 8≠–ÿ”áB¸’dŒ¨lÊˇ‚;Éã≤·ê<∆Ë∏{¥,˙%±∂(Fã1√œ/!`¯NÓ¢GÂVìyÅ
#º¢Âé0Zi>L^ØÁ\∆k~ÀXnØ≤XºÑπ‡G‚◊‚È¥‹´V≤ä(ü…´*}TVl„WÓHH<√Øæ%ú™”d_Ø’€Õ¨eÈÌ*â!K5∑â!)’©eC´f∂å€Z~böÇo°íÖ8•ìRı„Huú˛Ç,%2ß»kAT,∫õ%ìäE∑ÖU‰5Kfï‹Ôœïe∂ûm2£Ã÷sQÜydJë◊¨UƒË›y2s'?±"∞'Óyîs£z‡è\ ì o{(XU√Îf∫/ù—‘úD·Íhî∂dÁ÷çŸ’Ì‚ó}&OyÈíqƒa˘∂d/ìå√¢íç¸ü©fc˚·≈ÚœΩü4S€.ø&°Íê`çÁUÌR*X:ª˛,8 ˘«Ã‚3≥_¿Õ©˛∏UœùAËñp}(	ÇïJ	«
kß
ªñb∏éïB«ÖVü≤eˇ¸∑ˇU§z†ÏKªŒ9ú<â5-ŸD{wKN—V‚õóZÂ'í◊°F˚√@ÅæIÃHÏ‘õ7/õGßÕ√7o*v)x‰ïs∫&¡¥Ã·∫€„U*∑èºD8ÊêiOÇô™%'ª¢ ËÛsóJÊÏÊÊ‚	ps¢ÔFO¢$Ï≠˝”NÛËyÂsÒıUwOŒ™\…åB<5»W[Ê ⁄íﬁ»qUßﬁ≥∏(⁄OÙÂ™ÓÃ±¯…∆gïüH…ΩøX≤•ÀXg‡ìRÄ}j"y›Ë∏ıæÀÚZ’«ö”NÇeeòLCˆz‘‹ﬂEYòüä∆7ï€ápª%¶7õ1∫"Ïˆ]DyÄ1€¯Át‡¬ò¯íPøKÚ¿ÖKP†ÉˆÅX≤B#∞ i eòÜ–¿Í N~"äWw…=ÆÂXevà/ÎxxıJ§Ø¡ô´uÕË7·√“ö…W¸e’Œ[iùˇX¡ú5JøòÆÜ∑ÑïÄÖ‡9lÃ—¶∏íÂ"JÀ%°ëWåh{î<Ÿ
oÛÙ[Q Ö3,lá÷hZπ±ïiI∂µ„WãÀ’ˆcŒóœØÚyúÛ4p'Æ7<¸ÌbÓ}jlVµïSJ≤Á ß™v"«¡ÈúïÜUY5+ N'≠•™?π£ûèı¸˙4¿Ç^¢ﬂ¬™*¸BOG˜\¶øç¥h¸∑ç€lj¥ø-⁄ã˚P¢Ω¯¢C3È–®P ˛Æ Á_ØÌ≈]k—^|l%ötˇh¥_hôÎn∞‚ß£?{qÁÍ≥ôŒ’⁄3ôıôß_õ]Å¶fáæ4˘èö/˜¨SàßáŸy˚‘O§Ú+Ú˛À%%TØèy™Ï=M∂Ï˚˙dﬁò¡ÆTG%CMÀÉùFm´vñ@‰‚$Ô6 ⁄3Ëj?%†ôMa{˜*€í ıE[VKå–›´_≠7Êc	Ã¸±9JmoôÎı2	∂®√X!œ%ÇΩ j®æÄ•úö-Û9´óH∑©’√J6iÕ_ƒJsçŒ|%3•≈_:„-v√^]∫◊@)Ô¬kº1¢∫´¸∆˜å4Ãë”Á„uÅ™›¬¯onÀ|\ô{„‹ˆún_Nw~ß⁄SU¬‹Ñ¿©™ía‡£kgFÜá	Væ”πÅOQa∆!©\gî	8Z{\˜◊e9=∆íÔ„à„QføVX©=*C^	äJé;!
ôÜ∏ˆØ^◊ÄÌMÅˇ¨ÁŒìT;Ï[&S…/ïN´íú}#9Yˆm“p“ü¡t¡eM$ÂH≤0®ü°!àa5kç[°.Ç20‰ï0ª@¢<E≤Òı_«èÀ˚áÛ4®≤É$îG≈0å∂|/π˜by)ez)Ã‰u[*“¢7ÉÖ4◊FZÄÌÀ|dv„gÊ`£·Ìéœv¬ JLﬂrùÕd‚º;#'≥7eûåŸ.Ò,]áLâTÒzuÄík∂£U ¨iQt=Íıã¥– :Û˚9ÔT'…˚f&˚˙f*bO†∑™H|Î2†ö+íﬁã¢F
K'ÓÙ›ÓÂétÅõK+º’‡©∞g‰≤N¡™´˚ÏÌ6ë‘öbˆs{Ùlxfe\ÌÏùÌa£„ŒÒÀfgø]dÖoÙ3 ¯›ÚXnÄúÈ–≤”√¡Ó¿˘‡ˆ,F~è5V˘bmú∂òÊ†,ÍÀ"g@∫.¶X£¡c!Ã–eEXËvù¿Ç·ÍpŸuÏ@sù	y«cCo4≠e[%G1Ê^ZÀ}.3ßG”(°˜ªÎÃÅV,›1¨¬• v—\ÛFrÕ≈u7\wΩµ¯»-˜ô4ÖÚ ÷1ŒEJ…íÂWlCÒ”µT‚èœ‡1Åb#£>)Œ‡¢B)xÏ¢j˜7K±Ö‰ä”ç∫¢¸5?+qàZá|óN ﬂ˜(Û•N/ã–˝„Â˛¶“ÀmÉ)ûvOé[ª«?±”£ŒÈÅ,ôπwÚrˇàµNéøw¿Dˆ™e÷jû¥˜õáµ¬¸O7ñÍ¡d≠‚∆r‹^ÌJ)Ò7@"-”rßµMåÅ4hâRbÍcÀíN|ÄYﬂ¡@§ã¨¯8◊ÉBO5û¢Ä±lt;È›ÆyÆ:ï¬gôbqºZ|˙’¥¶ØeÎ˚Fe‘ö™◊æ5÷z<GMÏ∫O¨U<JÆ•è†bá¶ñzj¬œcMô¥_ËÏÉ¯µ‹ﬁkÖæ€≈’ºTE:bT§õfOè≥∑îr£Ö+˚,˝r·[râ	˙£Ø„/©CÈ$ñyTfÄÍ 3YΩΩïéˇﬁ¥w^ÏÌûÓµ_ÈOT•Ú>lﬂXl«*èä∑ô¥ÂÍ.c∞¯ß\!JbQÆ®ﬁÂ‡6îöõ+òr2…XàGisg‰QÑﬂ.w∞¡©◊ê›O|˜QûƒYò?–⁄›)ùﬂJÀ¸¨ñ»e¸;¡ŒÎ§dà©eøGÜa◊#Æ}ÀV…cüè//◊ß∫»ﬂI—òå’ëŸ√46SπÃ∏ë‹#q⁄n˚D}ô#pÀ⁄óÓ–ãµ‡u±ˆd.ÁßsÇì..8â3Ï‘Ö3{√qRÚ~ø.¬RFCﬁ<1s8√$◊›ÁÏﬂ.c„Ë’⁄ﬂµ‘Vù	∆=Ì√Ÿ˙ {¶d-È~µ:°»KÃÎ}êknyCu>ñ±ïÓ¸{ã$¨˛ı4ø}+Ôß3·LìºU(#}J4 ~üÖ`êú·+µÀ◊ˆ˚!:É.Øqw211ò‚[ÅcøæIå¯[∂z˚∂Ù7–à˝qO…»ÄC+È~¯5£{+ˆ˝[7\^f;Œ†KıkAÏpﬂ{˛4‰f¨s?`ìæ5vªﬁπ◊•5)9EÏ„Ì‡ ‚D—6Ò;œ“≤YÇcÇ]◊q#PXÒ7BL ≤Œ’åTn„4gÚ˝âˇe‚—`HÛÁe∆,Ä·t(œŸS& ˜ê∆	ã`…ıΩ–â!JµÓ'Ä≠ûﬁò¯Jï¬p>I|óg<TÔl%æ^bRX∞≥Û∂π]œà0ÒíØ
Âa≥9‚µ7‘EnÔûæd€Õﬂ7O(¢-˝¸Ù(ä¥ÕºÍ`√Ä¡ö:ìí>‡â9ïûGA–üz}"¥Û}9üaÆ?="?ÂÏïÔb7Œ=©âcπÇCO∞ÙVQo}£|ÛˆmôØ ≤<â”¡œC¢l£»œövâøÙ49(m©`≈µ1Âª⁄Ω˜ΩÆ√ÅµG ˛MuR7»œ¢NæÄ…[)˝M¶oŒÆñ™Y$vtè≠7U∆%$∆$oÍ«#˙*=ñ—IVÌ,˝âµﬁƒ(Asuk‰ÎL·$î ¬&b—%ÿ‘8Kôzs%Ìb◊∑òß•Ù©IÂêêÅw1¨äzB.õ◊!!:íkêâO.'>!Ïêá$Ò’ƒS*µ-hŸ≤©–i9Ó4Ó8¢Ó„LìL·Ç∏¡œèúâ,≥¬»|•˘øxCcÓØl∑D[∂ùﬁÖõÊ≈T> ∂”“Ng	w3qé"w3˘ªåﬂVÇ“£qÌ¬Î;#}5ˆh˝j∑"õ∫∂.}Ì∂ã,©Ú´e›n_€œ∂§#öÂf⁄≈tóÚ˜ ˙«‰Èπãå•
Ô/˙«c/›!·vN∂5."^ËÒ–éˆñ0~ó¿ÈÖﬁíL¨œƒÊ.±º/]ª`˜BÏK¿Ò8Ê´á”∞PÀ¨Â! ëZ√jÕ
]âÓ'°qÅ`ñÑ≈E˛‹™+≥'ÂH‘éJ[€7ìéCê eÄêæ3väU¬÷J^ÎÑÂíE$rÏ¿“¯˝-9ãUV›m’p2¸˜ "√Ã*Ü]ßjéÂ1{5Û,â(Tπo¶L3∞»YﬂñŸ9‰8‚N« «ÖL,f∏3ıÄM(lZòg¬ÆÜ◊g{z#LœPï©:Õ|ûÁx∑ÖucY€ù }Í≥vÎ ßsÊYıh>ºªI’«]ü·Ñ‚ÂW}îmœßEì/D›-¥‹ a˚®˛’πóD\∂≥9∫·ƒ?©¨4V¨®tuKV∏Á¡©òé.ÊC∞tËó‡\î†ˆÅÎÙéGÉÎ˘6áÇUã¬:≈á[Ë°@ú«£ã%ëSê∂Ä„kÙÑx	@ô Ó	AeO†Àî˚Ûø˛/ñŸoûDh$ùXå± {+oÿ_6!4Êä`·¸Éµ´á˘T∂”vØª%‡Ryë¢›‹¨ôìtåí›J%í‘OÛ{˙Á˝èå{GW’p
w4Ì˜⁄ 	ØVFÔì˙◊¬…Ø˝˝ˇë>ÿ¨*√8ñ7[í~c˛OqÖﬂ”?ˇ˜øc ˚nÌ’LÖX6∆	Û‚XnHEüä%åK)æÛ.`”óÖÑçAK=èÇ3‡xù9*ô(k†ÏÇ6$’A8Ì9§—"0 §@P¨d*Ö∞-ö|a)KËâ.Lò0??ŸÉ˘Ã«›eå∞wKGˆ‰/Ç`˛UvlüD'∂≥Ò\Ï-·Ÿ’{rÓWçü≤2#”}MfØælSRò]ÑÿJ¨n_µp€=C˙7∫v∂
+√≈^É9vcÁuòW3ﬁÀqΩı ”˝í»z≈rU≠<≠™=P∆ÉZπrÈ∂ûºÉµ,∂9¸‚Ñüé ÿü1hq;ª§ âÿ˚›ÂÎ_B~É;b„ ú∑èv⁄é»3Oëí™È .›(6©Ì/éÅµ:èñß±å¢_´ÊWf&4˛Ô=ám;£KVÁ6Z√[ùtl¥·ÔÊ0’·gf:∆øåC\î.ÂÆRI‰ºg*	Ç—€mÈ…¸aèÊÏÿπÁz∞â«ßù7≠ΩìˆÒQÛMÁ§y‘˛aÔÑ}ìºﬂnÌÌ∫S˘-Œ˛U'J‘•Ì?'	ÑmW4§Ÿ˙âá”<l=oΩ9Ÿ€π}z“ﬁ´‰ÊQò©‰3¬ıxåà"ó◊V(È4◊Wïƒ
Î≥&!_ºµ∫≤≤º±íÉ<g´ä2S=1§π+¢¥‹†ûTbˇË\9glô;Ú¥ˆwrœM!2èKÖ@WVEBfœkDCá⁄aôC<≤/àñ‹^O~cq®˝≥(í†‘ùÈ¿y›q§ÔH-äÄ3wñÖ? ï¸ò°ÿáZè@ï>f © é·yâ·ÓcáUõ=‰ﬂÏ™X¯ [T˙ÿk÷Z≈Ïk\ﬂ£=qŒŸ˛h‚Úß6=
9ä‚lús†9K3÷ù‡.P^`≠›©(Qücñca[û£TÖÑE†|´A-¯‰~d aë$?ÊÄÊG)€öA>’ﬂ/amK~ÊGØÁå*OÈüô;˘Ωz–	˝3s'ãÃWjgR,F§fp-R∫†®µøÀ∞&	ÙIΩ∏ŒeœøQÊÃæùóÀ^êä§ü;ësh∂z%çK»4jS£≥ô'ƒËæI)S?(P±p∏E˛˛ùó£ÖÁïõUÕu?"^+ 2.’∏2ƒ•Àvùë√:Œ à!ôÔ€„»2-X∏±(≠◊ß¬åÕÔ‹Êt‚∑‹Æ”ßcÄã“¸ÆÉ«?\“∆Ã2K‚<ˇ(îùíÏdˇ©¿≈√àπå€P&C°ÁZK®±íπáTBÑ±`LˇÂﬂ.où÷óµ›pÍxÕƒ⁄ò`uë\ÍLlhq∫ßP MtÚÎR|¶%¿ïà@£ÒR‡Üi⁄!'D>Îâ,Œ)tei∫$›5é!ˆÕ*8Ì∞≥|ï•ΩÒ¥\’æH†-iú¡®˜{ˆ•2Ê®◊'çﬂ”1⁄≤0∆Ùï‡xS S"%ìΩΩÇΩ-f3Wm;¡ñßÜTüô°FM( ûû3˛‡Œ€iZl®¢1ö'"	Rq¡˝ŒÅÍﬂÄ§P¶¬Ñ=4,⁄Vê¶Èh±_îí)«π–BRêó}´.>Ê"ñb˚Ë†^+è◊M*êz¶≤<NﬁâôÔ]wÑÖÓó/–ÅßÜ2sçQ1éÌ6ı$*∞l#ã’ue˜÷Öz-¢äÜ¯æZHCﬁí˘!g)ßëÈãj»õ)Âúq˘D…òÁÿ\«|&∫!∞{.õØØ‘ÿ∑¨ÇzR∂•kz[cØ,ÎwÿLã’ºè˙ˆÖ⁄Ï√®m˝g¯Ö<ÅàÁüü∏™o<‘$º$˛≈ûC(SΩ|ÄølEúï¬6ı!^ü6s·»§G¥2)}f≠d"∏/ú∆¸ú∆Êåú∆˝±OY∞DÊÎíı÷EÎ≠"íbˆ≠QïA ãH–jq!ı≤’oƒW9MG|Õ†ÛàØ4r—-Åd©ﬁÄúÀπ*JlÉ2ÔLuÜÅÓ5‹r(ÖbÃqB‡RU'^7◊ÂÂï"µﬁXM°Übqa`¿…Ø2\Œ_˛Ùœˇˇ˛Ôﬂ€ü+eO|YrEñÂ¡ÏÎàÌvª6ã∫jNç4Ol‘“üäZ÷Ä+Ãœªa\GBYì£¨à+Ïˆı}õ¯ø”ò¯çZÊ÷Æ~À:ŒÃÈ≥C§nU©øÌSå˙Î:˝bùΩ›±+RìÌ˝…—Üv∆e[L+ÜÃÜNÉªiï-<~m™∂Qπ‘FI˚óNËeC3n(ïôsÍ,q:5Ä5ÓË;õV0ódß≥∂b©k5ˆ∏ägåOı"Ä£ä˛!(øÚ[æO∑¨‰oîkg´Q.6™äÿíe˙x—Ñg˝éΩW˙ÃÓ˜:qF='Ë±û†˝å¨≤‰˜jˆeMzU´÷◊J¶*_÷@ª›<:x≥ª≤∑√õ/‹ì4√“~§ÙŒß‰EJö€Ä⁄Ê5÷—RösÖ¶PÜ≠ßU˛&md¿…ﬁ¡ﬁ—˛—s÷Í‰B[ÇñW"ˇœ‚˜]⁄-‘Ïÿ≥Iê{Õ=	ÃÚu∫<™(	[g:ãR·[Â´Õïã¯…œÓÄù∏ó.Uå_∆?ô,/˘8l;?±∂;Æ¸GÁ⁄ÅÈ%=¨ üø¿Ωî´≥¯®t˛Â⁄ú¿“MLD˘;”i]@¸\ú/*´k\Ü‹#˙G‰Æ˘î„⁄‹±È\uºáù¯=ámÆ0NÆ2≤É|>πŸ0É∫ÓL™f'„ãÈÛòwÂj*î™¢–3ßÕv˝ÅÇ'õŒÎ&ß∫ºy˛y¯!/l~º †ÇEÀ©ë	û¯¡x¸Õd;[ÿ.f∏’™π§B˝ATa›pTÛ5;6˙úîG e2∑yC˚çÑ!•ÕY#π€)îd„wùFhItgFjë¬4Z r¡t\∑·ƒPêßd±Ÿûpz64gÂ4/.ü‚#È-»◊z°ã(Œía?ÃI¶5l{√1e©
¶gNﬂêT.o9ÓÒ2&OOﬂº<Ù…ó ÛéÈ…cÂúG∞˛xπ9ÇEò∏-@Ó®ÎÚ6p]Êùk¿2x´ˆ˝W∑ﬂı7_¥ßÅ3˘ueÌ.Í∞>"˜0∫ËÖTû•;∞R˛Èèéú˜@‰&.˛öÜ.ï©	¸ÅKè˛EÎHxìÎ•Øn∑X∂? ˙ˇä∆¢[`KÈ~3˛¿´¬3>∂}^ë¯ΩÔQ°c¸.uÙΩ¸8íêÂsÔÇw§zí±¿gâ9Òü=˘'ıﬁ
¸°∫èÒ+Oa•"}1_ØWÔ=˜j	QœO«kX.&ésW0≥
˚#,ÊzïßU~á‘ø‚Ì–uÇn£˜©èvÙSÌ©ZIº„Ö{∆~0°¡¬K˚ÒÔƒ[q õxÒ ˇÏı&}zÒÁ¯w‚E<‡˛9„Ôä2x<œÅ,ı*Ïôx–F¿åSlã≠.\˙J‰Ö˛ˆ®öt"i˜q>!Ü &Ò∑2§jÊBo.Ó;Ωﬁﬁ{ÄÑî™N+Kâﬁ≈K“-â>$z‹!†ÎNnó∞$Mmyôm„û-†%„E’5ˆ{K
=⁄Ô% ÉÉ@“¶ßúB©@Åg„HTƒ@®àÁÄ?8‚ª;‚GN˚¿ÌzclE/ú»_9o¿ä√ÍÑ‘æ…ˇŒiç∂NjäiNr⁄Ωw˚^w‡¢Íêü£¯wÚ≠ê˙ÈX˜nk øıìr#ÁõTÛä^†ÏyáÕX¸ò·_âmlÅs˝¯Ü˝"æßﬂ≥È»õƒøFî«]Ï˜Ì”ß’Wç‚ù *¿°“ÍÜÉ∑Ø¥|†7ÄãœÜnzg∑–oæVá∏Ãﬂ:|ÊáÚWHpΩ˜no˚∫§UÇr+π2˛ˇ”Ùˇƒ¢ı©"»Å3Ù¢n_$nïÍñü∑ÃZê&é71 §€«πâÃRÀ;∏f£k,d¡›„¿?˜n-◊xÇ‹çßE¶ ¨”`œõ'ªM∂t¸S≥Ωœûo7;{;/ÛK]ÈÌs9Ü!rÏy‡]√ñ∫c ◊≤=/Ÿˆ,Ã·l}sâùt+kÀ+è˛z¥6XÀy∞ÍdñÿÅ€m»w·ós∆:(®osÒ◊£mg∏kâ≠nnÆmVæ∆‡h®≠>»b†Ùwr“+>¨Ø>x¯]˝ªGbπEπÙ^a^Eœt»‰)ŒE W§πìw…1ÆÏ’√≤°ö*R¬J˝+æ.qÃj4ﬁƒ‰Ç}K'‰àn„Qp?Ì(ñ∏I$fHÓL0*πW4·G#noU˘Ï}‡µH[{E¿=PÊ£9…ó8¡Q6ÉS#<‰ß„ÅÔP›(◊âRNÉãÌD»øËº<§‡¡Ω*&O3É∆C°:Ó„ÔY„’ä9.?úh…ÂÊ9Hû‡¨Ÿ“FºQçÃŸºA√· ›Q/ÇúX;†"™™hGg:ò‡˙àUñ˝›¶:∆ö!jNO˘˚õZ,N˘⁄‡PdAFI5ª™PŒLsÒ-·@M…°W¡ÆR)·jï{dwe≠`C∏¿ºÉTG$X<ltF˚„≈˜®¥Y¥<1Æ 7Ö’¸0ΩaµfX$éÎë{3¸©ÌRπóòp∞C"mzo€?.}ÉêÅ‰æZk d˝ /˝8⁄jÌûëı˙|‡˚Auu$øoyi.¿a=F…~À@\©›æ•„èE"sj≠‘ªr9‘{
;ëd!Xö_®V∂ÅÉ]ﬂ`ÕÌ•	ÕGôÿƒﬂo{q≠b(bµ“©‘‡¸ƒ/[ëá@ù≥P˛◊ây+‘ŸÇ"≥,Òµ}ö™ê]¯àr ‡—z◊m”@O¯Æ’YKÅ<‚òW¿lv€°Ödm”mb(ÄF?õn%°⁄$œGrã·qO§,ª€*åA7
GK_ á∫¯˙ùá$\¶8ùô¯2(w®˝L@]%Ÿ8€Æª¡ÀwZK"˝ƒ£ƒú;´≈‹ôr3’Pli-¡~%•ﬁ Œß¶pAÍmQçY4&*˛cËèbÏ<	ÆìDåüÊ€«Gç±ÑnÚΩòÇ±.≤©¨Í÷tÔÀó®⁄£5+%ëyîC∑ÜOä}ØæîiVf ∑%pD€yè‰◊	ØG›Å¡aˇ&:µÒ¿ùÅ¿!£\á¿%”ë—è-≥KƒçJ¥\¥WF=+RtNﬂƒSSˆâ†±_Ö¯èùk¡Ç…n9
€b™‰.y')ñGΩJ±[Ià‚gOh—RE„‰-.Ò Øì4˜Øät‚nJ"wc	R‹RÙ´ôõ&ƒœ‡∑ùŒNyÁ◊ú5Ø%⁄mÒ(~Õ#÷õò	‰w˛ípGøÒO	{tÉÍ∫ﬁ÷¢nª¿b	÷…ãî.—{ñ“0
ç;NøóZÙ^ÌY#Í.èD˝oõ·›
ú¢bJÕ}QAŒït¥w÷vÉ˜  6∏Ä≤ÎwßCbq‚©Tñò¢`Ä®¯ìÚû-ßÍsU9<~æﬂÓÏTT”YÂ¥µ€ÏÏ%ÓΩ}ÈúÀ)û>ÆfúO¸˙FÅÛ[v	riœÅªh/ul¸Ï©=¡˚}'Ù¨Áç1©p0ı~SQ∞g*…Ozù¯ñ÷i1ã≥s≤ßYúU#√ÂIÃ˝[Sã3M¶ó≥≠ˆ¶,PH6uybŒ—p¨]÷Sƒ^˛¿m∏A Lx,Hàè?w.úUÂ÷e0V‘KZª ÁL$Ô)4†F8YOCUÛ¡∞˙∂9v.ù>ké êÆùK*)q·Qç“ãæ3ûÜ) ‰Ωﬁ>{[3È4¨ÙhåXÒÚ¡DÅVŸ›;‹Cà 8»‹[kÿÁùP£—√FE√BAg§6çè§ëèÙÜπd*hÌ˛†%…IkÇöÏKºÕu
nO,$ yB”∞}çB≠kùhiCS 2UŒ7¢ã$ü¢|3ôvOCÉ’mÊ[ÖòXòi™U†W˛‡}‰O‘ÒÜÆ?ù»€KÏ!»òí·ì”Í:£˜*qx˝…p∞∆ÔU≈póTˆÜ∑ÿZå¶°ªs|“ﬁ¢xÈ¯6Ä¿E˙6ï·Í8Ü$üú9›À2ÉÓ¯Û°˝ªs∫¸„è∫†¡[pxﬂ@t&ÑAÃäûÔE[µ/≥g¸¢≥™vóN!óxå¿5†@Y„ÅÉEﬁ+TÉ&U[˜ {¿rg»XÙ˝	∏¯Ω3ˇCõ,ª¯˘Cø√SL_T‚⁄zløj—xËà¬†ıäEÎ±œÕ‘ÿ> Í®«j˛ÿˆ"Ë?’ˆ67‘:4 L|•sA“YÖ&”|U—2É‡®#©ƒ≠≥’Ô·ˆ”'l˛≠◊” ƒ[øÚ^ª\µñ?LTyŸå€Âí∫±£‘‹âa∏Ø;yﬂu'ö‘äJÛÏ¨íÛäˇæïÁ˝6ç™º·*@qﬁÑ†  §B¥‚!+ø<] qZm¨D_RKÔ\ËnﬂÖÄˇ´ï1R≥·ˇÎlT≤≠πU˜	˛Ÿ†»<å£√'⁄ﬁ\\ln¶Õæ¯¬ı.˙§cÏÛøçz≈‚Ã‚Ÿ˛é&âﬂBª©
¢Âìéë`•uÙ\¡â+⁄?Â«‚;§pz£j4»%ÛÏxÉj,oD≈WBêj´oâûø!z˛&¡¯¡nìk`u˘ØóóÅ™º©‘n‚€Bw¶g”*H´9yd{xge ‡í‹€[Œ`v=íM·≠-`E†acú,dI=Tn„Q`fì¡‡⁄ÜßY	nyq{(^ë0!pëN„u-≤œÑÔ2Üà!Æ wy`O‰˜•>≈Ê\Ig?ÿ£Ó`⁄CUX‰#ëlQã”ü´⁄¿Ú˝Ÿ
áeå§ﬁ‡Á1ë‰‰±‚O#˜9Gó{©<©8¯ºÆYÈ|ªµ<πâˇñh ˝Yû`
Ô(U,9µ<π°¯=ÈˆsÉ4õc#Óu¢&˙6yÓ>d„≥˙Z≤Zô6∆3æ…c;›Q/ÂŸ˜X„‰Ù∏øöÒ ^◊xx).a“ßkÇP„<xË_¿ΩKˆç xßøª‹_Õå%[cI[WIÛÕ6ÒÂ\¢˙ˆ“ß·∆Öáä©≤{4,'Fhäv>·x0uÇ%`ÓGÃΩ«.
rÈwôBEw1Ω;^‰ô±Ê§=ïâü]DÂX7ì.x“ﬂu=◊O$4{·E^vÜ|*k±üûZ6Â´«—Ò\ıG¢Jm◊u˝U}Üêt‚ÀÏvk R∫Ô<πY}pÀñü≤Ì©3Ik¬ã'µ¯Y?æ¨_,∆‘˝n
kœ^∫ ⁄v”QtÈÉπîbÏZ°∂±íçPãcbWﬂ‘“Ëóı`´uÚÕûÀ§wÛ*l˛'
…Mœ|BbÒ3Q÷wìFkp˜}‹	¶∞N|'÷6n”^…:h◊acÖ4=.Ÿ»è!83‘¬‰Å∏yà%SUÏq=34›¡âqúR%-3Äõ$!}&ôSåXΩ≈¿#Åp≤oΩ`]ıP,(p«Y´ à•`" mÿ”≈?*Ô9g¿—L¯Q©o0êZÍ´Àk¨Æûiºë™ 'OÔ√,ÃË"ßÃ±R…8Q):©˘ñT4"®"f“¯UÃªs¶SÂ`gz0¿Û9BnÑ ¨≠¨,?,J Æ¨¬VÍ†0ÑíuÉ¯Mô€XÎqù\«Â|h4‚Ã“¯…$◊˚^ØÁé
a‘˙C›ôN≤gÚÒÑŒFvìx™î´ë√ª™øz∏Ç‘Í«ìælyrrí˘–H<û«¸I‚l!=ô"∞ô√°πìaD˝Äñ'˝˚™qê2*êU#Ø }–}éñø¬Å0é˘Pr;@§˛—lÊÅãNïé1Ù·◊îıíF–c‹6MÅ¶·¬}Õô√÷pvug˙ÃÔ]´”ºc¨_3ÒGÓøQËÿ’q≈X§)—ûÚÄ
°⁄òXaÑö‰ÄìHÿúâ6ZNuQ2‘FèÛÚ$LzÈÌ%\bf}*Oo"ˇñV≥ÆÊŒÛÉ√¸a™émú~ñæõ„
äƒZïÂ› ·e:Í¢•î≥FB˛!a›œˇLŸe–T¸”
≥z˛2ænÑœSN¥§Gñn—<NõÇwì©Sñ2
–Ï’s–Õd≠ﬁÛ.ºI¬¥™ø`ì>º1QµYÿ¸∏.h °[¯BN®(^–S='±fÈ≠3¡erO≠∂Œ‡gFimu^eùG3‚‘∏ji‰_N⁄(–3°Ô0◊§+BÁnï]™∞T–hÏ»àÿ¥(ÒOb÷Ä)O·—¸Dw7†9¿zëlóIü]òM˝∂…kS’ãΩD)ïË≠oXN˚ƒ¶
∑eôÑŸ˜å{pÁ“•Xq<«ä|B‚Fú<d3wWS0:ﬂ˛P¶–5˚›±YÂÇLSyG_œ·•ÕZnÆºfîfrÒmÄ®'7õ∑©˝à±∞VDB…¥±rk–ÙÆ√Vπòá*†çJn
ìæxCíX<∫ïß€Ó`:dË©x±Jç¢gº∆bÕtÈF◊öF7`ﬁ”^h ö"kö,&A÷NK§˝ô‹‡ÂﬂFaêËÅƒ™ªòiØÂ†ßÌoóÌ»˛∞ÿ˛0sé…ç¥‡üØDè‚úT™UçIªùÇù$¨“PF«.:çÙgÏt‚;}˜}‡èQgëPç`1ÓÅáÂñ§}•P+nÿ.ã¸È&¥mEÏ;úÖÓœŒîë¶	Qíº§s±>ß¬ÌåoûûõËB·¬GbŸuºÜË£˜‰F	A/⁄m™á˚ﬂú®úy˙‡…Im˘Äïº…5JÎÖ€•. HèO‹sêÚ˙;W	•7œæP«ﬁ®í<l[Ï1ÒQ0Nıæë”ﬁÓ∏Á( Æb›/≥ÌÜ m∆¡E&ÔbF›Çd˝Ä&ó§—¯ú≈	©ñ]
‚ÂôÛsr≈pêRGîFßë’myäã’E!Û≥˜€Ô§y'd≠7ædø°[UM6K›¯ÃKgJöl»∑5ß^ÿ»saL•D	ùæY1òì`Àh] ◊:$Õ„F å5≥‚N∑Îé'OÑ«‘oÕc´N: ◊*çTd˜ÚF¿U‘AHÊvÉ>ˇG¢úït
Ù?‡93|¿»ØJõD’õâDME	Ó÷îjQEbÍz´“÷≥¬qâî´WpÚ˚ä≠Œfa˘âB£u .Tî¢ä_7QúåQ5M¬^∞0Ë>âﬂπeŒ @!ß¢Ÿ	
gÔ‹.à9∞–íã\±œ¢¿u ˜¡(∆}©∞¨Òq*{u⁄›FÍKÌWæÚ‹|À¯Bn±äÑ'4Tmå1ÿ†Òn|QÀ’rÂÈ-rf¥ÄÑiüˆ>¬®:≥óÉú]˙Œ√√≈iK•E]âñ1¥‘ö÷ï‚€∫ºÃ®qcà±¿Zæ∫í»Íß_ÌY4Ê”C^9∏ªW®#òã9‡hOGﬁÑù‚OÌƒç–ó{Eê'‡éá:ÍaEp"$Ÿ
÷>yH”âóü85 OvËb°«qÃõó•‹$Ø<€Í∫~ü#Pq≤e†I≠ﬂ+@≠®\¸‰7X«∏cq”∞~pˇxâb¨ÀÄœgK«L⁄õüõ
a≠¡(|'ˆ‚Dìöp]≤T"D¶¿ªË^è˚©c@4HUò∑Ï ”`9õûsp…™?P∂ÉIÃt¶£ºCïSv[úôe¡ÚÿdD}
«'·}ô‘ËéäÅ+OCnyØœ˜#ø,ÏçÃeEÆE›|œ"µ\o¢P/˝0Àt\Ik’•§XlW¸eÚ≈»yMª]Ê∫≥∂§È•Æ;‡i~?È7XUp‚Ô,«,π…eÚÓƒ¿Ç|˜	«m∑q—`€ŒÿπdÕãÈËÇM/øÔàò±≥W	3Œ-ıÎ/?yxñé≥∆Ä9Ω˘`ﬁ
‡´ßÌ•/hë/›=C’´’áë”‚Á°∑¯E!ﬂ›ërmGë'ıùk‹∑A‘e±.˜-d/º¡Ù»F€˛ˆS7ù9’2†Øf ˚ÇW?IPÂ—Ë5ÅÍGÄU›gèV÷VŸÛ˝ÁvM~Øe–r"+„Ø8?CùçPv¶Ô¶T°#á∏S%†ìßL@sî|–·C˝ÂÑO¡¡»q˝VÍ†ˆ◊¢G‘ﬁL›E_ûèõ2PdÀöﬁ∑~®–;.Â¥®?N•µLÎv‚ç∫XÅl€¡$Òl◊NùI6DX|!«	;rÈ‡´¿ë›ÄT/>3HÜ´ÏÆ#ÏbﬂrW∏M=Ìí∑jp∏$›ôΩjE5™Sª,u}‚_iÒç…7ª,ûM˚±ÚÎ&Œ®I)51è›áµıNhw[ºgÎ,6Üs≠R,#ö∞t‰…¶%–3˜¢πÅ¨<¥•*îÖL$eÁJ∂·Y}Uı/'Bc¥â◊Ô&◊Ê°ï˛,,¸iWˆS–ô?5/Ú!C;‚*U á%VÅ0µê„Éóñö¨·â\≥Øóß•$Íñs8xôΩ¢r—fAp-◊GÈ”Aî'?)ƒúΩyì‡ÉZ›pgê◊y1‘‚'ı`ÀÀÎ}¿-¨§r^fßÅÛ%x-™&´=2∫åKß7;¨ı”[c˚£nââ}oË˝a:Ë„h ˙ã ˝;˜õt5 ˆÕ79ê≈1Ö©àü∏,Æ¨Ì
¶¢ tAÉ„I}≥ $ærC¯ ƒ≈&hTXÈÃk%•≤÷‰"ï=ú˝è/óïñ®6®Z¿IL¯æa;Á√o~}ûˇÑ ≈ñä§+òæ‰˛çá±ÅO©yP“ ß÷O˘$¥~ø6}3/>√∞@¿í3˙ñhL…ReÄ)UAÁLü°~X†i™”:Å›Öìipz˙8W9—πT≈kπ™b™◊b°(∫ª>¸3f=ÔÃG=q =¨˙Œƒ´„ò?p˚∞Vó#å;Ôyl‡_:°óIa«/‡ÚSüò‘‘√ö[â{»ô¥xæ{‡»]7´26áÆÁgòCc-·%“ﬁd=8ÉVRT)¢îa˙Í4Óe≠–WRlg*^¸˚Z$Mp>‘˚ 8nÚ√™¶míoë•ÉÉu’/aÉ÷&/¨’{6(”5 ·ıûhÎhöj2ÍöQ:˜'7˙<FîÆ≥≠Æ`Ítmõ°7‚…√±›£ÔåÌ∆NØGı!*õ„l˛chiS"1SŸjÖ.”˜E…Å-•‚Äæ%BÌ@◊ò∏©xŒ`â°¿_Å˝3Ç◊?ÄVeU4LMñn†ÜHÿ*ÆF}˛\úUW˛oô≠4VkÜ>¢R[´T>gèŸweßgÏ-%ÆäÇïò-~•±±∂ƒ™j'u∂±ÇIÏø{¥Qª≠Ω5v∑ï˙ÙÍ ⁄Féòßˇ˙w3~úíWÒ˛äóÓ8¯naE	ÅwtØ‹fÈÇ÷6®ı/õ˜2ÁÇ„GI∞™qè1ªó¿I;>÷F∆É»1∑¥≥ô^sﬁ≈hü◊+„Zµà¢9I«k€>à€C<Ì ≥°? Q/ˇ‰Eg?zs’|¯ÂIäø≤bl´Ÿìbwà“Ä»í⁄˙}b⁄\Ã—3ê§ÂÜ©~Öm¿R¿Ù	u MäÊHw~ñ¯ëË,≈k’]w:òHéq^Ï”$BVûç≥√]IÚçëàCAnI©SB≥%¨Ê·F∏}µ±°}}}cusÓ â¸YêâuTFŒ&7|àÈ2NÁÕßBKèˇ´hfw„ªÕÕèÚ«÷q„Âüõ[,?,%gàyä=Ñ¿bv0Ã7˛‚Y"_‘ƒSäTã
‰Ã¿àd*@4xIjˇ–|‚¯’ó0Qÿ“·ï@F9(Y^úgÒédÔ†µ`dÕ≠µ»Ø‡∂ù/
úW†<:\ O¸?nÒë‰∑x4˝T√4
©øÕUö≈‘'°*9Ñ~Í˚ú,‡o8ä='Ïª@∫t¡”4Ë7⁄ºù9á˙!]˘á/%v>oŒ˘!˛Fï∆bÈIÏM2…È£7ç¯!Z∞5"Èºh\î⁄¢ÆT“ı–H∫Ó>Ç¥ÇÛÚ¿ßn∫XU	G≤Îv}êM8ìçOÄD—JŒVµOOöˆcÛ∞ydXKÎ¥O∆˙Y¨“,åÑ"bÒ1˝(1LyêDé¢[Lç‡œM3j†˘øÎ@,	Æ#.eÎm8®áG®üuÊÍˆì‰/3õahó‚3X≥Üf6≤k®«uõÄ⁄Úh-OíΩ∆q »´g∫Ñà˘ü»^©Ë3Y=÷&2L∂0fñîzŸ…<":Õ ¥&HHcÄC„QÇ•Ú3„?∞öˇÅ≠í›Í0è©Ô8‡Iû«¢èô”|Œ≤∆¶q5§„Gˇ‹í≥_‘*Í˙11˚¥í¬´w1Îh» ©<ŒfÁåö˘h˝q›ÿ¸ı◊DÖO„¿ö˙…Ìh^a>vºîúÏãH»éWŸ§ÏxïLÃéW*9ª≈;˘ŸÒ*»—é◊ßÅ£ÿØO
ˇeiã†™ad,tÉjÃÍ◊…8ú⁄[‹•;›§†W„w∫?ö>QÃuçÚâ3éå8iæW≤z¶MÛélªAàto‰±K4ü_"º‰‰-÷˘?QuB4û9WNüﬁ∂ƒK	ó¯‘¡îñ°Nèç›çÒÏ∆8ó–0xÁË¥Ïƒ‹õÑ7¢4œ}øgR2rb4ªûƒsµ¥Z⁄6'üûbø◊√~ÍÕ»ßAöjw¸±^˘\¨ü.†Ê˝¯S±µÍ!´xµ¬v±N<ÊQ§vÙËÿ\B®`$Çnœ;îÔ‰P~◊˘˝'3ñv≥s⁄<Z‰p∞Xô-\úû4˜õG q5_6ŸvÛ§yÙ<o,fÙl,°ƒ'êá∂Àπ%Œ%uXbìK<iwÕ}x^pR§4^i≤YÊú£ò£cﬂ≤’b©"Áªy∑0jòê¥íK≈Ôs2ñ«^ ßﬁÁÿ≈Yõc‰Ë·]X∫ßh‹y\∫ˆöVw8£K¨;6ê”%Œ$d‰‚ëbùçˇddœÅ6˝K£%:mÅs›8¸aıÜqáÓ-Qó›˘P]YbYù©Óﬁ5 ¯È≥ƒ‹·xrΩo˛ﬂ¬®Î_ﬂ»◊nﬂ*ÿ “Ÿs¢ùÉŒWœ7œ,e≈ÿ_ü¿>ßNä‡ŒéâD¸ªÅÀ$'6 V“·OÑ‹˘Œ?ê‘•§'ÆBä…∫√üû8=oäÊúë·@ÚìQxg‡u”ÿ ê‰$Û‘7!H£ãßøï”›ìïg@&œXûß°Ÿ€_ãpÖw~à(‡
fXR÷Y… :FYßÑë˙ÖçªÅw:Rûô∏o‚•$ ,ø„ûM'ëåC*ﬁ+Ár2≈gX˜W∫≥£ˇd?]•ùØöYÃ°‚7!‡xg2\aù0J<üµy">+l}±ﬁ(°◊Éœø|ìÛêï—/¯`hù(Dø€å¨Öj¥√RûCFh<ÏÚ%.≥JZ˚üc^,†TñÒ˘é'Ö&^„6sóæœÌæáN›üÃ6+qw∏ÀäWDn wã»ÂS.πm…ù¢=qÜ„|Ω´Öc^ ¥eùãB%∞‹¨En2xEöUÎ	)AÍVmë3'ã¶E[Q§É,˚kÖ≠áﬁám`\{/}Ô p:òx„¡u¡{FœºÚúVrŒÓΩ`ª`ô91âıÉí± ∆…íw|VèóõΩ°7:tÆ˝)•≠}ˇ’Ì˜_}u>u)*=nVv£äg«È"&hw†∏∏˝˛Ë»yÔ]8MC7¿Ωx,ü#ÉE‡ÜK_›n±tGÄ2Èﬂ˝ﬁ˜â.∑X5åüë|Ùﬁ˜®~ÈŸsF◊ﬂGﬂÉﬂg>|ƒ}nVo“0Ä√?¿Iú{Ø^√§k4®Æ?
'‘w¸ò=·Ø4ŒΩQØZxp-óbü<y¬G“¿&∞xQŒ`“My‚û'Ï-∑D>^—.m9Ì3ﬂ	z—aÚ∫Æ|KvÂS˘êxbUu¸mJ≈ø¬0Æ”Oz^‡Oò»¡ÙåUˆ>∏›)e5¡:Wâ8^bÙyv
÷Cº]2MÑftQSsŸ<˜CúÓjª<s+Ø›À‘‹Å?p‰≥‰‘±Ô|¢√óﬂ'øÁ/â±≤JvÛ¬	ÅÔx√ä∂ã∞B”t‡FΩÏ8≤AÏ`ûÅ∏´∫Bú¢Vﬂ·ÿπÜπ¢˛vQ√¥ÅWP∆≈€∞oÿsÁùgú3Ü›yÔƒùÌÙ›Óe˚o¶N‡∆Ω5E+v‡N)&∏í≥›p“ﬁªJ«âMèÊéüInºÚô˝?x#∂ò≥3pÓúQ7^’ü·lπe9≈Pa	⁄Œ†ÁÎÁ(lu—ˇäX6dœ„Æ^L1öµ<˙WﬂàQg˛(^FﬂÖÍﬁ‚SÿŸÁ ÒÙ=x#¿E]7Ü6∆ 8ˆyûF›π˙FÒ£N∞2“+4¶A∑èëÖ«ÆTm◊år±,¿u‘YÀÈ^Î• FËRy8jÈ^®ÔâÙgnjøóíDƒ'iílüõÊ∞_¿éú¡ıƒÎ∆À‘ÅéPB;+„ÇV^ËÖ0∂Cg‘ﬁ∞P"∏≤m0çÓdMŸ9JÓ˛@c8ÒáàÄÙ£˘@a
jo/aª«ËJÆ.~<˜˛√P@Üé_LœõË‘J]¥ÁŒT]˛‡[Çwo,‚–⁄7 πØ,ƒ∂ˇ!Ód◊øú¬∏—é{ÈL`øÕ=Ì’x÷Ó¥ñ˛π”J˜$Ú°#I†™u≤+*≠{®,|ãö®%t™≠éRâGùÅ†Âz√D›!ÂFHEÃ“º]§:”û#ÑÄÔ˛∏¬«ËJÃ⁄»5a|wÇ’2ïâ	∫qÅ∫ìh±_+\¬PaTéxçÇ‹8DGøﬁ9´ib-¬—‚_πΩ¸`W4âºL4õen˙G•Èª yM?ä^ˆ•ƒqJ?é)j¸$Y‚—ÎÔ≈ÅSi¶ﬂF›¡¥ÁÜ¥¨ØW„Ø‹Fk+zH/1ı˘ˇ  ˇˇÏΩ…r‹X∂ ∏èØ@xÂÃ†;›ùÉ(Ü(EQC§ƒGR≈«ß ›A:Çpá'‡.ä¡§Yı¢k’fΩË^‘ÆÃz”ÎﬁµYÔ˙™˛·˝@◊'Ù9Á∏# 'ä!i¢w8˜ÃÉ≈∞–√}®˝Zvœ?´tZÃŸ«s}Åä-∂˙/&Ò•Œø.ÿm˘Ω]––(&ìGn≠TÊéù‹™Ã.´<!∏vÄ≤&ûçog„.X˚¶\}2Á’”ﬁdﬂ†O¡≤Ωy"ò'[¨ÌAÂË¶R»97L0ïOF)J4mSEèAﬁî(•P‹1eW^ıVk‘5Eü‚iy72Cü¶˛TM}ä≤æ¶Zpxi≠CÅ≥É,ù¥ŒíY÷ G¡Oòf†sL”Yh≈ô+¢∂≠A3◊O<	QâıÖ=®õÿ®PÕ Éö¬˜1U˚TÙQ/UF∆Òu;<∞Z÷=WR…ÄÕ`0c;≈SˇQÏÂ3¥(E¡;T*±•ﬁ¬0Ô∆Ìb~äÿ;o∫R∂ÕJhäÔ3=ÿ{ΩÉ©#≠ÔﬁÌÙd¢,+ábds“èX≥1E/„nhÏ4îù`àˇ9ìπk’‰WUEFÌT Øé©H%Kﬁ‘[πeˆ¯Ö†õ
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
\~[ÂÆk◊*†¬\ì≥¬ÄoW)0ìç«˘Œ ∆í‰úRÔÿaõvéÛjoàû··/uª(NÙˇ  ˇˇ :ÙÆxúÏ}€r€F∂Ë˚˘äO‚PâHâ‘≈≤…EI¥≠ËZ"=ŸSÆ‘$ p –≤F[U˚Œ”~›Ußj⁄|¡˘Ñ≥Vwh ›çE9…dcjbóæÆ^˜KáåÇ–v¬÷(˘#Ú¨ÿiu◊◊˚ˇãîÆ'õdÏYQtnMùΩFÏ|é[ü#r¯qk‰Y„[Bo±Fv÷◊…|6s¬±9$·±Îﬂ¥Ó\Ëá\{Œg‚∆Œ4jç?Ü;7÷¨’ioI˚Öû/Ïz$rˇ·Ï=t6K„p}€Ω	Z€0t≤∂O˙∂ìcˇ:ßV‰íÀ0∏wn…r‹¬oŸ‹÷&õ“9èÊq¯“Q˛°Áéo˜ö+doüDN|a«0OËWgøs,ònÛ⁄Ú"gÂQ⁄à0Xq7a'¡''‹n¬IÃ}€±[ﬁ>∫…véåÁaÑ≠Y‡‚¬6$ù*÷¯ﬂíÂ›~Ñ%îÆ[åÚ≥◊l˜ì‰6‹'x∫6¡ˇ¥∆Å¡lßˆnˆ≥KÅ`CzÖñ¢ô5vZ˜≠é
`<k‰x%(˘–Yü}˛E±[:ày¡¯V—!–Ö≈ÅL>ú5:≈X]6è-«˜3>xŸN‚ı…ÚÊ∞k ûcs∏√)À¡çBÌƒÚo‡ì¶ì¿mø¯q”i«Vx„ƒm⁄ºvs–{◊∫û{ô}nmêŸ=Ï&@Â›⁄Â»%èc68˛Ïë<.	<[‹òWn0è=◊wZ~‡;÷xÌÚˆ¯…«›c˜C‹µé¯#{Eµà3 g˝:·^„ÃäÊ∑∑ñ/n´¸C≈1ëÜﬂ=3‹HzÃ:&k‰‘ıo…€ ∏ÒrfÕ¢ﬂdüc+vaËN¯SC¯!"òÏíüº6Ãm®$@{@:Îƒä≠9π¥"òU û~Èe~ùG±{}ﬂr|õÜ.ô≈ä£¢#“ÃÿÚ	,ùånm"| ;Crîπ@¨@xô¸ÃâA°ÂG.¬nÀ0\îŒ¿{µ®˚“N¶Ì9Îìì[X‰”[’WÂU›IñëùÃ:+M,;∏£o´¯”≈π´√âòösXõ»aëÅ;ù¡πªt¬˘»Çµy:À%ππBvI≥¯öÓºçú¯Œq|>˝êd,9tJZF¶÷Á÷]k„≥gƒ»—ÆÒ?≠ª–öï◊º´ñ	&%“ÿÖMï”EÑîî∆ÓÕD6)v=ÃpÉ3À∑nú∂Ø‰¶@jÿê7Û‡F∆{„ÿ˝‰4çÆê◊•mI[ç,Ú∞O)N!ﬂô:°ÂŸàÎ◊:÷ì{àCÚ¥(y“-a∫B…a†ÑM¡7DqmyM:ã;@·¯Æœ¸ÑàÂªS‹ÆŸPmCN[ÿ’;ø!Õ“f¿∆Ûà¸˚øì∆•„Y∑‹∂¸∆„äj±◊púÚ~dg«lì–uÚ~ª¥;m¯ùÓM*âj˜‚¸‚‹`;Œﬂ∫≥‡^»O‡ ‰¶˝>r¬◊Ì0 Veooè4,{Í˙Ú‚Öz54Ø[¿h◊0∏nH≤Uú§HŒ>f‡¢Ÿz@g`
§ î@	4Õ¢£›ç∆ñËpã|˝†'!UÿKÛ)Ã÷ –	É≈ëå>”Èë†ø≤¡~w’¸+ªvi”∆»ZOÓ•îq¢à’›<~To`Ï∆lûnoúxÓ-ô˚Ò¸ñLüÉ>
ï3¶ãr}∑Å”…øwìævÎLGñÁäØ´∆•9Áó¡A™6”b£Yù·Ç1N¢W∏ß©é«TÒ"NôÖn∫Ò=;ÈÔÄòÎ∫Ss0Õhi
ò
a€-kêÔ˚´∑˝Û·ÍÜTâ$c§V~®—J*¨[Ú¯JXUm*‰π8úÎÜÛhÇ»òÄGï˛3•≤π®ÕÕÙ’EA–ÓJtFd@≈e¨Ìò®áŸ≈P]É*“©,QûkbzdîS‚wE˝Úêóñ!wïjt"gÍf∫ÿôY‹ZWK(Eƒ#’˝†…bˇÁ º•"Tb™8ÅWC@µA®√¥á˝˛«WæT9TÌ≥ﬁ’µV¬∆ÈQDD£zÿ¶rdÙ≥OöçIœv◊÷+xzçøà™?q˝±7Ï€l‹P≠U{L◊¶®π2˝_n[≥Yhﬂxç≠úf)a}:◊{ •“0T%π◊¯–_y∆	oØ·¡ÃÒ`˝ ∫sÄhŒ≥∞ˇÆOçj2√iÎL€RDaŸ≠î›‚øÀ(–≠á⁄™SÌµ’‡•3kvÈ˙^RÅü]ˇ∂•óáÿ±<òﬂZƒvE™Ó`—˚üa|À£™W>†Nn@¯qÕZÇ<[∞Â“çö:∂;üÊÈ\XÑ-V°ÌuÆ#B0Á>Ïà˙U€™^¥ˇ˜ˇÛˇh–ré√∂]êECsZìı“+πÀ˜ï‹ñüU•óñ32Ù+∂$¸£≥¿∂º@öÔ§¨OŒRΩQ‘ªvÑÛMYc·<è/£J€ˆ´íı:;n•ÒHïãâ	ªª)uTÖLm*Æ@yG÷æ#É˘®[£ÿ£OÓ∂Ô÷rﬂÈô∆gLG≠ùÏDäù	zò›M?
¸≈ˆzÍFq»U≥è(‘îîº
pªuÓ˜‚Q€µÀõ\6Ö$@C!hhçöÙKbEƒÚÔ%ßBTq»	L1≈Ÿ4;;(eI4!J[fÅ∂Á!›Jg§™çYa&TH¢≥ë¶ƒå uN≠>—®DS9âi∏
ŒwdÍá≤⁄°øt€∆2áO®!∂¯HÚ+‡=ÏêŒ.9Í{«ß¿˝èœ
‡˝ ]“ÜÌƒñÎIO©;àwSrÈî›èTÊÜ	ÎçÉ∞Ω	ù(*åXﬂÿ¶π≈Bn,q|{â¶¸Mµ)_£_‡3'o‹»Ω%óŒ≠˛jImKU∆{)C ≥∞ìanPôÒ›y¸F1,!VªV®=ò}2Dß ˘âù∫˛^C°FeØ—Q©πÉÇjz‰ık≤.Á6l7≤FûcÔIî7_e ˘«%ïbPEﬂπKè√9üOG¿3ºTZ¶ı~?≥ 9)H⁄*…zÆΩ*ˆ•lSq{mçÙÊq–∫Q¯⁄Ó ‚›õ¿ú‰¯ö§K:÷x‡{ÚÕ*ﬁûp8"«s"KÊ◊áó{MöπEÄFvî¬\AÒòh>Z—(ø$kÙ3ü√Ä6ßbπÒí,¢ÊÌ∆ÄM4;◊ÌÎ	2∏¶» Ü	MPÀ<∂f–.a;k	E¯77_–∂ZSnØf ¥≤wÕÿ5S	¢πc¡Ys?ôªhçë—Hí§Kπ∑ä	ä/#ÏÇeC41k±4ì◊ø!Õ¡∞w~t◊ïj%Óºﬂ?Ìz«‰ÕÒ‡¯DÛUM—ÑëLÆUGK∏Y˘ZUœ/D˜Ü∆≠'ì∞dŒjj'  ¨*˙{h~húwçU“8£21˛E-ø oLÔ
cœgRÓ<ÌπBOπıôZa$µR5€W)æûi¨ïO¢QxeÅVáq˝‘ïßËW	µ…ª¿˚k-ôZ„—LÛ!ä 3¡ƒ§}µ`ÙÃπ qÅ¡ªI˛23u¢(¡˚Á VÒz2ÜÄÚ:ï£‡Øå£lv’∑ldfÕöM_©‹$“ç—Ä@•∏6†*ÿ˘÷ÀTÕ‡1BPpÁÿ‘éŸP5ÜSÂÒ¨∞`,C©Ñò˚ÌÂÄAhª>,‘ñyòdˇõã='…¸Io9Ä»['∏FÉìCö∞BróΩ§≈ÕRÃùéªl˘L¥ë@%¶ÙNCâx—.Í5›àıs4p_fKˇJ∂ÚânCçrŸaDî¢Ò@iyLFøõ∂-≈©U
ã¬§4∂ó2åﬁQ5ÙÑ˛óÎúª…|~k©+H6Á<…˝œ¢.±R√ÆS§√»¿£é'â˛~]„v°ÑÇ¡Ω?Åö:Â+@X„∑käPàÃ—Ö‚πı˚T T·Î(vf{ÀórËxÂú’O·‰ƒs[!Ω+•p@&Ã;‡âÕ4“†é|(`ÎÂ	ár…^˜Ei…‡»¡í≠´øQ9~’àû–è;dŒ‹õ9≈∑Ã`$JÄ]iE.n¢Ñ~^ne˜$D_:l≈i˝“`¯7¡=€ƒ?‹+æäÎüï?/‹+Ià·JTjèJ¥"¢√<OπC{qÅ‰âäÑ…ÿám`∂ãÈÇ=ª‹C¬ÛüÂ∞ç‡?ˇÎ?ïRÉb≈È√ôûõNuR…$v¡‹Ï∫≤@≤åà≈yÊ∆3;Ñ:yíôe[‰6eB\ﬂmì‡ô¨;À'w÷ØÓà}â™C+t,˙ÜrV3ZUMW¬È§ n!yA.èçd )”c&%‚ìJ?ÙÂüd⁄√ﬁíÊë:∑Ò<\Dﬁâ®ÊØπa‚Lxlˇnâ_!©˛´@ ûéÂyî⁄Ü•fÄ‚Kû«ÚQº≠3™Òeõ‹hÏ∑Z)dµZ?Æ±«JôÕôŒº‡ﬁq‰1¬xµØ]pdì[¨¡OŸÊKEZß‰¿¨é5`˙UG´_'Gu©∏Ôèih1˛Põõ&˛ã∑_±<*Uµt“#∑î0Úﬂ!‚=Â&§/Ñ~fÓ¯£©é˝¯–Ω¸9ÒàµêâŸ˘~¬ÈNŒ6i>0º£åL´>‰K<‚:.Á'Àæ≥<r6˜,ùr(xëƒ,¸ß·zÜ M7È:<cÊ<‰*¸âà≈vÆ≠πˇÖ´$.
a|√“ ˆk“taŒõ\ŒU∂±≤¢r«»öR~\ıÈ.∫É|”`Ì88\bLg—\iG3œçõçacÂ√˙/∫pC¥⁄‘d€û¬Lí/Oë'œ™ÉXU˘=Ë~œ»)áîˇTÿ…ÒÌ'‚&ﬁ¬ä>∆XÜò™˚∆´+•#¯É‡§>ÔÚ0R∫@˛µ›©”|^MÈøñ“qrÖÖ<‡/âˇ3·‰f≠z¥+¥Ä›_™Ú‰N  ‹,œõ)RÖ„°ÁÉ–uÆiKYÆù‚Pˇ@µ]∂º/ÉÀ‡∑=F°¿ÂÚí*Ojù+·¶Fi;t¬»ıo√¿»Öﬁ:‰“ù«Ä<TÚGmgÍ'áu k	ñ˙$TR`ûœhTÙ:⁄È&Æ·6*‘Z\AçM≤ŸìTBö∂3äØú1‰®}Ì˙v”Fÿns4~l3ÔµR_y›√¶«6Fº÷" óuŒáﬁ<¨tC«KjƒMÅŸ¿YìjOtÌQÁv˙˘y∞[`°5ü=.ÔøDWH1ã õÏ2:ßŒ$ÿ}*ëSÉ§4+‡˙zgŒ…ZwΩª≠˙Te#W€Æ~à≥0Ñà·“ô∫û+g”ˇuê,•≈ís‘ƒc∂NT—˙á√tÏˇÉ%ñã%.ámrÙ3∞#„âÔéóÖ'¥LI=¡˛ë«πãj«Ñ´ éÃ∂Æ∂HÛj∂à›ı©éEy‹Q:∫¸Ù–«‘3F-Ñû“eü—‹wﬁ9Í#©éEz&õ–Û‘≤OÓ¢«6whN∏OŒ›+pi¯ÒP’£ﬁõaÔäúÙÆ˛⁄˚πw.kUjºmE“QÈàÎàõØt:=2e^√Ö≤ a/ÏOe∞ûsƒVÊBs‰fÜ±ÊåﬂΩÒ{[◊◊mœÒo‚…£6∆KQ≤@•¿ú∆≠Mö}c“˙–ÌRª1Vﬁ∞ÊqÄ>j]¬§àV4Ü·ç,’º§c&˚d]„πùˇÑö¯¢*ÃHÉ=®Â/í&4»Æ:Z2ÉÕ<Ù‘‘SgÅ¨V∏ËΩÿx+ÓT.¸gWéqç¨O“)d„íúJÄenú®=˜#¿—ÑÊLöMÇ8hu∂66∑∫;/7;/_nµ∂6^Ω⁄¥∂_Ÿñ3zçê≤GU$Òãk7ﬁ8ôΩ¯˚ﬁŒ˙ãª=‘—ÌDa7ÓZ;dˇ<ÌÇRè÷A≥*8…Ú‚=Käó&S^:¡$}ßÏvß”g5ˆa≠©iYÈˆ¶m[‰]R’PUò}vΩµ~uπCÿ.πöëáfîHWË{˚∫˝°L°A®à⁄∂Âz˜¯ÂPéI¯<ák¡Æ›:>j¨<ÆM¨PpùŒ¨jÚZWG£O~»;PE~Í$G˛iEËfr’»¢ò\±>>¡ÇS,…E:Dq∫@tÒäú¯Ll†Èó¢Õì(˘v\&2e≥"Àbr=«≤∫‡ Èç∫©|G#ß%W./M|&&(+•/“Üô&ó|◊xdf¬“eé¬eæ≥∏«t∂ö§µ…≈3:^∫æmMXäŸ$ª,H3ä‹˝ŸUçv~ÏÖapwÖ…’OùÎ8óÏæSË"%Ö˜;sL^πr`wú>w/zSﬁÓVe*ì:@‘`0§Œ˛ìg`VΩ≥|◊NonÖ∏k6‡]æoKÿ≤a4øª¸≠™D‹ö•’~´∞kS€Ìf˜¿n–˜?óîâ†jPå.¥a	€¨ÜªX>:Í]ü»˜ Äxœo¨àŒ$á⁄•^πNK	-Œ„2)-%ipÀ$vX∑µÛLÉ7*}7L£hÎ/5⁄µÔjäSÒlËÑ3◊s'ª
ïé*†°n2â*◊◊‘˘uZ§ ⁄º•:He¢nËüZíûXÆcΩä#+ìd¨ï\ ßp—ﬂÙ7,1¢_bvT πÌvª⁄G;—õ©}ÿ/vñ‘cÜ§˝+π≤]◊äA^ê¸ÙX—∑uVÌπéS™Ù]7Ò^W;∑Í›[ÈÛZ)∆+Õ ¬EH)Á˘d_%•s£—%h˜ø™q%å∫uÍ’HìRˇÙ0úß‹YùØ´¿ *T&Ù.≈∫V8ó∫ø,&ÍiÏ_Hk®ˆ‰HÊû(qÍä’V˙ñ|9eÏ¿‹_@·GHÒ3#•_•⁄œPÒWV˝Q
B]íé4ØÏ[ìr{%›ﬂ⁄K≠XV≠rZÜüUùıà–í;Ωë®Ÿüç«:™;Æú´ñ)ÃîpÙΩgTƒ)⁄ó*„2)alÕ‹ÿÚ@Ä¢ù—0£Œ*E$ÛófµÙ•V>I.Æ;4’	VŒEü˝‹pæ◊Èßz?ç‰rÅ»úbûÏVàã≈∞WÎkÜkLT-F€Ï YÍ›-Ø¿∂Vú∑˝
{UKuë§gK*„‘±añ≤˘óbŒ™fQ≠sx>U+Àë
\5Ÿ´`∆ìÀ∆Û)‡TÙÜÓ{˛yp¬îbV0)‡ª·ŸÈ1¬ˇ»†≥ï◊L23Qâ2πG;Nt\ó¨“p≠&∆vËg≈@ıZK≠⁄(¿SYˇYù˚œ\WVçŒÜÎÀh∏*^P8T$ó*`?Qè+Ω≠PfiQ„–µ≠€º:jø®]⁄≥nî9™Tu™à»⁄¢CÂ{•[yy#…gﬁ›%Ω”˜W‰§ıSèº Éao¯~`ñ÷<…Klêÿ\ùùº:˙%e™ºÊ,°0¸„‡!É˘î(ìhË:h!	¶WÁf!SÍmKµ°6∫xp,rç‡ÄhZ_Ó
—GK«ÄWœõá…zïä*’î≤§7Ÿ~çÄ#r‹I∑B∂§ß˙Õ
Ê·ÉZqE®oŸ.it0ù≥Á7ƒƒ–Ñ%≥v¢]Ú°ë›ˇÖ<™£w≤∂∫mr‚ ±öG•∂ŒÎ<˜B„»çœ∫5m£MC*÷»ÂE°yt=æº –Uﬁa€óÛ`Õ≤ÉÜùl‚ÇdYºãKí=1lo´Mﬁô•¬Ma–Âƒ‹ò≠;¥&®F∆iv±›&ß(/´÷FçèYÏM√ñ_∂…[ãZ5ãmCsÈ#√∆v⁄‰–"«.¥≈ojZ˘ÖãˇpbVÅ”˛\¡©1˛ÃçôÚ∏4¸≤ùÙô’Óíßr◊∞4°œC	òÑ©Õ¢R/)Ô*Z£jd7∆+]õJ˛'gÖ∆Çó˘ÙòµÍúà◊ÆP+•‰#U‡C¥çÈe´
~¨¬F§-'É¢;Ç´°RÌ∑"Èk'Ø%ò∆i-Ù;t”œLÁ&∏nV*3∏áΩ˚Á˝'+{MΩÄ¥˘ˆËæ¬’™b*U<™“±vAﬁNÚD`kò…äº	¬©Çé.ÍÓ£`h‘Æh°¸∞A˜/=Aî¥ø%@¢nŸ”˙"Ωâ·ÎGYû§?§9§X$r1ç”d;•ñ_≈Û<)sàºÅ*3/ˇÍ9¸˘+é3ÚeD5º‹Êõ¨ô6àæRa–≈Àµ˜R°¢≈®Uã}¶Gízo÷ê±BºsΩ‰lCOPëÁ-ªiÒ¯˝‰/Ù.w1Ïıféf{3f©’å+ﬁOˇÑ£cM¨pßÔVjT¬ÔóÔÒ»≥ÖzHXÌ}˛<8IBŸö=‡ïgãΩ»zÔ',zzk¡e.∞Ô˚≈;§yå‡bDÛbCπ˘}·G∆ë/∂"%æ~øtã’⁄Z∞yABÿ•s–üàôÃ∞_æGÜ÷ç;Ypyò ≤Oˇ!Õle¶#Î”Çí}˙öt E√=ÒZÚp°÷πà≤œ˛≈òp>ÏÅ3ùÅD`„U~:éá?ˇ√«Ch
]ˆ∞ ”¬	ûÎa˘O•î’&ìYºr’b'j—∆ı_IÉèÇ[‘Ò€Ωu·4ÆR]ÖÕq‡*±=Ø¬4Ûl$÷‘g
/]âbmía-Ë÷sÈ©ä˚ó±,¨Ï»˜*˚ääYJç+¨˛âŒî¡Î‚!ÑPÉåQß"@IÌ9∫—°ˇ+qû+\˝†˚HÛËI5ÁÍ¶"π™JSÜW∂¥‹ÄU8Æë4Ò¢¸“&WÑÊyÎ 6
ŸñS~B±UE7·ß^^º›ñmÖ∑í ÉR1•L[≥Äóé@ñq¡Êπrn≠)9nÊqB$¢Dy’ÃŸMc“°‡∏"r1èÒH.°à—epµó⁄ŒÅ´Ã÷ªÚ '¨Jß[ı∫·ú©k◊∆Œ”„8ã!N∂Dí–?yfÊ˝•˙Z	¥Ì®á”‘§}òj§}Ö∆ˆå\ÃxElè∫◊
Ç˚Ê†&-)‰eÄêkè

°˝ ã#áÏ“òÑqX£(ÊÄZûshõñ X¥IÆÍ—çº®:È`≈=
–,Í» $≤¶Tµ.V…’#y1ÇQ˝@o 4§7.@ä›•∑ÁëVÈ5k˚	Uß{‘f"õ∆≠ıvµ ñ°Z6]Ã¢I0Y‰L›‚v`åÍüçˆÑ”'éq1Wá:1;7áN∑(·TW‹»ÇnB˜ƒ”òVπ`x9≈w1n>l€óâπ©ºiÊ◊∞KﬁıN{gΩs“;Ùœ«‰ÚÍ‚Ø˝3«^¸Éiœe<˚⁄yC„à«éoc˘]`_i"Õú±{Ìé-œªàI<q£ÎÁöa\7“K[:u#d¿≥¶ﬂ¡ç ºOb-
ã‘¥Ë≠ tGπÔÄΩTMâ{&ì4Ì8ÅI†·ÕSÏü›ûh.j”äl ∂Eíé yP?gúï⁄]:˜NB⁄œí6«¡t‰¶/Ôë¢7@ª›Nª-≤Êåç˙ÃäC˜s?MØ._`X‚)]‚Ø“€Q0uöÕΩ=¬†\Ú)˛|˝à:ÿRß–;'<¥ê2Û äò†êIÙŸ‰giÍe:˜‹Z®†Ñyó5qm€ÒŸƒyàà`2f’ ˆïÔ·DV™ Íù„°/^!ç4%(;bÀ0ò‡`€‰ìÎ‹I¶(®˛Lø¬T6tLåÿòvAC2NmÓ◊◊àì[RYß;◊9≥ ]ª·¥˘ÒØ5_¿AlΩôX3R«Ø∆◊i€èmJ«~õï	‚Q√ÆÔæ˛∏"ãH«`3»5õ3`ﬁXÏ¸Q*
¬√©¢,‰êeËœÓ“‘eaz|'ŸC°√p«j“º∞àø»[Vü9Q•˘Q\bªl›dÎÛQﬁ⁄`‹—õq8w=
Ê1G√πèÆ-/rVVIw}}ΩÙqûÙ<ñaìÊkgÀçÖ5_@€¥FezKîÏôcg∏öÏ…Òw∫ë@§Ä»ÑuO »^iÓ•fz¶/#ëÍùû6dÎ†C -Ê…Ä¨Õ«∏•ü\ò]⁄ÚåæR4vƒ˝Ë±sõ~™Óﬂï˜¸wŸV∞∫£yÑ€–ú6K #åüW+ïÃ‡ÔUãˆ∫–Wä1ˇ.M/ò|zxã| ÿÈ>§,ÆÊª‚‚pœ†\e;ù¸`ÀñˇÙQB-o<G6ït6[∂uOË¶”‚€î_Í∂~v ôˆ?èèpå8q∆∑,5{¡K0Ïe…∫À‡êVW»è©K¡ûk+ÀÓ-¡È˘71—.;Öñ%„çÔú`Ñ†\DÁ?à√Ñp˝ 7ÓEJ∆nÃßªÑPê«ø ÀS‡pÌö(Oªp˝¯ÁGXa¯˜˚ÔÀ√gC±≈Â Õ®v:«“—ª+‰{‚*Nü jïu‰Uﬂ3tD†´c ›æπñƒn7y€•ûs´‹ 4i¶+Ωö4∫öÆ¨-L§ò>Ô±¬ó@!õoaiüb9Õò—WŸÏÅbÊÜsnÛ!=íhÕ&≈ÁùçÏÖè:˛ä±K‰Ôs¯qrX‡…Õ‹|8Twx®”•‰∑ÜÙ˝Ù∞Q~Î.7Åﬂ%	◊≤ZÑXÖs>C;
Àœ™!óæ-·ªCEt3iésﬁaûz· ®éí¥f‰ÜO®»ãˇP‘“"¶»OI∆Ìïﬂ‚®öëÓwñÌÜy‚"`9]Ä˘—¿	?πcßm;p¢ù#nåi62©∞±ZX\U™†ﬂñÑˇ˙!Y†G“¸˙!¥ïÑóì±mötF≈°œ©1∆tË™|òWÒUìõYP[qÏ√KÎ;ªÎÎöó.Ê1∫ÖøTΩ%œúπ»
¬7ÑY∫äEnUµ™OBÅÂ-áézKdÎüÍvMd¸-Fæäü‡B…>bgyód’¨Õd¡Uo!+≈ﬁ¢ŒêXA˛Y7∞`‘Ëñƒ’K˜ór7%“8iN(à\™A÷ `M¿M¯ﬁª`Bá“
œî◊ÉVòaóägÇgLwBRçÊÉË?exÀ¯#\X ¯¡ùº
É<˚/ÆCÈˇ€aˇÙooØéè˛v¯Æxrz<J{Á_ıb°˜BöÚg≤3º»	¶jOvÜI≥C\28É∏∫+Âs]<’’"Ó¬ÆD†Ω<zÈ“‹Ì˝œ≥ yuÓè©£≤Ü¸0
zE%¿>«˜à‹g!—CAw?Su
º…ı*¡ÃÒõ∆¯€»≥¸€rö<j˚æïQBÀ»n6ﬁZX‘nÍLGÛ[ã¸
w<ãåù√Ωiì≥`Ûsˇ·˙ò7bÃÊ32
É;¿mYÇ>πìA)_çxÍ°≥¯XVZutq8¸Îeüæ)Qj´n;ñ-µl“‹f˚G,wv¢‹Ô≠∞*C®è?Æ±œdFÒΩ¸	0Å}¬µô\[S◊ªﬂ%ﬂG˘…âÙ…π3wæ]%Ω–µºUY>∫óÑÓıX€Ü£∑K0É∆Ñ⁄Èw…ˇÓ8›W£	c⁄8g‡Uò]¬Ú‹@Ã~Ò∞•·çÎ∑FA¿åw7±·ƒºú‹ú}&Q‡£˜ø◊Ø;/ªV:íÙïNø”`“Ö1∞˛vQJb6#˜N2z„ŒAC¸.ŸYáWËà©gr˙ªôE¨™Øô–Lâ¨„ˇr]≤'K∏Ω˘rsGΩÑS ˚ı9@cÊY∞e®˛CVxùAÎ.˜»Á…2 úÕîè£Sö:⁄–`¨ÒÌ5û¬¯ÆwÆ≠Î± l¯|£BZ:÷,ªodªÊtùùÎu’ÏbÃ%ªsÌxﬂ≠Øì∂Î„Y≥∆ô¸ï<ùübÃí;äé&´$∆%îq<≤∑úé0¡mxFÁ#B-Zù’≠cÀÈ¢µí≠ΩÓ\o]øZtqoØ	•LŸ‹ﬁﬁ⁄ÿîÓ¢æ!ƒûB;;[õˆ∫≥@;ëu‹¶0 gs›∫^†!ÀõYB;Ø^uFùQùvÆÉ ¶»FäM
5NÈå®Fêc·”‡≥Àq–rn‘5øÊß∞µ.ú7ÈV\WÆ◊d‡«59%˙iÉﬁıfØ¡pú2§πª’?È]&	ÔÛvXË∏´Jl∏9$oO/zß‰¯¸Ë˝`xuLﬁ^]ºø$√˛…˘≈È≈€cEóA˝ÆΩFäD)◊Öœÿv‘ò”˜xÄôNıQÔUäœN/NzÉcYs^ (ro(µ¥∫∂≠2DÁ”ø:æ8Í”$∫*ÉqˇÙ˛Ï¥˜.-d L óÆü®ÿ≠nnx1Ñ?Í{	®`ãeÉK⁄.pÍ÷"+¢~@)ê¢µX≈≤±ß°∆Ø(=~{~˛7÷ãÖ#à∆˛˘0smc˚ÁΩ≥^∫Ï’Øˇ‘;ÄE5x^z˚∂wZ˝‚ªﬁ’qÂ[…ú•”dY&û÷∆OΩ3r÷º?yz3óÔOaÓOkÁ¥v˛™zÒN˙√˛Ù¶ﬂx¶ )¸J	ä?∆*ƒçóÊ8q…sÍ7:„,2Ω,e›kŒ>∂µK¯5∆çìÔI%Âa„-Ìˇ8Çrˆ MéˆM»ææ‚ä¢L5d4÷ÄÕ≠ó¨kÛØÓì1KUzIÀ+&mÍV5!{ú≥˙˙°ôY’¶åŒ€q7äoæÎ_—7ÛÓI„„Î¡Ùa5÷—∞Õãyº‹Fs782Â{ﬂì˘…ö“êÙZ0Auf£U„B>Æ¥\ø˘Ì∑ËN¯§”
¯`f˘{çŒzC≥6*ç¿´Mkc¥Kó9"’NΩfhÜÔƒøêÃ˝x~ÀÕe∫“¥ü∞™`|%ÇÑG*Ú/rèL∞–∞éÈyÂuT¸lˇ»ÕaˆËÍª™…M oEÑ∆~c˝…,ùøhyãsä?r‚˘Øs˜I3‡;Ñqæ·r˘∫h∫3E\b¢≥ÙΩ¿BÎd¢1mÆPU}H5ïÕïPÈ*ÎW’>")∞Å#Q~,6.(H€i0÷]Ë∆NS–KñTú“œ∆ŸYÙy)ÍêÈ_Í‘#C˜€w˝ﬁQˇ
d∑7‰¨“€a1üòº›B2Öâ¶ªbnÖ\R∞MM™Öb√π‰“BÙVO3ZtwÚ-“Xá4äÑyDV˝BàBà⁄ä÷OÿH3ùt‘—•z›õ; ∫sbí¸≈,&6ä’e≠4.[1@UI I(˙ï‰Fó"¶AQ4L¬ÖÒ™”ÇIU‰ä¡)sH+è˛ÌL”z6]≥B~yñau‹¡èg÷Ïê7/7≤é[]ûCNp‹Z©U@ëÏFØ 1;3 C¢ä–ÕÚ#ôùëÍ™s⁄í£_¬	˜ıqh1À']rÊbæ •‰¶&ÄÚ§ƒ≤ ¢¬∂Y—ï‰Á-"—≈xèı¨8ìfÏl®‘µh`çbı†’yàu°œ“Mìâ˛¶á¡ﬂÊΩ∆~97=>öh"√Ç Ï-«æ¥Ó1¿èÌ]ç¢ ’±Ÿ,1næNà.T-∫≤A—¸≤’1Ÿ9=ì˜≠{ÍfGΩŸÓı_d.}¢˜[€ ngmçÙêÕG˜≤ öuØi
M∫te–ø©£m - •“9≥©u‘Œà˚—‰F”≠ç|æ'ùÕä¸ø_rO£ªÛ;ö∆Ê¬”ÿÏ˛V”P>3ã£óƒYW%ºÀâe¯>{˘Í«Ö‹˛ä—hdË|"òÕCD©]á49Ò8Å≠ÆAﬁöBc›¨±ÆÿÿFk≥~cYcbc[≠Ì˙çmfçmäçΩlÌ‘oÏ˝`xq÷ÿ?°ÅÂdà˘∑ ÿ{w(ÜÎ€ RÊ®^–ßÇai`PM®N$Ò)óMr0ñDïd.Y Ì”›BQÆßÊµX¸<vós”Ü4U°1$;1,UMË¬Ö$By»tW"“òñbaEæŸDVI…ı˝uﬁ˜ù2®•◊:¬{˙zr˛⁄ım˜&†út∂·ç˝&gÁiØöö‚øWYÍã??Õß@hby∫àèÂÉ‘iÕ5¥¶R f>çJ=%µ°πd›]◊ÚîÆÂ‡T.äôûû∆˛≥uÎ`iAïÉ§;}BÉ°⁄ÃçpÜz˜,@ı`º∞PAx˜Ì‹·Úy¿\ÈÙCÀC“RÔÌRüôé`›Ë5æÄ>ã„¯ù¿>›R≈K]ﬁ]jvBı‚¿Ø∏-U}^úØ.N‰†wµK˝ﬁ’·ªUÚÊ¯tÿø¨íø˜&gG}¯ªwtD^PüÌÉ˜√·≈πôé\‰S∞Æ¨·IÀÎe¶vQ/£Pøô´ÿ≥ÓBkVÜÍ¬ìâAﬂw4ì*ÔÊæf·∑¶u#RM=/ŸM°ãmM&jﬁæL[OÛ	m`ÕjÃ&¥÷%Ã1ì.‰=ΩQ»ÒcR'⁄àã◊'sÃßdƒé4=¡πŒXWK)–u®W1∑Ã•”F™õõ‰óÛZØ07+ZßŒV1dö˘'«ì_„y¥Ks=u≈IπÆíO_Ä…F¯ÂyT“˙ùJ@÷™4Uªñ‡´÷ÿh€“VLwNR√ÍI{U7∞DuuOÂÀÀ‰òa‡LÁV∫U≤xû§^ONE≤¥\-bG¨EÏT’"~píê#¯+ãMs“òµG„Qù—≠jB™
≈JÄ¡t¿©Yá‡™ïzH◊È(jÄ∫LëP÷ø4§ß:æ∞	l¬m≤+ÚØK∑∂Í§nb€ä’oË
br˙a1’lˇ;SÃà”Ù¢Ù≠Œ" —+cx˘z+Ux∫¨†∫hK‡™∫%Æ*e·`ıu÷ùÙ◊π#g®n2Âµ™k‹ªÄBP]s¯”'Ösj
Q¶fÄ˜Q¶rOäyöóŒ)÷+R,ÇæéQÈƒ&ÛbfanZõHÆ¿ëË¸bXÃhó4
:¡BuvÕ…“W/‚ËÌågä*Ü$w[LoàÂ' ±∑X: 9ÉYËXv4q‡\s∆}Éz\ºEﬂ£JÀææÊRawÿ;8ÌˇÌ®?Ïü˛ÎAonvl¯“ÍGNlπT{èµr RµTZßòeÿA@≈nÇœ*°Â(∏c>êT%ARS-§ßp^à%7„∂Ã•¿KUﬁ◊!*¸<(ÅÍa\ôã Káπa·Ô÷´≠¬¡©)¿§Îü)J%A÷d+f&XmΩ&.Å%8Ùlõ◊…",˚"zÅ\\ÀÅé\æËéı∆:;√∫—,cÇ!èì¡ç`ÚI°Çﬂ{ôw}Nô⁄…_Ÿx÷∫ÎÅçÄn¶h3§~ó©ÇÀsëS¿8—‹øqî$Dï+¥kÇ"T.Ωyd§€¢Pˆ=·„ §Ì'Cüêc±‡-ÅWõdWÿø˚ò◊ø)Qı¶<zmÛ7÷¸kÍ=eíπBv™6†∂Uñ´°»Öî\Y^ùR~Se–K∫Sj"—fîò¶„….ñòGï&ÔÕcR∫£"°Tr%ñ_Æ ÿì]Ö‹=ç™˜ì<>⁄◊‰˘´í+√∂%pPÓS˝+
T\4|•Ë8π˘õ‡caDã#dá»Û–«ûcÇB$ Q(«ŸÆ´∑•Ê¨‘^E:ªÑJú‰¨7º:˛7¨7¢'JL«ÁoﬂæÔùìfö»	d¥√>˛≈ƒµﬁ’ÒäuóïRJWÖ√k´'
ˆ≤BlGmv4¡Â8NyEîn…'∫F≠nïÆ“jÌâ∂Ê@≠Í/ö*Ûòπ¶ÈövØ¿∑ÀånÍª°- Q`rLÙ¨¨NßÆÆ˝ZÈè†®;°]îœΩ%∑f≥äπ∂ùÖANW÷¢¸—µ¸67lOp&AL≠Ê6*¬0«˜åû$¸ª69ÜE˘’ö≥gÖhg=çÄ‹N“◊4ã°éd®JÁ†Û`·⁄©ı¯≥∫ÀNﬁ„e>∂¢≥.—$Î!öÍ¨¢Ô&‡‹•‚:¶ﬁc©„4Î´√ugE’‹/≈¯Û˘∑<—bSAdAÀú∫ Fk=of-8ßÍ∞N#¨õbm^>‹∞§·>$&ËBö)É“)˙Ñ ÏçPÍπ±ìÁxñw
¯∞ÚÙâ3/I¢Æ<yB®I	Î≤o≤∫ﬁ1=˜Ãbù‰F˛∫Xï¶D7lµz ùÌ“H¯‡d√1œà≤Ñë—ΩjòÂU¡K˚Ÿ¨Œ&»4˜9º˘‘è*ÀaÂ=dô≠⁄^%nemØdÚ‘`Ì>Ê°[R∂Úõ¸¬⁄Vu…´Úab‡∫πëw.{∞ìÑÌh>b9ßõÎ´d£"¡RE∑ÓáUK:úOÕ⁄ØÇïïRä…B'7#Tisr£õÌ Kõ,ôÕ◊±¯q»zÊ˙´¥c˛ª‹ØI¢M‹@Ù	nÿxiÊJa»∞CÄ[˜ÑˇQUáê]èZŒ$Àt£◊æ¸Ê”Ÿ/¸TQ
§ÜXÆsíKlN«#OmŒ°éFw•Ê˘Àƒ»UR^Ö¢!¨`ˆÕ◊`∞O¥ﬂ(r/$ö;â3áÌ»·™Ç¶kΩ\5‘a~5ÿ´™˙)0#ıg.íMF·ç2Œm§ù∫BüŸê2˙ôç+ãßÁ
ÊáÆ¥LÈ8k«tÎ 
≠ó¸ê”q†UútÆ…
ïo˛*(ÄuE©ö	»Æ
gScπÕ_πΩÓI!É¯åœœ©“7—‰k§¡*^>æ£uúæWX^’…lrf˚;3≠h“ÕŸ=Õ∂¥¬0ü◊å]XÙêåÕ≈¿L#˙ãÊÃV¶∏/æIô>ù˝ÀÕÁ\˘öñ˚‘SLv1∫:c≤'POV$%ÇYaé$¯´"¯Wl€ç.C'bIª±ü/ÑjIb	ì&Ym ﬁ‡JÅX~ˇΩi¬8räˇï)˝~èú”"?M…´∞£UÑñ]Ü‰ñ]∆Rë†c TqYπé¥È"§T#ßË@MÜqguQ=^Rt_®âì0â`ö‚xºDùª÷ô¿ˇµ˛rÖÖ(2ìì˜◊ôr≠Hﬁ™±Æ˜◊)_)»◊˙*qÿÇë§N;EKLWf⁄÷πÊ»Ø]<`5ø!<ãüàéˇ·˙u˚f-·Ï-<øó”dyÙÁÀúHª@€ª•Q0ﬂˆ"M%ys''˝ı‰aRü+Q	ôWO>°m÷n ÙK~
lì¬
¥∂]ÆtN`Â+a¢ÚÏ÷nH∆#f6Œh‘kNç{Eãò)Ä≤c+∂ˇØ≈Ñú,≠"µ4Íå“ÖπœÙüˇıü| πC”O¨∞7◊1„d„üˇÒﬂÏFrU∏ÉTåI„‹!ÌÃX\9HCRö5äÉŸeÃ¨ãe4òÑ±Ë√¬‰ã¶`e Îû†©ÎÔ5j£‘©ıyØ—›¨˚Y;3ËñÆÊáπP∑⁄£Â±$Ù§Rµ¯÷ Kve&I<c67-ñ;J◊÷ÑŒjè§ôup$◊·¸qˆ±*Ωî¸™U√Ä∫põ˛*xø–ŸË˝_dóﬁ›E˙E]»Yã:ÎeÉ¸≠Læ+©MK)Eı©®N›…¸–p∑Œ\ÒI8c™≈·?s-oe¡ıÆÔ◊G‹◊Ì«?YSr Ï«Õ7≤àÌﬁQ‡ﬂ‹Z>à“n§ˆ≈ó_Ü2}r)rÊÌ»bÉ¯Ïsi ˚?MÎ®áxØfZÇ‰2ñ j¥k¶Å†
ﬁ™W´l¥?uh9õA¡àæÖV ŒÜ©úhÚ◊C^†VÂ,D¢?ô`#Bˇ”ù~özG±$Çá±x¯”—⁄ìãíÍXb~,+ﬁ~ƒÉ˘ëg_ tıFºÙ9“Ù0&À∞B©÷z5WëßúΩíÂ*ËÏ’Îπ}SÊîX–ÊéWñ‡<çÀè”,∂+§_Q˚€©TÓU’Ni∞ë&ˇ9¨)ÅR3Ò∂ ÚNÖ›]2ÏÙO	‚Üó˝+Lüq< º …BŒÉπ£ﬂ´˚‡rd°~ˇ™.-¢„ ¬é)9ßìe¯ì$vk˙ähöZÁ¶}ì*=˙¶vXK’e|ÕHñ?+ÏCN˙‘˜‡)Œ8˘ˆ_%ÎhTÛg°vMä ô7ºS«!BªÔº%≥∫AÏZ< f°’Îù IÀ$9óµØÓÀ*ë™ÍI˙E5™≠dÏ¡DÔﬂùwƒÛ˘9º¢çÀÎ=-≈V+¥æ@=(˝l¶ÅsÉÓ◊ÆU±bÖ›ÿ64Ã’,GıEd+£ÅSA—HñçnÆOU)#/ ¯Bˇh¶fÈ<%bﬁÿ¥&∑BÎÚ∂µ‘‡!»‚Êmï≠Ium^z[WùññbŸ“Y¥Íµ§≥_ôµdfå1S=´∞Qò1iˇÀkCäxn;≈sıÍª-´«’ﬂÃªÃm◊méiãı„>J  -_ªc‚´$z'M≠œ»‡—J≈øîù”juF&Ørqª%ÕÈÈ|Ænejê¢ãÊŒ,u]YjÆ/] ;ld-ÉÀÇqÌ≈KåsOx¥c£ˆ‚ïÖªó8…ZbQÔjÆ±^ã,¬]d
óÌ^ºíËw)U©◊T_¿Ô&ëÚ≤¶h‰|sõ“ØÇiëØZ˘¢7›JΩ¶y~°’^=ãÂSˆKΩõ[?Û*tLâõ◊õ>…Iz&M
ûÖùíSk$"%}BìÚU√WõÔöÖÎæ¨·}Lﬂ*g>âGéÁƒéASãºà›VIÈ-πjÏ˛3z§ßõœ\“üo˜ÛÆÁœ∑˝∆`3®rC¨zÍhxx<ËrçszéÌ5Èt†K,Éò¿|p¢“Ç'hΩÃ¢uÖâ#'ö[.◊€%’âˇîvº ˜rËq•ô∑˝°’oÿ; ª‰Ë‚‰˝Yˇú\ˆœèﬁüº?[0Ó%f=V˜rhçxÿ¡-˙IXzÛ‚¥,…Ûc"ÛÕµvº®ƒº∏à\QN≤ù´*îö7÷µ51¯¯7π÷˝Ï…◊IÊ±£MÊ1ÛîÇ»{LI1Åe£ÀON†ı–∫%k‰Œ¸≥çaÓ1)0…3iT˝Ìjj®7[ì≈£yu57kTÅ˝Bµ°Ø–ºl|πvïßìJ9‰ßW‡Nêv0∆9◊Kƒ>2OËü/M KLvSà\ûBµ´‰ÚÇúdggïÙCÚ∆ı’˘1•uxZ©ç'¶‚6…ΩΩ@ΩÂﬂ=l›ôÛTÿ4+¬
Ä705º]b˘˜Ù·óO*'±0°În'ìdæ"Ñ∆>ûÜÊ`Z1≠ÛÊ«ò1ëf$™]uÚ¢±™y9«Üú[˝v(6ˆÈÅl¿ò∞
“ÿ
-2pB¨MÁ†hWøŸ@i∆òp&˝3•æµ[;µ\ﬂø∑˚¯GÀÉˇ`2Lz¬o}˜÷º“¢¸i=ñH/ƒÍﬁ0(+é¢€1,ssEW’Úú0n6Œ¨h~{k˘ƒGJ√˘¢Øt≈Y(†ÍπÍd113”;§‡≈“‰(mÚY–?¯*G#–óÜjÃ
E>ø‡vz¬≥teÌ√ìúí0@5E≤√/$ñ¬∑'!Ä)£$Ö.ïË(Öª≤C]é•≈Tòw√ ,≠ä<…X≠ÂÒñRjhÊ÷äµÃ{Ÿ,’ªgÏπc'ìã^'û®≥ìEë≥õµ¸˚Dm’÷ı¨Â‹Wﬂ#O≈„j]]Tx[™‘É˙‹íõœ¶Íúò1!∏„îf{¨w
zéŒë«˘ÚΩ^xŒ‰7ò+K¯Â;0≥¡_Ä7∏vaõ›/=níwo&0öﬁ≠~ j5ã÷≠Ã‘•L£f™Fk®J®|…‘…¨∫!ñ´!W∫ö•nf2≠k•Û/[[¿≈¨ds›îq‡%è)œ¯R©]SÙÅßo´Rﬂ£P≤Täâó…ñËdí//ú∆q	qHï∫H:ªX+7Ò±¯u,æ@⁄‰%Ë@N«ô ◊¡˝ˆ¢†¬-ÊI1⁄®á‘H*´£…Ù4¿‰‹˛◊pÌ÷ÒQcï<á}è∆€F4·Ó¢Y0è∆¥,{çk-Îí:©…5¢L z∏•·öâ~WΩ`ëOéQp˛rº—ò≥UÄÖìw+˛€†ç«è>( y‚,∞n}dπA√˜∆ô„#É:GYó˘ØsÉ4:œ{69…´:¬lø œ÷»%∆‹B)µMÚﬁG¯◊»,)©…◊…Áó/‰ë•1>?ﬁÁ˜´Aÿƒö7†‡„íåUoÉ°e±r˘4–o“àÃ“≤ó¯π∆>¶AˆØ˛“ø:~s|“√0óƒ'‚]ΩaMi‘;+ù9#Áv¡|π£≥^Ê¯ûÑVúq¡l…ı≥‘ 'ruõ\œBeó≥ó'®Ö_%VlÕôﬁvÒG§3fÍW[∑÷ §J„•“p)UàHnñn…-ëõª‰ßﬁ—œΩSr“ø˙©G÷»‡]ˇË˝iøXÜ[aêånù_ÁﬁìÌëXÁ&O{Ó9 c‰∆ojå<ò[1πr¸1lÏÿOñ}gydhM¨êË[‘£K„4En¸+ò"”u˘Õçë	ò◊∑HÑ/ühñº|HÔj∂.§Ô9∑ò’“ÚV—$ÈFX‚ˇ1K~A≥$Ø{q6˜,˜9¡TWÇ∫¶,ø≤ú“OkÊˇ@îG∏\˜ªÅ©æo/Q·ø*<=ªÖU§;‹ÃäF§Ør=wV€¿˚Œ¬í‹®öΩµf.Ï÷tnc&I»xî/`ïM D*\ã3œ~—˘f?q≤kméˆ*M∂§å˛ÃﬁE¿^ñ!XR#¯Àÿ|ùp‰∆(fqéTÈ∑ko≤p5˜í;7ûåB˚‰⁄X™¿‡&t¢àMåD≈óøkk–ù:àU»ô”ä1√Y¬„gLZŸBú¿Ôí,√î˜ü⁄ªfûàÍ—»:ÈCCé˙cV†b<—oËºXÖÒ§hπôµ*™*w≤ºq—4g◊àjMiú¶∏ùæU•ü¸èì≠rÖ‰©÷|ÑkrÑ∑ÁÃÑ4Ÿ™Ë°~Ω7‰[¶±A`ﬂzÅπÅøKË®ËÇ†„ëDk6ªÁ¯6ΩS°Sicè+÷QÆ€ÀüoUä›m°¬ÿ∫Ps~Z•æ¢”Kp’„7⁄ÒW‘H”œQÊ1*›X2léqr!Ä¥3vØ›1Jä.µïóT8≥”ﬁ“CruöW∆KRìá^ﬂlí¡ïÊk’Vµ«+cM”ç¿©Îzh≥›ıs∂,é„´L)•o§»ÈVú∆ÛºßyHlœ%yµ
[¬U~√0hı{<ﬂjÅAØRqküÎ∞Ã·O[HŸïâ>∑Ä$øÍèyQkå∫hÅf√vFAÿö.UQ'˚ºÀÔ˚Aåa[¡ùﬁ2®+q´≠©~(’÷´5ı≈C
§ºÖÑ€Ó%aDò@_gã.ªXi›∆î®Ä©ÏßòJ’ä…ØåUú•é5≥Zˇ6y;˜©ŒûjÉπz>´	 æ√ÁŸß∑,*#Bπ_π∫!r…zˆ-Ã˜ˆ¯]ÔÕ@g«Ádçúüˆ√ãÛ>98>==6ÇKı›2±è%E¶Ï“≈ËW≤GÄ©ºuÏ#gø	Bé8ÄÌ∫…§∏œäè4eÔÆ&H#Z%◊Æá«µ<^¨ã∫Áó‹èµ5·@ø"cÀœ=J£›2”«Aƒ2$â'H¿@Ú'Ñ=j]^¬
ûªûÂíÅ3¢ uyyæ"Y	7∫ú˘}ü„¨2Y⁄Áƒ¬Ái_[^T»BÕö∞g3÷o˘Û¸êYYír≥ôü4êŒk¨›;i”c”L{˘é¨∑;\Zic4ˇi≤ ?É‡É„ﬂÀ˘}⁄]°B
ãÂ⁄X¨	ƒµ)¶ÕN!• ÏØ”'m⁄„%|Wxeó'˜‘≠
`¬Ê¬÷ CRÚfjπ>»CÏ\ãË/4#8] ‹X”P:œV~¸≈™n|Ö—08r#`iÓ°ŸíZ`∆ÜÃ÷ ˜Ò 7ÏâDp)Ωç _ƒ«ØµüïVÆô¨ÓÎ6.ˆõ-8ﬁ…KI˘g–¿á_äìW‘∫1∑ƒe|‚c …°⁄L∏ætÁ¥Ûê¢y*R¶1…8 E2Ë◊vë"«A+$◊∞Õπjèü\Ksáw¯è≠ú√CN^cR\RQ&≠±"ÆQ›qxØTh∏Æ)L-ôUà÷ïó∫Áe	”Û^!k›ÇkRZ]4ÀT÷	Æ y∫/∂ºQW›°ö6K ÀRõH_p5‰JYI¢»·∏Eë9ôBåûFti'ác2Õi≠rÇnSÈ±yëj¨¯	“å^]z]œ<ñ•Ù¢7E°.åf.á√]IÌÌ|Êß§LlÜÕÇ;@DµoH/ùs≈›'Úœˇ¯o^–=â´=ˆ«m§Á’˝'0HS.^Õx“’Px@ÆT‘KT™jÖ2¨sájÚgª ˘¨Ff£»âè#Fî¯>–ú)3«oR¶Gõ8≈∑>π7ËW Ñ⁄ñ;™”ËkR´‰Òµ≈t€ô.n≠#/±;])fÔ ïÜ≤Be0ö%#¯»Éz2á≠©]¿wÈÛB‚!ë˝{'óbÉú∫Í”ay pFnÇ6îÄ©wà˚sÅéËWÚu‹ÃkÍ^	>?œDú„H'ã¯…¿sñ&m»A–¡¸÷*íúC'dzyÙf!8™ùC°å®Ú¡™2¡nîò∑hö1oï%vu‹öÚ I8ΩJ]π]L›ëcÆú[k*lìñ!–≤RäØ^ò∆¥äózºÔË0©b%MÒB¨+‰ñ]Æ∞aZàUx˙)p«Òäï¨¿c>ôbl.Œ‘≥fË¿NNú9L˛H&94∂: &•€ÂBXã¸R‘«ÀXU @&O˙Œ≤1Xãú|ºæm]^]¸‘˙∫d˝¶Ù£π±∂RŒ∂,ï+¢) r‹/ÌÔÎ*_{A6Q—ˆ=WXæ†!ˇ;—JuÔ|&ªˇÀt80pÌ›l˛:p2Ë›Ù/›€|Í¯z=ï4övI„Ú¯= –fú£)≥ Ìc‹îv"ã*QQQæòncëIh`÷G]÷p[º+UqËæ≥ÁŒMéXÏíõ»Pÿvú7π.^Òﬁ äD]ë¥±õ•[¨jEöçÒ€·∑òçqElH˚¶n∆Iñ∆∆˚ÛÀF-ÈV«â∆°;c÷ƒèr,Àì∞,¥k!=/ÍÖ0.ò}¸$ufèZ}Ù09âÿöŒvÈ¬¥˝‡Æ©MΩH’=Âœ©§Ù™'f0èÖ‹˙˙p(<Ò1œ©ˇqxuÿSÎkóY=<.q∫˘zùÊ¡Øh ∑{q[¯âÕ=°·Ù∞µŸ_TK´ˇƒ˘<É’tÏ^˝OëyÑïáM¿œ≤_ürZ N8Ï@ˆìßÆX¿y˙)ˇ”Ë3*…ßbxÃë;≤Ó≠c√ÃN2À‘¨Ô/9— ÆßÔœ{yv–?}FzÌ]U¥ ÛëBÔö◊WV®‚T-hjäB≤º§ùí”®±*–À‰OçÃÉÌd_Æu>·!˝¿ø\%Ìvo˛¢ocXQ|ÊD¿Z≥¡± Ô	àìî]S(¶ÿi“∫ËÒ‹´¥á™<´8@q¡<Ê∆©‹«Lb\%Î¿≠(}˛TB`^‹™ù˘dQ¡/ö ¨ﬂ∂÷M%@	O…“ÑÆsMGëÔ2∂¸ƒ)ÏùÇAVãv5Îîe÷ª¡|J=—*ë∑Ë*&≥TƒìtP~˝Àº·Á¶Fh+Kíõ˘˝WE|"í+s*<ùÍ&àPl2Sv2Îe¢Úl&:OπCÑZ*è∏§À.(J3ïørÑµ5©OtnôeıtTk	gÄäõ∞t§”ë˚P)¬B]HSÎ,÷v÷ÂÄ˜õÇ[…LNÌÁœgÊ5É≤ƒl˝•!À†d≈˜	LÌ“ë&Vı•å¥6Ë	Öe∑ãó<{V›.äÚ27:ã#√˜º»n€s^_≈L :RwÓA›Ã;u¨I®%Í ﬂ≥{„~vÏ&s1y¸f°Õ®¿¨ í|Ÿìgﬁ¥”†;¿jﬂ	Àµ∆∫œºl¨Ê†´¶˘“@úºRÇ∞ ÔáA±ògƒõ˚Vd˘T<≈øÅ|MgÛ–∑>µz(U‹ñ≥ªËoxåÆ ¿j«¿◊œÅÈÊ:á!WpsÒJÍ≥P)Ö;LöYjG,πª©
UÁG(ãVOº_TY®Ããı$ïŸÌ§“{ÿ˚∂z˜kÖœº“∆∆/‡&sÈÕ£C7{©\µıXé¿†Ã’ãÁa÷X§ΩESZ2xXƒt#/Óæ LÚ˛Ë6á†´íK∆ù-‚6AõW;N®›*‘t√@p4Líµfß†ä—’±Â€O	“%à≠±d“‰0:6´“˘]uLà6Æ◊ "√$≠ABÅöj}RypÔêgŸ´ µ~I6÷øÅc9Õo≠MØ&Îy|L∂÷ø—ÕD2,∫©HqÔFU–pªâ1ƒ÷xÌÚˆ8b∂[ºèáÄ_¯!ºí°xÂºî—∫≥¯:?4-ô„∑|ßõﬂ¨|Å”##ûUÑ®FîOçoF—KxÙ.SSCΩ®£‰fﬂ◊9àä£∏QuıØy–¥Å?’nYx±≠g/Íó∞feCö A—b¸vtˇ…ï¸wAòO	ÿöHæl "%GSkaH.}2Ä‰™JÛVLpôCü'@Æ∞¨∆ërÖ•Ø¯¨r˝DZ™I;Px]8˜ïUTÕìh∫b8ûarzC≥åàÚÜôTÀüôn‰"ö˘„·U$]1òÈÜÂ¬◊·Ö ¸ÜãÍ|Åh†d˙UŒw§ ù+∫âe˘ïZÊRÙπˆ≤®Ù·è:yl^-Ä¶Ÿw’ã%uœª¿Ûﬁ_U,ÓCﬂSTWûS¨“CöER˚†π–Õã_+™D;°	rw˜åa‚Y‹P‰„O.ÚÑ`3≈&ÉÇ*BÚù\ÉXOßT=a]º´¨ÕöñKNà\8Ä^¬ƒb©œÚP[k¢“æ<oBºÆ\¥‹˙Y…—…%Tcf∫&0)PâJô!˚“!ã∫Qìü≥Çê4˘m>¬[i—úöù5ıê8≈	∑N•æ∞u∞k O	Ùm(Ü¸PàoÑ•Œﬂ1Kî_¯Üyâ¡=Záäzãal/b	#'Y7bä⁄=⁄pŒπá;Ù†WÒQ‚˜SÂ∏ä2o¨§ÉÃ#ã˛ÃªlÒH\e£äP…‚Æh	>Õ.C˚færÙO—uΩÊå˘•™î4®]}µ.çmåñ€ò0h9*çÓ¯ÊÖk+¯$µZÅM°:gåaÿdwePt†:ê≤ê˙EƒWî
KB&ß9iTgØá<$Ò„ù›†	FZË*óøøK>brÅ÷◊ú<s…ïˆÃ≤Y6≤Ó*˘v˝€ï«è’ô∆Õ2Tõ,\ VEòNÌì£bk,‰L‡÷ñ7Î:Ió(õ…„õe\™“ÕÂg(˙ ö%2WáäN€ùOA$…ËÖé+.·%„ÀåR‘ÂË<5≤+a‘π•N@*38M")…Y0~4ù$Æ‘"(M7∫Q>K≤ ﬂ-”4\	(âN«	‚Ô%∏«Ã8rÿ?f®ÕR‚ÅÒ†íNÜJíZ2¬>ïùŸ¶LO≤A—éG2GÈtiƒ{ã,ç≤ò@VFá&¡ß¨’ny ÜhT Ω:—úJ™«âäf±Ç0i˝ãz).s⁄#ÉÚ0úπ5ÿ÷äb0;%ö&ä(Ì≥21ÃŸ"mù˝,∑ùz÷,ßxL¬‚√Qdí˚ÈõÜ©‹m}Ö›‰‚ahãK4åÿ@«H±éW\7@Ò$o>©÷zÁæG—ehhá∑'HPØÖ@	úuEÇ;s+÷HP≈~‚¿∂ÓÅî±.taça√:4ÇTv≠≠ñõÆ®B7◊ú~NµˆIr"}‚ê±>¸≤¬%◊Dl5Z≈m#ÕDíC‘éˇ‚∫Û{‘P‚“;4Ü ¨’T 4}ù`®G\m=HÆ$í&7,à‘ºï\¸è‰Rp©
ØØGp¨6Â∞ãØcl“Êc1+í¸*FÛ0ÿÀzíîgçUôEà<wÀ†˚h`Ì¢&Æ/À_
“3˙+≈Ú(`khp–jÂ``Îf+5GîÙîX⁄'¸m÷-ºh∂#˛êÍ◊àceéÍ("∆¶Tâ‡d∑Ø]ÃƒÜ”µi	Bvíhc €ŸÌ4xYµ3ÿh≤qU„f˚Ç(*õå)
 ·U¸0≈´Y[<°ÿ≤pÈÛa”i]åZ¿©µqÈsaSc|jäQÎ·Tc¨ZçWÛÅí2¨ÁPI±fËTLô‚T~≤ÄªOPåC9
ÿ4€ÏºVj>¯hÛaõº†0KÆëEo⁄Ó=Ù√πk‰EQ/b3?ú'∆n
PàÍJÜ⁄8´:@;E sk?^z¿Ä©›òíì8ˆÖ?Æ±˜j7»∆>˝«¥ê∞®ÏT≠=\˚éÜ“\Æ¢!‘Aõˇõ+öræ Öp' Ò!«Ëd ™lòzŸ’8Õù®ÿ%≠ﬁ…>_im¡˛#ÊJxb%œLñ∫À˛F:rYõÍ£PÁNÕ„dV#Ù«7ÆÎ˛9N‹h∫‘çÜÔÇÅﬂ∏Z®¡Ò8Çì3øRÛ≥a
©ı‡î¶≥Ÿkº≥fp®ò¡æ˙£ö^Çx!ˇå„µNõ{3Î÷öêûo[‰ﬁ ! #_†Ê7:N¨æ˝Z0p|˚ÿZC>çù∂+göï ˆ4áé⁄®Ÿ/Cö\˘F=¢’‚i‘√ bNÃÈi•wJÙãﬁ-Ã¸A[:}ÜV4ÈÊ<“*…á…™.®°Aù˛AÓ©+J[Ú>˚"Ó”8+m‡—l?´QÀè
ñ®µÆcÍx3À|pXn˚,ÎZ[kaì∆ÂuΩcÜ§âÙiÂ€8ò¬ƒ·ÉÈ^'cgˇMSÏS∑E¸ê[7ú%˘qô&›œ¡Œ„JSûs{óúÙﬂÉÿﬁ;'/»iÔ†gñ`ˇñ'´´Q‘vß\‘VöõØµ5“ˇÃíŸ√ˇ±XEXò§uZë%û∏Q¢V†I∞i"|åù$ûcﬂ8Â¿Sû⁄ù}í&Ï@Iøò±ø}Ìz∞°≤£‘dr~ÿùkk∑9JGÈkô|»≈&yÏèÉ©ê@?£d …”eöò„ÛÜ?¿êÌ9∞hÕh>]%Ï3¯ì|ìs7Å¸≤^5‘˛g8†—∆zÒ~ÿ‡nµWé;jwêÆ]ÑLFÂ∫¯ÚπßtÓ êáH∑˜Ú˚— œYŸå√ûˇ≈µ–£?i≤˛%-Oÿé®pÑ•ŒËì´˛Iˇb\^ÙééÛUÃ¶LgñˇL≥ˇÍw9{>S™⁄Ωvct E=¨èuN‹ÑY˝	Sòbk„$Q9¨UZ‹¬J XK‰[≥Ôﬁ–˜3§ë(º
»D∆Ö®¬Mì∂ÑÍ5ïlÆ≤9√£!Î5—ÌÖ2Î£Tïó€hÑ,‹Ñº^ºíjTj≈ÈÑ≤Iæc:ı§Ñ∑)dx˛Q&™£aj‹JT¯ÚÊl—–@‚ÿn»™UÚO 0@«Pëâ9M1∞—U•@xj}n›—,jF’ó˜?Û*<ô.πö¥ê[Î»Ø77î…¶k¡Z´«´â⁄ØQØäIó5aZ?O[˚\ı£Ÿï_Àƒn÷ºöœ\k¢âuaãYDK_™éà≠´Iπõ]U_sèí JOçJüíR®≠§Ñ_évJµÚ≤zï∆Á)M·À§˛5ª*î•E.V„2—◊N≥¥Õù")>)Fï`@	˜`Æ,|cÊá<pb«≥&,ÒZßÛÕ
K'÷î2Oﬂë÷˛™h≈◊¢ )W€BµNÁÜ∫\Îﬁ"ßò≠≥œê°º›ºÄF≠»E1fÌ¿ÇC˘«¡b[OCbŒ<¶3?¢xyhÏ"ﬂüëUúõä« »"“‡¡8∏π^ØNi^πŸfÉîlfK◊’Û§ùö&¥OúÒÌ(¯¨_i◊ﬁKºØZ@Z≥YÖôÉ6ã•x´àIÕº(áÊòâ^
ﬂ)`ÛU@vÆ7…˛/qOSQàenTˆÊ=@3l=âßﬁõ ,Ôá9Cˇ≤\SóßŸô”£‘áiÆ/≠_≠4¡+WPÛl«æ´=òU9\*\⁄eº≈+]ä.8mñáµ¥´‚ÿæYe>B‚C| `ÛÍµiMT¡ﬂ;—‹roÖ“*‹ÑpèπY>WAÍqc|ã[’UÂT¥¸Å^áØ^U\ì4à&£ +FR9Ã∑]JuØå˙ãOë{‹Á9±‘ï∆ÎÖd”/ÍÌ¡BPJÊ¢BŒºr1wS;Âım≤y—I≤˘&2ßrΩ’r¶°¸níMVÂ3πpˇÇœÈàõÉÀìµÉπ8l•ù1IçºÃuk[Hc∏ÉÁ»DÉ††kÚ–VNÁÙy
´òUihŒ"°˘acø◊&W˝Û√ﬁyìáæ?z€öÌò∆£Úúèî+gÆ≈@˘∆~0<>Îé´GS)‘ÿ∫&D[´+}Gè™k•“&ûc!ˆ‚DÍ¸¯¥wLN.ŒáWΩzJV¢ÎgÃfëz( dCMb≈XLbª~€æÍêãÀ˛Ä„≈yÔÙÀ¨nAfy∆ı]Ê˛],ôπììqT»wìg@“·ÃﬂŸlÏ_^]¸µ28f∂{éDçÑp–Ú^d€^2‡†uÒ‘öôëÉçZW≥îsiJäÚŸ'óª§©ƒkŒàöÏu≤qfàÆXó'R§*∂>c|æ≠yÜﬁß‘ªÇÙ®˝2™Õ	9˙Kåê˙[ÛAÊ˙Kc„[’º–ÚBΩ”„‡y“<Ì3tEﬁ{gΩïÂD¢ê\L+W¡·¿Z¿ıˇl¸ê†o¿4m¶${x1ÏùíìﬁÄ ˘ÿ¢„ÛerEbπâårãŒ+~à{É.∏º'˝”˜Ω+“ºx?\Ê”A…Vó˚m<?;¥0”£ÊxÃÜ(¯è«ÛúÙﬂüﬂSüE‹˚AØ7$«ÁÄ,Ò◊yø><|î(B∑Cæ~(∫áÌÔ±Rˇ  ˇˇÏΩ€rY≤(ˆÆØ(!⁄-p	RR´ßõ£À@$%A")ÕÃ∂F!YE¢@∫™ 6G√Wø⁄~qúpÑ˝Óp¯sˆÿü‡Ã\˜K]¿ã‘”ßµc˜´÷}Â ï˜¥πõ∂ŒùV!T…1nMµujäoé˘û›ˆÆHLí]ˆòÎÜ°^59µá(H˚"’“kêj“√òë∏ìiQ∂ÜyR96HO≥‡€‡‹˘`ò-Úì8ÿN
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
æ'⁄c∫TlÜÊ»∂zBÜe‡P•ÌlÇá“SmN=Íå>‹AÛH⁄åÜ∑ˆI{ßùp˙ÉÖL\—N™Êâ±°˛ïDhıì˙MÛåæ˘Ã°˝“`8–∆}‹ªQÓÅøˇﬂÎV(ç≈π*Z˚u<¸¸r’\,n^óùhsΩC©ûVdöÚ ”ÃÚ.;Qö1≤E‚ =ª %(BTg'dl±y»ªbÿ¥nlÁòù`dN[Ù>ç-[≤9∑Õ“+∏jR[CjX≠Í¸ˆ[}æöâ,=\˙Ó≥Ë û{ƒb©çíOâG;ﬁ¨ˇµG{™Ï§Ôà'™ì|âpge≤+@ãüI/0µè2Ù ôpöå1û>Äû°IÉSøæ‹÷E´Û˘†ﬁ≠ΩQ≠åû˛   ˇˇÏΩÎv◊∂0¯?O±–»I‰ƒí/`BÜ-∞c¥mìú›lF\ñ R!©J©*éè_°{åÓ˝ÁÎ~ã~û~Å˛°ÁúÎ~©íd.!9—HåTµÓkÆπÊ}~>ç˘BA.|*‰Sœë˘^úÆ˚¯µX˛#ﬂñÑƒñæ0p,¬q-vY¢Ç›g<ˇB«ÔÙè%Óç:˛Ò£ßï(YŒ‘Çt>K˝HÃ–îy¡+Hi9*ÉûVë—L:Zñª1mƒZsª˝É(Èö˝•±¡OQˇ⁄6«#ÃX•hé)AÏ™a “>	1-ó}yOcQ±ªTŸ›º–6$πm¿¿·„@O¥6<ï}ÎôV‹P∆åÇSC]C…JÍ˙Ôˇü¯Î(«‰¬ËS±‘≈›’˙œ≠ìΩ{[+Åm’êryÙÇ‘C®ì”1¥FûouÔÜ|Æß7¯é+ßëOú„∆˝«8e/jáyæé(q@•oó‰YQ¬:Ÿí∂OÏFÄ°ÎÕ∆~ÈiÌQ€\JJâbºµ_ﬁgÎ
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
~Ybls«ÓÌ„Í`†!˙MlÙ;∂—ﬁÿXAÍp:2"Çêÿaß]`ì∫G/~j}}â gkê#≠‡k™©±2Ø◊.∆p’5[∑I]’Â6”Ñ∂ïTï‡†ø≠áfﬂf≤”mıÕ~Øﬁ6ù˚•‚/œ¥Ûíg,‡¯«È∂vÖÁ˝ÅâìÌMõõq1ú9Â!8µ+ ‰?ÊûŸ%˙≥xó†NenÁ*|¿öIq6E!Un≈ÂcyÈ™v≥≠c3˚≠öÿ?~!í„¨àêïﬂû|ã!+›ÆåÜjÎŸsU…H≥Í¨Ñi`}zè¢â:§ﬂ∞Jı(L¯+◊{æ’ÅÁ.ıˇ  ˇˇÏ}Ìv7“Êˇπ
òoﬁÑöòEIé¢ë¢ï-9V,€ZIûÃ¨7g‘"[d[M6”›¥¨(:gÏﬁ¿Ó˛ﬂsˆ:ˆjˆ
ˆ∂
› @£)…Òd“s&I çèB°™PıQr°Ã$4(^Mç¬k@o2,Õ5!Ï]VY8ıg&G±L1ËbÒQ¡‰nW˝-Ñr^Ù˛åœ¬7Pù|MVÙÒf≤qÌÇfÖ.Çl»T/Ä8Uæfa:ÄŸ†	<Ún˘…ZÅ;Ø≥“Í·Vãd˘ù/+ìÙ/j⁄ãŒÉÎÄB˙˘ë3±æEê∂ı≠√∑ØwO®©ÊÈ˛·€W‰ÈÓﬂwèçm°5-≥ºÈ∂≤Î7…;mõï¶ıA∂^Yq8ïÃY¸©)ˆı@ú’p\	π∂ÿŒhÅ*⁄æ˝Iàœ,ä@ùWå~âN•ˇ ª´óÂwó˛Ö¿a1lú†ë#XˇWô-œh»)≥ÎhéÅª•∂ö°°™VmC5X¥«¥„.√ £M´¯cÿÎœπn=àì–√õy.2Hríêz‡(¿1»À~3∑Ωáyë˝ÁÕ€””j9⁄PR0ˇ•¢_bé≈;KÍby◊äﬁV3Æ`çÚ=¥àh§p¢≠VñÈÂ7®˘‹4¯TΩ/rQ[g$Ñ’€?I¥§vIWÌË¶Ó©7N>Ê_i0˜öëÜøWÛ—ïßGÛ–≠∫h£ÿΩZ€Ñ[öT`jUnPŸA
@ﬂ¯r&§7®cÑ≈eÄ+wÑ\ï<ë‘Á cﬂ…ì°‘∏∏∞VëGÀ3)√!Õ≈w»g€≠Ññm=VzP[âΩµ¨≈>Ûj∆ÿﬁ√Ïm–áööŒéwôÔO0ÉÜMò•Äô*ö∫π9¥`IôS.GS!Ø¨˛∆C©$KÓ#—á”`$}eœhAL9‰ˇ*7/É¯µî‡#fÔVhRdÔBZÒA ã≥to>¿È√ù\U&œŸ¸Ù>VE™´¿\t±€9vrÒ±¿U.æ1ÖüôÇŒRÏÌiÚå¶◊ŸV˙Æ·lH¿£≈jY ΩFmÈï;FtKÅﬁC[<	ÏªÃ§Üèû?∑~L¥™j3˙–˚¡ Çh9A˘àJj`—a*H˝◊@0Â–Ò ô?&£kîhˇÙ(ëÁ#<≤(≠BŸíq®Æ˘bXﬁÜaRÃ~û)@èH§Ä;áÂì˘;˘@ù±Ü≤m±ß∂lRÖü¬éJaã“∂ƒÿcæMhFå	≤Ñ-‰◊Ü"·ƒép"F8p",Ë∂PËj ¥ˇ¡à˙`¡zp <Xq,›VÒéqXî˛Teh2Ì €Ø‰]ôÑ±\ÆìÂwuI BUˆ&7◊„l≤ÆX¡,^YæF Ä7iü’π5ú∂OzNi~Õ{à/eIÁp _ÜìÛ éX¸rI–GAJÚh\í0≤ApŸ*ÍiDb4=†¿»Ä ÀÉsX∑hÓ2dóE4ıiøÄ)@vòÕÉàìOÛ ò“ı¯ÉZ†K>õtrBõ1r∂à!G∂Øìÿ*!ˆﬁ2ô1zﬂéPA!X`Ndh·|,ÒP…<Lk5€—&j—¶j
iºaL©NZX<*πF≈•Ê£vT™Ø(rÂ™∫∫$4©ÿcΩêA3•Ö©“_ço•í^∆QxîÜ¢J¬ÊgYhDN◊`rÏÁ"IëU@€yûGc2∆Ûx˛®Vpì ˝=¸C’/"ãú¿™!
YÃÚ2 .ä	q∫‰U2E.üOG#å¿ÀÇ SC¡ãÏ.»j”`>^±{‡À®ƒ‚®Ì.åì⁄≈è‰+·*¨úz@⁄
ˇ¥ûE1L&e®ó–]LŒ“ˇúC1,j6„ıiA£ÏêÍàÇ†’ºûﬂëoQﬂ—”}¢Ï˝-éìˇ*ö¬π∆*:i‘kuá˛8¶â∏’≥~ú\aôΩ(@Û≤b≤Hò{Øå«c∑∏3·¬RY<eËºÓÜÕ»p±¸˚ù.tYÚóÄœ‘ıÇ=;∞´c /⁄u÷ÄÍ@,—96Ùÿ˛„tdºı¨÷*~Pkîóõ4≤%K	ps_‰@/ˆÇ»iÆ/3+_	”/ΩÇõO/ÅJ∆/]ŸVf_îëÆË™wrå±ºM„M¢0%Ò;Ã ¶mrctD≤Ã-(√p¥Æ’‚[©uN•õ“ﬂ8RëcZ§Xxˆµ∏ë—o^t∏9˚Ü∂<ú<+yƒyBzÚ
èiRÑ6ÔE»˚Ç±ú˝›bP5X>mØ>ëg]÷üÌö5˛RLVª%uG€ﬁ≤â“ñÌºíÎ\„rŒs¡),ÁcÇ^óY]:ŸëÏs(“,[ûáóÌ¥§∏õ–˚Ë≤<ì≤90r‰Í ‹áóÏêRºœY%B#Ë1è”Gù—ï/Ù—´‡]´SÓ«ø6•gÇ—ë‰å4¬kÏ1û4ô5Ü^@ü… 7õΩiØì£WK“Üa0‰&Î‚í_ G%äïπüWæ©$}f-ä^ºB#;uëô€PNKßl≤H-Í«≈2Xª,≈)ú—–÷çéãQG;1KÍç·ÈWAJígÛtÜíà<@^övGÎÇ¥ Ú§á—hÃFI+mê?ì'=Òƒ|®™˛“[∂‘˙•yÄ†≥ÈD"≈7`|È˚@àÒ|Çq∫É Â§Ú>òt…)àK3Ç©Bßœå0Ÿß§=˙oIÛçèf^O?°€ëÓHŒvÃ·Mπ»˚„‡.nº
}®ì[Á⁄öŒqôÓ?èìºÿ0L6›$Ãä¥ôñ	¬X≥Õ∑T!ã1TñÿèπÚJnÒ‡ànZO˘@ªÒ6ﬂú"ß<∆h!q—ç…ÖCÉÌb˙~%ãO.$_éê^≤ÙúÁh÷c˜ñr›F¸2VøuGØQò<B∂9F§íÖ2»â‰o4cÂU¯ê≤Â"™ÚØ+8ÇÍù∂Ëﬂc—	≈XPm«(QZ¡)BØ*iQp‚¢	Ä”¿>¡®Á‡⁄ΩbÂ´©á≠òÍ`WqßÎvªÈce‹'¬ëµ–B⁄§(v[z*≥à1E¨ÇÏdQéJq’xL˙=É©¥Ü6_êo¯ßM"•M}˜ì:w‚˝eqtëxUO-5VÈ®vw¨ôßŸVÓü5/#,’Öâ`π-‰|G%©ÓT£7¶ÍıU;êô(íÃD*¨íBÍ)˝§°›‚L¿7ïí3í€$∞ÇÂ◊ 0°Nv—y±¯˙V„Ù˚rº‹Ìç5$Yƒ‹1•ﬂè¯óÜ¸w“¿ ¯Ò'⁄ÍêEÛ˘PqY¶ga•`ÎÆó,OFΩ∏~:™ëDñEõ†(Gå,-ìÔ»ZOu›”*E&:;d˙œFÕQ!jÔ^BK’1ûcÑæë‡mÔ]∫ù,)ÆØr\B5%yÂ‰›êMﬁüG2ík<ëjËgùëzXRmÈ–"Ü†Ù}D˝£›˙˛ËÑ µAÓdøH—çt'lTÚö·	Ã"
X”cÙ—IÙ1.S)H¶(_ÏÈÆ¥€QÖ‚…ΩEoÂ’4ÌyI⁄‚›¶!z†\]˘0a:[ﬂ£ÄÅº1uõi’›ñZâG	ñ} *2Øçï%ππÉ_¢B3FyöºﬁVqó`i∞Ø4àK∆Óı@GŒ¬a4moUwñZg˙›88è2¶‘·Ua1˙+Ñ_íäV B›î¬ÂEΩ1≤_∫dèKæãQØè~˚!Â¶®9∫I∞∫•ﬂÿ¡¢YY™˛ô*€xö&WË≠À÷Ê~8øiõ–˛≤ê%À§z–}yô§öØˆ@wãì q˝¥ù˚y“huÍQºMP‡ÜàÿGÏ÷¥‚@%∂ £≤Úí¢ÍÀ~Ê:∑Ïºœ†+ÌÕ4ô‡Éµr†ä4œìi~˝∂Wû(?Â·Gº9<8"ﬂÔ˛p@æ$«˚/wèNﬂÓûê£˝◊ﬂøÄ?w_C√+k(ëŸõ^©6}ˆÔƒ¸˚fÅñ@}ôï∏”∫=cÕØˆm¸úÉ>3µ¡çµFË-è÷»Ü°ë˝I≈Z›ø”*Ø&ËÏ4@Ö.&œ¬<∏ƒFîP§üòPàáV4ÏÏµñDõÎkÍ§¬ˆŸIÕ˛Ò}>˙«7m”¨àYk-uA¸åÉAÿ^˛œŸ◊À#X‚@„›Ÿ‚L&iuß`˚/ùÒãù±CPLáÛ±ÔQıÉÜ‰ T8sL±Må{fÑ•Læ†j∏0˜Bù¡<ÊÌ Vî7‚a2J,Vdyª0≈Ò∫©ä<œ«ï˛ °Í¡èçÁ‚≥±˙Ï∏G4…d¿AáØ¢|Ã44RcWBoÖˆÒ¨‹ö¢mÛúv˘¶˚9ı°›©’®ÜÍËW'Ç¯GÄ`≤a≥äcÊﬁ˝è,á”WT•ká◊ òÅA4Åp)êÉJd≈‹<Kìk	‘¶Ä„›ívüÉÎLñK¿ı^±‘œaa∏[ÿa2á£ñ‚∏ßªœ^íÛyû„ıwÇπ…Ï8ÉåR^Ô>;=¯Î¡ÈﬂˇqxÍ‡®µO˛L˙kUÀ3ˆumÉ¯Aö»∂núb
◊ãQÊwd‘XµUë£÷ıÉr:∂5r-ö]ñ{É]Q∫∂Cfà[∞yïÄˆ0ÄVæÁç‚˚ ÔIGnˇª ™™éÃ
‘xlq¡røê„`åº0∏G)π`Äó#¯D:úè C´)ûZ}h=ç∫D‹+QÍ^_]ìñ¬m>Âm«XGÕáûør∞Jè˘=G4ô†|
˝c⁄Ä∂>ÚïuÀ'1˜Àgà2h%îàâZˆ3£ ÷êßßï%˜∞Ä»ÙÙXZG8ˇDú_ ˙{Ã}—	´H–#C≥©EA%®)G¸Zÿµ•ÓK5Ë‡—ÆE˜#ä:ó·ıê”I+OÊÉ1TOiélòˆåÚù˜jØ4T&*	Ò≥)ä¢ëAK>6Œ©º¥Z¶35¬,Z	Ûdåèë`z}5”p„Í‰≠œ(ú5Ö-ÒÜÙ^%¸ù€b—˙˝c4^∂Eæy≤Åí≈2Ïá4âÜø^ÖÁoN~çé∆…4ÑÇ!¸'˛˙dçKPÃ”Î_ˆYÉøæô¡ÏëW—4Zé@(†‘h@”ÁP∂4}°9
∏°ΩãÒãÏêŸè©◊ôT'Jâ?x8B~û√;üïw∫mY=≥a&ÅùôÖéOw G\ÂõÆ\:»h†FU≠ïA“«.ŸUÄzΩàÏIöß ù¥d,c=0D
'√|RÊ©ÿ"íÛÎYêe\∂“¬1ï*üeeSôX»r•?ÂÚæ`ŒéT¢A⁄VŸ‰3¯b+?‚∫wJhLw§ ˚lÿ‹$:=¯ÕæÌ¸≤Ü•	ÓkfMuAm
üv6Q¨kµër•Ÿÿã¶tÇÏÿ,◊ËLpF»’ÚåªBÌº&◊›ÑˇKsll©…4s“q‰zA´í=&SœR¥ÎSø˝ßÖLΩ25ŸùÕbŒ:OWQ—ŸØ≠¬7üÆ_tgÛlå◊U,ÍÙ1E–‚E
◊8/≠†©≈Ï€Q nzÊtîÃh≥¶t«˜ó@1t.B%íÀt¥^o±˚3j⁄õ[JîÅzézÚ
f≈m‚$Ñ(ÔîC4È%∞∑…47˝[È®ˆÀ°û‡c◊∑≥	Ür‰Û	Ä©=QÕÕ¿Î8åµﬁ¶ì^OÖ5ïp™=5_¢À’*ïtñHEπÇR«ˇÜÕ4›,ºƒñ8E<Á‚À0û)Ï…ó¶–πSÆ)jlYÚ>òf…ù$J6%v(o®qƒt]ÉøcT[®ŒnäüQc"å—è ùµzc}¬=yŸoº<uIÏkëÂ’‚u)%;<ôüO"…p6LÉã\:™Á‚¶{ìºÅ˙[Rã¿“¢aÎ;ÂéY±a…kÄæ7Ø uÁ2ƒîTäAE…%ÖmT˛n!õ†Öç≠0õ±\£0ø¨fPv˙HKËKG˚Ø˜$¯´[.R;úJ¸#˛ ∫OÌAΩ»ä¨:»À–ÖÂ0Õ‰yh¢Û'éÑ:¶°îÕíÅÀÀ‰‚Ã˚‘:ﬁ?zs|*MCÎŸÒ˛ÓÈæÙÕÊpé“hR‰gFÎ:÷“†	ö0˚+ú÷^+»RÂ—V7-òU¢(é-÷:‰Ô¡ﬁˇ4HÁR?˘˝⁄&9£Vz6	]ç™nYz*√hhZ)∆Ìf&À80J=o'ÛIKÜ*\˚üøë:Ñ9[F î=ó~Ñ¡≈Â]Ò•p+lÌÓΩ:x˝è7?æﬁóAé
p-âJ@Ä’+wm®Âµ¿%N≈#œk6•œìtr
Vë<¸x˚jœpkP(>÷ªøÚŒY^9ò'Ú5™7]˝j’6
Û}Çô9¬Çá œwqº˚öRÄöTÚﬂc	p’å¨Ê>§x]Ùúlá]v€É,‚≈È´C⁄2ó¿)S‚∏»JJÓz/~ß¯cÖ√J o¯±t9•§ù*+œìQΩ˘aˇŸ©‰õäõ¥†’∂ò¥R3ã"Vë.`Ÿé–°NÇ(nkØ†b‡˛ﬂÄ€ûÏ30N√O921ëOM_Ï!\oµòO^ÓA·8kcÓ≥4›:á-¨çG¸¿Z£‘ãìÚ*FÛâ‚Ø´Å˝±+C‹*‹x˙Ó'ô’·- Ù£ﬂF£HN>°é±ÜünãQGìQ9ˇ|iç1&¬w∂%·Ê}úÁ≥lsy9ö¿À∫Û)ìÕªÉd≤<√v;+ÎÎk˝˛¸”yÚMˇ…˘Í≈≈∆˙∆≈Œ’ˆì^Onm”Øµµïççço◊û¨ı◊;√çïÛÛïo˚kΩãuﬁ`1^®O]È'”zÎé–;.OËùZWËùä∑óÉS˚˙%ß÷}—Éî£gb◊àîÏÙ Âw€¸‘§EÀŒ|¥
>b8Sï∂å€˘\⁄∆Ïºm›¬yƒùi‘ﬁ0BÂ·€=Sîzˆ:N^√πÎ<u]+iı/yU·„¶¥/k˚![ﬁ%KªZ˜›VC °ÆB»1bØÇÈ<àyë¬¶’í«soæﬁFO^vÓá"•ıüªBvøe3CÊœ≠ 7œ©k6Î‰üS‘æß…W˛$xÏdÒ”aê˛5
Ø(’¿[—êÚwzô}€˘‚Ü3S¡W…4√ºMVñ∫≥`xÇˆºvT-‡}R]Ì˘å∑±\ ü)ÇE {ºGì$´≤g*#•_öXË‚ÃwH±D˘$´ªX{w!/ Êk±ŸZ¬ ô\˛§ù Øﬂºﬁ◊7¥/∆≠¥ˇµU7–Aâ~kí–y6L◊° +ﬂ=A}ÅlÚ™Ié ª-±Íô$OêJÁU∏gôRûÉ¶wÑá ú'π¨_Ã¬´HR1*Ê™˙ì∞Ëæ“≠∆ùÌ˛<´û∆∑%k;»ƒ\ºJÜA¸fÍ±Ph_ùµät7ß*≥zdu´*HÀòãí~„√Ω!
Í:B@$2Û”µahpÎM¢WÂ“à1.§xYï«D∂^≥yVæàD”hßµdwo¨K7(ìA§Dëx,˝;„´Á>¿JÒå°b~k5´Sh]´Û≥¶
ıbNEU/2#∞pH—s˘¸<œ3-ıË÷0˙@†Jd(ën∑.–ﬂìËÜyßG~È¨˜»E~§ŸR≤"g√"ºüg )_ãè≥Œ9u2ßÍ|€Î-ØıË’”0MfùÛxûv≤I´L·≤5IËºY‚õ@Âyƒ€77$ô™;ˆìg˛Í~KnÂ;˜`
öP*≈Wä‚+jai|–œ´qÑÖ±·∞ÛÆﬂ]Í˙â\uz¿;WùxD≤q0LÆ:˝è1pE“«‰d4ïÈ√π”sÊWx3£Ã›‰º≥—RÛŸ`#zÜõ≠q_nùjiW.Ä(`NÈ≈~WL:¿SùcÆ[’î97’s∏ı¯:AOî!”(N)ßﬂË	ø∂ñ«˝JGgï~fﬁÕ$ Ω\É^NÚŒ
Ëà¬é^¢EßØ"ê~åΩ.¨ |gπ¸á´å®–LÅ¶—¿à}>¡≠∂âójåî¸\√Üu∂qªTù¨ô∂ÃÀïuﬁbæëZÕdJ/<∂oLÓ9¯xùπJqÁÈ[åAÇ¥∞≥Œjπ«Wê‹‘u€	itåÅ«õEÈ>#Œ)ÑËí8Å≥HyUÖ®˛F≤Ëÿ›˝µ[≤¨O#õ4e≤©ïøAó`ÄZ'∑o*ä”≠<∫XHÿπÓ<1ÏLSπ~ÖP∑‚ 4Û Vx∑“õ}¸…≤kqﬁ¨[ÅL‚Œäa?¸0ŒcæA+G;QÈZ4ùÕÛJCS÷K™ßT~DÇ°˙€ê©ê4YÃ∂ŒTv∏	§Rã∫„èÅ#ÑÈvÎÃGÓU»≤0øƒHπhä±L'»úw´oïfñéßCoÄ™Â–è*JC=+aÖà™{ÒÛ[ÎóÃyÆ3lçJ·¬≥Z∑Ê¬∏˝ÊÙ≈˛qÂ‹∞ÆJu»[,»â|†o‚Ì}wD”Èu@ñ9·4fm-≥≤µçÌ˛˝¯Õ·aÎªÇ·Hx(ËbòG0µ5±µÃÊÚüëhé¬î¢+–ü√$ô·kƒ/út$äö WîVà˚#)⁄‹w'A>á˝√	ﬁ§}JΩ⁄üÚπ[Ú¶≠˜˜_˛⁄√ﬁ#ºﬂ	ÛiˇÜóÒµCODS{sÍ6,7ˆ4∫jÿ‹´7ØO_∞éù„êä¶®V·hÈüôÙ_ÜËùà§ÔIÈ¯¬ ıç!h]6»5%b©nÕaDGa∂¢ÈE"Äsô≈æF 	M©OUu$WŸˆÕjµyÛ>D_K™:”dZŸªﬂm-ãπXPheÛ–[ó˙√µ¨Ÿug]—Ÿ⁄´™ôQﬂô8»Ç´lPç≈GlRu∞ÛÌ∫,qÏ>Mz“	≥˛ o•ÎBï%˛•QY2K©(îJär©	ão•˘ÆˇUk≈•î¬fA≠˚µM+0öÉ’™±`\Å#!wÚUÚÑJJ÷êöÒ—b¡.k@K…(!g	.Î+M€c∑Ç‡Z1Ó`ƒ†?å;Ô6z∆?±9¡ˇ†NvèˆxO6µ¸≤”˚m,å»mBœo`√0ÏÜ€õ1H5UìaSk«gmÀP,%/‚¶ãﬂì˝¡∞qÄj∞g rÊÑ#≥¥”Á)E; /$à´ëõ9‚¶`Õt*§	Úî>ï1±Á2ºﬁ∆,åNâa÷yRŒÙzO‚1î√úc¶Àîˇ#≠« ÕÄ1#.–á™|QïW˝9Ã@∆≤fÿ[ññû4
ê|Ë\•¡ÃÿJ•ùõ≥+®4Üˇã†¨ıãõ∞KIËˆ¨BEK ç‰›uóºkÈ0ä*TıÆÆ'Ì≈2v√\ı&îµ¨/ø$ gÑ ˇ
ı§ØhÑóÂÂïQŒ>1Éd◊ÎRŸˆx4JêÑË8˘«'“fùp÷˙Ó[mb,3ëéq\[ì.†ÙÚªˇ˜ø˛ÁuÕGYRùîJæbäŸW ~≈Ù≤`˙»’ÇBá£EOBf§œu9¨Ò’ST≈†ˆ≠ª/Æ_+LíU0¨ÙØΩaõ?òãà¬»∑ïˇ2è«ë◊Ω(Mô®,$†y©9VÕxÏ»O≠9]~∏§M·˝¯µ)Gláœˇ0úLXúÉΩ]~höıjh´˛LÙ’TC%«a⁄®vyâ`àŒ—3ª·øπ~TNôæ¬êˇÁv…9ß Q∂Êó;µ Ω‡<ØÚ„}Ââïá”≤Ü£^+qø‘gÚh{PŸ‚î–xΩ0ΩÖ∫Z¸õáX´”4»@=∏ó≈⁄≤‘m¬Pm_è◊*ß=ÃÇ]Éâ√`X(0(ŸTçf¯‡ÒnæM-fÕt√+õùl’¨Ìh≤Ì˚ÑzeΩE·k˚a·¥y¥|∫FeéóñnUà∏õﬂÍ@≤Ìwè]ﬁ|è6„–Üùl¥ª≠	ŸΩ/˛¿tY·PÈ˚öNUk?a2∂¶ïq¡û•—$HØ˘ó¥§¯J5œ1]¬CÖ8ä9∫≥6oLuÎôhPö˙ñÎMäÈºpo ]°¢…Æ ΩºƒWËo&Â+‘·‹¿L“¢ô*ªM€i˛Ê»˙|¡ß…h+…—ÏµÏ`ﬂn£K2˝˘˝Î/’VˆKÅ[&Ÿÿw∆M°Ü(QTç∑St_∑Eùc<$z¢Q’∫‹ÒËxÚå™ÊÏáÛÌÃicp∞Õßp√mˆõÑ˝†Ú≈2* B4º‚Nüû¶Rô€Z–6wùòNTYYû“∫68&â>b√‘.©#2ŒËΩœß©¬˜‡;Ω5Ì¯œ±ª°FÕ)àÖQ€ÊHâ•fF$ûÊÉÓf+ <í¡∑‡$‰(è$ÏÌ[é=†]dWõ`G4¿?oÚ‚"à‚*b^°jü‰”¿;+ô7+¿5Qˆ{4§â7ËØwï$ºZë©>‚}û\&èeSçÇ¯8 ¥ÙrqïRÄÈóQ>ò'CAJ√·|∂€Ÿ|Úò∞Ú'˘j$ÌkP.ªt&ûáÙ≤º∑$%°—:x0$c±Óºnÿ;cOxH&]ÃiÍü≤gu"+u1⁄ßWZX©C;EˆHÒT•0zºIZ˚ÁQ«)¨Z¿È%:´ÚÉΩ„£|¸vÂm•˚K’äÙÖ∆≤Hà‡j5L∆!ñmeiâ°.›˛;y§∞;Œ™çGå9MYﬁÉ∑3√ÎQŸÇÒQ—#úÑi—‚f‚˘ Åˆ&J≠W›Í_ÿ'Ù«CﬁL~	s“>ò.5ôSi.3⁄‚éÜñŸº¸ícò˜k&Â:Q3#¥»›¶ÉŸΩ∂lü
)Ô›tQ∆CÀî„R7ß£|Ïòì„˘tØyÿú<M£˘eÕ¨Äê	«ò{ZXô˚ Ùø¢∏(J`ø69:Ã¡E)OQ8¶ $ñyŸK‚8HO¢—¥fb®m√=/‹¸Q7-?Iü6∞*Å∏QGL"_lVK5g_qSñŒ@o€ùæ†∂[+„¡Û0˚¨ˆ◊SLª®ËŒ['Ko§HñIIpﬁŒÄÅ—,8µÈª+?%ép8H9òFˆI-≥&Ω‡x]bb∆äcà4Ó¨ÃªÙ<M&4S{\&˙3lgèµQŸönytBºOh}?È«¥sõ¸K±€„0à;8âüª≠HèTæﬂà‹<2VgPÃ^Óê„˘HﬂllGQ¯l§Z=1*iNˆmÕÙ†Õ2’x_Á—@?US[{˛2ú3`ÙWÀÇqPYyYd≤ˆú2Í¢€ŒÆıôÈa”WQ–5£HÓdõRáqπFRó˘Á⁄Nﬂ¥◊{…%∆Xí√pƒ∆>?è‚∫bÌ2øÍ*∫\ﬁíªª¸Û<…Ö·¢YßYxÈ·˚ ‘˘PK);ŒY®µﬂFGúzäÆºœgñô¿ <Vv∂ r•û2FZÙ‘∆{ãû·uùK”Î|ËòÁ+yÛÉq√+cwmÏ^ò∆åı†i«øO4ÿûå√tlL.g•Áìöú2,iÌégB—y˙©∂Á¥E+9W˙œÛhpY2tõU@Ê˚ ‡µì„9AãLíﬂDiìU; LrbŸRÂX|éÌf¥jåâ^éáYºq±amﬁ¨ÿ0
;n8ê›Ÿ,Ìqzﬂu]®§Tå∆!ZÈLzë|®håÑÊ({6œM∫äpàuƒìÉÜá¡á~ƒ2◊:($çî&·y†±à€¬ªåb/∏»ÉîPÿd˜Ù÷Oõ[Ü±ÆÜc9¡‘»‰ã˛/l•Û¡ÂÉlíﬂﬁ1[©›5{›$¢kC”C0âÍª_ÖÁT{ˇ4H©r¥˙ÄàYKj8êóîIç˙Hº’]Nêl0áÛ¯NÀ±õf—åúFÎ0v”¡8˙‡ﬁÿã≥®Äµﬁ\7 ëp≤w≠WMOsÚb¸Á88«^4aﬂs˙œ	|)Vô[¸0∏~L"kjzª*ÂoVØºÙŸ-Q]∞
5ÅPYÄR∞o0QSâV©˚Ê˚È2JÍö«;Ej…[aRøÊ’ohP"Ä¡Ë∏’ÜÂV.Ø&#…¬Æ<&Á÷È†âΩp⁄=Á˛¡˙…ÿIl¨ã˛Jﬂ\¥äÜ˘©îØœŸ◊jß´$¡.aÈ≠fÿt”<Ó‚4#÷–sj¥2á√X√`¨·/0˝Ã
÷.ó≤⁄Ø4Dá'é—Î^™’&#aLÔ=&Kå„d§'g∏âàÉ9*ê Â˛±Ï‘∫âE&	rÖ[vƒèÃ7"SçÀ7ñ)> c´éÑÁqwî‡ï?Ü¬¥úá’ù¿I%∫∏PÚ*‡ïmˆóJ9‡8/‘8{'I⁄¶5óYFUeÂ—?öﬂ¬¸∂úäZËÁD≤‡}–≤î}“+
√<·ó∑åí≥jgX~8•7¥ÏM•+¨ÈØ…Ì”oo«ïà JA.yÊLnYVΩïCãeƒgãBÈ◊âÜ€H€7å˚™^n…Ù5î‹æ–íj	§πÌ…«A˝˝≤Ì˙è¸ã_˜äÒ«’Úü…–á√î¸yπ‚ÏiäO!âd2‹§ß…˛mt?°BË®«Kâ7##∆+gΩ’ªÖ“— ^';§µˇ1ÃiÆ∂P∞°r8w[)EfáŸÒä±Ô^£Á.F*Z:zBSˆ—ì$Pë§Ô±9*ëéÃÑ˙h,I0ïô2oòoÕ&âå2òÀ<I[FﬂkBÁ¬‡<lÛ«ˆãÛä&+bmg;kË?€ÔÆ+û±¶Ä8Ùû5ø¥_Ñ±√KøÈıDÃÆn¨ÙP»¢¬/~„÷Bk ¥y«®ÇYî	¸∂æª—O_G¿í=ˆ»°˘Kó ∏Ö~RYh£”Úhõ’∂*∞äOL´X]ïb¨+©≈ôÆ˜ú0Ï±,∆IòcO&-©e›tC}äbR∫À¯óë’ÃYl¡∆Â¨∆∑“Æ gˇèhÑe)mÍπ˚(çÜˇÉ‹=É¶^~\#ÒH˙¯ùeS»Áçl˘eröÑ‘oåz‡ŒÕ¢d·±fí"ã√∏‡≠ΩI:Îe†~∑◊∑“–zß¡kï0 ∂‚û—B(™∞!ãL|eÙC°Öπ¢Œ∏C6Wá"›zV˛UnTıöƒZ≈òB c(ZÛŒ∏)Î`Í¬üÏ±O≈8’ÆOKz`è»27jYo„A™∫^Ìc¯Ä-ËZ„QÖ‡TaVkÊò
|Ï¡–ñ™!“+kdåˇ˘‚ÜOén<"Öb0ÃñïùõñÉ=3œ•5ãw- "6ƒŒ_≠«Ÿ=DxËAVÚ∞’ÛÀÒÕCM>M„æãÛ_≤Ec8ˇ	ı∆˝YzcŒø¢r˛æ ˘◊¨¬¸uf,ˇÙa¯6Bvq{é¸∑ﬂ≥meò÷¥U)	kA"á“˘3+Œ1¯n+ ì8bóhÈÎŒªŒ6ÂúÖè™ÇŒÉiÈÀ÷¨L[cL}dL}`LH)›Û—≠¯ÛA8T,f·NÆH◊-⁄-ô?UaG§“v≈yî◊QÜÛ1ìó pXëcy≈§QwØ.]£ùƒ⁄≠Ø·\ﬁ—|´|¢¯mi˜,∑Ãñ‹[mÇÇã√€Î5a/&U@›πîÇ¿…¡∫.˝aº⁄+©¶‘ålÎ√x’yÜ'±…BoÜ@†
Èâ∂»!¢ú´Ù‘–±µMÌ@5®—A
¡ ÿíãnî\t≠Á≈E˝iöÇÇç©KÆØ4€/`¶"‘ù¸(¸—”5"Àh©ÇÏ‰‚ıˆôæa«i∆K’^qÖ˙:[mt,√˙XÕ$¥- Kƒ4Ω
≤˘e~ãù√X≠%æ.c8‚{î:YL∑çné√l˙1hDà∂DSòV‡N˘xª$¸Ô-2ë@ƒ'–§øﬁÙn≠„⁄M√Än[j6‹æ)ÓÌ¨U∞ˇ·EÊDyà°oA˙}1ª£$f√Ì=æ)Ï¶Uüè+€≠ûª»u}ëè˝˙V†»ä´àkÙÙÙOfŒÑ$†Ân∑÷ˇ››L…óÃû·m∑˛mÌ˘⁄ì˝uüoòƒ
ãﬂ]q!Ç#ﬂÂß…`æ}¯—‹a,[À*]∫êG‹$æıvIòE¡µ%ó!#OìÀ/Ç4Æ∑[´d’5^FÛhÄz
µt∏ÀöÜY|æÚ|˝˘∑ˆV]|oª#‡Çxê)ºµ™Ö∑Æé–Œ!ÃÆG«aÄóäÇ"Â\Úã(FOâ˚vmwıÈÜQ*åÛrP‰qOz…)?›ƒKNWa'‚Œàv≈AµÆ’˘{ÕÍ¸1È∆«5•ßIÁëãüÅŒñs8…Ø„∞nòyÏÑÊLÌ√!^3¨z+ fs]Ÿè'T,Ö‚=Ççì˛:¸ßÉˇIGÁÌ¡ˇ-£q¡ü+?≥`à!∆–“Jø¶ìNrFôNLç≤\∞\Öœë‡ÏãÆ“Æ	¡ª|2ı$ô&π˘Z~
˛ı°N∫(ÿi˝°ƒärŸjÕ5[∏Mä£Àyc…Ì÷<ç€ˇVJCK0ı≠ÂB§≥…´9≤Å¸jVˇå◊¨•
c–ƒ$ cÅ1ZÇ©é£·T*œÿGñŒ≥$û„Ìa2ÎÙHäƒ	ˇ^uû†U˚…ö§.,˜{*(≈Ñ~∑¬DÒŒ$Ì¨ˆ·ü˛±(ûöøŒT¥∏rÃøPgª∫∏ôÕÄ 0ì
•2.Írûä+®Ÿ≠÷/0[õüDTKçπ3ó%WtÕJﬁ.S.>VZ≈†kÛ4K“Œ,âPµÌ%ç≥VÎwhØûê‘åT*∑T-é¬Áñ›of‘≠√≈x¨ñ)kØmÍ˚∫S}Á›ôÒ∞¿€_¥ONc©Iπ^ÈÆıÇ'mÙ¥ΩØq˜J÷‹CàG∫s†j∫„ﬁ@<“ïØrˆÖ2kgu-(CÉÊÙ„:‘ú8å.Û¥˝«™ÈP™`˙ÂNÓ%,¸†ﬁø˙Q¿Û∏πpyEÇ¿dﬂÙΩ≥X;Cª˝X5</‘Æb¥,˛ó2òÌz:∫f”kì‰toﬁ!«‘YñpoŸkÃﬂƒcq≤;€{˚ﬁˆﬁUÔ4ŸéÅga>?on⁄u¢€÷l≤"Í ≤…à«Q°BF‚¬•hî1s&€<F„ íüÃÕZÇ8÷€*+d$3D=Ïä∆°‹lZzä”çÄë#˚§Äp)ïÁÛUkÊì^'k’H[ıÚVU‚r∫Ó*©W÷{µﬁï∞?ƒˆ∫w∞-°≠ï+îÖ«¯üJ^üõeUπŒ˘SÍÜÊ⁄Ô9·ëi∑0$W˚fˇt)µR>7q≠‡…∫Ô>-]„g≠›K⁄ØÉ4œÈ‡ü¿U33¬q£ﬁ÷ÆF}∆∏¥ÃKô®û±ñ‰Ç¡⁄‹e%?ÄBÿ1‡¯:´™o,ê—Ç=Ÿ95µ»ÏÆ…3Àö:óæ;Ê∞AX∏ÁÃm†±:°")ï1¢B™[ÎØ 6¶©≥à¡0 ΩÇI≥RrË:&⁄JÁ.iø9Í˙rûyñìëtõ¶Á&îh6ëVIè„ΩHgâô∞V≠!çE%õó◊çb'∂“w∞ëv¨˚®RK‡˘â;B®±»Ã7≠^<0›u¬Ã
ﬂå“Èó”jn%ÎO:xˇçÜ«_≈Ìµ§‹÷w7"åQDàÿà áVbé¨Ó¢ıg®À%W„áµ~[nãÌ∏3ŸVÇ-≠jéä;˚PΩ© }†ôπ,Ÿ¸¸œùßa<ü∞sß‡b9„bü¡©c¸“`Í†±6§Dt¯µ›T¶I‘ +X
‘fy¬qÆHy‹÷6¸Ñ1x–L˛QõNG_-¢ì:}≥¸ëém÷UwüÆeåóÂxµgaaÄ!%P&]q+⁄NZ«ÊÒ◊Kû â¬âUtìCå∏3öFd>ÕÁóò6¯2M¶QÜwAx≥im-nÖíi€6ú›#’æŸnrÿîvD!ÿÌS\DÒ≠÷8q≥˚ï‘%¥ë≈¸Àéi∑‹ﬂôÕ„,¨˜(¥€ø»"ûƒ⁄üê7S¥ìë/Q--∫à.aÖ‹tAw∆¶6˚Üa!6/>‘Ö8N`¶LL∂|a≠ıÒÊÃ™0†™jsˇ‚& Ëk√!ºWw_^ÔÈt÷/}‡W≈úeÛÉøõÌö;ò¢÷ŒgéÙj7·û.Â¬Ñü<ÒHLW%∞wMQÿÏ±5V@	´´>å÷®øDlx+ÍÃ∫Ê Í-`œ	≥S#˚ñØøÀUìö›A<≈é]F»å`:rv–î‰¨¸µ˛û—ÚkÂd≤kïÕ-˝ÊZUøÉ∫E\ â¨ìpjïõA¸û39Áéöåë‰ãSèædTÔ∫ìÚXo]’ñp&ﬂ˛>q]S»ÄfM∞'§w?áÉÀgQ:à√~Õ‘!c5ÂÙëÿ∞€©∫ÓV¡ﬂÈ„èïV$2å™K,$∏≥Ì‡N⁄∂C≠Æª5≈«~säõØ3¡˚µ)>∆Ã~ÎDÒ¢3¯"ºÎØπ«ƒqﬁî¢öªÅ.˘•\ÏÊÓ0∏ú_¢¢ÉƒBp–ÔTÃc™ºy]Å’]Xf‹uñîBËõy˛€H°¯‚9ƒRíAÈ7†∂ô˙mƒœ√dÑ=˘=Kû'I~ûí'Œ¸29¬<ÏüÖË…hÚÈÛüK˙ÑU˚¨–’¯§O	í@üT¡FkÓ¨XD¨›Ã.™&éœU2†øc¡êë¬HÜnÅﬂnPı∏Xå•`q?¿D›å˝olW:6e=Ùo ﬂãk]ò‹•;¬öMzäÆ#√(@pÆ0∆÷xE1Å?ŸzQz&îû‹€“)À{ˇ`¸ZkªRfkY¬o-(√Du9ëm·íæYîˇ]√nêŸ9ÜFU.TÔ!jÊCºæ
¶¡˚Û>π"¨Ó‹jyÛ”9lùêÄÚ`{+ûßÛ1âzŒXVƒöÎº;©⁄±=€%.!Ω¥.¢æ$óÎµ†ß˚yê]Oƒò»púÜgÁ$”ã(ù∏Jr∆RhùÏøzªK⁄R~Hû¯qâÛí\„aÉC≤¿Ú±y‚±„
(æHR“ÊYïIrQÃ≠ªä´ 2:?A‰·AÿÜ1ËΩdÄπÃÚv´LŒAf›»tàèr ÃOì À_ÖYå@Ü°.¯bnÿ©0å∆8óv¸Hﬁ‚;“∆Í *m≤∆A©óŒ&√ ä›≤®] =¸/Q	ÄÑ∞ﬁzçhdìyÚ(è°CúŒË¥Òú-Õå4ß¿∆˝zP1ó¸c<IÎw˙ù∂4€Ã∞ÓŸ≥4…≥∂æ5,~3ßå¸÷¥ál∞§R–Ô}¨®uÅé‚yVëËÓgë˙/=ßæŒ‰3~Æ5ÇkøJÉô; ÉŸ%ü§Uü@ßÉÆ'éîŸá…?|Ëê”3o±©j∑vÎ#oŒJó|),ƒ‡°iMj<2˘¬∆‘g’Æ±Ωà›≥Ú…“≤]üîÿ¢l{ãöÖYM©ce[CxÃVUÛÜ`å±]=çRè#»ÎH·ŸÈ¡_˜êÃ§ç^≈wß÷˜Rë›Ø\ƒ"ïÛ õì◊72…»[w&öäaSxv©‡Â[—¨ÈÁŸE3¥ÀÙËN:˛[–È¡ÎfJ-zÔ≈÷Í(µ(ÂÕ÷™Ènuæ÷ˇ§$ZoÍyZ • eÛùëÅ>y>˚Gù∂ÀÑËI’Sõ¨Éw§x¥fE”23E·¶¨„~E∫üÍ$òïg£Â6Õ&◊‹./èÚ≠©@ë#ÏVHi{FDÒ•!ºªÅÿ‘5Ûc\¡^5"vãï2åÂ_pÒL≥PÄ„eé∫:˘ıW‚ü¿¢	ƒ∏/ÆC/’G‹6|AuoXDvîŸhbø “q„<üeõÀÀp∫è¬¨;üf3xÂ∏;H&À≥qí'ùïıµïççço◊û¨ı◊;√çïÛÛïo˚kΩãıù´m–˘ø¸y{£˜eç∂ø∏â\.’{nˇOŒë∞`¡î◊ O'RÁ€-Nè∂Rv¿/u^oŒ¨5ÅzúÏ√æ¢0Wph/^U±¡iÔß@∞ãúÜ¨b1loá’H[ø]Ô-ohBÊjØ‚¨çVúUß;‹¶™8ç·ëÍ&¯∆Ó\‘‚!@˝_äHBe	–√EümÙV«s r›{·—œ¿btâñøê ø¥e!vÿØ*›.6ò∂Û$Gp±5áπ€±®jigåÃv´≈a0Ùs*©Ãrﬂ_Y∫àW˚ähîÖìàäGñΩC&¡«Œﬁ·≤∞«t>¿≤∫/_≥£H‰XQ„}E,™FŸ5ä0¬3ì ÀèJ÷ ‰πp¥I¢È ûh∑‡4Ã?èí§;ä[KKŒãv:B&$>„4ºÿñ:]Á?c!lÒ?Äz¶Kl˘¿Ò¥›ö&…,D‡Ìi/”‘,'˘ÃSQoúÄ®y_7f]~:ø»QòÓÚµæ1,&ˆêœ‚^ÑgËµ¥˙µÅ±ÅÎÓ´w⁄@≈UIÃ©º∆µ£Ò•áz?$«∏ã^u˝TqzBÍ‚ÏÌóµÆ8HØ€äfÁÊEF_≥ª;ï1<◊õÎÉ≤ç}yﬂ)h{u≠5∆"ÏWêW˛@"‘û;"zÓ<äÃb◊¨¢É¨À/≥˛∫B€GÕ}<=/?Ï≠\u6@∆‹ j6˚∆xVºnaÇ´j˛@WGØjÒCÅZΩ€X‘SZàê€Ì„6ç∫ïå`˛ÿEo]oÇ¬≤Ÿ⁄<Q∫f›	Î#6…$4˛~hΩù¬€¢—4÷Ä<86VCVÎÅQá-\≥Àâéìµº^„∂˜–{5¿¨ÌãmUVı~vÍ¡≥â≠
„¸¨∑È,à-˙œ≥+Y\éπ£‹‡”~ªï#:b^V¿Wh"ì,4ôõIËyΩ˚UÁ^%±û€Ω∑>L‚’<¢Õz¿&f˚°âû\Q=¯Ï†mËu∫˝zél•-’¥@Èı˝ﬂÖœ&ôÜWIﬂÿÕ‘K„?û‰)lÙˆW—∞s∞˜’crCÜòoÛ´~dï(áo&òÓæ…∆IäüØ√ Öè”9Ãz4¯ä‹÷éaì¥:ŒŸºg·3"Mœ`∫‰7ï~î	›Zà.y=o™Ù{>&ö,ﬁˆ;£»fZ¢<Ú.)„vy-›!N&g[Ø™UXÖ”‡º›R\R∑∑*a~ã¨ñŸo—ÈQ€ Vπ≥¬@êÍ¬æ!–øÎu˚·‰ß2vAV∑Â∞∆Åtá¥^ÜqÙ:·à∫ª;®ÿˆÛ$®Ä°ä}EI	Ø˘ÿÈ!;|U\±æπB£êãé˚¿◊≤Ö…R5Äø‚`"»ä¨9h[c\ï4ÜRúóÆ|Œ¥Â¡ºıπé⁄uœÊÌ◊Óï n”aû&£QÍWÉævøõ≥Çî†@)®	X‘’Í/¶Ÿ”Ëzö=
AπÕä¯›R≤z“´¢:‘6_q≤4˘TV=/fŒWπ¸·◊0Ê[cqWåQÅ≥rÛaﬂw≈˜ó·‰<à#˘w◊k¥ÿ£‰*,$Ÿ’z‘|Ük[€{•À≠[¿◊∫}Ïÿ;üpã˚X±=´¥X*.≈„~Z_à[Û÷ŒŸR]¨>yzÌQ™6Æ…£B§‡'ØÚËtÂS≤Ê|gè0Â’É≥£ º™±UŒÿ≥¶˝Ûé√Rj!^r2œ€ÖorŸÕ/∫Ùò¨ˆz=èÊ@ÌÚ¡ò¥√4MRÍ1ƒ°}åÇò Qå∆e÷…`ãœAù›Õ˝ªˇΩŸUg˝ÑW˙D:S‘Ù"M¨√Ü”®í‡¡;·>-î‡6WX{jò≥‚∂‚F”π#À5§€P¶‹Ë$æ¨óI8öÂÒ€:	É∂à◊å‘Õ«bôÏÀ{ÊÍÔ’‘ÜÜÑ‘ÛøïX˙‡ìOv`ØÊ ˛~cÍ˝¢Èﬁ0ﬂ%I“]rÚ±EÛH…á÷}mó¨+{Ïæ≤‰!Œá4ôÜπf£&r”“cﬂ^^@»KÀFsö"ˆ˚‡}Ñ˘·»”`Ÿ”√±Óåf@».lFP‰@VAÏrêÛ€Ä~éA‡áﬂ@≈#√p§9‚-ò¡…-∑VwGı∑¬È7M-SÒñ˜K[»"0,q† Ï¶ip›ΩH\Z°OB´‡Nf1hSˇ(ô“Ìvœ)âÿUZÕÒ4nIêaÓk »w?ôE–%”◊KÏ≠∞Í9NÉCÈ`–ú…ìmN((Îüp∆]öm„ogL≈∞	‘úƒ-}u|,ûµXº’+p Ω˙L<o’?mœÕ†Á_0l?πß<»ìÏ≤ËîbñàÕ_È5CÇTûôcËù±9ux˘k∂” ﬂ⁄Õ€=ÍØ‹zZsœ‚˜V#Ï∫s\îGÅ››A‡<yy:xP'ô=Ÿ/·ìñœí£ß∂ó'y@Ø&ﬂ‚¡±Wú5]~0@∏ZgÖÊ‰/Å&¨5M (Z]¡do‘ﬁÒﬁ≥_çÅΩ`«~{É¸L‹÷“zÁî∆>]>>WVÔ‰…‡$	9û˘‰…ÇÿÊÁ€NwDÒı1ºyÕ
àXΩ^yõÃoí=-zŸÏaﬁ™±€˚8O”RñF|]ø±á	 )N…6q&3O+ﬂeú¯ûÈúßÃ˘¢dxõ^f3î"j÷áØåQ÷—/ZXqÃ>éÑ_Ãºù°∆^! a7˝¶ärQ)œ˘Õ!∂,<òÊ¨ªæµä	E©AVï9ık≈«(Wø˘,^ˇïL®ÀÎd¶°$x_E‚Sœ.∂ˆáQæ*L:OjØ,|]¨‘›˙˛Öé™C¶ë¢≤g’?˘Q%ªﬁÁaÂg@wlÔ˙SI?Ú¯yˆª?≠8˝›◊ieú˝ÒÛ uî?‰ô˜«iıiN´E›œçÎsk∆E,¨j›¶˝Zòœˆ36¢Ó-y›È˜d»e£ÌárâB¯√ á√jûÎ¶â=Á3ô|ÏÛ<a!n|i◊\†⁄µià◊T#1ú∞T«qTÊâ≈lñ‹dæ∏∫ÆúY œSáó¡Ñ∞%*Z√‰CØ¬Èúf*#/kﬁ—<EÊ›@í◊y<g˛ﬁu˘œiA-?@ô·⁄do6X‰x6Ò^9¯»ﬂG´>°r «(BCü˚ﬁ:M√)∆Òºùπ´8†©åÌ∫Së–>r…
d	GNŸ£]√ÅË«s†4ñ∂”xçaNDbÿ^¥3ﬂÙzÀﬂs0ëNúÛ1¥ÖdÖ”—¸<Äsò…*∞2L*†ú≈Ô°ª8h…NzéAÕNﬂ/Çyúìcõª}m¶q‹«pö#:§ºó˘ˆŒöŒõ.˘!∫,K[öÑì(é.#«¿ZﬂΩNüÇ*A{\€9–B2ƒÊ&Ìa‡Œp°]=ÊÔJåÜÛ ^zL&0Èd≈Å9çc—íúæ§√Õß¯◊› ¿Ín˛_¸J˛æ ÓÔt’Ú`7ÃÙ∏¸ír§i†∆óÆ=Ê∏`nÄm=⁄π«÷n:Ì˜ÖÄ÷~îôæ∂©)ıX”7gµ`X-~–Urº;»}ÜYÿnô ç}ÓÁ£"™∑UA∞‘Éó5°¨q*8{7£qêìäN≥hf;?\æVá£ª˘!‘z!∏§À∆¨¥^äª'≈D!\©-Ø˜d]
ﬁÌŸ‚-§ıG ˙€Ñ∞Võú¬›‹jwe	F1√÷(Œ› rütËv£Cº¶_h€¿“r·Vg¸››Mg⁄QV>˘ıåì≠Ìù3`#·d8πZœÄHK±v9®zAäg˛4ò$¿ƒ {›n◊÷ö!CTåWÎ3‡E<#B’ı59ﬂ$j^$Éy∂â∂òpÈÉtuØ1;8ÈQ6§a¯Êé[|´öçÆ‹gç2Xú◊JèCü‘4£“Á€grí´zí6‚Ù[¬±∆«πîÖM<£ﬁf\YwŸ`›&†WÂÍ  ÕƒPŸl H 
†˛ Áóÿ™“ìh4ı_≤Ô±Uø£‡'p—Us{‡’ûN≈y∆,OÊ$Œ„∞ —l{<Él}ûZ ü‘aVÃ«m∞ú{Ã
ÄŒ£ô<”)[”˛-Á„ﬂ≤˜√eçƒÁ4∞ﬂ€òN£YHùno£ó%{(à¸.G∆/ﬂ⁄/ÏóXwûl˝‰‹ΩÃ#G¯-µù
Fªïü'√ky6®≈§p¬ˇl◊⁄Ìõ∂QÂ¥éb’›eæ Á=S{Ó4(àB›(€£!Üv}.ëif4e«xÔ{jZö≥ËÕGeÙÊbŸ‚6k]∫πou(∞ÊÌ◊÷Ï≤: ^!˛H|M∂IÿÕ%ÆOA[ac<«d´¡¥eøΩ¨Òé¶GÆc®‘A⁄gœª)_*“Ó≤I‡ı¥™‡âèã≈≥ºÁC„ÜoÒ∂X˛Ê«sÒhË‚=ºœQiÙ∏Ö“ÿ‡ò≈Q
b#
Øı»èeí˘PLˇ∞| 8≠ø0˜ƒ‰Øè≤Áê¸ı=Ó¡}‡Ô< ÿÓ_Õ«ä∞ﬁn◊‡ùó„®≈Ω3ˆP‡µq3ÇfëÒÈ‚Ä>¢Öüˆ”œmâéãﬂ’ÑÕKù◊ÔÉ&qg≈bP~,?ˇ˜ø¸Ô≤/>˜uk¬ß÷C sŸ,;ﬂsÊ¨vô2…Ω¿i+FG∑ä†ŸQ"]VÌÁ™}Ö%¢J=	2Õjç¨>‘ }œK∏Ë¿K ë2.‹π}◊Q8å{∏_ÙrYØè±©w2 ≠&˙˚Ç'?ŒEM˜+wM
æeır)’à;∆;†u”•ëöˆ¨ˆTØç,
©–{Wà˝[êÎ6{Ωx>Ò<DÅCå1å›"’<…ÙŸ8òé†Öv¯d;OGR&ôO√+&àZ∑ÀrStióÍΩ	Kåî9s¥,r?„—ââüCƒ5ÒC◊(ø)zUÔıxÎ·Ú'#ä¥Â◊^q-Gª?~sxË‹“z{¥∑{∫ÔUˆÏ˜à!9Zo®óÜp¿ÂÚêãÅoäÖë5$‹mO≈ﬂ∞≥^p
9´ÁhıÛ§√õúF&©ÉO√tdQLˆ" £3øÜBù‘z©£∂√m3W™´n‰ØÊñµ^§îå¬?·Ô4†LT“~?Ì+óSÚuVﬂt∑’Wò%¬iipbM‹mkuÅdFÛÌ0^$XœwˇÔ˝èˇ∆„õ∂ñYëÜ-	“Ö¶˛˚ˇ!úx˝⁄∂MŸÁo¡∏õV`Z∫Â¥.]íµqq%Ó!!m˘àÉï#^U⁄«π·◊TºzUN•ﬁ˝DËV÷°”7•^2a“÷©óºá~Â#‡˘Üò†ÌØËêóêπgÔµË_£˝ı±&¯lBuC8Äèæµh§ ‚Í≥b;ÆÊSı”Òïı>⁄?&OﬂÓæf8¨È≈ÓÒÅ«B˘ ﬂ˚ı7f/-?u”7ög°xŸRÃñ>·sˆ}0Õ9pÁ ÏﬁEóI|CÇi€∂H”Ä |ºÇÇ)ÉºgNí~è˘Ù)·6æoÌ¿·Ìÿ&¿ø≈˚î©≈#ıiS⁄U}ÑlÒ4∂≈”HË.*5æ≈S
·‘1èK'dh¢|¯6ç‡DÅo¯[9q!∏”“|Ü≠•Ï®SoÄ'îˆˆÑ˘Ù<HÁµ—Zõ 5‚„guº%aúÖüû„Òê˝˚`x˜Æèœ?)∑3å˛∑euEá˛`t2£+<íØ|Ó3Âo•<BrÌAπä{fò+nõÂ˙iYj`n&=Ø„ö[k{ˇ≠ÃÍV}πn˜◊®WãﬁPûÇz}9éRBØI<R‹–A ò5u(ÅwÎ”¯ÏîIh<wÜˆœ–uS>üHLæº{˜îdıÈÅ∑
	å€ŒmCû÷°Z˚êjÒÒ∞˜¯1é&4—Ñv|â¶xU¯xcV·„a_Ò¥∞,bciÄ[«@ô}ˆº)}`À»~Y‹?,Q`aä¯]ÙÿL‡˜î3ö˚˜#ÍW}„∏}õªA_ÓNcIﬂ_Œ_H _@∆o.·kÚΩÑs¸æJ·øΩÑÔ=„fÈûo!Qˇ—Ω¨„)∫{úŒCıS^Êi"~∏h+îM“Â∞èœm°Â÷ÒÁ;ï\JEi¡nv¸ŸÇﬂaÈ}0¯¶¯aèûËG;úöXh¯9÷†JËôÒG<Må`¿ıh(G<|†…õ0Hÿ$4ØN≥⁄iòÂIä∫ﬂ&Uª”‰ ﬂäœÌ'15±¶=`fÛ8√VxÙ`ÜÆEçSRv£&vb8·”ºÃk4·„+Å¸è›ﬂŒ>«¬s∑—íOöÛL÷bmË—QÓ(iﬂ¯€j0Øwñ<|ºéz•iî=≤®I˝%è¯Ú˚∫◊z[¯<L-–öWGΩO’P∫ˇÖp\éƒÅƒÇÙ€˛˚—HÓ)Ü˙m$[Z)e£ÿ∫8r#{x˙≠ga\íûBQ›ßÆßã˙^r5çì`Ëõì´®ËIá¥Ï'!†Í«OÚ‡‚b1∫¡öø¥—‚π#Èÿp}Óâné“‰OQ6§˚£ûkÈò‚Á=Âl’∂˜∞˜ˆòY|≥Â›P	CfÕ°ëÛ´Fhn¡lñ&ÇŒM˛1ÉaµH\zàﬁLix)√rìRòÍ’ˇR©˛<ö”ÅΩ©™Vw∆∞"è√üÁ dP˚ù4›n∑-wná–Æ•7…ªü±òUêª≥Cﬁ¡ói°˘#√l$yˆÀ¡¸åwá∞`ˆìπ•GÚªø¸í<RöVèΩFÈ}K›ãïF¥N¸dënßïÄËG©àw˛ıW¯]|†AÃªt‚√!ÕB´˛tæßµ%Ωq…∂>œ0dm°Ír¡Äß£|\©ï'y?ÉqæC‡sd[Í∞:# HƒxŸ À˛n+CQ5^ò··|∂€¡`˝ªY]¯Dæ&m¸‹&¥˜0;Ω•«Úµ‘ÇºÊŒhÉÉÍLeÓÜQ6ãÉkœÅKÓ&”%çNeQË1Ìeªz#IW≥úFò¥ûÕÛà,ìÉ_åaÚåfìàÏ’ﬂi∏påÄ=CCÁ£M%‹P’ MwÛ"‹„‡?º¶±ÿ;“>M|:‚âFñ®-Ô˝aÑV—”`<G˚j”t∂XHk_/rª¥‰⁄√&ñ‘|ÕﬁôVF›Hl%S€J≤&%õØÊ±‹ö—ÿ¡V¥Ñ12ïQVµîúMãVÆlYŒXå≠n⁄’qêF4Í¡TlHÔ1“.ﬁi¿VùÃLÖÿÓ√bÏØjXœÍó◊fs=pŒı¿1◊G¡Ù}êıΩ2¯ˇ4OR«å?M£OÛ⁄	Á†”ÓŸÊÖS=ËŒÊÈ,1øêMÛ¿oöM¶Ÿ} ;*K“xÏcrŒñ‡º;‰wj¿‹;§HüÂ≠Tû/·œdyô<OR≤ˇ1Ã—ò†±öˇíÑåA"&iî]íÛk2‰ÿ»—aÕbÍ√(„F•aÉQŸí2Ùµ0mAœ˝ä£4ºÃÁ0B’^• iQ+'2{`N$™≤ÉjáÙÚ&í÷u,Ê§_ˆ∞˘H$[d•«ﬁf	µü™m›˛©2øBƒ|N◊Çwjˇıﬁ¡ÎÔ[∫ç‹
ÜÚªSSïü€“œÒJ˚±∞¥Ü4Â”÷˚Ω7Ø˜m]óﬁ• #8ã˙èEG‘˜Ú¶–,˙§˝›√CÈ˜[Y2˘‘¿–wC~^ÈëŸ9®›~ –n$Uê^,Ÿ8Õ†ÆFÕéËŒ•Ω÷üÂFí),ä-∆!By>èX˜T:˙í†,d≥lª“„h˘eˇÅHe≠ÄÁ‡<r"U3z5Ÿ@©}±Ü)xÌï:¡o⁄˛
K0ƒDÕ3î$ÈÉÛ,ú>&N"„©!˙Ô>° ;√x§Y˝X†`F≠o•Ûmjèıˇ1mVjà¿˘N≤p E‡mÅÁ}◊≤>æ∏ÀÃ?Xb)•YyÕˇÆüÜXÊÜòÏÆƒ∑dIÛ4•ÆcEs{'≈çÉ5óπ” Ê&™Û§ª/<Ã#f+∞ı¬ÓBgB#rpKGndÛÖÕöÿ<[å7‘ÒgCØ“%Fsäïı8Îö˝ƒqòˇ”Ì)ZÆ»^ƒN$„ß!ﬁã$ù˘¡ﬁÒèQ>~;çÚ∂fW≥»Ôç§˘ı>Ê¯¬∆ÉK⁄ﬁ+µ6Ãõ(R5ÙH4Ñ|]"Iúá1|:°iuN®§ﬂ≤{|∫B*Î≥,^{—!ß<Z†
â¸zêŒÉ»ZÔ'f&…Æ•€hµÊ˛êBOB#›hhø“.a˜Ó*Uõ5ÄâÉÈµ„bIvÍ ‰}	ÄkwáJ2Î€A{™*Ç¨Îé:DÅê“p“9…}¨π T!*ê{≤[Lç[Y€∞Z8éåRìùèπnóåÎË}8s$MÆˆô¸QºBä∂¯R’ÊX¥ ∆ÈAÕO-ﬁÅ√`˙~û[3˚ÿ<PÓàﬂ1¯Fª‹‡FÎg7.èa`ïpWî∫›ãh:¥±ûÒ˝ÈNB√∫Pò‡ùR˚—ÃŒ,.5¿∫NÙ◊:T]ÌÑ´É’EÊr∑‰0,‹ ∂ÕóÈ^`π&£âÁT©”AArü†t˚ÿ)Æ‹˘ËñˇE-‚∑√^ısãåát¯›Möc˙'
fÂYÓÌ™Ò´∆£ïüsè’~çõE„$‡ÖM¨˚…é=–Mπ∫æ’ŒS8}Ò‡’ 0)&pÓ∫˚àèÀ‡ÌQ]ú∫6ˇ∞ı2øó¯j≈«/üM≠sÚU´WDOM¶ö*´æ≠*WHDπt“ö÷7yx‘7b¢Ó)È∏ﬂ›8÷¯¶I0I\`5Ò˛6F ãÄM/gªap+<ùΩF/èwäãu‚d:Ú™pi£wÿ\± «gi}‡f«´Æ≥Eû°¶9≈CIïäMz¶ìhö@nß¡têÊ√y\÷ªµ<^Ω.^ßSµ&≠√q´Òaîﬁ¢ˆ˙m7Äï˜bUÖ∞∏√AËM˜y¶ß5ŒÛY∂πºug)´⁄ñÅ°Ì@∑W˙>¨ÚwåxoDäoúËQ~ˆ¢‡˝c$í8˚Ö∂õŸtπ3ÀΩÎ¥'QK±AE2'≤âøLÉ∫ÕI;Êw ‘Öè€î/Ω”¡íOﬂ‡ì!V;kÚÌ∆Úöì}Y≥$9≥œo€‚—ù†Æ“`F9F¢‡ø◊“_•∂o|°q≤
_.’GÃ3ÀÄüÛ¥€äm(Ì†‰5A… îF,{£Qo÷¶∂ˆzWÛ¥¯‹ÚâÑl"æ´ëAòÑÒ?˝øz,‰áØ≤qíÊôâE8˝QÊÏ4eoê^¯!óˆá`rˇÀz√}A“¸4¬–ªly»÷/úÈ76[ıÓ˝¯¯2—ˆö¨S≥ôQ,JÜ!uÉXd	Ï ´]ﬂ ….8EW◊pΩ8ßx ı›3l»‚á€ï
Aô∫¿ø˛≠ŸB£ƒæDÓÏá£Ñ"∫bÕ£πY¸åömÄ](Âó…Àp¶Ò<òn6H¢‚fLÆF˛ÙRbycùb7Hó*ı∑Çpz„U~SS}è,Jõid…îJuß—0∏$¡0 ±ô˙2Òé9+˘·˘-©ó4}g∏g˝:1“OY‹pNıç‰¡Y+vÈ<ı“ûÔ’ÄLŒΩv“ÎtÙ æ´8oÏ}<r8 
bß9∏Î˚y<#7W⁄EAœ}µ{Å•[óÍRπáCï´ŒÏ#QÚFî◊sÁË’B∂A´ãôØo\æŒöVÔ_ÄCõW\Ωùf!Xî∂GRMˆåÉÈ0—Bà„îL}AË’Ü7>áPf}ÀóÛÎâvˇVõI„À‘_ÎZ
yùpûfÁ\≈%†»∆ø–íái◊Ç:íBÈàR;fB9M‚‡“„HÙé˛◊§ÈÇŸ|4mÙ'π‚m
Ò±¯´‹Q6ªˆΩêÛñ˘a˜ËPüßÀ†‘˙=bÅyBÆ6∫é-i¿Ì* |d8ÀkL
ﬁW¥∆0óﬂ¸~∂%q`ïªkú¯^ÉöÇ¸úå‰üEÈ ˚Õ(ﬂ◊Ü≥ı7÷|√÷=0ôÔB&@$Ö∑ØOyÙÉår<Ô<ì}¥;∑<j	¸c……E‘Ÿn<ZÕøí°·ÏPä'o≥“cÕ◊¶U-7™ßå£J[ÙÏò8[
„*œ2ú≥ÑZñƒÊ§üRíV=≈p¨ñ¡®ÛHƒ’’ÛëN” 7⁄™~œ=ˇhÙ≠3_¸W\%ˇûù‰´„´‹øì≠∂=∞°rﬁ_#c¸èú˜∞q_•±~q¨ˆ*–‚‰c'òÁ	ö%6Ñ¨Mßén—(°hvûÈPñV÷\@=ÓÂô$∏7∫.q!ö¬F
‚ÌõíÃÇAî_oíﬁcˇ]Èπ¿íÇi4°·ûRΩZœQÕ1ÙÒZ≈úbíGKÀ„bïÏanˆO√4Ã9(ºÊË∞-Tq≠ßÖ*Ê≈j6)»BÀ!Õe+ˇ†P–J≥Á4O√`ä8«¬ˇ‰:òé¥x>çÊ¯É«t4∏;Ö∂≤ »ë&∫éi± ,ó◊0X≈¿>»“œÛ$ß'H&a(}Í‡htRﬁñÉ˚åùﬁ^(Ó¥	N@`·Q¨0@qözDÛpnê\C˙oGÙèŒEöL:qxëóáπ-,ÌÆa◊ñuÇÔ≈ì<∏¬¯Y”ãÔ∞Ï’èßsË∆ê¢« ébL/Îf*J0Ô—ió|ø{º∑klÈ‡ıõøÓûêÔﬂ<›=<›ˆ¬¥°Ö˘Z≈J/¿0Ú?ä◊ûQZ\°¯AVî|ïÉ¯ÃÜ’x‰®°kb\≤|†så‚˛∆Í~iü‰k=’‘±R"u]IÛø$@‚—T%JáçvÉê…C0ÕÇÄMÙãÈ•—ê‡ê)dù¥Œó˚$IWôœÈ%xÕN≥Ÿ9HÔ¢æ)π´Íæ˘¿¨øJei	Fê?:ÕÍ≈çÒ≥#ÃÃ.˝ÙbÃB≤OIXo∆x?$&ΩÓäΩû9ˆ¯â$üˆ˝b0´7œkÇ§K™◊hÿ;‚+];ŒÍÃ‡íá´Òœ(®Ø®Ç∫∆ÒC€fMëXá¸µƒFÃ6NkH(‹Û(O°˜Ó.ä◊®i÷kXm›KÍ{PC‚·<ﬂÏññ]¸’‹ÿ1ø3∑“ZÁÀ`Èπí¢$üPRNòy4ä≈·4ŸtéﬁBwÖŒuæäeöøë∞èHk/.ÚúÊcP†*µcÜ°∑4@q"≥Â6Ω:!aˆÒ(ÃªÙù5ñ¢RZë|YûÃéR`§#&‘4Pfd°æ¥X“√ÇÇù%∞†ID√E2ògõ Î«—4§wˆçb~ÒQòßazµ‘õóvîÄ9ß∏w§üûPªâæ Eâ˙lj]k`,≠ÿﬂ5s{—CR[Í§\N»G≥yÍ˙Ωf&[S≈ˇ  ˇˇ %RQxúÏΩ€rIñ ¯ﬁ_·ÖŒRë]Äó§ò¢4ê»îò"EIeM≠,≠Â ú@Åà»àÄ(ãf˚∏Ô˚∞fkk3fÛÛ˚)˝˚	{é{‹√oê TuEw•¿√/«è?˜CH·yAZ√I;Ù#÷ﬁÈí°éY(>ˆª]≥/±¯¥üÆ˝—"⁄oíµh˝1<˚‰◊N”xëÉÉ“˙âér˙∑lf~YÃ.XÑÅ[ú_ÚE6√‰ÛÓNiéy+õY‚@ëKc÷Óu≥Åƒ˝ÓéG|¨Ä"mcÂ˛„ΩÊ˜Á⁄wü˘AÏ¯˘L›;hÜÙ:n=Áˇ<€ø5Í‡äÖ3'tÊ≠ÁÈ_KusËD,^|Z80óÙO≤6xıj}…Óbﬂ•3ÏåˇA^πÛñ[aÀû_.fãH·;õ>ümFÃe£X›ÊŸÊÿ˘¨˙9˝Qı3¸JF.ç¢wtævŸóvèD±ˆm{´•V3*ˇ}∫]ÏôcÓáΩ‡À/Äµ^‹∫t4+‚Û6‡Û"X8¢#q?#^Ëv˙l˛ô€=Õl9g$¢¯Ω°!ı¥pùnÎßøUåtŒO”£ÔNàÀ`ca¬±3ô∆ƒu<÷Ü˜ÁAªoòˆ›Øùêçú ±Lw8a∆[KbÅ|£â≥y‘¡∏,$
S%˘"¥∑HË/º1∑˚_‹ÑïâP)ÌÚ™„ﬁ¥˜»˛óˆã›N⁄7Sòä¥$Æıπ~ZD±s}õ~,cë‹œ^ÜªÊH9cwΩÌ{≤©?Ç&Tóü¢π„µo⁄∆˘qLnú1ãb√PÑ≤ò:.ê?QÌ¡uÕßﬁÎ™Áæá«%\x#¯PXƒ<nw;;∆π√9˘‰Y4
N6uá≈8{”y?+á…–8¶£ÈP◊Oû<!kqDé‘Cﬂ0ÊÂ“Ò∆ŒƒáπŸ«CŸÔÏê‡ãˆl&o¿·ÑWL¯gIÏ∞˙;ß∏±Æ§Á´_CìlI]MÅôA«˙C»ªÜ{…”£úÔé´LRäq∆ôKvUèb¸vÜ) l"–d∏àc_	âoX≥hj‚%}ÿñ—Ï‡nç≠ìÉÁ‰Œ∏v¸± c–	≈„µ∂˛ÉÒ•ëÔE¸≤õë2n◊Ö‡}‰2¸¥÷¢-ãû∞èŒ4d◊–—«1çÈ>Xü ¶?äÏiœ—ÿ›ﬁ¯Æ¥[/˘ó˜-G˚7ûÎ”1åV;…ˇ;i·ÕÌ —2˜ó-{Ëèo;0kÊç_MwºÜ#Ÿ.}Ñ€eÚÚp!õ˚üYÉ·ÓM(]8^@e8±πÖÀ¨Há»∆˜ÛØz)î|∆cóR'`çƒ1}Zπ∑XàΩ»¡}oè|◊£úFhÁn:ﬂÔΩÒbj8™‚t≠pq¨´·´°¥Ä25˙ƒ÷—ƒÅ?,oa√ÅrÂ«‘%Ôó:Vl∏ó!•˙pÁixÚtÍúg°q⁄“˛	ÃuÃW–â˝D]v£tΩ÷r∆Ì„√ñfs≈RL∑ASVÚÓ#^Ωf˘;=!_Z…QUq;f’EUΩíÀ‰V„¬ERwúú∂πUîY*¢ÄÊÂ˚è˜º{5e£Ÿ+x÷Oyô›’d#[π˘o‰ô.:äùœDˇÜö¥O^˘ê›òƒ>nÍ'6ä…øm™1ÚnMµ'x√©1eù≥≤kF∂A‹˝NÑs9˙‚¿ﬂ$Ûä:ë?gkv°Öq–Ò∆≈9Tπ{ú§ˆ›µ†3.4áIóæË8ﬁ»]¿ o1≤p}]”\úö_CÄ\Ëi¸:}πf´(Po~ﬂ-ÒÏ(_+dj!Ûr9Æ@¡Åõ§?7„Öa∂|∆V|'>Õ˘I|ñ‚)Òô!vYÇˇu$ﬂæÚº_˚’™#ØÉOI9qΩp]≥æ∑£'£-≈∂qó·Ú£
ß˚Ìê\á˛º˝ŸÒ]`[π‚y#¡?€|ü}õ∑¸>Â™Ñz§p(Dm%GM)0ºÌ˘8#˘å¨YŒkQX:ıú9¢`∞p#f÷Wõ%*¿±ˇçfí‡V]ºe.–∏ˆ‚º„∫Ì—"äŸLÜ∞Í≥˘X¸˛=Å7·òÜíÆ’,©Ò.,X@|÷·Ê±8`M•~!U)Á6|i.ßÜ	¥(/˘"_`◊À4)inRÙÂœ¸?ˇ'π\åÈ¥~ry˛÷feñª‘Ñt-KºV _ÑxÙ≥Ô0ê~«®9I/FQ+“EÃzõûÿ›dßç™÷˚îS§UìÕÏÂ<3=±£(È9À\ﬂ•œ7}Ü˛ÕW‘'î©k‡Î≤W-…Éï⁄G+-Zı°¡¶˚ı5eÔz6¥J¥@›NQ%V∞*fM¶Œîd<À˘	∂8¿¿ÊûáÏ≥√n2Œ·ê∆‘»4¿{«QÚÊY¿ºA¨≈·Çi_”‘∫M¿ä∑Ë¶Ç≥Ÿ·{*Á˙çŸ‡≥s†Ω,º≠≤	 ]9d?BY∏˝tG}ÑµB—9—∏8[!äÂ˝8 r~¯£Èlõ•Ù6s’6óåΩV∂È5¥ƒı(¸3`/luÜ˙º2G¸ÏÖSL]ƒ3ÚÔ©s›Îì)˛«x˝N∑kcè¨ﬁZΩn∑∆Êñ±:≈˜hÆﬂ¿ÿâ]X…—ÿâujÖK«∞AQr˙¶´«J)˘≠!™»>¨Ä™gºA2y˝∑AΩ‘)˜:“#oR¬ªÏõEª74XD+‡›UH£iˇ·∞Œ ÔD˙”‹Á
EâöF%lU…:∞§mº*Ñ˜g?Ÿ∆:aŸ‹…˜Ù√6ø:ì˝Ïßå^llÎÔP˜tËo“ı∑sÆ;o´œØÍ~»úœø¥È"ˆQøõ„Nc∑åg?:.ªÇÆTÿﬁS¢Çn%Ó=Jù¸vM'Øú›KÊ.Êd06yÒ®˝w$Fè¬,¯«πòÁúçlÆ3¥“ÎòÜ$H'î+úPrKΩ	x0Õ·òä⁄Ü9Í\2o‰xNG1mÖµCO¡≠˘_‡¡a––“•n%Ò-Î?wëì›À8Yk·ÛiÖ‚
Ùär∑2©µ¿ﬁ™ËÆ5qß/Ÿ—`¢ÿ]5—Tú•öå&iW˚ÍŸÊ µ
'Ù÷_<s6áK¢zài4ãZ˚Y+°∑Rπò{9 
ﬂgºOZW˛ÿomóôãœ»·|Ê—‡≤dÜ‹o‘;8ˆP,üÑ,ä
˝ø#ÁgØ/é./ÀΩ›Ö03©:ª‡BYπ´ã£üèè˛RÓà"ﬂ¿-?“û}è:9<{wT~øhx*ˆK¡: ±<+lGiÁƒç9
A>∏ã¯øÂ˜Ωwâ™Ë‡.Uï[,"‹%z—˜°¸sËª,:∏„ˇ©†PÂvJ=<{]€'!©ƒî$Ê„}˛wËﬂ‡ﬂj#6 Xª‚™≤]?õˆj‘{´Å≠ÓS
î≤†tíüf∏\’ærÊ“”:ÌIÁß∫\v∏;v·R°_⁄®qWåËDqËëÉ7Ge≤ÄÂ\2C2ÜØÄãâÈÇÑN<gÑ{Î(õ)tÜ∆Í…nÈ}£ EÍ+»Í˙Å{‰
HÕïèÚëÓ“·6µ∏k§˜LaTÍëÙ⁄ŸŒôÆ~à~ƒUD˙–Î!/¶Ò<NnºÜ‰:÷≠‘™¬˘˙^wß∆ËóÔü˙≠#≈¥swë à=ã&4%Ø∏øy«nÇU•.Q›Nrm`ï LBgL?H "toÔÁ˚‰ã[¯∏Õ≥'A˛ª‰‚ÈÃi∞∂&>(ë™xU· ∫‚◊YÁ⁄q¸rÃZÃ;åãn—äó2âCÜyZì/Œå›‹eﬂ´©•ä m÷ß¢6ﬂ‡ôo∂Ë|˚Eñ‚ı›«n\òÚˇ¶«çK`ﬂ•‡·W¨>ˆD/ç Ç	ƒ…ïﬂ;⁄hìG~2kŒ'\Ú5A&_≥7´Lé*Èµ‰<ÌÚÓ
«©„2oO5.kZÕk33B rlsW‚i˚Ï,U3Ÿ“T9Ω¿√oÈò¬ÊÅÎﬂ2$#˝…Ü7÷[mÖ À®ZàdÁ”Å:èçØ|Ú˜øﬂDv.sz©º/#NÈ£’Üâ%'F∆¢é≈Ç–†¥§‰˝c)πl0£1£cÖ9ƒ˚ÈÄxpC·ü|;Èè˝8—‹∞„t¢]Liºg˘x‹ßâö‹	‡Q(<ÄﬂOÆœ2ÏæÀ%Ñ„Ò¡ü\Ü¯cŸóΩAN‰‡Œl·æ›'Ìm›ÓäG0? uIN+ÈÔ¿⁄¯üp2\Î¸øM“ÌÙ÷[¶Œå&ÌFF>>π«…iÉŸ∫ﬁÑ˚l4˝2Wö∞°Ì›⁄Ÿ·,® në´Ù@ÿã¸∞¯¬l6Å.ÇT≠ëxe√FÑòòÀ‚cå∞ê±UˆC∞pêBÓºm·¬Ô:c´2W!˜&ê›xú◊PÎÉ>≥Èì>«ôÎV∏Eæ'¿0Ÿ¯-‡Sb.õ‰&€û˜eì{ÚÆmÈ‰Ñ~$ù]˙©:=Ò}É˘•n∏âGÙû*u*ùÛØ-˚÷så‚±Ò⁄∏+Åœ‹ßµ≥XÂ∏Tˆ¸‹∂∑>ÓàU7∑/;∑/°`≤µ¢ßK±pC1π%'≠¶;Bb1Jßƒ¢_
¬ÅøÜæ®?Ø˝pn¥≈7ó…Ã·Z”#,îAçF<8”∆Ll7
@KØ¬/#ëﬁeﬁﬁ-ÛÚÛ&6ó6„ˆé¬˝g«∆'–2¿–ÓXÑW¨x‚"FtCg˙ˆ‘èaQÛŸ§…b¯$úπ\˝_¢pt`ÎmH29ÂEá~¶hu2ä˘Ûq«A¥øπÈ ùØwF£M ¥/ﬂ›Uç˚èñ€π! º®ß‚à®d6¿Ó:±Ù√≥ kºas)˚©µ´Î]æcx^_t¢¿N¥EZÎ∫øÿ¿Œﬁ-ŸjΩFµçxälñ¬o¥≥”,lèÛYπòÏFô*{ñ#øP	’y®ª˛Ÿ+◊áiÊ±«<«Ì6Ω(dfÅb¯°,∂aÌg<¶ çµº≈úÖŒ»(G•œˆd
ÔES?å-ﬂ∫78úäÁAë“&¸Ÿ‡í>ZoWM T]„≈9ËÆMÃæv‚%VkIÈï%§U{◊(·†b·¯RtóIY£KEé-I∞ªç÷ÃﬁÄI£	∫8…ysî>V
„39V7˙I≤óul~xØÄÑx67…+Íé#",Ä◊Ró–8fﬁòz#FB6Ç-åuè»‡‰$”7f}	µ]⁄…kﬁ« Ô‚†–ﬂ'ä˝65È¨A˜µ”$∫Éd4=?UîÄìJÔ	ª¸#ÔO» 0«VïõÇqr='o¶ÌË˘téÊÅa:–¬f*®VÃ#ÔAÒﬁªTü¨|S1{°ó-ı˘ájÿ&û9ÊoIÜÀõ÷«˚ï‘€_2é¶¸Ωa·+@œµı\¢Û≤ia¬‚çÍî’ÊE•ˇ<.t]ÉKºâ^¯n”◊<?fëÊù"$}tv‡À∞0˝õÔi˙A¿+Ô‚æÁZ:Øœ/	˛Å˘<|ëv£zú≈œ'ÈØEÀJaé¬RøHÓƒb?2"P°zMòÚæ¶≈C†…P≤ˆujb©:ív‡2ä◊÷ËÚ˛Üùÿô√L(@ØMh˛	π˜*≈á˝o§∏/∂π/éñMoG>˛—Ô∑ ±pÁû´Ñ&£ï;˘Û(µb¡:+‡Ás¨t$‹™èæ∞–*—=?¸:Æs*©ÌÓËø8H≈–ÍÜˇ—Òëﬂh'€˙w`˛ΩY9zÕπ&k(º∑^Ÿl‡ä‹≠◊t˜«úÕáã%ü`6Ã•dƒb:√‡é9ıßæGúø9˙¬~∞»0Ùo`;’x9±%∏ˇKm-”xÓæÓ„HHY‘}ˆá√≥WW=?‚≠*7™Ï+`ˆk\ŸÙ¸ÇÕh@.ôªS2Fÿò,M¥©æ≈∑ıo	¡\.Ä\\Ã∫¶s«Å‡Ooò˚ô≈Œàíwl¡˛¥A°C›ª‘‡8◊?êÄéQ¡∂œ≠3?§Ælˇ⁄c˝ß[√$‚{§¸.QªŒƒ€'Ç_˚hF8Ê`Ë«±?O;M∑Èó¡˘.úΩÌ^˜æÔ”lYì^ﬂS>Ì√¯b¨}“˝A¨π∂tH˛≈C≠·>ŸÎB>€L-∏üã°∫qÇ¬0€0mnØ*'föÇmw˚˚Ì=9ÿÊÄØmÓsG∆»˘(≥!¸CŒÙ
î€O“'&˙3PãsË’ñåjE <–Ä	Á∫an◊{◊ÙzTÿq1ı‘¢@«Œ"XÂﬂAã|ßXüÌ]we+ãÈ–e∞(‚Qúﬁ¯èYØ óÃ1˝´<qæídy±§ﬂHônêA'ô⁄h8ﬁaΩ¬¬v·7æé"Ü∫Ï:ñ˜åΩfÄjß[y›ªﬁπ~∫:&	{q{
≈Cì∞››ù≠mÈÆ©;AWËcog{‹e˚àËÃâãa€]z›∞Í¥–«”ßΩaoh€«µÔ«úÄ7~õo|√ÉQ;≤√Ó√úCÃEAµ‘ÌwÿWËı6ï©Ôâú¿‚ÖÎJÕ≥M	∂Yø*û!]W{÷Ç¯ÕÈîÃ?v⁄~qÙvp~|ı˛dpyL.èNﬁ_ºC//èﬁ¡ÁÛã≥øΩÖA˚íóÉÁÁW‰ı…ŸÀ¡	9~w¯˛ÚÍ‚òºæ8{NÆéﬁæ;;9{},Òïä®≈ÈfD∞âG/~5x˜˙5LÊ’—’‡Ì>˘Ó.˜Ã–k–™∫±LÎÂ˙ ªnê[‡oø£‰¨¥≈LŒÆ`GØŒ.q"*5uç¬YRï√¨‚k›¯bﬂ»è«'WG8[Èıi]ùæ$;è*‘µ≤õOp<Û‚—ˆ∫ûõóÙÌ∞|;∏¯Î‡/Éwö’»Ñﬂl%È˚∏Âã™9»ëU˙%ø‚$=ƒ2ÊN¸*î8p›≥–JàŒV∑zS%T©ı¸›pÅSeGœﬂNsËõ¶ß]◊Êß¡À¡ï©£‰ ÍΩ\k[§0ê.˚Újpı˛r˘˜úí”¡Â{˝rç]ú›|˜z˘>NéN_æø–ÍÌ†=å¢Ü:|/A%l-EΩg±Ï∆¿«H©»s`n_(UnB*ŸhÉ8„/\î€ ï∏è?çµ ˚Ó∫&&=8≥±Ù`%Ω<6Ñ∆%Ìö∫€-xq¯‹Ù≤x≥†ß¡ó´¥∞‰”XRı%‘où˘sÜS∑eúq>]TÒwﬂ“ñﬁPœˆeÆ6À÷i˜∆m∫æ	ãèA»ˆX‰PÔP|øñˆ∫nÍO∑mÈÂûÜﬂ›Òn?Iú.Á}[Îe’=nwµÂõ¡·Òo˘ôÍ§Â
sK‡Ääôcœvñ˝ù-‚áÎÿÈFp
Îﬂ˝ô¥»OtŒ-ü÷˚œUÉÊY â!◊;ü|«[˚”ü0Äz©„"¬e@ΩÉVØ◊“¿A•áx∫M∑Ü{ ¶+gLgÑé)¡‹æÑ& F±hAùÑruñXfù„á¶R÷{S 
Y\!›(¯€Ï®Ö©Ø ∞‡á>sŸtCˆ+Ôeî÷snÀ!gpåh‰¯uõ3°ßõ÷ŒXv∆áN»fôºèÈºœ,ˇR§r¨wë*'”Œ◊o$≤Np5ˇë´%◊÷(Îh≈X≤~·ﬁ©·W}`)ªtAÛŸ…í2ﬂÑ5‰∫ÒïëÎ#ô,ËË√`”’¢IwSØüR¸S„0ÀÈ˘‡ıys48<∫ O»’Ÿ9y7¯˘¯ı‡Í¯Ïπ|ˇ≤}íÆ$ø©>.5öÁq©:∑ehWsyŸŒ”L7êÈVåWU8• ‰'‹,ì⁄§¸Âjq™äÒπj€â–ÖÙYh∏S¢àå~<JïÕyú*¸È˙3l2Í∂Ò⁄kçZ˚±‰r1$WtH^Ú¿≈HöÔ∂äÂ )Ó…TL%† ìß»J 'óödü ™UV¥÷‚ UBÈRË$Xøñ ‘*BXM~†™Ô†ÙíØJÊ∏\òKPºïzúK£s≥|§Í∑Àbªı¥N RWrG2KÅπP.@⁄q4e,Û≠ﬁA∑1R6√é´5YV«† ﬂ6û‡æm,9•¡90c%‰@¬¸Ñ¿/zÚ¨B$π.·6$Ω}¬èúB,!é5u\ÂÏ ‡‘∑ªHb(%âÇZœyx√)ãCgD^QÙíß(7Fó√]å.w'µËrU‹ë‰>HÉ±v
>l{y 'M(ñ:jªaÌ£eÎ6âÇ
âÀU¬®Ê§.• †Ók˘îy,MWiÃÂ˘ä∫àl!œû_3âÄiŸ•!3kÁ≈!"e∞à)\°ØèkVáu/Çê‘@ÏRàø3îBá&r0°3‡^õn¥.êÁÒ\$…•À¿ÍkäºÊú∫ñÌô»ù+úõú…_˜\±p,R≠Ò¸iÄ˜ü»ØG˛üËúú†[U¯x®_(Z∞ÙÖ¿„1V«{Â] ﬂ-Flm-ZÃ7H(xÈ≈ú¸ô¨Ω„yD◊¬≤.ñk˛ªÎø•¿˝wvrFp•≈®É•d
B∏R8H.ˇ<?*ê]ûÊÁÒOöMnï”É	ﬂ¢⁄h•<uv«'OÇ≤¬ΩqÜ©O»ü⁄‡@ªåÈı≤ìÚÖ§#»À*/è˛€˘Ÿ≈ï•†S.∞ªm{v‘È˜åô˜mÂ§|àõ§ZIö≥$≤Føôh5Ú`
©ƒa_]®™:çê¡¢EÌ´B›}S≤†g…HÖÆË0Ú›EÃ∏Û`{C˝†›€Ïìvy~Àø®#⁄ï~ÊxAE_~D mÏ[“ ≈`S@v¥@hY ¡ÍçD◊∫A8Öß^ß”—ı$ é◊§~]LòÔΩö¬…fY oâ2JÙ≤∆:@3',Ó¡¥ÒÑı†‡¿m?Ö5%ö*õä$*eVƒÊ'˛"Ê≈∂=ﬂúÒGãh}»⁄˝‚á<]ä| ç÷gG‡‰@àlâ4¢¡uQÀ]9≈˛ïú≤‘ ∑ŸƒRWˆ{Y.
∫µÚÓUÎÙb±ô“FäÙô…©œ3((&®9¢æ®' À˝œû_≤˘"/#ÿ»[‹ÉFDµh£Fì!yÓ¶ÄgLˆïPè$F„Œ)˙§s¶)Øk‚⁄`svµ>8>Áæ}+·r÷ÕÔè{{èÜ«È6Y`rŒä≠f®Ãä®Ã,Pô˝nP˘
ÛÎÇƒ¨¡d˝U..Ú±fÎî»û«DÆÜÌy?´°˚„!ª
4 ãU+}h~„ÇQzx∂ÙÖ}-E“<◊Wû≥ï’ÍÎ’ÍÑ,WUÈÇ¡™R‘VÉ P«C±r≠.¿ÆTÅ!—¢Ä @oß@¢s5l≈»∑ß,îY›#@e•˝SeÃãgÍ”:™î+πÀ√¥ΩÖÃ!“îBÊâu⁄PÀ¢"ÅBƒM¬GÑ≈ÒjÚ‰»^¬µ£/â»´LÕd)∑fÔ'ÂQÄÈè˝y;ÖæÎ©∫¯∑àêH)ïË7Å:(C¶H§CïAyãP™®`q√ØÜåEËÌ^<Yp„$Bˆ∂ê±uÅöìNzªI/v·ˆöÇ ,zÍâûå°]%˙c@Öπ´=—ì>ÍB”çd#”Ÿôb1öı˙4Öû1@cÈ~MQÕ:N k
Â–tö¬3È…±‰⁄OŒﬁ.ç€ØÚÄŒ~’”]RúêR Ì[í¸QP8ñî,eÆOü_‹.NEüRπAã)ÈRöﬁ‡S--v5Ûu9Jƒîô…*54>HÔπ Ö˝ãå0˜Rn"ã:ªvÈ—c_çrR.’ùœ≠w#iíÈ)B}ñ 6Oc’æ·x\VQyÄV¿ì∫™ÿV2Ú7L>áè,¶	ê∂ê4U≤[º}%ÌÂ∑ºÏW\ÿÁÜ1RÜaÑø≤Ô˘≈˜≤m„™lF©ûé]˚\êÕ∂æ¬∆‰nrX,qµËvöú©!7Ú+
 7demv„S@I±y¨öıÎ©ˇijOÌ•<x˙≈˜Mí`£?juB«s’VÂ3 rpSu7úçl>óò?¢Y'Èî“Ã›ÖÙﬁç'îf
œK§f™ì}Ÿ‰
≈ßÒ-∆1r,˙Ω⁄‚-^•Üª5¥èï|ÿ1-„)õö‰‹©	EÆFf~îlﬁ£+’«$2Ûkﬁò•d
ìWR˛7è5®›K´/ê˛ﬁÆú;d Mí@aLã◊≈ßq9ë¸âXúJØ¸SÍ—	[ÉπZëu!:‡°IU5©ô±ß„Htíˆÿ¨rI˛kò‰Oiw{El©‘uZ—†P‰†¨ÑMØˇ<B£Œ#ﬁ†äIÒIäcøƒ‹rÂl∂}ÿ^X vF’a@≤«¶v{˛® \K{ñ:oU
HÙ]m˚KJì‹∂4º°–Î+í·©åÎ’¿Ô¶	oœõ‰aÓ\f+£~øt')˝‘ •≈-(†(t≠çàØÑ»+Jb‹”~h∂^Q_¯YûdG¸®w≤≥˙z˝^’ﬂQ≤ÉWoèﬂΩ∆®¨¡y£h(åP≥ãÖJú“j·Jí¯§Ω¥Œ›Æ⁄u≠⁄=tì’∞ﬂíé/™W:ÿ~qk6ïÃ©.y'À˘]ä¥Î©«j'†´f(U_€œt˛r◊!,SÉÄ<©“AìÍ»˜îÁ®3∑„√Ω‰+=hi•ë⁄‚.OPÿ’_ñº∞GVscNÉ®3Ò˝âÀ:#Œ?ø¯ı‡ª*ÿí∞¯œ˝Ü˙Worˇ‰oΩΩ'˛"Ò·o¨y‡ Ùo~\∏Æà˛W€ìümä=–‘â^õËZÅÆ«ﬁµO∞™ÉKo5˛uTŒú/—ÁrW∏`Óró◊≠7üvyÊ∆q-@ú—∆ö¢:—*Ôj˝b%°¸iπ	«#◊tÃˇç\áˇ—æ˝9&˙Éf„E»ìÈ
ıïNÛn™˘¬¢∫°òåX‘b±N»É7ŒˇSZO Ãî¥ºçû’°.ïtN∫¶˙î¯Ê2∑¯hæBë)<M>EzÙ|-%â–˘º€Ÿ1Œ”™ÍJπ`nèÃÌ’ÊÆ)à¡ttã¬ ˛:yF∂∫Ìèÿ/z≥©´b‘Qõ¬2*:SEÌ]cTF˙fÃy≥O˛ﬂˇel{wJ„iá√–r]ÊVwñACí60	D˜,kå""ƒÛ>‡ZÒ+@åŸ‘	˜ÔZƒ® »ìröëYÍ,Å∫©MûıÛ
^)g˝4lë¸¶¢À∫üü)NÇNÃ®W$+Vø*ámËJ•îåe$–q)$I}∫ñßÌΩíS©Ω§ãh(·eıtœk%ü2¨‘"dE‘Af}äaéßäd◊á_©˜∞.$$Ø®òëî´¥"Gô§8(WnWõçî¸˙Œò˜J±‰Zo∆‡TGh^ÑOZØªc°ö©π≠ÒIB$ö†Z_ÎÆfPò (M“ Ä{À ∞¢â“ „î«£áÄƒQhJØªf≤"Úg%åØHéñ>x»·ße¨KD>õnY÷-•Ã2’Üc»O(—•Mòƒ-Âƒ!iÊË3T«•YG•È‰—‘wTŸÊ∑àc^ùB÷Ïbƒ≤´QÖŒ*üuëÂ¨
∂-ãÎŸy≤õÉƒö˛$W/eáV∏¥Ú‰tIû-{◊ªJ≈·=Ö¥pÉ8Ü‡ÉL√öCHa≈ˇ™R”F«±ÛºGôI`G!fv+'˚V…´∂ìJÍï≤twÉ
Ø˚¢ìTBÕ!ØÍ#>8^!©•¯ñ‘-‘qœe¸ çºc≤d†»W©’W˜(ìﬂ3T·÷Ié&MÅ4¢Wì_Q˜>∞]d	Jßº©◊x°{õÚΩ\ùìÌÆçü©Çk«m§K≥>¢x≤≤Î()Q®-ÿ·πÅC3m◊KDñyçDwaÑœZ°
ñ\£aaz™Î<,^™jEØòî&´è¨#x_P≈jCÄ}“ù*”G˙7[í∞¬^’\O3_õ-~jâOZB8ı√¥€Âäá‡ä˚l‘PfK≤QKöÙF¨ïîËòû.Y«æI	˚‚/◊◊lo’xêˇÔ¸ﬂˇππ+"oôÎ∏®ûÆó5©∫iK˚/î4…∂$˘Ò2˜ÎJ\h…%ÍÃç™@„ÜUf≈YÂu;s#`Çûa˜‘Të8ôòº¶˘^É®ƒÃ?” WÁdpudûïïèÅQªg¢ùMâkÛú;º+g£ú«eñ>F¨º{p˙jî5˜‡ùÖAéçs„µH	)xh´.é£B+ã©”¿Ö»Ë8T“CÍe[Nê

´≤´¬3ou™¨h^	’4ﬁâ—â3•1¿IΩâÙØâ0∑üZeì·Õ≠¸Öû¬–øπ¿€⁄0ºY- ûáPªˇø≠kCLπú◊Æ#íë(øô©cÄ`>"G®˝Yù°&ﬁ€◊∂∑Nƒ%˜«U3
Ë˙ØóÔÚJ pMj≥újo`}‹∫ı*W#mõFÖ÷Ô3Äœ‹À+≠ó´£"†ŒXMôÚ?≤⁄¡¥vß`≈›¨øR]5◊m≠ß!iH—´uz•oΩ˝ÛZeª§ZäHZ"U˛·î¢≈√;•%)T]j\ôÉ¢(µÄM÷π7ÑÕáBÁer‰“!sÅà§ò a´l~‰Y2ˆSËäCRn·¿†˚‰PôNX˘ß§íM+èy@Ò±‹FlÿæÿG¨°ÿÊ~√8˝∑æ7v"áº§ŒLªÄ2zî∑cn.tƒk≠k S3ør¬ëÀ˙ö’El’Ç≥Òñ]ˆ°3YxtFΩ•◊|Ïë˜ë~¡<â¢f•¡"\ÌŒ&É,ª ãEDgõó,¸ÏD6≠$È∫≠Œdy,å˛õ@îRQB£tB*´[’mˆj˜öT÷ê◊ùQFF|Ì 2ò4Ê	9ÊÙïÜN$Ω+•®∆0|¢◊N¬œK[ÒZ2N6%‰ h”
2µØï2úUhÃëﬂÃW˛—ÿâ◊ºÖÎ*‰$.\ß7ñEtÜTú*sS…ß`¯.ö>∏∆5˜˜≠ŸÀVÌ^◊êª¶ŒK˜ˇ‹ìXª˜§¬åJÄë≤U ˙òj‘¶Ï√]ô]v.$â:;óNƒ◊ô∑ÍÜ≠„2c√GN(πE·y*Â≠~¡z/s#Ö¨D‰zEŒı…ﬂ›…ø¬¸∏6Ω$VìƒJZ≤èÓ‰∏÷™ôõ Ó	‚eµ[ZQ.*ÓìâAËª;æ~M›õ]=äˆ∞ÇâB¥Söz˘òéïÁáŒˆªLıµﬁJ@Çs*—HÂ˚u“nã	réH5Ay…A•N§.€ëôÂ}e™ˆÙ{HxMdïUò•’\eÑGÖ*{∂º¿°(∏êÛ
çÅîàakycJ§
ïV“»-π€ç Õ…X%®t?T™mq‚∏+ØVTñΩmR”Tﬁ‡Wg⁄µéZS,øexòMSŸLû=|ì'ﬂU‹Ü‚¬"sß°DπQ-[æU∏flâÃ•ˆ<2ø“Ùau◊ ¥O˜∂Î±R+9UV=pJA©£ ˇÛ⁄Á÷~œmÉçÛ oøî›£¬30o,8”‰,íÅ‘å 5˚ì4˘•Zuh°egEÆ∞S-ó<HMÕa•lÆœ"—Xº] •±SL•a9º|Eëﬂ™ìröëùRñÎôîíyÏtÀ«G7Ω°`2*ö,ìv
˙F4Œp»öíE;´Ât«ÏQõÂô‚)tõ¯Ñ¸IÄnÉµcAc
j∏Xÿë€±E∫°nH%£0|q@÷-–≤uŒ˝1sØn„bWƒØ#åEÑP≤¿!‹[Œ√mSüv≈∑®Å#ûãÄ‹	∆
ãxèò€ ‚Öƒ
iÁﬁÙHqÓ◊r⁄"3ñ9ËÍ”#ä•e…L˘O∆ùA∆9a±Ó›‚’<,˘Cõx$«^º®êØä*Y1Hs¢ŸÈ±qò"œEbÔ◊t"ö*¨BÈ$‰m˘0X|*hc1æï7ŒÍ±å)8æ*/Õ‰€‡Û©„e
P´ÏéèÅ∑x81uùëuñë±/&4öô˙¿E^ÚzSïHCWÒØÅ[˝Ü∏eJ-êÃ†Ë(Ù[°ñ›TÖCÂ≤t∞A*·Ùi¿ÍÛ!øÈS†üP…[≥ö∂iÕñHgV±`	mïM∂∞∆≠Úcëf¨Ï/(©⁄^•x≈|bçRÖYΩK«¿TFˆ~z∂ûzKl/çnΩ±ﬂdÙÓ˘ﬁµŒ◊>æ°¡˝ı
b⁄ãèÎÎñ…ÔËub2r?ÖÎÄ√bvËès¿€Ãd-· –2Â »FM†vÌ≠◊å+†h]€±UvZÕ\ÆgØBM˚è±´:`,®#˜e÷5sY•ºY÷,$x$§‰ª(≥¸ï¨>yh” À∆5•±:å9—‰*AíÂd∞—œì*&áVÛ¨x_ì*±0.*çzöª*O·¿}7‡B†Û¥RΩ:çÉ∆‰®¬âD/m+˘rY?M„ﬂÄ–‡·ö,∏i~m˜$îÓ≤$R(;?æ˜íƒ˜~GÑ,9ÒÎÅór_£ï<ç∞0“òŒOÏù/„.¬≈î{π)"‹/◊âbL˝uù‘öØ˚I¯√Øo]∂1+g\»Ú«Æ˝êÌÁYNƒgûn‡CÔ{>Ò¶ËßíœÏÛ◊´¶?N¥ÓCoÉÙ7»÷Ÿﬁ ;d˜a%u˝â∆F ó√-°–Æ§# ñ∏:ßrenæ‹Æ»Æ@n⁄OA¢{ZçK……~Ê˛RÙ∞2 y †m∏˛¶wÖv9uò;ÊŒ∏È=æ∑åíLÂjÎOÔ bÈ≠o>ì—±X¶˛6V™Ó„5ß÷m-±ÎúÖã!ùëxã¨ÛÑ'#ØÈ'uB"≥MCa—xåˆ¯Ù˙˚[]r~J˛„ˇü§ªMNèéIø€ﬂ’Æ@/õx;µ∂?…≥Q°‘©q	OÚC¨!ﬁw&ïÇ¬È…ÕAlÄ‹ ±Ù'zR≤∆Ôs]é·f¶©ÅÑ4AîÇÌÑˇ`z+òÈ¬ã≥¨Bk„’-ã›oÏêK°V_Ÿ3π‘Ê∆s•ƒS ìiÎ˘E@z;›N∑€µ◊'¿çïAíÔQôèÑ,ƒyô-LΩ=>Ÿé
!ÍtÃz√SÖdŒ—∞$◊[Í-Iv∫O4ê⁄®îMä÷w@ß˝pfØ°•*èœ˜IÔiø”€›ÎÙ:ΩÓˆCÿJÎN@ËT÷–ØqÉÅÈÎR»M·»…y¸PÆçTløÅƒ&"ÎÿóÄyã˛sIlﬂXº	öMA£!–Ò≥<‚C6ÅGä:Ò='ˆ—iÄ–pÅ±%—:Ùñíó/O7xË	H :3‚&I„(Ùƒ"¶„&≈∆¨^Eø≈ú∂äÀB?‰ƒ≈–çÆÇË$$ì¡˜MEs4÷£'sﬁµã)Û˚ôÜ‹Ì˜—DuÎ4â{ 4âY”dµJ§hÌéœ™´Èd¢+Œ¥
>Î,äÕm≥IREçp,ñ∂ÖyØu˘ÎßQ'ö•«t9¡L8økÓ_CJ‘…#(ØÎ™…≈y˜A9cùÌ†1¬»OLî·÷Ä¥Éπu»@k˝—^:IàÆ∂)ù√…Ñ÷€@Ïª]]KÃwçQ‡eæ&⁄~Ò‚∆¯eêî4ÌÓ’?Y@ÂÎ6∏(^Ú®G8„óTø\ôS Àæ∏VêÈs»ÿÄÊ-¥v™Å÷Â'ÅÀK-fèôS¯ªƒ”µ¶πZ-`Û÷˜¢≈<“Õ-áMœkÄ˚Ò s…n(¿a%/ÅUä…⁄œŒ˛ı√€uÿdo€ßﬂµ≈únüú2=»”D~Ë¸ÚUsìV2[î_6ﬂŒ˙¯òf3ÈKõÁÕ¨¶“Æ$^Z%¶¿œ÷≤Ì»Úåõa.ÿà9AlcÌ°≥Ñìî≤lâY˘Üè»Åág˙rÃYπÜÔÿπÜ[œ =W,ãèãöhªƒR>∑õp∑∞à\h≤≈Oäkû⁄3ÙXÁPîuWuË5NÁàa  "ÀÊÅ√5ïG√â?FÍ´%ì<E…∆¬cé0(ŸUÑ»BmÇÃíπúÿX*•’MJUt…M{È˚VøËπﬂ/´>	Ø´Özúˆ<l˜v·¿ä]•∏§T∂TjJÍxËv˙l˛∑ÁÂ´◊DE˙¶óób—1π¿©ƒ5ôßãLyïH˚VB3AØ≥}™òä“µ•Æ‡ﬂ#Aúã˛q)â2ÊVHn€rfç’ÄiN|ù¨≠Ò”-].˙‰n,≤à'ò 0öìo∞EJ'$6∞hÈ€ÌˇQﬂU#Û∏®…ï$ÔŒN¯^≈†`yéÂ§]ß‹”M˚¨·óÂ¸Y9DB√åä0[æ¥áú¯‚3p˝öÈﬁdÇzI’πTh§Í;ë÷⁄€≠>n,
@ÏÑs˘
B@R¨TYÆGâe?ˇ¬ΩÎjjuCØÁ{5•a¨Ω?°ëˆ˛≈íJıçxÓ∞ärË„–⁄H≥émÔË÷ ´πZ"}}´…Îπæ'}Ó*√ÎøËy«É≠∏ Vm‹Ìvıç}∏A≥∆{Ü∆#®ÜeAwÙçqﬁÇ–Ÿ‚Î“9˜XºW}é◊=h˝Îˆè€ªG;∆ÿ∏“;ΩÓÀß{ΩfÔ¸∏ÛÙ®˚“d"›4‘6∏Ú}7v≠v”åÚÿ¶vÿVVáŒ±≤ó9>”NﬂRÒAP±.¬o!áWº.R
=„ûÈ(ÑAè<yBﬁ£c ⁄ˆŒ◊æ¸]Å®ê…a	0•‰çºe·'J÷∂˛Å!ï%zXN/πÌÙN&YÎwWÄ—É‰Í}pØÇh4e„ÖÀjÈz«Ù6:ˆNaã¶‰Ä¨	’(Ê˛Gmea¥¨$ ∂¿ Xó˘ØåÜkÎ$˝éw≥∂N˛Lzﬁ_Òw
·-bTû¸·êﬁû]+F.©ïìôB´&≥ÿ Ωd∑ÂtÙâ;≈8I)˝ÇÏí}¯‘&Ω»Ê&åQË ¨— ≥Õ:∏Ø•ıBˆ9[Gnã_Q‘á?;Ï¶^àTUûtTy´≤Zã÷Èn¿¬™Õ+_î∫´mñáˆwºº?Ø∏º9ˆÉ√
Õ,≤6Z™˚¬e˝◊F	QyW¿∫~≈PwÀPzly†ÂŒ®ì$I4ûHòƒ Èm´zAwGDRØ˝‚¡]´NxΩÃÅÆ˝{j}p –™¡"a-ÜØú`˚)`∆QÕbTò\∫æHè›Ètí)m¯◊¸K`pZ_”x
∑√®Œ®“W:ß#˛„~9È¯¯.˜≤Hr*T¸ñRê5«ÇhΩ8˚ÈË’Uã¸ù¥Æóo˘'GÉüè¯_ÁÉø^úùúøœÆﬁ]îíä'Ÿà%sa—(t45HÁ2·¢5bíüÔ?¸Ç ,B+/@„áGt4Mk–Ts±Äöÿ√≤qOBáÛ∂ÂFÏßr(«≈Cã§Ww®ü<ëΩùeyì2	®Ÿ)À»—	—t≠nÀ¯ â‚LP‚„π *9dtå^∫˚‰ªª§n“G…[e|©7HSS7„á‘õ»RSÛyÂ∏±OÇN·cµÌ}egäåP˛wâ≈4ö∞$∂πêcòÉÄ@iº¨Ç+·@ô-ˆ_±˚Èﬁ_úpø±6|Sﬂdª9I®]i˘N;ﬁÿô¯“ù.Ìs¨ﬁÁÚ.+ˆ’eÙ3ª`ø.Ä√.ÏØ+•n9#] ‘„3v˙…¬
cKQl˝üîH|wÁvÓ[\uáñ6(í÷Û…1∆ÌÑåFB8g<&sÍ-(⁄~@™≥0"70Ü˘UD"Í¸ªúµÃ.TîB/$Ï>˛˝Ô‰OÔŒﬁ˝Èá˙K	S∆_¡ù‡L¸_·iüû∂/T0¸È´içë˛•÷ª»RW¿Êl∏?√πÓv˜˘ˇ∑÷ÎÛ‚º‡eıu€´C˜.TâˇWçw‰çh¥DÜ€ ˝≠≤Ûˇ∑^ÇBP@Áy6vH‹Çw~>6˛7Ææ[‹l8¶b{-»â≈¸„PgºX-À"a¢9°∏ìTD&‰ÙH–ˆå=}Q¯{?eUïtH’E•åiíMSQdÜ/•H±B/S‰y˜îiD⁄s#VŸ@’ÅBÃÏè“Ó#‚x$û:˘€(ÃqºÙ¢Àb^!¨àù·Æú9[[ØÃ%9©ÙÀ%Ωf«1:√aâ+Ë  ÛC≠sßÿ¢Ú{È√Õ‘qY„ìyvêì∏´}<´è\«Àº˝üˇ\MJ¬ì≤‡œ
‰Mñá≈ªu¯ùbxNÀ`‡`eoòPˇ!êIÙ/≤xàq«¸3W2	î·MÉG£|8ÚøÎ-´G§ûZF≤ÒUz˝ó££∑'≠Ql!‹™(—˝•˚&Å@µøØè.é•lîó«Kè”€n2–ÈŸª´7ÜqMG2P·¢TTÔj¸ÿL}^Ï* ¨◊%¡∞-âY"SÅÀbeÊ˜«
K“Ê∆Ö1„-ßë,‰a˚ùR©Ì’¯1§˘m^≤D…FΩò.Ú|"§€Dî3ﬁ ©LOx¶EVˆâéo@àùπ¥√àçhHD!P}ØsfÁDL
˛˝‹ﬂ£¢ø÷r˛∫gY^≥Lıo™àS[6˙'◊=∑Kn:57nôm^aúz5eüCﬂ;¡2:¶∏9MLè¬ØJÁ|™IÏÏxÄ°z€π˚Ø6Ô]Ec/Ω⁄|gµ≠ô…„€⁄V^<w˘}’ô"¥π˜¯≈-ƒ=tl·Ω,QQ5∆Ó∏esÍø‘¸›∏´X4ﬂ`æñ>¨ïeü'|ëœüª-`6Äl]Ω?¬˛rt»?Ωyèˇ¸xqåˇ\Æ¯?ÔﬂµDâ¢7Çñ”[Châ1∏$	/ÅûÙ>A’_tƒ\&%L¡£VôΩÁèiﬁom©,¡hË®mçÄd˙–óª‹&BàPJ-hÍà+dl±%giyi?T$L§bA7>t‹˛ÓŒπˇX
X•Q¿F∞Àø.h»˛VeR˘I
‰FW>Z‹4Ω‰LE√Ç£A]sSD£ÚÅµê(è¶TôÜ+ÎêåòøhÑ"@Pﬁ[v"âÀ+±ü5·¡:©;EXÑ8«Bı9“LÃŸûÕ}º¸:ñî ¡¡u"oêƒ‹›^ﬂhüÙ:›æ)Kj√îƒ ^2Œ ßûËq2Æõ;ÍOäÙ"äx˚\{—AqK®∏ãñÃ]∂ˇ∆nkÖ∆N»f∞√-”äÖJ–≥P†Ã&ô/œﬂ|ëòYLù˘õ¢Ô∆C6Ã≠«2ÎPïHlŒÂÙ:;úœÅÀ§"Ô†ÁcvÌJmÇYx–#Ór‰áÌ¿wƒı^.ôf,iïPq#tÖ∂¨Pß»™=ÕYµ~û$˚SÇÿ'•ÃÄUVÎõH´≈U°ËG“◊|28-/Sì‰,ÿ^I‚[∏ûìÙ)Dñp%§&ËµRπcÂV6·uB<3ÛR˝œMHÉ$#˝<ÊôÖÕÅ9’âÄº≥µÓŸZÃrV„/F:üï±QÆ=˛bŒ»]´€Ÿ!"`6˘Fpã”ÇRÉãﬂ›±§>¨a≥ƒ√‚épT0æaLª≠
bÃü;	ôﬂBãÑà+2∂L≤£n úí,¡Ñ¢˙RJ|çÈq≥Xñ6¸q+	‹Ê€«ö…H÷˘wÍ–!uÁ"ÑO¡±]çˆ¢û3Gh à=L±"C›™úø”»b™[ı˛+GÕı€DùºLˆnÈR´h%P«Pà˘˚∫·¥ihf	J!¥Yd≠:ñ∂qò¶6¸MVxô∏ÅDì†9+°⁄>≈ˇ∆Tjn¢N˛t∑∂4æ4Ám‚∏◊ıƒ«\©CR˘]≈ÚZg)`[Øîõ£Ãna\∑m	}8aûÆ∑´Õ∞a Tµ∫Œ'ã∑∑å{æ+ãË ôwÄ%è◊÷ËÚç¢ôÑ.L‚§MÜïØ‘ÍkEÄñ‡%∫d∫äÇ“0ÈçíƒZ7˜[RÍ⁄ Úöïß€é¶Q∆ =ê2Tõká‘H†0C…‰'ΩÙ0ÍÜ™∫∆(ù 7≤ΩΩYu≤¨DÆïÕŸoàLòH◊áÎ–Ò⁄p5
M7;wÂµÆ«· S
$k∆tõ"U†∆ŸCÖ”•œ]ÇA∂°.™∏ai†ã˙IÉf¢)–7ã7Tú`˛,ó~(≥^fŸèã∆Œ4+(Ã¡i%j=zz!µ†v◊P5lº6XOeF¢ßÁp§˘˚5e&Øú1ùâ¬@Çkúß\„R˘—óî]ÏDçF∆On‚lñÊ‚!å{jkË	C ìMÚzö ùV@ 6ˇEñuf©§†ƒ•CÊbÑwÄÅi•q=@˛‰±9⁄‹àyÃCÍaf»r_◊@ªæéˇÊx‰	yµ¿îç“® ª~NÖ+??˛Âé2g]À≈—[L\òSíá£–U…Ú·%¶,öE,∫±‹Äµ">5Ø0"µúô/–Á¢êz‘(ÀéÔÆp›ã	ÛÕ”+lV(´Ú¿IŒå_Jæ∫π{]Iî]´L´“F∞∞¢e˘v,Ω◊(Ú~8øa*ˇo∏∫⁄[LíÚâUy{~,AåØ∞vÑân0+î(˙8ró«yûm∆/∞∆“ÂŸ˘7\_MÌL´MwyØ´t©µu◊T©%ä¨Xçj…‚MR/íì@˜8õbr≈´"Êuû¨ß€\F#§÷w6®^i]èü‡O€ ∫“Ï‰\)\tâ&œüäü÷‘√‚“yØê¯¬ ﬁÖÇØ’°K¸ÉÊÌwv˛R⁄–ô¨z<qDÖß!œºË¬¡VBBï|±·M•¿}"…‡|iÔBØX¢∞hF(&z,‘‘êp	jG€ä_ËbÖ>§◊›Qn’°„π>ìÅÇSÏÃ“∏?f”;6\‡÷Yd•‘p|zµ_%Ω∂¥ˆÓV_G≥W´#òfÙŒ˝W+˚©I’ΩZ:']än	…ﬁFíΩ]B”Íïﬂ^eœìv'•:=CÔÃUñÒD··Ù3PJCˆÁ“≤8≥ü‰πÙáòÛvÒ≥IªK›¯†•k¢5UËìõCñE%Ìo| t<|]+8*J⁄§˛.'}^ ‡óLy_˝tuuÌ,
ã59[¸ƒ˜ºœø 'eÕ©zÑŒRÚh®1jc∑}‹⁄û"”⁄ÂÃS≈\¯M%ßâSeﬁ^gg≥◊}Ñ:|Ú‹π’b|rÁÚA,}]1(P?Í¢+OŒ∫O∫&ﬂAí∫v^jÌÌ¸±e~Qó“WOËâ6óOó.Ÿqá∏ì}ô[crñx	≤‰vIÕ°o9˙¥ƒë‡ìﬁ2∏UÓﬂF˙ÑÙÕ≤Ã0ÈÔc)á˛lÈj{	Zj#™Øæ¸u∑uªˇXõj∏%¢éH⁄Y¨[^€‘Íû»<I“õ†V©•‰ÀõU)¥-ﬂ“(¶N @ÁYÚ;¨4:V˙K3˘çU}Î:LXr¢ÿüKÀÎ=V˘PÍ—Oº|Z5…'≤A>3oÏá" ;d3h„a^A4Ã9—◊+⁄.ÀéK}ÂÑ#óÈã.=p•O‡ÈÛè}Y·Oo/µF -íåÛÁWÇE¯®7Y‡˝Do©¬m"I(väYç1Ô8 eÏáä∆Æ?¢"—HÎ':£a¨Í5Õ#πO∂‰D‚8¨õ∆ÈÑ¥©)Pªn¿Y`í∏T?—)f©!'ÒXøü9BCÂ¡¬¬/!™·ôØº◊ˇöKÌ˙CÍí§÷¿(ÇÕ˝“/√6lπy…ßl¨,QXXØaπgyÉeT,◊õÿ{GHwbùæŒ$(qïùËF£ó(«ﬁÓìˆéJíóŸµUÒÂä-•6ne∑j∏•˜™VjÂ§æÈ}Î™y’J5FÛ	˙Â€”Mi8à◊∫JØ$=è©çñ™≈I’Y|!∂PΩﬁ+ÔjV_Îñ,¨î'S{-^MU3gÈ_~iÆ{Ò≤¯§}UÌõ`ﬁ:±Bıñ©≈ùïÃ∫æsb#´W’QKafö†q)R¿rﬂ@K9Q}D”Úº†ä
yJÈÙÑπ29&ïb‹+ñÈ-,vµ¬Á≥Sú¢∂Ù•j&≠JúcZ
∫Ùªﬂ¿|jæ«"«†Q|Ä⁄´A·eË∞ké,	àÙûæ'o}ó¬Æ£Épa[µéÖ˛ÒbpôπS≠áñ» âhÚVπ†k≈Ÿ©XﬂµB)2Ø>áïƒ;˝n-ÍDh·¥î»/]o©|m*…Ù∫ÂÌMäŸöı ˆ*èÛ)¢Ba˙á÷uËc ÎöêTy¯«`˜Ô≥ÔåXÙO’G≠èØ®˙8ª@ûê+:q¶èí˙N•ua.I0Oå,¥\È†X}ãU¯àƒ®®ÔQ˜7—|pæt)’G™Ùêüﬂ’îÊ•f·°‰µEáUN∆¢py¡?cS¡˙,YœQÅWŒ‡Nú¢∂°•,ß“qHÂx!w⁄ÊéCfùz·v±Ø}õ∫ïNõÚ.yÔ‘+.Ì’Ò{_Ÿ˘2Îj‚‹\G¯Slﬂí‰-;ØànPâ±òÄπu¸Óg _∑›ÌˆîXÇ’l¶ÑÎí«íú]Ò®älœ-‡ãNôCp6 >3•ÓÖ¢ï"“¿}3ö®#s8Ù˙;vpÿi q⁄[fH4—NÊêÿ{jàΩGDx‚}^—k–˚‹q∆VÆÉ{ıD†òà®‚Ã∑™Ø‡£96qP*©ì†"Ah”£f*»bÖlçéÏŸèéÀÆ`=+î5_—œÓk˚êM,IÔVPvBØŒum´∏‚¸u0∏	*}–˘Ôˆj8›Ö-ûC¨ÃÃ'fJNµ≤;†‚G´√•IQÔÇ 4nàé˘Õ »ã@ÄQêÒ,\º*nHdvy—N·1Ù¸π†íñÊ$w Ñ¢Êü3#Üw,tˇ)Sõ~’3ô)Öä.˘áB¸≥±≥URŸ›Ây¥∞B≥JmYw¢Ø©gS8…Ωr∏tçKî$˛Ì|èÇ–øvJÂàˇ!jZàb€ÄOÛ/</aÊú-°Ï’ó≥Pài{Wa®˝∞Õ„€·}©Vô(ÃÒ"Ü)¬`§IH«x_∑cø=>+ÙÁôÆiéç/¢/ä¿Èå§ %yÜ\¥¶qD˚õõ–ÈÑEùÙsövF˛|3ò˙0Do{owªª€€ﬁ}
¢«h∑ˇ=}⁄ß„æ∏9Ë¡Ò}ÚÎ¡ûîÄYj∂¬âoÅ* ˙PDj»V©Ë–á:G∑~ó]«¯ÔﬂÄÍ(B„ÏR…¡¶Óa&ø=EÅ°~+dë´¢FB∑”?DBPùP«Œ®%m*Â(ë5∫îf9.tÇP4ÔåFõp;ΩÄ¿V´.)˘J≥ˇe’ŒÚ$m£®™†â
T¿Î™ım	kñ›.EÎ∑]Böª“Œ†1K)∂8]u∏kü∂îˆq©ˆ] PälnªÜêù¢¶-·ŸÊq[V9√`Fºú:Ã√
 ≤≤£ﬁµàbôUUSÛ)ë8π3lÅ©K¸π—–ëVÏœæ>w∑ÜUxÅæ\ JRﬁ4Õ˚∂,Â√óHƒ`∏◊jûí◊Hõêux-K…Ÿoûí3•ûΩnsÎ≈äπ9≠rdjd?É°"Uw/4>ò-<,@°°ãº1U≤óÍ¥ò¶ìYä;›z#bNt'Ú‚{Ï◊K–qƒ˙ª-hK…	Û&3êó4\Ïíâ’h£Æπ6ù]6_a@∑ù∞?˜CÚó)ç£A∞ƒîlÈ9c&¸¬p'§ì7e≈K]¢
á1%úp`-åSXÅÊ¯EÓÁ∞≠taÑ>7b+usØœgÉDhΩ°NL∆√K~vF¨#†xËèsòà9/veñ»"E^qiÚ‚öÂGLƒ‘Œ≤úÖËkˆﬁëNßSòÀ~NP« Në†2u-È’8Ù	s/·÷)sŒï]k›¯·…ˆø√¡¸wÑbkÉ¸tyˆÆqΩêÂl „‘eaºñ∞àd»¬)ç‡è±óÙŒ∞Ûáj5‚Í¨
çGSûQœà3b¥◊tÙyŒÊÈ DH–„Xö_’øiEÎ\ôQæ‚äQTÌWµ'ËÚTP†»£≥Tåac„Æä[“h[–Ñp4v‚RVa¬ø;Øº'óÚå≤‡ö∞hT!æƒ†.÷eπ”†Dö“œ.Åãds-Õ¡¥Il_kÔ≠E⁄∑°ﬁLÈ%g¸¢-Ü‚ºb…=M*a]÷:ã≈_ w>òELOk≈∫%å=äXó1Ωæ÷ºæ‚ÀºC„iÈ%ÿj?ﬁèÊË‚»≈p·Ml&IÒ¥Sö)„ù<ÓLKF‘Jtï’vÊÑ®«k;_ÅêwM^¶ﬂÏßﬂºÅˇ*ÉhJ¥J{*^êè˘Æíäû'—uo/j`%ÓÎJ˚ÃGÌ˚“1∆∞Ÿ∫æ£^≤pBó∏◊≈Ã‡YZ{R3
rÉ◊…Î∂y˛ÕöÜ‹`æ⁄ÂÛ&7…òúÊJv}√y"‰ñ—–≤ﬂ˚eHÈ≤);Û‹ìÂ€›æ™ôΩ_ØÅ$aCíR¨&”óeFMΩÂ≥æ¬!Œ]jÚ6á˙ãIÒc8ˆÓes|>∫∫∆.ØqS-ä>èÒ±«SFb‹ÖÆú∑6Óh	PWfv5µ),ö;6Tñ;æ\»Òª≥üó«‰ı…ŸÀ¡…’—´7Kﬁ€˘Té_íMòÀÑº[`úP‘tÿ^Ôi∑ﬂﬂ⁄Óˆz˙d≈K∏∞Êòº˘ØV+æ\åÿpèºbXÌ[9ã"ràäWgÉà©ç£6¿ö≈∫:g ùüN;mˇÀÑ;Ì≈l4Ì(=Ê¥\ù˛ˇŒú™âÑ◊À
|Û\ÒµQÅøB-Ÿ=P∞z≥c*TıD«b,SL+è≈®î°K*hU
kIÚˆw™># ¢[*ì€v∑Å2§êê_m\;á∆tÇ?˜‰Q‡á*g™$πmøl—‘≈#‘Ò \a“…¢∫?nÉÔ”.˙6´ºS¸BGê[ußœBäœäW.W‘,¶#…1œü&’2˛LZõˇÒ¸˜U/‹D}J@.€ÌùNüº∆ª∏GÆ^Æ~›r'‘¶ÒÿUõßqÆi≠'Jﬁ}•UCVªÕ¸*≥NºXro≈É“Q'ÂM˙ñÊKICÎyqé÷πü/û«…®X»ß(≠Iÿ0õbmÄJÍBÆ∑πe(rπJíB√M*ˇMÊ…(Ë˜
0ûø †JÈº^∑"e_+RE7õ∂Ùg|˝“yÈ∏Æ£®™¯P±QÓÜ»f4¶Æ?˘˝Ω3≠@ƒ‡≈h3íﬂ#y.ÌrõÕ•!±Û±{·÷¬ïsK‚ ˘õV≈8á3Q¶……Y•2IÖ$BÚ∫æwÌL<«D@CËèÊDX!lÀh$äê¨ìaJª&¢ü“DIÄj£©,Î⁄Êøë∑lË|›Éø@«P∆€î¯C?Xtê&…»¬∫*\ÄR,ZJüUé‚AÙ¬|4
õ™∫JR…ŸN„b'ÅÁä˙/3√m™©ÚYA{[öπ_Ó:mﬁÉ‰˜FbøÏ µâ´˙ôÖŒµ3√s˜˙âN…⁄‡X]u]E=ª]JÖÙÅi9CƒÄàπ◊#•1YöAÊ4ZÃ»†ïKSGoçÜTDë}W)¶˙ÇF…”3˝Ä–Ù∏û πZwÃπ6i6áhÆœÏÛà!fˇHß·ƒzt‚Û„˙¸Úwu	 O©wKQxÖ;kÏ≤XDdß;≈i\1˚Ä'j˙ÁÅXf}ÀD=5‘b"Øs Ò:ƒtπø1õ@êØûb≠+ÏÒ+0jea	.MØ{S›÷Ì
g™Mß˜ﬁ/¶<âÚxÒÃ∆.∞V'ô±\:¸f
·Î1Ω∆.·“ú¡Ö√ÂD√»	õ_¶˛–ÚsŸÃy^'ÏWk	UíÙ
ét(<®Gõ>@◊»πøF qIºeÛD¢)È©$L-+»{Ú›j~ïÎ/∆Ô^≠ U©£RΩ⁄íÈd∂5ñû£YJ.Ÿ|AuáH•ÑSkVl Ö;Ò' {ìóMÎNÂ„_)_œ+¬ãæxÕº|ùdJŒ¬≠8i$sv“ËÂJls%)oÕ¢)¨ €ı…˘ÂÉîﬂQï˘◊!ûÄ0ì&•Úπ|√V”bç˝ëï~Â⁄	UJiq‚Ä‹e~•h⁄M”“<(á#“|~{:§®î}Ô¯Vpéı	†[∫î=JŒæÛEí‰Sÿ˚®X¬B⁄?^Yﬁ>éc:]ã?\Ñ4~ú¥} •’≤À%}vôËK˚èYª@W$ΩAAÇÿâ]&ÏÖ≥,…>π¿≤…SÖ9oMQz¬	Ã√ @	åWD…ıö!¡›¨YGüÂû£°™â√sÁ˜@⁄¢_—»a|ﬁÕ˙N\ELZ“ºên≥Œ»'Â$›´ñH}íp≥ß®J—B8WÄ.Äs ^óN	Ä|‚ ◊ïÒƒSÓµ,ˆ‡•–ó∑ö0Ä“€;fHßôô,Äú°◊√8iˆP >v¡RÄÊ3Ûº—Ç˙îypÔ¡ùB«>Ÿ˙b=æ8·;ïèœõ∑:Ω^ÁKÁãŒ˚äoıêÓOçÄZ[éÿ∞N.¨ìf´<;\[‰A[›AQêı¡
5‰QY°XlµﬁTÊa£"?læ√Ôg…$’‚îB(f6 sß}w«!ÿNÓ≥ø˘Ó›7ìª¢iËx≥vWë„G)Tâ≠Ã˘‘8••0ÅÀªi7ÃMo(å°sˆ3‰>[*ÁY≤)úÜ®]ıÙ	œlEŒ©≈ôMXW…uïT˙RR˙‘d™@k’ı'î⁄QI¢˙mbLØÀﬂ¨s∫I’Ø;APºÜÆ„È’´'Œ¯]mÓyΩW≈Rã[≥%«™Ú2$ﬂ)HÍÏ èëÿJÒ√£fò+H˛Ó-fAµVicâTnv HΩ·Ó≤˙eôï°ß7J≠‚èÚØÄˇñªv<ÍçÄôø`#∏8°Uıõr{ñW¸ÙïÙ6Jåë?rvõ§ˆÅAJüi%¢)ò}Û…À.˘2i4˙4¨¶µ.ÙÆı0¢£¶ÇDTJ˛™µàcî	Ω{2ªSW˚™˙éÀËgv¡~]¿U]ó>V€¬÷L„œÿ4-~™∂ô3ﬂ∆T)Æ∂≥ 
¸)ï πjﬂUﬂ2K”¡l~¸p¶√8k\¯P˜å« ÿ‹≠Åî¢»√ÇôA‡W^ôH¶^æıÍËÚ≤%OW Ù„ ßQ| ¢àNw.˛ñ&'ÄˆóSˇÜø#t√ıV˜ÑπpﬁÍS9~˜„Ÿ◊úGÂõJbÑÂ˝‚ËbÏƒVw6Ñ-ì›4˝T˙ÁÔEs+P÷*√„è¢©dÅç/"´s`:°èxMNr_uÒÅ®Â ≠ÃwˇîzcóΩ≤ûyÓm¡Å7>ÑE‹i.˜‰D«s§B@ ífhÜ±[˙}˘]8AáEàó?◊⁄˛X€M…óµ∑Œ≥›*|hÑäàVˆh'≥èX!UST˝›#·3"œåFCﬂ≥Aü∑ºÂ?©ò%`©Á∑8¨óù¥TxAvá±¯Ò€çHûoîW¢©I'iy‹oM ¥%ód@Hª·:¯_˜ﬂêê¢πp∞Ÿ8Y·è~à®ê®…æØQ√KÂÎäümQ‡Û0ü·˘"Ma]gh"ê‡ê]ç≠∏l∑ÒÀsäˆkﬁ˚4o.#©%Qa†Ï≤™˜ª:PFîÊ˝⁄ÄSÑ…Ëçz~+/›q|OÒ5úÇT¿/~\ÖhXï|π˛\Ò‚*∑ªØé=èSO0”∞ﬁ¬ubX3ôb!OÕby ŒÛÊKieçZWg‚•J˛°“™±¬Ï∑êÛ3”¿ú»Êe_+∑≥|pwó&Áﬂ'›*VQœôÛuı™çdN:;›ƒSZ‹0$∂˚€E;mÂ2ò2ä¶‚RÇÀ¨òˆ∞nB6«W`9¥ŸmíD"ã‹}
‰∆!|ÕìEÃ«‰oÌ-ÙwπfmhlÁ-Vã·íô≥‘©ô+éõ)“¨µ¶˛ú…+¯î ”óX»ãıÀ∆rqÂ'~ΩO%§Vú§J 	ªéÓcË[ªúßî™©œ¥¢`høf;ÜπÑ4èk©;–/ë∏?	k· éÃ ©d≥Ÿúˆ-}ÌÍ-ôsΩ!Y:]F*cB1.HfL—ˇÓÇQ∑ç¶erBÓu/ùº≠'ûÙÀåNB¿ø^%3'OûHºLlãªó´3eu§:ïe∑íºX”ˇ  ˇˇÏ}În‹∆∂Ê´î{í@J‹-©%+≤ ≈#[v¨X≤t$yg6å`áRS›¥∫…ﬁ$€∂¢80¿¸8?pÄÛÛ
Û(Á	Êf≠*^™»™UEvKq.ƒﬁ±§&Ÿu]µÆﬂg ö≠g–√G¸ø V†d2—◊ùŒ∆âo(íiî7 M5Õ8D¥é£DvÎ˝M	⁄¨HXÃ\¸VrÎ§¿õÃ\J≠ä'∫E·2Yó^<»´4dv©ª 
hÇ;TYë*⁄Pñï‘ıﬂ£v¡wØ\»ƒCÑ<?ßYóC.ÊK6¢qæDF;.´‘ÕM#kÓ‘**–Q[Frs»|2√»L“`+5æUŒJ”	ƒ6lÀÂé!âˆàëÄma¶§æÑQµ·ÊJå
HJ÷˛Qﬂ∆ê'!5‰ÌuÜv„{Ã,{Êeq"∫Î%‰Ú»≈ú*eÀ•qíÜuAŒ	}D≤){ì €“Hî«wÜ¯*Çñ°óä
Öñ¬ƒM5°Îq3ÛdZü\ø]yóÁÊ&Â£ˆà⁄$4 í;´Î∑vÑDb+¿+ûÙ“ËE—,=Z˛Ùê‚Ärx]8T^GuÒ~dœ˚ÊTT¬ÔM»º¿ªﬁ3Gﬁ«`˚°OêàI∫π?lë+ÊÛà„Í,}ÔGW~xÈZC}‹UΩªÓ\cfÕó‰Z°;√¢≠T èáU›e≥beô–äm∞\!¢ëq,aÅß£›Ï•/Õ"p‰£égªã—S>ªB[H“õ1˜~â°”x»îªë®ÒÁú`q‚Mìﬁ0äÜcüm‚ÔO˛π˚ÖEp
æÖÕﬁ⁄∑è÷:ü“∑ÉmÖ∑Ø≠nˆ∂˙ﬂˆ;üæ˙ewÌ€Ø¢Y:ù•ªXô7 XÖΩ1LÏòm‡•º§)Õy<Ø*5„˘ü+EºŸüç0;+b ™è®é>Aú]fHœp^√÷‘¡@àÀJπ™1œ¨ıò¡?†	8¬ˇ®8µ™€Ò-/êQå»9⁄†kE˛°)ºhûgb`<¨*“è¨r∑ˆµÎh+õø6üåÏãÇy[#êàíhÔÉdÊçÉ_∏"∆ñí`2sV)b±ÀÂÃ—j.≥ü2⁄œ»«iΩ†˙x…»Ë«˙m£˝è˛jÚ¨A‚·z·˝üà†L¢ıÓ¶`√›TçµNp0.7–∏Ï+∫L›∂,NS≈Ú™Î="fSÃ3W˝Ç˚Ô2¸ ıKa≥McÚtù<är£çG∞x?˜∆ùCÑ29~5/Ò:	¢ÙÊdÔ¸‡ı˜€6-˚∂ d)9SŒÉICŒîQ4√⁄≈~w¯ûañ£ÛÌâÖ«€?ñ UótZó∫„‰ì-’UyÎ,÷s…∑¸*+¥Øµ*À∏J2^awvU:9'Õe^ÊZ¿ 1~iƒ&ÀQlxÒ1ÖÔ¬X¶œ]Á∆a.4∏¯´Êô‘X◊Í,Ó”·˚î≈∆ñôÂµéÕÊêÇ4Zòìy§	"ŸŸﬂ*∞]à0…‚OÏ:w…êúœ6kèù˘p*ÕF9|°·E◊∞xΩtbÏMdÑ7éÑ	Â}â⁄í≈ãMªúï∞ç˝Qn1∆6KØ¿“8T≤¬ZIì˚£»YÓEÓnìıÇ`P UÌE’lÏÀ–?˝≠"≤Ÿü	Éa÷jokuµ–(¥Ω4ÓÎºÑ(˜?lï$ìÖg—0Ì$Àdì)3¥’zöNññ(OØaã^p$`ÍI2ü∫î€»_JÿêKÆT˘ï œÚC÷·f|â—F6Ø8çWﬁeVz7jÒÅJNDï‰nV‹©˚…ËŸu…Ω*Ê—•È ·Æ˘Ñ€Œq4å9/íæùÅ@¥c¸]ÛD_mà¡ç’áFöC%§EÏ/*˘æÅ*Ò£¥πæ†	OÊÕÑmKõ≤âE:»O_∂Wö9Ú$Œ·µ™y‰ aJHì/)9ç{˝,é∑2Mç0≤˝Lz‘*„J—iöõC“a»cfrå— Ì√ÑÑ6Æ	p(AçÏß¢ø¬Z@_—‹!{bác°ü˝s∂
9‡≠⁄¥áö‰Ô‰Ôl	˚¡ÿ˘lË%®€¢p!
s:j=ÕŸt:Ÿ°‘KÆ> ÚN∆ñR‘%,7¡+{ô⁄z0‡…ƒVÖı˝’W/L8ôñHUÿ«\⁄ëQéõ£Â@«ë_Ì\N[4«<´ÏQÒÁ˚‹§c7oO—†Ôœ‚•≠7Ë>∑#O0%—†eÕ˙kÉ.nÉ.©;Ù ,î÷éç§>oQÂ˘Sˇ}‡Ëê§—üÌ>o·ÇDEø(≥e◊&	ãÆªDô†óQT>”Yı€-J˙,kj	Ó„oáõ¨˝åÃL•çœ?N˝0·m¨÷˜⁄⁄˚ó‰ áœ{±Â«ò	0Ô™«óïÄ«oŒ;‘›Ç‰TFI9éE˝ı‘ª¡_y”€èæL™r∂çﬁJﬁ∞ê'öüF)NÓ{?ú¡8VW)Ã’`vi‰ú_Jf»ôõ≠O¯Ö}√W)©Ib¨∂dPª≥ä+SK_ñœÅ≤âdw≤w∞ﬂ1e§‰›ß˚…LæõlÅ¯!∫ÉaQ¯¡{Ôbå˚ }ÚZ2Æä¢KﬁöÅ¥NﬁúÔΩ˛ﬁÿüjèR=oÇ†Gÿˆ›@À†”√˛¿:ÏçûyÔ2ùycIöU‰õ”Íˆ?N•/áﬂÚqZ‡ÚŒñ»âwì≠óï@¨Éób`…¿}ÿ›÷Ü]ö<ã‡ß›ÍËSÌ%5 †^r'ƒÄÉö·€9’-øàzgUÖ«ÒÎ‡’ó~∑ÀVΩ—î˛…◊ù˙ˆt_–ﬁø«ﬂ÷ﬁ«g»8†Û·˜A`{1ÜÏ%ˇ,A∫Fæµ∞ µ∞|:É1O ?·|C§mAïZ™™TlhK®˚“ø∏UV¶HËóäµjNÊ"-¶‡WX%Ùƒs÷>^ñDÂjÀ≥Ωt°√ˇä∑ÁÊÍ:b˚˛¸êí:øU≠Û6°‡‡ÕOMªÂÑÆ€øû5œ?Êﬂ∞òj†2	y]‹ÌêªÜ◊©ÌMÉt6∆8»ës:¢f2%ÜG ”u·ú>M∑TºXÎì0ë¨m'⁄_í¡‘ˆÕ$“Y˚¨_&K	-IE5Â¢. ™[ûo$e7[∂-^ˆaπ=Ú“QœªHñ*áaô√îÂ/9¯
Ú'Î≠dë^Nåﬁ6vn"“íïß÷ÉÓ-8∫Nº‰5ëÁlÀ_j9™í›e˙Àká…+8|ILÇp	‰⁄C∂d\!lÖ-)ZÿØø≤µÂeˆ5Éó…N~aqY;CªÂ¿ò;¥£I~Ó–ií∫'5~Ár¨‘ ÈËß›œ≈˜πV√8TªJ_∆Œq°∞ì`ñz*u•ï∂»–ï‚†hÍÈÕØ”©ΩòJ\∑u3æ*23yhïvN˝uwMçı•‰k,æ…uŸ{Óã(4ú%Ês^DÏ∂Í†˙≠◊Fã”r°B,;∂ÍÀ.∑BºÏ
õga≤ÎÂg/∫
ôî{T~ÎEÁ¥2Ê4≠¯∑‹kâg~=`òŸπOΩk2Â Øﬂpa®æ∑ﬂz]∏™mñèù› S$G…÷U™.∞G.8 D°éùï7àõ3ØÉ±∞W»ıÁ]≥,b≥m∑uF±„"¿Èó’Ù6ì?WLû¯PÎˇ¥ºç1Ñb≥QÉmÁM&\⁄úA-XÊ?.ç˚u≤Ó ]¡≠ÿ÷πzL
h+îlÇM⁄8Øç;ÓÇÛâ2n$√"6‚[Û0¸û@/,b™É‰I//«3hâÕ“"õ_dJÖ5°¬íNqÃ˘'MÄkx-*ùµb@ØY*K¥I{–6yÛL]Îâ#¶çàgr˛@Ë∫ë:0ø¨Œ%N%oÇf:CüdÒ©ß¯î=÷‘:z–˛ë~OI‰ÆU6±UËÖ¢J∞ZÜ¨î‚&°[~ÒŸﬁ{ :µ‡löˆªeÅA(_Ô‚®@$ÇT<Dcl…óg"∫¿›[˚Ωû≤zYxx-≥m∑A"0¨E%&àH':õT¿ﬁÂ»ã˜“•UuŸ—JràCj@π √ÅÀ»-çú≤≈≠=ƒ”Õ≤ãÑXqÀƒ´ˆ0˛äÉ∂Ïí¨(ﬁ 3"ë˘[ÚU8©± ªFññY_L@{PŒÓ8ˆÑ∆◊ls5ˇ»
Cá|-ªnt§ÄÇåòóÑ»(özÈ§î=‹Âûsjo…∂∏®÷⁄„Eéæ|Ù®ë	^¡ëuu4ê«†g?jÁ°-÷÷ô‹RU˚≥Ò8'Ÿ€ı	≤Œ¥º‘äSß([jD/B¸w'yT }zÂ>ÍF^öx”)F‹˜È÷ﬁ'áx^ù¿2M$ÎÍE!sâÀ>˘ä˜Ø"œÍ°&	z≥®\ñÇ\4˙6	ﬁáó√6 jÇ’"®M#-¥Ù§ï¥6ªØ’⁄≤‘"àKb"8KΩ´+n`òkëÀ´¨nOπÓÄ¥R5œ˘eç‡Í@	Ù[¡`¨œ}~Î⁄=L˝^GNπf·Û>ØÀ≥Nõ_∑MùÌ≠‰ñ6≤—BŒù\›[’√õÁW=í∞V◊/2Ä(3¶¬:GSÌFC+Ñ0	ß¨dŸÿ`YâN÷4ÓÃÔzﬂ≤xÌKRUÖåzD¶#Y˜‘œ&Ãx¥Hêb’&≈°mWúI?úMºè›|Ã“‚≥`Ã±N.f◊õ¯··ù<ˆ*o˛,Lg◊¸—	÷Ü≈U#Ú∏Ø±ªGˆπ-Í•AL4Âﬂ©≠Ω≈P€ï7∞ﬂÏ/ØÏ»,–G–Ω˛ÜæH^ﬁŸÓõ 	8Ú¶óQû™º±eÿIÊQ≠4ﬁ.F*∏ÎñhAÜz@¶Tû„`î3mÏ{£ŸxfX&hu=–ë
¡$„õío§kr·ç‹Éúõ~
Ÿî∑5Ò∆˛7ùe€ƒ:Ωÿ≈ÓÉ'=¨òÄù9-®:Ùõã∆“|@®j-XfT2ü4,üÈGÑ◊<°–WÂ0æå¥êÆ5åcEÌD·æ®EÇÏtwHë ÎïëèyQã_å˜œRÈF¯≠zßgùÖä¢3´‘ïxÂﬂ´|Qó—dÍÖ7
*òçåÎô∏˚D‹¨AáÕ^ÌWÓ¸Ìy±ÙU2ãΩ¥˚6´ç<ˆÔ¸o‘Ù2)><§nT~ˇëY™&èW2Ö˝>˙åƒ‹ÊÇ[O[é©‚GlcF©µ–Œ∑´(ŸÍOu+≤¥ıÓÿü˙^∫Õ§ÎÕC6¿≈ün≥~˝aì÷PæäëY≈™1 	å'©äÈ™$›˘˛¸0Ff≈A/P¯'£µ⁄q[‘H™ πÙ˝·Ò”Ω√Z¯ùødÃM€Mz¥üÛÁœ^Í‚æ†¨U˛¢Ë†J˜V ©pBÿ›êÎƒègâ7Ú*⁄Âêvì¿∞5õ4j≤—≤è∞¥‹ˆø∑v´|‘ÁKŒ˘≠är\]l≠±≈*Í%zùÎä`ƒëÕlˆÚçÆ„€SV∂âíNªÓLã7◊cµz£a!Á´w#”<«bò2oîˆÔzF6ïœ∏¢†‚Íd÷≥÷å:’ù.	∞–∑˘÷£ïÓΩk¨Øï®†L[M£Î2=vê6NŸ≥Ÿ≈XG^8˚ºSJöëπêï$$§∏v∆ﬁÖ?v¶üP£h’“;ßcCÑÊ`ø¥ÏWÿÛ	"˙≠∞ó'öıƒ•ilNg:XÀê∑æ?ÑΩËÁˆΩ”}* ˇí.ºf<–›	*«•?ÇqAÚÖΩpÙŒ<x ˆ˛k¶M"]ÇÓ¡˜ﬁxÊs%'ä¶ÍÏ0}`	·f·iDøÛ°˙ÿíﬂKΩxËß=˛Z≠9Ö/¢ÀYí[Pf€8ö˙«ûég±ÙîO3MÅ®π™è◊«˛?gAÏj≠h“ùnìÚÕË≠‰cï„3WÊwfG&â,˝ˆ“_b…’óﬂlL?.ˇîMÁÒU7VˆÑÙKHN¯ÈÙ;Vs]r¨uJWﬁÄˇõå˛CóÉWcÉ˙Öí≈π√‹r&ßr∏»Èv„ò•Cs‹∑ô˚Â˚ıÙFâ5’˜oœJ\PòÙ4¯‡›x©ê¸¶÷¥ÉüæUVœ#=d¡‡#ôJfã:Ò,2xâ9ú#îxç9ÿRœœ\HtõÃØ”†ƒp$Dq‚êñ-ÿråMi@”∞QØî◊d,ˆ:˛V9<9Õ~¥=WTÊåÅ6¬QLù∫ˆ|uÁ2Ï-;ùô<öÛ$ö[ˆ∞.«À‚õ◊9ËJ◊£ fÉ`8—YiÂ{êF=h:e›4~ê•ÿﬂ]n=+®§y‹íZnÙxzôä¡'ôéHâŸ÷ˆ≠y?,,TU˘4åJÌ^Ωöﬂpc‹£˙
#Lg†`◊äÃzg•;$òQIÕ’‘\xÈ'RúÙ=zeic¿J’>°(≠ˇ˘Øˇ°˝ü˛QYmÕE∞~ç’÷Br;(≠Ñ∆hX·F≠Ohv\˚[[È3¡¬W–ˇÉ[¨Íï£@ûªowRÚL{»f?·v`«Õ U®÷Ìñ;ﬂeáV}%©V]4k:6¶PÑÅ{Í√°ñTSE“E|⁄f≠∫©>úM=Ià<—L∫^ÿÍK<à@&õrOÑb…õ≤ı0'’0[Ï—üÎCméïG˘4H3#9ª’|£™/' âœ@#˘tÛ'≤$¶≥∆cﬁı,|
÷`±3ˇ⁄„5<ö4%}¶‘Qµåbˇj∑Û_,ﬁÎB_W∫‰vN«qÚ¬tä ó˚OÿÀŸ≈,¬¡¨	œAÃÌ¨†ü´πÔπXâv?wW˛Á˙˘d⁄Ù∆--ú¯ö˝¨~’ñ…w–Lﬁ‚"‘Zêö˝íÈÿá`≈j÷bÊ_µ"YáñŒz‰iëö≈ƒÖXﬂ.˜∫b⁄Ã}!ÂË}&o∫·Tπáz&˜@@÷≤x˙”ôóraˇAœz$y÷/º∏öVcÚ©+“∫‘O3I≤Ø˙oÓL_ao≤‚üñÌAœ´âÓ’ûπœu˜RŒ„jè_fËSo8»æ?ı‚Ò±6ã¸›˜6áœ`l¢—vQ◊˛‘c¯K¸êí-˘‹wZ_Gì(^dLãWûPS©e·i9ì´[k˝ıçGõﬂn=˛sM[+ßêe‚é›«”rõxvÊùÕx,¯πè:Fa|9i=mÌŒ«Ÿù†õ§0%‰O¶úâp°V∆MÉ$]˛ôŒ»êM6ÖuæA#ﬂ√`¶A‹l5¨Ö‡∑ÀÎõå¨7oîñî˚∞UY‚]˘Ólô=”ÃŸ—"gXôæ&p&MëRö¸b≠´P2u®+ùdˆ<®ˆÄŒ[∞*	√öœ™û˘Iê3ÑÈù…€r∫≤ˆ˛¢=¡úÀNƒé4‹∏]ﬁ»}üöhí÷Z—â3•⁄ZÛÍzÖ5¿Å1åä2ÀÏW¨≤ú~ÏÆsËrp9ŒäöpêΩ≈Ã∂¿ﬂÏù≤ˆéÿ´Áß?Ïi˙¨À@◊VóHì·öSa)/ù£„2 ∫ﬁˆfÔ%;~z˙¸’ﬁëÆ±Ü†Uu0™È¯BJV≥≤j©õï¿V≠Ö≠P)wß›≠2qv£åµf¢êÜ÷“îÚ¨bRÓj=)w]I^q´Ê)ñ9Ûªﬁ,çL°No¯,à/«~éîµ±⁄∏∂«◊k´¨‘14ËïøÛÿK/ÿAXà&mcÙP[™–”(Ç≥#gg`ˆz¨∆IQaMAﬂÿâ˙Xªß}ï†˜÷ïﬂòäotX}ç@ò57swV¡&ıå€Êî£E£ˆS–¶-Ev65/F
4≠H]0ﬁv@4nˆ
‘ô'%ö
QÎ[‰?`Z^ñˇˆßád˙Õ(ö≈pZˆª∞ëAMßê	@ªú•æ”Õüåi∆Ò§®„˛´Lh,üı2ÉÛÈœº“å‹Í∆	Õ´#ﬁÿÑ >’.·Ç”î^≈«©úq	9TÎeæ`:§0‚à C©±ím‰¶Jî‘©d
⁄…xñ5¢å˝Pµˆ∂.]ê›2M‰F>…Ì~ÙÆ”;Ùë,ëjçÛC	π•ﬂ⁄Û	9ﬁ◊’8ä¨Ã´ı]S€4+l”Òe†zß€úµØ˘æÊ–æÍøÂ©>≠.sõûä‹GÒñÀ'ÉˇÃ®›°ƒ#OxÚ\óx–¥XYD@{ÑYô$.)Uƒ∏ 
~€™√-7∂9)ó ø&ÇõÇaöA0kfñ≥@ÃŸfú/wˆ∆∞‚œ„ TåR4Í]Dƒõ˙„t0h¢äCûwJÜn3˚ïÚK@aØΩöÒ<úöm[ÏØI1%øU…|„&d;πÂ6@ Cw˝—un‘1·<~àﬁˇY»‚¨<!7¯Fÿó LP”0Rﬁ∞^"ÚIÏçÃh%fb6CÉy|¯˜˙]ı)óÃfà‘`ﬁÄñàê£&ˇvµ◊˜'8M6?zÔÇ„–‚BŸx>H¯;NbNÁmÅ^jP6Såº∆^¢œDŒ/™¶|ì¸j
w√(<Â≤á∑?{…qnWq}eí{£;U@WÎ≠‡M©.¸/Ã∂å2ƒË"ëòÍ¿DÚ0‚ÅÌ‚Å?K
8ò5—ëW†∫ )¯TÌŸ^|hÉNÊê… ó9√d∑Ö>F¿Âéÿ§‘ç4:óL`Cà@Xé√R›≤b¸¡S…3GøEi&˝òê@î›(Ú‚…‡Zä˙äGUâÄôàÅ≠Å}X	äU7úÅ!ïËm®Ïú˙W±üåû}p≥)m∏º√(E Kö+z_ÍFò≤Ói#ÙGˇ‚“õ §MÇ£∑≈lDª∑º“ç^òä|˚ÅøêæWDöìQÑxÑp‰Ïv‡‡˙+Ô¶æ14'Æ˜`˙Fœê:ˆ/sÀÆºK8Éè¢z~0ﬂ¨”`-∑ìãóﬁ4ù≈æÿ‰≠w‡¶(=Æî§|‰PpÎhŒµì1œ∞h”±Ï–_‡@Z·Ä‚8™‚ê:‡SªÄ∂ê‰uô+ Cõœ)ÊA("ïk°+ëZÇ˚0L5(m≈ˆ√˝‘KΩÒú¬é;$QÃi–âÜ,w√Ãó^Æ5_¿ª.iµ„ô|Ö,Ôs’à€P^&º,G(ºKËÉÁ∂_à‹˘ä7oﬁMÏä2™òÎ2ÿ®0œ=x‰~Ùm`!y#4“g‹ç‚·;x4aoÏMÿºÎvéâHüy~\◊àø¥wYAê¨˛#v‰∏´Õ-ëièﬂ>®x
%®∏'‰û=@F
Ä◊!n±gpá≤®´MÕÿx65≈t˜¶c@•)nqy÷±EúÂô-|ˇ”8Ø∏ˇ√Y?∂I±V—îE«aõ≥Bx≠7˛µ4“Õµq*Tí¶t{˝–üLa3ÜE÷ <çt£y4~,‡»â˜gµ·ÿÚí'KW%~V}Å[•∏∏ÍˆAâÉb£?ï±À˚πm´8¥£Y:B_¨≥+ƒS⁄∆@8Øi*~…AÙ)Õôúßh %ØœNÁªnW]Æ›ÓŒä∏ß¡k†…àò
œwæ˚ˇ˛ø˛'{5ﬂÕ8ı`¡A∏¬Œ¿H`?å·˚¬![zOâo]v˘Œ€%ﬂ»%ÅÃÀ`Ò	€U%ºWCÃGÓç∑?—^êÏµ\1¬'Òµ∞hˆä?¿´í%ã+EmºAz_Å¯/x‰§îx˛»‡¥ÏÙQ:B¯xÍê_A~Gp≈ñÍßÊÆt¨¬ànà>Ñhâõo(Œ›e´,Àöó˚»AîÏT|‚ W1GL‚¨{πú·øÿD(^∑ıÎ≤€+Ó¥¿D|Î~Äò±70¢„Ï/N§ºˆ}Äómh#/Â•)7–∂∆>∑˘*r M´Ω˙ +ipÏv˛ﬂøˇ€g˚ì {√q¡1Ê ÏV¥¶—:(õ3Áj»Z±ÿ5ëµŒqeàÀÃ1R{'ü˚[]hÌÑ‘YÃJ¯ˇV¬dÊÂÁ“ST£∆¸·‘ßÆ+"k”_Î·æ◊ÉŸ∑ùΩÄí`Ç8⁄¸j°Ÿäö≥9?ˇàØ+Ñlˆíì2±\9Q©‹«
q•ZLŸÊè:π‚“Uè+^ì"Gù+¥AÍçÉÀÜ∆æ©âÁ•<ë·Ç„®L¸	®ç◊z&õ
Æ…‘O–“cØ1#‚aûÛûzS6 Ì3Õû≠≤R‡[.r©"à(ã(¡ˇÃäß¢i∞NSç∂√ﬁ◊–Ä&=¸Tc„ôá»t°óP´πElé∫çDØåi∂Ai&#9W(Æ»⁄Àhπ'=X˜˚}0∫‰˜Âíı‹:,Ú*
∫⁄Ûƒ⁄ˇí?nïúrnÇ∆M§$è≠ó˘ªÓ˘“Wy„ÀÓL8hRÃÇs;˚§!√˘t##T
án©ã¡ÒË≥Æ∑Ô^~Äù{˚hh8tjË2€Ÿe Öùﬁã˘$rç›JâÚ´4 ïw[tΩº∂ôî')Ωπ»ë,É˚NÔ4%•îó]g±ªY]3‡õΩ’ÓºUﬂÊ∏ºdARz{Èº”äá∑§Üwí'Ÿ˜∂ì*‚j%[4è∫Jqµ⁄æ‚Z–&W#ôÛ˘5›Q
e4ëE‚™J§UMçÌRÑOõóÿ•ç∏\ç@§°;	B∫ßÊA7“y~´ÛùésHD&ûqûñ≥ÔÑF≤t∂rLQcó≤Ô-Ω˝K¬˝%·\h%·ûÇt„©˝ŸV»à ∑˝Äõíß`[√¶ ^·Ó<r‹VŒ‚«˝F]L7∂VmH/∏w—ıÉ{¬Ì8fÆÉ[Ô…x®Ñ®ΩêBq7úMÁ÷Œ#ºZãÆ÷Ç´ıﬁ_‡Œo,≤>óF7VXb˝"¯ËñVó?Ÿ˘ ã¨)7ì˙Î~Œ•T	™“
+ôÑ|Ø”˛sîXÊî¶ }π∂XÔQû~]$ÙWπ-¨$⁄VJL‹lN#3£˛í@√@¶# òÈ*1ƒÁ*˚Çüø•ΩÔ„“ÍC&~B‰Ez»ñP-_—XíU	Tì,ç˝áŸÊnÛÏØÂeQ∫º¸ÈÀü›6õ„∏ ÷{ñfÆ,gÉ¸/yˇóºØﬂﬁT5≠ôﬁÓ˙®jmª=Áf`;…mÂ3Q*g?ä≠YÚöcx†°jYgÿ‘:ÌÈÜŸÎ2Ê‰† ª_„	òÏDø≥˙Í~–ÚÊóŸ{/‹∆ı6i¯ÇˆˇúßÒÈ˙~BQ–+ÔplºìÓ‡vì)™jDû≈¥˙jL5µJyÈ£&XLŸƒáC'ıØ¡ùFIêÉÜ%˛;o6rSo]Ñ‚_¡(‚˙c£V8¥Üı÷“8Èª'◊Å⁄0ù%^*‰öé®gÜÅÂû¶—sq-4¶-.áH˙]~∑-™.ÆF±uqŸ‹7âWÚ:Ë∞±r –>3ÄÈhVõü´é;≠†Úi«Î»dnäîcÅ˚∞àÛÀI¢„ıóıÒóıQø›UÚÛõõKº‡‡Ã6π˝∆Q√õ?∑—™ÿÇ∆'ı`9∂JŒjΩxûXjj¿ Hºã±?ÿE<-˛hë∂ádOÖZ‡F¬∑ìÊèÿ∑ÚÈ·ñã“A[≥”ü§=˛ª¸bæ+âTW£Då:{ =>JP;≥¿À"øJ·elìU>J‘öÑˇ≤óx›12‚]TÚΩä`!Ëaﬂüú9êKˆ§Á]^Œ‡˚o\#Ωì]ûm©ª∑àz-˝ﬂˇ#∞|*é’ºiÀü&6u–≈"∂p"7 í\Di£<ñŒ=A'uE)£ÕÂOYÂ„p(¸≥Âı∞+-1gÏñXÿΩ^è\DwÇ)–´“æûåpÅﬁæéa
âß$éR±z◊7≠äRf⁄É±?ıΩtõÑWπ±i2ÿ ¯Êm÷∑›ÍÉ®Å©∆⁄M/&qà-±g¸!ì¡‡^x≠#±—‹ßè˝mQ¸´1R⁄]kÄ«ÿAv>aë¬>!€?œ:"ç<PèVz)!4|á“Tøó§—T’©'ÏIkΩ®™‘—∑ìKÀ∞b4lñÙ	ngÛ™ÁegE :±‘$â‚Ó4
∏fS‹î•À’∞]eÛ≥Ë¬cáﬁ–úZ6 ç¬7A‘:ùÏªL∞
mq›:z[\ÑÆôDjçª•‰K¨µ!—ê¨˜y6Ak1”ˇ˚uÓ®,m9CX`9÷ôiŸr"∏äu§ñÂ≈cŸª¯Œ/)wÃ»«ê˝>˛uOyov;d§,Io∆|òEﬂ≠Òzç¯Û(Mß…ˆ  ƒõ&Ωa«~Ô2öﬂü¸s∑¶Ï|zXSp>}ıÀÓ⁄÷W—,ùŒ“]r·»PÏﬂË√ò“3ﬁfﬁ∫;+b¥›MÑ*öŸ∫@3['‡Aw,xÅzèlN¿~n*!óM-Ræ )vARv»ËWÕG¥˚j*ÄràÇN™UÊ±ÿ¡’√πôëX »ìV°≈Øh3,î∂ê}ávæ<¯˛%;9}˛Ï‡Ï‡¯5;<~ˆäv}BGéNNèˇv˙{∂˜ÏŸõ”Ωgß5kãÍlSáåŒÛ‘:z
¿Ü0˙¿vY¡±AúÙæ@O˛à∏s	æ≥7Ù”óÿ– Ôÿcò7r‰´è†WÒ1ûEŸﬂ3||˛≤’e≥mIC; LÀ(˙pÍzd)5Õ∫Q^ﬁç?´¢ˆ|aá+i3ÛÚÙ“£∏≤¬¯ù`Ú∞I4†Nπ‚Æ◊ÉM‘pıÀb1é}≥!˛)k ¨bB•ê”¯âU≈|∂ÍòœR«AGj∂v£æÀ÷æu)8Ó‰ë‚øZmÁ„'YW:R ß«Ù*^›ˇt‚ ’t¿ä‹% ^Õ§ ^≠∑7^‹‚x=i_ôU]º ”8úVõØ∂õ¥Ïk∂QÔØØ‰ß“NPßïPÅî£m(Aà≈?k$Aêéú!§¥guó;[_∫£dj'õ⁄Hß9Â”¬%ﬂ∑
oãK"∆6S]AõñΩÑW{©4ü\*{»e”]ˆ–M∫v*ãÄ≥à!õ#Ωd2‘ÚvÇA˜`øCì‚ÖÑk˝m∆Òº-nóƒÜö∑]™Æ±øñ◊Ø⁄‚Øj≠Y∂»ﬂ]´Óƒp˙cõÃNÄ~⁄É”pZyÊz€öñ|{<¥.Ãs?{ìè¶ñ∞g◊8mƒúß[ë Ù≠çÒ=œe°Å*sô[åÌÊ“J 9ÁD⁄LM‰ª!ÕKCÑ•1pπñ‘⁄Üeßh◊øºf◊WÕ{ïΩ]ÑM‹Ÿ€ı_™Åh¨’m5Ç3‚ˆ‹ÛüÚW#v1m*‘π›-å˘ç*ºÆªÿGH6®V˛Xˆ 9«}À·ê«©ûæ¯‹Ãœ[ˆ-Ì∑*kj-Õì‚'ﬂÎŸµƒ?A&sˆUF9»πiﬂDÙ¿ ôLΩ ñ¸√.¸$∫¶{›Vâ∞ÂF‚UÒ¬Á®KùQ4ÒiHˆ}ìÛÆ≠Y∑G∏ü®≤n`ñÃlΩ≠¨iâè—$®“.#ïíäôÚaI2ÀLÛ0Ç∆é}˛ c¬©úß˙¿ëÔMuﬂÂÛUÜ ﬂˆ7
aYŸ€€^ô+Ÿ„_2¡‘sY…pÜΩ_Ó0Rr3ƒÍ æ9œ†X_≠gU<^≠D \<¡⁄å—ı2¿Œ›Ÿk√(ÌÚ`Ø?0ø⁄lóôóÛ´É”É#∂˜ÙÏ˘Î≥v¥wˆÊïq≠Rkô ‡h %äólEUU;[R'≈œn‚cØê/å„¢`B'¸YË¬jT=xå†®ÇDwÔzƒúD¬¢6gπxª∂FÊe’Œ∫æµŸg≥Å8Ë¸^
gî7Å…‹^]Ì±Ω©wÒ„&ŸÿÆ‚2Åõà√˝…<˝∑u2ô´i«úgùªú¡x5§∑‰1‡Û»K“#?Iº°SQQ©˛2√D`Ñ?`g¡òÛ É˙Únñ‚OSˇW-¸ÑS›≥‰k‚eıykﬁbNMº™∫à’ófs¶ôqàT”©äLê™ò–ô
îqdÁR!Ó,as´=¡SmË√ÃZd}2û%¬†P¯ÿŸﬁﬂ˜ÿ·Û£ßoN-{◊N+Fg¡7·cìt$0Èi/%ÀTX¢˝UMÇ≈ﬂ/Ω0ˇ“9"LüØ"ÜWç+ªíTÈ:x	u-Ò/#ê$ZÖ≠¯LQŸ ø>vºﬂë¶Ü◊¢ºË#0n\€c'o˜^o UEÃ£Î(Êb£§ÎÙúÔØS Tû÷<áÂ∆^UÌÎ\§XÓﬁ
û‹jC$Km˜V˙≈x¨Ò]≈SUΩ3
≥⁄gÿÀ˘qUΩâuwo%zÅÍH6êÏﬁÚ‘œî——'·ïLD\à£r[“D( ˇºÔO”3?eªl‡OΩ8ù@{‡˜JΩtv)Ñ`yi¨Bèp·/|(7BÛu^0æ9Öaª“{ï˜ä[@∫JM¨|≤GÍ™Dπ$æ$çRo¸¸„‘ôú†^xx„SÒ ëæµ`väyØ‚^z3Õÿîéﬂúw‰†B/ˆ≥Ki)ôM2q?¸»æÅßº	àË~\ÇüëS‚Öœ∏∫¸˛Øo‡Ax	k›ºÉ◊[ßmIV!}GW. πe]u •g5~vSÍº6]æ™ëis„´7…û‰ãnÉ¡0wG]±£Y%Jz≤"$Fæá6§ja*jﬁE=’ôóm$ìm¯wKËÜ†h]^ﬂpf·Uˆú',ÒÆ¸.¸^ú±u‡…∫ˇòÚÇ!uÂ‹lÖX“ò%Ü$-£oäs>6∏ÚÏ†ÏΩZﬁ¶†!™Í™R?±¥1Ö∫ü}˝Ïk8<√˛ÂIf0w√ÿ–0˚ÓEÃÆ‚h"˘‚£.»Ø`)Íyø»j/uzE˚òj%…(¬kòlﬁÕÆPIÍﬁ•Jwı'·N01XÚj≥´Na–y&tåb¶ìW/Ωi,˛‹ªº\ùÁ	|”Ó⁄öIQ∞Á˘∂†s˜∆Èngè∑Bã6a0
]AÏŸ«y›oµvÇ+G8˛ÒTîÁR≠Ó™ï˝ ∑ ú [üë#d‡JÕ©ıÊêÖÆÆ∑ tëΩUyOr*LKí√-…;h\rO0YP±7©7Òÿ˛Î∞ºkP<ˆÚ_ÃOn”DÜÑ
ﬂyå˜∞ˆ*öÄù	uøÒõ
í&õÛ∏Ë‚1N^ÛÓëåÔ˙Ôƒâ?KΩ´´ÇÈ»8˚ZèñQ÷ˇŸ)ØóÀJ≥+ã^f'ñ#∏Fı–·ØÌºdtyÒ¿GíÒ`3<Ÿ6ı„gî!I≈ï5gˇ⁄#µËV&u÷“^’'-UjjÄSt¡hOz7—,›œG,˜¬<"¢∫_ƒ˝1€√ßí({O;;`˜ú›ÄæöÎÌuîMÀ÷›
÷›K’ùä‘› ”äe‘ a£SŒ8üe˝∫ï√VëïE&èCÏïyÎAòºæD…Ôƒæ–ºËÂ≠Ïî<! x^Ì¸\« K≥>Sôœ$‘vÈ|w¸‚≈·¡ÎÁÙ~ FŒm¥j$S"æ¬ªÈ2Ø¶fiΩ*ÑtÆ»ÊÃˇVÕU zâpƒÎ◊µ™ñgÃI2|\È¨+o6Vo'òU¢u6‘yqs’L©
“\”ˆ7“1ÙUå"fÈn3ÃŸS<6È˘˘Ñ[Ö«Ì,å¡fU&Ëw7 M,Ë.jç´
k¡Aü‹ïpêÓ‰∑QµÛ’-X‘ £Q‹]cÇ™~@‡ò–#b)Ú%ïd)ΩyÊ∂JÙ0‚÷•˙ÿ8fÑ2≥P1∏>Õ'o≥|êFC–é¢Å76\ÃVK
Î€7ªQíÁã€‘eùì∫´≤ô_˘úfÖâak∞£·ÃK¥àkÛÃj≈∏ŒóΩ"¸TïƒJg“4ÛWu7Ÿx∏ç©èyﬁ∆&˛=ˇe´∂nWæ:#˚ó,2v‰ßqpô∞.ï·6U,>^·⁄Ja7}ΩR]m∑V¢˚⁄ËÿàÔ](ÃæeΩƒ2∏ ‰¯€0´®!2÷∏±.6»êÚÿ ÙE$ôE'˝:HøÆõﬁ±-øc]}áˆ!]åk>YehYa∫¯Ωúáöz“≈/$[©]/Ù∆7)l⁄—x©◊ΩÜc◊˚ Üø…\–◊)XEuVmø.vµîõ 'Ú(ŸËî‘'i/≠àÔäÙ%•≠≥wK@à‰ﬁ¨∂•Ö1]Lx€n	µ]>HVÜÏÿó>û2ﬁÖGπ…:Ágag˚GÕ‹Eh≈«©IÙêÊ•òt.ˆΩèú1†œÏü˛§£7`«/)Q*s°gŒÒ'”qt„˚I∆ˇâΩ ∂§!doÚƒ.H=´˙ærLbìÎ´Èû◊–´p∞˝ä¢ñ¥^WÆ~èÇA*™l)ƒÓ#ò.∫˝Úˆ~Îæ%kíázèœ◊ræ“©B…Ìô'˜-l‘E√I4™æÙœÇÅ¥1]sÂ´[oÏM#XÍ›qÓñ'RŒZn¿2YJ·´m>Ò¡o∂ı"{ZnAkö¥e‚u(fàa›åπÖd…Kã›(öÓæÒ¢Âb:RÓ’"s#æ¸<y˛zˇ‡ı˜[I}∂±âª¨≈—˚±weŒ«£
ß,%ı/’⁄∂u¸Ø™+,≠¬Y´Z7&pö€:1—¬*klì-¸Ê;ÜSbaPgAà’ˆrÈvºõΩ4ı√*õOz)‹ Km2%≤¢≥ó%á’¨Í%æØQŸˆR˝ô¢nª¸H-›¶ÀœE;óõaõ5A0´Ê®ÿ… ¿û"H’«°YQñ!@˛§À !—T⁄dØz#K7&¬04ãQ_Qö˚5ız}¡`]¶ÏèçJˆGy‘J5>ç›Ω¨Tı+ˆ¥ã	™áﬂ{ÔL•Hƒ—ÎZ≥mîêöÆg(<Ü∞|^G˙Û':’˙ÑWﬂRﬂi)-rL±@¿nk’ôÂ∞Øı]OÓ§Å$®“)Z"m5ˇ˘øˇ'@kÕ"^tø¨≈i5zﬂuˆ°;˝®P˚vllLMA®;∞TùNŸ≠íê\@æ4Ñ{ôß<≠ûÈû_pv´!∂n,≤˝õÆ!ÙU˝Ä≤<∆ò˘≥ïôYÀøúœ9qµ8ÌƒEúy÷gYãSQ\Æg£∏öt5ØZ î•qm◊åºÍÌOn∏U0˝Ó ©µ r¬'“˘ÅOÛ±¡4€„µ√ÖsN¸µœˇà˚‹âZ∫∫œ›˘>G=Év˜X1N®£sZháRBãJBã¢—ÌnwªÛÏlìÊ£&J®[Ÿ“¶Ï©?ûMÑp„ﬂDätíÿLˆåı≠pŒ ˆyÜÃh1√«≤—\ØÊ/MKÆÄgv`¶å£ÿé_Ô˛¨Ω3·‰¿ø°â7ø&:œ*`TùBÊï¯ôÛ»≥®™˝NoÇ|}ôïZ7<Ä…1≥hM∆%ﬁ,$≤¿’¥Ln±Â]ï∑Ùí|*◊æ}àd;´ïZF›Öé7eêæ´æ÷+˙4ÆÆéçB˛:\~¯/Ã(%˚ı˝-ûuSy∞Å/c¨tÂ‰"W„(äÌöX÷≠∂Ñ|≥Ïk∂)˛≥º Eåø?õ6k)k◊óµv-+mùøôNhëxYN‡‘¨—	,Æoÿm6{üﬁâq»>M\P"y”Ï§ºñqp=∑≤p“#Tfx {éÉt6
ÆR÷ÜhI∂Üÿ∆É&Ç3¬_äwﬂÉß∆U˘îÕq∫«Êêﬁ≠y‘œ÷S+¶ıÑbù˚=®ˇvV’„´œpÙv’œƒ –Ω…4ãsáY´)Yπ"ÌTçXX .âWt1|√‘çFÑúµX3‚(
É4Bèò–ﬁ z‘‹úh.ÁË}F)r^°Ìæh˙MûöAnê•ë∞ú_AR™“/‚hré⁄ı“H≤BÏ>°ëäÈAi5À∂|K6»
´gG.dÓdë$/Ωäw—Ön‰ƒá-ÅÖ´/qmqlDÇ˜√úô◊ ”`í∂ë2Wº»ÓD€≤M±sUº’í∑·7,*ÄÔ¢ù'1¨Mì;p!‚Ñ∑ﬂ"KënI´]Ìwó¡÷p⁄Z˚∏ó ﬁÂÈ—÷Ù◊6€L{ûWKk!∞R‹q^ò/√PjÑ5cà?Ü⁄Ó9Ó	_o¬T3ª∑ï?ËZÅÜµ´≤uwÎg§:¯k∂´É ’WkiÒöÚJ√uÿÏSQÿÜïn¶r≈ícÆ(ÆÄ¸h7õ°Rt„Ë˛L“`ÚLFÖõe~·nB	¢`ˆFÎJõåˆItüïŸ∞yj,ÇIÍ3[zè—! ıﬂ#	ÇC©È%s<U&éÖZœˇ€ÛgoŒ˛ˆúø>8?>E~€ìΩ◊œùacö‡”TæÛ¯«◊œOÌ_«clGœ_øaœûüÏù≥Ω˝£É◊gÁß{Á/å'…Œ hΩ…πóTÎ•‡|X%ßqæ°ó,ÄCD98√≤k∆SÌŸ…˘C¯$d£YäL”ÄˇkIª;≈≈Kòwç~ìh0√"◊–{⁄e»ﬂI8=çïXãvËêÒ’¥Zäñp≈ó∑gep+.óå§W Á È∑B_*ËV¶∏®—°ÈWîQ˝‚˜5É»¡ãÙï<çˇäÎ°ê!xùx!Çêìjß-ﬁÍmöwNÏº˛®ìj¿?≤MÌ”Ÿµ«äß⁄œÌù±!U *ŸjQ˜fVäûAym8ÈJ~£bÛ∑ƒ¿“1≥`∞]3ÖÈ@Mpâ(L≈÷•o{˛IÏ√´(€∂ñ◊Û‰ l˙ê˜~¢>tÓµ sıù:˝#l$?uÎÒ´Ú8uÏ1öä˜–·≤:ﬁ•À'Åˇl‰≈éù∆¬iv:é]Œ|O˜–ÎÅaKÁﬁã¡28EΩ˚¨s∑nøö“I¶)πıÛÄÓ°„A¯>
.}∑Ÿ>ı/˝`ÍÿÎÒfvÓÉ† Æº€›ı^÷yGÊ%*†é2Ì»Y=äBGôv2K8«Ò›õ≤ÎÔÈÙ*\L◊ìÀë∏õP{Êç—esç[œ˜Ü¯Ñªdªá9øå&S/ºÈÊ …Ngÿ,c	)Å(àW1ﬂ¸’ÓΩÊ]€Nˇd¯§ï	º °TlùFñûÎn£+c@e—k€Ø˜/L¶∞∞ﬁÉÈÍ¥£∆¡îègwt‹RŸÄNÇkWârOg»üSe∏3Õ–KÿW∞=BWU¯û√ª‘ˇïx—gf¸iU√©wàõL€áΩ¯,Ün˝~Í_†Ì„Ù˜÷Ì{T¸¥√ë˜óZlæÓYº›èR|/¶ÄY9¸Ùºäøœm∞J˜ ß¸|6â&`ˆ Ô?*‚âkØØê ‰ï€ÎÔ˚¯ø√” ;ÿy0˘Ï‘º"ô–I¿å®ØB$dÄÓ›æ/Ö˛ÆÕÃ
Û”ŸªôÛ*ø{m/¯z~9KmñÜzÏ{7éª˚ ﬁœûŸﬂü˜xX,Äœ_≠?*Bº"ÈÛíh©ó\ªu˚0H“Ûhπ.Óp6ÙÁ•}o~ø |Z]ﬂ∏ŸÈ ˜º°s _Õy}Ó¡˚ıª÷gÔMïˇi¥M¥”»—ıLºß—G«æ∆I0ΩÊz…±Àó7–XÖ_ÓMºÈ“ÜÈyjA[\Õkˇf˜ﬂÇ§üﬂ∞è˜‘úê`Jj»ﬂ‚%Lp≤‹∞8’¥;äT@Ï$xIV∂tîÄj‚‡ZïÁ@Ç’V8 ìI5E¬¿á(AáV“¥°Â€«õ”è?µ@Ô¨·,≠≠1Œú(ÂzT∏.kIí+õ
M2cZI&I_d}9ı‰lÂd˘“éXDóVpë)“ÔªínwfG>_kkJ√¯èOMeØi)6((ã—ö¨úyA) ¶ã`7ƒÎ÷eøSÏ'V,—fÃ–:îQm
÷Áò8L&ˇ)RÉeb,ÁÙ`)mˆ’ﬁÈﬂ˜~‹{m\jwù/{Ë¡Au‚Åf,wÔ∞Øò',tc”ÊœGÂLjòŸß•Jû4'^zbÆ"9âb¨…]NÕz≥®‰∏ıE$«ô\õîÎÄ€!¡¥;ÙﬁQVπ[Øàe¡9&ÒFW7ñQC¥ÙäØ€Ó¡ò¨˝zÀƒè·(	:óπ¨∫FÒm˚U√}∑wnÏ?=À ÀzFª¢⁄vÕ≈˝‘ƒı‘ƒÌ‰‰^lΩŸ·Œ6∏ú:#ÿ≠Cˇ,¶˜|=t0∑ô⁄e> ﬁN:?çlCˇ~˙À™\∏U)ì≤¸eV:ôï≤"£1-Õ47Ÿñwa[ º6<˚≤Œb±'POyËY9≤voï_?ÅËzùI´›€\nÒñÍã+˚-ßj‘Q`–•©B+ÊÑß∏ó‹m‘™Y*ÔRìA⁄ƒËlZSW7&±Œ(£èmXiöÒ â¯Mád0#ÈcmÓ=™˙?Ôkπ_çÑ;bg‚êƒúÈõàhÒ Gcèù˘ìôIídN#wù€
V^·Ç…)O/‡èó∞t£	ËVòp·≈,	·Êè⁄•U@!h;aB–ﬂÃ5¢ÈC–Ô>“:Q…ŒNÎESPgÃ“ŸÌoº{{À"êAz≥ç†à¸`ÅüzèÕ(åe|— √k≈√k‘£Â*¬ß`g√≥–gˆ5|)˘§3”„D/˛F‹dCˇ"äœ≥ÂΩD1öàgπ∏‘)6ÃMáxàh¥óE∞WøÌoÒmY(>é‘õU`\ùIÍ≈)h:`Q_w3]∆Ëiúãﬂ´≤ô
Ün$ËFr‰Á^ÂÆè‰‹}YºÆ<R=L›I‹]Î√?)˛£QnÈï6ò≈úKõ„Kì˙åS!6áSpÛ¯Ë_˚€?¬ˇ:¸„UUÅ7Ã¿xXÃôç˙#òP$x%ÒÂÓÌœ£4ù&€++0‰C?ÈÕ¬d
-ı.£…
ò∑i„∫±∂µµıxcs£ˇ®;ÿZª∏X{‹ﬂXΩzÙ‰√.ÈWˇ‹›Z˝*	Üª_‹¬æ§·lÒ™ìIèƒ?—Ó<P$†˜πú ]€$Óç”›N∂mÈ{…Ú]ã6[üG±-≠3°¡[û©i¬…´~r+j%àÔæb.ﬁê¶‡ÏR÷`C}∂µÂ;GﬁÙ$Û2Î’OÄÍu…ñ?Ã•çá.ïqt…∑?À)Ìqò ·ÎRwAgô˝˙+ìn¬ÀÒl‡'KÁ	ÒÒ0äz√qgŸD“VÈÆ	[æF±µ+5ﬁ÷Oº†?C∂¬?`]Ö◊v¯}ÑZÔv¬(ö˙XπF•~€ÄHƒ%€Á≈èˇ·ôîØó/JÉt_¬´ÎO¸î†5.ØÚË˜˘ŸÔ√lGSêSo»«ì]Õ/0›[¡|òM”~Ä‚ÛFZfﬂ≥≥‚YuIºá‚E5É;ÊlÂıù¸mÍ≠∏[R"˙cÉç⁄ü„ ∂Zû¶®ñïZ‘‰¸∞Räq∞¸ÇU<å˝DoBî£iüP}UÉªÎrÙL≥F}˙rŒf5>ÖG‹2œ	Ÿ)™jè.—sÈKl&qIfÃ_:SàRÔ≈%ôCŸC?°‚œˆw(Cêw>õºª”Ç»èwV ak‚sÖ?ƒ:aÌkWÕŒµ`ˆ*ﬁ”è›M≈ßûØï∑Î}nc)>e¨&Òı$ŸU)`Ri®"®ˇóûx´œ∫¢ M2◊à®u*Y‚d<Kró2lCO∏6πAÎ⁄› 03å7‡X^Ë%Û–K÷cg¡ÿª!u1Û“¸£/ûıå≠5”âò UM8ÉÂ’»ë|∞@√18fΩiä„î¯ÈAÚ,ˆa¿≥tºÒ1ËwÇª÷Õ	LÏu2£#?$åßXÕ∏`¶oÿπ7πF4rË‚ñÃƒ”s∏«S·H¯£˙»[§\ù¯é˚=ßf?Ãí(˙ÀosFÙ$ö¯˙Mxy&q¢√∂pvj÷¥$ÉôÀ$Úz›8§YŸ·ﬂùŒ∆∞oJ≤`\}Ã≥ZÌU<_Íiƒo_#≈ÈŒ≥q4_]I6ı wÏÈÛ√7GÏÏ‡ı´”cs.õYCk”jëãH$∫åø«·Ï™Òb}L‹yuÛŸsºe`íö}1ÅuM]õ-¸';/∏æ§ŒÚõxñn∑9ÕoóﬁvFæÛ∂FDqêﬁ‡œ	ﬂ2ùü0’ÅÛÏàc´ñ.·I?<2,¡õc=‡≤–D˛FZ)ÆüÜg ûﬁîrçùﬂ˛\&=V˜µ8çQ∞|…çáG¸6*®Ñ7ûã™ºV¿ìí”]=©•ÑblÎö¯ß$C∂æY%.€(íF§?Z…]Á¢hÕ«@»næP-çÜ¡¯…ôÌæm¶æªX¸.√}"nˆå¡˘{2“mi”^@õ≤ßZp ∂å,è«à∏Úa0√‚7	+Oºèò"	«§pO‹dëÂ3ë2◊z-∆¨.£¿ßôÓ√„√B≤âÌÓë87¯höjCt√ºÑ?ƒæ!ù(d@xıë˘¡ jy·`Ïã—‚dÉÂ∞úR–&e(ItìÅ>>€∑≈gE,VÀ,*⁄gTc3·ü˚4P"Î´m	DÎjˇ&∫26ıﬁ7}83<7U ¨ÅM‘Ã∆	Ót¥wï¿£ìtO¢S„ÃƒÛx•XwÊ€Z:d4∫2õ"R…Tk‘M˝÷Ω6L¥ºÅ+Úhs3{©ªÀiKé¶.®0Ø|}Òò ºÒV}é‰„Jƒu£à∏öîO$Êº;N˘e/fâ„W˜íÈ8Hó:¨≥¸vı'[∑Êw„;öÊûÃ>Íp€ q3ªEóÛtâ—Z8ÌÖæ~t)—ªá/6gHò}›o0ÙÌ∆J~6IÁ“ﬁ……ÈÒﬂûÔ;©—jiYço“A∑÷¥‡‰˘Î˝É◊ﬂªDåEx›L— Òõ”◊sÂæ‰ÀRôìÓ–(öcÿ°«˚gœœﬂ¸Ê¿n!Õ3∫MÁœOœﬂºﬁﬂs2í†˝gœœ,FíU5ZÏ&)#˚‰jé <oté:◊Õí€ôb8_Çw€*™Pv!ñû∆fõFm…ó™ÆªF¥FÏï¨9sn£jŸä®SOáª€Y;{c?Nœ„¿á„ú›cÎS£É°˘¸‚NÅ”|8o»v3ﬂsÊ,ú8˘7ÅÆº—ú˚—jΩê°0˛U]i2∆rπÍÈ(cˆö™s‹∆Î·“;í√ôôõ]3ñh∫.ñÆ}ùÊè‚O _^{Ô/º*Qú(˘ÈÕª∑	ˇ∑˙≠wﬁÆL§gºÔxñJ7¬o’;µu+ï{Pm›ïôè™7`∏5[ˇQ?S&[? EÓv˛$W∂;b	w~Í„NÈd◊Pñõ\*ZGI’g°ıãToRQ&
)JÔƒTaÅBCﬁ„ïeP—,ãT™Q˜€~n€2g¥9∑√ì,•^ÿ∫OÙπS6p]LIF4;ƒƒ«Í-µ-mIEG&K)#1:Ï˘aòr∆Ô Ô¬Kt’RF˜™—µä§äzó™ÍsYEüÀj·(Bæ§∞1Ùœ=PcXäÜY”J åsµÏ≥VŸXk®÷W˙l‰øè£QßÈ¨≥«’@¢k4YäNIΩ©çëAY´Æ›&v’úYÂdVñÈ±mÚK≠⁄∂j¡8~g≈nqxJßTÈΩ—≠G–nôÃ5TÊeÑ∏û±0+_≥Ôco¿ñb« ∆∆ﬁ˚z•∆IkLAò¯(ã`~ÜŸk@ŒtSvc0 O‹‡ïŒëpDN=<YÊLÓ˙yòt√(Ù5â∆/æàR7l
°∏ô	≈MùÄ3XYÚÆB€t)+£é”‰ôl¨ÃH≤Ø/…¡5ì˛tLπq\¡Z ≤Q?ì5P[˛Æ∆Ä≈®Ø¸&ÄUÔß¥}ì‹¿œØ÷Á;ç˙5o\ﬂ¿ßù∑]™cjì`tŸÓ¨å˙nR¨±˘‚öø¢_˚•m≥N%´hmbÓÏ‡ËdÔ5;<~µwh03gΩYˇ®ãÅ÷Úi@Æ`-üÇ>÷Øw±˙\y€,¢£Z±¥ê¸9∑ô3•Ÿj‚d•ŒVèìπ(eé˘¥;hÂj÷™—∫µ@Ä5H˙≠{Ó’D(πXÃµÿa?‡HJò˝{<ˆGF˚π	≠}QxWèQd≈UêáLGÏúD'ƒ!ÚÓevxVMû§iË©i3+…nöCSÊLﬂ(r3ÁŸ∆]Â›jƒ
Hïı∆∏˚~r”$Äü–ù°?7¥Ω”Œa%nóc∑†tˇË‰xùÎiköhä≠i'ˆ˜<çs¶ˇ$3o$^f±…÷ ®66Ã	FhÄ,[•Q«Np√wv6/à⁄Ì¿„_öî‘ëèêæá≈Sﬁ†›é1Nê§7cÓfM'Ûé‘zy,	Ó£,^+èø?˘ÁÓµEÉÅÖ√ùÓfoÌ€GkùO5˜ÑC~œ⁄Ífo´ˇmøÛÈ´_v◊6øäfÈtñÓ˙`”å±oÛÒñâp”Óí≥]≤ ˙«*àU˛Á5M)˚≥!ØngEL¶€ZØY∂;’™ÕQc≈E≈8ƒ|XŸ∫l˝Â∫Ø_ßsY¿Õ
ñBI\ËkÚ˜Á„Kºé88C¬V=Î¬S∞Nª#eèúú&m6|JﬂeëølúÅ√ΩÛÌ˙R€~ÏWv¯˙˚m*äÁ∞?¢ﬁµ@ öör<2O≥&˘Î"ãÉü≈±]J…cÏ»OoËü˝sÊ≈ÖsdÀhldï[Ø¢	'·–ëk[ÔÏnÑåÅˇò0¥Â¨°ieá00À°w„«âÕ¯"º‹ÕLlÂOø≥ﬁº∫Ïgö´¡Óñ—π‡äe©Ω/¢xr~3Õ 0˜˜ˇéıõL˜È…ÈÒœüùwñ‡(M§Z∏˙ÛÕiÒíJ?• %±ÃÍwãzË˙®>ıî˙ñS•·K!ú+5∑MûÕ.&Lò»xñ+>®>êqL
Hò?ıwb¶$ƒ´OƒËªå®1!›
C¶I oå>¶ß„™u≤Œﬂïâ®ã:2´	j
d‘ÂıM¢$◊_∫Îã	Eö‚a⁄≈¶«8Éõüâu.û9A )Àu¸5ÒÏR«Ñ§y!@Ÿ#9ãÈ	≠fØÃPøä≠˚HÒœU˜+Å—ëP#<Hßí˛   ˇˇÏ}ÕnI∂ﬁ˛>E4!≈nVë,äj5GjÅ’#∂§nö§z|-≠dUäïbUVMfñ(á¿lÏçºfÄyÔº è2/‡yüôøYE˝Ù00Ë…Ã»¯=ˇÁ;·NRc˛±èÈ]ßÍñ2ö±ÜÉÑ”j“ÓmD÷ à=¨0œÀ∫ÀÜkptÑà“wëVD3Y˘ΩçfŒl•º ≥±1.~?uéÏEEdÀl∂Ÿ5|~IìT™/|ï.ï∆ê{¡ÄØ3
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
‰Ô˘[˝ÜòŒj{sÒ9ﬂËL:Kf`Ò¶»d⁄≥U]ÚDÕbX‹Ç¶°@∏èHkøD„y¨àûÕ<R[!Ìt?Ø∫}1F„ügq⁄¡ÿÛ*»≈≥	ÃÓ‚¨¢J,±Ó¨‚˙ôÖï]¥eüÀ(k˛	)IZ◊Êäv≤äEb!©<ûCraß;˛|ÌÙ<ê¢;ôì)õ!i≈;Ò…ZR≈â›g(lÕJZø)‚ÒŒ-ÖÎÃF”46·Å{‘/Û‚˙⁄ ¿òEÆOHÛ∫~wE™. ¨9ãXÎ(éÅGˇ   ˇˇÏ]Îr€Hv˛øO—´öL—≥&u≥4≤VG∂g∆._#y2ªqπjöD¬ -sX™ [§*Rï7»+‰QÚyÑú”› ∫ÅæÅ¢˜Vã∫ê†/ßOüÎwﬁ‚Td¡Úœ…;ò°L{∫ÍL€ß´ùßªª7t¥w€p3£eA≥ÏØb$Ñ|i§ÍõØÉ©úØ«œ8EYfZÕÁkk÷óY¥Ú¥Cªƒ*êGf¥≤Ω•+ËE¨ UQH¬)ç£l8ï√,r˘(◊^ƒ£‘IVS66!£6xßË^dîìU[˛†Øæ›hÀ
%ö_¡3•Œ!≈wøª[ÕyÊa  yP\©—⁄™6~h	◊Ôu[C; òé·t ;œhÂ£Ô'‘Nµ–J…F[4¡rkUÈQãßo»§≈™‰Iî—4eE0Ù≠«S^˝B4<“∑”öxÌS¿e4˚Ëp|l£úG·5Óèë◊≈?Ï„C∂5ÍgKß£V£‹#ø'aîï„Œ”¬g‹¨ôˇ∏?põ;.πO"c3c©,¥9œÊÉ’“äg~nc¥qé1ﬂ⁄òaŒˆı~è39¬ióÍ˚Jµwÿ◊l Õ ≤ˆÒ}J›Ú◊1 È`œ£ﬂ Æ¬—I∂∂Öf–9ÃÃ_ †}M~à~†^¶çì¸Î-Àx	À0ß,'≥õ~M^–blêÆµUø˝
∂≈õñ§Ø#ŒÄ=¶9Ä0)√2ésrùßUæMáeHcnËh§§Ft›˙qw”D’¥yAebÛ˝8ÃãHW¬¢÷∑VΩ¬Àí7ûVñdäÆ çVeCıï:}(ØôÃ AÄì)Y±‚—î◊fÅÁñ€–_Pµ6`˝©Súáå4≥(ôˇ9Iìı≈IóÈ—Ã˛§ÑŸFù¸k§OìX∆k…¢˘‘«•°>_o
Ì´‡TxúãgW»Ar∆H¬ÂîsSÂ"ˇ£m≠E	E˚≈û°¬¶Åg+‡v]4§a D4VU„g ∂d/ñu31)è∂§Â®¨s≤¬9Í99;Éo◊;ƒá©¡pYï∏Èﬁ˚Ω∑£>‹ƒ$øäéˆ≠kﬂZDé· ˇ≥R∂("x1eD<≈RH˘ÆuäÖ_Kò˝8qT∂òC^_ÿ«e´ˆ—≈YÙ™Ôa‹êcnúáˇÊ%]•À“]—C4∑ªOàµXçh±µí5¸™I–^Oñ˜ﬁ\¬F¥¯Rê®6\2ÕX‡(¶∏ÇAÆ∞~pƒ3ïä˚U„Ì_}Ø®|ÔÇ|kæÁ∏ÌŒuxÒ‚F¢üQ>¥ﬂn´≠lØÆ,ëëΩB.^ˆ2ÀÏav–:S—àÍ2‹Ã∞B6ΩπB1#ÊItDß´gP›?i=¡p¨|q.Äìsr%†‰åƒ«ˆÓÒÎóãåŒÈå\$ ì¨(0a¬&ÊrMg4[$îN@8i;Ìﬂ#Í~Bú˘JÂâè~q«∂Z#h¯ÖQˇ P] ¸*·§ÚiWÕ¶¯˛‹ø[∂¿v¢ …®\±è8∫_#‘¯Ö{L^é ¯*∆Ω«Ó9D3w~∞á‰6◊ÓnïXÉTå6¯2dÖ¢X¢aÑˇÂaë¡B´M¬¢zl7≤πΩ¨£ﬂn,∫∑ı˚Dä&û¡
D ˙[ÈöÎñ¿˘<ôëAòÁ~€Äì7bﬁ¿-i>ÿ˘¡l¡NÚ´hN	‚Hﬂkå?“)¨ãém1è<«Ál„ja	ü„óe#êåÖ˘à(.ò∆„_[t§kaÄ£VK◊â]Fe˝y∆¶Æ&˚].ôÓÏ>n_—÷Œ√/ÉıáﬂæY´Æ‹}Ø@!¥≠<Õ”éΩÑî)π`DL.óIÇ¥]õ]tw…HÀ∫“`Œª«{äÔ cç”m£°Åv≥·≥2vª—c¥«F√ú…™”Ïä¡gÏF*éÇÛŒáÇ)˘Ê}ÿÍÄdΩtBm#“ˆgƒOÊp€Æpw¯b≤,NAefà‹Lµ„°¡&æ˛ßâÒfCAxMó1{>ﬂŸ¿öëfÃÆ˘I< ÛdË8ÉÔÜCÚ6ä£Y{π…px∂ÀÔ2?v=Ö˙TmÂÅMRkëﬂnX⁄»˙
©ëCS¬ÕUh®≥√ˇq´‰B¿¿_µZn◊›j‚π¸n>]∆˝„oÔ´ÀàÇUÏ•ﬂ«XˆRà§XÕÌ˚òÖÕ?^=ÜmyÑÚÏ›´óW‚Ï7<bV≠?9Øﬂ˛à;Èm7≥˙âıΩ.ÈK»EWQLëŸel4Úﬂ@¨q8Ü/:[∆Kß»SŸ1=Gˇf¸Q≠ñM}-ëvŸ÷w^‡©˜Í^ZÓÅ˛e:ç&|ö,â
¯0i∞jjù¡—^§ãê§ÂùÌ g¶°F≈“Eı†]SóÃ5¯Œk\¥°®ÔØ√0`=Îßæˇ¢W«ã%ê“U@ØKöÆà.¶Q2"Öü.∆t6o¥î(â»G8¨]jºÉfy(cΩÁE«ñ/›™ΩE•*û/|Z˜fÈ8©7ê[Y”<áõÙ€Ñé˚íFÄæ øK{∂~˘•TˆÍ‡« ê…ŒŒÔëK]ÜFFˇãm^ÚÎuLd¿)˘ñµf˜”¯[öæ–Ü*ü}Íß‹∑ï˙z’ Î9ÙzÛq‰óÊ¶âÍÿÕr;Ÿ”ÏoÙøµﬁ,Ω˚È«ã´⁄*5xŸıpã&≠î∑%´æw[B¶Øã≈zp‘¯0àñóﬂúêo»ª(†sŸw^Qx∞qO:å∂@k )(-Ò¸“˚¬-jeOÉÑ∂]ÎS¥QHÎEm˝7r›–Ã˚≈∏aëwN;°˙à°^Öºxw7àx=ƒÆ—˘,“%n;j+πñ¿aâ¢≥Ü∂xÜü»Å.|K!Ô4Yà¥ß∞j*°|·zêò"Eà.C¬–çQ=√Cìv; √O∏µç ?◊ ∫∫O¢‡≥2VT¸áD˛=F»°ÍIW#•ê7ctùOõÍX|úJˇﬂ#g‰§©9?ˆ≠hRö√ÌÀÉ3-`/lQ0l»í∑ªG(LÎ0Ùpy7sÍ4‰?ívõp,ˆ…A«¸ÆXÁö≥ õã;¡ôHÂ\ﬁ€„—<g˝KÀ”'|Á´µB◊“◊U^Î1Aµ=πUéf≈’iËvï—‰»√nrÛT‚Ò~%®GÑr(f‘Óå®dD™ÃõÊxÛ90Û$º¡í¬·@euÙ,~'"hΩ\i"Ã÷œuÍÎöÖç<á˛¡(„‘ò⁄‘Ω¯-	(á9fæw-`⁄gp_1KÛ“Û.+˛XuYúO’Â≤b≠LÒ›í8+ºúdÛ>˙rdluâŸf√ öF∞Hd%KD“™?Ú][ú™|˝¸¸±œºhè‡_‡ú˝Jù2√Å¨ù¿jn<«}œ~ÀâM·≈·|öËê?XMmmæaë,ÁÏû3</Mà‹Ë»$∑7:Í&áóiGÄR˚VtYÚyËEﬂ∆Ô[ü∏9ºNÔ~Á¶"7£0≤âﬁìS˙NåÊ]ã+≥πN±}ä‹œt^.ù;‹…«Ü£ú¬ŒË9ˆ`øÙ«jπÖÎ[Yq¶Ôb1cÖ.u,ùe Í∑ØØ„Ú˜ Î#˛ó9È©ˇ9Œ8w¥ΩÅ8AßU›=©ˇb2ÅÈ.…”0ô#‘?˜%+Y;◊J’áÆ/%ﬁ~Ç§5d√ìö!Ω¿L	™oæb^iíz˘˛Å≠º&Jˇ %˚¶¥†'&ó¢_)59‘=F≈∫u5√PÃ'R•Õ“ª·Õ¸£1+I6å£j§qM%RŸ◊yE˙ëa´_ÃóMq£πœî°Ê4Z≤ûy
Ññ˛>•…÷Ê_@RÏkí4ÁHø0€ä*≤Ÿ˝ñ•'+VÿjÚÛ0¶üCÜ÷´‰]8¢k≈#¿º‹ãp±D∞/:/¬Çƒ)˜,Ê·úé,”s \ÿt=
$˛∏2,i∆¨∫sï,§ì§‡83•Ú—eï˜Ÿ√(íF@Ò(¢¶«!ÑqD>Fs ÀWƒà|Ø≥z±5—ôÒ~ú≠%S≥≈Æä√
¨…˝±b¡ÈÕê.À‘Õ;ÍöÌ'Ã2HÍ,ÅcΩÖ1§÷¶Z2ÎD¯˛¯∆û„Ñ”Ï√Î^Å@_H®FCƒkâÄ≠¨√
{c¥|jœåZXá’bÁÈç√6¥ıÄ∑ﬂ¸.XÈûhÈ}Ò“}L<ﬂ◊(·TÂ°ã-≤≤„KÓ dœ∆ÍâÂ)ìÕGIz3∞"k„ÂPßæX*”ΩÛ±ﬁ±.ª@fØ<Üúù√ØˇVøÓ±c@™zÜM›Uóá^fë¨ÿ™˚éw)-JÅ™Êå®©]¯˙–öé≈ú“Òw∑»åeò•7¨è.Tÿ;<≠)ó\”(í˜äË;„wuˆãZı`˙÷ˇ`rõä≠~ÙI™ØNØ˛®ˆwıˇëﬁó£ÿgèºÔ	r¨[≤MÊ^dÙ™àÆêÊª≠I„á∏cfıc‡*Ò¶3n™{*ƒöè‘œ^”Oc⁄v@Û√Îjíáaræ.ÿÔˆ{£‚	@√‡94ë˛1∂{≥,•Ü_ªeöº,˘|]1ÁvL\(Œ◊Ïó˙ù"eùÌ.R\πë2	M}F;Yû¬IÓú÷-xê`ì)QÖ≤Z1œÂÕ°Aù⁄°ƒ∞JÒ.Rß‰DÔ∞ó˚rÔ’˜7–¡|¥ÒπÙZπõR4©2yè‘VRp9ˇæ7˙òF… ÿıéj•9ïÛJ4–‰¨ú–xEﬁ\_É∑#„jœgÕ¢)/âÿÜ4>_ØIö—ITÆN…^õô”$Z0“ëÌ∑Iúf%√Ÿê”6…∆√C±u˜Paµ≠ç48êís‹Œπé;#_7¸7ôØHôf√=Ú+®¸§†◊·˛Ô»Áû6!ùô »Õ[|ºëëfÈ"‘#Ô¥‡¢ªåTéÉ≥Öµi7≠Y·…,¸îß…À∫4É¢ÔT
ò>ÎÃÃ}Mf§≥ŸÅ+2©2#5Ç^H|˚í+∫“&Œvgû÷ïÌ@5òzâ»E%´BÛ<¿l—íXö&ù”B÷™5$˘U|ãµO´N*⁄1©"ùéù˚£cÊfX¥ÃöÃóÕ÷EkR+´˚sC„Yù“D;È`_wøI`2ü≤óíß·$Õ˘st…ÄÌ.”1»œKÅ?@∏}¯%Ï-≥·¡É«!kÑòt»ˆ\FëIWú!;qW8ﬂ_1ƒˆÄ≥¨/éî≈‡Wºå’7»\g¯£ôyÊ>QJFàP˝° ¶°L◊û¯≈gnm™:i≤{GS“"üú[¥‰„¥ö≥#≠Çè‡∏„è&ì]¡#x—˘æ#/C⁄åˇJ«,ÀhÇ„6=î∆Â˘é8ˇım¥÷'Ωª/ÖŸ)ï0$œÄÅëéäh≈@A@»,®;	aVﬁŒRX}9I¯∑W]„N Vå{1<‚ªa˜ÄpgÑÙô}†iKZ[ˆyxTe: ⁄ÇïÙ¥æé◊ç2ƒ∞]ŒGTßŸú÷Ÿ∏9öΩ¡÷^r˝"¬Õ0[Ç&µc)Ä≥Aë›AÚ≠.“ï√·=∞Âﬁ™°(cÙvZ]ôâôªg≠\‰ì9lr≥6 ~~$ÈMN3üsê_k≥mÀO7≈Zπ»¨
60+fâNÅÓÍ|ÃdT¡˜ÍdÜé √ñ=cº˙ÕáÁl8˝ËêæLfíˆÂÅ∫›úNÉñ¥ÿ&≈n¥#3˙Ñ‚ﬁr«
ûEXÑ…∞dÂ*C9–»xŒŒè,#üL¬9Ãﬂ4‹˝∆‘Ñs∂nµ•=Ù
1∆.Ç~é‡®öÜ%ÍßaÒhÙ~œíVÜä0∂Û©jõsmËú≈œ`qóKˆ¡¿j§„7ç“H5¿ê°s‚è=á%√Ü>~¿„´‡fÒº<,ñ1f‹	Xªe—õßıÓôò§ã^U<_xt’g∏¸¿∑‘hoÙ≠´ë+õØ–KÀﬁÀfßû+dD‹ÏÎeıuDíÛúÌ%lú¢®óvGá¢GeGïPÿ{LÑ;Ì±FÆ>‹;¢gÓ)Îg|w`da∫,µ±µy∑µﬁ'º±u6∫«ﬁ≈_˙”∫|…π≈÷jë§Vv2’Jß:SÈä˚&€UÒZG÷¶"¿[Ã^u´oµG‡Ωıà¡0Ç2˝!5å-¯1ÑgÆ9®N >@Ø2>™Gd«P◊ú3‚ÑAí˜ÍcÑ=‘œ™œ˝ı]´º∑ñ*°Bñ$ölÃ*ÚÄ~F9¸‡Dà~à!{DIbC…∞H‚,ç·ΩÁ;Øh±ú£gÜ@…ÀÅÛ3ÛΩiÚ8^Ê˛>pdızÄTˇç⁄ë¨y2Û´Wö˘6∏!æÌ¥ÓÃﬂ˘†Ì;Ê‰íòÖ”5iq?¶…ãpı4ΩIºe;>ø·hÆ8í”˜L‚uÕÙVÈnõî◊èˆ|0˚z—ﬂ&∏Et…;ˆo{S"
v!4È–(WYË$¢Mﬁ◊Wx[9<@∑|ÄPu>ÏÓ ˚‘Û∂⁄"T+}¬µ?:226ãs7[L.dΩæ¶†[5OŸzyò!ˇ
é”ÂòŒF#Sj¸ˆ≠%÷89≥∆Ì]d∞ñê⁄\‘Y£πCiVÓ≥YÅAM ÊAÀZ"êÊ∑9;ÏPï.<√‰1Îbºí≥ŸZ;ˇ,Çä‡gF¡˜lwvËÀr2•F#÷AU6ÑŸÂ©∫ó$àº⁄’ß∫RsCì¢¶ıv‡ﬂÔç¬≈Sây’⁄àñÜÇÛø'ª‰E∫à
öG∆˙÷j†Be”8„ä´%Ö\`ª®Ä—î©EÖ¿íÖ!l™$å…KöØ£âñ‡‹MôÜ1ùF†Äx˚Hûâ‚£´OµÉB´zä‹WQf€–Ùõ% <æ¯Ò˘≈ÎS›(M5}∂’˛Ù/‹D¸k‚œñüPDÑìõˆË∑∫Ò6ñ Dj;…œ‘€J"óœRBe:Í~„,®]∆áH~ï®%‰◊4]¿o<£ÇeŒÄ)≠≈«Ì6sâ:À›^—6Êg()XöùÁüáÂ>Ÿ˚Ø†QôIU∂Ï≈◊}“˝4Û‚Ã˝ı?R*Ç∞‚˝∫Sçl˚ÎtëÊ∂÷Ú¿È’Àø‹ˆ;~UV<cúiuI¶<‹xvCøLÊºü©ø1è_›P h-‘p≈ﬁåuo6vÕûb·{ØNgßdÔdˇ‡¡—Ò∑']˜ob¶·◊F∆öÊV±ﬁ¬`µÕ5lS˜Å‚ﬂñ’Ü_Ïıß¢sæ07∏iñıªœ∑ÍAOÛø61’wV¶ œ;1€åºÅ∂%ﬂ÷ûcÒ¡“i#´µ¿k|Reÿ£Ôbô∫€õ]&:{Éªú£õ£™‰Ä
p„¿ê™é…Á•´ÑõGô ã}¨ûd_¸/	Q≥Ø•L249!íñÕäjı@ºÏÁ∫›êÊcJÎ9ù}j.m˜,ÿÓ9–˚Ëœˇ}xoæøœﬂ¢ÈﬂÉÛ8æﬂÄ·9òô∫Uèk[MêósK†–ÎAıód€ƒ»/˚Üæ‚Y˚Lˆø”æﬁ¥æÃü◊&Ù–aΩL“Ä;§Mö7Œæâƒoi˛-cµB-Ô˜FO>¥m≠ñ ©&U°óÌ†óˆo’˝;π2˛ös0ölÂÜ˙©ªùf=—˙ö6êhz¸÷Àπ¢ì	y¶sÉÅ´i∑Ôõ}]Î˜Û–j	ËﬂA !∂t≥1ú =ô‹¯¬ë+ïveî†sôD6[ä=
º©µXµHFﬁÇw©<ÏëS§<^aPˆç–vŸ—N∑liœ}çΩ˛,ﬂ»™//˛‚úÿv
p¥´'≥xïµØùñáíMì>æ(/}˛¥Ü∏!ª§ÚëYh∂_÷GÕL€wqSÖóV≈û»PÂo¢`T,«<¶|∞wüúXÀˆÃX—ÒŸ}‚¶ﬁı**ÄN…À(ô∑¸lò·]π√’A”(~4*≤8*;ˇ∏sÔ˝ﬁÁy≤Â‡™˝Ê.=%Lì)'©ò2;π¸XßÅy8[˘ö<M6´»±l≠n•|≈ÀúUJ.Ú·˛1¸*Òó|F–™É∂‰÷¯ø^TõÔlJÏƒ¨Ω≥≤K®uò¢ïp˙€p	1€à6ö#W`^M-ÅhÈ≠=¨i†® çO}†∑9”€0zeºµÃ¶Iäs8§~§#[ÂÀp=Sj,oæÃÏP…kõÂZ…„Äe¨.—£f≠`Ñ(Ÿuñ®JäoV1qPpsJU˝My1∞äÓy˜nˇh.cÉ»Yq∂.ÏùhHÿÃ≠®ì_ê4E‚/bYn@òN±¨m∞ﬁØ
éJ©Æ˝d'GMaﬂB.õ@iò&çÂÑ¥ÅÌ˛≈íYÍH≠’À–Laù7a}˜»˜∂é»’3}çﬁ§ë÷ØÍUqÇ≠lÉ!YÃ`ÀŒá&r:√¯óˆ‘ÿÙ˝˛~-ƒ’Äaµ◊ÿ™á&‚ıÉh∫LixêÃÛ4â
=ë ü«"mDﬁ“Çïz'â!s:•9Y`ıFÌÉh∂/ìiƒk[4G…√ZÍ5•fÏÊóÈ4]ñU˙rî≈)ú:gÉﬂEÁ∫‚ï4~ÛdB;Ì∆<d´°R≠Ω[ü]ÖFÆ•œÉ6f∏«ßCúÙh fSÉ'ÙjøÇröÖÑŸ{≥t ^Ñ@•ù)÷QsÆËçÓG*´Å≤DEÏ¢LáõÂüåÿ"Ü
 ´≈ät
vc‹xFc∫@Ó√c˘ÉàAc~\“ŸÙ˙Yo«jÚ!ß=Åj`Î5¨uTRm”‡≤<…≥t∂à¨Kz-˛$\ÿ≥[∂"U¬;ñ∏Çi»WO√§M∆E∞™Ø‰íaXr5Ä'oLW-D9÷í?5†+"aúV7¸^jRï–tL∆RÌz≠¸	<‹eÈÀûÛ)
oÄ›T8≠oÈ
6nô‰ÄH_	ÛXÆÃ.‡∑EyÂÌ™0ØÙ˙œƒ˜
∆n†võÑ&+Ù≈±-(√˛–ˇ≠◊j‘iT⁄Ôπ™ wy>V√Íß“XˇR}ˆﬁ÷ÃºKKFk’$˝é-wu?´…AæQ˙'»¨≈9:\#ôY8Ù‹{x˘˜y"êÔjcø√vÚ42õÜƒ¨«¯”"¸›'Û†ÙßÖ˘c-[ΩÄøˆ‘‚.\É7’pÖctú'F¯!PïßIg»ówÆ⁄|eÄ».Ô®Z§Õ›¡cn˙K∞°ÙYeÂ£QÄ*ã›§*™¬é5yÑWqîqÀÕ3öG-∏¢Ó©ßI{:T”ûPwîôËSÿ≠)0’ôdgÂ5Wçµ™ööˆˆ€	uì®ºÌûÜŒ=zJﬁ^¸q∏V¶fHÃÀΩ™®ÁqßüôÊ‡wlÏ*%‚ƒ±Éµf»D=1ÉÉ:Ò]Y*æ™Í√;∏yL÷#i¨Cd2ﬂö9⁄ºòáF˚–Z9˚y»hå	>ZÖÛÃ„˙øˇ¸è'/ñ…«%Í¡uv®'¿√µï(Ü—b)∆™⁄˝£&Åßh–Àx 3˚*º˛Â™}Xi∑«ry9^˜çû¿é9ÓÜô gÏßRÏ¨ÂÒÉø3Y˚ˆÕx¢L†f.∆˙lTJ˛Áø◊Øh9±N3nM'p“…
IgÔﬁÌ¬`È3ô70ıŸó™Êƒja˛ì—•∞ã•IjLpÉÕˆFõ_”üôÙ
˜)ãi9t˘’Æıhh÷© ©oxk+u˘øˇˆ_Ê/ª5-=y‘‘@4¥¿ÀR˝“ÏôŸlÒÚúEº<g/mπ9º‡Ó·t®˜~ﬂ’∏k÷b¯¿Àyâg'®‚+@XøéP≥{EA≥oõ9Ω§ç¿VAhoª¥[1ïÜàß(RªèM ¿–]∏ã‰S∞˛î«Dq3"Æ¨~∞?—u¨ÛñÔkC=p.üÁÓ◊tEI;‡X¥ÃΩœxÍK™ºÍ“§˚›Ãj≠aòkYf>™.◊”Ù|M‘Û◊[<R<h‡:ß]ç @9;ﬂJ˚›⁄ÃB<ûÃﬂ≥«>f√>ﬂ—ÆnQÆbf#‡ì£) ⁄!=˛R!:/hVå¶i:ç√—$]∞ˇ˝Î˘Wåba∞∑˜≈ü…ÙˆÎ_œ˜OæNóe∂,œ√≈8¥≈ViõÔ†]n¢Ó¥¯Ólóœ“(éØ¸√-Pú;Ÿ÷ê„©%:`^X2jæU~ÈØm-q__«P´ºôΩ˘"]diA€Çf¢:ßç◊÷ÙÍJ?T≠]âQ¬ç©¶^iá≈,%o”y:◊ŸK¯8Ù≤ØΩZ».∂k˚qô1Ÿç†˛—˙Æ}·â˜R≠Ù¯V€Z4–‚Åë-s2Xw, ∑u‚íEÅëÏ∑w“°)ZÕ†˛¯“Ü\%[◊ªﬂYB°÷ó9ΩG`–ó%•≤A¨˜´N¨ù?æ5Ô.Ì¸qƒSËw‹€8([ºÿ“¨_`!¥gé›âŸ◊∆Æç(x`ˆlZµUâGSfÆAYÈ–û≈wÀrôëÀ(ôt„N´Œˇ-5an¡ÆÔUä›–y]£vpáŒÎ⁄◊Ã À¶Æ$&Ã¥›a2àÕ5ÿoÇM/w[=¯kË„4Ì[U≤¬œQÈ˝d´óçÎòË ‰Ó5π x…ÀfJ
ëÇ+!Ô»œwÉq”3¸!EÈ419≤yΩ2UÁ⁄*(¬-∂°ƒ√t
òwM◊–¶Ûı@ Î irqà(á”⁄ônö™Zw#€ ÜßèéúAmù”èd[QË0P/÷„ûÛ‡† ƒCò5LZxƒÕhæ,Äb
Í∆„7x‡€KP±íﬁXR{‘êŒüc¶≠—‰œ‘∂êÂÀ˝ªezHŸß¥r”wC˜-Æ}∞∑◊í›6<Ú6ÛøÀÔb$úµˆπ≥#XÊ¥õä,C{∫ı':& ÌR‘<BçÎ€JeÚº[òºz›n7´£ΩB°z⁄≤«w¨q√kπ«œuÂÓ@ UIõ+∆T¿Ï¡YáGcSà`*Ë≈©öw”|Æ7◊"¿ãΩu–d;¢≠ñQ"æ{ƒ”U!ôg≈}/°Só!-“Ñ5‹”|èÍë˛€ã≤Ñﬂ4ôÑRhYß’ì<‰Ëh’7yE:µ7π™˙£Õ[ç-·yKˇúÊsx∂∂—Û‰–aöØÙ_ø£≈\ˇMUÿ˝mb@öæ—?-”íâH˙Ø/C†ï¿‘µN∞^wUF”ZÚ◊@»◊—ÑΩõ<·;≠YÙ3˘k˛mΩ	¢y÷˘∫ò•7r3) 4ë?>_'˙V»1ÅO»∫F˚ëù”&äÊÛã´Ò‘¨6
NEeú”Ì√·<5_Ö˘ßhéxÕ˜j±;JgwÓì(Ë:r"ˆ~]m{À≈Vh¶UVÊVDÜÄƒªvÆÃ Ü‹aY]aÒffn’âi~«Ê”®;1XHk¿ıˆví^´ŸûAΩÑ5¡¢æö√Æ=◊œ∂Ãu˝¨Œ!˜”MÒßGúÁ‰6ı%q1Xu+Iå≥®ÄsT∞[ΩNÜˆÔcw\kfÆöá∫bd˙‰n.
Íì©ü§ºqƒ˛≤‚õÿøçBwÿ2¢lª˛ü√<ΩÛ›∫ƒô}ú∑ä†¨⁄Çw‘ü¡ﬂ˛Êˇ  ˇˇ Ÿ,»