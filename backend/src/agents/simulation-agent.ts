import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { broadcastToChannel } from '../streaming/websocket.js';

const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

interface SimulationAgentConfig {
  simulationId: string;
  city: string;
  urbanData: any;
  policyActions: any[];
  parameters: any;
}

export class SimulationAgent {
  private config: SimulationAgentConfig;

  constructor(config: SimulationAgentConfig) {
    this.config = config;
  }

  async run() {
    const { simulationId, city, urbanData, policyActions, parameters } = this.config;

    // Broadcast start
    await this.broadcast('progress', {
      message: 'Starting simulation analysis...',
      progress: 0,
    });

    // Build context for LLM
    const context = this.buildContext();

    // Stream analysis from LLM
    const analysis = await this.streamAnalysis(context);

    // Calculate metrics
    await this.broadcast('progress', {
      message: 'Calculating impact metrics...',
      progress: 70,
    });

    const metrics = this.calculateMetrics(policyActions, urbanData);

    await this.broadcast('progress', {
      message: 'Simulation complete',
      progress: 100,
    });

    return { analysis, metrics };
  }

  private buildContext() {
    const { city, urbanData, policyActions, parameters } = this.config;

    return `You are an urban planning simulation agent analyzing policy changes for ${city}.

URBAN DATA BASELINE:
${JSON.stringify(urbanData, null, 2)}

PROPOSED POLICY ACTIONS:
${JSON.stringify(policyActions, null, 2)}

SIMULATION PARAMETERS:
- Time Horizon: ${parameters.timeHorizon} years
- Analysis Depth: ${parameters.analysisDepth}
- Focus Areas: ${parameters.focusAreas?.join(', ') || 'All'}

Analyze the impact of these policy changes on:
1. Traffic and Transportation
2. Housing and Development
3. Environmental Impact
4. Economic Effects
5. Social Equity
6. Infrastructure Requirements

For each area, provide:
- Baseline metrics
- Projected changes
- Timeline of impacts
- Risk factors
- Mitigation strategies

Be specific with numbers and cite the data sources.`;
  }

  private async streamAnalysis(context: string) {
    let fullAnalysis = '';

    await this.broadcast('progress', {
      message: 'Analyzing policy impacts...',
      progress: 10,
    });

    try {
      const fullPrompt = `You are an expert urban planning analyst that provides detailed, data-driven policy impact assessments.\n\n${context}`;
      
      const result = await model.generateContentStream(fullPrompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullAnalysis += chunkText;
          
          // Stream token to WebSocket
          await this.broadcast('token', { token: chunkText });
        }
      }

      return fullAnalysis;
    } catch (error) {
      console.error('Error in simulation analysis:', error);
      throw error;
    }
  }

  private calculateMetrics(policyActions: any[], urbanData: any) {
    // Calculate projected metrics based on policy actions
    const baseline = {
      population: urbanData.demographics?.population || 0,
      medianIncome: urbanData.demographics?.medianIncome || 0,
      housingUnits: urbanData.demographics?.housing?.total || 0,
      airQualityIndex: urbanData.emissions?.overallAQI || 50,
      publicTransitUsage: urbanData.demographics?.commute?.publicTransit || 0,
    };

    // Simple impact calculations (in real system, would be more sophisticated)
    const impacts: any = {
      baseline,
      projected: { ...baseline },
      changes: {},
    };

    policyActions.forEach((action) => {
      if (action.type === 'zoning_change') {
        // Estimate housing impact
        impacts.projected.housingUnits *= 1.15; // 15% increase
      }
      
      if (action.type === 'infrastructure_addition' && action.description.includes('transit')) {
        // Estimate transit usage increase
        impacts.projected.publicTransitUsage *= 1.25; // 25% increase
        impacts.projected.airQualityIndex *= 0.95; // 5% improvement
      }

      if (action.type === 'environmental') {
        impacts.projected.airQualityIndex *= 0.90; // 10% improvement
      }
    });

    // Calculate percentage changes
    Object.keys(baseline).forEach((key) => {
      const baseValue = baseline[key];
      const projValue = impacts.projected[key];
      impacts.changes[key] = {
        absolute: projValue - baseValue,
        percentage: baseValue ? ((projValue - baseValue) / baseValue) * 100 : 0,
      };
    });

    return impacts;
  }

  private async broadcast(type: string, data: any) {
    await broadcastToChannel(`simulation:${this.config.simulationId}`, {
      type,
      agentType: 'simulation',
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

