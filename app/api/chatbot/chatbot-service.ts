/**
 * Chatbot Service
 * Single Responsibility: Orchestrate chatbot workflow
 * Dependency Inversion: Depends on abstractions (interfaces), not concrete implementations
 */

import { ISkillRepository } from './skill-repository';
import { IAIService } from './ai-service';
import { InputSanitizer, ChatbotRequest, ChatbotResponse, ConversationMessage } from './validation';
import { PromptBuilder } from './prompt-builder';
import { ResponseParser } from './response-parser';

export class ChatbotService {
  constructor(
    private readonly skillRepository: ISkillRepository,
    private readonly aiService: IAIService
  ) {}

  async processMessage(request: ChatbotRequest): Promise<ChatbotResponse> {
    // 1. Sanitize user input
    const sanitizedMessage = InputSanitizer.sanitize(request.message);

    // 2. Fetch skill data
    const skillData = await this.skillRepository.findById(request.skillId);
    if (!skillData) {
      throw new Error('Skill not found');
    }

    // 3. Build system prompt
    const systemPrompt = PromptBuilder.buildSystemPrompt(skillData);
    console.log(systemPrompt);
    // 4. Prepare conversation messages
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt },
      ...request.conversationHistory,
      { 
        role: 'user', 
        content: PromptBuilder.wrapUserMessage(sanitizedMessage) 
      },
    ];

    // 5. Generate AI response with increased token limit for complete Arabic responses
    const aiResponse = await this.aiService.generateResponse({
      messages,
      temperature: 0.7,
      maxTokens: 3000,
    });

    // 6. Parse and return response
    return ResponseParser.parse(aiResponse.content);
  }
}
