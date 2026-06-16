// Mock data and API responses

const mockTokens = [
  {
    ca: '9ix2mT7QqXjVrj9gUZsUJTpgvKpFmNB7nLv5',
    name: 'BONK',
    symbol: 'BONK',
    price: 0.0847,
    change24h: 12.4,
    volume24h: 8.2e6,
    liquidity: 2.1e6,
    holders: 12450,
    age: 180,
  },
  {
    ca: '9ix2mT7QqXjVrj9gUZsUJTpgvKpFmNB7nLv6',
    name: 'COPE',
    symbol: 'COPE',
    price: 0.0034,
    change24h: 45.2,
    volume24h: 2.5e6,
    liquidity: 0.45e6,
    holders: 2340,
    age: 180,
  },
  {
    ca: '9ix2mT7QqXjVrj9gUZsUJTpgvKpFmNB7nLv7',
    name: 'Orca',
    symbol: 'ORCA',
    price: 2.45,
    change24h: -2.1,
    volume24h: 12.5e6,
    liquidity: 50e6,
    holders: 45000,
    age: 360,
  },
  {
    ca: '9ix2mT7QqXjVrj9gUZsUJTpgvKpFmNB7nLv8',
    name: 'Mana',
    symbol: 'MANA',
    price: 0.56,
    change24h: 18.5,
    volume24h: 15.2e6,
    liquidity: 25e6,
    holders: 35000,
    age: 300,
  },
  {
    ca: '9ix2mT7QqXjVrj9gUZsUJTpgvKpFmNB7nLv9',
    name: 'Magic Eden',
    symbol: 'ME',
    price: 8.23,
    change24h: 5.2,
    volume24h: 8.5e6,
    liquidity: 35e6,
    holders: 28000,
    age: 450,
  },
];

export async function getTrendingTokens() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTokens);
    }, 500);
  });
}

export async function getTokenDetails(ca: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const token = mockTokens.find((t) => t.ca === ca);
      if (token) {
        resolve({
          ...token,
          chart: Array.from({ length: 60 }, (_, i) => ({
            time: new Date(Date.now() - (60 - i) * 60000),
            price: token.price + (Math.random() - 0.5) * 0.001,
            volume: Math.random() * 1000000,
          })),
          orderBook: {
            asks: [
              { price: token.price + 0.0001, amount: 100000 },
              { price: token.price + 0.0002, amount: 200000 },
              { price: token.price + 0.0003, amount: 150000 },
            ],
            bids: [
              { price: token.price - 0.0001, amount: 120000 },
              { price: token.price - 0.0002, amount: 180000 },
              { price: token.price - 0.0003, amount: 160000 },
            ],
          },
        });
      }
      resolve(null);
    }, 300);
  });
}

export async function getQuote({
  inputMint,
  outputMint,
  amount,
}: {
  inputMint: string;
  outputMint: string;
  amount: number;
}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const outputToken = mockTokens.find((t) => t.ca === outputMint);
      const inputToken = mockTokens.find((t) => t.ca === inputMint);

      if (outputToken && inputToken) {
        const outputAmount = (amount * inputToken.price) / outputToken.price;
        const priceImpact = Math.random() * 0.05;

        resolve({
          outputAmount,
          priceImpact,
          route: 'Raydium',
          fee: amount * 0.0025,
        });
      }
    }, 500);
  });
}

export async function executeSwap({
  inputAmount,
  outputAmount,
  tokenCA,
  side,
}: {
  inputAmount: number;
  outputAmount: number;
  tokenCA: string;
  side: 'BUY' | 'SELL';
}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const txHash = 'tx' + Math.random().toString(36).substring(7);
      resolve({
        success: true,
        txHash,
        tradeId: 'trade_' + Math.random().toString(36).substring(7),
      });
    }, 2000);
  });
}

export async function confirmTrade(txHash: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'confirmed',
        blockNumber: Math.floor(Math.random() * 100000000),
      });
    }, 15000 + Math.random() * 15000);
  });
}

export function simulatePriceUpdate(tokens: any[]) {
  return tokens.map((token) => ({
    ...token,
    price: token.price * (1 + (Math.random() - 0.5) * 0.001),
    change24h: token.change24h + (Math.random() - 0.5) * 0.5,
  }));
}
