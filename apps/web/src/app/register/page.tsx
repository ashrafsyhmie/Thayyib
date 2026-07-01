import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { signInWithGoogleAction, signUpAction } from "@/app/auth/actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    redirectTo?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-xl rounded-xl border border-border bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <BadgeCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary">
            Create your Thayyib account
          </h1>
          <p className="mt-2 text-slate-600">
            Start organizing halal compliance evidence for your company.
          </p>
        </div>

        {params.error && (
          <div className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
            {params.error}
          </div>
        )}

        <form action={signUpAction} className="mt-8 space-y-5">
          <input name="redirectTo" type="hidden" value={params.redirectTo ?? "/"} />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" name="fullName" placeholder="Aminah Rahman" />
            <Field
              label="Company Name"
              name="companyName"
              placeholder="Global Foods Sdn. Bhd."
            />
          </div>

          <Field
            label="Email Address"
            name="email"
            placeholder="user@company.com"
            type="email"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Password"
              name="password"
              placeholder="Password"
              type="password"
            />
            <Field
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm password"
              type="password"
            />
          </div>

          <button
            className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
            type="submit"
          >
            Create Account
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
          Already have an account?{" "}
          <Link className="font-semibold text-primary hover:text-primary-dark" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-border px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}
