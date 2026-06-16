# MEMESCOPE: Real-World Step-by-Step Flow

## SCENARIO: New User, First Trade to Portfolio View

---

## PART 1: APP STARTUP & AUTHENTICATION

### Step 1: User Opens App
**User sees:**
- Memescope logo (splash screen)
- "Connect Wallet" button (large, centered)
- Text: "Connect your Solana wallet to trade"

**System does:**
- Loads app shell
- Checks localStorage for saved wallet address
- If found: auto-connect; if not: show connect button

---

### Step 2: User Taps "Connect Wallet"
**User sees:**
- Modal popup: "Select Wallet"
- List of options:
  - Phantom
  - Magic Eden
  - Backpack
  - WalletConnect

**System does:**
- Nothing yet (waiting for selection)

---

### Step 3: User Taps "Phantom"
**User sees:**
- Modal closes
- App freezes briefly (1-2 seconds)
- Phantom wallet app opens on device (or browser popup)

**System does:**
- Triggers Phantom connection request
- Sends connection intent to Phantom SDK

---

### Step 4: Phantom Shows Permission Screen
**User sees:**
- Phantom app: "Memescope wants to connect"
- Shows wallet address
- "Connect" button (blue)

**System does:**
- Awaits user approval
- No system action until user taps

---

### Step 5: User Taps "Connect" in Phantom
**User sees:**
- Phantom closes/minimizes
- Back to Memescope
- Loading spinner in center of screen

**System does:**
- Receives wallet address from Phantom
- Calls: `GET /auth/user?wallet={address}`
- Backend checks if user exists in database
- If new: creates user record with wallet
- If existing: loads user data
- Saves wallet address to localStorage
- Saves auth token to localStorage

---

### Step 6: Dashboard Loads
**User sees:**
- Bottom navigation bar appears:
  - 🔥 Trending (active/highlighted)
  - 📊 Portfolio
  - ⭐ Watchlist
  - ⚙️ Settings
- Header: "Memescope" (logo on left)
- Main area: spinning loader with text "Loading portfolio..."

**System does:**
- Fetches user portfolio: `GET /portfolio?wallet={address}`
- Result: { totalBalance: 0, holdings: [] } (empty for new user)
- Fetches trending tokens: `GET /tokens/trending?timeframe=1h&limit=20`
- Connects to WebSocket for real-time price updates

---

### Step 7: Trending Page Fully Loads
**User sees:**
- Trending page populated with token list:
  ```
  1. $BONK
     Price: $0.0847  ↑ +12.4%
     24h Vol: $8.2M
     Liquidity: $2.1M
     [View]
  
  2. $COPE
     Price: $0.0034  ↑ +45.2%
     24h Vol: $2.5M
     Liquidity: $450K
     [View]
  
  3. $SOL
     Price: $203.45  ↓ -2.1%
     24h Vol: $1.2B
     Liquidity: $50M
     [View]
     ...
  ```
- Prices update live (flash when changed)
- Prices update every 2 seconds

**System does:**
- Renders tokens from cache (already fetched)
- Sets up price update WebSocket listener
- Every 2-5 seconds: receives price tick
- Updates specific token rows (only changed prices)
- No page reload

**Note:** User has 5 SOL in wallet (from previous funding). System will fetch this separately from portfolio balance.

---

## PART 2: DISCOVERING A TOKEN

### Step 8: User Sees $BONK at Top (trending up 12%)
**User sees:**
- $BONK row highlighted in trending list
- Green color on % change
- "View" button on right

**System does:**
- Nothing (just displaying)

---

### Step 9: User Taps "View" Button on $BONK
**User sees:**
- Trending page slides/transitions out (or fades)
- Token detail page slides in from right
- Header: "$BONK" with logo
- Large price display: "$0.0847"
- Green "+ 12.4%" below price
- Buttons below: "1h" "4h" "24h" (timeframe selector)
- Spinning loader: "Loading chart..."

