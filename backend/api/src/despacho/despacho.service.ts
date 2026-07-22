import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrdenODT, UpdateOrdenODT, DetalleOrdenDespachoODT } from './ODTs/despacho.odts';

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
    const { detallesOrdenDespacho, ...ordenFields } = ordenData;

    const numeroOrden = `OD-${Date.now()}`;

    try {
      await this.prisma.ordenDespacho.create({
        data: {
          ...ordenFields,
          numeroOrden,
          detalles: {
            create:
              detallesOrdenDespacho?.map((detalle) => ({
                loteId: detalle.loteId,
                cantidadEnviada: detalle.cantidadEnviada,
                precioUnitario: detalle.precioUnitario,
              })) ?? [],
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
  ): Promise<{ message: string }> {
    try {
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
        };
      }[] = [];
      const createOperations: {
        loteId: number;
        cantidadEnviada: number;
        precioUnitario: number;
      }[] = [];

      for (const detalle of detallesOrdenDespacho ?? []) {
        if (detalle.id) {
          incomingIds.add(detalle.id);
          updateOperations.push({
            where: { id: detalle.id },
            data: {
              loteId: detalle.loteId,
              cantidadEnviada: detalle.cantidadEnviada,
              precioUnitario: detalle.precioUnitario,
            },
          });
        } else {
          createOperations.push({
            loteId: detalle.loteId,
            cantidadEnviada: detalle.cantidadEnviada,
            precioUnitario: detalle.precioUnitario,
          });
        }
      }

      const deleteIds = [...existingIds].filter((id) => !incomingIds.has(id));

      await this.prisma.ordenDespacho.update({
        where: { id: ordenId },
        data: {
          detalles: {
            update: updateOperations,
            create: createOperations,
            deleteMany:
              deleteIds.length > 0 ? [{ id: { in: deleteIds } }] : undefined,
          },
        },
      });

      return { message: 'Detalles de orden de despacho actualizados exitosamente' };
    
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new Error('Error al actualizar los detalles de la orden: ' + message);
    }
  }

  async updateOrdenDespacho(
    id: number,
    data: UpdateOrdenODT,
  ): Promise<{ message: string }> {
    const { detallesOrdenDespacho, ...ordenFields } = data;

    try {
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
        };
      }[] = [];
      const createOperations: {
        loteId: number;
        cantidadEnviada: number;
        precioUnitario: number;
      }[] = [];

      for (const detalle of detallesOrdenDespacho ?? []) {
        if (detalle.id) {
          incomingIds.add(detalle.id);
          updateOperations.push({
            where: { id: detalle.id },
            data: {
              loteId: detalle.loteId,
              cantidadEnviada: detalle.cantidadEnviada,
              precioUnitario: detalle.precioUnitario,
            },
          });
        } else {
          createOperations.push({
            loteId: detalle.loteId,
            cantidadEnviada: detalle.cantidadEnviada,
            precioUnitario: detalle.precioUnitario,
          });
        }
      }

      const deleteIds = [...existingIds].filter((id) => !incomingIds.has(id));

      await this.prisma.ordenDespacho.update({
        where: { id },
        data: {
          ...ordenFields,
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
      totalFactudaroOriginal: Number(orden.totalFacturadoOriginal ?? 0),
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
      totalFacturadoOriginal: Number(orden.totalFacturadoOriginal ?? 0),
      saldoNetoCobrar: Number(orden.saldoNetoCobrar ?? 0),
      totalRechazado: Number(orden.totalRechazado ?? 0),
      detalles: orden.detalles.map((detalle) => ({
        id: detalle.id,
        ordenId: detalle.ordenId,
        loteId: detalle.loteId,
        stockActualLote: detalle.lote.stockActual,
        numeroLote: detalle.lote.numeroLote,
        cantidadEnviada: detalle.cantidadEnviada,
        precioUnitario: Number(detalle.precioUnitario),
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

    if (orden.estado === 'PREPARACION') {
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
          data: { estado: 'EN_RUTA' },
        });
      });

      return { message: 'Orden de despacho actualizada exitosamente' };
    }

    throw new Error(`Transición de estado no soportada: ${orden.estado}`);
  }

  async getOrdenbyId(id: number): Promise<void> {
    const orden = await this.prisma.ordenDespacho.findUnique(
      {
        where: { id },
        include: {
          detalles: true,
        },
      },
    );

    
  }
}
