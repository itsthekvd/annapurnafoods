"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { products } from "@/lib/data"
import { useCart } from "@/contexts/cart-context"
import { getImageUrlWithFallback } from "@/lib/image-utils"
// First, import the useCoupon hook from the coupon context
import { useCoupon } from "@/contexts/coupon-context"

export default function FeaturedProducts() {
  // Only show the first 4 products
  const featuredProducts = products.slice(0, 4)
  const { addItem } = useCart()
  const router = useRouter()
  // Add the coupon hook to access coupon functionality
  const { appliedCoupon, calculateDiscountedPrice } = useCoupon()

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId)
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

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-amber-800 mb-4">Check Our Menu</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Delicious, nutritious Sattvik meals prepared with love and care by Isha Volunteers.
          </p>
        </div>

        {/* Update the grid div to include a coupon badge if a coupon is applied */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {appliedCoupon && (
            <div className="absolute -top-4 left-0 bg-amber-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm">
              Coupon: {appliedCoupon.code} Applied
            </div>
          )}

          {featuredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden border-amber-100 hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <Image
                  src="https://mlfrqt0dgucs.i.optimole.com/w:auto/h:auto/q:auto/id:fb208102d0f45e8d1da54c42447aa7f5/directUpload/brunch-dinner-34.jpg"
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center mb-2">
                  {/* Update the price display to show strikethrough and discounted price */}
                  {appliedCoupon ? (
                    <>
                      <span className="text-amber-700 font-bold">
                        ₹{calculateDiscountedPrice(product.price, 1, 0, product).toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm line-through ml-2">₹{product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-amber-700 font-bold">₹{product.price.toFixed(2)}</span>
                  )}
                  {product.originalPrice && !appliedCoupon && (
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
