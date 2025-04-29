"use client"

import { useState, useEffect, useCallback } from "react"
import { DigitCounter } from "@/components/ui/counter-animation"
import HealthImpactStats from "@/components/home/health-impact-stats"
import OrderStorage from "@/lib/order-storage"
import MealCalculator from "@/components/interactive/meal-calculator"

export default function Hero() {
  const [totalMeals, setTotalMeals] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch total meals from orders
  useEffect(() => {
    const fetchTotalMeals = async () => {
      try {
        // Get all orders
        const orders = await OrderStorage.getAllOrders()
        console.log("Hero: Fetched orders for meal count:", orders.length)

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

        console.log("Hero: Calculated total meals:", mealCount)

        // If no orders yet, show a default number
        setTotalMeals(mealCount > 0 ? mealCount : 1250)
      } catch (error) {
        console.error("Error fetching meal count:", error)
        // Set a default number if there's an error
        setTotalMeals(1250)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTotalMeals()
  }, [])

  // Render loading state
  const renderLoadingState = useCallback(
    () => (
      <div className="h-24 flex items-center justify-center">
        <div className="animate-pulse bg-amber-200 h-12 w-64 rounded-lg mx-auto"></div>
      </div>
    ),
    [],
  )

  // Render meal counter
  const renderMealCounter = useCallback(
    () => (
      <div className="mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-2">
          <DigitCounter value={totalMeals} className="inline-flex" />
          <span className="ml-2">Sattvik Healthy Meals Delivered</span>
        </h1>
        <p className="text-xl text-amber-700 font-medium">
          within 10kms radius of Isha Yoga Center, Coimbatore.. Order your tiffin now.
        </p>
      </div>
    ),
    [totalMeals],
  )

  return (
    <section className="relative bg-amber-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8">
          <div className="text-center">
            {isLoading ? renderLoadingState() : renderMealCounter()}

            <div className="relative mt-8 bg-amber-800 text-white py-6 px-4 rounded-lg shadow-lg max-w-2xl mx-auto">
              <h2 className="text-xl md:text-2xl font-semibold mb-2">Our Health Impact</h2>

              {!isLoading && <HealthImpactStats totalMeals={totalMeals} />}

              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Real Impact
              </div>
            </div>

            {/* Add the meal calculator widget below the health impact section */}
            <div className="mt-12">
              <MealCalculator isHeroWidget={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div
        className="absolute bottom-0 left-0 w-full h-12 bg-white"
        style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
      ></div>
    </section>
  )
}
