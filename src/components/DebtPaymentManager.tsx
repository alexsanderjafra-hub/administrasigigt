import React, { useState, useMemo, useEffect } from "react";
import { Users2, CheckCircle2, AlertCircle, RefreshCw, Trash2, Edit3, ArrowRight, ShieldCheck, Sparkles, Layers } from "lucide-react";
import { DebtRecord, DebtPaymentAllocation, Project, FinancialRecord } from "../types";
import { normalizeContactName } from "../utils/contactHelper";

export interface DebtPaymentManagerProps {
  debts: DebtRecord[];
  projects: Project[];
  financialRecords: FinancialRecord[];
  amount: string | number;
  onAmountChange?: (newAmount: number) => void;
  allocations: DebtPaymentAllocation[];
  onAllocationsChange: (
    newAllocs: DebtPaymentAllocation[],
    refStr: string,
    firstDebtId?: string
  ) => void;
  refHutang: string;
  onRefHutangChange: (val: string) => void;
  isEdit?: boolean;
  editingTransaction?: FinancialRecord | null;
  getScheduleForRecord: (
    record: DebtRecord,
    projects: Project[],
    financialRecords: FinancialRecord[]
  ) => { contractValue: number; totalPaid: number; terms: any[] };
}

export const DebtPaymentManager: React.FC<DebtPaymentManagerProps> = ({
  debts,
  projects,
  financialRecords,
  amount,
  onAmountChange,
  allocations,
  onAllocationsChange,
  refHutang,
  onRefHutangChange,
  isEdit = false,
  editingTransaction = null,
  getScheduleForRecord,
}) => {
  const [selectedCreditor, setSelectedCreditor] = useState<string>("");
  const [mode, setMode] = useState<"BY_CREDITOR" | "BY_NOTE" | "MANUAL">("BY_CREDITOR");

  const hutangRecords = useMemo(() => {
    return debts.filter((d) => d.type === "HUTANG");
  }, [debts]);

  // Group debts by normalized creditor name
  const creditorGroups = useMemo(() => {
    const groups: {
      [key: string]: {
        name: string;
        debts: DebtRecord[];
        totalAmount: number;
        totalPaid: number;
        totalRemaining: number;
        unpaidCount: number;
      };
    } = {};

    hutangRecords.forEach((d) => {
      const raw = (d.contactName && d.contactName !== "-" && d.contactName !== "Tanpa Nama" ? d.contactName : (d.title || "Tanpa Nama")).trim();
      const normName = normalizeContactName(raw);
      const key = normName.toUpperCase();

      if (!groups[key]) {
        groups[key] = {
          name: normName,
          debts: [],
          totalAmount: 0,
          totalPaid: 0,
          totalRemaining: 0,
          unpaidCount: 0,
        };
      }

      const sched = getScheduleForRecord(d, projects, financialRecords);
      const initAmt = sched.contractValue || d.amount || 0;
      let paidAmt = sched.totalPaid;

      // If in edit mode, add back amounts that belonged to the transaction being edited
      if (isEdit && editingTransaction) {
        const prevAlloc = editingTransaction.debtAllocations?.find(
          (a) => a.debtId === d.id || a.debtId === d.customId
        );
        if (prevAlloc) {
          paidAmt = Math.max(0, paidAmt - prevAlloc.amount);
        } else if (
          editingTransaction.linkedDebtId === d.id ||
          editingTransaction.refHutang === d.customId ||
          editingTransaction.refHutang === d.title
        ) {
          paidAmt = Math.max(0, paidAmt - Number(editingTransaction.amount || 0));
        }
      }

      const remaining = Math.max(0, initAmt - paidAmt);

      groups[key].debts.push(d);
      groups[key].totalAmount += initAmt;
      groups[key].totalPaid += paidAmt;
      groups[key].totalRemaining += remaining;
      if (remaining > 0) {
        groups[key].unpaidCount += 1;
      }
    });

    // Sort debts inside each group chronologically (FIFO)
    Object.values(groups).forEach((g) => {
      g.debts.sort((a, b) => {
        const dateA = a.dueDate || a.timestamp || 0;
        const dateB = b.dueDate || b.timestamp || 0;
        if (dateA !== dateB) {
          return dateA < dateB ? -1 : 1;
        }
        return (a.customId || "").localeCompare(b.customId || "", undefined, { numeric: true });
      });
    });

    return Object.values(groups).sort((a, b) => {
      if (b.totalRemaining !== a.totalRemaining) {
        return b.totalRemaining - a.totalRemaining;
      }
      return a.name.localeCompare(b.name);
    });
  }, [hutangRecords, projects, financialRecords, isEdit, editingTransaction, getScheduleForRecord]);

  // If allocations already exist (e.g. initial edit load), deduce selected creditor
  useEffect(() => {
    if (selectedCreditor) return;
    if (allocations.length > 0 && allocations[0].debtId) {
      const firstDebt = hutangRecords.find((d) => d.id === allocations[0].debtId || d.customId === allocations[0].debtId);
      if (firstDebt) {
        const norm = normalizeContactName(firstDebt.contactName || firstDebt.title);
        setSelectedCreditor(norm.toUpperCase());
        setMode("BY_CREDITOR");
      }
    } else if (refHutang && !selectedCreditor) {
      const match = creditorGroups.find((g) => refHutang.toUpperCase().includes(g.name.toUpperCase()));
      if (match) {
        setSelectedCreditor(match.name.toUpperCase());
        setMode("BY_CREDITOR");
      }
    }
  }, [allocations, hutangRecords, refHutang, creditorGroups, selectedCreditor]);

  const activeCreditorGroup = useMemo(() => {
    if (!selectedCreditor) return null;
    return creditorGroups.find((g) => g.name.toUpperCase() === selectedCreditor.toUpperCase()) || null;
  }, [selectedCreditor, creditorGroups]);

  // Helper to calculate remaining for a specific debt
  const getDebtRemaining = (d: DebtRecord) => {
    const sched = getScheduleForRecord(d, projects, financialRecords);
    const initAmt = sched.contractValue || d.amount || 0;
    let paidAmt = sched.totalPaid;

    if (isEdit && editingTransaction) {
      const prevAlloc = editingTransaction.debtAllocations?.find(
        (a) => a.debtId === d.id || a.debtId === d.customId
      );
      if (prevAlloc) {
        paidAmt = Math.max(0, paidAmt - prevAlloc.amount);
      } else if (
        editingTransaction.linkedDebtId === d.id ||
        editingTransaction.refHutang === d.customId ||
        editingTransaction.refHutang === d.title
      ) {
        paidAmt = Math.max(0, paidAmt - Number(editingTransaction.amount || 0));
      }
    }

    return Math.max(0, initAmt - paidAmt);
  };

  // Build clean reference string from allocations
  const generateRefString = (
    creditorName: string,
    validAllocs: DebtPaymentAllocation[],
    allCreditorDebts?: DebtRecord[]
  ) => {
    if (validAllocs.length === 0) return "";
    
    // Check if fully paid
    const isAllPaid = allCreditorDebts && allCreditorDebts.length > 0 && 
      validAllocs.length === allCreditorDebts.length &&
      allCreditorDebts.every((d) => {
        const alloc = validAllocs.find((a) => a.debtId === d.id || a.customId === d.customId);
        const rem = getDebtRemaining(d);
        return alloc && alloc.amount >= rem;
      });

    if (isAllPaid) {
      const noteIds = validAllocs.map((a) => a.customId || a.title || "HTG").join(", ");
      return `[${creditorName}] Pelunasan Penuh ${validAllocs.length} Nota (${noteIds})`;
    }

    const noteDetails = validAllocs
      .map((a) => `${a.customId || a.title || "HTG"} (Rp ${a.amount.toLocaleString("id-ID")})`)
      .join(" + ");
    return `[${creditorName}] ${noteDetails}`;
  };

  // AUTO-ALLOCATE (FIFO - Tertua ke Terbaru) for selected creditor
  const handleAutoAllocateCreditor = () => {
    if (!activeCreditorGroup) return;
    const targetAmount = Number(amount || 0);
    if (targetAmount <= 0) {
      alert("Masukkan nominal transaksi pengeluaran terlebih dahulu.");
      return;
    }

    let unallocated = targetAmount;
    const newAllocs: DebtPaymentAllocation[] = [];

    for (const d of activeCreditorGroup.debts) {
      const rem = getDebtRemaining(d);
      if (rem <= 0) continue;

      const deduct = Math.min(unallocated, rem);
      if (deduct > 0) {
        newAllocs.push({
          debtId: d.id,
          customId: d.customId || d.id,
          title: d.title,
          contactName: d.contactName,
          amount: deduct,
        });
        unallocated -= deduct;
      }
      if (unallocated <= 0) break;
    }

    // If there is still extra unallocated money and notes exist, put remainder into the last note or keep it
    if (unallocated > 0 && newAllocs.length > 0) {
      newAllocs[newAllocs.length - 1].amount += unallocated;
    }

    const refStr = generateRefString(activeCreditorGroup.name, newAllocs, activeCreditorGroup.debts);
    onAllocationsChange(newAllocs, refStr, newAllocs[0]?.debtId);
  };

  // FULL PAYMENT: sets amount to 100% of remaining and allocates to all
  const handleFullPayCreditor = () => {
    if (!activeCreditorGroup) return;
    const totalRemaining = activeCreditorGroup.totalRemaining;
    if (totalRemaining <= 0) {
      alert("Kreditur ini sudah tidak memiliki sisa hutang (sudah lunas).");
      return;
    }

    if (onAmountChange) {
      onAmountChange(totalRemaining);
    }

    const newAllocs: DebtPaymentAllocation[] = [];
    for (const d of activeCreditorGroup.debts) {
      const rem = getDebtRemaining(d);
      if (rem > 0) {
        newAllocs.push({
          debtId: d.id,
          customId: d.customId || d.id,
          title: d.title,
          contactName: d.contactName,
          amount: rem,
        });
      }
    }

    const refStr = generateRefString(activeCreditorGroup.name, newAllocs, activeCreditorGroup.debts);
    onAllocationsChange(newAllocs, refStr, newAllocs[0]?.debtId);
  };

  // Manual change of a specific debt row's allocation amount
  const handleRowAmountChange = (debtId: string, valStr: string) => {
    const val = Math.max(0, Number(valStr) || 0);
    const targetDebt = hutangRecords.find((d) => d.id === debtId || d.customId === debtId);
    if (!targetDebt) return;

    let updated = [...allocations];
    const existingIdx = updated.findIndex((a) => a.debtId === debtId || a.customId === debtId);

    if (val <= 0) {
      // Remove if 0
      updated = updated.filter((_, i) => i !== existingIdx);
    } else {
      const newEntry: DebtPaymentAllocation = {
        debtId: targetDebt.id,
        customId: targetDebt.customId || targetDebt.id,
        title: targetDebt.title,
        contactName: targetDebt.contactName,
        amount: val,
      };
      if (existingIdx >= 0) {
        updated[existingIdx] = newEntry;
      } else {
        updated.push(newEntry);
      }
    }

    const creditorName = activeCreditorGroup?.name || targetDebt.contactName || "Hutang";
    const refStr = generateRefString(creditorName, updated, activeCreditorGroup?.debts);
    onAllocationsChange(updated, refStr, updated[0]?.debtId);
  };

  // Stats calculation
  const totalAllocated = useMemo(() => {
    return allocations.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [allocations]);

  const targetAmtNumber = Number(amount || 0);
  const diff = targetAmtNumber - totalAllocated;
  const isMatch = Math.abs(diff) < 1 && totalAllocated > 0;

  return (
    <div className="space-y-4 p-5 md:p-6 bg-gradient-to-b from-rose-50/40 via-white to-rose-50/20 rounded-[28px] border border-rose-200/80 shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-rose-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm shadow-rose-200 shrink-0">
            <Users2 size={20} />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              Kreditur &amp; Rincian Pelunasan Hutang
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Anti-Ganda
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Pilih Nama Kreditur untuk memotong rincian nota secara otomatis atau manual tanpa duplikasi data.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-rose-100/60 rounded-2xl self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => setMode("BY_CREDITOR")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === "BY_CREDITOR"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-rose-700"
            }`}
          >
            👤 Per Nama
          </button>
          <button
            type="button"
            onClick={() => setMode("BY_NOTE")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === "BY_NOTE"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📄 Per Nota
          </button>
          <button
            type="button"
            onClick={() => setMode("MANUAL")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === "MANUAL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ✏️ Manual
          </button>
        </div>
      </div>

      {/* MODE 1: BY CREDITOR (PRIMARY & RECOMMENDED) */}
      {mode === "BY_CREDITOR" && (
        <div className="space-y-4">
          {/* Main Creditor Dropdown */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 pl-1">
              Pilih Nama Pihak / Kreditur yang Dihutangi:
            </label>
            <select
              value={selectedCreditor}
              onChange={(e) => {
                const newCred = e.target.value;
                setSelectedCreditor(newCred);
                if (!newCred) {
                  onAllocationsChange([], "", "");
                  return;
                }
                const grp = creditorGroups.find((g) => g.name.toUpperCase() === newCred.toUpperCase());
                if (grp) {
                  // If amount is set, automatically propose FIFO allocation for smooth UX
                  const targetAmt = Number(amount || 0);
                  if (targetAmt > 0) {
                    let unalloc = targetAmt;
                    const allocList: DebtPaymentAllocation[] = [];
                    for (const d of grp.debts) {
                      const rem = getDebtRemaining(d);
                      if (rem <= 0) continue;
                      const deduct = Math.min(unalloc, rem);
                      if (deduct > 0) {
                        allocList.push({
                          debtId: d.id,
                          customId: d.customId || d.id,
                          title: d.title,
                          contactName: d.contactName,
                          amount: deduct,
                        });
                        unalloc -= deduct;
                      }
                      if (unalloc <= 0) break;
                    }
                    const refStr = generateRefString(grp.name, allocList, grp.debts);
                    onAllocationsChange(allocList, refStr, allocList[0]?.debtId);
                  } else {
                    onAllocationsChange([], `[${grp.name}] Pembayaran Hutang`, grp.debts[0]?.id);
                  }
                }
              }}
              className="w-full px-5 py-4 bg-white border border-rose-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-rose-100 transition-all cursor-pointer shadow-xs"
            >
              <option value="">-- Silakan Pilih Kreditur / Vendor --</option>
              <optgroup label="📋 Kreditur dengan Sisa Hutang Aktif">
                {creditorGroups
                  .filter((g) => g.totalRemaining > 0)
                  .map((g) => (
                    <option key={g.name} value={g.name.toUpperCase()}>
                      👤 {g.name} — ({g.unpaidCount} Nota Aktif | Sisa: Rp {g.totalRemaining.toLocaleString("id-ID")})
                    </option>
                  ))}
              </optgroup>
              {creditorGroups.some((g) => g.totalRemaining === 0) && (
                <optgroup label="✅ Kreditur yang Sudah Lunas (Arsip)">
                  {creditorGroups
                    .filter((g) => g.totalRemaining === 0)
                    .map((g) => (
                      <option key={g.name} value={g.name.toUpperCase()}>
                        👤 {g.name} — (Semua {g.debts.length} Nota Lunas)
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Creditor Overview Card & Action Shortcuts */}
          {activeCreditorGroup && (
            <div className="bg-white border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-700 uppercase tracking-wider">
                      Buku Besar Hutang:
                    </span>
                    <span className="text-sm font-black text-slate-900 uppercase">
                      {activeCreditorGroup.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                    <span>{activeCreditorGroup.debts.length} Total Nota Terdaftar</span>
                    <span>•</span>
                    <span className="text-rose-600 font-extrabold font-mono">
                      Sisa Hutang: Rp {activeCreditorGroup.totalRemaining.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Quick Auto-Allocate Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoAllocateCreditor}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                    title="Bagi nominal transaksi secara berurutan ke nota tertua terlebih dahulu"
                  >
                    <Sparkles size={14} className="text-amber-600" />
                    ⚡ Auto-Potong (FIFO)
                  </button>
                  {activeCreditorGroup.totalRemaining > 0 && (
                    <button
                      type="button"
                      onClick={handleFullPayCreditor}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-rose-200 active:scale-95"
                      title="Setel nominal transaksi dan lunasi seluruh sisa hutang kreditur ini"
                    >
                      <CheckCircle2 size={14} />
                      💰 Bayar Lunas Semua
                    </button>
                  )}
                </div>
              </div>

              {/* Individual Notes Breakdown Under This Creditor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Rincian Nota &amp; Alokasi Pembayaran:
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Urutan: Tertua (Sebelum Juni &amp; Berjalan) ke Terbaru
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto border border-slate-100 rounded-xl">
                  {activeCreditorGroup.debts.map((d, idx) => {
                    const rem = getDebtRemaining(d);
                    const sched = getScheduleForRecord(d, projects, financialRecords);
                    const initialVal = sched.contractValue || d.amount || 0;
                    const curAlloc = allocations.find((a) => a.debtId === d.id || a.customId === d.customId);
                    const allocAmount = curAlloc?.amount || 0;
                    const willBeLunas = rem > 0 && allocAmount >= rem;
                    const isPartial = allocAmount > 0 && allocAmount < rem;

                    return (
                      <div
                        key={d.id}
                        className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                          allocAmount > 0 ? "bg-rose-50/40" : "bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Note Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black font-mono text-slate-700">
                              {d.customId || `HTG-${idx + 1}`}
                            </span>
                            <span className="text-xs font-black text-slate-800 truncate">
                              {d.title}
                            </span>
                            {willBeLunas && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black tracking-wide">
                                ✅ LUNAS
                              </span>
                            )}
                            {isPartial && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black tracking-wide">
                                ⏱️ SEBAGIAN
                              </span>
                            )}
                            {rem === 0 && allocAmount === 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold">
                                Sudah Lunas Sebelumnya
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                            <span>Tgl/Jatuh Tempo: {d.dueDate || "-"}</span>
                            <span>•</span>
                            <span>Pokok: Rp {initialVal.toLocaleString("id-ID")}</span>
                            <span>•</span>
                            <span className="text-rose-600 font-bold font-mono">
                              Sisa: Rp {rem.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        {/* Amount Allocated Input */}
                        <div className="flex items-center gap-2 shrink-0 sm:w-60">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              Rp
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={rem > 0 ? rem * 2 : undefined}
                              value={allocAmount || ""}
                              placeholder="0"
                              onChange={(e) => handleRowAmountChange(d.id, e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-200 text-right"
                            />
                          </div>
                          {rem > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRowAmountChange(d.id, rem.toString())}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                              title="Alokasikan penuh untuk nota ini"
                            >
                              Penuh
                            </button>
                          )}
                          {allocAmount > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRowAmountChange(d.id, "0")}
                              className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-all cursor-pointer shrink-0"
                              title="Reset alokasi nota ini"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: BY NOTE (DIRECT INDIVIDUAL NOTE SELECTOR) */}
      {mode === "BY_NOTE" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 pl-1">
              Pilih Nota Hutang Secara Langsung (Bisa Multi-Select):
            </label>
            <button
              type="button"
              onClick={() => {
                onAllocationsChange([...allocations, { debtId: "", amount: 0 }], refHutang);
              }}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              + Tambah Nota Lain
            </button>
          </div>

          <div className="space-y-2.5">
            {allocations.map((alloc, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
                <div className="w-full sm:flex-1">
                  <select
                    value={alloc.debtId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const targetDebt = hutangRecords.find((d) => d.id === selectedId || d.customId === selectedId);
                      const updated = [...allocations];
                      let autoAmt = alloc.amount;
                      if (targetDebt && (!autoAmt || autoAmt <= 0)) {
                        const rem = getDebtRemaining(targetDebt);
                        const otherSum = updated.reduce((s, a, i) => (i === idx ? s : s + (a.amount || 0)), 0);
                        const unalloc = Math.max(0, targetAmtNumber - otherSum);
                        autoAmt = unalloc > 0 ? (rem > 0 ? Math.min(unalloc, rem) : unalloc) : rem;
                      }
                      updated[idx] = {
                        debtId: selectedId,
                        customId: targetDebt?.customId || targetDebt?.id || "",
                        title: targetDebt?.title || "",
                        contactName: targetDebt?.contactName || "",
                        amount: autoAmt,
                      };
                      const refStr = updated
                        .filter((a) => a.debtId && a.amount > 0)
                        .map((a) => `${a.customId || a.title || "HTG"} (Rp ${a.amount.toLocaleString("id-ID")})`)
                        .join(" + ");
                      onAllocationsChange(updated, refStr, updated[0]?.debtId);
                    }}
                    className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-200 cursor-pointer"
                  >
                    <option value="">-- Pilih Data Nota Hutang --</option>
                    {hutangRecords.map((d) => {
                      const rem = getDebtRemaining(d);
                      const sched = getScheduleForRecord(d, projects, financialRecords);
                      const totalCont = sched.contractValue || d.amount || 0;
                      return (
                        <option key={d.id} value={d.id}>
                          [{d.customId || "HTG"}] {d.title} - {d.contactName} (Nilai: Rp {totalCont.toLocaleString("id-ID")} | Sisa: Rp {rem.toLocaleString("id-ID")}) {rem === 0 ? "✅ Lunas" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="w-full sm:w-52 flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={alloc.amount || ""}
                      onChange={(e) => {
                        const updated = [...allocations];
                        updated[idx].amount = Number(e.target.value) || 0;
                        const refStr = updated
                          .filter((a) => a.debtId && a.amount > 0)
                          .map((a) => `${a.customId || a.title || "HTG"} (Rp ${a.amount.toLocaleString("id-ID")})`)
                          .join(" + ");
                        onAllocationsChange(updated, refStr, updated[0]?.debtId);
                      }}
                      placeholder="Nominal alokasi..."
                      className="w-full pl-9 pr-3 py-3 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-200 text-right"
                    />
                  </div>
                  {allocations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = allocations.filter((_, i) => i !== idx);
                        const refStr = updated
                          .filter((a) => a.debtId && a.amount > 0)
                          .map((a) => `${a.customId || a.title || "HTG"} (Rp ${a.amount.toLocaleString("id-ID")})`)
                          .join(" + ");
                        onAllocationsChange(updated, refStr, updated[0]?.debtId);
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: MANUAL TEXT INPUT */}
      {mode === "MANUAL" && (
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 pl-1">
            Ketik Manual Referensi Hutang:
          </label>
          <input
            type="text"
            value={refHutang}
            onChange={(e) => {
              onRefHutangChange(e.target.value);
              onAllocationsChange([], e.target.value, undefined);
            }}
            placeholder="Ketik manual nama kreditur / referensi hutang..."
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
          />
        </div>
      )}

      {/* Allocation Status Indicator */}
      {mode !== "MANUAL" && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-rose-100 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Total Potongan Hutang:</span>
            <span className={isMatch ? "text-emerald-700 font-extrabold" : diff > 0 ? "text-amber-700 font-extrabold" : "text-rose-700 font-extrabold"}>
              Rp {totalAllocated.toLocaleString("id-ID")}
            </span>
            <span className="text-slate-400">/ Transaksi: Rp {targetAmtNumber.toLocaleString("id-ID")}</span>
          </div>

          <div className="text-[11px]">
            {isMatch ? (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> Alokasi pas dengan nominal transaksi
              </span>
            ) : diff > 0 ? (
              <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold flex items-center gap-1">
                <AlertCircle size={13} /> Sisa belum dialokasikan: Rp {diff.toLocaleString("id-ID")}
              </span>
            ) : totalAllocated > 0 ? (
              <span className="text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 font-bold flex items-center gap-1">
                <AlertCircle size={13} /> Alokasi melebihi transaksi: Rp {Math.abs(diff).toLocaleString("id-ID")}
              </span>
            ) : (
              <span className="text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                Belum ada nota yang dialokasikan
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
