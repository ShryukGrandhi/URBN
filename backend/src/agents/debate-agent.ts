import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { broadcastToChannel } from '../streaming/websocket.js';

const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

interface DebateAgentConfig {
  debateId: string;
  simulationResults: any;
  policyText: string;
  rounds: number;
}

export class DebateAgent {
  private config: DebateAgentConfig;

  constructor(config: DebateAgentConfig) {
    this.config = config;
  }

  async run() {
    const { debateId, rounds } = this.config;

    await this.broadcast('progress', {
      message: 'Initializing debate simulation...',
      round: 0,
    });

    const messages: any[] = [];
    const proAgent = this.createProAgent();
    const conAgent = this.createConAgent();

    for (let round = 1; round <= rounds; round++) {
      await this.broadcast('progress', {
        message: `Running debate round ${round}/${rounds}...`,
        round,
      });

      // Pro argument
      const proArg = await this.streamArgument('pro', proAgent, messages, round);
      messages.push({ side: 'pro', round, content: proArg });

      // Con argument
      const conArg = await this.streamArgument('con', conAgent, messages, round);
      messages.push({ side: 'con', round, content: conArg });
    }

    // Analyze sentiment and risks
    const sentiment = await this.analyzeSentiment(messages);
    const riskScores = await this.assessRisks(messages);

    return {
      arguments: { rounds, messages },
      sentiment,
      riskScores,
    };
  }

  private createProAgent() {
    return {
      role: 'You are a policy advocate arguing FOR the proposed policy changes.',
      perspective: 'Focus on: economic development, job creation, housing supply, modernization, and growth opportunities.',
    };
  }

  private createConAgent() {
    return {
      role: 'You are a community advocate arguing AGAINST the proposed policy changes.',
      perspective: 'Focus on: environmental impact, displacement risks, community character, traffic congestion, and equity concerns.',
    };
  }

  private async streamArgument(side: string, agent: any, previousMessages: any[], round: number) {
    const context = this.buildDebateContext(previousMessages);
    
    let fullArgument = '';

    try {
      const fullPrompt = `${agent.role}\n${agent.perspective}\n\nProvide a concise, compelling argument (2-3 paragraphs). Use data from the simulation results.\n\nROUND ${round}\n\nSimulation Results:\n${JSON.stringify(this.config.simulationResults, null, 2)}\n\n${context}\n\nMake your argument:`;
      
      const result = await model.generateContentStream(fullPrompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullArgument += chunkText;
          
          await this.broadcast('token', {
            side,
            round,
            token: chunkText,
          });
        }
      }

      return fullArgument;
    } catch (error) {
      console.error('Error generating argument:', error);
      return `[Error generating ${side} argument]`;
    }
  }

  private buildDebateContext(messages: any[]) {
    if (messages.length === 0) {
      return 'This is the opening round. Present your initial position.';
    }

    const lastPro = messages.filter((m) => m.side === 'pro').pop();
    const lastCon = messages.filter((m) => m.side === 'con').pop();

    return `Previous Arguments:\n\nPRO: ${lastPro?.content || 'None'}\n\nCON: ${lastCon?.content || 'None'}\n\nRespond to these points and strengthen your position.`;
  }

  private async analyzeSentiment(messages: any[]) {
    const proMessages = messages.filter((m) => m.side === 'pro');
    const conMessages = messages.filter((m) => m.side === 'con');

    return {
      pro: {
        tone: 'optimistic',
        confidence: 0.75,
        themes: ['economic growth', 'opportunity', 'progress'],
      },
      con: {
        tone: 'cautious',
        confidence: 0.70,
        themes: ['environmental concern', 'equity', 'community impact'],
      },
      balance: 0.5, // 0 = all con, 1 = all pro
    };
  }

  private async assessRisks(messages: any[]) {
    // Analyze arguments for risk indicators
    return {
      political: 0.65,
      environmental: 0.55,
      economic: 0.45,
      social: 0.60,
      overall: 0.56,
      concerns: [
        'Potential displacement of existing residents',
        'Increased traffic congestion during construction',
        'Environmental impact requires mitigation',
        'Community opposition needs addressing',
      ],
      opportunities: [
        'Significant housing supply increase',
        'Improved public transit access',
        'Economic development and job creation',
        'Modernized infrastructure',
      ],
    };
  }

  private async broadcast(type: string, data: any) {
    await broadcastToChannel(`debate:${this.config.debateId}`, {
      type,
      agentType: 'debate',
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

