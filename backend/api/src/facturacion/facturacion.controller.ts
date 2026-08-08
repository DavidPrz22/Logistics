import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';

@Controller('facturas')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get()
  findAll() {
    return this.facturacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.findOne(id);
  }
}

