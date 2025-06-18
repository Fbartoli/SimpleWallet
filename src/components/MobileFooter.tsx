'use client';

import { usePrivy } from '@privy-io/react-auth';
import { LogOut, Home, Send, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/utils';

export default function MobileFooter() {
    const { authenticated, logout } = usePrivy();
    const pathname = usePathname();

    if (!authenticated) {
        return null;
    }

    const navItems = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: Home,
            active: pathname === '/dashboard',
        },
        {
            href: '/send',
            label: 'Send',
            icon: Send,
            active: pathname === '/send',
        },
        {
            href: '/receive',
            label: 'Receive',
            icon: Wallet,
            active: pathname === '/receive',
        },
        {
            href: '#',
            label: 'Logout',
            icon: LogOut,
            onClick: () => logout(),
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-green-50 to-teal-50 border-t border-green-100 backdrop-blur supports-[backdrop-filter]:bg-green-50/90">
            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => (
                    item.href === '#' ? (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-1 text-xs",
                                "text-slate-600 hover:text-green-600 transition-colors",
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </button>
                    ) : (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-1 text-xs",
                                item.active
                                    ? "text-green-600 font-medium"
                                    : "text-slate-600 hover:text-green-600",
                                "transition-colors"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    )
                ))}
            </div>
        </div>
    );
} 