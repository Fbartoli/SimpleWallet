'use client';

import { useState } from 'react';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { Button } from './Button';
import { Menu } from 'lucide-react';

export default function Header() {
  const { ready, authenticated, logout } = usePrivy();
  const {login} = useLogin({
    onComplete: ({user, isNewUser, wasAlreadyAuthenticated, loginMethod}) => {
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">Doneth</span>
        </div>
        <div className="relative">
          {!authenticated ? (
            <Button
              onClick={login}
              className="px-4 py-2"
            >
              Log in
            </Button>
          ) : (
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
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                      role="menuitem"
                    >
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
  );
} 