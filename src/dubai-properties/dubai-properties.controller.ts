// import { Controller } from '@nestjs/common';

// @Controller('dubai-properties')
// export class DubaiPropertiesController {}


import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { DubaiPropertiesService, DubaiProperty } from './dubai-properties.service';

@Controller('dubai-properties')
export class DubaiPropertiesController {
  constructor(private readonly propertiesService: DubaiPropertiesService) { }

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('developmentTypeId') devId?: number,
  ) {
    return this.propertiesService.findAll(page, limit, devId);
  }
  //   @Get('developer/:id')
  //   getPropertiesByDeveloper(@Param('id', ParseIntPipe) id: number): DubaiProperty[] {
  //     return this.propertiesService.findByDeveloper(id);
  //   }
}