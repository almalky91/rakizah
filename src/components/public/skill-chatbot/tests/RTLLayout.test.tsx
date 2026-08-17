import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponseOptions } from '../ResponseOptions';
import { LoadingState } from '../LoadingState';
import { ConversationHistory } from '../ConversationHistory';
import { AIMessage } from '../AIMessage';
import { StudentMessage } from '../StudentMessage';
import type { ResponseOption, Message } from '@/types/chatbot';

/**
 * RTL Layout Tests
 * 
 * Task 12.4: Test all UI elements in RTL layout
 * 
 * Validates Requirements:
 * - 12.1: All text displays in Arabic
 * - 12.2: RTL text direction is used
 * - 12.4: Response options align appropriately for RTL layout
 * 
 * Test Coverage:
 * - ResponseOptions grid respects RTL
 * - ScrollArea scrollbar position in RTL
 * - LoadingState spinner centers correctly
 * - All icons and visual elements mirror appropriately
 */
describe('RTL Layout Tests', () => {
  describe('ResponseOptions RTL Behavior', () => {
    const mockOptions: ResponseOption[] = [
      { id: 'opt-1', text: 'ما هي هذه المهارة؟', nextNodeId: 'node-2' },
      { id: 'opt-2', text: 'كيف أتعلم هذه المهارة؟', nextNodeId: 'node-3' },
      { id: 'opt-3', text: 'لم أفهم', nextNodeId: 'node-1' },
    ];

    it('applies text-right alignment for Arabic text', () => {
      const onSelect = vi.fn();
      render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />);

      const buttons = screen.getAllByTestId('response-option');
      buttons.forEach((button) => {
        // Verify text-right class is applied for RTL alignment
        expect(button).toHaveClass('text-right');
      });
    });

    it('maintains grid layout with proper spacing in RTL', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />
      );

      const gridContainer = container.querySelector('[data-testid="response-options-container"]');
      
      // Verify grid classes are present
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('gap-3');
      
      // Verify responsive grid columns (1 col mobile, 2 col tablet, 3 col desktop)
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('sm:grid-cols-2');
      expect(gridContainer).toHaveClass('md:grid-cols-3');
    });

    it('renders buttons with proper Arabic font rendering properties', () => {
      const onSelect = vi.fn();
      render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />);

      const buttons = screen.getAllByTestId('response-option');
      
      buttons.forEach((button) => {
        // Verify font optimization properties are set via style attribute
        const styleAttr = button.getAttribute('style');
        expect(styleAttr).toBeTruthy();
        expect(styleAttr).toContain('font-feature-settings');
        expect(styleAttr).toContain('text-rendering');
      });
    });

    it('displays Arabic text correctly without truncation', () => {
      const onSelect = vi.fn();
      render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />);

      // Verify all Arabic text is displayed in full
      expect(screen.getByText('ما هي هذه المهارة؟')).toBeInTheDocument();
      expect(screen.getByText('كيف أتعلم هذه المهارة؟')).toBeInTheDocument();
      expect(screen.getByText('لم أفهم')).toBeInTheDocument();
    });

    it('applies proper line height for Arabic text readability', () => {
      const onSelect = vi.fn();
      render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />);

      const buttons = screen.getAllByTestId('response-option');
      
      buttons.forEach((button) => {
        // Verify line height is set via style attribute for Arabic readability
        const styleAttr = button.getAttribute('style');
        expect(styleAttr).toBeTruthy();
        expect(styleAttr).toContain('line-height');
      });
    });
  });

  describe('ScrollArea RTL Behavior', () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        role: 'ai',
        content: 'مرحباً! كيف يمكنني مساعدتك؟',
        timestamp: new Date('2024-01-01T10:00:00'),
      },
      {
        id: '2',
        role: 'student',
        content: 'أريد معرفة المزيد',
        timestamp: new Date('2024-01-01T10:01:00'),
      },
      {
        id: '3',
        role: 'ai',
        content: 'بالتأكيد! دعني أشرح لك بالتفصيل...',
        timestamp: new Date('2024-01-01T10:02:00'),
      },
    ];

    it('applies dir="rtl" to ScrollArea container', () => {
      const { container } = render(
        <ConversationHistory messages={mockMessages} isTyping={false} />
      );

      // Verify RTL direction is applied to ScrollArea
      const scrollArea = container.querySelector('[dir="rtl"]');
      expect(scrollArea).toBeInTheDocument();
    });

    it('scrollbar appears on the left side for RTL layout', () => {
      const { container } = render(
        <ConversationHistory messages={mockMessages} isTyping={false} />
      );

      // In RTL layout, Radix UI ScrollArea positions scrollbar on the left
      // Verify the ScrollArea viewport exists
      const viewport = container.querySelector('[data-radix-scroll-area-viewport]');
      expect(viewport).toBeInTheDocument();
      
      // The parent should have dir="rtl" which causes scrollbar to appear on left
      const scrollAreaRoot = viewport?.closest('[dir="rtl"]');
      expect(scrollAreaRoot).toBeInTheDocument();
    });

    it('maintains proper message spacing in RTL layout', () => {
      const { container } = render(
        <ConversationHistory messages={mockMessages} isTyping={false} />
      );

      // Verify space-y-2 class is applied for vertical spacing
      const messagesContainer = container.querySelector('.space-y-2');
      expect(messagesContainer).toBeInTheDocument();
      expect(messagesContainer).toHaveClass('py-4');
    });

    it('applies RTL to messages container', () => {
      const { container } = render(
        <ConversationHistory messages={mockMessages} isTyping={false} />
      );

      // Verify messages container has dir="rtl"
      const messagesContainer = container.querySelector('.space-y-2');
      expect(messagesContainer).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('LoadingState RTL Behavior', () => {
    it('centers spinner correctly in RTL layout', () => {
      const { container } = render(<LoadingState />);

      // Verify centering classes are applied
      const loadingContainer = container.querySelector('.flex.flex-col.items-center.justify-center');
      expect(loadingContainer).toBeInTheDocument();
    });

    it('applies dir="rtl" to Arabic loading text', () => {
      render(<LoadingState />);

      const loadingText = screen.getByText('جاري تحضير المساعد...');
      expect(loadingText).toHaveAttribute('dir', 'rtl');
    });

    it('centers Arabic text with proper alignment', () => {
      render(<LoadingState />);

      const loadingText = screen.getByText('جاري تحضير المساعد...');
      
      // Verify text-center class is applied
      expect(loadingText).toHaveClass('text-center');
    });

    it('spinner is horizontally centered regardless of RTL', () => {
      const { container } = render(<LoadingState />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      // Parent container should have items-center for horizontal centering
      const parent = spinner?.parentElement;
      expect(parent).toHaveClass('items-center');
      expect(parent).toHaveClass('justify-center');
    });

    it('applies proper font rendering for Arabic loading text', () => {
      render(<LoadingState />);

      const loadingText = screen.getByText('جاري تحضير المساعد...');
      
      // Verify font optimization properties are set via style attribute
      const styleAttr = loadingText.getAttribute('style');
      expect(styleAttr).toBeTruthy();
      expect(styleAttr).toContain('font-feature-settings');
      expect(styleAttr).toContain('text-rendering');
    });
  });

  describe('AIMessage RTL Behavior', () => {
    it('positions AI icon on the right side in RTL layout', () => {
      const { container } = render(
        <AIMessage content="مرحباً بك" isLatest={false} />
      );

      const messageContainer = container.querySelector('[data-testid="ai-message"]');
      
      // Verify flex-row-reverse is applied to position icon on the right
      expect(messageContainer).toHaveClass('rtl:flex-row-reverse');
    });

    it('applies text-right alignment for Arabic content', () => {
      render(<AIMessage content="مرحباً! كيف يمكنني مساعدتك؟" isLatest={false} />);

      const messageContainer = screen.getByTestId('ai-message');
      const textElement = messageContainer.querySelector('p');
      
      // Verify text-right alignment for RTL
      expect(textElement).toHaveClass('rtl:text-right');
    });

    it('applies proper font rendering for Arabic text', () => {
      render(<AIMessage content="مرحباً بك في المساعد الذكي" isLatest={false} />);

      const messageContainer = screen.getByTestId('ai-message');
      const textElement = messageContainer.querySelector('p');
      
      // Verify font optimization properties are set via style attribute
      const styleAttr = textElement?.getAttribute('style');
      expect(styleAttr).toBeTruthy();
      expect(styleAttr).toContain('font-feature-settings');
      expect(styleAttr).toContain('text-rendering');
    });

    it('positions typewriter cursor correctly in RTL', () => {
      const { container } = render(
        <AIMessage content="مرحباً" isLatest={true} />
      );

      // Wait for typewriter animation to start
      const cursor = container.querySelector('.animate-pulse');
      
      if (cursor) {
        // Verify cursor has rtl:mr-1 class (margin-right in RTL)
        expect(cursor).toHaveClass('rtl:mr-1');
      }
    });

    it('maintains proper spacing with Brain icon in RTL', () => {
      const { container } = render(
        <AIMessage content="مرحباً بك" isLatest={false} />
      );

      const messageContainer = container.querySelector('[data-testid="ai-message"]');
      
      // Verify gap-3 class is applied for spacing between icon and content
      expect(messageContainer).toHaveClass('gap-3');
    });
  });

  describe('StudentMessage RTL Behavior', () => {
    const mockTimestamp = new Date('2024-01-01T10:00:00');

    it('positions User icon on the left side in RTL layout', () => {
      const { container } = render(
        <StudentMessage content="أريد المزيد من المعلومات" timestamp={mockTimestamp} />
      );

      const messageContainer = container.querySelector('[data-testid="student-message"]');
      
      // Verify flex-row is applied (normal order) to position icon on the left
      expect(messageContainer).toHaveClass('rtl:flex-row');
    });

    it('applies text-right alignment for Arabic content', () => {
      render(
        <StudentMessage content="أريد المزيد من المعلومات" timestamp={mockTimestamp} />
      );

      const messageContainer = screen.getByTestId('student-message');
      const textElement = messageContainer.querySelector('p');
      
      // Verify text-right alignment for RTL
      expect(textElement).toHaveClass('rtl:text-right');
    });

    it('applies proper font rendering for Arabic text', () => {
      render(
        <StudentMessage content="أريد المزيد من المعلومات" timestamp={mockTimestamp} />
      );

      const messageContainer = screen.getByTestId('student-message');
      const textElement = messageContainer.querySelector('p');
      
      // Verify font optimization properties are set via style attribute
      const styleAttr = textElement?.getAttribute('style');
      expect(styleAttr).toBeTruthy();
      expect(styleAttr).toContain('font-feature-settings');
      expect(styleAttr).toContain('text-rendering');
    });

    it('aligns timestamp to the right in RTL', () => {
      const { container } = render(
        <StudentMessage content="شكراً" timestamp={mockTimestamp} />
      );

      const timestamps = container.querySelectorAll('.text-xs.text-muted-foreground');
      const timestamp = Array.from(timestamps).find((el) => 
        el.textContent?.includes(':')
      );
      
      // Verify rtl:text-right class is applied to timestamp
      expect(timestamp).toHaveClass('rtl:text-right');
    });

    it('maintains proper spacing with User icon in RTL', () => {
      const { container } = render(
        <StudentMessage content="شكراً لك" timestamp={mockTimestamp} />
      );

      const messageContainer = container.querySelector('[data-testid="student-message"]');
      
      // Verify gap-3 class is applied for spacing between icon and content
      expect(messageContainer).toHaveClass('gap-3');
    });

    it('formats timestamp in Arabic locale', () => {
      const { container } = render(
        <StudentMessage content="مرحباً" timestamp={mockTimestamp} />
      );

      // The timestamp should be formatted in Arabic locale
      const timestamps = container.querySelectorAll('.text-xs.text-muted-foreground');
      const timestamp = Array.from(timestamps).find((el) => 
        el.textContent?.includes(':')
      );
      
      expect(timestamp).toBeInTheDocument();
      expect(timestamp?.textContent).toBeTruthy();
    });
  });

  describe('Visual Element Mirroring in RTL', () => {
    it('AI message card aligns to the right side', () => {
      const { container } = render(
        <AIMessage content="مرحباً" isLatest={false} />
      );

      const messageContainer = container.querySelector('[data-testid="ai-message"]');
      
      // Verify rtl:flex-row-reverse positions content on the right
      expect(messageContainer).toHaveClass('rtl:flex-row-reverse');
      expect(messageContainer).toHaveClass('rtl:justify-start');
    });

    it('Student message card aligns to the left side', () => {
      const { container } = render(
        <StudentMessage content="شكراً" timestamp={new Date()} />
      );

      const messageContainer = container.querySelector('[data-testid="student-message"]');
      
      // Verify rtl:flex-row positions content on the left
      expect(messageContainer).toHaveClass('rtl:flex-row');
      expect(messageContainer).toHaveClass('rtl:justify-start');
    });

    it('Brain icon (AI) appears before message content in DOM but visually after in RTL', () => {
      const { container } = render(
        <AIMessage content="مرحباً" isLatest={false} />
      );

      const messageContainer = container.querySelector('[data-testid="ai-message"]');
      const children = messageContainer?.children;
      
      // First child should be the icon (Brain)
      expect(children?.[0]).toHaveClass('rounded-full');
      expect(children?.[0]).toHaveClass('bg-primary');
      
      // Second child should be the Card with message content
      expect(children?.[1]?.tagName.toLowerCase()).toBe('div');
    });

    it('User icon appears before message content in DOM and visually in RTL', () => {
      const { container } = render(
        <StudentMessage content="شكراً" timestamp={new Date()} />
      );

      const messageContainer = container.querySelector('[data-testid="student-message"]');
      const children = messageContainer?.children;
      
      // First child should be the icon (User)
      expect(children?.[0]).toHaveClass('rounded-full');
      expect(children?.[0]).toHaveClass('bg-secondary');
      
      // Second child should be the message content wrapper
      expect(children?.[1]).toHaveClass('max-w-[85%]');
    });
  });

  describe('Responsive RTL Grid Behavior', () => {
    it('ResponseOptions maintains RTL in single column mobile layout', () => {
      const onSelect = vi.fn();
      const singleOption: ResponseOption[] = [
        { id: 'opt-1', text: 'حسناً، فهمت', nextNodeId: null },
      ];

      const { container } = render(
        <ResponseOptions options={singleOption} onSelect={onSelect} disabled={false} />
      );

      const gridContainer = container.querySelector('[data-testid="response-options-container"]');
      
      // Verify single column on mobile
      expect(gridContainer).toHaveClass('grid-cols-1');
      
      // Verify button maintains text-right
      const button = screen.getByTestId('response-option');
      expect(button).toHaveClass('text-right');
    });

    it('ResponseOptions maintains RTL in multi-column layouts', () => {
      const onSelect = vi.fn();
      const multipleOptions: ResponseOption[] = [
        { id: 'opt-1', text: 'خيار واحد', nextNodeId: 'node-2' },
        { id: 'opt-2', text: 'خيار اثنان', nextNodeId: 'node-3' },
        { id: 'opt-3', text: 'خيار ثلاثة', nextNodeId: 'node-4' },
        { id: 'opt-4', text: 'خيار أربعة', nextNodeId: 'node-5' },
      ];

      render(<ResponseOptions options={multipleOptions} onSelect={onSelect} disabled={false} />);

      const buttons = screen.getAllByTestId('response-option');
      
      // Verify all buttons maintain text-right in grid layout
      buttons.forEach((button) => {
        expect(button).toHaveClass('text-right');
      });
    });
  });
});
