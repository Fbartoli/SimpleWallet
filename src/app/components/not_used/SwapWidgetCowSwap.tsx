// 'use client'

// import { SmartWalletClientType, useSmartWallets } from "@privy-io/react-auth/smart-wallets"
// // @ts-ignore
// import { CowSwapWidget, CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-react'
// import { base, sepolia } from "wagmi/chains"
// import { Account, Chain, Client, createPublicClient, http, TransactionRequest, Transport } from "viem"
// import { eip5792Actions } from "viem/experimental"
// import { Config } from "wagmi"
// import { BrowserProvider, FallbackProvider, JsonRpcProvider, JsonRpcSigner } from "ethers"
// import { getClient } from '@wagmi/core'

// interface SwapWidgetProps {
//   userAddress: `0x${string}`
// }

// type CallbackFunction = (...args: any[]) => void

// function isCallbackFunction(args: unknown): args is CallbackFunction {
//   return typeof args === 'function'
// }

// function transformToCallback(args: unknown): CallbackFunction | null {
//   if (isCallbackFunction(args)) {
//     return args
//   }
//   return null
// }

// interface EthereumProvider {
//   request(args: { method: string; params?: any[] }): Promise<any>
//   on(event: string, args: unknown): void
//   enable(): Promise<void>
// }

// class SafeProvider implements EthereumProvider {
//   constructor(private viemProvider: JsonRpcSigner, private client: SmartWalletClientType) {
//     console.log(viemProvider)
//   }
  
//   on(event: string, args: unknown): void {
//     console.log('[COW-App] on', event, args)
//     const callback = transformToCallback(args)
//     if (callback) {
//       console.log('[COW-App] callback', typeof callback)
//       callback()
//     }
//   } 

//   onProviderEvent(event: string, args: unknown): void {
//     console.log('[COW-App] onProvider', event, args)
//   }

//   async connect(): Promise<void> {
//     return;
//   }
  
//   async enable(): Promise<void> {
//     console.log('[COW-App] enable', this.viemProvider)
//     return 
//   }

//   async request(args: { method: string; params?: any[] }): Promise<any> {

//     if (args.method === 'eth_requestAccounts') {
//       return Promise.resolve([this.viemProvider.address])
//     }
//     if (args.method === 'eth_accounts') {
//       return Promise.resolve([this.viemProvider.address])
//     }
//     if (args.method === 'eth_sendTransaction') {
//       if (!args.params ) {
//         throw new Error('Invalid params')
//       }
//       console.log('[COW-App] eth_sendTransaction', args.params)
//       const tx = args.params as TransactionRequest
//       const userOp = await this.client.prepareUserOperation({
//         calls: [{
//           to: tx.to!,
//           data: tx.data!,
//           value: tx.value ?? BigInt(0),
//         }],
//       })
//       console.log('[COW-App] eth_sendTransaction userOp', userOp)
//       const result = await this.client.sendUserOperation(userOp)
//       console.log('[COW-App] eth_sendTransaction result', result)
//       return result
//     }
//     if (args.method === 'eth_call') {
//       if (!args.params ) {
//         throw new Error('Invalid params')
//       }
//       const [to, data] = args.params
//       const result = await this.viemProvider.provider._send({method: 'eth_call', params: [to, data], jsonrpc: '2.0', id: 1})
//       return result[0].result
//     }
//     // if (args.method === 'eth_blockNumber') {
//     //   const result = await await this.client.transport.request({method: 'eth_blockNumber', params: [], jsonrpc: '2.0', id: 1})
//     //   return result
//     // }
//     // if (args.method === 'eth_getTransactionCount') {
//     //   if (!args.params ) {
//     //     throw new Error('Invalid params')
//     //   }
//     //   const result = await publicClient.getTransactionCount({ address: this.viemProvider.account.address })
//     //   return result
//     // }
//     // if (args.method === 'eth_estimateGas') {
//     //   if (!args.params ) {
//     //     throw new Error('Invalid params')
//     //   }
//     //   const tx = args.params as TransactionRequest
//     //   const userOp = await this.viemProvider.estimateUserOperationGas({
//     //     calls: [{
//     //       to: tx.to!,
//     //       data: tx.data!,
//     //       value: tx.value ?? BigInt(0),
//     //     }],
//     //   })
//     //   return userOp
//     // }
//     // if (args.method === 'eth_chainId') {
//     //   const result = await this.viemProvider.request(args as any)
//     //   return result
//     // }
//     // if (args.method === 'eth_getCode') {
//     //   console.log('[COW-App] eth_getCode', this.viemProvider.address)
//     //   const result = await this.viemProvider.provider._send({method: 'eth_getCode', params: [this.viemProvider.address], jsonrpc: '2.0', id: 1})
//     //   console.log('[COW-App] eth_getCode result', result)
//     //   return result
//     // }
//     // if (args.method === 'wallet_getCapabilities') {
//     //   console.log('[COW-App] wallet_getCapabilities')
//     //   const extendedClient = await this.clie.extend(eip5792Actions())
//     //   const result = await extendedClient.getCapabilities()
//     //   console.log('[COW-App] wallet_getCapabilities result', result)
//     //   return result
//     // }
//     console.log('[COW-App] request', args)
//     const result = await this.viemProvider.provider._send(args as any)
//     console.log('[COW-App] request result', args, result[0].result)
//     return result[0].result
//   }
//   send(request: any, callback: (error: any, response?: any) => void): void {
//     console.log('[COW-App] send', request)
//     if (!request) callback('Undefined request');
//     this.request(request)
//       .then((result) => callback(null, { jsonrpc: '2.0', id: request.id, result }))
//       .catch((error) => callback(error, null));
//   }
// }

