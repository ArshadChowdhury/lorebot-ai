import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorldState } from '../database/entities/world-state.entity';
import { WorldStateService } from './world-state.service';
import { WorldStateController } from './world-state.controller';
import { GeminiService } from '../gemini/gemini.service';
import { CharactersModule } from '../characters/characters.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorldState]), CharactersModule],
  controllers: [WorldStateController],
  providers: [WorldStateService, GeminiService],
})
export class WorldStateModule {}
