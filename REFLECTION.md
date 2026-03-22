# Reflection on AI Agent Usage

## What I Learned Using AI Agents

Working with AI agents (Cursor Agent with Claude and Gemini) on this FuelEU Maritime compliance project taught me several valuable lessons:

### 1. Prompting is a Skill
The quality of output heavily depends on how you frame the question. Vague prompts like "build me a backend" produce generic code, while specific prompts like "implement the compliance balance formula from FuelEU Annex IV using TypeScript with proper typing" yield much better results. I learned to include context, constraints, and expected outputs in my prompts.

### 2. Domain Knowledge Still Matters
The AI agents didn't know the specifics of FuelEU Maritime Regulation (EU) 2023/1805. I had to:
- Read the regulation myself to understand the formulas
- Verify agent-generated calculations against the spec
- Correct the pool allocation algorithm when it didn't preserve cbBefore values

AI accelerates implementation but doesn't replace understanding the problem domain.

### 3. Architecture Decisions Require Human Judgment
When I asked about hexagonal architecture, the agent provided a good starting structure. However, deciding where to draw boundaries (what belongs in core vs adapters) required my own judgment based on the specific requirements and future maintainability needs.

## Efficiency Gains vs Manual Coding

| Task | Manual Time Est. | With AI | Speedup |
|------|------------------|---------|---------|
| Project scaffolding | 1-2 hours | 15 min | ~5x |
| Prisma schema + seed | 30 min | 5 min | ~6x |
| Express controllers | 1 hour | 10 min | ~6x |
| React components | 2-3 hours | 30 min | ~5x |
| Unit tests | 1 hour | 15 min | ~4x |
| TailwindCSS styling | 2 hours | 20 min | ~6x |

**Overall estimate:** What would have taken 10-12 hours manually was completed in approximately 2 hours with AI assistance—a roughly 5x improvement.

### Where AI Helped Most
1. **Boilerplate code** - Repetitive patterns like CRUD operations, route handlers
2. **Type definitions** - Generating interfaces from requirements
3. **Styling** - TailwindCSS classes for responsive design
4. **Test scaffolding** - Basic test structure and common assertions

### Where AI Struggled
1. **Complex business logic** - Pool allocation required manual debugging
2. **Integration issues** - Prisma adapter configuration needed manual fixes
3. **Version-specific APIs** - Suggested outdated Recharts syntax
4. **Edge cases** - Initial implementations missed boundary conditions

## Improvements for Next Time

### 1. Better Context Management
I would create a "context file" at the start with:
- Project requirements summary
- Tech stack decisions
- Key domain concepts (GHG intensity, compliance balance, etc.)
- Reference documentation links

This would help maintain consistency across prompts.

### 2. Incremental Verification
Rather than generating large chunks of code, I would:
- Generate smaller pieces
- Test each piece immediately
- Commit working code before moving on
- This catches issues earlier when they're easier to fix

### 3. More Specific Prompts
Instead of: "Create a banking service"
Better: "Create a BankingService class implementing IBankingService with these methods: getRecords(shipId, year), bankSurplus(shipId, year), applyBanked(shipId, year, amount). Validate that CB is positive before banking. Use ValidationError for business rule violations."

### 4. Leverage Agent Strengths
- Use AI for code generation, refactoring, and test writing
- Do manual review for business logic correctness
- Use AI for documentation and comments
- Manual review for security considerations

## Conclusion

AI agents are powerful productivity multipliers when used correctly. They excel at transforming clear requirements into working code quickly. However, they work best as "pair programming" partners rather than autonomous developers. The human engineer's role shifts from writing every line to:
- Providing clear requirements
- Reviewing and validating output
- Making architectural decisions
- Ensuring domain correctness

This project reinforced that AI agents are tools that amplify developer capabilities rather than replace developer judgment.
