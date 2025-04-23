import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "Policies - Annapurna Foods",
  description: "Policies and legal information for Annapurna Foods services near Isha Yoga Center Coimbatore.",
}

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
