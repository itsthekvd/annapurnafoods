import { useCoupon } from "@/contexts/coupon-context"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function CouponBadge() {
  const { appliedCoupon } = useCoupon()

  if (!appliedCoupon) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
            {appliedCoupon.code}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {appliedCoupon.description || `${appliedCoupon.discountPercentage}% off your order`}
          </p>
          {appliedCoupon.expiryDate && (
            <p className="text-xs text-gray-500 mt-1">
              Expires: {new Date(appliedCoupon.expiryDate).toLocaleDateString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
