import type { Product } from "./types"

/**
 * Schema.org utility functions for generating structured data
 * This helps search engines understand our content better
 */

// Function to get the base URL dynamically
export function getBaseUrl() {
  // Use the environment variable if available
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "") // Remove trailing slash if present
  }

  // Fallback to default domain
  return "https://annapurna.food"
}

// Website schema for overall site information
export function generateWebsiteSchema() {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Annapurna Foods",
    description: "Sattvik home-cooked food delivery service near Isha Yoga Center in Coimbatore",
    publisher: {
      "@type": "Organization",
      name: "Annapurna Foods",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/menu?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    ],
    inLanguage: "en-IN",
  }
}

// Organization schema for the business entity
export function generateOrganizationSchema() {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Annapurna Foods",
    alternateName: "Annapurna Tiffin Service",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    image: [
      "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
      "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Dinnercropped.jpg",
    ],
    description: "Sattvik home-cooked food delivery service near Isha Yoga Center in Coimbatore.",
    email: "contact@annapurna.food",
    telephone: "+918300615054",
    sameAs: ["https://www.facebook.com/annapurnafoods", "https://www.instagram.com/annapurnafoods"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "42/1, Devi Nagar, Alandurai",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      postalCode: "641101",
      addressCountry: "IN",
    },
    foundingDate: "2023",
    founders: [
      {
        "@type": "Person",
        name: "Isha Volunteer",
      },
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Coimbatore",
        containsPlace: [
          {
            "@type": "Place",
            name: "Alandurai",
          },
          {
            "@type": "Place",
            name: "Narsipuram",
          },
          {
            "@type": "Place",
            name: "Irrutupalam",
          },
          {
            "@type": "Place",
            name: "Madhapati",
          },
          {
            "@type": "Place",
            name: "Isha Yoga Center",
          },
        ],
      },
    ],
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/menu`,
        inLanguage: "en-IN",
        actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"],
      },
      deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"],
    },
  }
}

// LocalBusiness schema for local SEO
export function generateLocalBusinessSchema() {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${siteUrl}/#localbusiness`,
    name: "Annapurna Foods",
    image: [
      "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
      "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Dinnercropped.jpg",
    ],
    priceRange: "₹₹",
    servesCuisine: ["Sattvik", "Indian", "Vegetarian"],
    telephone: "+918300615054",
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: "42/1, Devi Nagar, Alandurai",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      postalCode: "641101",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "10.9446",
      longitude: "76.7403",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "19:00",
        closes: "21:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "07:00",
        closes: "09:30",
      },
    ],
    hasMenu: `${siteUrl}/menu`,
    acceptsReservations: "false",
    paymentAccepted: "Cash, Credit Card, Debit Card, UPI",
    currenciesAccepted: "INR",
    areaServed: ["Coimbatore", "Isha Yoga Center", "Alandurai", "Thondamuthur", "Semmedu", "Velliangiri"],
    keywords:
      "Sattvik food, tiffin service, home cooked food, food delivery, Isha Yoga Center, Coimbatore food delivery",
    slogan: "Sattvik. Fresh. Fulfilling.",
    description:
      "Fresh, home-cooked Sattvik meals delivered daily near Isha Yoga Center. Healthy food tiffin services in Coimbatore with subscription options.",
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: "10.9446",
        longitude: "76.7403",
      },
      geoRadius: "15000", // 15km radius in meters
    },
  }
}

// FoodService schema for the delivery service
export function generateFoodServiceSchema() {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "FoodService",
    "@id": `${siteUrl}/#foodservice`,
    name: "Annapurna Foods Delivery Service",
    provider: {
      "@type": "Organization",
      name: "Annapurna Foods",
    },
    serviceType: "Food Delivery",
    areaServed: [
      {
        "@type": "City",
        name: "Coimbatore",
        containsPlace: [
          {
            "@type": "Place",
            name: "Alandurai",
          },
          {
            "@type": "Place",
            name: "Narsipuram",
          },
          {
            "@type": "Place",
            name: "Irrutupalam",
          },
          {
            "@type": "Place",
            name: "Madhapati",
          },
          {
            "@type": "Place",
            name: "Isha Yoga Center",
          },
        ],
      },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: siteUrl,
      servicePhone: "+918300615054",
      serviceSmsNumber: "+918300615054",
    },
    termsOfService: `${siteUrl}/policies/terms`,
    serviceOutput: {
      "@type": "FoodService",
      name: "Home-cooked Sattvik meal delivery",
    },
    offers: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Sattvik Food Delivery",
      },
    },
  }
}

