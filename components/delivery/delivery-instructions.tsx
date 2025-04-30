"use client"

import { useState } from "react"
import { generateHowToSchema } from "@/lib/schema-utils"
import Script from "next/script"

interface DeliveryStep {
  name: string
  text: string
}

interface DeliveryInstructionsProps {
  productName: string
  steps?: DeliveryStep[]
}

export default function DeliveryInstructions({ productName, steps = [] }: DeliveryInstructionsProps) {
  const [showInstructions, setShowInstructions] = useState(false)

  // Default delivery steps
  const defaultSteps = [
    { name: "Receiving", text: "Check the package for any damage upon delivery." },
    { name: "Storage", text: "Store in a cool, dry place or refrigerate as needed." },
    { name: "Freshness", text: "Consume within the recommended time period for best quality." },
  ]

  const deliverySteps = steps.length > 0 ? steps : defaultSteps

  // Generate HowTo schema
  const howToSchema = generateHowToSchema({
    name: `How to Handle ${productName} Delivery`,
    description: `Instructions for receiving and handling ${productName} delivery`,
    steps: deliverySteps,
  })

  return (
    <div className="mt-4 border rounded-lg p-4 bg-blue-50">
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="flex items-center justify-between w-full font-medium text-lg"
      >
        <span>Delivery & Storage Instructions</span>
        <span>{showInstructions ? "−" : "+"}</span>
      </button>

      {showInstructions && (
        <div className="mt-4">
          <ol className="list-decimal pl-5 space-y-2">
            {deliverySteps.map((step, index) => (
              <li key={index} className="pl-2">
                <strong>{step.name}:</strong> {step.text}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Add the structured data */}
      <Script
        id={`howto-delivery-schema-${productName.replace(/\s+/g, "-").toLowerCase()}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
    </div>
  )
}
