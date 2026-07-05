"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  analyzeIngredientRisk,
  getFallbackIngredientKnowledge,
  mergeIngredientKnowledge,
  type IngredientRiskKnowledge,
} from "@/lib/ai/risk-analyzer";
import { analyzeWithOpenAi, hasOpenAiKey } from "@/lib/ai/openai-analyzer";
import { extractTextFromUpload } from "@/lib/ai/text-extraction";
import {
  getCertificateStatus,
  toDatabaseDocumentStatus,
  toDatabaseDocumentType,
  toDatabaseRiskLevel,
  toDatabaseSupplierStatus,
} from "@/lib/data/format";
import type { DocumentStatus, DocumentType, HalalRiskLevel } from "@/lib/data/types";
import { getCurrentCompanyId } from "@/lib/data/app-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type IngredientRiskRow = {
  name: string;
  common_names: string[];
  e_code: string | null;
  risk_level: "low" | "medium" | "high" | "unknown";
  risk_reason: string;
  source_name: string;
  source_url: string | null;
  confidence_score: number;
};

type AuditDocumentRow = {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
};

const documentTypes: DocumentType[] = [
  "Supplier Certificate",
  "Ingredient List",
  "SOP Document",
  "Audit Evidence",
  "Other",
];

const documentStatuses: DocumentStatus[] = [
  "Valid",
  "Expiring Soon",
  "Expired",
  "Missing Document",
  "Complete",
  "Needs Review",
];

const halalRiskLevels: HalalRiskLevel[] = ["Low", "Medium", "High", "Unknown"];
const maxUploadBytes = 10 * 1024 * 1024;
const allowedUploadExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".txt"];

function required(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required`);
  }

  return value.trim();
}

function optional(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function requiredNumber(formData: FormData, key: string) {
  const value = Number(required(formData, key));

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${key} must be a positive number`);
  }

  return value;
}

function requiredDocumentType(formData: FormData, key = "documentType") {
  const value = required(formData, key);

  if (!documentTypes.includes(value as DocumentType)) {
    throw new Error("Invalid document type");
  }

  return value as DocumentType;
}

function requiredDocumentStatus(formData: FormData, key: string) {
  const value = required(formData, key);

  if (!documentStatuses.includes(value as DocumentStatus)) {
    throw new Error("Invalid document status");
  }

  return value as DocumentStatus;
}

function requiredRiskLevel(formData: FormData, key: string) {
  const value = required(formData, key);

  if (!halalRiskLevels.includes(value as HalalRiskLevel)) {
    throw new Error("Invalid risk level");
  }

  return value as HalalRiskLevel;
}

function validateUploadFile(file: File) {
  if (file.size > maxUploadBytes) {
    throw new Error("File must be 10MB or smaller");
  }

  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = allowedUploadExtensions.some((extension) =>
    lowerName.endsWith(extension),
  );

  if (!hasAllowedExtension) {
    throw new Error("Unsupported file type");
  }
}

export async function createSupplierAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/suppliers?error=Supabase%20is%20not%20configured");
  }

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/suppliers?error=Company%20workspace%20not%20found");
  }

  const expiryDate = optional(formData, "certificateExpiryDate");
  const status = getCertificateStatus(expiryDate);
  const supabase = await createClient();

  const { error } = await supabase.from("suppliers").insert({
    company_id: companyId,
    name: required(formData, "name"),
    category: required(formData, "category"),
    contact_person: optional(formData, "contactPerson"),
    contact_email: optional(formData, "contactEmail"),
    certificate_expiry_date: expiryDate,
    certificate_status: toDatabaseSupplierStatus(status),
    notes: optional(formData, "notes"),
  });

  if (error) {
    redirect(`/suppliers?error=${encodeURIComponent(error.message)}`);
  }

  if (status !== "Valid") {
    await createNotificationIfNeeded({
      title: `Supplier ${required(formData, "name")} certificate ${status.toLowerCase()}`,
      detail: buildCertificateReminderDetail(required(formData, "name"), status, expiryDate),
      priority: "High",
      companyId,
    });
  }

  revalidatePath("/");
  revalidatePath("/suppliers");
  revalidatePath("/notifications");
  redirect("/suppliers?message=Supplier%20added");
}

