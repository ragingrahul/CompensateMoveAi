import axios from 'axios';
import type { AgentRuntime } from "../../agent";

export interface StakingOpportunity {
  provider: string;
  symbol: string;
  apy: number;
  apyBase?: number;
  apyReward?: number;
  tvlUsd: number;
  rewardTokens?: string[];
  pool: string;
  chain: string;
  project: string;
  url?: string;
  lastUpdated: Date;
  isNativeApt?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  riskFactors?: string[];
}

interface DefiLlamaPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase?: number;
  apyReward?: number;
  rewardTokens?: string[];
  pool: string;
  url?: string;
}

// Constants for risk assessment
const TVL_THRESHOLDS = {
  VERY_SAFE: 50000000, // $50M
  SAFE: 10000000,      // $10M
  MEDIUM: 1000000,     // $1M
};

const APY_THRESHOLDS = {
  SUSPICIOUS: 1000,    // 1000%
  HIGH: 100,          // 100%
  NORMAL: 20,         // 20%
};

/**
 * Get real-time staking opportunities from DefiLlama
 * @param agent MoveAgentKit instance
 * @returns List of available staking opportunities
 */
export async function scrapeStakingOpportunities(agent: AgentRuntime): Promise<StakingOpportunity[]> {
  try {
    // Fetch all yield pools from DefiLlama
    const response = await axios.get('https://yields.llama.fi/pools');
    const pools: DefiLlamaPool[] = response.data.data;

    // Filter for Aptos pools and ensure they have valid APY
    const aptosStakingPools = pools.filter(pool => 
      pool.chain.toLowerCase() === 'aptos' && 
      pool.apy > 0 &&
      pool.tvlUsd > 0 // Ensure there's actual TVL
    );

    // Convert and analyze pools
    const opportunities = aptosStakingPools.map(pool => {
      const isNativeApt = isNativeAptPool(pool);
      const riskAssessment = assessRisk(pool, isNativeApt);

      return {
        provider: pool.project,
        symbol: pool.symbol,
        apy: pool.apy,
        apyBase: pool.apyBase,
        apyReward: pool.apyReward,
        tvlUsd: pool.tvlUsd,
        rewardTokens: pool.rewardTokens,
        pool: pool.pool,
        chain: pool.chain,
        project: pool.project,
        url: pool.url || `https://defillama.com/protocol/${pool.project.toLowerCase()}`,
        lastUpdated: new Date(),
        isNativeApt,
        ...riskAssessment
      };
    });
    
    return opportunities;

  } catch (error) {
    console.error('Error fetching staking opportunities:', error);
    return [];
  }
}

/**
 * Check if a pool is for native APT staking
 */
function isNativeAptPool(pool: DefiLlamaPool): boolean {
  const symbol = pool.symbol.toLowerCase();
  return (
    symbol === 'apt' || 
    symbol.includes('apt-') || 
    symbol.includes('-apt') ||
    symbol.includes('stapt') ||
    symbol.includes('liquid-staked-apt')
  );
}

/**
 * Assess the risk level of a staking pool
 */
function assessRisk(pool: DefiLlamaPool, isNativeApt: boolean): { riskLevel: 'low' | 'medium' | 'high', riskFactors: string[] } {
  const riskFactors: string[] = [];

  // Check TVL
  if (pool.tvlUsd >= TVL_THRESHOLDS.VERY_SAFE) {
    riskFactors.push('Very high TVL indicates strong security');
  } else if (pool.tvlUsd >= TVL_THRESHOLDS.SAFE) {
    riskFactors.push('Good TVL level');
  } else if (pool.tvlUsd >= TVL_THRESHOLDS.MEDIUM) {
    riskFactors.push('Moderate TVL');
  } else {
    riskFactors.push('Low TVL - higher risk');
  }

  // Check APY reasonableness
  if (pool.apy > APY_THRESHOLDS.SUSPICIOUS) {
    riskFactors.push('Unusually high APY - exercise caution');
  } else if (pool.apy > APY_THRESHOLDS.HIGH) {
    riskFactors.push('High APY - verify sustainability');
  }

  // Assess native APT vs other pools
  if (isNativeApt) {
    riskFactors.push('Native APT staking pool');
  } else {
    riskFactors.push('Non-native pool - additional smart contract risk');
  }

  // Determine overall risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  
  if (
    pool.tvlUsd >= TVL_THRESHOLDS.SAFE &&
    pool.apy <= APY_THRESHOLDS.HIGH &&
    isNativeApt
  ) {
    riskLevel = 'low';
  } else if (
    pool.tvlUsd < TVL_THRESHOLDS.MEDIUM ||
    pool.apy > APY_THRESHOLDS.SUSPICIOUS ||
    (!isNativeApt && pool.apy > APY_THRESHOLDS.HIGH)
  ) {
    riskLevel = 'high';
  }

  return { riskLevel, riskFactors };
}

