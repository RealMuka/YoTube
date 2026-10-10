const validStatuses = new Set(['draft', 'in_review', 'approved', 'scheduled', 'ready', 'published', 'archived']);
function localDateTime(value) {
    if (!value)
        return { date: new Date().toLocaleDateString('en-CA'), time: '10:00' };
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return { date: new Date().toLocaleDateString('en-CA'), time: '10:00' };
    const pad = (n) => String(n).padStart(2, '0');
    return {
        date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        time: `${pad(date.getHours())}:${pad(date.getMinutes())}`
    };
}
function displayName(author) {
    if (!author || typeof author === 'string')
        return { name: 'Пользователь', email: '', role: 'Автор', initials: 'П' };
    const names = author.name.trim().split(/\s+/);
    return { name: author.name, email: author.email, role: author.role === 'admin' ? 'Администратор' : author.role === 'editor' ? 'Редактор' : 'Автор', initials: names.map((part) => part[0] || '').slice(0, 2).join('').toUpperCase() };
}
export function fromApiMaterial(material, channels) {
    const id = String(material.id || material._id || '');
    const channel = channels.find((item) => item.id === material.channelId) || channels.find((item) => item.platform === material.platform) || channels[0];
    const scheduled = localDateTime(material.scheduledAt);
    const author = displayName(material.author);
    const rawStatus = material.uiStatus || material.status;
    const status = validStatuses.has(rawStatus) ? rawStatus : 'draft';
    const createdAt = material.createdAt || new Date().toISOString();
    return {
        id,
        title: material.title,
        description: material.description || '',
        category: (material.category || 'social'),
        status,
        publishDate: scheduled.date,
        publishTime: scheduled.time,
        channelId: material.channelId || channel?.id || 'ch-tg',
        workspaceId: material.workspaceId || channel?.workspaceId || 'ws-1',
        author,
        coverImage: material.coverImage || undefined,
        tags: material.tags || [],
        createdAt,
        updatedAt: material.updatedAt || createdAt
    };
}
export function toApiMaterial(item, channels, workspaceId = 'ws-1') {
    const channel = channels.find((entry) => entry.id === item.channelId) || channels[0];
    let scheduledAt = null;
    if (item.publishDate && item.publishTime) {
        const date = new Date(`${item.publishDate}T${item.publishTime}:00`);
        if (!Number.isNaN(date.getTime()))
            scheduledAt = date.toISOString();
    }
    return {
        title: item.title || 'Новый материал',
        description: item.description || '',
        platform: channel?.platform || 'telegram',
        status: item.status || 'draft',
        uiStatus: item.status || 'draft',
        scheduledAt,
        channelId: item.channelId || channel?.id || 'ch-tg',
        workspaceId: item.workspaceId || workspaceId,
        category: item.category || 'social',
        coverImage: item.coverImage || '',
        tags: item.tags || []
    };
}
export function fromApiConflicts(conflicts, channels) {
    return conflicts.flatMap((conflict) => {
        const materials = (conflict.materials || []).filter((item) => item && typeof item === 'object');
        if (materials.length < 2)
            return [];
        const items = materials.map((item) => fromApiMaterial(item, channels));
        const firstRaw = materials[0];
        const first = items[0];
        const channel = channels.find((entry) => entry.id === firstRaw.channelId) || channels.find((entry) => entry.platform === firstRaw.platform);
        return [{
                id: String(conflict.id || conflict._id || ''),
                conflictKey: String(conflict.id || conflict._id || items.map((item) => item.id).sort().join(':')),
                date: first.publishDate,
                time: first.publishTime,
                channelId: first.channelId,
                channelName: channel?.name || firstRaw.platform,
                items
            }];
    });
}
