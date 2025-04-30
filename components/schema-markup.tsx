interface SchemaMarkupProps {
  schemas: any[]
}

export default function SchemaMarkup({ schemas }: SchemaMarkupProps) {
  // Convert each schema to a separate script tag to ensure proper parsing
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
