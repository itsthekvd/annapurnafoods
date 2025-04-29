import { NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, customerInfo, orderId } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          error: "Valid amount is required",
          details: "Amount must be greater than 0",
        },
        { status: 400 },
      )
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

    // Validate API credentials
    if (!config.razorpayKeyId || !config.razorpaySecretKey) {
      console.error("Missing Razorpay API credentials")
      return NextResponse.json(
        {
          error: "Payment gateway configuration error",
          details: "Missing API credentials",
        },
        { status: 500 },
      )
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
          status: response.status,
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
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
