import { Router } from 'express';
import { Types } from 'mongoose';
import Conflict from '../models/Conflict.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const status = String(req.query.status ?? 'pending');
  if (status !== 'pending' && status !== 'resolved' && status !== 'all') throw new HttpError(400, 'status должен быть pending, resolved или all');
  const filter: { status?: 'pending' | 'resolved' } = status === 'all' ? {} : { status: status as 'pending' | 'resolved' };
  const items = await Conflict.find(filter).populate({ path: 'materials', populate: { path: 'author', select: 'name email role createdAt' } }).sort({ detectedAt: -1 }).lean({ virtuals: true });
  res.json({ items, count: items.length });
}));

router.patch('/:id/resolve', asyncHandler(async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) throw new HttpError(400, 'Некорректный идентификатор конфликта');
  const conflict = await Conflict.findById(req.params.id);
  if (!conflict) throw new HttpError(404, 'Конфликт не найден');
  conflict.status = 'resolved';
  conflict.resolvedAt = new Date();
  await conflict.save();
  res.json({ item: conflict });
}));

router.patch('/:id/reschedule', asyncHandler(async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) throw new HttpError(400, 'Некорректный идентификатор конфликта');
  const conflict = await Conflict.findById(req.params.id);
  if (!conflict) throw new HttpError(404, 'Конфликт не найден');
  const materialId = String(req.body?.materialId ?? '');
  const scheduledAt = new Date(String(req.body?.scheduledAt ?? ''));
  if (!Types.ObjectId.isValid(materialId) || Number.isNaN(scheduledAt.getTime())) throw new HttpError(400, 'Нужно указать materialId и корректный scheduledAt');
  if (!conflict.materials.some((id) => String(id) === materialId)) throw new HttpError(400, 'Материал не относится к этому конфликту');
  const Material = (await import('../models/Material.js')).default;
  const material = await Material.findById(materialId);
  if (!material) throw new HttpError(404, 'Материал не найден');
  if (String(material.author) !== req.user!.id && req.user!.role !== 'admin') throw new HttpError(403, 'Недостаточно прав для изменения материала');
  material.scheduledAt = scheduledAt;
  material.status = 'scheduled';
  material.uiStatus = 'scheduled';
  await material.save();
  const { syncConflictsForMaterial } = await import('../services/conflictService.js');
  await syncConflictsForMaterial(materialId);
  const updatedConflict = await Conflict.findById(conflict._id).populate({ path: 'materials', populate: { path: 'author', select: 'name email role createdAt' } });
  res.json({ item: updatedConflict });
}));

export default router;
