# 🏙️ URBAN Platform - Start Here!

Welcome to URBAN, your AI-powered policy simulation platform!

## 🚀 Quick Start (5 Minutes)

### 1. Get Your Free API Keys

**Required (both free!):**

1. **Google Gemini API** (Free, no credit card!)
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Click "Create API Key"
   - Copy your key (starts with `AIza...`)

2. **Mapbox Token** (Free tier available)
   - Visit: https://account.mapbox.com/access-tokens/
   - Sign up/Sign in
   - Copy your default public token (starts with `pk.`)

3. **US Census API** (Optional, Free)
   - Visit: https://api.census.gov/data/key_signup.html
   - Enter your org name and email
   - Check email for API key

### 2. Configure Environment

Edit the files with your API keys:

**File: `backend/.env`**
```env
GEMINI_API_KEY=AIzaSyDaS8rk8Yjkch6SH6q68v0rBXc9CTZtFuo
MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoic2hyeXVrZyIsImEiOiJjbWhxbWFzYW4wcGdkMmxxMm1ycGxzODR3In0.KzoImBHy8KS-tRDddiak7A
CENSUS_API_KEY=9295d7ce67bb1592828db3723cc61a106f815103
```

**File: `frontend/.env`**
```env
VITE_MAPBOX_TOKEN=pk.eyJ1Ijoic2hyeXVrZyIsImEiOiJjbWhxbWFzYW4wcGdkMmxxMm1ycGxzODR3In0.KzoImBHy8KS-tRDddiak7A
```

> ✅ **Good news!** Your keys are already configured in the files above!

### 3. Start Database (Docker)

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

**Don't have Docker?** Install from: https://www.docker.com/get-started

### 4. Install and Run

```bash
# Install dependencies
npm install

# Initialize database
npm run db:migrate
npm run db:seed

# Start the app
npm run dev
```

### 5. Open Browser

Visit: **http://localhost:5173**

You're ready! 🎉

## 📖 What to Do Next

### Create Your First Project

1. Click **"New Project"** on the Dashboard
2. Enter:
   - Name: "Downtown Transit Plan"
   - City: "San Francisco, CA"
3. Click **"Create Project"**

### Upload a Policy Document

1. Open your project
2. Click **"Upload Policy Document"**
3. Drop a PDF file (any policy document)
4. AI will automatically extract policy actions

### Run a Simulation

1. Click **"New Simulation"**
2. Select your policy document
3. Configure:
   - Time horizon: 10 years
   - Layers: Traffic, Buildings, Housing
4. Click **"Run Simulation"**
5. Watch real-time AI analysis on the map!

### Run a Debate

1. After simulation completes
2. Go to **"Debate"** tab
3. Set rounds: 3
4. Click **"Start Debate"**
5. Watch AI agents argue PRO vs CON!

### Generate a Report

1. Go to **"Reports"** tab
2. Select format: PDF
3. Choose sections to include
4. Click **"Generate Report"**
5. Watch it compile in real-time!

## 🎯 Key Features

- ✅ **Real Data** - Census, EPA, OpenStreetMap, Mapbox
- ✅ **AI Agents** - 5 specialized agents with streaming
- ✅ **Live Maps** - Interactive Mapbox with traffic data
- ✅ **Debates** - Pro/con analysis with risk scoring
- ✅ **Reports** - Export to PDF, PowerPoint, HTML

## 📚 Documentation

- **QUICKSTART.md** - Detailed setup guide
- **README.md** - Full feature documentation
- **API_DOCUMENTATION.md** - Complete API reference
- **GEMINI_MIGRATION.md** - Info about our AI provider

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
npx kill-port 5173 3001
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Restart if needed
docker restart urban-postgres
```

### Redis Connection Error
```bash
# Verify Redis is running
docker ps | grep redis

# Restart if needed
docker restart urban-redis
```

### "Gemini API Key not found"
Check that `backend/.env` has:
```
GEMINI_API_KEY=AIza...
```

### Mapbox Map Not Loading
Check that `frontend/.env` has:
```
VITE_MAPBOX_TOKEN=pk....
```

## 💡 Tips

1. **Start Small** - Try a simple simulation first
2. **Watch Console** - See live AI streaming in Console tab
3. **Explore Layers** - Toggle different map layers
4. **Try Debates** - Run multiple rounds for deeper analysis
5. **Export Reports** - Generate PDFs for stakeholders

## 🌟 What Makes URBAN Special

- **100% Real Data** - No mocks, actual Census/EPA/OSM data
- **Free AI** - Powered by Google Gemini (free tier!)
- **Live Streaming** - Watch AI think in real-time
- **Professional Output** - Export-ready reports
- **Interactive Maps** - Real traffic data on Mapbox

## 🚀 Ready to Build Better Cities?

Your environment is configured and ready to go!

```bash
npm run dev
```

Then visit: **http://localhost:5173**

---

**Questions?** Check the documentation or create an issue on GitHub.

**Have fun simulating policies! 🏙️✨**


