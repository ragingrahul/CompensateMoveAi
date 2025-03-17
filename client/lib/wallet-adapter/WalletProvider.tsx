"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { PropsWithChildren, useState, useEffect } from "react";
import { AvailableWallets } from "@aptos-labs/wallet-adapter-core";

interface WalletProviderProps extends PropsWithChildren {
  /**
   * Optional flag to auto connect to the previously connected wallet
   */
  autoConnect?: boolean;
  /**
   * Network to connect to
   */
  network?: Network;
  /**
   * Optional Aptos API key
   */
  aptosApiKey?: string;
  /**
   * Optional list of wallets to opt-in
   */
  optInWallets?: readonly AvailableWallets[];
  /**
   * Optional flag to disable telemetry
   */
  disableTelemetry?: boolean;
  /**
   * Optional callback for errors
   */
  onError?: (error: Error) => void;
}

/**
 * Wallet provider that initializes with the Aptos wallet adapter
 */
export function WalletProvider({
  children,
  autoConnect = true,
  network = Network.TESTNET,
  aptosApiKey,
  optInWallets = ["Petra"],
  disableTelemetry = true,
  onError,
}: WalletProviderProps) {
  // Track current network
  const [currentNetwork, setCurrentNetwork] = useState<Network>(network);

  // Update current network when prop changes
  useEffect(() => {
    setCurrentNetwork(network);
  }, [network]);

  return (
    <AptosWalletAdapterProvider
      autoConnect={autoConnect}
      optInWallets={optInWallets}
      dappConfig={{
        network: currentNetwork,
        ...(aptosApiKey ? { aptosApiKey } : {}),
      }}
      onError={onError}
      disableTelemetry={disableTelemetry}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
