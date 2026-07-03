"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { deleteDocumentAction } from "@/app/actions";
import { Card, StatusBadge } from "@/components/ui";
import type { ComplianceDocument, DocumentStatus, DocumentType } from "@/lib/data/types";

const documentTypes: Array<"All" | DocumentType> = [
  "All",
  "Supplier Certificate",
  "Ingredient List",
  "SOP Document",
  "Audit Evidence",
  "Other",
];
const documentStatuses: Array<"All" | DocumentStatus> = [
  "All",
  "Valid",
  "Expiring Soon",
  "Expired",
  "Missing Document",
  "Complete",
  "Needs Review",
];

export function DocumentsClient({
  documents,
  initialQuery = "",
  setupMode,
}: {
  documents: ComplianceDocument[];
  initialQuery?: string;
  setupMode: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const filteredDocuments = documents.filter((document) => {
    const matchesQuery = [document.name, document.type, document.supplier]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesType = type === "All" || document.type === type;
    const matchesStatus = status === "All" || document.status === status;

    return matchesQuery && matchesType && matchesStatus;
  });

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-3 border-b border-border bg-surface-soft/60 p-4 lg:grid-cols-[1fr_180px_180px]">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents, supplier, type..."
            type="search"
            value={query}
          />
        </label>
        <select
          className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          onChange={(event) => setType(event.target.value)}
          value={type}
        >
          {documentTypes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          className="h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          {documentStatuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="border-b border-border bg-surface-soft/60">
            <tr>
              {[
                "Document Name",
                "Type",
                "Linked Supplier",
                "Uploaded",
                "Expiry",
                "Status",
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
            {filteredDocuments.map((document) => (
              <tr className="transition hover:bg-surface-soft/70" key={document.id}>
                <td className="px-6 py-5 font-semibold text-slate-950">
                  <Link className="text-slate-950 hover:text-primary" href={`/documents/${document.id}`}>
                    {document.name}
                  </Link>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{document.type}</td>
                <td className="px-6 py-5 text-sm text-slate-600">
                  {document.supplier}
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">
                  {document.uploadedAt}
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">
                  {document.expiryDate}
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={document.status} />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1">
                    <Link
                      aria-label={`View ${document.name}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-primary-soft hover:text-primary"
                      href={`/documents/${document.id}`}
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      aria-label={`Edit ${document.name}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-primary-soft hover:text-primary"
                      href={`/documents/${document.id}#edit-document`}
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <form action={deleteDocumentAction}>
                      <input name="documentId" type="hidden" value={document.id} />
                      <button
                        aria-label={`Delete ${document.name}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-danger"
                        disabled={setupMode}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDocuments.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-sm text-slate-600" colSpan={7}>
                  No documents match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border px-6 py-4 text-sm text-slate-600">
        Showing {filteredDocuments.length} of {documents.length} documents
      </div>
    </Card>
  );
}
