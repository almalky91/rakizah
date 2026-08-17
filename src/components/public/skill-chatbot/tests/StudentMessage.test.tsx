import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentMessage } from '../StudentMessage';

describe('StudentMessage', () => {
  it('renders with content and timestamp', () => {
    const testDate = new Date('2024-01-15T14:30:00');
    
    render(
      <StudentMessage 
        content="ما هي هذه المهارة؟"
        timestamp={testDate}
      />
    );
    
    // Verify message content is displayed
    expect(screen.getByText('ما هي هذه المهارة؟')).toBeInTheDocument();
    
    // Verify data-testid is present
    expect(screen.getByTestId('student-message')).toBeInTheDocument();
  });

  it('displays timestamp in Arabic locale', () => {
    const testDate = new Date('2024-01-15T14:30:00');
    
    render(
      <StudentMessage 
        content="شكراً"
        timestamp={testDate}
      />
    );
    
    // Check that timestamp is rendered (format may vary by environment)
    const timestampElement = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timestampElement).toBeInTheDocument();
    expect(timestampElement).toHaveClass('text-muted-foreground');
  });

  it('has distinct styling from AI messages', () => {
    render(
      <StudentMessage 
        content="Test message"
        timestamp={new Date()}
      />
    );
    
    // Verify it uses secondary color scheme (different from AI's primary)
    const card = screen.getByTestId('student-message').querySelector('.bg-secondary\\/30');
    expect(card).toBeInTheDocument();
  });

  it('aligns to left for RTL layout', () => {
    render(
      <StudentMessage 
        content="Test"
        timestamp={new Date()}
      />
    );
    
    const container = screen.getByTestId('student-message');
    expect(container).toHaveClass('justify-start'); // Left alignment for RTL
  });

  it('displays user icon', () => {
    const { container } = render(
      <StudentMessage 
        content="Test"
        timestamp={new Date()}
      />
    );
    
    // Check for User icon (lucide-react renders as svg)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
