# Architectural Rules

**See `.cursorrules` in project root for project-specific architectural guidelines and patterns.**

This document provides supplementary architectural standards for the Continue development tool.

## Non-Negotiable Standards

### Backend (Laravel)

1. **Controllers**
   - Maximum 15 lines of code
   - Only validate input and call service
   - Return Resource or JsonResponse
   - Use `authorize()` for permissions

2. **Services**
   - Contains ALL business logic
   - Pure functions where possible
   - Type-hint all parameters and returns
   - Throw exceptions for errors, don't return error arrays

3. **DTOs**
   - Define expected input data structure
   - Validate with constructor or factory method
   - Immutable (readonly properties)
   - Named clearly: CreateBookingDTO, UpdateProfileDTO

4. **Resources**
   - Define API response structure
   - Transform data for API consumption
   - Never expose sensitive fields
   - Use conditional attributes with `when()`

5. **Type Hints**
   - Every method signature must have types
   - Return types required (not `mixed`)
   - Use strict types: `declare(strict_types=1);`
   - Parameter types always specified

### Frontend (React)

1. **Components**
   - Pure UI only, no business logic
   - Accept props, return JSX
   - Use `React.FC<Props>` type annotation
   - Max 100 lines of code per component

2. **Custom Hooks**
   - Extract data-fetching into hooks
   - Naming: `useData`, `useForm`, `useFetch`
   - Handle loading and error states
   - Document dependencies and side effects

3. **API Logic**
   - Centralized in `src/api/client.ts`
   - Use React Query for server state
   - Never hardcode URLs
   - Always type API responses

4. **Type Safety**
   - `tsconfig.json`: strict mode enabled
   - No `any` types without `// @ts-ignore` comment
   - Interface for every API response
   - Props types for every component

5. **Validation**
   - Validate before sending requests
   - Handle all error cases
   - Show user-friendly error messages
   - Log errors for debugging

## Forbidden Patterns

- ❌ `axios.get()` directly in components
- ❌ `useState` for server state (use React Query)
- ❌ Business logic in controllers
- ❌ Untyped function parameters
- ❌ Hardcoded API URLs
- ❌ Catch-all error handlers
- ❌ Magic strings for API keys
- ❌ Data transformation in components
- ❌ Direct DOM manipulation
- ❌ Circular dependencies

## Required for Every Feature

- [ ] Type definitions (interfaces, DTOs)
- [ ] Input validation (FormRequest, React validation)
- [ ] Error handling (try-catch, error UI)
- [ ] API contract (Resource, response interface)
- [ ] Tests (unit, integration, or e2e)
- [ ] Documentation (code comments, types)
- [ ] No console.log() in production code
