import { products, specialProducts } from "./data"
import type { Product } from "./types"

// Define product affinities (which products go well together)
const productAffinities: Record<string, string[]> = {
  // Main meals
  brunch: ["lapshi", "shira", "payasam", "beet-juice", "banana-shake"],
  dinner: ["puran-poli", "kheer", "bhajji", "tomato-cucumber-juice"],

  // Sweets
  lapshi: ["brunch", "beet-juice", "banana-shake"],
  shira: ["brunch", "tomato-cucumber-juice"],
  payasam: ["dinner", "brunch"],
  "puran-poli": ["dinner", "tomato-cucumber-juice"],

  // Drinks and sides
  "beet-juice": ["brunch", "lapshi"],
  "tomato-cucumber-juice": ["dinner", "shira", "puran-poli"],
  "banana-shake": ["brunch", "lapshi"],
  bhajji: ["dinner"],
  kheer: ["dinner"],
}

// Get all available products
const allProducts = [...products, ...specialProducts]

/**
 * Get recommended products based on a single product
 */
export function getRecommendationsForProduct(productId: string, limit = 3): Product[] {
  // Get affinity product IDs for this product
  const affinityIds = productAffinities[productId] || []

  // Filter products by affinity IDs
  const recommendations = allProducts.filter((product) => affinityIds.includes(product.id) && product.id !== productId)

  // If we don't have enough recommendations, add some popular products
  if (recommendations.length < limit) {
    const popularProducts = allProducts.filter(
      (product) => !affinityIds.includes(product.id) && product.id !== productId,
    )

    // Add popular products until we reach the limit
    while (recommendations.length < limit && popularProducts.length > 0) {
      const randomIndex = Math.floor(Math.random() * popularProducts.length)
      recommendations.push(popularProducts[randomIndex])
      popularProducts.splice(randomIndex, 1)
    }
  }

  // Return limited number of recommendations
  return recommendations.slice(0, limit)
}

/**
 * Get recommended products based on cart items
 */
export function getRecommendationsForCart(cartItemIds: string[], limit = 3): Product[] {
  // If cart is empty, return popular products
  if (cartItemIds.length === 0) {
    return allProducts
      .filter((product) => !product.isSubscription)
      .sort(() => 0.5 - Math.random())
      .slice(0, limit)
  }

  // Create a map to count product affinities
  const affinityScores: Record<string, number> = {}

  // For each cart item, add its affinities to the map
  cartItemIds.forEach((itemId) => {
    const affinityIds = productAffinities[itemId] || []

    affinityIds.forEach((affinityId) => {
      // Don't recommend products already in cart
      if (!cartItemIds.includes(affinityId)) {
        affinityScores[affinityId] = (affinityScores[affinityId] || 0) + 1
      }
    })
  })

  // Sort products by affinity score
  const sortedRecommendations = Object.entries(affinityScores)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => allProducts.find((product) => product.id === id))
    .filter(Boolean) as Product[]

  // If we don't have enough recommendations, add some popular products
  if (sortedRecommendations.length < limit) {
    const remainingProducts = allProducts.filter(
      (product) => !cartItemIds.includes(product.id) && !sortedRecommendations.some((rec) => rec.id === product.id),
    )

    // Add remaining products until we reach the limit
    const additionalRecommendations = remainingProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, limit - sortedRecommendations.length)

    return [...sortedRecommendations, ...additionalRecommendations]
  }

  return sortedRecommendations.slice(0, limit)
}

/**
 * Get upsell products for checkout
 * Different logic for one-time vs subscription purchases
 */
export function getUpsellProducts(isSubscription: boolean, mealType: string): Product[] {
  if (isSubscription) {
    // For subscriptions, recommend sweets subscription
    return [
      {
        id: "sweets-subscription",
        name: "Rotating Sweets Subscription",
        slug: "sweets-subscription",
        description:
          "Enjoy a different sweet treat with each delivery. We'll rotate between Lapshi, Shira, Payasam, and more!",
        price: 200,
        originalPrice: 300,
        image: "/placeholder.svg?height=400&width=600",
        isSubscription: true,
      },
    ]
  } else {
    // For one-time purchases, recommend complementary items
    if (mealType === "brunch") {
      return specialProducts.filter((p) => ["lapshi", "shira", "beet-juice"].includes(p.id))
    } else {
      return specialProducts.filter((p) => ["kheer", "puran-poli", "bhajji"].includes(p.id))
    }
  }
}
