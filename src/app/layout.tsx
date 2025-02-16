// app/layout.tsx
import type { Metadata } from "next";
import '@coinbase/onchainkit/styles.css';
import './globals.css';

import Providers from '@/app/providers/providers'
import { Toaster } from "@/app/components/ui/toaster"

export const metadata: Metadata = {
  title: "AppKit Example App",
  description: "Powered by WalletConnect"
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