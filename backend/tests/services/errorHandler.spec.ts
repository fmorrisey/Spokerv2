import { errorHandler } from '../../src/middleware/errorHandler';
import { jest } from "@jest/globals";

describe('errorHandler middleware', () => {
  it('should respond with 500 and error message', () => {
    const err = new Error('Test error');
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Test error' }));
  });
});