"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  label,
  name,
  placeholder,
  action,
}: {
  label: string;
  name: string;
  placeholder: string;
  action?: ReactNode;
}) {
  const inputId = useId();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="block">
      <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-900">
        <label htmlFor={inputId}>{label}</label>
        {action}
      </div>
      <div className="relative mt-2">
        <input
          id={inputId}
          className="h-12 w-full rounded-lg border border-border px-4 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          name={name}
          placeholder={placeholder}
          required
          type={showPassword ? "text" : "password"}
        />
        <button
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-surface-soft hover:text-primary"
          onClick={() => setShowPassword((value) => !value)}
          type="button"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
