"use client";

import { useState } from "react";
import styles from "./Sidebar.module.css";

interface Topic {
  id: string;
  title: string;
  preview?: string;
  timestamp?: string;
}

interface SidebarProps {
  topics: Topic[];
  activeTopicId?: string;
  onTopicSelect: (topicId: string) => void;
  onNewChat: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  topics,
  activeTopicId,
  onTopicSelect,
  onNewChat,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTopicClick = (topicId: string) => {
    onTopicSelect(topicId);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {isMobileOpen && <div className={styles.overlay} onClick={onMobileClose} />}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isMobileOpen ? styles.mobileOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          {!isCollapsed && (
            <button className={styles.newChatButton} onClick={handleNewChatClick}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>New chat</span>
          </button>
        )}
        <button
          className={styles.collapseButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isCollapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className={styles.topicsList}>
          {topics.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No conversations yet</p>
              <p className={styles.emptyStateSubtext}>
                Start a new chat to begin
              </p>
            </div>
          ) : (
            topics.map((topic) => (
              <button
                key={topic.id}
                className={`${styles.topicItem} ${
                  activeTopicId === topic.id ? styles.active : ""
                }`}
                onClick={() => handleTopicClick(topic.id)}
              >
                <div className={styles.topicIcon}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className={styles.topicContent}>
                  <div className={styles.topicTitle}>{topic.title}</div>
                  {topic.preview && (
                    <div className={styles.topicPreview}>{topic.preview}</div>
                  )}
                  {topic.timestamp && (
                    <div className={styles.topicTimestamp}>{topic.timestamp}</div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </aside>
    </>
  );
}

