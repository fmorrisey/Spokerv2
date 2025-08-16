import app from './app';
import { PORT } from './models/constants';

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
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