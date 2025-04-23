"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, AlertTriangle, Upload, RefreshCw, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { OrderStorage } from "@/lib/order-storage"
import { ORDER_STATUS } from "@/lib/types"

export default function ImportOrdersPage() {
  const router = useRouter()
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [orderData, setOrderData] = useState("")
  const [parsedOrders, setParsedOrders] = useState<any[]>([])
  const [isParsed, setIsParsed] = useState(false)
  const [existingOrders, setExistingOrders] = useState<string[]>([])
  const [isLoadingExisting, setIsLoadingExisting] = useState(false)
  const [importedOrderIds, setImportedOrderIds] = useState<string[]>([])
  const [showImportedOrders, setShowImportedOrders] = useState(false)

  // Load existing orders on mount to prevent duplicates
  useEffect(() => {
    loadExistingOrders()
  }, [])

  // Load existing order IDs to prevent duplicates
  const loadExistingOrders = async () => {
    setIsLoadingExisting(true)
    try {
      const orders = await OrderStorage.getAllOrders()
      const orderIds = orders.map((order) => order.id)
      setExistingOrders(orderIds)
      console.log(`Loaded ${orderIds.length} existing order IDs`)
    } catch (error) {
      console.error("Error loading existing orders:", error)
      setErrors((prev) => [...prev, `Error loading existing orders: ${error.message}`])
    } finally {
      setIsLoadingExisting(false)
    }
  }

  // Map order status to our system's status
  const mapOrderStatus = (csvStatus: string): string => {
    const statusMap: Record<string, string> = {
      Completed: ORDER_STATUS.DELIVERED,
      Processing: ORDER_STATUS.CONFIRMED,
      "Pending payment": ORDER_STATUS.PAID_PENDING,
      "On hold": ORDER_STATUS.PREPARING,
      Cancelled: "cancelled",
      Refunded: "refunded",
      Failed: "payment_failed",
    }

    return statusMap[csvStatus] || ORDER_STATUS.PAID_PENDING
  }

  // Determine if an order is a subscription based on item name
  const isSubscriptionOrder = (itemName: string): boolean => {
    return (
      itemName.toLowerCase().includes("subscription") ||
      itemName.toLowerCase().includes("monthly") ||
      itemName.toLowerCase().includes("weekly")
    )
  }

  // Determine meal type from item name
  const getMealType = (itemName: string): string => {
    if (itemName.toLowerCase().includes("brunch")) {
      return "brunch"
    } else if (itemName.toLowerCase().includes("dinner")) {
      return "dinner"
    } else if (itemName.toLowerCase().includes("sweets")) {
      // For sweets, check specific types
      if (itemName.toLowerCase().includes("lapshi")) {
        return "lapshi"
      } else if (itemName.toLowerCase().includes("payasam")) {
        return "payasam"
      } else if (itemName.toLowerCase().includes("puran")) {
        return "puran-poli"
      } else if (itemName.toLowerCase().includes("shira")) {
        return "shira"
      }
    }
    return "brunch" // Default to brunch if not specified
  }

  // Parse the order data from the textarea
  const parseOrderData = () => {
    try {
      // Split by lines and filter out empty lines
      const lines = orderData.split("\n").filter((line) => line.trim() !== "")

      if (lines.length < 2) {
        setErrors(["Invalid data format. Please ensure you have headers and at least one order."])
        return
      }

      // Get headers (first line)
      const headers = lines[0].split("\t")

      // Parse each line into an object
      const orders: any[] = []
      const orderMap: Record<string, any> = {}

      // Start from the second line (skip headers)
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split("\t")

        // Create an object with header keys and values
        const order: Record<string, any> = {}
        headers.forEach((header, index) => {
          order[header] = values[index] || ""
        })

        // Skip if no order number
        if (!order["Order Number"]) continue

        // Group items by order number
        const orderNumber = order["Order Number"]

        if (!orderMap[orderNumber]) {
          orderMap[orderNumber] = {
            orderNumber,
            status: order["Order Status"],
            date: order["Order Date"],
            customerName: `${order["First Name (Billing)"]} ${order["Last Name (Billing)"]}`.trim(),
            email: order["Email (Billing)"],
            phone: order["Phone (Billing)"],
            total: Number.parseFloat(order["Order Total Amount"]) || 0,
            paymentMethod: order["Payment Method Title"],
            items: [],
          }
        }

        // Add item to the order
        if (order["Item Name"]) {
          orderMap[orderNumber].items.push({
            name: order["Item Name"],
            quantity: Number.parseInt(order["Quantity (- Refund)"]) || 1,
            price: Number.parseFloat(order["Item Cost"]) || 0,
          })
        }
      }

      // Convert the map to an array
      const parsedOrders = Object.values(orderMap)
      setParsedOrders(parsedOrders)
      setIsParsed(true)

      console.log(
        `Parsed ${parsedOrders.length} orders with ${parsedOrders.reduce((sum, order) => sum + order.items.length, 0)} items`,
      )

      return parsedOrders
    } catch (error) {
      console.error("Error parsing order data:", error)
      setErrors([`Error parsing order data: ${error.message}`])
      return []
    }
  }

  // Clear all imported orders (for testing)
  const clearImportedOrders = async () => {
    if (!confirm("Are you sure you want to delete all imported orders? This cannot be undone.")) {
      return
    }

    setIsImporting(true)
    try {
      const orders = await OrderStorage.getAllOrders()
      const importedOrders = orders.filter((order) => order.id.startsWith("imported_"))

      let deleted = 0
      for (const order of importedOrders) {
        await OrderStorage.deleteOrder(order.id)
        deleted++
        setProgress(Math.round((deleted / importedOrders.length) * 100))
      }

      alert(`Successfully deleted ${deleted} imported orders.`)
      await loadExistingOrders()
    } catch (error) {
      console.error("Error deleting imported orders:", error)
      alert(`Error deleting orders: ${error.message}`)
    } finally {
      setIsImporting(false)
      setProgress(0)
    }
  }

  // Import orders to Supabase
  const importOrders = async () => {
    // Parse the data first if not already parsed
    if (!isParsed) {
      const parsed = parseOrderData()
      if (!parsed || parsed.length === 0) {
        return
      }
    }

    setIsImporting(true)
    setProgress(0)
    setSuccessCount(0)
    setErrorCount(0)
    setErrors([])
    setIsComplete(false)
    setImportedOrderIds([])

    // Process all orders sequentially to ensure reliability
    const totalOrders = parsedOrders.length
    const newImportedIds: string[] = []

    for (let i = 0; i < totalOrders; i++) {
      const order = parsedOrders[i]
      try {
        // Generate a consistent ID for this order to prevent duplicates
        const orderId = `imported_${order.orderNumber}`

        // Skip if this order ID already exists
        if (existingOrders.includes(orderId)) {
          console.log(`Skipping order ${orderId} as it already exists`)
          setErrorCount((prev) => prev + 1)
          setErrors((prev) => [...prev, `Order ${orderId} already exists in the database`])
          continue
        }

        // Extract customer info
        const customerName = order.customerName
        const customerEmail = order.email
        const customerPhone = order.phone

        // Extract order info
        const orderDate = new Date(order.date).toISOString()
        const orderStatus = mapOrderStatus(order.status)
        const orderTotal = order.total

        // Create items array
        const items = order.items.map((item) => {
          const mealType = getMealType(item.name)
          const isSubscription = isSubscriptionOrder(item.name)

          return {
            productId: mealType,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            subscriptionOption: isSubscription ? "monthly-1" : "one-time",
            subscriptionDays: isSubscription ? 30 : undefined,
          }
        })

        // Determine primary meal type from the first item
        const primaryItem = order.items[0] || {}
        const mealType = getMealType(primaryItem.name)
        const isSubscription = isSubscriptionOrder(primaryItem.name)

        // Create order data object
        const orderData = {
          id: orderId,
          createdAt: orderDate,
          status: orderStatus,
          customerInfo: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            notes: "",
            zipcode: "",
            hasVoiceNote: false,
          },
          locationInfo: {
            address: "Isha Yoga Center, Coimbatore",
            lat: 11.0168, // Default coordinates
            lng: 76.9558,
            mapUrl: "",
          },
          paymentInfo: {
            method: order.paymentMethod,
            transactionId: `import_${order.orderNumber}`,
            amount: orderTotal,
          },
          items: items,
          total: orderTotal,
          mealType: mealType,
          planType: isSubscription ? "monthly-1" : "one-time",
          mealQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
          deliveryFrequency: isSubscription ? "Daily - 1 Month" : "One-time",
        }

        // Save order to Supabase
        const success = await OrderStorage.saveOrder(orderData)

        if (success) {
          setSuccessCount((prev) => prev + 1)
          newImportedIds.push(orderId)
          // Add to existing orders to prevent duplicates in this session
          setExistingOrders((prev) => [...prev, orderId])
        } else {
          setErrorCount((prev) => prev + 1)
          setErrors((prev) => [...prev, `Failed to save order ${orderId}`])
        }
      } catch (error) {
        console.error("Error importing order:", error)
        setErrorCount((prev) => prev + 1)
        setErrors((prev) => [...prev, `Error importing order ${order.orderNumber}: ${error.message}`])
      }

      // Update progress
      setProgress(Math.round(((i + 1) / totalOrders) * 100))

      // Small delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setImportedOrderIds(newImportedIds)
    setIsImporting(false)
    setIsComplete(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => router.push("/admin")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
        </Button>
        <h1 className="text-2xl font-bold text-amber-800">Import Orders</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Import Orders from Data</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadExistingOrders} disabled={isLoadingExisting}>
                <RefreshCw className="h-4 w-4 mr-1" />
                {isLoadingExisting ? "Loading..." : "Refresh"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearImportedOrders}
                disabled={isImporting || isLoadingExisting}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Clear Imported
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isParsed ? (
              <>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600 mb-2">
                    Paste your order data below. The data should be tab-separated with headers in the first row.
                  </p>
                  <p className="text-sm text-gray-600">
                    Found {existingOrders.filter((id) => id.startsWith("imported_")).length} previously imported orders.
                  </p>
                </div>
                <Textarea
                  value={orderData}
                  onChange={(e) => setOrderData(e.target.value)}
                  placeholder="Paste your order data here..."
                  className="min-h-[300px] font-mono text-xs"
                />
                <Button
                  onClick={parseOrderData}
                  className="w-full bg-amber-700 hover:bg-amber-800"
                  disabled={!orderData.trim() || isLoadingExisting}
                >
                  <Upload className="mr-2 h-4 w-4" /> Parse Order Data
                </Button>
              </>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Orders to import:</span>
                    <span>{parsedOrders.length}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Successfully parsed {parsedOrders.length} orders with{" "}
                    {parsedOrders.reduce((sum, order) => sum + order.items.length, 0)} items.
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {parsedOrders.filter((o) => existingOrders.includes(`imported_${o.orderNumber}`)).length} orders
                    already exist in the database and will be skipped.
                  </p>
                </div>

                <Button
                  onClick={importOrders}
                  className="w-full bg-amber-700 hover:bg-amber-800"
                  disabled={isImporting || isLoadingExisting}
                >
                  {isImporting ? "Importing..." : "Import Orders"}
                </Button>

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {progress}%</span>
                      <span>
                        {successCount} successful / {errorCount} failed
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {isComplete && (
                  <div className={`p-4 rounded-md ${errorCount > 0 ? "bg-yellow-50" : "bg-green-50"}`}>
                    <div className="flex items-start">
                      {errorCount > 0 ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      )}
                      <div>
                        <h3 className={`font-medium ${errorCount > 0 ? "text-yellow-800" : "text-green-800"}`}>
                          Import Complete
                        </h3>
                        <p className={`text-sm ${errorCount > 0 ? "text-yellow-700" : "text-green-700"}`}>
                          Successfully imported {successCount} orders.
                          {errorCount > 0 && ` Failed to import ${errorCount} orders.`}
                        </p>
                        {importedOrderIds.length > 0 && (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-sm"
                            onClick={() => setShowImportedOrders(!showImportedOrders)}
                          >
                            {showImportedOrders ? "Hide" : "Show"} imported order IDs
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {showImportedOrders && importedOrderIds.length > 0 && (
                  <div className="mt-4 bg-gray-50 p-2 rounded-md max-h-40 overflow-y-auto">
                    <ul className="text-xs font-mono">
                      {importedOrderIds.map((id) => (
                        <li key={id}>{id}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-red-600 mb-2">Errors ({errors.length})</h3>
                <div className="max-h-40 overflow-y-auto bg-red-50 p-2 rounded-md">
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {errors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {errors.length > 10 && <li>...and {errors.length - 10} more errors</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/orders")}>
          View Orders Dashboard
        </Button>

        <Button onClick={() => router.push("/")} className="bg-amber-700 hover:bg-amber-800">
          Go to Homepage
        </Button>
      </div>
    </div>
  )
}
