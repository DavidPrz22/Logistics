import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type {
  DocumentoDeudaListado,
  DocumentoDeudaDetalle,
  PagosVinculadosDocumento,
} from './types/facturacion.types';

@Injectable()
export class FacturacionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<DocumentoDeudaListado[]> {
    const documentos = await this.prisma.documentoDeuda.findMany({
      include: {
        orden: true,
        cliente: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return documentos.map((doc) => ({
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
      throw new NotFoundException(`Documento de deuda con ID ${id} no encontrado`);
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
