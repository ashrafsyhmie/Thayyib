import { demoAppData } from "@/lib/demo-data";
import {
  formatDate,
  formatDocumentType,
  formatStatus,
  getCertificateStatus,
  normalizeHalalRiskLevel,
} from "@/lib/data/format";
import type {
  AiAssessment,
  AiFinding,
  AiSource,
  AppData,
  ChecklistGroup,
  ComplianceDocument,
  InventoryItem,
  NotificationItem,
  Supplier,
} from "@/lib/data/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type CompanyMemberRow = {
  company_id: string;
};

type CompanyRow = {
  id: string;
  name: string;
  registration_number: string | null;
  address: string | null;
  industry_sector: string | null;
  primary_contact_email: string | null;
};

type SupplierRow = {
  id: string;
  name: string;
  category: string;
  contact_person: string | null;
  contact_email: string | null;
  notes: string | null;
  certificate_status: string;
  certificate_expiry_date: string | null;
  documents?: { count: number }[];
};

type DocumentRow = {
  id: string;
  name: string;
  document_type: string;
  status: string;
  expiry_date: string | null;
  storage_path: string | null;
  created_at: string;
  suppliers: { id: string; name: string } | null;
};

type ChecklistRow = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  status: string;
};

type NotificationRow = {
  id: string;
  title: string;
  detail: string;
  priority: string;
  is_read: boolean;
  created_at: string;
};

type AiAssessmentRow = {
  id: string;
  document_id: string | null;
  product_name: string | null;
  brand_name: string | null;
  input_text: string;
  detected_ingredients: unknown;
  risk_summary: string;
  risk_level: string;
  recommendation_text: string;
  sources: unknown;
  confidence_score: number;
  model_name: string | null;
  created_at: string;
};

type InventoryRow = {
  id: string;
  name: string;
  category: string;
  batch_number: string;
  quantity: number;
  unit: string;
  received_date: string | null;
  expiry_date: string | null;
  halal_status: string;
  risk_level: string;
  storage_location: string | null;
  notes: string | null;
  suppliers: { id: string; name: string } | null;
  documents: { id: string; name: string } | null;
};

export async function getAppData(): Promise<AppData> {
  if (!hasSupabaseEnv()) {
    return demoAppData;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return demoAppData;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle<CompanyMemberRow>();

    if (membershipError) {
      return demoAppData;
    }

    const companyId = membership?.company_id ?? (await ensureUserWorkspace(supabase));

    if (!companyId) {
      return demoAppData;
    }

    const [
      companyResult,
      suppliersResult,
      documentsResult,
      checklistResult,
      notificationsResult,
      aiAssessmentsResult,
      inventoryResult,
    ] = await Promise.all([
        supabase
          .from("companies")
          .select(
            "id,name,registration_number,address,industry_sector,primary_contact_email",
          )
          .eq("id", companyId)
          .single<CompanyRow>(),
        supabase
          .from("suppliers")
          .select(
            "id,name,category,contact_person,contact_email,notes,certificate_status,certificate_expiry_date,documents(count)",
          )
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .returns<SupplierRow[]>(),
        supabase
          .from("documents")
          .select(
            "id,name,document_type,status,expiry_date,storage_path,created_at,suppliers(id,name)",
          )
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .returns<DocumentRow[]>(),
        supabase
          .from("audit_checklist_items")
          .select("id,category,title,description,status")
          .eq("company_id", companyId)
          .order("sort_order", { ascending: true })
          .returns<ChecklistRow[]>(),
        supabase
          .from("notifications")
          .select("id,title,detail,priority,is_read,created_at")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .returns<NotificationRow[]>(),
        supabase
          .from("halal_ai_assessments")
          .select(
            "id,document_id,product_name,brand_name,input_text,detected_ingredients,risk_summary,risk_level,recommendation_text,sources,confidence_score,model_name,created_at",
          )
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .returns<AiAssessmentRow[]>(),
        supabase
          .from("inventory_items")
          .select(
            "id,name,category,batch_number,quantity,unit,received_date,expiry_date,halal_status,risk_level,storage_location,notes,suppliers(id,name),documents(id,name)",
          )
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .returns<InventoryRow[]>(),
      ]);

    if (
      companyResult.error ||
      suppliersResult.error ||
      documentsResult.error ||
      checklistResult.error ||
      notificationsResult.error ||
      aiAssessmentsResult.error ||
      inventoryResult.error
    ) {
      return demoAppData;
    }

    return {
      setupMode: false,
      company: {
        id: companyResult.data.id,
        name: companyResult.data.name,
        registrationNumber: companyResult.data.registration_number ?? "",
        address: companyResult.data.address ?? "",
        industrySector: companyResult.data.industry_sector ?? "Food Manufacturing",
        primaryContactEmail: companyResult.data.primary_contact_email ?? user.email ?? "",
      },
      suppliers: mapSuppliers(suppliersResult.data ?? []),
      documents: mapDocuments(documentsResult.data ?? []),
      checklistGroups: mapChecklist(checklistResult.data ?? []),
      notifications: mapNotifications(notificationsResult.data ?? []),
      aiAssessments: mapAiAssessments(aiAssessmentsResult.data ?? []),
      inventoryItems: mapInventoryItems(inventoryResult.data ?? []),
    };
  } catch {
    return demoAppData;
  }
}

