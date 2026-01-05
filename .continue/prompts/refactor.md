# Refactoring Guidelines

## Before You Start

1. Run full test suite locally
2. Understand current behavior (don't break it)
3. Identify only what needs to change
4. Have a rollback plan

## Process

1. **Extract Service/Hook**
   - Move business logic OUT of component/controller
   - Create new service or custom hook
   - Keep old code working during transition

2. **Improve Types**
   - Add TypeScript interfaces
   - Remove `any` types
   - Type all function parameters

3. **Simplify API Logic**
   - Move axios calls to hooks
   - Centralize API client
   - Use React Query instead of useState

4. **Clean Up Components**
   - Remove business logic
   - Break into smaller components
   - Add prop types

## Safety Checklist

- [ ] Tests still pass after changes
- [ ] No breaking API changes
- [ ] Backward compatibility maintained
- [ ] Error handling improved or same
- [ ] Performance same or better
- [ ] No new dependencies without approval
- [ ] Code reviewed before merge

## Common Refactorings

### Extract Service (Backend)
- Move logic from controller to service
- Create DTO for input
- Update controller to call service
- Update tests

### Extract Hook (Frontend)
- Move useState and useEffect into custom hook
- Return data, loading, error
- Use in component
- Test hook independently

### Improve Types (Both)
- Add explicit return types
- Add parameter types
- Create interfaces for complex objects
- Remove inference where unclear
