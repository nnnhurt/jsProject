import mongoose, { Schema, Document, Model } from 'mongoose';

export interface DogDocument extends Document {
  name: string;
  breed: string;
  colors: string[];
  imageUrl?: string | null;
  owner: mongoose.Types.ObjectId;
  happinessLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const DogSchema = new Schema<DogDocument>(
  {
    name: { type: String, required: true, trim: true },
    breed: { type: String, required: true, trim: true },
    colors: { type: [String], required: true, default: [], validate: { validator: (arr: unknown) => Array.isArray(arr) && arr.every(v => typeof v === 'string') } },
    imageUrl: { type: String, required: false, default: null },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    happinessLevel: { type: Number, required: true, default: 50, min: 0, max: 100 }
  },
  { timestamps: true }
);

export const Dog: Model<DogDocument> =
  mongoose.models.Dog || mongoose.model<DogDocument>('Dog', DogSchema);


