/**
 * Response Parser
 * Single Responsibility: Parse and validate AI responses
 */

import { ChatbotResponse } from './validation';

export class ResponseParser {
  private static readonly DEFAULT_OPTIONS = [
    'هل يمكنك توضيح هذه النقطة بشكل أكبر؟',
    'هل يمكنك إعطائي مثالاً آخر؟',
    'ما هي الخطوة التالية في التعلم؟',
  ];

  /**
   * Parse AI response content into structured format
   * Handles both valid JSON and plain text responses
   */
  static parse(content: string): ChatbotResponse {
    try {
      const parsed = JSON.parse(content);
      
      // Validate and normalize the parsed response
      return this.normalizeResponse(parsed);
    } catch {
      // If JSON parsing fails, create a structured response from plain text
      return {
        response: content,
        options: this.DEFAULT_OPTIONS,
      };
    }
  }

  /**
   * Normalize parsed response to ensure it has required fields
   */
  private static normalizeResponse(parsed: any): ChatbotResponse {
    const response = typeof parsed.response === 'string' 
      ? parsed.response 
      : JSON.stringify(parsed);

    const options = Array.isArray(parsed.options) && parsed.options.length > 0
      ? parsed.options.filter((opt: any) => typeof opt === 'string')
      : this.DEFAULT_OPTIONS;

    return {
      response,
      options,
    };
  }
}
