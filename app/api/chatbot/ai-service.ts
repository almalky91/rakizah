/**
 * AI Service
 * Single Responsibility: Handle DeepSeek API communication
 * Interface Segregation: Provides focused interface for AI operations
 */

import { ChatbotConfig } from './config';
import { ConversationMessage } from './validation';

export interface AIRequest {
  messages: ConversationMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
}

export interface IAIService {
  generateResponse(request: AIRequest): Promise<AIResponse>;
}

export class DeepSeekService implements IAIService {
  constructor(private readonly config: ChatbotConfig) {}

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const { messages, temperature = 0.7, maxTokens = 3000 } = request;

    try {
      const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: messages,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('DeepSeek API error:', errorData);
        throw new Error('Failed to generate AI response');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content received from AI');
      }

      return { content };
    } catch (error) {
      console.error('DeepSeek service error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Unknown error in AI service');
    }
  }
}
