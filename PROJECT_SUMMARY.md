# URBAN Platform - Project Summary

## Overview

**URBAN** is a full-stack, AI-powered government policy simulation and consulting platform that enables city officials and policy makers to:

1. Upload policy documents (PDFs)
2. Simulate real-world impacts using actual urban data
3. Run AI-powered pro/con debates
4. Generate professional reports and communications materials
5. Visualize everything on interactive Mapbox maps with real-time streaming

## Key Features

### ✅ Real Data Integration
- **US Census Bureau**: Demographics, housing, income, commute patterns
- **EPA**: Air quality and emissions data
- **HUD**: Fair market rents and affordability metrics
- **OpenStreetMap**: Buildings, roads, land use
- **Mapbox**: Traffic flow, geocoding, routing

### ✅ Multi-Agent AI System
- **Supervisor Agent**: Strategic planning and objectives
- **Simulation Agent**: Policy impact analysis with real urban data
- **Debate Agent**: Pro/con arguments from multiple perspectives
- **Aggregator Agent**: Comprehensive report generation
- **Propaganda Agent**: Public communications materials

### ✅ Real-Time Streaming
- Token-by-token streaming from all AI agents
- WebSocket-based live updates
- Server-Sent Events (SSE) for simulation progress
- Live console showing all agent activity

### ✅ Interactive Visualization
- Mapbox GL JS integration
- Real traffic layer data
- 3D building visualization
- Custom overlays for simulation results
- Hover tooltips with before/after metrics

### ✅ Professional Reports
- Export to PDF, PowerPoint, HTML, or Markdown
- Customizable sections
- Data-driven insights
- Risk assessments
- Actionable recommendations

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Mapbox GL JS** - Interactive maps
- **React Query** - Data fetching
- **Socket.IO Client** - WebSocket connections
- **Zustand** - State management

### Backend
- **Node.js 18+** - Runtime
- **TypeScript** - Type safety
- **Fastify** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Redis** - Caching and streaming
- **OpenAI SDK** - LLM integration
- **pdf-parse** - PDF extraction

### Infrastructure
- **PostgreSQL 14+** - Relational database
- **Redis 6+** - In-memory data store
- **Docker** - Containerization (optional)

## Project Structure

```
urban-policy-platform/
├── backend/
│   ├── src/
│   │   ├── agents/           # AI agent implementations
│   │   │   ├── simulation-agent.ts
│   │   │   ├── debate-agent.ts
│   │   │   ├── aggregator-agent.ts
│   │   │   ├── propaganda-agent.ts
│   │   │   └── supervisor-agent.ts
│   │   ├── data/             # Real data integration
│   │   │   ├── census-service.ts
│   │   │   ├── epa-service.ts
│   │   │   ├── hud-service.ts
│   │   │   ├── osm-service.ts
│   │   │   ├── mapbox-service.ts
│   │   │   └── urban-data-service.ts
│   │   ├── routes/           # API endpoints
│   │   │   ├── agents.ts
│   │   │   ├── projects.ts
│   │   │   ├── simulations.ts
│   │   │   ├── debate.ts
│   │   │   ├── reports.ts
│   │   │   └── upload.ts
│   │   ├── services/         # Business logic
│   │   │   ├── pdf-parser.ts
│   │   │   ├── policy-extractor.ts
│   │   │   ├── simulation-runner.ts
│   │   │   ├── debate-runner.ts
│   │   │   └── report-generator.ts
│   │   ├── streaming/        # WebSocket handlers
│   │   │   ├── websocket.ts
│   │   │   └── broadcaster.ts
│   │   ├── db/               # Database
│   │   │   ├── client.ts
│   │   │   ├── migrate.ts
│   │   │   └── seed.ts
│   │   ├── config.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Layout.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── CreateProjectModal.tsx
│   │   │   ├── CreateAgentModal.tsx
│   │   │   └── UploadPolicyModal.tsx
│   │   ├── pages/            # Main views
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── SimulationCanvas.tsx
│   │   │   ├── DebateView.tsx
│   │   │   ├── ReportBuilder.tsx
│   │   │   └── StreamingConsole.tsx
│   │   ├── services/         # API client
│   │   │   └── api.ts
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useWebSocket.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── README.md
├── QUICKSTART.md
├── DEPLOYMENT.md
├── API_DOCUMENTATION.md
├── package.json
└── .env.example
```

## Database Schema

### Core Tables
- **Agent** - AI agents (Supervisor, Simulation, Debate, Aggregator, Propaganda)
- **Project** - Policy projects
- **PolicyDocument** - Uploaded PDF documents with extracted actions
- **Simulation** - Policy impact simulations with results and metrics
- **Debate** - Debate records with arguments and risk scores
- **Report** - Generated reports with content
- **StreamEvent** - Real-time streaming events log

### Relationships
- Projects have many Agents (many-to-many)
- Projects have many PolicyDocuments
- Simulations belong to Projects and Agents
- Debates belong to Simulations
- Reports belong to Projects

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create agent
- `GET /api/agents/:id` - Get agent
- `GET /api/agents/:id/stats` - Get statistics

