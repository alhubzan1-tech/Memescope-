'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, BarChart3, Star, Settings, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';

const navItems = [
  { href: '/dashboard', label: 'Trending', icon: Flame },
  { href: '/portfolio', label: 'Portfolio', icon: BarChart3 },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { setWallet } = useStore();

  const handleDisconnect = () => {
    setWallet(null);
  };

  return (
    <div className="w-16 bg-[#0a0e13] border-r border-[#1a1f2e] flex flex-col items-center py-4 gap-8">
      <Link href="/" className="text-2xl font-bold text-[#00d084]">
        M
      </Link>

      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#00d084] text-black'
                  : 'text-gray-400 hover:bg-[#1a1f2e] hover:text-white'
              }`}
              title={label}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleDisconnect}
        className="p-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
        title="Disconnect"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}
