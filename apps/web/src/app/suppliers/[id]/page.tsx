import Link from "next/link";
import { ArrowLeft, Mail, StickyNote, Upload } from "lucide-react";
import { updateSupplierAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SecondaryButton, SetupNotice, StatusBadge } from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";

type SupplierDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SupplierDetailPage({
  params,
  searchParams,
}: SupplierDetailPageProps) {
  const [{ id }, appData, query] = await Promise.all([
    params,
    getAppData(),
    searchParams,
  ]);
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
      <Feedback error={query.error} message={query.message} />

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
            <Link
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white"
              href={`/documents?supplierId=${supplier.id}`}
            >
              <Upload className="h-4 w-4" />
              Upload Certificate
            </Link>
            <a
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              href={
                supplier.contactEmail
                  ? `mailto:${supplier.contactEmail}`
                  : "mailto:"
              }
            >
              <Mail className="h-4 w-4" />
              Contact Supplier
            </a>
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
              {supplier.notes || "No supplier notes recorded yet."}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-950">
              Edit Supplier
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Update certificate metadata so expiry tracking and reminders stay
              current.
            </p>
            <form action={updateSupplierAction} className="mt-5 grid gap-4 md:grid-cols-2">
              <input name="supplierId" type="hidden" value={supplier.id} />
              <Field label="Supplier Name" name="name" value={supplier.name} />
              <Field label="Category" name="category" value={supplier.category} />
              <Field
                label="Contact Person"
                name="contactPerson"
                required={false}
                value={supplier.contact === "Not recorded" ? "" : supplier.contact}
              />
              <Field
                label="Contact Email"
                name="contactEmail"
                required={false}
                type="email"
                value={supplier.contactEmail}
              />
              <Field
                label="Certificate Expiry Date"
                name="certificateExpiryDate"
                required={false}
                type="date"
                value={supplier.expiryDateRaw ?? ""}
              />
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-slate-900">Notes</span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  defaultValue={supplier.notes}
                  name="notes"
                />
              </label>
              <button
                className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300 md:col-span-2"
                disabled={appData.setupMode}
              >
                Save Supplier Changes
              </button>
            </form>
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

function Field({
  label,
  name,
  value,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-lg border border-border px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={value}
        name={name}
        required={required}
        type={type}
      />
    </label>
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
