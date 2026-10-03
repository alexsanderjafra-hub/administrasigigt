const fs = require("fs");

const officialDebts = JSON.parse(fs.readFileSync("official_debts.json", "utf8"));

const officialPiutang = [
  {
    id: "PTG-JERUK",
    customId: "PTG-JERUK",
    type: "PIUTANG",
    contactName: "PKM Kebon Jeruk",
    title: "PKM Kebon Jeruk (Rekam Piutang & Termin Proyek PKM Kebon Jeruk)",
    description: "Rekam Piutang & Termin Proyek PKM Kebon Jeruk",
    referenceId: "PKM KEBON JERUK",
    projectId: "PKM KEBON JERUK",
    dueDate: "2026-07-11",
    amount: 96919650,
    status: "UNPAID",
    payments: []
  },
  {
    id: "PTG-001",
    customId: "PTG-001",
    type: "PIUTANG",
    contactName: "PT. TTI",
    title: "PT. TTI (Piutang invoice filter softener PT TTI)",
    description: "Piutang invoice filter softener PT TTI",
    referenceId: "",
    projectId: "",
    dueDate: "2026-06-10",
    amount: 23500000,
    status: "PAID",
    payments: [
      { id: "PAY-PTG001a", amount: 11750000, date: "2026-06-03", note: "DP 50%", recordedBy: "admin" },
      { id: "PAY-PTG001b", amount: 11750000, date: "2026-06-10", note: "Pelunasan 50%", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-002",
    customId: "PTG-002",
    type: "PIUTANG",
    contactName: "PT. TOOLMATE ENVIRO INDONESIA",
    title: "PT. TOOLMATE ENVIRO INDONESIA (Kontrak Utama Westmark)",
    description: "Kontrak Utama Westmark",
    referenceId: "WESTMARK",
    projectId: "WESTMARK",
    dueDate: "2026-08-30",
    amount: 559250190,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTG002a", amount: 113220000, date: "2026-04-15", note: "DP 20%", recordedBy: "admin" },
      { id: "PAY-PTG002b", amount: 84915000, date: "2026-05-13", note: "Termin 2 - 15%", recordedBy: "admin" },
      { id: "PAY-PTG002c", amount: 113220000, date: "2026-06-23", note: "Termin 3 - 20%", recordedBy: "admin" },
      { id: "PAY-PTG002d", amount: 113220000, date: "2026-07-24", note: "Termin 4 - 20%", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-003",
    customId: "PTG-003",
    type: "PIUTANG",
    contactName: "PT. DW Technic",
    title: "PT. DW Technic - UEU TB Simatupang (Proyek STP Gedung UEU TB Simatupang)",
    description: "Proyek STP Gedung UEU TB Simatupang",
    referenceId: "UEU TB SIMATUPANG",
    projectId: "UEU TB SIMATUPANG",
    dueDate: "2026-09-30",
    amount: 432900000,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTG003a", amount: 50000000, date: "2026-06-12", note: "Termin 1", recordedBy: "admin" },
      { id: "PAY-PTG003b", amount: 25000000, date: "2026-07-08", note: "Termin 2", recordedBy: "admin" },
      { id: "PAY-PTG003c", amount: 25000000, date: "2026-07-21", note: "Termin 3", recordedBy: "admin" },
      { id: "PAY-PTG003d", amount: 259740000, date: "2026-08-20", note: "Termin 4", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-004",
    customId: "PTG-004",
    type: "PIUTANG",
    contactName: "PT. DW Technic",
    title: "PT. DW Technic - IPAL Medis UEU Bekasi (Proyek IPAL Medis UEU Bekasi)",
    description: "Proyek IPAL Medis UEU Bekasi",
    referenceId: "UEU BEKASI",
    projectId: "UEU BEKASI",
    dueDate: "2026-08-31",
    amount: 67765500,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTG004", amount: 61050000, date: "2026-07-31", note: "Terbayar Sebagian", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-005",
    customId: "PTG-005",
    type: "PIUTANG",
    contactName: "Puskesmas Sindang Jaya",
    title: "Puskesmas Sindang Jaya - Pemeliharaan IPAL (Pembayaran pemeliharaan IPAL PKM Sindang Jaya)",
    description: "Pembayaran pemeliharaan IPAL PKM Sindang Jaya",
    referenceId: "PKM SINDANGN JAYA",
    projectId: "PKM SINDANGN JAYA",
    dueDate: "2026-06-30",
    amount: 11753500,
    status: "PAID",
    payments: [
      { id: "PAY-PTG005", amount: 11753500, date: "2026-06-26", note: "Lunas", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-J-1812",
    customId: "PTG-J-1812",
    type: "PIUTANG",
    contactName: "PROYEK UNION",
    title: "PROYEK UNION (Rekam Piutang & Termin Proyek PROYEK UNION )",
    description: "Rekam Piutang & Termin Proyek PROYEK UNION",
    referenceId: "PROYEK UNION",
    projectId: "PROYEK UNION",
    dueDate: "2026-06-01",
    amount: 768300000,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTGJ1812", amount: 10000000, date: "2026-08-01", note: "Cicilan Termin 1", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-J-2161",
    customId: "PTG-J-2161",
    type: "PIUTANG",
    contactName: "PROYE IPAL PUSKESMAS MAUK",
    title: "PROYE IPAL PUSKESMAS MAUK (Rekam Piutang & Termin Proyek PROYE IPAL PUSKESMAS MAUK)",
    description: "Rekam Piutang & Termin Proyek PROYE IPAL PUSKESMAS MAUK",
    referenceId: "PROYE_IPAL_PUSKESMAS_MAUK",
    projectId: "PROYE_IPAL_PUSKESMAS_MAUK",
    dueDate: "2026-08-06",
    amount: 14889500,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTGJ2161", amount: 14389500, date: "2026-08-26", note: "Pelunasan Perbaikan", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-J-3635",
    customId: "PTG-J-3635",
    type: "PIUTANG",
    contactName: "PROYEK STP HRI KARAWANG",
    title: "PROYEK STP HRI KARAWANG (Rekam Piutang & Termin Proyek PROYEK STP HRI KARAWANG)",
    description: "Rekam Piutang & Termin Proyek PROYEK STP HRI KARAWANG",
    referenceId: "PROYEK_STP_HRI_KARAWANG",
    projectId: "PROYEK_STP_HRI_KARAWANG",
    dueDate: "2026-07-23",
    amount: 394050000,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTGJ3635", amount: 157620000, date: "2026-08-20", note: "DP 40% STP + PPN", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-J-4851",
    customId: "PTG-J-4851",
    type: "PIUTANG",
    contactName: "PENGURUSAN PERTEK",
    title: "PENGURUSAN PERTEK (Rekam Piutang & Termin Proyek PENGURUSAN PERTEK)",
    description: "Rekam Piutang & Termin Proyek PENGURUSAN PERTEK",
    referenceId: "PENGURUSAN PERTEK",
    projectId: "PENGURUSAN PERTEK",
    dueDate: "2026-09-23",
    amount: 61050000,
    status: "UNPAID",
    payments: []
  },
  {
    id: "PTG-J-5018",
    customId: "PTG-J-5018",
    type: "PIUTANG",
    contactName: "PROYEK WTP PT. CAKRAWALA BUANA NUSANTARA",
    title: "PROYEK WTP PT. CAKRAWALA BUANA NUSANTARA (Rekam Piutang & Termin Proyek PROYEK WTP PT. CAKRAWALA BUANA NUSANTARA)",
    description: "Rekam Piutang & Termin Proyek PROYEK WTP PT. CAKRAWALA BUANA NUSANTARA",
    referenceId: "PROYEK_WTP_PT_CAKRAWALA_BUANA_",
    projectId: "PROYEK_WTP_PT_CAKRAWALA_BUANA_",
    dueDate: "2026-09-02",
    amount: 56565000,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTGJ5018", amount: 28282500, date: "2026-08-26", note: "DP 50%", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-J-5895",
    customId: "PTG-J-5895",
    type: "PIUTANG",
    contactName: "PROYEK IPAL RUMAH SAKIT PELNI",
    title: "PROYEK IPAL RUMAH SAKIT PELNI (Rekam Piutang & Termin Proyek PROYEK IPAL RUMAH SAKIT PELNI)",
    description: "Rekam Piutang & Termin Proyek PROYEK IPAL RUMAH SAKIT PELNI",
    referenceId: "PROYEK_IPAL_RUMAH_SAKIT_PELNI",
    projectId: "PROYEK_IPAL_RUMAH_SAKIT_PELNI",
    dueDate: "2026-08-31",
    amount: 0,
    status: "PAID",
    payments: []
  },
  {
    id: "PTG-J-6885",
    customId: "PTG-J-6885",
    type: "PIUTANG",
    contactName: "PROYEK STP PT. CAKRAWALA BUANA NUSANTARA",
    title: "PROYEK STP PT. CAKRAWALA BUANA NUSANTARA (Rekam Piutang & Termin Proyek PROYEK STP PT. CAKRAWALA BUANA NUSANTARA)",
    description: "Rekam Piutang & Termin Proyek PROYEK STP PT. CAKRAWALA BUANA NUSANTARA",
    referenceId: "PROYEK_STP_PT_CAKRAWALA_BUANA_",
    projectId: "PROYEK_STP_PT_CAKRAWALA_BUANA_",
    dueDate: "2026-09-03",
    amount: 61488000,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTGJ6885", amount: 30744000, date: "2026-08-25", note: "DP 50%", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-J-8261",
    customId: "PTG-J-8261",
    type: "PIUTANG",
    contactName: "Proyek Bak Sumpit Westmark",
    title: "Proyek Bak Sumpit Westmark (Rekam Piutang & Termin Proyek Proyek Bak Sumpit Westmark)",
    description: "Rekam Piutang & Termin Proyek Proyek Bak Sumpit Westmark",
    referenceId: "PROYEK_BAK_SUMPIT_WESTMARK",
    projectId: "PROYEK_BAK_SUMPIT_WESTMARK",
    dueDate: "2026-09-08",
    amount: 85850003,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTGJ8261", amount: 42925002, date: "2026-08-06", note: "DP 50%", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-MERSET",
    customId: "PTG-MERSET",
    type: "PIUTANG",
    contactName: "PT. TECHNOLOGIES TOOLMATE INDONESIA",
    title: "Project Summerset (Rekam Piutang & Termin Proyek Project Summerset)",
    description: "Rekam Piutang & Termin Proyek Project Summerset",
    referenceId: "SUMMERSET",
    projectId: "SUMMERSET",
    dueDate: "2026-10-13",
    amount: 450000000,
    status: "PARTIAL",
    payments: [
      { id: "PAY-PTGMERSET", amount: 25000000, date: "2026-07-10", note: "DP Parsial 1", recordedBy: "admin" }
    ]
  },
  {
    id: "PTG-SAKATA",
    customId: "PTG-SAKATA",
    type: "PIUTANG",
    contactName: "Proyek Sakata",
    title: "Proyek Sakata (Rekam Piutang & Termin Proyek Sakata)",
    description: "Rekam Piutang & Termin Proyek Sakata",
    referenceId: "SAKATA",
    projectId: "SAKATA",
    dueDate: "2026-10-15",
    amount: 0,
    status: "PAID",
    payments: []
  }
];

const allDebtsAndPiutang = [...officialDebts, ...officialPiutang];
console.log("Combined debts and piutang count:", allDebtsAndPiutang.length, "Expected: 45 + 16 = 61");

// Now extract the exact financial records up to August 31, 2026
const allFinancials = JSON.parse(fs.readFileSync("restored_financial_records_master.json", "utf8"));
// Cutoff: only June, July, August as requested: "nih data keuangan gua sampai bulan agustus nanti yang september kita kerjain belakangan"
const augCutoffFinancials = allFinancials.filter(r => r.date && r.date <= "2026-08-31");

console.log("Financial records up to August 31, 2026:", augCutoffFinancials.length);

// Generate seedData.ts
const code = `import { FinancialRecord, DebtRecord } from "../types";

export const seedFinancialRecords: Partial<FinancialRecord>[] = ${JSON.stringify(augCutoffFinancials, null, 2)};

export const seedDebtRecords: Partial<DebtRecord>[] = ${JSON.stringify(allDebtsAndPiutang, null, 2)};
`;

fs.writeFileSync("src/services/seedData.ts", code, "utf8");
console.log("Successfully wrote official seedData.ts up to August 31, 2026!");
