"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react";
import { useNetwork } from "@/lib/network/NetworkContext";

export function NetworkSelector() {
  const { selectedNetwork, networkList, changeSelectedNetwork } = useNetwork();

  // Handle network change
  const handleNetworkChange = useCallback(
    async (value: string) => {
      try {
        console.log("Changing network to:", value);
        await changeSelectedNetwork(value);
      } catch (error) {
        console.error("Failed to change network:", error);
      }
    },
    [changeSelectedNetwork]
  );

  return (
    <Select value={selectedNetwork.id} onValueChange={handleNetworkChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        {networkList.map((network) => (
          <SelectItem key={network.id} value={network.id}>
            {network.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
