import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { ConversationsModule } from './conversations/conversations.module';
import { QuestsModule } from './quests/quests.module';
import { WorldStateModule } from './world-state/world-state.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    CharactersModule,
    ConversationsModule,
    QuestsModule,
    WorldStateModule,
    GeminiModule,
  ],
})
export class AppModule {}
