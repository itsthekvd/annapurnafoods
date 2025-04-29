"use client"

import { useState, useEffect } from "react"
import { CounterAnimation } from "@/components/ui/counter-animation"
import { motion } from "framer-motion"
import OrderStorage from "@/lib/order-storage"

// Health impact statistics based on research - these are per meal savings
const HEALTH_IMPACTS = {
  // Average calories saved per meal (fast food vs healthy meal)
  CALORIES_SAVED_PER_MEAL: 450,

  // Average sodium reduction per meal in mg
  SODIUM_REDUCTION_PER_MEAL: 850,

  // Average sugar reduction per meal in grams
  SUGAR_REDUCTION_PER_MEAL: 35,

  // Average unhealthy fat reduction per meal in grams
  FAT_REDUCTION_PER_MEAL: 18,

  // Average increase in fiber per meal in grams
  FIBER_INCREASE_PER_MEAL: 8,

  // Average increase in essential nutrients (percentage)
  NUTRIENT_INCREASE_PERCENT: 65,
}

interface HealthImpactStatsProps {
  totalMeals: number
}

export default function HealthImpactStats({ totalMeals }: HealthImpactStatsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [actualMealCount, setActualMealCount] = useState(totalMeals)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch actual meal count from orders data
  useEffect(() => {
    const fetchMealCount = async () => {
      try {
        setIsLoading(true)
        const orders = await OrderStorage.getAllOrders().catch((err) => {
          console.error("Error fetching orders:", err)
          return []
        })

        // Calculate total meals from all orders
        let mealCount = 0
        orders.forEach((order) => {
          // For each order, count the meals
          if (order.mealQuantity) {
            // If we have a specific meal quantity field, use that
            mealCount += order.mealQuantity
          } else if (order.items) {
            // Otherwise calculate from items
            order.items.forEach((item) => {
              // For subscription items, use subscription days
              if (item.subscriptionOption && item.subscriptionOption !== "one-time" && item.subscriptionDays) {
                mealCount += item.quantity * item.subscriptionDays
              } else {
                // For one-time items, just use quantity
                mealCount += item.quantity
              }
            })
          }
        })

        // If we found actual meals, use that number, otherwise keep the prop value
        if (mealCount > 0) {
          setActualMealCount(mealCount)
        }
      } catch (error) {
        console.error("Error in fetchMealCount:", error)
        // Keep using the prop value if there's an error
      } finally {
        setIsLoading(false)
      }
    }

    fetchMealCount()
  }, [totalMeals])

  // Rotate through stats automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Calculate impacts based on actual meal count
  const caloriesSaved = actualMealCount * HEALTH_IMPACTS.CALORIES_SAVED_PER_MEAL
  const sodiumReduced = (actualMealCount * HEALTH_IMPACTS.SODIUM_REDUCTION_PER_MEAL) / 1000 // Convert to kg
  const sugarReduced = (actualMealCount * HEALTH_IMPACTS.SUGAR_REDUCTION_PER_MEAL) / 1000 // Convert to kg
  const fatReduced = (actualMealCount * HEALTH_IMPACTS.FAT_REDUCTION_PER_MEAL) / 1000 // Convert to kg

  const stats = [
    {
      value: caloriesSaved,
      label: "calories saved",
      description: `Equivalent to running about ${Math.round(caloriesSaved / 100)} kilometers`,
      unit: "",
    },
    {
      value: sodiumReduced,
      label: "kg of sodium avoided",
      description: `Reducing risk of high blood pressure by ${Math.round(sodiumReduced * 2)}%`,
      unit: "",
    },
    {
      value: sugarReduced,
      label: "kg of sugar avoided",
      description: `Lowering risk of diabetes and obesity by ${Math.round(sugarReduced * 0.5)}%`,
      unit: "",
    },
    {
      value: fatReduced,
      label: "kg of unhealthy fats avoided",
      description: `Improving heart health and cholesterol levels by ${Math.round(fatReduced * 3)}%`,
      unit: "",
    },
  ]

  const activeStat = stats[activeIndex]

  if (isLoading) {
    return (
      <div className="mt-4 text-center">
        <p className="text-amber-100">Loading health impact statistics...</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center text-xl md:text-2xl text-amber-100">
          <CounterAnimation
            value={Math.round(activeStat.value)}
            className="font-bold mr-2"
            formatter={(val) => val.toLocaleString()}
          />
          <span>{activeStat.label}</span>
        </div>
        <p className="text-sm md:text-base text-amber-200 mt-1">{activeStat.description}</p>
      </motion.div>

      <div className="flex justify-center mt-4 space-x-2">
        {stats.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${index === activeIndex ? "bg-white" : "bg-white/40"}`}
            aria-label={`View stat ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
