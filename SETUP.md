# Quick Setup Guide for CEFETinder

## 🎯 Choose Your Setup Method

### Option A: Using Docker (Easiest - Recommended)

Everything is configured and ready to go!

1. **Start all services:**

   ```bash
   docker-compose up --build
   ```

2. **Access the services:**
   - API Gateway (Kong): http://localhost:8000
   - GraphQL: http://localhost:8000/graphql
   - WebSocket: ws://localhost:8000/notifications

That's it! Docker handles everything.

---

### Option B: Local Development (Without Docker)

#### Prerequisites

- Node.js installed
- PostgreSQL installed locally OR Supabase account

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Configure Database

**Option 2a: Using Local PostgreSQL**

1. Edit `.env` and uncomment the local DATABASE_URL:

   ```
   DATABASE_URL=postgresql://user:secret@localhost:5432/users
   ```

2. Create the databases:

   ```bash
   createdb users
   createdb match
   ```

3. Run the SQL scripts:
   ```bash
   psql -d users -f infra/scripts/user.sql
   psql -d match -f infra/scripts/match.sql
   ```

**Option 2b: Using Supabase (Remote)**

1. Go to your Supabase project dashboard
2. Find your database password
3. Edit `.env` and replace `[YOUR-PASSWORD]` with your actual password:

   ```
   DATABASE_URL=postgresql://postgres.fnklgcezesjwthhvkzzf:YOUR_ACTUAL_PASSWORD@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
   ```

4. Run migrations in Supabase dashboard or using the SQL files in `infra/scripts/`

#### Step 3: Start the Application

**Quick Start (All Services at Once):**

```bash
npm run dev
```

This starts all 4 services together:

- User Service (gRPC) on port 50051
- Match Service (gRPC) on port 50052
- GraphQL Server on port 4000
- WebSocket/Notification on port 8080

**Or Start Services Individually (4 separate terminals):**

```bash
# Terminal 1
npm run start:grpc:user-service

# Terminal 2
npm run start:grpc:match-service

# Terminal 3
npm run start:graphql

# Terminal 4
npm run start:socket
```

#### Step 4: Test It Works

```bash
# Test GraphQL
curl http://localhost:4000/graphql -d '{"query":"{ __typename }"}' -H "Content-Type: application/json"
```

---

## 🔍 Troubleshooting

### "Cannot find module './server.ts'"

✅ Fixed! The gateway/server.ts file has been created.

### "Missing DATABASE_URL environment variable"

Edit `.env` and set your database connection string (see Step 2 above).

### "Connection refused" errors

Make sure PostgreSQL is running (if using local) or check your Supabase password.

---

## 📚 Architecture Overview

This is a microservices architecture:

1. **GraphQL Server** (port 4000) - Main API for frontend
2. **User Service** (port 50051) - gRPC service for user management
3. **Match Service** (port 50052) - gRPC service for matching logic
4. **WebSocket Service** (port 8080) - Real-time notifications

In production, Kong API Gateway routes all external traffic.
