export type FishTrend = {
  publicKey: string;
  nftMint: string;
  name: string;
  description: string;
  image: string | null;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
  totalUpBets: number;
  totalDownBets: number;
  upBettors: number;
  downBettors: number;
  endTs: number;
  finalized: boolean;
  result: number;
  viralityScore?: number;
  commentCount?: number;
};
