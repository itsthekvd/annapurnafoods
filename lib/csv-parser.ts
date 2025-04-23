// This function fetches and parses the CSV file to get image URLs
export async function fetchImageUrls() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/annapurna%20foods%20images%20-%20Sheet1%20%281%29-pNfYjTCMf3ShuLljDgdIgA5cfG2ijY.csv",
    )
    const csvText = await response.text()

    // Parse CSV
    const lines = csvText.split("\n")
    const headers = lines[0].split(",")

    const imageDetailsIndex = headers.findIndex((h) => h.trim() === "image details")
    const imageUrlIndex = headers.findIndex((h) => h.trim() === "image url")

    if (imageDetailsIndex === -1 || imageUrlIndex === -1) {
      throw new Error("CSV headers not found")
    }

    const imageMap: Record<string, string> = {}

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",")
      if (values.length > Math.max(imageDetailsIndex, imageUrlIndex)) {
        const imageDetail = values[imageDetailsIndex].trim()
        const imageUrl = values[imageUrlIndex].trim()

        if (imageDetail && imageUrl) {
          imageMap[imageDetail] = imageUrl
        }
      }
    }

    return imageMap
  } catch (error) {
    console.error("Error fetching or parsing CSV:", error)
    return {}
  }
}
