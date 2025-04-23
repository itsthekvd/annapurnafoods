"use client"

import type React from "next"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Clock, Mail } from "lucide-react"

export default function ContactPageClient() {
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const encodedMessage = `My name is ${name} and I want to say, ${message}`
    const whatsappLink = `https://wa.me/8300615054?text=${encodeURIComponent(encodedMessage)}`

    window.open(whatsappLink, "_blank")

    // Reset form
    setName("")
    setWhatsapp("")
    setMessage("")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-amber-800 mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    required
                    className="mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    placeholder="Enter your WhatsApp number"
                    required
                    className="mt-1"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" type="email" placeholder="Enter your email address" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    required
                    className="mt-1"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-amber-700 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Our Address</p>
                    <p className="text-gray-600">42/1, Devi Nagar, Alandurai, Coimbatore, 641101</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-amber-700 mr-3 mt-0.5" />
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
                  <Mail className="h-5 w-5 text-amber-700 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p className="text-gray-600">annapurnaisha@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-amber-700 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Open Hours</p>
                    <p className="text-gray-600">Mon - Fri: 7 PM - 9.30 PM</p>
                    <p className="text-gray-600">Sat - Sun: 7 AM - 9.30 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">What areas do you deliver to?</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    We currently deliver to areas within 10km of Isha Yoga Center, Coimbatore.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">How do I cancel my subscription?</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    You can cancel your subscription by contacting us on WhatsApp at least 24 hours before your next
                    delivery.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Do you accommodate dietary restrictions?</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Yes, we can accommodate certain dietary restrictions. Please mention your requirements when placing
                    your order.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">What payment methods do you accept?</h3>
                  <p className="text-gray-600 text-sm mt-1">We accept UPI payments and cash on delivery.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
