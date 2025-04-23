"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock, X } from "lucide-react"
import Link from "next/link"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const [isVisible, setIsVisible] = useState(true)

  // Set end date to 7 days from now
  useEffect(() => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)

    const calculateTimeLeft = () => {
      const difference = +endDate - +new Date()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        // Clear the interval when the countdown reaches zero
        clearInterval(timer)
        setIsVisible(false) // Hide the timer when it's done
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[350px] bg-white rounded-md shadow-lg border border-amber-100">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-amber-700 mr-2" />
            <h3 className="font-semibold text-amber-800">Limited Time Offer</h3>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-3">Get 10% off on all subscription plans. Offer ends in:</p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-amber-50 p-2 text-center rounded">
            <div className="text-2xl font-bold text-amber-700">{timeLeft.days}</div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
          <div className="bg-amber-50 p-2 text-center rounded">
            <div className="text-2xl font-bold text-amber-700">{timeLeft.hours}</div>
            <div className="text-xs text-gray-500">Hours</div>
          </div>
          <div className="bg-amber-50 p-2 text-center rounded">
            <div className="text-2xl font-bold text-amber-700">{timeLeft.minutes}</div>
            <div className="text-xs text-gray-500">Mins</div>
          </div>
          <div className="bg-amber-50 p-2 text-center rounded">
            <div className="text-2xl font-bold text-amber-700">{timeLeft.seconds}</div>
            <div className="text-xs text-gray-500">Secs</div>
          </div>
        </div>

        <Link href="/menu">
          <Button className="bg-amber-700 hover:bg-amber-800 w-full">Claim Offer Now</Button>
        </Link>
      </div>
    </div>
  )
}
