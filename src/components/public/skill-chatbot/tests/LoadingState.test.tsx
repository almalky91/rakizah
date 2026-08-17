import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('renders with default Arabic message', () => {
    render(<LoadingState />);
    
    // Check if default Arabic message is displayed
    expect(screen.getByText('جاري تحضير المساعد...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'جاري تحميل البيانات...';
    render(<LoadingState message={customMessage} />);
    
    // Check if custom message is displayed
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('displays spinner animation', () => {
    const { container } = render(<LoadingState />);
    
    // Check if spinner (Loader2 icon) is present
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingState />);
    
    // Check for role="status" and aria-live
    const loadingContainer = screen.getByRole('status');
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
    expect(loadingContainer).toHaveAttribute('aria-label', 'جاري تحضير المساعد...');
  });

  it('has RTL text direction for Arabic text', () => {
    render(<LoadingState />);
    
    // Check if text has dir="rtl"
    const text = screen.getByText('جاري تحضير المساعد...');
    expect(text).toHaveAttribute('dir', 'rtl');
  });

  it('is centered with proper styling', () => {
    const { container } = render(<LoadingState />);
    
    // Check if container has centering classes
    const loadingContainer = container.querySelector('.flex.flex-col.items-center.justify-center');
    expect(loadingContainer).toBeInTheDocument();
  });
});
