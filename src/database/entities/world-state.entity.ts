import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

// ✅ Enum for severity
export enum EventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('world_states')
export class WorldState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column({ length: 100 })
  eventName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: EventSeverity,
    default: EventSeverity.LOW,
  })
  severity: EventSeverity;

  @Column({ type: 'simple-array', default: '' })
  affectedLocations: string[];

  // ✅ Added to link event effects to certain characters
  @Column({ type: 'simple-array', default: '' })
  affectedCharacterIds: string[];

  @Column({ default: true })
  isActive: boolean;

  // ✅ Added to handle event expiration
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