export async function deleteSupplierAction(formData: FormData) {
  const supplierId = required(formData, "supplierId");
  const companyId = await getCurrentCompanyId();
  const supabase = await createClient();

  if (!companyId) {
    redirect("/suppliers?error=Company%20workspace%20not%20found");
  }

  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", supplierId)
    .eq("company_id", companyId);

  if (error) {
    redirect(`/suppliers?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/suppliers");
}

export async function updateSupplierAction(formData: FormData) {
  const supplierId = required(formData, "supplierId");
  const companyId = await getCurrentCompanyId();
  const expiryDate = optional(formData, "certificateExpiryDate");
  const status = getCertificateStatus(expiryDate);
  const supabase = await createClient();

  if (!companyId) {
    redirect(`/suppliers/${supplierId}?error=Company%20workspace%20not%20found`);
  }

  const { error } = await supabase
    .from("suppliers")
    .update({
      name: required(formData, "name"),
      category: required(formData, "category"),
      contact_person: optional(formData, "contactPerson"),
      contact_email: optional(formData, "contactEmail"),
      certificate_expiry_date: expiryDate,
      certificate_status: toDatabaseSupplierStatus(status),
      notes: optional(formData, "notes"),
    })
    .eq("id", supplierId)
    .eq("company_id", companyId);

  if (error) {
    redirect(`/suppliers/${supplierId}?error=${encodeURIComponent(error.message)}`);
  }

  if (status !== "Valid") {
    await createNotificationIfNeeded({
      title: `Supplier ${required(formData, "name")} certificate ${status.toLowerCase()}`,
      detail: buildCertificateReminderDetail(required(formData, "name"), status, expiryDate),
      priority: "High",
    });
  }

  revalidatePath("/");
  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${supplierId}`);
  revalidatePath("/notifications");
  redirect(`/suppliers/${supplierId}?message=Supplier%20updated`);
}

export async function uploadDocumentAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/documents?error=Supabase%20is%20not%20configured");
  }

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/documents?error=Company%20workspace%20not%20found");
  }

  const supabase = await createClient();
  const documentType = requiredDocumentType(formData);
  const expiryDate = optional(formData, "expiryDate");
  const supplierId = optional(formData, "supplierId");
  const submittedDocumentText = optional(formData, "documentText");
  const file = formData.get("file");
  let storagePath: string | null = null;
  let fileName: string | null = null;
  let fileSizeBytes: number | null = null;
  let contentType: string | null = null;
  let extractedText = submittedDocumentText;
  let extractionWarning: string | undefined;
  let extractionMethod: string | undefined;

  if (file instanceof File && file.size > 0) {
    try {
      validateUploadFile(file);
    } catch (error) {
      redirect(
        `/documents?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Invalid upload file",
        )}`,
      );
    }

    fileName = file.name;
    fileSizeBytes = file.size;
    contentType = file.type;

    if (!extractedText) {
      const extraction = await extractTextFromUpload(file);

      if (extraction) {
        extractedText = extraction.text;
        extractionWarning = extraction.warning;
        extractionMethod = extraction.method;
      }
    }

    storagePath = `${companyId}/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        contentType: file.type,
      });

    if (uploadError) {
      redirect(`/documents?error=${encodeURIComponent(uploadError.message)}`);
    }
  }

  const status: DocumentStatus = expiryDate
    ? getCertificateStatus(expiryDate).replace("Missing Certificate", "Needs Review") as DocumentStatus
    : "Needs Review";

  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      company_id: companyId,
      supplier_id: supplierId,
      name: required(formData, "name"),
      document_type: toDatabaseDocumentType(documentType),
      status: toDatabaseDocumentStatus(status),
      expiry_date: expiryDate,
      storage_path: storagePath,
      file_name: fileName,
      file_size_bytes: fileSizeBytes,
      content_type: contentType,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    redirect(`/documents?error=${encodeURIComponent(error.message)}`);
  }

  await updateAuditChecklistForDocument({
    companyId,
    documentType,
    documentId: document.id,
  });
  await refreshAuditReadinessForCompany(companyId);

  if (extractedText && extractedText.trim().length >= 20) {
    try {
      await saveAiAssessment({
        companyId,
        documentId: document.id,
        inputText: extractedText.trim(),
        productName: required(formData, "name"),
        brandName: null,
      });
    } catch {
      await createNotificationIfNeeded({
        companyId,
        title: `${required(formData, "name")} AI analysis needs review`,
        detail:
          "Document was uploaded, but automatic AI analysis failed. Run the AI Analyzer manually.",
        priority: "Medium",
      });
    }
  }

  if (extractionWarning) {
    await createNotificationIfNeeded({
      companyId,
      title: `${required(formData, "name")} OCR text was shortened`,
      detail: extractionWarning,
      priority: "Info",
    });
  }

  if (status !== "Valid" && status !== "Complete") {
    await createNotificationIfNeeded({
      title: `${required(formData, "name")} needs compliance review`,
      detail: "Newly uploaded evidence should be reviewed before audit readiness is confirmed.",
      priority: status === "Expired" ? "High" : "Medium",
      companyId,
    });
  }

  revalidatePath("/");
  revalidatePath("/ai-analyzer");
  revalidatePath("/audit-readiness");
  revalidatePath("/documents");
  revalidatePath("/notifications");
  redirect(
    extractedText && extractedText.trim().length >= 20
      ? `/documents?message=${encodeURIComponent(
          `Document uploaded, ${extractionMethod ?? "provided text"} extracted, and AI analysis saved`,
        )}`
      : "/documents?message=Document%20uploaded",
  );
}

export async function updateDocumentAction(formData: FormData) {
  const documentId = required(formData, "documentId");
  const companyId = await getCurrentCompanyId();
  const documentType = requiredDocumentType(formData);
  const expiryDate = optional(formData, "expiryDate");
  const supplierId = optional(formData, "supplierId");
  const submittedStatus = requiredDocumentStatus(formData, "status");
  const removeFile = optional(formData, "removeFile") === "on";
  const file = formData.get("file");
  const uploadedFile = file instanceof File && file.size > 0 ? file : null;
  const supabase = await createClient();
  let replacementStoragePath: string | null = null;

  if (!companyId) {
    redirect(`/documents/${documentId}?error=Company%20workspace%20not%20found`);
  }

  const { data: existingDocument } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("company_id", companyId)
    .maybeSingle<{ storage_path: string | null }>();

  if (!existingDocument) {
    redirect(`/documents/${documentId}?error=Document%20not%20found`);
  }

  if (uploadedFile) {
    try {
      validateUploadFile(uploadedFile);
    } catch (error) {
      redirect(
        `/documents/${documentId}?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Invalid upload file",
        )}`,
      );
    }

    replacementStoragePath = `${companyId}/${crypto.randomUUID()}-${uploadedFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(replacementStoragePath, uploadedFile, {
        contentType: uploadedFile.type,
      });

    if (uploadError) {
      redirect(`/documents/${documentId}?error=${encodeURIComponent(uploadError.message)}`);
    }
  }

  const status = removeFile && !uploadedFile ? "Needs Review" : submittedStatus;
  const fileUpdate =
    uploadedFile && replacementStoragePath
      ? {
          storage_path: replacementStoragePath,
          file_name: uploadedFile.name,
          file_size_bytes: uploadedFile.size,
          content_type: uploadedFile.type,
        }
      : removeFile
        ? {
            storage_path: null,
            file_name: null,
            file_size_bytes: null,
            content_type: null,
          }
        : {};

  const { error } = await supabase
    .from("documents")
    .update({
      supplier_id: supplierId,
      name: required(formData, "name"),
      document_type: toDatabaseDocumentType(documentType),
      status: toDatabaseDocumentStatus(status),
      expiry_date: expiryDate,
      ...fileUpdate,
    })
    .eq("id", documentId)
    .eq("company_id", companyId);

  if (error) {
    if (replacementStoragePath) {
      await supabase.storage.from("documents").remove([replacementStoragePath]);
    }

    redirect(`/documents/${documentId}?error=${encodeURIComponent(error.message)}`);
  }

  if ((uploadedFile || removeFile) && existingDocument?.storage_path) {
    await supabase.storage.from("documents").remove([existingDocument.storage_path]);
  }

  await syncAuditChecklistForDocument({
    companyId,
    documentType,
    documentId,
    status,
    removedEvidence: removeFile && !uploadedFile,
  });
  await refreshAuditReadinessForCompany(companyId);

  revalidatePath("/");
  revalidatePath("/audit-readiness");
  revalidatePath("/audit-readiness/summary");
  revalidatePath("/documents");
  revalidatePath(`/documents/${documentId}`);
  redirect(`/documents/${documentId}?message=Document%20updated`);
}

