import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  AlertTriangle, 
  Clock, 
} from 'lucide-react';
import { CalendarViewMode, Channel, ConflictItem, ContentCategory, ContentItem } from '../types';
import { CATEGORIES } from '../data/initialData';
import { getConflictForItem, isItemInConflict, STATUS_MAP } from '../utils/conflicts';

interface CalendarViewProps {
  items: ContentItem[];
  channels: Channel[];
  conflicts: ConflictItem[];
  onSelectItem: (item: ContentItem) => void;
  onCreateAtDate: (dateStr: string) => void;
  onOpenConflictResolver: (conflict: ConflictItem) => void;
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string | null) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  items,
  channels,
  conflicts,
  onSelectItem,
  onCreateAtDate,
  onOpenConflictResolver,
  selectedChannelId,
  onSelectChannel,
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | 'all'>('all');
  const [onlyConflicts, setOnlyConflicts] = useState(false);

  const [currentWeekStart, setCurrentWeekStart] = useState<string>('2026-10-01');

  const getWeekDays = (startStr: string) => {
    const days = [];
    const baseDate = new Date(startStr + 'T00:00:00');
    const dayNamesRu = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNum}`;
      const dayOfWeek = dayNamesRu[d.getDay()];

      days.push({
        dateStr,
        dayLabel: `${dayOfWeek}, ${dateNum}.${month}`,
        isToday: dateStr === '2026-10-05',
        dayNumber: dateNum,
      });
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d.toISOString().split('T')[0]);
  };

  const handleResetToday = () => {
    setCurrentWeekStart('2026-10-01');
  };

  const filteredItems = items.filter((item) => {
    if (selectedChannelId && item.channelId !== selectedChannelId) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (onlyConflicts && !isItemInConflict(item.id, conflicts)) return false;
    return true;
  });

  const getCategoryLabel = (catId: ContentCategory) => {
    return CATEGORIES.find((c) => c.id === catId)?.label || catId;
  };

  const getCardStyle = (item: ContentItem) => {
    const inConflict = isItemInConflict(item.id, conflicts);
    if (inConflict) {
      return {
        bg: 'bg-[#2f1b22]',
        border: 'border-red-500/80',
        title: 'text-white',
        meta: 'text-red-300',
        conflictBadge: true,
      };
    }

    if (item.category === 'social' || item.category === 'analytics') {
      return {
        bg: 'bg-[#5b52a3]/90 hover:bg-[#685eb5]',
        border: 'border-[#7c71c4]/60',
        title: 'text-white',
        meta: 'text-purple-200',
        conflictBadge: false,
      };
    }

    return {
      bg: 'bg-[#eb4b5b]/90 hover:bg-[#f25a69]',
      border: 'border-[#ff6675]/60',
      title: 'text-white',
      meta: 'text-rose-100',
      conflictBadge: false,
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#161418]">
      <div className="p-4 sm:p-5 border-b border-[#292431] flex flex-wrap items-center justify-between gap-4 bg-[#1a171d]">
        <div className="flex items-center gap-1.5 p-1 bg-[#231f28] rounded-xl border border-[#342e3d]">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-[#eb4b5b] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Месяц
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-[#eb4b5b] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Неделя
          </button>
          <button
            onClick={handleResetToday}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            Сегодня
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevWeek}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#25212c] transition-colors"
            title="Предыдущая неделя"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
            <span>
              {weekDays[0].dayLabel.split(', ')[1]} - {weekDays[6].dayLabel.split(', ')[1]}
            </span>
            <span className="text-[#eb4b5b]">2026</span>
          </span>

          <button
            onClick={handleNextWeek}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#25212c] transition-colors"
            title="Следующая неделя"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ContentCategory | 'all')}
            className="px-2.5 py-1.5 rounded-lg bg-[#231f28] border border-[#342e3d] text-xs text-gray-300 focus:outline-none focus:border-[#f25a5a] cursor-pointer"
          >
            <option value="all">Все категории</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setOnlyConflicts(!onlyConflicts)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              onlyConflicts
                ? 'bg-red-500/20 text-red-300 border-red-500/50'
                : 'bg-[#231f28] text-gray-400 border-[#342e3d] hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Только конфликты</span>
            {conflicts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
          <div className="min-w-[960px] grid grid-cols-7 gap-3 h-full">
            {weekDays.map((day) => {
              const dayItems = filteredItems.filter((it) => it.publishDate === day.dateStr);
              const dayConflicts = conflicts.filter((c) => c.date === day.dateStr);

              return (
                <div
                  key={day.dateStr}
                  className={`flex flex-col rounded-2xl bg-[#1d1a22] border transition-colors ${
                    day.isToday
                      ? 'border-[#eb4b5b]/50 ring-1 ring-[#eb4b5b]/30'
                      : 'border-[#2c2736]'
                  }`}
                >
                  <div className="p-3 border-b border-[#282332] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                        {day.dayLabel}
                      </div>
                      {dayConflicts.length > 0 && (
                        <div className="text-[10px] text-red-400 font-medium flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Конфликт времени!</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onCreateAtDate(day.dateStr)}
                      className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#2c2636] transition-colors"
                      title="Добавить материал на эту дату"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                    {dayItems.length === 0 ? (
                      <div className="h-24 flex items-center justify-center text-[11px] text-gray-400 italic">
                        Нет записей
                      </div>
                    ) : (
                      dayItems.map((item) => {
                        const style = getCardStyle(item);
                        const inConflict = isItemInConflict(item.id, conflicts);
                        const conflict = getConflictForItem(item.id, conflicts);

                        return (
                          <div
                            key={item.id}
                            onClick={() => onSelectItem(item)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] relative ${
                              style.bg
                            } ${style.border} ${
                              inConflict ? 'conflict-card-glow ring-2 ring-red-500' : 'shadow-sm'
                            }`}
                          >
                            {item.coverImage && (
                              <div className="mb-2 rounded-lg overflow-hidden h-20 w-full relative">
                                <img
                                  src={item.coverImage}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white">
                                  {item.publishTime}
                                </div>
                              </div>
                            )}

                            {inConflict && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (conflict) onOpenConflictResolver(conflict);
                                }}
                                className="mb-2 p-1.5 rounded-lg bg-red-950/80 border border-red-500 text-[10px] text-red-200 flex items-center justify-between font-medium cursor-pointer hover:bg-red-900"
                              >
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                                  Конфликт: {item.publishTime}
                                </span>
                                <span className="underline">Разрешить</span>
                              </div>
                            )}

                            <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${style.title}`}>
                              {item.title}
                            </h4>

                            <div className={`mt-1.5 text-[10px] font-medium flex items-center gap-1.5 ${style.meta}`}>
                              <span>Категория: {getCategoryLabel(item.category)}</span>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/80">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 opacity-80" />
                                {item.publishTime}
                              </span>
                              <span className="truncate max-w-[90px]">
                                {channels.find((c) => c.id === item.channelId)?.name || 'Канал'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2 pt-0">
                    <button
                      onClick={() => onCreateAtDate(day.dateStr)}
                      className="w-full py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-[#25202d] transition-colors flex items-center justify-center gap-1 border border-dashed border-[#342e40]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Материал</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-gray-400">
              <div>ПН</div>
              <div>ВТ</div>
              <div>СР</div>
              <div>ЧТ</div>
              <div>ПТ</div>
              <div>СБ</div>
              <div>ВС</div>
            </div>

            <div className="grid grid-cols-7 gap-2 auto-rows-fr">
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-10-${String(dayNum).padStart(2, '0')}`;
                const dayItems = filteredItems.filter((it) => it.publishDate === dateStr);
                const hasConflict = dayItems.some((it) => isItemInConflict(it.id, conflicts));

                return (
                  <div
                    key={dateStr}
                    onClick={() => onCreateAtDate(dateStr)}
                    className={`min-h-[100px] p-2 rounded-xl bg-[#1d1a22] border transition-all cursor-pointer hover:border-[#f25a5a]/60 ${
                      hasConflict
                        ? 'border-red-500/80 ring-1 ring-red-500/40 bg-red-950/20'
                        : 'border-[#2c2736]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-300">{dayNum}</span>
                      {hasConflict && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map((item) => {
                        const inConflict = isItemInConflict(item.id, conflicts);
                        return (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectItem(item);
                            }}
                            className={`p-1 rounded text-[10px] truncate font-medium ${
                              inConflict
                                ? 'bg-red-500 text-white font-bold'
                                : item.category === 'social'
                                ? 'bg-[#5b52a3] text-white'
                                : 'bg-[#eb4b5b] text-white'
                            }`}
                          >
                            {item.publishTime} · {item.title}
                          </div>
                        );
                      })}
                      {dayItems.length > 3 && (
                        <div className="text-[10px] text-gray-400 text-center">
                          +{dayItems.length - 3} еще
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
