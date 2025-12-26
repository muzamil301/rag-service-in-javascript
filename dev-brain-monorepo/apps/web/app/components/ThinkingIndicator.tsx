"use client";

import styles from "./ThinkingIndicator.module.css";

export default function ThinkingIndicator() {
  return (
    <div className={styles.thinkingContainer}>
      <div className={styles.thinkingIcon}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className={styles.thinkingText}>
        <span className={styles.thinkingDot}>Thinking</span>
        <span className={styles.thinkingDots}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  );
}

