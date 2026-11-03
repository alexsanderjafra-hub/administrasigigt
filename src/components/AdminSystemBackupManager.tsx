import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Download,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  FolderOpen,
  Layers,
  FileText,
  Truck,
  Receipt,
  Users,
  Package,
  CalendarDays,
  ShieldCheck,
  Loader2,
  Clock,
  Sparkles,
  Archive,
} from "lucide-react";
import {
  Project,
  FinancialRecord,
  DebtRecord,
  Invoice,
  SuratJalan,
  Employee,
  Asset,
  Task,
  Quotation,
  isProjectActive,
} from "../types";
import { dbService } from "../services/db";

interface AdminSystemBackupManagerProps {
  projects: Project[];
  financialRecords: FinancialRecord[];
  debtRecords: DebtRecord[];
  invoices: Invoice[];
  suratJalanList: SuratJalan[];
  employees: Employee[];
  assets: Asset[];
  tasks: Task[];
  quotations: Quotation[];
  currentUser: any;
  setToastMessage?: (msg: string) => void;
  setShowToast?: (show: boolean) => void;
}

// Helper auto-fit column width calculator for SheetJS
function calculateColumnWidths(data: any[]): Array<{ wch: number }> {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    let maxLen = key.length;
    for (const row of data) {
      const val = row[key];
      const strVal = val !== undefined && val !== null ? String(val) : "";
      if (strVal.length > maxLen) {
        maxLen = strVal.length;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 10), 65) };
  });
}

// Convert data to CSV string with standard Excel UTF-8 BOM
function convertArrayToCsv(data: any[]): string {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : "";
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",")
  );
  return "\uFEFF" + [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");
}

function triggerDownloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const AdminSystemBackupManager: React.FC<AdminSystemBackupManagerProps> = ({
  projects,
  financialRecords,
  debtRecords,
  invoices,
  suratJalanList,
  employees,
  assets,
  tasks,
  quotations,
  currentUser,
  setToastMessage,
  setShowToast,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressText, setExportProgressText] = useState("");
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem("last_full_system_backup_time");
    } catch {
      return null;
    }
  });

  const notify = (msg: string) => {
    if (setToastMessage && setShowToast) {
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } else {
      alert(msg);
    }
  };

  // 1. Gather all Payment Terms from Projects and DebtRecords
  const compileAllPaymentTerms = (projs: Project[], debts: DebtRecord[]) => {
    const list: any[] = [];
    const seenTermIds = new Set<string>();

    projs.forEach((pr) => {
      if (Array.isArray(pr.paymentTerms) && pr.paymentTerms.length > 0) {
        pr.paymentTerms.forEach((tm: any, idx: number) => {
          const tId = tm.id || `TRM-${pr.id}-${idx + 1}`;
          seenTermIds.add(tId.toLowerCase());
          list.push({
            termId: tId,
            projectId: pr.id,
            projectName: pr.name,
            client: pr.client || "-",
            termName: tm.name || `Termin ${idx + 1}`,
            percentage: tm.percentage !== undefined ? `${tm.percentage}%` : "-",
            amount: Number(tm.amount) || 0,
            invoiceDate: tm.invoiceDate || "-",
            dueDate: tm.dueDate || "-",
            paymentDate: tm.paymentDate || "-",
            status: (tm.status || "BELUM BAYAR").toUpperCase(),
            invoiceNumber: tm.invoiceNumber || "-",
            notes: tm.description || tm.notes || "-",
          });
        });
      }
    });

    debts.forEach((dr) => {
      if (dr.type === "PIUTANG" && Array.isArray(dr.terms) && dr.terms.length > 0) {
        dr.terms.forEach((tm: any, idx: number) => {
          const tId = tm.id || `TRM-DR-${dr.id}-${idx + 1}`;
          if (!seenTermIds.has(tId.toLowerCase())) {
            seenTermIds.add(tId.toLowerCase());
            list.push({
              termId: tId,
              projectId: dr.projectId || "-",
              projectName: dr.title || "-",
              client: dr.contactName || "-",
              termName: tm.name || `Termin ${idx + 1}`,
              percentage: tm.percentage !== undefined ? `${tm.percentage}%` : "-",
              amount: Number(tm.amount || tm.expectedAmount) || 0,
              invoiceDate: tm.invoiceDate || "-",
              dueDate: tm.dueDate || "-",
              paymentDate: tm.paymentDate || "-",
              status: (tm.status || "BELUM BAYAR").toUpperCase(),
              invoiceNumber: tm.invoiceNumber || "-",
              notes: tm.description || tm.notes || "-",
            });
          }
        });
      }
    });

    return list;
  };

  // 2. Main Multi-Sheet Excel Generator (.xlsx)
  const handleDownloadFullExcelBackup = async () => {
    setIsExporting(true);
    setExportProgressText("Menyiapkan dataset database...");

    try {
      // Ensure we have all collections (fetch from Firestore if empty in state)
      let currentInvoices = invoices;
      if (!currentInvoices || currentInvoices.length === 0) {
        try {
          currentInvoices = await dbService.getCollection<Invoice>("invoices");
        } catch (_) {}
      }

      let currentSuratJalan = suratJalanList;
      if (!currentSuratJalan || currentSuratJalan.length === 0) {
        try {
          currentSuratJalan = await dbService.getCollection<SuratJalan>("suratJalan");
        } catch (_) {}
      }

      let currentPurchaseOrders: any[] = [];
      try {
        currentPurchaseOrders = await dbService.getCollection<any>("purchaseOrders");
      } catch (_) {}

      setExportProgressText("Memformat lembar kerja multi-sheet...");

      const timestampNow = new Date();
      const dateFormattedStr = timestampNow.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const timeFormattedStr = timestampNow.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const wb = XLSX.utils.book_new();

      // --- SHEET 1: RINGKASAN DATA (METADATA & SUMMARY) ---
      const summaryRows = [
        { "Parameter Sistem": "Nama Entitas", "Keterangan / Nilai": "PT. GARDA INOVASI GLOBALTECH" },
        { "Parameter Sistem": "Modul Cadangan", "Keterangan / Nilai": "Full System Enterprise Database Backup" },
        { "Parameter Sistem": "Tanggal & Waktu Unduh", "Keterangan / Nilai": `${dateFormattedStr}, ${timeFormattedStr} WIB` },
        { "Parameter Sistem": "Operator Pencadangan", "Keterangan / Nilai": currentUser?.name || "Admin Operasional" },
        { "Parameter Sistem": "Role Operator", "Keterangan / Nilai": currentUser?.role?.toUpperCase() || "ADMIN" },
        { "Parameter Sistem": "Total Modul Data Terlampir", "Keterangan / Nilai": "10 Sheet Lengkap" },
        { "Parameter Sistem": "------------------------", "Keterangan / Nilai": "------------------------" },
        { "Parameter Sistem": "Total Record: Proyek", "Keterangan / Nilai": `${projects.length} Proyek Terdaftar` },
        { "Parameter Sistem": "Total Record: Hutang & Piutang", "Keterangan / Nilai": `${debtRecords.length} Catatan Hutang/Piutang` },
        { "Parameter Sistem": "Total Record: Catatan Global Keuangan", "Keterangan / Nilai": `${financialRecords.length} Transaksi Arus Kas` },
        { "Parameter Sistem": "Total Record: Invoice Penagihan", "Keterangan / Nilai": `${currentInvoices.length} Faktur Invoice` },
        { "Parameter Sistem": "Total Record: Surat Jalan (DO)", "Keterangan / Nilai": `${currentSuratJalan.length} Surat Jalan` },
        { "Parameter Sistem": "Total Record: Purchase Order (PO)", "Keterangan / Nilai": `${currentPurchaseOrders.length} Pesanan Pembelian` },
        { "Parameter Sistem": "Total Record: Karyawan & Personel", "Keterangan / Nilai": `${employees.length} Karyawan` },
        { "Parameter Sistem": "Total Record: Inventaris & Aset", "Keterangan / Nilai": `${assets.length} Item Aset` },
        { "Parameter Sistem": "Total Record: Surat Penawaran (SPH)", "Keterangan / Nilai": `${quotations.length} Dokumen Penawaran` },
        { "Parameter Sistem": "Status Enkripsi & Integritas", "Keterangan / Nilai": "VALID & TERSINKRONISASI RESMI" },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary["!cols"] = [{ wch: 35 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Backup");

      // --- SHEET 2: PROYEK ---
      const projectRows = projects.map((p, idx) => ({
        No: idx + 1,
        "ID Proyek": p.id,
        "Nama Proyek": p.name,
        "Klien / Instansi": p.client || "-",
        "Kategori Proyek": p.projectType || "PROJEK STP/IPAL",
        "Lokasi Proyek": p.location || "-",
        "Nilai Kontrak (Rp)": p.contractValue || 0,
        "Estimasi Anggaran (Rp)": p.budget || 0,
        "Progres Lapangan (%)": `${p.progress || 0}%`,
        Status: p.status || (isProjectActive(p) ? "Aktif" : "Nonaktif"),
        Prioritas: p.priority || "Medium",
        "Tanggal Mulai": p.startDate || "-",
        "Tanggal Selesai (Deadline)": p.endDate || "-",
        "Project Manager": p.managerName || p.manager || "-",
        "PIC Lapangan": p.picName || "-",
        "No. PO / Kontrak Klien": p.poNumber || "-",
        "Spesifikasi / Rincian Pekerjaan": p.itemDetails || p.description || "-",
      }));
      const wsProjects = XLSX.utils.json_to_sheet(projectRows.length > 0 ? projectRows : [{ No: "-", "ID Proyek": "Belum ada data" }]);
      wsProjects["!cols"] = calculateColumnWidths(projectRows.length > 0 ? projectRows : [{ No: 1, "ID Proyek": "PROJ-01" }]);
      XLSX.utils.book_append_sheet(wb, wsProjects, "Proyek");

      // --- SHEET 3: HUTANG & PIUTANG ---
      const debtRows = debtRecords.map((d, idx) => {
        const paid = Array.isArray(d.payments)
          ? d.payments.reduce((sum: number, pm: any) => sum + (Number(pm.amount) || 0), 0)
          : 0;
        const total = Number(d.amount) || 0;
        const remaining = Math.max(0, total - paid);
        const resolvedProjName = d.projectId
          ? projects.find((pr) => pr.id === d.projectId)?.name || d.projectId
          : "-";

        return {
          No: idx + 1,
          "ID Dokumen": d.customId || d.id,
          "Jenis (Hutang / Piutang)": d.type === "PIUTANG" ? "PIUTANG KLIEN" : "HUTANG PERUSAHAAN",
          "Judul / Keperluan": d.title || "-",
          "Pihak Kontak / Mitra / Vendor": d.contactName || "-",
          "Total Kontrak / Pinjaman (Rp)": total,
          "Total Terbayar (Rp)": paid,
          "Sisa Belum Lunas (Rp)": remaining,
          "Jatuh Tempo": d.dueDate || "-",
          "Status Pelunasan": remaining === 0 ? "LUNAS" : paid > 0 ? "PARTIAL" : "BELUM BAYAR",
          "Proyek Terkait": resolvedProjName,
          "Dicatat Oleh": d.recordedBy || "Admin",
          "Keterangan Lengkap": d.description || "-",
        };
      });
      const wsDebts = XLSX.utils.json_to_sheet(debtRows.length > 0 ? debtRows : [{ No: "-", "ID Dokumen": "Belum ada data" }]);
      wsDebts["!cols"] = calculateColumnWidths(debtRows.length > 0 ? debtRows : [{ No: 1, "ID Dokumen": "HTG-001" }]);
      XLSX.utils.book_append_sheet(wb, wsDebts, "Hutang & Piutang");

      // --- SHEET 4: TERMIN PEMBAYARAN PROYEK ---
      const termsList = compileAllPaymentTerms(projects, debtRecords);
      const termRows = termsList.map((tm, idx) => ({
        No: idx + 1,
        "ID Termin": tm.termId,
        "ID Proyek": tm.projectId,
        "Nama Proyek": tm.projectName,
        "Klien / Pembayar": tm.client,
        "Nama / Tahap Termin": tm.termName,
        "Persentase (%)": tm.percentage,
        "Nominal Tagihan Termin (Rp)": tm.amount,
        "Tanggal Invoice": tm.invoiceDate,
        "Tanggal Jatuh Tempo": tm.dueDate,
        "Tanggal Realisasi Masuk": tm.paymentDate,
        "Status Pembayaran": tm.status,
        "Nomor Invoice Terkait": tm.invoiceNumber,
        Catatan: tm.notes,
      }));
      const wsTerms = XLSX.utils.json_to_sheet(termRows.length > 0 ? termRows : [{ No: "-", "ID Termin": "Belum ada data termin" }]);
      wsTerms["!cols"] = calculateColumnWidths(termRows.length > 0 ? termRows : [{ No: 1, "ID Termin": "TRM-01" }]);
      XLSX.utils.book_append_sheet(wb, wsTerms, "Termin Proyek");

      // --- SHEET 5: CATATAN GLOBAL ARUS KAS (KEUANGAN) ---
      const financeSorted = [...financialRecords].sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return (b.timestamp || 0) - (a.timestamp || 0);
      });

      const financeRows = financeSorted.map((r, idx) => {
        const inAmount = r.type === "IN" ? Number(r.amount) : 0;
        const outAmount = r.type === "OUT" ? Number(r.amount) : 0;
        const resolvedProj = r.referenceId
          ? projects.find((p) => p.id === r.referenceId)?.name || r.referenceId
          : r.projectId
          ? projects.find((p) => p.id === r.projectId)?.name || r.projectId
          : "-";

        const sumberDanaStr =
          r.sumberDana ||
          (r.personalHolder
            ? "REKENING PRIBADI"
            : r.flowType === "OUT_PERSONAL_SPEND"
            ? "DANA PATTYCASH"
            : "REKENING PT BANK MANDIRI");

        const penerimaPjStr =
          r.rekPenerima ||
          r.penerimaKasbon ||
          r.personalHolder ||
          (r.type === "IN" ? r.senderName || "-" : "-");

        return {
          No: idx + 1,
          Tanggal: r.date || "-",
          "ID Transaksi": r.customId || r.id,
          "Tipe Arus": r.type === "IN" ? "PEMASUKAN (IN)" : "PENGELUARAN (OUT)",
          Kategori: r.category || "-",
          "Deskripsi Lengkap": r.description || "-",
          "Pemasukan (Rp)": inAmount,
          "Pengeluaran (Rp)": outAmount,
          "Biaya Admin (Rp)": Number(r.adminFee) || 0,
          "Sumber Dana / Rekening": sumberDanaStr,
          "Penerima / PJ Dana": penerimaPjStr,
          "Proyek Terkait": resolvedProj,
          "Ref Hutang": r.refHutang || "-",
          "Ref Piutang": r.refPiutang || "-",
          "Ref ID Bank": r.refIdBank || "-",
          "Dicatat Oleh": r.recordedBy || "Admin",
        };
      });
      const wsFinance = XLSX.utils.json_to_sheet(financeRows.length > 0 ? financeRows : [{ No: "-", Tanggal: "Belum ada transaksi" }]);
      wsFinance["!cols"] = calculateColumnWidths(financeRows.length > 0 ? financeRows : [{ No: 1, Tanggal: "2026-08-01" }]);
      XLSX.utils.book_append_sheet(wb, wsFinance, "Arus Kas Keuangan");

      // --- SHEET 6: INVOICE PENAGIHAN ---
      const invoiceRows = currentInvoices.map((inv, idx) => ({
        No: idx + 1,
        "Nomor Invoice": inv.invoiceNumber || inv.id,
        "Tanggal Invoice": inv.invoiceDate || "-",
        "Jatuh Tempo": inv.dueDate || "-",
        "Klien / Penerima": inv.recipientName || (inv as any).clientName || "-",
        "Nama Pekerjaan / Proyek": inv.jobName || (inv as any).projectName || "-",
        "Subtotal (Rp)": Number(inv.subtotal) || Number(inv.amount) || 0,
        "PPN (Rp)": Number(inv.taxAmount) || 0,
        "Ongkos Kirim (Rp)": Number(inv.shippingCost) || 0,
        "Diskon (Rp)": Number(inv.discountVal) || 0,
        "Grand Total Tagihan (Rp)": Number(inv.grandTotal) || Number(inv.amount) || 0,
        "Status Pembayaran": (inv.status || "PENDING").toUpperCase(),
        "Bank Pembayaran": inv.bankName || "Mandiri",
        "Nomor Rekening": inv.bankAccountNumber || "1550014117173",
        "Atas Nama": inv.bankAccountName || "Garda Inovasi Globaltech",
        Penandatangan: inv.signatoryName || "Jidan Ramadhan",
      }));
      const wsInvoices = XLSX.utils.json_to_sheet(invoiceRows.length > 0 ? invoiceRows : [{ No: "-", "Nomor Invoice": "Belum ada invoice" }]);
      wsInvoices["!cols"] = calculateColumnWidths(invoiceRows.length > 0 ? invoiceRows : [{ No: 1, "Nomor Invoice": "INV-001" }]);
      XLSX.utils.book_append_sheet(wb, wsInvoices, "Invoice");

      // --- SHEET 7: SURAT JALAN (DO) ---
      const sjRows = currentSuratJalan.map((sj, idx) => {
        const itemStr = Array.isArray(sj.items)
          ? sj.items.map((it: any) => `${it.name || it.description} (${it.qty || 1} ${it.unit || "unit"})`).join("; ")
          : (sj as any).keterangan || "-";

        return {
          No: idx + 1,
          "Nomor Surat Jalan": sj.nomorSurat || sj.id,
          "Tanggal Pengiriman": sj.tanggal || "-",
          Pengirim: (sj as any).pengirim || "PT. GARDA INOVASI GLOBALTECH",
          "Penerima / PIC Lokasi": sj.penerima || "-",
          "Alamat / Tujuan": sj.alamatTujuan || (sj as any).lokasi || "-",
          "Proyek Terkait": sj.proyek || "-",
          "Kendaraan / No. Polisi / Driver": (sj as any).driver || (sj as any).noPolisi || "-",
          "Rincian Barang Dikirim": itemStr,
          "Catatan Pengiriman": (sj as any).catatan || "-",
        };
      });
      const wsSJ = XLSX.utils.json_to_sheet(sjRows.length > 0 ? sjRows : [{ No: "-", "Nomor Surat Jalan": "Belum ada surat jalan" }]);
      wsSJ["!cols"] = calculateColumnWidths(sjRows.length > 0 ? sjRows : [{ No: 1, "Nomor Surat Jalan": "SJ-001" }]);
      XLSX.utils.book_append_sheet(wb, wsSJ, "Surat Jalan");

      // --- SHEET 8: PURCHASE ORDER (PO) ---
      const poRows = currentPurchaseOrders.map((po, idx) => ({
        No: idx + 1,
        "Nomor PO": po.poNumber || po.id,
        "Tanggal PO": po.date || "-",
        "Vendor / Supplier": po.vendorName || "-",
        "Alamat Vendor": po.vendorAddress || "-",
        "Proyek Terkait": po.projectName || "-",
        "Total Nilai PO (Rp)": Number(po.grandTotal) || Number(po.totalAmount) || 0,
        "Status PO": (po.status || "DRAFT").toUpperCase(),
        Penandatangan: po.signerName || "Jidan Ramadhan",
        "Catatan & Syarat": po.note || "-",
      }));
      const wsPO = XLSX.utils.json_to_sheet(poRows.length > 0 ? poRows : [{ No: "-", "Nomor PO": "Belum ada purchase order" }]);
      wsPO["!cols"] = calculateColumnWidths(poRows.length > 0 ? poRows : [{ No: 1, "Nomor PO": "PO-001" }]);
      XLSX.utils.book_append_sheet(wb, wsPO, "Purchase Order");

      // --- SHEET 9: KARYAWAN & PERSONEL ---
      const empRows = employees.map((emp, idx) => ({
        No: idx + 1,
        "ID Karyawan": emp.id,
        "Nama Lengkap": emp.name,
        "Jabatan / Role": emp.role || "-",
        Departemen: emp.department || "-",
        "No. WhatsApp / HP": emp.phone || (emp as any).whatsapp || "-",
        "Skema Gaji": emp.salaryType === "bulanan" ? "Bulanan" : "Harian",
        "Tarif Gaji Pokok (Rp)":
          emp.salaryType === "bulanan" ? Number(emp.monthlyRate) || 0 : Number(emp.dailyRate) || 0,
        "Tarif Lembur per Jam (Rp)": Number(emp.overtimeRate) || 0,
        "Status Kepegawaian": emp.status === "inactive" || (emp as any).isDeleted ? "Nonaktif" : "Aktif",
      }));
      const wsEmp = XLSX.utils.json_to_sheet(empRows.length > 0 ? empRows : [{ No: "-", "Nama Lengkap": "Belum ada karyawan" }]);
      wsEmp["!cols"] = calculateColumnWidths(empRows.length > 0 ? empRows : [{ No: 1, "Nama Lengkap": "Ahmad" }]);
      XLSX.utils.book_append_sheet(wb, wsEmp, "Karyawan & Personel");

      // --- SHEET 10: INVENTARIS & ASET ---
      const assetRows = assets.map((ast, idx) => ({
        No: idx + 1,
        "ID Aset": ast.id,
        "Nama Barang / Aset": ast.name,
        "Merk / Brand": ast.brand || "-",
        "Tipe / Model": ast.modelType || "-",
        Kategori: ast.category || "-",
        "Harga Beli (Rp)": Number(ast.price) || 0,
        "Kondisi / Status": ast.status || "Available",
        "Pengguna Saat Ini": ast.userName || "-",
        Lokasi: (ast as any).location || "-",
      }));
      const wsAssets = XLSX.utils.json_to_sheet(assetRows.length > 0 ? assetRows : [{ No: "-", "Nama Barang": "Belum ada aset" }]);
      wsAssets["!cols"] = calculateColumnWidths(assetRows.length > 0 ? assetRows : [{ No: 1, "Nama Barang": "Pompa" }]);
      XLSX.utils.book_append_sheet(wb, wsAssets, "Inventaris & Aset");

      // Write file and trigger direct download
      setExportProgressText("Mengompresi ke berkas Excel (.xlsx)...");
      const fileName = `BACKUP_DATABASE_LENGKAP_GIG_${timestampNow.toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      const backupTimestampText = `${dateFormattedStr}, ${timeFormattedStr}`;
      setLastBackupTime(backupTimestampText);
      try {
        localStorage.setItem("last_full_system_backup_time", backupTimestampText);
      } catch (_) {}

      notify(`Berhasil mengunduh berkas backup lengkap (${fileName}) dengan 10 Sheet data!`);
    } catch (err: any) {
      console.error("Gagal mengekspor file backup Excel:", err);
      notify("Gagal mengunduh backup: " + (err.message || "Terjadi kesalahan internal"));
    } finally {
      setIsExporting(false);
      setExportProgressText("");
    }
  };

  // 3. Download Specific CSV File
  const handleDownloadCsv = (type: "finance" | "projects" | "debts" | "terms") => {
    try {
      const today = new Date().toISOString().split("T")[0];
      if (type === "finance") {
        const sorted = [...financialRecords].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        const rows = sorted.map((r, idx) => ({
          No: idx + 1,
          Tanggal: r.date || "-",
          "ID Transaksi": r.customId || r.id,
          "Tipe Arus": r.type === "IN" ? "PEMASUKAN" : "PENGELUARAN",
          Kategori: r.category || "-",
          "Deskripsi Lengkap": r.description || "-",
          "Pemasukan (Rp)": r.type === "IN" ? Number(r.amount) : 0,
          "Pengeluaran (Rp)": r.type === "OUT" ? Number(r.amount) : 0,
          "Biaya Admin (Rp)": Number(r.adminFee) || 0,
          "Sumber Dana / Rekening": r.sumberDana || (r.personalHolder ? "REKENING PRIBADI" : "REKENING PT BANK MANDIRI"),
          "Penerima / PJ": r.rekPenerima || r.penerimaKasbon || r.personalHolder || "-",
          "Proyek Terkait": r.referenceId ? projects.find((p) => p.id === r.referenceId)?.name || r.referenceId : "-",
          "Ref Hutang": r.refHutang || "-",
          "Ref Piutang": r.refPiutang || "-",
          "Ref ID Bank": r.refIdBank || "-",
          "Dicatat Oleh": r.recordedBy || "Admin",
        }));
        const csv = convertArrayToCsv(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        triggerDownloadFile(blob, `BACKUP_CATATAN_GLOBAL_KEUANGAN_${today}.csv`);
        notify("Berhasil mengunduh CSV Catatan Global Keuangan.");
      } else if (type === "projects") {
        const rows = projects.map((p, idx) => ({
          No: idx + 1,
          "ID Proyek": p.id,
          "Nama Proyek": p.name,
          Klien: p.client || "-",
          "Tipe Proyek": p.projectType || "PROJEK STP/IPAL",
          Lokasi: p.location || "-",
          "Nilai Kontrak (Rp)": p.contractValue || 0,
          "Estimasi Anggaran (Rp)": p.budget || 0,
          "Progres (%)": `${p.progress || 0}%`,
          Status: p.status || (isProjectActive(p) ? "Aktif" : "Nonaktif"),
          "Tanggal Mulai": p.startDate || "-",
          "Tanggal Selesai": p.endDate || "-",
          Manager: p.managerName || p.manager || "-",
          PIC: p.picName || "-",
          "No PO / Kontrak": p.poNumber || "-",
        }));
        const csv = convertArrayToCsv(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        triggerDownloadFile(blob, `BACKUP_DAFTAR_PROYEK_${today}.csv`);
        notify("Berhasil mengunduh CSV Daftar Proyek.");
      } else if (type === "debts") {
        const rows = debtRecords.map((d, idx) => {
          const paid = Array.isArray(d.payments)
            ? d.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
            : 0;
          const total = Number(d.amount) || 0;
          return {
            No: idx + 1,
            "ID Dokumen": d.customId || d.id,
            Jenis: d.type === "PIUTANG" ? "PIUTANG" : "HUTANG",
            "Judul / Keperluan": d.title || "-",
            "Mitra / Klien / Kontak": d.contactName || "-",
            "Total Kontrak (Rp)": total,
            "Terbayar (Rp)": paid,
            "Sisa Belum Lunas (Rp)": Math.max(0, total - paid),
            "Jatuh Tempo": d.dueDate || "-",
            Status: total - paid <= 0 ? "LUNAS" : paid > 0 ? "PARTIAL" : "BELUM BAYAR",
            "Proyek Terkait": d.projectId || "-",
          };
        });
        const csv = convertArrayToCsv(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        triggerDownloadFile(blob, `BACKUP_HUTANG_PIUTANG_${today}.csv`);
        notify("Berhasil mengunduh CSV Hutang & Piutang.");
      } else if (type === "terms") {
        const termsList = compileAllPaymentTerms(projects, debtRecords);
        const rows = termsList.map((tm, idx) => ({
          No: idx + 1,
          "ID Termin": tm.termId,
          "Nama Proyek": tm.projectName,
          Klien: tm.client,
          "Tahap Termin": tm.termName,
          "Persentase (%)": tm.percentage,
          "Nominal (Rp)": tm.amount,
          "Tanggal Invoice": tm.invoiceDate,
          "Jatuh Tempo": tm.dueDate,
          "Tanggal Pelunasan": tm.paymentDate,
          Status: tm.status,
          "No Invoice": tm.invoiceNumber,
        }));
        const csv = convertArrayToCsv(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        triggerDownloadFile(blob, `BACKUP_TERMIN_PEMBAYARAN_${today}.csv`);
        notify("Berhasil mengunduh CSV Termin Pembayaran Proyek.");
      }
    } catch (e: any) {
      notify("Gagal mengunduh CSV: " + e.message);
    }
  };

  const backupModules = [
    {
      title: "Data Proyek",
      count: projects.length,
      unit: "Proyek",
      icon: FolderOpen,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      sheetName: "Sheet 'Proyek'",
    },
    {
      title: "Hutang & Piutang",
      count: debtRecords.length,
      unit: "Catatan",
      icon: Layers,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      sheetName: "Sheet 'Hutang & Piutang'",
    },
    {
      title: "Termin Pembayaran",
      count: projects.reduce((acc, p) => acc + (p.paymentTerms?.length || 0), 0),
      unit: "Tahap",
      icon: CalendarDays,
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-200",
      sheetName: "Sheet 'Termin Proyek'",
    },
    {
      title: "Catatan Global Keuangan",
      count: financialRecords.length,
      unit: "Transaksi",
      icon: Receipt,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      sheetName: "Sheet 'Arus Kas Keuangan'",
    },
    {
      title: "Invoice & Penagihan",
      count: invoices.length,
      unit: "Faktur",
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-200",
      sheetName: "Sheet 'Invoice'",
    },
    {
      title: "Surat Jalan (DO)",
      count: suratJalanList.length,
      unit: "Dokumen",
      icon: Truck,
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-200",
      sheetName: "Sheet 'Surat Jalan'",
    },
    {
      title: "Karyawan & Personel",
      count: employees.length,
      unit: "Personel",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
      sheetName: "Sheet 'Karyawan & Personel'",
    },
    {
      title: "Inventaris & Aset",
      count: assets.length,
      unit: "Item Aset",
      icon: Package,
      color: "text-cyan-600",
      bg: "bg-cyan-50 border-cyan-200",
      sheetName: "Sheet 'Inventaris & Aset'",
    },
  ];

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-6 sm:p-8 md:p-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
              <Database size={22} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Sistem Cadangan &amp; Ekspor Data Terpusat
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pusat Backup &amp; Unduh Seluruh Database
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Unduh seluruh arsip data perusahaan ke dalam <strong>satu file Excel (.xlsx) rapi</strong> dengan masing-masing sheet terpisah untuk setiap modul, atau ekspor per modul berformat CSV.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadFullExcelBackup}
            className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isExporting ? (
              <>
                <Loader2 size={20} className="animate-spin text-white" />
                <span>{exportProgressText || "Memproses..."}</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={22} className="group-hover:scale-110 transition-transform" />
                <span>Unduh Semua Data (.XLSX Multi-Sheet)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Data Modules Included in Backup */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <span>Daftar Modul Yang Masuk Ke Dalam File Backup:</span>
          </h3>
          {lastBackupTime && (
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
              <Clock size={12} className="text-emerald-500" />
              <span>Terakhir Diunduh: {lastBackupTime}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {backupModules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-3xl bg-slate-50/70 border border-slate-100/90 hover:border-slate-200 hover:bg-slate-50 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${mod.bg} ${mod.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700 font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-xs">
                    {mod.count} {mod.unit}
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800 leading-tight mb-0.5">
                    {mod.title}
                  </h4>
                  <p className="text-[9px] font-bold text-slate-400 font-mono">
                    {mod.sheetName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick CSV Export Bar */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-primary">
              <Archive size={18} />
            </div>
            <div>
              <h4 className="font-black text-sm text-white">
                Opsi Ekspor Cepat Format CSV (Per Modul)
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Pilih modul spesifik jika Anda hanya memerlukan data tertentu dalam format CSV ringan:
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleDownloadCsv("finance")}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-black uppercase tracking-wider text-emerald-300 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download size={14} />
            <span>CSV Catatan Keuangan</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownloadCsv("projects")}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-black uppercase tracking-wider text-blue-300 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download size={14} />
            <span>CSV Data Proyek</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownloadCsv("debts")}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-black uppercase tracking-wider text-amber-300 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download size={14} />
            <span>CSV Hutang &amp; Piutang</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownloadCsv("terms")}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-black uppercase tracking-wider text-teal-300 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download size={14} />
            <span>CSV Termin Proyek</span>
          </button>
        </div>
      </div>
    </div>
  );
};
