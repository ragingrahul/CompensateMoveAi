import { AgentRuntime, LocalSigner } from 'move-agent-kit';
import { Aptos, Account, Network, AptosConfig, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

// Initialize Aptos configuration
const aptosConfig = new AptosConfig({ 
  network: Network.TESTNET 
});

// Initialize Aptos client
const aptos = new Aptos(aptosConfig);

// Create a Move Agent with the provided private key
export const createMoveAgentWithPrivateKey = async (privateKeyHex: string) => {
  try {
    // Create an Aptos account from private key
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    const account = Account.fromPrivateKey({ privateKey });
    
    // Create the Move Agent using standard initialization
    const signer = new LocalSigner(account, Network.TESTNET);
    const agent = new AgentRuntime(signer, aptos,
        {
            PANORA_API_KEY: process.env.NEXT_PUBLIC_PANORA_API_KEY!,
            OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
        }
    );

    // Return the Move Agent instance and account
    return { 
      agent,
      account,
    };
  } catch (error) {
    console.error('Error creating Move Agent:', error);
    throw error;
  }
};

// Get account balance - using direct API call to ensure reliability
export const getAccountBalance = async (address: string, agent?: AgentRuntime) => {
  try {
    // Always start with Aptos API call as the most reliable method
    try {
      const resources = await aptos.getAccountResources({
        accountAddress: address,
      });
      
      // Find APT coin resource
      const accountResource = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      if (accountResource) {
        // @ts-expect-error - Type is not properly defined in resource
        const coinValue = accountResource.data.coin.value;
        console.log("Balance from API:", coinValue, typeof coinValue);
        
        if (coinValue !== undefined && coinValue !== null) {
          // Convert from octas to APT (1 APT = 10^8 octas)
          const balanceInApt = Number(coinValue) / 100_000_000;
          console.log("Converted balance:", balanceInApt);
          return balanceInApt.toString();
        }
      }
    } catch (apiError) {
      console.error("Error getting balance via direct API:", apiError);
    }
    
    // Only try agent as a fallback - we know there are issues with it
    if (agent) {
      try {
        const agentBalance = await agent.getBalance(address);
        console.log("Balance from agent:", agentBalance, typeof agentBalance);
        
        if (agentBalance && typeof agentBalance === 'string') {
          // Process the agent balance if it's valid
          try {
            const balanceStr = agentBalance as string;
            
            if (balanceStr.includes('e')) {
              // Handle exponential notation
              return parseFloat(balanceStr).toString();
            } else if (/^\d+$/.test(balanceStr) && balanceStr.length > 8) {
              // If it looks like octas, convert to APT
              const balanceInApt = parseInt(balanceStr) / 100_000_000;
              return balanceInApt.toString();
            }
            return balanceStr;
          } catch (parseError) {
            console.error("Error parsing agent balance:", parseError);
          }
        }
      } catch (agentError) {
        console.error("Error getting balance via agent:", agentError);
      }
    }
    
    // Return 0 if all methods fail
    return "0";
  } catch (error) {
    console.error('Error in getAccountBalance:', error);
    return "0";
  }
};


