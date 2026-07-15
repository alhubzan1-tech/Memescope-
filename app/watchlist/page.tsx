'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import TokenCard from '@/components/TokenCard';
import { Heart } from 'lucide-react';

export default function WatchlistPage() {
  const router = useRouter();
  const { wallet, watchlist } = useStore();
  const [watchlistTokens, setWatchlistTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) {
      router.push('/');
      return;
    }

    const fetchWatchlistTokens = async () => {
      try {
        // Fetch details for each watchlist token
        const tokens = await Promise.all(
          watchlist.map(async (ca) => {
            const response = await fetch(`/api/tokens/${ca}/details`);
            return response.json();
          })
        );
        setWatchlistTokens(tokens);
      } catch (error) {
        console.error('Error fetching watchlist tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    if (watchlist.length > 0) {
      fetchWatchlistTokens();
    } else {
      setLoading(false);
    }
  }, [wallet, watchlist, router]);

  return (
    <div className="flex h-screen bg-[#0f1419]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Watchlist</h1>
              <p className="text-gray-400">Your favorite tokens tracked in real-time</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border border-[#2a2f3e] border-t-[#00d084]"></div>
              </div>
            ) : watchlistTokens.length === 0 ? (
              <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-12 text-center">
                <Heart size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No watchlist yet</h3>
                <p className="text-gray-400 mb-6">Add tokens to your watchlist to track them here</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary px-6 py-2"
                >
                  Explore Tokens
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlistTokens.map((token) => (
                  <TokenCard key={token.ca} token={token} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