/**
 * Get recommended safe staking options for APT
 */
export function getSafeStakingRecommendations(opportunities: StakingOpportunity[]): string {
  // Filter for native APT pools
  const aptPools = opportunities.filter(opp => opp.isNativeApt);
  
  if (aptPools.length === 0) {
    return "No native APT staking pools found at the moment.";
  }

  // Sort pools by a safety score
  const scoredPools = aptPools.map(pool => ({
    ...pool,
    safetyScore: calculateSafetyScore(pool)
  })).sort((a, b) => b.safetyScore - a.safetyScore);

  // Get top 3 safest options
  const safestPools = scoredPools.slice(0, 3);

  return `Here are the safest APT staking opportunities:\n\n${
    safestPools.map(pool => formatSafeProviderInfo(pool)).join('\n\n')
  }\n\nNote: Always do your own research and verify the protocol's security before staking.`;
}

/**
 * Calculate a safety score for ranking pools
 */
function calculateSafetyScore(pool: StakingOpportunity): number {
  let score = 0;
  
  // TVL weight (0-50 points)
  score += Math.min(50, (pool.tvlUsd / TVL_THRESHOLDS.VERY_SAFE) * 50);
  
  // APY reasonableness (0-30 points)
  if (pool.apy <= APY_THRESHOLDS.NORMAL) {
    score += 30;
  } else if (pool.apy <= APY_THRESHOLDS.HIGH) {
    score += 15;
  }
  
  // Risk level bonus (0-20 points)
  if (pool.riskLevel === 'low') score += 20;
  else if (pool.riskLevel === 'medium') score += 10;
  
  return score;
}

/**
 * Format provider information with safety analysis
 */
function formatSafeProviderInfo(opp: StakingOpportunity & { safetyScore?: number }): string {
  const tvlFormatted = `$${(opp.tvlUsd / 1000000).toFixed(2)}M`;
  const rewardsInfo = opp.rewardTokens?.length 
    ? `\nReward tokens: ${opp.rewardTokens.join(', ')}`
    : '';
  const baseApy = opp.apyBase ? `\nBase APY: ${opp.apyBase.toFixed(2)}%` : '';
  const rewardApy = opp.apyReward ? `\nReward APY: ${opp.apyReward.toFixed(2)}%` : '';
  
  const riskInfo = `\nRisk Level: ${opp.riskLevel?.toUpperCase()}
Risk Factors:
${opp.riskFactors?.map(factor => `- ${factor}`).join('\n')}`;

  return `${opp.project} (${opp.symbol})
Total APY: ${opp.apy.toFixed(2)}%${baseApy}${rewardApy}
TVL: ${tvlFormatted}${rewardsInfo}
${riskInfo}
More info: ${opp.url}`;
}

/**
 * Helper function to get specific staking information
 */
export function getStakingInfo(opportunities: StakingOpportunity[], provider?: string): string {
  if (opportunities.length === 0) {
    return "No staking opportunities found for Aptos at the moment.";
  }

  // If provider is specified, filter for that provider with improved matching
  if (provider) {
    // Normalize the provider name for better matching
    const normalizedProvider = provider.toLowerCase().trim();
    
    // Try different matching strategies
    let providerOpps = opportunities.filter(opp => {
      const projectName = opp.project.toLowerCase();
      const symbolName = opp.symbol.toLowerCase();
      
      // Direct name match
      if (projectName === normalizedProvider || 
          projectName.includes(normalizedProvider) ||
          normalizedProvider.includes(projectName)) {
        return true;
      }
      
      // Match protocol names with hyphens or underscores
      const normalizedProject = projectName.replace(/[-_]/g, '');
      const normalizedQuery = normalizedProvider.replace(/[-_]/g, '');
      if (normalizedProject === normalizedQuery || 
          normalizedProject.includes(normalizedQuery)) {
        return true;
      }
      
      // Check symbol names too (some protocols are known by their token symbols)
      if (symbolName.includes(normalizedProvider) || 
          symbolName.includes('apt') && normalizedProvider.includes('apt')) {
        return true;
      }
      
      return false;
    });
    
    // If no matches, try a more lenient approach with partial matching
    if (providerOpps.length === 0) {
      providerOpps = opportunities.filter(opp => {
        const words = normalizedProvider.split(/\s+/);
        // Match if any word in the query matches part of the project name
        return words.some(word => 
          word.length > 2 && opp.project.toLowerCase().includes(word)
        );
      });
    }
    
    if (providerOpps.length === 0) {
      return `No staking opportunities found for provider: ${provider}. Try checking with a different name or view all opportunities.`;
    }

    const opp = providerOpps[0];
    return formatSafeProviderInfo(opp);
  }

  // For general queries, return safe recommendations
  return getSafeStakingRecommendations(opportunities);
} 