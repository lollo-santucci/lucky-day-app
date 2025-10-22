/**
 * Centralized LLM Service
 * Handles all AI/LLM interactions for the Lucky Day app
 * Implements 15-second timeout and proper error handling for fortune generation
 */

import OpenAI from 'openai';
import { AstrologicalProfile } from '../types';

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

// Fortune generation specific interface
interface FortuneRequest {
    zodiacSign: string;
    element: string;
    pillarEssence: string;
    previousFortunes?: string[];
}

// Error types for better error handling
export enum LLMErrorType {
    TIMEOUT = 'TIMEOUT',
    NETWORK = 'NETWORK',
    API_KEY = 'API_KEY',
    RATE_LIMIT = 'RATE_LIMIT',
    INVALID_RESPONSE = 'INVALID_RESPONSE',
    UNKNOWN = 'UNKNOWN'
}

export class LLMError extends Error {
    constructor(
        public type: LLMErrorType,
        message: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'LLMError';
    }
}

/**
 * Centralized LLM Service Class
 * Manages all interactions with OpenAI and other LLM providers
 * Implements 15-second timeout and comprehensive error handling
 */
export class LLMService {
    private openai: OpenAI;
    private config: LLMConfig;
    private isAvailable: boolean = false;

    constructor(config?: Partial<LLMConfig>) {
        this.config = {
            apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
            model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o',
            maxTokens: 150,
            temperature: 0.7,
            timeout: 15000, // 15 second timeout for better reliability
            ...config
        };

        // Initialize OpenAI client
        this.openai = new OpenAI({
            apiKey: this.config.apiKey,
            dangerouslyAllowBrowser: true, // Allow in test environment
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
     * Main method to generate content using LLM with timeout and error handling
     */
    public async generateContent(request: LLMRequest): Promise<LLMResponse> {
        if (!this.isAvailable) {
            throw new LLMError(LLMErrorType.API_KEY, 'LLM service is not available - missing API key');
        }

        try {
            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new LLMError(LLMErrorType.TIMEOUT, `Request timed out after ${this.config.timeout}ms`));
                }, this.config.timeout);
            });

            // Create API call promise
            const apiPromise = this.openai.chat.completions.create({
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

            // Race between API call and timeout
            const completion = await Promise.race([apiPromise, timeoutPromise]);

            const content = completion.choices[0]?.message?.content?.trim();

            if (!content) {
                throw new LLMError(LLMErrorType.INVALID_RESPONSE, 'No content generated from LLM');
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

            // Re-throw LLMError as-is
            if (error instanceof LLMError) {
                throw error;
            }

            // Handle OpenAI specific errors
            if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as any).status;
                if (status === 401 || status === 403) {
                    throw new LLMError(LLMErrorType.API_KEY, 'Invalid API key or insufficient permissions', error instanceof Error ? error : undefined);
                }
                if (status === 429) {
                    throw new LLMError(LLMErrorType.RATE_LIMIT, 'Rate limit exceeded', error instanceof Error ? error : undefined);
                }
                if (status >= 500) {
                    throw new LLMError(LLMErrorType.NETWORK, 'Server error', error instanceof Error ? error : undefined);
                }
            }

            // Handle network errors
            if (error && typeof error === 'object' && 'code' in error) {
                const code = (error as any).code;
                if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
                    throw new LLMError(LLMErrorType.NETWORK, 'Network connection failed', error instanceof Error ? error : undefined);
                }
            }

