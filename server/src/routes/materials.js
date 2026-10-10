import { Router } from 'express';
import { Types } from 'mongoose';
import Material, { materialStatuses, uiStatuses, platforms } from '../models/Material.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { syncConflictsForMaterial } from '../services/conflictService.js';
const router = Router();
router.use(requireAuth);
const toCanonicalStatus = (status) => {
    if (status === 'scheduled' || status === 'ready')
        return 'scheduled';
    if (status === 'published' || status === 'archived')
        return 'published';
    return 'draft';
};
function parseScheduledAt(body, existing) {
    if (body.scheduledAt) {
        const date = new Date(String(body.scheduledAt));
        if (Number.isNaN(date.getTime()))
            throw new HttpError(400, 'Некорректная дата публикации');
        return date;
    }
    if (body.publishDate && body.publishTime) {
        const date = new Date(`${String(body.publishDate)}T${String(body.publishTime)}`);
        if (Number.isNaN(date.getTime()))
            throw new HttpError(400, 'Некорректная дата и время публикации');
        return date;
    }
    return existing ?? null;
}
function isValidObjectId(id) { return Types.ObjectId.isValid(id); }
router.get('/', asyncHandler(async (req, res) => {
    const filter = { author: req.user.id };
    if (req.query.workspaceId)
        filter.workspaceId = String(req.query.workspaceId);
    if (req.query.platform)
        filter.platform = String(req.query.platform);
    if (req.query.status) {
        const status = String(req.query.status);
        if (uiStatuses.includes(status) && !['draft', 'scheduled', 'published'].includes(status))
            filter.uiStatus = status;
        else
            filter.status = ['draft', 'scheduled', 'published'].includes(status) ? status : toCanonicalStatus(status);
    }
    if (req.query.q)
        filter.title = { $regex: String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (req.query.from || req.query.to) {
        const range = {};
        if (req.query.from)
            range.$gte = new Date(String(req.query.from));
        if (req.query.to)
            range.$lte = new Date(String(req.query.to));
        filter.scheduledAt = range;
    }
    const materials = await Material.find(filter).populate('author', 'name email role createdAt').populate('media').sort({ scheduledAt: 1, createdAt: -1 }).lean({ virtuals: true });
    res.json({ items: materials, count: materials.length });
}));
router.get('/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id))
        throw new HttpError(400, 'Некорректный идентификатор материала');
    const item = await Material.findOne({ _id: req.params.id, author: req.user.id }).populate('author', 'name email role createdAt').populate('media');
    if (!item)
        throw new HttpError(404, 'Материал не найден');
    res.json({ item });
}));
router.post('/', asyncHandler(async (req, res) => {
    const body = req.body;
    const title = String(body.title ?? '').trim();
    const platform = String(body.platform ?? '');
    const uiStatusInput = String(body.uiStatus ?? body.status ?? 'draft');
    if (!title)
        throw new HttpError(400, 'Заголовок обязателен');
    if (!platforms.includes(platform))
        throw new HttpError(400, 'Неизвестная платформа публикации');
    const scheduledAt = parseScheduledAt(body);
    if (!uiStatuses.includes(uiStatusInput) && !materialStatuses.includes(uiStatusInput)) {
        throw new HttpError(400, 'Неизвестный статус материала');
    }
    const canonicalStatus = toCanonicalStatus(uiStatusInput);
    if (canonicalStatus === 'scheduled' && !scheduledAt)
        throw new HttpError(400, 'Для запланированной публикации укажите дату и время');
    const displayStatus = (uiStatuses.includes(uiStatusInput) ? uiStatusInput : canonicalStatus);
    const category = String(body.category ?? 'social');
    const mediaIds = Array.isArray(body.media) ? body.media.map(String).filter(isValidObjectId) : [];
    const material = await Material.create({
        title,
        description: String(body.description ?? ''),
        platform: platform,
        status: canonicalStatus,
        uiStatus: displayStatus,
        scheduledAt,
        media: mediaIds,
        author: req.user.id,
        category,
        channelId: String(body.channelId ?? ''),
        workspaceId: String(body.workspaceId ?? 'ws-1'),
        coverImage: String(body.coverImage ?? ''),
        tags: Array.isArray(body.tags) ? body.tags.map(String) : []
    });
    await syncConflictsForMaterial(String(material._id));
    const saved = await Material.findById(material._id).populate('author', 'name email role createdAt').populate('media');
    const pendingConflicts = await (await import('../models/Conflict.js')).default.find({ materials: material._id, status: 'pending' }).select('_id reason status');
    res.status(201).json({ item: saved, hasConflict: pendingConflicts.length > 0, conflicts: pendingConflicts });
}));
router.put('/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id))
        throw new HttpError(400, 'Некорректный идентификатор материала');
    const material = await Material.findById(req.params.id);
    if (!material)
        throw new HttpError(404, 'Материал не найден');
    if (String(material.author) !== req.user.id && req.user.role !== 'admin')
        throw new HttpError(403, 'Недостаточно прав для изменения материала');
    const body = req.body;
    if (body.title !== undefined)
        material.title = String(body.title).trim();
    if (body.description !== undefined)
        material.description = String(body.description);
    if (body.platform !== undefined) {
        if (!platforms.includes(String(body.platform)))
            throw new HttpError(400, 'Неизвестная платформа публикации');
        material.platform = String(body.platform);
    }
    if (body.status !== undefined || body.uiStatus !== undefined) {
        const uiStatus = String(body.uiStatus ?? body.status);
        if (!uiStatuses.includes(uiStatus) && !materialStatuses.includes(uiStatus)) {
            throw new HttpError(400, 'Неизвестный статус материала');
        }
        material.status = toCanonicalStatus(uiStatus);
        material.uiStatus = uiStatuses.includes(uiStatus) ? uiStatus : material.status;
    }
    if (body.scheduledAt !== undefined || (body.publishDate && body.publishTime))
        material.scheduledAt = parseScheduledAt(body);
    if (body.category !== undefined)
        material.category = String(body.category);
    if (body.channelId !== undefined)
        material.channelId = String(body.channelId);
    if (body.workspaceId !== undefined)
        material.workspaceId = String(body.workspaceId);
    if (body.coverImage !== undefined)
        material.coverImage = String(body.coverImage);
    if (body.tags !== undefined)
        material.tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
    if (body.media !== undefined) {
        const mediaIds = Array.isArray(body.media) ? body.media.map(String).filter(isValidObjectId) : [];
        material.media = mediaIds;
    }
    if (material.status === 'scheduled' && !material.scheduledAt)
        throw new HttpError(400, 'Для запланированной публикации укажите дату и время');
    await material.save();
    await syncConflictsForMaterial(String(material._id));
    const saved = await Material.findById(material._id).populate('author', 'name email role createdAt').populate('media');
    const Conflict = (await import('../models/Conflict.js')).default;
    const pendingConflicts = await Conflict.find({ materials: material._id, status: 'pending' }).select('_id reason status');
    res.json({ item: saved, hasConflict: pendingConflicts.length > 0, conflicts: pendingConflicts });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id))
        throw new HttpError(400, 'Некорректный идентификатор материала');
    const material = await Material.findById(req.params.id);
    if (!material)
        throw new HttpError(404, 'Материал не найден');
    if (String(material.author) !== req.user.id && req.user.role !== 'admin')
        throw new HttpError(403, 'Недостаточно прав для удаления материала');
    await Material.findByIdAndDelete(material._id);
    const Conflict = (await import('../models/Conflict.js')).default;
    await Conflict.updateMany({ materials: material._id, status: 'pending' }, { $set: { status: 'resolved', resolvedAt: new Date() } });
    const remaining = await Material.find({ status: 'scheduled', scheduledAt: { $ne: null } }).select('_id');
    for (const item of remaining)
        await syncConflictsForMaterial(String(item._id));
    res.status(204).end();
}));
export default router;
