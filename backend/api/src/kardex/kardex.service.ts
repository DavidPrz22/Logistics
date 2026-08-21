import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KardexService {
  constructor(private readonly prisma: PrismaService) {}

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
