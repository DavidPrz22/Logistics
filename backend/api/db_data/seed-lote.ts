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
  const dataPath = path.join(__dirname, 'lotes.json');
  const lotesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log('Starting to populate lote table...');

  const variantes = await prisma.varianteProducto.findMany({
    select: { id: true, sku: true },
  });
  const skuToVarianteId = new Map<string, number>();
  for (const v of variantes) {
    skuToVarianteId.set(v.sku, v.id);
  }

  console.log(`Found ${variantes.length} variantes in database.`);

  let created = 0;
  let skipped = 0;

  for (const lote of lotesData) {
    const varianteId = skuToVarianteId.get(lote.sku);
    if (!varianteId) {
      console.warn(
        `No variante found for SKU: ${lote.sku}, skipping lote ${lote.numeroLote}`,
      );
      skipped++;
      continue;
    }

    try {
      await prisma.lote.create({
        data: {
          varianteId,
          numeroLote: lote.numeroLote,
          fechaVencimiento: new Date(lote.fechaVencimiento),
          stockActual: lote.stockActual,
        },
      });
      created++;
      console.log(
        `Created lote: ${lote.numeroLote} (varianteId: ${varianteId})`,
      );
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`Skipping duplicate: ${lote.numeroLote}`);
        skipped++;
      } else {
        console.error(`Error creating lote ${lote.numeroLote}:`, error);
      }
    }
  }

  console.log(
    `Finished populating lote table. Created: ${created}, Skipped: ${skipped}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
