import { Landmark, TrendingDown, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAptosWallet } from "@/lib/wallet-adapter/useAptosWallet";
import { useTokenStream } from "@/hooks/useTokenStream";

function TreasuryBalance() {
  const { walletAddress, isConnected } = useAptosWallet();
  const { getTreasuryBalance } = useTokenStream();
  const [balance, setBalance] = useState<number>(0);
  const [token, setToken] = useState<string>("APT");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [change, setChange] = useState<number>(0);
  const isPositive = change >= 0;

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchTreasuryBalance();
    }
  }, [isConnected, walletAddress]);

  const fetchTreasuryBalance = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      // First try to get APT balance
      const result = await getTreasuryBalance("apt");

      if (result.success && result.balance) {
        // Convert from atomic units to standard units (APT has 8 decimals)
        const atomicBalance = parseInt(result.balance);
        const standardBalance = atomicBalance / 100000000;
        setBalance(standardBalance);
        setToken("APT");

        // Set a mock change for now - in a real app, you'd track historical data
        setChange(2.3);
      } else {
        // If no APT treasury, try other tokens (USDT, USDC)
        const usdtResult = await getTreasuryBalance("usdt");
        if (usdtResult.success && usdtResult.balance) {
          const atomicBalance = parseInt(usdtResult.balance);
          const standardBalance = atomicBalance / 1000000; // Assuming 6 decimals for USDT
          setBalance(standardBalance);
          setToken("USDT");
          setChange(1.5);
        } else {
          const usdcResult = await getTreasuryBalance("usdc");
          if (usdcResult.success && usdcResult.balance) {
            const atomicBalance = parseInt(usdcResult.balance);
            const standardBalance = atomicBalance / 1000000; // Assuming 6 decimals for USDC
            setBalance(standardBalance);
            setToken("USDC");
            setChange(0.8);
          } else {
            // No treasury found
            setBalance(0);
            setToken("APT");
            setChange(0);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching treasury balance:", error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between p-6 h-full gap-4 sm:gap-0">
      <div className="flex flex-col space-y-4 justify-between">
        <h1 className="text-base font-semibold text-purple-bg-dark2 flex items-center">
          <span className="mr-2">Treasury Balance</span>
          <span className="px-2 py-1 bg-purple-bg-light text-xs rounded-full text-purple-bg-dark2 font-medium">
            {token}
          </span>
        </h1>
        <div>
          {isLoading ? (
            <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2 flex items-baseline">
                {token === "APT" ? "" : "$"}
                {balance.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}
                {token === "APT" ? " APT" : ""}
                <span className="text-base ml-2 font-medium text-purple-bg-dark">
                  available
                </span>
              </h2>
              {balance > 0 && (
                <p
                  className={`${
                    isPositive ? "text-emerald-500" : "text-rose-500"
                  } text-sm font-medium flex items-center`}
                >
                  {isPositive ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                  {Math.abs(change)}% {isPositive ? "increase" : "decrease"}{" "}
                  from last week
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-bg-light2 to-purple-primary/20 p-4 h-fit rounded-xl shadow-sm self-start sm:self-auto flex items-center justify-center">
        <Landmark className="h-10 w-10 text-purple-primary" />
      </div>
    </div>
  );
}

export default TreasuryBalance;