// Product schema for individual food items
export function generateProductSchema(product: Product) {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/menu/${product.slug}#product`,
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product.id,
    mpn: `ANNAPURNA-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Annapurna Foods",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/menu/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Annapurna Foods",
      },
      deliveryLeadTime: {
        "@type": "QuantitativeValue",
        minValue: 30,
        maxValue: 60,
        unitCode: "MIN",
      },
      areaServed: [
        {
          "@type": "City",
          name: "Coimbatore",
          containsPlace: [
            {
              "@type": "Place",
              name: "Alandurai",
            },
            {
              "@type": "Place",
              name: "Narsipuram",
            },
            {
              "@type": "Place",
              name: "Irrutupalam",
            },
            {
              "@type": "Place",
              name: "Madhapati",
            },
            {
              "@type": "Place",
              name: "Isha Yoga Center",
            },
          ],
        },
      ],
    },
    category: product.category || "Food",
    isAccessoryOrSparePartFor: {
      "@type": "Product",
      name: "Meal Subscription",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Dietary",
        value: "Vegetarian, Sattvik",
      },
      {
        "@type": "PropertyValue",
        name: "MealType",
        value: product.category,
      },
      {
        "@type": "PropertyValue",
        name: "Ingredients",
        value: "Organic vegetables, Fresh spices, Natural ingredients",
      },
      {
        "@type": "PropertyValue",
        name: "ServingSize",
        value: "1 person",
      },
    ],
    nutrition: {
      "@type": "NutritionInformation",
      calories: "350-450 calories",
      fatContent: "10-15g",
      carbohydrateContent: "50-60g",
      proteinContent: "15-20g",
      fiberContent: "8-10g",
    },
    suitableForDiet: [
      "http://schema.org/VegetarianDiet",
      "http://schema.org/LowFatDiet",
      "http://schema.org/LowSaltDiet",
    ],
    keywords: `${product.name}, Sattvik food, healthy meal, ${product.category}, vegetarian food, Coimbatore food delivery, Isha Yoga Center`,
  }
}

// Menu schema for the food menu
export function generateMenuSchema(products: Product[]) {
  const siteUrl = getBaseUrl()
  const menuSections = Array.from(new Set(products.map((p) => p.category))).map((category) => {
    const categoryProducts = products.filter((p) => p.category === category)

    return {
      "@type": "MenuSection",
      name: category,
      description: `Our ${category} options - fresh, home-cooked Sattvik meals`,
      hasMenuItem: categoryProducts.map((product) => ({
        "@type": "MenuItem",
        name: product.name,
        description: product.description,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "INR",
          availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${siteUrl}/menu/${product.slug}`,
        },
        suitableForDiet: "https://schema.org/VegetarianDiet",
        menuAddOn:
          product.tags?.map((tag) => ({
            "@type": "MenuAddOn",
            name: tag,
          })) || [],
        nutrition: {
          "@type": "NutritionInformation",
          calories: "350-450 calories",
          fatContent: "10-15g",
          carbohydrateContent: "50-60g",
          proteinContent: "15-20g",
          fiberContent: "8-10g",
        },
      })),
    }
  })

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${siteUrl}/menu#menu`,
    name: "Annapurna Foods Menu",
    description: "Our menu of fresh, home-cooked Sattvik meals delivered daily",
    hasMenuSection: menuSections,
    inLanguage: "en-IN",
    offers: {
      "@type": "Offer",
      availabilityStarts: "2023-01-01T00:00:00+05:30",
      availabilityEnds: "2025-12-31T23:59:59+05:30",
    },
  }
}

