import React, { useEffect, useState } from "react";
import { useAptosWallet } from "@/lib/wallet-adapter/useAptosWallet";
import { AptosClient } from "aptos";
import { MODULE_OWNER_ADDRESS, MODULE_NAME } from "@/lib/contract-utils";
import { Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTokenStream } from "@/hooks/useTokenStream";

// Define the type for recipient data
interface Recipient {
  recipient_address: string;
  payment_amount: string;
  payment_frequency: string;
  last_payment_time: string;
  status: string;
}

// Define the type for the treasury data
interface TreasuryData {
  balance: string;
  owner: string;
  recipients: Record<string, Recipient>;
  recipient_addresses: string[];
}

function TreasuryRecipients() {
  const { walletAddress, isConnected } = useAptosWallet();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { processAllPayments } = useTokenStream();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchRecipients();
    }
  }, [isConnected, walletAddress]);

  const fetchRecipients = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      const client = new AptosClient(
        process.env.NEXT_PUBLIC_APTOS_NODE_URL ||
          "https://fullnode.testnet.aptoslabs.com/v1"
      );

      // Try to get the treasury resource
      try {
        const resource = await client.getAccountResource(
          walletAddress,
          `${MODULE_OWNER_ADDRESS}::${MODULE_NAME}::Treasury<0x1::aptos_coin::AptosCoin>`
        );

        // Extract recipients from the resource
        if (resource && resource.data) {
          const data = resource.data as TreasuryData;
          if (data.recipients && data.recipient_addresses) {
            const recipientList: Recipient[] = [];

            // Convert the recipients object to an array
            for (const addr of data.recipient_addresses) {
              if (data.recipients[addr]) {
                recipientList.push(data.recipients[addr]);
              }
            }

            setRecipients(recipientList);
          } else {
            setRecipients([]);
          }
        }
      } catch {
        console.log("No APT treasury found or no recipients");
        setRecipients([]);
      }
    } catch (error) {
      console.error("Error fetching recipients:", error);
      setRecipients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayments = async () => {
    setIsProcessing(true);
    try {
      await processAllPayments("apt");
      // Refresh the recipients list after processing payments
      await fetchRecipients();
    } catch (error) {
      console.error("Error processing payments:", error);
    } finally {
      setIsProcessing(false);
    }
  };

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
                  <h3 className="font-medium text-purple-bg-dark2">
                    {recipient.recipient_address.slice(0, 8)}...
                    {recipient.recipient_address.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Payment: {parseInt(recipient.payment_amount) / 100000000}{" "}
                    APT every {formatFrequency(recipient.payment_frequency)}
                  </p>
                </div>
                <div className="text-right">
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
