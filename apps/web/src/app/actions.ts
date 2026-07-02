"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  analyzeIngredientRisk,
  getFallbackIngredientKnowledge,
  type IngredientRiskKnowledge,
} from "@/lib/ai/risk-analyzer";
import { analyzeWithOpenAi, hasOpenAiKey } from "@/lib/ai/openai-analyzer";
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
  const supabase = await createClient();

  const { error } = await supabase.from("suppliers").delete().eq("id", supplierId);

  if (error) {
    redirect(`/suppliers?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/suppliers");
}

export async function updateSupplierAction(formData: FormData) {
  const supplierId = required(formData, "supplierId");
  const expiryDate = optional(formData, "certificateExpiryDate");
  const status = getCertificateStatus(expiryDate);
  const supabase = await createClient();

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
    .eq("id", supplierId);

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
  const documentType = required(formData, "documentType") as DocumentType;
  const expiryDate = optional(formData, "expiryDate");
  const supplierId = optional(formData, "supplierId");
  const file = formData.get("file");
  let storagePath: string | null = null;
  let fileName: string | null = null;
  let fileSizeBytes: number | null = null;
  let contentType: string | null = null;

  if (file instanceof File && file.size > 0) {
    fileName = file.name;
    fileSizeBytes = file.size;
    contentType = file.type;
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

  const { error } = await supabase.from("documents").insert({
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
  });

  if (error) {
    redirect(`/documents?error=${encodeURIComponent(error.message)}`);
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
  revalidatePath("/documents");
  revalidatePath("/notifications");
  redirect("/documents?message=Document%20uploaded");
}

export async function updateDocumentAction(formData: FormData) {
  const documentId = required(formData, "documentId");
  const documentType = required(formData, "documentType") as DocumentType;
  const expiryDate = optional(formData, "expiryDate");
  const supplierId = optional(formData, "supplierId");
  const status = required(formData, "status") as DocumentStatus;
  const supabase = await createClient();

  const { error } = await supabase
    .from("documents")
    .update({
      supplier_id: supplierId,
      name: required(formData, "name"),
      document_type: toDatabaseDocumentType(documentType),
      status: toDatabaseDocumentStatus(status),
      expiry_date: expiryDate,
    })
    .eq("id", documentId);

  if (error) {
    redirect(`/documents/${documentId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/documents");
  revalidatePath(`/documents/${documentId}`);
  redirect(`/documents/${documentId}?message=Document%20updated`);
}

export async function deleteDocumentAction(formData: FormData) {
  const documentId = required(formData, "documentId");
  const supabase = await createClient();
  const { data: document } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .maybeSingle<{ storage_path: string | null }>();
  const { error } = await supabase.from("documents").delete().eq("id", documentId);

  if (error) {
    redirect(`/documents/${documentId}?error=${encodeURIComponent(error.message)}`);
  }

  if (document?.storage_path) {
    await supabase.storage.from("documents").remove([document.storage_path]);
  }

  revalidatePath("/");
  revalidatePath("/documents");
  redirect("/documents?message=Document%20deleted");
}

export async function createInventoryItemAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/inventory?error=Supabase%20is%20not%20configured");
  }

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/inventory?error=Company%20workspace%20not%20found");
  }

  const halalStatus = required(formData, "halalStatus") as DocumentStatus;
  const riskLevel = required(formData, "riskLevel") as HalalRiskLevel;
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
  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", inventoryItemId);

  if (error) {
    redirect(`/inventory?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/inventory");
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

export async function analyzeDocumentAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/ai-analyzer?error=Supabase%20is%20not%20configured");
  }

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    redirect("/ai-analyzer?error=Company%20workspace%20not%20found");
  }

  const inputText = required(formData, "inputText");

  if (inputText.length < 20) {
    redirect(
      "/ai-analyzer?error=Please%20paste%20at%20least%2020%20characters%20of%20document%20text",
    );
  }

  const supabase = await createClient();
  const { data: risks } = await supabase
    .from("ingredient_risks")
    .select(
      "name,common_names,e_code,risk_level,risk_reason,source_name,source_url,confidence_score",
    )
    .returns<IngredientRiskRow[]>();
  const knowledge =
    risks && risks.length > 0 ? risks.map(mapIngredientRisk) : getFallbackIngredientKnowledge();
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
  const documentId = optional(formData, "documentId");
  const productName = optional(formData, "productName");
  const brandName = optional(formData, "brandName");

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
    redirect(`/ai-analyzer?error=${encodeURIComponent(error.message)}`);
  }

  if (analysis.riskLevel === "medium" || analysis.riskLevel === "high") {
    await supabase.from("notifications").insert({
      company_id: companyId,
      title: `AI ${analysis.riskLevel} risk alert`,
      detail: `${analysis.riskSummary} ${analysis.recommendationText}`,
      priority: analysis.riskLevel === "high" ? "High" : "Medium",
      is_read: false,
    });
  }

  revalidatePath("/");
  revalidatePath("/ai-analyzer");
  revalidatePath("/notifications");
  redirect("/ai-analyzer?message=AI%20analysis%20saved");
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
