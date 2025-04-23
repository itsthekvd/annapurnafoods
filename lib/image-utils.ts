// This file contains utility functions for handling images
import { fetchImageUrls } from "./csv-parser"

// Default image map
const defaultImageUrl = "/placeholder.svg?height=400&width=600"

// Cache for image URLs
let imageCache: Record<string, string> = {}
let isCacheInitialized = false

// Initialize the image cache
export async function initializeImageCache() {
  if (!isCacheInitialized) {
    try {
      const fetchedImageMap = await fetchImageUrls()
      if (Object.keys(fetchedImageMap).length > 0) {
        imageCache = { ...fetchedImageMap }
        isCacheInitialized = true
        console.log("Image cache initialized with", Object.keys(imageCache).length, "images")
      }
    } catch (error) {
      console.error("Failed to initialize image cache:", error)
    }
  }
  return imageCache
}

// Function to get image URL
export function getImageUrl(imageId: string): string {
  // If we're in the browser and the cache isn't initialized, try to initialize it
  if (typeof window !== "undefined" && !isCacheInitialized) {
    initializeImageCache().then(() => {
      // This will update the cache for future calls
    })
  }

  // Return from cache if available
  if (imageCache[imageId]) {
    return imageCache[imageId]
  }

  // Fallback to default
  return defaultImageUrl
}

// Preload common images for immediate use
export const preloadedImages = {
  brunch: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
  dinner: "https://ucarecdn.com/310f3597-31e8-4a07-b361-850fa43b1d72/brunchdinner6.jpeg",
  lapshi: "https://ucarecdn.com/0d4c9f00-bdd0-41f2-839b-fea924412d0b/SweetRicescaled.jpg",
  shira: "https://ucarecdn.com/bed62b77-9441-4ebe-b878-26acb0c62441/shiramaharashtrian.jpg",
  payasam: "https://ucarecdn.com/261290d8-50b6-40f1-81c4-06f6200f8ac5/Payasamscaled.jpg",
  "puran-poli": "https://ucarecdn.com/623cd534-9895-4829-af62-e694f868b52f/puranpoli.png",
}

// Additional images for brunch and dinner
export const additionalProductImages = {
  brunch: [
    "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
    "https://ucarecdn.com/6d1d60ed-577d-4488-bc8a-06e5a68c63e3/brunchdinner10.jpeg",
    "https://ucarecdn.com/9ac20829-b0a2-4b5e-8e46-9a2c6dfab637/brunchdinner5.jpeg",
    "https://ucarecdn.com/310f3597-31e8-4a07-b361-850fa43b1d72/brunchdinner6.jpeg",
    "https://ucarecdn.com/e051d6ff-3dca-435c-a9f6-7dc8c44564a1/annapurnafoodsbrandlogo.png",
  ],
  dinner: [
    "https://ucarecdn.com/310f3597-31e8-4a07-b361-850fa43b1d72/brunchdinner6.jpeg",
    "https://ucarecdn.com/9ac20829-b0a2-4b5e-8e46-9a2c6dfab637/brunchdinner5.jpeg",
    "https://ucarecdn.com/6d1d60ed-577d-4488-bc8a-06e5a68c63e3/brunchdinner10.jpeg",
    "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
  ],
}

// Initialize the cache with preloaded images
imageCache = { ...preloadedImages }

// Function to get image URL with fallback to preloaded images
export function getImageUrlWithFallback(imageId: string): string {
  return imageCache[imageId] || preloadedImages[imageId] || defaultImageUrl
}

// Function to get additional images for a product
export function getAdditionalProductImages(productId: string): string[] {
  return additionalProductImages[productId] || []
}
