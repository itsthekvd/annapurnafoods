"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/cart-context"
import { useCoupon } from "@/contexts/coupon-context"

interface ProductRecommendationsProps {
  title: string
  products: Product[]
}

export default function ProductRecommendations({ title, products }: ProductRecommendationsProps) {
  const { addItem } = useCart()
  const { appliedCoupon, calculateDiscountedPrice } = useCoupon()

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
  }

  if (!products.length) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold text-amber-800 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-amber-100 hover:shadow-md transition-shadow">
            <div className="relative h-40">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              {appliedCoupon && !product.isSubscription && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-600 text-white">
                    <Tag className="h-3 w-3 mr-1" />₹{appliedCoupon.discount} OFF
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="pt-4 pb-2">
              <h3 className="text-base font-semibold mb-1">{product.name}</h3>
              <div className="flex items-center mb-1">
                {appliedCoupon && !product.isSubscription ? (
                  <>
                    <span className="text-amber-700 font-bold">
                      ₹{calculateDiscountedPrice(product.price).toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-xs line-through ml-2">₹{product.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-amber-700 font-bold">₹{product.price.toFixed(2)}</span>
                )}
              </div>
              <p className="text-gray-600 text-xs line-clamp-2">{product.description}</p>
            </CardContent>
            <CardFooter className="pt-0 pb-4 flex justify-between">
              <Link href={`/menu/${product.slug}`}>
                <Button variant="outline" size="sm" className="border-amber-700 text-amber-700 hover:bg-amber-50">
                  Details
                </Button>
              </Link>
              <Button size="sm" className="bg-amber-700 hover:bg-amber-800" onClick={() => handleAddToCart(product)}>
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
