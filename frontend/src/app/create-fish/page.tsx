'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { calculateViralityScore } from '@/services/viralityScore';
import { mintNFT } from '@/services/nft';
import { initializeMarket } from '@/services/contract';

type LaunchStatus = 'idle' | 'analyzing' | 'minting' | 'creating-market' | 'done';

function StepPill({
  step,
  current,
  title,
  subtitle,
}: {
  step: number;
  current: number;
  title: string;
  subtitle: string;
}) {
  const active = current >= step;
  const completed = current > step;

  return (
    <button
      type="button"
      className={`flex w-full items-center gap-4 rounded-[22px] border px-4 py-3 text-left transition ${active ? 'border-white/16 bg-white/[0.09] shadow-[0_16px_36px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)]' : 'border-white/8 bg-white/[0.03] opacity-75 hover:opacity-100'}`}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold ${completed ? 'bg-[#39FF14] text-black' : active ? 'bg-white text-black' : 'bg-white/[0.08] text-white/65'}`}>
        {step}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/35">Step {step}</p>
        <h3 className="mt-1 text-base text-white/92">{title}</h3>
        <p className="mt-1 text-sm text-white/52">{subtitle}</p>
      </div>
    </button>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M19 15l.9 3.2L23 19l-3.1.8L19 23l-.9-3.2L15 19l3.1-.8L19 15Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export default function CreateFishPage() {
  const router = useRouter();
  const wallet = useWallet();
  const { setVisible } = useWalletModal();

  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('Build the fish, score the post, then launch the market.');
  const [viralityScore, setViralityScore] = useState<number | null>(null);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const isStepOneComplete = category.trim().length > 0;
  const isStepTwoComplete = description.trim().length > 0;
  const isStepThreeComplete = currentStep === 3 || Boolean(imageFile);

  const totalProgress = useMemo(() => {
    const count = [isStepOneComplete, isStepTwoComplete, isStepThreeComplete].filter(Boolean).length;
    return Math.round((count / 3) * 100);
  }, [isStepOneComplete, isStepTwoComplete, isStepThreeComplete]);

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setImageFile(droppedFile);
      setCurrentStep(3);
    }
  };

  const handleLaunch = async () => {
    if (!wallet.connected) {
      setStatusMessage('Connect your wallet before minting.');
      setVisible(true);
      return;
    }

    if (!category.trim() || !description.trim()) {
      setLaunchError('Add a heading and post content before launching.');
      return;
    }

    setLaunchError(null);
    setLaunchStatus('analyzing');
    setStatusMessage('Reading the post and scoring the virality signal.');
    setTransactionStatus(null);
    setMintAddress(null);

    let score: number | null = null;

    try {
      const analysis = await calculateViralityScore(category.trim(), description.trim());
      score = analysis.metrics.final_virality_score_100;
      setViralityScore(score);
      setStatusMessage(`Virality score ready: ${score.toFixed(1)}/100.`);
    } catch (error) {
      console.error('Virality analysis failed:', error);
      setStatusMessage('Virality analysis temporarily unavailable. Minting anyway.');
    }

    try {
      setLaunchStatus('minting');
      setStatusMessage('Minting the NFT from the heading and post content.');

      const nft = await mintNFT(wallet, imageFile, category.trim(), description.trim());
      setMintAddress(nft.mint);

      setLaunchStatus('creating-market');
      setStatusMessage('Seeding the on-chain market around the new fish.');

      const market = await initializeMarket(wallet, new PublicKey(nft.mint), 300);
      setTransactionStatus(market.tx);

      setLaunchStatus('done');
      setStatusMessage('Fish created and market initialized.');
      setCurrentStep(3);

      if (score === null) {
        setViralityScore(null);
      }
    } catch (error: any) {
      console.error(error);
      setLaunchStatus('idle');
      setStatusMessage('Launch failed. Check your wallet connection and try again.');
      setLaunchError(error?.message || 'Failed to create the fish.');
    }
  };

  const canProceed =
    (currentStep === 1 && isStepOneComplete) ||
    (currentStep === 2 && isStepTwoComplete) ||
    currentStep === 3;

  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10 pt-2 lg:gap-8">
      <div className="pointer-events-none absolute -left-8 top-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(57,255,20,0.18)_0%,_rgba(0,0,0,0)_72%)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(8,148,255,0.18)_0%,_rgba(0,0,0,0)_74%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(171,159,242,0.12)_0%,_rgba(0,0,0,0)_72%)] blur-3xl" />

      <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(255,255,255,0.04))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl md:p-6">
        <div className="absolute -right-8 top-0 h-28 w-28 rounded-full bg-[#39FF14]/10 blur-3xl" />
        <div className="absolute -left-10 top-4 h-24 w-24 rounded-full bg-[#0894ff]/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.38em] text-white/40">Create Fish</p>
            <h1 className="mt-3 text-3xl font-light tracking-tight text-white md:text-5xl">
              Launch a post as a market-ready fish.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
              Add a category, write the post description, optionally attach an image, then mint the NFT and seed the market in one pass.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            <div className="rounded-[22px] border border-white/10 bg-black/25 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Progress</p>
              <p className="mt-2 text-2xl text-white">{totalProgress}%</p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/25 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Wallet</p>
              <p className="mt-2 text-sm text-white/80">{wallet.connected ? `${wallet.publicKey?.toString().slice(0, 4)}...${wallet.publicKey?.toString().slice(-4)}` : 'Disconnected'}</p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-black/25 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Score</p>
              <p className="mt-2 text-sm text-white/80">{viralityScore === null ? 'Pending' : `${viralityScore.toFixed(1)}/100`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <StepPill
              step={1}
              current={currentStep}
              title="Choose heading"
              subtitle="This category or heading is what you test for engagement."
            />
            <StepPill
              step={2}
              current={currentStep}
              title="Write post content"
              subtitle="The description is the actual post content the ML service reads."
            />
            <StepPill
              step={3}
              current={currentStep}
              title="Optional image"
              subtitle="Upload artwork if you want, or skip and mint without one."
            />
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(150deg,rgba(255,255,255,0.1),rgba(255,255,255,0.035))] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl md:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/38">Wizard</p>
                <h2 className="mt-1 text-2xl text-white">Build the fish</h2>
              </div>

              <div className="rounded-full bg-white/[0.06] px-3 py-2 text-xs uppercase tracking-[0.22em] text-white/55 shadow-[0_10px_24px_rgba(0,0,0,0.32)]">
                {launchStatus === 'done' ? 'Ready' : launchStatus === 'minting' ? 'Minting' : launchStatus === 'creating-market' ? 'Seeding market' : 'Draft'}
              </div>
            </div>

            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="rounded-[26px] border border-white/10 bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <label className="block">
                    <span className="mb-3 block text-xs uppercase tracking-[0.28em] text-white/38">Category / heading</span>
                    <input
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && isStepOneComplete) {
                          setCurrentStep(2);
                        }
                      }}
                      className="w-full rounded-[20px] border border-white/10 bg-white/[0.06] px-4 py-4 text-lg text-white outline-none transition placeholder:text-white/24 focus:bg-white/[0.1] focus:border-white/20"
                      placeholder="e.g. AI Memecoin Drama"
                    />
                  </label>

                  <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-white/58">
                    <SparkIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#39FF14]" />
                    <p>The heading is what people see first, so use it to test whether engagement lands there.</p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="rounded-[26px] border border-white/10 bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <label className="block">
                    <span className="mb-3 block text-xs uppercase tracking-[0.28em] text-white/38">Post description</span>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={7}
                      className="w-full resize-none rounded-[20px] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/24 focus:bg-white/[0.1] focus:border-white/20"
                      placeholder="Explain the story, context, and why people should care about this fish."
                    />
                  </label>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-white/58">
                      The ML service reads this content for the virality score.
                    </div>
                    <div className="rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-white/58">
                      Keep it concise, specific, and focused on the actual post content.
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="rounded-[26px] border border-white/10 bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <label
                    className="group flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-white/12 bg-[radial-gradient(circle_at_top,_rgba(57,255,20,0.08),_rgba(255,255,255,0.02)_55%,_rgba(0,0,0,0)_100%)] p-5 text-center transition hover:border-white/22 hover:bg-white/[0.05]"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.08] text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.32)]">
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 16V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M8.5 11.5L12 8l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 16.5A3.5 3.5 0 0 1 7.5 13h.6A5.9 5.9 0 0 1 19 14.5 3 3 0 0 1 18 20H7.5A3.5 3.5 0 0 1 4 16.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="mt-5 text-xl text-white">Drag and drop or upload an image</p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
                      Optional. If you skip this step, the NFT still mints with the heading and post content.
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                    />
                  </label>

                  {imageFile && (
                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-white/64">
                      <span>{imageFile.name}</span>
                      <button type="button" onClick={() => setImageFile(null)} className="text-xs uppercase tracking-[0.22em] text-white/38 transition hover:text-white">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-sm text-white/52">{statusMessage}</div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                    disabled={currentStep === 1 || launchStatus === 'analyzing' || launchStatus === 'minting' || launchStatus === 'creating-market'}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/70 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Back
                  </button>

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => Math.min(3, prev + 1))}
                      disabled={!canProceed || launchStatus === 'analyzing' || launchStatus === 'minting' || launchStatus === 'creating-market'}
                      className="rounded-full bg-[#39FF14] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black shadow-[0_16px_34px_rgba(0,0,0,0.35)] transition hover:bg-[#35e812] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLaunch}
                      disabled={launchStatus === 'analyzing' || launchStatus === 'minting' || launchStatus === 'creating-market' || !wallet.connected}
                      className="rounded-full bg-[linear-gradient(135deg,#39FF14,#0894ff)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black shadow-[0_16px_34px_rgba(0,0,0,0.35)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {launchStatus === 'analyzing'
                        ? 'Analyzing...'
                        : launchStatus === 'minting'
                          ? 'Minting...'
                          : launchStatus === 'creating-market'
                            ? 'Seeding market...'
                            : 'Analyze & Mint Fish'}
                    </button>
                  )}
                </div>
              </div>

              {launchError && <p className="text-sm text-red-300">{launchError}</p>}
            </div>
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-[30px] bg-[linear-gradient(160deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/38">Launch Notes</p>
                <h3 className="mt-1 text-lg text-white">What happens next</h3>
              </div>
              <span className="rounded-full bg-[#39FF14]/18 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#d8ffd1]">
                Glass
              </span>
            </div>

            <div className="space-y-3 text-sm leading-7 text-white/68">
              <p>1. Category becomes the heading used to judge engagement.</p>
              <p>2. Description is the post content, and the ML service scores it before minting.</p>
              <p>3. The image is optional; if you add one, it mints as NFT artwork.</p>
              <p>4. The NFT is minted and the market is initialized on-chain using the same web3 flow as mint-trend2.</p>
            </div>

            <div className="mt-5 rounded-2xl bg-black/25 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {wallet.connected ? 'Wallet connected and ready to sign transactions.' : 'Connect your wallet to mint and seed the market.'}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.05] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">Virality</p>
                <p className="mt-2 text-lg text-white">{viralityScore === null ? 'Pending' : `${viralityScore.toFixed(1)}`}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.05] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">Market</p>
                <p className="mt-2 text-lg text-white">300s</p>
              </div>
            </div>

            {mintAddress && (
              <div className="mt-4 rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-white/70">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">Mint</p>
                <p className="mt-2 break-all text-white/80">{mintAddress}</p>
              </div>
            )}

            {transactionStatus && (
              <div className="mt-4 rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-white/70">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">Transaction</p>
                <p className="mt-2 break-all text-white/80">{transactionStatus}</p>
              </div>
            )}

            {launchStatus === 'done' && mintAddress && (
              <button
                type="button"
                onClick={() => router.push(`/discover/${mintAddress}`)}
                className="mt-5 w-full rounded-full bg-[#39FF14] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black shadow-[0_16px_34px_rgba(0,0,0,0.35)] transition hover:bg-[#35e812]"
              >
                View Fish
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}