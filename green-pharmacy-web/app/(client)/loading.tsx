import { Skeleton } from "@/components/ui/skeleton"

export default function CatalogLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
