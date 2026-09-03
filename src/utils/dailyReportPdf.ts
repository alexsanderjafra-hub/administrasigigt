import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { DailyReport } from "../types";
import { extractCleanAddress } from "../lib/utils";

export const formatIndonesianDateUpper = (ts: number | string | Date | undefined): string => {
  if (!ts) return "HARI INI";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts).toUpperCase();
  const months = [
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatIndonesianDateShort = (ts: number | string | Date | undefined): string => {
  if (!ts) return "-";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Renders the full contents of a single DailyReport into a jsPDF instance.
 * Supports dual logos, detailed tables, numbered lists, adaptive photo layout, and signature section.
 */
export const renderDailyReportContentToPDF = (
  doc: jsPDF,
  report: DailyReport,
  pageOffset: number = 1
) => {
  const companyName =
    report.contractor ||
    localStorage.getItem("custom_pt_name") ||
    "PT. GARDA INOVASI GLOBALTECH";

  // 1. Logo Kontraktor / Vendor (SEBELAH KIRI)
  const contractorLogo =
    report.contractorLogo ||
    localStorage.getItem("custom_contractor_logo") ||
    localStorage.getItem("custom_logo_image") ||
    localStorage.getItem("company_logo") ||
    "";

  // 2. Logo Klien / Pemilik (SEBELAH KANAN)
  const clientLogo =
    report.clientLogo ||
    (report.projectId
      ? localStorage.getItem(`custom_client_logo_${report.projectId}`)
      : null) ||
    localStorage.getItem("custom_client_logo") ||
    "";

  // Render Logo Kontraktor (Kiri)
  if (contractorLogo) {
    try {
      doc.addImage(contractorLogo, "PNG", 15, 6, 24, 15);
    } catch (e) {
      console.error("Error drawing contractor logo to PDF:", e);
    }
  }

  // Header Center Text
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN HARIAN PROYEK", 105, 11, { align: "center" });

  doc.setFontSize(9);
  doc.text(companyName.toUpperCase(), 105, 16, { align: "center" });

  if (report.clientName) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`KLIEN / PEMILIK: ${report.clientName.toUpperCase()}`, 105, 20, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);
  }

  // Render Logo Klien (Kanan)
  if (clientLogo) {
    try {
      doc.addImage(clientLogo, "PNG", 171, 6, 24, 15);
    } catch (e) {
      console.error("Error drawing client logo to PDF:", e);
    }
  }

  // Separator Line
  doc.setDrawColor(180, 195, 210);
  doc.setLineWidth(0.4);
  doc.line(15, 23, 195, 23);
  doc.setLineWidth(0.2);

  // Info Table
  const reportDateObj = new Date(report.timestamp || report.date || Date.now());
  const formattedDateIndo = !isNaN(reportDateObj.getTime())
    ? reportDateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : String(report.date || "-");

  const infoData = [
    [
      "Nama Projek",
      `: ${report.projectName || "-"}`,
      "Lokasi",
      `: ${extractCleanAddress(report.location) || "-"}`,
    ],
    [
      "Klien / Pemilik",
      `: ${report.clientName || "-"}`,
      "Kategori",
      `: ${report.workType || "Konstruksi & Sipil"}`,
    ],
    [
      "Kontraktor",
      `: ${report.contractor || companyName}`,
      "Tanggal Sesi",
      `: ${formattedDateIndo}`,
    ],
  ];

  autoTable(doc, {
    startY: 25,
    margin: { left: 15, right: 15 },
    body: infoData,
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: 1 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 32 },
      2: { fontStyle: "bold", cellWidth: 30 },
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 5;

  // 1. Man Power
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("1. TENAGA KERJA (MAN POWER)", 15, currentY);

  const staffData = (report.staff || []).map((s, i) => [
    i + 1,
    s.jabatan || "-",
    s.jumlah || 0,
    "Orang",
  ]);

  autoTable(doc, {
    startY: currentY + 2,
    margin: { left: 15, right: 15 },
    head: [["No", "Jabatan / Keahlian", "Jumlah Personil", "Satuan"]],
    body: staffData.length > 0 ? staffData : [[1, "Tenaga Umum", 1, "Orang"]],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8, cellPadding: 1.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 2. Tools & Materials Used
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("2. ALAT KERJA & BAHAN YANG DIGUNAKAN", 15, currentY);

  const toolsMaterialsData: (string | number)[][] = [];
  const toolsList = report.tools || [];
  const materialsList = report.materials || [];
  const maxLen = Math.max(toolsList.length, materialsList.length, 1);

  for (let i = 0; i < maxLen; i++) {
    const toolItem = toolsList[i];
    const toolName = toolItem
      ? typeof toolItem === "string"
        ? toolItem
        : (toolItem as any).name || "-"
      : "-";

    const matItem = materialsList[i];
    const matName = matItem
      ? typeof matItem === "string"
        ? matItem
        : matItem.jenis || (matItem as any).name || "-"
      : "-";

    toolsMaterialsData.push([i + 1, toolName, matName]);
  }

  autoTable(doc, {
    startY: currentY + 2,
    margin: { left: 15, right: 15 },
    head: [["No", "Alat yang Digunakan", "Bahan yang Digunakan"]],
    body: toolsMaterialsData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8, cellPadding: 1.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 3. Activity
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("3. URAIAN PEKERJAAN (ACTIVITY)", 15, currentY);

  const activityData = (report.activities || []).map((a, i) => [i + 1, a]);

  autoTable(doc, {
    startY: currentY + 2,
    margin: { left: 15, right: 15 },
    head: [["No", "Deskripsi Uraian Pekerjaan"]],
    body: activityData.length > 0 ? activityData : [[1, "Pekerjaan Harian"]],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8, cellPadding: 1.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 4. Notes & Operational
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("4. CATATAN, KENDALA & OPERASIONAL", 15, currentY);

  const weatherType =
    report.weather?.find((w: any) => w.hour === 12)?.type || "Cerah";

  const startHour =
    report.workHours?.[0] !== undefined
      ? `${String(report.workHours[0]).padStart(2, "0")}:00`
      : "08:00";
  const endHour =
    report.workHours?.[1] !== undefined
      ? `${String(report.workHours[1]).padStart(2, "0")}:00`
      : "17:00";

  const formatNumberedList = (
    data: string | string[] | undefined,
    defaultText = "-",
  ) => {
    if (!data) return defaultText;
    if (Array.isArray(data)) {
      const validItems = data
        .map((d) => (typeof d === "string" ? d.trim() : ""))
        .filter(Boolean);
      if (validItems.length === 0) return defaultText;
      return validItems.map((item, idx) => `${idx + 1}. ${item}`).join("\n");
    }
    return String(data).trim() || defaultText;
  };

  const obstaclesText = formatNumberedList(
    report.obstacles,
    "Tidak Ada Kendala",
  );
  const nextPlanText = formatNumberedList(report.nextPlan, "-");
  const notesText = formatNumberedList(report.notes, "-");

  autoTable(doc, {
    startY: currentY + 2,
    margin: { left: 15, right: 15 },
    body: [
      ["Kondisi Cuaca Hari Ini", `: ${weatherType}`],
      [
        "Jam Operasional Kerja",
        `: ${startHour} - ${endHour} WIB (Lembur: ${report.overtime || 0} Jam)`,
      ],
      [
        "Kendala Lapangan",
        `: ${obstaclesText.includes("\n") ? "\n" + obstaclesText : obstaclesText}`,
      ],
      [
        "Rencana Pekerjaan Besok",
        `: ${nextPlanText.includes("\n") ? "\n" + nextPlanText : nextPlanText}`,
      ],
      [
        "Catatan Khusus Lapangan",
        `: ${notesText.includes("\n") ? "\n" + notesText : notesText}`,
      ],
    ],
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 1.5, valign: "top" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 42 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 5. Photos - Adaptive Layout for Landscape (8x6) & Portrait (6x8)
  if (report.photos && report.photos.length > 0) {
    if (currentY > 195) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("5. DOKUMENTASI FOTO PROGRESS", 15, currentY);
    currentY += 4;

    let currentX = 15;
    let rowMaxHeight = 0;

    report.photos.forEach((photo, index) => {
      let isLandscape = true;
      let targetW = 84; // 8x6 proportional landscape (approx 84mm x 63mm)
      let targetH = 63;

      try {
        const props = (doc as any).getImageProperties(photo);
        if (props && props.width && props.height) {
          isLandscape = props.width >= props.height;
          const aspect = props.width / props.height;
          if (isLandscape) {
            targetW = 84;
            targetH = Math.min(68, Math.max(50, Math.round(84 / aspect)));
          } else {
            targetW = 56;
            targetH = Math.min(80, Math.max(65, Math.round(56 / aspect)));
          }
        }
      } catch (e) {
        targetW = 84;
        targetH = 63;
      }

      if (currentX + targetW > 196) {
        currentX = 15;
        currentY += rowMaxHeight + 8;
        rowMaxHeight = 0;
      }

      if (currentY + targetH + 8 > 275) {
        doc.addPage();
        currentY = 20;
        currentX = 15;
        rowMaxHeight = 0;
      }

      // Draw photo card background & border
      doc.setDrawColor(220, 225, 230);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(currentX, currentY, targetW, targetH + 6, 1, 1, "FD");

      try {
        doc.addImage(
          photo,
          "JPEG",
          currentX + 0.5,
          currentY + 0.5,
          targetW - 1,
          targetH - 1,
        );
      } catch (e) {
        console.error("Error adding image to PDF", e);
      }

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Dokumentasi #${index + 1} (${isLandscape ? "Landscape 8x6" : "Portrait 6x8"})`,
        currentX + 2,
        currentY + targetH + 4,
      );
      doc.setTextColor(0, 0, 0);

      rowMaxHeight = Math.max(rowMaxHeight, targetH + 6);
      currentX += targetW + (isLandscape ? 12 : 6);
    });

    currentY += rowMaxHeight + 8;
  }

  // Signatures
  if (currentY > 245) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Dilaporkan Oleh,", 25, currentY + 4);
  doc.text("Mengetahui,", 155, currentY + 4);

  doc.text("____________________", 20, currentY + 26);
  doc.setFont("helvetica", "bold");
  doc.text(report.submittedByName || "Supervisor Lapangan", 22, currentY + 30);
  doc.setFont("helvetica", "normal");
  doc.text(report.submittedByRole || "Team Leader / Mandor", 20, currentY + 34);

  doc.text("____________________", 150, currentY + 26);
  doc.setFont("helvetica", "bold");
  doc.text("Project Manager / Direktur", 152, currentY + 30);
  doc.setFont("helvetica", "normal");
  doc.text(companyName, 150, currentY + 34);
};

/**
 * Downloads a single Daily Report PDF with the standardized filename:
 * DAILY REPORT [NAMA PROJEK] [TANGGAL DI BUAT].pdf
 * (e.g. DAILY REPORT PROJEK HRI KARAWANG 30 AGUSTUS 2026.pdf)
 */
export const generateDailyReportPDF = (report: DailyReport) => {
  const doc = new jsPDF("p", "mm", "a4");
  renderDailyReportContentToPDF(doc, report);

  const rawProjectName = report.projectName || "PROJEK";
  const cleanProjName = rawProjectName.toUpperCase().replace(/[/\\?%*:|"<>]/g, " ").trim();
  const dateFormatted = formatIndonesianDateUpper(report.timestamp || report.date || Date.now());

  const filename = `DAILY REPORT ${cleanProjName} ${dateFormatted}.pdf`;
  doc.save(filename);
};

/**
 * Downloads a merged compilation of multiple Daily Reports into 1 PDF document.
 * E.g., 30 daily reports (typically 2 pages each) compiles into 1 consolidated 60-page PDF!
 * Filename: DAILY REPORT [NAMA PROJEK] (KOMPILASI [JUMLAH] HARI - [TANGGAL AWAL] SD [TANGGAL AKHIR]).pdf
 */
export const generateBatchDailyReportsPDF = (
  reports: DailyReport[],
  customProjectName?: string
) => {
  if (!reports || reports.length === 0) {
    alert("Tidak ada laporan harian yang dipilih untuk di-download.");
    return;
  }

  // Sort reports chronologically (oldest to newest)
  const sortedReports = [...reports].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.date || 0).getTime();
    const timeB = new Date(b.timestamp || b.date || 0).getTime();
    return timeA - timeB;
  });

  const doc = new jsPDF("p", "mm", "a4");

  sortedReports.forEach((report, index) => {
    if (index > 0) {
      doc.addPage();
    }
    renderDailyReportContentToPDF(doc, report);
  });

  const rawProjectName =
    customProjectName || sortedReports[0]?.projectName || "PROJEK";
  const cleanProjName = rawProjectName.toUpperCase().replace(/[/\\?%*:|"<>]/g, " ").trim();

  const firstDate = formatIndonesianDateUpper(
    sortedReports[0]?.timestamp || sortedReports[0]?.date || Date.now()
  );
  const lastDate = formatIndonesianDateUpper(
    sortedReports[sortedReports.length - 1]?.timestamp ||
      sortedReports[sortedReports.length - 1]?.date ||
      Date.now()
  );

  let filename: string;
  if (sortedReports.length === 1) {
    filename = `DAILY REPORT ${cleanProjName} ${firstDate}.pdf`;
  } else if (firstDate === lastDate) {
    filename = `DAILY REPORT ${cleanProjName} (KOMPILASI ${sortedReports.length} LAPORAN ${firstDate}).pdf`;
  } else {
    filename = `DAILY REPORT ${cleanProjName} (KOMPILASI ${sortedReports.length} HARI - ${firstDate} SD ${lastDate}).pdf`;
  }

  doc.save(filename);
};
