export default function QuestDetailLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Title */}
      <div className="h-8 w-64 rounded bg-muted" />

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="h-9 w-20 rounded bg-muted" />
        <div className="h-9 w-24 rounded bg-muted" />
      </div>

      {/* Status badge */}
      <div className="h-6 w-20 rounded-full bg-muted" />

      {/* Description card */}
      <div>
        <div className="mb-3 h-6 w-32 rounded bg-muted" />
        <div className="rounded-lg border border-border p-4">
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Sessions card */}
      <div>
        <div className="mb-3 h-6 w-40 rounded bg-muted" />
        <div className="rounded-lg border border-border p-4">
          <div className="flex gap-2">
            <div className="h-6 w-32 rounded-full bg-muted" />
            <div className="h-6 w-28 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
