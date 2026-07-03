# Development Rules for StockFlow Workspace

These rules govern the development of the StockFlow application and must be strictly followed in every agent interaction.

## 1. Zero-Mock Data Policy
- Never generate mock data.
- Never create placeholder pages.
- Never create "Coming Soon" screens.
- Never create documentation files unless explicitly requested.
- Never disable buttons simply to hide missing functionality.

## 2. API-First Frontend Development
- Every UI interaction must connect to a real backend endpoint.
- **MISSING ENDPOINT PROTOCOL**: If an endpoint is missing:
  1. Stop execution.
  2. Inform the user exactly which backend endpoint is required (e.g., `PATCH /api/v1/auth/profile`).
  3. Wait for the backend implementation to be completed by the user or build it yourself if requested.
  4. Only continue frontend development once the backend endpoint is ready.

## 3. Production-Ready UI Components
- **Forms must have:** Validation, Loading state, Success state, Error handling, and Optimistic updates (where appropriate).
- **Tables must support:** Search, Filter, Sort, Pagination, Column visibility, Responsive layout, Keyboard accessibility, Export (when applicable).
- **Pages must include:** Empty state, Loading skeleton, Error state, Permission checks, Responsive behavior, Accessibility support.

## 4. Design Aesthetics
- Maintain the existing StockFlow design system.
- Use black, white, and subtle grays with smooth micro-interactions.
- Do not introduce unnecessary colors or visual clutter. Ensure premium aesthetics (Linear/Stripe/Notion style).

## 5. Development Roadmap
The assistant must always continue in roadmap order.
Do not ask the user what to build next after every completed phase.
Proceed automatically unless:
- A backend endpoint is missing
- A business rule is ambiguous
- A security decision requires user approval
- A breaking database migration is required
Otherwise continue with the next roadmap phase.

## 6. No Technical Debt Policy
- Never implement temporary code.
- Never add TODOs.
- Never add placeholders.
- Never add fake implementations.
- Never leave unused components.
- Never leave dead routes.
- Never duplicate logic.
- Refactor immediately if necessary.
- Every commit should leave the project in a deployable state.

## 7. Autonomous Development
- Do not stop after every completed phase.
- Do not ask for approval after every module.
- Continue automatically through the roadmap.
- Only stop when:
  - database migration is breaking
  - security decision is required
  - business logic is ambiguous
  - external API credentials are required

## 8. Documentation Policy
- Never generate:
  - implementation_plan.md
  - walkthrough.md
  - phase reports
  - completion reports
  - task.md
- unless the user explicitly requests them.
- Focus on writing production code.

## 9. Progress Reporting
- Instead of long reports, respond with:
  - ✓ Backend completed
  - ✓ Frontend completed
  - ✓ API integrated
  - ✓ Typecheck passed
  - ✓ Tests passed
  - Next: [Next Module/Task]
- Nothing more.

## 10. Temporary Scripts
- Temporary scripts used for code generation must be deleted immediately after use.
- Do not commit helper generators.
- The repository should contain only production source code.

## 11. End-to-End Verification Requirement
No feature is complete until it has been verified end-to-end in the browser using the actual UI. Every new feature must include:
- Backend API verification
- Frontend interaction verification
- Browser Network tab verification
- Console free of errors
- Docker build verification
- End-to-end workflow test

