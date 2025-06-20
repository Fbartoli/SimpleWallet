"use client"

import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useAuth } from "@monerium/sdk-react-provider"
import { Button } from "./Button"
import { Home, LogOut, Menu, PiggyBank } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const { authenticated, logout } = usePrivy()
  const { revokeAccess, isAuthorized } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const isNotDashboard = pathname !== "/dashboard"

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleDisconnect = async () => {
    try {
      // Revoke Monerium access if user is authorized
      if (isAuthorized) {
        await revokeAccess()
      }
    } catch (error) {
      console.error("Error revoking Monerium access:", error)
      // Continue with logout even if Monerium revocation fails
    } finally {
      // Always logout from Privy
      logout()
      closeMenu()
    }
  }

  return (
    <>
      <div className="w-full bg-yellow-100 border-b border-yellow-200">
        <div className="container mx-auto px-4 py-2 text-center text-yellow-800">
          <p className="text-sm font-medium">⚠️ This is a beta version. Please do not deposit significant amounts of funds.</p>
        </div>
      </div>
      <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-gradient-to-r from-green-50 to-teal-50 backdrop-blur supports-[backdrop-filter]:bg-green-50/90">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <PiggyBank className="h-6 w-6" />
              <span className="text-xl font-bold">Simple Savings</span>
            </Link>
          </div>
          <div className="relative">
            {!authenticated ? (<></>) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="relative"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {isNotDashboard && (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                          role="menuitem"
                          onClick={closeMenu}
                        >
                          <Home className="h-4 w-4" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleDisconnect}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
} 