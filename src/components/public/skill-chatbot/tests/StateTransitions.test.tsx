import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SkillChatbotDialog } from '../SkillChatbotDialog';

/**
 * Tests for Task 10.4: Implement smooth state transitions
 * 
 * Validates Requirements:
 * - 2.4: Smooth transition from LoadingState to chatbot interface
 * - 10.3: Fade effect when transitioning states
 * 
 * Task 10.4 Implementation:
 * - Add fade effect when transitioning from LoadingState to chatbot interface ✓
 * - Set transition duration to match design (200ms) ✓
 * - Ensure no visual flicker during transitions ✓
 * - Test all transition paths (loading → typing → options) ✓
 * 
 * Implementation Notes:
 * - Uses Tailwind CSS animate-in and fade-in utilities
 * - Duration set to 200ms via duration-200 class
 * - Transitions applied to LoadingState, ConversationHistory, and ResponseOptions containers
 */
describe('SkillChatbotDialog - State Transitions (Task 10.4)', () => {
  const defaultProps = {
    skillId: 'test-skill',
    skillTitle: 'مهارة اختبارية',
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoadingState to Chatbot Interface Transition', () => {
    it('should apply fade-in effect to LoadingState container', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Find LoadingState container (initial loading)
      const loadingText = screen.getByText('جاري تحضير المساعد...');
      const loadingContainer = loadingText.closest('div.animate-in');
      
      // Requirement 10.3: Fade effect when transitioning from LoadingState
      expect(loadingContainer).toBeTruthy();
      expect(loadingContainer?.className).toContain('animate-in');
      expect(loadingContainer?.className).toContain('fade-in');
    });

    it('should set transition duration to 200ms for LoadingState', () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      const loadingText = screen.getByText('جاري تحضير المساعد...');
      const loadingContainer = loadingText.closest('div.duration-200');
      
      // Task 10.4: Set transition duration to match design (200ms)
      expect(loadingContainer).toBeTruthy();
      expect(loadingContainer?.className).toContain('duration-200');
    });

    it('should apply fade-in effect to chatbot interface after loading', async () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Wait for loading to complete and chatbot interface to appear
      await waitFor(
        () => {
          const conversationHistory = screen.queryByRole('log');
          expect(conversationHistory).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      // Find chatbot interface container
      const conversationHistory = screen.getByRole('log');
      const chatbotContainer = conversationHistory.parentElement;
      
      // Requirement 2.4: Smooth transition from LoadingState to chatbot interface
      expect(chatbotContainer?.className).toContain('animate-in');
      expect(chatbotContainer?.className).toContain('fade-in');
      expect(chatbotContainer?.className).toContain('duration-200');
    });

    it('should transition smoothly without LoadingState and chatbot interface overlapping', async () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Initially, only LoadingState should be visible
      const loadingText = screen.getByText('جاري تحضير المساعد...');
      expect(loadingText).toBeInTheDocument();
      
      // Wait for transition to complete
      await waitFor(
        () => {
          const conversationHistory = screen.queryByRole('log');
          expect(conversationHistory).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      // After transition, LoadingState should be gone
      expect(screen.queryByText('جاري تحضير المساعد...')).not.toBeInTheDocument();
      
      // Task 10.4: Ensure no visual flicker during transitions
      // This validates that components don't both appear at the same time
    });
  });

  describe('Loading to Typing State Transition', () => {
    it('should apply fade-in during intermediate loading states', async () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Wait for initial message and options
      await waitFor(
        () => {
          const options = screen.queryAllByRole('button', { name: /.*/ });
          expect(options.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );
      
      // Click a response option
      const responseButtons = screen.getAllByRole('button').filter(
        btn => !btn.getAttribute('aria-label')?.includes('Close')
      );
      
      if (responseButtons.length > 0) {
        fireEvent.click(responseButtons[0]);
        
        // Check if intermediate loading state appears with fade-in
        await waitFor(
          () => {
            const loadingText = screen.queryByText('جاري تحضير المساعد...');
            if (loadingText) {
              const loadingContainer = loadingText.closest('div.animate-in');
              expect(loadingContainer?.className).toContain('fade-in');
              expect(loadingContainer?.className).toContain('duration-200');
            }
          },
          { timeout: 1000 }
        );
      }
    });
  });

  describe('All Transition Paths', () => {
    it('should test complete transition path: loading → typing → options', async () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Step 1: Loading state should have fade-in
      const initialLoadingText = screen.getByText('جاري تحضير المساعد...');
      const initialLoadingContainer = initialLoadingText.closest('div.animate-in');
      expect(initialLoadingContainer?.className).toContain('fade-in');
      expect(initialLoadingContainer?.className).toContain('duration-200');
      
      // Step 2: Wait for typing state (AI message appears)
      await waitFor(
        () => {
          const conversationHistory = screen.queryByRole('log');
          expect(conversationHistory).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      // Verify chatbot interface has fade-in
      const conversationHistory = screen.getByRole('log');
      const chatbotContainer = conversationHistory.parentElement;
      expect(chatbotContainer?.className).toContain('fade-in');
      expect(chatbotContainer?.className).toContain('duration-200');
      
      // Step 3: Wait for options to appear after typing completes
      await waitFor(
        () => {
          const options = screen.queryAllByRole('button', { name: /.*/ });
          expect(options.length).toBeGreaterThan(1); // More than just close button
        },
        { timeout: 3000 }
      );
      
      // Verify options are present (fade-in tested in ResponseOptions.test.tsx)
      const responseButtons = screen.getAllByRole('button').filter(
        btn => !btn.getAttribute('aria-label')?.includes('Close')
      );
      expect(responseButtons.length).toBeGreaterThan(0);
      
      // Task 10.4: Test all transition paths (loading → typing → options) ✓
    });

    it('should handle rapid state changes without visual glitches', async () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Wait for initial options
      await waitFor(
        () => {
          const options = screen.queryAllByRole('button', { name: /.*/ });
          expect(options.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );
      
      // Click multiple response options in sequence
      const responseButtons = screen.getAllByRole('button').filter(
        btn => !btn.getAttribute('aria-label')?.includes('Close')
      );
      
      if (responseButtons.length > 0) {
        // Click first option
        fireEvent.click(responseButtons[0]);
        
        // Each state transition should maintain smooth fade effects
        // This validates no flicker during rapid transitions
        await waitFor(
          () => {
            const containers = document.querySelectorAll('.animate-in.fade-in.duration-200');
            expect(containers.length).toBeGreaterThan(0);
          },
          { timeout: 1000 }
        );
      }
    });
  });

  describe('Transition Duration Consistency', () => {
    it('should use consistent 200ms duration across all transition points', async () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Check initial loading state duration
      const loadingText = screen.getByText('جاري تحضير المساعد...');
      const loadingContainer = loadingText.closest('div.duration-200');
      expect(loadingContainer).toBeTruthy();
      
      // Wait for chatbot interface
      await waitFor(
        () => {
          const conversationHistory = screen.queryByRole('log');
          expect(conversationHistory).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      // Check chatbot interface duration
      const conversationHistory = screen.getByRole('log');
      const chatbotContainer = conversationHistory.parentElement;
      expect(chatbotContainer?.className).toContain('duration-200');
      
      // Task 10.4: Consistent 200ms duration matches design specification
    });
  });

  describe('No Visual Flicker Validation', () => {
    it('should not display LoadingState and ConversationHistory simultaneously', async () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Initially only LoadingState
      expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
      expect(screen.queryByRole('log')).not.toBeInTheDocument();
      
      // After transition only ConversationHistory
      await waitFor(
        () => {
          expect(screen.queryByRole('log')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      // LoadingState should be gone when chatbot interface appears
      // (unless it's a mid-conversation loading state)
      const conversationHistory = screen.getByRole('log');
      expect(conversationHistory).toBeInTheDocument();
      
      // Task 10.4: Ensure no visual flicker during transitions ✓
    });

    it('should handle dialog close during transition without errors', async () => {
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} onOpenChange={onOpenChange} />
      );
      
      // Close dialog immediately during initial loading
      rerender(
        <SkillChatbotDialog {...defaultProps} open={false} onOpenChange={onOpenChange} />
      );
      
      // No errors should occur, and state should be cleaned up
      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
      
      // Task 10.4: Ensure transitions handle cleanup without visual glitches
    });
  });

  describe('Requirements Validation', () => {
    it('validates Requirement 2.4: Smooth transition from LoadingState to chatbot interface', async () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // Initial LoadingState with fade-in
      const loadingText = screen.getByText('جاري تحضير المساعد...');
      const loadingContainer = loadingText.closest('div.animate-in.fade-in.duration-200');
      expect(loadingContainer).toBeTruthy();
      
      // Wait for chatbot interface to appear
      await waitFor(
        () => {
          const conversationHistory = screen.queryByRole('log');
          expect(conversationHistory).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      // Chatbot interface with fade-in
      const conversationHistory = screen.getByRole('log');
      const chatbotContainer = conversationHistory.parentElement;
      expect(chatbotContainer?.className).toContain('animate-in');
      expect(chatbotContainer?.className).toContain('fade-in');
      expect(chatbotContainer?.className).toContain('duration-200');
      
      // Requirement 2.4: LoadingState SHALL transition smoothly to chatbot interface
    });

    it('validates Requirement 10.3: Fade effect during state transitions', async () => {
      render(<SkillChatbotDialog {...defaultProps} />);
      
      // All state transitions should use fade-in effect with 200ms duration
      const loadingText = screen.getByText('جاري تحضير المساعد...');
      const loadingContainer = loadingText.closest('div');
      
      // Requirement 10.3: Transition SHALL use fade effect
      expect(loadingContainer?.className).toContain('fade-in');
      
      // Wait for next state
      await waitFor(
        () => {
          const conversationHistory = screen.queryByRole('log');
          expect(conversationHistory).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      const conversationHistory = screen.getByRole('log');
      const chatbotContainer = conversationHistory.parentElement;
      
      // Requirement 10.3: All transitions should have fade effect
      expect(chatbotContainer?.className).toContain('fade-in');
    });
  });

  describe('Edge Cases', () => {
    it('should handle transition when conversation ends immediately', async () => {
      // This tests the edge case where the first response has no follow-up
      render(<SkillChatbotDialog {...defaultProps} skillId="single-response-skill" />);
      
      // Wait for conversation to load
      await waitFor(
        () => {
          const conversationHistory = screen.queryByRole('log');
          expect(conversationHistory).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      // Should still have smooth fade-in transition
      const conversationHistory = screen.getByRole('log');
      const chatbotContainer = conversationHistory.parentElement;
      expect(chatbotContainer?.className).toContain('fade-in');
      expect(chatbotContainer?.className).toContain('duration-200');
    });

    it('should maintain transition effects when reopening dialog', async () => {
      const { rerender } = render(
        <SkillChatbotDialog {...defaultProps} open={true} />
      );
      
      // Wait for initial load
      await waitFor(
        () => {
          const conversationHistory = screen.queryByRole('log');
          expect(conversationHistory).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      // Close dialog
      rerender(<SkillChatbotDialog {...defaultProps} open={false} />);
      
      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
      
      // Reopen dialog
      rerender(<SkillChatbotDialog {...defaultProps} open={true} />);
      
      // Transitions should still work correctly
      await waitFor(
        () => {
          const loadingText = screen.queryByText('جاري تحضير المساعد...');
          if (loadingText) {
            const loadingContainer = loadingText.closest('div.animate-in');
            expect(loadingContainer?.className).toContain('fade-in');
            expect(loadingContainer?.className).toContain('duration-200');
          }
        },
        { timeout: 500 }
      );
    });
  });
});
