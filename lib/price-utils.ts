import type { Product } from "@/lib/types"
import { subscriptionOptions } from "@/lib/data"

/**
 * Utility functions for consistent price calculations across the application
 */

/**
 * Calculate the subscription discount for a product
 * @param price - The base price
 * @param subscriptionOption - The subscription option ID
 * @returns The discounted price after subscription discount
 */
export function calculateSubscriptionDiscount(price: number, subscriptionOption: string): number {
  if (subscriptionOption === "one-time") return price

  const option = subscriptionOptions.find((opt) => opt.id === subscriptionOption)
  const discountPercentage = option ? option.discountPercentage : 0

  return price * (1 - discountPercentage / 100)
}

/**
 * Get the number of days in a subscription
 * @param subscriptionOption - The subscription option ID
 * @returns The number of days in the subscription
 */
export function getDaysInSubscription(subscriptionOption: string): number {
  const option = subscriptionOptions.find((opt) => opt.id === subscriptionOption)
  return option ? option.durationInDays : 1
}

/**
 * Calculate the total price for a product with quantity and subscription
 * @param product - The product
 * @param quantity - The quantity
 * @param subscriptionOption - The subscription option ID
 * @param subscriptionDuration - The subscription duration in months
 * @returns The total price
 */
export function calculateTotalPrice(
  product: Product,
  quantity: number,
  subscriptionOption = "one-time",
  subscriptionDuration = 1,
): number {
  const basePrice = product.price
  const discountedPrice = calculateSubscriptionDiscount(basePrice, subscriptionOption)

  if (subscriptionOption === "one-time") {
    return discountedPrice * quantity
  } else {
    const days = getDaysInSubscription(subscriptionOption)
    return discountedPrice * days * quantity * subscriptionDuration
  }
}
