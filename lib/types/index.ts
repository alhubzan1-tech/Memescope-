// Core type definitions for Memescope

export interface User {
  id: string;
  wallet: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  slippageTolerance: number; // 0.1 - 50
  defaultChain: 'solana' | 'ethereum' | 'polygon';
  rpcUrl?: string;
  notifications: boolean;
  darkMode: boolean;
}

export interface Token {
  ca: string;
  chainId: 'solana' | 'ethereum' | 'polygon' | 'arbitrum';
  name: string;
  symbol: string;
  decimals: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  logoUri?: string;
  verified: boolean;
  createdAt?: Date;
}

export interface TokenDetails extends Token {
  fdv: number;
  totalSupply: number;
  circulatingSupply: number;
  website?: string;
  twitter?: string;
  description?: string;
  topHolders: Holder[];
}

export interface Holder {
  address: string;
  percentage: number;
  balance: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  holdings: Holding[];
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  dayGainLoss: number;
  dayGainLossPercent: number;
}

export interface Holding {
  tokenCA: string;
  chainId: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  gainLoss: number;
  gainLossPercent: number;
  value: number;
}

export interface Trade {
  id: string;
  userId: string;
  tokenCA: string;
  chainId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  inputAmount: number;
  outputAmount: number;
  inputToken: string;
  outputToken: string;
  price: number;
  fee: number;
  feeBps: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  priceImpact: number;
  slippage: number;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface Quote {
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  route: string;
  platformFee: number;
  feeBps: number;
  gasEstimate?: number;
  routePlan?: any[];
}

export interface Watchlist {
  id: string;
  userId: string;
  tokenCA: string;
  chainId: string;
  addedAt: Date;
  alertPrice?: number;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'price' | 'volume' | 'holder' | 'transaction';
  tokenCA: string;
  condition: 'above' | 'below' | 'increase' | 'decrease';
  value: number;
  triggered: boolean;
  createdAt: Date;
}

export interface SmartMoney {
  address: string;
  profit: number;
  winRate: number;
  trades: number;
  followers: number;
  isVerified: boolean;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  timestamp: Date;
  type: 'buy' | 'sell' | 'transfer';
}

export interface ChartData {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
