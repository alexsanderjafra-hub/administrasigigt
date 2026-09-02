/**
 * Centralized Contact & Creditor Name Normalization Helper
 * Unifies all split naming variations (e.g. jidan -> JIDAN RAMADHAN, faisal -> FAISAL MUSTOPA, yasin -> MUHAMMAD YASIN)
 * across the debt, receivables, and financial management systems.
 */

export const normalizeContactName = (name?: string | null): string => {
  if (!name || typeof name !== "string") return "Tanpa Nama";
  const trimmed = name.trim();
  if (!trimmed || trimmed === "-" || trimmed === "undefined" || trimmed === "null") {
    return "Tanpa Nama";
  }

  const upper = trimmed.toUpperCase();

  // 1. FAISAL MUSTOPA
  // Matches: Faisal, FAISAL, Faisal Mustopa, FAISAL MUSTOPA, Faisal Mustopa (Admin), FAISAL MUSTOPA (ADMIN), MUSTOPA
  if (
    upper.includes("FAISAL") ||
    upper.includes("MUSTOPA")
  ) {
    return "FAISAL MUSTOPA";
  }

  // 2. JIDAN RAMADHAN
  // Matches: Jidan, JIDAN, Jidan Ramadhan, JIDAN RAMADHAN, jidan ramadhan
  if (
    upper.includes("JIDAN") ||
    upper.includes("RAMADHAN")
  ) {
    return "JIDAN RAMADHAN";
  }

  // 3. MUHAMMAD YASIN
  // Matches: Yasin, YASIN, BANG YASIN, Bang Yasin, BANG YASIN OWNER PT, MUHAMMAD YASIN, Muhammad Yasin, Muhammad Yasin (Owner), PAK YASIN, M YASIN, M. YASIN
  if (
    upper.includes("YASIN")
  ) {
    return "MUHAMMAD YASIN";
  }

  // 4. WELI MAHESA
  // Matches: Weli, WELI, Weli Mahesa, WELI MAHESA
  if (upper.includes("WELI") || upper.includes("MAHESA")) {
    return "WELI MAHESA";
  }

  // 5. WINGGI APRIYANTO
  // Matches: Winggi, WINGGI, Winggi Apriyanto, WINGGI APRIYANTO
  if (upper.includes("WINGGI") || upper.includes("APRIYANTO")) {
    return "WINGGI APRIYANTO";
  }

  // 6. PAK DODO INVESTOR
  // Matches: Dodo, Pak Dodo, PAK DODO, DODO INVESTOR
  if (upper.includes("DODO")) {
    return "PAK DODO INVESTOR";
  }

  // 7. YOGA
  if (upper === "YOGA" || upper.includes("YOGA")) {
    return "YOGA";
  }

  // 8. FAUZYAWAN / PANJUL
  if (upper.includes("PANJUL") || upper.includes("FAUZYAWAN")) {
    return "FAUZYAWAN / PANJUL";
  }

  // 9. IKA
  if (upper === "IKA" || upper.startsWith("IKA ")) {
    return "IKA";
  }

  // Return clean uppercase for companies/projects/vendors (e.g. PT. TOOLMATE ENVIRO INDONESIA, PT. DW TECHNIC, PT. TTI, etc.)
  return upper;
};

/**
 * Checks if two contact names resolve to the exact same canonical person or company
 */
export const isSameContact = (nameA?: string | null, nameB?: string | null): boolean => {
  if (!nameA || !nameB) return false;
  return normalizeContactName(nameA) === normalizeContactName(nameB);
};
