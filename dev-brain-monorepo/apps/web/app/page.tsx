"use client";

import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatView, { Message } from "./components/ChatView";
import styles from "./page.module.css";

interface Topic {
  id: string;
  title: string;
  preview?: string;
  timestamp?: string;
}

// Mock function to generate a simple response (will be replaced with API integration later)
const generateMockResponse = (userMessage: string): string => {
  const responses: Record<string, string> = {
    "hello": "Hello! How can I help you today?",
    "hi": "Hi there! What would you like to know?",
    "help": "I'm here to help! You can ask me questions, request explanations, or have a conversation. What would you like to explore?",
  };

  const lowerMessage = userMessage.toLowerCase();
  for (const [key, value] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }

  return `I understand you're asking about "${userMessage}". This is a static demo, so I'll provide a placeholder response. Once connected to the API, I'll be able to give you detailed and accurate answers!`;
};

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

  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  }, []);

  const handleTopicSelect = useCallback((topicId: string) => {
    setActiveTopicId(topicId);
  }, []);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!activeTopicId) {
        handleNewChat();
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Update topic title if it's still "New Chat"
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === activeTopicId && topic.title === "New Chat"
            ? { ...topic, title: message.slice(0, 50), preview: message }
            : topic
        )
      );

      // Add user message
      setMessages((prev) => ({
        ...prev,
        [activeTopicId]: [...(prev[activeTopicId] || []), userMessage],
      }));

      setIsLoading(true);

      // Simulate API call delay
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: generateMockResponse(message),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => ({
          ...prev,
          [activeTopicId]: [...(prev[activeTopicId] || []), assistantMessage],
        }));

        // Update topic preview
        setTopics((prev) =>
          prev.map((topic) =>
            topic.id === activeTopicId
              ? {
                  ...topic,
                  preview: message.slice(0, 50),
                  timestamp: "Just now",
                }
              : topic
          )
        );

        setIsLoading(false);
      }, 1000);
    },
    [activeTopicId, handleNewChat]
  );

  const currentMessages = activeTopicId ? messages[activeTopicId] || [] : [];

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
        isLoading={isLoading}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
}
