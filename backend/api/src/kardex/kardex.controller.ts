import { Controller, Get, Query } from '@nestjs/common';
import { KardexService } from './kardex.service';

@Controller('kardex')
export class KardexController {
  constructor(private readonly kardexService: KardexService) {}

  @Get('search')
  search(@Query('q') q?: string) {
    return this.kardexService.search(q || '');
  }
}
