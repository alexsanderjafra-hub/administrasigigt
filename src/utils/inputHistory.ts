import { DailyReport, FieldReport } from "../types";

export type ReportHistoryField =
  | "contractor"
  | "clientName"
  | "location"
  | "workType"
  | "staff_jabatan"
  | "tools"
  | "materials"
  | "activities"
  | "obstacles"
  | "nextPlan"
  | "notes"
  | "general_site"
  | "general_title"
  | "general_description";

const HISTORY_STORAGE_KEY = "wf_report_input_history_v1";
const MAX_ITEMS_PER_FIELD = 35;

type HistoryMap = Record<string, string[]>;

function readHistoryMap(): HistoryMap {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeHistoryMap(map: HistoryMap): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

function normalizeText(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.replace(/\s+/g, " ").trim();
}

export function getLocalInputHistory(field: ReportHistoryField): string[] {
  const map = readHistoryMap();
  const list = map[field];
  return Array.isArray(list) ? list.filter((x) => typeof x === "string" && x.trim().length > 0) : [];
}

export function saveInputHistoryValue(field: ReportHistoryField, rawValue: unknown): void {
  const val = normalizeText(rawValue);
  if (val.length < 2) return;
  const map = readHistoryMap();
  const existing = Array.isArray(map[field]) ? map[field] : [];
  const filtered = existing.filter((item) => normalizeText(item).toLowerCase() !== val.toLowerCase());
  map[field] = [val, ...filtered].slice(0, MAX_ITEMS_PER_FIELD);
  writeHistoryMap(map);
}

export function removeLocalInputHistoryValue(field: ReportHistoryField, rawValue: string): void {
  const target = normalizeText(rawValue).toLowerCase();
  if (!target) return;
  const map = readHistoryMap();
  const existing = Array.isArray(map[field]) ? map[field] : [];
  map[field] = existing.filter((item) => normalizeText(item).toLowerCase() !== target);
  writeHistoryMap(map);
}

export function saveDailyReportToHistory(report: Partial<DailyReport>): void {
  if (!report) return;
  saveInputHistoryValue("contractor", report.contractor);
  saveInputHistoryValue("clientName", report.clientName);
  saveInputHistoryValue("location", report.location);
  saveInputHistoryValue("workType", report.workType);

  if (Array.isArray(report.staff)) {
    report.staff.forEach((s) => saveInputHistoryValue("staff_jabatan", s?.jabatan));
  }
  if (Array.isArray(report.tools)) {
    report.tools.forEach((t) =>
      saveInputHistoryValue("tools", typeof t === "string" ? t : (t as any)?.name),
    );
  }
  if (Array.isArray(report.materials)) {
    report.materials.forEach((m) =>
      saveInputHistoryValue("materials", typeof m === "string" ? m : m?.jenis || (m as any)?.name),
    );
  }
  if (Array.isArray(report.activities)) {
    report.activities.forEach((a) => saveInputHistoryValue("activities", a));
  }
  const obsList = Array.isArray(report.obstacles)
    ? report.obstacles
    : report.obstacles
      ? [report.obstacles]
      : [];
  obsList.forEach((o) => saveInputHistoryValue("obstacles", o));

  const planList = Array.isArray(report.nextPlan)
    ? report.nextPlan
    : report.nextPlan
      ? [report.nextPlan]
      : [];
  planList.forEach((p) => saveInputHistoryValue("nextPlan", p));

  const noteList = Array.isArray(report.notes)
    ? report.notes
    : report.notes
      ? [report.notes]
      : [];
  noteList.forEach((n) => saveInputHistoryValue("notes", n));
}

export function saveGeneralReportToHistory(report: {
  location?: string;
  title?: string;
  description?: string;
}): void {
  if (!report) return;
  saveInputHistoryValue("general_site", report.location);
  saveInputHistoryValue("general_title", report.title);
  saveInputHistoryValue("general_description", report.description);
}

export function buildCombinedFieldHistory(
  field: ReportHistoryField,
  dailyReports: DailyReport[] = [],
  generalReports: FieldReport[] = [],
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  const pushUnique = (raw: unknown) => {
    const clean = normalizeText(raw);
    if (clean.length < 2) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(clean);
  };

  // 1. Local input history first (newest typed by user on this device)
  getLocalInputHistory(field).forEach(pushUnique);

  // 2. Existing submitted daily reports sorted newest first
  const sortedDaily = [...dailyReports].sort(
    (a, b) => new Date(b.timestamp || b.date || 0).getTime() - new Date(a.timestamp || a.date || 0).getTime(),
  );

  for (const r of sortedDaily) {
    if (!r) continue;
    switch (field) {
      case "contractor":
        pushUnique(r.contractor);
        break;
      case "clientName":
        pushUnique(r.clientName);
        break;
      case "location":
        pushUnique(r.location);
        break;
      case "workType":
        pushUnique(r.workType);
        break;
      case "staff_jabatan":
        if (Array.isArray(r.staff)) r.staff.forEach((s) => pushUnique(s?.jabatan));
        break;
      case "tools":
        if (Array.isArray(r.tools)) {
          r.tools.forEach((t) => pushUnique(typeof t === "string" ? t : (t as any)?.name));
        }
        break;
      case "materials":
        if (Array.isArray(r.materials)) {
          r.materials.forEach((m) =>
            pushUnique(typeof m === "string" ? m : m?.jenis || (m as any)?.name),
          );
        }
        break;
      case "activities":
        if (Array.isArray(r.activities)) r.activities.forEach(pushUnique);
        break;
      case "obstacles":
        if (Array.isArray(r.obstacles)) r.obstacles.forEach(pushUnique);
        else pushUnique(r.obstacles);
        break;
      case "nextPlan":
        if (Array.isArray(r.nextPlan)) r.nextPlan.forEach(pushUnique);
        else pushUnique(r.nextPlan);
        break;
      case "notes":
        if (Array.isArray(r.notes)) r.notes.forEach(pushUnique);
        else pushUnique(r.notes);
        break;
      default:
        break;
    }
    if (result.length >= MAX_ITEMS_PER_FIELD) break;
  }

  // 3. Existing submitted general reports sorted newest first
  if (
    field === "general_site" ||
    field === "general_title" ||
    field === "general_description" ||
    field === "location"
  ) {
    const sortedGeneral = [...generalReports].sort(
      (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0),
    );
    for (const g of sortedGeneral) {
      if (!g) continue;
      if (field === "general_site" || field === "location") pushUnique(g.location);
      if (field === "general_title") pushUnique(g.title);
      if (field === "general_description") pushUnique(g.description);
      if (result.length >= MAX_ITEMS_PER_FIELD) break;
    }
  }

  return result.slice(0, MAX_ITEMS_PER_FIELD);
}
