import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { WorldState } from '../database/entities/world-state.entity';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { GeminiService } from '../gemini/gemini.service';
import { CharactersModule } from '../characters/characters.module';
import { QuestsModule } from 'src/quests/quests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, WorldState]),
    CharactersModule,
    QuestsModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, GeminiService],
})
export class ConversationsModule {}
