'use client'

import { useAuth, useIBANs } from '@monerium/sdk-react-provider'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import {
    Loader2,
    ExternalLink,
    CheckCircle,
    XCircle,
    Wallet
} from 'lucide-react'

import { createWalletClient, custom, Hex } from 'viem';
import { gnosisChiado } from 'viem/chains';
import type { IBAN as MoneriumIBAN } from '@monerium/sdk-react-provider';

export function MoneriumAuth() {
    const { user } = usePrivy()
    const { wallets } = useWallets();
    const {
        authorize,
        isAuthorized,
        isLoading,
    } = useAuth()
    // Fetch IBANs for the connected wallet
    const {
        data: ibansData,
        isLoading: ibansLoading,
        isError: ibansError,
        error: ibansErrorDetails
    } = useIBANs({
        query: {
            enabled: isAuthorized, // Only fetch when authorized
        }
    })

    const handleConnect = async () => {
        const wallet = wallets[0];
        if (!wallet) {
            throw new Error('No wallet found');
        }
        const provider = await wallet.getEthereumProvider();
        const walletClient = createWalletClient({
            account: wallet.address as Hex,
            chain: gnosisChiado,
            transport: custom(provider),
        });

        authorize({
            email: user?.email?.address as string,
            address: user?.wallet?.address as `0x${string}`,
            chain: gnosisChiado.id,
            signature: await walletClient.signMessage({ message: 'I hereby declare that I am the address owner.' })
        })

    }

    if (!user?.smartWallet?.address) {
        return (
            <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
                <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <p className="text-sm">Please connect your wallet first to use Monerium</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center">
                            <ExternalLink className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Monerium Integration</h3>
                            <p className="text-sm text-gray-500">Connect your wallet to Monerium</p>
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                        {isAuthorized ? (
                            <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Connected</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-gray-500">
                                <XCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Not Connected</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Wallet Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Connected Wallet:</p>
                    <p className="text-sm font-mono text-gray-900">{user.smartWallet?.address}</p>
                </div>

                {/* IBAN Information */}
                {isAuthorized && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-green-800 mb-2">IBAN Information</p>
                        {ibansLoading ? (
                            <div className="flex items-center gap-2 text-green-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading IBANs...</span>
                            </div>
                        ) : ibansError ? (
                            <div className="text-red-600">
                                <p className="text-sm font-medium">Error loading IBANs</p>
                                <p className="text-xs">{String(ibansErrorDetails)}</p>
                            </div>
                        ) : ibansData?.ibans && ibansData.ibans.length > 0 ? (
                            <div className="space-y-2">
                                {ibansData.ibans.map((iban: MoneriumIBAN, index: number) => (
                                    <div key={index} className="p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-mono font-semibold text-gray-900 mb-1">
                                                    {iban.iban}
                                                </p>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    BIC: {iban.bic}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {iban.chain}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 font-mono">
                                                    {iban.address.slice(0, 6)}...{iban.address.slice(-4)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-green-700">No IBANs found for this wallet</p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    {!isAuthorized ? (
                        <Button
                            onClick={handleConnect}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Connecting...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Connect to Monerium</span>
                                </div>
                            )}
                        </Button>
                    ) : null}
                </div>

                {/* Information */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">
                        <strong>What happens when you connect:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Read your profile details</li>
                        <li>• Read your payment details and transaction history</li>
                        <li>• Read your IBAN details linked to your wallet</li>
                        <li>• Trigger outgoing payments (with your explicit permission each time)</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-2">
                        Review the app&apos;s terms of service and privacy policy before connecting.
                    </p>
                </div>
            </div>
        </div>
    )
}   