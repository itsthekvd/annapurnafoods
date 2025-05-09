"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function SanskritBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Add a small delay for animation effect
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="bg-amber-100 py-8 overflow-hidden relative">
      <div
        className={`container mx-auto px-4 transition-all duration-1000 ease-in-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-4xl mx-auto bg-amber-50 rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left side - Image */}
            <div className="md:w-1/3 p-6 flex justify-center">
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/61KyaOwYY6L.jpg-pceZUpUjAYYTK4ehPYqbhTWwatMukV.jpeg"
                  alt="Sanskrit Prayer to Goddess Annapurna"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Right side - Text */}
            <div className="md:w-2/3 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-amber-800 mb-4">Our Cultural Heritage</h2>

              <div className="mb-4">
                <p className="text-xl md:text-2xl font-semibold text-amber-900 mb-2 font-['Sanskrit_Text']">
                  अन्नपूर्णे सदापूर्णे शंकर प्राणवल्लभे।
                  <br />
                  ज्ञान वैराग्य सिद्ध्यर्थं भिक्षां देहि च पार्वति॥
                </p>
              </div>

              <div className="prose prose-amber">
                <p className="text-amber-700 italic">
                  "O Annapurna, who is ever-full, beloved of Shankara,
                  <br />
                  Please give alms for the attainment of knowledge and detachment, O Parvati."
                </p>

                <p className="text-amber-700 mt-2">
                  This ancient Sanskrit prayer honors Goddess Annapurna, the divine provider of food and nourishment.
                  Our name and philosophy are inspired by this tradition of offering pure, sattvik food that nourishes
                  both body and soul.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div
        className="absolute -bottom-6 left-0 w-full h-12 bg-white"
        style={{ clipPath: "polygon(0 0, 100% 100%, 100% 0)" }}
      ></div>
    </section>
  )
}
