import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../database/entities/conversation.entity';
import { Message, SenderType } from '../database/entities/message.entity';
import { WorldState } from '../database/entities/world-state.entity';
import { GeminiService } from '../gemini/gemini.service';
import { CharactersService } from '../characters/characters.service';
import { QuestsService } from 'src/quests/quests.service';

export interface SendMessageDto {
  content: string;
}

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(WorldState)
    private worldStateRepository: Repository<WorldState>,
    private geminiService: GeminiService,
    private charactersService: CharactersService,
    private questsService: QuestsService,
  ) {}

  /**
   * Start a new conversation with a character
   */
  // async startConversation(
  //   userId: string,
  //   characterId: string,
  // ): Promise<Conversation> {
  //   // Check if conversation already exists
  //   const existing = await this.conversationRepository.findOne({
  //     where: {
  //       user: { id: userId },
  //       character: { id: characterId },
  //       isActive: true,
  //     },
  //     relations: ['user', 'character'],
  //   });

  //   if (existing) {
  //     return existing;
  //   }

  //   // Create new conversation
  //   const conversation = this.conversationRepository.create({
  //     user: { id: userId },
  //     character: { id: characterId },
  //     metadata: {
  //       totalMessages: 0,
  //       userFacts: [],
  //     },
  //   });

  //   return this.conversationRepository.save(conversation);
  // }

  async startConversation(
    userId: string,
    characterId: string,
  ): Promise<Conversation> {
    // Check for existing active conversation with this character
    let conversation = await this.conversationRepository.findOne({
      where: {
        user: { id: userId },
        character: { id: characterId },
        isActive: true,
      },
      relations: ['character', 'user'],
    });

    // If exists, return it
    if (conversation) {
      return conversation;
    }

    // Otherwise create new
    conversation = this.conversationRepository.create({
      user: { id: userId },
      character: { id: characterId },
      metadata: { totalMessages: 0, userFacts: [] },
    });

    return this.conversationRepository.save(conversation);
  }

  /**
   * Get conversation by ID with messages
   */
  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, user: { id: userId } },
      relations: ['messages', 'character'],
      order: { messages: { timestamp: 'ASC' } },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { user: { id: userId }, isActive: true },
      relations: ['character'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
  ): Promise<Message> {
    // Get conversation
    const conversation = await this.getConversation(conversationId, userId);
    // Load messages before saving
    conversation.messages = await this.messageRepository.find({
      where: { conversationId },
    });
    // Save user message
    const userMessage = this.messageRepository.create({
      conversationId: conversationId,
      conversation: conversation,
      senderType: SenderType.USER,
      content: dto.content,
    });
    await this.messageRepository.save(userMessage);

    // Get conversation history
    const messages = await this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      order: { timestamp: 'ASC' },
    });

    // Get active world state
    const worldState = await this.worldStateRepository.find({
      where: { isActive: true },
    });

    // Get character
    const characterId = conversation.character.id;
    const character = await this.charactersService.findOne(characterId);

    // Generate AI response
    const response = await this.geminiService.generateCharacterResponse(
      character,
      messages,
      worldState,
      dto.content,
    );

    // Save AI message
    const aiMessage = this.messageRepository.create({
      conversation,
      senderType: SenderType.CHARACTER,
      content: response.message,
      metadata: {
        mood: response.mood,
        actionTaken: response.actionTaken,
      },
    });
    await this.messageRepository.save(aiMessage);

    // Update conversation metadata
    conversation.metadata.totalMessages = messages.length + 2;
    conversation.lastMessageAt = new Date();
    await this.conversationRepository.update(conversationId, {
      metadata: conversation.metadata,
      lastMessageAt: conversation.lastMessageAt,
    });

    // Handle quest offering if present
    if (response.questOffered) {
      await this.questsService.createQuest(
        userId,
        conversation.character.id, // ✅ use character.id
        response.questOffered,
      );
    }

    // Update character mood
    if (response.mood) {
      await this.charactersService.updateMood(conversation.character.id, {
        state: response.mood,
        intensity: 7,
        reason: 'Conversation interaction',
      });
    }

    // Generate summary every 50 messages
    if (messages.length > 0 && messages.length % 50 === 0) {
      const summary =
        await this.geminiService.generateConversationSummary(messages);
      conversation.summary = summary;

      // Extract user facts
      const userFacts = await this.geminiService.extractUserFacts(messages);
      conversation.metadata.userFacts = [
        ...new Set([...conversation.metadata.userFacts, ...userFacts]),
      ];

      await this.conversationRepository.save(conversation);
    }

    return aiMessage;
  }

  /**
   * Get recent messages for a conversation
   */

  async getMessages(
    conversationId: string,
    userId: string,
    limit?: number,
  ): Promise<Message[]> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, user: { id: userId } },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.timestamp', 'ASC');

    if (limit && typeof limit === 'number' && limit > 0) {
      queryBuilder.take(limit);
    }

    return queryBuilder.getMany();
  }
}
