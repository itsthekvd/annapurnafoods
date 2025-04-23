"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const juiceImages = [
  {
    src: "https://ucarecdn.com/9f37a2cb-f2b4-4d08-af38-e8005924fbae/beetrootjuice01.jpg",
    alt: "Beetroot Juice",
  },
  {
    src: "https://ucarecdn.com/17df8c46-1007-4238-a567-79b7a8dcff77/buttermilk.jpg",
    alt: "Buttermilk",
  },
  {
    src: "https://ucarecdn.com/a42f1691-149d-4b24-a481-946363f16321/cucumberjuice.jpg",
    alt: "Cucumber Juice",
  },
]

function JuiceSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Auto-rotate images
  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % juiceImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + juiceImages.length) % juiceImages.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % juiceImages.length)
  }

  // Fallback to placeholder if images aren't available
  const currentImage = juiceImages[currentIndex] || {
    src: "/placeholder.svg?height=400&width=600&text=Fresh+Juices",
    alt: "Fresh Juices",
  }

  return (
    <div className="relative w-full h-full">
      {/* Current image with fade transition */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <Image
          src={currentImage.src || "/placeholder.svg"}
          alt={currentImage.alt}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-md z-10"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6 text-amber-700" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-md z-10"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6 text-amber-700" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {juiceImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-amber-700" : "bg-white/70"}`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function JuiceSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-xl">
            <JuiceSlider />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-amber-800 mb-6">
              Complimentary Sweet Health Juice with ALL Subscriptions
            </h2>
            <p className="text-gray-600 mb-6">
              Fresh fruits and vegetables squeezed into an experience that leaves you fulfilled to the core!
            </p>
            <Link href="/menu">
              <Button className="bg-amber-700 hover:bg-amber-800">Check Out Menu</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
