import Link from "next/link";
import { Brain, FileText, ReceiptText, Store, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SetupNotice } from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";
import type { AppData } from "@/lib/data/types";

export default async function DashboardPage() {
  const appData = await getAppData();
  const missingDocuments = appData.documents.filter((document) =>
    ["Missing Document", "Needs Review", "Expired"].includes(document.status),
  ).length;
  const expiringSuppliers = appData.suppliers.filter(
    (supplier) => supplier.status === "Expiring Soon",
  );
  const aiRiskAlerts = appData.aiAssessments.filter((assessment) =>
    ["High", "Medium"].includes(assessment.riskLevel),
  ).length;

  return (
    <AppShell activePath="/">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back. Here is the current status of your halal compliance readiness."
      />
      <SetupNotice show={appData.setupMode} />
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <ComplianceScoreCard appData={appData} />
        <MetricCard
          title="Total Suppliers"
          value={String(appData.suppliers.length)}
          detail={`${expiringSuppliers.length} expiring soon`}
          icon={<Store className="h-5 w-5" />}
          tone="success"
        />
        <MetricCard
          title="Missing Documents"
          value={String(missingDocuments)}
          detail="Requires attention"
          icon={<FileText className="h-5 w-5" />}
          tone="danger"
        />
        <MetricCard
          title="AI Risk Alerts"
          value={String(aiRiskAlerts)}
          detail="Require human verification"
          icon={<Brain className="h-5 w-5" />}
          tone={aiRiskAlerts > 0 ? "danger" : "success"}
        />
        <ChecklistCard appData={appData} />
        <RenewalsCard appData={appData} />
      </section>
    </AppShell>
  );
}

function ComplianceScoreCard({ appData }: { appData: AppData }) {
  const totalItems = appData.checklistGroups.reduce(
    (total, group) => total + group.total,
    0,
  );
  const completedItems = appData.checklistGroups.reduce(
    (total, group) => total + group.completed,
    0,
  );
  const score = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  const expiringCount = appData.suppliers.filter(
    (supplier) => supplier.status === "Expiring Soon",
  ).length;

  return (
    <Card className="p-6 xl:col-span-2">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">
          Overall Compliance Readiness
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Based on supplier certificate status, document completeness, and audit
          checklist progress.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-[160px_1fr] sm:items-center">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-emerald-100"
              d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="text-success"
              d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${score}, 100`}
              strokeWidth="3"
            />
          </svg>
          <span className="absolute text-4xl font-bold text-success">{score}%</span>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-soft p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Needs Review
              </p>
              <TriangleAlert className="h-4 w-4 text-warning" />
            </div>
            <p className="mt-2 text-base font-medium text-slate-950">
              {expiringCount} certificates are expiring within 30 days
            </p>
          </div>
          <Link
            className="block w-full rounded-lg border border-primary/20 bg-primary-soft px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-emerald-200"
            href="/audit-readiness"
          >
            View Action Plan
          </Link>
        </div>
      </div>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: "success" | "danger";
}) {
  const iconClasses = {
    success: "bg-emerald-50 text-success",
    danger: "bg-red-50 text-danger",
  };
  const detailClasses = {
    success: "text-success",
    danger: "text-danger",
  };

  return (
    <Card className="flex min-h-52 flex-col justify-between p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <span className={`rounded-lg p-2 ${iconClasses[tone]}`}>{icon}</span>
      </div>
      <div>
        <p className="text-4xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
        <p className={`mt-2 text-sm font-medium ${detailClasses[tone]}`}>
          {detail}
        </p>
      </div>
    </Card>
  );
}

function ChecklistCard({ appData }: { appData: AppData }) {
  const groups = appData.checklistGroups.slice(0, 3);

  return (
    <Card className="p-6 xl:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">
          Audit Prep Checklist
        </h2>
        <span className="rounded-lg bg-surface-soft px-3 py-1 text-sm text-slate-600">
          Q3 Internal Audit
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {groups.map((item) => {
          const percentage =
            item.total === 0 ? 0 : Math.round((item.completed / item.total) * 100);
          const progressColor =
            percentage >= 80 ? "bg-success" : "bg-warning";

          return (
            <div key={item.title}>
              <div className="mb-2 flex justify-between gap-4 text-sm">
                <span className="font-medium text-slate-800">{item.title}</span>
                <span className="text-slate-600">
                  {item.completed}/{item.total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${progressColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function RenewalsCard({ appData }: { appData: AppData }) {
  const renewals = appData.suppliers
    .filter((supplier) => supplier.status === "Expiring Soon")
    .slice(0, 3);

  return (
    <Card className="p-6 xl:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">
          Upcoming Renewals
        </h2>
        <button className="text-sm font-semibold text-primary hover:text-primary-dark">
          View All
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {renewals.length === 0 && (
          <div className="rounded-lg border border-border p-4 text-sm text-slate-600">
            No certificates expiring within 30 days.
          </div>
        )}
        {renewals.map((renewal) => (
          <div
            key={renewal.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition hover:bg-surface-soft"
          >
            <div className="flex items-center gap-4">
              <span className="rounded-lg bg-amber-50 p-3 text-warning">
                <ReceiptText className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-950">
                  {renewal.name}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Supplier certificate
                </p>
              </div>
            </div>
            <span className="whitespace-nowrap rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-warning">
              {renewal.expiryDate}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
