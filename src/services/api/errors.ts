export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code: string = 'http_error') { super(message); this.name = 'ApiError'; }
}
export class NetworkError extends Error { constructor(message = 'ارتباط با سرور برقرار نشد.') { super(message); this.name = 'NetworkError'; } }
