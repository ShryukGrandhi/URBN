# Using Cloud Databases (No Docker Needed!)

If you don't want to install Docker, you can use **free** cloud services for PostgreSQL and Redis.

## 🚀 Quick Setup (15 minutes)

### Step 1: PostgreSQL - Use Supabase (Free)

1. **Sign up**: https://supabase.com
2. **Create a new project**:
   - Enter project name: `urban-platform`
   - Enter database password (save this!)
   - Choose region closest to you
   - Click "Create new project"
3. **Get connection string**:
   - Go to Settings → Database
   - Find "Connection string" → "URI"
   - Copy the connection string (looks like: `postgresql://postgres:password@host.supabase.co:5432/postgres`)
4. **Update backend/.env**:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
   ```

### Step 2: Redis - Use Upstash (Free)

1. **Sign up**: https://upstash.com
2. **Create database**:
   - Click "Create Database"
   - Name: `urban-redis`
   - Choose region closest to you
   - Click "Create"
3. **Get connection string**:
   - Click on your database
   - Copy "Redis URL" (looks like: `redis://default:password@host.upstash.io:port`)
4. **Update backend/.env**:
   ```env
   REDIS_URL=redis://default:[YOUR-PASSWORD]@host.upstash.io:12345
   ```

### Step 3: Run Database Migrations

```powershell
npm run db:migrate
npm run db:seed
```

### Step 4: Start the Application

```powershell
npm run dev
```

### Step 5: Open Browser

Visit: http://localhost:5173

---

## ✅ Advantages of Cloud Databases

- ✅ **No local installation** - Works immediately
- ✅ **Always available** - No need to start/stop containers
- ✅ **Free tier** - More than enough for development
- ✅ **Automatic backups** - Your data is safe
- ✅ **Better performance** - Professional hosting

---

## 📝 Example .env Configuration

After setting up Supabase and Upstash, your `backend/.env` should look like:

```env
# API Keys (Already configured)
GEMINI_API_KEY=AIzaSyDaS8rk8Yjkch6SH6q68v0rBXc9CTZtFuo
MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoic2hyeXVrZyIsImEiOiJjbWhxbWFzYW4wcGdkMmxxMm1ycGxzODR3In0.KzoImBHy8KS-tRDddiak7A
CENSUS_API_KEY=9295d7ce67bb1592828db3723cc61a106f815103

# Cloud Database URLs (Update these)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
REDIS_URL=redis://default:YOUR_PASSWORD@host.upstash.io:12345

# Server
BACKEND_PORT=3001
FRONTEND_PORT=5173
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 🆘 Troubleshooting

### "Connection timeout" or "Can't connect to database"

**For Supabase:**
- Make sure you're using the correct connection string
- Check that your password doesn't have special characters (use a simple one)
- Try the "Connection Pooling" URL instead of direct connection

**For Upstash:**
- Make sure you're using the full Redis URL with password
- Check that the port is included (usually 6379 or custom)

### "SSL required"

Add `?sslmode=require` to your DATABASE_URL:

```env
DATABASE_URL=postgresql://postgres:password@host.supabase.co:5432/postgres?sslmode=require
```

### "Too many connections"

Supabase free tier has connection limits. Use connection pooling URL instead:
- Go to Settings → Database → Connection Pooling
- Use that URL instead

---

## 🎯 Next Steps

After your cloud databases are set up:

1. ✅ Update `backend/.env` with your database URLs
2. ✅ Run migrations: `npm run db:migrate`
3. ✅ Seed data: `npm run db:seed`
4. ✅ Start app: `npm run dev`
5. ✅ Open: http://localhost:5173

---

## 💡 Pro Tip

You can use both approaches:
- **Cloud databases** for development (no Docker needed)
- **Local Docker** for testing (faster, no internet needed)

Just swap the connection strings in your `.env` file!

---

## 📚 More Free Alternatives

### PostgreSQL:
- **Neon**: https://neon.tech (Serverless Postgres)
- **ElephantSQL**: https://www.elephantsql.com (20MB free)
- **Railway**: https://railway.app (Free tier)

### Redis:
- **Redis Cloud**: https://redis.com/try-free/ (30MB free)
- **Railway**: https://railway.app (Redis available)

All of these work great with URBAN platform!

---

**Ready to simulate policies without Docker? Sign up for Supabase and Upstash now! 🚀**


