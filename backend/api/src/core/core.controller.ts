import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CoreService } from './core.service';
import {
  UpdateTasasCambioODT,
  FindTasasCambioByFechaODT,
} from './ODTs/core.odts';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards/jwt-auth-guards.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'prisma/generated/prisma/enums';
@UseGuards(JwtAuthGuard)
@Controller('core')
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @Get('almacenes')
  findAllAlmacenes() {
    return this.coreService.findAllAlmacenes();
  }

  @Get('choferes')
  findAllChoferes() {
    return this.coreService.findAllChoferes();
  }

  @Get('clientes')
  findAllClientes() {
    return this.coreService.findAllClientes();
  }

  @Get('divisas')
  findAllDivisas() {
    return this.coreService.findAllDivisas();
  }

  @Get('tasas-cambio')
  findAllTasasCambio() {
    return this.coreService.findAllTasasCambio();
  }

  @Get('registro-tasas')
  @UsePipes(new ValidationPipe({ transform: true }))
  findAllRegistroTasas(@Query() query?: FindTasasCambioByFechaODT) {
    if (query?.fecha) {
      return this.coreService.findRegistrosTasasByFecha(query?.fecha);
    }
    return this.coreService.findAllRegistroTasas();
  }

  @Get('registro-tasas/:id/tasas-cambio')
  findTasasCambioByRegistroId(@Param('id', ParseIntPipe) id: number) {
    return this.coreService.findTasasCambioByRegistroId(id);
  }

  @Get('metodos-pago')
  findAllMetodosPago() {
    return this.coreService.findAllMetodosPago();
  }

  @Get('motivo-rechazo')
  findAllMotivoRechazo() {
    return this.coreService.findAllMotivoRechazo();
  }

  @Get('estados-facturas')
  getEstadosFacturas() {
    return this.coreService.getEstadosFacturas();
  }

  @Get('estados-transacciones-pago')
  getEstadosTransaccionesPago() {
    return this.coreService.getEstadosTransaccionesPago();
  }

  @Get('tipos-documento')
  getTiposDocumento() {
    return this.coreService.getTiposDocumento();
  }

  @Get('tipos-pago')
  getTiposPago() {
    return this.coreService.getTiposPago();
  }

  @Get('tipos-operacion')
  getTiposOperacion() {
    return this.coreService.getTiposOperacion();
  }

  @Get('cuentas-destino')
  findAllCuentasDestino() {
    return this.coreService.findAllCuentasDestino();
  }

  @Post('tasas-cambio')
  updateTasasCambio() {
    return this.coreService.updateTasasCambio();
  }

  @Roles(Rol.ADMINISTRADOR, Rol.GERENTE)
  @UseGuards(RolesGuard)
  @Patch('registro-tasas/:id/tasas-cambio')
  updateTasasCambioByRegistroId(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTasasCambioODT,
  ) {
    return this.coreService.updateTasasCambioByRegistroId(id, data);
  }
}
