import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 text-base text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Valid: "bg-emerald-50 text-success",
    Complete: "bg-emerald-50 text-success",
    "Expiring Soon": "bg-amber-50 text-warning",
    Expired: "bg-red-50 text-danger",
    "Missing Certificate": "bg-blue-50 text-slate-600",
    "Missing Document": "bg-red-50 text-danger",
    "Needs Review": "bg-amber-50 text-warning",
    High: "bg-red-50 text-danger",
    Medium: "bg-amber-50 text-warning",
    Info: "bg-blue-50 text-info",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function PrimaryButton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-surface-soft">
      {children}
    </button>
  );
}

export function SetupNotice({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
      <p className="font-semibold">Supabase schema setup needed</p>
      <p className="mt-1 leading-6">
        The app is showing demo data. Run `supabase/schema.sql` in the Supabase
        SQL editor to enable live company, supplier, document, notification, and
        audit data.
      </p>
    </div>
  );
}
