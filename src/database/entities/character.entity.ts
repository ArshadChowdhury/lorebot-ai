import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';

// ✅ Enum for CharacterRole — allows strong typing + consistency
export enum CharacterRole {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  HEALER = 'healer',
  ROGUE = 'rogue',
  ARCHER = 'archer',
  MERCHANT = 'merchant',
  VILLAGER = 'villager',
  KING = 'king',
  QUEEN = 'queen',
  CUSTOM = 'custom',
}

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column({ length: 50 })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 30, default: 'neutral' })
  alignment: string; // e.g. "good", "evil", "neutral"

  @Column({ length: 50, nullable: true })
  race: string; // e.g. "elf", "orc", "human"

  // ✅ Use enum for role
  @Column({ type: 'enum', enum: CharacterRole, default: CharacterRole.CUSTOM })
  role: CharacterRole;

  @Column({ type: 'text', nullable: true })
  backstory: string;

  @Column({ type: 'text', nullable: true })
  personalityPrompt: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ type: 'simple-array', default: '' })
  speechPatterns: string[];

  @Column({ type: 'simple-array', default: '' })
  knowledgeDomains: string[];

  @Column({
    type: 'jsonb',
    default: { state: 'neutral', intensity: 5, reason: null },
  })
  currentMood: {
    state: string;
    intensity: number;
    reason?: string;
  };

  @Column({ default: 1 })
  level: number;

  @Column({ nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Conversation, (conversation) => conversation.character)
  conversations: Conversation[];

  @Column({ default: 0 })
  experiencePoints: number;

  @Column({ type: 'jsonb', default: {} })
  stats: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  traits: Record<string, any>;

  @OneToMany(() => Message, (message) => message.character)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
