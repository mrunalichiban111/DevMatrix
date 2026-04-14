'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchAllMarkets } from '@/services/fetchMarket';
import { fetchNFTMetadata } from '@/services/fetchNFTMetadata';
import { placeBet } from '@/services/contract';
import FishCard from '@/components/FishCard';
import type { FishTrend } from '@/types/fish';

type ChainEvent = {
  wallet: string;
  side: 'Up' | 'Down';
  amountSol: number;
  category: string;
  ago: string;
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const fakeChainEvents: ChainEvent[] = [
  { wallet: '7gK...9pL', side: 'Up', amountSol: 0.72, category: 'AI Memecoins', ago: '19s ago' },
  { wallet: 'aD2...Qw7', side: 'Down', amountSol: 1.25, category: 'Gaming Rumor', ago: '46s ago' },
  { wallet: 'Bv9...tN3', side: 'Up', amountSol: 0.31, category: 'Indie Launch', ago: '1m ago' },
  { wallet: 'kP1...mA8', side: 'Up', amountSol: 2.18, category: 'Creator Drama', ago: '2m ago' },
  { wallet: 'Uz4...xL0', side: 'Down', amountSol: 0.93, category: 'NFT Collab', ago: '3m ago' },
  { wallet: 'Jw6...cR4', side: 'Up', amountSol: 0.54, category: 'Web3 Sports', ago: '4m ago' },
];

export default function DiscoverPage() {
  const wallet = useWallet();
  const [fishes, setFishes] = useState<FishTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'hot' | 'new' | 'final'>('hot');

  useEffect(() => {
    loadFish();
  }, []);

  const loadFish = async () => {
    try {
      const markets = await fetchAllMarkets();
      const enriched = await Promise.allSettled(
        markets.map(async (market: any) => {
          const meta = await fetchNFTMetadata(market.nftMint);
          return {
            ...market,
            ...meta,
            commentCount: 0,
          } satisfies FishTrend;
        })
      );

      const successful = enriched
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<FishTrend>).value);

      setFishes(successful);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBet = async (fish: FishTrend, side: 0 | 1, amount: number) => {
    if (!wallet.connected) {
      alert('Connect wallet first');
      return;
    }

    await placeBet(wallet, fish.nftMint, side, amount);
    await loadFish();
  };

  const now = Math.floor(Date.now() / 1000);

  const sortedFishes = useMemo(() => {
    const list = [...fishes];

    if (tab === 'final') {
      return list.filter((fish) => fish.finalized);
    }

    if (tab === 'new') {
      return list.sort((a, b) => b.endTs - a.endTs);
    }

    return list.sort((a, b) => (b.upBettors + b.downBettors) - (a.upBettors + a.downBettors));
  }, [fishes, tab]);

  const activeCount = sortedFishes.filter((fish) => !fish.finalized && fish.endTs > now).length;

  if (loading) {
    return (
      <div className="w-full py-10">
        <p className="text-white/70">Loading fishes...</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl animate-fade-in pb-10">
      <div className="pointer-events-none absolute -left-10 top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(57,255,20,0.16)_0%,_rgba(0,0,0,0)_72%)] blur-2xl" />
      <div className="pointer-events-none absolute right-8 top-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(171,159,242,0.16)_0%,_rgba(0,0,0,0)_72%)] blur-3xl" />

      <div className="sticky top-0 z-30 mb-6 pt-2">
        <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] px-4 py-3 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]">
          <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-[#39FF14]/18 blur-2xl" />
          <div className="pointer-events-none absolute -right-12 top-0 h-24 w-24 rounded-full bg-[#0894ff]/20 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/assets/logo.svg" alt="DevMatrix" className="h-7 w-auto invert" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.36em] text-white/45">Discover</p>
                <p className="text-sm text-white/80">Fish feed</p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-2 text-xs text-white/75 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition hover:bg-white/[0.14] hover:text-white"
              aria-label="Search"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mb-5 max-w-3xl text-sm leading-6 text-white/55">
        Category is shown as the main title and each description reads like a social post. Tap the post or comments to open details, tap arrows to place a bet.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { key: 'hot', label: 'Hot' },
          { key: 'new', label: 'New' },
          { key: 'final', label: 'Final' },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setTab(option.key as 'hot' | 'new' | 'final')}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.24em] shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition ${tab === option.key ? 'bg-[#39FF14]/24 text-[#d7ffca]' : 'bg-white/[0.06] text-white/58 hover:bg-white/[0.14] hover:text-white'}`}
          >
            {option.label}
          </button>
        ))}
        <div className="ml-auto hidden items-center rounded-full bg-white/[0.05] px-3 py-2 text-xs uppercase tracking-[0.24em] text-white/35 shadow-[0_10px_24px_rgba(0,0,0,0.35)] md:flex">
          {activeCount} active fish
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          {sortedFishes.length === 0 ? (
            <div className="rounded-[24px] bg-white/[0.05] p-8 text-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
              No fish yet.
            </div>
          ) : (
            sortedFishes.map((fish) => (
              <FishCard key={fish.publicKey} fish={fish} onBet={handleBet} />
            ))
          )}
        </section>

        <aside className="h-fit rounded-[24px] bg-[linear-gradient(150deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl lg:sticky lg:top-[82px]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/42">Chain Activity</p>
              <h3 className="mt-1 text-base text-white/90">Recent changes</h3>
            </div>
            <span className="rounded-full bg-[#39FF14]/20 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-[#dcffd2]">
              Live
            </span>
          </div>

          <div className="space-y-3">
            {fakeChainEvents.map((event, index) => (
              <article
                key={`${event.wallet}-${index}`}
                className="rounded-2xl bg-black/30 px-3 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-white/80">{event.wallet}</span>
                  <span className="text-[11px] text-white/45">{event.ago}</span>
                </div>

                <p className="text-sm leading-6 text-white/75">
                  <span className={event.side === 'Up' ? 'text-[#bfffb0]' : 'text-white/80'}>{event.side}</span>{' '}
                  bet of <span className="text-white">{event.amountSol.toFixed(2)} SOL</span> on{' '}
                  <span className="text-white">{event.category}</span>
                </p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
