import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { parsePDF } from '../services/pdf-parser.js';
import { extractPolicyActions } from '../services/policy-extractor.js';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
await fs.mkdir(UPLOAD_DIR, { recursive: true });

export async function uploadRoutes(fastify: FastifyInstance) {
  // Upload policy document
  fastify.post('/', async (request, reply) => {
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const { projectId } = request.query as { projectId?: string };
    
    if (!projectId) {
      return reply.status(400).send({ error: 'projectId query parameter required' });
    }

    // Verify project exists
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Save file
    const filename = `${Date.now()}-${data.filename}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    const buffer = await data.toBuffer();
    await fs.writeFile(filepath, buffer);

    // Parse PDF
    let extractedText: string | undefined;
    let parsedActions: any = null;

    try {
      extractedText = await parsePDF(filepath);
      
      // Extract policy actions using LLM
      if (extractedText) {
        parsedActions = await extractPolicyActions(extractedText);
      }
    } catch (error) {
      console.error('Error parsing PDF:', error);
    }

    // Save to database
    const policyDoc = await db.policyDocument.create({
      data: {
        projectId,
        filename: data.filename,
        filepath,
        extractedText,
        parsedActions,
      },
    });

    return {
      id: policyDoc.id,
      filename: policyDoc.filename,
      uploadedAt: policyDoc.uploadedAt,
      hasText: !!extractedText,
      hasActions: !!parsedActions,
      actionCount: parsedActions?.actions?.length || 0,
    };
  });

  // Get policy document
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const doc = await db.policyDocument.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!doc) {
      return reply.status(404).send({ error: 'Document not found' });
    }

    return doc;
  });

  // List policy documents for a project
  fastify.get('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    
    const docs = await db.policyDocument.findMany({
      where: { projectId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        filename: true,
        uploadedAt: true,
        parsedActions: true,
      },
    });

    return docs;
  });

  // Delete policy document
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const doc = await db.policyDocument.findUnique({ where: { id } });
    if (!doc) {
      return reply.status(404).send({ error: 'Document not found' });
    }

    // Delete file
    try {
      await fs.unlink(doc.filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete from database
    await db.policyDocument.delete({ where: { id } });

    return { success: true };
  });
}


