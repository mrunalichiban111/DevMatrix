// app/trending/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchAllMarkets } from "@/services/fetchMarket";
import { fetchNFTMetadata } from "@/services/fetchNFTMetadata";
import { useWallet } from "@solana/wallet-adapter-react";
import { placeBet } from "@/services/contract";
import { useRouter } from "next/navigation";

type TrendCard = {
  publicKey: string;
  nftMint: string;
  name: string;
  image: string;
  description: string;
  totalUpBets: number;
  totalDownBets: number;
  upBettors: number;
  downBettors: number;
  endTs: number;
  finalized: boolean;
  result: number;
};

export default function TrendingPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [trends, setTrends] = useState<TrendCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "pending" | "finalized">("active");

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const markets = await fetchAllMarkets();
      const enriched = await Promise.allSettled(
        markets.map(async (market: { nftMint: string }) => {
          const meta = await fetchNFTMetadata(market.nftMint);
          return { ...market, ...meta };
        })
      );
      const successful = enriched
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<any>).value);
      setTrends(successful);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBet = async (market: TrendCard, side: 0 | 1, amount: number) => {
    if (!wallet.connected) return alert("Connect wallet first");
    try {
      await placeBet(wallet, market.nftMint, side, amount); // ✅ pass amount
      alert(side === 0 ? "🔥 Up bet placed!" : "📉 Down bet placed!");
      loadTrends();
    } catch (err: any) {
      console.error(err);
      alert("Bet failed: " + err.message);
    }
  };

  const now = Math.floor(Date.now() / 1000);

  // ✅ Hot trends — active, sorted by most bettors
  const hotTrends = [...trends]
    .filter((t) => !t.finalized && t.endTs > now)
    .sort((a, b) => (b.upBettors + b.downBettors) - (a.upBettors + a.downBettors))
    .slice(0, 3);

  // ✅ Filtered trends by tab
  const filtered = trends.filter((t) => {
    if (tab === "active") return !t.finalized && t.endTs > now;
    if (tab === "pending") return !t.finalized && t.endTs <= now;
    if (tab === "finalized") return t.finalized;
  });

  if (loading) return <p className="text-white p-10">Loading trends...</p>;

  return (
    <section className="w-full min-h-screen bg-black text-white">
      <div className="container mx-auto px-5 py-20">
        <h1 className="text-4xl font-bold uppercase mb-12">🔥 Trending</h1>

        {/* ── HOT RIGHT NOW ── */}
        {hotTrends.length > 0 && (
          <div className="mb-16">
            <h2 className="text-white font-bold text-2xl uppercase mb-6">
              ⚡ Hot Right Now
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {hotTrends.map((trend, index) => (
                <div
                  key={trend.publicKey}
                  onClick={() => router.push(`/trend/${trend.nftMint}`)}
                  className="relative bg-gradient-to-br from-purple-900 to-neutral-900 border border-purple-700 rounded-xl overflow-hidden cursor-pointer hover:border-purple-400 hover:scale-[1.02] transition-all"
                >
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    #{index + 1}
                  </div>

                  {trend.image ? (
                    <img src={trend.image} className="w-full h-36 object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-36 bg-neutral-800" />
                  )}

                  <div className="p-4">
                    <h3 className="text-white font-bold text-base mb-2">{trend.name}</h3>
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>🎲 {trend.upBettors + trend.downBettors} bettors</span>
                      <span>💰 {((trend.totalUpBets + trend.totalDownBets) / 1e9).toFixed(2)} SOL</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TABS ── */}
        <div className="flex gap-3 mb-8">
          {[
            { key: "active", label: "🔥 Active" },
            { key: "pending", label: "⏳ Pending" },
            { key: "finalized", label: "✅ Finalized" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${tab === t.key
                  ? "bg-purple-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TRENDS GRID ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500">No trends here yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((trend) => (
              <TrendCard
                key={trend.publicKey}
                trend={trend}
                onBet={handleBet}
                onClick={() => router.push(`/trend/${trend.nftMint}`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Card Component ───────────────────────────────────────────────────────────

function TrendCard({
  trend,
  onBet,
  onClick,
}: {
  trend: TrendCard;
  onBet: (market: TrendCard, side: 0 | 1, amount: number) => void;
  onClick: () => void;
}) {
  const [betAmount, setBetAmount] = useState(0.1); // ✅ per-card bet amount

  const totalBets = trend.totalUpBets + trend.totalDownBets;
  const upPct = totalBets > 0 ? Math.round((trend.totalUpBets / totalBets) * 100) : 50;
  const timeLeft = trend.endTs - Math.floor(Date.now() / 1000);
  const isExpired = timeLeft <= 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-600 transition-all">

      {/* ✅ Clickable image area → goes to detail page */}
      <div onClick={onClick} className="cursor-pointer">
        {trend.image ? (
          <img src={trend.image} className="w-full h-48 object-cover hover:opacity-80 transition-all" />
        ) : (
          <div className="w-full h-48 bg-neutral-800 flex items-center justify-center">
            <p className="text-neutral-500 text-sm">No image</p>
          </div>
        )}
      </div>

      <div className="p-5">
        {/* ✅ Clickable title → goes to detail page */}
        <h3
          onClick={onClick}
          className="text-white font-bold text-lg mb-1 cursor-pointer hover:text-purple-400 transition-all"
        >
          {trend.name}
        </h3>
        <p className="text-neutral-400 text-sm mb-4">{trend.description}</p>

        {/* Pool size */}
        <p className="text-xs text-neutral-500 mb-3">
          💰 Pool: {(totalBets / 1e9).toFixed(2)} SOL
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-red-900 rounded-full mb-2 overflow-hidden">
          <div
            className="h-2 bg-green-500 rounded-full transition-all"
            style={{ width: `${upPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-400 mb-4">
          <span>🔥 {upPct}% ({trend.upBettors})</span>
          <span>📉 {100 - upPct}% ({trend.downBettors})</span>
        </div>

        {/* Status / Bet Controls */}
        {trend.finalized ? (
          <div className={`text-center py-2 rounded text-sm font-medium ${trend.result === 0 ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
            }`}>
            {trend.result === 0 ? "✅ Went Viral!" : "❌ Didn't Trend"}
          </div>
        ) : isExpired ? (
          <div className="text-center py-2 bg-yellow-900 rounded text-sm text-yellow-400">
            ⏳ Awaiting finalization
          </div>
        ) : (
          <>
            {/* ✅ Amount Input */}
            <div className="mb-3">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={betAmount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) setBetAmount(val);
                }}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm mb-2"
                placeholder="Amount in SOL"
                onClick={(e) => e.stopPropagation()} // prevent card click
              />
              {/* Quick amount buttons */}
              <div className="flex gap-1">
                {[0.1, 0.5, 1].map((amt) => (
                  <button
                    key={amt}
                    onClick={(e) => { e.stopPropagation(); setBetAmount(amt); }}
                    className={`flex-1 py-1 rounded text-xs transition-all ${betAmount === amt
                        ? "bg-purple-600 text-white"
                        : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
                      }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ Bet Buttons with amount */}
            <div className="flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onBet(trend, 0, betAmount); }}
                className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded font-medium text-sm transition-all"
              >
                🔥 Up
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onBet(trend, 1, betAmount); }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded font-medium text-sm transition-all"
              >
                📉 Down
              </button>
            </div>
          </>
        )}

        {/* Timer */}
        {!isExpired && !trend.finalized && (
          <p className="text-center text-xs text-neutral-500 mt-3">
            ⏱ {Math.floor(timeLeft / 60)}m {timeLeft % 60}s left
          </p>
        )}
      </div>
    </div>
  );
}