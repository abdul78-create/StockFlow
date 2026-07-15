# StockFlow - Enterprise ERP & Inventory Management (India Edition)

StockFlow is a production-grade, multi-tenant inventory management system and ERP backend paired with a modern React dashboard. Tailored for Indian business operations, it implements complete end-to-end support for GST rates, credit limits, payment terms, double-entry inventory tracking, and realistic transaction data.

---

## 🚀 Viva Demo Credentials & Quick Login

For immediate evaluation, use the permanent demo account pre-configured with a realistic dataset of active Indian operations.

* **Login URL:** [http://localhost:5174/login](http://localhost:5174/login)
* **Email Address:** `viva@stockflow.com`
* **Password:** `Password123`
* **Company Workspace:** `StockFlow Demo Pvt Ltd` ( हैदराबाद, तेलंगाना )

---

## 🌟 Localized Features (India Operations)

1. **Indian Rupee (₹) Base Currency**: All financial figures, aggregates, dashboards, and transaction tables format currency using the Indian Numbering System (e.g. `₹25,000`, `₹1,50,000`, `₹12,50,000`).
2. **GST Compliance**: Native input fields for **GSTIN** (Tax IDs) on customers and suppliers, alongside **GST Rate (%)** selectors for products.
3. **Double-Entry Ledger Tracking**: Real-time batch-tracked inventory balances across multiple warehouses with transactional auditing.
4. **Flexible Credit & Payment Terms**: Configure **Credit Limits** for customers in ₹ and **Payment Terms** (e.g., Net 30, COD) for suppliers.
5. **Robust CRUD Operations**: Fully editable and deletable inventory products, customers, suppliers, categories, warehouses, purchase/sales orders, and payment items.

---

## 🛠️ Tech Stack

### Backend API
* **Runtime & Language**: Node.js + Express + TypeScript
* **Database & ORM**: PostgreSQL + Prisma ORM
* **Caching**: Redis Cache & Pub/Sub
* **Logging**: Pino (Structured JSON Logging)
* **API Documentation**: Swagger UI (OpenAPI 3.0)
* **Testing**: Vitest + Supertest

### Frontend Dashboard
* **Framework**: React 18 + Vite + TypeScript
* **State Management**: Zustand
* **Styling**: Vanilla CSS + Tailwind CSS
* **Visualization**: Recharts (Interactive charts)
* **Routing**: React Router v6
* **Form Handling**: React Hook Form + Zod

### DevOps
* **Containerization**: Docker & Docker Compose
* **CI/CD**: GitHub Actions

---

## ⚡ Quick Start (Docker Compose)

The easiest way to boot the stack is via Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/stockflow.git
cd stockflow

# 2. Build and start all services (Postgres, Redis, Backend, Frontend)
docker compose up --build -d
```

### Access Points
* **Frontend Dashboard**: [http://localhost:5174](http://localhost:5174)
* **Backend Root Endpoint**: [http://localhost:3000](http://localhost:3000)
* **API Version 1 Endpoint**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
* **Swagger API Docs**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🌱 Database Seeding

Recreate the complete demo environment from scratch at any time. This generates **45 products, 15 suppliers, 20 customers, 5 warehouses, 20 purchase orders, 20 sales orders, and ledger transactions** with realistic Indian business context (e.g. Tata, Amul, Hyderabad locations, Rupees).

```bash
# Seeding from the backend directory
cd backend
npm run seed
```

---

## 🩺 System Endpoints

StockFlow implements professional root and health indicators:

### 1. Root Information (`GET /`)
Returns a summary of API liveness, version, and connectivity statuses.
```json
{
  "application": "StockFlow ERP API",
  "version": "1.0.0",
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "environment": "development",
  "timestamp": "2026-07-15T12:00:00.000Z",
  "documentation": "/api-docs",
  "health": "/health"
}
```

### 2. System Health (`GET /health`)
Active connection verification check queried by container deployment probes.
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": "2h 15m 12s",
  "timestamp": "2026-07-15T12:00:05.000Z"
}
```

---

## 🔧 Local Development Setup

If running locally without Docker:

### 1. Pre-requisites
* Spin up Postgres and Redis locally, or use compose:
  ```bash
  docker compose up -d db redis
  ```

### 2. Setup Backend
```bash
cd backend
npm install

# Setup env variables
cp .env.example .env

# Generate prisma types, apply migrations, and seed
npx prisma generate
npx prisma migrate dev
npm run seed

# Run local development server
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Run Vite dev server
npm run dev
```

---

## 🧪 Testing & Code Quality

Both workspaces enforce strict quality gates:
```bash
# Run unit & integration tests
cd backend
npm run test
```

---

## 📜 Documentation Index
For details on system design:
* [Architecture Guide](ARCHITECTURE.md)
* [API Endpoint Index](API.md)
* [Deployment Guide](DEPLOYMENT.md)
* [Internship Demo Script](INTERNSHIP_DEMO.md)
* [Production Readiness Report](PRODUCTION_READINESS_REPORT.md)
