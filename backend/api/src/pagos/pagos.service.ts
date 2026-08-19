import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Prisma } from 'prisma/generated/prisma/client';
import type {
  TransaccionTablaResponse,
  PaginatedTransaccionesResponse,
  OrdenPendienteResponse,
  FacturaPendienteResponse,
  TransaccionPagoResponse,
  TransaccionPagoDetailResponse,
} from './types/pagos.types';
import {
  FindAllTransaccionesODT,
  CrearTransaccionPagoODT,
} from './ODTs/pagos.odts';
import {
  TipoDePago,
  TipoOperacionPago,
  EstadoTransaccionPago,
  EstadoDocumentoDeuda,
  FuenteTasaCambio,
} from 'prisma/generated/prisma/enums';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(PagosService.name);
  private round2(value: unknown): number {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  private async actualizarSaldoDocumento(
    documentoId: number,
    montoEquivalente: number,
    operacion: 'sumar' | 'restar',
  ): Promise<void> {
    const documento = await this.prisma.documentoDeuda.findUnique({
      where: { id: documentoId },
    });

    if (!documento) return;

    const factor = operacion === 'sumar' ? 1 : -1;
    const nuevoSaldo =
      Number(documento.saldoPendienteBase) + montoEquivalente * factor;
    const saldoRedondeado = Math.max(0, Math.round(nuevoSaldo * 100) / 100);

    const nuevoSaldoVES =
      Number(documento.saldoPendienteVes || 0) +
      montoEquivalente * factor * Number(documento.tasaEmisionValor || 0);
    const saldoRedondeadoVES = Math.max(
      0,
      Math.round(nuevoSaldoVES * 100) / 100,
    );

    let nuevoEstado: EstadoDocumentoDeuda = EstadoDocumentoDeuda.PENDIENTE;
    if (saldoRedondeado === 0) {
      nuevoEstado = EstadoDocumentoDeuda.PAGADO_TOTAL;
    } else if (saldoRedondeado < Number(documento.montoTotalBase)) {
      nuevoEstado = EstadoDocumentoDeuda.PAGADO_PARCIAL;
    }

    await this.prisma.documentoDeuda.update({
      where: { id: documentoId },
      data: {
        saldoPendienteBase: saldoRedondeado,
        saldoPendienteVes: saldoRedondeadoVES,
        estado: nuevoEstado,
      },
    });
  }

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
          orden: {
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
      const clienteNombre = t.documento
        ? t.documento.cliente?.nombre
        : t.orden?.cliente?.nombre || '—';

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
        montoOrigen: this.round2(t.montoOrigen),
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
      saldoPendienteBase: this.round2(factura.saldoPendienteBase),
    }));
  }

  async createTransaccionPago(
    data: CrearTransaccionPagoODT,
  ): Promise<TransaccionPagoResponse> {
    const {
      documentoId,
      ordenId,
      tasaAplicadaId,
      divisaPagoId,
      montoEquivalenteBase,
    } = data;

    if (!documentoId && !ordenId) {
      throw new Error(
        'Debe proporcionar un documentoId o un ordenId para registrar el pago',
      );
    }

    const divisa = await this.prisma.divisa.findUnique({
      where: { id: divisaPagoId },
    });

    if (!divisa) {
      throw new Error('Divisa no encontrada');
    }

    let tasaAplicadaValor: number | null = null;
    let montoCalculadoVes: number | null = null;

    if (tasaAplicadaId) {
      const tasa = await this.prisma.tasaCambio.findUnique({
        where: { id: tasaAplicadaId },
        include: {
          divisaOrigen: true,
          divisaDestino: true,
        },
      });

      if (!tasa) {
        throw new Error('Tasa de cambio no encontrada');
      }

      tasaAplicadaValor = Number(tasa.tasa);
    }

    // calculate montoCalculadoVes

    if (divisa.codigo === 'VES' && tasaAplicadaId) {
      console.log('tasausd', tasaAplicadaValor);
      montoCalculadoVes = this.round2(
        montoEquivalenteBase * (tasaAplicadaValor ?? 0),
      );
    } else if (divisa.codigo === 'EUR') {
      const tasaEurVes = await this.prisma.tasaCambio.findFirst({
        where: {
          divisaOrigen: { codigo: 'VES' },
          divisaDestino: { codigo: 'EUR' },
        },
        orderBy: {
          fechaVigencia: 'desc', // Reemplaza por el campo correspondiente (ej. fecha, timestamp, id)
        },
      });
      montoCalculadoVes = this.round2(
        montoEquivalenteBase * Number(tasaEurVes?.tasa ?? 0),
      );
    } else if (divisa.esMonedaBase) {
      const tasaUsdVes = await this.prisma.tasaCambio.findFirst({
        where: {
          divisaOrigen: { codigo: 'VES' },
          divisaDestino: { codigo: 'USD' },
          fuente: FuenteTasaCambio.BCV,
        },
        orderBy: {
          fechaVigencia: 'desc', // Reemplaza por el campo correspondiente (ej. fecha, timestamp, id)
        },
      });
      montoCalculadoVes = this.round2(
        montoEquivalenteBase * Number(tasaUsdVes?.tasa ?? 0),
      );
    }

    const tipoDePago = documentoId
      ? TipoDePago.COBRO_FACTURA
      : TipoDePago.ANTICIPO;

    if (data.numeroReferencia) {
      const existingTransaction = await this.prisma.transaccionPago.findFirst({
        where: {
          numeroReferencia: data.numeroReferencia,
          estado: { not: EstadoTransaccionPago.ANULADO },
        },
      });

      if (existingTransaction) {
        throw new Error(
          'Ya existe una transacción con este número de referencia',
        );
      }
    }

    const usuarioId = 1;

    const transaccion = await this.prisma.transaccionPago.create({
      data: {
        documentoId: documentoId || null,
        ordenId: ordenId || null,
        tipoDePago,
        metodoPagoId: data.metodoPagoId,
        divisaPagoId: data.divisaPagoId,
        montoOrigen: data.montoOrigen,
        tasaAplicadaId: data.tasaAplicadaId || null,
        tasaAplicadaValor: tasaAplicadaValor,
        montoEquivalenteBase: montoEquivalenteBase,
        montoCalculadoVes: montoCalculadoVes,
        numeroReferencia: data.numeroReferencia || null,
        estado: EstadoTransaccionPago.APROBADO,
        tipoOperacion: TipoOperacionPago.INGRESO,
        fechaPago: data.fechaPago ? new Date(data.fechaPago) : new Date(),
        cuentaDestinoId: data.cuentaDestinoId || null,
        usuarioId: usuarioId,
      },
      include: {
        metodoPago: true,
        divisa: true,
        documento: {
          include: {
            cliente: true,
          },
        },
        orden: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (documentoId) {
      await this.actualizarSaldoDocumento(
        documentoId,
        montoEquivalenteBase,
        'restar',
      );
    }

    if (ordenId && !documentoId) {
      const orden = await this.prisma.ordenDespacho.findUnique({
        where: { id: ordenId },
      });

      if (orden) {
        const nuevoTotalAbonado =
          Number(orden.totalAbonado || 0) + montoEquivalenteBase;
        const nuevoSaldo =
          Number(orden.montoFacturadoNeto || 0) - nuevoTotalAbonado;

        await this.prisma.ordenDespacho.update({
          where: { id: ordenId },
          data: {
            totalAbonado: Math.max(
              0,
              Math.round(nuevoTotalAbonado * 100) / 100,
            ),
            saldoNetoCobrar: Math.max(0, Math.round(nuevoSaldo * 100) / 100),
          },
        });
      }
    }

    const nombreCliente = transaccion.documento
      ? transaccion.documento.cliente?.nombre
      : transaccion.orden
        ? transaccion.orden.cliente?.nombre
        : '-';
    return {
      id: transaccion.id,
      fecha: transaccion.fechaPago
        ? transaccion.fechaPago.toISOString()
        : new Date().toISOString(),
      cliente: nombreCliente,
      tipo: transaccion.tipoDePago,
      metodo: transaccion.metodoPago.descripcion,
      referencia: transaccion.numeroReferencia,
      estado: transaccion.estado ?? 'APROBADO',
      montoOrigen: this.round2(transaccion.montoOrigen),
      divisaSimbolo: transaccion.divisa.codigo,
      montoEquivalenteBase: this.round2(transaccion.montoEquivalenteBase),
      montoCalculadoVes: transaccion.montoCalculadoVes
        ? this.round2(transaccion.montoCalculadoVes)
        : null,
    };
  }

  async findOneTransaccionPago(
    id: number,
  ): Promise<TransaccionPagoDetailResponse> {
    const transaccion = await this.prisma.transaccionPago.findUnique({
      where: { id },
      include: {
        metodoPago: true,
        divisa: true,
        usuario: true,
        documento: {
          include: {
            cliente: true,
            orden: true,
          },
        },
        tasaAplicada: {
          include: {
            divisaOrigen: true,
            divisaDestino: true,
          },
        },
        cuentaDestino: {
          include: {
            divisa: true,
          },
        },
      },
    });

    if (!transaccion) {
      throw new Error('Transacción de pago no encontrada');
    }

    let ordenData: {
      id: number;
      numeroOrden: string;
      estado: string | null;
      cliente: { id: number; nombre: string };
    } | null = null;

    if (transaccion.ordenId) {
      const orden = await this.prisma.ordenDespacho.findUnique({
        where: { id: transaccion.ordenId },
        include: { cliente: true },
      });
      if (orden) {
        ordenData = {
          id: orden.id,
          numeroOrden: orden.numeroOrden,
          estado: orden.estado ?? null,
          cliente: { id: orden.cliente.id, nombre: orden.cliente.nombre },
        };
      }
    }

    return {
      id: transaccion.id,
      fecha: transaccion.fechaPago
        ? transaccion.fechaPago.toISOString()
        : new Date().toISOString(),
      tipoDePago: transaccion.tipoDePago,
      estado: transaccion.estado ?? 'APROBADO',
      tipoOperacion: transaccion.tipoOperacion ?? 'INGRESO',
      montoOrigen: this.round2(transaccion.montoOrigen),
      montoEquivalenteBase: this.round2(transaccion.montoEquivalenteBase),
      montoCalculadoVes: transaccion.montoCalculadoVes
        ? this.round2(transaccion.montoCalculadoVes)
        : null,
      tasaAplicadaValor: transaccion.tasaAplicadaValor
        ? Number(transaccion.tasaAplicadaValor)
        : null,
      numeroReferencia: transaccion.numeroReferencia,
      motivoAnulacion: transaccion.motivoAnulacion,
      metodoPago: {
        id: transaccion.metodoPago.id,
        codigo: transaccion.metodoPago.codigo,
        descripcion: transaccion.metodoPago.descripcion,
      },
      divisa: {
        id: transaccion.divisa.id,
        codigo: transaccion.divisa.codigo,
        nombre: transaccion.divisa.nombre,
      },
      usuario: {
        id: transaccion.usuario.id,
        nombreUsuario: transaccion.usuario.nombreUsuario,
      },
      documento: transaccion.documento
        ? {
            id: transaccion.documento.id,
            sistemaOrigen: transaccion.documento.sistemaOrigen,
            estado: transaccion.documento.estado,
            montoTotalBase: this.round2(transaccion.documento.montoTotalBase),
            saldoPendienteBase: this.round2(
              transaccion.documento.saldoPendienteBase,
            ),
            cliente: {
              id: transaccion.documento.cliente.id,
              nombre: transaccion.documento.cliente.nombre,
            },
            orden: {
              id: transaccion.documento.orden.id,
              numeroOrden: transaccion.documento.orden.numeroOrden,
            },
          }
        : null,
      orden: ordenData,
      tasaAplicada: transaccion.tasaAplicada
        ? {
            id: transaccion.tasaAplicada.id,
            tasa: Number(transaccion.tasaAplicada.tasa),
            divisaOrigen: {
              codigo: transaccion.tasaAplicada.divisaOrigen.codigo,
            },
            divisaDestino: {
              codigo: transaccion.tasaAplicada.divisaDestino.codigo,
            },
          }
        : null,
      cuentaDestino: transaccion.cuentaDestino
        ? {
            id: transaccion.cuentaDestino.id,
            nombre: transaccion.cuentaDestino.nombre,
            tipo: transaccion.cuentaDestino.tipo,
            divisa: {
              codigo: transaccion.cuentaDestino.divisa.codigo,
            },
          }
        : null,
    };
  }

  async anularTransaccionPago(
    id: number,
    motivo: string,
  ): Promise<TransaccionPagoResponse> {
    const transaccion = await this.prisma.transaccionPago.findUnique({
      where: { id },
      include: {
        metodoPago: true,
        divisa: true,
        documento: {
          include: { cliente: true },
        },
        orden: {
          include: { cliente: true },
        },
      },
    });

    if (!transaccion) {
      throw new Error('Transacción de pago no encontrada');
    }

    if (transaccion.estado === EstadoTransaccionPago.ANULADO) {
      throw new Error('La transacción ya se encuentra anulada');
    }

    const montoEquivalente = Number(transaccion.montoEquivalenteBase);

    if (
      transaccion?.documentoId &&
      transaccion.tipoDePago === TipoDePago.COBRO_FACTURA
    ) {
      await this.actualizarSaldoDocumento(
        transaccion.documentoId,
        montoEquivalente,
        'sumar',
      );
    }

    if (transaccion.ordenId && transaccion.tipoDePago === TipoDePago.ANTICIPO) {
      const orden = await this.prisma.ordenDespacho.findUnique({
        where: { id: transaccion.ordenId },
      });

      if (orden) {
        const nuevoTotalAbonado = Math.max(
          0,
          Number(orden.totalAbonado || 0) - montoEquivalente,
        );
        const nuevoSaldo =
          Number(orden.montoFacturadoNeto || 0) - nuevoTotalAbonado;

        await this.prisma.ordenDespacho.update({
          where: { id: transaccion.ordenId },
          data: {
            totalAbonado: Math.round(nuevoTotalAbonado * 100) / 100,
            saldoNetoCobrar: Math.max(0, Math.round(nuevoSaldo * 100) / 100),
          },
        });

        const documentoDeuda = await this.prisma.documentoDeuda.findFirst({
          where: { ordenId: transaccion.ordenId },
        });

        if (documentoDeuda) {
          await this.actualizarSaldoDocumento(
            documentoDeuda.id,
            montoEquivalente,
            'sumar',
          );
        }
      }
    }

    const transaccionActualizada = await this.prisma.transaccionPago.update({
      where: { id },
      data: {
        estado: EstadoTransaccionPago.ANULADO,
        motivoAnulacion: motivo,
      },
      include: {
        metodoPago: true,
        divisa: true,
        documento: {
          include: { cliente: true },
        },
        orden: {
          include: { cliente: true },
        },
      },
    });

    const nombreClienteActualizado = transaccionActualizada.documento
      ? transaccionActualizada.documento.cliente?.nombre
      : transaccionActualizada.orden
        ? transaccionActualizada.orden.cliente?.nombre
        : '—';

    return {
      id: transaccionActualizada.id,
      fecha: transaccionActualizada.fechaPago
        ? transaccionActualizada.fechaPago.toISOString()
        : new Date().toISOString(),
      cliente: nombreClienteActualizado,
      tipo: transaccionActualizada.tipoDePago,
      metodo: transaccionActualizada.metodoPago.descripcion,
      referencia: transaccionActualizada.numeroReferencia,
      estado: transaccionActualizada.estado ?? 'ANULADO',
      montoOrigen: this.round2(transaccionActualizada.montoOrigen),
      divisaSimbolo: transaccionActualizada.divisa.codigo,
      montoEquivalenteBase: this.round2(
        transaccionActualizada.montoEquivalenteBase,
      ),
      montoCalculadoVes: transaccionActualizada.montoCalculadoVes
        ? this.round2(transaccionActualizada.montoCalculadoVes)
        : null,
    };
  }
}
