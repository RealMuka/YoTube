import { Channel, ConflictItem, ContentCategory, ContentItem, ContentStage, ContentStatus } from '../types';

export const STATUS_MAP: Record<ContentStatus, { label: string; stage: ContentStage; color: string; bg: string }> = {
  draft: { label: 'Черновик', stage: 'preparation', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  in_review: { label: 'На согласовании', stage: 'preparation', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  approved: { label: 'Утвержден', stage: 'preparation', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  scheduled: { label: 'Запланировано', stage: 'scheduling', color: '#f25a5a', bg: 'rgba(242, 90, 90, 0.18)' },
  ready: { label: 'Готово к публикации', stage: 'scheduling', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  published: { label: 'Опубликовано', stage: 'published', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
  archived: { label: 'В архиве', stage: 'published', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
};

export const STAGE_CONFIG: Record<ContentStage, { title: string; subtitle: string; statuses: ContentStatus[] }> = {
  preparation: {
    title: 'Этап подготовки',
    subtitle: 'Идеи, черновики и согласование материалов',
    statuses: ['draft', 'in_review', 'approved'],
  },
  scheduling: {
    title: 'Планирование публикаций',
    subtitle: 'Утвержденный контент-план и дата выхода',
    statuses: ['scheduled', 'ready'],
  },
  published: {
    title: 'Опубликованный контент',
    subtitle: 'Вышедшие материалы и архив',
    statuses: ['published', 'archived'],
  },
};

export function getStageForStatus(status: ContentStatus): ContentStage {
  return STATUS_MAP[status]?.stage || 'preparation';
}

/**
 * Detects time conflicts when two or more scheduled/ready materials
 * are assigned to the exact same channel and identical time slot.
 */
export function detectConflicts(items: ContentItem[], channels: Channel[]): ConflictItem[] {
  // Only check items that are scheduled/ready or active (exclude archived or pure drafts without channel)
  const activeItems = items.filter(
    (item) => item.status === 'scheduled' || item.status === 'ready'
  );

  // Group by channelId + publishDate + publishTime
  const map = new Map<string, ContentItem[]>();

  for (const item of activeItems) {
    if (!item.publishDate || !item.publishTime || !item.channelId) continue;
    const key = `${item.channelId}_${item.publishDate}_${item.publishTime}`;
    const group = map.get(key) || [];
    group.push(item);
    map.set(key, group);
  }

  const conflicts: ConflictItem[] = [];

  map.forEach((groupedItems, conflictKey) => {
    if (groupedItems.length > 1) {
      const first = groupedItems[0];
      const channel = channels.find((c) => c.id === first.channelId);
      conflicts.push({
        conflictKey,
        date: first.publishDate,
        time: first.publishTime,
        channelId: first.channelId,
        channelName: channel?.name || 'Неизвестный канал',
        items: groupedItems,
      });
    }
  });

  return conflicts;
}

export function isItemInConflict(itemId: string, conflicts: ConflictItem[]): boolean {
  return conflicts.some((c) => c.items.some((it) => it.id === itemId));
}

export function getConflictForItem(itemId: string, conflicts: ConflictItem[]): ConflictItem | undefined {
  return conflicts.find((c) => c.items.some((it) => it.id === itemId));
}

/**
 * Checks in real time whether a material being created or updated will conflict
 */
export function checkPotentialConflict(
  data: {
    channelId: string;
    publishDate: string;
    publishTime: string;
    status: ContentStatus;
  },
  items: ContentItem[],
  ignoreItemId?: string
): { hasConflict: boolean; conflictingWith?: ContentItem } {
  if (data.status !== 'scheduled' && data.status !== 'ready') {
    return { hasConflict: false };
  }

  const conflictItem = items.find((item) => {
    if (item.id === ignoreItemId) return false;
    if (item.status !== 'scheduled' && item.status !== 'ready') return false;
    return (
      item.channelId === data.channelId &&
      item.publishDate === data.publishDate &&
      item.publishTime === data.publishTime
    );
  });

  return {
    hasConflict: !!conflictItem,
    conflictingWith: conflictItem,
  };
}

export function formatDateRu(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${months[mIndex] || month}`;
}

export function formatFullDateRu(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  return `${daysOfWeek[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
