import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, collection, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

const app = initializeApp(firebaseConfig);
const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
const auth = getAuth(app);

// Data structure definitions matching types.ts
interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
  financialRecordId?: string;
  recordedBy: string;
}

interface DebtRecord {
  id: string;
  customId?: string;
  projectId?: string;
  type: 'HUTANG' | 'PIUTANG';
  title: string;
  contactName: string;
  amount: number;
  dueDate: string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  description?: string;
  recordedBy: string;
  timestamp: number;
  payments?: DebtPayment[];
}

interface FinancialRecord {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  flowType?: 'IN' | 'OUT_BANK_DIRECT' | 'OUT_PERSONAL_TRANSFER' | 'OUT_PERSONAL_SPEND' | 'PERSONAL_TALANGAN_REIMBURSE';
  personalHolder?: string;
  amount: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  adminFee?: number;
  category: string;
  description: string;
  referenceId?: string;
  recordedBy: string;
  timestamp: number;
  customId?: string;
  sumberDana?: string;
  rekPenerima?: string;
  refIdBank?: string;
  refPiutang?: string;
  refHutang?: string;
}

const piutangList: DebtRecord[] = [
  {
    id: "PTG-001",
    customId: "PTG-001",
    projectId: "",
    type: "PIUTANG",
    title: "PT. TTI",
    contactName: "PT. TTI",
    amount: 23500000,
    dueDate: "2026-12-31",
    status: "PAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-03").getTime(),
    payments: [
      { id: "pay_ptg_001", amount: 23500000, date: "2026-06-03", note: "PELUNASAN", recordedBy: "Admin" }
    ]
  },
  {
    id: "PTG-002",
    customId: "PTG-002",
    projectId: "WESTMARK",
    type: "PIUTANG",
    title: "PT. TOOLMATE ENVIRO INDONESIA",
    contactName: "PT. TOOLMATE ENVIRO INDONESIA",
    amount: 566100000,
    dueDate: "2026-12-31",
    status: "PARTIAL",
    recordedBy: "Admin",
    timestamp: new Date("2026-04-15").getTime(),
    payments: [
      { id: "pay_ptg_002_1", amount: 113220000, date: "2026-04-15", note: "Termin 1 (DP 20%)", recordedBy: "Admin" },
      { id: "pay_ptg_002_2", amount: 84915000, date: "2026-05-13", note: "Termin 2 (PROGRESS 15%)", recordedBy: "Admin" },
      { id: "pay_ptg_002_3", amount: 113220000, date: "2026-06-23", note: "Termin 3 (PROGRESS 20%)", recordedBy: "Admin" }
    ]
  },
  ...["PTG-003", "PTG-004", "PTG-005", "PTG-006", "PTG-008", "PTG-009", "PTG-010", "PTG-011", "PTG-012", "PTG-013", "PTG-014", "PTG-015", "PTG-016", "PTG-017", "PTG-018", "PTG-019"].map(cid => ({
    id: cid,
    customId: cid,
    projectId: "",
    type: "PIUTANG" as const,
    title: "-",
    contactName: "-",
    amount: 0,
    dueDate: "2026-12-31",
    status: "PAID" as const,
    recordedBy: "Admin",
    timestamp: Date.now()
  }))
];

