import { useState, useCallback } from 'react';
import { useAptosWallet } from '@/lib/wallet-adapter/useAptosWallet';
import { toast } from '@/hooks/use-toast';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { MODULE_OWNER_ADDRESS, MODULE_NAME } from '@/lib/contract-utils';
import { AptosClient } from 'aptos';

// Define coin types
export const COIN_TYPES = {
  APT: '0x1::aptos_coin::AptosCoin',
  USDT: '0x1::usdt::USDT', // Replace with actual USDT type
  USDC: '0x1::usdc::USDC', // Replace with actual USDC type
};

export function useTokenStream() {
  const { signAndSubmitTransaction, walletAddress, isConnected } = useAptosWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get coin type from token symbol
  const getCoinType = (token: string): string => {
    const tokenUpper = token.toUpperCase();
    if (COIN_TYPES[tokenUpper as keyof typeof COIN_TYPES]) {
      return COIN_TYPES[tokenUpper as keyof typeof COIN_TYPES];
    }
    return COIN_TYPES.APT; // Default to APT
  };

  // Create a new treasury
  const createTreasury = useCallback(
    async (token: string) => {
      if (!isConnected || !walletAddress) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your wallet to create a treasury',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const coinType = getCoinType(token);
        
        // Format transaction according to InputTransactionData structure
        const rawTxn: InputTransactionData = {
          data: {
            function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::create_treasury`,
            functionArguments: [],
            typeArguments: [coinType]
          }
        };
        
        const response = await signAndSubmitTransaction(rawTxn);
        
        toast({
          title: 'Treasury Created',
          description: 'Your treasury has been successfully created',
        });
        
        return response;
      } catch (err) {
        console.error('Error creating treasury:', err);
        setError(err instanceof Error ? err.message : 'Failed to create treasury');
        
        toast({
          title: 'Failed to create treasury',
          description: err instanceof Error ? err.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, walletAddress, signAndSubmitTransaction]
  );

  // Fund an existing treasury
  const fundTreasury = useCallback(
    async (token: string, amount: string) => {
      if (!isConnected || !walletAddress) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your wallet to fund a treasury',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const coinType = getCoinType(token);
        
        // Format transaction according to InputTransactionData structure
        const rawTxn: InputTransactionData = {
          data: {
            function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::fund_treasury`,
            functionArguments: [amount],
            typeArguments: [coinType]
          }
        };
        
        const response = await signAndSubmitTransaction(rawTxn);
        
        toast({
          title: 'Treasury Funded',
          description: `Successfully added ${amount} ${token.toUpperCase()} to your treasury`,
        });
        
        return response;
      } catch (err) {
        console.error('Error funding treasury:', err);
        setError(err instanceof Error ? err.message : 'Failed to fund treasury');
        
        // Check if this was a user cancellation
        const errorMessage = err instanceof Error ? err.message.toLowerCase() : '';
        if (errorMessage.includes('cancelled') || 
            errorMessage.includes('rejected') || 
            errorMessage.includes('denied') ||
            errorMessage.includes('user abort') ||
            errorMessage.includes('user declined')) {
          toast({
            title: 'Transaction Cancelled',
            description: 'The funding transaction was cancelled by the user',
          });
        } else {
          toast({
            title: 'Failed to fund treasury',
            description: err instanceof Error ? err.message : 'An unknown error occurred',
            variant: 'destructive',
          });
        }
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, walletAddress, signAndSubmitTransaction]
  );

  // Add a recipient to the treasury
  const addRecipient = useCallback(
    async (token: string, recipientAddress: string, paymentAmount: string, paymentFrequency: string) => {
      if (!isConnected || !walletAddress) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your wallet to add a recipient',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const coinType = getCoinType(token);
        
        // Format transaction according to InputTransactionData structure
        const rawTxn: InputTransactionData = {
          data: {
            function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::add_recipient`,
            functionArguments: [recipientAddress, paymentAmount, paymentFrequency],
            typeArguments: [coinType]
          }
        };
        
        const response = await signAndSubmitTransaction(rawTxn);
        
        toast({
          title: 'Recipient Added',
          description: `Successfully added recipient ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
        });
        
        return response;
      } catch (err) {
        console.error('Error adding recipient:', err);
        setError(err instanceof Error ? err.message : 'Failed to add recipient');
        
        toast({
          title: 'Failed to add recipient',
          description: err instanceof Error ? err.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, walletAddress, signAndSubmitTransaction]
  );

  // Process all payments
  const processAllPayments = useCallback(
    async (token: string) => {
      if (!isConnected || !walletAddress) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your wallet to process payments',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const coinType = getCoinType(token);
        
        // Format transaction according to InputTransactionData structure
        const rawTxn: InputTransactionData = {
          data: {
            function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::process_all_payments`,
            functionArguments: [],
            typeArguments: [coinType]
          }
        };
        
        const response = await signAndSubmitTransaction(rawTxn);
        
        toast({
          title: 'Payments Processed',
          description: 'Successfully processed all due payments',
        });
        
        return response;
      } catch (err) {
        console.error('Error processing payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to process payments');
        
        toast({
          title: 'Failed to process payments',
          description: err instanceof Error ? err.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, walletAddress, signAndSubmitTransaction]
  );

  // Get treasury balance - using view function
  const getTreasuryBalance = useCallback(
    async (token: string) => {
      if (!isConnected || !walletAddress) {
        return { success: false, balance: "0", error: "Wallet not connected" };
      }

      setIsLoading(true);
      setError(null);

      try {
        const coinType = getCoinType(token);
        const aptosClient = new AptosClient(
          process.env.NEXT_PUBLIC_APTOS_NODE_URL || 
          "https://fullnode.testnet.aptoslabs.com/v1"
        );
        
        // Format view function payload
        const payload = {
          function: `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::get_treasury_balance`,
          type_arguments: [coinType],
          arguments: [walletAddress]
        };
        
        // Call view function
        const response = await aptosClient.view(payload);
        
        // View functions return array of results; typically the first element is what we want
        const balance = response[0].toString();
        
        return { success: true, balance, error: null };
      } catch (err) {
        console.error('Error getting treasury balance:', err);
        setError(err instanceof Error ? err.message : 'Failed to get treasury balance');
        return { success: false, balance: "0", error: err instanceof Error ? err.message : 'Unknown error' };
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, walletAddress]
  );

  return {
    createTreasury,
    fundTreasury,
    addRecipient,
    processAllPayments,
    getTreasuryBalance,
    isLoading,
    error,
  };
} 