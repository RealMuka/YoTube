import React from 'react';
import { 
  Calendar as CalendarIcon, 
  FileText, 
  User, 
  Settings, 
  Layers, 
  Search, 
  Plus, 
  Send,
  Camera,
  Share2,
  Globe,
  Radio,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Channel, ViewTab, Workspace } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (id: string | null) => void;
  onOpenSearch: () => void;
  onOpenCreateModal: () => void;
  onAddWorkspace: () => void;
  conflictCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  channels,
  selectedChannelId,
  onSelectChannel,
  onOpenSearch,
  onOpenCreateModal,
  onAddWorkspace,
  conflictCount,
}) => {
  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const getPlatformIcon = (platform: Channel['platform']) => {
    switch (platform) {
      case 'telegram':
        return <Send className="w-3.5 h-3.5 text-sky-400" />;
      case 'vk':
        return <Share2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'instagram':
        return <Camera className="w-3.5 h-3.5 text-pink-400" />;
      case 'youtube':
        return <Radio className="w-3.5 h-3.5 text-red-400" />;
      case 'website':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <aside className="w-64 bg-[#19171b] border-r border-[#2b2732] flex flex-col h-screen select-none shrink-0 text-sm">
      <div className="p-4 border-b border-[#2b2732] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#e5484d] to-[#ff6b6b] flex items-center justify-center shadow-md shadow-red-500/20">
            <div className="relative w-4 h-4 flex flex-col justify-between py-0.5">
              <span className="block h-0.5 w-full bg-white rounded-full"></span>
              <span className="block h-0.5 w-full bg-white/90 rounded-full"></span>
              <span className="block h-0.5 w-full bg-white/80 rounded-full"></span>
            </div>
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">Контентно</span>
        </div>
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#221f26] hover:bg-[#2a2630] border border-[#322d3a] text-gray-400 hover:text-gray-200 transition-colors text-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span>Поиск</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#1a171d] rounded border border-[#3b3446] text-gray-400 font-mono">
            ⌘ K
          </kbd>
        </button>
      </div>

      <div className="px-3 py-3 space-y-1">
        <button
          onClick={() => onSelectTab('calendar')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'calendar'
              ? 'bg-[#2b2432] text-white border border-[#483754]'
              : 'text-gray-300 hover:bg-[#231f28] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span>Календарь</span>
          </div>
          {conflictCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/40 rounded">
              {conflictCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('materials')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'materials'
              ? 'bg-[#2b2432] text-white border border-[#483754]'
              : 'text-gray-300 hover:bg-[#231f28] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-gray-400" />
          <span>Материалы</span>
        </button>

        <button
          onClick={() => onSelectTab('media')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'media'
              ? 'bg-[#2b2432] text-white border border-[#483754]'
              : 'text-gray-300 hover:bg-[#231f28] hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4 text-gray-400" />
          <span>Медиа</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'profile'
              ? 'bg-[#2b2432] text-white border border-[#483754]'
              : 'text-gray-300 hover:bg-[#231f28] hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-gray-400" />
          <span>Профиль</span>
        </button>
      </div>

      <div className="h-px bg-[#26222b] mx-3 my-1"></div>

      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            ПРОСТРАНСТВА
          </span>
        </div>

        <div className="space-y-0.5">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => onSelectWorkspace(ws.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                activeWorkspaceId === ws.id
                  ? 'bg-[#2c2635] text-white font-medium'
                  : 'text-gray-300 hover:bg-[#221e27] hover:text-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{ws.name}</span>
              </div>
              <span className="text-[10px] text-gray-400">{ws.role}</span>
            </button>
          ))}

          <button
            onClick={onAddWorkspace}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-rose-400/80 hover:text-rose-300 hover:bg-[#252029] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Добавить пространство</span>
          </button>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              КАНАЛЫ · {currentWorkspace.name.toUpperCase()}
            </span>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => onSelectChannel(null)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                selectedChannelId === null
                  ? 'bg-[#24202b] text-white font-medium'
                  : 'text-gray-400 hover:bg-[#201d25] hover:text-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <span>Все каналы</span>
            </button>

            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(selectedChannelId === ch.id ? null : ch.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  selectedChannelId === ch.id
                    ? 'bg-[#2b2533] text-white font-medium border-l-2 border-[#f25a5a]'
                    : 'text-gray-400 hover:bg-[#201d25] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getPlatformIcon(ch.platform)}
                  <span className="truncate">{ch.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-[#27232e] bg-[#161418] space-y-2">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
            currentTab === 'settings'
              ? 'bg-[#282330] text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#201d25]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Настройки</span>
        </button>

        <div 
          onClick={() => onSelectTab('profile')}
          className="flex items-center justify-between p-2 rounded-lg bg-[#201d26] hover:bg-[#27232f] cursor-pointer transition-colors border border-[#2c2834]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#3d374a] text-purple-200 flex items-center justify-center font-medium text-xs">
              Ч4
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-gray-200 truncate">Чел1234 Пупын</div>
              <div className="text-[10px] text-gray-400 truncate">Контент-директор</div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </aside>
  );
};
