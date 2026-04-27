# Frontend Callcentre Architecture Rules

See also: `docs/frontend-callcentre-target-blueprint.md` for target module structure and phased migration plan.

## Data Access
- Do not call `api.get/post/put/patch/delete` directly from `app/*` pages.
- All HTTP access must go through `src/services/*`.
- For API envelope parsing, use `src/lib/http/unwrap.ts`.
- Keep route components focused on UI orchestration and React Query wiring.

## Types Ownership
- Domain types must live in `src/types/*`.
- Do not export domain DTOs from `app/*/page.tsx`.
- Reuse shared domain types in components and hooks (`appeals`, `profile`, `site-orders`, `orders`).

## Error Handling
- Use `notifyApiError` and `getErrorMessage` from `src/lib/error-handling.ts` for user-facing failures.
- Prefer `logger.error` through the helper over ad-hoc `console.error` in feature code.
- Avoid silent catches; if an error is intentionally ignored, add a short comment.

## Form Primitives
- New form controls should use UI primitives from `src/components/ui` (`Input`, `Select`, `Textarea`).
- Apply style helpers from `src/components/ui/form-styles.ts` for themed fields.
- Avoid new raw `<input>/<select>/<textarea>` unless there is a hard technical constraint.

## Query Layer
- Prefer native TanStack Query patterns; avoid custom `queryKey` stabilization tricks.
- Keep query/mutation functions in services and query keys stable/predictable.
- Keep cache settings explicit in query hooks (`staleTime`, `gcTime`, retries).

## PR Checklist
- [ ] No direct API calls in pages for covered domains.
- [ ] No new local domain interfaces in `app/*` or feature components.
- [ ] Errors routed through `notifyApiError`.
- [ ] New forms use DS primitives + `form-styles`.
- [ ] Query hooks remain thin and testable.

