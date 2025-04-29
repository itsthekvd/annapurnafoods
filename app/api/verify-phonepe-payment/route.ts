import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { merchantTransactionId } = body

    if (!merchantTransactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing transaction ID",
          message: "Transaction ID is required for verification",
        },
        { status: 400 },
      )
    }

    // PhonePe status check API endpoint
    const phonepeApiUrl = `https://api.phonepe.com/apis/hermes/pg/v1/status/${config.phonePeMerchantId}/${merchantTransactionId}`

    // Generate checksum (X-VERIFY)
    // Format: sha256("/pg/v1/status/{merchantId}/{merchantTransactionId}" + salt key) + ### + salt index
    const dataForHash = `/pg/v1/status/${config.phonePeMerchantId}/${merchantTransactionId}${config.phonePeApiKey}`
    const xVerify = crypto.createHash("sha256").update(dataForHash).digest("hex") + "###" + config.phonePeKeyIndex

    // Make the API call to PhonePe
    const response = await fetch(phonepeApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": config.phonePeMerchantId,
      },
    })

    const responseData = await response.json()

    if (!responseData.success) {
      console.error("PhonePe status check failed:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: responseData.message || "Failed to verify payment",
          message: "Payment verification failed",
          details: responseData,
        },
        { status: 400 },
      )
    }

    // Check payment status
    const paymentStatus = responseData.data.paymentInstrument?.status

    if (paymentStatus !== "PAYMENT_SUCCESS") {
      return NextResponse.json({
        success: false,
        message: `Payment was not successful. Status: ${paymentStatus}`,
        status: paymentStatus,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: responseData.data,
    })
  } catch (error) {
    console.error("Error verifying PhonePe payment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify payment",
        message: "An unexpected error occurred during payment verification",
      },
      { status: 500 },
    )
  }
}
