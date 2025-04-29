import { getSupabaseServiceClient } from "./supabase-client"
import type { OrderData } from "./types"
import WebhookService from "./webhook-service"

// Service for storing and retrieving orders
const OrderStorage = {
  // Save an order to Supabase
  saveOrder: async (orderData: OrderData): Promise<boolean> => {
    try {
      console.log("Saving order to Supabase:", orderData.id)
      const supabase = getSupabaseServiceClient() // Use service client for admin operations

      // First, insert the order
      const { error: orderError } = await supabase.from("orders").upsert({
        id: orderData.id,
        created_at: orderData.createdAt,
        status: orderData.status,
        customer_name: orderData.customerInfo.name,
        customer_email: orderData.customerInfo.email || null,
        customer_phone: orderData.customerInfo.phone,
        customer_notes: orderData.customerInfo.notes || null,
        customer_zipcode: orderData.customerInfo.zipcode || null,
        has_voice_note: orderData.customerInfo.hasVoiceNote || false,
        location_address: orderData.locationInfo.address,
        location_lat: orderData.locationInfo.lat,
        location_lng: orderData.locationInfo.lng,
        location_map_url: orderData.locationInfo.mapUrl || null,
        payment_method: orderData.paymentInfo.method,
        payment_transaction_id: orderData.paymentInfo.transactionId || null,
        payment_amount: orderData.paymentInfo.amount,
        delivery_date: orderData.deliveryDate || null,
        total: orderData.total,
        meal_type: orderData.mealType || null,
        plan_type: orderData.planType || null,
        meal_quantity: orderData.mealQuantity || 1,
        delivery_frequency: orderData.deliveryFrequency || null,
        coupon_code: orderData.couponCode || null,
      })

      if (orderError) {
        console.error("Error saving order to Supabase:", orderError)
        return false
      }

      // Then, insert the order items
      const orderItems = orderData.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        subscription_option: item.subscriptionOption || null,
        subscription_days: item.subscriptionDays || null,
      }))

      // Delete existing items first to avoid duplicates
      await supabase.from("order_items").delete().eq("order_id", orderData.id)

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Error saving order items to Supabase:", itemsError)
        return false
      }

      console.log("Order saved successfully to Supabase:", orderData.id)

      // Send order data to webhook - use a try/catch to prevent any issues
      try {
        WebhookService.sendToAutonami(orderData)
          .then((success) => {
            if (success) {
              console.log("Order data sent to webhook successfully")
            } else {
              console.warn("Failed to send order data to webhook, but order was saved to Supabase")
            }
          })
          .catch((error) => {
            console.error("Error sending order data to webhook:", error)
          })
      } catch (e) {
        console.error("Error initiating webhook call:", e)
      }

      // Also save to localStorage as a fallback - wrapped in try/catch
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem(`order-${orderData.id}`, JSON.stringify(orderData))
        }
      } catch (e) {
        console.error("Failed to save order to localStorage fallback", e)
      }

      return true
    } catch (error) {
      console.error("Failed to save order to Supabase:", error)

      // Fallback to localStorage if Supabase fails
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem(`order-${orderData.id}`, JSON.stringify(orderData))
          console.log("Order saved to localStorage fallback")
        }
      } catch (e) {
        console.error("Failed to save order to localStorage fallback", e)
      }

      return false
    }
  },

  // Get all orders from Supabase
  getAllOrders: async (): Promise<OrderData[]> => {
    try {
      console.log("Getting all orders from Supabase")
      const supabase = getSupabaseServiceClient() // Use service client for admin operations

      // Get all orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (ordersError) {
        console.error("Error getting orders from Supabase:", ordersError)
        throw ordersError
      }

      if (!orders || orders.length === 0) {
        console.log("No orders found in Supabase")

        // Try to get orders from localStorage as fallback
        if (typeof window !== "undefined") {
          const localOrders: OrderData[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith("order-")) {
              try {
                const orderData = localStorage.getItem(key)
                if (orderData) {
                  const order = JSON.parse(orderData)
                  if (order && order.id) {
                    localOrders.push(order)
                  }
                }
              } catch (e) {
                console.error(`Failed to parse order from key ${key}`, e)
              }
            }
          }
          console.log(`Found ${localOrders.length} orders in localStorage fallback`)
          return localOrders
        }

        return []
      }

      // Get all order items
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in(
          "order_id",
          orders.map((order) => order.id),
        )

      if (itemsError) {
        console.error("Error getting order items from Supabase:", itemsError)
        throw itemsError
      }

      // Map the data to our OrderData format
      const formattedOrders: OrderData[] = orders.map((order) => {
        const items = orderItems
          ? orderItems
              .filter((item) => item.order_id === order.id)
              .map((item) => ({
                productId: item.product_id,
                productName: item.product_name,
                quantity: item.quantity || 1,
                price: item.price,
                subscriptionOption: item.subscription_option,
                subscriptionDays: item.subscription_days,
              }))
          : []

        return {
          id: order.id,
          createdAt: order.created_at,
          status: order.status,
          customerInfo: {
            name: order.customer_name,
            email: order.customer_email || "",
            phone: order.customer_phone,
            notes: order.customer_notes || "",
            zipcode: order.customer_zipcode || "",
            hasVoiceNote: order.has_voice_note || false,
          },
          locationInfo: {
            address: order.location_address,
            lat: order.location_lat,
            lng: order.location_lng,
            mapUrl: order.location_map_url || "",
          },
          paymentInfo: {
            method: order.payment_method,
            transactionId: order.payment_transaction_id || "",
            amount: order.payment_amount,
          },
          items,
          deliveryDate: order.delivery_date,
          total: order.total,
          mealType: order.meal_type || "",
          planType: order.plan_type || "",
          mealQuantity: order.meal_quantity || 1,
          deliveryFrequency: order.delivery_frequency || "",
          couponCode: order.coupon_code || "",
        }
      })

      console.log(`Found ${formattedOrders.length} orders in Supabase`)
      return formattedOrders
    } catch (error) {
      console.error("Failed to retrieve orders from Supabase:", error)

      // Fallback to localStorage if Supabase fails
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const localOrders: OrderData[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith("order-")) {
              try {
                const orderData = localStorage.getItem(key)
                if (orderData) {
                  const order = JSON.parse(orderData)
                  if (order && order.id) {
                    localOrders.push(order)
                  }
                }
              } catch (e) {
                console.error(`Failed to parse order from key ${key}`, e)
              }
            }
          }
          console.log(`Found ${localOrders.length} orders in localStorage fallback`)
          return localOrders
        }
        return []
      } catch (e) {
        console.error("Failed to retrieve orders from localStorage fallback", e)
        return []
      }
    }
  },

  getOrderById: async (orderId: string): Promise<OrderData | null> => {
    try {
      console.log("Getting order by ID from Supabase:", orderId)
      const supabase = getSupabaseServiceClient()

      // Get the order
      const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

      if (orderError || !order) {
        console.error("Error getting order from Supabase:", orderError)
        return null
      }

      // Get the order items
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)

      if (itemsError) {
        console.error("Error getting order items from Supabase:", itemsError)
        return null
      }

      // Map the data to our OrderData format
      const formattedOrder: OrderData = {
        id: order.id,
        createdAt: order.created_at,
        status: order.status,
        customerInfo: {
          name: order.customer_name,
          email: order.customer_email || "",
          phone: order.customer_phone,
          notes: order.customer_notes || "",
          zipcode: order.customer_zipcode || "",
          hasVoiceNote: order.has_voice_note || false,
        },
        locationInfo: {
          address: order.location_address,
          lat: order.location_lat,
          lng: order.location_lng,
          mapUrl: order.location_map_url || "",
        },
        paymentInfo: {
          method: order.payment_method,
          transactionId: order.payment_transaction_id || "",
          amount: order.payment_amount,
        },
        items: orderItems
          ? orderItems.map((item) => ({
              productId: item.product_id,
              productName: item.product_name,
              quantity: item.quantity || 1,
              price: item.price,
              subscriptionOption: item.subscription_option,
              subscriptionDays: item.subscription_days,
            }))
          : [],
        deliveryDate: order.delivery_date,
        total: order.total,
        mealType: order.meal_type || "",
        planType: order.plan_type || "",
        mealQuantity: order.meal_quantity || 1,
        deliveryFrequency: order.delivery_frequency || "",
        couponCode: order.coupon_code || "",
      }

      console.log("Found order in Supabase:", orderId)
      return formattedOrder
    } catch (error) {
      console.error("Failed to retrieve order from Supabase:", error)

      // Fallback to localStorage if Supabase fails
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const orderData = localStorage.getItem(`order-${orderId}`)
          if (orderData) {
            console.log("Found order in localStorage fallback:", orderId)
            return JSON.parse(orderData)
          }
        }
      } catch (e) {
        console.error("Failed to retrieve order from localStorage fallback", e)
      }

      return null
    }
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<boolean> => {
    try {
      console.log("Updating order status in Supabase:", orderId, status)
      const supabase = getSupabaseServiceClient()

      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (error) {
        console.error("Error updating order status in Supabase:", error)
        return false
      }

      // Also update in localStorage if available
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const orderData = localStorage.getItem(`order-${orderId}`)
          if (orderData) {
            const order = JSON.parse(orderData)
            order.status = status
            localStorage.setItem(`order-${orderId}`, JSON.stringify(order))
            console.log("Updated order status in localStorage fallback:", orderId, status)
          }
        }
      } catch (e) {
        console.error("Failed to update order status in localStorage fallback", e)
      }

      return true
    } catch (error) {
      console.error("Failed to update order status in Supabase:", error)
      return false
    }
  },

  // Delete an order from Supabase
  deleteOrder: async (orderId: string): Promise<boolean> => {
    try {
      console.log("Deleting order from Supabase:", orderId)
      const supabase = getSupabaseServiceClient()

      // First delete the order items
      const { error: itemsError } = await supabase.from("order_items").delete().eq("order_id", orderId)

      if (itemsError) {
        console.error("Error deleting order items from Supabase:", itemsError)
        return false
      }

      // Then delete the order
      const { error: orderError } = await supabase.from("orders").delete().eq("id", orderId)

      if (orderError) {
        console.error("Error deleting order from Supabase:", orderError)
        return false
      }

      // Also delete from localStorage if available
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.removeItem(`order-${orderId}`)
        }
      } catch (e) {
        console.error("Failed to delete order from localStorage", e)
      }

      console.log("Order deleted successfully from Supabase:", orderId)
      return true
    } catch (error) {
      console.error("Failed to delete order from Supabase:", error)
      return false
    }
  },
}

// Export as both named and default export to maintain compatibility
export { OrderStorage }
export default OrderStorage
