"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"
import RazorpayPayment from "@/components/payment/razorpay-payment"
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
import type { CartItem } from "@/contexts/cart-context"

// Define checkout steps
const STEPS = {
  CONTACT: 0,
  LOCATION: 1,
  PAYMENT: 2,
} as const

type CheckoutStep = (typeof STEPS)[keyof typeof STEPS]

// Types for location info
interface LocationInfo {
  address: string
  lat: number
  lng: number
  mapUrl: string
}

// Types for customer info
interface CustomerInfo {
  name: string
  email: string
  phone: string
  notes: string
  zipcode: string
  voiceNote?: Blob
  hasVoiceNote?: boolean
}

// Google Maps URL Input Component
function GoogleMapsUrlInput({
  onLocationSelect,
  defaultLocation,
}: {
  onLocationSelect: (location: LocationInfo) => void
  defaultLocation?: LocationInfo
}) {
  const [mapUrl, setMapUrl] = useState(defaultLocation?.mapUrl || "")
  const [isValid, setIsValid] = useState(true)
  const initialLoadRef = useRef(true)

  // Example URLs
  const exampleUrls = [
    "https://maps.app.goo.gl/abcdefghijklmnop",
    "https://goo.gl/maps/abcdefghijklmnop",
    "https://www.google.com/maps?q=11.0168,76.9558",
  ]

  // Load saved map URL from localStorage on component mount
  useEffect(() => {
    if (!initialLoadRef.current) return

    try {
      const savedLocationInfo = localStorage.getItem("annapurna-location-info")
      if (savedLocationInfo) {
        const parsedInfo = JSON.parse(savedLocationInfo)
        if (parsedInfo.mapUrl) {
          setMapUrl(parsedInfo.mapUrl)
          setIsValid(true)
          // Only call onLocationSelect during initial load
          onLocationSelect(parsedInfo)
        }
      }
    } catch (error) {
      console.error("Failed to load saved location info:", error)
    } finally {
      initialLoadRef.current = false
    }
  }, [onLocationSelect])

  // Validate and save the URL as the user types
  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [onLocationSelect],
  )

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

