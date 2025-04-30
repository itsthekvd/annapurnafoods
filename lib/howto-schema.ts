export interface HowToStep {
  name: string
  text: string
  image?: string
  url?: string
}

export interface HowToSchema {
  "@context": "https://schema.org"
  "@type": "HowTo"
  name: string
  description: string
  image?: string
  totalTime?: string
  estimatedCost?: {
    "@type": "MonetaryAmount"
    currency: string
    value: string
  }
  supply?: string[]
  tool?: string[]
  step: {
    "@type": "HowToStep"
    name: string
    text: string
    image?: string
    url?: string
  }[]
}

/**
 * Generate HowTo schema for cooking instructions
 */
export function generateCookingHowToSchema(
  productName: string,
  description: string,
  steps: HowToStep[],
  imageUrl?: string,
  totalTime?: string,
  supplies?: string[],
  tools?: string[],
): HowToSchema {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Prepare ${productName}`,
    description: description || `Step-by-step instructions for preparing ${productName}`,
    image: imageUrl,
    totalTime: totalTime,
    estimatedCost: undefined,
    supply: supplies,
    tool: tools,
    step: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      image: step.image,
      url: step.url,
    })),
  }
}

/**
 * Generate HowTo schema for delivery instructions
 */
export function generateDeliveryHowToSchema(
  productName: string,
  description: string,
  steps: HowToStep[],
  imageUrl?: string,
): HowToSchema {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Handle ${productName} Delivery`,
    description: description || `Step-by-step instructions for handling the delivery of ${productName}`,
    image: imageUrl,
    step: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      image: step.image,
      url: step.url,
    })),
  }
}

/**
 * Generate default cooking steps based on product type
 */
export function getDefaultCookingSteps(productType: string): HowToStep[] {
  switch (productType.toLowerCase()) {
    case "sweet":
      return [
        {
          name: "Store properly",
          text: "Store in a cool, dry place away from direct sunlight.",
        },
        {
          name: "Serve at room temperature",
          text: "For best taste, allow sweets to come to room temperature before serving.",
        },
        {
          name: "Portion appropriately",
          text: "Cut into small pieces for serving to preserve freshness of remaining portions.",
        },
      ]
    case "juice":
      return [
        {
          name: "Refrigerate immediately",
          text: "Store juice in refrigerator as soon as possible.",
        },
        {
          name: "Shake well",
          text: "Shake well before serving as natural ingredients may settle.",
        },
        {
          name: "Serve chilled",
          text: "Pour into a glass with ice for best taste experience.",
        },
      ]
    case "snack":
      return [
        {
          name: "Store properly",
          text: "Keep in an airtight container to maintain freshness.",
        },
        {
          name: "Serve fresh",
          text: "Best enjoyed within a few days of receiving.",
        },
        {
          name: "Serving suggestion",
          text: "Pair with tea or coffee for an enhanced experience.",
        },
      ]
    default:
      return [
        {
          name: "Store properly",
          text: "Store in appropriate conditions as mentioned on the package.",
        },
        {
          name: "Check freshness",
          text: "Check for freshness before consuming.",
        },
        {
          name: "Enjoy responsibly",
          text: "Savor the authentic taste of traditional preparation.",
        },
      ]
  }
}

/**
 * Generate default delivery steps
 */
export function getDefaultDeliverySteps(): HowToStep[] {
  return [
    {
      name: "Receive package",
      text: "Accept the delivery and check for any visible damage to the packaging.",
    },
    {
      name: "Inspect contents",
      text: "Open the package carefully and inspect the contents to ensure everything is in good condition.",
    },
    {
      name: "Store properly",
      text: "Store the products according to the instructions provided with each item.",
    },
    {
      name: "Refrigerate if needed",
      text: "Some items may require immediate refrigeration. Check product labels for storage instructions.",
    },
  ]
}
