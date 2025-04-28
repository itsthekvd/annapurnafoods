"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, ArrowRight, Utensils, Calendar, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { products, subscriptionOptions } from "@/lib/data"
import { format, addDays, setHours, setMinutes } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { isBefore, startOfDay } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { playSound } from "@/lib/utils"
import { useTracking } from "@/contexts/tracking-context"
import { useCoupon } from "@/contexts/coupon-context"
import { calculateSubscriptionDiscount, getDaysInSubscription } from "@/lib/price-utils"

// Improved number selector component for mobile
function NumberSelector({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  label: string
}) {
  return (
    <div className="mt-6">
      <Label className="mb-2 block">{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => value > min && onChange(value - 1)}
          disabled={value <= min}
          className="h-10 w-10 rounded-full"
        >
          -
        </Button>

        <div className="flex-1">
          <div className="relative h-10 bg-gray-100 rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-amber-200 rounded-full transition-all"
              style={{ width: `${((value - min) / (max - min)) * 100}%` }}
            ></div>

            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <span className="font-medium text-lg">{value}</span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => value < max && onChange(value + 1)}
          disabled={value >= max}
          className="h-10 w-10 rounded-full"
        >
          +
        </Button>
      </div>
    </div>
  )
}

interface MealCalculatorProps {
  isHeroWidget?: boolean
}