**System does:**
- Calls: `GET /tokens/{CA}/details?timeframe=1h`
- Requests:
  - Historical OHLC data (last 20 candles for 1h view)
  - Current order book (top 10 buy/sell orders)
  - Token stats (market cap, FDV, liquidity, holders)
  - Social links (Twitter, website, contract)
- No WebSocket yet (still loading)

---

### Step 10: Token Detail Page Loads (3-5 seconds)
**User sees:**
- Header section:
  - $BONK (name)
  - $0.0847 (price)
  - 📈 +12.4% (24h change)
  - Buttons: "1h" "4h" "24h" (with "1h" selected)

- Chart section:
  - Interactive candlestick chart
  - X-axis: time (1h ago, 50m ago, 40m ago... now)
  - Y-axis: price ($0.082 to $0.087)
  - Green candles (up periods)
  - Volume bars below (gray)

- Stats panel (scrollable):
  ```
  Market Cap: $847M
  FDV: $847M
  24h Volume: $8.2M
  Liquidity: $2.1M
  Holders: 12,450
  Top 10 Hold: 28.3%
  ```

- Links:
  - 🐦 Twitter (clickable)
  - 🌐 Website (clickable)
  - 📋 Contract: 9ix... [COPY] button
  - 🔗 Raydium Pool (link)

- Order book:
  ```
  ASKS (Sell orders)
  $0.0850  4.2M tokens
  $0.0851  2.1M tokens
  $0.0852  1.8M tokens
  
  BIDS (Buy orders)
  $0.0846  3.1M tokens
  $0.0845  2.8M tokens
  $0.0844  1.9M tokens
  ```

- Sticky footer (at bottom):
  - Green "BUY" button
  - Red "SELL" button
  - Heart icon "❤️ Add to Watchlist"

**System does:**
- Connects to WebSocket: `/ws/token/{CA}`
- Starts receiving real-time price updates every 500ms
- Updates chart candle (extends current 1h candle as prices change)
- Updates price display at top
- Updates order book every 1-2 seconds

---

### Step 11: Chart Updates Tick by Tick
**User sees:**
- Chart live updates as user watches
- Price at top changes from $0.0847 to $0.0849 (green color)
- Current candle extends slightly (shows volume increase)
- Order book quantities shift

**System does:**
- Receives WebSocket tick: { price: 0.0849, bid: 0.0846, ask: 0.0850 }
- Updates state
- Re-renders price display (only)
- Re-renders order book (only)
- Chart library updates current candle in real-time (no re-render, just canvas update)

---

### Step 12: User Decides to Buy
**User sees:**
- Has been watching chart for 30 seconds
- Price now at $0.0849 (small gain)
- Taps green "BUY" button

**System does:**
- Nothing visible yet
- Closes WebSocket (will re-establish if user cancels)

---

## PART 3: ORDER ENTRY & EXECUTION

### Step 13: Buy Modal/Sheet Appears
**User sees:**
- Modal/bottom sheet slides up
- Title: "Buy $BONK"
- Input field: "Amount to spend" with SOL dropdown
- Input is blank, cursor ready
- Below: "You'll receive: — tokens"
- Fee breakdown (grayed out initially):
  ```
  Est. Output: —
  Memescope Fee: —
  Network Fee: —
  Total Cost: —
  ```
- Buttons: "Cancel" (left) | "Next" (right, disabled/grayed)

**System does:**
- Closes price WebSocket temporarily
- Modal open

---

### Step 14: User Types "1" (1 SOL)
**User sees:**
- Input now shows: "1" SOL
- "Next" button still grayed (waiting for system calculation)

**System does:**
- Detects input change
- Waits 500ms (debounce) before calling API
- Calls: `GET /quote?inputMint=SOL&outputMint={BONK_CA}&amount=1000000000`
  (1 SOL in lamports)
- Jupiter API returns:
  ```json
  {
    "outputAmount": "11,234,560",
    "priceImpact": "0.02%",
    "route": "Raydium",
    "fee": "2500000" (in lamports = 0.0025 SOL = Jupiter's fee)
  }
  ```

---

