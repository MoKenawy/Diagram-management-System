// packages/backend/prisma.config.ts
import 'dotenv/config';

export default {
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    // The CLI will automatically read your .env file
    url: process.env.DATABASE_URL, 
  },
}