            // Default to unknown error
            throw new LLMError(LLMErrorType.UNKNOWN, 'Unknown error occurred', error as Error);
        }
    }



    /**
     * Specialized method for generating personalized fortune messages
     * Implements requirements 2.1, 2.2, 2.5 for fortune generation
     */
    public async generateFortune(profile: AstrologicalProfile, previousFortunes?: string[]): Promise<string> {
        // Create synthesized astrological description (no personal data)
        const pillarEssence = this.synthesizePillarEssence(profile);

        const systemPrompt = `You are a wise yet playful Chinese fortune teller.
        
        Write a fortune cookie message that feels ancient, witty, and quietly profound.

        Rules:
        - Maximum 15 words
        - Reflect calm, humor, and insight in equal measure
        - Never mention zodiac signs, animals, or four pillars directly
        - Subtle, universal references to nature, luck, balance, or time are welcome
        - Must sound like an authentic Chinese fortune cookie saying
        - Be positive, slightly mystical, and memorable
        - Avoid clichés (“great things await you”, “your future is bright”, etc.)
        - Return only the message, no punctuation outside the fortune, no quotes
        - Never mention personal details, only astrological qualities and universal wisdom.`;

        const userPrompt = `Create a daily fortune for someone with these astrological qualities:
            - Zodiac: ${profile.zodiac.animal} (${profile.zodiac.element} element)
            - Essence: ${pillarEssence}
            - Mystical nature: ${profile.mysticalNickname}

            ${previousFortunes && previousFortunes.length > 0 ?
                            `Avoid repeating themes from recent fortunes: ${previousFortunes.slice(-5).join('; ')}` :
                            ''}`;

        const response = await this.generateContent({
            systemPrompt,
            userPrompt,
            maxTokens: 60, // Reduced for shorter responses
            temperature: 0.8 // Higher creativity for varied fortunes
        });

        // Ensure message is within character limit
        let fortune = response.content.trim();
        if (fortune.length > 200) {
            // Find last complete sentence within limit
            const truncated = fortune.substring(0, 197);
            const lastPeriod = truncated.lastIndexOf('.');
            const lastExclamation = truncated.lastIndexOf('!');
            const lastSentenceEnd = Math.max(lastPeriod, lastExclamation);

            if (lastSentenceEnd > 100) { // More lenient threshold
                fortune = fortune.substring(0, lastSentenceEnd + 1);
            } else {
                fortune = truncated + '...';
            }
        }

        return fortune;
    }

    /**
     * Synthesize Four Pillars essence into a concise description
     * This creates a privacy-safe summary for LLM input
     */
    private synthesizePillarEssence(profile: AstrologicalProfile): string {
        const { pillars } = profile;

        // Create a synthesized essence that captures the astrological meaning
        // without revealing specific birth details
        const elements = [pillars.year.element, pillars.month.element, pillars.day.element, pillars.hour.element];
        const dominantElement = this.findDominantElement(elements);

        const yearQuality = this.getElementQuality(pillars.year.element);
        const dayQuality = this.getElementQuality(pillars.day.element);

        return `${dominantElement}-influenced with ${yearQuality} destiny and ${dayQuality} essence`;
    }

    /**
     * Find the most frequent element in the Four Pillars
     */
    private findDominantElement(elements: string[]): string {
        const counts = elements.reduce((acc, element) => {
            acc[element] = (acc[element] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
    }

    /**
     * Get descriptive quality for each element
     */
    private getElementQuality(element: string): string {
        const qualities = {
            wood: 'growth-oriented',
            fire: 'passionate',
            earth: 'grounded',
            metal: 'structured',
            water: 'adaptive'
        };
        return qualities[element as keyof typeof qualities] || 'balanced';
    }

    /**
     * Specialized method for generating mystical nicknames
     * Always includes the zodiac animal and is in English
     * Examples: "Generous Pig", "Wise Dragon", "Brave Tiger"
     */
    public async generateMysticalNickname(zodiac: { animal: string; element: string; year: number }): Promise<string> {
        const systemPrompt = "You are a mystical Chinese astrology expert who creates personalized nicknames. Always respond with exactly 2 words: an adjective followed by the zodiac animal.";

        const userPrompt = `Generate a mystical nickname for someone born in the Chinese zodiac year of the ${zodiac.animal} with the element ${zodiac.element}. 

Requirements:
- Must be exactly 2 words in English
- First word: a positive adjective that reflects personality or mystical qualities
- Second word: "${zodiac.animal.charAt(0).toUpperCase() + zodiac.animal.slice(1)}" (the zodiac animal, capitalized)
- Examples: "Generous Pig", "Wise Dragon", "Brave Tiger", "Serene Snake"
- Should feel mystical and positive
- Consider the element ${zodiac.element} for inspiration but don't be limited by it

Return only the 2-word nickname, nothing else.`;

        const response = await this.generateContent({
            systemPrompt,
            userPrompt,
            maxTokens: 10,
            temperature: 0.7
        });

        // Validate the format (should be "Adjective Animal")
        const words = response.content.split(' ');
        if (words.length !== 2) {
            throw new Error(`Invalid nickname format: ${response.content}`);
        }

        const [adjective, animalName] = words;
        const expectedAnimal = zodiac.animal.charAt(0).toUpperCase() + zodiac.animal.slice(1);

        if (animalName !== expectedAnimal) {
            // If LLM didn't use the correct animal, fix it
            return `${adjective} ${expectedAnimal}`;
        }

        return response.content;
    }

    /**
     * Generates poetic descriptions for each of the Four Pillars
     * Each pillar represents a different aspect of destiny and personality
     */
    public async generatePillarDescriptions(pillars: { year: any; month: any; day: any; hour: any }): Promise<{ year: string; month: string; day: string; hour: string }> {
        const systemPrompt = "You are a mystical Chinese astrology expert who creates poetic, meaningful descriptions for the Four Pillars of Destiny (Ba Zi). Each pillar represents a different aspect of a person's destiny and should be described in a mystical, reflective tone.";

        const userPrompt = `Generate poetic descriptions for the Four Pillars of Destiny based on these stem-branch combinations:

Year Pillar (Destiny): ${pillars.year.stem}${pillars.year.branch} (${pillars.year.element})
Month Pillar (Environment): ${pillars.month.stem}${pillars.month.branch} (${pillars.month.element})
Day Pillar (Essence): ${pillars.day.stem}${pillars.day.branch} (${pillars.day.element})
Hour Pillar (Inner Heart): ${pillars.hour.stem}${pillars.hour.branch} (${pillars.hour.element})

Requirements:
- Each description should be 1-2 sentences
- Use mystical, poetic language that feels authentic to Chinese philosophy
- Focus on the meaning and energy of each pillar's role:
  * Year Pillar: Overall destiny and life path
  * Month Pillar: Environment and relationships
  * Day Pillar: Core essence and personality
  * Hour Pillar: Inner heart and spiritual nature
- Consider the elements and their interactions
- Keep descriptions positive and meaningful
- Write in English

Format your response as:
Year: [description]
Month: [description]
Day: [description]
Hour: [description]`;

        const response = await this.generateContent({
            systemPrompt,
            userPrompt,
            maxTokens: 300,
            temperature: 0.8
        });

        // Parse the response to extract individual descriptions
        return this.parsePillarDescriptions(response.content);
    }

    /**
     * Generates a 3-line zodiac essence summary combining zodiac and pillars
     */
    public async generateEssenceSummary(zodiac: { animal: string; element: string; year: number }, pillars: { year: any; month: any; day: any; hour: any }): Promise<string> {
        const systemPrompt = "You are a mystical Chinese astrology expert who creates beautiful, poetic essence summaries. Create exactly 3 lines that capture the spiritual essence of a person based on their zodiac and Four Pillars.";

        const userPrompt = `Create a 3-line zodiac essence summary for someone with:

Zodiac: ${zodiac.element} ${zodiac.animal} (${zodiac.year})
Four Pillars: 
- Year: ${pillars.year.stem}${pillars.year.branch} (${pillars.year.element})
- Month: ${pillars.month.stem}${pillars.month.branch} (${pillars.month.element})
- Day: ${pillars.day.stem}${pillars.day.branch} (${pillars.day.element})
- Hour: ${pillars.hour.stem}${pillars.hour.branch} (${pillars.hour.element})

Requirements:
- Exactly 3 lines, each line should be poetic and meaningful
- Incorporate the zodiac animal and element naturally
- Reference the interplay of the pillar elements
- Use mystical, beautiful language that feels authentic to Chinese philosophy
- Each line should flow into the next, creating a cohesive spiritual portrait
- Keep it positive and inspiring
- Write in English

Example format:
Born under the [element] [animal], you carry the wisdom of [concept]
Your pillars dance between [elements], creating harmony in [aspect]
In your heart flows the eternal [metaphor], guiding you toward [destiny]`;

        const response = await this.generateContent({
            systemPrompt,
            userPrompt,
            maxTokens: 150,
            temperature: 0.9
        });

        // Clean up the response and ensure it's exactly 3 lines
        const lines = response.content.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length >= 3) {
            return lines.slice(0, 3).join('\n');
        } else {
            // If LLM didn't provide 3 lines, use fallback
            return this.generateFallbackEssenceSummary(zodiac, pillars);
        }
    }

    /**
     * Parses LLM response to extract pillar descriptions
     */
    private parsePillarDescriptions(response: string): { year: string; month: string; day: string; hour: string } {
        const lines = response.split('\n').filter(line => line.trim());
        const descriptions: Partial<{ year: string; month: string; day: string; hour: string }> = {};

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('Year:')) {
                descriptions.year = trimmed.substring(5).trim();
            } else if (trimmed.startsWith('Month:')) {
                descriptions.month = trimmed.substring(6).trim();
            } else if (trimmed.startsWith('Day:')) {
                descriptions.day = trimmed.substring(4).trim();
            } else if (trimmed.startsWith('Hour:')) {
                descriptions.hour = trimmed.substring(5).trim();
            }
        }

        // Ensure all descriptions are present, use fallback if missing
        return {
            year: descriptions.year || 'Your destiny flows like a river, shaped by ancient wisdom and future possibilities.',
            month: descriptions.month || 'Your environment nurtures growth, like fertile soil beneath the changing seasons.',
            day: descriptions.day || 'Your essence shines with unique light, a star in the constellation of being.',
            hour: descriptions.hour || 'Your inner heart beats with the rhythm of the cosmos, deep and eternal.'
        };
    }

    /**
     * Fallback essence summary when LLM is unavailable
     */
    private generateFallbackEssenceSummary(zodiac: { animal: string; element: string; year: number }, pillars: { year: any; month: any; day: any; hour: any }): string {
        // Get the dominant elements from pillars
        const elements = [pillars.year.element, pillars.month.element, pillars.day.element, pillars.hour.element];
        const elementCounts = elements.reduce((acc, element) => {
            acc[element] = (acc[element] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const dominantElement = Object.entries(elementCounts)
            .sort(([, a], [, b]) => (b as number) - (a as number))[0][0];

        // Animal-specific essence templates
        const animalEssences: Record<string, { line1: string; line2: string; line3: string }> = {
            dragon: {
                line1: `Born under the ${zodiac.element} dragon, you carry the wisdom of transformation and power`,
                line2: `Your pillars soar between ${dominantElement} and sky, creating harmony in majestic purpose`,
                line3: `In your heart flows the eternal fire of destiny, guiding you toward legendary greatness`
            },
            // Add other animals as needed...
        };

        const essence = animalEssences[zodiac.animal] || {
            line1: `Born under the ${zodiac.element} ${zodiac.animal}, you carry ancient wisdom`,
            line2: `Your pillars dance between ${dominantElement} and spirit, creating harmony`,
            line3: `In your heart flows the eternal river of destiny, guiding you forward`
        };

        return `${essence.line1}\n${essence.line2}\n${essence.line3}`;
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