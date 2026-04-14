'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';

type AuthStep = 'options' | 'google-connect' | 'complete-profile';
type EntryFlow = 'manual' | 'google-return';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryFlow: EntryFlow;
  returnTo: string;
}

function slugifyName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 24);
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.76 32.657 29.458 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.967 3.043l5.657-5.657C34.021 6.053 29.274 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.967 3.043l5.657-5.657C34.021 6.053 29.274 4 24 4c-7.732 0-14.4 4.366-17.694 10.691z" />
      <path fill="#4CAF50" d="M24 44c5.169 0 9.88-1.977 13.445-5.197l-6.225-5.254C29.14 35.091 26.715 36 24 36c-5.438 0-9.723-3.321-11.277-7.946l-6.53 5.036C9.441 39.556 16.083 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.96 11.96 0 01-4.083 5.549l.003-.002 6.225 5.254C36.986 38.596 44 33 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function PhantomMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <path d="M4.5 8.2C4.5 5.9 6.4 4 8.7 4h6.6c2.3 0 4.2 1.9 4.2 4.2v7.6c0 1.8-1.5 3.2-3.2 3.2h-1.1c-.6 0-1.2-.2-1.7-.6l-.6-.5c-.3-.2-.7-.2-1 0l-.7.5c-.5.4-1 .6-1.7.6H8.7c-2.3 0-4.2-1.9-4.2-4.2V8.2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 10.2c.5 0 .9.4.9.9v2.5c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2.5c0-.5.4-.9.9-.9Zm3.2 0c.5 0 .9.4.9.9v2.5c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2.5c0-.5.4-.9.9-.9Zm3.2 0c.5 0 .9.4.9.9v2.5c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2.5c0-.5.4-.9.9-.9Z" fill="currentColor" />
    </svg>
  );
}

