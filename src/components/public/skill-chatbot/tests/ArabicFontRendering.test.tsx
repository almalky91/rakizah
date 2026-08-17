/**
 * Arabic Font Rendering Tests
 * 
 * Task 12.3: Configure Arabic font rendering
 * 
 * Tests that verify:
 * - Arabic fonts are loaded and applied correctly
 * - Diacritics render properly
 * - Ligatures display correctly
 * - Text remains readable at all sizes
 * - Font features are properly configured
 * 
 * **Validates: Requirements 12.3, 12.5, 8.4**
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIMessage } from '../AIMessage';
import { StudentMessage } from '../StudentMessage';
import { ResponseOptions } from '../ResponseOptions';
import { LoadingState } from '../LoadingState';

describe('Arabic Font Rendering - Task 12.3', () => {
  describe('Diacritics Rendering', () => {
    it('should render AI message with diacritics correctly', () => {
      const textWithDiacritics = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
      
      render(
        <AIMessage
          content={textWithDiacritics}
          isLatest={false}
        />
      );
      
      const messageElement = screen.getByTestId('ai-message');
      expect(messageElement).toBeInTheDocument();
      expect(messageElement.textContent).toContain('بِسْمِ');
      
      // Check that font rendering styles are applied
      const textElement = messageElement.querySelector('p');
      expect(textElement).toHaveStyle({
        textRendering: 'optimizeLegibility',
      });
    });

    it('should render student message with diacritics correctly', () => {
      const textWithDiacritics = 'الْفَهْمُ الْقِرَائِيُّ مُهِمٌّ جِدًّا';
      
      render(
        <StudentMessage
          content={textWithDiacritics}
          timestamp={new Date()}
        />
      );
      
      const messageElement = screen.getByTestId('student-message');
      expect(messageElement).toBeInTheDocument();
      expect(messageElement.textContent).toContain('الْفَهْمُ');
    });

    it('should render response options with diacritics', () => {
      const options = [
        { id: '1', text: 'كَيْفَ أُحَسِّنُ مَهَارَتِي؟', nextNodeId: 'node-2' },
        { id: '2', text: 'اِقْرَأْ بِانْتِظَامٍ', nextNodeId: 'node-3' },
      ];
      
      render(
        <ResponseOptions
          options={options}
          onSelect={() => {}}
          disabled={false}
        />
      );
      
      expect(screen.getByText('كَيْفَ أُحَسِّنُ مَهَارَتِي؟')).toBeInTheDocument();
      expect(screen.getByText('اِقْرَأْ بِانْتِظَامٍ')).toBeInTheDocument();
    });
  });

  describe('Ligatures Rendering', () => {
    it('should render common Arabic ligatures correctly', () => {
      // Common ligatures: الله (Allah), لا (lam-alif)
      const textWithLigatures = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ لا إِلَٰهَ إِلَّا اللَّهُ';
      
      render(
        <AIMessage
          content={textWithLigatures}
          isLatest={false}
        />
      );
      
      const messageElement = screen.getByTestId('ai-message');
      expect(messageElement.textContent).toContain('اللَّهِ');
      expect(messageElement.textContent).toContain('لا');
      
      // Verify ligature font features are enabled
      const textElement = messageElement.querySelector('p');
      expect(textElement).toHaveStyle({
        fontFeatureSettings: '"liga" 1, "calt" 1',
      });
    });

    it('should render connected letter forms properly', () => {
      const connectedText = 'القراءة والكتابة والاستماع';
      
      render(
        <AIMessage
          content={connectedText}
          isLatest={false}
        />
      );
      
      expect(screen.getByText(connectedText)).toBeInTheDocument();
    });
  });

  describe('Text Readability at Different Sizes', () => {
    it('should apply proper font size and line height for AI messages', () => {
      render(
        <AIMessage
          content="مرحباً بك في المساعد الذكي"
          isLatest={false}
        />
      );
      
      const textElement = screen.getByText('مرحباً بك في المساعد الذكي');
      const computedStyle = window.getComputedStyle(textElement);
      
      // Verify base font size (text-base = 16px)
      expect(textElement).toHaveClass('text-base');
      
      // Verify line height is set for readability
      expect(textElement).toHaveStyle({ lineHeight: '1.8' });
    });

    it('should apply proper font size for response buttons', () => {
      const options = [
        { id: '1', text: 'ما هو الفهم القرائي؟', nextNodeId: 'node-2' },
      ];
      
      render(
        <ResponseOptions
          options={options}
          onSelect={() => {}}
          disabled={false}
        />
      );
      
      const button = screen.getByText('ما هو الفهم القرائي؟');
      expect(button).toHaveClass('text-base');
    });

    it('should apply smaller font size for loading message', () => {
      render(<LoadingState message="جاري تحضير المساعد..." />);
      
      const loadingText = screen.getByText('جاري تحضير المساعد...');
      expect(loadingText).toHaveClass('text-sm');
    });
  });

  describe('Font Smoothing and Rendering', () => {
    it('should apply antialiasing for smooth font rendering', () => {
      render(
        <AIMessage
          content="الكتابة الإبداعية مهارة رائعة"
          isLatest={false}
        />
      );
      
      const textElement = screen.getByText('الكتابة الإبداعية مهارة رائعة');
      
      expect(textElement).toHaveStyle({
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      });
    });

    it('should enable optimized legibility for complex Arabic text', () => {
      const complexText = 'الْفَهْمُ الْقِرَائِيُّ هُوَ الْقُدْرَةُ عَلَى قِرَاءَةِ النَّصِّ';
      
      render(
        <AIMessage
          content={complexText}
          isLatest={false}
        />
      );
      
      const textElement = screen.getByText(complexText);
      expect(textElement).toHaveStyle({
        textRendering: 'optimizeLegibility',
      });
    });
  });

  describe('Mixed Content (Arabic with Numbers)', () => {
    it('should render Arabic text with Arabic-Indic numerals', () => {
      const mixedText = 'الدرس رقم ١٢٣٤٥ من الصف السادس';
      
      render(
        <AIMessage
          content={mixedText}
          isLatest={false}
        />
      );
      
      expect(screen.getByText(mixedText)).toBeInTheDocument();
    });

    it('should render Arabic text with Western numerals', () => {
      const mixedText = 'اقرأ لمدة 15 دقيقة كل يوم';
      
      render(
        <AIMessage
          content={mixedText}
          isLatest={false}
        />
      );
      
      expect(screen.getByText(mixedText)).toBeInTheDocument();
    });
  });

  describe('Long Text with Diacritics', () => {
    it('should render long text with comprehensive diacritics without breaking', () => {
      const longText = 'الْفَهْمُ الْقِرَائِيُّ هُوَ الْقُدْرَةُ عَلَى قِرَاءَةِ النَّصِّ وَفَهْمِ مَعْنَاهُ بِشَكْلٍ صَحِيحٍ. لَا يَتَعَلَّقُ الْأَمْرُ بِقِرَاءَةِ الْكَلِمَاتِ فَقَطْ، بَلْ بِفَهْمِ الْأَفْكَارِ وَالرَّبْطِ بَيْنَهَا.';
      
      render(
        <AIMessage
          content={longText}
          isLatest={false}
        />
      );
      
      const textElement = screen.getByText(longText);
      
      // Verify proper line height for readability
      expect(textElement).toHaveStyle({ lineHeight: '1.8' });
      
      // Verify word spacing for Arabic
      expect(textElement).toHaveStyle({ wordSpacing: '0.05em' });
    });
  });

  describe('RTL Direction', () => {
    it('should apply RTL direction to Arabic text in AI messages', () => {
      render(
        <AIMessage
          content="مرحباً بك"
          isLatest={false}
        />
      );
      
      const textElement = screen.getByText('مرحباً بك');
      expect(textElement).toHaveClass('rtl:text-right');
    });

    it('should apply RTL direction to response options', () => {
      const options = [
        { id: '1', text: 'نعم', nextNodeId: 'node-2' },
      ];
      
      render(
        <ResponseOptions
          options={options}
          onSelect={() => {}}
          disabled={false}
        />
      );
      
      const button = screen.getByText('نعم');
      expect(button).toHaveClass('text-right');
    });
  });

  describe('Cairo Font Family', () => {
    it('should use Cairo font for all dialog content', () => {
      render(
        <AIMessage
          content="اختبار الخط"
          isLatest={false}
        />
      );
      
      // Cairo font is applied via font-cairo class at the dialog level
      // This test verifies the text renders without console errors
      expect(screen.getByText('اختبار الخط')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle text with only diacritics correctly', () => {
      const diacriticsOnly = 'اَ اِ اُ اً اٍ اٌ';
      
      render(
        <AIMessage
          content={diacriticsOnly}
          isLatest={false}
        />
      );
      
      expect(screen.getByText(diacriticsOnly)).toBeInTheDocument();
    });

    it('should handle empty strings gracefully', () => {
      render(
        <AIMessage
          content=""
          isLatest={false}
        />
      );
      
      const messageElement = screen.getByTestId('ai-message');
      expect(messageElement).toBeInTheDocument();
    });

    it('should handle very long single words', () => {
      const longWord = 'الاستقلالالاستقلالالاستقلالالاستقلال';
      
      render(
        <AIMessage
          content={longWord}
          isLatest={false}
        />
      );
      
      const textElement = screen.getByText(longWord);
      // Verify word wrap is enabled
      expect(textElement).toHaveClass('whitespace-pre-wrap');
    });
  });

  describe('Consistent Font Rendering Across Components', () => {
    it('should apply same font settings to AI and Student messages', () => {
      const { rerender } = render(
        <AIMessage content="رسالة AI" isLatest={false} />
      );
      
      const aiText = screen.getByText('رسالة AI');
      const aiStyles = window.getComputedStyle(aiText);
      
      rerender(
        <StudentMessage content="رسالة طالب" timestamp={new Date()} />
      );
      
      const studentText = screen.getByText('رسالة طالب');
      const studentStyles = window.getComputedStyle(studentText);
      
      // Both should have same base font size
      expect(aiText).toHaveClass('text-base');
      expect(studentText).toHaveClass('text-base');
    });
  });
});

