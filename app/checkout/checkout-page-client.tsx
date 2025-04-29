"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"
import RazorpayPayment from "@/components/payment/razorpay-payment"
import PhonePePayment from "@/components/payment/phonepe-payment"
import { ChevronLeft, ChevronRight, User, MapPin, CreditCard, CheckCircle, ChevronDown } from "lucide-react"
import Image from "next/image"
import VoiceNoteRecorder from "@/components/checkout/voice-note-recorder"
import OrderBumps from "@/components/checkout/order-bumps"
import SweetsSubscriptionUpsell from "@/components/checkout/sweets-subscription-upsell"
import { getUpsellProducts } from "@/lib/recommendation-engine"
import OrderSummary from "@/components/checkout/order-summary"
import { useTracking } from "@/contexts/tracking-context"
import DeliveryDateSelector from "@/components/checkout/delivery-date-selector"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import OrderStorage from "@/lib/order-storage"
import { useCoupon } from "@/contexts/coupon-context"
import { CouponInput } from "@/components/checkout/coupon-input"

// Define checkout steps
const STEPS = {
  CONTACT: 0,
  LOCATION: 1,
  PAYMENT: 2,
}

// Replace the entire GoogleMapsUrlInput component with this simplified version:
function GoogleMapsUrlInput({ onLocationSelect, defaultLocation }: any) {
  const [mapUrl, setMapUrl] = useState(defaultLocation?.mapUrl || "")
  const [isValid, setIsValid] = useState(true)

  // Example URLs
  const exampleUrls = [
    "https://maps.app.goo.gl/abcdefghijklmnop",
    "https://goo.gl/maps/abcdefghijklmnop",
    "https://www.google.com/maps?q=11.0168,76.9558",
  ]

  // Load saved map URL from localStorage on component mount
  useEffect(() => {
    try {
      const savedLocationInfo = localStorage.getItem("annapurna-location-info")
      if (savedLocationInfo) {
        const parsedInfo = JSON.parse(savedLocationInfo)
        if (parsedInfo.mapUrl) {
          setMapUrl(parsedInfo.mapUrl)
          setIsValid(true)
          onLocationSelect(parsedInfo)
        }
      }
    } catch (error) {
      console.error("Failed to load saved location info:", error)
    }
  }, [onLocationSelect])

  // Validate and save the URL as the user types
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setMapUrl(url)

    // Basic validation - check if it looks like a Google Maps URL
    const isGoogleMapsUrl =
      url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps") || url.includes("google.com/maps")

    setIsValid(url === "" || isGoogleMapsUrl)

    // If valid, update the parent component with the URL
    if (isGoogleMapsUrl) {
      const locationInfo = {
        address: "Delivery location from Google Maps URL",
        lat: 11.0168, // Default coordinates for Isha area
        lng: 76.9558,
        mapUrl: url,
      }

      onLocationSelect(locationInfo)

      // Save to localStorage
      localStorage.setItem("annapurna-location-info", JSON.stringify(locationInfo))
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="map-url">Google Maps URL</Label>
        <Input
          id="map-url"
          value={mapUrl}
          onChange={handleUrlChange}
          placeholder="Paste your Google Maps location URL"
          className={!isValid ? "border-red-500" : ""}
        />
        {!isValid && <p className="text-red-500 text-sm">Please enter a valid Google Maps URL</p>}
        {mapUrl && isValid && (
          <p className="text-green-600 text-sm flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" /> Google Maps location saved
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-3 rounded-md text-sm">
        <p className="font-medium mb-1">Example Google Maps URLs:</p>
        <ul className="space-y-1 text-gray-600">
          {exampleUrls.map((url, index) => (
            <li key={index} className="truncate">
              {url}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          To get a Google Maps URL: Open Google Maps, find your location, click "Share", and copy the link.
        </p>
      </div>
    </div>
  )
}

export default function CheckoutPageClient() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, subtotal, deliveryFee, total, clearCart, updateSubscription, orderId, updateDeliveryFee } = useCart()
  const [expandedSection, setExpandedSection] = useState(STEPS.CONTACT)
  const [completedSections, setCompletedSections] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(() => {
    // Load saved payment method from localStorage
    if (typeof window !== "undefined") {
      const savedMethod = localStorage.getItem("annapurna-payment-method")
      return savedMethod || "razorpay"
    }
    return "razorpay"
  })
  const [upsellProducts, setUpsellProducts] = useState<any[]>([])
  const [hasSubscription, setHasSubscription] = useState(false)
  const [mealType, setMealType] = useState("")
  const { trackCheckoutStep, updateOrderStatus, updateOrder, identifyUser } = useTracking()
  const isMobile = useMobile()

  // Add state to track if we've loaded cart from localStorage
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false)
  // Add state to track if we're showing loading state
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  // Add state to track if we should redirect
  const [shouldRedirect, setShouldRedirect] = useState(false)
  // Add state to store cart items from localStorage
  const [localStorageItems, setLocalStorageItems] = useState<any[]>([])

  // Refs for scrolling to sections
  const sectionRefs = {
    [STEPS.CONTACT]: useRef<HTMLDivElement>(null),
    [STEPS.LOCATION]: useRef<HTMLDivElement>(null),
    [STEPS.PAYMENT]: useRef<HTMLDivElement>(null),
  }

  // Customer information state
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    zipcode: "",
    voiceNote: undefined as Blob | undefined,
  })

  // Add a state for zipcode validation
  const [zipcodeValidation, setZipcodeValidation] = useState<{ valid: boolean; message: string } | null>(null)

  // Also update the locationInfo state to include mapUrl:
  const [locationInfo, setLocationInfo] = useState({
    address: "",
    lat: 0,
    lng: 0,
    mapUrl: "",
  })

  // Add a new state for the delivery date
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const savedDate = localStorage.getItem("annapurna-delivery-date")
      return savedDate ? new Date(savedDate) : null
    }
    return null
  })

  // Initialize the coupon context
  const couponContext = useCoupon()

  // Add this line after other context hooks
  const { appliedCoupon } = useCoupon()

  // First, load cart from localStorage directly
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = localStorage.getItem("annapurna-cart")
        console.log("Checking localStorage cart:", savedCart)

        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart)) {
            setLocalStorageItems(parsedCart)
            console.log("Loaded cart from localStorage:", parsedCart)

            // If we have items in localStorage but not in context, we'll use these
            if (parsedCart.length > 0) {
              setHasLoadedFromStorage(true)
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error)
      }
    }

    loadCartFromStorage()
  }, [])

  // Load saved customer info from localStorage
  useEffect(() => {
    try {
      const savedCustomerInfo = localStorage.getItem("annapurna-customer-info")
      if (savedCustomerInfo) {
        const parsedInfo = JSON.parse(savedCustomerInfo)
        setCustomerInfo((prev) => ({
          ...prev,
          name: parsedInfo.name || "",
          email: parsedInfo.email || "",
          phone: parsedInfo.phone || "",
          zipcode: parsedInfo.zipcode || "",
          notes: parsedInfo.notes || "",
        }))
      }

      const savedLocationInfo = localStorage.getItem("annapurna-location-info")
      if (savedLocationInfo) {
        setLocationInfo(JSON.parse(savedLocationInfo))
      }

      // Try to load voice note from sessionStorage (since localStorage can't store blobs)
      const savedVoiceNote = sessionStorage.getItem("annapurna-voice-note")
      if (savedVoiceNote === "true") {
        // We just store a flag indicating there is a voice note
        // The actual blob is handled by the VoiceNoteRecorder component
        setCustomerInfo((prev) => ({
          ...prev,
          hasVoiceNote: true,
        }))
      }
    } catch (error) {
      console.error("Failed to load saved customer info:", error)
    }
  }, [])

  // Track checkout started
  useEffect(() => {
    if (orderId) {
      updateOrderStatus(orderId, "checkout_started")
      trackCheckoutStep(0, orderId, { items, total })
    }
  }, [orderId])

  // CRITICAL: Modify the redirect logic to be more robust
  useEffect(() => {
    // Only check after a delay to ensure cart has time to load
    const timer = setTimeout(() => {
      // First check if we're still loading
      if (isLoadingCart) {
        setIsLoadingCart(false)
        return
      }

      // Check if we have items in context or localStorage
      const hasItemsInContext = items.length > 0
      const hasItemsInStorage = localStorageItems.length > 0

      console.log("Cart check (delayed):", {
        hasItemsInContext,
        hasItemsInStorage,
        contextItems: items,
        storageItems: localStorageItems,
      })

      // Only redirect if both are empty AND we've already tried to load from storage
      if (!hasItemsInContext && !hasItemsInStorage && hasLoadedFromStorage) {
        console.log("Both context and localStorage are empty, redirecting to cart")
        setShouldRedirect(true)
      } else {
        // We have items, so we're good to stay on the checkout page
        setIsLoadingCart(false)
      }
    }, 1000) // Wait 1 second to check

    return () => clearTimeout(timer)
  }, [items, localStorageItems, hasLoadedFromStorage, isLoadingCart])

  // Handle the actual redirect
  useEffect(() => {
    if (shouldRedirect) {
      console.log("Redirecting to cart page")
      window.location.href = "/cart"
    }
  }, [shouldRedirect])

  // Check if cart has subscription items and determine meal type
  useEffect(() => {
    // Use either context items or localStorage items
    const itemsToUse = items.length > 0 ? items : localStorageItems

    const hasSubscriptionItem = itemsToUse.some(
      (item) => item.subscriptionOption && item.subscriptionOption !== "one-time",
    )
    setHasSubscription(hasSubscriptionItem)

    // Determine meal type (brunch or dinner)
    const brunchItem = itemsToUse.find((item) => item.product.id === "brunch")
    const dinnerItem = itemsToUse.find((item) => item.product.id === "dinner")

    if (brunchItem) {
      setMealType("brunch")
    } else if (dinnerItem) {
      setMealType("dinner")
    }

    // Get upsell products based on subscription status and meal type
    const type = brunchItem ? "brunch" : "dinner"
    setUpsellProducts(getUpsellProducts(hasSubscriptionItem, type))
  }, [items, localStorageItems])

  // Store cart items in session storage for PhonePe callback
  useEffect(() => {
    // Use either context items or localStorage items
    const itemsToUse = items.length > 0 ? items : localStorageItems

    if (itemsToUse.length > 0) {
      sessionStorage.setItem("cartItems", JSON.stringify(itemsToUse))
    }
  }, [items, localStorageItems])

  // Store location info in session storage for PhonePe callback
  useEffect(() => {
    if (locationInfo.address) {
      sessionStorage.setItem("locationInfo", JSON.stringify(locationInfo))
      // Also save to localStorage for persistence
      localStorage.setItem("annapurna-location-info", JSON.stringify(locationInfo))
    }
  }, [locationInfo])

  // Store delivery date in localStorage when it changes
  useEffect(() => {
    if (deliveryDate) {
      localStorage.setItem("annapurna-delivery-date", deliveryDate.toISOString())
      sessionStorage.setItem("selectedDeliveryDate", deliveryDate.toISOString())
    }
  }, [deliveryDate])

  // Initialize the coupon context
  //const coupon = useCoupon()

  // Add this line after other context hooks
  //const { appliedCoupon } = useCoupon()

  // Scroll to expanded section when it changes
  useEffect(() => {
    if (isMobile && sectionRefs[expandedSection]?.current) {
      setTimeout(() => {
        sectionRefs[expandedSection]?.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }, [expandedSection, isMobile])

  // Sync subscription durations when cart changes
  useEffect(() => {
    // Use either context items or localStorage items
    const itemsToUse = items.length > 0 ? items : localStorageItems

    // Find meal subscription (brunch or dinner)
    const mealSub = itemsToUse.find(
      (item) =>
        (item.product.id === "brunch" || item.product.id === "dinner") &&
        item.subscriptionOption &&
        item.subscriptionOption !== "one-time",
    )

    // Find sweets subscription
    const sweetsSub = itemsToUse.find(
      (item) =>
        item.product.id === "sweets-subscription" && item.subscriptionOption && item.subscriptionOption !== "one-time",
    )

    // If both exist but have different subscription options/days, update sweets to match meal
    if (
      mealSub &&
      sweetsSub &&
      (mealSub.subscriptionOption !== sweetsSub.subscriptionOption ||
        mealSub.subscriptionDays !== sweetsSub.subscriptionDays)
    ) {
      // Update sweets subscription to match meal subscription
      updateSubscription(
        "sweets-subscription",
        mealSub.subscriptionOption || "monthly-1",
        mealSub.subscriptionDays || 30,
      )
    }
  }, [items, localStorageItems, updateSubscription])

  // Add this effect to reset payment method if needed for subscription orders
  useEffect(() => {
    // If user has subscription items but has selected COD, change to Razorpay
    if (hasSubscription && paymentMethod === "cod") {
      setPaymentMethod("razorpay")
      localStorage.setItem("annapurna-payment-method", "razorpay")

      if (orderId) {
        updateOrder(orderId, {
          paymentMethod: "razorpay",
          status: "payment_selected",
        })

        trackCheckoutStep(3, orderId, {
          step: "payment_selected",
          paymentMethod: "razorpay",
        })
      }
    }
  }, [hasSubscription, paymentMethod, orderId, updateOrder, trackCheckoutStep])

  // Handle input change and identify user
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setCustomerInfo((prev) => {
      const updated = {
        ...prev,
        [id]: value,
      }

      // Save to localStorage for persistence
      localStorage.setItem("annapurna-customer-info", JSON.stringify(updated))

      return updated
    })

    // Update delivery fee when zipcode changes
    if (id === "zipcode" && value.length === 6) {
      const validationResult = updateDeliveryFee(value)

      // Store the validation result for display
      setZipcodeValidation(validationResult)
    }
  }

  const handleLocationSelect = (location: { address: string; lat: number; lng: number; mapUrl?: string }) => {
    setLocationInfo(location)
    // Save to localStorage
    localStorage.setItem("annapurna-location-info", JSON.stringify(location))
  }

  // Toggle section expansion
  const toggleSection = (section: number) => {
    if (expandedSection === section) {
      // If clicking on already expanded section, do nothing
      return
    }

    // If trying to access a section that's not completed and not the next one
    if (!completedSections.includes(section) && section !== expandedSection + 1 && section !== 0) {
      toast({
        title: "Complete previous sections first",
        description: "Please complete the previous sections before proceeding.",
        variant: "destructive",
      })
      return
    }

    setExpandedSection(section)
  }

  // Complete current section and move to next
  const completeSection = () => {
    // Validate current section
    if (expandedSection === STEPS.CONTACT) {
      if (!customerInfo.name || !customerInfo.phone || !customerInfo.email || !customerInfo.zipcode) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerInfo.email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        })
        return
      }

      // Validate zipcode format (6 digits for Indian pincodes)
      if (!/^\d{6}$/.test(customerInfo.zipcode)) {
        toast({
          title: "Invalid pincode",
          description: "Please enter a valid 6-digit pincode.",
          variant: "destructive",
        })
        return
      }

      // Check if delivery is available to this pincode
      const validationResult = updateDeliveryFee(customerInfo.zipcode)
      if (!validationResult.valid) {
        toast({
          title: "Delivery not available",
          description: validationResult.message,
          variant: "destructive",
        })
        return
      }

      // Identify user and update order with contact info
      identifyUser({
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
      })

      if (orderId) {
        updateOrder(orderId, {
          contactInfo: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            zipcode: customerInfo.zipcode,
          },
          status: "contact_info_added",
        })

        trackCheckoutStep(1, orderId, {
          step: "contact_info",
          customerInfo: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
        })
      }

      // Mark this section as completed
      setCompletedSections((prev) => [...prev.filter((s) => s !== STEPS.CONTACT), STEPS.CONTACT])

      // Move to next section
      setExpandedSection(STEPS.LOCATION)
    } else if (expandedSection === STEPS.LOCATION) {
      if (!locationInfo.address) {
        toast({
          title: "Missing location",
          description: "Please select a delivery location on the map.",
          variant: "destructive",
        })
        return
      }

      if (!deliveryDate) {
        toast({
          title: "Missing delivery date",
          description: "Please select a delivery date.",
          variant: "destructive",
        })
        return
      }

      // Update order with location info
      if (orderId) {
        updateOrder(orderId, {
          locationInfo: {
            address: locationInfo.address,
            lat: locationInfo.lat,
            lng: locationInfo.lng,
            mapUrl: locationInfo.mapUrl,
          },
          status: "location_added",
          voiceNote: !!customerInfo.voiceNote,
          deliveryDate: deliveryDate ? deliveryDate.toISOString() : undefined,
        })

        trackCheckoutStep(2, orderId, {
          step: "location_info",
          locationInfo,
          hasVoiceNote: !!customerInfo.voiceNote,
          deliveryDate: deliveryDate ? deliveryDate.toISOString() : undefined,
        })
      }

      // Mark this section as completed
      setCompletedSections((prev) => [...prev.filter((s) => s !== STEPS.LOCATION), STEPS.LOCATION])

      // Move to next section
      setExpandedSection(STEPS.PAYMENT)
    }
  }

  // Update payment method selection to track
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value)
    // Save to localStorage
    localStorage.setItem("annapurna-payment-method", value)

    if (orderId) {
      updateOrder(orderId, {
        paymentMethod: value,
        status: "payment_selected",
      })

      trackCheckoutStep(3, orderId, {
        step: "payment_selected",
        paymentMethod: value,
      })
    }
  }

  // Find the handlePaymentSuccess function and update it to include more data
  const handlePaymentSuccess = (paymentId: string, orderId: string) => {
    // Use either context items or localStorage items
    const itemsToDisplay = items.length > 0 ? items : localStorageItems

    if (orderId) {
      updateOrderStatus(orderId, "payment_completed")
      updateOrder(orderId, {
        transactionId: paymentId,
        amount: total,
      })

      // Replace the direct tracking service call with a simpler version
      if (typeof window !== "undefined") {
        // Store order completion info in localStorage for debugging only
        try {
          localStorage.setItem("last_order_id", orderId)
          localStorage.setItem("last_payment_id", paymentId)
        } catch (e) {
          // Ignore storage errors
        }
      }
    }

    // Store payment details in session storage for the success page
    sessionStorage.setItem(
      "paymentDetails",
      JSON.stringify({
        paymentId,
        orderId,
        amount: total,
        date: new Date().toISOString(),
        gateway: paymentMethod === "razorpay" ? "Razorpay" : "PhonePe",
      }),
    )

    // Store order details
    sessionStorage.setItem(
      "orderDetails",
      JSON.stringify({
        customerInfo,
        locationInfo,
        items: itemsToDisplay,
        total,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : undefined,
      }),
    )

    // Add this after storing payment details in session storage for the success page
    // Store complete order data in localStorage for admin dashboard
    const completeOrderData = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: "completed",
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        notes: customerInfo.notes,
        zipcode: customerInfo.zipcode,
        hasVoiceNote: !!customerInfo.voiceNote,
      },
      locationInfo,
      paymentInfo: {
        method: paymentMethod,
        transactionId: paymentId,
        amount: total,
      },
      items: itemsToDisplay.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity || 1,
        price: item.product.price,
        subscriptionOption: item.subscriptionOption,
        subscriptionDays: item.subscriptionDays,
      })),
      deliveryDate: deliveryDate ? deliveryDate.toISOString() : undefined,
      total,
      couponCode: appliedCoupon ? couponContext.appliedCoupon.code : undefined,
    }

    // Save order data to localStorage using our enhanced service
    OrderStorage.saveOrder(completeOrderData)

    // Clear the cart
    clearCart()

    // Show success toast
    toast({
      title: "Payment successful!",
      description: "Your order has been placed successfully.",
    })

    // Redirect to success page
    router.push("/checkout/success")
  }

  const placeOrder = () => {
    // For Razorpay and PhonePe, the payment is handled by their respective components
  }

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error)
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    })
  }

  // If we're still loading, show a loading spinner
  if (isLoadingCart) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
        <p className="ml-3 text-amber-700">Loading your cart...</p>
      </div>
    )
  }

  // Use either context items or localStorage items
  const itemsToDisplay = items.length > 0 ? items : localStorageItems

  // If cart is empty after loading, show a message
  if (itemsToDisplay.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Please add some items to your cart before proceeding to checkout.</p>
          <Button onClick={() => (window.location.href = "/menu")} className="bg-amber-700 hover:bg-amber-800">
            Browse Menu
          </Button>
        </div>
      </div>
    )
  }

  // Render section header with completion status
  const renderSectionHeader = (step: number, title: string, icon: React.ReactNode) => {
    const isCompleted = completedSections.includes(step)
    const isExpanded = expandedSection === step
    const isActive = isExpanded || isCompleted

    return (
      <div
        ref={sectionRefs[step]}
        className={`flex items-center p-4 cursor-pointer ${isActive ? "bg-white" : "bg-gray-50"}`}
        onClick={() => toggleSection(step)}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            isCompleted
              ? "bg-green-500 text-white"
              : isExpanded
                ? "bg-amber-700 text-white"
                : "bg-gray-200 text-gray-500"
          }`}
        >
          {isCompleted ? <CheckCircle className="h-5 w-5" /> : icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{title}</span>
            {!isExpanded && <ChevronDown className="h-4 w-4 text-gray-500" />}
          </div>
          {isExpanded && <div className="h-1 bg-amber-700 rounded-full mt-1 w-full"></div>}
          {isCompleted && !isExpanded && (
            <div className="text-sm text-green-600 flex items-center mt-1">
              <CheckCircle className="h-3 w-3 mr-1" /> Completed
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-amber-800 mb-8">Checkout</h1>
      {/* Mobile Accordion Checkout */}
      <div className="md:hidden">
        <div className="rounded-lg overflow-hidden border border-gray-200 mb-6">
          {/* Contact Section */}
          <div className="border-b">
            {renderSectionHeader(STEPS.CONTACT, "Contact", <User className="h-5 w-5" />)}
            <AnimatePresence>
              {expandedSection === STEPS.CONTACT && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 pt-0">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          required
                          className="mt-1"
                          value={customerInfo.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">WhatsApp Number *</Label>
                        <Input
                          id="phone"
                          placeholder="Your WhatsApp number"
                          required
                          className="mt-1"
                          value={customerInfo.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email address"
                          required
                          className="mt-1"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipcode">Pincode/Zipcode *</Label>
                        <Input
                          id="zipcode"
                          placeholder="Enter your pincode"
                          required
                          className={`mt-1 ${zipcodeValidation && !zipcodeValidation.valid ? "border-red-500" : ""}`}
                          value={customerInfo.zipcode}
                          onChange={handleInputChange}
                        />
                        {zipcodeValidation && (
                          <p className={`text-xs mt-1 ${zipcodeValidation.valid ? "text-green-600" : "text-red-500"}`}>
                            {zipcodeValidation.message}
                          </p>
                        )}
                      </div>
                      <Button onClick={completeSection} className="w-full bg-amber-700 hover:bg-amber-800">
                        Continue
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Location Section */}
          <div className="border-b">
            {renderSectionHeader(STEPS.LOCATION, "Location", <MapPin className="h-5 w-5" />)}
            <AnimatePresence>
              {expandedSection === STEPS.LOCATION && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 pt-0">
                    <GoogleMapsUrlInput onLocationSelect={handleLocationSelect} defaultLocation={locationInfo} />
                    <div className="mt-4">
                      <Label>Delivery Instructions (Voice Note)</Label>
                      <VoiceNoteRecorder
                        onRecordingComplete={(audioBlob) => {
                          setCustomerInfo((prev) => ({
                            ...prev,
                            voiceNote: audioBlob,
                          }))
                          // Store a flag in sessionStorage indicating there is a voice note
                          sessionStorage.setItem("annapurna-voice-note", "true")
                        }}
                        onRecordingClear={() => {
                          setCustomerInfo((prev) => ({
                            ...prev,
                            voiceNote: undefined,
                          }))
                          // Remove the flag from sessionStorage
                          sessionStorage.removeItem("annapurna-voice-note")
                        }}
                        existingRecording={customerInfo.voiceNote}
                      />
                      <div className="mt-6">
                        <Label>Delivery Date</Label>
                        <DeliveryDateSelector
                          mealType={mealType === "brunch" ? "brunch" : "dinner"}
                          isSubscription={hasSubscription}
                          onDateSelected={(date) => setDeliveryDate(date)}
                          defaultDate={deliveryDate}
                        />
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button
                          variant="outline"
                          onClick={() => toggleSection(STEPS.CONTACT)}
                          className="border-amber-700 text-amber-700"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button onClick={completeSection} className="bg-amber-700 hover:bg-amber-800">
                          Continue
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment Section */}
          <div>
            {renderSectionHeader(STEPS.PAYMENT, "Payment", <CreditCard className="h-5 w-5" />)}
            <AnimatePresence>
              {expandedSection === STEPS.PAYMENT && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 pt-0">
                    {/* Add coupon input at the top of the payment section */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Have a coupon code?</h3>
                      <CouponInput />
                    </div>

                    <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-3">
                      <div
                        className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-amber-100 cursor-pointer"
                        onClick={() => handlePaymentMethodChange("razorpay")}
                      >
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                          <div className="font-medium">Pay with Razorpay</div>
                          <div className="text-sm text-gray-600">
                            Pay securely with credit/debit card, UPI, or net banking
                          </div>
                        </Label>
                        <div className="w-24 h-10 relative">
                          <Image
                            src="/images/razorpay-logo.png"
                            alt="Razorpay"
                            fill
                            className="object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src =
                                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/razorpay%20brand%20logo-A7IwYxfloeVtK0E9V8JjS80lq3xDWL.png"
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-purple-50 cursor-pointer"
                        onClick={() => handlePaymentMethodChange("phonepe")}
                      >
                        <RadioGroupItem value="phonepe" id="phonepe" />
                        <Label htmlFor="phonepe" className="flex-1 cursor-pointer">
                          <div className="font-medium">Pay with PhonePe</div>
                          <div className="text-sm text-gray-600">Quick and secure payments with PhonePe</div>
                        </Label>
                        <div className="w-24 h-10 relative">
                          <Image
                            src="/images/phonepe-logo.png"
                            alt="PhonePe"
                            fill
                            className="object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src =
                                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/phonepe%20brand%20logo.jpg-ADPYAGEn2xjnsmcDNubiJABdEk2vSk.jpeg"
                            }}
                          />
                        </div>
                      </div>
                    </RadioGroup>

                    {/* Upsell/Order Bumps Section - Only show on payment step */}
                    {hasSubscription && <SweetsSubscriptionUpsell />}

                    {/* Show regular upsells for all customers */}
                    {upsellProducts.length > 0 && (
                      <OrderBumps
                        products={upsellProducts}
                        title="Enhance Your Order"
                        description="Add these complementary items to your order with just one click!"
                      />
                    )}

                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outline"
                        onClick={() => toggleSection(STEPS.LOCATION)}
                        className="border-amber-700 text-amber-700"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    </div>

                    {/* Payment buttons */}
                    <div className="w-full space-y-4 mt-4">
                      {paymentMethod === "razorpay" && (
                        <RazorpayPayment
                          amount={total}
                          customerInfo={{
                            name: customerInfo.name,
                            email: customerInfo.email || "customer@example.com",
                            phone: customerInfo.phone,
                            address: locationInfo.address,
                          }}
                          onSuccess={handlePaymentSuccess}
                          onFailure={handlePaymentFailure}
                          className="mb-4"
                        />
                      )}

                      {paymentMethod === "phonepe" && (
                        <PhonePePayment
                          amount={total}
                          customerInfo={{
                            name: customerInfo.name,
                            email: customerInfo.email || "customer@example.com",
                            phone: customerInfo.phone,
                            address: locationInfo.address,
                          }}
                          onSuccess={handlePaymentSuccess}
                          onFailure={handlePaymentFailure}
                          className="mb-4"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Order Summary for Mobile */}
        <OrderSummary />
      </div>
      ;
      <div className="hidden md:block">
        {/* Checkout Progress */}
        <div className="mb-8">
          <div className="flex justify-between">
            {Object.values(STEPS)
              .filter((step) => typeof step === "number")
              .map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      completedSections.includes(step)
                        ? "bg-green-500 text-white"
                        : expandedSection === step
                          ? "bg-amber-700 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {completedSections.includes(step) ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : step === STEPS.CONTACT ? (
                      <User className="h-5 w-5" />
                    ) : step === STEPS.LOCATION ? (
                      <MapPin className="h-5 w-5" />
                    ) : step === STEPS.PAYMENT ? (
                      <CreditCard className="h-5 w-5" />
                    ) : (
                      <CheckCircle className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {step === STEPS.CONTACT
                      ? "Contact"
                      : step === STEPS.LOCATION
                        ? "Location"
                        : step === STEPS.PAYMENT
                          ? "Payment"
                          : "Review"}
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-2 h-1 bg-gray-200 rounded-full">
            <div
              className="h-full bg-amber-700 rounded-full transition-all duration-300"
              style={{ width: `${(expandedSection / (Object.keys(STEPS).length / 2 - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 w-full">
            <Card className="mb-8">
              <CardContent className="p-6">
                {/* Step 1: Contact Information */}
                {expandedSection === STEPS.CONTACT && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          required
                          className="mt-1"
                          value={customerInfo.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">WhatsApp Number *</Label>
                        <Input
                          id="phone"
                          placeholder="Your WhatsApp number"
                          required
                          className="mt-1"
                          value={customerInfo.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email address"
                          required
                          className="mt-1"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipcode">Pincode/Zipcode *</Label>
                        <Input
                          id="zipcode"
                          placeholder="Enter your pincode"
                          required
                          className={`mt-1 ${zipcodeValidation && !zipcodeValidation.valid ? "border-red-500" : ""}`}
                          value={customerInfo.zipcode}
                          onChange={handleInputChange}
                        />
                        {zipcodeValidation && (
                          <p className={`text-xs mt-1 ${zipcodeValidation.valid ? "text-green-600" : "text-red-500"}`}>
                            {zipcodeValidation.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Delivery Location */}
                {expandedSection === STEPS.LOCATION && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Delivery Location</h2>
                    <GoogleMapsUrlInput onLocationSelect={handleLocationSelect} defaultLocation={locationInfo} />
                    <div className="mt-4">
                      <Label>Delivery Instructions (Voice Note)</Label>
                      <VoiceNoteRecorder
                        onRecordingComplete={(audioBlob) => {
                          // Store the audio blob in the state
                          setCustomerInfo((prev) => ({
                            ...prev,
                            voiceNote: audioBlob,
                          }))
                          // Store a flag in sessionStorage indicating there is a voice note
                          sessionStorage.setItem("annapurna-voice-note", "true")
                        }}
                        onRecordingClear={() => {
                          // Clear the voice note
                          setCustomerInfo((prev) => ({
                            ...prev,
                            voiceNote: undefined,
                          }))
                          // Remove the flag from sessionStorage
                          sessionStorage.removeItem("annapurna-voice-note")
                        }}
                        existingRecording={customerInfo.voiceNote}
                      />
                      <div className="mt-6">
                        <Label>Delivery Date</Label>
                        <DeliveryDateSelector
                          mealType={mealType === "brunch" ? "brunch" : "dinner"}
                          isSubscription={hasSubscription}
                          onDateSelected={(date) => setDeliveryDate(date)}
                          defaultDate={deliveryDate}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Method */}
                {expandedSection === STEPS.PAYMENT && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

                    {/* Add coupon input at the top of the payment section */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Have a coupon code?</h3>
                      <CouponInput />
                    </div>

                    <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-3">
                      <div
                        className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-amber-100 cursor-pointer"
                        onClick={() => handlePaymentMethodChange("razorpay")}
                      >
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                          <div className="font-medium">Pay with Razorpay</div>
                          <div className="text-sm text-gray-600">
                            Pay securely with credit/debit card, UPI, or net banking
                          </div>
                        </Label>
                        <div className="w-24 h-10 relative">
                          <Image
                            src="/images/razorpay-logo.png"
                            alt="Razorpay"
                            fill
                            className="object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src =
                                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/razorpay%20brand%20logo-A7IwYxfloeVtK0E9V8JjS80lq3xDWL.png"
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-purple-50 cursor-pointer"
                        onClick={() => handlePaymentMethodChange("phonepe")}
                      >
                        <RadioGroupItem value="phonepe" id="phonepe" />
                        <Label htmlFor="phonepe" className="flex-1 cursor-pointer">
                          <div className="font-medium">Pay with PhonePe</div>
                          <div className="text-sm text-gray-600">Quick and secure payments with PhonePe</div>
                        </Label>
                        <div className="w-24 h-10 relative">
                          <Image
                            src="/images/phonepe-logo.png"
                            alt="PhonePe"
                            fill
                            className="object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src =
                                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/phonepe%20brand%20logo.jpg-ADPYAGEn2xjnsmcDNubiJABdEk2vSk.jpeg"
                            }}
                          />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upsell/Order Bumps Section - Only show on payment step */}
            {expandedSection === STEPS.PAYMENT && (
              <>
                {/* Show sweets subscription upsell for subscription customers */}
                {hasSubscription && <SweetsSubscriptionUpsell />}

                {/* Show regular upsells for all customers */}
                {upsellProducts.length > 0 && (
                  <OrderBumps
                    products={upsellProducts}
                    title="Enhance Your Order"
                    description="Add these complementary items to your order with just one click!"
                  />
                )}
              </>
            )}

            {/* Navigation Buttons */}
            <div className={`flex ${expandedSection === STEPS.PAYMENT ? "flex-col" : "justify-between"}`}>
              {expandedSection > STEPS.CONTACT ? (
                <Button
                  variant="outline"
                  onClick={() => toggleSection(expandedSection - 1)}
                  className="border-amber-700 text-amber-700 mb-4"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              {expandedSection < STEPS.PAYMENT ? (
                <Button onClick={completeSection} className="bg-amber-700 hover:bg-amber-800">
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                // Payment buttons on payment stage
                <div className="w-full space-y-4 mt-4">
                  {paymentMethod === "razorpay" && (
                    <RazorpayPayment
                      amount={total}
                      customerInfo={{
                        name: customerInfo.name,
                        email: customerInfo.email || "customer@example.com",
                        phone: customerInfo.phone,
                        address: locationInfo.address,
                      }}
                      onSuccess={handlePaymentSuccess}
                      onFailure={handlePaymentFailure}
                      className="mb-4"
                    />
                  )}

                  {paymentMethod === "phonepe" && (
                    <PhonePePayment
                      amount={total}
                      customerInfo={{
                        name: customerInfo.name,
                        email: customerInfo.email || "customer@example.com",
                        phone: customerInfo.phone,
                        address: locationInfo.address,
                      }}
                      onSuccess={handlePaymentSuccess}
                      onFailure={handlePaymentFailure}
                      className="mb-4"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
