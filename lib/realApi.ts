// Real API integrations replacing mock data

import axios from 'axios';

// DexScreener API for trending tokens
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
const BIRDEYE_API = 'https://public-api.birdeye.so';
const JUPITER_API = 'https://quote-api.jup.ag/v6';
const INCH_API = 'https://api.1inch.io/v5.0';

// Cache for price data to reduce API calls
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Get trending tokens from DexScreener
 * Returns top tokens by volume in last 24h
 */
export async function getTrendingTokens(limit = 20, chain = 'solana') {
  try {
    // DexScreener trending endpoint
    const response = await axios.get(
      `${DEXSCREENER_API}/search/trending?limit=${limit}`,
      { timeout: 10000 }
    );

    return response.data.pairs
      .filter((p: any) => p.chainId === chain)
      .map((token: any) => ({
        ca: token.baseToken?.address || token.pairAddress,
        name: token.baseToken?.name || 'Unknown',
        symbol: token.baseToken?.symbol || 'UNKNOWN',
        price: parseFloat(token.priceUsd) || 0,
        change24h: parseFloat(token.priceChange?.h24 || '0'),
        volume24h: parseFloat(token.volume?.h24 || '0'),
        liquidity: parseFloat(token.liquidity?.usd || '0'),
        holders: token.holders || 0,
        logo: token.baseToken?.logoURI,
        age: Date.now() - (token.createdAt || Date.now()),
        pairAddress: token.pairAddress,
        chainId: token.chainId,
      }));
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    throw new Error('Failed to fetch trending tokens');
  }
}

/**
 * Get real-time price from DexScreener or cache
 */
export async function getTokenPrice(tokenAddress: string, chainId = 'solana') {
  const cacheKey = `${chainId}:${tokenAddress}`;
  const cached = priceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    const response = await axios.get(
      `${DEXSCREENER_API}/pairs/${chainId}/${tokenAddress}`,
      { timeout: 5000 }
    );

    const price = parseFloat(response.data.pair?.priceUsd || '0');
    priceCache.set(cacheKey, { price, timestamp: Date.now() });
    return price;
  } catch (error) {
    console.error('Error fetching token price:', error);
    // Return cached price if API fails
    return cached?.price || 0;
  }
}

/**
 * Get detailed token info from Birdeye
 */
export async function getTokenDetails(tokenAddress: string, chainId = 'solana') {
  try {
    const response = await axios.get(
      `${BIRDEYE_API}/token/info`,
      {
        params: {
          address: tokenAddress,
          chain: chainId,
        },
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_KEY || '',
        },
        timeout: 10000,
      }
    );

    const data = response.data.data;
    return {
      ca: tokenAddress,
      name: data.name,
      symbol: data.symbol,
      decimals: data.decimals,
      price: data.price,
      liquidity: data.liquidity,
      marketCap: data.mc,
      holders: data.holder,
      totalSupply: data.totalSupply,
      description: data.description,
      website: data.website,
      twitter: data.twitter,
    };
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw new Error('Failed to fetch token details');
  }
}

/**
 * Get OHLCV chart data from Birdeye
 */
export async function getTokenChart(
  tokenAddress: string,
  timeframe: '1m' | '5m' | '1h' | '4h' | '1d' = '1h',
  chainId = 'solana'
) {
  try {
    const response = await axios.get(
      `${BIRDEYE_API}/token/history`,
      {
        params: {
          address: tokenAddress,
          type: timeframe,
          chain: chainId,
        },
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_KEY || '',
        },
        timeout: 10000,
      }
    );

    return response.data.data.map((candle: any) => ({
      time: new Date(candle.unixTime * 1000),
      open: candle.o,
      high: candle.h,
      low: candle.l,
      close: candle.c,
      volume: candle.v,
    }));
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw new Error('Failed to fetch chart data');
  }
}

/**
 * Get quote from Jupiter API (Solana)
 */
