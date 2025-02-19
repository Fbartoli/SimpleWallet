// app/layout.tsx
import type { Metadata } from "next";
import '@coinbase/onchainkit/styles.css';
import './globals.css';

import Providers from '@/app/providers/providers'
import { Toaster } from "@/app/components/ui/toaster"

export const metadata: Metadata = {
  title: "Simple Savings",
  description: "Crypto made simple"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}