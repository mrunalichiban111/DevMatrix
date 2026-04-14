// services/viralityScore.ts
// This service calls the ML backend to calculate virality scores for trends

export interface ViralityResponse {
  search_title: string;
  metrics: {
    relevant_posts: number;
    raw_virality_power: number;
    final_virality_score_100: number;
  };
}

export interface ViralityError {
  error: string;
}

/**
 * Calculate virality score from the ML service
 * @param title - The trend title to search for
 * @param description - The trend description to analyze
 * @returns The virality score (0-100) or throws an error
 */
export async function calculateViralityScore(
  title: string,
  description: string
): Promise<ViralityResponse> {
  try {
    // Using localhost for development - change to your ML service URL in production
    const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8000";

    const response = await fetch(`${ML_SERVICE_URL}/api/virality`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ViralityError;
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    const data = (await response.json()) as ViralityResponse;

    // Validate response structure
    if (
      !data.metrics ||
      typeof data.metrics.final_virality_score_100 !== "number"
    ) {
      throw new Error("Invalid response format from ML service");
    }

    return data;
  } catch (error) {
    console.error("Error calculating virality score:", error);
    throw error;
  }
}
