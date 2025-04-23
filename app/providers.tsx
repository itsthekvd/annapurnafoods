"use client"

import type { ReactNode } from "react"
import { CartProvider } from "@/contexts/cart-context"
import { CouponProvider } from "@/contexts/coupon-context"
import { TrackingProvider } from "@/contexts/tracking-context"
import ExitPopup from "@/components/interactive/exit-popup"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TrackingProvider>
      <CouponProvider>
        <CartProvider>
          {children}
          <ExitPopup />
        </CartProvider>
      </CouponProvider>
    </TrackingProvider>
  )
}
