"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getCertificateStatus,
  toDatabaseDocumentStatus,
  toDatabaseDocumentType,
  toDatabaseSupplierStatus,
} from "@/lib/data/format";
import type { DocumentStatus, DocumentType } from "@/lib/data/types";
import { getCurrentCompanyId } from "@/lib/data/app-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

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

  revalidatePath("/");
  revalidatePath("/suppliers");
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

  revalidatePath("/");
  revalidatePath("/documents");
  redirect("/documents?message=Document%20uploaded");
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
