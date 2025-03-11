import { NextResponse } from 'next/server'

const headers = {
  "Content-Type": "application/json",
  "0x-api-key": process.env.OX_API_KEY || '',
  "0x-version": "v2",
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (!process.env.OX_API_KEY) {
    return NextResponse.json({ error: '0x API key is not set' }, { status: 500 })
  }
  try {
    const response = await fetch(
      `https://api.0x.org/swap/allowance-holder/quote?${searchParams.toString()}`,
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('0x API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`0x API error: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Quote fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch quote' },
      { status: 500 }
    )
  }
} 