'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import TokenCard from '@/components/TokenCard';
import TradeModal from '@/components/TradeModal';
import { simulatePriceUpdate } from '@/lib/mockApi';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

export default function Portfolio() {
  const router = useRouter();
  const { isConnected, balance, holdings, trades, trendingTokens, updateHoldingPrice } = useStore();
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // Simulate price updates for holdings
  useEffect(() => {
    if (holdings.length === 0) return;

    const interval = setInterval(() => {
      holdings.forEach((holding) => {
        const newPrice = holding.currentPrice * (1 + (Math.random() - 0.5) * 0.002);
        updateHoldingPrice(holding.tokenCA, newPrice);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [holdings, updateHoldingPrice]);

  const totalValue = holdings.reduce(
    (sum, h) => sum + h.quantity * h.currentPrice,
    balance
  );

  const unrealizedGains = holdings.reduce(
    (sum, h) => sum + (h.quantity * (h.currentPrice - h.entryPrice)),
    0
  );

  const unrealizedGainPercent = (unrealizedGains / (totalValue - unrealizedGains)) * 100;

  const handleSell = (token: any) => {
    const holding = holdings.find((h) => h.tokenCA === token.ca);
    if (holding) {
      setSelectedToken({ ...token, ...holding });
      setTradeMode('SELL');
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1419]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-6">Portfolio</h1>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Total Balance</p>
                  <p className="text-3xl font-bold font-mono">${totalValue.toFixed(2)}</p>
                </div>
                <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Unrealized Gains</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold font-mono ${
                      unrealizedGains >= 0 ? 'green-text' : 'red-text'
                    }`}>
                      ${Math.abs(unrealizedGains).toFixed(2)}
                    </p>
                    {unrealizedGains >= 0 ? (
                      <ArrowUp size={20} className="green-text" />
                    ) : (
                      <ArrowDown size={20} className="red-text" />
                    )}
                  </div>
                </div>
                <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Holdings</p>
                  <p className="text-3xl font-bold">{holdings.length}</p>
                </div>
              </div>

              {holdings.length === 0 ? (
                <div className="bg-[#1a1f2e] border border-dashed border-[#2a2f3e] rounded-lg p-12 text-center">
                  <TrendingUp className="mx-auto mb-4 text-gray-400" size={32} />
                  <p className="text-gray-400">No holdings yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start trading to see your portfolio</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-4">Your Holdings</h2>
                  <div className="space-y-4">
                    {holdings.map((holding) => {
                      const token = trendingTokens.find((t) => t.ca === holding.tokenCA);
                      const gain = holding.quantity * (holding.currentPrice - holding.entryPrice);
                      const gainPercent = ((holding.currentPrice - holding.entryPrice) / holding.entryPrice) * 100;
                      const isPositive = gain >= 0;

                      return (
                        <div
                          key={holding.tokenCA}
                          className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-4 hover:border-[#00d084] transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{holding.symbol}</h3>
                              <p className="text-gray-400 text-xs">{holding.quantity.toFixed(0)} tokens</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-semibold">${(holding.quantity * holding.currentPrice).toFixed(2)}</p>
                              <p className={`text-sm ${isPositive ? 'green-text' : 'red-text'}`}>
                                {isPositive ? '+' : ''}{gain.toFixed(2)} ({gainPercent.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                            <div>
                              <p className="text-gray-400">Entry Price</p>
                              <p className="font-mono">${holding.entryPrice.toFixed(6)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Current Price</p>
                              <p className="font-mono">${holding.currentPrice.toFixed(6)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSell({ ca: holding.tokenCA, ...holding })}
                            className="btn-danger w-full py-1 text-sm"
                          >
                            Sell
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {trades.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mt-8 mb-4">Trade History</h2>
                  <div className="space-y-2">
                    {trades.slice().reverse().map((trade) => (
                      <div
                        key={trade.id}
                        className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-3 flex justify-between items-center text-sm"
                      >
                        <div>
                          <p className="font-semibold">
                            {trade.side} {trade.symbol}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(trade.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono">{trade.amount.toFixed(0)} tokens</p>
                          <p className="text-gray-400 text-xs">Fee: ${trade.fee.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedToken && (
        <TradeModal
          token={selectedToken}
          side={tradeMode}
          onClose={() => setSelectedToken(null)}
          onSuccess={() => setSelectedToken(null)}
        />
      )}
    </div>
  );
}
