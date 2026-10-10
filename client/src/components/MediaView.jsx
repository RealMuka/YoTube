import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
import { FileAudio, FileText, FileVideo, Image as ImageIcon, Search, Trash2, Upload } from 'lucide-react';
import { api, assetUrl } from '../api/client';
function formatSize(bytes) {
    if (bytes < 1024)
        return `${bytes} Б`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
function mediaIcon(mimeType) {
    if (mimeType.startsWith('video/'))
        return _jsx(FileVideo, { className: "h-8 w-8" });
    if (mimeType.startsWith('audio/'))
        return _jsx(FileAudio, { className: "h-8 w-8" });
    if (mimeType === 'application/pdf')
        return _jsx(FileText, { className: "h-8 w-8" });
    return _jsx(ImageIcon, { className: "h-8 w-8" });
}
export const MediaView = () => {
    const [search, setSearch] = useState('');
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const fileInput = useRef(null);
    const loadMedia = async () => {
        setLoading(true);
        try {
            const result = await api.media.list();
            setMedia(result.items);
            setError('');
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Не удалось загрузить медиатеку');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { void loadMedia(); }, []);
    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setBusy(true);
        setError('');
        try {
            await api.media.upload(file);
            await loadMedia();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Не удалось загрузить файл');
        }
        finally {
            setBusy(false);
            event.target.value = '';
        }
    };
    const handleDelete = async (item) => {
        const id = String(item.id || item._id || '');
        if (!id || !confirm(`Удалить файл «${item.filename}»?`))
            return;
        try {
            await api.media.remove(id);
            setMedia((current) => current.filter((entry) => String(entry.id || entry._id) !== id));
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Не удалось удалить файл');
        }
    };
    const filteredMedia = media.filter((item) => {
        const query = search.trim().toLowerCase();
        return !query || item.filename.toLowerCase().includes(query) || (item.usedIn || []).some((title) => title.toLowerCase().includes(query));
    });
    return (_jsx("div", { className: "flex-1 overflow-y-auto p-6 sm:p-8 bg-[#161418]", children: _jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white tracking-tight", children: "\u041C\u0435\u0434\u0438\u0430\u0442\u0435\u043A\u0430" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "\u0424\u0430\u0439\u043B\u044B, \u0444\u043E\u0442\u043E, \u0432\u0438\u0434\u0435\u043E \u0438 \u0434\u0440\u0443\u0433\u0438\u0435 \u0432\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0439." })] }), _jsxs("div", { children: [_jsx("input", { ref: fileInput, type: "file", accept: "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/mp4,audio/wav,application/pdf", className: "hidden", onChange: handleUpload }), _jsxs("button", { disabled: busy, onClick: () => fileInput.current?.click(), className: "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f25a5a] hover:bg-[#ff6969] disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-colors", children: [_jsx(Upload, { className: "w-4 h-4" }), _jsx("span", { children: busy ? 'Загружаем…' : 'Загрузить медиа' })] })] })] }), _jsxs("div", { className: "relative max-w-sm", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", value: search, onChange: (event) => setSearch(event.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E \u0444\u0430\u0439\u043B\u0430 \u0438\u043B\u0438 \u0442\u0438\u043F\u0443 \u043C\u0435\u0434\u0438\u0430", className: "w-full pl-9 pr-3 py-2 rounded-xl bg-[#231f28] border border-[#342e3d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a]" })] }), error && _jsx("div", { role: "alert", className: "rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200", children: error }), loading ? _jsx("p", { className: "text-sm text-gray-400", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043C\u0435\u0434\u0438\u0430\u0442\u0435\u043A\u0438\u2026" }) : filteredMedia.length === 0 ? (_jsx("div", { className: "rounded-2xl border border-dashed border-[#342e3d] p-10 text-center text-sm text-gray-400", children: search ? 'Файлы не найдены.' : 'Медиатека пуста. Загрузите первый файл.' })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5", children: filteredMedia.map((item) => {
                        const id = String(item.id || item._id || item.filename);
                        const image = item.mimeType.startsWith('image/');
                        return _jsxs("div", { className: "group rounded-2xl bg-[#211e25] border border-[#2f2939] overflow-hidden hover:border-[#4d3f60] transition-all flex flex-col", children: [_jsxs("div", { className: "h-44 overflow-hidden relative bg-[#18161b] flex items-center justify-center text-gray-500", children: [image ? _jsx("img", { src: assetUrl(item.url), alt: item.filename, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300", loading: "lazy" }) : item.mimeType.startsWith('video/') ? _jsx("video", { src: assetUrl(item.url), controls: true, className: "w-full h-full object-contain" }) : mediaIcon(item.mimeType), _jsx("button", { onClick: () => void handleDelete(item), title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0444\u0430\u0439\u043B", className: "absolute top-2 right-2 p-2 rounded-lg bg-black/70 text-gray-200 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "p-4 flex-1 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-xs text-white line-clamp-2", title: item.filename, children: item.filename }), _jsxs("p", { className: "text-[11px] text-gray-400 mt-1", children: ["\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0432: ", _jsx("span", { className: "text-gray-200", children: item.usedIn?.length ? item.usedIn.join(', ') : 'пока не используется' })] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-[#2d2738] flex items-center justify-between text-[10px] text-gray-500 gap-2", children: [_jsx("span", { children: formatSize(item.size) }), _jsx("span", { children: new Date(item.createdAt).toLocaleDateString('ru-RU') })] })] })] }, id);
                    }) }))] }) }));
};
