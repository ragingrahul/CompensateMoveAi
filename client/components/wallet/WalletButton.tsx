"use client";

import { useAptosWallet } from "@/lib/wallet-adapter/useAptosWallet";
import Button from "@/components/Button";
import { useCallback, useState, useEffect } from "react";
import { UserCircle2 } from "lucide-react";

interface WalletButtonProps {
  /**
   * Text to display when wallet is not connected
   */
  connectText?: string;
  /**
   * Text to display when wallet is connected
   */
  connectedText?: string;
  /**
   * Button variant
   */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /**
   * Button size
   */
  size?: "sm" | "md" | "lg";
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * A button component for connecting to and displaying wallet status
 */
export function WalletButton({
  connectText = "Connect Wallet",
  connectedText = "Connected",
  variant = "primary",
  size = "md",
  className,
}: WalletButtonProps) {
  const { status, connectWallet, disconnectWallet, wallets, walletAddress } =
    useAptosWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  // Log available wallets and connection status when component mounts
  useEffect(() => {
    console.log("Available wallets:", wallets);
    console.log("Connection status:", {
      connected: status.connected,
      connecting: isConnecting,
    });
  }, [wallets, status.connected, isConnecting]);

  // Handle wallet connection
  const handleConnect = useCallback(async () => {
    try {
      console.log("Connect button clicked. Status before connecting:", {
        connected: status.connected,
        connecting: isConnecting,
      });

      if (status.connected) {
        console.log("Attempting to disconnect wallet...");
        await disconnectWallet();
        console.log("Wallet disconnected successfully");
      } else {
        console.log("Attempting to connect wallet...");
        setIsConnecting(true);
        try {
          // Check if any wallets are available
          if (wallets && wallets.length > 0) {
            console.log("Connecting to wallet:", wallets[0].name);
            await connectWallet(wallets[0].name);
          } else {
            console.log("No wallets available, opening selector");
            await connectWallet();
          }
          console.log("Wallet connected successfully");
        } catch (error) {
          console.error("Error during wallet connection:", error);
        } finally {
          setIsConnecting(false);
        }
      }
    } catch (error) {
      console.error("Error during wallet connection/disconnection:", error);
    }
  }, [
    status.connected,
    connectWallet,
    disconnectWallet,
    wallets,
    isConnecting,
  ]);

  // Display abbreviated address if connected
  const displayAddress = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(
        walletAddress.length - 4
      )}`
    : null;

  // Determine button text based on connection state
  const buttonText = status.connected
    ? displayAddress
      ? `${connectedText}: ${displayAddress}`
      : connectedText
    : isConnecting
    ? "Connecting..."
    : connectText;

  console.log("Rendering button with text:", buttonText);

  return (
    <Button
      name={buttonText}
      icon={UserCircle2}
      variant={variant}
      size={size}
      className={className}
      onClick={handleConnect}
      disabled={isConnecting}
    />
  );
}
