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
  priceItem: number; // Harga barang
  priceService: number; // Harga jasa
  priceInstallation: number; // Harga instalasi
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

// Fallback initial catalogs in case of empty database, providing immediate gorgeous feedback
const DEPRECATED_PRESETS: CatalogItem[] = [
  {
    id: 'pompa-001',
    name: 'Pompa Centrifugal Ebara 3M 40-160/4.0',
    sku: 'POM-EBARA-3M40160',
    category: 'Pompa',
    subCategory: 'Centrifugal Pump',
    type: 'barang',
    brand: 'Ebara',
    priceItem: 18500000,
    priceService: 1500000,
    priceInstallation: 2500000,
    unit: 'Unit',
    description: 'Pompa centrifugal Ebara 3M coupler motor induksi 4.0 kW 3 Phase. Konstruksi stainless steel SS304 berkualitas tinggi cocok digunakan untuk utilitas STP, dosing, booster water, transfer air bersih, dan sirkulasi air industri.',
    specifications: 'Model : 3M 40-160/4.0\nPower : 4.0 kW / 5.5 HP\nSpeed : 2900 RPM 3-Phase\nHead Range : 18 - 32 Meters\nFlow Range : 100 - 350 L/min\nOutlet Connection : 1.5 Inch Flanges\nInlet Connection : 2.5 Inch Flanges',
    material: 'Stainless Steel SS304 (Impeller & Volute)',
    capacity: '100 - 350 liter per menit',
    dimensions: '450 mm x 260 mm x 320 mm',
    power: '4 kW (5.5 HP) 380V/3Phase',
    flowRate: '15 m³/jam',
    pressure: '3.2 Bar max',
    warranty: '1 Tahun Garansi Pabrik',
    stockLocation: 'Gudang Utama Jakarta',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-05-20T10:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://www.ebara.co.jp/en/products/industrial/pumps/index.html',
    pdfName: 'Ebara-3M-Centrifugal-Manual.pdf',
    detailWork: 'Pondasi baseplate besi, instalasi baut angkur, penyambungan elektrikal control panel, alignment shaft, dan commissioning.',
    includeWork: 'Baud angkur, packing karet flange standard, seal tape, uji putaran pompa.',
    estimationTime: '3 Hari Kerja',
    views: 145
  },
  {
    id: 'pompa-002',
    name: 'Pompa Submersible Tsurumi HS2.4S (Sewage & IPAL)',
    sku: 'POM-TSURUMI-HS24S',
    category: 'Pompa',
    subCategory: 'Submersible Pump',
    type: 'barang',
    brand: 'Tsurumi',
    priceItem: 6000000,
    priceService: 500000,
    priceInstallation: 1200000,
    unit: 'Unit',
    description: 'Pompa submersible sewage type Tsurumi HS2.4S original Jepang, ideal sebagai pompa transfer sirkulasi air limbah maupun air lumpur lunak dari bak ekualisasi (Equalizing tank) menuju reaktor filter utama sistem STP/WWTP.',
    specifications: 'Model/Type : Tsurumi HS2.4S (Submersible Pump)\nPower/Daya : 0.37 kW / 0.5 HP, 220V, 1 Phase, 50Hz\nHead Maksimal : 12 Meter\nKapasitas Aliran : 200 L/min\nMaterial : Cast Iron Casing, Urethane Semi-Vortex Impeller\nKoneksi Discharge : 2 Inch (50 mm)\nFungsi : Pompa pemindah air limbah / transfer sewage pump handal\nGaransi : 12 Bulan garansi resmi distributor mekanikal elektrikal',
    material: 'Synthetic Rubber Urethane (Impeller), Cast Iron (Casing)',
    capacity: '200 Liter / menit',
    dimensions: '241 mm x 184 mm x 328 mm',
    power: '0.37 kW / 0.5 HP / 220V 1 Phase',
    flowRate: '12 m³/jam',
    pressure: '1.2 Bar max',
    warranty: '1 Tahun Garansi Resmi',
    stockLocation: 'Gudang Utama Tangerang',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T09:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://workflow-pro.com/stp-scheme.pdf',
    pdfName: 'Tsurumi-HS-Submersible-Manual.pdf',
    detailWork: 'Pemasangan auto-coupling guide rail, penyambungan chain suspension sling stainless steel, penyusunan ballast sensor float switch air.',
    includeWork: 'Kabel waterproofing 5 meter, plug konektor, guide hook fitting.',
    estimationTime: '1 Hari Kerja',
    views: 290
  },
  {
    id: 'pompa-003',
    name: 'Pompa Submersible Equalizing Ebara (Semi Vortex IPAL)',
    sku: 'POM-EBARA-SEMIVORTEX',
    category: 'Pompa',
    subCategory: 'Submersible Pump',
    type: 'barang',
    brand: 'Ebara',
    priceItem: 18700000,
    priceService: 1500000,
    priceInstallation: 2500000,
    unit: 'Unit',
    description: 'Pompa celup heavy-duty Ebara semi-vortex yang didesain secara khusus untuk mengatur keseimbangan lumpur aktif (equalizing & return sludge RAS pump) di sistem STP / WWTP berkapasitas besar.',
    specifications: 'Model/Type : Ebara Submersible Pump (Semi Vortex Impeller)\nPower/Daya : 0.75 kW / 1 HP, 220V/380V, 50 Hz\nHead Maksimal : 6 Meter\nKapasitas Aliran : 240 Liter/menit (0.24 m³/menit)\nMaterial : Cast Iron casing & cast iron impeller, Stainless steel shaft\nPerlengkapan : Valve & Fitting (Single Alternate - One Duty, One Standby)\nGaransi ; 12 Bulan garansi resmi pabrikasi',
    material: 'Cast Iron casing & impeller, SS304 shaft',
    capacity: '240 Liter/menit (0.24 m³/menit)',
    dimensions: '310 mm x 220 mm x 450 mm',
    power: '0.75 kW (1 HP) 220V/380V Dual Phase',
    flowRate: '14.4 m³/jam',
    pressure: '0.6 Bar max',
    warranty: '1 Tahun Garansi Ebara Resmi',
    stockLocation: 'Gudang Utama Jakarta',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-16T10:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://www.ebara.co.jp/en/products/industrial/pumps/index.html',
    pdfName: 'Ebara-Submersible-Sewage-Datasheet.pdf',
    detailWork: 'Pemasangan double float pelampung air otomatis, alignment check, penyambungan flensa cast iron.',
    includeWork: 'Flange companion bolts, packing flange karet, sertifikat uji dinamis.',
    estimationTime: '2 Hari Kerja',
    views: 185
  },
  {
    id: 'blower-001',
    name: 'Root Blower Futsu Monoblock TST-50',
    sku: 'BLW-FUTSU-TST50',
    category: 'Blower',
    subCategory: 'Root Blower',
    type: 'barang',
    brand: 'Futsu',
    priceItem: 29800000,
    priceService: 2000000,
    priceInstallation: 3500000,
    unit: 'Set',
    description: 'Blower putar tiga pin (three-lobe root blower) didesain khusus untuk aerasi tangki reaktor biologis pada STP (Sewage Treatment Plant) dan WWTP (Waste Water Treatment Plant). Memiliki efisiensi energi yang tinggi dan kebisingan yang sangat minim.',
    specifications: 'Model/Tipe : TST-50 Monoblock\nKapasitas Udara : 1.84 - 3.25 m3/min\nTekanan Kerja : 0.1 - 0.5 kgf/cm2\nKecepatan Putaran : 1450 RPM\nDiameter Outlet : 2 Inch (50 mm)\nShaft Connection : Belt & Pulley\nAksesoris : Silencer, Pressure Gauge, Safety Valve, Anchor Bolt',
    material: 'Cast Iron FC200 robust structure',
    capacity: '2.5 m³/menit solid air flow',
    dimensions: '600 mm x 450 mm x 950 mm',
    power: '2.2 kW (3 HP) 380V/3Phase',
    flowRate: '150 m³/jam',
    pressure: '30 kPa',
    warranty: '1.5 Tahun Garansi Pabrik',
    stockLocation: 'Workshop Bekasi',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-05-18T10:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://www.futsu-blower.com',
    pdfName: 'Futsu-TST50-Specification-Book.pdf',
    detailWork: 'Fabrikasi dudukan base besi siku, pemasangan karet damper getaran, penyambungan flexible hose inlet/outlet, koneksi control panel panel sdp.',
    includeWork: 'Silencer inlet, silencer outlet, check valve, pressure gauge, V-belt pulley set, oli pelumas mesin.',
    estimationTime: '4 Hari Kerja',
    views: 112
  },
  {
    id: 'blower-002',
    name: 'Root Blower Aerasi Longtech LT-80 (Heavy-Duty STP)',
    sku: 'BLW-LONGTECH-LT80',
    category: 'Blower',
    subCategory: 'Root Blower',
    type: 'barang',
    brand: 'Longtech',
    priceItem: 132000000,
    priceService: 5000000,
    priceInstallation: 8000000,
    unit: 'Set',
    description: 'Root blower aerasi berdaya tinggi Longtech LT-80 buatan Taiwan kelas industri. Cocok untuk menyuplai pasokan oksigen dalam jumlah besar di sistem Sewage Treatment Plant (STP) reaktor lumpur aktif berskala kapasitas hingga 350 m3/hari.',
    specifications: 'Model/Type : Longtech / Setara LT-80\nPower/Daya : 15 kW / 20 HP, 380V, 3 Phase, 50Hz\nKapasitas Udara : 16.97 m³/menit (High Aeration Flow)\nDiameter Pipa Discharge : 3 Inch (80 mm)\nSistem Hubung : Belt and Pulley drive\nKelengkapan : Double Silencer (Inlet & Outlet), Pressure Gauge, Safety relief valve, Check valve\nMotor Penggerak : Siemens / TECO IP55 Class F thermal protection',
    material: 'Cast Iron GG20 (Casing & Lobe Rotor), High Alloy Steel (Shaft)',
    capacity: '16.97 m³/menit',
    dimensions: '850 mm x 680 mm x 1200 mm',
    power: '15 kW (20 HP) 380V/3 Phase/50Hz',
    flowRate: '1018 m³/jam air supply',
    pressure: '40 kPa',
    warranty: '1 Tahun Garansi Longtech Taiwan',
    stockLocation: 'Workshop Bekasi',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-14T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://www.futsu-blower.com',
    pdfName: 'Longtech-LT-Series-Official-Manual.pdf',
    detailWork: 'Pemasangan anchor block pondasi masif semen, alignment pulley belt tensioner, kalibrasi pressure safety valve, instalasi pipa header udara besi galvanis.',
    includeWork: 'Dual silencer, pressure relief, common baseplate heavy steel, guard protective mesh, anti-vibration rubber mounts.',
    estimationTime: '6 Hari Kerja',
    views: 147
  },
  {
    id: 'blower-003',
    name: 'Pompa Blower Yasunaga LW 300 (Aerate Low Noise)',
    sku: 'BLW-YASU-LW300',
    category: 'Blower',
    subCategory: 'Diaphragma Blower',
    type: 'barang',
    brand: 'Yasunaga',
    priceItem: 17500000,
    priceService: 1200000,
    priceInstallation: 1800000,
    unit: 'Unit',
    description: 'Blower diafragma mini Yasunaga LW 300 handal buatan Jepang. Sangat hening, rendah konsumsi daya, serta ideal menyuplai aerasi oksigen konstan bertipe gelembung halus (fine bubble) untuk reaktor biologi STP kecil.',
    specifications: 'Model/Type : Yasunaga LW-300 Low Noise\nPower/Daya : 155 Watt s.d 230 Watt / 220V, 50Hz, 1 Phase\nKapasitas Udara : 300 Liter / menit (18 m3/jam)\nTekanan Kerja : 20 kPa\nNoise Level : 42 dB (A) extremely silent\nOutlet Connection : 1 Inch / inner dia 26mm thread\nFungsi : Aerasi tangki pengumpul domestik biofilter',
    material: 'Aluminium Die-Cast Heat Dissipation casing',
    capacity: '300 Liter / menit',
    dimensions: '290 mm x 205 mm x 215 mm',
    power: '155 Watt - 230 Watt / 220V AC',
    flowRate: '18 m³/jam',
    pressure: '20 kPa (0.2 Bar)',
    warranty: '1 Tahun Garansi Resmi Jepang',
    stockLocation: 'Gudang Utama Tangerang',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T11:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://www.futsu-blower.com',
    pdfName: 'Yasunaga-LW-Manual-Guide.pdf',
    detailWork: 'Pemasangan dudukan pelindung box bata/panel untuk melindunginya dari paparan hujan, penyambungan selang elastis koneksi panel manifold.',
    includeWork: 'L-shape rubber hose, stainless steel hose clips, manual guide.',
    estimationTime: '1 Hari Kerja',
    views: 120
  },
  {
    id: 'tangki-001',
    name: 'Tangki Reaktor STP Biofilter GIGT FRP 20 m3',
    sku: 'TNK-FRP-STP20M3',
    category: 'Tangki IPAL',
    subCategory: 'FRP Tank',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 160000000,
    priceService: 5000000,
    priceInstallation: 15000000,
    unit: 'Unit',
    description: 'Tangki sediaan Bioreaktor STP (Sewage Treatment Plant) multifungsi berkapasitas total 20 m³. Diproduksi menggunakan bahan serat kaca FRP (Fiberglass Reinforced Plastic) tangguh berkualitas premium tahan asam korosi zat kimia cair.',
    specifications: 'Volume Tanki : 20 m³ / 20.000 Liter\nDimensi Fisik : Diameter 2.30 meter x Panjang 5.0 meter x Tinggi total 2.50 meter\nMaterial Utama : FRP (Fiberglass Reinforced Plastic) anti bocor\nSistem Biologi : Biofilter Terintegrasi (Media tumbuh Sarang Tawon & Honeycomb)\nKoneksi Pipa In/Out : 4 Inch - 6 Inch PVC AW Class\nKetebalan Dinding : 8 mm - 10 mm reinforced ribbed frame\nDesain Struktur : Silinder Horizontal (Cylinder Horizontal Ground/Underground tank)',
    material: 'FRP (Fiberglass Reinforced Plastic) premium resin double strength',
    capacity: '20 m³ / 20,000 Liter',
    dimensions: 'D.2300 mm x P.5000 mm x T.2500 mm',
    power: 'N/A',
    flowRate: 'Kapasitas Treatment Air Limbah 20 m³/hari',
    pressure: 'Gravity fluid flow design',
    warranty: '5 Tahun Kebocoran Konstruksi Fiber',
    stockLocation: 'Workshop Bekasi',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T12:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://workflow-pro.com/stp-scheme.pdf',
    pdfName: 'GIGT-STP-Cylinder-FRP-SOP.pdf',
    detailWork: 'Pemasangan penahan tangki (saddle anchor), fabrikasi dudukan semen melengkung, instalasi pipa sirkulasi internal bioreaktor, penimbunan tanah (jika tanam) bersertifikasi uji kebocoran air.',
    includeWork: 'Biomedia honeycomb PVC internal blocks, fitting PVC flange inlet & outlet, manhole frame cover FRP.',
    estimationTime: '15 Hari Kerja',
    views: 310
  },
  {
    id: 'tangki-002',
    name: 'Sistem STP Packaged MJ-STP15 (Kapasitas 15 m3/hari)',
    sku: 'TNK-STP-MJ15',
    category: 'Tangki IPAL',
    subCategory: 'Packaged STP System',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 67500000,
    priceService: 2500000,
    priceInstallation: 7500000,
    unit: 'Unit',
    description: 'Sistem unit olah limbah siap pasang (packaged) MJ-STP15 berkapasitas aliran olah hingga 15 m³/hari. Solusi praktis, ramah lingkungan, dan efisien untuk perumahan, gedung perkantoran, ruko, klinik, dan industri.',
    specifications: 'Model/Type : MJ-STP15 Anaerob-Aerob Complete\nKapasitas Olah : 15 m3 / hari (24 Jam kerja kontinu)\nBahan Konstruksi : FRP Fiberglass tebal dinding 8 mm\nDimensi Fisik : Diameter 1750 mm x Panjang 6500 mm\nMedia Tumbuh Bakteri : Honeycomb PVC High-Surface Area\nPipa Koneksi : Inlet/Outlet PVC diameter 4 Inch\nFungsi : Pengolahan limbah feses-urin air kotor gedung domestik',
    material: 'FRP Fiberglass tebal 8mm struktur kokoh',
    capacity: '15 m³/hari',
    dimensions: 'D.1750 mm x P.6500 mm',
    power: 'N/A (Sistem Gravity Biofilter)',
    flowRate: '15 m3 / hari',
    pressure: 'Desain Atribut Gravity non-pressure',
    warranty: '5 Tahun Garansi Kebocoran Tangki',
    stockLocation: 'Workshop Bekasi',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-12T09:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://workflow-pro.com/stp-scheme.pdf',
    pdfName: 'GIGT-Packaged-STP-MJ15-Specification.pdf',
    detailWork: 'Setting level kemiringan inlet outlet, pengelasan pipa koneksi eksternal, instalasi sekat bioscreen.',
    includeWork: 'Sarang kloni bakteri, media tumbuh sarang tawon, chemical klorinator tablet feeder.',
    estimationTime: '10 Hari Kerja',
    views: 195
  },
  {
    id: 'tangki-003',
    name: 'Tangki Air FRP Model Panel Tank Kapasitas 10 m3',
    sku: 'TNK-FRP-PANEL10M3',
    category: 'Tangki IPAL',
    subCategory: 'Panel Tank',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 60000000,
    priceService: 2500000,
    priceInstallation: 4500000,
    unit: 'Unit',
    description: 'Tangki air modular sekat FRP model Panel Tank berkapasitas 10 m³. Memudahkan perakitan di lantai atas gedung bertingkat (roof tank/suplay tank) maupun area sempit yang tidak terjangkau tangki utuh biasa.',
    specifications: 'Model/Tipe : MJ-PT10 Model Panel Sekat\nKapasitas Volume : 10 m³ (10.000 Liter)\nDimensi Struktural : Panjang 5.0 meter x Lebar 2.0 meter x Tinggi 1.0 meter (or customizable)\nKetebalan Plat Panel : Solid 8 mm Fiber\nBase Frame Dudukan : UNP 100 Structural Steel\nAksesoris Terpasang : Tangga Luar & Dalam Stainless Steel, Bolt & Nut HD Galvanis, Sambungan Silikon Air, IN/OUT 2 inch PVC\nGaransi Kebocoran : 3 Tahun resmi dari pabrik',
    material: 'FRP Panel Modular, Sealant, Galvanized Fasteners',
    capacity: '10 m3 / 10,000 Liter',
    dimensions: 'P.5000 mm x L.2000 mm x T.1000 mm',
    power: 'N/A',
    flowRate: '10,000 Liter storage volume',
    pressure: 'Static fluid storage standard',
    warranty: '3 Tahun Garansi Kebocoran',
    stockLocation: 'Workshop Bekasi',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T15:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://workflow-pro.com/stp-scheme.pdf',
    pdfName: 'Modular-FRP-Panel-Tank-UserGuide.pdf',
    detailWork: 'Pemasangan landasan besi struktur kanal UNP, perakitan piece-by-panel fiber glass, pengencangan baut flange silikon anti bocor, uji rendam air statis selama 48 jam.',
    includeWork: 'Internal & external ladders, tie-rod FRP strut, UNP base, sealant packing.',
    estimationTime: '5 Hari Kerja',
    views: 165
  },
  {
    id: 'filter-001',
    name: 'Tangki Filter FRP Nanotech 1665 Sand/Carbon filter',
    sku: 'FLT-NANOTECH-1665',
    category: 'Filter Air',
    subCategory: 'Media Filter',
    type: 'barang',
    brand: 'Nanotech',
    priceItem: 9350000,
    priceService: 650000,
    priceInstallation: 1200000,
    unit: 'Unit',
    description: 'Tangki filter saringan media (Media Sand & Active Carbon) tabung serat kaca FRP merek Nanotech diameter 16 inch tinggi 65 inch. Ideal untuk saringan pemoles (polishing filter) air olahan sistem WWTP/STP guna menyaring kekeruhan dan menghilangkan bau kaporit.',
    specifications: 'Model/Tipe : Nanotech / Setara 1665\nDimensi Tabung : Diameter 16 Inch (400 mm) x Tinggi 65 Inch (1650 mm)\nKapasitas Debit Aliran : 2.5 - 4.5 m³/jam\nKapasitas Isi Media : 140 - 160 Liter\nOperasional Valve : Manual 3-Way Multiport Valve Handle (Manual Backwash)\nMaterial Tabung : FRP (Fiberglass Reinforced Plastic)\nGaransi Tabung : 12 Bulan garansi resmi dari distributor',
    material: 'FRP (Fiberglass Reinforced Plastic)',
    capacity: '140 - 160 Liter media volume',
    dimensions: 'D.400 mm x T.1650 mm',
    power: 'N/A (Manual hydro-flow filter block)',
    flowRate: '2.5 - 4.5 m³/jam',
    pressure: 'Maksimum tekanan operasi 4 - 6 Bar',
    warranty: '1 Tahun Garansi Tabung resmi',
    stockLocation: 'Gudang Utama Jakarta',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-14T10:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://workflow-pro.com/stp-scheme.pdf',
    pdfName: 'Nanotech-1665-Operation-Manual.pdf',
    detailWork: 'Pengisian media pasir silika & karbon aktif bergradasi secara bertahap, perakitan strainer atas & bawah, penyambungan port valve air 1 inch.',
    includeWork: 'Multiport valve head handle, strainer atas & bawah, silica sand & carbon active media packages.',
    estimationTime: '1 Hari Kerja',
    views: 215
  },
  {
    id: 'dosing-002',
    name: 'Pompa Dosing Seko Solenoid Dosing (Injeksi Klorinator)',
    sku: 'DOS-SEKO-AMS200',
    category: 'Dosing Pump',
    subCategory: 'Solenoid Dosing Pump',
    type: 'barang',
    brand: 'Seko',
    priceItem: 5700000,
    priceService: 500000,
    priceInstallation: 1000000,
    unit: 'Unit',
    description: 'Pompa dosing Seko Solenoid satu phase presisi tinggi buatan Italia untuk klorinasi atau koagulasi PAC / Polymer. Dilengkapi tangki pencampur bahan kimia dan aksesoris pipa injeksi lengkap.',
    specifications: 'Model/Type : Seko Solenoid Diaphragm (Chlorination)\nKapasitas Injeksi : 4.7 s.d 5.0 Liter / jam\nPressure/Tekanan : Maksimal 3 Bar\nSistem Operasi : Manual stroke regulation 0 - 100%\nMaterial Pompa : PVDF anti karat korosif klorin\nAksesoris : Strainer, Bracket dinabolt, Tangki Kimia PE 200 Liter\nGaransi : 12 Bulan garansi pabrikan',
    material: 'PVDF Head, PTFE solid diaphragm, FPM seal',
    capacity: '4.7 - 5.0 L/jam',
    dimensions: '150 mm x 100 mm x 220 mm',
    power: '20 Watt / 230 Volt / 50 Hz',
    flowRate: '4.7 L/jam',
    pressure: '3 Bar max pressure',
    warranty: '1 Tahun Garansi Resmi',
    stockLocation: 'Gudang Utama Jakarta',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T09:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://www.seko.com',
    pdfName: 'Seko-AMS-Chlorination-Dosing-SOP.pdf',
    detailWork: 'Pemasangan klorinator pump pada tanki kimia 200L, setting selang suction discharge, kalibrasi stroke rate.',
    includeWork: 'Foot filter strainer, injection valve nozzle, chemical PE hose tubing 4 meter.',
    estimationTime: '1 Hari Kerja',
    views: 130
  },
  {
    id: 'bakteri-001',
    name: 'Bakteri Cair Pengurai Organik Biopro (Aktivator IPAL)',
    sku: 'CHM-BAKTERI-BIOPRO',
    category: 'Chemical',
    subCategory: 'Biological Agent',
    type: 'barang',
    brand: 'Biopro',
    priceItem: 60000,
    priceService: 0,
    priceInstallation: 0,
    unit: 'Liter',
    description: 'Bakteri cair konsentrat kultur aktif pembentuk koloni biofilm (biomass bio-treatment) tangguh mengurai lemak, minyak organic, deterjen, kotoran tinja, limbah medis, dan menurunkan beban COD / BOD pada reaktor aerobik STP / WWTP.',
    specifications: 'Model/Type : Bio-aktivator Cair Konsentrasi Tinggi\nMerek/Brand : Biopro Indonesia (Aktivator IPAL)\nFungsi Utama : Menumbuhkan dan meregenerasi koloni bakteri pengurai aerobik/anaerobik pada reaktor STP/WWTP\nKategori Limbah : Limbah domestik, lemak restoran, limbah medis klinik, pencucian tekstil\nKemasan/Berat : Jerigen 1 Liter (Berat Pengiriman 1.2 kg)\nDosis Penggunaan : 1 Liter untuk 10-20 m³ kapasitas reaktor air limbah',
    material: 'Kultur suspensi bakteri heterotrop, saprofit aktif',
    capacity: '1 Liter per jerigen',
    dimensions: '100 mm x 100 mm x 240 mm',
    power: 'N/A',
    flowRate: 'N/A',
    pressure: 'N/A',
    warranty: 'Exp Date: 2 Tahun semenjak produksi',
    stockLocation: 'Gudang Utama Tangerang',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T10:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://workflow-pro.com/stp-scheme.pdf',
    pdfName: 'Biopro-Aktivator-Instruction-Flyer.pdf',
    detailWork: 'Penuangan langsung ke tangki aerasi biologis pada saat awal start-up aerator blower dihidupkan.',
    includeWork: 'Induan ragi nutrisi start-up bakteri penguras limbah organic.',
    estimationTime: '1 Hari Kerja',
    views: 440
  },
  {
    id: 'jasa-pertek-001',
    name: 'Paket Jasa Pengurusan Pertek Pemenuhan BMAL (KLHK)',
    sku: 'JSA-PERTEK-BMAL',
    category: 'Jasa Konsultasi',
    subCategory: 'Sertifikasi Lingkungan',
    type: 'jasa',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 85000000,
    priceService: 0,
    priceInstallation: 0,
    unit: 'Paket',
    description: 'Jasa pendampingan profesional dan legal pengurusan Rekomendasi Persetujuan Teknis (Pertek) Baku Mutu Air Limbah (BMAL) industri maupun domestik komersial sesuai ketentuan Kementerian Lingkungan Hidup dan Kehutanan (KLHK / DLH).',
    specifications: 'Model/Type : Jasa Konsultasi Teknis & Sertifikasi Regulasi Lingkungan\nTenaga Ahli Terlibat : Ahli Kualitas Air, Ahli Lingkungan Bersertifikat GP, Drafter CAD AutoCAD 3D\nCakupan Layanan : Pengumpulan Data Primer/Sekunder, Penyusunan Dokumen Kajian, Asistensi Pembahasan di KLHK/DLH\nProduk Akhir : Buku Draft/Final Kajian Teknis, Akun PTSP Upload, Rekomendasi Persetujuan Teknis BMAL\nWaktu Penyelesain : 6 Bulan durasi pengurusan regulasi normal\nKetentuan Termyn : 50% Kontrak, 35% Upload Kajian, 15% Terbit Persetujuan Teknis',
    material: 'Tenaga Ahli Madya Lingkungan, Software Simulasi Pemodelan DLH',
    capacity: 'Cakupan Perizinan WWTP / STP Industri Menengah-Besar',
    dimensions: 'N/A',
    power: 'N/A',
    flowRate: 'Penyusunan dokumen kajian teknis lengkap lapangan',
    pressure: 'Legal regulatory compliance guarantee',
    warranty: 'Masa pendampingan penuh hingga dokumen diterbitkan',
    stockLocation: 'Kantor Tangerang GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=600'
    ],
    pdfUrl: 'https://workflow-pro.com/stp-scheme.pdf',
    pdfName: 'Penawaran-Pertek-HRI-BMAL-GIGT.pdf',
    detailWork: 'Pengukuran titik koordinat pembuangan, pengambilan sampel influent air limbah, pemodelan aliran sungai penerima, presentasi komisi penilai ahli.',
    includeWork: 'Penggandaan dokumen 5 buku draf, 5 buku dokumen final kajian teknis, ATK operasional lengkap.',
    estimationTime: '6 Bulan Kerja',
    views: 520
  },
  {
    id: 'kemiri-dewatering-001',
    name: 'Pekerjaan Dewatering Septictank Existing',
    sku: 'KEM-DEWATER-001',
    category: 'service maintenance',
    subCategory: 'Pembersihan & Pengurasan',
    type: 'jasa',
    brand: 'PT. Kemiri Jaya Fiber Tehnik',
    priceItem: 0,
    priceService: 5000000,
    priceInstallation: 0,
    unit: 'Lot',
    description: 'Pekerjaan penyedotan air pembuangan (dewatering), pembersihan air kotor, lumpur endapan, dan sterilisasi tangki septic tank lama sebelum dilakukan pengerjaan struktur baru.',
    specifications: 'Jenis Pekerjaan : Pengurasan & Pembersihan Lumpur Tinja\nMetode : Vacuum extraction, sludge stabilization, flushing\nKapasitas Sedot : Sesuai kapasitas septic tank eksisting\nKelengkapan : Selang hisap elastis spiral 4 inch, chemical disinfektan pembunuh bakteri patogen, disposal berizin.',
    material: 'Vacuum Tank Truck, Disinfectant Chemical',
    capacity: 'Kapasitas s.d 10 m3 sedimentasi',
    dimensions: 'N/A',
    power: 'N/A',
    flowRate: 'N/A',
    pressure: 'N/A',
    warranty: 'Garansi pengerjaan bersih & optimal',
    stockLocation: 'Pool Truck Kebon Jeruk',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Penyedotan air limbah atas, pengerukan lumpur padat dasar, pengangkutan, pembuangan ke instalasi pengolahan lumpur tinja (IPLT) legal.',
    includeWork: 'Sewa mobil vakum, biaya retribusi pembuangan IPLT, pelapis disinfektan.',
    estimationTime: '2 Hari Kerja',
    views: 125
  },
  {
    id: 'kemiri-piping-001',
    name: 'Penambahan Jalur Pipa Menuju Septictank (Rucika Class AW 4 Inch)',
    sku: 'KEM-PIP-4RUC',
    category: 'piping',
    subCategory: 'Instalasi Pipa PVC',
    type: 'jasa',
    brand: 'PT. Kemiri Jaya Fiber Tehnik',
    priceItem: 4500005,
    priceService: 3500000,
    priceInstallation: 1499995,
    unit: 'Lot',
    description: 'Pekerjaan pemasangan baru jalur pipa inlet pembuangan limbah s.d septic tank menggunakan pipa Rucika Class AW premium tebal 4 inch sepanjang maksimal 70 meter.',
    specifications: 'Tipe Pipa : Rucika / Setara Class AW (Maks. Tebal)\nDiameter Nominal : 4 Inch (114 mm)\nPanjang Bentangan : S.d maksimal 70 meter run\nPekerjaan Sipil : Penggalian tanah kedalaman 40-60cm, penimbunan kembali, plesteran cor penutup semen jalan rusak\nKoneksi Fitting : Elbow, tee, socket PVC AW, lem pipa solvent weld premium d-glue',
    material: 'Pipa Rucika PVC AW 4 inch, Fitting, Solvent Cement, Semen pasir cor',
    capacity: 'Laju air gravitasi s.d 200 Liter/menit',
    dimensions: 'Diameter 4 Inch AW',
    power: 'N/A',
    flowRate: 'Pipa Rucika AW 4 Inch',
    pressure: 'Max 10 Bar air supply static pressure',
    warranty: '6 Bulan Garansi Kebocoran Sambungan',
    stockLocation: 'Gudang Kebon Jeruk',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pengukuran slope inlet minimum 2%, penggalian parit pipa, pemasangan pipa joint lem PVC, pengetesan aliran air bocor, urugan sirtu, penutupan plester beton semen jalan.',
    includeWork: 'Semen cor penutup, pasir, batu koral, lem PVC, sikat kawat, pembersihan sisa galian.',
    estimationTime: '5 Hari Kerja',
    views: 178
  },
  {
    id: 'kemiri-tank-001',
    name: 'Tangki Septic Tank Baru BIO MJ Series 1000 - 1000 Liter',
    sku: 'KEM-TNK-BIO1000',
    category: 'fabrikasi tanki',
    subCategory: 'Bio Septic Tank',
    type: 'barang',
    brand: 'PT. Kemiri Jaya Fiber Tehnik',
    priceItem: 3000000,
    priceService: 500000,
    priceInstallation: 1000000,
    unit: 'Unit',
    description: 'Tangki septic tank biologis ramah lingkungan tipe BIO MJ Series kapasitas 1000 Liter. Sangat praktis, kuat, tahan benturan, serta anti bocor.',
    specifications: 'Model/Type : BIO MJ-1000 L\nKapasitas Tampung : 1000 Liter (1 m3)\nPenggunaan : Domestik 4-6 Orang penghuni aktif\nMaterial : Fiberglass FRP Ribbed tebal tebal\nSistem Biologi : 3 sekat biofilter (anaerobic filter, biofilm carrier, tablet chlorinator chamber)\nDiameter / Tinggi : 1000 mm / 1250 mm\nGaransi : 2 Tahun garansi struktur tangki fiber',
    material: 'FRP (Fiberglass Reinforced Plastic) ribbed skin',
    capacity: '1000 Liter / 1 m3',
    dimensions: 'D.1000 mm x T.1250 mm',
    power: 'N/A (Sistem Biologis Gravitasi)',
    flowRate: 'Olah limbah domestik harian',
    pressure: 'Hydrostatic gravity pressure',
    warranty: '2 Tahun Struktur Tangki Fiber',
    stockLocation: 'Workshop Kemiri Jaya',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Fabrikasi tangki fiber, setting inlet & outlet, pemasangan media biofilm biomedia plastik honeycomb di dalam sekat.',
    includeWork: 'Disinfektan kaporit tube, ragi bakteri, packing pengaman busa elastis.',
    estimationTime: '1 Hari Kerja',
    views: 205
  },
  {
    id: 'kemiri-pondasi-001',
    name: 'Pekerjaan Pondasi Septictank Baru',
    sku: 'KEM-CIV-POND',
    category: 'service maintenance',
    subCategory: 'Sipil & Konstruksi',
    type: 'jasa',
    brand: 'PT. Kemiri Jaya Fiber Tehnik',
    priceItem: 4000000,
    priceService: 4500000,
    priceInstallation: 2000000,
    unit: 'Lot',
    description: 'Pekerjaan pembuatan pondasi cor serta konstruksi dudukan pelindung bawah tanah septic tank baru menggunakan wiremesh dan bata bertulang.',
    specifications: 'Konstruksi Semen : Beton Site Mix k-175 / k-200 standard sipil\nPembesian : Besi Wiremesh M12 kokoh anti patah\nDinding Bak Pelindung : Pasangan bata merah bertulang dengan sloof beton m10\nPenutup : Plat beton site mix tebal 10-12 cm di atas tangki (aman diinjak beban berat)\nFungsi : Mencegah pergeseran tanah ambles menekan struktur tangki fiber.',
    material: 'Semen Tiga Roda, Besi Wiremesh M12, Sloof M10, Pasir cor, Kerikil, Bata Merah',
    capacity: 'Menahan beban tanah & air s.d 5 Ton',
    dimensions: 'Sesuai dimensi lubang tanam tangki bio',
    power: 'N/A',
    flowRate: 'N/A',
    pressure: 'Kekuatan tekan beton k-200',
    warranty: '1 Tahun Masa Pasang',
    stockLocation: 'On-Site Fabrikasi',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Galian tanah sedalam 1.5 meter, perataan pasir dasar tebal 10cm, pengecoran plat dasar tumpuan tebal 10cm, pemasangan dinding bata penahan longsor, pengecoran dek penutup plat semen beton bertulang.',
    includeWork: 'Batu split, semen portland, air bersih cor, bambu bekisting, lem kayu bekisting.',
    estimationTime: '7 Hari Kerja',
    views: 140
  },
  {
    id: 'kemiri-piping-002',
    name: 'Instalasi Pipa Rucika Class AW 4 Inch (Max 20m)',
    sku: 'KEM-PIP-4RUC20',
    category: 'piping',
    subCategory: 'Instalasi Pipa PVC',
    type: 'jasa',
    brand: 'PT. Kemiri Jaya Fiber Tehnik',
    priceItem: 1650000,
    priceService: 1000000,
    priceInstallation: 500000,
    unit: 'Lot',
    description: 'Pemasangan pipa pembuangan air kotor PVC merek Rucika Class AW diameter 4 inch dengan panjang bentang maksimal 20 meter.',
    specifications: 'Bahan/Tipe : Rucika / Setara AW Tebal\nUkuran Pipa : 4 Inch\nPanjang Bentang : Maksimum 20 Meter run\nKelengkapan : Elbow fitting, bracket support besi, lem pipa PVC tahan air tekanan air buangan',
    material: 'Rucika Class AW PVC 4", Solvent Cement',
    capacity: 'Gravity drain outlet',
    dimensions: 'Diameter 4 Inch',
    power: 'N/A',
    flowRate: 'Pipa Rucika AW 4 Inch IPAL',
    pressure: 'N/A',
    warranty: '3 Bulan Garansi Pemasangan Rapi',
    stockLocation: 'Gudang Kebon Jeruk',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan gantung dengan dinabolt bracket pada dinding samping gedung, setting level kemiringan pipisan minimal 1%, perekatan konektor fiting lem PVC rucika.',
    includeWork: 'U-bolt steel hangers, lem, seal PVC, isolatif.',
    estimationTime: '1 Hari Kerja',
    views: 110
  },
  {
    id: 'kemiri-bak-001',
    name: 'Bak Kontrol / Greasechamber Galian Beton',
    sku: 'KEM-CIV-BKONTROL',
    category: 'service maintenance',
    subCategory: 'Sipil & Konstruksi',
    type: 'jasa',
    brand: 'PT. Kemiri Jaya Fiber Tehnik',
    priceItem: 2500000,
    priceService: 2500000,
    priceInstallation: 1000000,
    unit: 'Lot',
    description: 'Pekerjaan sipil pembuatan bak pasir kontrol atau grease trap penyaring minyak, galian tanah dimensi lebar 1.5 x 1.5 x 1.5 meter menggunakan konstruksi beton bertulang.',
    specifications: 'Dimensi Galian : Panjang 1.5 meter x Lebar 1.5 meter x Dalam 1.5 meter\nKonstruksi Dinding : Beton cor site mix bertulang k-175\nPembesian : Wiremesh M12 grade a kuat, balok sloof bertulang m10\nAksesoris : Tutup bak besi plat/beton modular dengan ring angkat\nFungsi : Penangkap pasir endpan & jebakan minyak grease sblm masuk septictank.',
    material: 'Semen Gresik, Wiremesh M12, Sloof M10, Bata plesteran waterproof, Plat cover steel',
    capacity: 'Kapasitas tampung s.d 3 m3 air limbah saringan',
    dimensions: '1.5 m x 1.5 m x 1.5 m',
    power: 'N/A',
    flowRate: 'Grease Trap & Sand Trap system',
    pressure: 'N/A',
    warranty: '1 Tahun Garansi Kebocoran Sipil',
    stockLocation: 'On-Site Sump Build',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pek Galian tanah manual, fabrikasi anyaman wiremesh sloof, pengecoran dinding bak tebal 10cm dengan adukan semen sirtu, pemlesteran aci waterproof penahan rembesan air tanah, pembuatan piringan tutup besi handle.',
    includeWork: 'Bahan adukan cor, multiplex bekisting, tiang kasong penyongga, angkur handle besi.',
    estimationTime: '4 Hari Kerja',
    views: 135
  },
  {
    id: 'gigt-septic-2m3',
    name: 'Bio Septic Tank FRP GIGT Kapasitas 2 m3',
    sku: 'GIG-BIOST-2M3',
    category: 'fabrikasi tanki',
    subCategory: 'Bio Septic Tank',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 7000000,
    priceService: 1000000,
    priceInstallation: 2000000,
    unit: 'Unit',
    description: 'Tangki Bio Septic Tank buatan GIGT berkapasitas 2 m3 (2000 Liter). Terbuat dari bahan struktur fiberglass berkualitas tahan korosi asam tinggi khusus air kotor komersial.',
    specifications: 'Kapasitas Volume : 2 m3 / 2000 Liter\nMaterial : Fiberglass Reinforced Plastic (FRP)\nKonstruksi Dinding : Tebal 6-8 mm solid resin premium\nKelengkapan : Media sarang tawon PVC, pipa disinfektan klorin, ventilasi udara diameter 2 inch\nDimensi Estimasi : Diameter 1200 mm x Panjang 1800 mm\nGaransi : 5 Tahun kebocoran pecah bodi tangki',
    material: 'FRP (Fiberglass Reinforced Plastic) tebal 8mm ribbed',
    capacity: '2 m3 / 2000 Liter',
    dimensions: 'D.1200 mm x P.1800 mm',
    power: 'N/A',
    flowRate: 'Discharge biofilter gravitasi',
    pressure: 'N/A',
    warranty: '5 Tahun Kebocoran Fiber',
    stockLocation: 'Workshop Bekasi GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan media koloni sarang tawon, koneksi sock inlet outlet PVC, uji air pabrik.',
    includeWork: 'Kaporit tablet feeds, biofilm media starter package.',
    estimationTime: '3 Hari Kerja',
    views: 180
  },
  {
    id: 'gigt-septic-20m3',
    name: 'Bio Septic Tank FRP GIGT Kapasitas 20 m3',
    sku: 'GIG-BIOST-20M3',
    category: 'fabrikasi tanki',
    subCategory: 'Bio Septic Tank',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 70000000,
    priceService: 5000000,
    priceInstallation: 10000000,
    unit: 'Unit',
    description: 'Tangki Bio Septic Tank FRP kapasitas 20 m3 untuk mengolah limbah cair terakumulasi ruko, perkantoran, dan kos-kosan berskala besar.',
    specifications: 'Kapasitas Volume : 20 m3 / 20.000 Liter\nMaterial : Fiberglass FRP Ribbed tebal grade industri\nDimensi : Diameter 2200 mm x Panjang 5300 mm\nKetebalan Dinding : 8-10 mm reinforced structure\nFungsi : Pengolah air kumbahan biologis anaerob-aerob terpadu\nGaransi : 5 Tahun jaminan mutu struktur bodi tangki sereal',
    material: 'FRP Fiberglass tebal 10mm ribbed frame',
    capacity: '20 m3 / 20,000 Liter',
    dimensions: 'D.2200 mm x P.5300 mm',
    power: 'N/A',
    flowRate: 'Laju olah limbah harian',
    pressure: 'Static gravity loading',
    warranty: '5 Tahun Kebocoran Konstruksi',
    stockLocation: 'Workshop Bekasi GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Setting level, penataan biomedia internal PVC honeycomb blocks, pemasangan manifold pembagi inlet.',
    includeWork: 'Biomedia honeycomb PVC blocks pre-installed, fiberglass manhole cover.',
    estimationTime: '12 Hari Kerja',
    views: 210
  },
  {
    id: 'gigt-septic-30m3',
    name: 'Bio Septic Tank FRP GIGT Kapasitas 30 m3',
    sku: 'GIG-BIOST-30M3',
    category: 'fabrikasi tanki',
    subCategory: 'Bio Septic Tank',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 105000000,
    priceService: 8000000,
    priceInstallation: 15000000,
    unit: 'Unit',
    description: 'Tangki Bio Septic tank biologis horizontal silinder kapasitas 30 m3 menggunakan resin anti-kimia korosif tebal ribbed.',
    specifications: 'Volume Tanki : 30 m3 / 30.000 Liter\nMaterial : FRP Double Strength structure\nDimensi : Diameter 2400 mm x Panjang 6600 mm\nFitur : Sekat sedimentasi, sekat aerasi anaerob, filter media sarang tawon, chamber pembunuh bakteri patogen\nWarranty : 5 Tahun kebocoran struktural',
    material: 'FRP Fiberglass tebal 10-12 mm structural ribbed',
    capacity: '30 m3 / 30,000 Liter',
    dimensions: 'D.2400 mm x P.6600 mm',
    power: 'N/A',
    flowRate: 'Discharge biofilter gravitasi',
    pressure: 'Hydrostatic gravity design',
    warranty: '5 Tahun Garansi Kebocoran',
    stockLocation: 'Workshop Bekasi GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Fabrikasi tangki fiber tebal, perakitan diffuser internal (jika dibantu aerator), pengaturan baffle pembagi sekat.',
    includeWork: 'Sarang kloni bakteri, media tumbuh, kaporit disinfektan tube.',
    estimationTime: '14 Hari Kerja',
    views: 195
  },
  {
    id: 'gigt-septic-35m3',
    name: 'Bio Septic Tank FRP GIGT Kapasitas 35 m3',
    sku: 'GIG-BIOST-35M3',
    category: 'fabrikasi tanki',
    subCategory: 'Bio Septic Tank',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 122500000,
    priceService: 10000000,
    priceInstallation: 18000000,
    unit: 'Unit',
    description: 'Unit Tangki pengolah biologis Bio Septic Tank kapasitas 35 m3 berbahan serat fiber ribbed structural untuk kapasitas tampung dan olah harian limbah cair komersil tinggi.',
    specifications: 'Volume total : 35 m3 / 35.000 Liter\nBahan : Fiberglass Reinforced Polyester premium\nDimensi : Diameter 2500 mm x Panjang 7100 mm\nKelengkapan : In/Out socket 4-6 Inch PVC, Manhole FRP d.500mm 3 Pcs\nKemampuan olah : Penguraian BOD/COD s.d 80% efisiensi biologis',
    material: 'FRP Fiberglass 12 mm ribbed wall',
    capacity: '35 m3 / 35,000 Liter',
    dimensions: 'D.2500 mm x P.7100 mm',
    power: 'N/A',
    flowRate: '35 m3 air limbah / hari',
    pressure: 'Gravity fluid flow design',
    warranty: '5 Tahun Kebocoran Konstruksi',
    stockLocation: 'Workshop Bekasi GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Perakitan sekat tangki, penempatan media biofilter honeycomb PVC, uji rendam kebocoran sebelum kirim.',
    includeWork: 'Bio-structure PVC honeycomb, chemical feeder tube, fiber cover.',
    estimationTime: '16 Hari Kerja',
    views: 130
  },
  {
    id: 'gigt-septic-40m3',
    name: 'Bio Septic Tank FRP GIGT Kapasitas 40 m3',
    sku: 'GIG-BIOST-40M3',
    category: 'fabrikasi tanki',
    subCategory: 'Bio Septic Tank',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 140000000,
    priceService: 12000000,
    priceInstallation: 20000000,
    unit: 'Unit',
    description: 'Tangki Bio Septic Tank horizontal silinder kapasitas 40 m3 fiberglass ribbed super kuat buatan PT. GIGT untuk penanganan limbah komplek industri besar.',
    specifications: 'Kapasitas Volume : 40 m3 / 40.000 Liter\nMaterial : Fiberglass Reinforced Plastic (FRP)\nDimensi : Diameter 2500 mm x Panjang 8200 mm\nKetebalan bodi : 12-14 mm rib reinforcement\nAksesoris : 3 manhole inlet, gasket anti-leak, blower-pipe connector socket\nGaransi : 5 Tahun kebocoran korosif bodi serat fiber',
    material: 'FRP Fiberglass super strength 14 mm ribbed',
    capacity: '40 m3 / 40,000 Liter',
    dimensions: 'D.2500 mm x P.8200 mm',
    power: 'N/A',
    flowRate: 'Kapasitas s.d 40 m3/hari air buangan',
    pressure: 'Hydrostatic gravity design',
    warranty: '5 Tahun Garansi Kebocoran Pabrik',
    stockLocation: 'Workshop Bekasi GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan ribbed frame penopang bawah tanah, peletakkan biofilm media PVC, integrasi chlorination ring.',
    includeWork: 'Honeycomb PVC biomonitoring blocks, kaporit tablet 10 kg, saringan mesh.',
    estimationTime: '18 Hari Kerja',
    views: 165
  },
  {
    id: 'gigt-operator-001',
    name: 'Jasa Operator IPAL Profesional (Bulanan/Kunjungan)',
    sku: 'JSA-OPERATOR-IPAL',
    category: 'service maintenance',
    subCategory: 'Layanan Pendampingan',
    type: 'jasa',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 0,
    priceService: 7500000,
    priceInstallation: 0,
    unit: 'Lot',
    description: 'Penyediaan jasa operator harian / kunjungan berkala bersertifikasi keandalan lingkungan hidup untuk pemantauan parameter IPAL.',
    specifications: 'Jenis Layanan : Jasa Operator & Maintenance IPAL / STP harian\nDurasi : 1 Bulan Kontrak Kunjungan\nPersonel : 1 Orang Operator Bersertifikasi Keahlian Air Limbah\nCakup Tugas : Monitoring DO, pH duga tinggi air, uji pengendapan lumpur SV-30, pembersihan trash basket, dosing disinfektan/klorin, backwash manual media filter tabung pasir karbon.\nPelaporan : Buku logsheet mingguan & laporan bulanan kepatuhan lingkungan',
    material: 'Uji kit kualitas air sederhana (DO meter, pH meter, kerucut SV30)',
    capacity: 'Layanan IPAL kapasitas s.d 100 m3/hari',
    dimensions: 'N/A',
    power: 'N/A',
    flowRate: 'Pemeliharaan operasional sistem kontinual',
    pressure: 'Operational excellence safety guarantee',
    warranty: 'Pendampingan penuh parameter air limbah stabil memenuhi BMAL',
    stockLocation: 'Kantor Tangerang GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pengecekan parameter air influent effluent, optimasi laju aerasi blower, pengurasan lumpur berlebih (sludge wasting), pelaporan kepatuhan parameter.',
    includeWork: 'Alat kelengkapan monitoring harian manual, form logsheet hardcopy, chemical pancingan bakteri starter.',
    estimationTime: '1 Bulan Kontrak',
    views: 320
  },
  {
    id: 'gigt-consumable-001',
    name: 'Paket Tools Konsumabiel IPAL (Perlengkapan Lapangan)',
    sku: 'EQP-CONSUMABLE-STP',
    category: 'mechanical',
    subCategory: 'Tools & Consumables',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 4000000,
    priceService: 0,
    priceInstallation: 0,
    unit: 'Lot',
    description: 'Paket lengkap perlengkapan lapangan operasional IPAL/STP seperti kantong sampah limbah, sarung tangan pelindung, tongkat sampling air, dan alat ukur lumpur SV-30.',
    specifications: 'Isi Paket Perlengkapan :\n1. Polybag Plastik Hitam Sampah Limbah Lebar (2 Roll)\n2. Karung Lumpur Saringan PP (50 Lembar)\n3. Sarung Tangan Karet Tebal Safety (3 Pasang)\n4. Stick Hook Teleskopik Stainless Sampling Air (1 Unit)\n5. Saringan Serokan Sampah Stainless Manual (1 Psc)\n6. Gelas Silinder Ukur Uji Lumpur SV-30 Plastik Kapasitas 1 Liter (1 Psc)',
    material: 'Stainless Steel, PP, Synthetic Rubber, PVC',
    capacity: 'Alat ukur SV30 kapasitas 1 Liter',
    dimensions: 'Dimensi box packaging 500x350x300 mm',
    power: 'N/A',
    flowRate: 'N/A',
    pressure: 'N/A',
    warranty: 'Garansi retur pfach saat pengiriman',
    stockLocation: 'Gudang Utama Tangerang',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Penyediaan dan pengepakan serta pengiriman langsung ke alamat proyek.',
    includeWork: 'Kartu petunjuk cara uji pengendapan volume lumpur biologis SV-30.',
    estimationTime: '2 Hari Kerja',
    views: 180
  },
  {
    id: 'gigt-chemical-001',
    name: 'Paket Penyediaan Chemical IPAL (Kaporit & Bakteri)',
    sku: 'CHM-CHEMICAL-PKG',
    category: 'chemical',
    subCategory: 'Bahan Penunjang',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 5500000,
    priceService: 0,
    priceInstallation: 0,
    unit: 'Lot',
    description: 'Penyediaan paket chemical penstabil bakteri biologis dan disinfektan kaporit tablet untuk mensterilkan limbah medis maupun kuman air olahan.',
    specifications: 'Komposisi Paket Bahan Kimia :\n1. Kaporit Tablet Flat 90% Murni (Satu Pail Berat 15 kg) untuk disinfeksi saluran akhir.\n2. Bakteri Cair Pengurai Organik Konsentrat Biopro (5 Jerigen x 5 Liter = Total 25 Liter) untuk penstabil bakteri tangki aerasi.\nKategori : Bahan consumable utilitas IPAL penurun sediaan BOD/COD air buangan.',
    material: 'Calcium Hypochlorite Tablet 90%, Konsentrat Heterotrop Saprofit Active Bacteri',
    capacity: 'Dosis pemakaian untuk 1-2 bulan operasional STP standard',
    dimensions: 'Berat total packaging 42 kg',
    power: 'N/A',
    flowRate: 'N/A',
    pressure: 'N/A',
    warranty: 'Masa kadaluarsa produk 24 bulan sejak tanggal kemasan',
    stockLocation: 'Gudang Tangerang GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pengiriman paket bahan kimia dengan standard kemasan tahan pecah dan tumpah cairan kimia.',
    includeWork: 'Sertifikat SDS (Safety Data Sheet) & petunjuk penanganan bahan berbahaya.',
    estimationTime: '3 Hari Kerja',
    views: 190
  },
  {
    id: 'gigt-softener-1665',
    name: 'Filter Softener FRP 1665 (Kapasitas 5 m3/jam)',
    sku: 'FLT-SOFT-FRP1665',
    category: 'filter air',
    subCategory: 'Media Filter',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 23500000,
    priceService: 1500000,
    priceInstallation: 2500000,
    unit: 'Unit',
    description: 'Sistem tangki filter pelunak air (Water Softener) berbahan tabung serat kaca FRP diameter 16 inch tinggi 65 inch penurun zat kapur air kotor.',
    specifications: 'Model/Tipe : Filter Softener FRP 1665\nKapasitas Aliran : 5 m³ / jam\nIsi Tabung : Media Resin Kation Exchanger 140 Liter Premium Grade\nSistem Regenerasi : Garam NaCl penakar dengan tangki penggaram regenerant PE diameter 300L\nOperasional Valve : Manual Backwash multiport controller\nGaransi : 12 Bulan garansi tabung fiber pecah',
    material: 'FRP (Fiberglass Reinforced Plastic) tank, Polyethylene brine tank, Resin Kation Exchanger Premium',
    capacity: '140 Liter media resin kation',
    dimensions: 'D.400 mm x T.1650 mm',
    power: 'N/A (Hydro-static pressure manual valve)',
    flowRate: '5 m³/jam debit saringan',
    pressure: 'Maksimum tekanan operasi 4 - 6 Bar',
    warranty: '1 Tahun Garansi Tabung & Valve',
    stockLocation: 'Gudang Utama Jakarta',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan gravel tumpuan dasar, pengisisan resin kation, koneksi multiport manual valve, penyambungan selang hisap brine tank garam regeneran.',
    includeWork: 'Multiport softener head valve, internal riser pipe & strainers, 1 lot garam NaCl regenerasi awal (25 kg).',
    estimationTime: '2 Hari Kerja',
    views: 145
  },
  {
    id: 'gigt-softener-3072',
    name: 'Filter Softener FRP 3072 (Kapasitas 10 m3/jam)',
    sku: 'FLT-SOFT-FRP3072',
    category: 'filter air',
    subCategory: 'Media Filter',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 37000000,
    priceService: 2500000,
    priceInstallation: 3500000,
    unit: 'Unit',
    description: 'Unit water softener filter tabung serat kaca ukuran besar diameter 30 inch tinggi 72 inch berkapasitas aliran 10 m3/jam.',
    specifications: 'Model/Tipe : Filter Softener FRP 3072\nKapasitas Aliran : 10 m³ / jam\nIsi Tabung : Resin Kation Penukar Ion Keras Kapur 350 Liter\nMultiport Kepala : Semi-Automatic valve controller untuk sirkulasi backwash & regenerasi\nAksesoris : Tangki Regeneran Garam PE volume 500 Liter lengkap\nGaransi : 12 Bulan garansi resmi dari distributor lokal',
    material: 'FRP (Fiberglass Reinforced Plastic) robust casing, PE brine tank 500L',
    capacity: '350 Liter media resin premium',
    dimensions: 'D.750 mm x T.1800 mm',
    power: '50 Watt / 220V AC (untuk head semi-auto controller)',
    flowRate: '10 m³/jam debit hisap',
    pressure: 'Max operation pressure 5 Bar',
    warranty: '1 Tahun Garansi Resmi GIGT',
    stockLocation: 'Gudang Utama Tangerang',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan riser internal multi-strainer, pengisian saringan kerikil tumpuan silika, penuangan resin softener premium, alignment valve head elektrik.',
    includeWork: 'Semi-auto multiport softener valve head, top and bottom distributor strainers, 2 sacks salt NaCl (50 kg).',
    estimationTime: '3 Hari Kerja',
    views: 120
  },
  {
    id: 'gigt-groundtank-30m3',
    name: 'Ground Tank FRP Kapasitas 30 m3',
    sku: 'TNK-GRND-FRP30',
    category: 'fabrikasi tanki',
    subCategory: 'Ground Tank',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 135000000,
    priceService: 5000000,
    priceInstallation: 15000000,
    unit: 'Unit',
    description: 'Tangki tanam bawah tanah (ground tank) modular berbahan serat fiberglass tebal berkemampuan tampung air kotor s.d 30.000 liter.',
    specifications: 'Volume total : 30 m3 / 30.000 Liter\nBahan Penunjang : FRP (Fiberglass Reinforced Plastic) ribbed skin\nDimensi Tangki : Panjang 5.0 meter x Lebar 3.0 meter x Tinggi 2.0 meter\nStructure : Penahan beban tanah rib silinder horizontal\nAksesoris Terpasang : Tangga Stainless Steel 304, Manhole d.500 mm, flange socket PVC inlet outlet.',
    material: 'FRP Glass 12 mm solid tebal, ribbed steel support',
    capacity: '30 m3 / 30,000 Liter',
    dimensions: 'P.5000 mm x L.3000 mm x T.2000 mm',
    power: 'N/A',
    flowRate: 'Static fluid storage 30 m3',
    pressure: 'Tahan tekanan hidrolik tanah dalam',
    warranty: '5 Tahun Garansi Kebocoran Tangki Tanam',
    stockLocation: 'Workshop Bekasi GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan saddle tumpuan landasan tangki, penyetelan sock inlet outlet, penimbunan dan pemadatan tanah halus penutup tangki galian.',
    includeWork: 'Saddle structural support, manhole cover plate, anchor hook set.',
    estimationTime: '10 Hari Kerja',
    views: 185
  },
  {
    id: 'gigt-peltank-3000l',
    name: 'Tangki Suplay Polyethylene 3000 Liter',
    sku: 'TNK-PE-SUPLAY3000',
    category: 'fabrikasi tanki',
    subCategory: 'Polyethylene Tank',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 6000000,
    priceService: 500000,
    priceInstallation: 1000000,
    unit: 'Unit',
    description: 'Tangki sediaan air bersih / kotor PE (Polyethylene) anti lumut kualitas murni berkapasitas 3000 Liter bentuk tegak silinder.',
    specifications: 'Model/Tipe : PE Cylindrical Vertical Tank 3000 L\nVolume Tampung : 3000 Liter (3 m3)\nDimensi Fisik : Diameter 1440 mm x Tinggi total 2110 mm\nMaterial : Polyethylene murni rapat cahaya anti-UV anti-lumut\nKoneksi Lubang sediaan : Threaded fitting brass drat 2 inchi',
    material: 'HDPE Polyethylene Food Grade resin murni',
    capacity: '3000 Liter / 3 m3',
    dimensions: 'D.1440 mm x T.2110 mm',
    power: 'N/A',
    flowRate: 'Water supply buffers',
    pressure: 'Static fluid loading',
    warranty: '10 Tahun Garansi Pabrik Keretakan',
    stockLocation: 'Gudang Utama Tangerang',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Uji taruh dudukan semen rata level, penyambungan drat pipa hisap supply PVC 2 inch.',
    includeWork: 'Discharge ball valve brass 2", ventilasi saring serangga.',
    estimationTime: '2 Hari Kerja',
    views: 155
  },
  {
    id: 'gigt-sumpitbeton-2x1',
    name: 'Bak Sumpit Beton Sipil 2m x 1m x 1.3m',
    sku: 'CIV-SUMPIT-BETON',
    category: 'service maintenance',
    subCategory: 'Sipil & Konstruksi',
    type: 'jasa',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 8000000,
    priceService: 5000000,
    priceInstallation: 2000000,
    unit: 'Lot',
    description: 'Pekerjaan galian konstruksi sipil cor tanah bertulang beton untuk pembuatan bak sumpit penampung air limbah kotor ukuran 2 x 1 x 1.3 meter.',
    specifications: 'Dimensi Bersih : Panjang 2.0 meter x Lebar 1.0 meter x Dalam 1.3 meter\nDinding Struktur : Cor beton site mix bertulang minimum k-200\nPembesian : Anyaman besi angkur baja M6 / M8 standard proyek\nLapis Dalam : Waterproofing plaster khusus anti rembes cair tanah\nFungsi : Bak penampungan awal pengendap kerikil sblm pompa transfer air.',
    material: 'Semen Holcim, Besi ulir M8, Pasir Sirtu, Plywood bekisting, Cairan Waterproofing',
    capacity: 'Kapasitas s.d 2.6 m3 aliran air kotor',
    dimensions: '2.0 m x 1.0 m x 1.3 m',
    power: 'N/A',
    flowRate: 'Sump basin drainage',
    pressure: 'Kekuatan cor k-200',
    warranty: '1 Tahun Masa Pasang',
    stockLocation: 'On-Site Sipil Build',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Galian tanah mekanis/manual, pembesian panel dinding dasar bak, cor plat dasar, bekisting cor tegak, plester waterproof finishing, test rendam kebocoran.',
    includeWork: 'Kanal kayu tumpuan bekisting, multiplex, kawat beton angkur, pipa drain sleeve.',
    estimationTime: '6 Hari Kerja',
    views: 120
  },
  {
    id: 'gigt-rumahlumpur-3x8',
    name: 'Rumah IPAL Baja Ringan 3m x 8m P.75',
    sku: 'CIV-RUMAH-IPAL',
    category: 'service maintenance',
    subCategory: 'Sipil & Konstruksi',
    type: 'jasa',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 65000000,
    priceService: 40000000,
    priceInstallation: 20000000,
    unit: 'Lot',
    description: 'Konstruksi sipil pembuatan rumah pelindung utilitas mesin blower, panel, dosing IPAL berbahan rangka baja ringan P.75 atap seng spandek ukuran 3 x 8 meter.',
    specifications: 'Dimensi Lantai : Panjang 8.0 meter x Lebar 3.0 meter (Luas 24 m2)\nKonstruksi Atap : Rangka truss kanal baja ringan P.75 tebal 0.75 mm\nPenutup Atap : Seng Gelombang Spandek tebal 0.35 mm murni\nKonstruksi Alas : Cor rabat beton tebal 10 cm dilapisi wiremesh m6\nPintu Akses : Pintu sorong tralis kawat siling kuat pengunci slot',
    material: 'Profil Truss Baja Ringan P.75, Seng Spandek, Wiremesh M6, Semen pasir cor rabat',
    capacity: 'Rumah utilitas multi-mesin blower/panel',
    dimensions: '3.0 m x 8.0 m x T.2.8 m',
    power: 'N/A',
    flowRate: 'N/A',
    pressure: 'Wind load resistance s.d 80 km/jam',
    warranty: '1 Tahun Kebocoran Rangka & Atap',
    stockLocation: 'On-Site Build Sump',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Persihan lahan tapak rumah utilitas, galian tanah balok pondasi pinggir, anyaman besi wiremesh cor lantai dasar setebal 10cm, instalRangka baja ringan tegak duga atap spandek, penyambungan saringan pintu penutup.',
    includeWork: 'Baut baja rangka ring, dinabolt angkur cor, engsel pintu tralis besi, seng sealant silicone.',
    estimationTime: '10 Hari Kerja',
    views: 110
  },
  {
    id: 'gigt-indikatorbio-1m',
    name: 'Bak Indikator Biomorfologi 1m x 1m x 1m',
    sku: 'CIV-BK-INDIKATOR',
    category: 'service maintenance',
    subCategory: 'Sipil & Konstruksi',
    type: 'jasa',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 2000000,
    priceService: 2000000,
    priceInstallation: 1000000,
    unit: 'Lot',
    description: 'Pembuatan bak penguji biologis air olahan (kolam indikator hidup ikan koi/mas) ukuran 1m x 1m x 1m menggunakan dinding bata merah diplester tahan rembes.',
    specifications: 'Dimensi Bak : Panjang 1.0 meter x Lebar 1.0 meter x Dalam 1.0 meter\nKonstruksi Dinding : Pasangan bata merah diplester halus dua layer\nSifat Lapisan : Lapis acian semen waterproofing anti bocor air\nAksesoris : Pipa overflow inlet/outlet PVC diameter 2 inchi\nFungsi : Sebagai penilai visual indikator biotik ikan hayati air olahan IPAL aman dari racun sebelum dibuang.',
    material: 'Bata Merah, Semen Dynamix, Pasir plester, Cairan Waterproofing Aquaproof',
    capacity: 'Kapasitas tampung 1 m3 air kolam',
    dimensions: '1.0 m x 1.0 m x 1.0 m',
    power: 'N/A',
    flowRate: 'Overflow bio-assay basin',
    pressure: 'Static fluid load 1 Ton',
    warranty: '1 Tahun Kebocoran Konstruksi',
    stockLocation: 'On-Site Build Sump',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Galian pondasi dasar kolam, penataan batu merah, adukan plester keliling, waterproofing kuas 2 lapis, uji genangan air 48 jam.',
    includeWork: 'Drat sock PVC, kawat saringan lubang outlet, ragi semen.',
    estimationTime: '3 Hari Kerja',
    views: 125
  },
  {
    id: 'gigt-wastafel-kantin',
    name: 'Wastafel Kantin Hygiene Pasangan Bata & Keramik',
    sku: 'CIV-WASTAFEL-KANTIN',
    category: 'service maintenance',
    subCategory: 'Sipil & Konstruksi',
    type: 'jasa',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 2000000,
    priceService: 2000000,
    priceInstallation: 1000000,
    unit: 'Lot',
    description: 'Pembuatan unit wastafel sarana kebersihan cuci tangan area kantin ruko/pabrik berdimensi 1 x 0.5 meter berspesifikasi finishing keramik rapi.',
    specifications: 'Dimensi Fisik : Panjang 100 cm x Lebar 50 cm x Tinggi standard 85 cm\nKonstruksi Body : Rangka pasangan batu bata merah diplester kokoh\nFinishing Meja : Balutan keramik polos saringan halus ukuran 30x30 cm warna cerah\nKelengkapan : Unit keran air angsa stainless steel chrome push, sink stainless, pipa afur buangan elastis.',
    material: 'Bata merah, semen pasir, keramik, afur sink stainless, keran leher angsa',
    capacity: 'Single station hygiene wash',
    dimensions: '1.0 m x 0.5 m x T.0.85 m',
    power: 'N/A',
    flowRate: 'N/A',
    pressure: 'Water supply line connection 1/2 inchi',
    warranty: '6 Bulan Masa Pasang',
    stockLocation: 'On-Site Build Sump',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan sekat bata wastafel, semen cor plat tumpuan keramik, pemasangan pipa water inlet outlet afur, perekatan keramik list nat instan, pemasangan fiting kran wastafel.',
    includeWork: 'Semen putih nat keramik, lem sealant anti bocor sela washbasin, fiting kran.',
    estimationTime: '3 Hari Kerja',
    views: 110
  },
  {
    id: 'gigt-panel-master',
    name: 'Kontrol Panel IPAL Master (Timer & Overload)',
    sku: 'PNL-IPAL-MASTER',
    category: 'panel listrik',
    subCategory: 'Control Panel',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 25000000,
    priceService: 2000000,
    priceInstallation: 3000000,
    unit: 'Set',
    description: 'Panel kontrol sirkuit listrik utama pengendali seluruh mesin dinamo pompa & blower pada sistem IPAL atau STP.',
    specifications: 'Tipe Box Panel : Metal Sheet wall-mounting coating outdoor tebal 1.5mm ip55\nKomoditas Kontak : MCB breaker Schneider, magnetic contactor Omron, thermal overload relay\nFitur Cerdas : 24-Hours programmable timer untuk penukur putaran dinamo alternate blower otomatis agar mesin tidak panas, lampu led indikasi running/fault/trip.\nInput Tegangan : 3 Phase 380V atau 1 Phase 220V',
    material: 'Box Panel Metal, Breaker MCB Schneider, Relay Omron, Volt-ampere meter analog, Wiring duct cable',
    capacity: 'Kontrol motor dinamo daya total s.d 22 kW / 30 HP',
    dimensions: '600 mm x 400 mm x 200 mm',
    power: 'Daya operasi kontrol panel 15 Watt',
    flowRate: 'Sirkuit listrik pengaman motor terpadu',
    pressure: 'N/A',
    warranty: '1 Tahun Garansi Komponen Listrik',
    stockLocation: 'Workshop Panel Bekasi',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Perakitan komponen dalam (wiring), penataan jalur terminal kabel terminal strip, pengujian relay timer pabrik, instalasi duga angkur box pada dinding.',
    includeWork: 'Dynabolt fiting gantung, kunci pintu box segitiga metal, lembar gambar skema wiring diagram panel.',
    estimationTime: '3 Hari Kerja',
    views: 185
  },
  {
    id: 'gigt-booster-washer',
    name: 'Pompa Booster Washer Saringan Tekanan',
    sku: 'POM-BOOSTER-WASHER',
    category: 'pompa',
    subCategory: 'Centrifugal Pump',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 3500000,
    priceService: 500000,
    priceInstallation: 500000,
    unit: 'Unit',
    description: 'Pompa pendorong (booster) berdaya hisap dorong kuat untuk menyemprot membersihkan mesh saringan filter stainless dari sumbatan kotoran padat.',
    specifications: 'Model/Tipe : Booster Centrifugal Jet Pump\nPower/Daya : 250 Watt / 220V / 1 phase\nHead Maksimum : 35 Meter\nKapasitas Dorong : 50 Lpm\nOutlet Konektor : 1 Inch drat dalam\nFitur : Otomatis pressure switch, bodi penutup anti-karat korosif kimia klorin',
    material: 'Stainless SS304 Impeller, Cast Iron casing motor',
    capacity: '50 Liter / menit semburan air',
    dimensions: '310 mm x 185 mm x 240 mm',
    power: '250 Watt / 220V AC 1 Phase',
    flowRate: '3 m³/jam',
    pressure: 'Tekanan dorong sembur s.d 3.5 Bar',
    warranty: '1 Tahun Garansi Motor Pabrikan',
    stockLocation: 'Gudang Utama Tangerang',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan fiting drat nepel, dudukan damper pompa karet absorber getaran, penyambungan sensor pressure pensaklaran otomatis.',
    includeWork: 'Karet kaki absorber, seal tape 3 pcs, manual book panduan pemasangan.',
    estimationTime: '1 Hari Kerja',
    views: 115
  },
  {
    id: 'gigt-chemical-dosing',
    name: 'Dosing Pump Seko Injeksi Klorinator 1 Phase',
    sku: 'POM-DOS-SEKO-1P',
    category: 'dosing pump',
    subCategory: 'Solenoid Dosing Pump',
    type: 'barang',
    brand: 'Seko',
    priceItem: 5700000,
    priceService: 500000,
    priceInstallation: 800000,
    unit: 'Unit',
    description: 'Pompa dosing diaphragm merek Seko original buatan Italia bertipe solenoid 1 Phase untuk injeksi klorinator pembasmi kuman.',
    specifications: 'Model/Type : Seko AMS200 (Chlorine Dosing pump)\nDaya Listrik : 20 Watt, 220V, 50 Hz, 1 Phase\nKapasitas Pompa : 4.7 Liter / jam (customizable stroke regulation)\nTekanan Kerja : Maksimum 3 Bar pressure\nMaterial Head : PVDF solid tahan korosif kaporit konsentrasi tinggi\nKategori : Pompa penyuplai disinfektan pembunuh mikroba klorin air buangan.',
    material: 'PVDF pump head, PTFE solid diaphragm, Viton o-ring seal',
    capacity: '4.7 Liter / jam aliran klorin cair',
    dimensions: '160 mm x 110 mm x 230 mm',
    power: '20 Watt / 220V AC 1 Phase',
    flowRate: '4.7 L/jam',
    pressure: '3.0 Bar max',
    warranty: '1 Tahun Garansi Seko Resmi',
    stockLocation: 'Gudang Utama Jakarta',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Penyetelan stroke rate injeksi bahan kimia, connection selang suction discharge, fiting valve disinfektan.',
    includeWork: 'Selang PE tubing 4m, filter kaki saringan dasar, fiting valve injektor.',
    estimationTime: '1 Hari Kerja',
    views: 155
  },
  {
    id: 'gigt-filter-grdf',
    name: 'Pompa Filter Centrifugal Multistage Groundfos',
    sku: 'POM-FLT-GRUNDFOS',
    category: 'pompa',
    subCategory: 'Centrifugal Pump',
    type: 'barang',
    brand: 'Grundfos',
    priceItem: 12000000,
    priceService: 1000000,
    priceInstallation: 1500000,
    unit: 'Unit',
    description: 'Pompa dorong hisap media filter saringan pasir/karbon tipe centrifugal multi-stage horizontal merek Grundfos buatan Denmark.',
    specifications: 'Model/Tipe : Grundfos CM 3-4\nPower/Daya : 0.5 kW / 0.7 HP, 220V, 50Hz, 1 Phase\nHead Range : 15 - 32 Meter\nKapasitas Aliran : 3 m3 / jam (50 Lpm)\nMaterial : Stainless Steel SS304 (Impeller & Chamber)\nKoneksi Discharge : 1 Inch drat dalam\nFungsi : Pompa dorong filter polishing sistem WTP / STP handal tinggi',
    material: 'Stainless Steel SS304 (Chamber & Impellers)',
    capacity: '50 Liter / menit aliran dorong',
    dimensions: '330 mm x 170 mm x 205 mm',
    power: '0.5 kW (0.7 HP) 220V 1 Phase',
    flowRate: '3 m³/jam',
    pressure: '3.2 Bar max',
    warranty: '1 Tahun Garansi Grundfos Indonesia',
    stockLocation: 'Gudang Utama Tangerang',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan automatic pressure controller, setting base tumpuan, dinabolt angkur pompa, penyambungan pipa inlet outlet.',
    includeWork: 'Karet peredam getar, manual book, box kemasan original.',
    estimationTime: '2 Hari Kerja',
    views: 130
  },
  {
    id: 'gigt-watermeter-2',
    name: 'Water Meter Stainless Threaded 2 Inch',
    sku: 'EQP-WM-SS2',
    category: 'electrical',
    subCategory: 'Flowmeter',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 8000000,
    priceService: 500000,
    priceInstallation: 1000000,
    unit: 'Pcs',
    description: 'Alat pengukur kuantitas pengeluaran laju debit pembuangan air olahan berbahan Stainless Steel anti korosi ukuran sambungan ulir 2 inchi.',
    specifications: 'Model/Tipe : Threaded Water Meter Stainless\nUkuran Koneksi : 2 Inch (DN 50) drat male/female\nMaterial Tubuh : Stainless Steel SS304 anti karat kimia limbah\nTampilan Angka : Register analog m3 mekanis segel terkalibrasi\nKapasitas ukur : Aliran kontinu s.d 15 m3/jam',
    material: 'Stainless Steel SS304 body, internal resin non-corrosive gears',
    capacity: 'DN50 (2 Inch) connection capacity',
    dimensions: '280 mm x 115 mm x 150 mm',
    power: 'N/A (Mechanical flow operation)',
    flowRate: '0.15 - 15 m³/jam range',
    pressure: 'Max operation pressure 10 Bar',
    warranty: '1 Tahun Garansi Akurasi Kalibrasi',
    stockLocation: 'Gudang Utama Tangerang',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pek drat penyambungan sejajar pemipaan pipa, test kekedapan air gasket.',
    includeWork: 'Dual brass coupling nipples, silikon gasket oring seal.',
    estimationTime: '1 Hari Kerja',
    views: 125
  },
  {
    id: 'gigt-watermeter-1',
    name: 'Water Meter Stainless Threaded 1 Inch',
    sku: 'EQP-WM-SS1',
    category: 'electrical',
    subCategory: 'Flowmeter',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 4000000,
    priceService: 500000,
    priceInstallation: 800000,
    unit: 'Pcs',
    description: 'Alat pengukur aliran sediaan air bersih/kotor berbahan Stainless Steel SS304 tahan karat kuat ukuran drat 1 inchi.',
    specifications: 'Model/Tipe : Threaded Water Meter Stainless\nUkuran DN : DN25 (1 Inch) drat thread\nBahan Body : Stainless Steel SS 304 tahan karat\nSertifikasi : Tera Kalibrasi standard kemetrologian lokal\nDebit Maksimum : s.d 5 m3/jam aliran air',
    material: 'Stainless Steel SS304 body casing',
    capacity: 'DN25 (1 Inch) flow capacity',
    dimensions: '190 mm x 95 mm x 110 mm',
    power: 'N/A (Mechanical)',
    flowRate: '0.05 - 5 m³/jam scale',
    pressure: 'Max pressure 10 Bar',
    warranty: '1 Tahun Garansi Sediaan Tertera',
    stockLocation: 'Gudang Tangerang GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Pemasangan ssejajar arah panah laju air, fitting double nepel coupling.',
    includeWork: 'Brass coupling nuts oring seal.',
    estimationTime: '1 Hari Kerja',
    views: 110
  },
  {
    id: 'gigt-grasstrap-1m3',
    name: 'Bak Grasstrap FRP Pemisah Minyak & Lemak 1 m3',
    sku: 'TNK-GT-FRP1M3',
    category: 'fabrikasi tanki',
    subCategory: 'Grease Trap',
    type: 'barang',
    brand: 'Garda Inovasi Globaltech',
    priceItem: 4000000,
    priceService: 500000,
    priceInstallation: 1000000,
    unit: 'Unit',
    description: 'Sistem bak perangkap separator lemak, minyak goreng, dan sisa lumpur makanan (grease trap) bahan fiber tebal kapasitas 1 m³.',
    specifications: 'Model/Type : GIGT-GT-1000 Premium Grease Separation\nKapasitas Tampung : 1 m3 / 1000 Liter\nMaterial : Fiberglass Reinforced Plastic (FRP) anti lumut\nSekat Penahan : 3 baffle plate manual pengumpul minyak mengambang\nAksesoris : Basket mesh saringan stainless steel 304 penangkap padatan sisa nasi makanan diameter basket lebar.\nWarranty : 3 Tahun garansi kebocoran penahan bodi fiber',
    material: 'FRP (Fiberglass Reinforced Plastic) structural resin',
    capacity: '1 m3 / 1000 Liter',
    dimensions: 'P.1200 mm x L.800 mm x T.1050 mm',
    power: 'N/A (Mechanical gravitation float)',
    flowRate: 'Grease separation flow s.d 50 Lpm',
    pressure: 'N/A',
    warranty: '3 Tahun Kebocoran Fiber',
    stockLocation: 'Workshop Bekasi GIGT',
    status: 'aktif',
    createdBy: 'system',
    createdByName: 'Admin Gigt',
    createdDate: '2026-06-15T08:00:00Z',
    lastUpdate: '2026-06-18T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600'],
    detailWork: 'Galian penempatan tanah atau dudukan rata, penyambungan drat socket PVC inlet outlet AW diameter 3 inchi.',
    includeWork: 'Stainless steel 304 trash screen basket handle, gasket cover seal rubber.',
    estimationTime: '3 Hari Kerja',
    views: 140
  }
];

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

  // Realtime load from Firestore using `onCollectionSnapshot` with robust hybrid in-memory merging
  useEffect(() => {
    setLoading(true);

    const mergeDataWithPresets = (firestoreData: CatalogItem[]) => {
      const itemMap = new Map<string, CatalogItem>();
      
      // 1. Establish robust fallback defaults by loading all PRESET_CATALOGS in memory
      for (const preset of PRESET_CATALOGS) {
        itemMap.set(preset.id, preset);
      }
      
      // 2. Overwrite / merge with live Firestore database entries (including user modifications or custom products)
      for (const fsItem of firestoreData) {
        itemMap.set(fsItem.id, fsItem);
      }
      
      return Array.from(itemMap.values());
    };

    const unsubscribe = dbService.onCollectionSnapshot<CatalogItem>(
      'catalog',
      (data) => {
        if (data.length === 0) {
          // If Firestore collection is empty, merge & display the preset records gracefully
          console.log('Firestore is empty or non-populated for catalog. Displaying default master presets.');
          setItems(PRESET_CATALOGS);
        } else {
          // Merge dynamic Firestore data with our core master preset catalogs in memory
          const mergedList = mergeDataWithPresets(data);
          setItems(mergedList);
        }
        setLoading(false);
      },
      [],
      (error) => {
        console.warn('Silent Firestore load failure (Quota/Auth). Falling back to comprehensive in-memory catalogs.', error);
        setItems(PRESET_CATALOGS);
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
                  <button
                    onClick={handleOpenCreateForm}
                    className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <Plus size={16} /> Tambah Item
                  </button>
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
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Anggaran Gabungan</span>
                              <span className="text-base font-black text-indigo-600 tracking-tight mt-1">
                                {totalCost > 0 
                                  ? `Rp ${totalCost.toLocaleString('id-ID')}` 
                                  : 'Harga Custom / Jasa'}
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
                    <div className="flex gap-4 text-xs">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Harga Pokok Barang (Rp)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceItem}
                    onChange={(e) => setPriceItem(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Harga Jasa Pekerjaan / Paket (Rp) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceService === '0' || !priceService ? '' : priceService}
                    onChange={(e) => setPriceService(e.target.value)}
                    className="w-full px-4 py-3 bg-indigo-50/20 border border-indigo-100 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Estimasi Biaya Material Pendukung (Rp) - Opsional</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceItem === '0' || !priceItem ? '' : priceItem}
                    onChange={(e) => setPriceItem(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Satuan Jasa / Layanan <span className="text-rose-500">*</span></label>
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
