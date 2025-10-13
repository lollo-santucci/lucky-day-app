/**
 * Unit tests for centralized LLM service
 * Tests LLM service functionality, fallback behavior, and error handling
 */

// Mock OpenAI before importing anything else
const mockCreate = jest.fn();
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  };
});

import { LLMService, llmService } from '../llm';


describe('LLM Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockReset();
    // Set up default mock response that meets validation requirements
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: 'Mystical Dragon'
        }
      }]
    });
  });
  describe('LLMService Class', () => {
    test('initializes correctly without API key', () => {
      const service = new LLMService({ apiKey: '' });

      expect(service.isServiceAvailable()).toBe(false);

      const info = service.getServiceInfo();
      expect(info.isAvailable).toBe(false);
      expect(info.hasApiKey).toBe(false);
      expect(info.model).toBe('gpt-4o');
    });

    test('initializes correctly with API key', () => {
      const service = new LLMService({ apiKey: 'test-key' });

      expect(service.isServiceAvailable()).toBe(true);

      const info = service.getServiceInfo();
      expect(info.isAvailable).toBe(true);
      expect(info.hasApiKey).toBe(true);
      expect(info.model).toBe('gpt-4o');
    });

    test('accepts custom configuration', () => {
      const service = new LLMService({
        apiKey: 'test-key',
        model: 'gpt-4',
        maxTokens: 200,
        temperature: 0.5
      });

      const info = service.getServiceInfo();
      expect(info.model).toBe('gpt-4');
    });

    test('throws error when generating content without API key', async () => {
      const service = new LLMService({ apiKey: '' });

      await expect(service.generateContent({
        systemPrompt: 'Test system',
        userPrompt: 'Test user'
      })).rejects.toThrow('LLM service is not available - missing API key');
    });

    test('generateContent works with valid API key', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: 'Test response content'
          }
        }]
      });

      const service = new LLMService({ apiKey: 'test-key' });
      const result = await service.generateContent({
        systemPrompt: 'You are a helpful assistant',
        userPrompt: 'Generate a test response'
      });

      expect(result.content).toBe('Test response content');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system'
          }),
          expect.objectContaining({
            role: 'user'
          })
        ]),
        max_tokens: 150,
        temperature: 0.7
      });
    });

    test('generateContent handles custom parameters', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: 'Custom response with specific parameters'
          }
        }]
      });

      const service = new LLMService({ apiKey: 'test-key' });
      const result = await service.generateContent({
        systemPrompt: 'You are a test assistant',
        userPrompt: 'Generate a custom response',
        maxTokens: 50,
        temperature: 0.5
      });

      expect(result.content).toBe('Custom response with specific parameters');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: 'You are a test assistant'
          }),
          expect.objectContaining({
            role: 'user',
            content: 'Generate a custom response'
          })
        ]),
        max_tokens: 50,
        temperature: 0.5
      });
    });
  });

  describe('Singleton Instance', () => {
    test('llmService singleton is available', () => {
      expect(llmService).toBeDefined();
      expect(llmService).toBeInstanceOf(LLMService);
    });

    test('singleton uses environment configuration', () => {
      const info = llmService.getServiceInfo();

      // Should reflect the actual environment configuration
      const hasApiKey = !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      expect(info.isAvailable).toBe(hasApiKey);
      expect(info.hasApiKey).toBe(hasApiKey);
      expect(info.model).toBe('gpt-4o');
    });

    test('singleton service availability matches API key presence', () => {
      const hasApiKey = !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      expect(llmService.isServiceAvailable()).toBe(hasApiKey);
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('Network error'));

      const service = new LLMService({ apiKey: 'test-key' });

      await expect(service.generateContent({
        systemPrompt: 'Test',
        userPrompt: 'Test'
      })).rejects.toThrow('Network error');
    });

    test('handles API authentication errors', async () => {
      const authError = new Error('Invalid API key');
      authError.name = 'AuthenticationError';
      mockCreate.mockRejectedValue(authError);

      const service = new LLMService({ apiKey: 'invalid-key' });

      await expect(service.generateContent({
        systemPrompt: 'Test',
        userPrompt: 'Test'
      })).rejects.toThrow('Invalid API key');
    });
  });

  describe('Service Configuration', () => {
    test('default configuration values are correct', () => {
      const service = new LLMService();
      const info = service.getServiceInfo();

      expect(info.model).toBe('gpt-4o');
    });

    test('custom model configuration works', () => {
      const service = new LLMService({
        apiKey: 'test',
        model: 'gpt-4'
      });
      const info = service.getServiceInfo();

      expect(info.model).toBe('gpt-4');
    });
  });

  describe('Method Signatures', () => {
    test('all specialized methods have correct parameters', () => {
      const service = new LLMService({ apiKey: 'test' });

      // Test generateContent parameters
      expect(() => {
        service.generateContent({
          systemPrompt: 'Test system prompt',
          userPrompt: 'Test user prompt'
        });
      }).not.toThrow();

      // Test generateContent with optional parameters
      expect(() => {
        service.generateContent({
          systemPrompt: 'Test system prompt',
          userPrompt: 'Test user prompt',
          maxTokens: 100,
          temperature: 0.8
        });
      }).not.toThrow();
    });
  });
});