import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

interface SupervisorAgentConfig {
  goal: string;
  context: any;
}

export class SupervisorAgent {
  private config: SupervisorAgentConfig;

  constructor(config: SupervisorAgentConfig) {
    this.config = config;
  }

  async defineStrategy() {
    const prompt = `You are a senior policy strategist. Given this political/strategic goal:

GOAL: ${this.config.goal}

CONTEXT: ${JSON.stringify(this.config.context, null, 2)}

Define:
1. Primary Objectives (3-5 specific, measurable objectives)
2. Constraints (legal, political, resource, timeline)
3. Success Metrics (quantifiable measures)
4. Risk Factors (potential obstacles)
5. Stakeholder Map (key supporters and opponents)
6. Recommended Approach (strategy summary)

Provide structured JSON output.`;

    try {
      const fullPrompt = `You are a strategic policy advisor that provides structured analysis. Always respond with valid JSON.\n\n${prompt}`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      
      return jsonContent ? JSON.parse(jsonContent) : null;
    } catch (error) {
      console.error('Error in supervisor agent:', error);
      throw error;
    }
  }

  async evaluateProgress(currentState: any) {
    const prompt = `Evaluate progress toward this goal:

GOAL: ${this.config.goal}

CURRENT STATE: ${JSON.stringify(currentState, null, 2)}

Provide:
1. Progress Assessment (percentage, status)
2. Objectives Met (which ones are complete)
3. Challenges Encountered
4. Course Corrections Needed
5. Next Steps

Return as JSON.`;

    try {
      const fullPrompt = `You are a strategic policy advisor evaluating project progress. Always respond with valid JSON.\n\n${prompt}`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      
      return jsonContent ? JSON.parse(jsonContent) : null;
    } catch (error) {
      console.error('Error evaluating progress:', error);
      throw error;
    }
  }
}

