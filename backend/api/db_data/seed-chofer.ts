import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dataPath = path.join(__dirname, 'choferes.json');
  const choferesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log('Starting to populate chofer table...');

  for (const chofer of choferesData) {
    try {
      const result = await prisma.chofer.create({
        data: chofer,
      });
      console.log(`Created chofer: ${result.nombre} (ID: ${result.id})`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(
          `Skipping duplicate: ${chofer.nombre} (${chofer.licenciaConducir})`,
        );
      } else {
        console.error(`Error creating ${chofer.nombre}:`, error);
      }
    }
  }

  console.log('Finished populating chofer table.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
