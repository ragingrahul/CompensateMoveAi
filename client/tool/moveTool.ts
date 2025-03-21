import { Tool } from "langchain/tools";
import { AgentRuntime, parseJson } from "move-agent-kit";

// Define the Pool interface
interface Pool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number;
  apyReward: number | null;
  apy: number;
  rewardTokens: string[] | null;
  pool: string;
  apyPct1D: number;
  apyPct7D: number;
  apyPct30D: number;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  predictions: object;
  poolMeta: string;
  mu: number;
  sigma: number;
  count: number;
  outlier: boolean;
  underlyingTokens: string[];
  il7d: number | null;
  apyBase7d: number | null;
  apyMean30d: number;
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;
  apyBaseInception: number | null;
}

export class YieldMaxTool extends Tool {
  name = "yieldMax_tool";
  description = `Get the best yield data for a specified protocol.
    
    Inputs ( input is a JSON string ):
    protocol: string, eg "Aries" (required)
    `;

  constructor(private agent: AgentRuntime) {
    super();
  }

  async _call(args: string): Promise<string> {
    let parsedInput;
    let projectName: string;

    try {
      parsedInput = parseJson(args);
      projectName = parsedInput.projectName || parsedInput.protocol || "";
      const minApy = parsedInput.minApy || 3;
      const limit = parsedInput.limit || 3;

      console.log("Fetching best pools with params:", {
        projectName,
        minApy,
        limit,
      });
      const yieldsEndpoint = "https://yields.llama.fi/pools";

      // Fetch all yields data
      const yieldsResponse = await fetch(yieldsEndpoint);

      if (!yieldsResponse.ok) {
        throw new Error(
          `Failed to fetch yields data: ${yieldsResponse.statusText}`
        );
      }

      const yieldsData = await yieldsResponse.json();
      // Filter for pools with decent APY on Aptos chain
      const eligiblePools = yieldsData.data.filter(
        (pool: Pool) =>
          (pool.project.toLowerCase() === projectName.toLowerCase() ||
            pool.project.toLowerCase().includes(projectName.toLowerCase())) &&
          pool.chain === "Aptos"
        // pool.apy >= minApy &&
        // pool.tvlUsd > 100000
      );
      //console.log("Eligible pools:", eligiblePools);

      // If no exact match found, try pa

      // Sort pools based on a combined score of safety and APY
      eligiblePools.sort((a: Pool, b: Pool) => {
        // Risk score based on ilRisk
        const riskScore: Record<string, number> = {
          no: 5,
          low: 4,
          medium: 3,
          high: 1,
          IL: 0,
        };

        // Get risk scores (default to lowest if not defined)
        const riskScoreA = riskScore[a.ilRisk?.toLowerCase()] || 0;
        const riskScoreB = riskScore[b.ilRisk?.toLowerCase()] || 0;

        // TVL factor (normalized between 0-1 with log scale to avoid extreme biases)
        const maxTvl = Math.max(...eligiblePools.map((p: Pool) => p.tvlUsd));
        const tvlFactorA = Math.log(a.tvlUsd + 1) / Math.log(maxTvl + 1);
        const tvlFactorB = Math.log(b.tvlUsd + 1) / Math.log(maxTvl + 1);

        // APY factor (normalized)
        const maxApy = Math.max(...eligiblePools.map((p: Pool) => p.apy));
        const apyFactorA = a.apy / maxApy;
        const apyFactorB = b.apy / maxApy;

        // Combined score: 50% risk, 30% TVL, 20% APY
        const scoreA = riskScoreA * 0.5 + tvlFactorA * 0.3 + apyFactorA * 0.2;
        const scoreB = riskScoreB * 0.5 + tvlFactorB * 0.3 + apyFactorB * 0.2;

        return scoreB - scoreA; // Higher score first
      });

      // Take the top pools based on limit
      const bestPools = eligiblePools.slice(0, limit);

      // Format the response with the best pools
      const formattedResponse = {
        totalPoolsFound: eligiblePools.length,
        projectName: projectName || "All projects",
        bestPools: bestPools.map((pool: Pool) => ({
          project: pool.project,
          symbol: pool.symbol,
          tvlUsd: Math.round(pool.tvlUsd), // Round TVL to avoid decimals
          apy: Math.round(pool.apy * 100) / 100, // Round to 2 decimal places
          ilRisk: pool.ilRisk || "N/A",
          poolMeta: pool.poolMeta || "",
        })),
        explanation:
          "These pools represent the best balance between safety (determined by TVL and risk level) and yield (APY)",
      };

      return JSON.stringify(formattedResponse);
    } catch (error) {
      console.error("Best pools tool error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return JSON.stringify({
        status: "error",
        message: errorMessage,
        code: "QUERY_ERROR",
      });
    }
  }
}

// export class BestPoolsTool extends Tool {
//   name = "best_pools_tool";
//   description = `Get the best and safest pools with decent APY

//     Inputs ( input is a JSON string ):
//     protocol: string, eg "Aries" (optional)
//     minApy: number, minimum APY to consider (optional, default: 3)
//     limit: number, maximum number of pools to return (optional, default: 3)
//     `;

//   constructor(private agent: AgentRuntime) {
//     super();
//   }

//   async _call(args: string): Promise<string> {
//     let parsedInput;
//     let projectName: string;

