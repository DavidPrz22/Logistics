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
      sistema_origen: doc.sistemaOrigen,
      numero_orden: doc.orden.numeroOrden,
      identificador_cliente: doc.cliente.nombre,
      monto_total_base: Number(doc.montoTotalBase),
      estado: doc.estado ?? 'PENDIENTE',
      tipo_documento: doc.tipoDocumento ?? 'FACTURA',
      fecha_emision: doc.fechaEmision
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

    const transacciones_pago: PagosVinculadosDocumento[] =
      doc.transaccionesPago.map((pago) => ({
        id: pago.id,
        documento_id: pago.documentoId,
        orden_id: pago.ordenId,
        tipo_de_pago: pago.tipoDePago,
        metodo_pago: pago.metodoPago.descripcion,
        divisa_pago: pago.divisa.codigo,
        monto_origen: Number(pago.montoOrigen),
        numero_referencia: pago.numeroReferencia || undefined,
        estado: pago.estado ?? 'APROBADO',
        fecha_pago: pago.fechaPago
          ? pago.fechaPago.toISOString()
          : new Date().toISOString(),
        cuenta_destino_id: pago.cuentaDestinoId,
        cuenta_destino: pago.cuentaDestino?.nombre ?? '',
      }));

    return {
      id: doc.id,
      sistema_origen: doc.sistemaOrigen,
      orden_id: doc.ordenId,
      numero_orden: doc.orden.numeroOrden,
      identificador_cliente: doc.cliente.nombre,
      monto_total_base: Number(doc.montoTotalBase),
      saldo_pendiente_base: Number(doc.saldoPendienteBase),
      estado: doc.estado ?? 'PENDIENTE',
      tipo_documento: doc.tipoDocumento ?? 'FACTURA',
      fecha_emision: doc.fechaEmision
        ? doc.fechaEmision.toISOString()
        : new Date().toISOString(),
      transacciones_pago,
    };
  }
}