// Section Header Component
function SectionHeader({
  step,
  title,
  icon,
  isCompleted,
  isExpanded,
  onClick,
  sectionRef,
}: {
  step: CheckoutStep
  title: string
  icon: React.ReactNode
  isCompleted: boolean
  isExpanded: boolean
  onClick: () => void
  sectionRef: React.RefObject<HTMLDivElement>
}) {
  const isActive = isExpanded || isCompleted

  return (
    <div
      ref={sectionRef}
      className={`flex items-center p-4 cursor-pointer ${isActive ? "bg-white" : "bg-gray-50"}`}
      onClick={onClick}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
          isCompleted ? "bg-green-500 text-white" : isExpanded ? "bg-amber-700 text-white" : "bg-gray-200 text-gray-500"
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

// Contact Form Component
function ContactForm({
  customerInfo,
  zipcodeValidation,
  handleInputChange,
  onComplete,
}: {
  customerInfo: CustomerInfo
  zipcodeValidation: { valid: boolean; message: string } | null
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onComplete: () => void
}) {
  return (
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
      <Button onClick={onComplete} className="w-full bg-amber-700 hover:bg-amber-800">
        Continue
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

// Location Form Component
function LocationForm({
  locationInfo,
  customerInfo,
  deliveryDate,
  mealType,
  hasSubscription,
  onLocationSelect,
  onVoiceNoteComplete,
  onVoiceNoteClear,
  onDateSelected,
  onBack,
  onComplete,
}: {
  locationInfo: LocationInfo
  customerInfo: CustomerInfo
  deliveryDate: Date | null
  mealType: string
  hasSubscription: boolean
  onLocationSelect: (location: LocationInfo) => void
  onVoiceNoteComplete: (blob: Blob) => void
  onVoiceNoteClear: () => void
  onDateSelected: (date: Date) => void
  onBack: () => void
  onComplete: () => void
}) {
  return (
    <div>
      <GoogleMapsUrlInput onLocationSelect={onLocationSelect} defaultLocation={locationInfo} />
      <div className="mt-4">
        <Label>Delivery Instructions (Voice Note)</Label>
        <VoiceNoteRecorder
          onRecordingComplete={onVoiceNoteComplete}
          onRecordingClear={onVoiceNoteClear}
          existingRecording={customerInfo.voiceNote}
        />
        <div className="mt-6">
          <Label>Delivery Date</Label>
          <DeliveryDateSelector
            mealType={mealType === "brunch" ? "brunch" : "dinner"}
            isSubscription={hasSubscription}
            onDateSelected={onDateSelected}
            defaultDate={deliveryDate}
          />
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onBack} className="border-amber-700 text-amber-700">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onComplete} className="bg-amber-700 hover:bg-amber-800">
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Payment Form Component
function PaymentForm({
  paymentMethod,
  onPaymentMethodChange,
  onBack,
  customerInfo,
  locationInfo,
  total,
  handlePaymentSuccess,
  handlePaymentFailure,
}: {
  paymentMethod: string
  onPaymentMethodChange: (value: string) => void
  onBack: () => void
  customerInfo: CustomerInfo
  locationInfo: LocationInfo
  total: number
  handlePaymentSuccess: (paymentId: string, orderId: string) => void
  handlePaymentFailure: (error: any) => void
}) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="font-medium mb-3">Have a coupon code?</h3>
        <CouponInput />
      </div>

      <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-3">
        <div
          className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-amber-100 cursor-pointer"
          onClick={() => onPaymentMethodChange("razorpay")}
        >
          <RadioGroupItem value="razorpay" id="razorpay" />
          <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
            <div className="font-medium">Pay with Razorpay</div>
            <div className="text-sm text-gray-600">Pay securely with credit/debit card, UPI, or net banking</div>
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
      </RadioGroup>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack} className="border-amber-700 text-amber-700">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

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
      </div>
    </div>
  )
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      <p className="ml-3 text-amber-700">Loading your cart...</p>
    </div>
  )
}

