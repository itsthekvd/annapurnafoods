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

    // Update the payment status handling logic to properly handle different payment states
    if (paymentState === "COMPLETED") {
      // Payment was successful
      // Store the payment status in session storage for the client to check
      try {
        // We'll need to handle this on the client side since we can't directly modify session storage from the server
        console.log("Payment completed successfully:", transactionId)

        // Return a success response with the payment status
        return NextResponse.json({
          success: true,
          status: "COMPLETED",
          message: "Payment completed successfully",
          transactionId,
          merchantTransactionId,
        })
      } catch (error) {
        console.error("Error processing successful payment:", error)
        return NextResponse.json({
          success: true,
          status: "ERROR",
          message: "Error processing successful payment",
        })
      }
    } else if (paymentState === "FAILED" || paymentState === "CANCELLED") {
      // Payment failed or was cancelled
      console.log("Payment failed or cancelled:", paymentState, transactionId)

      // Return a response indicating the payment failed
      return NextResponse.json({
        success: true, // We still acknowledge the callback to PhonePe
        status: paymentState,
        message: `Payment ${paymentState.toLowerCase()}`,
        transactionId,
        merchantTransactionId,
      })
    } else {
      // Payment is in another state (e.g., PENDING)
      console.log("Payment in state:", paymentState, transactionId)

      // Return a response with the current state
      return NextResponse.json({
        success: true,
        status: paymentState,
        message: `Payment is ${paymentState.toLowerCase()}`,
        transactionId,
        merchantTransactionId,
      })
    }
  } catch (error) {
    console.error("Error processing PhonePe callback:", error)
    return NextResponse.json({ error: "Failed to process callback" }, { status: 500 })
  }
}
