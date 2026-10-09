import { useState, useEffect } from 'react';
import { 
  Channel, 
  ConflictItem, 
  ContentItem, 
  ContentStatus, 
  ViewTab, 
  Workspace 
} from './types';
import { CHANNELS, WORKSPACES } from './data/appConfig';
import { api, type ApiUser } from './api/client';
import { fromApiConflicts, fromApiMaterial, toApiMaterial } from './api/adapters';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ConflictBanner } from './components/ConflictBanner';
import { CalendarView } from './components/CalendarView';
import { MaterialsView } from './components/MaterialsView';
import { MediaView } from './components/MediaView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { CreateEditMaterialModal } from './components/CreateEditMaterialModal';
import { ConflictResolverModal } from './components/ConflictResolverModal';
import { SearchModal } from './components/SearchModal';
import { AuthScreens } from './components/AuthScreens';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('calendar');
  const [showAuthScreens, setShowAuthScreens] = useState<boolean>(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-1');
  const [channels] = useState<Channel[]>(CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const [items, setItems] = useState<ContentItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [apiError, setApiError] = useState('');
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [activeConflictModal, setActiveConflictModal] = useState<ConflictItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [defaultDateForCreate, setDefaultDateForCreate] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!api.auth.getToken()) return;
    api.auth.me().then((user) => { setCurrentUser(user); setShowAuthScreens(false); }).catch(() => {
      api.auth.clear();
      setShowAuthScreens(true);
    });
  }, []);

  useEffect(() => {
    if (showAuthScreens || !api.auth.getToken()) return;
    let active = true;
    setApiError('');
    Promise.all([api.auth.me(), api.materials.list(), api.conflicts.list()]).then(([user, materialResult, conflictResult]) => {
      if (!active) return;
      setCurrentUser(user);
      setItems(materialResult.items.map((item) => fromApiMaterial(item, channels)));
      setConflicts(fromApiConflicts(conflictResult.items, channels));
    }).catch((cause: unknown) => {
      if (!active) return;
      const message = cause instanceof Error ? cause.message : 'Не удалось загрузить данные';
      setApiError(message);
      if (typeof cause === 'object' && cause !== null && 'status' in cause && cause.status === 401) {
        api.auth.clear();
        setShowAuthScreens(true);
      }
    });
    return () => { active = false; };
  }, [showAuthScreens]);

  const reloadData = async () => {
    const [materialResult, conflictResult] = await Promise.all([api.materials.list(), api.conflicts.list()]);
    setItems(materialResult.items.map((item) => fromApiMaterial(item, channels)));
    setConflicts(fromApiConflicts(conflictResult.items, channels));
    setApiError('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleSaveMaterial = async (data: Partial<ContentItem>) => {
    const payload = toApiMaterial({ ...data, workspaceId: data.workspaceId || activeWorkspaceId }, channels, activeWorkspaceId);
    if (data.id) await api.materials.update(data.id, payload);
    else await api.materials.create(payload);
    await reloadData();
    setEditingItem(null);
    setDefaultDateForCreate(undefined);
  };

  const handleDeleteMaterial = async (id: string) => {
    await api.materials.remove(id);
    await reloadData();
    setEditingItem(null);
  };

  const handleUpdateStatus = async (itemId: string, newStatus: ContentStatus) => {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    try {
      await api.materials.update(itemId, toApiMaterial({ ...item, status: newStatus }, channels, item.workspaceId));
      await reloadData();
    } catch (cause) {
      setApiError(cause instanceof Error ? cause.message : 'Не удалось обновить статус');
    }
  };

  const handleResolveConflicts = async (resolvedItems: ContentItem[]) => {
    try {
      for (const updated of resolvedItems) {
        const current = items.find((entry) => entry.id === updated.id);
        if (!current) continue;
        const changed = current.publishDate !== updated.publishDate || current.publishTime !== updated.publishTime || current.channelId !== updated.channelId || current.status !== updated.status;
        if (changed) {
          await api.materials.update(updated.id, toApiMaterial(updated, channels, updated.workspaceId));
        }
      }
      if (activeConflictModal?.id) await api.conflicts.resolve(activeConflictModal.id);
      await reloadData();
      setActiveConflictModal(null);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Не удалось разрешить конфликт';
      setApiError(message);
    }
  };

  const handleOpenCreateWithDate = (dateStr: string) => {
    setDefaultDateForCreate(dateStr);
    setEditingItem(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenItem = (item: ContentItem) => {
    setEditingItem(item);
    setIsCreateModalOpen(true);
  };

  const handleAddWorkspace = () => {
    const name = prompt('Введите название нового пространства:');
    if (name && name.trim()) {
      const newWs: Workspace = {
        id: `ws-${Date.now()}`,
        name: name.trim(),
        role: 'Владелец',
        membersCount: 1,
      };
      setWorkspaces((prev) => [...prev, newWs]);
      setActiveWorkspaceId(newWs.id);
    }
  };

  if (showAuthScreens) {
    return (
      <AuthScreens
        onLoginSuccess={(user) => { setCurrentUser(user); setShowAuthScreens(false); }}
        onBackToApp={() => setShowAuthScreens(false)}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#161418] text-white">
      {apiError && <div role="alert" className="fixed bottom-4 right-4 z-[100] max-w-md rounded-xl border border-red-500/40 bg-[#2a171b] px-4 py-3 text-xs text-red-200 shadow-xl">{apiError}<button className="ml-3 underline" onClick={() => setApiError('')}>Закрыть</button></div>}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block z-40 fixed md:static inset-y-0 left-0`}>
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={setActiveWorkspaceId}
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelectChannel={setSelectedChannelId}
          onOpenSearch={() => setIsSearchOpen(true)}
          user={currentUser}
          onAddWorkspace={handleAddWorkspace}
          conflictCount={conflicts.length}
        />
      </div>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          currentTab={currentTab}
          onOpenCreateModal={() => {
            setEditingItem(null);
            setDefaultDateForCreate(undefined);
            setIsCreateModalOpen(true);
          }}
          conflicts={conflicts}
          onOpenConflictResolver={(conflict) => setActiveConflictModal(conflict)}
          onToggleAuthView={() => setShowAuthScreens(true)}
          onSelectTab={setCurrentTab}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          workspaceName={activeWorkspace.name}
        />

        <ConflictBanner
          conflicts={conflicts}
          onOpenResolver={(conflict) => setActiveConflictModal(conflict)}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {currentTab === 'calendar' && (
            <CalendarView
              items={items}
              channels={channels}
              conflicts={conflicts}
              onSelectItem={handleOpenItem}
              onCreateAtDate={handleOpenCreateWithDate}
              onOpenConflictResolver={(conflict) => setActiveConflictModal(conflict)}
              selectedChannelId={selectedChannelId}
            />
          )}

          {currentTab === 'materials' && (
            <MaterialsView
              items={items}
              channels={channels}
              conflicts={conflicts}
              onSelectItem={handleOpenItem}
              onOpenCreateModal={() => {
                setEditingItem(null);
                setDefaultDateForCreate(undefined);
                setIsCreateModalOpen(true);
              }}
              onUpdateStatus={handleUpdateStatus}
              onOpenConflictResolver={(conflict) => setActiveConflictModal(conflict)}
              selectedChannelId={selectedChannelId}
            />
          )}

          {currentTab === 'media' && <MediaView />}

          {currentTab === 'profile' && <ProfileView workspaces={workspaces} user={currentUser} />}

          {currentTab === 'settings' && <SettingsView workspace={activeWorkspace} />}
        </main>
      </div>

      <CreateEditMaterialModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingItem(null);
          setDefaultDateForCreate(undefined);
        }}
        onSave={handleSaveMaterial}
        onDelete={handleDeleteMaterial}
        initialItem={editingItem}
        channels={channels}
        existingItems={items}
        defaultDate={defaultDateForCreate}
        defaultChannelId={selectedChannelId || undefined}
      />

      <ConflictResolverModal
        conflict={activeConflictModal}
        channels={channels}
        onClose={() => setActiveConflictModal(null)}
        onResolve={handleResolveConflicts}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={items}
        conflicts={conflicts}
        onSelectItem={(item) => {
          handleOpenItem(item);
        }}
      />
    </div>
  );
}
