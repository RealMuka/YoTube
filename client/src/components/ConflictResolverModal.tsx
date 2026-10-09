import React, { useEffect, useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  Calendar as CalendarIcon, 
  Shuffle, 
  Send, 
} from 'lucide-react';
import { Channel, ConflictItem, ContentItem } from '../types';
import { formatDateRu } from '../utils/conflicts';

interface ConflictResolverModalProps {
  conflict: ConflictItem | null;
  channels: Channel[];
  onClose: () => void;
  onResolve: (updatedItems: ContentItem[]) => void;
}

export const ConflictResolverModal: React.FC<ConflictResolverModalProps> = ({
  conflict,
  channels,
  onClose,
  onResolve,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  useEffect(() => {
    if (conflict) setSelectedItemId(conflict.items[1]?.id || conflict.items[0]?.id || '');
  }, [conflict]);
  const items = conflict?.items || [];
  const targetItem = items.find((it) => it.id === selectedItemId) || items[0];
  if (!conflict) return null;

  const handleShiftTime = (minutesToAdd: number) => {
    const [h, m] = targetItem.publishTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + minutesToAdd;
    const newH = Math.floor((totalMinutes / 60) % 24);
    const newM = totalMinutes % 60;
    const formattedTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

    const updated = items.map((it) =>
      it.id === targetItem.id
        ? { ...it, publishTime: formattedTime, updatedAt: new Date().toISOString() }
        : it
    );
    onResolve(updated);
    onClose();
  };

  const handleShiftDay = (daysToAdd: number) => {
    const d = new Date(targetItem.publishDate + 'T00:00:00');
    d.setDate(d.getDate() + daysToAdd);
    const pad = (value: number) => String(value).padStart(2, '0');
    const newDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const updated = items.map((it) =>
      it.id === targetItem.id
        ? { ...it, publishDate: newDateStr, updatedAt: new Date().toISOString() }
        : it
    );
    onResolve(updated);
    onClose();
  };

  const handleChangeChannel = (channelId: string) => {
    const updated = items.map((it) =>
      it.id === targetItem.id
        ? { ...it, channelId, updatedAt: new Date().toISOString() }
        : it
    );
    onResolve(updated);
    onClose();
  };

  const handleMoveToDraft = () => {
    const updated: ContentItem[] = items.map((it) =>
      it.id === targetItem.id
        ? { ...it, status: 'draft' as const, updatedAt: new Date().toISOString() }
        : it
    );
    onResolve(updated);
    onClose();
  };

  const otherChannels = channels.filter((ch) => ch.id !== conflict.channelId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#211e26] border border-[#3b3546] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#302a3a] flex items-center justify-between bg-[#1b1820]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Разрешение конфликта расписания</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Публикации на одной платформе в пределах 30 минут
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span>
                Слот: <strong className="text-white">{formatDateRu(conflict.date)}, {conflict.time}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-red-200">
              <Send className="w-3.5 h-3.5" />
              <span>{conflict.channelName}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 block mb-2">
              Конфликтующие материалы (выберите, какой перенести):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item, index) => {
                const isSelected = item.id === targetItem.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-[#2d2535] border-[#f25a5a] shadow-lg shadow-red-500/10 ring-1 ring-[#f25a5a]'
                        : 'bg-[#1b1820] border-[#312a3d] hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Материал #{index + 1}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-[#f25a5a] text-white px-2 py-0.5 rounded font-medium">
                          Изменяемый
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-white text-sm line-clamp-2 mb-1">
                      {item.title}
                    </div>
                    <div className="text-gray-400 text-[11px] mb-2 line-clamp-2">
                      {item.description || 'Без описания'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-2 border-t border-[#372f44]">
                      <span>Автор: {item.author.name}</span>
                      <span>·</span>
                      <span className="text-amber-300">{item.publishTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Быстрые варианты устранения коллизии:
            </h4>

            <div className="p-3 rounded-xl bg-[#1b1820] border border-[#312a3d] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-400" />
                  Сдвинуть время публикации материала:
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleShiftTime(30)}
                  className="px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors"
                >
                  +30 минут ({conflict.time} ➔ ... )
                </button>
                <button
                  onClick={() => handleShiftTime(60)}
                  className="px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors"
                >
                  +1 час (рекомендуется)
                </button>
                <button
                  onClick={() => handleShiftTime(120)}
                  className="px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors"
                >
                  +2 часа
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1b1820] border border-[#312a3d] space-y-2">
              <span className="text-xs font-medium text-gray-200 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-purple-400" />
                Перенести на другой день:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleShiftDay(1)}
                  className="px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors"
                >
                  Перенести на следующий день (+1 день)
                </button>
                <button
                  onClick={() => handleShiftDay(2)}
                  className="px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors"
                >
                  Через 2 дня
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1b1820] border border-[#312a3d] space-y-2">
              <span className="text-xs font-medium text-gray-200 flex items-center gap-1.5">
                <Shuffle className="w-4 h-4 text-blue-400" />
                Сменить канал размещения:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {otherChannels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChangeChannel(ch.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#2b2535] hover:bg-[#382f45] text-xs text-gray-200 border border-[#3f344e] transition-colors"
                  >
                    Перевести в «{ch.name}»
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                onClick={handleMoveToDraft}
                className="text-gray-400 hover:text-white underline"
              >
                Вернуть выбранный материал на этап подготовки (в черновик)
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#302a3a] bg-[#1a1720] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-[#362f42] transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
