import { db } from '../db/client.js';
import { AggregatorAgent } from '../agents/aggregator-agent.js';
import { broadcastToChannel } from '../streaming/websocket.js';

export async function generateReport(reportId: string, sections?: string[]) {
  const report = await db.report.findUnique({
    where: { id: reportId },
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
    throw new Error('Report not found');
  }

  try {
    broadcastToChannel(`report:${reportId}`, {
      type: 'started',
      reportId,
    });

    // Create aggregator agent
    const aggregator = new AggregatorAgent({
      reportId,
      project: report.project,
      simulation: report.simulation || undefined,
      debates: report.simulation?.debates || [],
      requestedSections: sections,
    });

    // Generate report
    const content = await aggregator.generate();

    // Update report
    await db.report.update({
      where: { id: reportId },
      data: {
        content,
      },
    });

    broadcastToChannel(`report:${reportId}`, {
      type: 'completed',
      reportId,
      content,
    });

    return content;
  } catch (error) {
    console.error(`Report ${reportId} generation failed:`, error);

    broadcastToChannel(`report:${reportId}`, {
      type: 'error',
      reportId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}


