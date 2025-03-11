'use client';

import Header from '@/app/components/Header';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/app/components/ui/button';
import { BanknoteIcon, LockIcon, UnlockIcon } from 'lucide-react';
// import { VaultDetails } from '@/app/components/VaultDetails';
import { VAULT_INFO, VAULT_ADDRESSES } from '@/app/config/vaults';

export default function SavingsPage() {
    const { user, login } = usePrivy();
    const smartWalletAddress = user?.smartWallet?.address;

    if (!smartWalletAddress) {
        return (
            <div className="min-h-screen bg-green-50/40 relative">
                {/* Background gradient elements */}
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4" />

                <Header />
                <main className="container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto text-center space-y-6">
                        <h1 className="text-3xl font-bold tracking-tight">Savings Account</h1>
                        <p className="text-muted-foreground">
                            Connect your wallet to access your savings account and start earning yield.
                        </p>
                        <Button
                            size="lg"
                            onClick={login}
                            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all animate-pulse"
                        >
                            Connect
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-green-50/40 pb-16 md:pb-0">
            {/* Background gradient elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-green-300/15 to-teal-400/10 rounded-full filter blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-green-400/15 to-teal-300/10 rounded-full filter blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3" />

            {/* Hide header on mobile, show on md breakpoint and above */}
            <div className="hidden md:block">
                <Header />
            </div>

            <main className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
                <header className="mb-8">
                    <div className="flex flex-col gap-1 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                            Savings Account
                        </h1>
                        <p className="text-slate-500">Earn yield on your deposits</p>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {VAULT_ADDRESSES.map(vaultAddress => {
                            const vaultInfo = VAULT_INFO[vaultAddress];
                            return (
                                <div key={vaultAddress} className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden">
                                    {/* Background gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />

                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                                                <BanknoteIcon className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-lg font-semibold">{vaultInfo.name}</h3>
                                        </div>

                                        <p className="text-slate-600 mb-4">{vaultInfo.description}</p>

                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg mb-4">
                                            <p className="text-amber-800">
                                                <strong>Coming soon!</strong> This upcoming feature will allow you to earn yield on your deposits. Stay tuned for updates.
                                            </p>
                                        </div>

                                        {/* Display vault details when available */}
                                        {/* <VaultDetails vaultAddress={vaultAddress} userAddress={smartWalletAddress} /> */}

                                        <div className="grid grid-cols-2 gap-4">
                                            <Button disabled className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-sm transition-all">
                                                <LockIcon className="mr-2 h-4 w-4" />
                                                Stake
                                            </Button>
                                            <Button disabled className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-sm transition-all">
                                                <UnlockIcon className="mr-2 h-4 w-4" />
                                                Unstake
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
} 