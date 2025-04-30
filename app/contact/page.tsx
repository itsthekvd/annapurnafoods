import type { Metadata } from "next"
import ContactPageClient from "./ContactPageClient"
import SchemaMarkup from "@/components/schema-markup"
import { generatePageSchemas } from "@/lib/schema-utils"

export const metadata: Metadata = {
  title: "Contact Us - Annapurna Foods | Home Food Delivery in Coimbatore",
  description:
    "Get in touch with Annapurna Foods for home-cooked Sattvik meal delivery near Isha Yoga Center Coimbatore. Questions, feedback, or special requests.",
  openGraph: {
    title: "Contact Us - Annapurna Foods Home Food Delivery",
    description:
      "Get in touch with Annapurna Foods for home-cooked Sattvik meal delivery near Isha Yoga Center Coimbatore. Questions, feedback, or special requests.",
    images: [
      {
        url: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
        width: 1200,
        height: 630,
        alt: "Annapurna Foods Contact",
      },
    ],
  },
}

export default function ContactPage() {
  // Generate contact page schemas
  const contactSchemas = generatePageSchemas("contact")

  return (
    <>
      <SchemaMarkup schemas={contactSchemas} />
      <ContactPageClient />
    </>
  )
}
