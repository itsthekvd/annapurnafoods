"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-amber-800 mb-4">Something went wrong!</h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        We apologize for the inconvenience. Please try again or return to the home page.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={reset} className="bg-amber-700 hover:bg-amber-800">
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline" className="border-amber-700 text-amber-700">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
