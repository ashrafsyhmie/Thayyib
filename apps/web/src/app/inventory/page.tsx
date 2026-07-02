import Link from "next/link";
import { AlertTriangle, Package, Search, Trash2 } from "lucide-react";
import {
  createInventoryItemAction,
  deleteInventoryItemAction,
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SetupNotice, StatusBadge } from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";
import type { InventoryItem } from "@/lib/data/types";

const halalStatuses = [
  "All",
  "Valid",
  "Complete",
  "Expiring Soon",
  "Expired",
  "Missing Document",
  "Needs Review",
];
const riskLevels = ["All", "Low", "Medium", "High", "Unknown"];
const statusOptions = [
  "Valid",
  "Complete",
  "Expiring Soon",
  "Expired",
  "Missing Document",
  "Needs Review",
];
const riskOptions = ["Low", "Medium", "High", "Unknown"];
const unitOptions = ["kg", "g", "L", "ml", "pcs", "carton"];

type InventoryPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    q?: string;
    status?: string;
    risk?: string;
  }>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const [appData, params] = await Promise.all([getAppData(), searchParams]);
  const inventoryItems = filterInventoryItems(appData.inventoryItems, params);
  const highRiskCount = appData.inventoryItems.filter(
    (item) => item.riskLevel === "High",
  ).length;
  const reviewCount = appData.inventoryItems.filter((item) =>
    ["Expired", "Missing Document", "Needs Review"].includes(item.halalStatus),
  ).length;
  const expiringCount = appData.inventoryItems.filter(
    (item) => item.halalStatus === "Expiring Soon",
  ).length;

  return (
    <AppShell activePath="/inventory">
      <PageHeader
        title="Ingredient Inventory"
        description="Track raw materials, batches, supplier evidence, and halal risk status."
      />
      <SetupNotice show={appData.setupMode} />
      <Feedback error={params.error} message={params.message} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <MetricCard
          title="Total Ingredients"
          value={String(appData.inventoryItems.length)}
          detail="Raw materials tracked"
        />
        <MetricCard
          title="High Risk"
          value={String(highRiskCount)}
          detail="Require human review"
          warning={highRiskCount > 0}
        />
        <MetricCard
          title="Needs Evidence"
          value={String(reviewCount)}
          detail="Expired, missing, or under review"
          warning={reviewCount > 0}
        />
        <MetricCard
          title="Expiring Soon"
          value={String(expiringCount)}
          detail="Within the tracked status window"
          warning={expiringCount > 0}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary-soft p-3 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Add Inventory Item
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Link each batch to a supplier and document so audit evidence is
                traceable.
              </p>
            </div>
          </div>

          <form action={createInventoryItemAction} className="mt-5 space-y-4">
            <Field label="Ingredient Name" name="name" placeholder="Gelatin Powder" />
            <Field label="Category" name="category" placeholder="Gelling Agent" />
            <Field label="Batch Number" name="batchNumber" placeholder="GEL-2026-001" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity" name="quantity" placeholder="25" type="number" />
              <SelectField label="Unit" name="unit" options={unitOptions} />
            </div>
            <SelectField
              label="Supplier"
              name="supplierId"
              options={appData.suppliers.map((supplier) => ({
                label: supplier.name,
                value: supplier.id,
              }))}
              placeholder="Not linked"
              required={false}
            />
            <SelectField
              label="Linked Evidence"
              name="documentId"
              options={appData.documents.map((document) => ({
                label: document.name,
                value: document.id,
              }))}
              placeholder="No document linked"
              required={false}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Received"
                name="receivedDate"
                placeholder=""
                required={false}
                type="date"
              />
              <Field
                label="Expiry"
                name="expiryDate"
                placeholder=""
                required={false}
                type="date"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Halal Status" name="halalStatus" options={statusOptions} />
              <SelectField label="Risk Level" name="riskLevel" options={riskOptions} />
            </div>
            <Field
              label="Storage Location"
              name="storageLocation"
              placeholder="Dry Store 3"
              required={false}
            />
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Notes</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                name="notes"
                placeholder="Source evidence, handling notes, or review action"
              />
            </label>
            <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark">
              Add Inventory Item
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <form className="grid gap-3 lg:grid-cols-[1fr_180px_160px_auto]">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                  defaultValue={params.q ?? ""}
                  name="q"
                  placeholder="Search ingredient, batch, supplier..."
                />
              </label>
              <select
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                defaultValue={params.status ?? "All"}
                name="status"
              >
                {halalStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                defaultValue={params.risk ?? "All"}
                name="risk"
              >
                {riskLevels.map((risk) => (
                  <option key={risk} value={risk}>
                    {risk}
                  </option>
                ))}
              </select>
              <button className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-surface-soft">
                Filter
              </button>
            </form>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-border bg-surface-soft/60">
                  <tr>
                    {[
                      "Ingredient",
                      "Batch",
                      "Supplier",
                      "Quantity",
                      "Expiry",
                      "Halal Status",
                      "Risk",
                      "Evidence",
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
                  {inventoryItems.map((item) => (
                    <tr className="transition hover:bg-surface-soft/70" key={item.id}>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-950">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.category} - {item.storageLocation}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">
                          {item.batchNumber}
                        </p>
                        <p className="mt-1">Received {item.receivedDate}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {item.supplierId ? (
                          <Link
                            className="font-medium text-primary hover:text-primary-dark"
                            href={`/suppliers/${item.supplierId}`}
                          >
                            {item.supplier}
                          </Link>
                        ) : (
                          item.supplier
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {item.expiryDate}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={item.halalStatus} />
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={item.riskLevel} />
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {item.documentId ? (
                          <Link
                            className="font-medium text-primary hover:text-primary-dark"
                            href={`/documents/${item.documentId}`}
                          >
                            {item.linkedDocument}
                          </Link>
                        ) : (
                          item.linkedDocument
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <form action={deleteInventoryItemAction}>
                          <input
                            name="inventoryItemId"
                            type="hidden"
                            value={item.id}
                          />
                          <button
                            aria-label={`Delete ${item.name}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-danger"
                            disabled={appData.setupMode}
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
              <span>Showing {inventoryItems.length} inventory items</span>
              <span>All statuses are assistance for audit preparation</span>
            </div>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

function filterInventoryItems(
  items: InventoryItem[],
  params: Awaited<InventoryPageProps["searchParams"]>,
) {
  const query = params.q?.trim().toLowerCase();
  const status = params.status ?? "All";
  const risk = params.risk ?? "All";

  return items.filter((item) => {
    const matchesQuery =
      !query ||
      [item.name, item.batchNumber, item.category, item.supplier]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesStatus = status === "All" || item.halalStatus === status;
    const matchesRisk = risk === "All" || item.riskLevel === risk;

    return matchesQuery && matchesStatus && matchesRisk;
  });
}

function MetricCard({
  title,
  value,
  detail,
  warning = false,
}: {
  title: string;
  value: string;
  detail: string;
  warning?: boolean;
}) {
  return (
    <Card className="flex min-h-36 flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </h2>
        {warning && <AlertTriangle className="h-5 w-5 text-warning" />}
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-2 text-sm text-slate-600">{detail}</p>
      </div>
    </Card>
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
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-lg border border-border px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        min={type === "number" ? "0" : undefined}
        name={name}
        placeholder={placeholder}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        type={type}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  options: Array<string | { label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <select
        className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        name={name}
        required={required}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const labelText = typeof option === "string" ? option : option.label;

          return (
            <option key={value} value={value}>
              {labelText}
            </option>
          );
        })}
      </select>
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
