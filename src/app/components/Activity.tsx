'use client';

import { useEffect, useState } from 'react';
import { DuneTransaction } from '@/types/dune';
import { formatDistanceToNow } from 'date-fns';

interface ActivityProps {
    address: string;
}

export function Activity({ address }: ActivityProps) {
    const [transactions, setTransactions] = useState<DuneTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch(
                    `/api/transactions?address=${address}&limit=5`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch transactions');
                }

                const data = await response.json();
                setTransactions(data.transactions);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [address]);

    if (loading) {
        return (
            <div className="p-4 rounded-lg border">
                <p className="text-center text-gray-500">Loading transactions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                <p className="text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <div className="divide-y rounded-lg border">
                {transactions.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">No recent transactions</p>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.hash} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{tx.transaction_type}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatDistanceToNow(new Date(tx.block_time), { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <a
                                        href={`https://etherscan.io/tx/${tx.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View on Etherscan
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 