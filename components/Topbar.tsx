'use client';

import { useStore } from '@/lib/store';
import { Wallet } from 'lucide-react';

export default function Topbar() {
  const { wallet, isConnected } = useStore();

  if (!isConnected) return null;

  const displayWallet = wallet ? wallet.substring(0, 6) + '...' + wallet.substring(wallet.length - 4) : '';

  return (
    <div className="h-16 bg-[#0a0e13] border-b border-[#1a1f2e] px-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold">Memescope</h1>
      <div className="flex items-center gap-3 glass px-4 py-2 rounded-lg">
        <Wallet size={16} />
        <span className="text-sm">{displayWallet}</span>
      </div>
    </div>
  );
}
