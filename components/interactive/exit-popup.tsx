"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X, CheckCircle } from "lucide-react"
import Confetti from "react-confetti"
import { useToast } from "@/hooks/use-toast"
import trackingService from "@/lib/tracking-service"

export default function ExitPopup() {
  // DISABLED: Set this to true to enable the popup
  const POPUP_ENABLED = false

  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  })
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    whatsapp: "",
  })
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })
  const popupShownRef = useRef(false)
  const router = useRouter()
  const { toast } = useToast()

  // Set window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Initialize window size
    if (typeof window !== "undefined") {
      handleResize()
      window.addEventListener("resize", handleResize)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  // Exit intent detection - DISABLED
  useEffect(() => {
    // Early return if popup is disabled
    if (!POPUP_ENABLED) return

    if (typeof window === "undefined" || popupShownRef.current) return

    // Check if this popup has been shown before in this session
    const hasShownBefore = sessionStorage.getItem("exitPopupShown")
    if (hasShownBefore) return

    // Check if user is on a mobile device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (typeof window !== "undefined" && window.innerWidth < 768)

    // Only set up exit intent for desktop devices
    if (!isMobile) {
      const handleMouseLeave = (e: MouseEvent) => {
        // Only trigger when mouse moves to the top of the page
        if (e.clientY <= 5 && !popupShownRef.current) {
          setIsVisible(true)
          popupShownRef.current = true
        }
      }

      // Add event listener for mouse leave
      document.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        document.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: "",
      email: "",
      whatsapp: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "WhatsApp number is required"
      isValid = false
    } else if (!/^\d{10}$/.test(formData.whatsapp.replace(/\D/g, ""))) {
      newErrors.whatsapp = "Please enter a valid 10-digit number"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      // Send data to webhook using the revised approach
      trackingService.trackExitPopupSubmission({
        // Customer information - these are the critical fields
        name: formData.name,
        email: formData.email,
        phone: formData.whatsapp,
        zipcode: "",

        // Form metadata
        formType: "exit_popup",
        couponCode: "ISHA2025_45%OFF",
      })

      console.log("Exit popup form submitted successfully")
    } catch (error) {
      console.error("Error sending form data:", error)
      // Continue with form submission even if tracking fails
    }

    // Simulate API call to submit form
    setTimeout(() => {
      // Mark as shown in session storage
      sessionStorage.setItem("exitPopupShown", "true")

      // Show success state with confetti
      setIsSubmitted(true)

      // Redirect to menu page after a delay
      setTimeout(() => {
        router.push("/menu")
      }, 3000)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleClose = () => {
    setIsVisible(false)
    // Mark as shown in session storage
    sessionStorage.setItem("exitPopupShown", "true")
  }

  // Early return if popup is disabled or not visible
  if (!POPUP_ENABLED || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {isSubmitted ? (
            // Success state with confetti
            <Card className="border-green-200 shadow-xl">
              <CardContent className="p-6 text-center">
                <Confetti
                  width={windowSize.width}
                  height={windowSize.height}
                  recycle={false}
                  numberOfPieces={500}
                  gravity={0.2}
                />
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">Thank You!</h2>
                <p className="text-gray-600 mb-4">
                  Your exclusive <span className="font-bold">ISHA2025_45%OFF</span> coupon code has been sent to your
                  email and WhatsApp. Check your inbox!
                </p>
                <p className="text-sm text-gray-500 mb-4">Redirecting you to our menu...</p>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            // Form state
            <Card className="border-amber-200 shadow-xl">
              <CardContent className="p-0">
                <div className="bg-amber-700 text-white p-4 relative">
                  <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-white/80 hover:text-white"
                    aria-label="Close popup"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-bold mb-1">Wait! Don't Miss Out!</h2>
                  <p className="text-amber-100">
                    Sign up now and get <span className="font-bold text-white text-2xl">45% OFF</span> your first order!
                  </p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="Enter your WhatsApp number"
                        className={errors.whatsapp ? "border-red-500" : ""}
                      />
                      {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800">
                      Get My 45% OFF Coupon
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      We'll send your coupon code via email and WhatsApp. No spam, promise!
                    </p>
                  </form>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