export default function MealCalculator({ isHeroWidget = false }: MealCalculatorProps) {
  const router = useRouter()
  const { addItem, clearCart } = useCart()
  const { trackEvent } = useTracking()
  const [step, setStep] = useState(1)
  const [mealType, setMealType] = useState("brunch")
  const [subscriptionOption, setSubscriptionOption] = useState("one-time")
  const [people, setPeople] = useState(1)
  const [duration, setDuration] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [savings, setSavings] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const addToCartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [deliveryDate, setDeliveryDate] = useState<Date>(() => {
    // Calculate the next available delivery date (24 hours from now)
    const now = new Date()
    let nextDate = addDays(now, 1) // Start with tomorrow

    // Set the time based on meal type (8:30 AM for brunch, 8:30 PM for dinner)
    const hour = 8 // Default to brunch
    nextDate = setHours(nextDate, hour)
    nextDate = setMinutes(nextDate, 30)

    return nextDate
  })

  const { toast } = useToast()
  const { appliedCoupon, calculateDiscountedPrice } = useCoupon()

  // Get the regular product price based on the selected meal type
  const getProductPrice = () => {
    const productId = mealType === "brunch" ? "brunch" : "dinner"
    const product = products.find((p) => p.id === productId)
    return product ? product.price : 0
  }

  // Add this function to get the discount percentage
  const getDiscountPercentage = () => {
    const option = subscriptionOptions.find((opt) => opt.id === subscriptionOption)
    return option ? option.discountPercentage : 0
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (addToCartTimeoutRef.current) {
        clearTimeout(addToCartTimeoutRef.current)
      }
    }
  }, [])

  // Calculate savings and total
  useEffect(() => {
    if (subscriptionOption !== "one-time") {
      // Calculate savings compared to individual meals
      const singleMealPrice = getProductPrice()
      const discountPercentage = getDiscountPercentage()
      const daysInSubscription = getDaysInSubscription(subscriptionOption)

      // Calculate discounted price per meal
      const discountedPrice = singleMealPrice * (1 - discountPercentage / 100)

      // Calculate total savings
      const dailySavings = singleMealPrice - discountedPrice
      const totalSavings = dailySavings * daysInSubscription * duration * people
      setSavings(Math.round(totalSavings))
    } else {
      setSavings(0)
    }
  }, [subscriptionOption, people, duration, mealType])

  // Update the delivery date when meal type changes
  useEffect(() => {
    // Calculate the next available delivery date (24 hours from now)
    const now = new Date()
    let nextDate = addDays(now, 1) // Start with tomorrow

    // Set the time based on meal type (8:30 AM for brunch, 8:30 PM for dinner)
    const hour = mealType === "brunch" ? 8 : 20
    nextDate = setHours(nextDate, hour)
    nextDate = setMinutes(nextDate, 30)

    setDeliveryDate(nextDate)
  }, [mealType])

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)

      // Track quiz progress
      trackEvent("meal_calculator_step", {
        step: step + 1,
        mealType: step === 1 ? mealType : undefined,
        subscriptionOption: step === 2 ? subscriptionOption : undefined,
      })
    } else {
      setShowResults(true)

      // Track quiz completion
      trackEvent("meal_calculator_complete", {
        mealType,
        subscriptionOption,
        people,
        duration: subscriptionOption !== "one-time" ? duration : 1,
      })
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleAddToCart = async () => {
    if (isAddingToCart) return
    setIsAddingToCart(true)

    try {
      // Clear the cart first to avoid mixing different meal types
      clearCart()

      // Find the appropriate product based on selections
      const productId = mealType === "brunch" ? "brunch" : "dinner"
      const product = products.find((p) => p.id === productId)

      if (product) {
        // Store the delivery date in sessionStorage for checkout
        if (deliveryDate) {
          sessionStorage.setItem("selectedDeliveryDate", deliveryDate.toISOString())
        }

        // Create a promise that resolves when the cart is updated
        await new Promise<void>((resolve) => {
          if (subscriptionOption !== "one-time") {
            const option = subscriptionOptions.find((opt) => opt.id === subscriptionOption)
            const daysInSubscription = option ? option.durationInDays : 30

            // Add subscription with the selected options
            for (let i = 0; i < people; i++) {
              addItem(product, 1, undefined, subscriptionOption, daysInSubscription)
            }
          } else {
            // Add one-time order with the selected quantity
            addItem(product, people)
          }

          // Force an immediate update to localStorage
          const currentCart = JSON.parse(localStorage.getItem("annapurna-cart") || "[]")
          localStorage.setItem("annapurna-cart", JSON.stringify(currentCart))

          // Play a sound effect
          try {
            playSound("success")
          } catch (e) {
            // Silently ignore sound errors
          }

          resolve()
        })

        // Show a toast notification
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        })

        // Track the add to cart event
        trackEvent("meal_calculator_add_to_cart", {
          mealType,
          subscriptionOption,
          people,
          duration: subscriptionOption !== "one-time" ? duration : 1,
          totalPrice:
            subscriptionOption !== "one-time"
              ? getProductPrice() *
                (1 - getDiscountPercentage() / 100) *
                getDaysInSubscription(subscriptionOption) *
                duration *
                people
              : getProductPrice() * people,
        })

        // Use a longer delay to ensure everything is synchronized
        if (addToCartTimeoutRef.current) {
          clearTimeout(addToCartTimeoutRef.current)
        }

        addToCartTimeoutRef.current = setTimeout(() => {
          // Navigate to cart
          window.location.href = "/cart"
        }, 500)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "There was a problem adding the item to your cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Simplified card style for hero widget
  const cardStyle = isHeroWidget ? "border-none shadow-lg bg-white" : "border-amber-200"

  return (
    <section className={isHeroWidget ? "" : "py-16 bg-amber-50"}>
      <div className={isHeroWidget ? "" : "container mx-auto px-4"}>
        {!isHeroWidget && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-800 mb-4">Find Your Perfect Meal Plan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Answer a few questions and we'll recommend the perfect meal plan for you. See how much you can save with
              our subscription options!
            </p>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {!showResults ? (
            <Card className={cardStyle}>
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between mb-6 md:mb-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-2 ${
                          i < step
                            ? "bg-green-500 text-white"
                            : i === step
                              ? "bg-amber-700 text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {i < step ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : i}
                      </div>
                      <span className="text-xs md:text-sm text-gray-600">
                        {i === 1 ? "Meal Type" : i === 2 ? "Frequency" : "People"}
                      </span>
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step === 1 && (
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-amber-800">
                          What type of meal are you looking for?
                        </h3>
                        <RadioGroup value={mealType} onValueChange={setMealType} className="space-y-3 md:space-y-4">
                          <div className="flex items-center space-x-2 border p-3 md:p-4 rounded-lg hover:bg-amber-100 cursor-pointer">
                            <RadioGroupItem value="brunch" id="brunch" />
                            <Label htmlFor="brunch" className="flex-1 cursor-pointer">
                              <div className="font-medium">Brunch</div>
                              <div className="text-sm text-gray-600">Delivered at 8:30 AM</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border p-3 md:p-4 rounded-lg hover:bg-amber-100 cursor-pointer">
                            <RadioGroupItem value="dinner" id="dinner" />
                            <Label htmlFor="dinner" className="flex-1 cursor-pointer">
                              <div className="font-medium">Dinner</div>
                              <div className="text-sm text-gray-600">Delivered at 8:30 PM</div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-amber-800">
                          Choose your plan
                        </h3>
                        <div className="space-y-4">
                          <Select value={subscriptionOption} onValueChange={setSubscriptionOption}>
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

                          <div className="text-sm text-gray-600 mt-2">
                            {subscriptionOption !== "one-time" ? (
                              <div className="bg-amber-50 p-3 rounded-md">
                                <p className="font-medium text-amber-800">
                                  {subscriptionOptions.find((o) => o.id === subscriptionOption)?.name}
                                </p>
                                <p>{subscriptionOptions.find((o) => o.id === subscriptionOption)?.description}</p>
                                <p className="mt-1">
                                  <span className="font-medium">Duration:</span>{" "}
                                  {getDaysInSubscription(subscriptionOption)} days
                                </p>
                                {getDiscountPercentage() > 0 && (
                                  <p className="text-green-600">
                                    <span className="font-medium">Discount:</span> {getDiscountPercentage()}% off
                                    regular price
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-3 rounded-md">
                                <p className="font-medium">One-time Order</p>
                                <p>Perfect for trying our meals without commitment.</p>
                              </div>
                            )}
                          </div>

                          {subscriptionOption !== "one-time" && (
                            <NumberSelector
                              value={duration}
                              onChange={setDuration}
                              min={1}
                              max={12}
                              label="Subscription Duration (months)"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-amber-800">
                          {subscriptionOption === "one-time"
                            ? "How many meals would you like?"
                            : "How many people are you ordering for?"}
                        </h3>
                        <NumberSelector
                          value={people}
                          onChange={setPeople}
                          min={1}
                          max={10}
                          label={subscriptionOption === "one-time" ? "Number of Meals" : "Number of People"}
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-6 md:mt-8">
                  {step > 1 ? (
                    <Button variant="outline" onClick={handleBack} className="border-amber-700 text-amber-700">
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  <Button onClick={handleNext} className="bg-amber-700 hover:bg-amber-800">
                    {step === 3 ? "See Results" : "Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={`${cardStyle} overflow-hidden`}>
                <div className="bg-amber-700 text-white p-3 md:p-4 text-center">
                  <h3 className="text-lg md:text-xl font-bold">Your Personalized Meal Plan</h3>
                </div>
                <CardContent className="p-4 md:p-6 lg:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4 flex items-center">
                        <Utensils className="mr-2 h-4 w-4 md:h-5 md:w-5 text-amber-700" />
                        Plan Details
                      </h4>
                      <ul className="space-y-2 md:space-y-3">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Meal Type:</span>
                          <span className="font-medium">{mealType === "brunch" ? "Brunch" : "Dinner"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Plan Type:</span>
                          <span className="font-medium">
                            {subscriptionOption !== "one-time" ? "Subscription" : "One-time Order"}
                          </span>
                        </li>
                        {subscriptionOption !== "one-time" && (
                          <li className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">
                              {duration} month{duration > 1 ? "s" : ""}
                            </span>
                          </li>
                        )}
                        <li className="flex justify-between">
                          <span className="text-gray-600">
                            {subscriptionOption === "one-time" ? "Meals:" : "People:"}
                          </span>
                          <span className="font-medium">{people}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 md:h-5 md:w-5 text-amber-700" />
                        Delivery Schedule
                      </h4>
                      <ul className="space-y-2 md:space-y-3">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Delivery Time:</span>
                          <span className="font-medium">{mealType === "brunch" ? "8:30 AM" : "8:30 PM"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Frequency:</span>
                          <span className="font-medium">
                            {subscriptionOption !== "one-time"
                              ? subscriptionOptions.find((o) => o.id === subscriptionOption)?.description
                              : "One-time"}
                          </span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-gray-600">First Delivery:</span>
                          {subscriptionOption !== "one-time" ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="text-sm font-medium">
                                  {format(deliveryDate, "EEE, MMM d, h:mm a")}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="end">
                                <CalendarComponent
                                  mode="single"
                                  selected={deliveryDate}
                                  onSelect={(date) => {
                                    if (date) {
                                      // Keep the same time (8:30 AM/PM) but change the date
                                      const newDate = new Date(date)
                                      const hour = mealType === "brunch" ? 8 : 20
                                      newDate.setHours(hour, 30, 0, 0)
                                      setDeliveryDate(newDate)
                                    }
                                  }}
                                  disabled={(date) => {
                                    // Disable dates in the past and today (need at least 24h notice)
                                    const tomorrow = startOfDay(addDays(new Date(), 1))
                                    return isBefore(date, tomorrow)
                                  }}
                                  initialFocus
                                  className="rounded-md border"
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <span className="font-medium">{format(deliveryDate, "EEE, MMM d, h:mm a")}</span>
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-8 border-t pt-4 md:pt-6">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <h4 className="font-semibold text-base md:text-lg flex items-center">
                        <Clock className="mr-2 h-4 w-4 md:h-5 md:w-5 text-amber-700" />
                        Price Breakdown
                      </h4>
                      {appliedCoupon && (
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Coupon: {appliedCoupon.code}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {subscriptionOption !== "one-time" ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Plan:</span>
                            <span className="font-medium">
                              {subscriptionOptions.find((o) => o.id === subscriptionOption)?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price per meal:</span>
                            <span className="font-medium">
                              {appliedCoupon ? (
                                <>
                                  <span className="line-through text-gray-400 mr-2">
                                    ₹{getProductPrice().toFixed(2)}
                                  </span>
                                  ₹
                                  {(
                                    calculateDiscountedPrice(getProductPrice()) *
                                    (1 - getDiscountPercentage() / 100)
                                  ).toFixed(2)}
                                </>
                              ) : (
                                <>₹{calculateSubscriptionDiscount(getProductPrice(), subscriptionOption).toFixed(2)}</>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Days per month:</span>
                            <span className="font-medium">{getDaysInSubscription(subscriptionOption)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Cost:</span>
                            <span className="font-medium">
                              {appliedCoupon ? (
                                <>
                                  <span className="line-through text-gray-400 mr-2">
                                    ₹
                                    {(
                                      calculateSubscriptionDiscount(getProductPrice(), subscriptionOption) *
                                      getDaysInSubscription(subscriptionOption) *
                                      people
                                    ).toFixed(2)}
                                  </span>
                                  ₹
                                  {calculateDiscountedPrice(
                                    calculateSubscriptionDiscount(getProductPrice(), subscriptionOption) *
                                      getDaysInSubscription(subscriptionOption) *
                                      people,
                                  ).toFixed(2)}
                                </>
                              ) : (
                                <>
                                  ₹
                                  {(
                                    calculateSubscriptionDiscount(getProductPrice(), subscriptionOption) *
                                    getDaysInSubscription(subscriptionOption) *
                                    people
                                  ).toFixed(2)}
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Total ({duration} month{duration > 1 ? "s" : ""}):
                            </span>
                            <span className="font-medium">
                              {appliedCoupon ? (
                                <>
                                  <span className="line-through text-gray-400 mr-2">
                                    ₹
                                    {(
                                      calculateSubscriptionDiscount(getProductPrice(), subscriptionOption) *
                                      getDaysInSubscription(subscriptionOption) *
                                      people *
                                      duration
                                    ).toFixed(2)}
                                  </span>
                                  ₹
                                  {calculateDiscountedPrice(
                                    calculateSubscriptionDiscount(getProductPrice(), subscriptionOption) *
                                      getDaysInSubscription(subscriptionOption) *
                                      people *
                                      duration,
                                  ).toFixed(2)}
                                </>
                              ) : (
                                <>
                                  ₹
                                  {(
                                    calculateSubscriptionDiscount(getProductPrice(), subscriptionOption) *
                                    getDaysInSubscription(subscriptionOption) *
                                    people *
                                    duration
                                  ).toFixed(2)}
                                </>
                              )}
                            </span>
                          </div>
                          {savings > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Your Savings:</span>
                              <span className="font-medium">₹{savings}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">One-time Order:</span>
                            <span className="font-medium">
                              ₹{getProductPrice()} × {people} meal(s)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-medium">
                              {appliedCoupon ? (
                                <>
                                  <span className="line-through text-gray-400 mr-2">
                                    ₹{(getProductPrice() * people).toFixed(2)}
                                  </span>
                                  ₹{calculateDiscountedPrice(getProductPrice() * people).toFixed(2)}
                                </>
                              ) : (
                                <>₹{(getProductPrice() * people).toFixed(2)}</>
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
                    <Button
                      onClick={() => setShowResults(false)}
                      variant="outline"
                      className="flex-1 border-amber-700 text-amber-700"
                    >
                      Modify Plan
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 bg-amber-700 hover:bg-amber-800"
                      disabled={isAddingToCart}
                    >
                      {isAddingToCart ? "Adding..." : "Add to Cart"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
