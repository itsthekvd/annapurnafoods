"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")

  // Check if already authenticated
  useEffect(() => {
    const auth = localStorage.getItem("annapurna-admin-auth")
    if (auth === "authenticated") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    // Simple password check - this is not secure but meets the requirement
    if (password === "Annapurna2025!") {
      setIsAuthenticated(true)
      localStorage.setItem("annapurna-admin-auth", "authenticated")
      setError("")
    } else {
      setError("Incorrect password. Please try again.")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin()
                    }
                  }}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <Button onClick={handleLogin} className="w-full bg-amber-700 hover:bg-amber-800">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amber-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Manage and track all customer orders</p>
            <Button onClick={() => router.push("/admin/orders")} className="w-full bg-amber-700 hover:bg-amber-800">
              View Orders <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Import Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Import orders from CSV files</p>
            <Button
              onClick={() => router.push("/admin/import-orders")}
              className="w-full bg-amber-700 hover:bg-amber-800"
            >
              Import Orders <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* New Coupon Management Card */}
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Coupon Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">View and manage discount coupons</p>
            <Button onClick={() => router.push("/admin/coupons")} className="w-full bg-amber-700 hover:bg-amber-800">
              Manage Coupons <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Website</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Return to the main website</p>
          <Button onClick={() => router.push("/")} className="w-full bg-amber-700 hover:bg-amber-800">
            Go to Website <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      {/* Coupon Management Card */}
      <div className="w-full md:w-1/3 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage discount coupons</p>
            <Button
              onClick={() => router.push("/admin/coupons")}
              className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <span>Manage Coupons</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
