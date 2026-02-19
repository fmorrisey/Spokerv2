import { DEMO_MODE } from '../models/constants';
import { components } from '../swagger/config';

type AppConfig = components['schemas']['AppConfig'];

export function getConfig(): AppConfig {
  return { demoMode: DEMO_MODE };
}
