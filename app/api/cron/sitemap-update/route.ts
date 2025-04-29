import { NextResponse } from "next/server"
import { generateSitemap, submitSitemapToSearchEngines } from "@/lib/sitemap-utils"

// This endpoint will be triggered by Vercel Cron
export async function GET() {
  try {
    // Generate the sitemap
    await generateSitemap()

    // Submit to search engines
    const submitted = await submitSitemapToSearchEngines()

    return NextResponse.json({
      success: true,
      message: "Sitemap generated and submitted successfully",
      submitted,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in sitemap update cron:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error updating sitemap",
      },
      { status: 500 },
    )
  }
}

// Configure the cron job to run daily at 1:00 AM
export const config = {
  runtime: "nodejs",
  schedule: "0 1 * * *", // Runs at 1:00 AM every day (cron syntax)
}