### Step 15: Quote Result Appears
**User sees:**
- "You'll receive" updates to: "11,234,560 $BONK"
- Fee breakdown populates:
  ```
  Est. Output: 11,234,560 $BONK
  Memescope Fee: $0.50 (0.5%)
  Network Fee: $0.00005 SOL
  Total Cost: $100.75
  ```
- "Next" button becomes blue/enabled

**System does:**
- Cache quote for 30 seconds (valid window)
- Display fee breakdown to user
- Enable "Next" button

---

### Step 16: User Taps "Next"
**User sees:**
- Modal/sheet transitions to review screen
- Shows:
  ```
  BUY ORDER REVIEW
  
  Token: $BONK
  Amount: 11,234,560 tokens
  Cost: 1 SOL ($100)
  Fees: $0.75
  Total: 1 SOL + $0.75
  
  Slippage Tolerance: 1% [Change]
  
  [Cancel]  [Confirm & Execute]
  ```

**System does:**
- Nothing (showing cached quote)

---

### Step 17: User Taps "Confirm & Execute"
**User sees:**
- Review screen freezes/button grays out
- Loading text appears: "Building transaction..."
- Spinner animates

**System does:**
- Calls: `POST /trades/execute`
  ```json
  {
    "userId": "abc123",
    "walletAddress": "9ix...",
    "tokenCA": "9ix...",
    "inputAmount": "1000000000",
    "outputAmount": "11234560",
    "slippageTolerance": 1,
    "side": "BUY"
  }
  ```
- Backend:
  1. Validates user wallet has ≥ 1 SOL
  2. Gets fresh quote (within 30s window): ✓ valid
  3. Constructs transaction:
     - Input: 1 SOL from user wallet
     - Route through Raydium
     - Output to user wallet: 11,234,560 $BONK
     - Fee output to treasury: 0.0025 SOL (Memescope fee)
  4. Returns unsigned transaction to frontend

---

### Step 18: Wallet Signs Transaction
**User sees:**
- Loading spinner changes text: "Sign in your wallet..."
- Phantom popup appears (or modal if in-app)
- Phantom shows:
  ```
  Memescope wants to sign a transaction
  [Approve]  [Deny]
  ```

**System does:**
- Awaits Phantom signature
- No backend action yet

---

### Step 19: User Taps "Approve" in Phantom
**User sees:**
- Phantom closes
- Back to Memescope
- Loading text: "Broadcasting transaction..."
- Spinner continues

**System does:**
- Frontend receives signed transaction from Phantom
- Calls: `POST /trades/broadcast`
  ```json
  {
    "signedTx": "base58_encoded_transaction",
    "tradeId": "trade_abc123"
  }
  ```
- Backend:
  1. Broadcasts to Solana RPC
  2. Gets txHash: "5vL8xK..."
  3. Stores in database:
     ```
     TRADE_TRANSACTIONS:
     - tradeId: trade_abc123
     - txHash: 5vL8xK...
     - status: "pending"
     - tokenCA: 9ix...
     - inputAmount: 1000000000
     - outputAmount: 11234560
     - feePaid: 0.0025 SOL
     - timestamp: now
     ```
  4. Returns txHash to frontend
- Frontend receives txHash

---

### Step 20: Transaction Broadcasts (Solana Network)
**User sees:**
- Still showing: "Broadcasting transaction..."
- Spinner continues (stays for 10-15 seconds typically)

**System does:**
- Backend polls Solana RPC: `getParsedTransaction(txHash)`
- Status: "processing"
- Waits 5 seconds, polls again
- Status: "confirmed"
- Updates database:
  ```
  TRADE_TRANSACTIONS:
  - status: "confirmed"
  - confirmedAt: now
  - blockNumber: 45391234
  ```
- Calls: `POST /portfolio/sync?wallet={address}`
  - Queries blockchain: wallet now holds 11,234,560 $BONK
  - Updates portfolio record in database
  - Emits WebSocket event to user: "trade_completed"

---

