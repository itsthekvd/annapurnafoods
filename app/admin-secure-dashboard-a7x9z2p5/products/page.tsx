"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getSupabaseServiceClient } from "@/lib/supabase-client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchProductsFromDB } from "@/lib/data"
import type { Product } from "@/lib/types"

export default function ProductManagementPage() {
  const router = useRouter()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Check if authenticated
  useEffect(() => {
    const auth = localStorage.getItem("annapurna-admin-auth")
    if (auth !== "authenticated") {
      router.push("/admin-secure-dashboard-a7x9z2p5")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true)

        // First try to load from database
        try {
          const products = await fetchProductsFromDB()
          if (products && products.length > 0) {
            setAllProducts(products)
            return
          }
        } catch (dbError) {
          console.error("Error loading products from DB:", dbError)
          setDebugInfo(`DB Error: ${String(dbError)}`)
        }

        // Fallback to static data if DB fails
        const { products, specialProducts } = await import("@/lib/data")
        setAllProducts([...products, ...specialProducts])
      } catch (error) {
        console.error("Error loading products:", error)
        setMessage({ type: "error", text: "Failed to load products. Please try again." })
      } finally {
        setIsLoadingProducts(false)
      }
    }

    if (isAuthenticated) {
      loadProducts()
    }
  }, [isAuthenticated])

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

  const refreshProducts = async () => {
    try {
      setIsLoadingProducts(true)
      setMessage({ type: "", text: "" })

      // First try to load from database
      try {
        const products = await fetchProductsFromDB()
        if (products && products.length > 0) {
          setAllProducts(products)
          setMessage({ type: "success", text: "Products refreshed successfully from database!" })
          return
        }
      } catch (dbError) {
        console.error("Error refreshing products from DB:", dbError)
        setDebugInfo(`Refresh DB Error: ${String(dbError)}`)
      }

      // Fallback to static data if DB fails
      const { products, specialProducts } = await import("@/lib/data?timestamp=" + Date.now())
      setAllProducts([...products, ...specialProducts])
      setMessage({ type: "success", text: "Products refreshed successfully from static data!" })
    } catch (error) {
      console.error("Error refreshing products:", error)
      setMessage({ type: "error", text: "Failed to refresh products. Please try again." })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const createProductsTable = async () => {
    try {
      const supabase = getSupabaseServiceClient()

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

      // Try to execute SQL directly via API endpoint
      try {
        const response = await fetch("/api/admin/exec-sql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sql: createTableSQL }),
        })

        if (!response.ok) {
          console.warn("Failed to create table via API, falling back to RPC")
        }
      } catch (apiError) {
        console.warn("Error calling exec-sql API:", apiError)
      }

      // Fallback: Try to use the built-in RPC function
      try {
        const { error: rpcError } = await supabase.rpc("exec_sql", { sql: createTableSQL })
        if (rpcError) {
          console.error("Error creating table via RPC:", rpcError)
        }
      } catch (rpcError) {
        console.warn("RPC method failed:", rpcError)
      }

      return true
    } catch (error) {
      console.error("Error creating products table:", error)
      throw error
    }
  }

  const saveChanges = async () => {
    setIsLoading(true)
    setMessage({ type: "", text: "" })
    setDebugInfo(null)

    try {
      // Use the service client for admin operations to ensure proper permissions
      const supabase = getSupabaseServiceClient()

      // First, check if products table exists
      const { data: tableExists, error: tableCheckError } = await supabase
        .from("products")
        .select("id")
        .limit(1)
        .maybeSingle()

      // If table doesn't exist or there's an error, create it
      if (tableCheckError || !tableExists) {
        await createProductsTable()
      }

      // Update existing products
      const updatePromises = allProducts.map(async (product) => {
        try {
          const { error } = await supabase.from("products").upsert(
            {
              id: product.id,
              name: product.name,
              price: product.price,
              original_price: product.originalPrice || product.price,
              description: product.description,
              image: product.image,
              is_subscription: product.isSubscription || false,
              slug: product.slug,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          )

          if (error) {
            console.error(`Error updating product ${product.id}:`, error)
            return { success: false, id: product.id, error }
          }
          return { success: true, id: product.id }
        } catch (err) {
          console.error(`Exception updating product ${product.id}:`, err)
          return { success: false, id: product.id, error: err }
        }
      })

      const results = await Promise.all(updatePromises)
      const failures = results.filter((r) => !r.success)

      if (failures.length > 0) {
        console.error("Some products failed to update:", failures)
        setMessage({
          type: "warning",
          text: `Updated ${results.length - failures.length} products, but ${failures.length} failed. Please try again.`,
        })
        setDebugInfo(`Failed products: ${failures.map((f) => f.id).join(", ")}`)
      } else {
        // Clear any cached data to ensure fresh data is loaded
        localStorage.removeItem("annapurna-products-cache")

        setMessage({
          type: "success",
          text: "Product prices updated successfully! Please refresh the website to see changes.",
        })
      }
    } catch (error: any) {
      console.error("Error saving product prices:", error)
      setMessage({ type: "error", text: `Failed to update product prices: ${error.message || "Unknown error"}` })
      setDebugInfo(`Error details: ${String(error)}`)
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshProducts} disabled={isLoadingProducts} className="mr-2">
            {isLoadingProducts ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </>
            )}
          </Button>
          <Link href="/admin-secure-dashboard-a7x9z2p5">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {message.text && (
        <Alert
          className={`mb-6 ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : message.type === "warning"
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "error" && <AlertCircle className="h-4 w-4 mr-2" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
          <AlertDescription>
            <details>
              <summary>Debug Information (Click to expand)</summary>
              <pre className="mt-2 text-xs overflow-auto max-h-40">{debugInfo}</pre>
            </details>
          </AlertDescription>
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

          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
              <span className="ml-2 text-amber-700">Loading products...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {allProducts.map((product) => (
                <div key={product.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4">
                  <div className="flex items-center">
                    <div className="relative h-16 w-16 mr-3">
                      <Image
                        src={product.image || "/placeholder.svg?height=100&width=100&query=food"}
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
          )}

          <Button
            onClick={saveChanges}
            disabled={isLoading || isLoadingProducts}
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
