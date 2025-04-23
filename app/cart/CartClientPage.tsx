"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Plus, Minus, Tag, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useCoupon } from "@/contexts/coupon-context"
import { subscriptionOptions } from "@/lib/data"
import { getRecommendationsForCart } from "@/lib/recommendation-engine"
import ProductRecommendations from "@/components/products/product-recommendations"
import type { Product } from "@/lib/types"
import OrderSummary from "@/components/checkout/order-summary"
import DirectCheckoutLink from "@/components/checkout/direct-checkout-link"

export default function CartClientPage() {
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total } = useCart()
  const { appliedCoupon } = useCoupon()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartItems, setCartItems] = useState<typeof items>([])

  // Load cart items directly from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("annapurna-cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error)
    }

    // Short timeout to ensure cart context is fully initialized
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Update cart items when context items change
  useEffect(() => {
    if (items.length > 0) {
      setCartItems(items)
    }
  }, [items])

  // Update recommendations when cart items change
  useEffect(() => {
    const cartItemIds = cartItems.map((item) => item.product.id)
    setRecommendations(getRecommendationsForCart(cartItemIds))
  }, [cartItems])

  // Proceed to checkout
  const proceedToCheckout = () => {
    try {
      // First, ensure cart is saved to localStorage
      localStorage.setItem("annapurna-cart", JSON.stringify(items))

      // Log for debugging
      console.log("Cart saved to localStorage:", items)

      // Use a direct window location change for most reliable navigation
      window.location.href = "/checkout"
    } catch (error) {
      console.error("Error during checkout navigation:", error)
      // Fallback to direct navigation if anything fails
      window.location.href = "/checkout"
    }
  }

  // Get subscription option name
  const getSubscriptionName = (optionId: string) => {
    const option = subscriptionOptions.find((opt) => opt.id === optionId)
    return option ? option.name : optionId
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-amber-800 mb-8">Your Cart</h1>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-700 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/menu">
            <Button className="bg-amber-700 hover:bg-amber-800">Browse Our Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <Card key={`${item.product.id}-${item.subscriptionOption || index}`} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-32 h-32">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{item.product.name}</h3>
                            <p className="text-gray-600 text-sm">
                              {item.subscriptionOption
                                ? `${getSubscriptionName(item.subscriptionOption)}`
                                : item.product.description.split(".")[0] + "."}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 text-right">
                            <p className="font-semibold text-amber-700">
                              {item.subscriptionOption ? (
                                <>₹{(item.product.price * (item.subscriptionDays || 1)).toFixed(2)}</>
                              ) : (
                                <>₹{(item.product.price * item.quantity).toFixed(2)}</>
                              )}
                            </p>
                            {appliedCoupon && (
                              <p className="text-xs text-green-600 flex items-center justify-end">
                                <Tag className="h-3 w-3 mr-1" />
                                Coupon applied
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          {!item.subscriptionOption && (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {item.subscriptionOption && (
                            <div className="text-sm text-gray-600">{item.subscriptionDays} day(s)</div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendations based on cart contents */}
            {recommendations.length > 0 && (
              <div className="mt-8">
                <ProductRecommendations title="You Might Also Like" products={recommendations} />
              </div>
            )}
          </div>

          <div>
            <div className="space-y-4">
              <OrderSummary />
              <Button className="w-full bg-amber-700 hover:bg-amber-800" onClick={proceedToCheckout} type="button">
                Proceed to Checkout
              </Button>
              <DirectCheckoutLink />
              <div className="text-center">
                <Link href="/menu" className="text-amber-700 hover:text-amber-800 text-sm">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
