"use client";

import ChatInterface from "./components/ChatInterface";
import { MoveAgentProvider } from "./components/MoveAgentContext";

export default function MoveAgentChatPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background to-purple-bg-light">
      <div className="flex-1 flex flex-col p-6 gap-6">
        <h1 className="text-2xl font-bold text-purple-bg-dark">
          Move Agent Chat
        </h1>
        <p className="text-purple-700">
          Chat with an AI assistant powered by Move Agent Kit and LangChain
        </p>

        <div className="flex-1 rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg hover:bg-white/90">
          <MoveAgentProvider>
            <ChatInterface />
          </MoveAgentProvider>
        </div>
      </div>
    </div>
  );
}
