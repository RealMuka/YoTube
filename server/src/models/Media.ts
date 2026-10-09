import { Schema, model, type Types, type InferSchemaType } from 'mongoose';

const mediaSchema = new Schema({
  filename: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  mimeType: { type: String, required: true, trim: true },
  size: { type: Number, required: true, min: 0 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export type MediaDocument = InferSchemaType<typeof mediaSchema> & { _id: Types.ObjectId };
export default model('Media', mediaSchema);
