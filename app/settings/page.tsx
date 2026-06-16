'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useEffect } from 'react';

export default function Settings() {
  const router = useRouter();
  const { isConnected, wallet } = useStore();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  return (
    <div className="flex h-screen bg-[#0f1419]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="space-y-6">
              <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Wallet</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Connected Wallet</p>
                    <p className="font-mono text-sm break-all">{wallet}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Trading Preferences</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Default Slippage</label>
                    <input type="number" defaultValue="1" min="0.1" max="10" step="0.1" className="w-full" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Fee Tier</label>
                    <select className="w-full">
                      <option>0.5% (Standard)</option>
                      <option>0.25% (Premium)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>Memescope v0.1.0</p>
                  <p>Production Trading Terminal</p>
                  <p>Powered by Next.js + Zustand</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
