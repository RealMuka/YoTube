import { Schema, model } from 'mongoose';
const userSchema = new Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'editor', 'user'], default: 'user' }
}, { timestamps: { createdAt: true, updatedAt: false } });
export default model('User', userSchema);
