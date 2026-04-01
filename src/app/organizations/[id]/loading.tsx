import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationDetailLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Image */}
      <Skeleton className="mb-6 aspect-video w-full max-w-2xl rounded-lg" />

      {/* Metadata */}
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Relation cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <Skeleton className="mb-3 h-4 w-28" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mb-6">
        <Skeleton className="mb-3 h-6 w-20" />
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    </div>
  );
}