//     try {
//       console.log("BestPoolsTool received args:", args);
//       parsedInput = parseJson(args);
//       console.log("BestPoolsTool parsed input:", parsedInput);

//       projectName = parsedInput.projectName || parsedInput.protocol || "";
//       const minApy = parsedInput.minApy || 3;
//       const limit = parsedInput.limit || 3;

//       console.log("Fetching best pools with params:", {
//         projectName,
//         minApy,
//         limit,
//       });
//       const yieldsEndpoint = "https://yields.llama.fi/pools";

//       // Fetch all yields data
//       const yieldsResponse = await fetch(yieldsEndpoint);

//       if (!yieldsResponse.ok) {
//         throw new Error(
//           `Failed to fetch yields data: ${yieldsResponse.statusText}`
//         );
//       }

//       const yieldsData = await yieldsResponse.json();

//       // Filter for pools with decent APY on Aptos chain
//       let eligiblePools = yieldsData.data.filter(
//         (pool: Pool) =>
//           pool.chain === "Aptos" && pool.apy >= minApy && pool.tvlUsd > 100000 // Minimum TVL for safety
//       );

//       // Further filter by project name if provided
//       if (projectName) {
//         const projectPools = eligiblePools.filter(
//           (pool: Pool) =>
//             pool.project.toLowerCase() === projectName.toLowerCase() ||
//             pool.project.toLowerCase().includes(projectName.toLowerCase())
//         );

//         // If pools found for the project, use them, otherwise keep all eligible pools
//         if (projectPools.length > 0) {
//           eligiblePools = projectPools;
//         } else {
//           // Check if project exists on other chains
//           const otherChainPools = yieldsData.data.filter(
//             (pool: Pool) =>
//               pool.project.toLowerCase() === projectName.toLowerCase() ||
//               pool.project.toLowerCase().includes(projectName.toLowerCase())
//           );

//           if (otherChainPools.length > 0) {
//             const availableChains = [
//               ...new Set(otherChainPools.map((pool: Pool) => pool.chain)),
//             ];
//             return JSON.stringify({
//               error: `Project ${projectName} was not found on Aptos blockchain with minimum APY of ${minApy}%.`,
//               message: `Project is available on other chains: ${availableChains.join(
//                 ", "
//               )}`,
//               availableChains,
//             });
//           }

//           return JSON.stringify({
//             error: `Project ${projectName} not found in DeFiLlama yields data with minimum APY of ${minApy}%.`,
//             suggestion:
//               "Try without specifying a project name to see all available pools.",
//           });
//         }
//       }

//       // Sort pools based on a combined score of safety and APY
//       eligiblePools.sort((a: Pool, b: Pool) => {
//         // Risk score based on ilRisk
//         const riskScore: Record<string, number> = {
//           no: 5,
//           low: 4,
//           medium: 3,
//           high: 1,
//           IL: 0,
//         };

//         // Get risk scores (default to lowest if not defined)
//         const riskScoreA = riskScore[a.ilRisk?.toLowerCase()] || 0;
//         const riskScoreB = riskScore[b.ilRisk?.toLowerCase()] || 0;

//         // TVL factor (normalized between 0-1 with log scale to avoid extreme biases)
//         const maxTvl = Math.max(...eligiblePools.map((p: Pool) => p.tvlUsd));
//         const tvlFactorA = Math.log(a.tvlUsd + 1) / Math.log(maxTvl + 1);
//         const tvlFactorB = Math.log(b.tvlUsd + 1) / Math.log(maxTvl + 1);

//         // APY factor (normalized)
//         const maxApy = Math.max(...eligiblePools.map((p: Pool) => p.apy));
//         const apyFactorA = a.apy / maxApy;
//         const apyFactorB = b.apy / maxApy;

//         // Combined score: 50% risk, 30% TVL, 20% APY
//         const scoreA = riskScoreA * 0.5 + tvlFactorA * 0.3 + apyFactorA * 0.2;
//         const scoreB = riskScoreB * 0.5 + tvlFactorB * 0.3 + apyFactorB * 0.2;

//         return scoreB - scoreA; // Higher score first
//       });

//       // Take the top pools based on limit
//       const bestPools = eligiblePools.slice(0, limit);

//       // Format the response with the best pools
//       const formattedResponse = {
//         totalPoolsFound: eligiblePools.length,
//         projectName: projectName || "All projects",
//         bestPools: bestPools.map((pool: Pool) => ({
//           project: pool.project,
//           pool: pool.pool,
//           symbol: pool.symbol,
//           tvlUsd: pool.tvlUsd,
//           apy: pool.apy,
//           apyBase: pool.apyBase,
//           apyReward: pool.apyReward,
//           ilRisk: pool.ilRisk,
//           exposure: pool.exposure,
//           poolMeta: pool.poolMeta,
//           url: pool.url,
//         })),
//         explanation:
//           "These pools represent the best balance between safety (determined by TVL and risk level) and yield (APY)",
//       };

//       return JSON.stringify(formattedResponse);
//     } catch (error) {
//       console.error("Best pools tool error:", error);
//       const errorMessage =
//         error instanceof Error ? error.message : "Unknown error occurred";
//       return JSON.stringify({
//         status: "error",
//         message: errorMessage,
//         code: "QUERY_ERROR",
//       });
//     }
//   }
// }
