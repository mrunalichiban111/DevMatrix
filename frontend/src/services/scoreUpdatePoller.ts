/**
 * Score Update Poller Service
 * 
 * Continuously polls the ML service for updated virality scores for active markets.
 * This enables real-time score updates as trends evolve.
 */

import { calculateViralityScore } from './viralityScore';

export interface MarketWithScore {
  nftMint: string;
  name: string;
  description: string;
  viralityScore: number;
  lastUpdated: number;
  finalized: boolean;
}

// Store for polling state
let activePollers: Map<string, NodeJS.Timeout> = new Map();
let scoreCache: Map<string, { score: number; timestamp: number }> = new Map();

// Callbacks for score updates
let onScoreUpdateCallbacks: Map<string, (score: number) => void> = new Map();
let onScoreErrorCallbacks: Map<string, (error: Error) => void> = new Map();

/**
 * Start polling for virality score updates for a specific market
 * @param nftMint - The NFT mint address (unique identifier for the market)
 * @param name - The trend name
 * @param description - The trend description
 * @param intervalSeconds - How often to poll (default: 60 seconds)
 * @param onScoreUpdate - Callback when score updates
 * @param onError - Callback when polling encounters an error
 */
export function startScorePolling(
  nftMint: string,
  name: string,
  description: string,
  intervalSeconds: number = 60,
  onScoreUpdate?: (score: number) => void,
  onError?: (error: Error) => void
): void {
  // Prevent duplicate polling
  if (activePollers.has(nftMint)) {
    console.warn(`Polling already active for market: ${nftMint}`);
    return;
  }

  // Register callbacks
  if (onScoreUpdate) {
    onScoreUpdateCallbacks.set(nftMint, onScoreUpdate);
  }
  if (onError) {
    onScoreErrorCallbacks.set(nftMint, onError);
  }

  console.log(`[ScorePoller] Starting polling for ${name} (${nftMint})`);

  // Immediately fetch initial score
  const fetchScore = async () => {
    try {
      const response = await calculateViralityScore(name, description);
      const score = response.metrics.final_virality_score_100;

      // Update cache
      scoreCache.set(nftMint, {
        score,
        timestamp: Date.now(),
      });

      // Trigger callback
      const callback = onScoreUpdateCallbacks.get(nftMint);
      if (callback) {
        callback(score);
      }

      console.log(`[ScorePoller] Updated score for ${name}: ${score.toFixed(2)}/100`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[ScorePoller] Error fetching score for ${name}:`, err);

      // Trigger error callback
      const errorCallback = onScoreErrorCallbacks.get(nftMint);
      if (errorCallback) {
        errorCallback(err);
      }
    }
  };

  // Fetch immediately
  fetchScore();

  // Set up interval for continuous polling
  const intervalId = setInterval(fetchScore, intervalSeconds * 1000);
  activePollers.set(nftMint, intervalId);
}

/**
 * Stop polling for a specific market
 * @param nftMint - The NFT mint address
 */
export function stopScorePolling(nftMint: string): void {
  const intervalId = activePollers.get(nftMint);
  if (intervalId) {
    clearInterval(intervalId);
    activePollers.delete(nftMint);
    onScoreUpdateCallbacks.delete(nftMint);
    onScoreErrorCallbacks.delete(nftMint);
    console.log(`[ScorePoller] Stopped polling for ${nftMint}`);
  }
}

/**
 * Stop all active polling
 */
export function stopAllScorePolling(): void {
  activePollers.forEach((intervalId) => clearInterval(intervalId));
  activePollers.clear();
  onScoreUpdateCallbacks.clear();
  onScoreErrorCallbacks.clear();
  console.log('[ScorePoller] Stopped all polling');
}

/**
 * Get cached virality score (if available)
 * @param nftMint - The NFT mint address
 * @returns The cached score and timestamp, or undefined if not cached
 */
export function getCachedScore(
  nftMint: string
): { score: number; timestamp: number } | undefined {
  return scoreCache.get(nftMint);
}

/**
 * Clear the score cache
 */
export function clearScoreCache(): void {
  scoreCache.clear();
  console.log('[ScorePoller] Cleared score cache');
}

/**
 * Get the number of active pollers
 */
export function getActivePollerCount(): number {
  return activePollers.size;
}

/**
 * Get all active market mints being polled
 */
export function getActiveMarkets(): string[] {
  return Array.from(activePollers.keys());
}
