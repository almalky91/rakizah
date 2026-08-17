import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { useTypewriter } from '@/hooks/useTypewriter';

/**
 * Display AI response messages with typewriter effect.
 * 
 * Props:
 * - content: The message text to display
 * - isLatest: Whether this is the most recent message (triggers typewriter)
 * - onTypingComplete: Callback when typewriter animation finishes
 * - onTypingStatusChange: Callback when typing status changes (true when typing starts, false when it ends)
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 7.3, 11.3, 12.1, 12.2, 12.5**
 * 
 * **Task 20.1: Performance Optimization**
 * - Wrapped in React.memo with custom comparison function
 * - Prevents re-renders when message is no longer the latest
 * - Only re-renders when content or isLatest changes
 */
export interface AIMessageProps {
  content: string;
  isLatest: boolean;
  onTypingComplete?: () => void;
  onTypingStatusChange?: (isTyping: boolean) => void;
}

const AIMessageComponent: React.FC<AIMessageProps> = ({
  content,
  isLatest,
  onTypingComplete,
  onTypingStatusChange,
}) => {
  // Use typewriter effect for latest message
  const { displayText, isTyping } = useTypewriter({
    text: content,
    enabled: isLatest,
    speed: 40, // Default speed: 40 characters per second
    onComplete: onTypingComplete,
  });

  // Notify parent component when typing status changes
  React.useEffect(() => {
    if (isLatest && onTypingStatusChange) {
      onTypingStatusChange(isTyping);
    }
  }, [isTyping, isLatest, onTypingStatusChange]);

  return (
    <div 
      data-testid="ai-message" 
      className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4 rtl:flex-row-reverse rtl:justify-start ltr:flex-row ltr:justify-start"
      role="article"
      aria-label="رسالة من المساعد الذكي"
    >
      {/* AI Avatar/Icon - displayed on the right side for RTL */}
      <div 
        className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center"
        aria-hidden="true"
      >
        <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
      </div>
      
      {/* Message content - right aligned for RTL with optimized Arabic font rendering */}
      <Card className="bg-primary/10 border-primary/20 max-w-[90%] sm:max-w-[85%]">
        <CardContent className="p-3 sm:p-4">
          <p 
            className="rtl:text-right ltr:text-left leading-relaxed sm:leading-loose whitespace-pre-wrap text-sm sm:text-base"
            style={{
              fontFeatureSettings: '"liga" 1, "calt" 1',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              lineHeight: '1.7',
              wordSpacing: '0.05em',
            }}
          >
            {displayText}
            {isTyping && (
              <span 
                className="inline-block w-0.5 h-3 sm:h-4 bg-current animate-pulse rtl:mr-1 ltr:ml-1"
                aria-label="جاري الكتابة"
              />
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Custom comparison function for React.memo
 * Only re-render if content or isLatest changes
 * This prevents unnecessary re-renders of older messages in the conversation
 */
const areEqual = (prevProps: AIMessageProps, nextProps: AIMessageProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.isLatest === nextProps.isLatest
  );
};

/**
 * Memoized AIMessage component to prevent unnecessary re-renders
 * Uses custom comparison to only re-render when content or isLatest changes
 */
export const AIMessage = React.memo(AIMessageComponent, areEqual);
