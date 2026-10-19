/**
 * Format nama file PDF invoice sesuai dengan permintaan:
 * Format: INV_[NOMOR]_[TAGIHAN/DP%]_PT_[NAMA_KLIEN].pdf
 * Contoh:
 * - INV_2026_1234_DP50%_PT_CAHAYA_ABADI.pdf
 * - INV_2026_1234_TERMIN1_30%_PT_INDOMARCO.pdf
 * - INV_2026_1234_PT_CAHAYA_ABADI.pdf (jika 100% / tanpa termin)
 */
export const formatInvoicePdfFileName = (
  invNumber: string,
  isDownPayment: boolean = false,
  dpPercent: number = 50,
  dpLabel: string = "DOWN PAYMENT (DP)",
  clientOrPtName: string = ""
): string => {
  // 1. Bersihkan nomor invoice
  let cleanNo = (invNumber || "INV")
    .trim()
    .replace(/\//g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");

  if (!cleanNo.toUpperCase().startsWith("INV")) {
    cleanNo = `INV_${cleanNo}`;
  }

  // 2. Tagihan indicator (DP / Termin & Persentase)
  let tagihanTag = "";
  if (isDownPayment) {
    const rawLabel = (dpLabel || "DP").toUpperCase().trim();
    let shortLabel = "DP";
    if (rawLabel.includes("DOWN PAYMENT") || rawLabel === "DP") {
      shortLabel = "DP";
    } else if (rawLabel.includes("TERMIN")) {
      const match = rawLabel.match(/TERMIN\s*([0-9]+)/i);
      shortLabel = match ? `TERMIN${match[1]}` : "TERMIN";
    } else if (rawLabel.includes("PELUNASAN")) {
      shortLabel = "PELUNASAN";
    } else {
      const sanitized = rawLabel.replace(/[^A-Z0-9]/g, "");
      shortLabel = sanitized.slice(0, 10) || "DP";
    }
    const pct = dpPercent !== undefined && dpPercent !== null ? dpPercent : 50;
    tagihanTag = `_${shortLabel}${pct}%`;
  }

  // 3. Nama Klien / Perusahaan
  let cleanPt = (clientOrPtName || "")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  if (cleanPt) {
    cleanPt = `_${cleanPt}`;
  }

  const fullName = `${cleanNo}${tagihanTag}${cleanPt}`.replace(/_+/g, "_");
  return `${fullName}.pdf`;
};
