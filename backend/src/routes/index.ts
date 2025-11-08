import { FastifyInstance } from 'fastify';
import { agentRoutes } from './agents.js';
import { uploadRoutes } from './upload.js';
import { simulationRoutes } from './simulations.js';
import { debateRoutes } from './debate.js';
import { reportRoutes } from './reports.js';
import { projectRoutes } from './projects.js';

export function setupRoutes(fastify: FastifyInstance) {
  fastify.register(agentRoutes, { prefix: '/api/agents' });
  fastify.register(uploadRoutes, { prefix: '/api/upload' });
  fastify.register(simulationRoutes, { prefix: '/api/simulations' });
  fastify.register(debateRoutes, { prefix: '/api/debate' });
  fastify.register(reportRoutes, { prefix: '/api/reports' });
  fastify.register(projectRoutes, { prefix: '/api/projects' });
}


