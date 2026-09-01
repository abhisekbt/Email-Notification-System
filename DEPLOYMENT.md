# Production Deployment Guide: RecoNepal Client Advisory Portal

This document provides complete instructions for deploying the **RecoNepal Client Advisory Portal** into production across different infrastructures.

---

## 1. Quick Start: Docker Compose (Recommended)

Docker Compose deploys the complete stack (PostgreSQL database, Node.js API with automated migrations, and Next.js frontend) in a single command.

### Prerequisites
- [Docker Engine](https://docs.docker.com/engine/install/) (v24.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.20+)

### Deployment Steps

1. **Clone the repository onto your production server**:
   ```bash
   git clone <your-repo-url> /opt/reconepal
   cd /opt/reconepal
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```bash
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=SetAStrongPasswordHere2026!
   POSTGRES_DB=reconepal
   CORS_ORIGIN=https://portal.yourdomain.com
   NEXT_PUBLIC_API_BASE_URL=https://portal.yourdomain.com/api
   
   # Optional: Supabase Disaster Recovery & Standby Fallback URL
   SUPABASE_DATABASE_URL=postgres://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

3. **Build and start the containers**:
   ```bash
   docker compose up -d --build
   ```

4. **Verify container health**:
   ```bash
   docker compose ps
   ```
   All three containers (`reconepal-postgres`, `reconepal-api`, `reconepal-web`) will report `healthy`.

5. **(Optional) Seed Initial Practice Data**:
   ```bash
   docker compose exec api npm run seed
   ```

---

## 2. Linux VPS Deployment (Ubuntu 22.04 / 24.04 with PM2 & Nginx)

For native server hosting without Docker containers.

### Prerequisites
- Node.js 20+ LTS
- PostgreSQL 16+
- PM2 (`npm install -g pm2`)
- Nginx

### Step 1: PostgreSQL Setup
```bash
sudo -u postgres psql
CREATE DATABASE reconepal;
CREATE USER reconepal_user WITH ENCRYPTED PASSWORD 'StrongPasswordHere!';
GRANT ALL PRIVILEGES ON DATABASE reconepal TO reconepal_user;
\q
```

### Step 2: Backend Setup
```bash
cd /opt/reconepal/server
npm ci
cp .env.production.example .env
# Edit .env with your actual DATABASE_URL, optional SUPABASE_DATABASE_URL, and SMTP credentials
npm run build
npm run migrate
pm2 start dist/index.js --name "reconepal-api"
```

### Step 3: Frontend Setup
```bash
cd /opt/reconepal
npm ci
cp .env.production.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=https://portal.yourdomain.com/api
npm run build
pm2 start npm --name "reconepal-web" -- start
pm2 save
pm2 startup
```

### Step 4: Nginx Reverse Proxy Configuration
Create `/etc/nginx/sites-available/reconepal.conf`:
```nginx
server {
    listen 80;
    server_name portal.yourdomain.com;

    # Client body limit for circular PDF/document attachments
    client_max_body_size 25M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/reconepal.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Enable SSL via Certbot:
```bash
sudo certbot --nginx -d portal.yourdomain.com
```

---

## 3. Cloud PaaS Deployment (Render / Railway)

### Deploying on Railway / Render:
1. **Database**: Provision a PostgreSQL 16 managed database and obtain the `DATABASE_URL`.
2. **Backend Web Service**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `DATABASE_URL`: `${Postgres.DATABASE_URL}`
     - `SUPABASE_DATABASE_URL`: *(Optional Supabase Fallback URL)*
     - `CORS_ORIGIN`: `https://your-frontend-domain.com`
     - `PORT`: `4000`
3. **Frontend Web Service**:
   - **Root Directory**: `./` (Root)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_BASE_URL`: `https://your-backend-api-domain.com/api`

---

## 4. Supabase Disaster Recovery & Standby Fallback

The backend includes native dual-database routing with automatic failover and background data replication.

### How it works:
1. **Zero-Downtime Failover**: If the primary PostgreSQL server becomes unreachable (network interruption, crash, maintenance), the backend automatically reroutes incoming database operations to your Supabase PostgreSQL replica.
2. **Automatic Schema & Data Sync**: The `backupService` periodically (default: every 60 minutes) pushes fresh updates from the primary DB to the Supabase database.
3. **Automatic SSL Negotiation**: Works out of the box with Supabase connection poolers (`pooler.supabase.com:6543`) and direct connection strings.

### Configuration:
In your `server/.env`:
```env
SUPABASE_DATABASE_URL=postgres://postgres.[your-project-ref]:[your-password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
SUPABASE_SYNC_INTERVAL_MINUTES=60
```

### Manual / On-Demand Sync Command:
To replicate the latest primary data into Supabase immediately:
```bash
npm --prefix server run sync:supabase
```

### Monitoring Failover Status:
Check the `/api/health` endpoint:
```json
{
  "status": "healthy",
  "uptime": 3600,
  "database": {
    "activeTarget": "primary",
    "primary": { "status": "connected" },
    "supabaseFallback": { "configured": true, "status": "connected" }
  }
}
```

---

## 5. SMTP Email Configuration & Gmail Setup

To send circulars and compliance notices:
1. Open the portal in your browser and log in with your credentials.
2. Navigate to **Settings** (`/settings`).
3. Enter your SMTP credentials:
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **Encryption**: `TLS`
   - **Username**: `your-advisory-email@gmail.com`
   - **Password**: *(16-character Gmail App Password)*
   - **Sender Email**: `advisory@reconepal.com`
   - **Sender Name**: `RecoNepal Advisory Desk`
4. Click **Test SMTP Handshake** to verify real-time email delivery.
5. Click **Save Configuration**. The background scheduler will immediately use these persisted credentials.

---

## 6. Maintenance & Database Backups

### Automated PostgreSQL Backup (Daily Cron):
```bash
# Docker Compose Backup
docker compose exec db pg_dump -U postgres reconepal > /backups/reconepal_$(date +%F).sql

# Restore from Backup
cat /backups/reconepal_2026-09-01.sql | docker compose exec -T db psql -U postgres -d reconepal
```
