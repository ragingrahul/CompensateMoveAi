import { AptosConfig, Network, Ed25519PrivateKey, PrivateKey, PrivateKeyVariants, Aptos } from '@aptos-labs/ts-sdk';
import { AgentRuntime, LocalSigner } from '../../src';
import { scrapeStakingOpportunities, getStakingInfo, getSafeStakingRecommendations } from '../../src/tools/staking-opportunities';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  console.log('Setting up Aptos agent with staking opportunities finder...');
  
  if (!process.env.APTOS_PRIVATE_KEY) {
    throw new Error('APTOS_PRIVATE_KEY environment variable is not set');
  }

  // Setup the Aptos configuration
  const aptosConfig = new AptosConfig({
    network: Network.TESTNET,
  });

  const aptos = new Aptos(aptosConfig);

  // Create an account from the private key
  const account = await aptos.deriveAccountFromPrivateKey({
    privateKey: new Ed25519PrivateKey(
      PrivateKey.formatPrivateKey(
        process.env.APTOS_PRIVATE_KEY!,
        PrivateKeyVariants.Ed25519,
      ),
    ),
  });

  // Setup the agent with a signer
  const signer = new LocalSigner(account, Network.TESTNET);
  const agent = new AgentRuntime(signer, aptos, {});

  try {
    // Fetch real-time staking data
    console.log('\nFetching real-time staking opportunities...');
    const opportunities = await scrapeStakingOpportunities(agent);

    if (opportunities.length === 0) {
      console.log('No staking opportunities found.');
      return;
    }

    // Example queries and their responses
    const queries = [
      'What is the APY for LiquidSwap protocol?',
      // 'Tell me about Amnis Finance staking',
      // 'Tortuga staking APY',
      // 'Show me low-risk staking opportunities',
      // 'Which native APT staking provider has the highest TVL?'
      //'What is the APY for staking APT in Echelon Protocol?'
    ];

    console.log('\nAnalyzing staking opportunities for safety and risk:\n');

    for (const query of queries) {
      console.log(`Q: ${query}`);
      console.log('A:', handleStakingQuery(query, opportunities));
      console.log();
    }

    // Interactive query testing (uncomment to test a specific query)
    // const customQuery = 'What is the APY for Thala?';
    // console.log(`\nCustom Query: ${customQuery}`);
    // console.log('Answer:', handleStakingQuery(customQuery, opportunities));
    // console.log();

    // Display summary
    console.log('\nSummary of Analysis:');
    console.log('- Data Source: DefiLlama');
    console.log('- Last Updated:', new Date().toLocaleString());
    console.log('- Risk Factors Considered:');
    console.log('  * Total Value Locked (TVL)');
    console.log('  * APY Sustainability');
    console.log('  * Native vs Non-native Pools');
    console.log('  * Smart Contract Risk');
    console.log('\nNote: Always conduct your own research and verify protocol security before staking.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Handle different types of staking queries with safety analysis
 */
function handleStakingQuery(query: string, opportunities: any[]): string {
  query = query.toLowerCase().trim();

  // Extract protocol/provider name using multiple patterns
  let protocolName: string | null = null;
  
  // Pattern 1: "what is the apy for X protocol"
  const pattern1 = /(?:apy|staking|yield|rewards?|interest|returns?|rate)\s+(?:for|from|in|at|on|of)\s+(?:the\s+)?([a-z0-9\s-_]+?)(?:\s+protocol|\s+pool|\s+staking|\s+opportunities?|\s+provider|\s+platform)?(?:\s+is|\?|$)/i;
  const match1 = query.match(pattern1);
  
  // Pattern 2: "X protocol apy"
  const pattern2 = /([a-z0-9\s-_]+?)(?:\s+protocol|\s+pool|\s+staking|\s+platform)?\s+(?:apy|staking|yield|rewards?|returns?|rate)/i;
  const match2 = query.match(pattern2);
  
  // Pattern 3: "tell me about X" or "info on X"
  const pattern3 = /(?:tell|show|give|provide)(?:\s+me)?\s+(?:about|on|info|information|details)\s+(?:the\s+)?([a-z0-9\s-_]+?)(?:\s+protocol|\s+pool|\s+staking|\s+platform)?(?:\s+is|\?|$)/i;
  const match3 = query.match(pattern3);

  if (match1) protocolName = match1[1].trim();
  else if (match2) protocolName = match2[1].trim();
  else if (match3) protocolName = match3[1].trim();
  
  // When we have a protocol name, get specific info
  if (protocolName) {
    // Skip common words that aren't protocol names
    const commonWords = ['best', 'top', 'highest', 'lowest', 'safest', 'aptos', 'good', 'better', 'best'];
    if (commonWords.includes(protocolName) || protocolName.length <= 2) {
      // Don't treat these as protocol names
    } else {
      console.log(`Found protocol name: ${protocolName}`);
      return getStakingInfo(opportunities, protocolName);
    }
  }
  
  // Safety-focused queries
  if (query.includes('safe') || query.includes('low-risk') || query.includes('risk level')) {
    return getSafeStakingRecommendations(opportunities);
  }
  
  // Native APT queries
  if (query.includes('native apt') && query.includes('highest tvl')) {
    const nativeAptPools = opportunities.filter(opp => opp.isNativeApt)
      .sort((a, b) => b.tvlUsd - a.tvlUsd);
    
    if (nativeAptPools.length > 0) {
      return getStakingInfo(opportunities, nativeAptPools[0].provider);
    }
    return "No native APT staking pools found.";
  }

  // Compare risk levels
  if (query.includes('compare') && query.includes('risk')) {
    const sortedByRisk = [...opportunities].sort((a, b) => {
      const riskScore = { low: 0, medium: 1, high: 2 };
      return riskScore[a.riskLevel || 'high'] - riskScore[b.riskLevel || 'high'];
    });

    return `Risk Level Comparison:\n\n${
      sortedByRisk.slice(0, 5).map(opp => 
        `${opp.project} (${opp.symbol})\n` +
        `Risk Level: ${opp.riskLevel?.toUpperCase()}\n` +
        `TVL: $${(opp.tvlUsd / 1000000).toFixed(2)}M\n` +
        `APY: ${opp.apy.toFixed(2)}%\n`
      ).join('\n')
    }`;
  }

  // Default to safe recommendations
  return getSafeStakingRecommendations(opportunities);
}

main().catch(console.error); 