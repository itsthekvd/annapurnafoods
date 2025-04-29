"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { specialProducts } from "@/lib/data"
import { useCart } from "@/contexts/cart-context"
import { getImageUrlWithFallback } from "@/lib/image-utils"

export default function SpecialsSection() {
  const { addItem } = useCart()
  const router = useRouter()

  const handleAddToCart = useCallback(
    (productId: string) => {
      const product = specialProducts.find((p) => p.id === productId)
      if (!product) return

      // Make sure we're adding the product with the correct image URL
      const productWithImage = {
        ...product,
        image: getImageUrlWithFallback(product.id),
      }

      addItem(productWithImage, 1)
      router.push("/cart")
    },
    [addItem, router],
  )

  // Memoize the product cards
  const productCards = useMemo(
    () =>
      specialProducts.map((product) => (
        <Card key={product.id} className="overflow-hidden border-amber-100 hover:shadow-md transition-shadow">
          <div className="relative h-48">
            <Image
              src={getImageUrlWithFallback(product.id) || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="pt-6 pb-4">
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm">{product.description}</p>
          </CardContent>
        </Card>
      )),
    [],
  )

  return (
    <section className="py-16 bg-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-amber-800 mb-4">Check our Specials</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Loved by All Meditators. These Festival Specials are FREE for all monthly subscription plans. But you can
            order them separately whenever you want!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{productCards}</div>

        <div className="text-center mt-12">
          <Link href="/menu">
            <Button className="bg-amber-700 hover:bg-amber-800 px-8">Check Out Menu</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
