export const VAULT_ADDRESSES = [
  "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",
  "0x1c155be6bC51F2c37d472d4C2Eba7a637806e122", // Replace with actual vault address
] as const;

export type VaultAddress = typeof VAULT_ADDRESSES[number];

interface VaultInfo {
  address: VaultAddress;
  name: string;
  description: string;
  token: string;
}

export const VAULT_INFO: Record<VaultAddress, VaultInfo> = {
  "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A": {
    address: "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",
    name: "USD Vault",
    description: "Earn yield on your USD deposits",
    token: "USDC"
  },
  "0x1c155be6bC51F2c37d472d4C2Eba7a637806e122": {
    address: "0x1c155be6bC51F2c37d472d4C2Eba7a637806e122",
    name: "EUR Vault",
    description: "Earn yield on your EUR deposits",
    token: "EURC"
  },
} as const; 