# URBAN Platform API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API does not require authentication. In production, implement JWT or API key authentication.

---

## Endpoints

### Projects

#### List All Projects
```http
GET /api/projects
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Downtown Transit Development",
    "description": "Evaluate mixed-use development",
    "city": "San Francisco, CA",
    "region": "Bay Area",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "agents": 4,
      "policyDocs": 2,
      "simulations": 3,
      "reports": 1
    }
  }
]
```

#### Get Project
```http
GET /api/projects/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Downtown Transit Development",
  "agents": [...],
  "policyDocs": [...],
  "simulations": [...],
  "reports": [...]
}
```

#### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "Project Name",
  "description": "Optional description",
  "city": "City Name",
  "region": "Region Name"
}
```

#### Update Project
```http
PUT /api/projects/:id
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete Project
```http
DELETE /api/projects/:id
```

#### Add Agent to Project
```http
POST /api/projects/:id/agents
Content-Type: application/json

{
  "agentId": "agent-uuid"
}
```

---

### Agents

#### List All Agents
```http
GET /api/agents
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Urban Simulation Engine",
    "type": "SIMULATION",
    "role": "Simulate policy impacts",
    "scope": "Transportation",
    "sources": ["Census", "OSM"],
    "status": "ACTIVE",
    "_count": {
      "simulations": 5,
      "debates": 2
    }
  }
]
```

#### Get Agent
```http
GET /api/agents/:id
```

#### Create Agent
```http
POST /api/agents
Content-Type: application/json

{
  "name": "Agent Name",
  "type": "SIMULATION",
  "role": "Agent's role description",
  "scope": "Optional scope",
  "sources": ["Census", "EPA"]
}
```

**Agent Types:**
- `SUPERVISOR` - Strategic planning
- `SIMULATION` - Policy impact simulation
- `DEBATE` - Pro/con argument generation
- `AGGREGATOR` - Report compilation
- `PROPAGANDA` - Communications generation

#### Update Agent
```http
PUT /api/agents/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "INACTIVE"
}
```

#### Get Agent Statistics
```http
GET /api/agents/:id/stats
```

---

### Policy Documents

#### Upload Policy Document
```http
POST /api/upload?projectId=uuid
Content-Type: multipart/form-data

file: <PDF file>
```

**Response:**
```json
{
  "id": "uuid",
  "filename": "policy.pdf",
  "uploadedAt": "2024-01-01T00:00:00.000Z",
  "hasText": true,
  "hasActions": true,
  "actionCount": 5
}
```

#### Get Policy Document
```http
GET /api/upload/:id
```

#### List Project Documents
```http
GET /api/upload/project/:projectId
```

---

### Simulations

#### List Simulations
```http
GET /api/simulations?projectId=uuid
```

#### Get Simulation
```http
GET /api/simulations/:id
```

**Response:**
```json
{
  "id": "uuid",
  "city": "San Francisco, CA",
  "status": "COMPLETED",
  "parameters": {
    "timeHorizon": 10,
    "analysisDepth": "detailed",
    "focusAreas": ["traffic", "housing"]
  },
  "results": {...},
  "metrics": {
    "baseline": {...},
    "projected": {...},
    "changes": {...}
  },
  "startedAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:05:00.000Z"
}
```

#### Create and Run Simulation
```http
POST /api/simulations
Content-Type: application/json

{
  "projectId": "uuid",
  "agentId": "uuid",
  "policyDocId": "uuid",
  "city": "San Francisco, CA",
  "region": "Bay Area",
  "parameters": {
    "timeHorizon": 10,
    "focusAreas": ["traffic", "buildings"],
    "analysisDepth": "detailed"
  }
}
```

**Analysis Depth Options:**
- `basic` - Quick overview
- `detailed` - Comprehensive analysis (default)
- `comprehensive` - In-depth with all data sources

#### Stream Simulation Progress (SSE)
```http
GET /api/simulations/:id/stream
```

**Event Stream:**
```
data: {"type":"init","simulation":{...}}

data: {"type":"update","simulation":{...}}

data: {"type":"update","simulation":{...}}
```

#### Get Simulation Metrics
```http
GET /api/simulations/:id/metrics
```

#### Cancel Simulation
```http
POST /api/simulations/:id/cancel
```

---

### Debates

#### List Debates
```http
GET /api/debate?simulationId=uuid
```

#### Get Debate
```http
GET /api/debate/:id
```

**Response:**
```json
{
  "id": "uuid",
  "arguments": {
    "rounds": 3,
    "messages": [
      {
        "side": "pro",
        "round": 1,
        "content": "Argument text..."
      },
      {
        "side": "con",
        "round": 1,
        "content": "Counter-argument text..."
      }
    ]
  },
  "sentiment": {
    "pro": {
      "tone": "optimistic",
      "confidence": 0.75,
      "themes": ["economic growth", "opportunity"]
    },
    "con": {
      "tone": "cautious",
      "confidence": 0.70,
      "themes": ["environmental concern", "equity"]
    }
  },
  "riskScores": {
    "political": 0.65,
    "environmental": 0.55,
    "economic": 0.45,
    "social": 0.60
  }
}
```

#### Create and Run Debate
```http
POST /api/debate
Content-Type: application/json

{
  "simulationId": "uuid",
  "agentId": "uuid",
  "rounds": 3
}
```

#### Stream Debate Progress (SSE)
```http
GET /api/debate/:id/stream
```

---

### Reports

#### List Reports
```http
GET /api/reports?projectId=uuid
```

