import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import crypto from "crypto"
import OrderStorage from "@/lib/order-storage"
import { ORDER_STATUS } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("PhonePe callback received:", body)

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
    console.log("Decoded PhonePe response:", decodedResponse)

    // Process the payment status
    const { merchantId, merchantTransactionId, transactionId, amount, paymentState } = decodedResponse

    // Verify that the merchant ID matches our configured merchant ID
    if (merchantId !== config.phonePeMerchantId) {
      return NextResponse.json({ error: "Invalid merchant ID" }, { status: 400 })
    }

    // Determine the order status based on the payment state
    let orderStatus = ORDER_STATUS.PAID_PENDING
    if (paymentState === "COMPLETED") {
      orderStatus = ORDER_STATUS.PAID_PENDING
    } else if (paymentState === "FAILED") {
      orderStatus = "payment_failed"
    } else if (paymentState === "PENDING") {
      orderStatus = "payment_pending"
    }

    // Try to find the order by transaction ID
    try {
      const order = await OrderStorage.getOrderByPhonePeTransactionId(transactionId || merchantTransactionId)

      if (order) {
        // Update the order status
        await OrderStorage.updateOrderStatus(order.id, orderStatus)
        console.log(`Order ${order.id} status updated to ${orderStatus}`)
      } else {
        console.log(`No order found for transaction ID ${transactionId || merchantTransactionId}`)
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }

    // Return a success response to PhonePe
    return NextResponse.json({
      success: true,
      status: paymentState,
      message: `Payment callback processed successfully. Status: ${paymentState}`,
      transactionId,
      merchantTransactionId,
    })
  } catch (error) {
    console.error("Error processing PhonePe callback:", error)
    return NextResponse.json({ error: "Failed to process callback" }, { status: 500 })
  }
}