const hutangList: DebtRecord[] = [
  {
    id: "HTG-001",
    customId: "HTG-001",
    type: "HUTANG",
    title: "Untuk Gaji Karyawan Project Westmark",
    contactName: "BANG YASIN OWNER PT",
    amount: 1200000,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-01").getTime(),
    payments: []
  },
  {
    id: "HTG-002",
    customId: "HTG-002",
    type: "HUTANG",
    title: "Pembayaran DP Pompa",
    contactName: "BANG YASIN OWNER PT",
    amount: 65405500,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-03").getTime(),
    payments: []
  },
  {
    id: "HTG-003",
    customId: "HTG-003",
    type: "HUTANG",
    title: "Investasi",
    contactName: "PAK DODO INVESTOR",
    amount: 100000000,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-03").getTime(),
    payments: []
  },
  {
    id: "HTG-004",
    customId: "HTG-004",
    type: "HUTANG",
    title: "Hutang",
    contactName: "YOGA",
    amount: 65000000,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-03").getTime(),
    payments: []
  },
  {
    id: "HTG-005",
    customId: "HTG-005",
    type: "HUTANG",
    title: "Pembayaran DP Desain",
    contactName: "BANG YASIN OWNER PT",
    amount: 1000000,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-03").getTime(),
    payments: []
  },
  {
    id: "HTG-006",
    customId: "HTG-006",
    type: "HUTANG",
    title: "Pembelian Plastik polybag",
    contactName: "JIDAN RAMADHAN",
    amount: 122000,
    dueDate: "2026-06-02",
    status: "PAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-02").getTime(),
    payments: [{ id: "pay_htg_006", amount: 122000, date: "2026-06-02", note: "Lunas", recordedBy: "Admin" }]
  },
  {
    id: "HTG-007",
    customId: "HTG-007",
    type: "HUTANG",
    title: "pembelian karung",
    contactName: "JIDAN RAMADHAN",
    amount: 100000,
    dueDate: "2026-06-07",
    status: "PAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-07").getTime(),
    payments: [{ id: "pay_htg_007", amount: 100000, date: "2026-06-07", note: "Lunas", recordedBy: "Admin" }]
  },
  {
    id: "HTG-008",
    customId: "HTG-008",
    type: "HUTANG",
    title: "MAKAN MALAM MEETING BOGOR PROYEK COVER ATM BRI",
    contactName: "FAISAL MUSTOPA",
    amount: 325000,
    dueDate: "2026-06-19",
    status: "PAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-19").getTime(),
    payments: [{ id: "pay_htg_008", amount: 325000, date: "2026-06-19", note: "Lunas", recordedBy: "Admin" }]
  },
  {
    id: "HTG-009",
    customId: "HTG-009",
    type: "HUTANG",
    title: "KEKURANGAN GAJI FAUZYAWAN / PANJUL, (UANG FAISAL)",
    contactName: "FAISAL MUSTOPA",
    amount: 500000,
    dueDate: "2026-06-20",
    status: "PAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-20").getTime(),
    payments: [{ id: "pay_htg_009", amount: 500000, date: "2026-06-20", note: "Lunas", recordedBy: "Admin" }]
  },
  {
    id: "HTG-010",
    customId: "HTG-010",
    type: "HUTANG",
    title: "PEMBAYARAN DP POMPA",
    contactName: "WINGGI APRIYANTO",
    amount: 50000000,
    dueDate: "2026-06-08",
    status: "PAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-08").getTime(),
    payments: [{ id: "pay_htg_010", amount: 55000000, date: "2026-06-08", note: "Terbayar Lebih", recordedBy: "Admin" }]
  },
  {
    id: "HTG-011",
    customId: "HTG-011",
    type: "HUTANG",
    title: "GAJI FAISAL 5 JUTA DAN GAJI JIDAN 5",
    contactName: "MUHAMMAD YASIN",
    amount: 8500000,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-07-04").getTime(),
    payments: []
  },
  {
    id: "HTG-012",
    customId: "HTG-012",
    type: "HUTANG",
    title: "GAJI PANJUL 1.865, GAJI IKA 2.665, GAJI WELI 1.915",
    contactName: "MUHAMMAD YASIN",
    amount: 6000000,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-07-04").getTime(),
    payments: []
  },
  {
    id: "HTG-013",
    customId: "HTG-013",
    type: "HUTANG",
    title: "PEMBELIAN FITTING PVC WESTMARK",
    contactName: "JIDAN RAMADHAN",
    amount: 446500,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-07-04").getTime(),
    payments: []
  },
  {
    id: "HTG-014",
    customId: "HTG-014",
    type: "HUTANG",
    title: "FEE PROYEK KE DUA IBNU - WESTMARK",
    contactName: "YASIN",
    amount: 5000000,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-29").getTime(),
    payments: []
  },
  {
    id: "HTG-015",
    customId: "HTG-015",
    type: "HUTANG",
    title: "PELUNASAN DP POMPA UANG PRIBADI",
    contactName: "YASIN",
    amount: 25000000,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-25").getTime(),
    payments: []
  },
  {
    id: "HTG-016",
    customId: "HTG-016",
    type: "HUTANG",
    title: "PEMBAYARAN PELUNASAN 50% PANEL CONTROL WESTMARK",
    contactName: "BANG YASIN",
    amount: 12500000,
    dueDate: "2026-07-31",
    status: "UNPAID",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-26").getTime(),
    payments: []
  }
];

