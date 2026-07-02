import { Activity, Database, Play, ShieldCheck } from "lucide-react";
import { runHalalApiSmokeTestAction } from "@/app/api-testing/actions";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SetupNotice, StatusBadge } from "@/components/ui";
import { getCurrentCompanyId } from "@/lib/data/app-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type ApiTestingPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

type ApiCheck = {
  name: string;
  method: "GET" | "POST/PATCH/DELETE";
  endpoint: string;
  status: "Passed" | "Failed" | "Ready" | "Skipped";
  detail: string;
  rows?: number;
};

type CountResult = {
  count: number | null;
  error: { message: string } | null;
};

type ApiTestingData = {
  supabaseConfigured: boolean;
  companyId: string | null;
  checks: ApiCheck[];
};

export default async function ApiTestingPage({
  searchParams,
}: ApiTestingPageProps) {
  const params = await searchParams;
  const data = await getApiTestingData();

  return (
    <AppShell activePath="/api-testing">
      <PageHeader
        title="API Testing"
        description="Run production smoke checks for the halal database endpoints and RLS policies."
      />
      <SetupNotice show={!data.supabaseConfigured} />
      <Feedback error={params.error} message={params.message} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary-soft p-3 text-primary">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Smoke Test Runner
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This page checks the same authenticated Supabase tables used by
                the app. The write test creates, updates, and deletes a
                temporary assessment row.
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <InfoRow
              label="Protocol"
              value="Supabase REST-style CRUD through authenticated RLS"
            />
            <InfoRow
              label="Workspace"
              value={data.companyId ?? "Not connected"}
            />
            <InfoRow
              label="Safety"
              value="No service-role key, no permanent smoke-test rows"
            />
          </dl>

          <form action={runHalalApiSmokeTestAction} className="mt-6">
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!data.companyId}
            >
              <Play className="h-4 w-4" />
              Run Write Smoke Test
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <p className="text-sm leading-6 text-emerald-900">
                These checks are for deployment validation only. Halal sample
                data is not official JAKIM data, and compliance outputs remain
                assistance for qualified human review.
              </p>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {data.checks.map((check) => (
              <ApiCheckCard check={check} key={check.name} />
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

async function getApiTestingData(): Promise<ApiTestingData> {
  if (!hasSupabaseEnv()) {
    return {
      supabaseConfigured: false,
      companyId: null,
      checks: [
        skippedCheck(
          "Supabase connection",
          "GET",
          "/rest/v1/*",
          "Supabase environment variables are not configured.",
        ),
      ],
    };
  }

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    return {
      supabaseConfigured: true,
      companyId: null,
      checks: [
        skippedCheck(
          "Workspace lookup",
          "GET",
          "/rest/v1/company_members",
          "Sign in before running API smoke checks.",
        ),
      ],
    };
  }

  const supabase = await createClient();
  const [
    ingredientRisks,
    halalCertifications,
    productIngredients,
    halalAssessments,
    inventoryItems,
  ] = await Promise.all([
    countRows(
      supabase
        .from("ingredient_risks")
        .select("*", { count: "exact", head: true }),
    ),
    countRows(
      supabase
        .from("halal_certifications")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
    ),
    countRows(
      supabase
        .from("product_ingredients")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
    ),
    countRows(
      supabase
        .from("halal_ai_assessments")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
    ),
    countRows(
      supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
    ),
  ]);

  return {
    supabaseConfigured: true,
    companyId,
    checks: [
      readCheck(
        "Ingredient risk lookup",
        "/rest/v1/ingredient_risks?select=*",
        ingredientRisks,
      ),
      readCheck(
        "Halal certification records",
        "/rest/v1/halal_certifications?company_id=eq.{company_id}",
        halalCertifications,
      ),
      readCheck(
        "Product ingredient links",
        "/rest/v1/product_ingredients?company_id=eq.{company_id}",
        productIngredients,
      ),
      readCheck(
        "Saved halal assessments",
        "/rest/v1/halal_ai_assessments?company_id=eq.{company_id}",
        halalAssessments,
      ),
      readCheck(
        "Inventory items",
        "/rest/v1/inventory_items?company_id=eq.{company_id}",
        inventoryItems,
      ),
      {
        name: "Assessment write cycle",
        method: "POST/PATCH/DELETE",
        endpoint: "/rest/v1/halal_ai_assessments",
        status: "Ready",
        detail: "Use the smoke test button to verify create, update, and delete.",
      },
    ],
  };
}

async function countRows(query: PromiseLike<CountResult>): Promise<CountResult> {
  try {
    return await query;
  } catch (error) {
    return {
      count: null,
      error: {
        message: error instanceof Error ? error.message : "Unknown query error",
      },
    };
  }
}

function readCheck(name: string, endpoint: string, result: CountResult): ApiCheck {
  if (result.error) {
    return {
      name,
      endpoint,
      method: "GET",
      status: "Failed",
      detail: result.error.message,
    };
  }

  return {
    name,
    endpoint,
    method: "GET",
    status: "Passed",
    detail: "Authenticated read succeeded.",
    rows: result.count ?? 0,
  };
}

function skippedCheck(
  name: string,
  method: ApiCheck["method"],
  endpoint: string,
  detail: string,
): ApiCheck {
  return {
    name,
    method,
    endpoint,
    status: "Skipped",
    detail,
  };
}

function ApiCheckCard({ check }: { check: ApiCheck }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-surface-soft p-2 text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-950">{check.name}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {check.method}
            </p>
          </div>
        </div>
        <StatusBadge status={check.status} />
      </div>

      <code className="mt-4 block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-xs text-white">
        {check.endpoint}
      </code>
      <p className="mt-4 text-sm leading-6 text-slate-600">{check.detail}</p>
      {typeof check.rows === "number" && (
        <p className="mt-3 text-sm font-semibold text-slate-950">
          Rows visible through RLS: {check.rows}
        </p>
      )}
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-slate-900">{label}</dt>
      <dd className="mt-1 break-words text-slate-600">{value}</dd>
    </div>
  );
}

function Feedback({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border px-5 py-4 text-sm ${
        error
          ? "border-red-100 bg-red-50 text-danger"
          : "border-emerald-100 bg-emerald-50 text-success"
      }`}
    >
      {error ?? message}
    </div>
  );
}
