// Database schema for Memescope
// This defines the structure for PostgreSQL tables

export const SCHEMA = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      settings JSONB DEFAULT '{"slippageTolerance": 1, "defaultChain": "solana", "notifications": true, "darkMode": true}',
      INDEX idx_wallet (wallet)
    );
  `,
  
  portfolios: `
    CREATE TABLE IF NOT EXISTS portfolios (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      holdings JSONB DEFAULT '[]',
      total_value DECIMAL(20, 8) DEFAULT 0,
      gain_loss DECIMAL(20, 8) DEFAULT 0,
      gain_loss_percent DECIMAL(10, 2) DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      UNIQUE(user_id)
    );
  `,
  
  trades: `
    CREATE TABLE IF NOT EXISTS trades (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_ca VARCHAR(255) NOT NULL,
      chain_id VARCHAR(50) DEFAULT 'solana',
      symbol VARCHAR(50) NOT NULL,
      side VARCHAR(10) NOT NULL,
      input_amount DECIMAL(30, 8) NOT NULL,
      output_amount DECIMAL(30, 8) NOT NULL,
      input_token VARCHAR(255),
      output_token VARCHAR(255),
      price DECIMAL(20, 8) NOT NULL,
      fee DECIMAL(20, 8) NOT NULL,
      fee_bps INTEGER DEFAULT 50,
      tx_hash VARCHAR(255) UNIQUE,
      status VARCHAR(50) DEFAULT 'pending',
      price_impact DECIMAL(10, 4),
      slippage DECIMAL(10, 4),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      confirmed_at TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_token_ca (token_ca),
      INDEX idx_created_at (created_at),
      INDEX idx_tx_hash (tx_hash)
    );
  `,
  
  watchlists: `
    CREATE TABLE IF NOT EXISTS watchlists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_ca VARCHAR(255) NOT NULL,
      chain_id VARCHAR(50) DEFAULT 'solana',
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      alert_price DECIMAL(20, 8),
      INDEX idx_user_id (user_id),
      INDEX idx_token_ca (token_ca),
      UNIQUE(user_id, token_ca, chain_id)
    );
  `,
  
  alerts: `
    CREATE TABLE IF NOT EXISTS alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      token_ca VARCHAR(255) NOT NULL,
      condition VARCHAR(50) NOT NULL,
      value DECIMAL(20, 8) NOT NULL,
      triggered BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_triggered (triggered)
    );
  `,
  
  tokens: `
    CREATE TABLE IF NOT EXISTS tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ca VARCHAR(255) NOT NULL,
      chain_id VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      symbol VARCHAR(50) NOT NULL,
      decimals INTEGER DEFAULT 8,
      price DECIMAL(20, 12) NOT NULL,
      price_change_24h DECIMAL(10, 2),
      volume_24h DECIMAL(30, 8),
      market_cap DECIMAL(30, 8),
      liquidity DECIMAL(30, 8),
      holders INTEGER,
      logo_uri TEXT,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ca, chain_id),
      INDEX idx_symbol (symbol),
      INDEX idx_updated_at (updated_at)
    );
  `,
  
  price_history: `
    CREATE TABLE IF NOT EXISTS price_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token_ca VARCHAR(255) NOT NULL,
      chain_id VARCHAR(50) NOT NULL,
      timeframe VARCHAR(10) NOT NULL,
      open DECIMAL(20, 12),
      high DECIMAL(20, 12),
      low DECIMAL(20, 12),
      close DECIMAL(20, 12),
      volume DECIMAL(30, 8),
      timestamp TIMESTAMP NOT NULL,
      INDEX idx_token_timeframe (token_ca, timeframe, timestamp),
      INDEX idx_timestamp (timestamp)
    );
  `,
  
  smart_money: `
    CREATE TABLE IF NOT EXISTS smart_money (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      address VARCHAR(255) UNIQUE NOT NULL,
      profit DECIMAL(20, 8),
      win_rate DECIMAL(5, 2),
      trades INTEGER,
      followers INTEGER DEFAULT 0,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_profit (profit),
      INDEX idx_win_rate (win_rate)
    );
  `,
  
  fee_logs: `
    CREATE TABLE IF NOT EXISTS fee_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trade_id UUID NOT NULL REFERENCES trades(id),
      fee_amount DECIMAL(20, 8) NOT NULL,
      fee_percent DECIMAL(5, 2) DEFAULT 0.5,
      fee_wallet VARCHAR(255),
      chain_id VARCHAR(50),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_trade_id (trade_id),
      INDEX idx_timestamp (timestamp)
    );
  `
};
