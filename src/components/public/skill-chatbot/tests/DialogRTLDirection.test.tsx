import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SkillChatbotDialog } from '../SkillChatbotDialog';
import '@testing-library/jest-dom';

/**
 * Task 12.1: Add RTL direction to Dialog content
 * 
 * This test verifies:
 * - Dialog content has dir="rtl" attribute
 * - Close button respects RTL positioning
 * 
 * Requirements: 12.2, 9.1
 */
describe('SkillChatbotDialog - RTL Direction (Task 12.1)', () => {
  it('should have dir="rtl" attribute on DialogContent', async () => {
    const { container } = render(
      <SkillChatbotDialog
        skillId="test-skill-1"
        skillTitle="مهارة اختبار"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Wait for dialog to render and verify dir="rtl" attribute is set
    await waitFor(() => {
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog?.getAttribute('dir')).toBe('rtl');
    });
  });

  it('should position close button on the left side in RTL mode', async () => {
    const { container } = render(
      <SkillChatbotDialog
        skillId="test-skill-1"
        skillTitle="مهارة اختبار"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Wait for dialog to render
    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    // Get the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    
    // Verify close button has RTL positioning classes
    const className = closeButton.className;
    expect(className).toContain('rtl:left-4');
    expect(className).toContain('rtl:right-auto');
  });

  it('should maintain RTL direction throughout the dialog lifecycle', async () => {
    const { container, rerender } = render(
      <SkillChatbotDialog
        skillId="test-skill-1"
        skillTitle="مهارة اختبار"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Wait for initial render and verify RTL
    await waitFor(() => {
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('dir')).toBe('rtl');
    });

    // Simulate reopening the dialog
    rerender(
      <SkillChatbotDialog
        skillId="test-skill-1"
        skillTitle="مهارة اختبار"
        open={false}
        onOpenChange={() => {}}
      />
    );

    rerender(
      <SkillChatbotDialog
        skillId="test-skill-2"
        skillTitle="مهارة أخرى"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Verify RTL is still applied after reopening
    await waitFor(() => {
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog?.getAttribute('dir')).toBe('rtl');
    });
  });

  it('should apply RTL styling to all dialog content', async () => {
    render(
      <SkillChatbotDialog
        skillId="test-skill-1"
        skillTitle="مهارة اختبار"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Wait for dialog to render
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    
    // Verify the dialog has RTL direction
    expect(dialog).toHaveAttribute('dir', 'rtl');
    
    // Verify title is present and should respect RTL
    const title = screen.getByText('مهارة اختبار');
    expect(title).toBeInTheDocument();
  });
});
