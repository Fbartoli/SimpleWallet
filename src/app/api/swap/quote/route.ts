import { NextResponse } from 'next/server'
import { TOKENS } from '@/stores/useTokenStore'
import { type TokenSymbol } from '@/stores/useTokenStore'
import { FEE_RECIPIENT } from '@/config/constants'

const SWAP_FEE_CONFIG = {
  swapFeeRecipient: FEE_RECIPIENT,
  tradeSurplusRecipient: FEE_RECIPIENT
}

export async function GET(request: Request) {
  if (!process.env.OX_API_KEY) {
    return NextResponse.json({ error: '0x API key is not set' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const sellToken = searchParams.get('sellToken') as TokenSymbol
  const buyToken = searchParams.get('buyToken') as TokenSymbol
  const sellAmount = searchParams.get('sellAmount')
  const taker = searchParams.get('taker')
  console.log('sellToken', sellToken)
  console.log('buyToken', buyToken)
  console.log('sellAmount', sellAmount)
  console.log('taker', taker)
  if (!sellToken || !buyToken || !sellAmount || !taker) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  const headers = {
    "Content-Type": "application/json",
    "0x-api-key": process.env.OX_API_KEY,
    "0x-version": "v2",
  }

  try {
    const sellTokenInfo = TOKENS[sellToken]
    const buyTokenInfo = TOKENS[buyToken]

    if (!sellTokenInfo || !buyTokenInfo) {
      return NextResponse.json({ error: 'Invalid token selection' }, { status: 400 })
    }

    const sellAmountInBaseUnits = (BigInt(Math.floor(Number(sellAmount) * 10 ** sellTokenInfo.decimals))).toString()

    const priceParams = new URLSearchParams({
      chainId: '8453',
      sellToken: sellTokenInfo.address,
      buyToken: buyTokenInfo.address,
      sellAmount: sellAmountInBaseUnits,
      taker,
      swapFeeBps: '50',
      swapFeeToken: sellTokenInfo.address,
      ...SWAP_FEE_CONFIG,
    })
    console.log('priceParams', priceParams.toString())
    const response = await fetch(
      `https://api.0x.org/swap/allowance-holder/quote?${priceParams.toString()}`,
      { headers }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error || 'Failed to fetch quote' }, { status: response.status })
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