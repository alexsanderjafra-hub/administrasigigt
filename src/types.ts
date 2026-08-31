export interface UserProfile {
  id: string;
  name: string;
  role: string;
  site: string;
  avatar: string;
  employeeId?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  timestamp: number;
  type: 'IN' | 'OUT';
  selfieUrl: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface AttendanceStatus {
  isClockedIn: boolean;
  todayRecord: AttendanceRecord | null;
}

export interface FieldReport {
  id?: string;
  userId: string;
  userName: string;
  type: 'PROJECT' | 'EXPENSE';
  title: string;
  location: string;
  status: 'APPROVED' | 'PENDING' | 'PROSES';
  priority: 'High' | 'Medium' | 'Low';
  time: string;
  img: string;
  description?: string;
  syncStatus?: 'synced' | 'pending';
  lat?: number;
  lng?: number;
}

export interface Employee {
  id: string;
  username: string; // Used for linking data
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  dailyRate?: number;
  overtimeRate?: number;
  bagian?: string;
  assignedProjectIds: string[];
  projectStatus?: string;
  employeeId?: string;
}

export interface LeaveRequest {
  id: string;
  type: 'IZIN' | 'CUTI';
  name: string;
  date: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: number;
}

export interface ReimbursementClaim {
  id: string;
  userId: string;
  userName: string;
  category: string;
  amount: number;
  description: string;
  receiptImg: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: number;
}

export interface CashAdvance {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  client?: string;
  location: string;
  lat?: number;
  lng?: number;
  startDate: string;
  endDate: string;
  status: string;
  isActive?: boolean;
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
  manager: string;
  managerId?: string;
  managerName?: string;
  picId?: string;
  picName?: string;
  description: string;
  tasks: { id: string, name: string, status: 'Done' | 'In Progress' | 'Todo' }[];
  contractValue?: number;
  hasPpn?: boolean;
  totalInvoices?: number;
  totalPaid?: number;
  remainingReceivables?: number;
  totalCost?: number;
  profit?: number;
  operationalCost?: number;
  warrantyEndDate?: string;
  timeline?: {
    id: string;
    date: string;
    time: string;
    user: string;
    status: string;
    notes: string;
  }[];
  uploadedDocuments?: {
    id: string;
    name: string;
    type: 'SPK' | 'PO' | 'BAST' | 'Supported' | 'Lainnya';
    uploadedAt: string;
    uploadedBy: string;
    fileUrl?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  }[];
  schedules?: {
    id: string;
    workName: string;
    startDate: string;
    endDate: string;
    progress: number;
  }[];
  paymentTerms?: {
    id: string;
    name: string;
    percentage: number;
    amount: number;
    status: 'Belum Dibuat' | 'Menunggu Pembayaran' | 'Dibayar';
    invoiceNumber?: string;
    invoiceId?: string;
  }[];
  rabItems?: {
    id: string;
    description: string;
    qty: number;
    unit: string;
    price: number;
    total: number;
    notes?: string;
  }[];
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  assignedTo: string;
  assignedToName?: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'In Review' | 'Done';
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  deadline: number;
}

export interface Asset {
  id: string;
  name: string;
  brand: string;
  modelType: string;
  price: number;
  category: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Broken';
  userId?: string;
  userName?: string;
  lastMaintenance: number;
  maintenanceInfo?: string;
  purchaseDate?: number;
}

export interface QuotationItem {
  id: string;
  description: string;
  vol: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  number: string;
  date: string;
  recipient: string;
  attention: string;
  jobDescription: string;
  items: QuotationItem[];
  subTotal: number;
  tax: number;
  grandTotal: number;
  notes: string;
  preparedBy: string;
  userId?: string;
  createdAt: number;
  boqProjectId?: string;
  status?: 'Draft' | 'Terkirim' | 'Disetujui' | 'Ditolak' | 'Jadi Proyek';
  attachmentName?: string;
  attachmentBase64?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
  timestamp: number;
}

export interface Document {
  id?: string;
  title: string;
  type: string;
  description?: string;
  fileUrl: string;
  createdBy: string;
  createdAt: string;
  version?: number;
  size?: string;
  extension?: string;
}

export interface SuratJalan {
  id: string;
  number: string;
  recipient: string;
  address: string;
  date: string;
  items: {
    qty: string;
    unit: string;
    name: string;
  }[];
  notes: string;
  timestamp: number;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  flowType?: 'IN' | 'OUT_BANK_DIRECT' | 'OUT_PERSONAL_TRANSFER' | 'OUT_PERSONAL_SPEND' | 'PERSONAL_TALANGAN_REIMBURSE';
  personalHolder?: string; // Name of staff or owner currently holding or spending the money
  amount: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  adminFee?: number;
  category: string;
  description: string;
  referenceId?: string; // e.g. project ID or reimbursement ID
  projectId?: string; // Linked project ID
  recordedBy: string;
  timestamp: number;
  customId?: string; // Formatted transaction ID like INC-030526-001, BNK-030626-001, PRS-030626-001
  sumberDana?: string; // Funds source or private wallet source e.g. REKENING PT, PT.TTI
  senderName?: string; // Name of sender / pengirim dana for income transactions
  rekPenerima?: string; // Recipient account / destination staff
  refIdBank?: string; // References a BNK- id or customId
  refPiutang?: string; // Reference client receivable link
  refHutang?: string; // Reference supplier debt link
  linkedDebtId?: string; // Explicitly stored reference to the linked debt/receivable ID
  totalGaji?: number; // Total gross salary
  potonganKasbon?: number; // Kasbon deduction
  penerimaKasbon?: string; // Who receives the kasbon
  pemilikUangPribadi?: string; // Whose personal money is used
  terminName?: string;
  terminDescription?: string;
  terminPercentage?: string | number;
  terminInvoiceDate?: string;
  terminDueDate?: string;
  terminPaymentDate?: string;
  terminStatus?: 'LUNAS' | 'BELUM LUNAS' | 'BELUM BAYAR';
  terminNotes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  device?: string;
  timestamp: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'UMUM' | 'URGENT' | 'PROYEK' | 'MEETING' | 'LIBUR';
  createdBy: string;
  timestamp: number;
  eventDate?: string;
  integrateCalendar?: boolean;
  eventType?: 'MEETING' | 'HOLIDAY' | 'OTHER';
  reminderId?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  projects: string[]; // project IDs
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  projectId: string;
  amount: number;
  fee: number;
  tax: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  type: 'ROUTINE' | 'EMERGENCY';
  description: string;
  cost: number;
  performedBy: string;
  date: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
  financialRecordId?: string;
  recordedBy: string;
  status?: string;
}

export interface Term {
  name: string;
  description: string;
  amount: number;
  expectedAmount?: number;
  percentage: number;
  invoiceDate?: string;
  dueDate?: string;
  paymentDate?: string;
  status: 'LUNAS' | 'BELUM LUNAS' | 'BELUM BAYAR';
  notes?: string;
  financialRecordId?: string;
}

export interface DebtRecord {
  id: string;
  customId?: string; // Automatically generated recognizable ID
  projectId?: string; // Optional link to project
  type: 'HUTANG' | 'PIUTANG'; // HUTANG = Debt, PIUTANG = Receivable
  title: string;
  contactName: string;
  amount: number;
  dueDate: string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  description?: string;
  recordedBy: string;
  timestamp: number;
  payments?: DebtPayment[];
  terms?: Term[];
}

export interface Assignment {
  id: string;
  projectId: string;
  employeeIds: string[];
  taskDescription: string;
  deadline: string;
  status: 'PENDING' | 'ONGOING' | 'DONE';
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  type: 'PAYROLL' | 'EVENT' | 'MEETING' | 'OTHER';
  recurrence?: 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  createdBy: string;
  createdAt: number;
}

export interface CompanyProfile {
  name: string;
  vision: string;
  mission: string;
  history: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  logo?: string;
}

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  permissions: ScreenId[];
  color: string;
  userCount?: number;
}

