import type {
  DuneActivity,
  DuneActivityParams,
  DuneActivityResponse,
  DuneBalance,
  DuneBalanceParams,
  DuneBalanceResponse,
  DuneClientConfig,
  DuneTokenPrice,
  DuneTokenPriceParams,
  DuneTokenPriceResponse,
  DuneTransaction,
  DuneTransactionParams,
  DuneTransactionResponse,
} from "@/types/dune"

export class DuneClient {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(config: DuneClientConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || "https://api.sim.dune.com/"
  }

  /**
   * Get transactions for a given address across several EVM chains
   * @param address - Wallet address to get transactions for
   * @param params - Optional query parameters
   * @returns Promise with transaction data
   */
  async getTransactions(
    address: string,
    params?: DuneTransactionParams
  ): Promise<DuneTransactionResponse> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    const url = `${this.baseUrl}v1/transactions/evm/${address}${queryString ? `?${queryString}` : ""
      }`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Dune-Api-Key": this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Helper method to get all transactions for an address by handling pagination
   * @param address - Wallet address to get transactions for
   * @param params - Optional query parameters (excluding offset)
   * @returns Promise with all transactions
   */
  async getAllTransactions(
    address: string,
    params?: Omit<DuneTransactionParams, "offset">
  ): Promise<DuneTransaction[]> {
    const allTransactions: DuneTransaction[] = []
    let nextOffset: string | null = null

    do {
      const response = await this.getTransactions(address, {
        ...params,
        offset: nextOffset || undefined,
      })

      allTransactions.push(...response.transactions)
      nextOffset = response.next_offset
    } while (nextOffset)

    return allTransactions
  }

  /**
   * Get token prices for given addresses across EVM chains
   * @param addresses - Array of token addresses to get prices for
   * @param params - Optional query parameters
   * @returns Promise with token price data
   */
  async getTokenPrice(
    address: string | "native",
    params?: DuneTokenPriceParams
  ): Promise<DuneTokenPriceResponse> {
    const queryParams = new URLSearchParams()


    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = `${this.baseUrl}beta/tokens/evm/${address}?${queryParams.toString()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Dune-Api-Key": this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getBatchTokenPrices(
    addresses: string[],
    params?: Omit<DuneTokenPriceParams, "addresses">
  ): Promise<DuneTokenPrice[]> {
    const batchSize = 100 // Dune's recommended batch size
    const allPrices: DuneTokenPrice[] = []

    // Split addresses into batches
    for (let i = 0; i < addresses.length; i += batchSize) {
      const response = await this.getTokenPrice(addresses[i]!, params)
      allPrices.push(...response.prices)
    }

    return allPrices
  }

  /**
   * Get token balances for a given address across EVM chains
   * @param address - Wallet address to get balances for
   * @param params - Optional query parameters
   * @returns Promise with token balance data
   */
  async getTokenBalances(
    address: string,
    params?: DuneBalanceParams
  ): Promise<DuneBalanceResponse> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    const url = `${this.baseUrl}v1/evm/balances/${address}${queryString ? `?${queryString}` : ""
      }`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Sim-Api-Key": this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Helper method to get all token balances for an address by handling pagination
   * @param address - Wallet address to get balances for
   * @param params - Optional query parameters (excluding offset)
   * @returns Promise with all token balances
   */
  async getAllTokenBalances(
    address: string,
    params?: Omit<DuneBalanceParams, "offset">
  ): Promise<DuneBalance[]> {
    const allBalances: DuneBalance[] = []
    let nextOffset: string | null = null

    do {
      const response = await this.getTokenBalances(address, {
        ...params,
        offset: nextOffset || undefined,
      })

      allBalances.push(...response.balances)
      nextOffset = response.next_offset
    } while (nextOffset)

    return allBalances
  }

  /**
   * Get token information for a given contract address
   * @param contractAddress - Contract address or 'native' for native token
   * @param params - Optional query parameters
   * @returns Promise with token info data
   */
  async getTokenInfo(
    contractAddress: string,
    params?: DuneTokenInfoParams
  ): Promise<DuneTokenInfoResponse> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    const url = `${this.baseUrl}v1/evm/token-info/${contractAddress}${queryString ? `?${queryString}` : ""}`

    console.log("url", url)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Sim-Api-Key": this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get activity for a given address across EVM chains
   * @param address - Wallet address to get activity for
   * @param params - Optional query parameters
   * @returns Promise with activity data
   */
  async getActivity(
    address: string,
    params?: DuneActivityParams
  ): Promise<DuneActivityResponse> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    const url = `${this.baseUrl}v1/evm/activity/${address}${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Sim-Api-Key": this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Helper method to get all activity for an address by handling pagination
   * @param address - Wallet address to get activity for
   * @param params - Optional query parameters (excluding offset)
   * @returns Promise with all activity items
   */
  async getAllActivity(
    address: string,
    params?: Omit<DuneActivityParams, "offset">
  ): Promise<DuneActivity[]> {
    const allActivity: DuneActivity[] = []
    let nextOffset: string | null = null

    do {
      const response = await this.getActivity(address, {
        ...params,
        offset: nextOffset || undefined,
      })

      allActivity.push(...response.activity)
      nextOffset = response.next_offset
    } while (nextOffset)

    return allActivity
  }
}

export interface DuneTokenInfoParams {
  chain_ids?: string
  limit?: number
  offset?: string
}

export interface DuneTokenInfo {
  chain: string
  chain_id: number
  symbol: string
  name: string | null
  decimals: number | null
  price_usd: number | null
  total_supply: string | null
  market_cap: number | null
  logo: string | null
}

export interface DuneTokenInfoResponse {
  contract_address: string
  tokens: DuneTokenInfo[]
  next_offset: string | null
} 