"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tag, X, Loader2 } from "lucide-react"
import { useCoupon } from "@/contexts/coupon-context"
import { useToast } from "@/hooks/use-toast"

export function CouponInput() {
  const [couponCode, setCouponCode] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const { appliedCoupon, applyCoupon, removeCoupon } = useCoupon()
  const { toast } = useToast()

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return

    setIsApplying(true)

    // Simulate API call delay
    setTimeout(() => {
      const success = applyCoupon(couponCode.trim())

      if (success) {
        toast({
          title: "Coupon applied!",
          description: `Coupon "${couponCode}" has been applied to your order.`,
        })
        setCouponCode("")
      } else {
        toast({
          title: "Invalid coupon",
          description: "The coupon code you entered is invalid or expired.",
          variant: "destructive",
        })
      }

      setIsApplying(false)
    }, 800)
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order.",
    })
  }

  return (
    <div className="mt-4">
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-800">{appliedCoupon.code}</p>
              <p className="text-xs text-green-600">{appliedCoupon.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="pr-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleApplyCoupon()
                }
              }}
            />
            {couponCode && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setCouponCode("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || isApplying}
            className="bg-amber-700 hover:bg-amber-800"
          >
            {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Apply</>}
          </Button>
        </div>
      )}
    </div>
  )
}

// Also add a default export for backward compatibility
export default CouponInput
