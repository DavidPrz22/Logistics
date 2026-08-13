import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateOrdenODT,
  UpdateOrdenODT,
  DetalleOrdenDespachoODT,
  LiquidacionDespachoODT,
} from './ODTs/despacho.odts';
import {
  EstadoOrdenDespacho,
  EstadoDocumentoDeuda,
  TipoDocumentoDeuda,
  TipoDePago,
  EstadoTransaccionPago,
  ListadoOrigen,
  TipoDeOrden,
} from 'prisma/generated/prisma/enums';
import type {
  LoteSearchResult,
  ListOrdenDespacho,
  OrdenDespachoDetail,
} from './types/despacho.types';

@Injectable()
export class DespachoService {
  constructor(private readonly prisma: PrismaService) {}

  async searchLotes(query?: string): Promise<LoteSearchResult[]> {
    const whereClause = {
      stockActual: { gt: 0 },
      AND: query
        ? [
            {
              OR: [
                { variante: { sku: { contains: query } } },
                { variante: { nombre: { contains: query } } },
                { variante: { producto: { nombre: { contains: query } } } },
                { numeroLote: { contains: query } },
              ],
            },
          ]
        : undefined,
    };

    const lotes = await this.prisma.lote.findMany({
      where: whereClause,
      include: {
        variante: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        variante: {
          sku: 'asc',
        },
      },
    });

    return lotes.map((lote) => ({
      id: lote.id,
      varianteId: lote.varianteId,
      numeroLote: lote.numeroLote,
      stockActual: lote.stockActual,
      fechaVencimiento: lote.fechaVencimiento,
      sku: lote.variante.sku,
      varianteNombre: lote.variante.nombre,
      productoNombre: lote.variante.producto.nombre,
      precioBase: Number(lote.variante.precioBase),
    }));
  }

