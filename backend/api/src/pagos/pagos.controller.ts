import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import {
  FindAllTransaccionesODT,
  BuscarOrdenesPendientesODT,
  BuscarFacturasPendientesODT,
  CrearTransaccionPagoODT,
  AnularTransaccionODT,
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

  @Post('transaccion')
  @UsePipes(new ValidationPipe({ transform: true }))
  createTransaccion(@Body() data: CrearTransaccionPagoODT) {
    return this.pagosService.createTransaccionPago(data);
  }

  @Get('transaccion/:id')
  findOneTransaccion(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.findOneTransaccionPago(id);
  }

  @Post('transaccion/:id/anular')
  @UsePipes(new ValidationPipe({ transform: true }))
  anularTransaccion(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AnularTransaccionODT,
  ) {
    return this.pagosService.anularTransaccionPago(id, data.motivo);
  }
}
