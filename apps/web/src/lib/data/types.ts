export type SupplierStatus =
  | "Valid"
  | "Expiring Soon"
  | "Expired"
  | "Missing Certificate";

export type DocumentType =
  | "Supplier Certificate"
  | "Ingredient List"
  | "SOP Document"
  | "Audit Evidence"
  | "Other";

export type DocumentStatus =
  | "Valid"
  | "Expiring Soon"
  | "Expired"
  | "Missing Document"
  | "Complete"
  | "Needs Review";

export type Supplier = {
  id: string;
  name: string;
  category: string;
  status: SupplierStatus;
  expiryDate: string;
  expiryDateRaw?: string;
  contact: string;
  contactEmail: string;
  notes: string;
  documents: number;
};

export type ComplianceDocument = {
  id: string;
  name: string;
  type: DocumentType;
  supplier: string;
  supplierId?: string;
  uploadedAt: string;
  expiryDate: string;
  expiryDateRaw?: string;
  status: DocumentStatus;
  storagePath?: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
  status: DocumentStatus;
  action: string;
};

export type ChecklistGroup = {
  title: string;
  completed: number;
  total: number;
  items: ChecklistItem[];
};

export type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  priority: "High" | "Medium" | "Info";
  time: string;
  unread: boolean;
};

export type HalalRiskLevel = "Low" | "Medium" | "High" | "Unknown";

export type AiFinding = {
  item: string;
  risk: string;
  recommendation: string;
  riskLevel: HalalRiskLevel;
};

export type AiSource = {
  title: string;
  url?: string;
};

export type AiAssessment = {
  id: string;
  documentId?: string;
  productName: string;
  brandName: string;
  inputText: string;
  riskSummary: string;
  riskLevel: HalalRiskLevel;
  recommendationText: string;
  findings: AiFinding[];
  sources: AiSource[];
  confidenceScore: number;
  modelName: string;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  supplier: string;
  supplierId?: string;
  linkedDocument: string;
  documentId?: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  receivedDate: string;
  receivedDateRaw?: string;
  expiryDate: string;
  expiryDateRaw?: string;
  halalStatus: DocumentStatus;
  riskLevel: HalalRiskLevel;
  storageLocation: string;
  notes: string;
};

export type Company = {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  industrySector: string;
  primaryContactEmail: string;
};

export type UserProfile = {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
};

export type AppData = {
  company: Company;
  userProfile: UserProfile;
  suppliers: Supplier[];
  documents: ComplianceDocument[];
  checklistGroups: ChecklistGroup[];
  notifications: NotificationItem[];
  aiAssessments: AiAssessment[];
  inventoryItems: InventoryItem[];
  setupMode: boolean;
};
