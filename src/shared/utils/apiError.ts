import { isAxiosError } from 'axios'

/** The form field an API error is about, when the server names one. */
export function getApiErrorField(err: unknown): string | undefined {
  if (isAxiosError<{ field?: unknown }>(err)) {
    const field = err.response?.data?.field
    if (typeof field === 'string' && field) return field
  }
  return undefined
}

/**
 * Pulls a human-readable message out of a failed API call. The backend answers
 * errors as `{ success: false, error: "<message>" }`.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ error?: unknown }>(err)) {
    const serverMessage = err.response?.data?.error
    if (typeof serverMessage === 'string' && serverMessage) return serverMessage
    if (err.response?.status === 403) return 'Anda tidak memiliki akses untuk aksi ini.'
  }
  return fallback
}