export async function deleteDocumentAction(formData: FormData) {
  const documentId = required(formData, "documentId");
  const companyId = await getCurrentCompanyId();
  const supabase = await createClient();

  if (!companyId) {
    redirect(`/documents/${documentId}?error=Company%20workspace%20not%20found`);
  }

  const { data: document } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("company_id", companyId)
    .maybeSingle<{ storage_path: string | null }>();

  await markAuditChecklistNeedsReviewForDeletedDocument({
    companyId,
    documentId,
  });

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("company_id", companyId);

  if (error) {
    redirect(`/documents/${documentId}?error=${encodeURIComponent(error.message)}`);
  }

  if (document?.storage_path) {
    await supabase.storage.from("documents").remove([document.storage_path]);
  }

  await refreshAuditReadinessForCompany(companyId);

  revalidatePath("/");
  revalidatePath("/audit-readiness");
  revalidatePath("/audit-readiness/summary");
  revalidatePath("/documents");
  revalidatePath("/notifications");
  redirect(
    "/documents?message=Document%20deleted%20and%20audit%20readiness%20updated",
  );
}

export async function createInventoryItemAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/inventory?error=Supabase%20is%20not%20configured");
  }

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/inventory?error=Company%20workspace%20not%20found");
  }

  const halalStatus = requiredDocumentStatus(formData, "halalStatus");
  const riskLevel = requiredRiskLevel(formData, "riskLevel");
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").insert({
    company_id: companyId,
    supplier_id: optional(formData, "supplierId"),
    document_id: optional(formData, "documentId"),
    name: required(formData, "name"),
    category: required(formData, "category"),
    batch_number: required(formData, "batchNumber"),
    quantity: requiredNumber(formData, "quantity"),
    unit: required(formData, "unit"),
    received_date: optional(formData, "receivedDate"),
    expiry_date: optional(formData, "expiryDate"),
    halal_status: toDatabaseDocumentStatus(halalStatus),
    risk_level: toDatabaseRiskLevel(riskLevel),
    storage_location: optional(formData, "storageLocation"),
    notes: optional(formData, "notes"),
    is_sample_data: false,
  });

  if (error) {
    redirect(`/inventory?error=${encodeURIComponent(error.message)}`);
  }

  if (halalStatus !== "Valid" && halalStatus !== "Complete") {
    await createNotificationIfNeeded({
      title: `${required(formData, "name")} inventory needs review`,
      detail:
        "Potential risk detected. Please verify with a qualified halal compliance officer.",
      priority: riskLevel === "High" ? "High" : "Medium",
      companyId,
    });
  }

  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/notifications");
  redirect("/inventory?message=Inventory%20item%20added");
}

