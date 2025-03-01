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
        <div className="min-h-screen bg-background">
            <Header />
            <Receive />
        </div>
    );
} 