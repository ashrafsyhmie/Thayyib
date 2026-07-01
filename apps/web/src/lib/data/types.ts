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
  contact: string;
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

export type Company = {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  industrySector: string;
  primaryContactEmail: string;
};

export type AppData = {
  company: Company;
  suppliers: Supplier[];
  documents: ComplianceDocument[];
  checklistGroups: ChecklistGroup[];
  notifications: NotificationItem[];
  setupMode: boolean;
};

