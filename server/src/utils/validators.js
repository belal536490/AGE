const allowedVideoTypes = new Set(['video/mp4', 'video/quicktime', 'video/x-matroska']);
const allowedExtensions = new Set(['.mp4', '.mov', '.mkv']);

export function isAllowedVideo(file) {
  const lowerName = file.originalname.toLowerCase();
  const ext = lowerName.slice(lowerName.lastIndexOf('.'));
  return allowedVideoTypes.has(file.mimetype) || allowedExtensions.has(ext);
}

export function isValidVideoUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function clampClipSeconds(value, fallback = 20) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(60, Math.max(5, parsed));
}
