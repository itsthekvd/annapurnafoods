import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import crypto from "crypto"

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

    if (!customerInfo?.phone) {
      return NextResponse.json(
        {
          error: "Customer phone is required",
          details: "Phone number is required for PhonePe payments",
        },
        { status: 400 },
      )
    }

    // Validate API credentials
    if (!config.phonePeMerchantId || !config.phonePeApiKey || !config.phonePeKeyIndex) {
      console.error("Missing PhonePe API credentials")
      return NextResponse.json(
        {
          error: "Payment gateway configuration error",
          details: "Missing API credentials",
        },
        { status: 500 },
      )
    }

    // Generate a unique merchant transaction ID if not provided
    const merchantTransactionId = orderId || `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    // Get the base URL from the request or use the config
    const origin = request.headers.get("origin") || config.apiBaseUrl

    // Create the payload for PhonePe
    const payload = {
      merchantId: config.phonePeMerchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: `MUID_${Date.now()}`,
      amount: amount * 100, // PhonePe expects amount in paise
      redirectUrl: `${origin}/checkout/phonepe-callback?txnId=${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${origin}/api/phonepe-callback`,
      mobileNumber: customerInfo.phone,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    }

    console.log("PhonePe redirect URL:", payload.redirectUrl)

    // Convert payload to base64
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64")

    // Generate checksum (X-VERIFY)
    // Format: sha256(base64 encoded payload + "/pg/v1/pay" + salt key) + ### + salt index
    const dataForHash = `${payloadBase64}/pg/v1/pay${config.phonePeApiKey}`
    const xVerify = crypto.createHash("sha256").update(dataForHash).digest("hex") + "###" + config.phonePeKeyIndex

    // PhonePe production API endpoint
    const phonepeApiUrl = "https://api.phonepe.com/apis/hermes/pg/v1/pay"

    // Make the API call to PhonePe
    const response = await fetch(phonepeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify({
        request: payloadBase64,
      }),
    })

    const responseData = await response.json()

    if (!responseData.success) {
      console.error("PhonePe API error:", responseData)
      return NextResponse.json(
        {
          error: responseData.message || "Failed to create payment",
          details: responseData,
          code: responseData.code || "UNKNOWN_ERROR",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        merchantTransactionId: merchantTransactionId,
        redirectUrl: responseData.data.instrumentResponse.redirectInfo.url,
      },
    })
  } catch (error) {
    console.error("Error creating PhonePe payment:", error)
    return NextResponse.json(
      {
        error: "Failed to create payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
