import { TrendingDown, TrendingUp, Users } from "lucide-react";
import React from "react";
import { useTreasuryRecipients } from "@/hooks/useTreasuryRecipients";
import { useAptosWallet } from "@/lib/wallet-adapter/useAptosWallet";

function EmployeeCount() {
  const { recipientCount, isLoading } = useTreasuryRecipients();
  const { isConnected } = useAptosWallet();

  // We don't have historical data for now, so we'll hide the change indicator
  // or you can keep it as a placeholder for future functionality
  const showChangeIndicator = false;
  const change = 0;
  const isPositive = change > 0;

  return (
    <div className="flex flex-col sm:flex-row justify-between p-6 h-full gap-4 sm:gap-0">
      <div className="flex flex-col space-y-4 justify-between">
        <h1 className="text-base font-semibold text-purple-bg-dark2 flex items-center">
          <span className="mr-2">Treasury Recipients</span>
          <span className="px-2 py-1 bg-purple-bg-light text-xs rounded-full text-purple-bg-dark2 font-medium">
            {isConnected ? "Active" : "Connect Wallet"}
          </span>
        </h1>
        <div>
          {isLoading ? (
            <div className="flex items-center h-8">
              <div className="animate-pulse rounded-md bg-gray-200 h-6 w-12"></div>
            </div>
          ) : (
            <h2 className="text-2xl font-bold mb-2 flex items-baseline">
              {recipientCount}
              <span className="text-base ml-2 font-medium text-purple-bg-dark">
                {recipientCount === 1 ? "recipient" : "recipients"}
              </span>
            </h2>
          )}

          {showChangeIndicator && (
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
              {Math.abs(change)}% {isPositive ? "more" : "less"} than last month
            </p>
          )}
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-bg-light2 to-purple-primary/20 p-4 h-fit rounded-xl shadow-sm self-start sm:self-auto flex items-center justify-center">
        <Users className="h-10 w-10 text-purple-primary" />
      </div>
    </div>
  );
}

export default EmployeeCount;
