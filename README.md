# FuelEU Maritime Compliance Platform

A full-stack application implementing the FuelEU Maritime compliance module with routes management, compliance balance calculation, banking, and pooling features.

## Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters / Clean Architecture):

```
├── backend/
│   ├── src/
│   │   ├── core/           # Business logic (framework-agnostic)
│   │   │   ├── domain/     # Entities, value objects, formulas
│   │   │   ├── application/# Use cases / services
│   │   │   └── ports/      # Interfaces (inbound & outbound)
│   │   ├── adapters/       # Infrastructure implementations
│   │   │   ├── inbound/    # HTTP controllers
│   │   │   └── outbound/   # Database repositories
│   │   ├── infrastructure/ # Server, DB client setup
│   │   └── shared/         # Constants, errors
│   └── prisma/             # Database schema & migrations
│
├── frontend/
│   ├── src/
│   │   ├── core/           # Domain types, ports (no React deps)
│   │   ├── adapters/
│   │   │   ├── ui/         # React components, pages
│   │   │   └── infrastructure/ # API client
│   │   └── shared/         # Constants, utilities
```

## Tech Stack

- **Frontend:** React 18, TypeScript, TailwindCSS v4, React Query, Recharts
- **Backend:** Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL
- **Testing:** Vitest, React Testing Library, Supertest

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or pnpm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure DATABASE_URL
npx prisma generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed initial data
npm run dev           # Start development server on port 3001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev           # Start development server on port 5173
```

## Running Tests

```bash
# Backend tests (unit + integration)
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## API Endpoints & Sample Responses

### Routes

#### `GET /routes` - List all routes
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

#### `POST /routes/:routeId/baseline` - Set baseline route
```json
{
  "id": 1,
  "routeId": "R001",
  "isBaseline": true
}
```

#### `GET /routes/comparison` - Compare routes against baseline
```json
[
  {
    "routeId": "R002",
    "vesselType": "BulkCarrier",
    "fuelType": "LNG",
    "year": 2024,
    "ghgIntensity": 88.0,
    "baselineGhgIntensity": 91.0,
    "percentDiff": -3.30,
    "compliant": true
  }
]
```

### Compliance

#### `GET /compliance/cb?shipId=R001&year=2025` - Get compliance balance
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

#### `GET /compliance/adjusted-cb?shipId=R001&year=2025` - Get adjusted CB
```json
{
  "shipId": "R001",
  "year": 2025,
  "initialCB": -341096000,
  "bankedSurplus": 0,
  "appliedFromBank": 0,
  "adjustedCB": -341096000
}
```

### Banking

#### `POST /banking/bank` - Bank positive CB surplus
Request: `{ "shipId": "R002", "year": 2025 }`
```json
{
  "id": 1,
  "shipId": "R002",
  "year": 2025,
  "amountGco2eq": 263312000,
  "createdAt": "2025-03-22T12:00:00.000Z"
}
```

#### `POST /banking/apply` - Apply banked surplus
Request: `{ "shipId": "R002", "year": 2025, "amount": 100000000 }`
```json
{
  "applied": 100000000,
  "remaining": 163312000
}
```

### Pooling

#### `POST /pools` - Create pool with members
Request:
```json
{
  "year": 2025,
  "members": [
    { "shipId": "R001", "adjustedCB": -300000000 },
    { "shipId": "R002", "adjustedCB": 500000000 }
  ]
}
```
Response:
```json
{
  "id": 1,
  "year": 2025,
  "createdAt": "2025-03-22T12:00:00.000Z",
  "members": [
    { "shipId": "R001", "cbBefore": -300000000, "cbAfter": 0 },
    { "shipId": "R002", "cbBefore": 500000000, "cbAfter": 200000000 }
  ]
}
```

## Key Formulas (FuelEU Regulation 2023/1805)

| Formula | Description |
|---------|-------------|
| **Target Intensity (2025)** | 89.3368 gCO₂e/MJ (2% below 91.16) |
| **Energy in Scope** | fuelConsumption × 41,000 MJ/t |
| **Compliance Balance** | (Target - Actual) × Energy in Scope |
| **Percent Difference** | ((comparison / baseline) - 1) × 100 |
| **Penalty** | \|CB\| / (Actual × 41,000) × 2,400 EUR |

## Dashboard Screenshots

The dashboard provides four main tabs:

1. **Routes Tab** - View all routes, filter by vessel/fuel/year, set baseline
2. **Compare Tab** - Bar chart visualization comparing GHG intensities against target
3. **Banking Tab** - View CB, bank surplus, apply banked amounts (Article 20)
4. **Pooling Tab** - Select ships, validate pool sum, create pools (Article 21)

*Screenshots available when running the application at http://localhost:5173*

## Project Structure

```
FuelEU-Maritime/
├── README.md                 # This file
├── AGENT_WORKFLOW.md         # AI agent usage documentation
├── REFLECTION.md             # Reflection on AI agent usage
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── eslint.config.js
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data
│   └── src/
│       ├── core/domain/      # Entities, formulas
│       ├── core/application/ # Services
│       ├── core/ports/       # Interfaces
│       ├── adapters/         # Controllers, repositories
│       └── infrastructure/   # Server, DB client
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── vitest.config.ts
    ├── eslint.config.js
    └── src/
        ├── core/             # Domain types, ports
        ├── adapters/ui/      # React components
        ├── adapters/infrastructure/ # API client
        └── shared/           # Constants
```

## License

MIT
