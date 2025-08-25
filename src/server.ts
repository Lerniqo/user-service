import app from './app';
import { config } from './config/env';

const PORT: number = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
}); 