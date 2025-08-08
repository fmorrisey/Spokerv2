import { Request, Response } from 'express';
import { getHealthStatus } from '../services/health.service';

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       '200':
 *         description: Returns the service health status
 */

export function healthCheck(_req: Request, res: Response) {
  const status = getHealthStatus();
  console.log("🫀 SERVER HEALTH CHECK :: ", "MongoDB State: ", status.data.mongoState);
  res.status(status.code).json(status);
}
