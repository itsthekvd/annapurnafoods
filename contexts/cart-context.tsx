"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useCoupon } from "@/contexts/coupon-context"
import { useTracking } from "@/contexts/tracking-context"
import { subscriptionOptions } from "@/lib/data"

export interface CartItem {
  product: Product
  quantity: number
  subscriptionOption?: string
  subscriptionDays?: number
}

interface DeliveryFeeResult {
  valid: boolean
  message: string
}

export interface CartContextType {
  items: CartItem[]
  addItem: (
    product: Product,
    quantity?: number,
    subscriptionMonths?: number,
    subscriptionOption?: string,
    subscriptionDays?: number,
  ) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string, subscriptionOption?: string) => void
  updateSubscription: (productId: string, subscriptionOption: string, subscriptionDays: number) => void
  clearCart: () => void
  subtotal: number
  deliveryFee: number
  total: number
  itemCount: number
  orderId: string | null
  updateDeliveryFee: (zipcode: string) => DeliveryFeeResult
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [orderId, setOrderId] = useState<string | null>(null)
  const [deliveryFeeAmount, setDeliveryFeeAmount] = useState(30) // Default delivery fee
  const [isInitialized, setIsInitialized] = useState(false)

  const { toast } = useToast()
  const { calculateDiscountedPrice, appliedCoupon } = useCoupon()
  const { trackAddToCart, trackRemoveFromCart, createOrder, updateOrder, getCurrentActiveOrder } = useTracking()

  // Load cart from localStorage on initial render
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = localStorage.getItem("annapurna-cart")
        if (!savedCart) return

        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          console.log("Loading cart from localStorage:", parsedCart)
          setItems(parsedCart)

          // Check if we have an active order
          const activeOrder = getCurrentActiveOrder()
          if (activeOrder) {
            setOrderId(activeOrder.orderId)
            // Update order items if they've changed
            updateOrder(activeOrder.orderId, { items: parsedCart })
          } else if (parsedCart.length > 0) {
            // Create a new order if we have items but no active order
            const newOrderId = createOrder(parsedCart)
            setOrderId(newOrderId)
          }
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error)
      }
    }

    // Load cart immediately
    loadCartFromStorage()

    // Also listen for storage events (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "annapurna-cart") {
        loadCartFromStorage()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [getCurrentActiveOrder, createOrder, updateOrder])

  // Ensure cart is properly initialized
  useEffect(() => {
    if (!isInitialized && typeof window !== "undefined") {
      const savedCart = localStorage.getItem("annapurna-cart")
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          if (parsedCart.length > 0 && items.length === 0) {
            // If we have items in localStorage but not in state, set them again
            setItems(parsedCart)
            console.log("Re-initialized cart from localStorage", parsedCart)
          }
        } catch (error) {
          console.error("Failed to re-initialize cart from localStorage", error)
        }
      }
      setIsInitialized(true)
    }
  }, [isInitialized, items.length])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("annapurna-cart", JSON.stringify(items))

    // Update order items if we have an active order
    if (orderId && items.length > 0) {
      updateOrder(orderId, { items })
    }
  }, [items, orderId, updateOrder])

  // Calculate delivery fee based on zipcode
  const updateDeliveryFee = useCallback((zipcode: string): DeliveryFeeResult => {
    if (!zipcode || zipcode.length !== 6) {
      setDeliveryFeeAmount(30) // Default fee
      return { valid: false, message: "Please enter a valid 6-digit pincode" }
    }

    // Check if pincode starts with 641 or 642
    if (!zipcode.startsWith("641") && !zipcode.startsWith("642")) {
      setDeliveryFeeAmount(0) // Set to 0 as we don't deliver here
      return { valid: false, message: "Sorry, we don't deliver to this location" }
    }

    // Special pincodes with ₹30 delivery fee
    const specialPincodes = ["641114", "641101", "641109"]

    if (specialPincodes.includes(zipcode)) {
      setDeliveryFeeAmount(30)
      return { valid: true, message: "Delivery available to this area (₹30)" }
    } else {
      // Other pincodes starting with 641 or 642
      setDeliveryFeeAmount(70)
      return { valid: true, message: "Delivery available to this area (₹70)" }
    }
  }, [])

  // Add item to cart
  const addItem = useCallback(
    (
      product: Product,
      quantity = 1,
      subscriptionMonths?: number,
      subscriptionOption?: string,
      subscriptionDays?: number,
    ) => {
      setItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.product.id === product.id && item.subscriptionOption === subscriptionOption,
        )

        let updatedItems

        if (existingItemIndex >= 0) {
          // Update existing item
          updatedItems = [...prevItems]
          if (subscriptionOption) {
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              subscriptionOption,
              subscriptionDays,
            }
          } else {
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
            }
          }
        } else {
          // Add new item
          updatedItems = [
            ...prevItems,
            {
              product,
              quantity,
              ...(subscriptionOption && { subscriptionOption, subscriptionDays }),
            },
          ]
        }

        // Track the add to cart event
        trackAddToCart(product, quantity)

        // Create a new order if we don't have one yet
        if (!orderId && updatedItems.length > 0) {
          const newOrderId = createOrder(updatedItems)
          setOrderId(newOrderId)
        }

        // Immediately update localStorage
        localStorage.setItem("annapurna-cart", JSON.stringify(updatedItems))

        return updatedItems
      })

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    },
    [orderId, toast, trackAddToCart, createOrder],
  )

  // Update item quantity
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return

    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      return updatedItems
    })
  }, [])

  // Update subscription details
  const updateSubscription = useCallback((productId: string, subscriptionOption: string, subscriptionDays: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, subscriptionOption, subscriptionDays } : item,
      ),
    )
  }, [])

  // Remove item from cart
  const removeItem = useCallback(
    (productId: string, subscriptionOption?: string) => {
      setItems((prevItems) => {
        // Find the item to remove for tracking
        const itemToRemove = prevItems.find(
          (item) =>
            item.product.id === productId &&
            (subscriptionOption ? item.subscriptionOption === subscriptionOption : true),
        )

        if (itemToRemove) {
          // Track the remove from cart event
          trackRemoveFromCart(itemToRemove.product)
        }

        if (subscriptionOption) {
          // Remove specific subscription option
          return prevItems.filter(
            (item) => !(item.product.id === productId && item.subscriptionOption === subscriptionOption),
          )
        } else {
          // Remove all instances of this product
          return prevItems.filter((item) => item.product.id !== productId)
        }
      })

      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      })
    },
    [toast, trackRemoveFromCart],
  )

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([])
    setOrderId(null)
  }, [])

  // Memoize subtotal calculation
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      // Special case for the Rs. 1 coupon
      if (appliedCoupon?.type === "special" && appliedCoupon?.specialAction === "set_total_to_one") {
        // For this special coupon, we return exactly ₹1 for the entire order
        return 1
      }

      if (item.subscriptionOption) {
        const option = subscriptionOptions.find((opt) => opt.id === item.subscriptionOption)
        const discountPercentage = option?.discountPercentage || 0
        return sum + calculateDiscountedPrice(item.product.price, item.subscriptionDays || 1, discountPercentage)
      }
      return sum + calculateDiscountedPrice(item.product.price, item.quantity)
    }, 0)
  }, [items, appliedCoupon, calculateDiscountedPrice])

  // Memoize delivery fee calculation
  const deliveryFee = useMemo(() => {
    // If subtotal is 0 or we have the special Rs. 1 coupon, no delivery fee
    if (subtotal === 0 || (appliedCoupon?.type === "special" && appliedCoupon?.specialAction === "set_total_to_one")) {
      return 0
    }

    // Base delivery fee from zipcode validation
    const baseFee = deliveryFeeAmount

    // Calculate total number of deliveries across all subscription items
    let totalDeliveries = 0

    items.forEach((item) => {
      if (item.subscriptionOption && item.subscriptionOption !== "one-time" && item.subscriptionDays) {
        // For subscription items, count each delivery day
        totalDeliveries += item.subscriptionDays
      } else {
        // For one-time items, count as a single delivery
        totalDeliveries += 1
      }
    })

    // If there are no items with subscriptions, just return the base fee
    if (totalDeliveries === 0) {
      return baseFee
    }

    // Return the base fee multiplied by the number of deliveries
    return baseFee * totalDeliveries
  }, [subtotal, appliedCoupon, deliveryFeeAmount, items])

  // Memoize total calculation
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee])

  // Memoize item count calculation
  const itemCount = useMemo(() => items.reduce((count, item) => count + item.quantity, 0), [items])

  // Create context value with memoization
  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      updateSubscription,
      clearCart,
      subtotal,
      deliveryFee,
      total,
      itemCount,
      orderId,
      updateDeliveryFee,
    }),
    [
      items,
      addItem,
      updateQuantity,
      removeItem,
      updateSubscription,
      clearCart,
      subtotal,
      deliveryFee,
      total,
      itemCount,
      orderId,
      updateDeliveryFee,
    ],
  )

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
