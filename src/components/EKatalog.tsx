import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Plus, Grid, List, Filter, Trash2, Edit, FileText, ArrowLeft,
  ChevronLeft, ChevronRight, ArrowUpDown, Tag, Settings, Eye, Info, Check, X,
  FileCheck, Sparkles, AlertCircle, ShoppingBag, DollarSign, Calculator,
  Compass, ExternalLink, RefreshCw, Send, CheckSquare, Heart, Bookmark,
  TrendingUp, BarChart2, Briefcase, Layers, Box, HelpCircle, HardDrive, PhoneCall, BadgePercent,
  Printer, FileDown, Building, Upload, Image as ImageIcon
} from 'lucide-react';
import { dbService } from '../services/db';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DocumentPreviewModal } from './DocumentPreviewModal';

// Interfaces for relational design
export interface CatalogItem {
  id: string;
  name: string;
  sku: string; // Auto-generated code
  category: string;
  subCategory: string;
  type: 'barang' | 'jasa';
  brand: string;
  priceItem: number; // Harga barang / jual
  priceService: number; // Harga jasa
  priceInstallation: number; // Harga instalasi
  costPrice?: number; // Harga modal / HPP
  unit: string; // Satuan (pcs, set, lot, lot/meter, etc.)
  description: string;
  specifications: string; // Full specifications (newline list or serialized text)
  material: string;
  capacity: string;
  dimensions: string;
  power: string;
  flowRate: string;
  pressure: string;
  warranty: string;
  stockLocation: string; // Lokasi stok / lokasi kerja
  status: 'aktif' | 'nonaktif';
  createdBy: string;
  createdByName?: string;
  createdDate: string; // ISO String
  lastUpdate: string; // ISO String
  images: string[]; // Multiple image URLs
  pdfUrl?: string; // PDF Manual / Catalog URL
  pdfName?: string;
  detailWork?: string; // Detail pekerjaan
  includeWork?: string; // Include pekerjaan
  estimationTime?: string; // Estimasi pengerjaan
  views: number; // For item popularity stats
  neededItems?: { id?: string; name: string; qty: number; price: number }[];
  manpowerQty?: number;
  manpowerRate?: number;
  manpowerDays?: number;
}

// Preset Categories based on prompt
export const CATALOG_CATEGORIES = [
  { id: 'all', label: 'Semua Kategori', icon: Layers },
  { id: 'pompa', label: 'Pompa', icon: HardDrive, desc: 'Centrifugal Pump, Submersible, Dosing, Booster, etc.' },
  { id: 'blower', label: 'Blower', icon: RefreshCw, desc: 'Root Blower, Ring Blower, Turbo Blower, dll.' },
  { id: 'diffuser', label: 'Diffuser', icon: Compass, desc: 'Fine Bubble & Coarse Bubble Diffuser' },
  { id: 'dosing pump', label: 'Dosing Pump', icon: Sparkles, desc: 'Metoda dosing presisi bahan kimia STP/WTP' },
  { id: 'mbbr media', label: 'MBBR Media', icon: Box, desc: 'Media bakteri MBBR K1, K3, K5 Carrier' },
  { id: 'membrane', label: 'Membrane', icon: Layers, desc: 'Membran Sandfilter, Ultrafiltrasi, RO, MBR' },
  { id: 'panel listrik', label: 'Panel Listrik', icon: Settings, desc: 'Panel SDP, ATS/AMF, Panel Starter Inverter, dll.' },
  { id: 'fabrikasi tanki', label: 'Fabrikasi Tanki', icon: Box, desc: 'FRP Tank, Mild Steel Epoxy, SS304/SS316 Tank' },
  { id: 'piping', label: 'Piping', icon: Settings, desc: 'Pemasangan pipa PVC, HDPE, Stainless Steel, Carbon Steel' },
  { id: 'mechanical', label: 'Mechanical', icon: Settings, desc: 'Skid frame, agitator mixer, belt conveyor pompa' },
  { id: 'electrical', label: 'Electrical', icon: Sparkles, desc: 'Instrumentasi sensor pH, DO, flowmeter water, kabel' },
  { id: 'service maintenance', label: 'Service Maintenance', icon: PhoneCall, desc: 'Pembersihan STP, overhaul blower, kalibrasi sensor' }
];

// Preset Categories for Services / Jasa
export const SERVICE_CATEGORIES = [
  { id: 'all-service', label: 'Semua Kategori Jasa', icon: Layers },
  { id: 'instalasi-stp', label: 'Instalasi STP', icon: Settings, desc: 'Pekerjaan pemasangan unit sistem STP (Sewage Treatment Plant)' },
  { id: 'instalasi-wwtp', label: 'Instalasi WWTP', icon: RefreshCw, desc: 'Pekerjaan pemasangan unit sistem WWTP (Waste Water Treatment Plant)' },
  { id: 'instalasi-wtp', label: 'Instalasi WTP', icon: HardDrive, desc: 'Pekerjaan pemasangan sistem WTP (Water Treatment Plant)' },
  { id: 'instalasi-ipal', label: 'Instalasi IPAL', icon: Compass, desc: 'Instalasi pengolahan air limbah medis / IPAL' },
  { id: 'plumbing-piping', label: 'Plumbing & Piping', icon: Settings, desc: 'Instalasi, penyambungan, leak-test pemipaan air & udara' },
  { id: 'service-maintenance', label: 'Service & Maintenance', icon: PhoneCall, desc: 'Overhaul unit blower, pompa transfer, kalibrasi sensor' },
  { id: 'electrical-automation', label: 'Electrical & Automation', icon: Sparkles, desc: 'Pemasangan control panel, inverter, sensor, dsb.' }
];

// Helper utility to calculate total cost
export function getItemTotalCost(item: CatalogItem): number {
  if (item.type === 'jasa') {
    const basicServiceFee = item.priceService || 0;
    const materialCost = (item.neededItems || []).reduce((acc, curr) => acc + ((curr.qty || 0) * (curr.price || 0)), 0);
    const manpowerCost = (item.manpowerQty || 0) * (item.manpowerRate || 0) * (item.manpowerDays || 1);
    return basicServiceFee + materialCost + manpowerCost;
  }
  return (item.priceItem || 0) + (item.priceService || 0) + (item.priceInstallation || 0);
}

import { PRESET_CATALOGS } from './PresetCatalogs';

// E-Katalog dimulai dari 0 (kosong) sesuai instruksi pengguna.
// Setiap penawaran (SPH) baru yang dibuat akan otomatis tersimpan ke E-Katalog.
const DEPRECATED_PRESETS: CatalogItem[] = [];

