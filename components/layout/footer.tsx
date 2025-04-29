"use client"

import { useState, useCallback, type FormEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Clock } from "lucide-react"

// Footer links
const FOOTER_LINKS = [
  { name: "Refund & Cancellation Policy", href: "/policies/refund-cancellation" },
  { name: "Terms and Conditions", href: "/policies/terms" },
  { name: "Shipping Policy", href: "/policies/shipping" },
  { name: "Privacy Policy", href: "/policies/privacy" },
  { name: "Contact Us", href: "/contact" },
]

export default function Footer() {
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()

      const encodedMessage = `My name is ${name} and I want to say, ${message}`
      const whatsappLink = `https://wa.me/8300615054?text=${encodeURIComponent(encodedMessage)}`

      window.open(whatsappLink, "_blank")

      // Reset form
      setName("")
      setWhatsapp("")
      setMessage("")
    },
    [name, message],
  )

  // Render contact information section
  const renderContactInfo = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-amber-800">Your Sattvik Food Gets Cooked Here</h3>
      <div className="space-y-4">
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-amber-700 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Our Address</p>
            <p className="text-gray-600">42/1, Devi Nagar, Alandurai, Coimbatore, 641101</p>
          </div>
        </div>
        <div className="flex items-start">
          <Phone className="h-5 w-5 text-amber-700 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">WhatsApp & Call Us</p>
            <a
              href="https://wa.me/8300615054"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-amber-700 transition-colors"
            >
              8300615054
            </a>
          </div>
        </div>
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-amber-700 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Open Hours</p>
            <p className="text-gray-600">Mon - Fri: 7 PM - 9.30 PM</p>
            <p className="text-gray-600">Sat - Sun: 7 AM - 9.30 AM</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Render feedback form
  const renderFeedbackForm = () => (
    <div className="lg:col-span-2">
      <h3 className="text-lg font-semibold mb-4 text-amber-800">Have Feedback?</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              placeholder="Name"
              className="border-amber-200 focus:border-amber-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="WhatsApp"
              className="border-amber-200 focus:border-amber-500"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Textarea
            placeholder="Message"
            className="border-amber-200 focus:border-amber-500"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button type="submit" className="bg-amber-700 hover:bg-amber-800">
          Send Message
        </Button>
      </form>
    </div>
  )

  // Render footer links
  const renderFooterLinks = () => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
      {FOOTER_LINKS.map((link) => (
        <Link key={link.name} href={link.href} className="hover:text-amber-700">
          {link.name}
        </Link>
      ))}
    </div>
  )

  return (
    <footer className="bg-amber-50 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-800">Annapurna Foods</h3>
            <p className="text-gray-600 mb-4">Sattvik. Fresh. Fulfilling.</p>
            <p className="text-gray-600 italic">By Isha Volunteers for Isha Volunteers</p>
            <p className="text-gray-600 mt-4">
              You Need both, Sadhana and Saapadu, to perform well in the world. You take care of your Sadhana. We will
              take care of your Saapadu. 😋
            </p>
            <Link href="/menu">
              <Button className="mt-4 bg-amber-700 hover:bg-amber-800">Check Our Menu</Button>
            </Link>
          </div>

          {/* Column 2: Contact */}
          {renderContactInfo()}

          {/* Column 3: Feedback Form */}
          {renderFeedbackForm()}
        </div>

        {/* Bottom Links */}
        <div className="border-t border-amber-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">Copyright © 2025 Annapurna Foods</p>
            {renderFooterLinks()}
          </div>
        </div>

        {/* Disclaimer at the bottom */}
        <div className="text-center mt-6 pt-4 border-t border-amber-200">
          <p className="text-xs text-gray-500">⚠️ Disclaimer & Policy Notes</p>
          <p className="text-xs text-gray-500">
            Annapurna Foods is not affiliated with or endorsed by Meta, Facebook, Instagram Google, or YouTube.
          </p>
          <p className="text-xs text-gray-500">
            All inputs are of our own and not a responsibility of Meta, Facebook, Instagram Google, or YouTube.
          </p>
        </div>
      </div>
    </footer>
  )
}
