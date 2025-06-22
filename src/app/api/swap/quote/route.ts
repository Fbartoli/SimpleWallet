import { NextResponse } from "next/server"
import { TOKENS, type TokenSymbol } from "@/stores/useTokenStore"
import { FEE_RECIPIENT } from "@/config/constants"
import { logger } from "@/lib/logger"

const SWAP_FEE_CONFIG = {
  swapFeeRecipient: FEE_RECIPIENT,
  tradeSurplusRecipient: FEE_RECIPIENT,
}

export async function GET(request: Request) {
  if (!process.env.OX_API_KEY) {
    return NextResponse.json({ error: "0x API key is not set" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const sellToken = searchParams.get("sellToken") as TokenSymbol
  const buyToken = searchParams.get("buyToken") as TokenSymbol
  const sellAmount = searchParams.get("sellAmount")
  const taker = searchParams.get("taker")
  if (!sellToken || !buyToken || !sellAmount || !taker) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
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
      return NextResponse.json({ error: "Invalid token selection" }, { status: 400 })
    }

    const sellAmountInBaseUnits = (BigInt(Math.floor(Number(sellAmount) * 10 ** sellTokenInfo.decimals))).toString()

    const priceParams = new URLSearchParams({
      chainId: "8453",
      sellToken: sellTokenInfo.address,
      buyToken: buyTokenInfo.address,
      sellAmount: sellAmountInBaseUnits,
      taker,
      swapFeeBps: "50",
      swapFeeToken: sellTokenInfo.address,
      ...SWAP_FEE_CONFIG,
    })
    const response = await fetch(
      `https://api.0x.org/swap/allowance-holder/quote?${priceParams.toString()}`,
      { headers }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error || "Failed to fetch quote" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Quote fetch error", {
      component: "swap-quote-api",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch quote" },
      { status: 500 }
    )
  }
} 