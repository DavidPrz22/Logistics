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
  UseGuards,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import {
  FindAllTransaccionesODT,
  BuscarOrdenesPendientesODT,
  BuscarFacturasPendientesODT,
  CrearTransaccionPagoODT,
  AnularTransaccionODT,
} from './ODTs/pagos.odts';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards/jwt-auth-guards.guard';
import { Usuario } from 'src/users/types/users.types';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

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

  @UseGuards(JwtAuthGuard)
  @Post('transaccion')
  @UsePipes(new ValidationPipe({ transform: true }))
  createTransaccion(
    @CurrentUser() user: Usuario,
    @Body() data: CrearTransaccionPagoODT,
  ) {
    return this.pagosService.createTransaccionPago(data, user.id);
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
