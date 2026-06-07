import path from 'node:path';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { nanoid } from 'nanoid';
import sanitize from 'sanitize-filename';
import axios from 'axios';
import { config } from '../config.js';
import { ensureDir, safeJoin } from '../utils/fs.js';

const videos = new Map();
const clips = new Map();

export async function initStorage() {
  await ensureDir(config.storageDir);
  await ensureDir(config.uploadDir);
}

export function registerUploadedVideo(file) {
  const id = nanoid(12);
  const record = {
    id,
    sourceType: 'upload',
    originalName: file.originalname,
    filename: path.basename(file.filename),
    path: file.path,
    previewUrl: `/media/uploads/${path.basename(file.filename)}`,
    createdAt: new Date().toISOString()
  };
  videos.set(id, record);
  return record;
}

export async function registerRemoteVideo(url) {
  const id = nanoid(12);
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath).toLowerCase() || '.mp4';
  const filename = `${id}-${sanitize(path.basename(urlPath, ext) || 'remote-video')}${ext}`;
  const target = safeJoin(config.uploadDir, filename);

  const response = await axios({ url, method: 'GET', responseType: 'stream', timeout: 30000, maxRedirects: 3 });
  const type = response.headers['content-type'] || '';
  if (!type.startsWith('video/') && !['.mp4', '.mov', '.mkv'].includes(ext)) {
    throw new Error('Remote URL must point directly to a downloadable video file. Protected or streaming pages are not supported.');
  }

  await pipeline(response.data, createWriteStream(target));
  const record = {
    id,
    sourceType: 'url',
    originalName: path.basename(urlPath) || 'remote-video',
    filename,
    path: target,
    previewUrl: `/media/uploads/${filename}`,
    createdAt: new Date().toISOString()
  };
  videos.set(id, record);
  return record;
}

export function getVideo(videoId) {
  return videos.get(videoId);
}

export function saveClip(record) {
  clips.set(record.id, record);
  return record;
}

export function getClip(clipId) {
  return clips.get(clipId);
}

export function listClipsForVideo(videoId) {
  return [...clips.values()].filter((clip) => clip.videoId === videoId);
}
