"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ImportOrdersPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin-dashboard-secure" className="mr-4">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-amber-800">Import Orders</h1>
      </div>

      <Card className="mb-6 bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Feature Disabled</h3>
              <p className="text-yellow-700 text-sm">
                The import orders functionality has been temporarily disabled. Please contact the administrator if you
                need to use this feature.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/admin-dashboard-secure/orders")}>
          View Orders Dashboard
        </Button>

        <Button onClick={() => router.push("/")} className="bg-amber-700 hover:bg-amber-800">
          Go to Homepage
        </Button>
      </div>
    </div>
  )
}
