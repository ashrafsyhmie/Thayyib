import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { resetPasswordAction } from "@/app/auth/actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;

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
            Enter your account email and we will send a password reset link.
          </p>
        </div>

        <Feedback error={params.error} message={params.message} />

        <form action={resetPasswordAction} className="mt-8">
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

          <button className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link className="font-semibold text-primary hover:text-primary-dark" href="/login">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}

function Feedback({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) {
    return null;
  }

  return (
    <div
      className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
        error
          ? "border-red-100 bg-red-50 text-danger"
          : "border-emerald-100 bg-emerald-50 text-success"
      }`}
    >
      {error ?? message}
    </div>
  );
}
