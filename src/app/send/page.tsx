'use client';

import Header from '@/app/components/Header';
import { SendToken } from '@/app/components/SendToken';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SendPage() {
    const { authenticated } = usePrivy();
    const router = useRouter();

    useEffect(() => {
        if (!authenticated) {
            router.push('/');
        }
    }, [authenticated, router]);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-16 md:pb-0">
            {/* Background decorative elements */}
            <div className="absolute top-20 left-5 w-72 h-72 bg-green-200/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-200/20 rounded-full filter blur-3xl"></div>

            {/* Hide header on mobile, show on md breakpoint and above */}
            <div className="hidden md:block">
                <Header />
            </div>
            <main className="container mx-auto px-4 py-8 relative z-10">
                <div className="max-w-lg mx-auto">
                    <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Send Tokens</h1>
                    <SendToken />
                </div>
            </main>
        </div>
    );
} 