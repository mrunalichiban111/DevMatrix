'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { fetchAllMarkets } from '@/services/fetchMarket';
import { fetchNFTMetadata } from '@/services/fetchNFTMetadata';
import type { FishTrend } from '@/types/fish';

type FishComment = {
  id: string;
  mint: string;
  author: string;
  content: string;
  createdAt: string;
};

function formatRelativeTime(isoDate: string) {
  const created = new Date(isoDate).getTime();
  const now = Date.now();
  const seconds = Math.max(1, Math.floor((now - created) / 1000));

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FishDetailPage() {
  const params = useParams<{ mint: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [fish, setFish] = useState<FishTrend | null>(null);
  const [loading, setLoading] = useState(true);

  const [commentsLoading, setCommentsLoading] = useState(true);
  const [comments, setComments] = useState<FishComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const mint = params?.mint || '';
  const commenterName = (session?.user?.name || 'anon').trim().slice(0, 40) || 'anon';

  useEffect(() => {
    if (!mint) return;
    void loadFish(mint);
    void loadComments(mint);
  }, [mint]);

  const loadFish = async (mintAddress: string) => {
    try {
      const markets = await fetchAllMarkets();
      const market = markets.find((item: { nftMint: string }) => item.nftMint === mintAddress);

      if (!market) {
        setFish(null);
        return;
      }

      const meta = await fetchNFTMetadata(market.nftMint);
      setFish({
        ...market,
        ...meta,
        commentCount: comments.length,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (mintAddress: string) => {
    try {
      setCommentsLoading(true);
      setCommentError(null);
      const response = await fetch(`/api/comments/${mintAddress}`, { cache: 'no-store' });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Failed to load comments.');
      }

      const payload = (await response.json()) as { comments: FishComment[] };
      setComments(payload.comments || []);
    } catch (error: any) {
      setCommentError(error?.message || 'Could not load comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = async () => {
    const content = newComment.trim();
    if (!content || !mint) return;

    try {
      setSubmittingComment(true);
      setCommentError(null);

      const response = await fetch(`/api/comments/${mint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: commenterName,
          content,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Failed to post comment.');
      }

      const payload = (await response.json()) as { comment: FishComment };
      setComments((prev) => [payload.comment, ...prev]);
      setNewComment('');
      setFish((prev) => (prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev));
    } catch (error: any) {
      setCommentError(error?.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="w-full py-10 text-white/70">Loading fish...</div>;
  }

  if (!fish) {
    return (
      <div className="mx-auto w-full max-w-3xl py-10">
        <button
          type="button"
          onClick={() => router.push('/discover')}
          className="mb-6 rounded-full bg-white/[0.06] px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/70 shadow-[0_10px_24px_rgba(0,0,0,0.38)]"
        >
          Back
        </button>
        <div className="rounded-[24px] bg-white/[0.04] p-8 text-white/50 shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
          Fish not found.
        </div>
      </div>
    );
  }

  const mediaUrl = fish.mediaUrl || fish.image;
  const isVideo = !!mediaUrl && /\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl);

  return (
    <div className="relative mx-auto w-full max-w-5xl animate-fade-in py-4 md:py-8">
      <div className="pointer-events-none absolute -left-10 top-10 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(57,255,20,0.16)_0%,_rgba(0,0,0,0)_72%)] blur-2xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(8,148,255,0.14)_0%,_rgba(0,0,0,0)_72%)] blur-3xl" />

      <button
        type="button"
        onClick={() => router.push('/discover')}
        className="relative z-10 mb-6 rounded-full bg-white/[0.08] px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/72 shadow-[0_12px_28px_rgba(0,0,0,0.4)] transition hover:bg-white/[0.16] hover:text-white"
      >
        Back to feed
      </button>

      <article className="relative z-10 overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] shadow-[0_28px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl">
        {mediaUrl ? (
          <div className="bg-black/25">
            {isVideo ? (
              <video src={mediaUrl} className="h-[420px] w-full object-cover" controls playsInline />
            ) : (
              <img src={mediaUrl} alt={fish.name} className="h-[420px] w-full object-cover" />
            )}
          </div>
        ) : null}

        <div className="p-6 md:p-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/38">Fish Detail</p>
          <h1 className="mt-3 text-sm font-light tracking-tight text-white md:text-3xl">{fish.name}</h1>
          <p className="mt-4 max-w-3xl  leading-7 text-white/75 md:text-5xl text-3xl">{fish.description}</p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-black/28 p-4 text-sm text-white/65 shadow-[0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="block text-[10px] uppercase tracking-[0.24em] text-white/30">Up</span>
              <span className="mt-2 block text-xl text-white">{fish.upBettors}</span>
            </div>
            <div className="rounded-2xl bg-black/28 p-4 text-sm text-white/65 shadow-[0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="block text-[10px] uppercase tracking-[0.24em] text-white/30">Down</span>
              <span className="mt-2 block text-xl text-white">{fish.downBettors}</span>
            </div>
            <div className="rounded-2xl bg-black/28 p-4 text-sm text-white/65 shadow-[0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="block text-[10px] uppercase tracking-[0.24em] text-white/30">Comments</span>
              <span className="mt-2 block text-xl text-white">{comments.length}</span>
            </div>
          </div>

          <section className="mt-8 rounded-2xl bg-black/25 p-5 shadow-[0_18px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/38">Discussion</p>
                <h2 className="mt-1 text-xl text-white">Comments</h2>
              </div>
              <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/65">
                {comments.length} total
              </span>
            </div>

            <div className="mb-4 space-y-3">
              <div className="rounded-xl bg-white/[0.07] px-3 py-2 text-sm text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                Posting as <span className="font-medium text-white">{commenterName}</span>
              </div>

              <textarea
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                className="h-28 w-full resize-none rounded-xl bg-white/[0.07] px-3 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] outline-none transition placeholder:text-white/28 focus:bg-white/[0.12]"
                placeholder="Write your take like a Reddit reply..."
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-white/42">Max 500 characters</p>
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="rounded-full bg-[#39FF14] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[0_10px_22px_rgba(0,0,0,0.35)] transition hover:bg-[#35e812] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>

              {commentError && <p className="text-xs text-red-300">{commentError}</p>}
            </div>

            <div className="space-y-3">
              {commentsLoading ? (
                <div className="rounded-xl bg-white/[0.05] px-4 py-4 text-sm text-white/55">
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-xl bg-white/[0.05] px-4 py-4 text-sm text-white/55">
                  No comments yet. Start the thread.
                </div>
              ) : (
                comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="rounded-xl bg-white/[0.05] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.07)]"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-white/45">
                      <span className="text-white/80">{comment.author}</span>
                      <span>{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm leading-7 text-white/80">{comment.content}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
