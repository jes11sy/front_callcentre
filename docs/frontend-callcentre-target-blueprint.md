# Frontend Callcentre Target Blueprint

This document defines the target architecture for `frontend callcentre` and a migration plan that can be executed incrementally without freezing product work.

## Goals
- Remove cross-feature coupling (`orders` <-> `telephony`, `telephony` <-> `appeals`).
- Establish single ownership for domain types, API access, and state boundaries.
- Keep App Router pages thin and predictable.
- Improve testability and CI safety with minimal disruption.

## Target Folder Structure

```text
src/
  app/
    (protected)/
      telephony/page.tsx
      orders/page.tsx
      appeals/page.tsx
      site-orders/page.tsx
      penalties/page.tsx
      profile/page.tsx
    login/page.tsx
    layout.tsx
  features/
    auth/
      model/
        store.ts
        session.ts
      api/
        auth.service.ts
      ui/
        LoginForm.tsx
        AuthGate.tsx
    telephony/
      model/
        types.ts
        useTelephonyState.ts
      api/
        telephony.service.ts
      ui/
        CallTable.tsx
        CallRow.tsx
    orders/
      model/
        types.ts
        useOrdersFilters.ts
      api/
        orders.service.ts
      ui/
        OrdersTable.tsx
        CreateOrderModal.tsx
    appeals/
      model/
        types.ts
      api/
        appeals.service.ts
      ui/
        AppealsTable.tsx
        CreateAppealModal.tsx
    site-orders/
      model/
        types.ts
      api/
        site-orders.service.ts
      ui/
        SiteOrdersTable.tsx
    penalties/
      model/
        types.ts
      api/
        penalties.service.ts
      ui/
        PenaltiesTable.tsx
    recordings/
      model/
        useCallRecordingPlayback.ts
      ui/
        StickyAudioPlayer.tsx
  shared/
    api/
      http-client.ts
      error-mapping.ts
    ui/
      primitives/
      notifications/
    lib/
      logger.ts
      date.ts
      formatters.ts
    config/
      env.ts
  widgets/
    dashboard-layout/
      ui/
        DashboardLayout.tsx
    sidebar/
      ui/
        Sidebar.tsx
```

## Layer Boundaries

### Import Rules
- `app/*` can import from `features/*`, `widgets/*`, `shared/*`.
- `widgets/*` can import from `features/*` only via public API (`index.ts`) or from `shared/*`.
- `features/*` can import only from:
  - same feature internals
  - `shared/*`
- Cross-feature imports are forbidden (`features/orders` must not import from `features/telephony` internals).
- `shared/*` must never import from `features/*`, `widgets/*`, or `app/*`.

### Public API Convention
Each feature exposes only stable entry points:
- `features/<feature>/index.ts` for UI exports.
- `features/<feature>/model/index.ts` for model hooks/types.
- `features/<feature>/api/index.ts` for service calls.

Internal files are private by default.

## State and Data Flow Contract

### Global State
- Keep global client state in a single auth/design store module:
  - `features/auth/model/store.ts`
  - `shared/config/theme-store.ts` (or keep in auth if combined).
- Do not duplicate user session in ad-hoc localStorage keys.

### Server State
- React Query is the single server-state cache.
- Query keys are centralized in `shared/api/query-keys.ts`.
- Retry policy must be explicit and AxiosError-aware.

### HTTP
- One HTTP client (`shared/api/http-client.ts`).
- One refresh-token strategy (interceptor-driven or refresh service, not both).
- Feature services are wrappers over the shared client.

### Error Handling
- Error parsing is UI-agnostic in `shared/api/error-mapping.ts`.
- UI notifications are called from feature/UI hooks, not from low-level shared mappers.

## Immediate Priority Refactors

1. **Unify `CreateOrderModal`**
   - Pick one canonical implementation in `features/orders/ui/CreateOrderModal.tsx`.
   - Replace legacy usage in telephony and remove duplicate file.

2. **Extract recordings module**
   - Move `StickyAudioPlayer` and playback hooks to `features/recordings`.
   - Replace imports from telephony internals in orders page.

3. **Decouple telephony from appeals modal**
   - Replace direct modal import with callback prop (`onCreateAppeal`) or orchestration in page/widget layer.

4. **Move penalties types to feature model/shared types**
   - Remove domain type exports from UI component files.

5. **Split heavy pages into feature views**
   - `app/*/page.tsx` should orchestrate only.
   - Data hooks and table/form logic move to feature modules.

## Migration Plan (No Big Bang)

## Phase 0 - Safety Rails (1-2 days)
- Add boundary lint rules (`no-restricted-imports`) for forbidden cross-layer imports.
- Enable mandatory `npm run type-check` in CI.
- Keep `next build` unchanged initially, but fail CI on type-check errors.
- Add architecture owner checklist to PR template.

## Phase 1 - Auth/Data Consistency (2-3 days)
- Consolidate login/session update flow:
  - one path to set Zustand auth state
  - one refresh strategy
- Normalize profile/user source of truth.

Exit criteria:
- No manual writes to duplicated auth keys outside store persistence.
- No duplicate refresh network path.

## Phase 2 - Feature Boundary Cleanup (3-5 days)
- Merge duplicate order modal implementations.
- Create recordings feature and migrate imports.
- Remove direct `telephony -> appeals` modal coupling.

Exit criteria:
- No direct imports between `orders`, `telephony`, `appeals` internals.
- Cross-feature interactions are callback/event based via page/widget orchestration.

## Phase 3 - Page Slimming (3-5 days)
- Extract large route files (`site-orders`, `appeals`, `orders`) into feature views/hooks.
- Keep route pages under ~100 lines and mostly declarative.

Exit criteria:
- Route pages mostly compose feature views.
- Query/mutation logic is colocated in feature model/api.

## Phase 4 - Legacy and Dead Code Removal (1-2 days)
- Remove unused telephony versions/components and dead lazy placeholders.
- Remove stale query client helpers not used in runtime.
- Clean config drift and broken scripts.

Exit criteria:
- No orphan feature implementations.
- `package.json` scripts run successfully and are platform-documented.

## Testing and Quality Gates
- Minimum required tests before each phase completion:
  - Auth smoke: login, session restore, logout.
  - Telephony critical flow: list calls, open row actions.
  - Orders critical flow: list orders, create order.
- Add at least:
  - unit tests for data mappers/services
  - integration tests for feature hooks with QueryClient provider
  - e2e smoke for protected-route journey

## Definition of Done for Architecture Cleanup
- No forbidden imports by lint boundary rules.
- No domain DTOs declared in UI components or pages.
- `app/*` pages remain orchestration-only.
- One HTTP/refresh policy, one session-source policy.
- Legacy duplicates deleted or explicitly marked with removal ticket/date.

## Recommended Naming Conventions
- `*.service.ts` for backend communication.
- `use<Domain><Action>.ts` for feature hooks.
- `*View.tsx` for composed feature screens.
- `*Table.tsx`, `*Modal.tsx`, `*Form.tsx` for UI blocks.
- `types.ts` per feature model and optional `shared/types/*` for cross-domain contracts.

## Notes
- This blueprint is intentionally incremental: each phase can ship independently.
- If business deadlines are tight, execute only Phases 0-2 first to remove the highest architectural risk.
