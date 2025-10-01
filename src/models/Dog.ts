import mongoose, { Schema, Document, Model } from 'mongoose';

export interface DogDocument extends Document {
  name: string;
  breed: string;
  happinessLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const DogSchema = new Schema<DogDocument>(
  {
    name: { type: String, required: true, trim: true },
    breed: { type: String, required: true, trim: true },
    happinessLevel: { type: Number, required: true, default: 50, min: 0, max: 100 }
  },
  { timestamps: true }
);

export const Dog: Model<DogDocument> =
  mongoose.models.Dog || mongoose.model<DogDocument>('Dog', DogSchema);


