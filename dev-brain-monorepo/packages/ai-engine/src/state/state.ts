import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// 1. Define State
export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  // queryType: This is a "metadata" field. It tells future nodes what the classifyNode decided. either WIKI or GENERAL.
  queryType: Annotation<'WIKI' | 'GENERAL'>({
    reducer: (x, y) => y ?? x,
    default: () => 'GENERAL',
  }),
  // context: This is a "temporary storage" for data retrieved from Vector DB.
  context: Annotation<string[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  // Dependency injection for the search function from API service
  retriever: Annotation<(query: string) => Promise<any[]>>({
    reducer: (x, y) => y ?? x,
  })
});

export type StateType = typeof AgentState.State;
