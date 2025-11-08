# URBAN Platform - Windows Setup Guide

## Prerequisites Installation

### Option 1: Docker Desktop (Easiest)

1. **Download Docker Desktop**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Run the installer
   - Restart your computer

2. **Start Docker Desktop**
   - Launch Docker Desktop from Start menu
   - Wait for Docker to start (you'll see the whale icon in system tray)

3. **Run Databases**
   ```powershell
   # PostgreSQL
   docker run -d --name urban-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=urban_db -p 5432:5432 postgres:14

   # Redis
   docker run -d --name urban-redis -p 6379:6379 redis:6
   ```

### Option 2: Install Locally (Windows)

#### PostgreSQL

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 14 or higher
   - Run the installer
   - Set password to: `postgres`
   - Keep default port: 5432

2. **Create Database**
   ```powershell
   # Open Command Prompt or PowerShell
   cd "C:\Program Files\PostgreSQL\14\bin"
   .\psql -U postgres
   # Enter password: postgres
   CREATE DATABASE urban_db;
   \q
   ```

#### Redis

1. **Download Redis for Windows**
   - Visit: https://github.com/microsoftarchive/redis/releases
   - Download: Redis-x64-3.0.504.msi
   - Run the installer
   - Keep default port: 6379

2. **Start Redis Service**
   ```powershell
   # Open PowerShell as Administrator
   redis-server
   ```

## Setup URBAN Platform

Once PostgreSQL and Redis are running:

### 1. Navigate to Project
```powershell
cd C:\Users\shryu\Downloads\Hackathons\URBN
```

### 2. Install Dependencies (Already Done!)
```powershell
npm install
```

### 3. Initialize Database
```powershell
npm run db:migrate
npm run db:seed
```

### 4. Start Application
```powershell
npm run dev
```

### 5. Open Browser
Visit: http://localhost:5173

## Troubleshooting

### "Port 5432 already in use"
PostgreSQL might already be running. Check:
```powershell
netstat -ano | findstr :5432
```

### "Port 6379 already in use"
Redis might already be running. Check:
```powershell
netstat -ano | findstr :6379
```

### "Database connection error"
Make sure PostgreSQL is running:
```powershell
# If using Docker
docker ps | findstr postgres

# If using local install
# Check Services: Win+R → services.msc → Look for PostgreSQL
```

### "Redis connection error"
Make sure Redis is running:
```powershell
# If using Docker
docker ps | findstr redis

# If using local install, start it
redis-server
```

## Quick Docker Commands

```powershell
# Check running containers
docker ps

# Start stopped containers
docker start urban-postgres
docker start urban-redis

# Stop containers
docker stop urban-postgres
docker stop urban-redis

# Remove containers (if you need to recreate them)
docker rm urban-postgres
docker rm urban-redis
```

## Alternative: Use Cloud Services

If you don't want to install locally:

### PostgreSQL
- **Supabase** (Free): https://supabase.com
- **Neon** (Free): https://neon.tech
- **ElephantSQL** (Free tier): https://www.elephantsql.com

### Redis
- **Upstash** (Free): https://upstash.com
- **Redis Cloud** (Free tier): https://redis.com/try-free/

Update your `.env` with the connection strings from these services.

## Next Steps

After setup is complete:

1. Open http://localhost:5173
2. Create a new project
3. Upload a policy PDF
4. Run a simulation
5. Watch the AI work in real-time!

## Need Help?

Check these files:
- **START_HERE.md** - Quick start guide
- **QUICKSTART.md** - Detailed setup
- **README.md** - Full documentation

Good luck! 🏙️


