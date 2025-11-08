import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { z } from 'zod';
import { runDebateSimulation } from '../services/debate-runner.js';

const createDebateSchema = z.object({
  simulationId: z.string().uuid(),
  agentId: z.string().uuid(),
  rounds: z.number().min(1).max(10).default(3),
});

export async function debateRoutes(fastify: FastifyInstance) {
  // List debates
  fastify.get('/', async (request, reply) => {
    const { simulationId } = request.query as { simulationId?: string };
    
    const where = simulationId ? { simulationId } : {};
    
    const debates = await db.debate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        agent: { select: { name: true, type: true } },
        simulation: {
          select: {
            id: true,
            city: true,
            project: { select: { name: true } },
          },
        },
      },
    });

    return debates;
  });

  // Get single debate
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const debate = await db.debate.findUnique({
      where: { id },
      include: {
        agent: true,
        simulation: {
          include: {
            project: true,
            policyDoc: true,
          },
        },
      },
    });

    if (!debate) {
      return reply.status(404).send({ error: 'Debate not found' });
    }

    return debate;
  });

  // Create and run debate
  fastify.post('/', async (request, reply) => {
    const body = createDebateSchema.parse(request.body);

    // Verify simulation exists and is completed
    const simulation = await db.simulation.findUnique({
      where: { id: body.simulationId },
    });

    if (!simulation) {
      return reply.status(404).send({ error: 'Simulation not found' });
    }

    if (simulation.status !== 'COMPLETED') {
      return reply.status(400).send({ error: 'Simulation must be completed before running debate' });
    }

    // Create debate record
    const debate = await db.debate.create({
      data: {
        simulationId: body.simulationId,
        agentId: body.agentId,
        arguments: { rounds: body.rounds, messages: [] },
      },
    });

    // Run debate asynchronously
    runDebateSimulation(debate.id, body.rounds).catch((error) => {
      console.error(`Debate ${debate.id} failed:`, error);
    });

    return reply.status(201).send(debate);
  });

  // Stream debate progress
  fastify.get('/:id/stream', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const debate = await db.debate.findUnique({ where: { id } });
    if (!debate) {
      return reply.status(404).send({ error: 'Debate not found' });
    }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    reply.raw.write(`data: ${JSON.stringify({ type: 'init', debate })}\n\n`);

    const interval = setInterval(async () => {
      const updated = await db.debate.findUnique({ where: { id } });
      if (updated) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'update', debate: updated })}\n\n`);
      }
    }, 500);

    request.raw.on('close', () => {
      clearInterval(interval);
    });
  });
}