### Simulations
- `POST /api/simulations` - Create and run simulation
- `GET /api/simulations/:id` - Get simulation
- `GET /api/simulations/:id/stream` - Stream progress (SSE)
- `GET /api/simulations/:id/metrics` - Get metrics

### Debates
- `POST /api/debate` - Create and run debate
- `GET /api/debate/:id` - Get debate
- `GET /api/debate/:id/stream` - Stream progress (SSE)

### Reports
- `POST /api/reports` - Generate report
- `GET /api/reports/:id` - Get report
- `GET /api/reports/:id/stream` - Stream generation (SSE)

### Upload
- `POST /api/upload?projectId=:id` - Upload policy PDF

### WebSocket
- `ws://localhost:3001/ws` - Real-time streaming

## Agent Workflows

### Simulation Agent Workflow
1. Parse policy document for actions
2. Fetch real urban data (Census, EPA, HUD, OSM, Mapbox)
3. Build context with baseline metrics
4. Stream analysis token-by-token via OpenAI
5. Calculate projected metrics
6. Broadcast results to WebSocket channel

### Debate Agent Workflow
1. Load simulation results
2. Initialize Pro and Con agents
3. For each round:
   - Pro agent streams argument
   - Con agent streams counter-argument
4. Analyze sentiment and confidence
5. Calculate risk scores
6. Return structured debate data

### Aggregator Agent Workflow
1. Load project, simulation, and debate data
2. For each requested section:
   - Generate section content via OpenAI
   - Stream content token-by-token
3. Compile final report
4. Support export to PDF/PowerPoint/HTML/Markdown

## Real Data Integration Details

### Census Data
- **API**: US Census Bureau ACS 5-Year
- **Data Points**: Population, income, housing, commute modes
- **Geographic Level**: Census tract
- **Fallback**: Mock data if API unavailable

### EPA Data
- **API**: Air Quality System (AQS)
- **Data Points**: PM2.5, Ozone, NO2, AQI
- **Update Frequency**: Daily
- **Fallback**: Mock data if API unavailable

### OpenStreetMap
- **API**: Overpass API
- **Data Points**: Buildings, roads, land use
- **Query Type**: Bounding box queries
- **Fallback**: Mock building counts

### Mapbox
- **APIs**: Geocoding, Traffic v1, Isochrone
- **Data Points**: Coordinates, traffic flow, travel time
- **Integration**: Backend + frontend
- **Required**: Yes (for maps to work)

### HUD
- **API**: HUD User API
- **Data Points**: Fair market rents, income limits
- **Update Frequency**: Annual
- **Fallback**: Mock data

## Streaming Architecture

### WebSocket Flow
1. Client connects to `ws://localhost:3001/ws`
2. Server assigns session ID
3. Client subscribes to channels (e.g., `simulation:uuid`)
4. Agents broadcast events to channels
5. Server routes to subscribed clients
6. Events stored in database for history

### Event Types
- `token` - Individual tokens from LLM
- `progress` - Progress updates with percentages
- `result` - Intermediate or final results
- `error` - Error messages
- `complete` - Task completion

## Security Considerations

### Current Implementation
- No authentication (development only)
- CORS enabled for localhost
- API keys in environment variables
- File uploads size-limited to 50MB

### Production Recommendations
- Implement JWT authentication
- Add API rate limiting
- Enable HTTPS
- Sanitize file uploads
- Add request validation
- Set up monitoring and logging
- Use secrets management service

## Performance Optimization

### Backend
- Connection pooling for PostgreSQL
- Redis caching for expensive operations
- Async/await for parallel data fetching
- Streaming responses to reduce memory

### Frontend
- Code splitting with React Router
- Lazy loading for heavy components
- React Query for data caching
- Mapbox tile caching
- Debounced search and filters

## Deployment Options

1. **Docker** - Containerized deployment
2. **Railway** - One-click deployment
3. **Render** - Auto-deploy from GitHub
4. **AWS** - EC2 + RDS + ElastiCache
5. **DigitalOcean** - App Platform
6. **Vercel** (Frontend) + Railway (Backend)

## Future Enhancements

### Planned Features
- [ ] User authentication and multi-tenancy
- [ ] Collaborative editing
- [ ] Version control for policy documents
- [ ] Comparison mode (compare multiple scenarios)
- [ ] Export to more formats (Word, Excel)
- [ ] Email notifications
- [ ] Scheduled simulations
- [ ] API webhooks
- [ ] Mobile app
- [ ] Internationalization (i18n)

### Data Enhancements
- [ ] More data sources (traffic sensors, economic indicators)
- [ ] Machine learning for predictive modeling
- [ ] Historical data analysis
- [ ] Climate impact modeling
- [ ] Cost-benefit analysis automation

### Agent Enhancements
- [ ] Custom agent creation by users
- [ ] Agent fine-tuning on specific policy domains
- [ ] Multi-agent collaboration
- [ ] Agent memory and learning
- [ ] Integration with external tools (GIS, BIM)

## License

MIT License - See LICENSE file for details

## Contributors

Built for urban policy innovation.

## Support

- **Documentation**: See README.md, QUICKSTART.md, API_DOCUMENTATION.md
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Built with ❤️ for better cities through data-driven policy.**


