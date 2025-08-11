import { startMockDB, stopMockDB } from '../src/config/test-db';

beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    await startMockDB();
  }
});

afterAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    await stopMockDB();
  }
});

