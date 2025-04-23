/**
 * Service for sending order data to external webhooks
 */
const WebhookService = {
  /**
   * Send order data to Autonami webhook
   * @param orderData The complete order data to send
   * @returns Promise that resolves to success status
   */
  sendToAutonami: async (orderData: any): Promise<boolean> => {
    try {
      console.log("Sending order data to Autonami webhook")

      // Format the data for the webhook
      const webhookData = {
        order_id: orderData.id,
        order_date: orderData.createdAt,
        order_status: orderData.status,
        customer_name: orderData.customerInfo.name,
        customer_email: orderData.customerInfo.email || "",
        customer_phone: orderData.customerInfo.phone,
        customer_notes: orderData.customerInfo.notes || "",
        customer_zipcode: orderData.customerInfo.zipcode || "",
        has_voice_note: orderData.customerInfo.hasVoiceNote || false,
        delivery_address: orderData.locationInfo.address,
        delivery_date: orderData.deliveryDate || "",
        payment_method: orderData.paymentInfo.method,
        payment_transaction_id: orderData.paymentInfo.transactionId || "",
        payment_amount: orderData.paymentInfo.amount,
        meal_type: orderData.mealType || "",
        plan_type: orderData.planType || "",
        meal_quantity: orderData.mealQuantity || 1,
        delivery_frequency: orderData.deliveryFrequency || "",
        coupon_code: orderData.couponCode || "",
        items: orderData.items.map((item: any) => ({
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
          subscription_option: item.subscriptionOption || "",
          subscription_days: item.subscriptionDays || 0,
        })),
        total: orderData.total,
      }

      // The webhook URL
      const webhookUrl =
        "https://demo.maitreyalabs.com/annapurnaisha/wp-json/autonami/v1/webhook/?bwfan_autonami_webhook_id=21&bwfan_autonami_webhook_key=bc8e14e47e6cfb44c5e2ba9515a16ff6"

      // Send the data to the webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      })

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`)
      }

      const responseData = await response.text()
      console.log("Webhook response:", responseData)

      return true
    } catch (error) {
      console.error("Failed to send data to webhook:", error)
      // Don't fail the order process if webhook fails
      return false
    }
  },
}

export default WebhookService
