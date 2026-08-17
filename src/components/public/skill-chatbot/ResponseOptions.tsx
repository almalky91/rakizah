import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ResponseOption } from '@/types/chatbot';

/**
 * Display predefined response buttons with responsive grid layout.
 * 
 * Validates Requirements:
 * - 5.1: Response_Options display as clickable buttons after Typewriter_Effect
 * - 5.2: Response_Options display in a grid layout with proper spacing
 * - 5.6: Response_Options are disabled during Loading_State and Typewriter_Effect
 * - 8.2: Mobile devices (width < 640px) display elements comfortably
 * - 8.5: Response_Options stack vertically on narrow screens and horizontally on wider screens
 * - 9.1: Touch targets are optimized for mobile interaction (44x44px minimum)
 * 
 * Task 14.4 Implementation:
 * - Set minimum touch target size of 44x44px for all response buttons
 * - Add appropriate padding (px-4 py-3) for comfortable touch interaction
 * - Implement touch feedback states (active:scale-[0.98], active:bg-accent/70)
 * - Ensure buttons meet mobile accessibility standards for touch targets
 * 
 * Task 20.1: Performance Optimization
 * - Wrapped in React.memo with custom comparison function
 * - Prevents re-renders when options array or disabled state hasn't changed
 * - Custom comparison checks options array content deeply
 * 
 * Props:
 * - options: Array of response options to display
 * - onSelect: Callback when user selects an option
 * - disabled: Whether buttons should be disabled
 */
export interface ResponseOptionsProps {
  options: ResponseOption[];
  onSelect: (option: ResponseOption) => void;
  disabled: boolean;
}

const ResponseOptionsComponent: React.FC<ResponseOptionsProps> = ({
  options,
  onSelect,
  disabled,
}) => {
  return (
    <div
      className={cn(
        // Responsive grid layout:
        // - 1 column on mobile (< 640px)
        // - 2 columns on tablet (>= 640px)
        // - 3 columns on desktop (>= 768px)
        'grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
        // Fade-in animation when enabled - Task 10.2 & Task 20.2
        // Fine-tuned to 250ms for optimal smoothness (balanced between spec's 150ms and feel)
        'animate-in fade-in slide-in-from-bottom-2 duration-[250ms]',
        // Padding for spacing
        'pt-4'
      )}
      data-testid="response-options-container"
    >
      {options.map((option, index) => (
        <Button
          key={option.id}
          variant="outline"
          size="default"
          onClick={() => onSelect(option)}
          disabled={disabled}
          data-testid="response-option"
          style={{
            fontFeatureSettings: '"liga" 1, "calt" 1',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            lineHeight: '1.75',
            // Staggered animation delay for each button - Task 20.2
            // Creates a subtle cascading effect for better visual polish
            animationDelay: `${index * 50}ms`,
          }}
          className={cn(
            // Text wrapping for longer options with proper line height for Arabic
            'whitespace-normal text-right h-auto leading-relaxed text-base',
            // Mobile-optimized touch targets (44x44px minimum) - Task 14.4
            // Ensures comfortable touch interaction on mobile devices
            'min-h-[44px] min-w-[44px] px-4 py-3',
            // Disabled state styling - reduced opacity and no hover effects
            disabled && 'cursor-not-allowed opacity-50',
            // Enhanced hover effects with scale and shadow - Task 20.2
            // Refined timing: 180ms for snappier feel
            !disabled && 'hover:bg-accent/50 hover:scale-[1.02] hover:shadow-md',
            !disabled && 'transition-all duration-[180ms] ease-out',
            // Active/pressed states with scale down and darker background - Task 20.2
            // Provides tactile feedback when button is pressed
            !disabled && 'active:scale-[0.97] active:bg-accent/80 active:shadow-sm',
            // Focus states for accessibility
            'focus-visible:ring-2 focus-visible:ring-offset-2',
            // Subtle animation for appearing buttons - Task 20.2
            'animate-in fade-in slide-in-from-bottom-1 duration-200'
          )}
        >
          {option.text}
        </Button>
      ))}
    </div>
  );
};

/**
 * Custom comparison function for React.memo
 * Re-render only if options array changes or disabled state changes
 * Compares options array by length and individual option properties
 */
const areEqual = (prevProps: ResponseOptionsProps, nextProps: ResponseOptionsProps) => {
  // Check disabled state
  if (prevProps.disabled !== nextProps.disabled) {
    return false;
  }
  
  // Check options array length
  if (prevProps.options.length !== nextProps.options.length) {
    return false;
  }
  
  // Check each option's properties
  for (let i = 0; i < prevProps.options.length; i++) {
    const prevOption = prevProps.options[i];
    const nextOption = nextProps.options[i];
    
    if (
      prevOption.id !== nextOption.id ||
      prevOption.text !== nextOption.text ||
      prevOption.nextNodeId !== nextOption.nextNodeId
    ) {
      return false;
    }
  }
  
  return true;
};

/**
 * Memoized ResponseOptions component to prevent unnecessary re-renders
 * Uses custom comparison to check options array content and disabled state
 */
export const ResponseOptions = React.memo(ResponseOptionsComponent, areEqual);
