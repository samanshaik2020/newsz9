export default function Loading() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading page…</span>
      <div className="grid gap-6 motion-safe:animate-pulse" aria-hidden="true">
        <div className="h-4 w-32 rounded bg-zinc-100" />
        <div className="h-10 w-3/4 rounded bg-zinc-100" />
        <div className="h-64 rounded-xl bg-zinc-100" />
        <div className="mx-auto grid w-full max-w-3xl gap-4">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="h-4 rounded bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
