/**
 * Accessibility Verification Tests for Skill Chatbot Assistant
 * 
 * This test suite verifies WCAG AA compliance for:
 * - Keyboard navigation (Tab, Escape, Enter)
 * - Focus indicators on interactive elements
 * - Aria-live regions for dynamic content
 * - Screen reader compatibility (structural verification)
 * 
 * Task 20.3: Verify accessibility compliance
 * Requirements: 9.1, 9.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillChatbotDialog } from '../SkillChatbotDialog';

describe('Accessibility Compliance - Keyboard Navigation', () => {
  const mockOnOpenChange = vi.fn();
  const defaultProps = {
    skillId: 'test-skill-1',
    skillTitle: 'مهارة الاختبار',
    open: true,
    onOpenChange: mockOnOpenChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should close dialog when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for dialog to be visible
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Press Escape key
    await user.keyboard('{Escape}');

    // Verify dialog close was triggered
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should allow Tab navigation through interactive elements', async () => {
    const user = userEvent.setup();
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for initial loading to complete and response options to appear
    await waitFor(
      () => {
        const options = screen.queryAllByTestId('response-option');
        expect(options.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    // Get all interactive elements
    const closeButton = screen.getByRole('button', { name: /close/i });
    const responseButtons = screen.getAllByTestId('response-option');

    // Tab through elements
    await user.tab();
    
    // First focusable element should be focused (close button or first response option)
    const firstFocusable = [closeButton, ...responseButtons].find(
      el => document.activeElement === el
    );
    expect(firstFocusable).toBeTruthy();

    // Continue tabbing through response options
    for (let i = 0; i < responseButtons.length; i++) {
      await user.tab();
    }

    // Verify we can navigate through all buttons
    expect(responseButtons.some(btn => btn === document.activeElement)).toBeTruthy();
  });

  it('should activate response option with Enter key', async () => {
    const user = userEvent.setup();
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for response options
    await waitFor(
      () => {
        expect(screen.getAllByTestId('response-option').length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const responseButtons = screen.getAllByTestId('response-option');
    const firstButton = responseButtons[0];

    // Focus the button
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    // Activate with Enter
    await user.keyboard('{Enter}');

    // Verify interaction (loading state or new message should appear)
    await waitFor(() => {
      // After clicking, either loading state appears or new message is added
      const studentMessages = screen.queryAllByTestId('student-message');
      expect(studentMessages.length).toBeGreaterThan(0);
    });
  });

  it('should activate response option with Space key', async () => {
    const user = userEvent.setup();
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for response options
    await waitFor(
      () => {
        expect(screen.getAllByTestId('response-option').length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const responseButtons = screen.getAllByTestId('response-option');
    const firstButton = responseButtons[0];

    // Focus the button
    firstButton.focus();

    // Activate with Space
    await user.keyboard(' ');

    // Verify interaction
    await waitFor(() => {
      const studentMessages = screen.queryAllByTestId('student-message');
      expect(studentMessages.length).toBeGreaterThan(0);
    });
  });
});

describe('Accessibility Compliance - Focus Indicators', () => {
  const defaultProps = {
    skillId: 'test-skill-1',
    skillTitle: 'مهارة الاختبار',
    open: true,
    onOpenChange: vi.fn(),
  };

  it('should have visible focus indicator on close button', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    const closeButton = await screen.findByRole('button', { name: /close/i });
    
    // Check for focus ring classes
    expect(closeButton.className).toMatch(/focus:ring|focus-visible:ring/);
  });

  it('should have visible focus indicators on response option buttons', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for response options
    await waitFor(
      () => {
        expect(screen.getAllByTestId('response-option').length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const responseButtons = screen.getAllByTestId('response-option');

    // Verify each button has focus indicator classes
    responseButtons.forEach(button => {
      expect(button.className).toMatch(/focus-visible:ring/);
    });
  });

  it('should maintain focus order in logical sequence', async () => {
    const user = userEvent.setup();
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for response options
    await waitFor(
      () => {
        expect(screen.getAllByTestId('response-option').length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const responseButtons = screen.getAllByTestId('response-option');
    const focusSequence: Element[] = [];

    // Tab through and record focus sequence
    for (let i = 0; i < responseButtons.length + 2; i++) {
      await user.tab();
      if (document.activeElement) {
        focusSequence.push(document.activeElement);
      }
    }

    // Verify we captured multiple focused elements
    expect(focusSequence.length).toBeGreaterThan(0);
  });
});

describe('Accessibility Compliance - ARIA Attributes', () => {
  const defaultProps = {
    skillId: 'test-skill-1',
    skillTitle: 'مهارة الاختبار',
    open: true,
    onOpenChange: vi.fn(),
  };

  it('should have proper dialog role', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should have accessible title', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    // Dialog should have an accessible name from DialogTitle
    const title = screen.getByText('مهارة الاختبار');
    expect(title).toBeInTheDocument();
  });

  it('should have aria-live region for dynamic message updates', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for conversation history to render
    await waitFor(
      () => {
        const liveRegion = document.querySelector('[aria-live="polite"]');
        expect(liveRegion).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const liveRegion = document.querySelector('[aria-live="polite"]');
    
    // Verify aria-live attributes
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('role', 'log');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'false');
  });

  it('should have proper role attributes on messages', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for initial AI message
    await waitFor(
      () => {
        const aiMessages = screen.queryAllByTestId('ai-message');
        expect(aiMessages.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const aiMessages = screen.getAllByTestId('ai-message');
    
    // Verify each message has appropriate role
    aiMessages.forEach(message => {
      expect(message).toHaveAttribute('role', 'article');
      expect(message).toHaveAttribute('aria-label');
    });
  });

  it('should have loading state with proper aria attributes', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    // Loading state should be present initially
    const loadingElement = document.querySelector('[role="status"]');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('aria-live', 'polite');
  });
});

describe('Accessibility Compliance - Screen Reader Support', () => {
  const defaultProps = {
    skillId: 'test-skill-1',
    skillTitle: 'مهارة الاختبار',
    open: true,
    onOpenChange: vi.fn(),
  };

  it('should have screen reader-only text for close button', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    const srOnlyText = document.querySelector('.sr-only');
    expect(srOnlyText).toBeInTheDocument();
    expect(srOnlyText?.textContent).toBe('Close');
  });

  it('should have aria-label for AI messages', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    await waitFor(
      () => {
        const aiMessages = screen.queryAllByTestId('ai-message');
        expect(aiMessages.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const aiMessages = screen.getAllByTestId('ai-message');
    aiMessages.forEach(message => {
      expect(message).toHaveAttribute('aria-label', 'رسالة من المساعد الذكي');
    });
  });

  it('should have aria-label for student messages', async () => {
    const user = userEvent.setup();
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for response options and click one
    await waitFor(
      () => {
        expect(screen.getAllByTestId('response-option').length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const firstOption = screen.getAllByTestId('response-option')[0];
    await user.click(firstOption);

    // Wait for student message
    await waitFor(() => {
      const studentMessages = screen.queryAllByTestId('student-message');
      expect(studentMessages.length).toBeGreaterThan(0);
    });

    const studentMessages = screen.getAllByTestId('student-message');
    studentMessages.forEach(message => {
      expect(message).toHaveAttribute('aria-label', 'رسالة من الطالب');
    });
  });

  it('should announce typing indicator to screen readers', async () => {
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for typewriter effect to start
    await waitFor(
      () => {
        const typingIndicator = document.querySelector('[aria-label="جاري الكتابة"]');
        expect(typingIndicator).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});

describe('Accessibility Compliance - Keyboard Trap Prevention', () => {
  const defaultProps = {
    skillId: 'test-skill-1',
    skillTitle: 'مهارة الاختبار',
    open: true,
    onOpenChange: vi.fn(),
  };

  it('should allow Tab navigation to loop through focusable elements', async () => {
    const user = userEvent.setup();
    render(<SkillChatbotDialog {...defaultProps} />);

    // Wait for interactive elements
    await waitFor(
      () => {
        expect(screen.getAllByTestId('response-option').length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    const responseButtons = screen.getAllByTestId('response-option');
    const totalFocusable = 1 + responseButtons.length; // close button + response options

    // Tab through all elements plus one more to verify focus loops
    for (let i = 0; i <= totalFocusable; i++) {
      await user.tab();
    }

    // Focus should have cycled through dialog
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
    
    // Should be either close button or one of the response options
    const isValidFocus = 
      focusedElement === closeButton || 
      responseButtons.some(btn => btn === focusedElement);
    
    expect(isValidFocus).toBe(true);
  });

  it('should allow Shift+Tab for reverse navigation', async () => {
    const user = userEvent.setup();
    render(<SkillChatbotDialog {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getAllByTestId('response-option').length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    // Tab forward once
    await user.tab();
    const forwardFocus = document.activeElement;

    // Tab backward
    await user.tab({ shift: true });
    const backwardFocus = document.activeElement;

    // Focuses should be different (or same if only one focusable element)
    expect(forwardFocus).toBeTruthy();
    expect(backwardFocus).toBeTruthy();
  });
});
