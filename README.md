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
# Backend - 86 tests
cd backend && npm test

# Frontend - 141 tests
cd frontend && npm test

# With coverage reports
cd backend && npm run test:coverage
cd frontend && npm run test:coverage
```

## Test Coverage

### Backend Coverage Report

| File/Directory | Statements | Branches | Functions | Lines |
|----------------|------------|----------|-----------|-------|
| **All files** | **96.13%** | **91.47%** | **97.67%** | **96.13%** |
| **src/core/domain** | | | | |
| └── formulas.ts | 100% | 88.23% | 100% | 100% |
| **src/core/application** | | | | |
| └── RouteService.ts | 100% | 100% | 100% | 100% |
| └── BankingService.ts | 100% | 100% | 100% | 100% |
| └── ComplianceService.ts | 100% | 100% | 100% | 100% |
| └── PoolingService.ts | 76.47% | 80% | 100% | 76.47% |
| **src/adapters/outbound/postgres** | | | | |
| └── RouteRepository.ts | 87.87% | 100% | 83.33% | 87.87% |
| └── PoolRepository.ts | 100% | 100% | 100% | 100% |
| └── BankRepository.ts | 100% | 100% | 100% | 100% |
| └── ComplianceRepository.ts | 100% | 100% | 100% | 100% |
| **src/adapters/inbound/http** | | | | |
| └── routeController.ts | 88.57% | 71.42% | 100% | 88.57% |
| └── poolController.ts | 100% | 100% | 100% | 100% |
| └── complianceController.ts | 95.55% | 91.66% | 100% | 95.55% |
| └── bankingController.ts | 95.16% | 87.5% | 100% | 95.16% |
| **src/shared** | | | | |
| └── constants.ts | 100% | 100% | 100% | 100% |
| └── errors.ts | 100% | 100% | 100% | 100% |
| **src/infrastructure** | | | | |
| └── db/client.ts | 100% | 100% | 100% | 100% |
| └── server/app.ts | 93.54% | 66.66% | 100% | 93.54% |

### Frontend Coverage Report

| File/Directory | Statements | Branches | Functions | Lines |
|----------------|------------|----------|-----------|-------|
| **All files** | **100%** | **97.36%** | **100%** | **100%** |
| **src/shared** | | | | |
| └── constants.ts | 100% | 100% | 100% | 100% |
| **src/core/domain** | | | | |
| └── formulas.ts | 100% | 90% | 100% | 100% |
| **src/adapters/infrastructure** | | | | |
| └── apiClient.ts | 100% | 100% | 100% | 100% |
| **src/adapters/ui/components** | | | | |
| └── KpiCard.tsx | 100% | 100% | 100% | 100% |
| **src/adapters/ui/primitives** | | | | |
| └── All components | 100% | 100% | 100% | 100% |

### Test Summary

| Category | Tests | Description |
|----------|-------|-------------|
| **Backend Unit** | 62 | Domain formulas, services, constants, errors |
| **Backend Integration** | 24 | API endpoints via Supertest |
| **Frontend Unit** | 45 | Constants, formulas, API client |
| **Frontend Component** | 96 | UI primitives, components |
| **Total** | **227** | All passing ✓ |

### What's Tested

**Backend Domain Logic:**
- `computeEnergyInScope` - fuel to MJ conversion
- `computeComplianceBalance` - CB calculation for surplus/deficit
- `computePenalty` - penalty calculation for deficit
- `computePercentDiff` - route comparison
- `isCompliant` - target compliance check
- `allocatePool` - greedy pool allocation with edge cases

**Backend API Endpoints:**
- `GET /routes` - returns all routes with properties
- `POST /routes/:routeId/baseline` - sets baseline, handles 404
- `GET /routes/comparison` - returns comparison with percentDiff and compliant
- `GET /compliance/cb` - returns CB, handles missing params
- `GET /compliance/adjusted-cb` - returns adjusted CB
- `GET /banking/records` - returns banking history
- `POST /banking/bank` - banks surplus, validates CB > 0
- `POST /banking/apply` - applies banked amount
- `POST /pools` - creates valid pool, rejects invalid sum

**Backend Services:**
- RouteService - getAll, setBaseline, getComparison
- ComplianceService - getComplianceBalance, getAdjustedCB
- BankingService - getRecords, bankSurplus, applyBanked
- PoolingService - createPool with validation

**Frontend:**
- `getGhgTarget` - reduction targets by year for all milestone years
- `computeComplianceBalance` - formula implementation
- `computePenalty` - penalty calculations
- `allocatePool` - pool allocation algorithm
- All UI primitives - Button, Card, Alert, Spinner, Select, DataTable, etc.
- KpiCard - renders label, value, sublabel, variants
- API client - all endpoint methods

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
- Run `npm run test:coverage` in either directory for detailed coverage reports
