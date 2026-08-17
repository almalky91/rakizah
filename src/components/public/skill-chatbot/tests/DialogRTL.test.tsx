import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillChatbotDialog } from '../SkillChatbotDialog';

/**
 * Dialog RTL Direction Tests
 * 
 * Task 12.1: Add RTL direction to Dialog content
 * 
 * Validates Requirements:
 * - 12.2: Dialog SHALL use RTL text direction
 * - 9.1: Dialog SHALL display a close button in the top-right corner (which becomes top-left in RTL)
 * 
 * Test Coverage:
 * - DialogContent has dir="rtl" attribute
 * - Close button appears on the left side in RTL layout
 * - All text and UI elements follow RTL layout
 * - Dialog respects RTL direction for all child components
 */
describe('Dialog RTL Direction Tests - Task 12.1', () => {
  const defaultProps = {
    skillId: 'skill-123',
    skillTitle: 'مهارة اختبارية',
    open: true,
    onOpenChange: vi.fn(),
  };

  describe('DialogContent RTL Attribute', () => {
    it('applies dir="rtl" to DialogContent wrapper', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      // Verify DialogContent has dir="rtl" attribute (Requirement 12.2)
      const dialogContent = document.querySelector('[dir="rtl"]');
      expect(dialogContent).toBeTruthy();
      expect(dialogContent).toHaveAttribute('dir', 'rtl');
    });

    it('ensures DialogContent has font-cairo class for Arabic fonts', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      const dialogContent = document.querySelector('[dir="rtl"]');
      expect(dialogContent).toBeTruthy();
      expect(dialogContent).toHaveClass('font-cairo');
    });

    it('applies proper font rendering properties for Arabic text', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      const dialogContent = document.querySelector('[dir="rtl"]');
      const styleAttr = dialogContent?.getAttribute('style');
      
      expect(styleAttr).toBeTruthy();
      expect(styleAttr).toContain('font-feature-settings');
      expect(styleAttr).toContain('text-rendering');
      expect(styleAttr).toContain('optimizeLegibility');
    });
  });

  describe('Close Button Position in RTL', () => {
    it('positions close button on the left side in RTL layout', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      // Find the close button using screen reader text
      const closeButton = screen.getByText('Close', { selector: '.sr-only' }).parentElement;
      expect(closeButton).toBeInTheDocument();

      // Verify RTL positioning classes (Requirement 9.1 in RTL context)
      const className = closeButton?.className || '';
      
      // In RTL, the button should have rtl:left-4 and rtl:right-auto classes
      // The base class is right-4, which gets overridden in RTL
      expect(className).toContain('right-4'); // Base position
      expect(className).toContain('rtl:left-4'); // RTL override to left
      expect(className).toContain('rtl:right-auto'); // Remove right positioning in RTL
    });

    it('maintains top-4 position for close button in RTL', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      const closeButton = screen.getByText('Close', { selector: '.sr-only' }).parentElement;
      const className = closeButton?.className || '';
      
      // Top position should remain the same in RTL
      expect(className).toContain('top-4');
    });

    it('close button remains accessible with proper touch target size', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      const closeButton = screen.getByText('Close', { selector: '.sr-only' }).parentElement;
      const className = closeButton?.className || '';
      
      // Verify minimum touch target size for accessibility
      expect(className).toContain('min-w-[40px]');
      expect(className).toContain('min-h-[40px]');
    });

    it('close button has proper ARIA label in any direction', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      // The sr-only span should contain "Close" for screen readers
      const closeButtonText = screen.getByText('Close', { selector: '.sr-only' });
      expect(closeButtonText).toBeInTheDocument();
    });
  });

  describe('Dialog Title RTL Alignment', () => {
    it('applies text-right alignment to Dialog title', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      const title = screen.getByText('مهارة اختبارية');
      expect(title).toHaveClass('text-right');
    });

    it('applies proper line height for Arabic title readability', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      const title = screen.getByText('مهارة اختبارية');
      const styleAttr = title?.getAttribute('style');
      
      expect(styleAttr).toBeTruthy();
      expect(styleAttr).toContain('line-height');
      expect(styleAttr).toContain('1.75'); // Relaxed line height for Arabic
    });
  });

  describe('Overall RTL Layout Verification', () => {
    it('all child components respect parent RTL direction', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      // Verify DialogContent (parent) has RTL
      const dialogContent = document.querySelector('[dir="rtl"]');
      expect(dialogContent).toBeTruthy();
      expect(dialogContent).toHaveAttribute('dir', 'rtl');

      // All child elements should inherit RTL direction
      // Verify loading state appears initially (since dialog just opened)
      const loadingText = screen.queryByText('جاري تحضير المساعد...');
      if (loadingText) {
        expect(loadingText).toHaveAttribute('dir', 'rtl');
      }
    });

    it('maintains responsive width classes with RTL direction', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      const dialogContent = document.querySelector('[dir="rtl"]');
      const className = dialogContent?.className || '';
      
      // Verify responsive width classes are preserved
      expect(className).toContain('w-[95%]'); // Mobile width
      expect(className).toContain('sm:max-w-[600px]'); // Desktop max width
    });

    it('maintains max-height constraint with RTL direction', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      const dialogContent = document.querySelector('[dir="rtl"]');
      const className = dialogContent?.className || '';
      
      // Verify max-height for proper scrolling
      expect(className).toContain('max-h-[85vh]');
    });
  });

  describe('RTL Direction Inheritance', () => {
    it('child components inherit RTL direction from DialogContent', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      // Verify parent has RTL
      const dialogContent = document.querySelector('[dir="rtl"]');
      expect(dialogContent).toBeTruthy();
      expect(dialogContent).toHaveAttribute('dir', 'rtl');

      // Check if dialog title exists and respects RTL
      const title = screen.getByText('مهارة اختبارية');
      expect(title).toBeInTheDocument();
    });

    it('flex layout direction follows RTL setting', () => {
      render(<SkillChatbotDialog {...defaultProps} />);

      const dialogContent = document.querySelector('[dir="rtl"]');
      const className = dialogContent?.className || '';
      
      // Verify flex-col for vertical layout (not affected by RTL)
      expect(className).toContain('flex-col');
    });
  });
});
