import type { ComponentPropsWithoutRef, ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          Thayyib Workspace
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
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
  ...props
}: {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-border bg-surface shadow-sm backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Valid: "border-success/25 bg-emerald-50 text-success",
    Complete: "border-success/25 bg-emerald-50 text-success",
    "Expiring Soon": "border-warning/25 bg-amber-50 text-warning",
    Expired: "border-danger/25 bg-red-50 text-danger",
    "Missing Certificate": "border-info/25 bg-blue-50 text-info",
    "Missing Document": "border-danger/25 bg-red-50 text-danger",
    "Needs Review": "border-warning/25 bg-amber-50 text-warning",
    High: "border-danger/25 bg-red-50 text-danger",
    Medium: "border-warning/25 bg-amber-50 text-warning",
    Low: "border-success/25 bg-emerald-50 text-success",
    Unknown: "border-white/15 bg-slate-100 text-slate-600",
    Info: "border-info/25 bg-blue-50 text-info",
    Passed: "border-success/25 bg-emerald-50 text-success",
    Failed: "border-danger/25 bg-red-50 text-danger",
    Ready: "border-info/25 bg-blue-50 text-info",
    Skipped: "border-white/15 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] ?? "border-white/15 bg-slate-100 text-slate-600"
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-extrabold text-[#070b0a] shadow-sm transition hover:bg-white ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-surface-soft hover:text-primary">
      {children}
    </button>
  );
}

export function SetupNotice({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-warning shadow-sm backdrop-blur-xl">
      <p className="font-semibold">Supabase schema setup needed</p>
      <p className="mt-1 leading-6">
        The app is showing demo data. Run `supabase/schema.sql` in the Supabase
        SQL editor to enable live company, supplier, document, inventory,
        notification, and audit data.
      </p>
    </div>
  );
}
