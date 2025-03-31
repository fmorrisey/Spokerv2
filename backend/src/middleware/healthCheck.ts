import { Request, Response } from 'express';
import mongoose from 'mongoose';

export function healthCheck(_req: Request, res: Response) {
  const mongoState = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  console.log("🫀 SERVER HEALTH CHECK :: ", "MongoDB State: ", mongoState);


  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    data: {
      mongoState,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      execPath: process.execPath,
      execArgv: process.execArgv
    }
  });
}

