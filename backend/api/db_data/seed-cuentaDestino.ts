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
  const dataPath = path.join(__dirname, 'cuentasDestino.json');
  const cuentasDestinoData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log('Starting to populate cuentaDestino table...');

  const divisas = await prisma.divisa.findMany({
    select: { id: true, codigo: true },
  });
  const codigoToDivisaId = new Map<string, number>();
  for (const d of divisas) {
    codigoToDivisaId.set(d.codigo, d.id);
  }

  console.log('Found ' + divisas.length + ' divisas in database.');

  let created = 0;
  let skipped = 0;

  for (const cuenta of cuentasDestinoData) {
    const divisaId = cuenta.divisaId ?? codigoToDivisaId.get(cuenta.divisaCodigo);

    if (!divisaId) {
      console.warn(
        'No divisa found for codigo: ' + cuenta.divisaCodigo + ', skipping cuenta ' + cuenta.nombre,
      );
      skipped++;
      continue;
    }

    try {
      const existing = await prisma.cuentaDestino.findFirst({
        where: {
          nombre: cuenta.nombre,
          divisaId,
        },
      });

      if (existing) {
        console.log('Skipping duplicate: ' + cuenta.nombre);
        skipped++;
        continue;
      }

      const result = await prisma.cuentaDestino.create({
        data: {
          nombre: cuenta.nombre,
          divisaId,
          tipo: cuenta.tipo,
        },
      });
      created++;
      console.log(
        'Created cuentaDestino: ' + result.nombre + ' (' + result.tipo + ') (ID: ' + result.id + ')',
      );
    } catch (error) {
      console.error('Error creating cuentaDestino ' + cuenta.nombre + ':', error);
    }
  }

  console.log(
    'Finished populating cuentaDestino table. Created: ' + created + ', Skipped: ' + skipped,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.();
  });
