"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import OrderStorage from "@/lib/order-storage"
import WebhookService from "@/lib/webhook-service"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ORDER_STATUS } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function PhonePeCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "failure">("loading")
  const [message, setMessage] = useState("Verifying your payment...")
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Try to get coupon code from session storage
    try {
      const storedCouponInfo = sessionStorage.getItem("appliedCoupon")
      if (storedCouponInfo) {
        const parsedCoupon = JSON.parse(storedCouponInfo)
        setCouponCode(parsedCoupon.code)
      }
    } catch (e) {
      console.error("Failed to parse coupon info:", e)
    }

    // Get the status from the URL
    const searchParams = new URLSearchParams(window.location.search)
    const paymentStatus = searchParams.get("status")
    const transactionId = searchParams.get("transactionId")
    const merchantTransactionId = searchParams.get("merchantTransactionId")

    // Check if the payment was successful
    if (paymentStatus === "COMPLETED") {
      // Call the success handler
      handleSuccessfulPayment(transactionId, merchantTransactionId)
    } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      // Show error message
      toast({
        title: "Payment not completed",
        description: `Your payment was ${paymentStatus.toLowerCase()}. Please try again.`,
        variant: "destructive",
      })

      setStatus("failure")
      setMessage(`Your payment was ${paymentStatus.toLowerCase()}. Please try again.`)

      // Redirect back to checkout after a delay
      setTimeout(() => {
        router.push("/checkout")
      }, 3000)
    } else {
      // Handle other statuses
      toast({
        title: "Payment status",
        description: `Your payment is ${paymentStatus?.toLowerCase() || "pending"}. Please contact support if you need assistance.`,
      })

      setStatus("loading")
      setMessage(
        `Your payment is ${paymentStatus?.toLowerCase() || "pending"}. Please contact support if you need assistance.`,
      )

      setTimeout(() => {
        router.push("/checkout")
      }, 5000)
    }
  }, [])

  const handleSuccessfulPayment = async (txnId: string | null, merchantTransactionId: string | null) => {
    try {
      // Get transaction ID from URL query parameters
      // const urlParams = new URLSearchParams(window.location.search)
      // const txnId = urlParams.get("txnId")

      console.log("PhonePe callback received with txnId:", txnId, "merchantTransactionId", merchantTransactionId)

      // Get stored transaction details
      const storedTransaction = sessionStorage.getItem("phonePeTransaction")
      if (!storedTransaction) {
        console.log("No stored transaction found, redirecting to success page anyway")
        // Even if we don't have stored details, redirect to success
        setStatus("success")
        setTimeout(() => {
          window.location.href = "/checkout/success"
        }, 2000)
        return
      }

      const transaction = JSON.parse(storedTransaction)
      const { amount, customerInfo, orderId } = transaction

      // Generate payment ID
      const paymentId = `phonepe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

      // Generate a unique order ID if one doesn't exist
      const finalOrderId = orderId || txnId || `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

      // Get location info and cart items from session storage
      let locationInfo = {}
      try {
        locationInfo = JSON.parse(sessionStorage.getItem("locationInfo") || "{}")
      } catch (e) {
        console.error("Failed to parse location info:", e)
      }

      let cartItems = []
      try {
        cartItems = JSON.parse(sessionStorage.getItem("cartItems") || "[]")
      } catch (e) {
        console.error("Failed to parse cart items:", e)
      }

      const deliveryDate = sessionStorage.getItem("selectedDeliveryDate")

      // Store payment details for success page
      sessionStorage.setItem(
        "paymentDetails",
        JSON.stringify({
          paymentId,
          orderId: finalOrderId,
          amount,
          date: new Date().toISOString(),
          gateway: "PhonePe",
        }),
      )

      // Store order details
      sessionStorage.setItem(
        "orderDetails",
        JSON.stringify({
          customerInfo,
          locationInfo,
          items: cartItems,
          total: amount,
          deliveryDate,
        }),
      )

      // Store complete order data in Supabase
      const completeOrderData = {
        id: finalOrderId,
        createdAt: new Date().toISOString(),
        status: ORDER_STATUS.PAID_PENDING,
        customerInfo: {
          name: customerInfo?.name || "Customer",
          email: customerInfo?.email || "",
          phone: customerInfo?.phone || "",
          notes: "",
          zipcode: "",
          hasVoiceNote: false,
        },
        locationInfo,
        paymentInfo: {
          method: "PhonePe",
          transactionId: paymentId,
          amount: amount || 0,
        },
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity || 1,
          price: item.product.price,
          subscriptionOption: item.subscriptionOption,
          subscriptionDays: item.subscriptionDays,
        })),
        deliveryDate: deliveryDate || undefined,
        total: amount || 0,
        couponCode: couponCode || undefined,
      }

      try {
        // Save order data to Supabase
        await OrderStorage.saveOrder(completeOrderData)
        console.log("Order saved to Supabase:", finalOrderId)

        // Send order data to webhook
        WebhookService.sendToAutonami(completeOrderData)
          .then((success) => {
            if (success) {
              console.log("Order data sent to webhook successfully")
            }
          })
          .catch((error) => {
            console.error("Error sending order data to webhook:", error)
          })
      } catch (error) {
        console.error("Error saving order data:", error)
      }

      // Clear cart and transaction details
      try {
        localStorage.removeItem("annapurna-cart")
        sessionStorage.removeItem("phonePeTransaction")
        sessionStorage.removeItem("locationInfo")
        sessionStorage.removeItem("cartItems")
      } catch (error) {
        console.error("Error clearing storage:", error)
      }

      setStatus("success")
      setMessage("Payment successful! Redirecting to order confirmation...")

      // Redirect to success page
      setTimeout(() => {
        window.location.href = "/checkout/success"
      }, 2000)
    } catch (error) {
      console.error("Error processing PhonePe callback:", error)
      setStatus("failure")
      setMessage("An error occurred while processing your payment")

      // Even if there's an error, redirect to success page after a delay
      // This ensures users don't get stuck
      setTimeout(() => {
        window.location.href = "/checkout/success"
      }, 3000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-700" />
            <h1 className="text-2xl font-bold text-amber-800 mb-2">Processing Your Payment</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Redirecting you to the order confirmation page...</p>
          </>
        )}

        {status === "failure" && (
          <>
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-red-700 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <Button onClick={() => (window.location.href = "/checkout")} className="bg-amber-700 hover:bg-amber-800">
              Return to Checkout
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
