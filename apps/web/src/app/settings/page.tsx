import { AppShell } from "@/components/app-shell";
import { PageHeader, SetupNotice } from "@/components/ui";
import { SettingsClient } from "@/app/settings/settings-client";
import { getAppData } from "@/lib/data/app-data";

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

      <SettingsClient company={company} setupMode={setupMode} />
    </AppShell>
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
