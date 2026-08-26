import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Coins,
  Search,
  Filter,
  ArrowLeft,
  Briefcase,
  User,
  Calendar,
  Wallet,
  CheckCircle,
  FileText,
  AlertCircle,
  Users2,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  Info,
  DollarSign,
  Receipt,
  Clock,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight
} from "lucide-react";
import {
  calculateKasbonBalances,
  extractKasbonRecipient,
  EmployeeKasbonSummary,
  KasbonItem
} from "../utils/kasbonHelper";

interface AdminKasbonScreenProps {
  financialRecords: any[];
  debtRecords: any[];
  projects: any[];
  onNavigate: (view: string) => void;
  user: any;
  roles: any;
  logActivity: (module: string, action: string, details: string) => Promise<void>;
}

const formatCurrencyIDR = (val: number) => {
  return "Rp " + (val || 0).toLocaleString("id-ID");
};

export default function AdminKasbonScreen({
  financialRecords,
  debtRecords,
  projects,
  onNavigate,
  user,
  roles,
  logActivity
}: AdminKasbonScreenProps) {
  // Default to SALDO_PEGAWAI (Employee Balances Summary) as requested by user
  const [activeTab, setActiveTab] = useState<"SALDO_PEGAWAI" | "TRANSAKSI">("SALDO_PEGAWAI");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("ALL");
  const [filterSource, setFilterSource] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "UNPAID" | "PARTIAL" | "PAID">("ALL");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [expandedEmployees, setExpandedEmployees] = useState<{ [name: string]: boolean }>({});

  const toggleExpandEmployee = (name: string) => {
    setExpandedEmployees((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Extract known personnel from projects and records
  const knownPersonnel = useMemo(() => {
    const names = new Set<string>();
    (projects || []).forEach((p) => {
      (p.personnel || []).forEach((pers: any) => {
        if (typeof pers === "string" && pers.trim()) names.add(pers.trim());
        else if (pers && pers.name) names.add(pers.name.trim());
      });
      (p.teamMembers || []).forEach((m: any) => {
        if (typeof m === "string" && m.trim()) names.add(m.trim());
        else if (m && m.name) names.add(m.name.trim());
      });
    });
    return Array.from(names);
  }, [projects]);

  // Calculate structured balances
  const kasbonLedger = useMemo(() => {
    return calculateKasbonBalances(financialRecords, debtRecords, knownPersonnel);
  }, [financialRecords, debtRecords, knownPersonnel]);

  const {
    employeeSummaries,
    allBorrowItems,
    allRepayments,
    totalKasbon,
    totalRepaid,
    totalRemaining
  } = kasbonLedger;

  // Filtered employee summaries
  const filteredEmployeeSummaries = useMemo(() => {
    return employeeSummaries.filter((emp) => {
      const matchesSearch =
        !searchQuery ||
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.borrowRecords.some(
          (b) =>
            b.customId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus =
        filterStatus === "ALL" || emp.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [employeeSummaries, searchQuery, filterStatus]);

  // Filtered raw borrow transactions
  const filteredBorrowItems = useMemo(() => {
    return allBorrowItems.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.recipientName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.customId.toLowerCase().includes(q) ||
        (item.pemilikUangPribadi || "").toLowerCase().includes(q);

      const matchesStatus =
        filterStatus === "ALL" || item.status === filterStatus;

      const matchesSource =
        filterSource === "ALL" || item.sumberDana === filterSource;

      const matchesProject =
        filterProject === "ALL" || item.referenceId === filterProject;

      return matchesSearch && matchesStatus && matchesSource && matchesProject;
    });
  }, [allBorrowItems, searchQuery, filterStatus, filterSource, filterProject]);

  // Project lookup
  const getProjectName = (projId?: string) => {
    if (!projId) return "-";
    const proj = projects.find((p) => p.id === projId);
    return proj ? proj.name : projId;
  };

  // Active project list
  const activeProjects = useMemo(() => {
    const ids = new Set(allBorrowItems.map((r) => r.referenceId).filter(Boolean));
    return projects.filter((p) => ids.has(p.id) || p.status !== "Completed");
  }, [projects, allBorrowItems]);

  const selectedEmployeeData = useMemo(() => {
    if (!selectedEmployee) return null;
    return employeeSummaries.find((emp) => emp.name === selectedEmployee);
  }, [employeeSummaries, selectedEmployee]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("admin-finance")}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
                <Coins size={14} className="animate-pulse" />
              </span>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                Data Kasbon &amp; Potongan Gaji Pegawai
              </p>
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                📅 Rekap Aktif: Mulai 13 Agustus 2026
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Monitor Kasbon Staff
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("admin-finance")}
            className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Wallet size={14} />
            Kembali ke Keuangan
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm flex items-start justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Total Kasbon Dipinjam
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900">
              {formatCurrencyIDR(totalKasbon)}
            </h3>
            <p className="text-[9px] text-slate-400 font-bold">
              {allBorrowItems.length} transaksi kasbon terekam
            </p>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Coins size={20} />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm flex items-start justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Total Terpotong / Terbayar
            </span>
            <h3 className="text-xl md:text-2xl font-black text-emerald-600">
              {formatCurrencyIDR(totalRepaid)}
            </h3>
            <p className="text-[9px] text-emerald-600 font-bold">
              Dipotong dari gaji / setoran tunai
            </p>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle size={20} />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm flex items-start justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Sisa Kasbon Belum Lunas
            </span>
            <h3 className="text-xl md:text-2xl font-black text-rose-600">
              {formatCurrencyIDR(totalRemaining)}
            </h3>
            <p className="text-[9px] text-rose-600 font-bold">
              Saldo aktif yang belum terpotong
            </p>
          </div>
          <span className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <TrendingDown size={20} />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm flex items-start justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Pegawai Terkait
            </span>
            <h3 className="text-xl md:text-2xl font-black text-indigo-700">
              {employeeSummaries.length} Orang
            </h3>
            <p className="text-[9px] text-indigo-600 font-black">
              {employeeSummaries.filter((e) => e.remaining > 0).length} memiliki sisa kasbon
            </p>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users2 size={20} />
          </span>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 mb-6 gap-2">
        <button
          onClick={() => {
            setActiveTab("SALDO_PEGAWAI");
            setSelectedEmployee(null);
          }}
          className={`px-6 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "SALDO_PEGAWAI" && !selectedEmployee
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users2 size={16} />
          Rangkuman Saldo Kasbon Pegawai
        </button>
        <button
          onClick={() => {
            setActiveTab("TRANSAKSI");
            setSelectedEmployee(null);
          }}
          className={`px-6 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "TRANSAKSI" && !selectedEmployee
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText size={16} />
          Riwayat Semua Transaksi Kasbon ({allBorrowItems.length})
        </button>
      </div>

      {/* Tab Contents */}
      {selectedEmployeeData ? (
        /* Detailed Employee Kasbon Statement View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-100 rounded-[32px] shadow-sm p-6 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1 uppercase tracking-wider mb-2 cursor-pointer"
              >
                ← Kembali ke Rangkuman Pegawai
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                  {selectedEmployeeData.name[0]}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900">
                    Buku Besar Kasbon: {selectedEmployeeData.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold">
                    Rincian pinjaman kasbon dan riwayat pemotongan gaji / pelunasan
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="bg-slate-50 border border-slate-100 p-3 px-5 rounded-2xl">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">
                  Total Kasbon
                </span>
                <span className="text-sm font-extrabold text-slate-800">
                  {formatCurrencyIDR(selectedEmployeeData.totalBorrowed)}
                </span>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 p-3 px-5 rounded-2xl">
                <span className="text-[9px] font-black text-emerald-600 block uppercase tracking-wider">
                  Total Terpotong
                </span>
                <span className="text-sm font-extrabold text-emerald-700">
                  {formatCurrencyIDR(selectedEmployeeData.totalRepaid)}
                </span>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-3 px-5 rounded-2xl">
                <span className="text-[9px] font-black text-rose-600 block uppercase tracking-wider">
                  Sisa Kasbon
                </span>
                <span className="text-sm font-black text-rose-700">
                  {formatCurrencyIDR(selectedEmployeeData.remaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Individual Borrow Transactions */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <Coins size={14} className="text-indigo-600" />
              Daftar Pinjaman Kasbon ({selectedEmployeeData.borrowRecords.length} Catatan)
            </h4>
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-3.5">ID Kasbon</th>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5">Keterangan / Keperluan</th>
                    <th className="p-3.5">Sumber Dana</th>
                    <th className="p-3.5 text-right">Jumlah Pinjaman</th>
                    <th className="p-3.5 text-right">Terpotong</th>
                    <th className="p-3.5 text-right">Sisa Belum Lunas</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {selectedEmployeeData.borrowRecords.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-mono font-bold text-indigo-700">
                        {b.customId}
                      </td>
                      <td className="p-3.5 font-bold text-slate-600">{b.date}</td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {b.description}
                        {b.referenceId && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            Proyek: {getProjectName(b.referenceId)}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600 font-semibold">
                        {b.sumberDana}
                        {b.pemilikUangPribadi && (
                          <span className="text-[10px] text-amber-600 block">
                            (Dana PIC: {b.pemilikUangPribadi})
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-900">
                        {formatCurrencyIDR(b.amount)}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-emerald-600">
                        {formatCurrencyIDR(b.repaidAmount)}
                      </td>
                      <td className="p-3.5 text-right font-black text-rose-600">
                        {formatCurrencyIDR(b.remainingAmount)}
                      </td>
                      <td className="p-3.5 text-center">
                        {b.status === "PAID" ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-black uppercase">
                            Lunas
                          </span>
                        ) : b.status === "PARTIAL" ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] font-black uppercase">
                            Sebagian
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[9px] font-black uppercase">
                            Belum Lunas
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Repayments & Salary Deductions History */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-600" />
              Riwayat Potongan Gaji &amp; Pelunasan ({selectedEmployeeData.repaymentRecords.length} Catatan)
            </h4>
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50/40 border-b border-emerald-100 text-[9px] font-black text-emerald-800 uppercase tracking-widest">
                    <th className="p-3.5">ID Transaksi</th>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5">Keterangan Pemotongan</th>
                    <th className="p-3.5">Target Kasbon</th>
                    <th className="p-3.5 text-right">Nilai Potongan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {selectedEmployeeData.repaymentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                        Belum ada riwayat potongan gaji atau pelunasan kasbon
                      </td>
                    </tr>
                  ) : (
                    selectedEmployeeData.repaymentRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-emerald-50/20">
                        <td className="p-3.5 font-mono font-bold text-slate-700">
                          {r.customId}
                        </td>
                        <td className="p-3.5 font-bold text-slate-600">{r.date}</td>
                        <td className="p-3.5 font-bold text-slate-800">{r.description}</td>
                        <td className="p-3.5 font-semibold text-indigo-600">
                          {r.targetKasbonId || "Alokasi Otomatis (FIFO)"}
                        </td>
                        <td className="p-3.5 text-right font-black text-emerald-600">
                          - {formatCurrencyIDR(r.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      ) : activeTab === "SALDO_PEGAWAI" ? (
        /* Tab 1: Staff Balance Summary View (Primary / Default) */
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama pegawai, ID kasbon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-extrabold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status (Lunas &amp; Belum)</option>
                  <option value="UNPAID">Belum Terpotong (Masih Utuh)</option>
                  <option value="PARTIAL">Sebagian Terpotong</option>
                  <option value="PAID">Lunas Terpotong</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards & Tables of Employee Kasbon Balances */}
          <div className="grid grid-cols-1 gap-4">
            {filteredEmployeeSummaries.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center text-slate-400 font-bold shadow-sm">
                Belum ada data kasbon pegawai yang sesuai dengan pencarian
              </div>
            ) : (
              filteredEmployeeSummaries.map((emp) => {
                const isExpanded = Boolean(expandedEmployees[emp.name]);
                return (
                  <motion.div
                    key={emp.name}
                    layout
                    className="bg-white border border-slate-100 rounded-[28px] shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Main Row Header */}
                    <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start md:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                          {emp.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-base md:text-lg font-black text-slate-900">
                              {emp.name}
                            </h3>
                            {emp.status === "PAID" ? (
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                                Lunas Terpotong
                              </span>
                            ) : emp.status === "PARTIAL" ? (
                              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-black uppercase">
                                Sebagian Terpotong
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-black uppercase">
                                Belum Terpotong
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {emp.borrowRecords.length} Pinjaman Kasbon &bull; {emp.repaymentRecords.length} Riwayat Potongan
                          </p>
                        </div>
                      </div>

                      {/* Balances Block */}
                      <div className="flex flex-wrap items-center gap-3 lg:gap-6 bg-slate-50/70 p-3 px-4 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">
                            Total Kasbon
                          </span>
                          <span className="text-xs md:text-sm font-extrabold text-slate-800">
                            {formatCurrencyIDR(emp.totalBorrowed)}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                        <div>
                          <span className="text-[9px] font-black text-emerald-600 block uppercase tracking-wider">
                            Terpotong / Terbayar
                          </span>
                          <span className="text-xs md:text-sm font-extrabold text-emerald-600">
                            {formatCurrencyIDR(emp.totalRepaid)}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                        <div>
                          <span className="text-[9px] font-black text-rose-600 block uppercase tracking-wider">
                            Sisa Kasbon
                          </span>
                          <span className="text-xs md:text-base font-black text-rose-600">
                            {formatCurrencyIDR(emp.remaining)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleExpandEmployee(emp.name)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{isExpanded ? "Tutup ID" : "Lihat ID Kasbon"}</span>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <button
                          onClick={() => setSelectedEmployee(emp.name)}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>Buku Besar</span>
                          <FileText size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Breakdown of Individual Kasbon IDs */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-100 bg-slate-50/50 p-5 md:p-6 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                              Rincian Transaksi Kasbon &amp; Alokasi Potongan untuk {emp.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-bold">
                              * Saat Gaji dicatat, potongan kasbon akan dialokasikan ke ID berikut
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {emp.borrowRecords.map((b) => (
                              <div
                                key={b.id}
                                className={`p-4 rounded-2xl border transition-all ${
                                  b.status === "PAID"
                                    ? "bg-emerald-50/40 border-emerald-200/70"
                                    : b.status === "PARTIAL"
                                    ? "bg-amber-50/40 border-amber-200/70"
                                    : "bg-white border-slate-200/80 shadow-sm"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                    {b.customId}
                                  </span>
                                  {b.status === "PAID" ? (
                                    <span className="text-[9px] font-black text-emerald-700 uppercase bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                      Lunas
                                    </span>
                                  ) : b.status === "PARTIAL" ? (
                                    <span className="text-[9px] font-black text-amber-700 uppercase bg-amber-100/70 px-2 py-0.5 rounded-md">
                                      Sisa Sebagian
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black text-rose-700 uppercase bg-rose-100/70 px-2 py-0.5 rounded-md">
                                      Belum Lunas
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs font-bold text-slate-800 line-clamp-2 mb-2">
                                  {b.description}
                                </div>

                                <div className="space-y-1 text-[11px] font-bold border-t border-slate-100/80 pt-2">
                                  <div className="flex justify-between text-slate-500">
                                    <span>Tgl Pinjam:</span>
                                    <span className="text-slate-800">{b.date}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-500">
                                    <span>Jumlah Asli:</span>
                                    <span className="text-slate-800">{formatCurrencyIDR(b.amount)}</span>
                                  </div>
                                  <div className="flex justify-between text-emerald-600">
                                    <span>Terpotong:</span>
                                    <span className="font-extrabold">{formatCurrencyIDR(b.repaidAmount)}</span>
                                  </div>
                                  <div className="flex justify-between text-rose-600 font-black text-xs pt-1 border-t border-slate-100">
                                    <span>Sisa Kasbon:</span>
                                    <span>{formatCurrencyIDR(b.remainingAmount)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Raw Transactions Tab */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama, keperluan, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap w-full md:w-auto items-stretch sm:items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-extrabold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status Pelunasan</option>
                  <option value="UNPAID">Belum Lunas (Belum Ada Potongan)</option>
                  <option value="PARTIAL">Sebagian Terpotong</option>
                  <option value="PAID">Lunas Terpotong</option>
                </select>
              </div>

              {/* Sumber Dana Filter */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="bg-transparent border-none text-xs font-extrabold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Sumber Dana</option>
                  <option value="REKENING PT">REKENING PT</option>
                  <option value="REKENING PRIBADI">REKENING PRIBADI</option>
                </select>
              </div>

              {/* Project Filter */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                <Briefcase size={14} className="text-slate-400" />
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="bg-transparent border-none text-xs font-extrabold text-slate-700 outline-none cursor-pointer max-w-[160px]"
                >
                  <option value="ALL">Semua Proyek</option>
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Table Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                Daftar Riwayat Kasbon ({filteredBorrowItems.length} Transaksi)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/40">
                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      ID Kasbon
                    </th>
                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Tanggal &amp; Project
                    </th>
                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Penerima Kasbon (Pegawai)
                    </th>
                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Sumber Dana
                    </th>
                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Keperluan / Deskripsi
                    </th>
                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Jumlah Kasbon
                    </th>
                    <th className="p-4 text-[9px] font-black text-emerald-600 uppercase tracking-widest text-right">
                      Terpotong
                    </th>
                    <th className="p-4 text-[9px] font-black text-rose-600 uppercase tracking-widest text-right">
                      Sisa Kasbon
                    </th>
                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBorrowItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-xs text-slate-400 font-bold">
                        Belum ada data transaksi kasbon terekam
                      </td>
                    </tr>
                  ) : (
                    filteredBorrowItems.map((r) => {
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-4 font-mono text-xs font-bold text-indigo-700">
                            {r.customId || "TRA-"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <Calendar size={12} className="text-slate-400" />
                              {r.date}
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold mt-1 max-w-[150px] truncate">
                              {getProjectName(r.referenceId)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-black text-xs uppercase">
                                {r.recipientName[0]}
                              </div>
                              <span className="text-xs font-black text-slate-800">
                                {r.recipientName}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                r.sumberDana === "REKENING PRIBADI"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-slate-50 text-slate-600 border border-slate-100"
                              }`}
                            >
                              {r.sumberDana || "REKENING PT"}
                            </span>
                            {r.sumberDana === "REKENING PRIBADI" && (
                              <div className="text-[10px] font-bold text-indigo-600 mt-1">
                                Pakai uang: <span className="font-extrabold">{r.pemilikUangPribadi || "-"}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-xs font-extrabold text-slate-700 max-w-xs leading-relaxed">
                            {r.description}
                          </td>
                          <td className="p-4 text-xs font-black text-slate-900 text-right">
                            {formatCurrencyIDR(r.amount)}
                          </td>
                          <td className="p-4 text-xs font-extrabold text-emerald-600 text-right">
                            {formatCurrencyIDR(r.repaidAmount)}
                          </td>
                          <td className="p-4 text-xs font-black text-rose-600 text-right">
                            {formatCurrencyIDR(r.remainingAmount)}
                          </td>
                          <td className="p-4 text-center">
                            {r.status === "PAID" ? (
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Lunas
                              </span>
                            ) : r.status === "PARTIAL" ? (
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                Sebagian
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                                Belum Lunas
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
