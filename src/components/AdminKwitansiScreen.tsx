import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  ChevronLeft,
  Eye,
  CheckCircle,
  Building2,
  Calendar,
  Receipt,
  DollarSign,
  User,
  MapPin,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { dbService } from "../services/db";
import { KwitansiRecord, Invoice, Client, ScreenId } from "../types";

export const numberToWordsId = (n: number): string => {
  const units = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];
  const num = Math.floor(Math.abs(n));
  if (num < 12) return units[num];
  if (num < 20) return `${numberToWordsId(num - 10)} Belas`;
  if (num < 100)
    return `${numberToWordsId(Math.floor(num / 10))} Puluh ${units[num % 10]}`.trim();
  if (num < 200) return `Seratus ${numberToWordsId(num - 100)}`.trim();
  if (num < 1000)
    return `${numberToWordsId(Math.floor(num / 100))} Ratus ${numberToWordsId(num % 100)}`.trim();
  if (num < 2000) return `Seribu ${numberToWordsId(num - 1000)}`.trim();
  if (num < 1000000)
    return `${numberToWordsId(Math.floor(num / 1000))} Ribu ${numberToWordsId(num % 1000)}`.trim();
  if (num < 1000000000)
    return `${numberToWordsId(Math.floor(num / 1000000))} Juta ${numberToWordsId(num % 1000000)}`.trim();
  if (num < 1000000000000)
    return `${numberToWordsId(Math.floor(num / 1000000000))} Miliar ${numberToWordsId(num % 1000000000)}`.trim();
  return `${numberToWordsId(Math.floor(num / 1000000000000))} Triliun ${numberToWordsId(num % 1000000000000)}`.trim();
};

