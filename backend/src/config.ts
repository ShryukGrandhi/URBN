import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  port: parseInt(process.env.BACKEND_PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  database: {
    url: process.env.DATABASE_URL!,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    name: process.env.DATABASE_NAME || 'urban_db',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  apiKeys: {
    gemini: process.env.GEMINI_API_KEY!,
    mapbox: process.env.MAPBOX_ACCESS_TOKEN!,
    census: process.env.CENSUS_API_KEY,
    epa: process.env.EPA_API_KEY,
    hud: process.env.HUD_API_KEY,
    bts: process.env.BTS_API_KEY,
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'GEMINI_API_KEY',
  'MAPBOX_ACCESS_TOKEN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

