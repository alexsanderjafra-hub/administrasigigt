/**
 * Helper utility for Kasbon (Staff Loans & Deductions) calculation,
 * recipient name resolution, and ledger balance tracking.
 */

export interface KasbonItem {
  id: string;
  customId: string;
  date: string;
  amount: number;
  recipientName: string;
  description: string;
  sumberDana: string;
  pemilikUangPribadi?: string;
  referenceId?: string;
  type: "BORROW";
  repaidAmount: number;
  remainingAmount: number;
  status: "PAID" | "PARTIAL" | "UNPAID";
}

export interface KasbonRepayment {
  id: string;
  customId: string;
  date: string;
  amount: number;
  recipientName: string;
  description: string;
  sumberDana: string;
  referenceId?: string;
  salaryGross?: number;
  targetKasbonId?: string;
  type: "REPAY";
}

export interface EmployeeKasbonSummary {
  name: string;
  totalBorrowed: number;
  totalRepaid: number;
  remaining: number;
  status: "PAID" | "PARTIAL" | "UNPAID";
  borrowRecords: KasbonItem[];
  repaymentRecords: KasbonRepayment[];
}

export const KASBON_REKAP_START_DATE = "2026-08-13";

/**
 * Normalizes date string to ISO YYYY-MM-DD for accurate chronological comparisons.
 */
export function normalizeDateToISO(dStr?: string): string {
  if (!dStr) return "";
  const trimmed = dStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    } else if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return trimmed;
}

export function isDateOnOrAfter(dateStr?: string, cutoff: string = KASBON_REKAP_START_DATE): boolean {
  if (!dateStr) return true;
  const iso = normalizeDateToISO(dateStr);
  if (!iso) return true;
  return iso >= cutoff;
}

/**
 * Robustly extracts the true employee/recipient name from a financial record or debt record.
 * Avoids defaulting to the admin/creator name when the description contains the actual staff name.
 */
export function extractKasbonRecipient(
  record: any,
  knownPersonnel: string[] = []
): string {
  const desc = (record.description || record.title || "").trim();
  const descUpper = desc.toUpperCase();

  // 1. Check if recipient name is already set explicitly and NOT generic admin
  if (record.penerimaKasbon && typeof record.penerimaKasbon === "string") {
    const rawName = record.penerimaKasbon.trim();
    if (
      rawName &&
      !rawName.toLowerCase().includes("(admin)") &&
      !rawName.toLowerCase().includes("faisal mustopa")
    ) {
      return rawName;
    }
  }

  // 2. Try to match against known personnel names
  for (const p of knownPersonnel) {
    if (p && p.trim().length >= 3) {
      const pUpper = p.trim().toUpperCase();
      if (descUpper.includes(pUpper)) {
        return p.trim();
      }
    }
  }

  // 3. Known common staff aliases
  const knownAliases: { [key: string]: string } = {
    "WELI MAHESA": "WELI MAHESA",
    "WELI": "WELI MAHESA",
    "JIDAN RAMADHAN": "JIDAN RAMADHAN",
    "JIDAN": "JIDAN RAMADHAN",
    "FAUZYAWAN": "FAUZYAWAN",
    "FAUZI": "FAUZYAWAN",
    "BUDI": "BUDI",
    "RUDI": "RUDI",
    "AGUS": "AGUS",
    "DENI": "DENI",
    "YUDI": "YUDI",
    "HERI": "HERI",
    "ARI": "ARI",
    "BAYU": "BAYU",
  };

  for (const [alias, canonical] of Object.entries(knownAliases)) {
    // Regex for word boundary matching
    const regex = new RegExp(`\\b${alias}\\b`, "i");
    if (regex.test(descUpper)) {
      return canonical;
    }
  }

  // 4. Regex parse patterns like "KASBON [NAMA]", "UNTUK KASBON [NAMA]", "KASBON STAFF: [NAMA]"
  const pattern1 = /(?:KASBON|KASBON\s+STAFF|KASBON\s+UNTUK|CLAIM\s+UNTUK\s+KASBON|GAJI)\s+([A-Z0-9\s]+?)(?:\s+(?:WESTMARK|6\s+HARI|SUDAH|DAN|UNTUK|PROYEK|PROJECT|\/|-|\.|\,)|$)/i;
  const match = descUpper.match(pattern1);
  if (match && match[1] && match[1].trim().length >= 3) {
    const candidate = match[1].trim();
    const banned = ["KARYAWAN", "STAFF", "PEGAWAI", "WARUNG", "MAKAN", "TUKANG", "CAT", "PROYEK", "CLIENT"];
    if (!banned.includes(candidate)) {
      return candidate;
    }
  }

  // 5. Fallback to contactName or penerimaKasbon or personalHolder
  if (record.penerimaKasbon && record.penerimaKasbon.trim()) {
    return record.penerimaKasbon.trim();
  }
  if (record.contactName && record.contactName.trim()) {
    return record.contactName.trim();
  }
  if (record.personalHolder && record.personalHolder.trim()) {
    return record.personalHolder.trim();
  }

  return "Staff PIC";
}

