import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIMessage } from './AIMessage';
import { StudentMessage } from './StudentMessage';
import type { Message } from '@/types/chatbot';

/**
 * Scrollable container displaying the conversation flow.
 * 
 * This component renders the conversation history with auto-scroll behavior,
 * RTL text direction, and smooth scrolling for better UX.
 * 
 * Props:
 * - messages: Array of conversation messages (AI and student)
 * - isTyping: Whether the AI is currently typing (affects latest message rendering)
 * - onTypingComplete: Optional callback when typewriter effect completes
 * 
 * **Validates: Requirements 7.1, 7.5, 12.2**
 */
export interface ConversationHistoryProps {
  messages: Message[];
  isTyping: boolean;
  onTypingComplete?: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  isTyping,
  onTypingComplete,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message when messages change
  // Task 10.3: Implement auto-scroll functionality
  // - Add ref to ConversationHistory container ✓
  // - Create scrollToBottom function using scrollIntoView ✓
  // - Trigger scroll when new message is added ✓
  // - Use smooth scroll behavior ✓
  // - Handle edge case where scroll area isn't ready (requestAnimationFrame) ✓
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    // This handles the edge case where scroll area isn't ready
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
      });
    });
  }, [messages, isTyping]);

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="h-[350px] sm:h-[450px] md:h-[500px] px-3 sm:px-4"
      dir="rtl"
    >
      {/* 
        Aria-live region for screen reader announcements
        Task 20.3: Add aria-live region for dynamic content updates
        - aria-live="polite": Announces new messages without interrupting
        - aria-atomic="false": Only announces changes, not entire region
        - role="log": Indicates sequential information updates
      */}
      <div 
        className="space-y-1.5 sm:space-y-2 py-3 sm:py-4" 
        dir="rtl"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
      >
        {messages.map((message, index) => {
          const isLatest = index === messages.length - 1;
          
          if (message.role === 'ai') {
            return (
              <AIMessage
                key={message.id}
                content={message.content}
                isLatest={isLatest && isTyping}
                onTypingComplete={onTypingComplete}
              />
            );
          } else {
            return (
              <StudentMessage
                key={message.id}
                content={message.content}
                timestamp={message.timestamp}
              />
            );
          }
        })}
        
        {/* Invisible anchor for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
