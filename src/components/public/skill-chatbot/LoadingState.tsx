import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Display loading animation during response simulation.
 * 
 * Props:
 * - message: Optional custom loading message (defaults to Arabic "Preparing assistant...")
 * - variant: Display variant - 'spinner' for traditional spinner or 'skeleton' for content placeholders
 * 
 * Requirements: 2.1, 2.2, 2.5, 11.4
 * 
 * Task 20.2: Visual Polish Enhancement
 * - Added 'skeleton' variant with content placeholders for more polished loading experience
 * - Skeleton provides better visual continuity and reduces perceived loading time
 * - Default to spinner for initial load, skeleton for response transitions
 */
interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'جاري تحضير المساعد...',
  variant = 'spinner',
}) => {
  // Skeleton loading variant - more polished for response transitions
  if (variant === 'skeleton') {
    return (
      <div 
        className="flex flex-col gap-3 animate-in fade-in duration-200"
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        {/* Simulate AI message bubble with skeleton */}
        <div className="flex justify-end">
          <div className="max-w-[85%] bg-muted/50 rounded-lg p-4 space-y-2">
            {/* Skeleton lines with varying widths */}
            <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-[90%]" />
            <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-[75%]" />
            <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-[85%]" />
          </div>
        </div>
        
        {/* Optional loading text */}
        <p 
          className="text-center text-muted-foreground text-xs" 
          dir="rtl"
          style={{
            fontFeatureSettings: '"liga" 1, "calt" 1',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            lineHeight: '1.6',
          }}
        >
          {message}
        </p>
      </div>
    );
  }

  // Default spinner variant - clean and simple for initial load
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[200px] gap-4 animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Spinner animation */}
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      
      {/* Arabic loading text with optimized font rendering */}
      <p 
        className="text-center text-muted-foreground text-sm" 
        dir="rtl"
        style={{
          fontFeatureSettings: '"liga" 1, "calt" 1',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          lineHeight: '1.6',
        }}
      >
        {message}
      </p>
    </div>
  );
};
