import mongoose from 'mongoose';
export class HttpError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'HttpError';
    }
}
export const notFound = (req, _res, next) => {
    next(new HttpError(404, `Маршрут ${req.method} ${req.originalUrl} не найден`));
};
export const errorHandler = (error, _req, res, _next) => {
    let statusCode = 500;
    let message = 'Внутренняя ошибка сервера';
    if (error instanceof HttpError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 600) {
        statusCode = error.status;
        message = error instanceof Error ? error.message : 'Ошибка запроса';
    }
    else if (error instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = Object.values(error.errors).map((entry) => entry.message).join('; ');
    }
    else if (error instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = 'Некорректный идентификатор ресурса';
    }
    else if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        statusCode = 409;
        message = 'Запись с такими уникальными данными уже существует';
    }
    else if (error instanceof Error) {
        if (error.name === 'MulterError') {
            const multerCode = 'code' in error ? String(error.code) : '';
            statusCode = multerCode === 'LIMIT_FILE_SIZE' ? 413 : 400;
            message = multerCode === 'LIMIT_FILE_SIZE' ? 'Файл превышает допустимый размер' : error.message;
        }
        else {
            message = error.message;
        }
    }
    if (statusCode >= 500)
        console.error('API error:', error);
    res.status(statusCode).json({ success: false, error: message, ...(process.env.NODE_ENV === 'development' && error instanceof Error ? { details: error.message } : {}) });
};
