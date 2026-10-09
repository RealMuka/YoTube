import { Schema, model, type Types, type InferSchemaType } from 'mongoose';

const conflictSchema = new Schema({
  materials: [{ type: Schema.Types.ObjectId, ref: 'Material', required: true }],
  reason: { type: String, required: true, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending', index: true },
  detectedAt: { type: Date, default: Date.now, required: true },
  resolvedAt: { type: Date, default: null },
  conflictKey: { type: String, required: true, index: true },
  scheduleSignature: { type: String, required: true }
}, { timestamps: true });

conflictSchema.index({ conflictKey: 1, status: 1 });
export type ConflictDocument = InferSchemaType<typeof conflictSchema> & { _id: Types.ObjectId };
export default model('Conflict', conflictSchema);
