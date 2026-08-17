import { useState, useEffect } from 'react';

/**
 * Options for the useTypewriter hook
 */
export interface UseTypewriterOptions {
  /** The full text to animate */
  text: string;
  /** Whether the typewriter effect is enabled */
  enabled: boolean;
  /** Animation speed in characters per second (default: 40, range: 30-50) */
  speed?: number;
  /** Callback function triggered when animation completes */
  onComplete?: () => void;
}

/**
 * Return value from the useTypewriter hook
 */
export interface UseTypewriterReturn {
  /** The currently displayed portion of the text */
  displayText: string;
  /** Whether the typewriter animation is currently in progress */
  isTyping: boolean;
}

/**
 * Custom React hook for typewriter text animation effect
 * 
 * Animates text character-by-character at a configurable speed.
 * Handles Arabic text with diacritics and ligatures correctly.
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 12.5**
 * 
 * @param options - Configuration options for the typewriter effect
 * @returns Current display text and typing status
 * 
 * @example
 * ```tsx
 * const { displayText, isTyping } = useTypewriter({
 *   text: "مرحباً بك في المساعد",
 *   enabled: true,
 *   speed: 40,
 *   onComplete: () => console.log('Animation complete')
 * });
 * ```
 */
export function useTypewriter({
  text,
  enabled,
  speed = 40,
  onComplete,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // If not enabled or no text, show full text immediately
    if (!enabled || !text) {
      setDisplayText(text);
      setIsTyping(false);
      return;
    }

    // Reset state when starting new animation
    setDisplayText('');
    setIsTyping(true);

    let isMounted = true;
    let currentIndex = 0;
    let animationFrameId: number | null = null;

    /**
     * Gets the next character index, handling Arabic diacritics and ligatures
     * Arabic diacritics (combining marks) should be displayed together with their base character
     */
    const getNextCharacterIndex = (text: string, currentIndex: number): number => {
      if (currentIndex >= text.length) return currentIndex;

      let nextIndex = currentIndex + 1;

      // Handle Arabic diacritics (U+0610 to U+061A, U+064B to U+065F, U+0670, U+06D6 to U+06ED)
      // These should be displayed together with the previous character
      while (nextIndex < text.length) {
        const charCode = text.charCodeAt(nextIndex);
        const isDiacritic = (
          (charCode >= 0x0610 && charCode <= 0x061A) ||
          (charCode >= 0x064B && charCode <= 0x065F) ||
          charCode === 0x0670 ||
          (charCode >= 0x06D6 && charCode <= 0x06ED)
        );

        if (isDiacritic) {
          nextIndex++;
        } else {
          break;
        }
      }

      return nextIndex;
    };

    const animate = () => {
      if (!isMounted) return;

      try {
        if (currentIndex < text.length) {
          // Get next character index, handling diacritics
          const nextIndex = getNextCharacterIndex(text, currentIndex);
          
          // Update displayed text
          setDisplayText(text.slice(0, nextIndex));
          currentIndex = nextIndex;
          
          // Calculate delay based on speed (characters per second)
          const delayMs = 1000 / speed;
          
          // Use setTimeout for the animation loop
          animationFrameId = window.setTimeout(animate, delayMs);
        } else {
          // Animation complete
          setIsTyping(false);
          onComplete?.();
        }
      } catch (error) {
        console.error('[useTypewriter] Animation error:', error);
        // Fallback: show full text immediately
        setDisplayText(text);
        setIsTyping(false);
        onComplete?.();
      }
    };

    // Start animation
    animate();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      if (animationFrameId !== null) {
        clearTimeout(animationFrameId);
      }
    };
  }, [text, enabled, speed, onComplete]);

  return {
    displayText,
    isTyping,
  };
}
