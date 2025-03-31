import mongoose from 'mongoose';

export function getHealthStatus() {
  const mongoState = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  return {
    code: 200,
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
  };
}

