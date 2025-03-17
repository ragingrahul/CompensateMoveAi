"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNetwork } from "@/lib/network/NetworkContext";

/**
 * Custom hook that wraps useWallet from Aptos wallet adapter
 * Provides simplified access to common wallet functions
 */
export const useAptosWallet = () => {
  const {
    connect,
    account,
    network: walletNetwork,
    connected,
    disconnect,
    wallet,
    signAndSubmitTransaction,
    signTransaction,
    signMessage,
    signMessageAndVerify,
    changeNetwork: aptosChangeNetwork,
  } = useWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const { selectedNetwork, changeSelectedNetwork } = useNetwork();

  useEffect(() => {
    setIsConnected(connected);
    if (account?.address) {
      setWalletAddress(account.address.toString());
    } else {
      setWalletAddress(null);
    }

    // Set network name based on wallet network
    if (walletNetwork?.name) {
      setNetworkName(walletNetwork.name.toLowerCase());
    } else {
      setNetworkName(null);
    }
  }, [connected, account, walletNetwork]);

  // Update wallet network when selectedNetwork changes
  useEffect(() => {
    if (selectedNetwork?.chain === "aptos" && connected && aptosChangeNetwork) {
      aptosChangeNetwork(selectedNetwork.networkType as Network)
        .then(() => {
          console.log("Aptos network changed to:", selectedNetwork.name);
        })
        .catch((error) => {
          console.error("Failed to change Aptos network:", error);
        });
    }
  }, [selectedNetwork, connected, aptosChangeNetwork]);

  /**
   * Connect to a wallet by its name
   */
  const connectWallet = useCallback(
    async (walletName?: string) => {
      try {
        if (walletName) {
          await connect(walletName);
        } else {
          // @ts-expect-error - the connect function can be called without params
          await connect();
        }
        return true;
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        return false;
      }
    },
    [connect]
  );

  /**
   * Disconnect the current wallet
   */
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      return true;
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      return false;
    }
  }, [disconnect]);

  /**
   * Change the network
   */
  const changeNetwork = useCallback(
    async (network: Network) => {
      try {
        // First, find the correct network ID in our NetworkContext that corresponds to the requested Aptos network
        let networkId: string;
        switch (network) {
          case Network.TESTNET:
            networkId = "aptos-testnet";
            break;
          // Add other Aptos networks as needed
          default:
            throw new Error(`Unsupported Aptos network: ${network}`);
        }

        // Use the NetworkContext's function to change the network
        await changeSelectedNetwork(networkId);

        // The network change in the wallet will be handled by the useEffect above
        return true;
      } catch (error) {
        console.error("Failed to change network:", error);
        return false;
      }
    },
    [changeSelectedNetwork]
  );

  /**
   * Memoed wallet status for quicker access
   */
  const walletInfo = useMemo(() => {
    return {
      connected,
      name: wallet?.name || null,
      icon: wallet?.icon || null,
      networkName: networkName,
    };
  }, [connected, wallet, networkName]);

  // Return the wrapped hooks and functions
  return {
    // Original properties from useWallet
    ...useWallet(),

    // Enhanced functions
    connectWallet,
    disconnectWallet,
    changeNetwork,

    // Status object
    status: walletInfo,

    // Simplified status flags
    isConnected,
    walletName: wallet?.name || null,
    walletIcon: wallet?.icon || null,
    walletAddress,
    networkName,

    // New functions from useWallet
    signAndSubmitTransaction,
    signTransaction,
    signMessage,
    signMessageAndVerify,
  };
};
