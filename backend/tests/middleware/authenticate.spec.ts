import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../src/middleware/authenticate';

jest.mock('jsonwebtoken');

describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next with 401 if Authorization header is missing', () => {
    const req: any = { headers: {} };
    const res: any = {};
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should call next with 401 if token is invalid', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });

    const req: any = { headers: { authorization: 'Bearer bad-token' } };
    const res: any = {};
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should set req.user and call next with no args on valid token', () => {
    const payload = { userId: 'user1', role: 'customer' };
    (jwt.verify as jest.Mock).mockReturnValue(payload as any);

    const req: any = { headers: { authorization: 'Bearer valid-token' } };
    const res: any = {};
    const next = jest.fn();

    authenticate(req, res, next);

    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalledWith();
  });
});
