import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponseOptions } from '../ResponseOptions';
import type { ResponseOption } from '@/types/chatbot';

describe('ResponseOptions', () => {
  const mockOptions: ResponseOption[] = [
    { id: 'opt-1', text: 'ما هي هذه المهارة؟', nextNodeId: 'node-2' },
    { id: 'opt-2', text: 'كيف أتعلم هذه المهارة؟', nextNodeId: 'node-3' },
    { id: 'opt-3', text: 'لم أفهم', nextNodeId: 'node-1' },
  ];

  it('renders all response options as buttons', () => {
    const onSelect = vi.fn();
    render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />);

    // Verify all buttons are rendered
    const buttons = screen.getAllByTestId('response-option');
    expect(buttons).toHaveLength(3);

    // Verify button text content
    expect(screen.getByText('ما هي هذه المهارة؟')).toBeInTheDocument();
    expect(screen.getByText('كيف أتعلم هذه المهارة؟')).toBeInTheDocument();
    expect(screen.getByText('لم أفهم')).toBeInTheDocument();
  });

  it('calls onSelect with correct option when button is clicked', () => {
    const onSelect = vi.fn();
    render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />);

    const firstButton = screen.getByText('ما هي هذه المهارة؟');
    fireEvent.click(firstButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('disables all buttons when disabled prop is true', () => {
    const onSelect = vi.fn();
    render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={true} />);

    const buttons = screen.getAllByTestId('response-option');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onSelect when disabled button is clicked', () => {
    const onSelect = vi.fn();
    render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={true} />);

    const firstButton = screen.getByText('ما هي هذه المهارة؟');
    fireEvent.click(firstButton);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders with responsive grid layout classes', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />
    );

    const gridContainer = container.querySelector('[data-testid="response-options-container"]');
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('sm:grid-cols-2');
    expect(gridContainer).toHaveClass('md:grid-cols-3');
  });

  it('renders empty when no options provided', () => {
    const onSelect = vi.fn();
    render(<ResponseOptions options={[]} onSelect={onSelect} disabled={false} />);

    const buttons = screen.queryAllByTestId('response-option');
    expect(buttons).toHaveLength(0);
  });

  it('handles single option correctly', () => {
    const onSelect = vi.fn();
    const singleOption: ResponseOption[] = [
      { id: 'opt-1', text: 'حسناً، فهمت', nextNodeId: null },
    ];

    render(<ResponseOptions options={singleOption} onSelect={onSelect} disabled={false} />);

    const button = screen.getByTestId('response-option');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('حسناً، فهمت')).toBeInTheDocument();

    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith(singleOption[0]);
  });

  // Task 14.4: Test mobile touch target optimizations
  it('applies minimum touch target size of 44x44px for mobile', () => {
    const onSelect = vi.fn();
    render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />);

    const buttons = screen.getAllByTestId('response-option');
    buttons.forEach((button) => {
      // Verify minimum height of 44px
      expect(button).toHaveClass('min-h-[44px]');
      // Verify minimum width of 44px
      expect(button).toHaveClass('min-w-[44px]');
      // Verify appropriate padding
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-3');
    });
  });

  it('applies touch feedback states for active/pressed interactions', () => {
    const onSelect = vi.fn();
    render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />);

    const buttons = screen.getAllByTestId('response-option');
    buttons.forEach((button) => {
      // Verify active state classes for touch feedback
      expect(button).toHaveClass('active:scale-[0.98]');
      expect(button).toHaveClass('active:bg-accent/70');
    });
  });

  it('applies focus-visible states for accessibility', () => {
    const onSelect = vi.fn();
    render(<ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />);

    const buttons = screen.getAllByTestId('response-option');
    buttons.forEach((button) => {
      // Verify focus states for keyboard navigation
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
    });
  });

  // Task 10.2: Test fade-in animation when options appear
  it('applies fade-in animation with 150ms duration when rendering', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />
    );

    const gridContainer = container.querySelector('[data-testid="response-options-container"]');
    
    // Verify fade-in animation classes are applied (Requirement 4.5, 10.4)
    expect(gridContainer).toHaveClass('animate-in');
    expect(gridContainer).toHaveClass('fade-in');
    expect(gridContainer).toHaveClass('duration-150');
  });

  it('container is conditionally rendered based on isTyping state in parent', () => {
    // This test verifies the component structure supports conditional rendering
    // The actual conditional rendering logic is tested in SkillChatbotDialog.test.tsx
    const onSelect = vi.fn();
    const { container } = render(
      <ResponseOptions options={mockOptions} onSelect={onSelect} disabled={false} />
    );

    const gridContainer = container.querySelector('[data-testid="response-options-container"]');
    expect(gridContainer).toBeInTheDocument();
    
    // Component should be ready for fade-in animation when rendered
    expect(gridContainer).toHaveClass('animate-in');
    expect(gridContainer).toHaveClass('fade-in');
  });
});
