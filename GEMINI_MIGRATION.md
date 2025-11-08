# Migration from OpenAI to Google Gemini

This project has been updated to use **Google Gemini** instead of OpenAI for all AI agent operations.

## Why Gemini?

- ✅ **Free API Access** - Generous free tier for development
- ✅ **Fast Response Times** - Excellent performance
- ✅ **Streaming Support** - Token-by-token streaming
- ✅ **Multimodal** - Text and image capabilities
- ✅ **No Credit Card Required** - Start using immediately

## Changes Made

### 1. Package Dependencies

**Removed:**
```json
"openai": "^4.28.0"
```

**Added:**
```json
"@google/generative-ai": "^0.1.3"
```

### 2. Environment Variables

**Old:**
```env
OPENAI_API_KEY=sk-...
```

**New:**
```env
GEMINI_API_KEY=AIza...
```

### 3. Agent Updates

All agents have been updated to use Gemini:
- `simulation-agent.ts` - Policy impact analysis
- `debate-agent.ts` - Pro/con debate generation
- `aggregator-agent.ts` - Report compilation
- `propaganda-agent.ts` - Communications materials
- `supervisor-agent.ts` - Strategic planning
- `policy-extractor.ts` - PDF policy extraction

### 4. Model Used

**Gemini Pro** - Google's flagship model for text generation
- Fast and efficient
- Strong reasoning capabilities
- JSON mode support
- Streaming support

## Getting Your Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your key (starts with `AIza...`)
5. Add to your `.env` file

**It's completely free!** No credit card required.

## API Comparison

### OpenAI (Previous)
```typescript
const openai = new OpenAI({ apiKey: config.apiKeys.openai });

const stream = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [...],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
}
```

### Gemini (Current)
```typescript
const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContentStream(prompt);

for await (const chunk of result.stream) {
  const content = chunk.text();
}
```

## Features Maintained

All features continue to work exactly the same:

✅ Token-by-token streaming
✅ Real-time WebSocket broadcasting
✅ JSON extraction from responses
✅ Policy analysis
✅ Debate simulation
✅ Report generation
✅ Communications materials

## Performance

Gemini Pro offers:
- **Fast inference** - Similar to GPT-4
- **High quality** - Excellent reasoning and analysis
- **Reliable streaming** - Smooth token delivery
- **Large context window** - Up to 32k tokens

## Cost Savings

### OpenAI GPT-4 Pricing:
- $10 per 1M input tokens
- $30 per 1M output tokens

### Gemini Pro Pricing:
- **FREE** for first 60 requests per minute
- $0.00025 per 1K characters (paid tier)

For a typical URBAN simulation:
- **With OpenAI**: ~$0.50 per simulation
- **With Gemini**: **FREE** (within free tier)

## Limitations

Gemini has some minor differences:

1. **JSON Mode** - Not as strict as OpenAI; we extract JSON using regex
2. **System Messages** - No separate system role; we combine into prompt
3. **Temperature** - Different scale; we use default settings

All these are handled automatically in the code.

## Migration Steps (Already Done)

If you're updating an existing installation:

1. ✅ Update `package.json` to use `@google/generative-ai`
2. ✅ Update environment variables
3. ✅ Update all agent files
4. ✅ Update configuration
5. ✅ Test all streaming endpoints

## Testing

Test your Gemini integration:

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Start the app
npm run dev
```

Try running a simulation - you should see streaming working perfectly with Gemini!

## Troubleshooting

### "API key not found"
Make sure `GEMINI_API_KEY` is set in your `.env` file.

### "Invalid API key"
Verify your key starts with `AIza` and is from https://makersuite.google.com/app/apikey

### "Quota exceeded"
Gemini free tier: 60 requests/minute. Upgrade or wait a minute.

### "JSON parsing error"
Our regex extraction handles most cases. If issues persist, check the response format.

## Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Get API Key**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Models**: https://ai.google.dev/models/gemini

## Support

The migration is complete and tested. All features work as expected with Gemini!

If you encounter any issues, check:
1. API key is valid
2. Dependencies are installed (`npm install`)
3. Environment variables are set correctly

---

**Enjoy free, powerful AI with Google Gemini! 🚀**


