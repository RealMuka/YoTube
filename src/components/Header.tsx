import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  AlertTriangle, 
  Menu, 
  ExternalLink, 
  Check
} from 'lucide-react';
import { ConflictItem, ViewTab } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  onOpenCreateModal: () => void;
  conflicts: ConflictItem[];
  onOpenConflictResolver: (conflict: ConflictItem) => void;
  onToggleAuthView: () => void;
  onSelectTab: (tab: ViewTab) => void;
  onToggleMobileMenu?: () => void;
  workspaceName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenCreateModal,
  conflicts,
  onOpenConflictResolver,
  onToggleAuthView,
  onSelectTab,
  onToggleMobileMenu,
  workspaceName,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const getBreadcrumbs = () => {
    switch (currentTab) {
      case 'calendar':
        return `${workspaceName} / Календарь публикаций`;
      case 'materials':
        return `${workspaceName} / Управление материалами`;
      case 'media':
        return `${workspaceName} / Медиатека`;
      case 'profile':
        return `Аккаунт / Профиль`;
      case 'settings':
        return `${workspaceName} / Настройки`;
      default:
        return workspaceName;
    }
  };

  return (
    <header className="h-16 border-b border-[#2a2632] bg-[#161418] px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#25212c]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
          <span>{getBreadcrumbs()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[#2b2536] text-purple-200 border border-[#40354f]">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          <span>Командный план</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#231f2a] transition-colors ${
              conflicts.length > 0 ? 'text-amber-400' : ''
            }`}
            title={conflicts.length > 0 ? `${conflicts.length} конфликта в расписании` : 'Уведомления'}
          >
            <Bell className="w-4 h-4" />
            {conflicts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f25a5a] ring-2 ring-[#161418]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#211e26] border border-[#373142] rounded-xl shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#2f2a38] mb-2">
                <span className="text-xs font-semibold text-gray-200">Уведомления системы</span>
                {conflicts.length > 0 ? (
                  <span className="text-[11px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    {conflicts.length} конфликт{conflicts.length === 1 ? '' : 'а'}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400">Все чисто</span>
                )}
              </div>

              {conflicts.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  <Check className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-80" />
                  Все публикации согласованы, конфликтов расписания нет.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {conflicts.map((c) => (
                    <div
                      key={c.conflictKey}
                      className="p-2.5 rounded-lg bg-[#2b242e] border border-red-500/30 hover:border-red-500/60 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="text-xs min-w-0 flex-1">
                          <p className="font-medium text-red-200">
                            Конфликт слота {c.time}
                          </p>
                          <p className="text-[11px] text-gray-300 mt-0.5">
                            Канал: <span className="text-gray-200 font-medium">{c.channelName}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {c.items.length} материала претендуют на одно время.
                          </p>
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              onOpenConflictResolver(c);
                            }}
                            className="mt-2 text-[11px] font-medium text-rose-300 hover:text-white underline block"
                          >
                            Разрешить конфликт →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onToggleAuthView}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white bg-[#221f29] hover:bg-[#2b2634] border border-[#342f3d] transition-colors"
          title="Просмотреть экраны авторизации и регистрации"
        >
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          <span>Выйти</span>
        </button>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#f25a5a] hover:bg-[#ff6969] active:bg-[#e04a4a] text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Создать материал</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className="w-8 h-8 rounded-full bg-[#3c344a] text-purple-200 flex items-center justify-center font-medium text-xs hover:ring-2 hover:ring-purple-400/50 transition-all ml-1 cursor-pointer"
          title="Открыть профиль"
        >
          Ч4
        </button>
      </div>
    </header>
  );
};
