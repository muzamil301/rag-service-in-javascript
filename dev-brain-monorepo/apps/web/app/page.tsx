"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatView, { Message } from "./components/ChatView";
import { useAgentStream } from "./hooks/use-agent-stream";
import styles from "./page.module.css";

interface Topic {
  id: string;
  title: string;
  preview?: string;
  timestamp?: string;
}

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: "1",
      title: "Getting Started",
      preview: "Hello! How can I help you today?",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      title: "Project Discussion",
      preview: "Let's discuss the project requirements...",
      timestamp: "Yesterday",
    },
  ]);

  const [activeTopicId, setActiveTopicId] = useState<string | undefined>(
    topics[0]?.id
  );

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [
      {
        id: "1",
        role: "assistant",
        content: "Hello! I'm Gemini, your AI assistant. How can I help you today?",
        timestamp: "2 hours ago",
      },
    ],
    "2": [
      {
        id: "1",
        role: "assistant",
        content: "Let's discuss your project. What would you like to know?",
        timestamp: "Yesterday",
      },
    ],
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use the agent stream hook per topic
  const { messages: streamMessages, isTyping, currentStep, streamMessage, reset } = useAgentStream();

  const handleNewChat = useCallback(() => {
    const newTopicId = Date.now().toString();
    const newTopic: Topic = {
      id: newTopicId,
      title: "New Chat",
      timestamp: "Just now",
    };

    setTopics((prev) => [newTopic, ...prev]);
    setActiveTopicId(newTopicId);
    setMessages((prev) => ({
      ...prev,
      [newTopicId]: [],
    }));
    reset(); // Reset the stream hook for new chat
  }, [reset]);

  const handleTopicSelect = useCallback((topicId: string) => {
    setActiveTopicId(topicId);
    // When switching topics, sync the stream messages with the topic's messages
    // The stream hook will be reset when a new message is sent
  }, []);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!activeTopicId) {
        handleNewChat();
        return;
      }

      // Update topic title if it's still "New Chat"
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === activeTopicId && topic.title === "New Chat"
            ? { ...topic, title: message.slice(0, 50), preview: message }
            : topic
        )
      );

      // Use the stream hook to handle the message
      await streamMessage(message);

      // After streaming completes, sync messages to the topic
      // This happens in the useEffect below
    },
    [activeTopicId, handleNewChat, streamMessage]
  );

  // Sync stream messages to the active topic
  useEffect(() => {
    if (activeTopicId && streamMessages.length > 0) {
      // Ensure all messages have IDs
      const messagesWithIds: Message[] = streamMessages.map((msg, idx) => ({
        ...msg,
        id: msg.id || `${Date.now()}-${idx}`,
      }));
      
      setMessages((prev) => ({
        ...prev,
        [activeTopicId]: messagesWithIds,
      }));

      // Update topic preview with the last user message
      const lastUserMessage = [...streamMessages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        setTopics((prev) =>
          prev.map((topic) =>
            topic.id === activeTopicId
              ? {
                  ...topic,
                  preview: lastUserMessage.content.slice(0, 50),
                  timestamp: "Just now",
                }
              : topic
          )
        );
      }
    }
  }, [activeTopicId, streamMessages]);

  // Use stream messages if actively streaming, otherwise use topic messages
  // Ensure all messages have IDs
  const currentMessages = (isTyping && streamMessages.length > 0
    ? streamMessages.map((msg, idx) => ({
        ...msg,
        id: msg.id || `${Date.now()}-${idx}`,
      }))
    : (activeTopicId ? messages[activeTopicId] || [] : [])) as Message[];

  return (
    <div className={styles.container}>
      <Sidebar
        topics={topics}
        activeTopicId={activeTopicId}
        onTopicSelect={handleTopicSelect}
        onNewChat={handleNewChat}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <ChatView
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        isLoading={isTyping}
        currentStep={currentStep}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
}
