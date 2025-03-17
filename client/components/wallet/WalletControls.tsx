"use client";

import { WalletButton } from "./WalletButton";
import { NetworkSelector } from "./NetworkSelector";

export function WalletControls() {
  return (
    <div className="flex items-center gap-4">
      <NetworkSelector />
      <WalletButton />
    </div>
  );
}
