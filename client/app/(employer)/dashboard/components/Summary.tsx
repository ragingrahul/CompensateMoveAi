import {
  BadgeAlert,
  CreditCard,
  Landmark,
  LineChart,
  MoveUpRight,
} from "lucide-react";
import React from "react";

interface SummaryProps {
  network?: string;
  token?: string;
  amount?: string;
}

function Summary({ network, token, amount }: SummaryProps) {
  // Default values for display if not provided
  const displayNetwork = network || "Aptos testnet";
  const displayToken = token || "-";
  const displayAmount = amount || "-";
  // Always use Linear flow
  const displayFlow = "linear";

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex gap-3 items-center border-b border-purple-border-secondary pb-4 mb-4">
        <BadgeAlert className="text-purple-primary" />
        <span className="font-semibold text-lg text-purple-bg-dark">
          Summary
        </span>
      </div>

      <div className="flex flex-col space-y-4 pb-6 border-b border-purple-border-secondary">
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3">Chain</span>
          <span className="font-semibold bg-purple-bg-light px-3 py-1 rounded-full text-sm">
            {displayNetwork.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3">Token</span>
          <span className="font-semibold flex items-center">
            <CreditCard className="h-4 w-4 mr-1.5 text-purple-primary" />
            {displayToken.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3">Amount</span>
          <span className="font-semibold">{displayAmount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3">Flow</span>
          <span className="font-semibold flex items-center">
            <LineChart className="h-4 w-4 mr-1.5 text-purple-primary" />
            {displayFlow.charAt(0).toUpperCase() + displayFlow.slice(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-3 py-4 my-4 bg-gradient-to-r from-purple-bg-light to-purple-bg-light2 rounded-xl p-4 shadow-sm">
        <div className="flex gap-2 items-center border-b border-purple-border-secondary pb-2">
          <MoveUpRight className="h-4 w-4 text-purple-primary" />
          <span className="font-medium text-purple-bg-dark">
            {displayFlow.charAt(0).toUpperCase() + displayFlow.slice(1)} Flow
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3 text-sm">
            Chain
          </span>
          <span className="font-medium text-sm">
            {displayNetwork.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3 text-sm">
            Token
          </span>
          <span className="font-medium text-sm">
            {displayToken.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3 text-sm">
            Amount
          </span>
          <span className="font-medium text-sm">{displayAmount}</span>
        </div>
      </div>

      <button
        className={`mt-auto w-full flex flex-row justify-center gap-2 text-white bg-gradient-to-r from-purple-bg-dark2 to-purple-primary p-3 rounded-lg font-semibold text-base hover:opacity-90 transition-all duration-200 shadow-sm`}
      >
        <Landmark className="h-5 w-5" />
        Fund Treasury
      </button>
    </div>
  );
}

export default Summary;
