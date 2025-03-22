"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Copy,
  CheckCircle,
  Shield,
  Banknote,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Sample blockchain transaction data
const transactions = [
  {
    id: "tx-0x8f5a2d",
    hash: "0x8f5a2d3e77b84c5edf98b8bc78f51b880d3e7cf9a71465b2b6b3c437892e8f5d",
    type: "outgoing",
    status: "completed",
    amount: "2.75",
    currency: "APT",
    recipient: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    sender: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    date: "2024-07-10T10:23:15",
    network: "Aptos Testnet",
    gas: "0.00015 APT",
    gasPrice: "5",
    confirmations: 124,
    explorer:
      "https://explorer.aptoslabs.com/txn/0x8f5a2d3e77b84c5edf98b8bc78f51b880d3e7cf9a71465b2b6b3c437892e8f5d",
    notes: "Q1 contractor payment",
  },
  {
    id: "tx-0x7e9d2f",
    hash: "0x7e9d2f1c8a7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d",
    type: "incoming",
    status: "completed",
    amount: "1.25",
    currency: "APT",
    recipient: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    sender: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
    date: "2024-07-08T15:45:22",
    network: "Aptos Testnet",
    gas: "0.00012 APT",
    gasPrice: "4",
    confirmations: 245,
    explorer:
      "https://explorer.aptoslabs.com/txn/0x7e9d2f1c8a7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d",
    notes: "Client payment for July",
  },
  {
    id: "tx-0x2b4c6e",
    hash: "0x2b4c6e8a0d2f4e6a8c0e2d4f6a8e0c2d4f6e8a0c2d4f6e8a0c2d4f6e8a0c2d4f",
    type: "outgoing",
    status: "pending",
    amount: "0.54",
    currency: "APT",
    recipient: "0x3e2d1c8a7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c",
    sender: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    date: "2024-07-05T09:12:45",
    network: "Aptos Testnet",
    gas: "0.00011 APT",
    gasPrice: "3",
    confirmations: 2,
    explorer:
      "https://explorer.aptoslabs.com/txn/0x2b4c6e8a0d2f4e6a8c0e2d4f6a8e0c2d4f6e8a0c2d4f6e8a0c2d4f6e8a0c2d4f",
    notes: "Team expenses reimbursement",
  },
  {
    id: "tx-0x4d6f8a",
    hash: "0x4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f",
    type: "incoming",
    status: "completed",
    amount: "1.85",
    currency: "APT",
    recipient: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    sender: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    date: "2024-07-02T16:38:02",
    network: "Aptos Testnet",
    gas: "0.00009 APT",
    gasPrice: "3",
    confirmations: 567,
    explorer:
      "https://explorer.aptoslabs.com/txn/0x4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f",
    notes: "Investment round distribution",
  },
  {
    id: "tx-0x9c2e4d",
    hash: "0x9c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e",
    type: "outgoing",
    status: "failed",
    amount: "2.30",
    currency: "APT",
    recipient: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
    sender: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    date: "2024-06-28T11:24:35",
    network: "Aptos Testnet",
    gas: "0.00014 APT",
    gasPrice: "4",
    confirmations: 0,
    explorer:
      "https://explorer.aptoslabs.com/txn/0x9c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e4d6f8a0c2e",
    notes: "Vendor payment",
  },
  {
    id: "tx-0xa1b2c3",
    hash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    type: "outgoing",
    status: "completed",
    amount: "0.25",
    currency: "APT",
    recipient: "0xbc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    sender: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    date: "2024-06-25T08:22:45",
    network: "Aptos Testnet",
    gas: "0.00008 APT",
    gasPrice: "2",
    confirmations: 1024,
    explorer:
      "https://explorer.aptoslabs.com/txn/0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    notes: "APT transfer to secure wallet",
  },
];

// Format address to show first and last few characters
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format date to readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Get status icon based on number of confirmations
const getConfirmationIcon = (confirmations: number) => {
  if (confirmations >= 100) {
    return <Shield className="h-4 w-4 text-green-500" />;
  } else if (confirmations >= 20) {
    return <Shield className="h-4 w-4 text-blue-500" />;
  } else if (confirmations > 0) {
    return <Clock className="h-4 w-4 text-amber-500" />;
  } else {
    return <Clock className="h-4 w-4 text-red-500" />;
  }
};

const TransactionTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Filter transactions based on search term
  const filteredData = transactions.filter(
    (tx) =>
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.network.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const openExplorer = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-bg-dark3" />
          <Input
            type="search"
            placeholder="Search blockchain transactions..."
            className="w-full pl-8 border-purple-border-secondary focus-visible:ring-purple-primary/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="text-sm text-purple-bg-dark3">
            Showing <span className="font-medium">{paginatedData.length}</span>{" "}
            of <span className="font-medium">{filteredData.length}</span>{" "}
            blockchain transactions
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-purple-border-secondary bg-purple-bg-light/50">
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Transaction
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Amount
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Recipient
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Network
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-purple-border-secondary hover:bg-purple-bg-light/20 transition-colors"
              >
                {/* Transaction Hash */}
                <td className="py-2.5 px-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full border border-purple-border-secondary bg-purple-bg-light/50">
                      {tx.type === "outgoing" ? (
                        <ArrowUpRight className="h-4 w-4 text-purple-bg-dark" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-purple-primary" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-sm text-purple-bg-dark flex items-center">
                        {formatAddress(tx.hash)}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => copyToClipboard(tx.hash)}
                                className="ml-1.5 text-purple-bg-dark3 hover:text-purple-primary transition-colors"
                              >
                                {copiedHash === tx.hash ? (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {copiedHash === tx.hash
                                  ? "Copied!"
                                  : "Copy hash"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-purple-bg-dark3 text-xs truncate max-w-[140px]">
                        {tx.notes}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="py-2.5 px-4">
                  <div
                    className={`text-sm font-medium ${
                      tx.type === "outgoing" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {tx.type === "outgoing" ? "-" : "+"}
                    {tx.amount} {tx.currency}
                  </div>
                  <div className="text-xs text-purple-bg-dark3 flex items-center gap-1">
                    <Banknote className="h-3 w-3" /> Gas: {tx.gas}
                  </div>
                </td>

                {/* Recipient */}
                <td className="py-2.5 px-4 text-sm">
                  <div className="text-purple-bg-dark2">
                    {formatAddress(tx.recipient)}
                  </div>
                  <div className="text-xs text-purple-bg-dark3">
                    {tx.type === "outgoing" ? "To" : "From"}
                  </div>
                </td>

                {/* Date */}
                <td className="py-2.5 px-4 text-sm text-purple-bg-dark2">
                  {formatDate(tx.date)}
                </td>

                {/* Status */}
                <td className="py-2.5 px-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      className={`${
                        tx.status === "completed"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : tx.status === "pending"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                      variant="outline"
                    >
                      {tx.status}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div>{getConfirmationIcon(tx.confirmations)}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tx.confirmations} confirmations</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>

                {/* Network */}
                <td className="py-2.5 px-4 text-sm">
                  <Badge
                    className="bg-purple-bg-light/50 text-purple-bg-dark border-purple-border-secondary"
                    variant="outline"
                  >
                    {tx.network}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="py-2.5 px-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-purple-bg-dark2 hover:text-purple-primary hover:bg-purple-bg-light/50"
                            onClick={() => openExplorer(tx.explorer)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View on {tx.network} explorer</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-purple-bg-dark2 hover:text-purple-primary hover:bg-purple-bg-light/50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-purple-border-secondary"
                      >
                        <DropdownMenuItem className="cursor-pointer hover:bg-purple-bg-light/30 focus:bg-purple-bg-light/30">
                          View Transaction Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-purple-bg-light/30 focus:bg-purple-bg-light/30">
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-purple-bg-light/30 focus:bg-purple-bg-light/30">
                          Download Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-purple-bg-light/30 focus:bg-purple-bg-light/30">
                          Verify Signatures
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between p-4 border-t border-purple-border-secondary">
        <Button
          variant="outline"
          size="sm"
          className="border-purple-border-secondary text-purple-bg-dark2 hover:bg-purple-bg-light/50 hover:text-purple-bg-dark"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="text-sm text-purple-bg-dark3">
          Page {currentPage} of {totalPages || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-purple-border-secondary text-purple-bg-dark2 hover:bg-purple-bg-light/50 hover:text-purple-bg-dark"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TransactionTable;
