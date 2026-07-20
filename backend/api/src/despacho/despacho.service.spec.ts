import { Test, TestingModule } from '@nestjs/testing';
import { DespachoService } from './despacho.service';

describe('DespachoService', () => {
  let service: DespachoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DespachoService],
    }).compile();

    service = module.get<DespachoService>(DespachoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
