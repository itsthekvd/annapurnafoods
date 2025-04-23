"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Eye, Filter, RefreshCw, AlertTriangle } from "lucide-react"
import { OrderStorage } from "@/lib/order-storage"
import type { OrderData } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { checkSupabaseConfig } from "@/lib/supabase-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define order statuses
const ORDER_STATUSES = {
  PAID_PENDING: "order_paid_pending",
  CONFIRMED: "order_confirmed",
  PREPARING: "order_preparing",
  PACKING: "order_packing",
  EN_ROUTE: "order_en_route",
  DELIVERED: "order_delivered",
  TEST_ORDER: "test_order",
}

// Status display names
const STATUS_DISPLAY_NAMES = {
  [ORDER_STATUSES.PAID_PENDING]: "Paid & Pending",
  [ORDER_STATUSES.CONFIRMED]: "Order Confirmed",
  [ORDER_STATUSES.PREPARING]: "Preparing",
  [ORDER_STATUSES.PACKING]: "Packing",
  [ORDER_STATUSES.EN_ROUTE]: "En Route",
  [ORDER_STATUSES.DELIVERED]: "Delivered",
  [ORDER_STATUSES.TEST_ORDER]: "Test Order",
  completed: "Completed",
  pending: "Pending",
  payment_completed: "Payment Completed",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const isMobile = useMobile()
  const toast = useToast() // Initialize useToast here

  // Mobile view state
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "delivered">("all")

  // Check Supabase configuration on mount
  useEffect(() => {
    const isConfigured = checkSupabaseConfig()
    setSupabaseConfigured(isConfigured)

    if (!isConfigured) {
      setError("Supabase is not properly configured. Check console for details.")
    }
  }, [])

  // Load orders on component mount
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Loading orders from Supabase...")
      // Get orders from Supabase
      const allOrders = await OrderStorage.getAllOrders()

      // Log for debugging
      console.log("Loaded orders:", allOrders.length)

      if (allOrders.length === 0) {
        console.log("No orders found.")
      }

      // Sort by date (newest first)
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setOrders(allOrders)
    } catch (error) {
      console.error("Error loading orders:", error)
      setError("Failed to load orders. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter orders based on search term, status filter, and active tab
  const filteredOrders = orders.filter((order) => {
    // Apply search filter
    const searchMatch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo.email && order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.mealType && order.mealType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.planType && order.planType.toLowerCase().includes(searchTerm.toLowerCase()))

    // Apply status filter
    const statusMatch = statusFilter ? order.status === statusFilter : true

    // Apply tab filter for mobile
    let tabMatch = true
    if (isMobile) {
      if (activeTab === "pending") {
        tabMatch = order.status === ORDER_STATUSES.PAID_PENDING || order.status === "pending"
      } else if (activeTab === "confirmed") {
        tabMatch =
          order.status === ORDER_STATUSES.CONFIRMED ||
          order.status === ORDER_STATUSES.PREPARING ||
          order.status === ORDER_STATUSES.PACKING ||
          order.status === ORDER_STATUSES.EN_ROUTE
      } else if (activeTab === "delivered") {
        tabMatch = order.status === ORDER_STATUSES.DELIVERED || order.status === "completed"
      }
    }

    return searchMatch && statusMatch && tabMatch
  })

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

        toast.toast({
          title: "Status updated",
          description: `Order status has been updated to ${STATUS_DISPLAY_NAMES[newStatus] || newStatus}`,
        })
      } else {
        toast.toast({
          title: "Update failed",
          description: "Failed to update order status. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.toast({
        title: "Error",
        description: "An error occurred while updating the order status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Render mobile order card
  const renderMobileOrderCard = (order: OrderData) => {
    return (
      <Card key={order.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{order.customerInfo.name}</h3>
              <p className="text-xs text-gray-500">{order.customerInfo.phone}</p>
            </div>
            <div>{getStatusBadge(order.status)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <p className="text-gray-500">Order ID:</p>
              <p className="font-mono text-xs truncate">{order.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Date:</p>
              <p className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Meal:</p>
              <p>{order.mealType || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Plan:</p>
              <p>{order.planType || "One-time"}</p>
            </div>
            <div>
              <p className="text-gray-500">Total:</p>
              <p className="font-medium">₹{order.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Per Meal:</p>
              <p>₹{calculatePerMealCost(order).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Select
              value={order.status}
              onValueChange={(value) => handleStatusChange(order.id, value)}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ORDER_STATUSES.PAID_PENDING}>Paid & Pending</SelectItem>
                <SelectItem value={ORDER_STATUSES.CONFIRMED}>Confirmed</SelectItem>
                <SelectItem value={ORDER_STATUSES.PREPARING}>Preparing</SelectItem>
                <SelectItem value={ORDER_STATUSES.PACKING}>Packing</SelectItem>
                <SelectItem value={ORDER_STATUSES.EN_ROUTE}>En Route</SelectItem>
                <SelectItem value={ORDER_STATUSES.DELIVERED}>Delivered</SelectItem>
                <SelectItem value={ORDER_STATUSES.TEST_ORDER}>Test Order</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="w-full" onClick={() => viewOrderDetails(order)}>
              <Eye className="h-4 w-4 mr-2" /> View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amber-800">Order Management</h1>
      </div>

      {!supabaseConfigured && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Supabase Configuration Issue</h3>
                <p className="text-yellow-700 text-sm">
                  Supabase is not properly configured. Orders may not load correctly. Please check your environment
                  variables.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile View */}
      {isMobile && (
        <>
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="relative w-full mb-3">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>

              <div className="flex justify-between gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={loadOrders}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </Button>
                <Button size="sm" className="flex-1 bg-amber-700 hover:bg-amber-800" onClick={exportOrdersCSV}>
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </div>

              {showFilters && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-sm mb-2">Filter by Status</h3>
                  <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value={ORDER_STATUSES.PAID_PENDING}>Paid & Pending</SelectItem>
                      <SelectItem value={ORDER_STATUSES.CONFIRMED}>Confirmed</SelectItem>
                      <SelectItem value={ORDER_STATUSES.PREPARING}>Preparing</SelectItem>
                      <SelectItem value={ORDER_STATUSES.PACKING}>Packing</SelectItem>
                      <SelectItem value={ORDER_STATUSES.EN_ROUTE}>En Route</SelectItem>
                      <SelectItem value={ORDER_STATUSES.DELIVERED}>Delivered</SelectItem>
                      <SelectItem value={ORDER_STATUSES.TEST_ORDER}>Test Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Processing</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
              <p className="ml-3 text-amber-700">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
              <p>{error}</p>
              <Button onClick={loadOrders} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div>
              {filteredOrders.map(renderMobileOrderCard)}
              <p className="text-center text-sm text-gray-500 mt-4">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {orders.length === 0 ? (
                <div>
                  <p>No orders found in the system.</p>
                  <p className="text-sm mt-2">Complete a checkout to see orders appear here.</p>
                </div>
              ) : (
                "No orders match your search criteria"
              )}
            </div>
          )}
        </>
      )}

      {/* Desktop View */}
      {!isMobile && (
        <>
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search by order ID, name, phone, meal type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <Filter className="mr-2 h-4 w-4" /> Filter:{" "}
                      {statusFilter ? STATUS_DISPLAY_NAMES[statusFilter] || statusFilter : "All"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ORDER_STATUSES.PAID_PENDING)}>
                      <Badge className="mr-2 bg-yellow-500">Paid & Pending</Badge> Paid & Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ORDER_STATUSES.CONFIRMED)}>
                      <Badge className="mr-2 bg-green-500">Confirmed</Badge> Confirmed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ORDER_STATUSES.PREPARING)}>
                      <Badge className="mr-2 bg-blue-500">Preparing</Badge> Preparing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ORDER_STATUSES.PACKING)}>
                      <Badge className="mr-2 bg-indigo-500">Packing</Badge> Packing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ORDER_STATUSES.EN_ROUTE)}>
                      <Badge className="mr-2 bg-purple-500">En Route</Badge> En Route
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ORDER_STATUSES.DELIVERED)}>
                      <Badge className="mr-2 bg-green-700">Delivered</Badge> Delivered
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ORDER_STATUSES.TEST_ORDER)}>
                      <Badge className="mr-2 bg-gray-500">Test Order</Badge> Test Order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                      <Badge className="mr-2 bg-green-500">Completed</Badge> Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                      <Badge className="mr-2 bg-yellow-500">Pending</Badge> Pending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" onClick={loadOrders} className="w-full md:w-auto">
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>

                <Button onClick={exportOrdersCSV} className="bg-amber-700 hover:bg-amber-800 w-full md:w-auto">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
                  <p className="ml-3 text-amber-700">Loading orders...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                  <p>{error}</p>
                  <Button onClick={loadOrders} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Meal Info</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="font-medium">{order.customerInfo.name}</div>
                              <div className="text-xs">{order.customerInfo.phone}</div>
                              {order.customerInfo.email && (
                                <div className="text-xs text-gray-500">{order.customerInfo.email}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{order.mealType || "N/A"}</div>
                              <div className="text-xs">{order.planType || "One-time"}</div>
                              <div className="text-xs">Qty: {order.mealQuantity || 1}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {order.deliveryDate
                                  ? new Date(order.deliveryDate).toLocaleDateString()
                                  : "Not specified"}
                              </div>
                              <div className="text-xs">{order.deliveryFrequency || "One-time"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">₹{order.total.toFixed(2)}</div>
                              <div className="text-xs">Per meal: ₹{calculatePerMealCost(order).toFixed(2)}</div>
                              {order.couponCode && (
                                <div className="text-xs text-green-600">Coupon: {order.couponCode}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                {getStatusBadge(order.status)}
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => handleStatusChange(order.id, value)}
                                  disabled={isUpdatingStatus}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Change status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={ORDER_STATUSES.PAID_PENDING}>Paid & Pending</SelectItem>
                                    <SelectItem value={ORDER_STATUSES.CONFIRMED}>Confirmed</SelectItem>
                                    <SelectItem value={ORDER_STATUSES.PREPARING}>Preparing</SelectItem>
                                    <SelectItem value={ORDER_STATUSES.PACKING}>Packing</SelectItem>
                                    <SelectItem value={ORDER_STATUSES.EN_ROUTE}>En Route</SelectItem>
                                    <SelectItem value={ORDER_STATUSES.DELIVERED}>Delivered</SelectItem>
                                    <SelectItem value={ORDER_STATUSES.TEST_ORDER}>Test Order</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            {orders.length === 0 ? (
                              <div>
                                <p>No orders found in the system.</p>
                                <p className="text-sm mt-2">Complete a checkout to see orders appear here.</p>
                              </div>
                            ) : (
                              "No orders match your search criteria"
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
