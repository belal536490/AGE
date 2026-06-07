import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function safeJoin(base, ...segments) {
  const target = path.resolve(base, ...segments);
  if (!target.startsWith(path.resolve(base))) {
    throw new Error('Invalid path traversal attempt');
  }
  return target;
}
