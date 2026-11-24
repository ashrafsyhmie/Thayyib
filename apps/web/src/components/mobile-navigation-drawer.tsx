"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CircleHelp, LogOut, Menu, X } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { navigationItems } from "@/lib/demo-data";

export function MobileNavigationDrawer({ activePath }: { activePath: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Open navigation"
        className="mr-3 rounded-lg border border-border bg-white p-2 text-slate-700 shadow-sm lg:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          aria-label="Close navigation"
          className={`absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
          type="button"
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[280px] max-w-[82vw] flex-col border-r border-border bg-[#07100e]/95 shadow-xl backdrop-blur-2xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Link
              className="flex items-center gap-3"
              href="/dashboard"
              onClick={() => setOpen(false)}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 p-1.5">
                <Image
                  alt=""
                  className="h-full w-full object-contain"
                  height={445}
                  src="/brand/thayyib-mark.png"
                  width={652}
                />
              </span>
              <span>
                <span className="block text-xl font-bold tracking-tight text-primary">
                  Thayyib
                </span>
                <span className="block text-xs text-slate-600">
                  Halal Compliance
                </span>
              </span>
            </Link>
            <button
              aria-label="Close navigation"
              className="rounded-lg border border-border bg-white p-2 text-slate-600"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
            {navigationItems.map((item) => {
              const isActive = item.href === activePath;

              return (
                <Link
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-slate-700 hover:bg-surface-soft hover:text-primary"
                  }`}
                  href={item.href}
                  key={item.label}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-border px-4 py-4">
            <Link
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                activePath === "/help"
                  ? "bg-primary-soft text-primary"
                  : "text-slate-700 hover:bg-surface-soft hover:text-primary"
              }`}
              href="/help"
              onClick={() => setOpen(false)}
            >
              <CircleHelp className="h-5 w-5" />
              Help Center
            </Link>
            <form action={signOutAction}>
              <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-surface-soft hover:text-primary">
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}
