export const asyncHandler = (handler) => (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
};
