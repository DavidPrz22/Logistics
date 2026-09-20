import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { Rol } from '../prisma/generated/prisma/enums';
import 'dotenv/config';
import * as argon2 from 'argon2';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await argon2.hash('demo123');

  try {
    const result = await prisma.usuario.create({
      data: {
        nombreUsuario: 'demo',
        correo: 'demo@traficoerp.com',
        hashPassword: hashedPassword,
        rol: Rol.OPERADOR,
      },
    });
    console.log(`Created demo user: ${result.nombreUsuario} (ID: ${result.id})`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Demo user already exists, skipping.');
    } else {
      console.error('Error creating demo user:', error);
    }
  }

  console.log('Finished seeding usuario table.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
