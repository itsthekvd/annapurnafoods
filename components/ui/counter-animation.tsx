"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useAnimation } from "framer-motion"

interface CounterAnimationProps {
  value: number
  duration?: number
  className?: string
  formatter?: (value: number) => string
}

export function CounterAnimation({
  value,
  duration = 2,
  className = "",
  formatter = (val) => val.toLocaleString(),
}: CounterAnimationProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const controls = useAnimation()
  const previousValue = useRef(0)

  useEffect(() => {
    const startValue = previousValue.current
    const difference = value - startValue

    // Don't animate if it's the first render or the value is the same
    if (startValue === 0 || difference === 0) {
      setDisplayValue(value)
      previousValue.current = value
      return
    }

    let startTime: number | null = null

    const animateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

      // Use easeOutExpo for a nice deceleration effect
      const easeOutExpo = 1 - Math.pow(2, -10 * progress)
      const currentValue = Math.floor(startValue + difference * easeOutExpo)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animateValue)
      } else {
        setDisplayValue(value)
        previousValue.current = value
      }
    }

    requestAnimationFrame(animateValue)
  }, [value, duration])

  return <span className={className}>{formatter(displayValue)}</span>
}

// For individual digit animation
export function DigitCounter({ value, className = "" }: { value: number; className?: string }) {
  const digits = value.toString().split("")

  return (
    <div className={`flex ${className}`}>
      {digits.map((digit, index) => (
        <motion.div
          key={`${index}-${digit}`}
          className="relative inline-block w-[1ch] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            type: "spring",
            stiffness: 300,
          }}
        >
          {digit}
        </motion.div>
      ))}
    </div>
  )
}
