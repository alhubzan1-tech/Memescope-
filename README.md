# Memescope - Trading Terminal

Production Next.js trading terminal for meme tokens on Solana.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 🔥 Trending token discovery
- 📊 Portfolio tracking with live P&L
- ⭐ Watchlist management
- 🎯 Real-time price updates
- 💰 Trade execution (BUY/SELL)
- 📈 Mock chart integration
- 💼 Session persistence
- 0.5% fee simulation

## Project Structure

```
app/                 # Next.js App Router pages
components/          # Reusable React components
lib/                 # Utilities and stores
  ├── store.ts       # Zustand state management
  └── mockApi.ts     # Mock API layer
public/              # Static assets
```

## Components

- **Sidebar**: Navigation between pages
- **Topbar**: Display connected wallet
- **TokenCard**: Display token information
- **Chart**: Recharts integration with live updates
- **TradeModal**: Buy/Sell flow with confirmation

## Pages

- `/` - Wallet connection
- `/dashboard` - Trending tokens
- `/portfolio` - Holdings and P&L
- `/watchlist` - Saved tokens
- `/settings` - Configuration

## Mock Data

All API calls are mocked using `lib/mockApi.ts`. Replace with real API integration for production.

## Integration Points

### Jupiter Integration
```typescript
// Replace mock getQuote with Jupiter API
const quote = await fetch(
  `https://quote-api.jup.ag/v6/quote?inputMint=SOL&outputMint=${tokenCA}&amount=${amount}`
);
```

### 1inch Integration
```typescript
// For Ethereum-based tokens
const quote = await fetch(
  `https://api.1inch.io/v5.0/1/quote?fromTokenAddress=...`
);
```

## Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

## License

MIT
