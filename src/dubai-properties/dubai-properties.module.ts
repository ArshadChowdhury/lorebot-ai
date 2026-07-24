import { Module } from '@nestjs/common';
import { DubaiPropertiesController } from './dubai-properties.controller';
import { DubaiPropertiesService } from './dubai-properties.service';

@Module({
  controllers: [DubaiPropertiesController],
  providers: [DubaiPropertiesService]
})
export class DubaiPropertiesModule {}
