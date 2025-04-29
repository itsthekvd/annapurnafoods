import fs from "fs"
import path from "path"
import { products, specialProducts } from "../lib/data"

// Current date in YYYY-MM-DD format for lastmod
const currentDate = new Date().toISOString().split("T")[0]

// Function to create the sitemap XML content
function generateSitemap() {
  // Start the XML sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
        http://www.google.com/schemas/sitemap-image/1.1
        http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">
`

  // Main pages
  const mainPages = [
    { url: "", priority: "1.0", changefreq: "daily" },
    { url: "menu", priority: "0.9", changefreq: "daily" },
    { url: "cart", priority: "0.7", changefreq: "always" },
    { url: "checkout", priority: "0.7", changefreq: "always" },
    { url: "contact", priority: "0.6", changefreq: "monthly" },
    { url: "order-tracking", priority: "0.6", changefreq: "always" },
  ]

  // Policy pages
  const policyPages = [
    { url: "policies/terms", priority: "0.4", changefreq: "monthly" },
    { url: "policies/privacy", priority: "0.4", changefreq: "monthly" },
    { url: "policies/refund-cancellation", priority: "0.4", changefreq: "monthly" },
    { url: "policies/shipping", priority: "0.4", changefreq: "monthly" },
  ]

  // Add main pages to sitemap
  mainPages.forEach((page) => {
    sitemap += `  <url>
    <loc>https://annapurna.food/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
  })

  // Add policy pages to sitemap
  policyPages.forEach((page) => {
    sitemap += `  <url>
    <loc>https://annapurna.food/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
  })

  // Add all product pages to sitemap
  ;[...products, ...specialProducts].forEach((product) => {
    sitemap += `  <url>
    <loc>https://annapurna.food/menu/${product.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${product.image}</image:loc>
      <image:title>${product.name}</image:title>
      <image:caption>${product.description.substring(0, 100)}...</image:caption>
    </image:image>
  </url>
`
  })

  // Close the XML sitemap
  sitemap += `</urlset>`

  return sitemap
}

// Write the sitemap to a file
const sitemap = generateSitemap()
const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml")

fs.writeFileSync(sitemapPath, sitemap)
console.log(`Sitemap generated at ${sitemapPath}`)
