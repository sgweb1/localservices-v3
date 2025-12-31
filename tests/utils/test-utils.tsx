import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ReactElement, ReactNode } from 'react'

/**
 * Tworzy nowy QueryClient z wyłączonymi retry i cache dla testów
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AllTheProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
}

/**
 * Wrapper z wszystkimi providerami potrzebnymi do testów
 */
export function AllTheProviders({ children, queryClient }: AllTheProvidersProps) {
  const client = queryClient || createTestQueryClient()
  
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

/**
 * Custom render function z automatycznym wrapperem
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  const { queryClient, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export wszystkiego z @testing-library/react
export * from '@testing-library/react'
