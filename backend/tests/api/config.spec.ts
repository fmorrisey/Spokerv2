import * as configController from '../../src/controllers/config.controller';
import * as ConfigService from '../../src/services/config.service';
import app from '../../src/app';
import request from 'supertest';
import { jest } from '@jest/globals';
import { API_URL, Routes } from '../../src/models/constants';

describe('Config Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return config with demoMode false by default', () => {
    jest.spyOn(ConfigService, 'getConfig').mockReturnValue({ demoMode: false });

    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    configController.getAppConfig(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ demoMode: false });
  });

  it('should return config with demoMode true when demo mode is active', () => {
    jest.spyOn(ConfigService, 'getConfig').mockReturnValue({ demoMode: true });

    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    configController.getAppConfig(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ demoMode: true });
  });
});

describe('Config API', () => {
  it('GET /api/v1/config returns 200 with demoMode field', async () => {
    const res = await request(app).get(`${API_URL}${Routes.CONFIG}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('demoMode');
    expect(typeof res.body.demoMode).toBe('boolean');
  });
});
