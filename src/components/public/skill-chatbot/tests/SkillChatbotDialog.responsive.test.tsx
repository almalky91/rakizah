import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillChatbotDialog } from '../SkillChatbotDialog';

/**
 * Responsive Dialog Width Tests
 * 
 * Validates Requirements:
 * - 8.1: Dialog adapts its width to screen size
 * - 8.2: 95% width for mobile (< 640px)
 * - 8.3: Maximum width of 600px for desktop (>= 640px)
 * 
 * Task 14.1: Configure responsive dialog width
 * - Set dialog width to 95% for mobile (< 640px)
 * - Set max-width to 600px (2xl) for desktop (>= 640px)
 * - Use Tailwind responsive utilities (sm:, md:, lg:)
 */
describe('SkillChatbotDialog - Responsive Width', () => {
  it('should apply 95% width class for mobile viewports', () => {
    render(
      <SkillChatbotDialog
        skillId="test-skill-1"
        skillTitle="مهارة الاختبار"
        open={true}
        onOpenChange={() => {}}
      />
    );

    const dialogContent = document.querySelector('[dir="rtl"]');
    
    expect(dialogContent).toBeTruthy();
    expect(dialogContent?.className).toContain('w-[95%]');
  });

  it('should apply max-width 600px class for desktop viewports', () => {
    render(
      <SkillChatbotDialog
        skillId="test-skill-1"
        skillTitle="مهارة الاختبار"
        open={true}
        onOpenChange={() => {}}
      />
    );

    const dialogContent = document.querySelector('[dir="rtl"]');
    
    expect(dialogContent).toBeTruthy();
    expect(dialogContent?.className).toContain('sm:max-w-[600px]');
  });

  it('should use Tailwind responsive utility classes', () => {
    render(
      <SkillChatbotDialog
        skillId="test-skill-1"
        skillTitle="مهارة الاختبار"
        open={true}
        onOpenChange={() => {}}
      />
    );

    const dialogContent = document.querySelector('[dir="rtl"]');
    
    // Verify that responsive classes are applied
    const className = dialogContent?.className || '';
    
    // Mobile: w-[95%]
    expect(className).toContain('w-[95%]');
    
    // Desktop: sm:max-w-[600px] (sm breakpoint is 640px)
    expect(className).toContain('sm:max-w-[600px]');
  });

  it('should maintain other layout classes alongside responsive width', () => {
    render(
      <SkillChatbotDialog
        skillId="test-skill-1"
        skillTitle="مهارة الاختبار"
        open={true}
        onOpenChange={() => {}}
      />
    );

    const dialogContent = document.querySelector('[dir="rtl"]');
    
    const className = dialogContent?.className || '';
    
    // Verify width classes
    expect(className).toContain('w-[95%]');
    expect(className).toContain('sm:max-w-[600px]');
    
    // Verify other layout classes are preserved
    expect(className).toContain('max-h-[85vh]');
    expect(className).toContain('flex');
    expect(className).toContain('flex-col');
    expect(className).toContain('p-0');
  });
});
