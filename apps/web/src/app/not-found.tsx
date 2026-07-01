import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-lg rounded-xl border border-border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white"
          href="/"
        >
          Back to Dashboard
        </Link>
      </section>
    </main>
  );
}
