import { subscriptionOptions } from "@/lib/data"

/**
 * Gets the number of days in a subscription option
 */
export function getDaysInSubscription(subscriptionOption: string): number {
  const option = subscriptionOptions.find((opt) => opt.id === subscriptionOption)
  return option ? option.durationInDays : 1
}

/**
 * Gets the discount percentage for a subscription option
 */
export function getSubscriptionDiscountPercentage(subscriptionOption: string): number {
  const option = subscriptionOptions.find((opt) => opt.id === subscriptionOption)
  return option ? option.discountPercentage : 0
}

/**
 * Calculates the price after applying subscription discount
 */
export function calculateSubscriptionDiscount(price: number, subscriptionOption: string): number {
  const discountPercentage = getSubscriptionDiscountPercentage(subscriptionOption)
  return price * (1 - discountPercentage / 100)
}

/**
 * Calculates the total price for a subscription
 */
export function calculateSubscriptionTotal(
  basePrice: number,
  subscriptionOption: string,
  quantity: number,
  duration = 1,
): number {
  const discountedPrice = calculateSubscriptionDiscount(basePrice, subscriptionOption)
  const daysInSubscription = getDaysInSubscription(subscriptionOption)

  return discountedPrice * daysInSubscription * quantity * duration
}

/**
 * Formats a price as Indian Rupees
 */
export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`
}
