"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { fetchProductsFromDB } from "@/lib/data"
import type { Product } from "@/lib/types"
import { getImageUrlWithFallback } from "@/lib/image-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { subscriptionOptions } from "@/lib/data"

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
  const [selectedSubscriptionOption, setSelectedSubscriptionOption] = useState<string>("weekly")
  const [selectedSubscriptionDays, setSelectedSubscriptionDays] = useState<number>(30)
  const { addItem } = useCart()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const fetchedProducts = await fetchProductsFromDB()
        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleAddToCart = (product: Product) => {
    // Make sure we're adding the product with the correct image URL
    const productWithImage = {
      ...product,
      image: getImageUrlWithFallback(product.id),
    }
    addItem(productWithImage, 1)
  }

  const handleSubscriptionSelect = useCallback(
    (productId: string) => {
      if (expandedSubscriptionId === productId) {
        setExpandedSubscriptionId(null)
      } else {
        setExpandedSubscriptionId(productId)
        setSelectedSubscriptionOption("weekly")
        setSelectedSubscriptionDays(30)
      }
    },
    [expandedSubscriptionId],
  )

  const handleAddSubscription = useCallback(
    (product: Product) => {
      const option = subscriptionOptions.find((opt) => opt.id === selectedSubscriptionOption)
      if (!option) return

      const productWithImage = {
        ...product,
        image: getImageUrlWithFallback(product.id),
      }

      addItem(productWithImage, 1, undefined, selectedSubscriptionOption, selectedSubscriptionDays)

      setExpandedSubscriptionId(null)
    },
    [addItem, selectedSubscriptionOption, selectedSubscriptionDays],
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
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

          {expandedSubscriptionId === product.id ? (
            <div className="px-6 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Frequency</label>
                  <Select value={selectedSubscriptionOption} onValueChange={setSelectedSubscriptionOption}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} ({option.discountPercentage}% off)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Days</label>
                  <Select
                    value={selectedSubscriptionDays.toString()}
                    onValueChange={(value) => setSelectedSubscriptionDays(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-amber-700 text-amber-700 hover:bg-amber-50"
                  onClick={() => setExpandedSubscriptionId(null)}
                >
                  Cancel
                </Button>
                <Button className="bg-amber-700 hover:bg-amber-800" onClick={() => handleAddSubscription(product)}>
                  Add Subscription
                </Button>
              </div>
            </div>
          ) : (
            <CardFooter className="flex justify-between">
              <Link href={`/menu/${product.slug}`}>
                <Button variant="outline" className="border-amber-700 text-amber-700 hover:bg-amber-50">
                  View Details
                </Button>
              </Link>
              {product.isSubscription ? (
                <Button
                  className="bg-amber-700 hover:bg-amber-800"
                  onClick={() => handleSubscriptionSelect(product.id)}
                >
                  Select Subscription
                </Button>
              ) : (
                <Button className="bg-amber-700 hover:bg-amber-800" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
