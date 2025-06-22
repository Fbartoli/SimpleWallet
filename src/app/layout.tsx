// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

import Providers from "@/app/providers/providers"
import { Toaster } from "@/components/ui/toaster"
import MobileFooterWrapper from "@/components/MobileFooterWrapper"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Configure the Inter font with optimal settings for preventing flicker
const inter = Inter({
  subsets: ["latin"],
  display: "optional", // Use font-display: optional to prevent flicker
  preload: true,
  variable: "--font-inter",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: true, // Enable automatic fallback adjustments
})

export const metadata: Metadata = {
  title: "Simple Savings - Self-Custodial DeFi Savings Platform",
  description: "Access competitive yields on USD, EUR, and crypto with self-custodial DeFi savings. Your keys, your money, your control. Outperform traditional banks safely.",
  keywords: ["DeFi savings", "competitive yields", "self-custodial", "crypto savings", "USD yield", "EUR yield", "better than banks", "defi platform"],
  openGraph: {
    title: "Simple Savings - Self-Custodial DeFi Savings Platform",
    description: "Access competitive yields on USD, EUR, and crypto with self-custodial DeFi savings. Your keys, your money, your control.",
    type: "website",
    url: "https://simplesavings.finance",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Simple Savings - Competitive DeFi Yields",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Simple Savings - Self-Custodial DeFi Savings Platform",
    description: "Access competitive yields on USD, EUR, and crypto with self-custodial DeFi savings. Your keys, your money, your control.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>

      <body className={`${inter.className} antialiased`}>
        <Analytics />
        <Providers>
          {children}
          <SpeedInsights />
          <MobileFooterWrapper />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}