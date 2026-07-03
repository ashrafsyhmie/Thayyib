import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Brain,
  ClipboardCheck,
  FileText,
  Package,
  ShieldCheck,
  Store,
} from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SetupNotice, StatusBadge } from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";
import type {
  AppData,
  ComplianceDocument,
  InventoryItem,
  Supplier,
} from "@/lib/data/types";

export default async function ImprovedDashboardPage() {
  const appData = await getAppData();
  const auditStats = getAuditStats(appData);
  const priorityActions = getPriorityActions(appData);
  const expiringSuppliers = appData.suppliers.filter(
    (supplier) => supplier.status === "Expiring Soon",
  );
  const expiredSuppliers = appData.suppliers.filter(
    (supplier) => supplier.status === "Expired",
  );
  const missingDocuments = appData.documents.filter((document) =>
    ["Missing Document", "Needs Review", "Expired"].includes(document.status),
  );
  const riskyInventory = appData.inventoryItems.filter((item) =>
    item.riskLevel === "High" ||
    ["Expired", "Missing Document", "Needs Review"].includes(item.halalStatus),
  );
  const aiRiskAlerts = appData.aiAssessments.filter((assessment) =>
    ["High", "Medium"].includes(assessment.riskLevel),
  );

  return (
    <AppShell activePath="/">
      <PageHeader
        title="Compliance Command Center"
        description="A clearer dashboard focused on what needs attention before the next halal audit."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-surface-soft"
              href="/"
            >
              Compare Old Dashboard
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
              href="/audit-readiness"
            >
              View Audit Plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        }
      />
      <SetupNotice show={appData.setupMode} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr]">
        <ReadinessPanel score={auditStats.score} stats={auditStats} />
        <PriorityActions actions={priorityActions} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail={`${expiringSuppliers.length} expiring soon, ${expiredSuppliers.length} expired`}
          href="/suppliers"
          icon={<Store className="h-5 w-5" />}
          label="Supplier Certificates"
          tone={expiredSuppliers.length > 0 ? "danger" : expiringSuppliers.length > 0 ? "warning" : "success"}
          value={`${appData.suppliers.length}`}
        />
        <MetricCard
          detail={`${missingDocuments.length} require review`}
          href="/documents"
          icon={<FileText className="h-5 w-5" />}
          label="Document Evidence"
          tone={missingDocuments.length > 0 ? "warning" : "success"}
          value={`${appData.documents.length}`}
        />
        <MetricCard
          detail={`${riskyInventory.length} batches need evidence or review`}
          href="/inventory"
          icon={<Package className="h-5 w-5" />}
          label="Ingredient Inventory"
          tone={riskyInventory.length > 0 ? "danger" : "success"}
          value={`${appData.inventoryItems.length}`}
        />
        <MetricCard
          detail="AI findings require human verification"
          href="/ai-analyzer"
          icon={<Brain className="h-5 w-5" />}
          label="Risk Alerts"
          tone={aiRiskAlerts.length > 0 ? "danger" : "success"}
          value={`${aiRiskAlerts.length}`}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
        <SupplierHealth suppliers={appData.suppliers} />
        <EvidenceHealth documents={appData.documents} inventoryItems={appData.inventoryItems} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
        <RecentReminders appData={appData} />
        <AuditChecklist appData={appData} />
      </section>
    </AppShell>
  );
}

