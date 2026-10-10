import { Router } from 'express';
import { Types } from 'mongoose';
import Workspace from '../models/Workspace.js';
import Material from '../models/Material.js';
import Conflict from '../models/Conflict.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
const router = Router();
router.use(requireAuth);
function present(workspace) {
    return {
        id: String(workspace._id),
        name: workspace.name,
        role: workspace.role || 'Владелец',
        membersCount: workspace.membersCount || 1,
        createdAt: workspace.createdAt
    };
}
async function ensureDefaultWorkspace(userId) {
    let workspaces = await Workspace.find({ owner: userId }).sort({ createdAt: 1 });
    if (workspaces.length > 0)
        return workspaces;
    const workspace = await Workspace.create({ name: 'Default', owner: userId, role: 'Владелец', membersCount: 1 });
    // A user without persisted spaces gets one Default workspace. Existing legacy
    // materials are moved into it; a fresh account receives one illustrative event.
    const existingMaterials = await Material.find({ author: userId }).select('_id');
    if (existingMaterials.length) {
        await Material.updateMany({ author: userId }, { $set: { workspaceId: String(workspace._id) } });
    }
    else {
        const sampleDate = new Date();
        sampleDate.setDate(sampleDate.getDate() + 1);
        sampleDate.setHours(10, 0, 0, 0);
        await Material.create({
            title: 'Пример публикации',
            description: 'Это пример события в календаре. Измените заголовок, описание, дату и время под свою задачу.',
            platform: 'telegram',
            status: 'draft',
            uiStatus: 'draft',
            scheduledAt: sampleDate,
            media: [],
            author: userId,
            category: 'social',
            channelId: 'ch-tg',
            workspaceId: String(workspace._id),
            coverImage: '',
            tags: []
        });
    }
    return [workspace];
}
router.get('/', asyncHandler(async (req, res) => {
    const workspaces = await ensureDefaultWorkspace(req.user.id);
    res.json({ items: workspaces.map(present), count: workspaces.length });
}));
router.post('/', asyncHandler(async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    if (name.length < 2)
        throw new HttpError(400, 'Название пространства должно содержать минимум 2 символа');
    if (name.length > 80)
        throw new HttpError(400, 'Название пространства не должно превышать 80 символов');
    const duplicate = await Workspace.exists({ owner: req.user.id, name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
    if (duplicate)
        throw new HttpError(409, 'Пространство с таким названием уже существует');
    const workspace = await Workspace.create({ name, owner: req.user.id, role: 'Владелец', membersCount: 1 });
    res.status(201).json({ item: present(workspace) });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id))
        throw new HttpError(400, 'Некорректный идентификатор пространства');
    const workspaces = await Workspace.find({ owner: req.user.id }).sort({ createdAt: 1 });
    if (workspaces.length <= 1)
        throw new HttpError(400, 'Нельзя удалить последнее пространство. Сначала создайте другое.');
    const workspace = workspaces.find((entry) => String(entry._id) === req.params.id);
    if (!workspace)
        throw new HttpError(404, 'Пространство не найдено');
    const materials = await Material.find({ author: req.user.id, workspaceId: String(workspace._id) }).select('_id');
    const materialIds = materials.map((item) => item._id);
    if (materialIds.length) {
        await Conflict.deleteMany({ materials: { $in: materialIds } });
        await Material.deleteMany({ _id: { $in: materialIds } });
    }
    await Workspace.deleteOne({ _id: workspace._id, owner: req.user.id });
    res.json({ deletedId: String(workspace._id), deletedMaterials: materialIds.length });
}));
export default router;
