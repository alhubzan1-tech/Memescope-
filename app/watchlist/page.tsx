'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import TokenCard from '@/components/TokenCard';
import TradeModal from '@/components/TradeModal';
import { getTrendingTokens } from '@/lib/mockApi';
import { Star } from 'lucide-react';

export default function Watchlist() {
  const router = useRouter();
  const { isConnected, watchlist, trendingTokens, setTrendingTokens } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    const loadTokens = async () => {
      if (trendingTokens.length === 0) {
        const tokens: any = await getTrendingTokens();
        setTrendingTokens(tokens);
      }
      setLoading(false);
    };

    loadTokens();
  }, [isConnected, router, trendingTokens, setTrendingTokens]);

  const watchedTokens = trendingTokens.filter((t) => watchlist.includes(t.ca));

  const handleBuy = (token: any) => {
    setSelectedToken(token);
    setTradeMode('BUY');
  };

  return (
    <div className="flex h-screen bg-[#0f1419]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Watchlist</h1>
            <p className="text-gray-400 mb-6">Tokens you're monitoring</p>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border border-[#2a2f3e] border-t-[#00d084] mx-auto"></div>
                  <p className="text-gray-400">Loading watchlist...</p>
                </div>
              </div>
            ) : watchedTokens.length === 0 ? (
              <div className="bg-[#1a1f2e] border border-dashed border-[#2a2f3e] rounded-lg p-12 text-center">
                <Star className="mx-auto mb-4 text-gray-400" size={32} />
                <p className="text-gray-400">No tokens in watchlist</p>
                <p className="text-gray-500 text-sm mt-2">Add tokens to your watchlist to track them</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchedTokens.map((token) => (
                  <div key={token.ca} className="group">
                    <TokenCard token={token} onView={() => setSelectedToken(token)} />
                    <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleBuy(token)}
                        className="btn-primary flex-1 py-1 text-sm"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
