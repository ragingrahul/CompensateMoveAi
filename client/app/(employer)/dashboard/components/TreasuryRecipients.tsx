import React, { useEffect, useState, useCallback } from "react";
import { useAptosWallet } from "@/lib/wallet-adapter/useAptosWallet";
import { Users, Clock, Briefcase, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTokenStream } from "@/hooks/useTokenStream";
import { useEmployees } from "@/hooks/useEmployees";
import { Employee } from "@/types/types";
import { toast } from "@/hooks/use-toast";
import { AptosClient } from "aptos";
import { MODULE_OWNER_ADDRESS, MODULE_NAME } from "@/lib/contract-utils";

// Define the type for recipient data
interface Recipient {
  recipient_address: string;
  payment_amount: string;
  payment_frequency: string;
  last_payment_time: string;
  status: string;
  employee?: Employee; // Add employee details
}

function TreasuryRecipients() {
  const { walletAddress, isConnected } = useAptosWallet();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { processAllPayments } = useTokenStream();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { employees } = useEmployees();

  // Function to fetch recipients directly from the treasury resource
  const fetchRecipients = useCallback(async () => {
    if (!isConnected || !walletAddress) {
      console.log(
        "❌ Cannot fetch recipients - wallet not connected or no address"
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log("📊 FETCHING TREASURY RECIPIENTS");
    console.log("👛 Wallet address:", walletAddress);
    console.log("👥 Total employees loaded from Supabase:", employees.length);

    // Debug the available employee addresses
    if (employees.length > 0) {
      console.log(
        "👥 Available employee addresses:",
        employees
          .filter((emp) => emp.aptosWalletAddress)
          .map((emp) => ({
            name: emp.name,
            address: emp.aptosWalletAddress,
            normalized: emp.aptosWalletAddress?.toLowerCase(),
          }))
      );
    } else {
      console.log("❌ No employees loaded from Supabase yet");
    }

    try {
      const aptosClient = new AptosClient(
        process.env.NEXT_PUBLIC_APTOS_NODE_URL ||
          "https://fullnode.testnet.aptoslabs.com/v1"
      );

      const coinType = "0x1::aptos_coin::AptosCoin"; // Default to APT

      console.log("📤 Requesting treasury resource for:", walletAddress);
      console.log(
        "🧩 Resource type:",
        `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::Treasury<${coinType}>`
      );

      // Get the treasury resource directly
      const resource = await aptosClient.getAccountResource(
        walletAddress,
        `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::Treasury<${coinType}>`
      );

      console.log("📥 Treasury resource retrieved:", resource ? "Yes" : "No");

      if (resource && resource.data) {
        console.log("📝 Treasury data structure:", Object.keys(resource.data));

        // Parse the resource data structure
        const data = resource.data as {
          recipients?: Record<
            string,
            {
              payment_amount: string;
              payment_frequency: string;
              last_payment_time: string;
              status: string;
            }
          >;
          recipient_addresses?: string[];
          // Add any additional fields that might be in the treasury resource
          [key: string]: unknown;
        };

        // Check if we have recipient_addresses in the data
        if (!data.recipient_addresses) {
          console.log(
            "❌ No recipient_addresses array found in treasury data",
            data
          );
          setRecipients([]);
          setIsLoading(false);
          return;
        }

        console.log(
          `✅ Found ${data.recipient_addresses.length} recipient addresses in treasury`
        );
        console.log("📝 Recipient addresses:", data.recipient_addresses);

        // Map each recipient address directly with employee data from Supabase
        const parsedRecipients = data.recipient_addresses
          .map((address) => {
            // Debug each address we're trying to match
            console.log(`🔍 Processing recipient address: ${address}`);

            // Normalize the address for case-insensitive comparison
            const normalizedAddress = address.toLowerCase();

            // Try to match with an employee (case-insensitive comparison)
            const matchedEmployee = employees.find((emp) => {
              if (!emp.aptosWalletAddress) return false;

              const normalizedEmpAddress = emp.aptosWalletAddress.toLowerCase();
              const matches = normalizedEmpAddress === normalizedAddress;

              if (matches) {
                console.log(
                  `✅ MATCH FOUND: ${emp.name} (${emp.aptosWalletAddress}) matches ${address}`
                );
              }

              return matches;
            });

            if (matchedEmployee) {
              console.log(`🔗 Matched with employee:`, {
                name: matchedEmployee.name,
                email: matchedEmployee.email,
                role: matchedEmployee.role,
                dept: matchedEmployee.department,
              });
            } else {
              console.log(`❓ No employee match found for address: ${address}`);
            }

            // Since we may not have detailed payment data in the resource,
            // we'll create a basic recipient object with the address and employee data
            return {
              recipient_address: address,
              // Default values or placeholders for payment data
              payment_amount: "0", // Will display as 0 APT
              payment_frequency: "2592000", // Default to monthly (30 days)
              last_payment_time: "0", // Will display as epoch start
              status: "0", // Default to "Active"
              employee: matchedEmployee,
            };
          })
          .filter(Boolean) as Recipient[]; // Filter out null values

        console.log("✅ Processed recipients:", parsedRecipients.length);
        console.log(
          `✅ Recipients with employee matches: ${
            parsedRecipients.filter((r) => r.employee).length
          }`
        );

        setRecipients(parsedRecipients);
      } else {
        console.log("❌ No treasury data found");
        setRecipients([]);
      }
    } catch (error) {
      console.error("❌ Error fetching treasury data:", error);
      setRecipients([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, isConnected, employees]);

  // Initial fetch only on mount, no periodic refresh
  useEffect(() => {
    // Fetch on component mount
    fetchRecipients();

    // No setInterval for auto-refresh
  }, [fetchRecipients]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    toast({
      title: "Refreshing recipients",
      description: "Fetching the latest treasury recipients data",
    });
    fetchRecipients();
  }, [fetchRecipients]);

  // Handle process payments
  const handleProcessPayments = useCallback(async () => {
    setIsProcessing(true);
    try {
      await processAllPayments("apt");
      toast({
        title: "Payments Processed",
        description: "Successfully processed payments for all recipients",
      });
      // Refresh the recipients list after processing payments
      await fetchRecipients();
    } catch (error) {
      console.error("❌ Error processing payments:", error);
      toast({
        title: "Error Processing Payments",
        description: "Failed to process payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [processAllPayments, fetchRecipients]);

  // Helper to format time
  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Helper to format payment frequency
  const formatFrequency = (seconds: string) => {
    const secs = parseInt(seconds);
    if (secs >= 2592000) return `${Math.floor(secs / 2592000)} month(s)`;
    if (secs >= 604800) return `${Math.floor(secs / 604800)} week(s)`;
    if (secs >= 86400) return `${Math.floor(secs / 86400)} day(s)`;
    if (secs >= 3600) return `${Math.floor(secs / 3600)} hour(s)`;
    return `${Math.floor(secs / 60)} minute(s)`;
  };

  return (
    <div className="p-6">
      <div className="pb-4 mb-4 border-b border-purple-border-secondary flex flex-row justify-between items-center">
        <h1 className="text-lg font-semibold text-purple-bg-dark2 flex items-center">
          <Users className="mr-2 h-5 w-5" />
          <span>Treasury Recipients</span>
          <span className="ml-2 px-2 py-0.5 bg-purple-bg-light text-xs rounded-full text-purple-bg-dark2 font-medium">
            {recipients.length}
          </span>
        </h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-purple-bg-dark2 inline-flex items-center gap-2 bg-purple-bg-light hover:bg-purple-bg-light2 transition-colors"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-purple-bg-dark2 inline-flex items-center gap-2 bg-purple-bg-light hover:bg-purple-bg-light2 transition-colors"
            onClick={handleProcessPayments}
            disabled={isProcessing || recipients.length === 0}
          >
            <Clock className="h-4 w-4" />
            {isProcessing ? "Processing..." : "Process Payments"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-purple-primary border-t-transparent rounded-full"></div>
        </div>
      ) : recipients.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No recipients found</p>
          <p className="text-sm">
            Add recipients to your treasury to start streaming payments
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <div
              key={index}
              className="p-4 border border-purple-border-secondary rounded-lg bg-white/80 hover:bg-white transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  {recipient.employee ? (
                    <>
                      <h3 className="font-medium text-purple-bg-dark2 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {recipient.employee.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{recipient.employee.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Briefcase className="h-3 w-3 mr-1" />
                        <span>
                          {recipient.employee.role} (
                          {recipient.employee.department})
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="font-medium">Salary:</span>
                        <span className="ml-1">
                          $
                          {recipient.employee.salary?.toLocaleString() || "N/A"}{" "}
                          USD
                        </span>
                      </div>
                    </>
                  ) : (
                    <h3 className="font-medium text-purple-bg-dark2">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Unknown Recipient</span>
                      </span>
                      <span className="text-sm mt-1 block">
                        {recipient.recipient_address.slice(0, 8)}...
                        {recipient.recipient_address.slice(-6)}
                      </span>
                      <div className="text-xs text-amber-600 mt-1">
                        No matching employee found in database
                      </div>
                    </h3>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {recipient.payment_amount !== "0" ? (
                      <>
                        Payment:{" "}
                        <span className="font-semibold">
                          {parseInt(recipient.payment_amount) / 100000000} APT
                        </span>{" "}
                        every{" "}
                        <span className="font-semibold">
                          {formatFrequency(recipient.payment_frequency)}
                        </span>
                      </>
                    ) : (
                      <span className="italic text-amber-600">
                        Payment details not available in blockchain data
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  {recipient.payment_amount !== "0" ? (
                    <>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recipient.status === "0"
                            ? "bg-green-100 text-green-800"
                            : recipient.status === "1"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {recipient.status === "0"
                          ? "Active"
                          : recipient.status === "1"
                          ? "Paused"
                          : "Completed"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Last paid: {formatTime(recipient.last_payment_time)}
                      </p>
                    </>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Treasury Member
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Wallet: {recipient.recipient_address.slice(0, 6)}...
                    {recipient.recipient_address.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TreasuryRecipients;
