import { AgentState } from "../state/state";

export const retrieverNode = async (state: typeof AgentState.State) => {
    const lastMsg = state.messages[state.messages.length - 1].content as string;
    
    // Call the injected function
    const results = await state.retriever(lastMsg);
    
    const contextStrings = results.map(r => 
      `Source: ${r.metadata.source}\nContent: ${r.content}`
    );
  
    return { context: contextStrings };
};
