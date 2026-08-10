import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import {
  FindAllTransaccionesODT,
  BuscarOrdenesPendientesODT,
  BuscarFacturasPendientesODT,
} from './ODTs/pagos.odts';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get('transacciones')
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query?: FindAllTransaccionesODT) {
    return this.pagosService.findAll(query);
  }

  @Get('ordenes-pendientes')
  @UsePipes(new ValidationPipe({ transform: true }))
  findOrdenesPendientes(@Query() query?: BuscarOrdenesPendientesODT) {
    return this.pagosService.findOrdenesPendientes(query?.q);
  }

  @Get('facturas-pendientes')
  @UsePipes(new ValidationPipe({ transform: true }))
  findFacturasPendientes(@Query() query?: BuscarFacturasPendientesODT) {
    return this.pagosService.findFacturasPendientes(query?.q);
  }
}
