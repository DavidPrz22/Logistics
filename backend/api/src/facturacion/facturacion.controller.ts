import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { FindAllFacturasODT } from './ODTs/factuacion.odts';

@Controller('facturas')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get()
  findAll(@Query() query?: FindAllFacturasODT) {
    return this.facturacionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.findOne(id);
  }
}
