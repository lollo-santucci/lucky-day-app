/**
 * Mock implementation of LLM service for testing
 */

export class LLMService {
  async generateFortune(): Promise<string> {
    return 'Mock fortune message for testing';
  }

  async generateFortuneActions(): Promise<{ luck: string[]; unluck: string[] }> {
    return {
      luck: ['Meditation', 'Kind Words', 'New Beginnings'],
      unluck: ['Hasty Decisions', 'Conflicts', 'Overthinking']
    };
  }

  async generateMysticalNickname(): Promise<string> {
    return 'Mock Mystical Name';
  }

  async generatePillarDescription(): Promise<string> {
    return 'Mock pillar description for testing';
  }

  async generateEssenceSummary(): Promise<string> {
    return 'Mock essence summary line 1\nMock essence summary line 2\nMock essence summary line 3';
  }
}

export const llmService = new LLMService();