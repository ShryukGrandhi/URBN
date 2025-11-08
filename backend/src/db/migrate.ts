import { execSync } from 'child_process';

console.log('🔄 Running database migrations...');

try {
  // Use deploy for non-interactive migrations, or dev with --name flag
  execSync('npx prisma migrate dev --name init --skip-generate', { stdio: 'inherit' });
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Migrations complete');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}


