import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  AlertTriangle, 
  Clock, 
  Calendar as CalendarIcon
} from 'lucide-react';
import { Channel, ConflictItem, ContentCategory, ContentItem, ContentStage, ContentStatus, MaterialsViewMode } from '../types';
import { CATEGORIES } from '../data/appConfig';
import { formatDateRu, getConflictForItem, getStageForStatus, isItemInConflict, STAGE_CONFIG, STATUS_MAP } from '../utils/conflicts';

interface MaterialsViewProps {
  items: ContentItem[];
  channels: Channel[];
  conflicts: ConflictItem[];
  onSelectItem: (item: ContentItem) => void;
  onOpenCreateModal: () => void;
  onUpdateStatus: (itemId: string, newStatus: ContentStatus) => void;
  onOpenConflictResolver: (conflict: ConflictItem) => void;
  selectedChannelId: string | null;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  items,
  channels,
  conflicts,
  onSelectItem,
  onOpenCreateModal,
  onUpdateStatus,
  onOpenConflictResolver,
  selectedChannelId,
}) => {
  const [viewMode, setViewMode] = useState<MaterialsViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<ContentStage | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | 'all'>('all');
  const [onlyConflicts, setOnlyConflicts] = useState(false);

  const filteredItems = items.filter((item) => {
    if (selectedChannelId && item.channelId !== selectedChannelId) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStage !== 'all' && getStageForStatus(item.status) !== selectedStage) return false;
    if (onlyConflicts && !isItemInConflict(item.id, conflicts)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchAuthor = item.author.name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAuthor) return false;
    }
    return true;
  });

  const getCategoryName = (cat: ContentCategory) => {
    return CATEGORIES.find((c) => c.id === cat)?.label || cat;
  };

  const stagesList: ContentStage[] = ['preparation', 'scheduling', 'published'];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#161418]">
      <div className="p-4 sm:p-5 border-b border-[#292431] bg-[#1a171d] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, автору, описанию..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#231f28] border border-[#342e3d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f25a5a]"
            />
          </div>

          <div className="flex items-center p-1 bg-[#231f28] rounded-xl border border-[#342e3d]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[#eb4b5b] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Доска этапов (Канбан)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#eb4b5b] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Список материалов"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as ContentStage | 'all')}
            className="px-2.5 py-1.5 rounded-lg bg-[#231f28] border border-[#342e3d] text-xs text-gray-300 focus:outline-none focus:border-[#f25a5a] cursor-pointer"
          >
            <option value="all">Все этапы</option>
            <option value="preparation">Этап 1: Подготовка</option>
            <option value="scheduling">Этап 2: Планирование</option>
            <option value="published">Этап 3: Опубликовано</option>
          </select>

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

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#f25a5a] hover:bg-[#ff6969] text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Создать</span>
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
          <div className="min-w-[900px] grid grid-cols-3 gap-5 h-full">
            {stagesList.map((stageKey) => {
              const stageConfig = STAGE_CONFIG[stageKey];
              const stageItems = filteredItems.filter(
                (item) => getStageForStatus(item.status) === stageKey
              );
              const stageConflictsCount = stageItems.filter((it) =>
                isItemInConflict(it.id, conflicts)
              ).length;

              return (
                <div
                  key={stageKey}
                  className="flex flex-col rounded-2xl bg-[#1c1921] border border-[#2d2738] overflow-hidden"
                >
                  <div className="p-4 border-b border-[#292433] bg-[#1f1b25] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{stageConfig.title}</h3>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#2b2536] text-gray-300 border border-[#3b334a]">
                          {stageItems.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{stageConfig.subtitle}</p>
                    </div>

                    {stageConflictsCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        {stageConflictsCount} конфл.
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                    {stageItems.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-xs text-gray-500 italic border border-dashed border-[#2d2836] rounded-xl p-4">
                        <span>Нет материалов на этом этапе</span>
                        <button
                          onClick={onOpenCreateModal}
                          className="mt-2 text-rose-400 hover:text-rose-300 text-[11px] font-medium"
                        >
                          + Создать новый
                        </button>
                      </div>
                    ) : (
                      stageItems.map((item) => {
                        const inConflict = isItemInConflict(item.id, conflicts);
                        const conflict = getConflictForItem(item.id, conflicts);
                        const statusMeta = STATUS_MAP[item.status];
                        const channelObj = channels.find((c) => c.id === item.channelId);

                        return (
                          <div
                            key={item.id}
                            onClick={() => onSelectItem(item)}
                            className={`p-3.5 rounded-xl border bg-[#231f28] hover:bg-[#282330] cursor-pointer transition-all ${
                              inConflict
                                ? 'border-red-500 conflict-card-glow ring-1 ring-red-500/60'
                                : 'border-[#332c3e] hover:border-[#4d425c]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                                {getCategoryName(item.category)}
                              </span>

                              <span 
                                className="text-[10px] font-medium px-2 py-0.5 rounded"
                                style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}
                              >
                                {statusMeta.label}
                              </span>
                            </div>

                            {inConflict && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (conflict) onOpenConflictResolver(conflict);
                                }}
                                className="mb-2.5 p-2 rounded-lg bg-red-950/70 border border-red-500 text-[11px] text-red-200 flex items-center justify-between"
                              >
                                <span className="flex items-center gap-1.5 font-medium">
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                                  Конфликт времени: {item.publishTime}
                                </span>
                                <span className="underline font-semibold">Устранить</span>
                              </div>
                            )}

                            <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-2 mb-1.5 leading-snug">
                              {item.title}
                            </h4>

                            {item.description && (
                              <p className="text-gray-400 text-[11px] line-clamp-2 mb-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-[#2e2838] text-[10px] text-gray-400">
                              <div className="flex items-center gap-1.5 truncate">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>
                                  {formatDateRu(item.publishDate)} · {item.publishTime}
                                </span>
                              </div>

                              <span className="font-medium text-gray-300 truncate max-w-[90px]">
                                {channelObj?.name || 'Канал'}
                              </span>
                            </div>

                            <div 
                              className="mt-3 pt-2 border-t border-[#2c2637] flex items-center justify-between gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="text-[10px] text-gray-400">Перевести:</div>
                              <div className="flex items-center gap-1.5">
                                {stageKey === 'preparation' && (
                                  <button
                                    onClick={() => onUpdateStatus(item.id, 'scheduled')}
                                    className="px-2 py-1 rounded bg-[#2d2438] hover:bg-[#3b2e4b] text-[10px] font-medium text-purple-200 border border-[#433555] transition-colors"
                                  >
                                    В план ➔
                                  </button>
                                )}

                                {stageKey === 'scheduling' && (
                                  <>
                                    <button
                                      onClick={() => onUpdateStatus(item.id, 'draft')}
                                      className="px-2 py-1 rounded bg-[#282330] hover:bg-[#322c3d] text-[10px] text-gray-300 transition-colors"
                                      title="Вернуть в черновник"
                                    >
                                      ↩ Черновик
                                    </button>
                                    <button
                                      onClick={() => onUpdateStatus(item.id, 'published')}
                                      className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-[10px] font-medium text-emerald-300 border border-emerald-700/50 transition-colors"
                                    >
                                      Опубликовать 🚀
                                    </button>
                                  </>
                                )}

                                {stageKey === 'published' && (
                                  <button
                                    onClick={() => onUpdateStatus(item.id, 'draft')}
                                    className="px-2 py-1 rounded bg-[#282330] hover:bg-[#322c3d] text-[10px] text-gray-300 transition-colors"
                                  >
                                    ↩ В работу
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="rounded-2xl bg-[#1c1921] border border-[#2d2738] overflow-hidden">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#211d27] border-b border-[#2d2738] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Материал</th>
                  <th className="py-3.5 px-4">Категория</th>
                  <th className="py-3.5 px-4">Этап и статус</th>
                  <th className="py-3.5 px-4">Дата и время</th>
                  <th className="py-3.5 px-4">Канал</th>
                  <th className="py-3.5 px-4">Автор</th>
                  <th className="py-3.5 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282332]">
                {filteredItems.map((item) => {
                  const inConflict = isItemInConflict(item.id, conflicts);
                  const conflict = getConflictForItem(item.id, conflicts);
                  const statusMeta = STATUS_MAP[item.status];
                  const channelObj = channels.find((c) => c.id === item.channelId);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className={`hover:bg-[#25202c] cursor-pointer transition-colors ${
                        inConflict ? 'bg-red-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-white truncate">{item.title}</div>
                        {inConflict && (
                          <div className="text-[10px] text-red-400 font-medium flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Конфликт расписания!</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-gray-300">
                        {getCategoryName(item.category)}
                      </td>

                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) => onUpdateStatus(item.id, e.target.value as ContentStatus)}
                          className="px-2 py-1 rounded-md text-[11px] font-medium border bg-[#231f28] cursor-pointer focus:outline-none"
                          style={{
                            borderColor: statusMeta.color,
                            color: statusMeta.color,
                          }}
                        >
                          <optgroup label="Подготовка">
                            <option value="draft">Черновик</option>
                            <option value="in_review">На согласовании</option>
                            <option value="approved">Утвержден</option>
                          </optgroup>
                          <optgroup label="Планирование">
                            <option value="scheduled">Запланировано</option>
                            <option value="ready">Готово к публикации</option>
                          </optgroup>
                          <optgroup label="Опубликовано">
                            <option value="published">Опубликовано</option>
                            <option value="archived">В архиве</option>
                          </optgroup>
                        </select>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDateRu(item.publishDate)}</span>
                          <span className="font-mono text-gray-400">{item.publishTime}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-300 truncate max-w-[120px]">
                        {channelObj?.name || 'Канал'}
                      </td>

                      <td className="py-3 px-4 text-gray-400">
                        {item.author.name}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {inConflict && conflict ? (
                          <button
                            onClick={() => onOpenConflictResolver(conflict)}
                            className="px-2.5 py-1 rounded bg-[#f25a5a] hover:bg-[#ff6969] text-white text-[11px] font-semibold transition-colors"
                          >
                            Разрешить
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectItem(item)}
                            className="px-2.5 py-1 rounded bg-[#2b2536] hover:bg-[#392f46] text-gray-300 text-[11px] transition-colors"
                          >
                            Открыть
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
