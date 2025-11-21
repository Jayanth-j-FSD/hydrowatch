
checklist of required services and tools:

## Required services and tools

### Core services (run via Docker)

1. PostgreSQL 15+ with TimescaleDB
   - Purpose: Primary database (relational + time-series)
   - Port: 5432
   - Docker image: `timescale/timescaledb:latest-pg15`
   - Container name: `hydrowatch-postgres`
   - Database: `hydrowatch_dev`
   - User: `hydrowatch`
   - Password: `dev_password` (change in production)
   - Required: Yes — core database

2. Redis 7+
   - Purpose: Job queue (BullMQ), caching
   - Port: 6379
   - Docker image: `redis:7-alpine`
   - Container name: `hydrowatch-redis`
   - Required: Yes — for background jobs and caching

### Development tools (install locally)

3. Node.js 20+ LTS
   - Purpose: Runtime for backend and frontend
   - Required: Yes
   - Verify: `node --version` (should show v20.x.x or higher)

4. npm (comes with Node.js)
   - Purpose: Package manager
   - Required: Yes
   - Verify: `npm --version` (should show 10.x.x or higher)

5. Docker & Docker Compose
   - Purpose: Run PostgreSQL and Redis in containers
   - Required: Yes
   - Verify: 
     - `docker --version` (Docker 20+)
     - `docker-compose --version` (Docker Compose 2+)

6. Git (optional but recommended)
   - Purpose: Version control
   - Verify: `git --version`

### Optional services (for full production features)

7. External API keys (not required for initial setup)
   - India-WRIS API: River, dam, groundwater data
   - IMD API: Rainfall data
   - OpenWeatherMap API: Weather/rainfall data
   - NASA IMERG API: Satellite rainfall data

8. Email service (not required for development)
   - SendGrid, AWS SES, or SMTP server
   - For email notifications

9. SMS service (not required for development)
   - Twilio or AWS SNS
   - For SMS notifications

---

## Verification checklist

### Step 1: Verify Node.js & npm
```bash
node --version
npm --version
```
Expected: Node.js v20.x.x, npm 10.x.x

### Step 2: Verify Docker
```bash
docker --version
docker-compose --version
docker ps
```
Expected: Docker 20+, Docker Compose 2+, list of containers (or empty)

### Step 3: Check port availability
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000,3001,5432,6379 -ErrorAction SilentlyContinue

# Linux/Mac
lsof -i :3000 -i :3001 -i :5432 -i :6379
```
Expected: Ports should be free (or show Docker containers using 5432/6379)

### Step 4: Start Docker services
```bash
# From project root
docker-compose up -d

# Verify containers are running
docker ps
```
Expected: Should see `hydrowatch-postgres` and `hydrowatch-redis` containers

### Step 5: Verify PostgreSQL
```bash
# Test connection
docker exec -it hydrowatch-postgres psql -U hydrowatch -d hydrowatch_dev -c "SELECT version();"
```
Expected: PostgreSQL version information

### Step 6: Enable TimescaleDB extension
```bash
docker exec -it hydrowatch-postgres psql -U hydrowatch -d hydrowatch_dev -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```
Expected: `CREATE EXTENSION`

### Step 7: Verify Redis
```bash
# Test connection
docker exec -it hydrowatch-redis redis-cli ping
```
Expected: `PONG`

---

## Summary

### Must install locally
1. Node.js 20+ LTS (includes npm)
2. Docker Desktop (includes Docker Compose)
3. Git (optional)

### Will run in Docker (no local install needed)
1. PostgreSQL 15 + TimescaleDB
2. Redis 7

### Ports used
- 3000: Frontend (Next.js)
- 3001: Backend (NestJS)
- 5432: PostgreSQL
- 6379: Redis

---

## Quick verification script

For Windows PowerShell, create `verify-setup.ps1`:

```powershell
Write-Host "=== HydroWatch Setup Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js: NOT FOUND" -ForegroundColor Red
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm: NOT FOUND" -ForegroundColor Red
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker: NOT FOUND" -ForegroundColor Red
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose: NOT FOUND" -ForegroundColor Red
}

# Check Docker containers
Write-Host ""
Write-Host "Docker Containers:" -ForegroundColor Cyan
$containers = docker ps --format "{{.Names}}"
if ($containers -match "hydrowatch-postgres") {
    Write-Host "✓ PostgreSQL container is running" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL container not running (start with: docker-compose up -d)" -ForegroundColor Yellow
}