// BreadcrumbList schema for navigation structure
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// WebPage schema for different pages
export function generateWebPageSchema(
  pageType: string,
  title: string,
  description: string,
  url: string,
  imageUrl?: string,
  lastReviewed?: string,
  keywords?: string[],
) {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": pageType,
    "@id": `${url}#webpage`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: title,
    description: description,
    image: imageUrl || "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
    datePublished: "2023-01-01T00:00:00+05:30",
    dateModified: new Date().toISOString(),
    lastReviewed: lastReviewed || new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "Annapurna Foods",
    },
    publisher: {
      "@type": "Organization",
      name: "Annapurna Foods",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2"],
    },
    inLanguage: "en-IN",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
    },
    potentialAction: {
      "@type": "ReadAction",
      target: [url],
    },
    keywords: keywords
      ? keywords.join(", ")
      : "Sattvik food, tiffin service, home cooked food, food delivery, Isha Yoga Center, Coimbatore",
  }
}

// FAQPage schema for FAQ sections
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

// Review schema for customer testimonials
export function generateReviewSchema(reviews: { author: string; reviewBody: string; reviewRating: number }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: reviews.map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: review.author,
        },
        reviewBody: review.reviewBody,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.reviewRating,
          bestRating: "5",
        },
        itemReviewed: {
          "@type": "FoodEstablishment",
          name: "Annapurna Foods",
        },
        datePublished: new Date().toISOString().split("T")[0],
      },
    })),
  }
}

// AggregateRating schema for overall ratings
export function generateAggregateRatingSchema(ratingValue: number, reviewCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "FoodEstablishment",
      name: "Annapurna Foods",
    },
    ratingValue: ratingValue,
    bestRating: "5",
    worstRating: "1",
    ratingCount: reviewCount,
    reviewCount: reviewCount,
  }
}

// Event schema for special promotions or events
export function generateEventSchema(event: {
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  image?: string
}) {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location,
      address: {
        "@type": "PostalAddress",
        streetAddress: "42/1, Devi Nagar, Alandurai",
        addressLocality: "Coimbatore",
        addressRegion: "Tamil Nadu",
        postalCode: "641101",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "10.9446",
        longitude: "76.7403",
      },
    },
    image: event.image || "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
    organizer: {
      "@type": "Organization",
      name: "Annapurna Foods",
      url: siteUrl,
    },
    performer: {
      "@type": "Organization",
      name: "Annapurna Foods",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/menu`,
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: event.startDate,
    },
  }
}

// Recipe schema for food items with ingredients and preparation
export function generateRecipeSchema(recipe: {
  name: string
  description: string
  image: string
  prepTime: string
  cookTime: string
  totalTime: string
  recipeYield: string
  recipeIngredient: string[]
  recipeInstructions: string[]
  keywords: string
  recipeCategory: string
  recipeCuisine: string
  nutrition?: {
    calories?: string
    fatContent?: string
    saturatedFatContent?: string
    cholesterolContent?: string
    sodiumContent?: string
    carbohydrateContent?: string
    fiberContent?: string
    sugarContent?: string
    proteinContent?: string
  }
}) {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    image: recipe.image,
    author: {
      "@type": "Organization",
      name: "Annapurna Foods",
      url: siteUrl,
    },
    datePublished: new Date().toISOString(),
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    recipeYield: recipe.recipeYield,
    recipeIngredient: recipe.recipeIngredient,
    recipeInstructions: recipe.recipeInstructions.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
      url: `${siteUrl}/recipes/${recipe.name.toLowerCase().replace(/\s+/g, "-")}#step-${index + 1}`,
      image: recipe.image,
    })),
    keywords: recipe.keywords,
    recipeCategory: recipe.recipeCategory,
    recipeCuisine: recipe.recipeCuisine,
    nutrition: {
      "@type": "NutritionInformation",
      calories: recipe.nutrition?.calories || "350 calories",
      fatContent: recipe.nutrition?.fatContent || "10 g",
      saturatedFatContent: recipe.nutrition?.saturatedFatContent || "2 g",
      cholesterolContent: recipe.nutrition?.cholesterolContent || "0 mg",
      sodiumContent: recipe.nutrition?.sodiumContent || "300 mg",
      carbohydrateContent: recipe.nutrition?.carbohydrateContent || "50 g",
      fiberContent: recipe.nutrition?.fiberContent || "8 g",
      sugarContent: recipe.nutrition?.sugarContent || "5 g",
      proteinContent: recipe.nutrition?.proteinContent || "15 g",
    },
    suitableForDiet: [
      "https://schema.org/VegetarianDiet",
      "https://schema.org/LowFatDiet",
      "https://schema.org/LowSaltDiet",
    ],
    recipeContext: "Sattvik cooking traditions from South India",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "24",
    },
    video: recipe.video
      ? {
          "@type": "VideoObject",
          name: `How to prepare ${recipe.name}`,
          description: `Learn how to prepare ${recipe.name} - ${recipe.description}`,
          thumbnailUrl: recipe.image,
          contentUrl: recipe.video,
          uploadDate: new Date().toISOString(),
          duration: "PT5M", // Example duration: 5 minutes
        }
      : undefined,
  }
}

