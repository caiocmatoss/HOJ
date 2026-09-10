export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function toApiError(status: number, payload: unknown): ApiError {
  const value = payload as { message?: unknown; error?: unknown; code?: unknown } | null;
  const message = Array.isArray(value?.message)
    ? value.message.filter((item): item is string => typeof item === 'string').join(', ')
    : typeof value?.message === 'string'
      ? value.message
      : typeof value?.error === 'string'
        ? value.error
        : `Erro HTTP ${status}`;
  return new ApiError(status, message, typeof value?.code === 'string' ? value.code : undefined);
}
