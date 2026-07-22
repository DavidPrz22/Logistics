import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dataPath = path.join(__dirname, 'productos.json');
  const productosData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log('Starting to populate producto and varianteProducto tables...');

  for (const producto of productosData) {
    try {
      const result = await prisma.producto.create({
        data: {
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          variantes: {
            create: producto.variantes.map((v: any) => ({
              sku: v.sku,
              nombre: v.nombre,
              precioBase: v.precioBase,
            })),
          },
        },
        include: {
          variantes: true,
        },
      });
      console.log(
        `Created producto: ${result.nombre} with ${result.variantes.length} variantes (ID: ${result.id})`,
      );
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`Skipping duplicate: ${producto.nombre}`);
      } else {
        console.error(`Error creating ${producto.nombre}:`, error);
      }
    }
  }

  console.log('Finished populating producto and varianteProducto tables.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
