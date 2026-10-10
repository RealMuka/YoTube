import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { CHANNELS } from './data/appConfig';
import { api } from './api/client';
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
    const [currentTab, setCurrentTab] = useState('calendar');
    const [showAuthScreens, setShowAuthScreens] = useState(true);
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
    const [channels] = useState(CHANNELS);
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [items, setItems] = useState([]);
    const [conflicts, setConflicts] = useState([]);
    const [apiError, setApiError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeConflictModal, setActiveConflictModal] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [defaultDateForCreate, setDefaultDateForCreate] = useState(undefined);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => {
        if (!api.auth.getToken())
            return;
        api.auth.me().then((user) => { setCurrentUser(user); setShowAuthScreens(false); }).catch(() => {
            api.auth.clear();
            setShowAuthScreens(true);
        });
    }, []);
    useEffect(() => {
        if (showAuthScreens || !api.auth.getToken())
            return;
        let active = true;
        setApiError('');
        const loadWorkspaceData = async () => {
            const [user, workspaceResult] = await Promise.all([api.auth.me(), api.workspaces.list()]);
            if (!active)
                return;
            const availableWorkspaces = workspaceResult.items.map((workspace) => ({
                ...workspace,
                id: String(workspace.id),
            }));
            const selectedWorkspace = availableWorkspaces.find((workspace) => workspace.id === activeWorkspaceId) || availableWorkspaces[0];
            setCurrentUser(user);
            setWorkspaces(availableWorkspaces);
            if (!selectedWorkspace)
                throw new Error('Не удалось создать пространство по умолчанию');
            setActiveWorkspaceId(selectedWorkspace.id);
            const [materialResult, conflictResult] = await Promise.all([
                api.materials.list({ workspaceId: selectedWorkspace.id }),
                api.conflicts.list('pending', selectedWorkspace.id),
            ]);
            if (!active)
                return;
            setItems(materialResult.items.map((item) => fromApiMaterial(item, channels)));
            setConflicts(fromApiConflicts(conflictResult.items, channels));
        };
        loadWorkspaceData().catch((cause) => {
            if (!active)
                return;
            const message = cause instanceof Error ? cause.message : 'Не удалось загрузить данные';
            setApiError(message);
            if (typeof cause === 'object' && cause !== null && 'status' in cause && cause.status === 401) {
                api.auth.clear();
                setShowAuthScreens(true);
            }
        });
        return () => { active = false; };
    }, [showAuthScreens]);
    const reloadData = async (workspaceId = activeWorkspaceId) => {
        if (!workspaceId)
            return;
        const [materialResult, conflictResult] = await Promise.all([
            api.materials.list({ workspaceId }),
            api.conflicts.list('pending', workspaceId),
        ]);
        setItems(materialResult.items.map((item) => fromApiMaterial(item, channels)));
        setConflicts(fromApiConflicts(conflictResult.items, channels));
        setApiError('');
    };
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || { id: activeWorkspaceId, name: 'Default', role: 'Владелец', membersCount: 1 };
    const handleSaveMaterial = async (data) => {
        const payload = toApiMaterial({ ...data, workspaceId: data.workspaceId || activeWorkspaceId }, channels, activeWorkspaceId);
        if (data.id)
            await api.materials.update(data.id, payload);
        else
            await api.materials.create(payload);
        await reloadData();
        setEditingItem(null);
        setDefaultDateForCreate(undefined);
    };
    const handleDeleteMaterial = async (id) => {
        await api.materials.remove(id);
        await reloadData();
        setEditingItem(null);
    };
    const handleUpdateStatus = async (itemId, newStatus) => {
        const item = items.find((entry) => entry.id === itemId);
        if (!item)
            return;
        try {
            await api.materials.update(itemId, toApiMaterial({ ...item, status: newStatus }, channels, item.workspaceId));
            await reloadData();
        }
        catch (cause) {
            setApiError(cause instanceof Error ? cause.message : 'Не удалось обновить статус');
        }
    };
    const handleResolveConflicts = async (resolvedItems) => {
        try {
            for (const updated of resolvedItems) {
                const current = items.find((entry) => entry.id === updated.id);
                if (!current)
                    continue;
                const changed = current.publishDate !== updated.publishDate || current.publishTime !== updated.publishTime || current.channelId !== updated.channelId || current.status !== updated.status;
                if (changed) {
                    await api.materials.update(updated.id, toApiMaterial(updated, channels, updated.workspaceId));
                }
            }
            if (activeConflictModal?.id)
                await api.conflicts.resolve(activeConflictModal.id);
            await reloadData();
            setActiveConflictModal(null);
        }
        catch (cause) {
            const message = cause instanceof Error ? cause.message : 'Не удалось разрешить конфликт';
            setApiError(message);
        }
    };
    const handleOpenCreateWithDate = (dateStr) => {
        setDefaultDateForCreate(dateStr);
        setEditingItem(null);
        setIsCreateModalOpen(true);
    };
    const handleOpenItem = (item) => {
        setEditingItem(item);
        setIsCreateModalOpen(true);
    };
    const handleAddWorkspace = async () => {
        const name = prompt('Название нового пространства', 'Новое пространство');
        if (!name || !name.trim())
            return;
        try {
            const result = await api.workspaces.create(name.trim());
            const workspace = result.item;
            setWorkspaces((previous) => [...previous, workspace]);
            setActiveWorkspaceId(workspace.id);
            setSelectedChannelId(null);
            await reloadData(workspace.id);
        }
        catch (cause) {
            setApiError(cause instanceof Error ? cause.message : 'Не удалось создать пространство');
        }
    };
    const handleSelectWorkspace = async (workspaceId) => {
        setActiveWorkspaceId(workspaceId);
        setSelectedChannelId(null);
        try {
            await reloadData(workspaceId);
        }
        catch (cause) {
            setApiError(cause instanceof Error ? cause.message : 'Не удалось загрузить пространство');
        }
    };
    const handleDeleteWorkspace = async (workspaceId) => {
        const workspace = workspaces.find((entry) => entry.id === workspaceId);
        if (!workspace)
            return;
        if (workspaces.length <= 1) {
            setApiError('Нельзя удалить последнее пространство. Сначала создайте другое.');
            return;
        }
        const accepted = window.confirm(`Удалить пространство «${workspace.name}» вместе со всеми его материалами? Это действие нельзя отменить.`);
        if (!accepted)
            return;
        try {
            await api.workspaces.remove(workspaceId);
            const result = await api.workspaces.list();
            const nextWorkspaces = result.items;
            setWorkspaces(nextWorkspaces);
            if (workspaceId === activeWorkspaceId) {
                const nextWorkspace = nextWorkspaces[0];
                setActiveWorkspaceId(nextWorkspace.id);
                setSelectedChannelId(null);
                await reloadData(nextWorkspace.id);
            }
        }
        catch (cause) {
            setApiError(cause instanceof Error ? cause.message : 'Не удалось удалить пространство');
        }
    };
    const handleMoveMaterial = async (itemId, nextDate) => {
        const item = items.find((entry) => entry.id === itemId);
        if (!item || item.publishDate === nextDate)
            return;
        try {
            const updated = { ...item, publishDate: nextDate, workspaceId: item.workspaceId || activeWorkspaceId };
            await api.materials.update(item.id, toApiMaterial(updated, channels, activeWorkspaceId));
            await reloadData(activeWorkspaceId);
        }
        catch (cause) {
            setApiError(cause instanceof Error ? cause.message : 'Не удалось перенести событие');
        }
    };
    if (showAuthScreens) {
        return (_jsx(AuthScreens, { onLoginSuccess: (user) => { setCurrentUser(user); setShowAuthScreens(false); }, onBackToApp: () => setShowAuthScreens(false) }));
    }
    return (_jsxs("div", { className: "flex h-screen w-screen overflow-hidden bg-[#161418] text-white", children: [apiError && _jsxs("div", { role: "alert", className: "fixed bottom-4 right-4 z-[100] max-w-md rounded-xl border border-red-500/40 bg-[#2a171b] px-4 py-3 text-xs text-red-200 shadow-xl", children: [apiError, _jsx("button", { className: "ml-3 underline", onClick: () => setApiError(''), children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] }), _jsx("div", { className: `${mobileMenuOpen ? 'block' : 'hidden'} md:block z-40 fixed md:static inset-y-0 left-0`, children: _jsx(Sidebar, { currentTab: currentTab, onSelectTab: (tab) => {
                        setCurrentTab(tab);
                        setMobileMenuOpen(false);
                    }, workspaces: workspaces, activeWorkspaceId: activeWorkspaceId, onSelectWorkspace: handleSelectWorkspace, onDeleteWorkspace: handleDeleteWorkspace, channels: channels, selectedChannelId: selectedChannelId, onSelectChannel: setSelectedChannelId, onOpenSearch: () => setIsSearchOpen(true), user: currentUser, onAddWorkspace: handleAddWorkspace, conflictCount: conflicts.length }) }), mobileMenuOpen && (_jsx("div", { onClick: () => setMobileMenuOpen(false), className: "fixed inset-0 bg-black/60 z-30 md:hidden" })), _jsxs("div", { className: "flex-1 flex flex-col min-w-0 h-full overflow-hidden", children: [_jsx(Header, { currentTab: currentTab, onOpenCreateModal: () => {
                            setEditingItem(null);
                            setDefaultDateForCreate(undefined);
                            setIsCreateModalOpen(true);
                        }, conflicts: conflicts, onOpenConflictResolver: (conflict) => setActiveConflictModal(conflict), onToggleAuthView: () => setShowAuthScreens(true), onSelectTab: setCurrentTab, onToggleMobileMenu: () => setMobileMenuOpen(!mobileMenuOpen), workspaceName: activeWorkspace.name }), _jsx(ConflictBanner, { conflicts: conflicts, onOpenResolver: (conflict) => setActiveConflictModal(conflict) }), _jsxs("main", { className: "flex-1 flex flex-col min-h-0 overflow-hidden relative", children: [currentTab === 'calendar' && (_jsx(CalendarView, { items: items, channels: channels, conflicts: conflicts, onSelectItem: handleOpenItem, onCreateAtDate: handleOpenCreateWithDate, onMoveItem: handleMoveMaterial, onOpenConflictResolver: (conflict) => setActiveConflictModal(conflict), selectedChannelId: selectedChannelId })), currentTab === 'materials' && (_jsx(MaterialsView, { items: items, channels: channels, conflicts: conflicts, onSelectItem: handleOpenItem, onOpenCreateModal: () => {
                                    setEditingItem(null);
                                    setDefaultDateForCreate(undefined);
                                    setIsCreateModalOpen(true);
                                }, onUpdateStatus: handleUpdateStatus, onOpenConflictResolver: (conflict) => setActiveConflictModal(conflict), selectedChannelId: selectedChannelId })), currentTab === 'media' && _jsx(MediaView, {}), currentTab === 'profile' && _jsx(ProfileView, { workspaces: workspaces, user: currentUser }), currentTab === 'settings' && _jsx(SettingsView, { workspace: activeWorkspace })] })] }), _jsx(CreateEditMaterialModal, { isOpen: isCreateModalOpen, onClose: () => {
                    setIsCreateModalOpen(false);
                    setEditingItem(null);
                    setDefaultDateForCreate(undefined);
                }, onSave: handleSaveMaterial, onDelete: handleDeleteMaterial, initialItem: editingItem, channels: channels, existingItems: items, defaultDate: defaultDateForCreate, defaultChannelId: selectedChannelId || undefined }), _jsx(ConflictResolverModal, { conflict: activeConflictModal, channels: channels, onClose: () => setActiveConflictModal(null), onResolve: handleResolveConflicts }), _jsx(SearchModal, { isOpen: isSearchOpen, onClose: () => setIsSearchOpen(false), items: items, conflicts: conflicts, onSelectItem: (item) => {
                    handleOpenItem(item);
                } })] }));
}
