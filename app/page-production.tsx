'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { connectPhantom, connectMetaMask } from '@/lib/walletIntegration';

export default function Home() {
  const router = useRouter();
  const { setWallet } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletType, setWalletType] = useState<'phantom' | 'metamask' | null>(null);

  const handleConnectPhantom = async () => {
    setIsLoading(true);
    setError('');
    try {
      const wallet = await connectPhantom();
      setWallet(wallet, 'phantom');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to connect Phantom wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectMetaMask = async () => {
    setIsLoading(true);
    setError('');
    try {
      const wallet = await connectMetaMask();
      setWallet(wallet, 'metamask');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to connect MetaMask wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0e13] to-[#0f1419]">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold">Memescope</h1>
          <p className="text-xl text-gray-400">Production Trading Terminal</p>
        </div>

        <p className="text-gray-500 text-sm">
          Trade meme tokens on Solana with real-time market data, live charts, and instant execution.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleConnectPhantom}
            disabled={isLoading}
            className="btn-primary w-full py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && walletType === 'phantom' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border border-black border-t-transparent"></div>
                Connecting...
              </>
            ) : (
              '👻 Connect Phantom'
            )}
          </button>

          <button
            onClick={handleConnectMetaMask}
            disabled={isLoading}
            className="btn-secondary w-full py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && walletType === 'metamask' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border border-black border-t-transparent"></div>
                Connecting...
              </>
            ) : (
              '🦊 Connect MetaMask'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-400 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-1 pt-4 border-t border-[#2a2f3e]">
          <p>🔗 Real blockchain integration</p>
          <p>💰 Jupiter + 1inch swaps</p>
          <p>📊 Live market data from DexScreener & Birdeye</p>
        </div>
      </div>
    </div>
  );
}
