import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

export interface PolicyAction {
  type: string;
  description: string;
  targetArea?: string;
  parameters: Record<string, any>;
  impacts: string[];
}

export async function extractPolicyActions(policyText: string): Promise<{ actions: PolicyAction[] }> {
  const prompt = `You are a policy analysis expert. Extract all actionable policy changes from the following document.

For each action, identify:
1. Type (e.g., "zoning_change", "infrastructure_addition", "regulation_update", "funding_allocation")
2. Description (clear summary of the action)
3. Target area (geographic location if specified)
4. Parameters (specific values like "increase height limit to 150ft", "add 2 BRT lanes", etc.)
5. Expected impacts (economic, environmental, social)

Return a JSON object with an "actions" array.

Policy Document:
${policyText.slice(0, 8000)}

Return ONLY valid JSON, no additional text.`;

  try {
    const fullPrompt = `You are a policy analysis expert that extracts structured data from policy documents. Always respond with valid JSON.\n\n${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON from response (Gemini sometimes wraps it in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;
    
    const parsed = JSON.parse(jsonContent);
    return parsed;
  } catch (error) {
    console.error('Error extracting policy actions:', error);
    return { actions: [] };
  }
}

