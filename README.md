# FuelEU Maritime Compliance Platform

A full-stack compliance dashboard implementing the FuelEU Maritime regulation requirements - routes management, compliance balance (CB) calculation, banking (Article 20), and pooling (Article 21).

Built with React + TypeScript + TailwindCSS on the frontend, Node.js + Express + Prisma + PostgreSQL on the backend, following hexagonal architecture.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env          # Edit DATABASE_URL with your Postgres credentials
npx prisma generate           # Generate Prisma client
npx prisma db push           # Create tables
npm run db:seed              # Seed with sample routes
npm run dev                  # Runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # Runs on http://localhost:5173
```

Open http://localhost:5173 and you should see the dashboard!

## Architecture

I followed **hexagonal architecture** (ports & adapters) to keep business logic separate from frameworks:

```
backend/src/
├── core/                    # Pure business logic - NO framework imports
│   ├── domain/              # Entities (Route, ComplianceBalance, etc.)
│   │                        # Formulas (CB calculation, pool allocation)
│   ├── application/         # Use cases (RouteService, BankingService, etc.)
│   └── ports/               # Interfaces for repos and services
├── adapters/
│   ├── inbound/http/        # Express controllers
│   └── outbound/postgres/   # Prisma repositories
├── infrastructure/          # Server setup, DB client
└── shared/                  # Constants, error classes

frontend/src/
├── core/
│   ├── domain/              # TypeScript types (mirrors backend entities)
│   └── ports/               # API client interface
├── adapters/
│   ├── ui/                  # React components and pages
│   └── infrastructure/      # Axios API client
└── shared/                  # Constants, utilities
```

The key principle: `core/` has zero dependencies on Express, Prisma, React, or Axios. This makes the business logic testable and portable.

## Features

### Routes Tab
- View all routes in a filterable table
- Filter by vessel type, fuel type, year
- Set any route as the baseline for comparison

### Compare Tab
- Bar chart comparing GHG intensity across routes
- Reference line showing 2025 target (89.34 gCO₂e/MJ)
- Table with compliance status for each route

### Banking Tab (Article 20)
- View compliance balance for any ship/year
- Bank positive CB (surplus) for future use
- Apply banked surplus to offset deficits
- See penalty exposure for non-compliant ships

### Pooling Tab (Article 21)
- Load adjusted CB for all ships
- Select ships to include in a pool
- Validation: pool sum must be ≥ 0
- Greedy allocation transfers surplus to deficit ships

## API Reference

### Routes

```
GET  /routes                    # List all routes
POST /routes/:routeId/baseline  # Set baseline
GET  /routes/comparison         # Compare vs baseline
```

**Sample response - GET /routes:**
```json
[
  {
    "id": 1,
    "routeId": "R001",
    "vesselType": "Container",
    "fuelType": "HFO",
    "year": 2024,
    "ghgIntensity": 91.0,
    "fuelConsumption": 5000,
    "distance": 12000,
    "totalEmissions": 4500,
    "isBaseline": true
  }
]
```

### Compliance

```
GET /compliance/cb?shipId=R001&year=2025           # Get CB
GET /compliance/adjusted-cb?shipId=R001&year=2025  # Get CB after banking
```

**Sample response - GET /compliance/cb:**
```json
{
  "shipId": "R001",
  "year": 2025,
  "ghgIntensityTarget": 89.3368,
  "ghgIntensityActual": 91.0,
  "energyInScope": 205000000,
  "cbGco2eq": -341096000,
  "penaltyEur": 8998.68
}
```

### Banking

```
GET  /banking/records?shipId&year    # Get banking history
POST /banking/bank                   # Bank surplus (body: {shipId, year})
POST /banking/apply                  # Apply banked (body: {shipId, year, amount})
```

### Pooling

```
POST /pools    # Create pool (body: {year, members: [{shipId, adjustedCB}]})
```

**Sample response - POST /pools:**
```json
{
  "id": 1,
  "year": 2025,
  "members": [
    { "shipId": "R001", "cbBefore": -300000000, "cbAfter": 0 },
    { "shipId": "R002", "cbBefore": 500000000, "cbAfter": 200000000 }
  ]
}
```

## Key Formulas

From FuelEU Regulation (EU) 2023/1805:

| Formula | Calculation |
|---------|-------------|
| Target Intensity (2025) | 91.16 × (1 - 0.02) = 89.3368 gCO₂e/MJ |
| Energy in Scope | fuelConsumption × 41,000 MJ/t |
| Compliance Balance | (Target - Actual) × Energy |
| Penalty | \|CB\| ÷ (Actual × 41,000) × 2,400 EUR |

Positive CB = surplus (good), Negative CB = deficit (penalty applies)

## Running Tests

```bash
# Backend - 29 tests (18 unit + 11 integration)
cd backend && npm test

# Frontend - 9 tests
cd frontend && npm test
```

Tests cover:
- Domain formulas (CB calculation, pool allocation, penalty)
- API endpoints (routes, compliance, banking, pools)
- React components (KpiCard)

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- TailwindCSS v4 (with dark mode)
- React Query for data fetching
- Recharts for visualization
- Radix UI for accessible components

**Backend:**
- Node.js + Express 5
- TypeScript (strict mode)
- Prisma ORM + PostgreSQL
- Vitest + Supertest for testing

## Database Schema

```sql
routes          # Voyage data (ghg_intensity, fuel_consumption, etc.)
ship_compliance # Computed CB snapshots
bank_entries    # Banked surplus records
pools           # Pool registry
pool_members    # Pool allocations (cb_before, cb_after)
```

See `backend/prisma/schema.prisma` for full schema.

## Project Files

```
├── README.md              # You're reading this
├── AGENT_WORKFLOW.md      # How I used AI agents
├── REFLECTION.md          # What I learned
├── backend/
│   ├── src/               # TypeScript source
│   ├── prisma/            # Schema + seed
│   └── package.json
└── frontend/
    ├── src/               # React source
    └── package.json
```

## Notes

- The seed data includes 5 routes matching the assignment spec
- R001 is set as the default baseline
- Dark mode toggle in the header (persists to localStorage)
- All API errors return JSON with `{ error: "message" }`
