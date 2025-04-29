import { products, specialProducts } from "./data"

// Base website schema
export const getWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Annapurna Foods",
    url: "https://annapurna.food",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://annapurna.food/menu?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }
}

// Local business schema
export const getLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Annapurna Foods",
    image: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
    url: "https://annapurna.food",
    telephone: "+91-9876543210",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Near Isha Yoga Center",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      postalCode: "641114",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 10.9623,
      longitude: 76.7415,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    servesCuisine: ["Indian", "Vegetarian", "Sattvik"],
    priceRange: "₹₹",
    paymentAccepted: "Cash, Credit Card, Debit Card, UPI",
    currenciesAccepted: "INR",
  }
}

// Product schema generator
export const getProductSchema = (productSlug: string) => {
  const product = [...products, ...specialProducts].find((p) => p.slug === productSlug)

  if (!product) return null

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: product.description,
    sku: `AF-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Annapurna Foods",
    },
    offers: {
      "@type": "Offer",
      url: `https://annapurna.food/menu/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  }
}

// BreadcrumbList schema generator
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
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

// FAQ schema generator
export const getFAQSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What areas do you deliver to?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We currently deliver to areas within a 10 km radius of the Isha Yoga Centre in Coimbatore.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer subscription plans?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we offer daily, weekly, and monthly subscription plans for our meals with special discounted rates.",
        },
      },
      {
        "@type": "Question",
        name: "What is Sattvik food?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sattvik food is pure, wholesome vegetarian food prepared without onion and garlic, believed to promote clarity of mind and physical well-being.",
        },
      },
      {
        "@type": "Question",
        name: "How do I cancel my subscription?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can cancel your subscription by contacting our customer service at least 24 hours before your next scheduled delivery.",
        },
      },
    ],
  }
}
