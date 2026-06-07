import path from 'node:path';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { config } from '../config.js';
import { ensureDir } from '../utils/fs.js';
import { captureThumbnail, detectBlackFrames, detectSceneChanges, detectSilence, extractAudio, extractSegment, probeVideo } from '../ffmpeg/ffmpeg.js';
import { saveClip } from './storageService.js';

function normalizeSegments(points, duration, targetSeconds) {
  const cleaned = [...new Set(points.filter((point) => point > 3 && point < duration - 3).map((point) => Number(point.toFixed(2))))].sort((a, b) => a - b);
  const boundaries = [0];

  for (const point of cleaned) {
    const previous = boundaries[boundaries.length - 1];
    if (point - previous >= 5) boundaries.push(point);
  }

  let cursor = boundaries[boundaries.length - 1];
  while (duration - cursor > targetSeconds * 1.5) {
    cursor += targetSeconds;
    boundaries.push(Number(cursor.toFixed(2)));
  }
  boundaries.push(duration);

  const segments = [];
  for (let i = 0; i < boundaries.length - 1; i += 1) {
    let start = boundaries[i];
    let end = boundaries[i + 1];
    while (end - start > 60) {
      segments.push({ start, end: Number((start + 60).toFixed(2)) });
      start += 60;
    }
    if (end - start >= 5) segments.push({ start: Number(start.toFixed(2)), end: Number(end.toFixed(2)) });
    else if (segments.length) segments[segments.length - 1].end = Number(end.toFixed(2));
  }
  return segments.slice(0, 40);
}

async function detectWithFfmpeg(videoPath, duration, targetSeconds) {
  const [scenePoints, blackPoints, silencePoints] = await Promise.all([
    detectSceneChanges(videoPath),
    detectBlackFrames(videoPath),
    detectSilence(videoPath)
  ]);
  return normalizeSegments([...scenePoints, ...blackPoints, ...silencePoints], duration, targetSeconds);
}

async function detectWithAi(videoPath, duration, targetSeconds) {
  try {
    const response = await axios.post(`${config.aiServiceUrl}/detect`, { videoPath, targetSeconds }, { timeout: 120000 });
    if (Array.isArray(response.data?.segments) && response.data.segments.length) return response.data.segments;
  } catch (error) {
    console.warn(`AI service unavailable, falling back to FFmpeg: ${error.message}`);
  }
  return detectWithFfmpeg(videoPath, duration, targetSeconds);
}

export async function processVideo({ video, mode = 'auto', targetSeconds = 20 }) {
  const metadata = await probeVideo(video.path);
  const duration = Number(metadata.format?.duration || 0);
  if (!duration || duration < 5) throw new Error('Video must be at least 5 seconds long.');

  const segments = mode === 'ai'
    ? await detectWithAi(video.path, duration, targetSeconds)
    : await detectWithFfmpeg(video.path, duration, targetSeconds);

  const videoDir = path.join(config.storageDir, video.id);
  await ensureDir(videoDir);

  const output = [];
  for (const [index, segment] of segments.entries()) {
    const clipId = nanoid(10);
    const base = `clip-${index + 1}-${clipId}`;
    const paths = {
      mp4_720: path.join(videoDir, `${base}-720p.mp4`),
      mp4_1080: path.join(videoDir, `${base}-1080p.mp4`),
      mp3: path.join(videoDir, `${base}.mp3`),
      wav: path.join(videoDir, `${base}.wav`),
      thumbnail: path.join(videoDir, `${base}.jpg`)
    };

    await extractSegment({ inputPath: video.path, outputPath: paths.mp4_720, start: segment.start, end: segment.end, height: 720 });
    await extractSegment({ inputPath: video.path, outputPath: paths.mp4_1080, start: segment.start, end: segment.end, height: 1080 });
    await extractAudio({ inputPath: video.path, outputPath: paths.mp3, start: segment.start, end: segment.end, format: 'mp3' });
    await extractAudio({ inputPath: video.path, outputPath: paths.wav, start: segment.start, end: segment.end, format: 'wav' });
    await captureThumbnail({ inputPath: video.path, outputDir: videoDir, filename: `${base}.jpg`, start: segment.start });

    const record = saveClip({
      id: clipId,
      videoId: video.id,
      index: index + 1,
      start: segment.start,
      end: segment.end,
      duration: Number((segment.end - segment.start).toFixed(2)),
      files: paths,
      urls: {
        mp4_720: `/download/${clipId}/mp4-720`,
        mp4_1080: `/download/${clipId}/mp4-1080`,
        mp3: `/download/${clipId}/mp3`,
        wav: `/download/${clipId}/wav`,
        thumbnail: `/media/clips/${video.id}/${path.basename(paths.thumbnail)}`,
        preview: `/download/${clipId}/mp4-720`
      }
    });
    output.push(record);
  }

  return output.map(({ files, ...clip }) => clip);
}
