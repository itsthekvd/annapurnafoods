"use client"

import { createContext, useContext, type ReactNode } from "react"

// Simplified tracking context that does nothing but provides the expected interface
interface TrackingContextType {
  trackEvent: (eventType: string, data: any, orderId?: string) => void
  identifyUser: (userInfo: { name?: string; email?: string; phone?: string }) => void
  createOrder: (items: any[], couponCode?: string) => string
  updateOrder: (orderId: string, orderData: any) => any
  updateOrderStatus: (orderId: string, status: string) => any
  getCurrentActiveOrder: () => any
  trackPageView: (url: string, title: string) => void
  trackProductView: (product: any) => void
  trackAddToCart: (product: any, quantity: number) => void
  trackRemoveFromCart: (product: any) => void
  trackCheckoutStep: (step: number, orderId: string, data: any) => void
  trackOrderComplete: (orderId: string, orderData: any) => void
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

export function TrackingProvider({ children }: { children: ReactNode }) {
  // All methods are no-ops that return dummy values
  const trackEvent = () => {}
  const identifyUser = () => {}
  const createOrder = () => `order_${Date.now()}`
  const updateOrder = () => null
  const updateOrderStatus = () => null
  const getCurrentActiveOrder = () => null
  const trackPageView = () => {}
  const trackProductView = () => {}
  const trackAddToCart = () => {}
  const trackRemoveFromCart = () => {}
  const trackCheckoutStep = () => {}
  const trackOrderComplete = () => {}

  const value = {
    trackEvent,
    identifyUser,
    createOrder,
    updateOrder,
    updateOrderStatus,
    getCurrentActiveOrder,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStep,
    trackOrderComplete,
  }

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
}

export function useTracking() {
  const context = useContext(TrackingContext)
  if (context === undefined) {
    throw new Error("useTracking must be used within a TrackingProvider")
  }
  return context
}
