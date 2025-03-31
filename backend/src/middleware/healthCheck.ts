import { Request, Response } from 'express';
import { getHealthStatus } from '../services/health.service';

export function healthCheck(_req: Request, res: Response) {
  const status = getHealthStatus();
  console.log("🫀 SERVER HEALTH CHECK :: ", "MongoDB State: ", status.data.mongoState);
  res.status(status.code).json(status);
}
