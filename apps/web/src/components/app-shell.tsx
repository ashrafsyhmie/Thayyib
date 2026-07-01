import Link from "next/link";
import {
  Bell,
  CircleHelp,
  LogOut,
  Menu,
  Plus,
  Search,
} from "lucide-react";
import { navigationItems } from "@/lib/demo-data";
import { signOutAction } from "@/app/auth/actions";

type AppShellProps = {
  activePath: string;
  children: React.ReactNode;
};

export function AppShell({ activePath, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar activePath={activePath} />
      <div className="min-h-screen lg:pl-[260px]">
        <Topbar />
        <MobileNav activePath={activePath} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-border bg-surface-soft lg:flex lg:flex-col">
      <Link className="flex items-center gap-3 px-6 py-6" href="/">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          T
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-primary">Thayyib</p>
          <p className="text-sm text-slate-600">Halal Compliance</p>
        </div>
      </Link>

      <div className="px-6 pb-6">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark">
          <Plus className="h-4 w-4" />
          New Audit
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-5">
        {navigationItems.map((item) => {
          const isActive = item.href === activePath;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "border-l-4 border-primary bg-emerald-50 text-primary"
                  : "text-slate-700 hover:bg-white/70 hover:text-primary"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border px-5 py-5">
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/70 hover:text-primary"
        >
          <CircleHelp className="h-5 w-5" />
          Help Center
        </a>
        <form action={signOutAction}>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/70 hover:text-primary">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
      <button
        aria-label="Open navigation"
        className="mr-3 rounded-lg border border-border bg-white p-2 text-slate-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          className="h-11 w-full rounded-lg border border-border bg-surface-soft pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Search suppliers, documents..."
          type="search"
        />
      </div>

      <div className="ml-4 flex items-center gap-3">
        <Link
          aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-700 transition hover:bg-surface-soft"
          href="/notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warning ring-2 ring-white" />
        </Link>
        <button className="hidden items-center gap-2 rounded-full border border-border bg-white py-1 pl-1 pr-3 text-sm font-medium text-slate-800 transition hover:bg-surface-soft sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            CO
          </span>
          Compliance Officer
        </button>
      </div>
    </header>
  );
}

function MobileNav({ activePath }: { activePath: string }) {
  return (
    <nav className="sticky top-16 z-10 flex gap-2 overflow-x-auto border-b border-border bg-white px-4 py-3 lg:hidden">
      {navigationItems.map((item) => {
        const isActive = item.href === activePath;

        return (
          <Link
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium ${
              isActive
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-white text-slate-700"
            }`}
            href={item.href}
            key={item.label}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
