import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { config } from './config.js';
import { videoRouter } from './routes/videoRoutes.js';
import { initStorage } from './services/storageService.js';

await initStorage();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'clipforge-ai-server' }));
app.use('/media/uploads', express.static(config.uploadDir));
app.use('/media/clips', express.static(config.storageDir));
app.use('/', videoRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.message?.includes('Only MP4') ? 400 : 500;
  res.status(status).json({ message: error.message || 'Unexpected server error' });
});

app.listen(config.port, () => {
  console.log(`ClipForge AI server listening on http://localhost:${config.port}`);
});
