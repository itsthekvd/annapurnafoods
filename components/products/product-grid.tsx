"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag, Plus, ArrowRight, X } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/cart-context"
import { useCoupon } from "@/contexts/coupon-context"
import { useState, useEffect, useRef } from "react"
import { getRecommendationsForProduct } from "@/lib/recommendation-engine"
import { motion, AnimatePresence } from "framer-motion"
import { playSound } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { subscriptionOptions } from "@/lib/data"

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { addItem, items } = useCart()
  const { appliedCoupon, calculateDiscountedPrice } = useCoupon()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null)
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [itemCount, setItemCount] = useState(0)
  const recommendationsRef = useRef<HTMLDivElement>(null)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [selectedSubscriptionOption, setSelectedSubscriptionOption] = useState("one-time")

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

  // Update cart count and sticky bar visibility
  useEffect(() => {
    if (items.length > 0) {
      setItemCount(items.reduce((total, item) => total + item.quantity, 0))
      setShowStickyBar(true)
    } else {
      setItemCount(0)
      setShowStickyBar(false)
    }
  }, [items])

  // Update recommendations when last added product changes
  useEffect(() => {
    if (lastAddedProduct) {
      const recs = getRecommendationsForProduct(lastAddedProduct.id, 2)
      setRecommendations(recs)

      // Scroll to recommendations on mobile
      if (isMobile && recommendationsRef.current) {
        setTimeout(() => {
          recommendationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 100)
      }
    }
  }, [lastAddedProduct, isMobile])

  const handleAddToCart = (product: Product) => {
    if (product.isSubscription) {
      // For subscription products, expand the options instead of adding to cart
      setExpandedProductId(product.id)
      setSelectedSubscriptionOption("one-time")
    } else {
      // For regular products, add directly to cart
      addItem(product, 1)

      // Try to play sound effect, but don't let it break the app
      try {
        playSound("click")
      } catch (e) {
        // Silently ignore sound errors
      }

      // Set as last added product to show recommendations
      setLastAddedProduct(product)
    }
  }

  const handleAddSubscription = (product: Product) => {
    // Get the selected subscription option details
    const option = subscriptionOptions.find((opt) => opt.id === selectedSubscriptionOption)

    if (option) {
      // Add subscription with the selected options
      addItem(product, 1, undefined, selectedSubscriptionOption, option.durationInDays)

      // Try to play sound effect, but don't let it break the app
      try {
        playSound("success")
      } catch (e) {
        // Silently ignore sound errors
      }

      // Close the expanded section
      setExpandedProductId(null)

      // Set as last added product to show recommendations
      setLastAddedProduct(product)
    }
  }

  const handleGoToCheckout = () => {
    router.push("/checkout")
  }

  return (
    <>
      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-amber-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className="relative h-48 md:w-1/3 md:h-auto">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                {appliedCoupon && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-600 text-white">
                      <Tag className="h-3 w-3 mr-1" />₹{appliedCoupon.discount} OFF
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4 md:p-6 flex-1">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center mb-2">
                  {appliedCoupon ? (
                    <>
                      <span className="text-amber-700 font-bold">
                        ₹{calculateDiscountedPrice(product.price).toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm line-through ml-2">₹{product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-amber-700 font-bold">₹{product.price.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>

                {/* Expanded subscription options */}
                {expandedProductId === product.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 bg-amber-50 p-4 rounded-lg border border-amber-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Choose Your Plan</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setExpandedProductId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Select value={selectedSubscriptionOption} onValueChange={setSelectedSubscriptionOption}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {subscriptionOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name} {option.discountPercentage > 0 && `(${option.discountPercentage}% off)`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="text-sm text-gray-600">
                        {selectedSubscriptionOption !== "one-time" ? (
                          <div>
                            <p className="font-medium text-amber-800">
                              {subscriptionOptions.find((o) => o.id === selectedSubscriptionOption)?.name}
                            </p>
                            <p>{subscriptionOptions.find((o) => o.id === selectedSubscriptionOption)?.description}</p>
                          </div>
                        ) : (
                          <p>Try once without subscription</p>
                        )}
                      </div>

                      <Button
                        className="w-full bg-amber-700 hover:bg-amber-800"
                        onClick={() => handleAddSubscription(product)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between items-center">
                  <Link href={`/menu/${product.slug}`}>
                    <Button variant="outline" className="border-amber-700 text-amber-700 hover:bg-amber-50">
                      View Details
                    </Button>
                  </Link>

                  {isMobile ? (
                    <Button
                      className="bg-amber-700 hover:bg-amber-800 px-8 rounded-full"
                      onClick={() => handleAddToCart(product)}
                    >
                      {product.isSubscription ? "CHOOSE PLAN" : "ADD"}
                      {!product.isSubscription && <Plus className="h-4 w-4 ml-1" />}
                    </Button>
                  ) : (
                    <Button className="bg-amber-700 hover:bg-amber-800" onClick={() => handleAddToCart(product)}>
                      {product.isSubscription ? "Choose Plan" : "Add to Cart"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recommendations section that appears after adding a product on mobile */}
      <AnimatePresence>
        {isMobile && lastAddedProduct && recommendations.length > 0 && (
          <motion.div
            ref={recommendationsRef}
            className="mt-8 pt-4 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">You will love pairing it with</h3>
            <div className="grid grid-cols-2 gap-4">
              {recommendations.map((product) => (
                <Card key={product.id} className="overflow-hidden border-amber-100">
                  <div className="relative h-32">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-base">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-amber-700 font-bold">₹{product.price.toFixed(2)}</span>
                      <Button
                        size="sm"
                        className="bg-white text-amber-700 border border-amber-700 hover:bg-amber-50 px-4 rounded-full"
                        onClick={() =>
                          product.isSubscription ? setExpandedProductId(product.id) : handleAddToCart(product)
                        }
                      >
                        {product.isSubscription ? "CHOOSE" : "ADD"}
                        {!product.isSubscription && <Plus className="h-3 w-3 ml-1" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky cart bar at bottom - UPDATED to be more compact and match brand colors */}
      <AnimatePresence>
        {isMobile && showStickyBar && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-amber-700 text-white py-2 px-4 z-50 shadow-lg"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-medium text-sm">{itemCount} added</span>
              </div>
              <Button
                onClick={handleGoToCheckout}
                className="bg-white text-amber-700 hover:bg-amber-50 py-1 h-8 text-sm"
              >
                Proceed to checkout
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
