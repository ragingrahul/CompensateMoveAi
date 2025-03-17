import { Landmark, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

function TreasuryBalance() {
  // Mock data for demonstration
  const balance = 5250;
  const change = 2.3;
  const isPositive = change > 0;

  return (
    <div className="flex flex-col sm:flex-row justify-between p-6 h-full gap-4 sm:gap-0">
      <div className="flex flex-col space-y-4 justify-between">
        <h1 className="text-base font-semibold text-purple-bg-dark2 flex items-center">
          <span className="mr-2">Treasury Balance</span>
          <span className="px-2 py-1 bg-purple-bg-light text-xs rounded-full text-purple-bg-dark2 font-medium">
            USDC
          </span>
        </h1>
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-baseline">
            ${balance.toLocaleString()}
            <span className="text-base ml-2 font-medium text-purple-bg-dark">
              available
            </span>
          </h2>
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
            {Math.abs(change)}% {isPositive ? "increase" : "decrease"} from last
            week
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-bg-light2 to-purple-primary/20 p-4 h-fit rounded-xl shadow-sm self-start sm:self-auto flex items-center justify-center">
        <Landmark className="h-10 w-10 text-purple-primary" />
      </div>
    </div>
  );
}

export default TreasuryBalance;
