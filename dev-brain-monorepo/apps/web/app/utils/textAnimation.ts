/**
 * Utility to animate text word by word
 * Used as a fallback when full message arrives at once
 */

export function animateTextWordByWord(
  fullText: string,
  currentText: string,
  onUpdate: (text: string) => void,
  speed: number = 30 // milliseconds per word
): () => void {
  const words = fullText.split(' ');
  const currentWords = currentText.split(' ');
  
  // Start from where we left off
  let wordIndex = currentWords.length;
  
  const interval = setInterval(() => {
    if (wordIndex >= words.length) {
      clearInterval(interval);
      return;
    }
    
    const newText = words.slice(0, wordIndex + 1).join(' ');
    onUpdate(newText);
    wordIndex++;
  }, speed);
  
  return () => clearInterval(interval);
}

