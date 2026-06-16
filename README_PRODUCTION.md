# Memescope - Production Trading Terminal

## Production Features

### Real-Time Market Data
- **DexScreener**: Trending tokens, OHLCV charts, order books
- **Birdeye**: Token details, price history, holder analytics

### Blockchain Integration
- **Solana**: Jupiter API for token swaps
- **EVM**: 1inch API for ERC20 swaps
- **Wallet Signing**: Phantom (Solana) and MetaMask (EVM)

### Real Transactions
- Actual blockchain settlement
- Transaction hashing and tracking
- 0.5% platform fee on every trade
- Solscan integration for tx verification

## Setup

### Prerequisites
1. Node.js 18+
2. npm or yarn
3. Phantom wallet (for Solana)
4. MetaMask wallet (for EVM)

### Installation

```bash
npm install
```

### Configuration

1. Copy environment template:
```bash
cp .env.example .env.local
```

2. Add API Keys:
   - **Birdeye**: Get from https://www.birdeye.so/
   - **1inch**: Get from https://portal.1inch.io
   - **Solana RPC**: Use https://api.mainnet-beta.solana.com or paid service

### Running

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

### Real API Layer (`lib/realApi.ts`)
- DexScreener: Trending, prices, charts
- Birdeye: Token details, OHLCV
- Jupiter: Solana quotes and swaps
- 1inch: EVM quotes and swaps
- Solana RPC: Transaction status

### Wallet Integration (`lib/walletIntegration.ts`)
- Phantom wallet connection
- MetaMask wallet connection
- Transaction signing
- Account management

### Trade Execution
1. Get real quote from Jupiter/1inch
2. User signs with wallet (Phantom/MetaMask)
3. Transaction broadcasts to blockchain
4. Monitor chain confirmation
5. Record trade with tx hash
6. Deduct 0.5% platform fee

### Pages
- `/` - Wallet connection
- `/dashboard` - Real trending tokens
- `/portfolio` - Holdings and P&L
- `/watchlist` - Saved tokens
- `/settings` - Configuration

## API Endpoints

### Get Trending Tokens
```bash
GET /api/tokens/trending?limit=20&chain=solana
```

### Get Quote
```bash
POST /api/quote
{
  "inputMint": "So11111...",
  "outputMint": "token_address",
  "amount": 1000000000,
  "slippageBps": 100
}
```

### Check Transaction Status
```bash
GET /api/transaction/status?txHash=xxx&rpc=https://...
```

## Fee Structure

- **Platform Fee**: 0.5% per trade
- **Network Fee**: Solana native fee (~0.00005 SOL)
- **DEX Fee**: Built into Jupiter/1inch quotes
- **Slippage**: User configurable (0.1% - 50%)

## Error Handling

- Network errors retry automatically
- Transaction failures show Solscan link
- Price quotes cached for 5 seconds
- Graceful fallback if API unavailable

## Security

- **No Private Keys**: Only wallet signing
- **Phantom/MetaMask Custody**: User controls keys
- **Quote Validation**: 30-second validity window
- **Slippage Protection**: User-set limits

## Stack

- **Frontend**: Next.js 14 App Router
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Charts**: Recharts
- **Blockchain**: Solana Web3.js
- **DEX**: Jupiter API + 1inch API

## License

MIT
