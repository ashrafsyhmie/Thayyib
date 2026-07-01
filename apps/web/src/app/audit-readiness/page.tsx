import Link from "next/link";
import { CheckCircle2, Download, FileWarning, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SetupNotice,
  StatusBadge,
} from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";

export default async function AuditReadinessPage() {
  const appData = await getAppData();
  const totalItems = appData.checklistGroups.reduce(
    (total, group) => total + group.total,
    0,
  );
  const completedItems = appData.checklistGroups.reduce(
    (total, group) => total + group.completed,
    0,
  );
  const readiness = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  const missingItems = appData.checklistGroups
    .flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        category: group.title,
      })),
    )
    .filter((item) => item.status !== "Complete");

  return (
    <AppShell activePath="/audit-readiness">
      <PageHeader
        title="Audit Readiness"
        description="Review compliance progress and prepare evidence for upcoming audits."
        action={
          <Link href="/audit-readiness/summary">
            <PrimaryButton>
              <Download className="h-4 w-4" />
              Export Summary
            </PrimaryButton>
          </Link>
        }
      />
      <SetupNotice show={appData.setupMode} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="p-6">
          <h2 className="text-center text-xl font-semibold text-slate-950">
            Overall Readiness
          </h2>
          <div className="mx-auto mt-8 flex h-48 w-48 items-center justify-center">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-emerald-100"
                  d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-primary"
                  d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${readiness}, 100`}
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-4xl font-bold text-primary">{readiness}%</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Ready
                </p>
              </div>
            </div>
          </div>
          <p className="mx-auto mt-4 max-w-64 text-center text-sm leading-6 text-slate-600">
            You are in a good position, with a few items needing attention
            before the audit.
          </p>
        </Card>

        <Card className="border-amber-200 bg-amber-50/60 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-white p-3 text-warning shadow-sm">
              <FileWarning className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Evidence Needs Review
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                The following documents are missing or expired. Update them to
                improve audit readiness.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {missingItems.slice(0, 3).map((item) => (
              <div
                className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-white p-4"
                key={item.id}
              >
                <div>
                  <p className="font-semibold text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.category} - {item.detail}
                  </p>
                </div>
                <SecondaryButton>{item.action}</SecondaryButton>
              </div>
            ))}
            {missingItems.length === 0 && (
              <div className="rounded-lg border border-emerald-200 bg-white p-4 text-sm font-medium text-success">
                All checklist evidence is complete.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-slate-950">
          Detailed Checklist
        </h2>
        <div className="space-y-4">
          {appData.checklistGroups.map((group) => (
            <Card className="overflow-hidden" key={group.title}>
              <div className="flex items-center justify-between gap-4 bg-surface-soft px-6 py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {group.title}
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-success">
                  {group.completed}/{group.total} Complete
                </span>
              </div>
              <div className="divide-y divide-border">
                {group.items.map((item) => (
                  <div
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                    key={item.label}
                  >
                    <div className="flex items-start gap-3">
                      <StatusBadge status={item.status} />
                      <div>
                        <p className="font-medium text-slate-950">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <SecondaryButton>
                      {item.action === "Upload" && <Upload className="h-4 w-4" />}
                      {item.action}
                    </SecondaryButton>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
