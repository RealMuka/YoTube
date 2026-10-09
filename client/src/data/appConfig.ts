import { Channel, ContentCategory, Workspace } from '../types';

export const CATEGORIES: { id: ContentCategory; label: string; color: string }[] = [
  { id: 'social', label: 'Социальные сети', color: '#6366f1' },
  { id: 'blog', label: 'Блог', color: '#f43f5e' },
  { id: 'email', label: 'Email-рассылка', color: '#ec4899' },
  { id: 'ad', label: 'Реклама', color: '#f97316' },
  { id: 'video', label: 'Видео', color: '#e11d48' },
  { id: 'podcast', label: 'Подкаст', color: '#f43f5e' },
  { id: 'analytics', label: 'Аналитика', color: '#8b5cf6' },
  { id: 'pr', label: 'PR-релиз', color: '#e11d48' },
];

export const WORKSPACES: Workspace[] = [
  { id: 'ws-1', name: 'Контент-бардак', role: 'Администратор', membersCount: 6 },
  { id: 'ws-2', name: 'Рекламный паблик', role: 'Редактор', membersCount: 4 },
  { id: 'ws-3', name: 'Сырые идеи', role: 'Владелец', membersCount: 1 },
];

export const CHANNELS: Channel[] = [
  { id: 'ch-tg', name: 'Бардак / Telegram', handle: '@bardak_off', platform: 'telegram', workspaceId: 'ws-1' },
  { id: 'ch-vk', name: 'Бардак / VK', handle: 'vk.com/bardak_off', platform: 'vk', workspaceId: 'ws-1' },
  { id: 'ch-ig', name: 'Бардак / Instagram', handle: '@bardak_off', platform: 'instagram', workspaceId: 'ws-1' },
  { id: 'ch-yt', name: 'Бардак / YouTube', handle: '@BardakOffline', platform: 'youtube', workspaceId: 'ws-1' },
  { id: 'ch-web', name: 'Блог на сайте', handle: 'bardakoff/blog', platform: 'website', workspaceId: 'ws-1' },
];


export const SAMPLE_COVER_IMAGE = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&auto=format&fit=crop&q=80';
