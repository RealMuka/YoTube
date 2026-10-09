import React from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { ConflictItem } from '../types';

interface ConflictBannerProps {
  conflicts: ConflictItem[];
  onOpenResolver: (conflict: ConflictItem) => void;
  onDismiss?: () => void;
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({
  conflicts,
  onOpenResolver,
  onDismiss,
}) => {
  if (conflicts.length === 0) return null;

  const firstConflict = conflicts[0];

  return (
    <div className="mx-6 mt-4 p-3.5 rounded-xl bg-gradient-to-r from-red-950/80 via-[#2d1c24] to-[#251a24] border border-red-500/40 text-gray-200 shadow-lg shadow-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5 sm:mt-0">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs sm:text-sm text-red-200">
              Автоматически выявлен конфликт расписания ({conflicts.length})
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/30 text-red-300 font-mono">
              {firstConflict.time} · {firstConflict.channelName}
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-0.5">
            Материалы{' '}
            {firstConflict.items.map((it, idx) => (
              <span key={it.id} className="font-medium text-white">
                «{it.title}»{idx < firstConflict.items.length - 1 ? ' и ' : ''}
              </span>
            ))}{' '}
            запланированы на одной платформе с интервалом не более 30 минут. Это может привести к перекрытию публикаций.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={() => onOpenResolver(firstConflict)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f25a5a] hover:bg-[#ff6969] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <span>Разрешить конфликт</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5"
            title="Скрыть предупреждение"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
