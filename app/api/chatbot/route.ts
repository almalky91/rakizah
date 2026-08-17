/**
 * Chatbot API Route
 * 
 * - ConfigurationService: Manages environment configuration
 * - InputSanitizer: Validates and sanitizes user input
 * - SkillRepository: Handles data access for skills
 * - PromptBuilder: Generates system prompts
 * - DeepSeekService: Integrates with AI API
 * - ResponseParser: Parses AI responses
 * - ChatbotService: Orchestrates the workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConfigurationService } from './config';
import { InputSanitizer, ChatbotRequestSchema } from './validation';
import { SkillRepository } from './skill-repository';
import { DeepSeekService } from './ai-service';
import { ChatbotService } from './chatbot-service';

/**
 * POST /api/chatbot
 * Generates AI chatbot response for skill assistance
 * Body: { message: string, skillId: string, conversationHistory?: [] }
 * 
 * Public endpoint - no authentication required for students
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check configuration
    const configService = ConfigurationService.getInstance();
    if (!configService.isConfigured()) {
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'Chatbot service is not configured',
        },
        { status: 500 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = ChatbotRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const requestData = validationResult.data;

    // 3. Initialize services (Dependency Injection)
    const skillRepository = new SkillRepository();
    const aiService = new DeepSeekService(configService.getConfig());
    const chatbotService = new ChatbotService(skillRepository, aiService);

    // 4. Process the message through the service
    const response = await chatbotService.processMessage(requestData);

    // 5. Return successful response
    return NextResponse.json({
      data: response,
      message: 'Response generated successfully',
    });

  } catch (error) {
    console.error('Error generating chatbot response:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for known error messages
      if (error.message === 'Skill not found') {
        return NextResponse.json(
          {
            error: 'Not found',
            message: error.message,
          },
          { status: 404 }
        );
      }

      if (error.message.includes('inappropriate content')) {
        return NextResponse.json(
          {
            error: 'Invalid input',
            message: error.message,
          },
          { status: 400 }
        );
      }

      if (error.message.includes('AI response') || error.message.includes('DeepSeek')) {
        return NextResponse.json(
          {
            error: 'AI service error',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process chatbot request',
      },
      { status: 500 }
    );
  }
}
