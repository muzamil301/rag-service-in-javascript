import { useState, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export function useAgentStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const streamingContentRef = useRef<string>('');
  const threadId = useMemo(() => uuidv4(), []);

  const streamMessage = async (input: string) => {
    setIsTyping(true);
    setCurrentStep('initializing');
    streamingContentRef.current = '';
    
    // 1. Add User Message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Create initial empty assistant message
    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      const response = await fetch(`http://localhost:3001/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, threadId: threadId }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const jsonStr = line.slice(6); // Remove 'data: ' prefix
            const payload = JSON.parse(jsonStr);
            const nodeName = payload.node;

            // Update the UI based on which Node is running
            if (nodeName) {
              setCurrentStep(nodeName);
            }

            if (nodeName === 'generate') {
              // Extract content from the generate node
              const data = payload.data;
              let stateUpdate = data?.stateUpdate || data;
              
              if (stateUpdate?.messages && Array.isArray(stateUpdate.messages)) {
                const lastMessage = stateUpdate.messages[stateUpdate.messages.length - 1];
                if (lastMessage?.content) {
                  const newContent = typeof lastMessage.content === 'string' 
                    ? lastMessage.content 
                    : String(lastMessage.content);
                  
                  // Only update if content has changed (for word-by-word streaming)
                  if (newContent !== streamingContentRef.current && newContent.length > streamingContentRef.current.length) {
                    streamingContentRef.current = newContent;
                    
                    // Update the assistant message content incrementally
                    setMessages((prev) => {
                      return prev.map((msg) =>
                        msg.id === assistantMsgId
                          ? { ...msg, content: newContent }
                          : msg
                      );
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }

    } catch (error) {
      console.error("Streaming error:", error);
      // Update message with error
      setMessages((prev) => {
        return prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              }
            : msg
        );
      });
    } finally {
      setIsTyping(false);
      setCurrentStep(null);
    }
  };

  const reset = () => {
    setMessages([]);
    setIsTyping(false);
    setCurrentStep(null);
    streamingContentRef.current = '';
  };

  return { messages, isTyping, currentStep, streamMessage, reset };
}