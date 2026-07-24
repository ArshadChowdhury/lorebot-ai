import { Test, TestingModule } from '@nestjs/testing';
import { DubaiPropertiesController } from './dubai-properties.controller';

describe('DubaiPropertiesController', () => {
  let controller: DubaiPropertiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DubaiPropertiesController],
    }).compile();

    controller = module.get<DubaiPropertiesController>(DubaiPropertiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
