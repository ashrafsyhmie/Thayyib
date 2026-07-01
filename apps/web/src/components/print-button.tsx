"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-slate-700 print:hidden"
      onClick={() => window.print()}
      type="button"
    >
      <Printer className="h-4 w-4" />
      Print / Save PDF
    </button>
  );
}

