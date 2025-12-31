import { setupServer } from 'msw/node'
import { dashboardHandlers } from './handlers/dashboard'

/**
 * MSW Server dla testów integracyjnych
 * 
 * Mockuje API responses w Node.js environment (Vitest)
 */
export const server = setupServer(...dashboardHandlers)
