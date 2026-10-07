import React, { useState } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Search, 
  Tag, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Plus, 
  FileText 
} from 'lucide-react';
import { SAMPLE_COVER_IMAGE } from '../data/initialData';

export const MediaView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');

  const mediaList = [
    {
      id: 'med-1',
      title: 'Осень — блокнот, кофе и эскизы',
      url: SAMPLE_COVER_IMAGE,
      type: 'image/jpeg',
      dimensions: '1920 × 1080',
      size: '2.4 МБ',
      usedIn: '«Осень — время новых идей»',
      tags: ['осень', 'обложка', 'кофе', 'стол'],
      uploadedAt: '01.10.2026',
    },
    {
      id: 'med-2',
      title: 'Рекламный вижуал кампании Q4',
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      type: 'image/jpeg',
      dimensions: '1200 × 628',
      size: '1.8 МБ',
      usedIn: '«Запуск кампании Q4»',
      tags: ['реклама', 'Q4', 'дизайн'],
      uploadedAt: '30.09.2026',
    },
    {
      id: 'med-3',
      title: 'Студийный микрофон (Подкаст #42)',
      url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
      type: 'image/jpeg',
      dimensions: '1080 × 1080',
      size: '3.1 МБ',
      usedIn: '«Специальный выпуск подкаста #42»',
      tags: ['подкаст', 'аудио', 'студия'],
      uploadedAt: '02.10.2026',
    },
    {
      id: 'med-4',
      title: 'Дашборд аналитики и метрики',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      type: 'image/jpeg',
      dimensions: '1600 × 900',
      size: '1.2 МБ',
      usedIn: '«Отчет за неделю: охваты»',
      tags: ['аналитика', 'графики', 'отчет'],
      uploadedAt: '03.10.2026',
    },
    {
      id: 'med-5',
      title: 'Рабочее пространство команды Север',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      type: 'image/jpeg',
      dimensions: '1920 × 1280',
      size: '2.9 МБ',
      usedIn: '«Новости компании: итоги»',
      tags: ['команда', 'офис', 'север'],
      uploadedAt: '02.10.2026',
    },
  ];

  const filteredMedia = mediaList.filter((m) => {
    if (selectedTag !== 'all' && !m.tags.includes(selectedTag)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.usedIn.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#161418]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Медиатека</h1>
            <p className="text-xs text-gray-400 mt-1">
              Хранилище графических материалов, фото и ассетов для публикации в каналах.
            </p>
          </div>

          <button
            onClick={() => alert('Форма загрузки файла (JPG, PNG, WebP или MP4)')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f25a5a] hover:bg-[#ff6969] text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Загрузить медиа</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или материалу..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#231f28] border border-[#342e3d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {['all', 'осень', 'реклама', 'подкаст', 'аналитика'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-[#2f2639] text-purple-200 border border-[#48375c]'
                    : 'bg-[#1e1b23] text-gray-400 hover:text-white border border-[#2b2533]'
                }`}
              >
                {tag === 'all' ? 'Все теги' : `#${tag}`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredMedia.map((m) => (
            <div
              key={m.id}
              className="group rounded-2xl bg-[#211e25] border border-[#2f2939] overflow-hidden hover:border-[#4d3f60] transition-all flex flex-col"
            >
              <div className="h-44 overflow-hidden relative bg-[#18161b]">
                <img
                  src={m.url}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-gray-200 font-mono">
                  {m.dimensions}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-xs text-white line-clamp-1">{m.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Используется в: <span className="text-gray-200">{m.usedIn}</span>
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#2d2738] flex items-center justify-between text-[10px] text-gray-500">
                  <span>{m.size} · {m.uploadedAt}</span>
                  <div className="flex gap-1">
                    {m.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-purple-300/80">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
