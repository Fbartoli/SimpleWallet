'use client';

import Header from '@/app/components/Header';
import Receive from '@/app/components/Receive';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReceivePage() {
    const { authenticated } = usePrivy();
    const router = useRouter();

    useEffect(() => {
        if (!authenticated) {
            router.push('/');
        }
    }, [authenticated, router]);

    return (
        <div className="relative min-h-screen">
            {/* Background gradient elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-green-400/10 to-teal-500/5 rounded-full filter blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-green-300/10 to-emerald-500/5 rounded-full filter blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3" />

            <Header />
            <main className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
                <Receive />
            </main>
        </div>
    );
} 