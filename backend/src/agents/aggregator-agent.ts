import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { broadcastToChannel } from '../streaming/websocket.js';

const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

interface AggregatorAgentConfig {
  reportId: string;
  project: any;
  simulation?: any;
  debates: any[];
  requestedSections?: string[];
}

export class AggregatorAgent {
  private config: AggregatorAgentConfig;

  constructor(config: AggregatorAgentConfig) {
    this.config = config;
  }

  async generate() {
    const { reportId } = this.config;

    await this.broadcast('progress', {
      message: 'Generating report...',
      progress: 0,
    });

    const sections = await this.generateSections();

    await this.broadcast('progress', {
      message: 'Report generation complete',
      progress: 100,
    });

    return { sections };
  }

  private async generateSections() {
    const defaultSections = [
      'executive_summary',
      'proposed_changes',
      'impact_analysis',
      'debate_summary',
      'risk_assessment',
      'recommendations',
    ];

    const sectionsToGenerate = this.config.requestedSections || defaultSections;
    const results: any[] = [];

    for (const section of sectionsToGenerate) {
      await this.broadcast('progress', {
        message: `Generating ${section}...`,
        progress: (results.length / sectionsToGenerate.length) * 100,
      });

      const content = await this.generateSection(section);
      results.push({ id: section, title: this.getSectionTitle(section), content });
    }

    return results;
  }

  private async generateSection(sectionId: string) {
    const prompt = this.buildSectionPrompt(sectionId);
    let fullContent = '';

    try {
      const fullPrompt = `You are a professional policy consultant generating high-quality reports for government stakeholders.\n\n${prompt}`;
      
      const result = await model.generateContentStream(fullPrompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullContent += chunkText;
          
          await this.broadcast('token', {
            section: sectionId,
            token: chunkText,
          });
        }
      }

      return fullContent;
    } catch (error) {
      console.error(`Error generating section ${sectionId}:`, error);
      return `Error generating ${sectionId}`;
    }
  }

  private buildSectionPrompt(sectionId: string) {
    const { project, simulation, debates } = this.config;

    const baseContext = `
Project: ${project.name}
City: ${project.city || 'N/A'}
${project.description ? `Description: ${project.description}` : ''}

${simulation ? `Simulation Results:\n${JSON.stringify(simulation.results, null, 2)}\n\nMetrics:\n${JSON.stringify(simulation.metrics, null, 2)}` : 'No simulation data available.'}

${debates.length > 0 ? `Debate Summary:\n${JSON.stringify(debates[0], null, 2)}` : 'No debate data available.'}
`;

    const prompts: Record<string, string> = {
      executive_summary: `${baseContext}\n\nWrite a concise executive summary (2-3 paragraphs) for government decision-makers. Include key findings, major impacts, and primary recommendation.`,
      
      proposed_changes: `${baseContext}\n\nDescribe the proposed policy changes in detail. List each change with its objectives and expected outcomes.`,
      
      impact_analysis: `${baseContext}\n\nProvide a comprehensive impact analysis covering: economic effects, environmental impacts, social equity considerations, and infrastructure requirements. Use specific metrics from the simulation.`,
      
      debate_summary: `${baseContext}\n\nSummarize the key arguments for and against the policy. Present both perspectives fairly and identify areas of consensus and conflict.`,
      
      risk_assessment: `${baseContext}\n\nAnalyze political, environmental, economic, and social risks. For each risk, provide likelihood, impact, and mitigation strategies.`,
      
      recommendations: `${baseContext}\n\nProvide actionable recommendations for implementation. Include timeline, priorities, stakeholder engagement strategies, and success metrics.`,
    };

    return prompts[sectionId] || `${baseContext}\n\nGenerate content for: ${sectionId}`;
  }

  private getSectionTitle(sectionId: string) {
    const titles: Record<string, string> = {
      executive_summary: 'Executive Summary',
      proposed_changes: 'Proposed Policy Changes',
      impact_analysis: 'Impact Analysis',
      debate_summary: 'Stakeholder Perspectives',
      risk_assessment: 'Risk Assessment',
      recommendations: 'Recommendations',
    };

    return titles[sectionId] || sectionId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  private async broadcast(type: string, data: any) {
    await broadcastToChannel(`report:${this.config.reportId}`, {
      type,
      agentType: 'aggregator',
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

