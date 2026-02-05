import { getAddress } from "ethers";

// Default chain configuration (hidden from UI)
export const DEFAULT_CHAIN = "polygon";
export const POLYGON_CHAIN_ID = 137;

// Token configuration (hidden from UI)
export const TOKEN_CONFIG = {
  name: "USD",
  symbol: "USD",
  decimals: 6,
  chain: "polygon",
  contractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
};

// Polygon USDC: bridged (USDC.e) + native (Circle USDC) – dono ka balance sum karke dikhate hain
export const USDC_POLYGON = getAddress("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"); // USDC.e
export const USDC_POLYGON_NATIVE = getAddress("0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"); // Native USDC

// ERC20 ABI for token operations
export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

// Helper function to normalize addresses
export function normalizeAddress(address: string): string {
  return getAddress(address);
}
