"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getImageUrlWithFallback, initializeImageCache } from "@/lib/image-utils"

export default function ImageShowcase() {
  const [backgroundImage, setBackgroundImage] = useState(getImageUrlWithFallback("brunch"))

  useEffect(() => {
    // Initialize the image cache when the component mounts
    initializeImageCache().then((cache) => {
      if (cache["brunch"]) {
        setBackgroundImage(cache["brunch"])
      }
    })
  }, [])

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-amber-900/50 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Experience Authentic Sattvik Cuisine</h2>
          <p className="text-lg text-amber-50 mb-8">
            Freshly prepared with love and care by Isha Volunteers. Nourish your body and soul with our traditional
            recipes.
          </p>
          <Link href="/menu">
            <Button className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-6 text-lg">Explore Our Menu</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