if ($containers -match "hydrowatch-redis") {
    Write-Host "✓ Redis container is running" -ForegroundColor Green
} else {
    Write-Host "⚠ Redis container not running (start with: docker-compose up -d)" -ForegroundColor Yellow
}
```

Run it with: `powershell -ExecutionPolicy Bypass -File verify-setup.ps1`

---

## Next steps after verification

1. Create `backend/.env` with database and Redis URLs
2. Create `frontend/.env.local` with API URLs
3. Start Docker: `docker-compose up -d`
4. Enable TimescaleDB: Run the CREATE EXTENSION command
5. Run migrations: `cd backend && npx prisma migrate dev`
6. Install dependencies: `npm install` in both folders
7. Start servers: Backend on 3001, Frontend on 3000

Should I create the verification scripts or help with any specific installation step?



<!-- =------------------------------------------
 -->


 Checking which environment variables are used in the codebase:


[6 tools called]


Here are the required environment variables for each file:

## Environment variables required

### Backend (`backend/.env`)

#### Required (must have)

1. `DATABASE_URL`
   - Purpose: PostgreSQL connection string
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://hydrowatch:dev_password@localhost:5432/hydrowatch_dev`
   - Required: Yes

2. `JWT_SECRET`
   - Purpose: Secret key for JWT access tokens
   - Length: Minimum 32 characters
   - Example: `development_secret_key_min_32_characters_long_change_this`
   - Required: Yes

3. `JWT_REFRESH_SECRET`
   - Purpose: Secret key for JWT refresh tokens
   - Length: Minimum 32 characters
   - Example: `development_refresh_secret_min_32_characters_long`
   - Required: Yes

#### Optional (have defaults)

4. `NODE_ENV`
   - Purpose: Environment mode
   - Default: `development`
   - Options: `development`, `production`, `test`
   - Example: `NODE_ENV=development`

5. `PORT`
   - Purpose: Backend server port
   - Default: `3001`
   - Example: `PORT=3001`

6. `REDIS_URL`
   - Purpose: Redis connection string (if using URL format)
   - Default: `redis://localhost:6379`
   - Example: `redis://localhost:6379`
   - Note: Can use `REDIS_HOST` and `REDIS_PORT` instead

7. `REDIS_HOST`
   - Purpose: Redis host
   - Default: `localhost`
   - Example: `REDIS_HOST=localhost`

8. `REDIS_PORT`
   - Purpose: Redis port
   - Default: `6379`
   - Example: `REDIS_PORT=6379`

9. `JWT_EXPIRES_IN`
   - Purpose: Access token expiration time
   - Default: `24h`
   - Example: `JWT_EXPIRES_IN=24h`

10. `JWT_REFRESH_EXPIRES_IN`
    - Purpose: Refresh token expiration time
    - Default: `7d`
    - Example: `JWT_REFRESH_EXPIRES_IN=7d`

11. `FRONTEND_URL`
    - Purpose: Frontend URL for CORS and WebSocket
    - Default: `http://localhost:3000`
    - Example: `FRONTEND_URL=http://localhost:3000`

---

### Frontend (`frontend/.env.local`)

#### Required (must have)

1. `NEXT_PUBLIC_API_URL`
   - Purpose: Backend API base URL
   - Format: `http://host:port/api/v1`
   - Example: `http://localhost:3001/api/v1`
   - Required: Yes
   - Note: Must start with `NEXT_PUBLIC_` to be accessible in browser

2. `NEXT_PUBLIC_WS_URL`
   - Purpose: WebSocket server URL
   - Format: `ws://host:port` or `wss://host:port` (for HTTPS)
   - Example: `ws://localhost:3001`
   - Required: Yes
   - Note: Must start with `NEXT_PUBLIC_` to be accessible in browser

---

## Complete .env file templates

### `backend/.env` (complete template)

