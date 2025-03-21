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
  transaction_type?: 'Sender' | 'Receiver';
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
  chain_ids?: string | 'all' | null,
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