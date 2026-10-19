import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Printer,
  FileText,
  CheckCircle2,
  Trash2,
  Plus,
  Scale,
  AlignLeft,
  Sparkles,
  Check,
  Edit,
  Eye,
  Download,
  Building2,
  FileDown,
  Percent,
  Upload,
  FolderOpen,
  Receipt,
  Truck,
  ShoppingCart
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { imageRepositoryService } from "../services/imageRepositoryService";
import { compressImage } from "../lib/utils";

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

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "quotation" | "boq" | "invoice" | "po" | "surat_jalan";
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
  // --- STATE CONFIGS FOR EXPORT ---
  const [paperSize, setPaperSize] = useState<"a4" | "f4" | "letter">("a4");
  const [marginStyle, setMarginStyle] = useState<"standard" | "compact" | "wide">("standard");
  const [showCompanyLogo, setShowCompanyLogo] = useState(true);
  const [showDigitalStamp, setShowDigitalStamp] = useState(true);
  const [showTncNotes, setShowTncNotes] = useState(true);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("preview");

  // Ukuran Logo & Tanda Tangan fleksibel (Request 1)
  const [logoSize, setLogoSize] = useState<"tiny" | "compact" | "standard" | "large" | "huge">("standard");
  const [sigSize, setSigSize] = useState<"tiny" | "compact" | "standard" | "large" | "huge">("standard");
  const [sigAlign, setSigAlign] = useState<"left" | "center">("left");

  // Ukuran / Skala Tabel fleksibel (Request 1)
  const [tableDensity, setTableDensity] = useState<"compact" | "standard" | "spacious">("standard");

  // Nama file unduhan yang bisa diganti/diedit oleh pengguna sebelum didownload (Request 1)
  const [downloadFileName, setDownloadFileName] = useState<string>("");

  // Label Ongkir / Pengiriman yang bisa diedit dan toggle tampil/tidak (Request 2)
  const [shippingLabel, setShippingLabel] = useState<string>("ONGKOS KIRIM / PENGIRIMAN");
  const [includeShipping, setIncludeShipping] = useState<boolean>(false);
  const [shippingCost, setShippingCost] = useState<number>(0);

  // --- DYNAMIC DISCOUNTS, TAX & COMPANY CREDENTIALS STATE ---
  const [discountType, setDiscountType] = useState<"percent" | "rupiah">("rupiah");
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(11);
  const [includePPN, setIncludePPN] = useState<boolean>(true);

  const [compName, setCompName] = useState("PT. GARDA INOVASI GLOBALTECH");
  const [compAddress1, setCompAddress1] = useState("Perumahan Griya Sepatan Blok B6 Nomor 35, RT.02/09");
  const [compAddress2, setCompAddress2] = useState("Ds. Pisangan Jaya, Kec. Sepatan, Kab Tangerang");
  const [compCityZip, setCompCityZip] = useState("Banten, 15525");
  const [compPhone, setCompPhone] = useState("0888-1687-794");
  const [compEmail, setCompEmail] = useState("info@globaltech.id");
  const [compOffice, setCompOffice] = useState("REGIONAL OFFICE BANTEN");
  const [compLogoUrl, setCompLogoUrl] = useState<string>("");
  const [qDigitalSigUrl, setQDigitalSigUrl] = useState<string>("");

  // --- SPH (Quotation) Data ---
  const [qNum, setQNum] = useState("");
  const [qRecipient, setQRecipient] = useState("");
  const [qAttention, setQAttention] = useState("");
  const [qDate, setQDate] = useState("");
  const [qJobDesc, setQJobDesc] = useState("");
  const [qNotes, setQNotes] = useState("");
  const [qPaymentTerms, setQPaymentTerms] = useState("");
  const [qPreparedBy, setQPreparedBy] = useState("ALEXSANDER");
  const [qPreparedByTitle, setQPreparedByTitle] = useState("Direktur");
  const [qItems, setQItems] = useState<any[]>([]);
  const [connectedBoqId, setConnectedBoqId] = useState("");
  const [qType, setQType] = useState<"Barang dan Jasa" | "Barang" | "Jasa">("Barang dan Jasa");

  // --- Invoice Data ---
  const [invNum, setInvNum] = useState("");
  const [invRecipient, setInvRecipient] = useState("");
  const [invAttention, setInvAttention] = useState("");
  const [invAddress, setInvAddress] = useState("");
  const [invDate, setInvDate] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invJobDesc, setInvJobDesc] = useState("");
  const [invPoRef, setInvPoRef] = useState("");
  const [invBankName, setInvBankName] = useState("Mandiri");
  const [invBankHolder, setInvBankHolder] = useState("PT. GARDA INOVASI GLOBALTECH");
  const [invBankNumber, setInvBankNumber] = useState("1550014117173");
  const [invNotes, setInvNotes] = useState("- Pembayaran dianggap sah jika telah masuk rekening resmi kami.\n- Bukti transfer dapat dikirimkan melalui WA atau Email resmi.");
  const [invItems, setInvItems] = useState<any[]>([]);

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
  const [poTerms, setPoTerms] = useState<string[]>([
    "Pelunasan saat barang diterima dan dokumentasi penagihan diterima lengkap & benar oleh PT. GARDA INOVASI GLOBALTECH.",
    "Dokumentasi Penagihan: Invoice Asli Bermaterai, Copy PO bertandatangan & cap, Surat Jalan resmi.",
    "Segala bentuk kerusakan/kehilangan barang sebelum serah terima menjadi tanggung jawab supplier."
  ]);
  const [poItems, setPoItems] = useState<any[]>([]);
  const [poSignerName, setPoSignerName] = useState("Jidan Ramadhan");
  const [poSignerRole, setPoSignerRole] = useState("Purchasing / Direktur");

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

  // --- BOQ spec Data ---
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
        const num = initialQuotationData.number || "";
        const recip = initialQuotationData.recipient || "";
        setQNum(num);
        setQRecipient(recip);
        setQAttention(initialQuotationData.attention || "");
        setQDate(initialQuotationData.date || new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }));
        setQJobDesc(initialQuotationData.jobDescription || "");
        setQNotes(initialQuotationData.notes !== undefined ? initialQuotationData.notes : "- Harga sudah termasuk PPN\n- Penawaran berlaku selama 14 hari kerja");
        setQPaymentTerms(initialQuotationData.paymentTerms !== undefined ? initialQuotationData.paymentTerms : "- DP 50% saat PO / SPK disetujui\n- Pelunasan 50% setelah pekerjaan selesai");
        setQPreparedBy(initialQuotationData.preparedBy || "ALEXSANDER");
        setQPreparedByTitle(initialQuotationData.preparedByTitle || "Direktur");
        setQItems(initialQuotationData.items ? [...initialQuotationData.items] : []);
        setConnectedBoqId(initialQuotationData.boqProjectId || "");
        setQType(initialQuotationData.quotationType || "Barang dan Jasa");
        setIncludeShipping(initialQuotationData.includeShipping !== undefined ? initialQuotationData.includeShipping : false);
        setShippingCost(initialQuotationData.shippingCost || 0);
        setShippingLabel(initialQuotationData.shippingLabel || "ONGKOS KIRIM / PENGIRIMAN");
        setIncludePPN(initialQuotationData.includePPN !== undefined ? initialQuotationData.includePPN : true);
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
        setQDigitalSigUrl(initialQuotationData.digitalSignatureUrl || "");
        
        // Initial custom filename
        const cleanNum = (num || "SPH").replace(/[^a-zA-Z0-9_-]/g, "_");
        const cleanClient = recip.split(" ")[0] || "Client";
        setDownloadFileName(`SPH_${cleanClient}_${cleanNum}.pdf`);
      } else if (type === "invoice" && initialInvoiceData) {
        const num = initialInvoiceData.invoiceNumber || "";
        const recip = initialInvoiceData.clientName || initialInvoiceData.recipientName || "";
        setInvNum(num);
        setInvRecipient(recip);
        setInvAttention(initialInvoiceData.recipientUp || "");
        setInvAddress(initialInvoiceData.clientAddress || initialInvoiceData.recipientAddress || "");
        setInvDate(initialInvoiceData.invoiceDate || new Date().toISOString().substring(0, 10));
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
        setInvItems(initialInvoiceData.items ? [...initialInvoiceData.items] : []);
        setIncludePPN(initialInvoiceData.enablePPN !== undefined ? initialInvoiceData.enablePPN : true);
        setTaxRate(initialInvoiceData.taxPercentage || 11);
        setIncludeShipping(initialInvoiceData.includeShipping || false);
        setShippingCost(initialInvoiceData.shippingCost || 0);
        setShippingLabel(initialInvoiceData.shippingLabel || "BIAYA PENGIRIMAN / ONGKIR");
        setDiscountVal(initialInvoiceData.discountVal || 0);
        setCompName(initialInvoiceData.companyName || "PT. GARDA INOVASI GLOBALTECH");
        setCompLogoUrl(initialInvoiceData.logoImage || "");
        setQPreparedBy(initialInvoiceData.signatoryName || "JIDAN RAMADHAN");
        setQPreparedByTitle(initialInvoiceData.signatoryTitle || "Direktur Keuangan");
        setQDigitalSigUrl(initialInvoiceData.digitalSignatureUrl || initialInvoiceData.signatureImage || "");

        const cleanNum = (num || "INV").replace(/[^a-zA-Z0-9_-]/g, "_");
        setDownloadFileName(`INVOICE_${cleanNum}.pdf`);
      } else if (type === "po" && initialPoData) {
        const num = initialPoData.poNo || "";
        setPoNo(num);
        setPoDate(initialPoData.date || new Date().toISOString().substring(0, 10));
        setPoDeliveryDate(initialPoData.deliveryDate || "");
        setPoVendorName(initialPoData.vendorName || "");
        setPoVendorAddress(initialPoData.vendorAddress || "");
        setPoVendorPhone(initialPoData.vendorPhone || "");
        setPoProjectRef(initialPoData.projectRef || initialPoData.note || "");
        setPoDeliveryAddress(initialPoData.buyerAddress || "Workshop / Gudang GIGT Sepatan");
        setPoItems(initialPoData.items ? [...initialPoData.items] : []);
        setIncludePPN(initialPoData.ppnPercent ? initialPoData.ppnPercent > 0 : true);
        setTaxRate(initialPoData.ppnPercent || 11);
        setIncludeShipping(initialPoData.includeShipping || false);
        setShippingCost(initialPoData.shippingCost || 0);
        setShippingLabel(initialPoData.shippingLabel || "ONGKOS PENGIRIMAN SUPPLIER");
        setPoSignerName(initialPoData.signerName || "Jidan Ramadhan");
        setPoSignerRole(initialPoData.signerRole || "Purchasing / Direktur");
        setCompName(initialPoData.buyerName || "PT. GARDA INOVASI GLOBALTECH");

        const cleanNum = (num || "PO").replace(/[^a-zA-Z0-9_-]/g, "_");
        setDownloadFileName(`PO_${cleanNum}.pdf`);
      } else if (type === "surat_jalan" && initialSuratJalanData) {
        const num = initialSuratJalanData.number || initialSuratJalanData.suratNumber || "";
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
    ? boqProjects.find(b => b.id === connectedBoqId)
    : null;
  const currentBoqItemsToUse = matchedBoq ? matchedBoq.items || [] : [];

  // Quotation Financials
  const qSubtotal = qItems.reduce((acc, el) => acc + ((el.vol || el.quantity || 1) * (el.unitPrice || 0)), 0);
  const qDiscountAmount = discountType === "percent" ? Math.round(qSubtotal * (discountVal / 100)) : discountVal;
  const qShipping = includeShipping ? Number(shippingCost || 0) : 0;
  const qTaxBase = Math.max(0, qSubtotal - qDiscountAmount);
  const qTax = includePPN ? Math.round(qTaxBase * (taxRate / 100)) : 0;
  const qGrandTotal = qSubtotal - qDiscountAmount + qShipping + qTax;

  // Invoice Financials
  const invSubtotal = invItems.reduce((acc, el) => acc + ((Number(el.qty) || 1) * (Number(el.price) || 0)), 0);
  const invShipping = includeShipping ? Number(shippingCost || 0) : 0;
  const invTax = includePPN ? Math.round(invSubtotal * (taxRate / 100)) : 0;
  const invGrandTotal = invSubtotal - discountVal + invShipping + invTax;

  // PO Financials
  const poSubtotal = poItems.reduce((acc, el) => acc + ((Number(el.qty) || 1) * (Number(el.price) || 0)), 0);
  const poShipping = includeShipping ? Number(shippingCost || 0) : 0;
  const poTax = includePPN ? Math.round(poSubtotal * (taxRate / 100)) : 0;
  const poGrandTotal = poSubtotal - discountVal + poShipping + poTax;

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
    }
    return result.trim().replace(/\s+/g, " ");
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveOnly = async () => {
    setIsSaving(true);
    try {
      if (type === "quotation" && onSaveQuotation) {
        await onSaveQuotation({
          number: qNum,
          recipient: qRecipient,
          attention: qAttention,
          date: qDate,
          jobDescription: qJobDesc,
          notes: qNotes,
          paymentTerms: qPaymentTerms,
          preparedBy: qPreparedBy,
          preparedByTitle: qPreparedByTitle,
          subTotal: qSubtotal,
          quotationType: qType,
          items: qItems,
          includeShipping,
          shippingLabel,
          shippingCost: includeShipping ? Number(shippingCost || 0) : 0,
          includePPN,
          discountType,
          discountVal,
          taxRate,
          compName,
          compLogoUrl,
          digitalSignatureUrl: qDigitalSigUrl,
          tax: qTax,
          grandTotal: qGrandTotal
        });
      } else if (type === "invoice" && onSaveInvoice) {
        await onSaveInvoice({
          invoiceNumber: invNum,
          recipientName: invRecipient,
          clientName: invRecipient,
          recipientUp: invAttention,
          recipientAddress: invAddress,
          clientAddress: invAddress,
          invoiceDate: invDate,
          dueDate: invDueDate,
          jobName: invJobDesc,
          poRef: invPoRef,
          items: invItems,
          enablePPN: includePPN,
          taxPercentage: taxRate,
          includeShipping,
          shippingLabel,
          shippingCost: includeShipping ? Number(shippingCost || 0) : 0,
          amount: invGrandTotal,
          grandTotal: invGrandTotal,
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
          items: poItems,
          ppnPercent: includePPN ? taxRate : 0,
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
  const handleGeneratePDF = async () => {
    const marginSize = marginStyle === "compact" ? 10 : marginStyle === "wide" ? 20 : 15;
    let docFormat = "a4";
    if (paperSize === "f4") docFormat = "folio";
    else if (paperSize === "letter") docFormat = "letter";

    const pdf = paperSize === "f4" 
      ? new jsPDF("p", "mm", [215, 330]) 
      : new jsPDF("p", "mm", docFormat);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Table scale configurations based on tableDensity
    const cellPad = tableDensity === "compact" 
      ? { top: 1.5, bottom: 1.5, left: 1.8, right: 1.8 } 
      : tableDensity === "spacious" 
        ? { top: 3.2, bottom: 3.2, left: 2.5, right: 2.5 } 
        : { top: 2.2, bottom: 2.2, left: 2, right: 2 };
    const baseFontSize = tableDensity === "compact" ? 7 : tableDensity === "spacious" ? 8.5 : 8;

    // Helper: Draw Header KOP
    const drawHeaderKop = async (title: string) => {
      if (showCompanyLogo && compLogoUrl) {
        try {
          let format = "PNG";
          if (compLogoUrl.includes("image/jpeg") || compLogoUrl.includes("image/jpg")) format = "JPEG";
          const logoDim = await getImageDimensions(compLogoUrl);
          const ratio = logoDim.ratio;

          // Logo dimensions based on 5 user-controlled sizes
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
      pdf.text(compAddress1, pageWidth - marginSize, 24, { align: "right" });
      pdf.text(compAddress2, pageWidth - marginSize, 28, { align: "right" });
      pdf.text(`${compCityZip} | ${compPhone}`, pageWidth - marginSize, 32, { align: "right" });
      pdf.setTextColor(0, 51, 153);
      pdf.text(compEmail, pageWidth - marginSize, 36, { align: "right" });

      // Title
      pdf.setTextColor(30, 58, 138); // Biru Navy Resmi
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, pageWidth / 2, 50, { align: "center" });

      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.4);
      pdf.line(pageWidth / 2 - 40, 52.8, pageWidth / 2 + 40, 52.8);
    };

    // Helper: Draw Signatures
    const drawSignature = async (startY: number, signerName: string, signerRole: string, blockTitle = "Hormat kami,") => {
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

      const sName = signerName.toUpperCase();
      const nameW = pdf.getTextWidth(sName);
      const compW = pdf.getTextWidth(compName);
      const blockW = Math.max(nameW, compW, 46);

      if (qDigitalSigUrl && showDigitalStamp) {
        try {
          let sigFormat = "PNG";
          if (qDigitalSigUrl.includes("image/jpeg") || qDigitalSigUrl.includes("image/jpg")) sigFormat = "JPEG";
          const sigDim = await getImageDimensions(qDigitalSigUrl);
          const ratio = sigDim.ratio;

          // 5 Sizes for Signature
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
        pdf.setTextColor(30, 58, 138);
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
      // Clean safe distance below baseline: 5.8mm ensures NO COLLISION with letters
      pdf.line(lineStartX, finalY + 5.8, lineEndX, finalY + 5.8);

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      const titleW = pdf.getTextWidth(signerRole);
      const titleX = sigAlign === "center" ? sigX + (blockW - titleW) / 2 : sigX;
      pdf.text(signerRole, titleX, finalY + 10);
    };

    // ==========================================
    // 1. SPH QUOTATION MODE
    // ==========================================
    if (type === "quotation") {
      await drawHeaderKop("SURAT PENAWARAN HARGA");

      // Box Metadata
      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginSize, 57, pageWidth - (marginSize * 2), 22, 1.5, 1.5, "FD");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);

      const leftColX = marginSize + 4;
      const leftColonX = leftColX + 22;
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
      pdf.text("Hal / Pekerjaan", rightColStart, 75);
      pdf.text(":", rightColonX, 75);
      pdf.setTextColor(15, 23, 42);
      pdf.text(qJobDesc || "-", rightValX, 75, { maxWidth: 62 });

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(30, 41, 59);
      pdf.text("Bersama ini kami sampaikan penawaran harga dengan rincian spesifikasi sebagai berikut:", marginSize, 85);

      const tableHeaders = ["NO", "URAIAN PEKERJAAN", "VOL", "SATUAN", "HARGA SATUAN", "TOTAL BIAYA"];
      const col0W = 10;
      const col2W = 13;
      const col3W = 18;
      const col4W = 27;
      const col5W = 28;
      const col1W = (pageWidth - marginSize * 2) - (col0W + col2W + col3W + col4W + col5W);

      const parsedItemRows = qItems.map((item) => {
        const itemTitle = (item.description || "").trim();
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(baseFontSize);
        const titleLines: string[] = itemTitle ? pdf.splitTextToSize(itemTitle, col1W - 6) : ["-"];

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
        const validSpecs = specs.filter(s => s && (s.key || s.value));

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize - 1);
        const parsedSpecs = validSpecs.map(sp => {
          const rawKey = (sp.key || "").trim();
          const hasKey = Boolean(rawKey && rawKey !== "-");
          const k = hasKey ? rawKey.toUpperCase() : "";
          const v = (sp.value || "").trim();
          const valMaxWidth = col1W - 28;
          const valLines: string[] = v ? pdf.splitTextToSize(v, valMaxWidth) : [""];
          return { hasKey, key: k, valLines };
        });

        const lineStep = tableDensity === "compact" ? 2.8 : tableDensity === "spacious" ? 3.6 : 3.2;
        const titleH = titleLines.length * (lineStep + 0.2);
        let specsH = 0;
        if (parsedSpecs.length > 0) {
          specsH = 1.4;
          parsedSpecs.forEach(ps => {
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
        `Rp ${((item.vol || item.quantity || 1) * (item.unitPrice || 0)).toLocaleString("id-ID")}`
      ]);

      const footRows: any[] = [
        [
          { content: "SUB TOTAL", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize, fillColor: [248, 250, 252] as any, textColor: [15, 23, 42] } },
          { content: `Rp ${qSubtotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 0.5, fillColor: [248, 250, 252] as any, textColor: [15, 23, 42] } }
        ]
      ];

      if (discountVal > 0) {
        footRows.push([
          { content: `DISKON ${discountType === "percent" && discountVal > 0 ? `(${discountVal}%)` : ""}`.trim(), colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize, fillColor: [248, 250, 252] as any, textColor: [220, 38, 38] } },
          { content: `-Rp ${qDiscountAmount.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 0.5, fillColor: [248, 250, 252] as any, textColor: [220, 38, 38] } }
        ]);
      }

      // Checkpoint Ongkir (Request 2: jika diceklis dimunculkan dengan custom label, jika tidak diceklis TIDAK DIMUNCULKAN SAMA SEKALI)
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
        { content: "GRAND TOTAL", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 0.5, fillColor: [30, 58, 138] as any, textColor: [255, 255, 255] } },
        { content: `Rp ${qGrandTotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fontSize: baseFontSize + 1, fillColor: [30, 58, 138] as any, textColor: [255, 255, 255] } }
      ]);

      autoTable(pdf, {
        head: [tableHeaders],
        body: qTableRows,
        foot: footRows,
        startY: 89,
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
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          lineColor: [23, 37, 84],
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
                    pdf.text(":", data.cell.x + 23, specLineStartY);
                  }
                  pdf.setTextColor(15, 23, 42);
                  sp.valLines.forEach((vl: string, vlIdx: number) => {
                    const lineY = specLineStartY + (vlIdx * 2.8);
                    pdf.text(vl, data.cell.x + 26, lineY);
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

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(7.5);
      pdf.setTextColor(51, 65, 85);
      pdf.text(`*Terbilang : ${numberToWordsID(qGrandTotal)} rupiah`, marginSize, finalY);
      finalY += 4.5;

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

      await drawSignature(finalY, qPreparedBy, qPreparedByTitle);

      // Connected BOQ if present
      if (connectedBoqId && currentBoqItemsToUse.length > 0) {
        pdf.addPage();
        const boqTitle = `SPESIFIKASI ${matchedBoq?.projType?.toUpperCase() || "WTP"}${matchedBoq?.capacity ? ` KAPASITAS ${matchedBoq?.capacity?.toUpperCase()}` : ""}`;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(30, 58, 138);
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
          headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: "bold" },
          columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { halign: "left" }, 2: { cellWidth: 20, halign: "center" }, 3: { cellWidth: 15, halign: "center" } }
        });
      }
    }

    // ==========================================
    // 2. INVOICE MODE (Request 3)
    // ==========================================
    else if (type === "invoice") {
      await drawHeaderKop("INVOICE / FAKTUR PENAGIHAN");

      // Metadata Box
      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginSize, 57, pageWidth - (marginSize * 2), 22, 1.5, 1.5, "FD");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);

      const leftColX = marginSize + 4;
      const leftColonX = leftColX + 22;
      const leftValX = leftColonX + 3;

      pdf.text("Ditagihkan Kepada", leftColX, 63);
      pdf.text(":", leftColonX, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(invRecipient || "-", leftValX, 63, { maxWidth: 62 });

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Up / Attn", leftColX, 69);
      pdf.text(":", leftColonX, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(invAttention || "-", leftValX, 69, { maxWidth: 62 });

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

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(30, 41, 59);
      pdf.text("Berikut adalah rincian tagihan atas barang / pekerjaan yang telah diselesaikan:", marginSize, 85);

      const invTableHeaders = ["NO", "URAIAN PEKERJAAN / BARANG", "QTY", "SATUAN", "HARGA SATUAN", "TOTAL BIAYA"];
      const col0W = 10;
      const col2W = 13;
      const col3W = 18;
      const col4W = 27;
      const col5W = 28;
      const col1W = (pageWidth - marginSize * 2) - (col0W + col2W + col3W + col4W + col5W);

      const parsedInvRows = invItems.map((item) => {
        const itemTitle = (item.description || item.name || "").trim();
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(baseFontSize);
        const titleLines: string[] = itemTitle ? pdf.splitTextToSize(itemTitle, col1W - 6) : ["-"];

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
        const validSpecs = specs.filter(s => s && (s.key || s.value));

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize - 1);
        const parsedSpecs = validSpecs.map(sp => {
          const rawKey = (sp.key || "").trim();
          const hasKey = Boolean(rawKey && rawKey !== "-");
          const k = hasKey ? rawKey.toUpperCase() : "";
          const v = (sp.value || "").trim();
          const valMaxWidth = col1W - 28;
          const valLines: string[] = v ? pdf.splitTextToSize(v, valMaxWidth) : [""];
          return { hasKey, key: k, valLines };
        });

        const lineStep = tableDensity === "compact" ? 2.8 : tableDensity === "spacious" ? 3.6 : 3.2;
        const titleH = titleLines.length * (lineStep + 0.2);
        let specsH = 0;
        if (parsedSpecs.length > 0) {
          specsH = 1.4;
          parsedSpecs.forEach(ps => {
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

      invFootRows.push([
        { content: "TOTAL TAGIHAN", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [30, 58, 138] as any, textColor: [255, 255, 255] } },
        { content: `Rp ${invGrandTotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [30, 58, 138] as any, textColor: [255, 255, 255] } }
      ]);

      autoTable(pdf, {
        head: [invTableHeaders],
        body: invTableRows,
        foot: invFootRows,
        startY: 89,
        margin: { left: marginSize, right: marginSize, bottom: 15 },
        theme: "grid",
        styles: { fontSize: baseFontSize, cellPadding: cellPad, textColor: [15, 23, 42], lineColor: [203, 213, 225], lineWidth: 0.1, valign: "top" },
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: "bold", halign: "center", lineColor: [23, 37, 84], lineWidth: 0.1, fontSize: baseFontSize, cellPadding: 2.2 },
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
                    pdf.text(":", data.cell.x + 23, specLineStartY);
                  }
                  pdf.setTextColor(15, 23, 42);
                  sp.valLines.forEach((vl: string, vlIdx: number) => {
                    const lineY = specLineStartY + (vlIdx * 2.8);
                    pdf.text(vl, data.cell.x + 26, lineY);
                  });
                  curY += Math.max(1, sp.valLines.length) * 2.8 + 0.4;
                });
              }
            }
          }
        }
      });

      let finalY = (pdf as any).lastAutoTable.finalY + 5;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(7.5);
      pdf.text(`*Terbilang : ${numberToWordsID(invGrandTotal)} rupiah`, marginSize, finalY);
      finalY += 5;

      // Bank Payment Box
      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(marginSize, finalY, pageWidth - marginSize * 2, 14, 1.5, 1.5, "FD");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(30, 58, 138);
      pdf.text(`Pembayaran Transfer : Bank ${invBankName} - Rek: ${invBankNumber} a/n ${invBankHolder}`, marginSize + 4, finalY + 5.5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(71, 85, 105);
      pdf.text("Mohon cantumkan No. Invoice pada berita transfer dan konfirmasi bukti bayar ke finance.", marginSize + 4, finalY + 10.5);
      finalY += 18;

      await drawSignature(finalY, qPreparedBy, qPreparedByTitle);
    }

    // ==========================================
    // 3. PURCHASE ORDER (PO) MODE (Request 3)
    // ==========================================
    else if (type === "po") {
      await drawHeaderKop("PURCHASE ORDER (PO)");

      // Metadata Box
      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(marginSize, 57, pageWidth - (marginSize * 2), 22, 1.5, 1.5, "FD");

      const leftColX = marginSize + 4;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Vendor / Supplier", leftColX, 63);
      pdf.text(":", leftColX + 22, 63);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(poVendorName || "-", leftColX + 25, 63);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Alamat Vendor", leftColX, 69);
      pdf.text(":", leftColX + 22, 69);
      pdf.setTextColor(15, 23, 42);
      pdf.text(poVendorAddress || "-", leftColX + 25, 69, { maxWidth: 62 });

      const rightColStart = marginSize + (pageWidth - marginSize * 2) / 2 + 5;
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

      pdf.setTextColor(30, 41, 59);
      pdf.text("Dengan ini kami memesan barang / jasa dengan spesifikasi dan ketentuan berikut:", marginSize, 85);

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
        { content: "TOTAL PO", colSpan: 4, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [30, 58, 138] as any, textColor: [255, 255, 255] } },
        { content: `Rp ${poGrandTotal.toLocaleString("id-ID")}`, colSpan: 2, styles: { halign: "right", fontStyle: "bold" as const, fillColor: [30, 58, 138] as any, textColor: [255, 255, 255] } }
      ]);

      autoTable(pdf, {
        head: [["NO", "DESKRIPSI BARANG / PEKERJAAN", "QTY", "SATUAN", "HARGA SATUAN", "TOTAL HARGA"]],
        body: poTableRows,
        foot: poFootRows,
        startY: 89,
        margin: { left: marginSize, right: marginSize },
        theme: "grid",
        styles: { fontSize: baseFontSize, cellPadding: cellPad, textColor: [15, 23, 42], lineColor: [203, 213, 225], lineWidth: 0.1 },
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
        columnStyles: { 0: { cellWidth: 10, halign: "center" }, 2: { cellWidth: 14, halign: "center" }, 3: { cellWidth: 18, halign: "center" }, 4: { cellWidth: 28, halign: "right" }, 5: { cellWidth: 28, halign: "right" } }
      });

      let finalY = (pdf as any).lastAutoTable.finalY + 5;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(7.5);
      pdf.text(`*Terbilang : ${numberToWordsID(poGrandTotal)} rupiah`, marginSize, finalY);
      finalY += 5;

      // Two column signature for PO: Left = Approved GIGT, Right = Confirmed Supplier
      const colW = (pageWidth - marginSize * 2) / 2;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      pdf.text("Disetujui Oleh :", marginSize, finalY);
      pdf.text("Dikonfirmasi & Diterima Supplier :", marginSize + colW, finalY);

      finalY += 18;
      pdf.line(marginSize, finalY, marginSize + 45, finalY);
      pdf.line(marginSize + colW, finalY, marginSize + colW + 45, finalY);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text(`${poSignerName} (${poSignerRole})`, marginSize, finalY + 4);
      pdf.text(`${poVendorName || "Pihak Supplier"}`, marginSize + colW, finalY + 4);
    }

    // ==========================================
    // 4. SURAT JALAN MODE (Request 3)
    // ==========================================
    else if (type === "surat_jalan") {
      await drawHeaderKop("SURAT JALAN");

      // Metadata Box
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
      const col0W = 10;
      const col2W = 16;
      const col3W = 18;
      const col4W = 34;
      const col1W = (pageWidth - marginSize * 2) - (col0W + col2W + col3W + col4W);

      const parsedSjRows = sjItems.map((item) => {
        const itemTitle = (item.description || item.name || "").trim();
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(baseFontSize);
        const titleLines: string[] = itemTitle ? pdf.splitTextToSize(itemTitle, col1W - 6) : ["-"];

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
        const validSpecs = specs.filter(s => s && (s.key || s.value));

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize - 1);
        const parsedSpecs = validSpecs.map(sp => {
          const rawKey = (sp.key || "").trim();
          const hasKey = Boolean(rawKey && rawKey !== "-");
          const k = hasKey ? rawKey.toUpperCase() : "";
          const v = (sp.value || "").trim();
          const valMaxWidth = col1W - 28;
          const valLines: string[] = v ? pdf.splitTextToSize(v, valMaxWidth) : [""];
          return { hasKey, key: k, valLines };
        });

        const lineStep = tableDensity === "compact" ? 2.8 : tableDensity === "spacious" ? 3.6 : 3.2;
        const titleH = titleLines.length * (lineStep + 0.2);
        let specsH = 0;
        if (parsedSpecs.length > 0) {
          specsH = 1.4;
          parsedSpecs.forEach(ps => {
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
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: "bold", halign: "center", lineColor: [23, 37, 84], lineWidth: 0.1, fontSize: baseFontSize, cellPadding: 2.2 },
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
                    pdf.text(":", data.cell.x + 23, specLineStartY);
                  }
                  pdf.setTextColor(15, 23, 42);
                  sp.valLines.forEach((vl: string, vlIdx: number) => {
                    const lineY = specLineStartY + (vlIdx * 2.8);
                    pdf.text(vl, data.cell.x + 26, lineY);
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

      // Notes
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Catatan: ${sjNotes}`, marginSize, finalY);
      finalY += 8;

      // 2 Columns Signatures for Surat Jalan (Driver/Supir Dihapus Sesuai Permintaan)
      const colW = (pageWidth - marginSize * 2) / 2;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      pdf.text("Penerima / Klien :", marginSize, finalY);
      pdf.text("Hormat Kami / Pengirim :", marginSize + colW, finalY);

      // Height for signature area
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

    // Save with the user's customized download file name (Request 1)
    const validFileName = downloadFileName?.trim() 
      ? (downloadFileName.endsWith(".pdf") ? downloadFileName : `${downloadFileName}.pdf`)
      : `Dokumen_${type.toUpperCase()}.pdf`;
    pdf.save(validFileName);
  };

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
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                Designer & Live Preview Center
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                  {type === "quotation" ? "Penawaran (SPH)" : type === "invoice" ? "Invoice" : type === "po" ? "Purchase Order" : type === "surat_jalan" ? "Surat Jalan" : "BOQ"}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-bold">
                Kustomisasi rincian konten, atur ukuran kertas & download dokumen resmi Anda instan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Outer Split Pane Builder */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-slate-900/40">
          {/* LEFT COMMAND PANEL: CONFIGS & CONTROLS */}
          <div className="w-full md:w-5/12 border-r border-slate-800 overflow-y-auto p-5 space-y-5 flex flex-col text-left">
            <div className="space-y-4 flex-1 select-none">
              
              {/* Paper Layout */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Scale size={12} className="text-indigo-400" /> Ukuran Kertas & Tata Letak
                </h4>
                
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "a4", label: "A4", size: "210x297 mm" },
                    { id: "f4", label: "F4 (Legal)", size: "215x330 mm" },
                    { id: "letter", label: "Letter", size: "216x279 mm" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPaperSize(p.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
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
                      onClick={() => setMarginStyle(m.id as any)}
                      className={`py-1.5 px-2 rounded-lg border text-center text-[9px] font-extrabold uppercase transition-all ${
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

              {/* VISUAL CONTROLS (Request 1) */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={12} className="text-indigo-400" /> Ukuran Logo, TTD & Skala Tabel
                </h4>

                {/* 1. Pengaturan Ukuran Logo */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCompanyLogo}
                        onChange={(e) => setShowCompanyLogo(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-700 bg-slate-800"
                      />
                      <span>Tampilkan Logo Perusahaan</span>
                    </label>
                  </div>
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
                          className={`py-1 text-[8px] font-black uppercase rounded transition-all ${
                            logoSize === sz.id ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Pengaturan Ukuran & Posisi Tanda Tangan */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                  <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDigitalStamp}
                      onChange={(e) => setShowDigitalStamp(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-700 bg-slate-800"
                    />
                    <span>Tampilkan Tanda Tangan & Stempel</span>
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
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
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
                            className={`py-1 text-[8px] font-black uppercase rounded transition-all ${
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

                {/* 3. Pengaturan Ukuran / Kerapatan Tabel (Request 1) */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-300">Skala & Kerapatan Tabel:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "compact", label: "Kompak (Fit 1 Hlm)", desc: "Rapat & Ringkas" },
                      { id: "standard", label: "Standar", desc: "Seimbang" },
                      { id: "spacious", label: "Lapang", desc: "Longgar & Luas" }
                    ].map((den) => (
                      <button
                        key={den.id}
                        type="button"
                        onClick={() => setTableDensity(den.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          tableDensity === den.id 
                            ? "border-indigo-500 bg-indigo-500/10 text-white" 
                            : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <p className="text-[10px] font-black">{den.label}</p>
                        <p className="text-[8px] text-slate-500">{den.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Ongkir / Pengiriman Customizable (Request 2) */}
                {(type === "quotation" || type === "invoice" || type === "po") && (
                  <div className="space-y-2 border-t border-slate-800/80 pt-3">
                    <label className="text-[10px] font-bold text-slate-300 flex items-center justify-between cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <Truck size={12} className="text-indigo-400" />
                        Tampilkan Ongkir / Pengiriman di PDF
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
                          Label Teks (Bisa diedit sesuka hati):
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
                )}

                {/* 5. Pengaturan Tanda Tangan Surat Jalan */}
                {type === "surat_jalan" && (
                  <div className="space-y-2.5 border-t border-slate-800/80 pt-3">
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
                          ✍️ Gambar
                        </button>
                        <button
                          type="button"
                          onClick={() => setSjSignatureType("blank")}
                          className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                            sjSignatureType === "blank" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          📝 Kosongan
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
                                  try {
                                    res = await compressImage(res, 600, 600, 0.85);
                                  } catch (_) {}
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
                        <label className="text-slate-400 font-bold block mb-0.5">Jabatan:</label>
                        <input
                          type="text"
                          value={sjSenderTitle}
                          onChange={(e) => setSjSenderTitle(e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
                maxWidth: "700px"
              }}
              className="bg-white rounded-md shadow-2xl p-8 sm:p-10 font-sans text-slate-950 text-left border border-slate-250 select-text transition-all overflow-y-auto"
            >
              {/* Header KOP */}
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-3 mb-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {showCompanyLogo && (
                      compLogoUrl ? (
                        <img
                          src={compLogoUrl}
                          alt="Logo"
                          className={`object-contain ${
                            logoSize === "huge" ? "max-h-16 max-w-[170px]" : logoSize === "large" ? "max-h-13 max-w-[140px]" : logoSize === "compact" ? "max-h-9 max-w-[100px]" : logoSize === "tiny" ? "max-h-7 max-w-[80px]" : "max-h-11 max-w-[120px]"
                          }`}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-900 text-white rounded font-black flex items-center justify-center text-xs">
                          {compName.substring(0, 2).toUpperCase()}
                        </div>
                      )
                    )}
                    <h2 className="text-xs font-black text-slate-900 tracking-tight">
                      {compName}
                    </h2>
                  </div>
                  <p className="text-[8px] text-slate-500 font-bold leading-tight max-w-sm">
                    {compAddress1}, {compAddress2}, {compCityZip}
                  </p>
                  <p className="text-[8px] text-slate-500 font-bold">Telp/WA: {compPhone} | {compEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-[7.5px] font-black uppercase text-indigo-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {compOffice}
                  </span>
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center my-3">
                <h2 className="text-sm font-black text-[#1e3a8a] tracking-wide uppercase inline-block border-b-2 border-[#1e3a8a] pb-0.5">
                  {type === "quotation" ? "SURAT PENAWARAN HARGA" : type === "invoice" ? "INVOICE / FAKTUR PENAGIHAN" : type === "po" ? "PURCHASE ORDER (PO)" : type === "surat_jalan" ? "SURAT JALAN" : "BOQ SPESIFIKASI"}
                </h2>
              </div>

              {/* SPH PREVIEW */}
              {type === "quotation" && (
                <div className="space-y-4">
                  {/* Metadata Box */}
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/80 text-[8px] grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">Kepada Yth</span><span className="w-3">:</span><span className="font-extrabold text-slate-900">{qRecipient || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">Up / Attn</span><span className="w-3">:</span><span className="font-bold text-slate-800">{qAttention || "-"}</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">No. SPH</span><span className="w-3">:</span><span className="font-extrabold text-slate-900">{qNum || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">Tanggal</span><span className="w-3">:</span><span className="font-bold text-slate-800">{qDate || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">Hal / Pekerjaan</span><span className="w-3">:</span><span className="font-bold text-slate-800">{qJobDesc || "-"}</span></div>
                    </div>
                  </div>

                  <p className="text-[7.5px] text-slate-600">Bersama ini kami sampaikan penawaran harga dengan rincian spesifikasi sebagai berikut:</p>

                  {/* SPH Table */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse text-[8px]">
                      <thead className="bg-[#1e3a8a] text-white">
                        <tr className="border-b border-[#172554] font-bold text-white">
                          <th className="px-2 py-1.5 text-center w-8">NO</th>
                          <th className="px-2 py-1.5">URAIAN PEKERJAAN</th>
                          <th className="px-2 py-1.5 text-center w-10">VOL</th>
                          <th className="px-2 py-1.5 text-center w-12">SATUAN</th>
                          <th className="px-2 py-1.5 text-right w-24">HARGA SATUAN</th>
                          <th className="px-2 py-1.5 text-right w-24">TOTAL BIAYA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {qItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 align-top">
                            <td className="px-2 py-1 text-center font-bold">{idx + 1}</td>
                            <td className="px-2 py-1">
                              <div className="font-black text-slate-900 uppercase text-[8px]">{item.description}</div>
                              {item.specifications && (() => {
                                let specs: { key: string; value: string }[] = [];
                                if (Array.isArray(item.specifications)) specs = item.specifications;
                                else if (typeof item.specifications === "string") {
                                  specs = item.specifications.split("\n").filter(Boolean).map((l: string) => {
                                    const parts = l.split(":");
                                    return { key: parts[0]?.trim() || "", value: parts.slice(1).join(":")?.trim() || "" };
                                  });
                                }
                                const validSpecs = specs.filter(s => s && (s.key || s.value));
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
                            <td className="px-2 py-1 text-center font-bold">{item.vol || 1}</td>
                            <td className="px-2 py-1 text-center font-bold">{item.unit || "Unit"}</td>
                            <td className="px-2 py-1 text-right font-mono">Rp {(item.unitPrice || 0).toLocaleString("id-ID")}</td>
                            <td className="px-2 py-1 text-right font-mono font-black">Rp {((item.vol || 1) * (item.unitPrice || 0)).toLocaleString("id-ID")}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 border-t border-slate-300 font-bold text-slate-800">
                          <td colSpan={4} className="px-2 py-1 text-right">SUBTOTAL</td>
                          <td colSpan={2} className="px-2 py-1 text-right font-mono font-black">Rp {qSubtotal.toLocaleString("id-ID")}</td>
                        </tr>
                        {includeShipping && (
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={4} className="px-2 py-1 text-right">{shippingLabel || "ONGKOS KIRIM / PENGIRIMAN"}</td>
                            <td colSpan={2} className="px-2 py-1 text-right font-mono font-black">Rp {Number(shippingCost || 0).toLocaleString("id-ID")}</td>
                          </tr>
                        )}
                        {includePPN && (
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={4} className="px-2 py-1 text-right">PPN {taxRate}%</td>
                            <td colSpan={2} className="px-2 py-1 text-right font-mono font-black">Rp {qTax.toLocaleString("id-ID")}</td>
                          </tr>
                        )}
                        <tr className="bg-[#1e3a8a] text-white font-black">
                          <td colSpan={4} className="px-2 py-1 text-right">GRAND TOTAL</td>
                          <td colSpan={2} className="px-2 py-1 text-right font-mono">Rp {qGrandTotal.toLocaleString("id-ID")}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <p className="text-[7.5px] italic text-slate-600">*Terbilang: {numberToWordsID(qGrandTotal)} rupiah</p>

                  {/* Notes & Terms */}
                  {showTncNotes && (qNotes || qPaymentTerms) && (
                    <div className="border border-slate-200 p-2.5 rounded bg-slate-50/60 text-[7.5px] space-y-1.5">
                      {qNotes && <div><span className="font-bold text-slate-800">Catatan:</span> <span className="text-slate-600 whitespace-pre-wrap">{qNotes}</span></div>}
                      {qPaymentTerms && <div><span className="font-bold text-slate-800">Term of Payment:</span> <span className="text-slate-600 whitespace-pre-wrap">{qPaymentTerms}</span></div>}
                    </div>
                  )}

                  {/* Signature */}
                  <div className={`pt-2 ${sigAlign === "center" ? "text-center" : "text-left"}`}>
                    <p className="text-[8px] text-slate-600">Hormat kami,</p>
                    <p className="text-[8.5px] font-bold text-slate-900">{compName}</p>
                    {qDigitalSigUrl && showDigitalStamp ? (
                      <div className={`py-1 flex ${sigAlign === "center" ? "justify-center" : "justify-start"}`}>
                        <img src={qDigitalSigUrl} alt="TTD" className="max-h-12 object-contain" />
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}
                    <p className="text-[8px] font-black text-slate-900 inline-block border-b border-slate-800 pb-0.5 tracking-wider">
                      {qPreparedBy.toUpperCase()}
                    </p>
                    <p className="text-[7.5px] text-slate-500 font-medium">{qPreparedByTitle}</p>
                  </div>
                </div>
              )}

              {/* INVOICE PREVIEW */}
              {type === "invoice" && (
                <div className="space-y-4">
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/80 text-[8px] grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">Ditagihkan Kepada</span><span className="w-3">:</span><span className="font-extrabold text-slate-900">{invRecipient || "-"}</span></div>
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">Up / Attn</span><span className="w-3">:</span><span className="font-bold text-slate-800">{invAttention || "-"}</span></div>
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">Alamat Klien</span><span className="w-3">:</span><span className="font-bold text-slate-800">{invAddress || "-"}</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">No. Invoice</span><span className="w-3">:</span><span className="font-extrabold text-slate-900">{invNum || "-"}</span></div>
                      {invPoRef && invPoRef !== "-" && (
                        <div className="flex"><span className="w-20 text-slate-500 font-bold">Ref. Dokumen</span><span className="w-3">:</span><span className="font-bold text-indigo-700">{invPoRef}</span></div>
                      )}
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">Tanggal</span><span className="w-3">:</span><span className="font-bold text-slate-800">{invDate || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">Jatuh Tempo</span><span className="w-3">:</span><span className="font-bold text-slate-800">{invDueDate || "-"}</span></div>
                    </div>
                  </div>

                  <table className="w-full text-left border border-slate-300 text-[8px]">
                    <thead className="bg-[#1e3a8a] text-white">
                      <tr>
                        <th className="px-2 py-1.5 text-center w-8">NO</th>
                        <th className="px-2 py-1.5">DESKRIPSI TAGIHAN</th>
                        <th className="px-2 py-1.5 text-center w-12">QTY</th>
                        <th className="px-2 py-1.5 text-center w-14">SATUAN</th>
                        <th className="px-2 py-1.5 text-right w-24">HARGA SATUAN</th>
                        <th className="px-2 py-1.5 text-right w-24">TOTAL BIAYA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {invItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-2 py-1 text-center font-bold">{idx + 1}</td>
                          <td className="px-2 py-1 font-bold text-slate-900">
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
                              const validSpecs = specs.filter(s => s && (s.key || s.value));
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
                          <td className="px-2 py-1 text-center font-bold">{item.qty || 1}</td>
                          <td className="px-2 py-1 text-center font-bold">{item.unit || "Unit"}</td>
                          <td className="px-2 py-1 text-right font-mono">Rp {Number(item.price || 0).toLocaleString("id-ID")}</td>
                          <td className="px-2 py-1 text-right font-mono font-black">Rp {((Number(item.qty) || 1) * (Number(item.price) || 0)).toLocaleString("id-ID")}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan={4} className="px-2 py-1 text-right">SUBTOTAL</td>
                        <td colSpan={2} className="px-2 py-1 text-right font-mono font-black">Rp {invSubtotal.toLocaleString("id-ID")}</td>
                      </tr>
                      {includeShipping && (
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={4} className="px-2 py-1 text-right">{shippingLabel}</td>
                          <td colSpan={2} className="px-2 py-1 text-right font-mono font-black">Rp {Number(shippingCost || 0).toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                      {includePPN && (
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={4} className="px-2 py-1 text-right">PPN {taxRate}%</td>
                          <td colSpan={2} className="px-2 py-1 text-right font-mono font-black">Rp {invTax.toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                      <tr className="bg-[#1e3a8a] text-white font-black">
                        <td colSpan={4} className="px-2 py-1 text-right">TOTAL TAGIHAN</td>
                        <td colSpan={2} className="px-2 py-1 text-right font-mono">Rp {invGrandTotal.toLocaleString("id-ID")}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="border border-slate-200 p-2.5 rounded bg-slate-50 text-[7.5px] space-y-0.5">
                    <p className="font-bold text-indigo-900">Pembayaran Transfer: Bank {invBankName} - Rek. {invBankNumber} a/n {invBankHolder}</p>
                    <p className="text-slate-500 whitespace-pre-wrap">{invNotes}</p>
                  </div>

                  <div className={`pt-2 ${sigAlign === "center" ? "text-center" : "text-left"}`}>
                    <p className="text-[8px] text-slate-600">Hormat kami,</p>
                    <p className="text-[8.5px] font-bold text-slate-900">{compName}</p>
                    {qDigitalSigUrl && showDigitalStamp ? (
                      <div className={`py-1 flex ${sigAlign === "center" ? "justify-center" : "justify-start"}`}>
                        <img src={qDigitalSigUrl} alt="TTD" className="max-h-12 object-contain" />
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}
                    <p className="text-[8px] font-black text-slate-900 inline-block border-b border-slate-800 pb-0.5 tracking-wider">{qPreparedBy.toUpperCase()}</p>
                    <p className="text-[7.5px] text-slate-500 font-medium">{qPreparedByTitle}</p>
                  </div>
                </div>
              )}

              {/* PURCHASE ORDER PREVIEW */}
              {type === "po" && (
                <div className="space-y-4">
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/80 text-[8px] grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">Vendor / Supplier</span><span className="w-3">:</span><span className="font-extrabold text-slate-900">{poVendorName || "-"}</span></div>
                      <div className="flex"><span className="w-24 text-slate-500 font-bold">Alamat Vendor</span><span className="w-3">:</span><span className="font-bold text-slate-800">{poVendorAddress || "-"}</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">No. PO</span><span className="w-3">:</span><span className="font-extrabold text-slate-900">{poNo || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">Tanggal PO</span><span className="w-3">:</span><span className="font-bold text-slate-800">{poDate || "-"}</span></div>
                      <div className="flex"><span className="w-20 text-slate-500 font-bold">Batas Kirim</span><span className="w-3">:</span><span className="font-bold text-slate-800">{poDeliveryDate || "-"}</span></div>
                    </div>
                  </div>

                  <table className="w-full text-left border border-slate-300 text-[8px]">
                    <thead className="bg-[#1e3a8a] text-white">
                      <tr>
                        <th className="px-2 py-1.5 text-center w-8">NO</th>
                        <th className="px-2 py-1.5">DESKRIPSI BARANG</th>
                        <th className="px-2 py-1.5 text-center w-12">QTY</th>
                        <th className="px-2 py-1.5 text-center w-14">SATUAN</th>
                        <th className="px-2 py-1.5 text-right w-24">HARGA SATUAN</th>
                        <th className="px-2 py-1.5 text-right w-24">TOTAL HARGA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {poItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-2 py-1 text-center font-bold">{idx + 1}</td>
                          <td className="px-2 py-1 font-bold text-slate-900">{item.description || item.name}</td>
                          <td className="px-2 py-1 text-center font-bold">{item.qty || 1}</td>
                          <td className="px-2 py-1 text-center font-bold">{item.unit || "Unit"}</td>
                          <td className="px-2 py-1 text-right font-mono">Rp {Number(item.price || 0).toLocaleString("id-ID")}</td>
                          <td className="px-2 py-1 text-right font-mono font-black">Rp {((Number(item.qty) || 1) * (Number(item.price) || 0)).toLocaleString("id-ID")}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan={4} className="px-2 py-1 text-right">SUBTOTAL</td>
                        <td colSpan={2} className="px-2 py-1 text-right font-mono font-black">Rp {poSubtotal.toLocaleString("id-ID")}</td>
                      </tr>
                      {includeShipping && (
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={4} className="px-2 py-1 text-right">{shippingLabel}</td>
                          <td colSpan={2} className="px-2 py-1 text-right font-mono font-black">Rp {Number(shippingCost || 0).toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                      {includePPN && (
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={4} className="px-2 py-1 text-right">PPN {taxRate}%</td>
                          <td colSpan={2} className="px-2 py-1 text-right font-mono font-black">Rp {poTax.toLocaleString("id-ID")}</td>
                        </tr>
                      )}
                      <tr className="bg-[#1e3a8a] text-white font-black">
                        <td colSpan={4} className="px-2 py-1 text-right">TOTAL PO</td>
                        <td colSpan={2} className="px-2 py-1 text-right font-mono">Rp {poGrandTotal.toLocaleString("id-ID")}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div>
                      <p className="text-[8px] font-bold text-slate-800">Disetujui Oleh:</p>
                      <p className="text-[8px] text-slate-600">{compName}</p>
                      <div className="h-10" />
                      <p className="text-[8px] font-black text-slate-900 border-b border-slate-800 inline-block pb-0.5">{poSignerName}</p>
                      <p className="text-[7px] text-slate-500">{poSignerRole}</p>
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
              {type === "surat_jalan" && (
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

                  <table className="w-full text-left border border-slate-300 text-[8px]">
                    <thead className="bg-[#1e3a8a] text-white">
                      <tr>
                        <th className="px-2 py-1.5 text-center w-8">NO</th>
                        <th className="px-2 py-1.5">NAMA BARANG & SPESIFIKASI</th>
                        <th className="px-2 py-1.5 text-center w-16">JUMLAH</th>
                        <th className="px-2 py-1.5 text-center w-16">SATUAN</th>
                        <th className="px-2 py-1.5 text-center w-32">KONDISI / KETERANGAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sjItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-2 py-1 text-center font-bold">{idx + 1}</td>
                          <td className="px-2 py-1 font-bold text-slate-900">
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
                              const validSpecs = specs.filter(s => s && (s.key || s.value));
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
                          <td className="px-2 py-1 text-center font-bold">{item.qty || 1}</td>
                          <td className="px-2 py-1 text-center font-bold">{item.unit || "Unit"}</td>
                          <td className="px-2 py-1 text-center text-slate-600 font-medium">{item.condition || "Baik & Lengkap"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p className="text-[7.5px] italic text-slate-600">Catatan: {sjNotes}</p>

                  {/* 2 KOLOM TANDA TANGAN SURAT JALAN (PENGEMUDI DIHAPUS) */}
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
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Request 1: Mengedit nama file sebelum didownload) */}
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
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-lg text-xs font-mono font-bold text-white outline-none w-full sm:w-72"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Batal
            </button>
            {(onSaveQuotation || onSaveInvoice || onSavePo || onSaveSuratJalan) && (
              <button
                onClick={handleSaveOnly}
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={14} className="text-emerald-200" />
                )}
                <span>Simpan Dokumen</span>
              </button>
            )}
            <button
              onClick={handleGeneratePDF}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Download size={14} className="text-indigo-200" /> Unduh Dokumen PDF
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
