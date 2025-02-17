'use client';

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/app/components/Button"
import { ArrowRight, PiggyBank, ShoppingBag, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <PiggyBank className="h-6 w-6" />
            <span className="font-bold">Simple Savings</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your All-in-One Financial Hub
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Simplify your finances with our innovative savings account and integrated services. Grow your wealth
                  effortlessly.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/dashboard">
                  <Button>
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Features That Empower You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <PiggyBank className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Smart Savings Account</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Earn high yields on your savings with our innovative, crypto-backed account.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <ShoppingBag className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Integrated App Store</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Access a wide range of services, from food delivery to shopping, all in one place.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <TrendingUp className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Investment Opportunities</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Explore curated investment options to grow your wealth further.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">1. Create Your Account</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Sign up in minutes and set up your secure savings account.
                </p>
                <h3 className="text-2xl font-bold">2. Start Saving</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Deposit funds and watch your savings grow with our competitive rates.
                </p>
                <h3 className="text-2xl font-bold">3. Explore the App Store</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Access a variety of services and make purchases directly from your account.
                </p>
              </div>
              <div className="relative h-[600px] w-full">
                <Image
                  src="/placeholder.svg?height=600&width=400"
                  alt="App interface mockup"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Simplify Your Finances?
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">
                Join thousands of users who are already enjoying the benefits of our all-in-one financial platform.
              </p>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg">
                  Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <PiggyBank className="h-6 w-6" />
              <span className="font-bold">Simple Savings</span>
            </div>
            <nav className="flex gap-4 sm:gap-6">
              <Link href="#" className="text-sm hover:underline underline-offset-4">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm hover:underline underline-offset-4">
                Privacy Policy
              </Link>
            </nav>
            <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 Simple Savings. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

