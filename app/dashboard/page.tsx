'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import TokenCard from '@/components/TokenCard';
import TradeModal from '@/components/TradeModal';
import { getTrendingTokens, simulatePriceUpdate } from '@/lib/mockApi';
import { Search } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { isConnected, trendingTokens, setTrendingTokens, updateTokenPrice } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    const loadTokens = async () => {
      const tokens: any = await getTrendingTokens();
      setTrendingTokens(tokens);
      setLoading(false);
    };

    loadTokens();
  }, [isConnected, router, setTrendingTokens]);

  // Simulate price updates
  useEffect(() => {
    if (trendingTokens.length === 0) return;

    const interval = setInterval(() => {
      const updated = simulatePriceUpdate(trendingTokens);
      setTrendingTokens(updated);
    }, 2000);

    return () => clearInterval(interval);
  }, [trendingTokens, setTrendingTokens]);

  const filteredTokens = trendingTokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewToken = (token: any) => {
    setSelectedToken(token);
  };

  const handleBuy = (token: any) => {
    setSelectedToken(token);
    setTradeMode('BUY');
  };

  const handleSell = (token: any) => {
    setSelectedToken(token);
    setTradeMode('SELL');
  };

  const handleTradeSuccess = () => {
    setSelectedToken(null);
  };

  return (
    <div className="flex h-screen bg-[#0f1419]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Trending Tokens</h1>
              <p className="text-gray-400 mb-6">Real-time trading opportunities</p>

              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 py-2"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border border-[#2a2f3e] border-t-[#00d084] mx-auto"></div>
                  <p className="text-gray-400">Loading trending tokens...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTokens.map((token) => (
                  <div key={token.ca} className="group">
                    <TokenCard token={token} onView={handleViewToken} />
                    <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleBuy(token)}
                        className="btn-primary flex-1 py-1 text-sm"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => handleSell(token)}
                        className="btn-danger flex-1 py-1 text-sm"
                      >
                        Sell
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
          onSuccess={handleTradeSuccess}
        />
      )}
    </div>
  );
}
