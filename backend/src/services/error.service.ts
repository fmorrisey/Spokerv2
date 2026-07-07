/**
 * Error service — the single home for application error construction and
 * error reporting.
 *
 * Two responsibilities:
 *  1. A typed error factory (`createError` + named helpers) so controllers,
 *     services, and middleware stop hand-rolling `Object.assign(new Error(), …)`.
 *  2. `reportError()` — a structured reporting boundary. Today it logs locally,
 *     but it is the single seam a dedicated error-processing microservice
 *     (planned in C++) will take over. Keep the `ErrorEvent` shape stable:
 *     it is the wire contract that service will consume.
 */

/** An Error carrying an HTTP status code. The `{ statusCode }` contract is what
 *  `middleware/errorHandler.ts` reads to build the response. */
export interface AppError extends Error {
  statusCode: number;
}

/** Structured, transport-ready representation of an error. This is the wire
 *  contract for the future error-processing microservice — additive changes
 *  only. */
export interface ErrorEvent {
  message: string;
  statusCode: number;
  name: string;
  stack?: string;
  path?: string;
  method?: string;
  timestamp: string;
  service: string;
}

const SERVICE_NAME = 'spoker-backend';

/** Create an Error tagged with an HTTP status code. */
export function createError(message: string, statusCode: number): AppError {
  return Object.assign(new Error(message), { statusCode });
}

export const badRequest = (message = 'Bad Request'): AppError => createError(message, 400);
export const unauthorized = (message = 'Unauthorized'): AppError => createError(message, 401);
export const forbidden = (message = 'Forbidden'): AppError => createError(message, 403);
export const notFound = (message = 'Not Found'): AppError => createError(message, 404);
export const conflict = (message = 'Conflict'): AppError => createError(message, 409);
export const internal = (message = 'Internal Server Error'): AppError => createError(message, 500);

/** Minimal shape of a request we care about for reporting — avoids coupling the
 *  service to Express's full `Request` type. */
interface RequestContext {
  path?: string;
  method?: string;
}

/** Normalize any thrown value into a structured `ErrorEvent`. */
export function toErrorEvent(error: any, context?: RequestContext): ErrorEvent {
  const statusCode = typeof error?.statusCode === 'number' ? error.statusCode : 500;
  return {
    message: error?.message ?? 'Internal Server Error',
    statusCode,
    name: error?.name ?? 'Error',
    stack: error?.stack,
    path: context?.path,
    method: context?.method,
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
  };
}

/**
 * Dispatch an error event to its sink.
 *
 * TODO(microservices): swap this local console sink for a dispatch to the C++
 * error-processing service (e.g. an HTTP/gRPC POST of the `ErrorEvent`). The
 * `ErrorEvent` shape above is the wire contract — keep it stable.
 */
function dispatch(event: ErrorEvent): void {
  // Suppressed under test to keep suite output clean (matches prior behavior).
  if (process.env.NODE_ENV === 'test') return;
  console.error('ERROR OCCURRED :: ', event);
}

/**
 * Report an error. Normalizes it into an `ErrorEvent`, dispatches it to the
 * sink, and returns the event (useful for callers/tests). This is the boundary
 * a remote error-processing microservice will eventually own.
 */
export function reportError(error: any, context?: RequestContext): ErrorEvent {
  const event = toErrorEvent(error, context);
  dispatch(event);
  return event;
}
