'use client'
import { PiggyBank } from 'lucide-react';
import { useAuth, useIBANs } from "@monerium/sdk-react-provider"
import { useWallets } from '@privy-io/react-auth';
import Header from '@/app/components/Header';

export default function BankAccount() {
    const { authorize, isAuthorized, isLoading } = useAuth()
    const { data: ibanData } = useIBANs();
    const { wallets } = useWallets()
    const handleAuthorize = async () => {
        const wallet = wallets[0];
        const provider = await wallet!.getEthereumProvider();
        const signature = await provider.request({
            method: 'personal_sign',
            params: ["I hereby declare that I am the address owner.", wallet!.address],
        });
        authorize({ address: wallets[0]?.address, chain: '10200', signature })
    }

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8">
                <header className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                        Bank Account
                    </h1>
                    <p className="text-slate-500">Link your bank account for fiat transactions</p>
                </header>

                <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />

                    <div className="relative space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                                <PiggyBank className="h-4 w-4" />
                            </div>
                            <h3 className="text-lg font-semibold">Bank Account Details</h3>
                        </div>

                        <div className="space-y-4">
                            {isLoading && (
                                <div className="p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                    <p>Loading account details...</p>
                                </div>
                            )}

                            {isAuthorized ? (
                                <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
                                    <p>Your bank account is connected</p>
                                    {ibanData && (
                                        <div className="mt-2 text-sm">
                                            <p>Available IBANs:</p>
                                            <pre className="mt-1">{JSON.stringify(ibanData, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <button
                                        onClick={handleAuthorize}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
                                    >
                                        Connect Bank Account
                                    </button>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Connect your bank account to enable fiat deposits and withdrawals
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 