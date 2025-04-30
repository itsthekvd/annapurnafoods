import { getSupabaseClient, getSupabaseServiceClient } from "./supabase-client"
import { products as staticProducts, specialProducts as staticSpecialProducts } from "./data"
import type { Product } from "./types"

// Fetch products from database with fallback to static data
export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabaseClient()

    // Try to fetch from database first
    const { data, error } = await supabase.from("products").select("*").order("name")

    if (error) {
      console.warn("Error fetching products from database:", error)
      throw error
    }

    if (data && data.length > 0) {
      // Map database fields to product structure
      return data.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        originalPrice: item.original_price ? Number(item.original_price) : undefined,
        description: item.description,
        image: item.image,
        isSubscription: item.is_subscription,
        slug: item.slug,
      }))
    }

    // If no data in database, fall back to static data
    throw new Error("No products found in database")
  } catch (error) {
    console.warn("Falling back to static product data:", error)
    return [...staticProducts, ...staticSpecialProducts]
  }
}

// Update product in database
export async function updateProduct(product: Product): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient()

    const { error } = await supabase.from("products").upsert({
      id: product.id,
      name: product.name,
      price: product.price,
      original_price: product.originalPrice || product.price,
      description: product.description,
      image: product.image,
      is_subscription: product.isSubscription || false,
      slug: product.slug,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error updating product:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Exception updating product:", error)
    return false
  }
}
