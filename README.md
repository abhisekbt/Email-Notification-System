# RecoNepal Client Advisory Portal

An enterprise compliance & regulatory circular notification system designed for Chartered Accountancy and audit advisory firms.

---

## Key Features

- **Client Directory**: Track active client companies, PAN numbers, and multiple assigned industry sectors.
- **Industry Sectors**: Define and organize clients into specialized industry disciplines for targeted communication.
- **Circular & Advisory Composer**: Compose professional updates with rich merge tags (`{{contactPerson}}`, `{{companyName}}`), template loading, and multi-file document attachments (PDF, DOCX, XLSX).
- **Scheduled Broadcasts & Background Engine**: Schedule broadcasts for future dates/times with an automated background worker dispatching circulars with attachments upon trigger.
- **Pre-Flight Recipient Preview**: Preview matched client recipients and exclude individual clients before dispatch.
- **Audit Logs & Sent History**: Track real-time recipient delivery matrices, attachment downloads, and failure reasons.
- **Live SMTP Configuration & Handshake Testing**: In-app SMTP credential management with real-time test connection handshakes.
- **Session Authentication & Role Protection**: Hardened sign-in portal with session persistence.

---

## Tech Stack

- **Frontend**: Next.js 16 (React 19), TypeScript, Tailwind CSS, TanStack Table & Query, Lucide Icons, Sonner.
- **Backend API**: Node.js, Express, TypeScript, Nodemailer, pg.
- **Database**: PostgreSQL 16+ with automated schema migrations.
- **Deployment**: Docker & Docker Compose multi-stage standalone containers.

---

## Quick Start (Development)

### 1. Start PostgreSQL
```bash
docker run -d --name reconepal-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=reconepal postgres:16-alpine
```

### 2. Start Backend API
```bash
cd server
npm install
npm run migrate
npm run seed
npm run dev
```

### 3. Start Frontend Portal
```bash
# In the root directory:
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment

For complete production deployment instructions across Docker Compose, Ubuntu VPS (PM2/Nginx), and Cloud PaaS (Railway/Render), please refer to:

👉 **[DEPLOYMENT.md](file:///d:/New%20folder%20%2820%29/public/DEPLOYMENT.md)**

### Turnkey Docker Deployment:
```bash
docker compose up -d --build
```
This builds and starts PostgreSQL, the Backend API (running database migrations automatically), and the Next.js frontend with isolated container health checks.
