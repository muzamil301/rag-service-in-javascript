import { StateType } from '../state/state';
import ollama from 'ollama';


//classifyNode: This is the "Brain's Gatekeeper." It uses an LLM (Llama 3) to perform intent classification.
// It doesn't solve the problem; it just labels the intent.


  export const classifyNode = async (state: StateType) => {
    const lastMsg = state.messages[state.messages.length - 1].content;
    
    const response = await ollama.generate({
      model: 'llama3',
      // We provide clear "In-Context" examples to guide the LLM
      prompt: `You are a router. Your job is to classify if a query needs INTERNAL DOCUMENTATION or not.
  
      REPLY 'WIKI' IF:
      - The user asks for specific data, locations, logic, or "how-to" within our company/project.
      - Examples: "Where is the checkout flow?", "Affiliate logic", "Optimization data", "Project structure".
  
      REPLY 'GENERAL' IF:
      - The user is greeting you, asking about general coding (e.g. "What is React?"), or non-project specific questions.
      - Examples: "Hi", "How are you?", "What is a vector DB?".
  
      QUERY: "${lastMsg}"
      REPLY ONLY WITH THE WORD 'WIKI' OR 'GENERAL'.`,
    });
  
    const decision = response.response.trim().toUpperCase();
    
    // Use .includes to be safe against punctuation like "WIKI."
    const finalType = decision.includes('WIKI') ? 'WIKI' : 'GENERAL';
    
    console.log(`DEBUG: LLM decided this is ${finalType}`);
    return { queryType: finalType };
  };
  