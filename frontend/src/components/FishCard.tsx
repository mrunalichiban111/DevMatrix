'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import type { FishTrend } from '@/types/fish';

type FishCardProps = {
  fish: FishTrend;
  onBet: (fish: FishTrend, side: 0 | 1, amount: number) => Promise<void> | void;
  compact?: boolean;
};

function UpArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path d="M12 4L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 4L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DownArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path d="M12 20L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 20L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 4V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloudCommentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M7.2 18.6H16.3C19.2 18.6 21.3 16.7 21.3 14C21.3 11.8 19.9 10.1 17.8 9.7C17.2 7.4 15.2 5.8 12.8 5.8C9.9 5.8 7.6 8 7.2 10.8C5.2 11 3.7 12.5 3.7 14.4C3.7 16.8 5.4 18.6 7.2 18.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SentimentRing({ percentage }: { percentage: number }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (circumference * clamped) / 100;

  return (
    <div className="relative flex h-11 w-11 items-center justify-center">
      <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="3" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#39FF14"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="pointer-events-none absolute text-[10px] font-semibold text-white">{clamped}%</span>
    </div>
  );
}

function asCommunity(category: string) {
  return `${category.toLowerCase().replace(/\s+/g, '')}`;
}


export default function FishCard({ fish, onBet, compact = false }: FishCardProps) {
  const router = useRouter();
  const wallet = useWallet();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [selectedSide, setSelectedSide] = useState<0 | 1>(0);
  const [betAmount, setBetAmount] = useState('0.1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalBets = fish.totalUpBets + fish.totalDownBets;
  const upPercentage = totalBets > 0 ? Math.round((fish.totalUpBets / totalBets) * 100) : 50;
  const timeLeft = fish.endTs - Math.floor(Date.now() / 1000);
  const isExpired = timeLeft <= 0;

  const mediaUrl = useMemo(() => fish.mediaUrl || fish.image || null, [fish.image, fish.mediaUrl]);
  const mediaType = useMemo(() => {
    if (fish.mediaType) {
      return fish.mediaType;
    }

    if (!mediaUrl) {
      return null;
    }

    return /\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl) ? 'video' : 'image';
  }, [fish.mediaType, mediaUrl]);

  const statusLabel = fish.finalized
    ? 'finalized'
    : isExpired
      ? 'awaiting finalization'
      : `${Math.max(1, Math.ceil(timeLeft / 60))}m left`;

  const openDetail = () => {
    router.push(`/discover/${fish.nftMint}`);
  };

  const openBetModal = (side: 0 | 1) => {
    setSelectedSide(side);
    setIsBetModalOpen(true);
  };

  const handleConfirmBet = async () => {
    if (!wallet.connected) {
      alert('Connect wallet first');
      return;
    }

    const amount = Number(betAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onBet(fish, selectedSide, amount);
      setIsBetModalOpen(false);
    } catch (error: any) {
      alert(error?.message || 'Bet failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className={`group relative overflow-hidden bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_28px_75px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.18)] ${compact ? 'rounded-2xl' : 'rounded-[26px]'}`}>
      <div className="pointer-events-none absolute -left-12 top-0 h-24 w-24 rounded-full bg-[#39FF14]/14 blur-2xl" />
      <div className="pointer-events-none absolute right-0 top-8 h-24 w-24 rounded-full bg-[#0894ff]/18 blur-2xl" />

      <div className="relative p-5 md:p-6">
        <button type="button" onClick={openDetail} className="w-full text-left">
          <div className="mb-3 flex items-center gap-3 text-xs text-white/55">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.1] text-sm text-white/90 shadow-[0_10px_20px_rgba(0,0,0,0.35)]">
              {fish.name?.charAt(0)?.toUpperCase() || 'F'}
            </div>
            <span className="text-white/80">{asCommunity(fish.name || 'fish')}</span>
            <span className="text-white/35">•</span>
            <span className="text-white/45">{statusLabel}</span>
          </div>

          <h2 className="text-xl font-medium tracking-tight text-white md:text-2xl">{fish.name}</h2>
          <p className="mt-3 text-sm leading-7 text-white/78 md:text-[15px]">
            {fish.description || 'No post description available for this fish yet.'}
          </p>

          {mediaUrl && mediaType && (
            <div className="mt-4 overflow-hidden rounded-2xl bg-black/25 shadow-[0_16px_34px_rgba(0,0,0,0.45)]">
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.02] md:h-[360px]"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={fish.name}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.02] md:h-[360px]"
                />
              )}
            </div>
          )}
        </button>
      </div>

      <div className="relative px-5 pb-5 md:px-6 md:pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/28 p-2 shadow-[0_14px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openBetModal(0)}
              disabled={fish.finalized || isExpired}
              className="inline-flex items-center gap-2 rounded-full bg-[#39FF14]/18 px-3 py-2 text-xs text-[#d4ffca] shadow-[0_10px_24px_rgba(0,0,0,0.32)] transition hover:bg-[#39FF14]/30 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <UpArrowIcon className="h-4 w-4" />
              <span>{fish.upBettors}</span>
            </button>

            <button
              type="button"
              onClick={() => openBetModal(1)}
              disabled={fish.finalized || isExpired}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.09] px-3 py-2 text-xs text-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.32)] transition hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <DownArrowIcon className="h-4 w-4" />
              <span>{fish.downBettors}</span>
            </button>

            <button
              type="button"
              onClick={openDetail}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.09] px-3 py-2 text-xs text-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.32)] transition hover:bg-white/[0.16]"
            >
              <CloudCommentIcon className="h-4 w-4" />
              <span>{fish.commentCount ?? 0}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white/[0.07] px-2 py-1.5">
            <SentimentRing percentage={upPercentage} />
            <div className="pr-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Sentiment</p>
              <p className="text-xs text-white/80">{upPercentage}% up</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/35">
          <span>{totalBets} total bets</span>
          <span>{fish.viralityScore !== undefined ? `${fish.viralityScore.toFixed(0)} score` : 'unscored'}</span>
        </div>
      </div>

      {isBetModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] bg-[linear-gradient(145deg,rgba(24,24,24,0.92),rgba(8,8,8,0.92))] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">Place bet</p>
                <h3 className="mt-2 text-2xl font-light tracking-tight">
                  {selectedSide === 0 ? 'Bet Up' : 'Bet Down'}
                </h3>
                <p className="mt-2 text-sm text-white/55">Choose the amount, then confirm the transaction.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBetModalOpen(false)}
                className="rounded-full bg-white/[0.08] px-3 py-2 text-xs text-white/70 transition hover:bg-white/[0.16] hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/35">Amount in SOL</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={betAmount}
                  onChange={(event) => setBetAmount(event.target.value)}
                  className="w-full rounded-2xl bg-white/[0.07] px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] outline-none transition placeholder:text-white/22 focus:bg-white/[0.12]"
                  placeholder="0.1"
                />
              </label>

              <div className="flex gap-2">
                {[0.1, 0.5, 1].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setBetAmount(String(amount))}
                    className="flex-1 rounded-full bg-white/[0.07] px-3 py-2 text-xs text-white/72 transition hover:bg-white/[0.16] hover:text-white"
                  >
                    {amount} SOL
                  </button>
                ))}
              </div>

              <div className="rounded-2xl bg-white/[0.04] px-4 py-3 text-xs text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                This uses the same on-chain bet flow as Trending.
              </div>

              <button
                type="button"
                onClick={handleConfirmBet}
                disabled={isSubmitting}
                className={`w-full rounded-full px-4 py-3 text-sm font-medium shadow-[0_10px_28px_rgba(0,0,0,0.4)] transition ${selectedSide === 0 ? 'bg-[#39FF14] text-black hover:bg-[#35e812]' : 'bg-white text-black hover:bg-white/90'} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
