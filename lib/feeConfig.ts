/**
 * Fee Configuration and Management
 * Handles 0.5% fee deduction and routing to fee wallets
 */

// Fee wallet addresses for different chains
export const FEE_CONFIG = {
  SOL: {
    wallet: '4EvhYFXMLmdkDMKTf8suNr2qAs4mer8ZcwvUN1in9DJT',
    feePercent: 0.5,
    feeBps: 50, // 0.5% in basis points (1 bps = 0.01%)
    chain: 'solana',
  },
  EVM: {
    wallet: '0xd1ae4daa694be6e43ba8055ce781384c5d94de29',
    feePercent: 0.5,
    feeBps: 50,
    chain: 'ethereum',
  },
};

export type ChainType = 'solana' | 'ethereum' | 'polygon' | 'arbitrum';

/**
 * Get fee configuration for a specific chain
 */
export function getFeeConfig(chain: ChainType = 'solana') {
  if (chain === 'solana') {
    return FEE_CONFIG.SOL;
  }
  return FEE_CONFIG.EVM;
}

/**
 * Calculate 0.5% fee amount
 * @param amount - Original trade amount
 * @returns Fee amount (0.5% of trade)
 */
export function calculateFee(amount: number): number {
  return Math.floor(amount * 0.005); // 0.5% = 0.005
}

/**
 * Calculate net amount after fee deduction
 * @param amount - Original amount
 * @returns Net amount after 0.5% fee
 */
export function calculateNetAmount(amount: number): number {
  return Math.floor(amount * 0.995); // 99.5% of original
}

/**
 * Get fee wallet address for a chain
 */
export function getFeeWallet(chain: ChainType = 'solana'): string {
  const config = getFeeConfig(chain);
  return config.wallet;
}

/**
 * Build fee transaction metadata
 */
export interface FeeTransactionMetadata {
  tradeId: string;
  tokenIn: string;
  tokenOut: string;
  feeAmount: number;
  feePercent: number;
  feeBps: number;
  feeWallet: string;
  timestamp: number;
  chain: ChainType;
}

/**
 * Create fee transaction metadata
 */
export function createFeeMetadata(
  tradeId: string,
  tokenIn: string,
  tokenOut: string,
  feeAmount: number,
  chain: ChainType = 'solana'
): FeeTransactionMetadata {
  const config = getFeeConfig(chain);
  return {
    tradeId,
    tokenIn,
    tokenOut,
    feeAmount,
    feePercent: config.feePercent,
    feeBps: config.feeBps,
    feeWallet: config.wallet,
    timestamp: Date.now(),
    chain,
  };
}
