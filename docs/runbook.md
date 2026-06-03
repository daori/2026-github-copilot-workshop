# Runbook: Implementation, Testing, and Documentation Checklist

This runbook contains the concise checklist for implementing the PO backlog and maintaining quality during the workshop.

## Quick Purpose
- Ensure consistent implementation quality, test coverage, and documentation discipline for the PO backlog.

## Checklist (short & actionable)

- **Follow Patterns:** keep route handlers thin; put business logic in service functions.
- **Validate Early:** validate incoming requests at the route layer and return clear HTTP status codes and error messages.
- **Atomicity:** perform allocation/receipt updates inside database transactions and use row-level locks where appropriate.
- **Migrations:** add schema changes to `db/migrations/` and seeds to `db/seeds/`; ensure scripts are idempotent and documented.
- **Unit Tests:** add focused Jest tests for business rules, edge cases, and failure paths (especially over-allocation and status transitions).
- **E2E Tests:** add Playwright scenarios for the happy path and at least one negative flow (over-allocation); keep scenarios focused and deterministic.
- **Docs:** update `README.md` or `docs/` with new endpoints, sample requests/responses, the allocation rule, and any migration steps.
- **API Examples:** include a minimal request/response example for each endpoint added (`POST /api/purchase-orders`, `POST /api/purchase-orders/:id/submit`, `GET /api/purchase-orders/:id`, `GET /api/purchase-orders/:id/open-lines`).
- **Commits & PRs:** use small, focused commits; PR description must include verification steps, test notes, and any manual test instructions.
- **CI Gate:** ensure linting and tests run in CI; do not merge failing builds.
- **Secrets:** never commit secrets; include a `.env.example` with non-sensitive defaults.
- **UI Consistency:** follow existing CSS variables and component patterns; keep forms accessible and testable.
- **Error Handling & Logging:** surface user-friendly messages to the client and log server-side errors with sufficient context for debugging.
- **Accessibility:** keep form labels, keyboard focus, and ARIA attributes consistent with baseline patterns.

## Minimal Verification Commands

Run backend unit tests:

```bash
cd backend
npm test
```

Run frontend dev server and manual smoke test:

```bash
cd frontend
npm install
npm run dev
```

Run Playwright E2E tests (example):

```bash
npx playwright test tests/e2e --project=chromium
```

## Where to Update
- Implementation: `backend/src/services/purchase-order-service.js`, `backend/src/routes/purchase-order-routes.js`
- Tests: `backend/tests/services/purchase-order-service.test.js`, `tests/e2e/` (Playwright)
- Docs: `docs/` and `README.md`
- Frontend hooks: `frontend/src/api.js` and new pages under `frontend/src/pages/`

## Done Criteria (short)
- PO endpoints implemented and covered by unit tests.
- Allocation rule enforced atomically and covered by tests.
- Playwright covers happy path + negative case.
- Docs updated and PR includes verification steps.

