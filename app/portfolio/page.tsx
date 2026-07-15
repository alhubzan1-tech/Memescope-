'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import type { Portfolio, Holding } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PortfolioPage() {
  const router = useRouter();
  const { wallet } = useStore();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!wallet) {
      router.push('/');
      return;
    }

    const fetchPortfolio = async () => {
      try {
        // Fetch user portfolio
        const response = await fetch(`/api/portfolio?wallet=${wallet}`);
        const data = await response.json();
        setPortfolio(data);
        
        // Generate portfolio chart data
        const days = 30;
        const data_points = [];
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (days - i));
          data_points.push({
            date: date.toLocaleDateString(),
            value: data.totalValue * (0.9 + Math.random() * 0.2),
          });
        }
        setChartData(data_points);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [wallet, router]);

  return (
    <div className="flex h-screen bg-[#0f1419]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border border-[#2a2f3e] border-t-[#00d084]"></div>
              </div>
            ) : portfolio ? (
              <>
                {/* Portfolio Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className="text-3xl font-bold mt-2">${portfolio.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                    <p className="text-gray-400 text-sm">Total Gain/Loss</p>
                    <div className="flex items-center gap-2 mt-2">
                      {portfolio.gainLoss >= 0 ? (
                        <TrendingUp className="text-green-400" size={24} />
                      ) : (
                        <TrendingDown className="text-red-400" size={24} />
                      )}
                      <p className={`text-2xl font-bold ${portfolio.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${Math.abs(portfolio.gainLoss).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <p className={`text-sm mt-1 ${portfolio.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolio.gainLossPercent >= 0 ? '+' : ''}{portfolio.gainLossPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                    <p className="text-gray-400 text-sm">24h Gain/Loss</p>
                    <div className="flex items-center gap-2 mt-2">
                      {portfolio.dayGainLoss >= 0 ? (
                        <TrendingUp className="text-green-400" size={24} />
                      ) : (
                        <TrendingDown className="text-red-400" size={24} />
                      )}
                      <p className={`text-2xl font-bold ${portfolio.dayGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${Math.abs(portfolio.dayGainLoss).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                    <p className="text-gray-400 text-sm">Holdings</p>
                    <p className="text-3xl font-bold mt-2">{portfolio.holdings.length}</p>
                  </div>
                </div>

                {/* Portfolio Chart */}
                <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Portfolio Performance (30 days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                      <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="value" stroke="#00d084" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Holdings */}
                <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Holdings</h3>
                  <div className="space-y-3">
                    {portfolio.holdings.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No holdings yet. Start trading!</p>
                    ) : (
                      portfolio.holdings.map((holding: Holding) => (
                        <div key={holding.tokenCA} className="flex items-center justify-between p-4 bg-[#0a0e13] rounded-lg hover:border-[#00d084] border border-transparent transition-all">
                          <div>
                            <p className="font-semibold">{holding.symbol}</p>
                            <p className="text-sm text-gray-400">{holding.quantity.toLocaleString('en-US', { maximumFractionDigits: 2 })} tokens</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-semibold">${holding.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                            <p className={`text-sm font-mono ${holding.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