### Step 21: Success Screen Appears
**User sees:**
- Modal/sheet clears
- New screen appears:
  ```
  ✅ TRADE SUCCESSFUL
  
  Bought 11,234,560 $BONK
  for 1 SOL
  
  Transaction Hash:
  5vL8xK9pQ2mR... [COPY]
  
  View on Solscan [Link]
  
  [View in Portfolio]  [Find Similar]
  ```

**System does:**
- Fetches fresh price of $BONK: $0.0849
- Displays user can view in portfolio
- Logs trade to analytics

---

### Step 22: User Taps "View in Portfolio"
**User sees:**
- Success screen closes
- Navigation changes: bottom nav shows "Portfolio" (highlighted)
- Portfolio page appears

**System does:**
- Navigates to Portfolio route
- Fetches: `GET /portfolio?wallet={address}`
- Database returns:
  ```json
  {
    "totalBalance": "$100.00",
    "totalGainLoss": "$0.00",
    "holdings": [
      {
        "tokenCA": "9ix...",
        "symbol": "$BONK",
        "quantity": 11234560,
        "entryPrice": 0.0849,
        "currentPrice": 0.0849,
        "gainLoss": "$0.00",
        "gainLossPercent": "0%",
        "timestamp": "now"
      }
    ]
  }
  ```

---

## PART 4: PORTFOLIO VIEW

### Step 23: Portfolio Page Loads
**User sees:**
- Header: "Portfolio"
- Summary card:
  ```
  Total Balance: $100.00
  Today's Gain/Loss: $0.00 (+0.0%)
  Holdings: 1
  ```

- Holdings list:
  ```
  $BONK
  11,234,560 tokens
  Entry: $0.0849
  Current: $0.0849
  Gain/Loss: $0.00 (0.0%)
  
  [Show details]
  ```

- Bottom action buttons:
  - "Quick Buy" (green)
  - "Quick Sell" (red)
  - "More" (menu)

**System does:**
- Connects to WebSocket: `/ws/portfolio/{userId}`
- Sets up real-time price ticker for all holdings
- Every 1-2 seconds: receives price tick for $BONK
- Updates portfolio values in real-time

---

### Step 24: Price Updates in Real-Time
**User sees:**
- Price updates on screen every 1-2 seconds
- $BONK price: $0.0849 → $0.0851 (green flash)
- Gain/Loss updates: $0.00 → +$2.50
- Green color indicates profit
- No page reload

**System does:**
- WebSocket tick received: { tokenCA: 9ix, price: 0.0851 }
- State update:
  - currentPrice = 0.0851
  - gainLoss = (0.0851 - 0.0849) * 11234560 = $2.50
- Re-render portfolio card only (fast, localized)

---

### Step 25: User Waits 5 Minutes (Prices Fluctuate)
**User sees:**
- Chart shows $BONK price movement:
  - $0.0849 → $0.0851 (green)
  - $0.0851 → $0.0848 (red)
  - $0.0848 → $0.0852 (green)
- Gain/Loss fluctuates accordingly:
  - +$2.50
  - -$1.30
  - +$3.40
- User sees real-time updates, stays on portfolio page

**System does:**
- Continuous WebSocket updates
- Each tick: price updates, math recalculates, display updates
- No network calls except WebSocket (super efficient)

---

### Step 26: Price Reaches $0.0860 (10 Minutes Later)
**User sees:**
- $BONK now shows:
  - Current: $0.0860
  - Gain/Loss: +$123.50 (+12.3%)
  - Green/bullish indication
  - User is up on the trade

**System does:**
- Continuous updates via WebSocket

---

### Step 27: User Decides to Sell Half Position
**User sees:**
- Holds $BONK at +$123 gain
- Taps on $BONK holding row

**System does:**
- Nothing yet (waiting for selection)

---

### Step 28: Holdings Detail Sheet Appears
**User sees:**
- Sheet slides up:
  ```
  $BONK
  
  Quantity: 11,234,560
  Entry Price: $0.0849
  Current Price: $0.0860
  Gain/Loss: +$123.50 (+12.3%)
  Hours Held: 0.3h
  
  [Sell] [Cancel]
  ```

**System does:**
- Nothing

