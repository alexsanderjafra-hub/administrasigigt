import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import fs from "fs";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

const app = initializeApp(firebaseConfig);
const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
const auth = getAuth(app);

async function restore() {
  console.log("Signing in as Admin...");
  await signInWithEmailAndPassword(auth, "admin@workflowpro.com", "adminadmin");
  console.log("Authenticated successfully!");

  const logs = JSON.parse(fs.readFileSync("firestore_audit_logs.json", "utf8"));

  // 1. RESTORE PROJECTS
  console.log("--- Restoring Projects ---");
  const projectsMap = new Map();
  const baseProjects = [
    { id: "WESTMARK", name: "Project Westmark", location: "Westmark Jakarta", startDate: "2026-05-01", endDate: "2026-08-31", status: "In Progress", priority: "High", progress: 65, manager: "Jidan Ramadhan", description: "Proyek instalasi filter softener dan sistem pengolahan air bersih Westmark." },
    { id: "UEU TB SIMATUPANG", name: "UEU TB Simatupang", location: "Universitas Esa Unggul Simatupang", startDate: "2026-05-15", endDate: "2026-09-30", status: "In Progress", priority: "High", progress: 45, manager: "Faisal Mustopa", description: "Desain CAD dan instalasi pengolahan limbah Universitas Esa Unggul." },
    { id: "PKM SINDANGN JAYA", name: "PKM Sindang Jaya", location: "Puskesmas Sindang Jaya", startDate: "2026-06-01", endDate: "2026-08-15", status: "In Progress", priority: "Medium", progress: 30, manager: "Jidan Ramadhan", description: "Pemeliharaan dan rehabilitasi IPAL Puskesmas Sindang Jaya." },
    { id: "SAKATA", name: "Proyek Sakata", location: "Sakata Jakarta", startDate: "2026-06-15", endDate: "2026-10-15", status: "In Progress", priority: "Medium", progress: 15, manager: "Faisal Mustopa", description: "Pemasangan sistem floating aerator Sakata." },
    { id: "UEU BEKASI", name: "UEU Bekasi", location: "Universitas Esa Unggul Bekasi", startDate: "2026-04-01", endDate: "2026-08-31", status: "Completed", priority: "Medium", progress: 100, manager: "Faisal Mustopa", description: "Pekerjaan IPAL Medis UEU Bekasi" },
    { id: "SUMMERSET", name: "Project Summerset", location: "Jakarta", startDate: "2026-07-01", endDate: "2026-09-30", status: "In Progress", priority: "High", progress: 40, manager: "Jidan Ramadhan", description: "Pekerjaan Proyek Summerset" }
  ];
  baseProjects.forEach(p => projectsMap.set(p.id, p));

  logs.forEach((l: any) => {
    const d = l.details || "";
    const projMatch = d.match(/Membuat proyek baru:\s*(.*?)\s*di\s*(.*)/i);
    if (projMatch) {
      const rawName = projMatch[1].trim();
      const location = projMatch[2].trim();
      const id = rawName.toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_").slice(0, 30);
      if (!projectsMap.has(id)) {
        projectsMap.set(id, {
          id,
          name: rawName,
          location,
          startDate: new Date(l.timestamp).toISOString().split("T")[0],
          endDate: "2026-12-31",
          status: "In Progress",
          priority: "High",
          progress: 35,
          manager: l.userName?.includes("Faisal") ? "Faisal Mustopa" : "Jidan Ramadhan",
          description: `Proyek ${rawName}`
        });
      }
    }
  });

  for (const [id, p] of projectsMap.entries()) {
    await setDoc(doc(db, "projects", id), {
      ...p,
      updatedAt: Timestamp.now()
    }, { merge: true });
  }
  console.log(`Successfully restored ${projectsMap.size} projects!`);

  // 2. RESTORE DEBT RECORDS
  console.log("--- Restoring Debt Records ---");
  const seedContent = fs.readFileSync("src/services/seedData.ts", "utf8");
  const debtStart = seedContent.indexOf("export const seedDebtRecords: Partial<DebtRecord>[] = [");
  const rawDebtArray = seedContent.substring(debtStart + "export const seedDebtRecords: Partial<DebtRecord>[] = [".length - 1).trim().replace(/;$/, "");
  const baselineDebts = eval(rawDebtArray);

  const debtsMap = new Map();
  baselineDebts.forEach((d: any) => {
    const cid = d.customId || d.id;
    debtsMap.set(cid, {
      ...d,
      id: d.id || cid,
      customId: cid
    });
  });

  // Ensure Yoga and Kemiri Jaya have accurate info
  if (debtsMap.has("HTG-004")) {
    const yoga = debtsMap.get("HTG-004");
    debtsMap.set("HTG-004", {
      ...yoga,
      amount: 65000000,
      contactName: "YOGA",
      payments: yoga.payments && yoga.payments.length > 0 ? yoga.payments : [
        { id: "PAY-HTG004", amount: 3200000, date: "2026-06-25", note: "Cicilan Hutang", recordedBy: "admin" }
      ],
      status: "PARTIAL"
    });
  }

  // Add PT Kemiri Jaya
  debtsMap.set("HTG-023", {
    id: "HTG-023",
    customId: "HTG-023",
    type: "HUTANG",
    title: "PENGADAAN TANGKI FIBER PT KEMIRI JAYA",
    contactName: "PT. KEMIRI JAYA FIBER TEKNIK",
    amount: 34410000,
    dueDate: "2026-07-31",
    status: "PARTIAL",
    description: "Pengadaan Tangki Fiber",
    payments: [
      { id: "PAY-HTG023", amount: 17205000, date: "2026-07-08", note: "DP 50%", recordedBy: "admin" }
    ],
    timestamp: new Date("2026-07-08").getTime(),
    recordedBy: "admin"
  });

  // Extract from auditLogs
  logs.forEach((l: any) => {
    const d = l.details || "";
    const htgMatch = d.match(/Mencatat Hutang baru.*?:\s*\[([^\]]+)\]\s*(.*?)\s*senilai Rp\s*([\d\.,]+)/i);
    if (htgMatch) {
      const customId = htgMatch[1].trim();
      const title = htgMatch[2].trim();
      const amount = Number(htgMatch[3].replace(/\./g, "").replace(/,/g, ""));
      const timestamp = l.timestamp;
      const date = new Date(timestamp).toISOString().split("T")[0];
      
      let contactName = "Internal Talangan";
      if (title.toUpperCase().includes("BANG YASIN") || title.toUpperCase().includes("YASIN")) contactName = "MUHAMMAD YASIN";
      else if (title.toUpperCase().includes("JIDAN")) contactName = "JIDAN RAMADHAN";
      else if (title.toUpperCase().includes("FAISAL")) contactName = "FAISAL MUSTOPA";
      else if (title.toUpperCase().includes("WELI")) contactName = "WELI MAHESA";

      if (!debtsMap.has(customId)) {
        debtsMap.set(customId, {
          id: customId,
          customId,
          type: "HUTANG",
          title,
          contactName,
          amount,
          dueDate: date,
          status: "UNPAID",
          description: title,
          timestamp,
          recordedBy: l.userName || "admin",
          payments: []
        });
      }
    }
  });

  for (const [id, debt] of debtsMap.entries()) {
    await setDoc(doc(db, "debtRecords", id), {
      ...debt,
      id
    }, { merge: true });
  }
  console.log(`Successfully restored ${debtsMap.size} debt records!`);

  // 3. RESTORE FINANCIAL RECORDS
  console.log("--- Restoring Financial Records ---");
  const finStart = seedContent.indexOf("export const seedFinancialRecords: Partial<FinancialRecord>[] = [");
  const finEnd = seedContent.indexOf("export const seedDebtRecords: Partial<DebtRecord>[] = [");
  const rawFinArray = seedContent.substring(finStart + "export const seedFinancialRecords: Partial<FinancialRecord>[] = [".length - 1, finEnd).trim().replace(/;$/, "");
  const baselineFinancials = eval(rawFinArray);

  const finMap = new Map();
  baselineFinancials.forEach((r: any, idx: number) => {
    const cid = r.customId || `INC_${idx}`;
    finMap.set(cid, {
      ...r,
      id: r.id || cid,
      customId: cid
    });
  });

  logs.forEach((l: any) => {
    const d = l.details || "";
    const match = d.match(/Mencatat (Pemasukan|Pengeluaran) \(([^)]+)\) ID \[([^\]]+)\]:\s*(.*?)\s*senilai Rp\s*([\d\.,]+)/i);
    if (match) {
      const isIncome = match[1].toLowerCase() === "pemasukan";
      const flowType = match[2].trim();
      const customId = match[3].trim();
      const description = match[4].trim();
      const amount = Number(match[5].replace(/\./g, "").replace(/,/g, ""));
      const timestamp = l.timestamp;
      
      let date = "";
      const dateMatch = customId.match(/[A-Z]+-(\d{2})(\d{2})(\d{2})-/);
      if (dateMatch) {
        date = `20${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
      } else {
        date = new Date(timestamp).toISOString().split("T")[0];
      }
      
      let category = "OPERASIONAL";
      const descU = description.toUpperCase();
      if (descU.includes("DP") || descU.includes("TERMIN") || descU.includes("PELUNASAN PROYEK") || descU.includes("PEMBAYARAN PROYEK")) {
        category = "TERMIN";
      } else if (descU.includes("GAJI") || descU.includes("UPAH")) {
        category = "GAJI";
      } else if (descU.includes("PATTYCASH") || descU.includes("PETTY") || descU.includes("TOP UP")) {
        category = "PATTY CASH";
      } else if (descU.includes("BELANJA") || descU.includes("PEMBELIAN") || descU.includes("PIPA") || descU.includes("KABEL")) {
        category = "BELANJA";
      } else if (descU.includes("KASBON")) {
        category = "KASBON";
      }

      let personalHolder = "";
      if (descU.includes("YASIN") || descU.includes("BANG YASIN")) personalHolder = "MUHAMMAD YASIN";
      else if (descU.includes("JIDAN")) personalHolder = "JIDAN RAMADHAN";
      else if (descU.includes("FAISAL")) personalHolder = "FAISAL MUSTOPA";
      else if (descU.includes("WELI")) personalHolder = "WELI MAHESA";

      let sumberDana = isIncome ? "KLIEN" : (flowType === "OUT_PERSONAL_SPEND" ? "REKENING PRIBADI" : "REKENING PT");

      const existing = finMap.get(customId);
      if (!existing) {
        finMap.set(customId, {
          id: customId,
          customId,
          date,
          type: isIncome ? "IN" : "OUT",
          flowType: isIncome ? "IN" : flowType,
          amount,
          description,
          category,
          sumberDana,
          personalHolder,
          timestamp,
          recordedBy: l.userName || "Faisal Mustopa (Admin)"
        });
      } else {
        finMap.set(customId, {
          ...existing,
          description: description || existing.description,
          amount: amount || existing.amount
        });
      }
    }
  });

  console.log(`Writing ${finMap.size} financial records to Firestore...`);
  let count = 0;
  for (const [id, rec] of finMap.entries()) {
    await setDoc(doc(db, "financialRecords", id), {
      ...rec,
      id
    }, { merge: true });
    count++;
    if (count % 100 === 0) {
      console.log(`Restored ${count}/${finMap.size} records...`);
    }
  }
  console.log(`Successfully restored all ${finMap.size} financial records!`);
  console.log("ALL DATA RESTORATION COMPLETE!");
}

restore().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("Restoration error:", err);
  process.exit(1);
});
