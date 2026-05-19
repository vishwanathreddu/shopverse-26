import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(__dirname, '../backend');

export default async function globalSetup() {
  const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/shopverse';

  console.log('Seeding database for E2E tests...');
  execSync('npx tsx src/scripts/seed.ts', {
    cwd: backendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      MONGODB_URI: mongoUri,
    },
  });
}
