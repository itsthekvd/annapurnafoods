import Head from "next/head"

interface SeoMetaTagsProps {
  title: string
  description: string
  canonicalPath?: string
  ogImage?: string
  ogType?: "website" | "article" | "product"
  keywords?: string[]
}

export default function SeoMetaTags({
  title,
  description,
  canonicalPath,
  ogImage = "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
  ogType = "website",
  keywords = [],
}: SeoMetaTagsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://annapurnafoods.com"
  const canonicalUrl = canonicalPath ? `${baseUrl}${canonicalPath}` : baseUrl

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Head>
  )
}
