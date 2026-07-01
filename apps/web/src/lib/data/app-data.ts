import { demoAppData } from "@/lib/demo-data";
import {
  formatDate,
  formatDocumentType,
  formatStatus,
  getCertificateStatus,
} from "@/lib/data/format";
import type {
  AppData,
  ChecklistGroup,
  ComplianceDocument,
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

    const [companyResult, suppliersResult, documentsResult, checklistResult, notificationsResult] =
      await Promise.all([
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
            "id,name,category,contact_person,certificate_status,certificate_expiry_date,documents(count)",
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
      ]);

    if (
      companyResult.error ||
      suppliersResult.error ||
      documentsResult.error ||
      checklistResult.error ||
      notificationsResult.error
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
      contact: row.contact_person ?? "Not recorded",
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
