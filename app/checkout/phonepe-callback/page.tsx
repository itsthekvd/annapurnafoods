"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import OrderStorage from "@/lib/order-storage"
import WebhookService from "@/lib/webhook-service"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ORDER_STATUS } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function PhonePeCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "failure" | "pending">("loading")
  const [message, setMessage] = useState("Verifying your payment...")
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const { toast } = useToast()
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
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
        const code = searchParams.get("code")
        const transactionId = searchParams.get("transactionId") || searchParams.get("txnId")
        const merchantTransactionId = searchParams.get("merchantTransactionId")

        console.log("PhonePe callback received:", {
          code,
          transactionId,
          merchantTransactionId,
          searchParams: Object.fromEntries(searchParams.entries()),
        })

        // Check payment status
        if (code === "PAYMENT_SUCCESS" || code === "SUCCESS") {
          // Call the success handler
          await handleSuccessfulPayment(transactionId, merchantTransactionId)
        } else if (code === "PAYMENT_ERROR" || code === "FAILURE" || code === "FAILED") {
          // Show error message
          toast({
            title: "Payment Failed",
            description: "Your payment was not completed. Please try again.",
            variant: "destructive",
          })

          setStatus("failure")
          setMessage("Your payment was not completed. Please try again.")

          // Store the transaction details for retry
          try {
            const storedTransaction = sessionStorage.getItem("phonePeTransaction")
            if (storedTransaction) {
              sessionStorage.setItem("failedTransaction", storedTransaction)
            }
          } catch (error) {
            console.error("Error storing failed transaction:", error)
          }

          // Redirect back to checkout after a delay
          setTimeout(() => {
            router.push("/checkout")
          }, 3000)
        } else if (code === "PAYMENT_PENDING" || code === "PENDING") {
          // Handle pending status
          toast({
            title: "Payment Pending",
            description: "Your payment is being processed. We'll update you once it's complete.",
          })

          setStatus("pending")
          setMessage("Your payment is being processed. We'll update you once it's complete.")

          // Redirect to checkout after a delay
          setTimeout(() => {
            router.push("/checkout")
          }, 5000)
        } else {
          // Handle other statuses including cancellation
          toast({
            title: "Payment Cancelled",
            description: "Your payment was cancelled. Please try again if you wish to complete your order.",
            variant: "destructive",
          })

          setStatus("failure")
          setMessage("Your payment was cancelled. Please try again if you wish to complete your order.")

          // Store the transaction details for retry
          try {
            const storedTransaction = sessionStorage.getItem("phonePeTransaction")
            if (storedTransaction) {
              sessionStorage.setItem("failedTransaction", storedTransaction)
            }
          } catch (error) {
            console.error("Error storing failed transaction:", error)
          }

          // Redirect back to checkout after a delay
          setTimeout(() => {
            router.push("/checkout")
          }, 3000)
        }
      } catch (error) {
        console.error("Error checking payment status:", error)
        setStatus("failure")
        setMessage("An error occurred while processing your payment. Please try again.")

        // Redirect back to checkout after a delay
        setTimeout(() => {
          router.push("/checkout")
        }, 3000)
      }
    }

    checkPaymentStatus()
  }, [router, toast])

  const handleSuccessfulPayment = async (txnId: string | null, merchantTransactionId: string | null) => {
    try {
      console.log("Processing successful payment with txnId:", txnId, "merchantTransactionId:", merchantTransactionId)

      // Get stored transaction details
      const storedTransaction = sessionStorage.getItem("phonePeTransaction")
      if (!storedTransaction) {
        console.log("No stored transaction found, attempting to proceed anyway")
        setStatus("success")
        setMessage("Payment successful! Redirecting to order confirmation...")

        // Even if we don't have stored details, redirect to success
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
      const finalOrderId =
        orderId || merchantTransactionId || txnId || `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

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
      const paymentDetails = {
        paymentId,
        orderId: finalOrderId,
        amount,
        date: new Date().toISOString(),
        gateway: "PhonePe",
        transactionId: txnId || merchantTransactionId,
      }

      setPaymentDetails(paymentDetails)

      sessionStorage.setItem("paymentDetails", JSON.stringify(paymentDetails))

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
          phonepeTransactionId: txnId || merchantTransactionId,
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

      console.log("Saving order data:", completeOrderData)

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
        sessionStorage.removeItem("failedTransaction")
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

      // Even if there's an error, redirect to checkout page after a delay
      setTimeout(() => {
        window.location.href = "/checkout"
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
            <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
            <p className="text-gray-600 mb-6">Redirecting you to the order confirmation page...</p>

            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto mb-4 text-left">
                <p className="text-sm text-gray-600">
                  <strong>Order ID:</strong> {paymentDetails.orderId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> ₹{paymentDetails.amount}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Transaction ID:</strong> {paymentDetails.transactionId || "N/A"}
                </p>
              </div>
            )}

            <Button
              onClick={() => (window.location.href = "/checkout/success")}
              className="bg-amber-700 hover:bg-amber-800"
            >
              View Order Details
            </Button>
          </>
        )}

        {status === "pending" && (
          <>
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-amber-500" />
            <h1 className="text-2xl font-bold text-amber-700 mb-2">Payment Pending</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <Button onClick={() => (window.location.href = "/checkout")} className="bg-amber-700 hover:bg-amber-800">
              Return to Checkout
            </Button>
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
