import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from '../database/entities/quest.entity';
import { QuestsService } from './quests.service';
import { QuestsController } from './quests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quest])],
  controllers: [QuestsController],
  providers: [QuestsService],
  exports: [QuestsService],
})
export class QuestsModule {}
