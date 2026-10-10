import { Schema, model } from 'mongoose';
export const platforms = ['telegram', 'vk', 'instagram', 'youtube', 'website', 'tiktok', 'dzen', 'other'];
export const materialStatuses = ['draft', 'scheduled', 'published'];
export const uiStatuses = ['draft', 'in_review', 'approved', 'scheduled', 'ready', 'published', 'archived'];
const materialSchema = new Schema({
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    platform: { type: String, enum: platforms, required: true, index: true },
    status: { type: String, enum: materialStatuses, default: 'draft', index: true },
    scheduledAt: { type: Date, default: null, index: true },
    media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // UI workflow states map to the canonical API states above.
    uiStatus: { type: String, enum: uiStatuses },
    channelId: { type: String, trim: true, default: '' },
    workspaceId: { type: String, trim: true, default: 'ws-1' },
    category: { type: String, enum: ['social', 'blog', 'email', 'ad', 'video', 'podcast', 'analytics', 'pr'], default: 'social' },
    coverImage: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }]
}, { timestamps: true });
materialSchema.index({ platform: 1, status: 1, scheduledAt: 1 });
export default model('Material', materialSchema);