---

### Step 29: User Taps "Sell"
**User sees:**
- Detail sheet closes
- Sell modal appears:
  ```
  Sell $BONK
  
  Amount: [  ] tokens
  
  You'll receive: — SOL
  Fee: —
  Total: —
  
  [Cancel]  [Next]
  ```

**System does:**
- Ready to accept input

---

### Step 30: User Types "5617280" (Half of holdings)
**User sees:**
- Input shows: "5,617,280" tokens
- System starts calculating

**System does:**
- Debounce 500ms
- Calls: `GET /quote?inputMint={BONK_CA}&outputMint=SOL&amount=5617280`
- Jupiter returns:
  ```json
  {
    "outputAmount": "500000000", (0.5 SOL)
    "priceImpact": "0.01%"
  }
  ```

---

### Step 31: Sell Quote Appears
**User sees:**
- "You'll receive" updates:
  ```
  You'll receive: 0.5 SOL ($50.60)
  Memescope Fee: $0.25 (0.5%)
  Network Fee: $0.00005 SOL
  Total: 0.5 SOL
  ```

- "Next" button enabled

**System does:**
- Cache quote

---

### Step 32: User Taps "Next"
**User sees:**
- Review screen:
  ```
  SELL ORDER REVIEW
  
  Token: $BONK
  Amount: 5,617,280 tokens
  Receive: 0.5 SOL ($50.60)
  Fees: $0.25
  Net: 0.5 SOL
  
  [Cancel]  [Confirm & Execute]
  ```

**System does:**
- Nothing

---

### Step 33: User Taps "Confirm & Execute"
**User sees:**
- Button grays out
- "Building transaction..."
- Spinner

**System does:**
- Same flow as buy order:
  1. `POST /trades/execute` (SELL side)
  2. Backend constructs sell transaction
  3. Frontend signs with Phantom
  4. Broadcasts to Solana
  5. Polls for confirmation

---

### Step 34: Phantom Signs & Broadcasts
**User sees:**
- Phantom pops up briefly
- User taps "Approve"
- Back to Memescope
- Loading: "Broadcasting transaction..."

**System does:**
- Signs and broadcasts
- Same confirmation polling as before

---

### Step 35: Sell Confirmed (20 seconds)
**User sees:**
- Success screen:
  ```
  ✅ TRADE SUCCESSFUL
  
  Sold 5,617,280 $BONK
  for 0.5 SOL
  
  Transaction Hash: 7aN3xJ2pQ...
  
  [View in Portfolio]  [Find Similar]
  ```

**System does:**
- Updates database:
  ```
  TRADE_TRANSACTIONS (sell record):
  - side: "SELL"
  - inputAmount: 5617280 (tokens)
  - outputAmount: 500000000 (lamports / 0.5 SOL)
  - feePaid: 0.0025 SOL (0.5% of trade)
  - status: "confirmed"
  ```
- Updates portfolio:
  - Removes 5,617,280 $BONK from holdings
  - Remaining: 5,617,280 $BONK
  - Adds 0.5 SOL to cash balance
- Logs fee to FEE_LOG:
  ```
  FEE_LOG entry:
  - tradeId: trade_xyz789
  - feeAmount: 0.0025 SOL
  - feePercent: 0.5%
  - timestamp: now
  ```

---

### Step 36: User Returns to Portfolio
**User sees:**
- "View in Portfolio" button tapped
- Portfolio page refreshes
- Holdings now shows:
  ```
  $BONK
  5,617,280 tokens (down from 11,234,560)
  Entry: $0.0849
  Current: $0.0860
  Gain/Loss: +$61.75 (from +$123)
  
  Cash: 0.5 SOL (added from sale)
  
  Portfolio Total: $150.60
  Today's Gain: +$61.75
  ```

**System does:**
- Fetches fresh portfolio data
- WebSocket reconnects with updated holdings
- Prices continue updating in real-time

---

## PART 5: ADDING TO WATCHLIST

