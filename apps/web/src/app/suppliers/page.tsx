import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SetupNotice } from "@/components/ui";
import { createSupplierAction } from "@/app/actions";
import { getAppData } from "@/lib/data/app-data";
import { SuppliersClient } from "@/app/suppliers/suppliers-client";

type SuppliersPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const [{ suppliers, setupMode }, params] = await Promise.all([
    getAppData(),
    searchParams,
  ]);

  return (
    <AppShell activePath="/suppliers">
      <PageHeader
        title="Supplier Management"
        description="Manage and track supplier halal compliance status."
      />
      <SetupNotice show={setupMode} />
      <Feedback error={params.error} message={params.message} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-950">Add Supplier</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add certificate details now so expiry tracking can start immediately.
          </p>
          <form action={createSupplierAction} className="mt-5 space-y-4">
            <Field label="Supplier Name" name="name" placeholder="Crescent Dairy" />
            <Field label="Category" name="category" placeholder="Dairy Products" />
            <Field
              label="Contact Person"
              name="contactPerson"
              placeholder="Omar Farooq"
              required={false}
            />
            <Field
              label="Contact Email"
              name="contactEmail"
              placeholder="compliance@supplier.com"
              required={false}
              type="email"
            />
            <Field
              label="Certificate Expiry Date"
              name="certificateExpiryDate"
              required={false}
              type="date"
            />
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Notes</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                name="notes"
                placeholder="Optional supplier compliance notes"
              />
            </label>
            <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark">
              Add Supplier
            </button>
          </form>
        </Card>

        <SuppliersClient suppliers={suppliers} setupMode={setupMode} />
      </section>
    </AppShell>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-lg border border-border px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        name={name}
        placeholder={placeholder}
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
