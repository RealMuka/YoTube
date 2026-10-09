import { Types } from 'mongoose';
import Conflict from '../models/Conflict.js';
import Material from '../models/Material.js';

const CONFLICT_WINDOW_MS = 30 * 60 * 1000;

function makeConflictKey(materialIds: Array<string | Types.ObjectId>): string {
  return materialIds.map(String).sort().join(':');
}

function isScheduled(material: { status?: string; scheduledAt?: Date | null }): boolean {
  return material.status === 'scheduled' && material.scheduledAt instanceof Date && !Number.isNaN(material.scheduledAt.getTime());
}

function scheduleSignature(a: { _id: unknown; scheduledAt?: Date | null }, b: { _id: unknown; scheduledAt?: Date | null }): string {
  return [ `${String(a._id)}@${a.scheduledAt?.getTime() ?? ''}`, `${String(b._id)}@${b.scheduledAt?.getTime() ?? ''}` ].sort().join('|');
}

function overlap(a: { platform?: string; status?: string; scheduledAt?: Date | null }, b: { platform?: string; status?: string; scheduledAt?: Date | null }): boolean {
  return Boolean(
    isScheduled(a) && isScheduled(b) && a.platform === b.platform &&
    Math.abs(a.scheduledAt!.getTime() - b.scheduledAt!.getTime()) <= CONFLICT_WINDOW_MS
  );
}

export async function syncConflictsForMaterial(materialId: string): Promise<void> {
  const current = await Material.findById(materialId);
  const oldPending = await Conflict.find({ materials: new Types.ObjectId(materialId), status: 'pending' });

  for (const conflict of oldPending) {
    const linked = await Material.find({ _id: { $in: conflict.materials } });
    const stillConflicting = linked.length >= 2 && linked.some((item) => String(item._id) === materialId) &&
      linked.some((item) => String(item._id) !== materialId && current && overlap(current, item));
    if (!stillConflicting) {
      conflict.status = 'resolved';
      conflict.resolvedAt = new Date();
      await conflict.save();
    }
  }

  if (!current || !isScheduled(current)) return;
  const scheduledAt = current.scheduledAt!;
  const neighbors = await Material.find({
    _id: { $ne: current._id },
    platform: current.platform,
    status: 'scheduled',
    scheduledAt: { $gte: new Date(scheduledAt.getTime() - CONFLICT_WINDOW_MS), $lte: new Date(scheduledAt.getTime() + CONFLICT_WINDOW_MS) }
  }).select('_id title platform scheduledAt status');

  for (const neighbor of neighbors) {
    const ids = [String(current._id), String(neighbor._id)];
    const conflictKey = makeConflictKey(ids);
    const signature = scheduleSignature(current, neighbor);
    const reason = `Публикации «${current.title}» и «${neighbor.title}» на платформе ${current.platform} запланированы в пределах 30 минут друг от друга.`;
    const existing = await Conflict.findOne({ conflictKey, status: 'pending' });
    if (existing) {
      existing.reason = reason;
      existing.scheduleSignature = signature;
      await existing.save();
    } else {
      const previouslyResolved = await Conflict.findOne({ conflictKey, status: 'resolved', scheduleSignature: signature });
      if (previouslyResolved) continue;
      await Conflict.create({ materials: ids, reason, status: 'pending', detectedAt: new Date(), conflictKey, scheduleSignature: signature });
    }
  }
}

