import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  FileText,
  Package,
  ShieldCheck,
} from "lucide-react";
import { createInventoryItemAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SetupNotice, StatusBadge } from "@/components/ui";
import { InventoryClient } from "@/app/inventory/inventory-client";
import { getAppData } from "@/lib/data/app-data";
import type { InventoryItem } from "@/lib/data/types";

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
  }>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const [appData, params] = await Promise.all([getAppData(), searchParams]);
  const highRiskCount = appData.inventoryItems.filter(
    (item) => item.riskLevel === "High",
  ).length;
  const reviewItems = appData.inventoryItems.filter(isReviewNeeded);
  const reviewCount = reviewItems.length;
  const expiringCount = appData.inventoryItems.filter(
    (item) => item.halalStatus === "Expiring Soon",
  ).length;
  const evidenceLinkedCount = appData.inventoryItems.filter(
    (item) => item.documentId,
  ).length;
  const evidenceCoverage =
    appData.inventoryItems.length === 0
      ? 0
      : Math.round((evidenceLinkedCount / appData.inventoryItems.length) * 100);

  return (
    <AppShell activePath="/inventory">
      <PageHeader
        title="Ingredient Inventory"
        description="Track raw materials, batches, supplier evidence, and halal risk status."
        action={
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-surface-soft"
            href="/documents"
          >
            <FileText className="h-4 w-4" />
            View Evidence
          </Link>
        }
      />
      <SetupNotice show={appData.setupMode} />
      <Feedback error={params.error} message={params.message} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <MetricCard
          title="Total Ingredients"
          value={String(appData.inventoryItems.length)}
          detail="Raw materials tracked"
          icon={<Package className="h-5 w-5" />}
        />
        <MetricCard
          title="High Risk"
          value={String(highRiskCount)}
          detail="Require human review"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="danger"
          warning={highRiskCount > 0}
        />
        <MetricCard
          title="Needs Evidence"
          value={String(reviewCount)}
          detail="Expired, missing, or under review"
          icon={<ClipboardCheck className="h-5 w-5" />}
          tone="warning"
          warning={reviewCount > 0}
        />
        <MetricCard
          title="Evidence Coverage"
          value={`${evidenceCoverage}%`}
          detail={`${evidenceLinkedCount} linked, ${expiringCount} expiring soon`}
          icon={<ShieldCheck className="h-5 w-5" />}
          warning={expiringCount > 0}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Compliance review queue
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Priority batches for halal verification
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Inventory flags are audit-preparation assistance only.
                Potential risk detected. Please verify with a qualified halal
                compliance officer.
              </p>
            </div>
            <StatusBadge status={reviewCount > 0 ? "Needs Review" : "Ready"} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(reviewItems.length > 0 ? reviewItems.slice(0, 3) : appData.inventoryItems.slice(0, 3)).map(
              (item) => (
                <div
                  className="rounded-lg border border-border bg-surface-soft/60 p-4"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Batch {item.batchNumber}
                      </p>
                    </div>
                    <StatusBadge status={item.riskLevel} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {item.linkedDocument !== "No document linked"
                      ? item.linkedDocument
                      : "No evidence document linked yet"}
                  </p>
                </div>
              ),
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Evidence coverage
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                {evidenceCoverage}% linked
              </h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${evidenceCoverage}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Link each ingredient batch to supplier certificates, ingredient
            lists, or audit evidence before relying on it in audit readiness.
          </p>
        </Card>
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

        <InventoryClient
          documents={appData.documents}
          inventoryItems={appData.inventoryItems}
          setupMode={appData.setupMode}
          suppliers={appData.suppliers}
        />
      </section>
    </AppShell>
  );
}

function isReviewNeeded(item: InventoryItem) {
  return (
    item.riskLevel === "High" ||
    ["Expired", "Missing Document", "Needs Review"].includes(item.halalStatus) ||
    !item.documentId
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  tone = "info",
  warning = false,
}: {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "info" | "warning" | "danger";
  warning?: boolean;
}) {
  const toneStyles = {
    info: "bg-primary-soft text-primary",
    warning: "bg-amber-50 text-warning",
    danger: "bg-red-50 text-danger",
  };

  return (
    <Card className="flex min-h-36 flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </h2>
        <div className={`rounded-lg p-2 ${toneStyles[tone]}`}>{icon}</div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {warning && <AlertTriangle className="h-5 w-5 text-warning" />}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
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
