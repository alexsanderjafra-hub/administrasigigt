import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Printer,
  FileText,
  CheckCircle2,
  Trash2,
  Plus,
  Settings,
  Scale,
  AlignLeft,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  Check,
  Edit,
  Eye,
  Download,
  Building2,
  Percent,
  Upload
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Custom helper to parse and format clean specification lines without duplication or artificial prefixes
const getCleanSpecLines = (item: any): string[] => {
  const specLines: string[] = [];
  const keysAdded = new Set<string>();

  const appendSpec = (key: string, val: string) => {
    if (!val) return;
    const cleanKey = key.trim().toLowerCase();
    if (keysAdded.has(cleanKey)) return;
    keysAdded.add(cleanKey);
    specLines.push(`${key.trim()} : ${val.trim()}`);
  };

  // Add from individual fields first if they exist
  if (item.capacity) appendSpec("Capacity/Kapasitas", item.capacity);
  if (item.dimensions) appendSpec("Dimensions/Dimensi", item.dimensions);
  if (item.material) appendSpec("Material/Bahan", item.material);
  if (item.power) appendSpec("Power/Daya", item.power);
  if (item.flowRate || item.flowrate) appendSpec("Flow Rate/Debit", item.flowRate || item.flowrate);
  if (item.pressure) appendSpec("Pressure/Tekanan", item.pressure);
  if (item.brand) appendSpec("Brand/Merek", item.brand);
  if (item.warranty) appendSpec("Warranty/Garansi", item.warranty);

  // Parse specifications text
  if (item.specifications) {
    const rawLines = item.specifications.split("\n");
    rawLines.forEach((line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.includes(":")) {
        const idx = trimmed.indexOf(":");
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        if (k && v) {
          appendSpec(k, v);
        }
      } else {
        // Line doesn't contain a colon (e.g. list points)
        specLines.push(trimmed);
      }
    });
  }

  return specLines;
};

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "quotation" | "boq";
  initialQuotationData?: any;
  onSaveQuotation?: (updatedData: any) => Promise<void>;
  initialBoqData?: any;
  boqProjects?: any[];
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  type,
  initialQuotationData,
  onSaveQuotation,
  initialBoqData,
  boqProjects = []
}) => {
  // --- STATE CONFIGS FOR EXPORT ---
  const [paperSize, setPaperSize] = useState<"a4" | "f4" | "letter">("a4");
  const [marginStyle, setMarginStyle] = useState<"standard" | "compact" | "wide">("standard");
  const [showCompanyLogo, setShowCompanyLogo] = useState(true);
  const [showDigitalStamp, setShowDigitalStamp] = useState(true);
  const [showTncNotes, setShowTncNotes] = useState(true);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("preview");

  // --- DYNAMIC DISCOUNTS, TAX & COMPANY CREDENTIALS STATE ---
  const [discountType, setDiscountType] = useState<"percent" | "rupiah">("rupiah");
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(11);

  const [compName, setCompName] = useState("PT. GARDA INOVASI GLOBALTECH");
  const [compAddress1, setCompAddress1] = useState("Perumahan Griya Sepatan Blok B6 Nomor 35, RT.02/09");
  const [compAddress2, setCompAddress2] = useState("Ds. Pisangan Jaya, Kec. Sepatan, Kab Tangerang");
  const [compCityZip, setCompCityZip] = useState("Banten, 15525");
  const [compPhone, setCompPhone] = useState("0888-1687-794");
  const [compEmail, setCompEmail] = useState("info@globaltech.id");
  const [compOffice, setCompOffice] = useState("REGIONAL OFFICE BANTEN");
  const [compLogoUrl, setCompLogoUrl] = useState<string>("");

  // --- COMPONENT / DATA STATE ---
  // If quotation
  const [qNum, setQNum] = useState("");
  const [qRecipient, setQRecipient] = useState("");
  const [qAttention, setQAttention] = useState("");
  const [qDate, setQDate] = useState("");
  const [qJobDesc, setQJobDesc] = useState("");
  const [qNotes, setQNotes] = useState("Syarat pembayaran:\n- DP 50% saat kontrak disetujui\n- Pelunasan 55% setelah komisioning unit terpasang\n- Garansi mekanikal & elektrikal 12 bulan.");
  const [qPreparedBy, setQPreparedBy] = useState("PT. GARDA INOVASI GLOBALTECH");
  const [qItems, setQItems] = useState<any[]>([]);
  const [connectedBoqId, setConnectedBoqId] = useState("");

  // If BOQ spec
  const [bName, setBName] = useState("");
  const [bType, setBType] = useState("");
  const [bCapacity, setBCapacity] = useState("");
  const [bClient, setBClient] = useState("");
  const [bDesc, setBDesc] = useState("");
  const [bItems, setBItems] = useState<any[]>([]);

  // Synchronize initial data
  useEffect(() => {
    if (isOpen) {
      if (type === "quotation" && initialQuotationData) {
        setQNum(initialQuotationData.number || "");
        setQRecipient(initialQuotationData.recipient || "");
        setQAttention(initialQuotationData.attention || "");
        setQDate(initialQuotationData.date || new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }));
        setQJobDesc(initialQuotationData.jobDescription || "");
        setQNotes(initialQuotationData.notes || "Syarat pembayaran:\n- DP 50% saat kontrak disetujui\n- Pelunasan 55% setelah komisioning unit terpasang\n- Garansi mekanikal & elektrikal 12 bulan.");
        setQPreparedBy(initialQuotationData.preparedBy || "PT. GARDA INOVASI GLOBALTECH");
        setQItems(initialQuotationData.items ? [...initialQuotationData.items] : []);
        setConnectedBoqId(initialQuotationData.boqProjectId || "");

        // Load dynamic attributes
        setDiscountType(initialQuotationData.discountType || "rupiah");
        setDiscountVal(initialQuotationData.discountVal || 0);
        setTaxRate(initialQuotationData.taxRate !== undefined ? initialQuotationData.taxRate : 11);
        setCompName(initialQuotationData.compName || "PT. GARDA INOVASI GLOBALTECH");
        setCompAddress1(initialQuotationData.compAddress1 || "Perumahan Griya Sepatan Blok B6 Nomor 35, RT.02/09");
        setCompAddress2(initialQuotationData.compAddress2 || "Ds. Pisangan Jaya, Kec. Sepatan, Kab Tangerang");
        setCompCityZip(initialQuotationData.compCityZip || "Banten, 15525");
        setCompPhone(initialQuotationData.compPhone || "0888-1687-794");
        setCompEmail(initialQuotationData.compEmail || "info@globaltech.id");
        setCompOffice(initialQuotationData.compOffice || "REGIONAL OFFICE BANTEN");
        setCompLogoUrl(initialQuotationData.compLogoUrl || "");
      } else if (type === "boq" && initialBoqData) {
        setBName(initialBoqData.name || "");
        setBType(initialBoqData.projType || "WTP");
        setBCapacity(initialBoqData.capacity || "");
        setBClient(initialBoqData.clientName || "");
        setBDesc(initialBoqData.description || "");
        setBItems(initialBoqData.items ? [...initialBoqData.items] : []);
      }
    }
  }, [isOpen, type, initialQuotationData, initialBoqData]);

  if (!isOpen) return null;

  // Find connected BOQ project if any
  const matchedBoq = type === "quotation" && connectedBoqId
    ? boqProjects.find(b => b.id === connectedBoqId)
    : null;

  const currentBoqItemsToUse = matchedBoq ? matchedBoq.items || [] : [];

  // Recalculate financial summary for quotation live preview
  const qSubtotal = qItems.reduce((acc, el) => acc + ((el.vol || el.quantity || 1) * (el.unitPrice || 0)), 0);
  const qDiscountAmount = discountType === "percent" 
    ? Math.round(qSubtotal * (discountVal / 100))
    : discountVal;
  const qTaxBase = Math.max(0, qSubtotal - qDiscountAmount);
  const qTax = Math.round(qTaxBase * (taxRate / 100));
  const qGrandTotal = qTaxBase + qTax;

  const numberToWordsID = (num: number): string => {
    const values = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    let result = "";

    if (num < 12) {
      result = values[num];
    } else if (num < 20) {
      result = numberToWordsID(num - 10) + " belas";
    } else if (num < 100) {
      result = numberToWordsID(Math.floor(num / 10)) + " puluh " + values[num % 10];
    } else if (num < 200) {
      result = "seratus " + numberToWordsID(num - 100);
    } else if (num < 1000) {
      result = numberToWordsID(Math.floor(num / 100)) + " ratus " + numberToWordsID(num % 100);
    } else if (num < 2000) {
      result = "seribu " + numberToWordsID(num - 1000);
    } else if (num < 1000000) {
      result = numberToWordsID(Math.floor(num / 1000)) + " ribu " + numberToWordsID(num % 1000);
    } else if (num < 1000000000) {
      result = numberToWordsID(Math.floor(num / 1000000)) + " juta " + numberToWordsID(num % 1000000);
    } else if (num < 1000000000000) {
      result = numberToWordsID(Math.floor(num / 1000000000)) + " milyar " + numberToWordsID(num % 1000000000);
    } else if (num < 1000000000000000) {
      result = numberToWordsID(Math.floor(num / 1000000000000)) + " triliun " + numberToWordsID(num % 1000000000000);
    }
    return result.trim().replace(/\s+/g, " ");
  };

  // Live edits item handlers for Quotation
  const handleUpdateQItem = (idx: number, field: string, val: any) => {
    const updated = [...qItems];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === "vol" || field === "unitPrice") {
      const vol = Number(field === "vol" ? val : updated[idx].vol || 1);
      const price = Number(field === "unitPrice" ? val : updated[idx].unitPrice || 0);
      updated[idx].total = vol * price;
    }
    setQItems(updated);
  };

  const handleAddQItem = () => {
    setQItems([
      ...qItems,
      { description: "Item Baru", vol: 1, unit: "Unit", unitPrice: 0, total: 0 }
    ]);
  };

  const handleRemoveQItem = (idx: number) => {
    if (qItems.length <= 1) return;
    setQItems(qItems.filter((_, i) => i !== idx));
  };

  // Live edits item handlers for BOQ Spec
  const handleUpdateBItem = (idx: number, field: string, val: any) => {
    const updated = [...bItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setBItems(updated);
  };

  const handleAddBItem = () => {
    setBItems([
      ...bItems,
      { name: "Komponen Baru", brand: "Standar", quantity: 1, unit: "Unit", specifications: "" }
    ]);
  };

  const handleRemoveBItem = (idx: number) => {
    if (bItems.length <= 1) return;
    setBItems(bItems.filter((_, i) => i !== idx));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveOnly = async () => {
    if (type !== "quotation" || !onSaveQuotation) return;
    setIsSaving(true);
    try {
      const payload = {
        number: qNum,
        recipient: qRecipient,
        attention: qAttention,
        date: qDate,
        jobDescription: qJobDesc,
        notes: qNotes,
        preparedBy: qPreparedBy,
        items: qItems,
        boqProjectId: connectedBoqId,
        subTotal: qSubtotal,
        discountType,
        discountVal,
        taxRate,
        compName,
        compAddress1,
        compAddress2,
        compCityZip,
        compPhone,
        compEmail,
        compOffice,
        compLogoUrl,
        tax: qTax,
        grandTotal: qGrandTotal
      };
      await onSaveQuotation(payload);
      onClose();
    } catch (err) {
      console.error("Gagal menyimpan penawaran:", err);
      alert("Gagal menyimpan penawaran. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- EXPORT PDF GENERATION WITH LIVE PARAMETERS ---
  const handleGeneratePDF = async () => {
    // Config values based on selection
    const marginSize = marginStyle === "compact" ? 10 : marginStyle === "wide" ? 20 : 15;
    
    // Create jsPDF instance
    let docFormat = "a4";
    if (paperSize === "f4") docFormat = "folio"; // Folio matches closest or custom dimensions [215, 330]
    else if (paperSize === "letter") docFormat = "letter";

    // Initialize with direct coordinates
    const isCustomF4 = paperSize === "f4";
    const pdf = isCustomF4 
      ? new jsPDF("p", "mm", [215, 330]) 
      : new jsPDF("p", "mm", docFormat);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const fmt = (v: number) => Math.round(v).toLocaleString("id-ID");

    if (type === "quotation") {
      // 1. SPH SURAT PENAWARAN PAGE
      if (showCompanyLogo) {
        if (compLogoUrl) {
          try {
            let format = "PNG";
            if (compLogoUrl.includes("image/jpeg") || compLogoUrl.includes("image/jpg")) {
              format = "JPEG";
            }
            pdf.addImage(compLogoUrl, format, marginSize, 12, 25, 25);
          } catch (err) {
            console.error("Error drawing custom logo in PDF:", err);
            // Fallback block
            pdf.setFillColor(22, 38, 70);
            pdf.rect(marginSize, 15, 25, 25, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text(compName.substring(0, 2).toUpperCase(), marginSize + 7, 30);
          }
        } else {
          // Default fallback
          pdf.setFillColor(22, 38, 70);
          pdf.rect(marginSize, 15, 25, 25, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(compName.substring(0, 2).toUpperCase(), marginSize + 7, 30);
        }
      }

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(compName, pageWidth - marginSize, 20, { align: "right" });
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(compAddress1, pageWidth - marginSize, 25, { align: "right" });
      pdf.text(compAddress2, pageWidth - marginSize, 29, { align: "right" });
      pdf.text(`${compCityZip} | ${compPhone}`, pageWidth - marginSize, 33, { align: "right" });
      pdf.setTextColor(0, 51, 153);
      pdf.text(compEmail, pageWidth - marginSize, 37, { align: "right" });

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("SURAT PENAWARAN HARGA", pageWidth / 2, 53, { align: "center" });
      pdf.line(pageWidth / 2 - 30, 55, pageWidth / 2 + 30, 55);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Kepada", marginSize, 66);
      pdf.text(":", marginSize + 20, 66);
      pdf.text(qRecipient, marginSize + 23, 66);
      pdf.text("Up", marginSize, 71);
      pdf.text(":", marginSize + 20, 71);
      pdf.text(qAttention, marginSize + 23, 71);

      pdf.text("Nomor", pageWidth - marginSize - 55, 66);
      pdf.text(":", pageWidth - marginSize - 25, 66);
      pdf.text(qNum, pageWidth - marginSize - 22, 66);
      pdf.text("Tanggal", pageWidth - marginSize - 55, 71);
      pdf.text(":", pageWidth - marginSize - 25, 71);
      pdf.text(qDate, pageWidth - marginSize - 22, 71);
      pdf.text("Pekerjaan", pageWidth - marginSize - 55, 76);
      pdf.text(":", pageWidth - marginSize - 25, 76);
      pdf.setFont("helvetica", "bold");
      pdf.text(qJobDesc, pageWidth - marginSize - 22, 76, { maxWidth: 65 });
      pdf.setFont("helvetica", "normal");

      pdf.text(
        "Bersama ini kami sampaikan penawaran harga dengan rincian spesifikasi sebagai berikut:",
        marginSize,
        86,
      );

      const tableHeaders = ["NO", "URAIAN PEKERJAAN", "VOL", "SATUAN", "HARGA SATUAN", "TOTAL BIAYA"];
      const qTableRows = qItems.map((item, index) => [
        String(index + 1),
        item.description || "",
        String(item.vol || item.quantity || 1),
        item.unit || "Unit",
        `Rp ${Number(item.unitPrice || 0).toLocaleString("id-ID")}`,
        `Rp ${((item.vol || item.quantity || 1) * (item.unitPrice || 0)).toLocaleString("id-ID")}`
      ]);

      const footRows: any[] = [
        [
          { content: "SUB TOTAL", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: 8, textColor: [30, 41, 59] } },
          { content: `Rp ${qSubtotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: 8.5 } }
        ]
      ];

      if (qDiscountAmount > 0) {
        footRows.push([
          { content: `DISKON (${discountType === "percent" ? `${discountVal}%` : "Rp"})`, colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: 8, textColor: [30, 41, 59] } },
          { content: `-Rp ${qDiscountAmount.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: 8.5, textColor: [220, 38, 38] } }
        ]);
      }

      footRows.push([
        { content: `PPN ${taxRate}%`, colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: 8, textColor: [30, 41, 59] } },
        { content: `Rp ${qTax.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: 8.5 } }
      ]);

      footRows.push([
        { content: "GRAND TOTAL", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: 9, fillColor: [240, 245, 255] as any, textColor: [15, 23, 42] } },
        { content: `Rp ${qGrandTotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: 9.5, fillColor: [240, 245, 255] as any, textColor: [0, 51, 153] } }
      ]);

      autoTable(pdf, {
        head: [tableHeaders],
        body: qTableRows,
        foot: footRows,
        startY: 92,
        margin: { left: marginSize, right: marginSize, bottom: 20 },
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          textColor: [15, 23, 42],
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
          valign: "middle"
        },
        headStyles: {
          fillColor: [22, 38, 70],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          lineColor: [22, 38, 70],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10, fontStyle: "bold" },
          1: { halign: "left" },
          2: { halign: "center", cellWidth: 12 },
          3: { halign: "center", cellWidth: 16 },
          4: { halign: "right", cellWidth: 28 },
          5: { halign: "right", cellWidth: 28 }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });

      let finalY = (pdf as any).lastAutoTable.finalY + 8;
      
      if (finalY > pageHeight - 65) {
        pdf.addPage();
        finalY = 20;
      }

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8);
      pdf.setTextColor(30, 41, 59);
      pdf.text(`*Terbilang : ${numberToWordsID(qGrandTotal)} rupiah`, marginSize, finalY);
      finalY += 8;

      if (finalY > pageHeight - 60) {
        pdf.addPage();
        finalY = 20;
      }

      const contentWidth = pageWidth - (marginSize * 2);

      // Left Column elements
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        "Demikian penawaran ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terimakasih.",
        marginSize,
        finalY,
        { maxWidth: contentWidth / 2 - 5 }
      );

      if (showTncNotes) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text("Syarat & Ketentuan Tambahan:", marginSize, finalY + 8);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(71, 85, 105);
        const notesLines = pdf.splitTextToSize(qNotes, contentWidth / 2 - 5);
        
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(marginSize, finalY + 11, contentWidth / 2 - 5, (notesLines.length * 4) + 6, "FD");
        
        notesLines.forEach((line, idx) => {
          pdf.text(line, marginSize + 3, finalY + 15 + (idx * 4));
        });
      }

      // Right Column signatures
      const rightColX = pageWidth - marginSize;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Hormat kami,", rightColX, finalY, { align: "right" });
      pdf.setFont("helvetica", "bold");
      pdf.text(compName, rightColX, finalY + 4, { align: "right" });

      if (showDigitalStamp) {
        pdf.setDrawColor(22, 38, 70);
        pdf.setFillColor(240, 245, 255);
        pdf.rect(rightColX - 50, finalY + 8, 50, 14, "FD");
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(22, 38, 70);
        pdf.text("VERIFIED SIGNATURE", rightColX - 25, finalY + 13, { align: "center" });
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Authorized by ${compName}`, rightColX - 25, finalY + 19, { align: "center" });
      }

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(qPreparedBy.toUpperCase(), rightColX, finalY + 36, { align: "right" });
      pdf.setDrawColor(71, 85, 105);
      pdf.line(rightColX - 50, finalY + 37, rightColX, finalY + 37);

      // PAGE 2: CONNECTED BOQ (If present)
      if (connectedBoqId && currentBoqItemsToUse.length > 0) {
        pdf.addPage();
        const boqTitle = `SPESIFIKASI ${matchedBoq?.projType?.toUpperCase() || "WTP"}${matchedBoq?.capacity ? ` KAPASITAS ${matchedBoq?.capacity?.toUpperCase()}` : ""}`;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(boqTitle, pageWidth / 2, 20, { align: "center" });

        const boqTableData = currentBoqItemsToUse.map((bi: any, index: number) => {
          let desc = bi.name.toUpperCase();
          const specLines = getCleanSpecLines(bi);

          if (specLines.length > 0) {
            const indented = specLines.map(s => {
              if (s.includes(":")) {
                const [lbl, ...vParts] = s.split(":");
                const val = vParts.join(":").trim();
                const paddedLbl = lbl.trim().padEnd(25, " ");
                return `${paddedLbl} : ${val}`;
              }
              return s;
            });
            desc += "\n" + indented.join("\n");
          }

          return {
            no: String(index + 1),
            description: desc,
            unit: bi.unit || "Unit",
            qty: String(bi.quantity || bi.qty || 1)
          };
        });

        autoTable(pdf, {
          columns: [
            { header: "NO", dataKey: "no" },
            { header: "DESKRIPSI", dataKey: "description" },
            { header: "SATUAN", dataKey: "unit" },
            { header: "QTY", dataKey: "qty" }
          ],
          body: boqTableData,
          startY: 28,
          margin: { left: marginSize, right: marginSize },
          theme: "grid",
          styles: {
            fontSize: 8.5,
            font: "courier",
            cellPadding: 3.5,
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            valign: "top"
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "center",
            lineColor: [0, 0, 0],
            lineWidth: 0.2
          },
          columnStyles: {
            no: { halign: "center", cellWidth: 10, fontStyle: "bold" },
            description: { halign: "left" },
            unit: { halign: "center", cellWidth: 18 },
            qty: { halign: "center", cellWidth: 15 }
          },
          alternateRowStyles: {
            fillColor: [255, 255, 255]
          }
        });
      }

      // Trigger user SAVE callback for saved state before downloading if wanted
      if (onSaveQuotation) {
        const payload = {
          number: qNum,
          recipient: qRecipient,
          attention: qAttention,
          date: qDate,
          jobDescription: qJobDesc,
          notes: qNotes,
          preparedBy: qPreparedBy,
          items: qItems,
          boqProjectId: connectedBoqId,
          subTotal: qSubtotal,
          discountType,
          discountVal,
          taxRate,
          compName,
          compAddress1,
          compAddress2,
          compCityZip,
          compPhone,
          compEmail,
          compOffice,
          compLogoUrl,
          tax: qTax,
          grandTotal: qGrandTotal
        };
        await onSaveQuotation(payload);
      }

      pdf.save(`Penawaran_${qRecipient.split(" ")[0] || "Client"}_${qNum.replace(/\//g, "-")}.pdf`);
    } else {
      // 2. BOQ SPESIFIKASI SHEET EXPORT
      const boqTitle = `SPESIFIKASI ${bType.toUpperCase() || "WTP"}${bCapacity ? ` KAPASITAS ${bCapacity.toUpperCase()}` : ""}`;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(boqTitle, pageWidth / 2, 20, { align: "center" });

      const boqTableData = bItems.map((bi: any, index: number) => {
        let desc = bi.name.toUpperCase();
        const specLines = getCleanSpecLines(bi);

        if (specLines.length > 0) {
          const indented = specLines.map(s => {
            if (s.includes(":")) {
              const [lbl, ...vParts] = s.split(":");
              const val = vParts.join(":").trim();
              const paddedLbl = lbl.trim().padEnd(25, " ");
              return `${paddedLbl} : ${val}`;
            }
            return s;
          });
          desc += "\n" + indented.join("\n");
        }

        return {
          no: String(index + 1),
          description: desc,
          unit: bi.unit || "Unit",
          qty: String(bi.quantity || bi.qty || 1)
        };
      });

      autoTable(pdf, {
        columns: [
          { header: "NO", dataKey: "no" },
          { header: "DESKRIPSI", dataKey: "description" },
          { header: "SATUAN", dataKey: "unit" },
          { header: "QTY", dataKey: "qty" }
        ],
        body: boqTableData,
        startY: 28,
        margin: { left: marginSize, right: marginSize },
        theme: "grid",
        styles: {
          fontSize: 8.5,
          font: "courier",
          cellPadding: 3.5,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          valign: "top"
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
          lineColor: [0, 0, 0],
          lineWidth: 0.2
        },
        columnStyles: {
          no: { halign: "center", cellWidth: 10, fontStyle: "bold" },
          description: { halign: "left" },
          unit: { halign: "center", cellWidth: 18 },
          qty: { halign: "center", cellWidth: 15 }
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255]
        }
      });

      pdf.save(`BOQ_Spesifikasi_${bName.replace(/\s+/g, "_")}.pdf`);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        className="bg-slate-900 border border-slate-800 rounded-[36px] w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100 shadow-3xl"
        id="document-designer-pre"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-505/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/10">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                Designer & Live Preview Center
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                  {type} Mode
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-bold">
                Kustomisasi rincian konten, atur ukuran kertas & download dokumen resmi Anda instan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Outer Split Pane Builder */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-slate-900/40">
          
          {/* LEFT COMMAND PANEL: CONFIGS & EDITOR */}
          <div className="w-full md:w-5/12 border-r border-slate-800 overflow-y-auto p-6 space-y-6 flex flex-col">
            
            {/* Quick Navigation Editor Panel vs Print configs tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveTab("preview")}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "preview" 
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye size={13} /> Pratinjau Lembar
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "edit" 
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Edit size={13} /> Edit Kolom Dokumen
              </button>
            </div>

            {/* TAB 1: DESIGN & PAPER CONFIGS */}
            <div className="space-y-5 flex-1 select-none">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Scale size={12} className="text-indigo-400" /> Ukuran Kertas & Tata Letak
                </h4>
                
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "a4", label: "A4 (Standar)", size: "210x297 mm" },
                    { id: "f4", label: "F4 (Legal)", size: "215x330 mm" },
                    { id: "letter", label: "US Letter", size: "216x279 mm" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPaperSize(p.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                        paperSize === p.id 
                          ? "border-indigo-500 bg-indigo-500/10 text-white" 
                          : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                      }`}
                    >
                      <p className="text-[11px] font-black">{p.label}</p>
                      <p className="text-[8px] font-extrabold text-slate-500 mt-0.5">{p.size}</p>
                      {paperSize === p.id && (
                        <div className="absolute right-1 bottom-1 w-3.5 h-3.5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[7px] font-extrabold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Page Margin (Jarak Tepi)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "compact", label: "Sempit", val: "10mm" },
                      { id: "standard", label: "Standar", val: "15mm" },
                      { id: "wide", label: "Lebar", val: "20mm" }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMarginStyle(m.id as any)}
                        className={`py-2 px-3 rounded-xl border text-center text-[10px] font-extrabold uppercase transition-all ${
                          marginStyle === m.id 
                            ? "border-indigo-500 bg-indigo-500/5 text-indigo-300 font-black" 
                            : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        {m.label} ({m.val})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Opsi Visual Output PDF
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">
                    <label className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 cursor-pointer hover:bg-slate-900 transition-all">
                      <span className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" />
                        Tampilkan KOP & Logo Perusahaan
                      </span>
                      <input
                        type="checkbox"
                        checked={showCompanyLogo}
                        onChange={(e) => setShowCompanyLogo(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-700 bg-slate-800 text-white focus:ring-0 focus:ring-offset-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 cursor-pointer hover:bg-slate-900 transition-all">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-slate-400" />
                        Tampilkan Tanda Tangan & Stempel Resmi
                      </span>
                      <input
                        type="checkbox"
                        checked={showDigitalStamp}
                        onChange={(e) => setShowDigitalStamp(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-700 bg-slate-800 text-white focus:ring-0 focus:ring-offset-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 cursor-pointer hover:bg-slate-900 transition-all">
                      <span className="flex items-center gap-2">
                        <AlignLeft size={14} className="text-slate-400" />
                        Sertakan Catatan SPH & Ketentuan Pekerjaan
                      </span>
                      <input
                        type="checkbox"
                        checked={showTncNotes}
                        onChange={(e) => setShowTncNotes(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-700 bg-slate-800 text-white focus:ring-0 focus:ring-offset-0"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {type === "quotation" && (
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Percent size={12} className="text-emerald-400" /> Diskon & PPN (Pajak)
                  </h4>
                  
                  <div className="space-y-3 font-sans text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Tipe Diskon</label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setDiscountType("rupiah")}
                          className={`py-1 text-[9px] font-black uppercase tracking-wider rounded transition-all ${
                            discountType === "rupiah"
                              ? "bg-slate-850 text-white shadow-sm border border-slate-700 font-extrabold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Rupiah (Rp)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType("percent")}
                          className={`py-1 text-[9px] font-black uppercase tracking-wider rounded transition-all ${
                            discountType === "percent"
                              ? "bg-slate-850 text-white shadow-sm border border-slate-700 font-extrabold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Persentase (%)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 session-no-trigger">
                        <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">
                          {discountType === "percent" ? "Nominal Diskon (%)" : "Nominal Diskon (Rp)"}
                        </label>
                        <input
                          type="number"
                          value={discountVal}
                          min={0}
                          onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Nilai PPN (%)</label>
                        <input
                          type="number"
                          value={taxRate}
                          min={0}
                          max={100}
                          onChange={(e) => setTaxRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {type === "quotation" && (
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Building2 size={12} className="text-indigo-400" /> Profil & Kop Surat Perusahaan
                  </h4>

                  <div className="space-y-3 font-sans text-xs">
                    {/* Logo Upload Block */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Logo Perusahaan</label>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {compLogoUrl ? (
                            <img src={compLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[9px] text-slate-600 font-extrabold uppercase select-none">No Logo</span>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) {
                                      setCompLogoUrl(ev.target.result as string);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="logo-file-picker-config"
                            />
                            <label
                              htmlFor="logo-file-picker-config"
                              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                              <Upload size={10} /> Upload Logo
                            </label>
                            {compLogoUrl && (
                              <button
                                type="button"
                                onClick={() => setCompLogoUrl("")}
                                className="inline-flex items-center px-3 py-1.5 bg-slate-900 border border-red-500/30 text-rose-400 hover:text-rose-300 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                          <p className="text-[8px] text-slate-500 italic font-medium leading-tight">
                            Format PNG/JPEG disarankan.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Nama Perusahaan</label>
                      <input
                        type="text"
                        value={compName}
                        onChange={(e) => setCompName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Alamat Jalan</label>
                      <input
                        type="text"
                        value={compAddress1}
                        onChange={(e) => setCompAddress1(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Blok / Desa / Kecamatan</label>
                      <input
                        type="text"
                        value={compAddress2}
                        onChange={(e) => setCompAddress2(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Provinsi & Kode Pos</label>
                        <input
                          type="text"
                          value={compCityZip}
                          onChange={(e) => setCompCityZip(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">No. Telepon</label>
                        <input
                          type="text"
                          value={compPhone}
                          onChange={(e) => setCompPhone(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Email Perusahaan</label>
                        <input
                          type="text"
                          value={compEmail}
                          onChange={(e) => setCompEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Keterangan Kantor</label>
                        <input
                          type="text"
                          value={compOffice}
                          onChange={(e) => setCompOffice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE FIELD TEXT EDITOR IN ACCORDION / BOXES */}
              {activeTab === "edit" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      ✍️ Input Rincian Tertulis Dokumen
                    </h4>

                    {type === "quotation" ? (
                      <div className="grid grid-cols-1 gap-3 font-sans text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Nomor SPH / Ref</label>
                          <input
                            value={qNum}
                            onChange={(e) => setQNum(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Penerima SPH</label>
                            <input
                              value={qRecipient}
                              onChange={(e) => setQRecipient(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Up / Alamat PIC</label>
                            <input
                              value={qAttention}
                              onChange={(e) => setQAttention(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Uraian / Deskripsi Pekerjaan SPH</label>
                          <input
                            value={qJobDesc}
                            onChange={(e) => setQJobDesc(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Tanggal SPH</label>
                            <input
                              value={qDate}
                              onChange={(e) => setQDate(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Dipersiapkan Oleh</label>
                            <input
                              value={qPreparedBy}
                              onChange={(e) => setQPreparedBy(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 pt-1.5">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Line Items SPH ({qItems.length})</label>
                            <button
                              type="button"
                              onClick={handleAddQItem}
                              className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded hover:bg-indigo-500/20"
                            >
                              + Item Pekerjaan
                            </button>
                          </div>
                          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {qItems.map((item, id) => (
                              <div key={id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 relative">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQItem(id)}
                                  className="absolute right-2 top-2 p-1 text-slate-500 hover:text-rose-400"
                                >
                                  <Trash2 size={12} />
                                </button>
                                <input
                                  value={item.description}
                                  placeholder="Uraian Pekerjaan"
                                  onChange={(e) => handleUpdateQItem(id, "description", e.target.value)}
                                  className="w-full pr-6 text-[11px] font-bold bg-slate-950 border border-slate-850 px-2 py-1 rounded"
                                />
                                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                                  <input
                                    type="number"
                                    value={item.vol || item.quantity || 1}
                                    placeholder="Qty"
                                    onChange={(e) => handleUpdateQItem(id, "vol", Number(e.target.value))}
                                    className="bg-slate-950 px-2 py-1 border border-slate-850 rounded"
                                  />
                                  <input
                                    value={item.unit}
                                    placeholder="Satuan"
                                    onChange={(e) => handleUpdateQItem(id, "unit", e.target.value)}
                                    className="bg-slate-950 px-2 py-1 border border-slate-850 rounded text-center"
                                  />
                                  <input
                                    type="number"
                                    value={item.unitPrice || 0}
                                    placeholder="Harga"
                                    onChange={(e) => handleUpdateQItem(id, "unitPrice", Number(e.target.value))}
                                    className="bg-slate-950 px-2 py-1 border border-slate-850 rounded text-right"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Syarat Ketentuan SPH (T&C)</label>
                          <textarea
                            value={qNotes}
                            onChange={(e) => setQNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-indigo-500 resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 font-sans text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Nama Projek BOQ</label>
                          <input
                            value={bName}
                            onChange={(e) => setBName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Sistem Pengolahan (Kategori)</label>
                            <input
                              value={bType}
                              onChange={(e) => setBType(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Kapasitas Desain</label>
                            <input
                              value={bCapacity}
                              onChange={(e) => setBCapacity(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Klien Instansi / Target Site</label>
                          <input
                            value={bClient}
                            onChange={(e) => setBClient(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider pl-0.5">Keterangan / Slogan</label>
                          <input
                            value={bDesc}
                            onChange={(e) => setBDesc(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-extrabold focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1 pt-1.5">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Komponen & Spesifikasi ({bItems.length})</label>
                            <button
                              type="button"
                              onClick={handleAddBItem}
                              className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded hover:bg-indigo-500/20"
                            >
                              + Komponen Baru
                            </button>
                          </div>
                          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {bItems.map((item, id) => (
                              <div key={id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 relative">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBItem(id)}
                                  className="absolute right-2 top-2 p-1 text-slate-500 hover:text-rose-400"
                                >
                                  <Trash2 size={12} />
                                </button>
                                <input
                                  value={item.name}
                                  placeholder="Nama Komponen / Pekerjaan"
                                  onChange={(e) => handleUpdateBItem(id, "name", e.target.value)}
                                  className="w-full pr-6 text-[11px] font-bold bg-slate-950 border border-slate-850 px-2 py-1 rounded"
                                />
                                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                                  <input
                                    type="number"
                                    value={item.quantity || item.qty || 1}
                                    placeholder="Qty"
                                    onChange={(e) => handleUpdateBItem(id, "quantity", Number(e.target.value))}
                                    className="bg-slate-950 px-2 py-1 border border-slate-850 rounded"
                                  />
                                  <input
                                    value={item.unit || "unit"}
                                    placeholder="Satuan"
                                    onChange={(e) => handleUpdateBItem(id, "unit", e.target.value)}
                                    className="bg-slate-950 px-2 py-1 border border-slate-850 rounded text-center"
                                  />
                                  <input
                                    value={item.brand || "Standar"}
                                    placeholder="Brand"
                                    onChange={(e) => handleUpdateBItem(id, "brand", e.target.value)}
                                    className="bg-slate-950 px-2 py-1 border border-slate-850 rounded text-right"
                                  />
                                </div>
                                <textarea
                                  value={item.specifications || ""}
                                  placeholder="Detil spesifikasi teknik kustom (misal: Material: SUS 304, dll)"
                                  onChange={(e) => handleUpdateBItem(id, "specifications", e.target.value)}
                                  rows={2}
                                  className="w-full text-[10px] font-semibold bg-slate-950 border border-slate-850 px-2 py-1 rounded resize-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* RIGHT VIEW PANEL: LIVE WEB INTERACTIVE PAPER REPRESENTATION */}
          <div className="flex-1 overflow-y-auto bg-slate-950 p-8 flex flex-col items-center">
            
            <div className="w-full max-w-[800px] flex justify-between items-center bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl mb-6 shadow-md shrink-0">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Printer size={13} className="text-indigo-400" />
                Live Screen Preview ({paperSize.toUpperCase() === "F4" ? "FOLIO / F4" : paperSize.toUpperCase()})
              </span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-extrabold px-3 py-1 rounded-xl antialiased">
                Tampilan Layar sama dengan PDF Cetak
              </span>
            </div>

            {/* Simulated Paper Container */}
            <div 
              style={{
                aspectRatio: paperSize === "a4" ? "1 / 1.414" : paperSize === "f4" ? "1 / 1.534" : "1 / 1.294",
                width: "100%",
                maxWidth: "680px"
              }}
              className="bg-white rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 font-sans text-slate-950 text-left border border-slate-250 select-text transition-all overflow-y-auto"
            >
              
              {/* PAGE 1 WORK */}
              {type === "quotation" ? (
                // SPH PREVIEW CONTENT
                <div className="space-y-6">
                  {/* Company Letterhead */}
                  <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-4">
                    {/* Header Left */}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {showCompanyLogo && (
                          compLogoUrl ? (
                            <img src={compLogoUrl} alt="Logo" className="w-10 h-10 object-contain rounded border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 bg-indigo-900 text-white rounded font-black flex items-center justify-center text-xs">
                              {compName.substring(0, 2).toUpperCase()}
                            </div>
                          )
                        )}
                        <h2 className="text-sm font-black text-slate-900 tracking-tight">
                          {compName}
                        </h2>
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold leading-normal max-w-sm">
                        {compAddress1}, {compAddress2}, {compCityZip}
                      </p>
                      <p className="text-[8px] text-slate-400 font-extrabold">
                        Telp/WA: {compPhone} | Email: {compEmail}
                      </p>
                    </div>

                    {/* Header Right */}
                    <div className="text-right text-[8px] text-slate-500 font-extrabold">
                      <p className="text-slate-800 font-black">{compOffice}</p>
                      <p>Katalog Alat & Kontraktor</p>
                      <p>Instalasi STP / WWTP / WTP</p>
                    </div>
                  </div>

                  {/* Doc Title */}
                  <div className="text-center">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-900 inline-block pb-0.5">
                      SURAT PENAWARAN HARGA
                    </h3>
                  </div>

                  {/* Metadata Info */}
                  <div className="grid grid-cols-2 gap-4 text-[9px] leading-tight">
                    <div className="space-y-1">
                      <p className="flex"><span className="w-16 font-extrabold text-slate-500">Kepada</span><span className="w-3 font-extrabold">:</span><span className="font-extrabold text-slate-900">{qRecipient}</span></p>
                      <p className="flex"><span className="w-16 font-extrabold text-slate-500">Up</span><span className="w-3 font-extrabold">:</span><span className="font-extrabold text-slate-800">{qAttention}</span></p>
                    </div>
                    <div className="space-y-1 text-right sm:text-left sm:pl-10">
                      <p className="flex"><span className="w-16 font-extrabold text-slate-500">Nomor</span><span className="w-3 font-extrabold">:</span><span className="font-bold text-indigo-700 font-mono text-[8px]">{qNum}</span></p>
                      <p className="flex"><span className="w-16 font-extrabold text-slate-500">Tanggal</span><span className="w-3 font-extrabold">:</span><span className="bold text-slate-800">{qDate}</span></p>
                      <p className="flex"><span className="w-16 font-extrabold text-slate-500">Pekerjaan</span><span className="w-3 font-extrabold">:</span><span className="font-extrabold text-slate-800 truncate block max-w-[120px]" title={qJobDesc}>{qJobDesc}</span></p>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-700 font-medium leading-relaxed">
                    Bersama ini kami sampaikan penawaran harga dengan rincian spesifikasi sebagai berikut:
                  </p>

                  {/* SPH Print Table */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse font-sans text-[8px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 font-black text-slate-800">
                          <th className="px-2 py-1.5 text-center border-r border-slate-300 w-8">NO</th>
                          <th className="px-2 py-1.5 border-r border-slate-300">URAIAN PEKERJAAN</th>
                          <th className="px-2 py-1.5 text-center border-r border-slate-300 w-10">VOL</th>
                          <th className="px-2 py-1.5 text-center border-r border-slate-300 w-12">SATUAN</th>
                          <th className="px-2 py-1.5 text-right border-r border-slate-300 w-24">HARGA SATUAN</th>
                          <th className="px-2 py-1.5 text-right w-24">TOTAL BIAYA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {qItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 py-1.5 text-center border-r border-slate-300 font-bold">{idx + 1}</td>
                            <td className="px-2 py-1.5 border-r border-slate-300 font-extrabold text-slate-900 whitespace-pre-line">{item.description}</td>
                            <td className="px-2 py-1.5 text-center border-r border-slate-300 font-bold">{item.vol || item.quantity || 1}</td>
                            <td className="px-2 py-1.5 text-center border-r border-slate-300 text-slate-500 font-bold">{item.unit || "Unit"}</td>
                            <td className="px-2 py-1.5 text-right border-r border-slate-300 font-mono">Rp {(item.unitPrice || 0).toLocaleString("id-ID")}</td>
                            <td className="px-2 py-1.5 text-right font-mono font-black text-slate-900">Rp {((item.vol || item.quantity || 1) * (item.unitPrice || 0)).toLocaleString("id-ID")}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 border-t border-slate-300 font-extrabold text-slate-800 text-[9px]">
                          <td colSpan={4} className="px-2 py-1.5 text-right border-r border-slate-300 text-[8px]">SUBTOTAL</td>
                          <td colSpan={2} className="px-2 py-1.5 text-right font-mono font-black text-slate-950 text-[10px]">Rp {qSubtotal.toLocaleString("id-ID")}</td>
                        </tr>
                        {qDiscountAmount > 0 && (
                          <tr className="bg-rose-50/40 font-extrabold text-slate-800 text-[9px]">
                            <td colSpan={4} className="px-2 py-1.5 text-right border-r border-slate-300 text-[8px]">DISKON ({discountType === "percent" ? `${discountVal}%` : "Rp"})</td>
                            <td colSpan={2} className="px-2 py-1.5 text-right font-mono text-[9px] text-rose-600">-Rp {qDiscountAmount.toLocaleString("id-ID")}</td>
                          </tr>
                        )}
                        <tr className="bg-slate-50 font-extrabold text-slate-800 text-[9px]">
                          <td colSpan={4} className="px-2 py-1.5 text-right border-r border-slate-300 text-[8px]">PPN {taxRate}%</td>
                          <td colSpan={2} className="px-2 py-1.5 text-right font-mono text-[9px]">Rp {qTax.toLocaleString("id-ID")}</td>
                        </tr>
                        <tr className="bg-indigo-50 border-t-2 border-indigo-300 font-black text-indigo-950 text-[10px]">
                          <td colSpan={4} className="px-2 py-1.5 text-right border-r border-indigo-200">GRAND TOTAL</td>
                          <td colSpan={2} className="px-2 py-1.5 text-right font-mono text-xs text-indigo-700">Rp {qGrandTotal.toLocaleString("id-ID")}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <p className="text-[8px] text-slate-700 italic leading-snug">
                    *Terbilang: {numberToWordsID(qGrandTotal)} rupiah
                  </p>

                  {/* Conditions & Sign stamp */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1 font-sans text-[8px] border border-slate-200/80 p-2 rounded-xl bg-slate-50">
                      <p className="font-black text-slate-700 uppercase tracking-wider">Syarat & Ketentuan Tambahan:</p>
                      <p className="text-slate-500 leading-relaxed font-bold whitespace-pre-wrap">{qNotes}</p>
                    </div>

                    <div className="text-right space-y-4 pr-4 border-l border-slate-100 flex flex-col justify-end">
                      <div className="space-y-1 text-[9px]">
                        <p className="text-slate-500 font-bold">Hormat Kami,</p>
                        <p className="font-extrabold text-slate-900 uppercase">{compName}</p>
                      </div>

                      {showDigitalStamp && (
                        <div className="flex justify-end pt-1">
                          <div className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg flex flex-col items-center justify-center text-[7px] text-indigo-700 w-36 text-center shadow-xs">
                            <span className="font-black uppercase tracking-wider text-indigo-900">VERIFIED SIGNATURE</span>
                            <span className="font-medium text-slate-400 mt-0.5 truncate max-w-full text-center" title={compName}>{compName}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 pt-4 text-[9px]">
                        <p className="font-black border-t border-slate-350 pt-1 inline-block text-slate-900">{qPreparedBy.toUpperCase()}</p>
                        <p className="text-slate-400 font-extrabold text-[8px]">Direktorat Estimasi & Teknikal</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // BOQ SPECIFICATION SHEET PREVIEW CONTENT
                <div className="space-y-6">
                  {/* Print Title */}
                  <div className="text-center space-y-1">
                    <h2 className="text-sm font-black text-slate-900 tracking-wide uppercase">
                      SPESIFIKASI {bType.toUpperCase() || "WTP"}
                    </h2>
                    {bCapacity && (
                      <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                        KAPASITAS {bCapacity.toUpperCase()}
                      </h3>
                    )}
                    <p className="text-[9px] text-slate-400 font-extrabold">
                      Klien: {bClient || "Instansi"} | Nama Projek: {bName || "Draft Rencana BOQ"}
                    </p>
                  </div>

                  {/* Courier Font Monospace Specification Table */}
                  <div className="border border-slate-400 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse font-mono text-[8px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-450 font-black text-slate-900 text-center">
                          <th className="px-2 py-2 border-r border-slate-450 w-8">NO</th>
                          <th className="px-2 py-2 border-r border-slate-450 text-left">DESKRIPSI PARAMENTERS & SPESIFIKASI TEKNIS</th>
                          <th className="px-2 py-2 border-r border-slate-450 w-20">SATUAN</th>
                          <th className="px-2 py-2 w-16">QTY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {bItems.map((item, idx) => {
                          const specLines = getCleanSpecLines(item);

                          return (
                            <tr key={idx} className="align-top hover:bg-slate-50/50 transition-all">
                              <td className="px-2 py-2 text-center border-r border-slate-450 font-bold">{idx + 1}</td>
                              <td className="px-2 py-2 border-r border-slate-450">
                                <p className="font-bold text-slate-900 uppercase">{item.name}</p>
                                {specLines.length > 0 && (
                                  <div className="mt-1 text-[7.5px] text-slate-600 space-y-0.5 leading-snug">
                                    {specLines.map((s, sIdx) => {
                                      if (s.includes(":")) {
                                        const [lbl, ...parts] = s.split(":");
                                        const val = parts.join(":").trim();
                                        return (
                                          <p key={sIdx} className="flex">
                                            <span className="w-24 font-extrabold uppercase text-slate-500">{lbl.trim()}</span>
                                            <span className="px-1">:</span>
                                            <span className="font-bold text-slate-800">{val}</span>
                                          </p>
                                        );
                                      }
                                      return (
                                        <p key={sIdx} className="text-slate-550 font-medium">✓ {s}</p>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-2 text-center border-r border-slate-450 font-bold uppercase">{item.unit || "Unit"}</td>
                              <td className="px-2 py-2 text-center font-bold text-slate-900">{item.quantity || item.qty || 1}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[7.5px] text-slate-400 font-extrabold text-center py-2 border-t border-dashed border-slate-200">
                    * Seluruh materi spesifikasi di atas berbasis pada standar modular engineering PT Garda Inovasi Globaltech.
                  </p>
                </div>
              )}

              {/* SECOND PAGE IF ATTACHED BOQ PRESENT */}
              {type === "quotation" && connectedBoqId && currentBoqItemsToUse.length > 0 && (
                <div className="border-t-4 border-double border-slate-200 pt-10 mt-10 space-y-6">
                  <div className="text-center space-y-1">
                    <h4 className="text-[10px] bg-slate-900 text-white font-black px-2.5 py-0.5 rounded-full inline-block uppercase tracking-wider">
                      LAMPIRAN DOKUMEN 2
                    </h4>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      SPESIFIKASI {matchedBoq?.projType?.toUpperCase() || "WTP"}
                    </h2>
                    {matchedBoq?.capacity && (
                      <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-wider">
                        KAPASITAS {matchedBoq?.capacity?.toUpperCase()}
                      </h3>
                    )}
                  </div>

                  {/* Monospace Specifications Details */}
                  <div className="border border-slate-400 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse font-mono text-[8px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-450 font-black text-slate-900 text-center">
                          <th className="px-2 py-2 border-r border-slate-450 w-8">NO</th>
                          <th className="px-2 py-2 border-r border-slate-450 text-left">DESKRIPSI PARAMENTERS & SPESIFIKASI TEKNIS</th>
                          <th className="px-2 py-2 border-r border-slate-450 w-20">SATUAN</th>
                          <th className="px-2 py-2 w-16">QTY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {currentBoqItemsToUse.map((item: any, idx: number) => {
                          const specLines = getCleanSpecLines(item);

                          return (
                            <tr key={idx} className="align-top hover:bg-slate-50/50 transition-all">
                              <td className="px-2 py-2 text-center border-r border-slate-450 font-bold">{idx + 1}</td>
                              <td className="px-2 py-2 border-r border-slate-450">
                                <p className="font-bold text-slate-900 uppercase">{item.name}</p>
                                {specLines.length > 0 && (
                                  <div className="mt-1 text-[7px] text-slate-600 space-y-0.5 leading-snug">
                                    {specLines.map((s, sIdx) => {
                                      if (s.includes(":")) {
                                        const [lbl, ...parts] = s.split(":");
                                        const val = parts.join(":").trim();
                                        return (
                                          <p key={sIdx} className="flex">
                                            <span className="w-20 font-extrabold uppercase text-slate-500">{lbl.trim()}</span>
                                            <span className="px-1">:</span>
                                            <span className="font-bold text-slate-800">{val}</span>
                                          </p>
                                        );
                                      }
                                      return (
                                        <p key={sIdx} className="text-slate-550 font-medium">✓ {s}</p>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-2 text-center border-r border-slate-450 font-bold uppercase">{item.unit || "Unit"}</td>
                              <td className="px-2 py-2 text-center font-bold text-slate-900">{item.quantity || item.qty || 1}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
          
        </div>

        {/* Modal Footer Controls */}
        <div className="px-8 py-5 border-t border-slate-800 bg-slate-950 shrink-0 flex items-center justify-between">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest hidden sm:flex items-center gap-1">
            <Sparkles size={11} className="text-indigo-400" />
            Dokumen siap diunduh & dicetak resolusi tinggi
          </p>

          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Batal
            </button>
            {type === "quotation" && onSaveQuotation && (
              <button
                onClick={handleSaveOnly}
                disabled={isSaving}
                className="flex-[2] sm:flex-none px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={14} className="text-emerald-200" />
                )}
                <span>Simpan SPH</span>
              </button>
            )}
            <button
              onClick={handleGeneratePDF}
              className="flex-[2] sm:flex-none px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Download size={14} className="text-indigo-200" /> Unduh Dokumen PDF
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
