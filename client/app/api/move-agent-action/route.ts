import {
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit";
import { NextResponse } from "next/server";
import { YieldMaxTool } from "@/tool/moveTool";

const llm = new ChatOpenAI({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  modelName: "gpt-4o-2024-08-06",
  temperature: 0.7,
});

// Function to read and process the stream

const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message._getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message._getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else {
    return { content: message.content, role: message._getType() };
  }
};

export async function POST(request: Request) {
  try {
    // Initialize Aptos configuration
    const aptosConfig = new AptosConfig({
      network: Network.TESTNET,
    });

    const aptos = new Aptos(aptosConfig);

    // Validate and get private key from environment
    const privateKeyStr = process.env.NEXT_PUBLIC_APTOS_PRIVATE_KEY;
    if (!privateKeyStr) {
      throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
    }

    // Setup account and signer
    const account = await aptos.deriveAccountFromPrivateKey({
      privateKey: new Ed25519PrivateKey(
        PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)
      ),
    });
    console.log("account", account.accountAddress.toString());
    const body = await request.json();
    const messages = body.messages ?? [];
    const message = body.message; // Support for single message format
    const showIntermediateSteps = body.show_intermediate_steps ?? false;

    // Format messages properly for the agent
    const formattedMessages =
      messages.length > 0
        ? messages
        : message
        ? [{ role: "user", content: message }]
        : [];

    const signer = new LocalSigner(account, Network.TESTNET);
    const aptosAgent = new AgentRuntime(signer, aptos, {
      PANORA_API_KEY: process.env.PANORA_API_KEY,
      OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    const tools = createAptosTools(aptosAgent);
    const memory = new MemorySaver();
    const getYieldDetails = new YieldMaxTool(aptosAgent);
    //const getBestPools = new BestPoolsTool(aptosAgent);
    const agent = createReactAgent({
      llm,
      tools: [...tools, getYieldDetails],
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Aptos Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Aptos Agent Kit, recommend they go to https://www.aptosagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.

        The response also contains token/token[] which contains the name and address of the token and the decimals.
        WHEN YOU RETURN ANY TOKEN AMOUNTS, RETURN THEM ACCORDING TO THE DECIMALS OF THE TOKEN.

        The user might also provide a protocol or project name. If they do, you should use the YieldMaxTool to get the yield details for the protocol.
            
        The input json should be string (IMPORTANT)
      `,
    });

    if (!showIntermediateSteps) {
      // Set up configuration
      const config = {
        configurable: { thread_id: "Aptos Agent Kit!" },
        version: "v2",
      };

      // Invoke the agent without streaming
      const result = await agent.stream(
        { messages: formattedMessages },
        config
      );

      let lastMessage;
      // Extract the AI message content
      for await (const chunk of result) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
          lastMessage = chunk.agent.messages[0].content;
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
      }

      const responseContent = lastMessage;

      // Return a simple response with the content
      return NextResponse.json(
        {
          response: responseContent,
          status: "success",
        },
        { status: 200 }
      );
    } else {
      /**
       * Handle non-streaming response with full results including intermediate steps
       */
      const result = await agent.invoke({ messages: formattedMessages });

      console.log("result", result);

      return NextResponse.json(
        {
          messages: result.messages.map(convertLangChainMessageToVercelMessage),
        },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    console.error("Request error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
        status: "error",
      },
      { status: error instanceof Error && "status" in error ? 500 : 500 }
    );
  }
}
