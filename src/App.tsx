import React, { useState, useEffect } from 'react';
import { 
  Channel, 
  ConflictItem, 
  ContentItem, 
  ContentStatus, 
  ViewTab, 
  Workspace 
} from './types';
import { CHANNELS, INITIAL_CONTENT_ITEMS, WORKSPACES } from './data/initialData';
import { detectConflicts } from './utils/conflicts';

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
  const [showAuthScreens, setShowAuthScreens] = useState<boolean>(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-1');
  const [channels] = useState<Channel[]>(CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const [items, setItems] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem('kontentno_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CONTENT_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('kontentno_items', JSON.stringify(items));
  }, [items]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [activeConflictModal, setActiveConflictModal] = useState<ConflictItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [defaultDateForCreate, setDefaultDateForCreate] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const conflicts = detectConflicts(items, channels);

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

  const handleSaveMaterial = (data: Partial<ContentItem>) => {
    if (data.id) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === data.id
            ? ({
                ...it,
                ...data,
                updatedAt: new Date().toISOString(),
              } as ContentItem)
            : it
        )
      );
    } else {
      const newItem: ContentItem = {
        id: `cnt-${Date.now()}`,
        title: data.title || 'Новый материал',
        description: data.description,
        category: data.category || 'social',
        status: data.status || 'draft',
        publishDate: data.publishDate || '2026-10-05',
        publishTime: data.publishTime || '10:00',
        channelId: data.channelId || channels[0]?.id || 'ch-tg',
        workspaceId: activeWorkspaceId,
        author: {
          name: 'Чел1234 Пупын',
          email: 'chelovek1234@pochta.ru',
          initials: 'Ч4',
          role: 'Контент-директор',
        },
        coverImage: data.coverImage,
        tags: data.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setEditingItem(null);
    setDefaultDateForCreate(undefined);
  };

  const handleDeleteMaterial = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setEditingItem(null);
  };

  const handleUpdateStatus = (itemId: string, newStatus: ContentStatus) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, status: newStatus, updatedAt: new Date().toISOString() }
          : it
      )
    );
  };

  const handleResolveConflicts = (resolvedItems: ContentItem[]) => {
    setItems((prev) => {
      const map = new Map(resolvedItems.map((r) => [r.id, r]));
      return prev.map((item) => (map.has(item.id) ? map.get(item.id)! : item));
    });
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
        onLoginSuccess={() => setShowAuthScreens(false)}
        onBackToApp={() => setShowAuthScreens(false)}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#161418] text-white">
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
          onOpenCreateModal={() => {
            setEditingItem(null);
            setDefaultDateForCreate(undefined);
            setIsCreateModalOpen(true);
          }}
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
              onSelectChannel={setSelectedChannelId}
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
              onSelectChannel={setSelectedChannelId}
            />
          )}

          {currentTab === 'media' && <MediaView />}

          {currentTab === 'profile' && <ProfileView workspaces={workspaces} />}

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
