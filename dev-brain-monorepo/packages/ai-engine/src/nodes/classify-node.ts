import { StateType } from '../state/state';
import ollama from 'ollama';


//classifyNode: This is the "Brain's Gatekeeper." It uses an LLM (Llama 3) to perform intent classification.
// It doesn't solve the problem; it just labels the intent.

export const classifyNode = async (state: StateType) => {
    const lastMsg = state.messages[state.messages.length - 1].content;
    
    const response = await ollama.generate({
      model: 'llama3',
      prompt: `Task: Classify user intent. 
      If the user asks about bugs, code, company docs, or logic, reply ONLY 'WIKI'.
      Otherwise, reply 'GENERAL'.
      User: "${lastMsg}"`,
    });
  
    return { queryType: response.response.includes('WIKI') ? 'WIKI' : 'GENERAL' };
  };
