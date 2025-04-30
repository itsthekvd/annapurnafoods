import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      <p className="mt-4 text-amber-800">Loading database setup...</p>
    </div>
  )
}