// Empty Cart Component
function EmptyCart() {
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

// Main Checkout Component
export default function CheckoutPageClient() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, subtotal, deliveryFee, total, clearCart, updateSubscription, orderId, updateDeliveryFee } = useCart()
  const [expandedSection, setExpandedSection] = useState<CheckoutStep>(STEPS.CONTACT)
  const [completedSections, setCompletedSections] = useState<CheckoutStep[]>([])
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [upsellProducts, setUpsellProducts] = useState<any[]>([])
  const [hasSubscription, setHasSubscription] = useState(false)
  const [mealType, setMealType] = useState("")
  const { trackCheckoutStep, updateOrderStatus, updateOrder, identifyUser } = useTracking()
  const isMobile = useMobile()

  // Cart loading states
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false)
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [localStorageItems, setLocalStorageItems] = useState<CartItem[]>([])

  // Refs for scrolling to sections
  const sectionRefs = {
    [STEPS.CONTACT]: useRef<HTMLDivElement>(null),
    [STEPS.LOCATION]: useRef<HTMLDivElement>(null),
    [STEPS.PAYMENT]: useRef<HTMLDivElement>(null),
  }

  // Customer information state
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    notes: "",
    zipcode: "",
  })

  // Zipcode validation state
  const [zipcodeValidation, setZipcodeValidation] = useState<{ valid: boolean; message: string } | null>(null)

  // Location info state
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    address: "",
    lat: 0,
    lng: 0,
    mapUrl: "",
  })

  // Delivery date state
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(() => {
    if (typeof window !== "undefined") {
      const savedDate = localStorage.getItem("annapurna-delivery-date")
      return savedDate ? new Date(savedDate) : null
    }
    return null
  })

  // Coupon context
  const couponContext = useCoupon()
  const { appliedCoupon } = useCoupon()

  // Load cart from localStorage
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = localStorage.getItem("annapurna-cart")
        if (!savedCart) return

        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          setLocalStorageItems(parsedCart)
          if (parsedCart.length > 0) {
            setHasLoadedFromStorage(true)
          }
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error)
      }
    }

    loadCartFromStorage()
  }, [])

  // Load customer info from localStorage
  useEffect(() => {
    const loadCustomerInfo = () => {
      try {
        // Load customer info
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

        // Load location info
        const savedLocationInfo = localStorage.getItem("annapurna-location-info")
        if (savedLocationInfo) {
          setLocationInfo(JSON.parse(savedLocationInfo))
        }

        // Load voice note flag
        const savedVoiceNote = sessionStorage.getItem("annapurna-voice-note")
        if (savedVoiceNote === "true") {
          setCustomerInfo((prev) => ({
            ...prev,
            hasVoiceNote: true,
          }))
        }
      } catch (error) {
        console.error("Failed to load saved customer info:", error)
      }
    }

    loadCustomerInfo()
  }, [])

  // Track checkout started
  useEffect(() => {
    if (orderId) {
      updateOrderStatus(orderId, "checkout_started")
      trackCheckoutStep(0, orderId, { items, total })
    }
  }, [orderId, items, total, trackCheckoutStep, updateOrderStatus])

  // Handle cart redirect logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoadingCart) {
        setIsLoadingCart(false)
        return
      }

      const hasItemsInContext = items.length > 0
      const hasItemsInStorage = localStorageItems.length > 0

      if (!hasItemsInContext && !hasItemsInStorage && hasLoadedFromStorage) {
        setShouldRedirect(true)
      } else {
        setIsLoadingCart(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [items, localStorageItems, hasLoadedFromStorage, isLoadingCart])

  // Handle redirect
  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = "/cart"
    }
  }, [shouldRedirect])

  // Determine meal type and subscription status
  useEffect(() => {
    const itemsToUse = items.length > 0 ? items : localStorageItems
    if (itemsToUse.length === 0) return

    // Check for subscription items
    const hasSubscriptionItem = itemsToUse.some(
      (item) => item.subscriptionOption && item.subscriptionOption !== "one-time",
    )
    setHasSubscription(hasSubscriptionItem)

    // Determine meal type
    const brunchItem = itemsToUse.find((item) => item.product?.id === "brunch")
    const dinnerItem = itemsToUse.find((item) => item.product?.id === "dinner")

    if (brunchItem) {
      setMealType("brunch")
    } else if (dinnerItem) {
      setMealType("dinner")
    }

    // Get upsell products
    const type = brunchItem ? "brunch" : "dinner"
    setUpsellProducts(getUpsellProducts(hasSubscriptionItem, type))
  }, [items, localStorageItems])

  // Store cart items in session storage
  useEffect(() => {
    const itemsToUse = items.length > 0 ? items : localStorageItems
    if (itemsToUse.length > 0) {
      sessionStorage.setItem("cartItems", JSON.stringify(itemsToUse))
    }
  }, [items, localStorageItems])

  // Store location info
  useEffect(() => {
    if (locationInfo.address) {
      sessionStorage.setItem("locationInfo", JSON.stringify(locationInfo))
      localStorage.setItem("annapurna-location-info", JSON.stringify(locationInfo))
    }
  }, [locationInfo])

  // Store delivery date
  useEffect(() => {
    if (deliveryDate) {
      localStorage.setItem("annapurna-delivery-date", deliveryDate.toISOString())
      sessionStorage.setItem("selectedDeliveryDate", deliveryDate.toISOString())
    }
  }, [deliveryDate])

  // Scroll to expanded section
  useEffect(() => {
    if (isMobile && sectionRefs[expandedSection]?.current) {
      setTimeout(() => {
        sectionRefs[expandedSection]?.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }, [expandedSection, isMobile])

  // Sync subscription durations
  useEffect(() => {
    const itemsToUse = items.length > 0 ? items : localStorageItems
    if (itemsToUse.length === 0 || !updateSubscription) return

    const mealSub = itemsToUse.find(
      (item) =>
        (item.product?.id === "brunch" || item.product?.id === "dinner") &&
        item.subscriptionOption &&
        item.subscriptionOption !== "one-time",
    )

    const sweetsSub = itemsToUse.find(
      (item) =>
        item.product?.id === "sweets-subscription" && item.subscriptionOption && item.subscriptionOption !== "one-time",
    )

    if (
      mealSub &&
      sweetsSub &&
      (mealSub.subscriptionOption !== sweetsSub.subscriptionOption ||
        mealSub.subscriptionDays !== sweetsSub.subscriptionDays)
    ) {
      updateSubscription(
        "sweets-subscription",
        mealSub.subscriptionOption || "monthly-1",
        mealSub.subscriptionDays || 30,
      )
    }
  }, [items, localStorageItems, updateSubscription])

  // Reset payment method for subscription orders
  useEffect(() => {
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

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target
      setCustomerInfo((prev) => {
        const updated = { ...prev, [id]: value }
        localStorage.setItem("annapurna-customer-info", JSON.stringify(updated))
        return updated
      })

      // Update delivery fee when zipcode changes
      if (id === "zipcode" && value.length === 6) {
        const validationResult = updateDeliveryFee(value)
        setZipcodeValidation(validationResult)
      }
    },
    [updateDeliveryFee],
  )

  // Handle location selection
  const handleLocationSelect = useCallback((location: LocationInfo) => {
    setLocationInfo(location)
    localStorage.setItem("annapurna-location-info", JSON.stringify(location))
  }, [])

  // Toggle section expansion
  const toggleSection = useCallback(
    (section: CheckoutStep) => {
      if (expandedSection === section) return

      if (!completedSections.includes(section) && section !== expandedSection + 1 && section !== 0) {
        toast({
          title: "Complete previous sections first",
          description: "Please complete the previous sections before proceeding.",
          variant: "destructive",
        })
        return
      }

      setExpandedSection(section)
    },
    [expandedSection, completedSections, toast],
  )

  // Validate contact section
  const validateContactSection = useCallback(() => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email || !customerInfo.zipcode) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerInfo.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return false
    }

    // Validate zipcode format
    if (!/^\d{6}$/.test(customerInfo.zipcode)) {
      toast({
        title: "Invalid pincode",
        description: "Please enter a valid 6-digit pincode.",
        variant: "destructive",
      })
      return false
    }

    // Check if delivery is available
    const validationResult = updateDeliveryFee(customerInfo.zipcode)
    if (!validationResult.valid) {
      toast({
        title: "Delivery not available",
        description: validationResult.message,
        variant: "destructive",
      })
      return false
    }

    return true
  }, [customerInfo, toast, updateDeliveryFee])

  // Validate location section
  const validateLocationSection = useCallback(() => {
    if (!locationInfo.address) {
      toast({
        title: "Missing location",
        description: "Please select a delivery location on the map.",
        variant: "destructive",
      })
      return false
    }

    if (!deliveryDate) {
      toast({
        title: "Missing delivery date",
        description: "Please select a delivery date.",
        variant: "destructive",
      })
      return false
    }

    return true
  }, [locationInfo, deliveryDate, toast])

  // Complete contact section
  const completeContactSection = useCallback(() => {
    if (!validateContactSection()) return

    // Identify user
    identifyUser({
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
    })

    // Update order
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

    // Mark section as completed
    setCompletedSections((prev) => [...prev.filter((s) => s !== STEPS.CONTACT), STEPS.CONTACT])

    // Move to next section
    setExpandedSection(STEPS.LOCATION)
  }, [
    validateContactSection,
    identifyUser,
    customerInfo,
    orderId,
    updateOrder,
    trackCheckoutStep,
    setCompletedSections,
    setExpandedSection,
  ])

  // Complete location section
  const completeLocationSection = useCallback(() => {
    if (!validateLocationSection()) return

    // Update order
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

    // Mark section as completed
    setCompletedSections((prev) => [...prev.filter((s) => s !== STEPS.LOCATION), STEPS.LOCATION])

    // Move to next section
    setExpandedSection(STEPS.PAYMENT)
  }, [
    validateLocationSection,
    orderId,
    updateOrder,
    locationInfo,
    customerInfo.voiceNote,
    deliveryDate,
    trackCheckoutStep,
  ])

  // Handle payment method change
  const handlePaymentMethodChange = useCallback(
    (value: string) => {
      setPaymentMethod(value)
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
    },
    [orderId, updateOrder, trackCheckoutStep],
  )

  // Handle voice note recording
  const handleVoiceNoteComplete = useCallback((audioBlob: Blob) => {
    setCustomerInfo((prev) => ({
      ...prev,
      voiceNote: audioBlob,
    }))
    sessionStorage.setItem("annapurna-voice-note", "true")
  }, [])

  // Handle voice note clearing
  const handleVoiceNoteClear = useCallback(() => {
    setCustomerInfo((prev) => ({
      ...prev,
      voiceNote: undefined,
    }))
    sessionStorage.removeItem("annapurna-voice-note")
  }, [])

  // Handle payment success
  const handlePaymentSuccess = useCallback(
    (paymentId: string, orderId: string) => {
      // Use either context items or localStorage items
      const itemsToDisplay = items.length > 0 ? items : localStorageItems

      if (orderId) {
        updateOrderStatus(orderId, "payment_completed")
        updateOrder(orderId, {
          transactionId: paymentId,
          amount: total,
        })

        // Store order completion info in localStorage for debugging
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("last_order_id", orderId)
            localStorage.setItem("last_payment_id", paymentId)
          } catch (e) {
            // Ignore storage errors
          }
        }
      }

      // Store payment details in session storage
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

      // Store complete order data
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

      // Save order data
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
    },
    [
      items,
      localStorageItems,
      updateOrderStatus,
      updateOrder,
      total,
      customerInfo,
      locationInfo,
      deliveryDate,
      paymentMethod,
      appliedCoupon,
      couponContext.appliedCoupon,
      clearCart,
      toast,
      router,
    ],
  )

  // Handle payment failure
  const handlePaymentFailure = useCallback(
    (error: any) => {
      console.error("Payment failed:", error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    },
    [toast],
  )

  // If still loading, show spinner
  if (isLoadingCart) {
    return <LoadingSpinner />
  }

  // Use either context items or localStorage items
  const itemsToDisplay = items.length > 0 ? items : localStorageItems

  // If cart is empty, show empty cart message
  if (itemsToDisplay.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-amber-800 mb-8">Checkout</h1>

      {/* Mobile Accordion Checkout */}
      <div className="md:hidden">
        <div className="rounded-lg overflow-hidden border border-gray-200 mb-6">
          {/* Contact Section */}
          <div className="border-b">
            <SectionHeader
              step={STEPS.CONTACT}
              title="Contact"
              icon={<User className="h-5 w-5" />}
              isCompleted={completedSections.includes(STEPS.CONTACT)}
              isExpanded={expandedSection === STEPS.CONTACT}
              onClick={() => toggleSection(STEPS.CONTACT)}
              sectionRef={sectionRefs[STEPS.CONTACT]}
            />
            <AnimatePresence>
              {expandedSection === STEPS.CONTACT && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 pt-0">
                    <ContactForm
                      customerInfo={customerInfo}
                      zipcodeValidation={zipcodeValidation}
                      handleInputChange={handleInputChange}
                      onComplete={completeContactSection}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Location Section */}
          <div className="border-b">
            <SectionHeader
              step={STEPS.LOCATION}
              title="Location"
              icon={<MapPin className="h-5 w-5" />}
              isCompleted={completedSections.includes(STEPS.LOCATION)}
              isExpanded={expandedSection === STEPS.LOCATION}
              onClick={() => toggleSection(STEPS.LOCATION)}
              sectionRef={sectionRefs[STEPS.LOCATION]}
            />
            <AnimatePresence>
              {expandedSection === STEPS.LOCATION && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 pt-0">
                    <LocationForm
                      locationInfo={locationInfo}
                      customerInfo={customerInfo}
                      deliveryDate={deliveryDate}
                      mealType={mealType}
                      hasSubscription={hasSubscription}
                      onLocationSelect={handleLocationSelect}
                      onVoiceNoteComplete={handleVoiceNoteComplete}
                      onVoiceNoteClear={handleVoiceNoteClear}
                      onDateSelected={setDeliveryDate}
                      onBack={() => toggleSection(STEPS.CONTACT)}
                      onComplete={completeLocationSection}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment Section */}
          <div>
            <SectionHeader
              step={STEPS.PAYMENT}
              title="Payment"
              icon={<CreditCard className="h-5 w-5" />}
              isCompleted={completedSections.includes(STEPS.PAYMENT)}
              isExpanded={expandedSection === STEPS.PAYMENT}
              onClick={() => toggleSection(STEPS.PAYMENT)}
              sectionRef={sectionRefs[STEPS.PAYMENT]}
            />
            <AnimatePresence>
              {expandedSection === STEPS.PAYMENT && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 pt-0">
                    <PaymentForm
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={handlePaymentMethodChange}
                      onBack={() => toggleSection(STEPS.LOCATION)}
                      customerInfo={customerInfo}
                      locationInfo={locationInfo}
                      total={total}
                      handlePaymentSuccess={handlePaymentSuccess}
                      handlePaymentFailure={handlePaymentFailure}
                    />

                    {/* Upsell/Order Bumps Section */}
                    {hasSubscription && <SweetsSubscriptionUpsell />}

                    {/* Show regular upsells for all customers */}
                    {upsellProducts.length > 0 && (
                      <OrderBumps
                        products={upsellProducts}
                        title="Enhance Your Order"
                        description="Add these complementary items to your order with just one click!"
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Order Summary for Mobile */}
        <OrderSummary />
      </div>

      {/* Desktop Checkout */}
      <div className="hidden md:block">
        {/* Checkout Progress */}
        <div className="mb-8">
          <div className="flex justify-between">
            {Object.values(STEPS)
              .filter((step): step is number => typeof step === "number")
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
                    <ContactForm
                      customerInfo={customerInfo}
                      zipcodeValidation={zipcodeValidation}
                      handleInputChange={handleInputChange}
                      onComplete={completeContactSection}
                    />
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
                        onRecordingComplete={handleVoiceNoteComplete}
                        onRecordingClear={handleVoiceNoteClear}
                        existingRecording={customerInfo.voiceNote}
                      />
                      <div className="mt-6">
                        <Label>Delivery Date</Label>
                        <DeliveryDateSelector
                          mealType={mealType === "brunch" ? "brunch" : "dinner"}
                          isSubscription={hasSubscription}
                          onDateSelected={setDeliveryDate}
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
                    <PaymentForm
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={handlePaymentMethodChange}
                      onBack={() => toggleSection(STEPS.LOCATION)}
                      customerInfo={customerInfo}
                      locationInfo={locationInfo}
                      total={total}
                      handlePaymentSuccess={handlePaymentSuccess}
                      handlePaymentFailure={handlePaymentFailure}
                    />
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
                <Button
                  onClick={expandedSection === STEPS.CONTACT ? completeContactSection : completeLocationSection}
                  className="bg-amber-700 hover:bg-amber-800"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
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
