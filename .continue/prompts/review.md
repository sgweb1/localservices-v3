# Code Review Checklist

## Architecture & Design

- [ ] Separation of concerns maintained?
- [ ] No business logic in controllers/components?
- [ ] API contract clearly defined?
- [ ] Reusable hooks/services created where needed?
- [ ] Naming is clear and consistent?

## Type Safety (Critical)

- [ ] All function parameters have types?
- [ ] All function returns have types?
- [ ] No `any` types used without justification?
- [ ] TypeScript interfaces match API responses?
- [ ] DTOs properly type input data?

## Validation & Error Handling

- [ ] Input validated at entry point?
- [ ] Error cases handled gracefully?
- [ ] User sees friendly error messages?
- [ ] No swallowed exceptions?
- [ ] Errors logged for debugging?

## API Contract

- [ ] Response matches Resource/interface?
- [ ] No extra sensitive data exposed?
- [ ] Pagination/meta included when needed?
- [ ] Status codes correct (200, 201, 400, 401, 403, 404, 422)?
- [ ] Error response format consistent?

## React Specifics

- [ ] No data-fetching logic in components?
- [ ] Loading and error states handled?
- [ ] Props properly typed?
- [ ] No hardcoded API URLs?
- [ ] React Query used for server state?

## Laravel Specifics

- [ ] Controller under 15 lines?
- [ ] Service contains business logic?
- [ ] FormRequest validates input?
- [ ] Resource defines response?
- [ ] Uses Eloquent, not raw SQL?

## Code Quality

- [ ] No `console.log()` in production code?
- [ ] No commented-out code?
- [ ] Variable names descriptive?
- [ ] Functions single responsibility?
- [ ] Duplicate code extracted?

## Testing

- [ ] Tests exist and pass?
- [ ] Edge cases covered?
- [ ] Error cases tested?
- [ ] No hardcoded test data?

## Questions to Ask

1. Would someone understand this in 6 months?
2. Can this be tested independently?
3. Does this have side effects?
4. Is this the simplest way to solve it?
5. Does this follow the team's patterns?