export const EKatalog: React.FC<{
  user: any;
  onNavigate: (screen: any) => void;
  employees: any[];
}> = ({ user, onNavigate, employees }) => {
  const [items, setItems] = useState<CatalogItem[]>([]);

  // Generate categories based on static list + database items with custom ones
  const dynamicCatalogCategories = useMemo(() => {
    const list = [...CATALOG_CATEGORIES];
    // Find categories in items that aren't in CATALOG_CATEGORIES
    items.forEach(item => {
      if (item.type === 'barang' && item.category) {
        const isExist = list.some(c => c.label.toLowerCase().trim() === item.category.toLowerCase().trim() || c.id === item.category.toLowerCase().replace(/\s+/g, ''));
        if (!isExist) {
          list.push({
            id: item.category.toLowerCase().replace(/\s+/g, '-'),
            label: item.category,
            icon: Tag,
            desc: `Kategori kustom: ${item.category}`
          });
        }
      }
    });
    return list;
  }, [items]);

  const dynamicServiceCategories = useMemo(() => {
    const list = [...SERVICE_CATEGORIES];
    // Find categories in items that aren't in SERVICE_CATEGORIES
    items.forEach(item => {
      if (item.type === 'jasa' && item.category) {
        const isExist = list.some(c => c.label.toLowerCase().trim() === item.category.toLowerCase().trim() || c.id === item.category.toLowerCase().replace(/\s+/g, ''));
        if (!isExist) {
          list.push({
            id: item.category.toLowerCase().replace(/\s+/g, '-'),
            label: item.category,
            icon: Tag,
            desc: `Kategori jasa kustom: ${item.category}`
          });
        }
      }
    });
    return list;
  }, [items]);

  const [loading, setLoading] = useState(true);

  const [tabView, setTabView] = useState<'grid' | 'table'>('grid');

  // Search and Advanced Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'barang' | 'jasa'>('all');

  useEffect(() => {
    if (selectedType === 'jasa') {
      setSelectedCategory('all-service');
    } else {
      setSelectedCategory('all');
    }
  }, [selectedType]);

  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'views'>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Detail Item & Modal states
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [tempCostValue, setTempCostValue] = useState<string>('');

  // Stats State
  const [viewCountTracker, setViewCountTracker] = useState<Record<string, number>>({});

  // Contract Calculator Simulator State
  const [calcQuantity, setCalcQuantity] = useState(1);
  const [calcIncludeService, setCalcIncludeService] = useState(true);
  const [calcIncludeInstall, setCalcIncludeInstall] = useState(true);
  const [calcClientDiscount, setCalcClientDiscount] = useState(0); // in percent

  // Favorite Tracker State (persist in localStorage for current user)
  const [favorites, setFavorites] = useState<string[]>([]);

  // ============================================
  // CUSTOM PROJECT BUILDER STATES
  // ============================================
  const [activeMode, setActiveMode] = useState<'catalog' | 'builder' | 'projects'>('catalog');
  const [activeBoqId, setActiveBoqId] = useState<string | null>(null);
  const [activeBoqCreatedAt, setActiveBoqCreatedAt] = useState<number | null>(null);
  const [savedBoqProjects, setSavedBoqProjects] = useState<any[]>([]);
  
  // Custom Project Info
  const [buildProjName, setBuildProjName] = useState('Projek Sistem STP Biofilter 25 m3/hari');
  const [buildClientName, setBuildClientName] = useState('PT Indo Perkasa Utama');
  const [buildProjType, setBuildProjType] = useState('Instalasi STP');
  const [buildCapacity, setBuildCapacity] = useState('25 m³/hari');
  const [buildProjDesc, setBuildProjDesc] = useState('Alternatif rancangan sistem aerobik-anaerobik biofilter lengkap terintegrasi pompa blower diffuser otomatis.');
  const [buildDiscount, setBuildDiscount] = useState(0);

  // ============================================
  // PDF EXPORT LAYOUT & LETTERHEAD SETTINGS
  // ============================================
  const [showPdfSetup, setShowPdfSetup] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBoqData, setPreviewBoqData] = useState<any>(null);
  const [buildRefNo, setBuildRefNo] = useState(`QUO/STP-WWTP/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
  const [companyName, setCompanyName] = useState('PT REKAYASA TEKNIK LINGKUNGAN');
  const [companyAddress, setCompanyAddress] = useState('Kawasan Industri Jababeka Phase III, Cikarang, Bekasi, Jawa Barat - 17530');
  const [companyPhone, setCompanyPhone] = useState('+62 (021) 8934-2221');
  const [companyEmail, setCompanyEmail] = useState('info@rekayasateknik.co.id');
  const [companyWebsite, setCompanyWebsite] = useState('www.rekayasateknik.co.id');
  const [clientPic, setClientPic] = useState('Bapak Sastrowardoyo');
  const [clientAddress, setClientAddress] = useState('Jl. Jend. Sudirman Kav 21, DKI Jakarta');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().substring(0, 10));
  const [validityDays, setValidityDays] = useState(30);
  const [picSenderName, setPicSenderName] = useState('Ir. Alexsander Jafra');
  const [picSenderTitle, setPicSenderTitle] = useState('Project Engineering & IPAL Architect Director');
  
  const [companyLogoStyle, setCompanyLogoStyle] = useState<'preset1' | 'preset2' | 'preset3' | 'custom'>('preset1');
  const [customLogoBase64, setCustomLogoBase64] = useState<string | null>(null);
  
  const [termsNotes, setTermsNotes] = useState(
    `1. Sistem pembayaran: 40% Down Payment (DP), 50% saat barang tiba di lokasi sebelum konstruksi, dan 10% setelah commisioning selesai.\n` +
    `2. Waktu pelaksanaan pekerjaan/fabrikasi diperkirakan selama 30-45 hari kerja semenjak penandatanganan kesepakatan bersama.\n` +
    `3. Harga penawaran di atas sudah mencakup supervisi instalasi, start-up media koloni bakteri awal, commissioning, dan masa garansi 12 bulan.\n` +
    `4. Negosiasi dan konsultasi desain layout sipil dapat dikomunikasikan secara gratis dengan tim ahli kami.`
  );

  // Sub-comp selected item definitions
  interface SelectedBuilderItem {
    id: string;
    name: string;
    sku: string;
    brand: string;
    unit: string;
    priceItem: number;
    priceService: number;
    priceInstallation: number;
    quantity: number;
    isCustom: boolean;
    specifications: string;
  }

  const [builderItems, setBuilderItems] = useState<SelectedBuilderItem[]>([
    {
      id: 'blower-001',
      name: 'Root Blower Futsu Monoblock TST-50',
      sku: 'BLW-FUTSU-TST50',
      brand: 'Futsu',
      unit: 'Set',
      priceItem: 29800000,
      priceService: 2000000,
      priceInstallation: 3500000,
      quantity: 1,
      isCustom: false,
      specifications: 'Root Blower Aerasi TST-50 aerator tank'
    },
    {
      id: 'pompa-001',
      name: 'Pompa Centrifugal Ebara 3M 40-160/4.0',
      sku: 'POM-EBARA-3M40160',
      brand: 'Ebara',
      unit: 'Unit',
      priceItem: 18500000,
      priceService: 1500000,
      priceInstallation: 2500000,
      quantity: 2,
      isCustom: false,
      specifications: 'Pompa transfer feed limbah'
    }
  ]);

  // Addition states
  const [showAddBuilderItem, setShowAddBuilderItem] = useState(false);
  const [addMode, setAddMode] = useState<'catalog' | 'custom'>('catalog');
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [catalogQtyToAdd, setCatalogQtyToAdd] = useState(1);

  // Custom addition states
  const [customItemName, setCustomItemName] = useState('');
  const [customItemBrand, setCustomItemBrand] = useState('Custom Design');
  const [customItemSKU, setCustomItemSKU] = useState('');
  const [customItemPriceItem, setCustomItemPriceItem] = useState('0');
  const [customItemPriceService, setCustomItemPriceService] = useState('0');
  const [customItemPriceInstallation, setCustomItemPriceInstallation] = useState('0');
  const [customItemUnit, setCustomItemUnit] = useState('Unit');
  const [customItemSpecs, setCustomItemSpecs] = useState('');
  const [customItemQty, setCustomItemQty] = useState(1);
  const [customItemSaveToCatalog, setCustomItemSaveToCatalog] = useState(false);
  const [customItemCategory, setCustomItemCategory] = useState('Peralatan Utama STP/WWTP');
  const [customItemType, setCustomItemType] = useState<'barang' | 'jasa'>('barang');
  const [isPublishing, setIsPublishing] = useState(false);

  // ============================================
  // AI ARCHITECT BUILDER STATES & HANDLERS
  // ============================================
  const [showAiArchitectModal, setShowAiArchitectModal] = useState(false);
  const [aiArchitectPrompt, setAiArchitectPrompt] = useState('');
  const [aiArchitectLoading, setAiArchitectLoading] = useState(false);
  const [aiArchitectError, setAiArchitectError] = useState<string | null>(null);

  const handleGenerateBoqWithAi = async () => {
    if (!aiArchitectPrompt.trim()) {
      setAiArchitectError("Mohon masukkan kebutuhan kapasitas atau kriteria sistem STP/WWTP yang ingin di-desain oleh AI.");
      return;
    }

    setAiArchitectLoading(true);
    setAiArchitectError(null);

    try {
      const targetUrl = typeof window !== "undefined" && !window.location.hostname.includes("run.app") && !window.location.hostname.includes("localhost")
        ? "https://ais-pre-t6snira4tmhv7p7pnhkssm-546022300409.asia-southeast1.run.app/api/gemini/generate-boq"
        : "/api/gemini/generate-boq";
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiArchitectPrompt }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal menerima spesifikasi desain dari sistem AI.");
      }

      const data = await response.json();

      // Populate builder metadata
      if (data.projectName) setBuildProjName(data.projectName);
      if (data.clientName) setBuildClientName(data.clientName);
      if (data.projType) setBuildProjType(data.projType);
      if (data.capacity) setBuildCapacity(data.capacity);
      if (data.description) setBuildProjDesc(data.description);

      // Populate builder items
      if (data.items && Array.isArray(data.items)) {
        const formattedItems = data.items.map((it: any, i: number) => ({
          id: `ai-item-${Date.now()}-${i}`,
          sku: it.sku || `SKU-${Math.floor(1000 + Math.random() * 9000).toString()}`,
          name: it.name || "Nama Alat Utama AI",
          brand: it.brand || "Ebara",
          unit: it.unit || "Unit",
          priceItem: Number(it.priceItem) || 0,
          priceService: Number(it.priceService) || 0,
          priceInstallation: Number(it.priceInstallation) || 0,
          quantity: Number(it.quantity) || 1,
          isCustom: true,
          specifications: it.specifications || ""
        }));
        setBuilderItems(formattedItems);
      }

      setShowAiArchitectModal(false);
      setAiArchitectPrompt('');
      alert(`Sukses! Desain AI Terintegrasi berhasil dimuat ke dalam Workspace untuk kapasitas ${data.capacity || "Kustom"}. Silakan tinjau dan edit penyesuaian detail jika diperlukan.`);
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      setAiArchitectError(err.message || "Terjadi kendala jaringan saat menghubungi asisten AI.");
    } finally {
      setAiArchitectLoading(false);
    }
  };

  // Computations
  const projectCosts = useMemo(() => {
    let equipment = 0;
    let service = 0;
    let installation = 0;
    builderItems.forEach(item => {
      equipment += (item.priceItem || 0) * (item.quantity || 1);
      service += (item.priceService || 0) * (item.quantity || 1);
      installation += (item.priceInstallation || 0) * (item.quantity || 1);
    });
    const subtotal = equipment + service + installation;
    const discountAmount = (subtotal * buildDiscount) / 100;
    const finalTotal = Math.max(0, subtotal - discountAmount);
    return { equipment, service, installation, subtotal, discountAmount, finalTotal };
  }, [builderItems, buildDiscount]);

  // Methods
  const handleAddCatalogToBuilder = () => {
    if (!selectedCatalogId) {
      alert('Mohon pilih satu item katalog bawaan terlebih dahulu.');
      return;
    }
    const catItem = items.find(i => i.id === selectedCatalogId);
    if (!catItem) return;

    const existingIndex = builderItems.findIndex(i => i.id === catItem.id);
    if (existingIndex > -1) {
      setBuilderItems(prev => {
        const copy = [...prev];
        copy[existingIndex].quantity += catalogQtyToAdd;
        return copy;
      });
    } else {
      const newItem: SelectedBuilderItem = {
        id: catItem.id,
        name: catItem.name,
        sku: catItem.sku,
        brand: catItem.brand,
        unit: catItem.unit || 'Unit',
        priceItem: catItem.priceItem || 0,
        priceService: catItem.priceService || 0,
        priceInstallation: catItem.priceInstallation || 0,
        quantity: catalogQtyToAdd,
        isCustom: false,
        specifications: catItem.specifications || ''
      };
      setBuilderItems(prev => [...prev, newItem]);
    }
    setCatalogQtyToAdd(1);
    setSelectedCatalogId('');
    setShowAddBuilderItem(false);
  };

  const handleAddCustomToBuilder = async () => {
    if (!customItemName.trim()) {
      alert('Mohon isi nama item / spesifikasi custom terlebih dahulu.');
      return;
    }
    const genId = 'custom-' + Date.now();
    const skuCode = customItemSKU.trim() || ('CST-' + Math.floor(1000 + Math.random() * 9000));
    
    const priceDbItem = parseFloat(customItemPriceItem) || 0;
    const priceDbService = parseFloat(customItemPriceService) || 0;
    const priceDbInstallation = parseFloat(customItemPriceInstallation) || 0;

    // Optional: Save directly to the reference E-Katalog so developer/user can use it everywhere
    if (customItemSaveToCatalog) {
      try {
        const catalogPayload: CatalogItem = {
          id: genId,
          name: customItemName.trim(),
          sku: skuCode,
          category: customItemCategory,
          subCategory: 'Rancangan Individual Kustom',
          type: customItemType,
          brand: customItemBrand.trim() || 'Custom Design',
          priceItem: priceDbItem,
          priceService: priceDbService,
          priceInstallation: priceDbInstallation,
          unit: customItemUnit.trim() || 'Unit',
          description: `[Dibuat via Builder] ${customItemSpecs.trim() || 'Spesifikasi fabrikasi / instalasi kustom lapang.'}`,
          specifications: customItemSpecs.trim() || 'Spesifikasi fabrikasi / instalasi lapangan kustom',
          material: 'Custom Specification Fit',
          capacity: 'As Designed',
          dimensions: 'Sesuai Ukuran Ruang',
          power: 'Sesuai Spek Bawaan',
          flowRate: 'Semburan Fleksibel',
          pressure: 'Fleksibel',
          warranty: '1 Tahun Masa Pasang',
          stockLocation: 'Workshop / On-Site Fabrikasi',
          status: 'aktif',
          createdBy: user?.uid || 'anon',
          createdByName: user?.name || 'Administrator',
          createdDate: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
          images: [
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'
          ],
          views: 1
        };

        await dbService.setDocument('catalog', genId, catalogPayload);
      } catch (err) {
        console.error('Error saving custom item directly to catalog master:', err);
      }
    }

    const newItem: SelectedBuilderItem = {
      id: genId,
      name: customItemName.trim(),
      sku: skuCode,
      brand: customItemBrand.trim() || 'Custom',
      unit: customItemUnit.trim() || 'Unit',
      priceItem: priceDbItem,
      priceService: priceDbService,
      priceInstallation: priceDbInstallation,
      quantity: customItemQty || 1,
      isCustom: true,
      specifications: customItemSpecs.trim() || 'Spesifikasi fabrikasi / instalasi lapangan custom'
    };
    setBuilderItems(prev => [...prev, newItem]);

    setCustomItemName('');
    setCustomItemBrand('Custom Design');
    setCustomItemSKU('');
    setCustomItemPriceItem('0');
    setCustomItemPriceService('0');
    setCustomItemPriceInstallation('0');
    setCustomItemUnit('Unit');
    setCustomItemSpecs('');
    setCustomItemQty(1);
    setCustomItemSaveToCatalog(false);
    setShowAddBuilderItem(false);
  };

  const handleRemoveBuilderItem = (idToRem: string) => {
    setBuilderItems(prev => prev.filter(i => i.id !== idToRem));
  };

  const handleUpdateBuilderItemQty = (idToUpd: string, newQty: number) => {
    if (newQty < 1) return;
    setBuilderItems(prev => prev.map(i => i.id === idToUpd ? { ...i, quantity: newQty } : i));
  };

  const handlePublishProject = async () => {
    if (!buildProjName.trim()) {
      alert('Nama project/sistem tidak boleh kosong.');
      return;
    }

    if (builderItems.length === 0) {
      alert('Tambahkan setidaknya satu item ke daftar sebelum mempublikasikan sistem.');
      return;
    }

    setIsPublishing(true);

    try {
      // Build visual markdown specification
      let specsText = `### SPESIFIKASI DETIL RANCANGAN KUSTOM: ${buildProjName.toUpperCase()}\n`;
      specsText += `Sistem ini dirangkai secara manual oleh: ${user?.name || 'Administrator'} pada ${new Date().toLocaleDateString('id-ID')}\n`;
      specsText += `Target Desain Aliran: ${buildCapacity || 'Custom System'}\n\n`;

      specsText += `==== PERSENTASE / ESTIMASI SUMBER DAYA ====\n`;
      builderItems.forEach((b, i) => {
        specsText += `${i + 1}. [${b.sku}] ${b.name}\n`;
        specsText += `   - Mrek: ${b.brand} | Jumlah: ${b.quantity} ${b.unit}\n`;
        specsText += `   - Karakteristik Spek: ${b.specifications || 'Aspek standar teknis'}\n`;
        if (b.priceItem > 0) specsText += `   - Harga Alat Satuan: Rp ${(b.priceItem).toLocaleString('id-ID')}\n`;
        if (b.priceService > 0) specsText += `   - Harga Jasa Satuan: Rp ${(b.priceService).toLocaleString('id-ID')}\n`;
        if (b.priceInstallation > 0) specsText += `   - Harga Pasang Satuan: Rp ${(b.priceInstallation).toLocaleString('id-ID')}\n`;
        specsText += `\n`;
      });

      specsText += `==== REKAPITULASI BUDGET ANGGARAN ====\n`;
      specsText += `- Pengadaan Peralatan Utama: Rp ${projectCosts.equipment.toLocaleString('id-ID')}\n`;
      specsText += `- Jasa Supervisi & Engineering: Rp ${projectCosts.service.toLocaleString('id-ID')}\n`;
      specsText += `- Jasa Konstruksi & Instalasi: Rp ${projectCosts.installation.toLocaleString('id-ID')}\n`;
      specsText += `- Sub-Total Gabungan: Rp ${projectCosts.subtotal.toLocaleString('id-ID')}\n`;
      if (buildDiscount > 0) {
        specsText += `- Diskon Kemitraan Khusus: ${buildDiscount}% (- Rp ${projectCosts.discountAmount.toLocaleString('id-ID')})\n`;
      }
      specsText += `*GRAND ESTIMASI TOTAL WORK:* Rp ${projectCosts.finalTotal.toLocaleString('id-ID')}\n\n`;
      specsText += `_Catatan: Rancangan ini berbasis modular dari katalog sistem, silakan hubungi tim ahli untuk penyesuaian detail sipil._`;

      const projSku = 'PRJ-' + buildProjType.replace('Instalasi ', '').substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      const payload: CatalogItem = {
        id: 'project-' + Date.now(),
        name: buildProjName.trim(),
        sku: projSku,
        category: buildProjType,
        subCategory: 'Rancangan Sistem Custom',
        type: 'jasa',
        brand: 'Custom Design Pro',
        priceItem: projectCosts.equipment,
        priceService: projectCosts.service,
        priceInstallation: projectCosts.installation,
        unit: 'Paket / Lot',
        description: `[PROJEK GABUNGAN] ${buildProjDesc.trim()} (Komposisi dari ${builderItems.length} spesifikasi perlengkapan). Target klien: ${buildClientName}.`,
        specifications: specsText,
        material: 'Modular Composite STP System',
        capacity: buildCapacity || 'As Requested',
        dimensions: 'Custom Fit On-Site',
        power: 'Dihitung per beban unit terpasang',
        flowRate: buildCapacity || 'Sesuai Desain',
        pressure: 'Sesuai Sistem',
        warranty: '1 Tahun Garansi Instalasi',
        stockLocation: 'Fabrikasi Lapangan & Workshop',
        status: 'aktif',
        createdBy: user?.uid || 'anon',
        createdByName: user?.name || 'Administrator',
        createdDate: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        images: [
          'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'
        ],
        views: 3
      };

      await dbService.setDocument('catalog', payload.id, payload);
      alert(`Sukses! Proyek Sistem "${buildProjName}" berhasil dimodelkan & dipublikasikan langsung ke E-Katalog di kategori "${buildProjType}".`);
      
      // Navigate right back & highlight it
      setActiveMode('catalog');
      setSelectedCategory('all');
      setSearchQuery(payload.name);
    } catch (e) {
      console.error(e);
      alert('Gagal mempublikasikan rancangan proyek baru ke database: ' + String(e));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveBoqProject = async (saveAsNew: boolean = false) => {
    if (!buildProjName.trim()) {
      alert('Nama project/sistem tidak boleh kosong.');
      return;
    }

    if (builderItems.length === 0) {
      alert('Tambahkan setidaknya satu komponen di daftar rancangan sebelum menyimpan.');
      return;
    }

    try {
      const isNew = saveAsNew || !activeBoqId;
      const boqId = isNew ? 'boq-' + Date.now() : activeBoqId;
      const createdAt = isNew ? Date.now() : (activeBoqCreatedAt || Date.now());

      const payload = {
        id: boqId,
        name: buildProjName.trim(),
        clientName: buildClientName.trim(),
        capacity: buildCapacity.trim(),
        projType: buildProjType,
        description: buildProjDesc.trim(),
        discount: buildDiscount,
        items: builderItems,
        costs: projectCosts,
        createdBy: user?.uid || 'anon',
        createdByName: user?.name || 'Administrator',
        createdAt: createdAt,
        updatedAt: Date.now()
      };

      await dbService.setDocument('boq_projects', boqId, payload);
      setActiveBoqId(boqId);
      setActiveBoqCreatedAt(createdAt);
      
      alert(isNew 
        ? `Sukses! Projek BOQ "${buildProjName}" berhasil disimpan ke daftar projek Anda.` 
        : `Sukses! Projek BOQ "${buildProjName}" berhasil diperbarui.`
      );
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan Projek BOQ: ' + String(e));
    }
  };

  const handleDeleteBoqProject = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Projek BOQ "${name}"?`)) {
      return;
    }
    try {
      await dbService.deleteDocument('boq_projects', id);
      if (activeBoqId === id) {
        setActiveBoqId(null);
        setActiveBoqCreatedAt(null);
      }
      alert(`Sukses! Projek BOQ "${name}" telah dihapus.`);
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus Projek BOQ: ' + String(e));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCustomLogoBase64(uploadEvent.target?.result as string);
        setCompanyLogoStyle('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const generateProfessionalBoQPdf = (customBoq?: any) => {
    const itemsToUse = customBoq ? (customBoq.items || []) : builderItems;
    if (itemsToUse.length === 0) {
      alert('Tambahkan setidaknya satu komponen di daftar rancangan sebelum mencetak PDF.');
      return;
    }

    const dataToPreview = {
      name: customBoq ? (customBoq.name || '') : buildProjName,
      projType: customBoq ? (customBoq.projType || 'WTP') : buildProjType,
      capacity: customBoq ? (customBoq.capacity || '') : buildCapacity,
      clientName: customBoq ? (customBoq.clientName || '') : buildClientName,
      description: customBoq ? (customBoq.description || '') : buildProjDesc,
      items: itemsToUse
    };

    setPreviewBoqData(dataToPreview);
    setIsPreviewOpen(true);
  };


  // Load favorites from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`workflowpro_fav_catalog_${user?.id || 'anon'}`);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading catalog favorites', e);
    }
  }, [user]);

  const toggleFavorite = (itemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const isFav = favorites.includes(itemId);
    const updated = isFav ? favorites.filter(id => id !== itemId) : [...favorites, itemId];
    setFavorites(updated);
    try {
      localStorage.setItem(`workflowpro_fav_catalog_${user?.id || 'anon'}`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Realtime load from Firestore using `onCollectionSnapshot`
  useEffect(() => {
    setLoading(true);

    const mergeDataWithPresets = (firestoreData: CatalogItem[]) => {
      // Exclude legacy mock items if any exist so catalog starts completely clean from user entries
      const cleanData = (firestoreData || []).filter(item => {
        if (!item) return false;
        const id = (item.id || '').toLowerCase();
        const createdBy = (item.createdBy || '').toLowerCase();
        const name = (item.name || '').toLowerCase();
        if (
          id.startsWith('pompa-') ||
          id.startsWith('blower-') ||
          id.startsWith('diffuser-') ||
          id.startsWith('tangki-') ||
          id.startsWith('preset-') ||
          id.startsWith('md-eq-') ||
          id.startsWith('cat-preset-') ||
          id.startsWith('default-') ||
          id.startsWith('mock-') ||
          createdBy === 'system' ||
          name.includes('ebara 3m') ||
          name.includes('anlet root blower') ||
          name.includes('aeration diffuser 10') ||
          name.includes('dosing pump lmii') ||
          name.includes('mbbr k3') ||
          name.includes('panel kontrol stp') ||
          name.includes('tangki frp biofilter') ||
          name.includes('piping & plumbing')
        ) {
          return false;
        }
        return true;
      });
      return cleanData;
    };

    const unsubscribe = dbService.onCollectionSnapshot<CatalogItem>(
      'catalog',
      (data) => {
        const mergedList = mergeDataWithPresets(data);
        setItems(mergedList);
        setLoading(false);
      },
      [],
      (error) => {
        console.warn('Firestore load warning for catalog:', error);
        setItems([]);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Realtime load BOQ projects from Firestore
  useEffect(() => {
    const unsubscribeBoqs = dbService.onCollectionSnapshot<any>(
      'boq_projects',
      (data) => {
        const sorted = [...data].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setSavedBoqProjects(sorted);
      }
    );
    return () => {
      unsubscribeBoqs();
    };
  }, []);

  // Brands extracted dynamically for option list
  const availableBrands = useMemo(() => {
    const brands = items.map(item => item.brand).filter(Boolean);
    return ['all', ...new Set(brands)];
  }, [items]);

  // Handle Detail Card Click / Views Tracker
  const handleViewDetail = async (item: CatalogItem) => {
    setSelectedItem(item);
    // Track local page view increments
    const currentViews = item.views || 0;
    const newViews = currentViews + 1;
    // Update counter in state
    setViewCountTracker(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || currentViews) + 1
    }));
    // Try update view count in database silently
    try {
      await dbService.updateDocument('catalog', item.id, { views: newViews });
    } catch (e) {
      console.log('Ignore silent database view update fail', e);
    }
  };

  // Delete Action restricted to Admin only
  const handleDeleteItem = async (itemId: string) => {
    if (user?.role !== 'admin') {
      alert('Akses Dibatalkan! Hanya pengguna bersatus Admin yang diperkenankan menghapus item katalog.');
      return;
    }
    if (window.confirm('Hapus item katalog ini beserta spesifikasinya secara menyeluruh? Tindakan ini permanen di database.')) {
      try {
        await dbService.deleteDocument('catalog', itemId);
        if (selectedItem?.id === itemId) setSelectedItem(null);
        alert('Katalog berhasil dihapus.');
      } catch (err) {
        console.error('Error deleting catalog item', err);
        alert('Tidak dapat menghapus item: ' + String(err));
      }
    }
  };

  // Kosongkan seluruh item katalog untuk mulai dari awal (Request 4)
  const handleClearAllCatalog = async () => {
    if (!window.confirm('Kosongkan semua data E-Katalog untuk mulai dari awal? Semua item STP, WWTP, WTP, tangki, dan equipment lama di database akan dibersihkan.')) {
      return;
    }
    try {
      setLoading(true);
      for (const it of items) {
        if (it.id) {
          await dbService.deleteDocument('catalog', it.id);
        }
      }
      setItems([]);
      setSelectedItem(null);
      alert('Data E-Katalog telah berhasil dikosongkan. Anda dapat mulai membuat penawaran baru yang otomatis tersimpan ke E-Katalog!');
    } catch (err) {
      console.error('Gagal mengosongkan katalog:', err);
      alert('Gagal mengosongkan: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  // Quick direct edit for Cost Price (Harga Modal / HPP)
  const handleSaveQuickCostPrice = async (itemId: string, newCost: number) => {
    try {
      await dbService.updateDocument('catalog', itemId, {
        costPrice: newCost,
        lastUpdate: new Date().toISOString()
      });
      setItems(prev => prev.map(it => it.id === itemId ? { ...it, costPrice: newCost } : it));
      setEditingCostId(null);
    } catch (e) {
      console.error(e);
      alert('Gagal memperbarui harga modal: ' + String(e));
    }
  };

  // Filtering Logic (Multi-Filter Support)
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Search Query (Matches Name, Category, Brand, Specs, SKU, Status)
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ? true : (
        (item.name || '').toLowerCase().includes(q) ||
        (item.sku || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.brand || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.specifications || '').toLowerCase().includes(q) ||
        (item.detailWork || '').toLowerCase().includes(q)
      );

      // 2. Sidebar / Top Category
      const matchCategory = selectedCategory === 'all' || selectedCategory === 'all-service' || 
        item.category.toLowerCase().replace(/\s+/g, '') === selectedCategory.toLowerCase().replace(/\s+/g, '') ||
        item.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase().trim() ||
        item.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

      // 3. Type Filter
      const matchType = selectedType === 'all' || item.type === selectedType;

      // 4. Brand Filter
      const matchBrand = selectedBrand === 'all' || item.brand === selectedBrand;

      // 5. Active Status Filter
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      // 6. Price Range Filter (matches sum of item price or services depending on user focus, checking max price constraints)
      const minVal = parseFloat(priceRange.min);
      const maxVal = parseFloat(priceRange.max);
      const totalCost = getItemTotalCost(item);
      
      const matchMinPrice = isNaN(minVal) ? true : totalCost >= minVal;
      const matchMaxPrice = isNaN(maxVal) ? true : totalCost <= maxVal;

      return matchQuery && matchCategory && matchType && matchBrand && matchStatus && matchMinPrice && matchMaxPrice;
    }).sort((a, b) => {
      // Sorting
      if (sortBy === 'newest') {
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'price-asc') {
        return getItemTotalCost(a) - getItemTotalCost(b);
      }
      if (sortBy === 'price-desc') {
        return getItemTotalCost(b) - getItemTotalCost(a);
      }
      if (sortBy === 'views') {
        const viewsA = viewCountTracker[a.id] || a.views || 0;
        const viewsB = viewCountTracker[b.id] || b.views || 0;
        return viewsB - viewsA;
      }
      return 0;
    });
  }, [items, searchQuery, selectedCategory, selectedType, selectedBrand, statusFilter, priceRange, sortBy, viewCountTracker]);

  // Statistics Dashboard calculations
  const stats = useMemo(() => {
    const totalCount = items.length;
    const totalBarang = items.filter(i => i.type === 'barang').length;
    const totalJasa = items.filter(i => i.type === 'jasa').length;
    
    const uniqueCategories = new Set(items.map(i => i.category.toLowerCase().trim())).size;
    
    // Newest Product
    let newestName = '-';
    if (items.length > 0) {
      const sortedNew = [...items].sort((a, b) => {
        return new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime();
      });
      newestName = sortedNew[0]?.name || '-';
    }

    // Most Viewed
    let mostViewedName = '-';
    let maxViews = -1;
    items.forEach(item => {
      const actualViews = viewCountTracker[item.id] || item.views || 0;
      if (actualViews > maxViews) {
        maxViews = actualViews;
        mostViewedName = item.name + ` (${actualViews}x dilihat)`;
      }
    });

    return {
      totalCount,
      totalBarang,
      totalJasa,
      uniqueCategories,
      newestName,
      mostViewedName: maxViews > 0 ? mostViewedName : '-'
    };
  }, [items, viewCountTracker]);

  // Reset Filters tool
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedBrand('all');
    setStatusFilter('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Pagination implementation
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Automatically reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedType, selectedBrand, statusFilter, priceRange, sortBy]);

  // Open creation dialog
  const handleOpenCreateForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  // Open editor dialog
  const handleOpenEditForm = (item: CatalogItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSavedSuccessfully = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // Direct Contract Pricing Calculator logic
  const calculatedTotal = useMemo(() => {
    if (!selectedItem) return 0;
    const baseItemPrice = calcQuantity * (selectedItem.priceItem || 0);
    const baseServicePrice = calcIncludeService ? calcQuantity * (selectedItem.priceService || 0) : 0;
    const baseInstallPrice = calcIncludeInstall ? calcQuantity * (selectedItem.priceInstallation || 0) : 0;
    const grossTotal = baseItemPrice + baseServicePrice + baseInstallPrice;
    const discountAmount = (grossTotal * calcClientDiscount) / 100;
    return Math.max(0, grossTotal - discountAmount);
  }, [selectedItem, calcQuantity, calcIncludeService, calcIncludeInstall, calcClientDiscount]);

  // Generate WhatsApp Direct Booking Text Link
  const generateWhatsAppLink = (item: CatalogItem) => {
    const text = `Halo, Admin ${brandToText(item.brand)}. Saya tertarik dengan produk/jasa E-Katalog ini:\n\n` +
      `📌 *Merek/Merek:* ${item.name}\n` +
      `🏷️ *SKU:* ${item.sku}\n` +
      `📂 *Kategori:* ${item.category}\n` +
      `🛠️ *Spesifikasi Utuh:* ${item.material || 'Standar Engineering'}\n` +
      `💰 *Harga Barang:* Rp ${(item.priceItem || 0).toLocaleString('id-ID')}\n` +
      `📍 *Lokasi Gudang:* ${item.stockLocation || 'Sesuai kesepakatan'}\n\n` +
      `Mohon diinformasikan ketersediaan stok, penawaran khusus (Quotation), dan estimasi pengiriman selengkapnya. Terima kasih!`;
    
    return `https://api.whatsapp.com/send?phone=628123456789&text=${encodeURIComponent(text)}`;
  };

  const brandToText = (b: string) => b || 'WorkflowPro';

  return (
    <div className="space-y-6">
      {/* Upper Grid Layout Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-8 md:p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none rounded-[3rem]" />
        
        <div className="space-y-3 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-400/20 rounded-full text-xs font-black text-indigo-300 uppercase tracking-widest">
            <Sparkles size={12} className="text-amber-400" /> Ekosistem E-Katalog Perusahaan
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Katalog Digital & Jasa STP / WWTP
          </h2>
          <p className="text-slate-300 text-sm font-bold">
            Simpan, kelola, bandingkan spesifikasi pompa blower diffuser, dan generate estimasi penawaran harga secara real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 relative z-10 w-full md:w-auto">
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Executive Dashboard
          </button>
        </div>
      </div>

      {/* Statistics Row Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Katalog', val: stats.totalCount, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: Box },
          { label: 'Total Barang', val: stats.totalBarang, color: 'text-amber-500 bg-amber-50 border-amber-100', icon: ShoppingBag },
          { label: 'Total Jasa', val: stats.totalJasa, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: Briefcase },
          { label: 'Total Kategori', val: stats.uniqueCategories, color: 'text-rose-600 bg-rose-50 border-rose-100', icon: Layers },
          { label: 'Produk Teranyar', val: stats.newestName, isString: true, color: 'text-slate-800 bg-slate-50 border-slate-100 lg:col-span-2' },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-3xl border ${s.color} hover:-translate-y-1 transition duration-200 shadow-sm flex flex-col justify-between min-h-[110px]`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
              {s.icon && <s.icon size={16} className="opacity-70" />}
            </div>
            <div className={`font-black tracking-tight leading-tight mt-2 ${s.isString ? 'text-xs line-clamp-2 md:text-sm text-slate-700' : 'text-3xl'}`}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher: E-Katalog Browser vs Custom Project Builder */}
      <div className="flex bg-white p-1.5 rounded-[2.2rem] gap-2 border border-slate-100 shadow-sm max-w-3xl relative z-20 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveMode('catalog')}
          className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest rounded-2xl transition duration-150 flex items-center justify-center gap-2 whitespace-nowrap ${
            activeMode === 'catalog'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Grid size={13} /> 1. E-Katalog
        </button>
        <button
          onClick={() => setActiveMode('builder')}
          className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest rounded-2xl transition duration-150 flex items-center justify-center gap-2 whitespace-nowrap ${
            activeMode === 'builder'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-650 hover:bg-slate-50'
          }`}
        >
          <Sparkles size={13} className={activeMode === 'builder' ? 'text-amber-300 animate-pulse' : 'text-amber-500'} /> 2. Rancang Projek (Builder)
        </button>
        <button
          onClick={() => setActiveMode('projects')}
          className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest rounded-2xl transition duration-150 flex items-center justify-center gap-2 whitespace-nowrap ${
            activeMode === 'projects'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-655 hover:bg-slate-50'
          }`}
        >
          <Briefcase size={13} className={activeMode === 'projects' ? 'text-indigo-200' : 'text-indigo-505'} /> 3. Projek BOQ Saya
        </button>
      </div>

      {activeMode === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Category Selector Side Menu (Desktop / Scrollable on Mobile) */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Filter size={14} className="text-indigo-500" /> Sidebar Kategori
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold">
              {(selectedType === 'jasa' ? dynamicServiceCategories : dynamicCatalogCategories).length - 1} Seksi
            </span>
          </div>

          {/* Catalog Categories listing */}
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-1.5 pb-2 lg:pb-0 scrollbar-none">
            {(selectedType === 'jasa' ? dynamicServiceCategories : dynamicCatalogCategories).map((cat) => {
              const count = (cat.id === 'all' || cat.id === 'all-service') 
                ? (selectedType === 'all' ? items.length : items.filter(i => i.type === selectedType).length)
                : items.filter(i => (selectedType === 'all' || i.type === selectedType) && (
                  i.category.toLowerCase().trim() === cat.label.toLowerCase().trim() || 
                  i.category.toLowerCase().replace(/\s+/g, '') === cat.id.replace(/\s+/g, '') ||
                  i.category.toLowerCase().replace(/\s+/g, '-') === cat.id
                )).length;

              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-left whitespace-nowrap lg:whitespace-normal transition-all shrink-0 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <cat.icon size={16} className={isSelected ? 'text-white' : 'text-indigo-500'} />
                    <div className="text-xs font-bold leading-tight">{cat.label}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Major Grid Panel containing actual listings */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Realtime Search & Control Box */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            
            {/* Search Box & Creation Switch */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, kategori, mrek brand, spesifikasi teknis, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-13 pr-5 py-4 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-[2rem] text-sm font-bold transition-all outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setTabView(prev => prev === 'grid' ? 'table' : 'grid')}
                  type="button"
                  className="p-3.5 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition active:scale-95"
                  title={tabView === 'grid' ? 'Ganti ke Tampilan Daftar' : 'Ganti ke Tampilan Kotak'}
                >
                  {tabView === 'grid' ? <List size={20} /> : <Grid size={20} />}
                </button>

                {user?.role === 'admin' && (
                  <div className="flex items-center gap-2">
                    {items.length > 0 && (
                      <button
                        onClick={handleClearAllCatalog}
                        type="button"
                        className="px-4 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95"
                        title="Kosongkan seluruh data katalog untuk mulai dari awal"
                      >
                        <Trash2 size={15} /> Kosongkan Katalog
                      </button>
                    )}
                    <button
                      onClick={handleOpenCreateForm}
                      className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition active:scale-95"
                    >
                      <Plus size={16} /> Tambah Item
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Expansive Advanced Advanced Filters Row Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
              
              {/* Type Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jenis Pekerjaan</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="barang">Barang (Produk)</option>
                  <option value="jasa">Jasa / Instalasi</option>
                </select>
              </div>

              {/* Brand Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mrek / Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="all">Semua Mrek</option>
                  {availableBrands.filter(b => b !== 'all').map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Constraints */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Total Harga Maksimal</label>
                <input
                  type="number"
                  placeholder="Rp Maksimal..."
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Urutan Data</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="newest">Produk Terbaru</option>
                  <option value="views">Paling Sering Dilihat</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                </select>
              </div>

            </div>

            {/* Active filters summary */}
            {(selectedCategory !== 'all' || selectedType !== 'all' || selectedBrand !== 'all' || priceRange.max || statusFilter !== 'all') && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 px-1">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Aktif Filter:</span>
                  {selectedCategory !== 'all' && (
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                      Kategori: {selectedCategory} <X size={10} className="cursor-pointer" onClick={() => setSelectedCategory('all')} />
                    </span>
                  )}
                  {selectedType !== 'all' && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                      Tipe: {selectedType} <X size={10} className="cursor-pointer" onClick={() => setSelectedType('all')} />
                    </span>
                  )}
                  {selectedBrand !== 'all' && (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                      Brand: {selectedBrand} <X size={10} className="cursor-pointer" onClick={() => setSelectedBrand('all')} />
                    </span>
                  )}
                  {priceRange.max && (
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                      Harga Max: Rp {parseFloat(priceRange.max).toLocaleString('id-ID')} <X size={10} className="cursor-pointer" onClick={() => setPriceRange(p => ({ ...p, max: '' }))} />
                    </span>
                  )}
                </div>
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-wider"
                >
                  Bersihkan Filter
                </button>
              </div>
            )}
          </div>

          {/* Loader or Empty results fallback */}
          {loading ? (
            <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="animate-spin text-indigo-600" size={36} />
              <div className="text-slate-400 font-bold text-sm">Menghubungkan ke database E-Katalog...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Filter size={28} />
              </div>
              <h3 className="text-lg font-black text-slate-800">Tidak ada Hasil yang Ditemukan</h3>
              <p className="text-slate-400 text-xs font-bold max-w-md">
                Kombinasi pencarian atau filter Anda tidak menghasilkan data catalog. Silakan ubah filter Anda atau tambah item katalog baru.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-slate-150 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition"
              >
                Reset Cari & Tampil Semua
              </button>
            </div>
          ) : (
            <>
              {/* Listings rendered either Grid or Table */}
              {tabView === 'grid' ? (
                // Elegant Bento/Bespoke Grid Layout
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedItems.map((item) => {
                    const totalCost = getItemTotalCost(item);
                    const isFaved = favorites.includes(item.id);
                    const actualViews = viewCountTracker[item.id] || item.views || 0;

                    return (
                      <motion.div
                        key={item.id}
                        layoutId={`catalog-card-${item.id}`}
                        onClick={() => handleViewDetail(item)}
                        className="bg-white rounded-[2.5rem] border border-slate-100 hover:border-slate-350 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 overflow-hidden cursor-pointer flex flex-col group relative"
                      >
                        {/* Image overlay with tags */}
                        <div className="h-48 bg-slate-50 relative overflow-hidden group">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                          
                          {/* Tags block */}
                          <div className="absolute top-4 left-4 flex flex-col gap-1 items-start">
                            <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-slate-900 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                              <Tag size={10} className="text-indigo-600 animate-pulse" /> {item.category}
                            </span>
                          </div>

                          {/* Top right Favorite & Type identifier flag */}
                          <div className="absolute top-4 right-4 flex items-center gap-1.5">
                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className="p-2 bg-white/95 backdrop-blur-md rounded-xl text-rose-500 hover:scale-110 active:scale-95 transition shadow-sm"
                            >
                              <Heart size={14} fill={isFaved ? 'currentColor' : 'none'} />
                            </button>
                            <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                              item.type === 'barang' ? 'bg-amber-500 text-white' : 'bg-emerald-650 text-white'
                            }`}>
                              {item.type}
                            </span>
                          </div>

                          {/* SKU bar at bottom left of image */}
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-slate-900/75 backdrop-blur-md px-3 py-1 text-white rounded-lg text-[9px] font-mono tracking-widest">
                              {item.sku}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{item.brand}</span>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                <Eye size={12} /> {actualViews}
                              </div>
                            </div>

                            <h3 className="font-extrabold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                              {item.name}
                            </h3>

                            <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          {/* Specs overview badging highlights */}
                          <div className="flex items-center gap-2 pt-1">
                            {item.capacity && (
                              <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
                                Cap: {item.capacity}
                              </span>
                            )}
                            {item.power && (
                              <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
                                Power: {item.power}
                              </span>
                            )}
                          </div>

                          {/* Footer with price tag & settings delete tools if admin */}
                          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Harga Jual Pokok</span>
                              <span className="text-base font-black text-indigo-600 tracking-tight mt-1">
                                {totalCost > 0 
                                  ? `Rp ${totalCost.toLocaleString('id-ID')}` 
                                  : 'Harga Custom / Jasa'}
                              </span>
                              <span className="text-[10px] text-amber-700 font-extrabold mt-0.5">
                                Modal: {item.costPrice ? `Rp ${item.costPrice.toLocaleString('id-ID')}` : 'Rp 0'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {user?.role === 'admin' && (
                                <button
                                  onClick={() => handleOpenEditForm(item)}
                                  className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-200"
                                  title="Edit Item"
                                >
                                  <Edit size={14} />
                                </button>
                              )}
                              
                              {/* Only Admin can delete */}
                              {user?.role === 'admin' && (
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100"
                                  title="Hapus Item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                // Responsive Table View List
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gambar & Item</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / Kode</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mrek</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Anggaran</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedItems.map((item) => {
                          const totalCost = getItemTotalCost(item);
                          const isFaved = favorites.includes(item.id);
                          const actualViews = viewCountTracker[item.id] || item.views || 0;

                          return (
                            <tr
                              key={item.id}
                              onClick={() => handleViewDetail(item)}
                              className="hover:bg-slate-50/50 transition duration-150 cursor-pointer"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <img
                                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=100'}
                                    alt={item.name}
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                                  />
                                  <div className="space-y-0.5">
                                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.name}</h4>
                                    <div className="flex gap-2">
                                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{item.type}</span>
                                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                        <Eye size={10} /> {actualViews}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                  {item.sku}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-slate-700 font-bold">{item.category}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-slate-500 font-bold">{item.brand || 'N/A'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-slate-900 font-black">
                                  Rp {totalCost.toLocaleString('id-ID')}
                                  {item.type === 'jasa' && (
                                    <span className="ml-1 text-[9px] text-indigo-600 font-black bg-indigo-50 px-1 py-0.5 rounded uppercase">Jasa</span>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  {user?.role === 'admin' && (
                                    <button
                                      onClick={() => handleOpenEditForm(item)}
                                      className="p-2 text-slate-500 hover:bg-slate-150 rounded-xl transition"
                                      title="Edit Item"
                                    >
                                      <Edit size={14} />
                                    </button>
                                  )}
                                  {user?.role === 'admin' && (
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                      title="Hapus Item"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
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

              {/* Pagination controls */}
              <div className="flex items-center justify-between bg-white px-6 py-4 rounded-[1.75-rem] border border-slate-100 shadow-sm">
                <span className="text-xs text-slate-400 font-bold">
                  Menampilkan <span className="text-slate-800 font-black">{paginatedItems.length}</span> dari <span className="text-slate-800 font-black">{filteredItems.length}</span> produk
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                        currentPage === i + 1 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      )}

      {activeMode === 'builder' && (
        <div className="bg-slate-50 p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} /> Project Architect & Cost Estimator
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Rangkai dan kalkulasikan seluruh kebutuhan projek STP / WWTP kustom Anda secara real-time.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setBuilderItems([]);
                  alert('Struktur rancangan dibersihkan.');
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Reset Struktur
              </button>
              <button
                onClick={() => {
                  setBuildProjName('Rancangan Sistem STP Biofilter 25 m3/hari');
                  setBuildClientName('PT Indo Perkasa');
                  setBuildCapacity('25 m³/hari');
                  setBuildProjType('Instalasi STP');
                  setBuildProjDesc('Sistem pengolahan air limbah domestik terintegrasi dengan tangki biofilter silinder, aerasi merata blower Futsu, dosing kaporit & alternate panel automatic.');
                  setBuilderItems([
                    {
                      id: 'blower-001',
                      name: 'Root Blower Futsu Monoblock TST-50',
                      sku: 'BLW-FUTSU-TST50',
                      brand: 'Futsu',
                      unit: 'Set',
                      priceItem: 29800000,
                      priceService: 2000000,
                      priceInstallation: 3500000,
                      quantity: 1,
                      isCustom: false,
                      specifications: 'Root Blower Aerasi TST-50'
                    },
                    {
                      id: 'pompa-001',
                      name: 'Pompa Centrifugal Ebara 3M 40-160/4.0',
                      sku: 'POM-EBARA-3M40160',
                      brand: 'Ebara',
                      unit: 'Unit',
                      priceItem: 18500000,
                      priceService: 1500000,
                      priceInstallation: 2500000,
                      quantity: 2,
                      isCustom: false,
                      specifications: 'Pompa sirkulasi influent'
                    }
                  ]);
                  alert('Contoh rancangan berhasil dimuat ke dalam workspace.');
                }}
                className="px-4 py-2 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Gunakan Contoh
              </button>
              <button
                onClick={() => setShowAiArchitectModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-650 hover:from-emerald-700 hover:to-indigo-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer border border-emerald-500/10"
              >
                <Sparkles size={14} className="text-amber-300 animate-pulse" /> Desain Otomatis AI
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-sm">
            {/* Left Column: Metadata & Financial Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 text-slate-700 shadow-sm space-y-4">
                <span className="text-[10px] font-black text-indigo-650 uppercase tracking-widest block border-b border-slate-100 pb-1">
                  A. Spesifikasi & Sasaran Projek
                </span>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Nama Projek Sistem <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={buildProjName}
                      onChange={(e) => setBuildProjName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl font-bold outline-none font-sans"
                      placeholder="Contoh: Paket STP Biofilter Hotel Citadines"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1 font-sans">Klien Sasaran / Instansi</label>
                    <input
                      type="text"
                      value={buildClientName}
                      onChange={(e) => setBuildClientName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl font-bold outline-none"
                      placeholder="Contoh: PT Hotel Mulia"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Jenis Sistem</label>
                      <select
                        value={buildProjType}
                        onChange={(e) => setBuildProjType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                      >
                        <option value="Instalasi STP">Instalasi STP</option>
                        <option value="Instalasi WWTP">Instalasi WWTP</option>
                        <option value="Fabrikasi Tanki">Fabrikasi Tanki</option>
                        <option value="Piping">Piping</option>
                        <option value="service maintenance">Service Maintenance</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Kapasitas Aliran</label>
                      <input
                        type="text"
                        value={buildCapacity}
                        onChange={(e) => setBuildCapacity(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl font-bold outline-none"
                        placeholder="E.g. 50 m³/hari"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Deskripsi Narasi Sistem</label>
                    <textarea
                      value={buildProjDesc}
                      onChange={(e) => setBuildProjDesc(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl font-bold outline-none resize-none leading-relaxed text-xs"
                      placeholder="Gambarkan lingkup kerja konstruksi dan fabrikasi..."
                    />
                  </div>
                </div>
              </div>

              {/* Financial calculations */}
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl space-y-4">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block border-b border-white/10 pb-1">
                  B. Rekapitulasi Anggaran Sistem
                </span>

                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-450">Pengadaan Alat Utama:</span>
                    <span className="font-mono text-slate-205">Rp {projectCosts.equipment.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-455">Pekerjaan Jasa / Eng:</span>
                    <span className="font-mono text-slate-205">Rp {projectCosts.service.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-455">Konstruksi & Instalasi:</span>
                    <span className="font-mono text-slate-205">Rp {projectCosts.installation.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                    <span className="text-slate-350">Subtotal Anggaran:</span>
                    <span className="font-mono text-slate-300">Rp {projectCosts.subtotal.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <label className="font-black text-slate-400 uppercase tracking-wider">Diskon Tambahan (%)</label>
                      <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-amber-300">-{buildDiscount}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="5"
                      value={buildDiscount}
                      onChange={(e) => setBuildDiscount(parseInt(e.target.value) || 0)}
                      className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {buildDiscount > 0 && (
                    <div className="flex justify-between text-amber-400 font-bold border-t border-white/10 pt-1.5 text-xs">
                      <span>Pemotongan Diskon:</span>
                      <span className="font-mono">- Rp {projectCosts.discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="border-t border-indigo-500/30 pt-3 flex flex-col gap-0.5">
                    <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wide">ESTIMASI INVESTASI TOTAL</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 antialiased tracking-tight">
                      Rp {projectCosts.finalTotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      onClick={() => {
                        generateProfessionalBoQPdf();
                      }}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition duration-150 shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={14} className="text-indigo-200 animate-pulse" /> Cetak BOQ Spesifikasi (PDF)
                    </button>

                    {/* BOQ Project Storage Controls */}
                    {activeBoqId ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSaveBoqProject(false)}
                          className="py-3 bg-emerald-600 hover:bg-emerald-750 text-white font-black uppercase tracking-widest text-[9px] rounded-2xl transition duration-150 active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                          title="Perbarui data rancangan BOQ ini langsung di cloud database"
                        >
                          <Check size={11} /> Perbarui BOQ
                        </button>
                        <button
                          onClick={() => handleSaveBoqProject(true)}
                          className="py-3 bg-slate-705 hover:bg-slate-800 text-slate-150 font-black uppercase tracking-widest text-[9px] rounded-2xl transition duration-150 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                          title="Simpan sebagai salinan projek BOQ kustom yang baru"
                        >
                          <Plus size={11} /> Salin Baru
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSaveBoqProject(false)}
                        className="w-full py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold uppercase tracking-widest text-[10px] rounded-2xl transition duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Bookmark size={12} className="text-indigo-500" /> Simpan ke Projek BOQ Saya
                      </button>
                    )}

                    <button
                      onClick={handlePublishProject}
                      disabled={isPublishing}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold uppercase tracking-widest text-[9px] rounded-2xl transition duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isPublishing ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" /> Sedang Menerbitkan...
                        </>
                      ) : (
                        <>
                          <FileCheck size={12} className="text-emerald-400" /> Terbitkan ke E-Katalog Umum
                        </>
                      )}
                    </button>
                    <p className="text-[9px] text-slate-450 font-medium text-center pl-1 leading-relaxed">
                      Layanan di atas akan disimpan sebagai paket kustom di e-katalog, sedangkan berkas PDF dapat menyusun surat penawaran komersil dan detail BoQ formal dengan kop surat & logo perusahaan sendiri.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Built component material lists */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-205 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-indigo-650 uppercase tracking-widest block">
                      C. Rincian Komponen, Pompa & Material Pilihan
                    </span>
                    <p className="text-xs text-slate-500 font-bold">
                      Gabungkan daftar item E-Katalog yang sudah ada ataupun buat spesifikasi baru yang belum tersedia.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddBuilderItem(true)}
                    className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Plus size={14} /> Tambahkan Item
                  </button>
                </div>

                {builderItems.length === 0 ? (
                  <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-[2rem] space-y-3">
                    <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-slate-50 text-slate-400">
                      <Box size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Workspace Kosong</h4>
                      <p className="text-xs text-slate-450 font-bold max-w-sm mx-auto leading-relaxed">
                        Belum ada item dalam daftar rancangan. Silakan tekan tombol &quot;Tambahkan Item&quot; untuk menyusun material STP / WWTP Anda.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                    {builderItems.map((bi) => {
                      const totalItemVal = ((bi.priceItem || 0) + (bi.priceService || 0) + (bi.priceInstallation || 0)) * bi.quantity;
                      return (
                        <div
                          key={bi.id}
                          className="p-5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-2xl transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[8px] font-black uppercase tracking-wider rounded font-mono">
                                {bi.sku}
                              </span>
                              {bi.isCustom && (
                                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[8px] font-black uppercase tracking-wider rounded">
                                  Custom Material
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-black text-slate-800 leading-tight">{bi.name}</h4>
                            <div className="text-[10px] text-slate-500 font-bold flex gap-3 flex-wrap">
                              <span>Mrek: <b className="text-slate-800">{bi.brand}</b></span>
                              <span>Satuan: <b className="text-slate-800">{bi.unit}</b></span>
                              {bi.specifications && (
                                <span className="line-clamp-1">Keterangan: {bi.specifications}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                            {/* Quantity buttons switcher */}
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-1 py-0.5">
                              <button
                                onClick={() => handleUpdateBuilderItemQty(bi.id, bi.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-black transition"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-black text-slate-850 font-mono">
                                {bi.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateBuilderItemQty(bi.id, bi.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-black transition"
                              >
                                +
                              </button>
                            </div>

                            {/* Cost matrix */}
                            <div className="text-right space-y-0.5 min-w-[125px]">
                              <span className="text-[9px] font-bold text-slate-450 block uppercase">Subtotal Biaya</span>
                              <span className="text-xs font-black font-mono text-slate-850 block">
                                Rp {totalItemVal.toLocaleString('id-ID')}
                              </span>
                              {bi.quantity > 1 && (
                                <span className="text-[8px] font-bold text-slate-400 block font-mono">
                                  (@ Rp {((bi.priceItem || 0) + (bi.priceService || 0) + (bi.priceInstallation || 0)).toLocaleString('id-ID')})
                                </span>
                              )}
                            </div>

                            {/* Remove action tool */}
                            <button
                              onClick={() => handleRemoveBuilderItem(bi.id)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition hover:scale-105 active:scale-95"
                              title="Hapus baris ini"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMode === 'projects' && (
        <div className="bg-slate-50 p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 font-sans">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Briefcase className="text-indigo-650" size={20} /> Daftar Projek BOQ Saya
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Kelola, buka kembali ke dalam builder, dan integrasikan langsung seluruh rancangan kustom Anda ke Surat Penawaran SPH.
              </p>
            </div>
            
            <button
              onClick={() => {
                setBuilderItems([]);
                setActiveBoqId(null);
                setActiveBoqCreatedAt(null);
                setBuildProjName('Rancangan Projek Baru');
                setBuildClientName('');
                setBuildProjDesc('');
                setActiveMode('builder');
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} /> Buat Projek BOQ Baru
            </button>
          </div>

          {savedBoqProjects.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-[2.5rem] border border-slate-150 shadow-sm flex flex-col items-center justify-center p-8 font-sans">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <HardDrive size={24} />
              </div>
              <h4 className="text-base font-black text-slate-700">Belum Ada Projek BOQ Tersimpan</h4>
              <p className="text-xs text-slate-450 font-bold max-w-md mt-1 mb-6 leading-relaxed text-center">
                Anda belum menyimpan rancangan kustom apa pun. Silakan buka tab "Rancang Projek (Builder)" di atas untuk menyusun rangkaian peralatan dan menyimpannya ke database.
              </p>
              <button
                onClick={() => setActiveMode('builder')}
                className="px-4 py-2 text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Mulai Merancang Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
              {savedBoqProjects.map((boq) => {
                const totalItems = boq.items?.length || 0;
                const totalCost = boq.costs?.finalTotal || 0;
                
                return (
                  <div key={boq.id} className="bg-white rounded-[2.5rem] border border-slate-150 shadow-sm hover:shadow-md transition duration-200 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                          {boq.projType || 'STP / WWTP'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          {new Date(boq.updatedAt || boq.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-black text-slate-800 leading-snug line-clamp-1" title={boq.name}>
                          {boq.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                          Klien: <span className="text-slate-700 font-extrabold">{boq.clientName || 'Instansi Umum'}</span>
                        </p>
                        {boq.capacity && (
                          <p className="text-[11px] text-slate-400 font-bold">
                            Kapasitas Desain: <span className="text-slate-600 font-extrabold">{boq.capacity}</span>
                          </p>
                        )}
                      </div>

                      <div className="border-t border-b border-slate-100 py-3 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">Jumlah Komponen</span>
                          <span className="text-slate-750 font-black">{totalItems} Item material</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">Harga Pokok</span>
                          <span className="text-slate-750 font-extrabold font-mono">Rp {boq.costs?.subtotal?.toLocaleString('id-ID')}</span>
                        </div>
                        {boq.discount > 0 && (
                          <div className="flex justify-between items-center text-xs text-rose-600">
                            <span className="font-bold">Potongan ({boq.discount}%)</span>
                            <span className="font-extrabold font-mono">-Rp {boq.costs?.discountAmount?.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Price Banner */}
                      <div className="p-3 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-between shadow-inner">
                        <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Deal Budget</span>
                        <span className="text-sm font-black font-mono">
                          Rp {totalCost.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Action Triggers */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setActiveBoqId(boq.id);
                            setActiveBoqCreatedAt(boq.createdAt);
                            setBuildProjName(boq.name || '');
                            setBuildClientName(boq.clientName || '');
                            setBuildProjType(boq.projType || 'Instalasi STP');
                            setBuildCapacity(boq.capacity || '');
                            setBuildProjDesc(boq.description || '');
                            setBuildDiscount(boq.discount || 0);
                            setBuilderItems(boq.items || []);
                            setActiveMode('builder');
                          }}
                          className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                          title="Buka kembali rancangan ini untuk dimodifikasi"
                        >
                          <Edit size={12} className="text-blue-500" /> Buka & Edit
                        </button>

                        <button
                          onClick={async () => {
                            generateProfessionalBoQPdf(boq);
                          }}
                          className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer w-full"
                          title="Cetak BOQ Spesifikasi PDF untuk projek ini"
                        >
                          <Printer size={12} className="text-emerald-500" /> Cetak BOQ (PDF)
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteBoqProject(boq.id, boq.name)}
                        className="w-full text-center text-[10px] font-black text-rose-600 hover:text-rose-700 transition uppercase tracking-wider py-1 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        Hapus Projek
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. ADD BUILDER ITEM POPUP DIALOG */}
      <AnimatePresence>
        {showAddBuilderItem && (
          <div className="fixed inset-0 lg:left-72 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white max-h-[85vh] flex flex-col font-sans"
            >
              <div className="p-6 md:p-8 bg-indigo-950 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Plus className="text-amber-300" size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Tambahkan Komponen / Layanan</h3>
                    <p className="text-indigo-200 text-xs font-semibold">Tentukan pilihan material, peralatan utama, atau isian spesifikasi kustom.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddBuilderItem(false)}
                  className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl border border-white/5 active:scale-95 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mode Toggle inside Add Modal */}
              <div className="flex border-b border-sidebar-100 px-6 gap-4 bg-slate-50">
                <button
                  onClick={() => setAddMode('catalog')}
                  className={`py-4 px-2 text-xs font-black uppercase tracking-wider relative transition duration-150 ${
                    addMode === 'catalog'
                      ? 'text-indigo-650 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pilih dari E-Katalog Bawaan
                </button>
                <button
                  onClick={() => setAddMode('custom')}
                  className={`py-4 px-2 text-xs font-black uppercase tracking-wider relative transition duration-150 ${
                    addMode === 'custom'
                      ? 'text-indigo-650 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  + Tulis Spesifikasi Custom Baru (Belum Ada)
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-4 text-xs font-semibold flex-1">
                {addMode === 'catalog' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Pilih Item E-Katalog Bawaan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedCatalogId}
                        onChange={(e) => setSelectedCatalogId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 font-sans"
                      >
                        <option value="">-- Cari atau pilih item katalog... --</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            [{item.sku}] {item.name} - Rp {((item.priceItem || 0) + (item.priceService || 0) + (item.priceInstallation || 0)).toLocaleString('id-ID')} ({item.brand})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Kuantitas / Jumlah Unit
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={catalogQtyToAdd}
                        onChange={(e) => setCatalogQtyToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none font-mono text-center text-sm"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={handleAddCatalogToBuilder}
                        className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition shadow-md active:scale-95"
                      >
                        Tambahkan ke Anggaran Proyek
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Item Custom <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={customItemName}
                          onChange={(e) => setCustomItemName(e.target.value)}
                          placeholder="E.g. Fabrikasi Bak FRP Tangki Silinder"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mrek / Brand</label>
                        <input
                          type="text"
                          value={customItemBrand}
                          onChange={(e) => setCustomItemBrand(e.target.value)}
                          placeholder="E.g. Lokal Fabrikasi"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">SKU / Kode (Acak)</label>
                        <input
                          type="text"
                          value={customItemSKU}
                          onChange={(e) => setCustomItemSKU(e.target.value)}
                          placeholder="E.g. CST-TNK-1"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none font-mono text-xs uppercase"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Satuan Paket</label>
                        <input
                          type="text"
                          value={customItemUnit}
                          onChange={(e) => setCustomItemUnit(e.target.value)}
                          placeholder="E.g. Lot, Set, Pcs"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kuantitas</label>
                        <input
                          type="number"
                          min="1"
                          value={customItemQty}
                          onChange={(e) => setCustomItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none font-mono text-center text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest pl-1">Harga Alat (Rp jika ada)</label>
                        <input
                          type="number"
                          value={customItemPriceItem}
                          onChange={(e) => setCustomItemPriceItem(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest pl-1">Caj Jasa / Supervisi (Rp)</label>
                        <input
                          type="number"
                          value={customItemPriceService}
                          onChange={(e) => setCustomItemPriceService(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest pl-1">Harga Instalasi (Rp)</label>
                        <input
                          type="number"
                          value={customItemPriceInstallation}
                          onChange={(e) => setCustomItemPriceInstallation(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest pl-1">Keterangan Spesifikasi Teknis Custom</label>
                      <textarea
                        value={customItemSpecs}
                        onChange={(e) => setCustomItemSpecs(e.target.value)}
                        rows={2}
                        placeholder="Contoh: Konstruksi baseplate tebal 4mm, saringan inlet biobox, finishing anti-karat..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-medium outline-none resize-none leading-relaxed text-xs"
                      />
                    </div>

                    {/* Integrated Auto-save to E-Katalog Registry option card */}
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customItemSaveToCatalog}
                          onChange={(e) => setCustomItemSaveToCatalog(e.target.checked)}
                          className="w-4.5 h-4.5 accent-indigo-650 rounded cursor-pointer mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-black text-indigo-950 block">Otomatis Terbitkan ke E-Katalog Umum</span>
                          <span className="text-[10px] text-slate-500 font-bold block leading-relaxed mt-0.5">
                            Agar material/spek baru IPAL ini bisa dicari dan dipilih kembali oleh projek IPAL lainnya nanti tanpa perlu nulis ulang.
                          </span>
                        </div>
                      </label>

                      {customItemSaveToCatalog && (
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-100/60 transition-all duration-155">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1">Kategori E-Katalog</label>
                            <select
                              value={customItemCategory}
                              onChange={(e) => setCustomItemCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-250 text-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 font-sans"
                            >
                              <option value="Peralatan Utama STP/WWTP">Peralatan Utama STP/WWTP</option>
                              <option value="Bak & Tangki Fabrikasi">Bak & Tangki Fabrikasi</option>
                              <option value="Media Bakteri & Filter">Media Bakteri & Filter</option>
                              <option value="Pompa Tranfer & Sirkulasi">Pompa Tranfer & Sirkulasi</option>
                              <option value="Blower & Aerasi">Blower & Aerasi</option>
                              <option value="Instalasi Perpipaan">Instalasi Perpipaan</option>
                              <option value="Panel Otomatisasi & Elektrikal">Panel Otomatisasi & Elektrikal</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1">Jenis Layanan / Tipe</label>
                            <select
                              value={customItemType}
                              onChange={(e) => setCustomItemType(e.target.value as 'barang' | 'jasa')}
                              className="w-full px-3 py-2 bg-white border border-slate-250 text-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 font-sans"
                            >
                              <option value="barang">Barang (Material Fisik)</option>
                              <option value="jasa">Jasa / Fabrikasi Manual</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={handleAddCustomToBuilder}
                        className="w-full py-4 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition shadow-md active:scale-95"
                      >
                        + Tambahkan Komponen Custom Baru
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI ARCHITECT GENERATION POPUP DIALOG */}
      <AnimatePresence>
        {showAiArchitectModal && (
          <div className="fixed inset-0 lg:left-72 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white max-h-[85vh] flex flex-col font-sans"
            >
              <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-950 to-indigo-950 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Sparkles className="text-amber-300 animate-bounce" size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Garda AI Project Architect</h3>
                    <p className="text-emerald-300/80 text-xs font-semibold">Tentukan parameter kapasitas, kami rancang seluruh BoQ & estimasi harga lokal Indonesia otomatis.</p>
                  </div>
                </div>
                <button
                  disabled={aiArchitectLoading}
                  onClick={() => {
                    setShowAiArchitectModal(false);
                    setAiArchitectError(null);
                  }}
                  className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl border border-white/5 disabled:opacity-50 active:scale-95 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-5 text-xs font-semibold flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Tulis Spesifikasi Sistem STP / WWTP yang Anda Inginkan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    disabled={aiArchitectLoading}
                    value={aiArchitectPrompt}
                    onChange={(e) => setAiArchitectPrompt(e.target.value)}
                    rows={4}
                    placeholder="Contoh: Buatkan penawaran STP IPAL kapasitas 15 m3/hari tipe biofilter anaerob-aerob untuk sistem pengolahan limbah gedung apartemen..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl font-bold outline-none resize-none leading-relaxed text-sm transition-all text-slate-800"
                  />
                </div>

                {/* Recommendations Templates / Quick Clicks */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Rekomendasi Template Desain Cepat:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        label: "STP IPAL Biofilter Domestik 10 m3/hari",
                        prompt: "Sistem STP IPAL Biofilter anaerob-aerob kapasitas 10 m3 per hari untuk limbah rumah tangga perumahan, gunakan pompa Ebara dan media sarang tawon pvc."
                      },
                      {
                        label: "WWTP IPAL Klinik & Rumah Sakit 25 m3/hari",
                        prompt: "Sistem WWTP IPAL Medis Rumah Sakit atau Klinik kapasitas 25 m3/hari dengan klorinasi/disinfeksi dosing pump Seko otomatis, kelengkapan filter karbon & pasir FRP."
                      },
                      {
                        label: "IPAL Restoran & Kafe Kecil 5 m3/hari",
                        prompt: "Sistem IPAL Restoran kapasitas 5 m3 per hari lengkap dengan Grease Trap penyaring minyak utama, pompa sirkulasi transfer, dan aerasi ring blower Showfou."
                      },
                      {
                        label: "Sistem Fabrikasi Tangki Limbah FRP Tangguh 30 m3",
                        prompt: "Material fabrikasi tangki silinder fiberglass anti korosi kapasitas total volume 30 meter kubik (m3), struktur penunjang sekat biofilter anaerob."
                      }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        disabled={aiArchitectLoading}
                        onClick={() => setAiArchitectPrompt(item.prompt)}
                        className="p-3 text-left border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-xl transition cursor-pointer text-slate-700 bg-white shadow-sm flex flex-col justify-between"
                      >
                        <span className="font-black text-[11px] text-slate-850 block">{item.label}</span>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1 line-clamp-1">{item.prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Banner */}
                {aiArchitectError && (
                  <div className="p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl flex items-start gap-2.5">
                    <div className="p-1 bg-rose-200/50 rounded-lg text-rose-800">
                      <X size={14} />
                    </div>
                    <div>
                      <span className="font-black block text-xs">Gagal Merakit Desain:</span>
                      <span className="text-[11px] text-rose-650 leading-relaxed block mt-0.5">{aiArchitectError}</span>
                    </div>
                  </div>
                )}

                {/* Help tip card */}
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
                  <span className="text-emerald-900 font-black text-xs block">💡 Bagaimana Cara Kerja Garda AI?</span>
                  <p className="text-[10px] text-emerald-700/95 font-medium leading-relaxed pl-0.5">
                    Garda AI menganalisis spesifikasi volume limbah yang Anda ketikkan, memetakan diagram sistem fungsional secara real-time, lalu mencari estimasi harga material (seperti pompa Ebara, Root Blower Futsu, diffuser, panel elektrik) berdasarkan tren supplier & marketplace terpercaya di Indonesia secara otomatis.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  disabled={aiArchitectLoading}
                  onClick={() => {
                    setShowAiArchitectModal(false);
                    setAiArchitectError(null);
                  }}
                  className="px-5 py-3 bg-slate-200 hover:bg-slate-350 text-slate-750 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  disabled={aiArchitectLoading}
                  onClick={handleGenerateBoqWithAi}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-indigo-650 hover:from-emerald-700 hover:to-indigo-750 text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md active:scale-95 cursor-pointer disabled:opacity-85 flex items-center gap-2"
                >
                  {aiArchitectLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-emerald-200" />
                      <span>Sedang Merancang Skema IPAL AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-amber-300" />
                      <span>Desain BoQ Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL PANEL - OVERLAY POPUP */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 lg:left-72 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden border border-white max-h-[90vh] flex flex-col"
            >
              {/* Header block with title & closes */}
              <div className="p-6 md:p-8 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[9px] font-mono tracking-widest text-indigo-300">
                      {selectedItem.sku}
                    </span>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      {selectedItem.category} &rsaquo; {selectedItem.subCategory || 'Standard'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black mt-1 leading-tight tracking-tight text-white">
                    {selectedItem.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-3 bg-white/10 hover:bg-white/15 rounded-2xl transition border border-white/5 active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div className="p-8 overflow-y-auto space-y-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Images column (left) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="aspect-[4/3] bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm relative group">
                    <img
                      src={selectedItem.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'}
                      alt={selectedItem.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur-md text-white font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg mr-1 shadow-sm">
                      Merek: {selectedItem.brand}
                    </span>
                  </div>

                  {/* Dynamic image thumbnail indicators if multiple */}
                  {selectedItem.images && selectedItem.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedItem.images.map((img, i) => (
                        <div key={i} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contract Calculator box within detail overlay */}
                  <div className="bg-slate-50 border border-slate-200/65 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-150 pb-2">
                      <div className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                        <Calculator size={14} /> Penaksiran Kontrak Client
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold">Simulator</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kuantitas Unit / Lot</label>
                        <input
                          type="number"
                          min="1"
                          value={calcQuantity}
                          onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-sans outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diskon Khusus (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="95"
                          value={calcClientDiscount}
                          onChange={(e) => setCalcClientDiscount(Math.min(95, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-sans outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Checkboxes parameters */}
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={calcIncludeService}
                          onChange={(e) => setCalcIncludeService(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        + Jasa
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={calcIncludeInstall}
                          onChange={(e) => setCalcIncludeInstall(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        + Instalasi
                      </label>
                    </div>

                    {/* Calculated Outcome */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-150">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimasi Total Penawaran</span>
                      <span className="text-base font-black text-indigo-600">
                        Rp {calculatedTotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Extensive specs description columns (right) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* General Header Data */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                    {selectedItem.type === 'jasa' ? (
                      <div>
                        <span className="text-[9px] text-indigo-600 font-black uppercase tracking-widest block leading-none">Total Nilai Integrasi Jasa</span>
                        <span className="text-2xl font-black text-indigo-700 tracking-tight mt-1.5 block">
                          Rp {getItemTotalCost(selectedItem).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Anggaran Pokok (Barang / Unit)</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tight mt-1.5 block">
                          {selectedItem.priceItem > 0 
                            ? `Rp ${selectedItem.priceItem.toLocaleString('id-ID')} / ${selectedItem.unit}` 
                            : 'Hubungi Sales Admin'}
                        </span>
                      </div>
                    )}

                    {/* Secondary price matrices */}
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="border-l-2 border-amber-400 pl-4 bg-amber-50/50 py-1.5 px-3 rounded-r-xl">
                        <span className="text-[9px] text-amber-700 font-black uppercase tracking-widest block leading-none">Harga Modal / HPP</span>
                        <span className="font-black text-amber-900 text-sm block mt-1">
                          {selectedItem.costPrice ? `Rp ${selectedItem.costPrice.toLocaleString('id-ID')}` : 'Rp 0 (Belum diisi)'}
                        </span>
                      </div>
                      {selectedItem.type === 'barang' && selectedItem.priceService > 0 && (
                        <div className="border-l border-slate-200 pl-4">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block leading-none">Harga Jasa</span>
                          <span className="font-extrabold text-slate-800 text-xs block mt-1">Rp {selectedItem.priceService.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {selectedItem.type === 'barang' && selectedItem.priceInstallation > 0 && (
                        <div className="border-l border-slate-200 pl-4">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block leading-none">Instalasi</span>
                          <span className="font-extrabold text-slate-800 text-xs block mt-1">Rp {selectedItem.priceInstallation.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {selectedItem.type === 'jasa' && (
                        <div className="border-l border-slate-200 pl-4">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block leading-none">Durasi Teknis</span>
                          <span className="font-extrabold text-amber-600 text-xs block mt-1">{selectedItem.estimationTime || 'Disesuaikan'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description segment */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Deskripsi Ringkasan</h4>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      {selectedItem.description}
                    </p>
                  </div>

                  {/* Detailed Specifications Sheet */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Spesifikasi Lengkap / Data Lembar</h4>
                    <div className="bg-slate-900 border border-slate-950 p-6 rounded-3xl text-indigo-100 text-xs font-mono whitespace-pre-line leading-relaxed shadow-inner">
                      {selectedItem.specifications || 'Tidak ada entri parameter lembaran spesifikasi khusus.'}
                    </div>
                  </div>

                  {/* Bento Technical details values columns */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { l: 'Material', v: selectedItem.material },
                      { l: 'Kapasitas', v: selectedItem.capacity },
                      { l: 'Dimensi', v: selectedItem.dimensions },
                      { l: 'Power Listrik', v: selectedItem.power },
                      { l: 'Flow Rate', v: selectedItem.flowRate },
                      { l: 'Tekanan Udara', v: selectedItem.pressure },
                      { l: 'Garansi', v: selectedItem.warranty },
                      { l: 'Lokasi Simpan', v: selectedItem.stockLocation }
                    ].map((val, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">{val.l}</span>
                        <span className="text-xs font-extrabold text-slate-700 block mt-1 mb-0.5 whitespace-nowrap overflow-hidden text-overflow-ellipsis" title={val.v}>
                          {val.v || '-'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* SERVICE SPECIFIC BREAKDOWN DETAILS (Needed items & Manpower) */}
                  {selectedItem.type === 'jasa' && (
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-6">
                      
                      {/* Section Title */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
                          <Settings size={15} className="text-indigo-650" /> Rincian Komponen & Sumber Daya Jasa Terpilih
                        </h4>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg">
                          Jasa Layanan Terintegrasi
                        </span>
                      </div>

                      {/* Required Goods / Materials Listing */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Barang / Kebutuhan Material Pendukung</span>
                          <span className="text-xs font-bold text-slate-700">{(selectedItem.neededItems || []).length} jenis barang</span>
                        </div>
                        {(selectedItem.neededItems || []).length > 0 ? (
                          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  <th className="px-4 py-2.5">Nama Barang</th>
                                  <th className="px-4 py-2.5 text-right">Harga Satuan</th>
                                  <th className="px-4 py-2.5 text-center">Jumlah</th>
                                  <th className="px-4 py-2.5 text-right font-black">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {selectedItem.neededItems?.map((m, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/40">
                                    <td className="px-4 py-2.5 font-bold text-slate-800">{m.name}</td>
                                    <td className="px-4 py-2.5 text-slate-500 text-right">Rp {(m.price || 0).toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-2.5 text-slate-600 text-center font-bold">{m.qty}</td>
                                    <td className="px-4 py-2.5 text-indigo-600 text-right font-black">Rp {(m.qty * m.price).toLocaleString('id-ID')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-white border border-slate-200/50 rounded-2xl text-[11px] text-slate-400 font-bold">
                            Tidak diperlukan material pendukung khusus
                          </div>
                        )}
                      </div>

                      {/* Manpower breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kebutuhan Manpower Teknisi</span>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>Jumlah Teknisi</span>
                            <span className="text-slate-900 font-black">{selectedItem.manpowerQty || 0} Orang</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>Durasi Pekerjaan</span>
                            <span className="text-slate-900 font-black">{selectedItem.manpowerDays || 0} Hari</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>Tarif Harian (per Manday)</span>
                            <span className="text-indigo-600 font-black">Rp {(selectedItem.manpowerRate || 0).toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        {/* Cost Consolidation Summary */}
                        <div className="bg-indigo-950 p-4 rounded-2xl text-white space-y-1.5 flex flex-col justify-center">
                          <span className="text-[9px] font-mono tracking-widest text-indigo-300 uppercase block">Kombinasi Tarif Terhitung</span>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-indigo-200 font-medium font-sans">Jasa Keahlian Pokok:</span>
                            <span className="font-extrabold">Rp {(selectedItem.priceService || 0).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-indigo-200 font-medium font-sans">Kombinasi Material:</span>
                            <span className="font-extrabold">
                              Rp {(selectedItem.neededItems || []).reduce((acc, curr) => acc + (curr.qty * curr.price), 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-indigo-200 font-medium font-sans">Kombinasi Manpower:</span>
                            <span className="font-extrabold">
                              Rp {((selectedItem.manpowerQty || 0) * (selectedItem.manpowerRate || 0) * (selectedItem.manpowerDays || 1)).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs border-t border-indigo-800 pt-1.5 mt-1 text-amber-300">
                            <span className="font-black">Total Anggaran Jasa:</span>
                            <span className="font-mono text-sm font-black">Rp {getItemTotalCost(selectedItem).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Detailed Labor / Work Execution Details if exists */}
                  {(selectedItem.detailWork || selectedItem.includeWork || selectedItem.estimationTime) && (
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200/50 space-y-4">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-150 pb-2">
                        <FileCheck size={14} className="text-indigo-600" /> Detail Eksekusi & Pekerjaan Lapangan
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                        {selectedItem.detailWork && (
                          <div className="space-y-1 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm leading-relaxed col-span-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">SOP Pekerjaan Terpaut</span>
                            <span className="font-semibold text-slate-700 mt-1 block">{selectedItem.detailWork}</span>
                          </div>
                        )}
                        {selectedItem.includeWork && (
                          <div className="space-y-1 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Paket/Include Yang Diperoleh</span>
                            <span className="font-semibold text-slate-700 mt-1 block text-indigo-600">{selectedItem.includeWork}</span>
                          </div>
                        )}
                        {selectedItem.estimationTime && (
                          <div className="space-y-1 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Estimasi Pengerjaan</span>
                            <span className="font-semibold text-slate-700 mt-1 block text-amber-600">{selectedItem.estimationTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PDF Manual Viewer integration simulation */}
                  {selectedItem.pdfUrl && (
                    <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-indigo-950 uppercase tracking-wider leading-none">Buku Panduan PDF / Katalog Manual</div>
                          <span className="text-[10px] font-bold text-slate-500 block mt-1">{selectedItem.pdfName || 'Lihat Lembar Dokumen Teknis'}</span>
                        </div>
                      </div>
                      <a
                        href={selectedItem.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-white hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow"
                      >
                        Buka Dokumen <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {/* Button bar in details modal (Edit, WA Ask Inquiry) */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleOpenEditForm(selectedItem)}
                          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5"
                        >
                          <Edit size={14} /> Ganti Rincian
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteItem(selectedItem.id)}
                          className="p-3 text-rose-600 hover:bg-rose-50 rounded-full transition border border-rose-100"
                          title="Hapus Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const existingIndex = builderItems.findIndex(i => i.id === selectedItem.id);
                        if (existingIndex > -1) {
                          setBuilderItems(prev => {
                            const copy = [...prev];
                            copy[existingIndex].quantity += 1;
                            return copy;
                          });
                        } else {
                          const newItem: SelectedBuilderItem = {
                            id: selectedItem.id,
                            name: selectedItem.name,
                            sku: selectedItem.sku,
                            brand: selectedItem.brand,
                            unit: selectedItem.unit || 'Unit',
                            priceItem: selectedItem.priceItem || 0,
                            priceService: selectedItem.priceService || 0,
                            priceInstallation: selectedItem.priceInstallation || 0,
                            quantity: 1,
                            isCustom: false,
                            specifications: selectedItem.specifications || ''
                          };
                          setBuilderItems(prev => [...prev, newItem]);
                        }
                        alert(`Sukses! "${selectedItem.name}" berhasil ditambahkan ke daftar rancangan builder Anda.`);
                        setSelectedItem(null);
                        setActiveMode('builder');
                      }}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-black uppercase tracking-wider uppercase tracking-widest shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <Plus size={14} /> Tambah ke Rancangan
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CONFIGURABLE PROFESSIONAL PDF KOP SURAT & COMMERCIAL TERMS MODAL */}
      <AnimatePresence>
        {false && (
          <div className="fixed inset-0 lg:left-72 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col font-sans animate-fade-in"
            >
              {/* Modal Head */}
              <div className="p-6 md:p-8 bg-slate-900 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
                    <Printer size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight">Kustomisasi Dokumen Penawaran & BoQ</h3>
                    <p className="text-slate-440 text-xs font-semibold leading-relaxed">
                      Atur kop surat, logo perusahaan, data klien, masa berlaku, serta rincian komersial penawaran harga Anda.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPdfSetup(false)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-xl active:scale-95 transition cursor-pointer font-sans"
                  title="Tutup dialog"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body - Scrollable content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50 text-xs text-slate-800">
                
                {/* Visual feedback banner */}
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-start gap-3">
                  <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <span className="font-black text-indigo-950 uppercase tracking-wider block text-[10px]">Pratinjau Format Dokumen</span>
                    <p className="text-slate-600 font-semibold leading-relaxed">
                      Dokumen ekspor akan disusun profesional menjadi 2 halaman: Halaman 1 berisi kop surat, rincian klien, surat penawaran harga resmi (SPH) & tanda tangan; Halaman 2 berisi rincian Bill of Quantities (BoQ) lengkap dengan rincian alat & spesifikasi material.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* LEFT CHANNEL: BRANDING & KOP SENDER */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-205 shadow-sm space-y-5 text-left">
                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block border-b border-slate-100 pb-1 flex items-center gap-1">
                      <Briefcase size={12} className="text-indigo-505" /> Kop Surat & Instansi Pengirim
                    </span>

                    {/* Logo preset selector row */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block pl-1">Gaya Logo Perusahaan</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'preset1', label: 'Eko Air' },
                          { id: 'preset2', label: 'Biru Clean' },
                          { id: 'preset3', label: 'Tech Pro' },
                          { id: 'custom', label: 'Kustom' },
                        ].map((styleOpt) => (
                          <button
                            key={styleOpt.id}
                            type="button"
                            onClick={() => setCompanyLogoStyle(styleOpt.id as any)}
                            className={`p-2.5 rounded-xl border text-[10px] font-black text-center transition ${
                              companyLogoStyle === styleOpt.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-150 border-slate-200'
                            }`}
                          >
                            {styleOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Logo File Uploader */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[10px] text-slate-700 uppercase">File Logo Kustom (PNG/JPG):</span>
                        {customLogoBase64 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomLogoBase64(null);
                              setCompanyLogoStyle('preset1');
                            }}
                            className="text-rose-600 text-[9px] font-bold hover:underline"
                          >
                            Hapus File
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {customLogoBase64 ? (
                          <img
                            src={customLogoBase64}
                            alt="Custom Logo Preview"
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-contain rounded border border-white bg-white shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
                            <ImageIcon size={16} className="text-slate-400" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="w-full text-[10px] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer text-slate-500 font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Nama Perusahaan Anda</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white"
                          placeholder="Contoh: PT Water Treatment Indonesia"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Alamat Lengkap Kantor</label>
                        <textarea
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white resize-none"
                          placeholder="Alamat legal dan head office..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Nomor Telepon / Fax</label>
                          <input
                            type="text"
                            value={companyPhone}
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Email Resmi</label>
                          <input
                            type="email"
                            value={companyEmail}
                            onChange={(e) => setCompanyEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Website Perusahaan</label>
                        <input
                          type="text"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-505 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT CHANNEL: METADATA, CLIENT PIC & SIGNATURE */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-205 shadow-sm space-y-5 text-left">
                    <span className="text-[10px] font-black text-slate-455 uppercase tracking-wider block border-b border-slate-100 pb-1 flex items-center gap-1">
                      <Building size={12} className="text-indigo-505" /> Detail Klien & Surat Penawaran
                    </span>

                    <div className="space-y-4">
                      {/* Ref No */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1 font-sans">Nomor Surat Penawaran (Ref No)</label>
                          <button
                            type="button"
                            onClick={() => setBuildRefNo(`QUO/STP-WWTP/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`)}
                            className="text-indigo-650 text-[9px] font-black hover:underline uppercase"
                          >
                            Acak Ulang No
                          </button>
                        </div>
                        <input
                          type="text"
                          value={buildRefNo}
                          onChange={(e) => setBuildRefNo(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold outline-none focus:border-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Tanggal Surat</label>
                          <input
                            type="date"
                            value={quotationDate}
                            onChange={(e) => setQuotationDate(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Masa Berlaku (Hari)</label>
                          <input
                            type="number"
                            value={validityDays}
                            onChange={(e) => setValidityDays(parseInt(e.target.value) || 14)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono outline-none focus:border-indigo-500"
                            min="1"
                            max="365"
                          />
                        </div>
                      </div>

                      {/* Client PIC */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1 font-sans">Nama PIC Klien Penerima</label>
                        <input
                          type="text"
                          value={clientPic}
                          onChange={(e) => setClientPic(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white"
                          placeholder="Jabatan atau nama penanggungjawab..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1 font-sans">Alamat Instansi Klien & Pekerjaan</label>
                        <textarea
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white resize-none"
                          placeholder="Tujuan instansi, kota atau lokasi instalasi..."
                        />
                      </div>

                      {/* Authorized Person */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Penandatangan SPH</label>
                          <input
                            type="text"
                            value={picSenderName}
                            onChange={(e) => setPicSenderName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Jabatan Penandatangan</label>
                          <input
                            type="text"
                            value={picSenderTitle}
                            onChange={(e) => setPicSenderTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* BOTTOM: TERMS EDITOR */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-205 shadow-sm space-y-3 text-left">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block border-b border-slate-100 pb-1 flex items-center gap-1">
                    <FileText size={12} className="text-indigo-505" /> Syarat Pekerjaan & Ketentuan Komersial
                  </span>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block pl-1">
                      Ketentuan Khusus Penawaran (Tampil di Lembar Penutup / Halaman BoQ)
                    </label>
                    <textarea
                      value={termsNotes}
                      onChange={(e) => setTermsNotes(e.target.value)}
                      rows={5}
                      className="w-full p-4 bg-slate-50 border border-slate-200 font-medium leading-relaxed rounded-xl font-sans text-xs outline-none focus:border-indigo-500 focus:bg-white resize-none"
                    />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 rounded-b-[2.5rem]">
                <button
                  type="button"
                  onClick={() => setShowPdfSetup(false)}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-355 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition cursor-pointer font-sans"
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={() => {
                    generateProfessionalBoQPdf();
                    setShowPdfSetup(false);
                  }}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 shadow-md hover:shadow-indigo-500/10 active:scale-95 transition cursor-pointer font-sans"
                >
                  <FileText size={15} /> Cetak & Unduh PDF BoQ Resmi
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC FORM MODAL - ADD OR EDIT (INSERTS/UPDATES database) */}
      <AnimatePresence>
        {isFormOpen && (
          <CatalogFormModal
            user={user}
            editingItem={editingItem}
            onClose={() => setIsFormOpen(false)}
            onSaved={handleSavedSuccessfully}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPreviewOpen && (
          <DocumentPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            type="boq"
            initialBoqData={previewBoqData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// COMPONENT: DYNAMIC FORM TO CREATE/EDIT CATALOG ENTRIES
const CatalogFormModal: React.FC<{
  user: any;
  editingItem: CatalogItem | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ user, editingItem, onClose, onSaved }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State variables
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Pompa');
  const [subCategory, setSubCategory] = useState('');
  const [type, setType] = useState<'barang' | 'jasa'>('barang');
  const [brand, setBrand] = useState('');
  const [priceItem, setPriceItem] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [priceService, setPriceService] = useState('');
  const [priceInstallation, setPriceInstallation] = useState('');
  const [unit, setUnit] = useState('Unit');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [material, setMaterial] = useState('');
  const [capacity, setCapacity] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [power, setPower] = useState('');
  const [flowRate, setFlowRate] = useState('');
  const [pressure, setPressure] = useState('');
  const [warranty, setWarranty] = useState('1 Tahun');
  const [stockLocation, setStockLocation] = useState('Gudang Utama Jakarta');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  
  // Custom category states
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Multiple images inputs & manuals
  const [imagesText, setImagesText] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [detailWork, setDetailWork] = useState('');
  const [includeWork, setIncludeWork] = useState('');
  const [estimationTime, setEstimationTime] = useState('');

  // Service-specific states
  const [items, setItems] = useState<CatalogItem[]>([]);

  const dynamicCatalogCategories = useMemo(() => {
    const list = [...CATALOG_CATEGORIES];
    items.forEach(item => {
      if (item.type === 'barang' && item.category) {
        const isExist = list.some(c => c.label.toLowerCase().trim() === item.category.toLowerCase().trim() || c.id === item.category.toLowerCase().replace(/\s+/g, ''));
        if (!isExist) {
          list.push({
            id: item.category.toLowerCase().replace(/\s+/g, '-'),
            label: item.category,
            icon: Tag,
            desc: `Kategori kustom: ${item.category}`
          });
        }
      }
    });
    return list;
  }, [items]);

  const dynamicServiceCategories = useMemo(() => {
    const list = [...SERVICE_CATEGORIES];
    items.forEach(item => {
      if (item.type === 'jasa' && item.category) {
        const isExist = list.some(c => c.label.toLowerCase().trim() === item.category.toLowerCase().trim() || c.id === item.category.toLowerCase().replace(/\s+/g, ''));
        if (!isExist) {
          list.push({
            id: item.category.toLowerCase().replace(/\s+/g, '-'),
            label: item.category,
            icon: Tag,
            desc: `Kategori jasa kustom: ${item.category}`
          });
        }
      }
    });
    return list;
  }, [items]);
  const [neededItems, setNeededItems] = useState<{ id?: string; name: string; qty: number; price: number }[]>([]);
  const [manpowerQty, setManpowerQty] = useState('');
  const [manpowerRate, setManpowerRate] = useState('');
  const [manpowerDays, setManpowerDays] = useState('');

  const [itemSource, setItemSource] = useState<'catalog' | 'custom'>('catalog');
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [tmpItemName, setTmpItemName] = useState('');
  const [tmpItemPrice, setTmpItemPrice] = useState('');
  const [tmpItemQty, setTmpItemQty] = useState('1');

  // Load items to allow picking products
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const docs = await dbService.getCollection<CatalogItem>('catalog');
        const catalogItems = docs as CatalogItem[];
        setItems(catalogItems);
        const catalogProducts = catalogItems.filter(i => i.type === 'barang');
        if (catalogProducts.length > 0) {
          const first = catalogProducts[0];
          setSelectedCatalogId(first.id);
          setTmpItemName(first.name);
          setTmpItemPrice(String(first.priceItem));
        }
      } catch (err) {
        console.error('Error fetching catalog items for supporting choices:', err);
      }
    };
    fetchItems();
  }, []);

  // Auto populate values if editing
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setSku(editingItem.sku || '');
      
      const catVal = editingItem.category || 'Pompa';
      setCategory(catVal);
      const isProductPreset = CATALOG_CATEGORIES.some(c => c.label.toLowerCase().trim() === catVal.toLowerCase().trim());
      const isServicePreset = SERVICE_CATEGORIES.some(c => c.label.toLowerCase().trim() === catVal.toLowerCase().trim());
      const isPreset = editingItem.type === 'jasa' ? isServicePreset : isProductPreset;
      if (!isPreset && catVal) {
        setIsCustomCategory(true);
        setCustomCategory(catVal);
      } else {
        setIsCustomCategory(false);
        setCustomCategory('');
      }

      setSubCategory(editingItem.subCategory || '');
      setType(editingItem.type || 'barang');
      setBrand(editingItem.brand || '');
      setPriceItem(String(editingItem.priceItem || '0'));
      setCostPrice(String(editingItem.costPrice || '0'));
      setPriceService(String(editingItem.priceService || '0'));
      setPriceInstallation(String(editingItem.priceInstallation || '0'));
      setUnit(editingItem.unit || 'Unit');
      setDescription(editingItem.description || '');
      setSpecifications(editingItem.specifications || '');
      setMaterial(editingItem.material || '');
      setCapacity(editingItem.capacity || '');
      setDimensions(editingItem.dimensions || '');
      setPower(editingItem.power || '');
      setFlowRate(editingItem.flowRate || '');
      setPressure(editingItem.pressure || '');
      setWarranty(editingItem.warranty || '');
      setStockLocation(editingItem.stockLocation || '');
      setStatus(editingItem.status || 'aktif');
      setImagesText(editingItem.images?.join(', ') || '');
      setPdfUrl(editingItem.pdfUrl || '');
      setPdfName(editingItem.pdfName || '');
      setDetailWork(editingItem.detailWork || '');
      setIncludeWork(editingItem.includeWork || '');
      setEstimationTime(editingItem.estimationTime || '');

      // Service-specific states mapping
      setNeededItems(editingItem.neededItems || []);
      setManpowerQty(editingItem.manpowerQty ? String(editingItem.manpowerQty) : '');
      setManpowerRate(editingItem.manpowerRate ? String(editingItem.manpowerRate) : '');
      setManpowerDays(editingItem.manpowerDays ? String(editingItem.manpowerDays) : '');
    } else {
      // Create - auto generate SKU pattern based on date & random suffix
      generateSku('Pompa');
    }
  }, [editingItem]);

  // Generates intelligent SKU automatically
  const generateSku = (catSel: string) => {
    const prefix = catSel.substring(0, 3).toUpperCase().replace(/\s+/g, '');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const dateYear = new Date().getFullYear();
    setSku(`${prefix}-${dateYear}-${randomNum}`);
  };

  // When category changes, regenerate SKU code
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (!editingItem) {
      generateSku(val);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Harap lengkapi nama item katalog.');
      return;
    }
    if (!sku.trim()) {
      setErrorMsg('Harap masukan kode SKU / SKU manual.');
      return;
    }
    if (isCustomCategory && !customCategory.trim()) {
      setErrorMsg('Harap masukkan nama kategori baru.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    // Prepare images array
    let imagesArr = ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'];
    if (imagesText.trim()) {
      imagesArr = imagesText.split(',').map(s => s.trim()).filter(Boolean);
    }

    const payload: Omit<CatalogItem, 'id'> & { id?: string } = {
      name: name.trim(),
      sku: sku.trim(),
      category: finalCategory,
      subCategory: subCategory.trim(),
      type,
      brand: brand.trim() || 'WorkflowPro',
      priceItem: parseFloat(priceItem) || 0,
      costPrice: parseFloat(costPrice) || 0,
      priceService: parseFloat(priceService) || 0,
      priceInstallation: parseFloat(priceInstallation) || 0,
      unit: unit.trim() || 'Unit',
      description: description.trim(),
      specifications: specifications.trim(),
      material: material.trim(),
      capacity: capacity.trim(),
      dimensions: dimensions.trim(),
      power: power.trim(),
      flowRate: flowRate.trim(),
      pressure: pressure.trim(),
      warranty: warranty.trim(),
      stockLocation: stockLocation.trim(),
      status,
      createdBy: editingItem?.createdBy || user?.uid || 'anon',
      createdByName: editingItem?.createdByName || user?.name || 'Administrator',
      createdDate: editingItem?.createdDate || new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      images: imagesArr,
      pdfUrl: pdfUrl.trim() || undefined,
      pdfName: pdfName.trim() || undefined,
      detailWork: detailWork.trim() || undefined,
      includeWork: includeWork.trim() || undefined,
      estimationTime: estimationTime.trim() || undefined,
      views: editingItem?.views || Math.floor(Math.random() * 15), // small random views for demo feel
      neededItems: type === 'jasa' ? neededItems : undefined,
      manpowerQty: type === 'jasa' ? (parseInt(manpowerQty) || undefined) : undefined,
      manpowerRate: type === 'jasa' ? (parseFloat(manpowerRate) || undefined) : undefined,
      manpowerDays: type === 'jasa' ? (parseInt(manpowerDays) || undefined) : undefined,
    };

    try {
      if (editingItem) {
        // Update document
        payload.id = editingItem.id;
        await dbService.updateDocument('catalog', editingItem.id, payload);
      } else {
        // Create document
        await dbService.createDocument('catalog', payload);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal menyimpan ke database Firestore: ' + String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 lg:left-72 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden border border-white max-h-[90vh] flex flex-col"
      >
        <div className="p-6 md:p-8 bg-indigo-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Sparkles className="text-amber-300" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black">{editingItem ? 'Edit Item Katalog' : 'Buat Item Baru'}</h3>
              <p className="text-indigo-200 text-xs font-semibold leading-relaxed">Form Isian database Master Produk, Mrek, dan Estimasi Jasa STP / WWTP.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/15 rounded-2xl transition border border-white/5 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Form Body */}
        <form onSubmit={handleFormSubmit} className="p-8 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl flex items-center gap-3 font-semibold">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          {/* Section 1: Core parameters */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Compass size={14} /> 1. Parameter Utama {type === 'barang' ? 'Barang & Produk' : 'Jasa / Paket Pekerjaan'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {type === 'barang' ? 'Nama Item Katalog / Produk' : 'Nama Jasa / Paket Pekerjaan'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={type === 'barang' ? "E.g. Pompa Submersible Ebara 50 DS" : "E.g. Jasa Pemasangan & Alignment Pompa"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none font-sans"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Kode Item / SKU <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="POM-EBA-1"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none font-mono text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => generateSku(category)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800"
                    title="Generate SKU acak"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jenis Layanan <span className="text-rose-500">*</span></label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setType(newType);
                    if (newType === 'jasa') {
                      setCategory('Instalasi STP');
                    } else {
                      setCategory('Pompa');
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-indigo-700 bg-indigo-50/30 border-indigo-200/50 outline-none focus:border-indigo-500 font-sans"
                >
                  <option value="barang">Barang (Produk)</option>
                  <option value="jasa">Jasa Pekerjaan / Paket</option>
                </select>
              </div>

              {type === 'barang' ? (
                <>
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kategori Utama</label>
                    {isCustomCategory ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ketik Kategori Baru"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none font-sans text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCategory(false);
                            setCategory('Pompa');
                          }}
                          className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold transition whitespace-nowrap"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <select
                        value={category}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__NEW__') {
                            setIsCustomCategory(true);
                            setCustomCategory('');
                          } else {
                            handleCategoryChange(val);
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 font-sans"
                      >
                        {dynamicCatalogCategories.filter(c => c.id !== 'all').map((cat) => (
                          <option key={cat.id} value={cat.label}>{cat.label}</option>
                        ))}
                        <option value="__NEW__" className="text-indigo-650 font-black font-sans">+ Tambah Kategori Baru...</option>
                      </select>
                    )}
                  </div>

                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sub Kategori</label>
                    <input
                      type="text"
                      placeholder="E.g. Root Blower Aerator"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none font-sans"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mrek / Brand</label>
                    <input
                      type="text"
                      placeholder="E.g. Ebara, Futsu, Seko, Custom"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none font-sans"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kategori Jasa Utama</label>
                    {isCustomCategory ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ketik Kategori Jasa Baru"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none font-sans text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCategory(false);
                            setCategory('Instalasi STP');
                          }}
                          className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold transition whitespace-nowrap"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <select
                        value={category}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__NEW__') {
                            setIsCustomCategory(true);
                            setCustomCategory('');
                          } else {
                            handleCategoryChange(val);
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 font-sans"
                      >
                        {dynamicServiceCategories.filter(c => c.id !== 'all-service').map((cat) => (
                          <option key={cat.id} value={cat.label}>{cat.label}</option>
                        ))}
                        <option value="__NEW__" className="text-indigo-650 font-black font-sans">+ Tambah Kategori Baru...</option>
                      </select>
                    )}
                  </div>

                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sub Kategori Jasa</label>
                    <input
                      type="text"
                      placeholder="E.g. Overhaul Blower & Kalibrasi Sensor"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none font-sans"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Pricing Matrix */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <DollarSign size={14} /> 2. Matriks Estimasi Anggaran {type === 'barang' ? 'Produk' : 'Jasa & Pekerjaan'} (Rp)
            </h4>

            {type === 'barang' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Harga Jual Pokok (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceItem}
                    onChange={(e) => setPriceItem(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest pl-1">Harga Modal / HPP (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200 focus:border-amber-500 focus:bg-white rounded-2xl font-bold outline-none text-amber-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Biaya Jasa Instalasi (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceInstallation}
                    onChange={(e) => setPriceInstallation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Satuan Produk</label>
                  <input
                    type="text"
                    placeholder="E.g. Unit, Pcs, Set, Meter"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Harga Jasa Paket (Rp) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceService === '0' || !priceService ? '' : priceService}
                    onChange={(e) => setPriceService(e.target.value)}
                    className="w-full px-4 py-3 bg-indigo-50/20 border border-indigo-100 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest pl-1">Harga Modal / HPP (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200 focus:border-amber-500 focus:bg-white rounded-2xl font-bold outline-none text-amber-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Estimasi Material (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceItem === '0' || !priceItem ? '' : priceItem}
                    onChange={(e) => setPriceItem(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Satuan Jasa <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    placeholder="E.g. Lot, Paket, Kunjungan"
                    value={unit === 'Unit' ? 'Lot' : unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Conditional based on Goods / Services */}
          {type === 'barang' ? (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Box size={14} /> 3. Lembar Spesifikasi & Rincian Teknis Barang
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Bahan Material</label>
                  <input
                    type="text"
                    placeholder="E.g. Stainless Steel SS304"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kapasitas</label>
                  <input
                    type="text"
                    placeholder="E.g. 15 m3/hour, 2.5 m3/min"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Dimensi Fisik</label>
                  <input
                    type="text"
                    placeholder="E.g. 500x320x450 mm"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kebutuhan Power Listrik</label>
                  <input
                    type="text"
                    placeholder="E.g. 2.2 kW (3HP) Tiga Phase"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Flow Rate Debit Air</label>
                  <input
                    type="text"
                    placeholder="E.g. 300 L/min"
                    value={flowRate}
                    onChange={(e) => setFlowRate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tekanan Kerja (Pressure)</label>
                  <input
                    type="text"
                    placeholder="E.g. 10 Bar, 30 kPa"
                    value={pressure}
                    onChange={(e) => setPressure(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Masa Garansi</label>
                  <input
                    type="text"
                    placeholder="E.g. 1 Tahun, 18 Bulan"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gudang Penyimpanan</label>
                  <input
                    type="text"
                    placeholder="E.g. Gudang Utama Jakarta"
                    value={stockLocation}
                    onChange={(e) => setStockLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Briefcase size={14} /> 3. Jasa Pekerjaan & Prosedur Manual (Khusus Paket STP / WWTP)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Instruksi Detil Pekerjaan Mekanikal</label>
                  <textarea
                    rows={3}
                    placeholder="E.g. Penyetelan angkur baut, alignment poros, commissioning motor..."
                    value={detailWork}
                    onChange={(e) => setDetailWork(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Material/Barang Yang Termasuk (Include)</label>
                  <textarea
                    rows={3}
                    placeholder="E.g. Manifold aerasi PVC Rucika AW, gasket nbr, flange carbon steel..."
                    value={includeWork}
                    onChange={(e) => setIncludeWork(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Estimasi Waktu Sampai Penyerahan (Days/Weeks)</label>
                  <input
                    type="text"
                    placeholder="E.g. 5 Hari Kerja, 2 Minggu"
                    value={estimationTime}
                    onChange={(e) => setEstimationTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Materials selection for Jasa */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-150 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Box size={12} className="text-indigo-650" /> A. Pilihan Barang & Material Pendukung
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setItemSource('catalog')}
                      className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-md transition ${itemSource === 'catalog' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                    >
                      Pilih Katalog
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setItemSource('custom');
                        setTmpItemName('');
                        setTmpItemPrice('');
                        setTmpItemQty('1');
                      }}
                      className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-md transition ${itemSource === 'custom' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                    >
                      Ketik Manual
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {itemSource === 'catalog' ? (
                    <div className="md:col-span-5 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide pl-0.5">Pilih Barang dari Katalog</label>
                      <select
                        value={selectedCatalogId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedCatalogId(id);
                          const chosen = items.find(i => i.id === id);
                          if (chosen) {
                            setTmpItemName(chosen.name);
                            setTmpItemPrice(String(chosen.priceItem || 0));
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                      >
                        <option value="">-- Pilih Barang --</option>
                        {items.filter(i => i.type === 'barang').map(i => (
                          <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="md:col-span-5 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide pl-0.5">Nama Barang Khusus (Manual)</label>
                      <input
                        type="text"
                        placeholder="E.g. Pipa PVC 2 inch Rucika"
                        value={tmpItemName}
                        onChange={(e) => setTmpItemName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  )}

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide pl-0.5">Estimasi Harga Satuan (Rp)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={tmpItemPrice}
                      onChange={(e) => setTmpItemPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide pl-0.5">Jumlah (QTY)</label>
                    <input
                      type="number"
                      placeholder="1"
                      min="1"
                      value={tmpItemQty}
                      onChange={(e) => setTmpItemQty(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!tmpItemName.trim()) return;
                        const qtyVal = parseInt(tmpItemQty) || 1;
                        const priceVal = parseFloat(tmpItemPrice) || 0;
                        setNeededItems(prev => [
                          ...prev,
                          {
                            id: itemSource === 'catalog' ? selectedCatalogId : undefined,
                            name: tmpItemName.trim(),
                            qty: qtyVal,
                            price: priceVal
                          }
                        ]);
                        // reset temp
                        setTmpItemQty('1');
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
                    >
                      <Plus size={12} /> Tambah
                    </button>
                  </div>
                </div>

                {/* Needed items table / list */}
                {neededItems.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-3 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-450 uppercase tracking-wider">
                          <th className="px-3 py-2">Nama Barang</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2 text-right">Harga Satuan</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                          <th className="px-3 py-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium font-sans">
                        {neededItems.map((met, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 text-slate-800 font-bold">{met.name}</td>
                            <td className="px-3 py-2 text-center font-bold text-slate-600">{met.qty}</td>
                            <td className="px-3 py-2 text-right text-slate-600">Rp {met.price.toLocaleString('id-ID')}</td>
                            <td className="px-3 py-2 text-right font-bold text-indigo-600">Rp {(met.qty * met.price).toLocaleString('id-ID')}</td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setNeededItems(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 size={11} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 font-bold italic py-2 leading-relaxed">Belum ada barang pendukung terpilih. Silakan isi list material di atas untuk menambah barang yang dibutuhkan dalam jasa ini.</div>
                )}
              </div>

              {/* Manpower selection for Jasa */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-150 space-y-3">
                <div className="text-xs font-black text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center gap-1.5 font-sans">
                  <Briefcase size={12} className="text-indigo-650" /> B. Kebutuhan Manpower / Tenaga Terampil
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide pl-1">Jumlah Orang (Manpower Qty)</label>
                    <input
                      type="number"
                      placeholder="E.g. 3"
                      min="1"
                      value={manpowerQty}
                      onChange={(e) => setManpowerQty(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide pl-1">Tarif Ahli per Orang / Hari (Rp)</label>
                    <input
                      type="number"
                      placeholder="E.g. 250000"
                      value={manpowerRate}
                      onChange={(e) => setManpowerRate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide pl-1">Durasi Kerja (Hari)</label>
                    <input
                      type="number"
                      placeholder="E.g. 5"
                      min="1"
                      value={manpowerDays}
                      onChange={(e) => setManpowerDays(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Subtotal Manpower calculation info */}
                {manpowerQty && manpowerRate && manpowerDays && (
                  <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 flex justify-between items-center">
                    <span>Estimasi Anggaran Tenaga Teknis ({manpowerQty} Orang x {manpowerDays} Hari)</span>
                    <span className="font-extrabold text-slate-800">Rp {((parseInt(manpowerQty) || 0) * (parseFloat(manpowerRate) || 0) * (parseInt(manpowerDays) || 0)).toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {/* Live Cost aggregation summary box */}
              <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-150 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-widest block leading-none">Live Total Anggaran Jasa Komplit</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1.5 leading-relaxed">
                    Paduan Biaya Jasa + {neededItems.length} Jenis Barang Pendukung + Upah {manpowerQty || 0} Manpower Ahli.
                  </span>
                </div>
                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Grand Total Anggaran Jasa</span>
                  <span className="text-xl font-black text-indigo-650 tracking-tight mt-1 ml-auto block">
                    Rp {(
                      (parseFloat(priceService) || 0) +
                      neededItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0) +
                      ((parseInt(manpowerQty) || 0) * (parseFloat(manpowerRate) || 0) * (parseInt(manpowerDays) || 0))
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Text areas */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <FileCheck size={14} /> 4. Deskripsi Narasi & {type === 'barang' ? 'Spesifikasi Produk' : 'Lingkup Layanan'}
            </h4>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                {type === 'barang' ? 'Ringkasan Deskripsi Produk' : 'Ringkasan Deskripsi Jasa Pekerjaan'}
              </label>
              <textarea
                rows={2}
                placeholder={type === 'barang' ? "Deskripsikan fungsi utama produk, kegunaannya di lingkungan limbah STP/WTP, dan performanya..." : "Deskripsikan cakupan kerja jasa, tahapan pekerjaan, keahlian tim teknisi, serta jaminan kualitas..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-medium outline-none font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                {type === 'barang' ? 'Spesifikasi Detail (Satu parameter per baris)' : 'Rincian Lingkup / S&K Pekerjaan (Satu poin per baris)'}
              </label>
              <textarea
                rows={4}
                placeholder={type === 'barang' ? "Model: 3M-40-160\nSpeed: 2900 RPM\nImpeller Diameter: 154mm" : "Alat kerja safety lengkap disediakan kontraktor\nGaransi pekerjaan 3 bulan setelah komisioning\nTidak termasuk instalasi kabel feeder utama panel kontrol"}
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-mono text-xs outline-none"
              />
            </div>
          </div>

          {/* Section 6: Image URLs & PDF attachments */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <FileText size={14} /> 6. Tautan Gambar & Dokumen Pabrikan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">URL Gambar (Pisahkan dengan tanda koma jika multi gambar)</label>
                <input
                  type="text"
                  placeholder="https://example.com/item1.jpg, https://example.com/item2.jpg"
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status Publikasi</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold font-sans"
                >
                  <option value="aktif">Aktif (Tampil)</option>
                  <option value="nonaktif">Nonaktif (Sembunyi)</option>
                </select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">URL PDF Manual / Lembar Spesifikasi Teknis</label>
                <input
                  type="text"
                  placeholder="https://workflow-pro.com/documents/manual_ebara.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Tampilan PDF</label>
                <input
                  type="text"
                  placeholder="Manual_User_Seko_Tekna.pdf"
                  value={pdfName}
                  onChange={(e) => setPdfName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Action buttons (Submit / Close) */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 transition rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Sedang Menyimpan...
                </>
              ) : (
                'Simpan database'
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
