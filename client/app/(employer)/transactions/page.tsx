"use client";

import React, { useState } from "react";
import { Download, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransactionTable from "./components/TransactionTable";
import TransactionStats from "./components/TransactionStats";
import NewTransactionDialog from "./components/NewTransactionDialog";

export default function TransactionsPage() {
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);

  return (
    <div className="flex flex-col space-y-8 px-4 py-6 md:px-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-purple-bg-dark">
          Transactions
        </h1>
        <p className="text-purple-bg-dark3">
          View and manage all your blockchain transactions across different
          networks and currencies.
        </p>
      </div>

      {/* Transaction statistics */}
      <TransactionStats />

      {/* Main transactions panel */}
      <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col space-y-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 border-b border-purple-border-secondary">
          <h3 className="text-lg font-medium text-purple-bg-dark">
            Blockchain Transactions
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1 border-purple-border-secondary hover:bg-purple-bg-light/50 hover:text-purple-primary"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1 border-purple-border-secondary hover:bg-purple-bg-light/50 hover:text-purple-primary"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              onClick={() => setShowNewTransactionModal(true)}
              size="sm"
              className="h-9 gap-1 bg-purple-primary hover:bg-purple-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Transaction</span>
            </Button>
          </div>
        </div>
        <TransactionTable />
      </div>

      {/* New Transaction Dialog */}
      <NewTransactionDialog
        open={showNewTransactionModal}
        onOpenChange={setShowNewTransactionModal}
      />
    </div>
  );
}
