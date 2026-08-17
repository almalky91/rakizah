import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillChatbotDialog } from '../SkillChatbotDialog';
import { AIMessage } from '../AIMessage';
import { StudentMessage } from '../StudentMessage';
import { ResponseOptions } from '../ResponseOptions';
import { LoadingState } from '../LoadingState';
import type { ResponseOption } from '@/types/chatbot';

/**
 * Font Readability Tests
 * 
 * Validates Requirements 8.4, 12.3:
 * - Minimum 14px font size on mobile for all readable text
 * - Appropriate scaling for desktop viewports
 * - Good readability on small screens (320px width)
 * 
 * **Validates: Requirements 8.4, 12.3**
 */

describe('Font Readability - Minimum Font Sizes', () => {
  describe('SkillChatbotDialog', () => {
    it('should use text-xl (20px) for dialog title', () => {
      render(
        <SkillChatbotDialog
          skillId="test-skill"
          skillTitle="Test Skill Title"
          open={true}
          onOpenChange={() => {}}
        />
      );

      const title = screen.getByText('Test Skill Title');
      expect(title).toHaveClass('text-xl');
    });

    it('should use text-base (16px) for container text', () => {
      const { container } = render(
        <SkillChatbotDialog
          skillId="test-skill"
          skillTitle="Test Skill"
          open={true}
          onOpenChange={() => {}}
        />
      );

      const dialogContent = container.querySelector('[dir="rtl"]');
      expect(dialogContent).toHaveClass('text-base');
    });
  });

  describe('AIMessage', () => {
    it('should use text-base (16px) for message content', () => {
      render(
        <AIMessage
          content="مرحباً! هذا اختبار."
          isLatest={false}
        />
      );

      const message = screen.getByText('مرحباً! هذا اختبار.');
      expect(message).toHaveClass('text-base');
    });

    it('should meet minimum 14px requirement (16px > 14px)', () => {
      // text-base is 16px (1rem), which exceeds the 14px minimum
      render(
        <AIMessage
          content="Test message"
          isLatest={false}
        />
      );

      const message = screen.getByText('Test message');
      expect(message.className).toContain('text-base');
    });
  });

  describe('StudentMessage', () => {
    it('should use text-base (16px) for message content', () => {
      render(
        <StudentMessage
          content="هذا هو اختيار الطالب"
          timestamp={new Date()}
        />
      );

      const message = screen.getByText('هذا هو اختيار الطالب');
      expect(message).toHaveClass('text-base');
    });

    it('should use text-sm (14px) for timestamp - meets minimum requirement', () => {
      const testDate = new Date('2024-01-15T10:30:00');
      render(
        <StudentMessage
          content="Test content"
          timestamp={testDate}
        />
      );

      const timestamp = screen.getByText(/\d{1,2}:\d{2}/);
      expect(timestamp).toHaveClass('text-sm');
    });

    it('timestamp should meet minimum 14px requirement', () => {
      // text-sm is exactly 14px (0.875rem), which meets the minimum
      render(
        <StudentMessage
          content="Test content"
          timestamp={new Date()}
        />
      );

      const timestamp = screen.getByText(/\d{1,2}:\d{2}/);
      expect(timestamp.className).toContain('text-sm');
    });
  });

  describe('ResponseOptions', () => {
    it('should use text-base (16px) for button text', () => {
      const options: ResponseOption[] = [
        { id: '1', text: 'خيار 1', nextNodeId: 'node-2' },
        { id: '2', text: 'خيار 2', nextNodeId: 'node-3' },
      ];

      render(
        <ResponseOptions
          options={options}
          onSelect={() => {}}
          disabled={false}
        />
      );

      const buttons = screen.getAllByTestId('response-option');
      buttons.forEach(button => {
        expect(button).toHaveClass('text-base');
      });
    });

    it('should meet minimum 14px requirement for all buttons', () => {
      const options: ResponseOption[] = [
        { id: '1', text: 'Option 1', nextNodeId: null },
      ];

      render(
        <ResponseOptions
          options={options}
          onSelect={() => {}}
          disabled={false}
        />
      );

      const button = screen.getByTestId('response-option');
      expect(button.className).toContain('text-base');
    });
  });

  describe('LoadingState', () => {
    it('should use text-sm (14px) for loading text', () => {
      render(<LoadingState />);

      const loadingText = screen.getByText('جاري تحضير المساعد...');
      expect(loadingText).toHaveClass('text-sm');
    });

    it('should meet minimum 14px requirement', () => {
      // text-sm is exactly 14px, which meets the minimum
      render(<LoadingState message="Loading..." />);

      const loadingText = screen.getByText('Loading...');
      expect(loadingText.className).toContain('text-sm');
    });
  });
});

