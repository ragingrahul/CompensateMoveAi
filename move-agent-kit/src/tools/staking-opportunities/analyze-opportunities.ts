import type { AgentRuntime } from "../../agent";
import { StakingOpportunity, scrapeStakingOpportunities } from "./scrape-opportunities";

export interface AnalyzedStakingOpportunities {
  bestOverallOpportunity: StakingOpportunity | null;
  bestByAPY: StakingOpportunity | null;
  bestByRisk: StakingOpportunity | null;
  bestByLiquidity: StakingOpportunity | null;
  bestForSmallStakers: StakingOpportunity | null;
  allOpportunities: StakingOpportunity[];
  tavilyOpportunities: StakingOpportunity[];
  analysisTimestamp: Date;
  recommendationReason: string;
  dataSources: string[];
}

/**
 * Analyze staking opportunities and determine the best options based on different criteria
 * @param agent MoveAgentKit instance
 * @returns Analysis results with best opportunities
 */
export async function analyzeStakingOpportunities(agent: AgentRuntime): Promise<AnalyzedStakingOpportunities> {
  try {
    // Get all opportunities
    const allOpportunities = await scrapeStakingOpportunities(agent);
    
    // Track which data sources were used
    const dataSources = ["DefiLlama"];
    
    // Separate Tavily opportunities (if any)
    const tavilyOpportunities: StakingOpportunity[] = [];
    
    if (allOpportunities.length === 0) {
      return {
        bestOverallOpportunity: null,
        bestByAPY: null,
        bestByRisk: null,
        bestByLiquidity: null,
        bestForSmallStakers: null,
        allOpportunities: [],
        tavilyOpportunities: [],
        analysisTimestamp: new Date(),
        recommendationReason: "No staking opportunities found",
        dataSources: []
      };
    }
    
    // Sort by APY (highest first)
    const byAPY = [...allOpportunities].sort((a, b) => b.apy - a.apy);
    const bestByAPY = byAPY[0];
    
    // Sort by TVL (lowest first) as proxy for minimum stake
    const byTVL = [...allOpportunities].sort((a, b) => a.tvlUsd - b.tvlUsd);
    const bestForSmallStakers = byTVL[0];
    
    // Sort by risk level using our riskLevel property
    const byRisk = [...allOpportunities].sort((a, b) => {
      const riskScore = { low: 0, medium: 1, high: 2 };
      return riskScore[a.riskLevel || 'high'] - riskScore[b.riskLevel || 'high'];
    });
    const bestByRisk = byRisk[0];
    
    // Best by liquidity (simplified - we're assuming native APT pools are more liquid)
    const byLiquidity = [...allOpportunities].filter(o => o.isNativeApt === true);
    const bestByLiquidity = byLiquidity.length > 0 ? 
      byLiquidity.sort((a, b) => b.apy - a.apy)[0] : 
      allOpportunities[0];
    
    // Determine best overall opportunity using a scoring system
    const scoredOpportunities = allOpportunities.map(opportunity => {
      // Start with the APY as base score
      let score = opportunity.apy;
      
      // Better score for higher TVL (more secure)
      score += Math.min(10, opportunity.tvlUsd / 10000000); // Max 10 point bonus for TVL
      
      // Better score for native APT pools
      if (opportunity.isNativeApt) {
        score += 5;
      }
      
      // Better score for lower risk
      const riskBonus = { low: 10, medium: 5, high: 0 };
      score += riskBonus[opportunity.riskLevel || 'high'];
      
      return {
        opportunity,
        score
      };
    });
    
    const bestOverall = scoredOpportunities.sort((a, b) => b.score - a.score)[0].opportunity;
    
    // Generate recommendation reason
    let recommendationReason = `${bestOverall.project} (${bestOverall.symbol}) is recommended with ${bestOverall.apy.toFixed(2)}% APY`;
    
    recommendationReason += ` and $${(bestOverall.tvlUsd / 1000000).toFixed(2)}M TVL`;
    
    if (bestOverall.riskLevel) {
      recommendationReason += `. Risk level: ${bestOverall.riskLevel.toUpperCase()}`;
    }
    
    if (bestOverall.riskFactors && bestOverall.riskFactors.length > 0) {
      recommendationReason += `. Key factors: ${bestOverall.riskFactors[0]}`;
    }
    
    if (bestOverall.isNativeApt) {
      recommendationReason += `. This is a native APT staking pool.`;
    }
    
    // Add source information to recommendation
    recommendationReason += `. Data source: DefiLlama`;
    
    return {
      bestOverallOpportunity: bestOverall,
      bestByAPY,
      bestByRisk,
      bestByLiquidity,
      bestForSmallStakers,
      allOpportunities,
      tavilyOpportunities,
      analysisTimestamp: new Date(),
      recommendationReason,
      dataSources
    };
  } catch (error: any) {
    throw new Error(`Analyzing staking opportunities failed: ${error.message}`);
  }
} 