// HowTo schema for delivery or ordering instructions
export function generateHowToSchema(howTo: {
  name: string
  description: string
  steps: { name: string; text: string; image?: string }[]
}) {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image
        ? {
            "@type": "ImageObject",
            url: step.image,
          }
        : undefined,
      url: `${siteUrl}/how-to#step-${index + 1}`,
    })),
  }
}

// Generate all schemas for a specific page
export function generatePageSchemas(pageName: string, pageData: any = {}) {
  const siteUrl = getBaseUrl()
  const schemas = []

  // Add website schema to all pages
  schemas.push(generateWebsiteSchema())

  // Add organization schema to all pages
  schemas.push(generateOrganizationSchema())

  // Add page-specific schemas
  switch (pageName) {
    case "home":
      schemas.push(generateLocalBusinessSchema())
      schemas.push(
        generateWebPageSchema(
          "WebPage",
          "Annapurna Foods - Sattvik Home Cooked Food Delivery in Coimbatore",
          "Order healthy, home-cooked Sattvik meals delivered fresh to your doorstep in Coimbatore. Daily brunch and dinner options with special health juices. Serving areas near Isha Yoga Center, Alandurai, Narsipuram, Irrutupalam, and Madhapati.",
          siteUrl,
          undefined,
          undefined,
          [
            "Sattvik food delivery",
            "Healthy meal delivery Coimbatore",
            "Tiffin service Isha Yoga Center",
            "Home cooked food delivery Alandurai",
            "Vegetarian food delivery Coimbatore",
            "Meal subscription Isha",
            "Healthy tiffin service Narsipuram",
            "Daily food delivery Irrutupalam",
            "Sattvik meals Madhapati",
          ],
        ),
      )
      schemas.push(generateFoodServiceSchema())

      // Add FAQ schema if FAQs are available
      if (pageData.faqs) {
        schemas.push(generateFAQSchema(pageData.faqs))
      }

      // Add reviews if available
      if (pageData.reviews) {
        schemas.push(generateReviewSchema(pageData.reviews))
        schemas.push(
          generateAggregateRatingSchema(
            pageData.reviews.reduce((acc: number, review: any) => acc + review.reviewRating, 0) /
              pageData.reviews.length,
            pageData.reviews.length,
          ),
        )
      }

      // Add special event if available
      if (pageData.event) {
        schemas.push(generateEventSchema(pageData.event))
      }
      break

    case "menu":
      schemas.push(
        generateWebPageSchema(
          "CollectionPage",
          "Menu - Healthy Meal Delivery Services in Coimbatore | Annapurna Foods",
          "Browse our menu of fresh, home-cooked Sattvik meals delivered daily near Isha Yoga Center. Healthy food tiffin services in Coimbatore, Alandurai, Narsipuram, Irrutupalam, and Madhapati with subscription options.",
          `${siteUrl}/menu`,
          undefined,
          undefined,
          [
            "Sattvik food menu",
            "Vegetarian meal options Coimbatore",
            "Healthy food menu Isha Yoga Center",
            "Tiffin service menu Alandurai",
            "Daily meal options Narsipuram",
            "Food delivery menu Irrutupalam",
            "Meal subscription plans Madhapati",
          ],
        ),
      )

      if (pageData.products) {
        schemas.push(generateMenuSchema(pageData.products))
      }

      schemas.push(
        generateBreadcrumbSchema([
          { name: "Home", url: siteUrl },
          { name: "Menu", url: `${siteUrl}/menu` },
        ]),
      )
      break

    case "product":
      if (pageData.product) {
        schemas.push(generateProductSchema(pageData.product))

        // Add recipe schema if it's a food product
        if (pageData.recipe) {
          schemas.push(generateRecipeSchema(pageData.recipe))
        }

        schemas.push(
          generateWebPageSchema(
            "ItemPage",
            `${pageData.product.name} - Healthy Home Cooked Food Delivery near Isha Yoga Center Coimbatore`,
            pageData.product.description,
            `${siteUrl}/menu/${pageData.product.slug}`,
            pageData.product.image,
            undefined,
            [
              `${pageData.product.name}`,
              `${pageData.product.name} delivery`,
              `Sattvik ${pageData.product.name}`,
              `Healthy ${pageData.product.name} Coimbatore`,
              `${pageData.product.name} Isha Yoga Center`,
              `${pageData.product.name} Alandurai`,
              `${pageData.product.name} Narsipuram`,
              `${pageData.product.name} Irrutupalam`,
              `${pageData.product.name} Madhapati`,
            ],
          ),
        )

        schemas.push(
          generateBreadcrumbSchema([
            { name: "Home", url: siteUrl },
            { name: "Menu", url: `${siteUrl}/menu` },
            { name: pageData.product.name, url: `${siteUrl}/menu/${pageData.product.slug}` },
          ]),
        )
      }
      break

    case "cart":
      schemas.push(
        generateWebPageSchema(
          "WebPage",
          "Shopping Cart - Annapurna Foods | Home Meal Delivery in Coimbatore",
          "Review your order of fresh, home-cooked Sattvik meals before checkout. Healthy food delivery near Isha Yoga Center, Alandurai, Narsipuram, Irrutupalam, and Madhapati in Coimbatore.",
          `${siteUrl}/cart`,
          undefined,
          undefined,
          [
            "Order Sattvik food",
            "Checkout healthy meals",
            "Food delivery cart Coimbatore",
            "Tiffin service order Isha",
            "Meal delivery checkout Alandurai",
            "Food order Narsipuram",
            "Meal cart Irrutupalam",
            "Food delivery Madhapati",
          ],
        ),
      )

      schemas.push(
        generateBreadcrumbSchema([
          { name: "Home", url: siteUrl },
          { name: "Cart", url: `${siteUrl}/cart` },
        ]),
      )
      break

    case "checkout":
      schemas.push(
        generateWebPageSchema(
          "CheckoutPage",
          "Checkout - Annapurna Foods | Home Meal Delivery in Coimbatore",
          "Complete your order for fresh, home-cooked Sattvik meals delivered to your doorstep near Isha Yoga Center, Alandurai, Narsipuram, Irrutupalam, and Madhapati in Coimbatore.",
          `${siteUrl}/checkout`,
          undefined,
          undefined,
          [
            "Complete food order",
            "Checkout Sattvik meals",
            "Food delivery payment Coimbatore",
            "Tiffin service checkout Isha",
            "Meal delivery payment Alandurai",
            "Food order completion Narsipuram",
            "Meal checkout Irrutupalam",
            "Food delivery payment Madhapati",
          ],
        ),
      )

      schemas.push(
        generateBreadcrumbSchema([
          { name: "Home", url: siteUrl },
          { name: "Cart", url: `${siteUrl}/cart` },
          { name: "Checkout", url: `${siteUrl}/checkout` },
        ]),
      )

      // Add HowTo schema for checkout process
      schemas.push(
        generateHowToSchema({
          name: "How to Order Food from Annapurna Foods",
          description: "Follow these simple steps to order fresh, home-cooked Sattvik meals from Annapurna Foods.",
          steps: [
            { name: "Select Items", text: "Browse our menu and select the items you want to order." },
            {
              name: "Review Cart",
              text: "Review your cart to ensure you have selected the correct items and quantities.",
            },
            { name: "Enter Delivery Details", text: "Enter your delivery address and contact information." },
            {
              name: "Choose Payment Method",
              text: "Select your preferred payment method: Cash on Delivery, UPI, or Card Payment.",
            },
            { name: "Place Order", text: "Confirm your order and complete the payment process." },
            { name: "Track Order", text: "Use the order tracking feature to monitor the status of your delivery." },
          ],
        }),
      )
      break

    case "contact":
      schemas.push(
        generateWebPageSchema(
          "ContactPage",
          "Contact Us - Annapurna Foods | Home Food Delivery in Coimbatore",
          "Get in touch with Annapurna Foods for home-cooked Sattvik meal delivery near Isha Yoga Center, Alandurai, Narsipuram, Irrutupalam, and Madhapati in Coimbatore. Questions, feedback, or special requests.",
          `${siteUrl}/contact`,
          undefined,
          undefined,
          [
            "Contact food delivery",
            "Reach Sattvik meal service",
            "Food delivery contact Coimbatore",
            "Tiffin service contact Isha",
            "Meal delivery inquiry Alandurai",
            "Food service contact Narsipuram",
            "Meal delivery support Irrutupalam",
            "Food delivery help Madhapati",
          ],
        ),
      )

      schemas.push(
        generateBreadcrumbSchema([
          { name: "Home", url: siteUrl },
          { name: "Contact", url: `${siteUrl}/contact` },
        ]),
      )
      break

    case "policy":
      schemas.push(
        generateWebPageSchema(
          "WebPage",
          `${pageData.title} - Annapurna Foods`,
          pageData.description,
          `${siteUrl}/policies/${pageData.slug}`,
          undefined,
          undefined,
          [
            `${pageData.title.toLowerCase()} food delivery`,
            `${pageData.title.toLowerCase()} Sattvik meals`,
            `${pageData.title.toLowerCase()} Coimbatore`,
            `${pageData.title.toLowerCase()} Isha Yoga Center`,
            `${pageData.title.toLowerCase()} Alandurai`,
            `${pageData.title.toLowerCase()} Narsipuram`,
            `${pageData.title.toLowerCase()} Irrutupalam`,
            `${pageData.title.toLowerCase()} Madhapati`,
          ],
        ),
      )

      schemas.push(
        generateBreadcrumbSchema([
          { name: "Home", url: siteUrl },
          { name: pageData.title, url: `${siteUrl}/policies/${pageData.slug}` },
        ]),
      )
      break

    default:
      schemas.push(
        generateWebPageSchema(
          "WebPage",
          "Annapurna Foods - Sattvik Home Cooked Food Delivery in Coimbatore",
          "Order healthy, home-cooked Sattvik meals delivered fresh to your doorstep in Coimbatore. Daily brunch and dinner options with special health juices. Serving areas near Isha Yoga Center, Alandurai, Narsipuram, Irrutupalam, and Madhapati.",
          siteUrl,
        ),
      )
  }

  return schemas
}

// Local business service schema for specific services
export function generateServiceSchema(service: {
  name: string
  description: string
  url: string
  areaServed: string[]
}) {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: "Annapurna Foods",
      address: {
        "@type": "PostalAddress",
        streetAddress: "42/1, Devi Nagar, Alandurai",
        addressLocality: "Coimbatore",
        addressRegion: "Tamil Nadu",
        postalCode: "641101",
        addressCountry: "IN",
      },
    },
    areaServed: service.areaServed.map((area) => ({
      "@type": "City",
      name: area,
    })),
    url: `${siteUrl}${service.url}`,
    serviceType: "Food Delivery",
    termsOfService: `${siteUrl}/policies/terms`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  }
}
