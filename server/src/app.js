import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import materialRoutes from './routes/materials.js';
import mediaRoutes from './routes/media.js';
import conflictRoutes from './routes/conflicts.js';
import workspaceRoutes from './routes/workspaces.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../..');
const configuredUploadDir = process.env.UPLOAD_DIR || 'server/uploads';
const uploadDir = path.isAbsolute(configuredUploadDir) ? configuredUploadDir : path.resolve(projectRoot, configuredUploadDir);
app.disable('x-powered-by');
app.use(cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((value) => value.trim()) : true,
    credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use('/uploads', express.static(uploadDir, { fallthrough: false, maxAge: '7d' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/conflicts', conflictRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
