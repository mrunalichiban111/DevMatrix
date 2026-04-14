'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { fetchAllMarkets, fetchMyBets, fetchPoolByKey } from '@/services/fetchMarket';
import { fetchNFTMetadata } from '@/services/fetchNFTMetadata';
import { finalizeMarket, claimReward } from '@/services/contract';

type MyNFT = {
  publicKey: string;
  nftMint: string;
  name: string;
  image: string | null;
  description: string;
  totalUpBets: number;
  totalDownBets: number;
  upBettors: number;
  downBettors: number;
  endTs: number;
  finalized: boolean;
  result: number;
  viralityScore: number;
};

type MyBet = {
  publicKey: string;
  poolKey: string;
  nftMint: string;
  amount: number;
  side: number;
  claimed: boolean;
  name: string;
  image: string | null;
  finalized: boolean;
  result: number;
  endTs: number;
  canClaim: boolean;
};

type DashboardTab = 'trends' | 'bets';

function getFirstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || 'there';
}

function getUsername(name?: string | null, email?: string | null) {
  const fromEmail = email?.split('@')[0]?.trim();
  const fromName = name?.toLowerCase().replace(/[^a-z0-9]+/g, '').trim();

  return fromEmail || fromName || 'guest';
}

function ProfileAvatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return <img src={image} alt={name} className="h-16 w-16 rounded-2xl object-cover shadow-[0_12px_30px_rgba(0,0,0,0.45)] ring-1 ring-white/15" />;
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(57,255,20,0.18),rgba(171,159,242,0.24))] text-lg font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.45)] ring-1 ring-white/15">
      {name.trim().charAt(0).toUpperCase() || 'D'}
    </div>
  );
}

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const wallet = useWallet();
  const { data: session, status } = useSession();

  const [myNFTs, setMyNFTs] = useState<MyNFT[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [finalizing, setFinalizing] = useState<string | null>(null);

  const [myBets, setMyBets] = useState<MyBet[]>([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<DashboardTab>('trends');

  const userName = session?.user?.name?.trim() || 'Trend Rider';
  const firstName = getFirstName(session?.user?.name);
  const username = getUsername(session?.user?.name, session?.user?.email);
  const avatarImage = session?.user?.image || null;
  const walletAddress = publicKey?.toString() || '';

  useEffect(() => {
    if (connected && publicKey) {
      loadMyNFTs();
      loadMyBets();
    }
  }, [connected, publicKey]);

  const loadMyNFTs = async () => {
    try {
      setLoadingNFTs(true);
      const markets = await fetchAllMarkets();

      const mine = markets.filter(
        (m: { creator: string | undefined }) => m.creator === publicKey?.toString()
      );

      const enriched = await Promise.allSettled(
        mine.map(async (market: { nftMint: string }) => {
          const meta = await fetchNFTMetadata(market.nftMint);
          return { ...market, ...meta };
        })
      );

      const successful = enriched
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<any>).value);

      setMyNFTs(successful);
    } catch (err) {
      console.error('Failed to load my NFTs:', err);
    } finally {
      setLoadingNFTs(false);
    }
  };

  const loadMyBets = async () => {
    try {
      setLoadingBets(true);
      const bets = await fetchMyBets(publicKey!.toString());

      const enriched = await Promise.allSettled(
        bets.map(async (bet: any) => {
          const pool = await fetchPoolByKey(bet.poolKey);

          if (!pool) return null;

          const meta = await fetchNFTMetadata(pool.nftMint);
          const isWinner = pool.finalized && bet.side === pool.result;

          return {
            ...bet,
            nftMint: pool.nftMint,
            name: meta.name,
            image: meta.image,
            finalized: pool.finalized,
            result: pool.result,
            endTs: pool.endTs,
            canClaim: isWinner && !bet.claimed,
          };
        })
      );

      const successful = enriched
        .filter((r) => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value !== null)
        .map((r) => (r as PromiseFulfilledResult<any>).value);

      setMyBets(successful);
    } catch (err) {
      console.error('Failed to load bets:', err);
    } finally {
      setLoadingBets(false);
    }
  };

  const handleFinalize = async (nftMint: string) => {
    try {
      setFinalizing(nftMint);
      await finalizeMarket(wallet, nftMint, 70);
      alert('✅ Market finalized!');
      loadMyNFTs();
    } catch (err: any) {
      console.error(err);
      alert('Error finalizing: ' + err.message);
    } finally {
      setFinalizing(null);
    }
  };

  const handleClaim = async (nftMint: string) => {
    try {
      setClaiming(nftMint);
      await claimReward(wallet, nftMint);
      alert('✅ Reward claimed!');
      loadMyBets();
    } catch (err: any) {
      console.error(err);
      alert('Claim failed: ' + err.message);
    } finally {
      setClaiming(null);
    }
  };

  const now = Math.floor(Date.now() / 1000);

  const totalCreated = myNFTs.length;
  const totalWins = myNFTs.filter((n) => n.finalized && n.result === 0).length;
  const totalBetsReceived = myNFTs.reduce((acc, n) => acc + n.totalUpBets + n.totalDownBets, 0);
  const totalBetPlaced = myBets.reduce((acc, b) => acc + b.amount, 0);
  const totalClaimable = myBets.filter((b) => b.canClaim).length;

  const tabs: Array<{ key: DashboardTab; label: string }> = [
    { key: 'trends', label: `My Trends (${myNFTs.length})` },
    { key: 'bets', label: `My Bets (${myBets.length})` },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(57,255,20,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(8,148,255,0.12),transparent_28%),linear-gradient(180deg,#050505_0%,#090909_56%,#050505_100%)] text-white">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(57,255,20,0.14)_0%,_rgba(0,0,0,0)_72%)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(171,159,242,0.16)_0%,_rgba(0,0,0,0)_74%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(8,148,255,0.12)_0%,_rgba(0,0,0,0)_72%)] blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-10">
        {!connected ? (
          <div className="mx-auto flex min-h-[78vh] w-full max-w-3xl items-center justify-center">
            <div className="w-full rounded-[34px] border border-white/10 bg-white/[0.05] p-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl md:p-12">
              <p className="text-[10px] uppercase tracking-[0.45em] text-white/38">Dashboard access</p>
              <h1 className="mt-4 text-4xl font-light tracking-tight text-white md:text-6xl">Connect Your Wallet</h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                Link your wallet to load your trends, bets, and Google profile into a clean command center.
              </p>
              <button
                onClick={() => setVisible(true)}
                className="mt-8 rounded-full bg-[#39FF14] px-8 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-black shadow-[0_14px_28px_rgba(57,255,20,0.2)] transition hover:bg-[#35e812]"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-[10px] uppercase tracking-[0.45em] text-white/38">Dashboard</p>
                    <h1 className="mt-4 text-4xl font-light tracking-tight text-white md:text-6xl">Hi {firstName}!</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                      Your trends, bets, and wallet data are organized here with the same glassmorphism language as the rest of the app.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-white/[0.06] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/72 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
                        {status === 'loading' ? 'Syncing Google profile' : `Google: @${username}`}
                      </span>
                      <span className="rounded-full bg-[#39FF14]/12 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#d8ffc8] shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
                        Wallet connected
                      </span>
                      <button
                        onClick={() => {
                          loadMyNFTs();
                          loadMyBets();
                        }}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/68 shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:bg-white/[0.09] hover:text-white"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-[28px] border border-white/10 bg-black/25 p-4 shadow-[0_18px_42px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <ProfileAvatar name={userName} image={avatarImage} />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-white/36">Google client</p>
                      <p className="mt-2 text-lg font-medium text-white">{userName}</p>
                      <p className="text-sm text-white/58">@{username}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl md:p-8">
                <p className="text-[10px] uppercase tracking-[0.45em] text-white/38">Wallet summary</p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Address</p>
                    <p className="mt-2 break-all text-sm leading-6 text-white/72">{walletAddress}</p>
                  </div>
                  <div className="rounded-2xl bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Status</p>
                    <p className="mt-2 text-sm text-[#d8ffc8]">Connected</p>
                  </div>
                  <div className="rounded-2xl bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Portfolio value</p>
                    <p className="mt-2 text-sm text-white/72">{(totalBetPlaced / 1e9).toFixed(2)} SOL</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Trends Created', value: totalCreated.toString() },
                { label: 'Bets Received', value: `${(totalBetsReceived / 1e9).toFixed(2)} SOL` },
                { label: 'Went Viral', value: totalWins.toString() },
                { label: 'Claimable Rewards', value: totalClaimable.toString(), highlight: totalClaimable > 0 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-[28px] border p-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl ${
                    stat.highlight ? 'border-[#39FF14]/30 bg-[#39FF14]/10' : 'border-white/10 bg-white/[0.05]'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-[0.32em] text-white/38">{stat.label}</p>
                  <p className={`mt-3 text-3xl font-light tracking-tight ${stat.highlight ? 'text-[#d8ffc8]' : 'text-white'}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-5 py-2 text-sm font-medium uppercase tracking-[0.2em] transition ${
                    activeTab === tab.key
                      ? 'bg-[#39FF14] text-black shadow-[0_14px_28px_rgba(57,255,20,0.18)]'
                      : 'border border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="rounded-[34px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl md:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-light tracking-tight text-white md:text-2xl">Recent Activity</h2>
                <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/45">
                  Live feed
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-black/25 p-4 text-sm leading-7 text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                No activity yet. Start minting trends to see your activity here.
              </div>
            </div>

            {activeTab === 'trends' && (
              <div className="rounded-[34px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl md:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-light tracking-tight text-white md:text-2xl">My Trends</h2>
                  <button
                    onClick={loadMyNFTs}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/55 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Refresh
                  </button>
                </div>

                {loadingNFTs ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-white/45">Loading your trends...</p>
                  </div>
                ) : myNFTs.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-white/45">No trends yet. Go mint your first trend!</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {myNFTs.map((nft) => {
                      const isExpired = now >= nft.endTs;
                      const canFinalize = isExpired && !nft.finalized;
                      const timeLeft = nft.endTs - now;
                      const totalBets = nft.totalUpBets + nft.totalDownBets;
                      const upPct = totalBets > 0 ? Math.round((nft.totalUpBets / totalBets) * 100) : 50;

                      return (
                        <div key={nft.publicKey} className="overflow-hidden rounded-[28px] border border-white/10 bg-black/24 shadow-[0_24px_55px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]">
                          {nft.image ? (
                            <img src={nft.image} alt={nft.name} className="h-44 w-full object-cover" />
                          ) : (
                            <div className="flex h-44 w-full items-center justify-center bg-white/5">
                              <p className="text-xs uppercase tracking-[0.24em] text-white/35">No image</p>
                            </div>
                          )}

                          <div className="p-5">
                            <h3 className="text-lg font-medium text-white">{nft.name}</h3>
                            <p className="mt-2 text-sm leading-6 text-white/55">{nft.description}</p>

                            <div className="mt-4 h-1.5 w-full rounded-full bg-white/10">
                              <div className="h-1.5 rounded-full bg-[#39FF14]" style={{ width: `${upPct}%` }} />
                            </div>
                            <div className="mt-2 flex justify-between text-xs text-white/45">
                              <span>Up {upPct}% ({nft.upBettors})</span>
                              <span>Down {100 - upPct}% ({nft.downBettors})</span>
                            </div>

                            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/45">
                              Pool: {(totalBets / 1e9).toFixed(2)} SOL
                            </p>

                            {nft.finalized ? (
                              <div className={`mt-4 rounded-2xl px-4 py-3 text-center text-sm font-medium ${nft.result === 0 ? 'bg-[#39FF14]/12 text-[#d8ffc8]' : 'bg-red-500/10 text-red-200'}`}>
                                {nft.result === 0 ? 'Went Viral' : "Didn't Trend"}
                              </div>
                            ) : canFinalize ? (
                              <button
                                onClick={() => handleFinalize(nft.nftMint)}
                                disabled={finalizing === nft.nftMint}
                                className="mt-4 w-full rounded-2xl bg-[#39FF14] py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#35e812] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {finalizing === nft.nftMint ? 'Finalizing...' : 'Finalize Market'}
                              </button>
                            ) : (
                              <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-white/45">
                                {Math.max(0, Math.floor(timeLeft / 60))}m {Math.max(0, timeLeft % 60)}s remaining
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bets' && (
              <div className="rounded-[34px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl md:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-light tracking-tight text-white md:text-2xl">My Bets</h2>
                  <button
                    onClick={loadMyBets}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/55 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Refresh
                  </button>
                </div>

                {loadingBets ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-white/45">Loading your bets...</p>
                  </div>
                ) : myBets.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-white/45">No bets yet. Go bet on some trends!</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {myBets.map((bet) => (
                      <div key={bet.publicKey} className="overflow-hidden rounded-[28px] border border-white/10 bg-black/24 shadow-[0_24px_55px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]">
                        {bet.image ? (
                          <img src={bet.image} alt={bet.name} className="h-40 w-full object-cover" />
                        ) : (
                          <div className="flex h-40 w-full items-center justify-center bg-white/5">
                            <p className="text-xs uppercase tracking-[0.24em] text-white/35">No image</p>
                          </div>
                        )}

                        <div className="p-5">
                          <h3 className="text-lg font-medium text-white">{bet.name}</h3>

                          <div className="mt-3 flex justify-between text-xs text-white/45">
                            <span>Your bet: {bet.side === 0 ? 'Up' : 'Down'}</span>
                            <span>{(bet.amount / 1e9).toFixed(2)} SOL</span>
                          </div>

                          {bet.claimed ? (
                            <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-white/45">
                              Reward Claimed
                            </div>
                          ) : bet.canClaim ? (
                            <button
                              onClick={() => handleClaim(bet.nftMint)}
                              disabled={claiming === bet.nftMint}
                              className="mt-4 w-full rounded-2xl bg-[#39FF14] py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#35e812] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {claiming === bet.nftMint ? 'Claiming...' : 'Claim Reward'}
                            </button>
                          ) : bet.finalized ? (
                            <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-red-200">
                              Lost - {bet.side === 0 ? "Didn't go viral" : 'Went viral'}
                            </div>
                          ) : (
                            <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-white/45">
                              Awaiting result
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
