import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');

export const config = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  storageDir: path.resolve(rootDir, process.env.STORAGE_DIR || './storage'),
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || './uploads'),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 750),
  enableUrlInput: process.env.ENABLE_URL_INPUT !== 'false',
  ffmpegPath: process.env.FFMPEG_PATH,
  ffprobePath: process.env.FFPROBE_PATH,
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000'
};
