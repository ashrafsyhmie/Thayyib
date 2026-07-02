import { Brain, FileSearch, ShieldAlert } from "lucide-react";
import { analyzeDocumentAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  PageHeader,
  PrimaryButton,
  SetupNotice,
  StatusBadge,
} from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";

type AiAnalyzerPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function AiAnalyzerPage({ searchParams }: AiAnalyzerPageProps) {
  const [appData, params] = await Promise.all([getAppData(), searchParams]);

  return (
    <AppShell activePath="/ai-analyzer">
      <PageHeader
        title="AI Document Analyzer"
        description="Flag potential halal compliance risks from ingredient lists and supporting documents."
      />
      <SetupNotice show={appData.setupMode} />
      <Feedback error={params.error} message={params.message} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary-soft p-3 text-primary">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Analyze Document Text
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Paste OCR text or an ingredient list. This MVP analyzer uses the
                halal risk knowledge base and stores an audit trail.
              </p>
            </div>
          </div>

          <form action={analyzeDocumentAction} className="mt-6 space-y-4">
            <Field
              label="Product Name"
              name="productName"
              placeholder="Chicken curry puff"
              required={false}
            />
            <Field
              label="Brand Name"
              name="brandName"
              placeholder="Thayyib Demo Foods"
              required={false}
            />
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">
                Linked Document
              </span>
              <select
                className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                name="documentId"
              >
                <option value="">Not linked</option>
                {appData.documents.map((document) => (
                  <option key={document.id} value={document.id}>
                    {document.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">
                Document Text
              </span>
              <textarea
                className="mt-2 min-h-52 w-full rounded-lg border border-border px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                name="inputText"
                placeholder="Ingredients: wheat flour, chicken, emulsifier E471, gelatin..."
                required
              />
            </label>
            <PrimaryButton className="w-full">
              <FileSearch className="h-4 w-4" />
              Run AI Analysis
            </PrimaryButton>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/60 p-5">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <p className="text-sm leading-6 text-amber-900">
                Thayyib AI provides compliance assistance and risk detection.
                Final verification should be performed by qualified halal
                compliance personnel.
              </p>
            </div>
          </Card>

          {appData.aiAssessments.map((assessment) => (
            <Card className="p-6" key={assessment.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {assessment.productName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {assessment.brandName} - {assessment.createdAt}
                  </p>
                </div>
                <StatusBadge status={assessment.riskLevel} />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700">
                {assessment.riskSummary}
              </p>
              <p className="mt-3 rounded-lg bg-surface-soft p-3 text-sm font-medium leading-6 text-slate-800">
                {assessment.recommendationText}
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Findings
                  </h3>
                  <div className="mt-3 space-y-3">
                    {assessment.findings.length === 0 && (
                      <p className="rounded-lg border border-border p-4 text-sm text-slate-600">
                        No known high-risk terms detected. This does not confirm
                        halal status.
                      </p>
                    )}
                    {assessment.findings.map((finding) => (
                      <div
                        className="rounded-lg border border-border p-4"
                        key={`${assessment.id}-${finding.item}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-950">
                            {finding.item}
                          </p>
                          <StatusBadge status={finding.riskLevel} />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {finding.risk}
                        </p>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                          {finding.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Audit Trail
                  </h3>
                  <dl className="mt-3 space-y-3 text-sm">
                    <InfoRow
                      label="Confidence"
                      value={`${Math.round(assessment.confidenceScore * 100)}%`}
                    />
                    <InfoRow label="Model" value={assessment.modelName} />
                  </dl>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Sources
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      {assessment.sources.map((source) => (
                        <li key={`${assessment.id}-${source.title}`}>
                          {source.url ? (
                            <a
                              className="text-primary hover:text-primary-dark"
                              href={source.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {source.title}
                            </a>
                          ) : (
                            source.title
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Field({
  label,
  name,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  placeholder: string;
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
      />
    </label>
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
