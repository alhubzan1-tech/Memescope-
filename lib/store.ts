import { create } from 'zustand';

interface Token {
  ca: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  logo?: string;
  age?: number;
}

interface Holding {
  tokenCA: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
}

interface Trade {
  id: string;
  tokenCA: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  amount: number;
  price: number;
  fee: number;
  timestamp: number;
  txHash?: string;
}

interface Store {
  // Auth
  wallet: string | null;
  isConnected: boolean;
  setWallet: (wallet: string | null) => void;

  // Portfolio
  balance: number;
  holdings: Holding[];
  trades: Trade[];
  setBalance: (balance: number) => void;
  addHolding: (holding: Holding) => void;
  removeHolding: (tokenCA: string) => void;
  updateHoldingPrice: (tokenCA: string, price: number) => void;
  addTrade: (trade: Trade) => void;

  // Tokens
  trendingTokens: Token[];
  setTrendingTokens: (tokens: Token[]) => void;
  updateTokenPrice: (ca: string, price: number) => void;

  // Watchlist
  watchlist: string[];
  addToWatchlist: (ca: string) => void;
  removeFromWatchlist: (ca: string) => void;
}

export const useStore = create<Store>((set) => ({
  wallet: typeof window !== 'undefined' ? localStorage.getItem('wallet') : null,
  isConnected: typeof window !== 'undefined' ? !!localStorage.getItem('wallet') : false,
  setWallet: (wallet) => {
    if (wallet) {
      localStorage.setItem('wallet', wallet);
    } else {
      localStorage.removeItem('wallet');
    }
    set({ wallet, isConnected: !!wallet });
  },

  balance: 500,
  holdings: [],
  trades: [],
  setBalance: (balance) => set({ balance }),
  addHolding: (holding) => set((state) => ({
    holdings: [...state.holdings, holding],
  })),
  removeHolding: (tokenCA) => set((state) => ({
    holdings: state.holdings.filter((h) => h.tokenCA !== tokenCA),
  })),
  updateHoldingPrice: (tokenCA, price) => set((state) => ({
    holdings: state.holdings.map((h) =>
      h.tokenCA === tokenCA ? { ...h, currentPrice: price } : h
    ),
  })),
  addTrade: (trade) => set((state) => ({
    trades: [...state.trades, trade],
  })),

  trendingTokens: [],
  setTrendingTokens: (tokens) => set({ trendingTokens: tokens }),
  updateTokenPrice: (ca, price) => set((state) => ({
    trendingTokens: state.trendingTokens.map((t) =>
      t.ca === ca ? { ...t, price } : t
    ),
  })),

  watchlist: [],
  addToWatchlist: (ca) => set((state) => ({
    watchlist: [...new Set([...state.watchlist, ca])],
  })),
  removeFromWatchlist: (ca) => set((state) => ({
    watchlist: state.watchlist.filter((item) => item !== ca),
  })),
}));
