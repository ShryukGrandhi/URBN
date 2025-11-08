import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { z } from 'zod';
import { runSimulation } from '../services/simulation-runner.js';
import { broadcastToSession } from '../streaming/broadcaster.js';

const createSimulationSchema = z.object({
  projectId: z.string().uuid(),
  agentId: z.string().uuid(),
  policyDocId: z.string().uuid().optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  parameters: z.object({
    timeHorizon: z.number().min(1).max(50).default(10),
    focusAreas: z.array(z.string()).default([]),
    analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
  }),
});

export async function simulationRoutes(fastify: FastifyInstance) {
  // List simulations
  fastify.get('/', async (request, reply) => {
    const { projectId } = request.query as { projectId?: string };
    
    const where = projectId ? { projectId } : {};
    
    const simulations = await db.simulation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { name: true } },
        agent: { select: { name: true, type: true } },
        policyDoc: { select: { filename: true } },
      },
    });

    return simulations;
  });

  // Get single simulation
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const simulation = await db.simulation.findUnique({
      where: { id },
      include: {
        project: true,
        agent: true,
        policyDoc: true,
        debates: true,
        reports: true,
      },
    });

    if (!simulation) {
      return reply.status(404).send({ error: 'Simulation not found' });
    }

    return simulation;
  });

  // Create and run simulation
  fastify.post('/', async (request, reply) => {
    const body = createSimulationSchema.parse(request.body);

    // Create simulation record
    const simulation = await db.simulation.create({
      data: {
        projectId: body.projectId,
        agentId: body.agentId,
        policyDocId: body.policyDocId,
        city: body.city,
        region: body.region,
        parameters: body.parameters,
        status: 'PENDING',
      },
    });

    // Run simulation asynchronously
    runSimulation(simulation.id).catch((error) => {
      console.error(`Simulation ${simulation.id} failed:`, error);
      db.simulation.update({
        where: { id: simulation.id },
        data: { status: 'FAILED' },
      });
    });

    return reply.status(201).send(simulation);
  });

  // Get simulation stream (Server-Sent Events)
  fastify.get('/:id/stream', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const simulation = await db.simulation.findUnique({ where: { id } });
    if (!simulation) {
      return reply.status(404).send({ error: 'Simulation not found' });
    }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Send initial state
    reply.raw.write(`data: ${JSON.stringify({ type: 'init', simulation })}\n\n`);

    // Subscribe to updates
    const interval = setInterval(async () => {
      const updated = await db.simulation.findUnique({ where: { id } });
      if (updated) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'update', simulation: updated })}\n\n`);
        
        if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
          clearInterval(interval);
          reply.raw.end();
        }
      }
    }, 1000);

    request.raw.on('close', () => {
      clearInterval(interval);
    });
  });

  // Cancel simulation
  fastify.post('/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const simulation = await db.simulation.update({
      where: { id },
      data: { status: 'FAILED' },
    });

    return simulation;
  });

  // Get simulation metrics
  fastify.get('/:id/metrics', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const simulation = await db.simulation.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        metrics: true,
        results: true,
        startedAt: true,
        completedAt: true,
      },
    });

    if (!simulation) {
      return reply.status(404).send({ error: 'Simulation not found' });
    }

    return simulation;
  });
}


