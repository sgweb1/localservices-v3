# Continue Configuration

This directory contains configuration and prompts for the [Continue](https://www.continue.dev/) IDE plugin.

## Files

- **`config.json`** - Main Continue configuration with Ollama model setup and system prompt
- **`context.md`** - Project context (editable per task with @-annotations)
- **`rules.md`** - Architectural standards and best practices
- **`prompts/`** - Reusable task-specific prompt templates

## Project Rules

**See `.cursorrules` in the project root for the primary source of truth for project-specific rules.**

The `.cursorrules` file is automatically used by Cursor IDE and contains:
- Project architecture patterns
- React Query deduplication strategies
- Feature-specific guidelines
- Component patterns
- API contract specifications

## Usage with Continue

### For Local Development (Cursor IDE)
Use the `.cursorrules` file - it's automatically loaded by Cursor and contains all project-specific guidance.

### For Continue Tool
1. Reference `.cursorrules` content when working on features
2. Use `context.md` to describe the current task with `@mentions`
3. Use `prompts/` templates for specific types of work:
   - `backend-feature.md` - New backend endpoint or service
   - `frontend-feature.md` - New React component or hook
   - `refactor.md` - Code refactoring with safety
   - `review.md` - Code review checklist

## Quick Setup

In Continue settings, ensure:
```json
{
  "models": [
    {
      "title": "Ollama Local (Deepseek)",
      "provider": "ollama",
      "model": "deepseek-coder:33b",
      "apiBase": "http://localhost:11434"
    }
  ]
}
```

Then use `/edit` or `/chat` commands referencing this configuration.
