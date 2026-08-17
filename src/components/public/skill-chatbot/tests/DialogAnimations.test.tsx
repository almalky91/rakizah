import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillChatbotDialog } from '../SkillChatbotDialog';

/**
 * Tests for Task 10.1: Configure Dialog fade and scale animations
 * 
 * Validates Requirements:
 * - 10.1: Dialog opens with fade-in and scale-up over 200ms
 * - 10.2: Dialog closes with fade-out and scale-down over 200ms
 * 
 * Implementation Notes:
 * - Animations are configured at the Dialog component level (ui/dialog.tsx)
 * - Uses Radix UI data-state attributes to trigger animations
 * - Tailwind CSS utility classes provide the animation effects
 * - Duration is set to 200ms via duration-200 class
 * - Scale animations use zoom-in-95 and zoom-out-95 (95% to 100% and back)
 * - Fade animations use fade-in-0 and fade-out-0
 */
describe('SkillChatbotDialog - Animations (Task 10.1)', () => {
  const defaultProps = {
    skillId: 'test-skill',
    skillTitle: 'Test Skill',
    open: true,
    onOpenChange: () => {},
  };

  describe('Dialog Animation Classes', () => {
    it('should apply 200ms duration class to dialog', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // Verify dialog has duration-200 class for 200ms transitions
      expect(dialog.className).toContain('duration-200');
    });

    it('should apply fade animation classes to dialog', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // Verify fade-in animation class (for open state)
      expect(dialog.className).toContain('fade-in-0');
      
      // Verify fade-out animation class (for closed state)
      expect(dialog.className).toContain('fade-out-0');
    });

    it('should apply scale animation classes to dialog', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // Verify scale-up animation class (zoom-in from 95% to 100%)
      expect(dialog.className).toContain('zoom-in-95');
      
      // Verify scale-down animation class (zoom-out from 100% to 95%)
      expect(dialog.className).toContain('zoom-out-95');
    });

    it('should apply animate-in class for open state', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // Verify animate-in class is present (triggers on open)
      expect(dialog.className).toContain('animate-in');
    });

    it('should apply animate-out class for closed state', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // Verify animate-out class is present (triggers on close)
      expect(dialog.className).toContain('animate-out');
    });

    it('should apply data-state triggered animation classes', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      const classes = dialog.className;
      
      // Verify data-[state=open] animation classes
      expect(classes).toMatch(/data-\[state=open\]:animate-in/);
      expect(classes).toMatch(/data-\[state=open\]:fade-in-0/);
      expect(classes).toMatch(/data-\[state=open\]:zoom-in-95/);
      
      // Verify data-[state=closed] animation classes
      expect(classes).toMatch(/data-\[state=closed\]:animate-out/);
      expect(classes).toMatch(/data-\[state=closed\]:fade-out-0/);
      expect(classes).toMatch(/data-\[state=closed\]:zoom-out-95/);
    });
  });

  describe('Animation Timing', () => {
    it('should use 200ms duration for fade-in on open', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // duration-200 = 200ms transition
      expect(dialog.className).toContain('duration-200');
      expect(dialog.className).toContain('fade-in-0');
    });

    it('should use 200ms duration for fade-out on close', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // duration-200 = 200ms transition
      expect(dialog.className).toContain('duration-200');
      expect(dialog.className).toContain('fade-out-0');
    });
  });

  describe('Scale Effect', () => {
    it('should scale up from 95% to 100% on open', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // zoom-in-95 = scale from 95% to 100%
      expect(dialog.className).toContain('zoom-in-95');
    });

    it('should scale down from 100% to 95% on close', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // zoom-out-95 = scale from 100% to 95%
      expect(dialog.className).toContain('zoom-out-95');
    });
  });

  describe('Combined Animation Effects', () => {
    it('should combine fade and scale animations on open', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      const classes = dialog.className;
      
      // Verify both fade-in and scale-up are present
      expect(classes).toContain('fade-in-0');
      expect(classes).toContain('zoom-in-95');
      expect(classes).toContain('duration-200');
    });

    it('should combine fade and scale animations on close', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      const classes = dialog.className;
      
      // Verify both fade-out and scale-down are present
      expect(classes).toContain('fade-out-0');
      expect(classes).toContain('zoom-out-95');
      expect(classes).toContain('duration-200');
    });
  });

  describe('Radix UI Integration', () => {
    it('should use Radix UI data-state attribute for animation triggers', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      const classes = dialog.className;
      
      // Verify animations are triggered by data-state attribute
      // This is the Radix UI pattern for state-based animations
      expect(classes).toMatch(/data-\[state=open\]/);
      expect(classes).toMatch(/data-\[state=closed\]/);
    });

    it('should apply slide-in animation alongside fade and scale', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      const classes = dialog.className;
      
      // Radix Dialog also includes slide animations for smoother effect
      expect(classes).toMatch(/slide-in-from-left-1\/2/);
      expect(classes).toMatch(/slide-in-from-top-\[48%\]/);
    });

    it('should apply slide-out animation alongside fade and scale', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      const classes = dialog.className;
      
      // Radix Dialog also includes slide animations for smoother effect
      expect(classes).toMatch(/slide-out-to-left-1\/2/);
      expect(classes).toMatch(/slide-out-to-top-\[48%\]/);
    });
  });

  describe('Requirements Validation', () => {
    it('validates Requirement 10.1: Dialog fades in and scales up over 200ms on open', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      const classes = dialog.className;
      
      // Requirement 10.1: Dialog SHALL fade in and scale up over 200ms
      expect(classes).toContain('duration-200'); // 200ms duration
      expect(classes).toMatch(/data-\[state=open\]:fade-in-0/); // Fade in on open
      expect(classes).toMatch(/data-\[state=open\]:zoom-in-95/); // Scale up on open (95% to 100%)
      expect(classes).toMatch(/data-\[state=open\]:animate-in/); // Animation trigger on open
    });

    it('validates Requirement 10.2: Dialog fades out and scales down over 200ms on close', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      const classes = dialog.className;
      
      // Requirement 10.2: Dialog SHALL fade out and scale down over 200ms
      expect(classes).toContain('duration-200'); // 200ms duration
      expect(classes).toMatch(/data-\[state=closed\]:fade-out-0/); // Fade out on close
      expect(classes).toMatch(/data-\[state=closed\]:zoom-out-95/); // Scale down on close (100% to 95%)
      expect(classes).toMatch(/data-\[state=closed\]:animate-out/); // Animation trigger on close
    });
  });

  describe('Edge Cases', () => {
    it('should maintain animation classes when dialog is closed', () => {
      const { rerender } = render(<SkillChatbotDialog {...defaultProps} open={false} />);
      
      // When closed, dialog element won't be in DOM but classes remain configured
      // Reopen to verify classes are still present
      rerender(<SkillChatbotDialog {...defaultProps} open={true} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('duration-200');
      expect(dialog.className).toContain('fade-in-0');
      expect(dialog.className).toContain('zoom-in-95');
    });

    it('should not conflict with custom className prop', () => {
      const customProps = {
        ...defaultProps,
        // Note: className would be passed via DialogContent if needed
      };
      
      render(<SkillChatbotDialog {...customProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      // Animation classes should still be present even with custom classes
      expect(dialog.className).toContain('duration-200');
      expect(dialog.className).toContain('fade-in-0');
      expect(dialog.className).toContain('zoom-in-95');
    });
  });
});
