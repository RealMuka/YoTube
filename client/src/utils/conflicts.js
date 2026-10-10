export const STATUS_MAP = {
    draft: { label: 'Черновик', stage: 'preparation', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
    in_review: { label: 'На согласовании', stage: 'preparation', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    approved: { label: 'Утвержден', stage: 'preparation', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    scheduled: { label: 'Запланировано', stage: 'scheduling', color: '#f25a5a', bg: 'rgba(242, 90, 90, 0.18)' },
    ready: { label: 'Готово к публикации', stage: 'scheduling', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
    published: { label: 'Опубликовано', stage: 'published', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
    archived: { label: 'В архиве', stage: 'published', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
};
export const STAGE_CONFIG = {
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
export function getStageForStatus(status) {
    return STATUS_MAP[status]?.stage || 'preparation';
}
export function isItemInConflict(itemId, conflicts) {
    return conflicts.some((c) => c.items.some((it) => it.id === itemId));
}
export function getConflictForItem(itemId, conflicts) {
    return conflicts.find((c) => c.items.some((it) => it.id === itemId));
}
export function checkPotentialConflict(data, items, channels, ignoreItemId) {
    if (data.status !== 'scheduled' && data.status !== 'ready') {
        return { hasConflict: false };
    }
    const selectedChannel = channels.find((channel) => channel.id === data.channelId);
    if (!selectedChannel)
        return { hasConflict: false };
    const selectedTime = new Date(`${data.publishDate}T${data.publishTime}:00`).getTime();
    if (!Number.isFinite(selectedTime))
        return { hasConflict: false };
    // Keep the editor preview aligned with the backend's same-platform ±30 minute rule.
    const conflictItem = items.find((item) => {
        if (item.id === ignoreItemId)
            return false;
        if (item.status !== 'scheduled' && item.status !== 'ready')
            return false;
        const channel = channels.find((candidate) => candidate.id === item.channelId);
        if (!channel || channel.platform !== selectedChannel.platform)
            return false;
        const itemTime = new Date(`${item.publishDate}T${item.publishTime}:00`).getTime();
        return Number.isFinite(itemTime) && Math.abs(itemTime - selectedTime) <= 30 * 60 * 1000;
    });
    return {
        hasConflict: !!conflictItem,
        conflictingWith: conflictItem,
    };
}
export function formatDateRu(dateStr) {
    if (!dateStr)
        return '';
    const [, month, day] = dateStr.split('-');
    const months = [
        'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
        'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    const mIndex = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${months[mIndex] || month}`;
}