  async createOrdenDespacho(
    ordenData: CreateOrdenODT,
  ): Promise<{ message: string }> {
    const { detallesOrdenDespacho, totalFacturado, tasaCambioId, ...ordenFields } = ordenData;

    const numeroOrden = `OD-${Date.now()}`;

    const tasaCambio = await this.prisma.tasaCambio.findUnique({
      where: { id: tasaCambioId },
      include: {
        divisaOrigen: true,
        divisaDestino: true,
      },
    });

    if (!tasaCambio) {
      throw new Error('Tasa de cambio no encontrada');
    }

    const tasaValor = Number(tasaCambio.tasa);

    const detallesConVes = detallesOrdenDespacho?.map((detalle) => {
      const precioUnitarioVes = Math.round(detalle.precioUnitario * tasaValor * 100) / 100;
      const subtotalVes = Math.round(detalle.cantidadEnviada * precioUnitarioVes * 100) / 100;
      return {
        loteId: detalle.loteId,
        cantidadEnviada: detalle.cantidadEnviada,
        precioUnitario: detalle.precioUnitario,
        precioUnitarioVes,
        subtotalVes,
      };
    }) ?? [];

    const totalOriginalVes = detallesConVes.reduce((sum, d) => sum + d.subtotalVes, 0);

    try {
      await this.prisma.ordenDespacho.create({
        data: {
          ...ordenFields,
          tasaCambioId,
          tasaCambioValor: tasaValor,
          totalOriginal: totalFacturado,
          totalOriginalVes,
          saldoNetoCobrar: totalFacturado,
          montoFacturadoNeto: totalFacturado,
          montoFacturadoNetoVes: totalOriginalVes,
          numeroOrden,
          detalles: {
            create: detallesConVes,
          },
        },
      });

      return { message: 'Orden de despacho creada exitosamente' };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al crear la orden de despacho: ${message}`);
    }
  }

  async updateDetallesOrdenDespacho(
    ordenId: number,
    detallesOrdenDespacho: DetalleOrdenDespachoODT[],
    totalFacturado: number,
  ): Promise<{ message: string }> {
    try {
      const orden = await this.prisma.ordenDespacho.findUnique({
        where: { id: ordenId },
        select: { tasaCambioValor: true },
      });

      if (!orden || !orden.tasaCambioValor) {
        throw new Error('Orden no encontrada o sin tasa de cambio configurada');
      }

      const tasaValor = Number(orden.tasaCambioValor);

      const existingDetalles = await this.prisma.detalleOrden.findMany({
        where: { ordenId },
        select: { id: true },
      });

      const existingIds = new Set(existingDetalles.map((d) => d.id));
      const incomingIds = new Set<number>();

      const updateOperations: {
        where: { id: number };
        data: {
          loteId: number;
          cantidadEnviada: number;
          precioUnitario: number;
          precioUnitarioVes: number;
          subtotalVes: number;
        };
      }[] = [];
      const createOperations: {
        loteId: number;
        cantidadEnviada: number;
        precioUnitario: number;
        precioUnitarioVes: number;
        subtotalVes: number;
      }[] = [];

      for (const detalle of detallesOrdenDespacho ?? []) {
        const precioUnitarioVes = Math.round(detalle.precioUnitario * tasaValor * 100) / 100;
        const subtotalVes = Math.round(detalle.cantidadEnviada * precioUnitarioVes * 100) / 100;

        if (detalle.id) {
          incomingIds.add(detalle.id);
          updateOperations.push({
            where: { id: detalle.id },
            data: {
              loteId: detalle.loteId,
              cantidadEnviada: detalle.cantidadEnviada,
              precioUnitario: detalle.precioUnitario,
              precioUnitarioVes,
              subtotalVes,
            },
          });
        } else {
          createOperations.push({
            loteId: detalle.loteId,
            cantidadEnviada: detalle.cantidadEnviada,
            precioUnitario: detalle.precioUnitario,
            precioUnitarioVes,
            subtotalVes,
          });
        }
      }

      const deleteIds = [...existingIds].filter((id) => !incomingIds.has(id));

      const totalOriginalVes = createOperations.reduce((sum, d) => sum + d.subtotalVes, 0) +
        updateOperations.reduce((sum, op) => sum + op.data.subtotalVes, 0);

      await this.prisma.ordenDespacho.update({
        where: { id: ordenId },
        data: {
          detalles: {
            update: updateOperations,
            create: createOperations,
            deleteMany:
              deleteIds.length > 0 ? [{ id: { in: deleteIds } }] : undefined,
          },
          totalOriginal: totalFacturado,
          totalOriginalVes,
          saldoNetoCobrar: totalFacturado,
          montoFacturadoNeto: totalFacturado,
          montoFacturadoNetoVes: totalOriginalVes,
        },
      });

      return {
        message: 'Detalles de orden de despacho actualizados exitosamente',
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(
        'Error al actualizar los detalles de la orden: ' + message,
      );
    }
  }

  async updateOrdenDespacho(
    id: number,
    data: UpdateOrdenODT,
  ): Promise<{ message: string }> {
    const { detallesOrdenDespacho, totalFacturado, tasaCambioId, ...ordenFields } = data;

    try {
      let tasaValor: number | null = null;

      if (tasaCambioId) {
        const tasaCambio = await this.prisma.tasaCambio.findUnique({
          where: { id: tasaCambioId },
        });

        if (!tasaCambio) {
          throw new Error('Tasa de cambio no encontrada');
        }

        tasaValor = Number(tasaCambio.tasa);
      }

      const existingDetalles = await this.prisma.detalleOrden.findMany({
        where: { ordenId: id },
        select: { id: true },
      });

      const existingIds = new Set(existingDetalles.map((d) => d.id));
      const incomingIds = new Set<number>();

      const updateOperations: {
        where: { id: number };
        data: {
          loteId: number;
          cantidadEnviada: number;
          precioUnitario: number;
          precioUnitarioVes?: number;
          subtotalVes?: number;
        };
      }[] = [];
      const createOperations: {
        loteId: number;
        cantidadEnviada: number;
        precioUnitario: number;
        precioUnitarioVes?: number;
        subtotalVes?: number;
      }[] = [];

      for (const detalle of detallesOrdenDespacho ?? []) {
        const detalleData: {
          loteId: number;
          cantidadEnviada: number;
          precioUnitario: number;
          precioUnitarioVes?: number;
          subtotalVes?: number;
        } = {
          loteId: detalle.loteId,
          cantidadEnviada: detalle.cantidadEnviada,
          precioUnitario: detalle.precioUnitario,
        };

        if (tasaValor !== null) {
          detalleData.precioUnitarioVes = Math.round(detalle.precioUnitario * tasaValor * 100) / 100;
          detalleData.subtotalVes = Math.round(detalle.cantidadEnviada * detalleData.precioUnitarioVes * 100) / 100;
        }

        if (detalle.id) {
          incomingIds.add(detalle.id);
          updateOperations.push({
            where: { id: detalle.id },
            data: detalleData,
          });
        } else {
          createOperations.push(detalleData);
        }
      }

      const deleteIds = [...existingIds].filter((id) => !incomingIds.has(id));

      const financialFields = totalFacturado
        ? {
            totalOriginal: totalFacturado,
            saldoNetoCobrar: totalFacturado,
            montoFacturadoNeto: totalFacturado,
          }
        : {};

      let vesFinancialFields = {};
      if (tasaValor !== null) {
        const totalOriginalVes = createOperations.reduce((sum, d) => sum + (d.subtotalVes ?? 0), 0) +
          updateOperations.reduce((sum, op) => sum + (op.data.subtotalVes ?? 0), 0);
        vesFinancialFields = {
          totalOriginalVes,
          montoFacturadoNetoVes: totalOriginalVes,
        };
      }

      const tasaFields = tasaCambioId
        ? {
            tasaCambioId,
            tasaCambioValor: tasaValor,
          }
        : {};

      await this.prisma.ordenDespacho.update({
        where: { id },
        data: {
          ...ordenFields,
          ...tasaFields,
          ...financialFields,
          ...vesFinancialFields,
          detalles: {
            update: updateOperations,
            create: createOperations,
            deleteMany:
              deleteIds.length > 0 ? [{ id: { in: deleteIds } }] : undefined,
          },
        },
      });

      return { message: 'Orden de despacho actualizada exitosamente' };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al actualizar la orden de despacho: ${message}`);
    }
  }

  async getAllDespachos(): Promise<ListOrdenDespacho[]> {
    const ordenes = await this.prisma.ordenDespacho.findMany({
      include: {
        cliente: true,
        chofer: true,
      },
      orderBy: {
        fechaSalida: 'desc',
      },
    });

    const ordenesLista = ordenes.map((orden) => ({
      id: orden.id,
      numeroOrden: orden.numeroOrden,
      clienteNombre: orden.cliente.nombre,
      choferNombre: orden.chofer?.nombre || '',
      FechaSalida: orden.fechaSalida?.toISOString() || '',
      estado: orden.estado || 'PREPARACION',
      tipoOrden: orden.tipoOrden,
      totalOriginal: Number(orden.totalOriginal ?? 0),
      saldoNetoCobrar: Number(orden.saldoNetoCobrar ?? 0),
    }));

    return ordenesLista;
  }

  async findOneOrdenDespacho(id: number): Promise<OrdenDespachoDetail> {
    const orden = await this.prisma.ordenDespacho.findUnique({
      where: { id },
      include: {
        cliente: true,
        chofer: true,
        almacenTransito: true,
        documentoDeuda: true,
        tasaCambio: {
          include: {
            divisaOrigen: true,
            divisaDestino: true,
          },
        },
        detalles: {
          include: {
            lote: {
              include: {
                variante: {
                  include: {
                    producto: true,
                  },
                },
              },
            },
            rechazos: {
              include: {
                motivoRechazo: true,
                almacenReingreso: true,
              },
            },
          },
        },
      },
    });

    if (!orden) {
      throw new Error('Orden de despacho no encontrada');
    }

    const anticipos = await this.prisma.transaccionPago.findMany({
      where: {
        ordenId: id,
        tipoDePago: 'ANTICIPO',
        estado: 'APROBADO',
      },
      include: {
        metodoPago: true,
      },
    });

    const anticiposData = anticipos.map((anticipo) => ({
      id: anticipo.id,
      montoEquivalenteBase: Number(anticipo.montoEquivalenteBase),
      fechaPago: anticipo.fechaPago?.toISOString() ?? '',
      metodoPagoDescripcion: anticipo.metodoPago?.descripcion ?? '',
      numeroReferencia: anticipo.numeroReferencia ?? null,
    }));

    const documentoDeudaData = orden.documentoDeuda
      ? {
          id: orden.documentoDeuda.id,
          estado: orden.documentoDeuda.estado ?? EstadoDocumentoDeuda.PENDIENTE,
          tipoDocumento:
            orden.documentoDeuda.tipoDocumento ?? TipoDocumentoDeuda.FACTURA,
        }
      : null;

    const tasaCambioInfo = orden.tasaCambio
      ? {
          origen: orden.tasaCambio.divisaOrigen.codigo,
          destino: orden.tasaCambio.divisaDestino.codigo,
          tasa: Number(orden.tasaCambio.tasa),
          fecha: orden.tasaCambio.fechaVigencia?.toISOString() ?? '',
        }
      : null;

    return {
      id: orden.id,
      numeroOrden: orden.numeroOrden,
      clienteId: orden.clienteId,
      clienteNombre: orden.cliente.nombre,
      choferId: orden.choferId,
      choferNombre: orden.chofer?.nombre ?? null,
      almacenTransitoId: orden.almacenTransitoId,
      almacenTransitoNombre: orden.almacenTransito.nombre,
      fechaSalida: orden.fechaSalida?.toISOString() ?? '',
      estado: orden.estado ?? 'PREPARACION',
      tasaCambioId: orden.tasaCambioId,
      tasaCambioValor: orden.tasaCambioValor ? Number(orden.tasaCambioValor) : null,
      tasaCambioInfo,
      totalOriginal: Number(orden.totalOriginal ?? 0),
      totalOriginalVes: Number(orden.totalOriginalVes ?? 0),
      tipoOrden: orden.tipoOrden ?? 'NORMAL',
      totalAbonado: Number(orden.totalAbonado ?? 0),
      saldoNetoCobrar: Number(orden.saldoNetoCobrar ?? 0),
      montoFacturadoNeto: Number(orden.montoFacturadoNeto ?? 0),
      montoFacturadoNetoVes: Number(orden.montoFacturadoNetoVes ?? 0),
      totalRechazado: Number(orden.totalRechazado ?? 0),
      anticipos: anticiposData,
      documentoDeuda: documentoDeudaData,
      detalles: orden.detalles.map((detalle) => ({
        id: detalle.id,
        ordenId: detalle.ordenId,
        loteId: detalle.loteId,
        stockActualLote: detalle.lote.stockActual,
        numeroLote: detalle.lote.numeroLote,
        cantidadEnviada: detalle.cantidadEnviada,
        precioUnitario: Number(detalle.precioUnitario),
        precioUnitarioVes: detalle.precioUnitarioVes ? Number(detalle.precioUnitarioVes) : null,
        subtotalVes: detalle.subtotalVes ? Number(detalle.subtotalVes) : null,
        sku: detalle.lote.variante.sku,
        varianteNombre: detalle.lote.variante.nombre,
        productoNombre: detalle.lote.variante.producto.nombre,
        rechazos: detalle.rechazos.map((rechazo) => ({
          id: rechazo.id,
          detalleOrdenId: rechazo.detalleOrdenId,
          cantidadRechazada: rechazo.cantidadRechazada,
          motivoRechazoId: rechazo.motivoRechazoId,
          motivoRechazoCodigo: rechazo.motivoRechazo.codigo,
          motivoRechazoDescripcion: rechazo.motivoRechazo.descripcion,
          almacenReingresoId: rechazo.almacenReingresoId,
          almacenReingresoNombre: rechazo.almacenReingreso.nombre,
          usuarioId: rechazo.usuarioId,
          fechaRechazo: rechazo.fechaRechazo?.toISOString() ?? '',
          observaciones: rechazo.observaciones,
        })),
      })),
    };
  }

  async updateOrdenEstado(id: number): Promise<{ message: string }> {
    const orden = await this.prisma.ordenDespacho.findUnique({
      where: { id },
      include: {
        detalles: true,
      },
    });

    if (!orden) {
      throw new Error('Orden de despacho no encontrada');
    }

    if (orden.estado === EstadoOrdenDespacho.PREPARACION) {
      if (orden.tipoOrden === TipoDeOrden.VENTA_MOSTRADOR) {
        throw new Error(
          'Las órdenes de Venta en Mostrador no pueden despacharse a EN_RUTA. Deben liquidarse directamente desde PREPARACIÓN.',
        );
      }

      if (orden.detalles.length === 0) {
        throw new Error('La orden no tiene detalles para despachar');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.movimientoInventario.createMany({
          data: orden.detalles.map((detalle) => ({
            tipoMovimiento: 'SALIDA',
            cantidad: detalle.cantidadEnviada,
            loteId: detalle.loteId,
            detalleOrdenId: detalle.id,
            referencia: orden.numeroOrden,
            almacenId: orden.almacenTransitoId,
            usuarioId: 1,
          })),
        });

        const loteUpdates = orden.detalles.map((detalle) =>
          tx.lote.update({
            where: { id: detalle.loteId },
            data: { stockActual: { decrement: detalle.cantidadEnviada } },
          }),
        );

        await Promise.all(loteUpdates);

        await tx.ordenDespacho.update({
          where: { id },
          data: { estado: EstadoOrdenDespacho.EN_RUTA },
        });
      });

      return { message: 'Orden de despacho actualizada exitosamente' };
    }

    throw new Error(`Transición de estado no soportada: ${orden.estado}`);
  }

  async updateOrdenDespachoLiquidar(id: number, data: LiquidacionDespachoODT) {
    return this.prisma.$transaction(async (tx) => {
      const orden = await tx.ordenDespacho.findUnique({
        where: { id },
        include: {
          detalles: true,
          cliente: true,
        },
      });
      if (!orden) {
        throw new Error('Orden de despacho no encontrada');
      }
      if (orden.estado === EstadoOrdenDespacho.LIQUIDADA) {
        throw new Error('La orden ya está liquidada');
      }
      if (!orden.detalles || orden.detalles.length === 0) {
        throw new Error('La orden no tiene detalles para liquidar');
      }
      let totalRechazado = 0;
      for (const detalle of data.detallesLiquidacion) {
        const detalleOrden = orden.detalles.find(
          (el) => el.id === detalle.detalleId,
        );
        if (!detalleOrden) {
          throw new Error('Detalle de orden de despacho no encontrado');
        }
        detalle.rechazos.forEach((re) => {
          if (re.cantidadRechazada) {
            totalRechazado +=
              Number(detalleOrden.precioUnitario) * re.cantidadRechazada;
          }
        });
        for (const rechazo of detalle.rechazos) {
          const nuevoRechazo = await tx.detalleRechazoOrden.create({
            data: {
              detalleOrdenId: detalle.detalleId,
              cantidadRechazada: rechazo.cantidadRechazada,
              motivoRechazoId: rechazo.motivoRechazoId,
              almacenReingresoId: rechazo.almacenReingresoId,
              usuarioId: 1,
              observaciones: rechazo.observaciones,
            },
          });
          if (rechazo.cantidadRechazada > 0) {
            await tx.movimientoInventario.create({
              data: {
                tipoMovimiento: 'ENTRADA',
                cantidad: rechazo.cantidadRechazada,
                loteId: detalleOrden.loteId,
                detalleOrdenId: detalle.detalleId,
                detalleRechazoId: nuevoRechazo.id,
                referencia: orden.numeroOrden,
                almacenId: rechazo.almacenReingresoId,
                usuarioId: 1,
              },
            });
            await tx.lote.update({
              where: { id: detalleOrden.loteId },
              data: { stockActual: { increment: rechazo.cantidadRechazada } },
            });
          }
        }
      }

      const anticipos = await tx.transaccionPago.findMany({
        where: {
          ordenId: id,
          tipoDePago: TipoDePago.ANTICIPO,
          estado: EstadoTransaccionPago.APROBADO,
        },
      });

      const totalAnticipado = anticipos.reduce(
        (sum, t) => sum + Number(t.montoEquivalenteBase),
        0,
      );

      const montoFacturadoNeto = Number(orden.totalOriginal) - totalRechazado;
      const saldoPendienteBase = montoFacturadoNeto - totalAnticipado;

      let estadoDocumento: EstadoDocumentoDeuda;
      if (saldoPendienteBase <= 0) {
        estadoDocumento = EstadoDocumentoDeuda.PAGADO_TOTAL;
      } else if (totalAnticipado > 0) {
        estadoDocumento = EstadoDocumentoDeuda.PAGADO_PARCIAL;
      } else {
        estadoDocumento = EstadoDocumentoDeuda.PENDIENTE;
      }

      const divisaBase = await tx.divisa.findFirst({
        where: { esMonedaBase: true },
      });
      if (!divisaBase) {
        throw new Error('No se encontró moneda base configurada');
      }

      const documentoDeuda = await tx.documentoDeuda.create({
        data: {
          sistemaOrigen:
            orden.tipoOrden === TipoDeOrden.VENTA_MOSTRADOR
              ? ListadoOrigen.VENTA_MOSTRADOR
              : ListadoOrigen.RUTA_LIQUIDADA,
          ordenId: id,
          clienteId: orden.clienteId,
          montoTotalBase: montoFacturadoNeto,
          saldoPendienteBase: saldoPendienteBase,
          estado: estadoDocumento,
          tipoDocumento: TipoDocumentoDeuda.FACTURA,
        },
      });

      if (anticipos.length > 0) {
        await tx.transaccionPago.updateMany({
          where: {
            id: { in: anticipos.map((a) => a.id) },
          },
          data: {
            documentoId: documentoDeuda.id,
          },
        });
      }

      return tx.ordenDespacho.update({
        where: { id },
        data: {
          estado: EstadoOrdenDespacho.LIQUIDADA,
          montoFacturadoNeto: montoFacturadoNeto,
          saldoNetoCobrar: saldoPendienteBase,
          totalRechazado: totalRechazado,
          totalAbonado: totalAnticipado,
        },
      });
    });
  }
}
