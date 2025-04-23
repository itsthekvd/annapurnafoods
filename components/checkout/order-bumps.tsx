"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tag, Check } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/cart-context"
import { useCoupon } from "@/contexts/coupon-context"

interface OrderBumpsProps {
  products: Product[]
  title: string
  description?: string
}

export default function OrderBumps({ products, title, description }: OrderBumpsProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const { addItem, removeItem, items } = useCart()
  const { appliedCoupon, calculateDiscountedPrice } = useCoupon()

  useEffect(() => {
    const cartProductIds = items.map((item) => item.product.id)
    const alreadySelectedProducts = products
      .filter((product) => cartProductIds.includes(product.id))
      .map((product) => product.id)

    setSelectedProducts(alreadySelectedProducts)
  }, [items, products])

  const handleToggleProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (selectedProducts.includes(productId)) {
      // Remove from cart
      removeItem(productId)
      setSelectedProducts((prev) => prev.filter((id) => id !== productId))
    } else {
      // Add to cart
      addItem(product, 1)
      setSelectedProducts((prev) => [...prev, productId])
    }
  }

  if (!products.length) return null

  return (
    <Card className="mb-6 border-amber-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-amber-800">{title}</h3>
        </div>

        {description && <p className="text-gray-600 text-sm mb-4">{description}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => {
            const isSelected = selectedProducts.includes(product.id)
            const discountedPrice = calculateDiscountedPrice(product.price)

            return (
              <div
                key={product.id}
                className={`flex border rounded-md overflow-hidden transition-colors ${
                  isSelected ? "border-amber-500 bg-amber-50" : "border-gray-200"
                }`}
              >
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  {appliedCoupon && (
                    <div className="absolute top-1 right-1">
                      <Badge className="bg-green-600 text-white text-xs px-1 py-0">
                        <Tag className="h-2 w-2 mr-0.5" />₹{appliedCoupon.discount} OFF
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={isSelected}
                          onCheckedChange={() => handleToggleProduct(product.id)}
                          className="mt-1 mr-2"
                        />
                        <div>
                          <label htmlFor={`product-${product.id}`} className="font-medium text-sm cursor-pointer">
                            {product.name}
                          </label>
                          <p className="text-xs text-gray-500 line-clamp-2">{product.description.split(".")[0]}.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <span className="text-amber-700 font-bold text-sm">₹{discountedPrice.toFixed(2)}</span>
                      {appliedCoupon && (
                        <span className="text-gray-500 text-xs line-through ml-1">₹{product.price.toFixed(2)}</span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-green-600 text-xs flex items-center">
                        <Check className="h-3 w-3 mr-0.5" /> Selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
