# URBAN: Government Policy Simulation Platform

A real-time, AI-powered platform for simulating and analyzing government policies using real urban data.

## Features

- 🗺️ **Real-time Mapbox Visualization** - Interactive maps with traffic, buildings, housing, emissions overlays
- 🤖 **Multi-Agent AI System** - Supervisor, Simulation, Debate, Aggregator, and Propaganda agents
- 📊 **Real Data Integration** - Census, EPA, HUD, OpenStreetMap, DOT data
- ⚡ **Live Streaming** - Token-by-token streaming of all agent outputs
- 📄 **Policy Analysis** - Upload PDFs and extract actionable policy changes
- 💬 **Debate Simulation** - Pro/con analysis with multiple perspectives
- 📋 **Report Generation** - Export to PDF and PowerPoint

## Architecture

```
urban-policy-platform/
├── frontend/          # React + TypeScript + Vite + TailwindCSS
├── backend/           # Node.js + TypeScript + Fastify
└── shared/            # Shared types and utilities
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Start PostgreSQL and Redis:**
```bash
# Using Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14
docker run -d -p 6379:6379 redis:6
```

4. **Run database migrations:**
```bash
npm run db:migrate
```

5. **Start development servers:**
```bash
npm run dev
```

The frontend will be available at http://localhost:5173
The backend will be available at http://localhost:3001

## API Keys Required

- **Google Gemini API Key** - For LLM agents (free from Google AI Studio)
- **Mapbox Access Token** - For mapping and traffic data
- **Census API Key** - For demographic data (free from census.gov)
- **EPA API Key** - For air quality data (optional)
- **HUD API Key** - For housing data (optional)
- **BTS API Key** - For transportation data (optional)

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- Mapbox GL JS
- Socket.IO Client
- React Query

### Backend
- Node.js + TypeScript
- Fastify
- PostgreSQL + Prisma
- Redis
- Socket.IO
- Google Generative AI SDK
- pdf-parse

## Project Structure

### Frontend
- `/src/pages` - Main application pages
- `/src/components` - Reusable UI components
- `/src/services` - API and data services
- `/src/hooks` - Custom React hooks
- `/src/stores` - State management

### Backend
- `/src/routes` - API endpoints
- `/src/services` - Business logic
- `/src/agents` - AI agent implementations
- `/src/data` - Real data integration layer
- `/src/db` - Database models and migrations
- `/src/streaming` - WebSocket handlers

## License

MIT

