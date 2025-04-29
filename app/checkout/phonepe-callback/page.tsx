"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import OrderStorage from "@/lib/order-storage"
import WebhookService from "@/lib/webhook-service"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ORDER_STATUS } from "@/lib/types"

export default function PhonePeCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "failure">("loading")
  const [message, setMessage] = useState("Verifying your payment...")
  const [couponCode, setCouponCode] = useState<string | null>(null)

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

    // Then process the payment
    verifyPaymentStatus()
  }, [])

  const verifyPaymentStatus = async () => {
    try {
      // Get transaction ID from URL query parameters
      const urlParams = new URLSearchParams(window.location.search)
      const txnId = urlParams.get("txnId")
      const code = urlParams.get("code") // PhonePe returns status code
      const status = urlParams.get("status") // PhonePe returns status

      console.log("PhonePe callback received with:", { txnId, code, status })

      // Check if payment was canceled or failed
      if (status === "PAYMENT_CANCELLED" || status === "PAYMENT_FAILED" || code === "PAYMENT_ERROR") {
        setStatus("failure")
        setMessage(status === "PAYMENT_CANCELLED" ? "Payment was cancelled" : "Payment failed")
        return
      }

      // Get stored transaction details
      const storedTransaction = sessionStorage.getItem("phonePeTransaction")
      if (!storedTransaction) {
        console.log("No stored transaction found")
        setStatus("failure")
        setMessage("Transaction details not found")
        return
      }

      const transaction = JSON.parse(storedTransaction)
      const { amount, customerInfo, orderId } = transaction

      // Verify payment status with PhonePe API
      const verificationResponse = await fetch("/api/verify-phonepe-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchantTransactionId: txnId || orderId,
        }),
      })

      const verificationData = await verificationResponse.json()

      // If verification fails, show error
      if (!verificationResponse.ok || !verificationData.success) {
        console.error("Payment verification failed:", verificationData)
        setStatus("failure")
        setMessage(verificationData.message || "Payment verification failed")
        return
      }

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
