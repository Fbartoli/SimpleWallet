export const MAINNET_TOKENS = [
  {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    image: "https://example.com/eth.png",
  },
];
if (!process.env.NEXT_PUBLIC_FEE_RECIPIENT) {
  throw new Error("NEXT_PUBLIC_FEE_RECIPIENT is not set");
}
export const MAINNET_TOKENS_BY_SYMBOL = {};
export const MAX_ALLOWANCE = "0xffffffffffffffffffffffffffffffffffffffff";
export const DEFAULT_FEE_BPS = '100';
export const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT