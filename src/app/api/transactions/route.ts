import { DuneClient } from '@/lib/DuneClient';
import { NextRequest, NextResponse } from 'next/server';
import { base } from 'viem/chains';

export async function GET(request: NextRequest) {
    try {
        // Get address from query params
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');
        const limit = searchParams.get('limit');

        if (!address) {
            return NextResponse.json(
                { error: 'Address is required' },
                { status: 400 }
            );
        }

        // Initialize Dune client with server-side API key
        const client = new DuneClient({
            apiKey: process.env.DUNE_API_KEY!, // Note: Remove NEXT_PUBLIC_ prefix
        });

        const response = await client.getTransactions('0x0000000000000039cd5e8aE05257CE51C473ddd1', {
            chain_ids: base.id.toString(),
            limit: limit ? parseInt(limit) : 10,
            decode: true,
            log_address: address,
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
} 