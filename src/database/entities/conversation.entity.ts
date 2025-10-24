// // import {
// //   Entity,
// //   PrimaryGeneratedColumn,
// //   Column,
// //   ManyToOne,
// //   OneToMany,
// //   CreateDateColumn,
// //   UpdateDateColumn,
// // } from 'typeorm';
// // import { User } from './user.entity';
// // import { Message } from './message.entity';

// // @Entity('conversations')
// // export class Conversation {
// //   @PrimaryGeneratedColumn('uuid')
// //   id: string;

// //   @Column({ length: 100 })
// //   title: string;

// //   @ManyToOne(() => User, (user) => user.conversations, { onDelete: 'CASCADE' })
// //   user: User;

// //   @OneToMany(() => Message, (message) => message.conversation, {
// //     cascade: true,
// //   })
// //   messages: Message[];

// //   @Column({ default: 'gemini-pro' })
// //   modelUsed: string;

// //   @Column({ type: 'jsonb', nullable: true })
// //   context: Record<string, any>;

// //   @CreateDateColumn()
// //   createdAt: Date;

// //   @UpdateDateColumn()
// //   updatedAt: Date;
// // }

// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   OneToMany,
// } from 'typeorm';
// import { User } from './user.entity';
// import { Character } from './character.entity';
// import { Message } from './message.entity';

// @Entity('conversations')
// export class Conversation {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   // Each conversation belongs to one user
//   @ManyToOne(() => User, (user) => user.conversations, { onDelete: 'CASCADE' })
//   user: User;

//   // Each conversation involves one character (NPC, etc.)
//   @ManyToOne(() => Character, (character) => character.conversations, {
//     onDelete: 'CASCADE',
//   })
//   character: Character;

//   // One conversation can have many messages
//   @OneToMany(() => Message, (message) => message.conversation)
//   messages: Message[];

//   @Column({ default: true })
//   isActive: boolean;

//   @Column({ type: 'jsonb', default: () => `'{}'` })
//   metadata: {
//     totalMessages: number;
//     userFacts: string[];
//   };

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }

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
import { Character } from './character.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.conversations, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Character, (character) => character.conversations, {
    onDelete: 'CASCADE',
  })
  character: Character;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: false, // ✅ Add this
  })
  messages: Message[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: () => `'{}'` })
  metadata: {
    totalMessages: number;
    userFacts: string[];
  };

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
