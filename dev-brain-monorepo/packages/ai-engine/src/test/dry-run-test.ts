import { brain } from '../index'; // Your compiled graph
import { HumanMessage } from "@langchain/core/messages";

export async function testBrain(): Promise<void> {
  console.log("🚀 Starting Agentic Dry Run...\n");

  // 1. Define a Mock Retriever (Simulates your Postgres search)
  const mockRetriever = async (query: string) => {
    console.log(`🔍 [Mock DB] Searching for: "${query}"`);
    return [
      { content: "Found mock doc about affiliates in /docs/affiliate.md", metadata: { source: "affiliate.md" } }
    ];
  };

  // 2. Test Case A: A General Greeting (Should skip DB)
  console.log("--- TEST A: General Greeting ---");
  const resA = await brain.invoke({
    messages: [new HumanMessage("Hello! How can you help me today?")],
    retriever: mockRetriever
  });
  console.log(`Result: ${resA.queryType} path taken.`);
  console.log(`Response: ${resA.messages[resA.messages.length -1].content}\n`);

  // 3. Test Case B: A Technical Question (Should trigger DB)
  console.log("--- TEST B: Technical Wiki Question ---");
  const resB = await brain.invoke({
    messages: [new HumanMessage("Where is the affiliate logic located?")],
    retriever: mockRetriever
  });
  console.log(`Result: ${resB.queryType} path taken.`);
  console.log(`Docs Found: ${resB.context.length}`);
  console.log(`Response: ${resB.messages[resB.messages.length -1].content}\n`);
}

testBrain().catch(console.error);