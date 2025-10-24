import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('start/:characterId')
  start(@Request() req, @Param('characterId') characterId: string) {
    return this.conversationsService.startConversation(
      req.user.id,
      characterId,
    );
  }

  @Get()
  getUserConversations(@Request() req) {
    return this.conversationsService.getUserConversations(req.user.id);
  }

  @Get(':id')
  getConversation(@Param('id') id: string, @Request() req) {
    return this.conversationsService.getConversation(id, req.user.id);
  }

  @Post(':id/send')
  sendMessage(@Param('id') id: string, @Request() req, @Body() dto: any) {
    return this.conversationsService.sendMessage(id, req.user.id, dto);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    return this.conversationsService.getMessages(
      id,
      req.user.id,
      Number(limit),
    );
  }
}
