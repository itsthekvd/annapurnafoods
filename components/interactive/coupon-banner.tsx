"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tag, X } from "lucide-react"
import { promotionalCoupon } from "@/lib/data"

export default function CouponBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show the banner after a short delay
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-16 left-0 right-0 z-40 bg-green-600 text-white py-3 px-4"
        >
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-3 sm:mb-0">
              <Tag className="h-5 w-5 mr-2" />
              <span className="font-semibold">
                Special Offer: Use code <span className="font-bold">{promotionalCoupon.code}</span> for ₹
                {promotionalCoupon.discount} off per meal!
              </span>
            </div>

            <div className="flex items-center">
              <Button className="bg-white text-green-700 hover:bg-green-100">Automatically Applied at Checkout!</Button>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-1 right-1 text-white/80 hover:text-white"
              aria-label="Close offer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