### Step 37: User Taps Bottom Nav "Watchlist"
**User sees:**
- Bottom nav highlights "Watchlist"
- Watchlist page opens
- Empty state:
  ```
  Watchlist
  
  No tokens saved yet.
  
  [Go to Trending]
  ```

**System does:**
- Fetches: `GET /watchlist?userId={id}`
- Result: [] (empty)

---

### Step 38: User Goes Back to Trending
**User sees:**
- Taps "Trending" in bottom nav
- Trending page shows top 20 tokens

**System does:**
- Fetches fresh trending data
- Connects to price WebSocket

---

### Step 39: User Finds New Token: $COPE
**User sees:**
- Scrolls down trending list
- Sees new token at #5:
  ```
  $COPE
  Price: $0.0034  ↑ +67.2%
  24h Vol: $4.1M
  Liquidity: $600K
  [View]
  ```

**System does:**
- Nothing

---

### Step 40: User Taps Heart Icon on $COPE Row
**User sees:**
- Heart icon fills/changes color (red)
- Toast notification: "Added to Watchlist ❤️"
- Fades after 2 seconds

**System does:**
- Calls: `POST /watchlist/add`
  ```json
  {
    "userId": "abc123",
    "tokenCA": "9ix..." (COPE)
  }
  ```
- Database inserts:
  ```
  WATCHLIST entry:
  - userId: abc123
  - tokenCA: 9ix...
  - addedAt: now
  ```

---

### Step 41: User Taps "View" on $COPE
**User sees:**
- Token detail page opens for $COPE
- Shows price: $0.0034 (+67.2%)
- Shows chart (5m timeframe showing massive gains)
- Shows:
  ```
  Market Cap: $34M
  Liquidity: $600K
  Holders: 2,340
  Age: 3 hours
  ⚠️ NEW TOKEN (under 4 hours old)
  ```

**System does:**
- Fetches token details
- Connects to price WebSocket
- Updates in real-time

---

### Step 42: User Decides to Buy Small Amount
**User sees:**
- Chart shows +67% in 3 hours
- Taps green "BUY" button
- Buy modal appears

**System does:**
- Ready for input

---

### Step 43: User Enters "0.25 SOL"
**User sees:**
- Input: "0.25" SOL
- System calculating

**System does:**
- Gets quote from Jupiter
- Returns: "75,000,000 $COPE tokens" (rough math)
- Shows fees:
  ```
  Est. Output: 75,000,000 $COPE
  Memescope Fee: $0.125 (0.5%)
  Total Cost: $25.13
  ```

---

### Step 44: User Confirms Buy
**User sees:**
- Review screen shows: Buy 75M $COPE for 0.25 SOL
- Taps "Confirm & Execute"
- Phantom signs
- Transaction broadcasts

**System does:**
- Same execution flow
- Creates TRADE_TRANSACTIONS entry
- Logs fee: $0.125

---

### Step 45: Trade Confirms (30 seconds)
**User sees:**
- Success: "Bought 75,000,000 $COPE"
- Taps "View in Portfolio"

**System does:**
- Updates portfolio
- Adds $COPE to holdings
- Now portfolio shows 2 positions:
  - $BONK: 5,617,280
  - $COPE: 75,000,000

---

### Step 46: Portfolio Now Shows Both Holdings
**User sees:**
- Portfolio page:
  ```
  Total Balance: $175.40
  Today's Gain: +$61.75
  
  Holdings:
  
  $BONK
  5,617,280 tokens
  +$61.75 (↑ +12.3%)
  
  $COPE
  75,000,000 tokens
  $0.00 (↓ -0.0%)
  [just bought]
  
  Cash: 0.25 SOL remaining
  ```

**System does:**
- Portfolio shows both positions
- Real-time prices update both rows every 1-2 seconds
- If either price changes, gains/losses recalculate instantly

---

### Step 47: User Watches $COPE for 10 Minutes
**User sees:**
- $COPE price starts at $0.0034
- Over 10 minutes:
  - $0.0034 → $0.0035 (green, +2.9%)
  - Price fluctuates
  - Gain/Loss updates live
- At 10m mark: +$1,125 on $COPE
- Portfolio total: +$1,186.75

