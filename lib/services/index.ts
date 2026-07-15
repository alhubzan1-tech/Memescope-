// Token, Swap, Portfolio & Wallet Services
import axios from 'axios';
import type { Token, TokenDetails, ChartData, Quote, Portfolio, Holding } from '@/lib/types';

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
const BIRDEYE_API = 'https://public-api.birdeye.so';
const JUPITER_API = 'https://quote-api.jup.ag/v6';
const INCH_API = 'https://api.1inch.io/v5.0';
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5000;

export class TokenService {
  static async getTrendingTokens(limit: number = 20, chain: string = 'solana'): Promise<Token[]> {
    try {
      const response = await axios.get(`${DEXSCREENER_API}/search/trending?limit=${limit}`, { timeout: 10000 });
      return response.data.pairs
        .filter((p: any) => p.chainId === chain)
        .slice(0, limit)
        .map((pair: any) => ({
          ca: pair.baseToken?.address || pair.pairAddress,
          chainId: chain as any,
          name: pair.baseToken?.name || 'Unknown',
          symbol: pair.baseToken?.symbol || 'UNKNOWN',
          decimals: 8,
          price: parseFloat(pair.priceUsd) || 0,
          priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
          volume24h: parseFloat(pair.volume?.h24 || '0'),
          marketCap: parseFloat(pair.marketCap || '0'),
          liquidity: parseFloat(pair.liquidity?.usd || '0'),
          holders: pair.holders || 0,
          logoUri: pair.baseToken?.logoURI,
          verified: false,
        }));
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      throw new Error('Failed to fetch trending tokens');
    }
  }

  static async getTokenPrice(tokenAddress: string, chainId: string = 'solana'): Promise<number> {
    const cacheKey = `${chainId}:${tokenAddress}`;
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.price;

    try {
      const response = await axios.get(`${DEXSCREENER_API}/pairs/${chainId}/${tokenAddress}`, { timeout: 5000 });
      const price = parseFloat(response.data.pair?.priceUsd || '0');
      priceCache.set(cacheKey, { price, timestamp: Date.now() });
      return price;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return cached?.price || 0;
    }
  }

  static async getTokenDetails(tokenAddress: string, chainId: string = 'solana'): Promise<TokenDetails> {
    try {
      const response = await axios.get(`${BIRDEYE_API}/token/info`, {
        params: { address: tokenAddress, chain: chainId },
        headers: { 'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_KEY || '' },
        timeout: 10000,
      });
      const data = response.data.data;
      return {
        ca: tokenAddress,
        chainId: chainId as any,
        name: data.name,
        symbol: data.symbol,
        decimals: data.decimals,
        price: data.price,
        priceChange24h: data.priceChange24h || 0,
        volume24h: data.v24hUSD,
        marketCap: data.mc,
        liquidity: data.liquidity,
        holders: data.holder,
        logoUri: data.logoURI,
        fdv: data.fdv || 0,
        totalSupply: data.totalSupply,
        circulatingSupply: data.circulatingSupply,
        verified: data.verified || false,
        description: data.description,
        website: data.website,
        twitter: data.twitter,
        topHolders: (data.topHolders || []).map((h: any) => ({ address: h.address, percentage: h.percentage, balance: h.balance })),
      };
    } catch (error) {
      console.error('Error fetching token details:', error);
      throw new Error('Failed to fetch token details');
    }
  }

  static async getTokenChart(tokenAddress: string, timeframe: '1m' | '5m' | '1h' | '4h' | '1d' = '1h', chainId: string = 'solana'): Promise<ChartData[]> {
    try {
      const response = await axios.get(`${BIRDEYE_API}/token/history`, {
        params: { address: tokenAddress, type: timeframe, chain: chainId },
        headers: { 'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_KEY || '' },
        timeout: 10000,
      });
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

  static async searchTokens(query: string, chainId: string = 'solana'): Promise<Token[]> {
    try {
      const response = await axios.get(`${DEXSCREENER_API}/search/tokens`, { params: { q: query }, timeout: 10000 });
      return response.data.tokens.filter((t: any) => t.chainId === chainId).map((token: any) => ({
        ca: token.address,
        chainId: chainId as any,
        name: token.name,
        symbol: token.symbol,
        decimals: 8,
        price: token.priceUsd || 0,
        priceChange24h: 0,
        volume24h: 0,
        marketCap: 0,
        liquidity: 0,
        holders: 0,
        logoUri: token.logoURI,
        verified: false,
      }));
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }
}

export class SwapService {
  static async getJupiterQuote(inputMint: string, outputMint: string, amount: number, slippageBps: number = 100): Promise<Quote> {
    try {
      const response = await axios.get(`${JUPITER_API}/quote`, {
        params: { inputMint, outputMint, amount, slippageBps, onlyDirectRoutes: false },
        timeout: 30000,
      });
      const data = response.data;
      const platformFee = Math.floor(amount * 0.005);
      return {
        inputAmount: parseInt(data.inAmount),
        outputAmount: parseInt(data.outAmount),
        priceImpact: parseFloat(data.priceImpact || '0'),
        route: 'Jupiter',
        platformFee,
        feeBps: 50,
        routePlan: data.routePlan,
      };
    } catch (error) {
      console.error('Error getting Jupiter quote:', error);
      throw new Error('Failed to get swap quote');
    }
  }

  static async executeJupiterSwap(quoteResponse: any, userPublicKey: string): Promise<{ swapTransaction: string }> {
    try {
      const response = await axios.post(`${JUPITER_API}/swap`, { quoteResponse, userPublicKey }, { timeout: 30000 });
      return { swapTransaction: response.data.swapTransaction };
    } catch (error) {
      console.error('Error executing Jupiter swap:', error);
      throw new Error('Failed to execute swap');
    }
  }

  static async get1inchQuote(fromTokenAddress: string, toTokenAddress: string, amount: string, chainId: number = 1): Promise<Quote> {
    try {
      const response = await axios.get(`${INCH_API}/${chainId}/quote`, {
        params: { fromTokenAddress, toTokenAddress, amount, slippage: 1 },
        timeout: 30000,
      });
      const platformFee = Math.floor(Number(amount) * 0.005);
      return {
        inputAmount: parseInt(amount),
        outputAmount: parseInt(response.data.toAmount),
        priceImpact: parseFloat(response.data.priceImpact || '0'),
        route: '1inch',
        platformFee,
        feeBps: 50,
      };
    } catch (error) {
      console.error('Error getting 1inch quote:', error);
      throw new Error('Failed to get swap quote');
    }
  }
}

export class PortfolioService {
  static calculateMetrics(holdings: Holding[]) {
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.entryPrice * h.quantity, 0);
    const gainLoss = totalValue - totalCost;
    return { totalValue, gainLoss, gainLossPercent: totalCost > 0 ? (gainLoss / totalCost) * 100 : 0 };
  }
}

export class WalletService {
  static async connectPhantom(): Promise<string> {
    if (!window.solana) throw new Error('Phantom not installed');
    try {
      const response = await window.solana.connect();
      return response.publicKey.toString();
    } catch (error) {
      throw error;
    }
  }

  static async signTransactionWithPhantom(transaction: any): Promise<any> {
    if (!window.solana) throw new Error('Phantom not installed');
    return await window.solana.signTransaction(transaction);
  }

  static async connectMetaMask(): Promise<string> {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  }
}
