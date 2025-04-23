import OrderStorage from "@/lib/order-storage"
import WebhookService from "@/lib/webhook-service"
import { ORDER_STATUS } from "@/lib/types"

// Generate a unique order ID with timestamp and random string
function generateUniqueOrderId(): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 10)
  return `order_${timestamp}_${randomStr}`
}

export async function handleCashOnDelivery(
  customerInfo: any,
  locationInfo: any,
  itemsToDisplay: any[],
  total: number,
  deliveryDate?: Date,
  couponCode?: string,
) {
  try {
    // Generate dummy transaction ID
    const transactionId = `cod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const generatedOrderId = generateUniqueOrderId()

    // Store order details for success page - wrapped in try/catch
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem(
          "orderDetails",
          JSON.stringify({
            customerInfo,
            locationInfo,
            items: itemsToDisplay,
            total,
            deliveryDate: deliveryDate ? deliveryDate.toISOString() : undefined,
            couponCode,
          }),
        )

        // Store payment details for COD orders
        sessionStorage.setItem(
          "paymentDetails",
          JSON.stringify({
            paymentId: transactionId,
            orderId: generatedOrderId,
            amount: total,
            date: new Date().toISOString(),
            gateway: "Cash on Delivery",
          }),
        )
      }
    } catch (e) {
      console.error("Failed to store order details in session storage", e)
    }

    // Determine meal type and plan type from items
    let mealType = ""
    let planType = ""
    let deliveryFrequency = ""
    let mealQuantity = 0

    // Extract meal information from items
    itemsToDisplay.forEach((item) => {
      // Count total meal quantity
      mealQuantity += item.quantity || 1

      // Determine meal type (brunch or dinner)
      if (item.product.id === "brunch") {
        mealType = "Brunch"
      } else if (item.product.id === "dinner") {
        mealType = "Dinner"
      }

      // Determine plan type and delivery frequency
      if (item.subscriptionOption && item.subscriptionOption !== "one-time") {
        planType = item.subscriptionOption

        // Set delivery frequency based on subscription option
        switch (item.subscriptionOption) {
          case "weekends":
            deliveryFrequency = "Weekends Only"
            break
          case "sundays":
            deliveryFrequency = "Sundays Only"
            break
          case "monthly-1":
            deliveryFrequency = "Daily - 1 Month"
            break
          case "monthly-3":
            deliveryFrequency = "Daily - 3 Months"
            break
          case "monthly-6":
            deliveryFrequency = "Daily - 6 Months"
            break
          case "monthly-12":
            deliveryFrequency = "Daily - 12 Months"
            break
          default:
            deliveryFrequency = "Custom"
        }
      } else {
        planType = "One-time"
        deliveryFrequency = "One-time"
      }
    })

    // Create complete order data
    const completeOrderData = {
      id: generatedOrderId,
      createdAt: new Date().toISOString(),
      status: ORDER_STATUS.PAID_PENDING, // Set initial status to paid & pending
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        notes: customerInfo.notes || "",
        zipcode: customerInfo.zipcode || "",
        hasVoiceNote: !!customerInfo.voiceNote,
      },
      locationInfo,
      paymentInfo: {
        method: "Cash on Delivery",
        transactionId: transactionId,
        amount: total,
      },
      items: itemsToDisplay.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity || 1,
        price: item.product.price,
        subscriptionOption: item.subscriptionOption,
        subscriptionDays: item.subscriptionDays,
      })),
      deliveryDate: deliveryDate ? deliveryDate.toISOString() : undefined,
      total,
      mealType,
      planType,
      mealQuantity,
      deliveryFrequency,
      couponCode,
    }

    // Save order data to Supabase
    await OrderStorage.saveOrder(completeOrderData)

    // Send order data to webhook - wrapped in try/catch
    try {
      WebhookService.sendToAutonami(completeOrderData)
        .then((success) => {
          if (success) {
            console.log("Order data sent to webhook successfully from COD handler")
          } else {
            console.warn("Failed to send order data to webhook from COD handler, but order was saved")
          }
        })
        .catch((error) => {
          console.error("Error sending order data to webhook from COD handler:", error)
        })
    } catch (e) {
      console.error("Error initiating webhook call from COD handler:", e)
    }

    return {
      success: true,
      orderId: generatedOrderId,
      transactionId,
    }
  } catch (error) {
    console.error("Error processing COD order:", error)
    return {
      success: false,
      error,
    }
  }
}
