import type React from "react"
import Script from "next/script"

interface SchemaMarkupProps {
  schemas: any[]
}

/**
 * Component to add structured data (schema.org) markup to pages
 * This helps search engines understand the content better
 */
const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ schemas }) => {
  // Convert the schema objects to JSON-LD format
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": schemas,
  }

  return (
    <Script
      id="schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      strategy="afterInteractive"
    />
  )
}

export default SchemaMarkup