// export function clientToProvider(client: Client<Transport, Chain>) {
//   const { chain, transport } = client
//   const network = {
//     chainId: chain.id,
//     name: chain.name,
//     ensAddress: chain.contracts?.ensRegistry?.address,
//   }
//   if (transport.type === 'fallback') {
//     const providers = (transport.transports as ReturnType<Transport>[]).map(
//       ({ value }) => new JsonRpcProvider(value?.url, network),
//     )
//     if (providers.length === 1) return providers[0]
//     return new FallbackProvider(providers)
//   }
//   return new JsonRpcProvider(transport.url, network)
// }

// export function SwapWidget({ userAddress }: SwapWidgetProps) {
//   const { client } = useSmartWallets()
//   const params: CowSwapWidgetParams = {
//     "appCode": "My Cool App", // Name of your app (max 50 characters)
//     "width": "100%", // Width in pixels (or 100% to use all available space)
//     "height": "640px",
//     "chainId": 8453, // 1 (Mainnet), 100 (Gnosis), 11155111 (Sepolia)
//     "tokenLists": [ // All default enabled token lists. Also see https://tokenlists.org
//         "https://files.cow.fi/tokens/CoinGecko.json",
//         "https://files.cow.fi/tokens/CowSwap.json"
//     ],
//     "tradeType": TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED
//     "sell": { // Sell token. Optionally add amount for sell orders
//         "asset": "WETH",
//         "amount": "0.001"
//     },
//     "buy": { // Buy token. Optionally add amount for buy orders
//         "asset": "cbBTC",
//         "amount": "0"
//     },
//     "enabledTradeTypes": [ // TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED
//         TradeType.SWAP,
//     ],
//     "theme": "dark", // light/dark or provide your own color palette
//     "standaloneMode": false,
//     "disableToastMessages": false,
//     "disableProgressBar": false,
//     "partnerFee": { // Partner fee, in Basis Points (BPS) and a receiver address
//         "bps": 10,
//         "recipient": {
//             "8453": "0xf580ECFD347EDD88f048d694f744C790AF8e20e4",
//         }
//     },
//     "hideBridgeInfo": true,
//     "hideOrdersTable": true,
//     "images": {},
//     "sounds": {},
//     "customTokens": []
//   }

//   // const safeProvider = new SafeProvider(clientToProvider(client!), client!)
//   return (
//     <div className="space-y-6 p-4 border rounded-lg bg-card">
//       <h2 className="text-lg font-semibold">Swap Tokens</h2>
//       <CowSwapWidget
//         params={params}
//         provider={clientToProvider(client!)}
//       />
//     </div>
//   )
// } 