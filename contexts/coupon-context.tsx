"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { availableCoupons, promotionalCoupon } from "@/lib/data"
import type { Coupon } from "@/lib/types"

interface CouponContextType {
  appliedCoupon: Coupon | null
  isCouponApplied: boolean
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
  toggleCoupon: () => void
  calculateDiscountedPrice: (originalPrice: number, quantity?: number, additionalDiscountPercentage?: number) => number
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: ReactNode }) {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)

  // Auto-apply the promotional coupon on initial load
  useEffect(() => {
    // Check if coupon is disabled in localStorage
    const isCouponDisabled = localStorage.getItem("annapurna-coupon-disabled") === "true"
    if (!isCouponDisabled) {
      setAppliedCoupon(promotionalCoupon)
    }
  }, [])

  const applyCoupon = (code: string): boolean => {
    const coupon = availableCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive)

    if (coupon) {
      setAppliedCoupon(coupon)
      localStorage.removeItem("annapurna-coupon-disabled")

      // Store in session storage for order processing
      try {
        sessionStorage.setItem("appliedCoupon", JSON.stringify(coupon))
      } catch (e) {
        console.error("Failed to store coupon in session storage:", e)
      }

      return true
    }
    return false
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    localStorage.setItem("annapurna-coupon-disabled", "true")

    // Remove from session storage
    try {
      sessionStorage.removeItem("appliedCoupon")
    } catch (e) {
      console.error("Failed to remove coupon from session storage:", e)
    }
  }

  const toggleCoupon = () => {
    if (appliedCoupon) {
      removeCoupon()
    } else {
      applyCoupon(promotionalCoupon.code)
    }
  }

  const calculateDiscountedPrice = (originalPrice: number, quantity = 1, additionalDiscountPercentage = 0): number => {
    // Special case for the Rs. 1 coupon
    if (appliedCoupon && appliedCoupon.type === "special" && appliedCoupon.specialAction === "set_total_to_one") {
      // For this special coupon, we return a very small amount per item
      // so that the total will be approximately ₹1
      return 1 / (quantity || 1)
    }

    let discountedPrice = originalPrice

    // Apply coupon discount
    if (appliedCoupon) {
      if (appliedCoupon.type === "fixed") {
        // Fixed amount discount
        discountedPrice = originalPrice - appliedCoupon.discount
      } else if (appliedCoupon.type === "percentage") {
        // Percentage discount
        const discountAmount = originalPrice * (appliedCoupon.discount / 100)

        // Apply max discount cap if specified
        if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
          discountedPrice = originalPrice - appliedCoupon.maxDiscount
        } else {
          discountedPrice = originalPrice - discountAmount
        }
      }
    }

    // Apply additional percentage discount
    if (additionalDiscountPercentage > 0) {
      discountedPrice = discountedPrice * (1 - additionalDiscountPercentage / 100)
    }

    // Ensure price doesn't go below a minimum (e.g., ₹50)
    // Skip this check for the special ₹1 coupon
    if (!(appliedCoupon && appliedCoupon.type === "special" && appliedCoupon.specialAction === "set_total_to_one")) {
      discountedPrice = Math.max(discountedPrice, 50)
    }

    return discountedPrice * quantity
  }

  return (
    <CouponContext.Provider
      value={{
        appliedCoupon,
        isCouponApplied: appliedCoupon !== null,
        applyCoupon,
        removeCoupon,
        toggleCoupon,
        calculateDiscountedPrice,
      }}
    >
      {children}
    </CouponContext.Provider>
  )
}

export function useCoupon() {
  const context = useContext(CouponContext)
  if (context === undefined) {
    throw new Error("useCoupon must be used within a CouponProvider")
  }
  return context
}
