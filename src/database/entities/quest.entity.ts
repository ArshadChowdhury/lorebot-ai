import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Character } from './character.entity';

export enum QuestStatus {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  AVAILABLE = 'available',
  OFFERED = 'offered',
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
}

export enum QuestDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  LEGENDARY = 'legendary',
}

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.quests, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Character, (character) => character.id, {
    onDelete: 'CASCADE',
  })
  character: Character;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: QuestDifficulty,
    default: QuestDifficulty.EASY,
  })
  difficulty: QuestDifficulty;

  @Column({
    type: 'enum',
    enum: QuestStatus,
    default: QuestStatus.OFFERED,
  })
  status: QuestStatus;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'jsonb', default: [] })
  objectives: Record<string, any>[];

  @Column({ type: 'jsonb', default: {} })
  rewards: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
