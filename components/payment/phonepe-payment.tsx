"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PhonePePaymentProps {
  amount: number
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  onSuccess: (paymentId: string, transactionId: string) => void
  onFailure: (error: any) => void
  className?: string
}

export default function PhonePePayment({ amount, customerInfo, onSuccess, onFailure, className }: PhonePePaymentProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [lastFailedPayment, setLastFailedPayment] = useState<any>(null)
  const [showRetryBanner, setShowRetryBanner] = useState(false)

  // Check for failed transactions on component mount
  useEffect(() => {
    try {
      const failedTransaction = sessionStorage.getItem("failedTransaction")
      if (failedTransaction) {
        const parsedTransaction = JSON.parse(failedTransaction)
        setLastFailedPayment(parsedTransaction)
        setShowRetryBanner(true)
      }
    } catch (error) {
      console.error("Error checking for failed transactions:", error)
    }
  }, [])

  // Function to create a PhonePe payment
  const createPhonePePayment = async (useExistingOrderId = false) => {
    try {
      // Generate a unique order ID or use the existing one from a failed transaction
      let orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`

      if (useExistingOrderId && lastFailedPayment && lastFailedPayment.orderId) {
        orderId = lastFailedPayment.orderId
      }

      // Call our API to create a PhonePe payment
      const response = await fetch("/api/create-phonepe-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          customerInfo,
          orderId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        console.error("PhonePe API error:", data)
        throw new Error(data.error || "Failed to create PhonePe payment")
      }

      // Store transaction details in session storage for verification after redirect
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem(
          "phonePeTransaction",
          JSON.stringify({
            merchantTransactionId: data.data.merchantTransactionId,
            amount,
            customerInfo,
            orderId,
          }),
        )

        // Also store cart items for the callback
        const cartItems = localStorage.getItem("annapurna-cart")
        if (cartItems) {
          sessionStorage.setItem("cartItems", cartItems)
        }
      }

      return {
        success: true,
        data: {
          merchantTransactionId: data.data.merchantTransactionId,
          redirectUrl: data.data.redirectUrl,
          orderId,
        },
      }
    } catch (error) {
      console.error("Error creating PhonePe payment:", error)
      throw error
    }
  }

  const handlePayment = async (useExistingOrderId = false) => {
    setLoading(true)

    try {
      // Create a PhonePe payment
      const response = await createPhonePePayment(useExistingOrderId)

      if (response.success) {
        toast({
          title: "Redirecting to PhonePe",
          description: "You will be redirected to PhonePe to complete your payment.",
        })

        // Store transaction ID in session storage for verification after redirect
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.setItem("phonePeTransactionId", response.data.merchantTransactionId)
        }

        // In a real implementation, redirect to PhonePe's payment page
        window.location.href = response.data.redirectUrl

        // Note: The success callback will be handled by the phonepe-callback page
        // after the user is redirected back from PhonePe
      } else {
        throw new Error("Failed to create PhonePe payment")
      }
    } catch (error) {
      console.error("PhonePe payment error:", error)
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
      onFailure(error)
      setLoading(false)
    }
  }

  const dismissRetryBanner = () => {
    setShowRetryBanner(false)
    sessionStorage.removeItem("failedTransaction")
  }

  return (
    <div className="w-full">
      {showRetryBanner && (
        <div className="mb-4 p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
            <div className="flex-1">
              <h4 className="font-medium text-amber-800">Previous payment was not completed</h4>
              <p className="text-sm text-amber-700 mb-3">
                Would you like to retry your previous payment or start a new one?
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500 text-amber-700 hover:bg-amber-100"
                  onClick={() => handlePayment(true)}
                  disabled={loading}
                >
                  Retry Payment
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-500" onClick={dismissRetryBanner}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={() => handlePayment(false)}
        className={`w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg ${className || ""}`}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay with PhonePe"
        )}
      </Button>
    </div>
  )
}
