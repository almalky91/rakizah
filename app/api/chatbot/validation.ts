/**
 * Input Validation and Sanitization
 * Single Responsibility: Validate and sanitize user input
 */

import { z } from 'zod';

export const ChatbotRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  skillId: z.string().uuid('Invalid skill ID'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

export type ChatbotRequest = z.infer<typeof ChatbotRequestSchema>;

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatbotResponse {
  response: string;
  options: string[];
}

export class InputSanitizer {
  private static readonly INAPPROPRIATE_PATTERNS = [
    /ignore\s+previous\s+instructions?/i,
    /تجاهل\s+التعليمات\s+السابقة/i,
    /forget\s+everything/i,
    /انسَ\s+كل\s+شيء/i,
    /you\s+are\s+now/i,
    /أنت\s+الآن/i,
    /new\s+instructions?/i,
    /تعليمات\s+جديدة/i,
    /disregard\s+the\s+above/i,
    /تجاهل\s+ما\s+سبق/i,
  ];

  static sanitize(input: string): string {
    // Check for inappropriate patterns
    for (const pattern of this.INAPPROPRIATE_PATTERNS) {
      if (pattern.test(input)) {
        throw new Error('Your message contains inappropriate content. Please rephrase your question.');
      }
    }

    // Remove potential control characters
    const sanitized = input
      .replace(/[\x00-\x1F\x7F]/g, '')
      .trim();

    return sanitized;
  }

  static validateRequest(body: unknown): ChatbotRequest {
    const result = ChatbotRequestSchema.safeParse(body);
    
    if (!result.success) {
      throw new Error('Invalid request data');
    }

    return result.data;
  }
}
