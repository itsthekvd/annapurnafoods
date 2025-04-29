import { useCoupon } from "@/contexts/coupon-context"

interface CouponBadgeProps {
  className?: string
}

export function CouponBadge({ className = "" }: CouponBadgeProps) {
  const { appliedCoupon } = useCoupon()

  if (!appliedCoupon) return null

  return (
    <div className={`bg-amber-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm z-50 ${className}`}>
      Coupon: {appliedCoupon.code} Applied
    </div>
  )
}