export const AdminKwitansiScreen: React.FC<{
  onNavigate: (s: ScreenId) => void;
  currentUser: any;
  invoices?: Invoice[];
  clients?: Client[];
  selectedInvoiceForKwitansi?: any;
  setSelectedInvoiceForKwitansi?: (inv: any) => void;
  logActivity?: (mod: string, act: string, desc: string) => Promise<void>;
}> = ({
  onNavigate,
  currentUser,
  invoices = [],
  clients = [],
  selectedInvoiceForKwitansi,
  setSelectedInvoiceForKwitansi,
  logActivity,
}) => {
  const [view, setView] = useState<"list" | "form">("list");
  const [kwitansiList, setKwitansiList] = useState<KwitansiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selection
  const [selectedKwitansi, setSelectedKwitansi] = useState<KwitansiRecord | null>(null);

  // Form States
  const [kwitansiNumber, setKwitansiNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [receivedFrom, setReceivedFrom] = useState("");
  const [amount, setAmount] = useState<string | number>("");
  const [terbilang, setTerbilang] = useState("");
  const [forPayment, setForPayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"TRANSFER" | "CASH">("TRANSFER");
  const [city, setCity] = useState("Bekasi");
  const [recipientName, setRecipientName] = useState(currentUser?.name || "FAISAL MUSTOPA");
  const [recipientRole, setRecipientRole] = useState("Staf Administrasi Keuangan");
  const [approvedBy, setApprovedBy] = useState("MUHAMMAD YASIN");
  const [approvedByRole, setApprovedByRole] = useState("Direktur Utama");
  const [companyName, setCompanyName] = useState("PT GARDA INOVASI GLOBALTECH");
  const [companyAddress, setCompanyAddress] = useState(
    "M-Gold Tower, Lantai 16, Jl. KH. Noer Ali, Bekasi, Jawa Barat | Email: info@gig.co.id"
  );
  const [linkedInvoiceNumber, setLinkedInvoiceNumber] = useState("");
  const [status, setStatus] = useState<"LUNAS" | "DRAFT">("LUNAS");

  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Generate next Kwitansi number
  const generateKwitansiNumber = (existing: KwitansiRecord[] = kwitansiList) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const count = existing.length + 1;
    return `KWT-${year}/${month}/${String(count).padStart(3, "0")}`;
  };

  // Listen to kwitansi collection
  useEffect(() => {
    setLoading(true);
    const unsubscribe = dbService.onCollectionSnapshot<KwitansiRecord>(
      "kwitansi",
      (data) => {
        const sorted = [...data].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setKwitansiList(sorted);
        setLoading(false);
      },
      [],
      (err) => {
        console.warn("Kwitansi snapshot err:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle incoming invoice selection to build Kwitansi
  useEffect(() => {
    if (selectedInvoiceForKwitansi) {
      const inv = selectedInvoiceForKwitansi;
      const numAmt = inv.amount || 0;
      const autoNum = generateKwitansiNumber();
      setKwitansiNumber(autoNum);
      setDate(new Date().toISOString().split("T")[0]);
      setReceivedFrom(inv.clientName || inv.client || "");
      setAmount(numAmt);
      setTerbilang(numAmt > 0 ? `${numberToWordsId(numAmt)} Rupiah` : "");
      setForPayment(
        `Pembayaran tagihan Invoice No. ${inv.invoiceNumber || inv.id}${
          inv.jobName ? ` untuk pekerjaan ${inv.jobName}` : ""
        }`
      );
      setLinkedInvoiceNumber(inv.invoiceNumber || "");
      setStatus("LUNAS");
      setSelectedKwitansi(null);
      setView("form");
      setSelectedInvoiceForKwitansi?.(null);
    }
  }, [selectedInvoiceForKwitansi]);

  // Update terbilang when amount changes
  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setTerbilang(`${numberToWordsId(num)} Rupiah`);
    } else {
      setTerbilang("");
    }
  };

  const initNewKwitansi = () => {
    setSelectedKwitansi(null);
    setKwitansiNumber(generateKwitansiNumber());
    setDate(new Date().toISOString().split("T")[0]);
    setReceivedFrom("");
    setAmount("");
    setTerbilang("");
    setForPayment("");
    setPaymentMethod("TRANSFER");
    setCity("Bekasi");
    setRecipientName(currentUser?.name || "FAISAL MUSTOPA");
    setRecipientRole("Staf Administrasi Keuangan");
    setApprovedBy("MUHAMMAD YASIN");
    setApprovedByRole("Direktur Utama");
    setLinkedInvoiceNumber("");
    setStatus("LUNAS");
    setView("form");
  };

  const handleEditKwitansi = (k: KwitansiRecord) => {
    setSelectedKwitansi(k);
    setKwitansiNumber(k.kwitansiNumber);
    setDate(k.date || new Date().toISOString().split("T")[0]);
    setReceivedFrom(k.receivedFrom);
    setAmount(k.amount);
    setTerbilang(k.terbilang || (k.amount > 0 ? `${numberToWordsId(k.amount)} Rupiah` : ""));
    setForPayment(k.forPayment);
    setPaymentMethod(k.paymentMethod || "TRANSFER");
    setCity(k.city || "Bekasi");
    setRecipientName(k.recipientName || "FAISAL MUSTOPA");
    setRecipientRole(k.recipientRole || "Staf Administrasi Keuangan");
    setApprovedBy(k.approvedBy || "MUHAMMAD YASIN");
    setApprovedByRole(k.approvedByRole || "Direktur Utama");
    setLinkedInvoiceNumber(k.invoiceNumber || "");
    setStatus(k.status || "LUNAS");
    setView("form");
  };

  const handleDeleteKwitansi = async (id: string, num: string) => {
    if (!window.confirm(`Hapus Kwitansi ${num}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await dbService.deleteDocument("kwitansi", id);
      triggerToast(`Kwitansi ${num} berhasil dihapus!`);
      if (logActivity) {
        await logActivity("KWITANSI", "DELETE", `Menghapus kwitansi No. ${num}`);
      }
    } catch (err) {
      triggerToast("Gagal menghapus kwitansi: " + String(err));
    }
  };

  const handleSaveKwitansi = async (e?: React.FormEvent, thenDownload: boolean = false) => {
    if (e) e.preventDefault();
    if (!receivedFrom.trim() || !amount || Number(amount) <= 0) {
      alert("Mohon lengkapi 'Telah Diterima Dari' dan 'Nominal Jumlah Uang' yang valid!");
      return;
    }

    const payload: Omit<KwitansiRecord, "id"> = {
      kwitansiNumber: kwitansiNumber.trim() || generateKwitansiNumber(),
      date,
      receivedFrom: receivedFrom.trim(),
      amount: Number(amount),
      terbilang: terbilang.trim() || `${numberToWordsId(Number(amount))} Rupiah`,
      forPayment: forPayment.trim(),
      paymentMethod,
      city,
      recipientName,
      recipientRole,
      approvedBy,
      approvedByRole,
      companyName,
      companyAddress,
      invoiceNumber: linkedInvoiceNumber,
      status,
      createdAt: selectedKwitansi?.createdAt || Date.now(),
    };

    try {
      let savedRecord: KwitansiRecord;
      if (selectedKwitansi?.id) {
        await dbService.updateDocument("kwitansi", selectedKwitansi.id, payload);
        savedRecord = { id: selectedKwitansi.id, ...payload };
        triggerToast(`Kwitansi ${payload.kwitansiNumber} berhasil diperbarui!`);
        if (logActivity) {
          await logActivity("KWITANSI", "UPDATE", `Memperbarui kwitansi No. ${payload.kwitansiNumber}`);
        }
      } else {
        const docRef = await dbService.createDocument("kwitansi", payload);
        const newId = typeof docRef === "string" ? docRef : (docRef as any)?.id || `kwt-${Date.now()}`;
        savedRecord = { id: newId, ...payload };
        setSelectedKwitansi(savedRecord);
        triggerToast(`Kwitansi ${payload.kwitansiNumber} berhasil disimpan!`);
        if (logActivity) {
          await logActivity("KWITANSI", "CREATE", `Menerbitkan kwitansi baru No. ${payload.kwitansiNumber} sebesar Rp ${Number(amount).toLocaleString("id-ID")}`);
        }
      }

      if (thenDownload) {
        generateKwitansiPDF(savedRecord);
      }
    } catch (err) {
      triggerToast("Gagal menyimpan kwitansi: " + String(err));
    }
  };

  // Generate authentic Indonesian Kwitansi PDF
  const generateKwitansiPDF = (record: KwitansiRecord) => {
    try {
      const doc = new jsPDF("l", "mm", "a5"); // Landscape A5 is standard for Indonesian receipts
      const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 148 mm

      // Outer Decorative Double Border
      doc.setDrawColor(30, 41, 59); // slate-800
      doc.setLineWidth(0.8);
      doc.rect(6, 6, pageWidth - 12, pageHeight - 12);

      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.3);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

      // Top Left: Company Identity
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(record.companyName || "PT GARDA INOVASI GLOBALTECH", 14, 17);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // slate-500
      const addr = record.companyAddress || "M-Gold Tower, Lantai 16, Bekasi, Jawa Barat | Email: info@gig.co.id";
      doc.text(addr, 14, 21.5);

      // Top Right: Document Title & Number Box
      doc.setFillColor(15, 23, 42);
      doc.rect(pageWidth - 85, 11, 75, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("KWITANSI PEMBAYARAN", pageWidth - 47.5, 16.5, { align: "center" });

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.4);
      doc.rect(pageWidth - 85, 19, 75, 7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`NO : ${record.kwitansiNumber}`, pageWidth - 47.5, 23.8, { align: "center" });

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 28, pageWidth - 14, 28);

      let currentY = 37;

      // 1. Telah Diterima Dari
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Telah Terima Dari", 14, currentY);
      doc.text(":", 48, currentY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(record.receivedFrom, 52, currentY);

      // Underline / dotted guide
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.line(51, currentY + 1.5, pageWidth - 14, currentY + 1.5);

      // 2. Uang Sejumlah (Terbilang)
      currentY += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Uang Sejumlah", 14, currentY);
      doc.text(":", 48, currentY);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(51, currentY - 5, pageWidth - 65, 8, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const terbilangStr = `# ${record.terbilang} #`;
      doc.text(terbilangStr, 54, currentY);

      // 3. Untuk Pembayaran
      currentY += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Untuk Pembayaran", 14, currentY);
      doc.text(":", 48, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const splitNotes = doc.splitTextToSize(record.forPayment || "-", pageWidth - 68);
      doc.text(splitNotes, 52, currentY);

      const noteLines = splitNotes.length;
      const noteH = noteLines * 4.5;
      doc.setDrawColor(203, 213, 225);
      doc.line(51, currentY + noteH, pageWidth - 14, currentY + noteH);

      // Bottom Row: Box Nominal (Left) & Signatures (Right)
      const bottomY = Math.max(currentY + noteH + 8, 76);

      // Large Nominal Box on Bottom Left
      doc.setFillColor(241, 245, 249); // slate-100
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.6);
      doc.rect(14, bottomY, 68, 16, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("TERBILANG :", 18, bottomY + 5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Rp ${record.amount.toLocaleString("id-ID")},-`, 18, bottomY + 12);

      // Metoda Pembayaran & Status
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text(`STATUS: LUNAS [${record.paymentMethod}]`, 18, bottomY + 20.5);

      // Signatures on Bottom Right
      const dateFormatted = new Date(record.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const sigX = pageWidth - 65;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`${record.city || "Bekasi"}, ${dateFormatted}`, sigX, bottomY - 3);

      doc.text("Yang Menerima,", sigX, bottomY + 2);

      // Signature Line
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.3);
      doc.line(sigX, bottomY + 23, sigX + 50, bottomY + 23);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(record.recipientName || "FAISAL MUSTOPA", sigX, bottomY + 27);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(record.recipientRole || "Staf Administrasi Keuangan", sigX, bottomY + 30.5);

      // Save PDF
      const cleanNum = record.kwitansiNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`Kwitansi_${cleanNum}_${record.receivedFrom.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch (err) {
      console.error("Gagal cetak PDF kwitansi:", err);
      alert("Terjadi kendala saat mencetak PDF kwitansi.");
    }
  };

  const filteredKwitansi = kwitansiList.filter((k) => {
    if (statusFilter !== "ALL" && k.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      k.kwitansiNumber.toLowerCase().includes(q) ||
      k.receivedFrom.toLowerCase().includes(q) ||
      k.forPayment.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {view === "list" ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Receipt className="text-emerald-600" size={28} />
                <span>Kwitansi &amp; Bukti Pembayaran</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Kelola dan cetak kwitansi resmi tanda terima pembayaran (terkoneksi langsung dengan Invoice).
              </p>
            </div>
            <button
              onClick={initNewKwitansi}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-slate-200 cursor-pointer active:scale-95 w-fit"
            >
              <Plus size={16} />
              <span>Buat Kwitansi Baru</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nomor kwitansi, nama pembayar, atau keterangan..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="LUNAS">LUNAS</option>
                <option value="DRAFT">DRAFT</option>
              </select>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 whitespace-nowrap">
                Total: <strong className="text-slate-900">{filteredKwitansi.length}</strong> Dokumen
              </span>
            </div>
          </div>

          {/* Table / List View */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-4 pl-6 text-center w-14">No</th>
                    <th className="p-4">No. Kwitansi</th>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Diterima Dari</th>
                    <th className="p-4">Untuk Pembayaran</th>
                    <th className="p-4 text-right">Jumlah Uang</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 pr-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400">
                        Memuat data kwitansi...
                      </td>
                    </tr>
                  ) : filteredKwitansi.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center">
                        <Receipt size={36} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 font-bold text-sm">Belum ada kwitansi yang dibuat.</p>
                        <p className="text-slate-400 text-xs mt-1">
                          Klik tombol "Buat Kwitansi Baru" atau luncurkan dari menu Invoice.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredKwitansi.map((k, idx) => (
                      <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-4">
                          <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {k.kwitansiNumber}
                          </span>
                          {k.invoiceNumber && (
                            <p className="text-[10px] text-indigo-600 font-bold mt-1">
                              Inv: {k.invoiceNumber}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {k.date}
                        </td>
                        <td className="p-4">
                          <p className="text-slate-900 font-black">{k.receivedFrom}</p>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="text-slate-600 text-xs line-clamp-2">{k.forPayment || "-"}</p>
                        </td>
                        <td className="p-4 text-right font-mono font-black text-emerald-600 text-sm whitespace-nowrap">
                          Rp {k.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                              k.status === "LUNAS"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {k.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => generateKwitansiPDF(k)}
                              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all font-sans text-xs font-bold flex items-center gap-1 cursor-pointer"
                              title="Cetak & Unduh PDF Kwitansi"
                            >
                              <Download size={13} />
                              <span>PDF</span>
                            </button>
                            <button
                              onClick={() => handleEditKwitansi(k)}
                              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all cursor-pointer"
                              title="Edit Kwitansi"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteKwitansi(k.id, k.kwitansiNumber)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Form / Builder View */
        <div className="space-y-6 pb-20">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              <ChevronLeft size={16} /> Kembali ke Daftar Kwitansi
            </button>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSaveKwitansi(undefined, false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle size={14} />
                <span>Simpan Kwitansi</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveKwitansi(undefined, true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5 shadow-emerald-200"
              >
                <Download size={14} />
                <span>Simpan &amp; Unduh PDF</span>
              </button>
            </div>
          </div>

          {/* Form Dokumen Kwitansi: Desain Sesuai Standar Kwitansi Indonesia */}
          <form
            onSubmit={(e) => handleSaveKwitansi(e, true)}
            className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-6 sm:p-10 space-y-7 text-left font-sans text-slate-900 max-w-4xl mx-auto relative overflow-hidden"
          >
            {/* Kop / Header Dokumen */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 size={20} className="text-emerald-600" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="font-black text-lg text-slate-900 outline-none bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-800"
                  />
                </div>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full text-xs font-medium text-slate-500 outline-none bg-transparent mt-1"
                />
              </div>
              <div className="text-right">
                <span className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest inline-block shadow-sm">
                  KWITANSI PEMBAYARAN
                </span>
              </div>
            </div>

            {/* Row: Nomor Kwitansi & Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Nomor Kwitansi
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={kwitansiNumber}
                    onChange={(e) => setKwitansiNumber(e.target.value)}
                    placeholder="Contoh: KWT-2026/07/001"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setKwitansiNumber(generateKwitansiNumber())}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 text-xs font-bold transition-all shrink-0 cursor-pointer"
                    title="Generate Nomor Otomatis"
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Tanggal Kwitansi
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Fields Utama Kwitansi */}
            <div className="space-y-5">
              {/* Sudah Terima Dari */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={14} className="text-emerald-600" />
                    <span>Telah Terima Dari (Received From):</span>
                  </label>
                  {clients.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) setReceivedFrom(e.target.value);
                      }}
                      className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 outline-none cursor-pointer"
                    >
                      <option value="">-- Pilih dari Daftar Klien --</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.company ? `(${c.company})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={receivedFrom}
                  onChange={(e) => setReceivedFrom(e.target.value)}
                  placeholder="Ketik nama klien, perusahaan, atau instansi penyetor..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-emerald-600 transition-all shadow-xs"
                />
              </div>

              {/* Jumlah Nominal Uang */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-600" />
                  <span>Jumlah Uang (Nominal Rp):</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-black text-slate-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-base font-mono font-black text-slate-900 outline-none focus:border-emerald-600 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Uang Sejumlah (Terbilang) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Uang Sejumlah (Terbilang Otomatis):</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">Otomatis terhitung dari nominal</span>
                </div>
                <input
                  type="text"
                  required
                  value={terbilang}
                  onChange={(e) => setTerbilang(e.target.value)}
                  placeholder="Contoh: Lima Puluh Juta Rupiah"
                  className="w-full px-4 py-3 bg-amber-50/50 border-2 border-amber-200 rounded-2xl text-xs font-black italic text-slate-800 outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Untuk Pembayaran */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-emerald-600" />
                    <span>Untuk Pembayaran (For Payment Of):</span>
                  </label>
                  {invoices.length > 0 && (
                    <select
                      onChange={(e) => {
                        const inv = invoices.find((i) => i.invoiceNumber === e.target.value);
                        if (inv) {
                          setLinkedInvoiceNumber(inv.invoiceNumber);
                          if (!receivedFrom) setReceivedFrom(inv.clientName);
                          if (!amount) handleAmountChange(String(inv.amount));
                          setForPayment(
                            `Pembayaran tagihan Invoice No. ${inv.invoiceNumber}${
                              inv.jobName ? ` untuk pekerjaan ${inv.jobName}` : ""
                            }`
                          );
                        }
                      }}
                      className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 outline-none cursor-pointer"
                    >
                      <option value="">-- Ambil dari Data Invoice --</option>
                      {invoices.map((inv) => (
                        <option key={inv.id} value={inv.invoiceNumber}>
                          {inv.invoiceNumber} - {inv.clientName} (Rp {inv.amount.toLocaleString("id-ID")})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  value={forPayment}
                  onChange={(e) => setForPayment(e.target.value)}
                  placeholder="Contoh: Pembayaran Termin 1 (Down Payment 50%) Pengadaan &amp; Pemasangan STP Biofilter sesuai Invoice No. INV-001..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 transition-all resize-none shadow-xs leading-relaxed"
                />
              </div>

              {/* Metode & Tempat Pembayaran */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="TRANSFER">Transfer Bank</option>
                    <option value="CASH">Tunai (Cash)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Kota Tempat Kwitansi
                  </label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status Kwitansi
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="LUNAS">LUNAS (Resmi)</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              {/* Pejabat Penandatangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Yang Mengetahui / Disetujui
                  </p>
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    placeholder="MUHAMMAD YASIN"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    value={approvedByRole}
                    onChange={(e) => setApprovedByRole(e.target.value)}
                    placeholder="Direktur Utama"
                    className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 outline-none"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Yang Menerima Pembayaran
                  </p>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="FAISAL MUSTOPA"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value)}
                    placeholder="Staf Administrasi Keuangan"
                    className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="pt-6 border-t-2 border-slate-200 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setView("list")}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveKwitansi(undefined, false)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <CheckCircle size={15} />
                <span>Simpan Dokumen</span>
              </button>
              <button
                type="submit"
                className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-200 cursor-pointer flex items-center gap-2"
              >
                <Download size={15} />
                <span>Simpan &amp; Cetak PDF Kwitansi</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
