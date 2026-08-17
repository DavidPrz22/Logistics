import { Injectable } from '@nestjs/common';
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
} from 'prisma/generated/prisma/enums';

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

  async createTransaccionPago(
    data: CrearTransaccionPagoODT,
  ): Promise<TransaccionPagoResponse> {
    const { documentoId, ordenId, tasaAplicadaId, divisaPagoId, montoOrigen } =
      data;

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
    let montoEquivalenteBase: number;
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

      if (tasa.divisaOrigenId !== divisaPagoId && !divisa.esMonedaBase) {
        throw new Error(
          'La tasa de cambio no corresponde a la divisa de pago seleccionada',
        );
      }

      tasaAplicadaValor = Number(tasa.tasa);
    }

    if (divisa.esMonedaBase) {
      montoEquivalenteBase = montoOrigen;
    } else {
      if (!tasaAplicadaValor) {
        throw new Error(
          'Debe seleccionar una tasa de cambio para divisas no base',
        );
      }
      if (divisa.codigo === 'EUR') {
        montoEquivalenteBase =
          Math.round(montoOrigen * tasaAplicadaValor * 100) / 100;
      } else {
        montoEquivalenteBase =
          Math.round((montoOrigen / tasaAplicadaValor) * 100) / 100;
      }
    }

    if (divisa.codigo === 'VES') {
      if (tasaAplicadaId && tasaAplicadaValor) {
        montoCalculadoVes = Math.round(montoOrigen * 100) / 100;
      }
    } else if (ordenId && !tasaAplicadaId) {
      const orden = await this.prisma.ordenDespacho.findUnique({
        where: { id: ordenId },
        include: {
          tasaCambio: {
            include: {
              divisaOrigen: true,
              divisaDestino: true,
            },
          },
        },
      });

      if (
        orden?.tasaCambio &&
        !orden.tasaCambio.divisaOrigen.esMonedaBase &&
        orden.tasaCambio.divisaDestino.codigo === 'VES'
      ) {
        const tasaOrdenValor = Number(orden.tasaCambio.tasa);
        montoCalculadoVes =
          Math.round(montoOrigen * tasaOrdenValor * 100) / 100;
      }
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
      },
    });

    if (documentoId) {
      const documento = await this.prisma.documentoDeuda.findUnique({
        where: { id: documentoId },
      });

      if (documento) {
        const nuevoSaldo =
          Number(documento.saldoPendienteBase) - montoEquivalenteBase;
        const saldoRedondeado = Math.max(0, Math.round(nuevoSaldo * 100) / 100);

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
            estado: nuevoEstado,
          },
        });
      }
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
            totalAbonado: Math.round(nuevoTotalAbonado * 100) / 100,
            saldoNetoCobrar: Math.max(0, Math.round(nuevoSaldo * 100) / 100),
          },
        });
      }
    }

    return {
      id: transaccion.id,
      fecha: transaccion.fechaPago
        ? transaccion.fechaPago.toISOString()
        : new Date().toISOString(),
      cliente: transaccion.documento?.cliente?.nombre || '—',
      tipo: transaccion.tipoDePago,
      metodo: transaccion.metodoPago.descripcion,
      referencia: transaccion.numeroReferencia,
      estado: transaccion.estado ?? 'APROBADO',
      montoOrigen: Number(transaccion.montoOrigen),
      divisaSimbolo: transaccion.divisa.codigo,
      montoEquivalenteBase: Number(transaccion.montoEquivalenteBase),
      montoCalculadoVes: transaccion.montoCalculadoVes
        ? Number(transaccion.montoCalculadoVes)
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
      montoOrigen: Number(transaccion.montoOrigen),
      montoEquivalenteBase: Number(transaccion.montoEquivalenteBase),
      montoCalculadoVes: transaccion.montoCalculadoVes
        ? Number(transaccion.montoCalculadoVes)
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
            montoTotalBase: Number(transaccion.documento.montoTotalBase),
            saldoPendienteBase: Number(
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
      },
    });

    if (!transaccion) {
      throw new Error('Transacción de pago no encontrada');
    }

    if (transaccion.estado === EstadoTransaccionPago.ANULADO) {
      throw new Error('La transacción ya se encuentra anulada');
    }

    const montoEquivalente = Number(transaccion.montoEquivalenteBase);

    if (transaccion.documentoId) {
      const documento = await this.prisma.documentoDeuda.findUnique({
        where: { id: transaccion.documentoId },
      });

      if (documento) {
        const nuevoSaldo =
          Number(documento.saldoPendienteBase) + montoEquivalente;
        
        const nuevoSaldoVES =
          Number(documento.saldoPendienteVes) + (montoEquivalente * Number(documento.tasaEmisionValor));
        const saldoRedondeadoVES = Math.round(nuevoSaldoVES * 100) / 100; 
        const saldoRedondeado = Math.round(nuevoSaldo * 100) / 100;

        let nuevoEstado: EstadoDocumentoDeuda = EstadoDocumentoDeuda.PENDIENTE;
        if (
          saldoRedondeado >= Number(documento.montoTotalBase) &&
          Number(documento.montoTotalBase) > 0
        ) {
          nuevoEstado = EstadoDocumentoDeuda.PENDIENTE;
        } else if (saldoRedondeado > 0) {
          nuevoEstado = EstadoDocumentoDeuda.PAGADO_PARCIAL;
        }

        await this.prisma.documentoDeuda.update({
          where: { id: transaccion.documentoId },
          data: {
            saldoPendienteBase: saldoRedondeado,
            saldoRedondeadoVES: saldoRedondeadoVES,
            estado: nuevoEstado,
          },
        });
      }
    }

    if (transaccion.ordenId && !transaccion.documentoId) {
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
      },
    });

    return {
      id: transaccionActualizada.id,
      fecha: transaccionActualizada.fechaPago
        ? transaccionActualizada.fechaPago.toISOString()
        : new Date().toISOString(),
      cliente: transaccionActualizada.documento?.cliente?.nombre || '—',
      tipo: transaccionActualizada.tipoDePago,
      metodo: transaccionActualizada.metodoPago.descripcion,
      referencia: transaccionActualizada.numeroReferencia,
      estado: transaccionActualizada.estado ?? 'ANULADO',
      montoOrigen: Number(transaccionActualizada.montoOrigen),
      divisaSimbolo: transaccionActualizada.divisa.codigo,
      montoEquivalenteBase: Number(transaccionActualizada.montoEquivalenteBase),
      montoCalculadoVes: transaccionActualizada.montoCalculadoVes
        ? Number(transaccionActualizada.montoCalculadoVes)
        : null,
    };
  }
}
