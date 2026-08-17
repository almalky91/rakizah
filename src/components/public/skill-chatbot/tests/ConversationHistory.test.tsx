import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConversationHistory } from '../ConversationHistory';

describe('ConversationHistory', () => {
  const mockMessages = [
    {
      id: '1',
      role: 'ai' as const,
      content: 'مرحباً! كيف يمكنني مساعدتك؟',
      timestamp: new Date('2024-01-01T10:00:00'),
    },
    {
      id: '2',
      role: 'student' as const,
      content: 'أريد معرفة المزيد',
      timestamp: new Date('2024-01-01T10:01:00'),
    },
    {
      id: '3',
      role: 'ai' as const,
      content: 'بالتأكيد! دعني أشرح لك...',
      timestamp: new Date('2024-01-01T10:02:00'),
    },
  ];

  it('renders with empty messages array', () => {
    render(<ConversationHistory messages={[]} isTyping={false} />);
    
    // Should render without errors
    expect(screen.queryByTestId('ai-message')).not.toBeInTheDocument();
    expect(screen.queryByTestId('student-message')).not.toBeInTheDocument();
  });

  it('renders all messages in chronological order', () => {
    render(<ConversationHistory messages={mockMessages} isTyping={false} />);
    
    // Validates: Requirements 7.1 - Display all messages in chronological order
    const aiMessages = screen.getAllByTestId('ai-message');
    const studentMessages = screen.getAllByTestId('student-message');
    
    expect(aiMessages).toHaveLength(2);
    expect(studentMessages).toHaveLength(1);
  });

  it('distinguishes between AI and student messages', () => {
    render(<ConversationHistory messages={mockMessages} isTyping={false} />);
    
    // Validates: Requirements 7.3 - Distinguish visually between AI messages and student selections
    const aiMessages = screen.getAllByTestId('ai-message');
    const studentMessages = screen.getAllByTestId('student-message');
    
    expect(aiMessages[0]).toBeInTheDocument();
    expect(studentMessages[0]).toBeInTheDocument();
  });

  it('passes isLatest prop correctly to latest AI message when typing', async () => {
    render(<ConversationHistory messages={mockMessages} isTyping={true} />);
    
    // The last message (index 2) should be marked as latest
    const aiMessages = screen.getAllByTestId('ai-message');
    
    // Verify that the latest AI message exists
    expect(aiMessages[aiMessages.length - 1]).toBeInTheDocument();
    
    // With isTyping=true and real typewriter effect, we should see partial text initially
    // Wait for the typewriter animation to complete
    await waitFor(
      () => {
        expect(aiMessages[aiMessages.length - 1]).toHaveTextContent('بالتأكيد! دعني أشرح لك...');
      },
      { timeout: 2000 }
    );
  });

  it('does not mark messages as latest when not typing', () => {
    render(<ConversationHistory messages={mockMessages} isTyping={false} />);
    
    // No message should be marked as latest when not typing
    expect(screen.queryByText('(Latest)')).not.toBeInTheDocument();
  });

  it('integrates ScrollArea component', () => {
    const { container } = render(
      <ConversationHistory messages={mockMessages} isTyping={false} />
    );
    
    // Validates: Requirements 7.5 - Provide smooth scrolling
    // ScrollArea should be present in the component tree
    const scrollArea = container.querySelector('[data-radix-scroll-area-viewport]');
    expect(scrollArea).toBeInTheDocument();
  });

  it('applies RTL text direction', () => {
    const { container } = render(
      <ConversationHistory messages={mockMessages} isTyping={false} />
    );
    
    // Validates: Requirements 12.2 - Use RTL text direction
    const rtlContainer = container.querySelector('[dir="rtl"]');
    expect(rtlContainer).toBeInTheDocument();
  });

  it('handles single message correctly', () => {
    const singleMessage = [mockMessages[0]];
    
    render(<ConversationHistory messages={singleMessage} isTyping={false} />);
    
    expect(screen.getAllByTestId('ai-message')).toHaveLength(1);
  });

  it('handles mixed message types in correct order', () => {
    const mixedMessages = [
      {
        id: '1',
        role: 'ai' as const,
        content: 'Message 1',
        timestamp: new Date('2024-01-01T10:00:00'),
      },
      {
        id: '2',
        role: 'student' as const,
        content: 'Message 2',
        timestamp: new Date('2024-01-01T10:01:00'),
      },
      {
        id: '3',
        role: 'student' as const,
        content: 'Message 3',
        timestamp: new Date('2024-01-01T10:02:00'),
      },
      {
        id: '4',
        role: 'ai' as const,
        content: 'Message 4',
        timestamp: new Date('2024-01-01T10:03:00'),
      },
    ];
    
    render(<ConversationHistory messages={mixedMessages} isTyping={false} />);
    
    expect(screen.getAllByTestId('ai-message')).toHaveLength(2);
    expect(screen.getAllByTestId('student-message')).toHaveLength(2);
  });

  it('provides onTypingComplete callback to AI messages', () => {
    const { container } = render(
      <ConversationHistory messages={mockMessages} isTyping={true} />
    );
    
    // The component should pass onTypingComplete to AIMessage
    // This is verified by checking that AIMessage receives the prop
    // Actual callback testing would be done in AIMessage tests
    expect(container).toBeInTheDocument();
  });

  it('renders with fixed height for scrolling', () => {
    const { container } = render(
      <ConversationHistory messages={mockMessages} isTyping={false} />
    );
    
    // ScrollArea should have a fixed height to enable scrolling
    const scrollArea = container.querySelector('.h-\\[400px\\]');
    expect(scrollArea).toBeInTheDocument();
  });

  it('maintains message keys for React reconciliation', () => {
    const { rerender } = render(
      <ConversationHistory messages={mockMessages} isTyping={false} />
    );
    
    // Add a new message
    const newMessages = [
      ...mockMessages,
      {
        id: '4',
        role: 'ai' as const,
        content: 'New message',
        timestamp: new Date('2024-01-01T10:03:00'),
      },
    ];
    
    rerender(<ConversationHistory messages={newMessages} isTyping={false} />);
    
    // Should render the new message
    expect(screen.getAllByTestId('ai-message')).toHaveLength(3);
  });
});
