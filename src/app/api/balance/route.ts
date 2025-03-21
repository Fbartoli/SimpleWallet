import { NextRequest, NextResponse } from 'next/server';
import { DuneClient } from '@/lib/DuneClient';

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

        // Fetch balances from Dune
        const balances = await duneClient.getTokenBalances(address, {
            chain_ids: chainIds || undefined,
            limit: limit ? parseInt(limit) : undefined,
        });

        return NextResponse.json(balances);
    } catch (error) {
        console.error('Error fetching balances:', error);
        return NextResponse.json(
            { error: 'Failed to fetch balances' },
            { status: 500 }
        );
    }
} 