export async function deleteInventoryItemAction(formData: FormData) {
  const inventoryItemId = required(formData, "inventoryItemId");
  const companyId = await getCurrentCompanyId();
  const supabase = await createClient();

  if (!companyId) {
    redirect("/inventory?error=Company%20workspace%20not%20found");
  }

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", inventoryItemId)
    .eq("company_id", companyId);

  if (error) {
    redirect(`/inventory?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/inventory");
}

export async function updateInventoryItemAction(formData: FormData) {
  const inventoryItemId = required(formData, "inventoryItemId");
  const companyId = await getCurrentCompanyId();
  const halalStatus = requiredDocumentStatus(formData, "halalStatus");
  const riskLevel = requiredRiskLevel(formData, "riskLevel");
  const supabase = await createClient();

  if (!companyId) {
    redirect("/inventory?error=Company%20workspace%20not%20found");
  }

  const { error } = await supabase
    .from("inventory_items")
    .update({
      supplier_id: optional(formData, "supplierId"),
      document_id: optional(formData, "documentId"),
      name: required(formData, "name"),
      category: required(formData, "category"),
      batch_number: required(formData, "batchNumber"),
      quantity: requiredNumber(formData, "quantity"),
      unit: required(formData, "unit"),
      received_date: optional(formData, "receivedDate"),
      expiry_date: optional(formData, "expiryDate"),
      halal_status: toDatabaseDocumentStatus(halalStatus),
      risk_level: toDatabaseRiskLevel(riskLevel),
      storage_location: optional(formData, "storageLocation"),
      notes: optional(formData, "notes"),
      is_sample_data: false,
    })
    .eq("id", inventoryItemId)
    .eq("company_id", companyId);

  if (error) {
    redirect(`/inventory?error=${encodeURIComponent(error.message)}`);
  }

  if (halalStatus !== "Valid" && halalStatus !== "Complete") {
    await createNotificationIfNeeded({
      title: `${required(formData, "name")} inventory needs review`,
      detail:
        "Potential risk detected. Please verify with a qualified halal compliance officer.",
      priority: riskLevel === "High" ? "High" : "Medium",
    });
  }

  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/notifications");
  redirect("/inventory?message=Inventory%20item%20updated");
}

export async function updateCompanyAction(formData: FormData) {
  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/settings?error=Company%20workspace%20not%20found");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({
      name: required(formData, "name"),
      registration_number: optional(formData, "registrationNumber"),
      address: optional(formData, "address"),
      industry_sector: optional(formData, "industrySector"),
      primary_contact_email: optional(formData, "primaryContactEmail"),
    })
    .eq("id", companyId);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?message=Company%20profile%20updated");
}

export async function updateUserProfileAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/settings?error=Supabase%20is%20not%20configured");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: required(formData, "fullName"),
      job_title: optional(formData, "jobTitle"),
      phone: optional(formData, "phone"),
    },
  });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?tab=User%20Profile&message=User%20profile%20updated");
}

export async function saveNotificationPreferencesAction() {
  redirect("/settings?message=Notification%20preferences%20saved");
}

export async function markNotificationsReadAction() {
  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/notifications?error=Company%20workspace%20not%20found");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("company_id", companyId);

  if (error) {
    redirect(`/notifications?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/notifications");
}

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = required(formData, "notificationId");
  const companyId = await getCurrentCompanyId();
  const supabase = await createClient();

  if (!companyId) {
    redirect("/notifications?error=Company%20workspace%20not%20found");
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("company_id", companyId);

  if (error) {
    redirect(`/notifications?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/notifications");
}

export async function deleteNotificationAction(formData: FormData) {
  const notificationId = required(formData, "notificationId");
  const companyId = await getCurrentCompanyId();
  const supabase = await createClient();

  if (!companyId) {
    redirect("/notifications?error=Company%20workspace%20not%20found");
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("company_id", companyId);

  if (error) {
    redirect(`/notifications?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/notifications");
}

export async function refreshComplianceRemindersAction() {
  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/notifications?error=Company%20workspace%20not%20found");
  }

  const supabase = await createClient();
  const [suppliersResult, documentsResult] = await Promise.all([
    supabase
      .from("suppliers")
      .select("name,certificate_expiry_date")
      .eq("company_id", companyId),
    supabase
      .from("documents")
      .select("name,status,expiry_date")
      .eq("company_id", companyId),
  ]);

  if (suppliersResult.error) {
    redirect(`/notifications?error=${encodeURIComponent(suppliersResult.error.message)}`);
  }

  if (documentsResult.error) {
    redirect(`/notifications?error=${encodeURIComponent(documentsResult.error.message)}`);
  }

  for (const supplier of suppliersResult.data ?? []) {
    const status = getCertificateStatus(supplier.certificate_expiry_date);

    if (status !== "Valid") {
      await createNotificationIfNeeded({
        title: `${supplier.name} certificate ${status.toLowerCase()}`,
        detail: buildCertificateReminderDetail(
          supplier.name,
          status,
          supplier.certificate_expiry_date,
        ),
        priority: "High",
        companyId,
      });
    }
  }

  for (const document of documentsResult.data ?? []) {
    const status = document.expiry_date
      ? getCertificateStatus(document.expiry_date)
      : document.status === "missing_document" || document.status === "needs_review"
        ? "Missing Certificate"
        : "Valid";

    if (status !== "Valid" || document.status === "needs_review") {
      await createNotificationIfNeeded({
        title: `${document.name} needs compliance review`,
        detail: "Document evidence should be checked before audit readiness is confirmed.",
        priority: status === "Expired" ? "High" : "Medium",
        companyId,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/notifications");
  redirect("/notifications?message=Compliance%20reminders%20refreshed");
}

export async function refreshAuditReadinessAction() {
  if (!hasSupabaseEnv()) {
    redirect("/audit-readiness?error=Supabase%20is%20not%20configured");
  }

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/audit-readiness?error=Company%20workspace%20not%20found");
  }

  await refreshAuditReadinessForCompany(companyId);

  revalidatePath("/");
  revalidatePath("/audit-readiness");
  revalidatePath("/audit-readiness/summary");
  redirect("/audit-readiness?message=Audit%20readiness%20refreshed");
}

export async function analyzeDocumentAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/ai-analyzer?error=Supabase%20is%20not%20configured");
  }

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/ai-analyzer?error=Company%20workspace%20not%20found");
  }

  const submittedText = optional(formData, "inputText");
  const file = formData.get("file");
  const uploadedFile = file instanceof File && file.size > 0 ? file : null;
  let inputText = submittedText;
  let extractionWarning: string | undefined;
  let extractionMethod: string | undefined;

  if (uploadedFile) {
    try {
      validateUploadFile(uploadedFile);
    } catch (error) {
      redirect(
        `/ai-analyzer?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Invalid upload file",
        )}`,
      );
    }

    if (!inputText) {
      const extraction = await extractTextFromUpload(uploadedFile);

      if (!extraction) {
        redirect(
          "/ai-analyzer?error=Could%20not%20extract%20text%20from%20that%20file.%20Please%20paste%20the%20document%20text%20manually.",
        );
      }

      inputText = extraction.text;
      extractionWarning = extraction.warning;
      extractionMethod = extraction.method;
    }
  }

  if (!inputText || inputText.length < 20) {
    redirect(
      "/ai-analyzer?error=Please%20upload%20a%20readable%20document%20or%20paste%20at%20least%2020%20characters%20of%20document%20text",
    );
  }

  const documentId = optional(formData, "documentId");
  const uploadedFileName = uploadedFile?.name.replace(/\.[^.]+$/, "") ?? null;
  const productName = optional(formData, "productName") ?? uploadedFileName;
  const brandName = optional(formData, "brandName");

  try {
    await saveAiAssessment({
      companyId,
      documentId,
      inputText,
      productName,
      brandName,
    });

    if (extractionWarning) {
      await createNotificationIfNeeded({
        companyId,
        title: `${productName ?? "AI Analyzer"} OCR text was shortened`,
        detail: extractionWarning,
        priority: "Info",
      });
    }
  } catch (error) {
    redirect(
      `/ai-analyzer?error=${encodeURIComponent(
        error instanceof Error ? error.message : "AI analysis failed",
      )}`,
    );
  }

  revalidatePath("/");
  revalidatePath("/ai-analyzer");
  revalidatePath("/notifications");
  redirect(
    `/ai-analyzer?message=${encodeURIComponent(
      extractionMethod
        ? `${extractionMethod} extracted and AI analysis saved`
        : "AI analysis saved",
    )}`,
  );
}

function mapIngredientRisk(row: IngredientRiskRow): IngredientRiskKnowledge {
  return {
    name: row.name,
    commonNames: row.common_names,
    eCode: row.e_code,
    riskLevel: row.risk_level,
    riskReason: row.risk_reason,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    confidenceScore: Number(row.confidence_score ?? 0.5),
  };
}

async function saveAiAssessment({
  companyId,
  documentId,
  inputText,
  productName,
  brandName,
}: {
  companyId: string;
  documentId: string | null;
  inputText: string;
  productName: string | null;
  brandName: string | null;
}) {
  const supabase = await createClient();
  const { data: risks } = await supabase
    .from("ingredient_risks")
    .select(
      "name,common_names,e_code,risk_level,risk_reason,source_name,source_url,confidence_score",
    )
    .returns<IngredientRiskRow[]>();
  const knowledge =
    risks && risks.length > 0
      ? mergeIngredientKnowledge(risks.map(mapIngredientRisk))
      : getFallbackIngredientKnowledge();
  const openAiAnalysis = await analyzeWithOpenAi({
    documentText: inputText,
    knowledge,
  });
  const analysis = openAiAnalysis ?? analyzeIngredientRisk(inputText, knowledge);
  const modelName = openAiAnalysis
    ? process.env.OPENAI_MODEL ?? "gpt-5.4-mini"
    : hasOpenAiKey()
      ? "thayyib-rule-rag-v1-openai-fallback"
      : "thayyib-rule-rag-v1";
  const { error } = await supabase.from("halal_ai_assessments").insert({
    company_id: companyId,
    document_id: documentId,
    product_name: productName,
    brand_name: brandName,
    input_text: inputText,
    detected_ingredients: analysis.detectedIngredients,
    risk_summary: analysis.riskSummary,
    risk_level: analysis.riskLevel,
    recommendation_text: analysis.recommendationText,
    sources: analysis.sources,
    confidence_score: analysis.confidenceScore,
    model_name: modelName,
    is_sample_data: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (analysis.riskLevel === "medium" || analysis.riskLevel === "high") {
    await createNotificationIfNeeded({
      companyId,
      title: `AI ${analysis.riskLevel} risk alert`,
      detail: `${analysis.riskSummary} ${analysis.recommendationText}`,
      priority: analysis.riskLevel === "high" ? "High" : "Medium",
    });
  }
}

async function updateAuditChecklistForDocument({
  companyId,
  documentType,
  documentId,
}: {
  companyId: string;
  documentType: DocumentType;
  documentId: string;
}) {
  const checklistTitleByType: Partial<Record<DocumentType, string>> = {
    "Supplier Certificate": "Valid halal certificates for tier 1 suppliers",
    "Ingredient List": "Ingredient traceability logs updated",
    "SOP Document": "Halal Assurance System manual uploaded",
    "Audit Evidence": "Recent internal audit evidence uploaded",
  };
  const title = checklistTitleByType[documentType];

  if (!title) {
    return;
  }

  const supabase = await createClient();

  await supabase
    .from("audit_checklist_items")
    .update({
      status: "complete",
      linked_document_id: documentId,
      description: "Evidence uploaded and linked from the document workflow.",
    })
    .eq("company_id", companyId)
    .eq("title", title);
}

async function syncAuditChecklistForDocument({
  companyId,
  documentType,
  documentId,
  status,
  removedEvidence = false,
}: {
  companyId: string;
  documentType: DocumentType;
  documentId: string;
  status: DocumentStatus;
  removedEvidence?: boolean;
}) {
  const checklistTitleByType: Partial<Record<DocumentType, string>> = {
    "Supplier Certificate": "Valid halal certificates for tier 1 suppliers",
    "Ingredient List": "Ingredient traceability logs updated",
    "SOP Document": "Halal Assurance System manual uploaded",
    "Audit Evidence": "Recent internal audit evidence uploaded",
  };
  const title = checklistTitleByType[documentType];

  if (!title) {
    return;
  }

  const supabase = await createClient();
  const nextStatus = removedEvidence
    ? "needs_review"
    : toDatabaseDocumentStatus(status);
  const description = removedEvidence
    ? "Evidence file was removed. Upload replacement evidence before audit readiness is confirmed."
    : "Document metadata was updated from the document workflow.";

  await supabase
    .from("audit_checklist_items")
    .update({
      status: nextStatus,
      linked_document_id: documentId,
      description,
    })
    .eq("company_id", companyId)
    .eq("title", title);
}

async function markAuditChecklistNeedsReviewForDeletedDocument({
  companyId,
  documentId,
}: {
  companyId: string;
  documentId: string;
}) {
  const supabase = await createClient();

  await supabase
    .from("audit_checklist_items")
    .update({
      status: "needs_review",
      linked_document_id: null,
      description:
        "Linked evidence was deleted. Upload replacement evidence before audit readiness is confirmed.",
    })
    .eq("company_id", companyId)
    .eq("linked_document_id", documentId);
}

async function refreshAuditReadinessForCompany(companyId: string) {
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("id,document_type,status,created_at")
    .eq("company_id", companyId)
    .returns<AuditDocumentRow[]>();

  const rules = [
    {
      title: "Valid halal certificates for tier 1 suppliers",
      documentType: "supplier_certificate",
      label: "Supplier Certificate",
    },
    {
      title: "Ingredient traceability logs updated",
      documentType: "ingredient_list",
      label: "Ingredient List",
    },
    {
      title: "Halal Assurance System manual uploaded",
      documentType: "sop_document",
      label: "SOP Document",
    },
    {
      title: "Recent internal audit evidence uploaded",
      documentType: "audit_evidence",
      label: "Audit Evidence",
    },
    {
      title: "Annual facility audit reports collected",
      documentType: "audit_evidence",
      label: "Audit Evidence",
    },
  ];

  for (const rule of rules) {
    const bestDocument = (documents ?? [])
      .filter((document) => document.document_type === rule.documentType)
      .sort(compareAuditDocuments)[0];

    await supabase
      .from("audit_checklist_items")
      .update({
        status: bestDocument?.status ?? "missing_document",
        linked_document_id: bestDocument?.id ?? null,
        description: bestDocument
          ? `Synced from the current ${rule.label} document evidence status.`
          : `No current ${rule.label} document is linked. Upload this evidence before audit readiness is confirmed.`,
      })
      .eq("company_id", companyId)
      .eq("title", rule.title);
  }
}

function compareAuditDocuments(a: AuditDocumentRow, b: AuditDocumentRow) {
  const statusRank: Record<string, number> = {
    complete: 5,
    valid: 5,
    expiring_soon: 4,
    needs_review: 3,
    expired: 2,
    missing_document: 1,
  };
  const rankDifference =
    (statusRank[b.status] ?? 0) - (statusRank[a.status] ?? 0);

  if (rankDifference !== 0) {
    return rankDifference;
  }

  return Date.parse(b.created_at) - Date.parse(a.created_at);
}

async function createNotificationIfNeeded({
  title,
  detail,
  priority,
  companyId,
}: {
  title: string;
  detail: string;
  priority: "High" | "Medium" | "Info";
  companyId?: string;
}) {
  const resolvedCompanyId = companyId ?? (await getCurrentCompanyId());

  if (!resolvedCompanyId) {
    return;
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("company_id", resolvedCompanyId)
    .eq("title", title)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existing) {
    return;
  }

  await supabase.from("notifications").insert({
    company_id: resolvedCompanyId,
    title,
    detail,
    priority,
    is_read: false,
  });
}

function buildCertificateReminderDetail(
  supplierName: string,
  status: string,
  expiryDate: string | null,
) {
  if (status === "Missing Certificate") {
    return `${supplierName} does not have a certificate expiry date recorded.`;
  }

  return `${supplierName} certificate status is ${status.toLowerCase()}${
    expiryDate ? ` with expiry date ${expiryDate}` : ""
  }.`;
}
