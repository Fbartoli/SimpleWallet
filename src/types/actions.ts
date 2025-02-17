export interface ActionResponse {
  success: boolean
  error?: {
    code: string
    message: string
  }
} 