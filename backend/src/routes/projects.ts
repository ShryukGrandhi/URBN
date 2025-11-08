import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
});

export async function projectRoutes(fastify: FastifyInstance) {
  // List all projects
  fastify.get('/', async (request, reply) => {
    const projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            agents: true,
            policyDocs: true,
            simulations: true,
            reports: true,
          },
        },
      },
    });
    return projects;
  });

  // Get single project
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await db.project.findUnique({
      where: { id },
      include: {
        agents: {
          include: { agent: true },
        },
        policyDocs: true,
        simulations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reports: {
          orderBy: { generatedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    return project;
  });

  // Create project
  fastify.post('/', async (request, reply) => {
    const body = createProjectSchema.parse(request.body);
    
    const project = await db.project.create({
      data: body,
    });

    return reply.status(201).send(project);
  });

  // Update project
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = createProjectSchema.partial().parse(request.body);

    const project = await db.project.update({
      where: { id },
      data: body,
    });

    return project;
  });

  // Delete project
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    await db.project.delete({
      where: { id },
    });

    return { success: true };
  });

  // Add agent to project
  fastify.post('/:id/agents', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { agentId } = request.body as { agentId: string };

    const projectAgent = await db.projectAgent.create({
      data: {
        projectId: id,
        agentId,
      },
      include: {
        agent: true,
      },
    });

    return projectAgent;
  });

  // Remove agent from project
  fastify.delete('/:id/agents/:agentId', async (request, reply) => {
    const { id, agentId } = request.params as { id: string; agentId: string };

    await db.projectAgent.deleteMany({
      where: {
        projectId: id,
        agentId,
      },
    });

    return { success: true };
  });
}


