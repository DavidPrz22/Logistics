import 'dotenv/config';
import { execSync } from 'child_process';

console.log('Starting database setup...');
console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');

try {
  console.log('Running prisma db push...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('Database schema pushed successfully!');
} catch (error) {
  console.error('Failed to push database schema:', error);
  process.exit(1);
}
