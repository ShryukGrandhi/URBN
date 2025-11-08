#!/bin/bash

# URBAN Platform Setup Script
# This script automates the setup process

set -e

echo "🏙️  URBAN Platform Setup"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found locally${NC}"
    echo "Would you like to start PostgreSQL with Docker? (y/n)"
    read -r USE_DOCKER_POSTGRES
    
    if [ "$USE_DOCKER_POSTGRES" = "y" ]; then
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker is not installed${NC}"
            echo "Please install Docker from https://docker.com"
            exit 1
        fi
        
        echo "Starting PostgreSQL container..."
        docker run -d --name urban-postgres \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=urban_db \
            -p 5432:5432 \
            postgres:14
        
        echo -e "${GREEN}✓ PostgreSQL started in Docker${NC}"
        sleep 3
    else
        echo -e "${RED}❌ PostgreSQL is required${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ PostgreSQL found${NC}"
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis not found locally${NC}"
    echo "Would you like to start Redis with Docker? (y/n)"
    read -r USE_DOCKER_REDIS
    
    if [ "$USE_DOCKER_REDIS" = "y" ]; then
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker is not installed${NC}"
            exit 1
        fi
        
        echo "Starting Redis container..."
        docker run -d --name urban-redis \
            -p 6379:6379 \
            redis:6
        
        echo -e "${GREEN}✓ Redis started in Docker${NC}"
        sleep 2
    else
        echo -e "${RED}❌ Redis is required${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Redis found${NC}"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Set up environment variables
if [ ! -f .env ]; then
    echo ""
    echo "🔑 Setting up environment variables..."
    
    # Copy example env file
    cp .env.example .env 2>/dev/null || cat > .env << 'EOF'
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
CENSUS_API_KEY=your_census_api_key_here
EPA_API_KEY=your_epa_api_key_here
HUD_API_KEY=your_hud_api_key_here
BTS_API_KEY=your_bts_api_key_here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/urban_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=urban_db

# Server
BACKEND_PORT=3001
FRONTEND_PORT=5173
NODE_ENV=development

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:5173
EOF
    
    echo ""
    echo -e "${YELLOW}⚠️  Please add your API keys to the .env file:${NC}"
    echo ""
    echo "Required:"
    echo "  - GEMINI_API_KEY (get from: https://makersuite.google.com/app/apikey)"
    echo "  - MAPBOX_ACCESS_TOKEN (get from: https://account.mapbox.com/access-tokens/)"
    echo ""
    echo "Optional (system will use mock data if not provided):"
    echo "  - CENSUS_API_KEY (get from: https://api.census.gov/data/key_signup.html)"
    echo ""
    echo "Press Enter when you've added your API keys..."
    read -r
    
    # Also create frontend .env
    cat > frontend/.env << EOF
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_BASE_URL=http://localhost:3001
EOF
    
    echo -e "${YELLOW}⚠️  Also update frontend/.env with your Mapbox token${NC}"
    echo "Press Enter to continue..."
    read -r
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Initialize database
echo ""
echo "🗄️  Initializing database..."

# Test database connection
if PGPASSWORD=postgres psql -h localhost -U postgres -d urban_db -c '\q' 2>/dev/null; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo "Creating database..."
    PGPASSWORD=postgres createdb -h localhost -U postgres urban_db 2>/dev/null || true
fi

# Run migrations
echo "Running migrations..."
npm run db:migrate -- --name initial

echo -e "${GREEN}✓ Database initialized${NC}"

# Seed database
echo ""
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo -e "${GREEN}✓ Database seeded${NC}"

# Final instructions
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:5173"
echo ""
echo "For more information, see:"
echo "  - QUICKSTART.md - Quick start guide"
echo "  - README.md - Full documentation"
echo "  - API_DOCUMENTATION.md - API reference"
echo ""
echo "Happy simulating! 🏙️"

