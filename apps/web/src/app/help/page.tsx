import Link from "next/link";
import { Activity, LifeBuoy, Mail, MessageSquareText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, SecondaryButton, SetupNotice } from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";

const faqs = [
  {
    question: "Does Thayyib decide whether a product is halal?",
    answer:
      "No. Thayyib only flags potential risks and evidence gaps. Final verification should be done by qualified halal compliance personnel.",
  },
  {
    question: "Why is a document marked as Needs Review?",
    answer:
      "A document may need review when evidence was removed, a certificate is expired, or the document status was changed away from Complete or Valid.",
  },
  {
    question: "What should I do when AI flags an ingredient?",
    answer:
      "Request supplier source evidence, halal certificate support, or formulation clarification before relying on the ingredient.",
  },
  {
    question: "Can I upload scanned documents?",
    answer:
      "Yes. Thayyib attempts OCR for JPG, PNG, and scanned PDF pages. Poor scans may still need manual text correction.",
  },
];

export default async function HelpPage() {
  const appData = await getAppData();

  return (
    <AppShell activePath="/help">
      <PageHeader
        title="Help Center"
        description="Find quick answers, support contacts, and troubleshooting tools."
      />
      <SetupNotice show={appData.setupMode} />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary-soft p-3 text-primary">
              <MessageSquareText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">FAQ</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Common questions for compliance officers using Thayyib.
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-border">
            {faqs.map((faq) => (
              <div className="py-4" key={faq.question}>
                <h3 className="font-semibold text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="rounded-lg bg-primary-soft p-3 text-primary w-fit">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              Contact Support
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              For FYP demo support, collect the page name, browser, and a short
              description of what went wrong.
            </p>
            <a
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
              href="mailto:support@thayyib.local?subject=Thayyib%20Support%20Request"
            >
              <Mail className="h-4 w-4" />
              Email Support
            </a>
          </Card>

          <Card className="border-slate-200 bg-slate-50 p-6">
            <div className="flex items-start gap-3">
              <Activity className="mt-0.5 h-5 w-5 text-slate-500" />
              <div>
                <h2 className="font-semibold text-slate-950">
                  Developer Diagnostics
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use this only when checking Supabase connectivity or test API
                  writes during development.
                </p>
                <Link className="mt-4 inline-block" href="/api-testing">
                  <SecondaryButton>Open Diagnostics</SecondaryButton>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
