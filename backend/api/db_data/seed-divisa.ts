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
  const dataPath = path.join(__dirname, 'divisas.json');
  const divisasData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log('Starting to populate divisa table...');

  for (const divisa of divisasData) {
    try {
      const result = await prisma.divisa.create({
        data: divisa,
      });
      console.log(
        `Created divisa: ${result.nombre} (${result.codigo}) - Base: ${result.esMonedaBase} (ID: ${result.id})`,
      );
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`Skipping duplicate: ${divisa.nombre} (${divisa.codigo})`);
      } else {
        console.error(`Error creating ${divisa.nombre}:`, error);
      }
    }
  }

  console.log('Finished populating divisa table.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
