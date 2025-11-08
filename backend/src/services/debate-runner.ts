import { db } from '../db/client.js';
import { DebateAgent } from '../agents/debate-agent.js';
import { broadcastToChannel } from '../streaming/websocket.js';

export async function runDebateSimulation(debateId: string, rounds: number) {
  const debate = await db.debate.findUnique({
    where: { id: debateId },
    include: {
      simulation: {
        include: {
          policyDoc: true,
        },
      },
      agent: true,
    },
  });

  if (!debate) {
    throw new Error('Debate not found');
  }

  try {
    broadcastToChannel(`debate:${debateId}`, {
      type: 'started',
      debateId,
    });

    // Create debate agents
    const debateAgent = new DebateAgent({
      debateId,
      simulationResults: debate.simulation.results as any,
      policyText: debate.simulation.policyDoc?.extractedText || '',
      rounds,
    });

    // Run debate
    const results = await debateAgent.run();

    // Update debate with results
    await db.debate.update({
      where: { id: debateId },
      data: {
        arguments: results.arguments,
        sentiment: results.sentiment,
        riskScores: results.riskScores,
      },
    });

    broadcastToChannel(`debate:${debateId}`, {
      type: 'completed',
      debateId,
      results,
    });

    return results;
  } catch (error) {
    console.error(`Debate ${debateId} failed:`, error);

    broadcastToChannel(`debate:${debateId}`, {
      type: 'error',
      debateId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}


