import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { OrderStorage } from "@/lib/order-storage"
import type { OrderData } from "@/types"
import { ORDER_STATUSES, STATUS_DISPLAY_NAMES } from "@/lib/constants"

// Dummy declarations for variables that are assumed to be defined elsewhere
// Replace these with actual imports or definitions as needed
const filteredOrders: OrderData[] = [] // Replace with actual data source
const setSelectedOrder: (order: OrderData) => void = () => {} // Replace with actual state setter
const setShowOrderDetails: (show: boolean) => void = () => {} // Replace with actual state setter
let setOrders: any
let setIsUpdatingStatus: any

// Calculate per meal cost for an order
const calculatePerMealCost = (order: OrderData) => {
  const totalMeals = order.items.reduce((sum, item) => {
    // For subscription items, use subscription days
    if (item.subscriptionOption && item.subscriptionOption !== "one-time" && item.subscriptionDays) {
      return sum + item.quantity * item.subscriptionDays
    }
    // For one-time items, just use quantity
    return sum + item.quantity
  }, 0)

  return totalMeals > 0 ? order.total / totalMeals : order.total
}

// Export orders to CSV
const exportOrdersCSV = () => {
  // Create CSV content
  const headers = [
    "Order ID",
    "Date",
    "Status",
    "Customer Name",
    "Phone",
    "Email",
    "Zipcode",
    "Address",
    "Google Maps URL",
    "Meal Type",
    "Plan Type",
    "Meal Quantity",
    "Delivery Frequency",
    "First Delivery Date",
    "Payment Method",
    "Payment ID",
    "Total Amount",
    "Per Meal Cost",
    "Coupon Code",
    "Has Voice Note",
    "Items",
  ]

  const rows = filteredOrders.map((order) => {
    // Calculate per meal cost
    const perMealCost = calculatePerMealCost(order)

    return [
      order.id,
      new Date(order.createdAt).toLocaleString(),
      order.status,
      order.customerInfo.name,
      order.customerInfo.phone,
      order.customerInfo.email || "",
      order.customerInfo.zipcode || "",
      order.locationInfo.address,
      order.locationInfo.mapUrl || "",
      order.mealType || "",
      order.planType || "",
      order.mealQuantity || "1",
      order.deliveryFrequency || "",
      order.deliveryDate ? new Date(order.deliveryDate).toLocaleString() : "",
      order.paymentInfo.method,
      order.paymentInfo.transactionId || "",
      order.total.toFixed(2),
      perMealCost.toFixed(2),
      order.couponCode || "",
      order.customerInfo.hasVoiceNote ? "Yes" : "No",
      order.items.map((item) => `${item.productName} x${item.quantity}`).join(", "),
    ]
  })

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `orders-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case ORDER_STATUSES.PAID_PENDING:
      return <Badge className="bg-yellow-500">Paid & Pending</Badge>
    case ORDER_STATUSES.CONFIRMED:
      return <Badge className="bg-green-500">Confirmed</Badge>
    case ORDER_STATUSES.PREPARING:
      return <Badge className="bg-blue-500">Preparing</Badge>
    case ORDER_STATUSES.PACKING:
      return <Badge className="bg-indigo-500">Packing</Badge>
    case ORDER_STATUSES.EN_ROUTE:
      return <Badge className="bg-purple-500">En Route</Badge>
    case ORDER_STATUSES.DELIVERED:
      return <Badge className="bg-green-700">Delivered</Badge>
    case ORDER_STATUSES.TEST_ORDER:
      return <Badge className="bg-gray-500">Test Order</Badge>
    case "completed":
      return <Badge className="bg-green-500">Completed</Badge>
    case "pending":
      return <Badge className="bg-yellow-500">Pending</Badge>
    case "cancelled":
      return <Badge className="bg-red-500">Cancelled</Badge>
    case "payment_completed":
      return <Badge className="bg-blue-500">Payment Completed</Badge>
    default:
      return <Badge className="bg-gray-500">{status}</Badge>
  }
}

// View order details
const viewOrderDetails = (order: OrderData) => {
  setSelectedOrder(order)
  setShowOrderDetails(true)
}

// Handle status change
const handleStatusChange = async (orderId: string, newStatus: string) => {
  setIsUpdatingStatus(true)
  try {
    const success = await OrderStorage.updateOrderStatus(orderId, newStatus)

    if (success) {
      // Update the order in the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
      )

      toast({
        title: "Status updated",
        description: `Order status has been updated to ${STATUS_DISPLAY_NAMES[newStatus] || newStatus}`,
      })
    } else {
      toast({
        title: "Update failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    toast({
      title: "Error",
      description: "An error occurred while updating the order status.",
      variant: "destructive",
    })
  } finally {
    setIsUpdatingStatus(false)
  }
}
