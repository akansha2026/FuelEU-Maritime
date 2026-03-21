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

- **Frontend:** React 19, TypeScript, TailwindCSS v4, React Query, Recharts
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
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## API Endpoints

### Routes
- `GET /routes` - List all routes
- `POST /routes/:routeId/baseline` - Set baseline route
- `GET /routes/comparison` - Compare routes against baseline

### Compliance
- `GET /compliance/cb?shipId&year` - Get compliance balance
- `GET /compliance/adjusted-cb?shipId&year` - Get adjusted CB after banking

### Banking
- `GET /banking/records?shipId&year` - Get banking records
- `POST /banking/bank` - Bank positive CB surplus
- `POST /banking/apply` - Apply banked surplus to deficit

### Pooling
- `POST /pools` - Create pool with members

## Key Formulas (FuelEU Regulation 2023/1805)

- **Target Intensity (2025):** 89.3368 gCO₂e/MJ (2% below 91.16)
- **Energy in Scope:** fuelConsumption × 41,000 MJ/t
- **Compliance Balance:** (Target - Actual) × Energy in Scope
- **Percent Difference:** ((comparison / baseline) - 1) × 100

## Screenshots

*Coming soon*

## License

MIT
