"use client";

import React from "react";
import { Message } from "./MoveAgentContext";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start space-x-3 ${isUser ? "justify-end" : ""}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-xs font-semibold text-purple-600">AI</span>
        </div>
      )}

      {/* Message content */}
      <div
        className={`flex-1 max-w-[80%] rounded-lg p-3 ${
          isUser
            ? "bg-purple-600 text-white ml-auto"
            : "bg-purple-50 text-gray-900"
        }`}
      >
        {/* Format message content with line breaks */}
        {message.content.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < message.content.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-1 ${
            isUser ? "text-purple-200" : "text-purple-500"
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">You</span>
        </div>
      )}
    </div>
  );
}

// Format timestamp to a readable format
function formatTimestamp(timestamp: Date): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
