# URBAN Platform - Quick Start Guide

Get the URBAN policy simulation platform running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This will install dependencies for both frontend and backend.

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

**Minimum required configuration:**

```env
# Required
GEMINI_API_KEY=your-gemini-key-here
MAPBOX_ACCESS_TOKEN=pk.your-token-here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/urban_db

# Optional (system will use mock data if not provided)
CENSUS_API_KEY=your-census-key
EPA_API_KEY=your-epa-key
HUD_API_KEY=your-hud-key
BTS_API_KEY=your-bts-key
```

### Get API Keys:

1. **Google Gemini** (Required, Free): https://makersuite.google.com/app/apikey
2. **Mapbox** (Required): https://account.mapbox.com/access-tokens/
3. **Census** (Optional, free): https://api.census.gov/data/key_signup.html

## Step 3: Start Database

### Option A: Using Docker (Recommended)

```bash
# PostgreSQL
docker run -d --name urban-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=urban_db \
  -p 5432:5432 \
  postgres:14

# Redis
docker run -d --name urban-redis \
  -p 6379:6379 \
  redis:6
```

### Option B: Local Installation

Install PostgreSQL and Redis locally and create the database:

```bash
createdb urban_db
```

## Step 4: Initialize Database

```bash
npm run db:migrate
npm run db:seed
```

This creates the database schema and adds sample agents.

## Step 5: Start the Application

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173).

## Step 6: Access the Platform

Open your browser to:

**http://localhost:5173**

You should see the URBAN dashboard!

---

## Your First Simulation

### 1. Create a Project

1. Go to the Dashboard
2. Click "New Project"
3. Enter:
   - Name: "Downtown Transit Development"
   - City: "San Francisco, CA"
4. Click "Create Project"

### 2. Upload a Policy Document

1. Open your project
2. Click "Upload Policy Document"
3. Upload a PDF containing policy proposals (or use a sample document)
4. The system will automatically extract policy actions

### 3. Run a Simulation

1. Click "New Simulation"
2. Select your policy document
3. Configure parameters:
   - Time Horizon: 10 years
   - Analysis Depth: Detailed
   - Layers: Traffic, Buildings, Housing
4. Click "Run Simulation"

Watch the real-time streaming output as the AI agent analyzes the policy!

### 4. Run a Debate

1. After simulation completes, go to "Debate" tab
2. Select your simulation
3. Set number of rounds: 3
4. Click "Start Debate"

Two AI agents will debate the policy from pro/con perspectives!

### 5. Generate a Report

1. Go to "Reports" tab
2. Select your project
3. Choose sections to include
4. Select format (PDF, PowerPoint, HTML, Markdown)
5. Click "Generate Report"

Watch as the report is compiled in real-time!

---

## Troubleshooting

### Port Already in Use

If port 5173 or 3001 is in use:

```bash
# Find and kill the process
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Or check local service
pg_isready
```

### Redis Connection Error

```bash
# Verify Redis is running
docker ps | grep redis

# Or check local service
redis-cli ping
```

### "Gemini API Key not found"

Make sure your `.env` file is in the root directory and contains:

```
GEMINI_API_KEY=AIza...
```

### Mapbox Map Not Loading

1. Verify your Mapbox token in `.env`:
   ```
   MAPBOX_ACCESS_TOKEN=pk....
   ```

2. Create a frontend `.env` file:
   ```bash
   echo "VITE_MAPBOX_TOKEN=pk.your-token-here" > frontend/.env
   ```

---

## Next Steps

### Explore Features

- **Dashboard**: Manage projects and agents
- **Simulation Canvas**: Interactive Mapbox visualization
- **Debate View**: AI-powered policy debates
- **Report Builder**: Generate professional reports
- **Streaming Console**: Watch real-time agent output

### Customize Agents

1. Go to Dashboard → Agents
2. Click "New Agent"
3. Choose agent type (Supervisor, Simulation, Debate, etc.)
4. Define role and scope
5. Assign to projects

### Real Data Integration

The platform integrates with:
- **US Census Bureau**: Demographics, housing, commute patterns
- **EPA**: Air quality and emissions data
- **HUD**: Housing affordability metrics
- **OpenStreetMap**: Buildings, land use, infrastructure
- **Mapbox**: Traffic flow, routing, geocoding

If API keys aren't provided, the system uses mock data so you can still explore functionality.

### Advanced Usage

See `DEPLOYMENT.md` for:
- Production deployment
- Performance optimization
- Security best practices
- Backup strategies

---

## Sample Data

The seed script creates:
- 5 AI agents (Supervisor, Simulation, Debate, Aggregator, Propaganda)
- 1 sample project ("Downtown Transit-Oriented Development")

You can modify `backend/src/db/seed.ts` to add your own sample data.

---

## Support

- **Documentation**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Issues**: Check GitHub issues or create a new one

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    URBAN Platform                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (React + TypeScript + Vite)                    │
│  ├─ Dashboard                                            │
│  ├─ Simulation Canvas (Mapbox GL JS)                     │
│  ├─ Debate View                                          │
│  ├─ Report Builder                                       │
│  └─ Streaming Console                                    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Backend (Node.js + TypeScript + Fastify)                │
│  ├─ REST API Endpoints                                   │
│  ├─ WebSocket Streaming                                  │
│  ├─ Multi-Agent System                                   │
│  │   ├─ Supervisor Agent                                 │
│  │   ├─ Simulation Agent                                 │
│  │   ├─ Debate Agent                                     │
│  │   ├─ Aggregator Agent                                 │
│  │   └─ Propaganda Agent                                 │
│  └─ Real Data Integration                                │
│      ├─ Census API                                       │
│      ├─ EPA API                                          │
│      ├─ HUD API                                          │
│      ├─ OpenStreetMap                                    │
│      └─ Mapbox API                                       │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Data Layer                                               │
│  ├─ PostgreSQL (Prisma ORM)                              │
│  └─ Redis (Streaming/Caching)                            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

Happy simulating! 🏙️🤖

