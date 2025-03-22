"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Lightbulb,
  LineChart,
  ArrowUpRight,
  Search,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Define types for our pool data
interface Pool {
  id: number;
  name: string;
  totalDeposited: number;
  currentYield: number;
  apy: number;
  avgApy30d: number;
  tvl: string;
  predictionText: string;
  confidence: "High" | "Medium" | "Low";
  logo: string;
  riskRating?: string;
  impermanentLossRisk?: boolean;
  aiRecommended: boolean;
}

// Custom progress component
function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`}>
      <div
        className="bg-purple-600 rounded-full h-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      ></div>
    </div>
  );
}

// Custom confidence badge component
function ConfidenceBadge({
  confidence,
}: {
  confidence: "High" | "Medium" | "Low";
}) {
  const colorMap = {
    High: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colorMap[confidence]}`}
    >
      {confidence} Confidence
    </span>
  );
}

function YieldPromptCard() {
  const [prompt, setPrompt] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [showResponsePopup, setShowResponsePopup] = useState(false);

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;

    setIsSearching(true);
    setResponse(null);
    setShowResponsePopup(false);

    try {
      // Make the actual API call to move-agent-action endpoint
      const result = await fetch("/api/move-agent-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          show_intermediate_steps: false,
        }),
      });

      if (!result.ok) {
        throw new Error(`API returned status: ${result.status}`);
      }

      const data = await result.json();
      setResponse(data.response);
      setShowResponsePopup(true); // Automatically show popup when response arrives
    } catch (error) {
      console.error("Error calling move-agent-action API:", error);
      setResponse(
        "Error: Failed to connect to the AI agent. Please try again."
      );
      setShowResponsePopup(true); // Show error in popup too
    } finally {
      setIsSearching(false);
    }
  };

  // Format response - this would be enhanced in a real app
  const formatResponse = (text: string) => {
    return text.split("\n").map((line, i) => (
      <p key={i} className={i === 0 ? "font-medium" : ""}>
        {line}
      </p>
    ));
  };

  return (
    <>
      <Card className="rounded-xl shadow-md bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-purple-800">
              AI Yield Finder
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-purple-100 border-purple-300 text-purple-800 flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Move Agent</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="text-sm text-purple-700">
              Ask the AI to find optimal yield options based on your specific
              requirements:
            </div>

            <div className="flex flex-col gap-3">
              <Input
                placeholder="e.g., Find APT pools with at least 10% APY and low impermanent loss risk"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-white/70 border-purple-200"
              />

              <Button
                className="bg-purple-600 hover:bg-purple-700 w-full flex items-center gap-2"
                onClick={handlePromptSubmit}
                disabled={isSearching || !prompt.trim()}
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing options...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Find Optimal Yield Options</span>
                  </>
                )}
              </Button>
            </div>

            {response && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowResponsePopup(true)}
                  className="flex items-center gap-2 text-purple-600"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>View AI Response</span>
                </Button>
              </div>
            )}

            <div className="text-xs text-purple-600 italic mt-auto pt-2">
              Powered by move-agent-action API for intelligent yield
              optimization
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response popup/modal */}
      {showResponsePopup && response && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-lg">
                  AI Yield Recommendation
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResponsePopup(false)}
              >
                Close
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose max-w-none">{formatResponse(response)}</div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <Button
                variant="default"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setShowResponsePopup(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PoolCard({ pool }: { pool: Pool }) {
  // For display purposes - normalizing utilization to 0-100 range
  const utilizationPercentage = pool.aiRecommended ? 35 : 0;

  // Mock function to simulate retrieving funds
  const handleRetrieveFunds = async () => {
    try {
      // In a real implementation, this would call the API
      await fetch("/api/treasury/retrieve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poolId: pool.id,
          amount: pool.totalDeposited,
        }),
      });

      alert(
        `Initiated retrieval of ${pool.totalDeposited} APT from ${pool.name}. Processing transaction...`
      );
    } catch (error) {
      console.error("Error retrieving funds:", error);
      alert("Failed to retrieve funds. Please try again.");
    }
  };

  return (
    <Card
      className={`rounded-xl shadow-md bg-white/80 backdrop-blur-sm border ${
        pool.aiRecommended
          ? "border-purple-500"
          : "border-purple-border-secondary"
      } transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-[1.01]`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              {/* This would be an actual image in production */}
              <span className="text-xs">{pool.logo.split("_")[0][0]}</span>
            </div>
            <CardTitle className="text-xl font-bold text-purple-bg-dark">
              {pool.name}
            </CardTitle>
            {pool.aiRecommended && (
              <Badge
                variant="outline"
                className="bg-purple-100 border-purple-300 text-purple-800 flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>AI Recommended</span>
              </Badge>
            )}
          </div>
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
            {pool.apy}% APY
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm text-muted-foreground">
                Total Deposited
              </div>
              <div className="font-medium">
                {pool.totalDeposited.toFixed(2)} APT
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Current Yield</div>
              <div className="font-medium">
                {pool.currentYield.toFixed(4)} APT
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">30d Avg APY</div>
              <div className="font-medium">{pool.avgApy30d}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">TVL</div>
              <div className="font-medium">{pool.tvl}</div>
            </div>
          </div>

          {pool.aiRecommended && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-blue-800">
                  AI Outlook
                </div>
                <div className="text-xs text-blue-700">
                  {pool.predictionText}
                </div>
                <div className="mt-1">
                  <ConfidenceBadge confidence={pool.confidence} />
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Treasury Allocation</span>
              <span className="font-medium">
                {pool.aiRecommended
                  ? pool.totalDeposited > 0
                    ? `${((pool.totalDeposited / 5.1) * 100).toFixed(0)}%`
                    : "0%"
                  : "0%"}
              </span>
            </div>
            <Progress value={utilizationPercentage} className="h-2" />
          </div>

          <div className="pt-2 flex space-x-2">
            {pool.totalDeposited > 0 ? (
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleRetrieveFunds}
              >
                Retrieve Funds
              </Button>
            ) : (
              <Button
                className="w-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                disabled
              >
                No Funds
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TotalYieldSummary({ pools }: { pools: Pool[] }) {
  const totalDeposited = pools.reduce(
    (sum: number, pool: Pool) => sum + pool.totalDeposited,
    0
  );
  const totalYield = pools.reduce(
    (sum: number, pool: Pool) => sum + pool.currentYield,
    0
  );
  const averageAPY =
    pools.reduce(
      (sum: number, pool: Pool) =>
        sum + (pool.totalDeposited > 0 ? pool.apy : 0),
      0
    ) / pools.filter((p) => p.totalDeposited > 0).length;

  // Count AI recommended pools
  const aiRecommendedCount = pools.filter((p) => p.aiRecommended).length;

  return (
    <Card className="rounded-xl shadow-md bg-gradient-to-br from-white to-purple-50/30 border border-purple-border-secondary backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-[1.01] h-full flex flex-col overflow-hidden">
      {/* Decorative top bar */}
      <div className="h-1 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-400"></div>

      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-purple-600">
            Treasury Yield Summary
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-purple-100/70 border-purple-300 text-purple-800 flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI Optimized</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-6">
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-6">
            {/* Total Deposited */}
            <div className="space-y-2 bg-white/60 rounded-lg p-3 border border-purple-100 transition-all duration-300 hover:bg-white hover:border-purple-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-purple-700">
                  Total Deposited
                </p>
                <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs text-purple-700">APT</span>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold tracking-tight text-purple-900">
                  {totalDeposited.toFixed(2)}
                </p>
                <span className="text-xs text-green-600 pb-1 font-medium">
                  +{((totalYield / totalDeposited) * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Total Yield */}
            <div className="space-y-2 bg-white/60 rounded-lg p-3 border border-purple-100 transition-all duration-300 hover:bg-white hover:border-purple-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-purple-700">
                  Yield Generated
                </p>
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs text-green-700">APT</span>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold tracking-tight text-purple-900">
                  {totalYield.toFixed(4)}
                </p>
                {totalYield > 0 && (
                  <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                    Active
                  </span>
                )}
              </div>
            </div>

            {/* Weighted APY */}
            <div className="space-y-2 bg-white/60 rounded-lg p-3 border border-purple-100 transition-all duration-300 hover:bg-white hover:border-purple-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-purple-700">
                  Weighted APY
                </p>
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs text-blue-700">%</span>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold tracking-tight text-purple-900">
                  {averageAPY.toFixed(2)}%
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-blue-600 pb-1 font-medium">
                    Optimized
                  </span>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="space-y-2 bg-white/60 rounded-lg p-3 border border-purple-100 transition-all duration-300 hover:bg-white hover:border-purple-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-purple-700">
                  AI Recommendations
                </p>
                <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-purple-700" />
                </div>
              </div>
              <div className="flex items-end">
                <p className="text-2xl font-bold tracking-tight text-purple-900">
                  {aiRecommendedCount}
                </p>
                <span className="ml-2 text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tag */}
        <div className="mt-5 flex justify-center">
          <div className="text-xs text-purple-600 bg-purple-50 rounded-full px-3 py-1 border border-purple-100">
            Treasury funds optimally allocated for maximum yield
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Page() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch pool data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // In a real implementation, this would fetch from a real API endpoint
        const response = await fetch("/api/treasury/pools");

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setPools(data.pools);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching pool data:", error);

        // Fallback to demo data if API fails
        // In production, you would show an error state instead
        setPools([
          {
            id: 1,
            name: "APT-USDT ThalaSwap V2",
            totalDeposited: 3.1,
            currentYield: 0.058,
            apy: 32.43,
            avgApy30d: 31.51,
            tvl: "$4.62m",
            predictionText: "Expected to fall below 25.94% within 4 weeks",
            confidence: "High",
            logo: "/thala_logo.png",
            aiRecommended: true,
          },
          {
            id: 2,
            name: "APT Pool on Amnis Finance",
            totalDeposited: 2.0,
            currentYield: 0.023,
            apy: 7.67,
            avgApy30d: 8.43,
            tvl: "$15.94m",
            predictionText: "Not expected to fall below 6.14% within 4 weeks",
            confidence: "Medium",
            impermanentLossRisk: false,
            logo: "/amnis_logo.png",
            aiRecommended: true,
          },
        ]);
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gradient-to-br from-background to-purple-bg-light">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-bg-dark">
          Treasury Yield Pools
        </h1>
        <div className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-muted-foreground">
            {loading
              ? "Updating..."
              : lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
              : ""}
          </span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2">
          <TotalYieldSummary pools={pools} />
        </div>
        <div className="md:col-span-1">
          <YieldPromptCard />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {pools.map((pool) => (
          <PoolCard key={pool.id} pool={pool} />
        ))}
      </div>
    </div>
  );
}

export default Page;