export async function getCurrentCompanyId() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle<CompanyMemberRow>();

  return data?.company_id ?? (await ensureUserWorkspace(supabase));
}

async function ensureUserWorkspace(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.rpc("ensure_user_workspace");

  if (error || typeof data !== "string") {
    return null;
  }

  return data;
}

export async function getDocumentSignedUrl(storagePath: string | undefined) {
  if (!storagePath || !hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, 60 * 10);

    if (error) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}

function mapSuppliers(rows: SupplierRow[]): Supplier[] {
  return rows.map((row) => {
    const calculatedStatus = getCertificateStatus(row.certificate_expiry_date);

    return {
      id: row.id,
      name: row.name,
      category: row.category,
      status:
        row.certificate_status === "missing_certificate"
          ? "Missing Certificate"
          : calculatedStatus,
      expiryDate: formatDate(row.certificate_expiry_date),
      expiryDateRaw: row.certificate_expiry_date ?? undefined,
      contact: row.contact_person ?? "Not recorded",
      contactEmail: row.contact_email ?? "",
      notes: row.notes ?? "",
      documents: row.documents?.[0]?.count ?? 0,
    };
  });
}

function mapDocuments(rows: DocumentRow[]): ComplianceDocument[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: formatDocumentType(row.document_type),
    supplier: row.suppliers?.name ?? "Internal",
    supplierId: row.suppliers?.id,
    uploadedAt: formatDate(row.created_at),
    expiryDate: formatDate(row.expiry_date),
    expiryDateRaw: row.expiry_date ?? undefined,
    status: formatStatus(row.status) as ComplianceDocument["status"],
    storagePath: row.storage_path ?? undefined,
  }));
}

function mapChecklist(rows: ChecklistRow[]): ChecklistGroup[] {
  const grouped = new Map<string, ChecklistRow[]>();

  for (const row of rows) {
    grouped.set(row.category, [...(grouped.get(row.category) ?? []), row]);
  }

  return Array.from(grouped.entries()).map(([title, items]) => {
    const mappedItems = items.map((item) => ({
      id: item.id,
      label: item.title,
      detail: item.description ?? "No details recorded",
      status: formatStatus(item.status) as ComplianceDocument["status"],
      action: item.status === "complete" ? "View" : "Update",
    }));
    const completed = mappedItems.filter((item) => item.status === "Complete").length;

    return {
      title,
      completed,
      total: mappedItems.length,
      items: mappedItems,
    };
  });
}

function mapNotifications(rows: NotificationRow[]): NotificationItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    detail: row.detail,
    priority: normalizePriority(row.priority),
    time: formatDate(row.created_at),
    unread: !row.is_read,
  }));
}

function normalizePriority(value: string): NotificationItem["priority"] {
  if (value === "High" || value === "Medium" || value === "Info") {
    return value;
  }

  return "Info";
}

function mapAiAssessments(rows: AiAssessmentRow[]): AiAssessment[] {
  return rows.map((row) => ({
    id: row.id,
    documentId: row.document_id ?? undefined,
    productName: row.product_name ?? "Untitled product",
    brandName: row.brand_name ?? "Not recorded",
    inputText: row.input_text,
    riskSummary: row.risk_summary,
    riskLevel: normalizeRiskLevel(row.risk_level),
    recommendationText: row.recommendation_text,
    findings: mapFindings(row.detected_ingredients),
    sources: mapSources(row.sources),
    confidenceScore: Number(row.confidence_score ?? 0),
    modelName: row.model_name ?? "thayyib-rule-rag-v1",
    createdAt: formatDate(row.created_at),
  }));
}

function normalizeRiskLevel(value: string): AiAssessment["riskLevel"] {
  return normalizeHalalRiskLevel(value);
}

function mapFindings(value: unknown): AiFinding[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const name = getString(item.name);
    const riskReason = getString(item.risk_reason);
    const riskLevel = normalizeRiskLevel(getString(item.risk_level));

    if (!name || !riskReason) {
      return [];
    }

    return {
      item: name,
      risk: riskReason,
      recommendation:
        riskLevel === "High"
          ? "Escalate this item and request supplier source evidence before relying on the ingredient."
          : "Request clarification and keep supporting evidence for audit review.",
      riskLevel,
    };
  });
}

function mapSources(value: unknown): AiSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const title = getString(item.title);

    if (!title) {
      return [];
    }

    return {
      title,
      url: getString(item.url) || undefined,
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function mapInventoryItems(rows: InventoryRow[]): InventoryItem[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    supplier: row.suppliers?.name ?? "Not linked",
    supplierId: row.suppliers?.id,
    linkedDocument: row.documents?.name ?? "No evidence linked",
    documentId: row.documents?.id,
    batchNumber: row.batch_number,
    quantity: Number(row.quantity ?? 0),
    unit: row.unit,
    receivedDate: formatDate(row.received_date),
    expiryDate: formatDate(row.expiry_date),
    halalStatus: formatStatus(row.halal_status) as InventoryItem["halalStatus"],
    riskLevel: normalizeHalalRiskLevel(row.risk_level),
    storageLocation: row.storage_location ?? "Not recorded",
    notes: row.notes ?? "No notes recorded",
  }));
}
