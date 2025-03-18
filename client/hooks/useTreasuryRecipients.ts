import { useState, useEffect, useCallback } from 'react';
import { useAptosWallet } from "@/lib/wallet-adapter/useAptosWallet";
import { AptosClient } from "aptos";
import { MODULE_OWNER_ADDRESS, MODULE_NAME } from "@/lib/contract-utils";

export function useTreasuryRecipients() {
  const { walletAddress, isConnected } = useAptosWallet();
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipientCount = useCallback(async () => {
    if (!isConnected || !walletAddress) {
      setRecipientCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const aptosClient = new AptosClient(
        process.env.NEXT_PUBLIC_APTOS_NODE_URL || 
        "https://fullnode.testnet.aptoslabs.com/v1"
      );
      
      const coinType = "0x1::aptos_coin::AptosCoin"; // Default to APT
      
      // Get the treasury resource directly
      const resource = await aptosClient.getAccountResource(
        walletAddress,
        `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::Treasury<${coinType}>`
      );
      
      if (resource && resource.data) {
        // Parse the resource data structure
        const data = resource.data as {
          recipient_addresses?: string[];
          [key: string]: unknown;
        };
        
        // If we have recipient_addresses, count them
        if (data.recipient_addresses) {
          setRecipientCount(data.recipient_addresses.length);
        } else {
          setRecipientCount(0);
        }
      } else {
        setRecipientCount(0);
      }
    } catch (error) {
      console.error("Error fetching treasury recipients:", error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setRecipientCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, isConnected]);

  // Fetch recipient count on mount and when wallet changes
  useEffect(() => {
    fetchRecipientCount();
  }, [fetchRecipientCount]);

  return {
    recipientCount,
    isLoading,
    error,
    refreshRecipientCount: fetchRecipientCount
  };
} 