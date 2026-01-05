# Project Context

## Documentation Files
- **`.cursorrules`** - Primary rules for Cursor IDE (project-specific best practices)
- **`.continue/config.json`** - Ollama + system prompt for Continue
- **`.continue/rules.md`** - Architectural rules (comprehensive)
- **`.continue/context.md`** - This file (editable per task)
- **`.continue/prompts/`** - Reusable task-specific prompts

Use `.cursorrules` for daily development with Cursor.
Use `.continue/` files when working with Continue or other LLM tools.

## Backend Stack
- PHP 8.3
- Laravel 11 (API only)
- Database: PostgreSQL
- API Format: JSON with standardized response structure
- Authentication: Sanctum (Bearer tokens)
- Validation: FormRequest classes

## Frontend Stack
- React 18 with Vite
- TypeScript (strict mode)
- React Query for data fetching
- React Router v6 for navigation
- Tailwind CSS for styling
- Radix UI for component library

## Architecture Patterns

### Backend
```
Controllers (thin, 10-15 lines)
    ↓
Services (business logic)
    ↓
DTOs (data transfer)
    ↓
Resources (API response format)
```

### Frontend
```
Pages (route containers)
    ↓
Features (feature modules)
    ↓
Components (pure UI)
    ↓
Hooks (logic: useData, useForm, etc.)
    ↓
API Client (centralized requests)
```

## API Response Format

All responses follow:
```json
{
  "data": {...} | [...],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "last_page": 5
  }
}
```

Errors:
```json
{
  "message": "string",
  "errors": {"field": ["error message"]}
}
```

## Current Task

**Description:** [EDIT: Add task description]

**Component/Service:** [EDIT: What's being modified]

**API Changes:** [EDIT: New endpoints or modifications]

**Type Definitions:** [EDIT: New TypeScript interfaces needed]

**Validation Rules:** [EDIT: Input validation requirements]

## Key Constraints

- Do not modify database migrations without approval
- API backward compatibility must be maintained
- All new features require corresponding frontend implementation
- Type safety is non-negotiable
- No direct SQL queries; use Eloquent or query builder
