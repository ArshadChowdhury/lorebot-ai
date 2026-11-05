import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Character } from 'src/database/entities/character.entity';
import { Message } from '../database/entities/message.entity';
import { WorldState } from 'src/database/entities/world-state.entity';

export interface CharacterResponse {
  message: string;
  mood?: string;
  actionTaken?: string;
  questOffered?: {
    title: string;
    description: string;
    difficulty: string;
  };
}

export interface WorldEvent {
  eventName: string;
  description: string;
  severity: string;
  affectedLocations: string[];
}

interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly chatModel: GenerativeModel;
  private readonly proModel: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? '';
    this.genAI = new GoogleGenerativeAI(apiKey);

    this.chatModel = this.genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
    });
    this.proModel = this.genAI.getGenerativeModel({
      model: 'gemini-3.5-pro',
    });
  }

  // ---------------------------------------------------------------------------
  // Retry / generation helpers
  // ---------------------------------------------------------------------------

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    { retries = 4, baseDelayMs = 1000, maxDelayMs = 15000 }: RetryOptions = {},
  ): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        if (attempt >= retries || !this.isTransientError(error)) throw error;

        // Exponential backoff with full jitter, capped
        const cap = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
        const delay = Math.random() * cap;

        this.logger.warn(
          `Gemini call failed (${error?.status ?? error?.message}). ` +
            `Retry ${attempt + 1}/${retries} in ${Math.round(delay)}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private isTransientError(error: any): boolean {
    const status = error?.status ?? error?.statusCode;
    if ([429, 500, 502, 503, 504].includes(status)) return true;

    const msg = String(error?.message ?? '').toLowerCase();
    return (
      /\b(429|500|502|503|504)\b/.test(msg) ||
      msg.includes('high demand') ||
      msg.includes('overloaded') ||
      msg.includes('fetch failed') ||
      ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'].includes(error?.code)
    );
  }

  /**
   * Single entry point for all Gemini calls (with retries).
   * Set json=true to force valid JSON output from the model.
   */
  private async generate(
    model: GenerativeModel,
    prompt: string,
    json = false,
  ): Promise<string> {
    const result = await this.retryWithBackoff(() =>
      model.generateContent(
        json
          ? {
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }
          : prompt,
      ),
    );
    return result.response.text();
  }

  /** Parse JSON from model text, tolerating code fences / extra prose */
  private parseJson<T>(text: string, pattern: RegExp): T | null {
    const match = text.match(pattern);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Generate a character response based on conversation history and world state
   */
  async generateCharacterResponse(
    character: Character,
    conversationHistory: Message[],
    worldState: WorldState[],
    userMessage: string,
  ): Promise<CharacterResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(character, worldState);
      const conversationContext =
        this.buildConversationContext(conversationHistory);

      const prompt = `${systemPrompt}

${conversationContext}

User: ${userMessage}

Respond as ${character.name} in JSON format with the following structure:
{
  "message": "your response as the character",
  "mood": "current emotional state (happy/sad/angry/excited/mysterious/etc)",
  "actionTaken": "optional: describe any physical action you take",
  "questOffered": {
    "title": "quest title",
    "description": "quest description",
    "difficulty": "easy/medium/hard/legendary"
  } // only include if offering a quest
}`;

      const responseText = await this.generate(this.chatModel, prompt, true);

      const parsed = this.parseJson<CharacterResponse>(
        responseText,
        /\{[\s\S]*\}/,
      );
      if (parsed?.message) return parsed;

      // Fallback if JSON parsing fails
      return { message: responseText, mood: 'neutral' };
    } catch (error: any) {
      this.logger.error(
        `Error generating character response: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Generate a conversation summary for long conversations
   */
  async generateConversationSummary(messages: Message[]): Promise<string> {
    try {
      const conversationText = messages
        .map((msg) => {
          const sender = msg.senderType === 'user' ? 'User' : 'Character';
          return `${sender}: ${msg.content}`;
        })
        .join('\n');

      const prompt = `Summarize the following conversation in 2-3 sentences, highlighting key facts the character learned about the user and important topics discussed:

${conversationText}

Summary:`;

      return await this.generate(this.chatModel, prompt);
    } catch (error: any) {
      this.logger.error(`Error generating summary: ${error.message}`);
      return 'Conversation summary unavailable.';
    }
  }

  /**
   * Generate an image for a quest or location (not implemented yet)
   */
  async generateImage(description: string): Promise<string> {
    // Gemini text models don't generate images. Use Imagen, Stable Diffusion,
    // or DALL-E here when ready.
    this.logger.warn(
      `Image generation requested but not implemented (description: ${description})`,
    );
    return 'Image generation is not available yet.';
  }

  /**
   * Generate a random world event
   */
  async generateWorldEvent(): Promise<WorldEvent> {
    try {
      const prompt = `Generate a random fantasy world event in JSON format:
{
  "eventName": "short event name",
  "description": "detailed description of what happened",
  "severity": "low/medium/high/critical",
  "affectedLocations": ["location1", "location2"]
}

Make it dramatic and fitting for a fantasy RPG world.`;

      const responseText = await this.generate(this.proModel, prompt, true);

      const parsed = this.parseJson<WorldEvent>(responseText, /\{[\s\S]*\}/);
      if (!parsed) throw new Error('Failed to parse world event');
      return parsed;
    } catch (error: any) {
      this.logger.error(`Error generating world event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract user facts from conversation for memory
   */
  async extractUserFacts(messages: Message[]): Promise<string[]> {
    try {
      const conversationText = messages
        .filter((msg) => msg.senderType === 'user')
        .slice(-10)
        .map((msg) => msg.content)
        .join('\n');

      const prompt = `Extract important facts about the user from these messages:
${conversationText}

List only concrete facts (name, preferences, background, goals, etc.) as a JSON array of strings.
Example: ["User's name is Alex", "User prefers magic over combat", "User is looking for their lost sister"]

Return only the JSON array, nothing else.`;

      const responseText = await this.generate(this.chatModel, prompt, true);

      return this.parseJson<string[]>(responseText, /\[[\s\S]*\]/) ?? [];
    } catch (error: any) {
      this.logger.error(`Error extracting user facts: ${error.message}`);
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // Prompt builders
  // ---------------------------------------------------------------------------

  private buildSystemPrompt(
    character: Character,
    worldState: WorldState[],
  ): string {
    const activeEvents = worldState
      .filter((event) => event.isActive)
      .map(
        (event) =>
          `- ${event.eventName}: ${event.description} (Severity: ${event.severity})`,
      )
      .join('\n');

    return `You are ${character.name}, a ${character.role} in a fantasy world.

PERSONALITY & BACKSTORY:
${character.personalityPrompt}

${character.backstory}

LOCATION: ${character.location}

SPEECH PATTERNS:
${character.speechPatterns.join(', ')}

KNOWLEDGE DOMAINS:
${character.knowledgeDomains.join(', ')}

CURRENT MOOD: ${character.currentMood.state} (${character.currentMood.intensity}/10)
${character.currentMood.reason ? `Reason: ${character.currentMood.reason}` : ''}

CURRENT WORLD STATE:
${activeEvents || 'The realm is peaceful and calm.'}

INSTRUCTIONS:
- Stay in character at all times
- Use your speech patterns naturally
- React to world events in your responses
- Remember details the user shares
- Offer quests occasionally (every 5-10 messages) that fit your character
- Be immersive and engaging
- Keep responses concise (2-4 sentences unless asked for more)
- Always respond in valid JSON format`;
  }

  private buildConversationContext(messages: Message[]): string {
    // Keep last 20 messages for context
    const recentMessages = messages.slice(-20);

    if (recentMessages.length === 0) {
      return 'This is the beginning of your conversation.';
    }

    return (
      'CONVERSATION HISTORY:\n' +
      recentMessages
        .map((msg) => {
          const sender = msg.senderType === 'user' ? 'User' : 'You';
          return `${sender}: ${msg.content}`;
        })
        .join('\n')
    );
  }
}