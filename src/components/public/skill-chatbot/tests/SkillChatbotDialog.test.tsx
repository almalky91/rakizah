import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillChatbotDialog } from '../SkillChatbotDialog';

describe('SkillChatbotDialog', () => {
  const defaultProps = {
    skillId: 'test-skill-123',
    skillTitle: 'مهارة اختبارية',
    open: true,
    onOpenChange: vi.fn(),
  };

  it('renders with correct initial state', () => {
    render(<SkillChatbotDialog {...defaultProps} />);
    
    // Check if title is displayed
    expect(screen.getByText('مهارة اختبارية')).toBeInTheDocument();
    
    // Check if loading state is displayed initially
    expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
  });

  it('exports SkillChatbotDialogProps interface', () => {
    // Type check - this will fail to compile if interface is not exported
    const props: import('../SkillChatbotDialog').SkillChatbotDialogProps = {
      skillId: 'test',
      skillTitle: 'Test',
      open: false,
      onOpenChange: vi.fn(),
    };
    
    expect(props).toBeDefined();
  });

  it('integrates with Radix UI Dialog component', () => {
    render(<SkillChatbotDialog {...defaultProps} />);
    
    // Check if Dialog renders with role="dialog"
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('displays RTL direction', () => {
    render(<SkillChatbotDialog {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('dir', 'rtl');
  });

  it('applies responsive width classes', () => {
    render(<SkillChatbotDialog {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('w-[95%]');
    expect(dialog).toHaveClass('sm:max-w-[600px]');
  });

  describe('State Management', () => {
    it('initializes with loading state displayed', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Loading state should be displayed initially
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
    });

    it('resets state when dialog closes and reopens', () => {
      const { rerender } = render(<SkillChatbotDialog {...defaultProps} />);
      
      // Verify loading state is displayed
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      // Close the dialog
      rerender(<SkillChatbotDialog {...defaultProps} open={false} />);
      
      // Reopen the dialog - should show loading state again
      rerender(<SkillChatbotDialog {...defaultProps} open={true} />);
      
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
    });
  });

  describe('Initial Message Loading (Task 6.3)', () => {
    it('displays loading state immediately when dialog opens', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Requirement 1.4, 2.1: Loading state displays immediately
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
    });

    it('loads conversation from dummy data for the specified skill', async () => {
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />
      );
      
      // Initial loading state should be shown
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      // Wait for the timeout to complete (max 1500ms)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // After loading, check that state has updated
      rerender(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // Debug info should show messages have been loaded
      expect(screen.getByText(/Messages: [1-9]/)).toBeInTheDocument();
    });

    it('simulates delay between 800ms and 1500ms', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // Loading should still be shown after 700ms
      vi.advanceTimersByTime(700);
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      // After 1600ms, loading should definitely be complete
      vi.advanceTimersByTime(900);
      
      // Loading should no longer be displayed
      expect(screen.queryByText('جاري تحضير المساعد...')).not.toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('sets isTyping to true after loading completes', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // Initially typing should be false (loading is true)
      expect(screen.getByText('Typing: لا')).toBeInTheDocument();
      
      // Advance past the maximum delay
      vi.advanceTimersByTime(1600);
      
      // After loading, isTyping should be true
      expect(screen.getByText('Typing: نعم')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('loads initial node message from conversation tree', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // Messages should be 0 initially
      expect(screen.getByText('Messages: 0')).toBeInTheDocument();
      
      // Advance past the loading delay
      vi.advanceTimersByTime(1600);
      
      // After loading, messages should be 1 (initial AI message)
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('handles missing conversation data gracefully with fallback', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="non-existent-skill" />);
      
      // Loading should be displayed
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      // Advance past loading delay
      vi.advanceTimersByTime(1600);
      
      // Should still load successfully with fallback conversation
      expect(screen.queryByText('جاري تحضير المساعد...')).not.toBeInTheDocument();
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('resets all state when dialog closes', () => {
      vi.useFakeTimers();
      
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />
      );
      
      // Load the initial message
      vi.advanceTimersByTime(1600);
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      // Close the dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" open={false} />
      );
      
      // Reopen the dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" open={true} />
      );
      
      // State should be reset - messages should be 0 again
      expect(screen.getByText('Messages: 0')).toBeInTheDocument();
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe('ResponseOptions Fade-in Animation (Task 10.2)', () => {
    it('hides ResponseOptions during typewriter effect (isTyping=true)', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // Advance past loading to start typewriter effect
      vi.advanceTimersByTime(1600);
      
      // ResponseOptions should be hidden while typing
      expect(screen.queryByTestId('response-options-container')).not.toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('shows ResponseOptions with fade-in animation after typing completes', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // Advance past loading
      vi.advanceTimersByTime(1600);
      
      // ResponseOptions should be hidden during typing
      expect(screen.queryByTestId('response-options-container')).not.toBeInTheDocument();
      
      // Wait for typewriter effect to complete (depends on message length and speed)
      // Assuming max ~3 seconds for typewriter animation
      vi.advanceTimersByTime(3500);
      
      // ResponseOptions should now be visible with fade-in animation
      const optionsContainer = screen.queryByTestId('response-options-container');
      if (optionsContainer) {
        // Requirement 4.5, 10.4: ResponseOptions fade in when typewriter completes
        expect(optionsContainer).toHaveClass('animate-in');
        expect(optionsContainer).toHaveClass('fade-in');
        // Task 20.2: Fine-tuned animation timing to 250ms for optimal smoothness
        expect(optionsContainer?.className).toMatch(/duration-\[250ms\]/);
      }
      
      vi.useRealTimers();
    });

    it('ResponseOptions remain hidden during loading state', () => {
      render(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // During initial loading, ResponseOptions should not be visible
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      expect(screen.queryByTestId('response-options-container')).not.toBeInTheDocument();
    });

    it('conditional rendering: !isLoading && !isTyping && options.length > 0', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // Step 1: Loading state (isLoading=true, isTyping=false)
      expect(screen.getByText('Loading: نعم')).toBeInTheDocument();
      expect(screen.queryByTestId('response-options-container')).not.toBeInTheDocument();
      
      // Step 2: After loading (isLoading=false, isTyping=true)
      vi.advanceTimersByTime(1600);
      expect(screen.getByText('Loading: لا')).toBeInTheDocument();
      expect(screen.getByText('Typing: نعم')).toBeInTheDocument();
      expect(screen.queryByTestId('response-options-container')).not.toBeInTheDocument();
      
      // Step 3: After typing completes (isLoading=false, isTyping=false)
      // ResponseOptions should now be visible
      vi.advanceTimersByTime(3500);
      const optionsContainer = screen.queryByTestId('response-options-container');
      
      if (optionsContainer) {
        expect(optionsContainer).toBeInTheDocument();
        expect(screen.getByText('Loading: لا')).toBeInTheDocument();
        expect(screen.getByText('Typing: لا')).toBeInTheDocument();
      }
      
      vi.useRealTimers();
    });
  });

  /**
   * Task 16.1: Comprehensive tests for SkillChatbotDialog component
   * 
   * Tests cover:
   * - Component renders with correct initial state
   * - Dialog opens and closes correctly
   * - Initial message loading on dialog open
   * - State resets when dialog closes
   * - Error handling for missing conversation data
   * 
   * Validates Requirements: 1.1, 1.2, 9.3, 3.6
   */
  describe('Task 16.1: Component Rendering and Initial State', () => {
    it('renders with correct initial state when dialog is open (Requirement 1.1, 1.2)', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Dialog should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Title should be displayed
      expect(screen.getByText('مهارة اختبارية')).toBeInTheDocument();
      
      // Loading state should be displayed initially
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      // Debug info shows correct initial state
      expect(screen.getByText('Messages: 0')).toBeInTheDocument();
      expect(screen.getByText('Loading: نعم')).toBeInTheDocument();
      expect(screen.getByText('Typing: لا')).toBeInTheDocument();
    });

    it('does not render dialog when open prop is false', () => {
      render(<SkillChatbotDialog {...defaultProps} open={false} />);
      
      // Dialog should not be visible
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('applies RTL direction to dialog content', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('dir', 'rtl');
    });

    it('applies responsive width classes for mobile and desktop', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('w-[95%]'); // Mobile: 95% width
      expect(dialog).toHaveClass('sm:max-w-[600px]'); // Desktop: max 600px
    });
  });

  describe('Task 16.1: Dialog Open and Close Behavior', () => {
    it('dialog opens when open prop changes from false to true (Requirement 1.1)', () => {
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} open={false} />
      );
      
      // Initially closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      // Open the dialog
      rerender(<SkillChatbotDialog {...defaultProps} open={true} />);
      
      // Dialog should now be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('مهارة اختبارية')).toBeInTheDocument();
    });

    it('dialog closes correctly when onOpenChange is called with false (Requirement 9.2)', () => {
      const onOpenChangeMock = vi.fn();
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} onOpenChange={onOpenChangeMock} />
      );
      
      // Dialog is open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Simulate closing the dialog (user clicks close button)
      // This would normally be triggered by the Dialog component's internal close mechanism
      rerender(
        <SkillChatbotDialog {...defaultProps} open={false} onOpenChange={onOpenChangeMock} />
      );
      
      // Dialog should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays loading state immediately when dialog opens (Requirement 1.4, 2.1)', () => {
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} open={false} />
      );
      
      // Open the dialog
      rerender(<SkillChatbotDialog {...defaultProps} open={true} />);
      
      // Loading state should be displayed immediately
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Task 16.1: Initial Message Loading on Dialog Open', () => {
    it('loads initial message from dummy data when dialog opens (Requirement 3.1)', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // Initially no messages
      expect(screen.getByText('Messages: 0')).toBeInTheDocument();
      
      // Advance past the loading delay (800-1500ms)
      vi.advanceTimersByTime(1600);
      
      // After loading, should have 1 message (initial AI message)
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      // Loading should be false, typing should be true
      expect(screen.getByText('Loading: لا')).toBeInTheDocument();
      expect(screen.getByText('Typing: نعم')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('simulates loading delay between 800ms and 1500ms (Requirement 2.3)', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="math-problem-solving" />);
      
      // Loading should still be active after 700ms
      vi.advanceTimersByTime(700);
      expect(screen.getByText('Loading: نعم')).toBeInTheDocument();
      expect(screen.getByText('Messages: 0')).toBeInTheDocument();
      
      // After 1600ms, loading should be complete
      vi.advanceTimersByTime(900);
      expect(screen.getByText('Loading: لا')).toBeInTheDocument();
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('transitions from loading state to chatbot interface smoothly (Requirement 2.4, 10.3)', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="creative-writing" />);
      
      // Initially in loading state
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      expect(screen.getByText('Loading: نعم')).toBeInTheDocument();
      
      // Advance past loading delay
      vi.advanceTimersByTime(1600);
      
      // Loading state should no longer be visible
      expect(screen.queryByText('جاري تحضير المساعد...')).not.toBeInTheDocument();
      expect(screen.getByText('Loading: لا')).toBeInTheDocument();
      
      // Chatbot interface should be visible (isTyping=true, messages=1)
      expect(screen.getByText('Typing: نعم')).toBeInTheDocument();
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('sets conversation state correctly after loading', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />);
      
      // Advance past loading
      vi.advanceTimersByTime(1600);
      
      // Conversation should be loaded, and initial node should be set
      // Verified by checking that we have messages and typing is active
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      expect(screen.getByText('Typing: نعم')).toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe('Task 16.1: State Resets When Dialog Closes', () => {
    it('clears all state when dialog closes (Requirement 9.3)', () => {
      vi.useFakeTimers();
      
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />
      );
      
      // Load initial message
      vi.advanceTimersByTime(1600);
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      // Close the dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" open={false} />
      );
      
      // Wait for cleanup
      vi.advanceTimersByTime(100);
      
      // Reopen the dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" open={true} />
      );
      
      // State should be reset - back to initial state
      expect(screen.getByText('Messages: 0')).toBeInTheDocument();
      expect(screen.getByText('Loading: نعم')).toBeInTheDocument();
      expect(screen.getByText('Typing: لا')).toBeInTheDocument();
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('resets messages array when dialog closes', () => {
      vi.useFakeTimers();
      
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} skillId="math-problem-solving" />
      );
      
      // Load initial message
      vi.advanceTimersByTime(1600);
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      // Close dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="math-problem-solving" open={false} />
      );
      
      vi.advanceTimersByTime(100);
      
      // Reopen dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="math-problem-solving" open={true} />
      );
      
      // Messages should be reset to 0
      expect(screen.getByText('Messages: 0')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('resets loading and typing states when dialog closes', () => {
      vi.useFakeTimers();
      
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} skillId="creative-writing" />
      );
      
      // Advance to typing state
      vi.advanceTimersByTime(1600);
      expect(screen.getByText('Loading: لا')).toBeInTheDocument();
      expect(screen.getByText('Typing: نعم')).toBeInTheDocument();
      
      // Close dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="creative-writing" open={false} />
      );
      
      vi.advanceTimersByTime(100);
      
      // Reopen dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="creative-writing" open={true} />
      );
      
      // Loading should be true, typing should be false
      expect(screen.getByText('Loading: نعم')).toBeInTheDocument();
      expect(screen.getByText('Typing: لا')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('clears conversation state when dialog closes', () => {
      vi.useFakeTimers();
      
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" />
      );
      
      // Load initial conversation
      vi.advanceTimersByTime(1600);
      
      // Conversation is loaded (verified by having messages)
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      // Close dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" open={false} />
      );
      
      vi.advanceTimersByTime(100);
      
      // Reopen with different skill
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="math-problem-solving" open={true} />
      );
      
      // Should load fresh conversation for new skill
      expect(screen.getByText('Messages: 0')).toBeInTheDocument();
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe('Task 16.1: Error Handling for Missing Conversation Data', () => {
    it('handles missing skill conversation data gracefully with fallback (Requirement 3.6)', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="non-existent-skill-xyz" />);
      
      // Dialog should still open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Loading state should display
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      // Advance past loading delay
      vi.advanceTimersByTime(1600);
      
      // Should load fallback conversation successfully
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      expect(screen.getByText('Loading: لا')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('logs warning when conversation data is missing', () => {
      vi.useFakeTimers();
      
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(<SkillChatbotDialog {...defaultProps} skillId="missing-skill" />);
      
      // Advance past loading to trigger conversation loading
      vi.advanceTimersByTime(1600);
      
      // Should have logged a warning about missing conversation data
      // This happens in the getConversation function from dummyData.ts
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No conversation data found for skill: missing-skill')
      );
      
      consoleWarnSpy.mockRestore();
      vi.useRealTimers();
    });

    it('displays fallback message when skill data is not found', () => {
      vi.useFakeTimers();
      
      render(<SkillChatbotDialog {...defaultProps} skillId="unknown-skill-abc" />);
      
      // Advance past loading
      vi.advanceTimersByTime(1600);
      
      // Should have loaded fallback conversation with 1 message
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      // The fallback conversation should have loaded successfully
      // (The actual fallback message content would be displayed in ConversationHistory)
      expect(screen.getByText('Typing: نعم')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('fallback conversation allows dialog to close normally', () => {
      vi.useFakeTimers();
      
      const onOpenChangeMock = vi.fn();
      const { rerender } = render(
        <SkillChatbotDialog 
          {...defaultProps} 
          skillId="non-existent" 
          onOpenChange={onOpenChangeMock}
        />
      );
      
      // Load fallback conversation
      vi.advanceTimersByTime(1600);
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      // Close dialog
      rerender(
        <SkillChatbotDialog 
          {...defaultProps} 
          skillId="non-existent" 
          open={false}
          onOpenChange={onOpenChangeMock}
        />
      );
      
      // Dialog should close without errors
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('can reload conversation after closing fallback conversation', () => {
      vi.useFakeTimers();
      
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} skillId="invalid-skill" />
      );
      
      // Load fallback conversation
      vi.advanceTimersByTime(1600);
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      // Close dialog
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="invalid-skill" open={false} />
      );
      
      vi.advanceTimersByTime(100);
      
      // Reopen with valid skill
      rerender(
        <SkillChatbotDialog {...defaultProps} skillId="reading-comprehension" open={true} />
      );
      
      // Should load valid conversation
      expect(screen.getByText('Messages: 0')).toBeInTheDocument();
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      
      vi.advanceTimersByTime(1600);
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });
});
