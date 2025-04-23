"use client"

import { useEffect } from "react"
import { initializeImageCache } from "@/lib/image-utils"

export default function ImageCacheInitializer() {
  useEffect(() => {
    // Initialize the image cache when the app loads
    initializeImageCache()
  }, [])

  // This component doesn't render anything
  return null
}