const incList: FinancialRecord[] = [
  {
    id: "INC-010626-001",
    customId: "INC-010626-001",
    date: "2026-06-01",
    type: "IN",
    flowType: "IN",
    amount: 5631302,
    paymentMethod: "TRANSFER",
    category: "SALDO TERKAHIR PT",
    description: "SISA SALDO BULAN MEI",
    sumberDana: "REKENING PT",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-01").getTime()
  },
  {
    id: "INC-010626-002",
    customId: "INC-010626-002",
    date: "2026-06-01",
    type: "IN",
    flowType: "IN",
    amount: 160000,
    paymentMethod: "TRANSFER",
    category: "SALDO TERKAHIR PT",
    description: "SISA PATTYCASH DI FAISAL",
    sumberDana: "REKENING PT",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-01").getTime()
  },
  {
    id: "INC-030526-001",
    customId: "INC-030526-001",
    date: "2026-06-03",
    type: "IN",
    flowType: "IN",
    amount: 11750000,
    paymentMethod: "TRANSFER",
    category: "TERMIN KLIEN",
    description: "PEMBAYARAN FILTER SOFTENER DP 50%",
    sumberDana: "PT.TTI",
    refPiutang: "PTG-001",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-03").getTime()
  },
  {
    id: "INC-060626-001",
    customId: "INC-060626-001",
    date: "2026-06-06",
    type: "IN",
    flowType: "IN",
    amount: 1000000,
    paymentMethod: "TRANSFER",
    category: "HUTANG",
    description: "UANG MASUK TALANGAN DARI OWNER UNTUK GAJI KARYAWAN",
    sumberDana: "OWNER PT",
    refHutang: "HTG-001",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-06").getTime()
  },
  {
    id: "INC-080626-001",
    customId: "INC-080626-001",
    date: "2026-06-08",
    type: "IN",
    flowType: "IN",
    amount: 50000000,
    paymentMethod: "TRANSFER",
    category: "TERMIN 1",
    description: "TANDA EQUIPMENT STP",
    sumberDana: "-",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-08").getTime()
  },
  {
    id: "INC-100626-001",
    customId: "INC-100626-001",
    date: "2026-06-10",
    type: "IN",
    flowType: "IN",
    amount: 10000000,
    paymentMethod: "TRANSFER",
    category: "PEMBAYARAN KASBON",
    description: "UANG KASBON YANG DI BAYAR OWNER",
    sumberDana: "OWNER",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-10").getTime()
  },
  {
    id: "INC-100626-002",
    customId: "INC-100626-002",
    date: "2026-06-10",
    type: "IN",
    flowType: "IN",
    amount: 11750000,
    paymentMethod: "TRANSFER",
    category: "TERMIN KLIEN",
    description: "PELUNASAN FILTER SOFTENER 50%",
    sumberDana: "KLIEN",
    refPiutang: "PTG-001",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-10").getTime()
  },
  {
    id: "INC-120626-001",
    customId: "INC-120626-001",
    date: "2026-06-12",
    type: "IN",
    flowType: "IN",
    amount: 50000000,
    paymentMethod: "TRANSFER",
    category: "TERMIN",
    description: "TERMIN 100% - PARSIAL 1",
    sumberDana: "KLIEN",
    referenceId: "UEU TB SIMATUPANG",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-12").getTime()
  },
  {
    id: "INC-200626-001",
    customId: "INC-200626-001",
    date: "2026-06-20",
    type: "IN",
    flowType: "IN",
    amount: 20000000,
    paymentMethod: "TRANSFER",
    category: "UANG MASUK",
    description: "PEMBAYARAN UANG KASBON",
    sumberDana: "MUHAMMAD YASIN",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-20").getTime()
  },
  {
    id: "INC-230626-001",
    customId: "INC-230626-001",
    date: "2026-06-23",
    type: "IN",
    flowType: "IN",
    amount: 113220000,
    paymentMethod: "TRANSFER",
    category: "TERMIN",
    description: "TERMIN PROGRES 20%",
    sumberDana: "PT. TEI",
    referenceId: "WESTMARK",
    refPiutang: "PTG-002",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-23").getTime()
  },
  {
    id: "INC-260626-001",
    customId: "INC-260626-001",
    date: "2026-06-26",
    type: "IN",
    flowType: "IN",
    amount: 11753500,
    paymentMethod: "TRANSFER",
    category: "PEMBAYARAN",
    description: "PEMBAYARAN PEMELIHARAAN IPAL PKM SINDANG JAYA",
    sumberDana: "PUSKESMAS SINDANG JAYA",
    referenceId: "PKM SINDANGN JAYA",
    recordedBy: "Admin",
    timestamp: new Date("2026-06-26").getTime()
  }
];
