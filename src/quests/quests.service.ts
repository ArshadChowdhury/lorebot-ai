// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import {
//   Quest,
//   QuestStatus,
//   QuestDifficulty,
// } from '../database/entities/quest.entity';

// export interface QuestOffer {
//   title: string;
//   description: string;
//   difficulty: string;
// }

// @Injectable()
// export class QuestsService {
//   constructor(
//     @InjectRepository(Quest)
//     private questRepository: Repository<Quest>,
//   ) {}

//   /**
//    * Create a new quest
//    */
//   async createQuest(
//     userId: string,
//     characterId: string,
//     questOffer: QuestOffer,
//   ): Promise<Quest> {
//     const quest = this.questRepository.create({
//       user: { id: userId } as any, // ✅ relational shortcut
//       character: { id: characterId } as any,
//       title: questOffer.title,
//       description: questOffer.description,
//       difficulty: this.mapDifficulty(questOffer.difficulty),
//       status: QuestStatus.OFFERED,
//       objectives: [],
//       rewards: this.generateRewards(questOffer.difficulty),
//     });

//     return this.questRepository.save(quest);
//   }

//   /**
//    * Get all quests for a user
//    */
//   async getUserQuests(userId: string, status?: QuestStatus): Promise<Quest[]> {
//     const where: any = { user: { id: userId } };
//     if (status) {
//       where.status = status;
//     }

//     return this.questRepository.find({
//       where,
//       relations: ['user'],
//       order: { createdAt: 'DESC' },
//     });
//   }

//   /**
//    * Get a specific quest
//    */
//   async getQuest(questId: string, userId: string): Promise<Quest> {
//     const quest = await this.questRepository.findOne({
//       where: {
//         id: questId,
//         user: { id: userId },
//       },
//       relations: ['character', 'user'],
//     });

//     if (!quest) {
//       throw new NotFoundException('Quest not found');
//     }

//     return quest;
//   }

//   /**
//    * Accept a quest
//    */
//   async acceptQuest(questId: string, userId: string): Promise<Quest> {
//     const quest = await this.getQuest(questId, userId);

//     if (quest.status !== QuestStatus.OFFERED) {
//       throw new Error('Quest cannot be accepted');
//     }

//     quest.status = QuestStatus.ACTIVE;
//     return this.questRepository.save(quest);
//   }

//   /**
//    * Update quest progress
//    */
//   async updateProgress(
//     questId: string,
//     userId: string,
//     progress: number,
//   ): Promise<Quest> {
//     const quest = await this.getQuest(questId, userId);

//     if (quest.status !== QuestStatus.ACTIVE) {
//       throw new Error('Quest is not active');
//     }

//     quest.progress = Math.min(100, Math.max(0, progress));

//     if (quest.progress === 100) {
//       quest.status = QuestStatus.COMPLETED;
//       quest.completedAt = new Date();
//     }

//     return this.questRepository.save(quest);
//   }

//   /**
//    * Complete a quest
//    */
//   async completeQuest(questId: string, userId: string): Promise<Quest> {
//     const quest = await this.getQuest(questId, userId);

//     quest.status = QuestStatus.COMPLETED;
//     quest.completedAt = new Date();
//     quest.progress = 100;

//     return this.questRepository.save(quest);
//   }

//   /**
//    * Abandon a quest
//    */
//   async abandonQuest(questId: string, userId: string): Promise<Quest> {
//     const quest = await this.getQuest(questId, userId);

//     if (quest.status === QuestStatus.COMPLETED) {
//       throw new Error('Cannot abandon completed quest');
//     }

//     quest.status = QuestStatus.ABANDONED;
//     return this.questRepository.save(quest);
//   }

//   /**
//    * Map difficulty string to enum
//    */
//   private mapDifficulty(difficulty: string): QuestDifficulty {
//     const difficultyMap: Record<string, QuestDifficulty> = {
//       easy: QuestDifficulty.EASY,
//       medium: QuestDifficulty.MEDIUM,
//       hard: QuestDifficulty.HARD,
//       legendary: QuestDifficulty.LEGENDARY,
//     };

//     return difficultyMap[difficulty.toLowerCase()] || QuestDifficulty.MEDIUM;
//   }

//   /**
//    * Generate rewards based on difficulty
//    */
//   private generateRewards(difficulty: string): any {
//     const rewardsMap: Record<string, any> = {
//       easy: { experiencePoints: 100, items: ['Minor Health Potion'] },
//       medium: {
//         experiencePoints: 250,
//         items: ['Health Potion', '50 Gold'],
//       },
//       hard: {
//         experiencePoints: 500,
//         items: ['Greater Health Potion', '150 Gold', 'Rare Artifact'],
//       },
//       legendary: {
//         experiencePoints: 1000,
//         items: ['Legendary Item', '500 Gold', 'Epic Artifact'],
//         title: 'Hero of the Realm',
//       },
//     };

