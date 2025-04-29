import type { Metadata } from "next"
import ContactPageClient from "./ContactPageClient"
import { getBreadcrumbSchema } from "@/lib/schema-utils"

export const metadata: Metadata = {
  title: "Contact Us - Annapurna Foods | Sattvik Food Delivery in Coimbatore",
  description:
    "Get in touch with Annapurna Foods for home-cooked Sattvik meal delivery near Isha Yoga Center Coimbatore. Questions, feedback, or special requests.",
  openGraph: {
    title: "Contact Us - Annapurna Foods Sattvik Food Delivery",
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
    locale: "en_IN",
    type: "website",
  },
}

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", url: "https://annapurna.food" },
              { name: "Contact", url: "https://annapurna.food/contact" },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact Annapurna Foods",
            description:
              "Get in touch with Annapurna Foods for home-cooked Sattvik meal delivery near Isha Yoga Center Coimbatore.",
            url: "https://annapurna.food/contact",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-9876543210",
              contactType: "customer service",
              availableLanguage: ["English", "Tamil"],
              email: "hello@annapurna.food",
            },
          }),
        }}
      />
      <ContactPageClient />
    </>
  )
}