/**
 * Calculates complete Kasbon balances per employee and per individual borrow transaction.
 */
export function calculateKasbonBalances(
  financialRecords: any[] = [],
  debtRecords: any[] = [],
  knownPersonnel: string[] = []
): {
  employeeSummaries: EmployeeKasbonSummary[];
  allBorrowItems: KasbonItem[];
  allRepayments: KasbonRepayment[];
  totalKasbon: number;
  totalRepaid: number;
  totalRemaining: number;
} {
  const borrowMap: { [empName: string]: KasbonItem[] } = {};
  const repayMap: { [empName: string]: KasbonRepayment[] } = {};
  const seenIds = new Set<string>();

  // 1. Gather all Kasbon borrows (Only records from 10 Agustus 2026 onwards for the active rekap)
  (financialRecords || []).forEach((r) => {
    const cat = (r.category || "").toUpperCase();
    const desc = (r.description || "").toUpperCase();
    const isKasbon =
      r.type === "OUT" &&
      (cat.includes("KASBON") ||
        desc.includes("KASBON") ||
        Boolean(r.penerimaKasbon));

    // Exclude salary payments that merely deducted kasbon
    const isSalary = cat.includes("GAJI") || desc.includes("GAJI") || desc.includes("PAYROLL");

    // Filter starting from 10 Agustus 2026
    const isRecent = isDateOnOrAfter(r.date, KASBON_REKAP_START_DATE);

    if (isKasbon && !isSalary && isRecent) {
      seenIds.add(r.id);
      if (r.customId) seenIds.add(r.customId);

      const empName = extractKasbonRecipient(r, knownPersonnel);
      if (!borrowMap[empName]) borrowMap[empName] = [];

      borrowMap[empName].push({
        id: r.id,
        customId: r.customId || "KBN-TRX",
        date: r.date || "",
        amount: Number(r.amount || 0),
        recipientName: empName,
        description: r.description || `Kasbon Staff: ${empName}`,
        sumberDana: r.sumberDana || "REKENING PT",
        pemilikUangPribadi: r.pemilikUangPribadi,
        referenceId: r.referenceId || r.projectId,
        type: "BORROW",
        repaidAmount: 0,
        remainingAmount: Number(r.amount || 0),
        status: "UNPAID",
      });
    }
  });

  // From debtRecords that were recorded as Kasbon (Only records from 13 Agustus 2026 onwards)
  (debtRecords || []).forEach((d) => {
    const title = (d.title || "").toUpperCase();
    const desc = (d.description || "").toUpperCase();
    const notes = String((d as any).notes || "").toUpperCase();
    const cat = ((d as any).category || "").toUpperCase();

    // Check if this debtRecord is an auto-generated mirror of a financialRecord
    const isAutoMirror =
      desc.includes("PENCATATAN OTOMATIS") ||
      desc.includes("DARI REKENING PT") ||
      desc.includes("PRS-") ||
      desc.includes("BNK-") ||
      title.includes("PENCATATAN OTOMATIS") ||
      title.includes("PRS-") ||
      title.includes("BNK-") ||
      notes.includes("PRS-") ||
      notes.includes("BNK-") ||
      cat === "PIUTANG_KASBON_STAFF" ||
      Boolean((d as any).refFinancialId) ||
      Boolean((d as any).transactionId) ||
      Boolean((d as any).financialRecordId);

    if (isAutoMirror) {
      // Skip duplicate! Already tracked directly from financialRecords.
      return;
    }

    const isKasbonDebt =
      title.includes("KASBON") ||
      desc.includes("KASBON") ||
      cat.includes("KASBON") ||
      (d as any).isKasbon;

    const debtDate = d.dueDate || (d.timestamp ? new Date(d.timestamp).toISOString().split("T")[0] : "");
    const isRecent = isDateOnOrAfter(debtDate, KASBON_REKAP_START_DATE);

    if (
      isKasbonDebt &&
      isRecent &&
      !seenIds.has(d.id) &&
      !(d.customId && seenIds.has(d.customId))
    ) {
      const empName = extractKasbonRecipient(d, knownPersonnel);
      if (!borrowMap[empName]) borrowMap[empName] = [];

      borrowMap[empName].push({
        id: d.id,
        customId: d.customId || "KBN-DEBT",
        date: debtDate,
        amount: Number(d.amount || 0),
        recipientName: empName,
        description: d.description || d.title || `Kasbon Staff: ${empName}`,
        sumberDana: "REKENING PT",
        referenceId: d.projectId,
        type: "BORROW",
        repaidAmount: 0,
        remainingAmount: Number(d.amount || 0),
        status: "UNPAID",
      });
    }
  });

  // 2. Gather all Repayments & Salary Deductions (Only records from 13 Agustus 2026 onwards)
  (financialRecords || []).forEach((r) => {
    const isRecent = isDateOnOrAfter(r.date, KASBON_REKAP_START_DATE);
    if (!isRecent) return;

    const cat = (r.category || "").toUpperCase();
    const desc = (r.description || "").toUpperCase();
    const isDirectRepay =
      r.type === "IN" &&
      (cat.includes("KASBON") ||
        desc.includes("KASBON") ||
        desc.includes("PELUNASAN"));
    const isSalaryDeduction =
      r.type === "OUT" &&
      (cat.includes("GAJI") || desc.includes("GAJI") || desc.includes("PAYROLL")) &&
      Number(r.potonganKasbon || 0) > 0;

    if (isDirectRepay || isSalaryDeduction) {
      const empName = extractKasbonRecipient(r, knownPersonnel);
      if (!repayMap[empName]) repayMap[empName] = [];

      const repayAmt = isDirectRepay ? Number(r.amount || 0) : Number(r.potonganKasbon || 0);

      repayMap[empName].push({
        id: r.id,
        customId: r.customId || "REP-TRX",
        date: r.date || "",
        amount: repayAmt,
        recipientName: empName,
        description:
          isSalaryDeduction
            ? `Potongan Kasbon dari Gaji (ID: ${r.customId || "-"})`
            : r.description || "Setoran Pelunasan Kasbon",
        sumberDana: r.sumberDana || "REKENING PT",
        referenceId: r.referenceId || r.projectId,
        salaryGross: Number(r.totalGaji || 0),
        targetKasbonId: r.linkedDebtId || r.refHutang || r.refPiutang,
        type: "REPAY",
      });
    }
  });

  // 3. Reconcile Balances for each Employee and allocate repayments to individual borrow items
  const allEmpNames = Array.from(
    new Set([...Object.keys(borrowMap), ...Object.keys(repayMap)])
  );

  const employeeSummaries: EmployeeKasbonSummary[] = [];
  const allBorrowItems: KasbonItem[] = [];
  const allRepayments: KasbonRepayment[] = [];

  let totalKasbon = 0;
  let totalRepaid = 0;

  for (const empName of allEmpNames) {
    const borrows = (borrowMap[empName] || []).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    const repays = (repayMap[empName] || []).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const empTotalBorrowed = borrows.reduce((sum, b) => sum + b.amount, 0);
    const empTotalRepaid = repays.reduce((sum, r) => sum + r.amount, 0);

    totalKasbon += empTotalBorrowed;
    totalRepaid += empTotalRepaid;

    // Distribute repayments across borrows
    // First, honor targeted repayments
    let unallocatedRepayTotal = 0;

    for (const repay of repays) {
      let remainingRepay = repay.amount;

      if (repay.targetKasbonId) {
        const target = borrows.find(
          (b) =>
            b.id === repay.targetKasbonId ||
            b.customId === repay.targetKasbonId ||
            repay.targetKasbonId?.includes(b.customId)
        );
        if (target && target.remainingAmount > 0) {
          const alloc = Math.min(remainingRepay, target.remainingAmount);
          target.repaidAmount += alloc;
          target.remainingAmount -= alloc;
          target.status =
            target.remainingAmount <= 0
              ? "PAID"
              : target.repaidAmount > 0
              ? "PARTIAL"
              : "UNPAID";
          remainingRepay -= alloc;
        }
      }

      unallocatedRepayTotal += remainingRepay;
    }

    // Allocate remaining general repayments across unpaid borrow records (FIFO)
    for (const borrow of borrows) {
      if (unallocatedRepayTotal <= 0) break;
      if (borrow.remainingAmount <= 0) continue;

      const alloc = Math.min(unallocatedRepayTotal, borrow.remainingAmount);
      borrow.repaidAmount += alloc;
      borrow.remainingAmount -= alloc;
      borrow.status =
        borrow.remainingAmount <= 0
          ? "PAID"
          : borrow.repaidAmount > 0
          ? "PARTIAL"
          : "UNPAID";
      unallocatedRepayTotal -= alloc;
    }

    const empRemaining = Math.max(0, empTotalBorrowed - empTotalRepaid);
    let empStatus: "PAID" | "PARTIAL" | "UNPAID" = "UNPAID";
    if (empTotalBorrowed > 0 && empRemaining <= 0) {
      empStatus = "PAID";
    } else if (empTotalRepaid > 0 && empRemaining > 0) {
      empStatus = "PARTIAL";
    }

    employeeSummaries.push({
      name: empName,
      totalBorrowed: empTotalBorrowed,
      totalRepaid: empTotalRepaid,
      remaining: empRemaining,
      status: empStatus,
      borrowRecords: borrows,
      repaymentRecords: repays,
    });

    allBorrowItems.push(...borrows);
    allRepayments.push(...repays);
  }

  // Sort summaries: highest remaining debt first
  employeeSummaries.sort((a, b) => b.remaining - a.remaining);

  return {
    employeeSummaries,
    allBorrowItems,
    allRepayments,
    totalKasbon,
    totalRepaid,
    totalRemaining: Math.max(0, totalKasbon - totalRepaid),
  };
}

