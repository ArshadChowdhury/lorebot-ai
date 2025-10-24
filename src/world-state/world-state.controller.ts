import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { WorldStateService, CreateWorldEventDto } from './world-state.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('world-state')
@UseGuards(JwtAuthGuard)
export class WorldStateController {
  constructor(private readonly worldStateService: WorldStateService) {}

  @Get('active')
  getActiveEvents() {
    return this.worldStateService.getActiveEvents();
  }

  @Get()
  getAllEvents() {
    return this.worldStateService.getAllEvents();
  }

  @Post()
  createEvent(@Body() dto: CreateWorldEventDto) {
    return this.worldStateService.createEvent(dto);
  }

  @Post('generate')
  generateRandomEvent() {
    return this.worldStateService.generateRandomEvent();
  }

  @Post(':id/deactivate')
  deactivateEvent(@Param('id') id: string) {
    return this.worldStateService.deactivateEvent(id);
  }
}
