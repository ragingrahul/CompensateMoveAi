# Staking Opportunities Finder Example with Tavily AI Integration

This example demonstrates how to use the Staking Opportunities Finder tool with Tavily AI integration to automatically find and analyze the best Aptos staking opportunities from multiple sources.

## Features

- Web scrapes real-time staking data from multiple sources
- Uses Tavily AI search to find the most up-to-date staking information
- Combines and analyzes data from both traditional scraping and Tavily AI search
- Analyzes staking opportunities based on APY, risk, liquidity, and minimum stake
- Provides recommendations based on different criteria
- Integrates with LangChain to create an AI assistant that can answer staking-related questions

## Prerequisites

- Node.js 16+
- pnpm (recommended) or npm
- An Aptos account with a private key
- OpenAI API key (for the LangChain agent)
- Tavily API key (for AI-powered search capabilities)

## Setup

1. Create a `.env` file in this directory with the following variables:

```
APTOS_PRIVATE_KEY=your_private_key
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key  # For AI-powered search
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm build
```

## Running the Example

```bash
pnpm start
```

The example will:

1. Set up an Aptos agent with the staking opportunities finder tool and Tavily integration
2. Analyze staking opportunities directly using both web scraping and Tavily AI search
3. Print the best options, including those found by Tavily
4. Set up a LangChain agent with the enhanced staking tool and OpenAI GPT-4o
5. Run several example queries to demonstrate how the AI can answer staking-related questions

## Example Queries

The example demonstrates the following queries:

- "What are the best Aptos staking opportunities right now?"
- "I have 5 APT to stake. What's my best option?"
- "Which staking option has the highest APY according to Tavily?"
- "I want a staking option with no lockup period. What do you recommend?"
- "Compare the staking data from web scraping versus what Tavily found"

## How It Works

The staking opportunities finder with Tavily integration:

1. **Web Scraping**: Scrapes data from multiple sources about Aptos staking opportunities
2. **Tavily AI Search**: Uses Tavily's semantic search to find the most recent and relevant staking information across the web
3. **Data Extraction**: Extracts structured staking data from the search results using Tavily's answer API
4. **Data Analysis**: Combines and analyzes the data to find the best options based on different criteria
5. **Recommendations**: Provides recommendations with clear explanations of pros and cons
6. **AI Assistant**: Uses OpenAI's GPT-4o to provide natural language interaction with the staking data

## Why Tavily Integration?

The Tavily integration enhances the staking opportunities finder in several ways:

1. **Real-time data**: Tavily can search across the web in real-time, finding the most current APY rates and staking conditions
2. **Broader coverage**: It can discover staking opportunities our hardcoded scrapers might miss
3. **Structured data extraction**: Tavily's AI can help extract structured data from unstructured content
4. **Less maintenance**: As websites change their structure, traditional scrapers break, but Tavily adapts more flexibly

## Extending the Tool

You can extend this tool by:

1. Adding more data sources in `scrape-opportunities.ts`
2. Improving the Tavily query and data extraction in `scrapeTavilyData()` function
3. Refining the analysis logic in `analyze-opportunities.ts`
4. Enhancing the LangChain tool to handle more complex queries

## Using in Production

When using in production:

1. Implement proper error handling and retries for web scraping and Tavily API calls
2. Add data caching to avoid hitting rate limits
3. Consider adding a database to store historical staking data
4. Add monitoring and alerting for changes in staking opportunities
5. Implement rate limiting for Tavily API calls to stay within usage limits
