import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Verify the callback signature
    const xVerify = request.headers.get("X-VERIFY")
    if (!xVerify) {
      return NextResponse.json({ error: "Missing X-VERIFY header" }, { status: 400 })
    }

    // Extract the checksum and salt index
    const [checksum, saltIndex] = xVerify.split("###")

    // Verify that the salt index matches our configured index
    if (saltIndex !== config.phonePeKeyIndex) {
      return NextResponse.json({ error: "Invalid salt index" }, { status: 400 })
    }

    // Get the base64 encoded payload from the request
    const { response } = body

    // Calculate the expected checksum
    const dataForHash = `${response}/pg/v1/status/${config.phonePeApiKey}`
    const expectedChecksum = crypto.createHash("sha256").update(dataForHash).digest("hex")

    // Verify the checksum
    if (checksum !== expectedChecksum) {
      return NextResponse.json({ error: "Invalid checksum" }, { status: 400 })
    }

    // Decode the payload
    const decodedResponse = JSON.parse(Buffer.from(response, "base64").toString())

    // Process the payment status
    const { merchantId, merchantTransactionId, transactionId, amount, paymentState } = decodedResponse

    // Verify that the merchant ID matches our configured merchant ID
    if (merchantId !== config.phonePeMerchantId) {
      return NextResponse.json({ error: "Invalid merchant ID" }, { status: 400 })
    }

    // Check if the payment was successful
    if (paymentState === "COMPLETED") {
      // Payment was successful
      // Update your database, send confirmation emails, etc.

      // Return a success response to PhonePe
      return NextResponse.json({
        success: true,
        message: "Payment callback processed successfully",
      })
    } else {
      // Payment failed or is pending
      // Update your database accordingly

      // Return a success response to PhonePe (we still acknowledge the callback)
      return NextResponse.json({
        success: true,
        message: "Payment callback processed successfully",
      })
    }
  } catch (error) {
    console.error("Error processing PhonePe callback:", error)
    return NextResponse.json({ error: "Failed to process callback" }, { status: 500 })
  }
}
