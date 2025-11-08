import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import websocket from '@fastify/websocket';
import { config } from './config.js';
import { setupRoutes } from './routes/index.js';
import { setupWebSocket } from './streaming/websocket.js';
import { db } from './db/client.js';

const fastify = Fastify({
  logger: {
    level: config.isDevelopment ? 'info' : 'warn',
  },
});

// Register plugins
await fastify.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
});

await fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for PDF uploads
  },
});

await fastify.register(websocket);

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Setup routes
setupRoutes(fastify);

// Setup WebSocket
setupWebSocket(fastify);

// Start server
const start = async () => {
  try {
    await fastify.listen({ 
      port: config.port, 
      host: '0.0.0.0' 
    });
    
    console.log(`🚀 URBAN Backend running on http://localhost:${config.port}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${config.port}/ws`);
    console.log(`🗄️  Database: ${config.database.name}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await db.$disconnect();
  await fastify.close();
  process.exit(0);
});

start();