#### Get Report
```http
GET /api/reports/:id
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Policy Impact Report",
  "format": "PDF",
  "content": {
    "sections": [
      {
        "id": "executive_summary",
        "title": "Executive Summary",
        "content": "Markdown content..."
      }
    ]
  },
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Generate Report
```http
POST /api/reports
Content-Type: application/json

{
  "projectId": "uuid",
  "simulationId": "uuid",
  "title": "Report Title",
  "format": "PDF",
  "sections": [
    "executive_summary",
    "proposed_changes",
    "impact_analysis",
    "debate_summary",
    "risk_assessment",
    "recommendations"
  ]
}
```

**Format Options:**
- `PDF` - Portable Document Format
- `POWERPOINT` - Microsoft PowerPoint
- `HTML` - Web page
- `MARKDOWN` - Markdown document

**Available Sections:**
- `executive_summary` - High-level overview
- `proposed_changes` - Policy changes detail
- `impact_analysis` - Comprehensive impact analysis
- `debate_summary` - Stakeholder perspectives
- `risk_assessment` - Risk factors and mitigation
- `recommendations` - Actionable next steps

#### Stream Report Generation (SSE)
```http
GET /api/reports/:id/stream
```

---

## WebSocket API

### Connect

```javascript
const socket = io('ws://localhost:3001/ws', {
  transports: ['websocket']
});
```

### Subscribe to Channel

```javascript
socket.emit('message', {
  type: 'subscribe',
  payload: { channel: 'simulation:uuid' }
});
```

**Available Channels:**
- `simulation:id` - Simulation progress
- `debate:id` - Debate messages
- `report:id` - Report generation

### Message Types

**Token Stream:**
```json
{
  "type": "token",
  "agentType": "simulation",
  "data": { "token": "text..." }
}
```

**Progress Update:**
```json
{
  "type": "progress",
  "agentType": "simulation",
  "data": {
    "message": "Analyzing traffic patterns...",
    "progress": 45
  }
}
```

**Result:**
```json
{
  "type": "result",
  "agentType": "debate",
  "data": { ... }
}
```

**Completion:**
```json
{
  "type": "complete",
  "agentType": "aggregator",
  "data": {}
}
```

**Error:**
```json
{
  "type": "error",
  "agentType": "simulation",
  "data": { "error": "Error message" }
}
```

---

## Error Responses

All endpoints return standard HTTP error codes:

- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Format:**
```json
{
  "error": "Error message description"
}
```

---

## Rate Limits

Currently no rate limits are enforced. In production, implement rate limiting based on:
- IP address
- API key
- User account

Recommended limits:
- 100 requests per minute for standard endpoints
- 10 concurrent WebSocket connections per client

---

## Data Sources

The platform integrates with these real data sources:

### US Census Bureau
- **Endpoint**: `https://api.census.gov/data`
- **Data**: Demographics, housing, commute patterns
- **Update Frequency**: Annual
- **Key Required**: Yes (free)

### EPA Air Quality System
- **Endpoint**: `https://aqs.epa.gov/data/api`
- **Data**: Air quality, emissions
- **Update Frequency**: Real-time
- **Key Required**: Optional

### OpenStreetMap (Overpass API)
- **Endpoint**: `https://overpass-api.de/api/interpreter`
- **Data**: Buildings, roads, land use
- **Update Frequency**: Real-time
- **Key Required**: No

### Mapbox
- **Endpoint**: `https://api.mapbox.com`
- **Data**: Geocoding, traffic, routing, isochrones
- **Update Frequency**: Real-time
- **Key Required**: Yes

### HUD User API
- **Endpoint**: `https://www.huduser.gov/hudapi/public`
- **Data**: Fair market rents, income limits
- **Update Frequency**: Annual
- **Key Required**: Optional

---

## Example Workflows

### Complete Simulation Workflow

```javascript
// 1. Create project
const project = await fetch('/api/projects', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Transit Project',
    city: 'San Francisco, CA'
  })
});

// 2. Upload policy document
const formData = new FormData();
formData.append('file', pdfFile);
const doc = await fetch(`/api/upload?projectId=${project.id}`, {
  method: 'POST',
  body: formData
});

// 3. Run simulation
const simulation = await fetch('/api/simulations', {
  method: 'POST',
  body: JSON.stringify({
    projectId: project.id,
    agentId: simulationAgentId,
    policyDocId: doc.id,
    city: 'San Francisco, CA',
    parameters: {
      timeHorizon: 10,
      analysisDepth: 'detailed'
    }
  })
});

// 4. Subscribe to updates
const eventSource = new EventSource(
  `/api/simulations/${simulation.id}/stream`
);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

// 5. Run debate
const debate = await fetch('/api/debate', {
  method: 'POST',
  body: JSON.stringify({
    simulationId: simulation.id,
    agentId: debateAgentId,
    rounds: 3
  })
});

// 6. Generate report
const report = await fetch('/api/reports', {
  method: 'POST',
  body: JSON.stringify({
    projectId: project.id,
    simulationId: simulation.id,
    title: 'Policy Impact Report',
    format: 'PDF'
  })
});
```

---

## SDK (Coming Soon)

JavaScript/TypeScript SDK for easier integration:

```javascript
import { UrbanClient } from '@urban/sdk';

const client = new UrbanClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3001'
});

// Create project
const project = await client.projects.create({
  name: 'My Project',
  city: 'San Francisco, CA'
});

// Run simulation
const simulation = await client.simulations.create({
  projectId: project.id,
  city: 'San Francisco, CA'
});

// Stream updates
simulation.on('progress', (data) => {
  console.log(data);
});

await simulation.waitForCompletion();
```


