import Link from "next/link";
import { ArrowLeft, Download, Eye, FileText, Trash2 } from "lucide-react";
import { deleteDocumentAction, updateDocumentAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SecondaryButton, SetupNotice, StatusBadge } from "@/components/ui";
import { getAppData, getDocumentSignedUrl } from "@/lib/data/app-data";
import type { DocumentStatus, DocumentType } from "@/lib/data/types";

const documentTypes: DocumentType[] = [
  "Supplier Certificate",
  "Ingredient List",
  "SOP Document",
  "Audit Evidence",
  "Other",
];

const documentStatuses: DocumentStatus[] = [
  "Valid",
  "Expiring Soon",
  "Expired",
  "Missing Document",
  "Complete",
  "Needs Review",
];

type DocumentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function DocumentDetailPage({
  params,
  searchParams,
}: DocumentDetailPageProps) {
  const [{ id }, appData, query] = await Promise.all([
    params,
    getAppData(),
    searchParams,
  ]);
  const document = appData.documents.find((item) => item.id === id);
  const signedUrl = await getDocumentSignedUrl(document?.storagePath);

  if (!document) {
    return (
      <AppShell activePath="/documents">
        <PageHeader
          title="Document Not Found"
          description="The document may have been deleted or is not available in this workspace."
          action={
            <Link href="/documents">
              <SecondaryButton>
                <ArrowLeft className="h-4 w-4" />
                Back to Documents
              </SecondaryButton>
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell activePath="/documents">
      <PageHeader
        title={document.name}
        description="Review document metadata, supplier link, and evidence status."
        action={
          <Link href="/documents">
            <SecondaryButton>
              <ArrowLeft className="h-4 w-4" />
              Back to Documents
            </SecondaryButton>
          </Link>
        }
      />
      <SetupNotice show={appData.setupMode} />
      <Feedback error={query.error} message={query.message} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="min-h-[520px] p-6">
          <div className="flex h-full min-h-96 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-soft text-center">
            <div className="rounded-full bg-white p-5 text-primary shadow-sm">
              <FileText className="h-10 w-10" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              Document Preview
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Use the secure download link to review the original evidence file.
              Metadata and audit status can be maintained below.
            </p>
            {signedUrl && (
              <a
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white"
                href={signedUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Download className="h-4 w-4" />
                Download File
              </a>
            )}
          </div>
        </Card>

      <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">Metadata</h2>
            <StatusBadge status={document.status} />
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <InfoRow label="Document Type" value={document.type} />
            <InfoRow label="Linked Supplier" value={document.supplier} />
            <InfoRow label="Uploaded" value={document.uploadedAt} />
            <InfoRow label="Expiry Date" value={document.expiryDate} />
          </dl>

          <div className="mt-6 grid gap-3">
            {signedUrl ? (
              <a
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white"
                href={signedUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            ) : (
              <button
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-500"
                type="button"
              >
                <Eye className="h-4 w-4" />
                No file attached
              </button>
            )}
            <form action={deleteDocumentAction}>
              <input name="documentId" type="hidden" value={document.id} />
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-danger disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                disabled={appData.setupMode}
              >
                <Trash2 className="h-4 w-4" />
                Delete Document
              </button>
            </form>
          </div>
        </Card>
      </section>

      <Card className="p-6" id="edit-document">
        <h2 className="text-xl font-semibold text-slate-950">Edit Document</h2>
        <p className="mt-1 text-sm text-slate-600">
          Keep document metadata accurate so audit readiness and reminders are
          based on current evidence.
        </p>
        <form action={updateDocumentAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <input name="documentId" type="hidden" value={document.id} />
          <Field label="Document Name" name="name" value={document.name} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Document Type
            </span>
            <select
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue={document.type}
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
              defaultValue={document.supplierId ?? ""}
              name="supplierId"
            >
              <option value="">Internal / not linked</option>
              {appData.suppliers.map((supplier) => (
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
            value={document.expiryDateRaw ?? ""}
          />
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">Status</span>
            <select
              className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue={document.status}
              name="status"
            >
              {documentStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <button
            className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300 md:col-span-2"
            disabled={appData.setupMode}
          >
            Save Document Changes
          </button>
        </form>
      </Card>
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
