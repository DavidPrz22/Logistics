import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoreService {
  constructor(private readonly prisma: PrismaService) {}

  findAllAlmacenes() {
    return this.prisma.almacen.findMany();
  }

  findAllChoferes() {
    return this.prisma.chofer.findMany();
  }

  findAllClientes() {
    return this.prisma.cliente.findMany();
  }

  findAllDivisas() {
    return this.prisma.divisa.findMany();
  }

  findAllTasasCambio() {
    return this.prisma.tasaCambio.findMany({
      include: { divisaOrigen: true, divisaDestino: true },
    });
  }

  findAllMetodosPago() {
    return this.prisma.metodoPago.findMany();
  }
}
