import React, { useState, useEffect } from 'react';
import { Search, X, Calendar as CalendarIcon, Clock, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { ConflictItem, ContentItem } from '../types';
import { formatDateRu, isItemInConflict, STATUS_MAP } from '../utils/conflicts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  conflicts: ConflictItem[];
  onSelectItem: (item: ContentItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  items,
  conflicts,
  onSelectItem,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // handled in parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.author.name.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#211e26] border border-[#393245] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#2e2838] flex items-center gap-3 bg-[#1c1922]">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск материалов, тегов, каналов..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {results.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              Материалов по запросу «{query}» не найдено
            </div>
          ) : (
            results.map((item) => {
              const inConflict = isItemInConflict(item.id, conflicts);
              const statusMeta = STATUS_MAP[item.status];

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    inConflict
                      ? 'bg-red-950/20 border-red-500/40 hover:border-red-500'
                      : 'bg-[#1c1922] border-[#2e2838] hover:border-[#483a5a] hover:bg-[#25202c]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#2b2436] text-purple-200">
                        {item.category}
                      </span>
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: statusMeta.color }}
                      >
                        {statusMeta.label}
                      </span>
                      {inConflict && (
                        <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Конфликт
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-white truncate">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                      <span>{formatDateRu(item.publishDate)} · {item.publishTime}</span>
                      <span>·</span>
                      <span>{item.author.name}</span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-[#19161e] border-t border-[#292433] text-[10px] text-gray-400 flex items-center justify-between px-4">
          <span>Навигация: кликните для перехода к материалу</span>
          <span>Esc для закрытия</span>
        </div>
      </div>
    </div>
  );
};
