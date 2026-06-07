import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { config } from '../config.js';

ffmpeg.setFfmpegPath(config.ffmpegPath || ffmpegInstaller.path);
ffmpeg.setFfprobePath(config.ffprobePath || ffprobeInstaller.path);

export function probeVideo(inputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (error, metadata) => {
      if (error) reject(error);
      else resolve(metadata);
    });
  });
}

export function runFfmpeg(command) {
  return new Promise((resolve, reject) => {
    command.on('end', resolve).on('error', reject).run();
  });
}

export function detectSceneChanges(inputPath, threshold = 0.35) {
  return new Promise((resolve) => {
    const timestamps = [];
    ffmpeg(inputPath)
      .videoFilters(`select='gt(scene,${threshold})',showinfo`)
      .outputOptions(['-f null'])
      .output('-')
      .on('stderr', (line) => {
        const match = line.match(/pts_time:([0-9.]+)/);
        if (match) timestamps.push(Number(match[1]));
      })
      .on('end', () => resolve(timestamps))
      .on('error', () => resolve([]))
      .run();
  });
}

export function detectBlackFrames(inputPath) {
  return new Promise((resolve) => {
    const timestamps = [];
    ffmpeg(inputPath)
      .videoFilters('blackdetect=d=0.4:pix_th=0.10')
      .outputOptions(['-f null'])
      .output('-')
      .on('stderr', (line) => {
        const match = line.match(/black_start:([0-9.]+).*black_end:([0-9.]+)/);
        if (match) timestamps.push(Number(match[2]));
      })
      .on('end', () => resolve(timestamps))
      .on('error', () => resolve([]))
      .run();
  });
}

export function detectSilence(inputPath) {
  return new Promise((resolve) => {
    const timestamps = [];
    ffmpeg(inputPath)
      .audioFilters('silencedetect=noise=-30dB:d=0.7')
      .outputOptions(['-f null'])
      .output('-')
      .on('stderr', (line) => {
        const match = line.match(/silence_end: ([0-9.]+)/);
        if (match) timestamps.push(Number(match[1]));
      })
      .on('end', () => resolve(timestamps))
      .on('error', () => resolve([]))
      .run();
  });
}

export async function extractSegment({ inputPath, outputPath, start, end, height }) {
  const duration = Math.max(0.1, end - start);
  const command = ffmpeg(inputPath)
    .setStartTime(start)
    .duration(duration)
    .outputOptions(['-movflags +faststart', '-preset veryfast', '-crf 23'])
    .videoCodec('libx264')
    .audioCodec('aac')
    .size(`?x${height}`)
    .output(outputPath);

  await runFfmpeg(command);
}

export async function extractAudio({ inputPath, outputPath, start, end, format }) {
  const duration = Math.max(0.1, end - start);
  const command = ffmpeg(inputPath).setStartTime(start).duration(duration).output(outputPath);
  if (format === 'mp3') command.audioCodec('libmp3lame').audioBitrate('192k');
  if (format === 'wav') command.audioCodec('pcm_s16le').audioFrequency(44100);
  await runFfmpeg(command);
}

export async function captureThumbnail({ inputPath, outputDir, filename, start }) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({ timestamps: [Math.max(0.1, start + 0.2)], filename, folder: outputDir, size: '640x?' })
      .on('end', resolve)
      .on('error', reject);
  });
}
