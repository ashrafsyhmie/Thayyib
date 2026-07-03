import { CheckCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  markNotificationsReadAction,
  refreshComplianceRemindersAction,
} from "@/app/actions";
import { NotificationsClient } from "@/app/notifications/notifications-client";
import { PageHeader, SecondaryButton, SetupNotice } from "@/components/ui";
import { getAppData } from "@/lib/data/app-data";

type NotificationsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;
  const { notifications, setupMode } = await getAppData();

  return (
    <AppShell activePath="/notifications">
      <PageHeader
        title="Notifications"
        description="Track certificate renewals, missing documents, and recent compliance activity."
        action={
          <div className="flex flex-wrap gap-3">
            <form action={refreshComplianceRemindersAction}>
              <SecondaryButton>Refresh Reminders</SecondaryButton>
            </form>
            <form action={markNotificationsReadAction}>
              <SecondaryButton>
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </SecondaryButton>
            </form>
          </div>
        }
      />
      <SetupNotice show={setupMode} />
      <Feedback error={params.error} message={params.message} />

      <NotificationsClient notifications={notifications} setupMode={setupMode} />
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
