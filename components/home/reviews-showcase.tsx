"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  name: string
  avatar: string
  rating: number
  text: string
  platform: "google" | "trustpilot" | "justdial" | "yellowpages"
  date: string
}

const reviews: Review[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    avatar: "/diverse-group-city.png",
    rating: 5,
    text: "The food is just like what we get at the Isha Yoga Center. Pure Sattvik and so fulfilling. I feel energized after every meal.",
    platform: "google",
    date: "2 weeks ago",
  },
  {
    id: "2",
    name: "Priya Sharma",
    avatar: "/diverse-group-city.png",
    rating: 5,
    text: "As a busy volunteer, I don't get time to cook. Annapurna Foods has been a blessing. The subscription plan is so convenient!",
    platform: "trustpilot",
    date: "1 month ago",
  },
  {
    id: "3",
    name: "Arun Patel",
    avatar: "/diverse-group-city.png",
    rating: 4,
    text: "The special health juices that come with the subscription are amazing. I can feel the difference in my energy levels.",
    platform: "justdial",
    date: "3 weeks ago",
  },
  {
    id: "4",
    name: "Meena Iyer",
    avatar: "/diverse-group-city.png",
    rating: 5,
    text: "I've tried many food delivery services, but Annapurna Foods stands out for its quality and taste. Truly authentic Sattvik food!",
    platform: "google",
    date: "1 week ago",
  },
  {
    id: "5",
    name: "Suresh Menon",
    avatar: "/diverse-group-city.png",
    rating: 5,
    text: "The Puran Poli is just like my mother used to make. Brings back childhood memories. Will order again!",
    platform: "yellowpages",
    date: "2 months ago",
  },
]

const platformColors = {
  google: "bg-blue-100 text-blue-800",
  trustpilot: "bg-green-100 text-green-800",
  justdial: "bg-orange-100 text-orange-800",
  yellowpages: "bg-yellow-100 text-yellow-800",
}

const platformNames = {
  google: "Google",
  trustpilot: "TrustPilot",
  justdial: "JustDial",
  yellowpages: "Yellow Pages",
}

export default function ReviewsShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const handlePrevious = () => {
    setAutoplay(false)
    setActiveIndex((current) => (current - 1 + reviews.length) % reviews.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setActiveIndex((current) => (current + 1) % reviews.length)
  }

  const handleDotClick = (index: number) => {
    setAutoplay(false)
    setActiveIndex(index)
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-amber-800 mb-4">What Our Customers Say</h2>
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-amber-500 fill-amber-500" />
              ))}
            </div>
            <span className="text-lg font-semibold">4.9/5</span>
            <span className="text-gray-600">from 200+ reviews</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {Object.entries(platformNames).map(([key, name]) => (
              <Badge
                key={key}
                className={cn("text-sm py-1 px-3", platformColors[key as keyof typeof platformColors])}
                variant="outline"
              >
                {name}
              </Badge>
            ))}
          </div>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Listen to our audio testimonials</h3>
              <p className="text-sm text-gray-600 mb-2">Hear what our customers have to say about Annapurna Foods</p>
              <a
                href="https://soundcloud.com/annapurnafood/heres-what-our-meditators-say"
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center"
              >
                <span>Listen on SoundCloud</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 z-10 md:-translate-x-full">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-6 w-6 text-amber-700" />
            </button>
          </div>

          <div className="overflow-hidden">
            <Card className="border-amber-200">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-200">
                      <Image
                        src={reviews[activeIndex].avatar || "/placeholder.svg"}
                        alt={reviews[activeIndex].name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{reviews[activeIndex].name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < reviews[activeIndex].rating ? "text-amber-500 fill-amber-500" : "text-gray-300",
                                )}
                              />
                            ))}
                          </div>
                          <Badge
                            className={cn("text-xs", platformColors[reviews[activeIndex].platform])}
                            variant="outline"
                          >
                            {platformNames[reviews[activeIndex].platform]}
                          </Badge>
                          <span className="text-sm text-gray-500">{reviews[activeIndex].date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg italic">"{reviews[activeIndex].text}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-10 md:translate-x-full">
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="h-6 w-6 text-amber-700" />
            </button>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === activeIndex ? "bg-amber-700" : "bg-amber-200",
                )}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
