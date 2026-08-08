import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Prisma } from 'prisma/generated/prisma/client';
import type {
  DocumentoDeudaListado,
  PaginatedDocumentosResponse,
  DocumentoDeudaDetalle,
  PagosVinculadosDocumento,
} from './types/facturacion.types';
import { FindAllFacturasODT } from './ODTs/factuacion.odts';

@Injectable()
export class FacturacionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query?: FindAllFacturasODT,
  ): Promise<PaginatedDocumentosResponse> {
    const page = Math.max(1, Number(query?.page) || 1);
    const requestedLimit = Number(query?.limit) || 50;
    const limit = Math.min(50, Math.max(1, requestedLimit));
    const skip = (page - 1) * limit;

    const where: Prisma.documentoDeudaWhereInput = {};

    if (query?.estado) {
      where.estado = query.estado;
    }

    if (query?.tipo) {
      where.tipoDocumento = query.tipo;
    }

    if (query?.q && query.q.trim() !== '') {
      const q = query.q.trim();
      where.OR = [
        {
          cliente: {
            nombre: {
              contains: q,
            },
          },
        },
        {
          orden: {
            numeroOrden: {
              contains: q,
            },
          },
        },
      ];
    }

    const [total, documentos] = await Promise.all([
      this.prisma.documentoDeuda.count({ where }),
      this.prisma.documentoDeuda.findMany({
        where,
        include: {
          orden: true,
          cliente: true,
        },
        orderBy: {
          id: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    let data: DocumentoDeudaListado[] = documentos.map((doc) => ({
      id: doc.id,
      sistemaOrigen: doc.sistemaOrigen,
      numeroOrden: doc.orden.numeroOrden,
      identificadorCliente: doc.cliente.nombre,
      montoTotalBase: Number(doc.montoTotalBase),
      estado: doc.estado ?? 'PENDIENTE',
      tipoDocumento: doc.tipoDocumento ?? 'FACTURA',
      fechaEmision: doc.fechaEmision
        ? doc.fechaEmision.toISOString()
        : new Date().toISOString(),
    }));

    if (query?.fecha && query.fecha.trim() !== '') {
      data = data.filter((doc) =>
        doc.fechaEmision.startsWith(query.fecha!.trim()),
      );
    }

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

  async findOne(id: number): Promise<DocumentoDeudaDetalle> {
    const doc = await this.prisma.documentoDeuda.findUnique({
      where: { id },
      include: {
        orden: true,
        cliente: true,
        transaccionesPago: {
          include: {
            metodoPago: true,
            divisa: true,
            cuentaDestino: true,
          },
        },
      },
    });

    if (!doc) {
      throw new NotFoundException('Documento de deuda no encontrado');
    }

    const transaccionesPago: PagosVinculadosDocumento[] =
      doc.transaccionesPago.map((pago) => ({
        id: pago.id,
        documentoId: pago.documentoId,
        ordenId: pago.ordenId,
        tipoDePago: pago.tipoDePago,
        metodoPago: pago.metodoPago.descripcion,
        divisaPago: pago.divisa.codigo,
        montoOrigen: Number(pago.montoOrigen),
        numeroReferencia: pago.numeroReferencia || undefined,
        estado: pago.estado ?? 'APROBADO',
        fechaPago: pago.fechaPago
          ? pago.fechaPago.toISOString()
          : new Date().toISOString(),
        cuentaDestinoId: pago.cuentaDestinoId,
        cuentaDestino: pago.cuentaDestino?.nombre ?? '',
      }));

    return {
      id: doc.id,
      sistemaOrigen: doc.sistemaOrigen,
      ordenId: doc.ordenId,
      numeroOrden: doc.orden.numeroOrden,
      identificadorCliente: doc.cliente.nombre,
      montoTotalBase: Number(doc.montoTotalBase),
      saldoPendienteBase: Number(doc.saldoPendienteBase),
      totalAbonado: Number(doc.orden?.totalAbonado ?? 0),
      estado: doc.estado ?? 'PENDIENTE',
      tipoDocumento: doc.tipoDocumento ?? 'FACTURA',
      fechaEmision: doc.fechaEmision
        ? doc.fechaEmision.toISOString()
        : new Date().toISOString(),
      transaccionesPago,
    };
  }
}
