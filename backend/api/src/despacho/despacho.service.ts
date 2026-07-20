import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoteSearchResultODT } from './ODTs/despacho.odts';

@Injectable()
export class DespachoService {
  constructor(private readonly prisma: PrismaService) {}

  async searchLotes(query?: string): Promise<LoteSearchResultODT[]> {
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
}