//     return rewardsMap[difficulty.toLowerCase()] || rewardsMap['medium'];
//   }
// }

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
  objectives?: string[]; // Add objectives from AI
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
    // Generate objectives from description or use provided ones
    const objectives = questOffer.objectives
      ? questOffer.objectives.map((obj) => ({
          description: obj,
          completed: false,
        }))
      : this.generateObjectivesFromDescription(questOffer.description);

    const quest = this.questRepository.create({
      user: { id: userId } as any,
      character: { id: characterId } as any,
      title: questOffer.title,
      description: questOffer.description,
      difficulty: this.mapDifficulty(questOffer.difficulty),
      status: QuestStatus.OFFERED,
      objectives,
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
      relations: ['character'],
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
    quest.progress = 0;
    return this.questRepository.save(quest);
  }

  /**
   * Update quest progress based on conversation keywords
   */
  async checkQuestProgressFromMessage(
    userId: string,
    characterId: string,
    message: string,
  ): Promise<Quest[]> {
    // Get all active quests from this character
    const activeQuests = await this.questRepository.find({
      where: {
        user: { id: userId },
        character: { id: characterId },
        status: QuestStatus.ACTIVE,
      },
    });

    const updatedQuests: Quest[] = [];

    for (const quest of activeQuests) {
      let progressMade = false;
      let completedObjectives = 0;

      // Check each objective against the message
      quest.objectives = quest.objectives.map((objective) => {
        if (!objective.completed) {
          // Check if message contains keywords from objective
          const keywords = this.extractKeywords(objective.description);
          const messageContainsKeyword = keywords.some((keyword) =>
            message.toLowerCase().includes(keyword.toLowerCase()),
          );

          if (messageContainsKeyword) {
            objective.completed = true;
            progressMade = true;
          }
        }

        if (objective.completed) completedObjectives++;
        return objective;
      });

      if (progressMade) {
        // Calculate progress percentage
        quest.progress = Math.round(
          (completedObjectives / quest.objectives.length) * 100,
        );

        // Auto-complete if all objectives done
        if (quest.progress >= 100) {
          quest.status = QuestStatus.COMPLETED;
          quest.completedAt = new Date();
        }

        const updated = await this.questRepository.save(quest);
        updatedQuests.push(updated);
      }
    }

    return updatedQuests;
  }

  /**
   * Manually update quest progress
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
   * Complete a quest manually
   */
  async completeQuest(questId: string, userId: string): Promise<Quest> {
    const quest = await this.getQuest(questId, userId);

    if (quest.status === QuestStatus.COMPLETED) {
      throw new Error('Quest already completed');
    }

    quest.status = QuestStatus.COMPLETED;
    quest.completedAt = new Date();
    quest.progress = 100;

    // Mark all objectives as completed
    quest.objectives = quest.objectives.map((obj) => ({
      ...obj,
      completed: true,
    }));

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
   * Get active quests from a specific character
   */
  async getActiveQuestsForCharacter(
    userId: string,
    characterId: string,
  ): Promise<Quest[]> {
    return this.questRepository.find({
      where: {
        user: { id: userId },
        character: { id: characterId },
        status: QuestStatus.ACTIVE,
      },
    });
  }

  /**
   * Generate objectives from quest description
   */
  private generateObjectivesFromDescription(
    description: string,
  ): Array<{ description: string; completed: boolean }> {
    // Simple keyword extraction for objectives
    const objectives: Array<{ description: string; completed: boolean }> = [];

    // Common quest patterns
    const patterns = [
      { regex: /find\s+(?:the\s+)?(\w+)/gi, template: 'Find the $1' },
      { regex: /collect\s+(\d+)\s+(\w+)/gi, template: 'Collect $1 $2' },
      { regex: /talk\s+to\s+(\w+)/gi, template: 'Talk to $1' },
      { regex: /defeat\s+(?:the\s+)?(\w+)/gi, template: 'Defeat the $1' },
      { regex: /bring\s+(?:me\s+)?(\w+)/gi, template: 'Bring $1' },
      {
        regex: /investigate\s+(?:the\s+)?(\w+)/gi,
        template: 'Investigate the $1',
      },
    ];

    for (const pattern of patterns) {
      const matches = [...description.matchAll(pattern.regex)];
      matches.forEach((match) => {
        const objective = pattern.template.replace(
          /\$(\d+)/g,
          (_, num) => match[parseInt(num)],
        );
        objectives.push({ description: objective, completed: false });
      });
    }

    // If no objectives found, create a simple one
    if (objectives.length === 0) {
      objectives.push({
        description: 'Complete the quest',
        completed: false,
      });
    }

    return objectives.slice(0, 5); // Max 5 objectives
  }

  /**
   * Extract keywords from objective description
   */
  private extractKeywords(objective: string): string[] {
    // Remove common words and extract meaningful keywords
    const commonWords = ['the', 'a', 'an', 'to', 'and', 'or', 'of', 'in', 'on'];
    const words = objective.toLowerCase().split(/\s+/);

    return words
      .filter((word) => word.length > 3 && !commonWords.includes(word))
      .filter((word) => /^[a-z]+$/.test(word)); // Only alphabetic words
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
