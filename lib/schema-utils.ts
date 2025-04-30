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

// Organization schema for the business entity
export function generateOrganizationSchema() {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Annapurna Foods",
    alternateName: "Annapurna Tiffin Service",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
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
    geo: {
      "@type": "GeoCoordinates",
      latitude: "10.9446", // Replace with actual coordinates
      longitude: "76.7403", // Replace with actual coordinates
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
    foundingDate: "2023",
    founders: [
      {
        "@type": "Person",
        name: "Isha Volunteer",
      },
    ],
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: "10.9446", // Replace with actual coordinates
        longitude: "76.7403", // Replace with actual coordinates
      },
      geoRadius: "15000", // 15km radius in meters
    },
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
    "@type": ["LocalBusiness", "FoodEstablishment", "Restaurant"],
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
      latitude: "10.9446", // Replace with actual coordinates
      longitude: "76.7403", // Replace with actual coordinates
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
    deliveryArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: "10.9446", // Replace with actual coordinates
        longitude: "76.7403", // Replace with actual coordinates
      },
      geoRadius: "15000", // 15km radius in meters
    },
    keywords:
      "Sattvik food, tiffin service, home cooked food, food delivery, Isha Yoga Center, Coimbatore food delivery",
    slogan: "Sattvik. Fresh. Fulfilling.",
    description:
      "Fresh, home-cooked Sattvik meals delivered daily near Isha Yoga Center. Healthy food tiffin services in Coimbatore with subscription options.",
    areaServed: ["Coimbatore", "Isha Yoga Center", "Alandurai", "Thondamuthur", "Semmedu", "Velliangiri"],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: "10.9446", // Replace with actual coordinates
        longitude: "76.7403", // Replace with actual coordinates
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
    name: "Annapurna Foods Delivery Service",
    provider: {
      "@type": "Organization",
      name: "Annapurna Foods",
    },
    serviceType: "Food Delivery",
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: "10.9446", // Replace with actual coordinates
        longitude: "76.7403", // Replace with actual coordinates
      },
      geoRadius: "15000", // 15km radius in meters
    },
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
  }
}

// Product schema for individual food items
export function generateProductSchema(product: Product) {
  const siteUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Product",
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
    ],
  }
}

// Menu schema for the food menu
export function generateMenuSchema(products: Product[]) {
  const menuSections = Array.from(new Set(products.map((p) => p.category))).map((category) => {
    const categoryProducts = products.filter((p) => p.category === category)

    return {
      "@type": "MenuSection",
      name: category,
      hasMenuItem: categoryProducts.map((product) => ({
        "@type": "MenuItem",
        name: product.name,
        description: product.description,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "INR",
        },
        suitableForDiet: "https://schema.org/VegetarianDiet",
        menuAddOn:
          product.tags?.map((tag) => ({
            "@type": "MenuAddOn",
            name: tag,
          })) || [],
      })),
    }
  })

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Annapurna Foods Menu",
    description: "Our menu of fresh, home-cooked Sattvik meals delivered daily",
    hasMenuSection: menuSections,
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
) {
  return {
    "@context": "https://schema.org",
    "@type": pageType,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: title,
    description: description,
    image: imageUrl || "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
    datePublished: "2023-01-01T00:00:00+05:30", // Replace with actual date
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
        url: `${getBaseUrl()}/logo.png`,
      },
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".product-description"],
    },
    inLanguage: "en-IN",
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
    },
    image: event.image || "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
    organizer: {
      "@type": "Organization",
      name: "Annapurna Foods",
      url: siteUrl,
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    image: recipe.image,
    author: {
      "@type": "Organization",
      name: "Annapurna Foods",
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
    })),
    keywords: recipe.keywords,
    recipeCategory: recipe.recipeCategory,
    recipeCuisine: recipe.recipeCuisine,
    nutrition: {
      "@type": "NutritionInformation",
      calories: "350 calories",
      fatContent: "10 g",
      carbohydrateContent: "50 g",
      proteinContent: "15 g",
      fiberContent: "8 g",
    },
    suitableForDiet: "https://schema.org/VegetarianDiet",
  }
}

// HowTo schema for delivery or ordering instructions
export function generateHowToSchema(howTo: {
  name: string
  description: string
  steps: { name: string; text: string; image?: string }[]
}) {
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
      image: step.image,
    })),
  }
}

// Generate all schemas for a specific page
export function generatePageSchemas(pageName: string, pageData: any = {}) {
  const siteUrl = getBaseUrl()
  const schemas = []

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
          "Order healthy, home-cooked Sattvik meals delivered fresh to your doorstep in Coimbatore. Daily brunch and dinner options with special health juices. Serving areas near Isha Yoga Center.",
          siteUrl,
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
          "Browse our menu of fresh, home-cooked Sattvik meals delivered daily near Isha Yoga Center. Healthy food tiffin services in Coimbatore with subscription options.",
          `${siteUrl}/menu`,
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
          "Review your order of fresh, home-cooked Sattvik meals before checkout. Healthy food delivery near Isha Yoga Center Coimbatore.",
          `${siteUrl}/cart`,
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
          "Complete your order for fresh, home-cooked Sattvik meals delivered to your doorstep near Isha Yoga Center Coimbatore.",
          `${siteUrl}/checkout`,
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
          "Get in touch with Annapurna Foods for home-cooked Sattvik meal delivery near Isha Yoga Center Coimbatore. Questions, feedback, or special requests.",
          `${siteUrl}/contact`,
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
          "Order healthy, home-cooked Sattvik meals delivered fresh to your doorstep in Coimbatore. Daily brunch and dinner options with special health juices. Serving areas near Isha Yoga Center.",
          siteUrl,
        ),
      )
  }

  return schemas
}
