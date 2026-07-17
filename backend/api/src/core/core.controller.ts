import { Controller, Get } from '@nestjs/common';
import { CoreService } from './core.service';

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

  @Get('metodos-pago')
  findAllMetodosPago() {
    return this.coreService.findAllMetodosPago();
  }
}
