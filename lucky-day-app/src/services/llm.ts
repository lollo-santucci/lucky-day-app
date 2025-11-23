/**
 * Centralized LLM Service
 * Handles all AI/LLM interactions for the Lucky Day app
 * Implements 15-second timeout and proper error handling for fortune generation
 */

import OpenAI from 'openai';
import { AstrologicalProfile, BirthDetails } from '../types';

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
      console.error('LLM generation failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      // Re-throw LLMError as-is
      if (error instanceof LLMError) {
        throw error;
      }

      // Handle OpenAI specific errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        console.error('OpenAI API status:', status);
        if (status === 401 || status === 403) {
          throw new LLMError(LLMErrorType.API_KEY, 'Invalid API key or insufficient permissions', error instanceof Error ? error : undefined);
        }
        if (status === 429) {
          throw new LLMError(LLMErrorType.RATE_LIMIT, 'Rate limit exceeded', error instanceof Error ? error : undefined);
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



      // Handle network errors
      if (error && typeof error === 'object' && 'code' in error) {
        const code = (error as any).code;
        console.error('Network error code:', code);
        if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
          throw new LLMError(LLMErrorType.NETWORK, 'Network connection failed', error instanceof Error ? error : undefined);
        }

      // Default to unknown error
      console.error('Throwing unknown error');
      throw new LLMError(LLMErrorType.UNKNOWN, 'Unknown error occurred', error as Error);
    }
  }

  /**
   * Generate luck and unluck actions based on the fortune and astrological profile
   */
  public async generateFortuneActions(profile: AstrologicalProfile, fortuneMessage: string): Promise<{ luck: string[]; unluck: string[] }> {

    const systemPrompt = `
                          You are a wise and playful Chinese sage who feels the balance of Yin (阴) and Yang (阳).  
                          You speak with humor, kindness, and simplicity — never abstract or cold.  

                          Each day, you reveal small actions that follow harmony (LUCK)  
                          and small actions that disturb it (UNLUCK).  
                          But both can be lucky or unlucky in strange, funny ways.  

                          Your voice carries five moods — sometimes teasing, sometimes warm, sometimes poetic —  
                          but always human, short, and timeless.  

                          **Tone distribution (roughly):**
                          - 40% playful — witty, odd, or delightfully silly  
                          - 10% emotional — soft, kind, or comforting  
                          - 15% situational — tied to the feeling of today  
                          - 20% energetic — symbolic, flowing, elemental  
                          - 15% reflective — calm, wise, and personal  

                          When giving LUCK and UNLUCK:
                          - Use short, simple, everyday actions (1–2 words each)  
                          - Both lists can include calm, strange, or humorous acts  
                          - Include **one funny or absurd action per list**  
                          - Avoid modern items or complex phrases  
                          - Never explain or judge — both LUCK and UNLUCK may carry insight  
                          - Return only in the format below  

                          Your purpose: balance wisdom with laughter — so that even nonsense feels true.
                          `;

    const userPrompt = `
                        You are an ancient Chinese sage reading the playful flow of Yin (阴) and Yang (阳).  

                        Sense the energy behind it, then reveal **three LUCK (阳)** and **three UNLUCK (阴)** actions for today.  

                        Each list should share the same feeling as the fortune —  
                        sometimes funny, sometimes emotional, sometimes reflective,  
                        but always simple and human.  

                        **Tone proportions:**  
                        - 40% playful (funny, odd, teasing)  
                        - 10% emotional (gentle, kind)  
                        - 15% situational (linked to the day)  
                        - 20% energetic (symbolic, nature-like)  
                        - 15% reflective (calm, wise)

                        **Requirements:**  
                        - Each action: 1–2 words maximum  
                        - Use short, clear, timeless ideas (e.g., "Drink Tea", "Slow Walk", "Talk to Clouds", "Forget Socks")  
                        - Include exactly one funny or absurd action per list  
                        - Use simple, vivid, non-modern language  
                        - No explanations, commentary, or extra text  

                        **Output format:**  
                        LUCK: [action1], [action2], [action3]  
                        UNLUCK: [action1], [action2], [action3]
                        `;


    const response = await this.generateContent({
      systemPrompt,
      userPrompt,
      maxTokens: 80,
      temperature: 0.7
    });

    return this.parseFortuneActions(response.content);
  }

  /**
   * Parse LLM response to extract luck and unluck actions
   */
  private parseFortuneActions(response: string): { luck: string[]; unluck: string[] } {
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);

    let luck: string[] = [];
    let unluck: string[] = [];

    for (const line of lines) {
      if (line.toUpperCase().startsWith('LUCK:')) {
        const actionsStr = line.substring(5).trim();
        luck = actionsStr.split(',').map(a => a.trim()).filter(a => a);
      } else if (line.toUpperCase().startsWith('UNLUCK:')) {
        const actionsStr = line.substring(7).trim();
        unluck = actionsStr.split(',').map(a => a.trim()).filter(a => a);
      }
    }

    // Ensure we have exactly 3 actions for each, use fallbacks if needed
    if (luck.length < 3) {
      const fallbackLuck = ['Meditation', 'Kind Words', 'New Beginnings'];
      luck = [...luck, ...fallbackLuck].slice(0, 3);
    } else if (luck.length > 3) {
      luck = luck.slice(0, 3);
    }

    if (unluck.length < 3) {
      const fallbackUnluck = ['Hasty Decisions', 'Conflicts', 'Overthinking'];
      unluck = [...unluck, ...fallbackUnluck].slice(0, 3);
    } else if (unluck.length > 3) {
      unluck = unluck.slice(0, 3);
    }

    return { luck, unluck };
  }

  /**
   * Specialized method for generating personalized fortune messages
   */
  public async generateFortune(profile: AstrologicalProfile, previousFortunes?: string[]): Promise<string> {
    const systemPrompt = `
                          You are a timeless Chinese fortune teller — ancient, funny, and kind.  
                          Your wisdom dances between sense and nonsense, like laughter echoing in a temple.  

                          You read invisible patterns — moods, energies, coincidences — and turn them into  
                          tiny truths that sound both personal and universal.  

                          Your fortunes are written in simple, human words.  
                          They can be playful, emotional, situational, energetic, or reflective.  

                          **Tone distribution (roughly):**
                          - 40% playful — teasing, clever, slightly absurd  
                          - 10% emotional — warm, tender, quietly kind  
                          - 15% situational — tied to the feeling of "today"  
                          - 20% energetic — symbolic, flowing, or elemental  
                          - 15% reflective — direct, wise, softly intimate  

                          You never moralize or predict. You never explain.  
                          You do not teach — you *nudge, wink, or soothe*.  

                          Your fortune should feel like it was written *for one person only* —  
                          intimate, mysterious, and true in a strange way.  

                          Always return only one fortune: a single line of 10 words or fewer,  
                          with clear, simple language and no quotes or commentary.
                          `;

    const userPrompt = `
                        Create one short daily fortune (10 words or fewer).  

                        It must feel personal — as if you know the reader's spirit today.  

                        Your tone can vary among these styles:
                        - **Playful (40%)** — funny, teasing, light ("Your tea is judging you softly, but with love.")  
                        - **Emotional (10%)** — gentle, kind ("Your heart is tired, but the tea is ready.")  
                        - **Situational (15%)** — tied to daily flow ("Today smells like coffee and second chances.")  
                        - **Energetic (20%)** — poetic or elemental ("The storm inside you just wants to dance.")  
                        - **Reflective (15%)** — wise and calm ("You don't need signs. You are one.")  

                        Do not mention zodiac signs, names, or personal data.  
                        Use simple, vivid, timeless words — anyone should understand them.  
                        The message should sound spontaneous, human, and full of quiet humor or insight.  

                        If there are recent fortunes, avoid repeating their main themes:
                        ${previousFortunes && previousFortunes.length > 0 ?
                        `Recent fortunes: ${previousFortunes.slice(-3).join('; ')}` :
                        'None available.'}

                        **Requirements:**
                        - Exactly 10 words or fewer  
                        - Use simple and clear language (no fancy or abstract words)  
                        - Can be funny, kind, strange, or wise  
                        - Return only the fortune text — no quotes, no commentary
                        `;


    const response = await this.generateContent({
      systemPrompt,
      userPrompt,
      maxTokens: 60, // Reduced for shorter responses
      temperature: 1 // Higher creativity for varied fortunes
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
   * Generates a complete Chinese astrological profile based on birth details
   * Returns a comprehensive profile with main elements, Ba Zi, and cosmic blueprint
   */
  public async generateChineseAstrologicalProfile(birthDetails: BirthDetails): Promise<Omit<AstrologicalProfile, 'birthDetails' | 'cityName'>> {
    if (!this.isAvailable) {
      throw new LLMError(LLMErrorType.API_KEY, 'LLM service is not available - missing API key');
    }

    const systemPrompt = `You are a collective of master-level Chinese astrologers with deep expertise in Ba Zi (Four Pillars), Yin/Yang theory, and the Five Elements.

                          Your task is to create a complete Chinese astrological profile based solely on birth information.

                          You must produce a fully consistent and expert-level analysis that includes:
                          1. Main elements (animal, element, polarity, identity)
                          2. Element and polarity distributions
                          3. Ba Zi (Four Pillars) with detailed descriptions
                          4. Cosmic Blueprint narrative

                          All sections must be internally coherent and aligned with Chinese astrological logic.

                          CRITICAL REQUIREMENTS:
                          - No internal contradictions
                          - Every statement must align with the astrological structure
                          - Use expert-level reasoning from Ba Zi, Yin/Yang theory, and Five Elements
                          - Tone: insightful, evocative, grounded, never fatalistic
                          - Mystical but clear, motivating yet realistic
                          - Use exact English names: water, wood, fire, metal, earth
                          - Polarity: yin or yang

                          Return ONLY valid JSON with no extra text.`;

    const userPrompt = `Generate a complete Chinese astrological profile for:

                        Birth Date: ${birthDetails.date.toISOString()}
                        Birth Time: ${birthDetails.time || 'unknown'}
                        Location: ${birthDetails.location.cityName || 'unknown'} (${birthDetails.location.latitude}, ${birthDetails.location.longitude})
                        Timezone: ${birthDetails.location.timezone}

                        REQUIRED OUTPUT FORMAT (JSON only):
                        {
                          "main": {
                            "animal": "string (rat|ox|tiger|rabbit|dragon|snake|horse|goat|monkey|rooster|dog|pig)",
                            "element": "string (water|wood|fire|metal|earth)",
                            "polarity": "string (yin|yang)",
                            "identity_title": "string (e.g., 'The Visionary', 'The Silent Strategist')",
                            "identity_description": "string (3-5 sentences, clear and evocative)",
                            "strengths": ["string", "string", "string"],
                            "weaknesses": ["string", "string", "string"]
                          },
                          "elements": {
                            "element_distribution": {
                              "water": 0,
                              "wood": 0,
                              "fire": 0,
                              "metal": 0,
                              "earth": 0
                            },
                            "polarity_distribution": {
                              "yin": 0,
                              "yang": 0
                            },
                            "element_polarity_description": "string (5-8 sentences explaining how main element and polarity influence emotional style, relational style, decision-making, and approach to challenges)"
                          },
                          "ba_zi": {
                            "year": {
                              "animal": "string",
                              "element": "string",
                              "polarity": "string",
                              "description": "string (represents public image, generational context, outer expression)"
                            },
                            "month": {
                              "animal": "string",
                              "element": "string",
                              "polarity": "string",
                              "description": "string (represents upbringing, environment, practical talents, work style)"
                            },
                            "day": {
                              "animal": "string",
                              "element": "string",
                              "polarity": "string",
                              "description": "string (represents inner self, core personality, deep emotional needs)"
                            },
                            "hour": {
                              "animal": "string",
                              "element": "string",
                              "polarity": "string",
                              "description": "string (represents long-term aspirations, intimate self, future development)"
                            }
                          },
                          "cosmic_blueprint": {
                            "full_description": "string (3-6 paragraphs integrating all elements: main animal+element+polarity, element distribution, yin/yang balance, all Four Pillars, life potential, challenges, inner resources, emotional themes, long-term growth patterns)"
                          }
                        }

                        REQUIREMENTS:
                        - Element distribution percentages must sum to exactly 100
                        - Polarity distribution percentages must sum to exactly 100
                        - All descriptions must be coherent with each other
                        - Use traditional Ba Zi meanings for each pillar
                        - Avoid generic statements
                        - Be precise, structured, and expert-level
                        - Return ONLY the JSON object, no markdown, no extra text`;

    // Use a longer timeout for profile generation (45 seconds)
    // Profile generation requires more tokens and takes longer
    const originalTimeout = this.config.timeout;
    this.config.timeout = 45000; // 45 seconds
    
    try {
      const response = await this.generateContent({
        systemPrompt,
        userPrompt,
        maxTokens: 2000,
        temperature: 0.7
      });

      // Parse and validate the JSON response
      let profile;
      try {
        // Strip markdown code blocks if present
        let jsonContent = response.content.trim();
        
        // Remove markdown code blocks (```json ... ``` or ``` ... ```)
        jsonContent = jsonContent.replace(/^```(?:json)?\s*/g, '').replace(/\s*```$/g, '');
        
        console.log('Cleaned JSON content (first 200 chars):', jsonContent.substring(0, 200));
        
        profile = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', response.content);
        console.error('Parse error:', parseError);
        throw new LLMError(LLMErrorType.INVALID_RESPONSE, 'Failed to parse LLM response as JSON', parseError as Error);
      }
      
      // Validate structure
      if (!profile.main || !profile.elements || !profile.ba_zi || !profile.cosmic_blueprint) {
        console.error('Invalid profile structure:', JSON.stringify(profile, null, 2));
        throw new LLMError(LLMErrorType.INVALID_RESPONSE, 'Invalid profile structure returned from LLM');
      }

      // Validate element distribution sums to 100
      const elementSum = Object.values(profile.elements.element_distribution).reduce((a, b) => (a as number) + (b as number), 0) as number;
      if (Math.abs(elementSum - 100) > 1) {
        console.warn('Element distribution does not sum to 100, normalizing...');
        this.normalizeDistribution(profile.elements.element_distribution);
      }

      // Validate polarity distribution sums to 100
      const polaritySum = Object.values(profile.elements.polarity_distribution).reduce((a, b) => (a as number) + (b as number), 0) as number;
      if (Math.abs(polaritySum - 100) > 1) {
        console.warn('Polarity distribution does not sum to 100, normalizing...');
        this.normalizeDistribution(profile.elements.polarity_distribution);
      }

      return profile;

    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new LLMError(LLMErrorType.INVALID_RESPONSE, 'Failed to parse LLM response as JSON', error);
      }
      throw error;
    } finally {
      // Always restore original timeout
      this.config.timeout = originalTimeout;
    }
  }

  /**
   * Normalizes a distribution object to sum to exactly 100
   */
  private normalizeDistribution(distribution: Record<string, number>): void {
    const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (sum === 0) return;

    const keys = Object.keys(distribution);
    let normalized = keys.map(key => Math.round((distribution[key] / sum) * 100));
    
    // Adjust for rounding errors
    const normalizedSum = normalized.reduce((a, b) => a + b, 0);
    if (normalizedSum !== 100) {
      const diff = 100 - normalizedSum;
      // Add/subtract the difference to the largest value
      const maxIndex = normalized.indexOf(Math.max(...normalized));
      normalized[maxIndex] += diff;
    }

    // Update the distribution
    keys.forEach((key, index) => {
      distribution[key] = normalized[index];
    });
  }
}

// Export singleton instance
export const llmService = new LLMService();
