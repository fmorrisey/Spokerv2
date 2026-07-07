import { jest } from '@jest/globals';
import { authorize } from '../../src/middleware/authorize';

describe('authorize middleware', () => {
  it('calls next with no args when the user has an allowed role', () => {
    const req: any = { user: { userId: 'u1', role: 'owner' } };
    const res: any = {};
    const next = jest.fn();

    authorize('owner')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with 403 when the user role is not allowed', () => {
    const req: any = { user: { userId: 'u1', role: 'customer' } };
    const res: any = {};
    const next = jest.fn();

    authorize('owner')(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('calls next with 403 when req.user is missing', () => {
    const req: any = {};
    const res: any = {};
    const next = jest.fn();

    authorize('owner')(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('accepts any of several allowed roles', () => {
    const req: any = { user: { userId: 'u1', role: 'customer' } };
    const res: any = {};
    const next = jest.fn();

    authorize('owner', 'customer')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
