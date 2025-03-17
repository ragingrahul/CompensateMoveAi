"use client";

import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { WalletProvider } from "@/lib/wallet-adapter";
import { AVAILABLE_WALLET_NAMES } from "@/lib/wallet-adapter";

/**
 * Wrapper component for the WalletProvider
 * This is used to wrap the application with the wallet provider
 */
export function WalletProviderWrapper({ children }: PropsWithChildren) {
  return (
    <WalletProvider
      autoConnect={true}
      network={Network.TESTNET}
      optInWallets={AVAILABLE_WALLET_NAMES}
      onError={(error) => console.error("Wallet error:", error)}
    >
      {children}
    </WalletProvider>
  );
}
