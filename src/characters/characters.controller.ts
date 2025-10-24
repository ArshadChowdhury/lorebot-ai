import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { CharactersService } from './characters.service';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  findAll() {
    return this.charactersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.charactersService.findOne(id);
  }

  @Patch(':id/mood')
  updateMood(@Param('id') id: string, @Body() mood: any) {
    return this.charactersService.updateMood(id, mood);
  }

  @Get('seed/init')
  seedCharacters() {
    return this.charactersService.seedCharacters();
  }
}
