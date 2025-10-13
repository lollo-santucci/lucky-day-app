/**
 * Centralized LLM Service
 * Handles all AI/LLM interactions for the Lucky Day app
 */

import OpenAI from 'openai';

// LLM Configuration
interface LLMConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

// LLM Request interface
interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

// LLM Response interface
interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Centralized LLM Service Class
 * Manages all interactions with OpenAI and other LLM providers
 */
export class LLMService {
  private openai: OpenAI;
  private config: LLMConfig;
  private isAvailable: boolean = false;

  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
      model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o', // Configurable model, defaults to GPT-4o
      maxTokens: 150,
      temperature: 0.7,
      timeout: 10000,
      ...config
    };

    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
    });

    // Check if service is available
    this.isAvailable = !!this.config.apiKey;
  }

  /**
   * Check if LLM service is available
   */
  public isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Main method to generate content using LLM
   */
  public async generateContent(request: LLMRequest): Promise<LLMResponse> {
    if (!this.isAvailable) {
      throw new Error('LLM service is not available - missing API key');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: request.systemPrompt
          },
          {
            role: "user",
            content: request.userPrompt
          }
        ],
        max_tokens: request.maxTokens || this.config.maxTokens,
        temperature: request.temperature || this.config.temperature,
      });

      const content = completion.choices[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error('No content generated from LLM');
      }

      return {
        content,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        } : undefined
      };

    } catch (error) {
      console.warn('LLM generation failed:', error);
      throw error;
    }
  }



  /**
   * Specialized method for generating fortune messages
   * (To be used in future tasks)
   */
  public async generateFortune(context: { zodiac: string; element: string; date: Date }): Promise<string> {
    const systemPrompt = "You are a wise Chinese fortune teller. Create mystical, positive fortune messages that feel authentic and meaningful.";
    
    const userPrompt = `Generate a fortune message for someone born in the year of the ${context.zodiac} with element ${context.element}. The fortune is for ${context.date.toDateString()}.

Requirements:
- Maximum 200 characters
- Positive and mystical tone
- Reference the zodiac animal and element subtly
- Focus on opportunities, wisdom, and growth
- Sound like traditional Chinese wisdom

Return only the fortune message.`;

    const response = await this.generateContent({
      systemPrompt,
      userPrompt,
      maxTokens: 80,
      temperature: 0.8
    });

    // Ensure message is within character limit
    if (response.content.length > 200) {
      return response.content.substring(0, 197) + '...';
    }

    return response.content;
  }

  /**
   * Specialized method for generating pillar descriptions
   * (To be used in future tasks)
   */
  public async generatePillarDescription(pillarType: string, stem: string, branch: string, element: string): Promise<string> {
    const systemPrompt = "You are a master of Chinese Four Pillars astrology. Create poetic, mystical descriptions for each pillar.";
    
    const userPrompt = `Generate a mystical description for the ${pillarType} pillar with stem ${stem}, branch ${branch}, and element ${element}.

Requirements:
- 1-2 sentences maximum
- Poetic and mystical language
- Reference the pillar's meaning (Year=Destiny, Month=Environment, Day=Essence, Hour=Inner Heart)
- Include the element's influence
- Sound wise and traditional

Return only the description.`;

    const response = await this.generateContent({
      systemPrompt,
      userPrompt,
      maxTokens: 60,
      temperature: 0.6
    });

    return response.content;
  }

  /**
   * Get service statistics (for monitoring/debugging)
   */
  public getServiceInfo() {
    return {
      isAvailable: this.isAvailable,
      model: this.config.model,
      hasApiKey: !!this.config.apiKey
    };
  }
}

// Export singleton instance
export const llmService = new LLMService();