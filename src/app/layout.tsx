// app/layout.tsx
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"
import "@coinbase/onchainkit/styles.css"
import "./globals.css"

import Providers from "@/app/providers/providers"
import { Toaster } from "@/components/ui/toaster"
import MobileFooterWrapper from "@/components/MobileFooterWrapper"

export const metadata: Metadata = {
  title: "Simple Savings",
  description: "Crypto made simple",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        <Providers>
          {children}
          <MobileFooterWrapper />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}