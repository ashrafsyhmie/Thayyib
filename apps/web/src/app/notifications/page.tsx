import { Bell, CheckCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  markNotificationsReadAction,
  refreshComplianceRemindersAction,
} from "@/app/actions";
import { Card, PageHeader, SecondaryButton, SetupNotice, StatusBadge } from "@/components/ui";
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

      <Card className="overflow-hidden">
        <div className="border-b border-border bg-surface-soft/60 px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {["All", "Unread", "High Priority", "Document Updates"].map(
              (filter) => (
                <button
                  className="rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-surface-soft"
                  key={filter}
                >
                  {filter}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="divide-y divide-border">
          {notifications.map((notification) => (
            <div
              className={`flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between ${
                notification.unread ? "bg-emerald-50/40" : "bg-white"
              }`}
              key={notification.title}
            >
              <div className="flex gap-4">
                <span className="mt-1 rounded-lg bg-white p-2 text-primary shadow-sm">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-950">
                      {notification.title}
                    </h2>
                    {notification.unread && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {notification.detail}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {notification.time}
                  </p>
                </div>
              </div>
              <StatusBadge status={notification.priority} />
            </div>
          ))}
        </div>
      </Card>
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
