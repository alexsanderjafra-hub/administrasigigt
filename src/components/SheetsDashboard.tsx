import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Settings,
  Shield,
  ArrowUpRight,
  Database,
  CloudLightning,
  Trash2,
  Download,
  FileDown,
  User,
  Users2,
  CalendarDays,
  DollarSign,
  ClipboardList,
  Layers,
  FileText
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { dbService } from "../services/db";
import {
  signInWithGoogleSheets,
  syncAllDataToGoogleSheets,
  getGoogleAccessToken,
  setGoogleAccessToken
} from "../services/sheets";

interface SheetsDashboardProps {
  currentUser: any;
  accounts: any[];
  attendanceHistory: any[];
  leaveRequests: any[];
  cashAdvances: any[];
  reimbursements: any[];
  departmentSettings: any[];
  projects: any[];
  reports: any[];
  financialRecords: any[];
  debtRecords: any[];
  onAddLog: (log: any) => void;
}

export default function SheetsDashboard({
  currentUser,
  accounts,
  attendanceHistory,
  leaveRequests,
  cashAdvances,
  reimbursements,
  departmentSettings,
  projects,
  reports,
  financialRecords = [],
  debtRecords = [],
  onAddLog
}: SheetsDashboardProps) {
  const [spreadsheetId, setSpreadsheetId] = useState("1lK09KhG8eLcN9-GUGE_ZyXKG9OFjoie6BKiNPhQbzJU");
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "config" | "offline-export">("overview");

  // Load configured spreadsheet ID & connection credentials from Firestore on mount
  useEffect(() => {
    const fetchConfig = async () => {
      if (!currentUser) return;
      try {
        const docData = await dbService.getDocument<any>("settings", "google-sheets");
        if (docData) {
          if (docData.spreadsheetId && docData.spreadsheetId !== "1uQ2mksE2z95Co2_VWVGkRrQrMtzOJRiSkwsv__QQB7E") {
            setSpreadsheetId(docData.spreadsheetId);
          } else {
            setSpreadsheetId("1lK09KhG8eLcN9-GUGE_ZyXKG9OFjoie6BKiNPhQbzJU");
          }
          if (docData.realtimeEnabled !== undefined) {
            setRealtimeEnabled(docData.realtimeEnabled);
          }
          if (docData.lastSyncTime) {
            setLastSyncTime(docData.lastSyncTime);
          }
          if (docData.googleAccessToken) {
            try {
              const testRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: `Bearer ${docData.googleAccessToken}` }
              });
              if (testRes.ok) {
                setGoogleAccessToken(docData.googleAccessToken);
                if (docData.googleUser) {
                  setGoogleUser(docData.googleUser);
                }
              } else if (testRes.status === 401) {
                // Token has expired. Silently clear to heal the credentials state in Firestore and in-memory
                setGoogleAccessToken(null);
                setGoogleUser(null);
                await dbService.setDocument("settings", "google-sheets", {
                  ...docData,
                  googleAccessToken: null,
                  googleUser: null
                });
                console.log("Cached Google Sheets token was expired and has been silently cleared.");
              } else {
                setGoogleAccessToken(docData.googleAccessToken);
                if (docData.googleUser) {
                  setGoogleUser(docData.googleUser);
                }
              }
            } catch (verifyErr) {
              console.warn("Gagal memverifikasi token Google, menggunakan nilai lokal:", verifyErr);
              setGoogleAccessToken(docData.googleAccessToken);
              if (docData.googleUser) {
                setGoogleUser(docData.googleUser);
              }
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat konfigurasi Google Sheets:", err);
      }
    };
    fetchConfig();
  }, [currentUser]);

  // Update token status in case we already have a session
  useEffect(() => {
    const accessToken = getGoogleAccessToken();
    if (accessToken && !googleUser) {
      setGoogleUser({
        name: currentUser?.name || "Google User Session",
        email: currentUser?.email || "Connected",
      });
    }
  }, [currentUser, googleUser]);

  const handleConnectGoogle = async () => {
    try {
      setSyncStatus(null);
      const token = await signInWithGoogleSheets();
      if (token) {
        let name = "Google User Session";
        let email = "gigt.sheets.sync@gmail.com";
        
        try {
          const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userinfoRes.ok) {
            const userinfo = await userinfoRes.json();
            if (userinfo.email) email = userinfo.email;
            if (userinfo.name) name = userinfo.name;
          }
        } catch (e) {
          console.warn("Gagal mengambil profil detail Google, mengembalikan ke opsional default:", e);
        }

        const gUser = {
          name,
          email,
          connectedAt: Date.now()
        };

        setGoogleUser(gUser);
        setGoogleAccessToken(token);

        // Statefully persist the sync credentials globally in Cloud Firestore
        await dbService.setDocument("settings", "google-sheets", {
          spreadsheetId,
          realtimeEnabled,
          lastSyncTime,
          googleAccessToken: token,
          googleUser: gUser
        });
        
        // Log activity
        await dbService.createDocument("auditLogs", {
          userId: currentUser?.id || "admin",
          userName: currentUser?.name || "Admin",
          action: "CONNECT",
          module: "GOOGLE_SHEETS",
          details: `Menghubungkan akun Google: ${email} untuk seluruh perangkat.`,
          timestamp: Date.now(),
        });

        // Trigger log to screen
        onAddLog({
          type: "SUCCESS",
          message: `Akun Google (${email}) berhasil dihubungkan & disimpan aman di server.`
        });
      }
    } catch (err: any) {
      alert("Gagal menghubungkan Google Account: " + err.message);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      setGoogleAccessToken(null);
      setGoogleUser(null);
      setSyncStatus(null);

      // Unlink session credential from Cloud database
      await dbService.setDocument("settings", "google-sheets", {
        spreadsheetId,
        realtimeEnabled,
        lastSyncTime,
        googleAccessToken: null,
        googleUser: null
      });

      onAddLog({
        type: "INFO",
        message: "Koneksi Google Sheets berhasil diputus untuk seluruh perangkat."
      });
    } catch (err: any) {
      console.error("Gagal memutuskan koneksi di database:", err);
      alert("Gagal menyimpan pemutusan koneksi: " + err.message);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const existingDoc = await dbService.getDocument<any>("settings", "google-sheets") || {};
      await dbService.setDocument("settings", "google-sheets", {
        ...existingDoc,
        spreadsheetId,
        realtimeEnabled,
        lastSyncTime,
      });

      // Log activity
      await dbService.createDocument("auditLogs", {
        userId: currentUser?.id || "admin",
        userName: currentUser?.name || "Admin",
        action: "UPDATE",
        module: "GOOGLE_SHEETS",
        details: `Mengonfigurasi ID Spreadsheet menjadi: ${spreadsheetId}`,
        timestamp: Date.now(),
      });

      alert("Konfigurasi Google Sheets berhasil disimpan secara cloud!");
    } catch (err: any) {
      alert("Gagal menyimpan konfigurasi: " + err.message);
    }
  };

  const handleForceSync = async () => {
    const token = getGoogleAccessToken();
    if (!token) {
      alert("Harap hubungkan akun Google Anda terlebih dahulu dengan menekan tombol 'Hubungkan Google Drive & Sheets'!");
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const result = await syncAllDataToGoogleSheets(token, spreadsheetId, {
        accounts,
        attendanceHistory,
        leaveRequests,
        cashAdvances,
        reimbursements,
        departmentSettings,
        projects,
        reports,
        financialRecords,
        debtRecords,
      });

      setSyncStatus({
        success: result.success,
        message: result.message,
      });

      if (result.success) {
        const timeNow = new Date().toLocaleString("id-ID");
        setLastSyncTime(timeNow);
        
        // Update Firestore lastSync time
        await dbService.setDocument("settings", "google-sheets", {
          spreadsheetId,
          realtimeEnabled,
          lastSyncTime: timeNow,
        });

        // Audit log
        await dbService.createDocument("auditLogs", {
          userId: currentUser?.id || "admin",
          userName: currentUser?.name || "Admin",
          action: "SYNC",
          module: "GOOGLE_SHEETS",
          details: "Melakukan sinkronisasi manual seluruh data absensi, payroll, dan klaim lapangan.",
          timestamp: Date.now(),
        });

        onAddLog({
          type: "SUCCESS",
          message: "Sync Google Sheets Sukses! Hubungkan url sheet Anda untuk melihat data."
        });
      }
    } catch (err: any) {
      if (err.message?.includes("401") || err.message?.includes("Sesi Google Anda telah berakhir")) {
        // Clear invalid session automatically
        setGoogleAccessToken(null);
        setGoogleUser(null);
        try {
          await dbService.setDocument("settings", "google-sheets", {
            spreadsheetId,
            realtimeEnabled,
            lastSyncTime,
            googleAccessToken: null,
            googleUser: null
          });
        } catch (dbErr) {
          console.error("Gagal membersihkan sesi kedaluwarsa di db:", dbErr);
        }
      }
      setSyncStatus({
        success: false,
        message: err.message || "Kegagalan tidak terduga saat sinkronisasi.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const exportToExcel = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => {
        const str = cell !== undefined && cell !== null ? String(cell) : "";
        if (str.includes(",") || str.includes("\n") || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (filename: string, title: string, headers: string[], rows: any[][]) => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(16);
    doc.setTextColor(26, 43, 73);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 18, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString("id-ID")}`, doc.internal.pageSize.getWidth() / 2, 24, { align: "center" });

    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [15, 45, 80], textColor: 255, halign: "center" },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    doc.save(`${filename}.pdf`);
  };

  // 1. SDM & Gaji Handlers
  const handleDownloadGajiExcel = () => {
    const headers = [
      "ID Karyawan",
      "Nama Karyawan",
      "Bagian / Jabatan",
      "Rate Harian (Rp)",
      "Rate Lembur (Rp/Jam)",
      "Total Hari Kerja",
      "Total Lembur (Jam)",
      "Total Kasbon (Rp)",
      "Potongan BPJS (Rp)",
      "Gaji Bersih Diterima (Rp)"
    ];

    const rows = accounts
      .filter((emp) => emp.role !== "admin")
      .map((emp) => {
        const userAttendance = attendanceHistory.filter(
          (h) => (h.userId === emp.username || h.userId === emp.id) && h.type === "IN"
        );
        const userCashAdvances = cashAdvances.filter(
          (c) => c.userId === emp.username || c.userId === emp.id
        );
        const totalCashAdvanceObj = userCashAdvances.reduce((sum, c) => sum + c.amount, 0);
        const deptSetting = departmentSettings.find((s) => s.id === emp.bagian);
        const overtimeRate = emp.overtimeRate || deptSetting?.overtimeRate || 15000;

        const uniqueWorkDays = userAttendance.reduce((acc: any[], current) => {
          const date = new Date(current.timestamp).toDateString();
          const existingDay = acc.find(
            (d) => new Date(d.timestamp).toDateString() === date
          );
          if (!existingDay) {
            const outRecord = attendanceHistory.find(
              (h) =>
                (h.userId === emp.username || h.userId === emp.id) &&
                h.type === "OUT" &&
                new Date(h.timestamp).toDateString() === date
            );
            let overtimeHours = 0;
            if (outRecord) {
              const outTime = new Date(outRecord.timestamp);
              const deadline = new Date(outRecord.timestamp);
              deadline.setHours(17, 0, 0, 0);
              if (outTime.getTime() > deadline.getTime()) {
                overtimeHours = Math.floor(
                  (outTime.getTime() - deadline.getTime()) / (1000 * 60 * 60)
                );
              }
            }
            acc.push({ ...current, clockOutEntry: outRecord, overtimeHours });
          }
          return acc;
        }, []);

        const calculatedTotalSalary = uniqueWorkDays.reduce((sum, day) => {
          const isLeave = day.type === "LEAVE_DAY";
          const dayRate = isLeave
            ? emp.dailyRate || 150000
            : emp.projectRates?.[day.projectId] ||
              emp.dailyRate ||
              deptSetting?.dailyRate ||
              150000;
          return sum + dayRate + (day.overtimeHours || 0) * overtimeRate;
        }, 0);

        const calculatedNetSalary = calculatedTotalSalary - totalCashAdvanceObj;
        const totalOvertimeHoursAccum = uniqueWorkDays.reduce((sum: number, day: any) => sum + (day.overtimeHours || 0), 0);
        const displayId = emp.employeeId || (emp.id && emp.id.length > 8 ? emp.id.substring(0, 8) : emp.id) || "-";

        return [
          displayId,
          emp.name || "-",
          emp.role || emp.bagian || "Karyawan Lapangan",
          emp.dailyRate || deptSetting?.dailyRate || 150000,
          overtimeRate,
          uniqueWorkDays.length,
          totalOvertimeHoursAccum,
          totalCashAdvanceObj,
          0,
          calculatedNetSalary,
        ];
      });

    exportToExcel("Rekap_SDM_Gaji_Payroll", headers, rows);
  };

  const handleDownloadGajiPDF = () => {
    const headers = [
      "ID Karyawan",
      "Nama Karyawan",
      "Bagian / Jabatan",
      "Rate Harian (Rp)",
      "Rate Lembur (Rp)",
      "Hari Kerja",
      "Lembur (Jam)",
      "Kasbon (Rp)",
      "Gaji Bersih (Rp)"
    ];

    const rows = accounts
      .filter((emp) => emp.role !== "admin")
      .map((emp) => {
        const userAttendance = attendanceHistory.filter(
          (h) => (h.userId === emp.username || h.userId === emp.id) && h.type === "IN"
        );
        const userCashAdvances = cashAdvances.filter(
          (c) => c.userId === emp.username || c.userId === emp.id
        );
        const totalCashAdvanceObj = userCashAdvances.reduce((sum, c) => sum + c.amount, 0);
        const deptSetting = departmentSettings.find((s) => s.id === emp.bagian);
        const overtimeRate = emp.overtimeRate || deptSetting?.overtimeRate || 15000;

        const uniqueWorkDays = userAttendance.reduce((acc: any[], current) => {
          const date = new Date(current.timestamp).toDateString();
          const existingDay = acc.find(
            (d) => new Date(d.timestamp).toDateString() === date
          );
          if (!existingDay) {
            const outRecord = attendanceHistory.find(
              (h) =>
                (h.userId === emp.username || h.userId === emp.id) &&
                h.type === "OUT" &&
                new Date(h.timestamp).toDateString() === date
            );
            let overtimeHours = 0;
            if (outRecord) {
              const outTime = new Date(outRecord.timestamp);
              const deadline = new Date(outRecord.timestamp);
              deadline.setHours(17, 0, 0, 0);
              if (outTime.getTime() > deadline.getTime()) {
                overtimeHours = Math.floor(
                  (outTime.getTime() - deadline.getTime()) / (1000 * 60 * 60)
                );
              }
            }
            acc.push({ ...current, clockOutEntry: outRecord, overtimeHours });
          }
          return acc;
        }, []);

        const calculatedTotalSalary = uniqueWorkDays.reduce((sum, day) => {
          const isLeave = day.type === "LEAVE_DAY";
          const dayRate = isLeave
            ? emp.dailyRate || 150000
            : emp.projectRates?.[day.projectId] ||
              emp.dailyRate ||
              deptSetting?.dailyRate ||
              150000;
          return sum + dayRate + (day.overtimeHours || 0) * overtimeRate;
        }, 0);

        const calculatedNetSalary = calculatedTotalSalary - totalCashAdvanceObj;
        const totalOvertimeHoursAccum = uniqueWorkDays.reduce((sum: number, day: any) => sum + (day.overtimeHours || 0), 0);
        const displayId = emp.employeeId || (emp.id && emp.id.length > 8 ? emp.id.substring(0, 8) : emp.id) || "-";

        return [
          displayId,
          emp.name || "-",
          emp.role || emp.bagian || "Karyawan Lapangan",
          (emp.dailyRate || deptSetting?.dailyRate || 150000).toLocaleString("id-ID"),
          overtimeRate.toLocaleString("id-ID"),
          uniqueWorkDays.length,
          totalOvertimeHoursAccum,
          totalCashAdvanceObj.toLocaleString("id-ID"),
          calculatedNetSalary.toLocaleString("id-ID"),
        ];
      });

    exportToPDF("Rekap_SDM_Gaji_Payroll", "LAPORAN REKAPITULASI SDM & PAYROLL GAJI BERSIH", headers, rows);
  };

  // 2. Kehadiran Handlers
  const handleDownloadAbsensiExcel = () => {
    const headers = [
      "Tanggal/Waktu",
      "ID Karyawan",
      "Nama Karyawan",
      "Status",
      "Projek Kerja",
      "Durasi Kerja (Menit)",
      "Durasi Lembur (Menit)",
      "Klip Selfie",
      "Keterangan / Alasan",
      "Swafoto Jarak (Km)"
    ];

    const rows = attendanceHistory.map((h) => {
      const userObj = accounts.find((u) => u.id === h.userId || u.uid === h.userId || u.username === h.userId);
      const projObj = projects.find((p) => p.id === h.projectId);
      const displayId = userObj?.employeeId || (h.userId && h.userId.length > 8 ? h.userId.substring(0, 8) : h.userId) || "-";
      return [
        h.timestamp ? new Date(h.timestamp).toLocaleString("id-ID") : "-",
        displayId,
        userObj?.name || "-",
        h.type || "IN",
        projObj?.name || h.projectId || "Generik/Kantor",
        h.type === "OUT" ? (h.durationMinutes || "-") : "-",
        h.type === "OUT" ? (h.overtimeMinutes || "0") : "-",
        h.selfieUrl ? (h.selfieUrl.startsWith("data:") ? "[Foto Selfie Terlampir]" : h.selfieUrl) : "Tanpa Foto",
        h.lateReason || h.keterangan || "-",
        h.projectDistance !== undefined && h.projectDistance !== null ? `${Number(h.projectDistance).toFixed(2)}` : "T/A",
      ];
    });

    exportToExcel("Rekap_Absensi_Lapangan", headers, rows);
  };

  const handleDownloadAbsensiPDF = () => {
    const headers = [
      "Waktu",
      "ID SDM",
      "Nama Karyawan",
      "Status",
      "Projek",
      "Durasi (Mnt)",
      "Lembur (Mnt)",
      "Keterangan",
      "Jarak GPS"
    ];

    const rows = attendanceHistory.map((h) => {
      const userObj = accounts.find((u) => u.id === h.userId || u.uid === h.userId || u.username === h.userId);
      const projObj = projects.find((p) => p.id === h.projectId);
      const displayId = userObj?.employeeId || (h.userId && h.userId.length > 8 ? h.userId.substring(0, 8) : h.userId) || "-";
      return [
        h.timestamp ? new Date(h.timestamp).toLocaleString("id-ID").replace(", ", " ") : "-",
        displayId,
        userObj?.name || "-",
        h.type || "IN",
        projObj?.name || h.projectId || "Generik/Kantor",
        h.type === "OUT" ? (h.durationMinutes || "-") : "-",
        h.type === "OUT" ? (h.overtimeMinutes || "0") : "-",
        h.lateReason || h.keterangan || "-",
        h.projectDistance !== undefined && h.projectDistance !== null ? `${Number(h.projectDistance).toFixed(2)} Km` : "T/A",
      ];
    });

    exportToPDF("Rekap_Absensi_Lapangan", "LAPORAN PRESENSI & KEHADIRAN SDM LAPANGAN", headers, rows);
  };

  // 3. Keuangan (Klaim & Kasbon) Handlers
  const handleDownloadFinanceExcel = () => {
    const headers = [
      "ID Pengajuan",
      "Nama Karyawan",
      "Bagian / Posisi",
      "Kategori Finansial",
      "Jumlah Pengajuan (Rp)",
      "Deskripsi Keperluan",
      "Tanggal Input",
      "Status Verifikasi"
    ];

    const combinedFinance = [
      ...cashAdvances.map(c => ({
        id: c.id || "-",
        employeeName: accounts.find(a => a.id === c.userId || a.uid === c.userId || a.username === c.userId)?.name || c.userName || "-",
        bagian: accounts.find(a => a.id === c.userId || a.uid === c.userId || a.username === c.userId)?.bagian || "-",
        category: "KASBON / PINJAMAN",
        amount: c.amount,
        purpose: c.description || c.notes || "-",
        date: c.timestamp ? new Date(c.timestamp).toLocaleDateString("id-ID") : "-",
        timestamp: c.timestamp,
        status: c.status || "PROSES"
      })),
      ...reimbursements.map(r => ({
        id: r.id || "-",
        employeeName: accounts.find(a => a.id === r.userId || a.uid === r.userId || a.username === r.userId)?.name || r.userName || "-",
        bagian: accounts.find(a => a.id === r.userId || a.uid === r.userId || a.username === r.userId)?.bagian || "-",
        category: "REIMBURSEMENT / KLAIM",
        amount: r.amount,
        purpose: r.description || r.notes || "-",
        date: r.timestamp ? new Date(r.timestamp).toLocaleDateString("id-ID") : "-",
        timestamp: r.timestamp,
        status: r.status || "PROSES"
      }))
    ].sort((a,b) => b.timestamp - a.timestamp);

    const rows = combinedFinance.map(f => [
      f.id,
      f.employeeName,
      f.bagian,
      f.category,
      f.amount,
      f.purpose,
      f.date,
      f.status
    ]);

    exportToExcel("Rekap_Keuangan_Klaim_Kasbon", headers, rows);
  };

  const handleDownloadFinancePDF = () => {
    const headers = [
      "ID",
      "Nama Karyawan",
      "Bagian",
      "Kategori",
      "Dana (Rp)",
      "Deskripsi / Keperluan",
      "Tgl",
      "Status"
    ];

    const combinedFinance = [
      ...cashAdvances.map(c => ({
        id: c.id || "-",
        employeeName: accounts.find(a => a.id === c.userId || a.uid === c.userId || a.username === c.userId)?.name || c.userName || "-",
        bagian: accounts.find(a => a.id === c.userId || a.uid === c.userId || a.username === c.userId)?.bagian || "-",
        category: "KASBON",
        amount: c.amount,
        purpose: c.description || c.notes || "-",
        date: c.timestamp ? new Date(c.timestamp).toLocaleDateString("id-ID") : "-",
        timestamp: c.timestamp,
        status: c.status || "PROSES"
      })),
      ...reimbursements.map(r => ({
        id: r.id || "-",
        employeeName: accounts.find(a => a.id === r.userId || a.uid === r.userId || a.username === r.userId)?.name || r.userName || "-",
        bagian: accounts.find(a => a.id === r.userId || a.uid === r.userId || a.username === r.userId)?.bagian || "-",
        category: "KLAIM REIMBURSE",
        amount: r.amount,
        purpose: r.description || r.notes || "-",
        date: r.timestamp ? new Date(r.timestamp).toLocaleDateString("id-ID") : "-",
        timestamp: r.timestamp,
        status: r.status || "PROSES"
      }))
    ].sort((a,b) => b.timestamp - a.timestamp);

    const rows = combinedFinance.map(f => [
      f.id.substring(0, 8),
      f.employeeName,
      f.bagian,
      f.category,
      f.amount.toLocaleString("id-ID"),
      f.purpose,
      f.date,
      f.status
    ]);

    exportToPDF("Rekap_Keuangan_Klaim_Kasbon", "LAPORAN PINJAMAN KASBON & KLAIM REIMBURSEMENT", headers, rows);
  };

  // 4. Laporan Lapangan Handlers
  const handleDownloadLaporanExcel = () => {
    const headers = [
      "Tanggal Input",
      "Nama Proyek",
      "Sektor Pekerjaan",
      "Status Progress",
      "Laporan / Masalah Lapangan",
      "Tautan Foto Lapangan"
    ];

    const rows = reports.map((r) => {
      return [
        r.timestamp ? new Date(r.timestamp).toLocaleString("id-ID") : "-",
        r.projectName || "-",
        r.title || r.sector || "-",
        r.status || "PROSES",
        r.description || "-",
        r.photoUrl ? (r.photoUrl.startsWith("data:") ? "[Foto Lapangan Terlampir]" : r.photoUrl) : (r.uploadedPhoto ? "[Foto Lapangan Terlampir]" : "Tanpa Foto")
      ];
    });

    exportToExcel("Rekap_Laporan_Progress_Proyek", headers, rows);
  };

  const handleDownloadLaporanPDF = () => {
    const headers = [
      "Tanggal",
      "Proyek",
      "Sektor Kerja",
      "Status",
      "Deskripsi Pekerjaan & Masalah Lapangan"
    ];

    const rows = reports.map((r) => {
      return [
        r.timestamp ? new Date(r.timestamp).toLocaleDateString("id-ID") : "-",
        r.projectName || "-",
        r.title || r.sector || "-",
        r.status || "PROSES",
        r.description || "-"
      ];
    });

    exportToPDF("Rekap_Laporan_Progress_Proyek", "LAPORAN PROGRESS & KONDISI PROYEK LAPANGAN", headers, rows);
  };

  // 5. Pemasukan & Pengeluaran Handlers
  const handleDownloadKeuanganExcel = () => {
    const headers = [
      "Tanggal Catat",
      "ID Transaksi",
      "Tipe (IN/OUT)",
      "Kategori",
      "Nominal (Rp)",
      "Metode Pembayaran",
      "Sumber Dana",
      "Rekening Penerima",
      "Deskripsi",
      "Proyek Terkait",
      "Pencatat"
    ];

    const rows = financialRecords.map((f) => {
      const projObj = projects.find((p) => p.id === f.referenceId);
      return [
        f.timestamp ? new Date(f.timestamp).toLocaleString("id-ID") : f.date || "-",
        f.customId || f.id || "-",
        f.type || "IN",
        f.category || "-",
        f.amount || 0,
        f.paymentMethod || "-",
        f.sumberDana || "-",
        f.rekPenerima || "-",
        f.description || "-",
        projObj?.name || f.referenceId || "Umum",
        f.recordedBy || "-"
      ];
    });

    exportToExcel("Rekap_Keuangan_Pemasukan_Pengeluaran", headers, rows);
  };

  const handleDownloadKeuanganPDF = () => {
    const headers = [
      "Tanggal",
      "ID Transaksi",
      "Tipe",
      "Kategori",
      "Nominal (Rp)",
      "Metode",
      "Pencatat"
    ];

    const rows = financialRecords.map((f) => {
      return [
        f.timestamp ? new Date(f.timestamp).toLocaleDateString("id-ID") : f.date || "-",
        f.customId || f.id || "-",
        f.type || "IN",
        f.category || "-",
        (f.amount || 0).toLocaleString("id-ID"),
        f.paymentMethod || "-",
        f.recordedBy || "-"
      ];
    });

    exportToPDF("Rekap_Keuangan_Pemasukan_Pengeluaran", "LAPORAN REKAPITULASI PEMASUKAN & PENGELUARAN KAS", headers, rows);
  };

  // 6. Hutang & Piutang Handlers
  const handleDownloadHutangPiutangExcel = () => {
    const headers = [
      "ID Catatan",
      "Tipe (HUTANG/PIUTANG)",
      "Kontak",
      "Deskripsi / Keterangan",
      "Nominal Awal (Rp)",
      "Total Terbayar (Rp)",
      "Sisa Saldo (Rp)",
      "Tanggal Jatuh Tempo",
      "Status",
      "Proyek Terkait",
      "Pencatat"
    ];

    const rows = debtRecords.map((r) => {
      const totalPaid = (r.payments || []).reduce((a, b) => a + b.amount, 0);
      const remaining = r.amount - totalPaid;
      const projObj = projects.find((p) => p.id === r.projectId);
      return [
        r.customId || r.id || "-",
        r.type || "HUTANG",
        r.contactName || "-",
        r.title + (r.description ? " - " + r.description : ""),
        r.amount || 0,
        totalPaid,
        remaining,
        r.dueDate || "-",
        r.status === "PAID" ? "LUNAS" : r.status === "PARTIAL" ? "DICICIL" : "BELUM BAYAR",
        projObj?.name || r.projectId || "Umum",
        r.recordedBy || "-"
      ];
    });

    exportToExcel("Rekap_Hutang_Piutang_Perusahaan", headers, rows);
  };

  const handleDownloadHutangPiutangPDF = () => {
    const headers = [
      "ID",
      "Tipe",
      "Kontak",
      "Dana Awal (Rp)",
      "Terbayar (Rp)",
      "Sisa (Rp)",
      "Tempo",
      "Status"
    ];

    const rows = debtRecords.map((r) => {
      const totalPaid = (r.payments || []).reduce((a, b) => a + b.amount, 0);
      const remaining = r.amount - totalPaid;
      return [
        r.customId || r.id || "-",
        r.type || "HUTANG",
        r.contactName || "-",
        (r.amount || 0).toLocaleString("id-ID"),
        totalPaid.toLocaleString("id-ID"),
        remaining.toLocaleString("id-ID"),
        r.dueDate || "-",
        r.status === "PAID" ? "LUNAS" : r.status === "PARTIAL" ? "DICICIL" : "BELUM BAYAR"
      ];
    });

    exportToPDF("Rekap_Hutang_Piutang_Perusahaan", "LAPORAN STATUS DAN DATA HUTANG PIUTANG PERUSAHAAN", headers, rows);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="text-emerald-600" size={32} />
            Integrasi Google Sheets
          </h1>
          <p className="text-slate-500 font-medium">
            Ekspor dan sinkronkan absensi, gaji, laporan, dan klaim secara real-time ke spreadsheet Anda.
          </p>
        </div>
        
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Dashboard Utama
          </button>
          <button
            onClick={() => setActiveTab("offline-export")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "offline-export" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Unduh Excel / PDF (Offline)
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "config" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Konfigurasi Developer
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Block: Connection status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CloudLightning size={20} className="text-amber-500" />
                Status Konektivitas Google
              </h3>

              {!googleUser ? (
                <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <FileSpreadsheet className="text-indigo-600" size={28} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Akun Google Belum Terhubung</h4>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm">
                      Hubungkan akun Google Drive & Sheets Anda terlebih dahulu dengan melengkapi persetujuan keamanan.
                    </p>
                  </div>
                  
                  {/* Brand Compliance Google Sign in button */}
                  <button
                    onClick={handleConnectGoogle}
                    className="flex items-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-5 py-3 rounded-2xl transition shadow-sm cursor-pointer"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span className="text-xs uppercase tracking-wider">Sambungkan Google Sheets</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50/20 border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/40 flex items-center justify-center">
                      <CheckCircle2 size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#0f2d1e] text-sm">Google Sheets Terkoneksi</h4>
                      <p className="text-slate-500 text-xs mt-0.5">Sesi API Google Anda aktif.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnectGoogle}
                    className="flex items-center gap-2 text-rose-600 hover:text-white hover:bg-rose-500 border border-rose-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase transition-all"
                  >
                    <Trash2 size={14} /> Terputus
                  </button>
                </div>
              )}

              {/* Data module scopes information Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Aplikasi Menyinkronkan Data Berikut:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "absensi", label: "Absensi Lapangan", desc: "Clock-In & Clock-Out" },
                    { id: "gaji", label: "Gaji & Slip", desc: "Payroll Akumulatif" },
                    { id: "klaim", label: "Kasbon & Klaim", desc: "Kas & Reimbursement" },
                    { id: "laporan", label: "Laporan Lapangan", desc: "Foto & Status Kerja" },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{item.label}</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Panel */}
              {googleUser && (
                <div className="flex flex-col md:flex-row gap-3 pt-3 border-t border-slate-50">
                  <button
                    onClick={handleForceSync}
                    disabled={isSyncing}
                    className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Menyelaraskan..." : "Sinkronisasikan Semua Data Sekarang"}
                  </button>

                  <a
                    href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                    target="_blank"
                    rel="noreferrer noreferrer"
                    className="px-6 py-4 bg-slate-900 hover:bg-slate-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition"
                  >
                    Buka Google Sheet <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Feedback messages */}
              <AnimatePresence>
                {syncStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed font-bold ${
                      syncStatus.success
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                        : "bg-rose-50 text-rose-800 border-rose-100"
                    }`}
                  >
                    {syncStatus.success ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="text-rose-600 shrink-0" />
                    )}
                    <div>
                      <span>{syncStatus.message}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Block: Stats & Configuration overview */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Database size={20} className="text-indigo-600" />
                Informasi Sinkronisasi
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col gap-1 py-2.5 border-b border-slate-50 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">Spreadsheet ID Target:</span>
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-[10px] text-slate-700 font-extrabold max-w-[140px] truncate" title={spreadsheetId}>
                      {spreadsheetId}
                    </span>
                  </div>
                  <div className="mt-2">
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0f2d1e] rounded-xl text-[11px] font-black tracking-tight flex items-center justify-center gap-1 transition"
                    >
                      Buka Tautan Spreadsheet <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-50 text-xs">
                  <span className="font-bold text-slate-500">Kepemilikan Sheet:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    {spreadsheetId === "1uQ2mksE2z95Co2_VWVGkRrQrMtzOJRiSkwsv__QQB7E" 
                      ? "Template Default (gigt.sheets.sync)" 
                      : "Milik Anda Sendiri"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-50 text-xs">
                  <span className="font-bold text-slate-500">Real-time Otomatis:</span>
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-wider ${
                    realtimeEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                  }`}>
                    {realtimeEnabled ? "AKTIF" : "NONAKTIF"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-50 text-xs">
                  <span className="font-bold text-slate-500">Sinkronisasi Terakhir:</span>
                  <span className="font-black text-slate-800 text-[11px]">
                    {lastSyncTime || "Belum Pernah"}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-[10px] text-indigo-900 leading-relaxed font-semibold space-y-2">
                <div className="flex gap-2 text-indigo-950 font-black uppercase text-[10px]">
                  <Settings size={12} /> Cara Pakai Sheet Sendiri:
                </div>
                <p>
                  1. Buat spreadsheet kosong baru di Google Sheets Anda.
                </p>
                <p>
                  2. Salin URL/ID Spreadsheet tersebut dari bagian browser Anda.
                </p>
                <p>
                  3. Klik tab <strong className="text-indigo-600 font-extrabold">"Konfigurasi Developer"</strong> di atas, masukkan URL/ID baru, lalu simpan! Data Anda akan terekspor secara profesional ke sheet Anda sendiri secara otomatis.
                </p>
              </div>

              <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-4 text-[10px] text-amber-800/80 leading-relaxed font-bold space-y-2">
                <div className="flex gap-2 text-amber-800 font-black uppercase text-[10px]">
                  <Shield size={12} /> Keamanan & Karyawan
                </div>
                <p>
                  Karyawan Anda cukup mengoperasikan aplikasi seperti biasa. Tidak dibutuhkan konfigurasi Google apa pun bagi sisi karyawan.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === "offline-export" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileDown size={22} className="text-indigo-600" />
              Ekspor Laporan Offline (Excel & PDF)
            </h3>
            <p className="text-slate-500 font-medium text-xs mt-1">
              Unduh salinan data instan langsung ke perangkat Anda tanpa memerlukan koneksi Google Sheets. Data diekspor secara rapi dan profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: SDM & Gaji Karyawan */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Users2 size={20} />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">SDM & Gaji (Payroll)</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Data lengkap rekapitulasi kerja karyawan, gaji harian, besaran lembur, potongan pinjaman kasbon, hingga nominal total gaji bersih.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDownloadGajiExcel}
                  className="flex-1 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} /> Unduh Excel
                </button>
                <button
                  onClick={handleDownloadGajiPDF}
                  className="flex-1 py-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} /> Unduh PDF
                </button>
              </div>
            </div>

            {/* Card 2: Absensi Lapangan */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <CalendarDays size={20} />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Kehadiran (Absensi)</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Log lengkap absensi Clock-In dan Clock-Out karyawan lapangan beserta nama proyek, jarak GPS, waktu presisi, swafoto, dan alasan keterlambatan.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDownloadAbsensiExcel}
                  className="flex-1 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} /> Unduh Excel
                </button>
                <button
                  onClick={handleDownloadAbsensiPDF}
                  className="flex-1 py-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} /> Unduh PDF
                </button>
              </div>
            </div>

            {/* Card 3: Keuangan (Kasbon & Reimburse) */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <DollarSign size={20} />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Aliran Kas (Klaim & Kasbon)</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Rekapitulasi berkas keuangan dan pendanaan lapangan mencakup klaim operasional (reimbursement) serta pinjaman panjar kasbon karyawan.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDownloadFinanceExcel}
                  className="flex-1 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} /> Unduh Excel
                </button>
                <button
                  onClick={handleDownloadFinancePDF}
                  className="flex-1 py-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} /> Unduh PDF
                </button>
              </div>
            </div>

            {/* Card 4: Laporan Harian */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                  <ClipboardList size={20} />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Laporan Proyek Lapangan</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Data laporan performansi kerja berkala, swafoto proyek fisik, kendala operasional lapangan, dan persentase progress sektor kerja.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                   onClick={handleDownloadLaporanExcel}
                  className="flex-1 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} /> Unduh Excel
                </button>
                <button
                  onClick={handleDownloadLaporanPDF}
                  className="flex-1 py-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} /> Unduh PDF
                </button>
              </div>
            </div>

            {/* Card 5: Pemasukan & Pengeluaran Kas */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#e6f4ea] rounded-xl flex items-center justify-center text-emerald-600">
                  <DollarSign size={20} />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Pemasukan & Pengeluaran</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Data rekapitulasi masuk-keluar arus keuangan, klasifikasi berdasarkan kategori finansial, sistem pembayaran, dan sumber dana.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDownloadKeuanganExcel}
                  className="flex-1 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} /> Unduh Excel
                </button>
                <button
                  onClick={handleDownloadKeuanganPDF}
                  className="flex-1 py-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} /> Unduh PDF
                </button>
              </div>
            </div>

            {/* Card 6: Hutang & Piutang */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                  <Layers size={20} />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Hutang & Piutang</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Log kontrol tagihan klien dan tanggungan pinjaman vendor lengkap dengan tanggal masa tenggat jatuh tempo serta persentase lunas.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDownloadHutangPiutangExcel}
                  className="flex-1 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} /> Unduh Excel
                </button>
                <button
                  onClick={handleDownloadHutangPiutangPDF}
                  className="flex-1 py-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} /> Unduh PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "config" && (
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm max-w-2xl space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings size={20} className="text-indigo-600" />
            Pengaturan Pengembang & Spreadsheet
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Target Google Spreadsheet URL / ID
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => {
                  let val = e.target.value.trim();
                  if (val.includes("spreadsheets/d/")) {
                    const match = val.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                    if (match && match[1]) {
                      val = match[1];
                    }
                  }
                  setSpreadsheetId(val);
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                placeholder="Masukkan URL Spreadsheet atau ID"
              />
              <span className="text-[10px] text-slate-400 mt-1 pl-1">
                Anda dapat menyalin url mentah dari browser Anda dan merekatkannya di sini secara langsung.
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-3xl">
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs">Sync Real-time Saat Operasional</h4>
                <p className="text-slate-400 text-[10px] mt-0.5">Automasi push records baru ke drive.</p>
              </div>
              
              <button
                onClick={() => setRealtimeEnabled(!realtimeEnabled)}
                className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
                  realtimeEnabled ? "bg-indigo-600" : "bg-slate-200"
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow absolute top-1 transition-all ${
                  realtimeEnabled ? "left-7" : "left-1"
                }`} />
              </button>
            </div>
            
            <button
              onClick={handleSaveConfig}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all mt-4 cursor-pointer"
            >
              Simpan Konfigurasi Cloud
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
