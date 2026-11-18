import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  X,
  Printer,
  FileText,
  Trash2,
  Plus,
  Scale,
  Sparkles,
  Check,
  Download,
  FileDown,
  Percent,
  Upload,
  Truck,
  Receipt,
  Sliders,
  Building2,
  ListChecks,
  RotateCcw,
  Palette
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { compressImage } from "../lib/utils";
import { formatInvoicePdfFileName } from "../utils/invoiceFileName";

// Split a single or multiline company address into 3 crisp header lines: [line1, line2, cityZip]
const splitAddressLines = (rawAddr?: string): [string, string, string] => {
  const fallback: [string, string, string] = [
    "Perumahan Griya Sepatan Blok B6 Nomor 35, RT.02/09",
    "Ds. Pisangan Jaya, Kec. Sepatan, Kab Tangerang",
    "Banten, 15525"
  ];
  if (!rawAddr || !rawAddr.trim()) return fallback;

  const trimmed = rawAddr.trim();
  if (trimmed.includes("\n")) {
    const parts = trimmed.split("\n").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) return [parts[0], parts.slice(1, -1).join(", "), parts[parts.length - 1]];
    if (parts.length === 2) return [parts[0], parts[1], ""];
    return [parts[0] || "", "", ""];
  }

  const segments = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  if (segments.length <= 2) return [trimmed, "", ""];
  const lines: string[] = [];
  for (const seg of segments) {
    const last = lines[lines.length - 1];
    if (!last || (last + ", " + seg).length > 48) {
      lines.push(seg);
    } else {
      lines[lines.length - 1] = `${last}, ${seg}`;
    }
  }
  if (lines.length >= 3) return [lines[0], lines.slice(1, -1).join(", "), lines[lines.length - 1]];
  if (lines.length === 2) return [lines[0], lines[1], ""];
  return [lines[0] || trimmed, "", ""];
};

