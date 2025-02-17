import { type Address, type TransactionRequest } from 'viem'

export interface ZeroXQuote {
  to: string
  data: string
  value: string
  buyAmount: string
  estimatedGas: string
  price: string
  guaranteedPrice: string
  gas: string
  transaction: TransactionRequest
  sellToken: Address
  sellAmount: string
  buyToken: Address
  fees: {
    integratorFee?: {
      amount: string
      token: Address
    }
  }
  issues?: {
    allowance?: {
      spender: Address
      actual: string
    }
  }
} 