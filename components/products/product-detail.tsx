"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tag, Info } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/cart-context"
import { useCoupon } from "@/contexts/coupon-context"
import { subscriptionOptions } from "@/lib/data"
import { getRecommendationsForProduct } from "@/lib/recommendation-engine"
import ProductRecommendations from "./product-recommendations"
import { useTracking } from "@/contexts/tracking-context"
import ProductImageGallery from "./product-image-gallery"
import { getAdditionalProductImages } from "@/lib/image-utils"

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [subscriptionOption, setSubscriptionOption] = useState(product.isSubscription ? "one-time" : "")
  const [recommendations, setRecommendations] = useState<Product[]>([])

  const router = useRouter()
  const { addItem } = useCart()
  const { appliedCoupon, calculateDiscountedPrice } = useCoupon()
  const { trackProductView } = useTracking()

  // Track product view when component mounts
  useEffect(() => {
    trackProductView(product)
  }, [product, trackProductView])

  // Get recommendations when product changes
  useEffect(() => {
    setRecommendations(getRecommendationsForProduct(product.id))
  }, [product.id])

  // Get the selected subscription option details with memoization
  const selectedOption = useMemo(() => {
    return subscriptionOptions.find((option) => option.id === subscriptionOption)
  }, [subscriptionOption])

  // Calculate prices with memoization
  const originalTotalPrice = useMemo(() => {
    return product.price * (selectedOption?.durationInDays || 1)
  }, [product.price, selectedOption?.durationInDays])

  const discountedPrice = useMemo(() => {
    return calculateDiscountedPrice(
      product.price,
      selectedOption?.durationInDays || 1,
      selectedOption?.discountPercentage || 0,
    )
  }, [product.price, selectedOption?.durationInDays, selectedOption?.discountPercentage, calculateDiscountedPrice])

  // Calculate savings with memoization
  const totalSavings = useMemo(() => {
    return originalTotalPrice - discountedPrice
  }, [originalTotalPrice, discountedPrice])

  const savingsPercentage = useMemo(() => {
    return Math.round((totalSavings / originalTotalPrice) * 100)
  }, [totalSavings, originalTotalPrice])

  // Handle quantity change
  const handleQuantityChange = useCallback((value: string) => {
    setQuantity(Number.parseInt(value))
  }, [])

  // Handle subscription option change
  const handleSubscriptionChange = useCallback((value: string) => {
    setSubscriptionOption(value)
  }, [])

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    if (product.isSubscription && subscriptionOption) {
      const option = subscriptionOptions.find((opt) => opt.id === subscriptionOption)
      addItem(product, 1, undefined, subscriptionOption, option?.durationInDays)
    } else {
      addItem(product, quantity)
    }

    // Navigate to cart page
    router.push("/cart")
  }, [product, subscriptionOption, quantity, addItem, router])

  // Render subscription options section
  const renderSubscriptionOptions = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Choose Your Plan</label>
      <Select value={subscriptionOption} onValueChange={handleSubscriptionChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          {subscriptionOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name} {option.discountPercentage > 0 && `(${option.discountPercentage}% extra off)`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedOption && (
        <div className="mt-4">
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="pt-4 pb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Plan:</span>
                  <span className="font-medium">{selectedOption.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Duration:</span>
                  <span className="font-medium">{selectedOption.durationInDays} day(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Original Price:</span>
                  <span className="font-medium">₹{originalTotalPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon Discount:</span>
                    <span className="font-medium">
                      -₹{(appliedCoupon.discount * (selectedOption.durationInDays || 1)).toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedOption.discountPercentage > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Plan Discount ({selectedOption.discountPercentage}%):</span>
                    <span className="font-medium">
                      -₹{(originalTotalPrice * (selectedOption.discountPercentage / 100)).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Final Price:</span>
                    <span className="text-amber-700">₹{discountedPrice.toFixed(2)}</span>
                  </div>
                </div>
                {totalSavings > 0 && (
                  <div className="bg-green-100 p-2 rounded-md text-center text-green-800 font-medium mt-2">
                    You save ₹{totalSavings.toFixed(2)} ({savingsPercentage}%)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  // Render quantity selector section
  const renderQuantitySelector = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
      <Select value={quantity.toString()} onValueChange={handleQuantityChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select quantity" />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5].map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-4">
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Original Price:</span>
                <span className="font-medium">₹{(product.price * quantity).toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-700">
                  <span>Coupon Discount:</span>
                  <span className="font-medium">-₹{(appliedCoupon.discount * quantity).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Final Price:</span>
                  <span className="text-amber-700">
                    ₹{calculateDiscountedPrice(product.price, quantity).toFixed(2)}
                  </span>
                </div>
              </div>
              {appliedCoupon && (
                <div className="bg-green-100 p-2 rounded-md text-center text-green-800 font-medium mt-2">
                  You save ₹{(appliedCoupon.discount * quantity).toFixed(2)} (
                  {Math.round((appliedCoupon.discount / product.price) * 100)}%)
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <ProductImageGallery
            mainImage={product.image || "/placeholder.svg"}
            additionalImages={getAdditionalProductImages(product.id)}
            productName={product.name}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-amber-800 mb-4">{product.name}</h1>

          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold text-amber-700">₹{product.price.toFixed(2)}</span>
            {appliedCoupon && (
              <Badge className="ml-3 bg-green-100 text-green-800 border-green-200">
                <Tag className="h-3 w-3 mr-1" />
                {appliedCoupon.code}
              </Badge>
            )}
          </div>

          {appliedCoupon && (
            <Card className="mb-6 bg-green-50 border-green-100">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800">Promotional Discount Applied!</h3>
                    <p className="text-green-700 text-sm">
                      {appliedCoupon.description}:
                      {appliedCoupon.type === "fixed"
                        ? ` ₹${appliedCoupon.discount} off per meal`
                        : ` ${appliedCoupon.discount}% off your order`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="prose prose-amber mb-6">
            <p className="text-gray-700 text-lg">{product.description}</p>

            {product.longDescription && <div className="mt-4 text-gray-600">{product.longDescription}</div>}
          </div>

          <Card className="mb-6 bg-amber-50 border-amber-100">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <p className="text-gray-600">
                {product.name.includes("Brunch") ? "Brunch delivery at 8:30am" : "Dinner delivery at 8:30pm"}
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Note:</strong> We require at least 24 hours to prepare your order.
                {product.isSubscription
                  ? " Your subscription will begin on your selected start date."
                  : " Please select a delivery date during checkout that is at least 24 hours from now."}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {product.isSubscription ? renderSubscriptionOptions() : renderQuantitySelector()}

            <Button
              onClick={handleAddToCart}
              className="w-full bg-amber-700 hover:bg-amber-800 py-6 text-lg"
              disabled={product.isSubscription && !subscriptionOption}
            >
              {product.isSubscription && subscriptionOption !== "one-time" ? "Subscribe Now" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>

      {/* Frequently Purchased Together */}
      {recommendations.length > 0 && (
        <ProductRecommendations title="Frequently Purchased Together" products={recommendations} />
      )}
    </div>
  )
}
