import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <BadgeCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary">
            Reset password
          </h1>
          <p className="mt-2 text-slate-600">
            Password reset email flow will be connected after Supabase email
            settings are finalized.
          </p>
        </div>

        <label className="mt-8 block">
          <span className="text-sm font-semibold text-slate-900">
            Email Address
          </span>
          <input
            className="mt-2 h-12 w-full rounded-lg border border-border px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="user@company.com"
            type="email"
          />
        </label>

        <button className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">
          Send Reset Link
        </button>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link className="font-semibold text-primary hover:text-primary-dark" href="/login">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