function ReadinessPanel({
  score,
  stats,
}: {
  score: number;
  stats: ReturnType<typeof getAuditStats>;
}) {
  const readinessTone =
    score >= 80
      ? "text-success"
      : score >= 55
        ? "text-warning"
        : "text-danger";

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-6 p-6 lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="flex flex-col items-center rounded-lg bg-surface-soft p-6 text-center">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-emerald-100"
                d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={readinessTone}
                d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${score}, 100`}
                strokeWidth="3"
              />
            </svg>
            <div className="absolute text-center">
              <p className={`text-4xl font-bold ${readinessTone}`}>{score}%</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Ready
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Based on audit checklist completion and visible evidence status.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Audit readiness
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {stats.completedItems} of {stats.totalItems} checklist items are complete
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Use this page as the daily compliance briefing. Focus first on missing
            evidence, expired supplier certificates, and high-risk ingredient
            batches before exporting an audit summary.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Complete" value={String(stats.completedItems)} />
            <MiniStat label="Needs Review" value={String(stats.reviewItems)} />
            <MiniStat label="Open Reminders" value={String(stats.openReminders)} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function PriorityActions({
  actions,
}: {
  actions: Array<{
    title: string;
    detail: string;
    href: string;
    status: string;
  }>;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Next best actions
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            What needs attention now
          </h2>
        </div>
        <AlertTriangle className="h-5 w-5 text-warning" />
      </div>
      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <Link
            className="block rounded-lg border border-border p-4 transition hover:border-primary/30 hover:bg-surface-soft"
            href={action.href}
            key={`${action.title}-${action.href}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{action.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {action.detail}
                </p>
              </div>
              <StatusBadge status={action.status} />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: "success" | "warning" | "danger";
  href: string;
}) {
  const styles = {
    success: "bg-emerald-50 text-success",
    warning: "bg-amber-50 text-warning",
    danger: "bg-red-50 text-danger",
  };

  return (
    <Link href={href}>
      <Card className="flex min-h-40 flex-col justify-between p-5 transition hover:border-primary/30 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <span className={`rounded-lg p-2 ${styles[tone]}`}>{icon}</span>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
      </Card>
    </Link>
  );
}

