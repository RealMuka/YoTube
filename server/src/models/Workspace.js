import { Schema, model } from 'mongoose';
const workspaceSchema = new Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, default: 'Владелец' },
    membersCount: { type: Number, default: 1, min: 1 }
}, { timestamps: true });
workspaceSchema.index({ owner: 1, name: 1 }, { unique: true });
export default model('Workspace', workspaceSchema);