/**
 * Calculates allocation preview when entering a salary deduction amount for an employee
 */
export function simulateKasbonAllocation(
  employeeSummary: EmployeeKasbonSummary | undefined,
  deductionAmount: number,
  targetKasbonId?: string
): {
  allocatedItems: {
    customId: string;
    description: string;
    originalAmount: number;
    currentRemaining: number;
    deductedThisTime: number;
    newRemaining: number;
    isFullyPaid: boolean;
    isDirectTarget?: boolean;
  }[];
  totalDeducted: number;
  newEmployeeRemaining: number;
} {
  if (!employeeSummary) {
    return {
      allocatedItems: [],
      totalDeducted: 0,
      newEmployeeRemaining: 0,
    };
  }

  let remainingDeduction = Math.max(0, deductionAmount);
  const allocatedItems: any[] = [];

  // Filter only borrows that have remainingAmount > 0
  let activeBorrows = employeeSummary.borrowRecords.filter(
    (b) => b.remainingAmount > 0
  );

  // If a specific targetKasbonId was chosen, prioritize it to the top of the list
  if (targetKasbonId) {
    const cleanTargetId = targetKasbonId.replace("KASBON_TRX:", "").trim();
    activeBorrows = [...activeBorrows].sort((a, b) => {
      const matchA = a.customId === cleanTargetId || a.id === cleanTargetId;
      const matchB = b.customId === cleanTargetId || b.id === cleanTargetId;
      if (matchA && !matchB) return -1;
      if (!matchA && matchB) return 1;
      return 0;
    });
  }

  for (const borrow of activeBorrows) {
    const cleanTargetId = targetKasbonId ? targetKasbonId.replace("KASBON_TRX:", "").trim() : "";
    const isDirectTarget = Boolean(cleanTargetId && (borrow.customId === cleanTargetId || borrow.id === cleanTargetId));

    if (remainingDeduction <= 0) {
      allocatedItems.push({
        customId: borrow.customId,
        description: borrow.description,
        originalAmount: borrow.amount,
        currentRemaining: borrow.remainingAmount,
        deductedThisTime: 0,
        newRemaining: borrow.remainingAmount,
        isFullyPaid: false,
        isDirectTarget,
      });
      continue;
    }

    const alloc = Math.min(remainingDeduction, borrow.remainingAmount);
    const newRemaining = borrow.remainingAmount - alloc;
    allocatedItems.push({
      customId: borrow.customId,
      description: borrow.description,
      originalAmount: borrow.amount,
      currentRemaining: borrow.remainingAmount,
      deductedThisTime: alloc,
      newRemaining,
      isFullyPaid: newRemaining <= 0,
      isDirectTarget,
    });

    remainingDeduction -= alloc;
  }

  const totalDeducted = Math.min(deductionAmount, employeeSummary.remaining);
  const newEmployeeRemaining = Math.max(0, employeeSummary.remaining - totalDeducted);

  return {
    allocatedItems,
    totalDeducted,
    newEmployeeRemaining,
  };
}