export interface DailyReport {
  id: string;
  projectId: string;
  projectName: string;
  date: number;
  clientName: string;
  location: string;
  workType: string;
  contractor: string;
  pageNumber: number;
  totalPages: number;
  staff: { jabatan: string, jumlah: number }[];
  tools: string[];
  activities: string[];
  materials: { jenis: string, volume?: string, volumeKumulatif?: string }[];
  workHours: number[]; 
  weather: { hour: number, type: 'Cerah' | 'Hujan' | 'Mendung' }[];
  overtime: number;
  notes: string | string[];
  nextPlan: string | string[];
  obstacles: string | string[];
  photos: string[];
  contractorLogo?: string;
  clientLogo?: string;
  submittedBy: string;
  submittedByName: string;
  submittedByRole: string;
  timestamp: number;
}

export type ScreenId = 
  | 'splash' 
  | 'login' 
  | 'register' 
  | 'home' 
  | 'laporan-lapangan' 
  | 'data-karyawan' 
  | 'reimburse' 
  | 'izin-cuti' 
  | 'slip-gaji' 
  | 'absen-masuk' 
  | 'report-detail' 
  | 'all-projects' 
  | 'project-detail' 
  | 'staff-detail'
  | 'profile'
  | 'company-profile'
  | 'admin-dashboard'
  | 'admin-projects'
  | 'admin-approval'
  | 'admin-leave-approval'
  | 'admin-inventory'
  | 'admin-tracking'
  | 'admin-payroll'
  | 'admin-payroll-settings'
  | 'admin-tasks'
  | 'admin-docs'
  | 'admin-audit'
  | 'admin-settings'
  | 'admin-expenses'
  | 'admin-schedule'
  | 'admin-notifications'
  | 'admin-announcements'
  | 'admin-performance'
  | 'admin-clients'
  | 'admin-invoices'
  | 'admin-maintenance'
  | 'admin-roles'
  | 'admin-profile'
  | 'admin-surat-jalan'
  | 'admin-quotations'
  | 'admin-analytics'
  | 'admin-finance'
  | 'admin-debt'
  | 'admin-kasbon'
  | 'admin-ekatalog'
  | 'task-detail'
  | 'admin-sheets'
  | 'admin-po'
  | 'admin-daily-reports'
  | 'absen-pulang';

export interface PurchaseOrderItem {
  no: number;
  description: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export interface PurchaseOrder {
  id?: string;
  poNo: string;
  date: string;
  vendorName: string;
  vendorAddress: string;
  buyerName: string;
  buyerAddress: string;
  buyerEmail: string;
  buyerPhone: string;
  items: PurchaseOrderItem[];
  note: string;
  ketentuan: string[];
  signerName: string;
  signerRole: string;
  totalPrice: number;
  ppnPercent: number;
  ppnAmount: number;
  grandTotal: number;
  timestamp: number;
  status?: 'DRAFT' | 'SENT' | 'COMPLETED' | 'CANCELLED';
}

export const isProjectActive = (p?: Partial<Project> | null): boolean => {
  if (!p) return false;
  if (p.isActive === false) return false;
  if (p.isActive === true) return true;
  const inactiveStatuses = [
    'Completed',
    'Closed',
    'Ditolak',
    'Nonaktif',
    'Selesai',
    'Selesai Pekerjaan',
    'Cancelled',
    'Batal'
  ];
  if (p.status && inactiveStatuses.includes(p.status)) {
    return false;
  }
  return true;
};

