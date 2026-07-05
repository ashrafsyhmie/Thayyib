"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  CircleHelp,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
} from "lucide-react";
import { navigationItems } from "@/lib/demo-data";
import { signOutAction } from "@/app/auth/actions";
import { MobileNavigationDrawer } from "@/components/mobile-navigation-drawer";

type AppShellProps = {
  activePath: string;
  children: React.ReactNode;
};

export function AppShell({ activePath, children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem("thayyib-sidebar") === "collapsed";
  });

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("thayyib-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        activePath={activePath}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div
        className={`min-h-screen transition-[padding] duration-200 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-[260px]"
        }`}
      >
        <Topbar activePath={activePath} />
        <MobileNav activePath={activePath} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  activePath,
  collapsed,
  onToggle,
}: {
  activePath: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden overflow-hidden border-r border-border bg-surface-soft transition-[width] duration-200 lg:flex lg:flex-col ${
        collapsed ? "w-20" : "w-[260px]"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-6 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link
          aria-label="Thayyib dashboard"
          className="flex min-w-0 items-center gap-3"
          href="/"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            T
          </div>
          <div className={collapsed ? "hidden" : "min-w-0"}>
            <p className="truncate text-2xl font-bold tracking-tight text-primary">
              Thayyib
            </p>
            <p className="truncate text-sm text-slate-600">Halal Compliance</p>
          </div>
        </Link>
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className={`hidden rounded-lg border border-border bg-white p-2 text-slate-700 shadow-sm transition hover:bg-surface hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 lg:inline-flex ${
            collapsed ? "absolute -right-4 top-20" : ""
          }`}
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto pb-4 [scrollbar-gutter:stable]">
        <div className={collapsed ? "px-4 pb-6" : "px-6 pb-6"}>
          <Link
            aria-label="New Audit"
            className={`flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              collapsed ? "px-0" : ""
            }`}
            href="/audit-readiness"
            title="New Audit"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className={collapsed ? "sr-only" : ""}>New Audit</span>
          </Link>
        </div>

        <nav className="space-y-1 px-4">
          {navigationItems.map((item) => {
            const isActive = item.href === activePath;

            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                className={`flex items-center rounded-lg py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  collapsed ? "justify-center px-0" : "gap-3 px-4"
                } ${
                  isActive
                    ? collapsed
                      ? "bg-emerald-50 text-primary"
                      : "border-l-4 border-primary bg-emerald-50 text-primary"
                    : "text-slate-700 hover:bg-white/70 hover:text-primary"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={collapsed ? "sr-only" : ""}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 space-y-1 border-t border-border px-4 py-5">
          <Link
            href="/help"
            title="Help Center"
            className={`flex items-center rounded-lg py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              collapsed ? "justify-center px-0" : "gap-3 px-4"
            } ${
              activePath === "/help"
                ? "bg-emerald-50 text-primary"
                : "text-slate-700 hover:bg-white/70 hover:text-primary"
            }`}
          >
            <CircleHelp className="h-5 w-5 shrink-0" />
            <span className={collapsed ? "sr-only" : ""}>Help Center</span>
          </Link>
          <form action={signOutAction}>
            <button
              className={`flex w-full items-center rounded-lg py-3 text-sm font-medium text-slate-700 hover:bg-white/70 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                collapsed ? "justify-center px-0" : "gap-3 px-4"
              }`}
              title="Logout"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className={collapsed ? "sr-only" : ""}>Logout</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ activePath }: { activePath: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
      <MobileNavigationDrawer activePath={activePath} />
      <form action="/documents" className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          className="h-11 w-full rounded-lg border border-border bg-surface-soft pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          name="q"
          placeholder="Search suppliers, documents..."
          type="search"
        />
      </form>

      <div className="ml-4 flex items-center gap-3">
        <Link
          aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-700 transition hover:bg-surface-soft"
          href="/notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warning ring-2 ring-white" />
        </Link>
        <Link
          className="hidden items-center gap-2 rounded-full border border-border bg-white py-1 pl-1 pr-3 text-sm font-medium text-slate-800 transition hover:bg-surface-soft sm:flex"
          href="/settings"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            CO
          </span>
          Compliance Officer
        </Link>
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
