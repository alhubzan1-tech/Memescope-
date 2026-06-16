'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function Home() {
  const router = useRouter();
  const { wallet, setWallet } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wallet) {
      router.push('/dashboard');
    }
  }, [wallet, router]);

  const handleConnect = async () => {
    setIsLoading(true);
    // Simulate wallet connection
    setTimeout(() => {
      const mockWallet = '9ix2mT7QqXjVrj9gUZsUJTpgvKpFmNB7nLv5z9xmA';
      setWallet(mockWallet);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0e13] to-[#0f1419]">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold">Memescope</h1>
          <p className="text-xl text-gray-400">GMGN + Ave.ai Trading Terminal</p>
        </div>

        <p className="text-gray-500 text-sm">
          Trade meme tokens on Solana with real-time market data, live charts, and instant execution.
        </p>

        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="btn-primary w-full py-3 text-lg disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border border-black border-t-transparent"></div>
              Connecting Wallet...
            </span>
          ) : (
            'Connect Wallet'
          )}
        </button>

        <div className="text-xs text-gray-600 space-y-1">
          <p>Demo using Phantom wallet simulation</p>
          <p>No real transactions - mock data only</p>
        </div>
      </div>
    </div>
  );
}