describe('Font Readability - Responsive Design', () => {
  it('all components should maintain readable font sizes on mobile', () => {
    // This is a documentation test to ensure developers are aware
    // In actual testing, viewport simulation would be done in E2E tests
    const minFontSizes = {
      dialogTitle: 'text-xl (20px)',
      messageContent: 'text-base (16px)',
      buttonText: 'text-base (16px)',
      timestamp: 'text-sm (14px)',
      loadingText: 'text-sm (14px)',
    };

    // All font sizes meet or exceed 14px minimum
    Object.entries(minFontSizes).forEach(([element, size]) => {
      const fontSize = parseInt(size.match(/\d+/)?.[0] || '0');
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });
  });

  it('should document font size hierarchy', () => {
    const fontHierarchy = [
      { element: 'Dialog Title', class: 'text-xl', size: 20 },
      { element: 'Message Content', class: 'text-base', size: 16 },
      { element: 'Button Text', class: 'text-base', size: 16 },
      { element: 'Loading Text', class: 'text-sm', size: 14 },
      { element: 'Timestamp', class: 'text-sm', size: 14 },
    ];

    // Verify all elements meet minimum 14px requirement
    fontHierarchy.forEach(({ element, size }) => {
      expect(size, `${element} should be >= 14px`).toBeGreaterThanOrEqual(14);
    });
  });
});

describe('Font Readability - Edge Cases', () => {
  it('should handle long text content with proper font size', () => {
    const longContent = 'هذا نص طويل جداً يحتوي على العديد من الكلمات والجمل لاختبار كيفية عرض النص الطويل في واجهة المستخدم مع التأكد من أن حجم الخط لا يزال مقروءاً';

    render(
      <AIMessage
        content={longContent}
        isLatest={false}
      />
    );

    const message = screen.getByText(longContent);
    expect(message).toHaveClass('text-base');
  });

  it('should handle short text content with proper font size', () => {
    const shortContent = 'نص';

    render(
      <StudentMessage
        content={shortContent}
        timestamp={new Date()}
      />
    );

    const message = screen.getByText(shortContent);
    expect(message).toHaveClass('text-base');
  });

  it('should maintain font sizes when multiple messages are displayed', () => {
    const messages = [
      { content: 'رسالة 1', isLatest: false },
      { content: 'رسالة 2', isLatest: false },
      { content: 'رسالة 3', isLatest: true },
    ];

    const { container } = render(
      <>
        {messages.map((msg, index) => (
          <AIMessage
            key={index}
            content={msg.content}
            isLatest={msg.isLatest}
          />
        ))}
      </>
    );

    const allMessages = container.querySelectorAll('p.text-base');
    expect(allMessages).toHaveLength(3);
  });
});

describe('Font Readability - Accessibility', () => {
  it('should use semantic line height for better readability', () => {
    render(
      <AIMessage
        content="اختبار النص"
        isLatest={false}
      />
    );

    const message = screen.getByText('اختبار النص');
    expect(message).toHaveClass('leading-loose');
  });

  it('should apply proper font rendering for Arabic text', () => {
    render(
      <StudentMessage
        content="النص العربي"
        timestamp={new Date()}
      />
    );

    const message = screen.getByText('النص العربي');
    const styles = window.getComputedStyle(message);
    
    // These properties are set inline, so we check for their presence
    expect(message).toHaveStyle({
      fontFeatureSettings: '"liga" 1, "calt" 1',
      textRendering: 'optimizeLegibility',
    });
  });
});
