"use client"

import { useState } from "react"
import { generateHowToSchema } from "@/lib/schema-utils"
import Script from "next/script"

interface CookingStep {
  name: string
  text: string
}

interface CookingInstructionsProps {
  productName: string
  productType: string
  steps: CookingStep[]
}

export default function CookingInstructions({ productName, productType, steps = [] }: CookingInstructionsProps) {
  const [showInstructions, setShowInstructions] = useState(false)

  // Default steps if none provided
  const defaultSteps = [
    { name: "Preparation", text: "Open the package carefully." },
    { name: "Serving", text: "Serve at room temperature for best taste." },
  ]

  const cookingSteps = steps.length > 0 ? steps : defaultSteps

  // Generate HowTo schema
  const howToSchema = generateHowToSchema({
    name: `How to Prepare ${productName}`,
    description: `Step-by-step instructions for preparing ${productName}`,
    steps: cookingSteps,
    totalTime: "PT10M", // Default 10 minutes
  })

  return (
    <div className="mt-6 border rounded-lg p-4 bg-amber-50">
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="flex items-center justify-between w-full font-medium text-lg"
      >
        <span>Cooking/Preparation Instructions</span>
        <span>{showInstructions ? "−" : "+"}</span>
      </button>

      {showInstructions && (
        <div className="mt-4">
          <ol className="list-decimal pl-5 space-y-2">
            {cookingSteps.map((step, index) => (
              <li key={index} className="pl-2">
                <strong>{step.name}:</strong> {step.text}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Add the structured data */}
      <Script
        id={`howto-cooking-schema-${productName.replace(/\s+/g, "-").toLowerCase()}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
    </div>
  )
}
