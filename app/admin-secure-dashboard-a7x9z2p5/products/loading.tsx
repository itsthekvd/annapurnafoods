import { Loader2 } from "lucide-react"

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-amber-600">Loading products...</span>
      </div>
    </div>
  )
}
