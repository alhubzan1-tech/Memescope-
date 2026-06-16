'use client';

import { ArrowUp, ArrowDown, Heart } from 'lucide-react';
import { useStore } from '@/lib/store';

interface TokenCardProps {
  token: any;
  onView?: (token: any) => void;
  compact?: boolean;
}

export default function TokenCard({ token, onView, compact }: TokenCardProps) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStore();
  const isWatched = watchlist.includes(token.ca);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWatched) {
      removeFromWatchlist(token.ca);
    } else {
      addToWatchlist(token.ca);
    }
  };

  const isPositive = token.change24h >= 0;

  if (compact) {
    return (
      <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-4 hover:border-[#00d084] transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{token.symbol}</h3>
            <p className="text-gray-400 text-xs">{token.name}</p>
          </div>
          <button
            onClick={handleWatchlist}
            className="transition-all"
          >
            <Heart
              size={16}
              className={isWatched ? 'fill-[#00d084] text-[#00d084]' : 'text-gray-400'}
            />
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Price</span>
            <span className="font-mono font-semibold">${token.price.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Gain/Loss</span>
            <span className={`font-semibold ${isPositive ? 'green-text' : 'red-text'}`}>
              {isPositive ? '+' : ''}{token.change24h.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onView?.(token)}
      className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg p-4 hover:border-[#00d084] transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-base">{token.symbol}</h3>
          <p className="text-gray-400 text-xs">{token.name}</p>
        </div>
        <button
          onClick={handleWatchlist}
          className="transition-all"
        >
          <Heart
            size={16}
            className={isWatched ? 'fill-[#00d084] text-[#00d084]' : 'text-gray-400'}
          />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Price</span>
          <span className="font-mono font-semibold">${token.price.toFixed(6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Change</span>
          <span className={`font-semibold flex items-center gap-1 ${isPositive ? 'green-text' : 'red-text'}`}>
            {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {isPositive ? '+' : ''}{token.change24h.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Vol</span>
          <span className="font-mono">${(token.volume24h / 1e6).toFixed(1)}M</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Liquidity</span>
          <span className="font-mono">${(token.liquidity / 1e6).toFixed(1)}M</span>
        </div>
      </div>
    </div>
  );
}
