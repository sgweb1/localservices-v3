import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './mocks/server'

// Start MSW server przed testami
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  console.log('🔧 MSW server started for integration tests')
})

// Reset handlers po każdym teście
afterEach(() => {
  server.resetHandlers()
})

// Cleanup po wszystkich testach
afterAll(() => {
  server.close()
  console.log('🔧 MSW server closed')
})
