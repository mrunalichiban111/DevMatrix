'use client';

import { useState } from 'react';
import Image from 'next/image';

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
  viralityScore?: number; // 0-100 score from ML service
};

interface NFTFeedCardProps {
  trend: TrendCard;
  onBet: (trend: TrendCard, side: 0 | 1) => void;
  userBet?: 0 | 1;
}

export default function NFTFeedCard({ trend, onBet, userBet }: NFTFeedCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [hasUpvoted, setHasUpvoted] = useState(userBet === 0);
  const [hasDownvoted, setHasDownvoted] = useState(userBet === 1);

  const totalBets = trend.totalUpBets + trend.totalDownBets;
  const upPercentage = totalBets > 0 ? (trend.totalUpBets / totalBets) * 100 : 50;
  const downPercentage = totalBets > 0 ? (trend.totalDownBets / totalBets) * 100 : 50;

  const handleUpBet = () => {
    onBet(trend, 0);
    setHasUpvoted(!hasUpvoted);
    if (hasDownvoted) setHasDownvoted(false);
  };

  const handleDownBet = () => {
    onBet(trend, 1);
    setHasDownvoted(!hasDownvoted);
    if (hasUpvoted) setHasUpvoted(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="border border-gray-700 bg-black text-white hover:bg-gray-950 transition cursor-pointer">
      {/* Header */}
      <div className="p-4 flex gap-3 border-b border-gray-700">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold hover:underline">{trend.name}</span>
            <span className="text-gray-500">@nfttrend</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatTime(trend.endTs)}</span>
          </div>
          <p className="text-gray-500 text-sm line-clamp-2">{trend.description}</p>
        </div>
      </div>

      {/* NFT Image */}
      <div className="relative w-full aspect-[16/10] bg-gray-900 overflow-hidden">
        {trend.image ? (
          <Image
            src={trend.image}
            alt={trend.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-gray-600">No image available</span>
          </div>
        )}
      </div>

      {/* Virality Score Badge */}
      {trend.viralityScore !== undefined && (
        <div className="px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">AI Virality Score</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-black bg-opacity-30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${trend.viralityScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white">{trend.viralityScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Betting Bars */}
      <div className="p-4 border-b border-gray-700">
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-green-500 font-semibold">🚀 Will Go Viral</span>
            <span className="text-gray-500">{upPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${upPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {trend.upBettors} {trend.upBettors === 1 ? 'person' : 'people'} betting up
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-red-500 font-semibold">📉 Will Flop</span>
            <span className="text-gray-500">{downPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-300"
              style={{ width: `${downPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {trend.downBettors} {trend.downBettors === 1 ? 'person' : 'people'} betting down
          </div>
        </div>

        {/* Total Bets */}
        <div className="text-xs text-gray-500 mt-3 text-center">
          Total Bets: {totalBets} | Prize: {(totalBets * 0.01).toFixed(2)} SOL
        </div>
      </div>

      {/* Status */}
      {trend.finalized && (
        <div className="px-4 py-2 bg-gray-900 border-b border-gray-700">
          <p className="text-sm">
            <span className="font-semibold">
              {trend.result === 0 ? '✅ VIRAL' : '❌ FLOPPED'}
            </span>
            <span className="text-gray-500 ml-2">Market closed</span>
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-3 flex justify-between text-gray-500 border-b border-gray-700 text-xs">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 hover:text-blue-500 transition group"
        >
          <span className="text-lg">💬</span>
          <span>{comments.length}</span>
        </button>

        <button
          onClick={handleUpBet}
          disabled={trend.finalized}
          className={`flex items-center gap-2 transition group ${
            hasUpvoted ? 'text-green-500' : 'hover:text-green-500'
          } ${trend.finalized ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-lg">🚀</span>
          <span>{trend.totalUpBets}</span>
        </button>

        <button
          onClick={handleDownBet}
          disabled={trend.finalized}
          className={`flex items-center gap-2 transition group ${
            hasDownvoted ? 'text-red-500' : 'hover:text-red-500'
          } ${trend.finalized ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-lg">📉</span>
          <span>{trend.totalDownBets}</span>
        </button>

        <button className="flex items-center gap-2 hover:text-blue-500 transition group">
          <span className="text-lg">🔗</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-700 p-4 bg-gray-950">
          {/* Comment Input */}
          <div className="flex gap-3 mb-4 pb-4 border-b border-gray-700">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <input
                type="text"
                placeholder="What do you think?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Reply
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">User</span>
                      <span className="text-gray-500">@user</span>
                    </div>
                    <p className="text-gray-200 mt-1">{comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
