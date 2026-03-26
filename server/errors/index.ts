// Base domain error — all custom errors extend this
export class DomainError extends Error {
  readonly code: string
  readonly statusCode: number

  constructor(message: string, code: string, statusCode = 400) {
    super(message)
    this.name = 'DomainError'
    this.code = code
    this.statusCode = statusCode
    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class InvalidStateError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_STATE', 409)
    this.name = 'InvalidStateError'
  }
}

export class ValidationError extends DomainError {
  readonly fields?: Record<string, string>

  constructor(message: string, fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 422)
    this.name = 'ValidationError'
    this.fields = fields
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}

// Utility: format any error into a consistent API response shape
export function toErrorResponse(error: unknown): {
  error: { code: string; message: string; fields?: Record<string, string> }
  status: number
} {
  if (error instanceof DomainError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        fields: error instanceof ValidationError ? error.fields : undefined,
      },
      status: error.statusCode,
    }
  }
  console.error('[UnhandledError]', error)
  return {
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    status: 500,
  }
}
