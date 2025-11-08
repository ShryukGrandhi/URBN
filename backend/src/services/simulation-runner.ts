import { db } from '../db/client.js';
import { getUrbanData } from '../data/urban-data-service.js';
import { SimulationAgent } from '../agents/simulation-agent.js';
import { broadcastToChannel } from '../streaming/websocket.js';

export async function runSimulation(simulationId: string) {
  const simulation = await db.simulation.findUnique({
    where: { id: simulationId },
    include: {
      agent: true,
      policyDoc: true,
      project: true,
    },
  });

  if (!simulation) {
    throw new Error('Simulation not found');
  }

  try {
    // Update status to running
    await db.simulation.update({
      where: { id: simulationId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Broadcast start event
    broadcastToChannel(`simulation:${simulationId}`, {
      type: 'started',
      simulationId,
    });

    // Fetch real urban data
    const urbanData = await getUrbanData({
      city: simulation.city,
      region: simulation.region || undefined,
    });

    // Get policy actions
    const policyActions = simulation.policyDoc?.parsedActions as any;

    // Create simulation agent
    const agent = new SimulationAgent({
      simulationId,
      city: simulation.city,
      urbanData,
      policyActions: policyActions?.actions || [],
      parameters: simulation.parameters as any,
    });

    // Run simulation with streaming
    const results = await agent.run();

    // Update simulation with results
    await db.simulation.update({
      where: { id: simulationId },
      data: {
        status: 'COMPLETED',
        results: results.analysis,
        metrics: results.metrics,
        completedAt: new Date(),
      },
    });

    // Broadcast completion with full data
    broadcastToChannel(`simulation:${simulationId}`, {
      type: 'completed',
      simulationId,
      results,
      metrics: results.metrics,
      status: 'completed'
    });

    return results;
  } catch (error) {
    console.error(`Simulation ${simulationId} failed:`, error);

    await db.simulation.update({
      where: { id: simulationId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
      },
    });

    broadcastToChannel(`simulation:${simulationId}`, {
      type: 'error',
      simulationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}