```env
# ============================================
# Application Configuration
# ============================================
NODE_ENV=development
PORT=3001

# ============================================
# Database Configuration
# ============================================
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://hydrowatch:dev_password@localhost:5432/hydrowatch_dev

# ============================================
# Redis Configuration
# ============================================
# Option 1: Using URL format
REDIS_URL=redis://localhost:6379

# Option 2: Using host and port (alternative to REDIS_URL)
# REDIS_HOST=localhost
# REDIS_PORT=6379

# ============================================
# JWT Configuration
# ============================================
# IMPORTANT: Use strong secrets in production (minimum 32 characters)
# Generate strong secrets: openssl rand -base64 32
JWT_SECRET=development_secret_key_min_32_characters_long_change_this
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=development_refresh_secret_min_32_characters_long
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# CORS & Frontend Configuration
# ============================================
FRONTEND_URL=http://localhost:3000

# ============================================
# External API Keys (Optional - for production)
# ============================================
# INDIA_WRIS_API_KEY=your_api_key_here
# IMD_API_KEY=your_api_key_here
# OPENWEATHER_API_KEY=your_api_key_here
# NASA_API_KEY=your_api_key_here

# ============================================
# Email Service (Optional - for production)
# ============================================
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=your_sendgrid_api_key
# SMTP_FROM=noreply@hydrowatch.com

# ============================================
# SMS Service (Optional - for production)
# ============================================
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890
```

---

### `frontend/.env.local` (complete template)

```env
# ============================================
# API Configuration
# ============================================
# Backend API base URL
# Must start with NEXT_PUBLIC_ to be accessible in browser
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# ============================================
# WebSocket Configuration
# ============================================
# WebSocket server URL
# Use ws:// for HTTP, wss:// for HTTPS
# Must start with NEXT_PUBLIC_ to be accessible in browser
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## Minimum required setup

### Backend `.env` (minimum required)

```env
DATABASE_URL=postgresql://hydrowatch:dev_password@localhost:5432/hydrowatch_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=development_secret_key_min_32_characters_long_change_this
JWT_REFRESH_SECRET=development_refresh_secret_min_32_characters_long
```

### Frontend `.env.local` (minimum required)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## Variable descriptions

### Backend variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | ✅ Yes | None | PostgreSQL connection string |
| `JWT_SECRET` | ✅ Yes | None | JWT access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ Yes | None | JWT refresh token secret (min 32 chars) |
| `NODE_ENV` | ⚠️ Optional | `development` | Environment mode |
| `PORT` | ⚠️ Optional | `3001` | Backend server port |
| `REDIS_URL` | ⚠️ Optional | `redis://localhost:6379` | Redis connection URL |
| `REDIS_HOST` | ⚠️ Optional | `localhost` | Redis host (alternative to REDIS_URL) |
| `REDIS_PORT` | ⚠️ Optional | `6379` | Redis port (alternative to REDIS_URL) |
| `JWT_EXPIRES_IN` | ⚠️ Optional | `24h` | Access token expiration |
| `JWT_REFRESH_EXPIRES_IN` | ⚠️ Optional | `7d` | Refresh token expiration |
| `FRONTEND_URL` | ⚠️ Optional | `http://localhost:3000` | Frontend URL for CORS |

### Frontend variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | None | Backend API base URL |
| `NEXT_PUBLIC_WS_URL` | ✅ Yes | None | WebSocket server URL |

---

## Quick setup commands

### Create backend `.env`:
```bash
cd backend
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://hydrowatch:dev_password@localhost:5432/hydrowatch_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=development_secret_key_min_32_characters_long_change_this
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=development_refresh_secret_min_32_characters_long
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
EOF
```

### Create frontend `.env.local`:
```bash
cd frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOF
```

---

## Security notes

1. JWT secrets: Use strong, random secrets in production (minimum 32 characters)
   - Generate: `openssl rand -base64 32`
2. Database password: Change `dev_password` in production
3. Never commit `.env` files to Git (already in `.gitignore`)
4. Use different secrets for development and production

---

## Verification

After creating the files, verify they're correct:

```bash
# Check backend .env
cd backend
cat .env

# Check frontend .env.local
cd ../frontend
cat .env.local
```

These are the required environment variables. Create the files with these values to start the application.



Checking the setup and preparing step-by-step instructions to start the app:


[4 tools called]


## How to start the HydroWatch app

### Prerequisites check

Verify these are installed:
```bash
node --version    # Should be v20.x.x or higher
npm --version     # Should be 10.x.x or higher
docker --version  # Should be 20.x.x or higher
docker-compose --version  # Should be 2.x.x or higher
```

---

## Step-by-step startup guide

### Step 1: Create environment files

**Backend environment file** (`backend/.env`):
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://hydrowatch:dev_password@localhost:5432/hydrowatch_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=development_secret_key_min_32_characters_long_change_this
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=development_refresh_secret_min_32_characters_long
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**Frontend environment file** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

### Step 2: Start Docker services

From the project root:
```bash
docker-compose up -d
```

