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
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-lg mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Send Tokens</h1>
                    <SendToken />
                </div>
            </main>
        </div>
    );
} 