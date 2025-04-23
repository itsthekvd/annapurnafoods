"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Clock, Truck, MapPin, Package, ChefHat } from "lucide-react"
import Image from "next/image"
import OrderStorage from "@/lib/order-storage"
import { useToast } from "@/hooks/use-toast"
import { ORDER_STATUS } from "@/lib/types"

export default function OrderTrackingClientPage() {
  const [orderId, setOrderId] = useState("")
  const [isTracking, setIsTracking] = useState(false)
  const [orderFound, setOrderFound] = useState(false)
  const { toast } = useToast()
  const [orderDetails, setOrderDetails] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTracking(true)
    setOrderFound(false)

    // Get the input value (could be order ID or WhatsApp number)
    const searchValue = orderId.trim()

    if (!searchValue) {
      toast({
        title: "Error",
        description: "Please enter an order ID or WhatsApp number",
        variant: "destructive",
      })
      setIsTracking(false)
      return
    }

    try {
      // Get all orders from Supabase
      const allOrders = await OrderStorage.getAllOrders()

      let foundOrder

      // First try to find by exact order ID
      foundOrder = allOrders.find((order) => order.id === searchValue)

      // If not found and input looks like a phone number, search by phone number
      if (!foundOrder && /^\d{10}$/.test(searchValue.replace(/\D/g, ""))) {
        const phoneNumber = searchValue.replace(/\D/g, "")

        // Find the most recent order with this phone number
        foundOrder = allOrders
          .filter((order) => order.customerInfo?.phone?.replace(/\D/g, "") === phoneNumber)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      }

      if (foundOrder) {
        // Format the order data for display
        const formattedOrder = {
          id: foundOrder.id,
          date: new Date(foundOrder.createdAt).toLocaleString(),
          status: foundOrder.status,
          paymentMethod: foundOrder.paymentInfo.method || "Online Payment",
          paymentId: foundOrder.paymentInfo.transactionId || "N/A",
          items: foundOrder.items.map((item: any) => ({
            name: item.productName,
            quantity: item.quantity || 1,
            price: item.price * (item.quantity || 1),
          })),
          address: foundOrder.locationInfo?.address || "Address not provided",
          location: foundOrder.locationInfo
            ? {
                lat: foundOrder.locationInfo.lat,
                lng: foundOrder.locationInfo.lng,
              }
            : { lat: 11.0168, lng: 76.9558 },
          contact: foundOrder.customerInfo?.phone || "Phone not provided",
          instructions: foundOrder.customerInfo?.notes || "No special instructions",
          hasVoiceNote: !!foundOrder.customerInfo?.hasVoiceNote,
          subtotal: foundOrder.items.reduce((sum: number, item: any) => sum + item.price * (item.quantity || 1), 0),
          deliveryFee: 30,
          total: foundOrder.total || 0,
          deliveryDate: foundOrder.deliveryDate,
        }

        setOrderDetails(formattedOrder)
        setOrderFound(true)
      } else {
        toast({
          title: "Order not found",
          description: "We couldn't find an order with that ID or phone number",
          variant: "destructive",
        })
        setOrderFound(false)
      }
    } catch (error) {
      console.error("Error searching for order:", error)
      toast({
        title: "Error",
        description: "There was a problem searching for your order",
        variant: "destructive",
      })
      setOrderFound(false)
    } finally {
      setIsTracking(false)
    }
  }

  // Helper function to convert status to readable format
  const getReadableStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      [ORDER_STATUS.PAID_PENDING]: "Paid & Pending",
      [ORDER_STATUS.CONFIRMED]: "Order Confirmed",
      [ORDER_STATUS.PREPARING]: "Preparing Your Food",
      [ORDER_STATUS.PACKING]: "Packing Your Order",
      [ORDER_STATUS.EN_ROUTE]: "Out for Delivery",
      [ORDER_STATUS.DELIVERED]: "Delivered",
      [ORDER_STATUS.TEST_ORDER]: "Test Order",
      cart_created: "Cart Created",
      checkout_started: "Checkout Started",
      contact_info_added: "Processing",
      location_added: "Processing",
      payment_selected: "Processing",
      payment_started: "Payment Processing",
      payment_completed: "Order Confirmed",
      order_completed: "Order Confirmed",
      completed: "Order Confirmed",
      pending: "Processing",
      cart_abandoned: "Abandoned",
      checkout_abandoned: "Abandoned",
      payment_failed: "Payment Failed",
      cancelled: "Cancelled",
    }

    return statusMap[status] || "Processing"
  }

  // Get the current step based on order status
  const getCurrentStep = (status: string): number => {
    const stepMap: Record<string, number> = {
      [ORDER_STATUS.PAID_PENDING]: 0,
      [ORDER_STATUS.CONFIRMED]: 1,
      [ORDER_STATUS.PREPARING]: 2,
      [ORDER_STATUS.PACKING]: 3,
      [ORDER_STATUS.EN_ROUTE]: 4,
      [ORDER_STATUS.DELIVERED]: 5,
      payment_completed: 1,
      order_completed: 1,
      completed: 1,
    }

    return stepMap[status] || 0
  }

  // Render the tracking timeline
  const renderTrackingTimeline = () => {
    if (!orderDetails) return null

    const currentStep = getCurrentStep(orderDetails.status)

    const steps = [
      {
        title: "Order Confirmed",
        description: "We've received your order",
        icon: <CheckCircle className="h-5 w-5" />,
        date: new Date(orderDetails.date).toLocaleString(),
      },
      {
        title: "Preparing Your Food",
        description: "Our chefs are preparing your delicious meal",
        icon: <ChefHat className="h-5 w-5" />,
        date: "In progress",
      },
      {
        title: "Packing Your Order",
        description: "Your food is being packed with care",
        icon: <Package className="h-5 w-5" />,
        date: "In progress",
      },
      {
        title: "Out for Delivery",
        description: "Your order is on its way to you",
        icon: <Truck className="h-5 w-5" />,
        date: "In progress",
      },
      {
        title: "Delivered",
        description: "Enjoy your meal!",
        icon: <CheckCircle className="h-5 w-5" />,
        date: "In progress",
      },
    ]

    return (
      <div className="relative mb-8">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

        {steps.map((step, index) => {
          // Skip the first step if we're in PAID_PENDING status
          if (index === 0 && orderDetails.status === ORDER_STATUS.PAID_PENDING) {
            return null
          }

          // Determine if this step is active, completed, or upcoming
          const isCompleted = index <= currentStep
          const isActive = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={index} className="relative z-10 flex items-center mb-6">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 ${
                  isCompleted
                    ? "bg-green-100 text-green-600"
                    : isActive
                      ? "bg-amber-100 text-amber-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {step.icon}
              </div>
              <div>
                <h3 className={`font-medium ${isUpcoming ? "text-gray-400" : ""}`}>{step.title}</h3>
                <p className="text-sm text-gray-500">
                  {isCompleted ? (index === 0 ? step.date : "Completed") : isActive ? "In progress" : "Upcoming"}
                </p>
              </div>
            </div>
          )
        })}

        {/* Special case for PAID_PENDING status */}
        {orderDetails.status === ORDER_STATUS.PAID_PENDING && (
          <div className="relative z-10 flex items-center mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Payment Received</h3>
              <p className="text-sm text-gray-500">{new Date(orderDetails.date).toLocaleString()}</p>
              <p className="text-sm text-yellow-600 mt-1">Your order is waiting for confirmation</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-amber-800 mb-8">Track Your Order</h1>

      <div className="max-w-2xl mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="order-id">Order ID or WhatsApp Number</Label>
                  <Input
                    id="order-id"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter your order ID or WhatsApp number"
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800" disabled={isTracking}>
                  {isTracking ? "Tracking..." : "Track Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {orderFound && (
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Order #{orderDetails.id}</h2>
                <p className="text-gray-600">Placed on {orderDetails.date}</p>
                <div className="mt-2 inline-block">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      orderDetails.status === ORDER_STATUS.DELIVERED
                        ? "bg-green-100 text-green-800"
                        : orderDetails.status === ORDER_STATUS.PAID_PENDING
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {getReadableStatus(orderDetails.status)}
                  </span>
                </div>
              </div>

              {renderTrackingTimeline()}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Order Details</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="items">
                    <AccordionTrigger>Items ({orderDetails.items.length})</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {orderDetails.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-medium">₹{item.price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="delivery">
                    <AccordionTrigger>Delivery Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div>
                          <div className="flex items-start mb-2">
                            <MapPin className="h-5 w-5 text-amber-700 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium">Delivery Address</p>
                              <p className="text-gray-600">{orderDetails.address}</p>
                            </div>
                          </div>

                          {/* Simple map preview */}
                          <div className="mt-2 h-40 bg-gray-100 rounded-lg relative overflow-hidden">
                            <Image
                              src={`/placeholder.svg?height=160&width=600&text=Map+Preview`}
                              alt="Map preview"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="relative">
                                <MapPin className="h-8 w-8 text-amber-700" />
                                <div className="h-3 w-3 bg-amber-700 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="font-medium">Delivery Instructions:</span>
                          <p className="text-gray-700">{orderDetails.instructions}</p>
                          {orderDetails.hasVoiceNote && (
                            <p className="text-green-600 flex items-center mt-1">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Voice note included with this order
                            </p>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payment">
                    <AccordionTrigger>Payment Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        <p>
                          <span className="font-medium">Payment Method:</span> {orderDetails.paymentMethod}
                        </p>
                        {orderDetails.paymentId && orderDetails.paymentId !== "N/A" && (
                          <p>
                            <span className="font-medium">Payment ID:</span> {orderDetails.paymentId}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Subtotal:</span> ₹{orderDetails.subtotal.toFixed(2)}
                        </p>
                        <p>
                          <span className="font-medium">Delivery Fee:</span> ₹{orderDetails.deliveryFee.toFixed(2)}
                        </p>
                        <p>
                          <span className="font-medium">Total:</span> ₹{orderDetails.total.toFixed(2)}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
