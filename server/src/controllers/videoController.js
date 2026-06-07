import path from 'node:path';
import multer from 'multer';
import sanitize from 'sanitize-filename';
import { nanoid } from 'nanoid';
import { config } from '../config.js';
import { isAllowedVideo, isValidVideoUrl, clampClipSeconds } from '../utils/validators.js';
import { registerRemoteVideo, registerUploadedVideo, getVideo, getClip } from '../services/storageService.js';
import { processVideo } from '../services/clipService.js';

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = sanitize(path.basename(file.originalname, ext)) || 'video';
    cb(null, `${nanoid(10)}-${name}${ext}`);
  }
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedVideo(file)) cb(new Error('Only MP4, MOV, and MKV video files are supported.'));
    else cb(null, true);
  }
});

export async function uploadVideo(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'A video file is required.' });
    const video = registerUploadedVideo(req.file);
    return res.status(201).json({ video });
  } catch (error) {
    return next(error);
  }
}

export async function registerUrl(req, res, next) {
  try {
    if (!config.enableUrlInput) return res.status(403).json({ message: 'URL input is disabled.' });
    const { url, rightsConfirmed } = req.body;
    if (!rightsConfirmed) return res.status(400).json({ message: 'You must confirm that you have rights to process this video.' });
    if (!url || !isValidVideoUrl(url)) return res.status(400).json({ message: 'Provide a valid http(s) video URL.' });
    const video = await registerRemoteVideo(url);
    return res.status(201).json({ video });
  } catch (error) {
    return next(error);
  }
}

export async function processUploadedVideo(req, res, next) {
  try {
    const { videoId, mode = 'auto', targetSeconds } = req.body;
    const video = getVideo(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found. Upload or register a video first.' });
    if (!['auto', 'ai'].includes(mode)) return res.status(400).json({ message: 'Mode must be auto or ai.' });
    const clips = await processVideo({ video, mode, targetSeconds: clampClipSeconds(targetSeconds) });
    return res.json({ clips });
  } catch (error) {
    return next(error);
  }
}

export function downloadClip(req, res, next) {
  try {
    const { clipId, format } = req.params;
    const clip = getClip(clipId);
    if (!clip) return res.status(404).json({ message: 'Clip not found.' });
    const formatMap = {
      'mp4': clip.files.mp4_720,
      'mp4-720': clip.files.mp4_720,
      'mp4-1080': clip.files.mp4_1080,
      mp3: clip.files.mp3,
      wav: clip.files.wav
    };
    const filePath = formatMap[format];
    if (!filePath) return res.status(400).json({ message: 'Unsupported clip format.' });
    return res.download(filePath);
  } catch (error) {
    return next(error);
  }
}
