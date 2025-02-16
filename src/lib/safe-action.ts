import { createSafeActionClient } from 'next-safe-action'

export const action = createSafeActionClient()

export type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: string
} 