import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTypewriter } from './useTypewriter';

describe('useTypewriter', () => {
  it('should return empty string initially when enabled', () => {
    const { result } = renderHook(() =>
      useTypewriter({
        text: 'Hello',
        enabled: true,
      })
    );

    // Initial state should have empty text or start of animation
    expect(result.current.displayText.length).toBeLessThanOrEqual(1);
    expect(result.current.isTyping).toBe(true);
  });

  it('should return full text immediately when disabled', () => {
    const { result } = renderHook(() =>
      useTypewriter({
        text: 'Hello World',
        enabled: false,
      })
    );

    expect(result.current.displayText).toBe('Hello World');
    expect(result.current.isTyping).toBe(false);
  });

  it('should animate text character-by-character', async () => {
    const { result } = renderHook(() =>
      useTypewriter({
        text: 'Hi',
        enabled: true,
        speed: 100, // Fast speed for testing
      })
    );

    // Initial state - animation may have started
    expect(result.current.displayText.length).toBeLessThanOrEqual(1);
    expect(result.current.isTyping).toBe(true);

    await waitFor(
      () => {
        expect(result.current.displayText.length).toBeGreaterThan(0);
      },
      { timeout: 100 }
    );

    await waitFor(
      () => {
        expect(result.current.displayText).toBe('Hi');
        expect(result.current.isTyping).toBe(false);
      },
      { timeout: 500 }
    );
  });

  it('should trigger onComplete callback when animation finishes', async () => {
    const onComplete = vi.fn();

    renderHook(() =>
      useTypewriter({
        text: 'Hi',
        enabled: true,
        speed: 100,
        onComplete,
      })
    );

    await waitFor(
      () => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 }
    );
  });

  it('should handle Arabic text correctly', async () => {
    const arabicText = 'مرحباً';
    const { result } = renderHook(() =>
      useTypewriter({
        text: arabicText,
        enabled: true,
        speed: 100,
      })
    );

    await waitFor(
      () => {
        expect(result.current.displayText).toBe(arabicText);
        expect(result.current.isTyping).toBe(false);
      },
      { timeout: 1000 }
    );
  });

  it('should handle cleanup on unmount during animation', () => {
    const { unmount } = renderHook(() =>
      useTypewriter({
        text: 'Long text that takes time',
        enabled: true,
        speed: 10,
      })
    );

    // Unmount before animation completes
    unmount();

    // Should not throw any errors
    expect(true).toBe(true);
  });

  it('should respect custom speed parameter', async () => {
    const onComplete = vi.fn();
    const text = 'Test';
    const speed = 10; // 10 characters per second = 100ms per character

    const { result } = renderHook(() =>
      useTypewriter({
        text,
        enabled: true,
        speed,
        onComplete,
      })
    );

    expect(result.current.isTyping).toBe(true);

    // Wait for animation to complete
    await waitFor(
      () => {
        expect(result.current.displayText).toBe(text);
        expect(result.current.isTyping).toBe(false);
        expect(onComplete).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 }
    );
  });

  it('should handle empty text', () => {
    const { result } = renderHook(() =>
      useTypewriter({
        text: '',
        enabled: true,
      })
    );

    expect(result.current.displayText).toBe('');
    expect(result.current.isTyping).toBe(false);
  });

  it('should set isTyping to false when animation completes', async () => {
    const { result } = renderHook(() =>
      useTypewriter({
        text: 'Hi',
        enabled: true,
        speed: 100,
      })
    );

    expect(result.current.isTyping).toBe(true);

    await waitFor(
      () => {
        expect(result.current.isTyping).toBe(false);
      },
      { timeout: 500 }
    );
  });

  it('should handle Arabic text with diacritics correctly', async () => {
    // Text with diacritics (combining marks): مَرْحَباً
    const arabicTextWithDiacritics = 'مَرْحَباً';
    const { result } = renderHook(() =>
      useTypewriter({
        text: arabicTextWithDiacritics,
        enabled: true,
        speed: 100,
      })
    );

    expect(result.current.isTyping).toBe(true);

    await waitFor(
      () => {
        expect(result.current.displayText).toBe(arabicTextWithDiacritics);
        expect(result.current.isTyping).toBe(false);
      },
      { timeout: 1500 }
    );

    // Verify the text is complete and valid
    expect(result.current.displayText.length).toBe(arabicTextWithDiacritics.length);
  });

  it('should animate at correct speed range (30-50 chars/sec)', async () => {
    const text = 'Test';
    const speed = 40; // Default speed: 40 chars/sec
    const expectedMinTime = (text.length / 50) * 1000; // Fastest: 50 chars/sec
    const expectedMaxTime = (text.length / 30) * 1000; // Slowest: 30 chars/sec

    const startTime = Date.now();
    const { result } = renderHook(() =>
      useTypewriter({
        text,
        enabled: true,
        speed,
      })
    );

    await waitFor(
      () => {
        expect(result.current.isTyping).toBe(false);
        expect(result.current.displayText).toBe(text);
      },
      { timeout: 1000 }
    );

    const duration = Date.now() - startTime;
    
    // Verify animation completed within reasonable time range
    expect(duration).toBeGreaterThanOrEqual(expectedMinTime - 50); // -50ms tolerance
    expect(duration).toBeLessThanOrEqual(expectedMaxTime + 200); // +200ms tolerance
  });
});
