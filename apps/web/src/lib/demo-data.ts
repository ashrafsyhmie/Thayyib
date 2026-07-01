import {
  Bell,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Settings,
  Store,
} from "lucide-react";
import type {
  AppData,
  ChecklistGroup,
  ComplianceDocument,
  NotificationItem,
  Supplier,
} from "@/lib/data/types";

export const navigationItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Suppliers", href: "/suppliers", icon: Store },
  { label: "Documents", href: "/documents", icon: FileText },
  {
    label: "Audit Readiness",
    href: "/audit-readiness",
    icon: ClipboardCheck,
  },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const suppliers: Supplier[] = [
  {
    id: "demo-supplier-1",
    name: "Global Meats Inc.",
    category: "Poultry",
    status: "Valid",
    expiryDate: "Oct 12, 2026",
    contact: "Sarah Jenkins",
    documents: 8,
  },
  {
    id: "demo-supplier-2",
    name: "Crescent Dairy",
    category: "Dairy Products",
    status: "Expiring Soon",
    expiryDate: "Jul 10, 2026",
    contact: "Omar Farooq",
    documents: 5,
  },
  {
    id: "demo-supplier-3",
    name: "Eastern Spices Co.",
    category: "Spices & Seasonings",
    status: "Valid",
    expiryDate: "May 15, 2027",
    contact: "Aisha Khan",
    documents: 6,
  },
  {
    id: "demo-supplier-4",
    name: "Prime Ingredients",
    category: "Additives",
    status: "Expired",
    expiryDate: "May 30, 2026",
    contact: "David Chen",
    documents: 3,
  },
  {
    id: "demo-supplier-5",
    name: "Pure Extracts Ltd.",
    category: "Flavorings",
    status: "Missing Certificate",
    expiryDate: "N/A",
    contact: "Linda Roberts",
    documents: 2,
  },
];

export const documents: ComplianceDocument[] = [
  {
    id: "demo-document-1",
    name: "Global Meats Halal Certificate",
    type: "Supplier Certificate",
    supplier: "Global Meats Inc.",
    uploadedAt: "Jun 18, 2026",
    expiryDate: "Oct 12, 2026",
    status: "Valid",
  },
  {
    id: "demo-document-2",
    name: "Crescent Dairy Renewal Certificate",
    type: "Supplier Certificate",
    supplier: "Crescent Dairy",
    uploadedAt: "May 29, 2026",
    expiryDate: "Jul 10, 2026",
    status: "Expiring Soon",
  },
  {
    id: "demo-document-3",
    name: "Q3 Sanitation Standard Operating Procedure",
    type: "SOP Document",
    supplier: "Internal",
    uploadedAt: "Jun 02, 2026",
    expiryDate: "N/A",
    status: "Needs Review",
  },
  {
    id: "demo-document-4",
    name: "Ingredient Traceability Log - Batch A124",
    type: "Ingredient List",
    supplier: "Pure Ingredients Co.",
    uploadedAt: "Jun 21, 2026",
    expiryDate: "N/A",
    status: "Complete",
  },
  {
    id: "demo-document-5",
    name: "Prime Ingredients Certificate",
    type: "Supplier Certificate",
    supplier: "Prime Ingredients",
    uploadedAt: "Jan 05, 2026",
    expiryDate: "May 30, 2026",
    status: "Expired",
  },
];

export const checklistGroups: ChecklistGroup[] = [
  {
    title: "Supplier Certificates",
    completed: 4,
    total: 5,
    items: [
      {
        id: "demo-checklist-1",
        label: "Valid halal certificates for tier 1 suppliers",
        detail: "Last verified: Jun 20, 2026",
        status: "Complete",
        action: "View",
      },
      {
        id: "demo-checklist-2",
        label: "Cross-contamination prevention agreements signed",
        detail: "Last verified: Jun 12, 2026",
        status: "Complete",
        action: "View",
      },
      {
        id: "demo-checklist-3",
        label: "Annual facility audit reports collected",
        detail: "Missing 1 document from Prime Ingredients",
        status: "Missing Document",
        action: "Update",
      },
    ],
  },
  {
    title: "Product Ingredients",
    completed: 3,
    total: 3,
    items: [
      {
        id: "demo-checklist-4",
        label: "Ingredient traceability logs updated",
        detail: "All active batches have uploaded records",
        status: "Complete",
        action: "View",
      },
    ],
  },
  {
    title: "SOP Documents",
    completed: 2,
    total: 3,
    items: [
      {
        id: "demo-checklist-5",
        label: "Halal Assurance System manual",
        detail: "Version 2.1 approved",
        status: "Complete",
        action: "View",
      },
      {
        id: "demo-checklist-6",
        label: "Sanitation Standard Operating Procedure",
        detail: "Needs Q3 update",
        status: "Needs Review",
        action: "Upload",
      },
    ],
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "demo-notification-1",
    title: "Crescent Dairy certificate expires soon",
    detail: "Certificate expires on Jul 10, 2026.",
    priority: "High",
    time: "Today",
    unread: true,
  },
  {
    id: "demo-notification-2",
    title: "Prime Ingredients certificate expired",
    detail: "Please upload an updated supplier certificate.",
    priority: "High",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "demo-notification-3",
    title: "Q3 sanitation SOP needs review",
    detail: "Checklist item is waiting for updated evidence.",
    priority: "Medium",
    time: "Jun 25, 2026",
    unread: false,
  },
  {
    id: "demo-notification-4",
    title: "Eastern Spices Co. documents updated",
    detail: "New audit evidence was linked to the supplier profile.",
    priority: "Info",
    time: "Jun 22, 2026",
    unread: false,
  },
];

export const demoAppData: AppData = {
  setupMode: true,
  company: {
    id: "demo-company",
    name: "Thayyib Demo Foods",
    registrationNumber: "MY-9482710",
    address: "120 Compliance Way, Shah Alam, Selangor",
    industrySector: "Food Manufacturing",
    primaryContactEmail: "compliance@thayyibdemo.com",
  },
  suppliers,
  documents,
  checklistGroups,
  notifications,
};
