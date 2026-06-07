export function ProcessingPanel({ video, settings, setSettings, onProcess, busy }) {
  if (!video) return null;

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Preview</p>
          <video className="aspect-video w-full rounded-2xl bg-black object-contain" controls src={video.previewUrl} />
          <p className="mt-3 truncate text-sm text-slate-500 dark:text-slate-400">{video.originalName}</p>
        </div>
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Clip generation</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Auto mode combines FFmpeg scene detection, black frame detection, and audio silence analysis. AI mode calls the optional Python service and falls back to FFmpeg.</p>
          </div>

          <label className="block text-sm font-semibold">
            Detection mode
            <select
              value={settings.mode}
              onChange={(event) => setSettings((value) => ({ ...value, mode: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/10"
            >
              <option value="auto">Auto — FFmpeg default</option>
              <option value="ai">Advanced AI — Python microservice</option>
            </select>
          </label>

          <label className="block text-sm font-semibold">
            Target clip length: {settings.targetSeconds}s
            <input
              type="range"
              min="5"
              max="60"
              value={settings.targetSeconds}
              onChange={(event) => setSettings((value) => ({ ...value, targetSeconds: Number(event.target.value) }))}
              className="mt-3 w-full accent-indigo-600"
            />
          </label>

          <button
            disabled={busy}
            onClick={onProcess}
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            {busy ? 'Detecting scenes and rendering formats…' : 'Generate Clips'}
          </button>
        </div>
      </div>
    </section>
  );
}
