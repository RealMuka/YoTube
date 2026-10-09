import React, { useEffect, useRef, useState } from 'react';
import { FileAudio, FileText, FileVideo, Image as ImageIcon, Search, Trash2, Upload } from 'lucide-react';
import { api, assetUrl, type ApiMedia } from '../api/client';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function mediaIcon(mimeType: string) {
  if (mimeType.startsWith('video/')) return <FileVideo className="h-8 w-8" />;
  if (mimeType.startsWith('audio/')) return <FileAudio className="h-8 w-8" />;
  if (mimeType === 'application/pdf') return <FileText className="h-8 w-8" />;
  return <ImageIcon className="h-8 w-8" />;
}

export const MediaView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [media, setMedia] = useState<ApiMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const result = await api.media.list();
      setMedia(result.items);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить медиатеку');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadMedia(); }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      await api.media.upload(file);
      await loadMedia();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить файл');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (item: ApiMedia) => {
    const id = String(item.id || item._id || '');
    if (!id || !confirm(`Удалить файл «${item.filename}»?`)) return;
    try {
      await api.media.remove(id);
      setMedia((current) => current.filter((entry) => String(entry.id || entry._id) !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось удалить файл');
    }
  };

  const filteredMedia = media.filter((item) => {
    const query = search.trim().toLowerCase();
    return !query || item.filename.toLowerCase().includes(query) || (item.usedIn || []).some((title) => title.toLowerCase().includes(query));
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#161418]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Медиатека</h1>
            <p className="text-xs text-gray-400 mt-1">Файлы, фото, видео и другие вложения публикаций.</p>
          </div>
          <div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/mp4,audio/wav,application/pdf" className="hidden" onChange={handleUpload} />
            <button disabled={busy} onClick={() => fileInput.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f25a5a] hover:bg-[#ff6969] disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-colors">
              <Upload className="w-4 h-4" /><span>{busy ? 'Загружаем…' : 'Загрузить медиа'}</span>
            </button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по имени файла или материалу…" className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#231f28] border border-[#342e3d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a]" />
        </div>

        {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200">{error}</div>}
        {loading ? <p className="text-sm text-gray-400">Загрузка медиатеки…</p> : filteredMedia.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#342e3d] p-10 text-center text-sm text-gray-400">{search ? 'Файлы не найдены.' : 'Медиатека пуста. Загрузите первый файл.'}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredMedia.map((item) => {
              const id = String(item.id || item._id || item.filename);
              const image = item.mimeType.startsWith('image/');
              return <div key={id} className="group rounded-2xl bg-[#211e25] border border-[#2f2939] overflow-hidden hover:border-[#4d3f60] transition-all flex flex-col">
                <div className="h-44 overflow-hidden relative bg-[#18161b] flex items-center justify-center text-gray-500">
                  {image ? <img src={assetUrl(item.url)} alt={item.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" /> : item.mimeType.startsWith('video/') ? <video src={assetUrl(item.url)} controls className="w-full h-full object-contain" /> : mediaIcon(item.mimeType)}
                  <button onClick={() => void handleDelete(item)} title="Удалить файл" className="absolute top-2 right-2 p-2 rounded-lg bg-black/70 text-gray-200 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div><h3 className="font-semibold text-xs text-white line-clamp-2" title={item.filename}>{item.filename}</h3><p className="text-[11px] text-gray-400 mt-1">Используется в: <span className="text-gray-200">{item.usedIn?.length ? item.usedIn.join(', ') : 'пока не используется'}</span></p></div>
                  <div className="mt-3 pt-3 border-t border-[#2d2738] flex items-center justify-between text-[10px] text-gray-500 gap-2"><span>{formatSize(item.size)}</span><span>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</span></div>
                </div>
              </div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
};
