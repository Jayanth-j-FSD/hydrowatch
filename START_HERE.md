# 🚀 HydroWatch Platform - Quick Start Guide

## ⚠️ Important: Before Starting

This guide will help you start the HydroWatch platform. Make sure you have completed the initial setup.

---

## 📋 Prerequisites Checklist

Before starting the application, ensure you have:

- [x] **Node.js 20+ LTS** installed
  - Verify: `node --version` (should show v20.x.x or higher)
  - Download: https://nodejs.org/

- [x] **npm** installed (comes with Node.js)
  - Verify: `npm --version` (should show 10.x.x or higher)

- [ ] **Docker Desktop** installed and running ⚠️ **REQUIRED**
  - Download: https://www.docker.com/products/docker-desktop
  - Install and start Docker Desktop
  - Verify: Docker icon should be visible in system tray
  - **Why**: PostgreSQL and Redis run in Docker containers

- [ ] **Environment Files** created
  - `backend/.env` - Backend configuration
  - `frontend/.env.local` - Frontend configuration

---

## 🔧 Step-by-Step Startup Instructions

### Step 1: Verify Prerequisites

```powershell
# Check Node.js
node --version

# Check npm
npm --version

# Check Docker (after installation)
docker --version
docker compose version
```

---

### Step 2: Install Docker Desktop (If Not Installed)

1. **Download Docker Desktop**:
   - Visit: https://www.docker.com/products/docker-desktop
   - Download for Windows
   - Run the installer

2. **Start Docker Desktop**:
   - Launch Docker Desktop from Start Menu
   - Wait for it to fully start (whale icon in system tray)
   - Verify it's running: Docker icon should be visible

3. **Verify Docker is Working**:
   ```powershell
   docker ps
   ```
   Should show an empty list or running containers (no errors)

---

### Step 3: Create Environment Files (If Not Already Created)

#### Backend Environment File (`backend/.env`)

Create `backend/.env` with the following content:

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

#### Frontend Environment File (`frontend/.env.local`)

Create `frontend/.env.local` with the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**PowerShell Command to Create Files**:

```powershell
# Create backend/.env
@"
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://hydrowatch:dev_password@localhost:5432/hydrowatch_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=development_secret_key_min_32_characters_long_change_this
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=development_refresh_secret_min_32_characters_long
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath backend\.env -Encoding utf8

# Create frontend/.env.local
@"
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
"@ | Out-File -FilePath frontend\.env.local -Encoding utf8
```

---

### Step 4: Install Dependencies (If Not Already Installed)

```powershell
# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 5: Start Docker Services

**This is REQUIRED before starting the application!**

```powershell
# From project root directory
docker compose up -d
```

This will start:
- **PostgreSQL + TimescaleDB** on port 5432
- **Redis** on port 6379

**Verify containers are running**:
```powershell
docker compose ps
```

You should see:
- `hydrowatch-postgres` - Running
- `hydrowatch-redis` - Running

---

### Step 6: Enable TimescaleDB Extension

TimescaleDB is required for time-series data storage:

```powershell
docker exec -it hydrowatch-postgres psql -U hydrowatch -d hydrowatch_dev -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

**Expected Output**: `CREATE EXTENSION`

---

### Step 7: Run Database Migrations

```powershell
cd backend
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Set up relationships
- Prepare the database schema

**Note**: If you see errors about Prisma configuration, the schema has been updated for Prisma 7 compatibility.

---

### Step 8: Generate Prisma Client

```powershell
cd backend
npx prisma generate
```

**Expected Output**: `✔ Generated Prisma Client`

---

### Step 9: Start Backend Server

**Terminal 1 - Backend**:

```powershell
cd backend
npm run start:dev
```

**Expected Output**:
```
Application is running on: http://localhost:3001
Swagger documentation: http://localhost:3001/api/docs
```

**Keep this terminal open!**

---

### Step 10: Start Frontend Server

**Terminal 2 - Frontend**:

```powershell
cd frontend
npm run dev
```

**Expected Output**:
```
- Local:        http://localhost:3000
```

**Keep this terminal open!**

---

## ✅ Access the Application

Once both servers are running, access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **API Documentation (Swagger)**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/v1/health

---

## 🐛 Troubleshooting

### Docker Issues

**Problem**: `docker: command not found`
- **Solution**: Install Docker Desktop and ensure it's running
- Verify Docker is in PATH: `docker --version`

**Problem**: `Cannot connect to Docker daemon`
- **Solution**: Start Docker Desktop application
- Wait for Docker to fully start (check system tray icon)

**Problem**: Port already in use
- **Solution**: 
  - Stop other services using ports 3000, 3001, 5432, or 6379
  - Or change ports in `.env` files

### Database Connection Issues

**Problem**: `Can't reach database server`
- **Solution**: 
  1. Verify Docker containers are running: `docker compose ps`
  2. Check DATABASE_URL in `backend/.env`
  3. Restart Docker containers: `docker compose restart`

