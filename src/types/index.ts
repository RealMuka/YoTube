export type ContentStatus = 
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'scheduled'
  | 'ready'
  | 'published'
  | 'archived';

export type ContentStage = 'preparation' | 'scheduling' | 'published';

export type ContentCategory = 
  | 'social'
  | 'blog'
  | 'email'
  | 'ad'
  | 'video'
  | 'podcast'
  | 'analytics'
  | 'pr';

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
  publishDate: string;
  publishTime: string;
  channelId: string;
  workspaceId: string;
  author: Author;
  coverImage?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConflictItem {
  conflictKey: string;
  date: string;
  time: string;
  channelId: string;
  channelName: string;
  items: ContentItem[];
}

export type ViewTab = 'calendar' | 'materials' | 'media' | 'profile' | 'settings';
export type CalendarViewMode = 'week' | 'month' | 'day';
export type MaterialsViewMode = 'kanban' | 'list';
