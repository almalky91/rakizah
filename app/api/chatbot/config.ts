/**
 * Chatbot Configuration
 * Single Responsibility: Manage environment configuration
 */

export interface ChatbotConfig {
  apiKey: string;
  apiUrl: string;
  modelName: string;
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  
  private constructor(
    private readonly config: ChatbotConfig
  ) {}

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      const apiKey = process.env.MODEL_API_KEY;
      
      if (!apiKey) {
        throw new Error('MODEL_API_KEY is not configured');
      }

      ConfigurationService.instance = new ConfigurationService({
        apiKey,
        apiUrl: process.env.MODEL_API || 'https://api.deepseek.com',
        modelName: process.env.MODEL_NAME || 'deepseek-chat',
      });
    }
    
    return ConfigurationService.instance;
  }

  getConfig(): ChatbotConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}
