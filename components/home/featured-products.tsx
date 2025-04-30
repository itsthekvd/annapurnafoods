"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { getImageUrlWithFallback } from "@/lib/image-utils"
import { products as defaultProducts, fetchProductsFromDB } from "@/lib/data"
import type { Product } from "@/lib/types"

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()
  const router = useRouter()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        // This will return hardcoded data if the database table doesn't exist
        const products = await fetchProductsFromDB()
        // Only show the first 4 products
        setFeaturedProducts(products.slice(0, 4))
      } catch (error) {
        console.error("Error loading products:", error)
        // Fallback to hardcoded products
        setFeaturedProducts(defaultProducts.slice(0, 4))
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleAddToCart = (productId: string) => {
    const product = featuredProducts.find((p) => p.id === productId)
    if (product) {
      if (product.isSubscription) {
        router.push(`/menu/${product.slug}`)
      } else {
        // Make sure we're adding the product with the correct image URL
        const productWithImage = {
          ...product,
          image: getImageUrlWithFallback(product.id),
        }
        addItem(productWithImage, 1)
        router.push("/cart")
      }
    }
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-800 mb-4">Check Our Menu</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Delicious, nutritious Sattvik meals prepared with love and care by Isha Volunteers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden border-amber-100 hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="pt-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-amber-800 mb-4">Check Our Menu</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Delicious, nutritious Sattvik meals prepared with love and care by Isha Volunteers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden border-amber-100 hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <Image
                  src={product.image || "/placeholder.svg?height=400&width=400&query=food"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center mb-2">
                  <span className="text-amber-700 font-bold">₹{product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-gray-500 text-sm line-through ml-2">₹{product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/menu/${product.slug}`}>
                  <Button variant="outline" className="border-amber-700 text-amber-700 hover:bg-amber-50">
                    View Details
                  </Button>
                </Link>
                <Button className="bg-amber-700 hover:bg-amber-800" onClick={() => handleAddToCart(product.id)}>
                  {product.isSubscription ? "Subscribe" : "Order Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/menu">
            <Button className="bg-amber-700 hover:bg-amber-800 px-8">View All Menu Items</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
