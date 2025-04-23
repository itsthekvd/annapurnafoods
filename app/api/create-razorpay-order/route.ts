import { NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, customerInfo, orderId } = body

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 })
    }

    // Generate a unique order ID if not provided
    const merchantOrderId = orderId || `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    // Create the payload for Razorpay
    const payload = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: merchantOrderId,
      notes: {
        customerName: customerInfo?.name || "",
        customerEmail: customerInfo?.email || "",
        customerPhone: customerInfo?.phone || "",
      },
    }

    // Razorpay API endpoint for creating orders
    const razorpayApiUrl = "https://api.razorpay.com/v1/orders"

    // Create Basic Auth header using API key and secret
    const authHeader = "Basic " + Buffer.from(`${config.razorpayKeyId}:${config.razorpaySecretKey}`).toString("base64")

    // Make the API call to Razorpay
    const response = await fetch(razorpayApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("Razorpay API error:", responseData)
      return NextResponse.json(
        {
          error: responseData.error?.description || "Failed to create order",
          details: responseData,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: responseData.id,
        amount: responseData.amount,
        currency: responseData.currency,
        receipt: responseData.receipt,
        merchantOrderId,
      },
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
