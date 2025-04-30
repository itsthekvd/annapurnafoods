"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { availableCoupons, promotionalCoupon } from "@/lib/data"
import type { Coupon } from "@/lib/types"
import { getSupabaseClient } from "@/lib/supabase-client"

interface CouponContextType {
  appliedCoupon: Coupon | null
  isCouponApplied: boolean
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => void
  toggleCoupon: () => Promise<void>
  calculateDiscountedPrice: (originalPrice: number, quantity?: number, additionalDiscountPercentage?: number) => number
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

export function CouponProvider({ children }: { children: ReactNode }) {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)

  // Auto-apply the promotional coupon on initial load, but only if it's active
  useEffect(() => {
    async function checkAndApplyCoupon() {
      // Check if coupon is disabled in localStorage
      const isCouponDisabled = localStorage.getItem("annapurna-coupon-disabled") === "true"
      if (isCouponDisabled) return

      try {
        // Check if the coupon is active in the database
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("coupons")
          .select("isActive")
          .eq("code", promotionalCoupon.code)
          .single()

        // If there's an error or the coupon isn't active, don't apply it
        if (error || !data || !data.isActive) {
          console.log("Promotional coupon is not active or not found in database")
          return
        }

        // If we get here, the coupon is active and not disabled, so apply it
        setAppliedCoupon(promotionalCoupon)
      } catch (err) {
        console.error("Error checking coupon status:", err)
        // Fallback to checking the hardcoded data if we can't access the database
        if (promotionalCoupon.isActive) {
          setAppliedCoupon(promotionalCoupon)
        }
      }
    }

    checkAndApplyCoupon()
  }, [])

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      // First check if the coupon is active in the database
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("coupons").select("*").eq("code", code).single()

      if (!error && data && data.isActive) {
        // Convert database coupon to our Coupon type
        const dbCoupon: Coupon = {
          code: data.code,
          description: data.description || "",
          type: data.type as "fixed" | "percentage" | "special",
          discount: Number(data.discount),
          minOrderValue: data.min_order_value ? Number(data.min_order_value) : undefined,
          maxDiscount: data.max_discount ? Number(data.max_discount) : undefined,
          isActive: data.isActive,
          isHidden: data.isHidden || false,
          specialAction: data.specialAction,
        }

        setAppliedCoupon(dbCoupon)
        localStorage.removeItem("annapurna-coupon-disabled")

        // Store in session storage for order processing
        try {
          sessionStorage.setItem("appliedCoupon", JSON.stringify(dbCoupon))
        } catch (e) {
          console.error("Failed to store coupon in session storage:", e)
        }

        return true
      }

      // Fallback to checking hardcoded coupons if database check fails or coupon not found
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
    } catch (err) {
      console.error("Error applying coupon:", err)

      // Fallback to checking hardcoded coupons if database check fails
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

  const toggleCoupon = async () => {
    if (appliedCoupon) {
      removeCoupon()
    } else {
      await applyCoupon(promotionalCoupon.code)
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