export async function getJupiterQuote({
  inputMint,
  outputMint,
  amount,
  slippageBps = 100,
}: {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}) {
  try {
    const response = await axios.get(`${JUPITER_API}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount,
        slippageBps,
      },
      timeout: 30000,
    });

    const data = response.data;
    const platformFee = Math.floor(amount * 0.005); // 0.5% fee

    return {
      inputAmount: parseInt(data.inAmount),
      outputAmount: parseInt(data.outAmount),
      priceImpact: parseFloat(data.priceImpact || '0'),
      route: 'Jupiter',
      routePlan: data.routePlan,
      platformFee,
      feeBps: 50, // 0.5% in basis points
    };
  } catch (error) {
    console.error('Error getting Jupiter quote:', error);
    throw new Error('Failed to get Jupiter quote');
  }
}

/**
 * Execute swap on Jupiter
 */
export async function executeJupiterSwap({
  quoteResponse,
  userPublicKey,
  wrapUnwrapSol = true,
}: {
  quoteResponse: any;
  userPublicKey: string;
  wrapUnwrapSol?: boolean;
}) {
  try {
    const response = await axios.post(
      `${JUPITER_API}/swap`,
      {
        quoteResponse,
        userPublicKey,
        wrapUnwrapSol,
      },
      { timeout: 30000 }
    );

    return {
      swapTransaction: response.data.swapTransaction,
      lastValidBlockHeight: response.data.lastValidBlockHeight,
    };
  } catch (error) {
    console.error('Error executing Jupiter swap:', error);
    throw new Error('Failed to execute Jupiter swap');
  }
}

/**
 * Get quote from 1inch API (EVM chains)
 */
export async function get1inchQuote({
  fromTokenAddress,
  toTokenAddress,
  amount,
  fromAddress,
  chainId = 1, // Ethereum
  slippage = 0.5,
}: {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  chainId?: number;
  slippage?: number;
}) {
  try {
    const response = await axios.get(
      `${INCH_API}/${chainId}/quote`,
      {
        params: {
          fromTokenAddress,
          toTokenAddress,
          amount,
          slippage,
        },
        timeout: 30000,
      }
    );

    const data = response.data;
    const platformFee = Math.floor(Number(amount) * 0.005); // 0.5% fee

    return {
      fromToken: data.fromToken,
      toToken: data.toToken,
      toAmount: data.toAmount,
      estimatedGas: data.estimatedGas,
      platformFee,
      protocols: data.protocols,
    };
  } catch (error) {
    console.error('Error getting 1inch quote:', error);
    throw new Error('Failed to get 1inch quote');
  }
}

/**
 * Execute swap on 1inch
 */
export async function execute1inchSwap({
  fromTokenAddress,
  toTokenAddress,
  amount,
  fromAddress,
  slippage = 0.5,
  chainId = 1,
}: {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  slippage?: number;
  chainId?: number;
}) {
  try {
    const response = await axios.get(
      `${INCH_API}/${chainId}/swap`,
      {
        params: {
          fromTokenAddress,
          toTokenAddress,
          amount,
          fromAddress,
          slippage,
          disableEstimate: false,
        },
        timeout: 30000,
      }
    );

    return {
      tx: response.data.tx,
      status: response.data.status,
    };
  } catch (error) {
    console.error('Error executing 1inch swap:', error);
    throw new Error('Failed to execute 1inch swap');
  }
}

/**
 * Get transaction status from Solana
 */
export async function getSolanaTransactionStatus(txHash: string, rpcUrl?: string) {
  const url = rpcUrl || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

  try {
    const response = await axios.post(
      url,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [txHash, 'json'],
      },
      { timeout: 30000 }
    );

    const result = response.data.result;
    if (!result) {
      return { status: 'pending' };
    }

    return {
      status: result.meta?.err ? 'failed' : 'confirmed',
      blockTime: result.blockTime,
      slot: result.slot,
      fee: result.meta?.fee,
      err: result.meta?.err,
    };
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return { status: 'error' };
  }
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(amount: number | string, decimals: number): number {
  return Number(amount) / Math.pow(10, decimals);
}

/**
 * Parse token amount to raw value
 */
export function parseTokenAmount(amount: number, decimals: number): number {
  return Math.floor(amount * Math.pow(10, decimals));
}
