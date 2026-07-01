import type {
  DocumentStatus,
  DocumentType,
  SupplierStatus,
} from "@/lib/data/types";

const statusLabels: Record<string, SupplierStatus | DocumentStatus> = {
  valid: "Valid",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
  missing_certificate: "Missing Certificate",
  missing_document: "Missing Document",
  complete: "Complete",
  needs_review: "Needs Review",
};

const documentTypeLabels: Record<string, DocumentType> = {
  supplier_certificate: "Supplier Certificate",
  ingredient_list: "Ingredient List",
  sop_document: "SOP Document",
  audit_evidence: "Audit Evidence",
  other: "Other",
};

export function formatStatus(value: string | null | undefined) {
  if (!value) {
    return "Needs Review";
  }

  return statusLabels[value] ?? "Needs Review";
}

export function formatDocumentType(value: string | null | undefined) {
  if (!value) {
    return "Other";
  }

  return documentTypeLabels[value] ?? "Other";
}

export function toDatabaseStatus(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "_");
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function getCertificateStatus(
  expiryDate: string | null | undefined,
  referenceDate = new Date(),
): SupplierStatus {
  if (!expiryDate) {
    return "Missing Certificate";
  }

  const now = referenceDate;
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilExpiry < 0) {
    return "Expired";
  }

  if (daysUntilExpiry <= 30) {
    return "Expiring Soon";
  }

  return "Valid";
}

export function toDatabaseSupplierStatus(status: SupplierStatus) {
  const values: Record<SupplierStatus, string> = {
    Valid: "valid",
    "Expiring Soon": "expiring_soon",
    Expired: "expired",
    "Missing Certificate": "missing_certificate",
  };

  return values[status];
}

export function toDatabaseDocumentStatus(status: DocumentStatus) {
  const values: Record<DocumentStatus, string> = {
    Valid: "valid",
    "Expiring Soon": "expiring_soon",
    Expired: "expired",
    "Missing Document": "missing_document",
    Complete: "complete",
    "Needs Review": "needs_review",
  };

  return values[status];
}

export function toDatabaseDocumentType(type: DocumentType) {
  const values: Record<DocumentType, string> = {
    "Supplier Certificate": "supplier_certificate",
    "Ingredient List": "ingredient_list",
    "SOP Document": "sop_document",
    "Audit Evidence": "audit_evidence",
    Other: "other",
  };

  return values[type];
}
