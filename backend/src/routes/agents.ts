import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { z } from 'zod';

const createAgentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['SUPERVISOR', 'SIMULATION', 'DEBATE', 'AGGREGATOR', 'PROPAGANDA']),
  role: z.string().min(1),
  scope: z.string().optional(),
  sources: z.array(z.string()).default([]),
  config: z.record(z.any()).optional(),
});

export async function agentRoutes(fastify: FastifyInstance) {
  // List all agents
  fastify.get('/', async (request, reply) => {
    const agents = await db.agent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { simulations: true, debates: true },
        },
      },
    });
    return agents;
  });

  // Get single agent
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = await db.agent.findUnique({
      where: { id },
      include: {
        projects: {
          include: { project: true },
        },
        simulations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }

    return agent;
  });

  // Create agent
  fastify.post('/', async (request, reply) => {
    const body = createAgentSchema.parse(request.body);
    
    const agent = await db.agent.create({
      data: {
        name: body.name,
        type: body.type,
        role: body.role,
        scope: body.scope,
        sources: body.sources,
        config: body.config || {},
      },
    });

    return reply.status(201).send(agent);
  });

  // Update agent
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = createAgentSchema.partial().parse(request.body);

    const agent = await db.agent.update({
      where: { id },
      data: body,
    });

    return agent;
  });

  // Delete agent
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    await db.agent.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return { success: true };
  });

  // Get agent statistics
  fastify.get('/:id/stats', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const [simulationCount, debateCount, recentActivity] = await Promise.all([
      db.simulation.count({ where: { agentId: id } }),
      db.debate.count({ where: { agentId: id } }),
      db.simulation.findMany({
        where: { agentId: id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          project: { select: { name: true } },
        },
      }),
    ]);

    return {
      simulationCount,
      debateCount,
      recentActivity,
    };
  });
}


