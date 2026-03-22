# AI Agent Workflow Log

## Agents Used

| Agent | Purpose | Usage Frequency |
|-------|---------|-----------------|
| **AI Coding Assistant** | Primary coding assistant - architecture, implementation, debugging | ~80% of tasks |
| **AI Research Tool** | Research on FuelEU regulations, formula verification | ~20% of tasks |

---

## Prompts & Outputs

### Example 1: Initial Project Structure

**My Prompt:**
> "Hey, I need to build a FuelEU Maritime compliance system with Node.js backend and React frontend. The assignment requires hexagonal architecture. Can you help me understand what folders I need and how to organize the code? I'm a bit confused about ports vs adapters."

**Agent Response:**
The agent explained hexagonal architecture clearly and suggested this structure:
```
src/
  core/           # Business logic - no framework dependencies!
    domain/       # Entities like Route, ComplianceBalance
    application/  # Use cases/services 
    ports/        # Interfaces (contracts)
  adapters/       # Implementations
    inbound/      # HTTP controllers (Express)
    outbound/     # Database (Prisma)
  infrastructure/ # Framework setup
  shared/         # Utils, constants
```

**What I learned:** The key insight was that `core/` should have ZERO framework imports - no Express, no Prisma, no React. This keeps business logic testable and portable.

---

### Example 2: Compliance Balance Formula

**My Prompt:**
> "I'm reading the FuelEU regulation and found this formula for compliance balance: CB = (GHGIEtarget - GHGIEactual) × energy. The target for 2025 is 2% below 91.16. Can you help me implement this in TypeScript? I want to make sure the math is correct."

**Agent Response:**
```typescript
export function computeComplianceBalance(
  ghgIntensityActual: number,
  year: number,
  fuelConsumptionTonnes: number,
): { cb: number; target: number; energyInScope: number } {
  const target = getGhgTarget(year);  // 91.16 * (1 - 0.02) = 89.3368 for 2025
  const energyInScope = fuelConsumptionTonnes * 41_000; // MJ/t
  const cb = (target - ghgIntensityActual) * energyInScope;
  return { cb, target, energyInScope };
}
```

**My Verification:** 
I manually calculated with R001 data:
- Target 2025 = 91.16 × 0.98 = 89.3368
- Energy = 5000 × 41000 = 205,000,000 MJ  
- CB = (89.3368 - 91.0) × 205,000,000 = -341,096,000 gCO₂eq (deficit)

The formula matched! ✅

---

### Example 3: Pool Allocation Bug

**My Prompt:**
> "The pooling algorithm isn't working right. When I create a pool, the cbBefore values are getting overwritten. Here's my code... [pasted allocatePool function]"

**Agent Initial Output:**
```typescript
// Agent's first attempt - HAD A BUG
export function allocatePool(members) {
  const sorted = members.sort((a, b) => b.adjustedCB - a.adjustedCB);
  // ... transfer logic that modified original objects
}
```

**The Problem:** The agent's code was sorting and modifying the original array, which caused `cbBefore` to show the wrong values.

**My Fix:**
```typescript
// I had to fix it like this:
const result = members.map((m) => ({
  shipId: m.shipId,
  cbBefore: m.adjustedCB,  // Save BEFORE any transfers
  cbAfter: m.adjustedCB,   // This gets modified
}));
// Then sort and transfer on the result array, not original
```

**Lesson:** Always copy objects before mutating them! The agent didn't think about immutability.

---

### Example 4: Recharts Version Mismatch

**My Prompt:**
> "I installed recharts and trying to make a bar chart but getting errors. The Cell component isn't working like the docs show."

**Agent Response:** Suggested Recharts v3 syntax with `<Bar>` and some new props.

**The Problem:** I had Recharts v2 installed (via npm), but agent assumed v3. The API is different!

**What I Did:**
1. Checked my package.json - had `"recharts": "^2.12.0"`
2. Looked up v2 docs instead
3. Fixed the Cell import and usage

