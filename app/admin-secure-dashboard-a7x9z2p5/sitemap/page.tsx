"use client"

import { useState } from "react"
import axios from "axios"

export default function SitemapManagementPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [results, setResults] = useState<any>(null)

  const generateSitemap = async () => {
    setIsGenerating(true)
    setMessage("")
    setError("")

    try {
      const response = await axios.get("/api/update-sitemap")
      setMessage("Sitemap generated successfully!")
      setResults(response.data)
    } catch (err) {
      setError("Error generating sitemap. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const submitSitemap = async () => {
    setIsSubmitting(true)
    setMessage("")
    setError("")

    try {
      const response = await axios.get("/api/cron/sitemap-update")
      setMessage("Sitemap submitted to search engines successfully!")
      setResults(response.data)
    } catch (err) {
      setError("Error submitting sitemap. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sitemap Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Generate Sitemap</h2>
          <p className="mb-4">Generate a new sitemap.xml file with the latest content.</p>
          <button
            onClick={generateSitemap}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate Sitemap"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Submit to Search Engines</h2>
          <p className="mb-4">Submit your sitemap to Google, Bing, and other search engines.</p>
          <button
            onClick={submitSitemap}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Sitemap"}
          </button>
        </div>
      </div>

      {message && <div className="mt-6 p-4 bg-green-100 text-green-800 rounded">{message}</div>}

      {error && <div className="mt-6 p-4 bg-red-100 text-red-800 rounded">{error}</div>}

      {results && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Results</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
