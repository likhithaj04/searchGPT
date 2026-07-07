import { tavily } from "@tavily/core";
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function searchWeb({ query }) {
  console.log("calling WEBSEARCH.......");
  const response = await tvly.search(query);
  const finalres = response.results.map((result) => result.content).join('\n\n')
  return finalres;
}

const tool={searchWeb}

export async function executeTool(functionName, args) {
  const tool = tools[functionName];

  if (!tool) {
    throw new Error(`Unknown tool: ${functionName}`);
  }

  return await tool(args);
}