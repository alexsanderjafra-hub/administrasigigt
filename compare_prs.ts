import { seedFinancialRecords } from './src/services/seedData';

interface PdfRecord {
  customId: string;
  date: string;
  project: string;
  pic: string;
  category: string;
  detail: string;
  source: string;
  amount: number;
  bankRef: string;
  htgRef: string;
}

export const pdfRecords: PdfRecord[] = [
  // Page 1
  { customId: "PRS-020626-001", date: "2026-06-02", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "BELANJA", detail: "PEMBELIAN PLASTIK POLYBAG", source: "REKENING PRIBADI", amount: 122000, bankRef: "", htgRef: "" },
  { customId: "PRS-030526-001", date: "2026-06-03", project: "", pic: "JIDAN RAMADHAN", category: "KASBON", detail: "KASBON TIM PANJUL 200, IKA 200, WELI 100 PROJECT WESTMARK", source: "REKENING PT", amount: 500000, bankRef: "", htgRef: "" },
  { customId: "PRS-030626-001", date: "2026-06-03", project: "", pic: "JIDAN RAMADHAN", category: "OPERASIONAL", detail: "MAKAN SIANG MCD", source: "REKENING PT", amount: 77000, bankRef: "BNK-030626-001", htgRef: "" },
  { customId: "PRS-030626-002", date: "2026-06-03", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "KASBON", detail: "KASBON TIM PROJECT WESTMARK, PANJUL 200, IKA 200, WELI 100", source: "REKENING PT", amount: 500000, bankRef: "BNK-030626-002", htgRef: "" },
  { customId: "PRS-040626-001", date: "2026-06-04", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "PEMBELIAN TERPAL PROJECT WESTMARK 4X4 M", source: "REKENING PT", amount: 240000, bankRef: "BNK-040626-001", htgRef: "" },
  { customId: "PRS-040626-002", date: "2026-06-04", project: "WESTMARK", pic: "WELI MAHESA", category: "KASBON", detail: "KASBON WELI", source: "REKENING PT", amount: 100000, bankRef: "BNK-030626-001", htgRef: "" },
  { customId: "PRS-050626-001", date: "2026-06-05", project: "-", pic: "FAISAL", category: "OPERASIONAL KANTOR", detail: "PEMBELIAN TISU SATU DUS", source: "REKENING PT", amount: 137000, bankRef: "BNK-010626-001", htgRef: "" },
  { customId: "PRS-050626-002", date: "2026-06-05", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "BELANJA", detail: "PEMBELIAN RODA TROLEY", source: "REKENING PT", amount: 92000, bankRef: "BNK-030626-001", htgRef: "" },
  { customId: "PRS-050626-003", date: "2026-06-05", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "OPERASIONAL PROJEK", detail: "KONSUMSI MINUM LAPANG, PRINT DOKUMEN", source: "REKENING PT", amount: 192000, bankRef: "BNK-050626-003", htgRef: "" },
  { customId: "PRS-060626-001", date: "2026-06-06", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL", detail: "BELI BENSIN FAISAL", source: "REKENING PT", amount: 15000, bankRef: "BNK-040626-001", htgRef: "" },
  { customId: "PRS-060626-002", date: "2026-06-06", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "GAJI", detail: "GAJI PANJUL", source: "REKENING PT", amount: 900000, bankRef: "BNK-060626-001", htgRef: "" },
  { customId: "PRS-060626-003", date: "2026-06-06", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "GAJI", detail: "GAJI IKA", source: "REKENING PT", amount: 900000, bankRef: "BNK-060626-001", htgRef: "" },
  { customId: "PRS-060626-004", date: "2026-06-06", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "GAJI", detail: "GAJI WELI", source: "REKENING PT", amount: 1000000, bankRef: "BNK-060626-001", htgRef: "" },
  { customId: "PRS-070626-001", date: "2026-06-07", project: "-", pic: "BANG YASIN", category: "FEE", detail: "PEMBAYARAM DP DESAIN", source: "REKENING PRIBADI", amount: 1000000, bankRef: "", htgRef: "" },
  { customId: "PRS-070626-002", date: "2026-06-07", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "BELANJA", detail: "PEMBELIAN KARUNG 50 PCS", source: "REKENING PRIBADI", amount: 100000, bankRef: "", htgRef: "" },
  { customId: "PRS-090626-001", date: "2026-06-09", project: "-", pic: "BANG YASIN", category: "LOGISTIK", detail: "ONGKIR FILTER SOFTENER", source: "REKENING PRIBADI", amount: 400000, bankRef: "", htgRef: "" },
  { customId: "PRS-090626-002", date: "2026-06-09", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "BELANJA", detail: "PEMBELIAN EQUIPMENT PROJECT WESTMARK", source: "REKENING PT", amount: 1000000, bankRef: "BNK-090626-001", htgRef: "" },
  { customId: "PRS-090626-003", date: "2026-06-09", project: "WESTMARK", pic: "WELI MAHESA", category: "KASBON", detail: "KASBON WELI MAHESA", source: "REKENING PT", amount: 152500, bankRef: "BNK-090626-001", htgRef: "" },

  // Page 2
  { customId: "PRS-090626-004", date: "2026-06-09", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "KASBON", detail: "KASBON PANJUL 100 DAN IKA 100", source: "REKENING PT", amount: 200000, bankRef: "BNK-090626-001", htgRef: "" },
  { customId: "PRS-090626-005", date: "2026-06-09", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "OPERASIONAL", detail: "PEMBELIAN TOKEN LISTRIK 50 RIBU", source: "REKENING PT", amount: 31000, bankRef: "BNK-030626-001", htgRef: "" },
  { customId: "PRS-090626-007", date: "2026-06-09", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "OPERASIONAL", detail: "PEMBELIAN TOKEN LISTRIK KONTRAKAN TAMAN ANGGREK 50K", source: "REKENING PT", amount: 20500, bankRef: "BNK-050626-003", htgRef: "" },
  { customId: "PRS-100626-001", date: "2026-06-10", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL KANTOR", detail: "PEMBELIAN GALON LE MINARLE", source: "REKENING PT", amount: 22000, bankRef: "BNK-010626-001", htgRef: "" },
  { customId: "PRS-100626-002", date: "2026-06-10", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "BELANJA", detail: "PEMBELIAN MATA BOR DAN KARUNG", source: "REKENING PT", amount: 200000, bankRef: "BNK-090626-001", htgRef: "" },
  { customId: "PRS-120626-001", date: "2026-06-12", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "KASBON", detail: "KASBON IKA", source: "REKENING PT", amount: 1000000, bankRef: "BNK-120626-001", htgRef: "" },
  { customId: "PRS-120626-002", date: "2026-06-12", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "KASBON", detail: "KASBON PANJUL", source: "REKENING PT", amount: 500000, bankRef: "BNK-120626-001", htgRef: "" },
  { customId: "PRS-120626-003", date: "2026-06-12", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "KASBON", detail: "KASBON WELI", source: "REKENING PT", amount: 500000, bankRef: "BNK-120626-001", htgRef: "" },
  { customId: "PRS-120626-004", date: "2026-06-12", project: "-", pic: "JIDAN RAMADHAN", category: "KASBON", detail: "KASBON JIDAN", source: "REKENING PT", amount: 100000, bankRef: "BNK-090626-001", htgRef: "" },
  { customId: "PRS-120626-005", date: "2026-06-12", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "OPERASIONAL", detail: "OPERASIONAL JIDAN KE WESTMARK", source: "REKENING PT", amount: 100000, bankRef: "BNK-090626-001", htgRef: "" },
  { customId: "PRS-130626-001", date: "2026-06-13", project: "-", pic: "JIDAN RAMADHAN", category: "OPERASIONAL", detail: "MAKAN MALAM SAMBAL RAMPAI - KUNJUNGAN PROJECT WESTMARK", source: "REKENING PT", amount: 122000, bankRef: "BNK-140626-001", htgRef: "" },
  { customId: "PRS-130626-001", date: "2026-06-14", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "KASBON", detail: "KASBON WELI", source: "REKENING PT", amount: 200000, bankRef: "BNK-090626-001", htgRef: "" }, // note: duplicate ID with diff date
  { customId: "PRS-140626-002", date: "2026-06-14", project: "-", pic: "JIDAN RAMADHAN", category: "KASBON", detail: "KASBON KANG RAHMAT", source: "REKENING PT", amount: 5000000, bankRef: "BNK-140626-001", htgRef: "" },
  { customId: "PRS-140626-003", date: "2026-06-14", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "OPERASIONAL TIM", detail: "PEMBAYARAN KONTRAKAN", source: "REKENING PT", amount: 1400000, bankRef: "BNK-140626-001", htgRef: "" },
  { customId: "PRS-170626-001", date: "2026-06-17", project: "-", pic: "OPERASIONAL KANTOR", category: "BELANJA", detail: "PEMBELIAN KERTAS A4 1 RIM", source: "REKENING PT", amount: 45000, bankRef: "BNK-040626-001", htgRef: "" },
  { customId: "PRS-180626-001", date: "2026-06-18", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "KASBON", detail: "KASBON PANJUL 100", source: "REKENING PT", amount: 100000, bankRef: "BNK-040626-001", htgRef: "" },
  { customId: "PRS-200626-001", date: "2026-06-19", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL MEETING", detail: "BELI MINUMAN UNTUK MEETING BOGOR COVER ATM BRI", source: "REKENING PT", amount: 25000, bankRef: "BNK-090626-001", htgRef: "" }, // note: date is 19
  { customId: "PRS-190626-002", date: "2026-06-19", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL", detail: "MAKAN MALAM MEETING BOGOR PROYEK COVER ATM BRI", source: "REKENING PRIBADI", amount: 325000, bankRef: "", htgRef: "HTG-008" },
  { customId: "PRS-190626-003", date: "2026-06-19", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL", detail: "OPERASIONAL JIDAN FAISAL MAKAN DAN BENSIN MEETING COVER ATM BRI", source: "REKENING PT", amount: 100000, bankRef: "BNK-200626-001", htgRef: "" },

  // Page 3
  { customId: "PRS-200626-001", date: "2026-06-20", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "GAJI", detail: "GAJI FAUZYAWAN/ PANJUL", source: "REKENING PT", amount: 1995000, bankRef: "BNK-200626-001", htgRef: "" },
  { customId: "PRS-200626-002", date: "2026-06-20", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "GAJI", detail: "KEKURANGAN GAJI FAUZYAWAN / PANJUL, (UANG FAISAL)", source: "REKENING PRIBADI", amount: 500000, bankRef: "", htgRef: "HTG-009" },
  { customId: "PRS-200626-003", date: "2026-06-20", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "GAJI", detail: "GAJI WELI MAHESA", source: "REKENING PT", amount: 1995000, bankRef: "BNK-200626-001", htgRef: "" },
  { customId: "PRS-200626-004", date: "2026-06-20", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL KANTOR", detail: "PEMBAYARAN TAGIHAN WIFI", source: "REKENING PT", amount: 409000, bankRef: "BNK-200626-001", htgRef: "" },
  { customId: "PRS-200926-001", date: "2026-06-20", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "GAJI", detail: "GAJI IKA SUSANTO", source: "REKENING PT", amount: 1995000, bankRef: "BNK-200626-001", htgRef: "" },
  { customId: "PRS-200626-007", date: "2026-06-20", project: "-", pic: "FAISAL", category: "REIMBURSE", detail: "MAKAN MALAM MEETING BOGOR", source: "REKENING PT", amount: 325000, bankRef: "BNK-200626-001", htgRef: "HTG-008" },
  { customId: "PRS-220626-001", date: "2026-06-22", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "BELANJA", detail: "PEMBELIAN BESI SIKU, THINER, CAT, ZINCROME - TOKO BESI TANGERANG", source: "REKENING PT", amount: 2075000, bankRef: "BNK-220626-001", htgRef: "" },
  { customId: "PRS-220626-002", date: "2026-06-22", project: "WESTMARK", pic: "JIDAN RAMDHAN", category: "BELANJA", detail: "GATE VALVE KITZ 1 1/2\" - 2PCS, 1\"- 3 PCS, 1/2\" - 3 PCS, ELBOW DRAT 1/2\" - PCS, FLANG PVC 5 PCS, UBOLT 10 PCS, DYNABOLT 100 PCS, REDUCER PVC 1 PCS - TECHVALVE INDO", source: "REKENING PT", amount: 2636000, bankRef: "BNK-220626-001", htgRef: "" },
  { customId: "PRS-220626-003", date: "2026-06-22", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "BELANJA", detail: "GATE VALVE KITZ 1 1/2\" - 2PCS, 1\"- 3 PCS, 1/2\" - 3 PCS, ELBOW DRAT 1/2\" - PCS, FLANG PVC 5 PCS, UBOLT 10 PCS, DYNABOLT 100 PCS, REDUCER PVC 1 PCS - TECHVALVE INDO", source: "REKENING PT", amount: 74000, bankRef: "BNK-220626-003", htgRef: "" },
  { customId: "PRS-230626-001", date: "2026-06-23", project: "-", pic: "JIDAN RAMADHAN", category: "JASA PENGIRIMAN", detail: "BIAYA ONGKIR LALAMOVE KIRIM INVOICE KE PT TEI", source: "REKENING PT", amount: 55000, bankRef: "BNK-220626-003", htgRef: "" },
  { customId: "PRS-240626-001", date: "2026-06-24", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "BELANJA KEBUTUHAN ELEKTRIKAL PROYEK WESTMARK", source: "REKENING PT", amount: 8009100, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-240626-002", date: "2026-06-24", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "BELANJA KEBUTUHAN ELEKTRIKAL WESTMARK", source: "REKENING PT", amount: 639840, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-240626-004", date: "2026-06-24", project: "-", pic: "FAISAL MUSTOPA", category: "REIMBURSE", detail: "CLAIM FAISAL MUSTOPA UNTUK KEKURANGAN GAJI PANJUL 500K", source: "REKENING PT", amount: 500000, bankRef: "BNK-240626-004", htgRef: "HTG-009" },
  { customId: "PRS-240626-004", date: "2026-06-24", project: "-", pic: "JIDAN RAMADHAN", category: "PATTYCASH", detail: "KASBON/PATTYCASH JIDAN", source: "REKENING PT", amount: 500000, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-250626-001", date: "2026-06-25", project: "SAKATA", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "PEMBELIAN FLOATING UNTUK PROYEK SAKATA", source: "REKENING PT", amount: 661400, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-250626-002", date: "2026-06-25", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "BELANJA", detail: "PEMBELIAN DURADUS DAN KABEL TIES", source: "REKENING PT", amount: 210000, bankRef: "BNK-250626-003", htgRef: "" },
  { customId: "PRS-250626-003", date: "2026-06-25", project: "-", pic: "JIDAN RAMADHAN", category: "OPERASIONAL", detail: "BELI BENSIN UNTUK BELANJA DAN NGANTER BARANG KE KEMIRI", source: "REKENING PT", amount: 50000, bankRef: "BNK-250626-003", htgRef: "" },
  { customId: "PRS-260626-001", date: "2026-06-26", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "KASBON", detail: "KASBON PANJUL 500", source: "REKENING PT", amount: 500000, bankRef: "BNK-260626-002", htgRef: "" },
  { customId: "PRS-260626-002", date: "2026-06-26", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "KASBON", detail: "KASBON IKA 500K", source: "REKENING PT", amount: 500000, bankRef: "BNK-260626-002", htgRef: "" },

  // Page 4
  { customId: "PRS-260626-003", date: "2026-06-26", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "KASBON", detail: "KASBON WELI 500K", source: "REKENING PT", amount: 500000, bankRef: "BNK-260626-002", htgRef: "" },
  { customId: "PRS-260626-004", date: "2026-06-26", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "PEMBELIAN EQUIPMENT KEBUTUHAN WESTMARK TOKO BANGUNAN SINAR MAS + ADMIN", source: "REKENING PT", amount: 134500, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-290626-001", date: "2026-06-29", project: "-", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "BELANJA ATK UNTUK KANTOR", source: "REKENING PT", amount: 50000, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-290626-002", date: "2026-06-29", project: "ESA UNGGU TB SIMATUPANG", pic: "FAISAL MUSTOPA", category: "OPERASIONAL", detail: "OPERASIONAL WELI VISIT KE PROYEK ES UNGGUL", source: "REKENING PT", amount: 152500, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-290626-003", date: "2026-06-29", project: "WESTMARK", pic: "YASIN", category: "FEE PROYEK", detail: "FEE PROYEK KE DUA IBNU - WESTMARK", source: "REKENING PRIBADI", amount: 5000000, bankRef: "", htgRef: "HTG-014" },
  { customId: "PRS-300626-001", date: "2026-06-30", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "PEMBELIAN EQUIPMENT PROYEK WESTMARK DI TB SINAR TOMANG JAKARTA", source: "REKENING PT", amount: 532000, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-300626-002", date: "2026-06-30", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "PEMBELIAN BOLT UNTUK PROYEK WESTMARK - SHOPEE JIDAN", source: "REKENING PT", amount: 357700, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-300626-003", date: "2026-06-30", project: "-", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "PEMBELIAN AQUA BOTOL 1 DUS UNTUK KANTOR", source: "REKENING PT", amount: 46500, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-300626-004", date: "2026-06-30", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "PEMBELIAN RESIN DAN AQUA PROOF PROYEK WESTMARK", source: "REKENING PT", amount: 350000, bankRef: "BNK-240626-004", htgRef: "" },
  { customId: "PRS-010726-001", date: "2026-07-01", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "PEMBELIAN RUPING DAN TAMBANG PROJEK WESTMARK", source: "REKENING PT", amount: 220000, bankRef: "BNK-010726-003", htgRef: "" },
  { customId: "PRS-010726-002", date: "2026-07-01", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL", detail: "UANG ROKOK PAK JOKO MEETING BOGOR COVER ATM BRI", source: "REKENING PT", amount: 34000, bankRef: "BNK-010726-003", htgRef: "" },
  { customId: "PRS-010726-003", date: "2026-07-01", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL", detail: "MEETING CAFE PROJEK BOGOR COVER ATM BRI", source: "REKENING PT", amount: 99000, bankRef: "BNK-010726-003", htgRef: "" },
  { customId: "PRS-010726-004", date: "2026-07-01", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA", detail: "PEMBELIAN COLOKAN LISTRIK DAN STOP KONTAK UNTUK PROJEK WESTMARK", source: "REKENING PT", amount: 179000, bankRef: "BNK-010726-003", htgRef: "" },
  { customId: "PRS-020726-001", date: "2026-07-02", project: "-", pic: "FAISAL MUSTOPA", category: "REIMBURSE", detail: "CLAIM JIDAN OPERASIONAL TANGGAL 1 DAN 2 JULI", source: "REKENING PT", amount: 231000, bankRef: "BNK-010726-003", htgRef: "" },
  { customId: "PRS-030726-001", date: "2026-07-03", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "OPERASIONAL", detail: "ONGKOS BELANJA KEBUTUHAN WESTMARK", source: "REKENING PT", amount: 100000, bankRef: "BNK-010726-003", htgRef: "" },
  { customId: "PRS-030726-002", date: "2026-07-03", project: "-", pic: "FAISAL MUSTOPA", category: "BELANJA KANTOR", detail: "PEMBELIAN PULPEN 1 PACK", source: "REKENING PT", amount: 70299, bankRef: "BNK-010726-003", htgRef: "" },
  { customId: "PRS-030726-003", date: "2026-07-03", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL", detail: "PEMBELIAN MARTABAK UNTUK JAMUAN INVESTOR DI KANTOR", source: "REKENING PT", amount: 60000, bankRef: "BNK-010726-003", htgRef: "" },
  { customId: "PRS-040726-001", date: "2026-07-04", project: "-", pic: "MUHAMMAD YASIN", category: "GAJI", detail: "GAJI FAISAL 5 JUTA DAN GAJI JIDAN 5", source: "REKENING PRIBADI", amount: 8500000, bankRef: "", htgRef: "HTG-011" },
  { customId: "PRS-040726-002", date: "2026-07-04", project: "WESTMARK", pic: "MUHAMMAD YASIN", category: "GAJI", detail: "GAJI PANJUL 1.865, GAJI IKA 2.665, GAJI WELI 1.915", source: "REKENING PRIBADI", amount: 6000000, bankRef: "", htgRef: "HTG-012" },

  // Page 5
  { customId: "PRS-040726-003", date: "2026-07-04", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "GAJI", detail: "KEKURANGAN GAJI TIM WESTMARK", source: "REKENING PT", amount: 445000, bankRef: "BNK-040726-001", htgRef: "" },
  { customId: "PRS-040726-004", date: "2026-07-04", project: "WESTMARK", pic: "JIDAN RAMADHAN", category: "BELANJA", detail: "PEMBELIAN FITTING PVC WESTMARK", source: "REKENING PRIBADI", amount: 446500, bankRef: "", htgRef: "HTG-013" },
  { customId: "PRS-040726-005", date: "2026-07-04", project: "WESTMARK", pic: "BANG YASIN", category: "BELANJA", detail: "PEMBAYARAN PELUNASAN 50% PANEL CONTROL WESTMARK", source: "REKENING PRIBADI", amount: 12500000, bankRef: "", htgRef: "HTG-017" },
  { customId: "PRS-080726-001", date: "2026-07-06", project: "-", pic: "FAISAL", category: "BELANJA KANTOR", detail: "PEMBELIAN MOUSE JIDA", source: "REKENING PT", amount: 66000, bankRef: "BNK-240626-004", htgRef: "" }, // note: date is 06, customId starts with 080726
  { customId: "PRS-060726-002", date: "2026-07-06", project: "-", pic: "FAISAL MUSTOPA", category: "BELANJA KANTOR", detail: "SISA PEMBAYARAN PEMBELIAN MOUSE JIDAN PAKAI", source: "REKENING PT", amount: 55000, bankRef: "BNK-040726-001", htgRef: "" },
  { customId: "PRS-070726-001", date: "2026-07-07", project: "PKM KEBON JERUK", pic: "FAISAL MUSTOPA", category: "OPERASIONAL PROYEK", detail: "DP KONTRAKAN", source: "REKENING PRIBADI", amount: 1000000, bankRef: "", htgRef: "HTG-017" },
  { customId: "PRS-080726-001", date: "2026-07-08", project: "WESTMARK", pic: "JIDAN", category: "BELANJA PROYEK", detail: "PEMBELIAN LEM, WD, DAN KNEE UNTUK WESTMARK", source: "REKENING PRIBADI", amount: 133000, bankRef: "", htgRef: "HTG-018" },
  { customId: "PRS-080726-002", date: "2026-07-08", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA PROYEK", detail: "PEMBELIAN U BOLT DAN DYNABOLT UNTUK WESTMARK + ONGKIR 15K", source: "REKENING PRIBADI", amount: 265000, bankRef: "", htgRef: "HTG-019" },
  { customId: "PRS-090726-001", date: "2026-07-09", project: "PKM KEBON JERUK", pic: "FAISAL MUSTOPA", category: "OPERASIONAL PROYEK", detail: "DP KONTRAKAN KEBON JERUK", source: "REKENING PT", amount: 1000000, bankRef: "BNK-080726-002", htgRef: "HTG-017" },
  { customId: "PRS-090726-002", date: "2026-07-09", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA PROYEK", detail: "CLAIM PEMBELIAN LEM, WD DAN KNEE WESTMARK", source: "REKENING PT", amount: 133000, bankRef: "BNK-080726-002", htgRef: "HTG-018" },
  { customId: "PRS-090726-003", date: "2026-07-09", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA PROYEK", detail: "CLAIM PEMBELIAN UBOLT DYNABOLT UNTUK WESTMARK + ONGKIR 15K", source: "REKENING PT", amount: 265000, bankRef: "BNK-080726-002", htgRef: "HTG-019" },
  { customId: "PRS-090726-004", date: "2026-07-09", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "BELANJA PROYEK", detail: "CLAIM JIDAN BELANJA FITTING PVC WESTMARK TANGGAL 04/07/2026", source: "REKENING PT", amount: 446500, bankRef: "BNK-080726-002", htgRef: "HTG-013" },
  { customId: "PRS-090726-005", date: "2026-07-09", project: "-", pic: "FAISAL", category: "REIMBURSE", detail: "CLAIM JIDAN", source: "REKENING PT", amount: 225000, bankRef: "BNK-080726-002", htgRef: "" },
  { customId: "PRS-090726-006", date: "2026-07-09", project: "PKM KEBON JERUK", pic: "FAISAL MUSTOPA", category: "BELANJA PROYEK", detail: "PEMBAYARAN BAKTERI 10 BOTOL", source: "REKENING PT", amount: 900000, bankRef: "BNK-080726-002", htgRef: "" },
  { customId: "PRS-090726-007", date: "2026-07-09", project: "-", pic: "FAISAL MUSTOPA", category: "OPERASIONAL", detail: "ISI BENSIN FAISAL AMBIL DOKUMEN DI STASIUN PORIS", source: "REKENING PT", amount: 20000, bankRef: "BNK-080726-002", htgRef: "" },
  { customId: "PRS-100726-001", date: "2026-07-10", project: "WESTMARK", pic: "FAISAL MUSTOPA", category: "KASBON", detail: "KASBON TIM WELI 300, IKA 300, PANJUL 300", source: "REKENING PT", amount: 902500, bankRef: "BNK-080726-002", htgRef: "" },
  { customId: "PRS-100726-002", date: "2026-07-10", project: "-", pic: "FAISAL MUSTOPA", category: "REIMBURSE", detail: "CLAIM JIDAN SERVIS MOTOR DAN PULSA LISTRIK KANTOR 100K", source: "REKENING PT", amount: 1717500, bankRef: "BNK-100726-001", htgRef: "" }
];

import * as fs from 'fs';

let outputStr = '';
const log = (msg: string) => {
  outputStr += msg + '\n';
};

log('Total PDF Records loaded: ' + pdfRecords.length);

const existingRecords = seedFinancialRecords.filter(r => r.customId && r.customId.startsWith('PRS-'));
log('Total Seed PRS Records loaded: ' + existingRecords.length);

// Compare them
let mismatchCount = 0;

pdfRecords.forEach((pdf, idx) => {
  const seed = existingRecords[idx];
  if (!seed) {
    log(`[MISMATCH] No seed record found at index ${idx} for PDF ID ${pdf.customId}`);
    mismatchCount++;
    return;
  }

  const discrepancies: string[] = [];

  if (seed.customId !== pdf.customId) discrepancies.push(`ID: seed=${seed.customId}, pdf=${pdf.customId}`);
  if (seed.date !== pdf.date) discrepancies.push(`Date: seed=${seed.date}, pdf=${pdf.date}`);
  if (seed.amount !== pdf.amount) discrepancies.push(`Amount: seed=${seed.amount}, pdf=${pdf.amount}`);
  if (seed.sumberDana !== pdf.source) discrepancies.push(`Source: seed=${seed.sumberDana}, pdf=${pdf.source}`);
  if (seed.refHutang !== pdf.htgRef && !(seed.refHutang === undefined && pdf.htgRef === "")) {
    discrepancies.push(`ID HTG: seed=${seed.refHutang}, pdf=${pdf.htgRef}`);
  }
  if (seed.refIdBank !== pdf.bankRef && !(seed.refIdBank === undefined && pdf.bankRef === "")) {
    discrepancies.push(`Ref ID Bank: seed=${seed.refIdBank}, pdf=${pdf.bankRef}`);
  }
  
  const normalizedSeedPic = (seed.personalHolder || '').toUpperCase();
  const normalizedPdfPic = (pdf.pic || '').toUpperCase();
  if (normalizedSeedPic !== normalizedPdfPic) {
    discrepancies.push(`PIC: seed=${seed.personalHolder}, pdf=${pdf.pic}`);
  }

  const normalizedSeedCat = (seed.category || '').toUpperCase();
  const normalizedPdfCat = (pdf.category || '').toUpperCase();
  if (normalizedSeedCat !== normalizedPdfCat) {
    discrepancies.push(`Category: seed=${seed.category}, pdf=${pdf.category}`);
  }

  if (discrepancies.length > 0) {
    log(`[MISMATCH] Row Index ${idx + 1} (${pdf.customId}):`);
    discrepancies.forEach(d => log(`  - ${d}`));
    log(`  Seed Detail: "${seed.description}"`);
    log(`  PDF Detail : "${pdf.detail}"`);
    mismatchCount++;
  }
});

log('Total discrepancies found: ' + mismatchCount);

fs.writeFileSync('./mismatch_results.txt', outputStr);
console.log('Successfully wrote mismatch results to mismatch_results.txt');

