import app from './app';
import { PORT } from './models/constants';

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

process.on('SIGINT', () => {
  server.close();
  console.log(`⬇️ Server closed ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close();
  console.log(`Server closed ${PORT}`);
});

export default server;