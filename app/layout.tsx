import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Providers from "./providers"
import ImageCacheInitializer from "@/components/image-cache-initializer"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Annapurna Foods - Sattvik Home Cooked Food Delivery in Coimbatore",
  description:
    "Order healthy, home-cooked Sattvik meals delivered fresh to your doorstep in Coimbatore. Daily brunch and dinner options with special health juices. Serving areas near Isha Yoga Center.",
  metadataBase: new URL("https://annapurna.food"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://annapurna.food",
    siteName: "Annapurna Foods",
    title: "Annapurna Foods - Sattvik Home Cooked Food Delivery in Coimbatore",
    description:
      "Fresh, healthy home-cooked meals delivered daily near Isha Yoga Center. Subscribe for regular Sattvik food delivery in Coimbatore.",
    images: [
      {
        url: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
        width: 1200,
        height: 630,
        alt: "Annapurna Foods - Sattvik Meals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Annapurna Foods - Sattvik Home Cooked Food Delivery in Coimbatore",
    description:
      "Fresh, healthy home-cooked meals delivered daily near Isha Yoga Center. Subscribe for regular Sattvik food delivery in Coimbatore.",
    images: ["https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '575292864736009');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=575292864736009&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Providers>
            <ImageCacheInitializer />
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
