import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { StakingOpportunity } from "../../tools/staking-opportunities/scrape-opportunities"

export class StakingOpportunitiesFinderTool extends Tool {
	name = "staking_opportunities_finder"
	description = `This tool can be used to find the best Aptos staking opportunities from various sources.
	It scrapes real-time data from multiple staking providers and uses Tavily AI search to find the latest information.
	It analyzes this data and returns the best options based on different criteria.
	
	Inputs (no input required, but you can optionally provide a JSON with filters):
	filters: {
		minApy: number // minimum APY to consider
		maxRisk: string // max risk level to consider (low, medium, high)
		minStake: number // minimum stake amount you have available
		tavilyOnly: boolean // set to true to only use Tavily AI search results
	}
	
	Returns information about:
	- Best overall opportunity
	- Best opportunity by APY
	- Best opportunity by risk level
	- Best opportunity by liquidity (no lockup)
	- Best opportunity for small stakers (low minimum)
	- Sources used for data collection (web scraping and/or Tavily AI search)
	
	This tool is optimized to work with OpenAI models like GPT-4o.
	`

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string = "{}"): Promise<string> {
		try {
			// Parse any potential filters
			const parsedInput = input ? parseJson(input) : {};
			const filters = parsedInput.filters || {};
			
			// Get the analyzed opportunities
			const results = await this.agent.analyzeStakingOpportunities();
			
			// Check if we should only use Tavily data
			if (filters.tavilyOnly && results.tavilyOpportunities.length > 0) {
				const tavilyOpps = results.tavilyOpportunities;
				
				// Recalculate best options using only Tavily data
				const bestByAPY = [...tavilyOpps].sort((a, b) => b.apy - a.apy)[0];
				const bestForSmallStakers = [...tavilyOpps].sort((a, b) => a.tvlUsd - b.tvlUsd)[0];
				
				return JSON.stringify({
					status: "success",
					message: `Found ${tavilyOpps.length} staking opportunities from Tavily AI search.`,
					recommendation: `Based on Tavily data, ${bestByAPY.symbol} from ${bestByAPY.provider} is recommended with ${bestByAPY.apy}% APY.`,
					bestByAPY,
					bestForSmallStakers,
					allOpportunities: tavilyOpps,
					dataSources: ["Tavily AI Search"],
					analysisTimestamp: results.analysisTimestamp
				});
			}
			
			// Apply any filters if provided
			let filteredOpportunities = results.allOpportunities;
			
			if (filters.minApy) {
				filteredOpportunities = filteredOpportunities.filter((o: StakingOpportunity) => o.apy >= filters.minApy);
			}
			
			if (filters.minStake) {
				filteredOpportunities = filteredOpportunities.filter((o: StakingOpportunity) => o.tvlUsd >= filters.minStake * 1000);
			}
			
			// If we have filters and filtered results, recalculate the best options
			if ((filters.minApy || filters.minStake) && filteredOpportunities.length > 0) {
				// Recalculate best by APY
				const bestByAPY = [...filteredOpportunities].sort((a, b) => b.apy - a.apy)[0];
				
				// Best for small stakers
				const bestForSmallStakers = [...filteredOpportunities].sort((a, b) => a.tvlUsd - b.tvlUsd)[0];
				
				// Adjust the response
				return JSON.stringify({
					status: "success",
					message: `Found ${filteredOpportunities.length} staking opportunities matching your filters.`,
					recommendation: filteredOpportunities.length > 0 ? 
					  `${bestByAPY.symbol} from ${bestByAPY.provider} is recommended with ${bestByAPY.apy}% APY` : 
					  "No opportunities match your filters",
					bestByAPY: bestByAPY || null,
					bestForSmallStakers: bestForSmallStakers || null,
					allMatchingOpportunities: filteredOpportunities,
					dataSources: results.dataSources,
					analysisTimestamp: results.analysisTimestamp
				});
			}
			
			// Default return with all analyzed data
			return JSON.stringify({
				status: "success",
				message: `Found ${results.allOpportunities.length} staking opportunities from ${results.dataSources.join(", ")}.`,
				recommendation: results.recommendationReason,
				bestOverallOpportunity: results.bestOverallOpportunity,
				bestByAPY: results.bestByAPY,
				bestByRisk: results.bestByRisk,
				bestByLiquidity: results.bestByLiquidity,
				bestForSmallStakers: results.bestForSmallStakers,
				tavilyOpportunitiesCount: results.tavilyOpportunities.length,
				dataSources: results.dataSources,
				analysisTimestamp: results.analysisTimestamp
			});
		} catch (error: any) {
			return JSON.stringify({
				status: "error",
				message: error.message,
				code: error.code || "UNKNOWN_ERROR",
			});
		}
	}
} 