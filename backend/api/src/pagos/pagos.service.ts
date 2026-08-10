import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Prisma } from 'prisma/generated/prisma/client';
import type {
  TransaccionTablaResponse,
  PaginatedTransaccionesResponse,
  OrdenPendienteResponse,
  FacturaPendienteResponse,
} from './types/pagos.types';
import { FindAllTransaccionesODT } from './ODTs/pagos.odts';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query?: FindAllTransaccionesODT,
  ): Promise<PaginatedTransaccionesResponse> {
    const page = Math.max(1, Number(query?.page) || 1);
    const requestedLimit = Number(query?.limit) || 50;
    const limit = Math.min(100, Math.max(1, requestedLimit));
    const skip = (page - 1) * limit;

    const where: Prisma.transaccionPagoWhereInput = {};

    if (query?.estado) {
      where.estado = query.estado;
    }

    if (query?.tipo) {
      where.tipoDePago = query.tipo;
    }

    if (query?.desde || query?.hasta) {
      where.fechaPago = {};
      if (query?.desde) {
        where.fechaPago.gte = new Date(query.desde);
      }
      if (query?.hasta) {
        const hastaDate = new Date(query.hasta);
        hastaDate.setHours(23, 59, 59, 999);
        where.fechaPago.lte = hastaDate;
      }
    }

    if (query?.q && query.q.trim() !== '') {
      const q = query.q.trim();
      where.OR = [
        {
          id: {
            equals: Number(q) || undefined,
          },
        },
        {
          numeroReferencia: {
            contains: q,
          },
        },
        {
          documento: {
            cliente: {
              nombre: {
                contains: q,
              },
            },
          },
        },
      ];
    }

    const [total, transacciones] = await Promise.all([
      this.prisma.transaccionPago.count({ where }),
      this.prisma.transaccionPago.findMany({
        where,
        include: {
          metodoPago: true,
          divisa: true,
          documento: {
            include: {
              cliente: true,
            },
          },
        },
        orderBy: {
          fechaPago: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    const data: TransaccionTablaResponse[] = transacciones.map((t) => {
      const clienteNombre = t.documento?.cliente?.nombre || '—';

      return {
        id: t.id,
        fecha: t.fechaPago
          ? t.fechaPago.toISOString()
          : new Date().toISOString(),
        cliente: clienteNombre,
        tipo: t.tipoDePago,
        metodo: t.metodoPago.descripcion,
        referencia: t.numeroReferencia,
        estado: t.estado ?? 'APROBADO',
        montoOrigen: Number(t.montoOrigen),
        divisaSimbolo: t.divisa.codigo,
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOrdenesPendientes(q?: string): Promise<OrdenPendienteResponse[]> {
    const where: Prisma.ordenDespachoWhereInput = {
      documentoDeuda: null,
      NOT: {
        estado: 'LIQUIDADA',
      },
    };

    if (q && q.trim() !== '') {
      where.numeroOrden = {
        contains: q.trim(),
      };
    }

    const ordenes = await this.prisma.ordenDespacho.findMany({
      where,
      include: {
        cliente: true,
      },
      orderBy: {
        numeroOrden: 'asc',
      },
      take: 50,
    });

    return ordenes.map((orden) => ({
      id: orden.id,
      numeroOrden: orden.numeroOrden,
      estado: orden.estado ?? 'PREPARACION',
      clienteNombre: orden.cliente.nombre,
      totalOriginal: Number(orden.totalOriginal ?? 0),
    }));
  }

  async findFacturasPendientes(
    q?: string,
  ): Promise<FacturaPendienteResponse[]> {
    const where: Prisma.documentoDeudaWhereInput = {
      estado: {
        in: ['PENDIENTE', 'PAGADO_PARCIAL'],
      },
      saldoPendienteBase: {
        not: 0,
      },
    };

    if (q && q.trim() !== '') {
      const qTrimmed = q.trim();
      const qAsNumber = Number(qTrimmed);

      where.OR = [
        {
          id: {
            equals: isNaN(qAsNumber) ? undefined : qAsNumber,
          },
        },
        {
          orden: {
            numeroOrden: {
              contains: qTrimmed,
            },
          },
        },
      ];
    }

    const facturas = await this.prisma.documentoDeuda.findMany({
      where,
      include: {
        orden: true,
        cliente: true,
      },
      orderBy: {
        id: 'asc',
      },
      take: 50,
    });

    return facturas.map((factura) => ({
      id: factura.id,
      numeroOrden: factura.orden.numeroOrden,
      clienteNombre: factura.cliente.nombre,
      saldoPendienteBase: Number(factura.saldoPendienteBase),
    }));
  }
}
