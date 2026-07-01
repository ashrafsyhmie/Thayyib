import { Bell, Building2, ImagePlus, ShieldCheck, User, Users } from "lucide-react";
import { updateCompanyAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, PrimaryButton, SetupNotice } from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";

const settingsTabs = [
  { label: "Company Profile", icon: Building2, active: true },
  { label: "User Profile", icon: User },
  { label: "Team Members", icon: Users },
  { label: "Roles & Permissions", icon: ShieldCheck },
  { label: "Notifications", icon: Bell },
];

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [{ company, setupMode }, params] = await Promise.all([
    getAppData(),
    searchParams,
  ]);

  return (
    <AppShell activePath="/settings">
      <PageHeader
        title="Settings"
        description="Manage organization details, team access, and notification preferences."
      />
      <SetupNotice show={setupMode} />
      <Feedback error={params.error} message={params.message} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="p-3">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                  tab.active
                    ? "bg-surface-soft text-primary"
                    : "text-slate-700 hover:bg-surface-soft"
                }`}
                key={tab.label}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        <Card className="overflow-hidden">
          <form action={updateCompanyAction}>
            <div className="flex flex-col gap-4 border-b border-border bg-surface-soft/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Company Profile
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  General information about your organization.
                </p>
              </div>
              <PrimaryButton>Save Changes</PrimaryButton>
            </div>

            <div className="space-y-8 p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <button
                  className="flex h-28 w-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-surface-soft text-primary"
                  type="button"
                >
                  <ImagePlus className="h-7 w-7" />
                  <span className="mt-2 text-xs font-semibold">Upload Logo</span>
                </button>
                <div>
                  <p className="font-semibold text-slate-950">Company Logo</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Recommended size 256x256px. PNG or JPG.
                  </p>
                  <button
                    className="mt-3 rounded-lg bg-primary-soft px-4 py-2 text-sm font-semibold text-primary"
                    type="button"
                  >
                    Upload New
                  </button>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Company Name" name="name" value={company.name} />
                <Field
                  label="Registration Number"
                  name="registrationNumber"
                  value={company.registrationNumber}
                />
                <Field
                  className="md:col-span-2"
                  label="Headquarters Address"
                  name="address"
                  value={company.address}
                />
                <Field
                  label="Industry Sector"
                  name="industrySector"
                  value={company.industrySector}
                />
                <Field
                  label="Primary Contact Email"
                  name="primaryContactEmail"
                  value={company.primaryContactEmail}
                />
              </div>
            </div>
          </form>
        </Card>
      </section>
    </AppShell>
  );
}

function Field({
  label,
  name,
  value,
  className = "",
}: {
  label: string;
  name: string;
  value: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-border bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={value}
        name={name}
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
