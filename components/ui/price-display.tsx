import { useCoupon } from "@/contexts/coupon-context"

interface PriceDisplayProps {
  originalPrice: number
  discountedPrice?: number
  showStrikethrough?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function PriceDisplay({
  originalPrice,
  discountedPrice,
  showStrikethrough = true,
  className = "",
  size = "md",
}: PriceDisplayProps) {
  const { appliedCoupon, calculateDiscountedPrice } = useCoupon()

  const finalDiscountedPrice =
    discountedPrice || (appliedCoupon ? calculateDiscountedPrice(originalPrice) : originalPrice)

  const hasDiscount = finalDiscountedPrice !== originalPrice

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className={`flex items-center ${className}`}>
      <span className={`font-bold text-amber-700 ${sizeClasses[size]}`}>₹{finalDiscountedPrice.toFixed(2)}</span>

      {hasDiscount && showStrikethrough && (
        <span className={`text-gray-500 line-through ml-2 ${size === "lg" ? "text-base" : "text-sm"}`}>
          ₹{originalPrice.toFixed(2)}
        </span>
      )}

      {hasDiscount && appliedCoupon && (
        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
          {Math.round((1 - finalDiscountedPrice / originalPrice) * 100)}% off
        </span>
      )}
    </div>
  )
}
