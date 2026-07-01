import Link from "next/link";
import { FileUp, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SetupNotice, StatusBadge } from "@/components/ui";
import { uploadDocumentAction } from "@/app/actions";
import { getAppData } from "@/lib/data/app-data";
import type { DocumentType } from "@/lib/data/types";

const documentTypes: DocumentType[] = [
  "Supplier Certificate",
  "Ingredient List",
  "SOP Document",
  "Audit Evidence",
  "Other",
];

type DocumentsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const [{ documents, suppliers, setupMode }, params] = await Promise.all([
    getAppData(),
    searchParams,
  ]);

  return (
    <AppShell activePath="/documents">
      <PageHeader
        title="Document Management"
        description="Upload, organize, and review compliance evidence in one place."
      />
      <SetupNotice show={setupMode} />
      <Feedback error={params.error} message={params.message} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
        <Card className="p-6">
          <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-surface-soft p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-sm">
              <FileUp className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-950">
              Upload compliance document
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Store certificates, ingredient lists, SOPs, and audit evidence.
            </p>
          </div>

          <form action={uploadDocumentAction} className="mt-6 space-y-4">
            <Field label="Document Name" name="name" placeholder="Supplier Certificate 2026" />
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">
                Document Type
              </span>
              <select
                className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                name="documentType"
              >
                {documentTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">
                Linked Supplier
              </span>
              <select
                className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                name="supplierId"
              >
                <option value="">Internal / not linked</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Expiry Date"
              name="expiryDate"
              required={false}
              type="date"
            />
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">
                File
              </span>
              <input
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                name="file"
                type="file"
              />
            </label>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark">
              <Upload className="h-4 w-4" />
              Upload Document
            </button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-border bg-surface-soft/60">
                <tr>
                  {[
                    "Document Name",
                    "Type",
                    "Linked Supplier",
                    "Uploaded",
                    "Expiry",
                    "Status",
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
                {documents.map((document) => (
                  <tr className="transition hover:bg-surface-soft/70" key={document.id}>
                    <td className="px-6 py-5 font-semibold text-slate-950">
                      <Link
                        className="text-slate-950 hover:text-primary"
                        href={`/documents/${document.id}`}
                      >
                        {document.name}
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {document.type}
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-6 py-4 text-sm text-slate-600">
            Showing {documents.length} documents
          </div>
        </Card>
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
