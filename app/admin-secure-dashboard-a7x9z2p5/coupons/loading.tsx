import { Loader2 } from "lucide-react"

export default function CouponsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amber-800 mb-6">Coupon Management</h1>
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    </div>
  )
}
