import { getHealthStatus } from '../../src/services/health.service';

describe('getHealthStatus', () => {
  it('should return correct health structure', () => {
    const result = getHealthStatus();
    expect(result.status).toBe('success');
    expect(result.code).toEqual(200);
    expect(result.message).toBe('Server is healthy');
    expect(result.data).toHaveProperty('mongoState');
    expect(result.data).toHaveProperty('uptime');
    expect(result.data).toHaveProperty('timestamp');
  });
});
