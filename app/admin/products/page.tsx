"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Import the products data
import { products } from "@/lib/data"

export default function ProductManagementPage() {
  const router = useRouter()
  const [productList, setProductList] = useState(products)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  // Check if authenticated
  useEffect(() => {
    const auth = localStorage.getItem("annapurna-admin-auth")
    if (auth !== "authenticated") {
      router.push("/admin")
    }
  }, [router])

  const handlePriceChange = (id: string, newPrice: string) => {
    setProductList(
      productList.map((product) => {
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
      // In a real application, this would save to a database
      // For now, we'll just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the products in localStorage for demo purposes
      localStorage.setItem("annapurna-products", JSON.stringify(productList))

      setMessage({ type: "success", text: "Product prices updated successfully!" })
    } catch (error) {
      console.error("Error saving product prices:", error)
      setMessage({ type: "error", text: "Failed to update product prices. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amber-800">Product Management</h1>
        <Link href="/admin">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Update Product Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Modify the prices of your products below. Changes will be reflected across the website.
          </p>

          <div className="space-y-4">
            {productList.map((product) => (
              <div key={product.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b pb-4">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.description?.substring(0, 60)}...</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Price: ₹{product.price.toFixed(2)}</p>
                </div>
                <div>
                  <Label htmlFor={`price-${product.id}`} className="sr-only">
                    New Price
                  </Label>
                  <div className="flex items-center">
                    <span className="mr-2">₹</span>
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
            {isLoading ? "Saving..." : "Save Changes"}
            {!isLoading && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
