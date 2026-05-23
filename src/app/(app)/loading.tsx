export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-bg-tertiary" />
      <div className="h-4 w-72 max-w-full rounded bg-bg-tertiary/80" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-bg-tertiary/60" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-bg-tertiary/40" />
    </div>
  );
}
