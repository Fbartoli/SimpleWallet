import { NextRequest, NextResponse } from 'next/server';
import { DuneClient } from '@/lib/DuneClient';
import { getWhitelistedAddresses } from '@/config/constants';

if (!process.env.DUNE_API_KEY) {
    throw new Error('DUNE_API_KEY environment variable is not set');
}

const duneClient = new DuneClient({
    apiKey: process.env.DUNE_API_KEY,
});

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const address = searchParams.get('address');
        const chainIds = searchParams.get('chain_ids');
        const limit = searchParams.get('limit');

        if (!address) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        // Validate address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json(
                { error: 'Invalid wallet address format' },
                { status: 400 }
            );
        }

        // Fetch balances from Dune
        const response = await duneClient.getTokenBalances(address, {
            chain_ids: chainIds || undefined,
            limit: limit ? parseInt(limit) : undefined,
        });

        if (!response.balances) {
            return NextResponse.json(
                { error: 'No balance data received' },
                { status: 500 }
            );
        }

        // Filter to only include whitelisted tokens
        const whitelistedAddresses = getWhitelistedAddresses();
        const filteredBalances = response.balances.filter(balance =>
            whitelistedAddresses.includes(balance.address.toLowerCase())
        );

        // Sort by USD value (descending) if available, otherwise by symbol
        const sortedBalances = filteredBalances.sort((a, b) => {
            // First sort by amount (descending)
            const amountA = Number(a.amount) / Math.pow(10, a.decimals);
            const amountB = Number(b.amount) / Math.pow(10, b.decimals);

            if (amountA !== amountB) {
                return amountB - amountA;
            }

            // If amounts are equal, sort by symbol alphabetically
            return a.symbol.localeCompare(b.symbol);
        });

        const result = {
            ...response,
            balances: sortedBalances,
            filtered: true,
            whitelisted_count: sortedBalances.length,
            total_count: response.balances.length
        };

        // Add cache headers for better performance
        const headers = new Headers();
        headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=30');
        headers.set('CDN-Cache-Control', 'public, s-maxage=5');
        headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=5');

        return NextResponse.json(result, { headers });

    } catch (error) {
        console.error('Error fetching balances:', error);

        // Return more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('HTTP error! status: 401')) {
                return NextResponse.json(
                    { error: 'Invalid API key' },
                    { status: 401 }
                );
            }
            if (error.message.includes('HTTP error! status: 429')) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. Please try again later.' },
                    { status: 429 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to fetch balances' },
            { status: 500 }
        );
    }
} 