"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ThinkingIndicator from "./ThinkingIndicator";
import styles from "./ChatView.module.css";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  currentStep?: string | null;
  onMenuClick?: () => void;
}

export default function ChatView({
  messages,
  onSendMessage,
  isLoading = false,
  currentStep,
  onMenuClick,
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.chatView}>
      {onMenuClick && (
        <button className={styles.mobileMenuButton} onClick={onMenuClick} aria-label="Open menu">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      )}
      <div ref={chatContainerRef} className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className={styles.emptyStateTitle}>
              How can I help you today?
            </h2>
            <p className={styles.emptyStateSubtitle}>
              Start a conversation by typing a message below
            </p>
            <div className={styles.suggestions}>
              <button
                className={styles.suggestionChip}
                onClick={() => onSendMessage("Explain quantum computing in simple terms")}
              >
                Explain quantum computing in simple terms
              </button>
              <button
                className={styles.suggestionChip}
                onClick={() => onSendMessage("Write a creative story about a robot")}
              >
                Write a creative story about a robot
              </button>
              <button
                className={styles.suggestionChip}
                onClick={() => onSendMessage("Help me plan a weekend trip")}
              >
                Help me plan a weekend trip
              </button>
              <button
                className={styles.suggestionChip}
                onClick={() => onSendMessage("What are the latest trends in AI?")}
              >
                What are the latest trends in AI?
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id || `${message.role}-${message.content.substring(0, 10)}`}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <>
                <ThinkingIndicator />
                {currentStep && (
                  <div className={styles.stepIndicator}>
                    Agent is in step: <span className={styles.stepName}>{currentStep.toUpperCase()}</span>...
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
}

