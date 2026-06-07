import Head from 'next/head';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { ClipCard } from '../components/ClipCard';
import { Disclaimer } from '../components/Disclaimer';
import { ProcessingPanel } from '../components/ProcessingPanel';
import { UploadPanel } from '../components/UploadPanel';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function withApi(path) {
  return `${API_BASE}${path}`;
}

export default function Home() {
  const [dark, setDark] = useState(true);
  const [video, setVideo] = useState(null);
  const [clips, setClips] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({ mode: 'auto', targetSeconds: 20 });

  const hydratedVideo = useMemo(() => {
    if (!video) return null;
    return { ...video, previewUrl: video.previewUrl?.startsWith('http') ? video.previewUrl : withApi(video.previewUrl) };
  }, [video]);

  async function handleUpload({ file, url, rightsConfirmed }) {
    setBusy(true);
    setMessage('');
    setClips([]);
    try {
      const response = file
        ? await uploadFile(file)
        : await axios.post(withApi('/url'), { url, rightsConfirmed });
      setVideo(response.data.video);
      setMessage('Video ready. Choose clip settings and generate clips.');
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(file) {
    const form = new FormData();
    form.append('video', file);
    return axios.post(withApi('/upload'), form, { headers: { 'Content-Type': 'multipart/form-data' } });
  }

  async function handleProcess() {
    if (!video) return;
    setBusy(true);
    setMessage('Processing can take several minutes depending on video length and number of clips.');
    try {
      const response = await axios.post(withApi('/process'), { videoId: video.id, ...settings });
      setClips(response.data.clips);
      setMessage(`Generated ${response.data.clips.length} clips with MP4, MP3, and WAV downloads.`);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Processing failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <Head>
        <title>ClipForge AI — AI Video Clip Generator</title>
        <meta name="description" content="Upload legally permitted videos, detect meaningful scenes, and export MP4, MP3, and WAV clips." />
      </Head>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_30%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="flex flex-col gap-6 rounded-[2rem] border border-white/20 bg-white/70 p-6 shadow-glow backdrop-blur dark:bg-white/5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-indigo-500">ClipForge AI</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Generate smart short clips and convert formats in one dashboard.</h1>
              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Scene changes, black frames, and silence detection turn long videos into editable 5–60 second clips with MP4, MP3, and WAV exports.</p>
            </div>
            <button onClick={() => setDark((value) => !value)} className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold dark:border-white/10">
              {dark ? '☀ Light' : '🌙 Dark'} mode
            </button>
          </header>

          <Disclaimer />

          {message && <div className="rounded-2xl border border-indigo-300/40 bg-indigo-50 p-4 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100">{message}</div>}

          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <UploadPanel onUpload={handleUpload} busy={busy} />
            <ProcessingPanel video={hydratedVideo} settings={settings} setSettings={setSettings} onProcess={handleProcess} busy={busy} />
          </div>

          <section className="space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Dashboard</p>
                <h2 className="text-3xl font-bold">Generated clips</h2>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">{clips.length} clips</span>
            </div>
            {clips.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {clips.map((clip) => <ClipCard key={clip.id} clip={clip} />)}
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-10 text-center text-slate-500 dark:text-slate-400">No clips yet. Upload a video, confirm rights, and run the generator.</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
