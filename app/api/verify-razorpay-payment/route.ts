import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters",
        },
        { status: 400 },
      )
    }

    // Create a signature using the order ID and payment ID
    const text = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", config.razorpaySecretKey).update(text).digest("hex")

    // Verify the signature
    const isSignatureValid = expectedSignature === razorpay_signature

    if (isSignatureValid) {
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid signature",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify payment",
      },
      { status: 500 },
    )
  }
}
