"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { deleteSupplierAction } from "@/app/actions";
import { Card, StatusBadge } from "@/components/ui";
import type { Supplier } from "@/lib/data/types";

const filters = ["All", "Valid", "Expiring Soon", "Expired", "Missing Certificate"];

export function SuppliersClient({
  suppliers,
  setupMode,
}: {
  suppliers: Supplier[];
  setupMode: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesQuery = [supplier.name, supplier.category, supplier.contact]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesStatus = status === "All" || supplier.status === status;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search suppliers, category, contact..."
              type="search"
              value={query}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <button
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  filter === status
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-white text-slate-700 hover:bg-surface-soft"
                }`}
                key={filter}
                onClick={() => setStatus(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
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
              {filteredSuppliers.map((supplier) => (
                <tr className="group transition hover:bg-surface-soft/70" key={supplier.id}>
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
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-600" colSpan={7}>
                    No suppliers match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm text-slate-600">
          <span>
            Showing {filteredSuppliers.length} of {suppliers.length} suppliers
          </span>
          <span>Certificate status updates from expiry dates</span>
        </div>
      </Card>
    </div>
  );
}