function SparkLine() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none">
      <path d="M12 2.75l1.7 5.55L19.25 10l-5.55 1.7L12 17.25l-1.7-5.55L4.75 10l5.55-1.7L12 2.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CloseMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function AuthModal({ isOpen, onClose, entryFlow, returnTo }: AuthModalProps) {
  const { setVisible } = useWalletModal();
  const { connected, publicKey } = useWallet();
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<AuthStep>('options');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [dateJoined] = useState(() => new Date());
  const [profileTouched, setProfileTouched] = useState(false);

  const joinedLabel = useMemo(
    () =>
      dateJoined.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [dateJoined]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (entryFlow === 'google-return') {
      setStep('google-connect');
      return;
    }

    if (connected && !session?.user) {
      setStep('complete-profile');
      return;
    }

    setStep('options');
  }, [connected, entryFlow, isOpen, session?.user]);

  useEffect(() => {
    if (!isOpen || entryFlow !== 'google-return' || !connected) {
      return;
    }

    router.replace('/discover');
    onClose();
  }, [connected, entryFlow, isOpen, onClose, router]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (step === 'complete-profile' && !profileTouched && name) {
      setUsername(slugifyName(name));
    }
  }, [isOpen, name, profileTouched, step]);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: returnTo });
  };

  const handlePhantomConnect = () => {
    setVisible(true);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const profile = {
      name,
      username: username || slugifyName(name),
      dateJoined: dateJoined.toISOString(),
      wallet: publicKey?.toString() ?? null,
    };

    localStorage.setItem('devmatrix-profile', JSON.stringify(profile));
    router.replace('/discover');
    onClose();
  };

  const profileInitial = (name || session?.user?.name || 'D').trim().charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#080808] text-white shadow-[0_30px_120px_rgba(0,0,0,0.65)] scale-95 border border-white/10 rounded-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(57,255,20,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(171,159,242,0.15),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%)]" />
        <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-[#39FF14]/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-[#AB9FF2]/10 blur-3xl" />

        <div className="relative grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-white/10 p-6 md:border-b-0 md:border-r md:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.45em] text-white/40">DevMatrix Access</p>
                <h2 className="mt-3 text-3xl font-light tracking-tight text-white md:text-4xl">
                  Join the feed.
                  <span className="block text-[#39FF14]">Move with the signal.</span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <CloseMark />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/65">
              <SparkLine />
              <span>Minimal onboarding. Two paths. One clean handoff into Discover.</span>
            </div>

            {step === 'options' && (
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  className="group w-full rounded-2xl border border-white/10 bg-white px-5 py-4 text-left text-black transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_20px_40px_rgba(255,255,255,0.08)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
                      <GoogleMark />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Continue with Google</p>
                      <p className="mt-1 text-xs text-black/55">Use NextAuth to sign in, then connect your wallet.</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.28em] text-black/40 transition group-hover:text-black/60">OAuth</span>
                  </div>
                </button>

                <button
                  onClick={handlePhantomConnect}
                  className="group w-full rounded-2xl border border-[#AB9FF2]/30 bg-[linear-gradient(135deg,rgba(171,159,242,0.22),rgba(57,255,20,0.08))] px-5 py-4 text-left text-white transition hover:-translate-y-0.5 hover:border-[#AB9FF2]/50 hover:shadow-[0_20px_40px_rgba(171,159,242,0.14)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-[#AB9FF2]">
                      <PhantomMark />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Continue with Phantom</p>
                      <p className="mt-1 text-xs text-white/60">Connect your wallet first, then finish your profile.</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.28em] text-white/40 transition group-hover:text-white/65">Wallet</span>
                  </div>
                </button>
              </div>
            )}

            {step === 'google-connect' && (
              <div className="mt-6 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#39FF14]">Next step</p>
                  <h3 className="mt-3 text-2xl font-light text-white">Connect your wallet</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    Your Google login is complete. Connect Phantom to unlock the feed and continue into Discover.
                  </p>
                </div>

                <button
                  onClick={handlePhantomConnect}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#39FF14] px-5 py-4 text-sm font-medium text-black transition hover:bg-[#35e812]"
                >
                  <PhantomMark />
                  Open Phantom
                </button>
              </div>
            )}

            {step === 'complete-profile' && (
              <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#AB9FF2]">Profile setup</p>
                  <h3 className="mt-3 text-2xl font-light text-white">Complete your profile</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    Add the name people will see, pick a profile picture, and we’ll generate your username automatically.
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-xl font-medium text-white">
                    {avatarPreview ? <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" /> : profileInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{name || 'Your profile preview'}</p>
                    <p className="mt-1 text-xs text-white/45">Joined {joinedLabel}</p>
                    <p className="mt-1 truncate text-xs text-[#AB9FF2]">@{username || slugifyName(name) || 'username'}</p>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Profile picture</span>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-xs text-white/50 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-medium file:text-black hover:file:bg-[#f2f2f2]"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setName(nextValue);
                      if (!profileTouched) {
                        setUsername(slugifyName(nextValue));
                      }
                    }}
                    placeholder="John Doe"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#AB9FF2]/70"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Username</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(event) => {
                      setProfileTouched(true);
                      setUsername(event.target.value.toLowerCase().replace(/\s+/g, ''));
                    }}
                    placeholder="johndoe"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#39FF14]/70"
                  />
                </label>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/55">
                  <span>Date joined</span>
                  <span className="text-white/85">{joinedLabel}</span>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-black transition hover:bg-[#ededed]"
                >
                  Complete profile and continue
                </button>
              </form>
            )}
          </div>

          <div className="relative p-6 md:p-8">
            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
              <p className="text-[10px] uppercase tracking-[0.45em] text-white/35">Status</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">Current flow</p>
                  <p className="mt-2 text-lg font-light text-white">
                    {entryFlow === 'google-return' ? 'Google login in progress' : 'Manual sign-in'}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">Wallet</p>
                  <p className="mt-2 text-sm text-white/80">{connected ? 'Connected' : 'Waiting for Phantom'}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">Session</p>
                  <p className="mt-2 text-sm text-white/80">{session?.user?.email ? session.user.email : 'No active Google session yet'}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">Theme note</p>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    The modal mirrors the app’s minimal neon-on-black language, with lime for the trend layer and lavender for Phantom.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
