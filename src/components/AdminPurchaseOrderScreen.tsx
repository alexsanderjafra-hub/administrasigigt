import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Edit2,
  Eye,
  X,
  PlusCircle,
  MinusCircle,
  FileDown,
  Building2,
  CheckCircle,
  FileCheck,
  AlertCircle,
  ChevronLeft,
  FileSpreadsheet,
  Percent
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PurchaseOrder, PurchaseOrderItem, ScreenId, Quotation, DebtRecord } from "../types";
import { dbService } from "../services/db";
import { saveDebtOverride } from "../services/financialStorage";
import { normalizeContactName } from "../utils/contactHelper";
import { getNextDebtCustomId } from "../App";
import { DocumentPreviewModal } from "./DocumentPreviewModal";

interface AdminPurchaseOrderScreenProps {
  onNavigate: (s: ScreenId) => void;
  currentUser: any;
  logActivity?: (message: string, action: string, details: string) => Promise<void>;
  quotations?: Quotation[];
  selectedQuotationForPO?: Quotation | null;
  setSelectedQuotationForPO?: (q: Quotation | null) => void;
  debtRecords?: DebtRecord[];
  setDebtRecords?: React.Dispatch<React.SetStateAction<DebtRecord[]>>;
}

export const AdminPurchaseOrderScreen: React.FC<AdminPurchaseOrderScreenProps> = ({
  onNavigate,
  currentUser,
  logActivity,
  quotations = [],
  selectedQuotationForPO,
  setSelectedQuotationForPO,
  debtRecords = [],
  setDebtRecords,
}) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form" | "preview">("list");
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selection for edit/preview
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Form States
  const [poNo, setPoNo] = useState("");
  const [date, setDate] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [buyerName, setBuyerName] = useState("PT. GARDA INOVASI GLOBALTECH");
  const [buyerAddress, setBuyerAddress] = useState(
    "Perumahan Griya Sepatan Blok B6 Nomor 35\nRT.02/09, Ds. Pisangan Jaya, Kec. Sepatan,\nKab Tangerang, Banten, 15525"
  );
  const [buyerEmail, setBuyerEmail] = useState("pt.gardainovasiglobaltech@gmail.com");
  const [buyerPhone, setBuyerPhone] = useState("0888-1687-794");
  const [note, setNote] = useState("- Harga sudah termasuk ongkos pengiriman");
  const [signerName, setSignerName] = useState("Jidan Ramadhan");
  const [signerRole, setSignerRole] = useState("Direktur / Menyetujui");
  const [ppnPercent, setPpnPercent] = useState<number>(11);
  const [includePPN, setIncludePPN] = useState(true);
  const [status, setStatus] = useState<"DRAFT" | "SENT" | "ACC" | "COMPLETED" | "CANCELLED">("DRAFT");
  
  // Ongkir / Pengiriman fleksibel (Request 2) & Preview (Request 3)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [includeShipping, setIncludeShipping] = useState(false);
  const [shippingLabel, setShippingLabel] = useState("ONGKOS PENGIRIMAN SUPPLIER");
  const [shippingCost, setShippingCost] = useState(0);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  // Diskon (Persen & Nominal Rupiah seperti di SPH dan Invoice)
  const [includeDiscount, setIncludeDiscount] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState<"percent" | "rupiah">("rupiah");
  const [discountVal, setDiscountVal] = useState<number>(0);

  // SPH (Surat Penawaran Harga) Import States
  const [localQuotations, setLocalQuotations] = useState<Quotation[]>(quotations || []);
  const [isImportSPHModalOpen, setIsImportSPHModalOpen] = useState(false);
  const [sphSearchTerm, setSphSearchTerm] = useState("");
  const [sphStatusFilter, setSphStatusFilter] = useState("ALL");
  const [sphRefNumber, setSphRefNumber] = useState("");

  const [ketentuan, setKetentuan] = useState<string[]>([
    "Pembayaran : Pelunasan 100% saat barang diterima dan dokumentasi penagihan dokumentasi penagihan diterima dengan baik, lengkap diterima dengan baik, lengkap dan benar oleh PT. GARDA INOVASI GLOBALTECH",
    "Dokumentasi Penagihan :\n- Invoice Asli Bermaterai Jika Tagihan diatas Rp. 5.000.000,-\n- Copy PO yang sudah ditandatangani dan stampel oleh Supplier\n- Surat Jalan",
    "Segala Bentuk Kehilangan dan Kerusakan Barang sebelum serah terima pada tujuan akhir menjadi tanggungjawab pihak Suplier"
  ]);

  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { no: 1, description: 'Biological treatment bacteria " biology genesys " for STP & Grease Trap', qty: 2, unit: "Kg", price: 3000000, total: 6000000 }
  ]);

  // Toast Notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const previewRef = useRef<HTMLDivElement>(null);

  // Helper Terbilang
  const numberToWordsID = (num: number): string => {
    const values = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    const toWords = (n: number): string => {
      if (n < 12) return values[n];
      if (n < 20) return `${toWords(n - 10)} belas`;
      if (n < 100) return `${toWords(Math.floor(n / 10))} puluh ${toWords(n % 10)}`.trim();
      if (n < 200) return `seratus ${toWords(n - 100)}`.trim();
      if (n < 1000) return `${toWords(Math.floor(n / 100))} ratus ${toWords(n % 100)}`.trim();
      if (n < 2000) return `seribu ${toWords(n - 1000)}`.trim();
      if (n < 1000000) return `${toWords(Math.floor(n / 1000))} ribu ${toWords(n % 1000)}`.trim();
      if (n < 1000000000) return `${toWords(Math.floor(n / 1000000))} juta ${toWords(n % 1000000)}`.trim();
      return `${toWords(Math.floor(n / 1000000000))} milyar ${toWords(n % 1000000000)}`.trim();
    };
    if (num <= 0) return "nol rupiah";
    return `${toWords(Math.floor(num))} rupiah`.toUpperCase();
  };

  // Trigger Toast Helper
  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Real-time Sync purchaseOrders from Firestore
  useEffect(() => {
    const unsubscribe = dbService.onCollectionSnapshot<PurchaseOrder>(
      "purchaseOrders",
      (data) => {
        setPurchaseOrders(data);
        setLoading(false);
      },
      // Order by timestamp or date
    );
    return () => unsubscribe();
  }, []);

  // Autofill next PO number
  const generatePONumber = () => {
    const totalPos = purchaseOrders.length;
    const year = new Date().getFullYear();
    const months = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const monthRoman = months[new Date().getMonth()];
    const nextNum = String(totalPos + 1).padStart(2, '0');
    return `${nextNum}/PO-GIGT/${monthRoman}/${year}`;
  };

  // Open Form for Create
  const handleCreateNew = () => {
    setPoNo(generatePONumber());
    setDate(new Date().toISOString().split("T")[0]);
    setVendorName("");
    setVendorAddress("");
    setBuyerName("PT. GARDA INOVASI GLOBALTECH");
    setBuyerAddress(
      "Perumahan Griya Sepatan Blok B6 Nomor 35\nRT.02/09, Ds. Pisangan Jaya, Kec. Sepatan,\nKab Tangerang, Banten, 15525"
    );
    setBuyerEmail("pt.gardainovasiglobaltech@gmail.com");
    setBuyerPhone("0888-1687-794");
    setNote("- Harga sudah termasuk ongkos pengiriman");
    setSignerName("Jidan Ramadhan");
    setSignerRole("Direktur / Menyetujui");
    setPpnPercent(11);
    setIncludePPN(true);
    setIncludeShipping(false);
    setShippingLabel("ONGKOS PENGIRIMAN SUPPLIER");
    setShippingCost(0);
    setStatus("DRAFT");
    setKetentuan([
      "Pembayaran : Pelunasan 100% saat barang diterima dan dokumentasi penagihan dokumentasi penagihan diterima dengan baik, lengkap diterima dengan baik, lengkap dan benar oleh PT. GARDA INOVASI GLOBALTECH",
      "Dokumentasi Penagihan :\n- Invoice Asli Bermaterai Jika Tagihan diatas Rp. 5.000.000,-\n- Copy PO yang sudah ditandatangani dan stampel oleh Supplier\n- Surat Jalan",
      "Segala Bentuk Kehilangan dan Kerusakan Barang sebelum serah terima pada tujuan akhir menjadi tanggungjawab pihak Suplier"
    ]);
    setItems([
      { no: 1, description: "", qty: 1, unit: "Pcs", price: 0, total: 0 }
    ]);
    setSelectedPO(null);
    setView("form");
  };

  // Open Form for Edit
  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setPoNo(po.poNo);
    setDate(po.date);
    setVendorName(po.vendorName);
    setVendorAddress(po.vendorAddress);
    setBuyerName(po.buyerName || "PT. GARDA INOVASI GLOBALTECH");
    setBuyerAddress(po.buyerAddress || "");
    setBuyerEmail(po.buyerEmail || "");
    setBuyerPhone(po.buyerPhone || "");
    setNote(po.note || "");
    setSignerName(po.signerName || "Jidan Ramadhan");
    setSignerRole(po.signerRole || "Direktur / Menyetujui");
    setPpnPercent(po.ppnPercent !== undefined ? po.ppnPercent : 11);
    setIncludePPN(po.ppnPercent !== undefined ? po.ppnPercent > 0 : true);
    setIncludeShipping((po as any).includeShipping || false);
    setShippingLabel((po as any).shippingLabel || "ONGKOS PENGIRIMAN SUPPLIER");
    setShippingCost((po as any).shippingCost || 0);
    if ((po as any).logoImage) setLogoImage((po as any).logoImage);
    setStatus(po.status || "DRAFT");
    setKetentuan(po.ketentuan || []);
    setItems(po.items || []);
    setView("form");
  };

  // View Preview in DocumentPreviewModal (Request 1 & 3)
  const handlePreview = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setPoNo(po.poNo);
    setDate(po.date);
    setVendorName(po.vendorName);
    setVendorAddress(po.vendorAddress);
    setBuyerName(po.buyerName || "PT. GARDA INOVASI GLOBALTECH");
    setBuyerAddress(po.buyerAddress || "");
    setBuyerEmail(po.buyerEmail || "");
    setBuyerPhone(po.buyerPhone || "");
    setNote(po.note || "");
    setSignerName(po.signerName || "Jidan Ramadhan");
    setSignerRole(po.signerRole || "Direktur / Menyetujui");
    setPpnPercent(po.ppnPercent !== undefined ? po.ppnPercent : 11);
    setIncludePPN(po.ppnPercent !== undefined ? po.ppnPercent > 0 : true);
    setIncludeShipping((po as any).includeShipping || false);
    setShippingLabel((po as any).shippingLabel || "ONGKOS PENGIRIMAN SUPPLIER");
    setShippingCost((po as any).shippingCost || 0);
    if ((po as any).logoImage) setLogoImage((po as any).logoImage);
    setStatus(po.status || "DRAFT");
    setKetentuan(po.ketentuan || []);
    setItems(po.items || []);
    setIsPreviewOpen(true);
  };

  // Delete PO
  const handleDelete = async (id: string, poNumber: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus PO No. ${poNumber}?`)) {
      try {
        await dbService.deleteDocument("purchaseOrders", id);
        triggerToast(`PO No. ${poNumber} berhasil dihapus!`, "success");
        if (logActivity) {
          await logActivity(
            `Menghapus Purchase Order No. ${poNumber}`,
            "DELETE",
            `PO ID: ${id}`
          );
        }
      } catch (err) {
        triggerToast("Gagal menghapus Purchase Order", "error");
      }
    }
  };

  // Form Row Actions
  const handleAddItemRow = () => {
    const nextNo = items.length + 1;
    setItems([...items, { no: nextNo, description: "", qty: 1, unit: "Pcs", price: 0, total: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) {
      triggerToast("Minimal harus ada 1 item barang", "error");
      return;
    }
    const updated = items.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      no: idx + 1
    }));
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const updated = [...items];
    const item = updated[index];
    
    if (field === "qty" || field === "price") {
      const valNum = Number(value) || 0;
      item[field] = valNum as never;
      item.total = item.qty * item.price;
    } else {
      item[field] = value as never;
    }
    
    setItems(updated);
  };

  // Ketentuan Item Actions
  const handleAddKetentuanRow = () => {
    setKetentuan([...ketentuan, ""]);
  };

  const handleRemoveKetentuanRow = (index: number) => {
    if (ketentuan.length === 1) return;
    setKetentuan(ketentuan.filter((_, i) => i !== index));
  };

  const handleKetentuanChange = (index: number, value: string) => {
    const updated = [...ketentuan];
    updated[index] = value;
    setKetentuan(updated);
  };

  // Calculations
  const totalPrice = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const ppnAmount = includePPN ? Math.round((totalPrice * ppnPercent) / 100) : 0;
  const shippingAmount = includeShipping ? Number(shippingCost || 0) : 0;
  const grandTotal = totalPrice + ppnAmount + shippingAmount;

  // Save Form
  const handleSave = async (e?: React.FormEvent, openPreview: boolean = false) => {
    if (e) e.preventDefault();
    if (!poNo || !date || !vendorName || !vendorAddress) {
      triggerToast("Mohon lengkapi semua field utama (No PO, Tanggal, Nama & Alamat Vendor)!", "error");
      return;
    }

    // Validate Items
    const invalidItem = items.find(it => !it.description.trim() || it.qty <= 0 || it.price <= 0);
    if (invalidItem) {
      triggerToast(`Mohon isi deskripsi, kuantitas, dan harga yang valid untuk semua item barang!`, "error");
      return;
    }

    const payload: any = {
      poNo,
      date,
      vendorName,
      vendorAddress,
      buyerName,
      buyerAddress,
      buyerEmail,
      buyerPhone,
      items,
      note,
      ketentuan: ketentuan.filter(k => k.trim() !== ""),
      signerName,
      signerRole,
      totalPrice,
      ppnPercent: includePPN ? ppnPercent : 0,
      ppnAmount,
      includeShipping,
      shippingLabel,
      shippingCost: includeShipping ? Number(shippingCost || 0) : 0,
      grandTotal,
      status,
      logoImage,
      timestamp: Date.now()
    };

    try {
      if (selectedPO?.id) {
        // Update
        await dbService.updateDocument("purchaseOrders", selectedPO.id, payload);
        triggerToast(`PO No. ${poNo} berhasil diperbarui!`, "success");
        if (logActivity) {
          await logActivity(
            `Memperbarui Purchase Order No. ${poNo}`,
            "UPDATE",
            `PO ID: ${selectedPO.id}`
          );
        }
      } else {
        // Create
        const docRef = await dbService.createDocument("purchaseOrders", payload);
        const newId = typeof docRef === "string" ? docRef : (docRef as any)?.id || `po-${Date.now()}`;
        setSelectedPO({ ...payload, id: newId });
        triggerToast(`PO No. ${poNo} berhasil disimpan!`, "success");
        if (logActivity) {
          await logActivity(
            `Membuat Purchase Order Baru No. ${poNo}`,
            "CREATE",
            `Vendor: ${vendorName}`
          );
        }
        if (status === "ACC") {
          await syncDebtForPO(newId, payload);
        }
      }
      if (selectedPO?.id && status === "ACC") {
        await syncDebtForPO(selectedPO.id, payload);
      }
      if (openPreview) {
        setIsPreviewOpen(true);
      } else {
        setView("list");
      }
    } catch (err) {
      triggerToast("Gagal menyimpan Purchase Order ke database", "error");
    }
  };

  const syncDebtForPO = async (poId: string, poData: any) => {
    try {
      const existingDebt = (debtRecords || []).find(d => 
        (d as any).originPoId === poId || 
        d.customId === `PO-${poData.poNo}` || 
        (d.title && d.title.includes(poData.poNo))
      );

      if (!existingDebt) {
        const nextCustomId = getNextDebtCustomId(debtRecords || [], "HUTANG");
        const itemsSummary = poData.items?.map((i: any) => `${i.description} (${i.qty} ${i.unit})`).join(", ") || "Pengadaan barang";
        const debtPayload: any = {
          id: `debt-po-${poId}`,
          customId: nextCustomId,
          type: "HUTANG",
          title: `[PO ${poData.poNo}] ${poData.vendorName}`,
          contactName: normalizeContactName(poData.vendorName),
          amount: Number(poData.grandTotal) || 0,
          dueDate: poData.date || new Date().toISOString().split("T")[0],
          status: "UNPAID",
          description: `Hutang perusahaan atas PO No. ${poData.poNo} kepada ${poData.vendorName} (${itemsSummary})`,
          recordedBy: poData.signerName || currentUser?.name || "Admin",
          timestamp: Date.now(),
          payments: [],
          originPoId: poId,
          originCustomId: poData.poNo,
          isUserCreated: true,
          isUserEdited: true,
          isManualEntry: true,
        };

        saveDebtOverride(debtPayload);
        await dbService.setDocument("debtRecords", debtPayload.id, debtPayload);
        if (setDebtRecords) {
          setDebtRecords(prev => [debtPayload, ...prev.filter(d => d.id !== debtPayload.id)]);
        }
      }
    } catch (e) {
      console.warn("syncDebtForPO warning:", e);
    }
  };

  const handleAccPO = async (po: PurchaseOrder) => {
    try {
      await dbService.updateDocument("purchaseOrders", po.id, { status: "ACC" });
      setPurchaseOrders(prev => prev.map(p => p.id === po.id ? { ...p, status: "ACC" } : p));
      await syncDebtForPO(po.id, { ...po, status: "ACC" });
      triggerToast(`PO No. ${po.poNo} berhasil di-ACC & otomatis masuk ke Menu Hutang!`, "success");
      if (logActivity) {
        await logActivity(`PO No. ${po.poNo} disetujui (ACC) dan tercatat di Menu Hutang PT`, "ACC", `Vendor: ${po.vendorName}`);
      }
    } catch (err) {
      console.error("Error ACC PO:", err);
      triggerToast("Gagal melakukan ACC PO", "error");
    }
  };

  // Download PDF via html2canvas and jsPDF
  const handleDownloadPDF = async () => {
    const target = previewRef.current;
    if (!target) return;

    triggerToast("Sedang menyiapkan file PDF...", "info");

    try {
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800 // Consistent width for A4 proportion rendering
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Adjust to fit in single page if height exceeds slightly, or handle multi-page if very tall
      if (imgHeight > pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, pdfHeight);
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      const fileName = `Purchase_Order_${poNo.replace(/[\/\s]/g, "_")}.pdf`;
      pdf.save(fileName);
      triggerToast("PDF berhasil di-download!", "success");
    } catch (error) {
      console.error(error);
      triggerToast("Gagal memproses PDF", "error");
    }
  };

  // Direct print option
  const handlePrint = () => {
    const target = previewRef.current;
    if (!target) return;

    const printContents = target.innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Purchase Order - ${poNo}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body {
                font-family: 'Inter', sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: A4;
                margin: 0;
              }
              .print-container {
                width: 210mm;
                min-height: 297mm;
                padding: 15mm 15mm;
                margin: 0 auto;
                background: white;
                box-sizing: border-box;
              }
            </style>
          </head>
          <body class="bg-white">
            <div class="print-container">
              ${printContents}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => {
                  window.frameElement.remove();
                }, 100);
              }
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  };

  // Filter purchase orders
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.buyerName && po.buyerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 w-full">
      {/* Toast Alert */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border ${
              toastType === "success" 
                ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                : toastType === "error"
                ? "bg-rose-50 border-rose-100 text-rose-800"
                : "bg-blue-50 border-blue-100 text-blue-800"
            }`}
          >
            {toastType === "success" && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            {toastType === "error" && <AlertCircle className="w-5 h-5 text-rose-600" />}
            {toastType === "info" && <FileCheck className="w-5 h-5 text-blue-600" />}
            <span className="text-sm font-bold tracking-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                Purchase Order (PO)
              </h1>
              <p className="text-sm font-semibold text-slate-400 mt-1">
                Sistem Pembuatan, Preview, & Pengunduhan Dokumen Purchase Order Perusahaan
              </p>
            </div>
          </div>
        </div>
        
        {view === "list" && (
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat PO Baru
          </button>
        )}

        {(view === "form" || view === "preview") && (
          <button
            onClick={() => setView("list")}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
            Kembali ke Daftar
          </button>
        )}
      </div>

      {/* View Content Switches */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400">Memuat data Purchase Order...</p>
          </div>
        ) : view === "list" ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan No. PO atau nama supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 w-full md:w-auto">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="SENT">TERKIRIM</option>
                    <option value="COMPLETED">SELESAI</option>
                    <option value="CANCELLED">BATAL</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Grid / Table */}
            {filteredPOs.length === 0 ? (
              <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-sm">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-800">Tidak ada Purchase Order ditemukan</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                  {searchTerm || statusFilter !== "ALL"
                    ? "Cobalah mengubah filter pencarian atau status Anda untuk menemukan dokumen."
                    : "Silakan buat dokumen Purchase Order pertama Anda dengan mengklik tombol 'Buat PO Baru'!"}
                </p>
                {(searchTerm || statusFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-6 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPOs.map((po) => (
                  <motion.div
                    key={po.id}
                    layoutId={`po-card-${po.id}`}
                    className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all flex flex-col relative overflow-hidden group"
                  >
                    {/* Corner Accent Decorator */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                    
                    {/* Header Card info */}
                    <div className="flex items-start justify-between relative z-10 mb-4">
                      <div>
                        <span className={`px-3 py-1 text-[9px] font-black tracking-widest rounded-full uppercase ${
                          po.status === "ACC"
                            ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                            : po.status === "COMPLETED" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : po.status === "SENT"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : po.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {po.status === "ACC" ? "✅ ACC (Hutang)" : (po.status || "DRAFT")}
                        </span>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight mt-3">
                          {po.poNo}
                        </h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">
                          Tanggal: {new Date(po.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-50 my-2" />

                    {/* Content */}
                    <div className="space-y-3 flex-1 relative z-10 py-2">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Supplier / Vendor
                        </p>
                        <p className="text-sm font-extrabold text-slate-800 line-clamp-1">
                          {po.vendorName}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center bg-slate-50/50 rounded-2xl p-4 mt-2">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Grand Total
                          </p>
                          <p className="text-lg font-black text-primary tracking-tight">
                            Rp {po.grandTotal.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Item Barang
                          </p>
                          <p className="text-sm font-black text-slate-700">
                            {po.items?.length || 0} Barang
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions button footer */}
                    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-50 relative z-10">
                      {po.status !== "ACC" ? (
                        <button
                          type="button"
                          onClick={() => handleAccPO(po)}
                          className="px-3.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          title="Setujui (ACC) PO ini dan otomatis masukkan ke Menu Hutang Perusahaan"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>ACC PO</span>
                        </button>
                      ) : (
                        <span className="px-3 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[9px] uppercase tracking-wider rounded-xl flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tercatat Hutang</span>
                        </span>
                      )}
                      <button
                        onClick={() => handlePreview(po)}
                        className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 bg-slate-900 text-white hover:bg-slate-800 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview & PDF
                      </button>
                      <button
                        onClick={() => handleEdit(po)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors active:scale-95 cursor-pointer"
                        title="Edit PO"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(po.id!, po.poNo)}
                        className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors active:scale-95 cursor-pointer"
                        title="Hapus PO"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : view === "form" ? (
          <div className="space-y-6 pb-20">
            {/* Top Command Action bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-w-5xl mx-auto">
              <button
                type="button"
                onClick={() => setView("list")}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                <ChevronLeft size={16} /> Kembali ke Daftar PO
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSave(undefined, false)}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle size={14} />
                  <span>Simpan PO</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(undefined, true)}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Eye size={14} />
                  <span>Simpan & Format PDF</span>
                </button>
              </div>
            </div>

            {/* DOKUMEN UTAMA: LAYOUT FORM INPUT PERSIS SEPERTI PENAWARAN (SPH) */}
            <form onSubmit={(e) => handleSave(e, true)} className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-5 sm:p-8 md:p-10 space-y-7 text-left font-sans text-slate-900 max-w-5xl mx-auto">
              
              {/* 1. KOP SURAT (ATAS): LOGO (KIRI) & PROFIL BUYER (KANAN) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start pb-5 border-b-2 border-slate-200">
                {/* Upload Logo Box */}
                <div className="md:col-span-4 space-y-2">
                  <input
                    type="file"
                    id="po-comp-logo-input"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLogoImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label
                    htmlFor="po-comp-logo-input"
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all group min-h-[120px]"
                  >
                    {logoImage ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <img src={logoImage} alt="Logo" className="max-h-20 object-contain" />
                        <span className="text-[10px] font-black text-indigo-600 group-hover:underline">Ganti Logo</span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <Building2 size={24} className="text-slate-400 mx-auto" />
                        <span className="text-xs font-black text-slate-700 block uppercase tracking-wider">Upload Logo</span>
                        <span className="text-[9px] text-slate-400 block font-semibold">Klik untuk memilih file logo (.png/.jpg)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Profil Buyer (Kanan) */}
                <div className="md:col-span-8 space-y-2 text-right">
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Nama Perusahaan Pembeli"
                    className="w-full text-right font-black text-base md:text-lg text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-800 outline-none pb-1"
                  />
                  <textarea
                    rows={2}
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="Alamat Perusahaan Pembeli"
                    className="w-full text-right text-xs font-semibold text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-800 outline-none resize-none leading-relaxed"
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2 text-xs font-bold text-slate-500">
                    <input
                      type="text"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="Telp: 0888-1687-794"
                      className="text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-800 outline-none text-xs"
                    />
                    <input
                      type="text"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="Email: pt.gigt@gmail.com"
                      className="text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-800 outline-none text-xs text-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* 2. BOX JUDUL DOKUMEN PERSIS SEPERTI GAMBAR */}
              <div className="flex justify-center my-2">
                <div className="bg-slate-900 text-white font-black px-8 py-2 rounded-2xl text-center uppercase tracking-widest text-sm shadow-md">
                  PURCHASE ORDER (PO)
                </div>
              </div>

              {/* 3. METADATA DUA KOLOM: KIRI (VENDOR SUPPLIER) & KANAN (DETAIL PO) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kolom Kiri: Vendor / Supplier */}
                <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="w-24 text-xs font-black text-slate-700 uppercase tracking-wider shrink-0">
                      SUPPLIER / VENDOR
                    </span>
                    <input
                      type="text"
                      required
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="Contoh: PT. Toolmate Enviro Indonesia"
                      className="flex-1 px-3.5 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:border-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className="w-24 text-xs font-black text-slate-700 uppercase tracking-wider shrink-0 pt-2">
                      ALAMAT VENDOR
                    </span>
                    <textarea
                      rows={2}
                      required
                      value={vendorAddress}
                      onChange={(e) => setVendorAddress(e.target.value)}
                      placeholder="Alamat lengkap supplier / vendor..."
                      className="flex-1 px-3.5 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-800 outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Kolom Kanan: Nomor PO, Tanggal, Status */}
                <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="w-24 text-xs font-black text-slate-700 uppercase tracking-wider shrink-0">
                      NOMOR PO
                    </span>
                    <input
                      type="text"
                      required
                      value={poNo}
                      onChange={(e) => setPoNo(e.target.value)}
                      placeholder="20/PO-GIGT/VII/2026"
                      className="flex-1 px-3.5 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 focus:border-slate-800 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="w-24 text-xs font-black text-slate-700 uppercase tracking-wider shrink-0">
                      TANGGAL
                    </span>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-slate-800 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="w-24 text-xs font-black text-slate-700 uppercase tracking-wider shrink-0">
                      STATUS PO
                    </span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="flex-1 px-3.5 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:border-slate-800 outline-none cursor-pointer"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="SENT">TERKIRIM (SENT)</option>
                      <option value="ACC">DISETUJUI / ACC (Otomatis Masuk Hutang PT)</option>
                      <option value="COMPLETED">SELESAI (COMPLETED)</option>
                      <option value="CANCELLED">BATAL (CANCELLED)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. TABEL ITEM BARANG / PESANAN (PERSIS SEPERTI GAMBAR PENAWARAN) */}
              <div className="space-y-3">
                <div className="overflow-x-auto border-2 border-slate-300 rounded-2xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-300 font-black text-slate-900 text-center uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-2 border-r-2 border-slate-300 w-12">NO</th>
                        <th className="py-3 px-3 border-r-2 border-slate-300">DESKRIPSI BARANG</th>
                        <th className="py-3 px-2 border-r-2 border-slate-300 w-24">QTY</th>
                        <th className="py-3 px-2 border-r-2 border-slate-300 w-24">SATUAN</th>
                        <th className="py-3 px-3 border-r-2 border-slate-300 w-40">HARGA SATUAN</th>
                        <th className="py-3 px-3 w-40">JUMLAH HARGA</th>
                        <th className="py-3 px-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-200">
                      {items.map((item, idx) => {
                        const itemTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
                        return (
                          <tr key={idx} className="align-top hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-2 text-center font-black text-slate-800 border-r-2 border-slate-300 text-xs">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 border-r-2 border-slate-300">
                              <input
                                type="text"
                                required
                                value={item.description}
                                onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                                placeholder="Nama barang / deskripsi produk yang dipesan"
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:border-slate-800 outline-none"
                              />
                            </td>
                            <td className="py-2.5 px-2 border-r-2 border-slate-300 text-center">
                              <input
                                type="number"
                                min={1}
                                required
                                value={item.qty}
                                onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center text-slate-900 focus:border-slate-800 outline-none font-mono"
                              />
                            </td>
                            <td className="py-2.5 px-2 border-r-2 border-slate-300 text-center">
                              <input
                                type="text"
                                required
                                value={item.unit}
                                onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                                placeholder="Pcs/Unit"
                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center text-slate-900 focus:border-slate-800 outline-none"
                              />
                            </td>
                            <td className="py-2.5 px-3 border-r-2 border-slate-300 text-right">
                              <input
                                type="number"
                                min={0}
                                required
                                value={item.price}
                                onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-right text-slate-900 focus:border-slate-800 outline-none"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 text-xs">
                              Rp {itemTotal.toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(idx)}
                                disabled={items.length <= 1}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-20 cursor-pointer"
                                title="Hapus Baris"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* BUTTON + Kolom DI BAWAH KANAN TABEL */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+ Kolom</span>
                  </button>
                </div>
              </div>

              {/* 5. BAGIAN BAWAH DUA KOLOM: KIRI (TERBILANG, CATATAN, KETENTUAN) & KANAN (TOTAL & CHECKLISTS) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pt-3 items-start border-t-2 border-slate-200">
                
                {/* SISI KIRI: TERBILANG, CATATAN, KETENTUAN */}
                <div className="md:col-span-7 space-y-4">
                  {/* TERBILANG BOX */}
                  <div className="space-y-1">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                      TERBILANG
                    </div>
                    <div className="p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-black text-slate-800 italic leading-relaxed">
                      {numberToWordsID(grandTotal)}
                    </div>
                  </div>

                  {/* CATATAN PO BOX */}
                  <div className="space-y-1">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                      CATATAN PO (NOTE)
                    </div>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Contoh: - Harga sudah termasuk ongkos pengiriman"
                      className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:border-slate-800 outline-none"
                    />
                  </div>

                  {/* KETENTUAN PO BOX */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        KETENTUAN PO (SYARAT & KETENTUAN)
                      </div>
                      <button
                        type="button"
                        onClick={handleAddKetentuanRow}
                        className="px-2.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md text-[10px] font-black uppercase cursor-pointer"
                      >
                        + Ketentuan
                      </button>
                    </div>
                    <div className="space-y-2">
                      {ketentuan.map((k, kIdx) => (
                        <div key={kIdx} className="flex gap-2 items-start">
                          <span className="text-xs font-bold text-slate-500 pt-2">{kIdx + 1}.</span>
                          <textarea
                            rows={2}
                            value={k}
                            onChange={(e) => handleKetentuanChange(kIdx, e.target.value)}
                            placeholder="Tulis butir ketentuan..."
                            className="flex-1 p-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:border-slate-800 outline-none resize-none leading-relaxed"
                          />
                          {ketentuan.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveKetentuanRow(kIdx)}
                              className="text-rose-500 hover:text-rose-700 p-2 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SISI KANAN: TOTAL, CHECKLIST PPN, CHECKLIST ONGKIR (REQUEST 2), GRAND TOTAL */}
                <div className="md:col-span-5 bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-slate-300 space-y-3 font-sans">
                  {/* ROW: TOTAL */}
                  <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      TOTAL HARGA BARANG
                    </span>
                    <span className="text-sm font-mono font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* ROW: CHECKLIST PPN */}
                  <div className="p-3 bg-white rounded-xl border border-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includePPN}
                          onChange={(e) => setIncludePPN(e.target.checked)}
                          className="w-5 h-5 rounded accent-slate-900 cursor-pointer"
                        />
                        <span className="text-xs font-black text-slate-800">
                          PPN ({ppnPercent}%)
                        </span>
                      </label>
                      <span className="text-xs font-mono font-black text-slate-900">
                        Rp {includePPN ? ppnAmount.toLocaleString("id-ID") : "0"}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      {includePPN ? `OTOMATIS * ${ppnPercent}%` : "(Tidak diceklis - Di PDF nominal Rp 0)"}
                    </div>
                  </div>

                  {/* ROW: CHECKLIST ONGKIR / BIAYA PENGIRIMAN SUPPLIER (REQUEST 2) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-300 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={includeShipping}
                          onChange={(e) => setIncludeShipping(e.target.checked)}
                          className="w-5 h-5 rounded accent-slate-900 cursor-pointer"
                        />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {includeShipping ? "TAMPILKAN:" : "MUNCULKAN:"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={shippingLabel}
                        onChange={(e) => setShippingLabel(e.target.value)}
                        placeholder="ONGKOS PENGIRIMAN SUPPLIER"
                        className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-black text-slate-900 outline-none focus:border-slate-800 focus:bg-white transition-all"
                        title="Klik untuk mengubah nama/tulisan biaya ini (contoh: ONGKIR, BIAYA EXPEDISI, dll.)"
                      />
                      <span className="text-xs font-mono font-black text-slate-900 shrink-0">
                        Rp {includeShipping ? Number(shippingCost || 0).toLocaleString("id-ID") : "0"}
                      </span>
                    </div>
                    {includeShipping ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">Nominal (Rp):</span>
                        <input
                          type="number"
                          min={0}
                          value={shippingCost || ""}
                          placeholder="0 (Jika tidak diisi tertulis Rp 0)"
                          onChange={(e) => setShippingCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-slate-800 focus:bg-white"
                        />
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-semibold italic">
                        (Tidak diceklis - Di PDF baris biaya ini TIDAK AKAN MUNCUL)
                      </div>
                    )}
                  </div>

                  {/* ROW: GRAND TOTAL */}
                  <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-md">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                      GRAND TOTAL
                    </span>
                    <span className="text-base font-mono font-black text-emerald-400">
                      Rp {grandTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. TANDA TANGAN (PERSIS SEPERTI GAMBAR PENAWARAN) */}
              <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6">
                <div className="text-xs text-slate-400 font-bold">
                  * PO ini sah dan berkekuatan hukum saat disetujui & dicap basah / digital oleh Direksi.
                </div>
                <div className="w-64 space-y-2 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    MENYETUJUI / PEMESAN
                  </div>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-slate-300 italic">(Tanda Tangan & Cap PT)</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Nama Penandatangan"
                    className="w-full px-2.5 py-1 text-center font-black text-xs text-slate-900 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    placeholder="Jabatan (e.g. Direktur)"
                    className="w-full px-2.5 py-1 text-center font-bold text-[10px] text-slate-500 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* 7. ACTION BUTTONS BOTTOM */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(undefined, false)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} />
                  <span>Simpan PO</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(undefined, true)}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye size={14} />
                  <span>Simpan & Format PDF</span>
                </button>
              </div>
            </form>
          </div>
        ) : view === "preview" && selectedPO ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Top Command Action bar */}
            <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl text-primary">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black tracking-tight text-lg">Pratinjau Purchase Order</h3>
                  <p className="text-xs font-semibold text-slate-300">
                    Sesuai dengan format dokumen PDF resmi PT. Garda Inovasi Globaltech
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Cetak / Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Document sheet template container */}
            <div className="bg-slate-100 py-10 px-4 rounded-[40px] flex justify-center overflow-x-auto shadow-inner">
              {/* Paper Layout representation */}
              <div 
                ref={previewRef}
                id="po-document-sheet"
                className="w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] shadow-2xl relative flex flex-col justify-between select-none"
                style={{
                  boxSizing: "border-box",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.5"
                }}
              >
                {/* PDF Content Area */}
                <div>
                  {/* Kop Surat Header */}
                  <div className="flex justify-between items-start mb-8">
                    {/* Brand Logo & Name */}
                    <div className="flex flex-col items-start">
                      {/* Stylized GT Logo */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-14 h-14 relative flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm">
                          <svg viewBox="0 0 100 100" className="w-11 h-11">
                            {/* Blue curved 'G' */}
                            <path d="M70,35 C60,20 30,20 20,45 C10,70 35,85 55,80 C70,75 75,55 55,55" fill="none" stroke="#1d4ed8" strokeWidth="12" strokeLinecap="round" />
                            {/* Dark black 'T' */}
                            <path d="M50,15 L90,15 M70,15 L70,85" fill="none" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
                            {/* Red Dot element */}
                            <circle cx="55" cy="55" r="8" fill="#e11d48" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-800 leading-none">PT. Garda Inovasi Globaltech</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Global Innovation Technology</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Document Title */}
                    <div className="text-right">
                      <h1 className="text-2xl font-extrabold italic tracking-tight text-slate-900 uppercase">
                        PURCHASE ORDER
                      </h1>
                    </div>
                  </div>

                  {/* To / From Addresses Grid */}
                  <div className="grid grid-cols-2 gap-8 mb-6 text-[10.5px]">
                    {/* Kepada / To */}
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-500">Kepada :</p>
                      <p className="font-black text-slate-900 text-xs uppercase">{selectedPO.vendorName}</p>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">{selectedPO.vendorAddress}</p>
                    </div>

                    {/* Dari / From */}
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-500">Dari :</p>
                      <p className="font-black text-slate-900 text-xs uppercase">{selectedPO.buyerName || "PT. GARDA INOVASI GLOBALTECH"}</p>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">{selectedPO.buyerAddress}</p>
                      {selectedPO.buyerPhone && <p className="text-slate-600">Telp: {selectedPO.buyerPhone}</p>}
                      {selectedPO.buyerEmail && (
                        <p className="text-blue-600 underline font-medium">{selectedPO.buyerEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Metadata Header Block */}
                  <div className="border-t border-b border-slate-200 py-3 mb-6 grid grid-cols-2 gap-4 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-600 w-16">No. PO</span>
                      <span className="text-slate-900 font-extrabold">: {selectedPO.poNo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-600 w-16">Tanggal</span>
                      <span className="text-slate-900 font-extrabold">
                        : {new Date(selectedPO.date).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-6">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-t-2 border-b-2 border-slate-950 bg-slate-50">
                          <th className="py-2.5 px-2 text-center font-bold text-slate-800 w-10">No</th>
                          <th className="py-2.5 px-3 font-bold text-slate-800">Deskripsi Barang</th>
                          <th className="py-2.5 px-2 text-center font-bold text-slate-800 w-16">QTY</th>
                          <th className="py-2.5 px-2 text-center font-bold text-slate-800 w-16">Satuan</th>
                          <th className="py-2.5 px-3 text-right font-bold text-slate-800 w-32">Harga Satuan</th>
                          <th className="py-2.5 px-3 text-right font-bold text-slate-800 w-36">Jumlah Harga</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPO.items?.map((item, idx) => (
                          <tr key={idx} className="align-top">
                            <td className="py-3 px-2 text-center font-medium text-slate-700">{idx + 1},</td>
                            <td className="py-3 px-3 text-slate-900 font-medium whitespace-pre-line leading-relaxed">{item.description}</td>
                            <td className="py-3 px-2 text-center text-slate-900 font-semibold">{item.qty}</td>
                            <td className="py-3 px-2 text-center text-slate-600">{item.unit}</td>
                            <td className="py-3 px-3 text-right text-slate-700 font-semibold">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Rp</span>
                                <span>{(item.price || 0).toLocaleString("id-ID")}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right text-slate-900 font-bold">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Rp</span>
                                <span>{(item.total || 0).toLocaleString("id-ID")}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        {/* Subtotal */}
                        <tr className="border-t border-slate-300">
                          <td colSpan={4} className="py-1 px-3"></td>
                          <td className="py-2 px-3 text-right font-bold text-slate-600">Total Harga</td>
                          <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Rp</span>
                              <span>{(selectedPO.totalPrice || 0).toLocaleString("id-ID")}</span>
                            </div>
                          </td>
                        </tr>
                        {/* PPN */}
                        {selectedPO.ppnPercent > 0 && (
                          <tr>
                            <td colSpan={4} className="py-1 px-3"></td>
                            <td className="py-1 px-3 text-right font-bold text-slate-600">PPN {selectedPO.ppnPercent}%</td>
                            <td className="py-1 px-3 text-right font-extrabold text-slate-900">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Rp</span>
                                <span>{(selectedPO.ppnAmount || 0).toLocaleString("id-ID")}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                        {/* Grand Total */}
                        <tr className="border-t-2 border-b-2 border-slate-950 bg-slate-50/50">
                          <td colSpan={4} className="py-1 px-3"></td>
                          <td className="py-2.5 px-3 text-right font-black uppercase tracking-wider text-slate-900">Grand Total</td>
                          <td className="py-2.5 px-3 text-right font-black text-primary text-sm">
                            <div className="flex justify-between">
                              <span className="text-primary/60">Rp</span>
                              <span>{(selectedPO.grandTotal || 0).toLocaleString("id-ID")}</span>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Note Section */}
                  {selectedPO.note && (
                    <div className="mb-6 text-[10px]">
                      <p className="font-extrabold text-slate-900 uppercase tracking-wider mb-1">Note :</p>
                      <p className="text-slate-700 italic font-medium">{selectedPO.note}</p>
                    </div>
                  )}

                  {/* Ketentuan Section */}
                  {selectedPO.ketentuan && selectedPO.ketentuan.length > 0 && (
                    <div className="mb-10 text-[9.5px] leading-relaxed">
                      <p className="font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">Ketentuan :</p>
                      <ol className="space-y-1 text-slate-700">
                        {selectedPO.ketentuan.map((k, idx) => (
                          <li key={idx} className="flex gap-1.5 items-start">
                            <span className="font-bold shrink-0">{idx + 1}.</span>
                            <span className="whitespace-pre-line">{k}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* Footer Signatures Area */}
                <div className="grid grid-cols-2 gap-8 pt-10 text-[10.5px]">
                  {/* Buyer Approved Signature (GT!) */}
                  <div className="flex flex-col items-start justify-end min-h-[120px] relative">
                    <p className="font-semibold text-slate-500 mb-2">Menyetujui</p>
                    
                    {/* Signed Stamp Overlay */}
                    <div className="absolute left-2 bottom-10 opacity-70 pointer-events-none select-none">
                      <div className="border-2 border-blue-500/80 text-blue-500/80 rounded-2xl p-2 rotate-[-8deg] flex flex-col items-center justify-center font-black text-[8px] uppercase tracking-wider bg-white/40 backdrop-blur-[1px] shadow-sm">
                        <span className="text-[7px]">PT. GARDA INOVASI GLOBALTECH</span>
                        <div className="w-10 h-10 my-0.5 relative flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-8 h-8">
                            <path d="M70,35 C60,20 30,20 20,45 C10,70 35,85 55,80 C70,75 75,55 55,55" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" />
                            <path d="M50,15 L90,15 M70,15 L70,85" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" />
                          </svg>
                        </div>
                        <span className="font-bold underline text-[7px]">{selectedPO.signerName}</span>
                        <span className="text-[6px] tracking-normal">DIGITALLY APPROVED</span>
                      </div>
                    </div>
                    
                    <p className="font-black text-slate-900 underline mt-12 relative z-10 uppercase">
                      {selectedPO.signerName}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest relative z-10 leading-none mt-0.5">
                      {selectedPO.signerRole || "Direktur"}
                    </p>
                  </div>

                  {/* Vendor Stamp (Blank signature) */}
                  <div className="flex flex-col items-center justify-end min-h-[120px]">
                    <p className="font-semibold text-slate-500 mb-12">Vendor / Supplier</p>
                    <div className="w-48 h-px bg-slate-900" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Interactive PDF Preview Modal (Request 1 & 3) */}
      <AnimatePresence>
        {isPreviewOpen && (
          <DocumentPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            type="po"
            initialPoData={{
              poNo,
              date,
              vendorName,
              vendorAddress,
              vendorPhone: "",
              buyerName,
              buyerAddress,
              buyerEmail,
              buyerPhone,
              items,
              note,
              ketentuan,
              signerName,
              signerRole,
              ppnPercent: includePPN ? ppnPercent : 0,
              includeShipping,
              shippingLabel,
              shippingCost: includeShipping ? Number(shippingCost || 0) : 0,
              total: grandTotal,
              logoImage
            }}
            onSavePo={async (updatedData) => {
              if (selectedPO?.id) {
                await dbService.updateDocument("purchaseOrders", selectedPO.id, updatedData);
                triggerToast("Perubahan PO berhasil diperbarui", "success");
              }
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