This starts:
- PostgreSQL + TimescaleDB on port 5432
- Redis on port 6379

Verify containers are running:
```bash
docker ps
```
You should see `hydrowatch-postgres` and `hydrowatch-redis`.

---

### Step 3: Enable TimescaleDB extension

```bash
docker exec -it hydrowatch-postgres psql -U hydrowatch -d hydrowatch_dev -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

Expected output: `CREATE EXTENSION`

---

### Step 4: Set up the database

```bash
cd backend

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

### Step 5: Install dependencies (if not already done)

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### Step 6: Start the backend server

Open Terminal 1:
```bash
cd backend
npm run start:dev
```

Expected output:
```
Application is running on: http://localhost:3001
Swagger documentation: http://localhost:3001/api/docs
```

---

### Step 7: Start the frontend server

Open Terminal 2:
```bash
cd frontend
npm run dev
```

Expected output:
```
- Local:        http://localhost:3000
```

---

## Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger Docs: http://localhost:3001/api/docs
- Health Check: http://localhost:3001/api/v1/health

---

## Quick start script (all-in-one)

Create a file `start-dev.sh` (Linux/Mac) or `start-dev.ps1` (Windows):

**For Windows PowerShell (`start-dev.ps1`):**
```powershell
# Start Docker services
Write-Host "Starting Docker services..." -ForegroundColor Cyan
docker-compose up -d

# Wait for services to be ready
Start-Sleep -Seconds 5

# Enable TimescaleDB
Write-Host "Enabling TimescaleDB extension..." -ForegroundColor Cyan
docker exec -it hydrowatch-postgres psql -U hydrowatch -d hydrowatch_dev -c "CREATE EXTENSION IF NOT EXISTS timescaledb;" 2>&1 | Out-Null

# Setup database
Write-Host "Setting up database..." -ForegroundColor Cyan
Set-Location backend
npx prisma migrate dev --name init
npx prisma generate
Set-Location ..

Write-Host "✓ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now start the servers:" -ForegroundColor Yellow
Write-Host "  Terminal 1: cd backend && npm run start:dev" -ForegroundColor Yellow
Write-Host "  Terminal 2: cd frontend && npm run dev" -ForegroundColor Yellow
```

**For Linux/Mac (`start-dev.sh`):**
```bash
#!/bin/bash

echo "Starting Docker services..."
docker-compose up -d

echo "Waiting for services to be ready..."
sleep 5

echo "Enabling TimescaleDB extension..."
docker exec -it hydrowatch-postgres psql -U hydrowatch -d hydrowatch_dev -c "CREATE EXTENSION IF NOT EXISTS timescaledb;" > /dev/null 2>&1

echo "Setting up database..."
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..

echo "✓ Setup complete!"
echo ""
echo "Now start the servers:"
echo "  Terminal 1: cd backend && npm run start:dev"
echo "  Terminal 2: cd frontend && npm run dev"
```

---

## Troubleshooting

### Docker containers not starting
```bash
# Check Docker is running
docker ps

# View logs
docker-compose logs

# Restart services
docker-compose restart
```

### Database connection errors
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec -it hydrowatch-postgres psql -U hydrowatch -d hydrowatch_dev -c "SELECT 1;"
```

### Port already in use
- Backend (3001): Change `PORT` in `backend/.env` or stop the process using port 3001
- Frontend (3000): Change port in `frontend/package.json` scripts or stop the process using port 3000

### Prisma migration errors
```bash
# Reset database (WARNING: Deletes all data)
cd backend
npx prisma migrate reset

# Or create fresh migration
npx prisma migrate dev --name init
```

---

## Verification checklist

Before starting, verify:
- [ ] Node.js 20+ installed
- [ ] Docker Desktop running
- [ ] `backend/.env` file created
- [ ] `frontend/.env.local` file created
- [ ] Docker containers running (`docker ps`)
- [ ] TimescaleDB extension enabled
- [ ] Database migrations run
- [ ] Dependencies installed (`npm install` in both folders)

---

## Summary

1. Create environment files (`.env` and `.env.local`)
2. Start Docker: `docker-compose up -d`
3. Enable TimescaleDB: Run CREATE EXTENSION command
4. Setup database: `cd backend && npx prisma migrate dev`
5. Start backend: `cd backend && npm run start:dev`
6. Start frontend: `cd frontend && npm run dev`
7. Access: http://localhost:3000

The app should now be running. If you encounter issues, share the error message and I can help troubleshoot.