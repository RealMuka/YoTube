import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  Trash2,
} from 'lucide-react';
import { Channel, ContentCategory, ContentItem, ContentStatus } from '../types';
import { CATEGORIES } from '../data/initialData';
import { checkPotentialConflict, STATUS_MAP } from '../utils/conflicts';

interface CreateEditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ContentItem>) => void;
  onDelete?: (id: string) => void;
  initialItem?: ContentItem | null;
  channels: Channel[];
  existingItems: ContentItem[];
  defaultDate?: string;
  defaultChannelId?: string;
}

export const CreateEditMaterialModal: React.FC<CreateEditMaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialItem,
  channels,
  existingItems,
  defaultDate,
  defaultChannelId,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(initialItem);

  const [title, setTitle] = useState(initialItem?.title || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [category, setCategory] = useState<ContentCategory>(initialItem?.category || 'social');
  const [status, setStatus] = useState<ContentStatus>(initialItem?.status || 'draft');
  const [publishDate, setPublishDate] = useState(
    initialItem?.publishDate || defaultDate || '2026-10-05'
  );
  const [publishTime, setPublishTime] = useState(initialItem?.publishTime || '10:00');
  const [channelId, setChannelId] = useState(
    initialItem?.channelId || defaultChannelId || channels[0]?.id || 'ch-tg'
  );
  const [tagsInput, setTagsInput] = useState(initialItem?.tags?.join(', ') || '');
  const [coverImage, setCoverImage] = useState(initialItem?.coverImage || '');

  const potentialConflict = checkPotentialConflict(
    {
      channelId,
      publishDate,
      publishTime,
      status,
    },
    existingItems,
    initialItem?.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: initialItem?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      publishDate,
      publishTime,
      channelId,
      coverImage: coverImage.trim() || undefined,
      tags: tags.length ? tags : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-[#242028] border border-[#f25a5a]/70 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95"
        style={{
          boxShadow: '0 0 35px rgba(242, 90, 90, 0.15)',
        }}
      >
        <div className="p-6 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isEditing ? 'Редактировать материал' : 'Создать материал'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Название материала <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Категория
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ContentCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Статус и этап жизненного цикла
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors cursor-pointer"
            >
              <optgroup label="Этап 1: Подготовка">
                <option value="draft">Черновик (в работе)</option>
                <option value="in_review">На согласовании</option>
                <option value="approved">Утвержден</option>
              </optgroup>
              <optgroup label="Этап 2: Планирование публикации">
                <option value="scheduled">Запланировано</option>
                <option value="ready">Готово к публикации</option>
              </optgroup>
              <optgroup label="Этап 3: Опубликованный контент">
                <option value="published">Опубликовано</option>
                <option value="archived">В архиве</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Канал публикации
            </label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors cursor-pointer"
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Дата публикации
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Время публикации
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-sm text-white focus:outline-none focus:border-[#f25a5a] transition-colors"
                />
              </div>
            </div>
          </div>

          {potentialConflict.hasConflict && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <div className="font-semibold text-red-300">
                    Внимание: Конфликт времени публикации!
                  </div>
                  <p className="mt-1 text-gray-300 text-[11px] leading-relaxed">
                    В канале <strong className="text-white">{channels.find(c => c.id === channelId)?.name}</strong> на{' '}
                    <strong className="text-white">{publishDate} в {publishTime}</strong> уже запланирован другой материал:
                    {potentialConflict.conflictingWith && (
                      <span className="block italic text-red-200 mt-0.5">
                        «{potentialConflict.conflictingWith.title}»
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[10px] text-red-400">
                    Лучше сменить время на 30–60 минут или выбрать другой канал.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Краткое описание / Тезисы
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Основная мысль..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Теги (через запятую)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="тег1, тег2..."
              className="w-full px-3 py-2 rounded-xl bg-[#1d1a21] border border-[#3e3848] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a] transition-colors"
            />
          </div>

          <div className="pt-3 flex items-center justify-between gap-3 border-t border-[#312c3b]">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (initialItem && confirm('Удалить этот материал?')) {
                    onDelete(initialItem.id);
                    onClose();
                  }
                }}
                className="px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#2a2533] hover:bg-[#342f3f] text-gray-200 text-sm font-medium border border-[#40394e] transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#f25a5a] hover:bg-[#ff6969] active:bg-[#e04a4a] text-white text-sm font-semibold shadow-lg shadow-red-500/25 transition-colors cursor-pointer"
              >
                {isEditing ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
