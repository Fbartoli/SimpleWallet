export interface DuneTransaction {
  address: string;
  block_hash: string;
  block_number: number;
  block_time: string;
  block_version: number;
  chain: string;
  chain_id: number;
  data: string;
  from: string;
  gas_price: string;
  hash: string;
  index: number;
  nonce: string;
  to: string;
  value: string;
  logs?: DuneTransactionLog[];
  effective_gas_price?: string;
  gas_used?: string;
  transaction_type?: "Sender" | "Receiver";
  decoded?: {
    inputs: {
      name: string;
      type: string;
      value: string;
    }[];
    name: string;
  };
}

export interface DuneTransactionLog {
  address: string;
  data: string;
  topics: string[];
  decoded?: {
    inputs: {
      name: string;
      type: string;
      value: string;
    }[];
    name: string;
  };
}

export interface DuneTransactionResponse {
  next_offset: string | null;
  transactions: DuneTransaction[];
}

export interface DuneTransactionParams {
  offset?: string;
  limit?: number;
  block_time?: number;
  chain_ids?: string;
  to?: string;
  method_id?: string;
  decode?: boolean;
  log_address?: string;
  topic0?: string;
  min_block_number?: number;
}

export interface DuneTokenPrice {
  address: string;
  chain_id: number;
  decimals: number;
  price: string;
  symbol: string;
  token_metadata?: {
    logo?: string;
    url?: string;
  };
  pool_size?: string;
  low_liquidity?: boolean;
}

export interface DuneTokenPriceParams {
  chain_ids?: string | "all" | null,
  limit?: number | null,
  offset?: string | null,
}

export interface DuneTokenPriceResponse {
  prices: DuneTokenPrice[];
  request_time: string;
  response_time: string;
}

export interface DuneClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface DuneBalance {
  address: string;
  chain_id: number;
  amount: string;
  decimals: number;
  symbol: string;
  token_metadata?: {
    logo?: string;
    url?: string;
  };
}

export interface DuneBalanceParams {
  chain_ids?: string | "all";
  limit?: number;
  offset?: string;
}

export interface DuneBalanceResponse {
  balances: DuneBalance[];
  next_offset: string | null;
  request_time: string;
  response_time: string;
}

export interface DuneTokenInfo {
  chain_id: number;
  chain: string;
  price_usd: number;
  pool_size: number;
  total_supply: string;
  fully_diluted_value: number;
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
}

export interface DuneTokenInfoResponse {
  tokens_info: DuneTokenInfo[];
}

export interface DuneTokenInfoParams {
  chain_ids?: string | "all";
  limit?: number;
  offset?: string;
}

// Activity API types
export interface DuneActivity {
  chain_id: number;
  block_number: number;
  block_time: string;
  tx_hash: string;
  type: "receive" | "send" | "mint" | "burn" | "swap" | "approve" | "call";
  asset_type: "native" | "erc20" | "erc721";
  token_address?: string;
  from: string;
  to?: string;
  value: string;
  value_usd?: number;
  token_metadata?: {
    symbol?: string;
    decimals?: number;
    price_usd?: number;
    pool_size?: number;
  };
}

export interface DuneActivityResponse {
  activity: DuneActivity[];
  next_offset: string | null;
}

export interface DuneActivityParams {
  limit?: number;
  offset?: string;
  chain_ids?: string | "all";
}