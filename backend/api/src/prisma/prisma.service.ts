import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
    super({ adapter });
  }
}