**Fixed Code:**
```tsx
import { Cell } from "recharts";
// v2 style - Cell goes INSIDE Bar
<Bar dataKey="ghgIntensity">
  {data.map((entry, i) => (
    <Cell key={i} fill={entry.compliant ? "green" : "red"} />
  ))}
</Bar>
```

---

### Example 5: Express 5 Typing Issue

**My Prompt:**
> "Getting a TypeScript error: 'Argument of type string | string[] is not assignable to parameter of type string' on req.params.routeId"

**Agent Response:** Explained that Express 5 has stricter typing and suggested:
```typescript
// Add type parameter to Request
async (req: Request<{ routeId: string }>, res: Response, next: NextFunction) => {
  const route = await service.setBaseline(req.params.routeId);
}
```

This one worked perfectly on first try! 

---

## Validation / Corrections

| What Agent Generated | Issue Found | How I Fixed It |
|---------------------|-------------|----------------|
| Prisma schema | Missing `@map` decorators | Added snake_case column mappings manually |
| Pool allocation | Mutated original array | Created new result array with spread operator |
| Recharts chart | Used v3 API syntax | Downgraded to v2 API based on installed version |
| Banking validation | Didn't check CB > 0 before banking | Added validation in BankingService |
| React Query setup | Missing error handling | Added onError callbacks to mutations |
| Dark mode toggle | Flickered on page load | Added inline script in index.html before React |

---

## Observations

### Where Agent Saved Time ⏱️

1. **Boilerplate code** - Express routers, Prisma queries, React Query hooks
   - Would've taken me 2-3 hours, done in 20 mins
   
2. **TypeScript interfaces** - Generated all the entity types from my descriptions
   - Saved maybe 30-40 mins of tedious typing

3. **TailwindCSS classes** - The agent knows all the utility classes
   - I always forget the exact syntax for things like `ring-offset-2`

4. **Test scaffolding** - Generated describe/it blocks with good structure
   - I just had to fill in the specific assertions

### Where Agent Failed or Hallucinated 🤦

1. **Outdated library APIs** - Assumed Recharts v3 when I had v2
   - Cost me ~30 mins debugging

2. **Complex business logic** - Pool allocation edge cases
   - Had to manually trace through the algorithm

3. **Prisma 7 configuration** - Generated config for new version
   - Wasted time, had to downgrade to v5

4. **Import paths** - Sometimes suggested wrong relative paths
   - Easy to fix but annoying

### How I Combined Tools Effectively 🔧

1. Used **AI research tool** first to understand FuelEU regulation concepts
2. Then used **AI coding assistant** to implement with that knowledge
3. Manually verified calculations against the regulation PDF
4. Used **AI coding assistant** for refactoring after manual fixes

---

## Best Practices I Followed

1. **Read before writing** - Always read existing code before asking agent to modify
2. **Small chunks** - Asked for one feature at a time, not entire files
3. **Verify calculations** - Manually checked all formula implementations
4. **Type-first** - Defined interfaces before implementation
5. **Test immediately** - Ran tests after each agent-generated change
6. **Commit often** - Made incremental commits to track what worked

---

## Session Timeline

| Session | Duration | What I Did |
|---------|----------|------------|
| Session 1 | ~45 min | Project setup, architecture planning, initial files |
| Session 2 | ~1 hour | Backend domain layer - entities, formulas, ports |
| Session 3 | ~45 min | Backend adapters - repos, controllers, wiring |
| Session 4 | ~30 min | Frontend setup - Vite, TailwindCSS, primitives |
| Session 5 | ~1.5 hours | Frontend pages - all 4 tabs with API integration |
| Session 6 | ~30 min | Testing - unit tests, integration tests |
| Session 7 | ~20 min | Bug fixes, documentation, final cleanup |

**Total time: ~5 hours** (vs estimated 12+ hours without AI assistance)
