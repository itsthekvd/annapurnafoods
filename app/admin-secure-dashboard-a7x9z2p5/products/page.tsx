"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Import the products data
import { products, specialProducts } from "@/lib/data"

export default function ProductManagementPage() {
  const router = useRouter()
  const [allProducts, setAllProducts] = useState([...products, ...specialProducts])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if authenticated
  useEffect(() => {
    const auth = localStorage.getItem("annapurna-admin-auth")
    if (auth !== "authenticated") {
      router.push("/admin-secure-dashboard-a7x9z2p5")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handlePriceChange = (id: string, newPrice: string) => {
    setAllProducts(
      allProducts.map((product) => {
        if (product.id === id) {
          return { ...product, price: Number.parseFloat(newPrice) || product.price }
        }
        return product
      }),
    )
  }

  const saveChanges = async () => {
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const supabase = getSupabaseClient()

      // First, check if products table exists
      const { data: tableExists, error: tableCheckError } = await supabase
        .from("products")
        .select("id")
        .limit(1)
        .maybeSingle()

      // If table doesn't exist or there's an error, create it
      if (tableCheckError || !tableExists) {
        // Create products table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price NUMERIC NOT NULL,
            original_price NUMERIC,
            description TEXT,
            image TEXT,
            is_subscription BOOLEAN DEFAULT false,
            slug TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        // Execute the SQL directly
        await supabase.rpc("exec_sql", { sql: createTableSQL }).catch((err) => {
          console.error("Error creating table via RPC:", err)
          // Continue even if this fails - we'll try the insert anyway
        })

        // Insert all products
        for (const product of allProducts) {
          await supabase.from("products").upsert({
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.originalPrice || product.price,
            description: product.description,
            image: product.image,
            is_subscription: product.isSubscription || false,
            slug: product.slug,
          })
        }
      } else {
        // Update existing products
        for (const product of allProducts) {
          await supabase.from("products").upsert({
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.originalPrice || product.price,
            description: product.description,
            image: product.image,
            is_subscription: product.isSubscription || false,
            slug: product.slug,
          })
        }
      }

      // Update localStorage for immediate effect
      localStorage.setItem("annapurna-products", JSON.stringify(allProducts))

      setMessage({ type: "success", text: "Product prices updated successfully! Refresh the website to see changes." })
    } catch (error: any) {
      console.error("Error saving product prices:", error)
      setMessage({ type: "error", text: `Failed to update product prices: ${error.message || "Unknown error"}` })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amber-800">Product Management</h1>
        <Link href="/admin-secure-dashboard-a7x9z2p5">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {message.text && (
        <Alert
          className={`mb-6 ${
            message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "variant-destructive"
          }`}
        >
          {message.type === "error" && <AlertCircle className="h-4 w-4 mr-2" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Update Product Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Modify the prices of your products below. Changes will be reflected across the website after saving.
          </p>

          <div className="space-y-6">
            {allProducts.map((product) => (
              <div key={product.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4">
                <div className="flex items-center">
                  <div className="relative h-16 w-16 mr-3">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.id}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-700">{product.description?.substring(0, 100)}...</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {product.isSubscription ? "Subscription Product" : "One-time Purchase"}
                  </p>
                </div>
                <div>
                  <Label htmlFor={`price-${product.id}`}>Price (₹)</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id={`price-${product.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => handlePriceChange(product.id, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={saveChanges}
            disabled={isLoading}
            className="mt-6 w-full md:w-auto bg-amber-700 hover:bg-amber-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
