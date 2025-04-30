"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

interface SchemaMarkupProps {
  schemas: any[]
}

export default function SchemaMarkup({ schemas }: SchemaMarkupProps) {
  const [schemaString, setSchemaString] = useState<string>("")

  useEffect(() => {
    // Convert schemas to JSON string
    setSchemaString(JSON.stringify(schemas))
  }, [schemas])

  return (
    <Script
      id="schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schemaString }}
      strategy="afterInteractive"
    />
  )
}
