import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private chatModel: any;
  private imageModel: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey ?? '');
    this.chatModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    this.imageModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
    });
  }

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

      const result = await this.chatModel.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      // Fallback if JSON parsing fails
      return {
        message: responseText,
        mood: 'neutral',
      };
    } catch (error) {
      this.logger.error(
        `Error generating character response: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Build the system prompt for a character
   */
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

  /**
   * Build conversation context from message history
   */
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

      const result = await this.chatModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error(`Error generating summary: ${error.message}`);
      return 'Conversation summary unavailable.';
    }
  }

  /**
   * Generate an image for a quest or location
   */
  async generateImage(description: string): Promise<string> {
    try {
      const prompt = `Create a fantasy RPG style image of: ${description}. 
Style: Medieval fantasy, detailed, atmospheric, game art quality.`;

      // Note: Gemini 1.5 Pro doesn't directly generate images
      // You'll need to use Imagen API or return a prompt for DALL-E/Stable Diffusion
      // For now, we'll return a placeholder
      this.logger.warn('Image generation requested but not implemented yet');

      // TODO: Implement actual image generation
      // Options:
      // 1. Use Google's Imagen API
      // 2. Use Stable Diffusion API
      // 3. Use DALL-E API
      // 4. Use Midjourney API

      return "Here's your image"; // Return null for now
    } catch (error) {
      this.logger.error(`Error generating image: ${error.message}`);
      return 'Error generating image';
    }
  }

  /**
   * Generate a random world event
   */
  async generateWorldEvent(): Promise<{
    eventName: string;
    description: string;
    severity: string;
    affectedLocations: string[];
  }> {
    try {
      const prompt = `Generate a random fantasy world event in JSON format:
{
  "eventName": "short event name",
  "description": "detailed description of what happened",
  "severity": "low/medium/high/critical",
  "affectedLocations": ["location1", "location2"]
}

Make it dramatic and fitting for a fantasy RPG world.`;

      const result = await this.imageModel.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to parse world event');
    } catch (error) {
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

      const result = await this.chatModel.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      this.logger.error(`Error extracting user facts: ${error.message}`);
      return [];
    }
  }
}
