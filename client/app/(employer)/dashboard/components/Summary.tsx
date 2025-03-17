import {
  BadgeAlert,
  CreditCard,
  Landmark,
  LineChart,
  MoveUpRight,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { TreasuryFormRef } from "./TreasuryForm";

interface SummaryProps {
  network?: string;
  token?: string;
  amount?: string;
  treasuryFormRef?: React.RefObject<TreasuryFormRef | null>;
}

function Summary({ network, token, amount, treasuryFormRef }: SummaryProps) {
  const [isFunding, setIsFunding] = useState(false);
  const [formIsFunding, setFormIsFunding] = useState(false);
  const hasStartedFunding = useRef(false);

  // Default values for display if not provided
  const displayNetwork = network || "Aptos testnet";
  const displayToken = token || "-";
  const displayAmount = amount || "-";
  // Always use Linear flow
  const displayFlow = "linear";

  // Track external funding state from TreasuryForm
  useEffect(() => {
    const checkFormLoadingState = () => {
      const isFormLoading = !!treasuryFormRef?.current?.isFunding;
      setFormIsFunding(isFormLoading);

      // If we started funding but form is no longer loading, reset our local state too
      if (hasStartedFunding.current && !isFormLoading) {
        setIsFunding(false);
        hasStartedFunding.current = false;
      }
    };

    // Check immediately
    checkFormLoadingState();

    // Set up polling to check for changes in the form's loading state
    const intervalId = setInterval(checkFormLoadingState, 100);

    return () => clearInterval(intervalId);
  }, [treasuryFormRef]);

  const handleFundTreasury = async () => {
    if (!treasuryFormRef?.current) {
      console.error("Treasury form reference not available");
      return;
    }

    try {
      setIsFunding(true);
      hasStartedFunding.current = true;
      const result = await treasuryFormRef.current.fundTreasuryFromSummary();
      console.log("Treasury funding result:", result);
    } catch (error) {
      console.error("Error funding treasury from summary:", error);
    } finally {
      // Local state will be reset by the useEffect when it detects form is no longer loading
      // This ensures we stay in sync with the actual form state
    }
  };

  // Determine if button should show loading state
  const isLoading = isFunding || formIsFunding;

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
        onClick={handleFundTreasury}
        disabled={isLoading}
        className={`mt-auto w-full flex flex-row justify-center gap-2 text-white bg-gradient-to-r from-purple-bg-dark2 to-purple-primary p-3 rounded-lg font-semibold text-base hover:opacity-90 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⟳</span>
            Funding...
          </>
        ) : (
          <>
            <Landmark className="h-5 w-5" />
            Fund Treasury
          </>
        )}
      </button>
    </div>
  );
}

export default Summary;
