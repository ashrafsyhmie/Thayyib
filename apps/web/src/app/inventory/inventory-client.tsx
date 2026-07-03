"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Search, Trash2, X } from "lucide-react";
import { deleteInventoryItemAction, updateInventoryItemAction } from "@/app/actions";
import { Card, StatusBadge } from "@/components/ui";
import type {
  ComplianceDocument,
  DocumentStatus,
  HalalRiskLevel,
  InventoryItem,
  Supplier,
} from "@/lib/data/types";

const halalStatuses: Array<"All" | DocumentStatus> = [
  "All",
  "Valid",
  "Complete",
  "Expiring Soon",
  "Expired",
  "Missing Document",
  "Needs Review",
];
const statusOptions: DocumentStatus[] = [
  "Valid",
  "Complete",
  "Expiring Soon",
  "Expired",
  "Missing Document",
  "Needs Review",
];
const riskLevels: Array<"All" | HalalRiskLevel> = [
  "All",
  "Low",
  "Medium",
  "High",
  "Unknown",
];
const riskOptions: HalalRiskLevel[] = ["Low", "Medium", "High", "Unknown"];
const unitOptions = ["kg", "g", "L", "ml", "pcs", "carton"];

export function InventoryClient({
  inventoryItems,
  suppliers,
  documents,
  setupMode,
}: {
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
  documents: ComplianceDocument[];
  setupMode: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [risk, setRisk] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const filteredItems = inventoryItems.filter((item) => {
    const matchesQuery = [
      item.name,
      item.batchNumber,
      item.category,
      item.supplier,
      item.storageLocation,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesStatus = status === "All" || item.halalStatus === status;
    const matchesRisk = risk === "All" || item.riskLevel === risk;

    return matchesQuery && matchesStatus && matchesRisk;
  });

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-3 border-b border-border bg-surface-soft/60 p-4 lg:grid-cols-[1fr_180px_160px]">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ingredient, batch, supplier..."
            type="search"
            value={query}
          />
        </label>
        <select
          className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          {halalStatuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          onChange={(event) => setRisk(event.target.value)}
          value={risk}
        >
          {riskLevels.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] text-left">
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
            {filteredItems.map((item) =>
              editingId === item.id ? (
                <EditRow
                  documents={documents}
                  item={item}
                  key={item.id}
                  onCancel={() => setEditingId(null)}
                  setupMode={setupMode}
                  suppliers={suppliers}
                />
              ) : (
                <DisplayRow
                  item={item}
                  key={item.id}
                  onEdit={() => setEditingId(item.id)}
                  setupMode={setupMode}
                />
              ),
            )}
            {filteredItems.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-sm text-slate-600" colSpan={9}>
                  No inventory items match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm text-slate-600">
        <span>
          Showing {filteredItems.length} of {inventoryItems.length} inventory items
        </span>
        <span>Search and filters update this section instantly</span>
      </div>
    </Card>
  );
}

function DisplayRow({
  item,
  onEdit,
  setupMode,
}: {
  item: InventoryItem;
  onEdit: () => void;
  setupMode: boolean;
}) {
  return (
    <tr className="transition hover:bg-surface-soft/70">
      <td className="px-6 py-5">
        <p className="font-semibold text-slate-950">{item.name}</p>
        <p className="mt-1 text-sm text-slate-600">
          {item.category} - {item.storageLocation}
        </p>
      </td>
      <td className="px-6 py-5 text-sm text-slate-600">
        <p className="font-medium text-slate-900">{item.batchNumber}</p>
        <p className="mt-1">Received {item.receivedDate}</p>
      </td>
      <td className="px-6 py-5 text-sm text-slate-600">
        {item.supplierId ? (
          <Link className="font-medium text-primary hover:text-primary-dark" href={`/suppliers/${item.supplierId}`}>
            {item.supplier}
          </Link>
        ) : (
          item.supplier
        )}
      </td>
      <td className="px-6 py-5 text-sm font-medium text-slate-900">
        {item.quantity} {item.unit}
      </td>
      <td className="px-6 py-5 text-sm text-slate-600">{item.expiryDate}</td>
      <td className="px-6 py-5">
        <StatusBadge status={item.halalStatus} />
      </td>
      <td className="px-6 py-5">
        <StatusBadge status={item.riskLevel} />
      </td>
      <td className="px-6 py-5 text-sm text-slate-600">
        {item.documentId ? (
          <Link className="font-medium text-primary hover:text-primary-dark" href={`/documents/${item.documentId}`}>
            {item.linkedDocument}
          </Link>
        ) : (
          item.linkedDocument
        )}
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-1">
          <button
            aria-label={`Edit ${item.name}`}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-primary-soft hover:text-primary"
            disabled={setupMode}
            onClick={onEdit}
            type="button"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <form action={deleteInventoryItemAction}>
            <input name="inventoryItemId" type="hidden" value={item.id} />
            <button
              aria-label={`Delete ${item.name}`}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-danger"
              disabled={setupMode}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

function EditRow({
  item,
  suppliers,
  documents,
  setupMode,
  onCancel,
}: {
  item: InventoryItem;
  suppliers: Supplier[];
  documents: ComplianceDocument[];
  setupMode: boolean;
  onCancel: () => void;
}) {
  return (
    <tr className="bg-emerald-50/30 align-top">
      <td className="px-6 py-5" colSpan={9}>
        <form action={updateInventoryItemAction} className="grid gap-4 lg:grid-cols-4">
          <input name="inventoryItemId" type="hidden" value={item.id} />
          <Field label="Ingredient" name="name" value={item.name} />
          <Field label="Category" name="category" value={item.category} />
          <Field label="Batch Number" name="batchNumber" value={item.batchNumber} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity" name="quantity" type="number" value={String(item.quantity)} />
            <Select label="Unit" name="unit" options={unitOptions} value={item.unit} />
          </div>
          <Select
            label="Supplier"
            name="supplierId"
            options={suppliers.map((supplier) => ({
              label: supplier.name,
              value: supplier.id,
            }))}
            placeholder="Not linked"
            value={item.supplierId ?? ""}
          />
          <Select
            label="Linked Evidence"
            name="documentId"
            options={documents.map((document) => ({
              label: document.name,
              value: document.id,
            }))}
            placeholder="No document linked"
            value={item.documentId ?? ""}
          />
          <Field
            label="Received"
            name="receivedDate"
            required={false}
            type="date"
            value={item.receivedDateRaw ?? ""}
          />
          <Field
            label="Expiry"
            name="expiryDate"
            required={false}
            type="date"
            value={item.expiryDateRaw ?? ""}
          />
          <Select
            label="Halal Status"
            name="halalStatus"
            options={statusOptions}
            value={item.halalStatus}
          />
          <Select
            label="Risk Level"
            name="riskLevel"
            options={riskOptions}
            value={item.riskLevel}
          />
          <Field
            label="Storage Location"
            name="storageLocation"
            required={false}
            value={item.storageLocation === "Not recorded" ? "" : item.storageLocation}
          />
          <label className="block lg:col-span-3">
            <span className="text-sm font-semibold text-slate-900">Notes</span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue={item.notes === "No notes recorded" ? "" : item.notes}
              name="notes"
            />
          </label>
          <div className="flex items-end gap-2 lg:col-span-4">
            <button
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:bg-slate-300"
              disabled={setupMode}
            >
              Save Ingredient
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-surface-soft"
              onClick={onCancel}
              type="button"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
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
        className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={value}
        min={type === "number" ? "0" : undefined}
        name={name}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        type={type}
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  value,
  placeholder,
}: {
  label: string;
  name: string;
  options: Array<string | { label: string; value: string }>;
  value: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <select
        className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={value}
        name={name}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const labelText = typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {labelText}
            </option>
          );
        })}
      </select>
    </label>
  );
}
