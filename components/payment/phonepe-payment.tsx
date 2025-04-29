"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
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

  // Function to create a PhonePe payment
  const createPhonePePayment = async () => {
    try {
      // Generate a unique order ID
      const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`

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

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Create a PhonePe payment
      const response = await createPhonePePayment()

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

  return (
    <Button
      onClick={handlePayment}
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
  )
}
