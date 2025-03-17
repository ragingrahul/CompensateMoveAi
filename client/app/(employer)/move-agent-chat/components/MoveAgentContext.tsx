"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  createMoveAgentWithPrivateKey,
  getAccountBalance,
} from "./MoveAgentUtils";
import { AgentRuntime } from "move-agent-kit";

// Message type definition
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
}

// Context type definition
interface MoveAgentContextType {
  messages: Message[];
  isLoading: boolean;
  agentAddress: string;
  agentBalance: string;
  isAgentReady: boolean;
  addMessage: (
    content: string,
    role: "user" | "assistant" | "system"
  ) => Promise<void>;
  resetConversation: () => void;
  refreshBalance: () => Promise<string>;
}

// Create context with default values
const MoveAgentContext = createContext<MoveAgentContextType>({
  messages: [],
  isLoading: false,
  agentAddress: "",
  agentBalance: "0",
  isAgentReady: false,
  addMessage: async () => {},
  resetConversation: () => {},
  refreshBalance: async () => "0",
});

// Context provider component
export function MoveAgentProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentAddress, setAgentAddress] = useState<string>("");
  const [agentBalance, setAgentBalance] = useState<string>("0");
  const [isAgentReady, setIsAgentReady] = useState<boolean>(false);
  const [moveAgent, setMoveAgent] = useState<AgentRuntime | null>(null);

  // Initialize Move Agent on component mount
  useEffect(() => {
    const initAgent = async () => {
      try {
        setIsLoading(true);

        // Generate or retrieve private key
        const privateKey = process.env.NEXT_PUBLIC_MOVE_AGENT_PRIVATE_KEY;
        if (!privateKey) {
          throw new Error("Move Agent private key is not set");
        }

        // Create Move Agent with private key
        const { agent, account } = await createMoveAgentWithPrivateKey(
          privateKey
        );

        // Store Move Agent
        setMoveAgent(agent);

        // Set agent address
        const address = account.accountAddress.toString();
        setAgentAddress(address);

        // Get and set balance - use direct API call first to avoid Move Agent issues
        try {
          const balance = await getAccountBalance(address);
          console.log("Initial balance at startup:", balance, typeof balance);
          setAgentBalance(balance);

          // Add system message
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            content: `Hello! I'm your Move Agent Assistant. My address is ${address}. I have ${balance} APT. How can I help you today?`,
            role: "assistant",
            timestamp: new Date(),
          };

          setMessages([welcomeMessage]);
          setIsAgentReady(true);
        } catch (balanceError) {
          console.error("Error getting initial balance:", balanceError);

          // Continue anyway with zero balance
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            content: `Hello! I'm your Move Agent Assistant. My address is ${address}. I couldn't retrieve my balance at the moment. How can I help you today?`,
            role: "assistant",
            timestamp: new Date(),
          };

          setMessages([welcomeMessage]);
          setIsAgentReady(true);
        }
      } catch (error) {
        console.error("Error initializing Move Agent:", error);

        // Add error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          content:
            "Sorry, I encountered an error while initializing. Please try again later.",
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages([errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    initAgent();
  }, []);

  // Refresh agent balance
  const refreshBalance = async () => {
    if (!agentAddress) return "0";

    try {
      // Always use direct API call as primary method for reliability
      const balance = await getAccountBalance(agentAddress);
      console.log("Refreshed balance (API):", balance, typeof balance);
      setAgentBalance(balance);
      return balance;
    } catch (error) {
      console.error("Error refreshing balance:", error);

      // If we have a Move Agent as backup, try that
      if (moveAgent) {
        try {
          const agentBalance = await getAccountBalance(agentAddress, moveAgent);
          console.log(
            "Refreshed balance (agent fallback):",
            agentBalance,
            typeof agentBalance
          );
          setAgentBalance(agentBalance);
          return agentBalance;
        } catch (agentError) {
          console.error("Error with agent balance fallback:", agentError);
        }
      }

      // Keep existing balance if refresh fails
      return agentBalance;
    }
  };

  // Add a new message to the conversation
  const addMessage = async (
    content: string,
    role: "user" | "assistant" | "system"
  ) => {
    // Create new message
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    };

    // Add message to state
    setMessages((prev) => [...prev, newMessage]);

    // If it's a user message, generate a response
    if (role === "user") {
      setIsLoading(true);
      try {
        let responseContent = "";

        // Process the user message using the Move Agent Action API
        try {
          const response = await fetch("/api/move-agent-action", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: content,
              show_intermediate_steps: false,
            }),
          });

          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }

          // Check if the response is a stream or JSON
          const contentType = response.headers.get("Content-Type") || "";

          if (contentType.includes("text/plain")) {
            // Handle streaming response
            const reader = response.body?.getReader();
            if (!reader) {
              throw new Error("Could not get reader from response");
            }

            const decoder = new TextDecoder();
            let responseText = "";

            // Read the stream
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              // Append the new chunk of text
              responseText += decoder.decode(value, { stream: true });
            }

            responseContent = responseText;
          } else {
            // Handle JSON response
            const data = await response.json();
            responseContent =
              data.response ||
              data.messages?.pop()?.content ||
              "I processed your request but couldn't generate a proper response.";
          }

          // If the balance might have changed, refresh it
          // This happens after commands like transfers or token requests
          await refreshBalance();
        } catch (apiError) {
          console.error("Error calling Move Agent Action API:", apiError);

          // Instead of fallback to move-agent-chat, provide a generic error message
          responseContent =
            "I'm sorry, I encountered an error processing your request. Please try again later.";
        }

        // Add assistant's response
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: responseContent,
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error getting response:", error);

        // Add error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          content:
            "Sorry, I encountered an error while processing your request.",
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Reset the conversation
  const resetConversation = () => {
    // Keep the agent information but clear the chat
    if (agentAddress && agentBalance) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hello! I'm your Move Agent Assistant. My address is ${agentAddress}. I have ${agentBalance} APT. How can I help you today?`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
    } else {
      setMessages([]);
    }
  };

  // Context value
  const value = {
    messages,
    isLoading,
    agentAddress,
    agentBalance,
    isAgentReady,
    addMessage,
    resetConversation,
    refreshBalance,
  };

  return (
    <MoveAgentContext.Provider value={value}>
      {children}
    </MoveAgentContext.Provider>
  );
}

// Custom hook to use the context
export function useMoveAgent() {
  return useContext(MoveAgentContext);
}
