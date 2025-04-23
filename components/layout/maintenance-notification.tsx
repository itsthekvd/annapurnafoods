"use client"

import { AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

export default function MaintenanceNotification() {
  return (
    <motion.div
      className="bg-red-600 text-white py-3 px-4 sticky top-0 z-[100] shadow-md"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 mr-2 animate-pulse" />
          <div className="text-center">
            <p className="font-bold text-base md:text-lg uppercase tracking-wider">
              WEBSITE UNDER MAINTENANCE - DO NOT PLACE ORDERS
            </p>
            <p className="text-sm md:text-base text-white/90">
              We are currently testing our systems. Any orders placed will not be processed.
            </p>
          </div>
          <AlertTriangle className="h-6 w-6 ml-2 animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}
