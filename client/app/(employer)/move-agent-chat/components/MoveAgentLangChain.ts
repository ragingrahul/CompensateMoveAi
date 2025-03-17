import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// Define an interface for the command result
interface CommandResult {
  action: string;
  methodName?: string;
  params?: unknown[];
}

// Initialize the OpenAI model
export const initializeAgent = (apiKey: string) => {
  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: "gpt-4o",
    temperature: 0,
    maxTokens: 2048,
  });

  return {
    processUserMessage: async (
      userMessage: string,
      systemPrompt: string
    ): Promise<CommandResult | string> => {
      try {
        // Prepare the system prompt that includes instructions for the agent
        const fullSystemPrompt = `${systemPrompt}
        
        You are an AI assistant that helps users interpret natural language requests related to blockchain operations.
        
        Analyze the user's message and identify if they're trying to:
        1. Check or refresh their balance
        2. View their wallet address
        3. Request test tokens from a faucet
        4. Execute a specific Move Agent method
        
        RESPOND ONLY WITH A JSON OBJECT in one of these formats:
        
        For balance requests:
        {"action": "refreshBalance", "params": []}
        
        For address requests:
        {"action": "showAddress", "params": []}
        
        For test token requests:
        {"action": "requestFaucetTokens", "params": []}
        
        For method execution:
        {"action": "executeMethod", "methodName": "methodName", "params": [param1, param2, ...]}
        
        If the user's message doesn't match any of these actions, respond with a helpful message as plain text.
        DO NOT include any other text in your response besides the JSON object or plain text response.`;

        // Create messages for the model
        const messages = [
          new SystemMessage(fullSystemPrompt),
          new HumanMessage(userMessage)
        ];

        // Get response from model
        const response = await model.invoke(messages);
        const responseText = response.content.toString().trim();

        // Check if response is JSON
        if (responseText.startsWith('{') && responseText.endsWith('}')) {
          try {
            return JSON.parse(responseText) as CommandResult;
          } catch {
            // If parsing fails, return the original text
            return responseText;
          }
        }

        return responseText;
      } catch (error) {
        console.error("Error processing with LangChain agent:", error);
        return "I encountered an error while processing your request. Please try again.";
      }
    },
  };
}; 