// Format Quotation PDF filename:
// PENAWARAN_<PEKERJAAN>_<KEPADA>_<NO_SPH_WITH_UNDERSCORES>.pdf
export const formatQuotationPdfFileName = (
  jobDesc: string,
  items: any[],
  recipient: string,
  qNum: string,
  qDate?: string
): string => {
  const rawJob = (jobDesc || items?.[0]?.description || "PEKERJAAN")
    .trim()
    .toUpperCase()
    .replace(/[\/\\:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ");
  const rawRecipient = (recipient || "KLIEN")
    .trim()
    .toUpperCase()
    .replace(/[\/\\:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ");
  let cleanNo = (qNum || "SPH")
    .trim()
    .toUpperCase()
    .replace(/[\/\\]+/g, "_")
    .replace(/[^A-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  if (!cleanNo.includes("SPH")) {
    const parsedDate = qDate ? new Date(qDate) : new Date();
    const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const bulan = validDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const tahun = validDate.getFullYear();
    cleanNo = `${cleanNo}_SPH_GIGT_${bulan}_${tahun}`;
  }
  return `PENAWARAN_${rawJob}_${rawRecipient}_${cleanNo}.pdf`;
};

export const formatPoPdfFileName = (
  vendorName: string,
  poNo: string
): string => {
  const cleanVendor = (vendorName || "SUPPLIER")
    .trim()
    .toUpperCase()
    .replace(/[\/\\:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ");
  const cleanNo = (poNo || "PO")
    .trim()
    .toUpperCase()
    .replace(/[\/\\]+/g, "_")
    .replace(/[^A-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return `PO_${cleanVendor}_${cleanNo}.pdf`;
};

export const deriveDoNumberFromInvoice = (invNumber?: string): string => {
  const raw = (invNumber || "").trim();
  if (!raw) return `DO/${new Date().getFullYear()}/001`;
  if (/INV/i.test(raw)) {
    return raw.replace(/INV/i, "DO");
  }
  return `DO/${raw}`;
};

export const formatDeliveryOrderPdfFileName = (
  doNumber: string,
  invNumber: string = "",
  clientOrPtName: string = ""
): string => {
  const rawNo = (doNumber || deriveDoNumberFromInvoice(invNumber) || "DO")
    .trim()
    .toUpperCase()
    .replace(/[\/\\]+/g, "_")
    .replace(/[^A-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  const cleanNo = rawNo.startsWith("DO") ? rawNo : `DO_${rawNo}`;
  const cleanPt = (clientOrPtName || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return cleanPt ? `${cleanNo}_${cleanPt}.pdf` : `${cleanNo}.pdf`;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return [30, 58, 138];
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some(isNaN)) return [30, 58, 138];
  return [r, g, b];
};

// Custom helper to parse and format clean specification lines without duplication
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

  if (item.capacity) appendSpec("Capacity/Kapasitas", item.capacity);
  if (item.dimensions) appendSpec("Dimensions/Dimensi", item.dimensions);
  if (item.material) appendSpec("Material/Bahan", item.material);
  if (item.power) appendSpec("Power/Daya", item.power);
  if (item.flowRate || item.flowrate) appendSpec("Flow Rate/Debit", item.flowRate || item.flowrate);
  if (item.pressure) appendSpec("Pressure/Tekanan", item.pressure);
  if (item.brand) appendSpec("Brand/Merek", item.brand);
  if (item.warranty) appendSpec("Warranty/Garansi", item.warranty);

  if (item.specifications) {
    const rawLines = typeof item.specifications === "string"
      ? item.specifications.split("\n")
      : Array.isArray(item.specifications)
        ? item.specifications.map((s: any) => `${s.key || ""}: ${s.value || ""}`)
        : [];

    rawLines.forEach((line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.includes(":")) {
        const idx = trimmed.indexOf(":");
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        if (k && k !== "-" && v) {
          appendSpec(k, v);
        } else if (v) {
          specLines.push(v);
        }
      } else {
        specLines.push(trimmed);
      }
    });
  }

  return specLines;
};

// Helper to dynamically calculate natural image dimensions and aspect ratio
const getImageDimensions = (src: string): Promise<{ width: number; height: number; ratio: number }> => {
  return new Promise((resolve) => {
    if (!src) {
      resolve({ width: 1, height: 1, ratio: 1 });
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth || img.width || 100;
      const h = img.naturalHeight || img.height || 100;
      resolve({ width: w, height: h, ratio: w / Math.max(h, 1) });
    };
    img.onerror = () => {
      resolve({ width: 100, height: 100, ratio: 1 });
    };
    img.src = src;
  });
};

const DEFAULT_COL_WIDTHS = {
  no: 10,
  qty: 13,
  unit: 18,
  price: 27,
  total: 28,
  condition: 34,
};

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "quotation" | "boq" | "invoice" | "delivery_order" | "po" | "surat_jalan";
  initialQuotationData?: any;
  onSaveQuotation?: (updatedData: any) => Promise<void>;
  initialBoqData?: any;
  boqProjects?: any[];
  initialInvoiceData?: any;
  onSaveInvoice?: (updatedData: any) => Promise<void>;
  initialPoData?: any;
  onSavePo?: (updatedData: any) => Promise<void>;
  initialSuratJalanData?: any;
  onSaveSuratJalan?: (updatedData: any) => Promise<void>;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  type,
  initialQuotationData,
  onSaveQuotation,
  initialBoqData,
  boqProjects = [],
  initialInvoiceData,
  onSaveInvoice,
  initialPoData,
  onSavePo,
  initialSuratJalanData,
  onSaveSuratJalan
}) => {
  // --- CONTROL PANEL TABS & DESIGNER STATE ---
  const [activeDocMode, setActiveDocMode] = useState<DocumentPreviewModalProps["type"]>(type);
  const isInvoiceFamily = type === "invoice" || type === "delivery_order";
  const effectiveType: DocumentPreviewModalProps["type"] = isInvoiceFamily
    ? (activeDocMode === "delivery_order" ? "delivery_order" : "invoice")
    : type;

  const [activeControlTab, setActiveControlTab] = useState<"layout" | "content" | "items">("layout");
  const [paperSize, setPaperSize] = useState<"a4" | "f4" | "letter">("a4");
  const [marginStyle, setMarginStyle] = useState<"standard" | "compact" | "wide">("standard");
  const [showCompanyLogo, setShowCompanyLogo] = useState(true);
  const [showDigitalStamp, setShowDigitalStamp] = useState(true);
  const [showTncNotes, setShowTncNotes] = useState(true);
  const [showTerbilang, setShowTerbilang] = useState(true);
  const [themeColor, setThemeColor] = useState<string>("#1e3a8a");
  const [fontScale, setFontScale] = useState<"small" | "standard" | "large">("standard");

  // Column Width Controls (in mm for PDF & proportional % for Live Preview)
  const [colWidths, setColWidths] = useState({ ...DEFAULT_COL_WIDTHS });

  // Logo & Signature Controls
  const [logoSize, setLogoSize] = useState<"tiny" | "compact" | "standard" | "large" | "huge">("standard");
  const [sigSize, setSigSize] = useState<"tiny" | "compact" | "standard" | "large" | "huge">("standard");
  const [sigAlign, setSigAlign] = useState<"left" | "center">("left");

  // Table Density
  const [tableDensity, setTableDensity] = useState<"compact" | "standard" | "spacious">("standard");

  // Download Filename
  const [downloadFileName, setDownloadFileName] = useState<string>("");

  // Ongkir / Pengiriman
  const [shippingLabel, setShippingLabel] = useState<string>("ONGKOS KIRIM / PENGIRIMAN");
  const [includeShipping, setIncludeShipping] = useState<boolean>(false);
  const [shippingCost, setShippingCost] = useState<number>(0);

  // Invoice Termin / Down Payment (DP)
  const [includeDownPayment, setIncludeDownPayment] = useState<boolean>(false);
  const [downPaymentLabel, setDownPaymentLabel] = useState<string>("DOWN PAYMENT (DP)");
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(50);
  const [paymentStages, setPaymentStages] = useState<
    Array<{ id?: string; label: string; percent: number }>
  >([
    { id: "1", label: "DOWN PAYMENT (DP)", percent: 50 }
  ]);

  // Discounts & Tax
  const [includeDiscount, setIncludeDiscount] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState<"percent" | "rupiah">("rupiah");
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(11);
  const [includePPN, setIncludePPN] = useState<boolean>(true);

  // Company Kop Surat Profile
  const [compName, setCompName] = useState("PT. GARDA INOVASI GLOBALTECH");
  const [compAddress1, setCompAddress1] = useState("Perumahan Griya Sepatan Blok B6 Nomor 35, RT.02/09");
  const [compAddress2, setCompAddress2] = useState("Ds. Pisangan Jaya, Kec. Sepatan, Kab Tangerang");
  const [compCityZip, setCompCityZip] = useState("Banten, 15525");
  const [compPhone, setCompPhone] = useState("0888-1687-794");
  const [compEmail, setCompEmail] = useState("pt.gardainovasiglobaltech@gmail.com");
  const [compLogoUrl, setCompLogoUrl] = useState<string>("");
  const [qDigitalSigUrl, setQDigitalSigUrl] = useState<string>("");

  // --- SPH (Quotation) Data ---
  const [qNum, setQNum] = useState("");
  const [qRecipient, setQRecipient] = useState("");
  const [qAttention, setQAttention] = useState("");
  const [qProjectName, setQProjectName] = useState("");
  const [qDate, setQDate] = useState("");
  const [qJobDesc, setQJobDesc] = useState("");
  const [qNotes, setQNotes] = useState("");
  const [qPaymentTerms, setQPaymentTerms] = useState("");
  const [qPreparedBy, setQPreparedBy] = useState("JIDAN RAMADHA");
  const [qItems, setQItems] = useState<any[]>([]);
  const [connectedBoqId, setConnectedBoqId] = useState("");
  const [qType, setQType] = useState<"Barang dan Jasa" | "Barang" | "Jasa">("Barang dan Jasa");

  // --- Invoice Data ---
  const [invNum, setInvNum] = useState("");
  const [invRecipient, setInvRecipient] = useState("");
  const [invAttention, setInvAttention] = useState("");
  const [invProjectName, setInvProjectName] = useState("");
  const [invAddress, setInvAddress] = useState("");
  const [invDate, setInvDate] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invJobDesc, setInvJobDesc] = useState("");
  const [invPoRef, setInvPoRef] = useState("");
  const [invBankName, setInvBankName] = useState("Mandiri");
  const [invBankHolder, setInvBankHolder] = useState("PT. GARDA INOVASI GLOBALTECH");
  const [invBankNumber, setInvBankNumber] = useState("1550014117173");
  const [invNotes, setInvNotes] = useState("- Pembayaran via transfer ke rekening resmi kami.\n- Bukti bayar mohon konfirmasi ke Admin.");
  const [invItems, setInvItems] = useState<any[]>([]);

  // --- Delivery Order (from Invoice) Data ---
  const [doNum, setDoNum] = useState("");
  const [doDate, setDoDate] = useState("");
  const [doDeliveryAddress, setDoDeliveryAddress] = useState("");
  const [doVehicleInfo, setDoVehicleInfo] = useState("");
  const [doReceivedBy, setDoReceivedBy] = useState("");
  const [doNotes, setDoNotes] = useState(
    "- Barang telah diperiksa dan diterima dalam kondisi baik serta lengkap.\n- Harap dokumen Delivery Order ini ditandatangani & distempel oleh penerima."
  );

  // --- Purchase Order Data ---
  const [poNo, setPoNo] = useState("");
  const [poDate, setPoDate] = useState("");
  const [poDeliveryDate, setPoDeliveryDate] = useState("");
  const [poVendorName, setPoVendorName] = useState("");
  const [poVendorAddress, setPoVendorAddress] = useState("");
  const [poVendorPhone, setPoVendorPhone] = useState("");
  const [poProjectRef, setPoProjectRef] = useState("");
  const [poDeliveryAddress, setPoDeliveryAddress] = useState("Perumahan Griya Sepatan Blok B6 No. 35, Kab Tangerang / Lokasi Proyek");
  const [poNotes, setPoNotes] = useState("Barang harus dalam kondisi baru, tersegel baik dan sesuai spesifikasi.");
  const [poItems, setPoItems] = useState<any[]>([]);
  const [poSignerName, setPoSignerName] = useState("JIDAN RAMADHA");

  // --- Surat Jalan Data ---
  const [sjNum, setSjNum] = useState("");
  const [sjDate, setSjDate] = useState("");
  const [sjRecipient, setSjRecipient] = useState("");
  const [sjAddress, setSjAddress] = useState("");
  const [sjPhone, setSjPhone] = useState("");
  const [sjPoRef, setSjPoRef] = useState("");
  const [sjVehicleType, setSjVehicleType] = useState("Truk Engkel / Pick Up");
  const [sjVehiclePlate, setSjVehiclePlate] = useState("B 9182 GIG");
  const [sjDriverName, setSjDriverName] = useState("Sopir Logistik");
  const [sjNotes, setSjNotes] = useState("Barang harap dibongkar dengan hati-hati dan diperiksa kelengkapannya saat tiba di lokasi.");
  const [sjItems, setSjItems] = useState<any[]>([]);
  const [sjSenderName, setSjSenderName] = useState("Petugas Logistik / Admin");
  const [sjSenderTitle, setSjSenderTitle] = useState("Logistik & Ekspedisi");
  const [sjReceivedBy, setSjReceivedBy] = useState("Penerima / Klien");
  const [sjSignatureType, setSjSignatureType] = useState<"upload" | "blank">("blank");
  const [sjSignatureUrl, setSjSignatureUrl] = useState<string>("");

  // --- BOQ Spec Data ---
  const [bName, setBName] = useState("");
  const [bType, setBType] = useState("");
  const [bCapacity, setBCapacity] = useState("");
  const [bClient, setBClient] = useState("");
  const [bDesc, setBDesc] = useState("");
  const [bItems, setBItems] = useState<any[]>([]);

  // Synchronize initial data whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveDocMode(type);
      if (type === "quotation" && initialQuotationData) {
        const num = initialQuotationData.number || "";
        const recip = initialQuotationData.recipient || "";
        const jobDesc = initialQuotationData.jobDescription || "";
        const qd = initialQuotationData.date || new Date().toISOString().substring(0, 10);
        const itemsArr = initialQuotationData.items ? [...initialQuotationData.items] : [];
        const [a1, a2, cz] = initialQuotationData.compAddress1
          ? [initialQuotationData.compAddress1, initialQuotationData.compAddress2 || "", initialQuotationData.compCityZip || ""]
          : splitAddressLines(initialQuotationData.compAddress);

        setQNum(num);
        setQRecipient(recip);
        setQAttention(initialQuotationData.attention || "");
        setQProjectName(initialQuotationData.projectName || "");
        setQDate(qd);
        setQJobDesc(jobDesc);
        setQNotes(initialQuotationData.notes !== undefined ? initialQuotationData.notes : "- Harga sudah termasuk PPN\n- Penawaran berlaku selama 14 hari kerja");
        setQPaymentTerms(initialQuotationData.paymentTerms !== undefined ? initialQuotationData.paymentTerms : "- DP 50% saat PO / SPK disetujui\n- Pelunasan 50% setelah pekerjaan selesai");
        setQPreparedBy(initialQuotationData.preparedBy || "JIDAN RAMADHA");
        setQItems(itemsArr);
        setConnectedBoqId(initialQuotationData.boqProjectId || "");
        setQType(initialQuotationData.quotationType || "Barang dan Jasa");
        setIncludeShipping(initialQuotationData.includeShipping !== undefined ? initialQuotationData.includeShipping : false);
        setShippingCost(initialQuotationData.shippingCost || 0);
        setShippingLabel(initialQuotationData.shippingLabel || "ONGKOS KIRIM / PENGIRIMAN");
        setIncludePPN(initialQuotationData.includePPN !== undefined ? initialQuotationData.includePPN : true);
        setIncludeDiscount(Boolean(initialQuotationData.includeDiscount || (initialQuotationData.discountVal && initialQuotationData.discountVal > 0)));
        setDiscountType(initialQuotationData.discountType || "rupiah");
        setDiscountVal(initialQuotationData.discountVal || 0);
        setTaxRate(initialQuotationData.taxRate !== undefined ? initialQuotationData.taxRate : 11);
        setCompName(initialQuotationData.compName || "PT. GARDA INOVASI GLOBALTECH");
        setCompAddress1(a1);
        setCompAddress2(a2);
        setCompCityZip(cz);
        setCompPhone(initialQuotationData.compPhone || "0888-1687-794");
        setCompEmail(initialQuotationData.compEmail || "pt.gardainovasiglobaltech@gmail.com");
        setCompLogoUrl(initialQuotationData.compLogoUrl || "");
        setQDigitalSigUrl(initialQuotationData.digitalSignatureUrl || "");

        setDownloadFileName(formatQuotationPdfFileName(jobDesc, itemsArr, recip, num, qd));
      } else if ((type === "invoice" || type === "delivery_order") && initialInvoiceData) {
        const num = initialInvoiceData.invoiceNumber || "";
        const recip = initialInvoiceData.clientName || initialInvoiceData.recipientName || "";
        const [a1, a2, cz] = splitAddressLines(initialInvoiceData.companyAddress);
        const resolvedAddr = initialInvoiceData.deliveryAddress || initialInvoiceData.clientAddress || initialInvoiceData.recipientAddress || "";
        const resolvedDoNum = initialInvoiceData.doNumber || deriveDoNumberFromInvoice(num);
        const resolvedDate = initialInvoiceData.invoiceDate || new Date().toISOString().substring(0, 10);

        setInvNum(num);
        setInvRecipient(recip);
        setInvAttention(initialInvoiceData.recipientUp || "");
        setInvProjectName(initialInvoiceData.projectName || "");
        setInvAddress(resolvedAddr);
        setInvDate(resolvedDate);
        setInvDueDate(initialInvoiceData.dueDate || "");
        setInvJobDesc(initialInvoiceData.jobName || initialInvoiceData.jobDescription || "");
        setInvPoRef(
          initialInvoiceData.sphRefNumber
            ? `SPH: ${initialInvoiceData.sphRefNumber}`
            : initialInvoiceData.poRef || initialInvoiceData.poNumber || "-"
        );
        setInvBankName(initialInvoiceData.bankName || "Mandiri");
        setInvBankHolder(initialInvoiceData.bankAccountName || "PT. GARDA INOVASI GLOBALTECH");
        setInvBankNumber(initialInvoiceData.bankAccountNumber || "1550014117173");
        setInvNotes(initialInvoiceData.notes || "- Pembayaran via transfer ke rekening di atas.\n- Bukti bayar mohon konfirmasi ke Admin.");
        setInvItems(
          initialInvoiceData.items
            ? initialInvoiceData.items.map((it: any) => ({ ...it, condition: it.condition || "Baik & Lengkap" }))
            : []
        );
        setIncludePPN(initialInvoiceData.enablePPN !== undefined ? initialInvoiceData.enablePPN : true);
        setTaxRate(initialInvoiceData.taxPercentage || 11);
        setIncludeShipping(initialInvoiceData.includeShipping || false);
        setShippingCost(initialInvoiceData.shippingCost || 0);
        setShippingLabel(initialInvoiceData.shippingLabel || "BIAYA PENGIRIMAN / ONGKIR");

        setIncludeDiscount(
          initialInvoiceData.includeDiscount !== undefined
            ? initialInvoiceData.includeDiscount
            : (initialInvoiceData.discountVal ? initialInvoiceData.discountVal > 0 : false)
        );
        setDiscountType(initialInvoiceData.discountType || "rupiah");
        setDiscountVal(initialInvoiceData.discountVal || 0);

        const isDp = !!initialInvoiceData.includeDownPayment;
        const dpPct = initialInvoiceData.downPaymentPercent !== undefined ? initialInvoiceData.downPaymentPercent : 50;
        const dpLbl = initialInvoiceData.downPaymentLabel || "DOWN PAYMENT (DP)";
        setIncludeDownPayment(isDp);
        setDownPaymentPercent(dpPct);
        setDownPaymentLabel(dpLbl);
        if (initialInvoiceData.paymentStages && Array.isArray(initialInvoiceData.paymentStages) && initialInvoiceData.paymentStages.length > 0) {
          setPaymentStages(initialInvoiceData.paymentStages);
        } else {
          setPaymentStages([{ id: "1", label: dpLbl, percent: dpPct }]);
        }

        setCompName(initialInvoiceData.companyName || "PT. GARDA INOVASI GLOBALTECH");
        setCompAddress1(a1);
        setCompAddress2(a2);
        setCompCityZip(cz);
        setCompPhone(initialInvoiceData.companyPhone || "0888-1687-794");
        setCompEmail(initialInvoiceData.companyEmail || "pt.gardainovasiglobaltech@gmail.com");
        setCompLogoUrl(initialInvoiceData.logoImage || "");
        setQPreparedBy(initialInvoiceData.signatoryName || "JIDAN RAMADHA");
        setQDigitalSigUrl(initialInvoiceData.digitalSignatureUrl || initialInvoiceData.signatureImage || "");

        // Delivery Order defaults synced from Invoice
        setDoNum(resolvedDoNum);
        setDoDate(initialInvoiceData.doDate || resolvedDate);
        setDoDeliveryAddress(resolvedAddr);
        setDoVehicleInfo(initialInvoiceData.vehicleInfo || "");
        setDoReceivedBy(initialInvoiceData.receivedByText || "");
        setDoNotes(
          initialInvoiceData.doNotes ||
            "- Barang telah diperiksa dan diterima dalam kondisi baik serta lengkap.\n- Harap dokumen Delivery Order ini ditandatangani & distempel oleh penerima."
        );

        const autoName =
          type === "delivery_order"
            ? formatDeliveryOrderPdfFileName(resolvedDoNum, num, recip)
            : formatInvoicePdfFileName(num, isDp, dpPct, dpLbl, recip);
        setDownloadFileName(autoName);
      } else if (type === "po" && initialPoData) {
        const num = initialPoData.poNo || "";
        const vName = initialPoData.vendorName || "";
        const [a1, a2, cz] = splitAddressLines(initialPoData.buyerAddress);

        setPoNo(num);
        setPoDate(initialPoData.date || new Date().toISOString().substring(0, 10));
        setPoDeliveryDate(initialPoData.deliveryDate || "");
        setPoVendorName(vName);
        setPoVendorAddress(initialPoData.vendorAddress || "");
        setPoVendorPhone(initialPoData.vendorPhone || "");
        setPoProjectRef(initialPoData.projectRef || "");
        setPoNotes(initialPoData.note || "Barang harus dalam kondisi baru, tersegel baik dan sesuai spesifikasi.");
        setPoDeliveryAddress(initialPoData.buyerAddress || "Workshop / Gudang GIGT Sepatan");
        setPoItems(initialPoData.items ? [...initialPoData.items] : []);
        setIncludePPN(initialPoData.ppnPercent ? initialPoData.ppnPercent > 0 : true);
        setTaxRate(initialPoData.ppnPercent || 11);
        setIncludeDiscount(Boolean(initialPoData.includeDiscount || (initialPoData.discountVal && initialPoData.discountVal > 0)));
        setDiscountType(initialPoData.discountType || "rupiah");
        setDiscountVal(initialPoData.discountVal || 0);
        setIncludeShipping(initialPoData.includeShipping || false);
        setShippingCost(initialPoData.shippingCost || 0);
        setShippingLabel(initialPoData.shippingLabel || "ONGKOS PENGIRIMAN SUPPLIER");
        setPoSignerName(initialPoData.signerName || "JIDAN RAMADHA");
        setCompName(initialPoData.buyerName || "PT. GARDA INOVASI GLOBALTECH");
        setCompAddress1(a1);
        setCompAddress2(a2);
        setCompCityZip(cz);
        setCompPhone(initialPoData.buyerPhone || "0888-1687-794");
        setCompEmail(initialPoData.buyerEmail || "pt.gardainovasiglobaltech@gmail.com");
        setCompLogoUrl(initialPoData.logoImage || "");

        setDownloadFileName(formatPoPdfFileName(vName, num));
      } else if (type === "surat_jalan" && initialSuratJalanData) {
        const num = initialSuratJalanData.number || initialSuratJalanData.suratNumber || "";
        const [a1, a2, cz] = splitAddressLines(initialSuratJalanData.ptAddress);

        setSjNum(num);
        setSjDate(initialSuratJalanData.date || new Date().toISOString().substring(0, 10));
        setSjRecipient(initialSuratJalanData.recipient || "");
        setSjAddress(initialSuratJalanData.address || "");
        setSjPhone(initialSuratJalanData.phone || initialSuratJalanData.ptPhone || "");
        setSjPoRef(initialSuratJalanData.poRef || "-");
        setSjVehicleType(initialSuratJalanData.vehicleType || "Mobil Truk / Pick Up");
        setSjVehiclePlate(initialSuratJalanData.vehiclePlate || "B 9182 GIG");
        setSjDriverName(initialSuratJalanData.driverName || "Sopir Logistik");
        setSjNotes(initialSuratJalanData.notes || "Harap barang dibongkar dengan hati-hati.");
        setSjItems(initialSuratJalanData.items ? [...initialSuratJalanData.items] : []);
        setCompName(initialSuratJalanData.ptName || "PT. GARDA INOVASI GLOBALTECH");
        setCompAddress1(a1);
        setCompAddress2(a2);
        setCompCityZip(cz);
        setCompPhone(initialSuratJalanData.ptPhone || "0888-1687-794");
        setCompEmail(initialSuratJalanData.ptEmail || "pt.gardainovasiglobaltech@gmail.com");
        setCompLogoUrl(initialSuratJalanData.logoImage || "");
        setSjSignatureType(initialSuratJalanData.signatureType || (initialSuratJalanData.signatureImage ? "upload" : "blank"));
        setSjSignatureUrl(initialSuratJalanData.signatureImage || initialSuratJalanData.digitalSignatureUrl || "");
        setSjSenderName(initialSuratJalanData.signerName || initialSuratJalanData.hormatKamiText || "Petugas Logistik / Admin");
        setSjSenderTitle(initialSuratJalanData.signerTitle || "Logistik & Ekspedisi");
        setSjReceivedBy(initialSuratJalanData.receivedByText || "Penerima / Klien");

        const cleanNum = (num || "SJ").replace(/[^a-zA-Z0-9_-]/g, "_");
        setDownloadFileName(`SURAT_JALAN_${cleanNum}.pdf`);
      } else if (type === "boq" && initialBoqData) {
        setBName(initialBoqData.name || "");
        setBType(initialBoqData.projType || "WTP");
        setBCapacity(initialBoqData.capacity || "");
        setBClient(initialBoqData.clientName || "");
        setBDesc(initialBoqData.description || "");
        setBItems(initialBoqData.items ? [...initialBoqData.items] : []);
        setDownloadFileName(`BOQ_Spesifikasi_${(initialBoqData.name || "WTP").replace(/\s+/g, "_")}.pdf`);
      }
    }
  }, [isOpen, type, initialQuotationData, initialInvoiceData, initialPoData, initialSuratJalanData, initialBoqData]);

  if (!isOpen) return null;

  // Connected BOQ for quotation
  const matchedBoq = type === "quotation" && connectedBoqId
    ? boqProjects.find((b) => b.id === connectedBoqId)
    : null;
  const currentBoqItemsToUse = matchedBoq ? matchedBoq.items || [] : [];

  // Quotation Financials
  const qSubtotal = qItems.reduce((acc, el) => acc + ((Number(el.vol || el.quantity) || 1) * (Number(el.unitPrice) || 0)), 0);
  const qDiscountAmount = (includeDiscount || discountVal > 0)
    ? (discountType === "percent" ? Math.round(qSubtotal * (discountVal / 100)) : discountVal)
    : 0;
  const qShipping = includeShipping ? Number(shippingCost || 0) : 0;
  const qTaxBase = Math.max(0, qSubtotal - qDiscountAmount);
  const qTax = includePPN ? Math.round(qTaxBase * (taxRate / 100)) : 0;
  const qGrandTotal = qTaxBase + qShipping + qTax;

  // Invoice Financials
  const invSubtotal = invItems.reduce((acc, el) => acc + ((Number(el.qty) || 1) * (Number(el.price) || 0)), 0);
  const invDiscountAmount = includeDiscount
    ? (discountType === "percent" ? Math.round(invSubtotal * (discountVal / 100)) : discountVal)
    : 0;
  const invTaxBase = Math.max(0, invSubtotal - invDiscountAmount);
  const invShipping = includeShipping ? Number(shippingCost || 0) : 0;
  const invTax = includePPN ? Math.round(invTaxBase * (taxRate / 100)) : 0;
  const invTotalFullProject = invTaxBase + invShipping + invTax;
  const invTotalStagesPercent = includeDownPayment
    ? paymentStages.reduce((acc, s) => acc + (Number(s.percent) || 0), 0)
    : 100;
  const invDownPaymentAmount = includeDownPayment
    ? Math.round((invTotalFullProject * invTotalStagesPercent) / 100)
    : 0;
  const invRemainingAmount = Math.max(0, invTotalFullProject - invDownPaymentAmount);
  const invGrandTotal = includeDownPayment ? invDownPaymentAmount : invTotalFullProject;

  // PO Financials
  const poSubtotal = poItems.reduce((acc, el) => acc + ((Number(el.qty) || 1) * (Number(el.price) || 0)), 0);
  const poDiscountAmount = (includeDiscount || discountVal > 0)
    ? (discountType === "percent" ? Math.round(poSubtotal * (discountVal / 100)) : discountVal)
    : 0;
  const poTaxBase = Math.max(0, poSubtotal - poDiscountAmount);
  const poShipping = includeShipping ? Number(shippingCost || 0) : 0;
  const poTax = includePPN ? Math.round(poTaxBase * (taxRate / 100)) : 0;
  const poGrandTotal = poTaxBase + poShipping + poTax;

  // Printable Width calculations for live preview + PDF column width ratio parity
  const pageWidthMm = paperSize === "f4" ? 215 : paperSize === "letter" ? 215.9 : 210;
  const marginMm = marginStyle === "compact" ? 10 : marginStyle === "wide" ? 20 : 15;
  const printableWidthMm = pageWidthMm - marginMm * 2;
  const computedDescColW = Math.max(
    36,
    (effectiveType === "surat_jalan" || effectiveType === "delivery_order")
      ? printableWidthMm - (colWidths.no + colWidths.qty + colWidths.unit + colWidths.condition)
      : printableWidthMm - (colWidths.no + colWidths.qty + colWidths.unit + colWidths.price + colWidths.total)
  );
  const pctOfPrintable = (mm: number) => `${((mm / printableWidthMm) * 100).toFixed(2)}%`;

  const handleSwitchInvoiceFamilyMode = (nextMode: "invoice" | "delivery_order") => {
    setActiveDocMode(nextMode);
    if (nextMode === "delivery_order") {
      setDownloadFileName(formatDeliveryOrderPdfFileName(doNum, invNum, invRecipient));
    } else {
      setDownloadFileName(
        formatInvoicePdfFileName(
          invNum,
          includeDownPayment,
          paymentStages[0]?.percent ?? downPaymentPercent,
          paymentStages[0]?.label || downPaymentLabel,
          invRecipient
        )
      );
    }
  };

  const numberToWordsID = (num: number): string => {
    const values = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    let result = "";
    if (num === 0) return "nol";
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
    }
    return result.trim().replace(/\s+/g, " ");
  };

  const [isSaving, setIsSaving] = useState(false);

  // Quick Editable Items Helper
  const activeEditableItems =
    effectiveType === "quotation"
      ? qItems
      : effectiveType === "invoice" || effectiveType === "delivery_order"
        ? invItems
        : effectiveType === "po"
          ? poItems
          : sjItems;
  const setActiveEditableItems = (next: any[]) => {
    if (effectiveType === "quotation") setQItems(next);
    else if (effectiveType === "invoice" || effectiveType === "delivery_order") setInvItems(next);
    else if (effectiveType === "po") setPoItems(next);
    else if (effectiveType === "surat_jalan") setSjItems(next);
  };

  const handleUpdatePreviewItem = (idx: number, field: string, value: any) => {
    const updated = activeEditableItems.map((item, i) => {
      if (i !== idx) return item;
      const nextItem = { ...item, [field]: value };
      if (effectiveType === "quotation") {
        const vol = Number(nextItem.vol ?? nextItem.quantity ?? 1) || 0;
        const unitPrice = Number(nextItem.unitPrice ?? 0) || 0;
        nextItem.total = vol * unitPrice;
      } else if (effectiveType === "invoice" || effectiveType === "delivery_order" || effectiveType === "po") {
        const qty = Number(nextItem.qty ?? 1) || 0;
        const price = Number(nextItem.price ?? 0) || 0;
        nextItem.subtotal = qty * price;
      }
      return nextItem;
    });
    setActiveEditableItems(updated);
  };

  const handleAddPreviewItem = () => {
    if (effectiveType === "quotation") {
      setQItems([...qItems, { description: "Item Baru", vol: 1, unit: "Unit", unitPrice: 0, total: 0, specifications: [] }]);
    } else if (effectiveType === "invoice" || effectiveType === "delivery_order" || effectiveType === "po") {
      setActiveEditableItems([
        ...activeEditableItems,
        { description: "Item Baru", qty: 1, unit: "Unit", price: 0, condition: "Baik & Lengkap", specifications: [] }
      ]);
    } else if (effectiveType === "surat_jalan") {
      setSjItems([...sjItems, { description: "Barang Baru", qty: 1, unit: "Unit", condition: "Baik & Lengkap" }]);
    }
  };

  const handleRemovePreviewItem = (idx: number) => {
    if (activeEditableItems.length <= 1) return;
    setActiveEditableItems(activeEditableItems.filter((_, i) => i !== idx));
  };

  const handleSaveOnly = async () => {
    setIsSaving(true);
    const combinedCompAddress = [compAddress1, compAddress2, compCityZip].filter(Boolean).join("\n");
    try {
      if (type === "quotation" && onSaveQuotation) {
        await onSaveQuotation({
          number: qNum,
          recipient: qRecipient,
          attention: qAttention,
          projectName: qProjectName,
          date: qDate,
          jobDescription: qJobDesc,
          notes: qNotes,
          paymentTerms: qPaymentTerms,
          preparedBy: qPreparedBy || "JIDAN RAMADHA",
          preparedByTitle: "",
          subTotal: qSubtotal,
          quotationType: qType,
          items: qItems,
          includeShipping,
          shippingLabel,
          shippingCost: includeShipping ? Number(shippingCost || 0) : 0,
          includePPN,
          includeDiscount,
          discountType,
          discountVal,
          discountAmount: qDiscountAmount,
          taxRate,
          compName,
          compAddress: combinedCompAddress,
          compPhone,
          compEmail,
          compLogoUrl,
          digitalSignatureUrl: qDigitalSigUrl,
          tax: qTax,
          grandTotal: qGrandTotal
        });
      } else if ((effectiveType === "invoice" || effectiveType === "delivery_order") && onSaveInvoice) {
        const finalAddr = doDeliveryAddress || invAddress;
        await onSaveInvoice({
          invoiceNumber: invNum,
          recipientName: invRecipient,
          clientName: invRecipient,
          recipientUp: invAttention,
          projectName: invProjectName,
          recipientAddress: finalAddr,
          clientAddress: finalAddr,
          deliveryAddress: finalAddr,
          doNumber: doNum,
          doDate,
          vehicleInfo: doVehicleInfo,
          receivedByText: doReceivedBy,
          doNotes,
          invoiceDate: invDate,
          dueDate: invDueDate,
          jobName: invJobDesc,
          poRef: invPoRef,
          items: invItems,
          enablePPN: includePPN,
          taxPercentage: includePPN ? taxRate : 0,
          includeShipping,
          shippingLabel,
          shippingCost: includeShipping ? Number(shippingCost || 0) : 0,
          includeDiscount,
          discountType,
          discountVal,
          discountAmount: invDiscountAmount,
          includeDownPayment,
          downPaymentLabel: paymentStages[0]?.label || downPaymentLabel,
          downPaymentPercent: paymentStages[0]?.percent ?? downPaymentPercent,
          downPaymentAmount: invDownPaymentAmount,
          remainingAmount: invRemainingAmount,
          totalFullProject: invTotalFullProject,
          paymentStages: includeDownPayment ? paymentStages : [],
          amount: invGrandTotal,
          grandTotal: invGrandTotal,
          companyName: compName,
          companyAddress: combinedCompAddress,
          companyPhone: compPhone,
          companyEmail: compEmail,
          logoImage: compLogoUrl,
          signatoryName: qPreparedBy || "JIDAN RAMADHA",
          signatoryRole: "",
          signatoryTitle: "",
          signatureImage: qDigitalSigUrl,
          digitalSignatureUrl: qDigitalSigUrl,
          bankName: invBankName,
          bankAccountName: invBankHolder,
          bankAccountNumber: invBankNumber,
          notes: invNotes
        });
      } else if (type === "po" && onSavePo) {
        await onSavePo({
          poNo,
          date: poDate,
          deliveryDate: poDeliveryDate,
          vendorName: poVendorName,
          vendorAddress: poVendorAddress,
          vendorPhone: poVendorPhone,
          projectRef: poProjectRef,
          note: poNotes,
          buyerName: compName,
          buyerAddress: combinedCompAddress,
          buyerPhone: compPhone,
          buyerEmail: compEmail,
          signerName: poSignerName || "JIDAN RAMADHA",
          signerRole: "",
          items: poItems,
          ppnPercent: includePPN ? taxRate : 0,
          includeDiscount,
          discountType,
          discountVal,
          discountAmount: poDiscountAmount,
          includeShipping,
          shippingLabel,
          shippingCost: includeShipping ? Number(shippingCost || 0) : 0,
          total: poGrandTotal
        });
      } else if (type === "surat_jalan" && onSaveSuratJalan) {
        await onSaveSuratJalan({
          number: sjNum,
          recipient: sjRecipient,
          address: sjAddress,
          date: sjDate,
          poRef: sjPoRef,
          vehicleType: sjVehicleType,
          vehiclePlate: sjVehiclePlate,
          driverName: sjDriverName,
          notes: sjNotes,
          items: sjItems,
          signatureType: sjSignatureType,
          signatureImage: sjSignatureUrl,
          digitalSignatureUrl: sjSignatureUrl,
          signerName: sjSenderName,
          signerTitle: sjSenderTitle,
          receivedByText: sjReceivedBy,
        });
      }
      onClose();
    } catch (err) {
      console.error("Gagal menyimpan dokumen:", err);
      alert("Gagal menyimpan dokumen. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- EXPORT PDF GENERATION ---
  const handleGeneratePDF = async (overrideMode?: "invoice" | "delivery_order") => {
    const renderType = overrideMode || effectiveType;
    const marginSize = marginMm;
    let docFormat = "a4";
    if (paperSize === "f4") docFormat = "folio";
    else if (paperSize === "letter") docFormat = "letter";

    const pdf = paperSize === "f4"
      ? new jsPDF("p", "mm", [215, 330])
      : new jsPDF("p", "mm", docFormat);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const accentRgb = hexToRgb(themeColor);

    // Font & Density configurations
    const fontDelta = fontScale === "small" ? -0.8 : fontScale === "large" ? 0.9 : 0;
    const cellPad = tableDensity === "compact"
      ? { top: 1.5, bottom: 1.5, left: 1.8, right: 1.8 }
      : tableDensity === "spacious"
        ? { top: 3.2, bottom: 3.2, left: 2.5, right: 2.5 }
        : { top: 2.2, bottom: 2.2, left: 2, right: 2 };
    const baseFontSize = (tableDensity === "compact" ? 7 : tableDensity === "spacious" ? 8.5 : 8) + fontDelta;

    // Helper: Draw Header KOP (Image 2 style: Logo on left, right-aligned company details)
    const drawHeaderKop = async (title: string) => {
      if (showCompanyLogo && compLogoUrl) {
        try {
          let format = "PNG";
          if (compLogoUrl.includes("image/jpeg") || compLogoUrl.includes("image/jpg")) format = "JPEG";
          const logoDim = await getImageDimensions(compLogoUrl);
          const ratio = logoDim.ratio;

          const maxLogoW = logoSize === "huge" ? 56 : logoSize === "large" ? 46 : logoSize === "compact" ? 28 : logoSize === "tiny" ? 22 : 36;
          const maxLogoH = logoSize === "huge" ? 28 : logoSize === "large" ? 23 : logoSize === "compact" ? 14 : logoSize === "tiny" ? 11 : 18;

          let finalLogoW = maxLogoW;
          let finalLogoH = maxLogoW / ratio;
          if (finalLogoH > maxLogoH) {
            finalLogoH = maxLogoH;
            finalLogoW = maxLogoH * ratio;
          }

          const logoY = 12 + Math.max(0, (22 - finalLogoH) / 2);
          pdf.addImage(compLogoUrl, format, marginSize, logoY, finalLogoW, finalLogoH, undefined, "FAST");
        } catch (_) {}
      }

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(compName, pageWidth - marginSize, 19, { align: "right" });
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");

      let hy = 24;
      if (compAddress1.trim()) {
        pdf.text(compAddress1.trim(), pageWidth - marginSize, hy, { align: "right" });
        hy += 4;
      }
      if (compAddress2.trim()) {
        pdf.text(compAddress2.trim(), pageWidth - marginSize, hy, { align: "right" });
        hy += 4;
      }
      const cityPhone = [compCityZip.trim(), compPhone.trim()].filter(Boolean).join(" | ");
      if (cityPhone) {
        pdf.text(cityPhone, pageWidth - marginSize, hy, { align: "right" });
        hy += 4;
      }
      if (compEmail.trim()) {
        pdf.setTextColor(0, 51, 153);
        pdf.text(compEmail.trim(), pageWidth - marginSize, hy, { align: "right" });
      }

      // Title
      pdf.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, pageWidth / 2, 50, { align: "center" });

      pdf.setDrawColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      pdf.setLineWidth(0.4);
      pdf.line(pageWidth / 2 - 40, 52.8, pageWidth / 2 + 40, 52.8);
    };

    // Helper: Draw Signatures (Name only, NO role/jabatan)
    const drawSignature = async (startY: number, signerName: string, blockTitle = "Hormat kami,") => {
      let finalY = startY;
      if (finalY > 240) {
        pdf.addPage();
        finalY = 20;
      }

      const sigX = marginSize;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(0, 0, 0);
      pdf.text(blockTitle, sigX, finalY);
      pdf.setFont("helvetica", "bold");
      pdf.text(compName, sigX, finalY + 4.2);

      const sName = (signerName || "JIDAN RAMADHA").toUpperCase();
      const nameW = pdf.getTextWidth(sName);
      const compW = pdf.getTextWidth(compName);
      const blockW = Math.max(nameW, compW, 46);

      if (qDigitalSigUrl && showDigitalStamp) {
        try {
          let sigFormat = "PNG";
          if (qDigitalSigUrl.includes("image/jpeg") || qDigitalSigUrl.includes("image/jpg")) sigFormat = "JPEG";
          const sigDim = await getImageDimensions(qDigitalSigUrl);
          const ratio = sigDim.ratio;

          const maxSigW = sigSize === "huge" ? 52 : sigSize === "large" ? 42 : sigSize === "compact" ? 26 : sigSize === "tiny" ? 20 : 34;
          const maxSigH = sigSize === "huge" ? 22 : sigSize === "large" ? 18 : sigSize === "compact" ? 12 : sigSize === "tiny" ? 9 : 15;

          let sigImgW = maxSigW;
          let sigImgH = maxSigW / ratio;
          if (sigImgH > maxSigH) {
            sigImgH = maxSigH;
            sigImgW = maxSigH * ratio;
          }

          let sigImgX = sigX;
          if (sigAlign === "center") sigImgX = sigX + Math.max(0, (blockW - sigImgW) / 2);

          pdf.addImage(qDigitalSigUrl, sigFormat, sigImgX, finalY + 5.5, sigImgW, sigImgH, undefined, "FAST");
          finalY += 5.5 + sigImgH + 2.5;
        } catch (_) {
          finalY += 14;
        }
      } else if (showDigitalStamp) {
        const stampW = 40;
        const stampH = 12;
        const stampX = sigAlign === "center" ? sigX + Math.max(0, (blockW - stampW) / 2) : sigX;
        pdf.setDrawColor(203, 213, 225);
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(stampX, finalY + 5.5, stampW, stampH, 1, 1, "FD");
        pdf.setFontSize(6.5);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
        pdf.text("VERIFIED SIGNATURE", stampX + stampW / 2, finalY + 9.5, { align: "center" });
        pdf.setFontSize(5.5);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Authorized by ${compName}`, stampX + stampW / 2, finalY + 14, { align: "center" });
        finalY += 16;
      } else {
        finalY += 14;
      }

      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);

      const signerX = sigAlign === "center" ? sigX + (blockW - nameW) / 2 : sigX;
      pdf.text(sName, signerX, finalY + 3.5);

      pdf.setDrawColor(51, 65, 85);
      pdf.setLineWidth(0.4);
      const lineStartX = sigAlign === "center" ? signerX : sigX;
      const lineEndX = sigAlign === "center" ? signerX + nameW : sigX + Math.max(nameW, 38);
      pdf.line(lineStartX, finalY + 5.8, lineEndX, finalY + 5.8);
    };

    // ==========================================
    // 1. SPH QUOTATION MODE
    // ==========================================
    if (renderType === "quotation") {
      await drawHeaderKop("SURAT PENAWARAN HARGA");

      const hasProj = Boolean(qProjectName.trim());
      const boxH = hasProj ? 24 : 22;

      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginSize, 57, pageWidth - (marginSize * 2), boxH, 1.5, 1.5, "FD");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);

      const leftColX = marginSize + 4;
      const leftColonX = leftColX + 20;
      const leftValX = leftColonX + 3;

      pdf.text("Kepada Yth", leftColX, 63);
      pdf.text(":", leftColonX, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(qRecipient || "-", leftValX, 63, { maxWidth: 62 });

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Up / Attn", leftColX, 69);
      pdf.text(":", leftColonX, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(qAttention || "-", leftValX, 69, { maxWidth: 62 });

      if (hasProj) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        pdf.text("Proyek", leftColX, 75);
        pdf.text(":", leftColonX, 75);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(qProjectName.trim(), leftValX, 75, { maxWidth: 62 });
      }

      const rightColStart = marginSize + (pageWidth - marginSize * 2) / 2 + 5;
      const rightColonX = rightColStart + 18;
      const rightValX = rightColonX + 3;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("No. SPH", rightColStart, 63);
      pdf.text(":", rightColonX, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(qNum || "-", rightValX, 63);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Tanggal", rightColStart, 69);
      pdf.text(":", rightColonX, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(qDate || "-", rightValX, 69);

      pdf.setTextColor(71, 85, 105);
      pdf.text("Pekerjaan", rightColStart, 75);
      pdf.text(":", rightColonX, 75);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(qJobDesc || "-", rightValX, 75, { maxWidth: 62 });

      const introY = hasProj ? 87 : 85;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(30, 41, 59);
      pdf.text("Bersama ini kami sampaikan penawaran harga dengan rincian spesifikasi sebagai berikut:", marginSize, introY);

      const tableHeaders = ["NO", "URAIAN PEKERJAAN", "VOL", "SATUAN", "HARGA SATUAN", "TOTAL BIAYA"];
      const col0W = colWidths.no;
      const col2W = colWidths.qty;
      const col3W = colWidths.unit;
      const col4W = colWidths.price;
      const col5W = colWidths.total;
      const col1W = computedDescColW;
      const specKeyOffset = col1W < 70 ? 18 : 23;
      const specValOffset = specKeyOffset + 3;

      const parsedItemRows = qItems.map((item) => {
        const itemTitle = (item.description || "").trim();
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(baseFontSize);
        const titleLines: string[] = itemTitle ? pdf.splitTextToSize(itemTitle, Math.max(20, col1W - 6)) : ["-"];

        let specs: { key: string; value: string }[] = [];
        if (item.specifications) {
          if (Array.isArray(item.specifications)) specs = item.specifications;
          else if (typeof item.specifications === "string") {
            specs = item.specifications.split("\n").filter(Boolean).map((l: string) => {
              const parts = l.split(":");
              return { key: parts[0]?.trim() || "", value: parts.slice(1).join(":")?.trim() || "" };
            });
          }
        }
        const validSpecs = specs.filter((s) => s && (s.key || s.value));

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize - 1);
        const parsedSpecs = validSpecs.map((sp) => {
          const rawKey = (sp.key || "").trim();
          const hasKey = Boolean(rawKey && rawKey !== "-");
          const k = hasKey ? rawKey.toUpperCase() : "";
          const v = (sp.value || "").trim();
          const valMaxWidth = Math.max(18, col1W - specValOffset - 2);
          const valLines: string[] = v ? pdf.splitTextToSize(v, valMaxWidth) : [""];
          return { hasKey, key: k, valLines };
        });

        const lineStep = tableDensity === "compact" ? 2.8 : tableDensity === "spacious" ? 3.6 : 3.2;
        const titleH = titleLines.length * (lineStep + 0.2);
        let specsH = 0;
        if (parsedSpecs.length > 0) {
          specsH = 1.4;
          parsedSpecs.forEach((ps) => {
            specsH += Math.max(1, ps.valLines.length) * (lineStep - 0.2) + 0.4;
          });
        }
        const totalHeight = 2.0 + titleH + specsH + 3.0;
        return { titleLines, parsedSpecs, totalHeight: Math.max(8, totalHeight) };
      });

      const qTableRows = qItems.map((item, index) => [
        String(index + 1),
        "",
        String(item.vol || item.quantity || 1),
        item.unit || "Unit",
        `Rp ${Number(item.unitPrice || 0).toLocaleString("id-ID")}`,
        `Rp ${((Number(item.vol || item.quantity) || 1) * (Number(item.unitPrice) || 0)).toLocaleString("id-ID")}`
      ]);

      const footRows: any[] = [
        [
          { content: "SUB TOTAL", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize, fillColor: [248, 250, 252] as any, textColor: [15, 23, 42] } },
          { content: `Rp ${qSubtotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 0.5, fillColor: [248, 250, 252] as any, textColor: [15, 23, 42] } }
        ]
      ];

      if (qDiscountAmount > 0) {
        footRows.push([
          { content: `DISKON ${discountType === "percent" && discountVal > 0 ? `(${discountVal}%)` : ""}`.trim(), colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize, fillColor: [248, 250, 252] as any, textColor: [220, 38, 38] } },
          { content: `-Rp ${qDiscountAmount.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 0.5, fillColor: [248, 250, 252] as any, textColor: [220, 38, 38] } }
        ]);
      }

      if (includeShipping) {
        footRows.push([
          { content: shippingLabel || "ONGKOS KIRIM / PENGIRIMAN", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize, fillColor: [248, 250, 252] as any, textColor: [15, 23, 42] } },
          { content: `Rp ${Number(shippingCost || 0).toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 0.5, fillColor: [248, 250, 252] as any, textColor: [15, 23, 42] } }
        ]);
      }

      if (includePPN) {
        footRows.push([
          { content: `PPN ${taxRate}%`, colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize, fillColor: [248, 250, 252] as any, textColor: [15, 23, 42] } },
          { content: `Rp ${qTax.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 0.5, fillColor: [248, 250, 252] as any, textColor: [15, 23, 42] } }
        ]);
      }

      footRows.push([
        { content: "GRAND TOTAL", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 0.5, fillColor: accentRgb as any, textColor: [255, 255, 255] } },
        { content: `Rp ${qGrandTotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 1, fillColor: accentRgb as any, textColor: [255, 255, 255] } }
      ]);

      autoTable(pdf, {
        head: [tableHeaders],
        body: qTableRows,
        foot: footRows,
        startY: introY + 4,
        margin: { left: marginSize, right: marginSize, bottom: 15 },
        theme: "grid",
        styles: {
          fontSize: baseFontSize,
          cellPadding: cellPad,
          textColor: [15, 23, 42],
          lineColor: [203, 213, 225],
          lineWidth: 0.1,
          valign: "top"
        },
        headStyles: {
          fillColor: accentRgb,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          lineColor: accentRgb,
          lineWidth: 0.1,
          fontSize: baseFontSize,
          cellPadding: 2.2
        },
        footStyles: {
          fillColor: [248, 250, 252],
          textColor: [15, 23, 42],
          fontStyle: "bold",
          lineColor: [203, 213, 225],
          lineWidth: 0.1,
          cellPadding: cellPad
        },
        columnStyles: {
          0: { halign: "center", cellWidth: col0W, fontStyle: "bold", valign: "top" },
          1: { halign: "left", cellWidth: col1W, valign: "top" },
          2: { halign: "center", cellWidth: col2W, valign: "top" },
          3: { halign: "center", cellWidth: col3W, valign: "top" },
          4: { halign: "right", cellWidth: col4W, valign: "top" },
          5: { halign: "right", cellWidth: col5W, valign: "top" }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
          if (data.section === "body") {
            const parsed = parsedItemRows[data.row.index];
            if (parsed) data.cell.styles.minCellHeight = parsed.totalHeight;
            if (data.column.index === 1) data.cell.text = [];
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const parsed = parsedItemRows[data.row.index];
            if (parsed) {
              let curY = data.cell.y + 2.2;
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(baseFontSize);
              pdf.setTextColor(15, 23, 42);
              parsed.titleLines.forEach((tLine: string) => {
                curY += 2.6;
                pdf.text(tLine, data.cell.x + 3, curY);
                curY += 0.5;
              });

              if (parsed.parsedSpecs.length > 0) {
                curY += 1.4;
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(baseFontSize - 1);
                parsed.parsedSpecs.forEach((sp) => {
                  const specLineStartY = curY + 2.2;
                  if (sp.hasKey) {
                    pdf.setTextColor(71, 85, 105);
                    pdf.text(sp.key, data.cell.x + 3, specLineStartY);
                    pdf.text(":", data.cell.x + specKeyOffset, specLineStartY);
                  }
                  pdf.setTextColor(15, 23, 42);
                  sp.valLines.forEach((vl: string, vlIdx: number) => {
                    const lineY = specLineStartY + (vlIdx * 2.8);
                    pdf.text(vl, data.cell.x + specValOffset, lineY);
                  });
                  curY += Math.max(1, sp.valLines.length) * 2.8 + 0.4;
                });
              }
            }
          }
        }
      });

      let finalY = (pdf as any).lastAutoTable.finalY + 5;
      if (finalY > 240) {
        pdf.addPage();
        finalY = 20;
      }

      if (showTerbilang) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(7.5);
        pdf.setTextColor(51, 65, 85);
        pdf.text(`*Terbilang : ${numberToWordsID(qGrandTotal)} rupiah`, marginSize, finalY);
        finalY += 4.5;
      }

      const contentWidth = pageWidth - (marginSize * 2);
      if (showTncNotes && (qNotes || qPaymentTerms)) {
        if (finalY > 245) {
          pdf.addPage();
          finalY = 20;
        }

        if (qNotes) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.5);
          pdf.setTextColor(30, 41, 59);
          pdf.text("Catatan / Notes:", marginSize, finalY);
          finalY += 3.5;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.setTextColor(71, 85, 105);
          const lines = pdf.splitTextToSize(qNotes.trim(), contentWidth);
          lines.forEach((l: string) => {
            pdf.text(l, marginSize, finalY);
            finalY += 3.2;
          });
          finalY += 1;
        }

        if (qPaymentTerms) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.5);
          pdf.setTextColor(30, 41, 59);
          pdf.text("Term of Payment:", marginSize, finalY);
          finalY += 3.5;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.setTextColor(71, 85, 105);
          const topLines = pdf.splitTextToSize(qPaymentTerms.trim(), contentWidth);
          topLines.forEach((l: string) => {
            pdf.text(l, marginSize, finalY);
            finalY += 3.2;
          });
          finalY += 1;
        }
      }

      finalY += 2;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text("Demikian penawaran ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terimakasih.", marginSize, finalY);
      finalY += 5.5;

      await drawSignature(finalY, qPreparedBy);

      // Connected BOQ if present
      if (connectedBoqId && currentBoqItemsToUse.length > 0) {
        pdf.addPage();
        const boqTitle = `SPESIFIKASI ${matchedBoq?.projType?.toUpperCase() || "WTP"}${matchedBoq?.capacity ? ` KAPASITAS ${matchedBoq?.capacity?.toUpperCase()}` : ""}`;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
        pdf.text(boqTitle, pageWidth / 2, 20, { align: "center" });

        const boqTableData = currentBoqItemsToUse.map((bi: any, index: number) => {
          let desc = bi.name.toUpperCase();
          const specLines = getCleanSpecLines(bi);
          if (specLines.length > 0) desc += "\n" + specLines.join("\n");
          return [String(index + 1), desc, bi.unit || "Unit", String(bi.quantity || bi.qty || 1)];
        });

        autoTable(pdf, {
          head: [["NO", "DESKRIPSI PARAMETERS & SPESIFIKASI", "SATUAN", "QTY"]],
          body: boqTableData,
          startY: 28,
          margin: { left: marginSize, right: marginSize },
          theme: "grid",
          styles: { fontSize: 8, font: "courier", cellPadding: 2.5, textColor: [0, 0, 0] },
          headStyles: { fillColor: accentRgb, textColor: [255, 255, 255], fontStyle: "bold" },
          columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { halign: "left" }, 2: { cellWidth: 20, halign: "center" }, 3: { cellWidth: 15, halign: "center" } }
        });
      }
    }

    // ==========================================
    // 2. INVOICE MODE
    // ==========================================
    else if (renderType === "invoice") {
      await drawHeaderKop("INVOICE / FAKTUR PENAGIHAN");

      const hasProj = Boolean(invProjectName.trim());
      const boxH = hasProj ? 24 : 22;

      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginSize, 57, pageWidth - (marginSize * 2), boxH, 1.5, 1.5, "FD");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);

      const leftColX = marginSize + 4;
      const leftColonX = leftColX + 24;
      const leftValX = leftColonX + 3;

      pdf.text("Ditagihkan Kepada", leftColX, 63);
      pdf.text(":", leftColonX, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(invRecipient || "-", leftValX, 63, { maxWidth: 60 });

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Up / Attn", leftColX, 69);
      pdf.text(":", leftColonX, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(invAttention || "-", leftValX, 69, { maxWidth: 60 });

      if (hasProj) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        pdf.text("Proyek", leftColX, 75);
        pdf.text(":", leftColonX, 75);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(invProjectName.trim(), leftValX, 75, { maxWidth: 60 });
      }

      const rightColStart = marginSize + (pageWidth - marginSize * 2) / 2 + 5;
      const rightColonX = rightColStart + 18;
      const rightValX = rightColonX + 3;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("No. Invoice", rightColStart, 63);
      pdf.text(":", rightColonX, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(invNum || "-", rightValX, 63);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Tanggal", rightColStart, 69);
      pdf.text(":", rightColonX, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(invDate || "-", rightValX, 69);

      pdf.setTextColor(71, 85, 105);
      pdf.text("Jatuh Tempo", rightColStart, 75);
      pdf.text(":", rightColonX, 75);
      pdf.setTextColor(15, 23, 42);
      pdf.text(invDueDate || "-", rightValX, 75);

      const introY = hasProj ? 87 : 85;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(30, 41, 59);
      pdf.text("Berikut adalah rincian tagihan atas barang / pekerjaan yang telah diselesaikan:", marginSize, introY);

      const invTableHeaders = ["NO", "URAIAN PEKERJAAN / BARANG", "QTY", "SATUAN", "HARGA SATUAN", "TOTAL BIAYA"];
      const col0W = colWidths.no;
      const col2W = colWidths.qty;
      const col3W = colWidths.unit;
      const col4W = colWidths.price;
      const col5W = colWidths.total;
      const col1W = computedDescColW;
      const specKeyOffset = col1W < 70 ? 18 : 23;
      const specValOffset = specKeyOffset + 3;

      const parsedInvRows = invItems.map((item) => {
        const itemTitle = (item.description || item.name || "").trim();
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(baseFontSize);
        const titleLines: string[] = itemTitle ? pdf.splitTextToSize(itemTitle, Math.max(20, col1W - 6)) : ["-"];

        let specs: { key: string; value: string }[] = [];
        if (item.specifications) {
          if (Array.isArray(item.specifications)) specs = item.specifications;
          else if (typeof item.specifications === "string") {
            specs = item.specifications.split("\n").filter(Boolean).map((l: string) => {
              const parts = l.split(":");
              return { key: parts[0]?.trim() || "", value: parts.slice(1).join(":")?.trim() || "" };
            });
          }
        }
        const validSpecs = specs.filter((s) => s && (s.key || s.value));

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize - 1);
        const parsedSpecs = validSpecs.map((sp) => {
          const rawKey = (sp.key || "").trim();
          const hasKey = Boolean(rawKey && rawKey !== "-");
          const k = hasKey ? rawKey.toUpperCase() : "";
          const v = (sp.value || "").trim();
          const valMaxWidth = Math.max(18, col1W - specValOffset - 2);
          const valLines: string[] = v ? pdf.splitTextToSize(v, valMaxWidth) : [""];
          return { hasKey, key: k, valLines };
        });

        const lineStep = tableDensity === "compact" ? 2.8 : tableDensity === "spacious" ? 3.6 : 3.2;
        const titleH = titleLines.length * (lineStep + 0.2);
        let specsH = 0;
        if (parsedSpecs.length > 0) {
          specsH = 1.4;
          parsedSpecs.forEach((ps) => {
            specsH += Math.max(1, ps.valLines.length) * (lineStep - 0.2) + 0.4;
          });
        }
        const totalHeight = 2.0 + titleH + specsH + 3.0;
        return { titleLines, parsedSpecs, totalHeight: Math.max(8, totalHeight) };
      });

      const invTableRows = invItems.map((item, index) => [
        String(index + 1),
        "",
        String(item.qty || 1),
        item.unit || "Unit",
        `Rp ${Number(item.price || 0).toLocaleString("id-ID")}`,
        `Rp ${((Number(item.qty) || 1) * (Number(item.price) || 0)).toLocaleString("id-ID")}`
      ]);

      const invFootRows: any[] = [
        [
          { content: "SUB TOTAL", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } },
          { content: `Rp ${invSubtotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } }
        ]
      ];

      if (includeDiscount && invDiscountAmount > 0) {
        invFootRows.push([
          { content: `DISKON ${discountType === "percent" ? `(${discountVal}%)` : ""}`, colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [254, 242, 242] as any, textColor: [225, 29, 72] } },
          { content: `-Rp ${invDiscountAmount.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [254, 242, 242] as any, textColor: [225, 29, 72] } }
        ]);
      }

      if (includeShipping) {
        invFootRows.push([
          { content: shippingLabel || "BIAYA PENGIRIMAN / ONGKIR", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } },
          { content: `Rp ${Number(shippingCost || 0).toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } }
        ]);
      }

      if (includePPN) {
        invFootRows.push([
          { content: `PPN ${taxRate}%`, colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } },
          { content: `Rp ${invTax.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } }
        ]);
      }

      if (includeDownPayment) {
        invFootRows.push([
          { content: "TOTAL NILAI PROYEK", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [241, 245, 249] as any } },
          { content: `Rp ${invTotalFullProject.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [241, 245, 249] as any } }
        ]);

        paymentStages.forEach((stage, idx) => {
          const stageAmt = Math.round((invTotalFullProject * (Number(stage.percent) || 0)) / 100);
          invFootRows.push([
            { content: `${stage.label || (idx === 0 ? "DOWN PAYMENT" : `TERMIN ${idx + 1}`)} (${stage.percent}%)`, colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [254, 243, 199] as any, textColor: [180, 83, 9] } },
            { content: `Rp ${stageAmt.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [254, 243, 199] as any, textColor: [180, 83, 9] } }
          ]);
        });

        if (invRemainingAmount > 0) {
          invFootRows.push([
            { content: `SISA PEMBAYARAN (${Math.max(0, 100 - invTotalStagesPercent)}%)`, colSpan: 4, styles: { halign: "right", fontStyle: "normal" as const, fillColor: [248, 250, 252] as any, textColor: [100, 116, 139] } },
            { content: `Rp ${invRemainingAmount.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "normal" as const, fillColor: [248, 250, 252] as any, textColor: [100, 116, 139] } }
          ]);
        }
        invFootRows.push([
          { content: `TOTAL TAGIHAN INI (${invTotalStagesPercent}%)`, colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: accentRgb as any, textColor: [255, 255, 255] } },
          { content: `Rp ${invGrandTotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: accentRgb as any, textColor: [255, 255, 255] } }
        ]);
      } else {
        invFootRows.push([
          { content: "TOTAL TAGIHAN", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: accentRgb as any, textColor: [255, 255, 255] } },
          { content: `Rp ${invGrandTotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: accentRgb as any, textColor: [255, 255, 255] } }
        ]);
      }

      autoTable(pdf, {
        head: [invTableHeaders],
        body: invTableRows,
        foot: invFootRows,
        startY: introY + 4,
        margin: { left: marginSize, right: marginSize, bottom: 15 },
        theme: "grid",
        styles: { fontSize: baseFontSize, cellPadding: cellPad, textColor: [15, 23, 42], lineColor: [203, 213, 225], lineWidth: 0.1, valign: "top" },
        headStyles: { fillColor: accentRgb, textColor: [255, 255, 255], fontStyle: "bold", halign: "center", lineColor: accentRgb, lineWidth: 0.1, fontSize: baseFontSize, cellPadding: 2.2 },
        footStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: "bold", lineColor: [203, 213, 225], lineWidth: 0.1, cellPadding: cellPad },
        columnStyles: {
          0: { halign: "center", cellWidth: col0W, fontStyle: "bold", valign: "top" },
          1: { halign: "left", cellWidth: col1W, valign: "top" },
          2: { halign: "center", cellWidth: col2W, valign: "top" },
          3: { halign: "center", cellWidth: col3W, valign: "top" },
          4: { halign: "right", cellWidth: col4W, valign: "top" },
          5: { halign: "right", cellWidth: col5W, valign: "top" }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
          if (data.section === "body") {
            const parsed = parsedInvRows[data.row.index];
            if (parsed) data.cell.styles.minCellHeight = parsed.totalHeight;
            if (data.column.index === 1) data.cell.text = [];
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const parsed = parsedInvRows[data.row.index];
            if (parsed) {
              let curY = data.cell.y + 2.2;
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(baseFontSize);
              pdf.setTextColor(15, 23, 42);
              parsed.titleLines.forEach((tLine: string) => {
                curY += 2.6;
                pdf.text(tLine, data.cell.x + 3, curY);
                curY += 0.5;
              });

              if (parsed.parsedSpecs.length > 0) {
                curY += 1.4;
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(baseFontSize - 1);
                parsed.parsedSpecs.forEach((sp) => {
                  const specLineStartY = curY + 2.2;
                  if (sp.hasKey) {
                    pdf.setTextColor(71, 85, 105);
                    pdf.text(sp.key, data.cell.x + 3, specLineStartY);
                    pdf.text(":", data.cell.x + specKeyOffset, specLineStartY);
                  }
                  pdf.setTextColor(15, 23, 42);
                  sp.valLines.forEach((vl: string, vlIdx: number) => {
                    const lineY = specLineStartY + (vlIdx * 2.8);
                    pdf.text(vl, data.cell.x + specValOffset, lineY);
                  });
                  curY += Math.max(1, sp.valLines.length) * 2.8 + 0.4;
                });
              }
            }
          }
        }
      });

      let finalY = (pdf as any).lastAutoTable.finalY + 5;
      if (showTerbilang) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(7.5);
        pdf.text(`*Terbilang : ${numberToWordsID(invGrandTotal)} rupiah`, marginSize, finalY);
        finalY += 5;
      }

      // Bank Payment Box
      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(marginSize, finalY, pageWidth - marginSize * 2, 14, 1.5, 1.5, "FD");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      pdf.text(`Pembayaran Transfer : Bank ${invBankName} - Rek: ${invBankNumber} a/n ${invBankHolder}`, marginSize + 4, finalY + 5.5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(71, 85, 105);
      pdf.text("Mohon cantumkan No. Invoice pada berita transfer dan konfirmasi bukti bayar ke finance.", marginSize + 4, finalY + 10.5);
      finalY += 18;

      if (showTncNotes && invNotes.trim()) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(71, 85, 105);
        const lines = pdf.splitTextToSize(invNotes.trim(), pageWidth - marginSize * 2);
        lines.forEach((l: string) => {
          pdf.text(l, marginSize, finalY);
          finalY += 3.2;
        });
        finalY += 2;
      }

      await drawSignature(finalY, qPreparedBy);
    }

    // ==========================================
    // 2B. DELIVERY ORDER (FROM INVOICE) MODE
    // ==========================================
    else if (renderType === "delivery_order") {
      await drawHeaderKop("DELIVERY ORDER");

      const doAddrText = (doDeliveryAddress || invAddress || "").trim();
      const addrLines = doAddrText ? pdf.splitTextToSize(doAddrText, 60) : ["-"];
      const leftLinesCount = 2 + (invProjectName.trim() ? 1 : 0) + addrLines.length;
      const rightLinesCount = 3 + (invJobDesc.trim() ? 1 : 0) + (doVehicleInfo.trim() ? 1 : 0);
      const maxMetaLines = Math.max(leftLinesCount, rightLinesCount);
      const boxH = Math.max(24, 10 + maxMetaLines * 5.2);

      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginSize, 57, pageWidth - marginSize * 2, boxH, 1.5, 1.5, "FD");

      pdf.setFontSize(8);
      const leftColX = marginSize + 4;
      const leftColonX = leftColX + 22;
      const leftValX = leftColonX + 3;
      let ly = 63;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Kepada Yth", leftColX, ly);
      pdf.text(":", leftColonX, ly);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(invRecipient || "-", leftValX, ly, { maxWidth: 60 });
      ly += 5.5;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Up / Attn", leftColX, ly);
      pdf.text(":", leftColonX, ly);
      pdf.setTextColor(15, 23, 42);
      pdf.text(invAttention || "-", leftValX, ly, { maxWidth: 60 });
      ly += 5.5;

      if (invProjectName.trim()) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        pdf.text("Proyek", leftColX, ly);
        pdf.text(":", leftColonX, ly);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(invProjectName.trim(), leftValX, ly, { maxWidth: 60 });
        ly += 5.5;
      }

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Alamat Kirim", leftColX, ly);
      pdf.text(":", leftColonX, ly);
      pdf.setTextColor(15, 23, 42);
      addrLines.forEach((line: string, idx: number) => {
        pdf.text(line, leftValX, ly + idx * 4);
      });

      const rightColStart = marginSize + (pageWidth - marginSize * 2) / 2 + 5;
      const rightColonX = rightColStart + 20;
      const rightValX = rightColonX + 3;
      let ry = 63;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("No. DO", rightColStart, ry);
      pdf.text(":", rightColonX, ry);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(doNum || "-", rightValX, ry);
      ry += 5.5;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Ref. Invoice", rightColStart, ry);
      pdf.text(":", rightColonX, ry);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(invNum || "-", rightValX, ry);
      ry += 5.5;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Tanggal Kirim", rightColStart, ry);
      pdf.text(":", rightColonX, ry);
      pdf.setTextColor(15, 23, 42);
      pdf.text(doDate || invDate || "-", rightValX, ry);
      ry += 5.5;

      if (invJobDesc.trim()) {
        pdf.setTextColor(71, 85, 105);
        pdf.text("Pekerjaan", rightColStart, ry);
        pdf.text(":", rightColonX, ry);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(invJobDesc.trim(), rightValX, ry, { maxWidth: 58 });
        ry += 5.5;
      }

      if (doVehicleInfo.trim()) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        pdf.text("Kendaraan", rightColStart, ry);
        pdf.text(":", rightColonX, ry);
        pdf.setTextColor(15, 23, 42);
        pdf.text(doVehicleInfo.trim(), rightValX, ry, { maxWidth: 58 });
      }

      const introY = 57 + boxH + 6;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(30, 41, 59);
      pdf.text("Bersama ini kami kirimkan barang / pekerjaan sesuai rincian di bawah ini untuk dapat diterima dengan baik:", marginSize, introY);

      const doTableHeaders = ["NO", "URAIAN BARANG / PEKERJAAN", "QTY", "SATUAN", "KETERANGAN / KONDISI"];
      const col0W = colWidths.no;
      const col2W = colWidths.qty;
      const col3W = colWidths.unit;
      const col4W = colWidths.condition;
      const col1W = printableWidthMm - (col0W + col2W + col3W + col4W);
      const specKeyOffset = col1W < 70 ? 18 : 23;
      const specValOffset = specKeyOffset + 3;

      const parsedDoRows = invItems.map((item) => {
        const itemTitle = (item.description || item.name || "").trim();
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(baseFontSize);
        const titleLines: string[] = itemTitle ? pdf.splitTextToSize(itemTitle, Math.max(20, col1W - 6)) : ["-"];

        let specs: { key: string; value: string }[] = [];
        if (item.specifications) {
          if (Array.isArray(item.specifications)) specs = item.specifications;
          else if (typeof item.specifications === "string") {
            specs = item.specifications.split("\n").filter(Boolean).map((l: string) => {
              const parts = l.split(":");
              return { key: parts[0]?.trim() || "", value: parts.slice(1).join(":")?.trim() || "" };
            });
          }
        }
        const validSpecs = specs.filter((s) => s && (s.key || s.value));

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize - 1);
        const parsedSpecs = validSpecs.map((sp) => {
          const rawKey = (sp.key || "").trim();
          const hasKey = Boolean(rawKey && rawKey !== "-");
          const k = hasKey ? rawKey.toUpperCase() : "";
          const v = (sp.value || "").trim();
          const valMaxWidth = Math.max(18, col1W - specValOffset - 2);
          const valLines: string[] = v ? pdf.splitTextToSize(v, valMaxWidth) : [""];
          return { hasKey, key: k, valLines };
        });

        const lineStep = tableDensity === "compact" ? 2.8 : tableDensity === "spacious" ? 3.6 : 3.2;
        const titleH = titleLines.length * (lineStep + 0.2);
        let specsH = 0;
        if (parsedSpecs.length > 0) {
          specsH = 1.4;
          parsedSpecs.forEach((ps) => {
            specsH += Math.max(1, ps.valLines.length) * (lineStep - 0.2) + 0.4;
          });
        }
        const totalHeight = 2.0 + titleH + specsH + 3.0;
        return { titleLines, parsedSpecs, totalHeight: Math.max(8, totalHeight) };
      });

      const doTableRows = invItems.map((item, index) => [
        String(index + 1),
        "",
        String(item.qty || 1),
        item.unit || "Unit",
        item.condition || "Baik & Lengkap"
      ]);

      autoTable(pdf, {
        head: [doTableHeaders],
        body: doTableRows,
        startY: introY + 4,
        margin: { left: marginSize, right: marginSize, bottom: 15 },
        theme: "grid",
        styles: { fontSize: baseFontSize, cellPadding: cellPad, textColor: [15, 23, 42], lineColor: [203, 213, 225], lineWidth: 0.1, valign: "top" },
        headStyles: { fillColor: accentRgb, textColor: [255, 255, 255], fontStyle: "bold", halign: "center", lineColor: accentRgb, lineWidth: 0.1, fontSize: baseFontSize, cellPadding: 2.2 },
        columnStyles: {
          0: { halign: "center", cellWidth: col0W, fontStyle: "bold", valign: "top" },
          1: { halign: "left", cellWidth: col1W, valign: "top" },
          2: { halign: "center", cellWidth: col2W, valign: "top" },
          3: { halign: "center", cellWidth: col3W, valign: "top" },
          4: { halign: "center", cellWidth: col4W, valign: "top" }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
          if (data.section === "body") {
            const parsed = parsedDoRows[data.row.index];
            if (parsed) data.cell.styles.minCellHeight = parsed.totalHeight;
            if (data.column.index === 1) data.cell.text = [];
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const parsed = parsedDoRows[data.row.index];
            if (parsed) {
              let curY = data.cell.y + 2.2;
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(baseFontSize);
              pdf.setTextColor(15, 23, 42);
              parsed.titleLines.forEach((tLine: string) => {
                curY += 2.6;
                pdf.text(tLine, data.cell.x + 3, curY);
                curY += 0.5;
              });

              if (parsed.parsedSpecs.length > 0) {
                curY += 1.4;
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(baseFontSize - 1);
                parsed.parsedSpecs.forEach((sp) => {
                  const specLineStartY = curY + 2.2;
                  if (sp.hasKey) {
                    pdf.setTextColor(71, 85, 105);
                    pdf.text(sp.key, data.cell.x + 3, specLineStartY);
                    pdf.text(":", data.cell.x + specKeyOffset, specLineStartY);
                  }
                  pdf.setTextColor(15, 23, 42);
                  sp.valLines.forEach((vl: string, vlIdx: number) => {
                    const lineY = specLineStartY + vlIdx * 2.8;
                    pdf.text(vl, data.cell.x + specValOffset, lineY);
                  });
                  curY += Math.max(1, sp.valLines.length) * 2.8 + 0.4;
                });
              }
            }
          }
        }
      });

      let finalY = (pdf as any).lastAutoTable.finalY + 7;
      if (finalY > 235) {
        pdf.addPage();
        finalY = 20;
      }

      if (showTncNotes && doNotes.trim()) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(30, 41, 59);
        pdf.text("Catatan Pengiriman:", marginSize, finalY);
        finalY += 3.5;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(71, 85, 105);
        const noteLines = pdf.splitTextToSize(doNotes.trim(), pageWidth - marginSize * 2);
        noteLines.forEach((nl: string) => {
          pdf.text(nl, marginSize, finalY);
          finalY += 3.2;
        });
        finalY += 4;
      }

      if (finalY > 235) {
        pdf.addPage();
        finalY = 20;
      }

      const halfCol = (pageWidth - marginSize * 2) / 2;
      const rightBlockX = marginSize + halfCol + 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Diterima Oleh,", marginSize, finalY);
      pdf.text("Hormat kami,", rightBlockX, finalY);

      pdf.setFont("helvetica", "bold");
      pdf.text(invRecipient || "Pihak Penerima", marginSize, finalY + 4.2, { maxWidth: halfCol - 6 });
      pdf.text(compName, rightBlockX, finalY + 4.2, { maxWidth: halfCol - 10 });

      let sigAreaH = 18;
      if (qDigitalSigUrl && showDigitalStamp) {
        try {
          let sigFormat = "PNG";
          if (qDigitalSigUrl.includes("image/jpeg") || qDigitalSigUrl.includes("image/jpg")) sigFormat = "JPEG";
          const sigDim = await getImageDimensions(qDigitalSigUrl);
          const maxSigW = sigSize === "huge" ? 50 : sigSize === "large" ? 40 : sigSize === "compact" ? 26 : sigSize === "tiny" ? 20 : 32;
          const maxSigH = sigSize === "huge" ? 20 : sigSize === "large" ? 16 : sigSize === "compact" ? 11 : sigSize === "tiny" ? 9 : 14;
          let sigW = maxSigW;
          let sigH = maxSigW / sigDim.ratio;
          if (sigH > maxSigH) {
            sigH = maxSigH;
            sigW = maxSigH * sigDim.ratio;
          }
          pdf.addImage(qDigitalSigUrl, sigFormat, rightBlockX, finalY + 6, sigW, sigH, undefined, "FAST");
          sigAreaH = Math.max(18, sigH + 8);
        } catch (_) {}
      }

      const lineY = finalY + 4.2 + sigAreaH;
      pdf.setDrawColor(51, 65, 85);
      pdf.setLineWidth(0.3);
      pdf.line(marginSize, lineY, marginSize + 48, lineY);
      pdf.line(rightBlockX, lineY, rightBlockX + 48, lineY);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      const recvLabel = doReceivedBy.trim() ? doReceivedBy.trim().toUpperCase() : "( Nama Jelas & Stempel )";
      pdf.text(recvLabel, marginSize, lineY + 4);
      pdf.text((qPreparedBy || "JIDAN RAMADHA").toUpperCase(), rightBlockX, lineY + 4);
    }

    // ==========================================
    // 3. PURCHASE ORDER (PO) MODE
    // ==========================================
    else if (renderType === "po") {
      await drawHeaderKop("PURCHASE ORDER (PO)");

      const hasProj = Boolean(poProjectRef.trim());
      const boxH = hasProj ? 24 : 22;

      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(marginSize, 57, pageWidth - (marginSize * 2), boxH, 1.5, 1.5, "FD");

      const leftColX = marginSize + 4;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Kepada (Vendor)", leftColX, 63);
      pdf.text(":", leftColX + 24, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(poVendorName || "-", leftColX + 27, 63, { maxWidth: 60 });

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Alamat", leftColX, 69);
      pdf.text(":", leftColX + 24, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(poVendorAddress || "-", leftColX + 27, 69, { maxWidth: 60 });

      if (hasProj) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        pdf.text("Proyek", leftColX, 75);
        pdf.text(":", leftColX + 24, 75);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 23, 42);
        pdf.text(poProjectRef.trim(), leftColX + 27, 75, { maxWidth: 60 });
      }

      const rightColStart = marginSize + (pageWidth - marginSize * 2) / 2 + 5;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("No. PO", rightColStart, 63);
      pdf.text(":", rightColStart + 18, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(poNo || "-", rightColStart + 21, 63);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Tanggal PO", rightColStart, 69);
      pdf.text(":", rightColStart + 18, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(poDate || "-", rightColStart + 21, 69);

      pdf.setTextColor(71, 85, 105);
      pdf.text("Batas Kirim", rightColStart, 75);
      pdf.text(":", rightColStart + 18, 75);
      pdf.setTextColor(15, 23, 42);
      pdf.text(poDeliveryDate || "-", rightColStart + 21, 75);

      const introY = hasProj ? 87 : 85;
      pdf.setTextColor(30, 41, 59);
      pdf.text("Dengan ini kami memesan barang / jasa dengan spesifikasi dan ketentuan berikut:", marginSize, introY);

      const poTableRows = poItems.map((item, index) => [
        String(index + 1),
        item.description || item.name || "-",
        String(item.qty || 1),
        item.unit || "Unit",
        `Rp ${Number(item.price || 0).toLocaleString("id-ID")}`,
        `Rp ${((Number(item.qty) || 1) * (Number(item.price) || 0)).toLocaleString("id-ID")}`
      ]);

      const poFootRows: any[] = [
        [
          { content: "SUB TOTAL", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } },
          { content: `Rp ${poSubtotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } }
        ]
      ];

      if (poDiscountAmount > 0) {
        poFootRows.push([
          { content: `DISKON ${discountType === "percent" ? `(${discountVal}%)` : ""}`.trim(), colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [254, 242, 242] as any, textColor: [220, 38, 38] } },
          { content: `-Rp ${poDiscountAmount.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [254, 242, 242] as any, textColor: [220, 38, 38] } }
        ]);
      }

      if (includeShipping) {
        poFootRows.push([
          { content: shippingLabel || "ONGKOS KIRIM SUPPLIER", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } },
          { content: `Rp ${Number(shippingCost || 0).toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } }
        ]);
      }

      if (includePPN) {
        poFootRows.push([
          { content: `PPN ${taxRate}%`, colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } },
          { content: `Rp ${poTax.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [248, 250, 252] as any } }
        ]);
      }

      poFootRows.push([
        { content: "TOTAL PO", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: accentRgb as any, textColor: [255, 255, 255] } },
        { content: `Rp ${poGrandTotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: accentRgb as any, textColor: [255, 255, 255] } }
      ]);

      autoTable(pdf, {
        head: [["NO", "DESKRIPSI BARANG / PEKERJAAN", "QTY", "SATUAN", "HARGA SATUAN", "TOTAL HARGA"]],
        body: poTableRows,
        foot: poFootRows,
        startY: introY + 4,
        margin: { left: marginSize, right: marginSize },
        theme: "grid",
        styles: { fontSize: baseFontSize, cellPadding: cellPad, textColor: [15, 23, 42], lineColor: [203, 213, 225], lineWidth: 0.1 },
        headStyles: { fillColor: accentRgb, textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
        columnStyles: {
          0: { cellWidth: colWidths.no, halign: "center", fontStyle: "bold" },
          1: { cellWidth: computedDescColW, halign: "left" },
          2: { cellWidth: colWidths.qty, halign: "center" },
          3: { cellWidth: colWidths.unit, halign: "center" },
          4: { cellWidth: colWidths.price, halign: "right" },
          5: { cellWidth: colWidths.total, halign: "right" }
        }
      });

      let finalY = (pdf as any).lastAutoTable.finalY + 5;
      if (showTerbilang) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(7.5);
        pdf.text(`*Terbilang : ${numberToWordsID(poGrandTotal)} rupiah`, marginSize, finalY);
        finalY += 5;
      }

      if (showTncNotes && poNotes.trim()) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(30, 41, 59);
        pdf.text("Catatan / Keterangan:", marginSize, finalY);
        finalY += 3.5;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(71, 85, 105);
        const lines = pdf.splitTextToSize(poNotes.trim(), pageWidth - marginSize * 2);
        lines.forEach((l: string) => {
          pdf.text(l, marginSize, finalY);
          finalY += 3.2;
        });
        finalY += 3;
      }

      // Two column signature for PO: Name only (NO role/jabatan)
      const colW = (pageWidth - marginSize * 2) / 2;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      pdf.text("Disetujui Oleh :", marginSize, finalY);
      pdf.text("Dikonfirmasi & Diterima Supplier :", marginSize + colW, finalY);

      finalY += 18;
      pdf.line(marginSize, finalY, marginSize + 45, finalY);
      pdf.line(marginSize + colW, finalY, marginSize + colW + 45, finalY);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text((poSignerName || "JIDAN RAMADHA").toUpperCase(), marginSize, finalY + 4);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${poVendorName || "Pihak Supplier"}`, marginSize + colW, finalY + 4);
    }

    // ==========================================
    // 4. SURAT JALAN MODE
    // ==========================================
    else if (renderType === "surat_jalan") {
      await drawHeaderKop("SURAT JALAN");

      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(marginSize, 57, pageWidth - (marginSize * 2), 22, 1.5, 1.5, "FD");

      const leftColX = marginSize + 4;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Kepada Yth", leftColX, 63);
      pdf.text(":", leftColX + 22, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(sjRecipient || "-", leftColX + 25, 63);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Alamat Kirim", leftColX, 69);
      pdf.text(":", leftColX + 22, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(sjAddress || "-", leftColX + 25, 69, { maxWidth: 62 });

      const rightColStart = marginSize + (pageWidth - marginSize * 2) / 2 + 5;
      pdf.setTextColor(71, 85, 105);
      pdf.text("No. Surat Jalan", rightColStart, 63);
      pdf.text(":", rightColStart + 22, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(sjNum || "-", rightColStart + 25, 63);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Tanggal Kirim", rightColStart, 69);
      pdf.text(":", rightColStart + 22, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(sjDate || "-", rightColStart + 25, 69);

      pdf.setTextColor(71, 85, 105);
      pdf.text("Kendaraan / Plat", rightColStart, 75);
      pdf.text(":", rightColStart + 22, 75);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${sjVehicleType} (${sjVehiclePlate})`, rightColStart + 25, 75);

      pdf.setTextColor(30, 41, 59);
      pdf.text("Harap diterima dengan baik barang-barang yang tertera di bawah ini:", marginSize, 85);

      const sjTableHeaders = ["NO", "NAMA BARANG & SPESIFIKASI", "JUMLAH", "SATUAN", "KONDISI / KETERANGAN"];
      const col0W = colWidths.no;
      const col2W = colWidths.qty;
      const col3W = colWidths.unit;
      const col4W = colWidths.condition;
      const col1W = computedDescColW;
      const specKeyOffset = col1W < 70 ? 18 : 23;
      const specValOffset = specKeyOffset + 3;

      const parsedSjRows = sjItems.map((item) => {
        const itemTitle = (item.description || item.name || "").trim();
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(baseFontSize);
        const titleLines: string[] = itemTitle ? pdf.splitTextToSize(itemTitle, Math.max(20, col1W - 6)) : ["-"];

        let specs: { key: string; value: string }[] = [];
        if (item.specifications) {
          if (Array.isArray(item.specifications)) specs = item.specifications;
          else if (typeof item.specifications === "string") {
            specs = item.specifications.split("\n").filter(Boolean).map((l: string) => {
              const parts = l.split(":");
              return { key: parts[0]?.trim() || "", value: parts.slice(1).join(":")?.trim() || "" };
            });
          }
        }
        const validSpecs = specs.filter((s) => s && (s.key || s.value));

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize - 1);
        const parsedSpecs = validSpecs.map((sp) => {
          const rawKey = (sp.key || "").trim();
          const hasKey = Boolean(rawKey && rawKey !== "-");
          const k = hasKey ? rawKey.toUpperCase() : "";
          const v = (sp.value || "").trim();
          const valMaxWidth = Math.max(18, col1W - specValOffset - 2);
          const valLines: string[] = v ? pdf.splitTextToSize(v, valMaxWidth) : [""];
          return { hasKey, key: k, valLines };
        });

        const lineStep = tableDensity === "compact" ? 2.8 : tableDensity === "spacious" ? 3.6 : 3.2;
        const titleH = titleLines.length * (lineStep + 0.2);
        let specsH = 0;
        if (parsedSpecs.length > 0) {
          specsH = 1.4;
          parsedSpecs.forEach((ps) => {
            specsH += Math.max(1, ps.valLines.length) * (lineStep - 0.2) + 0.4;
          });
        }
        const totalHeight = 2.0 + titleH + specsH + 3.0;
        return { titleLines, parsedSpecs, totalHeight: Math.max(8, totalHeight) };
      });

      const sjTableRows = sjItems.map((item, index) => [
        String(index + 1),
        "",
        String(item.qty || 1),
        item.unit || "Unit",
        item.condition || "Baik & Lengkap"
      ]);

      autoTable(pdf, {
        head: [sjTableHeaders],
        body: sjTableRows,
        startY: 89,
        margin: { left: marginSize, right: marginSize, bottom: 15 },
        theme: "grid",
        styles: { fontSize: baseFontSize, cellPadding: cellPad, textColor: [15, 23, 42], lineColor: [203, 213, 225], lineWidth: 0.1, valign: "top" },
        headStyles: { fillColor: accentRgb, textColor: [255, 255, 255], fontStyle: "bold", halign: "center", lineColor: accentRgb, lineWidth: 0.1, fontSize: baseFontSize, cellPadding: 2.2 },
        columnStyles: {
          0: { halign: "center", cellWidth: col0W, fontStyle: "bold", valign: "top" },
          1: { halign: "left", cellWidth: col1W, valign: "top" },
          2: { halign: "center", cellWidth: col2W, valign: "top" },
          3: { halign: "center", cellWidth: col3W, valign: "top" },
          4: { halign: "center", cellWidth: col4W, valign: "top" }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
          if (data.section === "body") {
            const parsed = parsedSjRows[data.row.index];
            if (parsed) data.cell.styles.minCellHeight = parsed.totalHeight;
            if (data.column.index === 1) data.cell.text = [];
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const parsed = parsedSjRows[data.row.index];
            if (parsed) {
              let curY = data.cell.y + 2.2;
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(baseFontSize);
              pdf.setTextColor(15, 23, 42);
              parsed.titleLines.forEach((tLine: string) => {
                curY += 2.6;
                pdf.text(tLine, data.cell.x + 3, curY);
                curY += 0.5;
              });

              if (parsed.parsedSpecs.length > 0) {
                curY += 1.4;
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(baseFontSize - 1);
                parsed.parsedSpecs.forEach((sp) => {
                  const specLineStartY = curY + 2.2;
                  if (sp.hasKey) {
                    pdf.setTextColor(71, 85, 105);
                    pdf.text(sp.key, data.cell.x + 3, specLineStartY);
                    pdf.text(":", data.cell.x + specKeyOffset, specLineStartY);
                  }
                  pdf.setTextColor(15, 23, 42);
                  sp.valLines.forEach((vl: string, vlIdx: number) => {
                    const lineY = specLineStartY + (vlIdx * 2.8);
                    pdf.text(vl, data.cell.x + specValOffset, lineY);
                  });
                  curY += Math.max(1, sp.valLines.length) * 2.8 + 0.4;
                });
              }
            }
          }
        }
      });

      let finalY = (pdf as any).lastAutoTable.finalY + 8;
      if (finalY > 230) {
        pdf.addPage();
        finalY = 20;
      }

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Catatan: ${sjNotes}`, marginSize, finalY);
      finalY += 8;

      const colW = (pageWidth - marginSize * 2) / 2;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      pdf.text("Penerima / Klien :", marginSize, finalY);
      pdf.text("Hormat Kami / Pengirim :", marginSize + colW, finalY);

      let sigH = 18;
      if (sjSignatureType === "upload" && sjSignatureUrl && showDigitalStamp) {
        try {
          const sigDim = await getImageDimensions(sjSignatureUrl);
          const maxW = 38;
          const maxH = 16;
          let drawW = maxW;
          let drawH = drawW / sigDim.ratio;
          if (drawH > maxH) {
            drawH = maxH;
            drawW = drawH * sigDim.ratio;
          }
          pdf.addImage(sjSignatureUrl, "PNG", marginSize + colW + 2, finalY + 3, drawW, drawH);
          sigH = Math.max(18, drawH + 4);
        } catch (_) {
          sigH = 18;
        }
      }

      finalY += sigH;
      pdf.setDrawColor(30, 41, 59);
      pdf.setLineWidth(0.2);
      pdf.line(marginSize, finalY, marginSize + 48, finalY);
      pdf.line(marginSize + colW, finalY, marginSize + colW + 48, finalY);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      pdf.text(sjReceivedBy || "(.........................)", marginSize, finalY + 4);
      pdf.text(sjSenderName || "(.........................)", marginSize + colW, finalY + 4);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(71, 85, 105);
      pdf.text("(Tanda Tangan & Cap Penerima)", marginSize, finalY + 8);
      pdf.text(sjSenderTitle || "Logistik & Ekspedisi", marginSize + colW, finalY + 8);
    }

    const validFileName = overrideMode
      ? (overrideMode === "delivery_order"
          ? formatDeliveryOrderPdfFileName(doNum, invNum, invRecipient)
          : formatInvoicePdfFileName(
              invNum,
              includeDownPayment,
              paymentStages[0]?.percent ?? downPaymentPercent,
              paymentStages[0]?.label || downPaymentLabel,
              invRecipient
            ))
      : downloadFileName?.trim()
        ? (downloadFileName.endsWith(".pdf") ? downloadFileName : `${downloadFileName}.pdf`)
        : `Dokumen_${renderType.toUpperCase()}.pdf`;
    pdf.save(validFileName);
  };

  // Preview font sizing
  const previewTextClass = fontScale === "small" ? "text-[7px]" : fontScale === "large" ? "text-[9px]" : "text-[8px]";
  const previewPadClass = tableDensity === "compact" ? "px-1.5 py-0.5" : tableDensity === "spacious" ? "px-2.5 py-2" : "px-2 py-1";

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden text-slate-100 shadow-3xl"
        id="document-designer-pre"
      >
        {/* Modal Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                Designer & Live Preview Center
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                  {effectiveType === "quotation"
                    ? "Penawaran (SPH)"
                    : effectiveType === "invoice"
                      ? "Invoice"
                      : effectiveType === "delivery_order"
                        ? "Delivery Order (DO)"
                        : effectiveType === "po"
                          ? "Purchase Order"
                          : effectiveType === "surat_jalan"
                            ? "Surat Jalan"
                            : "BOQ"}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-bold">
                Atur ukuran kolom, edit kop & informasi penerima langsung, kelola item/biaya & unduh dokumen resmi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isInvoiceFamily && (
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700/80 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleSwitchInvoiceFamilyMode("invoice")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    effectiveType === "invoice"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Receipt size={13} />
                  <span>Format Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchInvoiceFamilyMode("delivery_order")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    effectiveType === "delivery_order"
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Truck size={13} />
                  <span>Format Delivery Order</span>
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Outer Split Pane Builder */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-slate-900/40">
          {/* LEFT COMMAND PANEL: 3 TABS */}
          <div className="w-full md:w-5/12 border-r border-slate-800 flex flex-col min-h-0 text-left">
            {/* Control Panel Tab Switcher */}
            <div className="px-4 pt-4 pb-2 border-b border-slate-800/80 bg-slate-950/70 shrink-0">
              <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveControlTab("layout")}
                  className={`py-2 px-2 rounded-lg text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeControlTab === "layout" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sliders size={12} />
                  <span>Tata Letak & Kolom</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveControlTab("content")}
                  className={`py-2 px-2 rounded-lg text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeControlTab === "content" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 size={12} />
                  <span>Edit Kop & Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveControlTab("items")}
                  className={`py-2 px-2 rounded-lg text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeControlTab === "items" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ListChecks size={12} />
                  <span>Item & Biaya</span>
                </button>
              </div>
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* TAB 1: TATA LETAK & KOLOM */}
              {activeControlTab === "layout" && (
                <div className="space-y-4 select-none">
                  {/* Paper & Margin */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Scale size={12} className="text-indigo-400" /> Ukuran Kertas & Margin
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "a4", label: "A4", size: "210x297 mm" },
                        { id: "f4", label: "F4 (Legal)", size: "215x330 mm" },
                        { id: "letter", label: "Letter", size: "216x279 mm" }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPaperSize(p.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            paperSize === p.id
                              ? "border-indigo-500 bg-indigo-500/10 text-white"
                              : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300"
                          }`}
                        >
                          <p className="text-xs font-black">{p.label}</p>
                          <p className="text-[8px] text-slate-500">{p.size}</p>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        { id: "compact", label: "Sempit", val: "10mm" },
                        { id: "standard", label: "Standar", val: "15mm" },
                        { id: "wide", label: "Lebar", val: "20mm" }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMarginStyle(m.id as any)}
                          className={`py-1.5 px-2 rounded-lg border text-center text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                            marginStyle === m.id
                              ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                              : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300"
                          }`}
                        >
                          {m.label} ({m.val})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Adjustable Table Column Widths */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Sliders size={12} className="text-indigo-400" /> Lebar Kolom Tabel (mm)
                      </h4>
                      <button
                        type="button"
                        onClick={() => setColWidths({ ...DEFAULT_COL_WIDTHS })}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-[8.5px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={10} /> Reset Lebar
                      </button>
                    </div>

                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between text-[10px]">
                      <span className="font-bold text-indigo-300">Kolom Uraian / Deskripsi (Otomatis):</span>
                      <span className="font-mono font-black text-white">{computedDescColW.toFixed(0)} mm</span>
                    </div>

                    <div className="space-y-2.5">
                      {(effectiveType === "surat_jalan" || effectiveType === "delivery_order"
                        ? [
                            { key: "no" as const, label: "Kolom NO", min: 8, max: 18 },
                            { key: "qty" as const, label: "Kolom QTY / JUMLAH", min: 10, max: 28 },
                            { key: "unit" as const, label: "Kolom SATUAN", min: 12, max: 30 },
                            { key: "condition" as const, label: "Kolom KETERANGAN / KONDISI", min: 24, max: 55 },
                          ]
                        : [
                            { key: "no" as const, label: "Kolom NO", min: 8, max: 18 },
                            { key: "qty" as const, label: "Kolom VOL / QTY", min: 10, max: 25 },
                            { key: "unit" as const, label: "Kolom SATUAN", min: 12, max: 30 },
                            { key: "price" as const, label: "Kolom HARGA SATUAN", min: 20, max: 42 },
                            { key: "total" as const, label: "Kolom TOTAL BIAYA", min: 20, max: 45 },
                          ]
                      ).map((col) => (
                        <div key={col.key} className="space-y-1">
                          <div className="flex justify-between text-[9.5px] font-bold">
                            <span className="text-slate-300">{col.label}</span>
                            <span className="font-mono text-indigo-300">{colWidths[col.key]} mm</span>
                          </div>
                          <input
                            type="range"
                            min={col.min}
                            max={col.max}
                            value={colWidths[col.key]}
                            onChange={(e) => setColWidths((prev) => ({ ...prev, [col.key]: Number(e.target.value) }))}
                            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Theme Color & Typography */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Palette size={12} className="text-indigo-400" /> Warna Tema & Ukuran Teks Tabel
                    </h4>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-300">Warna Header Tabel:</span>
                      <div className="flex items-center gap-1.5">
                        {[
                          { hex: "#1e3a8a", name: "Navy" },
                          { hex: "#0f172a", name: "Hitam" },
                          { hex: "#1d4ed8", name: "Biru" },
                          { hex: "#065f46", name: "Hijau" }
                        ].map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setThemeColor(c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                              themeColor === c.hex ? "border-white scale-110 shadow-md" : "border-slate-700 opacity-75 hover:opacity-100"
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-300 block">Ukuran Font Isi Tabel:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "small", label: "Kecil" },
                          { id: "standard", label: "Standar" },
                          { id: "large", label: "Besar" }
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setFontScale(f.id as any)}
                            className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                              fontScale === f.id ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-300 block">Skala & Kerapatan Tabel:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "compact", label: "Kompak (Fit 1 Hlm)", desc: "Rapat" },
                          { id: "standard", label: "Standar", desc: "Seimbang" },
                          { id: "spacious", label: "Lapang", desc: "Longgar" }
                        ].map((den) => (
                          <button
                            key={den.id}
                            type="button"
                            onClick={() => setTableDensity(den.id as any)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              tableDensity === den.id
                                ? "border-indigo-500 bg-indigo-500/10 text-white"
                                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <p className="text-[9.5px] font-black">{den.label}</p>
                            <p className="text-[8px] text-slate-500">{den.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Logo, Signature & Element Toggles */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={12} className="text-indigo-400" /> Logo, TTD & Elemen Tampilan
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCompanyLogo}
                          onChange={(e) => setShowCompanyLogo(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-700 bg-slate-800"
                        />
                        <span>Tampilkan Logo Perusahaan</span>
                      </label>
                      {showCompanyLogo && (
                        <div className="grid grid-cols-5 gap-1 pt-1">
                          {[
                            { id: "tiny", label: "S.Kecil" },
                            { id: "compact", label: "Kompak" },
                            { id: "standard", label: "Standar" },
                            { id: "large", label: "Besar" },
                            { id: "huge", label: "Ekstra" }
                          ].map((sz) => (
                            <button
                              key={sz.id}
                              type="button"
                              onClick={() => setLogoSize(sz.id as any)}
                              className={`py-1 text-[8px] font-black uppercase rounded transition-all cursor-pointer ${
                                logoSize === sz.id ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {sz.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                      <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showDigitalStamp}
                          onChange={(e) => setShowDigitalStamp(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-700 bg-slate-800"
                        />
                        <span>Tampilkan Tanda Tangan</span>
                      </label>
                      {showDigitalStamp && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-400 font-bold">Posisi:</span>
                            <div className="flex gap-1">
                              {[
                                { id: "left", label: "Rata Kiri" },
                                { id: "center", label: "Rata Tengah" }
                              ].map((al) => (
                                <button
                                  key={al.id}
                                  type="button"
                                  onClick={() => setSigAlign(al.id as any)}
                                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase cursor-pointer ${
                                    sigAlign === al.id ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400"
                                  }`}
                                >
                                  {al.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {[
                              { id: "tiny", label: "S.Kecil" },
                              { id: "compact", label: "Kompak" },
                              { id: "standard", label: "Standar" },
                              { id: "large", label: "Besar" },
                              { id: "huge", label: "Ekstra" }
                            ].map((sz) => (
                              <button
                                key={sz.id}
                                type="button"
                                onClick={() => setSigSize(sz.id as any)}
                                className={`py-1 text-[8px] font-black uppercase rounded transition-all cursor-pointer ${
                                  sigSize === sz.id ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                {sz.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                      {effectiveType !== "delivery_order" && effectiveType !== "surat_jalan" && (
                        <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showTerbilang}
                            onChange={(e) => setShowTerbilang(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-700 bg-slate-800"
                          />
                          <span>Tampilkan Terbilang</span>
                        </label>
                      )}
                      <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showTncNotes}
                          onChange={(e) => setShowTncNotes(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-700 bg-slate-800"
                        />
                        <span>Tampilkan Catatan</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EDIT KOP, INFO & PENANDATANGAN */}
              {activeControlTab === "content" && (
                <div className="space-y-4">
                  {/* Kop Perusahaan */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                        Kop Surat Perusahaan
                      </h4>
                      <div>
                        <input
                          type="file"
                          id="preview-modal-logo-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async (ev) => {
                              if (ev.target?.result) {
                                let res = ev.target.result as string;
                                try { res = await compressImage(res, 600, 600, 0.85); } catch (_) {}
                                setCompLogoUrl(res);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById("preview-modal-logo-upload")?.click()}
                          className="px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Upload size={10} /> {compLogoUrl ? "Ganti Logo" : "Upload Logo"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Nama Perusahaan</label>
                      <input
                        type="text"
                        value={compName}
                        onChange={(e) => setCompName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Alamat Baris 1</label>
                      <input
                        type="text"
                        value={compAddress1}
                        onChange={(e) => setCompAddress1(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Alamat Baris 2</label>
                      <input
                        type="text"
                        value={compAddress2}
                        onChange={(e) => setCompAddress2(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Kota & Kode Pos</label>
                        <input
                          type="text"
                          value={compCityZip}
                          onChange={(e) => setCompCityZip(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Telepon / WA</label>
                        <input
                          type="text"
                          value={compPhone}
                          onChange={(e) => setCompPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Email Perusahaan</label>
                      <input
                        type="email"
                        value={compEmail}
                        onChange={(e) => setCompEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-indigo-300 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Quotation Info Editor */}
                  {effectiveType === "quotation" && (
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                      <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                        Informasi Kepada & Penawaran
                      </h4>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Kepada Yth</label>
                        <input
                          type="text"
                          value={qRecipient}
                          onChange={(e) => setQRecipient(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Up / Attn (Opsional)</label>
                          <input
                            type="text"
                            value={qAttention}
                            onChange={(e) => setQAttention(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Proyek (Opsional)</label>
                          <input
                            type="text"
                            value={qProjectName}
                            onChange={(e) => setQProjectName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">No. SPH</label>
                          <input
                            type="text"
                            value={qNum}
                            onChange={(e) => setQNum(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Tanggal</label>
                          <input
                            type="text"
                            value={qDate}
                            onChange={(e) => setQDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Pekerjaan</label>
                        <input
                          type="text"
                          value={qJobDesc}
                          onChange={(e) => setQJobDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Catatan / Notes</label>
                        <textarea
                          rows={2}
                          value={qNotes}
                          onChange={(e) => setQNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Term of Payment</label>
                        <textarea
                          rows={2}
                          value={qPaymentTerms}
                          onChange={(e) => setQPaymentTerms(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Invoice Info Editor */}
                  {effectiveType === "invoice" && (
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                      <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                        Informasi Tagihan & Rekening
                      </h4>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Ditagihkan Kepada</label>
                        <input
                          type="text"
                          value={invRecipient}
                          onChange={(e) => setInvRecipient(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Up / Attn (Opsional)</label>
                          <input
                            type="text"
                            value={invAttention}
                            onChange={(e) => setInvAttention(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Proyek (Opsional)</label>
                          <input
                            type="text"
                            value={invProjectName}
                            onChange={(e) => setInvProjectName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Alamat Klien (Opsional)</label>
                        <input
                          type="text"
                          value={invAddress}
                          onChange={(e) => setInvAddress(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">No. Invoice</label>
                          <input
                            type="text"
                            value={invNum}
                            onChange={(e) => setInvNum(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Tanggal</label>
                          <input
                            type="text"
                            value={invDate}
                            onChange={(e) => setInvDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Jatuh Tempo</label>
                          <input
                            type="text"
                            value={invDueDate}
                            onChange={(e) => setInvDueDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Bank</label>
                          <input
                            type="text"
                            value={invBankName}
                            onChange={(e) => setInvBankName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">No. Rekening</label>
                          <input
                            type="text"
                            value={invBankNumber}
                            onChange={(e) => setInvBankNumber(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Atas Nama</label>
                          <input
                            type="text"
                            value={invBankHolder}
                            onChange={(e) => setInvBankHolder(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Catatan</label>
                        <textarea
                          rows={2}
                          value={invNotes}
                          onChange={(e) => setInvNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Delivery Order (from Invoice) Info Editor */}
                  {effectiveType === "delivery_order" && (
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-teal-500/30 space-y-2.5">
                      <h4 className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Truck size={12} /> Informasi Delivery Order (DO)
                      </h4>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Kepada Yth</label>
                        <input
                          type="text"
                          value={invRecipient}
                          onChange={(e) => setInvRecipient(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Up / Attn (Opsional)</label>
                          <input
                            type="text"
                            value={invAttention}
                            onChange={(e) => setInvAttention(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Proyek (Opsional)</label>
                          <input
                            type="text"
                            value={invProjectName}
                            onChange={(e) => setInvProjectName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Alamat Kirim</label>
                        <textarea
                          rows={2}
                          value={doDeliveryAddress}
                          onChange={(e) => {
                            setDoDeliveryAddress(e.target.value);
                            setInvAddress(e.target.value);
                          }}
                          placeholder="Masukkan alamat tujuan pengiriman barang..."
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-teal-500 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">No. DO</label>
                          <input
                            type="text"
                            value={doNum}
                            onChange={(e) => {
                              setDoNum(e.target.value);
                              setDownloadFileName(formatDeliveryOrderPdfFileName(e.target.value, invNum, invRecipient));
                            }}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Ref. Invoice</label>
                          <input
                            type="text"
                            value={invNum}
                            onChange={(e) => setInvNum(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Tanggal Kirim</label>
                          <input
                            type="text"
                            value={doDate}
                            onChange={(e) => setDoDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Pekerjaan</label>
                          <input
                            type="text"
                            value={invJobDesc}
                            onChange={(e) => setInvJobDesc(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Kendaraan / Ekspedisi (Opsional)</label>
                          <input
                            type="text"
                            value={doVehicleInfo}
                            onChange={(e) => setDoVehicleInfo(e.target.value)}
                            placeholder="Pickup / Truk / Kurir"
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Nama Penerima (Opsional)</label>
                        <input
                          type="text"
                          value={doReceivedBy}
                          onChange={(e) => setDoReceivedBy(e.target.value)}
                          placeholder="Kosongkan untuk diisi tanda tangan basah"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Catatan Delivery Order</label>
                        <textarea
                          rows={2}
                          value={doNotes}
                          onChange={(e) => setDoNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-teal-500 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* PO Info Editor */}
                  {effectiveType === "po" && (
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                      <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                        Informasi Vendor & Purchase Order
                      </h4>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Kepada (Vendor / Supplier)</label>
                        <input
                          type="text"
                          value={poVendorName}
                          onChange={(e) => setPoVendorName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Alamat Vendor (Opsional)</label>
                        <input
                          type="text"
                          value={poVendorAddress}
                          onChange={(e) => setPoVendorAddress(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Proyek (Opsional)</label>
                          <input
                            type="text"
                            value={poProjectRef}
                            onChange={(e) => setPoProjectRef(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">No. PO</label>
                          <input
                            type="text"
                            value={poNo}
                            onChange={(e) => setPoNo(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Tanggal PO</label>
                          <input
                            type="text"
                            value={poDate}
                            onChange={(e) => setPoDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Batas Kirim</label>
                          <input
                            type="text"
                            value={poDeliveryDate}
                            onChange={(e) => setPoDeliveryDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Catatan</label>
                        <textarea
                          rows={2}
                          value={poNotes}
                          onChange={(e) => setPoNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Surat Jalan Info Editor */}
                  {effectiveType === "surat_jalan" && (
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                      <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                        Informasi Pengiriman
                      </h4>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Kepada Yth</label>
                        <input
                          type="text"
                          value={sjRecipient}
                          onChange={(e) => setSjRecipient(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Alamat Kirim</label>
                        <input
                          type="text"
                          value={sjAddress}
                          onChange={(e) => setSjAddress(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">No. Surat Jalan</label>
                          <input
                            type="text"
                            value={sjNum}
                            onChange={(e) => setSjNum(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Tanggal Kirim</label>
                          <input
                            type="text"
                            value={sjDate}
                            onChange={(e) => setSjDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Kendaraan</label>
                          <input
                            type="text"
                            value={sjVehicleType}
                            onChange={(e) => setSjVehicleType(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Nomor Plat</label>
                          <input
                            type="text"
                            value={sjVehiclePlate}
                            onChange={(e) => setSjVehiclePlate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signer & Signature Upload (Name only, NO Jabatan) */}
                  {effectiveType !== "surat_jalan" ? (
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                          Nama Penandatangan & TTD
                        </h4>
                        <div>
                          <input
                            type="file"
                            id="preview-modal-sig-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                if (ev.target?.result) {
                                  let res = ev.target.result as string;
                                  try { res = await compressImage(res, 600, 600, 0.85); } catch (_) {}
                                  setQDigitalSigUrl(res);
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById("preview-modal-sig-upload")?.click()}
                            className="px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Upload size={10} /> {qDigitalSigUrl ? "Ganti TTD" : "Upload TTD"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Nama Lengkap</label>
                        <input
                          type="text"
                          value={effectiveType === "po" ? poSignerName : qPreparedBy}
                          onChange={(e) => effectiveType === "po" ? setPoSignerName(e.target.value) : setQPreparedBy(e.target.value)}
                          placeholder="JIDAN RAMADHA"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-black uppercase text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-300">Tanda Tangan Surat Jalan:</span>
                        <div className="flex bg-slate-900 p-0.5 rounded-lg text-[8px] font-black">
                          <button
                            type="button"
                            onClick={() => setSjSignatureType("upload")}
                            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                              sjSignatureType === "upload" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Gambar
                          </button>
                          <button
                            type="button"
                            onClick={() => setSjSignatureType("blank")}
                            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                              sjSignatureType === "blank" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Kosongan
                          </button>
                        </div>
                      </div>

                      {sjSignatureType === "upload" && (
                        <div className="space-y-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <input
                            type="file"
                            id="modal-sj-sig-input"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = async (ev) => {
                                  if (ev.target?.result) {
                                    let res = ev.target.result as string;
                                    try { res = await compressImage(res, 600, 600, 0.85); } catch (_) {}
                                    setSjSignatureUrl(res);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById("modal-sj-sig-input")?.click()}
                            className="w-full py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>{sjSignatureUrl ? "Ganti File TTD" : "+ Upload File TTD"}</span>
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div>
                          <label className="text-slate-400 font-bold block mb-0.5">Nama Petugas:</label>
                          <input
                            type="text"
                            value={sjSenderName}
                            onChange={(e) => setSjSenderName(e.target.value)}
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 font-bold block mb-0.5">Nama Penerima:</label>
                          <input
                            type="text"
                            value={sjReceivedBy}
                            onChange={(e) => setSjReceivedBy(e.target.value)}
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ITEM, BIAYA, DISKON & PPN */}
              {activeControlTab === "items" && (
                <div className="space-y-4">
                  {/* Quick Editable Line Items */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ListChecks size={12} /> Daftar Item ({activeEditableItems.length})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddPreviewItem}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={11} /> Tambah Baris
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {activeEditableItems.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-black text-indigo-400">#{idx + 1}</span>
                            <input
                              type="text"
                              value={item.description || item.name || ""}
                              onChange={(e) => handleUpdatePreviewItem(idx, "description", e.target.value)}
                              placeholder="Nama Barang / Pekerjaan"
                              className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-bold text-white outline-none"
                            />
                            <button
                              type="button"
                              disabled={activeEditableItems.length <= 1}
                              onClick={() => handleRemovePreviewItem(idx)}
                              className="p-1 text-rose-400 hover:text-rose-300 disabled:opacity-25 cursor-pointer"
                              title="Hapus Item"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            <div>
                              <label className="text-[8px] font-bold text-slate-400 block">QTY / VOL</label>
                              <input
                                type="number"
                                min={1}
                                value={effectiveType === "quotation" ? (item.vol ?? item.quantity ?? 1) : (item.qty ?? 1)}
                                onChange={(e) => handleUpdatePreviewItem(idx, effectiveType === "quotation" ? "vol" : "qty", Math.max(1, Number(e.target.value) || 1))}
                                className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-center font-bold text-white outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-slate-400 block">SATUAN</label>
                              <input
                                type="text"
                                value={item.unit || "Unit"}
                                onChange={(e) => handleUpdatePreviewItem(idx, "unit", e.target.value)}
                                className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-center text-white outline-none"
                              />
                            </div>
                            {effectiveType !== "surat_jalan" && effectiveType !== "delivery_order" ? (
                              <div>
                                <label className="text-[8px] font-bold text-slate-400 block">HARGA SATUAN</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={effectiveType === "quotation" ? (item.unitPrice ?? 0) : (item.price ?? 0)}
                                  onChange={(e) => handleUpdatePreviewItem(idx, effectiveType === "quotation" ? "unitPrice" : "price", Math.max(0, Number(e.target.value) || 0))}
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-right font-mono font-bold text-emerald-400 outline-none"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="text-[8px] font-bold text-slate-400 block">KONDISI / KET</label>
                                <input
                                  type="text"
                                  value={item.condition || "Baik & Lengkap"}
                                  onChange={(e) => handleUpdatePreviewItem(idx, "condition", e.target.value)}
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-center text-white outline-none"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Taxes, Discount, Shipping, Down Payment */}
                  {(effectiveType === "quotation" || effectiveType === "invoice" || effectiveType === "po") && (
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <h4 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                        Diskon, PPN & Ongkos Kirim
                      </h4>

                      {/* Diskon */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <label className="font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                            <Percent size={12} className="text-rose-400" />
                            <span>Terapkan Diskon</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {includeDiscount && (
                              <div className="flex bg-slate-900 p-0.5 rounded-lg text-[8px] font-black">
                                <button
                                  type="button"
                                  onClick={() => setDiscountType("rupiah")}
                                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                    discountType === "rupiah" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  Rp
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDiscountType("percent")}
                                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                    discountType === "percent" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  %
                                </button>
                              </div>
                            )}
                            <input
                              type="checkbox"
                              checked={includeDiscount}
                              onChange={(e) => {
                                setIncludeDiscount(e.target.checked);
                                if (!e.target.checked) setDiscountVal(0);
                              }}
                              className="w-4 h-4 rounded text-rose-600 border-slate-700 bg-slate-800 cursor-pointer"
                            />
                          </div>
                        </div>

                        {includeDiscount && (
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={discountType === "percent" ? 100 : undefined}
                              value={discountVal || ""}
                              onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                              placeholder={discountType === "percent" ? "10" : "500000"}
                              className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-rose-400 outline-none"
                            />
                            <span className="text-[10px] font-mono font-bold text-rose-400 shrink-0">
                              -Rp {(effectiveType === "quotation" ? qDiscountAmount : effectiveType === "invoice" ? invDiscountAmount : poDiscountAmount).toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* PPN */}
                      <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <label className="font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={includePPN}
                              onChange={(e) => setIncludePPN(e.target.checked)}
                              className="w-4 h-4 rounded text-indigo-600 border-slate-700 bg-slate-800 cursor-pointer"
                            />
                            <span>Terapkan PPN (%)</span>
                          </label>
                          {includePPN && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={taxRate}
                                onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value) || 0))}
                                className="w-16 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-white text-center outline-none"
                              />
                              <span className="text-xs font-bold text-slate-400">%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ongkir / Pengiriman */}
                      <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
                        <label className="text-[10px] font-bold text-slate-300 flex items-center justify-between cursor-pointer">
                          <span className="flex items-center gap-1.5">
                            <Truck size={12} className="text-indigo-400" />
                            Tampilkan Ongkir / Pengiriman
                          </span>
                          <input
                            type="checkbox"
                            checked={includeShipping}
                            onChange={(e) => setIncludeShipping(e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-700 bg-slate-800"
                          />
                        </label>
                        {includeShipping && (
                          <div className="space-y-1.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <label className="text-[8px] font-extrabold uppercase text-slate-400">
                              Label Teks:
                            </label>
                            <input
                              type="text"
                              value={shippingLabel}
                              onChange={(e) => setShippingLabel(e.target.value)}
                              placeholder="ONGKOS KIRIM / PENGIRIMAN"
                              className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none"
                            />
                            <div className="flex items-center gap-2 pt-1">
                              <label className="text-[8px] font-extrabold uppercase text-slate-400">Nominal (Rp):</label>
                              <input
                                type="number"
                                min={0}
                                value={shippingCost || ""}
                                onChange={(e) => setShippingCost(Math.max(0, parseFloat(e.target.value) || 0))}
                                placeholder="0"
                                className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-400 outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Invoice DP / Termin % */}
                      {effectiveType === "invoice" && (
                        <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <label className="font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer">
                              <Receipt size={12} className="text-amber-400" />
                              <span>Tagihan Bertahap (DP / Termin %)</span>
                            </label>
                            <input
                              type="checkbox"
                              checked={includeDownPayment}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setIncludeDownPayment(val);
                                setDownloadFileName(
                                  formatInvoicePdfFileName(invNum, val, downPaymentPercent, downPaymentLabel, invRecipient)
                                );
                              }}
                              className="w-4 h-4 rounded text-amber-500 border-slate-700 bg-slate-800 cursor-pointer"
                            />
                          </div>

                          {includeDownPayment && (
                            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30 space-y-2 text-white">
                              <div>
                                <label className="text-[8px] font-extrabold uppercase text-slate-400">Sub Judul Tagihan:</label>
                                <input
                                  type="text"
                                  value={downPaymentLabel}
                                  onChange={(e) => {
                                    setDownPaymentLabel(e.target.value);
                                    setDownloadFileName(
                                      formatInvoicePdfFileName(invNum, includeDownPayment, downPaymentPercent, e.target.value, invRecipient)
                                    );
                                  }}
                                  className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-amber-300 outline-none"
                                />
                              </div>

                              <div className="flex items-center gap-1 flex-wrap">
                                {["DOWN PAYMENT (DP)", "DP 50%", "TERMIN 1", "TERMIN 2", "PELUNASAN"].map((chip) => (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() => {
                                      setDownPaymentLabel(chip);
                                      setDownloadFileName(
                                        formatInvoicePdfFileName(invNum, includeDownPayment, downPaymentPercent, chip, invRecipient)
                                      );
                                    }}
                                    className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[8px] font-bold"
                                  >
                                    {chip}
                                  </button>
                                ))}
                              </div>

                              <div>
                                <label className="text-[8px] font-extrabold uppercase text-slate-400">Persentase Tagihan (%):</label>
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number"
                                      min={1}
                                      max={100}
                                      value={downPaymentPercent || ""}
                                      onChange={(e) => {
                                        const pct = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                        setDownPaymentPercent(pct);
                                        setDownloadFileName(
                                          formatInvoicePdfFileName(invNum, includeDownPayment, pct, downPaymentLabel, invRecipient)
                                        );
                                      }}
                                      className="w-full px-2.5 py-1 pr-6 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-400 outline-none"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                                  </div>
                                  <div className="flex gap-1">
                                    {[30, 50, 70, 100].map((p) => (
                                      <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                          setDownPaymentPercent(p);
                                          setDownloadFileName(
                                            formatInvoicePdfFileName(invNum, includeDownPayment, p, downPaymentLabel, invRecipient)
                                          );
                                        }}
                                        className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                                          downPaymentPercent === p ? "bg-amber-600 text-white" : "bg-slate-950 text-slate-400"
                                        }`}
                                      >
                                        {p}%
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT VIEW PANEL: LIVE WEB INTERACTIVE PAPER REPRESENTATION */}
          <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-8 flex flex-col items-center">
            <div className="w-full max-w-[720px] flex justify-between items-center bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl mb-4 shadow-md shrink-0">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Printer size={13} className="text-indigo-400" />
                Live Screen Preview ({paperSize.toUpperCase() === "F4" ? "FOLIO / F4" : paperSize.toUpperCase()})
              </span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-extrabold px-3 py-1 rounded-xl">
                Tampilan Layar sama persis dengan PDF
              </span>
            </div>

            {/* Simulated Paper Container */}
            <div
              style={{
                aspectRatio: paperSize === "a4" ? "1 / 1.414" : paperSize === "f4" ? "1 / 1.534" : "1 / 1.294",
                width: "100%",
                maxWidth: "700px",
                padding: marginStyle === "compact" ? "26px" : marginStyle === "wide" ? "46px" : "36px"
              }}
              className="bg-white rounded-md shadow-2xl font-sans text-slate-950 text-left border border-slate-200 select-text transition-all overflow-y-auto"
            >
              {/* Header KOP (Image 2 Format: Logo Kiri, Detail PT Rata Kanan) */}
              <div className="flex justify-between items-center pb-3 mb-3">
                <div className="shrink-0">
                  {showCompanyLogo && (
                    compLogoUrl ? (
                      <img
                        src={compLogoUrl}
                        alt="Logo"
                        className={`object-contain ${
                          logoSize === "huge" ? "max-h-20 max-w-[180px]" : logoSize === "large" ? "max-h-16 max-w-[150px]" : logoSize === "compact" ? "max-h-10 max-w-[100px]" : logoSize === "tiny" ? "max-h-8 max-w-[80px]" : "max-h-14 max-w-[130px]"
                        }`}
                      />
                    ) : (
                      <div className="w-11 h-11 bg-[#162646] text-white rounded font-black flex items-center justify-center text-sm">
                        {compName.substring(0, 2).toUpperCase()}
                      </div>
                    )
                  )}
                </div>

                <div className="text-right space-y-0.5 leading-tight">
                  <h2 className="text-[11px] font-black text-slate-950 tracking-tight uppercase">
                    {compName}
                  </h2>
                  {compAddress1.trim() && (
                    <p className="text-[8px] text-slate-700 font-medium">{compAddress1}</p>
                  )}
                  {compAddress2.trim() && (
                    <p className="text-[8px] text-slate-700 font-medium">{compAddress2}</p>
                  )}
                  {(compCityZip.trim() || compPhone.trim()) && (
                    <p className="text-[8px] text-slate-700 font-medium">
                      {[compCityZip.trim(), compPhone.trim()].filter(Boolean).join(" | ")}
                    </p>
                  )}
                  {compEmail.trim() && (
                    <p className="text-[8px] text-[#003399] font-medium">{compEmail}</p>
                  )}
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center my-3">
                <h2
                  style={{ color: themeColor, borderColor: themeColor }}
                  className="text-sm font-black tracking-wide uppercase inline-block border-b-2 pb-0.5"
                >
                  {effectiveType === "quotation"
                    ? "SURAT PENAWARAN HARGA"
                    : effectiveType === "invoice"
                      ? "INVOICE / FAKTUR PENAGIHAN"
                      : effectiveType === "delivery_order"
                        ? "DELIVERY ORDER"
                        : effectiveType === "po"
                          ? "PURCHASE ORDER (PO)"
                          : effectiveType === "surat_jalan"
                            ? "SURAT JALAN"
                            : "BOQ SPESIFIKASI"}
                </h2>
              </div>

              {/* SPH PREVIEW */}
              {effectiveType === "quotation" && (
                <div className="space-y-4">
                  {/* Metadata Box */}
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/80 text-[8px] grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Kepada Yth</span><span className="w-3 shrink-0">:</span><span className="font-extrabold text-slate-900">{qRecipient || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Up / Attn</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{qAttention || "-"}</span></div>
                      {qProjectName.trim() && (
                        <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Proyek</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{qProjectName}</span></div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">No. SPH</span><span className="w-3 shrink-0">:</span><span className="font-extrabold text-slate-900">{qNum || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Tanggal</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{qDate || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Pekerjaan</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{qJobDesc || "-"}</span></div>
                    </div>
                  </div>

                  <p className="text-[7.5px] text-slate-600">Bersama ini kami sampaikan penawaran harga dengan rincian spesifikasi sebagai berikut:</p>

                  {/* SPH Table */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <table className={`w-full table-fixed text-left border-collapse ${previewTextClass}`}>
                      <colgroup>
                        <col style={{ width: pctOfPrintable(colWidths.no) }} />
                        <col style={{ width: pctOfPrintable(computedDescColW) }} />
                        <col style={{ width: pctOfPrintable(colWidths.qty) }} />
                        <col style={{ width: pctOfPrintable(colWidths.unit) }} />
                        <col style={{ width: pctOfPrintable(colWidths.price) }} />
                        <col style={{ width: pctOfPrintable(colWidths.total) }} />
                      </colgroup>
                      <thead style={{ backgroundColor: themeColor }} className="text-white">
                        <tr className="font-bold text-white">
                          <th className={`${previewPadClass} text-center`}>NO</th>
                          <th className={`${previewPadClass}`}>URAIAN PEKERJAAN</th>
                          <th className={`${previewPadClass} text-center`}>VOL</th>
                          <th className={`${previewPadClass} text-center`}>SATUAN</th>
                          <th className={`${previewPadClass} text-right`}>HARGA SATUAN</th>
                          <th className={`${previewPadClass} text-right`}>TOTAL BIAYA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {qItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 align-top">
                            <td className={`${previewPadClass} text-center font-bold`}>{idx + 1}</td>
                            <td className={`${previewPadClass}`}>
                              <div className="font-black text-slate-900 uppercase">{item.description}</div>
                              {item.specifications && (() => {
                                let specs: { key: string; value: string }[] = [];
                                if (Array.isArray(item.specifications)) specs = item.specifications;
                                else if (typeof item.specifications === "string") {
                                  specs = item.specifications.split("\n").filter(Boolean).map((l: string) => {
                                    const parts = l.split(":");
                                    return { key: parts[0]?.trim() || "", value: parts.slice(1).join(":")?.trim() || "" };
                                  });
                                }
                                const validSpecs = specs.filter((s) => s && (s.key || s.value));
                                if (validSpecs.length === 0) return null;
                                return (
                                  <div className="mt-1 space-y-0.5 text-[7px] text-slate-600 font-normal">
                                    {validSpecs.map((sp: any, sIdx: number) => {
                                      const rawKey = (sp.key || "").trim();
                                      const hasKey = rawKey && rawKey !== "-";
                                      return (
                                        <div key={sIdx} className="grid grid-cols-[70px_8px_1fr]">
                                          <span className="text-slate-600">{hasKey ? rawKey.toUpperCase() : ""}</span>
                                          <span className="text-slate-400">{hasKey ? ":" : ""}</span>
                                          <span className="text-slate-900">{sp.value}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className={`${previewPadClass} text-center font-bold`}>{item.vol || item.quantity || 1}</td>
                            <td className={`${previewPadClass} text-center font-bold`}>{item.unit || "Unit"}</td>
                            <td className={`${previewPadClass} text-right font-mono`}>Rp {Number(item.unitPrice || 0).toLocaleString("id-ID")}</td>
                            <td className={`${previewPadClass} text-right font-mono font-black`}>Rp {((Number(item.vol || item.quantity) || 1) * (Number(item.unitPrice) || 0)).toLocaleString("id-ID")}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 border-t border-slate-300 font-bold text-slate-800">
                          <td colSpan={4} className={`${previewPadClass} text-right`}>SUBTOTAL</td>
                          <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {qSubtotal.toLocaleString("id-ID")}</td>
                        </tr>
                        {qDiscountAmount > 0 && (
                          <tr className="bg-rose-50/70 font-bold text-rose-700">
                            <td colSpan={4} className={`${previewPadClass} text-right`}>DISKON {discountType === "percent" ? `(${discountVal}%)` : ""}</td>
                            <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>-Rp {qDiscountAmount.toLocaleString("id-ID")}</td>
                          </tr>
                        )}
                        {includeShipping && (
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={4} className={`${previewPadClass} text-right`}>{shippingLabel || "ONGKOS KIRIM / PENGIRIMAN"}</td>
                            <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {Number(shippingCost || 0).toLocaleString("id-ID")}</td>
                          </tr>
                        )}
                        {includePPN && (
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={4} className={`${previewPadClass} text-right`}>PPN {taxRate}%</td>
                            <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {qTax.toLocaleString("id-ID")}</td>
                          </tr>
                        )}
                        <tr style={{ backgroundColor: themeColor }} className="text-white font-black">
                          <td colSpan={4} className={`${previewPadClass} text-right`}>GRAND TOTAL</td>
                          <td colSpan={2} className={`${previewPadClass} text-right font-mono`}>Rp {qGrandTotal.toLocaleString("id-ID")}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {showTerbilang && (
                    <p className="text-[7.5px] italic text-slate-600">*Terbilang: {numberToWordsID(qGrandTotal)} rupiah</p>
                  )}

                  {showTncNotes && (qNotes || qPaymentTerms) && (
                    <div className="border border-slate-200 p-2.5 rounded bg-slate-50/60 text-[7.5px] space-y-1.5">
                      {qNotes && <div><span className="font-bold text-slate-800">Catatan:</span> <span className="text-slate-600 whitespace-pre-wrap">{qNotes}</span></div>}
                      {qPaymentTerms && <div><span className="font-bold text-slate-800">Term of Payment:</span> <span className="text-slate-600 whitespace-pre-wrap">{qPaymentTerms}</span></div>}
                    </div>
                  )}

                  {/* Signature (Name ONLY - NO Jabatan) */}
                  <div className={`pt-2 ${sigAlign === "center" ? "text-center" : "text-left"}`}>
                    <p className="text-[8px] text-slate-600">Hormat kami,</p>
                    <p className="text-[8.5px] font-bold text-slate-900">{compName}</p>
                    {qDigitalSigUrl && showDigitalStamp ? (
                      <div className={`py-1 flex ${sigAlign === "center" ? "justify-center" : "justify-start"}`}>
                        <img
                          src={qDigitalSigUrl}
                          alt="TTD"
                          className={`object-contain ${
                            sigSize === "huge" ? "max-h-20" : sigSize === "large" ? "max-h-16" : sigSize === "compact" ? "max-h-9" : sigSize === "tiny" ? "max-h-7" : "max-h-12"
                          }`}
                        />
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}
                    <p className="text-[8px] font-black text-slate-900 inline-block border-b border-slate-800 pb-0.5 tracking-wider">
                      {(qPreparedBy || "JIDAN RAMADHA").toUpperCase()}
                    </p>
                  </div>
                </div>
              )}

              {/* INVOICE PREVIEW */}
              {effectiveType === "invoice" && (
                <div className="space-y-4">
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/80 text-[8px] grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Ditagihkan Kepada</span><span className="w-3 shrink-0">:</span><span className="font-extrabold text-slate-900">{invRecipient || "-"}</span></div>
                      <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Up / Attn</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{invAttention || "-"}</span></div>
                      {invProjectName.trim() && (
                        <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Proyek</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{invProjectName}</span></div>
                      )}
                      {invAddress.trim() && (
                        <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Alamat Klien</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{invAddress}</span></div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">No. Invoice</span><span className="w-3 shrink-0">:</span><span className="font-extrabold text-slate-900">{invNum || "-"}</span></div>
                      {invPoRef && invPoRef !== "-" && (
                        <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Ref. Dokumen</span><span className="w-3 shrink-0">:</span><span className="font-bold text-indigo-700">{invPoRef}</span></div>
                      )}
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Tanggal</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{invDate || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Jatuh Tempo</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{invDueDate || "-"}</span></div>
                    </div>
                  </div>

                  <table className={`w-full table-fixed text-left border border-slate-300 ${previewTextClass}`}>
                    <colgroup>
                      <col style={{ width: pctOfPrintable(colWidths.no) }} />
                      <col style={{ width: pctOfPrintable(computedDescColW) }} />
                      <col style={{ width: pctOfPrintable(colWidths.qty) }} />
                      <col style={{ width: pctOfPrintable(colWidths.unit) }} />
                      <col style={{ width: pctOfPrintable(colWidths.price) }} />
                      <col style={{ width: pctOfPrintable(colWidths.total) }} />
                    </colgroup>
                    <thead style={{ backgroundColor: themeColor }} className="text-white">
                      <tr>
                        <th className={`${previewPadClass} text-center`}>NO</th>
                        <th className={`${previewPadClass}`}>DESKRIPSI TAGIHAN</th>
                        <th className={`${previewPadClass} text-center`}>QTY</th>
                        <th className={`${previewPadClass} text-center`}>SATUAN</th>
                        <th className={`${previewPadClass} text-right`}>HARGA SATUAN</th>
                        <th className={`${previewPadClass} text-right`}>TOTAL BIAYA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {invItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 align-top">
                          <td className={`${previewPadClass} text-center font-bold`}>{idx + 1}</td>
                          <td className={`${previewPadClass} font-bold text-slate-900`}>
                            {item.description || item.name}
                            {(() => {
                              let specs: any[] = [];
                              if (item.specifications) {
                                if (Array.isArray(item.specifications)) specs = item.specifications;
                                else if (typeof item.specifications === "string") {
                                  specs = item.specifications.split("\n").filter(Boolean).map((l: string) => {
                                    const parts = l.split(":");
                                    return { key: parts[0]?.trim() || "", value: parts.slice(1).join(":")?.trim() || "" };
                                  });
                                }
                              }
                              const validSpecs = specs.filter((s) => s && (s.key || s.value));
                              if (validSpecs.length === 0) return null;
                              return (
                                <div className="mt-1 space-y-0.5 text-[7px] text-slate-600 font-normal">
                                  {validSpecs.map((sp: any, sIdx: number) => {
                                    const rawKey = (sp.key || "").trim();
                                    const hasKey = rawKey && rawKey !== "-";
                                    return (
                                      <div key={sIdx} className="grid grid-cols-[70px_8px_1fr]">
                                        <span className="text-slate-600">{hasKey ? rawKey.toUpperCase() : ""}</span>
                                        <span className="text-slate-400">{hasKey ? ":" : ""}</span>
                                        <span className="text-slate-900">{sp.value}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </td>
                          <td className={`${previewPadClass} text-center font-bold`}>{item.qty || 1}</td>
                          <td className={`${previewPadClass} text-center font-bold`}>{item.unit || "Unit"}</td>
                          <td className={`${previewPadClass} text-right font-mono`}>Rp {Number(item.price || 0).toLocaleString("id-ID")}</td>
                          <td className={`${previewPadClass} text-right font-mono font-black`}>Rp {((Number(item.qty) || 1) * (Number(item.price) || 0)).toLocaleString("id-ID")}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan={4} className={`${previewPadClass} text-right`}>SUBTOTAL</td>
                        <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {invSubtotal.toLocaleString("id-ID")}</td>
                      </tr>
                      {includeDiscount && invDiscountAmount > 0 && (
                        <tr className="bg-rose-50/70 text-rose-700 font-bold">
                          <td colSpan={4} className={`${previewPadClass} text-right`}>
                            DISKON {discountType === "percent" ? `(${discountVal}%)` : ""}
                          </td>
                          <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>
                            -Rp {invDiscountAmount.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      )}
                      {includeShipping && (
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={4} className={`${previewPadClass} text-right`}>{shippingLabel}</td>
                          <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {Number(shippingCost || 0).toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                      {includePPN && (
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={4} className={`${previewPadClass} text-right`}>PPN {taxRate}%</td>
                          <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {invTax.toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                      {includeDownPayment ? (
                        <>
                          <tr className="bg-slate-100 font-bold text-slate-700 border-t border-slate-300">
                            <td colSpan={4} className={`${previewPadClass} text-right`}>TOTAL NILAI PROYEK</td>
                            <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {invTotalFullProject.toLocaleString("id-ID")}</td>
                          </tr>
                          {paymentStages.map((stage, sIdx) => {
                            const stageAmt = Math.round((invTotalFullProject * (Number(stage.percent) || 0)) / 100);
                            return (
                              <tr key={sIdx} className="bg-amber-50 text-amber-900 font-black">
                                <td colSpan={4} className={`${previewPadClass} text-right`}>{stage.label || (sIdx === 0 ? "DOWN PAYMENT" : `TERMIN ${sIdx + 1}`)} ({stage.percent}%)</td>
                                <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black text-amber-700`}>Rp {stageAmt.toLocaleString("id-ID")}</td>
                              </tr>
                            );
                          })}
                          {invRemainingAmount > 0 && (
                            <tr className="bg-slate-50 text-slate-500 font-medium">
                              <td colSpan={4} className="px-2 py-0.5 text-right">Sisa Pembayaran ({Math.max(0, 100 - invTotalStagesPercent)}%)</td>
                              <td colSpan={2} className="px-2 py-0.5 text-right font-mono">Rp {invRemainingAmount.toLocaleString("id-ID")}</td>
                            </tr>
                          )}
                          <tr style={{ backgroundColor: themeColor }} className="text-white font-black">
                            <td colSpan={4} className="px-2 py-1.5 text-right">TOTAL TAGIHAN INI ({invTotalStagesPercent}%)</td>
                            <td colSpan={2} className="px-2 py-1.5 text-right font-mono font-black">Rp {invGrandTotal.toLocaleString("id-ID")}</td>
                          </tr>
                        </>
                      ) : (
                        <tr style={{ backgroundColor: themeColor }} className="text-white font-black">
                          <td colSpan={4} className={`${previewPadClass} text-right`}>TOTAL TAGIHAN</td>
                          <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {invGrandTotal.toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                    </tfoot>
                  </table>

                  {showTerbilang && (
                    <p className="text-[7.5px] italic text-slate-600">*Terbilang: {numberToWordsID(invGrandTotal)} rupiah</p>
                  )}

                  <div className="border border-slate-200 p-2.5 rounded bg-slate-50 text-[7.5px] space-y-0.5">
                    <p className="font-bold text-indigo-900">Pembayaran Transfer: Bank {invBankName} - Rek. {invBankNumber} a/n {invBankHolder}</p>
                    {showTncNotes && <p className="text-slate-500 whitespace-pre-wrap">{invNotes}</p>}
                  </div>

                  {/* Invoice Signature (Name ONLY - NO Jabatan) */}
                  <div className={`pt-2 ${sigAlign === "center" ? "text-center" : "text-left"}`}>
                    <p className="text-[8px] text-slate-600">Hormat kami,</p>
                    <p className="text-[8.5px] font-bold text-slate-900">{compName}</p>
                    {qDigitalSigUrl && showDigitalStamp ? (
                      <div className={`py-1 flex ${sigAlign === "center" ? "justify-center" : "justify-start"}`}>
                        <img
                          src={qDigitalSigUrl}
                          alt="TTD"
                          className={`object-contain ${
                            sigSize === "huge" ? "max-h-20" : sigSize === "large" ? "max-h-16" : sigSize === "compact" ? "max-h-9" : sigSize === "tiny" ? "max-h-7" : "max-h-12"
                          }`}
                        />
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}
                    <p className="text-[8px] font-black text-slate-900 inline-block border-b border-slate-800 pb-0.5 tracking-wider">
                      {(qPreparedBy || "JIDAN RAMADHA").toUpperCase()}
                    </p>
                  </div>
                </div>
              )}

              {/* DELIVERY ORDER (FROM INVOICE) PREVIEW */}
              {effectiveType === "delivery_order" && (
                <div className="space-y-4">
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/80 text-[8px] grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Kepada Yth</span><span className="w-3 shrink-0">:</span><span className="font-extrabold text-slate-900">{invRecipient || "-"}</span></div>
                      <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Up / Attn</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{invAttention || "-"}</span></div>
                      {invProjectName.trim() && (
                        <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Proyek</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{invProjectName}</span></div>
                      )}
                      <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Alamat Kirim</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800 whitespace-pre-wrap">{doDeliveryAddress || invAddress || "-"}</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">No. DO</span><span className="w-3 shrink-0">:</span><span className="font-extrabold text-slate-900">{doNum || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Ref. Invoice</span><span className="w-3 shrink-0">:</span><span className="font-extrabold text-indigo-700">{invNum || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Tanggal Kirim</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{doDate || invDate || "-"}</span></div>
                      {invJobDesc.trim() && (
                        <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Pekerjaan</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{invJobDesc}</span></div>
                      )}
                      {doVehicleInfo.trim() && (
                        <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Kendaraan</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{doVehicleInfo}</span></div>
                      )}
                    </div>
                  </div>

                  <p className="text-[7.5px] text-slate-600">
                    Bersama ini kami kirimkan barang / pekerjaan sesuai rincian di bawah ini untuk dapat diterima dengan baik:
                  </p>

                  <div className="border border-slate-300 rounded overflow-hidden">
                    <table className={`w-full table-fixed text-left border-collapse ${previewTextClass}`}>
                      <colgroup>
                        <col style={{ width: pctOfPrintable(colWidths.no) }} />
                        <col style={{ width: pctOfPrintable(computedDescColW) }} />
                        <col style={{ width: pctOfPrintable(colWidths.qty) }} />
                        <col style={{ width: pctOfPrintable(colWidths.unit) }} />
                        <col style={{ width: pctOfPrintable(colWidths.condition) }} />
                      </colgroup>
                      <thead style={{ backgroundColor: themeColor }} className="text-white">
                        <tr>
                          <th className={`${previewPadClass} text-center`}>NO</th>
                          <th className={`${previewPadClass}`}>URAIAN BARANG / PEKERJAAN</th>
                          <th className={`${previewPadClass} text-center`}>QTY</th>
                          <th className={`${previewPadClass} text-center`}>SATUAN</th>
                          <th className={`${previewPadClass} text-center`}>KETERANGAN / KONDISI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {invItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 align-top">
                            <td className={`${previewPadClass} text-center font-bold`}>{idx + 1}</td>
                            <td className={`${previewPadClass} font-bold text-slate-900`}>
                              {item.description || item.name}
                              {(() => {
                                let specs: any[] = [];
                                if (item.specifications) {
                                  if (Array.isArray(item.specifications)) specs = item.specifications;
                                  else if (typeof item.specifications === "string") {
                                    specs = item.specifications.split("\n").filter(Boolean).map((l: string) => {
                                      const parts = l.split(":");
                                      return { key: parts[0]?.trim() || "", value: parts.slice(1).join(":")?.trim() || "" };
                                    });
                                  }
                                }
                                const validSpecs = specs.filter((s) => s && (s.key || s.value));
                                if (validSpecs.length === 0) return null;
                                return (
                                  <div className="mt-1 space-y-0.5 text-[7px] text-slate-600 font-normal">
                                    {validSpecs.map((sp: any, sIdx: number) => {
                                      const rawKey = (sp.key || "").trim();
                                      const hasKey = rawKey && rawKey !== "-";
                                      return (
                                        <div key={sIdx} className="grid grid-cols-[70px_8px_1fr]">
                                          <span className="text-slate-600">{hasKey ? rawKey.toUpperCase() : ""}</span>
                                          <span className="text-slate-400">{hasKey ? ":" : ""}</span>
                                          <span className="text-slate-900">{sp.value}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className={`${previewPadClass} text-center font-bold`}>{item.qty || 1}</td>
                            <td className={`${previewPadClass} text-center font-bold`}>{item.unit || "Unit"}</td>
                            <td className={`${previewPadClass} text-center text-slate-600 font-medium`}>{item.condition || "Baik & Lengkap"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {showTncNotes && doNotes.trim() && (
                    <div className="border border-slate-200 p-2.5 rounded bg-slate-50/60 text-[7.5px]">
                      <span className="font-bold text-slate-800 block mb-0.5">Catatan Pengiriman:</span>
                      <p className="text-slate-600 whitespace-pre-wrap">{doNotes}</p>
                    </div>
                  )}

                  {/* Delivery Order 2-Column Signatures (Name ONLY - NO Jabatan) */}
                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div>
                      <p className="text-[8px] text-slate-600">Diterima Oleh,</p>
                      <p className="text-[8.5px] font-bold text-slate-900">{invRecipient || "Pihak Penerima"}</p>
                      <div className="h-12 flex items-center">
                        <span className="text-[7px] text-slate-300 italic">(Tanda Tangan & Stempel Penerima)</span>
                      </div>
                      <p className="text-[8px] font-black text-slate-900 border-b border-slate-800 inline-block pb-0.5 tracking-wider">
                        {doReceivedBy.trim() ? doReceivedBy.trim().toUpperCase() : "( Nama Jelas & Stempel )"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-600">Hormat kami,</p>
                      <p className="text-[8.5px] font-bold text-slate-900">{compName}</p>
                      {qDigitalSigUrl && showDigitalStamp ? (
                        <div className="py-1 flex justify-start">
                          <img
                            src={qDigitalSigUrl}
                            alt="TTD"
                            className={`object-contain ${
                              sigSize === "huge" ? "max-h-20" : sigSize === "large" ? "max-h-16" : sigSize === "compact" ? "max-h-9" : sigSize === "tiny" ? "max-h-7" : "max-h-12"
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="h-12" />
                      )}
                      <p className="text-[8px] font-black text-slate-900 border-b border-slate-800 inline-block pb-0.5 tracking-wider">
                        {(qPreparedBy || "JIDAN RAMADHA").toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PURCHASE ORDER PREVIEW */}
              {effectiveType === "po" && (
                <div className="space-y-4">
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/80 text-[8px] grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Kepada (Vendor)</span><span className="w-3 shrink-0">:</span><span className="font-extrabold text-slate-900">{poVendorName || "-"}</span></div>
                      <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Alamat</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{poVendorAddress || "-"}</span></div>
                      {poProjectRef.trim() && (
                        <div className="flex"><span className="w-24 text-slate-500 font-bold shrink-0">Proyek</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{poProjectRef}</span></div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">No. PO</span><span className="w-3 shrink-0">:</span><span className="font-extrabold text-slate-900">{poNo || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Tanggal PO</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{poDate || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold shrink-0">Batas Kirim</span><span className="w-3 shrink-0">:</span><span className="font-bold text-slate-800">{poDeliveryDate || "-"}</span></div>
                    </div>
                  </div>

                  <table className={`w-full table-fixed text-left border border-slate-300 ${previewTextClass}`}>
                    <colgroup>
                      <col style={{ width: pctOfPrintable(colWidths.no) }} />
                      <col style={{ width: pctOfPrintable(computedDescColW) }} />
                      <col style={{ width: pctOfPrintable(colWidths.qty) }} />
                      <col style={{ width: pctOfPrintable(colWidths.unit) }} />
                      <col style={{ width: pctOfPrintable(colWidths.price) }} />
                      <col style={{ width: pctOfPrintable(colWidths.total) }} />
                    </colgroup>
                    <thead style={{ backgroundColor: themeColor }} className="text-white">
                      <tr>
                        <th className={`${previewPadClass} text-center`}>NO</th>
                        <th className={`${previewPadClass}`}>DESKRIPSI BARANG</th>
                        <th className={`${previewPadClass} text-center`}>QTY</th>
                        <th className={`${previewPadClass} text-center`}>SATUAN</th>
                        <th className={`${previewPadClass} text-right`}>HARGA SATUAN</th>
                        <th className={`${previewPadClass} text-right`}>TOTAL HARGA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {poItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 align-top">
                          <td className={`${previewPadClass} text-center font-bold`}>{idx + 1}</td>
                          <td className={`${previewPadClass} font-bold text-slate-900`}>{item.description || item.name}</td>
                          <td className={`${previewPadClass} text-center font-bold`}>{item.qty || 1}</td>
                          <td className={`${previewPadClass} text-center font-bold`}>{item.unit || "Unit"}</td>
                          <td className={`${previewPadClass} text-right font-mono`}>Rp {Number(item.price || 0).toLocaleString("id-ID")}</td>
                          <td className={`${previewPadClass} text-right font-mono font-black`}>Rp {((Number(item.qty) || 1) * (Number(item.price) || 0)).toLocaleString("id-ID")}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan={4} className={`${previewPadClass} text-right`}>SUBTOTAL</td>
                        <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {poSubtotal.toLocaleString("id-ID")}</td>
                      </tr>
                      {poDiscountAmount > 0 && (
                        <tr className="bg-rose-50/70 font-bold text-rose-700">
                          <td colSpan={4} className={`${previewPadClass} text-right`}>DISKON {discountType === "percent" ? `(${discountVal}%)` : ""}</td>
                          <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>-Rp {poDiscountAmount.toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                      {includeShipping && (
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={4} className={`${previewPadClass} text-right`}>{shippingLabel}</td>
                          <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {Number(shippingCost || 0).toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                      {includePPN && (
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={4} className={`${previewPadClass} text-right`}>PPN {taxRate}%</td>
                          <td colSpan={2} className={`${previewPadClass} text-right font-mono font-black`}>Rp {poTax.toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                      <tr style={{ backgroundColor: themeColor }} className="text-white font-black">
                        <td colSpan={4} className={`${previewPadClass} text-right`}>TOTAL PO</td>
                        <td colSpan={2} className={`${previewPadClass} text-right font-mono`}>Rp {poGrandTotal.toLocaleString("id-ID")}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {showTerbilang && (
                    <p className="text-[7.5px] italic text-slate-600">*Terbilang: {numberToWordsID(poGrandTotal)} rupiah</p>
                  )}

                  {showTncNotes && poNotes.trim() && (
                    <div className="border border-slate-200 p-2.5 rounded bg-slate-50/60 text-[7.5px]">
                      <span className="font-bold text-slate-800">Catatan:</span>{" "}
                      <span className="text-slate-600 whitespace-pre-wrap">{poNotes}</span>
                    </div>
                  )}

                  {/* PO Signature (Name ONLY - NO Jabatan) */}
                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div>
                      <p className="text-[8px] font-bold text-slate-800">Disetujui Oleh:</p>
                      <p className="text-[8px] text-slate-600">{compName}</p>
                      {qDigitalSigUrl && showDigitalStamp ? (
                        <div className="py-1 flex justify-start">
                          <img src={qDigitalSigUrl} alt="TTD" className="max-h-12 object-contain" />
                        </div>
                      ) : (
                        <div className="h-10" />
                      )}
                      <p className="text-[8px] font-black text-slate-900 border-b border-slate-800 inline-block pb-0.5">
                        {(poSignerName || "JIDAN RAMADHA").toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-800">Diterima & Dikonfirmasi:</p>
                      <p className="text-[8px] text-slate-600">{poVendorName || "Pihak Supplier"}</p>
                      <div className="h-10" />
                      <p className="text-[8px] font-black text-slate-900 border-b border-slate-800 inline-block pb-0.5">(.........................)</p>
                      <p className="text-[7px] text-slate-500">Cap & Tanda Tangan</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SURAT JALAN PREVIEW */}
              {effectiveType === "surat_jalan" && (
                <div className="space-y-4">
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/80 text-[8px] grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">Kepada Yth</span><span className="w-3">:</span><span className="font-extrabold text-slate-900">{sjRecipient || "-"}</span></div>
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">Alamat Kirim</span><span className="w-3">:</span><span className="font-bold text-slate-800">{sjAddress || "-"}</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">No. Surat Jalan</span><span className="w-3">:</span><span className="font-extrabold text-slate-900">{sjNum || "-"}</span></div>
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">Tanggal Kirim</span><span className="w-3">:</span><span className="font-bold text-slate-800">{sjDate || "-"}</span></div>
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">Kendaraan</span><span className="w-3">:</span><span className="font-bold text-slate-800">{sjVehicleType} ({sjVehiclePlate})</span></div>
                    </div>
                  </div>

                  <p className="text-[7.5px] text-slate-600">Harap diterima dengan baik barang-barang yang tertera di bawah ini:</p>

                  <table className={`w-full table-fixed text-left border border-slate-300 ${previewTextClass}`}>
                    <colgroup>
                      <col style={{ width: pctOfPrintable(colWidths.no) }} />
                      <col style={{ width: pctOfPrintable(computedDescColW) }} />
                      <col style={{ width: pctOfPrintable(colWidths.qty) }} />
                      <col style={{ width: pctOfPrintable(colWidths.unit) }} />
                      <col style={{ width: pctOfPrintable(colWidths.condition) }} />
                    </colgroup>
                    <thead style={{ backgroundColor: themeColor }} className="text-white">
                      <tr>
                        <th className={`${previewPadClass} text-center`}>NO</th>
                        <th className={`${previewPadClass}`}>NAMA BARANG & SPESIFIKASI</th>
                        <th className={`${previewPadClass} text-center`}>JUMLAH</th>
                        <th className={`${previewPadClass} text-center`}>SATUAN</th>
                        <th className={`${previewPadClass} text-center`}>KONDISI / KETERANGAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sjItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 align-top">
                          <td className={`${previewPadClass} text-center font-bold`}>{idx + 1}</td>
                          <td className={`${previewPadClass} font-bold text-slate-900`}>
                            {item.description || item.name}
                            {(() => {
                              let specs: any[] = [];
                              if (item.specifications) {
                                if (Array.isArray(item.specifications)) specs = item.specifications;
                                else if (typeof item.specifications === "string") {
                                  specs = item.specifications.split("\n").filter(Boolean).map((l: string) => {
                                    const parts = l.split(":");
                                    return { key: parts[0]?.trim() || "", value: parts.slice(1).join(":")?.trim() || "" };
                                  });
                                }
                              }
                              const validSpecs = specs.filter((s) => s && (s.key || s.value));
                              if (validSpecs.length === 0) return null;
                              return (
                                <div className="mt-1 space-y-0.5 text-[7px] text-slate-600 font-normal">
                                  {validSpecs.map((sp: any, sIdx: number) => {
                                    const rawKey = (sp.key || "").trim();
                                    const hasKey = rawKey && rawKey !== "-";
                                    return (
                                      <div key={sIdx} className="grid grid-cols-[70px_8px_1fr]">
                                        <span className="text-slate-600">{hasKey ? rawKey.toUpperCase() : ""}</span>
                                        <span className="text-slate-400">{hasKey ? ":" : ""}</span>
                                        <span className="text-slate-900">{sp.value}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </td>
                          <td className={`${previewPadClass} text-center font-bold`}>{item.qty || 1}</td>
                          <td className={`${previewPadClass} text-center font-bold`}>{item.unit || "Unit"}</td>
                          <td className={`${previewPadClass} text-center text-slate-600 font-medium`}>{item.condition || "Baik & Lengkap"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p className="text-[7.5px] italic text-slate-600">Catatan: {sjNotes}</p>

                  <div className="grid grid-cols-2 gap-8 pt-4 text-center">
                    <div>
                      <p className="text-[8px] font-bold text-slate-800">Penerima / Klien:</p>
                      <div className="h-12 flex items-center justify-center">
                        <span className="text-[7.5px] text-slate-300 italic">(Tanda Tangan & Cap Penerima)</span>
                      </div>
                      <p className="text-[8px] font-black text-slate-900 border-b border-slate-800 inline-block pb-0.5">
                        {sjReceivedBy || "(.........................)"}
                      </p>
                      <p className="text-[7px] text-slate-500 font-medium">Penerima / PIC Lapangan</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-800">Hormat Kami / Pengirim:</p>
                      {sjSignatureType === "upload" && sjSignatureUrl && showDigitalStamp ? (
                        <div className="h-12 flex items-center justify-center py-0.5">
                          <img src={sjSignatureUrl} alt="TTD" className="max-h-12 object-contain" />
                        </div>
                      ) : (
                        <div className="h-12 flex items-center justify-center">
                          <span className="text-[7.5px] text-slate-300 italic">(Tanda Tangan Basah)</span>
                        </div>
                      )}
                      <p className="text-[8px] font-black text-slate-900 border-b border-slate-800 inline-block pb-0.5">
                        {sjSenderName || "(.........................)"}
                      </p>
                      <p className="text-[7px] text-slate-500 font-medium">{sjSenderTitle || "Logistik & Ekspedisi"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* BOQ SPEC PREVIEW */}
              {effectiveType === "boq" && (
                <div className="space-y-4">
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/80 text-[8px] space-y-1">
                    <div className="flex"><span className="w-24 text-slate-500 font-bold">Nama Proyek</span><span className="w-3">:</span><span className="font-extrabold text-slate-900">{bName || "-"}</span></div>
                    <div className="flex"><span className="w-24 text-slate-500 font-bold">Tipe / Kapasitas</span><span className="w-3">:</span><span className="font-bold text-slate-800">{bType} {bCapacity ? `- ${bCapacity}` : ""}</span></div>
                    {bClient && <div className="flex"><span className="w-24 text-slate-500 font-bold">Klien</span><span className="w-3">:</span><span className="font-bold text-slate-800">{bClient}</span></div>}
                    {bDesc && <div className="flex"><span className="w-24 text-slate-500 font-bold">Keterangan</span><span className="w-3">:</span><span className="text-slate-700">{bDesc}</span></div>}
                  </div>

                  <table className={`w-full text-left border border-slate-300 ${previewTextClass}`}>
                    <thead style={{ backgroundColor: themeColor }} className="text-white">
                      <tr>
                        <th className={`${previewPadClass} text-center w-8`}>NO</th>
                        <th className={`${previewPadClass}`}>ITEM & SPESIFIKASI</th>
                        <th className={`${previewPadClass} text-center w-14`}>QTY</th>
                        <th className={`${previewPadClass} text-center w-16`}>SATUAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {bItems.map((bi: any, idx: number) => (
                        <tr key={idx} className="align-top">
                          <td className={`${previewPadClass} text-center font-bold`}>{idx + 1}</td>
                          <td className={`${previewPadClass}`}>
                            <div className="font-bold text-slate-900">{bi.name}</div>
                            {getCleanSpecLines(bi).map((ln, lIdx) => (
                              <div key={lIdx} className="text-[7px] text-slate-600">{ln}</div>
                            ))}
                          </td>
                          <td className={`${previewPadClass} text-center font-bold`}>{bi.quantity || bi.qty || 1}</td>
                          <td className={`${previewPadClass} text-center`}>{bi.unit || "Unit"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
              <FileDown size={14} className="text-indigo-400" />
              Nama File:
            </span>
            <input
              type="text"
              value={downloadFileName}
              onChange={(e) => setDownloadFileName(e.target.value)}
              placeholder="nama_file.pdf"
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-lg text-xs font-mono font-bold text-white outline-none w-full sm:w-80"
            />
            {effectiveType === "quotation" && (
              <button
                type="button"
                onClick={() => {
                  setDownloadFileName(
                    formatQuotationPdfFileName(qJobDesc, qItems, qRecipient, qNum, qDate)
                  );
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 hover:text-white rounded-lg text-[9px] font-bold shrink-0 transition-all cursor-pointer"
                title="Reset ke format: PENAWARAN_[PEKERJAAN]_[KEPADA]_[NO_SPH]"
              >
                🔄 Reset Format
              </button>
            )}
            {effectiveType === "invoice" && (
              <button
                type="button"
                onClick={() => {
                  setDownloadFileName(
                    formatInvoicePdfFileName(
                      invNum,
                      includeDownPayment,
                      downPaymentPercent,
                      downPaymentLabel,
                      invRecipient
                    )
                  );
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300 rounded-lg text-[9px] font-bold shrink-0 transition-all cursor-pointer"
                title="Format ulang nama file ke standar: INV_[NOMOR]_[DP/TERMIN%]_PT_[NAMA]"
              >
                🔄 Reset Format DP
              </button>
            )}
            {effectiveType === "delivery_order" && (
              <button
                type="button"
                onClick={() => {
                  setDownloadFileName(
                    formatDeliveryOrderPdfFileName(doNum, invNum, invRecipient)
                  );
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-teal-400 hover:text-teal-300 rounded-lg text-[9px] font-bold shrink-0 transition-all cursor-pointer"
                title="Reset ke format: DO_[NO_DO]_[NAMA_PT]"
              >
                🔄 Reset Format DO
              </button>
            )}
            {effectiveType === "po" && (
              <button
                type="button"
                onClick={() => {
                  setDownloadFileName(formatPoPdfFileName(poVendorName, poNo));
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-emerald-300 rounded-lg text-[9px] font-bold shrink-0 transition-all cursor-pointer"
                title="Reset ke format standar PO"
              >
                🔄 Reset Format
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Batal
            </button>
            {(onSaveQuotation || onSaveInvoice || onSavePo || onSaveSuratJalan) && (
              <button
                onClick={handleSaveOnly}
                disabled={isSaving}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={14} className="text-emerald-200" />
                )}
                <span>Simpan Dokumen</span>
              </button>
            )}
            {isInvoiceFamily ? (
              <>
                <button
                  type="button"
                  onClick={() => handleGeneratePDF("invoice")}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-1.5 ${
                    effectiveType === "invoice"
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white"
                      : "bg-slate-800 hover:bg-indigo-600 border border-slate-700 text-indigo-300 hover:text-white"
                  }`}
                >
                  <Download size={14} /> Unduh Invoice PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleGeneratePDF("delivery_order")}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-1.5 ${
                    effectiveType === "delivery_order"
                      ? "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                      : "bg-teal-950/80 hover:bg-teal-600 border border-teal-500/40 text-teal-300 hover:text-white"
                  }`}
                >
                  <Truck size={14} /> Unduh Delivery Order
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleGeneratePDF()}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Download size={14} className="text-indigo-200" /> Unduh Dokumen PDF
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
