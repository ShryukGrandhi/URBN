import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { z } from 'zod';
import { generateReport } from '../services/report-generator.js';

const createReportSchema = z.object({
  projectId: z.string().uuid(),
  simulationId: z.string().uuid().optional(),
  title: z.string().min(1),
  format: z.enum(['PDF', 'POWERPOINT', 'HTML', 'MARKDOWN']).default('PDF'),
  sections: z.array(z.string()).optional(),
});

export async function reportRoutes(fastify: FastifyInstance) {
  // List reports
  fastify.get('/', async (request, reply) => {
    const { projectId } = request.query as { projectId?: string };
    
    const where = projectId ? { projectId } : {};
    
    const reports = await db.report.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      include: {
        project: { select: { name: true } },
        simulation: { select: { city: true } },
      },
    });

    return reports;
  });

  // Get single report
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const report = await db.report.findUnique({
      where: { id },
      include: {
        project: true,
        simulation: {
          include: {
            policyDoc: true,
            debates: true,
          },
        },
      },
    });

    if (!report) {
      return reply.status(404).send({ error: 'Report not found' });
    }

    return report;
  });

  // Generate report
  fastify.post('/', async (request, reply) => {
    const body = createReportSchema.parse(request.body);

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: body.projectId },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Create report record
    const report = await db.report.create({
      data: {
        projectId: body.projectId,
        simulationId: body.simulationId,
        title: body.title,
        format: body.format,
        content: { sections: [] },
      },
    });

    // Generate report asynchronously
    generateReport(report.id, body.sections).catch((error) => {
      console.error(`Report ${report.id} generation failed:`, error);
    });

    return reply.status(201).send(report);
  });

  // Stream report generation
  fastify.get('/:id/stream', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const report = await db.report.findUnique({ where: { id } });
    if (!report) {
      return reply.status(404).send({ error: 'Report not found' });
    }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    reply.raw.write(`data: ${JSON.stringify({ type: 'init', report })}\n\n`);

    const interval = setInterval(async () => {
      const updated = await db.report.findUnique({ where: { id } });
      if (updated) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'update', report: updated })}\n\n`);
      }
    }, 500);

    request.raw.on('close', () => {
      clearInterval(interval);
    });
  });

  // Delete report
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    await db.report.delete({ where: { id } });

    return { success: true };
  });
}


