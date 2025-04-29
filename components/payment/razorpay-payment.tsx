"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { config } from "@/lib/config"
import Script from "next/script"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayPaymentProps {
  amount: number
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  onSuccess: (paymentId: string, orderId: string) => void
  onFailure: (error: any) => void
  className?: string
}

export default function RazorpayPayment({
  amount,
  customerInfo,
  onSuccess,
  onFailure,
  className,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [buttonClicked, setButtonClicked] = useState(false)
  const { toast } = useToast()

  // Check if Razorpay script is already loaded
  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setScriptLoaded(true)
    }
  }, [])

  // Function to create a Razorpay order
  const createRazorpayOrder = async () => {
    try {
      // Generate a unique order ID
      const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`

      // Call our API to create a Razorpay order
      const response = await fetch("/api/create-razorpay-order", {
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create Razorpay order")
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error("Error creating Razorpay order:", error)
      throw error
    }
  }

  // Function to verify a Razorpay payment
  const verifyPayment = async (paymentData: any) => {
    try {
      const response = await fetch("/api/verify-razorpay-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Error verifying payment:", error)
      return false
    }
  }

  const handlePayment = async () => {
    if (loading || !scriptLoaded) return

    setButtonClicked(true)
    setLoading(true)

    try {
      // Create a Razorpay order
      const order = await createRazorpayOrder()

      // Initialize Razorpay payment
      const options = {
        key: config.razorpayKeyId,
        amount: order.amount, // Razorpay expects amount in paise
        currency: order.currency || "INR",
        name: "Annapurna Foods",
        description: "Food Order Payment",
        order_id: order.id,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        notes: {
          address: customerInfo.address,
          merchant_order_id: order.merchantOrderId || order.receipt,
        },
        theme: {
          color: "#b45309", // amber-700
        },
        handler: async (response: any) => {
          // Verify the payment
          const isVerified = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })

          if (isVerified) {
            // Handle successful payment
            const paymentId = response.razorpay_payment_id
            const orderId = order.merchantOrderId || order.receipt

            toast({
              title: "Payment successful",
              description: "Your payment has been processed successfully.",
            })

            onSuccess(paymentId, orderId)
          } else {
            toast({
              title: "Payment verification failed",
              description: "We couldn't verify your payment. Please contact support.",
              variant: "destructive",
            })
            onFailure(new Error("Payment verification failed"))
          }
          setLoading(false)
          setButtonClicked(false)
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setButtonClicked(false)
            toast({
              title: "Payment cancelled",
              description: "You cancelled the payment process.",
            })
            onFailure(new Error("Payment cancelled by user"))
          },
        },
      }

      if (typeof window !== "undefined" && window.Razorpay) {
        const razorpay = new window.Razorpay(options)
        razorpay.on("payment.failed", (response: any) => {
          toast({
            title: "Payment failed",
            description: response.error.description || "Your payment has failed.",
            variant: "destructive",
          })
          onFailure(new Error(response.error.description))
          setLoading(false)
          setButtonClicked(false)
        })
        razorpay.open()
      } else {
        toast({
          title: "Payment error",
          description: "Razorpay SDK not loaded. Please try again.",
          variant: "destructive",
        })
        onFailure(new Error("Razorpay SDK not loaded"))
        setLoading(false)
        setButtonClicked(false)
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
      onFailure(error)
      setLoading(false)
      setButtonClicked(false)
    }
  }

  // Handle script load
  const handleScriptLoad = () => {
    setScriptLoaded(true)
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={handleScriptLoad} strategy="lazyOnload" />

      <Button
        onClick={handlePayment}
        className={`w-full bg-amber-700 hover:bg-amber-800 py-6 text-lg ${className || ""}`}
        disabled={loading || !scriptLoaded || buttonClicked}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay with Razorpay"
        )}
      </Button>
    </>
  )
}
