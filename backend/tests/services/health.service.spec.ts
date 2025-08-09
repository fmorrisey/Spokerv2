import { getHealthStatus } from '../../src/services/health.service';

describe('getHealthStatus', () => {
  it('should return correct health structure', () => {
    const result = getHealthStatus();
    expect(result.status).toBe('success');
    expect(result.code).toEqual(200);
    expect(result.message).toBe('Server is healthy');
    expect(result.data).toHaveProperty('mongoState');
    expect(result.data).toHaveProperty('uptime');
    expect(typeof result.data.uptime).toBe('number');
    expect(result.data.uptime).toBeGreaterThan(0);
    expect(result.data).toHaveProperty('timestamp');
    expect(result.data).toHaveProperty('memoryUsage');
    expect(typeof result.data.memoryUsage).toBe('object');
    expect(result.data).toHaveProperty('cpuUsage');
    expect(typeof result.data.cpuUsage).toBe('object');
  });
});
