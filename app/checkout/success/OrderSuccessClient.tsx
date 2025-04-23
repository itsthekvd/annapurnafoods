"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  MapPin,
  Copy,
  Share2,
  Calendar,
  Clock,
  ShoppingBag,
  Truck,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  PhoneIcon as WhatsApp,
} from "lucide-react"
import { useTracking } from "@/contexts/tracking-context"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Confetti from "react-confetti"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format, addDays } from "date-fns"
import OrderStorage from "@/lib/order-storage"
import WebhookService from "@/lib/webhook-service"
import { ORDER_STATUS } from "@/lib/types"

interface PaymentDetails {
  paymentId?: string
  orderId?: string
  amount?: number
  date?: string
  gateway?: string
}

interface OrderDetails {
  customerInfo: {
    name: string
    email: string
    phone: string
    notes: string
    voiceNote?: any
    zipcode?: string
  }
  locationInfo: {
    address: string
    lat: number
    lng: number
    mapUrl?: string
  }
  items: any[]
  total: number
  deliveryDate?: string
}

export default function OrderSuccessClient() {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [activeTab, setActiveTab] = useState("details")
  const [socialShareText, setSocialShareText] = useState("")
  const { trackEvent } = useTracking()
  const { toast } = useToast()
  const orderIdRef = useRef<HTMLSpanElement>(null)
  const paymentIdRef = useRef<HTMLSpanElement>(null)
  const router = useRouter()

  // Redirect if no order details are available
  useEffect(() => {
    const hasOrderDetails = sessionStorage.getItem("orderDetails")
    const hasPaymentDetails = sessionStorage.getItem("paymentDetails")

    if (!hasOrderDetails && !hasPaymentDetails) {
      router.push("/")
    }
  }, [router])

  // Set window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Initialize window size
    if (typeof window !== "undefined") {
      handleResize()
      window.addEventListener("resize", handleResize)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Find the useEffect that saves the order to Supabase and update it to include all fields
  useEffect(() => {
    // Check if we have order details
    const hasOrderDetails = sessionStorage.getItem("orderDetails")
    const hasPaymentDetails = sessionStorage.getItem("paymentDetails")

    // If no order details, redirect to home after a short delay
    if (!hasOrderDetails && !hasPaymentDetails) {
      setTimeout(() => {
        window.location.href = "/"
      }, 500)
      return
    }

    // Get payment details from session storage
    const storedPaymentDetails = sessionStorage.getItem("paymentDetails")
    if (storedPaymentDetails) {
      try {
        const details = JSON.parse(storedPaymentDetails)
        setPaymentDetails(details)
      } catch (error) {
        console.error("Failed to parse payment details", error)
      }
    }

    // Get order details from session storage
    const storedOrderDetails = sessionStorage.getItem("orderDetails")
    const storedPaymentDetails2 = sessionStorage.getItem("paymentDetails")

    if (storedOrderDetails && storedPaymentDetails2) {
      try {
        const orderDetails = JSON.parse(storedOrderDetails)
        const paymentDetails = JSON.parse(storedPaymentDetails2)

        // Determine meal type and plan type from items
        let mealType = ""
        let planType = ""
        let deliveryFrequency = ""
        let mealQuantity = 0

        // Extract meal information from items
        orderDetails.items.forEach((item) => {
          // Count total meal quantity
          mealQuantity += item.quantity || 1

          // Determine meal type (brunch or dinner)
          if (item.product.id === "brunch") {
            mealType = "Brunch"
          } else if (item.product.id === "dinner") {
            mealType = "Dinner"
          }

          // Determine plan type and delivery frequency
          if (item.subscriptionOption && item.subscriptionOption !== "one-time") {
            planType = item.subscriptionOption

            // Set delivery frequency based on subscription option
            switch (item.subscriptionOption) {
              case "weekends":
                deliveryFrequency = "Weekends Only"
                break
              case "sundays":
                deliveryFrequency = "Sundays Only"
                break
              case "monthly-1":
                deliveryFrequency = "Daily - 1 Month"
                break
              case "monthly-3":
                deliveryFrequency = "Daily - 3 Months"
                break
              case "monthly-6":
                deliveryFrequency = "Daily - 6 Months"
                break
              case "monthly-12":
                deliveryFrequency = "Daily - 12 Months"
                break
              default:
                deliveryFrequency = "Custom"
            }
          } else {
            planType = "One-time"
            deliveryFrequency = "One-time"
          }
        })

        // Create a complete order record and save it to Supabase
        const completeOrderData = {
          id: paymentDetails.orderId,
          createdAt: paymentDetails.date || new Date().toISOString(),
          status: ORDER_STATUS.PAID_PENDING, // Set initial status to paid & pending
          customerInfo: {
            name: orderDetails.customerInfo?.name || "",
            email: orderDetails.customerInfo?.email || "",
            phone: orderDetails.customerInfo?.phone || "",
            notes: orderDetails.customerInfo?.notes || "",
            zipcode: orderDetails.customerInfo?.zipcode || "",
            hasVoiceNote: !!orderDetails.customerInfo?.voiceNote,
          },
          locationInfo: orderDetails.locationInfo || {
            address: "",
            lat: 0,
            lng: 0,
          },
          paymentInfo: {
            method: paymentDetails.gateway || "Online Payment",
            transactionId: paymentDetails.paymentId,
            amount: paymentDetails.amount || 0,
          },
          items: (orderDetails.items || []).map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity || 1,
            price: item.product.price,
            subscriptionOption: item.subscriptionOption,
            subscriptionDays: item.subscriptionDays,
          })),
          deliveryDate: orderDetails.deliveryDate,
          total: paymentDetails.amount || 0,
          mealType,
          planType,
          mealQuantity,
          deliveryFrequency,
          couponCode: orderDetails.couponCode,
        }

        // Save to Supabase
        OrderStorage.saveOrder(completeOrderData)
          .then(() => console.log("Order saved to Supabase from success page"))
          .catch((error) => console.error("Failed to save order to Supabase from success page", error))

        try {
          WebhookService.sendToAutonami(completeOrderData)
            .then((success) => {
              if (success) {
                console.log("Order data sent to webhook from success page")
              } else {
                console.warn("Failed to send order data to webhook from success page")
              }
            })
            .catch((error) => {
              console.error("Error sending order data to webhook from success page:", error)
            })
        } catch (e) {
          console.error("Error initiating webhook call from success page:", e)
        }
      } catch (error) {
        console.error("Failed to save order from success page", error)
      }
    }

    if (storedOrderDetails) {
      try {
        const details = JSON.parse(storedOrderDetails)
        setOrderDetails(details)

        // Create social share text based on order details
        if (details && details.items) {
          const itemNames = details.items.map((item) => item.product.name).join(", ")
          const shareText = `I just ordered ${itemNames} from Annapurna Foods! Delicious Sattvik food delivered right to my doorstep. Try it out! #AnnapurnaFoods #SattvikFood`
          setSocialShareText(shareText)
        }
      } catch (error) {
        console.error("Failed to parse order details", error)
      }
    }
  }, [])

  // Copy to clipboard function
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: `${type} copied!`,
          description: `${type} has been copied to clipboard.`,
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        })
      },
    )
  }

  // Generate estimated delivery time
  const getEstimatedDelivery = () => {
    if (!orderDetails?.deliveryDate) {
      const tomorrow = addDays(new Date(), 1)
      return format(tomorrow, "EEEE, MMMM d, yyyy 'at' h:mm a")
    }

    return new Date(orderDetails.deliveryDate).toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  // Social sharing functions
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(socialShareText)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, "_blank")
  }

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(socialShareText)
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank")
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${socialShareText} ${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(socialShareText)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, "_blank")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
          colors={["#f59e0b", "#d97706", "#92400e", "#78350f", "#fbbf24"]}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-20 w-20 text-green-500" />
            </motion.div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-amber-800 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Thank you for your order, {orderDetails?.customerInfo.name || "valued customer"}! We have received your
            order and will send you a confirmation on WhatsApp shortly.
          </p>
        </motion.div>

        <Tabs defaultValue="details" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="share">Share & Save</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Order Summary Card */}
            <Card>
              <CardHeader className="bg-amber-50 border-b border-amber-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-amber-800">Order Summary</CardTitle>
                  {paymentDetails?.orderId && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Order ID:</span>
                      <span className="font-mono text-sm font-medium" ref={orderIdRef}>
                        {paymentDetails.orderId}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(paymentDetails.orderId || "", "Order ID")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <ShoppingBag className="mr-2 h-5 w-5 text-amber-700" />
                      Items Ordered
                    </h3>
                    <div className="space-y-4">
                      {orderDetails?.items.map((item, index) => (
                        <div key={index} className="flex items-center border-b pb-4">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden mr-4">
                            <Image
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-600">
                                {item.subscriptionOption ? (
                                  <Badge variant="outline" className="bg-amber-50">
                                    {item.subscriptionOption} Subscription
                                  </Badge>
                                ) : (
                                  <span>Quantity: {item.quantity}</span>
                                )}
                              </div>
                              <div className="font-medium">₹{item.product.price.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details */}
                  {paymentDetails && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium">{paymentDetails.gateway || "Online Payment"}</span>
                        </div>
                        {paymentDetails.paymentId && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Transaction ID:</span>
                            <div className="flex items-center">
                              <span className="font-mono text-sm font-medium mr-2" ref={paymentIdRef}>
                                {paymentDetails.paymentId}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(paymentDetails.paymentId || "", "Transaction ID")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium">₹{paymentDetails.amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">
                            {paymentDetails.date && new Date(paymentDetails.date).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Information */}
                  {orderDetails && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-amber-700" />
                        Delivery Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <span className="font-medium block">Delivery Address:</span>
                          <span className="text-gray-700">{orderDetails.locationInfo.address}</span>
                        </div>

                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-amber-700 mr-2 mt-0.5" />
                          <div>
                            <span className="font-medium block">Delivery Date:</span>
                            <span className="text-gray-700">{getEstimatedDelivery()}</span>
                          </div>
                        </div>

                        {(orderDetails.customerInfo.notes || orderDetails.customerInfo.voiceNote) && (
                          <div>
                            <span className="font-medium block">Delivery Instructions:</span>
                            {orderDetails.customerInfo.notes && (
                              <p className="text-gray-700">{orderDetails.customerInfo.notes}</p>
                            )}
                            {orderDetails.customerInfo.voiceNote && (
                              <p className="text-green-600 flex items-center mt-1">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Voice note included with your order
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking">
            <Card>
              <CardHeader className="bg-amber-50 border-b border-amber-100">
                <CardTitle className="text-amber-800">Order Tracking</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

                  <div className="relative z-10 flex items-start mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mr-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Order Received</h3>
                      <p className="text-sm text-gray-500">{new Date().toLocaleString()}</p>
                      <p className="text-gray-600 mt-2">
                        Your order has been received and is waiting for confirmation.
                      </p>
                      <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200">Paid & Pending</Badge>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-start mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mr-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Order Confirmed</h3>
                      <p className="text-sm text-gray-500">Upcoming</p>
                      <p className="text-gray-600 mt-2">We'll confirm your order soon and start preparing it.</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-start mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mr-4">
                      <Clock className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Preparing Your Order</h3>
                      <p className="text-sm text-gray-500">Upcoming</p>
                      <p className="text-gray-600 mt-2">
                        Our chefs will prepare your delicious Sattvik meal with love and care.
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-start mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mr-4">
                      <Truck className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Out for Delivery</h3>
                      <p className="text-sm text-gray-500">Estimated: {getEstimatedDelivery()}</p>
                      <p className="text-gray-600 mt-2">
                        Your order will be delivered to your doorstep at the scheduled time.
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-start">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mr-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Delivered</h3>
                      <p className="text-sm text-gray-500">Upcoming</p>
                      <p className="text-gray-600 mt-2">Enjoy your meal! Don't forget to track your next order.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Track Your Order</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    You can track your order status anytime by visiting the order tracking page and entering your order
                    ID or WhatsApp number.
                  </p>
                  <Link href="/order-tracking">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Order Tracking</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share">
            <Card>
              <CardHeader className="bg-amber-50 border-b border-amber-100">
                <CardTitle className="text-amber-800">Share Your Experience</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Share your order with friends</h3>
                    <p className="text-gray-600 mb-4">{socialShareText}</p>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={shareOnWhatsApp} className="bg-green-500 hover:bg-green-600">
                        <WhatsApp className="h-5 w-5 mr-2" /> WhatsApp
                      </Button>
                      <Button onClick={shareOnFacebook} className="bg-blue-600 hover:bg-blue-700">
                        <Facebook className="h-5 w-5 mr-2" /> Facebook
                      </Button>
                      <Button onClick={shareOnTwitter} className="bg-blue-400 hover:bg-blue-500">
                        <Twitter className="h-5 w-5 mr-2" /> Twitter
                      </Button>
                      <Button onClick={shareOnLinkedIn} className="bg-blue-700 hover:bg-blue-800">
                        <Linkedin className="h-5 w-5 mr-2" /> LinkedIn
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-3">Special Offers</h3>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                      <h4 className="font-semibold text-amber-800">Get 10% off your next order!</h4>
                      <p className="text-amber-700 text-sm mb-3">
                        Share your experience with us on social media and tag @AnnapurnaFoods to receive a special
                        discount code.
                      </p>
                      <Button variant="outline" className="border-amber-700 text-amber-700">
                        <Share2 className="h-4 w-4 mr-2" /> Share and Get Discount
                      </Button>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">Refer a Friend</h4>
                      <p className="text-green-700 text-sm mb-3">
                        Invite your friends to try Annapurna Foods and both of you will get ₹100 off your next order!
                      </p>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <ArrowRight className="h-4 w-4 mr-2" /> Refer Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <Link href="/order-tracking">
            <Button className="w-full bg-amber-700 hover:bg-amber-800">Track Your Order</Button>
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/menu">
              <Button variant="outline" className="w-full border-amber-700 text-amber-700 hover:bg-amber-50">
                Order More
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-800">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