**Problem**: `TimescaleDB extension not found`
- **Solution**: Run the CREATE EXTENSION command (Step 6)

**Problem**: `Prisma migration errors`
- **Solution**: 
  ```powershell
  cd backend
  npx prisma migrate reset  # WARNING: Deletes all data
  npx prisma migrate dev --name init
  ```

### Backend Server Issues

**Problem**: Backend won't start
- **Check**: 
  - Environment file exists: `backend/.env`
  - Dependencies installed: `backend/node_modules` exists
  - Database is running: `docker compose ps`
  - Port 3001 is available

**Problem**: `JWT_SECRET is required`
- **Solution**: Ensure `backend/.env` has JWT_SECRET set (min 32 characters)

### Frontend Server Issues

**Problem**: Frontend won't start
- **Check**:
  - Environment file exists: `frontend/.env.local`
  - Dependencies installed: `frontend/node_modules` exists
  - Port 3000 is available
  - Backend is running on port 3001

**Problem**: Cannot connect to API
- **Check**:
  - Backend is running: http://localhost:3001/api/v1/health
  - `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is correct

---

## 📝 Quick Reference Commands

### Start Everything (After Initial Setup)

```powershell
# 1. Start Docker services
docker compose up -d

# 2. Wait for services to be ready
Start-Sleep -Seconds 5

# 3. Enable TimescaleDB (first time only)
docker exec -it hydrowatch-postgres psql -U hydrowatch -d hydrowatch_dev -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# 4. Start backend (Terminal 1)
cd backend
npm run start:dev

# 5. Start frontend (Terminal 2 - new terminal)
cd frontend
npm run dev
```

### Stop Everything

```powershell
# Stop backend and frontend (Ctrl+C in their terminals)

# Stop Docker services
docker compose down

# Stop and remove volumes (WARNING: Deletes data)
docker compose down -v
```

### View Logs

```powershell
# Docker logs
docker compose logs -f

# Backend logs
# (Visible in the terminal running npm run start:dev)

# Frontend logs
# (Visible in the terminal running npm run dev)
```

### Reset Database

```powershell
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## 🔐 Security Notes

1. **Development vs Production**:
   - The `.env` files contain development secrets
   - **NEVER commit `.env` files to Git** (already in `.gitignore`)
   - Use strong, random secrets in production

2. **Generate Strong Secrets**:
   ```powershell
   # Generate random secret (32+ characters)
   openssl rand -base64 32
   ```

3. **Change Default Passwords**:
   - Database password: `dev_password` (change in production)
   - JWT secrets: Use generated strong secrets

---

## 📚 Additional Resources

- **Project Documentation**: `development-process/` folder
- **API Documentation**: http://localhost:3001/api/docs (when running)
- **Deployment Guide**: `DEPLOYMENT_README.md`
- **Testing Guide**: `development-process/08-testing-strategy.md`

---

## ✅ Verification Checklist

Before considering the app "ready", verify:

- [ ] Docker Desktop is installed and running
- [ ] Docker containers are running (`docker compose ps`)
- [ ] Environment files exist (`backend/.env`, `frontend/.env.local`)
- [ ] Dependencies are installed (both `node_modules` folders exist)
- [ ] TimescaleDB extension is enabled
- [ ] Database migrations are run
- [ ] Backend server is running (http://localhost:3001/api/v1/health)
- [ ] Frontend server is running (http://localhost:3000)
- [ ] Can access Swagger docs (http://localhost:3001/api/docs)

---

## 🎯 Next Steps After Starting

1. **Test the Application**:
   - Visit http://localhost:3000
   - Check API health: http://localhost:3001/api/v1/health
   - Explore API docs: http://localhost:3001/api/docs

2. **Create a User**:
   - Use the registration endpoint
   - Or create via API/Swagger

3. **Explore Features**:
   - River Tracker
   - Dams Dashboard
   - Groundwater Dashboard
   - Rainfall Forecast
   - Alert Management

---

## 🆘 Need Help?

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review error messages in terminal output
3. Check Docker container logs: `docker compose logs`
4. Verify all prerequisites are met
5. Ensure environment files are correctly configured

---

**Last Updated**: 2025-01-21  
**Status**: Ready for Development

