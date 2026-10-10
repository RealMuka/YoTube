import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Types } from 'mongoose';
import Media from '../models/Media.js';
import Material from '../models/Material.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
const router = Router();
router.use(requireAuth);
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../../../');
const configuredUploadDir = process.env.UPLOAD_DIR || 'server/uploads';
const uploadDirectory = path.isAbsolute(configuredUploadDir) ? configuredUploadDir : path.resolve(projectRoot, configuredUploadDir);
if (!existsSync(uploadDirectory))
    await mkdir(uploadDirectory, { recursive: true });
const allowedMimeTypes = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'application/pdf'
]);
const maxBytes = Math.max(1, Number(process.env.MAX_UPLOAD_SIZE_MB || 20)) * 1024 * 1024;
const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, uploadDirectory),
        filename: (_req, file, callback) => callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase().slice(0, 12)}`)
    }),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype))
            return callback(new HttpError(415, 'Поддерживаются изображения, видео, аудио и PDF'));
        callback(null, true);
    }
});
router.get('/', asyncHandler(async (_req, res) => {
    const media = await Media.find().populate('author', 'name email').sort({ createdAt: -1 }).lean({ virtuals: true });
    const items = await Promise.all(media.map(async (entry) => {
        const usedIn = await Material.find({ media: entry._id }).select('title').lean();
        return { ...entry, usedIn: usedIn.map((item) => item.title) };
    }));
    res.json({ items, count: items.length });
}));
router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file)
        throw new HttpError(400, 'Выберите файл для загрузки');
    const item = await Media.create({
        filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        author: req.user.id
    });
    res.status(201).json({ item: item.toObject() });
}));
router.get('/:id', asyncHandler(async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id))
        throw new HttpError(400, 'Некорректный идентификатор медиа');
    const item = await Media.findById(req.params.id).populate('author', 'name email');
    if (!item)
        throw new HttpError(404, 'Медиафайл не найден');
    res.json({ item });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id))
        throw new HttpError(400, 'Некорректный идентификатор медиа');
    const item = await Media.findById(req.params.id);
    if (!item)
        throw new HttpError(404, 'Медиафайл не найден');
    if (String(item.author) !== req.user.id && req.user.role !== 'admin')
        throw new HttpError(403, 'Недостаточно прав для удаления файла');
    const usageCount = await Material.countDocuments({ media: item._id });
    if (usageCount)
        throw new HttpError(409, 'Нельзя удалить файл, пока он используется в материалах');
    await Media.findByIdAndDelete(item._id);
    const storedPath = path.resolve(uploadDirectory, path.basename(item.url));
    try {
        await unlink(storedPath);
    }
    catch (error) {
        if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT'))
            throw error;
    }
    res.status(204).end();
}));
export default router;
