import type React from "react"
export default function NotFoundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm py-4">
            <div className="container mx-auto px-4">
              <a href="/" className="text-xl font-bold text-amber-700">
                Annapurna Foods
              </a>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="bg-amber-50 py-6">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-gray-600">Copyright © 2025 Annapurna Foods</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
