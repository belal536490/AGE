import { useState } from 'react';

export function UploadPanel({ onUpload, busy }) {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Input</p>
          <h2 className="text-2xl font-bold">Upload or link a video</h2>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">MP4 · MOV · MKV</span>
      </div>

      <div className="space-y-5">
        <label className="block rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-indigo-400 dark:border-white/15">
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-matroska,.mp4,.mov,.mkv"
            className="sr-only"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <span className="text-lg font-semibold">{file ? file.name : 'Choose a video file'}</span>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Local uploads are stored on the Node server for this MVP.</p>
        </label>

        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" /> OR <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        </div>

        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/my-owned-video.mp4"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-indigo-500 transition focus:ring-2 dark:border-white/10 dark:bg-white/10"
        />

        <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-1" />
          <span>I confirm I own this video or have explicit legal permission to process and convert it.</span>
        </label>

        <button
          disabled={busy || (!file && !url) || !rightsConfirmed}
          onClick={() => onUpload({ file, url, rightsConfirmed })}
          className="w-full rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-glow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Preparing video…' : 'Start with this video'}
        </button>
      </div>
    </section>
  );
}
