import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KardexService {
  constructor(private readonly prisma: PrismaService) {}

  async getKardexBySku(sku: string) {
    const trimmedSku = sku.trim();

    const variant = await this.prisma.varianteProducto.findUnique({
      where: { sku: trimmedSku },
      include: {
        producto: {
          include: {
            variantes: {
              select: { id: true, sku: true, nombre: true, precioBase: true },
            },
          },
        },
        lotes: {
          select: { stockActual: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(
        `Variante con SKU '${trimmedSku}' no encontrada`,
      );
    }

    const existenciaActual = variant.lotes.reduce(
      (sum, l) => sum + l.stockActual,
      0,
    );

    const movimientos = await this.prisma.movimientoInventario.findMany({
      where: { lote: { varianteId: variant.id } },
      include: {
        lote: { select: { id: true, numeroLote: true } },
        almacen: { select: { id: true, nombre: true, tipo: true } },
        detalleOrden: {
          include: {
            orden: { select: { id: true, numeroOrden: true, tipoOrden: true } },
          },
        },
        detalleRechazo: {
          include: { motivoRechazo: { select: { descripcion: true } } },
        },
        usuario: { select: { id: true, nombreUsuario: true } },
      },
      orderBy: { fechaMovimiento: 'asc' },
    });

    let totalEntradas = 0;
    let totalSalidas = 0;

    for (const m of movimientos) {
      if (m.tipoMovimiento === 'ENTRADA') {
        totalEntradas += m.cantidad;
      } else {
        totalSalidas += m.cantidad;
      }
    }

    const netMovement = totalEntradas - totalSalidas;
    const initialStock = existenciaActual - netMovement;
    let runningBalance = initialStock;

    const movimientosWithSaldo = movimientos.map((m) => {
      if (m.tipoMovimiento === 'ENTRADA') {
        runningBalance += m.cantidad;
      } else {
        runningBalance -= m.cantidad;
      }

      let operacion = 'Movimiento de inventario';
      if (m.detalleRechazo) {
        operacion = `Reingreso (${m.detalleRechazo.motivoRechazo.descripcion})`;
      } else if (m.detalleOrden) {
        operacion =
          m.detalleOrden.orden.tipoOrden === 'VENTA_MOSTRADOR'
            ? 'Venta mostrador'
            : 'Despacho en ruta';
      } else if (m.referencia) {
        operacion = m.referencia;
      }

      const documento =
        m.detalleOrden?.orden?.numeroOrden || m.referencia || `MOV-${m.id}`;
      const costoUnitario = m.detalleOrden?.precioUnitario
        ? Number(m.detalleOrden.precioUnitario)
        : Number(variant.precioBase);

      return {
        id: m.id,
        fechaMovimiento:
          m.fechaMovimiento?.toISOString() || new Date().toISOString(),
        tipoMovimiento: m.tipoMovimiento,
        cantidad: m.cantidad,
        saldo: runningBalance,
        costoUnitario,
        precioUnitario: Number(variant.precioBase),
        numeroLote: m.lote.numeroLote,
        loteId: m.lote.id,
        almacen: {
          id: m.almacen.id,
          nombre: m.almacen.nombre,
          tipo: m.almacen.tipo,
        },
        documento,
        operacion,
        ordenId: m.detalleOrden?.orden?.id ?? null,
        usuario: m.usuario?.nombreUsuario,
        referencia: m.referencia,
      };
    });

    movimientosWithSaldo.reverse();

    return {
      producto: {
        id: variant.producto.id,
        nombre: variant.producto.nombre,
        descripcion: variant.producto.descripcion,
      },
      varianteActual: {
        id: variant.id,
        sku: variant.sku,
        nombre: variant.nombre,
        precioBase: Number(variant.precioBase),
        existenciaTotal: existenciaActual,
      },
      variantes: variant.producto.variantes.map((v) => ({
        id: v.id,
        sku: v.sku,
        nombre: v.nombre,
        precioBase: Number(v.precioBase),
      })),
      movimientos: movimientosWithSaldo,
      resumen: {
        existenciaActual,
        totalEntradas,
        totalSalidas,
        totalMovimientos: movimientos.length,
      },
    };
  }

  async search(query: string) {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const productos = await this.prisma.producto.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: trimmed,
            },
          },
          {
            variantes: {
              some: {
                OR: [
                  {
                    sku: {
                      contains: trimmed,
                    },
                  },
                  {
                    nombre: {
                      contains: trimmed,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        variantes: {
          select: {
            id: true,
            sku: true,
            nombre: true,
          },
        },
      },
      take: 20,
    });

    const lower = trimmed.toLowerCase();

    return productos.map((p) => {
      // Sort variants: exact sku > sku startsWith > sku contains > name contains
      const sortedVariantes = [...p.variantes].sort((a, b) => {
        const aSku = a.sku.toLowerCase();
        const bSku = b.sku.toLowerCase();
        if (aSku === lower && bSku !== lower) return -1;
        if (bSku === lower && aSku !== lower) return 1;
        if (aSku.startsWith(lower) && !bSku.startsWith(lower)) return -1;
        if (bSku.startsWith(lower) && !aSku.startsWith(lower)) return 1;
        return 0;
      });

      return {
        id: p.id,
        nombre: p.nombre,
        variantes: sortedVariantes,
      };
    });
  }
}
