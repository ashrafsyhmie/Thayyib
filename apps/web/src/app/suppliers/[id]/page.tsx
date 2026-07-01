import Link from "next/link";
import { ArrowLeft, Mail, StickyNote, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SecondaryButton, SetupNotice, StatusBadge } from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";

type SupplierDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const [{ id }, appData] = await Promise.all([params, getAppData()]);
  const supplier = appData.suppliers.find((item) => item.id === id);
  const linkedDocuments = appData.documents.filter(
    (document) => document.supplierId === id || document.supplier === supplier?.name,
  );

  if (!supplier) {
    return (
      <AppShell activePath="/suppliers">
        <PageHeader
          title="Supplier Not Found"
          description="The supplier may have been deleted or is not available in this workspace."
          action={
            <Link href="/suppliers">
              <SecondaryButton>
                <ArrowLeft className="h-4 w-4" />
                Back to Suppliers
              </SecondaryButton>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell activePath="/suppliers">
      <PageHeader
        title={supplier.name}
        description="Review supplier profile, certificate status, and linked compliance evidence."
        action={
          <Link href="/suppliers">
            <SecondaryButton>
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </SecondaryButton>
          </Link>
        }
      />
      <SetupNotice show={appData.setupMode} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Supplier Profile
              </h2>
              <p className="mt-1 text-sm text-slate-600">{supplier.category}</p>
            </div>
            <StatusBadge status={supplier.status} />
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <InfoRow label="Certificate Expiry" value={supplier.expiryDate} />
            <InfoRow label="Contact Person" value={supplier.contact} />
            <InfoRow label="Linked Documents" value={String(linkedDocuments.length)} />
          </dl>

          <div className="mt-6 grid gap-3">
            <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
              <Upload className="h-4 w-4" />
              Upload Certificate
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              <Mail className="h-4 w-4" />
              Contact Supplier
            </button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <StickyNote className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-slate-950">
                Compliance Notes
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Keep supplier-specific notes here during implementation. This area
              is ready for notes and audit follow-up history once notes are wired
              to the database.
            </p>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border bg-surface-soft/60 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-950">
                Linked Documents
              </h2>
            </div>
            <div className="divide-y divide-border">
              {linkedDocuments.map((document) => (
                <Link
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-surface-soft"
                  href={`/documents/${document.id}`}
                  key={document.id}
                >
                  <div>
                    <p className="font-semibold text-slate-950">{document.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {document.type} - {document.expiryDate}
                    </p>
                  </div>
                  <StatusBadge status={document.status} />
                </Link>
              ))}
              {linkedDocuments.length === 0 && (
                <div className="px-6 py-8 text-sm text-slate-600">
                  No documents linked to this supplier yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-slate-900">{label}</dt>
      <dd className="mt-1 text-slate-600">{value}</dd>
    </div>
  );
}

