import { StateType } from '../state/state';
import ollama from 'ollama';

// generatorNode: This is the "Final Output" node. It takes whatever is in the messages and context and formats a human-readable response.
export const generatorNode = async (state: StateType) => {
    const contextText = state.context.length > 0 
      ? `Using these internal docs: ${state.context.join(' ')}` 
      : "Answer generally.";
  
    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        { role: 'system', content: `You are a Senior Dev Assistant. ${contextText}` },
        ...state.messages.map(m => ({ role: 'user', content: m.content as string }))
      ],
    });
  
    return { 
      messages: [{ role: 'assistant', content: response.message.content }] 
    };
  };
