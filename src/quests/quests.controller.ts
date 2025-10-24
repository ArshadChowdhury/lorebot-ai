import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Request,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { QuestsService } from './quests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuestStatus } from 'src/database/entities/quest.entity';

@Controller('quests')
@UseGuards(JwtAuthGuard)
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  getUserQuests(@Request() req, @Query('status') status?: QuestStatus) {
    return this.questsService.getUserQuests(req.user.id, status);
  }

  @Get(':id')
  getQuest(@Param('id') id: string, @Request() req) {
    return this.questsService.getQuest(id, req.user.id);
  }

  @Post(':id/accept')
  acceptQuest(@Param('id') id: string, @Request() req) {
    return this.questsService.acceptQuest(id, req.user.id);
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Request() req,
    @Body('progress') progress: number,
  ) {
    return this.questsService.updateProgress(id, req.user.id, progress);
  }

  @Post(':id/complete')
  completeQuest(@Param('id') id: string, @Request() req) {
    return this.questsService.completeQuest(id, req.user.id);
  }

  @Post(':id/abandon')
  abandonQuest(@Param('id') id: string, @Request() req) {
    return this.questsService.abandonQuest(id, req.user.id);
  }
}
