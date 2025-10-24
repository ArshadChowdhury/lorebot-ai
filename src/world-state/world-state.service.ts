import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  WorldState,
  EventSeverity,
} from '../database/entities/world-state.entity';
import { GeminiService } from '../gemini/gemini.service';
import { CharactersService } from '../characters/characters.service';

export interface CreateWorldEventDto {
  eventName: string;
  description: string;
  severity: EventSeverity;
  affectedLocations: string[];
  affectedCharacterIds?: string[];
  duration?: number; // in hours
}

@Injectable()
export class WorldStateService {
  constructor(
    @InjectRepository(WorldState)
    private worldStateRepository: Repository<WorldState>,
    private geminiService: GeminiService,
    private charactersService: CharactersService,
  ) {}

  /**
   * Get all active world events
   */
  async getActiveEvents(): Promise<WorldState[]> {
    await this.cleanupExpiredEvents();

    return this.worldStateRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all world events (including inactive)
   */
  async getAllEvents(): Promise<WorldState[]> {
    return this.worldStateRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create a new world event
   */
  async createEvent(dto: CreateWorldEventDto): Promise<WorldState> {
    const expiresAt = dto.duration
      ? new Date(Date.now() + dto.duration * 60 * 60 * 1000)
      : null;

    const worldEvent = this.worldStateRepository.create({
      eventName: dto.eventName,
      description: dto.description,
      severity: dto.severity,
      affectedLocations: dto.affectedLocations,
      affectedCharacterIds: dto.affectedCharacterIds || [],
      expiresAt,
    });

    const savedEvent = await this.worldStateRepository.save(worldEvent);

    // Update affected characters' moods
    if (dto.affectedCharacterIds && dto.affectedCharacterIds.length > 0) {
      await this.updateCharacterMoods(savedEvent);
    }

    return savedEvent;
  }

  /**
   * Generate a random world event using AI
   */
  async generateRandomEvent(): Promise<WorldState> {
    const eventData = await this.geminiService.generateWorldEvent();

    return this.createEvent({
      eventName: eventData.eventName,
      description: eventData.description,
      severity: this.mapSeverity(eventData.severity),
      affectedLocations: eventData.affectedLocations,
      duration: 24, // 24 hours by default
    });
  }

  /**
   * Deactivate an event
   */
  async deactivateEvent(eventId: string): Promise<WorldState> {
    const event = await this.worldStateRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    event.isActive = false;
    return this.worldStateRepository.save(event);
  }

  /**
   * Clean up expired events
   */
  private async cleanupExpiredEvents(): Promise<void> {
    await this.worldStateRepository.update(
      {
        expiresAt: LessThan(new Date()),
        isActive: true,
      },
      { isActive: false },
    );
  }

  /**
   * Update character moods based on world event
   */
  private async updateCharacterMoods(event: WorldState): Promise<void> {
    const moodMap: Record<EventSeverity, { state: string; intensity: number }> =
      {
        [EventSeverity.LOW]: { state: 'curious', intensity: 5 },
        [EventSeverity.MEDIUM]: { state: 'concerned', intensity: 6 },
        [EventSeverity.HIGH]: { state: 'alarmed', intensity: 8 },
        [EventSeverity.CRITICAL]: { state: 'panicked', intensity: 10 },
      };

    const mood = moodMap[event.severity];

    for (const characterId of event.affectedCharacterIds) {
      try {
        await this.charactersService.updateMood(characterId, {
          ...mood,
          reason: event.eventName,
        });
      } catch (error) {
        console.error(
          `Failed to update mood for character ${characterId}:`,
          error,
        );
      }
    }
  }

  /**
   * Map severity string to enum
   */
  private mapSeverity(severity: string): EventSeverity {
    const severityMap: Record<string, EventSeverity> = {
      low: EventSeverity.LOW,
      medium: EventSeverity.MEDIUM,
      high: EventSeverity.HIGH,
      critical: EventSeverity.CRITICAL,
    };

    return severityMap[severity.toLowerCase()] || EventSeverity.MEDIUM;
  }
}
