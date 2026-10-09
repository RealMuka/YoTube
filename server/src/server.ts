import './config/loadEnv.js';
import app from './app.js';
import { connectDB } from './config/db.js';

const port = Number(process.env.PORT || 5000);

async function start(): Promise<void> {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET должен быть задан и содержать не менее 32 символов');
  }
  await connectDB();
  app.listen(port, '0.0.0.0', () => console.info(`YoTube API listening on http://localhost:${port}`));
}

start().catch((error: unknown) => {
  console.error('Failed to start YoTube API:', error);
  process.exitCode = 1;
});
