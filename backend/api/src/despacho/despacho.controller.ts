import { Controller, Get, Query } from '@nestjs/common';
import { DespachoService } from './despacho.service';

@Controller('despacho')
export class DespachoController {
  constructor(private readonly despachoService: DespachoService) {}

  @Get('lotes/search')
  async searchLotes(@Query('q') q?: string) {
    return this.despachoService.searchLotes(q);
  }
}
