export type ContentStatus = 
  | 'draft'        // Черновик (Подготовка)
  | 'in_review'    // На согласовании (Подготовка)
  | 'approved'     // Утвержден (Подготовка)
  | 'scheduled'    // Запланировано (Планирование)
  | 'ready'        // Готово к публикации (Планирование)
  | 'published'    // Опубликовано (Опубликованный контент)
  | 'archived';    // В архиве (Опубликованный контент)

export type ContentStage = 'preparation' | 'scheduling' | 'published';

export type ContentCategory = 
  | 'social'       // Социальные сети
  | 'blog'         // Блог
  | 'email'        // Email-рассылка
  | 'ad'           // Реклама
  | 'video'        // Видео
  | 'podcast'      // Подкаст
  | 'analytics'    // Аналитика
  | 'pr';          // PR-релиз

export interface Channel {
  id: string;
  name: string;
  handle: string;
  platform: 'telegram' | 'vk' | 'instagram' | 'youtube' | 'website';
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
  role: string;
  membersCount: number;
}

export interface Author {
  name: string;
  email: string;
  initials: string;
  avatar?: string;
  role: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  category: ContentCategory;
  status: ContentStatus;
  publishDate: string; // YYYY-MM-DD e.g. "2026-10-05"
  publishTime: string; // HH:mm e.g. "10:00"
  channelId: string;
  workspaceId: string;
  author: Author;
  coverImage?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConflictItem {
  conflictKey: string; // channelId + publishDate + publishTime
  date: string;
  time: string;
  channelId: string;
  channelName: string;
  items: ContentItem[];
}

export type ViewTab = 'calendar' | 'materials' | 'media' | 'profile' | 'settings';
export type CalendarViewMode = 'week' | 'month' | 'day';
export type MaterialsViewMode = 'kanban' | 'list';
