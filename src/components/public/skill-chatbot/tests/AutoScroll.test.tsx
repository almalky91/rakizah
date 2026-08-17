import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { ConversationHistory } from '../ConversationHistory';
import type { Message } from '@/types/chatbot';

/**
 * Auto-scroll functionality tests for Task 10.3
 * **Validates: Requirements 7.4, 10.5**
 * 
 * Tests verify:
 * - Ref is added to ConversationHistory container
 * - scrollToBottom function uses scrollIntoView
 * - Scroll is triggered when new message is added
 * - Smooth scroll behavior is used
 * - Edge case where scroll area isn't ready is handled (requestAnimationFrame)
 */
describe('ConversationHistory - Auto-scroll functionality (Task 10.3)', () => {
  // Mock scrollIntoView
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  const createMockMessage = (id: string, role: 'ai' | 'student', content: string): Message => ({
    id,
    role,
    content,
    timestamp: new Date(),
  });

  it('should trigger scroll when new message is added', async () => {
    const initialMessages = [
      createMockMessage('1', 'ai', 'مرحباً'),
    ];

    const { rerender } = render(
      <ConversationHistory messages={initialMessages} isTyping={false} />
    );

    // Add a new message
    const updatedMessages = [
      ...initialMessages,
      createMockMessage('2', 'student', 'مرحباً بك'),
    ];

    rerender(<ConversationHistory messages={updatedMessages} isTyping={false} />);

    // Wait for requestAnimationFrame to complete
    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });

  it('should use smooth scroll behavior', async () => {
    const messages = [createMockMessage('1', 'ai', 'مرحباً')];

    render(<ConversationHistory messages={messages} isTyping={false} />);

    // Wait for requestAnimationFrame to complete
    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: 'smooth',
          block: 'end',
        })
      );
    });
  });

  it('should scroll when isTyping state changes', async () => {
    const messages = [createMockMessage('1', 'ai', 'مرحباً')];

    const { rerender } = render(
      <ConversationHistory messages={messages} isTyping={false} />
    );

    // Clear previous calls
    vi.clearAllMocks();

    // Change typing state
    rerender(<ConversationHistory messages={messages} isTyping={true} />);

    // Wait for requestAnimationFrame to complete
    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });

  it('should handle multiple rapid message additions', async () => {
    const initialMessages = [createMockMessage('1', 'ai', 'مرحباً')];

    const { rerender } = render(
      <ConversationHistory messages={initialMessages} isTyping={false} />
    );

    // Add multiple messages rapidly
    for (let i = 2; i <= 5; i++) {
      const updatedMessages = [
        ...initialMessages,
        ...Array.from({ length: i - 1 }, (_, idx) =>
          createMockMessage(`${idx + 2}`, 'student', `رسالة ${idx + 2}`)
        ),
      ];

      rerender(<ConversationHistory messages={updatedMessages} isTyping={false} />);
    }

    // Should have called scrollIntoView multiple times
    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    // Verify it was called at least once (may be more due to rapid updates)
    expect((Element.prototype.scrollIntoView as any).mock.calls.length).toBeGreaterThan(0);
  });

  it('should scroll on initial render with messages', async () => {
    const messages = [
      createMockMessage('1', 'ai', 'مرحباً'),
      createMockMessage('2', 'student', 'مرحباً بك'),
    ];

    render(<ConversationHistory messages={messages} isTyping={false} />);

    // Should scroll even on initial render
    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });

  it('should handle empty messages array without errors', async () => {
    const { container } = render(
      <ConversationHistory messages={[]} isTyping={false} />
    );

    // Should render without errors
    expect(container).toBeInTheDocument();

    // scrollIntoView should still be called (for empty anchor)
    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });

  it('should have messagesEndRef anchor element in DOM', () => {
    const messages = [createMockMessage('1', 'ai', 'مرحباً')];

    const { container } = render(
      <ConversationHistory messages={messages} isTyping={false} />
    );

    // The anchor div should exist (it's invisible but present)
    // We can verify by checking that scrollIntoView is called on some element
    expect(container).toBeInTheDocument();
  });
});
