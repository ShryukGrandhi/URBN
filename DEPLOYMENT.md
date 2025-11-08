# URBAN Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- API Keys (see below)

## Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd URBN
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required API keys:
- **Google Gemini API Key**: Get from https://makersuite.google.com/app/apikey (Free!)
- **Mapbox Access Token**: Get from https://account.mapbox.com/access-tokens/
- **Census API Key** (optional): Get from https://api.census.gov/data/key_signup.html
- **EPA API Key** (optional): Contact EPA for access
- **HUD API Key** (optional): Contact HUD for access

### 3. Database Setup

Start PostgreSQL and create the database:

```bash
createdb urban_db
```

Run migrations:

```bash
npm run db:migrate
```

Seed initial data:

```bash
npm run db:seed
```

### 4. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:6

# Or using Homebrew (Mac)
brew services start redis

# Or using apt (Linux)
sudo systemctl start redis
```

## Development

Start both frontend and backend in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- WebSocket: ws://localhost:3001/ws

## Production Deployment

### Build

```bash
npm run build
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY backend/dist ./backend/dist
COPY frontend/dist ./frontend/dist

EXPOSE 3001

CMD ["node", "backend/dist/index.js"]
```

Build and run:

```bash
docker build -t urban-platform .
docker run -p 3001:3001 --env-file .env urban-platform
```

### Environment Variables for Production

Set these in your production environment:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/urban_db
REDIS_URL=redis://redis-host:6379
GEMINI_API_KEY=AIza...
MAPBOX_ACCESS_TOKEN=pk....
CENSUS_API_KEY=...
EPA_API_KEY=...
HUD_API_KEY=...
BTS_API_KEY=...
CORS_ORIGIN=https://your-domain.com
```

### Hosting Options

#### 1. Railway.app
```bash
railway login
railway init
railway up
```

#### 2. Render.com
- Connect your GitHub repository
- Set up PostgreSQL and Redis add-ons
- Configure environment variables
- Deploy

#### 3. AWS
- Use EC2 for the Node.js app
- Use RDS for PostgreSQL
- Use ElastiCache for Redis
- Use CloudFront for CDN

#### 4. DigitalOcean
- App Platform for easy deployment
- Managed PostgreSQL
- Managed Redis

## Database Migrations

To create a new migration:

```bash
cd backend
npx prisma migrate dev --name migration_name
```

To apply migrations in production:

```bash
npx prisma migrate deploy
```

## Monitoring

### Logs

Backend logs are output to stdout. In production, pipe them to a log management service:

```bash
node backend/dist/index.js | pino-pretty
```

### Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d urban_db
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping
```

### WebSocket Issues

- Ensure your reverse proxy supports WebSocket (use `/ws` endpoint)
- Check CORS settings
- Verify firewall rules allow WebSocket connections

### API Key Issues

- Verify all required API keys are set in `.env`
- Test API keys individually
- Some services (EPA, HUD) have rate limits

## Security Best Practices

1. **Never commit `.env` files**
2. **Use environment-specific configurations**
3. **Enable HTTPS in production**
4. **Set up proper CORS origins**
5. **Use database connection pooling**
6. **Implement rate limiting**
7. **Regular security updates**: `npm audit fix`

## Performance Optimization

### Database
- Add indexes for frequently queried fields
- Use connection pooling
- Enable query logging to identify slow queries

### Redis
- Use for caching expensive operations
- Store session data
- Queue long-running tasks

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading for Mapbox tiles

## Backup Strategy

### Database Backups

```bash
# Daily backup
pg_dump urban_db > backup_$(date +%Y%m%d).sql

# Restore
psql urban_db < backup_20240101.sql
```

### File Uploads

Regularly backup the `uploads/` directory:

```bash
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

## Support

For issues or questions:
- Check the GitHub issues
- Review the API documentation
- Contact the development team

