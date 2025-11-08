// Quick test to verify Gemini API is working
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in environment');
  process.exit(1);
}

console.log('✅ Gemini API Key found:', apiKey.substring(0, 20) + '...');
console.log('🧪 Testing Gemini API...');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function test() {
  try {
    // First, list available models
    console.log('📋 Listing available models...');
    const models = await genAI.listModels();
    console.log('\nAvailable models:');
    for (const model of models) {
      console.log(`  - ${model.name}`);
    }
    
    // Try gemini-pro first
    console.log('\n🧪 Testing model...');
    const testModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await testModel.generateContent('Say "Hello from Gemini!" if you can read this.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API is working!');
    console.log('Response:', text);
    console.log('\n✅ All systems go! Simulations will work.');
  } catch (error: any) {
    console.error('❌ Gemini API test failed:', error.message);
    console.log('\nℹ️  This might be a model name issue. Checking available models...');
    
    try {
      const models = await genAI.listModels();
      console.log('\nAvailable models:');
      for (const model of models) {
        console.log(`  - ${model.name}`);
      }
    } catch (e) {
      console.error('Could not list models:', e);
    }
    
    process.exit(1);
  }
}

test();