function SupplierHealth({ suppliers }: { suppliers: Supplier[] }) {
  const groups = [
    { label: "Valid", count: suppliers.filter((item) => item.status === "Valid").length },
    {
      label: "Expiring Soon",
      count: suppliers.filter((item) => item.status === "Expiring Soon").length,
    },
    { label: "Expired", count: suppliers.filter((item) => item.status === "Expired").length },
    {
      label: "Missing Certificate",
      count: suppliers.filter((item) => item.status === "Missing Certificate").length,
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Supplier health
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Certificate status overview
          </h2>
        </div>
        <Link className="text-sm font-semibold text-primary hover:text-primary-dark" href="/suppliers">
          Manage suppliers
        </Link>
      </div>
      <div className="mt-5 space-y-4">
        {groups.map((group) => {
          const percentage =
            suppliers.length === 0 ? 0 : Math.round((group.count / suppliers.length) * 100);

          return (
            <div key={group.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-800">{group.label}</span>
                <span className="text-slate-600">{group.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={group.label === "Valid" ? "h-full rounded-full bg-success" : "h-full rounded-full bg-warning"}
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

function EvidenceHealth({
  documents,
  inventoryItems,
}: {
  documents: ComplianceDocument[];
  inventoryItems: InventoryItem[];
}) {
  const linkedInventory = inventoryItems.filter((item) => item.documentId).length;
  const coverage =
    inventoryItems.length === 0
      ? 0
      : Math.round((linkedInventory / inventoryItems.length) * 100);
  const documentReviewCount = documents.filter((document) =>
    ["Expired", "Needs Review", "Missing Document"].includes(document.status),
  ).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Evidence health
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Documents and inventory traceability
          </h2>
        </div>
        <ShieldCheck className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-slate-600">Inventory evidence coverage</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{coverage}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-primary" style={{ width: `${coverage}%` }} />
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-slate-600">Documents requiring review</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {documentReviewCount}
          </p>
          <Link
            className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-dark"
            href="/documents"
          >
            Review documents
          </Link>
        </div>
      </div>
    </Card>
  );
}

function RecentReminders({ appData }: { appData: AppData }) {
  const reminders = appData.notifications.slice(0, 4);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Reminders
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Recent compliance alerts
          </h2>
        </div>
        <Link className="text-sm font-semibold text-primary hover:text-primary-dark" href="/notifications">
          View all
        </Link>
      </div>
      <div className="mt-5 divide-y divide-border">
        {reminders.length === 0 && (
          <div className="rounded-lg border border-border p-4 text-sm text-slate-600">
            No reminders yet.
          </div>
        )}
        {reminders.map((reminder) => (
          <div className="flex items-start gap-4 py-4 first:pt-0" key={reminder.id}>
            <span className="rounded-lg bg-primary-soft p-2 text-primary">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{reminder.title}</p>
                <StatusBadge status={reminder.priority} />
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {reminder.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AuditChecklist({ appData }: { appData: AppData }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Audit checklist
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Section progress
          </h2>
        </div>
        <ClipboardCheck className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-5 space-y-4">
        {appData.checklistGroups.slice(0, 5).map((group) => {
          const percentage =
            group.total === 0 ? 0 : Math.round((group.completed / group.total) * 100);

          return (
            <div key={group.title}>
              <div className="mb-2 flex justify-between gap-4 text-sm">
                <span className="font-medium text-slate-800">{group.title}</span>
                <span className="text-slate-600">
                  {group.completed}/{group.total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={percentage >= 80 ? "h-full rounded-full bg-success" : "h-full rounded-full bg-warning"}
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function getAuditStats(appData: AppData) {
  const totalItems = appData.checklistGroups.reduce(
    (total, group) => total + group.total,
    0,
  );
  const completedItems = appData.checklistGroups.reduce(
    (total, group) => total + group.completed,
    0,
  );
  const reviewItems = totalItems - completedItems;
  const openReminders = appData.notifications.filter((item) => item.unread).length;

  return {
    completedItems,
    openReminders,
    reviewItems,
    score: totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100),
    totalItems,
  };
}

function getPriorityActions(appData: AppData) {
  const actions: Array<{
    title: string;
    detail: string;
    href: string;
    status: string;
  }> = [];
  const expiredSupplier = appData.suppliers.find(
    (supplier) => supplier.status === "Expired",
  );
  const expiringSupplier = appData.suppliers.find(
    (supplier) => supplier.status === "Expiring Soon",
  );
  const missingDocument = appData.documents.find((document) =>
    ["Expired", "Needs Review", "Missing Document"].includes(document.status),
  );
  const riskyInventory = appData.inventoryItems.find((item) =>
    item.riskLevel === "High" ||
    ["Expired", "Missing Document", "Needs Review"].includes(item.halalStatus),
  );

  if (expiredSupplier) {
    actions.push({
      detail: `${expiredSupplier.name} has an expired supplier certificate.`,
      href: `/suppliers/${expiredSupplier.id}`,
      status: "Expired",
      title: "Renew expired supplier certificate",
    });
  }

  if (expiringSupplier) {
    actions.push({
      detail: `${expiringSupplier.name} certificate expires on ${expiringSupplier.expiryDate}.`,
      href: `/suppliers/${expiringSupplier.id}`,
      status: "Expiring Soon",
      title: "Prepare supplier renewal",
    });
  }

  if (missingDocument) {
    actions.push({
      detail: `${missingDocument.name} is marked ${missingDocument.status.toLowerCase()}.`,
      href: `/documents/${missingDocument.id}`,
      status: missingDocument.status,
      title: "Review document evidence",
    });
  }

  if (riskyInventory) {
    actions.push({
      detail: `${riskyInventory.name} needs ingredient evidence or qualified review.`,
      href: "/inventory",
      status: riskyInventory.riskLevel,
      title: "Check ingredient batch risk",
    });
  }

  if (actions.length === 0) {
    actions.push({
      detail: "No urgent issues found. Continue monitoring supplier renewals and evidence completeness.",
      href: "/audit-readiness",
      status: "Ready",
      title: "Workspace is in good shape",
    });
  }

  return actions.slice(0, 4);
}
