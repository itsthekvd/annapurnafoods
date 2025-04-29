import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="rounded-lg border p-6 mb-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-full max-w-md mb-6" />

        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b pb-4 mb-4">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </div>
              <div>
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}

        <Skeleton className="h-10 w-32 mt-4" />
      </div>
    </div>
  )
}
