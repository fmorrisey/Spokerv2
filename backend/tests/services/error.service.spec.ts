import {
  createError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internal,
  toErrorEvent,
  reportError,
} from '../../src/services/error.service';

describe('error.service factory helpers', () => {
  it('createError attaches the given status code and message', () => {
    const err = createError('boom', 418);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('boom');
    expect(err.statusCode).toBe(418);
  });

  it('named helpers carry the right status codes', () => {
    expect(badRequest().statusCode).toBe(400);
    expect(unauthorized().statusCode).toBe(401);
    expect(forbidden().statusCode).toBe(403);
    expect(notFound().statusCode).toBe(404);
    expect(conflict().statusCode).toBe(409);
    expect(internal().statusCode).toBe(500);
  });

  it('named helpers accept a custom message', () => {
    expect(notFound('Product not found').message).toBe('Product not found');
  });
});

describe('error.service reporting', () => {
  it('toErrorEvent normalizes an AppError into the wire contract', () => {
    const event = toErrorEvent(notFound('missing'), { path: '/api/v1/products/1', method: 'GET' });
    expect(event).toEqual(
      expect.objectContaining({
        message: 'missing',
        statusCode: 404,
        name: 'Error',
        path: '/api/v1/products/1',
        method: 'GET',
        service: 'spoker-backend',
      })
    );
    expect(typeof event.timestamp).toBe('string');
  });

  it('toErrorEvent defaults to 500 for an untagged error', () => {
    const event = toErrorEvent(new Error('plain'));
    expect(event.statusCode).toBe(500);
    expect(event.message).toBe('plain');
  });

  it('toErrorEvent tolerates non-Error throwables', () => {
    const event = toErrorEvent('just a string');
    expect(event.statusCode).toBe(500);
    expect(event.message).toBe('Internal Server Error');
    expect(event.name).toBe('Error');
  });

  it('reportError returns the normalized event', () => {
    const event = reportError(forbidden('nope'), { path: '/x', method: 'POST' });
    expect(event.statusCode).toBe(403);
    expect(event.message).toBe('nope');
    expect(event.service).toBe('spoker-backend');
  });
});
