'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getQuote, executeSwap, confirmTrade } from '@/lib/mockApi';

interface TradeModalProps {
  token: any;
  side: 'BUY' | 'SELL';
  onClose: () => void;
  onSuccess: () => void;
}

export default function TradeModal({ token, side, onClose, onSuccess }: TradeModalProps) {
  const { balance, addTrade, addHolding, removeHolding, holdings } = useStore();
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [step, setStep] = useState<'input' | 'review' | 'loading' | 'success'>('input');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [slippage, setSlippage] = useState(1);

  const handleGetQuote = async () => {
    if (!amount || isNaN(Number(amount))) return;

    try {
      const response: any = await getQuote({
        inputMint: side === 'BUY' ? 'SOL' : token.ca,
        outputMint: side === 'BUY' ? token.ca : 'SOL',
        amount: Number(amount),
      });
      setQuote(response);
    } catch (err) {
      setError('Failed to get quote');
    }
  };

  const handleConfirm = async () => {
    if (!quote) return;

    setStep('loading');
    try {
      const response: any = await executeSwap({
        inputAmount: Number(amount),
        outputAmount: quote.outputAmount,
        tokenCA: token.ca,
        side,
      });

      setTxHash(response.txHash);

      // Simulate confirmation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update state
      const trade = {
        id: response.tradeId,
        tokenCA: token.ca,
        symbol: token.symbol,
        side,
        amount: quote.outputAmount,
        price: token.price,
        fee: quote.fee,
        timestamp: Date.now(),
        txHash: response.txHash,
      };

      addTrade(trade);

      if (side === 'BUY') {
        addHolding({
          tokenCA: token.ca,
          symbol: token.symbol,
          quantity: quote.outputAmount,
          entryPrice: token.price,
          currentPrice: token.price,
        });
      } else {
        removeHolding(token.ca);
      }

      setStep('success');
    } catch (err) {
      setError('Trade failed');
      setStep('input');
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
                className="btn-primary w-full"
              >
                Get Quote
              </button>
            )}

            {quote && (
              <div className="bg-[#0a0e13] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">You'll receive</span>
                  <span className="font-mono">{quote.outputAmount.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Memescope Fee</span>
                  <span className="font-mono">${quote.fee.toFixed(2)} (0.5%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Impact</span>
                  <span className="font-mono">{(quote.priceImpact * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slippage Tolerance</span>
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(Number(e.target.value))}
                    className="w-16 bg-[#1a1f2e] text-right"
                    min="0.1"
                    max="10"
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
                  <span className="font-mono">{quote.outputAmount.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price</span>
                  <span className="font-mono">${token.price.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee</span>
                  <span className="font-mono">${quote.fee.toFixed(2)}</span>
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
            {txHash && <p className="text-xs text-gray-500 break-all">{txHash}</p>}
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-4xl">✅</div>
            <h3 className="text-xl font-semibold">Trade Successful!</h3>
            <p className="text-center text-gray-400">
              {side} {quote.outputAmount.toFixed(6)} {token.symbol}
            </p>
            {txHash && (
              <div className="text-xs text-gray-500 break-all text-center">
                <p className="text-gray-400 mb-1">TX Hash:</p>
                {txHash}
              </div>
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
      </div>
    </div>
  );
}
