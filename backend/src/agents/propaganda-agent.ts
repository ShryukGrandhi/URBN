import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

interface PropagandaAgentConfig {
  reportContent: any;
  targetAudience: 'general_public' | 'stakeholders' | 'media' | 'legislators';
  tone: 'informative' | 'persuasive' | 'urgent';
}

export class PropagandaAgent {
  private config: PropagandaAgentConfig;

  constructor(config: PropagandaAgentConfig) {
    this.config = config;
  }

  async generatePressRelease() {
    const prompt = `Generate a professional press release based on this policy report:

${JSON.stringify(this.config.reportContent, null, 2)}

Target Audience: ${this.config.targetAudience}
Tone: ${this.config.tone}

Include:
- Compelling headline
- Lead paragraph with key facts
- Quotes from decision-makers
- Call to action
- Contact information placeholder`;

    return await this.generate(prompt);
  }

  async generateSocialMedia() {
    const prompt = `Create social media content based on this policy report:

${JSON.stringify(this.config.reportContent, null, 2)}

Generate:
1. Tweet thread (5-7 tweets, each under 280 characters)
2. LinkedIn post (professional, 300-500 words)
3. Instagram caption with hashtags
4. Facebook post (engaging, community-focused)

Use accessible language and compelling statistics.`;

    return await this.generate(prompt);
  }

  async generateTalkingPoints() {
    const prompt = `Create talking points for public officials based on this policy report:

${JSON.stringify(this.config.reportContent, null, 2)}

Generate:
- 5-7 key talking points (1-2 sentences each)
- Responses to common questions
- Soundbites for media (under 20 words each)
- Statistics to memorize

Make them clear, memorable, and defensible.`;

    return await this.generate(prompt);
  }

  async generateCommunityOutreach() {
    const prompt = `Create a community outreach plan based on this policy report:

${JSON.stringify(this.config.reportContent, null, 2)}

Include:
- Town hall presentation outline
- FAQ document (10-15 questions)
- Stakeholder engagement strategy
- Timeline for outreach activities
- Materials needed (flyers, presentations, etc.)`;

    return await this.generate(prompt);
  }

  private async generate(prompt: string) {
    try {
      const fullPrompt = `You are a strategic communications expert creating public-facing materials for government policy initiatives.\n\n${prompt}`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in propaganda agent:', error);
      throw error;
    }
  }
}

