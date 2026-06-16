'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader } from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  getJupiterQuote,
  executeJupiterSwap,
  getSolanaTransactionStatus,
  formatTokenAmount,
  parseTokenAmount,
} from '@/lib/realApi';
import { signTransactionWithPhantom } from '@/lib/walletIntegration';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import base58 from 'bs58';

interface TradeModalProps {
  token: any;
  side: 'BUY' | 'SELL';
  onClose: () => void;
  onSuccess: () => void;
}

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWaLb3odccccLEpioT2cUfuoiGBqs7P5p6qLmDVS';

export default function TradeModal({ token, side, onClose, onSuccess }: TradeModalProps) {
  const { balance, addTrade, addHolding, removeHolding, wallet } = useStore();
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [step, setStep] = useState<'input' | 'review' | 'loading' | 'success' | 'error'>('input');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [isGettingQuote, setIsGettingQuote] = useState(false);

  const handleGetQuote = async () => {
    if (!amount || isNaN(Number(amount))) {
      setError('Invalid amount');
      return;
    }

    setIsGettingQuote(true);
    setError('');

    try {
      // Parse amount to lamports
      const inputMint = side === 'BUY' ? SOL_MINT : token.ca;
      const outputMint = side === 'BUY' ? token.ca : SOL_MINT;
      const amountInLamports = parseTokenAmount(Number(amount), 9); // SOL has 9 decimals

      const quoteData = await getJupiterQuote({
        inputMint,
        outputMint,
        amount: amountInLamports,
        slippageBps: Math.floor(slippage * 100),
      });

      setQuote(quoteData);
    } catch (err: any) {
      setError(err.message || 'Failed to get quote');
      console.error('Quote error:', err);
    } finally {
      setIsGettingQuote(false);
    }
  };

  const handleConfirm = async () => {
    if (!quote || !wallet) {
      setError('Missing quote or wallet');
      return;
    }

    setStep('loading');
    setError('');

    try {
      // Get swap transaction from Jupiter
      const swapData = await executeJupiterSwap({
        quoteResponse: quote,
        userPublicKey: wallet,
        wrapUnwrapSol: true,
      });

      // Decode and sign transaction
      const swapTransactionBuf = Buffer.from(swapData.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign with Phantom
      const signedTx = await signTransactionWithPhantom(transaction);

      // Send transaction
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
      const txId = await connection.sendRawTransaction(signedTx.serialize());

      setTxHash(txId);

      // Wait for confirmation with timeout
      let confirmed = false;
      let confirmAttempts = 0;
      const maxAttempts = 60; // 60 attempts * 1 second = ~1 minute

      while (!confirmed && confirmAttempts < maxAttempts) {
        const status = await getSolanaTransactionStatus(txId);

        if (status.status === 'confirmed') {
          confirmed = true;
          break;
        } else if (status.status === 'failed') {
          throw new Error('Transaction failed on chain');
        }

        // Wait before checking again
        await new Promise((resolve) => setTimeout(resolve, 1000));
        confirmAttempts++;
      }

      if (!confirmed) {
        throw new Error('Transaction confirmation timeout');
      }

      // Record trade
      const trade = {
        id: txId,
        tokenCA: token.ca,
        symbol: token.symbol,
        side,
        amount: formatTokenAmount(quote.outputAmount, token.decimals || 6),
        price: token.price,
        fee: formatTokenAmount(quote.platformFee, 9),
        timestamp: Date.now(),
        txHash: txId,
        status: 'confirmed' as const,
      };

      addTrade(trade);

      // Update holdings
      if (side === 'BUY') {
        addHolding({
          tokenCA: token.ca,
          symbol: token.symbol,
          quantity: formatTokenAmount(quote.outputAmount, token.decimals || 6),
          entryPrice: token.price,
          currentPrice: token.price,
        });
      } else {
        removeHolding(token.ca);
      }

      setStep('success');
    } catch (err: any) {
      console.error('Trade execution error:', err);
      setError(err.message || 'Trade execution failed');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50">
      <div className="bg-[#1a1f2e] border-t border-[#2a2f3e] rounded-t-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{side} {token.symbol}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#2a2f3e] rounded">
            <X size={20} />
          </button>
        </div>

        {step === 'input' && (
          <>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Amount ({side === 'BUY' ? 'SOL' : token.symbol})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setQuote(null);
                }}
                placeholder="0.00"
                className="w-full"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {!quote && amount && (
              <button
                onClick={handleGetQuote}
                disabled={isGettingQuote}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isGettingQuote ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Getting Quote...
                  </>
                ) : (
                  'Get Quote'
                )}
              </button>
            )}

            {quote && (
              <div className="bg-[#0a0e13] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Output Amount</span>
                  <span className="font-mono">{formatTokenAmount(quote.outputAmount, token.decimals || 6).toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Memescope Fee (0.5%)</span>
                  <span className="font-mono">${formatTokenAmount(quote.platformFee, 9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Impact</span>
                  <span className={quote.priceImpact > 5 ? 'text-red-400' : 'green-text'}>
                    {(quote.priceImpact * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slippage</span>
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(Number(e.target.value))}
                    className="w-16 bg-[#1a1f2e] text-right"
                    min="0.1"
                    max="50"
                    step="0.1"
                  />
                  <span>%</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => setStep('review')}
                disabled={!quote}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Review
              </button>
            </div>
          </>
        )}

        {step === 'review' && quote && (
          <>
            <div className="bg-[#0a0e13] rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">{side} Order Review</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Token</span>
                  <span className="font-mono">{token.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-mono">{formatTokenAmount(quote.outputAmount, token.decimals || 6).toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price</span>
                  <span className="font-mono">${token.price.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee (0.5%)</span>
                  <span className="font-mono">${formatTokenAmount(quote.platformFee, 9).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('input')} className="btn-secondary flex-1">
                Back
              </button>
              <button onClick={handleConfirm} className="btn-primary flex-1">
                Confirm & Execute
              </button>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border border-[#2a2f3e] border-t-[#00d084]"></div>
            <p className="text-gray-400">Broadcasting transaction...</p>
            {txHash && (
              <>
                <p className="text-xs text-gray-500 break-all text-center">TX: {txHash.slice(0, 20)}...</p>
                <a
                  href={`https://solscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00d084] hover:underline"
                >
                  View on Solscan
                </a>
              </>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-4xl">✅</div>
            <h3 className="text-xl font-semibold">Trade Successful!</h3>
            <p className="text-center text-gray-400">
              {side} {formatTokenAmount(quote.outputAmount, token.decimals || 6).toFixed(6)} {token.symbol}
            </p>
            {txHash && (
              <a
                href={`https://solscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#00d084] hover:underline break-all text-center"
              >
                {txHash}
              </a>
            )}
            <div className="flex gap-2 w-full">
              <button onClick={onClose} className="btn-secondary flex-1">
                Close
              </button>
              <button onClick={onSuccess} className="btn-primary flex-1">
                View Portfolio
              </button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-4xl">❌</div>
            <h3 className="text-xl font-semibold">Trade Failed</h3>
            <p className="text-center text-red-400 text-sm">{error}</p>
            {txHash && (
              <a
                href={`https://solscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                View Transaction
              </a>
            )}
            <div className="flex gap-2 w-full">
              <button onClick={onClose} className="btn-secondary flex-1">
                Close
              </button>
              <button onClick={() => { setStep('input'); setError(''); setTxHash(''); }} className="btn-primary flex-1">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
