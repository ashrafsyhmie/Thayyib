import Link from "next/link";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SetupNotice, StatusBadge } from "@/components/ui";
import { createSupplierAction, deleteSupplierAction } from "@/app/actions";
import { getAppData } from "@/lib/data/app-data";

const filters = ["All", "Valid", "Expiring Soon", "Expired", "Missing Certificate"];

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

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="mr-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Filter by status
              </span>
              {filters.map((filter) => (
                <button
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    filter === "All"
                      ? "border-border bg-white text-slate-700"
                      : "border-primary/15 bg-primary-soft/60 text-primary hover:bg-primary-soft"
                  }`}
                  key={filter}
                >
                  {filter}
                </button>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-border bg-surface-soft/60">
                  <tr>
                    {[
                      "Supplier Name",
                      "Category",
                      "Halal Status",
                      "Expiry Date",
                      "Contact Person",
                      "Documents",
                      "Actions",
                    ].map((heading) => (
                      <th
                        className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                        key={heading}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {suppliers.map((supplier) => (
                    <tr
                      className="group transition hover:bg-surface-soft/70"
                      key={supplier.id}
                    >
                      <td className="px-6 py-5 font-semibold text-slate-950">
                        <Link
                          className="text-slate-950 hover:text-primary"
                          href={`/suppliers/${supplier.id}`}
                        >
                          {supplier.name}
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {supplier.category}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={supplier.status} />
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {supplier.expiryDate}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {supplier.contact}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {supplier.documents}
                      </td>
                      <td className="px-6 py-5">
                        <form action={deleteSupplierAction}>
                          <input name="supplierId" type="hidden" value={supplier.id} />
                          <button
                            aria-label={`Delete ${supplier.name}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-danger"
                            disabled={setupMode}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm text-slate-600">
              <span>Showing {suppliers.length} suppliers</span>
              <span>Certificate status updates from expiry dates</span>
            </div>
          </Card>
        </div>
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
