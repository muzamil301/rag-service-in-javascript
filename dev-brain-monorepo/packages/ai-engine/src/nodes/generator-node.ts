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


//   export const generatorNode1 = async (state: StateType) => {
//     const contextText = state.context.length > 0 
//       ? `Using these internal docs: ${state.context.join('\n')}` 
//       : "Answer generally based on your knowledge.";
  
//     // Initialize the stream with Ollama
//     const response = await ollama.chat({
//       model: 'llama3',
//       messages: [
//         { role: 'system', content: `You are a Senior Dev Assistant. ${contextText}` },
//         ...state.messages.map(m => ({ 
//           role: m._getType() === 'human' ? 'user' : 'assistant', 
//           content: m.content as string 
//         }))
//       ],
//       stream: true, // <--- Enable streaming
//     });
  
//     let fullResponse = "";
    
//     // Iterate over the stream chunks
//     for await (const part of response) {
//       fullResponse += part.message.content;
//       // Note: If you want to see logs in your server terminal as it generates:
//       // process.stdout.write(part.message.content); 
//     }
  
//     // Return the full message to update the Graph State
//     return { 
//       messages: [{ role: 'assistant', content: fullResponse }] 
//     };
//   };