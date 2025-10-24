import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Quest,
  QuestStatus,
  QuestDifficulty,
} from '../database/entities/quest.entity';

export interface QuestOffer {
  title: string;
  description: string;
  difficulty: string;
}

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
  ) {}

  /**
   * Create a new quest
   */
  async createQuest(
    userId: string,
    characterId: string,
    questOffer: QuestOffer,
  ): Promise<Quest> {
    const quest = this.questRepository.create({
      user: { id: userId } as any, // ✅ relational shortcut
      character: { id: characterId } as any,
      title: questOffer.title,
      description: questOffer.description,
      difficulty: this.mapDifficulty(questOffer.difficulty),
      status: QuestStatus.OFFERED,
      objectives: [],
      rewards: this.generateRewards(questOffer.difficulty),
    });

    return this.questRepository.save(quest);
  }

  /**
   * Get all quests for a user
   */
  async getUserQuests(userId: string, status?: QuestStatus): Promise<Quest[]> {
    const where: any = { user: { id: userId } };
    if (status) {
      where.status = status;
    }

    return this.questRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific quest
   */
  async getQuest(questId: string, userId: string): Promise<Quest> {
    const quest = await this.questRepository.findOne({
      where: {
        id: questId,
        user: { id: userId },
      },
      relations: ['character', 'user'],
    });

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    return quest;
  }

  /**
   * Accept a quest
   */
  async acceptQuest(questId: string, userId: string): Promise<Quest> {
    const quest = await this.getQuest(questId, userId);

    if (quest.status !== QuestStatus.OFFERED) {
      throw new Error('Quest cannot be accepted');
    }

    quest.status = QuestStatus.ACTIVE;
    return this.questRepository.save(quest);
  }

  /**
   * Update quest progress
   */
  async updateProgress(
    questId: string,
    userId: string,
    progress: number,
  ): Promise<Quest> {
    const quest = await this.getQuest(questId, userId);

    if (quest.status !== QuestStatus.ACTIVE) {
      throw new Error('Quest is not active');
    }

    quest.progress = Math.min(100, Math.max(0, progress));

    if (quest.progress === 100) {
      quest.status = QuestStatus.COMPLETED;
      quest.completedAt = new Date();
    }

    return this.questRepository.save(quest);
  }

  /**
   * Complete a quest
   */
  async completeQuest(questId: string, userId: string): Promise<Quest> {
    const quest = await this.getQuest(questId, userId);

    quest.status = QuestStatus.COMPLETED;
    quest.completedAt = new Date();
    quest.progress = 100;

    return this.questRepository.save(quest);
  }

  /**
   * Abandon a quest
   */
  async abandonQuest(questId: string, userId: string): Promise<Quest> {
    const quest = await this.getQuest(questId, userId);

    if (quest.status === QuestStatus.COMPLETED) {
      throw new Error('Cannot abandon completed quest');
    }

    quest.status = QuestStatus.ABANDONED;
    return this.questRepository.save(quest);
  }

  /**
   * Map difficulty string to enum
   */
  private mapDifficulty(difficulty: string): QuestDifficulty {
    const difficultyMap: Record<string, QuestDifficulty> = {
      easy: QuestDifficulty.EASY,
      medium: QuestDifficulty.MEDIUM,
      hard: QuestDifficulty.HARD,
      legendary: QuestDifficulty.LEGENDARY,
    };

    return difficultyMap[difficulty.toLowerCase()] || QuestDifficulty.MEDIUM;
  }

  /**
   * Generate rewards based on difficulty
   */
  private generateRewards(difficulty: string): any {
    const rewardsMap: Record<string, any> = {
      easy: { experiencePoints: 100, items: ['Minor Health Potion'] },
      medium: {
        experiencePoints: 250,
        items: ['Health Potion', '50 Gold'],
      },
      hard: {
        experiencePoints: 500,
        items: ['Greater Health Potion', '150 Gold', 'Rare Artifact'],
      },
      legendary: {
        experiencePoints: 1000,
        items: ['Legendary Item', '500 Gold', 'Epic Artifact'],
        title: 'Hero of the Realm',
      },
    };

    return rewardsMap[difficulty.toLowerCase()] || rewardsMap['medium'];
  }
}
