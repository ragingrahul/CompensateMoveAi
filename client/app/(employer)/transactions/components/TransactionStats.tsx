"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, Coins, ServerIcon as Server } from "lucide-react";

// Sample data for blockchain transaction metrics
const stats = [
  {
    title: "Total Transactions",
    value: "24",
    change: "+12%",
    trend: "up",
    icon: <TrendingUp className="h-4 w-4 text-green-500" />,
    description: "in the past week",
  },
  {
    title: "Transaction Value",
    value: "8.89 APT",
    change: "+18%",
    trend: "up",
    icon: <Wallet className="h-4 w-4 text-purple-primary" />,
    description: "on Aptos Testnet",
  },
  {
    title: "Gas Fees Spent",
    value: "0.00069 APT",
    change: "-3%",
    trend: "down",
    icon: <Coins className="h-4 w-4 text-amber-500" />,
    description: "compared to last week",
  },
  {
    title: "Network Activity",
    value: "Aptos Testnet",
    secondaryValue: "1,962 Blocks",
    trend: "neutral",
    icon: <Server className="h-4 w-4 text-blue-500" />,
    description: "Latest block: July 11, 2024",
  },
];

const TransactionStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="overflow-hidden border border-purple-border-secondary bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-bg-dark3">
                {stat.title}
              </p>
              <div className="rounded-full p-1 bg-purple-bg-light/60">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-purple-bg-dark">
                {stat.value}
              </h3>
              {stat.secondaryValue && (
                <div className="text-sm font-medium text-purple-primary mt-1">
                  {stat.secondaryValue}
                </div>
              )}
              <div className="mt-1 flex items-center gap-1">
                {stat.trend !== "neutral" && (
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : stat.trend === "down"
                        ? "text-red-600"
                        : "text-purple-bg-dark3"
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
                <span className="text-xs text-purple-bg-dark3">
                  {stat.description}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransactionStats;
