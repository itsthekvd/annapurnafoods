"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

export default function DirectCheckoutLink() {
  const { items } = useCart()
  const { toast } = useToast()
  const [showFallback, setShowFallback] = useState(false)

  // Show fallback button after a delay if we have items
  useEffect(() => {
    if (items.length > 0) {
      const timer = setTimeout(() => {
        setShowFallback(true)
      }, 3000) // Show after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [items])

  if (!showFallback) return null

  const handleDirectNavigation = () => {
    try {
      // Save cart to localStorage
      localStorage.setItem("annapurna-cart", JSON.stringify(items))

      // Navigate directly
      window.location.href = "/checkout"

      toast({
        title: "Navigating to checkout",
        description: "Using direct navigation method",
      })
    } catch (error) {
      console.error("Error during direct navigation:", error)
      // Absolute fallback
      window.location.href = "/checkout"
    }
  }

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <p className="text-sm text-yellow-800 mb-2">Having trouble proceeding to checkout? Try this direct link:</p>
      <Button onClick={handleDirectNavigation} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
        Direct Link to Checkout
      </Button>
    </div>
  )
}
