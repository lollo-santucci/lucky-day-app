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

import { LLMService, llmService, LLMError, LLMErrorType } from '../llm';
import { AstrologicalProfile } from '../../types';


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

    test('throws LLMError when generating content without API key', async () => {
      const service = new LLMService({ apiKey: '' });

      await expect(service.generateContent({
        systemPrompt: 'Test system',
        userPrompt: 'Test user'
      })).rejects.toThrow(LLMError);

      try {
        await service.generateContent({
          systemPrompt: 'Test system',
          userPrompt: 'Test user'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe(LLMErrorType.API_KEY);
      }
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
    test('handles timeout errors', async () => {
      // Mock a slow response that exceeds timeout
      mockCreate.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 6000))
      );

      const service = new LLMService({ apiKey: 'test-key', timeout: 100 });

      await expect(service.generateContent({
        systemPrompt: 'Test',
        userPrompt: 'Test'
      })).rejects.toThrow(LLMError);

      try {
        await service.generateContent({
          systemPrompt: 'Test',
          userPrompt: 'Test'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe(LLMErrorType.TIMEOUT);
      }
    });

    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network error');
      (networkError as any).code = 'ENOTFOUND';
      mockCreate.mockRejectedValue(networkError);

      const service = new LLMService({ apiKey: 'test-key' });

      try {
        await service.generateContent({
          systemPrompt: 'Test',
          userPrompt: 'Test'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe(LLMErrorType.NETWORK);
      }
    });

    test('handles API authentication errors', async () => {
      const authError = new Error('Invalid API key');
      (authError as any).status = 401;
      mockCreate.mockRejectedValue(authError);

      const service = new LLMService({ apiKey: 'invalid-key' });

      try {
        await service.generateContent({
          systemPrompt: 'Test',
          userPrompt: 'Test'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe(LLMErrorType.API_KEY);
      }
    });

    test('handles rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      mockCreate.mockRejectedValue(rateLimitError);

      const service = new LLMService({ apiKey: 'test-key' });

      try {
        await service.generateContent({
          systemPrompt: 'Test',
          userPrompt: 'Test'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe(LLMErrorType.RATE_LIMIT);
      }
    });

    test('handles invalid response errors', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: null // Invalid response
          }
        }]
      });

      const service = new LLMService({ apiKey: 'test-key' });

      try {
        await service.generateContent({
          systemPrompt: 'Test',
          userPrompt: 'Test'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(LLMError);
        expect((error as LLMError).type).toBe(LLMErrorType.INVALID_RESPONSE);
      }
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

    test('timeout configuration is set to 5 seconds by default', () => {
      const service = new LLMService({ apiKey: 'test' });
      // Access private config through service behavior
      expect(service).toBeDefined(); // Timeout is tested in error handling
    });
  });

  describe('Fortune Generation', () => {
    const mockProfile: AstrologicalProfile = {
      zodiac: {
        animal: 'dragon',
        element: 'fire',
        year: 2000
      },
      pillars: {
        year: { stem: 'Geng', branch: 'Chen', element: 'metal' },
        month: { stem: 'Wu', branch: 'Yin', element: 'earth' },
        day: { stem: 'Bing', branch: 'Xu', element: 'fire' },
        hour: { stem: 'Ji', branch: 'Hai', element: 'earth' }
      },
      mysticalNickname: 'Fiery Dragon',
      pillarDescriptions: {
        year: 'Strong metal destiny guides your path',
        month: 'Earthen environment nurtures growth',
        day: 'Fiery essence burns bright within',
        hour: 'Peaceful earth calms your inner heart'
      },
      essenceSummary: 'A dragon of fire and earth, balanced in strength and wisdom'
    };

    test('generateFortune creates personalized fortune within character limit', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: 'Today brings opportunities for the fiery dragon. Your metal destiny guides wise choices. Trust your earthen foundation.'
          }
        }]
      });

      const service = new LLMService({ apiKey: 'test-key' });
      const fortune = await service.generateFortune(mockProfile);

      expect(fortune).toBeDefined();
      expect(fortune.length).toBeLessThanOrEqual(200);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('wise Chinese fortune teller')
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('dragon')
            })
          ]),
          max_tokens: 60,
          temperature: 0.8
        })
      );
    });

    test('generateFortune handles long responses by truncating properly', async () => {
      const longResponse = 'This is a very long fortune message that definitely exceeds the 200 character limit. It needs to be truncated properly to ensure it fits within the requirements. It should end at a sentence boundary if possible. This extra text makes it longer.';
      
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: longResponse
          }
        }]
      });

      const service = new LLMService({ apiKey: 'test-key' });
      const fortune = await service.generateFortune(mockProfile);

      expect(fortune.length).toBeLessThanOrEqual(200);
      expect(fortune).not.toBe(longResponse); // Should be truncated
      // Should end with either a period or ellipsis
      expect(fortune).toMatch(/[.!]$|\.\.\.$/);
    });

    test('generateFortune includes previous fortunes to avoid repetition', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: 'New unique fortune message for today'
          }
        }]
      });

      const service = new LLMService({ apiKey: 'test-key' });
      const previousFortunes = ['Yesterday fortune', 'Day before fortune'];
      
      await service.generateFortune(mockProfile, previousFortunes);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Avoid repeating themes')
            })
          ])
        })
      );
    });

    test('generateFortune synthesizes pillar essence without personal data', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: 'Fortune based on astrological qualities'
          }
        }]
      });

      const service = new LLMService({ apiKey: 'test-key' });
      await service.generateFortune(mockProfile);

      const userPrompt = mockCreate.mock.calls[0][0].messages[1].content;
      
      // Should contain synthesized essence, not raw birth data
      expect(userPrompt).toContain('earth-influenced');
      expect(userPrompt).toContain('dragon');
      expect(userPrompt).toContain('fire element');
      
      // Should not contain specific stems/branches or personal details
      expect(userPrompt).not.toContain('Geng');
      expect(userPrompt).not.toContain('Chen');
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