**System does:**
- Continuous WebSocket updates
- Each price tick:
  - Updates $COPE price
  - Recalculates gain/loss
  - Updates display (no reload)

---

### Step 48: $COPE Starts Dumping
**User sees:**
- Price drops sharply:
  - $0.0035 → $0.0032 (red)
  - Down 5.9% in 3 minutes
- Gain turns negative:
  - +$1,125 → -$2,250
- Portfolio flips red overall
- $COPE row shows red warning

**System does:**
- WebSocket ticks still coming
- Each update recalculates instantly

---

### Step 49: User Panics, Wants to Sell
**User sees:**
- Taps $COPE holding
- Detail sheet:
  ```
  $COPE
  75,000,000 tokens
  Entry: $0.0034
  Current: $0.0032
  Gain/Loss: -$2,250 (-6.5%)
  [Sell] [Cancel]
  ```

**System does:**
- Nothing

---

### Step 50: User Taps "Sell"
**User sees:**
- Sell modal opens

**System does:**
- Ready

---

### Step 51: User Enters "75000000" (Entire position)
**User sees:**
- Amount: 75,000,000
- System calculating

**System does:**
- Gets quote: 0.215 SOL (~$21.50)
- Shows fees, net amount

---

### Step 52: User Confirms Sell
**User sees:**
- Review: Sell 75M $COPE for 0.215 SOL
- Confirms
- Phantom signs
- Broadcasts

**System does:**
- Processes sell
- Fee: $0.10 (0.5%)
- Updates database

---

### Step 53: Sell Confirms
**User sees:**
- Success: "Sold 75,000,000 $COPE for 0.215 SOL"

**System does:**
- Updates portfolio
- Removes $COPE from holdings
- Back to 1 holding: $BONK
- Cash balance: 0.465 SOL

---

### Step 54: Portfolio After Selling Loser
**User sees:**
- Portfolio now shows:
  ```
  Total Balance: $171.60
  Today's Gain: +$56.85
  
  Holdings:
  $BONK (1 position)
  5,617,280 tokens
  +$61.75
  
  Cash: 0.465 SOL
  
  Closed Positions: 1
  $COPE: -$2,250 (cut loss)
  ```

**System does:**
- Portfolio stores closed position in history
- Displays summary
- Continues price updates for remaining $BONK

---

## PART 6: SESSION TRACKING & FEES

### Step 55: User Continues Trading (30 Minutes)
**User sees:**
- Makes 5 more trades over 30 minutes
- Each one processes instantly (now experienced)
- Portfolio grows/shrinks based on trades

**System does:**
- Each trade:
  - Logged to TRADE_TRANSACTIONS
  - Fee extracted: 0.5% per trade
  - Portfolio updated
  - WebSocket notifies user

---

### Step 56: Session Summary
**User sees:**
- After all trades, dashboard summary shows:
  ```
  Today's Summary
  
  Trades: 7
  Win Rate: 57% (4 wins, 3 losses)
  Total Volume: $175 traded
  Fees Paid: $0.88
  Portfolio Gain: +$61.75
  ```

**System does:**
- Aggregates session data
- Calculated from TRADE_TRANSACTIONS logs
- Fees summed from FEE_LOG

---

### Step 57: Admin Dashboard (Backend)
**System does (backend only):**
- Memescope admin views dashboard: `/admin/revenue`
- Sees today's totals:
  ```
  Revenue Today:
  - Total Fees: $1,247.50
  - From 143 trades
  - Average Fee: $8.70
  - Top 5 traders by volume
  - Fee breakdown by token
  ```
- Treasury wallet shows: +$1,247.50 collected

---

## PART 7: NEXT SESSION (NEXT DAY)

### Step 58: User Opens App (Day 2)
**User sees:**
- App splash screen
- Wallet auto-connects (from localStorage)
- Dashboard loads instantly

**System does:**
- Checks localStorage: wallet address found
- Auto-connects via Phantom (no UI prompt)
- Loads portfolio

---

