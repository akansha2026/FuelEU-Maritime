# Reflection on AI Agent Usage

## What I Learned

Going into this project, I'd used GitHub Copilot for autocomplete but never really "pair programmed" with an AI agent. This assignment changed my perspective on how to work with these tools effectively.

### The Good Surprises

**1. Architecture discussions are actually useful**

I was skeptical about asking an AI for architecture advice - figured it would just give generic textbook answers. But when I described the FuelEU requirements and asked about hexagonal architecture, the agent gave me a practical folder structure that actually made sense for THIS project. It understood that the compliance calculations needed to be isolated from Express/Prisma so they'd be testable.

**2. Boilerplate is where AI shines**

Writing Express route handlers, Prisma queries, React Query mutations... this stuff is tedious but important. The agent generated 90% of it correctly. I just had to review and tweak. What would've been 2 hours of copy-paste-modify became 20 minutes of review.

**3. Debugging with context works**

When I pasted my buggy pool allocation code and described the symptom, the agent identified that I was mutating the original array. It didn't just fix it - it explained WHY immutability mattered in this case. That's better than Stack Overflow because it had my actual code context.

### The Frustrations

**1. Version mismatches are painful**

The agent confidently generated Recharts v3 syntax when I had v2 installed. Same with Prisma 7 vs 5. It doesn't actually know what versions are in my package.json unless I tell it. Lost probably 45 minutes to this across the project.

**2. Business logic still needs a human brain**

The FuelEU compliance formulas aren't that complex, but the agent couldn't verify them against the regulation. I had to read Annex IV myself, understand what "GHGIEtarget" means, and manually verify the calculations. The agent is a code generator, not a domain expert.

**3. Sometimes it's faster to just write it myself**

For simple utility functions or one-line fixes, asking the agent and waiting for a response is slower than just typing. I learned to use AI for complex/tedious stuff and my own brain for quick edits.

---

## Efficiency Gains

Here's my honest breakdown of time spent:

| Task | Without AI (Est.) | With AI (Actual) | Speedup |
|------|-------------------|------------------|---------|
| Project scaffolding | 1.5 hours | 20 min | ~4.5x |
| Backend domain layer | 2 hours | 30 min | ~4x |
| Backend adapters | 1.5 hours | 25 min | ~3.5x |
| Frontend components | 3 hours | 1 hour | ~3x |
| Styling (Tailwind) | 2 hours | 30 min | ~4x |
| Testing | 1.5 hours | 30 min | ~3x |
| Debugging/fixes | 1 hour | 45 min | ~1.3x |
| **Total** | **~12.5 hours** | **~5 hours** | **~2.5x** |

The overall speedup is about 2.5x, not the 5-10x that AI marketing claims. The debugging/fixes category is where AI helps least - I still had to understand the problems myself.

---

## What I'd Do Differently

### 1. Version pinning upfront

Next time, I'd start every conversation with "I'm using these exact versions: [paste package.json dependencies]". Would've avoided the Recharts and Prisma version confusion.

### 2. Smaller, more specific prompts

My early prompts were too broad ("help me build a banking service"). Better prompts are specific: "implement a bankSurplus method that validates CB > 0, creates a BankEntry record, and returns the entry."

### 3. Ask for tests alongside implementation

Instead of generating code then tests separately, I should ask: "implement this function AND write tests for it in the same response." The agent does better when it has to think about edge cases while writing the code.

### 4. Use AI for code review

I didn't do this, but I should've asked: "review this code for potential bugs or improvements." Human code review is valuable, AI code review could catch some issues too.

### 5. Keep a "learnings" doc

By session 4, I'd forgotten some lessons from session 1. Should've kept notes about what works/doesn't work with the specific AI agent.

---

## Honest Assessment

**Would I use AI agents again?** Absolutely. The time savings are real, especially for boilerplate-heavy full-stack work.

**Did it make me a worse programmer?** No. I still had to understand hexagonal architecture, read the FuelEU regulation, debug the pool allocation, and verify all the formulas. The AI just handled the typing.

**Is the code quality lower?** Maybe slightly? Some AI-generated code is more verbose than I'd write. But it's consistent and well-structured. I'd rather have slightly verbose working code than clever broken code.

**What's the real skill now?** Knowing WHEN to use AI and WHAT to ask. Prompt engineering is real, but it's not magic - it's just being specific about what you want.

---

## Final Thought

The biggest mindset shift: AI is not a replacement for understanding. It's a replacement for typing. I still needed to understand:
- What hexagonal architecture is and why it matters
- How FuelEU compliance balance is calculated
- Why React Query invalidation matters
- What TypeScript strict mode catches

The agent just helped me express that understanding in code faster.
