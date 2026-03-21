# AI Agent Workflow Log

## Agents Used

- **Cursor Agent (Claude)** - Primary agent for code generation, architecture decisions, and refactoring
- **Gemini** - Used for initial research on FuelEU Maritime regulations and formula verification

## Prompts & Outputs

### Example 1: Setting up Hexagonal Architecture Structure

**Prompt:**
> "I need to setup a Node.js backend with hexagonal architecture for a FuelEU Maritime compliance system. The system needs to handle routes, compliance balance calculation, banking, and pooling. Can you help me create the folder structure and explain the separation of concerns?"

**Agent Response:**
Generated the following structure:
```
src/
  core/
    domain/      # Entities (Route, ComplianceBalance, BankEntry, Pool)
    application/ # Services (RouteService, ComplianceService, etc.)
    ports/       # Interfaces for repositories and services
  adapters/
    inbound/http/    # Express controllers
    outbound/postgres/ # Prisma repositories
  infrastructure/
    db/          # Database client
    server/      # Express app setup
  shared/        # Constants, errors
```

**My Modification:** Added `shared/constants.ts` to centralize FuelEU regulatory values like GHG_REFERENCE_VALUE and reduction targets.

### Example 2: Compliance Balance Formula Implementation

**Prompt:**
> "According to FuelEU Maritime Regulation Annex IV, implement the compliance balance formula. The formula is CB = (GHGIEtarget - GHGIEactual) × energyInScope. Also implement the penalty calculation."

**Agent Response:**
```typescript
export function computeComplianceBalance(
  ghgIntensityActual: number,
  year: number,
  fuelConsumptionTonnes: number,
): { cb: number; target: number; energyInScope: number } {
  const target = getGhgTarget(year);
  const energyInScope = fuelConsumptionTonnes * 41_000;
  const cb = (target - ghgIntensityActual) * energyInScope;
  return { cb, target, energyInScope };
}
```

**My Verification:** Cross-checked with Annex IV Part A of Regulation (EU) 2023/1805. The formula correctly implements:
- Positive CB = Surplus (below target)
- Negative CB = Deficit (above target)

### Example 3: Pool Allocation Algorithm

**Prompt:**
> "Implement a greedy pool allocation algorithm for FuelEU Article 21 pooling. Rules: surplus ships transfer to deficit ships, a deficit ship cannot exit worse, a surplus ship cannot exit negative."

**Agent Response:**
```typescript
export function allocatePool(
  members: { shipId: string; adjustedCB: number }[],
): { shipId: string; cbBefore: number; cbAfter: number }[] {
  // Sort surplus desc, deficit asc
  // Transfer from surplus to deficit iteratively
  // ...
}
```

**My Correction:** Initial implementation didn't preserve the original cbBefore values correctly. Fixed by mapping inputs to result objects before sorting.

### Example 4: React Query Setup with TanStack

**Prompt:**
> "Setup React Query with proper error handling and mutation invalidation for the routes API"

**Agent Response:**
Generated `useQuery` and `useMutation` hooks with proper queryKey invalidation.

**My Refinement:** Added `refetchOnWindowFocus: false` to prevent unnecessary refetches during development.

## Validation / Corrections

| Agent Output | Issue Found | My Correction |
|-------------|-------------|---------------|
| Prisma schema | Missing `@map` decorators for snake_case DB columns | Added proper column mappings |
| CompareTab chart | Used incorrect Recharts API for v3 | Updated to use `<Bar>` with proper dataKey |
| Banking validation | Didn't check for negative CB before banking | Added validation: can only bank if CB > 0 |
| Pool creation | Missing sum validation | Added check: sum(adjustedCB) >= 0 |

## Observations

### Where Agent Saved Time
1. **Boilerplate generation** - Express router setup, Prisma schema, React component structure
2. **TypeScript interfaces** - Entity definitions, port interfaces
3. **TailwindCSS classes** - Responsive styling, dark mode implementation
4. **Test file scaffolding** - Basic test structure with describe/it blocks

### Where Agent Failed or Hallucinated
1. **Outdated APIs** - Suggested deprecated Recharts v2 syntax when v3 was installed
2. **Missing edge cases** - Initial pool validation didn't handle all edge cases from spec
3. **Import paths** - Sometimes generated incorrect relative import paths
4. **Environment setup** - Prisma adapter configuration needed manual correction

### How I Combined Tools Effectively
1. Used **Gemini** for regulatory research and formula verification
2. Used **Cursor Agent** for code generation and refactoring
3. Manually reviewed all business logic against the FuelEU regulation document
4. Used agent for test generation, then manually added edge cases

## Best Practices Followed

1. **Incremental commits** - Each feature committed separately with descriptive messages
2. **Type-first development** - Defined TypeScript interfaces before implementation
3. **Domain-driven design** - Business logic in core, frameworks in adapters
4. **Agent verification** - Always reviewed and tested agent-generated code
5. **Documentation** - Documented prompts and corrections for transparency
