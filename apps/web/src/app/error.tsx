"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-lg rounded-xl border border-border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          Unable to load this page
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Something went wrong while loading the compliance workspace. Please try
          again.
        </p>
        <button
          className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white"
          onClick={reset}
          type="button"
        >
          Try Again
        </button>
      </section>
    </main>
  );
}

