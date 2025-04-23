"use client"

import { useState, useEffect } from "react"
import ProductGrid from "@/components/products/product-grid"
import { products, specialProducts } from "@/lib/data"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function MenuPageClient() {
  const { items } = useCart()
  const [cartCount, setCartCount] = useState(0)
  const [showCartButton, setShowCartButton] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Update cart count and show cart button when items change
  useEffect(() => {
    if (items.length > 0) {
      setCartCount(items.reduce((total, item) => total + item.quantity, 0))
      setShowCartButton(true)
    } else {
      setCartCount(0)
      setShowCartButton(false)
    }
  }, [items])

  const handleViewCart = () => {
    router.push("/cart")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Our Menu</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Delicious, nutritious Sattvik meals prepared with love and care by Isha Volunteers.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-amber-700 mb-6">Daily Meals</h2>
        <ProductGrid products={products} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-amber-700 mb-6">Festival Specials</h2>
        <ProductGrid products={specialProducts} />
      </div>

      {/* Sticky cart button for mobile */}
      <AnimatePresence>
        {showCartButton && isMobile && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-amber-700 text-white py-3 px-4 z-50 shadow-lg"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span className="font-semibold">
                  {cartCount} {cartCount === 1 ? "item" : "items"} added
                </span>
              </div>
              <Button onClick={handleViewCart} className="bg-white text-amber-700 hover:bg-amber-50">
                View Cart
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
