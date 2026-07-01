import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { signInAction, signInWithGoogleAction } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <BadgeCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary">
            Thayyib
          </h1>
          <p className="mt-2 text-slate-600">Stay halal audit-ready</p>
        </div>

        {params.error && (
          <div className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
            {params.error}
          </div>
        )}
        {params.message && (
          <div className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-success">
            {params.message}
          </div>
        )}

        <form action={signInAction} className="mt-8 space-y-5">
          <input name="redirectTo" type="hidden" value={params.redirectTo ?? "/"} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Email Address
            </span>
            <input
              className="mt-2 h-12 w-full rounded-lg border border-border px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              name="email"
              placeholder="user@company.com"
              required
              type="email"
            />
          </label>

          <label className="block">
            <span className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-900">
              Password
              <Link
                className="text-primary hover:text-primary-dark"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </span>
            <input
              className="mt-2 h-12 w-full rounded-lg border border-border px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              name="password"
              placeholder="Password"
              required
              type="password"
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-slate-600">
            <input className="h-4 w-4 rounded border-border accent-primary" type="checkbox" />
            Remember this device
          </label>

          <button
            className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
            type="submit"
          >
            Login
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form action={signInWithGoogleAction}>
          <input name="redirectTo" type="hidden" value={params.redirectTo ?? "/"} />
          <button
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-white text-sm font-semibold text-slate-800 transition hover:bg-surface-soft"
            type="submit"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs font-bold text-primary">
              G
            </span>
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to Thayyib?{" "}
          <Link className="font-semibold text-primary hover:text-primary-dark" href="/register">
            Create an account
          </Link>
        </p>

        <p className="mt-8 text-center text-sm leading-6 text-slate-600">
          Need help accessing your account?
          <br />
          <a className="font-semibold text-primary hover:text-primary-dark" href="#">
            Contact Support
          </a>
        </p>
      </section>
    </main>
  );
}
