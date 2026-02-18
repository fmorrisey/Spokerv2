import { sanitizeBody } from '../../src/middleware/sanitize';

describe('sanitizeBody middleware', () => {
  function makeReq(body: unknown, query?: unknown, params?: unknown): any {
    return { body, query: query ?? {}, params: params ?? {} };
  }

  const res: any = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should strip HTML tags from string values in body', () => {
    const req = makeReq({ name: '<script>alert(1)</script>hello' });
    sanitizeBody(req, res, next);
    expect(req.body.name).toBe('hello');
    expect(next).toHaveBeenCalledWith();
  });

  it('should strip HTML tags from nested objects', () => {
    const req = makeReq({ user: { email: '<b>user@example.com</b>' } });
    sanitizeBody(req, res, next);
    expect(req.body.user.email).toBe('user@example.com');
  });

  it('should strip HTML tags from arrays', () => {
    const req = makeReq({ tags: ['<em>tag1</em>', '<b>tag2</b>'] });
    sanitizeBody(req, res, next);
    expect(req.body.tags).toEqual(['tag1', 'tag2']);
  });

  it('should not modify non-string values', () => {
    const req = makeReq({ count: 42, active: true, data: null });
    sanitizeBody(req, res, next);
    expect(req.body.count).toBe(42);
    expect(req.body.active).toBe(true);
    expect(req.body.data).toBeNull();
  });

  it('should sanitize req.query', () => {
    const req = makeReq({}, { search: '<script>xss</script>clean' });
    sanitizeBody(req, res, next);
    expect(req.query.search).toBe('clean');
  });

  it('should sanitize req.params', () => {
    const req = makeReq({}, {}, { id: '<img src=x onerror=alert(1)>abc' });
    sanitizeBody(req, res, next);
    expect(req.params.id).toBe('abc');
  });

  it('should call next after sanitizing', () => {
    const req = makeReq({ value: 'plain text' });
    sanitizeBody(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should handle empty body without error', () => {
    const req: any = { body: null, query: {}, params: {} };
    expect(() => sanitizeBody(req, res, next)).not.toThrow();
    expect(next).toHaveBeenCalledWith();
  });
});
