export default function Loading() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="h-60 animate-pulse rounded-xl bg-slate-200 lg:col-span-2" />
          <div className="h-60 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-60 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </main>
  );
}

