import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PrintButton } from "@/components/print-button";
import { Card, PageHeader, SecondaryButton, StatusBadge } from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";

export default async function AuditSummaryPage() {
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

  return (
    <AppShell activePath="/audit-readiness">
      <PageHeader
        title="Audit Summary"
        description="Printable overview of current halal compliance readiness."
        action={
          <Link href="/audit-readiness">
            <SecondaryButton>
              <ArrowLeft className="h-4 w-4" />
              Back to Audit Readiness
            </SecondaryButton>
          </Link>
        }
      />

      <Card className="p-8 print:border-0 print:shadow-none">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Thayyib Audit Readiness Summary
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {appData.company.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Generated for internal audit preparation.
            </p>
          </div>
          <PrintButton />
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryStat label="Readiness Score" value={`${readiness}%`} />
          <SummaryStat label="Suppliers Tracked" value={String(appData.suppliers.length)} />
          <SummaryStat label="Documents Stored" value={String(appData.documents.length)} />
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold text-slate-950">
            Certificate Status
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border text-slate-500">
                <tr>
                  <th className="py-3">Supplier</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Expiry Date</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appData.suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="py-3 font-medium text-slate-950">
                      {supplier.name}
                    </td>
                    <td className="py-3 text-slate-600">{supplier.category}</td>
                    <td className="py-3 text-slate-600">{supplier.expiryDate}</td>
                    <td className="py-3">
                      <StatusBadge status={supplier.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold text-slate-950">
            Audit Checklist
          </h3>
          <div className="mt-4 space-y-4">
            {appData.checklistGroups.map((group) => (
              <div className="rounded-lg border border-border p-4" key={group.title}>
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold text-slate-950">{group.title}</h4>
                  <span className="text-sm text-slate-600">
                    {group.completed}/{group.total} complete
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <div
                      className="flex items-center justify-between gap-4 text-sm"
                      key={item.id}
                    >
                      <span className="text-slate-700">{item.label}</span>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </Card>
    </AppShell>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-soft p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
