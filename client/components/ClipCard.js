const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function absoluteUrl(path) {
  if (!path) return '#';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

export function ClipCard({ clip }) {
  return (
    <article className="glass-card overflow-hidden rounded-3xl">
      <img src={absoluteUrl(clip.urls.thumbnail)} alt={`Clip ${clip.index} thumbnail`} className="aspect-video w-full bg-slate-900 object-cover" />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Clip {clip.index}</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">{clip.duration}s</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{clip.start}s → {clip.end}s</p>
        <video className="w-full rounded-xl bg-black" controls src={absoluteUrl(clip.urls.preview)} />
        <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
          <a className="rounded-xl bg-indigo-600 px-3 py-2 text-center text-white hover:bg-indigo-500" href={absoluteUrl(clip.urls.mp4_720)}>⬇ MP4 720p</a>
          <a className="rounded-xl bg-indigo-600 px-3 py-2 text-center text-white hover:bg-indigo-500" href={absoluteUrl(clip.urls.mp4_1080)}>⬇ MP4 1080p</a>
          <a className="rounded-xl bg-slate-100 px-3 py-2 text-center text-slate-800 hover:bg-slate-200 dark:bg-white/10 dark:text-white" href={absoluteUrl(clip.urls.mp3)}>🎧 MP3</a>
          <a className="rounded-xl bg-slate-100 px-3 py-2 text-center text-slate-800 hover:bg-slate-200 dark:bg-white/10 dark:text-white" href={absoluteUrl(clip.urls.wav)}>🎵 WAV</a>
        </div>
      </div>
    </article>
  );
}