### Step 59: Dashboard on Day 2
**User sees:**
- Portfolio summary:
  ```
  Total Balance: $171.60
  Today's Gain/Loss: +$0.50 (prices moved overnight)
  This Week: +$61.75
  Holdings: 1 ($BONK)
  ```

- Quick stats:
  - $BONK now at $0.0863 (up from yesterday's $0.0860)
  - Unrealized gain: +$2.10
  - Watchlist: 1 token saved

- Quick buttons:
  - [Quick Buy]
  - [Explore Trending]
  - [View Portfolio]

**System does:**
- Fetches fresh data
- Connects to WebSocket
- Prices update in real-time

---

## CORE SEQUENCE SUMMARY

1. **Connect Wallet** (Phantom) → Auto-saved
2. **View Trending** → Real-time list with prices
3. **Tap Token** → Detail page with chart
4. **Enter Amount** → Quote calculated (Jupiter)
5. **Confirm** → Phantom signs → Broadcast to Solana
6. **Await Confirmation** (10-30 seconds) → Confirmed
7. **Success** → Added to Portfolio
8. **Portfolio Live Updates** → Prices tick every 1-2 seconds
9. **Sell Position** → Same flow (reverse)
10. **Closed Position Logged** → P&L calculated
11. **Fees Collected** → Logged to database
12. **Next Day** → All data persists, portfolio tracked

---

## DATA PERSISTENCE (What Gets Saved)

**User Database:**
- userId, wallet, email, createdAt

**Portfolio Database:**
- userId, holdings[], totalBalance, updatedAt

**Trades Database (Core):**
```
tradeId, userId, tokenCA, side (BUY/SELL),
inputAmount, outputAmount, executionPrice,
txHash, feePaid, status, timestamp
```

**Watchlist Database:**
- userId, tokenCA[], addedAt

**Fee Log:**
```
tradeId, feeAmount, feePercent, recipient,
timestamp
```

**Session Analytics:**
- userId, totalTrades, winRate, totalVolume, totalFesPaid, sessionDate

---

## REAL-WORLD TIMING

| Step | Duration | What Happens |
|------|----------|---|
| Wallet Connect | 3-5s | Phantom modal appears, user approves |
| Dashboard Load | 1-2s | Portfolio loads, trending fetches |
| Token Detail Page | 2-3s | Chart, stats, order book load |
| Buy Quote | 500ms | Jupiter API response |
| Confirmation After Broadcast | 15-30s | Network confirms, portfolio updates |
| Portfolio Refresh | <200ms | Real-time WebSocket update |
| Sell Order | 15-30s | Same as buy |
| Next Session | <1s | Auto-connect, cached data shown |

---

## ERROR SCENARIOS (Not Shown Above)

**Insufficient Balance:**
- User tries to buy 1 SOL but only has 0.5 SOL
- System shows: "Insufficient balance (need 1 SOL, have 0.5)"
- Buy button disabled

**Slippage Exceeded:**
- Quote: 10M tokens at 1% slippage
- Network conditions change, actual output: 9.5M (5% slippage)
- Transaction reverts
- User sees: "Transaction failed - slippage too high"
- Coins returned to wallet

**Network Fee Spike:**
- User tries to buy, Solana fees suddenly high
- User sees updated fee: $2.50 (instead of $0.0005)
- User can accept or cancel

**Wallet Not Funded:**
- User connects wallet with 0 SOL
- System shows: "Wallet empty - Fund wallet to start trading"
- Link to funded exchange

---

## KEY DISTINCTIONS (Real-World Patterns)

1. **No page reloads** - Everything is SPA (Single Page App)
2. **WebSocket for prices** - Updates without polling/reloading
3. **Debounced quotes** - Wait 500ms after user stops typing, then fetch
4. **Phantom as custodian** - Backend never holds private keys
5. **Solana confirms tx** - 15-30s is typical, not instant
6. **Fees logged per trade** - Every trade creates one FEE_LOG entry
7. **Portfolio calculated live** - No background jobs, real-time math
8. **Watchlist is instant** - Just adds row to user's list
