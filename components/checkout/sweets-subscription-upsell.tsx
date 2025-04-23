"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Check, X } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { subscriptionOptions } from "@/lib/data"

export default function SweetsSubscriptionUpsell() {
  const [isAdded, setIsAdded] = useState(false)
  const { addItem, removeItem, items } = useCart()
  const [mealSubscription, setMealSubscription] = useState<{
    option: string
    days: number
    name: string
  } | null>(null)

  const [sweetsProduct] = useState({
    id: "sweets-subscription",
    name: "Rotating Sweets Subscription",
    slug: "sweets-subscription",
    description:
      "Enjoy a different sweet treat with each delivery. We'll rotate between Lapshi, Shira, Payasam, and more!",
    price: 200,
    originalPrice: 300,
    image: "/placeholder.svg?height=400&width=600",
    isSubscription: true,
  })

  // Find meal subscription in cart and check if sweets subscription is already added
  useEffect(() => {
    // Find meal subscription (brunch or dinner)
    const mealSub = items.find(
      (item) =>
        (item.product.id === "brunch" || item.product.id === "dinner") &&
        item.subscriptionOption &&
        item.subscriptionOption !== "one-time",
    )

    if (mealSub && mealSub.subscriptionOption && mealSub.subscriptionDays) {
      const option = subscriptionOptions.find((opt) => opt.id === mealSub.subscriptionOption)
      setMealSubscription({
        option: mealSub.subscriptionOption,
        days: mealSub.subscriptionDays,
        name: option?.name || mealSub.subscriptionOption,
      })
    } else {
      setMealSubscription(null)
    }

    // Check if sweets subscription is already in cart
    const sweetsInCart = items.some(
      (item) =>
        item.product.id === sweetsProduct.id && item.subscriptionOption && item.subscriptionOption !== "one-time",
    )

    setIsAdded(sweetsInCart)
  }, [items, sweetsProduct.id])

  const handleAddToCart = () => {
    if (mealSubscription) {
      // Add sweets subscription with the same duration as meal subscription
      addItem(sweetsProduct, 1, undefined, mealSubscription.option, mealSubscription.days)
    } else {
      // Fallback to monthly if no meal subscription found
      addItem(sweetsProduct, 1, undefined, "monthly-1", 30)
    }
  }

  const handleRemove = () => {
    // Remove all sweets subscriptions
    removeItem(sweetsProduct.id)
  }

  // If no meal subscription is found, don't show this component
  if (!mealSubscription) return null

  return (
    <Card className="mb-6 border-amber-200 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-3 text-white">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          <h3 className="font-semibold">Special Offer for Subscribers</h3>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-1/3 h-48 md:h-auto">
            <Image
              src="/placeholder.svg?height=400&width=600&text=Rotating+Sweets"
              alt="Rotating Sweets Subscription"
              fill
              className="object-cover"
            />
            <Badge className="absolute top-2 right-2 bg-green-600 text-white">33% OFF</Badge>
          </div>
          <div className="p-6 flex-1">
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Rotating Sweets Subscription</h3>
            <p className="text-gray-600 mb-4">
              Enhance your meal subscription with our rotating sweets selection. Each delivery comes with a different
              sweet treat, carefully selected to complement your meal. We'll rotate between Lapshi, Shira, Payasam,
              Puran Poli, and more!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <span className="text-sm">Different sweet with each delivery</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <span className="text-sm">Handcrafted traditional sweets</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <span className="text-sm">Perfect portion size</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-amber-700">₹200</span>
                <span className="text-gray-500 text-sm line-through ml-2">₹300</span>
                <span className="text-sm text-gray-600 ml-2">per month</span>
              </div>

              {isAdded ? (
                <div className="flex items-center">
                  <span className="text-green-600 font-medium flex items-center mr-3">
                    <Check className="h-4 w-4 mr-1" /> Added to your order
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <Button className="bg-amber-700 hover:bg-amber-800" onClick={handleAddToCart}>
                    Add to Order
                  </Button>
                  <span className="text-xs text-gray-600 mt-1">Matches your {mealSubscription.name} plan</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
