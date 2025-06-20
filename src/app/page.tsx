"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Banknote,
  BarChart3,
  Bitcoin,
  CheckCircle,
  ChevronRight,
  Coins,
  DollarSign,
  Euro,
  Globe,
  Lock,
  PiggyBank,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
              Simple Savings
            </span>
          </Link>
          <nav className="ml-auto flex gap-6">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
              How It Works
            </Link>
            <Link href="#security" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
              Security
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-transparent to-teal-100/50" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200/30 to-teal-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-tr from-teal-200/30 to-green-200/30 rounded-full blur-3xl" />

          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Earn competitive yields on your savings
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-green-600 via-teal-600 to-green-700 text-transparent bg-clip-text">
                    Save Smart,
                  </span>
                  <br />
                  <span className="text-gray-900">Earn More</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Unlock superior returns with <strong>self-custodial savings</strong> that can significantly outperform
                  traditional banks on USD, EUR, and crypto. Your keys, your money, your growth.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all">
                    Start Earning Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-green-500">
                  Watch Demo <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Yield Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 w-full max-w-2xl">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 mx-auto">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">USD Savings</div>
                  <div className="text-sm text-gray-600">Competitive yields</div>
                  <div className="text-xs text-gray-500 mt-1">Outperform banks*</div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 mx-auto">
                    <Euro className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">EUR Savings</div>
                  <div className="text-sm text-gray-600">Attractive returns</div>
                  <div className="text-xs text-gray-500 mt-1">Beat traditional rates*</div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4 mx-auto">
                    <Bitcoin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">Crypto Assets</div>
                  <div className="text-sm text-gray-600">Growth potential</div>
                  <div className="text-xs text-gray-500 mt-1">Variable returns*</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 max-w-2xl mx-auto pt-4">
                *Returns are variable and not guaranteed. Past performance does not guarantee future results.
                All investments carry risk of loss.
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Why Choose <span className="bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">Simple Savings</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine the best of traditional finance with cutting-edge DeFi to offer competitive returns while maintaining security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Self-Custodial */}
              <div className="group bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 hover:shadow-xl transition-all">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Self-Custodial Security</h3>
                <p className="text-gray-600 mb-6">
                  You hold the keys. Your funds are always under your control, never locked up or at risk from bank failures.
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Your keys, your crypto
                </div>
              </div>

              {/* Superior Yields */}
              <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 hover:shadow-xl transition-all">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Competitive Yields</h3>
                <p className="text-gray-600 mb-6">
                  Access opportunities to earn more than traditional banks through optimized DeFi strategies and yield farming.
                </p>
                <div className="flex items-center text-blue-600 font-semibold">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Outperform banks*
                </div>
              </div>

              {/* Multi-Currency */}
              <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 hover:shadow-xl transition-all">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Multi-Currency Support</h3>
                <p className="text-gray-600 mb-6">
                  Save in USD, EUR, BTC, ETH and more. Diversify your holdings across multiple currencies and assets.
                </p>
                <div className="flex items-center text-purple-600 font-semibold">
                  <Coins className="w-5 h-5 mr-2" />
                  6+ currencies supported
                </div>
              </div>

              {/* Easy to Use */}
              <div className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 hover:shadow-xl transition-all">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Simple & Fast</h3>
                <p className="text-gray-600 mb-6">
                  Get started in under 2 minutes. No complex setups, no hidden fees, no minimum balance requirements.
                </p>
                <div className="flex items-center text-orange-600 font-semibold">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Setup in 2 minutes
                </div>
              </div>

              {/* Transparent */}
              <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-8 hover:shadow-xl transition-all">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-6">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Fully Transparent</h3>
                <p className="text-gray-600 mb-6">
                  All transactions on-chain. Track your performance in real-time. No hidden fees or surprise charges.
                </p>
                <div className="flex items-center text-teal-600 font-semibold">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  0 hidden fees
                </div>
              </div>

              {/* Automated */}
              <div className="group bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-8 hover:shadow-xl transition-all">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl mb-6">
                  <Banknote className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Automated Optimization</h3>
                <p className="text-gray-600 mb-6">
                  Our smart contracts automatically seek optimal opportunities and compound your earnings for potential growth.
                </p>
                <div className="flex items-center text-yellow-600 font-semibold">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Auto-compounding
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Start Earning in <span className="bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">3 Simple Steps</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                No complex procedures. No lengthy verification. Start accessing competitive yields in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-green-500 to-transparent md:hidden"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
                <p className="text-gray-600">
                  Connect your wallet in seconds. We support all major wallets and create one for you if needed.
                </p>
              </div>

              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-blue-500 to-transparent md:hidden"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Choose Your Currency</h3>
                <p className="text-gray-600">
                  Select from USD, EUR, BTC, ETH and more. Diversify across multiple currencies for optimal returns.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Start Earning</h3>
                <p className="text-gray-600">
                  Deposit and watch your savings grow. Track your performance in real-time on your dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-green-600 via-teal-600 to-green-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPgo=')] opacity-30"></div>

          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold">
                Ready to Unlock Better Returns?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of smart savers who are exploring opportunities to earn more than traditional banks.
                Your financial growth starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                    Start Earning Today <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-8 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  No minimum deposit
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Withdraw anytime
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  100% self-custodial
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-gray-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <PiggyBank className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">Simple Savings</span>
              </div>
              <p className="text-gray-400">
                Access competitive yields on your savings with self-custodial DeFi solutions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="#features" className="block hover:text-white transition-colors">Features</Link>
                <Link href="#security" className="block hover:text-white transition-colors">Security</Link>
                <Link href="/dashboard" className="block hover:text-white transition-colors">Dashboard</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="#" className="block hover:text-white transition-colors">About</Link>
                <Link href="#" className="block hover:text-white transition-colors">Blog</Link>
                <Link href="#" className="block hover:text-white transition-colors">Careers</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="#" className="block hover:text-white transition-colors">Help Center</Link>
                <Link href="#" className="block hover:text-white transition-colors">Contact</Link>
                <Link href="#" className="block hover:text-white transition-colors">Status</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Simple Savings. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Risk Disclosure
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

