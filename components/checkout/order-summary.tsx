"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Info, X } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useCoupon } from "@/contexts/coupon-context"
import { subscriptionOptions } from "@/lib/data"

export default function OrderSummary() {
  const { items, removeItem, subtotal, deliveryFee, total } = useCart()
  const { appliedCoupon } = useCoupon()

  // Get subscription option name
  const getSubscriptionName = (optionId: string) => {
    const option = subscriptionOptions.find((opt) => opt.id === optionId)
    return option ? option.name : optionId
  }

  // Calculate the original subtotal without any discounts
  const originalSubtotal = items.reduce((sum, item) => {
    if (item.subscriptionOption) {
      return sum + item.product.price * (item.subscriptionDays || 1)
    }
    return sum + item.product.price * item.quantity
  }, 0)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
        </div>

        {appliedCoupon && (
          <div className="mb-4 bg-green-50 p-3 rounded-md border border-green-100">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Coupon Applied: {appliedCoupon.code}</p>
                <p className="text-xs text-green-700">
                  {appliedCoupon.description}:
                  {appliedCoupon.type === "fixed"
                    ? ` ₹${appliedCoupon.discount} off per meal`
                    : ` ${appliedCoupon.discount}% off your order`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.subscriptionOption || ""}`}
              className="flex justify-between items-center text-sm"
            >
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>
                    {item.product.name}
                    {item.subscriptionOption
                      ? ` (${getSubscriptionName(item.subscriptionOption)})`
                      : ` x ${item.quantity}`}
                  </span>
                  <span className="ml-2">
                    {item.subscriptionOption
                      ? `₹${(item.product.price * (item.subscriptionDays || 1)).toFixed(2)}`
                      : `₹${(item.product.price * item.quantity).toFixed(2)}`}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-transparent"
                onClick={() => removeItem(item.product.id, item.subscriptionOption)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span>₹{deliveryFee.toFixed(2)}</span>
          </div>
          {deliveryFee > 0 && (
            <p className="text-xs text-gray-500 text-right">
              {items.some((item) => item.subscriptionOption && item.subscriptionOption !== "one-time")
                ? (() => {
                    const baseFee = deliveryFee === 30 || deliveryFee === 70 ? deliveryFee : 30
                    const totalDeliveries = items.reduce((sum, item) => {
                      if (item.subscriptionOption && item.subscriptionOption !== "one-time" && item.subscriptionDays) {
                        return sum + item.subscriptionDays
                      }
                      return (
                        sum + (item.subscriptionOption === "one-time" || !item.subscriptionOption ? item.quantity : 0)
                      )
                    }, 0)

                    if (baseFee === 30) {
                      return `Standard delivery (₹30 × ${totalDeliveries} deliveries)`
                    } else if (baseFee === 70) {
                      return `Extended area delivery (₹70 × ${totalDeliveries} deliveries)`
                    } else {
                      return `Delivery fee based on location and frequency`
                    }
                  })()
                : deliveryFee === 30
                  ? "Standard delivery fee (₹30)"
                  : deliveryFee === 70
                    ? "Extended area delivery fee (₹70)"
                    : "Based on your delivery location"}
            </p>
          )}
          {appliedCoupon && (
            <div className="flex justify-between text-green-600">
              <span>
                {appliedCoupon.type === "special" && appliedCoupon.specialAction === "set_total_to_one"
                  ? "Special Discount"
                  : `Discount (${appliedCoupon.code})`}
              </span>
              <span>
                {appliedCoupon.type === "special" && appliedCoupon.specialAction === "set_total_to_one"
                  ? `-₹${(originalSubtotal - 1).toFixed(2)}`
                  : `-₹${(subtotal - (total - deliveryFee)).toFixed(2)}`}
              </span>
            </div>
          )}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-amber-700">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
