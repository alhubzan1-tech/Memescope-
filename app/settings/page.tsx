'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function SettingsPage() {
  const router = useRouter();
  const { wallet } = useStore();
  const [settings, setSettings] = useState({
    slippageTolerance: 1,
    defaultChain: 'solana',
    notifications: true,
    darkMode: true,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!wallet) {
      router.push('/');
      return;
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [wallet, router]);

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex h-screen bg-[#0f1419]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-8 max-w-2xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-gray-400">Customize your trading preferences</p>
            </div>

            {/* Slippage Tolerance */}
            <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
              <label className="block text-sm font-semibold mb-4">Slippage Tolerance</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={settings.slippageTolerance}
                  onChange={(e) => setSettings({ ...settings, slippageTolerance: parseFloat(e.target.value) })}
                  className="flex-1 bg-[#0a0e13] border border-[#2a2f3e] rounded px-4 py-2 text-white"
                />
                <span className="text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Maximum acceptable price movement during your trade</p>
            </div>

            {/* Default Chain */}
            <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
              <label className="block text-sm font-semibold mb-4">Default Chain</label>
              <select
                value={settings.defaultChain}
                onChange={(e) => setSettings({ ...settings, defaultChain: e.target.value })}
                className="w-full bg-[#0a0e13] border border-[#2a2f3e] rounded px-4 py-2 text-white"
              >
                <option value="solana">Solana</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
              </select>
            </div>

            {/* RPC URL */}
            <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
              <label className="block text-sm font-semibold mb-4">RPC URL (Solana)</label>
              <input
                type="text"
                value={settings.rpcUrl}
                onChange={(e) => setSettings({ ...settings, rpcUrl: e.target.value })}
                className="w-full bg-[#0a0e13] border border-[#2a2f3e] rounded px-4 py-2 text-white text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">Use a custom RPC endpoint for faster transactions</p>
            </div>

            {/* Notifications */}
            <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
              <label className="flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Receive alerts for price changes and trade confirmations</p>
            </div>

            {/* Dark Mode */}
            <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-6">
              <label className="flex items-center justify-between">
                <span className="text-sm font-semibold">Dark Mode</span>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Use dark theme for reduced eye strain</p>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <button onClick={handleSave} className="btn-primary flex-1 py-3">
                {saved ? '✓ Saved' : 'Save Settings'}
              </button>
              <button onClick={() => router.back()} className="btn-secondary flex-1 py-3">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
