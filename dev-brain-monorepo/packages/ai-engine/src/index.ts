import { END, MemorySaver} from "@langchain/langgraph";


import { StateGraph, START } from "@langchain/langgraph";
import { AgentState } from "./state/state";
import { classifyNode } from "./nodes/classify-node";
import { generatorNode } from "./nodes/generator-node";
import { retrieverNode } from "./nodes/retriever-node";

/**
 * The Workflow: The "Rules of the Road" The StateGraph is where you define the architecture. 
 * There are three main components: 
 * Nodes: The "Workstations" (where logic happens).
 * Edges: The "Conveyor Belts" (connecting one node to the next).
 * Conditional Edges: The "Decision Points" (the if/else logic of your agent).
 */

const memory = new MemorySaver();

export const workflow = new StateGraph(AgentState)
  .addNode("classify", classifyNode)
  .addNode("retrieve", retrieverNode)
  .addNode("generate", generatorNode)
  .addEdge(START, "classify");

  // Conditional Edges: The "Decision Points" (the if/else logic of agent).
  // If the user asks about bugs, code, company docs, or logic, reply ONLY 'WIKI'.
  // Otherwise, reply 'GENERAL'.
  // So, if queryType is 'WIKI', go to retrieve, otherwise go to generate.
workflow.addConditionalEdges(
    "classify",
    (state) => state.queryType === 'WIKI' ? "retrieve" : "generate"
  );
workflow.addEdge("retrieve", "generate");
workflow.addEdge("generate", END);

export const brain = workflow.compile({
  checkpointer: memory
});

/**
 * Future Edge: Web Search
 *💡 Try this mental exercise
 * Imagine you want to add a "Web Search" feature if the Vector DB doesn't have the answer.
 * You'd add a new node called webSearchNode.
 * You'd add a conditional edge after retrieve that checks: if (state.context.length === 0) -> "webSearch". 
*/
