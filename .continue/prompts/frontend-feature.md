# Frontend Feature Implementation

## Process

1. **Define API Contract**
   - Create TypeScript interface for API response
   - Match backend Resource structure exactly
   - Type all required and optional fields

2. **Create Custom Hook**
   - Use React Query for server state
   - Handle loading, error, and success states
   - Validate response matches interface
   - Throw errors for failures

3. **Build Components**
   - Pure UI only
   - Accept data via props
   - Show loading/error states
   - No API calls directly

4. **Add Validation**
   - Validate form inputs before sending
   - Show inline error messages
   - Use React Hook Form or similar

## Code Template

**Hook (src/hooks/useYourData.ts)**
```typescript
interface YourDataResponse {
  data: YourData[];
  meta: { current_page: number; total: number };
}

export function useYourData(page: number = 1) {
  return useQuery<YourDataResponse>({
    queryKey: ['yourData', page],
    queryFn: () => apiClient.get(`/your-endpoint?page=${page}`),
  });
}
```

**Component (src/components/YourComponent.tsx)**
```typescript
interface YourComponentProps {
  data: YourData[];
  isLoading: boolean;
  error?: Error | null;
}

export const YourComponent: React.FC<YourComponentProps> = ({
  data,
  isLoading,
  error,
}) => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* render data */}</div>;
};
```

## Checklist

- [ ] TypeScript interfaces match backend Resources
- [ ] Custom hook for data fetching using React Query
- [ ] Components receive data via props
- [ ] Loading and error states handled
- [ ] Form validation before submit
- [ ] API client centralized
- [ ] No console.log in production code
- [ ] Responsive design tested
- [ ] Accessibility considered (labels, alt text)
