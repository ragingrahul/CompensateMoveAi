"use client";

import { useState, useRef, useEffect } from "react";
import { useMoveAgent } from "./MoveAgentContext";
import { Send, RefreshCw, Wallet, RotateCw } from "lucide-react";
import MessageItem from "./MessageItem";

export default function ChatInterface() {
  const {
    messages,
    isLoading,
    addMessage,
    resetConversation,
    agentAddress,
    agentBalance,
    isAgentReady,
    refreshBalance,
  } = useMoveAgent();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus on input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Add user message
    await addMessage(input.trim(), "user");

    // Clear input
    setInput("");
  };

  // Handle input changes with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Reset height
    e.target.style.height = "auto";

    // Set new height
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Handle key press (for Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Format address for display (truncate in the middle)
  const formatAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Handler for balance refresh
  const handleRefreshBalance = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await refreshBalance();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col px-4 py-3 border-b bg-purple-50">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg text-purple-800">
            Move Agent Assistant
          </h2>
          <button
            onClick={resetConversation}
            className="p-2 rounded-md hover:bg-purple-100 transition-colors text-purple-700"
            aria-label="Reset conversation"
            title="Reset conversation"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Agent info */}
        {isAgentReady && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 text-sm text-purple-700 bg-purple-100 p-2 rounded-md">
            <div className="flex items-center mb-2 sm:mb-0">
              <Wallet size={16} className="mr-2" />
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium mr-2">
                  Address: {formatAddress(agentAddress)}
                </span>
                <div className="flex items-center">
                  <span className="font-medium">
                    Balance: {Number(agentBalance || 0).toFixed(4)} APT
                  </span>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isLoading}
                    className="ml-2 p-1 rounded-full hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh balance"
                  >
                    <RotateCw size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-3 py-8">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p className="font-medium text-purple-800">
              Ask me anything about Move blockchain!
            </p>
            <p className="text-sm max-w-md text-purple-600">
              I can help with token operations, blockchain interactions, and
              more.
            </p>
            <div className="text-sm bg-purple-50 p-3 rounded-lg border border-purple-100 mt-4">
              <p className="font-medium mb-1">Try commands like:</p>
              <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
                <li>
                  &ldquo;execute getModules&rdquo; - Get available modules
                </li>
                <li>
                  &ldquo;execute getAccounts&rdquo; - Get account information
                </li>
                <li>
                  &ldquo;execute getResources&rdquo; - Get account resources
                </li>
                <li>
                  &ldquo;What is Move blockchain?&rdquo; - General information
                </li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-purple-600">AI</span>
            </div>
            <div className="flex-1 bg-purple-50 rounded-lg p-3">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "100ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "200ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t p-4 bg-purple-50">
        <div className="flex items-center space-x-2 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base h-12 max-h-32 bg-white"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-lg ${
              !input.trim() || isLoading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            } transition-colors`}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
