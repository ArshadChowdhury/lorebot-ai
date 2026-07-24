import { Test, TestingModule } from '@nestjs/testing';
import { DubaiPropertiesService } from './dubai-properties.service';

describe('DubaiPropertiesService', () => {
  let service: DubaiPropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DubaiPropertiesService],
    }).compile();

    service = module.get<DubaiPropertiesService>(DubaiPropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
